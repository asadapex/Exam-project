const joi = require("joi");

function validateSubject(data) {
    return joi
        .object({
            name: joi.string().min(2).max(50).required(),
        })
        .validate(data, { abortEarly: true });
}

module.exports = { validateSubject };
