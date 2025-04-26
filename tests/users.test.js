import request from 'supertest';
import app from '../src/app.js'; 
import { expect } from 'chai';

describe('Users Router', () => {

  it('debería crear un nuevo usuario correctamente', async () => {
    const newUser = {
      name: 'Juan',
      email: 'juan@example.com',
      password: '12345'
    };

    const res = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(res.status).to.equal(201); // Corregido aquí
    expect(res.body).to.have.property('email', 'juan@example.com');
  });

  it('no debería crear un usuario con email inválido', async () => {
    const newUser = {
      name: 'Juan',
      email: 'invalid-email',
      password: '12345'
    };

    const res = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(res.status).to.equal(400); // Corregido aquí
    expect(res.body).to.have.property('error');
  });

  it('debería traer todos los usuarios', async () => {
    const res = await request(app)
      .get('/api/users');

    expect(res.status).to.equal(200); // Corregido aquí
    expect(res.body).to.be.an('array');
  });

});