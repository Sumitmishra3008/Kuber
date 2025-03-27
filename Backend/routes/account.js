const express = require("express");
const account = express.Router();
const cors = require("cors");
account.use(cors());
account.use(express.json());
const { Account, User } = require("../db.js");
const { authmiddleware } = require("../middleware.js");
const { startSession, default: mongoose } = require("mongoose");

account.get("/balance", authmiddleware, async (req, res) => {
  const account = await Account.findOne({ userId: req.userId });
  if (!account) {
    return res.status(404).json({ message: "Account not found" });
  }
  res.status(200).json({ balance: account.balance });
});

account.post("/transfer", authmiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { to, amount } = req.body;
  if (!to || !amount) {
    return res.status(422).json({ message: "Please fill all the fields" });
  }
  if (amount <= 0) {
    return res.status(422).json({ message: "Amount should be greater than 0" });
  }
  const account = await Account.findOne({ userId: req.userId }).session(
    session
  );
  if (!account) {
    return res.status(404).json({ message: "Login to continue" });
  }
  if (account.balance < amount) {
    return res.status(422).json({ message: "Insufficient balance" });
  }
  const sendingto = Account.findOne({ userId: to }).session(session);
  if (!sendingto) {
    return res.status(404).json({ message: "Account not found" });
  }

  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);
  await session.commitTransaction();
  session.endSession();
  res.status(200).json({ message: "Amount transferred successfully" });
});

// account.post("/transfer", authmiddleware, async (req, res) => {
//   const { amount, to } = req.body;

//   const account = await Account.findOne({
//     userId: req.userId,
//   });

//   if (account.balance < amount) {
//     return res.status(400).json({
//       message: "Insufficient balance",
//     });
//   }

//   const toAccount = await Account.findOne({
//     userId: to,
//   });

//   if (!toAccount) {
//     return res.status(400).json({
//       message: "Invalid account",
//     });
//   }

//   await Account.updateOne(
//     {
//       userId: req.userId,
//     },
//     {
//       $inc: {
//         balance: -amount,
//       },
//     }
//   );

//   await Account.updateOne(
//     {
//       userId: to,
//     },
//     {
//       $inc: {
//         balance: amount,
//       },
//     }
//   );

//   res.json({
//     message: "Transfer successful",
//   });
// });

module.exports = account;
