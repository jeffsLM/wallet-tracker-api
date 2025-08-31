/*
  Warnings:

  - The `updateAt` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `createAt` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createAt` on the `Family` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createAt` on the `Payer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createAt` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createAt` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "createAt",
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "updateAt",
ADD COLUMN     "updateAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Family" DROP COLUMN "createAt",
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payer" DROP COLUMN "createAt",
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "createAt",
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createAt",
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "competence" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
