import { Product } from '../../models/productModel.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../../utils/cloudinary.js'
import { ApiFeatures } from '../../utils/apiFeatures.js';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';


//VERIFIED
const uploadProduct = asyncHandler(async (req, res) => {
    console.log("lp");
    try {
        const {
            title, description, price, category, quantityAvailable, brand, shop, pincodes
        } = req.body;

        const files = req.files;  // Handling multiple files

        // Check if files are provided
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "No images provided." });
        }

        // Upload images and store the URLs in the 'images' array
        let images = [];
        for (const file of files) {
            const imageUrl = await uploadOnCloudinary(file.buffer); // Assuming file.buffer is passed directly to Cloudinary
            images.push(imageUrl); // Push each image URL to the array
        }

        // Convert pincodes to an array of numbers (assuming it is passed as a string of comma-separated values)
        const pinCodesArray = Array.isArray(pincodes)
            ? pincodes.map(pin => Number(pin)) // If it's already an array, map to numbers
            : pincodes.split(',').map(pin => Number(pin)); // Otherwise, split and map to numbers

        // Check for invalid pincode entries (NaN)
        if (pinCodesArray.some(isNaN)) {
            return res.status(400).json({ message: "Invalid pincode(s) provided." });
        }

        // Create a new product instance using the provided model
        const newProduct = new Product({
            title,
            description,
            price,
            quantityAvailable,
            category,
            brand,
            shop,
            images,
            pinCodes: pinCodesArray, // Use the array of numbers
        });

        // Save the new product to the database
        await newProduct.save();

        // Respond with the created product
        res.status(201).json({
            message: "Product uploaded successfully",
            product: newProduct,
        });
    } catch (error) {
        console.error('Error uploading product:', error); // Log the error details
        res.status(500).json({
            message: "Error uploading product.",
            error: error.message || "Internal server error.",
        });
    }
});


//VERIFIED
const updateProductData = asyncHandler(async (req, res) => {
    const productId = req.query.productId; // Extracting productId from the query parameters

    const { title, description, pinCodes, price, discountedPrice, quantityAvailable, keywords, brand, category } = req.body;

    // Check if the productId is provided
    if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
    }

    // Create an object to store updates
    const updates = {};

    // Add product data fields to the updates object
    if (title) updates.title = title;
    if (description) updates.description = description;

    // Process pinCodes if provided (assuming pinCodes might come as a comma-separated string or array)
    if (pinCodes) {
        const pincodeData = Array.isArray(pinCodes) ? pinCodes : pinCodes.split(',').map(Number);
        updates.pinCodes = pincodeData;
    }

    if (price) updates.price = price;
    if (discountedPrice) updates.discountedPrice = discountedPrice;
    if (quantityAvailable) updates.quantityAvailable = quantityAvailable;
    if (brand) updates.brand = brand;
    if (category) updates.category = category;

    // Handle keywords if provided
    if (keywords) {
        const keywordData = Array.isArray(keywords) ? keywords : keywords.split(',');
        updates.keywords = keywordData;
    }


    // If there are no updates, respond with a message
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No fields to update." });
    }

    try {
        // Find the product by ID and update it with the new data
        const updatedProduct = await Product.findByIdAndUpdate(productId, updates, {
            new: true, // Return the updated document
        });

        // Check if the product was found and updated
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Respond with the updated product data
        res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
    } catch (error) {
        console.error('Error updating product data:', error);
        res.status(500).json({ message: 'Server error occurred while updating product data.', error });
    }
});

//VERIFIED
const deleteProductImage = asyncHandler(async (req, res) => {
    const { productId, imageUrl } = req.body;

    try {
        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Check if the image exists in the product's images array
        const imageIndex = product.images.indexOf(imageUrl);
        if (imageIndex === -1) {
            return res.status(400).json({ message: 'Image not found in the product.' });
        }

        // Delete the image from Cloudinary
        const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary

        // Remove the image URL from the product's images array
        product.images.splice(imageIndex, 1);

        // Save the updated product document
        await product.save();

        res.status(200).json({ message: 'Image deleted successfully.', images: product.images });
    } catch (error) {
        console.error('Error deleting product image:', error); // Log error for debugging
        res.status(500).json({ message: 'Server error occurred while deleting image.', error });
    }
});


