const { Router } = require("express");
const loger = require("../logger");
const router = Router();
const { roleMiddleware } = require("../middlewares/auth-role.middlewars");
const { validateSubject } = require("../validators/subject.validator");
const Subject = require("../models/subject");

router.post("/", roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { error, value } = validateSubject(req.body);
        if (error) {
            loger.log("info", `Validation error: ${error.message}`);
            return res.status(400).send({ message: error.message });
        }
        const newSubject = await Subject.create(value);
        res.send(newSubject);
    } catch (error) {
        console.log(error);
        loger.log("error", "Error in create subject");
        res.status(500).send({ message: "Server error" });
    }
});

module.exports = router;

//crudini qilib chiqish kerak va qolgan edu center va region filds tablesiga multer qoshib chiqish kerak
