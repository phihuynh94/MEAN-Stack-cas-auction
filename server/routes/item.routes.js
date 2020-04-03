// get dependencies
const express = require('express'); // call express
const itemRouter = express.Router(); // get an instance of express router
const multer = require('multer');   // get multer
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const config = require('../config/config');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');

const connection = mongoose.createConnection(config.database);

// Init gfs
let gfs;

connection.once('open', () => {
  // Init stream
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection('images');
});

// get files
const Auction = require('../models/auction.model'); // get Auction schema
const Item = require('../models/item.model'); // get Item schema

// storage location and file name for upload images
const storage = new GridFsStorage({
    url: config.database,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
            if (err) {
              return reject(err);
            }
            const filename = file.originalname;
            const fileInfo = {
              filename: filename,
              bucketName: 'images'
            };
            resolve(fileInfo);
          });
        });
    },
});

// file filter for upload images
const fileFilter = (req, file, callBack) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      callBack(null, true);
    } else {
      callBack(null, false);
    }
  };

// set upload storage and file filter
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    // limits: { fileSize: 10 }
});

// upload images route
itemRouter.post('/uploadImages', upload.array('images', 5), (req, res) => {});

itemRouter.get('/getItemImages/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
            err: 'No file exists'
          });
        }
    
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            console.log("not an image")
            res.status(404).json({
            err: 'Not an image'
          });
        }
      });
});

// routes for all item routes
//==========================================
// Add item route
itemRouter.post('/addItem', (req, res) => {

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
    item.images = req.body.images
    
    // Find the auction to add the item
    Auction.findById(item.auctionID, (err, auction) => {
        // If auction is found
        if (auction) {

            if (item.type == 'auction'){
                auction.updateOne({ $addToSet: { unorderList: item.id }}, (err, auction) => {});
            }
            
            // Generate the item code
            Item.find({ auctionID: item.auctionID, sellerID: item.sellerID },
                (err, items) => {
                    if (items) {
                        if ((items.length + 1) > auction.maxItems){
                            res.send('Max selling items limit reached!');
                        }
                        else {

                             // Save the item to the database
                            item.save((err, item) => {
                                if (!err){
                                    res.send(item);
                                }
                                else {
                                    // If there is a duplicate error
                                    if (err.code == 11000) {
                                        res.status(422).send(['Duplicate item code found.']);
                                    }
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

// Edit item route
itemRouter.put('/editItem', (req, res) => {

    // Get new edit item info
    var editItem = new Item({
        _id: req.body._id,
        itemName: req.body.itemName,
        itemCode: req.body.itemCode,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        images: req.body.images,
        buyerID: req.body.buyerID,
    });

    Item.findByIdAndUpdate(req.body._id, { $set: editItem },
        (err, editedItem) => {
            if (!err) { 
                res.send(editedItem);
            }
            else { 
                res.send('Error in updating item:' + JSON.stringify(err, undefined, 2));
            }
    });
});

// Delete item routes
// Delete item by id on the params
itemRouter.delete('/deleteItemById/:id', (req, res) => {
    Item.findByIdAndDelete(req.params.id, (err, item) => {
        if (!err) { 
            res.send(item);

            Auction.findOneAndUpdate({ unorderList: item.itemCode }, { $pull: { unorderList: item.itemCode }},
                (err, auction) => {});

            Auction.findOneAndUpdate({ orderedList: item.itemCode }, { $pull: { orderedList: item.itemCode }},
                (err, auction) => {});
        }
        else { 
            res.send(err);
        }
    });
});

// Get item by buyerID
itemRouter.get('/getBuyingItems/:buyerID', (req, res) => {

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

// Get item by sellerID
itemRouter.get('/getSellingItems/:sellerID', (req, res) => {

    Item.find({ sellerID: req.params.sellerID },
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

    Item.find({ sellerID: req.body.sellerID, auctionID: req.body.auctionID },
        (err, items) => {
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