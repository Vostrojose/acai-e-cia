-- CreateEnum
CREATE TYPE "FormaPagamentoBalcao" AS ENUM ('PAGO', 'FIADO', 'CREDITO');

-- AlterTable
ALTER TABLE "ItemPedidoAdicional" ADD COLUMN     "quantidade" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "clienteNome" TEXT,
ADD COLUMN     "formaPagamentoBalcao" "FormaPagamentoBalcao",
ADD COLUMN     "pago" BOOLEAN NOT NULL DEFAULT true;
