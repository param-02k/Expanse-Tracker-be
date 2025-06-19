const mongoose = require("mongoose")

const UserSchema = mongoose.Schema(
    {
        fullname : {type : String, required : true},
        email : {type : String, required : true},
        mobilenumber : {type : Number, required : true},
        username : {type : String, required : true},
        password : {type : String, required : true, match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address"
      ] }
    },{
    timestamps : true
})

module.exports = mongoose.model("user", UserSchema)