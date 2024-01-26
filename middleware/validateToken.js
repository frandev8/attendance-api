const jwt = require("jsonwebtoken");

const verifyUserLoginToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    // Extract the token
    const token = authorizationHeader.substring(7);

    try {
      const tokenKey = process.env.TOKEN_SECRET;
      const decoded = jwt.verify(token, tokenKey);
      if (decoded) {
        console.log("next called!");
        req.user = decoded;
        next();
      }
    } catch (e) {
      next("couldn't verify token");
    }
  } else {
    return res.status(401).send("Unauthorized access");
  }
};

const verifyUserCheckinToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    // Extract the token
    const token = authorizationHeader.substring(7).split("/")[0];

    const tokenKey = process.env.CLOCKIN_TOKEN_CODE;

    const decoded = jwt.verify(token, tokenKey);

    if (decoded) {
      console.log("check in confirmed..");
      req.user = { attendanceId: decoded.id };
      next();
    }
  } else {
    return res.status(401).send("Unauthorized access");
  }
};

const verifyUserBreakToken = (req, res, next) => {
  const { mode } = req.query;

  if (mode === "end") {
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      // Extract the token
      const token = authorizationHeader.substring(7).split("/")[1];

      const tokenKey = process.env.BREAK_TOKEN_CODE;

      const decoded = jwt.verify(token, tokenKey);

      if (decoded) {
        req.user = { ...req.user, breakStartTime: decoded.breakTime };
      }
    } else {
      return res.status(401).send("Unauthorized access");
    }
  }
  console.log("next next called!");

  next();
};

const verifyUserOvertimeToken = (req, res, next) => {
  const { mode } = req.query;

  if (mode === "end") {
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      // Extract the token
      const token = authorizationHeader.substring(7).split("/")[1];

      const tokenKey = process.env.OVERTIME_TOKEN_CODE;
      const decoded = jwt.verify(token, tokenKey);
      if (decoded) {
        req.user = { ...req.user, overtimeTime: decoded.overtimeTime };
      }
    } else {
      return res.status(401).send("Unauthorized access");
    }
  }

  next();
};

const verifyAdminLoginToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    // Extract the token
    const token = authorizationHeader.substring(7);

    try {
      const tokenKey = process.env.TOKEN_SECRET;
      const decoded = jwt.verify(token, tokenKey);
      if (decoded) {
        req.user = decoded;
        next();
      }
    } catch (e) {
      next("couldn't verify token");
    }
  } else {
    return res.status(401).send("Unauthorized access");
  }
};

module.exports = {
  verifyUserLoginToken,
  verifyAdminLoginToken,
  verifyUserBreakToken,
  verifyUserCheckinToken,
  verifyUserOvertimeToken,
};
