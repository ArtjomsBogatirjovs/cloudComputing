const express = require("express");
const router = express.Router()
const {
    getDriveIns,
    getDriveOuts
} = require('../controllers/DriveInOutController')

router.get('/getDriveIns' , getDriveIns)
router.get('/getDriveOuts' , getDriveOuts)

module.exports = router