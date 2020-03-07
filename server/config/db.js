// call the files
require('../models/user.model');
require('../models/auction.model');
const config = require('../config/config');

// define mongoose
var mongoose = require('mongoose');

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