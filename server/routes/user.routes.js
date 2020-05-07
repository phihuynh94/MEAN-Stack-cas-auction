// get dependencies
const express = require('express'); // call express
const userRouter = express.Router(); // get an instance of express router
const passport = require('passport'); // call passport
const _ = require('lodash'); // call lodash
const bcrypt = require('bcryptjs'); // call bcrypt
const nodemailer = require('nodemailer'); // call nodemailer

// get files
const User = require('../models/user.model'); // get User schema
const jwt = require('../config/jwt');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'cas.liveauction@gmail.com',
      pass: process.env.GOOGLE_PASS,
    }
});

// routes for all user routes
//================================================
// Register route
userRouter.post('/register', (req, res, next) => {

    // Get new user details
    var newUser = new User();
    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.alias = req.body.alias;
    newUser.email = req.body.email.toLowerCase();
    newUser.password = req.body.password;
    newUser.address = req.body.address;
    newUser.phoneNum = req.body.phoneNum;
    newUser.type = req.body.type;

    // Save to the database
    newUser.save((err, user) => {
        if (user)
            // Send the user info through response
            res.send(user);
        else
        {
            // If there is a duplicate error
            if (err.code == 11000) {

                if (err.keyPattern.email){
                    res.status(422).send(['Duplicate email address found.']);
                }
               else {
                    res.status(422).send(['Duplicate alias found.']);
               }

            }
            else
                return next(err);
        }
    });
});

// Authenticate
userRouter.post('/authenticate', (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {
        
        // error from passport middleware
        if (err)
            return res.status(400).json(err);
        // registered user
        else if (user)
            return res.status(200).json({ "token": user.generateJwt() });
        // unknown user or wrong password
        else
        return res.status(404).json(info);
    })
    (req, res)
});

// Dashboard
userRouter.get('/dashboard', jwt.verifyJwtToken, (req, res, next) => {
    User.findOne({ _id: req._id },
        (err, user) => {
            if (!user)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else
                return res.status(200).json({ status: true, user: _.pick(user, ['_id', 'firstName', 'lastName', 'alias', 'email', 'address', 'phoneNum', 'type', 'payout', 'payoutAmount']) });
        });
});

// Get user by id
userRouter.get('/getUserById/:id', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (!err){
            res.send(user);
        }
        else {
            res.send(err);
        }
    });
});

// Edit User
userRouter.put('/editUser', (req, res) => {

    req.body.payout;
    
    // Get new user details
    var editUser = new User({
        _id: req.body._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        alias: req.body.alias,
        email: req.body.email,
        address: req.body.address,
        phoneNum: req.body.phoneNum,
        type: req.body.type,
        payout: req.body.payout,
        payoutAmount: req.body.payoutAmount,
    })

    // Find user by id and update
    User.findByIdAndUpdate(req.body._id, { $set: editUser }, { new: true }, (err, user) => {
        if (!err) { res.send(user); }
        else { 
            res.send('Alias already taken.');
        }
    });
});

// Change password
userRouter.put('/changePassword/:token', jwt.verifyJwtToken, (req, res, next) => {

    var newPassword = req.body.newPassword;

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newPassword, salt, (err, hash) => {
            this.newPassword = hash;
            this.saltSecret = salt;

            User.findOneAndUpdate({ _id: req._id }, { $set: { password: this.newPassword, saltSecret: this.saltSecret }}, { new: true},
                (err, user) => {
                    if (!err){
                        res.send(user);
                    }
            });
        });
    });
});

// Forgot Password
userRouter.post('/forgotPassword', (req, res) => {

    userEmail = req.body.email;

    User.findOne({ email: userEmail },
        (err, user) => {
            if (user) {
                token = user.generateJwt();
                dateTime = new Date();

                User.findOneAndUpdate({ email: userEmail},
                    {$set: { resetPasswordToken: token, resetPasswordTokenExpire: dateTime}}, {new: true},
                    (err, user) => {
                        if (user){
                            
                            var mailOptions = {
                                from: 'cas.liveauction@gmail.com',
                                to: userEmail,
                                subject: 'CAS reset password',
                                text: 'Click the link to reset password ' + "http://localhost:4200/user/resetPassword/" + token,
                            };

                            transporter.sendMail(mailOptions, function(err, info){
                                if (err){
                                    return res.status(404).json({ status: false, message: 'Could not send email' });
                                }
                                else {
                                    return res.status(200).json({ message: 'Email Sent' });
                                }
                            });
                        }
                        else {
                            res.send(err);
                        }
                });
            }
            else {
                return res.status(404).json({ status: false, message: 'Email not found.' });
            }
    });
});

