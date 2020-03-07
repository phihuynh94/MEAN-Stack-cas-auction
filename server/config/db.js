// call the files
require('../models/user.model');
require('../models/auction.model');
const config = require('../config/config');

// define mongoose
var mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;

// this fixed an error with mongoose
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

// connect to database
mongoose.connect(config.database,
    // fixed errors with mongoose
    {useNewUrlParser: true, useUnifiedTopology: true},
    (err) => {
    // inform if connection to mongodb successed.
    if (!err) {console.log('MongoDB connection successed.');}
    else {console.log('Error in MongoDB connection: ' + JSON.stringify(err, undefined, 2));}
});

MongoClient.connect(config.database, 
    (err, client) => {
        if (err) {
            console.log('Error with MongoDB Atlas');
        }

        console.log("Connected");

        const collection = client.db('cas-auction').collection('users');

        client.close();
    }
);