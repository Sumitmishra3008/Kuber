const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use(express.json());
const { User } = require("./db.js");
const { usersignup } = require("./type.js");
// const user = require("./routes/user");

// app.use(user);
// app.listen(3000, (err) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log("Server is running on port 3000");
// });

const router = require("./routes/user");
// console.log(router);

// router.get("/", function (req, res, next) {
//   console.log("Router Working");
//   res.send("Hello World");
//   res.end();
// });

app.use("/api/v1/user", router);

// app.post("/api/v1/user/register", async (req, res) => {
//   const { Username, password, firstname, lastname, email } = req.body;
//   // if (!Username || !password || !firstname || !lastname || !email) {
//   //   return res.status(422).json({ error: "Please fill all the fields" });
//   // }
//   // try {
//   //   const user = new User({
//   //     Username,
//   //     password,
//   //     firstname,
//   //     lastname,
//   //     email,
//   //   });
//   //   await user.save();
//   //   res.status(201).json({ message: "User registered successfully" });
//   // } catch (err) {
//   //   res.status(500).json({ error: "Failed to register user" });
//   // }

//   await User.create({
//     Username: req.body.Username,
//     password: req.body.password,
//     firstname: req.body.firstname,
//     lastname: req.body.lastname,
//     email: req.body.email,
//   });
//   res.status(201).json({ message: "User registered successfully" });
// });

app.listen(3000, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", 3000);
});
