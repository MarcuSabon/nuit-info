
// State Management
const state = {
  currentStep: 0,
  quantumLocked: false,
  quantumValue: '',
  moodScore: 50, // 0 (angry) to 100 (happy)
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
  }, 300); // Delay for transition
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

const qPlaceholders = ["Code postal", "Votre ADN ?", "Rien", "Écrivez pas !", "404 Not Found", "???", "Vitesse lumière"];

qInput.addEventListener('mouseover', () => {
  if (!state.quantumLocked) {
    const randomText = qPlaceholders[Math.floor(Math.random() * qPlaceholders.length)];
    qInput.setAttribute('placeholder', randomText);
    
    // Slight movement
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 20;
    qInput.style.transform = `translate(${x}px, ${y}px)`;
  }
});

qInput.addEventListener('input', (e) => {
  if (state.quantumLocked) return;
  
  const val = e.target.value;
  // Show something slightly different
  const garbled = val.split('').map(c => Math.random() > 0.7 ? String.fromCharCode(c.charCodeAt(0) + 1) : c).join('');
  qValDisplay.innerText = garbled;
});

btnMeasure.addEventListener('click', () => {
  state.quantumLocked = true;
  qInput.classList.add('jitter');
  btnMeasure.innerText = "MESURE EN COURS...";
  
  setTimeout(() => {
    state.quantumLocked = false;
    qInput.classList.remove('jitter');
    btnMeasure.innerText = "Mesurer la donnée";
    btnNext1.disabled = false;
    qValDisplay.innerText = "STABILISÉ (APPROX)";
    statusEl.innerText = "QUANTUM_FIXED";
    statusEl.style.color = "var(--accent-color)";
  }, 1000);
});


// --- MODULE 2: MOOD SWING ---
const mInput = document.getElementById('input-mood');
const moodText = document.getElementById('mood-text');
const btnNext2 = document.getElementById('btn-next-2');

mInput.addEventListener('keydown', (e) => {
  const now = Date.now();
  const diff = now - state.lastKeyTime;
  state.lastKeyTime = now;
  
  let mood = "NEUTRE";
  
  // Logic: Too fast (<100ms) = Angry. Too slow (>500ms) = Bored/Sarcastic
  if (diff < 100) {
    mood = "AGACÉ";
    mInput.classList.add('angry');
    mInput.classList.remove('happy');
    
    // Delete random char
    if (Math.random() > 0.5 && mInput.value.length > 0) {
      setTimeout(() => {
        mInput.value = mInput.value.slice(0, -1);
      }, 50);
    }
  } else if (diff > 500) {
    mood = "ENNUYÉ";
    mInput.classList.remove('angry');
    
    // Add random char
    if (Math.random() > 0.7) {
      const chars = "xyz...???";
      mInput.value += chars[Math.floor(Math.random() * chars.length)];
    }
    
    const sarcasms = ["Ah bon ?", "T’es sûr ?", "Je préférais avant…", "Bof.", "Tu tapes lentement..."];
    mInput.setAttribute('placeholder', sarcasms[Math.floor(Math.random() * sarcasms.length)]);
  } else {
    mood = "CONTENT";
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
  
  state.rotationY += 30;
  dWrapper.style.transform = `rotateY(${state.rotationY}deg) rotateX(${state.rotationX}deg)`;
  
  if (dInput.value.length > 5) {
    dInput.style.filter = "blur(2px)";
  }
});

btnStabilize.addEventListener('mouseover', (e) => {
    // Move button away slightly on hover
    if (Math.random() > 0.5) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 50;
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

// --- FINALE: SNAKE GAME ---
const btnSnake = document.getElementById('btn-snake');
const snakeContainer = document.getElementById('snake-container');
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');

btnSnake.addEventListener('click', () => {
  snakeContainer.classList.remove('hidden');
  btnSnake.style.display = 'none';
  initSnake();
});

function initSnake() {
  const gridSize = 20;
  const tileCount = canvas.width / gridSize;
  let velocityX = 0;
  let velocityY = 0;
  let playerX = 10;
  let playerY = 10;
  let trail = [];
  let tail = 5;
  let appleX = 15;
  let appleY = 15;
  
  // Start moving right immediately
  velocityX = 1;
  velocityY = 0;

  function gameLoop() {
    playerX += velocityX;
    playerY += velocityY;
    
    if (playerX < 0) playerX = tileCount - 1;
    if (playerX > tileCount - 1) playerX = 0;
    if (playerY < 0) playerY = tileCount - 1;
    if (playerY > tileCount - 1) playerY = 0;
    
    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Snake
    ctx.fillStyle = "#00ff9d"; // Accent color
    for (let i = 0; i < trail.length; i++) {
      ctx.fillRect(trail[i].x * gridSize, trail[i].y * gridSize, gridSize - 2, gridSize - 2);
      if (trail[i].x === playerX && trail[i].y === playerY) {
        tail = 5; // Reset on self collision
      }
    }
    
    trail.push({ x: playerX, y: playerY });
    while (trail.length > tail) {
      trail.shift();
    }
    
    // Apple
    ctx.fillStyle = "#ff0055"; // Error color
    ctx.fillRect(appleX * gridSize, appleY * gridSize, gridSize - 2, gridSize - 2);
    
    if (appleX === playerX && appleY === playerY) {
      tail++;
      appleX = Math.floor(Math.random() * tileCount);
      appleY = Math.floor(Math.random() * tileCount);
    }
  }
  
  document.addEventListener('keydown', keyPush);
  
  function keyPush(evt) {
    switch(evt.key) {
      case 'ArrowLeft': velocityX = -1; velocityY = 0; break;
      case 'ArrowUp': velocityX = 0; velocityY = -1; break;
      case 'ArrowRight': velocityX = 1; velocityY = 0; break;
      case 'ArrowDown': velocityX = 0; velocityY = 1; break;
    }
  }
  
  setInterval(gameLoop, 1000 / 15); // 15 FPS
}
