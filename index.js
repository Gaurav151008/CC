const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/zoopy")
const bodyParser = require('body-parser')
const { urlencoded } = require('body-parser')
const path = require('path')
const express = require('express')
const session = require('express-session')

const app = express()


app.use(bodyParser.urlencoded({extended:true}));

app.use("/public",express.static('public'));
app.use(express.static('public'));
// //set view engine    
app.set("view engine","ejs")
// const db  = mongoose.connection;
// db.on("error",(error)=> console.log(error));
// db.once("open", ()=> console.log("Connected.."));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(session({
    secret : "zoopy@11",
    saveUninitialized : true,
    resave : false,
}));
app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    // res.locals.thememsg = req.session.thememsg;
    res.locals.loggedin = req.session.loggedin;
    delete req.session.message;
    next();
})
const vendor_route = require('./routes/vendorRoutes');
app.use('/',vendor_route)

const user_route = require('./routes/userRoutes');
app.use('/',user_route)

var http = require("http").createServer(app);
var io = require("socket.io")(http);

http.listen(4000,function(){

    console.log("surver running");

    io.on("connection",function(socket){
        console.log("Auth value : "+ socket.id);
        
        socket.on("notify",function(details){
            socket.broadcast.emit("notify",details)
        })
    })
})

// app.listen(4000,function(){
//     console.log("Server is running...");
// });