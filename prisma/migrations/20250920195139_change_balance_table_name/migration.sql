/*
  Warnings:

  - You are about to drop the `AccountBalance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountBalance" DROP CONSTRAINT "AccountBalance_groupId_fkey";

-- DropTable
DROP TABLE "AccountBalance";

-- CreateTable
CREATE TABLE "GroupBalance" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "competence" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupBalance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupBalance" ADD CONSTRAINT "GroupBalance_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
