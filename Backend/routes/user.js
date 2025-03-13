const express = require("express");
const user = express.Router();
const cors = require("cors");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { JWT_secret } = require("../config.js");

const { User } = require("../db.js");
const { usersignup } = require("../type.js");
user.use(express.json());
user.use(cors());

user.get("/", (req, res) => {
  res.send("Hello World");
});

user.post("/register", async (req, res) => {
  const reqpayload = usersignup.safeParse(req.body);
  console.log(reqpayload);
  if (!reqpayload.success) {
    return res.status(411).json({ message: "invalid inputs" });
  }
  const { Username, password, firstname, lastname, email } = req.body;
  if (!Username || !password || !firstname || !lastname || !email) {
    return res.status(422).json({ error: "Please fill all the fields" });
  }
  try {
    const user = new User({
      Username,
      // password: password,
      firstname,
      lastname,
      email,
    });
    const existingUser = await User.findOne({ $or: [{ email }, { Username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await user.createHash(req.body.password);
    user.password = hashedPassword;
    await user.save();
    const userId = user._id;
    const token = jwt.sign({ userId }, JWT_secret);
    res
      .status(201)
      .json({ message: "User registered successfully", token: token });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

user.post("/login", async (req, res) => {
  const { Username, password } = req.body;
  if (!Username || !password) {
    return res.status(422).json({ error: "Please fill all the fields" });
  }
  try {
    const user = await User.findOne({ Username });
    if (!user) {
      return res.status(404).json({ error: "Invalid username" });
    }
    const validPassword = await user.validatePassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const userId = user._id;
    const token = jwt.sign({ userId }, JWT_secret, { expiresIn: "24h" });
    res
      .status(200)
      .json({ message: "User logged in successfully", token: token });
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  }
});

module.exports = user;
