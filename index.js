const express = require("express");
const { connectDb } = require("./config/db");
const authRoutes = require("./routes/auth");
const regionRoutes = require("./routes/region")
const setupSwagger = require("./swagger");
const app = express();
connectDb();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/region", regionRoutes)

setupSwagger(app);

app.listen(4000, () => console.log("server is running on 4000"));


