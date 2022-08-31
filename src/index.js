const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find(user => user.username === username)
  if (!user) response.status(400).json({ error: "User does not exist."})
  request.user = user
  return next() 
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  const userAlreadyExists = users.some(user => user.username === username)
  if (userAlreadyExists) return response.status(400).json({ error: "Username already in use."})
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  return response.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body
  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(task)
  response.status(201).json(task)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const{title, deadline} = request.body
  const task = user.todos.find(task => task.id === id)
  if(!task) return response.status(400).json({ error: "Task does not exist."})
  task.title = title
  task.deadline = new Date(deadline)
  return response.status(201).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const task = user.todos.find(task => task.id === id)
  if(!task) return response.status(400).json({ error: "Task does not exist."})
  task.done = true
  return response.status(200).json(task)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const task = user.todos.find(task => task.id === id)
  if(!task) return response.status(400).json({ error: "Task does not exist."})
  user.todos.splice(task, 1)
  return response.status(200).json(user.todos)
});

module.exports = app;