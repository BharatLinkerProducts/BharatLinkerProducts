import mongoose from 'mongoose';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

// Setup Winston logger
const logger = winston.createLogger({
    level: 'info', // You can set 'debug', 'error', etc. based on your needs
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`),
    ),
    transports: [
        new winston.transports.Console(), // Logs to console
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Logs errors to a file
        new winston.transports.File({ filename: 'logs/combined.log' }) // Logs all messages to a file
    ]
});

/**
 * Function to connect to MongoDB with retries
 * @param {number} retries - Number of times to retry the connection.
 * @param {number} retryDelay - Delay (in ms) between retries.
 */
const connectDB = async (retries = 5, retryDelay = 5000) => {
    // Ensure necessary environment variables are present
    const { MONGODB_URL, DB_NAME } = process.env;

    if (!MONGODB_URL || !DB_NAME) {
        logger.error("Missing required environment variables for MongoDB connection");
        throw new Error("Missing required environment variables for MongoDB connection");
    }

    let connected = false;
    while (retries > 0 && !connected) {
        try {
            // Attempt to connect to MongoDB
            await mongoose.connect(MONGODB_URL, {
                dbName: DB_NAME,
            });

            logger.info(`Successfully connected to MongoDB: ${DB_NAME}`);
            connected = true; // Mark as connected to exit the retry loop
        } catch (error) {
            logger.error(`Error connecting to MongoDB: ${error.message}`);
            retries -= 1;
            if (retries > 0) {
                logger.info(`Retrying to connect in ${retryDelay / 1000} seconds... (${retries} attempts left)`);
                await new Promise(res => setTimeout(res, retryDelay)); // Wait before retrying
            } else {
                logger.error("Could not connect to MongoDB after multiple attempts. Exiting...");
                process.exit(1); // Exit the process with failure
            }
        }
    }
};

export default connectDB;
