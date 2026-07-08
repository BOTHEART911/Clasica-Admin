/* =================================================================
   ADMIN CLÁSICA — App de administración
   Rediseño alineado con CLÁSICA 2026 (participante): mismo design
   system, loader global, login por pestañas, selector iOS de fecha,
   modal dinámico de registro, driveImg_ y formateadores en español.
   Comparte el MISMO backend Apps Script (/exec, POST text/plain).
   ================================================================= */

/* URL /exec del Web App de Apps Script (misma que el frontend participante). */
const API_BASE = 'https://script.google.com/macros/s/AKfycbxnc3ajRaV6-v9TSfBnVEdYUyWSKcTkbJlHsjpUV6UHJ--I9euyVdRIJrvpStGA-FBR/exec';

const ESTADOS = ['INSCRITO', 'ACTIVO', 'EN_COMPETENCIA', 'FINALIZADO', 'DESCALIFICADO', 'NO_PRESENTADO'];
const ESTADO_LBL = {
  INSCRITO: 'Inscrito', ACTIVO: 'Activo', EN_COMPETENCIA: 'En competencia',
  FINALIZADO: 'Finalizado', DESCALIFICADO: 'Descalificado', NO_PRESENTADO: 'No presentado'
};

/* ---------- estado ---------- */
const A = {
  admin: null, cfg: {}, cats: [], eps: [], rh: [], textos: {},
  inscritos: [], kpis: null, coms: [], poll: null,
  fechaNac: '', catActualPref: ''
};

const $ = (id) => document.getElementById(id);
const $$ = (sel, c = document) => Array.from(c.querySelectorAll(sel));

/* ---------- íconos SVG inline ---------- */
const IC = {
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>',
  starFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
  open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'
};

/* ================= LOADER GLOBAL ================= */
const loaderEl = $('loader');
let loadingCount = 0, loaderTimer = null;
function startLoading() { loadingCount++; if (loadingCount === 1) { loaderTimer = setTimeout(() => { loaderEl.classList.remove('hidden'); loaderTimer = null; }, 120); } }
function stopLoading() { if (loadingCount === 0) return; loadingCount--; if (loadingCount === 0) { if (loaderTimer) { clearTimeout(loaderTimer); loaderTimer = null; } loaderEl.classList.add('hidden'); } }

/* ================= API (POST text/plain evita preflight CORS) ================= */
async function api(action, payload = {}, opts = {}) {
  if (!opts.silent) startLoading();
  try {
    const body = Object.assign({ action }, payload);
    if (A.admin) { body.__uid = A.admin.id; body.__uname = A.admin.nombre; }
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Error del servidor');
    return json.data;
  } finally {
    if (!opts.silent) stopLoading();
  }
}

const toast = (t, i = 'info') => Swal.fire({ text: t, icon: i, confirmButtonColor: '#14231c' });
const textoDe = (clave) => (A.textos[clave] || {}).CUERPO || '';

/* Premio: numérico → moneda ($500.000); texto (ej. "Sorpresa") → tal cual. */
const fmtPremio = (v) => {
  const s = String(v == null ? '' : v).trim();
  if (!s) return '—';
  if (/[^\d.,\s$]/.test(s)) return s;
  const n = Number(s.replace(/[^\d]/g, ''));
  return isNaN(n) ? s : '$' + n.toLocaleString('es-CO');
};

/* ================= IMAGEN Y FECHA ================= */
/* Normaliza cualquier URL de foto a un formato renderizable en <img>.
   Drive → thumbnail?id=...&sz=w1000 ; otras (Cloudinary…) → tal cual ; vacío → default. */
function driveImg_(url) {
  const s = String(url || '');
  if (!s) return A.cfg.ICONO_USUARIO_DEFAULT || '';
  const m = s.match(/\/d\/([a-zA-Z0-9_-]+)/) || s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (!m) return s;
  return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1000';
}
/* Devuelve el fileId de una URL de Drive (para previsualización embebida). */
function driveId_(url) {
  const s = String(url || '');
  const m = s.match(/\/d\/([a-zA-Z0-9_-]+)/) || s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : '';
}

const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function parseFecha_(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : v;
  const s = String(v).trim();
  /* Con zona horaria explícita (Z u offset ±HH:MM) respétala: evita el desfase
     de día/hora cuando una celda de tipo Fecha se serializa como UTC. */
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
    const dz = new Date(s);
    if (!isNaN(dz)) return dz;
  }
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(s); return isNaN(d) ? null : d;
}
/* Escapa HTML y convierte saltos de línea en <br> (texto de comunicados). */
function escHtml_(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function nl2br_(s) { return escHtml_(s).replace(/\r\n|\r|\n/g, '<br>'); }
/* "Domingo, 5 de julio de 2026 - 12:04 PM" */
function fechaLargaEs_(v) {
  const d = parseFecha_(v); if (!d) return String(v || '—');
  let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (h === 0) h = 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${DIAS_ES[d.getDay()]}, ${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()} - ${h}:${mm} ${ap}`;
}
/* "16 de enero de 1989" */
function fechaTextoDia_(iso) {
  const d = parseFecha_(iso); if (!d) return String(iso || '—');
  return `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}
/* YYYY-MM-DD a partir de cualquier valor de fecha. */
function soloFechaISO_(v) {
  const d = parseFecha_(v); if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/* Edad cumplida hoy a partir de una fecha de nacimiento (cualquier formato). */
function edadDe_(v) {
  const d = parseFecha_(v); if (!d) return null;
  const hoy = new Date();
  let e = hoy.getFullYear() - d.getFullYear();
  const m = hoy.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) e--;
  return e;
}
const escAttr_ = (s) => String(s == null ? '' : s).replace(/"/g, '&quot;');

/* ================= ARRANQUE ================= */
(function init() {
  const ver = 'v' + (window.APP_VERSION || '1.0.0');
  $('loginVersion').textContent = ver;
  buildPinKeypad();

  /* Login: pestañas */
  $$('.login-tab').forEach(t => t.addEventListener('click', () => cambiarPane(t.dataset.pane)));

  /* Ojo mostrar/ocultar documento */
  const eye = $('eyeDoc'); eye.innerHTML = IC.eye;
  eye.addEventListener('click', () => {
    const inp = $('loginDoc'); const oculto = inp.type === 'password';
    inp.type = oculto ? 'text' : 'password';
    eye.innerHTML = oculto ? IC.eyeOff : IC.eye;
  });

  $('btnLogin').onclick = () => doLogin($('loginDoc').value);
  $('loginDoc').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin($('loginDoc').value); });

  /* Picker iOS */
  $('iosp-cancel').addEventListener('click', () => $('ios-picker').classList.add('hidden'));
  $$('.iosp-arrow').forEach(b => b.addEventListener('click', () => iospNudge_(b.dataset.col, +b.dataset.d)));
  $('iosp-ok').addEventListener('click', iospConfirmar_);
})();

/* ================= LOGIN ================= */
function cambiarPane(pane) {
  $$('.login-tab').forEach(t => t.classList.toggle('active', t.dataset.pane === pane));
  $('pane-doc').classList.toggle('active', pane === 'doc');
  $('pane-pin').classList.toggle('active', pane === 'pin');
  if (pane === 'pin') { pinBuffer = ''; pintarPinDots(); }
}

