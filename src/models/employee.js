const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Employee = sequelize.define("Employee", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  department: DataTypes.STRING,
  joining_date: DataTypes.DATE,
  leave_balance: { type: DataTypes.INTEGER, defaultValue: 20 },
});

module.exports = Employee;
