const Users = require("../models/UserModel");
const getUsers = async (req, res) => {
    const allBooks = await Users.find({})
    res.status(200).json(allBooks)
}

const createUser = async (req, res) => {
    const User = new Users({ email: req.body.email, name: req.body.name, plateNumber: req.body.plateNumber})
    try {
        await User.save()
        res.status(200).json(User)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
module.exports = ({
    getUsers,
    createUser
})