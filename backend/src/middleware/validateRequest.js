/**
 * Zod validation middleware for Express
 */
const { ZodError } = require("zod");
const { sendError } = require("../lib/responseHelper");

/**
 * Validates request body against a Zod schema
 * @param {import("zod").ZodSchema} schema - The Zod schema to validate against
 */
const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    // Check for Zod error by name or instance
    if (error.name === "ZodError" || error instanceof ZodError) {
      const issues = error.errors || error.issues || [];
      const message = issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");
      return sendError(res, message || "Validation failed", 400);
    }
    next(error);
  }
};

module.exports = validateRequest;
