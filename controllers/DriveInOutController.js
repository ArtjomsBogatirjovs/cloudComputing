const DriveInOuts = require("../models/DriveInOutModel");
const constants = require('../constants');
const userController = require('../controllers/UserController')
const emailService = require('../service/emailService');

async function registerDrive(plateNumber, isDriveIn) {
    let type = constants.DRIVE_OUT;
    let driveIn = await findDriveInByPlateNumber(plateNumber);
    let driveInId = null;
    if (driveIn != null) {
        driveInId = driveIn._id;
    }
    if (isDriveIn) {
        type = constants.DRIVE_IN;
    }

    const newEntity = await DriveInOuts.create({
        plateNumber: plateNumber,
        type: type,
        reference: driveInId,
        time: Date.now(),
    });

    try {
        await newEntity.save()
        if (driveIn != null) {
            await updateDriveById(driveIn._id, {reference: newEntity._id})
        }
        const userByPlate = await userController.findUserByPlate(plateNumber);
        if (userByPlate != null) {
            emailService.sendMail(userByPlate.email, `Car with number: ${newEntity.plateNumber} registered in system! Time: ${newEntity.time}`)
        }
        console.log(`Car with number: ${newEntity.plateNumber} registered in system! Time: ${newEntity.time}`)
    } catch (error) {
        console.log("Failed to register of car drive in/out!", error);
    }
}

async function updateDriveById(id, update) {
    await DriveInOuts.findOneAndUpdate({_id: id}, update);
}

async function findDriveInByPlateNumber(plateNumber) {
    try {
        return await DriveInOuts.findOne({
            plateNumber: plateNumber,
            type: constants.DRIVE_IN,
            reference: null
        }).exec();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//because  Recognize of plate number not works, just to take random number what inside
async function findDriveIn() {
    try {
        return await DriveInOuts.findOne({
            type: constants.DRIVE_IN,
            reference: null
        }).exec();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getDriveIns = async (req, res) => {
    const allDriveIns = await DriveInOuts.find({
        type: constants.DRIVE_IN
    })
    res.status(200).json(allDriveIns)
}

const getDriveOuts = async (req, res) => {
    const allDriveIns = await DriveInOuts.find({
        type: constants.DRIVE_OUT
    })
    res.status(200).json(allDriveIns)
}

module.exports = ({
    registerDrive,
    getDriveIns,
    getDriveOuts,
    findDriveIn
})