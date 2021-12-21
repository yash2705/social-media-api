const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

module.exports.getUser = async (req,res) => {
    try {
        const username   = req.params.username.toLowerCase(); 
        const user = await User.findOne({username}).select("username posts followers followings email").populate("posts",{"content":1, "likes":1, "comments": 1})
        if(!user){
            return res.status(400).json({
                    status: 'fail',
                    error : 'Invalid username'
                });
        }
        const followed = user.followers.includes(req.userId);
        const isYou = (user._id.toString() === req.userId);
        return res.status(200).json({
            status: 'success',
            data : {
                user,
                followed,
                isYou
            }
        })

    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            error : err.message
        })
    }
}
module.exports.updateUser = async (req,res) => {
    try{
    const username = req.params.username.toLowerCase();
    const {newUsername, newEmail, newPassword, oldPassword} = req.body;
    const user = await User.findOne({username})
    if(!user){
        return res.status(400).json({
            status: 'fail',
            error: 'Invalid username'
        })
    }

    if(user._id.toString() !== req.userId){
        return res.status(400).json({
            status: 'fail',
            error: 'You can only edit your account'
        })
    }

    if(!newPassword){
        user.email = newEmail ? newEmail : user.email;
        user.username = newUsername ? newUsername : user.username;
        await user.save();
        return res.status(200).json({
            status: 'success',
            user
        })
    }

    if(newPassword && !oldPassword){
        return res.status(400).json({
            status: 'fail',
            error: 'Enter old password too'
        })
    }

    if(newPassword && oldPassword && newPassword === oldPassword){
        return res.status(400).json({
            status: 'fail',
            error: 'New password cannot be the same as old password'
        });
    }

    const match = await user.verifyPassword(oldPassword);
    if(!match){
        return res.status(400).json({
            status: 'fail',
            error: 'Incorrect old password'
        });        
    }
    
    user.password = newPassword;
    await user.save();
    user.password  = undefined;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '90d' });
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
            error: err.message
        })
    }
}

module.exports.followUser = async (req,res) => {
    try{
        const username = req.params.username.toLowerCase();
        const user = await User.findOne({username});

        if(!user){
            return res.status(400).json({
                status: 'fail',
                error: 'Invalid username'
            })
        }

        if(user._id.toString() === req.userId){
            return res.status(400).json({
                status: 'fail',
                error: 'Cant follow yourself'
            })
        }

        if(user.followers.includes(req.userId)){
            return res.status(400).json({
                status: 'fail',
                error: 'You already follow the user'
            })
        }

        await User.findByIdAndUpdate(req.userId,{
            $push: {"followings" : user._id}
        })
        await User.findByIdAndUpdate(user._id,{
            $push: {"followers" : req.userId}
        })
        return res.status(200).json({
            status: 'success',
        })
    } catch(err){
        return res.status(400).json({
            status: 'fail',
            error: err.message
        })
    }

}

module.exports.unfollowUser = async (req,res) => {
    try{
        const username = req.params.username.toLowerCase();
        const user = await User.findOne({username});

        if(!user){
            return res.status(400).json({
                status: 'fail',
                error: 'Invalid username'
            })
        }

        if(user._id.toString() === req.userId){
            return res.status(400).json({
                status: 'fail',
                error: 'Cant unfollow yourself'
            })
        }
        if(!user.followers.includes(req.userId)){
            return res.status(400).json({
                status: 'fail',
                error: 'Follow the user before unfollowing'
            })
        }

        await User.findByIdAndUpdate(user._id,{
            $pull: {"followers" : req.userId}
        })
        await User.findByIdAndUpdate(req.userId,{
            $pull: {"followings" : user._id}
        })
        return res.status(200).json({
            status: 'success',
        })
        

    } catch(err){
        return res.status(400).json({
            status: 'fail',
            error: err.message
        })
    }

}
