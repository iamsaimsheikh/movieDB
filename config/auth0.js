require('dotenv').config()

const auth0Config = {
        authRequired: false,
        auth0Logout: true,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        baseURL: "https://nova-movie-db.herokuapp.com/",
        clientID: process.env.CLIENT_ID,
        secret: process.env.SECRET,
      }

module.exports = auth0Config
