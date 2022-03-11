const express = require('express')
const router = express.Router();
const verify = require('./authToken')
const MovieServ = require('../services/movieServices')


router.post('/add' , async (req, res) => {
    MovieServ.addMovie(req, res);
})

// Get All Movies

router.get('/all/:page/:limit', async (req , res) =>{
    MovieServ.getAll(req, res);
})

// Get One Movie

router.get('/find/:name', async (req , res) => {
    MovieServ.getSpecific(req, res)
})

// Add review to a movie

router.post('/add-review', verify , async (req , res) =>{
    MovieServ.addReview(req, res);
})

// Update Rating of a movie

router.post('/update-rating', verify , async (req , res) => {
    MovieServ.updateRating(req, res);
})

// Delete a movie

router.delete('/delete-movie', async (req , res) => {
    MovieServ.deleteMovie(req, res);
})

// Find Movie By Genre

router.get('/find-by-genre', async (req , res) => {
    MovieServ.findByGenre(req, res);
})

// Business done by Movies of a specific actor

router.get('/business-done', async (req , res) => {
    MovieServ.businessDone(req, res);
})

router.get('/exportToCsv', async (req, res) => {
    MovieServ.exportToCsv(req, res);
})

module.exports = router