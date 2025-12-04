document.addEventListener('DOMContentLoaded', () => {
    
    // 1. GESTION DU PROFIL (Rien ne change ici)
    const profilTexte = localStorage.getItem('profilUtilisateur');
    
    if (!profilTexte) {
        alert("Profil introuvable, redirection...");
        window.location.href = '../qcm/qcm.html'; 
        return;
    }

    const profil = JSON.parse(profilTexte);
    const nomEl = document.getElementById('nom-user');
    const nivEl = document.getElementById('niveau-user');
    if(nomEl) nomEl.innerText = profil.prenom;
    if(nivEl) nivEl.innerText = profil.niveau;

    // 2. FILTRAGE (Rien ne change ici)
    const exosDifficiles = document.querySelectorAll('.difficile');
    const exosExperts = document.querySelectorAll('.expert');

    if (profil.niveau === 'debutant') {
        exosDifficiles.forEach(el => el.style.display = 'none');
        exosExperts.forEach(el => el.style.display = 'none');
    } else if (profil.niveau === 'confirme') {
        exosExperts.forEach(el => el.style.display = 'none');
    }

    // 3. NOUVEAU : GESTION DES VIDÉOS SANS SON
    const videos = document.querySelectorAll('video');

    videos.forEach(video => {
        // Double sécurité pour le son
        video.muted = true;
        video.volume = 0;

        // Interaction au clic
        video.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                video.parentElement.classList.add('playing'); // Pour cacher le texte d'aide
            } else {
                video.pause();
                video.parentElement.classList.remove('playing');
            }
        });

        // Empêche toute tentative de remettre le son via le menu contextuel
        video.addEventListener('volumechange', () => {
            video.muted = true;
            video.volume = 0;
        });
    });
});