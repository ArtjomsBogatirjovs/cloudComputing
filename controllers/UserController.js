const Users = require("../models/UserModel");
const getUsers = async (req, res) => {
    const allUsers = await Users.find({})
    res.status(200).json(allUsers)
}

const createUser = async (req, res) => {
    if (req.body.email == null || req.body.plateNumber == null) {
        return res.status(400).json({error: "Email and plate number mandatory!"});
    }
    if (await userExist(req.body.email, req.body.plateNumber)) {
        return res.status(400).json({error: "User with this email and plate number exist!"});
    }

    const User = new Users({email: req.body.email, name: req.body.name, plateNumber: req.body.plateNumber})
    try {
        await User.save()
        res.status(200).json(User)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const findUser = async (req, res) => {
    try {
        const userEmail = req.params.email;
        const user = await findUserByEmail(userEmail);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error finding user by email:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const findUserByEmail = async (email) => {
    return Users.findOne({email: email});
}

const findUserByPlate = async (plateNumber) => {
    return Users.findOne({plateNumber: plateNumber});
}

async function userExist(email, plateNumber) {
    let tempUser = await findUserByEmail(email);
    if (tempUser != null) {
        return true;
    }
    tempUser = await findUserByPlate(plateNumber);
    return tempUser != null;
}

module.exports = ({
    getUsers,
    createUser,
    findUser,
    findUserByPlate
})