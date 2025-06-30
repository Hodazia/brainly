import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import userRouter from './Routes/userRouter';

dotenv.config();
const app =express();

// .env should be in the root folder not in src/ or something else
mongoose.connect(`${process.env.MONGO_DB}`).then(() => {
    console.log('DB connected');
}).catch(err => {
    console.error('DB connection error:', err);
});
app.use(express.json());

app.use('/api/v1/user', userRouter)


app.get('/api/v2' , (req,res) => {
    res.json({message:'u have hit the endpoint'});
})
app.listen(3000, () => {
    console.log('connected to the port 3000');
})