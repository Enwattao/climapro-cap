// ═══════════════════════════════════════════════════════
//  GASTOS
// ═══════════════════════════════════════════════════════
let _editGastoId = null;

function renderGastos() {
  const list = DB.gastos.getAll();
  const cont = document.getElementById('gastos-list');
  if (!list.length) {
    cont.innerHTML = `<div class="empty"><div class="empty-icon">🧾</div><p>Sin gastos registrados</p></div>`;
    return;
  }
  cont.innerHTML = list.map(g => `
    <div class="list-item" onclick="openGastoForm(${g.id})">
      <div class="item-stripe" style="background:var(--naranja)"></div>
      <div class="item-body">
        <div class="item-title">${Utils.escapeHtml(g.concepto)}</div>
        <div class="item-sub">${CATEGORIA_GASTO_LABEL[g.categoria] || g.categoria} · ${Utils.fechaCorta(g.fecha)}</div>
      </div>
      <div class="item-right">
        <div style="font-weight:700;color:var(--rojo)">${Utils.euros(g.importe)}</div>
        <button class="btn btn-sm btn-outline" style="margin-top:6px" onclick="event.stopPropagation();eliminarGasto(${g.id})">🗑</button>
      </div>
    </div>`).join('');
}

function openGastoForm(id = null) {
  _editGastoId = id;
  const g = id ? DB.gastos.getAll().find(x => x.id === id) : {};
  document.getElementById('gf-title').textContent = id ? 'Editar gasto' : 'Nuevo gasto';
  document.getElementById('gf-concepto').value = g.concepto || '';
  document.getElementById('gf-importe').value = g.importe || '';
  document.getElementById('gf-categoria').value = g.categoria || 'otros';
  document.getElementById('gf-fecha').value = Utils.inputDate(g.fecha || Date.now());
  document.getElementById('gf-notas').value = g.notas || '';
  Nav.show('screen-gasto-form');
}

function saveGasto() {
  const concepto = document.getElementById('gf-concepto').value.trim();
  if (!concepto) { toast('El concepto es obligatorio'); return; }
  const g = _editGastoId ? DB.gastos.getAll().find(x => x.id === _editGastoId) : {};
  if (_editGastoId) g.id = _editGastoId;
  g.concepto = concepto;
  g.importe = parseFloat(document.getElementById('gf-importe').value) || 0;
  g.categoria = document.getElementById('gf-categoria').value;
  g.fecha = Utils.fromInputDate(document.getElementById('gf-fecha').value) || Date.now();
  g.notas = document.getElementById('gf-notas').value.trim();
  DB.gastos.save(g);
  toast('Gasto guardado');
  renderGastos();
  Nav.show('screen-gastos');
}

function eliminarGasto(id) {
  confirm('Eliminar gasto', '¿Eliminar este gasto?', () => {
    DB.gastos.delete(id);
    toast('Gasto eliminado');
    renderGastos();
  }, 'Eliminar', 'btn-rojo');
}

// ═══════════════════════════════════════════════════════
//  NOTAS
// ═══════════════════════════════════════════════════════
let _editNotaId = null;

function renderNotas() {
  const list = DB.notas.getAll();
  const cont = document.getElementById('notas-list');
  if (!list.length) {
    cont.innerHTML = `<div class="empty"><div class="empty-icon">📝</div><p>Sin notas todavía</p></div>`;
    return;
  }
  cont.innerHTML = list.map(n => `
    <div class="card" style="cursor:pointer" onclick="openNotaForm(${n.id})">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:15px;margin-bottom:4px">${Utils.escapeHtml(n.titulo)}</div>
          ${n.contenido ? `<div style="font-size:13px;color:var(--text-muted);white-space:pre-wrap">${Utils.escapeHtml(n.contenido.slice(0,120))}${n.contenido.length>120?'…':''}</div>` : ''}
        </div>
        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation();eliminarNota(${n.id})">🗑</button>
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:8px">${Utils.fechaLarga(n.creadoEn)}</div>
    </div>`).join('');
}

function openNotaForm(id = null) {
  _editNotaId = id;
  const n = id ? DB.notas.getAll().find(x => x.id === id) : {};
  document.getElementById('nf-title').textContent = id ? 'Editar nota' : 'Nueva nota';
  document.getElementById('nf-titulo').value = n.titulo || '';
  document.getElementById('nf-contenido').value = n.contenido || '';
  Nav.show('screen-nota-form');
}

