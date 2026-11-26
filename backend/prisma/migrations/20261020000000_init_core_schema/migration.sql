-- Baseline Migration: Initial Core Schema (Phase D.1.6 - Perfect Parity)
-- Represents the core operational schema of Zadesk prior to additive migrations.
-- Exactly matches definitions from schema.prisma and production database zadesk-postgres.

-- 1. Create Core ENUM Types
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'AGENT');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TicketStatus" AS ENUM ('PENDING_ASSIGNMENT', 'OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED');
CREATE TYPE "ShareAccessLevel" AS ENUM ('READ_ONLY', 'CONTRIBUTE');
CREATE TYPE "ConversationStatus" AS ENUM ('WAITING_ASSIGNMENT', 'ACTIVE', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED');
CREATE TYPE "MessageType" AS ENUM ('CUSTOMER', 'AGENT_REPLY', 'INTERNAL_NOTE', 'SYSTEM');
CREATE TYPE "AgentAvailability" AS ENUM ('AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE');
CREATE TYPE "EstablishmentType" AS ENUM ('HEADQUARTERS', 'BRANCH', 'POINT_OF_SALE', 'STORE', 'SERVICE_POINT', 'PICKUP_POINT', 'TECH_CENTER', 'OTHER');
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'EMAIL_VERIFICATION');

-- 2. Core Identity & Authentication Tables
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "googleId" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_sessionToken_idx" ON "sessions"("sessionToken");

CREATE TABLE "otp_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL DEFAULT 'LOGIN',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_tokens_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "otp_tokens_userId_idx" ON "otp_tokens"("userId");
CREATE INDEX "otp_tokens_userId_purpose_idx" ON "otp_tokens"("userId", "purpose");

CREATE TABLE "pending_registrations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_registrations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pending_registrations_email_key" ON "pending_registrations"("email");
CREATE INDEX "pending_registrations_email_idx" ON "pending_registrations"("email");
CREATE INDEX "pending_registrations_expiresAt_idx" ON "pending_registrations"("expiresAt");

CREATE TABLE "onboarding_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_drafts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "onboarding_drafts_userId_key" ON "onboarding_drafts"("userId");
CREATE INDEX "onboarding_drafts_userId_idx" ON "onboarding_drafts"("userId");

-- 3. Workspace Core & Establishment Tables
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "normalizedName" TEXT,
    "description" TEXT,
    "category" TEXT DEFAULT 'Autre',
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "website" TEXT,
    "supportPhone" TEXT,
    "supportEmail" TEXT,
    "supportWhatsApp" TEXT,
    "address" TEXT,
    "city" TEXT DEFAULT 'Brazzaville',
    "country" TEXT DEFAULT 'Congo',
    "openingHours" TEXT,
    "supportCategories" JSONB,
    "hasExistingSav" BOOLEAN NOT NULL DEFAULT false,
    "brandColor" TEXT,
    "brandPalette" JSONB,
    "cannedResponses" JSONB,
    "businessHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");
CREATE INDEX "workspaces_normalizedName_idx" ON "workspaces"("normalizedName");
CREATE UNIQUE INDEX "workspaces_normalizedName_country_key" ON "workspaces"("normalizedName", "country");

CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "memberships_userId_workspaceId_key" ON "memberships"("userId", "workspaceId");
CREATE INDEX "memberships_userId_idx" ON "memberships"("userId");
CREATE INDEX "memberships_workspaceId_idx" ON "memberships"("workspaceId");

CREATE TABLE "workspace_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "token" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "workspace_invitations_token_key" ON "workspace_invitations"("token");
CREATE INDEX "workspace_invitations_email_idx" ON "workspace_invitations"("email");
CREATE INDEX "workspace_invitations_workspaceId_idx" ON "workspace_invitations"("workspaceId");
CREATE INDEX "workspace_invitations_token_idx" ON "workspace_invitations"("token");

CREATE TABLE "establishments" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EstablishmentType" NOT NULL DEFAULT 'BRANCH',
    "description" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Brazzaville',
    "country" TEXT NOT NULL DEFAULT 'Congo',
    "addressDetails" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "openingHours" TEXT,
    "businessHours" JSONB,
    "services" JSONB,
    "practicalInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "galleryImages" JSONB,
    "imageUrl" TEXT,

    CONSTRAINT "establishments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "establishments_workspaceId_idx" ON "establishments"("workspaceId");
CREATE INDEX "establishments_workspaceId_isPublic_idx" ON "establishments"("workspaceId", "isPublic");
CREATE INDEX "establishments_workspaceId_isActive_idx" ON "establishments"("workspaceId", "isActive");

-- 4. Messaging, Conversations & Tickets
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'PORTAL',
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "publicTokenHash" TEXT,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "conversations_workspaceId_idx" ON "conversations"("workspaceId");
CREATE INDEX "conversations_workspaceId_status_idx" ON "conversations"("workspaceId", "status");
CREATE INDEX "conversations_workspaceId_assignedAgentId_idx" ON "conversations"("workspaceId", "assignedAgentId");

CREATE TABLE "conversation_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderType" "MessageType" NOT NULL DEFAULT 'CUSTOMER',
    "senderName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternalNote" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "conversation_messages_conversationId_idx" ON "conversation_messages"("conversationId");
