const Vendor = require('../models/vendors');

const addVendor = async(req,res)=>{
    // const {vendorId,vendorName,vendorEmail,foodCounterName,vendorPassword} = req.body;
    try{
        res.render('login');
    }
    catch(error){
        console.log(error.message);
    }
}
module.exports = {
    addVendor
}