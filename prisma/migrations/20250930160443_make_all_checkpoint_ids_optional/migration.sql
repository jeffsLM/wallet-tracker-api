-- DropForeignKey
ALTER TABLE "BalanceCheckpoint" DROP CONSTRAINT "BalanceCheckpoint_familyId_fkey";

-- AlterTable
ALTER TABLE "BalanceCheckpoint" ALTER COLUMN "familyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BalanceCheckpoint" ADD CONSTRAINT "BalanceCheckpoint_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;
