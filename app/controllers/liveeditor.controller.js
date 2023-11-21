const QRCode = require('qrcode');
const User = require('../models/user.model');
const db = require('../models');
const upload = require('../middlewares/upload');
const mongoose = require('mongoose');
const GridFSBucket = mongoose.mongo.GridFSBucket;

// Define the controller function
exports.getUserInfo = async (req, res) => {
  try {
    // Get the current user's ID from the request object
    const userId = req.userId;

    // Find the user in the database by their ID
    const user = await User.findById(userId);

    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract the necessary user information
    const userInfo = {
      displayname: user.displayname,
      username: user.username,
      email: user.email,
      highlightedRepo: user.highlightedRepo,
      experiences: user.experiences,
    };

    // Return the user information in the response
    res.status(200).json(userInfo);
  } catch (error) {
    // If there is an error, return a 500 error
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { highlightedRepo, experiences } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { highlightedRepo, experiences },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQRCode = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.qrcodeuri) {
      const qrCodeData = await QRCode.toDataURL(`https://portco.de/${user.username}`);

      user.qrcodeuri = qrCodeData;
      await user.save();
    }

    res.status(200).json({ qrcodeuri: user.qrcodeuri });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};