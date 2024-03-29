const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const supplyRouter = require('./routes/supplyRouter');
const pizzaRouter = require('./routes/pizzaRouter');
const userRouter = require('./routes/userRouter');
const messageRouter = require('./routes/messageRouter');
const productRouter = require('./routes/productRouter');
const bookingRouter = require('./routes/bookingRouter');
const addressRouter = require('./routes/addressRouter');
const bookingStatusRouter = require('./routes/bookingStatusRouter');

const errorHandler = require('./controllers/errorController');

const app = express();

// 1) global middlewares

//use cors

const corsSetup = {
    origin: function (origin, cb) {
        const whitelist = process.env.CORS_ORIGINS.split(';') || '*';
        if (!origin || whitelist.indexOf(origin) !== -1) {
            cb(null, true);
        } else {
            cb(new Error('Dostęp z niezaufanej witryny został zablokowany'));
        }
    },
};

app.use(cors(corsSetup));

// app.use(
//     cors({
//         origin: process.env.CORS_ORIGINS.split(';'),
//     })
// );

//use parameter pollution protection
app.use(hpp());

app.options('*', cors());

//serving static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//set security http headers
app.use(helmet());

//limit requests from the same ip
const limiter = rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

//body parser, reading data from body into req.body
app.use(
    express.json({
        limit: '10kb',
    })
);
app.use(
    express.urlencoded({
        extended: true,
        limit: '10kb',
    })
);
app.use(cookieParser());

// data sanitization against nosql query injection
app.use(mongoSanitize());

//data sanitization agains XSS
app.use(xss());

//use compression data
app.use(compression());

//add request time to req
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 2) ROUTES

app.use('/api/supplies', supplyRouter);
app.use('/api/pizzas', pizzaRouter);
app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);
app.use('/api/products', productRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/address', addressRouter);
app.use('/api/bookingStatuses', bookingStatusRouter);

app.use(errorHandler);
module.exports = app;
