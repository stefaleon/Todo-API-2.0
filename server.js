const mongoose = require('mongoose');
const dbURL = process.env.dbURL || 'mongodb://localhost/todoapi2';
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {
    Todo
} = require('./models/todo');
const {
    User
} = require('./models/user');

mongoose.Promise = global.Promise;
mongoose.connect(dbURL);

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));

// CREATE a todo
app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((todo) => {
        res.send(todo);
    }, (e) => {
        res.status(400).send(e.message);
    });
});

// READ all todos
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(404).send(e.message);
    });
});

// READ a todo
app.get('/todos/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).send('Invalid _id');
    }
    Todo.findById(req.params.id).then((todo) => {
        if (!todo) {
            return res.status(404).send('Not found');
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send(e.message);
    });
});

// UPDATE a todo
app.put('/todos/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).send('Invalid _id');
    }
    var updatedCompletedAt = null;
    if (req.body.todo.completed) {
        updatedCompletedAt = new Date().getTime();
    }
    var updatedTodo = {
        text: req.body.todo.text,
        completed: req.body.todo.completed,
        completedAt: updatedCompletedAt
    };
    Todo.findByIdAndUpdate(req.params.id, updatedTodo, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send('Not found');
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send(e.message);
    });
});

// DELETE a todo
app.delete('/todos/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).send('Invalid _id');
    }
    Todo.findByIdAndRemove(req.params.id).then((todo) => {
        if (!todo) {
            return res.status(404).send('Not found');
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send(e.message);
    });
});



app.listen(PORT, process.env.IP, () => {
    console.log('Server started on port', PORT);
});

module.exports = {app};
