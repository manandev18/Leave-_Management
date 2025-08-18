const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Employee = require("./employee");

const Leave = sequelize.define("Leave", {
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING",
  },
});

Employee.hasMany(Leave, { foreignKey: "employee_id" });
Leave.belongsTo(Employee, { foreignKey: "employee_id" });

module.exports = Leave;
