const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Get all leave requests
 *     tags: [Leave]
 *     responses:
 *       200:
 *         description: List of leave requests
 */
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        l.id,
        l.employee_id,
        e.name as employee_name,
        e.email as employee_email,
        l.start_date,
        l.end_date,
        l.status,
        DATEDIFF(l.end_date, l.start_date) + 1 as days_requested
      FROM leaves l
      LEFT JOIN employees e ON l.employee_id = e.id
      ORDER BY l.id DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leave]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id: { type: integer }
 *               start_date: { type: string, format: date }
 *               end_date: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Leave request created
 */
/**
 * @swagger
 * /api/leaves/{id}/approve:
 *   put:
 *     summary: Approve a leave request
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave ID
 *     responses:
 *       200:
 *         description: Leave approved successfully
 *       400:
 *         description: Leave not found or already processed
 *       500:
 *         description: Server error
 *
 * /api/leaves/{id}/reject:
 *   put:
 *     summary: Reject a leave request
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave ID
 *     responses:
 *       200:
 *         description: Leave rejected successfully
 *       400:
 *         description: Leave not found or already processed
 *       500:
 *         description: Server error
 */

router.post("/", async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.body;

    // 1️⃣ Fetch employee joining date and leave quota
    const [employee] = await db.query(
      "SELECT joining_date, leave_balance FROM employees WHERE id = ?",
      [employee_id]
    );

    if (employee.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const joiningDate = new Date(employee[0].joining_date);
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // 2️⃣ Validation: start_date must be after joining_date
    if (startDate < joiningDate) {
      return res
        .status(400)
        .json({ error: "Leave start date cannot be before joining date" });
    }

    // 3️⃣ Validation: end_date must not be before start_date
    if (endDate < startDate) {
      return res
        .status(400)
        .json({ error: "End date cannot be before start date" });
    }

    // 4️⃣ Calculate number of days requested (inclusive of both start and end)
    const daysRequested =
      Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // 5️⃣ Fetch already approved leaves
    const [approvedLeaves] = await db.query(
      "SELECT SUM(DATEDIFF(end_date, start_date) + 1) AS used_leaves FROM leaves WHERE employee_id = ? AND status = 'APPROVED'",
      [employee_id]
    );

    const usedLeaves = approvedLeaves[0].used_leaves || 0;
    const remainingLeaves = employee[0].leave_balance - usedLeaves;

    // 6️⃣ Check if requested days exceed remaining leaves
    if (daysRequested > remainingLeaves) {
      return res.status(400).json({
        error: `Insufficient leave balance. You have only ${remainingLeaves} day(s) remaining.`,
      });
    }

    // 7️⃣ Insert leave request
    const [result] = await db.query(
      "INSERT INTO leaves (employee_id, start_date, end_date, status) VALUES (?, ?, ?, 'PENDING')",
      [employee_id, start_date, end_date]
    );

    res.status(201).json({ message: "Leave applied", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve leave
router.put("/:id/approve", async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Get leave details
    const [leaveRows] = await connection.query(
      "SELECT * FROM leaves WHERE id = ? AND status = 'PENDING'",
      [req.params.id]
    );

    if (leaveRows.length === 0) {
      return res
        .status(400)
        .json({ message: "Leave not found or already processed." });
    }

    const leave = leaveRows[0];

    // Calculate days requested
    const daysRequested =
      Math.ceil(
        (new Date(leave.end_date) - new Date(leave.start_date)) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    // Update leave status
    await connection.query(
      "UPDATE leaves SET status = 'APPROVED' WHERE id = ?",
      [req.params.id]
    );

    // Deduct leave balance
    await connection.query(
      "UPDATE employees SET leave_balance = leave_balance - ? WHERE id = ?",
      [daysRequested, leave.employee_id]
    );

    await connection.commit();
    res.json({ message: "Leave approved successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Reject leave
router.put("/:id/reject", async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE leaves SET status = 'REJECTED' WHERE id = ? AND status = 'PENDING'",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ message: "Leave not found or already processed." });
    }

    res.json({ message: "Leave rejected successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
