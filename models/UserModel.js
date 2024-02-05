const express = require("express");
const mongoose = require('mongoose');

const userSchema  = new mongoose.Schema({
    email: String,
    name: String,
    plateNumber: String,
});

module.exports = mongoose.model('users', userSchema);