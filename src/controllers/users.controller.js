import { usersService } from "../services/index.js"
const users = [];

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

const getAllUsers = async(req,res)=>{
    const users = await usersService.getAll();
    res.send({status:"success",payload:users})
}

const getUser = async(req,res)=> {
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error",error:"User not found"})
    res.send({status:"success",payload:user})
}

const updateUser =async(req,res)=>{
    const updateBody = req.body;
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error", error:"User not found"})
    const result = await usersService.update(userId,updateBody);
    res.send({status:"success",message:"User updated"})
}

const deleteUser = async(req,res) =>{
    const userId = req.params.uid;
    const result = await usersService.getUserById(userId);
    res.send({status:"success",message:"User deleted"})
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser
}