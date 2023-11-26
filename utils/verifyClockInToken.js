const jwt = require("jsonwebtoken");

const verifyClockInToken = (token) => {
  try {
    const tokenKey = process.env.CLOCKIN_TOKEN_CODE;
    const decoded = jwt.verify(token, tokenKey);
    return decoded;
  } catch (e) {
    throw e;
  }
};

module.exports = { verifyClockInToken };
