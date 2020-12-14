const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + (process.env.JWT_EXPIRES + 24 * 60 * 60 * 1000)
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    };

    user.password = undefined;

    res.cookie('jwt', token, cookieOptions).status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const url = `${req.protocol}://${req.get('host')}`;
    await new Email(newUser, `${url}/me`, url).sendWelcome();
    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Nie podano adresu email lub hasła.', 400));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Niepoprawny email lub hasło.', 401));
    }
    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'logedout', {
        expires: Date.now() + 10 * 1000,
    })
        .status(200)
        .json({
            status: 'success',
        });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('Najpierw należy się zalogować.', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(
            new AppError('Niepoprawny token. Zaloguj się jeszcze raz.', 401)
        );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'Hasło zostało zmienione od ostatniego logowania. Zaloguj się ponownie.',
                401
            )
        );
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.restrictToCurrentUser = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('Nie jesteś zalogowany', 404));
    }
    req.userRestriction = {
        id: req.user.id,
        role: req.user.role,
    };
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('Nie masz pozwolenia na wykonanie tej akcji', 403)
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(
            new AppError(
                'Użytkownik z podanym adresem email nie istnieje.',
                404
            )
        );
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    try {
        const url = `${req.protocol}://${req.get('host')}`;
        const resetURL = `${url}/api/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL, url).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message:
                'Na podany adres email został wysłany token do zmiany hasła.',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('Błąd wysyłania emaila.', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Token wygasł bądź jest nieprawidłowy', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    await user.save();
    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = User.findById(req.user.id).select('+password');

    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError('Podano niepoprawne aktualne hasło.', 404));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, req, res);
});
