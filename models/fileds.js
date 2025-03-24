const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const Fileds = db.define("Fields", {
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
});

module.exports = Fileds;
