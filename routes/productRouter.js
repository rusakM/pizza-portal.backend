const express = require('express');
const productController = require('../controllers/productController');
const authControler = require('../controllers/authController');

const router = express.Router();

router.get('/', productController.getAllProducts);

router.get('/:id', productController.getOneProduct);

router.use(authControler.protect, authControler.restrictTo('admin', 'kucharz'));

router.post(
    '/',
    productController.uploadPhoto,
    productController.resizePhoto,
    productController.createProduct
);

router.route(
    '/toggle-activation-status/:id',
    productController.toggleProductActivation,
    productController.updateProduct
);

router
    .route('/:id')
    .patch(
        productController.uploadPhoto,
        productController.resizePhoto,
        productController.updateProduct
    )
    .delete(productController.deleteProduct);

module.exports = router;
