# Structure du Projet

L'architecture est **modulaire**, chaque dossier représentant un "univers" :

- `/` (Racine) : Landing page de sensibilisation (Pop-ups, Parallaxe).
- `/decath` : Module Sportif (QCM, Programme vidéo, Boutique).
- `/pirechamp` : Module **Anti-UX** (Formulaire infernal, Dark Patterns).
- `/snake` : Module Jeu (Snake 3D via Three.js).
- `/vod` & `/img` : Hébergement local des assets pour une performance optimale hors-ligne.

---

# Réalisation & Choix Techniques

## Stack Technique

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla).
- **3D** : Three.js (pour le jeu Snake).
- **Persistance** : `localStorage` (pour conserver le profil utilisateur entre les pages).

---

# Focus : Le Module *"Decathlon"* (`/decath`)

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

---

# Difficultés Rencontrées

## Gestion des vidéos (Autoplay & Son)

**Problème :**
- Les navigateurs bloquent les vidéos autoplay avec son.
- Mauvaise UX si plusieurs vidéos jouent en même temps.

**Solution :**
- Forcer `muted`.
- Retirer les contrôles natifs (`controls`).
- Ajouter un script custom : clic = play/pause, son toujours coupé.

## Chemins relatifs

**Problème :**  
Liens entre `/`, `/decath` et `/vod` → erreurs 404.

**Solution :**  
Adopter une structure stricte : les assets lourds sont dans `/vod`, accessibles via `../vod/` depuis les sous-dossiers.

---

# Autres Modules

## PireChamp
- Utilisation massive de **CSS animations**,  
- Événements JS (`mouseover`) pour faire *fuir* les boutons et simuler une anti-UX volontaire.

## Snake 3D
- Implémentation d’une **caméra suiveuse lissée** (Lerp).  
- Évite le "mal de mer" classique dans les jeux 3D basiques.

---

# Comment lancer le projet ?

Deux possibilités au choix :

### 1. **En local**
Ouvrir simplement le fichier : index.html

### 2. **En ligne**
Le site est accessible ici :  
**https://nuit-de-info.netlify.app/**

---

