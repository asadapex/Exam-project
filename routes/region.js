const { roleMiddleware } = require("../middlewares/auth-role.middlewars");
const Region = require("../models/region");
const logger = require("../logger");
const { validateRegion } = require("../validators/region.validator");
const { Router } = require("express");

const router = Router();

const handleError = (res, error, message) => {
    console.error(error);
    logger.log("error", message);
    res.status(500).send({ message });
};

/**
 * @swagger
 * /region:
 *   post:
 *     summary: Create a new region
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Regions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Region"
 *     responses:
 *       200:
 *         description: Region created successfully
 *       400:
 *         description: Validation error or region already exists
 *       500:
 *         description: Server error
 */
router.post("/", roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { error, value } = validateRegion(req.body);

        if (error) {
            logger.log("error", "Validation error in region creation");
            return res.status(400).send({ message: "Error in validation region" });
        }

        const existingRegion = await Region.findOne({ where: { name: value.name } });
        if (existingRegion) {
            return res.status(400).send({ message: "Region already exists" });
        }

        const newRegion = await Region.create(value);
        logger.log("info", "Region created successfully");
        res.status(200).send(newRegion);
    } catch (error) {
        handleError(res, error, "Error creating region");
    }
});

/**
 * @swagger
 * /region:
 *   get:
 *     summary: Get all regions with pagination
 *     tags:
 *       - Regions
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
 *     responses:
 *       200:
 *         description: A list of regions
 *       500:
 *         description: Error fetching regions
 */
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const regions = await Region.findAndCountAll({
            offset: (page - 1) * limit,
            limit,
        });

        logger.log("info", "Regions fetched with pagination");
        res.status(200).send({
            totalItems: regions.count,
            totalPages: Math.ceil(regions.count / limit),
            currentPage: page,
            data: regions.rows,
        });
    } catch (error) {
        handleError(res, error, "Error fetching regions");
    }
});

/**
 * @swagger
 * /region/byId/{id}:
 *   get:
 *     summary: Get a region by ID
 *     tags:
 *       - Regions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     responses:
 *       200:
 *         description: Region details
 *       404:
 *         description: Region not found
 *       500:
 *         description: Server error
 */
router.get("/byId/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const region = await Region.findByPk(id);

        if (!region) {
            logger.log("info", `Region not found with ID: ${id}`);
            return res.status(404).send({ message: "Region not found" });
        }

        logger.log("info", "Region fetched by ID");
        res.status(200).send(region);
    } catch (error) {
        handleError(res, error, "Error fetching region by ID");
    }
});

/**
 * @swagger
 * /region/{id}:
 *   patch:
 *     summary: Update a region by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Regions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Region Name"
 *     responses:
 *       200:
 *         description: Region updated successfully
 *       404:
 *         description: Region not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", roleMiddleware(["admin", "super-admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const region = await Region.findByPk(id);

        if (!region) {
            logger.log("info", `Region not found with ID: ${id}`);
            return res.status(404).send({ message: "Region not found" });
        }

        const { error, value } = validateRegion(req.body);
        if (error) {
            logger.log("error", "Validation failed for region update");
            return res.status(400).send({ message: "Validation failed" });
        }

        const oldName = region.name;
        await region.update(value);

        logger.log(
            "info",
            `Region updated: Old name: ${oldName}, New name: ${region.name}`
        );
        res.status(200).send(region);
    } catch (error) {
        handleError(res, error, "Error updating region by ID");
    }
});

/**
 * @swagger
 * /region/{name}:
 *   post:
 *     summary: Get a region by its name
 *     tags:
 *       - Regions
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the region
 *     responses:
 *       200:
 *         description: Region details
 *       404:
 *         description: Region not found
 *       500:
 *         description: Server error
 */
router.post("/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const region = await Region.findOne({ where: { name } });

        if (!region) {
            logger.log("info", `Region not found with name: ${name}`);
            return res.status(404).send({ message: "Region not found" });
        }

        logger.log("info", `Region fetched by name: ${name}`);
        res.status(200).send(region);
    } catch (error) {
        handleError(res, error, "Error fetching region by name");
    }
});

/**
 * @swagger
 * /region/{id}:
 *   delete:
 *     summary: Delete a region by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Regions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     responses:
 *       200:
 *         description: Region deleted successfully
 *       404:
 *         description: Region not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const region = await Region.findByPk(id);

        if (!region) {
            logger.log("info", `Region not found with ID: ${id}`);
            return res.status(404).send({ message: "Region not found" });
        }

        const regionName = region.name;
        await region.destroy();

        logger.log("info", `Region deleted: ${regionName}`);
        res.status(200).send({ message: "Region deleted" });
    } catch (error) {
        handleError(res, error, "Error deleting region by ID");
    }
});

module.exports = router;