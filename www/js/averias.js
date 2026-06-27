// ═══════════════════════════════════════════════════════
//  AVERÍAS
// ═══════════════════════════════════════════════════════
let _editAveriaId = null;

function renderAverias() {
  const list = DB.averias.getAll();
  const cont = document.getElementById('averias-list');
  if (!list.length) {
    cont.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><p>Sin averías registradas</p></div>`;
    return;
  }
  const activas = list.filter(a => a.estado !== 'resuelta' && a.estado !== 'cobrada');
  const cerradas = list.filter(a => a.estado === 'resuelta' || a.estado === 'cobrada');
  let html = '';
  if (activas.length) {
    html += `<div class="section-header">🔴 Activas (${activas.length})</div>`;
    html += activas.map(a => averiaItemHtml(a)).join('');
  }
  if (cerradas.length) {
    html += `<div class="section-header" style="margin-top:4px">✅ Cerradas (${cerradas.length})</div>`;
    html += cerradas.map(a => averiaItemHtml(a)).join('');
  }
  cont.innerHTML = html;
}

function averiaItemHtml(a) {
  const colorMap = { pendiente:'--naranja', en_proceso:'--azul', resuelta:'--verde', cobrada:'--verde' };
  const color = colorMap[a.estado] || '--naranja';
  const labelMap = { pendiente:'Pendiente', en_proceso:'En proceso', resuelta:'Resuelta', cobrada:'Cobrada' };
  const chipMap = { pendiente:'naranja', en_proceso:'azul', resuelta:'verde', cobrada:'verde' };
  return `<div class="list-item" onclick="openAveriaDetalle(${a.id})">
    <div class="item-stripe" style="background:var(${color})"></div>
    <div class="item-body">
      <div class="item-title">${Utils.escapeHtml(a.cliente)}${a.urgente ? ' 🔴' : ''}</div>
      <div class="item-sub">${Utils.escapeHtml(a.descripcion || a.marca || 'Sin descripción')} · ${Utils.fechaCorta(a.creadoEn)}</div>
    </div>
    <div class="item-right">
      <div class="chip chip-${chipMap[a.estado] || 'naranja'}">${labelMap[a.estado] || a.estado}</div>
    </div>
  </div>`;
}

function openAveriaDetalle(id) {
  const a = DB.averias.getById(id);
  if (!a) return;
  _editAveriaId = id;
  const labelMap = { pendiente:'Pendiente', en_proceso:'En proceso', resuelta:'Resuelta', cobrada:'Cobrada' };
  const colorMap = { pendiente:'var(--naranja)', en_proceso:'var(--azul)', resuelta:'var(--verde)', cobrada:'var(--verde)' };
  const color = colorMap[a.estado] || 'var(--naranja)';

  document.getElementById('averia-det-content').innerHTML = `
    <div class="estado-banner" style="background:${color}">
      <span>Avería #${a.id}${a.urgente ? ' · 🔴 URGENTE' : ''}</span>
      <span class="chip" style="background:rgba(255,255,255,.2);color:#fff">${labelMap[a.estado] || a.estado}</span>
    </div>
    <div style="padding:12px;display:flex;flex-direction:column;gap:10px">
      <div class="card">
        <div class="card-title"><div class="dot" style="background:var(--azul)"></div>CLIENTE</div>
        <div class="detail-row"><span class="dr-label">Nombre</span><span class="dr-value">${Utils.escapeHtml(a.cliente)}</span></div>
        ${a.telefono ? `<div class="detail-row"><span class="dr-label">Teléfono</span><a href="tel:${a.telefono}" class="dr-value" style="color:var(--azul)">${a.telefono}</a></div>` : ''}
        ${a.direccion ? `<div class="detail-row"><span class="dr-label">Dirección</span><span class="dr-value">${Utils.escapeHtml(a.direccion)}</span></div>` : ''}
      </div>
      <div class="card">
        <div class="card-title"><div class="dot" style="background:var(--rojo)"></div>AVERÍA</div>
        ${a.descripcion ? `<div class="detail-row"><span class="dr-label">Descripción</span><span class="dr-value">${Utils.escapeHtml(a.descripcion)}</span></div>` : ''}
        ${a.marca ? `<div class="detail-row"><span class="dr-label">Marca</span><span class="dr-value">${Utils.escapeHtml(a.marca)}</span></div>` : ''}
        ${a.modelo ? `<div class="detail-row"><span class="dr-label">Modelo</span><span class="dr-value">${Utils.escapeHtml(a.modelo)}</span></div>` : ''}
        ${a.presupuesto ? `<div class="detail-row"><span class="dr-label">Presupuesto</span><span class="dr-value">${Utils.euros(a.presupuesto)}</span></div>` : ''}
        ${a.importeCobrado ? `<div class="detail-row"><span class="dr-label">Cobrado</span><span class="dr-value" style="color:var(--verde)">${Utils.euros(a.importeCobrado)}</span></div>` : ''}
      </div>
      ${a.observaciones ? `<div class="card"><div class="card-title">📝 NOTAS</div><p style="font-size:14px">${Utils.escapeHtml(a.observaciones)}</p></div>` : ''}
      <div style="display:flex;flex-direction:column;gap:8px;padding-bottom:12px">
        ${a.estado === 'pendiente' ? `<button class="btn btn-primary" onclick="cambiarEstadoAveria(${id},'en_proceso')">▶ En proceso</button>` : ''}
        ${a.estado === 'en_proceso' ? `<button class="btn btn-verde" onclick="cambiarEstadoAveria(${id},'resuelta')">✅ Marcar resuelta</button>` : ''}
        ${a.estado === 'resuelta' ? `<button class="btn btn-verde" onclick="abrirCobroAveria(${id})">💶 Registrar cobro</button>` : ''}
      </div>
    </div>`;

  Nav.show('screen-averia-detalle');
}

function cambiarEstadoAveria(id, estado) {
  const a = DB.averias.getById(id);
  a.estado = estado;
  DB.averias.save(a);
  renderAverias(); updateBadges();
  openAveriaDetalle(id);
  toast('Estado actualizado');
}

function abrirCobroAveria(id) {
  const a = DB.averias.getById(id);
  document.getElementById('cobro-importe').value = a.presupuesto || '';
  document.getElementById('cobro-metodo').value = a.metodoPago || 'efectivo';
  document.getElementById('cobro-save').onclick = () => {
    a.importeCobrado = parseFloat(document.getElementById('cobro-importe').value) || 0;
    a.metodoPago = document.getElementById('cobro-metodo').value;
    a.estado = 'cobrada';
    a.fechaCobro = Date.now();
    DB.averias.save(a);
    closeModal('cobro-modal');
    toast('Cobro registrado');
    openAveriaDetalle(id);
    renderAverias(); updateBadges();
  };
  openModal('cobro-modal');
}

function openAveriaForm(id = null) {
  _editAveriaId = id;
  const a = id ? DB.averias.getById(id) : {};
  document.getElementById('af-title').textContent = id ? 'Editar avería' : 'Nueva avería';
  document.getElementById('af-cliente').value = a.cliente || '';
  document.getElementById('af-telefono').value = a.telefono || '';
  document.getElementById('af-direccion').value = a.direccion || '';
  document.getElementById('af-descripcion').value = a.descripcion || '';
  document.getElementById('af-marca').value = a.marca || '';
  document.getElementById('af-modelo').value = a.modelo || '';
  document.getElementById('af-presupuesto').value = a.presupuesto || '';
  document.getElementById('af-obs').value = a.observaciones || '';
  document.getElementById('af-urgente').checked = a.urgente || false;
  document.getElementById('af-estado').value = a.estado || 'pendiente';
  Nav.show('screen-averia-form');
}

function saveAveria() {
  const cliente = document.getElementById('af-cliente').value.trim();
  if (!cliente) { toast('El nombre del cliente es obligatorio'); return; }
  const a = _editAveriaId ? DB.averias.getById(_editAveriaId) : {};
  if (_editAveriaId) a.id = _editAveriaId;
  a.cliente = cliente;
  a.telefono = document.getElementById('af-telefono').value.trim();
  a.direccion = document.getElementById('af-direccion').value.trim();
  a.descripcion = document.getElementById('af-descripcion').value.trim();
  a.marca = document.getElementById('af-marca').value.trim();
  a.modelo = document.getElementById('af-modelo').value.trim();
  a.presupuesto = parseFloat(document.getElementById('af-presupuesto').value) || 0;
  a.observaciones = document.getElementById('af-obs').value.trim();
  a.urgente = document.getElementById('af-urgente').checked;
  a.estado = document.getElementById('af-estado').value;
  DB.averias.save(a);
  toast('Avería guardada');
  renderAverias(); updateBadges();
  if (_editAveriaId) { openAveriaDetalle(_editAveriaId); }
  else { Nav.show('screen-averias'); }
}

function eliminarAveria(id) {
  const a = DB.averias.getById(id);
  confirm('Eliminar avería', `¿Eliminar la avería de ${a.cliente}?`, () => {
    DB.averias.delete(id);
    toast('Avería eliminada');
    renderAverias(); updateBadges();
    Nav.show('screen-averias');
  }, 'Eliminar', 'btn-rojo');
}
