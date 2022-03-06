const Movie = require('../models/movie')
const Actor = require('../models/actor')
const Review = require('../models/review')
const {Parser} = require('json2csv')
const {addActorValidation,movieInfoValidation,movieReviewValidation} = require('../routes/validation');

const addMovie = async (req, res) => {

    // Data Validation

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

// Adding value

    const newMovie = new Movie()
    newMovie.name = movieData.name
    newMovie.genre = [...movieData.genre]
    newMovie.posters = []
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

    

}

const getAll = async (req, res) => {

    const movie =  await Movie.find().populate('review actor')
    res.json(movie) 

}

const getSpecific = async (req, res) => {

    const findMovie = req.body
    const movie =  await Movie.find({name: findMovie.name}).populate('review actor')
    res.json(movie)

}

const addReview = async (req, res) => {

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

}

const updateRating = async (req, res) => {

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


}

const deleteMovie = async (req, res) => {

    await Movie.findOneAndDelete({name: req.body.name})
    res.send(`Deleted ${req.body.name}`)

}

const findByGenre = async (req, res) => {

    await Movie.findOneAndDelete({name: req.body.name})
    res.send(`Deleted ${req.body.name}`)

}

const businessDone = async (req, res) => {

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

}

const exportToCsv = async (req, res) => {

    // Get movies from mongoDb

    const json2csv = new Parser()

    const movies = await Movie.find().populate('rating review actor').lean().exec()
    .then((movies) => {

    // Parse json to csv 

        const csv =  json2csv.parse(movies)
        res.attachment('movies.csv')
        res.status(200).send(csv)

    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err)
    })


}


module.exports = {addMovie: addMovie, getAll: getAll, getSpecific: getSpecific, addReview: addReview,
                updateRating: updateRating, deleteMovie: deleteMovie,
                 findByGenre: findByGenre, businessDone: businessDone, exportToCsv: exportToCsv}
