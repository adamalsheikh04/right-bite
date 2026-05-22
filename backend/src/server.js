require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const mealRoutes = require("./routes/mealRoutes");
const weightRoutes = require("./routes/weightRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const errorHandler = require("./middleware/errorHandler");
const { sendSuccess } = require("./lib/responseHelper");

const app = express();
const PORT = 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase limit for base64 uploads
app.use("/uploads", express.static(uploadsDir));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", mealRoutes);
app.use("/api", weightRoutes);
app.use("/api", mealPlanRoutes);

app.get("/", (req, res) => {
  sendSuccess(res, { message: "Right Bite backend is running" });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
// Catches any error passed via next(error) and returns clean JSON
// Must be the LAST middleware defined
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});