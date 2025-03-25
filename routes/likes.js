const { Router } = require("express");
const { Op } = require("sequelize");
const roleAuthMiddleware = require("../middlewares/auth-role.middleware");
const LikeValidate = require("../validations/likes");
const Like = require("../models/likes");
const route = Router();

route.post("/", roleAuthMiddleware(["ADMIN"]),
 async (req, res) => {
  try {
    const { error } = likeSchema.validate(req.body);

    if (error) {
      return res.status(400).send({ error: error.details[0].message });
    }

    const { userId } = req.user.id;
    const { learningCenterId } = req.body;
    const one = await Like.create({ userId, learningCenterId });
    res.status(201).send(one);
  } catch (error) {

    res.status(400).send({ error: "Invalid data", details: error.message });
    console.log(error);
  }});

route.delete("/:id", roleAuthMiddleware(["ADMIN"]),
 async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Like.destroy({ where: { id } });

    if (deleted) {
      return res.send({ message: "Like deleted" });
    }

    res.status(404).send({ error: "Like not found" });
  } catch (error) {

    res.status(500).send({ error: "Server error", details: error.message });
  }});

module.exports = route;
