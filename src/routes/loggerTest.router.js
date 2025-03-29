import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

router.get('/loggerTest', (req, res) => {
  logger.debug('Mensaje de nivel DEBUG');
  logger.http('Mensaje de nivel HTTP');
  logger.info('Mensaje de nivel INFO');
  logger.warning('Mensaje de nivel WARNING');
  logger.error('Mensaje de nivel ERROR');
  logger.fatal('Mensaje de nivel FATAL');

  res.send({ message: "Prueba de logger completada. Revisa la consola y el archivo 'errors.log' para verificar los registros." });
});

export default router;