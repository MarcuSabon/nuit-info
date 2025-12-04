// State Management
const state = {
  currentStep: 0,
  quantumLocked: false,
  lastKeyTime: 0,
  rotationY: 0,
  rotationX: 0,
  stabilized: false
};

// DOM Elements
const steps = document.querySelectorAll('.step');
const statusEl = document.getElementById('system-status');

// Navigation Logic
function goToStep(index) {
  steps[state.currentStep].classList.remove('active');
  state.currentStep = index;
  
  setTimeout(() => {
    steps[state.currentStep].classList.add('active');
  }, 300);
}

document.getElementById('btn-start').addEventListener('click', () => goToStep(1));

// --- MODULE 1: CODE POSTAL (QUANTIQUE) ---
const qInput = document.getElementById('input-quantum');
const qValDisplay = document.getElementById('q-val');
const btnMeasure = document.getElementById('btn-measure');
const btnNext1 = document.getElementById('btn-next-1');
const errorMsg1 = document.getElementById('error-msg-1');

const qPlaceholders = ["75000", "Code Postal ?", "?????", "Pas ici...", "404", "99999"];

qInput.addEventListener('mouseover', () => {
  if (!state.quantumLocked) {
    qInput.setAttribute('placeholder', qPlaceholders[Math.floor(Math.random() * qPlaceholders.length)]);
  }
});

qInput.addEventListener('click', () => {
    if (!state.quantumLocked) {
        const x = (Math.random() - 0.5) * 40; 
        const y = (Math.random() - 0.5) * 20;
        qInput.style.transform = `translate(${x}px, ${y}px)`;
    }
});

qInput.addEventListener('input', (e) => {
  if (state.quantumLocked) return;
  const val = e.target.value;
  // Affichage corrompu mais chiffres
  const garbled = val.split('').map(c => Math.random() > 0.5 ? Math.floor(Math.random() * 9) : c).join('');
  qValDisplay.innerText = garbled || "NÉANT";
  
  errorMsg1.classList.add('hidden');
  qInput.classList.remove('input-error');
});

btnMeasure.addEventListener('click', () => {
  const realValue = qInput.value;
  // VALIDATION ZIP : 5 chiffres
  const zipRegex = /^\d{5}$/; 

  if (!zipRegex.test(realValue)) {
    errorMsg1.classList.remove('hidden');
    qInput.classList.add('input-error');
    statusEl.innerText = "ERROR_FORMAT";
    statusEl.style.color = "var(--error-color)";
    return;
  }

  state.quantumLocked = true;
  qInput.classList.add('jitter');
  btnMeasure.innerText = "Analyse en cours...";
  
  setTimeout(() => {
    state.quantumLocked = false;
    qInput.classList.remove('jitter');
    qInput.style.transform = `translate(0px, 0px)`;
    btnMeasure.innerText = "Donnée Validée";
    btnMeasure.disabled = true;
    btnNext1.disabled = false;
    qValDisplay.innerText = realValue + " (FIXÉ)";
    qValDisplay.style.color = "var(--accent-color)";
    statusEl.innerText = "QUANTUM_FIXED";
    statusEl.style.color = "var(--accent-color)";
  }, 1000);
});

document.getElementById('btn-next-1').addEventListener('click', () => goToStep(2));


// --- MODULE 2: NOM (MOOD SWING) ---
const mInput = document.getElementById('input-mood');
const moodText = document.getElementById('mood-text');
const btnNext2 = document.getElementById('btn-next-2');
const errorMsg2 = document.getElementById('error-msg-2');

mInput.addEventListener('keydown', (e) => {
  const now = Date.now();
  const diff = now - state.lastKeyTime;
  state.lastKeyTime = now;
  
  errorMsg2.classList.add('hidden');
  mInput.classList.remove('input-error');

  if (e.key === 'Backspace' || e.key === 'Delete') {
      const sarcasms = ["Ah bon ?", "Tu changes d'avis ?", "T'es sûr ?", "Pas de regrets ?"];
      mInput.setAttribute('placeholder', sarcasms[Math.floor(Math.random() * sarcasms.length)]);
      moodText.innerText = "SARCASTIQUE";
      mInput.classList.add('angry');
      return;
  }
  
  if (e.key.length > 1) return;

  if (diff < 120) {
    moodText.innerText = "AGACÉ (TROP VITE)";
    mInput.classList.add('angry');
    mInput.classList.remove('happy');
    if (Math.random() > 0.6 && mInput.value.length > 0) {
        setTimeout(() => mInput.value = mInput.value.slice(0, -1), 50);
    }
  } else if (diff > 600 && mInput.value.length > 0) {
    moodText.innerText = "ENNUYÉ (TROP LENT)";
    mInput.classList.remove('angry');
    if (Math.random() > 0.6) {
      const chars = "xyz...??";
      mInput.value += chars[Math.floor(Math.random() * chars.length)];
    }
  } else {
    moodText.innerText = "CONTENT (PARFAIT)";
    mInput.classList.remove('angry');
    mInput.classList.add('happy');
  }
});

