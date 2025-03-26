import { Router } from 'express';
import petsController from '../controllers/pets.controller.js';
import uploader from '../utils/uploader.js';
import { generateManyPets } from '../mocks/pets.mock.js';

const router = Router();

router.get('/',petsController.getAllPets);
router.post('/',petsController.createPet);
router.post('/withimage',uploader.single('image'), petsController.createPetWithImage);
router.put('/:pid',petsController.updatePet);
router.delete('/:pid',petsController.deletePet);

// Add new mocking endpoint
router.get('/mockingpets', (req, res) => {
    try {
        const count = parseInt(req.query.count) || 100;
        const mockedPets = generateManyPets(count);
        res.send({ status: "success", payload: mockedPets });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error generating mocked pets" });
    }
});

export default router;