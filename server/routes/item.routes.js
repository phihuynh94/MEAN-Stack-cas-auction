// get dependencies
const express = require('express'); // call express
const itemRouter = express.Router(); // get an instance of express router

// get files
const Auction = require('../models/auction.model'); // get Auction schema
const Item = require('../models/item.model'); // get Item schema

// routes for all item routes
//==========================================
// Add item route
itemRouter.post('/addItem', (req, res) => {

    // Get item values from the request
    var item = new Item();
    item.auctionID = req.body.auctionID;
    item.itemCode = req.body.itemCode;
    item.itemName = req.body.itemName;
    item.description = req.body.description;
    item.quantity = req.body.quantity;
    item.sellerID = req.body.sellerID;

    // Find the auction to add the item
    Auction.findById(item.auctionID, (err, auction) => {

        // If auction is found
        if (auction) {

            // If quantity of the item is more than the max items allow
            if (item.quantity > auction.maxItems){
                res.write('Quantity is more than max items allow');
                console.log('Quantity is more than max items allow');
            }
            // Save the item to the database
            else { 
                item.save((err, item) => {
                    if (!err){
                        res.send(item);
                    }
                    else {
                        res.send(err);
                        console.log(err);
                    }
                })
            }
        }
        // Display when no auction is found
        else console.log('No auction found');
    });
});

// Find item routes
// Find all items in database route
// itemRouter.get('/findAllItems', (req, res) => {
//     Item.find(
//         (err, item) => {
//         if (!err) res.send(item);
//         else res.send(err);
//     });
// });

// Find all items in an Auction route
itemRouter.get('/findItemsInAuction/:auctionID', (req, res) => {
    Item.find({ auctionID: req.params.auctionID },
        (err, item) => {
        if (!err) res.send(item);
        else res.send(err);
    });
});

// Find item by name route
// itemRouter.get('/findItem', (req, res) => {
//     Item.find({ itemName: req.body.itemName }, 
//         (err, item) => {
//             if (item) {
//                 res.send(item);
//             }
//             else {
//                 res.send('No item found');
//             }
//         });
// });

// Edit item route
itemRouter.put('/editItem', (req, res) => {

    // Get new edit item info
    var editItem = new Item({
        _id: req.body._id,
        itemName: req.body.itemName,
        itemCode: req.body.itemCode,
        quantity: req.body.quantity,
        description: req.body.description,
    });

    Item.findByIdAndUpdate(req.body._id, { $set: editItem }, { new: true },
        (err, editedItem) => {
            if (!err) { res.send(editedItem); }
            else { res.send('Error in updating auction :' + JSON.stringify(err, undefined, 2)); }
    });
});

// Delete item routes
// Delete item by id on the params
// itemRouter.delete('/deleteItem/:id', (req, res) => {
//     Item.findByIdAndDelete(req.params.id, (err, item) => {
//         if (!err) { res.send(item);}
//         else { res.send(err);}
//     });
// });

// Sell item route
itemRouter.post('/sellItem/:id', (req, res) => {

    price = req.body.price;
    buyerID = req.body.buyerID;

    Item.findByIdAndUpdate(req.params.id, { $set: { price: price, buyerID: buyerID }}, (err, item) => {
        if (item){
            res.send(item);
        }
        else{
            res.send(err);
        }
    })
});

// Get item by buyer route
itemRouter.get('/getBuyerItems/:buyerID', (req, res) => {

    Item.find({ buyerID: req.params.buyerID },
        (err, items) => {
        if (!err) { 
            res.send(items);
        }
        else { res.send(err);}
    });
});

// Get sellers items in an auction
itemRouter.post('/getSellerItemsInAuction/', (req, res) => {

    Item.find({ sellerID: req.body.sellerID, auctionID: req.body.auctionID }, (err, items) => {
        if (!err){
            res.send(items);
        }
        else {
            res.send(err);
        }
    });
});

// Get item info by id
itemRouter.get('/getItemInfoById/:id', (req, res) => {

    Item.findById(req.params.id, (err, item) => {
        if (!err){
            res.send(item);
        }
        else {
            res.send(err);
        }
    })
});

// return the router
module.exports = itemRouter;