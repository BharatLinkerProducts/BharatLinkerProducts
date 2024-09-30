import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import productRouter from './src/api/router/productRouter.js'; // Ensure this path is correct

// Load environment variables from .env
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: [
        "https://www.bharatlinker.shop",
        "http://localhost:5173",
        "http://192.168.48.200:5173"
    ],
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(cookieParser()); // Parse cookies

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Hello there!"
    });
});

// Product router
app.use('/product', productRouter); // Ensure productRouter is correctly exported

// Handle 404 routes (fallback)
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export { app };
