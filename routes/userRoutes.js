const express = require("express");
const user_route = express.Router();
const users = require("../models/user");
const vendors = require("../models/vendors");
const foodItems = require("../models/foodItems");
const carts = require("../models/cart");
const orders = require("../models/orders");
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });


user_route.get("/userSup",(req,res)=>{
  console.log(req.session.loggedin)
  if(req.session.loggedin){
    res.redirect("/");
  }
  else{
    res.render("user/userSup",{title:"Register here..."});
  }
});



user_route.post("/userSup", async (req, res) => {

    const userEmail= req.body.email;
    const userContact= req.body.contact;
    const lastFourDigits = userContact.slice(-4);    
    const userName= req.body.name;
    const userId = (userName.toLowerCase().replace(/\s/g, '') + lastFourDigits);
    const userck = await users.findOne({$and: [{ userEmail }, { userContact }],});
    if (userck) {
        return res.status(400).json({ message: "user already exists" });
      }
    const user = new users({
        userId,
        userName,
        userEmail,
        userPassword: req.body.password,
        userContact,
    });
    user.save()
      .then(() => {
        req.session.message = {
          type: "success",
          message: "user added successfully",
        };
        console.log("Added");
        res.redirect("/userSin");
      })
      .catch((err) => {
        res.json({ message: err.message });
      });
  });
  

  
  //   login user
  user_route.get("/userSin",(req,res)=>{
    if(req.session.loggedin){
      res.redirect("/");
    }
  else{
    res.render("user/userSin",{title:"Login here..."});
  }
});


user_route.post("/usersin", async(req,res,next)=>{
  try{
    // req.session.firstItem = true;
    
    const email = req.body.email;
    const password = req.body.password;
    const user = await users.findOne({userEmail:email});
    
    if(user.userPassword == password){
      const sessionName = 'loggedin';
      req.session[sessionName] = true;
      req.session.loginuser = user.userId;
      // req.session.cartId1 = null;
      
      console.log("login success")
      res.redirect("/");
    }
    else{
      res.send("Invalid credentials");
    }
  }
  catch(error){
    res.send("Somthing went wrong");
  }
  
});

// to show all counters on index
user_route.get("/", async (req, res) => {
    
  try {
      const counters = await vendors.find();
      // Use the counters data in your response rendering or processing logic
      res.render("user/home", { counters });
    } catch (err) {
      // Handle error
      console.log(err);
    }
  
});


//useracnt
user_route.get("/useracnt",async (req,res)=>{
  try {
    const userdtl = await users.find({userId:req.session.loginuser});

    res.render("user/userAccount", { userdtl });
  } catch (err) {
    // Handle error
    console.log(err);
  }
});


user_route.get("/orderhistory", async (req, res) => {
  
  try {
    const allorders = await orders.find({customerId:req.session.loginuser});

    let fdcname = [];
    for(let i=0;i<allorders.length;i++){
      fdcname[i]= await vendors.find({foodCounterName:allorders[i].foodCounterId})
    } 
    res.render("user/orderhistory", { allorders,fdcname });
  } catch (err) {
    // Handle error
    console.log(err);
  }
  
});


// to show particular counters fooditems when user click it
user_route.get("/menu/:foodCounterId", async (req, res) => {
    
  req.session.cntid = req.params.foodCounterId;
  
  try {
      const items = await foodItems.find({foodCounterId:req.session.cntid});

      console.log(req.session.cntid);

      // Use the counters data in your response rendering or processing logic
      res.render("user/menu", { items });
    } catch (err) {
      // Handle error
      console.log(err);
    }
  
});


user_route.post("/addtocart", async (req, res) => { 
  
  if(req.session.loggedin){

    const foodCounterId = req.session.cntid;
    const itemId = req.body.itemid;
    const itemQuntity = req.body.itemqun;
    const customerId = req.session.loginuser;
    
    

      const itemdtl = await foodItems.find({itemId});

      let itemName = itemdtl[0].itemName;
      let itemPrice = itemdtl[0].itemPrice;

      
      const cart1 = new carts({
        foodCounterId,
        itemId,
        itemName,
        itemPrice,
        itemQuntity,
        customerId,
      });
      cart1.save()
      .then(() => {
        req.session.message = {
          type: "success",
          message: "cart added successfully",
        };
        console.log("Added");
        
      })
      .catch((err) => {
        res.json({ message: err.message });
      });
    }
    else{
      res.redirect("/usersin");
    }
      
});



