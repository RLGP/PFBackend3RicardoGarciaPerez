import { usersService } from "../services/index.js"
import logger from '../utils/logger.js';

export const createUser = (req, res) => {
    try {
      const { first_name, email } = req.body;
      if (!first_name || !email) {
        return res.status(400).json({ error: 'Faltan datos' });
      }
      if (!email.includes('@')) {
        return res.status(400).json({ error: 'Email inválido' });
      }
      const user = { id: users.length + 1, first_name, email };
      users.push(user);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  const getAllUsers = async (req, res) => {
    try {
        const users = await usersService.getAll();
        res.send({ status: "success", payload: users });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Failed to retrieve users" });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).send({ status: "error", error: "User not found" });
        res.send({ status: "success", payload: user });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Failed to retrieve user" });
    }
};

const updateUser = async (req, res) => {
    try {
        const updateBody = req.body;
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).send({ status: "error", error: "User not found" });
        const result = await usersService.update(userId, updateBody); 
        res.send({ status: "success", message: "User updated" });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Failed to update user" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if (!user) {
            return res.status(404).send({ status: "error", error: "User not found" });
        }
        await usersService.delete(userId); 
        res.send({ status: "success", message: "User deleted" });
    } catch (error) {
        console.error("Error deleting user:", error); 
        res.status(500).send({ status: "error", error: "Failed to delete user" });
    }
};

const uploadDocuments = async (req, res) => {
    const { uid } = req.params;
    const files = req.files; 

    if (!files || files.length === 0) {
        return res.status(400).send({ status: 'error', error: 'No se subieron archivos.' });
    }

    try {
        const user = await usersService.getUserById(uid);
        if (!user) {
            return res.status(404).send({ status: 'error', error: 'Usuario no encontrado.' });
        }

        const newDocuments = files.map(file => ({
            name: file.originalname, 
            reference: `/uploads/documents/${file.filename}`
        }));


        user.documents.push(...newDocuments);

        await user.save(); 
        logger.info(`Documentos subidos para usuario ${uid}: ${files.map(f => f.filename).join(', ')}`);
        res.send({ status: 'success', message: 'Documentos subidos correctamente.', documents: newDocuments });

    } catch (error) {
        logger.error(`Error subiendo documentos para ${uid}: ${error}`);
        res.status(500).send({ status: 'error', error: 'Error interno al procesar archivos.' });
    }
};


export default {
    createUser,
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    uploadDocuments
}