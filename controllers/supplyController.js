const Supply = require('../models/supplyModel');
const factory = require('./handlerFactory');
const photoSaver = require('../utils/photoSaver');
const catchAsync = require('../utils/catchAsync');

exports.uploadPhoto = photoSaver.uploadPhoto('coverPhoto');

exports.resizePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    await photoSaver.resizePhoto(
        req.file,
        'supply',
        300,
        300,
        `${process.cwd()}/uploads/supplies`,
        'png'
    );
    req.body.coverPhoto = req.file.filename;
    next();
});

exports.createNewSupply = factory.createOne(Supply);

exports.getAllSupplies = factory.getAll(Supply);

exports.getSupply = factory.getOne(Supply);

exports.updateSupply = factory.updateOne(Supply);

exports.deleteSupply = factory.deleteOne(Supply);
