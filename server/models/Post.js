const mongoose = require("mongoose");
const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    text: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
    comment: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        text: {
          type: String,
          required: true,
        },
        name: {
          type: String,
        },
        avatar: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = Posts = mongoose.model("post", postSchema);
