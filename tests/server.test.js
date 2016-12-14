const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');


const testTodos = [{
    _id: new ObjectID(),
    text: 'First testTodo'
},{
    _id: new ObjectID(),
    text: 'Second testTodo'
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

    it ('should return 404 if a todo is not found', (done) => {
        request(app)
            .get(`/todos/5851c8b8503c3204d05043f2`)
            .expect(404)
            .end(done);
    });

    it ('should return "Invalid _id" if the id is invalid', (done) => {
        request(app)
            .get(`/todos/1234567890`)
            .expect("Invalid _id")
            .end(done);
    });

});
