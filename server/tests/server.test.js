const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {app} = require('../server');
const {Todo} = require('../models/todo');

const todos = [
   {text: 'First test todo',_id:new ObjectID()},
   {text: 'Second test todo',_id:new ObjectID()}
];

beforeEach((done) =>{
     Todo.remove({}).then(() => {
         return Todo.insertMany(todos);
     }).then(() => done());
});
describe('POST /todos',() =>{
    it('should create a new todo.',(done) =>{
      var text = 'Test todo text';
      request(app)
      .post('/todos')
      .send({text})
      .expect((res) =>{
          expect(res.body.text).toBe(text);
      })
      .end((err, res) =>{
          if(err){
              return done(err);
          }
       Todo.find({text}).then((todos) =>{
           expect(todos.length).toBe(1);
           expect(todos[0].text).toBe(text);
           done();
       }).catch((e) => done(e));
      });
    });

    //test for invalid request
    it('should not allow invalid request ', (done) =>{
        //make request from client
        request(app)
        .post('/todos')
        .send({})
        //expect server response to be 404
        .expect(400)
        //end the response 
        .end((err,res) =>{
          if(err) { return done(err);}
        //check the database --it should not insert any data -length ==0
        Todo.find().then((todos) =>{
            expect(todos.length).toBe(2);
            done();
        }).catch((e) => done(e));
      });       
    });

});

//get todos
describe('GET/todos',() =>{
    it('should get all todos', (done) =>{
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) =>{
          expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
});

//get todos/:id
describe('GET/todos:/id',() =>{
    it('should get todo with the specified id', (done) =>{
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) =>{
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    //invalid 
    it('should return 404 if todo not found', (done) =>{
        var id = new ObjectID();      
        request(app)
        .get(`/todos/${id.toHexString()}`)
        .expect(404)
        .end(done); 
    });

    it('should return 404 for non-object ids', (done) =>{
       
        request(app)
        .get('/todos/123')
        .expect(404)
        .end(done); 
    });
});
