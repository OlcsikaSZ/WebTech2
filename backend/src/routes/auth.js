const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("username").isString().trim().isLength({ min: 3 }),
    body("password").isString().isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ message: "Ez a felhasználónév már létezik." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      username,
      passwordHash,
      role: "buyer",
    });

    return res.status(201).json({ message: "Sikeres regisztráció" });
  }
);

router.post(
  "/login",
  [
    body("username").isString().trim().notEmpty(),
    body("password").isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Bad credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Bad credentials" });
    }

    const token = jwt.sign(
      {
        sub: String(user._id),
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );

    return res.json({ token });
  }
);

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.sub).select("_id username role createdAt updatedAt");
  if (!user) {
    return res.status(404).json({ message: "Felhasználó nem található." });
  }

  res.json(user);
});

router.get("/users", auth, requireRole("admin"), async (req, res) => {
  const users = await User.find()
    .select("_id username role createdAt updatedAt")
    .sort({ createdAt: -1 });

  res.json(users);
});

router.patch(
  "/users/:id/role",
  auth,
  requireRole("admin"),
  [body("role").isIn(["admin", "buyer"])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található." });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "Jogosultság frissítve.",
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }
);

router.delete("/users/:id", auth, requireRole("admin"), async (req, res) => {
  const { id } = req.params;

  if (req.user.sub === id) {
    return res.status(400).json({ message: "Saját magadat nem törölheted." });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "Felhasználó nem található." });
  }

  await user.deleteOne();

  res.json({ message: "Felhasználó törölve." });
});

module.exports = router;