document.addEventListener('DOMContentLoaded', () => {
    
    // --- ETAT GLOBAL ---
    const state = {
        m1: false,
        m2: false,
        m3: false
    };

    function checkVictory() {
        if (state.m1 && state.m2 && state.m3) {
            document.getElementById('card-finale').classList.remove('hidden');
            // Scroll smooth vers le bas
            setTimeout(() => {
                document.getElementById('card-finale').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }

    // ==========================================
    // MODULE 1 : CODE POSTAL (Quantum)
    // ==========================================
    const qInput = document.getElementById('quantum-input');
    const qBtn = document.getElementById('btn-quantum');
    const qMsg = document.getElementById('msg-1');
    let isFrozen = false;

    // Le placeholder changeant
    const placeholders = ["75001", "Code Postal ?", "Pas ici...", "Erreur 404", "Votre ADN ?", "99999"];
    
    setInterval(() => {
        if (!isFrozen && !state.m1) {
            qInput.placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];
        }
    }, 900);

    // Ça bouge quand on essaie de cliquer ou taper
    qInput.addEventListener('mousemove', () => {
        if (!isFrozen && !state.m1) {
            const x = (Math.random() - 0.5) * 30;
            const y = (Math.random() - 0.5) * 10;
            qInput.style.transform = `translate(${x}px, ${y}px)`;
        }
    });

    // Bouton "Valider" qui sert en fait à figer
    qBtn.textContent = "Stabiliser la zone (1s)";
    
    qBtn.addEventListener('click', () => {
        isFrozen = true;
        qInput.style.transform = 'translate(0,0)';
        qInput.style.borderColor = '#27ae60'; // Vert
        qBtn.textContent = "Zone Figée ! Vite !";
        
        setTimeout(() => {
            if (!state.m1) {
                isFrozen = false;
                qInput.style.borderColor = '#ddd';
                qBtn.textContent = "Stabiliser la zone (1s)";
                qInput.value = ""; // Sadique : on efface si pas validé
                qMsg.textContent = "Donnée perdue. Recommencez.";
            }
        }, 1500); // 1.5 secondes pour taper
    });

    qInput.addEventListener('input', () => {
        // Si figé et qu'on a tapé 5 chiffres
        if (isFrozen && qInput.value.length === 5) {
            state.m1 = true;
            document.getElementById('card-1').classList.add('success-state');
            qMsg.textContent = "";
            checkVictory();
        }
    });


    // ==========================================
    // MODULE 2 : PRÉNOM (Mood Swing)
    // ==========================================
    const mInput = document.getElementById('mood-input');
    const gaugeCursor = document.getElementById('gauge-cursor');
    const mMsg = document.getElementById('msg-2');
    let lastKeyTime = Date.now();

    mInput.addEventListener('keydown', (e) => {
        if (state.m2) return;
        if (e.key.length > 1 && e.key !== 'Backspace') return;

        const now = Date.now();
        const diff = now - lastKeyTime;
        lastKeyTime = now;

        // Logique de tempo (cible : entre 200ms et 500ms)
        if (diff < 150) {
            // Trop vite (Stress)
            gaugeCursor.style.left = '90%';
            gaugeCursor.style.backgroundColor = '#e74c3c'; // Rouge
            mMsg.textContent = "Trop vite ! Le système panique.";
            
            if (Math.random() > 0.4) {
                e.preventDefault(); // Mange la lettre
                mInput.value = mInput.value.slice(0, -1);
            }
        } else if (diff > 800) {
            // Trop lent (Ennui)
            gaugeCursor.style.left = '10%';
            gaugeCursor.style.backgroundColor = '#3498db'; // Bleu
            mMsg.textContent = "Zzz... Le système s'endort.";
            
            // Ajoute des lettres parasites
            setTimeout(() => { mInput.value += "z"; }, 50);
        } else {
            // OK
            gaugeCursor.style.left = '50%';
            gaugeCursor.style.backgroundColor = '#27ae60'; // Vert
            mMsg.textContent = "";
        }

        // Validation si longueur suffisante et curseur au milieu
        if (mInput.value.length > 3 && gaugeCursor.style.left === '50%') {
            // On attend une petite pause pour valider
            setTimeout(() => {
                if (mInput.value.length > 3) {
                    state.m2 = true;
                    document.getElementById('card-2').classList.add('success-state');
                    checkVictory();
                }
            }, 1000);
        }
    });


    // ==========================================
    // MODULE 3 : EMAIL (Rotation 3D)
    // ==========================================
    const rInput = document.getElementById('rotation-input');
    const rBox = document.getElementById('rotating-box');
    const rBtn = document.getElementById('btn-rotate');
    const rMsg = document.getElementById('msg-3');
    let angle = 0;

    rInput.addEventListener('input', () => {
        if (state.m3) return;
        angle += 30;
        rBox.style.transform = `rotateY(${angle}deg)`;
        
        // Rend le texte flou si ça tourne trop
        if (angle % 360 !== 0) {
            rInput.style.filter = "blur(1px)";
        } else {
            rInput.style.filter = "none";
        }
    });

    // Bouton fuyant
    rBtn.addEventListener('mouseover', () => {
        if (state.m3) return;
        // Déplacement aléatoire léger
        const tx = (Math.random() - 0.5) * 150;
        const ty = (Math.random() - 0.5) * 50;
        rBtn.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    rBtn.addEventListener('click', () => {
        if (rInput.value.includes('@') && rInput.value.includes('.')) {
            state.m3 = true;
            rBox.style.transform = "rotateY(0deg)";
            rBtn.style.transform = "none";
            document.getElementById('card-3').classList.add('success-state');
            checkVictory();
        } else {
            rMsg.textContent = "Email invalide ou vertige détecté.";
        }
    });


    // ==========================================
    // SNAKE GAME (Récompense)
    // ==========================================
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-snake');
    
    let snake = [{x: 10, y: 10}];
    let food = {x: 5, y: 5};
    let dx = 0; let dy = 0;
    let score = 0;
    let gameLoop;

    startBtn.addEventListener('click', () => {
        document.getElementById('game-container').classList.remove('hidden');
        startBtn.style.display = 'none';
        
        // Config initiale
        dx = 1; dy = 0;
        document.addEventListener('keydown', changeDirection);
        gameLoop = setInterval(draw, 100);
    });

    function changeDirection(e) {
        const LEFT = 37; const RIGHT = 39; const UP = 38; const DOWN = 40;
        const key = e.keyCode;
        
        if (key === LEFT && dx !== 1) { dx = -1; dy = 0; }
        if (key === UP && dy !== 1) { dx = 0; dy = -1; }
        if (key === RIGHT && dx !== -1) { dx = 1; dy = 0; }
        if (key === DOWN && dy !== -1) { dx = 0; dy = 1; }
    }

    function draw() {
        // Calcul position
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        
        // Limites (Wrap around ou Game Over - ici Wrap around pour être sympa)
        if (head.x < 0) head.x = 14;
        if (head.x > 14) head.x = 0;
        if (head.y < 0) head.y = 14;
        if (head.y > 14) head.y = 0;

        // Collision corps
        for (let part of snake) {
            if (part.x === head.x && part.y === head.y) {
                // Reset simple
                snake = [{x: 10, y: 10}];
                score = 0;
                document.getElementById('score-val').innerText = score;
                return;
            }
        }

        snake.unshift(head);

        // Manger
        if (head.x === food.x && head.y === food.y) {
            score++;
            document.getElementById('score-val').innerText = score;
            food = {
                x: Math.floor(Math.random() * 15),
                y: Math.floor(Math.random() * 15)
            };
        } else {
            snake.pop();
        }

        // Dessin
        ctx.fillStyle = '#0f2027'; // Fond
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#4a90e2'; // Snake Bleu
        snake.forEach(p => ctx.fillRect(p.x * 20, p.y * 20, 18, 18));

        ctx.fillStyle = '#f1c40f'; // Pomme Jaune
        ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
    }
});