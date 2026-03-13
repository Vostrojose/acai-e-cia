"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const produto_service_1 = __importDefault(require("../services/produto.service"));
const asyncHandler_1 = require("../utils/asyncHandler");
const produto_schema_1 = require("../validators/produto.schema");
const AppError_1 = require("../utils/AppError");
const prisma_1 = __importDefault(require("../services/prisma")); // ✅ precisa importar o prisma
class ProdutoController {
    criar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = produto_schema_1.criarProdutoSchema.parse(req.body);
        const produto = await produto_service_1.default.criarProduto(data);
        return res.status(201).json({
            success: true,
            data: produto,
        });
    });
    listar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const produtos = await produto_service_1.default.listarProdutos();
        return res.json({
            success: true,
            data: produtos,
        });
    });
    alterarStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { ativo } = req.body;
        if (typeof ativo !== 'boolean') {
            throw new AppError_1.AppError('O campo "ativo" deve ser boolean.', 400);
        }
        const produto = await produto_service_1.default.alterarStatus(id, ativo);
        return res.json({
            success: true,
            data: produto,
        });
    });
    remover = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        await produto_service_1.default.removerProduto(id);
        return res.json({
            success: true,
        });
    });
    atualizar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const produto = await prisma_1.default.produto.update({
            where: { id },
            data: req.body,
        });
        return res.json({
            success: true,
            data: produto,
        });
    });
    deletar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        await prisma_1.default.produto.delete({
            where: { id },
        });
        return res.json({
            success: true,
        });
    });
}
exports.default = new ProdutoController();
