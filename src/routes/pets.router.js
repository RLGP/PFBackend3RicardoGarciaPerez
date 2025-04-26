import { Router } from 'express';
import petsController from '../controllers/pets.controller.js';
import uploader from '../utils/uploader.js';
import { generateManyPets } from '../mocks/pets.mock.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pet:
 *       type: object
 *       required:
 *         - name
 *         - specie
 *         - birthDate
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado por MongoDB
 *         name:
 *           type: string
 *           description: Nombre de la mascota
 *         specie:
 *           type: string
 *           description: Especie de la mascota
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento de la mascota (YYYY-MM-DD)
 *         adopted:
 *           type: boolean
 *           description: Indica si la mascota ha sido adoptada
 *           default: false
 *         owner:
 *           type: string
 *           description: ID del dueño (si ha sido adoptada)
 *         image:
 *           type: string
 *           description: Ruta a la imagen de la mascota
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         name: Firulais
 *         specie: Perro
 *         birthDate: 2020-01-15
 *         adopted: false
 *         owner: null
 *         image: /img/1624312345678-dog.png
 *
 *   requestBodies:
 *     PetInput:
 *       type: object
 *       required:
 *         - name
 *         - specie
 *         - birthDate
 *       properties:
 *         name:
 *           type: string
 *         specie:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *       example:
 *         name: Luna
 *         specie: Gato
 *         birthDate: 2022-05-20
 *     PetUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         specie:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *         adopted:
 *           type: boolean
 *         owner:
 *           type: string
 *       example:
 *         specie: Felino Doméstico
 *         adopted: true
 *         owner: 60d0fe4f5311236168a109cb
 *     PetWithImageInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         specie:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *         image:
 *           type: string
 *           format: binary
 *           description: Archivo de imagen de la mascota
 *
 * tags:
 *   name: Pets
 *   description: Gestión de mascotas
 */

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Obtener todas las mascotas
 *     tags: [Pets]
 *     responses:
 *       200:
 *         description: Lista de mascotas
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
 *                     $ref: '#/components/schemas/Pet'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', petsController.getAllPets);

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: Crear una nueva mascota (sin imagen)
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/PetInput'
 *     responses:
 *       200:
 *         description: Mascota creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Datos incompletos o inválidos
 */
router.post('/', petsController.createPet);

/**
 * @swagger
 * /api/pets/withimage:
 *   post:
 *     summary: Crear una nueva mascota con imagen
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/requestBodies/PetWithImageInput'
 *     responses:
 *       200:
 *         description: Mascota creada exitosamente con imagen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Datos incompletos, inválidos o falta archivo de imagen
 */
router.post('/withimage', uploader.single('image'), petsController.createPetWithImage);

/**
 * @swagger
 * /api/pets/{pid}:
 *   put:
 *     summary: Actualizar una mascota existente
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/PetUpdateInput'
 *     responses:
 *       200:
 *         description: Mascota actualizada exitosamente
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
 *                   example: Mascota actualizada
 *       400:
 *         description: Datos inválidos o ID con formato incorrecto
 *       404:
 *         description: Mascota no encontrada
 */
router.put('/:pid', petsController.updatePet);

/**
 * @swagger
 * /api/pets/{pid}:
 *   delete:
 *     summary: Eliminar una mascota existente
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota a eliminar
 *     responses:
 *       200:
 *         description: Mascota eliminada exitosamente
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
 *                   example: Mascota borrada
 *       400:
 *         description: ID con formato incorrecto
 *       404:
 *         description: Mascota no encontrada
 */
router.delete('/:pid', petsController.deletePet);

/**
 * @swagger
 * /api/pets/mockingpets:
 *   get:
 *     summary: Generar mascotas de prueba (mocking)
 *     tags: [Pets]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Número de mascotas a generar
 *     responses:
 *       200:
 *         description: Lista de mascotas generadas
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
 *                     $ref: '#/components/schemas/Pet' # Asumiendo que el mock genera objetos similares
 *       500:
 *         description: Error generando mascotas con mocking
 */
router.get('/mockingpets', (req, res) => {
    try {
        const count = parseInt(req.query.count) || 100;
        const mockedPets = generateManyPets(count);
        res.send({ status: "success", payload: mockedPets });
    } catch (error) {
        console.error("Error generando mascotas con mocking:", error);
        res.status(500).send({ status: "error", error: "Error generando mascotas con mocking" });
    }
});

export default router;
