const courseRegistration = require("./models/courseRegistration");
const Fields = require("./models/fields");
const Region = require("./models/region");
const User = require("./models/user");

User.hasMany(courseRegistration, { foreignKey: "user_id" });
courseRegistration.belongsTo(User, { foreignKey: "user_id" });

Region.hasMany(User, { foreignKey: "region_id" });
User.belongsTo(Region, { foreignKey: "region_id" });



module.exports = { courseRegistration, Fields, Region, User };
