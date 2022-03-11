const express = require('express')
const router =  express.Router()
const ActorServ = require('../services/actorServices')


// Get All Actors 

router.get('/all/:page/:limit', async (req , res) => {
    ActorServ.getAll(req, res);
})

// Find One Name

router.get('/find/:name', async (req , res) => {
   ActorServ.findOne(req, res);
})

// Add Actor

router.post('/add', async (req , res) => {
    ActorServ.addActor(req, res)
})

// Update Actor

router.post('/update', async (req , res) => {
    ActorServ.updateActor(req, res)
})

// Get Actors From Dummy Api

router.get('/getActorFromApi', async (req, res, next) => {
    ActorServ.getActorFromApi(req, res, next);
})



module.exports = router