const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const articleRoutes = require("./src/routes/articles");
const ticketRoutes = require("./src/routes/tickets");
const aiRoutes = require("./src/routes/ai");
const pdfRoutes = require("./src/routes/pdf");

const app = express();

app.use(cors());
app.use(express.json());

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/articles", articleRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/pdf", pdfRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo error:", err);
  });
