/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - phone
 *               - name
 *               - region_id
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *                 example: +998901234567
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: password123
 *               region_id:
 *                 type: integer
 *                 description: User's region ID
 *                 example: 1
 *               role:
 *                 type: string
 *                 description: User's role
 *                 example: user
 *               image:
 *                 type: string
 *                 description: User's image
 *                 example: image
 *     responses:
 *       200:
 *         description: OTP sent to the user's email
 *       400:
 *         description: Validation error or SMS sending error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify a user's account using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: johndoe@gmail.com
 *               otp:
 *                 type: string
 *                 description: One-time password sent to the user's email
 *                 example: 12345
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: User not found
 *       401:
 *         description: Incorrect password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/access-token:
 *   post:
 *     summary: Generate a new access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get authenticated user information
 *     description: Retrieve the details of the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *       401:
 *         description: Unauthorized (Invalid or missing token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
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
    { expiresIn: "40m" }
  );
  return token;
}

function genRefreshToken(user) {
  const token = jwt.sign({ id: user.id }, "apex2", { expiresIn: "14d" });
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

    logger.log("info", `New user registered - ${email}`);
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

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
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
