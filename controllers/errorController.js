const AppError = require('../utils/appError');

const handleCastErrorDb = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please try another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(', ')}`;
    return new AppError(message, 400);
};

const handleJWTExpiredError = () => {
    return new AppError('Token expired. Please login again');
};

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
    });
};

const handleJWTError = () => {
    return new AppError('Invalid token. Please login again', 401);
};

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error, send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
            // Programming or other unknown error, don't leak error details
        }
        // 1) log error
        console.log('ERROR ', err);
        // 2) send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
    //rendered website
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message,
        });
        // Programming or other unknown error, don't leak error details
    }
    // 1) log error
    console.log('ERROR ', err);
    // 2) send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.',
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        if (err.name === 'CastError') {
            error = handleCastErrorDb(error);
        }
        if (err.code === 11000) {
            error = handleDuplicateFieldsDb(error);
        }

        if (err.name === 'ValidationError') {
            error = handleValidationErrorDb(error);
        }
        if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }
        sendErrorProd(error, req, res);
    }
};
