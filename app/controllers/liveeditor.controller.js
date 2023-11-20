
// Import any necessary modules and dependencies
const User = require('../models/user.model');

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
      email: user.email
    };

    // Return the user information in the response
    res.status(200).json(userInfo);
  } catch (error) {
    // If there is an error, return a 500 error
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
