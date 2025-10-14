const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  brand: { type: String, required: true, index: true },
  color: { type: String, index: true },
  size: String,
  mrp: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);