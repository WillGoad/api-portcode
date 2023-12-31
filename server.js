const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const dbConnect = async () => {
  try {
    await db.mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.isdu0x1.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    console.log("Successfully connect to MongoDB.");
  } catch (err) {
    console.error("Connection error", err);
    process.exit();
  }
}
dbConnect();

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/liveeditor.routes')(app);
require('./app/routes/public.routes')(app);


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