btnNext2.addEventListener('click', () => {
    // VALIDATION NOM : Lettres, min 2 chars
    const nameRegex = /^[a-zA-ZÀ-ÿ\s-]{2,}$/;
    
    if (nameRegex.test(mInput.value)) {
        goToStep(3);
    } else {
        errorMsg2.classList.remove('hidden');
        mInput.classList.add('input-error');
        btnNext2.classList.add('shake-btn');
        setTimeout(() => btnNext2.classList.remove('shake-btn'), 500);
    }
});


// --- MODULE 3: EMAIL (3D ROTATION) ---
const dInput = document.getElementById('input-3d');
const dWrapper = document.getElementById('wrapper-3d');
const btnStabilize = document.getElementById('btn-stabilize');
const btnNext3 = document.getElementById('btn-next-3');
const errorMsg3 = document.getElementById('error-msg-3');

dInput.addEventListener('input', () => {
  // Si l'utilisateur tape après avoir stabilisé, on reprend le comportement dynamique
  if (state.stabilized) {
    state.stabilized = false;
    // Réactiver le bouton de stabilisation pour permettre de stabiliser à nouveau
    try { btnStabilize.disabled = false; btnStabilize.innerText = 'Stabiliser'; } catch(e) {}
  }

  // Appliquer rotation progressive
  state.rotationY += 30;
  dWrapper.style.transform = `rotateY(${state.rotationY}deg) rotateX(${state.rotationX}deg)`;

  // Combiner un flou de base avec un flou dépendant de la longueur saisie
  const baseBlur = 2; // px par défaut (renforce le flou demandé)
  const lengthBlur = dInput.value.length > 3 ? Math.min(dInput.value.length / 4, 3) : 0;
  const totalBlur = Math.max(baseBlur, lengthBlur);
  dInput.style.filter = `blur(${totalBlur}px)`;
});

// Rendre le bouton beaucoup plus fuyant : bouge dès l'entrée de la souris
btnStabilize.addEventListener('mouseenter', (e) => {
  if (state.stabilized) return;
  // Déplacement large et immédiat
  const x = (Math.random() - 0.5) * 260;
  const y = (Math.random() - 0.5) * 120;
  btnStabilize.style.transform = `translate(${x}px, ${y}px)`;
  // légère rotation pour l'effet
  btnStabilize.style.transition = 'transform 150ms ease-out';
});

// Sur tentative de clic (mousedown) : sauter encore plus loin et annuler l'action
btnStabilize.addEventListener('mousedown', (e) => {
  if (state.stabilized) return;
  e.preventDefault();
  // Saut encore plus grand
  const x = (Math.random() - 0.5) * 420;
  const y = (Math.random() - 0.5) * 220;
  btnStabilize.style.transform = `translate(${x}px, ${y}px) rotate(${(Math.random()-0.5)*25}deg)`;
  btnStabilize.style.transition = 'transform 120ms cubic-bezier(.2,.9,.2,1)';
  // petit délai avant permettre une nouvelle tentative (empêche spamming)
  btnStabilize.disabled = true;
  setTimeout(() => { if (!state.stabilized) btnStabilize.disabled = false; }, 350);
});

// Aussi sur focus (clavier) : faire la même chose
btnStabilize.addEventListener('focus', () => {
  if (state.stabilized) return;
  const x = (Math.random() - 0.5) * 220;
  const y = (Math.random() - 0.5) * 100;
  btnStabilize.style.transform = `translate(${x}px, ${y}px)`;
});

btnStabilize.addEventListener('click', () => {
  state.stabilized = true;
  state.rotationY = 0;
  state.rotationX = 0;
  dWrapper.style.transform = `rotateY(0deg) rotateX(0deg)`;
  dInput.style.filter = "none";
  btnStabilize.innerText = "Stabilisé";
  btnStabilize.disabled = true;
  btnStabilize.style.transform = "none";
});

btnNext3.addEventListener('click', () => {
    // VALIDATION EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(dInput.value)) {
        goToStep(4);
    } else {
        errorMsg3.classList.remove('hidden');
        dInput.classList.add('input-error');
        btnNext3.classList.add('shake-btn');
        if (!state.stabilized) {
             alert("Veuillez stabiliser le champ avant validation.");
        }
        setTimeout(() => btnNext3.classList.remove('shake-btn'), 500);
    }
});


// --- FINALE ---
document.getElementById('btn-redirect-snake').addEventListener('click', () => {
  window.location.href = '../snake/snake.html'; 
});