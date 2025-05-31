const express = require("express")
const server  = express()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const user = require("./model/userModel")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const Expanse = require("./model/expancemodel")

server.use(express.json())
server.use(cookieParser())

async function connectToDb(){
    const mongoDBURL = "mongodb+srv://priyam6280:1234poiu@cluster0.5k5vx.mongodb.net/expensetracker"
    await mongoose.connect(mongoDBURL)
    .then((con)=>{
        console.log("Connection Successfully", con.connection.host);
    })
    .catch((err)=>{
        console.error("Connection Error :", err);  
    })
}

connectToDb()

server.post("/registerdata", async (req,res)=>{
        let{fullname, email, mobilenumber, username, password } = req.body

        fullname = fullname?.trim();
        email = email?.trim();
        mobilenumber = mobilenumber?.trim();
        username = username?.trim();
        password = password?.trim();

        if(!fullname){
            res.json({
                statuscode : 404,
                message : "Fullname is required !!",
                success : false,
                data : {}
            })
            return
        }

        if(!email){
            res.json({
                 statuscode : 404,
                message : "Email is required !!",
                success : false,
                data : {}
            })
            return
        }

        if(!mobilenumber){
            res.json({
                 statuscode : 404,
                message : "Mobilenumber is required !!",
                success : false,
                data : {}
            })
            return
        }

        if(!username){
            res.json({
                statuscode : 404,
                message : "Username is required !!",
                success : false,
                data : {}
            })
            return
        }

        if(!password){
            res.json({
                statuscode : 404,
                message : "Password is required !!",
                success : false, 
                data : {}
            })
            return
        }

password = await bcrypt.hash(password,16);

const createdUser = await user.create({
    fullname,
    email,
    mobilenumber,
    username,
    password
})

if(!createdUser){
    res.json({
        statuscode : 500,
        message : "Failed to creating user",
        success : false,
        data : {}
    })
}
res.json({
    statuscode : 200,
    message : "Registered Successfully",
    success : true,
    data : {}
})
})

server.post("/logindata",async (req,res)=>{
        let{username,password} = req.body

            username = username?.trim();
            password = password?.trim();

        if(!username){
            res.json({
                statuscode : 404,
                message : "Username is required !!",
                success : false,
                data : {}
            })
            return
        }

        if(!password){
            req.json({
                statuscode : 404,
                message : "Password is required !!",
                success : false,
                data : {}
            })
            return
        }

        const dbdata = await user.findOne({username})

        if(dbdata.username != username){
                res.json({
                    statuscode : 404,
                    message : "username not matched",
                    success : false,
                    data : {}
                })
                return
        }

        if(dbdata.username === username){
            if(! await bcrypt.compare(password,dbdata.password)){
                res.json({
                    statuscode : 404,
                    message : "password not matched",
                    success : false,
                    data : {}
                })
                return
            }else{
                const userData = {
                    "userId" : dbdata._id,
                }

                const token = jwt.sign(userData,"param",{expiresIn : '1h'})

                res.cookie("Token", token,{
                    maxAge: 3600000,
                    httpOnly: true,
                    secure: true
                })

                res.json({
                    statuscode : 200,
                    message : "Login Successfully",
                    success : true,
                    data : {}
                })
            }
        }
})

server.post("/addexpanse", async (req,res) => {
    
    let resCookie = req.cookies

    if(!resCookie){
        res.json({
            statuscode : 404,
            message : "No cookie found, login again !!",
            success : false,
            data : {}
        })
        return
    }

    let token = resCookie.Token

    let{userId} = jwt.verify(token, "param")

    let {amount, category, description} = req.body

    if(!amount || !category || !description){
        res.json({
            statuscode : 404,
            message : "All fields are required !!",
            success : false,
            data : {}
        })
    }

    const Expanses = await Expanse.create({
        user : userId,
        amount,
        category,
        description
    })

    if(!Expanses){
        res.json({
            statuscode : 404 ,
            message : "Failed to add expanse",
            success : false,
            data : {}
        })
    }

    res.json({
        statuscode : 200,
        message : "Add expanse successfully",
        success : true,
        data : Expanses
    })

})

server.get("/getallexpanse", async (req,res)=>{

    let {Token} = req.cookies

    if(!Token){
        res.json({
            statuscode : 404,
            message : "No token found, Please login again !",
            success : false,
            data : {}
        })   
     }

     const decodedToken = jwt.verify(Token, "param")

    //  {"userId": "12345", "iat": "...", "exp": "..."}

     const userexpanses = await Expanse.find({user : decodedToken.userId})
     
     const userdata = await user.findById(decodedToken.userId).select("username");
     

     if(!userexpanses){
        res.json({
            statuscode : 404,
            message : "No expanses found",
            success : false,
            data : {}
        })
        return 
     }

     res.json({
        statuscode : 200,
        message : "Expanses fetched successfully",
        success : true,
        data : {
            userdata,
            userexpanses
        }
     })
     
})

server.post("/updateexpanse/:id", async (req,res) => {
    const Token = req.cookies.Token

    if(!Token){
        res.json({
            statuscode : 404 ,
            message : "No token found , please login again !",
            success : false,
            data : {}
        })
    }

    const decode = jwt.verify(Token, "param")
    const userId = decode.userId
    const expanseId = req.params.id
    console.log(expanseId);
    
console.log(req.body);

    const {amount,category,description} = req.body 
    

    if(!amount || !category || !description){
        res.json({
            statuscode : 404,
            message : "All fields are required",
            success : false,
            data : {}
        })
        return
    }

    const oldexpanse = await Expanse.findOne({
        _id : expanseId,
        user : userId
    })

    if(!oldexpanse){
        res.json({
            statuscode : 404,
            message : "Expanses not found",
            success : false,
            data : {}
        })
        return
    }

    oldexpanse.amount = amount
    oldexpanse.category = category
    oldexpanse.description = description

    const updateexpanse = await oldexpanse.save()

    res.json({
        statuscode : 200,
        message : "Updated Successfully",
        success : true,
        data : updateexpanse
    })

})


server.listen(4000, ()=>{
    console.log("server is hearing at localhost :",4000);
    
})