const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// ---- Middlewares Globales ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

// ---- IMPORTACIÓN DE ROUTERS (4 Apartados) ----
const usuariosRouter = require('./Routers/usuarios');
const artistasRouter = require('./Routers/artistas');   // 👈 NUEVO: Cuarto Apartado
const cancionesRouter = require('./Routers/canciones'); // 👈 Antes productos
const historialRouter = require('./Routers/historial'); // 👈 Antes compras

// ---- VINCULACIÓN DE RUTAS ----
app.use('/api/usuarios', usuariosRouter);
app.use('/api/artistas', artistasRouter);     // 👈 API para el nuevo módulo
app.use('/api/canciones', cancionesRouter);   // 👈 API para canciones
app.use('/api/historial', historialRouter);   // 👈 API para historial de escucha

// ---- Manejo Global de Errores (Evita que el servidor se caiga) ----
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado en el backend:', err.message);
    res.status(500).json({
        error: 'Error interno del servidor',
        detalles: err.message
    });
});

// ---- Inicialización del Servidor ----
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🎵 Servidor del Proyecto Hobby Inicializado 🎵`);
    console.log(`🚀 Corriendo en: http://localhost:${PORT}`);
    console.log(`===============================================`);
});