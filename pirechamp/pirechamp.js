// State Management
const state = {
  currentStep: 0,
  quantumLocked: false,
  moodScore: 50,
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
document.getElementById('btn-next-1').addEventListener('click', () => goToStep(2));
document.getElementById('btn-next-2').addEventListener('click', () => goToStep(3));
document.getElementById('btn-next-3').addEventListener('click', () => goToStep(4));

// --- MODULE 1: QUANTUM FIELD ---
const qInput = document.getElementById('input-quantum');
const qValDisplay = document.getElementById('q-val');
const btnMeasure = document.getElementById('btn-measure');
const btnNext1 = document.getElementById('btn-next-1');

const qPlaceholders = ["Code postal", "Votre ADN ?", "Rien", "Écrivez pas !", "404 Not Found", "???", "Vitesse lumière", "Heisenberg?"];

// 1. Survol = Le placeholder change (Incercitude)
qInput.addEventListener('mouseover', () => {
  if (!state.quantumLocked) {
    const randomText = qPlaceholders[Math.floor(Math.random() * qPlaceholders.length)];
    qInput.setAttribute('placeholder', randomText);
  }
});

// 2. Clic = Le champ se déplace (Position incertaine)
qInput.addEventListener('click', () => {
    if (!state.quantumLocked) {
        const x = (Math.random() - 0.5) * 50; // Amplitude de mouvement
        const y = (Math.random() - 0.5) * 30;
        qInput.style.transform = `translate(${x}px, ${y}px)`;
    }
});

// 3. Input = Valeur affichée garbled vs valeur réelle
qInput.addEventListener('input', (e) => {
  if (state.quantumLocked) return;
  
  // Simulation: on affiche des caractères corrompus
  const val = e.target.value;
  const garbled = val.split('').map(c => Math.random() > 0.6 ? String.fromCharCode(c.charCodeAt(0) + Math.floor(Math.random() * 5)) : c).join('');
  
  qValDisplay.innerText = garbled;
});

// 4. Mesure = Fige la valeur pour validation
btnMeasure.addEventListener('click', () => {
  state.quantumLocked = true;
  qInput.classList.add('jitter');
  btnMeasure.innerText = "MESURE EN COURS...";
  
  setTimeout(() => {
    state.quantumLocked = false;
    qInput.classList.remove('jitter');
    qInput.style.transform = `translate(0px, 0px)`; // Retour à la normale
    btnMeasure.innerText = "Mesurer la donnée";
    btnNext1.disabled = false;
    qValDisplay.innerText = qInput.value + " (VALIDE)";
    qValDisplay.style.color = "var(--accent-color)";
    statusEl.innerText = "QUANTUM_FIXED";
    statusEl.style.color = "var(--accent-color)";
  }, 1000);
});


// --- MODULE 2: MOOD SWING ---
const mInput = document.getElementById('input-mood');
const moodText = document.getElementById('mood-text');

mInput.addEventListener('keydown', (e) => {
  const now = Date.now();
  const diff = now - state.lastKeyTime;
  state.lastKeyTime = now;
  
  // Cas spécifique : Tentative de correction (Backspace/Delete)
  if (e.key === 'Backspace' || e.key === 'Delete') {
      const sarcasms = ["Ah bon ? Tu veux corriger ?", "T’es sûr ?", "Je préférais avant…", "Bof.", "Ne regrette rien."];
      mInput.setAttribute('placeholder', sarcasms[Math.floor(Math.random() * sarcasms.length)]);
      moodText.innerText = "SARCASTIQUE";
      mInput.classList.remove('happy');
      mInput.classList.add('angry');
      return; // On sort pour ne pas déclencher le reste
  }
  
  // Logique Vitesse
  let mood = "NEUTRE";
  
  // Trop vite (<100ms) = Stressé / Angry -> Supprime des lettres
  if (diff < 120) {
    mood = "AGACÉ (TROP VITE)";
    mInput.classList.add('angry');
    mInput.classList.remove('happy');
    
    // Supprime un caractère aléatoire si on tape trop vite
    if (Math.random() > 0.6 && mInput.value.length > 0) {
      setTimeout(() => {
        mInput.value = mInput.value.slice(0, -1);
      }, 50);
    }

  // Trop lent (>600ms) = Ennuyé -> Ajoute des lettres inutiles
  } else if (diff > 600 && mInput.value.length > 0) {
    mood = "ENNUYÉ (TROP LENT)";
    mInput.classList.remove('angry');
    
    if (Math.random() > 0.5) {
      const chars = "xyz...???bla";
      mInput.value += chars[Math.floor(Math.random() * chars.length)];
    }
    
  } else {
    mood = "CONTENT (PARFAIT)";
    mInput.classList.remove('angry');
    mInput.classList.add('happy');
  }
  
  moodText.innerText = mood;
});


// --- MODULE 3: 3D ROTATION ---
const dInput = document.getElementById('input-3d');
const dWrapper = document.getElementById('wrapper-3d');
const btnStabilize = document.getElementById('btn-stabilize');

dInput.addEventListener('input', () => {
  if (state.stabilized) return;
  
  // Rotation à chaque caractère
  state.rotationY += 30; 
  dWrapper.style.transform = `rotateY(${state.rotationY}deg) rotateX(${state.rotationX}deg)`;
  
  // Flou progressif
  if (dInput.value.length > 5) {
    dInput.style.filter = `blur(${Math.min(dInput.value.length / 5, 4)}px)`;
  }
});

// Bouton fuyant
btnStabilize.addEventListener('mouseover', (e) => {
    if (Math.random() > 0.4 && !state.stabilized) {
        const x = (Math.random() - 0.5) * 150;
        const y = (Math.random() - 0.5) * 80;
        btnStabilize.style.transform = `translate(${x}px, ${y}px)`;
    }
});

btnStabilize.addEventListener('click', () => {
  state.stabilized = true;
  state.rotationY = 0;
  state.rotationX = 0;
  dWrapper.style.transform = `rotateY(0deg) rotateX(0deg)`;
  dInput.style.filter = "none";
  btnStabilize.innerText = "STABILISÉ";
  btnStabilize.disabled = true;
  btnStabilize.style.transform = "none";
});


// --- FINALE: REDIRECTION SNAKE ---
// C'est ici que tu mettras le lien vers le fichier de ton pote
const btnSnake = document.getElementById('btn-redirect-snake');

btnSnake.addEventListener('click', () => {
  // Remplacer 'snake.html' par le nom du fichier de ton collègue
  window.location.href = '../snake/snake.html'; 
});