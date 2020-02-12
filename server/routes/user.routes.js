// get dependencies
const express = require('express'); // call express
const userRouter = express.Router(); // get an instance of express router
const passport = require('passport'); // call passport
const _ = require('lodash'); // call lodash
const bcrypt = require('bcryptjs'); // call bcrypt
const randomString = require('randomstring'); // call randomstring
var nodemailer = require('nodemailer'); // call nodemailer

// get files
const User = require('../models/user.model'); // get User schema
const jwt = require('../config/jwt');

// routes for all user routes
//================================================
// Register route
userRouter.post('/register', (req, res, next) => {

    // Get new user details
    var newUser = new User();
    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.alias = req.body.alias;
    newUser.email = req.body.email;
    newUser.password = req.body.password;
    newUser.type = 'member';

    // Save to the database
    newUser.save((err, doc) => {
        if (!err)
            res.send(doc);
        else
        {
            console.log(err);
            if (err.code == 11000)
                res.status(422).send(['Duplicate email address or alias found.']);
            else
                return next(err);
        }
    });
});

// Add Staff route
userRouter.post('/addStaff', (req, res, next) => {

    // Get new staff details
    var newStaff = new User();
    newStaff.firstName = req.body.firstName;
    newStaff.lastName = req.body.lastName;
    newStaff.alias = req.body.alias;
    newStaff.email = req.body.email;
    newStaff.password = req.body.password;
    newStaff.type = 'staff';

    // Save to the databse
    newStaff.save((err, staff) => {
        if (!err)
            res.send(staff);
        else
        {
            if (err.code == 11000)
                res.status(422).send(['Duplicate email address or alias found.']);
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
                return res.status(200).json({ status: true, user: _.pick(user, ['_id', 'firstName', 'lastName', 'alias', 'email', 'type']) });
        });
});

// Get user by id
userRouter.get('/getUserById/:id', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (user){
            res.send(user);
        }
        else {
            console.log(err);
        }
    });
});

// Edit User
userRouter.put('/editUser', (req, res) => {

    // Get new user details
    var editUser = new User({
        _id: req.body._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        alias: req.body.alias,
    })

    // Find user by id and update
    User.findByIdAndUpdate(req.body._id, { $set: editUser }, { new: true }, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in updating user:' + JSON.stringify(err, undefined, 2)); }
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
                        console.log(user);
                        res.send(user);
                    }
                    else{
                        console.log('Error in updating user:' + JSON.stringify(err, undefined, 2));
                    }
            });
        });
    });
});

// Forgot Password
userRouter.post('/forgotPassword', (req, res) => {

    var code = randomString.generate(5);

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'cas.liveauction@gmail.com',
          pass: 'CUdenver'
        }
    });

    var mailOptions = {
        from: 'cas.liveauction@gmail.com',
        to: req.body.email,
        subject: 'CAS reset password',
        text: 'Enter this code to reset your password: ' + code,
      };

    transporter.sendMail(mailOptions, function(err, info){

        if (err){
            console.log(err);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    })
})
// return the router
module.exports = userRouter;