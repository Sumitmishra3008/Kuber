const express = require("express");
const app = express();
app.use(express.json());
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

app.listen(3000, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", 3000);
});
