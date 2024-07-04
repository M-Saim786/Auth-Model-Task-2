const bcrypt = require("bcryptjs")
const jWt = require("jsonwebtoken")
const UserSchema = require("../Model/UserSchema")
const { sendEmail } = require("../helper/mailer")
require("dotenv").config()


function generate4DigitOTP() {
    let otp;
    do {
        otp = Math.floor(Math.random() * 10000);
    } while (otp.toString().length < 4);

    return otp;
}

exports.signUp = async (req, res) => {
    try {
        const { email, password } = req.body
        // console.log(email, password)
        if (!email || !password) {
            return res.status(400).json({
                message: "email & password is required"
            })
        }
        const userFind = await UserSchema.findOne({ email });
        if (userFind) {
            return res.status(400).json({
                message: "User already exsists"
            })
        }

        const hashPassword = await bcrypt.hash(password, 12)
        req.body.password = hashPassword;
        const otp = generate4DigitOTP();
        console.log(otp)
        req.body.otp = otp;

        const user = await UserSchema(req.body).save();
        // console.log(process.env.secretkey)
        const token = jWt.sign({ user_id: user._id }, process.env.SECRET_KEY, { expiresIn: "2h" })
        console.log("Generated token:", token); // In signUp


        sendEmail(
            email,
            "Otp Verification ",
            `<h1>Verify Account</h1>
            <p>your otp is : ${otp}</p>`
        )

        return res.status(200).json({
            message: `Otp sent to ${email}`,
            token: token
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body
        const { authorization } = req.headers
        // console.log("Received token", authorization);
        const token = authorization.replace(/^Bearer\s+/, "");
        // console.log("After removing bearer token", token);

        if (!authorization) {
            return res.status(401).json({
                message: "Token not provided"
            })
        }
        if (!otp) {
            return res.status(404).json({
                message: "OTP not found"
            })
        }
        else if (otp.length != 4) {
            return res.status(400).json({
                message: "Otp must be 4 letter"
            })
        }
        else {
            jWt.verify(token, process.env.SECRET_KEY, async (err, decode) => {
                if (err) {
                    return res.status(401).json({
                        message: "Invalid Token"
                    })
                }
                console.log("decode", decode)
                req.userid = decode.user_id
                const userFind = await UserSchema.findById(decode.user_id)
                console.log("userFind", userFind)
                if (otp != userFind?.otp) {
                    return res.status(401).json({
                        message: "Invalid Otp"
                    })
                }
                await userFind.updateOne({
                    isVerify: true
                })
                return res.status(200).json({
                    message: "Otp Verify Success "
                })
            })

        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                message: "email & password is required"
            })
        }
        const user = await UserSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        if (!user.isVerify) {
            return res.status(404).json({
                message: "User is not verified"
            })
        }
        req.body.password = bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                // console.error(err);
                return res.status(500).json({
                    message: "Internal Error",
                    error: err,
                })
            }
            if (result) {
                // Passwords match
                const token = jWt.sign({ user_id: user._id }, process.env.SECRET_KEY, { expiresIn: "2h" })

                return res.status(200).json({
                    message: "Login Successfully",
                    data: user,
                    token: token
                })
            }
            return res.status(401).json({
                message: "Incorrect Password",
            })

        })



    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(500).json({
                message: "Email is not provided"
            })
        }
        const userFind = await UserSchema.findOne({ email })
        if (!userFind) {
            return res.status(500).json({
                message: "user not found"
            })
        }
        const token = jWt.sign({ user_id: userFind._id }, process.env.SECRET_KEY, { expiresIn: "2h" })

        sendEmail(
            email,
            "Forget Password ",
            `<h1>Forget Password</h1>
            <p>your password reset token is : <b>${token}</b></p>`
        )

        return res.status(200).json({
            message: `Email sent to ${email}`
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const { password } = req.body
        const { authorization } = req.headers
        const token = authorization.split(' ')[1];
        if (!authorization) {
            return res.status(401).json({
                message: "Token not provided"
            })
        }
        if (!password) {
            return res.status(404).json({
                message: "password not found"
            })
        }
        jWt.verify(token, process.env.SECRET_KEY, async (err, decode) => {
            if (err) {
                return res.status(401).json({
                    message: "Invalid Token"
                })
            }
            // console.log(decode)
            const userFind = await UserSchema.findById({ _id: decode.user_id })
            console.log(userFind)
            if (!userFind) {
                return res.status(404).json({
                    message: "user not found"
                })
            }
            const newPassword = await bcrypt.hash(password, 12)
            await userFind.updateOne({
                password: newPassword
            })
            return res.status(200).json({
                message: "Password updated ",
                data: userFind
            })
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}