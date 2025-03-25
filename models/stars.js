
const stars = db.define("stars", {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    }},

  educationCenterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {

      model: EducationCenter,
      key: "id",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    }}},{ 
    timestamps: false });

module.exports = stars;