const zod = require("zod");
const usersignup = zod.object({
  Username: zod.string(),
  password: zod.string(),
  firstname: zod.string(),
  lastname: zod.string(),
  email: zod.string().email(),
});
module.exports = {
  usersignup: usersignup,
};
