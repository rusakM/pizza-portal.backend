/* eslint-disable no-restricted-syntax */
const Stripe = require('stripe');

const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const BookingStatus = require('../models/bookingStatusModel');

const itemCategories = ['pizzas', 'ownPizzas', 'drinks', 'sauces'];

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.newBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.create(req.body);

    if (req.user.role === 'użytkownik') {
        const url = `${req.protocol}://${req
            .get('host')
            .replace(
                `:${process.env.PORT}`,
                `:${process.env.WEBPAGE_PORT}`
            )}/myAccount/orders/${booking._id}`;
        const backendUrl = `${req.protocol}://${req.get('host')}`;
        await new Email(req.user, url, backendUrl).sendBooking(booking._id);
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: booking,
        },
    });
});

exports.saveBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.create(req.body);

    if (!booking) {
        return next(
            new AppError(
                'Błąd podczas składania zamówienia. Spróbuj ponownie.',
                404
            )
        );
    }
    req.booking = booking;
    return next();
});

exports.populateBooking = catchAsync(async (req, res, next) => {
    const { _doc } = await Booking.findById(req.booking._id);
    if (!_doc) {
        return next(new AppError('Błąd przetwarzania zamówienia', 404));
    }

    req.booking = _doc;

    next();
});

exports.mapBooking = (req, res, next) => {
    const { body } = req;
    const mappedBooking = { ...req.booking };
    // mapping counts
    for (const category of itemCategories) {
        if (body[category] && body[category].length > 0) {
            const itemsSet = [...new Set(body[category])];
            mappedBooking[category] = itemsSet.map((item) => {
                const filtered = mappedBooking[category].filter(({ _id }) => {
                    return `${item}` === `${_id}`;
                });
                return {
                    ...filtered[0]._doc,
                    quantity: filtered.length,
                    amount: Math.floor(filtered[0]._doc.price * 100),
                    totalAmount: Math.floor(
                        filtered[0]._doc.price * filtered.length
                    ),
                };
            });
        }
    }
    //mapping pizzas
    if (mappedBooking.pizzas && mappedBooking.pizzas.length > 0) {
        mappedBooking.pizzas = mappedBooking.pizzas.map((pizza) => {
            const templates = mappedBooking.templates.filter(
                ({ smallPizza, mediumPizza, largePizza }) => {
                    return (
                        `${smallPizza._id}` === `${pizza._id}` ||
                        `${mediumPizza._id}` === `${pizza._id}` ||
                        `${largePizza._id}` === `${pizza._id}`
                    );
                }
            );
            return {
                ...pizza,
                name: `${templates[0]._doc.name} ${pizza.size} cm`,
            };
        });
    }

    //mapping ownPizzasNames

    if (mappedBooking.ownPizzas && mappedBooking.ownPizzas.length > 0) {
        mappedBooking.ownPizzas = mappedBooking.ownPizzas.map((pizza) => {
            return {
                ...pizza,
                name: `Pizza własna ${pizza.size} cm`,
            };
        });
    }

    req.mappedBooking = mappedBooking;
    next();
};

exports.mapPizzaDescriptions = (req, res, next) => {
    if (req.user.role !== 'użytkownik') {
        return next();
    }

    const { mappedBooking } = req;
    //mapping pizzas
    if (mappedBooking.pizzas && mappedBooking.pizzas.length > 0) {
        mappedBooking.pizzas = mappedBooking.pizzas.map((pizza) => {
            let description = 'pomidory, mozzarella, oregano';
            if (pizza.ingredients.length > 0) {
                description += ', ';
                description += pizza.ingredients
                    .map(({ _doc: name }) => name)
                    .reduce((total, val) => total + ', ' + val);
            }
            return {
                ...pizza,
                description,
            };
        });
    }

    //mapping ownPizzas
    if (mappedBooking.ownPizzas && mappedBooking.ownPizzas.length > 0) {
        mappedBooking.ownPizzas = mappedBooking.ownPizzas.map((pizza) => {
            let description = 'pomidory, mozzarella, oregano';
            if (pizza.ingredients.length > 0) {
                description += ', ';
                description += pizza.ingredients
                    .map(({ _doc: name }) => name)
                    .reduce((total, val) => total + ', ' + val);
            }
            return {
                ...pizza,
                description,
            };
        });
    }

    req.mappedBooking = mappedBooking;
    next();
};

