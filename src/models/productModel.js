import { Schema, model } from "mongoose";

// Assuming you have a Shop model defined somewhere
const productSchema = new Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    pinCodes: [{
        type: Number
    }],
    price: {
        type: Number
    },
    shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    keywords: [{
        type: String
    }],
    quantityAvailable: {
        type:Number
    },
    discountedPrice: {
        type: Number
    },
    brand: [{
        type: String,
        trim: true
    }],
    ratings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5 
    },
    images: [{
        type: String
    }]
}, { timestamps: true });



export const Product = model('Product', productSchema);
