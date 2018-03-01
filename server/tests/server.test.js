
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);
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

describe('DELETE /todos/:id',() =>{
    it('should remove a todo from the database', (done) =>{
      var hexId = todos[0]._id.toHexString();
       request(app)
       .delete(`/todos/${hexId}`)
       .expect(200)
       .expect((res) =>{
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) =>{
          if(err) return done(err);
          Todo.findById(hexId).then((todo) =>{
          expect(todo).toBe(null);//trying to retrive already deleted document will return null
          done();
            }).catch((e) =>done(e));
          
      });
       
    });
    it('should return 404 if todo not found in db', (done) =>{
        var id = new ObjectID();      
        request(app)
        .delete(`/todos/${id.toHexString()}`)
        .expect(404)
        .end(done); 

    });
    it('should retutn 404 if object id is invalid and can not do the reqested delete operation', (done) =>{
        request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done);
    });
});

//PATCH/todos/:id
describe('PATCH/todos/:id',() =>{
    it('should update the todo', (done) =>{
    var hexId = todos[0]._id.toHexString();
    var text ='updated first test';
     request(app)
     .patch(`/todos/${hexId}`)
     .send({
       completed: true,
       text
    })
    .expect(200)
    .expect((res) =>{
             expect(res.body.todo.text).toBe(text);
             expect(res.body.todo.completed).toBe(true);
             expect(res.bod.todo.completedAt).toBeA('number');
         });   
    done();   
        
});
it('should clear completedAt when todo is not completed', (done) =>{
    var hexId = todos[1]._id.toHexString();
    var text ='updated second test';
     request(app)
     .patch(`/todos/${hexId}`)
     .send({
       completed: false,
       text
    })
    .expect(200)
    .expect((res) =>{
             expect(res.body.todo.text).toBe(text);
             expect(res.body.todo.completed).toBe(false);
             expect(res.bod.todo.completedAt).toNotExist();
         });
    done();
   
});
    
});

//GET/users/me
describe('GET/users/me', () =>{
 it('should return user if authenticated', (done) =>{
     request(app)
     .get('/users/me')
     .set('x-auth', users[0].tokens[0].token)
     .expect(200)
     .expect((res) =>{
         expect(res.body._id).toBe(users[0]._id.toHexString());
         expect(res.body.email).toBe(users[0].email);
     }).end(done);
    
 });

 it('should return 401 if not authenticated', (done) =>{
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res) =>{
        expect(res.body).toEqual({});
    }).end(done);
   
});
});

//POST /users
describe('POST/users', () =>{
    it('should create a user', (done) =>{
        var email = 'example@example.com';
        var password = '123mnb!';

        request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) =>{
            expect(res.headers['x-auth']).toExist()
            expect(res.body._id).toExist()
            expect(res.body.email).toBe(email);
        })
        .end((err) =>{
          if(err) return done(err);
          User.findOne({email}).then((user) =>{
              expect(user).toExist();
              expect(user.password).toNotBe(password);
              done();
          }).catch((e) =>done(e));
        });
    });

    it('should  return validation errors if request invalid', (done) =>{
        var email = 'example.com';
        var password = '123mnb!';
        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
       
    });
    
    it('should not create user if email is in use', (done) =>{
        var email = users[0].email;
        var password = users[0].password;
        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });
});


//POST /users/login
describe('POST/users/login', () =>{
    it('should login user and return auth token', (done) =>{
         request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password
        })
        .expect(200)
        .expect((res) =>{
            expect(res.headers['x-auth']).toExist();
        })
        .end((err,res) =>{
          if(err) return done(err);
          User.findById(users[1]._id).then((user) =>{
              expect(user.tokens[0]).toInclude({
                  access: 'auth',
                  token: res.headers['x-auth']
              });
              done();
          }).catch((e) =>done(e));
        });
    });

    it('should  reject invalid login', (done) =>{
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email+1,
            password: users[1].password
        })
        .expect(400)
        .expect((res) =>{
            expect(res.headers['x-auth']).toNotExist();
            })
            .end((err,res) =>{
                if(err) return done(err);
                User.findById(users[1]._id).then((user) =>{
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) =>done(e));
              });
       
    });
});

//DELETE /users/me/token

describe('DELETE/users/me/token', () =>{
    it('should remove auth token on logout', (done) =>{
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res) =>{
            if(err) done(err);
            User.findById(users[0]._id).then((user) =>{
                expect(user.tokens.length).toBe(1);
                done();
            }).catch((e) =>done(e));
        });
    });
});