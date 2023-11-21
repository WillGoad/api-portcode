const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    displayname: String,
    username: String,
    email: String,
    qrcodeuri: String,
    verificationcode: String,
    expiryTime: Date,
    sendTime: Date,
    highlightedRepo: String,
    experiences: [String]
  })
);

module.exports = User;
