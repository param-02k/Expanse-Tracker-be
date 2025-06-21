const express = require('express');
const server = express();
const mongoose = require('mongoose');

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

server.listen(4000, ()=>{
    console.log("server is hearing at localhost :",4000);
    
})

module.exports = server;