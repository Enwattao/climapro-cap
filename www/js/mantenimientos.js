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
  Nav.show('screen-mantenimientos');
  // Para simplicidad, abre el formulario de edición directamente
  openMantenimientoForm(id);
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
