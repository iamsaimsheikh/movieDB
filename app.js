// library imports
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser');


// Configs
require('dotenv').config();
const app = express();
const router = express.Router();

// MongoDb Connection
const mongoDbConnection = require('./config/connection')
mongoDbConnection();

// Use Middlewares
app.use(express.json());
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use(fileUpload({useTempFiles: true}))

//routes
const userRoutes = require('./routes/userRoutes')
app.use('/user', userRoutes)

const actorRoutes = require('./routes/actorRoutes')
app.use('/actor', actorRoutes)

const movieRoutes = require('./routes/movieRoutes')
app.use('/movie', movieRoutes)




app.listen(process.env.PORT, () => {
  console.log(`listening at http://localhost:${process.env.PORT}`);
});