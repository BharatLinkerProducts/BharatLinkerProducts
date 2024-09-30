import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import expressWinston from 'express-winston';
import productRouter from './src/api/router/productRouter.js'; // Ensure this path is correct

// Load environment variables from .env
dotenv.config();

const app = express();

// Set up Winston for logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

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
    ], // Default to allowing all origins if not specified
    optionsSuccessStatus: 200
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

// Logging HTTP requests using express-winston
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console(),
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    meta: true, // Optional: log metadata about the request
    msg: "HTTP {{req.method}} {{req.url}}", // Log the method and URL
    expressFormat: true,
    colorize: false,
}));

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Hello there!"
    });
});

// Product router
app.use('/product', productRouter); // Ensure productRouter is correctly exported

// Handle 404 routes (fallback)
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack); // Log error details
    res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
});

// Start server and handle graceful shutdown
const server = app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server is running on port ${process.env.PORT || 3000}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

export { app };
