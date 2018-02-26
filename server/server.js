var express = require('express');
var bodyParser = require('body-parser');


var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
const {ObjectID} = require('mongodb');
var port = process.env.PORT || 3000;
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

//todos get with passing a todos id
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

//users post
app.post('/users',(req, res) =>{
    var user = new User({
        name: req.body.name,
        email: req.body.email
    });
    user.save().then(
        (doc) => res.send(doc),
        (e) => res.status(400).send(e)
    );
  });

  //users get
app.get('/todos',(req,res) =>{
    User.find().then(
        (users) =>res.send({users}),
       (e) => console.log(e)
    )
});

//delete request
app.delete('/todos/:id', (req,res) =>{
    var id = req.params.id;
    if(!ObjectID.isValid(id)) return res.status(404).send();
    Todo.findByIdAndRemove(id).then((todo) => {
            if(todo) {
              res.send(todo);
            }
           res.status(404).send();
        })
    .catch((e) =>res.status(400).send());
});

app.listen(port, () =>{
    console.log(`server started on port ${port}`);
});

module.exports = {app};

