import multer from 'multer';
import path from 'path';
import fs from 'fs';
import __dirname from './index.js'; 

const getDestination = (req, file, cb) => {
    let destFolder = '';

    switch (file.fieldname) {
        case 'profileImage': 
            destFolder = 'profiles';
            break;
        case 'productImage': 
             destFolder = 'products';
             break;
        case 'document': 
            destFolder = 'documents';
            break;
        case 'image': 
             destFolder = 'pets';
             break;
        default:
            destFolder = 'others'; 
            break;
    }

    const fullPath = path.join(__dirname, `../public/uploads/${destFolder}`);
    fs.mkdirSync(fullPath, { recursive: true }); 
    cb(null, fullPath);
};

const storage = multer.diskStorage({
    destination: getDestination, 
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const uploader = multer({
    storage,
    onError: function (err, next) {
        console.error('Error en Multer:', err);
        next(err);
    }
});

export default uploader;