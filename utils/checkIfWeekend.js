const { isWeekend } = require("date-fns");

const checkIfWeekend = (date) => {
  if (isWeekend(date)) {
    return true;
  } else {
    return false;
  }
};

module.exports = checkIfWeekend;
