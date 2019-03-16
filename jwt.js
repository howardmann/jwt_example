let jwt = require('jsonwebtoken')
let SECRET_KEY = 'chicken'
let data = {
  id: 1,
  email: 'john'
}

// First party signs the data and creates a token
let token = jwt.sign(data, SECRET_KEY) 
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huIiwiaWF0IjoxNTUyNzMzMDU3fQ.3FOQxJNV_nsK2Dwwhaf0EduSiQzMRz4KeGnJ4HJn-mA


// Second party verifies the token with the correct secret key
jwt.verify(token, SECRET_KEY, (err, data) => {
  if (err) {
    console.log(err)
  }
  console.log(data)
  // { id: 1, email: 'john', iat: 1552733090 }
})

// Second party verifies the token with the wrong secret key
jwt.verify(token, 'duck', (err, data) => {
  if (err) {
    console.log(err)
    // { [JsonWebTokenError: invalid signature] name: 'JsonWebTokenError', message: 'invalid signature' }
  }
  console.log(data)
})
