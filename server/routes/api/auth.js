const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const config = require("config");
const User = require("../../models/User");

//@route Get/api/auth
//@desc  Test Route
//@access Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
  }
});

//@route Post/api/login user
//@desc  Test Route
//@access Public
router.post(
  "/",
  [
    check("email", "please include a valid email ").isEmail(),
    check("password", "password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      //check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bycrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("JwtToken"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      //res.json({ msg: "User Registered" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
module.exports = router;
