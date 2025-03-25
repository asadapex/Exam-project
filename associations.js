const courseRegistration = require("./models/courseRegistration");
const Fields = require("./models/fields");
const Region = require("./models/region");
const User = require("./models/user");
const Resource = require("./models/resources");
const Category = require("./models/category");
const Branch = require("./models/branch");

User.hasMany(courseRegistration, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
courseRegistration.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Region.hasMany(User, {
  foreignKey: "region_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.belongsTo(Region, {
  foreignKey: "region_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Resource.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasMany(Resource, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Resource.belongsTo(Category, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Category.hasMany(Resource, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Branch.belongsTo(courseRegistration, {
  foreignKey: "branch_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
courseRegistration.hasMany(Branch, {
  foreignKey: "branch_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Branch.belongsTo(Region, {
  foreignKey: "region_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Region.hasMany(Branch, {
  foreignKey: "region_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = {
  courseRegistration,
  Fields,
  Region,
  User,
  Category,
  Resource,
  Branch,
};
