/**
 * Centralized error handling middleware
 */
const { sendError } = require("../lib/responseHelper");

/**
 * Global error handler for Express
 * Must be registered at the end of the middleware stack
 */
const errorHandler = (err, req, res, next) => {
  // If headers have already been sent, don't try to send another response
  if (res.headersSent) {
    return next(err);
  }

  console.error(`[ERROR] ${new Date().toISOString()}:`, err.message);
  if (err.stack) {
    console.error(err.stack);
  }

  // Handle specific error types (e.g., Prisma errors)
  if (err.code === "P2002") {
    return sendError(res, "Unique constraint failed (e.g. email already exists)", 400);
  }

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  // During stabilization, show the real message to debug issues
  const message = err.message || "Something went wrong on the server";

  return sendError(res, message, statusCode);
};

module.exports = errorHandler;
