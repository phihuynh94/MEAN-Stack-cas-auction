// get dependencies
const mongoose = require('mongoose'); // call mongoose

// auction schema
var auctionSchema = new mongoose.Schema({
    auctionName: {
        type: String,
        required: 'Auction name can\'t be empty',
        unique: true
    },
    maxItems: {
        type: Number,
        required: 'Need at least one item'
    },
    address: {
        type: String,
        required: 'Address can\'t be empty' 
    },
    dateTime: {
        type: Date,
        required: 'Date and Time can\'t be empty'
    },
    fee: {
        type: Number
    },
    participantID: [{
        type: String,
    }],
    unorderList: [{
        type: String,
    }],
    orderedList: [{
        type: String,
    }],
    images: [{
        type: String,
    }],
});

// create Auction model schema
module.exports = mongoose.model('Auction', auctionSchema);