const Utils = {
  euros: (n) => (n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
  fechaCorta: (ts) => ts ? new Date(ts).toLocaleDateString('es-ES') : '-',
  fechaLarga: (ts) => ts ? new Date(ts).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : '-',
  mesAnio: (ts) => {
    const d = new Date(ts || Date.now());
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  },
  inicioMes: (offset = 0) => {
    const d = new Date(); d.setDate(1); d.setHours(0,0,0,0);
    d.setMonth(d.getMonth() + offset);
    return d.getTime();
  },
  finMes: (offset = 0) => {
    const d = new Date(); d.setDate(1); d.setHours(0,0,0,0);
    d.setMonth(d.getMonth() + offset + 1);
    return d.getTime();
  },
  inputDate: (ts) => ts ? new Date(ts).toISOString().slice(0, 10) : '',
  fromInputDate: (str) => str ? new Date(str).getTime() : null,
  escapeHtml: (s) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),
};

// Estado montaje → color
const ESTADO_COLOR = {
  'pendiente': 'naranja', 'en_curso': 'azul', 'realizado': 'gris',
  'cobrado': 'verde', 'lista_espera': 'naranja'
};
const ESTADO_LABEL = {
  'pendiente': 'Pendiente', 'en_curso': 'En curso', 'realizado': 'Realizado',
  'cobrado': 'Cobrado', 'lista_espera': 'Lista espera'
};
const TIPO_MAQUINA_LABEL = {
  'split': 'Split', 'cassette': 'Cassette', 'conductos': 'Conductos',
  'suelo': 'Suelo-techo', 'vrv': 'VRV/VRF', 'industrial': 'Industrial', 'otro': 'Otro'
};
const METODO_PAGO_LABEL = {
  'efectivo': 'Efectivo', 'transferencia': 'Transferencia',
  'tarjeta': 'Tarjeta', 'pendiente': 'Pendiente'
};
const CATEGORIA_GASTO_LABEL = {
  'materiales': 'Materiales', 'sueldo_ayudante': 'Sueldo ayudante',
  'herramientas': 'Herramientas', 'combustible': 'Combustible',
  'seguros': 'Seguros', 'otros': 'Otros'
};

// Toast
function toast(msg, ms = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), ms);
}

// Alert personalizado
function confirm(title, msg, onOk, okLabel = 'Aceptar', okClass = 'btn-primary') {
  const ov = document.getElementById('alert-overlay');
  document.getElementById('alert-title').textContent = title;
  document.getElementById('alert-msg').textContent = msg;
  const btnOk = document.getElementById('alert-ok');
  btnOk.textContent = okLabel;
  btnOk.className = `btn ${okClass}`;
  btnOk.onclick = () => { closeAlert(); onOk(); };
  document.getElementById('alert-cancel').onclick = closeAlert;
  ov.classList.add('open');
}
function closeAlert() { document.getElementById('alert-overlay').classList.remove('open'); }
