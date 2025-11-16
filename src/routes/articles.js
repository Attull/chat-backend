const express = require("express");
const Article = require("../models/Article");
const auth = require("../middleware/auth");

const router = express.Router();

// List + search + pagination
router.get("/", async (req, res) => {
  const { q = "", page = 1, limit = 10 } = req.query;
  const query = q ? { title: { $regex: q, $options: "i" } } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Article.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Article.countDocuments(query),
  ]);
  res.json({ items, total });
});

// Get single
router.get("/:id", async (req, res) => {
  const art = await Article.findById(req.params.id);
  if (!art) return res.status(404).json({ message: "Not found" });
  res.json(art);
});

// Create (admin)
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  const { title, body, tags = [] } = req.body;
  const article = await Article.create({
    title,
    body,
    tags,
    summary: body.slice(0, 160),
    author: req.user._id,
  });
  res.status(201).json(article);
});

// Update (admin)
router.put("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  const { title, body, tags } = req.body;
  const art = await Article.findByIdAndUpdate(
    req.params.id,
    { title, body, tags, summary: body.slice(0, 160) },
    { new: true }
  );
  res.json(art);
});

// Delete (admin)
router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  await Article.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
