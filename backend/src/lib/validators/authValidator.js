const { z } = require("zod");

/**
 * Validator for User Registration
 */
const registerSchema = z.object({
  email: z.string().trim().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long").min(1, "Password is required"),
});

/**
 * Validator for User Login
 */
const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
