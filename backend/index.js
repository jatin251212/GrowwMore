import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js"; 
import transcationRoutes from "./routes/transcation.route.js"; 


dotenv.config({});

const app=express();

app.get("/",(req,res)=>{
    return res.status(200).json({
        message:"Hello from backend",
        success:true
    })
})

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// const corsOptions={
//     origin:'http://localhost:3000',
//     Credentials:true
// }

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  };

app.use(cors(corsOptions));

const PORT=process.env.PORT || 5000;

app.use('/api/v1/user',userRoutes);
app.use('/api/v1/transcation',transcationRoutes);


app.listen(PORT,()=>{
    connectDB();
    console.log(`Server running at port ${PORT}`);
})