const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const techRoutes = require("./routes/tech");
const orderRoutes = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/tech", techRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI in .env");
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET in .env");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

bootstrap().catch((e) => {
  console.error("Boot error:", e);
  process.exit(1);
});

app.use((err, req, res, next) => {
  console.error('Szerver hiba:', err);
  res.status(500).json({ message: 'Belső szerverhiba' });
});
