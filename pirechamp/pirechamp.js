// State Management
const state = {
  currentStep: 0,
  quantumLocked: false,
  lastKeyTime: 0,
  rotationY: 0,
  rotationX: 0,
  stabilized: false
};
// Indique si l'utilisateur a déjà écrit dans le champ email
state.emailTouched = false;

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

  // Marquer que l'utilisateur a touché le champ (pour ne pas flouter au chargement)
  if (!state.emailTouched && dInput.value.length > 0) state.emailTouched = true;

  // Appliquer rotation progressive
  state.rotationY += 30;
  dWrapper.style.transform = `rotateY(${state.rotationY}deg) rotateX(${state.rotationX}deg)`;

  // Ne pas appliquer de flou tant que l'utilisateur n'a pas écrit
  if (!state.emailTouched) {
    dInput.style.filter = 'none';
    return;
  }

  // Combiner un flou de base avec un flou dépendant de la longueur saisie
  const baseBlur = 2; // px minimal une fois que l'utilisateur a écrit
  const lengthBlur = dInput.value.length > 3 ? Math.min(dInput.value.length / 4, 3) : 0;
  const totalBlur = Math.max(baseBlur, lengthBlur);
  dInput.style.filter = `blur(${totalBlur}px)`;
});

// Rendre le bouton fuyant mais cliquable : translations plus petites
btnStabilize.addEventListener('mouseenter', (e) => {
  if (state.stabilized) return;
  // Déplacement modéré et immédiat
  const x = (Math.random() - 0.5) * 80; // réduit
  const y = (Math.random() - 0.5) * 40; // réduit
  btnStabilize.style.transform = `translate(${x}px, ${y}px)`;
  btnStabilize.style.transition = 'transform 120ms ease-out';
});

// Sur tentative de clic (mousedown) : léger saut mais laisser le clic se produire
btnStabilize.addEventListener('mousedown', (e) => {
  if (state.stabilized) return;
  // Petit nudge au moment du clic pour l'effet, sans empêcher l'action
  const x = (Math.random() - 0.5) * 120;
  const y = (Math.random() - 0.5) * 60;
  btnStabilize.style.transform = `translate(${x}px, ${y}px) rotate(${(Math.random()-0.5)*10}deg)`;
  btnStabilize.style.transition = 'transform 100ms cubic-bezier(.2,.9,.2,1)';
});

// Aussi sur focus (clavier) : déplacement léger pour l'accessibilité
btnStabilize.addEventListener('focus', () => {
  if (state.stabilized) return;
  const x = (Math.random() - 0.5) * 60;
  const y = (Math.random() - 0.5) * 30;
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

// --- MODULE 4: LA POMPE À MOTIVATION ---
const batteryLevel = document.getElementById('battery-level');
const batteryText = document.getElementById('battery-text');
const btnPump = document.getElementById('btn-pump');
const btnNext4 = document.getElementById('btn-next-4');
const errorMsg4 = document.getElementById('error-msg-4');

let currentCharge = 0;
let decayRate = 0.5; // Vitesse de déchargement (augmente avec le temps)

// 1. Le bouton ajoute de l'énergie
btnPump.addEventListener('mousedown', () => { // mousedown pour réactivité max
    if (currentCharge >= 100) return;

    // Ajoute de la charge
    currentCharge += 4; // Il faut ~25 clics rapides
    updateBattery();
    
    // Animation visuelle du bouton
    btnPump.style.transform = "scale(0.95)";
    setTimeout(() => btnPump.style.transform = "scale(1)", 50);
});

// 2. La fuite d'énergie (La boucle infernale)
setInterval(() => {
    if (currentCharge > 0 && currentCharge < 100) {
        // Plus on est proche du but, plus ça descend vite (sadique)
        let dynamicDecay = decayRate;
        if (currentCharge > 80) dynamicDecay = 1.2; 
        
        currentCharge -= dynamicDecay;
        if (currentCharge < 0) currentCharge = 0;
        updateBattery();
    }
}, 50); // Toutes les 50ms

function updateBattery() {
    // Bornage
    if (currentCharge > 100) currentCharge = 100;
    
    // Mise à jour visuelle
    batteryLevel.style.height = `${currentCharge}%`;
    batteryText.innerText = `${Math.floor(currentCharge)}%`;
    
    // Changement de couleur selon la charge
    if (currentCharge < 30) batteryLevel.style.backgroundColor = "#ef4444"; // Rouge
    else if (currentCharge < 70) batteryLevel.style.backgroundColor = "#f59e0b"; // Jaune
    else batteryLevel.style.backgroundColor = "#10b981"; // Vert

    // Validation
    if (currentCharge >= 100) {
        finishCharging();
    }
}

function finishCharging() {
    currentCharge = 100;
    batteryLevel.style.height = "100%";
    batteryText.innerText = "MAX";
    batteryLevel.classList.add('charged'); // Effet brillant
    
    btnPump.disabled = true;
    btnPump.innerText = "CHARGE COMPLÈTE";
    btnPump.style.backgroundColor = "#d1fae5";
    btnPump.style.borderColor = "#10b981";
    
    btnNext4.disabled = false;
    errorMsg4.classList.remove('hidden');
    errorMsg4.style.color = "#10b981";
    errorMsg4.innerText = "Tension stabilisée. Envoi possible.";
    
    statusEl.innerText = "POWER_FULL";
}

// Correction du lien vers la fin
document.getElementById('btn-next-4').addEventListener('click', () => goToStep(5));

// --- FINALE ---
document.getElementById('btn-redirect-snake').addEventListener('click', () => {
  window.location.href = '../snake/snake.html'; 
});