/* Actividades Académicas - lógica de la PWA */
const APP_VERSION = '1.2.0';
const TEXTO_BIENVENIDA = 'Bienvenido: tu espacio académico está actualizado y listo para organizar tus entregas.';
const LS_KEY = 'actividades.v1';
const LS_CONSEJO = 'consejo.cache';

const $app = document.getElementById('app');
const $toast = document.getElementById('toast');

/* ---------- Almacenamiento local ---------- */
function cargar() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function guardar(lista) { localStorage.setItem(LS_KEY, JSON.stringify(lista)); }

/* ---------- Utilidades ---------- */
function esc(t) {
  const d = document.createElement('div');
  d.textContent = t == null ? '' : String(t);
  return d.innerHTML;
}
function hoyISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function fmtFecha(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function toast(msg) {
  $toast.textContent = msg;
  $toast.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { $toast.hidden = true; }, 3000);
}
function nuevoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function vencida(a) { return a.estado !== 'hecha' && a.fecha < hoyISO(); }

/* ---------- Vistas ---------- */
function vistaInicio() {
  const lista = cargar();
  const pend = lista.filter(a => a.estado !== 'hecha').length;
  const hechas = lista.filter(a => a.estado === 'hecha').length;
  const venc = lista.filter(vencida).length;
  const proximas = lista.filter(a => a.estado !== 'hecha')
    .sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 3);

  $app.innerHTML = `
    <h2>Inicio</h2>
    <p id="bienvenida">${esc(TEXTO_BIENVENIDA)}</p>
    <div class="grid">
      <div class="card stat"><strong>${pend}</strong>Pendientes</div>
      <div class="card stat"><strong>${hechas}</strong>Hechas</div>
      <div class="card stat"><strong>${venc}</strong>Vencidas</div>
    </div>
    <div class="card">
      <h3>Próximas entregas</h3>
      ${proximas.length ? proximas.map(a => `
        <p><strong>${esc(a.titulo)}</strong><br>
        <span class="meta">${esc(a.materia)} · ${fmtFecha(a.fecha)}</span></p>`).join('')
        : '<p class="vacio">No tienes entregas pendientes.</p>'}
    </div>
    <div class="card">
      <h3>💡 Consejo del día</h3>
      <p id="consejo">Cargando…</p>
    </div>`;
  cargarConsejo();
}

async function cargarConsejo() {
  const el = document.getElementById('consejo');
  try {
    const r = await fetch('data/consejos.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const consejos = await r.json();
    if (!Array.isArray(consejos) || !consejos.length) {
      throw new Error('El respaldo local de consejos está vacío o no es válido');
    }
    const respaldo = consejos[Math.floor(Math.random() * consejos.length)];
    const guardado = localStorage.getItem(LS_CONSEJO);
    if (el) el.textContent = guardado
      ? guardado + ' (guardado sin conexión)'
      : respaldo + ' (respaldo local)';
  } catch {
    const guardado = localStorage.getItem(LS_CONSEJO);
    if (el) el.textContent = guardado
      ? guardado + ' (guardado sin conexión)'
      : 'No se pudo obtener el consejo: sin conexión.';
    return;
  }

  try {
    const controller = new AbortController();
    let timeoutId;
    const request = fetch('https://dummyjson.com/quotes/random', {
      cache: 'no-store',
      signal: controller.signal
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
    const timeout = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Tiempo de espera agotado al consultar el consejo.'));
      }, 4000);
    });
    const consejo = await Promise.race([request, timeout]).finally(() => clearTimeout(timeoutId));
    if (typeof consejo.quote !== 'string' || typeof consejo.author !== 'string') {
      throw new Error('Respuesta inválida del servicio de consejos');
    }
    const texto = `${consejo.quote} — ${consejo.author}`;
    localStorage.setItem(LS_CONSEJO, texto);
    if (el) el.textContent = texto;
  } catch (error) {
    console.error('No se pudo actualizar el consejo remoto', error);
  }
}

let editandoId = null;

