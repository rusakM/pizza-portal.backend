const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const photoSaver = require('../utils/photoSaver');

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