let pinBuffer = '';
function buildPinKeypad() {
  const pad = $('pinKeypad');
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  pad.innerHTML = keys.map(k => k === '' ? '<div></div>'
    : `<button class="pin-key ${k === '⌫' ? 'action' : ''}" data-k="${k}">${k}</button>`).join('');
  $$('.pin-key', pad).forEach(b => b.addEventListener('click', () => pinTecla(b.dataset.k)));
}
function pintarPinDots() { $$('#pinPad .pin-dot').forEach((d, i) => d.classList.toggle('filled', i < pinBuffer.length)); }
function pinTecla(k) {
  if (k === '⌫') { pinBuffer = pinBuffer.slice(0, -1); pintarPinDots(); return; }
  if (pinBuffer.length >= 4) return;
  pinBuffer += k; pintarPinDots();
  if (pinBuffer.length === 4) doLogin(pinBuffer);
}

async function doLogin(valor) {
  const u = String(valor || '').replace(/\D/g, '');
  if (!u) { pinBuffer = ''; pintarPinDots(); return toast('Ingresa tu cédula o PIN de administrador.', 'warning'); }
  try {
    const r = await api('loginAdmin', { usuario: u });
    A.admin = r.admin;
    A.cfg = r.config || {};
    aplicarMarca_();
    aplicarPermisos_();               // muestra/oculta la pestaña Configuración
    $('adminNombre').textContent = A.admin.nombre;
    $('view-login').classList.remove('active');
    $('appShell').classList.remove('hidden');
    wireApp();
    await cargarTodo();
    iniciarPolling();
  } catch (e) {
    pinBuffer = ''; pintarPinDots();
    toast(e.message, 'error');
  }
}

/* Aplica ícono de app (favicon incluido) y banner institucional. */
function aplicarMarca_() {
  const icon = A.cfg.ICONO_APP || '';
  if (icon) {
    ['favicon', 'appleicon'].forEach(id => { const el = $(id); if (el) el.href = icon; });
    ['loaderIcon', 'loginIcono', 'appLogo'].forEach(id => { const el = $(id); if (el) el.src = icon; });
  }
  const banner = A.cfg.BANNER_APP || '';
  if (banner) {
    const b = $('headerBanner'); if (b) b.src = banner;
    const lb = $('loginBannerImg'); if (lb) { lb.src = banner; $('loginBanner').classList.remove('hidden'); }
    const bb = $('brandBanner'); if (bb) bb.classList.remove('hidden');
  }
  $('footVersion').textContent = 'v' + (window.APP_VERSION || '1.0.0');
}

/* ¿Este admin puede ver Configuración? Usa el flag del backend (admin.verConfig);
   si aún no lo devuelve, cae a la regla PIN 1109 + OSCAR POLANIA. */
function puedeVerConfig_() {
  if (!A.admin) return false;
  if (typeof A.admin.verConfig === 'boolean') return A.admin.verConfig;
  const pin = String(A.admin.pin == null ? '' : A.admin.pin).replace(/\D/g, '');
  const nom = String(A.admin.nombre || '').trim().toUpperCase();
  return pin === '1109' && nom === 'OSCAR POLANIA';
}

/* Muestra u oculta la pestaña Configuración según el permiso. */
function aplicarPermisos_() {
  const puede = puedeVerConfig_();
  const tab = document.querySelector('.admin-tab[data-tab="config"]');
  if (tab) tab.style.display = puede ? '' : 'none';
  if (!puede) {
    const sec = $('tab-config'); if (sec) sec.classList.remove('active');
  }
}

/* ================= WIRE DEL SHELL ================= */
function wireApp() {
  $('btnSalir').innerHTML = IC.logout;
  $('btnSalir').onclick = () => location.reload();
  $$('.admin-tab').forEach(t => t.onclick = () => cambiarTab(t.dataset.tab));

  $('fTexto').oninput = renderCards;
  $('fCategoria').onchange = renderCards;
  $('fEstado').onchange = renderCards;
  const selLbl = $('fSeleccionLbl');
  $('fSeleccion').onchange = () => { selLbl.classList.toggle('on', $('fSeleccion').checked); renderCards(); };
  $('btnInscribir').onclick = abrirInscribir;

  $('btnMasivo').onclick = cambioMasivo;
  $('btnCargarPodio').onclick = cargarPodio;
  $('btnGuardarPodio').onclick = guardarPodio;
  $('btnExport').onclick = exportarPdf;

  $('btnPublicar').onclick = publicarComunicado;
  $('cDestacado').addEventListener('change', () => $('cDestacadoLine').classList.toggle('on', $('cDestacado').checked));

  $('btnGuardarConfig').onclick = guardarConfig;
  $('btnRefrescarDocs').onclick = async () => {
    try { await api('refrescarCacheDocs'); toast('Caché de modales actualizada.', 'success'); }
    catch (e) { toast(e.message, 'error'); }
  };
}

function cambiarTab(name) {
  if (name === 'config' && !puedeVerConfig_()) return;   // acceso restringido
  $$('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  $$('.tabview').forEach(v => v.classList.remove('active'));
  $('tab-' + name).classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'dashboard') renderDashboard();
  if (name === 'comunicados') renderComunicadosAdmin();
  if (name === 'config') renderConfig();
}

/* ================= CARGA / POLLING ================= */
async function cargarTodo() {
  // bootstrap trae categorías activas, eps, rh y textos (para el modal de registro)
  try {
    const boot = await api('bootstrap');
    A.cats = boot.categorias || [];
    A.eps = boot.eps || [];
    A.rh = boot.rh || [];
    (boot.textos || []).forEach(t => A.textos[t.CLAVE] = t);
    // completa config con las claves de admin ya recibidas en login
    A.cfg = Object.assign({}, boot.config || {}, A.cfg);
  } catch (e) {
    A.cats = await api('listarCategorias');
  }
  aplicarMarca_();
  llenarSelectsCategorias();
  await refrescarInscritos();
}

async function refrescarInscritos() {
  A.inscritos = await api('listarInscritos', {}, { silent: true });
  A.kpis = await api('dashboardKpis', {}, { silent: true });
  renderKpiStrip();
  renderCards();
}

function iniciarPolling() {
  clearInterval(A.poll);
  A.poll = setInterval(async () => {
    try {
      await refrescarInscritos();
      $('liveDot').style.background = '#7bd88f';
      $('liveTxt').textContent = 'En vivo';
      if ($('tab-dashboard').classList.contains('active')) renderDashboard();
    } catch (e) {
      $('liveDot').style.background = '#e0b34a';
      $('liveTxt').textContent = 'Reintentando';
    }
  }, 15000);
}

function llenarSelectsCategorias() {
  const soloCats = A.cats.map(c => `<option value="${c.PREFIJO}">${c.NOMBRE}</option>`).join('');
  $('fCategoria').innerHTML = '<option value="">Todas las categorías</option>' + soloCats;
  $('mCategoria').innerHTML = soloCats;
  $('rCategoria').innerHTML = soloCats;
  $('eCategoria').innerHTML = '<option value="">Todas las categorías</option>' + soloCats;

  const estOpts = ESTADOS.map(e => `<option value="${e}">${ESTADO_LBL[e]}</option>`).join('');
  $('fEstado').innerHTML = '<option value="">Todos los estados</option>' + estOpts;
  $('mEstadoActual').innerHTML = '<option value="">Cualquier estado</option>' + estOpts;
  $('mEstadoNuevo').innerHTML = estOpts;
  $('eEstado').innerHTML = '<option value="">Todos los estados</option>' + estOpts;
}

/* ================= KPIs ================= */
function renderKpiStrip() {
  const k = A.kpis; if (!k) return;
  const items = [
    ['Total inscritos', k.total, ''], ['Selección Flandes', k.seleccionFlandes, 'gold'],
    ['Inscritos', (k.porEstado.INSCRITO || 0), ''], ['Activos', (k.porEstado.ACTIVO || 0), ''],
    ['En competencia', (k.porEstado.EN_COMPETENCIA || 0), ''], ['Finalizados', (k.porEstado.FINALIZADO || 0), '']
  ];
  $('kpiStrip').innerHTML = items.map(i => `<div class="kpi ${i[2]}"><div class="n">${i[1]}</div><div class="l">${i[0]}</div></div>`).join('');
}

