const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const postSchema = mongoose.Schema({
    user : {
        type: ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: [true, 'Post cannot be empty']
    },
    likes : [{
        type: ObjectId,
        ref: "User"
    }],
    comments : [{
        type: ObjectId,
        ref: "User"
    }]
},{
    timestamps: true
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

