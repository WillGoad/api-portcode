const sgMail = require('@sendgrid/mail')

const db = require("../models");
const User = db.user;
const Role = db.role;
const TempUser = db.tempuser;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//Function to send verification codes by email
const sendVerificationCode = async (email, code) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email,
    from: 'no-reply@portco.de', // Change to your verified sender
    subject: 'Verify your email address',
    text: 'Verification code:',
    html: `<p>Hi there</p><p>Here's your verification code: ${code}</p><p>Or click the link below</p><a href="https://app.portco.de/onboarding?verify=${code}&email=${email}">Verify Email</a>`,
  };
  try {
    await sgMail.send(msg);
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
}

const signToken = id => jwt.sign({ id },
  process.env.JWT_SECRET,
  {
    algorithm: 'HS256',
    allowInsecureKeySizes: true,
    expiresIn: 86400, // 24 hours
  });

exports.verifysignup = async (req, res) => {
  try {
    //Check if email is already in use
    const existingUser = await User.findOne({ email: req.body.email });
    console.log(existingUser);
    if (existingUser) {
      res.status(401).send({ message: "Email is already in use." });
      return;
    }
    const existingTempUser = await TempUser.findOne({ email: req.body.email });
    if (existingTempUser) {
      //User exists and code hasn't expired
      if (existingTempUser.expiryTime > new Date().getTime()) {
        //Send time is less than a minute ago
        if (existingTempUser.sendTime > new Date().getTime() - 60000) {
          res.status(425).send({ message: "Please wait a minute before requesting another verification code." });
          return;
        } else {
          //Send new code
          await sendVerificationCode(req.body.email, tempCode);
          res.status(200).send({ message: "New code sent!" });
          return;
        }
      } else {
        //Delete old user
        await existingTempUser.deleteOne();
      }
    }
    const tempCode = Math.floor(100000 + Math.random() * 900000)
    const sendTime = new Date().getTime();
    const expiryTime = new Date().getTime() + 6300000;
    const tempUser = new TempUser({
      displayname: req.body.name,
      email: req.body.email,
      verificationcode: tempCode,
      expiryTime,
      sendTime
    });
    await tempUser.save();
    await sendVerificationCode(req.body.email, tempCode);
    res.status(200).send({ message: "Verification code sent!" });
  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
}


/*
The signup function should:
1. Take email and verification code
1.2. If email is already in use, return error
2. Check DB for temp user with email and confirm code is correct and hasn't expired
3. If code is correct, create user in DB and delete temp user, if email isn't already in use
NB: Use display name and email from temp user, create new unique username in format XXXXX-XXXXX-XXXXX(randomly generated) and user role
*/

//Checks code and creates user account
exports.signup = async (req, res) => {
  try {
    //Check if email is already in use
    const existingUser = await User.findOne({ email: req.body.email });
    console.log(existingUser);
    if (existingUser) {
      res.status(401).send({ message: "Email is already in use." });
      return;
    }
    //Check for temp user and confirm code correct and hasn't expired
    const existingTempUser = await TempUser.findOne({ email: req.body.email });
    if (existingTempUser) {
      if (existingTempUser.verificationcode === req.body.code) {
        if (existingTempUser.expiryTime < new Date().getTime()) {
          //Delete old user
          // await existingTempUser.deleteOne();
          console.log("Existed but expired");
          res.status(401).send({ message: "Verification code expired. Please request a new one." });
          return;
        }
      } else {
        res.status(401).send({ message: "Incorrect verification code." });
        return;
      }
      // Generate username
      const username = Math.random().toString(36).substring(2, 7) + '-' + Math.random().toString(36).substring(2, 7) + '-' + Math.random().toString(36).substring(2, 7);

      const user = new User({
        displayname: existingTempUser.displayname,
        username,
        email: req.body.email,
      });
      if (req.body.roles) {
        const roles = await Role.find({ name: { $in: req.body.roles } });
        user.roles = roles.map(role => role._id);
        await user.save();
        res.status(200).send({ message: "User was registered successfully with special roles!" });
      } else {
        const role = await Role.findOne({ name: "user" });
        user.roles = [role._id];
        await user.save();
        const token = signToken(user.id);
        res.status(200).send({
          message: "User was registered successfully!",
          id: user._id,
          username: user.username,
          email: user.email,
          accessToken: token
        });
      }
      await existingTempUser.deleteOne();
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: err });
    return;
  }
};

exports.verifysignin = async (req, res) => {
  try {
    //Check if email is already in use
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      res.status(401).send({ message: "Email not found." });
      return;
    }

    //Code exists and code hasn't expired
    //Send time is less than a minute ago
    if (existingUser.verificationcode && existingUser.expiryTime > new Date().getTime() && existingUser.sendTime > new Date().getTime() - (1000 * 60)) {
      res.status(425).send({ message: "Please wait a minute before requesting another verification code." });
      return;
    }

    //Send new code
    const tempCode = Math.floor(100000 + Math.random() * 900000)
    const sendTime = new Date().getTime();
    const expiryTime = new Date().getTime() + (1000 * 60 * 5); //5 minutes in ms

    await sendVerificationCode(req.body.email, tempCode);
    existingUser.verificationcode = tempCode;
    existingUser.expiryTime = expiryTime;
    existingUser.sendTime = sendTime;
    await existingUser.save();
    res.status(200).send({ message: "Verification code sent!" });
    return;

  } catch (err) {
    res.status(500).send({ message: err });
    return;
  }
}

exports.signin = async (req, res) => {
  try {
    //Check if email is already in use
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      res.status(401).send({ message: "No account found with that email." });
      return;
    }

    //Code expired
    if (existingUser.expiryTime < new Date().getTime()) {
      res.status(401).send({ message: "Verification code expired. Please request a new one." });
      return;

    }

    //Code incorrect
    if (existingUser.verificationcode !== req.body.code) {
      res.status(401).send({ message: "Incorrect verification code." });
      return;
    }

    const token = signToken(existingUser._id);
    res.status(200).send({
      message: "User signed in successfully!",
      accessToken: token
    });
    return;
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: err });
    return;
  }
};
