import { usersService } from "../services/index.js"

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
        // Consider adding proper error logging/handling
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
        // Consider adding proper error logging/handling
        res.status(500).send({ status: "error", error: "Failed to retrieve user" });
    }
};

const updateUser = async (req, res) => {
    try {
        const updateBody = req.body;
        const userId = req.params.uid;
        // Check if user exists before attempting update
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).send({ status: "error", error: "User not found" });
        // Perform the update
        const result = await usersService.update(userId, updateBody); // Assuming service handles the update logic
        res.send({ status: "success", message: "User updated" });
    } catch (error) {
        // Consider adding proper error logging/handling
        res.status(500).send({ status: "error", error: "Failed to update user" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.uid;
        // Check if user exists before attempting deletion
        const user = await usersService.getUserById(userId);
        if (!user) {
            return res.status(404).send({ status: "error", error: "User not found" });
        }
        // Call the service to delete the user
        await usersService.delete(userId); // Assuming your service has a delete method
        res.send({ status: "success", message: "User deleted" });
    } catch (error) {
        // Consider adding proper error logging/handling
        console.error("Error deleting user:", error); // Log the error
        res.status(500).send({ status: "error", error: "Failed to delete user" });
    }
};

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser
}