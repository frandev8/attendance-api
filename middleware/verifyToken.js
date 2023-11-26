const jwt = require("jsonwebtoken");

const verifyUserLoginToken = (req, res, next) => {
  // const { loginToken } = req.body;

  // console.log(loginToken);

  const loginToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im15bW9tOSIsImlkIjoiNjU0YWNiZjQ4NjI2Y2Y3NGMxZDQ1NTQ5IiwiaWF0IjoxNjk5NzQ1ODYzfQ.qe4mcWOUzlWBLrfqw5kEnSj0Rm2qASsclkWvjPgCeSk";

  if (!loginToken) {
    return res.status(401).send("Unauthorized access"); // Redirect to welcome page if no token found
  }

  try {
    const tokenKey = process.env.TOKEN_SECRET;
    const decoded = jwt.verify(loginToken, tokenKey);
    req.user = decoded;
    if (decoded) next();
  } catch (e) {
    next("couldn't verify token");
  }
};

const verifyAdminLoginToken = (req, res, next) => {
  const { loginToken } = req.body;

  // console.log(loginToken);

  const adminLoginToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiNjU1NzcyY2ZhNzhiYTYzNzZkNGM3YjMyIiwidXNlcm5hbWUiOiJmcmFuZGV2OCIsImlhdCI6MTcwMDI2MTMxMH0.KW3mecPVPgB1WixOu9Rh8IfnP8tii99U9LjU6fzmZXM";

  if (!adminLoginToken) {
    return res.status(401).send("Unauthorized access"); // Redirect to welcome page if no token found
  }

  try {
    const tokenKey = process.env.TOKEN_SECRET;
    const decoded = jwt.verify(adminLoginToken, tokenKey);
    req.user = decoded;
    if (decoded) next();
  } catch (e) {
    next("couldn't verify token");
  }
};

module.exports = { verifyUserLoginToken, verifyAdminLoginToken };
