// ============================================================
// PROYECTO HOBBY - MÚSICA: Frontend para Plataforma Musical
// ============================================================
// Este frontend maneja 4 apartados por separado: 
// Usuarios (Oyentes), Artistas, Canciones e Historial de Reproducción.
// ============================================================

// ============================================================
// 1. UTILIDADES COMPARTIDAS
// ============================================================

// Panel de estado de la API
const apiMetodo = document.getElementById('api-metodo');
const apiUrl = document.getElementById('api-url');
const apiCodigo = document.getElementById('api-codigo');
const notificacionDiv = document.getElementById('notificacion');

// URL Base absoluta del Backend de Express para evitar fallos de protocolo
const URL_BASE = 'http://localhost:3000';

// Fetch wrapper con logging y soporte de URL absoluta
async function fetchAPI(url, opciones = {}) {
    const method = opciones.method || 'GET';
    const urlCompleta = url.startsWith('/api') ? `${URL_BASE}${url}` : url;

    if (apiMetodo) apiMetodo.textContent = method;
    if (apiMetodo) apiMetodo.className = `badge badge-${method.toLowerCase()}`;
    if (apiUrl) apiUrl.textContent = urlCompleta;
    if (apiCodigo) apiCodigo.textContent = '...';
    if (apiCodigo) apiCodigo.className = 'badge badge-neutral';

    try {
        if (!opciones.headers) opciones.headers = {};
        if (method !== 'GET' && !opciones.headers['Content-Type']) {
            opciones.headers['Content-Type'] = 'application/json';
        }

        const respuesta = await fetch(urlCompleta, opciones);
        if (apiCodigo) apiCodigo.textContent = `${respuesta.status}`;
        if (apiCodigo) apiCodigo.className = `badge ${respuesta.ok ? 'badge-success' : 'badge-error'}`;

        const datos = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(datos.message || `Error ${respuesta.status}`);
        }
        return datos;
    } catch (error) {
        if (apiCodigo && apiCodigo.textContent === '...') {
            apiCodigo.textContent = 'ERROR';
            apiCodigo.className = 'badge badge-error';
        }
        throw error;
    }
}

