﻿# Kuber

This is a simple full stack web application where an user can transfer money to other users in the database .
The server is built using the Express library with mongodb as integrated database .
The general overview of the app is -
An user can signup if he already has not an account or sign in if already existing . All the data of user will be stored in database . Every activity of the user will be authenticated using routes .

## File Structure Overview

The project is organized as follows:

```bash
├── .gitignore
├── Backend
    ├── config.js
    ├── db.js
    ├── index.js
    ├── middleware.js
    ├── package-lock.json
    ├── package.json
    ├── routes
    │   ├── account.js
    │   └── user.js
    └── type.js
├── Frontend
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── src
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    └── vite.config.js
└── README.md
```

# Backend

Backend server is built using the express library . Two different routes are created

- **User** - It is imported from /routes/user.js where all routes related to user is organized
- **Account** - It is imported from /routes/account.js .

## User route

It has basically 4 routes :

- **../register** - Here new user will create an account . Proper validation is applied using zod validator for data types .
  Password is hashed through bcrypt library and stored in hash form in database .
- **../login** - Here existing user will log into his existing account upon which he will be responded with token that would be used for
  authentication for other routes . For this token we have used Json Web Token(JWT) library .
- **../update** - Here user can update his existing data in database (firstname,lastname and password). Hashing of password function is also
  required so bcrypt library is brought upon use here too .
- **../bulk** - It is get route where all data is fetched from backend where there is certain substring in firstname or lastname .

## Account Route

It has basically 2 routes :

- **../balance** - This is used to get own account balance.
- **../transfer** - This is used to transfer the money to other existing accounts.

# Crucial learnings from bulding these routes .

## Hashing the password

bcrypt library installed provides the hashing function .

- First we hash the password and store in database . We define method for this user table (createhash) that hashes the password using the algorithm .
- Now password is stored in hashed form . So , password validation function is created that matches the input password .

```bash
// Method to generate a hash from plain text
userSchema.methods.createHash = async function (plainTextPassword) {
const saltRounds = 10;
const salt = await bcrypt.genSalt(saltRounds);
return await bcrypt.hash(plainTextPassword, salt);
};

// validating the candidate password with stored hash and hash function
userSchema.methods.validatePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

## Authentication of user before accessing routes like getting users via dashboard

Middleware is created in middleware.js that verifies the token to validate if the user can access the route .

```bash
const authmiddleware = (req, res, next) => {
  const authori = req.headers.authorization;
  if (!authori || !authori.startsWith("Bearer")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authori.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_secret);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
```

## For generating token in /register and /signin

```bash
const token = jwt.sign({ userId }, JWT_secret);
```

## Finding data in database with given values

```bash
user.findOne({username}); ##for users matching username
user.findOne({$or:[{username},{email}]}); ##for users matching any of the values
```

## Updating existing user

```bash
await User.updateOne({ _id: req.userId }, req.body);
```

## Finding names of users having given substring (provided in filter) in first name or last name

```bash
  users.find({$or : [{firstname : { $regex : filter , $options :"i"}},{lastname : {$regex : filter , $options :"i"}}]});
```

## Database transaction in mongodb.

During transaction

```bash
await updateOne({userId: req.userId},{$inc : {balance:-amount}});
```

followed by :-

```bash
await updateOne({userId: to},{$inc:{balance: amount}});
```

Problem in this approach is :-
Let say amount is decremented first , after that the server goes down or database shut downs(this happens), so there will be inconsistency caused as there is loss no information that where has this money gone .
To solve the problem , concept of transaction is there in which changes to both the ids will not be reflected in database until transaction is committed . It means either transaction will be completed or not happen at all .

In mongodb , concept of session is used

```bash
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
```
