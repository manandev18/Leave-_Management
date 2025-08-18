const db = require("../db");

exports.addEmployee = (req, res) => {
  const { name, email, department, joining_date } = req.body;
  db.query(
    "INSERT INTO employees (name, email, department, joining_date) VALUES (?, ?, ?, ?)",
    [name, email, department, joining_date],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Employee added successfully", id: result.insertId });
    }
  );
};

exports.getLeaveBalance = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT leave_balance FROM employees WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(404).json({ error: "Employee not found" });
      res.json({ leave_balance: results[0].leave_balance });
    }
  );
};
