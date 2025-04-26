import { Router } from 'express';
import usersController from '../controllers/users.controller.js';
import { createUser } from '../controllers/users.controller.js';

const router = Router();

router.post('/', createUser);

router.get('/',usersController.getAllUsers);

router.get('/:uid',usersController.getUser);
router.put('/:uid',usersController.updateUser);
router.delete('/:uid',usersController.deleteUser);


export default router;