/*
  Warnings:

  - You are about to drop the column `nome` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the `Categoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comprador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gasto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GastoTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Origem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Gasto" DROP CONSTRAINT "Gasto_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Gasto" DROP CONSTRAINT "Gasto_compradorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Gasto" DROP CONSTRAINT "Gasto_origemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GastoTag" DROP CONSTRAINT "GastoTag_gastoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GastoTag" DROP CONSTRAINT "GastoTag_tagId_fkey";

-- DropIndex
DROP INDEX "public"."Tag_nome_key";

-- AlterTable
ALTER TABLE "public"."Tag" DROP COLUMN "nome",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Categoria";

-- DropTable
DROP TABLE "public"."Comprador";

-- DropTable
DROP TABLE "public"."Gasto";

-- DropTable
DROP TABLE "public"."GastoTag";

-- DropTable
DROP TABLE "public"."Origem";

-- CreateTable
CREATE TABLE "public"."Expense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Buyer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExpenseTag" (
    "expenseId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ExpenseTag_pkey" PRIMARY KEY ("expenseId","tagId")
);

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "public"."Expense"("expenseDate");

-- CreateIndex
CREATE INDEX "Expense_categoryId_idx" ON "public"."Expense"("categoryId");

-- CreateIndex
CREATE INDEX "Expense_sourceId_idx" ON "public"."Expense"("sourceId");

-- CreateIndex
CREATE INDEX "Expense_buyerId_idx" ON "public"."Expense"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "public"."Source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_name_key" ON "public"."Buyer"("name");

-- CreateIndex
CREATE INDEX "ExpenseTag_tagId_idx" ON "public"."ExpenseTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "public"."Tag"("name");

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExpenseTag" ADD CONSTRAINT "ExpenseTag_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "public"."Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExpenseTag" ADD CONSTRAINT "ExpenseTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
