const express = require("express");
const user = express.Router();

user.get("/user", (req, res) => {
  res.send("Hello World");
});

module.exports = user;
