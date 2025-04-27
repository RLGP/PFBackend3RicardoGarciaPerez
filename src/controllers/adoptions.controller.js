import mongoose from 'mongoose';
import { adoptionsService, petsService, usersService } from "../services/index.js";
import logger from '../utils/logger.js';

const sendErrorResponse = (res, statusCode, message, errorDetails = null) => {
    logger.error(`${message}${errorDetails ? `: ${errorDetails}` : ''}`);
    res.status(statusCode).send({ status: "error", error: message });
};

const getAllAdoptions = async (req, res) => {
    try {
       const result = await adoptionsService.getAll();
        res.send({ status: "success", payload: result });
    } catch (error) {
        sendErrorResponse(res, 500, "Internal server error fetching adoptions", error.message);
    }
};

const getAdoption = async (req, res) => {
    const adoptionId = req.params.aid;

   if (!mongoose.Types.ObjectId.isValid(adoptionId)) {
       return res.status(400).send({ status: "error", error: `Invalid Adoption ID format: ${adoptionId}` });
    }

    try {
        const adoption = await adoptionsService.getBy({ _id: adoptionId });
        if (!adoption) {
           return res.status(404).send({ status: "error", error: "Adoption not found" });
        }
        res.send({ status: "success", payload: adoption });
    } catch (error) {
        sendErrorResponse(res, 500, "Internal server error fetching adoption", error.message);
    }
};

const createAdoption = async (req, res) => {
    const { uid, pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
       return res.status(400).send({ status: "error", error: `Invalid User ID format: ${uid}` });
    }
    if (!mongoose.Types.ObjectId.isValid(pid)) {
       return res.status(400).send({ status: "error", error: `Invalid Pet ID format: ${pid}` });
    }

    try {
        const user = await usersService.getUserById(uid);
        if (!user) {
            return res.status(404).send({ status: "error", error: "User Not found" });
        }

        const pet = await petsService.getBy({ _id: pid });
        if (!pet) {
            return res.status(404).send({ status: "error", error: "Pet not found" });
        }

        if (pet.adopted) {
            return res.status(400).send({ status: "error", error: "Pet is already adopted" });
        }

        user.pets.push(pet._id);
        await usersService.update(user._id, { pets: user.pets });
        await petsService.update(pet._id, { adopted: true, owner: user._id });

        const newAdoption = await adoptionsService.create({ owner: user._id, pet: pet._id });
       logger.info(`Adoption created successfully: User ${uid} adopted Pet ${pid}. Adoption ID: ${newAdoption._id}`);

        res.send({ status: "success", payload: newAdoption });

    } catch (error) {
       sendErrorResponse(res, 500, "Internal server error during adoption process", error.message);
    }
};

export default {
    createAdoption,
    getAllAdoptions,
    getAdoption
};
