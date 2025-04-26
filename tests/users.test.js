import request from 'supertest';
import app from '../src/app.js';
import { expect } from 'chai';

describe('Users Router', () => {

  it('debería crear un nuevo usuario correctamente', async () => {
    const newUser = {
      first_name: 'Juan', 
      email: 'juan@example.com',
      password: '12345'
    };

    const res = await request(app)
      .post('/api/users')
      .send(newUser);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body).to.have.property('data');
    expect(res.body.data).to.have.property('email', 'juan@example.com');
    expect(res.body.data).to.have.property('first_name', 'Juan');
  });

  it('no debería crear un usuario con email inválido', async () => {
    const newUser = {
      first_name: 'Juan', 
      email: 'invalid-email',
      password: '12345'
    };

    const res = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Email inválido'); 
  });

  it('debería traer todos los usuarios', async () => {
    const res = await request(app)
      .get('/api/users');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.payload).to.be.an('array');
  });

});