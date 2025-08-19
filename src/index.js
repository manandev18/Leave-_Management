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

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'https://leave-management-z7c2.onrender.com', // Your deployed backend
      'https://your-frontend-domain.com', // Your frontend URL
      process.env.FRONTEND_URL, // Additional frontend URL from env
      process.env.DEPLOYMENT_URL  // Additional deployment URL from env
    ].filter(Boolean); // Remove undefined/null values
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

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
        url: 'https://leave-management-z7c2.onrender.com',
        description: 'Production server (Render)'
      },
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
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
