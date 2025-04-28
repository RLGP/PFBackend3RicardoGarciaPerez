import { faker } from '@faker-js/faker';
import { createHash } from '../utils/index.js';
import mongoose from 'mongoose'; 

const roles = ['user', 'admin'];

export const generateUser = async () => {
    const plainPassword = faker.internet.password({ length: 10 });
    const hashedPassword = await createHash(plainPassword);

    return {
        _id: new mongoose.Types.ObjectId(), 
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: hashedPassword, 
        role: faker.helpers.arrayElement(roles),
        pets: []
    };
};

export const generateManyUsers = async (count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        users.push(await generateUser());
    }
    return users;
};