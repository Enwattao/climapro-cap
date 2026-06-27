// Navegación entre pantallas
const Nav = (() => {
  const stack = [];

  function show(id, pushStack = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    if (pushStack) stack.push(id);
    // Sincronizar bottom nav
    const navMap = {
      'screen-home': 'nav-home', 'screen-montajes': 'nav-montajes',
      'screen-averias': 'nav-averias', 'screen-notas': 'nav-notas',
      'screen-calendario': 'nav-calendario'
    };
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navId = navMap[id];
    if (navId) document.getElementById(navId)?.classList.add('active');
  }

  function back() {
    if (stack.length > 1) { stack.pop(); show(stack[stack.length - 1], false); }
  }

  function replace(id) { stack[stack.length - 1] = id; show(id, false); }

  return { show, back, replace, stack };
})();
