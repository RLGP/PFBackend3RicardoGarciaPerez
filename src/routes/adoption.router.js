import { Router } from 'express';
import adoptionsController from '../controllers/adoptions.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Adoption:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado por MongoDB
 *         owner:
 *           type: string
 *           description: ID del usuario que adopta
 *         pet:
 *           type: string
 *           description: ID de la mascota adoptada
 *         date:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la adopción
 *       example:
 *         _id: 61e0b4d5d1f7a7f7e8a1b2c3
 *         owner: 60d0fe4f5311236168a109cb
 *         pet: 60d0fe4f5311236168a109ca
 *         date: 2023-10-27T10:30:00.000Z
 *
 * tags:
 *   name: Adoptions
 *   description: Gestión de adopciones
 */

/**
 * @swagger
 * /api/adoptions:
 *   get:
 *     summary: Obtener todas las adopciones
 *     tags: [Adoptions]
 *     responses:
 *       200:
 *         description: Lista de adopciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Adoption'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', adoptionsController.getAllAdoptions);

/**
 * @swagger
 * /api/adoptions/{aid}:
 *   get:
 *     summary: Obtener una adopción específica por ID
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: aid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la adopción a obtener
 *     responses:
 *       200:
 *         description: Detalles de la adopción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/Adoption'
 *       400:
 *         description: ID con formato incorrecto
 *       404:
 *         description: Adopción no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:aid', adoptionsController.getAdoption);

/**
 * @swagger
 * /api/adoptions/{uid}/{pid}:
 *   post:
 *     summary: Crear una nueva adopción (asociar usuario y mascota)
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario que adopta
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota a adoptar
 *     responses:
 *       200:
 *         description: Adopción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/Adoption'
 *       400:
 *         description: IDs con formato incorrecto o mascota ya adoptada
 *       404:
 *         description: Usuario o mascota no encontrados
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:uid/:pid', adoptionsController.createAdoption);

export default router;