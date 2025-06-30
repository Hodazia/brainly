import mongoose from "mongoose";
import { string } from "zod";
const { Schema, Types } = mongoose;



const User = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// define an enum
const contentTypes = ['Twitter', 'YouTube', 'Random Links', 'Random Thoughts'];

const Content = new Schema({
    type: { type: String, enum: contentTypes },
    link: { type: String, required: true },
    title: { type: String, required: true },
    tags: [{ type: Types.ObjectId, ref: 'Tag' }],
    notes: String,
    userId: { type: Types.ObjectId, ref: 'users', required: true },
})

const Tags = new Schema({
    title: [{ type: String, required: true, unique: true }],
})

const Links = new Schema({
    userId: { type: Types.ObjectId, ref: 'users', unique: true },
    Hash: { type: String, required: true, unique: true }
})


const userModel = mongoose.model("users", User);
const contentModel = mongoose.model("contents", Content);
const tagModel = mongoose.model("Tag", Tags);
const linkModel = mongoose.model("links", Links);

export { userModel, contentModel, tagModel, linkModel }