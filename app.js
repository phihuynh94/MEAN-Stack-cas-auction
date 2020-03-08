// BASE SETUP
// ======================================

// CALL THE PACKAGES --------------------
const express         = require('express'); // call express
const bodyParser      = require('body-parser'); // call body-parser
const cors            = require('cors'); // call cors
const passport        = require('passport'); // call passport
const path            = require('path'); // call path

// call the files
require('./server/config/db'); // call db.js to connect to mongo
const config = require('./server/config/config'); // get config file
require('./server/config/passport'); // get passport file

// initialize express
const app = express();

// MIDDLEWARE
//==========================================
// body parser middleware
app.use(bodyParser.json());

// cors middleware
app.use(cors());

// passport initialize
app.use(passport.initialize());

// get users routes
const userRoutes = require('./server/routes/user.routes');

// use /users.routes for all users routes
app.use('/user', userRoutes);

// get auction routes
const auctionRoutes = require('./server/routes/auction.routes');

// use /auction.routes for all auction routes
app.use('/auction', auctionRoutes);

// get item routes
const itemRoutes = require('./server/routes/item.routes');

// use /item.routes for all item routes
app.use('/item', itemRoutes);

// error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    }
});

app.use('/', express.static(path.join(__dirname, './angular/dist/angular')));

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, './angular/dist/angular', 'index.html'));
});

// START THE SERVER
//=====================================
app.listen(config.port, () => console.log('Server started at port: ' + config.port));