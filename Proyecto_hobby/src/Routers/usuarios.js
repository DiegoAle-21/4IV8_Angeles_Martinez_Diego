// ============================================================
// PROYECTO HOBBY - MÚSICA: Rutas de Usuarios (Express Router)
// ============================================================
const express = require('express');
const router = express.Router();
const db = require('../DB/database');

// ============================================================
// FUNCIÓN: Validar datos de usuario
// ============================================================
function validarUsuario(datos) {
    const errores = [];

    if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2) {
        errores.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
    }

    if (!datos.email || typeof datos.email !== 'string') {
        errores.push('El email es obligatorio');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datos.email)) {
            errores.push('El formato del email no es válido');
        }
    }

    return errores;
}

async function existeUsuarioDuplicado(nombre, email, idExcluir = null) {
    const nombreNormalizado = typeof nombre === 'string' ? nombre.trim().toLowerCase() : '';
    const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!nombreNormalizado && !emailNormalizado) {
        return [];
    }

    let consulta = 'SELECT id, nombre, email FROM usuarios WHERE (LOWER(nombre) = ? OR LOWER(email) = ?)';
    const parametros = [nombreNormalizado, emailNormalizado];

    if (idExcluir) {
        consulta += ' AND id <> ?';
        parametros.push(idExcluir);
    }

    const [usuarios] = await db.execute(consulta, parametros);
    return usuarios;
}

// GET /api/usuarios — Listar todos
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios ORDER BY id ASC'
        );

        res.json({
            status: 'success',
            data: usuarios,
            count: usuarios.length
        });
    } catch (error) {
        console.error('❌ Error al listar usuarios:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// GET /api/usuarios/:id — Obtener uno
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [usuarios] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Usuario con ID ${id} no encontrado`
            });
        }

        res.json({ status: 'success', data: usuarios[0] });
    } catch (error) {
        console.error('❌ Error al obtener usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// POST /api/usuarios — Crear nuevo (CORREGIDO)
router.post('/', async (req, res) => {
    try {
        const errores = validarUsuario(req.body);
        if (errores.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: errores.join('; ')
            });
        }

        const { nombre, email } = req.body;
        const nombreNormalizado = nombre.trim();
        const emailNormalizado = email.trim().toLowerCase();

        const usuariosDuplicados = await existeUsuarioDuplicado(nombreNormalizado, emailNormalizado);
        if (usuariosDuplicados.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un usuario con ese nombre o email'
            });
        }

        const [resultado] = await db.execute(
            'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
            [nombreNormalizado, emailNormalizado]
        );

        const [nuevoUsuario] = await db.execute(
            'SELECT id, nombre, email, created_at FROM usuarios WHERE id = ?',
            [resultado.insertId]
        );

        res.status(201).json({
            status: 'success',
            message: 'Usuario registrado con éxito',
            id: nuevoUsuario[0].id,
            nombre: nuevoUsuario[0].nombre,
            email: nuevoUsuario[0].email,
            data: nuevoUsuario[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un usuario registrado con ese email'
            });
        }
        console.error('❌ Error al crear usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// PUT /api/usuarios/:id — Actualizar
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [existente] = await db.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Usuario con ID ${id} no encontrado`
            });
        }

        const errores = validarUsuario(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, email } = req.body;
        const nombreNormalizado = nombre.trim();
        const emailNormalizado = email.trim().toLowerCase();

        const usuariosDuplicados = await existeUsuarioDuplicado(nombreNormalizado, emailNormalizado, id);
        if (usuariosDuplicados.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe otro usuario con ese nombre o email'
            });
        }

        await db.execute(
            'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
            [nombreNormalizado, emailNormalizado, id]
        );

        const [actualizado] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        res.json({ status: 'success', data: actualizado[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe otro usuario registrado con ese email'
            });
        }
        console.error('❌ Error al actualizar usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// DELETE /api/usuarios/:id — Eliminar
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [usuario] = await db.execute('SELECT id, nombre FROM usuarios WHERE id = ?', [id]);

        if (usuario.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Usuario con ID ${id} no encontrado`
            });
        }

        await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: {
                eliminado: usuario[0],
                message: `Usuario "${usuario[0].nombre}" y su historial de reproducciones fueron eliminados`
            }
        });
    } catch (error) {
        console.error('❌ Error al eliminar usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;