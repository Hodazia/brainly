"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.tagModel = exports.contentModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, Types } = mongoose_1.default;
const User = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const contentTypes = ['Twitter', 'YouTube', 'Random Links', 'Random Thoughts'];
const Content = new Schema({
    type: { type: String, enum: contentTypes },
    link: { type: String, required: true },
    title: { type: String, required: true },
    tags: [{ type: Types.ObjectId, ref: 'Tag' }],
    notes: String,
    userId: { type: Types.ObjectId, ref: 'users', required: true },
});
const Tags = new Schema({
    title: [{ type: String, required: true, unique: true }],
});
const Links = new Schema({
    userId: { type: Types.ObjectId, ref: 'users', unique: true },
    Hash: { type: String, required: true, unique: true }
});
const userModel = mongoose_1.default.model("users", User);
exports.userModel = userModel;
const contentModel = mongoose_1.default.model("contents", Content);
exports.contentModel = contentModel;
const tagModel = mongoose_1.default.model("Tag", Tags);
exports.tagModel = tagModel;
const linkModel = mongoose_1.default.model("links", Links);
exports.linkModel = linkModel;
