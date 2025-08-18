const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Leave Management API",
      version: "1.0.0",
      description:
        "API documentation for Leave Management System built in Node.js + MySQL",
    },
    servers: [
      {
        url: "http://localhost:5000", // change if deployed
      },
    ],
  },
  apis: ["./routes/*.js"], // 👈 where your routes are documented
};

const swaggerSpec = swaggerJsDoc(options);

function swaggerDocs(app, port) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📑 Swagger Docs available at http://localhost:${port}/api-docs`);
}

module.exports = swaggerDocs;
