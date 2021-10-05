/* eslint-disable no-restricted-syntax */
const Stripe = require('stripe');

const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const BookingStatus = require('../models/bookingStatusModel');
const BOOKING_STATUSES = require('../utils/bookingStatuses');
const { resetPassword } = require('./authController');

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
    const doc = await Booking.findById(req.booking._id);
    if (!doc) {
        return next(new AppError('Błąd przetwarzania zamówienia', 404));
    }

    req.booking = doc.toObject();

    next();
});

exports.mapBooking = (req, res, next) => {
    const mappedBooking = { ...req.booking };

    // mapping counts
    for (const category of itemCategories) {
        if (mappedBooking[category] && mappedBooking[category].length > 0) {
            // get list of ids items of current category
            const listOfIds = mappedBooking[category].map(
                ({ _id }) => `${_id}`
            );
            //create set of ids
            const itemsSet = [...new Set(listOfIds)];

            mappedBooking[category] = itemsSet.map((item) => {
                const filtered = mappedBooking[category].filter(({ _id }) => {
                    return `${item}` === `${_id}`;
                });
                return {
                    ...filtered[0],
                    quantity: filtered.length,
                    amount: Math.floor(filtered[0].price * 100),
                    totalAmount:
                        Math.floor(filtered[0].price * filtered.length * 100) /
                        100,
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
                name: `${templates[0].name} ${pizza.size} cm`,
                coverPhoto: templates[0].coverPhoto,
                slug: templates[0].slug,
                templateId: templates[0]._id,
                templateCounter: templates[0].counter,
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
    // if (req.user.role !== 'użytkownik') {
    //     return next();
    // }

    const { mappedBooking } = req;
    //mapping pizzas
    if (mappedBooking.pizzas && mappedBooking.pizzas.length > 0) {
        mappedBooking.pizzas = mappedBooking.pizzas.map((pizza) => {
            let description = 'pomidory, mozzarella, oregano';
            if (pizza.ingredients && pizza.ingredients.length > 0) {
                description += ', ';
                description += pizza.ingredients
                    .map(({ name }) => name)
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
                    .map(({ name }) => name)
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

exports.emitBookingToSockets = (req, res, next) => {
    console.log(req.user.role);
    if (req.user.role === 'użytkownik') {
        req.app.get('io').emit('booking', req.booking);
    }
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
            description: BOOKING_STATUSES.paid,
        });
        if (req.user.role === 'użytkownik') {
            const doc = await Booking.findById(req.params.id);
            const url = `${req.protocol}://${process.env.WEBPAGE_DOMAIN}${
                process.env.WEBPAGE_PORT ? `:${process.env.WEBPAGE_PORT}` : ''
            }/myAccount/orders/${req.params.id}`;
            const backendUrl = `${req.protocol}://${req.get('host')}`;
            await new Email(req.user, url, backendUrl).sendBookingPaid(
                doc.toObject()
            );
        }
    }

    return next();
});

exports.finishBooking = catchAsync(async (req, res, next) => {
    if (req.body.isFinished) {
        await BookingStatus.create({
            booking: req.params.id,
            description: BOOKING_STATUSES.done,
        });
    }

    return next();
});

exports.getOneBooking = catchAsync(async (req, res, next) => {
    const doc = await Booking.findById(req.params.id);

    if (!doc) {
        return next(new AppError('Błąd pobierania zamówienia', 404));
    }

    req.booking = doc.toObject();

    next();
});

exports.sendMappedBooking = (req, res, next) => {
    if (req.mappedBooking) {
        return res.status(200).json({
            status: 'success',
            data: {
                data: req.mappedBooking,
            },
        });
    }
    next(new AppError('Nie udało się wczytać zamówienia', 404));
};

const projectAggregatedBookings = [
    {
        $project: {
            _id: 1,
            paid: 1,
            price: 1,
            createdAt: 1,
            isWithDelivery: 1,
            isPayNow: 1,
            isTakeAway: 1,
            isFinished: 1,
            user: {
                _id: 1,
                email: 1,
                name: 1,
                role: 1,
                photo: 1,
            },
            barcode: 1,
            descriptions: 1,
            submit: 1,
            inProcess: 1,
            shipping: 1,
            ready: 1,
            done: 1,
            cancel: 1,
        },
    },
    {
        $unwind: '$user',
    },
];

const sortAggregatedBookings = {
    $sort: { createdAt: 1 },
};

const defaultAggregation = [
    {
        $lookup: {
            from: 'bookingstatuses',
            localField: '_id',
            foreignField: 'booking',
            as: 'statuses',
        },
    },
    {
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'agUser',
        },
    },
    {
        $set: {
            statusCount: { $size: '$statuses' },
            descriptions: {
                $map: {
                    input: '$statuses',
                    as: 'description',
                    in: '$$description.description',
                },
            },
            user: '$agUser',
        },
    },
    {
        $set: {
            submit: {
                $in: [BOOKING_STATUSES.submit, '$descriptions'],
            },
            isPaid: {
                $in: [BOOKING_STATUSES.paid, '$descriptions'],
            },
            inProcess: {
                $in: [BOOKING_STATUSES.inProcess, '$descriptions'],
            },
            shipping: {
                $in: [BOOKING_STATUSES.shipping, '$descriptions'],
            },
            ready: {
                $in: [BOOKING_STATUSES.ready, '$descriptions'],
            },
            done: {
                $in: [BOOKING_STATUSES.done, '$descriptions'],
            },
            cancel: {
                $in: [BOOKING_STATUSES.cancel, '$descriptions'],
            },
        },
    },
];

exports.getUnapprovedOrders = catchAsync(async (req, res, next) => {
    const list = await Booking.aggregate([
        ...defaultAggregation,
        {
            $match: {
                $and: [
                    { submit: true },
                    { isPaid: true },
                    { inProcess: false },
                    { shipping: false },
                    { ready: false },
                    { done: false },
                    { cancel: false },
                ],
            },
        },
        ...projectAggregatedBookings,
        sortAggregatedBookings,
    ])
        .skip(req.query.skip * 1 || 0)
        .limit(25);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            data: list,
        },
    });
});

exports.getUnpaidOrders = catchAsync(async (req, res, next) => {
    const list = await Booking.aggregate([
        ...defaultAggregation,
        {
            $match: {
                $and: [
                    { submit: true },
                    { isPaid: false },
                    { inProcess: false },
                    { shipping: false },
                    { ready: false },
                    { done: false },
                    { cancel: false },
                ],
            },
        },
        ...projectAggregatedBookings,
        sortAggregatedBookings,
    ])
        .skip(req.query.skip * 1 || 0)
        .limit(25);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            data: list,
        },
    });
});

