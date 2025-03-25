const express = require("express");
const { connectDb } = require("./config/db");
const authRoutes = require("./routes/auth");
const regionRoutes = require("./routes/region");
const userRoutes = require("./routes/users");
const sessionRoutes = require("./routes/sessions");
const registrationRoutes = require("./routes/courseRegistration");
const filedRoutes = require("./routes/fileds")
const setupSwagger = require("./swagger");
const app = express();
connectDb();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/region", regionRoutes);
app.use("/users", userRoutes);
app.use("/registration", registrationRoutes);
app.use("/fields", filedRoutes)
app.use(sessionRoutes);
setupSwagger(app);

app.listen(4000, () => console.log("server is running on 4000"));
