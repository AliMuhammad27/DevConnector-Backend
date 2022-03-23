const moongoose = require("mongoose");
const config = require("config");
const { default: mongoose } = require("mongoose");
const db = config.get("DbUrl");

const connectDb = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to db");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
