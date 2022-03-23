const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const gravatar = require("gravatar");
const config = require("config");
//@route Post/api/users
//@desc  Test Route
//@access Public
router.post(
  "/",
  [
    check("name", "please provide a name").not().isEmpty(),
    check("email", "please include a valid email ").isEmail(),
    check(
      "password",
      "please enter a password of length 6 or greater"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      //check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User Already Exists" }] });
      }
      //user gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //Encrypt password
      const salt = await bycrypt.genSalt(10);
      user.password = await bycrypt.hash(password, salt);
      await user.save();
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
