const mongoose = require('mongoose');

const TechItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    priceGross: { type: Number, required: true, min: 0 },
    priceNet: { type: Number, required: true, min: 0 },
    vat: { type: Number, required: true, min: 0, max: 100 },
    quantity: { type: Number, required: true, min: 0 },
    color: { type: String, default: '' },
    tags: [{ type: String }],
    date: { type: String, default: '' },
    brand: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    condition: { type: String, default: 'uj' },
    status: { type: String, default: 'Aktív' },
    reorder: { type: Number, default: 0 },
    warrantyMonths: { type: Number, default: 24 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TechItem', TechItemSchema);
