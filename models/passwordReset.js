const mongoose = require('mongoose')

const passwordResetSchema = mongoose.Schema({
  userId: String,
  resetString: String,
  createdAt: Date,
  expireAt: Date,
    
})

module.exports= mongoose.model('passwordReset', passwordResetSchema, 'passwordReset')