import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import multer from 'multer';
import { subidaDocumento} from "../middlewares/multer.js";
import { enviarWs } from "../config/config.whatsApp.js";
import { UsuariosMongoDao } from '../dao/usuariosDao.js';
import { enviarEmail } from "../mails/mails.js";
const upload = multer({ dest: './src/documentos/' });

const usuariosDao =new UsuariosMongoDao()


export class UsuarioController {
    constructor(){}

    static async perfilUsuario(req,res){

        let usuario = req.session.usuario;
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('perfil', { usuario, login: true });
    
    }

    static async buscarUsuario(req, res) {
        try {
          
            const usuarioId = req.params.cid;
            let usuario = req.session.usuario;
      
            if (!usuario) {
                req.logger.error('Acceso no autenticado')
                res.setHeader('Content-Type', 'application/json');
                res.status(401).json({ error: "Usuario no autenticado" });
                return;
            }
      
            if (usuario.id !== usuarioId) {
                req.logger.error('Acceso no autorizado')
                res.setHeader('Content-Type', 'application/json');
                res.status(403).json({ error: "Acceso no autorizado" });
                return;
            }
      
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(usuario);
        } catch (error) {
            req.logger.error("Error inesperado en el servidor - Intente más tarde, o contacte a su administrador")
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json({ error: "Error inesperado en el servidor - Intente más tarde, o contacte a su administrador" });
        }
    }

    static async consultasWs(req,res){
        
        const consulta = req.body.consulta; 
        try {
            let usuario = req.session.usuario;
            let mensajeEnviado= await enviarWs(consulta);
            req.logger.info(consulta)
            res.setHeader('Content-Type', 'text/html');
            res.status(201).render('perfil',{ mensajeEnviado, usuario, login: true });
        } catch (error) {
            req.logger.error("Error inesperado en el servidor - Intente más tarde, o contacte a su administrador")
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send("Error inesperado en el servidor - Intente más tarde, o contacte a su administrador");
        }
    }