// Reset password
userRouter.put('/resetPassword/:token', (req, res, next) => {
    
    var token = req.params.token;

    User.findOne({resetPasswordToken: token}, (err, user) => {
        if (user){
            var time = Math.abs(user.resetPasswordTokenExpire - new Date())/3600000;

            if(time < 1){
                
                var password;
                var saltSecret;
                
                //bcrypt password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                        password = hash;
                        saltSecret = salt;

                        User.findOneAndUpdate({ "email": user.email }, { $set: { "password": password, "saltSecret": saltSecret, "resetPasswordToken": null, "resetPasswordTokenExpire": null} }, { new: true },
                            (err, user) => {
                                if (!user) {
                                    return res.status(404).json({ "message": "Password change was unsuccessfull" })
                                } else {
                                    return res.status(200).json({ "message": "Password changed" });
                                }
                            })
                    });
                });
            }
            else{
                return res.status(404).json({ status: false, message: 'Reset time has expired.' });
            }
        }
        else {
            return res.status(404).json({ status: false, message: 'User record not found.' });
        }
    });
});

// Find all users
userRouter.get('/getUsers', (req, res) => {
    User.find((err, users) => {
        if (users){
            res.send(users);
        }
        else {
            res.send(err);
        }
    })
});

// Delete user by id
userRouter.delete('/deleteUser/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id, (err, user) => {
        if (user) {
            res.send(user);
        }
        else {
            res.send(err);
        }
    })
});

// Get user by alias
userRouter.get('/getUserByAlias/:alias', (req, res) => {
    User.findOne({ alias: req.params.alias.toUpperCase() }, (err, user) => {
        if (user){
            res.send(user);
        }
        else {
            res.send(err);
        }
    })
});

userRouter.post('/sendPaymentInfo', (req, res) => {
    user = req.body.user;
    buyingItems = req.body.buyingItems;
    sellingItems = req.body.sellingItems;
    buyingAmount = req.body.buyingAmount;
    sellingAmount = req.body.sellingAmount;
    commission = req.body.commission;
    fee = req.body.fee;
    purchaseAmount = req.body.purchaseAmount;
    payoutAmount = req.body.payoutAmount;

    var emailText = '';
    
    if (buyingItems[0] != null){
        emailText += '<container><table style="border:solid;" cellpadding="30"><thead><tr><th style="border:solid;">Buying Items</th>' +
        '<th style="border:solid;">Item Code</th><th style="border:solid;">Price</th></tr></thead><tbody>';

        for (buyingItem of buyingItems){
            emailText = emailText + '<tr><td style="text-align:center;">' + buyingItem.itemName + 
            '</td><td style="text-align:center;">' + buyingItem.itemCode + '</td><td style="text-align:center">$' + buyingItem.price.toFixed(2) + '</td></tr>';
        }

        emailText += '</tbody></table><container><br><br>';
    }
    
    if (sellingItems[0] != null){
        emailText += '<table style="border:solid;" cellpadding="30"><thead><tr><th style="border:solid;">Selling Items</th>' +
        '<th style="border:solid;">Item Code</th><th style="border:solid;">Price</th></tr></thead><tbody>';

        for (sellingItem of sellingItems){
            if (sellingItem.price > 0){
                emailText = emailText + '<tr><td style="text-align:center;">' + sellingItem.itemName + 
                '</td><td style="text-align:center;">' + sellingItem.itemCode + '</td><td style="text-align:center">$' + sellingItem.price.toFixed(2) + '</td></tr>';
            }
        }

        emailText += '</tbody></table><br><br>Buying amount: $' + buyingAmount.toFixed(2) + '<br>Selling amount: $' + sellingAmount.toFixed(2) +
        '<br>Fee: $' + fee.toFixed(2) + '<br>Commission: $' + commission.toFixed(2) + '<br><br>';

    }    

    if (purchaseAmount > 0){
        emailText += 'Purchase amount: $' + purchaseAmount.toFixed(2);
    }
    else if (payoutAmount > 0){
        emailText += 'Payout amount: $' + payoutAmount.toFixed(2);
    }

    var mailOptions = {
        from: 'cas.liveauction@gmail.com',
        to: user.email,
        subject: 'CAS payment information',
        html: 'Hi ' + user.firstName + ',<br><br>Here is the payment information from the Colorado Aquarium Society auction:<br><br>' + emailText +
        '<br><br>Thank you for participating in our auction!<br><br>The Colorado Aquarium Society club.',
    };

    transporter.sendMail(mailOptions, function(err, info){
        if (err){
            return res.status(404).json({ status: false, message: 'coudld not send email' });
        }
        else {
            console.log('Email sent: ' + info.response);
            return res.status(200).json({ "message": "sent" });
        }
    });
});

// return the router
module.exports = userRouter;
