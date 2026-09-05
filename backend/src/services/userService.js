import { prisma } from "../lib/prisma.js";

/**
 * Find user by email (case-insensitive normalized)
 * @param {string} email 
 */
export async function findUserByEmail(email) {
  if (!email) return null;
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });
}

/**
 * Find user by Google Sub ID
 * @param {string} googleId 
 */
export async function findUserByGoogleId(googleId) {
  if (!googleId) return null;
  return prisma.user.findUnique({
    where: { googleId },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });
}

/**
 * Find user by internal ID
 * @param {string} id 
 */
export async function findUserById(id) {
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });
}

/**
 * Create a new user
 */
export async function createUser({
  firstName,
  lastName,
  email,
  passwordHash = null,
  googleId = null,
  avatarUrl = null,
  emailVerified = false,
}) {
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      passwordHash,
      googleId,
      avatarUrl,
      emailVerified,
    },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });
}

/**
 * Link Google account to existing user
 */
export async function linkGoogleAccount(userId, { googleId, avatarUrl, emailVerified = true }) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      googleId,
      emailVerified: true,
      ...(avatarUrl ? { avatarUrl } : {}),
    },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });
}/**
 * Update user details
 */
export async function updateUser(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });
}
