import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';
import logger from '../utils/logger.js'; 

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) 
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        
        const exists = await usersService.getUserByEmail(email);
        if (exists) 
            return res.status(400).send({ status: "error", error: "User already exists" });
        
        const hashedPassword = await createHash(password);
        const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword
        }
        
        let result = await usersService.create(user);
        logger.info(`User created: ${JSON.stringify(result)}`); 
        res.send({ status: "success", payload: result._id });
    } catch (error) {
        logger.error(`Error en register: ${error.message}`);
        res.status(500).send({ status: "error", error: error.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });

    try {
        const user = await usersService.getUserByEmail(email);
        if (!user) return res.status(401).send({ status: "error", error: "Incorrect credentials" });

        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) return res.status(401).send({ status: "error", error: "Incorrect credentials" });

        user.last_connection = new Date();
        await user.save(); 
        logger.info(`Login exitoso para ${email}. Última conexión actualizada.`);

        req.session.user = {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
        };

        res.send({ status: "success", message: "Logged in" });

    } catch (error) {
        logger.error(`Error en login para ${email}: ${error}`);
        res.status(500).send({ status: "error", error: "Internal server error" });
    }
};


const logout = async (req, res) => {
    if (req.session.user) { 
        try {
            const userId = req.session.user.id;
            const user = await usersService.getUserById(userId);
            if (user) {
                user.last_connection = new Date();
                await user.save(); 
                logger.info(`Logout para usuario ${userId}. Última conexión actualizada.`);
            }
        } catch (error) {
            logger.error(`Error actualizando last_connection en logout para ${req.session.user.id}: ${error}`);
        }

        req.session.destroy(err => {
            if (err) {
                logger.error(`Error destruyendo sesión: ${err}`);
                return res.status(500).send({ status: 'error', error: 'Logout failed' });
            }
            res.send({ status: 'success', message: 'Logged out' });
        });
    } else {
        res.status(400).send({ status: 'error', error: 'No active session' });
    }
};

const current = async (req, res) => {
    const cookie = req.cookies['coderCookie'];
    try {
        const user = jwt.verify(cookie, 'tokenSecretJWT');
        return res.send({ status: "success", payload: user });
    } catch (error) {
        logger.error(`Error en current: ${error.message}`);
        res.status(401).send({ status: "error", error: "Invalid token" });
    }
}

const unprotectedLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).send({ status: "error", error: "Incomplete values" });
    
    const user = await usersService.getUserByEmail(email);
    if (!user) 
        return res.status(404).send({ status: "error", error: "User doesn't exist" });
    
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword)
        return res.status(400).send({ status: "error", error: "Incorrect password" });
    
    const token = jwt.sign(user, 'tokenSecretJWT', { expiresIn: "1h" });
    res.cookie('unprotectedCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Unprotected Logged in" });
}

const unprotectedCurrent = async (req, res) => {
    const cookie = req.cookies['unprotectedCookie'];
    try {
        const user = jwt.verify(cookie, 'tokenSecretJWT');
        return res.send({ status: "success", payload: user });
    } catch (error) {
        logger.error(`Error en unprotectedCurrent: ${error.message}`);
        res.status(401).send({ status: "error", error: "Invalid token" });
    }
}

export default {
    register,
    login,
    logout,
    current,
    unprotectedLogin,
    unprotectedCurrent
}