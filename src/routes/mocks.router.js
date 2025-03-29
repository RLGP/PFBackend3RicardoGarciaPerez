import { Router } from 'express';
import { generateManyPets } from '../mocks/pets.mock.js';
import { generateManyUsers } from '../mocks/users.mock.js';
import { usersService, petsService } from '../services/index.js';

const router = Router();

router.get('/mockingpets', (req, res) => {
    try {
        const count = parseInt(req.query.count) || 100;
        const mockedPets = generateManyPets(count);
        res.send({ status: 'success', payload: mockedPets });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error generando mascotas con mocking' });
    }
});

router.get('/mockingusers', async (req, res) => {
    try {
        const mockedUsers = await generateManyUsers(50);
        res.send({ status: 'success', payload: mockedUsers });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error generando usuarios con mocking' });
    }
});

router.post('/generateData', async (req, res) => {
    try {
        const { users: numUsers, pets: numPets } = req.body;
        const usersToInsert = await generateManyUsers(Number(numUsers) || 0);
        const petsToInsert = generateManyPets(Number(numPets) || 0);

        for (const user of usersToInsert) {
            await usersService.create(user);
        }
        for (const pet of petsToInsert) {
            await petsService.create(pet);
        }

        const allUsers = await usersService.getAll();
        const allPets = await petsService.getAll();

        res.send({
            status: 'success',
            message: 'Datos generados e insertados correctamente.',
            usersInserted: allUsers,
            petsInserted: allPets
        });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error generando datos.' });
    }
});

export default router;