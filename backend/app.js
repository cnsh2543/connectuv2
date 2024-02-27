require('dotenv').config()
const LoginRouter = require('./routers/login')
const NewsfeedRouter = require('./routers/newsfeed')
const express = require('express')
const app = express()
const cors = require('cors')
const PostRouter = require('./routers/post')
const SignUpRouter = require('./routers/signup')

//const mongoUrl = process.env.MONGO_URL
//mongoose.connect(mongoUrl)

// app.use(express.static('build'))
app.use(cors())
app.use(express.json());
app.use('/login',LoginRouter)
app.use('/',NewsfeedRouter)
app.use('/',PostRouter)
app.use('/',SignUpRouter)

const PORT = process.env.PORT || 3003

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
