const mongoose = require('mongoose')
const Schema = mongoose.Schema



const movieSchema = mongoose.Schema({
    name: String,
    genre: [],
    actor: [{type: Schema.Types.ObjectId , ref: 'actor'}],
    business_done : Number,
    rating: {totalVotes:0, rating:0},
    review: [{type : Schema.Types.ObjectId , ref: 'review'}]

})

module.exports = mongoose.model('movie', movieSchema, 'movie')