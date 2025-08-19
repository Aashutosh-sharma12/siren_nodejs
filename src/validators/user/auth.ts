import Joi from 'joi';
const customJoi = Joi.extend((joi) => ({
  type: "phoneNumber",
  base: joi.string(),
  messages: {
    "phoneNumber.base": "Phone Number should contain only digits",
  },
  rules: {
    digitsOnly: {
      validate(value, helpers) {
        if (value !== "" && !/^[0-9]+$/.test(value)) {
          return helpers.error("phoneNumber.base");
        }
        return value;
      },
    },
  },
}));

const authSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  countryCode: Joi.string().required(),
  phoneNumber: customJoi
    .phoneNumber()
    .min(3)
    .max(20)
    .required()
    .digitsOnly()
    .messages({
      "string.empty": "Phone Number cannot be an empty field",
      "string.min": "Phone Number should have a minimum length of {#limit}",
      "string.max": "Phone Number should have a maximum length of {#limit}",
      "any.required": "Phone Number is a required field",
      "phoneNumber.base": "Phone Number should contain only digits",
    }),
  // image: Joi.string().required(),
  password1: Joi.string().required(),
  password2: Joi.string().required(),
  dob: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Date of birth must be in YYYY-MM-DD format",
      "string.empty": "Date of birth is required",
      "any.required": "Date of birth is required"
    })
});

const loginSchema = Joi.object({
  countryCode: Joi.string().required(),
  phoneNumber: customJoi
    .phoneNumber()
    .min(3)
    .max(20)
    .required()
    .digitsOnly()
    .messages({
      "string.empty": "Phone Number cannot be an empty field",
      "string.min": "Phone Number should have a minimum length of {#limit}",
      "string.max": "Phone Number should have a maximum length of {#limit}",
      "any.required": "Phone Number is a required field",
      "phoneNumber.base": "Phone Number should contain only digits",
    }),
  password: Joi.string().required(),
});

const userInfoSchema = Joi.object({
  countryCode: Joi.string().required(),
  phoneNumber: customJoi
    .phoneNumber()
    .min(3)
    .max(20)
    .required()
    .digitsOnly()
    .messages({
      "string.empty": "Phone Number cannot be an empty field",
      "string.min": "Phone Number should have a minimum length of {#limit}",
      "string.max": "Phone Number should have a maximum length of {#limit}",
      "any.required": "Phone Number is a required field",
      "phoneNumber.base": "Phone Number should contain only digits",
    })
});

const profileSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  image: Joi.string().optional().allow(''),
  dob: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Date of birth must be in YYYY-MM-DD format",
      "string.empty": "Date of birth is required",
      "any.required": "Date of birth is required",
    })
});

export {
  authSchema,
  loginSchema,
  userInfoSchema,
  profileSchema
}