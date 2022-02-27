const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userRegisterValidation, userLoginValidation } = require('./validation')

router.post('/register', async ( req, res ) => {
    
    const data = req.body;

    const {error} = userRegisterValidation(data);
    if(error) return res.status(400).send(error.details[0].message)

    const userExists = await User.findOne({email:data.email}) 
    if (userExists) return res.status(400).send("Email Already Exists")

    const salt = await bcrypt.genSalt(10)
    const hashedPassword =  await bcrypt.hash(req.body.password, salt)

    let user =  new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: hashedPassword
    })

    try {

        await user.save()
        res.send('User Registered Successfully')

    } catch (error) {

        res.send(error)

    }


})

router.post('/login', async ( req, res ) => {
    
    const data = req.body;

    const {error} = userLoginValidation(data);
    if(error) return res.status(400).send(error.details[0].message)

    const userExists = await User.findOne({email:data.email}) 
    if (!userExists) return res.status(400).send("Invalid Email Or Password")

    const validPass = await bcrypt.compare(data.password , userExists.password)
    if (!validPass) return res.status(400).send("Invalid Email or Password")

    if( userExists && validPass ) {
        
        const token = jwt.sign({_id:userExists._id},process.env.TOKEN_SECRET);
        res.header('auth-token', token).send(token);

    }    

})

module.exports = router