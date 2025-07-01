"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        console.log("token..", token);
        if (!token) {
            res.status(400).json({
                message: "Bad token Request"
            });
            return;
        }
        // Use the correct secret
        if (!process.env.JWT_USER_SECRET) {
            res.status(500).json({
                message: "server internal problem"
            });
            return;
        }
        // Decode token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_USER_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (err) {
        res.status(401).json({
            message: `Invalid or expired token ${err}`
        });
        return;
    }
};
exports.UserMiddleware = UserMiddleware;
