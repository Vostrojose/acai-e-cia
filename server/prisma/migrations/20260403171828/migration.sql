/*
  Warnings:

  - You are about to alter the column `totalVendas` on the `AuditoriaMensal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `precoUnit` on the `ItemPedido` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `total` on the `Pedido` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `preco` on the `Produto` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "AuditoriaMensal" ALTER COLUMN "totalVendas" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "ItemPedido" ALTER COLUMN "precoUnit" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "pagamentoId" TEXT,
ADD COLUMN     "statusPagamento" TEXT,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Produto" ALTER COLUMN "preco" SET DATA TYPE DECIMAL(10,2);
