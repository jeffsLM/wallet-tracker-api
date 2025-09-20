-- CreateTable
CREATE TABLE "MonthlyClosure" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "competence" TIMESTAMP(3) NOT NULL,
    "initialBalance" DECIMAL(65,30) DEFAULT 0.0,
    "totalIncome" DECIMAL(65,30) DEFAULT 0.0,
    "totalExpenses" DECIMAL(65,30) DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyClosure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MonthlyClosure" ADD CONSTRAINT "MonthlyClosure_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
