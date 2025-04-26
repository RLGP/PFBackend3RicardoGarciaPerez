import request from 'supertest';
import app from '../src/app.js';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { usersService } from '../src/services/index.js';
import { createHash } from '../src/utils/index.js'; 

const generateUniqueEmail = () => `test.${Date.now()}@example.com`;

describe('Router de Usuarios y Sesiones', () => {
    let testUserId = null;
    let userCredentials = {}; 

    beforeEach(async () => {
        const rawPassword = 'testPassword123';
        userCredentials = {
            first_name: 'Test',
            last_name: 'User',
            email: generateUniqueEmail(),
            password: rawPassword 
        };
        try {

            const hashedPassword = await createHash(rawPassword);
            const userToCreate = {
                first_name: userCredentials.first_name,
                last_name: userCredentials.last_name,
                email: userCredentials.email,
                password: hashedPassword 
            };

            const createdUser = await usersService.create(userToCreate);

            if (createdUser && createdUser._id) {
                testUserId = createdUser._id.toString();
            } else {
               testUserId = null;
            }
        } catch (error) {
             console.error("Error creando usuario directamente en beforeEach:", error);
             testUserId = null;
        }
    });

    afterEach(async () => {
        if (testUserId) {
            try {
                await usersService.delete(testUserId);
            } catch (error) {
            }
            testUserId = null;
        }
        try {
            const juanUser = await usersService.getUserByEmail('juan@example.com');
            if (juanUser) {
                await usersService.delete(juanUser._id);
            }
        } catch (error) {
        }
    });

    describe('POST /api/sessions/register (Creación de Usuario)', () => {
        it('debería registrar un nuevo usuario correctamente', async () => {
            const newUser = {
                first_name: 'Maria',
                last_name: 'Lopez',
                email: generateUniqueEmail(),
                password: 'password123'
            };

            const res = await request(app)
                .post('/api/sessions/register')
                .send(newUser);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('payload');
            expect(res.body.payload).to.be.a('string');

            if (res.body.payload) {
                try {
                    await usersService.delete(res.body.payload);
                } catch (cleanupError) {
                }
            }
        });

        it('no debería registrar un usuario con datos incompletos', async () => {
            const incompleteUser = {
                first_name: 'Incompleto',
                email: generateUniqueEmail(),
            };

            const res = await request(app)
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'Incomplete values');
        });

        it('no debería registrar un usuario con un email existente', async () => {
            expect(testUserId, "testUserId debería existir para la prueba de email duplicado").to.exist;
            expect(userCredentials.email, "userCredentials.email debería existir para la prueba de email duplicado").to.exist;

            const existingUser = {
                first_name: 'Another',
                last_name: 'User',
                email: userCredentials.email, 
                password: 'password2'
            };

            const res = await request(app)
                .post('/api/sessions/register')
                .send(existingUser);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'User already exists');
        });
    });


    describe('GET /api/users', () => {
        it('debería traer todos los usuarios', async () => {
             expect(testUserId, "testUserId debería existir para la prueba GET /api/users").to.exist;

            const res = await request(app).get('/api/users');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.be.an('array');
            expect(res.body.payload.length).to.be.greaterThan(0);
        });
    });


    describe('GET /api/users/:uid', () => {
        it('debería obtener un usuario específico por ID', async () => {
            expect(testUserId, "testUserId no debería ser nulo para esta prueba").to.exist;

            const res = await request(app).get(`/api/users/${testUserId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('payload');
            expect(res.body.payload).to.be.an('object');
            expect(res.body.payload).to.have.property('_id', testUserId);
            expect(res.body.payload).to.have.property('email', userCredentials.email);
        });

        it('debería devolver 404 si el ID de usuario no existe', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).get(`/api/users/${nonExistentId}`);

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'User not found');
        });

         it('debería devolver 404 o 500 si el ID de usuario tiene formato inválido', async () => {
            const invalidId = 'invalid-id-format';
            const res = await request(app).get(`/api/users/${invalidId}`);

             expect(res.status).to.be.oneOf([404, 500]);
             expect(res.body).to.have.property('status', 'error');
        });
    });


    describe('PUT /api/users/:uid', () => {
        it('debería actualizar un usuario correctamente', async () => {
            expect(testUserId, "testUserId no debería ser nulo para esta prueba").to.exist;

            const updateData = {
                last_name: 'UpdatedLastName',
            };

            const res = await request(app)
                .put(`/api/users/${testUserId}`)
                .send(updateData);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'User updated');

            const verifyRes = await request(app).get(`/api/users/${testUserId}`);
            expect(verifyRes.status).to.equal(200);
            expect(verifyRes.body.payload).to.have.property('last_name', updateData.last_name);
        });

        it('debería devolver 404 al intentar actualizar un usuario inexistente', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const updateData = { last_name: 'NoOne' };

            const res = await request(app)
                .put(`/api/users/${nonExistentId}`)
                .send(updateData);

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'User not found');
        });
    });


    describe('DELETE /api/users/:uid', () => {
        it('debería eliminar un usuario correctamente', async () => {
            expect(testUserId, "testUserId no debería ser nulo para esta prueba").to.exist;

            const res = await request(app).delete(`/api/users/${testUserId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'User deleted');

            const verifyRes = await request(app).get(`/api/users/${testUserId}`);
            expect(verifyRes.status).to.equal(404);
            testUserId = null;
        });

        it('debería devolver 404 al intentar eliminar un usuario inexistente', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).delete(`/api/users/${nonExistentId}`);

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'User not found');
        });
    });

});
