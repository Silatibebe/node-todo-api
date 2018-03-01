const mongoose = require('mongoose');
const  validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

//UserSchema
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

//user --removeToken
UserSchema.methods.removeToken = function(token){
   var user = this;

 return  user.update({
       $pull:{
           tokens: {token}
       }
   });
};

//define findByToken method 
UserSchema.statics.findByToken = function(token){
var User = this;
var decoded;

try{
    decoded = jwt.verify(token, 'abc123');
} catch(e){
    return Promise.reject();
}

return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
});

};

//user --findByCredentials 
UserSchema.statics.findByCredentials = function(email, password){
    var User = this;
    
    return User.findOne({email}).then((user) => {
        if(!user) return Promise.reject();
        return new Promise((resolve,reject) =>{
            // bcrypt.genSalt(10, (err, salt) =>{
            //     bcrypt.hash(password, salt, (err, hash) =>{
            //        var match = bcrypt.compare(hash, user.password);
            //        if(!match) reject(err);
            //        resolve(user);                   
            //    });
            // });
            bcrypt.compare(password, user.password, (err, res) =>{
                if(res){
                    resolve(user);
                    } else {
                        reject();
                    }                
            });
        });

        
    });
};
// mangoose middleware --will hash the password
UserSchema.pre('save', function(next){
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) =>{
                bcrypt.hash(user.password, salt, (err,hash) =>{
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }

});

//Model -User
var User = mongoose.model('User', UserSchema);
module.exports = {User};