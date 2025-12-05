// VARIABLES GLOBALES
let scene, camera, renderer;
let snake = [];
let foods = []; 
let powerups = []; 
const MAX_FOODS = 5; 
let direction = new THREE.Vector3(1, 0, 0); 
const gridSize = 10; 
const segmentSize = 0.98; 
let isPlaying = false;
let score = 0;
let canChangeDirection = true; 
let jumpInput = false;

// Constantes mouvement
const BASE_MOVE_DURATION = 0.4; 
let moveDuration = BASE_MOVE_DURATION; 
let lastMoveTime = 0; 

// Gestion des effets temporaires
let slowMotionTimer = null;

// Camera Shake
let shakeIntensity = 0;
const SHAKE_DECAY = 0.9; 
const SHAKE_MAX_INTENSITY = 0.4; 

// Facteurs de lissage
const CAMERA_LERP_FACTOR = 0.1; 
const SEGMENT_ROTATION_LERP_FACTOR = 0.3; 

const MOVE_STEP = 1.0; 
const CAMERA_OFFSET = new THREE.Vector3(0, 7, -10); 

let targetCameraPosition = new THREE.Vector3();
let targetCameraLookAt = new THREE.Vector3();

// --- VARIABLES POUR LA CORDE (ROPE) ---
let ropeMesh;
let ropeMaterial;
let ropeTexture;
let tailCapMesh; 

// --- SYSTÈME AUDIO (WEB AUDIO API) ---
let audioCtx;
let bgmInterval; 

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

const sounds = {
    eat: () => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },
    jump: () => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    },
    powerup: (type) => { 
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        if (type === 'bonus') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(900, audioCtx.currentTime);
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        }
    },
    gameOver: () => { 
        if (!audioCtx) return;
        const bufferSize = audioCtx.sampleRate * 1.5; 
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        const gain = audioCtx.createGain();
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(1.0, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);
        noise.start();
    },
    startMusic: () => {
        if (!audioCtx || bgmInterval) return;
        
        let noteIndex = 0;
        const bassLine = [65.41, 65.41, 82.41, 87.31, 98.00, 87.31, 82.41, 73.42]; 
        
        const playNote = () => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sawtooth';
            const freq = bassLine[noteIndex % bassLine.length];
            osc.frequency.value = freq;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            osc.disconnect();
            osc.connect(filter);
            filter.connect(gain);
            const now = audioCtx.currentTime;
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.4);
            noteIndex++;
        };
        bgmInterval = setInterval(playNote, 400);
    },
    stopMusic: () => {
        if (bgmInterval) {
            clearInterval(bgmInterval);
            bgmInterval = null;
        }
    }
};

const uiElement = document.getElementById('ui');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const gameContainer = document.getElementById('game-container');

function createRopeTexture() { 
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#004d00'; ctx.fillRect(0, 0, 128, 128); ctx.strokeStyle = '#00cc00'; ctx.lineWidth = 10; for (let i = -128; i < 256; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128); ctx.stroke(); } const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1, 1); return texture;
}
function createGrassTexture() { 
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#2d4c1e'; ctx.fillRect(0, 0, 512, 512); for (let i = 0; i < 8000; i++) { const x = Math.random() * 512; const y = Math.random() * 512; const w = 2 + Math.random() * 2; const h = 5 + Math.random() * 15; const colorVal = Math.floor(Math.random() * 50) + 80; ctx.fillStyle = `rgb(40, ${colorVal}, 40)`; ctx.fillRect(x, y, w, h); } const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 4); return texture;
}
function createBrickTexture() { 
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#cfcfcf'; ctx.fillRect(0, 0, 512, 512); ctx.fillStyle = '#8b3a3a'; const brickHeight = 64; const brickWidth = 128; const mortar = 8; for (let y = 0; y < 512; y += brickHeight + mortar) { const offset = (Math.floor(y / (brickHeight + mortar)) % 2) * (brickWidth / 2); for (let x = -brickWidth; x < 512; x += brickWidth + mortar) { const tint = Math.random() * 20 - 10; ctx.fillStyle = `rgb(${139 + tint}, ${58 + tint}, ${58 + tint})`; ctx.fillRect(x + offset, y, brickWidth, brickHeight); } } const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 1); return texture;
}

