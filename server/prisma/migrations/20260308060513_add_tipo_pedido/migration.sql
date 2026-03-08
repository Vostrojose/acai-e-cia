-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('MESA', 'RETIRADA', 'ENTREGA', 'ONLINE');

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "tipo" "TipoPedido" NOT NULL DEFAULT 'ONLINE';
