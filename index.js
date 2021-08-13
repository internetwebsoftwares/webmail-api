require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const userRouter = require("./Routes/userRouter");
const emailRouter = require("./Routes/emailRouter");

mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(userRouter);
app.use(emailRouter);

app.listen(PORT, console.log("App started"));
