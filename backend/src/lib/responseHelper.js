/**
 * Standardized response helpers for Right Bite
 */

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {any} data - Data to send to client
 * @param {number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    data
  });
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 400)
 */
const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    status: "error",
    message
  });
};

module.exports = {
  sendSuccess,
  sendError
};
