// ============================================================
// PROYECTO HOBBY - MÚSICA: Rutas de Artistas (Express Router)
// ============================================================
const express = require('express');
const router = express.Router();
const db = require('../DB/database');

// ============================================================
// FUNCIÓN: Validar datos de artista
// ============================================================
function validarArtista(datos) {
    const errores = [];

    if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2) {
        errores.push('El nombre del artista es obligatorio (mínimo 2 caracteres)');
    }

    if (!datos.genero || typeof datos.genero !== 'string' || datos.genero.trim().length < 3) {
        errores.push('El género musical es obligatorio (mínimo 3 caracteres, ej: Rock, Pop)');
    }

    return errores;
}

async function existeArtistaDuplicado(nombre, idExcluir = null) {
    const nombreNormalizado = typeof nombre === 'string' ? nombre.trim().toLowerCase() : '';

    if (!nombreNormalizado) {
        return [];
    }

    let consulta = 'SELECT id FROM artistas WHERE LOWER(nombre) = ?';
    const parametros = [nombreNormalizado];

    if (idExcluir) {
        consulta += ' AND id <> ?';
        parametros.push(idExcluir);
    }

    const [artistas] = await db.execute(consulta, parametros);
    return artistas;
}

// ============================================================
// GET /api/artistas — Listar todos (CORREGIDO)
// ============================================================
router.get('/', async (req, res) => {
    try {
        const [artistas] = await db.execute(
            'SELECT id, nombre, genero, created_at, updated_at FROM artistas ORDER BY id ASC'
        );

        res.json({
            status: 'success',
            data: artistas, // 👈 Corregido: antes decía artists
            count: artistas.length
        });
    } catch (error) {
        console.error('❌ Error al listar artistas:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// GET /api/artistas/:id — Obtener uno por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [artistas] = await db.execute(
            'SELECT id, nombre, genero, created_at, updated_at FROM artistas WHERE id = ?',
            [id]
        );

        if (artistas.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Artista con ID ${id} no encontrado`
            });
        }

        res.json({ status: 'success', data: artistas[0] });
    } catch (error) {
        console.error('❌ Error al obtener artista:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// POST /api/artistas — Crear nuevo
router.post('/', async (req, res) => {
    try {
        const errores = validarArtista(req.body);
        if (errores.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: errores.join('; ')
            });
        }

        const { nombre, genero } = req.body;
        const nombreNormalizado = nombre.trim();

        const artistasDuplicados = await existeArtistaDuplicado(nombreNormalizado);
        if (artistasDuplicados.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un artista con ese nombre'
            });
        }

        const [resultado] = await db.execute(
            'INSERT INTO artistas (nombre, genero) VALUES (?, ?)',
            [nombreNormalizado, genero.trim()]
        );

        const [nuevoArtista] = await db.execute(
            'SELECT id, nombre, genero, created_at FROM artistas WHERE id = ?',
            [resultado.insertId]
        );

        res.status(201).json({
            status: 'success',
            message: 'Artista registrado con éxito',
            id: nuevoArtista[0].id,
            nombre: nuevoArtista[0].nombre,
            genero: nuevoArtista[0].genero,
            data: nuevoArtista[0]
        });
    } catch (error) {
        console.error('❌ Error al crear artista:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// PUT /api/artistas/:id — Actualizar
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [existente] = await db.execute('SELECT id FROM artistas WHERE id = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Artista con ID ${id} no encontrado`
            });
        }

        const errores = validarArtista(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, genero } = req.body;
        const nombreNormalizado = nombre.trim();

        const artistasDuplicados = await existeArtistaDuplicado(nombreNormalizado, id);
        if (artistasDuplicados.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe otro artista con ese nombre'
            });
        }

        await db.execute(
            'UPDATE artistas SET nombre = ?, genero = ? WHERE id = ?',
            [nombreNormalizado, genero.trim(), id]
        );

        const [actualizado] = await db.execute(
            'SELECT id, nombre, genero, created_at, updated_at FROM artistas WHERE id = ?',
            [id]
        );

        res.json({ status: 'success', data: actualizado[0] });
    } catch (error) {
        console.error('❌ Error al actualizar artista:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// DELETE /api/artistas/:id — Eliminar
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [artista] = await db.execute('SELECT id, nombre FROM artistas WHERE id = ?', [id]);

        if (artista.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Artista con ID ${id} no encontrado`
            });
        }

        await db.execute('DELETE FROM artistas WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: {
                eliminado: artista[0],
                message: `Artista "${artista[0].nombre}" eliminado correctamente`
            }
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(409).json({
                status: 'error',
                message: 'No se puede eliminar el artista porque tiene canciones registradas en su catálogo'
            });
        }
        console.error('❌ Error al eliminar artista:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;