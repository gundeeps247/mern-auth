import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

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
