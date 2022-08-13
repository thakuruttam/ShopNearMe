const express = require('express');
import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from './src/middleware/authmiddleware';
const prisma = new PrismaClient()
var bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const {Server}= require("socket.io")
const http = require("http");
const app = express();





const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });
var corsOptions = {
    origin:"*",
    optionsSuccessStatus: 200 // For legacy browser support
}

// io.on("connection", (socket:any) => {
//     console.log(`User Connected: ${socket.id}`);
//     socket.on("disconnect",(socket:any)=>{
//         console.log("disconnected",socket.id)
//     })
    
//     socket.on("join_room", (data:any) => {
//         socket.join(data);
//         console.log(`User with ID: ${socket.id} joined room: ${data}`);
//       });
//     socket.on("send_message",(data:any)=>{
//         console.log("message",data.message,data.room, data.from)
//         socket.to(data.room).emit("receive_message", (data))
//     })
// })




app.use(cors(corsOptions));
const PORT = 8000;
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use("/home",authMiddleware.verifyToken)
app.get("/home", async (req:Request,res:Response)=>{

let result= await prisma.users.findMany({})
res.json(result)
})

app.post("/", async (req:Request,res:Response)=>{
    try {
        let  {id,
            name,
            caption,
            link,
            thumbnail} = req.body
            let insert= {
                id,
            name,
            caption,
            link,
            thumbnail
            }
            let result= await prisma.videos.create(
               { data: insert} )
            res.json(result)
                
    } catch (error) {
       res.send(error) 
    }
 
    })

    app.post("/signup", async (req:Request,res:Response)=>{
        try {
            console.log(req.body)
            let emailcheck= await prisma.users.findMany({
                where:{
                    email:req.body.email
                }
            })
            if(emailcheck.length>0){
                res.json({message:"User Already Exist, Please Login"})
            }
            
            const salt = await bcrypt.genSalt(6);
            const hashed = await bcrypt.hash(req.body.password, salt);
            const password= hashed.toString()
            let user= await prisma.users.create({
                data:{
                    name:req.body.name,
                    email:req.body.email,
                    passwords:password
    
    
                }
            })
    
    
    
            let jwtSecretKey = "randomsecret";
        let data = {
           email:req.body.email,
           password
    
        }
      
        const token = jwt.sign(data, jwtSecretKey);
    
        let response ={
            message:"User Signup Successfull",
            data:token
        }
               res.json(response)
              
            
        } catch (error) {
          res.send(error)  
        }
        })
    
           app.post("/login", async (req:Request,res:Response)=>{
               
            try {
                console.log(req.body.email)

                let user= await prisma.users.findFirst({
                    where:{
                        email:req.body.email,
                    }
                    
                })
                console.log(user)
    
                if(user==null){
                    res.json({message:"NO email registered with this email"})
                    console.log("NO email registered with this email ")
                }
                let matchpassword = await bcrypt.compare(req.body.password,user!.passwords)
    
                if (matchpassword==true){
                   let data={
                       email:user!.email,
                       password:user!.passwords
                   }
    
                    const token = jwt.sign(data, process.env.Secret);
                    let response={
                        message:"Logged In Successfully",
                        data:token
                    }
                    res.json(response).status(200)
    
                }
                else{
                    res.json({message:"Invalid Password"})
                       
                         
                }
            } catch (error) {
               res.send(error) 
            }
         
              
               })


app.post("/items", async (req:Request,res:Response)=>{
    try {
        let  {email,itemname, price} = req.body
        let user= await  prisma.users.findMany({
            where:{
                email:email
            }
        })
    let insert= {
        user_id:user[0].id,
        name:itemname,
        price:price
    
    }
    let result= await prisma.item.create(
       { data: insert} )
       console.log(result)
    res.json("Success")
                
    } catch (error) {
       res.send(error) 
    }
 
    })

    app.post("/item", async (req:Request,res:Response)=>{
        try {
            let search= req.body.search
            console.log(search)
                let result= await prisma.item.findMany({
                 where:{
                     name:
                     {
                         contains:search
                     }
                 },
                 include:{
     users:true
                 }
                })
                res.json(result)  
        } catch (error) {
           res.send(error) 
        }
    
           })


           app.put("/signin/tier2", async (req:Request,res:Response)=>{
            try {
                let {shopNames,email,address,phoneNumber, city}= req.body
                let result= await prisma.users.updateMany({
                    where: {
                        email: email,
                      },
                      data: {
                        shopName:shopNames,
                        address:address,
                        isVendor:1,
                        phoneNumber:phoneNumber,
                        city:city,


                      },
                } )
                res.json(true)
                
            } catch (error) {
               res.send(error) 
            }
           
                })



                app.post("/checkVendor", async(req:Request,res:Response)=>{
                    try {
                        let email = req.body.email
                        console.log("email", email)
                        let userData= await prisma.users.findMany({
                            where:{
                                email:email
                            }
                        })
                        console.log("userdata",userData[0])
                        if(userData){
                            console.log("userdata",userData[0].isVendor)
                            res.json( userData[0].isVendor )      
    
                        }
    else {
        res.json(null)
    }
                        
                    } catch (error) {
                        res.json(error)
                    }
                  
                })
     
                app.post("/shop", async(req:Request,res:Response)=>{
                    try {
                        let email = req.body.email
                       console.log("email", email)
    let result= await prisma.users.findMany({
        where:{
            email:email
        },
        select:{
            item:true
        }
    })
                        
        res.json(result)
    
                        
                    } catch (error) {
                        res.json(error)
                    }
                  
                })
     

                if(process.env.NODE_ENV= "production"){
                    app.use(express.static("client/build"));
                }

               server.listen(process.env.PORT || 5000, () => {
                console.log("SERVER RUNNING");
              });