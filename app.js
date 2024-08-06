import express from 'express';
import cors from 'cors'
import cookieParser from "cookie-parser"
import  {config} from 'dotenv'
import { ErrorMiddleware } from './middleware/error.js';
import userRouter from './routes/user_route.js';
import courseRouter from './routes/course_route.js';
import orderRouter from './routes/order_route.js';
import notificationRouter from './routes/notification_route.js';
import analyticsRouter from './routes/analytics_route.js';
import layoutRouter from './routes/layout_route.js';
import { rateLimit } from 'express-rate-limit'

config()
export const app=express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.  


//body-parser
app.use(express.json({limit:'50mb'}));

//cookie-parser
app.use(cookieParser());

// 
//cors =>cross origin resource sharing
app.use(cors({
    origin:['https://lms-frontend-roan.vercel.app'],
    credentials:true,
    methods:["POST","GET","DELETE","PUT"]
}))
 
//routes
app.use('/api/v1',userRouter);

app.use('/api/v1',courseRouter)

app.use('/api/v1',orderRouter)

app.use('/api/v1',notificationRouter)

app.use('/api/v1',analyticsRouter)

app.use('/api/v1',layoutRouter)


  
app.get('/',(req,res,next)=>{
    res.status(200).json({
        success:true,
        message:"API is working"
    })
  })




app.all('*',(req,res,next)=>{
        const error=new Error(`Route ${req.originalUrl} not found`)
        error.statusCode=404;
        next(error);
})

app.use(limiter)

app.use(ErrorMiddleware);
