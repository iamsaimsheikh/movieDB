const express = require('express')
const router = express.Router();
const Movie = require('../models/movie')
const Actor = require('../models/actor')
const Review = require('../models/review')
const {addActorValidation,movieInfoValidation,movieReviewValidation} = require('./validation');
const movie = require('../models/movie');


router.post('/add' , async (req, res) => {

    const movieData = req.body

    const movieInfo = {name: movieData.name, genre: movieData.genre, business_done: movieData.business_done}
    const movieError = movieInfoValidation(movieInfo).error
    if(movieError) return res.status(400).send(movieError.details[0].message)


    const movieActor = {name: movieData.actor.name, age: movieData.actor.age, gender: movieData.actor.gender}
    const actorError = addActorValidation(movieActor).error
    if(actorError) return res.status(400).send(actorError.details[0].message)

    const movieReviews = { user_id: movieData.review.user_id, name: movieData.review.name, review: movieData.review.review}
    const reviewError = movieReviewValidation(movieReviews).error
    if(reviewError) return res.status(400).send(reviewError.details[0].message)

    const newMovie = new Movie()
    newMovie.name = movieData.name
    newMovie.genre = [...movieData.genre]
    newMovie.business_done= movieData.business_done

    if(!actorError){
        const newActor =  new Actor({name: movieData.actor.name, age: movieData.actor.age, gender: movieData.actor.gender})
        try {
            await newActor.save()
            newMovie.actor.push(newActor)
            newMovie.populate('actor')
        } catch (error) {
            res.send(error)
        }
        
    }
    
    newMovie.rating= movieData.rating

    if(!reviewError){
        const newReview = new Review({ user_id: movieData.review.user_id, name: movieData.review.name, review: movieData.review.review})
        try {
            await newReview.save()
            newMovie.review.push(newReview)
            newMovie.populate('review')
        } catch (error) {
            res.send(error)
        }
        
    }

    try {

        await newMovie.save()
        res.send(newMovie)

    } catch (error) {
        res.send(error)
    }

    
    



})

router.get('/get-all', async (req , res) =>{

    const movie =  await Movie.find().populate('review actor')
    res.json(movie) 

})

router.get('/get-specific', async (req , res) => {

    const findMovie = req.body
    const movie =  await Movie.find({name: findMovie.name}).populate('review actor')
    res.json(movie)

})

router.post('/add-review', async (req , res) =>{
    
    const findMovie = req.body
    const review = { user_id: findMovie.review.user_id, name: findMovie.review.name, review: findMovie.review.review}
    const reviewError = movieReviewValidation(review).error
    if(reviewError) return res.status(400).send(reviewError.details[0].message)

    const newReview = new Review(review)

    try {
        await newReview.save()
        const movie =  await Movie.findOneAndUpdate({name: findMovie.name})
        movie.review.push(newReview)
        movie.populate('review')
        movie.save()
        res.json(movie)
    } catch (error) {
        res.send(error)
    }
})

router.post('/update-rating', async (req , res) => {

    const findMovie = req.body
    const newRating = findMovie.rating
    if(newRating <= 0 && newRating >5) return res.send("Invalid Rating")

    const movie =  await Movie.findOne({name: findMovie.name})
    const prevRating = movie.rating.rating
    const prevTotalVotes = movie.rating.totalVotes

    const rating = { totalVotes: prevTotalVotes + 1, rating: ((prevTotalVotes * prevRating) + newRating) / (prevTotalVotes + newRating) }

    try {
        movie.rating = rating
        await movie.save()
        res.json(movie)
    } catch (error) {
        res.send(error)
    }

})

router.delete('/delete-movie', async (req , res) => {

    await Movie.findOneAndDelete({name: req.body.name})
    res.send(`Deleted ${req.body.name}`)

})

router.get('/find-by-genre', async (req , res) => {

    const genre = req.body.genre
    
    const movies = await Movie.find() 
    const movieByGenre = movies.filter(movie => {
        return movie.genre.includes(genre)
    })

    res.send(movieByGenre)

})

router.get('/business-done', async (req , res) => {

    const actor = req.body.name
    const business_done = []

    const movie = await Movie.find().populate('actor')

    movie.forEach(movie => {
        const movieActor = movie.actor.map(movie => movie.name)
        if(movieActor.includes(actor)) {
            business_done.push({movie: movie.name , business_done: movie.business_done})
        } 
    })

    res.send(business_done)

})



module.exports = router