/*
  Warnings:

  - The `origem` column on the `Pedido` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statusPagamento` column on the `Pedido` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[mes,ano]` on the table `AuditoriaMensal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pagamentoId]` on the table `Pedido` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalReference]` on the table `Pedido` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OrigemPedido" AS ENUM ('QR_CODE', 'APP', 'ADMIN', 'BALCAO');

-- DropForeignKey
ALTER TABLE "ItemPedido" DROP CONSTRAINT "ItemPedido_pedidoId_fkey";

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "externalReference" TEXT,
ALTER COLUMN "status" SET DEFAULT 'AGUARDANDO_PAGAMENTO',
DROP COLUMN "origem",
ADD COLUMN     "origem" "OrigemPedido",
DROP COLUMN "statusPagamento",
ADD COLUMN     "statusPagamento" "StatusPagamento";

-- CreateIndex
CREATE UNIQUE INDEX "AuditoriaMensal_mes_ano_key" ON "AuditoriaMensal"("mes", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_pagamentoId_key" ON "Pedido"("pagamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_externalReference_key" ON "Pedido"("externalReference");

-- CreateIndex
CREATE INDEX "Pedido_status_idx" ON "Pedido"("status");

-- CreateIndex
CREATE INDEX "Pedido_criadoEm_idx" ON "Pedido"("criadoEm");

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
