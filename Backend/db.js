const mongoose = require("mongoose");
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
    unique: [true, "Username should be unique"],
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
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = {
  User: User,
};
