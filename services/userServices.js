const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userRegisterValidation, userLoginValidation } = require('../routes/validation')
const uuid = require('uuid').v4;
const {sendUserVerificationEmail} = require('./mailer');
const UserVerification = require('../models/userVerification');

const userRegister = async (req, res) => {

    const data = req.body;

    // Data Validation
    
        const {error} = userRegisterValidation(data);
        if(error) return res.status(400).send(error.details[0].message)
    
        const userExists = await User.findOne({email:data.email}) 
        if (userExists) return res.status(400).send("Email Already Exists")
    
    // Encrypting Password
    
        const salt = await bcrypt.genSalt(10)
        const hashedPassword =  await bcrypt.hash(req.body.password, salt)
    
        let user =  new User({
            _id: uuid(),
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword,
            verified: false
        })
    
        try {
    
            await user.save()
            sendUserVerificationEmail(user._id, user.email, res)
    
        } catch (error) {
    
            res.send(error.message)
    
        }

}

const userLogin = async (req, res) => {

    const data = req.body;

    const {error} = userLoginValidation(data);
    if(error) return res.status(400).send(error.details[0].message)

// Data Validation

    const userExists = await User.findOne({email:data.email}) 
    if (!userExists) return res.status(400).send("Invalid Email Or Password")

// Password Verification

    const validPass = await bcrypt.compare(data.password , userExists.password)
    if (!validPass) return res.status(400).send("Invalid Email or Password")

// Generating JWT

    if( userExists && validPass ) {
        
        const token = jwt.sign({_id:userExists._id},process.env.TOKEN_SECRET);
        res.header('auth-token', token).send(token);

    }    

}

const userVerify = async (req, res) => {

    let {userId, uniqueString} = req.params
    

   await UserVerification.findOne({userId: userId})
    .then(verification => {
        
        const {expiresAt} = verification;
        const hashedUniqueString = verification.uniqueString;

        if(expiresAt < Date.now){
            UserVerification.deleteOne({userId: userId})
            .then(() => {
                User.findByIdAndDelete({userId: userId})
            })
            .catch((err) => {
                res.send('Verification link expired!')
                console.log(err);
            })
        }
        else {
            
             bcrypt.compare(uniqueString, hashedUniqueString)
             .then(result => {
                if(result){
                    User.updateOne({_id: userId}, {verified: true})
                    .then(() => {
                        console.log("deleting User")
                        UserVerification.deleteOne({userId: verification.userId})
                    })
                    .catch(err => {
                        res.send("Error updating verification status")
                        console.log(err.message)
                    })
                }
                else {
                    res.send("Invalid verification details passed!")
                }
            }).catch(err => {
                res.send("Error occured while comparing hashed string!")
                console.log(err.message);
            })

        }
    })
    .catch(err => {
        res.status(400).send(err.message)
    })

}

module.exports = {userRegister: userRegister, userLogin: userLogin, userVerify: userVerify}