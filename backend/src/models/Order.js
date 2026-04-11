const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    techItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TechItem',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    unitPriceGross: { type: Number, required: true, min: 0 },
    lineTotalGross: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    shippingMethod: { type: String, required: true, trim: true },
    paymentMethod: { type: String, required: true, trim: true },
    note: { type: String, default: '', trim: true },

    items: {
      type: [OrderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Legalább egy termék szükséges a rendeléshez.',
      },
    },

    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      default: 'Új',
      enum: ['Új', 'Feldolgozás alatt', 'Teljesítve', 'Törölve'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);