function saveNota() {
  const titulo = document.getElementById('nf-titulo').value.trim();
  if (!titulo) { toast('El título es obligatorio'); return; }
  const n = _editNotaId ? DB.notas.getAll().find(x => x.id === _editNotaId) : {};
  if (_editNotaId) n.id = _editNotaId;
  n.titulo = titulo;
  n.contenido = document.getElementById('nf-contenido').value.trim();
  DB.notas.save(n);
  toast('Nota guardada');
  renderNotas();
  Nav.show('screen-notas');
}

function eliminarNota(id) {
  confirm('Eliminar nota', '¿Eliminar esta nota?', () => {
    DB.notas.delete(id);
    toast('Nota eliminada');
    renderNotas();
  }, 'Eliminar', 'btn-rojo');
}

// ═══════════════════════════════════════════════════════
//  RESUMEN
// ═══════════════════════════════════════════════════════
let _resumenOffset = 0;

function renderResumen() {
  const inicio = Utils.inicioMes(_resumenOffset);
  const fin = Utils.finMes(_resumenOffset);
  const montajes = DB.montajes.getEnRango(inicio, fin);
  const gastos = DB.gastos.getEnRango(inicio, fin);
  const averias = DB.averias.getEnRango(inicio, fin);

  const mantenimientosMes = DB.mantenimientos.getAll().filter(m => m.fecha && m.fecha >= inicio && m.fecha <= fin);
  const cobradosMontajes = montajes.filter(m => m.estado === 'cobrado' || m.estado === 'realizado');
  const ingresos = cobradosMontajes.reduce((s, m) => s + (m.importeCobrado || 0), 0)
    + averias.filter(a => a.estado === 'cobrada').reduce((s, a) => s + (a.importeCobrado || 0), 0)
    + mantenimientosMes.filter(m => m.estado === 'realizado').reduce((s, m) => s + (m.precio || 0), 0);
  const gastoTotal = gastos.reduce((s, g) => s + (g.importe || 0), 0);
  const beneficio = ingresos - gastoTotal;

  document.getElementById('res-mes').textContent = Utils.mesAnio(inicio);
  document.getElementById('res-ingresos').textContent = Utils.euros(ingresos);
  document.getElementById('res-gastos-val').textContent = Utils.euros(gastoTotal);
  document.getElementById('res-beneficio').textContent = Utils.euros(beneficio);
  document.getElementById('res-beneficio').style.color = beneficio >= 0 ? 'var(--verde)' : 'var(--rojo)';
  document.getElementById('res-beneficio-card').style.background = beneficio >= 0 ? 'var(--verde-light)' : 'var(--rojo-light)';
  document.getElementById('res-montajes').textContent = montajes.length;
  document.getElementById('res-cobrados').textContent = cobradosMontajes.length;

  const detGastos = document.getElementById('res-det-gastos');
  if (gastos.length) {
    detGastos.innerHTML = gastos.sort((a,b) => b.fecha - a.fecha).map(g => `
      <div class="detail-row">
        <div><div style="font-size:13px;font-weight:500">${Utils.escapeHtml(g.concepto)}</div>
        <div style="font-size:11px;color:var(--text-muted)">${CATEGORIA_GASTO_LABEL[g.categoria]||g.categoria}</div></div>
        <span style="color:var(--rojo);font-weight:600">${Utils.euros(g.importe)}</span>
      </div>`).join('');
  } else {
    detGastos.innerHTML = '<p style="font-size:13px;color:var(--text-muted)">Sin gastos este mes</p>';
  }

  document.getElementById('res-prev').style.opacity = '1';
  document.getElementById('res-next').style.opacity = _resumenOffset < 0 ? '1' : '0.3';
}

// ═══════════════════════════════════════════════════════
//  CALENDARIO
// ═══════════════════════════════════════════════════════
let _calOffset = 0;
let _calDiaSeleccionado = null;

