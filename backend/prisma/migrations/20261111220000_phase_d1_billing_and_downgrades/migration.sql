-- Phase D.1 : Additive migration for reversible membership suspension and commercial downgrade requests

-- 1. CreateEnum MembershipStatus
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- 2. AlterTable memberships
ALTER TABLE "memberships" ADD COLUMN "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "memberships" ADD COLUMN "suspendedAt" TIMESTAMP(3);
ALTER TABLE "memberships" ADD COLUMN "suspendedReason" TEXT;
ALTER TABLE "memberships" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. CreateIndex for active memberships by workspace
CREATE INDEX "memberships_workspaceId_status_idx" ON "memberships"("workspaceId", "status");

-- 4. CreateEnum DowngradeRequestStatus
CREATE TYPE "DowngradeRequestStatus" AS ENUM (
    'DRAFT',
    'READY',
    'BLOCKED',
    'SCHEDULED',
    'APPLIED',
    'CANCELLED',
    'OBSOLETE_CANCELLED'
);

-- 5. CreateTable commercial_downgrade_requests
CREATE TABLE "commercial_downgrade_requests" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "currentPlanId" TEXT NOT NULL,
    "targetPlanId" TEXT NOT NULL,
    "status" "DowngradeRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedReason" TEXT,
    "retainedMemberIds" JSONB NOT NULL DEFAULT '[]',
    "retainedEstablishmentIds" JSONB NOT NULL DEFAULT '[]',
    "revokedInvitationIds" JSONB NOT NULL DEFAULT '[]',
    "cancelledAt" TIMESTAMP(3),
    "cancelledByUserId" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_downgrade_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "commercial_downgrade_requests_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "commercial_downgrade_requests_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "commercial_downgrade_requests_cancelledByUserId_fkey" FOREIGN KEY ("cancelledByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "commercial_downgrade_requests_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 6. Indices for commercial_downgrade_requests
CREATE INDEX "commercial_downgrade_requests_workspaceId_status_idx" ON "commercial_downgrade_requests"("workspaceId", "status");
CREATE INDEX "commercial_downgrade_requests_effectiveDate_status_idx" ON "commercial_downgrade_requests"("effectiveDate", "status");

-- 7. Partial Unique Constraint: STRICTLY ONE ACTIVE SCHEDULED DOWNGRADE PER WORKSPACE
CREATE UNIQUE INDEX "idx_unique_active_scheduled_downgrade" 
ON "commercial_downgrade_requests" ("workspaceId") 
WHERE "status" = 'SCHEDULED';

-- 8. Index for worker querying due scheduled downgrades
CREATE INDEX "idx_downgrades_due_for_processing" 
ON "commercial_downgrade_requests" ("effectiveDate", "status") 
WHERE "status" = 'SCHEDULED';

