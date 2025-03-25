const Joi = require("joi");

const courseRegistrationValidator = Joi.object({
  edu_id: Joi.number().required(),
  branch_id: Joi.number().required(),
  date: Joi.string().required(),
});

const courseRegistrationValidatorPatch = Joi.object({
  edu_id: Joi.number(),
  branch_id: Joi.number(),
  date: Joi.string(),
});

module.exports = {
  courseRegistrationValidator,
  courseRegistrationValidatorPatch,
};
