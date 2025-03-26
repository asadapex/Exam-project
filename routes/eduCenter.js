const { Router } = require("express");
const { roleMiddleware } = require("../middlewares/auth-role.middlewars");
const loger = require("../logger");
const { validEdu } = require("../validators/eduValidation");
const { Region, User, Branch, Subjet, EduCenter, Comment} = require("../associations");
const eduCentersSubject = require("../models/educenterSubject");
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
 *               location:
 *                 type: string
 *                 example: "Tashkent"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               image:
 *                 type: string
 *                 example: "image.png"
 *               subjects:
 *                 type: array
 *                 example: [1, 2, 4]
 *     responses:
 *       201:
 *         description: EduCenter created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", roleMiddleware(["ceo", "admin"]), async (req, res) => {
    try {
        const { error, value } = validEdu(req.body);
        if (error) {
            loger.log("info", "Error in validation edu center");
            return res.status(400).send({ message: error.details[0].message });
        }

        const region = await Region.findOne({ where: { id: value.region_id } });
        if (!region) {
            loger.log("info", "Created edu center region not found");
            return res
                .status(404)
                .send({ message: "Create edu center region not found" });
        }

        loger.log("info", "EduCenter Created");
        const newEduCenter = await EduCenter.create({
            name: value.name,
            region_id: value.region_id,
            location: value.location,
            phone: value.phone,
            image: value.image || "No image",
            user_id: req.user.id,
        });

        const subjectIds = value.subjects;

        const existingSubjects = await Subjet.findAll({
            where: { id: subjectIds },
            attributes: ["id"],
        });

        const existingSubjectIds = existingSubjects.map(
            (subject) => subject.id
        );

        const missingSubjects = subjectIds.filter(
            (id) => !existingSubjectIds.includes(id)
        );

        if (missingSubjects.length > 0) {
            loger.log("info", "Some subjects not found in database");
            return res.status(400).send({
                message: `The following subjects do not exist: ${missingSubjects.join(
                    ", "
                )}`,
            });
        }

        const subjects = subjectIds.map((id) => ({
            edu_id: newEduCenter.id,
            subject_id: id,
        }));

        await eduCentersSubject.bulkCreate(subjects);

        res.status(201).send(newEduCenter);
    } catch (error) {
        console.error(error);
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
            order: [
                ["createdAt", sort.toLowerCase() === "desc" ? "DESC" : "ASC"],
            ],
            include: [
                {
                    model: User,
                    as: "user",
                },
                {
                    model: Region,
                    as: "region",
                },
                {
                    model: Comment,
                    as: "comments",
                }
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
 *               location:
 *                 type: string
 *                 example: "Samarkand"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               subjects:
 *                 type: array
 *                 example: [1, 2, 4]
 *
 *     responses:
 *       200:
 *         description: EduCenter updated successfully
 *       404:
 *         description: EduCenter not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", roleMiddleware(["ceo", "admin"]), async (req, res) => {
    const { id } = req.params;
    try {
        const { error, value } = validEdu(req.body);
        if (req.user.role != "admin") {
            const one = await EduCenter.findOne({
                where: { id: req.params.id, user_id: req.user.id },
            });
            if (!one) {
                loger.log("info", `This edue center not ${value.name} ceo`);
                return res
                    .status(403)
                    .send({ message: "This not your edu center" });
            }
            if (error) {
                loger.log("error", "Validation error in update EduCenter");
                return res
                    .status(400)
                    .send({ message: error.details[0].message });
            }

            const eduCenter = await EduCenter.findByPk(id);
            if (!eduCenter) {
                loger.log("info", `EduCenter with ID ${id} not found`);
                return res.status(404).send({ message: "EduCenter not found" });
            }

            await eduCenter.update(value);
            loger.log("info", `EduCenter updated: ${id}`);
            res.status(200).send(eduCenter);
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
router.delete("/:id", roleMiddleware(["ceo", "admin"]), async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role != "admin") {
            const one = await EduCenter.findOne({
                where: { id: req.params.id, user_id: req.user.id },
            });
            if (!one) {
                loger.log("info", `This edue center not ${value.name} ceo`);
                return res
                    .status(403)
                    .send({ message: "This not your edu center" });
            }

            const eduCenter = await EduCenter.findByPk(id);
            if (!eduCenter) {
                loger.log("info", `EduCenter with ID ${id} not found`);
                return res.status(404).send({ message: "EduCenter not found" });
            }

            await eduCentersSubject.destroy({
                where: { edu_id: id },
            });
            loger.log("info", `EduCenter deleted: ${id}`);
            await eduCenter.destroy();
            res.status(200).send({ message: "EduCenter deleted successfully" });
        }
        const eduCenter = await EduCenter.findByPk(id);
            if (!eduCenter) {
                loger.log("info", `EduCenter with ID ${id} not found`);
                return res.status(404).send({ message: "EduCenter not found" });
            }
        loger.log("info", `EduCenter deleted: ${id}`);
            await eduCenter.destroy();
            res.status(200).send({ message: "EduCenter deleted successfully" });
    } catch (error) {
        console.log(error);
        loger.log("error", "Error deleting EduCenter");
        res.status(500).send({ message: "Server error" });
    }
});

module.exports = router;
