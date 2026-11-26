import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.resolve(__dirname, "../../uploads/chat-attachments");
const ATTACHMENT_MARKER_REGEX = /\n?<!--ZALISK_ATTACHMENTS:([\s\S]*?)-->\s*$/;

const MAX_FILES_PER_MESSAGE = 5;
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 Mo par fichier
const MAX_TOTAL_SIZE_BYTES = 7 * 1024 * 1024; // 7 Mo décodés max par requête

const ALLOWED_MIME_TYPES = new Map([
  ["image/png", { ext: ".png", isImage: true }],
  ["image/jpeg", { ext: ".jpg", isImage: true }],
  ["image/jpg", { ext: ".jpg", isImage: true }],
  ["image/webp", { ext: ".webp", isImage: true }],
  ["image/gif", { ext: ".gif", isImage: true }],
  ["application/pdf", { ext: ".pdf", isImage: false }],
  ["text/plain", { ext: ".txt", isImage: false }],
  ["application/msword", { ext: ".doc", isImage: false }],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    { ext: ".docx", isImage: false },
  ],
  ["application/vnd.ms-excel", { ext: ".xls", isImage: false }],
  [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    { ext: ".xlsx", isImage: false },
  ],
]);

function sanitizeSegment(raw) {
  return String(raw || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

function sanitizeDisplayFileName(rawName, fallbackExt = "") {
  const base = path.basename(String(rawName || "fichier")).trim();
  const cleaned = base.replace(/[^\w.\-()\s]/g, "_").replace(/\s+/g, " ").slice(0, 120);
  if (!cleaned) return `fichier${fallbackExt}`;
  return cleaned;
}

/**
 * Valide et sauvegarde sur disque un tableau de pièces jointes encodées en Base64 / Data URL.
 * @param {string} conversationId
 * @param {Array<{ name?: string, type?: string, dataBase64?: string }>} rawAttachments
 */
export async function savePublicChatAttachments(conversationId, rawAttachments) {
  if (!Array.isArray(rawAttachments) || rawAttachments.length === 0) {
    return [];
  }

  if (rawAttachments.length > MAX_FILES_PER_MESSAGE) {
    const err = new Error(`Maximum ${MAX_FILES_PER_MESSAGE} pièces jointes autorisées par message.`);
    err.status = 400;
    throw err;
  }

  const safeConvId = sanitizeSegment(conversationId);
  if (!safeConvId) {
    const err = new Error("Identifiant de conversation invalide pour les pièces jointes.");
    err.status = 400;
    throw err;
  }

  const convDir = path.resolve(UPLOAD_ROOT, safeConvId);
  await fs.mkdir(convDir, { recursive: true });

  const saved = [];
  let totalBytes = 0;

  for (const item of rawAttachments) {
    if (!item || typeof item !== "object") continue;

    let mimeType = String(item.type || "").toLowerCase().trim();
    let base64Body = String(item.dataBase64 || "").trim();

    // Supporter le format Data URL (data:image/png;base64,...)
    const dataUrlMatch = base64Body.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (dataUrlMatch) {
      if (!mimeType) mimeType = dataUrlMatch[1].toLowerCase().trim();
      base64Body = dataUrlMatch[2];
    }

    const mimeMeta = ALLOWED_MIME_TYPES.get(mimeType);
    if (!mimeMeta) {
      const err = new Error(
        `Format de fichier non autorisé (${mimeType || "inconnu"}). Formats acceptés : PNG, JPG, WEBP, GIF, PDF, DOC/DOCX, XLS/XLSX, TXT.`
      );
      err.status = 400;
      throw err;
    }

    if (!base64Body) {
      const err = new Error("Le contenu du fichier est vide.");
      err.status = 400;
      throw err;
    }

    const buffer = Buffer.from(base64Body, "base64");
    if (buffer.length === 0) {
      const err = new Error("Impossible de décoder la pièce jointe.");
      err.status = 400;
      throw err;
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      const err = new Error("Chaque fichier ne doit pas dépasser 4 Mo.");
      err.status = 400;
      throw err;
    }

    totalBytes += buffer.length;
    if (totalBytes > MAX_TOTAL_SIZE_BYTES) {
      const err = new Error("La taille totale des pièces jointes ne doit pas dépasser 7 Mo.");
      err.status = 400;
      throw err;
    }

    const id = crypto.randomBytes(8).toString("hex");
    const displayName = sanitizeDisplayFileName(item.name, mimeMeta.ext);
    const storedFileName = `${id}${mimeMeta.ext}`;
    const targetPath = path.resolve(convDir, storedFileName);

    // Garde contre la traversée de répertoire
    if (!targetPath.startsWith(convDir + path.sep)) {
      const err = new Error("Chemin de fichier non autorisé.");
      err.status = 400;
      throw err;
    }

    await fs.writeFile(targetPath, buffer);

    saved.push({
      id,
      name: displayName,
      size: buffer.length,
      type: mimeType,
      isImage: mimeMeta.isImage,
      fileName: storedFileName,
    });
  }

  return saved;
}

/**
 * Encode le texte du message et les métadonnées des pièces jointes sans altérer le schéma SQL.
 */
export function encodeMessageWithAttachments(text, attachments = []) {
  const cleanText = String(text || "").trim();
  if (!attachments || attachments.length === 0) {
    return cleanText;
  }
  const marker = `<!--ZALISK_ATTACHMENTS:${JSON.stringify(attachments)}-->`;
  return cleanText ? `${cleanText}\n${marker}` : marker;
}

/**
 * Extrait le texte lisible et les pièces jointes structurées avec leurs URLs d'accès.
 */
export function parseMessageWithAttachments(rawContent, buildUrl) {
  const raw = String(rawContent || "");
  const match = raw.match(ATTACHMENT_MARKER_REGEX);
  if (!match) {
    return { content: raw, attachments: [] };
  }

  const cleanText = raw.slice(0, match.index).trim();
  let parsed = [];
  try {
    const json = JSON.parse(match[1]);
    if (Array.isArray(json)) {
      parsed = json.map((att) => ({
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type,
        isImage: Boolean(att.isImage),
        fileName: att.fileName,
        url: typeof buildUrl === "function" ? buildUrl(att.fileName) : undefined,
      }));
    }
  } catch {
    return { content: raw, attachments: [] };
  }

  return { content: cleanText, attachments: parsed };
}

/**
 * Résout de façon sécurisée le chemin physique d'une pièce jointe et son type MIME.
 */
export async function resolveChatAttachmentFile(conversationId, fileName) {
  const safeConvId = sanitizeSegment(conversationId);
  const safeFile = path.basename(String(fileName || ""));
  if (!safeConvId || !safeFile || !/^[a-f0-9]+\.[a-z0-9]+$/i.test(safeFile)) {
    return null;
  }

  const convDir = path.resolve(UPLOAD_ROOT, safeConvId);
  const fullPath = path.resolve(convDir, safeFile);
  if (!fullPath.startsWith(convDir + path.sep)) {
    return null;
  }

  try {
    await fs.access(fullPath);
  } catch {
    return null;
  }

  const ext = path.extname(safeFile).toLowerCase();
  let mimeType = "application/octet-stream";
  let isImage = false;
  for (const [mime, meta] of ALLOWED_MIME_TYPES.entries()) {
    if (meta.ext === ext) {
      mimeType = mime;
      isImage = meta.isImage;
      break;
    }
  }

  return { fullPath, mimeType, isImage, fileName: safeFile };
}
