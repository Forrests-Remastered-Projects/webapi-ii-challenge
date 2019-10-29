const express = require("express");
const db = require("../data/db");

const router = express.Router();
router.get("/", (req, res) => {
  db.find()
    .then(posts => res.status(200).json(posts))
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "The posts info couldn't be retrieved" });
    });
});

router.post("/", (req, res) => {
  const { title, contents } = req.body;
  if (!title || !contents) {
    return res.status(400).json({ error: "Error with Title/Contents" });
  }
  db.insert({ title, contents })
    .then(({ id }) => {
      db.findById(id, res)
        .then(([post]) => {
          res.status(201).json(post);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ error: "Error inserting post" });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Error getting post" });
    });
});
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.findById(id, res).then(post => {
    console.log(post);
    if (post.length) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ error: "Post with this ID does not exist" });
    }
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, contents } = req.body;
  if (!title && !contents) {
    return res
      .status(400)
      .json({ error: "Error, must include title and contents" });
  }
  console.log(req.body);
  db.update(id, { title, contents })
    .then(updated => {
      if (updated === 1) {
        db.findById(id).then(post => {
          res.status(200).json(post);
        });
        // res.status().json({ error: "Error, must add changes" });
        console.log(updated);
      } else {
        res.status(404).json({ error: "Post with id does not exist" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Error updating post" });
    });
});
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.remove(id)
    .then(removed => {
      if (removed) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: "Post with id does not exist" });
      }
    })
    .catch(err => {
      console.log("delete", err);
      res.status(500).json({ error: "Error deleting post" });
    });
});
router.get("/:post_id/comments", (req, res) => {
  const { post_id } = req.params;
  db.findById(post_id)
    .then(([post]) => {
      if (post) {
        db.findPostComments(post_id).then(comments => {
          res.status(200).json(comments);
        });
      } else {
        res.status(404).json({ error: "Post with id does not exist" });
      }
    })
    .catch(err => {
      console.log("get comments", err);
      res.status(500).json({ error: "Error getting post comments" });
    });
  router.post("/:post_id/comments", (req, res) => {
    const { post_id } = req.params;
    const { text } = req.body;

    db.insertComment({ text, post_id })
      .then(({ id: comment_id }) => {
        db.findCommentById(comment_id)
          .then(([comment]) => {
            if (comment) {
              res.status(200).json(comment);
            } else {
              res.status(404).json({ error: "Comment with id not found" });
            }
          })
          .catch(err => {
            console.log("post comment get", err);
            res.status(500).json({ error: "Error getting comment" });
          });
      })
      .catch(err => {
        console.log("post comment", err);
        res.status(500).json({ error: "Error adding comment" });
      });
  });
});
module.exports = router;
