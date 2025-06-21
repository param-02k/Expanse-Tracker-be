const express = require("express")
const router = require("./routes/route")
const server = require("./app")
const cookieParser = require("cookie-parser")


server.use(express.json())
server.use(cookieParser())
server.use (router)
