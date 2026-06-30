// ═══════════════════════════════════════════════════════
//  MODALES
// ═══════════════════════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ═══════════════════════════════════════════════════════
//  HOME
// ═══════════════════════════════════════════════════════
function renderHome() {
  const montajes = DB.montajes.getAll();
  const averias = DB.averias.getAll();
  const inicio = Utils.inicioMes(0);
  const fin = Utils.finMes(0);

  const montajesMes = montajes.filter(m => m.creadoEn >= inicio && m.creadoEn < fin).length;
  const averiasActivas = averias.filter(a => a.estado !== 'resuelta' && a.estado !== 'cobrada').length;

  document.getElementById('home-montajes-mes').textContent = montajesMes;
  document.getElementById('home-averias-activas').textContent = averiasActivas;
  document.getElementById('kpi-montajes-mes').textContent = montajesMes;
  document.getElementById('kpi-averias-act').textContent = averiasActivas;

  const sdf = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  document.getElementById('home-fecha').textContent = sdf.charAt(0).toUpperCase() + sdf.slice(1);

  // Próximos 7 días
  const ahora = Date.now();
  const en7dias = ahora + 7 * 86400000;
  const proximos = montajes.filter(m => m.fecha && m.fecha >= ahora && m.fecha <= en7dias).sort((a,b) => a.fecha - b.fecha).slice(0, 4);
  const proxCont = document.getElementById('home-proximos');
  if (proximos.length) {
    proxCont.innerHTML = `<div class="section-header">📅 Próximos 7 días</div>` +
      proximos.map(m => `
        <div class="list-item" onclick="openMontajeDetalle(${m.id})">
          <div style="background:var(--azul-light);color:var(--azul);border-radius:10px;padding:6px 10px;text-align:center;flex-shrink:0;min-width:44px">
            <div style="font-size:16px;font-weight:700">${new Date(m.fecha).getDate()}</div>
            <div style="font-size:10px">${new Date(m.fecha).toLocaleDateString('es-ES',{month:'short'})}</div>
          </div>
          <div class="item-body">
            <div class="item-title">${Utils.escapeHtml(m.cliente)}</div>
            <div class="item-sub">${m.hora || ''} · ${Utils.escapeHtml(m.marca || m.tipoMaquina || '')}</div>
          </div>
        </div>`).join('');
  } else {
    proxCont.innerHTML = '';
  }
}

function updateBadges() {
  const montajes = DB.montajes.getAll();
  const averias = DB.averias.getAll();
  const listaEspera = montajes.filter(m => m.estado === 'lista_espera').length;
  const avAct = averias.filter(a => a.estado !== 'resuelta' && a.estado !== 'cobrada').length;

  const bm = document.getElementById('badge-montajes');
  const ba = document.getElementById('badge-averias');
  if (listaEspera > 0) { bm.textContent = listaEspera; bm.style.display = 'block'; }
  else bm.style.display = 'none';
  if (avAct > 0) { ba.textContent = avAct; ba.style.display = 'block'; }
  else ba.style.display = 'none';

  // Bell badge: próximos 7 días + averías urgentes
  const ahora = Date.now();
  const en7dias = ahora + 7 * 86400000;
  const proximos = montajes.filter(m => m.fecha && m.fecha >= ahora && m.fecha <= en7dias).length;
  const urgentes = averias.filter(a => a.urgente && a.estado !== 'resuelta' && a.estado !== 'cobrada').length;
  const totalBell = proximos + urgentes;
  const bell = document.getElementById('bell-badge');
  if (bell) {
    if (totalBell > 0) { bell.textContent = totalBell; bell.style.display = 'flex'; }
    else bell.style.display = 'none';
  }

  renderHome();
}

