const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// DEV / egyszeri: regisztráció (tanárnál ez oké, de prodnál nem muszáj kirakni)
router.post(
  "/register",
  [
    body("username").isString().trim().isLength({ min: 3 }),
    body("password").isString().isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash });

    return res.status(201).json({ message: "Registered" });
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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Bad credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Bad credentials" });

    const token = jwt.sign(
      { sub: String(user._id), username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );

    return res.json({ token });
  }
);

module.exports = router;
