import request from 'supertest';
import app from '../src/app.js';  
import { expect } from 'chai';

describe('Pets Router', () => {

  it('debería crear una nueva mascota correctamente', async () => {
    const newPet = {
      name: 'Firulais',
      species: 'Perro',
      age: 3
    };

    const res = await request(app)
      .post('/api/pets')
      .send(newPet);

    expect(res.status).to.equal(200); // Corregido aquí
    expect(res.body).to.have.property('name', 'Firulais');
  });

  it('no debería crear una mascota sin nombre', async () => {
    const newPet = {
      species: 'Perro',
      age: 3
    };

    const res = await request(app)
      .post('/api/pets')
      .send(newPet);

    expect(res.status).to.equal(400); // Corregido aquí
    expect(res.body).to.have.property('error');
  });

  it('debería obtener todas las mascotas', async () => {
    const res = await request(app)
      .get('/api/pets');

    expect(res.status).to.equal(200); // Corregido aquí
    expect(res.body).to.be.an('array');
  });

});
