import { faker } from '@faker-js/faker';
import { createHash } from '../utils/index.js';

const roles = ['user', 'admin'];

export const generateUser = async () => {
    const hashedPassword = await createHash('coder123');
    
    return {
        _id: faker.database.mongodbObjectId(),
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
