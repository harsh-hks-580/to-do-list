const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(cors());

const tasksRoute = require("./routes/TasksRoute");
const tagsRoute = require("./routes/TagsRoute");

app.use("/", tasksRoute);
app.use("/", tagsRoute);

const port = process.env.PORT;

app.listen(port, () => console.log(`Server is running on port ${port}`));
