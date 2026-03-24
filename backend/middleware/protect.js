const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  
    try {
      token = req.cookies?.token;

      if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
     
      if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
      req.user = user

      next();
    } catch (error) {
      console.log("Protect Error :", error.message);      
      return res.status(401).json({ message: "Not authorized" });
    }

};

module.exports = protect;