// import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from 'express';
 const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


 class _authMiddleware{

verifyToken=async (req:Request,res:Response, next:NextFunction)=>{
    try {
        const token = req.header("Authorization");
  
        const verified = jwt.verify(token, process.env.Secret);
        if(verified){

            next()


        }else{
            // Access Denied
            return res.status(401).send("Access Denied");
        }
        

    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
    }
}

 export const authMiddleware= new _authMiddleware()