/* ================= INSCRITOS ================= */
function catDe_(pref) { return A.cats.find(c => c.PREFIJO === pref) || null; }
function esMenorCat_(p) { return ['PB', 'PJ'].includes(p); }
function esUnisexCat_(c) {
  const g = String(c.GENERO || '').trim().toUpperCase();
  return ['MIXTO', 'AMBOS', 'UNISEX', 'U', 'MF', 'FM'].includes(g) || c.PREFIJO === 'PB';
}
function categoriasPorGenero_(genero) {
  const g = (genero || '').charAt(0).toUpperCase();
  return A.cats.filter(c =>
    esUnisexCat_(c) ? (g === 'M' || g === 'F')
      : (g === 'F') ? (c.PREFIJO === 'DM' || c.PREFIJO === 'BF')
        : (g === 'M') ? (c.PREFIJO !== 'DM' && c.PREFIJO !== 'BF')
          : false);
}

function filtrar() {
  const q = ($('fTexto').value || '').toLowerCase();
  const cat = $('fCategoria').value, est = $('fEstado').value, sel = $('fSeleccion').checked;
  return A.inscritos.filter(r => {
    if (cat && (r.CAT_PREFIJO || r.CATEGORIA) !== cat) return false;
    if (est && r.ESTADO !== est) return false;
    if (sel && String(r.SELECCION_FLANDES).toUpperCase() !== 'SI') return false;
    if (q && ![r.NOMBRES, r.APELLIDOS, r.DOCUMENTO, r.CODIGO, r.CELULAR, r.CORREO].join(' ').toLowerCase().includes(q)) return false;
    return true;
  });
}

/* Contador de total según los filtros activos (categoría + estado + selección). */
function actualizarContadorFiltro_(n) {
  const el = $('filtroContador'); if (!el) return;
  const cat = $('fCategoria').value, est = $('fEstado').value, sel = $('fSeleccion').checked;
  const partes = [];
  if (cat) { const c = catDe_(cat); partes.push(c ? c.NOMBRE : cat); }
  if (est) partes.push(ESTADO_LBL[est] || est);
  if (sel) partes.push('Selección Flandes');
  const filtro = partes.length ? ' · ' + partes.join(' · ') : ' · Todos';
  el.innerHTML = `Total: <b>${n}</b> corredor${n === 1 ? '' : 'es'}<span class="fc-filtro">${filtro}</span>`;
}

function renderCards() {
  const list = filtrar();
  actualizarContadorFiltro_(list.length);
  if (!list.length) {
    $('cards').innerHTML = '<div class="empty"><div class="big">Sin resultados</div>Ajusta la búsqueda o los filtros para ver corredores.</div>';
    return;
  }
  $('cards').innerHTML = list.map(r => {
    const sel = String(r.SELECCION_FLANDES).toUpperCase() === 'SI';
    const activo = String(r.ESTADO) === 'ACTIVO';
    const foto = driveImg_(r.FOTO || r.FOTO_URL);
    const puesto = r.PUESTO ? `<span class="puesto-tag">${r.PUESTO}° puesto</span>` : '';
    return `<div class="rider-card ${sel ? 'sel' : ''}">
      <div class="rider-top">
        <img class="rider-foto" src="${foto}" alt="" onerror="this.src='${A.cfg.ICONO_USUARIO_DEFAULT || ''}'">
        <div class="rider-id">
          <div class="rider-name">${(r.NOMBRES + ' ' + r.APELLIDOS).trim()} ${sel ? `<span class="star">${IC.starFill}</span>` : ''}</div>
          <div class="rider-meta">${r.CAT_NOMBRE || r.CATEGORIA} · CC ${r.DOCUMENTO}</div>
        </div>
        <div class="rider-code">${r.CODIGO}</div>
      </div>
      <div class="rider-tags">
        <span class="estado-badge estado-${r.ESTADO}">${ESTADO_LBL[r.ESTADO] || r.ESTADO}</span>
        ${sel ? '<span class="sel-tag">★ Selección</span>' : ''}
        ${puesto}
      </div>
      <div class="rider-acts">
        <button class="act-activo ${activo ? 'on' : ''}" onclick="accActivar('${r.CODIGO}')">${IC.power}${activo ? 'Inscrito' : 'Activar'}</button>
        <button class="act-sel ${sel ? 'on' : ''}" onclick="accSeleccion('${r.CODIGO}')">${sel ? IC.starFill : IC.star}Selección</button>
        <button onclick="accDocs('${r.CODIGO}')">${IC.doc}Docs</button>
        <button onclick="accDetalles('${r.CODIGO}')">${IC.info}Detalles</button>
        <button onclick="accEditar('${r.DOCUMENTO}')">${IC.edit}Editar</button>
      </div>
    </div>`;
  }).join('');
}

/* Activar: alterna ACTIVO ↔ INSCRITO (usa el nuevo 'cambiarEstado'). */
async function accActivar(codigo) {
  const r = A.inscritos.find(x => x.CODIGO === codigo); if (!r) return;
  const destino = String(r.ESTADO) === 'ACTIVO' ? 'INSCRITO' : 'ACTIVO';
  try {
    await api('cambiarEstado', { codigo, estado: destino });
    toast('Estado actualizado a ' + (ESTADO_LBL[destino] || destino) + '.', 'success');
    await refrescarInscritos();
  } catch (e) { toast(e.message, 'error'); }
}

async function accSeleccion(codigo) {
  try {
    const r = await api('toggleSeleccion', { codigo });
    toast('Selección Flandes: ' + (String(r.SELECCION_FLANDES).toUpperCase() === 'SI' ? 'activada' : 'retirada') + '.', 'success');
    await refrescarInscritos();
  } catch (e) { toast(e.message, 'error'); }
}

