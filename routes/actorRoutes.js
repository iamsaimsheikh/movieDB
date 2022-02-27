const express = require('express')
const router =  express.Router()
const Actor = require('../models/actor')
const {addActorValidation} = require('./validation')


// Get All Actors 

router.get('/all', async (req , res) => {

    const actor = await Actor.find()
    res.send(actor)

})

// Find One Name

router.get('/find', async (req , res) => {

    const find = req.body

    const actor = await Actor.findOne({name: find.name})
    if(!actor) return res.status(400).send('Not Found')

    res.send(actor)

})

// Add Actor


router.post('/add', async (req , res) => {

    const actor =  req.body

// Data Validation

    const {error} = addActorValidation(actor)
    if(error) return res.status(400).send(error.details[0].message)


// Check For Duplication

    const exist = await Actor.findOne({name: actor.name})
    if(exist) return res.status(400).send('Actor Already Exists!')

    const newActor = new Actor({
        name: actor.name,
        age: actor.age,
        gender: actor.gender
    })

    try {
        await newActor.save()
        res.send("New Actor Added")

    } catch (error) {
        res.send(error)

    }



})

router.post('/update', async (req , res) => {

    const updateActor = req.body

// Check Actor Exists

    const actor = await Actor.findOne({name: updateActor.name})
    if(!actor) return res.status(400).send('Actor Does Not Exists!')

    try {
        
        actor.name = updateActor.name
        actor.age = updateActor.age
        actor.gender = updateActor.gender
        await actor.save()


    } catch (error) {
        res.send(error)
    }

})



module.exports = router