function vistaActividades() {
  $app.innerHTML = `
    <h2>Actividades</h2>
    <form id="form" class="card" novalidate>
      <h3 id="form-titulo">Nueva actividad</h3>
      <label for="titulo">Título</label>
      <input id="titulo" name="titulo" maxlength="80" required>
      <div class="error" id="err-titulo"></div>

      <label for="materia">Materia</label>
      <input id="materia" name="materia" maxlength="60" required>
      <div class="error" id="err-materia"></div>

      <label for="fecha">Fecha de entrega</label>
      <input id="fecha" name="fecha" type="date" required>
      <div class="error" id="err-fecha"></div>

      <label for="prioridad">Prioridad</label>
      <select id="prioridad" name="prioridad">
        <option value="alta">Alta</option>
        <option value="media" selected>Media</option>
        <option value="baja">Baja</option>
      </select>

      <label for="estado">Estado</label>
      <select id="estado" name="estado">
        <option value="pendiente" selected>Pendiente</option>
        <option value="progreso">En progreso</option>
        <option value="hecha">Hecha</option>
      </select>

      <label for="notas">Notas</label>
      <textarea id="notas" name="notas" rows="3" maxlength="300"></textarea>

      <div class="acciones">
        <button class="btn" type="submit" id="btn-guardar">Guardar</button>
        <button class="btn btn-sec" type="button" id="btn-cancelar" hidden>Cancelar edición</button>
      </div>
    </form>

    <div class="filtros">
      <div>
        <label for="buscar" class="meta">Buscar</label>
        <input id="buscar" type="search" placeholder="Título o materia">
      </div>
      <div>
        <label for="filtro" class="meta">Mostrar</label>
        <select id="filtro">
          <option value="todas">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="progreso">En progreso</option>
          <option value="hecha">Hechas</option>
        </select>
      </div>
    </div>
    <div id="lista"></div>`;

  document.getElementById('form').addEventListener('submit', onGuardar);
  document.getElementById('btn-cancelar').addEventListener('click', () => {
    editandoId = null; vistaActividades();
  });
  document.getElementById('buscar').addEventListener('input', pintarLista);
  document.getElementById('filtro').addEventListener('change', pintarLista);
  document.getElementById('lista').addEventListener('click', onAccionLista);
  document.getElementById('fecha').value = hoyISO();

  if (editandoId) precargarEdicion();
  pintarLista();
}

function validar(datos) {
  const errores = {};
  if (datos.titulo.trim().length < 3) errores.titulo = 'El título debe tener al menos 3 caracteres.';
  if (!datos.materia.trim()) errores.materia = 'Escribe la materia.';
  if (!datos.fecha) errores.fecha = 'Selecciona una fecha de entrega.';
  return errores;
}

function onGuardar(e) {
  e.preventDefault();
  const f = e.target;
  const datos = {
    titulo: f.titulo.value, materia: f.materia.value, fecha: f.fecha.value,
    prioridad: f.prioridad.value, estado: f.estado.value, notas: f.notas.value
  };
  const errores = validar(datos);
  ['titulo', 'materia', 'fecha'].forEach(c => {
    document.getElementById('err-' + c).textContent = errores[c] || '';
  });
  if (Object.keys(errores).length) {
    f[Object.keys(errores)[0]].focus();
    return;
  }
  datos.titulo = datos.titulo.trim();
  datos.materia = datos.materia.trim();
  datos.notas = datos.notas.trim();

  const lista = cargar();
  if (editandoId) {
    const i = lista.findIndex(a => a.id === editandoId);
    if (i >= 0) lista[i] = { ...lista[i], ...datos };
    toast('Actividad actualizada');
  } else {
    lista.push({ id: nuevoId(), creada: Date.now(), ...datos });
    toast('Actividad registrada');
  }
  guardar(lista);
  editandoId = null;
  vistaActividades();
}

function precargarEdicion() {
  const a = cargar().find(x => x.id === editandoId);
  if (!a) { editandoId = null; return; }
  const f = document.getElementById('form');
  f.titulo.value = a.titulo; f.materia.value = a.materia; f.fecha.value = a.fecha;
  f.prioridad.value = a.prioridad; f.estado.value = a.estado; f.notas.value = a.notas || '';
  document.getElementById('form-titulo').textContent = 'Editar actividad';
  document.getElementById('btn-guardar').textContent = 'Guardar cambios';
  document.getElementById('btn-cancelar').hidden = false;
}

