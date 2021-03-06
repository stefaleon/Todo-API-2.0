const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const dbURL = 'mongodb://localhost/todoapi2test';

const testTodos = [{
    _id: new ObjectID(),
    text: 'First testTodo',
    completed: false,
    completedAt: null
},{
    _id: new ObjectID(),
    text: 'Second testTodo',
    completed: true,
    completedAt: 1234
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(testTodos);
    }).then(() => done());
});

describe('POST /todos', () => {

    it ('should create a new todo', (done) => {
        var testTodoText = 'Testing todo text';
        request(app)
            .post('/todos')
            .send({text: testTodoText})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(testTodoText);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(3);
                    expect(todos[todos.length-1].text).toBe(testTodoText);
                    done();
                }).catch((err) => done(err));
            });
    });

    it ('should not create a todo with invalid body data', (done) => {
        var testTodoText = '';
        request(app)
            .post('/todos')
            .send({text: testTodoText})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('GET /todos', () => {

    it ('should read all todos in db', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });

});

describe('GET /todos/:id', () => {

    it ('should read a todo with a specific _id ', (done) => {
        request(app)
            .get(`/todos/${testTodos[0]._id}`)
            .expect(200)
            .expect((res) => {
                 expect(res.body.todo.text).toBe(testTodos[0].text);
            })
            .end(done);
    });

    it ('should return 404 "Not found" if a todo is not found', (done) => {
        request(app)
            .get(`/todos/5851c8b8503c3204d05043f2`)
            .expect(404)
            .end(done);
    });

    it ('should return 404 "Invalid _id" if the id is invalid', (done) => {
        request(app)
            .get(`/todos/1234567890`)
            .expect(404)
            .expect("Invalid _id")
            .end(done);
    });

});

describe('PUT /todos/:id', () => {

    it ('should update a todo with a specific _id', (done) => {
        request(app)
            .put(`/todos/${testTodos[0]._id}`)
            .send({ todo: {
                text: 'new text for first testTodo',
                completed: true
                }
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe('new text for first testTodo');
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it ('should set completedAt to null if todo is not completed', (done) => {
        request(app)
            .put(`/todos/${testTodos[1]._id}`)
            .send({ todo: {
                completed: false
                }
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBe(null);
            })
            .end(done);
    });

    it ('should return 404 "Not Found" if a todo is not found', (done) => {
        request(app)
            .put(`/todos/5851c8b8503c3204d05043f2`)
            .send({ todo: {
                text: 'irrelevant because id is nonexistant'
                }
            })
            .expect(404)
            .end(done);
    });

    it ('should return 404 "Invalid _id" if the id is invalid', (done) => {
        request(app)
            .put(`/todos/1234567890`)
            .expect(404)
            .expect("Invalid _id")
            .end(done);
    });


});


describe('DELETE /todos/:id', () => {

    it ('should delete a todo with a specific _id ', (done) => {
        request(app)
            .delete(`/todos/${testTodos[0]._id}`)
            .expect(200)
            .expect((res) => {
                 expect(res.body.todo.text).toBe(testTodos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(testTodos[0]._id).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((err) => done(err));
            });
    });

    it ('should return 404 "Not Found" if a todo is not found', (done) => {
        request(app)
            .delete(`/todos/5851c8b8503c3204d05043f2`)
            .expect(404)
            .end(done);
    });

    it ('should return 404 "Invalid _id" if the id is invalid', (done) => {
        request(app)
            .delete(`/todos/1234567890`)
            .expect(404)
            .expect("Invalid _id")
            .end(done);
    });

});
