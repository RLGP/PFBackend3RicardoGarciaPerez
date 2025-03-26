import { faker } from '@faker-js/faker';

export const generatePet = () => {
    return {
        _id: faker.database.mongodbObjectId(),
        name: faker.animal.name(),
        specie: faker.helpers.arrayElement(['dog', 'cat', 'bird', 'hamster']),
        birthDate: faker.date.past(),
        adopted: false,
        owner: null,
        image: faker.image.animals()
    }
}

export const generateManyPets = (count) => {
    const pets = [];
    for(let i = 0; i < count; i++) {
        pets.push(generatePet());
    }
    return pets;
}