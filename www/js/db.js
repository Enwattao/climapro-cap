// Base de datos usando localStorage (compatible web + Capacitor sin plugin nativo)
const DB = (() => {
  const read = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const write = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const readObj = (key, def = {}) => JSON.parse(localStorage.getItem(key) || JSON.stringify(def));
  const writeObj = (key, obj) => localStorage.setItem(key, JSON.stringify(obj));

  const nextId = (list) => list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;

  // ── MONTAJES ──────────────────────────────────────────────
  const montajes = {
    getAll: () => read('montajes').sort((a, b) => (b.creadoEn || 0) - (a.creadoEn || 0)),
    getById: (id) => read('montajes').find(m => m.id === id),
    getEnRango: (inicio, fin) => read('montajes').filter(m => m.creadoEn >= inicio && m.creadoEn < fin),
    save: (m) => {
      const list = read('montajes');
      if (m.id) {
        const i = list.findIndex(x => x.id === m.id);
        if (i >= 0) list[i] = m; else list.push(m);
      } else {
        m.id = nextId(list);
        m.creadoEn = Date.now();
        list.push(m);
      }
      write('montajes', list);
      return m;
    },
    delete: (id) => write('montajes', read('montajes').filter(m => m.id !== id)),
  };

  // ── AVERÍAS ───────────────────────────────────────────────
  const averias = {
    getAll: () => read('averias').sort((a, b) => (b.creadoEn || 0) - (a.creadoEn || 0)),
    getById: (id) => read('averias').find(a => a.id === id),
    getEnRango: (inicio, fin) => read('averias').filter(a => a.creadoEn >= inicio && a.creadoEn < fin),
    save: (a) => {
      const list = read('averias');
      if (a.id) {
        const i = list.findIndex(x => x.id === a.id);
        if (i >= 0) list[i] = a; else list.push(a);
      } else {
        a.id = nextId(list);
        a.creadoEn = Date.now();
        list.push(a);
      }
      write('averias', list);
      return a;
    },
    delete: (id) => write('averias', read('averias').filter(a => a.id !== id)),
  };

  // ── MANTENIMIENTOS ────────────────────────────────────────
  const mantenimientos = {
    getAll: () => read('mantenimientos').sort((a, b) => (b.creadoEn || 0) - (a.creadoEn || 0)),
    getById: (id) => read('mantenimientos').find(m => m.id === id),
    getEnRango: (inicio, fin) => read('mantenimientos').filter(m => m.creadoEn >= inicio && m.creadoEn < fin),
    save: (m) => {
      const list = read('mantenimientos');
      if (m.id) {
        const i = list.findIndex(x => x.id === m.id);
        if (i >= 0) list[i] = m; else list.push(m);
      } else {
        m.id = nextId(list);
        m.creadoEn = Date.now();
        list.push(m);
      }
      write('mantenimientos', list);
      return m;
    },
    delete: (id) => write('mantenimientos', read('mantenimientos').filter(m => m.id !== id)),
  };

  // ── GASTOS ────────────────────────────────────────────────
  const gastos = {
    getAll: () => read('gastos').sort((a, b) => (b.fecha || 0) - (a.fecha || 0)),
    getEnRango: (inicio, fin) => read('gastos').filter(g => g.fecha >= inicio && g.fecha < fin),
    save: (g) => {
      const list = read('gastos');
      if (g.id) {
        const i = list.findIndex(x => x.id === g.id);
        if (i >= 0) list[i] = g; else list.push(g);
      } else {
        g.id = nextId(list);
        g.fecha = g.fecha || Date.now();
        list.push(g);
      }
      write('gastos', list);
      return g;
    },
    delete: (id) => write('gastos', read('gastos').filter(g => g.id !== id)),
  };

  // ── NOTAS ─────────────────────────────────────────────────
  const notas = {
    getAll: () => read('notas').sort((a, b) => (b.creadoEn || 0) - (a.creadoEn || 0)),
    save: (n) => {
      const list = read('notas');
      if (n.id) {
        const i = list.findIndex(x => x.id === n.id);
        if (i >= 0) list[i] = n; else list.push(n);
      } else {
        n.id = nextId(list);
        n.creadoEn = Date.now();
        list.push(n);
      }
      write('notas', list);
      return n;
    },
    delete: (id) => write('notas', read('notas').filter(n => n.id !== id)),
  };

  // ── PREFS ─────────────────────────────────────────────────
  const prefs = {
    get: () => readObj('prefs', { empresa: '', telefono: '', direccion: '' }),
    set: (obj) => writeObj('prefs', { ...prefs.get(), ...obj }),
  };

  return { montajes, averias, mantenimientos, gastos, notas, prefs };
})();
