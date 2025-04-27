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
    let loginTestUserEmail = ''; 
    const loginTestUserPassword = 'testPassword123'; 

     before(async () => {
        loginTestUserEmail = generateUniqueEmail();
        const hashedPassword = await createHash(loginTestUserPassword);
        try {
            await usersService.create({
                first_name: 'LoginBase',
                last_name: 'Tester',
                email: loginTestUserEmail,
                password: hashedPassword
            });
        } catch (error) {
        }
    });

    after(async () => {
        try {
            const user = await usersService.getUserByEmail(loginTestUserEmail);
            if (user) {
                await usersService.delete(user._id);
            }
        } catch (error) {}
    });

    beforeEach(async () => {
        const rawPassword = 'tempPassword';
        userCredentials = {
            first_name: 'Temp',
            last_name: 'User',
            email: generateUniqueEmail(),
            password: rawPassword
        };
        try {
            const hashedPassword = await createHash(rawPassword);
            const userToCreate = { ...userCredentials, password: hashedPassword };
            const createdUser = await usersService.create(userToCreate);
            testUserId = createdUser?._id?.toString() || null;
        } catch (error) {
             testUserId = null;
        }
    });

    afterEach(async () => {
        if (testUserId) {
            try { await usersService.delete(testUserId); } catch (error) { }
            testUserId = null;
        }
        try {
            const juanUser = await usersService.getUserByEmail('juan@example.com');
            if (juanUser) await usersService.delete(juanUser._id);
        } catch (error) {}
    });


    describe('POST /api/sessions/register', () => {
        let registeredUserId = null; 

        afterEach(async () => {
            if (registeredUserId) {
                try { await usersService.delete(registeredUserId); } catch (e) { /* Silencio */ }
                registeredUserId = null;
            }
        });

        it('debería registrar un nuevo usuario correctamente', async () => {
            const newUser = {
                first_name: 'Register',
                last_name: 'Test',
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
            registeredUserId = res.body.payload; 

            const dbUser = await usersService.getUserById(registeredUserId);
            expect(dbUser).to.exist;
            expect(dbUser.email).to.equal(newUser.email);
            expect(dbUser.password).to.not.equal(newUser.password);
        });

        it('no debería registrar un usuario con datos incompletos', async () => {
            const incompleteUser = { first_name: 'Incompleto', email: generateUniqueEmail() }; // Falta password y last_name

            const res = await request(app)
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'Incomplete values');
        });

        it('no debería registrar un usuario con un email existente', async () => {
            const existingUser = { 
                first_name: 'Duplicado',
                last_name: 'Test',
                email: loginTestUserEmail,
                password: 'password456'
            };

            const res = await request(app)
                .post('/api/sessions/register')
                .send(existingUser);

            expect(res.status).to.equal(400); 
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'User already exists'); 
        });
    });

    describe('POST /api/sessions/login', () => {
        it('debería loguear un usuario correctamente y actualizar last_connection', async () => {
            const credentials = {
                email: loginTestUserEmail, 
                password: loginTestUserPassword 
            };

            const userBefore = await usersService.getUserByEmail(loginTestUserEmail);
            const lastConnectionBefore = userBefore?.last_connection;

            const res = await request(app)
                .post('/api/sessions/login')
                .send(credentials);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'Logged in');

            expect(res.headers['set-cookie']).to.be.an('array');
            expect(res.headers['set-cookie'].some(cookie => cookie.startsWith('connect.sid='))).to.be.true;
            const userAfter = await usersService.getUserByEmail(loginTestUserEmail);
            expect(userAfter.last_connection).to.exist;
            if (lastConnectionBefore) {
                expect(userAfter.last_connection.getTime()).to.be.greaterThan(lastConnectionBefore.getTime());
            } else {
                 expect(userAfter.last_connection).to.be.instanceOf(Date);
            }
        });

        it('no debería loguear con contraseña incorrecta', async () => {
            const credentials = {
                email: loginTestUserEmail,
                password: 'wrongPassword' 
            };

            const res = await request(app)
                .post('/api/sessions/login')
                .send(credentials);

            expect(res.status).to.equal(401); 
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'Incorrect credentials');
        });

        it('no debería loguear con email inexistente', async () => {
            const credentials = {
                email: 'nonexistent@example.com', 
                password: 'somePassword'
            };

            const res = await request(app)
                .post('/api/sessions/login')
                .send(credentials);

            expect(res.status).to.equal(401); 
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'Incorrect credentials');
        });

         it('no debería loguear con datos incompletos', async () => {
            const credentials = { email: loginTestUserEmail }; 

            const res = await request(app)
                .post('/api/sessions/login')
                .send(credentials);

            expect(res.status).to.equal(400); 
            expect(res.body).to.have.property('status', 'error');
            expect(res.body).to.have.property('error', 'Incomplete values');
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
            expect(res.body.payload).to.have.property('_id', testUserId);
            expect(res.body.payload).to.have.property('email', userCredentials.email);
        });
        it('debería devolver 404 si el ID de usuario no existe', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).get(`/api/users/${nonExistentId}`);
            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('User not found');
        });
         it('debería devolver 404 o 500 si el ID de usuario tiene formato inválido', async () => {
            const invalidId = 'invalid-id-format';
            const res = await request(app).get(`/api/users/${invalidId}`);
             expect(res.status).to.be.oneOf([404, 500]);
             expect(res.body.status).to.equal('error');
        });
    });
    describe('PUT /api/users/:uid', () => {
        it('debería actualizar un usuario correctamente', async () => {
            expect(testUserId, "testUserId no debería ser nulo para esta prueba").to.exist;
            const updateData = { last_name: 'UpdatedLastName' };
            const res = await request(app)
                .put(`/api/users/${testUserId}`)
                .send(updateData);
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('User updated');
            const verifyRes = await request(app).get(`/api/users/${testUserId}`);
            expect(verifyRes.body.payload.last_name).to.equal(updateData.last_name);
        });
        it('debería devolver 404 al intentar actualizar un usuario inexistente', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const updateData = { last_name: 'NoOne' };
            const res = await request(app)
                .put(`/api/users/${nonExistentId}`)
                .send(updateData);
            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('User not found');
        });
    });
    describe('DELETE /api/users/:uid', () => {
        it('debería eliminar un usuario correctamente', async () => {
            expect(testUserId, "testUserId no debería ser nulo para esta prueba").to.exist;
            const res = await request(app).delete(`/api/users/${testUserId}`);
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('User deleted');
            const verifyRes = await request(app).get(`/api/users/${testUserId}`);
            expect(verifyRes.status).to.equal(404);
            testUserId = null; 
        });
        it('debería devolver 404 al intentar eliminar un usuario inexistente', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).delete(`/api/users/${nonExistentId}`);
            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('User not found');
        });
    });

}); 
