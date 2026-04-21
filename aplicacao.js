 // ── State ──
  let sexo = 'm';
  let objetivo = null;
  let currentScreen = 0;

  function setSexo(s) {
    sexo = s;
    document.getElementById('toggle-m').classList.toggle('active', s === 'm');
    document.getElementById('toggle-f').classList.toggle('active', s === 'f');
  }

  function selectObj(obj) {
    objetivo = obj;
    ['emagrecer','manter','ganhar'].forEach(o => {
      document.getElementById('obj-' + o).classList.toggle('selected', o === obj);
      const ch = document.getElementById('check-' + o);
      ch.textContent = o === obj ? '✓' : '';
    });
  }

  // ── Navigation ──
  function goToScreen(n) {
    if (n === currentScreen) return;
    if (n > currentScreen) {
      if (n === 1 && !validateScreen0()) return;
      if (n === 2 && !validateScreen1()) return;
      if (n === 2) { buildResult(); }
    }
    showScreen(n);
  }

  function showScreen(n) {
    document.querySelectorAll('.screen').forEach((s, i) => {
      s.classList.toggle('active', i === n);
    });
    currentScreen = n;
    updateSteps(n);
    updateTabs(n);
    // Animate card
    const card = document.querySelector('#screen-' + n + ' .card');
    if (card) {
      card.classList.remove('screen-enter');
      void card.offsetWidth;
      card.classList.add('screen-enter');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateSteps(active) {
    for (let i = 0; i < 3; i++) {
      const step = document.getElementById('step-' + i);
      const dot  = document.getElementById('dot-' + i);
      step.className = 'step';
      if (i < active) {
        step.classList.add('done');
        dot.textContent = '✓';
      } else if (i === active) {
        step.classList.add('active');
        dot.textContent = i + 1;
      } else {
        dot.textContent = i + 1;
      }
    }
    for (let i = 0; i < 2; i++) {
      const line = document.getElementById('line-' + i + '-' + (i+1));
      line.classList.toggle('active', i < active);
    }
  }

  function updateTabs(active) {
    document.querySelectorAll('.tab').forEach((t, i) => {
      t.classList.toggle('active', i === active);
    });
  }

  // ── Validation ──
  function validateScreen0() {
    let valid = true;
    const fields = [
      document.getElementById('peso'),
      document.getElementById('altura'),
      document.getElementById('idade'),
      document.getElementById('atividade')
    ];
    fields.forEach(f => {
      f.classList.remove('error');
      if (!f.value || f.value === '') {
        f.classList.add('error');
        valid = false;
        setTimeout(() => f.classList.remove('error'), 800);
      }
    });
    return valid;
  }

  function validateScreen1() {
    if (!objetivo) {
      const cards = document.querySelectorAll('.obj-card');
      cards.forEach(c => {
        c.style.animation = 'shake 0.4s ease';
        setTimeout(() => c.style.animation = '', 500);
      });
      return false;
    }
    return true;
  }

  function goScreen1to2() {
    if (validateScreen0()) showScreen(1);
  }

  function calcular() {
    if (!validateScreen1()) return;
    buildResult();
    showScreen(2);
  }

  // ── Calculation ──
  function buildResult() {
    const peso   = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const idade  = parseFloat(document.getElementById('idade').value);
    const fator  = parseFloat(document.getElementById('atividade').value);

    // TMB Mifflin-St Jeor
    let tmb;
    if (sexo === 'm') {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
    } else {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
    }

    let tdee = tmb * fator;

    // Ajuste por objetivo
    let meta;
    if (objetivo === 'emagrecer')     meta = tdee - 500;
    else if (objetivo === 'manter')   meta = tdee;
    else                              meta = tdee + 300;

    meta = Math.round(meta);

    // Macros
    const ratios = {
      emagrecer: { prot: 0.30, carb: 0.40, fat: 0.30 },
      manter:    { prot: 0.25, carb: 0.50, fat: 0.25 },
      ganhar:    { prot: 0.30, carb: 0.50, fat: 0.20 }
    };
    const r = ratios[objetivo];
    const prot = Math.round((meta * r.prot) / 4);
    const carb = Math.round((meta * r.carb) / 4);
    const fat  = Math.round((meta * r.fat)  / 9);

    // Água e fibra
    const agua  = sexo === 'm' ? '3,7L' : '2,7L';
    const fibra = sexo === 'm' ? '38g'  : '25g';

    // Atividade
    const ativ = {
      emagrecer: { freq: '4–5x por semana', intens: 'Intensidade moderada — cardio + musculação' },
      manter:    { freq: '3–4x por semana', intens: 'Intensidade moderada — atividades variadas' },
      ganhar:    { freq: '4–5x por semana', intens: 'Alta intensidade — foco em musculação' }
    };

    // Populate static fields
    document.getElementById('r-prot').textContent  = prot;
    document.getElementById('r-carb').textContent  = carb;
    document.getElementById('r-fat').textContent   = fat;
    document.getElementById('r-agua').textContent  = agua;
    document.getElementById('r-fibra').textContent = fibra;
    document.getElementById('r-freq').textContent  = ativ[objetivo].freq;
    document.getElementById('r-intens').textContent = ativ[objetivo].intens;

    // Animate calories
    animateNumber(document.getElementById('cals-display'), 0, meta, 1200);
  }

  // ── Animated Counter ──
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(from + (to - from) * eased);
      el.textContent = current.toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }