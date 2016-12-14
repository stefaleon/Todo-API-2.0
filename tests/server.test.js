const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo');

var lengthBeforeTest = 0;
beforeEach((done) => {
    Todo.find().then((todos) => {
        lengthBeforeTest = todos.length;
        done();
    });
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
                    expect(todos.length).toBe(lengthBeforeTest + 1);
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
                    expect(todos.length).toBe(lengthBeforeTest);
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
                expect(res.body.todos.length).toBe(lengthBeforeTest);
            })
            .end(done);
    });


});