function createPowerUpMesh(type, x, z) {
    let geometry, material, mesh;
    if (type === 'slow') {
        geometry = new THREE.OctahedronGeometry(segmentSize * 0.4);
        material = new THREE.MeshPhongMaterial({ color: 0x9370DB, emissive: 0x4B0082, specular: 0xffffff, shininess: 100, transparent: true, opacity: 0.9 });
        mesh = new THREE.Mesh(geometry, material);
    } else if (type === 'bonus') {
        geometry = new THREE.TetrahedronGeometry(segmentSize * 0.4);
        material = new THREE.MeshPhongMaterial({ color: 0xFFD700, emissive: 0xB8860B, specular: 0xffffff, shininess: 100 });
        mesh = new THREE.Mesh(geometry, material);
    }
    mesh.position.set(x, segmentSize * 0.5, z);
    mesh.userData.type = type;
    mesh.castShadow = true;
    const light = new THREE.PointLight(type === 'slow' ? 0x9370DB : 0xFFD700, 1, 3);
    light.position.set(0, 0, 0);
    mesh.add(light);
    return mesh;
}

function createAppleGroup(x, z) {
    const group = new THREE.Group();
    const bodyGeometry = new THREE.SphereGeometry(segmentSize * 0.4, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.3, metalness: 0.1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1, 0.9, 1);
    group.add(body);
    const stemGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = segmentSize * 0.35;
    group.add(stem);
    const leafGeometry = new THREE.SphereGeometry(0.12, 8, 4);
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x4a7c10 });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(0.1, 0.4, 0);
    leaf.scale.set(1, 0.2, 0.5); leaf.rotation.z = Math.PI / 4; leaf.rotation.y = Math.PI / 4;
    group.add(leaf);
    group.position.set(x, segmentSize * 0.4, z);
    return group;
}

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 
    scene.fog = new THREE.Fog(0x87CEEB, 15, 50); 

    camera = new THREE.PerspectiveCamera(75, gameContainer.clientWidth / gameContainer.clientHeight, 0.1, 1000);
    targetCameraPosition.copy(CAMERA_OFFSET); 
    camera.position.copy(targetCameraPosition); 
    camera.lookAt(targetCameraLookAt); 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
    renderer.shadowMap.enabled = true; 
    gameContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); 
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const grassTexture = createGrassTexture();
    const floorGeometry = new THREE.PlaneGeometry(gridSize * 2, gridSize * 2);
    const floorMaterial = new THREE.MeshStandardMaterial({ map: grassTexture, roughness: 1, metalness: 0 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    scene.add(floor);

    const brickTexture = createBrickTexture();
    const wallMaterial = new THREE.MeshStandardMaterial({ map: brickTexture, roughness: 0.7, metalness: 0.1 });
    const wallHeight = 3; const wallThickness = 1; const wallLength = gridSize * 2 + wallThickness; 
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial); wallN.position.set(0, wallHeight/2, -gridSize - wallThickness/2); wallN.castShadow = true; scene.add(wallN);
    const wallS = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial); wallS.position.set(0, wallHeight/2, gridSize + wallThickness/2); wallS.castShadow = true; scene.add(wallS);
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial); wallE.position.set(gridSize + wallThickness/2, wallHeight/2, 0); wallE.rotation.y = Math.PI / 2; wallE.castShadow = true; scene.add(wallE);
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial); wallW.position.set(-gridSize - wallThickness/2, wallHeight/2, 0); wallW.rotation.y = Math.PI / 2; wallW.castShadow = true; scene.add(wallW);

    const grassCount = 5000;
    const grassGeometry = new THREE.ConeGeometry(0.05, 0.4, 3); grassGeometry.translate(0, 0.2, 0); 
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x3a5f0b, roughness: 1, metalness: 0 });
    const grassInstancedMesh = new THREE.InstancedMesh(grassGeometry, grassMaterial, grassCount);
    const dummy = new THREE.Object3D(); const color = new THREE.Color();
    for (let i = 0; i < grassCount; i++) {
        const x = (Math.random() - 0.5) * gridSize * 2; const z = (Math.random() - 0.5) * gridSize * 2;
        dummy.position.set(x, 0, z); const s = 0.5 + Math.random() * 0.5; dummy.scale.set(s, s * (0.8 + Math.random() * 0.5), s);
        dummy.rotation.y = Math.random() * Math.PI * 2; dummy.rotation.x = (Math.random() - 0.5) * 0.3; dummy.rotation.z = (Math.random() - 0.5) * 0.3;
        dummy.updateMatrix(); grassInstancedMesh.setMatrixAt(i, dummy.matrix);
        color.setHSL(0.25 + Math.random() * 0.08, 0.6, 0.2 + Math.random() * 0.3); grassInstancedMesh.setColorAt(i, color);
    }
    grassInstancedMesh.receiveShadow = true; scene.add(grassInstancedMesh);
    
    ropeTexture = createRopeTexture();
    ropeMaterial = new THREE.MeshStandardMaterial({ map: ropeTexture, roughness: 0.8, bumpMap: ropeTexture, bumpScale: 0.1, color: 0x008800 });
    ropeMesh = new THREE.Mesh(new THREE.BufferGeometry(), ropeMaterial);
    ropeMesh.castShadow = true; scene.add(ropeMesh);

    const capGeometry = new THREE.SphereGeometry(segmentSize * 0.25, 16, 16);
    tailCapMesh = new THREE.Mesh(capGeometry, ropeMaterial);
    scene.add(tailCapMesh);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = gameContainer.clientWidth / gameContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
}

