const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const { unstable_useCacheRefresh } = require("react");
require("dotenv").config();
mongoose
  .connect(process.env.mongo_url)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

const userSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: [true, "Username is required"],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "minimum length should be 8"],
  },
  firstname: String,
  lastname: String,
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
});

// Method to generate a hash from plain text
userSchema.methods.createHash = async function (plainTextPassword) {
  // hashing user's salt and password with 10 iterations
  const saltRounds = 10;
  // first method to generate a salt and then create hash
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainTextPassword, salt);
  // second method to generate a hash or we can create in single method too
  // return await bcrypt.hash(plainTextPassword, saltRounds);
};

// validating the candidate password with stored hash and hash function
userSchema.methods.validatePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = {
  User: User,
};
