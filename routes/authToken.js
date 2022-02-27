const jwt = require('jsonwebtoken')

// Private Route Token Check

module.exports = function( req , res , next ){
    const token = req.header('auth-token');
    if(!token) return res.status(401).send("Access Denied")

// Verify User Has Token To Access The Route

    try {
        
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()

    } catch (error) {
        res.status(400).send("Invalid Token")
    }
}