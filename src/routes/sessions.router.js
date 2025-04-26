import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegisterInput:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - password
 *       properties:
 *         first_name:
 *           type: string
 *           description: Nombre del usuario
 *         last_name:
 *           type: string
 *           description: Apellido del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico único del usuario
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario (se almacenará hasheada)
 *       example:
 *         first_name: Juan
 *         last_name: Perez
 *         email: juan.perez@example.com
 *         password: password123
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *       example:
 *         email: juan.perez@example.com
 *         password: password123
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID del usuario
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           description: Rol del usuario (e.g., 'user', 'admin')
 *       example:
 *         _id: 60d0fe4f5311236168a109cb
 *         first_name: Juan
 *         last_name: Perez
 *         email: juan.perez@example.com
 *         role: user
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * tags:
 *   name: Sessions
 *   description: Gestión de sesiones y autenticación de usuarios
 */

/**
 * @swagger
 * /api/sessions/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterInput'
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: string
 *                   description: ID del usuario creado
 *                   example: 60d0fe4f5311236168a109cb
 *       400:
 *         description: Datos incompletos, email inválido o usuario ya existente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', sessionsController.register);

/**
 * @swagger
 * /api/sessions/login:
 *   post:
 *     summary: Iniciar sesión de un usuario
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Usuario logueado correctamente (puede establecer cookie o devolver token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logged in
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: Credenciales inválidas (email o contraseña incorrectos)
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', sessionsController.login);

/**
 * @swagger
 * /api/sessions/current:
 *   get:
 *     summary: Obtener información del usuario actualmente logueado
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: No autorizado (sin sesión válida)
 *       500:
 *         description: Error interno del servidor
 */
router.get('/current', sessionsController.current);

/**
 * @swagger
 * /api/sessions/unprotectedLogin:
 *   get:
 *     summary: (Ejemplo) Iniciar sesión sin protección (NO USAR EN PRODUCCIÓN)
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Sesión iniciada (inseguro)
 */
router.get('/unprotectedLogin', sessionsController.unprotectedLogin);

/**
 * @swagger
 * /api/sessions/unprotectedCurrent:
 *   get:
 *     summary: (Ejemplo) Obtener usuario actual sin protección (NO USAR EN PRODUCCIÓN)
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Datos del usuario (inseguro)
 */
router.get('/unprotectedCurrent', sessionsController.unprotectedCurrent);

export default router;
