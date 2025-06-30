// define a middleware for accessing routes apart from signin, signup

import { NextFunction, Request, Response } from 'express';
import dotenv from "dotenv";
import  jwt  from 'jsonwebtoken';

//@ts-ignore
export const UserMiddleware = (req:Request, res:Response, next: NextFunction) => 
{
    const header = req.headers["authentication"];
    if (!header) return res.status(401).json({ message: "No token provided" });

    try {
        const decodedToken = jwt.verify(header as string, process.env.JWT_USER_SECRET as string);
        if (decodedToken) {
            //@ts-ignore
            req.userId = decodedToken.token;
            next();
        }
        else{
            res.status(401).json({message:"you are not signed up"});
        }
    }
    catch(err)
    {

    }
}