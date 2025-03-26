import { faker } from '@faker-js/faker';

export const generatePet = () => {
    return {
        _id: faker.database.mongodbObjectId(),
        name: faker.person.firstName(),
        specie: faker.helpers.arrayElement(['Perro', 'Gato', 'Pajaro', 'Hamster']),
        birthDate: faker.date.past({ years: 7 }),
        adopted: false,
        owner: null,
        image:  faker.image.urlLoremFlickr({ category: "animals" })
    }
}

export const generateManyPets = (count) => {
    const pets = [];
    for(let i = 0; i < count; i++) {
        pets.push(generatePet());
    }
    return pets;
}