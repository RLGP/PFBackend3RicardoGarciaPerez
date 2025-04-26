import { Router } from 'express';
import petsController from '../controllers/pets.controller.js';
import uploader from '../utils/uploader.js';
import { generateManyPets } from '../mocks/pets.mock.js';

const router = Router();

/**
 * @swagger
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
 */
router.post('/', async (req, res) => {
    try {
      const { name, specie } = req.body;
      if (!name || !specie) {
        return res.status(400).json({ error: 'Faltan datos' });
      }
      const pet = { id: pets.length + 1, name, specie };
      pets.push(pet);
      res.status(200).json({ status: 'success', data: pet });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

router.get('/',petsController.getAllPets);
router.post('/',petsController.createPet);
router.post('/withimage',uploader.single('image'), petsController.createPetWithImage);
router.put('/:pid',petsController.updatePet);
router.delete('/:pid',petsController.deletePet);

router.get('/mockingpets', (req, res) => {
    try {
        const count = parseInt(req.query.count) || 100;
        const mockedPets = generateManyPets(count);
        res.send({ status: "success", payload: mockedPets });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error generando mascotas con mocking" });
    }
});

export default router;