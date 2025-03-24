const express = require("express");
const { connectDb } = require("./config/db");
const authRoutes = require("./routes/auth");
const app = express();
connectDb();

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(4000, () => console.log("server is running on 4000"));


