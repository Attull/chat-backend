const express = require("express");
const User = require("../models/User");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();
  const access = createAccessToken(user);
  const refresh = createRefreshToken(user);
  res.json({ access, refresh });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid creds" });
  const ok = await user.validatePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid creds" });
  res.json({
    access: createAccessToken(user),
    refresh: createRefreshToken(user),
  });
});

module.exports = router;
