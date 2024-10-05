import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import productRouter from './src/api/router/productRouter.js'; // Ensure this path is correct

// Load environment variables from .env
dotenv.config();

const app = express();

// Rate limiting to prevent DDoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});

// CORS configuration
const corsOptions = {
    origin: [
        "https://www.bharatlinker.shop",
        "http://localhost:5173",
        "http://192.168.48.200:5173",
        "https://www.bharatlinker.shop"
    ],
    optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS
app.use(helmet()); // Secure HTTP headers
app.use(limiter); // Apply rate limiter
app.use(compression()); // Compress response bodies
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(express.static('public')); // Serve static files
app.use(cookieParser()); // Parse cookies

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ message: "Hello there!" });
});

// Product router
app.use('/product', productRouter); // Ensure productRouter is correctly exported

// Handle 404 routes (fallback)
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res) => {
    console.error(err.stack); // Log error details to console
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Export app
export { app };

// Graceful shutdown logic (can be implemented in your server file)
