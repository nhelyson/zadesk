import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import {
  savePublicChatAttachments,
  encodeMessageWithAttachments,
  parseMessageWithAttachments,
  resolveChatAttachmentFile,
} from "../backend/src/utils/chatAttachments.js";

const testConvId = "testconv_attachments_01";
const samplePngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

try {
  // 1. Save real PNG
  const saved = await savePublicChatAttachments(testConvId, [
    { name: "preuve_ticket.png", type: "image/png", dataBase64: samplePngBase64 },
  ]);
  assert.strictEqual(saved.length, 1);
  assert.strictEqual(saved[0].isImage, true);
  assert.ok(saved[0].fileName.endsWith(".png"));

  // 2. Encode & Parse
  const encoded = encodeMessageWithAttachments("Voici ma facture", saved);
  const parsed = parseMessageWithAttachments(encoded, (fn) => `/api/test/${fn}`);
  assert.strictEqual(parsed.content, "Voici ma facture");
  assert.strictEqual(parsed.attachments.length, 1);
  assert.strictEqual(parsed.attachments[0].url, `/api/test/${saved[0].fileName}`);

  // 3. Resolve safe file
  const resolved = await resolveChatAttachmentFile(testConvId, saved[0].fileName);
  assert.ok(resolved !== null);
  assert.strictEqual(resolved.mimeType, "image/png");
  assert.strictEqual(resolved.isImage, true);

  // 4. Reject path traversal
  const badResolved = await resolveChatAttachmentFile(testConvId, "../../package.json");
  assert.strictEqual(badResolved, null);

  // 5. Reject dangerous SVG/HTML MIME
  let rejectedSvg = false;
  try {
    await savePublicChatAttachments(testConvId, [
      { name: "xss.svg", type: "image/svg+xml", dataBase64: Buffer.from("<svg/>").toString("base64") },
    ]);
  } catch {
    rejectedSvg = true;
  }
  assert.strictEqual(rejectedSvg, true);

  console.log("ALL CHAT ATTACHMENT TESTS PASSED!");
} finally {
  // Cleanup temporary test directory
  await fs.rm(path.resolve(process.cwd(), "backend", "uploads", "chat-attachments", testConvId), {
    recursive: true,
    force: true,
  });
}
