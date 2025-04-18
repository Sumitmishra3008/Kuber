const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use(express.json());
const { User } = require("./db.js");

const router = require("./routes/user");
const account = require("./routes/account");

app.use("/api/v1/user", router);
app.use("/api/v1/account", account);

app.listen(3000, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", 3000);
});
