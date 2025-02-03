import  config  from "../config.js";
import jwt from "jsonwebtoken"

function userMiddleware(req,res,next){
  const authHeader=req.headers.authorization;
  if(!authHeader || !authHeader.startsWith("Bearer ")){
    return res.status(401).json({errors:"No token provided"})
  }
  const token=authHeader.split(" ")[1]; //extract token (we want only token not the type ie Bearer ...so we write we want index 1 value after space )
  try{
    const decoded=jwt.verify(token,config.JWT_USER_PASSWORD) //token validation
    req.userId=decoded.id //if valid token then we match userId with decodedid
    next(); //move control to the next fxn
  }catch(error){
    return res.status(401).json({errors:"Invalid token or expired token"})
    console.log("Invalid token or expired token"+ error)
  }
}

export default userMiddleware;