function renderCalendario() {
  const hoy = new Date();
  const ref = new Date(hoy.getFullYear(), hoy.getMonth() + _calOffset, 1);
  const anio = ref.getFullYear();
  const mes = ref.getMonth();

  document.getElementById('cal-mes').textContent =
    ref.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());

  // Recoger eventos del mes
  const inicio = new Date(anio, mes, 1).getTime();
  const fin = new Date(anio, mes + 1, 0, 23, 59, 59).getTime();
  const montajes = DB.montajes.getAll().filter(m => m.fecha && m.fecha >= inicio && m.fecha <= fin);
  const averias = DB.averias.getAll().filter(a => a.creadoEn >= inicio && a.creadoEn <= fin);
  const mantenimientos = DB.mantenimientos.getAll().filter(m => m.fecha && m.fecha >= inicio && m.fecha <= fin);

  // Mapa día → eventos
  const eventosPorDia = {};
  montajes.forEach(m => {
    const d = new Date(m.fecha).getDate();
    if (!eventosPorDia[d]) eventosPorDia[d] = [];
    eventosPorDia[d].push({ tipo: 'montaje', color: 'var(--azul)', obj: m });
  });
  mantenimientos.forEach(m => {
    const d = new Date(m.fecha).getDate();
    if (!eventosPorDia[d]) eventosPorDia[d] = [];
    eventosPorDia[d].push({ tipo: 'mant', color: 'var(--verde)', obj: m });
  });

  // Construir grid
  const primerDia = new Date(anio, mes, 1).getDay(); // 0=dom
  const primerLunes = primerDia === 0 ? 6 : primerDia - 1; // offset para lunes primero
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const diasMesAnterior = new Date(anio, mes, 0).getDate();

  let gridHtml = `<div class="cal-grid">`;
  ['L','M','X','J','V','S','D'].forEach(d => {
    gridHtml += `<div class="cal-header-day">${d}</div>`;
  });

  // Días mes anterior
  for (let i = primerLunes - 1; i >= 0; i--) {
    gridHtml += `<div class="cal-day otro-mes"><div class="cal-day-num">${diasMesAnterior - i}</div></div>`;
  }
  // Días del mes
  for (let d = 1; d <= diasEnMes; d++) {
    const esHoy = hoy.getFullYear() === anio && hoy.getMonth() === mes && hoy.getDate() === d;
    const esSel = _calDiaSeleccionado === d;
    const eventos = eventosPorDia[d] || [];
    const dots = eventos.slice(0, 3).map(e => `<div class="cal-dot" style="background:${e.color}"></div>`).join('');
    gridHtml += `<div class="cal-day${esHoy?' today':''}${esSel?' selected':''}" onclick="seleccionarDia(${d},${anio},${mes})">
      <div class="cal-day-num">${d}</div>
      ${dots ? `<div class="cal-dots">${dots}</div>` : ''}
    </div>`;
  }
  // Rellenar resto
  const celdasUsadas = primerLunes + diasEnMes;
  const resto = celdasUsadas % 7 === 0 ? 0 : 7 - (celdasUsadas % 7);
  for (let i = 1; i <= resto; i++) {
    gridHtml += `<div class="cal-day otro-mes"><div class="cal-day-num">${i}</div></div>`;
  }
  gridHtml += `</div>`;

  document.getElementById('cal-grid-wrap').innerHTML = gridHtml;

  // Si hay día seleccionado, mostrar sus eventos
  if (_calDiaSeleccionado) {
    renderEventosDia(_calDiaSeleccionado, anio, mes, eventosPorDia);
  } else {
    document.getElementById('cal-eventos-dia').innerHTML = '';
  }
}

function seleccionarDia(dia, anio, mes) {
  _calDiaSeleccionado = dia;
  const hoy = new Date();
  const ref = new Date(hoy.getFullYear(), hoy.getMonth() + _calOffset, 1);
  const inicio = new Date(ref.getFullYear(), ref.getMonth(), 1).getTime();
  const fin = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59).getTime();

  const montajes = DB.montajes.getAll().filter(m => m.fecha && m.fecha >= inicio && m.fecha <= fin);
  const mantenimientos = DB.mantenimientos.getAll().filter(m => m.fecha && m.fecha >= inicio && m.fecha <= fin);
  const eventosPorDia = {};
  montajes.forEach(m => {
    const d = new Date(m.fecha).getDate();
    if (!eventosPorDia[d]) eventosPorDia[d] = [];
    eventosPorDia[d].push({ tipo: 'montaje', color: 'var(--azul)', obj: m });
  });
  mantenimientos.forEach(m => {
    const d = new Date(m.fecha).getDate();
    if (!eventosPorDia[d]) eventosPorDia[d] = [];
    eventosPorDia[d].push({ tipo: 'mant', color: 'var(--verde)', obj: m });
  });

  // Redibuja solo el grid para marcar selección
  document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected'));
  renderEventosDia(dia, anio, mes, eventosPorDia);
  renderCalendario();
}

