const actor = require("../models/actor");
const movie = require("../models/movie");

const paginatedResults = async (model, req, res) =>{

    const page = parseInt(req.params.page)
    const limit = parseInt(req.params.limit)


    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results =  {}

    if (endIndex < model.length){
    results.next = {
        page : page + 1,
        limit:  limit
    }
    }

    if (startIndex > 0){
    results.previous = {
        page: page - 1,
        limit: limit
        }
    }

    results.results = await model.find().limit(limit).skip(startIndex).lean().exec()
    if(model === actor){
        res.render('actorList',{results: results.results})
    }
    else if(model === movie){
        res.render('movieList',{results: results.results})
    }
}

module.exports = paginatedResults