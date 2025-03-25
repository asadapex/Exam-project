const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Branch = sequelize.define('Branch', {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    image: {
        type: DataTypes.STRING,
        allowNull: false
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    region_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    field_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    edu_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }},
     {
    timestamps: false
});

module.exports = Branch;
