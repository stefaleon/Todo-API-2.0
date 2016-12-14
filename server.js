const mongoose = require('mongoose');
const dbURL = process.env.dbURL || 'mongodb://localhost/todoapi2';
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const {Todo} = require('./models/todo');
const {User} = require('./models/user');

mongoose.Promise = global.Promise;
mongoose.connect(dbURL);

app.use(bodyParser.urlencoded({extended: true}));

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((todo) => {
		res.send(todo);
	}, (e) =>{
		res.status(400).send(e.message);
	}); 
});


app.listen(PORT, process.env.IP, () => {
    console.log('Server started on port', PORT);
});