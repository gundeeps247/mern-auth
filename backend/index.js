import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

mongoose.connect(process.env.MONGO)
    .then(() => {
        console.log("Connected to MongoDb");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});

app.use('/backend/user', userRoutes);
app.use('/backend/auth', authRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode,
    })
})