var mongoose = require('mongoose');
//Todo model

var Todo = mongoose.model('Todo',{
    text: {
        type: String,
        required: true,
        minlength:1,
        maxlength:50,
        trim: true
    },
    completed: {
       type: Boolean,
       required: true,
       default: false
   },
   completedAt: {
       type: Number,
       default: null
   },
   });

   module.exports = {Todo};