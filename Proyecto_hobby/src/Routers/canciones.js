// ============================================================
// PROYECTO HOBBY - MÚSICA: Rutas de Canciones (Express Router)
// ============================================================
const express = require('express');
const router = express.Router();
const db = require('../DB/database');

// ============================================================
// FUNCIÓN: Validar datos de canción
// ============================================================
function validarCancion(datos) {
    const errores = [];

    if (!datos.titulo || typeof datos.titulo !== 'string' || datos.titulo.trim().length < 2) {
        errores.push('El título de la canción es obligatorio (mínimo 2 caracteres)');
    }

    if (!datos.duracion || typeof datos.duracion !== 'string' || datos.duracion.trim().length < 3) {
        errores.push('La duración de la canción es obligatoria (Ej: 3:45)');
    }

    if (!datos.artista_id) {
        errores.push('El ID del artista asociado es obligatorio');
    } else if (!Number.isInteger(Number(datos.artista_id)) || Number(datos.artista_id) <= 0) {
        errores.push('El ID del artista debe ser un número entero positivo');
    }

    return errores;
}

async function existeCancionDuplicada(titulo, artista_id, idExcluir = null) {
    const tituloNormalizado = typeof titulo === 'string' ? titulo.trim().toLowerCase() : '';
    const artistaId = Number(artista_id);

    if (!tituloNormalizado || !Number.isInteger(artistaId) || artistaId <= 0) {
        return [];
    }

    let consulta = 'SELECT id FROM canciones WHERE LOWER(titulo) = ? AND artista_id = ?';
    const parametros = [tituloNormalizado, artistaId];

    if (idExcluir) {
        consulta += ' AND id <> ?';
        parametros.push(idExcluir);
    }

    const [canciones] = await db.execute(consulta, parametros);
    return canciones;
}

// GET /api/canciones — Listar todas
router.get('/', async (req, res) => {
    try {
        const [canciones] = await db.execute(`
            SELECT c.id, c.titulo, c.duracion, c.artista_id, a.nombre AS artista_nombre, c.created_at, c.updated_at 
            FROM canciones c
            INNER JOIN artistas a ON c.artista_id = a.id
            ORDER BY c.id ASC
        `);

        res.json({
            status: 'success',
            data: canciones,
            count: canciones.length
        });
    } catch (error) {
        console.error('❌ Error al listar canciones:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// GET /api/canciones/:id — Obtener una
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [canciones] = await db.execute(`
            SELECT c.id, c.titulo, c.duracion, c.artista_id, a.nombre AS artista_nombre, c.created_at, c.updated_at 
            FROM canciones c
            INNER JOIN artistas a ON c.artista_id = a.id
            WHERE c.id = ?
        `, [id]);

        if (canciones.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Canción con ID ${id} no encontrada`
            });
        }

        res.json({ status: 'success', data: canciones[0] });
    } catch (error) {
        console.error('❌ Error al obtener canción:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// POST /api/canciones — Crear nueva (CORREGIDO)
router.post('/', async (req, res) => {
    try {
        const errores = validarCancion(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { titulo, duracion, artista_id } = req.body;

        const [artista] = await db.execute('SELECT id FROM artistas WHERE id = ?', [artista_id]);
        if (artista.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `El artista con ID ${artista_id} no existe. No se puede crear la canción.`
            });
        }

        const cancionesDuplicadas = await existeCancionDuplicada(titulo, artista_id);
        if (cancionesDuplicadas.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una canción con ese título para este artista'
            });
        }

        const [resultado] = await db.execute(
            'INSERT INTO canciones (titulo, duracion, artista_id) VALUES (?, ?, ?)',
            [titulo.trim(), duracion.trim(), parseInt(artista_id)]
        );

        // CORRECCIÓN: INNER JOIN incorporado para que el frontend reciba el nombre del artista al instante
        const [nueva] = await db.execute(`
            SELECT c.id, c.titulo, c.duracion, c.artista_id, a.nombre AS artista_nombre
            FROM canciones c
            INNER JOIN artistas a ON c.artista_id = a.id
            WHERE c.id = ?
        `, [resultado.insertId]);

        res.status(201).json({ 
            status: 'success', 
            message: 'Canción registrada con éxito',
            id: nueva[0].id,
            titulo: nueva[0].titulo,
            duracion: nueva[0].duracion,
            artista_id: nueva[0].artista_id,
            artista_nombre: nueva[0].artista_nombre, 
            data: nueva[0] 
        });
    } catch (error) {
        console.error('❌ Error al crear canción:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// PUT /api/canciones/:id — Actualizar
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [existente] = await db.execute('SELECT id FROM canciones WHERE id = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Canción con ID ${id} no encontrada`
            });
        }

        const errores = validarCancion(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { titulo, duracion, artista_id } = req.body;

        const [artista] = await db.execute('SELECT id FROM artistas WHERE id = ?', [artista_id]);
        if (artista.length === 0) {
            return res.status(404).json({ status: 'error', message: `El artista con ID ${artista_id} no existe.` });
        }

        const cancionesDuplicadas = await existeCancionDuplicada(titulo, artista_id, id);
        if (cancionesDuplicadas.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe otra canción con ese título para este artista'
            });
        }

        await db.execute(
            'UPDATE canciones SET titulo = ?, duracion = ?, artista_id = ? WHERE id = ?',
            [titulo.trim(), duracion.trim(), parseInt(artista_id), id]
        );

        const [actualizada] = await db.execute(
            'SELECT id, titulo, duracion, artista_id, created_at, updated_at FROM canciones WHERE id = ?',
            [id]
        );

        res.json({ status: 'success', data: actualizada[0] });
    } catch (error) {
        console.error('❌ Error al actualizar canción:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// DELETE /api/canciones/:id — Eliminar
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [cancion] = await db.execute('SELECT id, titulo FROM canciones WHERE id = ?', [id]);

        if (cancion.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Canción con ID ${id} no encontrada`
            });
        }

        await db.execute('DELETE FROM canciones WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: {
                eliminado: cancion[0],
                message: `Canción "${cancion[0].titulo}" eliminada correctamente`
            }
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(409).json({
                status: 'error',
                message: 'No se puede eliminar la canción porque figura en el historial de reproducción de los usuarios'
            });
        }
        console.error('❌ Error al eliminar canción:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;