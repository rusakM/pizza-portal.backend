const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const photoSaver = require('../utils/photoSaver');
const AppError = require('../utils/appError');

exports.createProduct = factory.createOne(Product);

exports.getAllProducts = factory.getAll(Product);

exports.getOneProduct = factory.getOne(Product);

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

exports.uploadPhoto = photoSaver.uploadPhoto('coverPhoto');

exports.resizePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    await photoSaver.resizePhoto(
        req.file,
        'product',
        300,
        300,
        `${process.cwd()}/uploads/products`,
        'png'
    );
    req.body.coverPhoto = req.file.filename;
    next();
});

exports.toggleProductActivation = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(
            new AppError('Nie można znaleźć produktu o podanym ID', 404)
        );
    }
    req.body = {};
    req.body.isDeactivated = !product.isDeactivated;

    next();
});
