-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "auditoriaId" TEXT;

-- CreateTable
CREATE TABLE "AuditoriaMensal" (
    "id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "totalVendas" DOUBLE PRECISION NOT NULL,
    "produtos" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditoriaMensal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_auditoriaId_fkey" FOREIGN KEY ("auditoriaId") REFERENCES "AuditoriaMensal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
