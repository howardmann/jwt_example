// dotenv
require('dotenv').config()

// express boilerplate
let express = require('express')
let app = express()
let bodyParser = require('body-parser')
app.use(bodyParser.json())

// require memory model
let User = require('./model/User.js')


// jwt
let jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.JWT_SECRET_KEY

app.get('/', (req, res, next) => {
  res.json({status: 'ok'})
})

app.get('/users', (req, res, next) => {
  User.find().then(resp => {
    res.json(resp)
  })
})

app.get('/users/:id', (req, res, next) => {
  let id = req.params.id
  User.findBy('id', id).then(resp => {
    res.json(resp)
  })
})

app.post('/register', (req, res, next) => {
  let {email, password} = req.body
  User.create({email, password})
    .then(resp => {
      res.json(resp)
    })
})

// After login send back jwt token
app.post('/login', (req, res, next) => {
  let {email, password} = req.body
  User.findBy('email', email)
    .then(resp => {
      if (resp && resp.password == password) {
        let {id, email} = resp
        let token = jwt.sign({id, email}, SECRET_KEY)
        res.send({
          message: 'Authenticated! Use this token in the "Authorization" header as Bearer token',
          token
        })
      }
      res.send(403)
    })  
})

app.get('/secret', verifyToken, (req, res, next) => {
  let auth = req.auth

  res.json({
    description: "protected information",
    auth
  })
})

app.get('/moresecret', verifyToken, (req, res, next) => {
  let {email} = req.auth

  res.json({
    answer: 42,
    email 
  })
})

// Middleware: Verify bearer token and JWT auth. Add to req auth
function verifyToken (req, res, next) {
  // Extract the bearer token from the header
  let bearerHeader = req.headers["authorization"]
  if (typeof bearerHeader !== 'undefined') {
    // authorization: bearer abcdefghij123
    let bearerToken = bearerHeader.split(" ")[1]
    
    // verify token and attach auth data to req.auth and call next or send 403
    jwt.verify(bearerToken, SECRET_KEY, (err, data) => {
      if (err) {
        res.send(403) // forbidden
      }
      req.token = bearerToken
      req.auth = data
      //call next middleware
      next()
    })
  } else {
    res.send(403) // forbidden
  }
}

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
})