/* ================= MODAL PROPIO REUTILIZABLE ================= */
function cerrarModal() { $('modal-root').innerHTML = ''; }
function abrirModalHtml({ title, html, okText, cancelText = 'Cerrar', onOk, onBack, backText = 'Atrás', wide }) {
  const root = $('modal-root');
  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-card ${wide ? 'wide' : ''}">
        <div class="modal-head">
          <h2>${title}</h2>
          <button class="m-close" data-a="close" aria-label="Cerrar">${IC.close}</button>
        </div>
        <div class="modal-body">${html}</div>
        <div class="modal-foot ${onBack ? 'has-back' : ''}">
          ${onBack ? `<button class="btn btn-ghost" data-a="back">${IC.back} ${backText}</button>` : ''}
          <div class="foot-right">
            <button class="btn btn-ghost" data-a="cancel">${cancelText}</button>
            ${okText ? `<button class="btn btn-primary" data-a="ok">${okText}</button>` : ''}
          </div>
        </div>
      </div>
    </div>`;
  const host = root.querySelector('.modal-card');
  host.querySelectorAll('.check-line input').forEach(inp =>
    inp.addEventListener('change', () => inp.closest('.check-line').classList.toggle('on', inp.checked)));
  // Si hay "Atrás", la X del encabezado también vuelve (no cierra de una vez).
  root.querySelector('[data-a="close"]').onclick = onBack || cerrarModal;
  root.querySelector('[data-a="cancel"]').onclick = cerrarModal;
  const backBtn = root.querySelector('[data-a="back"]');
  if (backBtn) backBtn.onclick = onBack;
  const okBtn = root.querySelector('[data-a="ok"]');
  if (okBtn) okBtn.onclick = () => onOk && onOk(host);
  return host;
}

/* ================= DETALLES ================= */
function accDetalles(codigo) {
  const r = A.inscritos.find(x => x.CODIGO === codigo); if (!r) return;
  const menor = esMenorCat_(r.CAT_PREFIJO || r.CATEGORIA);
  const edad = edadDe_(r.FECHA_NACIMIENTO);
  const filas = [
    ['Documento', r.DOCUMENTO],
    ['Género', r.GENERO],
    ['RH', r.RH_CORTO || r.RH],
    ['Celular', r.CELULAR],
    ['EPS', r.EPS],
    ['Correo', r.CORREO],
    ['Procedencia', (r.MUNICIPIO || '') + ', ' + (r.DEPARTAMENTO || '')],
    [menor ? 'Acudiente' : 'Contacto emergencia', (r.CONTACTO_EMERGENCIA || '—') + ' · ' + (r.TEL_EMERGENCIA || '')],
    ...(menor ? [['Doc. acudiente', r.ACUDIENTE_DOC || '—']] : []),
    ['Categoría', r.CAT_NOMBRE || r.CATEGORIA],
    ['Recorrido', (r.VUELTAS || '—') + ' vueltas · ' + (r.KM || '—') + ' km'],
    ['Nacimiento', fechaTextoDia_(r.FECHA_NACIMIENTO) + (edad != null ? ` (${edad} años)` : '')],
    ['Estado', ESTADO_LBL[r.ESTADO] || r.ESTADO],
    ['Selección Flandes', String(r.SELECCION_FLANDES).toUpperCase() === 'SI' ? 'Sí' : 'No'],
    ['Puesto', r.PUESTO ? r.PUESTO + '°' : '—'],
    ['Inscripción', fechaLargaEs_(r.FECHA_INSCRIPCION)],
    ['Última actualización', fechaLargaEs_(r.FECHA_ACTUALIZACION)]
  ];
  const html = `
    <div class="detalle-head">
      <img src="${driveImg_(r.FOTO || r.FOTO_URL)}" alt="" onerror="this.src='${A.cfg.ICONO_USUARIO_DEFAULT || ''}'">
      <div>
        <div class="dh-name">${(r.NOMBRES + ' ' + r.APELLIDOS).trim()}</div>
        <div class="dh-sub">Dorsal <b>${r.CODIGO}</b> · ${r.CAT_NOMBRE || r.CATEGORIA}</div>
      </div>
    </div>
    <div class="detalle-list">
      ${filas.map(f => `<div class="row"><span class="k">${f[0]}</span><span class="v">${f[1] == null || f[1] === '' ? '—' : f[1]}</span></div>`).join('')}
    </div>`;
  abrirModalHtml({ title: 'Detalles del corredor', html, cancelText: 'Cerrar' });
}

/* ================= DOCUMENTOS (visor embebido) ================= */
async function accDocs(codigo) {
  const r = A.inscritos.find(x => x.CODIGO === codigo);
  const menor = r && esMenorCat_(r.CAT_PREFIJO || r.CATEGORIA);
  try {
    const d = await api('verDocumentos', { codigo });
    const docs = [
      ['Dorsal', d.dorsal, 'Número de competencia'],
      ['Reglamento', d.reglamento, 'Reglamento firmado'],
      ['Consentimiento', d.consentimiento, 'Consentimiento informado'],
      ...(menor ? [['Autorización de menor', d.autorizacion, 'Autorización del acudiente']] : []),
      ['Mención', d.mencion, 'Mención de honor']
    ];
    const nombre = r ? (r.NOMBRES + ' ' + r.APELLIDOS).trim() : codigo;
    const html = `<div class="doc-list">
      ${docs.map(([t, u, s]) => u
        ? `<div class="doc-item avail" onclick="verDoc('${escAttr_(u)}','${escAttr_(t)}','${escAttr_(codigo)}')">
             <span class="doc-ico">${IC.doc}</span>
             <div class="doc-txt"><div class="t">${t}</div><div class="s">${s}</div></div>
             <span class="doc-open">${IC.open}</span>
           </div>`
        : `<div class="doc-item na">
             <span class="doc-ico">${IC.doc}</span>
             <div class="doc-txt"><div class="t">${t}</div><div class="s">No generado</div></div>
           </div>`).join('')}
    </div>
    <p class="muted mt-md">Toca un documento para verlo sin salir de la app.</p>`;
    abrirModalHtml({ title: 'Documentos · ' + nombre, html, cancelText: 'Cerrar' });
  } catch (e) { toast(e.message, 'error'); }
}

function verDoc(url, titulo, codigo) {
  const id = driveId_(url);
  const preview = id ? 'https://drive.google.com/file/d/' + id + '/preview' : url;
  const descarga = id ? 'https://drive.google.com/uc?export=download&id=' + id : url;
  const html = `
    <iframe class="viewer-frame" src="${escAttr_(preview)}" allow="autoplay"></iframe>
    <div class="viewer-bar">
      <a class="btn btn-ghost btn-sm" href="${escAttr_(descarga)}" download>${IC.download} Descargar</a>
    </div>`;
  abrirModalHtml({
    title: titulo, html, cancelText: 'Cerrar', wide: true,
    backText: 'Documentos',
    onBack: codigo ? () => accDocs(codigo) : cerrarModal
  });
}

/* =================================================================
   MODAL DINÁMICO DE REGISTRO (mismo de CLÁSICA 2026 + Selección)
   ================================================================= */
function opciones_(arr, sel) {
  return arr.map(o => {
    const val = typeof o === 'object' ? o.value : o;
    const lbl = typeof o === 'object' ? o.label : o;
    return `<option value="${escAttr_(val)}" ${val === sel ? 'selected' : ''}>${lbl}</option>`;
  }).join('');
}

function formRegistroHtml_(pre, esEdicion) {
  pre = pre || {};
  const deptos = Object.keys(UBICACIONES).sort();
  const rhOpts = (A.rh || []).map(r => ({ value: r.largo, label: r.largo }));
  const g = pre.GENERO || '';
  const fechaPre = pre.FECHA_NACIMIENTO ? soloFechaISO_(pre.FECHA_NACIMIENTO) : '';
  const fotoPrev = pre.FOTO_URL ? driveImg_(pre.FOTO_URL) : '';
  // EPS: lista + "OTRA"; si el registro tiene una EPS fuera de lista, la conservamos como opción.
  let epsList = [...(A.eps || [])];
  if (pre.EPS && !epsList.includes(pre.EPS) && pre.EPS !== 'OTRA') epsList.push(pre.EPS);
  const selFlandes = String(pre.SELECCION_FLANDES).toUpperCase() === 'SI';
  return `
    <div class="form-grid">
      <div class="fld fld-full"><label>Documento</label>
        <div class="doc-search">
          <input id="f_DOCUMENTO" inputmode="numeric" maxlength="10" value="${escAttr_(pre.DOCUMENTO || '')}" ${(pre.DOCUMENTO || esEdicion) ? 'readonly' : ''}>
          ${esEdicion ? '' : `<button type="button" id="btnBuscarDoc" class="doc-search__btn" aria-label="Consultar documento">${IC.search}<span>Consultar</span></button>`}
        </div>
        <div id="docAviso" class="doc-aviso"></div>
      </div>
      <div class="fld"><label>Nombres</label><input id="f_NOMBRES" style="text-transform:uppercase" value="${escAttr_(pre.NOMBRES || '')}"></div>
      <div class="fld"><label>Apellidos</label><input id="f_APELLIDOS" style="text-transform:uppercase" value="${escAttr_(pre.APELLIDOS || '')}"></div>
      <div class="fld"><label>Género</label><select id="f_GENERO"><option value="">—</option>${opciones_([{ value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }], g)}</select></div>
      <div class="fld"><label>RH</label><select id="f_RH"><option value="">—</option>${opciones_(rhOpts, pre.RH)}</select></div>
      <div class="fld"><label>Celular (10 dígitos)</label><input id="f_CELULAR" inputmode="numeric" maxlength="10" value="${escAttr_(pre.CELULAR || '')}"></div>
      <div class="fld"><label>EPS</label><select id="f_EPS"><option value="">—</option>${opciones_([...epsList, 'OTRA'], pre.EPS)}</select></div>
      <div class="fld fld-full" id="epsOtraSlot" style="display:none"><label>¿Cuál EPS?</label><input id="f_EPS_OTRA" style="text-transform:uppercase" placeholder="Nombre de la EPS"></div>
      <div class="fld fld-full"><label>Correo</label><input id="f_CORREO" type="email" value="${escAttr_(pre.CORREO || '')}"></div>
      <div class="fld"><label>Departamento de procedencia</label><select id="f_DEPARTAMENTO"><option value="">—</option>${opciones_(deptos, pre.DEPARTAMENTO)}</select></div>
      <div class="fld"><label>Municipio de procedencia</label><select id="f_MUNICIPIO"><option value="">—</option></select></div>
      <div class="fld"><label id="lbl_contacto">Contacto de emergencia</label><input id="f_CONTACTO_EMERGENCIA" value="${escAttr_(pre.CONTACTO_EMERGENCIA || '')}"></div>
      <div class="fld"><label id="lbl_tel_emerg">Tel. emergencia (10 dígitos)</label><input id="f_TEL_EMERGENCIA" inputmode="numeric" maxlength="10" value="${escAttr_(pre.TEL_EMERGENCIA || '')}"></div>
      <div class="fld fld-full"><label>Categoría</label><select id="f_CATEGORIA"><option value="">Selecciona el género primero</option></select></div>
      <div id="notaMenor" class="nota-menor hidden">Estás inscribiendo a un menor: los datos personales son del niño o niña, y el contacto de emergencia es el de su padre, madre o acudiente.</div>
      <div id="catInfo" class="datos-grid fld-full" style="margin:2px 0"></div>
      <div class="fld fld-full">
        <label>Fecha de nacimiento</label>
        <button type="button" id="btnFecha" class="date-btn">${IC.cal}<span id="btnFechaTxt">${fechaPre ? fechaTextoDia_(fechaPre) : 'Seleccionar fecha'}</span></button>
      </div>
      <div id="autorizacionSlot" class="fld hidden"><label>Documento del acudiente (6–10 dígitos)</label><input id="f_ACUDIENTE_DOC" inputmode="numeric" maxlength="10" value="${escAttr_(pre.ACUDIENTE_DOC || '')}"></div>
      <div class="fld fld-full">
        <label>Foto de perfil (opcional)</label>
        ${fotoPrev ? `<img src="${fotoPrev}" alt="Foto actual" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);margin-bottom:8px">` : ''}
        <input id="f_FOTO" type="file" accept="image/*">
        ${fotoPrev ? '<div class="muted" style="margin-top:4px">Sube una nueva imagen solo si deseas reemplazarla.</div>' : ''}
      </div>
    </div>
    <label class="check-line ${selFlandes ? 'on' : ''}" style="margin-top:14px">
      <input type="checkbox" id="f_SELECCION" ${selFlandes ? 'checked' : ''}>
      <span class="check-box">${IC.check}</span>
      <span class="check-txt"><b>Selección Flandes.</b> Marca a este corredor como parte de la Selección Flandes (exclusivo de administración).</span>
    </label>`;
}

function bindFormRegistro_(host, pre, esEdicion) {
  pre = pre || {};
  A.fechaNac = pre.FECHA_NACIMIENTO ? soloFechaISO_(pre.FECHA_NACIMIENTO) : '';
  A.catActualPref = pre.CAT_PREFIJO || pre.CATEGORIA || '';

  $('f_GENERO').onchange = () => refrescarCategoriasModal_();
  $('f_DEPARTAMENTO').onchange = () => refrescarMunicipiosModal_();
  $('f_CATEGORIA').onchange = mostrarInfoCategoriaModal_;
  $('f_EPS').onchange = () => {
    const otra = $('f_EPS').value === 'OTRA';
    $('epsOtraSlot').style.display = otra ? '' : 'none';
  };
  $('btnFecha').onclick = abrirRuedaFecha;

  if (pre.GENERO) { refrescarCategoriasModal_(); $('f_CATEGORIA').value = A.catActualPref; }
  if (pre.DEPARTAMENTO) refrescarMunicipiosModal_(pre.MUNICIPIO);
  if (A.catActualPref) mostrarInfoCategoriaModal_();

  // --- Inscripción nueva: bloquea el resto de campos hasta consultar el documento ---
  if (!esEdicion) {
    bloquearCamposRegistro_(true);
    const btn = $('btnBuscarDoc'); if (btn) btn.onclick = consultarDocumento_;
    const inp = $('f_DOCUMENTO');
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); consultarDocumento_(); } });
    // Si cambia el documento tras haberlo liberado, se re-bloquea hasta re-consultar.
    inp.addEventListener('input', () => {
      bloquearCamposRegistro_(true);
      const a = $('docAviso'); if (a) { a.className = 'doc-aviso'; a.textContent = ''; }
    });
  }
}

/* Campos que se bloquean hasta consultar el documento (todo menos documento). */
const CAMPOS_BLOQUEABLES_ = ['f_NOMBRES', 'f_APELLIDOS', 'f_GENERO', 'f_RH', 'f_CELULAR',
  'f_EPS', 'f_EPS_OTRA', 'f_CORREO', 'f_DEPARTAMENTO', 'f_MUNICIPIO',
  'f_CONTACTO_EMERGENCIA', 'f_TEL_EMERGENCIA', 'f_CATEGORIA', 'f_ACUDIENTE_DOC',
  'f_FOTO', 'f_SELECCION', 'btnFecha'];

function bloquearCamposRegistro_(bloquear) {
  CAMPOS_BLOQUEABLES_.forEach(id => { const el = $(id); if (el) el.disabled = bloquear; });
  const grid = document.querySelector('#modal-root .form-grid');
  if (grid) grid.classList.toggle('bloqueado', bloquear);
  const ok = document.querySelector('#modal-root [data-a="ok"]');
  if (ok) ok.disabled = bloquear;               // no se puede registrar sin consultar
}

/* Consulta el documento ANTES de rellenar. Si ya existe → aviso y sigue bloqueado.
   Si está libre → desbloquea el resto de campos y fija el documento. */
async function consultarDocumento_() {
  const inp = $('f_DOCUMENTO'), aviso = $('docAviso');
  const doc = (inp.value || '').replace(/\D/g, '');
  if (!/^\d{6,10}$/.test(doc)) {
    aviso.className = 'doc-aviso warn';
    aviso.textContent = 'Ingresa un documento válido (6–10 dígitos).';
    return;
  }
  aviso.className = 'doc-aviso'; aviso.textContent = 'Consultando…';
  try {
    const rec = await api('obtenerInscrito', { documento: doc });
    if (rec) {
      aviso.className = 'doc-aviso err';
      aviso.innerHTML = `⚠️ <b>Ya está registrado:</b> ${escHtml_((rec.NOMBRES || '') + ' ' + (rec.APELLIDOS || ''))} · Dorsal <b>${escHtml_(rec.CODIGO || '—')}</b>. No es necesario volver a inscribirlo.`;
      bloquearCamposRegistro_(true);
      inp.removeAttribute('readonly');           // permite corregir y reconsultar
    } else {
      aviso.className = 'doc-aviso ok';
      aviso.textContent = '✓ Documento libre. Completa el resto de los campos.';
      bloquearCamposRegistro_(false);
      inp.setAttribute('readonly', 'readonly');  // fija el documento consultado
    }
  } catch (e) {
    aviso.className = 'doc-aviso err';
    aviso.textContent = e.message;
  }
}

function refrescarCategoriasModal_() {
  const permit = categoriasPorGenero_($('f_GENERO').value);
  const prev = $('f_CATEGORIA').value;
  $('f_CATEGORIA').innerHTML = '<option value="">—</option>' + permit.map(c => `<option value="${c.PREFIJO}">${c.NOMBRE}</option>`).join('');
  if (prev && permit.some(c => c.PREFIJO === prev)) $('f_CATEGORIA').value = prev;
  mostrarInfoCategoriaModal_();
}
function refrescarMunicipiosModal_(sel) {
  const dep = $('f_DEPARTAMENTO').value;
  const muni = (UBICACIONES[dep] || []).slice().sort();
  $('f_MUNICIPIO').innerHTML = '<option value="">—</option>' + muni.map(m => `<option value="${escAttr_(m)}" ${m === sel ? 'selected' : ''}>${m}</option>`).join('');
}
function mostrarInfoCategoriaModal_() {
  const pref = $('f_CATEGORIA').value;
  const c = catDe_(pref);
  const menor = esMenorCat_(pref);
  $('autorizacionSlot').classList.toggle('hidden', !menor);
  const lc = $('lbl_contacto'), lt = $('lbl_tel_emerg'), nota = $('notaMenor');
  if (lc) lc.textContent = menor ? 'Nombre del padre, madre o acudiente' : 'Contacto de emergencia';
  if (lt) lt.textContent = menor ? 'Celular del acudiente (10 dígitos)' : 'Tel. emergencia (10 dígitos)';
  if (nota) nota.classList.toggle('hidden', !menor);
  if (!c) { $('catInfo').innerHTML = ''; return; }
  $('catInfo').innerHTML = `
    <div class="item"><div class="k">Vueltas</div><div class="v">${c.VUELTAS}</div></div>
    <div class="item"><div class="k">Distancia</div><div class="v">${c.KM} km</div></div>
    <div class="item"><div class="k">1° / 2° / 3°</div><div class="v" style="font-size:.85rem">${fmtPremio(c.PREMIO_1)} · ${fmtPremio(c.PREMIO_2)} · ${fmtPremio(c.PREMIO_3)}</div></div>
    <div class="item" style="display:flex;align-items:center;gap:10px"><img src="${driveImg_(c.ICONO_URL)}" style="height:40px;width:40px;object-fit:contain"><div class="v" style="font-size:.85rem">${c.NOMBRE}</div></div>`;
}

/* Recolección + validación (misma lógica que participante). */
function fileToB64_(input) {
  return new Promise(res => {
    const f = input && input.files[0]; if (!f) return res(null);
    const r = new FileReader(); r.onload = () => res({ b64: r.result, mime: f.type }); r.readAsDataURL(f);
  });
}
async function recolectarRegistro_(pre) {
  const g = (id) => ($(id) ? $(id).value.trim() : '');
  let eps = g('f_EPS');
  if (eps === 'OTRA') eps = g('f_EPS_OTRA').toUpperCase();
  const f = {
    DOCUMENTO: (pre && pre.DOCUMENTO) ? pre.DOCUMENTO : g('f_DOCUMENTO').replace(/\D/g, ''),
    NOMBRES: g('f_NOMBRES').toUpperCase(), APELLIDOS: g('f_APELLIDOS').toUpperCase(),
    GENERO: g('f_GENERO'), RH: g('f_RH'),
    CELULAR: g('f_CELULAR').replace(/\D/g, ''), EPS: eps, CORREO: g('f_CORREO'),
    DEPARTAMENTO: g('f_DEPARTAMENTO'), MUNICIPIO: g('f_MUNICIPIO'),
    CONTACTO_EMERGENCIA: g('f_CONTACTO_EMERGENCIA'), TEL_EMERGENCIA: g('f_TEL_EMERGENCIA').replace(/\D/g, ''),
    CATEGORIA: g('f_CATEGORIA'), FECHA_NACIMIENTO: A.fechaNac,
    SELECCION_FLANDES: ($('f_SELECCION') && $('f_SELECCION').checked) ? 'SI' : 'NO'
  };
  const foto = await fileToB64_($('f_FOTO')); if (foto) { f.FOTO_B64 = foto.b64; f.FOTO_MIME = foto.mime; }
  if (esMenorCat_(f.CATEGORIA)) f.ACUDIENTE_DOC = g('f_ACUDIENTE_DOC').replace(/\D/g, '');
  return f;
}
function validarRegistro_(f) {
  const e = [];
  if (!/^\d{6,10}$/.test(f.DOCUMENTO || '')) e.push('Documento (6–10 dígitos)');
  if (!f.NOMBRES) e.push('Nombres');
  if (!f.APELLIDOS) e.push('Apellidos');
  if (!f.GENERO) e.push('Género');
  if (!f.RH) e.push('RH');
  if (!/^\d{10}$/.test(f.CELULAR)) e.push('Celular (10 dígitos)');
  if (!f.EPS) e.push('EPS');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.CORREO)) e.push('Correo válido');
  if (!f.DEPARTAMENTO) e.push('Departamento');
  if (!f.MUNICIPIO) e.push('Municipio');
  if ((f.CONTACTO_EMERGENCIA || '').split(/\s+/).filter(Boolean).length < 2) e.push('Contacto de emergencia (2 palabras)');
  if (!/^\d{10}$/.test(f.TEL_EMERGENCIA)) e.push('Tel. emergencia (10 dígitos)');
  if (!f.CATEGORIA) e.push('Categoría');
  if (!f.FECHA_NACIMIENTO) e.push('Fecha de nacimiento');
  if (esMenorCat_(f.CATEGORIA) && !/^\d{6,10}$/.test(f.ACUDIENTE_DOC || '')) e.push('Documento del acudiente (6–10 dígitos)');
  return e;
}

function abrirRegistroModal_(pre, { esEdicion }) {
  const title = esEdicion ? 'Editar corredor' : 'Inscribir corredor';
  const okText = esEdicion ? 'Guardar cambios' : 'Registrar corredor';
  const host = abrirModalHtml({
    title, wide: true, okText, cancelText: 'Cancelar',
    html: formRegistroHtml_(pre || {}, esEdicion),
    onOk: async (h) => {
      const f = await recolectarRegistro_(pre);
      const errs = validarRegistro_(f);
      if (errs.length) return toast('Faltan o son inválidos: ' + errs.join(', '), 'warning');
      const okBtn = h.querySelector('[data-a="ok"]'); if (okBtn) okBtn.disabled = true;
      try {
        const accion = esEdicion ? 'editarInscrito' : 'crearInscrito';
        const upd = await api(accion, { inscrito: f, porAdmin: true });
        cerrarModal();
        toast((esEdicion ? 'Corredor actualizado' : 'Corredor inscrito') + ': dorsal ' + upd.CODIGO + '.', 'success');
        await refrescarInscritos();
      } catch (e) {
        if (okBtn) okBtn.disabled = false;
        toast(e.message, 'error');
      }
    }
  });
  bindFormRegistro_(host, pre || {}, esEdicion);
}

function abrirInscribir() { abrirRegistroModal_({}, { esEdicion: false }); }
function accEditar(documento) {
  const rec = A.inscritos.find(x => String(x.DOCUMENTO) === String(documento));
  if (!rec) return toast('No se encontró el registro.', 'error');
  abrirRegistroModal_(rec, { esEdicion: true });
}

/* ================= SELECTOR DE FECHA iOS (nacimiento) ================= */
const IOSP_H = 42;
const IOSP = { dias: [], meses: [], anios: [] };

function selCol_(colEl) { return Math.max(0, Math.round(colEl.scrollTop / IOSP_H)); }
function marcarSel_(colEl) { const i = selCol_(colEl); colEl.querySelectorAll('.iosp-item').forEach(el => el.classList.toggle('sel', +el.dataset.i === i)); }

function buildCol_(colEl, items, initIdx, onSettle) {
  colEl.innerHTML = '<div class="iosp-pad"></div>' +
    items.map((t, i) => `<div class="iosp-item" data-i="${i}">${t}</div>`).join('') +
    '<div class="iosp-pad"></div>';
  colEl.scrollTop = Math.max(0, initIdx) * IOSP_H;
  marcarSel_(colEl);
  let to = null;
  colEl.onscroll = () => {
    marcarSel_(colEl); iospActualizarLive_();
    if (to) clearTimeout(to);
    to = setTimeout(() => { const i = selCol_(colEl); colEl.scrollTo({ top: i * IOSP_H, behavior: 'smooth' }); if (onSettle) onSettle(i); }, 90);
  };
  colEl.querySelectorAll('.iosp-item').forEach(el => {
    el.addEventListener('click', () => { const i = +el.dataset.i; colEl.scrollTop = i * IOSP_H; marcarSel_(colEl); iospActualizarLive_(); if (onSettle) onSettle(i); });
  });
}
function iospNudge_(colId, delta) {
  const colEl = $(colId); if (!colEl) return;
  const n = colEl.querySelectorAll('.iosp-item').length;
  const i = Math.min(Math.max(selCol_(colEl) + delta, 0), n - 1);
  colEl.scrollTop = i * IOSP_H; marcarSel_(colEl);
  if (colId === 'iosp-mes' || colId === 'iosp-anio') iospRebuildDias_();
  iospActualizarLive_();
}
function iospDiasEnMes_(mesIdx, anio) { return new Date(anio, mesIdx + 1, 0).getDate(); }
function iospRebuildDias_() {
  const mesIdx = IOSP.meses[Math.min(selCol_($('iosp-mes')), IOSP.meses.length - 1)];
  const anio = IOSP.anios[Math.min(selCol_($('iosp-anio')), IOSP.anios.length - 1)];
  const total = iospDiasEnMes_(mesIdx, anio);
  const curPos = Math.min(selCol_($('iosp-dia')), total - 1);
  IOSP.dias = []; for (let d = 1; d <= total; d++) IOSP.dias.push(d);
  buildCol_($('iosp-dia'), IOSP.dias.map(String), Math.max(0, curPos));
}
function iospLeer_() {
  const dia = IOSP.dias[Math.min(selCol_($('iosp-dia')), IOSP.dias.length - 1)];
  const mesIdx = IOSP.meses[Math.min(selCol_($('iosp-mes')), IOSP.meses.length - 1)];
  const anio = IOSP.anios[Math.min(selCol_($('iosp-anio')), IOSP.anios.length - 1)];
  return { dia, mesIdx, anio };
}
function iospActualizarLive_() {
  const { dia, mesIdx, anio } = iospLeer_();
  $('iosp-live').textContent = `${dia} de ${MESES_ES[mesIdx]} de ${anio}`;
}
function abrirRuedaFecha() {
  const c = catDe_($('f_CATEGORIA').value);
  const yMax = c ? +c.ANIO_MAX : 2012, yMin = c ? +c.ANIO_MIN : 1936;

  IOSP.meses = []; for (let m = 0; m <= 11; m++) IOSP.meses.push(m);
  IOSP.anios = []; for (let y = yMax; y >= yMin; y--) IOSP.anios.push(y);

  let ref = parseFecha_(A.fechaNac);
  if (!ref || ref.getFullYear() > yMax || ref.getFullYear() < yMin) {
    ref = new Date(Math.round((yMax + yMin) / 2), 0, 15);
  }
  const anioPos = Math.max(0, IOSP.anios.indexOf(ref.getFullYear()));
  const mesPos = Math.max(0, ref.getMonth());
  const total = iospDiasEnMes_(ref.getMonth(), ref.getFullYear());
  IOSP.dias = []; for (let d = 1; d <= total; d++) IOSP.dias.push(d);
  const diaPos = Math.max(0, Math.min(ref.getDate() - 1, total - 1));

  // Mostrar ANTES de construir columnas: con display:none, scrollTop no aplica.
  $('ios-picker').classList.remove('hidden');
  buildCol_($('iosp-dia'), IOSP.dias.map(String), diaPos);
  buildCol_($('iosp-mes'), IOSP.meses.map(m => MESES_ES[m].charAt(0).toUpperCase() + MESES_ES[m].slice(1)), mesPos, iospRebuildDias_);
  buildCol_($('iosp-anio'), IOSP.anios.map(String), anioPos, iospRebuildDias_);
  iospActualizarLive_();
}
function iospConfirmar_() {
  const { dia, mesIdx, anio } = iospLeer_();
  const iso = `${anio}-${String(mesIdx + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  $('ios-picker').classList.add('hidden');
  A.fechaNac = iso;
  const txt = $('btnFechaTxt'); if (txt) txt.textContent = fechaTextoDia_(iso);
}

/* ================= DASHBOARD ================= */
let _chartCat = null, _chartEstado = null;
function renderDashboard() {
  if (!A.kpis) return;
  const k = A.kpis;

  // KPIs superiores
  $('dashKpis').innerHTML = [
    ['Total inscritos', k.total, ''], ['Selección Flandes', k.seleccionFlandes, 'gold'],
    ['Activos', (k.porEstado.ACTIVO || 0), ''], ['Finalizados', (k.porEstado.FINALIZADO || 0), '']
  ].map(i => `<div class="kpi ${i[2]}"><div class="n">${i[1]}</div><div class="l">${i[0]}</div></div>`).join('');

  const cats = Object.keys(k.porCategoria).filter(p => k.porCategoria[p].total > 0 || catDe_(p));
  const labels = cats.map(p => (k.porCategoria[p].nombre || p));
  const totales = cats.map(p => k.porCategoria[p].total);
  const est = ESTADOS.filter(e => (k.porEstado[e] || 0) > 0);
  const estVals = est.map(e => k.porEstado[e]);
  const estColores = { INSCRITO: '#2c5a4a', ACTIVO: '#2f6b3f', EN_COMPETENCIA: '#b08d3f', FINALIZADO: '#14231c', DESCALIFICADO: '#7c2b2b', NO_PRESENTADO: '#8a8266' };

  if (_chartCat) _chartCat.destroy();
  if (_chartEstado) _chartEstado.destroy();

  _chartCat = new Chart($('chartCat'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Inscritos', data: totales, backgroundColor: '#b08d3f', borderRadius: 6, maxBarThickness: 42 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0, color: '#4d5a4f' }, grid: { color: '#e4dfce' } }, x: { ticks: { color: '#4d5a4f', font: { size: 10 } }, grid: { display: false } } }
    }
  });
  _chartEstado = new Chart($('chartEstado'), {
    type: 'doughnut',
    data: { labels: est.map(e => ESTADO_LBL[e] || e), datasets: [{ data: estVals, backgroundColor: est.map(e => estColores[e] || '#b08d3f'), borderColor: '#fffdf8', borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '58%', plugins: { legend: { position: 'bottom', labels: { color: '#20302a', font: { size: 11 }, boxWidth: 12, padding: 10 } } } }
  });

  // Leyenda con íconos de categoría
  $('catLegend').innerHTML = cats.map(p => {
    const c = catDe_(p) || {};
    return `<div class="cat-chip">
      <img src="${driveImg_(c.ICONO_URL)}" alt="" onerror="this.style.visibility='hidden'">
      <div><div class="cc-n">${k.porCategoria[p].total}</div><div class="cc-l">${k.porCategoria[p].nombre || p}</div></div>
    </div>`;
  }).join('') || '<p class="muted">Sin datos todavía.</p>';
}

async function cambioMasivo() {
  const categoria = $('mCategoria').value, estadoActual = $('mEstadoActual').value, estadoNuevo = $('mEstadoNuevo').value;
  if (!categoria || !estadoNuevo) return toast('Selecciona categoría y estado destino.', 'warning');
  const cn = catDe_(categoria);
  const ok = await Swal.fire({
    title: '¿Aplicar cambio masivo?',
    html: `<b>${cn ? cn.NOMBRE : categoria}</b><br>${estadoActual ? (ESTADO_LBL[estadoActual] || estadoActual) : 'Cualquier estado'} → <b>${ESTADO_LBL[estadoNuevo] || estadoNuevo}</b>`,
    showCancelButton: true, confirmButtonColor: '#14231c', cancelButtonColor: '#7c2b2b', confirmButtonText: 'Aplicar'
  });
  if (!ok.isConfirmed) return;
  try {
    const r = await api('cambioMasivoEstado', { categoria, estadoActual, estadoNuevo });
    toast(r.actualizados + ' corredor(es) actualizados.', 'success');
    await refrescarInscritos(); renderDashboard();
  } catch (e) { toast(e.message, 'error'); }
}

function cargarPodio() {
  const pref = $('rCategoria').value; if (!pref) return toast('Selecciona una categoría.', 'warning');
  const corredores = A.inscritos.filter(r => (r.CAT_PREFIJO || r.CATEGORIA) === pref);
  if (!corredores.length) { $('podioBox').innerHTML = '<p class="muted">No hay corredores en esta categoría.</p>'; $('btnGuardarPodio').classList.add('hidden'); return; }
  const opt = corredores.map(c => `<option value="${c.CODIGO}">${c.CODIGO} · ${c.NOMBRES} ${c.APELLIDOS}</option>`).join('');
  const slot = (id, lbl, cls, medal) => `<div class="podio-slot ${cls}"><h4><span class="podio-medal">${medal}</span>${lbl}</h4><select id="${id}"><option value="">—</option>${opt}</select></div>`;
  $('podioBox').innerHTML = slot('pod1', '1° puesto', 'p1', '🥇') + slot('pod2', '2° puesto', 'p2', '🥈') + slot('pod3', '3° puesto', 'p3', '🥉');
  corredores.forEach(c => {
    if (String(c.PUESTO) === '1') $('pod1').value = c.CODIGO;
    if (String(c.PUESTO) === '2') $('pod2').value = c.CODIGO;
    if (String(c.PUESTO) === '3') $('pod3').value = c.CODIGO;
  });
  $('btnGuardarPodio').classList.remove('hidden');
}
async function guardarPodio() {
  const categoria = $('rCategoria').value;
  const primero = $('pod1').value, segundo = $('pod2').value, tercero = $('pod3').value;
  try {
    const r = await api('guardarResultados', { categoria, primero, segundo, tercero });
    toast('Podio guardado (' + r.asignados + ' asignados).', 'success');
    await refrescarInscritos();
  } catch (e) { toast(e.message, 'error'); }
}

async function exportarPdf() {
  Swal.fire({ title: 'Generando PDF…', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
  try {
    const r = await api('exportarTablaPdf', { categoria: $('eCategoria').value, estado: $('eEstado').value }, { silent: true });
    Swal.close();
    const a = document.createElement('a'); a.href = 'data:' + r.mime + ';base64,' + r.base64; a.download = r.filename; a.click();
  } catch (e) { Swal.close(); toast(e.message, 'error'); }
}

/* ================= COMUNICADOS ================= */
async function publicarComunicado() {
  const c = {
    TITULO: $('cTitulo').value.trim(), CUERPO: $('cCuerpo').value.trim(),
    IMAGEN_URL: $('cImagen').value.trim(), DESTACADO: $('cDestacado').checked
  };
  if (!c.TITULO || !c.CUERPO) return toast('El título y el cuerpo son obligatorios.', 'warning');
  try {
    A.coms = await api('guardarComunicado', { comunicado: c });
    $('cTitulo').value = $('cCuerpo').value = $('cImagen').value = '';
    $('cDestacado').checked = false; $('cDestacadoLine').classList.remove('on');
    toast('Comunicado publicado.', 'success');
    renderComunicadosAdmin();
  } catch (e) { toast(e.message, 'error'); }
}
async function renderComunicadosAdmin() {
  try { A.coms = await api('listarComunicados'); } catch (e) { }
  $('comAdminList').innerHTML = (A.coms || []).length ? (A.coms || []).map(c => {
    const dest = String(c.DESTACADO).toUpperCase() === 'SI';
    return `<div class="com ${dest ? 'dest' : ''}">
      <div class="com-head">
        <div>
          <h4>${escHtml_(c.TITULO)}${dest ? '<span class="badge-dest">Destacado</span>' : ''}</h4>
          <div class="fecha">${c.FECHA_FMT || fechaLargaEs_(c.FECHA)} · ${escHtml_(c.AUTOR || 'Comité')}</div>
        </div>
        <button class="link-del" onclick="eliminarCom('${c.ID}')">Eliminar</button>
      </div>
      <div class="cuerpo">${nl2br_(c.CUERPO)}</div>
      ${c.IMAGEN_URL ? `<img class="com-img" src="${driveImg_(c.IMAGEN_URL)}" alt="">` : ''}
    </div>`;
  }).join('') : '<div class="empty"><div class="big">Sin comunicados</div>Publica el primero desde el formulario de arriba.</div>';
}
async function eliminarCom(id) {
  const ok = await Swal.fire({ title: '¿Eliminar comunicado?', text: 'Dejará de verse en la app de los participantes.', showCancelButton: true, confirmButtonColor: '#7c2b2b', cancelButtonColor: '#14231c', confirmButtonText: 'Eliminar' });
  if (!ok.isConfirmed) return;
  try { A.coms = await api('eliminarComunicado', { id }); renderComunicadosAdmin(); }
  catch (e) { toast(e.message, 'error'); }
}

/* ================= CONFIGURACIÓN ================= */
async function renderConfig() {
  try { A.cfg = await api('getConfigAdmin'); } catch (e) { return toast(e.message, 'error'); }
  const claves = Object.keys(A.cfg).sort();
  $('configForm').innerHTML = claves.map(k => {
    const val = A.cfg[k] == null ? '' : String(A.cfg[k]);
    const lock = val === '••••••••' ? '<span class="cfg-lock">(sensible)</span>' : '';
    return `<div class="cfg-item"><label>${k}${lock}</label><input data-k="${escAttr_(k)}" value="${escAttr_(val)}"></div>`;
  }).join('');
}
async function guardarConfig() {
  const cambios = {};
  $$('#configForm input[data-k]').forEach(inp => {
    const k = inp.dataset.k, v = inp.value;
    if (v !== String(A.cfg[k]) && v !== '••••••••') cambios[k] = v;
  });
  if (!Object.keys(cambios).length) return toast('No hay cambios por guardar.', 'info');
  try {
    const r = await api('guardarConfig', { cambios });
    A.cfg = r.config;
    toast(r.guardadas + ' clave(s) guardadas.', 'success');
    renderConfig();
  } catch (e) { toast(e.message, 'error'); }
}