function createSegment(x, y, z, isHead = false) {
    let segment; let geometry; let material;
    if (isHead) {
        geometry = new THREE.ConeGeometry(segmentSize * 0.45, segmentSize * 1.0, 32);
        material = new THREE.MeshPhongMaterial({ color: 0x004d00, specular: 0xffffff, shininess: 80 });
        geometry.rotateX(Math.PI / 2);
        segment = new THREE.Mesh(geometry, material);
        segment.castShadow = true; segment.visible = true; 
    } else {
        geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); 
        material = new THREE.MeshBasicMaterial({ visible: false }); 
        segment = new THREE.Mesh(geometry, material);
        segment.visible = false; 
    }
    segment.position.set(x, y, z);
    segment.userData.isHead = isHead;
    segment.userData.isJumping = false; 
    segment.userData.previousPosition = new THREE.Vector3(x, y, z);
    segment.userData.targetPosition = new THREE.Vector3(x, y, z);
    return segment;
}

function spawnPowerUp() {
    if (powerups.length >= 2) return;
    let x, z, occupied;
    do {
        x = Math.round((Math.random() * gridSize * 2) - gridSize) * 1;
        z = Math.round((Math.random() * gridSize * 2) - gridSize) * 1;
        occupied = false;
        for (const segment of snake) { if (segment.userData.targetPosition.x === x && segment.userData.targetPosition.z === z) { occupied = true; break; } }
        if (!occupied) { for (const f of foods) { if (f.position.x === x && f.position.z === z) { occupied = true; break; } } }
        if (!occupied) { for (const p of powerups) { if (p.position.x === x && p.position.z === z) { occupied = true; break; } } }
    } while (occupied);
    const type = Math.random() > 0.5 ? 'slow' : 'bonus';
    const pu = createPowerUpMesh(type, x, z);
    powerups.push(pu); scene.add(pu);
}

function initGame() {
    snake.forEach(segment => scene.remove(segment));
    foods.forEach(food => scene.remove(food)); foods = [];
    powerups.forEach(p => scene.remove(p)); powerups = [];

    snake = [];
    score = 0;
    direction = new THREE.Vector3(1, 0, 0); 
    shakeIntensity = 0; 
    scoreElement.textContent = `Score: ${score}`;
    canChangeDirection = true; 
    jumpInput = false;
    moveDuration = BASE_MOVE_DURATION; 

    if(slowMotionTimer) clearTimeout(slowMotionTimer); 

    const head = createSegment(0, segmentSize / 2, 0, true); 
    snake.push(head); scene.add(head);
    const tail = createSegment(0, segmentSize / 2, 1 * MOVE_STEP, false);
    snake.push(tail); scene.add(tail);
    const tail2 = createSegment(0, segmentSize / 2, 2 * MOVE_STEP, false);
    snake.push(tail2); scene.add(tail2);

    for (let i = 0; i < MAX_FOODS; i++) { placeFood(); }
    
    lastMoveTime = Date.now(); 
    sounds.startMusic(); 
}

function placeFood() {
    let x, z, occupied;
    do {
        x = Math.round((Math.random() * gridSize * 2) - gridSize) * 1;
        z = Math.round((Math.random() * gridSize * 2) - gridSize) * 1;
        occupied = false;
        for (const segment of snake) { if (segment.userData.targetPosition.x === x && segment.userData.targetPosition.z === z) { occupied = true; break; } }
        if (!occupied) { for (const food of foods) { if (food.position.x === x && food.position.z === z) { occupied = true; break; } } }
    } while (occupied);
    const newFood = createAppleGroup(x, z);
    foods.push(newFood); scene.add(newFood);
}

