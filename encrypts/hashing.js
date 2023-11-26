const bcrypt = require("bcryptjs");

function hashPwd(pass) {
  return bcrypt.hashSync(pass, 8); // salt round
}

function doHashPwdMatch(pass, hashedPwd) {
  return bcrypt.compareSync(pass, hashedPwd);
}

module.exports = {
  hashPwd,
  doHashPwdMatch,
};
