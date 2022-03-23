const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");
//@route Post/api/posts
//@desc  Creating Posts
//@access Private
router.post(
  "/",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    try {
      let user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const newpost = await newPost.save();
      res.json(newpost);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: "Server Error" });
    }
  }
);

//@route Get/api/posts
//@desc  Gettig all posts
//@access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
});

//@route Get/api/posts/:id
//@desc  Gettig posts of a specific id
//@access Private

router.get("/:id", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    if (!posts) {
      return res.status(401).json({ msg: "No posts found" });
    }
    res.json(posts);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(500).json({ msg: "No posts found" });
    }
  }
});

//@route Delete/api/posts/:id
//@desc  Deleting posts by id
//@access Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    //check for the user that owns this post

    if (!posts) {
      return res.status(401).json({ msg: "No posts found" });
    }
    if (posts.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not an authorized user" });
    }
    await posts.remove();
    res.json(posts);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(500).json({ msg: "No posts found" });
    }
  }
});

//@route Put/api/posts/like/:id
//@desc  adding likes
//@access Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if the post is already liked or not
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id).length >
      0
    ) {
      return res.status(401).json({ msg: "Post Already Liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
});

//@route Put/api/posts/unlike/:id
//@desc  unliking a post
//@access Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if the post is already liked or not
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id).length ==
      0
    ) {
      return res.status(401).json({ msg: "Post has not been liked yet" });
    }

    //get removed index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
});

//@route Post/api/posts/comment/:id
//@desc  adding comment on post
//@access Private
router.post(
  "/comment/:id",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comment.unshift(newComment);
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: "Server Error" });
    }
  }
);

//@route Delete/api/posts/comment/:id/:commentid
//@desc  deleting comment of a post
//@access Private

router.delete("/comment/:id/:commentid", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //pulling out comment of a post
    const comment = post.comment.find(
      (comment) => comment.id == req.params.commentid
    );

    //making sure comment exists
    if (!comment) {
      return res.status(401).json({ msg: "Comment does not exists" });
    }

    //checking out the user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User is not authorized" });
    }
    //get removed index
    const removeIndex = post.comment
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comment.splice(removeIndex, 1);
    await post.save();
    res.json(post.comment);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