exports.sendEmail = catchAsync(async (req, res, next) => {
    if (req.user.role === 'użytkownik') {
        const url = `${req.protocol}://${process.env.WEBPAGE_DOMAIN}${
            process.env.WEBPAGE_PORT ? `:${process.env.WEBPAGE_PORT}` : ''
        }/myAccount/orders/${req.mappedBooking._id}`;
        const backendUrl = `${req.protocol}://${req.get('host')}`;
        await new Email(req.user, url, backendUrl).sendBooking(
            req.mappedBooking
        );
    }

    next();
});

exports.generateInvoice = (req, res, next) => {
    next();
};

exports.processBooking = (req, res, next) => {
    if (req.booking.isPayNow && !req.booking.paid) {
        return next();
    }

    return res.status(201).json({
        status: 'success',
        data: {
            data: req.booking,
        },
    });
};

exports.mapBookingForPaymentSession = (req, res, next) => {
    /*
    {
        name,
        currency,
        quantity,
        amount
    }
    */
    const lineItems = [];
    const { mappedBooking } = req;
    for (const category of itemCategories) {
        if (mappedBooking[category] && mappedBooking[category].length > 0) {
            mappedBooking[category].forEach(({ name, quantity, amount }) => {
                lineItems.push({
                    name,
                    currency: 'PLN',
                    quantity,
                    amount,
                });
            });
        }
    }

    req.lineItems = lineItems;
    next();
};

exports.createPaymentSession = catchAsync(async (req, res, next) => {
    const { lineItems } = req;
    const stripe = Stripe(process.env.STRIPE_API_KEY);

    //create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'p24'],
        success_url: `${req.protocol}://${process.env.WEBPAGE_DOMAIN}${
            process.env.WEBPAGE_PORT ? `:${process.env.WEBPAGE_PORT}` : ''
        }/booking-complete/${req.mappedBooking._id}`,
        cancel_url: `${req.protocol}://${process.env.WEBPAGE_DOMAIN}${
            process.env.WEBPAGE_PORT ? `:${process.env.WEBPAGE_PORT}` : ''
        }`,
        customer_email: req.user.email,
        client_reference_id: `${req.mappedBooking._id}`,
        mode: 'payment',
        line_items: lineItems,
    });
    res.status(200).json({
        status: 'success',
        session,
    });
});

exports.preventBooking = (req, res, next) => {
    if (req.body.paid && req.body.isFinished) {
        return next(
            new AppError(
                'Nie można jednocześnie opłacić i zakończyć zamówienia',
                404
            )
        );
    }
    next();
};

exports.payBooking = catchAsync(async (req, res, next) => {
    if (req.body.paid) {
        await BookingStatus.create({
            booking: req.params.id,
            description: 'Zamówienie opłacone',
        });
        if (req.user.role === 'użytkownik') {
            const { _doc } = await Booking.findById(req.params.id);
            const url = `${req.protocol}://${process.env.WEBPAGE_DOMAIN}${
                process.env.WEBPAGE_PORT ? `:${process.env.WEBPAGE_PORT}` : ''
            }/myAccount/orders/${req.params.id}`;
            const backendUrl = `${req.protocol}://${req.get('host')}`;
            await new Email(req.user, url, backendUrl).sendBookingPaid(_doc);
        }
    }

    return next();
});

exports.finishBooking = catchAsync(async (req, res, next) => {
    if (req.body.isFinished) {
        await BookingStatus.create({
            booking: req.params.id,
            description: 'Zamówienie odebrane',
        });
    }

    return next();
});
