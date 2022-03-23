const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("./posts");
const config = require("config");
const request = require("request");
const { check, validationResult } = require("express-validator");
const { find } = require("../../models/User");
const { response } = require("express");

//@route Get/api/profile/me
//@desc  Get current users profiles
//@access private
router.get("/me", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res
        .status(401)
        .json({ msg: "There is no profile available for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route Post/api/profile
//@desc  Create or update profile
//@access private

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required").not().isEmpty(),
      check("skills", "skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ errors: erros.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //making a profile Obj
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (status) profileFields.status = status;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    console.log(profileFields.skills);

    //building social object
    profileFields.socialmedia = {};
    if (youtube) profileFields.socialmedia.youtube = youtube;
    if (facebook) profileFields.socialmedia.facebook = facebook;
    if (twitter) profileFields.socialmedia.twitter = twitter;
    if (instagram) profileFields.socialmedia.instagram = instagram;
    if (linkedin) profileFields.socialmedia.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update a profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //create a profile
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//@route Post/api/profile
//@desc  Get all profiles
//@access public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//@route Post/api/profile/:userid
//@desc  Get profile by user id
//@access public
router.get("/:userid", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userid,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(401).json({ msg: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    if (err.kind == "ObjectId") {
      res.status(500).json({ msg: "Profile not found" });
    }
  }
});

//@route Delete/api/profile
//@desc  Delete profiles,user,post
//@access public
router.delete("/", auth, async (req, res) => {
  try {
    //todo deleting posts
    await Post.deletMany({ user: req.user.id });

    //deleting profile
    await Profile.findOneAndDelete({ user: req.user.id }).populate("user", [
      "name",
      "avatar",
    ]);
    //deleting user
    await User.findOneAndDelete({ _id: req.user.id });
    res.json({ msg: "user deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//@route Put/api/profile/experience
//@desc  Adding Experience
//@access public
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "title is required").not().isEmpty(),
      check("company", "company is requiured").not().isEmpty(),
      check("from", "from is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;

    const nexExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(nexExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: "Server Error" });
    }
  }
);

//@route Delete/api/profile/experience/:expid
//@desc  Deleting Experience by expid
//@access Private

router.delete("/experience/:expid", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get removed index
    const removedIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.expid);
    profile.experience.splice(removedIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
});

//@route Put/api/profile/education
//@desc  Adding Experience
//@access private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required").not().isEmpty(),
      check("degree", "degree is required").not().isEmpty(),
      check("fieldofstudy", "fieldofstudy is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: "Server Error" });
    }
  }
);

//@route Delete/api/profile/education/:eduid
//@desc  Deleting Experience by expid
//@access Private

router.delete("/education/:eduid", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //delete index
    const educIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.eduid);
    profile.education.splice(educIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "server Erro" });
  }
});

//@route get/api/profile/github/:username
//@desc  Getting user repos from github
//@access public
// router.get("/github/:username", (req, res) => {
//   try {
//     const options = {
//       uri: `https://api.github.com/users/${
//         req.params.username
//       }/repos?per_page=5&sort=created:asc&client_id${config.get(
//         "gitHubClientId"
//       )}&client_secret=${config.get("gitHubSecret")}`,
//       method: "GET",
//       headers: { "user-agent": "node.js" },
//     };
//     request(options, (error, response, body) => {
//       if (error) console.error(error);
//       if (response.statusCode !== 200) {
//         return res.status(401).json({ msg: "No Github profile found" });
//       }
//       res.json(JSON.parse(body));
//     });
//   } catch (err) {
//     console.error(err.message);
//     return res.status(500).json({ msg: "Server Error" });
//   }
// });

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc
          &client_id=${config.get("gitHubClientId")}&client_secret=${config.get(
        "gitHubSecret"
      )}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Github profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
