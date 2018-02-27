var mongoose = require('mongoose');
mongoose.Promise = global.Promise;//to enable mongoose use promise
mongoose.connect(process.env.MONGODB_URI);
module.exports = {mongoose};