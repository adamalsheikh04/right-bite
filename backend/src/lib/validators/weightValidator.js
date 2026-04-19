const { z } = require("zod");

/**
 * Validator for Weight Logging
 */
const weightLogSchema = z.object({
  weightKg: z.coerce.number().min(20, "Weight must be at least 20kg").max(500, "Weight exceeds realistic limits"),
  loggedAt: z.string().optional(), // Used for past logs if supported later
});

module.exports = {
  weightLogSchema,
};
