const express = require("express");
const connectDb = require("./config/db");
const cors = require("cors");
const app = express();
const Port = process.env.Port || 5000;
connectDb();
app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use(cors());

app.use(express.json({ extended: false }));
//for separate routes
app.use("/api/posts", require("./routes/api/posts"));

app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/auth", require("./routes/api/auth"));

app.listen(Port, () => {
  console.log(`Server is Running on ${Port}`);
});
