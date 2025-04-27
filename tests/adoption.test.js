// src/tests/adoption.test.js
import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import logger from '../src/utils/logger.js';
// --- IMPORT YOUR MODELS --- Asegúrate que las rutas sean correctas
import User from '../src/dao/models/User.js';
import Pet from '../src/dao/models/Pet.js';
import Adoption from '../src/dao/models/Adoption.js';
import mongoose from 'mongoose'; // Needed for ObjectId validation/creation

describe('Adoption Router API Tests (/api/adoptions)', () => {
    let testUser;
    let testPet;
    let adoptedPet;
    let testAdoptionId; // Se llenará si la creación es exitosa
    const invalidMongoId = 'invalid-id-format';
    const nonExistentMongoId = new mongoose.Types.ObjectId().toString(); // Generate valid but non-existent ID

    before(async () => {
        logger.info('Starting Adoption API tests - Setting up test data...');
        // Idealmente, conectar a una DB de PRUEBA aquí si no se hace globalmente

        // Limpiar datos de pruebas anteriores para evitar conflictos
        await User.deleteMany({ email: /@adoptiontest\.com$/ });
        await Pet.deleteMany({ name: /^Adoption Test Pet/ });
        await Adoption.deleteMany({});

        // Crear usuario de prueba
        testUser = await User.create({
            first_name: 'Adoption',
            last_name: 'Tester',
            email: `adoption.tester.${Date.now()}@adoptiontest.com`,
            password: 'password123' // Asume hashing en otro lado
        });

        // Crear mascota de prueba (NO adoptada)
        testPet = await Pet.create({
            name: 'Adoption Test Pet Unadopted',
            specie: 'Dog', // Asegúrate que 'specie' sea el nombre correcto del campo
            birthDate: new Date(),
            adopted: false
        });

        // Crear mascota de prueba (YA adoptada)
        adoptedPet = await Pet.create({
            name: 'Adoption Test Pet Adopted',
            specie: 'Cat', // Asegúrate que 'specie' sea el nombre correcto del campo
            birthDate: new Date(),
            adopted: true
        });

        logger.info(`Test data created: User ID: ${testUser._id}, Pet ID: ${testPet._id}, Adopted Pet ID: ${adoptedPet._id}`);
    });

    after(async () => {
        logger.info('Finished Adoption API tests - Cleaning up test data...');
        try {
            if (testUser?._id) await User.findByIdAndDelete(testUser._id);
            if (testPet?._id) await Pet.findByIdAndDelete(testPet._id);
            if (adoptedPet?._id) await Pet.findByIdAndDelete(adoptedPet._id);
            if (testAdoptionId) {
                await Adoption.findByIdAndDelete(testAdoptionId);
            }
        } catch (error) {
            logger.error('Error during test cleanup:', error);
        }
        // Desconectar de la DB de prueba si es necesario
    });

    describe('POST /api/adoptions/:uid/:pid', () => {
        // Este test fallará si el controlador no devuelve un objeto en response.body.payload
        it('should create a new adoption successfully', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${testUser._id}/${testPet._id}`);

            expect(response.status).to.equal(200); // O 201 si tu API devuelve eso
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.payload).to.be.an('object', 'Response payload should be an object'); // Añadido mensaje
            expect(response.body.payload).to.have.property('owner', testUser._id.toString());
            expect(response.body.payload).to.have.property('pet', testPet._id.toString());
            expect(response.body.payload).to.have.property('_id');
            testAdoptionId = response.body.payload._id; // Guardar ID si la creación fue exitosa y el payload existe
        });

        it('should return 404 if user ID does not exist', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${nonExistentMongoId}/${testPet._id}`);
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status', 'error');
        });

        it('should return 404 if pet ID does not exist', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${testUser._id}/${nonExistentMongoId}`);
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status', 'error');
        });

        // Este test fallará con Timeout si el controlador no valida el formato del ID ANTES de usarlo
        it('should return 400 if user ID format is invalid', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${invalidMongoId}/${testPet._id}`);
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });

        // Este test fallará con Timeout si el controlador no valida el formato del ID ANTES de usarlo
        it('should return 400 if pet ID format is invalid', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${testUser._id}/${invalidMongoId}`);
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });

        it('should return 400 if the pet is already adopted', async () => {
            const response = await request(app)
                .post(`/api/adoptions/${testUser._id}/${adoptedPet._id}`);
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });
    });

    describe('GET /api/adoptions', () => {
        it('should retrieve a list of all adoptions', async () => {
            // Asume que el test de creación funcionó
            const response = await request(app)
                .get('/api/adoptions');
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.payload).to.be.an('array');
            // Verifica que haya al menos la adopción creada
            expect(response.body.payload.length).to.be.greaterThanOrEqual(1);
        });
    });

    describe('GET /api/adoptions/:aid', () => {
        // Este test fallará si el test de creación falló y testAdoptionId es undefined
        it('should retrieve a specific adoption by ID', async () => {
            expect(testAdoptionId, 'testAdoptionId should be set from previous test').to.exist;
            const response = await request(app)
                .get(`/api/adoptions/${testAdoptionId}`);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.payload).to.be.an('object');
            expect(response.body.payload).to.have.property('_id', testAdoptionId.toString());
            expect(response.body.payload).to.have.property('owner', testUser._id.toString());
            expect(response.body.payload).to.have.property('pet', testPet._id.toString());
        });

        it('should return 404 if adoption ID does not exist', async () => {
            const response = await request(app)
                .get(`/api/adoptions/${nonExistentMongoId}`);
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status', 'error');
        });

        // Este test fallará con Timeout si el controlador no valida el formato del ID ANTES de usarlo
        it('should return 400 if adoption ID format is invalid', async () => {
            const response = await request(app)
                .get(`/api/adoptions/${invalidMongoId}`);
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });
    });
});

