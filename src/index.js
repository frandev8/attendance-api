const express = require("express");
const cors = require("cors");
const corsOptions = require("../conf/allowOrigins");
const cookieParser = require("cookie-parser");
const connectDB = require("../conf/dbConn");
const mongoose = require("mongoose");
const { readFileSync } = require("fs");
const cron = require("node-cron");
const path = require("path");
const bodyParser = require("body-parser");

const {
  markAttendanceAbsent,
  clockOutAttendance,
} = require("../utils/markAttendance");
const getNonClockOutAttendance = require("../utils/getNonClockOutAttendance");

require("dotenv").config();

// eslint-clockOutAttendance-next-line no-undef
const port = process.env.PORT || 3000;
const {
  verifyUserLoginToken,
  verifyAdminLoginToken,
} = require("../middleware/validateToken");

const app = express();

app.use(bodyParser.json({ limit: "15mb" }));

connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/", require("../routes/root"));
app.use("/banner", require("../routes/root"));

// employee
app.use(
  "/employee/attendance",
  // verifyUserLoginToken,
  require("../routes/attendanceRouter")
);
app.use("/employee/timeOff", require("../routes/timeOffRouter"));
app.use("/employee/notification", require("../routes/notificationRouter"));
app.use("/employee/announcement", require("../routes/announcementRouter"));
app.use("/employee", require("../routes/employeeRouter"));
// app.use("/employee/attendance", verifyUserLoginToken);

// Mark employee as late at 10:30 am every day if not clocked in
// cron.schedule("09 1 * * *", async () => {
//   // Get the list of all employees (activates employees)
//   markAttendanceAbsent();

//   // markAbsent(activatedEmployees);
// });

// clock out every employee after 5:30 pm every day if they're not clocked out
// cron.schedule("29 13 * * *", async () => {
//   // Get the list of all attendance (not clocked out)
//   const nonClockedOutAttendance = await getNonClockOutAttendance();

//   clockOutAttendance(nonClockedOutAttendance);
// });

// app.use("/admin/confirm-attendance", verifyAdminLoginToken);

// load attendance
app.use(
  "/admin/attendanceSummary",
  require("../routes/attendanceSummaryRouter")
);

// confirm attendance
app.use("/admin/attendance", require("../routes/attendanceSummaryRouter"));

// time-off
app.use("/admin/timeOff", require("../routes/timeOffRouter"));

// notification
app.use("/admin/notification", require("../routes/notificationRouter"));

// announcement
app.use("/admin/announcement", require("../routes/announcementRouter"));
// app.use("/admin/confirm-attendance", verifyLoginToken);

// admin
app.use("/admin/", require("../routes/adminRouter"));

app.all("*", (req, res) => {
  const filePath = path.join(__dirname, "..", "404.html");

  const file = readFileSync(filePath);
  if (file) {
    return res.type("html").send(file);
  } else {
    res.type("json").send({ msg: "No Page Found!" });
  }
});

app.use(require("../middleware/errHandler"));

mongoose.connection.once("open", () => {
  app.listen(port, (err) => {
    if (err) throw new Error(`Couldn't listen on port ${port}`);
    else console.log("Loading from port ", port);
  });
});

mongoose.connection.on("error", (e) => {
  console.log("Error occurred from mongoose ");
});
