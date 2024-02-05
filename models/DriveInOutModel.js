const mongoose = require('mongoose');

const driveInOutSchema  = new mongoose.Schema({
    plateNumber: String,
    type: String, // _in , _out
    reference: String, //_id of out or in object
    time: Date,
});

module.exports = mongoose.model('DriveInOut', driveInOutSchema);