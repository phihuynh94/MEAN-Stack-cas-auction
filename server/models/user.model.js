// get dependencies
const mongoose = require('mongoose'); // call mongoose
const bcrypt = require('bcryptjs'); // call bcrypt
const jwt = require('jsonwebtoken'); // call jwt

// user schema
var userSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        required: 'First name can\'t be empty'
    },
    lastName: {
        type: String,
        required: 'Last name can\'t be empty'
    },
    alias: {
        type: String,
        required: 'Alias can\'t be empty',
        unique: true,
        minlength: [3, 'Alias must be 3 to 10 characters!'],
        maxlength: [10, 'Alias must be 3 to 10 characters!'],
        uppercase: true,
    },
    email: {
        type: String,
        required: 'Email can\'t be empty',
        unique: true
    },
    password: {
        type: String, 
        required: 'Password can\'t be empty',
        minlength: [6, 'Password must be atleast 6 characters!'],
    },
    address: {
        type: String,
        required: 'Address can\'t be empty',
    },
    phoneNum: {
        type: Number,
        required: 'Phone number can\'t be empty',
        minlength: [10, 'Phone number must be 10 digits!'],
        maxlength: [10, 'Phone number must be 10 digits!'],
    },
    type: {
        type: String,
        required: 'User type can\'t be empty',
    },
    payout: {
        type: Boolean,
        default: false,
    },
    payoutAmount: {
        type: Number,
        default: 0,
    },

    saltSecret: String,
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
});

// Generate salt and hash password
userSchema.pre('save', function(next){
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            next();
        });
    });
});

// Custom validation for email
userSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Custom validation for alias
userSchema.path('alias').validate((val) => {
    aliasRegex = /[A-Za-z]{3}/;
    return aliasRegex.test(val);
}, 'Invalid alias.');

// Verify password method
userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// GenerateJwt method
userSchema.methods.generateJwt = function() {
    return jwt.sign({ _id: this._id },
        process.env.JWT_SECRET || "SECRET#123",
        {
            expiresIn: process.env.JWT_EXP || "120m"
        });
};

// create User model schema
module.exports = mongoose.model('User', userSchema);