const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const TechItem = require('../models/TechItem');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    body('customerName').isString().trim().isLength({ min: 3 }),
    body('email').isEmail(),
    body('phone').isString().trim().isLength({ min: 6 }),
    body('address').isString().trim().isLength({ min: 5 }),
    body('shippingMethod').isString().trim().notEmpty(),
    body('paymentMethod').isString().trim().notEmpty(),
    body('note').optional().isString(),
    body('items').isArray({ min: 1 }),
    body('subtotal').isNumeric(),
    body('shippingCost').isNumeric(),
    body('grandTotal').isNumeric(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        customerName,
        email,
        phone,
        address,
        shippingMethod,
        paymentMethod,
        note,
        items,
        subtotal,
        shippingCost,
        grandTotal,
      } = req.body;

      const normalizedItems = [];

      for (const row of items) {
        const dbItem = await TechItem.findById(row.techItemId);

        if (!dbItem) {
          return res.status(404).json({
            message: `A termék nem található: ${row.name || row.techItemId}`,
          });
        }

        const qty = Number(row.qty || 0);

        if (qty < 1) {
          return res.status(400).json({
            message: `Érvénytelen mennyiség: ${dbItem.name}`,
          });
        }

        if (dbItem.quantity < qty) {
          return res.status(400).json({
            message: `Nincs elég készlet a következő termékből: ${dbItem.name}`,
          });
        }

        dbItem.quantity -= qty;
        await dbItem.save();

        normalizedItems.push({
          techItemId: dbItem._id,
          name: dbItem.name,
          sku: dbItem.sku,
          qty,
          unitPriceGross: dbItem.priceGross,
          lineTotalGross: dbItem.priceGross * qty,
        });
      }

      const created = await Order.create({
        customerName,
        email,
        phone,
        address,
        shippingMethod,
        paymentMethod,
        note: note || '',
        items: normalizedItems,
        subtotal: Number(subtotal),
        shippingCost: Number(shippingCost),
        grandTotal: Number(grandTotal),
      });

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;