import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js"
import __dirname from "../utils/index.js";
import { CustomError, ErrorTypes, ErrorMessages } from "../utils/errors.js";

const getAllPets = async(req,res) => {
    try {
        const pets = await petsService.getAll();
        res.send({status:"success", payload:pets})
    } catch (error) {
        res.status(500).send({
            status: "error",
            error: CustomError.createError({
                type: ErrorTypes.DATABASE_ERROR,
                message: "Error trayendo mascotas de la base de datos"
            })
        });
    }
}

const createPet = async(req,res) => {
    try {
        const {name, specie, birthDate} = req.body;
        if(!name || !specie || !birthDate) {
            throw CustomError.createError({
                type: ErrorTypes.INVALID_INPUT,
                message: ErrorMessages.PET.INCOMPLETE_VALUES
            });
        }
        const pet = PetDTO.getPetInputFrom({name, specie, birthDate});
        const result = await petsService.create(pet);
        res.send({status:"success", payload:result})
    } catch (error) {
        res.status(400).send({
            status: "error",
            error: error.message
        });
    }
}

const updatePet = async(req,res) => {
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;
        
        if(!petId) {
            throw CustomError.createError({
                type: ErrorTypes.INVALID_INPUT,
                message: "Se requiere ID de mascota"
            });
        }

        const existingPet = await petsService.getBy({ _id: petId });
        if(!existingPet) {
            throw CustomError.createError({
                type: ErrorTypes.NOT_FOUND,
                message: ErrorMessages.PET.NOT_FOUND
            });
        }

        const result = await petsService.update(petId, petUpdateBody);
        res.send({status:"success", message:"Mascota actualizada"})
    } catch (error) {
        res.status(error.type === ErrorTypes.NOT_FOUND ? 404 : 400).send({
            status: "error",
            error: error.message
        });
    }
}

const deletePet = async(req,res) => {
    try {
        const petId = req.params.pid;
        
        if(!petId) {
            throw CustomError.createError({
                type: ErrorTypes.INVALID_INPUT,
                message: "Se requiere ID de mascota"
            });
        }

        const existingPet = await petsService.getBy({ _id: petId });
        if(!existingPet) {
            throw CustomError.createError({
                type: ErrorTypes.NOT_FOUND,
                message: ErrorMessages.PET.NOT_FOUND
            });
        }

        const result = await petsService.delete(petId);
        res.send({status:"success", message:"Mascota borrada"});
    } catch (error) {
        res.status(error.type === ErrorTypes.NOT_FOUND ? 404 : 400).send({
            status: "error",
            error: error.message
        });
    }
}

const createPetWithImage = async(req,res) => {
    try {
        const file = req.file;
        const {name, specie, birthDate} = req.body;
        
        if(!file) {
            throw CustomError.createError({
                type: ErrorTypes.INVALID_INPUT,
                message: "Es requerido un archivo de imagen"
            });
        }

        if(!name || !specie || !birthDate) {
            throw CustomError.createError({
                type: ErrorTypes.INVALID_INPUT,
                message: ErrorMessages.PET.INCOMPLETE_VALUES
            });
        }

        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image:`${__dirname}/../public/img/${file.filename}`
        });

        const result = await petsService.create(pet);
        res.send({status:"success", payload:result})
    } catch (error) {
        res.status(400).send({
            status: "error",
            error: error.message
        });
    }
}

export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage
}