const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const TechItem = require('../models/TechItem');

const router = express.Router();

function pad(num, size = 3) {
  return String(num).padStart(size, '0');
}

async function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const datePart = `${y}${m}${d}`;

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const countToday = await Order.countDocuments({
    createdAt: { $gte: start, $lt: end },
  });

  return `REN-${datePart}-${pad(countToday + 1)}`;
}

router.post(
  '/',
  auth,
  [
    body('customerName').isString().trim().isLength({ min: 3 }),
    body('email').isEmail().withMessage('Érvénytelen email cím.'),
    body('phone')
      .matches(/^(\+36|06)?\d{8,9}$/)
      .withMessage('Érvénytelen telefonszám formátum.'),
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
      const dbItemsToUpdate = [];

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

        dbItemsToUpdate.push({ dbItem, qty });

        normalizedItems.push({
          techItemId: dbItem._id,
          name: dbItem.name,
          sku: dbItem.sku,
          qty,
          unitPriceGross: dbItem.priceGross,
          lineTotalGross: dbItem.priceGross * qty,
        });
      }

      for (const row of dbItemsToUpdate) {
        row.dbItem.quantity -= row.qty;
        await row.dbItem.save();
      }

      const orderNumber = await generateOrderNumber();

      const created = await Order.create({
        userId: req.user.sub,
        orderNumber,
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

router.get('/mine', auth, async (req, res, next) => {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : { userId: req.user.sub };

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/stats/dashboard', auth, async (req, res, next) => {
  try {
    const orderQuery =
      req.user.role === 'admin'
        ? {}
        : { userId: req.user.sub };

    const orders = await Order.find(orderQuery).lean();
    const lowStockItems = await TechItem.find({
      $expr: { $lte: ['$quantity', '$reorder'] },
    }).lean();

    const totalOrders = orders.length;
    const totalOrderValue = orders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);

    res.json({
      totalOrders,
      totalOrderValue,
      lowStockCount: lowStockItems.length,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({ message: 'Rendelés nem található.' });
    }

    const isOwner = String(order.userId) === String(req.user.sub);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Ehhez a rendeléshez nincs hozzáférésed.' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;