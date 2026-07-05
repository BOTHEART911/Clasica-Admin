/* ================= CLÁSICA 2026 — App Administrador ================= */
const API_BASE = 'PEGA_AQUI_LA_URL_EXEC'; // misma /exec que el frontend participante

const ESTADOS = ['INSCRITO', 'ACTIVO', 'EN_COMPETENCIA', 'FINALIZADO', 'DESCALIFICADO', 'NO_PRESENTADO'];
const A = { admin: null, cats: [], cfg: {}, inscritos: [], kpis: null, coms: [], poll: null };

async function api(action, payload = {}) {
  const p = Object.assign({ action }, payload);
  if (A.admin) { p.__uid = A.admin.id; p.__uname = A.admin.nombre; }
  const res = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p) });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || 'Error del servidor');
  return j.data;
}
const $ = id => document.getElementById(id);
const toast = (t, i = 'info') => Swal.fire({ text: t, icon: i, confirmButtonColor: '#14231c' });
const money = v => '$' + (+String(v).replace(/\D/g, '') || 0).toLocaleString('es-CO');

/* ---------- arranque ---------- */
(function init() {
  $('btnLogin').onclick = login;
  $('loginUser').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
})();

async function login() {
  const u = ($('loginUser').value || '').trim();
  if (!u) return toast('Ingresa tu cédula o PIN.', 'warning');
  Swal.fire({ title: 'Verificando…', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
  try {
    const r = await api('loginAdmin', { usuario: u });
    A.admin = r.admin; A.cfg = r.config || {};
    Swal.close();
    $('appIcon').style.display = 'none';
    if (A.cfg.ICONO_APP) { $('appIcon2').src = A.cfg.ICONO_APP; }
    $('adminNombre').textContent = A.admin.nombre;
    $('view-login').classList.remove('active'); $('view-login').classList.add('hidden');
    $('appShell').classList.remove('hidden');
    wireApp();
    await cargarTodo();
    iniciarPolling();
  } catch (e) { Swal.close(); toast(e.message, 'error'); }
}

function wireApp() {
  $('btnSalir').onclick = () => location.reload();
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => cambiarTab(t.dataset.tab));
  $('fTexto').oninput = renderCards; $('fCategoria').onchange = renderCards;
  $('fEstado').onchange = renderCards; $('fSeleccion').onchange = renderCards;
  $('btnInscribir').onclick = abrirInscribir;
  $('btnMasivo').onclick = cambioMasivo;
  $('btnCargarPodio').onclick = cargarPodio;
  $('btnGuardarPodio').onclick = guardarPodio;
  $('btnExport').onclick = exportarPdf;
  $('btnPublicar').onclick = publicarComunicado;
  $('btnGuardarConfig').onclick = guardarConfig;
  $('btnRefrescarDocs').onclick = async () => { try { await api('refrescarCacheDocs'); toast('Caché de modales limpiada.', 'success'); } catch (e) { toast(e.message, 'error'); } };
}

function cambiarTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tabview').forEach(v => v.classList.remove('active'));
  $('tab-' + name).classList.add('active');
  if (name === 'dashboard') renderDashboard();
  if (name === 'comunicados') renderComunicadosAdmin();
  if (name === 'config') renderConfig();
}

/* ================= CARGA / POLLING ================= */
async function cargarTodo() {
  A.cats = await api('listarCategorias');
  llenarSelectsCategorias();
  await refrescarInscritos();
}
async function refrescarInscritos() {
  A.inscritos = await api('listarInscritos');
  A.kpis = await api('dashboardKpis');
  renderKpiStrip(); renderCards();
}
function iniciarPolling() {
  clearInterval(A.poll);
  // tiempo real por polling corto (degrada Firebase hasta cargar la SA)
  A.poll = setInterval(async () => {
    try { await refrescarInscritos(); $('liveDot').style.background = '#7bd88f'; }
    catch (e) { $('liveDot').style.background = '#e0b34a'; }
  }, 15000);
}