// CORRECTION: Logique de collision intelligente (Passer dessous/Sauter dessus)
function checkCollision(x, z) {
    if (x > gridSize || x < -gridSize || z > gridSize || z < -gridSize) return true;
    
    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        
        // Si on touche un segment
        if (x === segment.userData.targetPosition.x && z === segment.userData.targetPosition.z) {
            
            // LOGIQUE DE PERMISSIVITÉ
            // 1. Si la tête est en train de sauter (jumpInput actif pour le prochain pas)
            //    Note: On utilise jumpInput car c'est l'intention pour ce pas-ci
            const isHeadFlying = jumpInput;
            
            // 2. Si le segment qu'on touche est en train de s'envoler (isJumping propagé)
            //    snake[i-1] détient l'état qui sera propagé à snake[i] lors du cycle de déplacement
            //    Si le segment précédent a sauté, ce segment va sauter maintenant.
            const isSegmentFlying = snake[i-1].userData.isJumping;

            // Si l'un des deux vole, pas de collision (on passe au-dessus ou en-dessous)
            if (isHeadFlying || isSegmentFlying) {
                // Pas de collision, on continue
                continue; 
            } else {
                return true; // Collision réelle
            }
        }
    }
    return false;
}

function gameOver() {
    isPlaying = false;
    uiElement.classList.remove('hidden');
    startButton.textContent = `Rejouer (Score Final: ${score})`;
    sounds.gameOver(); 
    sounds.stopMusic(); 
}

window.addEventListener('keydown', (event) => {
    if (!isPlaying) return; 
    
    if (event.code === 'Space') {
        event.preventDefault(); 
        jumpInput = true;
        sounds.jump(); 
        return;
    }

    if (!canChangeDirection) return;

    let newDirection = direction.clone();
    let current_dx = direction.x; let current_dz = direction.z;

    switch (event.key) {
        case 'ArrowLeft': case 'q': case 'Q': newDirection.set(current_dz, 0, -current_dx); break;
        case 'ArrowRight': case 'd': case 'D': newDirection.set(-current_dz, 0, current_dx); break;
        case 'ArrowUp': case 'z': case 'Z': case 'ArrowDown': case 's': case 'S': return;
        default: return;
    }
    if (newDirection.x !== -direction.x || newDirection.z !== -direction.z) { direction = newDirection; canChangeDirection = false; }
});

function updateRopeVisuals() {
    if (snake.length < 2) return;
    const points = snake.map(seg => seg.position.clone());
    const curve = new THREE.CatmullRomCurve3(points);
    curve.curveType = 'catmullrom'; curve.tension = 0.5; 
    if (ropeMesh.geometry) ropeMesh.geometry.dispose();
    ropeMesh.geometry = new THREE.TubeGeometry(curve, snake.length * 8, segmentSize * 0.25, 8, false);
    if (ropeTexture) ropeTexture.repeat.x = snake.length; 
    if (tailCapMesh) { const tailPos = points[points.length - 1]; tailCapMesh.position.copy(tailPos); }
}

