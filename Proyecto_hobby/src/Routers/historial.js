// ============================================================
// PROYECTO HOBBY - MÚSICA: Rutas de Historial (Express Router)
// ============================================================
const express = require('express');
const router = express.Router();
const db = require('../DB/database');

// ============================================================
// FUNCIÓN: Validar datos de reproducción
// ============================================================
function validarHistorial(datos) {
    const errores = [];

    if (!datos.usuario_id) {
        errores.push('El ID del usuario es obligatorio');
    } else if (!Number.isInteger(Number(datos.usuario_id)) || Number(datos.usuario_id) <= 0) {
        errores.push('El ID del usuario debe ser un número entero positivo');
    }

    if (!datos.cancion_id) {
        errores.push('El ID de la canción es obligatorio');
    } else if (!Number.isInteger(Number(datos.cancion_id)) || Number(datos.cancion_id) <= 0) {
        errores.push('El ID de la canción debe ser un número entero positivo');
    }

    return errores;
}

// GET /api/historial — Listar todo el historial global
router.get('/', async (req, res) => {
    try {
        const [historial] = await db.execute(`
            SELECT h.id, h.usuario_id, u.nombre AS usuario_nombre, h.cancion_id, c.titulo AS cancion_titulo, c.duracion AS cancion_duracion, a.nombre AS artista_nombre, h.fecha_escucha
            FROM historial_reproduccion h
            INNER JOIN usuarios u ON h.usuario_id = u.id
            INNER JOIN canciones c ON h.cancion_id = c.id
            INNER JOIN artistas a ON c.artista_id = a.id
            ORDER BY h.fecha_escucha DESC
        `);

        res.json({
            status: 'success',
            data: historial,
            count: historial.length
        });
    } catch (error) {
        console.error('❌ Error al listar historial:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// GET /api/historial/:id — Obtener una reproducción por ID
router.get('/:id', async (req, res) => {
    try {
        if (req.params.id === 'usuario') {
            return res.status(400).json({
                status: 'error',
                message: 'Usa /api/historial/usuario/:usuario_id para buscar por oyente'
            });
        }

        const { id } = req.params;
        const [registro] = await db.execute(`
            SELECT h.id, h.usuario_id, u.nombre AS usuario_nombre, h.cancion_id, c.titulo AS cancion_titulo, c.duracion AS cancion_duracion, a.nombre AS artista_nombre, h.fecha_escucha
            FROM historial_reproduccion h
            INNER JOIN usuarios u ON h.usuario_id = u.id
            INNER JOIN canciones c ON h.cancion_id = c.id
            INNER JOIN artistas a ON c.artista_id = a.id
            WHERE h.id = ?
        `, [id]);

        if (registro.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Registro de escucha con ID ${id} no encontrado`
            });
        }

        res.json({ status: 'success', data: registro[0] });
    } catch (error) {
        console.error('❌ Error al obtener registro de historial:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// GET /api/historial/usuario/:usuario_id — Historial de un oyente
router.get('/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const [usuario] = await db.execute('SELECT id, nombre, email FROM usuarios WHERE id = ?', [usuario_id]);

        if (usuario.length === 0) {
            return res.status(404).json({ status: 'error', message: `Usuario con ID ${usuario_id} no encontrado` });
        }

        const [historialUsuario] = await db.execute(`
            SELECT h.id, c.titulo AS cancion, a.nombre AS artista, c.duracion, h.fecha_escucha
            FROM historial_reproduccion h
            INNER JOIN canciones c ON h.cancion_id = c.id
            INNER JOIN artistas a ON c.artista_id = a.id
            WHERE h.usuario_id = ?
            ORDER BY h.fecha_escucha DESC
        `, [usuario_id]);

        res.json({
            status: 'success',
            data: {
                usuario: usuario[0],
                historial: historialUsuario,
                total_reproducciones: historialUsuario.length
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener el historial del usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// POST /api/historial — Registrar reproducción (CORREGIDO)
router.post('/', async (req, res) => {
    try {
        const errores = validarHistorial(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { usuario_id, cancion_id } = req.body;

        const [usuario] = await db.execute('SELECT id, nombre FROM usuarios WHERE id = ?', [usuario_id]);
        if (usuario.length === 0) {
            return res.status(404).json({ status: 'error', message: `Usuario con ID ${usuario_id} no encontrado` });
        }

        const [cancion] = await db.execute(`
            SELECT c.id, c.titulo, c.duracion, a.nombre AS artista_nombre 
            FROM canciones c
            INNER JOIN artistas a ON c.artista_id = a.id
            WHERE c.id = ?
        `, [cancion_id]);
        
        if (cancion.length === 0) {
            return res.status(404).json({ status: 'error', message: `Canción con ID ${cancion_id} no encontrada` });
        }

        const [resultado] = await db.execute(
            'INSERT INTO historial_reproduccion (usuario_id, cancion_id) VALUES (?, ?)',
            [usuario_id, cancion_id]
        );

        // CORRECCIÓN: Formateo plano idéntico al GET global para sincronizar con las columnas del HTML
        const respuestaPlana = {
            id: resultado.insertId,
            usuario_id: parseInt(usuario_id),
            usuario_nombre: usuario[0].nombre,
            cancion_id: parseInt(cancion_id),
            cancion_titulo: cancion[0].titulo,
            cancion_duracion: cancion[0].duracion,
            artista_nombre: cancion[0].artista_nombre,
            fecha_escucha: new Date().toISOString()
        };

        res.status(201).json({
            status: 'success',
            message: 'Reproducción registrada con éxito',
            ...respuestaPlana,
            data: respuestaPlana
        });
    } catch (error) {
        console.error('❌ Error al registrar reproducción:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// DELETE /api/historial/:id — Eliminar una canción del historial
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [registro] = await db.execute('SELECT id FROM historial_reproduccion WHERE id = ?', [id]);

        if (registro.length === 0) {
            return res.status(404).json({ status: 'error', message: `Registro de escucha con ID ${id} no encontrado` });
        }

        await db.execute('DELETE FROM historial_reproduccion WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: { mensaje: `Registro de escucha con ID ${id} eliminado del historial` }
        });
    } catch (error) {
        console.error('❌ Error al eliminar del historial:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;