    static async cambiarUsuario(req, res) {

        const usuarioId = req.params.cid;
        let usuario = req.session.usuario;
    
        try {

            let nuevoRol;
            if (usuario.rol === 'usuario') {
                nuevoRol = 'premium';
            } else if (usuario.rol === 'premium') {
                nuevoRol = 'usuario';
            }
    
            await usuariosDao.modificarUsuarioRol(usuarioId, nuevoRol);
    
            usuario.rol = nuevoRol;
            req.session.usuario = usuario;
    
            req.logger.info("Rol de usuario cambiado exitosamente.");
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(`Usuario: ${usuarioId} cambiado de rol`);
        } catch (error) {
            req.logger.error(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`})
        }
    }

    static async uploadDocuments(req, res) {
        
        const userId = req.params.cid;
    
        subidaDocumento.single('documento')(req, res, async function (err) {
            if (err) {
                req.logger.error('Error al cargar el archivo:', err);
                return res.status(500).json({ error: 'Error al cargar el archivo.' });
            }
            if (!req.file) {
                req.logger.error('No se proporcionó ningún archivo.');
                return res.status(400).json({ error: 'No se proporcionó ningún archivo.' });
            }
            try {
                                
                const fileName = req.file.originalname;
                const filePath = req.file.path;
                const user = await usuariosDao.getUsuarioById(userId);
                
                if (!user) {
                    req.logger.error('Usuario no encontrado.');
                    res.setHeader('Content-Type', 'application/json');
                    return res.status(404).json({ error: 'Usuario no encontrado.' });
                }
                user.documents.push({
                    name: fileName,
                    reference: filePath,
                });
                await user.save();
                req.logger.info('Documento subido exitosamente.')
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ message: 'Documento subido exitosamente.' });
            } catch (error) {
                console.error('Error al subir el documento:', error);
                res.setHeader('Content-Type', 'application/json');
                res.status(500).json({ error: 'Error interno del servidor.' });
            }
        });
    }

    // static async uploadProfile(req, res) {
    //     try {
    //         profileUpload.single('profileImage')(req, res, async function (err) {
    //             if (err) {
    //                 console.error('Error al cargar el archivo:', err);
    //                 return res.status(500).json({ error: 'Error interno del servidor.' });
    //             }
    
    //             const fileName = req.file.filename;
    //             res.status(200).json({ message: 'Archivo de perfil cargado exitosamente.', fileName });
    //         });
    //     } catch (error) {
    //         console.error('Error al cargar el archivo de perfil:', error);
    //         res.status(500).json({ error: 'Error interno del servidor.' });
    //     }
    // }
    

    // static async uploadProductImage(req, res) {
    //     try {
    //         productUpload.single('productImage')(req, res, async function (err) {
    //             if (err) {
    //                 console.error('Error al cargar el archivo:', err);
    //                 return res.status(500).json({ error: 'Error interno del servidor.' });
    //             }
    
    //             const fileName = req.file.filename;
    //             res.status(200).json({ message: 'Archivo de producto cargado exitosamente.', fileName });
    //         });
    //     } catch (error) {
    //         console.error('Error al cargar el archivo de producto:', error);
    //         res.status(500).json({ error: 'Error interno del servidor.' });
    //     }
    // }

    static async renderRecuperoPassword(req,res){
        let {error, mensaje} =req.query;
        let usuario = req.session.usuario;
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('recupero', { usuario, login: false, error, mensaje });
    }

    static async recuperoPassword01 (req, res){
        let {email} = req.body
        let usuario = await usuariosDao.getUsuarioByEmailLogin(email);
        if(!usuario){
            return res.redirect('/recuperoPassword?error=No se encontro el usuario con el email proporcionado, verifique si es el correcto!')
        }
        
        let token=jwt.sign({...usuario}, "CoderCoder123", {expiresIn:"1h"})
        let mensaje=`Hola. Ha solicitado recuperar su contraseña!.
            Haga click en el siguiente link: <a href="http://localhost:3012/recuperoPassword02?token=${token}">Recuperar Contraseña</a>
            para reestablecer su contraseña`;

        let respuesta = await enviarEmail(email, "Recupero Password", mensaje)
        if(respuesta.accepted.length>0){
            res.redirect('/recuperoPassword?mensaje=Recibira al instante un mail para recuperar la contraseña! Verifique su casilla de correo.')
        }else{
            res.redirect('/recuperoPassword?mensaje=Error al intentar recuperar contraseña')

        }
    }

    static async renderRecuperoPassword02(req, res) {

        try {
            let { token, mensaje, error } = req.query;
            // Verifica el token y extrae los datos del usuario si el token es válido
            let datosToken = jwt.verify(token, "CoderCoder123");
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).render("recupero02", { token, mensaje, error });
        } catch (error) {
            // Si hay un error al verificar el token, redirige con un mensaje de error
            return res.redirect(`/recuperoPassword02?token=${token}&error=Error token: `+ error.message);
        }
    }

    static async recuperoPassword03 (req,res){

        let {password, password2, token} = req.body

        if(password !== password2){
           return res.redirect(`/recuperoPassword02?token=${token}&error=Error las claves deben coincidir`);
        }
        if(!req.body.password || !req.body.password2){
            return res.redirect(`/recuperoPassword02?token=${token}&error=Debe completar todos los campos`);
        }

        try {
            let datosToken=jwt.verify(token, "CoderCoder123")
            req.logger.info('los datos del token: ', datosToken)
            let usuario=await usuariosDao.getUsuarioByEmailLogin(datosToken.email);
            req.logger.info(usuario)
            
            if(bcrypt.compareSync(password, usuario.password)){
               return res.redirect(`/recuperoPassword02?token=${token}&error=Ha ingresado una contraseña existente. No esta permitido`);
            }
            
            let usuarioActualizado={...usuario, password:bcrypt.hashSync(password, bcrypt.genSaltSync(10))}
            
    
            req.logger.info('El usuario actualizado es:',usuarioActualizado)
            await usuariosDao.modificarUsuarioPorMail(datosToken.email,usuarioActualizado);

            return res.redirect("/recuperoPassword?mensaje=Constraseña restablecida")
        } catch (error) {
            req.logger.error('Error inesperado en el servidor - Intente más tarde, o contacte a su administrador')
            res.setHeader('Content-Type','application/json');
            return res.status(500).json({error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`})
        }
    }

}


