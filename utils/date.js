const { isWeekend } = require("date-fns");
const { isAfter, isBefore, set, startOfWeek, endOfWeek } = require("date-fns");


const doesDepartEarly = (departTime) => {
  // Set the specific time (in this case, 10:00 AM)
  const specificTime = set(departTime, {
    hours: 17,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  // Check if the current time is after the specific time
  return isBefore(departTime, specificTime);
};

const doesArriveLate = (commenceTime) => {
  // Set the specific time (in this case, 10:00 AM)
  const specificTime = set(commenceTime, {
    hours: 10,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  // Check if the current time is after the specific time
  return isAfter(commenceTime, specificTime);
};

const isAbsent = (lastCheckInDate) => {
  // Set the specific time (in this case, 10:00 AM)
  const specificTime = set(new Date(), {
    // hours: 0,
    // minutes: 30,
    // seconds: 0,
    // milliseconds: 0,
  });
  // Check if the current time is after the specific time

  return isAfter(specificTime, lastCheckInDate);
};

const checkIfWeekend = (date) => {
  if (isWeekend(date)) {
    return true;
  } else {
    return false;
  }
};

const getStartAndEndDatesOfWeek = (date) => {
  const startOfWeekDate = startOfWeek(new Date(date));
  const endOfWeekDate = endOfWeek(new Date(date));

  return {
    start: new Date(startOfWeekDate.getTime() + 86400000),
    end: new Date(endOfWeekDate.getTime() + 86400000),
  };
};



module.exports = {
  checkIfWeekend,
  doesDepartEarly,
  doesArriveLate,
  isAbsent,
  getStartAndEndDatesOfWeek,
};
