module.exports = {
    database: process.env.MONGODB_URI || 'mongodb://phi:phi123@cluster0-p1wyf.mongodb.net/test?retryWrites=true&w=majority',
    port: process.env.PORT || 8080
}