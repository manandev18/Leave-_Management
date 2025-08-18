require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
const leaveRoutes = require("./routes/leaveroutes");
const employeeRoutes = require("./routes/employeeroutes");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Swagger config
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Leave Management API",
      version: "1.0.0",
      description: "API documentation for Leave Management system",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./src/routes/*.js"], // 👈 Fixed path to look for JSDoc comments in route files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
