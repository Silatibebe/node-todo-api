require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');


var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
const {ObjectID} = require('mongodb');

var port = process.env.PORT;
var app = express();
app.use(bodyParser.json());

//todos post
app.post('/todos',(req, res) =>{
  var todo = new Todo({
      text: req.body.text
  });
  todo.save().then(
      (doc) => res.send(doc),
      (e) => res.status(400).send(e)
  );
});

//todos get
app.get('/todos',(req,res) =>{
    Todo.find().then(
        (todos) =>res.send({todos}),
       (e) => console.log(e)
    )
});
 

//todos get/todos/:id
app.get('/todos/:id',(req,res) =>{
    var id = req.params.id;
     if(!ObjectID.isValid(id)) return res.status(404).send();
    Todo.findById(id).then(
        (todo) => {
            if(todo) {
              res.send({todo});
            }
           res.status(404).send();
        }).catch((e) =>res.status(400).send());
});

//delete /todos/:id
app.delete('/todos/:id', (req, res) =>{
    var id = req.params.id;
    if(!ObjectID.isValid(id)) return res.status(404).send();
    Todo.findByIdAndRemove(id).then(
        (todo) =>{
            if(todo) res.send({todo});
            res.status(404).send();
         }
         
    ).catch((e) =>res.status(400).send());
});



//patch/update request
app.patch('/todos/:id', (req,res) =>{
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
    if(!ObjectID.isValid(id)) return res.status(404).send();
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id, {$set:body},{new: true}).then((todo) => {
            if(todo) {
              res.send({todo});
            }
           res.status(404).send();
        })
    .catch((e) =>res.status(400).send());
});




app.listen(port, () =>{
    console.log(`server started on port ${port}`);
});

module.exports = {app};

