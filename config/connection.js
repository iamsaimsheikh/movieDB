const mongoose = require('mongoose')
require('dotenv').config();
const url = `mongodb+srv://movieDb:${process.env.DB_PASS}@moviedb.dna8q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

const connect = () => mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {

    console.log('connected to database')

})
.catch((err) => {
    console.log(err)
})

module.exports = connect