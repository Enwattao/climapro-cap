// ═══════════════════════════════════════════════════════
//  MONTAJES
// ═══════════════════════════════════════════════════════
let _editMontajeId = null;

function renderMontajes() {
  const list = DB.montajes.getAll();
  const cont = document.getElementById('montajes-list');
  const pendientes = list.filter(m => m.estado !== 'cobrado');
  const cobrados = list.filter(m => m.estado === 'cobrado');

  if (!list.length) {
    cont.innerHTML = `<div class="empty"><div class="empty-icon">🔧</div><p>Sin montajes todavía</p></div>`;
    return;
  }

  let html = '';
  if (pendientes.length) {
    html += `<div class="section-header">📋 Activos (${pendientes.length})</div>`;
    html += pendientes.map(m => montajeItemHtml(m)).join('');
  }
  if (cobrados.length) {
    html += `<div class="section-header" style="margin-top:4px">✅ Cobrados (${cobrados.length})</div>`;
    html += cobrados.map(m => montajeItemHtml(m)).join('');
  }
  cont.innerHTML = html;
}

function montajeItemHtml(m) {
  const color = { pendiente:'--naranja', en_curso:'--azul', realizado:'--gris', cobrado:'--verde', lista_espera:'--naranja' }[m.estado] || '--azul';
  return `<div class="list-item" onclick="openMontajeDetalle(${m.id})">
    <div class="item-stripe" style="background:var(${color})"></div>
    <div class="item-body">
      <div class="item-title">${Utils.escapeHtml(m.cliente)}</div>
      <div class="item-sub">${Utils.escapeHtml(m.marca || m.tipoMaquina || '')} · ${m.fecha ? Utils.fechaCorta(m.fecha) : 'Sin fecha'}</div>
    </div>
    <div class="item-right">
      <div class="chip chip-${ESTADO_COLOR[m.estado] || 'azul'}">${ESTADO_LABEL[m.estado] || m.estado}</div>
      ${m.presupuesto ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px">${Utils.euros(m.presupuesto)}</div>` : ''}
    </div>
  </div>`;
}

function openMontajeDetalle(id) {
  const m = DB.montajes.getById(id);
  if (!m) return;
  _editMontajeId = id;

  const color = { pendiente:'var(--naranja)', en_curso:'var(--azul)', realizado:'#607d8b', cobrado:'var(--verde)', lista_espera:'var(--naranja)' }[m.estado] || 'var(--azul)';

  document.getElementById('montaje-det-content').innerHTML = `
    <div class="estado-banner" style="background:${color}">
      <span>Nº MT-${String(m.id).padStart(5,'0')}</span>
      <span class="chip" style="background:rgba(255,255,255,.2);color:#fff">${ESTADO_LABEL[m.estado] || m.estado}</span>
    </div>
    <div style="padding:12px;display:flex;flex-direction:column;gap:10px">
      <div class="card">
        <div class="card-title"><div class="dot" style="background:var(--azul)"></div>CLIENTE</div>
        <div class="detail-row"><span class="dr-label">Nombre</span><span class="dr-value">${Utils.escapeHtml(m.cliente)}</span></div>
        ${m.telefono ? `<div class="detail-row"><span class="dr-label">Teléfono</span><a href="tel:${m.telefono}" class="dr-value" style="color:var(--azul)">${m.telefono}</a></div>` : ''}
        ${m.direccion ? `<div class="detail-row"><span class="dr-label">Dirección</span><span class="dr-value">${Utils.escapeHtml(m.direccion)}</span></div>` : ''}
      </div>
      ${m.fecha ? `<div class="card">
        <div class="card-title"><div class="dot" style="background:var(--morado)"></div>PLANIFICACIÓN</div>
        <div class="detail-row"><span class="dr-label">Fecha</span><span class="dr-value">${Utils.fechaCorta(m.fecha)}</span></div>
        ${m.hora ? `<div class="detail-row"><span class="dr-label">Hora</span><span class="dr-value">${m.hora}</span></div>` : ''}
        ${m.horasEstimadas ? `<div class="detail-row"><span class="dr-label">Duración est.</span><span class="dr-value">${m.horasEstimadas}h</span></div>` : ''}
      </div>` : ''}
      <div class="card">
        <div class="card-title"><div class="dot" style="background:var(--gris,#607d8b)"></div>EQUIPO</div>
        ${m.marca ? `<div class="detail-row"><span class="dr-label">Marca</span><span class="dr-value">${Utils.escapeHtml(m.marca)}</span></div>` : ''}
        ${m.modelo ? `<div class="detail-row"><span class="dr-label">Modelo</span><span class="dr-value">${Utils.escapeHtml(m.modelo)}</span></div>` : ''}
        <div class="detail-row"><span class="dr-label">Tipo</span><span class="dr-value">${TIPO_MAQUINA_LABEL[m.tipoMaquina] || m.tipoMaquina}</span></div>
        <div class="detail-row"><span class="dr-label">Unidades</span><span class="dr-value">${m.numMaquinas || 1}</span></div>
      </div>
      <div class="card">
        <div class="card-title"><div class="dot" style="background:var(--verde)"></div>ECONÓMICO</div>
        ${m.presupuesto ? `<div class="detail-row"><span class="dr-label">Presupuesto</span><span class="dr-value">${Utils.euros(m.presupuesto)}</span></div>` : ''}
        ${m.sueldoAyudante ? `<div class="detail-row"><span class="dr-label">Sueldo ayudante</span><span class="dr-value">${Utils.euros(m.sueldoAyudante)}</span></div>` : ''}
        <div class="detail-row"><span class="dr-label">Cobrado</span><span class="dr-value" style="color:var(--verde);font-weight:700">${Utils.euros(m.importeCobrado)}</span></div>
        <div class="detail-row"><span class="dr-label">Método pago</span><span class="dr-value">${METODO_PAGO_LABEL[m.metodoPago] || '-'}</span></div>
        <div class="detail-row" style="border-top:1px solid var(--border);padding-top:8px">
          <span class="dr-label">Beneficio</span>
          <span class="dr-value" style="color:${(m.importeCobrado||0)-(m.presupuesto||0)-(m.sueldoAyudante||0)>=0?'var(--verde)':'var(--rojo)'};font-weight:700">
            ${Utils.euros((m.importeCobrado||0)-(m.sueldoAyudante||0))}
          </span>
        </div>
      </div>
      ${m.observaciones ? `<div class="card"><div class="card-title">📝 OBSERVACIONES</div><p style="font-size:14px">${Utils.escapeHtml(m.observaciones)}</p></div>` : ''}
      <div style="display:flex;flex-direction:column;gap:8px;padding-bottom:12px">
        <div class="btn-row">
          <button class="btn btn-primary" onclick="abrirFirmaYPdf(${m.id})">📄 Albarán PDF</button>
          ${m.estado !== 'cobrado' && m.estado !== 'realizado' ? `<button class="btn btn-verde" onclick="marcarRealizado(${m.id})">✅ Realizado</button>` : ''}
          ${m.estado === 'realizado' ? `<button class="btn btn-verde" onclick="abrirCobro(${m.id})">💶 Cobrar</button>` : ''}
        </div>
        ${!m.fecha ? `<button class="btn btn-outline" onclick="abrirAsignarFecha(${m.id})">📅 Asignar fecha</button>` : ''}
      </div>
    </div>`;

  Nav.show('screen-montaje-detalle');
}

function marcarRealizado(id) {
  const m = DB.montajes.getById(id);
  m.estado = 'realizado';
  m.fechaFinalizacion = Date.now();
  DB.montajes.save(m);
  toast('Marcado como realizado');
  openMontajeDetalle(id);
  renderMontajes(); updateBadges();
}

function abrirCobro(id) {
  const m = DB.montajes.getById(id);
  document.getElementById('cobro-importe').value = m.presupuesto || '';
  document.getElementById('cobro-metodo').value = m.metodoPago || 'efectivo';
  document.getElementById('cobro-save').onclick = () => {
    m.importeCobrado = parseFloat(document.getElementById('cobro-importe').value) || 0;
    m.metodoPago = document.getElementById('cobro-metodo').value;
    m.estado = 'cobrado';
    m.estadoCobro = 'cobrado';
    m.fechaCobro = Date.now();
    DB.montajes.save(m);
    closeModal('cobro-modal');
    toast('Cobro registrado');
    openMontajeDetalle(id);
    renderMontajes(); updateBadges();
  };
  openModal('cobro-modal');
}

function abrirAsignarFecha(id) {
  const m = DB.montajes.getById(id);
  document.getElementById('fecha-fecha').value = Utils.inputDate(m.fecha);
  document.getElementById('fecha-hora').value = m.hora || '';
  document.getElementById('fecha-horas').value = m.horasEstimadas || '';
  document.getElementById('fecha-save').onclick = () => {
    m.fecha = Utils.fromInputDate(document.getElementById('fecha-fecha').value);
    m.hora = document.getElementById('fecha-hora').value;
    m.horasEstimadas = parseFloat(document.getElementById('fecha-horas').value) || 0;
    if (m.estado === 'lista_espera' || m.estado === 'pendiente') m.estado = 'en_curso';
    DB.montajes.save(m);
    closeModal('fecha-modal');
    toast('Fecha asignada');
    openMontajeDetalle(id);
    renderMontajes();
  };
  openModal('fecha-modal');
}

function openMontajeForm(id = null) {
  _editMontajeId = id;
  const m = id ? DB.montajes.getById(id) : {};
  document.getElementById('mf-title').textContent = id ? 'Editar montaje' : 'Nuevo montaje';
  document.getElementById('mf-cliente').value = m.cliente || '';
  document.getElementById('mf-telefono').value = m.telefono || '';
  document.getElementById('mf-direccion').value = m.direccion || '';
  document.getElementById('mf-marca').value = m.marca || '';
  document.getElementById('mf-modelo').value = m.modelo || '';
  document.getElementById('mf-tipo').value = m.tipoMaquina || 'split';
  document.getElementById('mf-num').value = m.numMaquinas || 1;
  document.getElementById('mf-fecha').value = Utils.inputDate(m.fecha);
  document.getElementById('mf-hora').value = m.hora || '';
  document.getElementById('mf-horas').value = m.horasEstimadas || '';
  document.getElementById('mf-presupuesto').value = m.presupuesto || '';
  document.getElementById('mf-ayudante').value = m.sueldoAyudante || '';
  document.getElementById('mf-obs').value = m.observaciones || '';
  document.getElementById('mf-estado').value = m.estado || 'pendiente';
  Nav.show('screen-montaje-form');
}

function saveMontaje() {
  const cliente = document.getElementById('mf-cliente').value.trim();
  if (!cliente) { toast('El nombre del cliente es obligatorio'); return; }
  const m = _editMontajeId ? DB.montajes.getById(_editMontajeId) : {};
  if (_editMontajeId) m.id = _editMontajeId;
  m.cliente = cliente;
  m.telefono = document.getElementById('mf-telefono').value.trim();
  m.direccion = document.getElementById('mf-direccion').value.trim();
  m.marca = document.getElementById('mf-marca').value.trim();
  m.modelo = document.getElementById('mf-modelo').value.trim();
  m.tipoMaquina = document.getElementById('mf-tipo').value;
  m.numMaquinas = parseInt(document.getElementById('mf-num').value) || 1;
  m.fecha = Utils.fromInputDate(document.getElementById('mf-fecha').value);
  m.hora = document.getElementById('mf-hora').value;
  m.horasEstimadas = parseFloat(document.getElementById('mf-horas').value) || 0;
  m.presupuesto = parseFloat(document.getElementById('mf-presupuesto').value) || 0;
  m.sueldoAyudante = parseFloat(document.getElementById('mf-ayudante').value) || 0;
  m.observaciones = document.getElementById('mf-obs').value.trim();
  m.estado = document.getElementById('mf-estado').value;
  DB.montajes.save(m);
  toast('Montaje guardado');
  renderMontajes(); updateBadges();
  if (_editMontajeId) { openMontajeDetalle(_editMontajeId); }
  else { Nav.show('screen-montajes'); }
}

function eliminarMontaje(id) {
  const m = DB.montajes.getById(id);
  confirm('Eliminar montaje', `¿Eliminar el montaje de ${m.cliente}? No se puede deshacer.`, () => {
    DB.montajes.delete(id);
    toast('Montaje eliminado');
    renderMontajes(); updateBadges();
    Nav.show('screen-montajes');
  }, 'Eliminar', 'btn-rojo');
}
