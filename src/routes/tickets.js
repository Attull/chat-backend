const express = require("express");
const Ticket = require("../models/Ticket");
const auth = require("../middleware/auth");

const router = express.Router();

// Create ticket (user)
router.post("/", auth, async (req, res) => {
  const { title, description, priority } = req.body;
  const ticket = await Ticket.create({
    title,
    description,
    priority,
    createdBy: req.user._id,
  });
  res.status(201).json(ticket);
});

// My tickets
router.get("/mine", auth, async (req, res) => {
  const tickets = await Ticket.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(tickets);
});

// Admin: list all
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  const tickets = await Ticket.find().populate("createdBy", "name email");
  res.json(tickets);
});

module.exports = router;
