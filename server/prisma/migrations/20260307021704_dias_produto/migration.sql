-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "disponivelDom" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "disponivelQua" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "disponivelQui" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "disponivelSab" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "disponivelSeg" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "disponivelSex" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "disponivelTer" BOOLEAN NOT NULL DEFAULT true;
