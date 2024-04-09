import multer from 'multer';
import __dirname from '../utils.js';
import { join } from 'path';



const almacenamientoPerfil = multer.diskStorage({
    destination: (req, file, cb) => {
        const destinationPath = join(__dirname, 'documentos', 'perfiles');
        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const subidaPerfil = multer({ storage: almacenamientoPerfil });

const almacenamientoProducto = multer.diskStorage({
    destination: (req, file, cb) => {
        const destinationPath = join(__dirname, 'documentos', 'productos');
        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const subidaProducto = multer({ storage: almacenamientoProducto });

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

export { subidaPerfil, subidaProducto, subidaDocumento };