// ═══════════════════════════════════════════════════════
//  AVISOS
// ═══════════════════════════════════════════════════════
function renderAvisos() {
  const ahora = Date.now();
  const en7dias = ahora + 7 * 86400000;
  const montajes = DB.montajes.getAll();
  const averias = DB.averias.getAll();
  const proximos = montajes.filter(m => m.fecha && m.fecha >= ahora && m.fecha <= en7dias)
    .sort((a,b) => a.fecha - b.fecha);
  const urgentes = averias.filter(a => a.urgente && a.estado !== 'resuelta' && a.estado !== 'cobrada');

  let html = '';
  if (proximos.length) {
    html += `<div class="section-header">📅 Próximos 7 días</div>`;
    html += proximos.map(m => `
      <div class="list-item" onclick="openMontajeDetalle(${m.id});Nav.show('screen-montajes')">
        <div style="background:var(--azul-light);color:var(--azul);border-radius:10px;padding:8px;text-align:center;min-width:44px;flex-shrink:0">
          <div style="font-size:16px;font-weight:700">${new Date(m.fecha).getDate()}</div>
          <div style="font-size:10px">${new Date(m.fecha).toLocaleDateString('es-ES',{month:'short'})}</div>
        </div>
        <div class="item-body">
          <div class="item-title">${Utils.escapeHtml(m.cliente)}</div>
          <div class="item-sub">${m.hora||''} · ${Utils.escapeHtml(m.marca||TIPO_MAQUINA_LABEL[m.tipoMaquina]||'')}</div>
        </div>
      </div>`).join('');
  }
  if (urgentes.length) {
    html += `<div class="section-header">🚨 Averías urgentes</div>`;
    html += urgentes.map(a => `
      <div class="list-item" onclick="openAveriaDetalle(${a.id});Nav.show('screen-averias')">
        <div class="item-icon" style="background:var(--rojo-light)">⚠️</div>
        <div class="item-body">
          <div class="item-title">${Utils.escapeHtml(a.cliente)}</div>
          <div class="item-sub">${Utils.escapeHtml(a.descripcion||'Sin descripción')}</div>
        </div>
        <div class="chip chip-rojo">Urgente</div>
      </div>`).join('');
  }
  if (!html) html = `<div class="empty"><div class="empty-icon">✅</div><p>Sin avisos pendientes</p></div>`;
  document.getElementById('avisos-list').innerHTML = html;
}

// ═══════════════════════════════════════════════════════
//  AJUSTES
// ═══════════════════════════════════════════════════════
function renderAjustes() {
  const p = DB.prefs.get();
  actualizarChipsTema(p.tema || 'tema-azul');
  document.getElementById('aj-empresa').value = p.empresa || '';
  document.getElementById('aj-telefono').value = p.telefono || '';
  document.getElementById('aj-direccion').value = p.direccion || '';
  document.getElementById('aj-snd-montaje').value = p.sndMontaje || 'ding';
  document.getElementById('aj-snd-averia').value = p.sndAveria || 'alarm';
  document.getElementById('aj-update-info').textContent = '';
  document.getElementById('aj-update-btn').textContent = '🔍 Buscar actualización';
  document.getElementById('aj-update-btn').disabled = false;
}

function saveAjustes() {
  const p = DB.prefs.get();
  DB.prefs.set({
    ...p,
    empresa: document.getElementById('aj-empresa').value.trim(),
    telefono: document.getElementById('aj-telefono').value.trim(),
    direccion: document.getElementById('aj-direccion').value.trim(),
  });
  toast('Datos guardados');
}

function saveSonidos() {
  const p = DB.prefs.get();
  DB.prefs.set({
    ...p,
    sndMontaje: document.getElementById('aj-snd-montaje').value,
    sndAveria: document.getElementById('aj-snd-averia').value,
  });
  toast('Sonidos guardados');
}

function toggleAjSection(id) {
  const body = document.getElementById(id);
  const chvMap = { 'aj-tema-body':'chv-tema', 'aj-empresa-body':'chv-empresa', 'aj-sonidos-body':'chv-sonidos', 'aj-update-body':'chv-update' };
  const chv = document.getElementById(chvMap[id]);
  const open = body.style.display === 'none';
  body.style.display = open ? 'block' : 'none';
  if (chv) chv.textContent = open ? '⌄' : '›';
}

// ═══════════════════════════════════════════════════════
//  TEMAS
// ═══════════════════════════════════════════════════════
const TEMAS = ['tema-azul','tema-verde','tema-naranja','tema-morado','tema-oscuro','tema-negro'];

function setTema(tema) {
  document.body.classList.remove(...TEMAS);
  document.body.classList.add(tema);
  const p = DB.prefs.get();
  DB.prefs.set({ ...p, tema });
  actualizarChipsTema(tema);
}

function actualizarChipsTema(tema) {
  TEMAS.forEach(t => {
    const el = document.getElementById('tc-' + t);
    if (el) el.classList.toggle('activo', t === tema);
  });
}

function aplicarTemaGuardado() {
  const p = DB.prefs.get();
  const tema = p.tema || 'tema-azul';
  document.body.classList.add(tema);
  actualizarChipsTema(tema);
}

