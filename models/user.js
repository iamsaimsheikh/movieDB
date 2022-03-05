const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  phone: String,
  password: String,
  verified: Boolean  
})

module.exports= mongoose.model('user',userSchema, 'user')