const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({
      message: "Unauthorized!",
    });
  }
};


const authJwt = {
  verifyToken
};
module.exports = authJwt;