exports.getPendingOrders = catchAsync(async (req, res, next) => {
    const list = await Booking.aggregate([
        ...defaultAggregation,
        {
            $match: {
                $and: [
                    { submit: true },
                    { isPaid: true },
                    { inProcess: true },
                    { shipping: false },
                    { ready: false },
                    { done: false },
                    { cancel: false },
                ],
            },
        },
        ...projectAggregatedBookings,
        sortAggregatedBookings,
    ])
        .skip(req.query.skip * 1 || 0)
        .limit(25);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            data: list,
        },
    });
});

exports.getShippingOrders = catchAsync(async (req, res, next) => {
    const shipping = Boolean(req.query.shipping);
    const list = await Booking.aggregate([
        ...defaultAggregation,
        {
            $match: {
                $and: [
                    { submit: true },
                    { isPaid: true },
                    { inProcess: true },
                    { isWithDelivery: true },
                    { shipping },
                ],
            },
        },
        ...projectAggregatedBookings,
        sortAggregatedBookings,
    ])
        .skip(req.query.skip * 1 || 0)
        .limit(25);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            data: list,
        },
    });
});

exports.getDoneOrders = catchAsync(async (req, res, next) => {
    const list = await Booking.aggregate([
        ...defaultAggregation,
        {
            $match: {
                $and: [
                    { submit: true },
                    { isPaid: true },
                    { inProcess: true },
                    { done: true },
                ],
            },
        },
        ...projectAggregatedBookings,
        {
            $sort: { createdAt: -1 },
        },
    ])
        .skip(req.query.skip || 0)
        .limit(25);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            data: list,
        },
    });
});

exports.getReadyOrders = catchAsync(async (req, res, next) => {
    const list = await Booking.aggregate([
        ...defaultAggregation,
        {
            $match: {
                $and: [
                    { submit: true },
                    { isPaid: true },
                    { inProcess: true },
                    { ready: true },
                    { done: false },
                ],
            },
        },
        ...projectAggregatedBookings,
        sortAggregatedBookings,
    ])
        .skip(req.query.skip * 1 || 0)
        .limit(25);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            data: list,
        },
    });
});

exports.getCanceledBookings = catchAsync(async (req, res, next) => {
    const list = await Booking.aggregate([
        ...defaultAggregation,
        {
            $match: {
                cancel: true,
            },
        },
        ...projectAggregatedBookings,
        {
            $sort: { createdAt: -1 },
        },
    ])
        .skip(req.query.skip * 1 || 0)
        .limit(25);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            data: list,
        },
    });
});

exports.getAllAggregatedBookings = catchAsync(async (req, res, next) => {
    const list = await Booking.aggregate([
        ...defaultAggregation,
        ...projectAggregatedBookings,
        {
            $sort: { createdAt: -1 },
        },
    ])
        .skip(req.query.skip * 1 || 0)
        .limit(25);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            data: list,
        },
    });
});

exports.test = catchAsync(async (req, res, next) => {
    const list = await Booking.aggregate([
        ...defaultAggregation,
        ...projectAggregatedBookings,
        sortAggregatedBookings,
    ]);

    res.status(200).json({
        status: 'success',
        results: list.length,
        data: {
            data: list,
        },
    });
});
