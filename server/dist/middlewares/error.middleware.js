"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const AppError_1 = require("../utils/AppError");
const logger_1 = __importDefault(require("../utils/logger"));
const zod_1 = require("zod");
function errorMiddleware(error, request, response, next) {
    if (error instanceof zod_1.ZodError) {
        const formattedErrors = error.issues.map((issue) => issue.message);
        logger_1.default.warn({
            message: 'Validation error',
            errors: formattedErrors,
            path: request.path,
            method: request.method,
        });
        return response.status(400).json({
            success: false,
            error: formattedErrors,
        });
    }
    if (error instanceof AppError_1.AppError) {
        logger_1.default.warn({
            message: error.message,
            statusCode: error.statusCode,
            path: request.path,
            method: request.method,
        });
        return response.status(error.statusCode).json({
            success: false,
            error: error.message,
        });
    }
    logger_1.default.error({
        message: error.message,
        stack: error.stack,
        path: request.path,
        method: request.method,
    });
    return response.status(500).json({
        success: false,
        error: 'Erro interno do servidor.',
    });
}
