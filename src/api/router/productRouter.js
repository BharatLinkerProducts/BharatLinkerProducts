import { Router } from 'express';
import {  
    deleteProductImage,uploadProductImages,updateProductData ,
    deleteProduct,getProductByShopId,getProductDetails,getProducts,
    uploadProduct}  from '../controller/productController.js';
    
import { upload } from '../middleware/multerMiddleWare.js';

const productRouter = Router(); // Corrected the variable name to productRouter

// Route to upload product images
productRouter.route('/uploadproduct').post(upload.array('images'), uploadProduct);
productRouter.route('/updateproductdata').put(upload.array('images'), updateProductData);

//delet product
productRouter.route('/deleteproduct').put(upload.array('images'), deleteProduct);

//get products
productRouter.route('/getproductbyshopid').get(upload.array('images'), getProductByShopId);
productRouter.route('/getproductdetails').get(upload.array('images'), getProductDetails);
productRouter.route('/getproducts').get(upload.array('images'), getProducts);

//product image
productRouter.route('/uploadproductimage').put(upload.array('images'), uploadProductImages);
productRouter.route('/deleteproductimage').delete(upload.array('images'), deleteProductImage);

// Export the router instance directly
export default productRouter;
