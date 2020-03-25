module.exports = {
    database:   process.env.MONGODB_URI || 'mongodb+srv://phi:phi123@cluster0-p1wyf.mongodb.net/cas-auction?retryWrites=true&w=majority',
    port: process.env.PORT || 8080
}