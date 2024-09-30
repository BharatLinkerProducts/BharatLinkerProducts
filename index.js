import { app } from './app.js';
import connectDB from './src/config/db.js'; // Ensure this imports your DB connection function
import dotenv from 'dotenv';
import winston from 'winston';
import mongoose from 'mongoose'; // Import mongoose for DB connection handling

// Load environment variables from .env
dotenv.config();

// Create a logger instance using winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

const port = process.env.PORT || 3001;

// Check if required environment variables are provided
if (!process.env.MONGODB_URL) {
    logger.error('MONGODB_URL is not set in environment variables');
    process.exit(1);
}

// Connect to MongoDB
connectDB()
    .then(() => {
        const server = app.listen(port, () => {
            logger.info(`Server is running at port ${port}`);
        });

        // Gracefully shutdown the server on process termination
        const shutdown = (signal) => {
            logger.info(`${signal} signal received: closing server`);
            server.close(() => {
                logger.info('Server closed');
                mongoose.connection.close(false, () => {
                    logger.info('MongoDB connection closed');
                    process.exit(0);
                });
            });
        };

        // Listen for termination signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    })
    .catch((error) => {
        logger.error('MongoDB connection failed:', error);
        process.exit(1); // Exit process if MongoDB fails to connect
    });
