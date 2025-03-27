const Joi = require("joi");

const courseRegistrationValidator = Joi.object({
  edu_id: Joi.number().required(),
  branch_id: Joi.number().required(),
});

const courseRegistrationValidatorPatch = Joi.object({
  edu_id: Joi.number(),
  branch_id: Joi.number(),
});

module.exports = {
  courseRegistrationValidator,
  courseRegistrationValidatorPatch,
};
