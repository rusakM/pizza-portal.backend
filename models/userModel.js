const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Podaj swoje imię'],
    },
    email: {
        type: String,
        required: [true, 'Nie podano adresu email'],
        unique: true,
        lowercase: true,
        validate: [
            validator.isEmail,
            'Niepoprawny adres email, spróbuj ponownie',
        ],
    },
    photo: {
        type: String,
        default: 'default.png',
    },
    role: {
        type: String,
        enum: ['użytkownik', 'kucharz', 'admin'],
        default: 'użytkownik',
    },
    password: {
        type: String,
        required: [true, 'Musisz podać hasło'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Proszę, potwierdź swoje hasło'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Podane hasła nie sa takie same',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

// this method will run before saving document in dbs
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    //hash the password
    this.password = await bcrypt.hash(this.password, 10);
    //delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// this method will run before searching in dbs, to filter out unactive users
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

// this method will save timestamp for changing password
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// this method compares given password with password in db when the user wants to log in
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// this method will check if the password was changed after generate the token
// which was sent by user, it prevents to log in with old password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    // false means that password wasn't changed
    return false;
};

// this method generate token to change password, new token expires in 30 mins
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 30 * 60 * 1000;

    return resetToken;
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
