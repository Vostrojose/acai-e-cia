import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { ZodError } from 'zod';
export function errorMiddleware(error, request, response, next) {
    if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => issue.message);
        logger.warn({
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
    if (error instanceof AppError) {
        logger.warn({
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
    logger.error({
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
