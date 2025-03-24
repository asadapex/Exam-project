const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Token not provided" });
    }

    const user = jwt.verify(token, "apex1");

    if (user.status !== "active") {
      return res.status(401).send({
        message: "You did not verify your account. Please verify it.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({ message: "Token expired" });
    }
    return res.status(401).send({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;

function roleMiddleware(roles) {
  return (req, res, next) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token)
        return res.status(401).send({ message: "Token not provided" });

      const user = jwt.verify(token, "apex1");
      if (!user) return res.status(401).send({ message: "Invalid token" });
      req.user = user;

      if (roles.includes(user.role)) {
        next();
      } else {
        res.status(400).send({ message: "Not allowed" });
      }
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = { authMiddleware, roleMiddleware };
