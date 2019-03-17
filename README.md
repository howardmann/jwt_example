# JWT Brief Summary
- Json Web Token (JWT) is a stateless way of authenticating API endpoints. [You can learn about it here](https://jwt.io/)
- It is able to encode and decode a JSON payload using a shared secret key. This key should be kept secret between the creater of the token and the decrypter of the token
- It essentially follows two steps:
  1. First party encodes a JSON payload with a secret key and it returns a encoded token
  2. Second party decodes the token using the same secret key and ensures the encoded and decoded tokens match
- More detail below:
- The JWT is made up essentially of three components: header.payload.signature. 
- The first two are JSON payloads which are transformed into base64 string. The header is the token type, the payload is basic information which usually has the user id, email and an iat: date the token was created
- The final component is a signature of the first two components using the secret key. The decoder needs the same secret key to verify the signature
```
HEADER:ALGORITHM & TOKEN TYPE
{
  "alg": "HS256",
  "typ": "JWT"
}
PAYLOAD:DATA
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
SIGNATURE
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),  
  your-256-bit-secret
)
```

## Using it in our app
We will use the recommended jwt npm library jsonwebtoken.

Our helper essentially allows us to sign and verify jwt tokens using a shared secret key

```javascript
let jwt = require('jsonwebtoken')
let SECRET_KEY = 'chicken'
let data = {
  id: 1,
  email: 'john'
}

// First party signs the data and creates a token
let token = jwt.sign(data, SECRET_KEY) 
// header.payload.signature
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
```

Here is a simple overview of its application in express
```javascript
let jwt = require('jsonwebtoken')

// After login send back jwt token
app.post('/login', (req, res, next) => {
  let {email, password} = req.body

  // DB finds the user by email and if password matches generates and returns the token. Otherwise sends 403 forbidden
  User.findBy('email', email)
    .then(resp => {
      if (resp && resp.password == password) {
        let {id, email} = resp
        let token = jwt.sign({id, email}, 'chicken')
        res.send({
          message: 'Authenticated! Use this token in the "Authorization" header as Bearer token',
          token
        })
      }
      res.send(403)
    })  
})
```

Then we can put our secret routes behind a jwt verification
```javascript

app.get('/secret', (req, res, next) => {
  // Extract the bearer token from the header
  let bearerHeader = req.headers["authorization"]
  if (typeof bearerHeader !== 'undefined') {
    let bearerToken = bearerHeader.split(" ")[1]
    jwt.verify(bearerToken, 'chicken', (err, data) => {
      if (err) { res.send(err)}
      res.json({
        description: "Protected information woohoo",
        data,
      })
    })
  } else {
    res.send(403)
  }  
})

```

We can also refactor this logic into a `verifyToken` middleware handler
```javascript
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

// Then use it as middleware in our routes. The req will only pass through to the protected routes if the token is verified
app.get('/secret', verifyToken, (req, res, next) => {
  let auth = req.auth

  res.json({
    description: "protected information",
    auth
  })
})

// Here we can extract specific auth data such as the email and could do subsequent DB authorization checks
app.get('/moresecret', verifyToken, (req, res, next) => {
  let {email} = req.auth

  res.json({
    answer: 42,
    email 
  })
})


```