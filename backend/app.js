const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const PostModel = require("./models/post");

const app = express();

// paul
// ijBXX4xh6lFProyL

mongoose
  .connect(
    "mongodb+srv://paul:ijBXX4xh6lFProyL@cluster0.uq9zt.mongodb.net/meandb?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to database.");
  })
  .catch(() => {
    console.log("Error connecting to database");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS, PUT"
  );
  next();
});

app.post("/posts/add", (req, res, next) => {
  const post = new PostModel({
    title: req.body.title,
    content: req.body.content,
  });
  post.save().then(postResponse => {
    res.status(201).json({
      message: "Post added successfully",
      id: postResponse._id
    });
  })
  .catch(() => {
    console.log("Could not add post.")
  });
});

app.get("/posts", (req, res, next) => {
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

app.delete("/posts/delete/:id", (req, res, next) => {
  PostModel.deleteOne({_id: req.params.id}).then((result) => {
    res.status(200).json({
      message: "Post deleted!"
    });
  })
  .catch(() => {
    console.log("Could not delete post");
  });
});

app.put("/posts/update/:id", (req, res, next) => {
  const newPost = new PostModel({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
  });
  PostModel.updateOne({_id: req.params.id}).then((result) => {
    res.status(200).json({
      message: "Update successful!"
    });
  })
  .catch(() => {
    console.log("Could not update post");
  });
});

module.exports = app;
