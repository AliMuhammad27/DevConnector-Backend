const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //getting the token
  const token = req.header("x-auth-token");

  //check if no token
  if (!token) {
    return res
      .status(401)
      .json({ msg: "No Auth Token - Authorization Denied" });
  }

  //verifying token
  try {
    const decoded = jwt.verify(token, config.get("JwtToken"));
    req.user = decoded.user;
  } catch (err) {
    return res.status(401).json({ msg: "Invalid Token" });
  }

  next();
};
