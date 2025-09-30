-- CreateTable
CREATE TABLE "BalanceCheckpoint" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "accountId" TEXT,
    "groupId" TEXT,
    "threshold" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckpointNotification" (
    "id" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "competence" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "messageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',

    CONSTRAINT "CheckpointNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BalanceCheckpoint_familyId_idx" ON "BalanceCheckpoint"("familyId");

-- CreateIndex
CREATE INDEX "BalanceCheckpoint_accountId_idx" ON "BalanceCheckpoint"("accountId");

-- CreateIndex
CREATE INDEX "BalanceCheckpoint_groupId_idx" ON "BalanceCheckpoint"("groupId");

-- CreateIndex
CREATE INDEX "CheckpointNotification_competence_idx" ON "CheckpointNotification"("competence");

-- CreateIndex
CREATE INDEX "CheckpointNotification_sentAt_idx" ON "CheckpointNotification"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "CheckpointNotification_checkpointId_competence_key" ON "CheckpointNotification"("checkpointId", "competence");

-- AddForeignKey
ALTER TABLE "BalanceCheckpoint" ADD CONSTRAINT "BalanceCheckpoint_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceCheckpoint" ADD CONSTRAINT "BalanceCheckpoint_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceCheckpoint" ADD CONSTRAINT "BalanceCheckpoint_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointNotification" ADD CONSTRAINT "CheckpointNotification_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "BalanceCheckpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
