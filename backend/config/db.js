const mongoose = require("mongoose");

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("MongoDb Connected Successfully");
    } catch (error) {
        console.error("CRITICAL: Failed to connect to MongoDB. Check your MONGO_URI environment variable.");
        console.error("Error details:", error.message);
        process.exit(1);
    }
}
module.exports = connectDB