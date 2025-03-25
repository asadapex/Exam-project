const Joi = require("joi");

async function commentValidation(data) {
  const schema = Joi.object({

    description: Joi
    .string()
    .min(10)
    .max(255)
    .required(),

    star: Joi
    .number()
    .integer()
    .min(1)
    .max(5)
    .optional(),

    userId: Joi
    .number()
    .min(1)
    .required(),

    educationCenterId: Joi
    .number()
    .min(1)
    .required(),
        }
    );
  return schema.validate(data, { abortEarly: false });
}

async function commentUpdateValidation(data) {
  const schema = Joi.object({

    description: Joi
    .string()
    .min(5)
    .max(255)
    .optional(),

    star: Joi
    .number()
    .integer()
    .min(1)
    .max(5)
    .optional(),

    userId: Joi
    .number()
    .min(1)
    .optional(),

    educationCenterId: Joi
    .number()
    .min(1)
    .optional(),
        }
    );
  return schema.validate(data, { abortEarly: false });
}

module.exports = { commentValidation, commentUpdateValidation };
