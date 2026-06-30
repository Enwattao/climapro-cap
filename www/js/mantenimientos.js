// ═══════════════════════════════════════════════════════
//  MANTENIMIENTOS
// ═══════════════════════════════════════════════════════
let _editMantId = null;

function renderMantenimientos() {
  const list = DB.mantenimientos.getAll();
  const cont = document.getElementById('mantenimientos-list');
  if (!list.length) {
    cont.innerHTML = `<div class="empty"><div class="empty-icon">🔧</div><p>Sin mantenimientos registrados</p></div>`;
    return;
  }
  cont.innerHTML = list.map(m => `
    <div class="list-item" onclick="openMantDetalle(${m.id})">
      <div class="item-stripe" style="background:var(--verde)"></div>
      <div class="item-body">
        <div class="item-title">${Utils.escapeHtml(m.cliente)}</div>
        <div class="item-sub">${m.tipo||''} · ${m.periodo||''} · ${m.fecha ? Utils.fechaCorta(m.fecha) : 'Sin fecha'}</div>
      </div>
      <div class="item-right">
        ${m.precio ? `<div style="font-weight:600;color:var(--verde)">${Utils.euros(m.precio)}</div>` : ''}
      </div>
    </div>`).join('');
}

function openMantDetalle(id) {
  const m = DB.mantenimientos.getById(id);
  if (!m) return;
  _editMantId = id;

  const realizado = m.estado === 'realizado';
  document.getElementById('mant-detalle-body').innerHTML = `
    <div class="card">
      <div class="card-title">👤 CLIENTE</div>
      <div class="detalle-row"><span class="detalle-label">Nombre</span><span>${Utils.escapeHtml(m.cliente)}</span></div>
      ${m.telefono ? `<div class="detalle-row"><span class="detalle-label">Teléfono</span><a href="tel:${m.telefono}">${m.telefono}</a></div>` : ''}
      ${m.direccion ? `<div class="detalle-row"><span class="detalle-label">Dirección</span><span>${Utils.escapeHtml(m.direccion)}</span></div>` : ''}
    </div>
    <div class="card">
      <div class="card-title">🔧 MANTENIMIENTO</div>
      <div class="detalle-row"><span class="detalle-label">Tipo</span><span>${m.tipo||'-'}</span></div>
      <div class="detalle-row"><span class="detalle-label">Periodicidad</span><span>${m.periodo||'-'}</span></div>
      <div class="detalle-row"><span class="detalle-label">Fecha</span><span>${m.fecha ? Utils.fechaLarga(m.fecha) : 'Sin fecha'}</span></div>
      <div class="detalle-row"><span class="detalle-label">Precio</span><span style="font-weight:600;color:var(--verde)">${Utils.euros(m.precio||0)}</span></div>
      <div class="detalle-row"><span class="detalle-label">Estado</span>
        <span class="chip chip-${realizado ? 'verde' : 'azul'}">${realizado ? '✅ Realizado' : '⏳ Pendiente'}</span>
      </div>
    </div>
    ${m.observaciones ? `<div class="card"><div class="card-title">📝 OBSERVACIONES</div><p style="font-size:14px;line-height:1.5">${Utils.escapeHtml(m.observaciones)}</p></div>` : ''}
    <div style="display:flex;flex-direction:column;gap:10px;padding-bottom:16px">
      ${!realizado ? `<button class="btn btn-verde" onclick="marcarMantRealizado(${id})">✅ Marcar como realizado</button>` : ''}
      <button class="btn btn-outline" onclick="openMantenimientoForm(${id})">✏️ Editar</button>
      <button class="btn btn-rojo" onclick="eliminarMant(${id})">🗑️ Eliminar</button>
    </div>`;

  Nav.show('screen-mant-detalle');
}

function marcarMantRealizado(id) {
  const m = DB.mantenimientos.getById(id);
  if (!m) return;
  m.estado = 'realizado';
  m.fechaRealizado = Date.now();
  DB.mantenimientos.save(m);
  toast('Marcado como realizado');
  openMantDetalle(id);
  renderMantenimientos();
}

function openMantenimientoForm(id = null) {
  _editMantId = id;
  const m = id ? DB.mantenimientos.getById(id) : {};
  document.getElementById('mantf-title').textContent = id ? 'Editar mantenimiento' : 'Nuevo mantenimiento';
  document.getElementById('mantf-cliente').value = m.cliente || '';
  document.getElementById('mantf-telefono').value = m.telefono || '';
  document.getElementById('mantf-direccion').value = m.direccion || '';
  document.getElementById('mantf-tipo').value = m.tipo || 'preventivo';
  document.getElementById('mantf-periodo').value = m.periodo || 'anual';
  document.getElementById('mantf-fecha').value = Utils.inputDate(m.fecha);
  document.getElementById('mantf-precio').value = m.precio || '';
  document.getElementById('mantf-obs').value = m.observaciones || '';
  Nav.show('screen-mant-form');
}

function saveMantenimiento() {
  const cliente = document.getElementById('mantf-cliente').value.trim();
  if (!cliente) { toast('El nombre del cliente es obligatorio'); return; }
  const m = _editMantId ? DB.mantenimientos.getById(_editMantId) : {};
  if (_editMantId) m.id = _editMantId;
  m.cliente = cliente;
  m.telefono = document.getElementById('mantf-telefono').value.trim();
  m.direccion = document.getElementById('mantf-direccion').value.trim();
  m.tipo = document.getElementById('mantf-tipo').value;
  m.periodo = document.getElementById('mantf-periodo').value;
  m.fecha = Utils.fromInputDate(document.getElementById('mantf-fecha').value);
  m.precio = parseFloat(document.getElementById('mantf-precio').value) || 0;
  m.observaciones = document.getElementById('mantf-obs').value.trim();
  DB.mantenimientos.save(m);
  toast('Mantenimiento guardado');
  renderMantenimientos();
  Nav.show('screen-mantenimientos');
}

function eliminarMant(id) {
  const m = DB.mantenimientos.getById(id);
  confirm('Eliminar mantenimiento', `¿Eliminar el mantenimiento de ${m.cliente}?`, () => {
    DB.mantenimientos.delete(id);
    toast('Eliminado');
    renderMantenimientos();
    Nav.show('screen-mantenimientos');
  }, 'Eliminar', 'btn-rojo');
}
