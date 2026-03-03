"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_service_1 = __importDefault(require("../services/auth.service"));
class AuthController {
    login = (0, asyncHandler_1.asyncHandler)(async (request, response) => {
        const { email, senha } = request.body;
        const result = await auth_service_1.default.login(email, senha);
        return response.json({
            success: true,
            data: result,
        });
    });
}
exports.default = new AuthController();
