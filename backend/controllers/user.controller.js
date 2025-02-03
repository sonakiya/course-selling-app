import { User } from "../modals/user.model.js";
import bcrypt from "bcryptjs"
import {z} from "zod"
import jwt from 'jsonwebtoken'
import config from "../config.js";
import { Purchase } from "../modals/purchase.model.js";
import { Course } from "../modals/course.modals.js";


//Signup Logic---------------------------------
export const signup=async(req,res)=>{
 const {firstName,lastName,email,password}=req.body;

 //server side validation using Zod
 const userSchema = z.object({
  firstName:z.string().min(3,{message:"firstName must be atleast 3 char long"}),
  lastName:z.string().min(3,{message:"lastname must be atleast 3 char long"}),
  email:z.string().email(),
  password:z.string().min(6,{message:"password must be atleast 6 char long"})
 })

 const validatData=userSchema.safeParse(req.body);
 if(!validatData.success){
  return res.status(400).json({errors:validatData.error.issues.map(err=>err.message)});
 }

 const hashedPassword= await bcrypt.hash(password,10) //password hashing

try{
const existingUser = await User.findOne({email:email});
if(existingUser){
  return res.status(400).json({errors:"User already exist"})
}
const newUser = new User({firstName,lastName,email,password:hashedPassword})
await newUser.save();    //save new user to database
res.status(201).json({message:"Signup successfully",newUser});
}catch( error){
  res.status(500).json({errors:"Error in signup"})
  console.log("Error in signup",error)
}
}


//Login Logic----------------------------------
export const login =async (req,res)=>{
   const {email,password}=req.body;
   try{
      const user = await User.findOne({email:email})
      const isPassword = await bcrypt.compare(password,user.password) //compare uer given password and database stored password(ie->user.password)

      if(!user || !isPassword){
        return res.status(403).json({errors:"invalid credentials"});
      }

      //jwt code-------
      const token = jwt.sign({   //token generation 
        id:user._id,
        },
        config.JWT_USER_PASSWORD,
        {expiresIn:"1d"}
      );
      const cookieOption={
        expires:new Date(Date.now()+ 24*60 * 60 * 1000), //1 day
        httpOnly:true,//cookie can not directly accessible by JS
        secure: process.env.NODE_ENV==="Production", //true for https ...for http it is false
        sameSite:"Strict" //prevents from CSRF attacks
      }
        res.cookie("jwt",token,cookieOption)
      res.status(201).json({message:"Login successfull!!",user,token})
   }catch(error){
    res.status(500).json({errors:"Error in login"})
    console.log("Error in login",error)
   }
}

//Logout Logic--------------------------------
export const logout=async (req,res)=>{
  try{
  res.clearCookie("jwt");
  res.status(200).json({message:"Logged out successfully"})
  }
catch(error){
  res.status(500).json({errors:"Error in logout"})
  console.log("Error in logout",error)
}}


//get purchased courses
export const purchases=async (req,res)=>{
  const userId =req.userId;
  try{
   const purchased = await Purchase.find({userId})
   let purchasedCourseId=[]

   for(let i=0;i<purchased.length;i++){
    purchasedCourseId.push(purchased[i].courseId)

  }
  const courseData=await Course.find({
    _id:{$in:purchasedCourseId}  
      })
   res.status(200).json({purchased,courseData})
  }catch(error){
    res.status(500).json({errors:"Error in purchase"})
    console.log("Error in purchase".error)
  }
}


