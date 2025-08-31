/*
  Warnings:

  - You are about to drop the `AccountBalance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountBalance" DROP CONSTRAINT "AccountBalance_accountId_fkey";

-- DropTable
DROP TABLE "AccountBalance";
