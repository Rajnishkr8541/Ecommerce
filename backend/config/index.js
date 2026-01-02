const dotenv = require("dotenv");
dotenv.config();

const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL
};

module.exports = config;