// Sintetizador de sonidos de alerta
function _playSnd(tipo) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    if (tipo === 'ding') {
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = 880;
      o.connect(g); g.gain.setValueAtTime(0.4, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.start(); o.stop(ctx.currentTime + 0.6);
    } else if (tipo === 'beep') {
      [0, 0.2].forEach(t => {
        const o = ctx.createOscillator();
        o.type = 'square'; o.frequency.value = 1000;
        o.connect(g); g.gain.setValueAtTime(0.3, ctx.currentTime + t);
        g.gain.setValueAtTime(0, ctx.currentTime + t + 0.1);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.15);
      });
    } else if (tipo === 'alarm') {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = 440;
      o.frequency.setValueAtTime(440, ctx.currentTime);
      o.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      o.frequency.setValueAtTime(440, ctx.currentTime + 0.6);
      o.connect(g); g.gain.setValueAtTime(0.35, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      o.start(); o.stop(ctx.currentTime + 0.9);
    }
  } catch(e) {}
}

function probarSonido(tipo) {
  const snd = document.getElementById(tipo === 'montaje' ? 'aj-snd-montaje' : 'aj-snd-averia').value;
  if (snd !== 'none') _playSnd(snd);
}

// Reproducir sonido de aviso (llamado desde updateBadges o al llegar avisos)
function playAlertSound(tipoAviso) {
  const p = DB.prefs.get();
  const snd = tipoAviso === 'montaje' ? (p.sndMontaje || 'ding') : (p.sndAveria || 'alarm');
  if (snd !== 'none') _playSnd(snd);
}

// Actualización vía GitHub Releases
const GITHUB_REPO = 'enwattao/climapro-cap';
const VERSION_ACTUAL = '1.9';

async function buscarActualizacion() {
  const btn = document.getElementById('aj-update-btn');
  const info = document.getElementById('aj-update-info');
  btn.disabled = true;
  btn.textContent = '⏳ Comprobando...';
  info.textContent = '';
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (!res.ok) throw new Error('No se pudo contactar con el servidor');
    const data = await res.json();
    const tagVersion = (data.tag_name || '').replace(/^v/i, '');
    if (tagVersion && tagVersion !== VERSION_ACTUAL) {
      const apkAsset = (data.assets || []).find(a => a.name.endsWith('.apk'));
      info.innerHTML = `✅ Nueva versión disponible: <strong>v${tagVersion}</strong>`;
      if (apkAsset) {
        btn.textContent = '⬇️ Descargar v' + tagVersion;
        btn.disabled = false;
        btn.onclick = () => descargarActualizacion(apkAsset.browser_download_url);
      } else {
        btn.textContent = '🔍 Buscar actualización';
        btn.disabled = false;
      }
    } else {
      info.textContent = '✅ Ya tienes la última versión (v' + VERSION_ACTUAL + ')';
      btn.textContent = '🔍 Buscar actualización';
      btn.disabled = false;
      btn.onclick = buscarActualizacion;
    }
  } catch(e) {
    info.textContent = '❌ ' + e.message;
    btn.textContent = '🔍 Buscar actualización';
    btn.disabled = false;
    btn.onclick = buscarActualizacion;
  }
}

function descargarActualizacion(url) {
  // Abre la URL en el navegador del sistema → el download manager de Android descarga el APK
  if (window.Capacitor && Capacitor.isNativePlatform() && Capacitor.Plugins.Browser) {
    Capacitor.Plugins.Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
  toast('Abriendo descarga...');
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  aplicarTemaGuardado();
  // Nav inferior
  document.getElementById('nav-home').onclick = () => { Nav.show('screen-home'); renderHome(); };
  document.getElementById('nav-montajes').onclick = () => { Nav.show('screen-montajes'); renderMontajes(); };
  document.getElementById('nav-averias').onclick = () => { Nav.show('screen-averias'); renderAverias(); };
  document.getElementById('nav-notas').onclick = () => { Nav.show('screen-notas'); renderNotas(); };
  document.getElementById('nav-calendario').onclick = () => { Nav.show('screen-calendario'); renderCalendario(); };

  // Resumen
  document.getElementById('res-prev').onclick = () => { _resumenOffset--; renderResumen(); };
  document.getElementById('res-next').onclick = () => { if (_resumenOffset < 0) { _resumenOffset++; renderResumen(); } };
  document.getElementById('cal-prev').onclick = () => { _calOffset--; renderCalendario(); };
  document.getElementById('cal-next').onclick = () => { _calOffset++; renderCalendario(); };

  // Arranque
  Nav.show('screen-home');
  renderHome();
  updateBadges();
});
