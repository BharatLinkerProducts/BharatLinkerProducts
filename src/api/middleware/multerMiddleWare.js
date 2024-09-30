import multer from "multer";

// Set up memory storage for multer
const storage = multer.memoryStorage(); // Store files in memory

// Initialize multer with the memory storage
export const upload = multer({ 
    storage, 
    limits: { fileSize: 10 * 1024 * 1024 } // Optional: Set a file size limit (10 MB here)
});