CREATE INDEX "conversation_messages_conversationId_isInternalNote_idx" ON "conversation_messages"("conversationId", "isInternalNote");

CREATE TABLE "conversation_shares" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "accessLevel" "ShareAccessLevel" NOT NULL DEFAULT 'READ_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_shares_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "conversation_shares_conversationId_agentId_key" ON "conversation_shares"("conversationId", "agentId");
CREATE INDEX "conversation_shares_agentId_idx" ON "conversation_shares"("agentId");

CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "slaDueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "conversationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "tickets_workspaceId_reference_key" ON "tickets"("workspaceId", "reference");
CREATE INDEX "tickets_workspaceId_idx" ON "tickets"("workspaceId");
CREATE INDEX "tickets_workspaceId_status_idx" ON "tickets"("workspaceId", "status");
CREATE INDEX "tickets_workspaceId_priority_idx" ON "tickets"("workspaceId", "priority");
CREATE INDEX "tickets_workspaceId_assignedAgentId_idx" ON "tickets"("workspaceId", "assignedAgentId");

CREATE TABLE "ticket_assignments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "previousAgentId" TEXT,
    "newAgentId" TEXT,
    "assignedById" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_assignments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ticket_assignments_ticketId_idx" ON "ticket_assignments"("ticketId");

CREATE TABLE "ticket_shares" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "accessLevel" "ShareAccessLevel" NOT NULL DEFAULT 'READ_ONLY',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_shares_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ticket_shares_ticketId_agentId_key" ON "ticket_shares"("ticketId", "agentId");
CREATE INDEX "ticket_shares_ticketId_idx" ON "ticket_shares"("ticketId");
CREATE INDEX "ticket_shares_agentId_idx" ON "ticket_shares"("agentId");

CREATE TABLE "ticket_activities" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_activities_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ticket_activities_ticketId_idx" ON "ticket_activities"("ticketId");

-- 5. Agents, Skills & WhatsApp Integration
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "skills_workspaceId_name_key" ON "skills"("workspaceId", "name");
CREATE INDEX "skills_workspaceId_idx" ON "skills"("workspaceId");

CREATE TABLE "agent_profiles" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "availability" "AgentAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "maxCapacity" INTEGER NOT NULL DEFAULT 10,
    "autoAssignmentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT DEFAULT 'Agent SAV',
    "phone" TEXT,
    "notificationEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificationApp" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "agent_profiles_workspaceId_userId_key" ON "agent_profiles"("workspaceId", "userId");
CREATE INDEX "agent_profiles_workspaceId_idx" ON "agent_profiles"("workspaceId");
CREATE INDEX "agent_profiles_userId_idx" ON "agent_profiles"("userId");
CREATE INDEX "agent_profiles_workspaceId_availability_idx" ON "agent_profiles"("workspaceId", "availability");

CREATE TABLE "agent_skills" (
    "id" TEXT NOT NULL,
    "agentProfileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "validatedById" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_skills_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "agent_skills_agentProfileId_skillId_key" ON "agent_skills"("agentProfileId", "skillId");
CREATE INDEX "agent_skills_skillId_idx" ON "agent_skills"("skillId");

CREATE TABLE "whatsapp_connections" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "wabaId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "displayPhoneNumber" TEXT NOT NULL,
    "verifiedName" TEXT,
    "accessToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_connections_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "whatsapp_connections_workspaceId_key" ON "whatsapp_connections"("workspaceId");
CREATE INDEX "whatsapp_connections_workspaceId_idx" ON "whatsapp_connections"("workspaceId");
CREATE INDEX "whatsapp_connections_phoneNumberId_idx" ON "whatsapp_connections"("phoneNumberId");

-- 6. Audit Trail
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_workspaceId_idx" ON "audit_logs"("workspaceId");
CREATE INDEX "audit_logs_workspaceId_entityType_entityId_idx" ON "audit_logs"("workspaceId", "entityType", "entityId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- 7. Add Foreign Key Constraints
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "otp_tokens" ADD CONSTRAINT "otp_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "onboarding_drafts" ADD CONSTRAINT "onboarding_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "establishments" ADD CONSTRAINT "establishments_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversation_shares" ADD CONSTRAINT "conversation_shares_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_shares" ADD CONSTRAINT "conversation_shares_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_shares" ADD CONSTRAINT "conversation_shares_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ticket_assignments" ADD CONSTRAINT "ticket_assignments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_assignments" ADD CONSTRAINT "ticket_assignments_previousAgentId_fkey" FOREIGN KEY ("previousAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ticket_assignments" ADD CONSTRAINT "ticket_assignments_newAgentId_fkey" FOREIGN KEY ("newAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ticket_assignments" ADD CONSTRAINT "ticket_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ticket_shares" ADD CONSTRAINT "ticket_shares_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_shares" ADD CONSTRAINT "ticket_shares_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_shares" ADD CONSTRAINT "ticket_shares_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_activities" ADD CONSTRAINT "ticket_activities_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_activities" ADD CONSTRAINT "ticket_activities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "skills" ADD CONSTRAINT "skills_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_skills" ADD CONSTRAINT "agent_skills_agentProfileId_fkey" FOREIGN KEY ("agentProfileId") REFERENCES "agent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_skills" ADD CONSTRAINT "agent_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_connections" ADD CONSTRAINT "whatsapp_connections_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
