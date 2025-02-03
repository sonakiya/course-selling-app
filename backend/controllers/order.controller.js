import { Order } from "../modals/order.model.js";
import { Purchase } from "../modals/purchase.model.js";

export const orderData=async(req,res)=>{
    const order= req.body;
    try{
     const orderInfo=await Order.create(order)
     console.log(orderInfo)
     const userId=orderInfo?.userId
     const courseId=orderInfo?.courseId
     res.status(201).json({message:"Order Details: ",orderInfo})
     if(orderInfo){
      const newPurchase = new Purchase({ userId, courseId });
      await newPurchase.save(); // Save new purchase to the database

     }
    }catch(error){
      console.log("Error in order",error)
      res.status(500).json({errors:"Error in order creation"})
    }
} 