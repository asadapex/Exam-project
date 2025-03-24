const joi = require("joi");

function validateFileds(data) {
    return joi
        .object({
            name: joi.string().min(2).max(50).required(),
        })
        .validate(data, { abortEarly: true });
}

module.exports = { validateFileds };
