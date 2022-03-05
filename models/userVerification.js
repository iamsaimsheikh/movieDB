const mongoose = require('mongoose')

const userVerificationSchema = mongoose.Schema({
  userId: String,
  uniqueString: String,
  createdAt: Date,
  expireAt: Date,
    
})

module.exports= mongoose.model('userVerification',userVerificationSchema, 'userVerification')