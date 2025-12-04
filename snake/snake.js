// VARIABLES GLOBALES
let scene, camera, renderer;
let snake = [];
let food;
// La direction représente le mouvement en XZ (avant, arrière, gauche, droite sur la grille)
let direction = new THREE.Vector3(1, 0, 0); 
const gridSize = 10; 
const segmentSize = 0.98; 
let isPlaying = false;
let score = 0;

// Constantes pour le mouvement fluide du serpent
const MOVE_DURATION = 0.4; 
let lastMoveTime = 0; 

// VARIABLES POUR L'EFFET DE CAMERA SHAKE
let shakeIntensity = 0;
const SHAKE_DECAY = 0.9; 
const SHAKE_MAX_INTENSITY = 0.4; 

// Constantes pour le LISSAGE DE LA CAMÉRA (FLUIDITÉ)
const CAMERA_LERP_FACTOR = 0.1; // Facteur de lissage : plus il est petit, plus le suivi est lent et fluide.
// Position de caméra par défaut (décalage par rapport à la tête du serpent)
// Z est NEGATIF pour que le décalage soit appliqué derrière la tête dans le sens du mouvement.
const CAMERA_OFFSET = new THREE.Vector3(0, 7, -10); 

// Variables pour le lissage
let targetCameraPosition = new THREE.Vector3();
let targetCameraLookAt = new THREE.Vector3();

// Éléments DOM
const uiElement = document.getElementById('ui');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const gameContainer = document.getElementById('game-container');

// --- INITIALISATION DE LA SCÈNE THREE.JS ---

function initScene() {
    // SCÈNE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x3a3f4a); 

    // CAMÉRA
    camera = new THREE.PerspectiveCamera(75, gameContainer.clientWidth / gameContainer.clientHeight, 0.1, 1000);
    // Initialisation des positions cibles
    targetCameraPosition.copy(CAMERA_OFFSET); 
    camera.position.copy(targetCameraPosition); 
    camera.lookAt(targetCameraLookAt); 

    // RENDU (Renderer)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
    gameContainer.appendChild(renderer.domElement);

    // LUMIÈRES
    const ambientLight = new THREE.AmbientLight(0x404040, 3);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // GRILLE 3D
    const gridHelper = new THREE.GridHelper(gridSize * 2, gridSize * 2, 0x444444, 0x444444);
    scene.add(gridHelper);

    // Redimensionnement
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = gameContainer.clientWidth / gameContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
}

// --- LOGIQUE DU JEU SNAKE ---

function createSegment(x, y, z) {
    const geometry = new THREE.BoxGeometry(segmentSize, segmentSize, segmentSize);
    const material = new THREE.MeshPhongMaterial({ color: 0x98c379 });
    const segment = new THREE.Mesh(geometry, material);
    segment.position.set(x, y, z);

    segment.userData.previousPosition = new THREE.Vector3(x, y, z);
    segment.userData.targetPosition = new THREE.Vector3(x, y, z);
    
    return segment;
}

function initGame() {
    snake.forEach(segment => scene.remove(segment));
    if (food) scene.remove(food);

    snake = [];
    score = 0;
    // Initialisation : direction vers l'avant (Z négatif) pour commencer face à la caméra
    direction = new THREE.Vector3(0, 0, -1); 
    shakeIntensity = 0; 
    scoreElement.textContent = `Score: ${score}`;

    const head = createSegment(0, segmentSize / 2, 0); 
    snake.push(head);
    scene.add(head);

    placeFood();
    lastMoveTime = Date.now(); 
}

function placeFood() {
    if (food) scene.remove(food);

    const x = Math.round((Math.random() * gridSize * 2) - gridSize) * 1;
    const z = Math.round((Math.random() * gridSize * 2) - gridSize) * 1;
    
    const geometry = new THREE.SphereGeometry(segmentSize / 2, 8, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0xe06c75 });
    food = new THREE.Mesh(geometry, material);
    food.position.set(x, segmentSize / 2, z);
    scene.add(food);
}

function checkCollision(x, z) {
    if (x > gridSize || x < -gridSize || z > gridSize || z < -gridSize) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (x === snake[i].userData.targetPosition.x && z === snake[i].userData.targetPosition.z) {
            return true;
        }
    }

    return false;
}

function gameOver() {
    isPlaying = false;
    uiElement.classList.remove('hidden');
    startButton.textContent = `Rejouer (Score Final: ${score})`;
}

// --- GESTION DES INPUTS (Clavier) ---

window.addEventListener('keydown', (event) => {
    if (!isPlaying) return;

    let newDirection = direction.clone();
    let current_dx = direction.x;
    let current_dz = direction.z;

    // Seules les rotations Gauche/Droite sont gérées
    switch (event.key) {
        case 'ArrowLeft':
        case 'q':
        case 'Q':
            // Rotation Gauche (90 degrés CCW en X-Z)
            // Nouveau dx = dz, Nouveau dz = -dx
            newDirection.set(current_dz, 0, -current_dx);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            // Rotation Droite (90 degrés CW en X-Z)
            // Nouveau dx = -dz, Nouveau dz = dx
            newDirection.set(-current_dz, 0, current_dx);
            break;
        case 'ArrowUp':
        case 'z':
        case 'Z':
        case 'ArrowDown':
        case 's':
        case 'S':
            // Le serpent continue dans sa direction actuelle
            return;
        default:
            return;
    }
    
    // Mettre à jour la direction si la nouvelle direction n'est pas l'opposée
    if (newDirection.x !== -direction.x || newDirection.z !== -direction.z) {
        direction = newDirection;
    }
});

