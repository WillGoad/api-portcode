const User = require('../models/user.model');

// Define the controller function
exports.getUserInfo = async (req, res) => {
  try {
    const { username_in } = req.params;

    // Find the user in the database by their username
    const user = await User.findOne({ username: username_in })

    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.qrcodeuri) {
      const qrCodeData = await QRCode.toDataURL(`https://portco.de/${user.username}`);

      user.qrcodeuri = qrCodeData;
    }

    // Extract the necessary user information
    const userInfo = {
      displayname: user.displayname,
      username: user.username,
      highlightedRepo: user.highlightedRepo,
      experiences: user.experiences,
      education: user.education,
      skills: user.skills,
      qrcodeuri: user.qrcodeuri
    };

    // Return the user information in the response
    res.status(200).json(userInfo);
  } catch (error) {
    // If there is an error, return a 500 error
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
