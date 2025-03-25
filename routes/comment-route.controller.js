const express = require("express");
const Comment = require("../models/comment");
const router = express.Router();

router.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.findAll();
    res.json(comments);

  } catch (error) {
    res
    .status(500)
    .json({ error: "Error-500: Server error" });
    }
  }
);

router.get("/comment/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res
      .status(404)
      .json({ error: "Error-404: Comment not found" });
    }

    res.json(comment);
  } catch (error) {
    res
    .status(500)
    .json({ error: "Error-500: Server error" });
    }
  }
);

router.post("/comment", async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res
    .status(201)
    .json(comment);

  } catch (error) {
    res
    .status(400)
    .json({ error: "Error-400: Data entered incorrectly" });
    }
  }
);

router.put("/comment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Comment.update(req.body, { where: { id } });

    if (updated) {
      const updatedComment = await Comment.findByPk(id);
      res
      .json(updatedComment);
    } else {
      res
      .status(404)
      .json({ error: "Error-404: Comment not found" });
    }} catch (error) {
    res
    .status(500)
    .json({ error: "Error-500: Server error" });
    }
  }
);

router.delete("/comment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Comment.destroy({ where: { id } });

    if (deleted) {
      res
      .json({ message: "Comment deleted successfully" });
    } else {
      res
      .status(404)
      .json({ error: "Error-404: Comment not found" });
    }} catch (error) {
    res
    .status(500)
    .json({ error: "Error-500: Server error" });
    }
  }
);

module.exports = router;
