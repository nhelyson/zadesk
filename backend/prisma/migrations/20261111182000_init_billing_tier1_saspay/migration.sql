-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('DECOUVERTE', 'STARTER', 'PRO', 'ENTREPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'RENEWAL_DUE', 'GRACE_PERIOD', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IntentType" AS ENUM ('INITIAL_PURCHASE', 'RENEWAL', 'UPGRADE', 'DOWNGRADE');

-- CreateEnum
CREATE TYPE "IntentStatus" AS ENUM ('PENDING', 'COMPLETED', 'ABANDONED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('INITIATED', 'CHECKOUT_CREATED', 'PAYMENT_PENDING', 'RESULT_UNKNOWN', 'RECONCILIATION_REQUIRED', 'PAYMENT_CONFIRMED', 'CONFIRMED_FAILURE', 'SESSION_EXPIRED');

-- CreateEnum
CREATE TYPE "ReceiptValidationStatus" AS ENUM ('VALID', 'INVALID_AMOUNT', 'INVALID_CURRENCY', 'INVALID_PAID_AT', 'MALFORMED_DATA');

-- CreateEnum
CREATE TYPE "ReceiptReconciliationStatus" AS ENUM ('PENDING_MATCHING', 'MATCHED_AND_APPLIED', 'DUPLICATE_PAYMENT', 'AMOUNT_MISMATCH', 'UNMATCHED_METADATA', 'EXPIRED_INTENT_PAID', 'ABANDONED_INTENT_PAID', 'CONFLICTING_ATTEMPT_STATUS', 'INVESTIGATION_REQUIRED', 'MANUALLY_RESOLVED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TransactionApplicationStatus" AS ENUM ('APPLIED_TO_SUBSCRIPTION', 'DUPLICATE_PAYMENT_RECORDED', 'MANUAL_ADJUSTMENT', 'REFUNDED');

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "plan" "PlanType" NOT NULL DEFAULT 'DECOUVERTE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "activePriceXaf" INTEGER NOT NULL DEFAULT 0,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "gracePeriodEnd" TIMESTAMP(3),
    "billingAnchorDay" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "lastNoticeSentAt" TIMESTAMP(3),
    "noticeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_intents" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intentType" "IntentType" NOT NULL DEFAULT 'INITIAL_PURCHASE',
    "targetPlan" "PlanType" NOT NULL,
    "priceXaf" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "status" "IntentStatus" NOT NULL DEFAULT 'PENDING',
    "clientMutationKey" TEXT NOT NULL,
    "expectedSubscriptionVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "provider" TEXT NOT NULL DEFAULT 'SASPAY',
    "providerSessionId" TEXT,
    "checkoutUrl" TEXT,
    "status" "AttemptStatus" NOT NULL DEFAULT 'INITIATED',
    "localAttemptKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_payment_receipts" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'SASPAY',
    "providerTransactionId" TEXT NOT NULL,
    "providerReference" TEXT,
    "amountRaw" TEXT,
    "currencyRaw" TEXT,
    "paidAtRaw" TEXT,
    "amountXaf" INTEGER,
    "currency" TEXT,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "operatorReference" TEXT,
    "validationStatus" "ReceiptValidationStatus" NOT NULL DEFAULT 'VALID',
    "reconciliationStatus" "ReceiptReconciliationStatus" NOT NULL DEFAULT 'PENDING_MATCHING',
    "diagnosticNotes" TEXT,
    "workspaceId" TEXT,
    "intentId" TEXT,
    "attemptId" TEXT,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_payment_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_receipt_events" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'SASPAY',
    "eventKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "rawHeaders" JSONB NOT NULL,
    "rawBodyText" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "amountRaw" TEXT,
    "currencyRaw" TEXT,
    "paidAtRaw" TEXT,
    "providerReference" TEXT,
    "rawPayload" JSONB NOT NULL,
    "isIdenticalToReceipt" BOOLEAN NOT NULL,
    "discrepancyNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_receipt_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "attemptId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'SASPAY',
    "providerTransactionId" TEXT NOT NULL,
    "amountXaf" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "paymentMethod" TEXT,
    "operatorReference" TEXT,
    "status" "TransactionApplicationStatus" NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_receipt_audit_logs" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "previousReconciliation" "ReceiptReconciliationStatus" NOT NULL,
    "newReconciliation" "ReceiptReconciliationStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "decisionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_receipt_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quarantined_webhook_payloads" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'SASPAY',
    "payloadHash" TEXT NOT NULL,
    "rawHeaders" JSONB NOT NULL,
    "rawBodyText" TEXT NOT NULL,
    "rejectionReason" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 1,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quarantined_webhook_payloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_history_logs" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "fromPlan" "PlanType" NOT NULL,
    "toPlan" "PlanType" NOT NULL,
    "reason" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_history_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processed_webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'SASPAY',
    "eventKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "processed_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_workspaceId_key" ON "subscriptions"("workspaceId");

-- CreateIndex
CREATE INDEX "subscriptions_status_currentPeriodEnd_idx" ON "subscriptions"("status", "currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_intents_clientMutationKey_key" ON "subscription_intents"("clientMutationKey");

-- CreateIndex
CREATE INDEX "subscription_intents_workspaceId_status_idx" ON "subscription_intents"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_providerSessionId_key" ON "payment_attempts"("providerSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_localAttemptKey_key" ON "payment_attempts"("localAttemptKey");

-- CreateIndex
CREATE INDEX "payment_attempts_providerSessionId_idx" ON "payment_attempts"("providerSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_intentId_attemptNumber_key" ON "payment_attempts"("intentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "provider_payment_receipts_reconciliationStatus_createdAt_idx" ON "provider_payment_receipts"("reconciliationStatus", "createdAt");

-- CreateIndex
CREATE INDEX "provider_payment_receipts_workspaceId_paidAt_idx" ON "provider_payment_receipts"("workspaceId", "paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "provider_payment_receipts_provider_providerTransactionId_key" ON "provider_payment_receipts"("provider", "providerTransactionId");

-- CreateIndex
CREATE INDEX "provider_receipt_events_receiptId_idx" ON "provider_receipt_events"("receiptId");

-- CreateIndex
CREATE INDEX "provider_receipt_events_payloadHash_idx" ON "provider_receipt_events"("payloadHash");

-- CreateIndex
CREATE UNIQUE INDEX "provider_receipt_events_provider_eventKey_key" ON "provider_receipt_events"("provider", "eventKey");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_receiptId_key" ON "payment_transactions"("receiptId");

-- CreateIndex
CREATE INDEX "payment_transactions_workspaceId_paidAt_idx" ON "payment_transactions"("workspaceId", "paidAt");

-- CreateIndex
CREATE INDEX "provider_receipt_audit_logs_receiptId_createdAt_idx" ON "provider_receipt_audit_logs"("receiptId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "quarantined_webhook_payloads_payloadHash_key" ON "quarantined_webhook_payloads"("payloadHash");

-- CreateIndex
CREATE INDEX "quarantined_webhook_payloads_createdAt_idx" ON "quarantined_webhook_payloads"("createdAt");

-- CreateIndex
CREATE INDEX "subscription_history_logs_workspaceId_createdAt_idx" ON "subscription_history_logs"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "processed_webhook_events_processedAt_idx" ON "processed_webhook_events"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "processed_webhook_events_provider_eventKey_key" ON "processed_webhook_events"("provider", "eventKey");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_intents" ADD CONSTRAINT "subscription_intents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_intents" ADD CONSTRAINT "subscription_intents_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_intents" ADD CONSTRAINT "subscription_intents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "subscription_intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_payment_receipts" ADD CONSTRAINT "provider_payment_receipts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_payment_receipts" ADD CONSTRAINT "provider_payment_receipts_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "subscription_intents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_payment_receipts" ADD CONSTRAINT "provider_payment_receipts_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "payment_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_receipt_events" ADD CONSTRAINT "provider_receipt_events_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "provider_payment_receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "provider_payment_receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "subscription_intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "payment_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_receipt_audit_logs" ADD CONSTRAINT "provider_receipt_audit_logs_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "provider_payment_receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_receipt_audit_logs" ADD CONSTRAINT "provider_receipt_audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history_logs" ADD CONSTRAINT "subscription_history_logs_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history_logs" ADD CONSTRAINT "subscription_history_logs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history_logs" ADD CONSTRAINT "subscription_history_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

