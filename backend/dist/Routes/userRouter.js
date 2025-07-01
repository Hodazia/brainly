"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const middleware_1 = require("../middleware");
const utils_1 = require("../utils");
const userRouter = (0, express_1.Router)();
userRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // validate the request body via zod
    const userSchema = zod_1.z.object({
        username: zod_1.z.string().min(1, { message: "Please Enter your username" }).max(20, { message: "Username must not exceed 20 characters" }),
        password: zod_1.z.string().min(8, { message: "Password must be at least 8 characters long" }).max(20, { message: "Password must not exceed 20 characters" }).regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[\W_]/, "Password must contain at least one special character"),
    });
    const { success, error } = userSchema.safeParse(req.body);
    if (!success) {
        res.status(411).json({
            message: error.issues[0].message
        });
        return;
    }
    // hash the password via bcrypt
    const hashedPassword = yield bcrypt_1.default.hash(password, 8);
    try {
        yield db_1.userModel.create({
            password: hashedPassword,
            username: username
        });
        const findUser = yield db_1.userModel.findOne({
            username: username
        });
        const Token = jsonwebtoken_1.default.sign({
            token: findUser === null || findUser === void 0 ? void 0 : findUser._id
        }, process.env.JWT_USER_SECRET, {
            expiresIn: "7d",
        });
        res.json({
            message: "successfully signed up",
            token: Token
        });
    }
    catch (error) {
        res.json({
            message: error
        });
    }
}));
//@ts-ignore
userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // just logging the request body values from API testing via POSTMAN
    console.log("Sign-in attempt for username:", username);
    console.log("Received userPassword (should be plain text):", password);
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: "Username is required and must be a string." });
    }
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ message: "Password is required and must be a string." });
    }
    const findUser = yield db_1.userModel.findOne({ username: username });
    if (!findUser) {
        return res.status(411).json({
            message: "Enter a valid email address"
        });
    }
    // Find the hashed password from the DB
    const storedPasswordHash = findUser.password;
    console.log("Stored password hash (from DB):", storedPasswordHash);
    if (!storedPasswordHash || typeof storedPasswordHash !== 'string') {
        console.error(`Error: User '${username}' found, but 'password' field is missing or not a string in the database.`);
        return res.status(500).json({
            message: "Internal server error: User data corrupted. Please contact support."
        });
    }
    try {
        const passwordMatch = yield bcrypt_1.default.compare(password, storedPasswordHash);
        if (!passwordMatch) {
            return res.status(411).json({
                message: "Incorrect password. Please try again"
            });
        }
        // --- Debugging Step 3: Check JWT Secret ---
        const jwtSecret = process.env.JWT_USER_SECRET;
        console.log("JWT Secret loaded:", jwtSecret ? "Yes" : "No (or undefined)");
        if (!jwtSecret) {
            console.error("JWT_USER_SECRET environment variable is not set!");
            return res.status(500).json({
                message: "Server configuration error: JWT secret missing."
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: findUser._id }, // Use a clearer key like 'userId'
        jwtSecret, { expiresIn: "7d" });
        res.json({
            message: "Successfully signed in",
            token: token
        });
    }
    catch (error) {
        console.error("Error during bcrypt.compare or JWT signing:", error);
        return res.status(500).json({
            message: "An unexpected error occurred during sign-in."
        });
    }
}));
//@ts-ignore
userRouter.post("/content", middleware_1.UserMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { type, link, title, tags } = req.body;
        //@ts-ignore
        const UserID = req.userId;
        console.log(UserID, '\n');
        console.log(type, '\n', link, '\n', title, '\n', tags, '\n');
        try {
            yield db_1.contentModel.create({
                type: type,
                link: link,
                title: title,
                tags: tags,
                userId: UserID,
            });
            res.status(200).json({ message: "Content created successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
});
//@ts-ignore
userRouter.post("/brain/share", middleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    //@ts-ignore
    const userId = req.userId;
    const Hash = (0, utils_1.random)(8);
    if (share) {
        const existingLink = yield db_1.linkModel.findOne({
            userId: userId
        });
        if (existingLink) {
            res.json({
                message: "Shareable link already exist",
                Link: existingLink.Hash
            });
            return;
        }
        yield db_1.linkModel.create({
            userId: userId,
            Hash: Hash
        });
    }
    else {
        yield db_1.linkModel.deleteOne({
            userId: userId,
        });
    }
    res.json({
        message: "Sharable link is created",
        Link: Hash
    });
}));
//@ts-ignore
userRouter.get("/brain/share/:shareId", middleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shareLink = req.params.shareId;
    const link = yield db_1.linkModel.findOne({
        Hash: shareLink.toString()
    });
    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        });
        return;
    }
    const user = yield db_1.userModel.findOne({
        _id: link.userId
    });
    const Content = yield db_1.contentModel.find({
        userId: link.userId
    });
    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        });
        return;
    }
    res.json({
        username: user.username,
        content: Content
    });
}));
exports.default = userRouter;
