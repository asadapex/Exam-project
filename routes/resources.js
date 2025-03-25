const { authMiddleware } = require("../middlewares/auth-role.middlewars");
const logger = require("../logger");
const { Resource, Category, User } = require("../associations");
const { Op } = require("sequelize");
const router = require("express").Router();
const {
  resourceValidator,
  resourceUpdateValidator,
} = require("../validators/resource.validator");

router.get("/all", authMiddleware, async (req, res) => {
  try {
    let { limit, offset, name, nameSort, createdAt, categoryId } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;

    const whereClause = {};
    const order = [];

    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }

    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    if (createdAt) {
      order.push(["createdAt", createdAt === "asc" ? "ASC" : "DESC"]);
    }

    if (nameSort) {
      order.push(["name", nameSort === "asc" ? "ASC" : "DESC"]);
    }

    const totalCount = await Resource.count({ where: whereClause });
    const all = await Resource.findAll({
      where: whereClause,
      limit,
      offset,
      include: [
        { model: Category, attributes: ["name"] },
        { model: User, attributes: ["name"] },
      ],
    });

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = offset / limit + 1;
    logger.log({ info: "User fetched all resources" });
    res.send({
      data: all,
      totalCount,
      totalPages,
      currentPage,
      limit,
    });
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ["name"] },
        { model: User, attributes: ["name"] },
      ],
    });
    if (resource) {
      logger.info("User fetched resource by id");
      res.send(resource);
    } else {
      logger.error("Resource not found");
      res.status(404).send({ message: "Resource not found" });
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { error } = resourceValidator.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    const resource = await Resource.create(req.body);
    logger.info("User created resource");
    res.send(resource);
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "user") {
      const resource = await Resource.findOne({
        where: { id: req.params.id, user_id: req.user.id },
      });
      if (!resource) {
        return res.status(404).send({ message: "Resource not found" });
      }
      const { error } = resourceUpdateValidator.validate(req.body);
      if (error) {
        return res.status(400).send({ message: error.details[0].message });
      }
      await resource.update(req.body);
      logger.info("User updated resource");
      res.send(resource);
    } else if (req.user.role === "admin" || req.user.role === "super-admin") {
      const resource = await Resource.findByPk(req.params.id);
      if (!resource) {
        return res.status(404).send({ message: "Resource not found" });
      }
      const { error } = resourceUpdateValidator.validate(req.body);
      if (error) {
        return res.status(400).send({ message: error.details[0].message });
      }
      await resource.update(req.body);
      logger.info("Admin updated resource");
      res.send(resource);
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "user") {
      const resource = await Resource.findOne({
        where: { id: req.params.id, user_id: req.user.id },
      });
      if (!resource) {
        return res.status(404).send({ message: "Resource not found" });
      }
      const { error } = resourceUpdateValidator.validate(req.body);
      if (error) {
        return res.status(400).send({ message: error.details[0].message });
      }
      await resource.destroy();
      logger.info("User deleted resource");
      res.send(resource.dataValues);
    } else if (req.user.role === "admin" || req.user.role === "super-admin") {
      const resource = await Resource.findByPk(req.params.id);
      if (!resource) {
        return res.status(404).send({ message: "Resource not found" });
      }
      await resource.destroy();
      logger.info("Admin deleted resource");
      res.send(resource.dataValues);
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
