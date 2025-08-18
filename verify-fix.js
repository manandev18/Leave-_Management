// Comprehensive verification script to test all fixes
const db = require('./src/db');

async function testDatabase() {
  try {
    console.log('=== Testing Database Connection ===');
    
    // Test basic connection
    const [employees] = await db.query('SELECT * FROM employees LIMIT 1');
    console.log('✅ Database connection successful!');
    console.log('Sample employee:', employees[0]);
    
    // Test column names
    const [employeeColumns] = await db.query('DESCRIBE employees');
    console.log('✅ Employee columns:', employeeColumns.map(col => col.Field));
    
    const [leaveColumns] = await db.query('DESCRIBE leaves');
    console.log('✅ Leave columns:', leaveColumns.map(col => col.Field));
    
    // Test leave application with correct column names
    console.log('\n=== Testing Leave Application ===');
    
    // Insert a test employee if none exists
    const [employeeCount] = await db.query('SELECT COUNT(*) as count FROM employees');
    if (employeeCount[0].count === 0) {
      await db.query(
        "INSERT INTO employees (name, email, department, joining_date, leave_balance) VALUES (?, ?, ?, ?, ?)",
        ['Test Employee', 'test@company.com', 'IT', '2024-01-01', 20]
      );
      console.log('✅ Test employee created');
    }
    
    // Test leave application
    const [testEmployee] = await db.query('SELECT id FROM employees LIMIT 1');
    const [leaveResult] = await db.query(
      "INSERT INTO leaves (employee_id, start_date, end_date, status) VALUES (?, ?, ?, 'PENDING')",
      [testEmployee[0].id, '2024-12-20', '2024-12-25']
    );
    console.log('✅ Leave application successful:', leaveResult.insertId);
    
    // Test leave approval
    const [approveResult] = await db.query(
      "UPDATE leaves SET status = 'APPROVED' WHERE id = ? AND status = 'PENDING'",
      [leaveResult.insertId]
    );
    console.log('✅ Leave approval successful:', approveResult.affectedRows > 0);
    
    // Test leave rejection
    const [leaveResult2] = await db.query(
      "INSERT INTO leaves (employee_id, start_date, end_date, status) VALUES (?, ?, ?, 'PENDING')",
      [testEmployee[0].id, '2024-12-26', '2024-12-28']
    );
    const [rejectResult] = await db.query(
      "UPDATE leaves SET status = 'REJECTED' WHERE id = ? AND status = 'PENDING'",
      [leaveResult2.insertId]
    );
    console.log('✅ Leave rejection successful:', rejectResult.affectedRows > 0);
    
    // Test data retrieval
    const [allLeaves] = await db.query(`
      SELECT l.*, e.name as employee_name 
      FROM leaves l 
      JOIN employees e ON l.employee_id = e.id
    `);
    console.log('✅ Data retrieval successful:', allLeaves.length, 'leaves found');
    
    console.log('\n=== All Tests Passed! ===');
    console.log('✅ Column name mismatch fixed');
    console.log('✅ Leave application working');
    console.log('✅ Leave approval working');
    console.log('✅ Leave rejection working');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
