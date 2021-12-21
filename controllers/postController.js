const User = require("../models/userModel");
const Post = require("../models/postModel");

module.exports.getAllPosts = async (req,res) => {
    try{
        const user = await User.findById(req.userId);
        const posts = await Post.find({
            "user": {$in : user.followings}
        }).select("content likes comments createdAt").populate("user", "username");
        const userPosts = await Post.find({user: req.userId}).select("content likes comments createdAt").populate("user", "username");
        posts.push(...userPosts);
        posts.sort((a, b) => b.createdAt - a.createdAt);
        res.status(200).json({
            status: 'success',
            data: {
                posts,
            }
        });
    } catch(err){
        res.status(400).json({
            status: 'fail',
            error : err.message
        });
    }
}

module.exports.newPost = async (req,res) => {
    try{
        const { content } = req.body;
        const post = await Post.create({
            user: req.userId,
            content
        })
        await User.findByIdAndUpdate(req.userId, {
            $push: {"posts" : post._id}
        });
        res.status(201).json({
            status: 'success',
            data : {
                post,
            }
        });
    } catch(err){
        res.status(400).json({
            status: 'fail',
            error : err.message
        });
    }
}

module.exports.getPostById = async (req,res) => {
    try{
        const postId = req.params.id;

        const post = await Post.findById(postId).populate("user", "username");

        if(!post){
            return res.status(400).json({
                status: 'fail',
                error: `Invalid post id. Post doesn't exist/ has been deleted`
            });
        }

        return res.status(200).json({
            status: 'success',
            data : {
                post
            }
        });
    } catch(err){
        return res.status(400).json({
            status: 'fail',
            error: err.message
        });
    }
}

module.exports.updatePost = async (req,res) => {
    try{
        const userId = req.userId;
        const postId = req.params.id;
        const { content } = req.body;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(400).json({
                status: 'fail',
                error: `Invalid post id. Post doesn't exist/ has been deleted`,
            });
        } 

        if(userId !== post.user.toString()){
            return res.status(400).json({
                status: 'fail',
                error: 'Unable to update the post as you are not the author',
            });
        }

        const updatedPost = await Post.findByIdAndUpdate(postId,{ 
            content
        }, {new : true});

        return res.status(200).json({
            status: 'success',
            data : {
                post: updatedPost,
            }
        })
    } catch(err){
        return res.status(400).json({
            status: 'fail',
            error: err.message
        });
    }
}

module.exports.deletePost = async (req,res) => {
    try{
        const postId = req.params.id;
        const userId = req.userId;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(400).json({
                status: 'fail',
                error: `Invalid post id. Post doesn't exist/ has been deleted`
            });
        } 

        if(userId !== post.user.toString()){
            return res.status(400).json({
                status: 'fail',
                error: `Unable to delete the post as you are not the author`
            });
        }

        const deletedPost = await Post.findByIdAndDelete(postId);
        await User.findByIdAndUpdate(userId,{
            $pull: {"posts": postId}
        })
        return res.status(200).json({
            status: 'success',
            data:{
                post: deletedPost
            }
        })
    } catch(err){
        return res.status(400).json({
            status: 'fail',
            error: err.message
        });
    }
}


