const user = require('../model/userModel');
const Expanse = require('../model/expancemodel');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const registeruser = async (req, res) => {
    let { fullname, email, mobilenumber, username, password } = req.body

    fullname = fullname?.trim();
    email = email?.trim();
    mobilenumber = mobilenumber?.trim();
    username = username?.trim();
    password = password?.trim();

    if (!fullname) {
        res.json({
            statuscode: 404,
            message: "Fullname is required !!",
            success: false,
            data: {}
        })
        return
    }

    if (!email) {
        res.json({
            statuscode: 404,
            message: "Email is required !!",
            success: false,
            data: {}
        })
        return
    }

    if (!mobilenumber) {
        res.json({
            statuscode: 404,
            message: "Mobilenumber is required !!",
            success: false,
            data: {}
        })
        return
    }

    if (!username) {
        res.json({
            statuscode: 404,
            message: "Username is required !!",
            success: false,
            data: {}
        })
        return
    }

    if (!password) {
        res.json({
            statuscode: 404,
            message: "Password is required !!",
            success: false,
            data: {}
        })
        return
    }

    password = await bcrypt.hash(password, 16);

    const createdUser = await user.create({
        fullname,
        email,
        mobilenumber,
        username,
        password
    })

    if (!createdUser) {
        res.json({
            statuscode: 500,
            message: "Failed to creating user",
            success: false,
            data: {}
        })
    }
    res.json({
        statuscode: 200,
        message: "Registered Successfully",
        success: true,
        data: {}
    })
}

const loginuser = async (req, res) => {
    let { username, password } = req.body

    username = username?.trim();
    password = password?.trim();

    if (!username) {
        res.json({
            statuscode: 404,
            message: "Username is required !!",
            success: false,
            data: {}
        })
        return
    }

    if (!password) {
        res.json({
            statuscode: 404,
            message: "Password is required !!",
            success: false,
            data: {}
        })
        return
    }

    const dbdata = await user.findOne({ username });

    if (!dbdata) {
        return res.json({
            statuscode: 404,
            message: "Username not found",
            success: false,
            data: {}
        });
    }

    const isMatch = await bcrypt.compare(password, dbdata.password);
    if (!isMatch) {
        return res.json({
            statuscode: 404,
            message: "Password not matched",
            success: false,
            data: {}
        });
    }

    const userData = {
        userId: dbdata._id,
    };

    const token = jwt.sign(userData, "param", { expiresIn: '1h' })

    res.cookie("Token", token, {
        maxAge: 3600000,
        httpOnly: true,
        secure: true
    })

    res.json({
        statuscode: 200,
        message: "Login Successfully",
        success: true,
        data: {}
    })
}

const addExpense = async (req, res) => {
    let resCookie = req.cookies

    if (!resCookie) {
        res.json({
            statuscode: 404,
            message: "No cookie found, login again !!",
            success: false,
            data: {}
        })
        return
    }

    let token = resCookie.Token

    let { userId } = jwt.verify(token, "param")

    let { amount, category, description } = req.body

    if (!amount || !category || !description) {
        res.json({
            statuscode: 404,
            message: "All fields are required !!",
            success: false,
            data: {}
        })
    }

    const Expanses = await Expanse.create({
        user: userId,
        amount,
        category,
        description
    })

    if (!Expanses) {
        res.json({
            statuscode: 404,
            message: "Failed to add expanse",
            success: false,
            data: {}
        })
    }

    res.json({
        statuscode: 200,
        message: "Add expanse successfully",
        success: true,
        data: Expanses
    })
}

const getallexpanse = async (req, res) => {

    try{
    let { Token } = req.cookies

    if (!Token) {
        res.json({
            statuscode: 404,
            message: "No token found, Please login again !",
            success: false,
            data: {}
        })
    }

    const decodedToken = jwt.verify(Token, "param")

    //  {"userId": "12345", "iat": "...", "exp": "..."}

    const userexpanses = await Expanse.find({ user: decodedToken.userId })

    const userdata = await user.findById(decodedToken.userId).select("username");


    if (!userexpanses) {
        res.json({
            statuscode: 404,
            message: "No expanses found",
            success: false,
            data: {}
        })
        return
    }

    res.json({
        statuscode: 200,
        message: "Expanses fetched successfully",
        success: true,
        data: {
            userdata,
            userexpanses
        }
    })
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.json({
            statuscode: 500,
            message: "Internal server error",
            success: false,
            data: {}
        });
    }
}

const updateexpanse = async (req, res) => {
    const Token = req.cookies.Token

    if (!Token) {
        res.json({
            statuscode: 404,
            message: "No token found , please login again !",
            success: false,
            data: {}
        })
    }

    //     let decode;
    // try {
    //     decode = jwt.verify(Token, "param");
    // } catch (err) {
    //     return res.status(403).json({
    //         statuscode: 403,
    //         message: "Invalid or expired token",
    //         success: false,
    //         data: {}
    //     });
    // }


    const decode = jwt.verify(Token, "param")
    const userId = decode.userId
    const expenseId = req.params._id

    console.log("userId from token:", userId);
    console.log("expenseId from params:", expenseId);


    const { amount, category, description } = req.body


    if (!amount || !category || !description) {
        res.json({
            statuscode: 404,
            message: "All fields are required",
            success: false,
            data: {}
        })
        return
    }

    const oldexpanse = await Expanse.findOne({
        _id: expenseId,
        user: userId
    })


    if (!oldexpanse) {
        res.json({
            statuscode: 404,
            message: "Expanses not found",
            success: false,
            data: {}
        })
        return
    }

    oldexpanse.amount = amount
    oldexpanse.category = category
    oldexpanse.description = description

    const updateexpanse = await oldexpanse.save()

    res.json({
        statuscode: 200,
        message: "Updated Successfully",
        success: true,
        data: updateexpanse
    })

}

const deleteuser = async (req, res) => {
    const Token = req.cookies.Token

    if (!Token) {
        res.json({
            statuscode: 404,
            message: "No token found, Please login again !!",
            success: false,
            data: {}
        })
        return
    }

    const decode = jwt.verify(Token, "param")
    const userId = decode.userId
    const existingUser = await user.findById(userId)

    if (!existingUser) {
        return res.json({
            statuscode: 404,
            message: "User not found!",
            success: false,
            data: {}
        });
    }

    await Expanse.deleteMany({ user: userId })

    await user.findByIdAndDelete(userId)

    res.clearCookie("Token")

    res.json({
        statuscode: 200,
        message: "User and related expenses deleted successfully",
        success: true,
        data: {}
    })

}

const logoutuser = (req, res) => {
    res.clearCookie("Token")

    res.json({
        statuscode: 200,
        message: "User logout successfully",
        success: true,
        data: {}

    })
}

module.exports = {
    registeruser,
    loginuser,
    addExpense,
    getallexpanse,
    updateexpanse,
    deleteuser,
    logoutuser
};