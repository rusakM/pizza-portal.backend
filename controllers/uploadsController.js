const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const readFile = (file, next) => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject(next(new AppError(`File doesn't exist`, 404)));
            resolve(data);
        });
    });
};

exports.getFile = catchAsync(async (req, res, next) => {
    const { filename } = req.params;
    const filePath = `${process.cwd()}/uploads/${filename}`;
    await readFile(filePath, next);
    res.status(200).sendFile(filePath);
});
