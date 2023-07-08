const express = require("express");
const vendor_route = express.Router();
const vendors = require("../models/vendors");
const foodItems = require("../models/foodItems");


// signup of vendor
vendor_route.get("/vensup",(req,res)=>{
    res.render("vendor/vendorSup",{title:"Register here..."});
});
vendor_route.post("/vensup", async (req, res) => {

  const vendorEmail= req.body.email;
  const foodCounterName= req.body.countername;
  const vendorContact= req.body.contact;  
  const lastFourDigits = vendorContact.slice(-4);    
  let fdcImg = req.body.fdcimg;
  fdcImg = "public/img/"+fdcImg;
  const foodCounterId = (foodCounterName.toLowerCase().replace(/\s/g, '') + lastFourDigits);
  const vendorck = await vendors.findOne({ vendorEmail, foodCounterId });
  if (vendorck) {
      return res.status(400).json({ message: "Email already exists" });
    }
  
  const vendor = new vendors({ 
    vendorId: req.body.vendorid,
    vendorName: req.body.vendorname,
    vendorEmail,
    vendorPassword: req.body.password,
    vendorContact,
    foodCounterId,
    foodCounterName,
    fdcImg,
  });
  vendor.save()
    .then(() => {
      req.session.message = {
        type: "success",
        message: "vendor added successfully",
      };
      console.log("Added");
      res.redirect("/vensin");
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});
  

//   login vendor
vendor_route.get("/vensin",(req,res)=>{
res.render("vendor/vendorSin",{title:"Login here..."});
});
vendor_route.post("/vensin", async(req,res,next)=>{
    try{

        const email = req.body.email;
        const password = req.body.password;
        const vendor = await vendors.findOne({vendorEmail:email});
        
        if(vendor.vendorPassword == password){
            req.session.loggedin = true;
            req.session.loginvan = vendor.foodCounterId;
            console.log(req.session.loginvan)
            res.redirect("/venacnt");
        }
        else{
            res.send("Invalid credentials");
        }
    }
    catch(error){
        res.send(error);
    }

});

// to add fooditems in menu of vendor's food counter
vendor_route.get("/venacnt",async (req,res)=>{
  try {
    const vendtl = await vendors.find({foodCounterId:req.session.loginvan});

    console.log(vendtl[0]);
    res.render("vendor/venacnt", { vendtl });
  } catch (err) {
    // Handle error
    console.log(err);
  }
});

vendor_route.get("/additem",(req,res)=>{
  res.render("vendor/addFoodItems");
});

vendor_route.post("/additem", async (req, res) => {
    
  
    const itemName = req.body.itemname;
    const lastFourDigits = req.session.loginvan.slice(-4);    
    console.log(lastFourDigits);
    const itemId0= req.body.itemid;
    let itemImg = req.body.itemimg;
    itemImg = "public/img/"+itemImg;
    const itemId = (lastFourDigits + itemId0);
    const foodItemck = await foodItems.findOne({itemId,itemName});
    if (foodItemck) {
        return res.status(400).json({ message: "itemId already exists" });
      }
    const foodItem = new foodItems({
      foodCounterId: req.session.loginvan,
      itemId,
      itemName,
      itemPrice: req.body.itemprice,
      itemDesc: req.body.itemdesc,
      itemImg,
    });
    foodItem.save()
      .then(() => {
        req.session.message = {
          type: "success",
          message: "item added successfully",
        };
        console.log("Added");
        res.redirect("/mymenu");
      })
      .catch((err) => {
        // res.json({ message: err.message });
        res.redirect("/vensin");
      });
  });

// to show all menu items 

vendor_route.get("/mymenu", async (req, res) => {
  
  try {
    const menuItems = await foodItems.find({foodCounterId:req.session.loginvan});

    console.log(menuItems[0].itemId);
    res.render("vendor/mymenu", { menuItems });
  } catch (err) {
    // Handle error
    console.log(err);
  }
  
});



vendor_route.get("/acnt", async (req, res) => {
  
  try {
      const acntdtl = await vendors.find({ foodCounterID: req.session.loginvan });

      // Use the counters data in your response rendering or processing logic
      res.render("vendor/acntdtl", { acntdtl });
    } catch (err) {
      // Handle error
      console.log(err);
    }
  
});


vendor_route.get("/venorders", async (req, res) => {
  
  try {
      const venodr = await vendors.find({ foodCounterID: req.session.loginvan });

      // Use the counters data in your response rendering or processing logic
      res.render("vendor/venOrders", { acntdtl });
    } catch (err) {
      // Handle error
      console.log(err);
    }
  
});


vendor_route.get("/venlout", async (req, res) => {
  
  try {
    req.session.destroy();
    res.redirect('/vensin');
  } catch (err) {
      // Handle error
      console.log(err);
    }
  
});
module.exports = vendor_route;