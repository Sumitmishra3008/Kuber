const express = require("express");
const user = express.Router();
const cors = require("cors");

const { User } = require("../db.js");
user.use(express.json());
user.use(cors());

user.get("/", (req, res) => {
  res.send("Hello World");
});

user.post("/register", async (req, res) => {
  const { Username, password, firstname, lastname, email } = req.body;
  if (!Username || !password || !firstname || !lastname || !email) {
    return res.status(422).json({ error: "Please fill all the fields" });
  }
  try {
    const user = new User({
      Username,
      password,
      firstname,
      lastname,
      email,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

module.exports = user;
