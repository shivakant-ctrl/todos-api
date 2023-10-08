const express = require('express')
const bodyParser = require('body-parser')
const uniqid = require('uniqid') 
const fs = require("fs")
const cors = require("cors")
const PORT = process.env.PORT || 3000

const app = express()

app.use(bodyParser.json())
app.use(cors())

// Read todos.json
function readTodos() {
  const todos = JSON.parse(fs.readFileSync("./database/todos.json", "utf-8"))
  return todos
}

// Write todos.json
function writeTodos(updatedTodos) {
  const fileContent = JSON.stringify(updatedTodos)
  fs.writeFileSync("./database/todos.json", fileContent)
}

// Retrieve all todos
app.get("/todos", (req, res) => {
  const todos = readTodos()
  res.status(200).send(todos)
})

// Retrieve specific todo
app.get("/todos/:id", (req, res) => {
  const todos = readTodos()
  const receivedId = req.params.id
  const matchedTodoItem = todos.find(todoItem => receivedId === todoItem._id)
  if (matchedTodoItem) {
    res.status(200).send(matchedTodoItem)
  } else {
    res.status(404).send("Not Found")
  }
})

// Create a new todo item
app.post("/todos", (req, res) => {
  const todos = readTodos()
  const {title, description} = req.body
  if (title === undefined || description === undefined) {
    res.status(400).send('Missing required information: title and/or description')
  } else {
    const newId = uniqid()
    const newTodo = {_id: newId, title, description}
    todos.push(newTodo)
    writeTodos(todos)
    res.status(201).send({id: newId})
  }
})

// Update todo item
app.put("/todos/:id", (req, res) => {
  const todos = readTodos()
  const receivedId = req.params.id
  const {title, description} = req.body
  if (!title || !description) {
    res.status(400).send('Missing required information: title and/or description')
  } else {
    const todoIndex = todos.findIndex(todoItem => receivedId === todoItem._id)
    if (todoIndex !== -1) {
      todos[todoIndex].title = title
      todos[todoIndex].description = description
      writeTodos(todos)
      res.status(200).send("Updated")
    } else {
      res.status(404).send("Not Found")
    }
  }
})

// Delete todo item
app.delete("/todos/:id", (req, res) => {
  const todos = readTodos()
  const receivedId = req.params.id
  const todoIndex = todos.findIndex(todoItem => receivedId === todoItem._id)
  if (todoIndex !== -1) {
    todos.splice(todoIndex, 1)
    writeTodos(todos)
    res.status(200).send("Deleted")
  } else {
    res.status(404).send("Not Found")
  }
})

// Catch-all middleware for undefined routes
function catchAllMiddleware(req, res) {
  res.status(404).send("Not Found")
}

app.use(catchAllMiddleware)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

