const express = require('express')
require('./db/mongoose.js')  // run mongoose
const userRouter = require('./routers/user_router')
const taskRouter = require('./routers/task_router')

const app = express()

app.use(express.json())

// attach routers
app.use(userRouter)
app.use(taskRouter)

module.exports = app