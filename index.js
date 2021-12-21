const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const isAuthenticated = require("./middlewares/auth");

dotenv.config();
const app = express();

mongoose.connect("mongodb://localhost:27017/SocialMedia");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json());
app.use(cookieParser());

app.use('/auth', require("./routes/authRouter"));
app.use('/users', isAuthenticated ,require("./routes/userRouter"));
app.use('/posts', isAuthenticated ,require("./routes/postRouter"));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})