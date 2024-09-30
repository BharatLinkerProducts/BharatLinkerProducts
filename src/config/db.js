import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Function to connect to MongoDB with retries
 * @param {number} retries - Number of times to retry the connection.
 * @param {number} retryDelay - Delay (in ms) between retries.
 */
const connectDB = async (retries = 5, retryDelay = 5000) => {
    // Ensure necessary environment variables are present
    const { MONGODB_URL, DB_NAME } = process.env;

    if (!MONGODB_URL || !DB_NAME) {
        throw new Error("Missing required environment variables for MongoDB connection");
    }

    let connected = false;
    while (retries > 0 && !connected) {
        try {
            // Attempt to connect to MongoDB
            await mongoose.connect(MONGODB_URL, {
                dbName: DB_NAME,
            });

            console.log(`Successfully connected to MongoDB: ${DB_NAME}`);
            connected = true; // Mark as connected to exit the retry loop
        } catch (error) {
            console.error(`Error connecting to MongoDB: ${error.message}`);
            retries -= 1;
            if (retries > 0) {
                console.log(`Retrying to connect in ${retryDelay / 1000} seconds... (${retries} attempts left)`);
                await new Promise(res => setTimeout(res, retryDelay)); // Wait before retrying
            } else {
                console.error("Could not connect to MongoDB after multiple attempts. Exiting...");
                process.exit(1); // Exit the process with failure
            }
        }
    }
};

export default connectDB;
