// ═══════════════════════════════════════════════════════
//  OTROS TRABAJOS
// ═══════════════════════════════════════════════════════
let _editOtroId = null;

function renderOtrostrabajos() {
  const list = DB.otrostrabajos.getAll();
  const cont = document.getElementById('otrostrabajos-list');
  if (!list.length) {
    cont.innerHTML = `<div class="empty"><div class="empty-icon">💼</div><p>Sin trabajos registrados</p></div>`;
    return;
  }
  cont.innerHTML = list.map(t => {
    const cobrado = t.estado === 'cobrado';
    const color = cobrado ? 'var(--text-muted)' : 'var(--morado)';
    return `
    <div class="list-item" onclick="openOtroDetalle(${t.id})">
      <div class="item-stripe" style="background:${color}"></div>
      <div class="item-body">
        <div class="item-title">${Utils.escapeHtml(t.nombre)}</div>
        <div class="item-sub">${Utils.escapeHtml(t.cliente||'')} · ${t.fecha ? Utils.fechaCorta(t.fecha) : Utils.fechaCorta(t.creadoEn)}</div>
      </div>
      <div class="item-right" style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        ${t.precio ? `<div style="font-weight:600;color:${color}">${Utils.euros(t.precio)}</div>` : ''}
        <div class="chip chip-${cobrado ? 'gris' : 'morado'}" style="font-size:10px">${cobrado ? '✅ Cobrado' : '⏳ Pendiente'}</div>
      </div>
    </div>`;
  }).join('');
}

function openOtroDetalle(id) {
  const t = DB.otrostrabajos.getById(id);
  if (!t) return;
  _editOtroId = id;
  const cobrado = t.estado === 'cobrado';
  document.getElementById('otro-detalle-body').innerHTML = `
    <div class="card">
      <div class="card-title">💼 TRABAJO</div>
      <div class="detalle-row"><span class="detalle-label">Tipo</span><span style="font-weight:600">${Utils.escapeHtml(t.nombre)}</span></div>
      ${t.cliente ? `<div class="detalle-row"><span class="detalle-label">Cliente</span><span>${Utils.escapeHtml(t.cliente)}</span></div>` : ''}
      ${t.telefono ? `<div class="detalle-row"><span class="detalle-label">Teléfono</span><a href="tel:${t.telefono}">${t.telefono}</a></div>` : ''}
      ${t.direccion ? `<div class="detalle-row"><span class="detalle-label">Dirección</span><span>${Utils.escapeHtml(t.direccion)}</span></div>` : ''}
      <div class="detalle-row"><span class="detalle-label">Fecha</span><span>${t.fecha ? Utils.fechaLarga(t.fecha) : Utils.fechaLarga(t.creadoEn)}</span></div>
      <div class="detalle-row"><span class="detalle-label">Precio</span><span style="font-weight:600;color:var(--morado)">${Utils.euros(t.precio||0)}</span></div>
      <div class="detalle-row"><span class="detalle-label">Estado</span>
        <span class="chip chip-${cobrado ? 'gris' : 'morado'}">${cobrado ? '✅ Cobrado' : '⏳ Pendiente'}</span>
      </div>
    </div>
    ${t.descripcion ? `<div class="card"><div class="card-title">📝 DESCRIPCIÓN</div><p style="font-size:14px;line-height:1.5">${Utils.escapeHtml(t.descripcion)}</p></div>` : ''}
    <div style="display:flex;flex-direction:column;gap:10px;padding-bottom:16px">
      ${!cobrado ? `<button class="btn btn-verde" onclick="cobrarOtro(${id})">💰 Marcar como cobrado</button>` : ''}
      <button class="btn btn-outline" onclick="openOtroForm(${id})">✏️ Editar</button>
      <button class="btn btn-rojo" onclick="eliminarOtro(${id})">🗑️ Eliminar</button>
    </div>`;
  Nav.show('screen-otro-detalle');
}

function cobrarOtro(id) {
  const t = DB.otrostrabajos.getById(id);
  if (!t) return;
  t.estado = 'cobrado';
  t.fechaCobro = Date.now();
  DB.otrostrabajos.save(t);
  toast('Marcado como cobrado');
  openOtroDetalle(id);
  renderOtrostrabajos();
}

function openOtroForm(id = null) {
  _editOtroId = id;
  const t = id ? DB.otrostrabajos.getById(id) : {};
  document.getElementById('otro-form-title').textContent = id ? 'Editar trabajo' : 'Nuevo trabajo';
  document.getElementById('otf-nombre').value = t.nombre || '';
  document.getElementById('otf-cliente').value = t.cliente || '';
  document.getElementById('otf-telefono').value = t.telefono || '';
  document.getElementById('otf-direccion').value = t.direccion || '';
  document.getElementById('otf-fecha').value = Utils.inputDate(t.fecha);
  document.getElementById('otf-precio').value = t.precio || '';
  document.getElementById('otf-descripcion').value = t.descripcion || '';
  Nav.show('screen-otro-form');
}

function saveOtro() {
  const nombre = document.getElementById('otf-nombre').value.trim();
  if (!nombre) { toast('El tipo de trabajo es obligatorio'); return; }
  const t = _editOtroId ? DB.otrostrabajos.getById(_editOtroId) : {};
  if (_editOtroId) t.id = _editOtroId;
  t.nombre = nombre;
  t.cliente = document.getElementById('otf-cliente').value.trim();
  t.telefono = document.getElementById('otf-telefono').value.trim();
  t.direccion = document.getElementById('otf-direccion').value.trim();
  t.fecha = Utils.fromInputDate(document.getElementById('otf-fecha').value);
  t.precio = parseFloat(document.getElementById('otf-precio').value) || 0;
  t.descripcion = document.getElementById('otf-descripcion').value.trim();
  DB.otrostrabajos.save(t);
  toast('Trabajo guardado');
  renderOtrostrabajos();
  Nav.show('screen-otrostrabajos');
}

function eliminarOtro(id) {
  const t = DB.otrostrabajos.getById(id);
  confirm('Eliminar trabajo', `¿Eliminar "${t.nombre}"?`, () => {
    DB.otrostrabajos.delete(id);
    toast('Eliminado');
    renderOtrostrabajos();
    Nav.show('screen-otrostrabajos');
  }, 'Eliminar', 'btn-rojo');
}
