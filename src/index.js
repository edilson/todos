const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const userFound = users.find(user => user.username === username)

  if(!userFound) {
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = userFound

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userWithUsernameAlreadyExists = users.some(user => user.username === username)

  if(userWithUsernameAlreadyExists) {
    return response.status(400).json({ error: 'User with this username already exists' })
  }

  const userCreated = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(userCreated)

  return response.status(201).json(userCreated)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const userFound = request.user

  return response.json(userFound.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const todoCreated = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  const userFound = request.user

  userFound.todos.push(todoCreated)

  return response.status(201).json(todoCreated)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body

  const userFound = request.user

  const todoFound = userFound.todos.find(todo => todo.id === id)

  if(!todoFound) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  todoFound.title = title
  todoFound.deadline = deadline

  return response.json(todoFound)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const userFound = request.user

  const todoFound = userFound.todos.find(todo => todo.id === id)

  if(!todoFound) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  todoFound.done = true

  return response.json(todoFound)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const userFound = request.user

  const todoFound = userFound.todos.find(todo => todo.id === id)

  if(!todoFound) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  userFound.todos.splice(todoFound, 1)

  return response.status(204).send()
});

module.exports = app;