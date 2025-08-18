const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         department:
 *           type: string
 *         joining_date:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM employees");
  res.json(rows);
});

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Employee data
 */
router.get("/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM employees WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
});

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Add new employee
 *     tags: [Employee]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Employee created
 */
router.post("/", async (req, res) => {
  const { name, email, department, joining_date } = req.body;
  await db.query("INSERT INTO employees (name, email, department, joining_date) VALUES (?, ?, ?, ?)", 
    [name, email, department, joining_date]);
  res.status(201).json({ message: "Employee added" });
});

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update employee
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: Employee updated
 */
router.put("/:id", async (req, res) => {
  const { name, email, department, joining_date } = req.body;
  await db.query(
    "UPDATE employees SET name = ?, email = ?, department = ?, joining_date = ? WHERE id = ?",
    [name, email, department, joining_date, req.params.id]
  );
  res.json({ message: "Employee updated" });
});

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete employee
 *     tags: [Employee]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee deleted
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Cannot delete employee with active dependencies
 */
router.delete("/:id", async (req, res) => {
  const employeeId = req.params.id;
  
  try {
    // Start transaction to ensure atomicity
    await db.query("START TRANSACTION");
    
    // Check if employee exists
    const [employeeRows] = await db.query("SELECT id FROM employees WHERE id = ?", [employeeId]);
    if (employeeRows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Delete related leave records first (due to foreign key constraint)
    await db.query("DELETE FROM leaves WHERE employee_id = ?", [employeeId]);
    
    // Now delete the employee
    await db.query("DELETE FROM employees WHERE id = ?", [employeeId]);
    
    // Commit transaction
    await db.query("COMMIT");
    
    res.json({ message: "Employee and related records deleted successfully" });
    
  } catch (error) {
    // Rollback transaction on error
    await db.query("ROLLBACK");
    console.error("Error deleting employee:", error);
    res.status(500).json({ 
      message: "Error deleting employee", 
      error: error.message 
    });
  }
});

module.exports = router;
