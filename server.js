const dbConfig = require("./app/config/db.config.js");
const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;
const dbConnect = async () => {
  try {
    await db.mongoose.connect(`mongodb+srv://${dbConfig.USER}:${dbConfig.PASS}@cluster0.isdu0x1.mongodb.net/${dbConfig.DB}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log("Successfully connect to MongoDB.");
    initial();
  } catch (err) {
    console.error("Connection error", err);
    process.exit();
  }
}
dbConnect();



const initial = async () => {
  try {
    const count = await Role.estimatedDocumentCount();
    if (count === 0) {
      try {
        new Role({ name: "user" }).save();
        new Role({ name: "moderator" }).save();
        new Role({ name: "admin" }).save();
        console.log("added 'user', 'moderator', 'admin' to roles collection");
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);


// set port, listen for requests
const PORT = process.env.PORT || 8080;
const listen = async () => {
  try {
    await app.listen(PORT);
    console.log(`Server is running on port ${PORT}.`);
  } catch (err) {
    console.error(err);
  }
}
listen();
