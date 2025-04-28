import { Router } from 'express';
import usersController from '../controllers/users.controller.js';
import { generateManyUsers } from '../mocks/users.mock.js';
import logger from '../utils/logger.js';
import uploader from '../utils/uploader.js';

const router = Router();

/**
 * @swagger
 * /api/users/mockingusers:
 *   get:
 *     summary: Generar usuarios de prueba (mocking)
 *     tags: [Users] 
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número de usuarios a generar (máximo 500).
 *     responses:
 *       200:
 *         description: Lista de usuarios generados
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
 *                     $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Parámetro 'count' inválido.
 *       500:
 *         description: Error generando usuarios con mocking
 */
router.get('/mockingusers', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 50;
        if (isNaN(count) || count <= 0 || count > 500) {
            logger.warning(`Intento de generar número inválido de usuarios mock: ${req.query.count}`);
            return res.status(400).send({ status: 'error', error: 'Parámetro "count" debe ser un número positivo (máximo 500).' });
        }
        const mockedUsers = await generateManyUsers(count);
        res.send({ status: 'success', payload: mockedUsers });
    } catch (error) {
        logger.error('Error generando usuarios con mocking:', error);
        res.status(500).send({ status: 'error', error: 'Error generando usuarios con mocking' });
    }
});

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios, carga de documentos y mocking
 *
 * components:
 *   schemas:
 *     UserInput:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
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
 *         role:
 *           type: string
 *           description: Rol del usuario (opcional, default 'user')
 *           enum: [user, admin, premium]
 *           default: user
 *       example:
 *         first_name: Maria
 *         last_name: Garcia
 *         email: maria.garcia@example.com
 *         role: user
 *
 *     UserUpdateInput:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [user, admin, premium]
 *       example:
 *         first_name: Maria Elena
 *         role: premium
 *
 *     DocumentUploadResponse:
 *        type: object
 *        properties:
 *          status:
 *            type: string
 *            example: success
 *          message:
 *            type: string
 *            example: Documentos subidos correctamente.
 *          user:
 *            $ref: '#/components/schemas/UserResponse'
 *
 *   parameters:
 *      userIdParam:
 *        in: path
 *        name: uid
 *        required: true
 *        schema:
 *          type: string
 *        description: ID del usuario
 *
 *   requestBodies:
 *      UserDocumentUpload:
 *        description: Uno o más archivos de documentos para el usuario.
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                document:
 *                  type: array
 *                  items:
 *                    type: string
 *                    format: binary
 *                  description: Archivos a subir (identificación, comprobante de domicilio, etc.). Máximo 5.
 *
 * # Asegúrate que estos esquemas estén definidos en tu swagger.config.js o aquí
 * # components:
 * #   schemas:
 * #     UserResponse: ...
 * #     Error: ...
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     description: Crea un usuario básico. Para registro completo con contraseña, usar /api/sessions/register.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
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
 *       400:
 *         description: Datos incompletos o inválidos (ej. email duplicado).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor.
 */
// Usa la función correcta del controlador importado
router.post('/', usersController.createUser); 

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios recuperada con éxito.
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
 *                     $ref: '#/components/schemas/UserResponse'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', usersController.getAllUsers);


/**
 * @swagger
 * /api/users/{uid}:
 *   get:
 *     summary: Obtener un usuario por su ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
 *     responses:
 *       200:
 *         description: Datos del usuario.
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
 *       400:
 *         description: ID con formato inválido.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:uid', usersController.getUser);

/**
 * @swagger
 * /api/users/{uid}:
 *   put:
 *     summary: Actualizar un usuario por su ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente.
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
 *                   example: Usuario actualizado.
 *       400:
 *         description: Datos inválidos o ID con formato incorrecto.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:uid', usersController.updateUser);

/**
 * @swagger
 * /api/users/{uid}:
 *   delete:
 *     summary: Eliminar un usuario por su ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
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
 *                   example: Usuario eliminado.
 *       400:
 *         description: ID con formato inválido.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor (ej. no se pudo eliminar).
 */
router.delete('/:uid', usersController.deleteUser);

/**
 * @swagger
 * /api/users/{uid}/documents:
 *   post:
 *     summary: Subir documentos para un usuario
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
 *     requestBody:
 *       $ref: '#/components/requestBodies/UserDocumentUpload'
 *     responses:
 *       200:
 *         description: Documentos subidos y usuario actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentUploadResponse'
 *       400:
 *         description: No se subieron archivos, ID inválido o error en la carga.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor al procesar los archivos.
 */
router.post('/:uid/documents', uploader.array('document', 5), usersController.uploadDocuments);


export default router;