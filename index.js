const express = require("express");
const { connectDb } = require(".config/db");
const app = express();
connectDb();

app.listen(4000, () => console.log("server is running on 4000"));


