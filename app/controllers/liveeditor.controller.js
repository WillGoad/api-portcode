const QRCode = require('qrcode');
// Import any necessary modules and dependencies
const User = require('../models/user.model');
const db = require('../models');

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
}

exports.createNewQRCode = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Generate QR code
    const qrCodeData = await QRCode.toDataURL(`portco.de/${user.username}`);

    // Step 3: Upload the QR code image using the upload middleware
    // Assuming the upload middleware is already set up
    const qrCodeImage = await upload(qrCodeData);

    // Step 4: Update the user's qrcodeimage field with the filename of the uploaded image
    user.qrcodeimage = qrCodeImage.filename;
    await user.save();

    res.status(200).json({ message: 'QR code created successfully' });
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

    if (!user.qrcodeimage) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    const bucket = new GridFSBucket(db.mongoose.connection.db, {
      bucketName: 'uploads'
    });

    // Get the QR code image file from GridFS
    const qrCodeImage = bucket.openDownloadStreamByName(user.qrcodeimage);

    // Set the content type and pipe the image file to the response
    res.set('content-type', 'image/png');
    qrCodeImage.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};