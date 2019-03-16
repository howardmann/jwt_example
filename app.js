// express boilerplate
let express = require('express')
let app = express()
let bodyParser = require('body-parser')
app.use(bodyParser.json())

// require memory model
let User = require('./model/User.js')

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
  User.findById(id).then(resp => {
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

app.post('/login', (req, res, next) => {
  let {email, password} = req.body
  console.log(email, password);
  res.send({login: 'ok'})
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
})