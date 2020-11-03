const express = require("express");
const multer = require("multer");
const PostModel = require("../models/post");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

// STORE IMAGES
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid MIME type");
    if (isValid) {
      error = null;
    }
    callback(error, "backend/images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const extension = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + "-" + Date.now() + "." + extension);
  },
});

// ADD NEW POST
router.post(
  "/add",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new PostModel({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
    });
    post
      .save()
      .then((postResponse) => {
        res.status(201).json({
          message: "Post added successfully",
          post: {
            ...postResponse,
            id: postResponse._id,
          },
        });
      })
      .catch(() => {
        console.log("Could not add post.");
      });
  }
);

// GET ALL POSTS
router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize; // + converts from string to number
  const currentPage = +req.query.currentpage;
  const postQuery = PostModel.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
    .skip(pageSize * (currentPage - 1)) // skip this many posts
    .limit(pageSize); // limit results to this many results
  }
  postQuery.then((documents) => {
    fetchedPosts = documents;
    return PostModel.count();
  })
  .then(count => {
    res.status(200).json({
      message: "Posts fetched successfully",
      posts: fetchedPosts,
      maxPosts: count
    });
  });
});

// DELETE POST BY ID
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

// UPDATE POST BY ID
router.put(
  "/update/:id",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath; // if new file is not present [string]
    if (req.file) {
      //if a new file is present [file format]
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const newPost = new PostModel({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath
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
  }
);

// GET POST BY ID
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
