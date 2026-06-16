const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware de CORS para permitir solicitudes del Frontend
app.use(cors());

// Middleware para transformar el cuerpo de las peticiones entrantes a JSON
app.use(express.json());

// Logger de peticiones en consola
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Definir la ruta raíz para servir los archivos estáticos de la SPA
app.use(express.static(path.join(__dirname, '..', 'public')));

// Importación de routers
const usuariosRouter = require('./Routers/usuarios');
const productosRouter = require('./Routers/productos');
const comprasRouter = require('./Routers/compras');

// Enrutamiento de recursos API
app.use('/api/usuarios', usuariosRouter);
app.use('/api/productos', productosRouter);
app.use('/api/compras', comprasRouter);

// Documentación de endpoints base de la API
app.get('/api', (req, res) => {
    res.json({
        status : 'success',
        message : 'API REST ',
        endpoint : {
            usuarios : {
                listar : 'GET /api/usuarios',
                obtener : 'GET /api/usuarios/:id',
                crear : 'POST /api/usuarios',
                actualizar : 'PUT /api/usuarios/:id',
                eliminar : 'DELETE /api/usuarios/:id'
            },
            productos : {
                listar : 'GET /api/productos',
                obtener : 'GET /api/productos/:id',
                crear : 'POST /api/productos',
                actualizar : 'PUT /api/productos/:id',
                eliminar : 'DELETE /api/productos/:id'
            },
            compras : {
                listar : 'GET /api/compras',
                obtener : 'GET /api/compras/:id',
                crear : 'POST /api/compras',
                actualizar : 'PUT /api/compras/:id',
                eliminar : 'DELETE /api/compras/:id'
            }
        }
    });
});

// Manejador para rutas de API inexistentes (Corregido)
app.use('/api/*path', (req, res) => {
    res.status(404).json({
        status : 'error',
        message : 'Ruta no encontrada'
    });
});

// Manejador global de errores del servidor
app.use((err, req, res, next) =>{
    console.log('error no manejado: ', err.message);
    res.status(500).json({
        status : 'error',
        message : 'Error interno del servidor'
    });
});

// Lanzamiento del servidor
app.listen(PORT, () => {
    console.log('Servidor inicializado');
});