-- CreateTable
CREATE TABLE "consumed_financial_proofs" (
    "id" TEXT NOT NULL,
    "proofId" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'SASPAY',
    "providerTransactionId" TEXT NOT NULL,
    "amountXaf" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "source" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedBy" TEXT,

    CONSTRAINT "consumed_financial_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consumed_financial_proofs_proofId_key" ON "consumed_financial_proofs"("proofId");

-- CreateIndex
CREATE INDEX "consumed_financial_proofs_workspaceId_intentId_idx" ON "consumed_financial_proofs"("workspaceId", "intentId");

-- CreateIndex
CREATE INDEX "consumed_financial_proofs_expiresAt_idx" ON "consumed_financial_proofs"("expiresAt");

