const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    displayname: String,
    username: String,
    email: String,
    verificationcode: String,
    expiryTime: Date,
    sendTime: Date,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  })
);

module.exports = User;