function llenarSelectsCategorias() {
  const opts = '<option value="">Todas las categorías</option>' + A.cats.map(c => `<option value="${c.PREFIJO}">${c.NOMBRE}</option>`).join('');
  $('fCategoria').innerHTML = opts;
  const soloCats = A.cats.map(c => `<option value="${c.PREFIJO}">${c.NOMBRE}</option>`).join('');
  $('mCategoria').innerHTML = soloCats; $('rCategoria').innerHTML = soloCats;
  $('eCategoria').innerHTML = '<option value="">Todas</option>' + soloCats;
  const estOpts = ESTADOS.map(e => `<option value="${e}">${e}</option>`).join('');
  $('fEstado').innerHTML = '<option value="">Todos los estados</option>' + estOpts;
  $('mEstadoActual').innerHTML = '<option value="">(cualquiera)</option>' + estOpts;
  $('mEstadoNuevo').innerHTML = estOpts;
  $('eEstado').innerHTML = '<option value="">Todos</option>' + estOpts;
}

/* ================= INSCRITOS ================= */
function renderKpiStrip() {
  const k = A.kpis; if (!k) return;
  const items = [['Total', k.total], ['Selección Flandes', k.seleccionFlandes],
    ['Inscritos', k.porEstado.INSCRITO || 0], ['Activos', k.porEstado.ACTIVO || 0],
    ['En competencia', k.porEstado.EN_COMPETENCIA || 0], ['Finalizados', k.porEstado.FINALIZADO || 0]];
  $('kpiStrip').innerHTML = items.map(i => `<div class="kpi"><div class="n">${i[1]}</div><div class="l">${i[0]}</div></div>`).join('');
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

function renderCards() {
  const list = filtrar();
  if (!list.length) { $('cards').innerHTML = '<p class="muted">Sin resultados.</p>'; return; }
  $('cards').innerHTML = list.map(r => {
    const sel = String(r.SELECCION_FLANDES).toUpperCase() === 'SI';
    return `<div class="rider-card ${sel ? 'sel' : ''}">
      <div class="top">
        <img src="${r.FOTO || A.cfg.ICONO_USUARIO_DEFAULT || ''}" alt="">
        <div><div class="name">${(r.NOMBRES + ' ' + r.APELLIDOS).trim()} ${sel ? '<span class="star">★</span>' : ''}</div>
        <div class="meta">${r.CAT_NOMBRE || r.CATEGORIA} · CC ${r.DOCUMENTO}</div></div>
        <div class="code">${r.CODIGO}</div>
      </div>
      <div class="estado">${r.ESTADO}</div>
      <div class="acts">
        <button onclick="accActivar('${r.CODIGO}')">Activar</button>
        <button class="${sel ? 'on' : ''}" onclick="accSeleccion('${r.CODIGO}')">Selección</button>
        <button onclick="accDocs('${r.CODIGO}')">Documentos</button>
        <button onclick="accDetalles('${r.CODIGO}')">Detalles</button>
        <button onclick="accEditar('${r.DOCUMENTO}')">Editar</button>
      </div>
    </div>`;
  }).join('');
}

async function accActivar(codigo) {
  try { await api('activarInscrito', { codigo }); toast('Marcado como ACTIVO.', 'success'); await refrescarInscritos(); }
  catch (e) { toast(e.message, 'error'); }
}
async function accSeleccion(codigo) {
  try { const r = await api('toggleSeleccion', { codigo }); toast('Selección Flandes: ' + r.SELECCION_FLANDES, 'success'); await refrescarInscritos(); }
  catch (e) { toast(e.message, 'error'); }
}
async function accDocs(codigo) {
  try {
    const d = await api('verDocumentos', { codigo });
    const link = (t, u) => u ? `<a href="${u}" target="_blank" style="display:block;padding:8px 0;color:#14231c">📄 ${t}</a>` : `<span style="display:block;padding:8px 0;color:#bbb">— ${t} (no generado)</span>`;
    Swal.fire({ title: 'Documentos', html: `<div style="text-align:left">${link('Dorsal', d.dorsal)}${link('Reglamento', d.reglamento)}${link('Consentimiento', d.consentimiento)}${link('Autorización', d.autorizacion)}${link('Mención', d.mencion)}</div>`, confirmButtonColor: '#14231c' });
  } catch (e) { toast(e.message, 'error'); }
}
function accDetalles(codigo) {
  const r = A.inscritos.find(x => x.CODIGO === codigo); if (!r) return;
  const filas = [['Dorsal', r.CODIGO], ['Documento', r.DOCUMENTO], ['Nombre', r.NOMBRES + ' ' + r.APELLIDOS],
    ['Género', r.GENERO], ['RH', r.RH], ['Celular', r.CELULAR], ['EPS', r.EPS], ['Correo', r.CORREO],
    ['Ubicación', (r.MUNICIPIO || '') + ', ' + (r.DEPARTAMENTO || '')], ['Emergencia', (r.CONTACTO_EMERGENCIA || '') + ' · ' + (r.TEL_EMERGENCIA || '')],
    ['Categoría', r.CAT_NOMBRE || r.CATEGORIA], ['Nacimiento', r.FECHA_NACIMIENTO + ' (' + (r.EDAD || '?') + ' años)'],
    ['Estado', r.ESTADO], ['Selección', r.SELECCION_FLANDES], ['Puesto', r.PUESTO || '—'],
    ['Inscripción', r.FECHA_INSCRIPCION]];
  Swal.fire({ title: 'Detalles', width: 620, html: `<div style="text-align:left">${filas.map(f => `<div style="display:flex;justify-content:space-between;border-bottom:1px dashed #e4dfce;padding:6px 0"><b style="color:#b08d3f">${f[0]}</b><span>${f[1]}</span></div>`).join('')}</div>`, confirmButtonColor: '#14231c' });
}

/* ---------- inscribir / editar (admin) ---------- */
function formHtml(pre) {
  pre = pre || {};
  const deptos = Object.keys(UBICACIONES).sort();
  const rh = ['O Positivo (O+)', 'O Negativo (O-)', 'A Positivo (A+)', 'A Negativo (A-)', 'B Positivo (B+)', 'B Negativo (B-)', 'AB Positivo (AB+)', 'AB Negativo (AB-)'];
  const eps = ['SALUD TOTAL', 'SANITAS', 'FAMISANAR', 'NUEVA EPS', 'COMPENSAR', 'SURA', 'SANIDAD FUERZAS MILITARES', 'CONVIDA', 'COOSALUD', 'ALIANSALUD', 'ADRES MIN002'];
  const opt = (arr, s) => arr.map(o => `<option ${o === s ? 'selected' : ''}>${o}</option>`).join('');
  const catG = g => A.cats.filter(c => g === 'F' ? (c.PREFIJO === 'DM' || c.PREFIJO === 'BF') : (c.PREFIJO !== 'DM' && c.PREFIJO !== 'BF'));
  const gIni = (pre.GENERO || '').charAt(0).toUpperCase();
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left">
    <label>Documento<input id="i_DOCUMENTO" value="${pre.DOCUMENTO || ''}" ${pre.DOCUMENTO ? 'readonly' : ''}></label>
    <label>Nombres<input id="i_NOMBRES" value="${pre.NOMBRES || ''}"></label>
    <label>Apellidos<input id="i_APELLIDOS" value="${pre.APELLIDOS || ''}"></label>
    <label>Género<select id="i_GENERO"><option value="">—</option>${opt(['Masculino', 'Femenino'], pre.GENERO)}</select></label>
    <label>RH<select id="i_RH"><option value="">—</option>${opt(rh, pre.RH)}</select></label>
    <label>Celular<input id="i_CELULAR" value="${pre.CELULAR || ''}"></label>
    <label>EPS<select id="i_EPS"><option value="">—</option>${opt(eps, pre.EPS)}</select></label>
    <label>Correo<input id="i_CORREO" value="${pre.CORREO || ''}"></label>
    <label>Departamento<select id="i_DEPARTAMENTO"><option value="">—</option>${opt(deptos, pre.DEPARTAMENTO)}</select></label>
    <label>Municipio<select id="i_MUNICIPIO"><option value="">—</option></select></label>
    <label>Contacto emergencia<input id="i_CONTACTO_EMERGENCIA" value="${pre.CONTACTO_EMERGENCIA || ''}"></label>
    <label>Tel. emergencia<input id="i_TEL_EMERGENCIA" value="${pre.TEL_EMERGENCIA || ''}"></label>
    <label>Categoría<select id="i_CATEGORIA"><option value="">—</option>${catG(gIni).map(c => `<option value="${c.PREFIJO}" ${c.PREFIJO === (pre.CAT_PREFIJO || pre.CATEGORIA) ? 'selected' : ''}>${c.NOMBRE}</option>`).join('')}</select></label>
    <label>Nacimiento<input id="i_FECHA_NACIMIENTO" type="date" value="${pre.FECHA_NACIMIENTO || ''}"></label>
    <label style="grid-column:1/-1"><span class="chk"><input type="checkbox" id="i_SELECCION" ${String(pre.SELECCION_FLANDES).toUpperCase() === 'SI' ? 'checked' : ''}> Selección Flandes</span></label>
  </div>`;
}

function recolectar() {
  const g = id => { const el = $(id); return el ? el.value.trim() : ''; };
  return {
    DOCUMENTO: g('i_DOCUMENTO').replace(/\D/g, ''), NOMBRES: g('i_NOMBRES'), APELLIDOS: g('i_APELLIDOS'),
    GENERO: g('i_GENERO'), RH: g('i_RH'), CELULAR: g('i_CELULAR').replace(/\D/g, ''), EPS: g('i_EPS'),
    CORREO: g('i_CORREO'), DEPARTAMENTO: g('i_DEPARTAMENTO'), MUNICIPIO: g('i_MUNICIPIO'),
    CONTACTO_EMERGENCIA: g('i_CONTACTO_EMERGENCIA'), TEL_EMERGENCIA: g('i_TEL_EMERGENCIA').replace(/\D/g, ''),
    CATEGORIA: g('i_CATEGORIA'), FECHA_NACIMIENTO: g('i_FECHA_NACIMIENTO'),
    SELECCION_FLANDES: $('i_SELECCION') && $('i_SELECCION').checked ? 'SI' : 'NO'
  };
}

function bindFormLive() {
  $('i_GENERO').onchange = () => {
    const g = $('i_GENERO').value.charAt(0).toUpperCase();
    const cats = A.cats.filter(c => g === 'F' ? (c.PREFIJO === 'DM' || c.PREFIJO === 'BF') : (c.PREFIJO !== 'DM' && c.PREFIJO !== 'BF'));
    $('i_CATEGORIA').innerHTML = '<option value="">—</option>' + cats.map(c => `<option value="${c.PREFIJO}">${c.NOMBRE}</option>`).join('');
  };
  $('i_DEPARTAMENTO').onchange = () => {
    const m = (UBICACIONES[$('i_DEPARTAMENTO').value] || []).slice().sort();
    $('i_MUNICIPIO').innerHTML = '<option value="">—</option>' + m.map(x => `<option>${x}</option>`).join('');
  };
}

async function abrirInscribir() {
  const r = await Swal.fire({ title: 'Inscribir corredor', width: 720, html: formHtml({}), showCancelButton: true, confirmButtonText: 'Registrar', confirmButtonColor: '#14231c', didOpen: bindFormLive, preConfirm: () => recolectar() });
  if (!r.isConfirmed) return;
  Swal.fire({ title: 'Registrando…', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
  try { const nuevo = await api('crearInscrito', { inscrito: r.value, porAdmin: true }); Swal.close(); toast('Inscrito: dorsal ' + nuevo.CODIGO, 'success'); await refrescarInscritos(); }
  catch (e) { Swal.close(); toast(e.message, 'error'); }
}

async function accEditar(documento) {
  const rec = A.inscritos.find(x => String(x.DOCUMENTO) === String(documento)); if (!rec) return;
  const r = await Swal.fire({ title: 'Editar corredor', width: 720, html: formHtml(rec), showCancelButton: true, confirmButtonText: 'Guardar', confirmButtonColor: '#14231c', didOpen: () => { bindFormLive(); const m = (UBICACIONES[rec.DEPARTAMENTO] || []).slice().sort(); $('i_MUNICIPIO').innerHTML = m.map(x => `<option ${x === rec.MUNICIPIO ? 'selected' : ''}>${x}</option>`).join(''); }, preConfirm: () => recolectar() });
  if (!r.isConfirmed) return;
  Swal.fire({ title: 'Guardando…', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
  try { const upd = await api('editarInscrito', { inscrito: r.value, porAdmin: true }); Swal.close(); toast('Actualizado: ' + upd.CODIGO, 'success'); await refrescarInscritos(); }
  catch (e) { Swal.close(); toast(e.message, 'error'); }
}

/* ================= DASHBOARD ================= */
let _chartCat, _chartEstado;
function renderDashboard() {
  if (!A.kpis) return;
  const cats = Object.keys(A.kpis.porCategoria);
  const labels = cats.map(p => (A.kpis.porCategoria[p].nombre || p));
  const totales = cats.map(p => A.kpis.porCategoria[p].total);
  const est = Object.keys(A.kpis.porEstado);
  const estVals = est.map(e => A.kpis.porEstado[e]);
  const gold = '#b08d3f', pino = '#14231c';
  if (_chartCat) _chartCat.destroy();
  if (_chartEstado) _chartEstado.destroy();
  _chartCat = new Chart($('chartCat'), { type: 'bar', data: { labels, datasets: [{ label: 'Inscritos', data: totales, backgroundColor: gold }] }, options: { plugins: { legend: { display: false } } } });
  _chartEstado = new Chart($('chartEstado'), { type: 'doughnut', data: { labels: est, datasets: [{ data: estVals, backgroundColor: [pino, gold, '#7c2b2b', '#4a7c59', '#8a8266', '#d8bd7f'] }] } });
}

async function cambioMasivo() {
  const categoria = $('mCategoria').value, estadoActual = $('mEstadoActual').value, estadoNuevo = $('mEstadoNuevo').value;
  if (!categoria || !estadoNuevo) return toast('Selecciona categoría y estado destino.', 'warning');
  const ok = await Swal.fire({ title: '¿Aplicar cambio masivo?', text: `${categoria}: ${estadoActual || 'cualquiera'} → ${estadoNuevo}`, showCancelButton: true, confirmButtonColor: '#14231c', confirmButtonText: 'Aplicar' });
  if (!ok.isConfirmed) return;
  try { const r = await api('cambioMasivoEstado', { categoria, estadoActual, estadoNuevo }); toast(r.actualizados + ' corredores actualizados.', 'success'); await refrescarInscritos(); renderDashboard(); }
  catch (e) { toast(e.message, 'error'); }
}

function cargarPodio() {
  const pref = $('rCategoria').value; if (!pref) return;
  const corredores = A.inscritos.filter(r => (r.CAT_PREFIJO || r.CATEGORIA) === pref);
  const opt = corredores.map(c => `<option value="${c.CODIGO}">${c.CODIGO} · ${c.NOMBRES} ${c.APELLIDOS}</option>`).join('');
  const sel = (id, lbl) => `<div class="card" style="margin:0"><h4 style="color:#14231c">${lbl}</h4><select id="${id}"><option value="">—</option>${opt}</select></div>`;
  $('podioBox').innerHTML = sel('pod1', '1° puesto') + sel('pod2', '2° puesto') + sel('pod3', '3° puesto');
  // prellenar con puestos existentes
  corredores.forEach(c => { if (c.PUESTO == 1) $('pod1').value = c.CODIGO; if (c.PUESTO == 2) $('pod2').value = c.CODIGO; if (c.PUESTO == 3) $('pod3').value = c.CODIGO; });
  $('btnGuardarPodio').classList.remove('hidden');
}
async function guardarPodio() {
  const categoria = $('rCategoria').value;
  const primero = $('pod1').value, segundo = $('pod2').value, tercero = $('pod3').value;
  try { const r = await api('guardarResultados', { categoria, primero, segundo, tercero }); toast('Podio guardado (' + r.asignados + ').', 'success'); await refrescarInscritos(); }
  catch (e) { toast(e.message, 'error'); }
}

async function exportarPdf() {
  Swal.fire({ title: 'Generando PDF…', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
  try {
    const r = await api('exportarTablaPdf', { categoria: $('eCategoria').value, estado: $('eEstado').value });
    Swal.close();
    const a = document.createElement('a'); a.href = 'data:' + r.mime + ';base64,' + r.base64; a.download = r.filename; a.click();
  } catch (e) { Swal.close(); toast(e.message, 'error'); }
}

/* ================= COMUNICADOS ================= */
async function publicarComunicado() {
  const c = { TITULO: $('cTitulo').value.trim(), CUERPO: $('cCuerpo').value.trim(), IMAGEN_URL: $('cImagen').value.trim(), DESTACADO: $('cDestacado').checked };
  if (!c.TITULO || !c.CUERPO) return toast('Título y cuerpo son obligatorios.', 'warning');
  try { A.coms = await api('guardarComunicado', { comunicado: c }); $('cTitulo').value = $('cCuerpo').value = $('cImagen').value = ''; $('cDestacado').checked = false; toast('Comunicado publicado.', 'success'); renderComunicadosAdmin(); }
  catch (e) { toast(e.message, 'error'); }
}
async function renderComunicadosAdmin() {
  try { A.coms = await api('listarComunicados'); } catch (e) { }
  $('comAdminList').innerHTML = (A.coms || []).map(c => `
    <div class="com ${String(c.DESTACADO).toUpperCase() === 'SI' ? 'dest' : ''}">
      <div class="row-between"><h4>${c.TITULO}</h4><button class="ghost-dark" onclick="eliminarCom('${c.ID}')">Eliminar</button></div>
      <div class="fecha">${String(c.FECHA).replace('T', ' ').slice(0, 16)} · ${c.AUTOR || ''}</div>
      <div>${(c.CUERPO || '').replace(/\n/g, '<br>')}</div>
      ${c.IMAGEN_URL ? `<img src="${c.IMAGEN_URL}" style="max-width:100%;border-radius:8px;margin-top:8px">` : ''}
    </div>`).join('') || '<p class="muted">Sin comunicados.</p>';
}
async function eliminarCom(id) {
  const ok = await Swal.fire({ title: '¿Eliminar comunicado?', showCancelButton: true, confirmButtonColor: '#7c2b2b', confirmButtonText: 'Eliminar' });
  if (!ok.isConfirmed) return;
  try { A.coms = await api('eliminarComunicado', { id }); renderComunicadosAdmin(); } catch (e) { toast(e.message, 'error'); }
}

/* ================= CONFIG ================= */
async function renderConfig() {
  try { A.cfg = await api('getConfigAdmin'); } catch (e) { return toast(e.message, 'error'); }
  const claves = Object.keys(A.cfg).sort();
  $('configForm').innerHTML = claves.map(k => `<label class="field"><span>${k}</span><input data-k="${k}" value="${String(A.cfg[k]).replace(/"/g, '&quot;')}"></label>`).join('');
}
async function guardarConfig() {
  const cambios = {};
  document.querySelectorAll('#configForm input[data-k]').forEach(inp => {
    const k = inp.dataset.k, v = inp.value;
    if (v !== String(A.cfg[k]) && v !== '••••••••') cambios[k] = v;
  });
  if (!Object.keys(cambios).length) return toast('No hay cambios.', 'info');
  try { const r = await api('guardarConfig', { cambios }); A.cfg = r.config; toast(r.guardadas + ' claves guardadas.', 'success'); renderConfig(); }
  catch (e) { toast(e.message, 'error'); }
}
