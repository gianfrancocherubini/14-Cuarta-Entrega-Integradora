import multer from 'multer';
import __dirname from '../utils.js';
import { join } from 'path';



const almacenamientoDocumento = multer.diskStorage({
    destination: (req, file, cb) => {
        const destinationPath = join(__dirname, 'documentos', 'documents');
        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const subidaDocumento = multer({ storage: almacenamientoDocumento });

export { subidaDocumento };
