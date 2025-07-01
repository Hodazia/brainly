"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.contentModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, Types } = mongoose_1.default;
const userSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
// define an enum
const contentTypes = ['Twitter', 'YouTube', 'Random Links', 'Random Thoughts'];
const ContentSchema = new Schema({
    type: { type: String, required: true },
    link: { type: String, required: true },
    title: { type: String, required: true },
    tags: { type: String, required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
});
const linkSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', unique: true },
    Hash: { type: String, required: true, unique: true }
});
const userModel = mongoose_1.default.model("User", userSchema);
exports.userModel = userModel;
const contentModel = mongoose_1.default.model("content", ContentSchema);
exports.contentModel = contentModel;
const linkModel = mongoose_1.default.model("link", linkSchema);
exports.linkModel = linkModel;
