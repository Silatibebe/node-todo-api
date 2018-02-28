const mongoose = require('mongoose');
const  validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
//userSchema
var UserSchema = new mongoose.Schema(
    {
        // name: {
        //     type: String,
        //     required: true,
        //     minlength:1,
        //     maxlength:50,
        //     trim: true
        // },
        email: {
            type: String,
            required: true,       
            trim: true,
            minlength:1,
            // maxlength:50,
            unique: true,
            validate: {
                validator: validator.isEmail,
                message: '{VALUE} is not a valid email'
            }
        },
        password: {
            type: String,
            require: true,//andrew make this require not required
            minlength: 6
        },
        tokens: [{
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }]
    }
);
//User model
//pick
//to only retrurn only certain part of the user
UserSchema.methods.toJSON =function(){
 var user = this;
 var userObject = user.toObject();
 
 return _.pick(userObject, ['_id', 'email']);
};

//generateAuthToken
UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access},'abc123').toString();

    user.tokens.push({access, token});// user.tokens.push -- causes some problem in some versions of mongodb versions if so use concat 
   return user.save().then(() =>{
        return token;
    });//in then chain we can retrieve the token
};
var User = mongoose.model('User', UserSchema);
module.exports = {User};