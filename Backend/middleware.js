const jwt = require("jsonwebtoken");
const { JWT_secret } = require("./config");

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
module.exports = {
  authmiddleware: authmiddleware,
};
