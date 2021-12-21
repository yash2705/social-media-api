const mongoose = require("mongoose");
const validtor = require("validator");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    username : {
        type : String,
        required : [true, 'Username cannot be empty.'],
        unique: true,
        lowercase: true
    },
    email : {
        type : String,
        required : [true, 'Email cannot be empty.'],
        validate : [validtor.isEmail, 'Please enter a valid email.'],
        unique: true   
    },
    password : {
        type : String,
        required : [true, 'Password cannot be empty.'],
        minlength : [8, 'Password must be atleast 8 characters long.'],
    },
    posts : [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Post"
    }],
    followers : [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
    }],
    followings : [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
    }]
},{
    toJSON: {virtuals : true},
    toObject: {virtuals : true},
    id: false
},{
    timestamps: true
});


userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
}) 

userSchema.methods.verifyPassword = async function(password){
    return await bcrypt.compare(password,this.password)
}
const User = mongoose.model('User', userSchema);

module.exports = User;
