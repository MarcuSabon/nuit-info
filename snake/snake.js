// ===================================
// VARIABLES & INITIALISATION DU JEU
// ===================================
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('startButton');
const messageOverlay = document.getElementById('messageOverlay');
const gameOverTitle = document.getElementById('gameOverTitle');
const finalScoreElement = document.getElementById('finalScore');

const tailleCase = 20;
const nombreDeCases = canvas.width / tailleCase;

let snake;
let nourriture;
let dx;
let dy;
let score;
let gameInterval;
let vitesse = 100; // Vitesse en millisecondes

// Initialiser l'état du jeu (mais ne pas le démarrer)
initialiserJeu();

// ===================================
// GESTION DU DÉMARRAGE ET FIN DU JEU
// ===================================

/**
 * Configure les variables pour un nouveau jeu.
 */
function initialiserJeu() {
    // Position initiale du serpent (au centre)
    snake = [
        {x: 10 * tailleCase, y: 10 * tailleCase}
    ];
    
    // Direction initiale (vers la droite)
    dx = tailleCase;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    
    // Cache l'overlay au démarrage
    messageOverlay.style.display = 'flex';
    gameOverTitle.textContent = "Appuyez pour Démarrer !";
    finalScoreElement.textContent = "Utilisez les flèches directionnelles (ou ZQSD).";
    startButton.textContent = "Démarrer le Jeu";
    
    // Dessine l'état initial (un seul segment de serpent)
    nettoyerCanvas();
    dessinerSerpent();
}

/**
 * Lance le jeu après le clic sur le bouton.
 */
function demarrerJeu() {
    // Réinitialise l'état avant de commencer
    initialiserJeu(); 
    
    // Cache le message de démarrage
    messageOverlay.style.display = 'none';
    
    // Génère la nourriture et démarre la boucle
    genererNourriture();
    gameInterval = setInterval(jeuPrincipal, vitesse);
}

/**
 * Arrête la boucle de jeu et affiche le message de fin.
 */
function stopperJeu() {
    clearInterval(gameInterval);
    
    // Affiche le message de fin de jeu
    gameOverTitle.textContent = "PARTIE TERMINÉE !";
    finalScoreElement.textContent = `Votre score final : ${score}`;
    startButton.textContent = "Rejouer";
    messageOverlay.style.display = 'flex';
}

// ===================================
// BOUCLE PRINCIPALE & DÉPLACEMENT
// ===================================

function jeuPrincipal() {
    // 1. Vérifier la fin du jeu
    if (finDuJeu()) {
        stopperJeu();
        return;
    }

    // 2. Déplacer le serpent
    deplacerSerpent();

    // 3. Mise à jour de l'affichage
    nettoyerCanvas();
    dessinerNourriture();
    dessinerSerpent();
}

function deplacerSerpent() {
    // Créer la nouvelle tête
    const nouvelleTete = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    // Ajouter la nouvelle tête au début
    snake.unshift(nouvelleTete);

    // Vérifier si le serpent mange la nourriture
    if (nouvelleTete.x === nourriture.x && nouvelleTete.y === nourriture.y) {
        // Manger : le serpent grandit (ne pas retirer la queue)
        score++;
        scoreElement.textContent = score; // Mise à jour de l'élément HTML du score
        genererNourriture();
    } else {
        // Ne mange pas : retirer la queue
        snake.pop(); 
    }
}

// ===================================
// DESSIN SUR LE CANVAS
// ===================================

function nettoyerCanvas() {
    ctx.fillStyle = '#000000'; // Fond noir du canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function dessinerSegment(segment, couleur) {
    ctx.fillStyle = couleur;
    ctx.fillRect(segment.x, segment.y, tailleCase, tailleCase);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; // Lignes de séparation fines
    ctx.strokeRect(segment.x, segment.y, tailleCase, tailleCase);
}

function dessinerSerpent() {
    // Corps du serpent
    snake.slice(1).forEach(segment => dessinerSegment(segment, '#33CC33')); 
    // Tête du serpent (couleur différente pour la distinguer)
    dessinerSegment(snake[0], '#66FF66'); 
}

function dessinerNourriture() {
    // Utilisation d'une forme ronde pour la nourriture
    ctx.fillStyle = '#FF6347'; // Rouge vif
    const rayon = tailleCase / 2;
    ctx.beginPath();
    ctx.arc(nourriture.x + rayon, nourriture.y + rayon, rayon * 0.8, 0, 2 * Math.PI);
    ctx.fill();
}

// ===================================
// LOGIQUE DE JEU
// ===================================

function coordonneeAleatoire() {
    return Math.floor(Math.random() * nombreDeCases) * tailleCase;
}

function genererNourriture() {
    let nouvelleNourriture;
    // Boucle pour s'assurer que la nourriture n'apparaît pas sur le serpent
    do {
        nouvelleNourriture = {
            x: coordonneeAleatoire(),
            y: coordonneeAleatoire()
        };
    } while (snake.some(segment => segment.x === nouvelleNourriture.x && segment.y === nouvelleNourriture.y));

    nourriture = nouvelleNourriture;
}

function finDuJeu() {
    const tete = snake[0];
    
    // Collision Mur
    const collisionMur = 
        tete.x < 0 || 
        tete.x >= canvas.width || 
        tete.y < 0 || 
        tete.y >= canvas.height; 

    // Collision Corps (le serpent se mord)
    const collisionCorps = snake
        .slice(1) // Corps du serpent (tous les segments sauf la tête)
        .some(segment => segment.x === tete.x && segment.y === tete.y);

    return collisionMur || collisionCorps;
}

// ===================================
// GESTION DES ÉVÉNEMENTS (INPUTS)
// ===================================

/**
 * Écoute le clic sur le bouton pour démarrer/rejouer.
 */
startButton.addEventListener('click', demarrerJeu);


/**
 * Change la direction du serpent en fonction de la touche pressée.
 * Empêche le serpent de faire demi-tour sur lui-même.
 */
document.addEventListener('keydown', changerDirection);

function changerDirection(event) {
    // Touches utilisées : Flèches et ZQSD (pour les claviers AZERTY)
    const touche = event.key;
    const allerGauche = dx === -tailleCase;
    const allerDroite = dx === tailleCase;
    const allerHaut = dy === -tailleCase;
    const allerBas = dy === tailleCase;
    
    // Empêche le défilement de la page avec les flèches
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'q', 's', 'd'].includes(touche)) {
        event.preventDefault();
    }

    // Flèche Gauche ou 'q'
    if ((touche === 'ArrowLeft' || touche === 'q') && !allerDroite) {
        dx = -tailleCase; dy = 0;
    // Flèche Droite ou 'd'
    } else if ((touche === 'ArrowRight' || touche === 'd') && !allerGauche) {
        dx = tailleCase; dy = 0;
    // Flèche Haut ou 'z'
    } else if ((touche === 'ArrowUp' || touche === 'z') && !allerBas) {
        dx = 0; dy = -tailleCase;
    // Flèche Bas ou 's'
    } else if ((touche === 'ArrowDown' || touche === 's') && !allerHaut) {
        dx = 0; dy = tailleCase;
    }
}