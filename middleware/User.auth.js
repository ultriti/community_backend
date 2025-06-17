const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


module.exports.isAunthenticate = (req, res, next) =>{
   
   try {
     const token = req.cookies.token;
     console.log("token :-> ", token);
     

     if(!token){
        res.status(404).json({message: 'unauthorized, token not avalble'})
    
     }else{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            res.status(404).json({message: 'unauthorized, token is invalid'})
        }
        req.id = decoded.userId;
        next();
     }
    
    
   } catch (error) {
    res.status(404).json({err: error.message});
   }

}
