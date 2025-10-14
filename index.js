let express = require('express')
let mongoose = require('mongoose')
let cors = require('cors')
require('dotenv').config()
let productRoute = require('./App/Routes/productRoute')


let app = express()
app.use(cors())
app.use(express.json())
app.use('/api', productRoute)

//connection
mongoose.connect(process.env.URL).then(()=>{
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 3000, ()=>{
        console.log("Server is running on port " + (process.env.PORT || 3000));
    })
}).catch((err)=>{
    console.log(err);
})