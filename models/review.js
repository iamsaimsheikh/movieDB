const mongoose = require('mongoose')


const reviewSchema = mongoose.Schema({

    user_id : String,
    name : String,
    review : String

})

module.exports = mongoose.model('review', reviewSchema, 'review')