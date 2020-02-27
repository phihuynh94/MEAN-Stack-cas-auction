// get dependencies
const express = require('express'); // call express
const itemRouter = express.Router(); // get an instance of express router
const multer = require('multer');   // get multer

// get files
const Auction = require('../models/auction.model'); // get Auction schema
const Item = require('../models/item.model'); // get Item schema

const fileFilter = (req, file, callBack) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      callBack(null, true);
    } else {
      callBack(null, false);
    }
  };

const upload = multer({ dest: 'uploads', fileFilter: fileFilter });

// Upload multiple images
itemRouter.post('/uploadFiles', upload.array('files'), (req, res, next) => {
    console.log(req.files);
    //var files = req.files;
})

// routes for all item routes
//==========================================
// Add item route
itemRouter.post('/addItem', upload.array('images'), (req, res) => {

    // Get item values from the request
    var item = new Item();
    item.auctionID = req.body.auctionID;
    item.itemCode = req.body.itemCode;
    item.itemName = req.body.itemName;
    item.price = req.body.price;
    item.description = req.body.description;
    item.quantity = req.body.quantity;
    item.sellerID = req.body.sellerID;
    item.type = req.body.type;
    
    console.log(req.images);

    // Find the auction to add the item
    Auction.findById(item.auctionID, (err, auction) => {
        // If auction is found
        if (auction) {

            // Generate the item code
            Item.find({ auctionID: item.auctionID, sellerID: item.sellerID },
                (err, items) => {
                    if (items) {
                        if ((items.length + 1) > auction.maxItems){
                            res.send('Max selling items limit reached!');
                        }
                        else {
                            item.itemCode += (items.length + 1);

                             // Save the item to the database
                            item.save((err, item) => {
                                if (!err){
                                    res.send(item);
                                }
                                else {
                                    res.send(err);
                                }
                            });
                        }
                    }
                });
        }
        // Display when no auction is found
        else res.send('No auction found');
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
        if (!err){
            res.send(item);
        } 
        else {
            res.send(err);
        }
    });
});

// Get item by item code
itemRouter.get('/getItemByItemCode/:itemCode', (req, res) => {

    Item.find({ itemCode: req.params.itemCode.toUpperCase() }, 
        (err, item) => {
            if (!err) {
                res.send(item);
            }
            else {
                res.send(err);
            }
        });
});

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
            else { res.send('Error in updating item:' + JSON.stringify(err, undefined, 2)); }
    });
});

// Delete item routes
// Delete item by id on the params
itemRouter.delete('/deleteItemById/:id', (req, res) => {
    Item.findByIdAndDelete(req.params.id, (err, item) => {
        if (!err) { 
            res.send(item);
        }
        else { 
            res.send(err);
        }
    });
});

// Sell item route
itemRouter.post('/sellItem/:id', (req, res) => {

    price = req.body.price;
    buyerID = req.body.buyerID;

    Item.findByIdAndUpdate(req.params.id, { $set: { price: price, buyerID: buyerID }}, (err, item) => {
        if (!err){
            res.send(item);
        }
        else{
            res.send(err);
        }
    })
});

// Get item by buyerID
itemRouter.get('/getBuyerItems/:buyerID', (req, res) => {

    Item.find({ buyerID: req.params.buyerID },
        (err, items) => {
        if (!err) { 
            res.send(items);
        }
        else { 
            res.send(err);
        }
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