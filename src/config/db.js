const mongoose = require("mongoose");


// ==========================================
// mongodb cluster username

// username: gasolinerain66

// password: uUIleh8hYv1qPie0
// ==========================================

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://gasolinerain66:uUIleh8hYv1qPie0@cluster0.tirqilx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",

    // mongodb+srv://gasolinerain66:uUIleh8hYv1qPie0@cluster0.tirqilx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

    // mongodb+srv://new_user01:new_user01@cluster0.crqxctm.mongodb.net/next_strive
  {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
  });
    console.log("✅ MongoDB Connected...");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
