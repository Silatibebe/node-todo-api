require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');


var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');
const {ObjectID} = require('mongodb');

var port = process.env.PORT;
var app = express();
app.use(bodyParser.json());

//todos POST
app.post('/todos',(req, res) =>{
  var todo = new Todo({
      text: req.body.text
  });
  todo.save().then(
      (doc) => res.send(doc),
      (e) => res.status(400).send(e)
  );
});

//todos GET
app.get('/todos',(req,res) =>{
    Todo.find().then(
        (todos) =>res.send({todos}),
       (e) => console.log(e)
    )
});
 

//todos GET/todos/:id
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

//DELETE /todos/:id
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



//PATCH/update request
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

//POST users

app.post('/users', (req,res) =>{
    var body = _.pick(req.body,['email', 'password']);
    var user = new User(body);
    user.save().then((user) =>{
        return user.generateAuthToken();
    }).then((token) =>{
        // res.send(user);
        res.header('x-auth', token).send(user);
    }).catch((e) =>res.status(400).send(e));
});



//privatize the get user route
app.get('/users/me', authenticate , (req, res) =>{
 res.send(req.user);
});


app.listen(port, () =>{
    console.log(`server started on port ${port}`);
});

module.exports = {app};

