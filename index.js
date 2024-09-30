import { app } from './app.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Secure Express app by setting various HTTP headers
app.use(helmet());

const port = process.env.PORT || 3005;

// Check if required environment variables are provided
if (!process.env.MONGODB_URL) {
    console.error('MONGODB_URL is not set in environment variables');
    process.exit(1);
}

// Connect to MongoDB and start the server
connectDB()
    .then(() => {
        const server = app.listen(port, () => {
            console.log(`Server is running at port ${port}`);
        });

        // Gracefully shutdown the server on process termination
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing server');
            server.close(() => {
                console.log('Server closed');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed');
                    process.exit(0);
                });
            });
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error);
        process.exit(1); // Exit process if MongoDB fails to connect
    });
