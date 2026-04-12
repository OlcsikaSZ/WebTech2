const express = require('express');
const { body, validationResult } = require('express-validator');
const TechItem = require('../models/TechItem');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const items = await TechItem.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  auth,
  requireRole('admin'),
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('category').isString().trim().notEmpty(),
    body('sku').isString().trim().isLength({ min: 2 }),
    body('priceGross').isNumeric(),
    body('priceNet').isNumeric(),
    body('vat').isNumeric(),
    body('quantity').isInt({ min: 0 }),
    body('imageUrl').optional().isString(),
    body('color').optional().isString(),
    body('date').optional().isString(),
    body('tags').optional().isArray(),
    body('brand').optional().isString(),
    body('description').optional().isString(),
    body('location').optional().isString(),
    body('condition').optional().isString(),
    body('status').optional().isString(),
    body('reorder').optional().isNumeric(),
    body('warrantyMonths').optional().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const data = req.body;
    const exists = await TechItem.findOne({ sku: data.sku });
    if (exists) return res.status(409).json({ message: 'Már létezik ilyen SKU!' });

    if (Number(data.vat) < 0 || Number(data.vat) > 100) {
      return res.status(400).json({ message: 'ÁFA (vat) 0 és 100 között legyen.' });
    }
    if (Number(data.priceNet) > Number(data.priceGross)) {
      return res.status(400).json({ message: 'Nettó ár nem lehet nagyobb a bruttónál.' });
    }

    const created = await TechItem.create({
      ...data,
      priceGross: Number(data.priceGross),
      priceNet: Number(data.priceNet),
      vat: Number(data.vat),
      quantity: Number(data.quantity),
      reorder: Number(data.reorder || 0),
      warrantyMonths: Number(data.warrantyMonths || 24),
    });

    return res.status(201).json(created);
  }
);

module.exports = router;