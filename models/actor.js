const mongoose = require('mongoose')

const actorSchema = mongoose.Schema({

    picture: String,
    name:   String,
    age:    Number,
    gender: String

})

module.exports = mongoose.model('actor', actorSchema, 'actor');