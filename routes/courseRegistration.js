/**
 * @swagger
 * tags:
 *   name: CourseRegistration
 *   description: API endpoints for managing course registrations
 */

/**
 * @swagger
 * /registration/my-registrations:
 *   get:
 *     summary: Get the current user's course registrations
 *     tags: [CourseRegistration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *       - in: query
 *         name: edu_id
 *         schema:
 *           type: string
 *         description: Filter by education ID
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *         description: Filter by branch ID
 *     responses:
 *       200:
 *         description: List of course registrations
 *       404:
 *         description: No registrations found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /registration/all:
 *   get:
 *     summary: Get all course registrations (Admin only)
 *     tags: [CourseRegistration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *       - in: query
 *         name: edu_id
 *         schema:
 *           type: string
 *         description: Filter by education ID
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *         description: Filter by branch ID
 *     responses:
 *       200:
 *         description: List of course registrations
 *       404:
 *         description: No registrations found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /registration/:
 *   post:
 *     summary: Create a new course registration
 *     tags: [CourseRegistration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               edu_id:
 *                 type: integer
 *                 example: 1
 *               branch_id:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 example: 2025-12-31
 *             required:
 *               - edu_id
 *               - branch_id
 *               - date
 *     responses:
 *       200:
 *         description: Registration created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /registration/{id}:
 *   patch:
 *     summary: Update a course registration
 *     tags: [CourseRegistration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               edu_id:
 *                 type: string
 *               branch_id:
 *                 type: string
 *               course_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Registration not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /registration/{id}:
 *   delete:
 *     summary: Delete a course registration
 *     tags: [CourseRegistration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration deleted successfully
 *       404:
 *         description: Registration not found
 *       500:
 *         description: Internal server error
 */
const router = require("express").Router();
const logger = require("../logger");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/auth-role.middlewars");
const { courseRegistration, User, Branch } = require("../associations");
const {
  courseRegistrationValidator,
  courseRegistrationValidatorPatch,
} = require("../validators/courseregistration.validator");

router.get("/my-registrations", authMiddleware, async (req, res) => {
  try {
    let { limit, offset, edu_id, branch_id } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;

    let whereCondition = { user_id: req.user.id };

    if (edu_id) {
      whereCondition.edu_id = edu_id;
    }
    if (branch_id) {
      whereCondition.branch_id = branch_id;
    }
    const totalCount = await courseRegistration.count({
      where: whereCondition,
    });

    const registrations = await courseRegistration.findAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: EduCenter, attributes: ["name"] },
        { model: Branch, attributes: ["name"] },
      ],
    });

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = offset / limit + 1;

    if (!registrations) {
      return res
        .status(404)
        .send({ message: "You have not registered any course yet" });
    }
    logger.log({
      level: "info",
      message: `User ${req.user.id} fetched his registrations`,
    });
    res.send({
      data: registrations,
      totalCount,
      totalPages,
      currentPage,
      limit,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error to get my registration");
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/all", roleMiddleware(["admin"]), async (req, res) => {
  try {
    let { limit, offset, edu_id, branch_id } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;

    let whereCondition = {};

    if (edu_id) {
      whereCondition.edu_id = edu_id;
    }
    if (branch_id) {
      whereCondition.branch_id = branch_id;
    }
    const totalCount = await courseRegistration.count({
      where: whereCondition,
    });

    const registrations = await courseRegistration.findAll({
      where: whereCondition,
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = offset / limit + 1;

    if (!registrations.length) {
      return res.status(404).send({ message: "There is no registration yet" });
    }
    logger.log({
      level: "info",
      message: `User ${req.user.id} fetched his registrations`,
    });
    res.send({
      data: registrations,
      totalCount,
      totalPages,
      currentPage,
      limit,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error to get registrations");
    res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { error } = courseRegistrationValidator.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    const registration = await courseRegistration.create({
      ...req.body,
      user_id: req.user.id,
    });
    logger.log({
      level: "info",
      message: `User ${req.user.id} posted new registration`,
    });
    res.send(registration);
  } catch (error) {
    console.log(error);
    logger.error("Error to post registration");
    res.status(500).send({ message: "Internal server error" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { error } = courseRegistrationValidatorPatch.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    const registration = await courseRegistration.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!registration) {
      return res.status(404).send({ message: "Registration not found" });
    }
    await registration.update(req.body);
    logger.log("Admin patched registration");
    res.send(registration);
  } catch (error) {
    console.log(error);
    logger.error("Error to patch registration");
    res.status(500).send({ message: "Internal server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const registration = await courseRegistration.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!registration) {
      return res.status(404).send({ message: "Registration not found" });
    }
    await registration.destroy();
    logger.log("Admin deleted registration");
    res.send(registration.dataValues);
  } catch (error) {
    console.log(error);
    logger.error("Error to delete registration");
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
