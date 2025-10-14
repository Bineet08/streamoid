const express = require("express");
const router = express.Router();
const { uploadCSV, listProducts, searchProducts } = require("../Controllers/product.controller");
const upload = require("../Middlewares/upload.middleware");

router.post("/upload", upload.single("file"), uploadCSV);
router.get("/products", listProducts);
router.get("/products/search", searchProducts);

module.exports = router;
