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
})
  module.exports = mongoose.model('adminWallet', adminWallet);
