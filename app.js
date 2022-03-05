const express = require('express')
const app = express()
const connection = require("./DB/connenction.js")
const path = require("path");
var cors = require("cors");
var corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
// 
// http://localhost:4200/uploads/avatar-1645878809511-142401616_asset7.jpeg
app.use("/uploads",express.static(path.join(__dirname,"uploads")))
require("dotenv").config();
const port = process.env.PORT || 3000;

const { createInvoice } = require("./common/createInvoice.js");

const invoice = {
  shipping: {
    name: "John Doe",
    address: "1234 Main Street",
    city: "San Francisco",
    state: "CA",
    country: "US",
    postal_code: 94111,
  },
  items: [
    {
      item: "TC 100",
      description: "Toner Cartridge",
      quantity: 2,
      amount: 6000,
    },
    {
      item: "USB_EXT",
      description: "USB Cable Extender",
      quantity: 1,
      amount: 2000,
    },
    {
      item: "USB_EXT",
      description: "USB Cable Extender",
      quantity: 1,
      amount: 2000,
    },
  ],
  subtotal: 8000,
  paid: 0,
  invoice_nr: 1234,
};



const {userRoutes,postRoutes} = require("./routes/index.js");
const userModel = require('./DB/user.model.js');
app.use(express.json())
connection();

app.use(userRoutes);
app.get('/', async (req, res) => {
  let allUser = await userModel.find({})
  invoice.items = allUser;
  createInvoice(invoice, "invoice.pdf");
    res.send("Hello World!");
}
  
)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))