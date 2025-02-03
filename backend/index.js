import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import router from './routes/course.routes.js';
import userrouter from './routes/user.routes.js'; // Removed extra space
import adminRoute from './routes/admin.routes.js';
import orderRoute from './routes/order.route.js';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';

const app = express();

const port = process.env.PORT || 3000;

// Middleware -------------------------
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp',
}));
app.use(cors({
  origin: process.env.FRONTEND_URL, // backend ko sirf yahi frontend access kr sakta hai
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Database Connectivity ----------------------------------
const DB_URI = process.env.MONGO_URI;

async function startServer() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
    
    // Cloudinary Configuration --------------------
    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
    });

    // Defining Routes ---------------------------------------
    app.use('/api/v1/course', router);
    app.use('/api/v1/user', userrouter);
    app.use('/api/v1/admin', adminRoute);
    app.use('/api/v1/order', orderRoute);

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

startServer();

