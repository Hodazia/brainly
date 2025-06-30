"use strict";
// define a middleware for accessing routes apart from signin, signup
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//@ts-ignore
const UserMiddleware = (req, res, next) => {
    const header = req.headers["authentication"];
    if (!header)
        return res.status(401).json({ message: "No token provided" });
    try {
        const decodedToken = jsonwebtoken_1.default.verify(header, process.env.JWT_USER_SECRET);
        if (decodedToken) {
            //@ts-ignore
            req.userId = decodedToken.token;
            next();
        }
        else {
            res.status(401).json({ message: "you are not signed up" });
        }
    }
    catch (err) {
    }
};
exports.UserMiddleware = UserMiddleware;