//VERIFIED
const uploadProductImages = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const newImages = []; // Array to store newly uploaded image URLs
    const files = req.files; // Use req.files containing buffers due to memory storage

    // Validate productId and files
    if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
    }

    if (!files || files.length === 0) {
        return res.status(400).json({ message: "No images were provided for upload." });
    }

    try {
        // Upload each file buffer to Cloudinary
        for (const file of files) {
            // Assuming uploadOnCloudinary accepts a buffer and file name
            const imageUrl = await uploadOnCloudinary(file.buffer, file.originalname);
            if (imageUrl) {
                newImages.push(imageUrl); // Push the image URL to the newImages array if the upload is successful
            } else {
                return res.status(500).json({ message: "Error uploading one or more images." });
            }
        }

        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Append new images to the existing ones
        product.images = [...product.images, ...newImages];

        // Save the updated product
        await product.save();

        // Respond with success and the newly added image URLs
        res.status(200).json({
            message: "Images uploaded successfully!",
            images: newImages
        });
    } catch (error) {
        console.error("Error uploading product images:", error);
        res.status(500).json({
            message: "Server error occurred while uploading images.",
            error: error.message
        });
    }
});


//VRIFIED
const deleteProduct = asyncHandler(async (req, res) => {
    const productId = req.query.productId;
    console.log(productId)
    // Check if the productId is provided
    if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
    }

    try {
        // Find the product by ID
        const product = await Product.findById(productId);

        // Check if the product exists
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Delete all product images associated with the product from Cloudinary
        if (product.images && product.images.length > 0) {
            const deleteProductImagePromises = product.images.map(async (imageUrl) => {
                const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
            });

            // Wait for all product images to be deleted
            await Promise.all(deleteProductImagePromises);
        }

        // After all images are deleted, delete the product
        const deletedProduct = await Product.findByIdAndDelete(productId);

        // If product not found after delete attempt
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Respond with success
        res.status(200).json({ message: "Product and its images deleted successfully." });
    } catch (error) {
        console.error('Error deleting product and images:', error);
        res.status(500).json({ message: 'Server error occurred while deleting product and images.', error });
    }
});

//VERIFIED
const getProductByShopId = asyncHandler(async (req, res) => {
    const shopId = req.query.shopId;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 5; // Default limit

    // Check if the shopId is provided
    if (!shopId) {
        return res.status(400).json({ message: "Shop ID is required." });
    }

    // Trim the shopId to remove whitespace
    const trimmedShopId = shopId.trim();

    // Validate if shopId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(trimmedShopId)) {
        return res.status(400).json({ message: "Invalid Shop ID format." });
    }

    try {
        // Paginate the products associated with the shop ID
        const products = await Product.find({ shop: trimmedShopId })
            .skip((page - 1) * limit)
            .limit(limit);

        // Respond with the list of products
        res.status(200).json({ message: "Products retrieved successfully.", products });
    } catch (error) {
        console.error('Error retrieving products by shop ID:', error);
        res.status(500).json({ message: 'Server error occurred while retrieving products.', error });
    }
});


//VERIFIED
const getProductDetails = asyncHandler(async (req, res) => {
    const productId = req.query.productId; // Get the product ID from query params

    // Check if the productId is provided
    if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
    }

    try {
        // Find the product by ID
        const product = await Product.findById(productId);

        // Check if the product exists
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Respond with the product details
        res.status(200).json({ message: "Product retrieved successfully.", product });
    } catch (error) {
        console.error('Error retrieving product details:', error);
        res.status(500).json({ message: 'Server error occurred while retrieving product details.', error });
    }
});


const getProducts = asyncHandler(async (req, res) => {
        const resultsPerPage = 20;
        const currentPage = Number(req.query.page) || 1;
    
    
        const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()    
        .filterByPincode()
        .filterByCategory()
        .filterByBrand()
        .sortByPrice();
    
        const totalProducts = await Product.countDocuments(apiFeatures.query.clone());
        const products = await apiFeatures.query
            .skip(resultsPerPage * (currentPage - 1))
            .limit(resultsPerPage);
    
        const totalPages = Math.ceil(totalProducts / resultsPerPage);
    
        res.status(200).json({
            message: "Products retrieved successfully.",
            products,
            totalProducts,
            resultsPerPage,
            currentPage,
            totalPages,
        });
});


const getHomePageProducts = async (req, res) => {
    const resultsPerPage = 20;
    const currentPage = Number(req.query.page) || 1;


    const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .filterByPincode()

    const totalProducts = await Product.countDocuments(apiFeatures.query.clone());
    const products = await apiFeatures.query
        .skip(resultsPerPage * (currentPage - 1))
        .limit(resultsPerPage);

    const totalPages = Math.ceil(totalProducts / resultsPerPage);

    res.status(200).json({
        message: "Products retrieved successfully.",
        products,
        totalProducts,
        resultsPerPage,
        currentPage,
        totalPages,
    });
};




export {
    deleteProductImage, uploadProductImages, updateProductData,
    deleteProduct, getProductByShopId, getProductDetails, getProducts,
    uploadProduct, getHomePageProducts
};