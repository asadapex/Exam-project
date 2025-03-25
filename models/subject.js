const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const Subjet = db.define("Subject", {
<<<<<<< HEAD
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
=======
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
>>>>>>> 2d82044354062f0b8e23eb32a017a89d19267f43
});

module.exports = Subjet;
