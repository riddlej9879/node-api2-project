const express = require("express");
const db = require("./data/db.js");

const server = express();
const port = 4000;

server.use(express.json());

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

server.get("/posts", (req, res) => {
  try {
    db.find().then((posts) => {
      return res.status(200).json(posts);
    });
  } catch (err) {
    res.status(500).json({ message: "Posts did not get got" });
  }
});

server.get("/posts/:id", (req, res) => {
  const id = req.params.id;
  try {
    db.findById(id).then((post) => {
      return res.status(200).json(post);
    });
  } catch (err) {
    res.status(500).json({ message: "Individual post remains unretrieved" });
  }
});

server.get("/posts/:id/comments", (req, res) => {
  const id = req.params.id;
  try {
    db.findPostComments(id).then((post) => {
      return res.status(200).json(post);
    });
  } catch (err) {
    res.status(500).json({ message: "Post comments not found" });
  }
});

server.post("/posts", (req, res) => {
  try {
    if (!req.body.title || !req.body.contents) {
      return res.status(400).json({
        message: "Please provide title and contents for the post",
      });
    }
    const newPost = {
      title: req.body.title,
      contents: req.body.contents,
    };

    db.insert(newPost).then((oldPost) => {
      db.findById(oldPost.id).then((post) => {
        return res.status(201).json(post);
      });
    });
  } catch (err) {
    res.status(500).json({
      message: "Error posting new post to the database",
    });
  }
});

server.post("/posts/:id/comments", (req, res) => {
  const id = req.params.id;
  try {
    db.findById(id).then((post) => {
      if (!req.body.text) {
        return res
          .status(400)
          .json({ message: "Please provide text for the comment" });
      }

      const newComment = {
        post_id: id,
        text: req.body.text,
      };

      db.insertComment(newComment).then((post) => {
        db.findCommentById(post.id).then((comment) => {
          return res.status(201).json(comment);
        });
      });
    });
  } catch (err) {
    res.status(500).json({
      message: "Error posting new comment to the database",
    });
  }
});

server.put("/posts/:id", (req, res) => {
  try {
    const id = req.params.id;
    if (!req.body.title || !req.body.contents) {
      return res.status(400).json({
        message: "Please provide a title and contents for the post.",
      });
    }

    const updatedPost = {
      title: req.body.title,
      contents: req.body.contents,
    };

    db.update(id, updatedPost).then((post) => {
      if (post != 1) {
        return res.status(404).json({
          message: "The post with the specified ID does not exist.",
        });
      }

      db.findById(id).then((post) => {
        return res.status(200).json(post);
      });
    });
  } catch (err) {
    res.status(500).json({
      message: "The post information could not be modified.",
    });
  }
});

server.delete("/posts/:id", (req, res) => {
  try {
    const id = req.params.id;
    db.findById(id).then((post) => {
      console.log(post);
      if (post.length == 0) {
        return res.status(404).json({
          message: `Post with id ${id} could not be found`,
        });
      }

      db.remove(id).then(() => {
        return res.status(200).json(post);
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Could not delete post" });
  }
});
