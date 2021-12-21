const jwt = require("jsonwebtoken");

const isAuthenticated = async(req, res, next) => {
    try{
        const token = req.cookies.token;

        if(!token) {
            return res.status(401).json({
                status: 'fail',
                error: 'No token, authorization denied'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.id
        next();
    } catch(err){
        return res.status(400).json({
            status: 'fail',
            error: err.message
        });
    }

}

module.exports = isAuthenticated;