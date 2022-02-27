const mongoose = require('mongoose')

const actorSchema = mongoose.Schema({

    name:   String,
    age:    Number,
    gender: String

})

module.exports = mongoose.model('actor', actorSchema, 'actor');