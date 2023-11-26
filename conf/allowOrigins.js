const allowedOrigin = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://www.kasapa-media.onrender.com/",
  "https://kasapa-media.onrender.com/",
  "https://kasapa-media.onrender",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigin.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by cors"));
    }
  },
  credential: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