function mostrarNotificacion(mensaje, tipo) {
    if (!notificacionDiv) return;
    notificacionDiv.textContent = mensaje;
    notificacionDiv.className = `notificacion ${tipo}`;
    notificacionDiv.style.display = 'block';
    setTimeout(() => { notificacionDiv.style.display = 'none'; }, 3000);
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function bloquearNumerosEnCampo(input) {
    if (!input) return;

    input.addEventListener('keydown', (event) => {
        const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (/\d/.test(event.key) && !event.ctrlKey && !event.metaKey && !teclasPermitidas.includes(event.key)) {
            event.preventDefault();
        }
    });

    input.addEventListener('input', () => {
        input.value = input.value.replace(/\d/g, '');
    });
}

function formatearFechaHora(fechaISO) {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// Helper para extraer arreglos sin importar la estructura del JSON del Backend
function extraerArreglo(respuesta) {
    if (!respuesta) return [];
    if (Array.isArray(respuesta)) return respuesta;
    if (respuesta.data && Array.isArray(respuesta.data)) return respuesta.data;
    if (respuesta.artistas && Array.isArray(respuesta.artistas)) return respuesta.artistas;
    if (respuesta.canciones && Array.isArray(respuesta.canciones)) return respuesta.canciones;
    if (respuesta.usuarios && Array.isArray(respuesta.usuarios)) return respuesta.usuarios;
    
    // Búsqueda exhaustiva si viene muy anidado
    const propiedadArray = Object.values(respuesta).find(val => Array.isArray(val));
    if (propiedadArray) return propiedadArray;
    
    return [];
}

// ============================================================
// 2. MÓDULO DE USUARIOS (OYENTES)
// ============================================================
const formUsuario = document.getElementById('form-usuario');
const inputUsuarioId = document.getElementById('usuario-id');
const inputUsuarioNombre = document.getElementById('usuario-nombre');
const inputUsuarioEmail = document.getElementById('usuario-email');
const formTituloUsuario = document.getElementById('form-titulo-usuario');
const btnGuardarUsuario = document.getElementById('btn-guardar-usuario');
const btnCancelarUsuario = document.getElementById('btn-cancelar-usuario');
const tbodyUsuarios = document.getElementById('tbody-usuarios');
const tablaUsuarios = document.getElementById('tabla-usuarios');
const cargaUsuarios = document.getElementById('carga-usuarios');
const contadorUsuarios = document.getElementById('contador-usuarios');
const errorUsuarioNombre = document.getElementById('error-usuario-nombre');
const errorUsuarioEmail = document.getElementById('error-usuario-email');

async function cargarUsuarios() {
    try {
        const resp = await fetchAPI('/api/usuarios');
        if (cargaUsuarios) cargaUsuarios.style.display = 'none';

        let lista = extraerArreglo(resp);

        if (lista.length === 0) {
            if (tablaUsuarios) tablaUsuarios.style.display = 'none';
            if (cargaUsuarios) {
                cargaUsuarios.textContent = 'No hay usuarios registrados.';
                cargaUsuarios.style.display = 'block';
            }
        } else {
            if (tablaUsuarios) tablaUsuarios.style.display = 'table';
            if (tbodyUsuarios) {
                tbodyUsuarios.innerHTML = '';
                lista.forEach(u => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${u.id}</td>
                        <td>${escapeHtml(u.nombre)}</td>
                        <td>${escapeHtml(u.email)}</td>
                        <td>
                            <button class="btn-ver" onclick="verHistorialUsuario(${u.id})">Historial</button>
                            <button class="btn-editar" onclick="editarUsuario(${u.id})">Editar</button>
                            <button class="btn-eliminar" onclick="confirmarEliminarUsuario(${u.id}, '${escapeHtml(u.nombre)}')">Eliminar</button>
                        </td>
                    `;
                    tbodyUsuarios.appendChild(fila);
                });
            }
        }
        if (contadorUsuarios) contadorUsuarios.textContent = `${lista.length}`;
    } catch (error) {
        console.error(error);
    }
}

function validarFormUsuario() {
    let ok = true;
    const nombre = inputUsuarioNombre.value.trim();
    const email = inputUsuarioEmail.value.trim();

    if (!nombre || nombre.length < 2) {
        errorUsuarioNombre.textContent = 'Mínimo 2 caracteres';
        inputUsuarioNombre.classList.add('input-error');
        ok = false;
    } else if (/\d/.test(nombre)) {
        errorUsuarioNombre.textContent = 'No se permiten números';
        inputUsuarioNombre.classList.add('input-error');
        ok = false;
    } else {
        errorUsuarioNombre.textContent = '';
        inputUsuarioNombre.classList.remove('input-error');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorUsuarioEmail.textContent = 'Email no válido';
        inputUsuarioEmail.classList.add('input-error');
        ok = false;
    } else {
        errorUsuarioEmail.textContent = '';
        inputUsuarioEmail.classList.remove('input-error');
    }

    return ok;
}

if (formUsuario) {
    formUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validarFormUsuario()) return;

        const datos = {
            nombre: inputUsuarioNombre.value.trim(),
            email: inputUsuarioEmail.value.trim()
        };
        const id = inputUsuarioId.value;

        try {
            if (id) {
                await fetchAPI(`/api/usuarios/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(datos)
                });
                mostrarNotificacion('Usuario actualizado', 'exito');
            } else {
                await fetchAPI('/api/usuarios', {
                    method: 'POST',
                    body: JSON.stringify(datos)
                });
                mostrarNotificacion('Usuario creado', 'exito');
            }
            limpiarFormUsuario();
            cargarUsuarios();
        } catch (error) {
            mostrarNotificacion(error.message, 'error');
        }
    });
}

