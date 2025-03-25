const { Router } = require("express");
const { roleMiddleware } = require("../middlewares/auth-role.middlewars");
const loger = require("../logger");
const { validEdu } = require("../validators/eduValidation");
const EduCenter = require("../models/edCenter");
const { Region, User } = require("../associations");

const router = Router();

/**
 * @swagger
 * /eduCenter:
 *   post:
 *     summary: Create a new EduCenter
 *     tags:
 *       - EduCenter
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "EduCenter A"
 *               region_id:
 *                 type: integer
 *                 example: 1
 *               user_id:
 *                 type: integer
 *                 example: 2
 *               location:
 *                 type: string
 *                 example: "Tashkent"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *     responses:
 *       201:
 *         description: EduCenter created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { error, value } = validEdu(req.body);
        if (error) {
            loger.log("info", "Error in validation edu center");
            return res.status(400).send({ message: error.details[0].message });
        }
        loger.log("info", "EduCenter Created");
        const newEduCenter = await EduCenter.create(value);
        res.status(201).send(newEduCenter);
    } catch (error) {
        console.log(error);
        loger.log("error", "Error in create EduCenter");
        res.status(500).send({ message: "Server error" });
    }
});

/**
 * @swagger
 * /eduCenter:
 *   get:
 *     summary: Get all EduCenters with pagination, sorting, and optional filtering by name
 *     tags:
 *       - EduCenter
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc for ascending, desc for descending)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter EduCenters by name
 *     responses:
 *       200:
 *         description: A list of EduCenters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       region_id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       location:
 *                         type: string
 *                       phone:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = "asc", name } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const whereClause = name ? { name: { [Op.like]: `%${name}%` } } : {};

        const eduCenters = await EduCenter.findAndCountAll({
            where: whereClause,
            offset: (pageNumber - 1) * limitNumber,
            limit: limitNumber,
            order: [["name", sort.toLowerCase() === "desc" ? "DESC" : "ASC"]],
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name"],
                },
                {
                    model: Region,
                    as: "region",
                    attributes: ["id", "name"],
                },
            ],
        });

        loger.log(
            "info",
            "EduCenters fetched with pagination, sorting, and filtering"
        );
        res.status(200).send({
            totalItems: eduCenters.count,
            totalPages: Math.ceil(eduCenters.count / limitNumber),
            currentPage: pageNumber,
            data: eduCenters.rows,
        });
    } catch (error) {
        console.log(error);
        loger.log("error", "Error fetching EduCenters");
        res.status(500).send({ message: "Server error" });
    }
});

/**
 * @swagger
 * /eduCenter/{id}:
 *   get:
 *     summary: Get an EduCenter by ID
 *     tags:
 *       - EduCenter
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: EduCenter ID
 *     responses:
 *       200:
 *         description: EduCenter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 region_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 location:
 *                   type: string
 *                 phone:
 *                   type: string
 *       404:
 *         description: EduCenter not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const eduCenter = await EduCenter.findOne({
            where: { id: id },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name"],
                },
                {
                    model: Region,
                    as: "region",
                    attributes: ["id", "name"],
                },
            ],
        });
        if (!eduCenter) {
            loger.log("info", `EduCenter with ID ${id} not found`);
            return res.status(404).send({ message: "EduCenter not found" });
        }

        loger.log("info", `EduCenter fetched by ID: ${id}`);
        res.status(200).send(eduCenter);
    } catch (error) {
        console.log(error);
        loger.log("error", "Error fetching EduCenter by ID");
        res.status(500).send({ message: "Server error" });
    }
});

/**
 * @swagger
 * /eduCenter/{id}:
 *   patch:
 *     summary: Update an EduCenter by ID
 *     tags:
 *       - EduCenter
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: EduCenter ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated EduCenter"
 *               region_id:
 *                 type: integer
 *                 example: 1
 *               user_id:
 *                 type: integer
 *                 example: 2
 *               location:
 *                 type: string
 *                 example: "Samarkand"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *     responses:
 *       200:
 *         description: EduCenter updated successfully
 *       404:
 *         description: EduCenter not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", roleMiddleware(["admin"]), async (req, res) => {
    const { id } = req.params;
    try {
        const { error, value } = validEdu(req.body);
        if (error) {
            loger.log("error", "Validation error in update EduCenter");
            return res.status(400).send({ message: error.details[0].message });
        }

        const eduCenter = await EduCenter.findByPk(id);
        if (!eduCenter) {
            loger.log("info", `EduCenter with ID ${id} not found`);
            return res.status(404).send({ message: "EduCenter not found" });
        }

        await eduCenter.update(value);
        loger.log("info", `EduCenter updated: ${id}`);
        res.status(200).send(eduCenter);
    } catch (error) {
        console.log(error);
        loger.log("error", "Error updating EduCenter");
        res.status(500).send({ message: "Server error" });
    }
});

/**
 * @swagger
 * /eduCenter/{id}:
 *   delete:
 *     summary: Delete an EduCenter by ID
 *     tags:
 *       - EduCenter
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: EduCenter ID
 *     responses:
 *       200:
 *         description: EduCenter deleted successfully
 *       404:
 *         description: EduCenter not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
    const { id } = req.params;
    try {
        const eduCenter = await EduCenter.findByPk(id);
        if (!eduCenter) {
            loger.log("info", `EduCenter with ID ${id} not found`);
            return res.status(404).send({ message: "EduCenter not found" });
        }

        await eduCenter.destroy();
        loger.log("info", `EduCenter deleted: ${id}`);
        res.status(200).send({ message: "EduCenter deleted successfully" });
    } catch (error) {
        console.log(error);
        loger.log("error", "Error deleting EduCenter");
        res.status(500).send({ message: "Server error" });
    }
});

EduCenter.belongsTo(Region, { as: "region", foreignKey: "region_id" });
EduCenter.belongsTo(User, { as: "user", foreignKey: "user_id" });
module.exports = router;

