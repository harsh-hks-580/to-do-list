const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

//Middleware for authentication
const authenticateToken = (req, res, next) => {
  const excludedRoutes = ["/login", "/register"];

  // Check if the request path is in the excluded routes
  if (excludedRoutes.includes(req.path)) {
    return next(); // Skip authentication for excluded routes
  }

  const { token } = req.cookies;

  jwt.verify(token, jwtSecret, {}, async (err, info) => {
    if (err) return res.sendStatus(403); // Forbidden if token is invalid
    req.userInfo = info;
    next();
  });
};

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(authenticateToken);

const tasksRoute = require("./routes/TasksRoute");
const tagsRoute = require("./routes/TagsRoute");
const adminRoute = require("./routes/AdminRoute");

app.use("/", adminRoute);
app.use("/tasks", tasksRoute);
app.use("/tags", tagsRoute);

const port = process.env.PORT;

app.listen(port, () => console.log(`Server is running on port ${port}`));
