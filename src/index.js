const express = require('express')
require('./db/mongoose.js')  // run mongoose
const userRouter = require('./routers/user_router')
const taskRouter = require('./routers/task_router')

const app = express()
const port = process.env.PORT

app.use(express.json())

// attach routers
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
