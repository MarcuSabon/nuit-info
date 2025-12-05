# Village NIRD

## Comment lancer le projet ?

Deux possibilités au choix :

### 1. **En local**

Ouvrir simplement le fichier : index.html

### 2. **En ligne**

Le site est accessible ici :  
**<https://nuit-de-info.netlify.app/>**

## Structure du Projet

L'architecture est **modulaire**, chaque dossier représentant un "univers" :

- `/` (Racine) : page d'accueil de sensibilisation.
- `/decath` : Module Sportif (QCM, Programme vidéo, Boutique).
- `/pirechamp` : Module **Anti-UX** (Formulaire infernal, Dark Patterns).
- `/snake` : Module Jeu (Snake 3D via Three.js), accès caché.
- `/vod` & `/img` : Hébergement local des assets pour une performance optimale hors-ligne.

## Vision Ergonomique

Notre conception repose sur une **narration interactive** pour dénoncer les dérives du numérique.

### Priorités & Inspirations

Nous avons choisi de sacrifier le confort immédiat de l'utilisateur pour provoquer une prise de conscience. L'inspiration vient des *Dark Patterns* et de l'économie de l'attention.

### Séquençage de l'Expérience

Avant de plonger dans le chaos, nous commençons par **présenter le combat du NIRD** et proposer des **alternatives concrètes**. Cette première phase est informative et lumineuse.

C'est seulement ensuite que nous basculons vers la critique par l'expérience :

### La Métaphore du Doomscrolling

Pour illustrer physiquement le concept de **doomscrolling**, nous avons implémenté une dégradation progressive de l'interface :

1. **Assombrissement du site**

   Plus on scrolle, plus la luminosité baisse, enfermant l'utilisateur dans une "bulle" sombre.
2. **Intrusion de contenu**

   Apparition d'éléments parasites (publicités, images *brainrot*) qui viennent polluer la navigation et saturer l'attention.

## Réalisation & Choix Techniques

## Stack Technique

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla).
- **3D** : Three.js (pour le jeu Snake).
- **Persistance** : `localStorage` (pour conserver le profil utilisateur entre les pages).

## Le Module *"Decathlon"* (`/decath`)

Ce module a représenté un défi d’intégration intéressant car il combine **profilage utilisateur**, **lecture vidéo** et **e-commerce simulé**.

## Points Techniques

### Profilage Dynamique

- Pas de base de données lourde : le QCM enregistre un **objet JSON dans le localStorage**.
- `decath.js` lit l’objet au chargement.
- Application de filtres CSS (`display: none`) pour masquer les exercices non adaptés  
  → Exemple : cacher les exercices *Experts* pour un utilisateur *Débutant*.

### Génération de DOM (Boutique)

- Le fichier `shop.js` contient un **tableau d’objets produits**.
- Les cartes HTML sont générées dynamiquement.
- Ajout d’un produit = juste ajouter un nouvel objet dans le tableau.

## Difficultés Rencontrées

### Gestion des vidéos (Autoplay & Son)

**Problème :**

- Les navigateurs bloquent les vidéos autoplay avec son.
- Mauvaise UX si plusieurs vidéos jouent en même temps.

**Solution :**

- Forcer `muted`.
- Retirer les contrôles natifs (`controls`).
- Ajouter un script custom : clic = play/pause avec le son toujours coupé.

## Autres Modules

### Pire Champs de saisie

- Utilisation massive de **CSS animations**,  
- Événements JS (`mouseover`) pour faire *fuir* les boutons et simuler une anti-UX volontaire.

### Snake 3D (caché)

- Implémentation d’une **caméra suiveuse lissée** (Lerp).  
- Évite le "mal de mer" classique dans les jeux 3D basiques.
