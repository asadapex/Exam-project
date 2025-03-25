const express = require("express");
const { connectDb } = require("./config/db");
const authRoutes = require("./routes/auth");
const regionRoutes = require("./routes/region");
const userRoutes = require("./routes/users");
const sessionRoutes = require("./routes/sessions");
const registrationRoutes = require("./routes/courseRegistration");
const uploadRoutes = require("./routes/upload");
const categoryRoutes = require("./routes/category");
const cors = require("cors");
const setupSwagger = require("./swagger");
const app = express();
connectDb();

app.use(express.json());
app.use(cors());

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use("/auth", authRoutes);
app.use("/region", regionRoutes);
app.use("/users", userRoutes);
app.use("/registration", registrationRoutes);
app.use("/upload", uploadRoutes);
app.use("/categories", categoryRoutes);
app.use(sessionRoutes);
setupSwagger(app);

app.listen(4000, () => console.log("server is running on 4000"));
