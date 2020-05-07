// get dependencies
const express = require('express'); // call express
const itemRouter = express.Router(); // get an instance of express router
const multer = require('multer');   // get multer
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const config = require('../config/config');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const dateFormat = require('dateformat');

const connection = mongoose.createConnection(
    config.database,
    { useNewUrlParser: true, useUnifiedTopology: true }
);

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

            var date = dateFormat(new Date(), "yyyy-mm-dd h:MM");

            const filename = (file.originalname + ' ' + date);
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
itemRouter.post('/uploadImages', upload.array('images', 5), (req, res) => {
    res.send();
});

itemRouter.get('/getItemImages/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({err: 'No file exists'});
        }
    
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({err: 'Not an image'});
        }
      });
});

itemRouter.get('/getImage/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({err: 'No file exists'});
        }
    
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            res.send(file);
        } else {
            res.status(404).json({err: 'Not an image'});
        }
      });
})

//delete image
itemRouter.delete('/deleteImage/:imageID', (req, res) => {
    gfs.remove({ _id: req.params.imageID, root: 'images' }, (err, file) => {
        if (!err){
            console.log('deleted image');
            res.send('deleted image');
        }
        else {
            console.log(err);
            res.send(err);
        }
    })
});

itemRouter.delete('/deleteImageByName/:imageName', (req, res) => {
    gfs.remove({ filename: req.params.imageName, root: 'images' }, (err, file) => {
        if (!err){
            console.log('delete image');
            res.send('deleted image');
        }
        else {
            console.log(err);
            res.send(err);
        }
    })
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
    item.images = req.body.images;

    if (item.images != null){
        var date = dateFormat(new Date(), "yyyy-mm-dd h:MM");

        for (var i = 0; i < item.images.length; i++){
            item.images[i] = item.images[i] + ' ' + date;
        }
    }

    // Find the auction to add the item
    Auction.findById(item.auctionID, (err, auction) => {
        // If auction is found
        if (auction) {

            if (item.type == 'auction'){
                auction.updateOne({ $addToSet: { unorderList: item.id }}, (err, auction) => {});
            }

            if (item.images != null){
                auction.updateOne({ $addToSet: { images: item.images }}, (err, auction) => {});
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

// Get all items
itemRouter.get('/getAllItems', (req, res) => {
    Item.find((err, items) => {
        if (!err){
            res.send(items);
        } 
        else {
            res.send(err);
        }
    });
});

// Edit item route
itemRouter.put('/editItem', (req, res) => {
    // Get new edit item info
    var editItem = new Item();

    editItem._id = req.body._id;
    editItem.itemName = req.body.itemName;
    editItem.itemCode = req.body.itemCode;
    editItem.price = req.body.price;
    editItem.quantity = req.body.quantity;
    editItem.description = req.body.description;
    editItem.buyerID = req.body.buyerID;
    editItem.paid = req.body.paid;
    editItem.payout = req.body.payout;
    editItem.images = req.body.images;

    if (editItem.images != null){
        var date = dateFormat(new Date(), "yyyy-mm-dd h:MM");

        for (var i = 0; i < editItem.images.length; i++){
            if (!editItem.images[i].includes(':')){
                editItem.images[i] = editItem.images[i] + ' ' + date;
            }
        }
    }

    Auction.findById(req.body.auctionID, (err, auction) => {
        if (!err){
            auction.updateOne({ $addToSet: { images: editItem.images }}, (err, auction) => {});
        }
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
        if (!err){
            res.send(item);

            Auction.findOneAndUpdate({ unorderList: item.id }, { $pull: { unorderList: item.id }}, (err, auction) => {});

            Auction.findOneAndUpdate({ orderedList: item.id }, { $pull: { orderedList: item.id }}, (err, auction) => {});
        }
        else {
            res.send(err);
        }
    });
});

// Get item by buyerID
itemRouter.get('/getBuyingItems/:buyerID', (req, res) => {
    Item.find({ buyerID: req.params.buyerID, paid: false },
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

    Item.find({ sellerID: req.params.sellerID, payout: false },
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

// Remove item in ordered list when paid
itemRouter.put('/removePaidItem/', (req, res) => {
    auctionID = req.body.auctionID;
    itemID = req.body._id;

    Auction.findByIdAndUpdate(auctionID, { $pull: { orderedList: itemID }},
        (err, auction) => {
            if (!err){
                res.send(auction);
            }
            else {
                res.send(err);
            }
        });
});

// return the router
module.exports = itemRouter;