document.addEventListener('DOMContentLoaded', () => {
    // 1. Récupérer le profil depuis le navigateur
    const profilTexte = localStorage.getItem('profilUtilisateur');
    
    if (profilTexte) {
        const profil = JSON.parse(profilTexte);
        
        // Afficher le nom et le niveau
        const nomElement = document.getElementById('nom-user');
        const niveauElement = document.getElementById('niveau-user');

        if(nomElement) nomElement.innerText = profil.prenom;
        if(niveauElement) niveauElement.innerText = profil.niveau;

        // LOGIQUE DE FILTRAGE
        const pompes = document.getElementById('pompes');
        const burpees = document.getElementById('burpees');

        // On vérifie que les éléments existent avant de les masquer pour éviter les erreurs
        if (pompes && burpees) {
            if (profil.niveau === 'debutant') {
                // Le débutant ne voit pas les exos durs
                pompes.style.display = 'none';
                burpees.style.display = 'none';
            } else if (profil.niveau === 'confirme') {
                // Le confirmé voit les pompes mais pas les burpees
                burpees.style.display = 'none';
            }
            // L'expert voit tout
        }
    } else {
        // Si quelqu'un arrive ici sans passer par le QCM
        alert("Veuillez d'abord remplir le profil !");
        window.location.href = 'qcm.html';
    }
});