function pintarLista() {
  const q = document.getElementById('buscar').value.trim().toLowerCase();
  const filtro = document.getElementById('filtro').value;
  const lista = cargar()
    .filter(a => filtro === 'todas' || a.estado === filtro)
    .filter(a => !q || a.titulo.toLowerCase().includes(q) || a.materia.toLowerCase().includes(q))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const cont = document.getElementById('lista');
  if (!lista.length) {
    cont.innerHTML = '<p class="vacio">No hay actividades que mostrar.</p>';
    return;
  }
  const nombreEstado = { pendiente: 'Pendiente', progreso: 'En progreso', hecha: 'Hecha' };
  cont.innerHTML = lista.map(a => `
    <article class="card item ${a.estado === 'hecha' ? 'hecha' : ''}" data-id="${esc(a.id)}">
      <h3>${esc(a.titulo)}</h3>
      <div>
        <span class="chip chip-${esc(a.prioridad)}">${esc(a.prioridad.toUpperCase())}</span>
        <span class="chip chip-estado">${nombreEstado[a.estado]}</span>
      </div>
      <div class="meta">${esc(a.materia)} · Entrega:
        <span class="${vencida(a) ? 'vencida' : ''}">${fmtFecha(a.fecha)}${vencida(a) ? ' (vencida)' : ''}</span>
      </div>
      ${a.notas ? `<div class="meta">${esc(a.notas)}</div>` : ''}
      <div class="acciones">
        <button class="btn btn-small btn-sec" data-accion="hecha">${a.estado === 'hecha' ? 'Reabrir' : 'Marcar hecha'}</button>
        <button class="btn btn-small btn-sec" data-accion="editar">Editar</button>
        <button class="btn btn-small btn-peligro" data-accion="eliminar">Eliminar</button>
      </div>
    </article>`).join('');
}

function onAccionLista(e) {
  const btn = e.target.closest('button[data-accion]');
  if (!btn) return;
  const id = btn.closest('[data-id]').dataset.id;
  const lista = cargar();
  const i = lista.findIndex(a => a.id === id);
  if (i < 0) return;

  if (btn.dataset.accion === 'editar') {
    editandoId = id; vistaActividades();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (btn.dataset.accion === 'hecha') {
    lista[i].estado = lista[i].estado === 'hecha' ? 'pendiente' : 'hecha';
    guardar(lista); pintarLista();
  } else if (btn.dataset.accion === 'eliminar') {
    if (confirm(`¿Eliminar "${lista[i].titulo}"?`)) {
      lista.splice(i, 1); guardar(lista); pintarLista();
      toast('Actividad eliminada');
    }
  }
}

let eventoInstalar = null;

function vistaAjustes() {
  const permiso = ('Notification' in window) ? Notification.permission : 'no disponible';
  $app.innerHTML = `
    <h2>Ajustes</h2>
    <div class="card">
      <h3>Notificaciones</h3>
      <p class="meta">Permiso actual: <strong id="permiso">${esc(permiso)}</strong></p>
      <div class="acciones">
        <button class="btn" id="btn-permiso">Activar notificaciones</button>
        <button class="btn btn-sec" id="btn-prueba">Enviar notificación de prueba</button>
      </div>
    </div>
    <div class="card">
      <h3>Instalación</h3>
      <p class="meta" id="info-instalar">Si tu navegador lo permite, puedes instalar la app.</p>
      <button class="btn" id="btn-instalar" hidden>Instalar aplicación</button>
    </div>
    <div class="card">
      <h3>Datos</h3>
      <p class="meta">Las actividades se guardan en este dispositivo (localStorage).</p>
      <button class="btn btn-peligro" id="btn-borrar">Borrar todos los datos</button>
    </div>
    <div class="card">
      <h3>Acerca de</h3>
      <p class="meta">Versión de la app: <strong id="version">${APP_VERSION}</strong></p>
    </div>`;

  document.getElementById('btn-permiso').addEventListener('click', pedirPermiso);
  document.getElementById('btn-prueba').addEventListener('click', notificarPrueba);
  document.getElementById('btn-borrar').addEventListener('click', () => {
    if (confirm('¿Borrar todas las actividades guardadas?')) {
      localStorage.removeItem(LS_KEY); toast('Datos borrados');
    }
  });
  const btnInst = document.getElementById('btn-instalar');
  if (eventoInstalar) btnInst.hidden = false;
  btnInst.addEventListener('click', instalar);
}

async function pedirPermiso() {
  if (!('Notification' in window)) { toast('Tu navegador no soporta notificaciones'); return; }
  const p = await Notification.requestPermission();
  const el = document.getElementById('permiso');
  if (el) el.textContent = p;
  toast('Permiso: ' + p);
}

async function notificarPrueba() {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    toast('Primero activa las notificaciones'); return;
  }
  const reg = await navigator.serviceWorker.ready;
  reg.showNotification('Actividades Académicas', {
    body: 'Las notificaciones funcionan correctamente.',
    icon: 'icons/icon-192.png'
  });
}

