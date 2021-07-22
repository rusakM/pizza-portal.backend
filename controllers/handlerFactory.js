const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const checkUserRestriction = async (message, Model, req, next) => {
    if (req.user && req.user.role === 'użytkownik') {
        const d = await Model.findById(req.params.id);
        if (`${d.user._id}` !== `${req.user.id}`) {
            return next(new AppError(message, 403));
        }
    }
};

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        await checkUserRestriction(
            'Nie możesz skasować zasobów do których nie masz dostępu',
            Model,
            req,
            next
        );
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        await checkUserRestriction(
            'Nie możesz zmienić zasobów do których nie masz dostępu',
            Model,
            req,
            next
        );
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const newDoc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                data: newDoc,
            },
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        await checkUserRestriction(
            'Nie możesz pobrać zasobów do których nie masz dostępu',
            Model,
            req,
            next
        );
        const query = await Model.findById(req.params.id);
        if (popOptions) {
            query.populate(popOptions);
        }
        const doc = await query;
        if (!doc) {
            return new AppError('No document with that ID', 404);
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        if (req.user && req.user.role === 'użytkownik') {
            req.query.user = req.user.id;
        }
        const features = new APIFeatures(Model.find({}), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const docs = await features.query;

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                data: docs,
            },
        });
    });
