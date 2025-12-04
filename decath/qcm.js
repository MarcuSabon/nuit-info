document.addEventListener('DOMContentLoaded', () => {
    const formulaire = document.getElementById('monFormulaire');

    if (formulaire) {
        formulaire.addEventListener('submit', function(e) {
            e.preventDefault(); // Empêche le rechargement de la page

            // 1. On récupère les infos saisies
            const prenom = document.getElementById('prenom').value;
            const niveau = document.getElementById('niveau').value;

            // 2. On prépare l'objet à sauvegarder
            const profil = {
                prenom: prenom,
                niveau: niveau
            };

            // 3. On sauvegarde dans le LocalStorage
            localStorage.setItem('profilUtilisateur', JSON.stringify(profil));

            // 4. On change de page vers les exercices (decath.html)
            window.location.href = 'decath.html';
        });
    }
});