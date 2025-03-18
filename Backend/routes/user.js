const express = require("express");
const user = express.Router();
const cors = require("cors");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { JWT_secret } = require("../config.js");
const { authmiddleware } = require("../middleware.js");
const bcrypt = require("bcrypt");

const { User, Account } = require("../db.js");
const { usersignup, updateuser } = require("../type.js");
user.use(express.json());
user.use(cors());

user.get("/bulk", authmiddleware, async (req, res) => {
  const filter = req.query.filter || "";
  const users = await User.find({
    $or: [
      { firstname: { $regex: filter, $options: "i" } },
      { lastname: { $regex: filter, $options: "i" } },
    ],
  });
  res.status(200).json({
    user: users.map((user) => {
      return {
        Username: user.Username,
        firstname: user.firstname,
        lastname: user.lastname,
        _id: user._id,
      };
    }),
  });
});

user.post("/register", async (req, res) => {
  const reqpayload = usersignup.safeParse(req.body); //zod validation for inputs
  // console.log(reqpayload);
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

    const existingUser = await User.findOne({ $or: [{ email }, { Username }] }); //finding if there is existing user with same email
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await user.createHash(req.body.password); //hashing the password
    user.password = hashedPassword;
    await user.save();

    const balance = Math.random() * 1000; //generating random balance for user
    const account = new Account({ userId: user._id, balance: balance });
    console.log(account);
    await account.save();
    const userId = user._id;
    const token = jwt.sign({ userId }, JWT_secret); //generating token
    res
      .status(201)
      .json({ message: "User registered successfully", token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

user.post("/login", async (req, res) => {
  const { Username, password } = req.body;
  if (!Username || !password) {
    return res.status(422).json({ error: "Please fill all the fields" });
  }
  try {
    const user = await User.findOne({ Username }); //finding user with username
    if (!user) {
      return res.status(404).json({ error: "Invalid username" });
    }
    const validPassword = await user.validatePassword(password); //validating password with hashing mechanism
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const userId = user._id;
    const token = jwt.sign({ userId }, JWT_secret, { expiresIn: "24h" }); //generating token
    res
      .status(200)
      .json({ message: "User logged in successfully", token: token });
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  }
});

user.put("/update", authmiddleware, async (req, res) => {
  // const reqpayload = updateuser.safeParse(req.body); //zod validation for inputs
  // console.log(reqpayload);
  // if (!reqpayload.success) {
  //   return res.status(411).json({ message: "invalid inputs" });
  // }
  // console.log(req.userId);
  if (req.body.password) {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const salt = await bcrypt.genSalt(saltRounds);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  await User.updateOne({ _id: req.userId }, req.body); //updating user details
  res.status(200).json({ message: "User updated successfully" });
});

module.exports = user;
