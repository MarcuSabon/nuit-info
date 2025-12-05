/* =========================================
   1. GESTION DES PUBS (Popups au scroll)
   ========================================= */

function setupScrollPopup(popupId, closeBtnId, percentage) {
    const popup = document.getElementById(popupId);
    const closeBtn = document.getElementById(closeBtnId);
    if (!popup || !closeBtn) return;

    let isClosedByUser = false;

    window.addEventListener('scroll', function () {
        if (isClosedByUser) return;
        const scrollThreshold = percentage * document.body.scrollHeight;

        if (window.scrollY > scrollThreshold) {
            popup.classList.add('show');
        } else {
            popup.classList.remove('show');
        }
    });

    closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        popup.classList.remove('show');
        isClosedByUser = true;
    });
}

// Initialisation des pubs
document.addEventListener("DOMContentLoaded", function () {
    setupScrollPopup('nirdPopup1', 'closePopup1Btn', 0.50);
    setupScrollPopup('nirdPopup2', 'closePopup2Btn', 0.70);
});


/* =========================================
   2. GESTION DE LA FIN (90% Scroll)
   ========================================= */

const finalOverlay = document.getElementById('finalOverlay');
const stopBtn = document.getElementById('stopScrollBtn');
let finalShown = false;

window.addEventListener('scroll', function () {
    // Si on dépasse 90% de la page
    const limit = 0.90 * document.body.scrollHeight;

    if (!finalShown && window.scrollY > limit) {
        finalOverlay.classList.add('visible');

        // Optionnel : Bloquer le scroll pour forcer la lecture
        document.body.style.overflow = 'hidden';

        finalShown = true;
    }
});

// Bouton "J'ai compris"
if (stopBtn) {
    stopBtn.addEventListener('click', function () {
        // On remonte tout en haut de la page pour "recommencer" ou sortir
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // On cache l'overlay et on réactive le scroll
        finalOverlay.classList.remove('visible');
        document.body.style.overflow = 'auto';
    });
}
