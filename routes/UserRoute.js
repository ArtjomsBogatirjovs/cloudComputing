const express = require("express");
const router = express.Router()
const {
    getUsers,
    findUser,
    createUser,
    deleteUser,
    updateUser
} = require('../controllers/UserController')

router.get('/getUsers' , getUsers)
router.get('/findUser:email' , findUser)
router.post('/createUser' , createUser)

module.exports = router