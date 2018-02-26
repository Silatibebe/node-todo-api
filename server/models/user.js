var mongoose = require('mongoose');
//User model

var User = mongoose.model('User',{
    name: {
        type: String,
        required: true,
        minlength:1,
        maxlength:50,
        trim: true
    },
    email: {
        type: String,
        required: true,
        minlength:1,
        maxlength:50,
        trim: true
    }
});

module.exports = {User};