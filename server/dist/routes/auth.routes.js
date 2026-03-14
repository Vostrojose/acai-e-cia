"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.post("/login", (req, res) => {
    console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const { email, senha } = req.body;
    if (email !== process.env.ADMIN_EMAIL ||
        senha !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            message: "Credenciais inválidas",
        });
    }
    const token = jsonwebtoken_1.default.sign({ role: "ADMIN" }, process.env.JWT_SECRET, { expiresIn: "12h" });
    return res.json({ token });
});
exports.default = router;
