import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path'; // Importing the 'path' module
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import { errorHandler } from './utils/error.js';
import { verifyToken } from './utils/verifyUser.js'; // Corrected path

dotenv.config();

const __dirname = path.resolve(); // Now 'path' is available

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());  // Add CORS if needed for frontend-backend communication

mongoose.connect(process.env.MONGO)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB", err));

// API Routes
app.use('/backend/user', verifyToken, userRoutes);
app.use('/backend/auth', authRoutes);

// Serve static frontend files **in production** only
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        statusCode,
    });
});

app.listen(3000, () => console.log("Server listening on port 3000"));
