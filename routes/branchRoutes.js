const express = require("express");
const { Branch } = require("../associations");
const { Op } = require("sequelize");
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    let { limit, offset, createdAt, name, nameSort, regionId } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    const whereClause = {};
    const order = [];

    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }

    if (regionId) {
      whereClause.region_id = regionId;
    }

    if (createdAt) {
      order.push(["createdAt", createdAt === "asc" ? "ASC" : "DESC"]);
    }

    if (nameSort) {
      order.push(["name", nameSort === "asc" ? "ASC" : "DESC"]);
    }
    const totalCount = await Branch.count({ where: whereClause });

    const branches = await Branch.findAll({
      where: whereClause,
      limit,
      offset,
      order,
    });

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = offset / limit + 1;

    res.send({
      data: branches,
      totalCount,
      totalPages,
      currentPage,
      limit,
    });
  } catch (error) {
    res.status(500).send({ error: "Error-500: Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);

    if (!branch) {
      return res.status(404).send({ error: "Error-404: Branch not found" });
    }

    res.json(branch);
  } catch (error) {
    res.status(500).send({ error: "Error-500: Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.send(branch);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Branch.update(req.body, { where: { id } });

    if (updated) {
      const updatedBranch = await Branch.findByPk(id);
      res.json(updatedBranch);
    } else {
      res.status(404).json({ error: "Error-404: Branch not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error-500: Server error" });
  }
});

router.delete("/branch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Branch.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: "Branch deleted successfully" });
    } else {
      res.status(404).json({ error: "Error-404: Branch not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error-500: Server error" });
  }
});

module.exports = router;
