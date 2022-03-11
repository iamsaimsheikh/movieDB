const express = require('express');
const router = express.Router();
const UserServ =  require('../services/userServices')
const verify = require('../routes/authToken')


// Register A User

router.post('/register', async ( req, res ) => {
    UserServ.userRegister(req, res);
})

// User Login

router.get('/login', async ( req, res ) => {
    UserServ.userLogin(req, res);
})

// Email Verification

router.post('/verify/:userId/:uniqueString', async (req, res) => {
    UserServ.userVerify(req, res);
})

// Password Reset

router.post('/passwordReset', async (req, res) => {
    UserServ.passwordReset(req, res);
})

// Set New Password

router.post('/setNewPassword', async (req, res) => {
    UserServ.setNewPassword(req, res);
})

// Upload Actor Picture

router.post('/uploadActorPicture', verify , async (req, res) => {
    UserServ.uploadActorPicture(req, res)
})

// Upload Movie Posters

router.post('/uploadMoviePoster', verify , async (req, res) => {
    UserServ.addMoviePoster(req, res)
})

module.exports = router