let User = module.exports = {}

let USERS_DB = require('../db/UserMemory.js')

User.create = (body) => {
  let {email, password} = body
  let newId = USERS_DB[USERS_DB.length - 1].id

  let newUser = {id: newId + 1, email, password}
  USERS_DB.push(newUser)
  return Promise.resolve(newUser)
}

User.find = () => {
  return Promise.resolve(USERS_DB)
}

User.findBy = (key, value) => {
  let user = USERS_DB.filter(el => el[key] == value)[0]
  return Promise.resolve(user)
}