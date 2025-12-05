/* =========================================
   GESTION DES POPUPS (Apparition au scroll)
   ========================================= */

// Fonction générique pour gérer l'apparition des pubs
function setupScrollPopup(popupId, closeBtnId, percentage) {
    const popup = document.getElementById(popupId);
    const closeBtn = document.getElementById(closeBtnId);

    // Si les éléments n'existent pas, on arrête pour éviter les erreurs
    if (!popup || !closeBtn) return;

    let isClosedByUser = false;

    window.addEventListener('scroll', function () {
        if (isClosedByUser) return;

        // Calcul du seuil en pixels
        const scrollThreshold = percentage * document.body.scrollHeight;

        if (window.scrollY > scrollThreshold) {
            popup.classList.add('show');
        } else {
            popup.classList.remove('show');
        }
    });

    closeBtn.addEventListener('click', function (e) {
        // Empêche le clic du bouton de fermer de déclencher le piège global
        e.stopPropagation();
        popup.classList.remove('show');
        isClosedByUser = true;
    });
}

// Initialisation des deux popups (50% et 70%)
document.addEventListener("DOMContentLoaded", function () {
    setupScrollPopup('nirdPopup1', 'closePopup1Btn', 0.50);
    setupScrollPopup('nirdPopup2', 'closePopup2Btn', 0.70);
});


/* =========================================
   LE PIÈGE (Clic ailleurs après 60%)
   ========================================= */

let piegeActive = false; // Pour que ça n'arrive qu'une seule fois

document.addEventListener('click', function (event) {

    // 1. EXCEPTION : Si on clique DANS une pub (.popup-box)
    // La méthode .closest() vérifie si l'élément cliqué est à l'intérieur de la classe .popup-box
    if (event.target.closest('.popup-box')) {
        // On ne fait rien ici, on laisse le lien HTML <a> faire son travail 
        // (aller vers decath.html) ou le bouton fermer.
        return;
    }

    // 2. LE PIÈGE : Si on clique ailleurs
    const limiteScroll = 0.60 * document.body.scrollHeight;

    // Si on a scrollé assez bas ET que le piège n'a pas encore sauté
    if (!piegeActive && window.scrollY > limiteScroll) {

        if (clicked) {
            if (window.scrollY > 0.60 * document.body.scrollHeight) {
                // L'URL que vous voulez ouvrir
                const urlCible = "./popup/popup.html";

                // Ouvre l'URL dans un nouvel onglet ('_blank')
                window.open(urlCible, '_blank');
                clicked = false;
            }
        }
    }
});
