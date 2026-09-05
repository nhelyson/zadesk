import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { SESSION_DURATION_MS, COOKIE_NAME } from "../config/constants.js";
import { env } from "../config/env.js";

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a new session in database
 * @param {string} userId 
 * @returns {Promise<{ sessionToken: string, expiresAt: Date }>}
 */
export async function createSession(userId) {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
    },
  });

  return { sessionToken, expiresAt };
}

/**
 * Validate a session token and return user if active
 * @param {string} sessionToken 
 * @returns {Promise<Object|null>}
 */
export async function validateSession(sessionToken) {
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: {
          memberships: {
            include: {
              workspace: true,
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  // Check if session has expired
  if (session.expiresAt.getTime() < Date.now()) {
    // Delete expired session asynchronously
    prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

/**
 * Revoke/delete a session by token
 * @param {string} sessionToken 
 */
export async function revokeSession(sessionToken) {
  if (!sessionToken) return;

  try {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });
  } catch (err) {
    // Ignore error if session was already deleted
  }
}

/**
 * Determine if cookie should have secure flag
 */
function isSecureCookie() {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  // If running over plain HTTP (local, docker, or staging IP), do not set secure flag so browser accepts cookie
  if (env.FRONTEND_URL.startsWith("http://")) {
    return false;
  }
  return env.IS_PROD;
}

/**
 * Set session cookie on Express response
 */
export function setSessionCookie(res, sessionToken, expiresAt) {
  const secure = isSecureCookie();
  res.cookie(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    expires: expiresAt || new Date(Date.now() + SESSION_DURATION_MS),
    path: "/",
  });
}

/**
 * Clear session cookie on Express response
 */
export function clearSessionCookie(res) {
  const secure = isSecureCookie();
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  });
}
