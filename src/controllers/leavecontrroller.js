
const db = require("../db");

exports.applyLeave = (req, res) => {
  const { employee_id, start_date, end_date } = req.body;

  // 1. Validate employee exists
  db.query(
    "SELECT * FROM employees WHERE id = ?",
    [employee_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(404).json({ error: "Employee not found" });

      const employee = results[0];

      // 2. Check invalid dates
      if (new Date(start_date) > new Date(end_date)) {
        return res
          .status(400)
          .json({ error: "End date cannot be before start date" });
      }

      // 3. Check joining date
      if (new Date(start_date) < new Date(employee.joining_date)) {
        return res
          .status(400)
          .json({ error: "Cannot apply leave before joining date" });
      }

      // 4. Calculate days requested
      const daysRequested =
        Math.ceil(
          (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)
        ) + 1;
      if (daysRequested > employee.leave_balance) {
        return res.status(400).json({ error: "Not enough leave balance" });
      }

      // 5. Insert leave request
      db.query(
        "INSERT INTO leaves (employee_id, start_date, end_date) VALUES (?, ?, ?)",
        [employee_id, start_date, end_date],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res
            .status(201)
            .json({ message: "Leave request submitted", id: result.insertId });
        }
      );
    }
  );
};

exports.approveLeave = (req, res) => {
  const { id } = req.params; // leave id
  db.query("SELECT * FROM leaves WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ error: "Leave not found" });

    const leave = results[0];
    const daysRequested =
      Math.ceil(
        (new Date(leave.end_date) - new Date(leave.start_date)) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    // Deduct balance and update leave status
    db.query(
      "UPDATE employees SET leave_balance = leave_balance - ? WHERE id = ?",
      [daysRequested, leave.employee_id]
    );
    db.query("UPDATE leaves SET status = 'APPROVED' WHERE id = ?", [id]);

    res.json({ message: "Leave approved" });
  });
};

exports.rejectLeave = (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE leaves SET status = 'REJECTED' WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Leave rejected" });
    }
  );
};
