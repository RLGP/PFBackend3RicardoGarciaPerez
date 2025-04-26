import swaggerUiExpress from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentación API Backend3 - Ricardo García",
      description: "API para gestión de sesiones, mascotas y adopciones",
    },
  },
  apis: ["./src/routes/*.js"], 
};

export const swaggerSpecs = swaggerJSDoc(swaggerOptions); // 👈 Esto ya lo tienes bien

export const configureSwagger = (app) => {
  app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpecs)); // 👈 Aquí pon swaggerSpecs (con s)
};