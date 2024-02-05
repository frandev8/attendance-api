const validateClockInTime = (req, res, next) => {
  const { mode } = req.query;

  if (mode === "start") {
    const currentTime = new Date();
    const clockInTimeStart = new Date(currentTime).setHours(10, 0, 0, 0);
    const clockInTimeEnd = new Date(currentTime).setHours(11, 0, 0, 0);

    if (currentTime < clockInTimeStart || currentTime > clockInTimeEnd) {
      return res.status(400).type("json").send({
        msg: "Clock in not allowed before 10:00 am and after 11:00 am",
      });
    }
  }

  next();
};

const validateBreakTime = (req, res, next) => {
  const { mode } = req.query;

  if (mode === "start") {
    const currentTime = new Date();
    const breakTimeStart = new Date(currentTime).setHours(14, 0, 0, 0);
    const breakTimeEnd = new Date(currentTime).setHours(15, 0, 0, 0);

    if (currentTime < breakTimeStart || currentTime > breakTimeEnd) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "Break not allowed before 2:00 pm and after 3:00 pm" });
    }
  }

  next();
};

const validateOvertimeTime = (req, res, next) => {
  const { mode } = req.query;

  if (mode === "start") {
    const currentTime = new Date();

    const overtimeTimeStart = new Date(currentTime).setHours(17, 0, 0, 0);
    const overtimeTimeEnd = new Date(currentTime).setHours(19, 0, 0, 0);

    if (currentTime < overtimeTimeStart || currentTime > overtimeTimeEnd) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "Overtime not allowed before 5:00 pm and after 7:00 pm" });
    }
  }

  next();
};

module.exports = {
  validateBreakTime,
  validateOvertimeTime,
  validateClockInTime,
};
