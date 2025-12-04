// import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// import { db } from "./firebase-config.js";

console.log("Position actuelle : " + window.scrollY + "px");
console.log("AAAH");
window.addEventListener('scroll', function() {
    // window.scrollY nous donne la position verticale en pixels
    console.log("Position actuelle : " + window.scrollY + "px");
    console.log("Hauteur totale de la page : " + (this.document.body.clientHeight - this.window.innerHeight) + "px");
});


async function ajouterUtilisateur(nom, age) {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            nom: nom,
            age: age,
            dateCreation: new Date()
        });
        console.log("Document écrit avec l'ID : ", docRef.id);
    } catch (e) {
        console.error("Erreur lors de l'ajout : ", e);
    }
}
// exemple pour ajouter une utilisateur
// ajouterUtilisateur("Alice", 25);

document.addEventListener("DOMContentLoaded", function() {
    const popup = document.getElementById('nirdPopup');
    const closeBtn = document.getElementById('closePopupBtn');
    
    // Variable pour savoir si l'utilisateur a fermé la pop-up manuellement
    let isClosedByUser = false;

    // Seuil de déclenchement (en pixels)
    const scrollThreshold = 600;

    window.addEventListener('scroll', function() {
        // Si l'utilisateur a fermé la fenêtre, on ne fait plus rien
        if (isClosedByUser) return;

        // Si on a dépassé le seuil
        if (window.scrollY > scrollThreshold) {
            popup.classList.add('show');
        } else {
            // Optionnel : La cacher si on remonte tout en haut
            popup.classList.remove('show');
        }
    });

    // Gestion du bouton Fermer
    closeBtn.addEventListener('click', function() {
        popup.classList.remove('show');
        isClosedByUser = true; // On retient que l'utilisateur l'a fermée
    });
});