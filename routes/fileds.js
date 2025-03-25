const { Router } = require("express");
const loger = require("../logger");
const Fileds = require("../models/fileds");
const { roleMiddleware } = require("../middlewares/auth-role.middlewars");
const { validateFileds } = require("../validators/fileds.validator");

const router = Router();

/**
 * @swagger
 * /fields:
 *   post:
 *     summary: Create a new field
 *     tags:
 *       - Fields
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Field"
 *     responses:
 *       200:
 *         description: Field created successfully
 *       400:
 *         description: Validation error or field already exists
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
    try {
        const { error, value } = validateFileds(req.body);
        if (error) {
            loger.log("error", "Error in validation post router");
            return res.status(400).send({ message: "Validation error" });
        }
        const bazaField = await Fileds.findOne({ where: { name: value.name } });
        if (bazaField) {
            loger.log("info", `${value.name} - this field already exists`);
            return res
                .status(400)
                .send({ message: "This field already exists" });
        }
        const newField = await Fileds.create({
            name: value.name,
            image: "img.png",
        });
        loger.log("info", `New field created: ${value.name}`);
        res.status(200).send(newField);
    } catch (error) {
        console.log(error);
        loger.log("error", "Error in create field");
        res.status(500).send({ message: "Server error" });
    }
});

/**
 * @swagger
 * /fields:
 *   get:
 *     summary: Get all fields with pagination
 *     tags:
 *       - Fields
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
 *         description: A list of fields
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
 *                       image:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const fields = await Fileds.findAndCountAll({
            offset: (pageNumber - 1) * limitNumber,
            limit: limitNumber,
        });

        loger.log("info", "Fields fetched with pagination");
        res.status(200).send({
            totalItems: fields.count,
            totalPages: Math.ceil(fields.count / limitNumber),
            currentPage: pageNumber,
            data: fields.rows,
        });
    } catch (error) {
        console.log(error);
        loger.log("error", "Error fetching fields");
        res.status(500).send({ message: "Server error" });
    }
});
/**
 * @swagger
 * /fields:
 *   get:
 *     summary: Get all fields with pagination and sorting
 *     tags:
 *       - Fields
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
 *     responses:
 *       200:
 *         description: A list of fields
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
 *                       image:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = "asc" } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const fields = await Fileds.findAndCountAll({
            offset: (pageNumber - 1) * limitNumber,
            limit: limitNumber,
            order: [["name", sort.toLowerCase() === "desc" ? "DESC" : "ASC"]],
        });

        loger.log("info", "Fields fetched with pagination and sorting");
        res.status(200).send({
            totalItems: fields.count,
            totalPages: Math.ceil(fields.count / limitNumber),
            currentPage: pageNumber,
            data: fields.rows,
        });
    } catch (error) {
        console.log(error);
        loger.log("error", "Error fetching fields");
        res.status(500).send({ message: "Server error" });
    }
});

/**
 * @swagger
 * /fields/{id}:
 *   patch:
 *     summary: Update a field by ID
 *     tags:
 *       - Fields
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Field ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Field Name"
 *     responses:
 *       200:
 *         description: Field updated successfully
 *       404:
 *         description: Field not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const field = await Fileds.findByPk(id);
        if (!field) {
            loger.log("info", `Field with ID ${id} not found`);
            return res.status(404).send({ message: "Field not found" });
        }
        await field.update({ name });
        loger.log("info", `Field updated: ${id}`);
        res.status(200).send(field);
    } catch (error) {
        console.log(error);
        loger.log("error", "Error updating field");
        res.status(500).send({ message: "Server error" });
    }
});

/**
 * @swagger
 * /fields/{id}:
 *   delete:
 *     summary: Delete a field by ID
 *     tags:
 *       - Fields
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Field ID
 *     responses:
 *       200:
 *         description: Field deleted successfully
 *       404:
 *         description: Field not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const field = await Fileds.findByPk(id);
        if (!field) {
            loger.log("info", `Field with ID ${id} not found`);
            return res.status(404).send({ message: "Field not found" });
        }
        await field.destroy();
        loger.log("info", `Field deleted: ${id}`);
        res.status(200).send({ message: "Field deleted successfully" });
    } catch (error) {
        console.log(error);
        loger.log("error", "Error deleting field");
        res.status(500).send({ message: "Server error" });
    }
});

/**
 * @swagger
 * /fields/{name}:
 *   get:
 *     summary: Get fields by name
 *     tags:
 *       - Fields
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the field to search for
 *     responses:
 *       200:
 *         description: Fields matching the name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *       404:
 *         description: No fields found with the given name
 *       500:
 *         description: Server error
 */
router.get("/name", async (req, res) => {
    const { name } = req.body;
    try {
        const fields = await Fileds.findOne({ where: { name: name } });

        if (!fields) {
            loger.log("info", `No fields found with name: ${name}`);
            return res
                .status(404)
                .send({ message: "No fields found with the given name" });
        }

        loger.log("info", `Fields fetched by name: ${name}`);
        res.status(200).send(fields);
    } catch (error) {
        console.log(error);
        loger.log("error", "Error fetching fields by name");
        res.status(500).send({ message: "Server error" });
    }
});

module.exports = router;
