const multer = require('multer');
const sharp = require('sharp');
const AppError = require('./appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                'Wgrany plik jest nieprawidłowy, spróbuj ponownie.',
                404
            )
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadPhoto = (fieldName) => upload.single(fieldName);

exports.resizePhoto = async (file, name, width, height, dest, ext) => {
    file.filename = `${name}-${Date.now()}.${ext}`;
    await sharp(file.buffer)
        .resize(width, height)
        .toFormat(ext, {
            quality: 85,
        })
        .toFile(`${dest}/${file.filename}`);
};
