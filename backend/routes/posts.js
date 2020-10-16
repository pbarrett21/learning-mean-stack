const express = require("express");
const PostModel = require("../models/post");

 const router = express.Router();

 router.post("/add", (req, res, next) => {
  const post = new PostModel({
    title: req.body.title,
    content: req.body.content,
  });
  post
    .save()
    .then((postResponse) => {
      res.status(201).json({
        message: "Post added successfully",
        id: postResponse._id,
      });
    })
    .catch(() => {
      console.log("Could not add post.");
    });
});

router.get("", (req, res, next) => {
  // const posts = [
  //   { id: "1", title: "First server post", content: "server content" },
  //   { id: "2", title: "Second server post", content: "server content" },
  //   { id: "3", title: "Third server post", content: "server content" },
  // ];
  PostModel.find().then((documents) => {
    res.status(200).json({
      message: "Posts fetched successfully",
      posts: documents,
    });
  });
});

router.delete("/delete/:id", (req, res, next) => {
  PostModel.deleteOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({
        message: "Post deleted!",
      });
    })
    .catch(() => {
      console.log("Could not delete post");
    });
});

router.put("/update/:id", (req, res, next) => {
  const newPost = new PostModel({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
  });
  PostModel.updateOne({ _id: req.params.id }, newPost)
    .then((result) => {
      res.status(200).json({
        message: "Update successful!",
      });
    })
    .catch((error) => {
      console.log("Could not update post: " + error);
    });
});

router.get("/byId/:id", (req, res, next) => {
  PostModel.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: "Could not find post.",
      });
    }
  });
});

module.exports = router;
