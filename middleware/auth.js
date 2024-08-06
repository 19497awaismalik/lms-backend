import ErrorHandler from "../ErrorHandler.js";
import { catchAsyncError } from "../catchAsyncError.js";
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
import { redis } from "../utils/redis.js";


config();

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
           
    const access_token = req.token;
    
    if(!access_token){
        return next(new ErrorHandler('Please login to access this course 14', 400));
    }
      

    const decoded = jwt.verify(req.token, process.env.ACCESS_TOKEN);

    if(!decoded){
        return next(new ErrorHandler('access token is not valid', 400));
    }else{
    }
    const user = await redis.get(decoded.id);
    if(!user){
        return next(new ErrorHandler('user not found', 400));

    }
    
    req.user = JSON.parse(user)

    next();
})

// validate user role
export const authorizRoles = (...roles)=>{
    return (req, res, next) => {
        
        if (!roles.includes(req?.user?.role) || "") {
            
            return next(new ErrorHandler(`Role: ${req?.user?.role} is not allowed to access this course`));
        }
        next()


    }
}

