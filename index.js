const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db.js");

const userRoutes = require("./src/routes/userRoutes.js");
const everythingReferral = require("./src/routes/everythingReferral");
const forgotPassword = require("./src/routes/forgotPassword");


// admin
const everythingInvestment = require("./src/routes/su/everythingInvestment.js");
const userInvestment = require("./src/routes/userInvestments.js");
const adminRegister = require("./src/routes/su/auth.js")
const profileAuth = require("./src/routes/su/profileAuth.js")
const everythingList = require("./src/routes/su/everythingList.js")

dotenv.config();
connectDB();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    
    "https://abcdhomepage.pages.dev/",
    "https://efghdashboard.pages.dev/",
    // "https://nextstrive-admin.pages.dev",
    // "https://symphonious-licorice-adfc01.netlify.app",
    // "https://dash-nextstrive.vercel.app",
    // "https://nextstrive.online",
    // "http://localhost:3000",
    // "http://localhost:3001",
    // "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
};

// kdkfkfkffkfk

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(cors());
app.use(cors(corsOptions));
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  try {
    res.send("wealthpital");
  } catch (error) {
    res.send(error);
  }
});
app.use("/api/users", userRoutes, everythingReferral, forgotPassword);
app.use("/api/transaction", userInvestment);

// SU routes
app.use("/su/api/perform", everythingInvestment);
app.use("/account/auth", adminRegister, profileAuth);
app.use("/account/su/list", everythingList);



// Start Server
const PORT = process.env.PORT || 5012;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// plans
// min 1500 - 5000
// min 5000 - 10000
// min 10000 - 25000
// min 50000 - unlimited
//
