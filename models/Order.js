import mongoose,{Schema} from 'mongoose';

//1 courseId
//2 userId
//3 payment_info 
// main three things in order 
const orderSchema=new Schema({
courseId:{
    type:String,
    required:true
},
userId:{
    type:String,
    required:true
},
payment_info:{
    type:Object,
    // required:true
},

},{timestamps:true})

export const orderModel=mongoose.model('order',orderSchema);