import { Admin } from "../modals/admin.model.js";
import bcrypt from "bcryptjs"
import {z} from "zod"
import jwt from 'jsonwebtoken'
import config from "../config.js";




//Signup Logic---------------------------------
export const signup=async(req,res)=>{
 const {firstName,lastName,email,password}=req.body;

 //server side validation using Zod
 const adminSchema = z.object({
  firstName:z.string().min(3,{message:"firstName must be atleast 3 char long"}),
  lastName:z.string().min(3,{message:"lastname must be atleast 3 char long"}),
  email:z.string().email(),
  password:z.string().min(6,{message:"password must be atleast 6 char long"})
 })

 const validatData=adminSchema.safeParse(req.body);
 if(!validatData.success){
  return res.status(400).json({errors:validatData.error.issues.map(err=>err.message)});
 }

 const hashedPassword= await bcrypt.hash(password,10) //password hashing

try{
const existingAdmin = await Admin.findOne({email:email});
if(existingAdmin){
  return res.status(400).json({errors:"Admin already exist"})
}
const newAdmin = new Admin({firstName,lastName,email,password:hashedPassword})
await newAdmin.save();    //save new Admin to database
res.status(201).json({message:"Signup successfully",newAdmin});
}catch( error){
  res.status(500).json({errors:"Error in signup"})
  console.log("Error in signup",error)
}
}


//Login Logic----------------------------------
export const login =async (req,res)=>{
   const {email,password}=req.body;
   try{
      const admin = await Admin.findOne({email:email})
      const isPassword = await bcrypt.compare(password,admin.password) //compare uer given password and database stored password(ie->Admin.password)

      if(!admin || !isPassword){
        return res.status(403).json({errors:"invalid credentials"});
      }

      //jwt code-------
      const token = jwt.sign({   //token generation 
        id:admin._id,
        },
        config.JWT_ADMIN_PASSWORD,
        {expiresIn:"1d"}
      );
      const cookieOption={
        expires:new Date(Date.now()+ 24*60 * 60 * 1000), //1 day
        httpOnly:true,//cookie can not directly accessible by JS
        secure: process.env.NODE_ENV==="Production", //true for https ...for http it is false
        sameSite:"Strict" //prevents from CSRF attacks
      }
        res.cookie("jwt",token,cookieOption)
      res.status(201).json({message:"Login successfull!!",admin,token})
   }catch(error){
    res.status(500).json({errors:"Error in login"})
    console.log("Error in login",error)
   }
}

//Logout Logic--------------------------------
export const logout=async (req,res)=>{
  try{
    if(!req.cookies.jwt){
      return res.status(401).json({errors:"Kindly login first"})
    }
  res.clearCookie("jwt");
  res.status(200).json({message:"Logged out successfully"})
  }
catch(error){
  res.status(500).json({errors:"Error in logout"})
  console.log("Error in logout",error)
}}
