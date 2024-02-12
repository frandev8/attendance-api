const allowedOrigin = [
  "http://localhost:3000",
  "http://localhost:3003",
  "http://localhost:5173",
  "https://www.kasapa-media-bbhx.onrender.com/",
  "https://kasapa-media-bbhx.onrender.com",
  "https://attendance-alpha-seven.vercel.app/",
  "https://kasapa-media-bbhx.onrender",
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
