var mongoose = require('mongoose');
mongoose.Promise = global.Promise;//to enable mongoose use promise
mongoose.connect('mongodb://localhost:27017/TodoAppDb');
module.exports = {mongoose};