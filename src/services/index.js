import Users from "../dao/Users.dao.js";
import Pet from "../dao/Pets.dao.js";
import Adoption from "../dao/Adoption.js";

import UserRepository from "../repository/UserRepository.js";
import PetRepository from "../repository/PetRepository.js";
import AdoptionRepository from "../repository/AdoptionRepository.js";

import UserModel from '../dao/models/User.js'; 


export const create = async (userData) => {
    try {
      const createdUser = await UserModel.create(userData);
      return createdUser;
    } catch (error) {
      console.error('Error en usersService.create:', error);
      throw error;
    }
  };
  
  export const getAll = async () => {
    try {
      const users = await UserModel.find();
      return users;
    } catch (error) {
      console.error('Error en usersService.getAll:', error);
      throw error;
    }
  };

export const usersService = new UserRepository(new Users());
export const petsService = new PetRepository(new Pet());
export const adoptionsService = new AdoptionRepository(new Adoption());
