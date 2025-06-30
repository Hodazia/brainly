"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRouter_1 = __importDefault(require("./Routes/userRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// .env should be in the root folder not in src/ or something else
mongoose_1.default.connect(`${process.env.MONGO_DB}`).then(() => {
    console.log('DB connected');
}).catch(err => {
    console.error('DB connection error:', err);
});
app.use(express_1.default.json());
app.use('/api/v1/user', userRouter_1.default);
app.get('/api/v2', (req, res) => {
    res.json({ message: 'u have hit the endpoint' });
});
app.listen(3000, () => {
    console.log('connected to the port 3000');
});
