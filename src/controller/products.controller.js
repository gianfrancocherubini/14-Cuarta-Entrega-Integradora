import validUrl from 'valid-url'
import { ProductsService } from '../repository/products.service.js';
const productsService = new ProductsService();

export class ProductsController{
    constructor(){}

    static async getProducts(req, res) {
        try {
            let category = req.query.category;
            let query = {};
    
            if (category) {
                query.category = category;
            }
    
            const products = await productsService.getProducts(query);
    
            res.setHeader('Content-Type', 'text/html');
            res.status(200).render('home', {
                products: products,
                login: req.session.usuario ? true : false,
                currentCategory: category, 
            });
    
        } catch (error) {
            req.logger.error('Error al obtener los productos');
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json({error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`});
        }
    }

    static async createProduct(req,res){

        try {
            const usuario = req.session.usuario;
            const newProductData = req.body;
            const requiredFields = ['title', 'description', 'price', 'thumbnails', 'code', 'stock', 'category'];
    
            for (const field of requiredFields) {
                if (!newProductData[field]) {
                    req.logger.error('Todos los campos son obligatorios')
                    res.setHeader('Content-Type', 'application/json');
                    return res.status(400).json({ error: `El campo '${field}' es obligatorio.` });
                }
            }
    
            // Validar URLs de imágenes
            const validThumbnails = newProductData.thumbnails.every(url => validUrl.isUri(url));
    
            if (!validThumbnails) {
                req.logger.error('La URL de la imagen debe ser valida')
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: 'La URL de la imagen no es válida.' });
            }
            const existingProduct = await productsService.getProductByCode(newProductData.code);
            

            if (existingProduct) {
                req.logger.error('Ya existe un producto con el codigo proporcionado')
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `Ya existe un producto con el código '${newProductData.code}'.` });
            }

            const owner = {
                userId: usuario.id
            };

            if (usuario.rol === 'premium') {
                owner.role = 'premium';
            }

            newProductData.owner = owner;
    
            await productsService.createProduct(newProductData);
            req.logger.info(`Se creo el producto: ${newProductData.title}`);
            res.setHeader('Content-Type', 'application/json');
            return res.status(201).json({ success: true, message: 'Producto agregado correctamente.', newProductData });
        } catch (error) {
            req.logger.error(`Error al agregar el producto, ${error}`);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`});
        }
    }
        static async updateProduct (req,res){
        try {
            const usuario = req.session.usuario;
            const productId = req.params.pid;
    
            // Buscar el producto existente por _id
            const product = await productsService.getProductById(productId)
    
            if (!product) {
                req.logger.error('Producto no encontrado')
                res.setHeader('Content-Type', 'application/json');
                return res.status(404).json({ error: 'Producto no encontrado.' });
            }
    
            // Verificar si la propiedad _id está presente en el cuerpo de la solicitud
            if ('_id' in req.body) {
                req.logger.error('No se puede modificar la propiedad id')
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: 'No se puede modificar la propiedad _id.' });
            }
            
            if (usuario.rol === 'premium') {

                if (product.owner.userId.toString() !== usuario.id) {
                    req.logger.info(`No tiene permiso para actualizar el producto: ${product.title}`);
                    res.setHeader('Content-Type', 'application/json');
                    return res.status(403).json({ error: 'No tiene permiso para modificar este producto.' });
                }
            }

            const updateResult = await productsService.update(productId, req.body);
    
            if (updateResult) {
                req.logger.info(`Producto actualizado: ${productId}`);
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).json({ success: true, message: 'Modificación realizada.' });
            } else {
                req.logger.error('No se concreto la modificacion')
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: 'No se concretó la modificación.' });
            }
        } catch (error) {
            req.logger.error(`Error al actualizar el producto, ${error}`);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`});
        }
    }

 static async deleteProduct(req, res) {
    try {
        const productId = req.params.pid;
        const usuario = req.session.usuario;

        // Buscar el producto existente por _id
        const existingProduct = await productsService.getProductById(productId);

        if (!existingProduct) {
            req.logger.error('Producto no encontrado')
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
         
        if (usuario.rol === 'premium') {
            // Si el usuario es premium, solo puede eliminar productos que haya creado él mismo
            if (existingProduct.owner.userId.toString() !== usuario.id) {
                req.logger.error(`No tiene permiso para eliminar el producto: ${productId}`);
                res.setHeader('Content-Type', 'application/json');
                return res.status(403).json({ error: 'No tiene permiso para eliminar el producto' });
            } 
        } 

        const deleteProductId = await productsService.delete(productId);  
        if (deleteProductId) {
            req.logger.info(`Producto eliminado: ${productId}`);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ success: true, message: 'Producto eliminado.' });
        }     

    } catch (error) {
        req.logger.error(`Error al eliminar el producto ${error}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`});
    }
}
};