function renderEventosDia(dia, anio, mes, eventosPorDia) {
  const cont = document.getElementById('cal-eventos-dia');
  const eventos = eventosPorDia[dia] || [];
  const fecha = new Date(anio, mes, dia).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!eventos.length) {
    cont.innerHTML = `<div class="section-header" style="margin-top:8px">📅 ${fecha.replace(/^\w/,c=>c.toUpperCase())}</div>
      <div style="color:var(--text-muted);font-size:13px;padding:8px 0">Sin citas este día</div>`;
    return;
  }

  cont.innerHTML = `<div class="section-header" style="margin-top:8px">📅 ${fecha.replace(/^\w/,c=>c.toUpperCase())}</div>
    <div class="cal-eventos">
      ${eventos.map(e => {
        const o = e.obj;
        const hora = o.hora || '';
        const titulo = o.cliente || '';
        const sub = e.tipo === 'montaje'
          ? `Montaje · ${o.marca || TIPO_MAQUINA_LABEL[o.tipoMaquina] || ''}`
          : `Mantenimiento · ${o.tipo || ''}`;
        const onclick = e.tipo === 'montaje'
          ? `openMontajeDetalle(${o.id})`
          : `openMantenimientoForm(${o.id})`;
        return `<div class="cal-evento-item" onclick="${onclick}" style="border-left:3px solid ${e.color}">
          <div class="cal-evento-hora">${hora || '--:--'}</div>
          <div class="cal-evento-body">
            <div class="cal-evento-title">${Utils.escapeHtml(titulo)}</div>
            <div class="cal-evento-sub">${Utils.escapeHtml(sub)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════════════
//  FIRMA + PDF
// ═══════════════════════════════════════════════════════
let _firmaCtx, _firmaDrawing = false, _firmaCallback = null;

function initFirma() {
  const canvas = document.getElementById('firma-canvas');
  const wrap = canvas.parentElement;
  canvas.width = wrap.clientWidth;
  canvas.height = 180;
  _firmaCtx = canvas.getContext('2d');
  _firmaCtx.strokeStyle = '#1e293b';
  _firmaCtx.lineWidth = 3;
  _firmaCtx.lineCap = 'round';
  _firmaCtx.lineJoin = 'round';

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: (t.clientX - r.left) * (canvas.width / r.width), y: (t.clientY - r.top) * (canvas.height / r.height) };
  };
  canvas.onmousedown = canvas.ontouchstart = (e) => { e.preventDefault(); _firmaDrawing = true; const p = pos(e); _firmaCtx.beginPath(); _firmaCtx.moveTo(p.x, p.y); };
  canvas.onmousemove = canvas.ontouchmove = (e) => { e.preventDefault(); if (!_firmaDrawing) return; const p = pos(e); _firmaCtx.lineTo(p.x, p.y); _firmaCtx.stroke(); };
  canvas.onmouseup = canvas.onmouseleave = canvas.ontouchend = () => { _firmaDrawing = false; };
}

