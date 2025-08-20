import messages from "@Custom_message/index";
import Joi from "joi";

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

const IndValidator = Joi.object({
  name: Joi.string().required(),
  llmId: Joi.string().optional(),
  isActive: Joi.boolean().required()
})

const CatValidator = Joi.object({
  name: Joi.string().required(),
  isActive: Joi.boolean().required()
})

const editCatValidator = Joi.object({
  name: Joi.string().required(),
  isActive: Joi.boolean().required(),
  id: Joi.string().min(24).required()
    .messages({
      'string.min': messages.invalidMongoId.replace('{{key}}', 'id')
    }),
})

const adminSignup = Joi.object({
  username: Joi.string().required().min(3),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,20}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Password must have minimum 8 characters and maximum 20 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  countryCode: Joi.string(),
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
});

const adminLogin = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().required(),
});

const statusValidator = Joi.object({
  userId: Joi.string().min(24).required()
    .messages({
      'string.min': messages.invalidMongoId.replace('{{key}}', 'userId')
    }),
  status: Joi.boolean().required()
});

const add_feed = Joi.object({
  name: Joi.string().required(),
  image: Joi.string().optional().allow('', null)
});

const edit_feed = Joi.object({
  name: Joi.string().required(),
  image: Joi.string().optional().allow('', null),
  feedId: Joi.string().min(24).required()
    .messages({
      'string.min': messages.invalidMongoId.replace('{{key}}', 'feedId')
    }),
})

const addTonValidator = Joi.object({
  title: Joi.string().required(),
  isActive: Joi.boolean().required()
})

const addAI_ProviderModel = Joi.object({
  providerId: Joi.string().min(24).required()
    .messages({
      'string.min': messages.invalidMongoId.replace('{{key}}', 'providerId')
    }),
  name: Joi.string().required(),
  isActive: Joi.boolean().required(),
})


const changeAdminPassValidation = Joi.object({
  current_password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,20}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Current-Password must have minimum 8 characters and maximum 20 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),

  new_password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "New-Password must have minimum 8 characters and maximum 20 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  confirm_new_password: Joi.string().valid(Joi.ref('new_password')).messages({ "any.only": "Both Password must be same" })
});


const faqValidator = Joi.object({
  que: Joi.string().required(),
  ans: Joi.string().required(),
  isActive: Joi.boolean().required(),
  role: Joi.string().required()
})

const faqEditValidator = Joi.object({
  que: Joi.string().required(),
  ans: Joi.string().required(),
  isActive: Joi.boolean().required(),
  id: Joi.string().min(24).required()
    .messages({
      'string.min': messages.invalidMongoId.replace('{{key}}', 'id')
    }),
})

// const configValidator = Joi.object({
//   logoutSession: Joi.number().optional(),
//   panicDay: Joi.number().optional(),
//   panicHour: Joi.number().optional(),
//   panicMinute: Joi.number().optional(),
// })
// .or('panicDay', 'panicHour', 'panicMinute')
// .messages({
//   'object.missing': 'At least one of Day, Hour or Minute is required.'
// });

const configValidator = Joi.object({
  logoutSession: Joi.number().optional(),
  panicDay: Joi.number().optional(),
  panicHour: Joi.number().optional(),
  panicMinute: Joi.number().optional(),
})
  .when(Joi.object({ logoutSession: Joi.exist() }).unknown(), {
    then: Joi.object({
      panicDay: Joi.number().optional(),
      panicHour: Joi.number().optional(),
      panicMinute: Joi.number().optional(),
    }),
    otherwise: Joi.object({
      panicDay: Joi.number(),
      panicHour: Joi.number(),
      panicMinute: Joi.number()
    }).or('panicDay', 'panicHour', 'panicMinute')
      .messages({
        'object.missing': 'At least one of Day, Hour or Minute is required when logoutSession is not provided.'
      })
  });


const addSub = Joi.object({
  title: Joi.string().required(),
  amount: Joi.number().required(),
  features: Joi.array().required(),
  subscriptionType: Joi.string().required().valid('monthly', 'yearly', '6-months'),
});
const editSub = Joi.object({
  subId: Joi.string().required(),
  title: Joi.string().required(),
  amount: Joi.number().required(),
  features: Joi.array().required(),
  subscriptionType: Joi.string().required().valid('monthly', 'yearly', '6-months'),
});

const appVersionSchema = Joi.object({
  androidVersion: Joi.number().required(),
  iosVersion: Joi.number().required(),
  androidUpdate_Type: Joi.string().required().valid("Force","Normal"),
  iosUpdate_Type: Joi.string().required().valid("Force","Normal"),
});



const add_subscription = Joi.object({
  userId: Joi.string().min(24).required()
    .messages({
      'string.min': messages.invalidMongoId.replace('{{key}}', 'userId')
    }),
  subId: Joi.string().min(24).required()
    .messages({
      'string.min': messages.invalidMongoId.replace('{{key}}', 'subId')
    }),
})
export {
  CatValidator,
  IndValidator,
  editCatValidator,
  adminSignup,
  adminLogin,
  statusValidator,
  add_feed,
  edit_feed,
  addTonValidator,
  addAI_ProviderModel,
  changeAdminPassValidation,
  faqValidator,
  faqEditValidator,
  configValidator,
  addSub,
  editSub,
  appVersionSchema,
  add_subscription
}