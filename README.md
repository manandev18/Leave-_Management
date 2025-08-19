# Leave Management System

A Node.js-based REST API for managing employee leave requests with MySQL database integration. This system provides comprehensive leave management functionality including employee management, leave applications, approvals, and balance tracking.

## Features

- **Employee Management**: Add, update, delete, and retrieve employee information
- **Leave Application**: Submit leave requests with validation
- **Leave Approval/Rejection**: Manage leave requests with status updates
- **Leave Balance Tracking**: Automatic balance calculation and deduction
- **API Documentation**: Interactive Swagger UI documentation
- **Data Validation**: Comprehensive validation for dates, balances, and business rules

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL with mysql2 driver
- **Documentation**: Swagger UI with swagger-jsdoc
- **Development**: Nodemon for auto-restart
- **Environment**: dotenv for configuration

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn package manager

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd leave_management
npm install
```

### 2. Database Setup

1. **Create MySQL Database**:
   ```sql
   CREATE DATABASE leave_management;
   ```

2. **Run Schema Script**:
   ```bash
   mysql -u your_username -p leave_management < schema.sql
   ```

   Or manually execute the SQL commands from `schema.sql`:
   ```sql
   USE leave_management;
   
   CREATE TABLE employees (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       department VARCHAR(100),
       joining_date DATE,
       leave_balance INT DEFAULT 20
   );
   
   CREATE TABLE leaves (
       id INT AUTO_INCREMENT PRIMARY KEY,
       employee_id INT,
       start_date DATE,
       end_date DATE,
       status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
       FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
   );
   ```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASS=your_mysql_password
DB_NAME=leave_management

# Server Configuration
PORT=5000
```

### 4. Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### 5. Access API Documentation

Visit `http://localhost:5000/api-docs` to access the interactive Swagger UI documentation.

## API Endpoints

### Employee Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/:id` | Get employee by ID |
| POST | `/api/employees` | Add new employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Leave Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaves` | Get all leave requests |
| POST | `/api/leaves` | Apply for leave |
| PUT | `/api/leaves/:id/approve` | Approve leave request |
| PUT | `/api/leaves/:id/reject` | Reject leave request |

## Assumptions

### Business Logic Assumptions

1. **Default Leave Balance**: Each employee gets 20 days of annual leave by default
2. **Leave Calculation**: Leave days are calculated inclusively (start and end dates both count)
3. **Working Days**: All days (including weekends) are counted as leave days
4. **Leave Year**: No annual leave year reset mechanism implemented
5. **Approval Process**: Single-level approval system (no hierarchical approvals)
6. **Leave Types**: System handles only one type of leave (no sick leave, vacation, etc. distinction)

### Technical Assumptions

1. **Database**: MySQL is the primary database system
2. **Authentication**: No authentication/authorization implemented (assumes trusted environment)
3. **Timezone**: All dates are handled in server timezone
4. **Concurrency**: Basic transaction handling for leave approval/rejection
5. **Data Integrity**: Foreign key constraints ensure referential integrity

## Edge Cases Handled

### Date Validation
- ✅ **Past Joining Date**: Cannot apply leave before employee joining date
- ✅ **Invalid Date Range**: End date cannot be before start date
- ✅ **Same Day Leave**: Single day leave applications supported

### Leave Balance Management
- ✅ **Insufficient Balance**: Prevents leave application if insufficient balance
- ✅ **Balance Calculation**: Accurate calculation including already approved leaves
- ✅ **Negative Balance Prevention**: System prevents negative leave balances

### Data Integrity
- ✅ **Employee Deletion**: Cascading delete removes associated leave records
- ✅ **Duplicate Processing**: Prevents multiple approvals/rejections of same leave
- ✅ **Transaction Safety**: Database transactions ensure data consistency

### Error Handling
- ✅ **Database Errors**: Proper error responses for database failures
- ✅ **Validation Errors**: Clear error messages for validation failures
- ✅ **Not Found Cases**: Appropriate 404 responses for missing resources

## Potential Improvements

### Security Enhancements
- [ ] **Authentication & Authorization**: Implement JWT-based authentication
- [ ] **Role-Based Access**: Different permissions for employees, managers, HR
- [ ] **Input Sanitization**: Enhanced SQL injection prevention
- [ ] **Rate Limiting**: API rate limiting to prevent abuse

### Feature Enhancements
- [ ] **Leave Types**: Support for different leave types (sick, vacation, personal)
- [ ] **Leave Policies**: Configurable leave policies per department/role
- [ ] **Approval Workflow**: Multi-level approval chains
- [ ] **Leave Calendar**: Calendar view for leave planning
- [ ] **Notifications**: Email/SMS notifications for leave status changes
- [ ] **Reporting**: Analytics and reporting dashboard
- [ ] **Leave Carry Forward**: Annual leave rollover functionality

### Technical Improvements
- [ ] **Database Migration System**: Structured database schema versioning
- [ ] **Caching**: Redis caching for frequently accessed data
- [ ] **Logging**: Comprehensive logging with Winston or similar
- [ ] **Testing**: Unit and integration test suite
- [ ] **API Versioning**: Version management for API endpoints
- [ ] **Docker Support**: Containerization for easy deployment
- [ ] **Environment Configs**: Multiple environment configurations

### Performance Optimizations
- [ ] **Database Indexing**: Optimize database queries with proper indexes
- [ ] **Pagination**: Implement pagination for large datasets
- [ ] **Connection Pooling**: Optimize database connection management
- [ ] **Query Optimization**: Optimize complex join queries

### User Experience
- [ ] **Frontend Application**: Web-based UI for easier interaction
- [ ] **Mobile App**: Mobile application for leave management
- [ ] **Bulk Operations**: Bulk leave applications and approvals
- [ ] **Search & Filters**: Advanced search and filtering capabilities

## Testing

### Manual Testing
Use the verification script to test database operations:

```bash
node verify-fix.js
```

### API Testing
Use the Swagger UI at `http://localhost:5000/api-docs` or tools like Postman to test API endpoints.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL server is running
   - Check database credentials in `.env` file
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process using the port

3. **Schema Errors**
   - Ensure schema.sql has been executed
   - Check table structure matches expected schema

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.