function borrarFirma() {
  const canvas = document.getElementById('firma-canvas');
  _firmaCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function abrirFirmaYPdf(montajeId) {
  _firmaCallback = montajeId;
  openModal('firma-modal');
  setTimeout(initFirma, 100);
}

function guardarFirmaYPdf() {
  const canvas = document.getElementById('firma-canvas');
  const firmaDataUrl = canvas.toDataURL('image/png');
  closeModal('firma-modal');
  generarPdfMontaje(_firmaCallback, firmaDataUrl);
}

function saltarFirma() {
  closeModal('firma-modal');
  generarPdfMontaje(_firmaCallback, null);
}

function generarPdfMontaje(id, firmaDataUrl) {
  const m = DB.montajes.getById(id);
  const prefs = DB.prefs.get();
  if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
    toast('Generando PDF…');
    return;
  }
  const { jsPDF } = window.jspdf || window;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, pad = 14;

  // Cabecera
  doc.setFillColor(15, 31, 110);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(prefs.empresa || 'Mi Empresa', pad, 12);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  if (prefs.telefono) doc.text(prefs.telefono, pad, 18);
  if (prefs.direccion) doc.text(prefs.direccion, pad, 23);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.setTextColor(255,255,255);
  doc.text('ALBARÁN', W - pad, 14, { align: 'right' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(`Nº MT-${String(m.id).padStart(5,'0')}`, W - pad, 21, { align: 'right' });

  // Línea
  doc.setDrawColor(74, 108, 247); doc.setLineWidth(0.8);
  doc.line(pad, 32, W - pad, 32);

  let y = 38;
  const section = (title) => {
    doc.setFillColor(240, 242, 247);
    doc.rect(pad, y, W - pad*2, 6, 'F');
    doc.setTextColor(74, 108, 247); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(title, pad + 2, y + 4.2);
    y += 9;
  };
  const row2 = (label, value) => {
    doc.setTextColor(100, 116, 139); doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
    doc.text(label, pad + 2, y + 4);
    doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'bold');
    doc.text(String(value || '-'), pad + 50, y + 4);
    doc.setDrawColor(220, 224, 236); doc.setLineWidth(0.2);
    doc.line(pad, y + 7, W - pad, y + 7);
    y += 9;
  };

  section('DATOS DEL CLIENTE');
  row2('Nombre', m.cliente);
  if (m.telefono) row2('Teléfono', m.telefono);
  if (m.direccion) row2('Dirección', m.direccion);

  y += 4;
  section('DATOS DEL TRABAJO');
  row2('Tipo', 'Montaje de climatización');
  row2('Fecha', m.fecha ? Utils.fechaCorta(m.fecha) : '-');
  if (m.marca) row2('Marca', m.marca);
  if (m.modelo) row2('Modelo', m.modelo);
  row2('Tipo equipo', TIPO_MAQUINA_LABEL[m.tipoMaquina] || m.tipoMaquina);
  row2('Unidades', m.numMaquinas || 1);

  if (m.observaciones) {
    y += 4;
    section('TRABAJOS REALIZADOS / OBSERVACIONES');
    doc.setTextColor(30, 41, 59); doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(m.observaciones, W - pad*2 - 4);
    doc.text(lines, pad + 2, y + 4);
    y += lines.length * 5 + 4;
  }

  y += 4;
  section('IMPORTES');
  if (m.presupuesto) row2('Precio trabajo', Utils.euros(m.presupuesto));
  if (m.sueldoAyudante) row2('Sueldo ayudante', Utils.euros(m.sueldoAyudante));
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(34, 197, 94);
  doc.text(`TOTAL: ${Utils.euros(m.importeCobrado || 0)}`, W - pad, y + 4, { align: 'right' });
  y += 12;

  // Firma
  y += 6;
  doc.setTextColor(74, 108, 247); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('FIRMA DEL CLIENTE', pad, y);
  y += 4;
  doc.setDrawColor(200, 200, 210); doc.setLineWidth(0.3);
  doc.rect(pad, y, 80, 28);
  if (firmaDataUrl) {
    try { doc.addImage(firmaDataUrl, 'PNG', pad + 2, y + 2, 76, 24); } catch(e) {}
  }
  doc.setTextColor(150, 150, 150); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('Documento de entrega. No es una factura.', pad, y + 34);

  // Guardar / compartir
  const nombre = `albaran_MT-${String(m.id).padStart(5,'0')}.pdf`;

  if (window.Capacitor && Capacitor.isNativePlatform()) {
    const b64 = doc.output('datauristring').split(',')[1];
    Capacitor.Plugins.Filesystem.writeFile({
      path: nombre,
      data: b64,
      directory: 'CACHE',
      recursive: true
    }).then(res => {
      return Capacitor.Plugins.Share.share({
        title: nombre,
        url: res.uri,
        dialogTitle: 'Guardar o compartir albarán'
      });
    }).catch(e => toast('Error al generar PDF: ' + e.message));
  } else {
    doc.save(nombre);
  }
  toast('PDF generado');
}
