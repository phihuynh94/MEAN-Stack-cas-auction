// get dependencies
const mongoose = require('mongoose'); // call mongoose

// items schema
var itemSchema = new mongoose.Schema({
    auctionID: {
        type: String,
        required: 'Auction id can\'t be empty'
    },
    itemCode: {
        type: String,
        require: 'Item code can\'t be empty',
        unique: true,
    },
    itemName: {
        type: String,
        required: 'Item name can\'t be empty'
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    quantity: {
        type: Number,
        require: 'Quantity can\'t be empty or lesser than 1',
        min: 1,
    },
    sellerID: {
        type: String,
        require: 'Seller id can\'t be empty'
    },
    buyerID: {
        type: String
    },
    type: {
        type: String,
        require: 'Item type can\'t be empty'
    },
    images: [{
        type: String,
        max: [5, 'Max 5 images']
    }],
    paid: {
        type: Boolean,
        default: false,
    },
    payout: {
        type: Boolean,
        default: false,
    }
});

// create Inventory model schema
module.exports = mongoose.model('Item', itemSchema);