-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED');

-- AlterTable
ALTER TABLE "workspace_invitations" ADD COLUMN     "dispatchAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dispatchError" TEXT,
ADD COLUMN     "dispatchLockedBy" TEXT,
ADD COLUMN     "dispatchStartedAt" TIMESTAMP(3),
ADD COLUMN     "dispatchStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "nextRetryAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "jobId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "lastError" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_events_status_createdAt_idx" ON "outbox_events"("status", "createdAt");

-- CreateIndex
CREATE INDEX "outbox_events_workspaceId_status_idx" ON "outbox_events"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "outbox_events_lockedBy_idx" ON "outbox_events"("lockedBy");

-- CreateIndex
CREATE INDEX "workspace_invitations_workspaceId_dispatchStatus_idx" ON "workspace_invitations"("workspaceId", "dispatchStatus");

-- AddForeignKey
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

