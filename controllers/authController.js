const User  = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.register = async (req,res) => {
    try{
        const {email, username, password, confirmPassword} = req.body;

        if(password !== confirmPassword){
            return res.status(400).json({
                status: 'fail',
                error : 'Passwords do not match'
            });
        }
        
        const newUser = await User.create({
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            password
        });

        newUser.password  = undefined;

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '90d' });
        const cookieOptions  = {
            httpOnly: true,
            expiresIn: Date.now() + 90 * 24 * 60 * 60 * 1000
        }
        if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

        res.cookie("token",token,cookieOptions);
        return res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        })
    } catch(err){
        return res.status(400).json({
            status: 'fail',
            error : err.message
        });
    }
}

module.exports.login = async (req,res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            res.status(400).json({
                status: 'fail',
                message : 'Email or Password missing'
            });
        } 
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                status: 'fail',
                error : 'User does not exist. Please register for a new account'
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return res.status(401).json({
                status: 'fail',
                message : 'Wrong password'
            });
        }
        user.password = undefined;
        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET, { expiresIn : '90d'});
        const cookieOptions  = {
            httpOnly: true,
            expiresIn: Date.now() + 90 * 24 * 60 * 60 * 1000
        }
        
        if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

        res.cookie("token",token,cookieOptions);
        return res.status(201).json({
            status: 'success',
            data: {
                user
            }
        })

    } catch(err){
        return res.status(400).json({
            status: 'fail',
            error : err.message
        });
    }
}

module.exports.logout = async (req,res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            status: 'success'
        })
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            error: err.message
        })
    }
}
