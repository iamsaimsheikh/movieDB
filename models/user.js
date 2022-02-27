const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String  
})

module.exports= mongoose.model('user',userSchema)