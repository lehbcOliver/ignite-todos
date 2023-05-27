const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find((user) => user.username === username);
  
  if(!user){
    return response.status(400).json({error: 'User not found'})
  }
  request.username = user;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userAlreadyExists = users.find((user)=> user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({error: "Username already exists"})
  }
  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });
  
  return response.status(200).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  return response.json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const {title, deadline} = request.body;
    const {username} = request;
    const todoOperation ={
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      createdat: new Date()
    }
    username.todos.push(todoOperation);
    return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {username} = request;
  const {id} = request.params;
  const todo = username.todos.find(todo=> todo.id == id);
  todo.title =  title;
  todo.deadline = new Date(deadline);
  return response.status(200).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;
  const todo = username.todos.find(todo=>  todo.id === id);
  todo.done = true;
  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;
  const todo = username.todos.find(todo => todo.id === id);
  if(todo === -1){
    return response.status(400).json({error: 'Todo not found'})
  }
  username.todos.splice(todo,1);

  return response.status(200).json(users);

});

module.exports = app;