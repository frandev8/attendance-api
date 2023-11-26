const cron = require("node-cron");

cron.schedule("42 0 * * *", () => {
  console.log("Running node-cron job at 12:20 AM");
  // Your code here
});
