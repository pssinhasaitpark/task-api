const Joi = require('joi');

const authSchema = Joi.object({
  email: Joi.string()
    .email()
    // .pattern(/@\.com$/) 
    .messages({
      "string.pattern.base": "Invalid email format'.",
      "string.email": "Email must be a valid email address.",
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must contain at least 6 characters.",
      "any.required": "Password is required.",
    }),
  mobile_no: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must have exactly 10 digits.",
      "any.required": "Mobile number is required.",
    })
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required()
})

const forgatePasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    // .pattern(/@gmail\.com$/) 
    .messages({
      "string.pattern.base": "Invalid email format'.",
      "string.email": "Email must be a valid email address.",
    })
})

const roleSchema = Joi.object({
  role: Joi.string().required()
});

const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  postal_code: Joi.string().required(),
  address_type: Joi.string().required()

})

const orderSchema = Joi.object({
  status: Joi.string().required(),
  totalamount: Joi.number().required(),
  stock: Joi.number().required(),
  product_id: Joi.string().required(),
  address_id: Joi.string().required()

})

const resetSchema = Joi.object({
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must contain at least 6 characters.",
      "any.required": "Password is required.",
    }),
  confirmPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must contain at least 6 characters.",
      "any.required": "Password is required.",
    })

})

const blogSchema = Joi.object({
  title: Joi.string().required(),
  category: Joi.string().required(),
  view_count: Joi.string().required(),
  description: Joi.string().required(),
  content: Joi.string().required(),

})

module.exports = { authSchema, loginSchema, forgatePasswordSchema, roleSchema, addressSchema, orderSchema, resetSchema, blogSchema };