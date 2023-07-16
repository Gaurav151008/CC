const express = require("express");
const dp_routes = express.Router();
const users = require("../models/user");
const vendors = require("../models/vendors");
const foodItems = require("../models/foodItems");
const carts = require("../models/cart");
const orders = require("../models/orders");
const deliveryperson = require("../models/deliveryperson");
const dporders = require("../models/dporders");

dp_routes.get("/dpsignup",(req,res)=>{
    if(req.session.loggedin){
      res.redirect("/dphome");
    }
    else{
      res.render("deliveryP/dpsignup",{title:"Register here..."});
    }
  });

dp_routes.post("/dpsignup", async (req, res) => {

  const dpId= req.body.dpId;
  const dpName= req.body.dpName;
  const dpPassword = req.body.dpPassword;   
  const dpContact= req.body.dpContact;
  const dpcheck = await deliveryperson.findOne({ dpId });
  if (dpcheck) {
      return res.status(400).json({ message: "user already exists" });
    }
  const dp = new deliveryperson({
      dpId,
      dpName,
      dpPassword,
      dpContact,
  });
  dp.save()
    .then(() => {
      req.session.message = {
        type: "success",
        message: "Delivery Person added successfully",
      };
      console.log("Added");
      res.redirect("/dpsignin");
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});


//   login user
dp_routes.get("/dpsignin",(req,res)=>{
    if(req.session.loggedin){
      res.redirect("/dphome");
    }
  else{
    res.render("deliveryP/dpsignin",{title:"Login here..."});
  }
});


dp_routes.post("/dpsignin", async(req,res,next)=>{
    try{
      
      const dpId = req.body.did;
      const password = req.body.password;
      const delp = await deliveryperson.findOne({dpId:dpId});
      
      if(delp.dpPassword == password){
        const dpsession = 'loggedin';
        req.session[dpsession] = true;
        req.session.logindp = delp.dpId;
        
        console.log("login success")
        res.redirect("/dphome");
      }
      else{
        res.send("Invalid credentials");
      }
    }
    catch(error){
      res.send("Somthing went wrong");
    }
    
});


//   login user
dp_routes.get("/dphome",async (req,res)=>{
  try {
    const neworders = await orders.find({orderAccepted:"panding"});
    
    const fdcnames = []
    const cstnames = []
    // console.log(neworders);
    for(let i=0; i<neworders.length ; i++)
    {
      let vendordtl = await vendors.findOne({ foodCounterId:neworders[i].foodCounterId });
        if (vendordtl) {
          fdcnames[i] = vendordtl.foodCounterName;
        }
    }
    
    res.render("deliveryP/dphome", { neworders,fdcnames });
  } catch (err) {
    // Handle error
    console.log(err);
  }
});

dp_routes.get("/acceptorder/:fdcname/:neworder",async (req,res)=>{
  const fdcname = req.params.fdcname;
  // const cstname = req.params.cstname;
  const neworder = req.params.neworder;

  const acceptdodr = await orders.findOne({orderId:neworder});

  // let orderId = neworder.orderId;
  console.log("entry");
  console.log(fdcname);
  console.log(acceptdodr.orderId);
  try {
    const addorder = new dporders({
      dpId : req.session.logindp,
      orderId : acceptdodr.orderId,
      foodCounterId : acceptdodr.foodCounterId,
      customerId : acceptdodr.customerId,
      orderTotalAmount : acceptdodr.orderTotalAmount,
      deliveryAddress : acceptdodr.deliveryAddress,
      orderDateTime : acceptdodr.orderDateTime,
    });
    addorder.save()
      .then(async () => {
        req.session.message = {
          type: "success",
          message: "added successfully",
        };
        console.log("Added");
        let updateorders = await orders.updateMany(
          { orderId:acceptdodr.orderId, orderAccepted: "panding" }, 
          { $set: { orderAccepted: "done" } } 
        );
        res.redirect("/openorder");
      })
      .catch((err) => {
        res.json({ message: err.message });
      });
    } catch (err) {
      // Handle error
      console.log(err);
    }
  });
  
  
dp_routes.get("/openorder",async (req,res)=>{
  try {
    
    const openorders = await dporders.find({deliveryStatus:"panding"});
    /*
      invoice:
      foodcountername,customername,deliery address, customer contact,order amount
    */
    let fdcnames = [];
    let usernames = [];
    let fdcconts = [];
    let userconts = [];
      for(let i=0; i<openorders.length ; i++)
      {
        let vendordtl = await vendors.findOne({ foodCounterId:openorders[i].foodCounterId });
        let userdtl = await users.findOne({ userId:openorders[i].CustomerId });
          if (vendordtl) {
            fdcnames[i] = vendordtl.foodCounterName;
            fdcconts[i] = vendordtl.vendorContact;
          }
          if(userdtl){
            usernames[i] = userdtl.userName;
            userconts[i] = userdtl.userContact;
          }
      }
      // console.log(openorders,fdcnames,usernames,fdcconts,userconts);
    res.render("deliveryP/openorder", { openorders ,fdcnames, usernames, fdcconts , userconts});
  } catch (err) {
    // Handle error
    console.log(err);
  }
});

dp_routes.post("/verify",async (req,res)=>{
  try {
    const delotp = req.body.delotp;
    const orderId = req.body.orderid;
    //check entered otp with user otp
    //if matched then
    console.log("this",orderId);
    let updateorder = await dporders.updateMany(
      { orderId, deliveryStatus: "panding" }, 
      { $set: { deliveryStatus: "done" } } 
    );
    
    console.log(updateorder);
    res.redirect("/openorder");
  } catch (err) {
    // Handle error
    console.log(err);
  }
});



dp_routes.get("/orderdelivered", async (req, res) => {
  
  try {
      const delorder = await dporders.find({ deliveryStatus: req.session.logindp });
      
      res.render("deliveryP/acntdtl", { acntdtl });
    } catch (err) {
      // Handle error
      console.log(err);
    }
  
});



dp_routes.get("/dplogout", async (req, res) => {
  
  try {
    req.session.destroy();
    res.redirect('/dpsignin');
  } catch (err) {
      // Handle error
      console.log(err);
    }
  
});
module.exports = dp_routes;