function animate() {
    requestAnimationFrame(animate);
    const currentTime = Date.now();

    if (isPlaying) {
        let moveProgress = (currentTime - lastMoveTime) / (moveDuration * 1000);
        moveProgress = Math.min(moveProgress, 1.0);

        if (moveProgress < 1.0) {
            for (let i = 0; i < snake.length; i++) {
                const segment = snake[i];
                segment.position.lerpVectors(segment.userData.previousPosition, segment.userData.targetPosition, moveProgress);
                if (segment.userData.isJumping) {
                    const jumpHeight = 2.5; 
                    segment.position.y += Math.sin(moveProgress * Math.PI) * jumpHeight;
                }
                if (i === 0) {
                    const angle = Math.atan2(direction.x, direction.z);
                    let currentAngle = segment.rotation.y;
                    let deltaAngle = angle - currentAngle;
                    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
                    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
                    segment.rotation.y += deltaAngle * SEGMENT_ROTATION_LERP_FACTOR;
                }
            }
        } else {
            const head = snake[0];
            const nextX = head.userData.targetPosition.x + direction.x * MOVE_STEP;
            const nextZ = head.userData.targetPosition.z + direction.z * MOVE_STEP; 

            let foodEaten = false; let consumedFoodIndex = -1;
            for (let i = 0; i < foods.length; i++) {
                if (Math.round(nextX) === foods[i].position.x && Math.round(nextZ) === foods[i].position.z) {
                    foodEaten = true; consumedFoodIndex = i; break;
                }
            }

            let powerupEaten = false; let consumedPowerupIndex = -1;
            for (let i = 0; i < powerups.length; i++) {
                if (Math.round(nextX) === powerups[i].position.x && Math.round(nextZ) === powerups[i].position.z) {
                    powerupEaten = true; consumedPowerupIndex = i; break;
                }
            }

            if (foodEaten) {
                score++; scoreElement.textContent = `Score: ${score}`; shakeIntensity = SHAKE_MAX_INTENSITY;
                sounds.eat();
                const tailPos = snake[snake.length - 1].userData.targetPosition.clone();
                const newTail = createSegment(tailPos.x, tailPos.y, tailPos.z, false);
                newTail.userData.isJumping = snake[snake.length - 1].userData.isJumping;
                snake.push(newTail); scene.add(newTail);
                scene.remove(foods[consumedFoodIndex]); foods.splice(consumedFoodIndex, 1);
                if (foods.length < MAX_FOODS) placeFood();
                if (Math.random() < 0.2) spawnPowerUp();
            }

            if (powerupEaten) {
                const pu = powerups[consumedPowerupIndex];
                sounds.powerup(pu.userData.type);
                if (pu.userData.type === 'bonus') {
                    score += 5; scoreElement.textContent = `Score: ${score}`;
                } else if (pu.userData.type === 'slow') {
                    moveDuration = BASE_MOVE_DURATION * 1.5; 
                    if (slowMotionTimer) clearTimeout(slowMotionTimer);
                    slowMotionTimer = setTimeout(() => { moveDuration = BASE_MOVE_DURATION; }, 5000);
                }
                scene.remove(pu); powerups.splice(consumedPowerupIndex, 1);
            }
            
            if (checkCollision(nextX, nextZ)) {
                gameOver(); renderer.render(scene, camera); return;
            }

            for (let i = snake.length - 1; i > 0; i--) {
                const current = snake[i]; const previous = snake[i - 1];
                current.position.copy(current.userData.targetPosition); 
                current.userData.previousPosition.copy(current.userData.targetPosition);
                current.userData.targetPosition.copy(previous.userData.targetPosition);
                current.userData.isJumping = previous.userData.isJumping;
            }
            
            head.position.copy(head.userData.targetPosition); 
            head.userData.previousPosition.copy(head.userData.targetPosition); 
            head.userData.targetPosition.set(nextX, segmentSize / 2, nextZ);
            
            head.userData.isJumping = jumpInput; jumpInput = false; 
            lastMoveTime = currentTime; canChangeDirection = true;
        }
    }

    updateRopeVisuals();

    if (snake.length > 0) {
        const headPos = snake[0].position;
        const angle = Math.atan2(direction.x, direction.z);
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(angle);
        const cameraOffsetRotated = CAMERA_OFFSET.clone().applyMatrix4(rotationMatrix);
        targetCameraPosition = headPos.clone().add(cameraOffsetRotated);
        targetCameraLookAt = headPos.clone(); 

        camera.position.lerp(targetCameraPosition, CAMERA_LERP_FACTOR);
        const currentLookAt = new THREE.Vector3(0,0,0);
        camera.getWorldDirection(currentLookAt); 
        currentLookAt.add(camera.position); 
        const smoothLookAt = currentLookAt.lerp(targetCameraLookAt, CAMERA_LERP_FACTOR);
        
        let finalCameraPosition;
        if (shakeIntensity > 0) {
            const dx = (Math.random() - 0.5) * 2 * shakeIntensity;
            const dy = (Math.random() - 0.5) * 2 * shakeIntensity;
            const dz = (Math.random() - 0.5) * 2 * shakeIntensity;
            finalCameraPosition = camera.position.clone().add(new THREE.Vector3(dx, dy, dz));
            camera.position.copy(finalCameraPosition); 
            shakeIntensity *= SHAKE_DECAY;
        }
        camera.lookAt(smoothLookAt);
    } 

    foods.forEach(food => { food.rotation.y += 0.02; });
    powerups.forEach(pu => { 
        pu.rotation.y += 0.05; pu.rotation.x += 0.02; 
        pu.position.y = (segmentSize * 0.5) + Math.sin(currentTime * 0.005) * 0.2; 
    });

    renderer.render(scene, camera);
}

function startGame() {
    uiElement.classList.add('hidden');
    startButton.blur(); 
    initAudio(); 
    isPlaying = true;
    initGame();
}

startButton.addEventListener('click', startGame);

initScene();
animate();