user_route.post("/updatequn", async (req, res) => {
    
    const upqun = req.body.itemqun;
    const itemId = req.body.itemid;
  try {
    const result = await carts.updateOne(
      { cartId: req.session.cartId1, itemId: itemId },
      { $set: { itemQuantity: upqun } }
    );

      // console.log(items);

      // Use the counters data in your response rendering or processing logic
      res.render("user/checkout", { items });
    } catch (err) {
      // Handle error
      console.log(err);
    }
  
});

user_route.get("/address", async (req, res) => {
    
  try {
      const items = await carts.find({ customerId: req.session.loginuser, status: "pending" });

      let flag;
      if (items.length === 0) {
        flag = true;
      } else {
        flag = false;
      }
    
      // console.log(items);
      let sum=0;
      // Use the counters data in your response rendering or processing logic
      for(let i=0;i<items.length;i++){
        sum = sum+(items[i].itemPrice*items[i].itemQuntity);
      }
      res.render("user/checkout", { items ,sum , flag});
    } catch (err) {
      // Handle error
      console.log(err);
    }
  
});



user_route.post("/checkout", async (req, res) => {
  
  const orderId = await generateOrderId();
  // const itemId = request.params.itemid;
  const customerId = req.session.loginuser;
  console.log(customerId);
  let orderAmount = 0;
  const cartdtl = await carts.find({customerId:req.session.loginuser,status:"pending"});
  const foodCounterId = cartdtl[0].foodCounterId;

  req.session.cntid = foodCounterId;
  
  cartdtl.forEach((cartrow) => {
    orderAmount = orderAmount + (cartrow.itemPrice*cartrow.itemQuntity);
  });
    

  let orderDeliberyCharge = 15;
  if(orderAmount<=100){
    orderDeliberyCharge = 15;
  }
  else if(orderAmount<=200){
    orderDeliberyCharge = 20;
  }
  else if(orderAmount<=300){
    orderDeliberyCharge = 25;
  }
  else{
    orderDeliberyCharge = 30;
  }

  let orderTotalAmount = orderAmount+orderDeliberyCharge;
  const orderDateTime = Date.now();
  let paymentStatus = "pending";
  const order = new orders({
    orderId,
    foodCounterId,
    customerId,
    orderAmount,
    orderDeliberyCharge,
    orderTotalAmount,
    deliveryAddress: req.body.location,
    paymentStatus,
    orderDateTime,
  });
  order.save()
    .then(async () => {
      req.session.message = {
        type: "success",
        message: "order added successfully",
      };
      // io.emit("newOrder", { fdcid: fdcid });
      console.log("Added");
      let updtcart = await carts.updateMany(
        { customerId, status: "pending" }, 
        { $set: { status: "done" } } 
      );

      res.render("user/orderStatus");
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

async function generateOrderId() {
  let orderID;
  let order;
  do {
    const randomNum = Math.floor(Math.random() * 900000) + 100000;

    const timestamp = Date.now();

    orderID = `${randomNum}-${timestamp}`;

    order = await orders.findOne({orderId:orderID});
  } while (order !== null);

  return orderID;
}


user_route.post('/removeitem', async (req, res) => {
  const itemId = req.body.itemId; 

  // const item = await carts.find({customerId:req.session.loginuser,itemId});

  carts.deleteOne({ customerId:req.session.loginuser,itemId })
    .then(result => {
      if (result.deletedCount === 1) {
        // Document successfully deleted
        res.json({ success: true });
      } else {
        // Document not found or not deleted
        res.json({ success: false, error: 'Item not found in the cart' });
      }
    })
    .catch(error => {
      // Error occurred while deleting the document
      console.log(error);
      res.json({ success: false, error: 'An error occurred while deleting the item' });
    });
  

  });


  //sigout
  user_route.get('/logout', (req, res) => {
    const sessionId = 'loggedin';
  
    req.sessionStore.destroy(sessionId, (err) => {
      if (err) {
        console.error('Error destroying session:', err);
      } else {
        req.session.loggedin=false;
        console.log('Session destroyed');
        res.redirect('/'); // Redirect to the login page or any other desired destination
      }
    });
  });
  module.exports = user_route;
