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
    const token = authorizationHeader.substring(7);

    try {
      const tokenKey = process.env.CLOCKIN_TOKEN_CODE;
      const decoded = jwt.verify(token, tokenKey);
      if (decoded) {
        req.user.attendanceId = decoded.id;
        next();
      }
    } catch (e) {
      next("Couldn't verify user clock-in token");
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
      const token = authorizationHeader.substring(7);

      try {
        const tokenKey = process.env.BREAK_TOKEN_CODE;
        const decoded = jwt.verify(token, tokenKey);
        if (decoded) {
          req.user.breakTime = decoded.breakTime;
          next();
        }
      } catch (e) {
        next("couldn't verify token");
      }
    } else {
      return res.status(401).send("Unauthorized access");
    }
  }

  next();
};

const verifyUserOvertimeToken = (req, res, next) => {
  const { mode } = req.query;

  if (mode === "end") {
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      // Extract the token
      const token = authorizationHeader.substring(7);

      try {
        const tokenKey = process.env.OVERTIME_TOKEN_CODE;
        const decoded = jwt.verify(token, tokenKey);
        if (decoded) {
          req.user.overtimeTime = decoded.overtimeTime;
          next();
        }
      } catch (e) {
        next("couldn't verify token");
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
