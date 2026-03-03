"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const produto_service_1 = __importDefault(require("../services/produto.service"));
const asyncHandler_1 = require("../utils/asyncHandler");
const produto_schema_1 = require("../validators/produto.schema");
const AppError_1 = require("../utils/AppError");
class ProdutoController {
    criar = (0, asyncHandler_1.asyncHandler)(async (request, response) => {
        const data = produto_schema_1.criarProdutoSchema.parse(request.body);
        const produto = await produto_service_1.default.criarProduto(data);
        return response.status(201).json({
            success: true,
            data: produto,
        });
    });
    listar = (0, asyncHandler_1.asyncHandler)(async (request, response) => {
        const produtos = await produto_service_1.default.listarProdutos();
        return response.json({
            success: true,
            data: produtos,
        });
    });
    alterarStatus = (0, asyncHandler_1.asyncHandler)(async (request, response) => {
        const { id } = request.params;
        const { ativo } = request.body;
        if (typeof ativo !== 'boolean') {
            throw new AppError_1.AppError('O campo "ativo" deve ser boolean.', 400);
        }
        const produto = await produto_service_1.default.alterarStatus(id, ativo);
        return response.json({
            success: true,
            data: produto,
        });
    });
}
exports.default = new ProdutoController();
