const Actor = require('../models/actor')
const {addActorValidation} = require('../routes/validation')
const axios = require('axios').default
const fs = require('fs')

const getAll = async (req, res) => {

    const actor = await Actor.find()
    res.send(actor)

}

const findOne = async (req, res) => {
    
    const find = req.body

    const actor = await Actor.findOne({name: find.name})
    if(!actor) return res.status(400).send('Not Found')

    res.send(actor)

}

const addActor = async (req, res) => {
    
    const actor =  req.body

    // Data Validation
    
        const {error} = addActorValidation(actor)
        if(error) return res.status(400).send(error.details[0].message)
    
    
    // Check For Duplication
    
        const exist = await Actor.findOne({name: actor.name})
        if(exist) return res.status(400).send('Actor Already Exists!')
    
        const newActor = new Actor({
            picture: null,
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
    
}

const updateActor = async (req, res) => {
    
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
    
}

const getActorFromApi = async (req, res) => {

    const limit = 100
    const convertedData = []

    // Request to Dummy Api

    const data = await axios.get(`https://dummyapi.io/data/v1/user?limit=${limit}`,
     {headers : {'app-id': '6224eefc6968db59679f73fa'}})
     .then(response => {
         const data = response.data.data

    // Modify actor data according to requirements and schema

         data.forEach(item => {

            const modifyActor = {
                picture: item.picture,
                name: item.firstName + " " + item.lastName,
                age: Math.floor(Math.random() * (55 - 30 + 1) + 30),
                gender: item.title == 'mr' ? 'male' : 'female', 
            }

            convertedData.push(modifyActor)

    // Pass picture links of each actor to download

             const download = axios.get(item.picture, { responseType: 'stream'})
             .then(response => {
                 response.data.pipe(fs.createWriteStream(`${item.firstName}.jpg`))
             })
             .catch(err => {
                 res.send(err)
             })
            })
     })
     .catch(err => {
         res.send(err)
     })


    // Store multiple actors in db

     await Actor.insertMany(convertedData)
     .then(response => {
         res.status(201).send('Actors Added Successully!')
     })
     .catch(err => {
         res.status(400).send(err)
     })

}

module.exports = {getAll: getAll, findOne: findOne, addActor: addActor, updateActor: updateActor, getActorFromApi: getActorFromApi}