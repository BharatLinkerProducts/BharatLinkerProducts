import { app } from './app.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables from .env
dotenv.config();

// Check required environment variables
if (!process.env.MONGODB_URL) {
    console.error('MONGODB_URL is not set in environment variables');
    process.exit(1);
}

// Start server
const startServer = async () => {
    try {
        await connectDB();
        const port = process.env.PORT || 3001;
        const server = app.listen(port, () => console.log(`Server is running at port ${port}`));

        // Gracefully shutdown the server
        const shutdown = (signal) => {
            console.log(`${signal} signal received: closing server`);
            server.close(() => {
                console.log('Server closed');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed');
                    process.exit(0);
                });
            });
        };

        // Listen for termination signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

startServer();
