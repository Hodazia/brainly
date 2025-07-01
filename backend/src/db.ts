import mongoose from "mongoose";
import { string } from "zod";
const { Schema, Types } = mongoose;



const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// define an enum
const contentTypes = ['Twitter', 'YouTube', 'Random Links', 'Random Thoughts'];

const ContentSchema = new Schema({
    type: { type: String, required: true },
    link: { type: String, required: true },
    title: { type: String, required: true },
    tags: { type: String, required:true},
    userId: { type: Types.ObjectId, ref: 'User', required: true },
})


const linkSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', unique: true },
    Hash: { type: String, required: true, unique: true }
})


const userModel = mongoose.model("User", userSchema);
const contentModel = mongoose.model("content", ContentSchema);
const linkModel = mongoose.model("link", linkSchema);

export { userModel, contentModel, linkModel }