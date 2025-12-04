// shop.js

const produits = [
    {
        titre: "Tapis de Sol Confort",
        description: "Indispensable pour protéger vos genoux et votre dos (abdos, gainage).",
        prix: "15,00 €",
        image: "../img/tapis.jpg",
        lien: "https://www.decathlon.fr/search?Ntt=tapis+sol+fitness"
    },
    {
        titre: "Élastique de Résistance",
        description: "Pour augmenter la difficulté des squats et fentes ou s'étirer.",
        prix: "7,00 €",
        image: "../img/elastique.jpg",
        lien: "https://www.decathlon.fr/search?Ntt=elastique+musculation"
    },
    {
        titre: "Rouleau de Massage",
        description: "Le meilleur ami de votre récupération après une séance intense.",
        prix: "20,00 €",
        image: "../img/rouleau.jpg",
        lien: "https://www.decathlon.fr/search?Ntt=rouleau+massage"
    },
    {
        titre: "Gourde Sport 1L",
        description: "L'hydratation est la clé de la performance. Ne l'oubliez jamais !",
        prix: "5,00 €",
        image: "../img/gourde.jpg",
        lien: "https://www.decathlon.fr/search?Ntt=gourde+sport"
    },
    {
        titre: "Poignées de Pompes",
        description: "Soulage les poignets et permet une meilleure amplitude.",
        prix: "12,00 €",
        image: "../img/poignee.jpg",
        lien: "https://www.decathlon.fr/search?Ntt=poignees+pompes"
    },
    {
        titre: "Ceinture Lombaire Renforcée",
        description: "Indispensable pour protéger vos vertèbres lors des charges lourdes (Squat, Deadlift) ou soulager le dos.",
        prix: "25,00 €",
        image: "../img/ceinture.jpg",
        lien: "https://www.decathlon.fr/search?Ntt=ceinture+lombaire+musculation"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('shop-container');

    produits.forEach(produit => {
        const carte = document.createElement('div');
        carte.classList.add('product-card');

        carte.innerHTML = `
            <div class="image-container">
                <img src="${produit.image}" alt="${produit.titre}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-title">${produit.titre}</h3>
                <p class="product-desc">${produit.description}</p>
                <div class="product-price">${produit.prix}</div>
                <a href="${produit.lien}" target="_blank" class="btn-achat">Voir sur Decathlon.fr</a>
            </div>
        `;

        container.appendChild(carte);
    });
});