import { Router } from 'express';
import usersController from '../controllers/users.controller.js';

const router = Router();

router.post('/', async (req, res) => {
    try {
      const { first_name, last_name, email } = req.body;
      if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: 'Faltan datos' });
      }
      if (!email.includes('@')) {
        return res.status(400).json({ error: 'Email inválido' });
      }
      const user = { id: users.length + 1, first_name, last_name, email };
      users.push(user);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

router.get('/',usersController.getAllUsers);

router.get('/:uid',usersController.getUser);
router.put('/:uid',usersController.updateUser);
router.delete('/:uid',usersController.deleteUser);


export default router;