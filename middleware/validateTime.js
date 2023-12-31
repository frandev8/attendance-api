const validateBreakTime = (req, res, next) => {
  const { mode } = req.query;

  if (mode === "start") {
    const currentTime = new Date();
    const breakTimeStart = new Date(currentTime).setHours(14, 0, 0, 0);
    const breakTimeEnd = new Date(currentTime).setHours(15, 0, 0, 0);

    if (currentTime < breakTimeStart && currentTime > breakTimeEnd) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "Break not allowed before 2:00 pm and after 3:00 pm" });
    }

    next();
  }

  next();
};

const validateOvertimeTime = (req, res, next) => {
  const { mode } = req.query;

  if (mode === "start") {
    const currentTime = new Date();

    const overtimeTimeStart = new Date(currentTime).setHours(17, 0, 0, 0);
    const overtimeTimeEnd = new Date(currentTime).setHours(20, 0, 0, 0);

    if (currentTime < overtimeTimeStart && currentTime > overtimeTimeEnd) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "Overtime not allowed before 3:00 pm and after 8:00 pm" });
    }

    next();
  }

  next();
};

module.exports = { validateBreakTime, validateOvertimeTime };
