require("dotenv").config();
const express = require("express");
const cors = require("cors");
const testRoutes = require("./routes/testRoutes");
const app = express();
const PORT = 5000;
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

app.use((req, res, next) => {
  console.log(`[RAW REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);

app.get("/", (req, res) => {
  res.send("Right Bite backend is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});