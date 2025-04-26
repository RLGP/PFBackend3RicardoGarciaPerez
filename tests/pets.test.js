import request from 'supertest';
import app from '../src/app.js';
import { expect } from 'chai';
import mongoose from 'mongoose'; // Necesario para generar IDs de prueba
import { petsService } from '../src/services/index.js'; // Para limpieza
import path from 'path'; // Para construir la ruta del archivo de imagen
import fs from 'fs'; // Para verificar la existencia del archivo de imagen (opcional)

// Helper para generar fechas válidas
const getValidBirthDate = () => new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 5).toISOString().split('T')[0]; // Fecha aleatoria en los últimos 5 años

describe('Router de Mascotas', () => {
  // ... (beforeEach, afterEach y otros tests) ...

  describe('POST /api/pets/withimage', () => {
      // Define la ruta correcta a la carpeta tests en la raíz del proyecto
      const testsDir = path.resolve(process.cwd(), 'tests'); // process.cwd() da la raíz
      const imagePath = path.join(testsDir, 'test_image.png'); // Ruta completa a la imagen de prueba

      // Hook para crear/eliminar el archivo dummy solo para estos tests
      beforeEach(() => {
          // Crear directorio si no existe (más robusto)
          if (!fs.existsSync(testsDir)) {
              fs.mkdirSync(testsDir, { recursive: true });
          }
          // Crear archivo dummy si no existe
          if (!fs.existsSync(imagePath)) {
              fs.writeFileSync(imagePath, 'dummy image data for test');
          }
      });

      afterEach(() => {
          // Eliminar archivo dummy si existe
          if (fs.existsSync(imagePath)) {
              // Comenta la siguiente línea si quieres conservar la imagen de prueba
              // fs.unlinkSync(imagePath);
          }
      });


      it('debería crear una mascota con imagen correctamente', async () => {
          const petData = {
              name: 'MascotaConImagen',
              specie: 'Conejo',
              birthDate: getValidBirthDate()
          };

          const res = await request(app)
              .post('/api/pets/withimage')
              .field('name', petData.name)
              .field('specie', petData.specie)
              .field('birthDate', petData.birthDate)
              .attach('image', imagePath); // Usa la ruta corregida

          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('status', 'success');
          expect(res.body).to.have.property('payload');
          expect(res.body.payload).to.have.property('name', petData.name);
          expect(res.body.payload).to.have.property('image').that.includes('.png');
      });

      it('no debería crear una mascota si falta la imagen', async () => {
           const petData = {
              name: 'MascotaSinImagen',
              specie: 'Hamster',
              birthDate: getValidBirthDate()
          };

          const res = await request(app)
              .post('/api/pets/withimage')
              .field('name', petData.name)
              .field('specie', petData.specie)
              .field('birthDate', petData.birthDate);

          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status', 'error');
          expect(res.body).to.have.property('error', 'Es requerido un archivo de imagen');
      });

       it('no debería crear una mascota con imagen si faltan otros datos', async () => {
          const res = await request(app)
              .post('/api/pets/withimage')
              .field('name', 'IncompletaConImagen')
              .attach('image', imagePath); // Usa la ruta corregida

          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('status', 'error');
          expect(res.body).to.have.property('error', 'Todos los campos son requeridos (nombre, especie, fecha de nacimiento)');
      });
  });

     describe('GET /api/pets/mockingpets', () => {
        it('debería generar la cantidad por defecto (100) de mascotas mock', async () => {
            const res = await request(app).get('/api/pets/mockingpets');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.be.an('array').with.lengthOf(100);
            // Verificar estructura de un elemento mock (opcional)
            if (res.body.payload.length > 0) {
                expect(res.body.payload[0]).to.have.all.keys('name', 'specie', 'birthDate', 'adopted', 'owner', 'image', '_id');
            }
        });

        it('debería generar la cantidad especificada de mascotas mock', async () => {
            const count = 5;
            const res = await request(app).get(`/api/pets/mockingpets?count=${count}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body.payload).to.be.an('array').with.lengthOf(count);
        });
    });

});