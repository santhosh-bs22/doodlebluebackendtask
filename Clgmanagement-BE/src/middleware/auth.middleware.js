const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;
    const [Schema, token] = authorization ? authorization.split(" ") : [];
    if (Schema !== 'Bearer' || !token) {
        return res.status(401).json({ message: "Authorization token is required" });
    }
    const secretKey = process.env.JWT_SECRET;


    if (!secretKey) {
        return next(new Error("JWT_SECTECT is not defined"))
    }
    try {
        req.user = jwt.verify(token, secretKey);
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Your Token are Expiry or Invalid" });

    }
}
module.exports = authMiddleware