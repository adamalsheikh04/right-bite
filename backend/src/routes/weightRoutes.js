const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { weightLogSchema } = require("../lib/validators/weightValidator");
const { sendSuccess, sendError } = require("../lib/responseHelper");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Get start and end of today in UTC
// ─────────────────────────────────────────────────────────────────────────────
function getTodayRange() {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  const endOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  );
  return { startOfDay, endOfDay };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/weight — Log today's weight (upsert: one entry per UTC day)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/weight", authMiddleware, validateRequest(weightLogSchema), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { weightKg } = req.body;

    const { startOfDay, endOfDay } = getTodayRange();
    const now = new Date();

    const existingLog = await prisma.weightLog.findFirst({
      where: { userId, loggedAt: { gte: startOfDay, lte: endOfDay } },
    });

    let log;
    if (existingLog) {
      log = await prisma.weightLog.update({
        where: { id: existingLog.id },
        data: { weightKg },
      });
    } else {
      log = await prisma.weightLog.create({
        data: { userId, weightKg, loggedAt: now },
      });
    }

    return sendSuccess(res, log);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/weight — Get all weight logs for the user (newest first)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/weight", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const logs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { loggedAt: "desc" },
    });
    return sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/weight/:id — Delete a weight log (ownership enforced)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/weight/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const logId = Number(req.params.id);

    if (isNaN(logId)) {
      return sendError(res, "Invalid weight log ID", 400);
    }

    const log = await prisma.weightLog.findUnique({ where: { id: logId } });

    if (!log) {
      return sendError(res, "Weight log not found", 404);
    }
    if (log.userId !== userId) {
      return sendError(res, "You are not authorized to delete this entry", 403);
    }

    await prisma.weightLog.delete({ where: { id: logId } });
    return sendSuccess(res, { message: "Weight log deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