/* Avisa al abrir la app si hay entregas para hoy o vencidas */
async function avisarEntregas() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const urgentes = cargar().filter(a => a.estado !== 'hecha' && a.fecha <= hoyISO());
  if (!urgentes.length) return;
  const reg = await navigator.serviceWorker.ready;
  reg.showNotification('Entregas pendientes', {
    body: `Tienes ${urgentes.length} actividad(es) para hoy o vencidas.`,
    icon: 'icons/icon-192.png', tag: 'entregas'
  });
}

/* ---------- Instalación ---------- */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  eventoInstalar = e;
  const b = document.getElementById('btn-instalar');
  if (b) b.hidden = false;
});
async function instalar() {
  if (!eventoInstalar) return;
  eventoInstalar.prompt();
  await eventoInstalar.userChoice;
  eventoInstalar = null;
  const b = document.getElementById('btn-instalar');
  if (b) b.hidden = true;
}
window.addEventListener('appinstalled', () => toast('Aplicación instalada'));

/* ---------- Router ---------- */
const rutas = { inicio: vistaInicio, actividades: vistaActividades, ajustes: vistaAjustes };

function enrutar() {
  const ruta = (location.hash.replace('#/', '') || 'inicio');
  const vista = rutas[ruta] || vistaInicio;
  if (ruta !== 'actividades') editandoId = null;
  vista();
  document.querySelectorAll('.tabbar a').forEach(a =>
    a.classList.toggle('activa', a.dataset.ruta === (rutas[ruta] ? ruta : 'inicio')));
  document.title = 'Actividades Académicas';
}
window.addEventListener('hashchange', enrutar);

/* ---------- Estado de red ---------- */
function actualizarRed() {
  const el = document.getElementById('estado-red');
  const online = navigator.onLine;
  el.textContent = online ? 'En línea' : 'Sin conexión';
  el.className = 'badge ' + (online ? 'badge-online' : 'badge-offline');
}
window.addEventListener('online', () => { actualizarRed(); toast('Conexión restablecida'); });
window.addEventListener('offline', () => { actualizarRed(); toast('Trabajando sin conexión'); });

/* ---------- Service Worker y actualizaciones ---------- */
function registrarSW() {
  if (!('serviceWorker' in navigator)) return;
  const banner = document.getElementById('banner-actualizacion');
  let recargando = false;

  navigator.serviceWorker.register('sw.js').then(reg => {
    function mostrarBanner(worker) {
      banner.hidden = false;
      document.getElementById('btn-actualizar').onclick = () => worker.postMessage({ tipo: 'SKIP_WAITING' });
    }
    if (reg.waiting && navigator.serviceWorker.controller) mostrarBanner(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nuevo = reg.installing;
      nuevo.addEventListener('statechange', () => {
        if (nuevo.state === 'installed' && navigator.serviceWorker.controller) mostrarBanner(nuevo);
      });
    });
    // Busca versiones nuevas cada vez que se abre la app
    reg.update().catch(() => {});
  }).catch(err => console.error('Error al registrar el Service Worker', err));

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando) return;
    recargando = true;
    location.reload();
  });
}

/* ---------- Inicio ---------- */
actualizarRed();
enrutar();
registrarSW();
window.addEventListener('load', () => setTimeout(avisarEntregas, 1500));
