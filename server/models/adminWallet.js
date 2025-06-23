const mongoose = require("mongoose");
const { schema } = require("./Ride");
const adminWallet=new mongoose.Schema({
rideId:{
    type:String
},
userId:{
    type:String
},
share:{
    type:Number
}
},
 {
    timestamps: true, 
  })
  module.exports = mongoose.model('adminWallet', adminWallet);