// --- BOUCLE D'ANIMATION AVEC MOUVEMENT FLUIDE ---

function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();

    if (isPlaying) {
        let moveProgress = (currentTime - lastMoveTime) / (MOVE_DURATION * 1000);
        moveProgress = Math.min(moveProgress, 1.0);

        if (moveProgress < 1.0) {
            // Étape 1: Mouvement fluide (interpolation)
            for (let i = 0; i < snake.length; i++) {
                const segment = snake[i];
                segment.position.lerpVectors(
                    segment.userData.previousPosition,
                    segment.userData.targetPosition,
                    moveProgress
                );
            }
        } else {
            // Étape 2: Fin du mouvement (snap à la grille et préparation du prochain pas)
            
            const head = snake[0];
            const nextX = head.userData.targetPosition.x + direction.x;
            const nextZ = head.userData.targetPosition.z + direction.z;

            // 2a. Vérifier la nourriture et grandir
            if (nextX === food.position.x && nextZ === food.position.z) {
                score++;
                scoreElement.textContent = `Score: ${score}`;
                shakeIntensity = SHAKE_MAX_INTENSITY;

                // Ajout du nouveau segment à l'emplacement exact de l'ancienne queue
                const tailPos = snake[snake.length - 1].userData.targetPosition.clone();
                const newTail = createSegment(tailPos.x, tailPos.y, tailPos.z);
                
                newTail.userData.targetPosition.copy(tailPos);
                newTail.userData.previousPosition.copy(tailPos);
                
                snake.push(newTail);
                scene.add(newTail);
                placeFood(); 
            }
            
            // 2b. Gérer les collisions 
            if (checkCollision(nextX, nextZ)) {
                gameOver();
                renderer.render(scene, camera); 
                return;
            }

            // 2c. Décaler les cibles (mise à jour des positions de départ et de fin)
            for (let i = snake.length - 1; i > 0; i--) {
                const current = snake[i];
                const previous = snake[i - 1];

                // Assurer le snap du segment à sa position cible
                current.position.copy(current.userData.targetPosition); 

                current.userData.previousPosition.copy(current.userData.targetPosition);
                current.userData.targetPosition.copy(previous.userData.targetPosition);
            }

            // 2d. Mise à jour des cibles de la tête (index 0)
            head.position.copy(head.userData.targetPosition);
            head.userData.previousPosition.copy(head.userData.targetPosition); 
            head.userData.targetPosition.set(nextX, segmentSize / 2, nextZ);

            lastMoveTime = currentTime;
        }
    }

    // --- LOGIQUE DE SUIVI ET LISSAGE DE LA CAMÉRA ---
    if (snake.length > 0) {
        const headPos = snake[0].position;
        
        // Calculer l'angle de rotation du serpent sur le plan XZ
        const angle = Math.atan2(direction.x, direction.z);
        
        // Créer une matrice de rotation 
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(angle);

        // Position CIBLE de la caméra (rotative)
        const cameraOffsetRotated = CAMERA_OFFSET.clone().applyMatrix4(rotationMatrix);
        targetCameraPosition = headPos.clone().add(cameraOffsetRotated);
        
        // Point de visée CIBLE de la caméra (légèrement devant le serpent pour une meilleure immersion)
        // targetCameraLookAt = headPos.clone().add(direction.clone().multiplyScalar(0.5));
        targetCameraLookAt = headPos.clone(); // Viser juste la tête est plus stable

        // Lissage de la position actuelle de la caméra vers la cible
        camera.position.lerp(targetCameraPosition, CAMERA_LERP_FACTOR);
        
        // Lissage du point de visée (lookAt) de la caméra vers la cible
        // On utilise un petit vecteur pour l'interpolation du lookAt
        const currentLookAt = new THREE.Vector3(0,0,0);
        camera.getWorldDirection(currentLookAt); // Récupérer la direction actuelle de la caméra
        currentLookAt.add(camera.position); // Convertir la direction en point de visée
        
        // Lisser la position du lookAt (plus stable que de lisser la rotation)
        const smoothLookAt = currentLookAt.lerp(targetCameraLookAt, CAMERA_LERP_FACTOR);
        
        // Appliquer la secousse sur la position lissée
        let finalCameraPosition;
        if (shakeIntensity > 0) {
            const dx = (Math.random() - 0.5) * 2 * shakeIntensity;
            const dy = (Math.random() - 0.5) * 2 * shakeIntensity;
            const dz = (Math.random() - 0.5) * 2 * shakeIntensity;
            
            finalCameraPosition = camera.position.clone().add(new THREE.Vector3(dx, dy, dz));
            
            camera.position.copy(finalCameraPosition); // Appliquer la secousse
            shakeIntensity *= SHAKE_DECAY;
        }

        // Viser la position lissée, même après la secousse
        camera.lookAt(smoothLookAt);
    } 
    // FIN LOGIQUE DE SUIVI

    // Rotation de la nourriture pour l'effet 3D
    if(food) food.rotation.y += 0.05;

    renderer.render(scene, camera);
}

// --- DÉMARRAGE ---

function startGame() {
    uiElement.classList.add('hidden');
    isPlaying = true;
    initGame();
}

startButton.addEventListener('click', startGame);

// Initialisation au chargement de la page
initScene();
animate(); // Lance la boucle de rendu