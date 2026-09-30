# Voyages

Petits guides de voyage personnels, organisés par pays puis par ville ou région.

## Structure

```
Voyages/
├── index.html
├── assets/
│   └── site.css
├── autriche/
│   ├── index.html
│   └── vienne/
│       └── index.html
└── japon/
    └── index.html
```

- `/` : page globale pour choisir un pays.
- `/autriche/` : hub pays.
- `/autriche/vienne/` : guide détaillé au format carte + fiches.
- `/japon/` : hub Japon, avec les informations pays et la future collection de villes/régions.

## Ajouter un nouveau pays

1. Créer un dossier `/<pays>/`.
2. Ajouter un `index.html` servant de hub.
3. Ajouter sa carte sur la page d'accueil racine.
4. Créer ensuite les sous-dossiers de villes ou régions au fur et à mesure.

Exemple :

```
italie/
├── index.html
├── rome/
│   └── index.html
└── florence/
    └── index.html
```

## Ajouter une ville ou une région

Le guide de Vienne sert de référence pour les pages détaillées :

- retours d'expérience personnels ;
- temps de visite indicatifs ;
- informations pratiques ;
- carte interactive Leaflet / OpenStreetMap ;
- navigation entre les fiches et les marqueurs ;
- comportement mobile avec aperçu avant d'ouvrir le détail.

La logique est volontairement statique : pas de framework ni de build.

## Japon

Le hub Japon reprend la structure déjà organisée dans Trello :

- infos et astuces générales ;
- checklist de voyage ;
- destinations classées par durée indicative ;
- futurs guides détaillés pour Tokyo, Kyoto, Osaka, Hakone, Kinosaki Onsen, etc.

Les informations pays restent sur `/japon/` afin d'éviter de les répéter dans chaque guide local.

## Publier avec GitHub Pages

Dans le dépôt GitHub :

1. **Settings → Pages**
2. Dans **Build and deployment**, choisir **Deploy from a branch**
3. Branche : **main**
4. Dossier : **/(root)**
5. Enregistrer.

URL standard :

`https://arnaudsyn.github.io/Voyages/`

## Technique

Les pages restent en HTML/CSS/JS statiques.

Le guide de Vienne utilise :

- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)

Les coordonnées sont stockées directement dans le HTML pour éviter une dépendance de géocodage au chargement.
