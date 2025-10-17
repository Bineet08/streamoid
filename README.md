
# Streamoid Product Catalog Backend


A backend service to upload, validate, and manage product data from CSV files — built for the **Streamoid Backend Intern Take-Home Exercise**.

---

## 🚀 Features

✅ Upload CSV files containing product data  
✅ Validate product fields before saving  
✅ Store valid products in MongoDB  
✅ List all stored products with pagination  
✅ Search/filter products by brand, color, and price range  
✅ Detailed responses showing stored, failed, and duplicate entries  

---

## 🧰 Tech Stack

- **Node.js + Express.js** — API framework  
- **MongoDB + Mongoose** — Database layer  
- **Multer** — File upload handling  
- **PapaParse** — CSV parsing utility  

---

## ⚙️ Setup Instructions

###  Clone the Repository
```bash
git clone https://github.com/Bineet08/streamoid.git
cd streamoid
```
### Install the Dependencies
```bash
npm install
```
### Configure Environment
```bash
PORT=8000
MONGO_URI=mongodb://localhost:27017/streamoid
```
### Start the Server
```bash
npm start
```
####  Server runs on 
```
http://localhost:8000
```

## 🐳 Docker Setup
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```
#### Build And RUN
```bash
docker build -t streamoid-backend .
docker run -p 8000:8000 streamoid-backend
```





## API Reference

#### Upload CSV

```http
    curl -X POST -F "file=@products.csv" http://localhost:8000/upload
```
### Example Response
```json
{
  "message": "CSV processed successfully",
  "stored": 15,
  "failedCount": 2,
  "duplicateCount": 1,
  "failed": [
    { "row": {"sku": "", "name": ""}, "reason": "Missing required fields" }
  ],
  "duplicates": [
    { "sku": "TSHIRT-RED-001", "reason": "SKU already exists in database" }
  ]
}
```


#### List all items

```http
  GET /products
```

| Parameter | Type     | Default | Description                |
| :-------- | :------- | :-------| :------------------------- |
| `page` | `number` | `1` |Page number.|
| `limit` | `number` | `10`|Items per page.|

###Example Response
```bash
GET /products?page=1&limit=5
```
#### Response
```json
{
  "total": 20,
  "page": 1,
  "limit": 5,
  "totalPages": 4,
  "products": [
    {
      "sku": "TSHIRT-RED-001",
      "name": "Classic Cotton T-Shirt",
      "brand": "StreamThreads",
      "color": "Red",
      "size": "M",
      "mrp": 799,
      "price": 499,
      "quantity": 20
    }
  ]
}
```


### Search 

```http
  GET /products/search
```
#### Query Parameters
| Parameter | Type     | Example | Description                       |
| :-------- | :------- | :-------|:-------------------------------- |
| `brand`      | `string` |`StreamThreads`|Filter by brand |
| `color`      | `string` |`Red`|Filter by color |
| `minPrice`      | `number` |`500`|Minimum price |
| `maxPrice`      | `number` |`2000`|Maximum price |
| `page`      | `number` |`1`|Page number |
| `limit`      | `number` |`10`|Items per Page |

### Example
```bash
GET /products/search?brand=BloomWear&maxPrice=2500
```
#### Response
```json
{
  "total": 2,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "products": [
    {
      "sku": "DRESS-PNK-S",
      "name": "Floral Summer Dress",
      "brand": "BloomWear",
      "color": "Pink",
      "size": "S",
      "mrp": 2499,
      "price": 2199,
      "quantity": 10
    }
  ]
}
```





## Authors

- [@Bineet Gupta](https://www.github.com/bineet_08)

