import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import { configureSwagger } from './config/swagger.config.js'; 
import { swaggerSpecs } from './config/swagger.config.js';

dotenv.config();

import petsRouter from './routes/pets.router.js';
import usersRouter from './routes/users.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import loggerTestRouter from './routes/loggerTest.router.js'; 
import mocksRouter from './routes/mocks.router.js';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = process.env.PORT || 8080;
configureSwagger(app);
mongoose.connect(process.env.MONGO_URL);

app.use(express.json());
app.use(cookieParser());

app.use('/api/mocks', mocksRouter);
app.use('/api/pets', petsRouter);
app.use('/api/users', usersRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/', loggerTestRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

logger.info(`Escuchando en el puerto ${PORT}`);

app.listen(PORT, () => logger.info(`Servidor activo en el puerto ${PORT}`));

export default app;