import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import logger from '../src/utils/logger.js'; 
import User from '../src/dao/models/User.js';
import Pet from '../src/dao/models/Pet.js';
import Adoption from '../src/dao/models/Adoption.js';
import mongoose from 'mongoose';

describe('Pruebas del Router de Adopciones API (/api/adoptions)', () => {
    let testUser;
    let testPet;
    let adoptedPet;
    let testAdoptionId;
    const invalidMongoId = 'invalid-id-format';
    const nonExistentMongoId = new mongoose.Types.ObjectId().toString();

    before(async () => {

        await User.deleteMany({ email: /@adoptiontest\.com$/ });
        await Pet.deleteMany({ name: /^Adoption Test Pet/ });
        await Adoption.deleteMany({});

        testUser = await User.create({
            first_name: 'Adoption',
            last_name: 'Tester',
            email: `adoption.tester.${Date.now()}@adoptiontest.com`,
            password: 'password123'
        });

        testPet = await Pet.create({
            name: 'Adoption Test Pet Unadopted',
            specie: 'Dog',
            birthDate: new Date(),
            adopted: false
        });

        adoptedPet = await Pet.create({
            name: 'Adoption Test Pet Adopted',
            specie: 'Cat',
            birthDate: new Date(),
            adopted: true
        });
    });

    after(async () => {
        try {
            if (testUser?._id) await User.findByIdAndDelete(testUser._id);
            if (testPet?._id) await Pet.findByIdAndDelete(testPet._id);
            if (adoptedPet?._id) await Pet.findByIdAndDelete(adoptedPet._id);
            if (testAdoptionId) {
                await Adoption.findByIdAndDelete(testAdoptionId);
            }
        } catch (error) {
            logger.error('Error durante la limpieza de pruebas:', error);
        }
    });

    describe('POST /api/adoptions/:uid/:pid', () => {
        it('debería crear una nueva adopción exitosamente', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${testUser._id}/${testPet._id}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.payload).to.be.an('object', 'El payload de la respuesta debería ser un objeto');
            expect(response.body.payload).to.have.property('owner', testUser._id.toString());
            expect(response.body.payload).to.have.property('pet', testPet._id.toString());
            expect(response.body.payload).to.have.property('_id');
            testAdoptionId = response.body.payload._id;
        });

        it('debería devolver 404 si el ID de usuario no existe', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${nonExistentMongoId}/${testPet._id}`);
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status', 'error');
        });

        it('debería devolver 404 si el ID de mascota no existe', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${testUser._id}/${nonExistentMongoId}`);
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status', 'error');
        });

        it('debería devolver 400 si el formato del ID de usuario es inválido', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${invalidMongoId}/${testPet._id}`);
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });

        it('debería devolver 400 si el formato del ID de mascota es inválido', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${testUser._id}/${invalidMongoId}`);
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });

        it('debería devolver 400 si la mascota ya está adoptada', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${testUser._id}/${adoptedPet._id}`);
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });
    });

    describe('GET /api/adoptions', () => {
        it('debería obtener una lista de todas las adopciones', async () => {
            const response = await request(app)
                .get('/api/adoptions');
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.payload).to.be.an('array');
            expect(response.body.payload.length).to.be.greaterThanOrEqual(1);
        });
    });

    describe('GET /api/adoptions/:aid', () => {
        it('debería obtener una adopción específica por ID', async () => {
            expect(testAdoptionId, 'testAdoptionId debería estar definido por la prueba anterior').to.exist;
            const response = await request(app)
                .get(`/api/adoptions/${testAdoptionId}`);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.payload).to.be.an('object');
            expect(response.body.payload).to.have.property('_id', testAdoptionId.toString());
            expect(response.body.payload).to.have.property('owner', testUser._id.toString());
            expect(response.body.payload).to.have.property('pet', testPet._id.toString());
        });

        it('debería devolver 404 si el ID de adopción no existe', async () => {
            const response = await request(app)
                .get(`/api/adoptions/${nonExistentMongoId}`);
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status', 'error');
        });

       it('debería devolver 400 si el formato del ID de adopción es inválido', async () => {
            const response = await request(app)
                .get(`/api/adoptions/${invalidMongoId}`);
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });
    });
});
