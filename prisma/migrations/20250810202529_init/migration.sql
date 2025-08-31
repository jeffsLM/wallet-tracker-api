-- CreateTable
CREATE TABLE "public"."Gasto" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "dataGasto" TIMESTAMP(3) NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "origemId" TEXT NOT NULL,
    "compradorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "corHex" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Origem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Origem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comprador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Comprador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GastoTag" (
    "gastoId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "GastoTag_pkey" PRIMARY KEY ("gastoId","tagId")
);

-- CreateIndex
CREATE INDEX "Gasto_dataGasto_idx" ON "public"."Gasto"("dataGasto");

-- CreateIndex
CREATE INDEX "Gasto_categoriaId_idx" ON "public"."Gasto"("categoriaId");

-- CreateIndex
CREATE INDEX "Gasto_origemId_idx" ON "public"."Gasto"("origemId");

-- CreateIndex
CREATE INDEX "Gasto_compradorId_idx" ON "public"."Gasto"("compradorId");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "public"."Categoria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Origem_nome_key" ON "public"."Origem"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Comprador_nome_key" ON "public"."Comprador"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_nome_key" ON "public"."Tag"("nome");

-- CreateIndex
CREATE INDEX "GastoTag_tagId_idx" ON "public"."GastoTag"("tagId");

-- AddForeignKey
ALTER TABLE "public"."Gasto" ADD CONSTRAINT "Gasto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gasto" ADD CONSTRAINT "Gasto_origemId_fkey" FOREIGN KEY ("origemId") REFERENCES "public"."Origem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gasto" ADD CONSTRAINT "Gasto_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "public"."Comprador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GastoTag" ADD CONSTRAINT "GastoTag_gastoId_fkey" FOREIGN KEY ("gastoId") REFERENCES "public"."Gasto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GastoTag" ADD CONSTRAINT "GastoTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
