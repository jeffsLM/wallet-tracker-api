/*
  Warnings:

  - You are about to drop the column `accountId` on the `AccountBalance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountBalance" DROP CONSTRAINT "AccountBalance_accountId_fkey";

-- AlterTable
ALTER TABLE "AccountBalance" DROP COLUMN "accountId";
