module.exports = {
    database:   process.env.MONGODB_URI || 'mongodb://localhost/cas-auction',
    port: process.env.PORT || 8080
}