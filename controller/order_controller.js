import {createRequire} from 'module'
const require=createRequire(import.meta.url);
import ErrorHandler from "../ErrorHandler.js";
import { catchAsyncError } from "../catchAsyncError.js";
import courseModel from "../models/Course.js";
import {userModel} from "../models/User.js";
import { notificationModel } from "../models/Notification.js";
import sendMail from "../utils/sendMail.js";
import { getAllOrdersService, newOrder } from "../services/order_service.js";
require('dotenv').config()
import {redis} from '../utils/redis.js'
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)


//create order
export const createOrder=catchAsyncError(async(req,res,next)=>{

try {

    const {courseId,payment_info}=req.body;
       
    console.log(courseId,payment_info,"22");
    if(payment_info){
        const paymentIntentId=payment_info.id;
        const paymentIntent=await stripe.paymentIntents.retrieve(paymentIntentId);
        if(paymentIntent.status!=='succeeded'){
            return next(new ErrorHandler("Payment not authorized",400));
        }
    }
    const user=await userModel.findById({_id:req.user._id});
    const courseExistInUser=user.courses.find((course)=>course._id.toString()===courseId);
    if(courseExistInUser){
        return next(new ErrorHandler('You have already purchased this course',400));
    }
    const course=await courseModel.findById({_id:courseId});
    // console.log({course,user})
    if(!course){
        
        return next(new ErrorHandler('Course not found',404));
    }    
    
  let data={
    courseId,
    userId:user._id,
    payment_info
  }

let mailData={
    order:{
        _id:course._id.toString().slice(0,6),
        name:course.name,
        price:course.price,
        date:new Date().toLocaleDateString('en-US',{year:"numeric",month:"long",day:"numeric"})
    }
}

try {
    if(user){
       let mail= await sendMail({
            email:user.email,
            subject:'Order Confirmation',
            template:'order-confirmation.ejs',
            data:mailData
        });
        console.log(mail)
    }
    
} catch (error) {
    
    return next (new ErrorHandler(error.message,500));
}
console.log({course:user.courses})
user.courses.push(course._id);
console.log({})

await redis.set(req?.user?._id,JSON.stringify(user));

await user.save();

await notificationModel.create({
    user:user._id,
    title:"New Order",
    message:`You have a new order from ${course.name}`
});
    course.purchased= Number(course.purchased);
 course.purchased = course.purchased + 1;

await course.save();
newOrder(data,res);
} catch (error) {
    return next (new ErrorHandler(error.message,500));
}

})

//get all orders

export const getAllOrders=catchAsyncError((req,res,next)=>{
    try {
        
            getAllOrdersService(res);

    } catch (error) {
        
        return next(new ErrorHandler(error.message, 400));
    }
})

//send stripe publishable key
export const sendStripePublishable=catchAsyncError((req,res)=>{
    try {
        res.status(200).json({
            publishableKey:process.env.STRIPE_PUBLISHABLE_KEY,
            success:true
        })

    } catch (error) {
    return next(new ErrorHandler(error.message, 400));

}
})

//new payment 
export const newPayment=catchAsyncError(async(req,res,next)=>{
    try {
        const myPayment=await stripe.paymentIntents.create({
            amount:req.body.amount,
            currency:"USD",
            metadata:{company:"E-Learning" },
            automatic_payment_methods:{
                enabled:true
            }
        })
        res.status(201).json({
            success:true,
            client_secret:myPayment.client_secret
        })
        
    } catch (error) {
        
        return next(new ErrorHandler(error.message, 400));
    }
})