function limpiarFormUsuario() {
    if (formUsuario) formUsuario.reset();
    if (inputUsuarioId) inputUsuarioId.value = '';
    if (formTituloUsuario) formTituloUsuario.textContent = 'Agregar Usuario';
    if (btnGuardarUsuario) btnGuardarUsuario.textContent = 'Guardar';
    if (btnCancelarUsuario) btnCancelarUsuario.style.display = 'none';
    if (errorUsuarioNombre) errorUsuarioNombre.textContent = '';
    if (errorUsuarioEmail) errorUsuarioEmail.textContent = '';
    if (inputUsuarioNombre) inputUsuarioNombre.classList.remove('input-error');
    if (inputUsuarioEmail) inputUsuarioEmail.classList.remove('input-error');
}

async function editarUsuario(id) {
    try {
        const resp = await fetchAPI(`/api/usuarios/${id}`);
        const usuarioData = resp.data || resp;
        inputUsuarioId.value = usuarioData.id;
        inputUsuarioNombre.value = usuarioData.nombre;
        inputUsuarioEmail.value = usuarioData.email;
        formTituloUsuario.textContent = 'Editar Usuario';
        btnGuardarUsuario.textContent = 'Actualizar';
        btnCancelarUsuario.style.display = 'inline-block';
        cambiarSeccion('usuarios');
        formUsuario.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

function confirmarEliminarUsuario(id, nombre) {
    if (confirm(`¿Eliminar al usuario "${nombre}"? Se borrará permanentemente de la plataforma.`)) {
        eliminarUsuario(id);
    }
}

async function eliminarUsuario(id) {
    try {
        await fetchAPI(`/api/usuarios/${id}`, { method: 'DELETE' });
        mostrarNotificacion('Usuario eliminado', 'exito');
        if (inputUsuarioId && inputUsuarioId.value === String(id)) limpiarFormUsuario();
        cargarUsuarios();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

async function verHistorialUsuario(id) {
    try {
        const resp = await fetchAPI(`/api/historial/usuario/${id}`);
        const datosContenedor = resp.data || resp;
        const usuario = datosContenedor.usuario;
        const reproducciones = datosContenedor.reproducciones || [];
        const total_escuchadas = datosContenedor.total_escuchadas || 0;

        let mensaje = `El oyente "${usuario.nombre}" ha escuchado ${total_escuchadas} canción(es).\n\n`;
        if (reproducciones.length === 0) {
            mensaje += 'No cuenta con reproducciones registradas.';
        } else {
            reproducciones.forEach(r => {
                mensaje += `🎵 ${r.titulo} — [${r.duracion}] (Escuchada el: ${formatearFechaHora(r.fecha_escucha)})\n`;
            });
        }
        alert(mensaje);
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

if (btnCancelarUsuario) btnCancelarUsuario.addEventListener('click', limpiarFormUsuario);

bloquearNumerosEnCampo(inputUsuarioNombre);


// ============================================================
// 3. MÓDULO DE ARTISTAS
// ============================================================
const formArtista = document.getElementById('form-artista');
const inputArtistaId = document.getElementById('artista-id');
const inputArtistaNombre = document.getElementById('artista-nombre');
const inputArtistaGenero = document.getElementById('artista-genero');
const formTituloArtista = document.getElementById('form-titulo-artista');
const btnGuardarArtista = document.getElementById('btn-guardar-artista');
const btnCancelarArtista = document.getElementById('btn-cancelar-artista');
const tbodyArtistas = document.getElementById('tbody-artistas');
const tablaArtistas = document.getElementById('tabla-artistas');
const cargaArtistas = document.getElementById('carga-artistas');
const contadorArtistas = document.getElementById('contador-artistas');
const errorArtistaNombre = document.getElementById('error-artista-nombre');
const errorArtistaGenero = document.getElementById('error-artista-genero');

async function cargarArtistas() {
    try {
        const resp = await fetchAPI('/api/artistas');
        if (cargaArtistas) cargaArtistas.style.display = 'none';

        let lista = extraerArreglo(resp);

        if (lista.length === 0) {
            if (tablaArtistas) tablaArtistas.style.display = 'none';
            if (cargaArtistas) {
                cargaArtistas.textContent = 'No hay artistas registrados.';
                cargaArtistas.style.display = 'block';
            }
        } else {
            if (tablaArtistas) tablaArtistas.style.display = 'table';
            if (tbodyArtistas) {
                tbodyArtistas.innerHTML = '';
                lista.forEach(a => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${a.id}</td>
                        <td>${escapeHtml(a.nombre)}</td>
                        <td><span class="badge-genero">${escapeHtml(a.genero)}</span></td>
                        <td>
                            <button class="btn-editar" onclick="editarArtista(${a.id})">Editar</button>
                            <button class="btn-eliminar" onclick="confirmarEliminarArtista(${a.id}, '${escapeHtml(a.nombre)}')">Eliminar</button>
                        </td>
                    `;
                    tbodyArtistas.appendChild(fila);
                });
            }
        }
        if (contadorArtistas) contadorArtistas.textContent = `${lista.length}`;
    } catch (error) {
        console.error(error);
    }
}

function validarFormArtista() {
    let ok = true;
    const nombre = inputArtistaNombre.value.trim();
    const genero = inputArtistaGenero.value.trim();

    if (!nombre || nombre.length < 2) {
        errorArtistaNombre.textContent = 'Mínimo 2 caracteres';
        inputArtistaNombre.classList.add('input-error');
        ok = false;
    } else if (/\d/.test(nombre)) {
        errorArtistaNombre.textContent = 'No se permiten números';
        inputArtistaNombre.classList.add('input-error');
        ok = false;
    } else {
        errorArtistaNombre.textContent = '';
        inputArtistaNombre.classList.remove('input-error');
    }

    if (!genero || genero.length < 3) {
        errorArtistaGenero.textContent = 'Mínimo 3 caracteres (ej: Rock)';
        inputArtistaGenero.classList.add('input-error');
        ok = false;
    } else if (/\d/.test(genero)) {
        errorArtistaGenero.textContent = 'No se permiten números';
        inputArtistaGenero.classList.add('input-error');
        ok = false;
    } else {
        errorArtistaGenero.textContent = '';
        inputArtistaGenero.classList.remove('input-error');
    }

    return ok;
}

if (formArtista) {
    formArtista.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validarFormArtista()) return;

        const datos = {
            nombre: inputArtistaNombre.value.trim(),
            genero: inputArtistaGenero.value.trim()
        };
        const id = inputArtistaId.value;

        try {
            if (id) {
                await fetchAPI(`/api/artistas/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(datos)
                });
                mostrarNotificacion('Artista actualizado', 'exito');
            } else {
                await fetchAPI('/api/artistas', {
                    method: 'POST',
                    body: JSON.stringify(datos)
                });
                mostrarNotificacion('Artista registrado', 'exito');
            }
            limpiarFormArtista();
            cargarArtistas();
        } catch (error) {
            mostrarNotificacion(error.message, 'error');
        }
    });
}

function limpiarFormArtista() {
    if (formArtista) formArtista.reset();
    if (inputArtistaId) inputArtistaId.value = '';
    if (formTituloArtista) formTituloArtista.textContent = 'Agregar Artista';
    if (btnGuardarArtista) btnGuardarArtista.textContent = 'Guardar';
    if (btnCancelarArtista) btnCancelarArtista.style.display = 'none';
    if (errorArtistaNombre) errorArtistaNombre.textContent = '';
    if (errorArtistaGenero) errorArtistaGenero.textContent = '';
    if (inputArtistaNombre) inputArtistaNombre.classList.remove('input-error');
    if (inputArtistaGenero) inputArtistaGenero.classList.remove('input-error');
}

async function editarArtista(id) {
    try {
        const resp = await fetchAPI(`/api/artistas/${id}`);
        const artistaData = resp.data || resp;
        inputArtistaId.value = artistaData.id;
        inputArtistaNombre.value = artistaData.nombre;
        inputArtistaGenero.value = artistaData.genero;
        formTituloArtista.textContent = 'Editar Artista';
        btnGuardarArtista.textContent = 'Actualizar';
        btnCancelarArtista.style.display = 'inline-block';
        cambiarSeccion('artistas');
        formArtista.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

function confirmarEliminarArtista(id, nombre) {
    if (confirm(`¿Eliminar a "${nombre}"?\nSi tiene canciones vinculadas, la base de datos rechazará la operación.`)) {
        eliminarArtista(id);
    }
}

async function eliminarArtista(id) {
    try {
        await fetchAPI(`/api/artistas/${id}`, { method: 'DELETE' });
        mostrarNotificacion('Artista eliminado correctamente', 'exito');
        if (inputArtistaId && inputArtistaId.value === String(id)) limpiarFormArtista();
        cargarArtistas();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

if (btnCancelarArtista) btnCancelarArtista.addEventListener('click', limpiarFormArtista);

bloquearNumerosEnCampo(inputArtistaNombre);
bloquearNumerosEnCampo(inputArtistaGenero);


// ============================================================
// 4. MÓDULO DE CANCIONES (SELECTOR RE-MAPEADO)
// ============================================================
const formCancion = document.getElementById('form-cancion');
const inputCancionId = document.getElementById('cancion-id');
const inputCancionTitulo = document.getElementById('cancion-titulo');
const inputCancionDuracion = document.getElementById('cancion-duracion');
const selectArtistaCancion = document.getElementById('cancion-artista');
const formTituloCancion = document.getElementById('form-titulo-cancion');
const btnGuardarCancion = document.getElementById('btn-guardar-cancion');
const btnCancelarCancion = document.getElementById('btn-cancelar-cancion');
const tbodyCanciones = document.getElementById('tbody-canciones');
const tablaCanciones = document.getElementById('tabla-canciones');
const cargaCanciones = document.getElementById('carga-canciones');
const contadorCanciones = document.getElementById('contador-canciones');
const errorCancionTitulo = document.getElementById('error-cancion-titulo');
const errorCancionDuracion = document.getElementById('error-cancion-duracion');
const errorCancionArtista = document.getElementById('error-cancion-artista');

// Función crítica corregida para extraer artistas sin importar la envoltura JSON
async function cargarSelectArtistas() {
    if (!selectArtistaCancion) return;
    selectArtistaCancion.innerHTML = '<option value="">-- Seleccionar Artista --</option>';
    
    try {
        const resp = await fetchAPI('/api/artistas');
        let listaArtistas = extraerArreglo(resp);

        if (listaArtistas && listaArtistas.length > 0) {
            listaArtistas.forEach(a => {
                const option = document.createElement('option');
                option.value = a.id;
                option.textContent = a.nombre;
                selectArtistaCancion.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Error cargando selector de artistas:", err);
    }
}

async function cargarCanciones() {
    try {
        const resp = await fetchAPI('/api/canciones');
        if (cargaCanciones) cargaCanciones.style.display = 'none';

        let lista = extraerArreglo(resp);

        if (lista.length === 0) {
            if (tablaCanciones) tablaCanciones.style.display = 'none';
            if (cargaCanciones) {
                cargaCanciones.textContent = 'No hay canciones registradas.';
                cargaCanciones.style.display = 'block';
            }
        } else {
            if (tablaCanciones) tablaCanciones.style.display = 'table';
            if (tbodyCanciones) {
                tbodyCanciones.innerHTML = '';
                lista.forEach(c => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${c.id}</td>
                        <td>${escapeHtml(c.titulo)}</td>
                        <td><strong>${escapeHtml(c.artista_nombre || 'Desconocido')}</strong></td>
                        <td>${escapeHtml(c.duracion)}</td>
                        <td>
                            <button class="btn-editar" onclick="editarCancion(${c.id})">Editar</button>
                            <button class="btn-eliminar" onclick="confirmarEliminarCancion(${c.id}, '${escapeHtml(c.titulo)}')">Eliminar</button>
                        </td>
                    `;
                    tbodyCanciones.appendChild(fila);
                });
            }
        }
        if (contadorCanciones) contadorCanciones.textContent = `${lista.length}`;
    } catch (error) {
        console.error(error);
    }
}

function validarFormCancion() {
    let ok = true;
    const titulo = inputCancionTitulo.value.trim();
    const duracion = inputCancionDuracion.value.trim();

    if (!titulo || titulo.length < 2) {
        errorCancionTitulo.textContent = 'Mínimo 2 caracteres';
        inputCancionTitulo.classList.add('input-error');
        ok = false;
    } else if (/\d/.test(titulo)) {
        errorCancionTitulo.textContent = 'No se permiten números';
        inputCancionTitulo.classList.add('input-error');
        ok = false;
    } else {
        errorCancionTitulo.textContent = '';
        inputCancionTitulo.classList.remove('input-error');
    }

    if (!duracion || !/^\d{1,2}:\d{2}$/.test(duracion)) {
        errorCancionDuracion.textContent = 'Formato mm:ss requerido (ej: 3:45)';
        inputCancionDuracion.classList.add('input-error');
        ok = false;
    } else {
        errorCancionDuracion.textContent = '';
        inputCancionDuracion.classList.remove('input-error');
    }

    if (!selectArtistaCancion || !selectArtistaCancion.value) {
        if (errorCancionArtista) errorCancionArtista.textContent = 'Selecciona un artista';
        if (selectArtistaCancion) selectArtistaCancion.classList.add('input-error');
        ok = false;
    } else {
        if (errorCancionArtista) errorCancionArtista.textContent = '';
        if (selectArtistaCancion) selectArtistaCancion.classList.remove('input-error');
    }

    return ok;
}

if (formCancion) {
    formCancion.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validarFormCancion()) return;

        const datos = {
            titulo: inputCancionTitulo.value.trim(),
            duracion: inputCancionDuracion.value.trim(),
            artista_id: parseInt(selectArtistaCancion.value)
        };
        const id = inputCancionId.value;

        try {
            if (id) {
                await fetchAPI(`/api/canciones/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(datos)
                });
                mostrarNotificacion('Canción actualizada', 'exito');
            } else {
                await fetchAPI('/api/canciones', {
                    method: 'POST',
                    body: JSON.stringify(datos)
                });
                mostrarNotificacion('Canción agregada al catálogo', 'exito');
            }
            limpiarFormCancion();
            cargarCanciones();
        } catch (error) {
            mostrarNotificacion(error.message, 'error');
        }
    });
}

function limpiarFormCancion() {
    if (formCancion) formCancion.reset();
    if (inputCancionId) inputCancionId.value = '';
    if (formTituloCancion) formTituloCancion.textContent = 'Agregar Canción';
    if (btnGuardarCancion) btnGuardarCancion.textContent = 'Guardar';
    if (btnCancelarCancion) btnCancelarCancion.style.display = 'none';
    if (errorCancionTitulo) errorCancionTitulo.textContent = '';
    if (errorCancionDuracion) errorCancionDuracion.textContent = '';
    if (errorCancionArtista) errorCancionArtista.textContent = '';
    inputCancionTitulo.classList.remove('input-error');
    inputCancionDuracion.classList.remove('input-error');
    selectArtistaCancion.classList.remove('input-error');
}

async function editarCancion(id) {
    try {
        await cargarSelectArtistas(); 
        const resp = await fetchAPI(`/api/canciones/${id}`);
        const cancionData = resp.data || resp;
        inputCancionId.value = cancionData.id;
        inputCancionTitulo.value = cancionData.titulo;
        inputCancionDuracion.value = cancionData.duracion;
        selectArtistaCancion.value = cancionData.artista_id;
        formTituloCancion.textContent = 'Editar Canción';
        btnGuardarCancion.textContent = 'Actualizar';
        btnCancelarCancion.style.display = 'inline-block';
        cambiarSeccion('canciones');
        formCancion.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

function confirmarEliminarCancion(id, titulo) {
    if (confirm(`¿Deseas eliminar la canción "${titulo}" del catálogo?`)) {
        eliminarCancion(id);
    }
}

async function eliminarCancion(id) {
    try {
        await fetchAPI(`/api/canciones/${id}`, { method: 'DELETE' });
        mostrarNotificacion('Canción eliminada correctamente', 'exito');
        if (inputCancionId && inputCancionId.value === String(id)) limpiarFormCancion();
        cargarCanciones();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

if (btnCancelarCancion) btnCancelarCancion.addEventListener('click', limpiarFormCancion);

bloquearNumerosEnCampo(inputCancionTitulo);


// ============================================================
// 5. MÓDULO DE HISTORIAL DE REPRODUCCIÓN
// ============================================================
const formHistorial = document.getElementById('form-historial');
const selectUsuarioHistorial = document.getElementById('historial-usuario');
const selectCancionHistorial = document.getElementById('historial-cancion');
const tbodyHistorial = document.getElementById('tbody-historial');
const tablaHistorial = document.getElementById('tabla-historial');
const cargaHistorial = document.getElementById('carga-historial');
const contadorHistorial = document.getElementById('contador-historial');
const errorHistorialUsuario = document.getElementById('error-historial-usuario');
const errorHistorialCancion = document.getElementById('error-historial-cancion');

async function cargarSelectUsuarios() {
    if (!selectUsuarioHistorial) return;
    selectUsuarioHistorial.innerHTML = '<option value="">-- Seleccionar Oyente --</option>';
    try {
        const resp = await fetchAPI('/api/usuarios');
        let listaUsuarios = extraerArreglo(resp);

        if (listaUsuarios && listaUsuarios.length > 0) {
            listaUsuarios.forEach(u => {
                const option = document.createElement('option');
                option.value = u.id;
                option.textContent = `${u.nombre} (${u.email})`;
                selectUsuarioHistorial.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Error en selector de usuarios:", err);
    }
}

async function cargarSelectCanciones() {
    if (!selectCancionHistorial) return;
    selectCancionHistorial.innerHTML = '<option value="">-- Seleccionar Canción --</option>';
    try {
        const resp = await fetchAPI('/api/canciones');
        let listaCanciones = extraerArreglo(resp);

        if (listaCanciones && listaCanciones.length > 0) {
            listaCanciones.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `🎵 ${c.titulo}`;
                selectCancionHistorial.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Error en selector de canciones:", err);
    }
}

async function cargarHistorial() {
    try {
        const resp = await fetchAPI('/api/historial');
        if (cargaHistorial) cargaHistorial.style.display = 'none';

        let lista = extraerArreglo(resp);

        if (lista.length === 0) {
            if (tablaHistorial) tablaHistorial.style.display = 'none';
            if (cargaHistorial) {
                cargaHistorial.textContent = 'No hay reproducciones recientes.';
                cargaHistorial.style.display = 'block';
            }
        } else {
            if (tablaHistorial) tablaHistorial.style.display = 'table';
            if (tbodyHistorial) {
                tbodyHistorial.innerHTML = '';
                lista.forEach(h => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${h.id}</td>
                        <td>${escapeHtml(h.usuario_nombre)}</td>
                        <td><strong>${escapeHtml(h.cancion_titulo)}</strong></td>
                        <td>${escapeHtml(h.artista_nombre || 'Desconocido')}</td>
                        <td>${escapeHtml(h.cancion_duracion)}</td>
                        <td>${formatearFechaHora(h.fecha_escucha)}</td>
                        <td>
                            <button class="btn-eliminar" onclick="confirmarEliminarHistorial(${h.id})">Quitar</button>
                        </td>
                    `;
                    tbodyHistorial.appendChild(fila);
                });
            }
        }
        if (contadorHistorial) contadorHistorial.textContent = `${lista.length}`;
    } catch (error) {
        console.error(error);
    }
}

function validarFormHistorial() {
    let ok = true;

    if (!selectUsuarioHistorial || !selectUsuarioHistorial.value) {
        if (errorHistorialUsuario) errorHistorialUsuario.textContent = 'Selecciona un usuario oyente';
        selectUsuarioHistorial.classList.add('input-error');
        ok = false;
    } else {
        if (errorHistorialUsuario) errorHistorialUsuario.textContent = '';
        selectUsuarioHistorial.classList.remove('input-error');
    }

    if (!selectCancionHistorial || !selectCancionHistorial.value) {
        if (errorHistorialCancion) errorHistorialCancion.textContent = 'Selecciona una canción';
        selectCancionHistorial.classList.add('input-error');
        ok = false;
    } else {
        if (errorHistorialCancion) errorHistorialCancion.textContent = '';
        selectCancionHistorial.classList.remove('input-error');
    }

    return ok;
}

if (formHistorial) {
    formHistorial.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validarFormHistorial()) return;

        try {
            await fetchAPI('/api/historial', {
                method: 'POST',
                body: JSON.stringify({
                    usuario_id: parseInt(selectUsuarioHistorial.value),
                    cancion_id: parseInt(selectCancionHistorial.value)
                })
            });

            mostrarNotificacion(`Escucha registrada de manera exitosa`, 'exito');
            formHistorial.reset();
            cargarHistorial();
        } catch (error) {
            mostrarNotificacion(error.message, 'error');
        }
    });
}

function confirmarEliminarHistorial(id) {
    if (confirm('¿Remover esta entrada de reproducción del historial?')) {
        eliminarHistorial(id);
    }
}

async function eliminarHistorial(id) {
    try {
        await fetchAPI(`/api/historial/${id}`, { method: 'DELETE' });
        mostrarNotificacion('Entrada de historial removida', 'exito');
        cargarHistorial();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}


// ============================================================
// 6. NAVEGACIÓN POR PESTAÑAS (TABS)
// ============================================================
async function cambiarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    const targetSeccion = document.getElementById(`seccion-${seccion}`);
    if (targetSeccion) targetSeccion.style.display = 'block';

    const tabs = Array.from(document.querySelectorAll('.tab'));
    const tabActiva = tabs.find(t => t.getAttribute('onclick')?.includes(`'${seccion}'`));
    if (tabActiva) tabActiva.classList.add('active');

    if (seccion === 'canciones') {
        await cargarSelectArtistas(); 
        cargarCanciones();            
    } else if (seccion === 'historial') {
        await cargarSelectUsuarios();  
        await cargarSelectCanciones(); 
        cargarHistorial();             
    } else if (seccion === 'artistas') {
        cargarArtistas();
    } else if (seccion === 'usuarios') {
        cargarUsuarios();
    }
}


// ============================================================
// 7. INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar primero los datos de las tablas principales
    cargarUsuarios();
    cargarArtistas();
    cargarCanciones();
    cargarHistorial();
    
    // 2. ¡CRÍTICO! Rellenar los selectores (dropdowns) de los formularios
    if (typeof cargarSelectArtistas === 'function') cargarSelectArtistas();
    if (typeof cargarSelectUsuarios === 'function') cargarSelectUsuarios();
    if (typeof cargarSelectCanciones === 'function') cargarSelectCanciones();
});