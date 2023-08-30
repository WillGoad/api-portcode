const mongoose = require("mongoose");

const TempUser = mongoose.model(
  "TempUser",
  new mongoose.Schema({
    displayname: String,
    email: String,
    verificationcode: String,
    expiryTime: Date,
    sendTime: Date,
  })
);

module.exports = TempUser;
