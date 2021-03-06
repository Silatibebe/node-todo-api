const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo');
const {User}  = require('../../models/user');

const userOneId  = new ObjectID();
const userTwoId = new ObjectID();


//users
const users = [
        //user one
    {
     _id: userOneId,
    email: 'andrew@example.com',
    password: 'userOnePass', 
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id :userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()}]
    },//user two
    {  
         _id: userTwoId,
        email: 'jen@example.com', 
        password: 'userTwoPass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id :userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()}]
    },
        
];
//populate Users
const populateUsers = (done) =>{
    User.remove({}).then(() =>{
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

//todos
const todos = [
   {text: 'First test todo',
   _id:new ObjectID(),
   _creator: userOneId
   },
   {text: 'Second test todo',
   _id:new ObjectID(),
   completed: true, completedAt:333,
   _creator: userTwoId
   }
];

//populate Todos
const populateTodos = (done) =>{
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};