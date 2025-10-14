const productModel = require('../Models/product.model');
const fs = require('fs').promises;
const Papa = require('papaparse');


//Uplaod
const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read and parse CSV file
    const fileContent = await fs.readFile(req.file.path, 'utf8');
    const parsedData = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    const validProducts = [];
    const failed = [];
    const seenSKUs = new Set();

    for (const row of parsedData.data) {
      const { sku, name, brand, color, size, mrp, price, quantity } = row;

      if (!sku || !name || !brand || mrp == null || price == null) {
        failed.push({ row, reason: 'Missing required fields' });
        continue;
      }

      if (seenSKUs.has(sku)) {
        failed.push({ row, reason: 'Duplicate SKU in CSV' });
        continue;
      }

      if (typeof price !== 'number' || isNaN(price) || price < 0) {
        failed.push({ row, reason: 'Invalid price value' });
        continue;
      }

      if (typeof mrp !== 'number' || isNaN(mrp) || mrp < 0) {
        failed.push({ row, reason: 'Invalid MRP value' });
        continue;
      }

      if (price > mrp) {
        failed.push({ row, reason: 'Price cannot be greater than MRP' });
        continue;
      }

      if (quantity != null && quantity < 0) {
        failed.push({ row, reason: 'Quantity cannot be negative' });
        continue;
      }

      seenSKUs.add(sku);
      validProducts.push({
        sku,
        name,
        brand,
        color,
        size,
        mrp,
        price,
        quantity: quantity || 0,
      });
    }

    let stored = 0;
    const duplicates = [];

    if (validProducts.length > 0) {
      try {
        const inserted = await productModel.insertMany(validProducts, { ordered: false });
        stored = inserted.length;
      } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000 && error.writeErrors) {
          stored = validProducts.length - error.writeErrors.length;
          error.writeErrors.forEach(err => {
            duplicates.push({
              sku: validProducts[err.index].sku,
              reason: 'SKU already exists in database',
            });
          });
        } else {
          throw error;
        }
      }
    }


    // Delete uploaded file after processing
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Failed to delete uploaded file:', unlinkError);
    }

    return res.status(200).json({
      message: 'CSV processed successfully',
      stored,
      failedCount: failed.length,
      duplicateCount: duplicates.length,
      failed,
      duplicates,
    });
  } catch (error) {
    console.error(error);
    
    // Cleanup file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const listProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await productModel.countDocuments();
    const products = await productModel.find().skip(skip).limit(limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


//search
const searchProducts = async (req, res) => {
  try {
    const { brand, color, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (brand) filter.brand = new RegExp(`^${brand}$`, 'i');
    if (color) filter.color = new RegExp(`^${color}$`, 'i');

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await productModel.countDocuments(filter);
    const products = await productModel
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadCSV, listProducts, searchProducts };