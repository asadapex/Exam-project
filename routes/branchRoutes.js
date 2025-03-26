/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: API endpoints for managing branches
 */

/**
 * @swagger
 * /all:
 *   get:
 *     summary: Get all branches with optional filters
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of branches to return per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Page number to retrieve
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort branches by creation date
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter branches by name
 *       - in: query
 *         name: nameSort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort branches by name
 *       - in: query
 *         name: regionId
 *         schema:
 *           type: integer
 *         description: Filter branches by region ID
 *     responses:
 *       200:
 *         description: List of branches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalCount:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get a branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - region_id
 *               - edu_id
 *               - user_id
 *             properties:
 *               image:
 *                 type: string
 *                 description: URL of the branch image
 *                 example: https://example.com/image.jpg
 *               name:
 *                 type: string
 *                 description: Name of the branch
 *                 example: Main Branch
 *               phone:
 *                 type: string
 *                 description: Phone number of the branch
 *                 example: +998901234567
 *               region_id:
 *                 type: integer
 *                 description: ID of the region
 *                 example: 1
 *               edu_id:
 *                 type: integer
 *                 description: ID of the education center
 *                 example: 2
 *               user_id:
 *                 type: integer
 *                 description: ID of the user
 *                 example: 3
 *     responses:
 *       200:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /{id}:
 *   patch:
 *     summary: Update a branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
const express = require("express");
const { Branch, Region, EduCenter, User } = require("../associations");
const { Op } = require("sequelize");
const router = express.Router();
const {
  branchValidator,
  branchUpdateValidation,
} = require("../validators/branchValidation");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/auth-role.middlewars");

router.get("/all", authMiddleware, async (req, res) => {
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
      include: [
        { model: Region, attributes: ["name"] },
        { model: EduCenter, attributes: ["name"] },
        { model: User, attributes: ["name"] },
      ],
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

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);

    if (!branch) {
      return res.status(404).send({ messge: "Branch not found" });
    }
    res.send(branch);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

router.post("/", roleMiddleware(["admin", "ceo"]), async (req, res) => {
  try {
    const { error } = branchValidator.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    const branch = await Branch.create(req.body);
    res.send(branch);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

router.patch("/:id", roleMiddleware(["admin", "ceo"]), async (req, res) => {
  try {
    const one = await Branch.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!one) {
      return res.status(403).send({ message: "Forbidden" });
    }
    const { error } = branchUpdateValidation.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    await one.update(req.body);
    res.send(one);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

router.delete("/:id", roleMiddleware(["admin", "ceo"]), async (req, res) => {
  try {
    const one = await Branch.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!one) {
      return res.status(403).send({ message: "Forbidden" });
    }
    await one.destroy();
    res.send({ message: "Branch deleted" });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

module.exports = router;
