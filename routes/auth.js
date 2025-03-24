const userValidator = require("../validators/user.validator");
const { totp } = require("otplib");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const logger = require("../logger");
const sendEmail = require("../config/sendEmail");
const { authMiddleware } = require("../middlewares/auth-role.middlewars");
const sendSMS = require("../config/eskiz");

const router = require("express").Router();

function genToken(user) {
  const token = jwt.sign(
    { id: user.id, role: user.role, status: user.status },
    "apex1",
    { expiresIn: "15m" }
  );
  return token;
}

function genRefreshToken(user) {
  const token = jwt.sign({ id: user.id }, "apex2", { expiresIn: "7d" });
  return token;
}

router.post("/register", async (req, res) => {
  try {
    const { error } = userValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const { email, password, phone, name, ...rest } = req.body;
    const otp = totp.generate(email + "apex");
    const hash = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      email,
      password: hash,
      status: "pending",
      phone: phone,
      name,
      ...rest,
    });
    console.log(otp);
    // const err = await sendSMS(phone, otp);
    // if (err) return res.status(400).send({ message: "Error to send SMS code" });
    sendEmail(email, name, otp);

    logger.log("info", `New user registered - ${newUser}`);
    res.send({ message: "Otp sended to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const match = totp.verify({ token: otp, secret: email + "apex" });
    if (!match) {
      return res.status(400).send({ message: "Code is not valid or expired" });
    }
    await user.update({
      status: "active",
    });
    logger.log("info", `User verified - ${user}`);
    res.send({ message: "Verified" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).send({ message: "Password is incorrect" });
    }
    if (user.status == "pending") {
      return res.send({
        message: "Your account is not verified please verify",
      });
    }
    const access_token = genToken(user);
    const refresh_token = genRefreshToken(user.email);
    logger.log("info", `User logged in - ${user}`);
    res.send({ refresh_token, access_token });
  } catch (error) {
    console.log(error);
  }
});

router.post("/access-token", async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const user = jwt.verify(refresh_token, "apex2");

    if (!user)
      return res.status(401).send({ message: "Invalid refresh token" });

    logger.log("info", `User got new access_token - ${user.email}`);
    const access_token = genToken(user);
    res.send({ access_token });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    logger.error("Error retrieving user information:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
