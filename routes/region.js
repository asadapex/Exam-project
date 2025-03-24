const { roleMiddleware } = require("../middlewares/auth-role.middlewars");
const Region = require("../models/region");
const loger = require("../logger");
const { validateRegion } = require("../validators/region.validator");

const { Router } = require("express");

const router = Router();

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
            loger.log("error", "error in validation region !");
            console.log(error);
            return res
                .status(400)
                .send({ message: "Error in validation region" });
        }

        const bazaRegion = await Region.findOne({
            where: { name: value.name },
        });

        if (bazaRegion) {
            return res.status(400).send({ message: "Region already exists" });
        }

        const newRegion = await Region.create(value);

        loger.log("info", "Region created");
        res.status(200).send(newRegion);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in create region" });
        loger.log("error", "Error region created");
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
 *       500:
 *         description: Error fetching regions
 */
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const regions = await Region.findAndCountAll({
            offset: (pageNumber - 1) * limitNumber,
            limit: limitNumber,
        });

        loger.log("info", "Regions fetched with pagination");
        res.status(200).send({
            totalItems: regions.count,
            totalPages: Math.ceil(regions.count / limitNumber),
            currentPage: pageNumber,
            data: regions.rows,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error fetching regions" });
        loger.log("error", "Error fetching regions");
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
    const { id } = req.params;
    try {
        const bazaRegion = await Region.findByPk(id);
        console.log(bazaRegion);
        
        if (!bazaRegion) {
            loger.log("info", "region get by id: region not found");
            return res.status(404).send({ message: "Region not found" });
        }

        loger.log("info", "region get with by id");
        res.status(200).send(bazaRegion);
    } catch (error) {
        console.log(error);
        loger.log("error", "error in get region by id");
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
    const { id } = req.params;
    const { name } = req.body;
    try {
        const bazaRegion = await Region.findByPk(id);
        const oldName = bazaRegion;
        
        if (!bazaRegion) {
            loger.log("info", "region updated: region not found");
            return res.status(404).send({ message: "Region not found" });
        }

        await bazaRegion.update({ name: name });
        console.log(bazaRegion);

        loger.log("info", `region updated\n\nOld name: ${oldName.name}\n\nNew name ${bazaRegion.name}`);
        res.status(200).send(bazaRegion);
    } catch (error) {
        console.log(error);
        loger.log("error", "error in updated region by id");
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
    const { id } = req.params;
    try {
        const bazaRegion = await Region.findByPk(id);

        const regName = bazaRegion.name;
        
        if (!bazaRegion) {
            loger.log("info", `${id} - id region not found !`);
            return res.status(404).send({ message: "Region not found" });
        }

        await bazaRegion.destroy();

        loger.log("info", `region deleted\n\nName: ${regName}`);
        res.status(200).send({ message: "Region deleted" });
    } catch (error) {
        console.log(error);
        loger.log("error", "error in deleted region by id");
    }
});

module.exports = router;