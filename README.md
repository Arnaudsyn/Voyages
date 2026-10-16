# Voyages

Nos petits guides de voyage personnels, organisés par pays puis par ville ou région.

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
    ├── index.html
    ├── preparer/
    │   └── index.html
    ├── transports/
    │   └── index.html
    ├── hebergements/
    │   └── index.html
    ├── culture/
    │   └── index.html
    └── kyoto/
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

Le hub Japon rassemble :

- infos et astuces générales ;
- checklist de voyage ;
- destinations classées par durée indicative ;
- guides détaillés pour Tokyo, Kyoto, Osaka, Hakone, Kinosaki Onsen, etc.

Les informations générales restent sur `/japon/`, tandis que chaque destination garde ses adresses, visites, hôtels et retours d’expérience.

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


## Architecture des guides détaillés

Les guides de villes/régions utilisent désormais une base commune :

- `assets/guide.css` : mise en page, fiches, carte, responsive et comportement mobile visuel ;
- `assets/guide.js` : Leaflet, marqueurs, focus fiche ↔ carte, aperçu mobile, lightbox et retour en haut ;
- `assets/jr-pass-calculator.js` : comparateur interactif billets à l’unité / JR Pass national / principaux passes régionaux ;
- `templates/city-guide.html` : squelette canonique pour démarrer une nouvelle destination ;
- chaque `/<pays>/<destination>/index.html` ne contient plus que sa navigation, son contenu éditorial et ses données `GUIDE_*`.

Les données locales suivent ce contrat :

```js
window.GUIDE_CENTER = [latitude, longitude];
window.GUIDE_ZOOM = 13;
window.GUIDE_PLACES = [
  { id, name, lat, lng, emoji, kind }
];
window.GUIDE_PHOTOS = {
  placeId: { file, label }
};
```

Ainsi, une amélioration future du comportement mobile ou de la carte peut être faite une seule fois dans `guide.js` / `guide.css` et bénéficier à Vienne, Kyoto et aux futurs guides.

## Collection Japon · première rédaction complète

Le hub Japon relie désormais 44 guides ou premières pistes, dont Kyoto. Les destinations proviennent du tableau Japon et des étapes japonaises des différents voyages de « Les p'tits voyages 💑 ». Les petites destinations voisines sont parfois regroupées dans une page régionale.

- `data/japan-guides.json` contient les textes français et les points des 43 nouvelles pages.
- `scripts/build-japan-guides.py` régénère ces pages et la navigation du hub, sans modifier le contenu détaillé de Kyoto.
- `scripts/check-guides.py` vérifie les liens locaux, les ancres, la cohérence fiches/carte et les champs de base.
- [Couverture et limites de la première rédaction](docs/japan-coverage.md).
- [Comment transmettre vos lieux Google Maps](docs/google-maps-pois.md).

```sh
python3 scripts/build-japan-guides.py
python3 scripts/check-guides.py
```

Les pages générées sont versionnées : aucun Python ni build n’est nécessaire pour les consulter ou les publier sur GitHub Pages. Modifier leur contenu dans le JSON avant de régénérer. Kyoto reste une page éditée directement.

Un point peut fournir `mapsUrl` pour conserver son lien Google Maps d’origine. Les fiches sans coordonnées conservent une recherche par nom ; les adresses ambiguës ne proposent pas de recherche automatique. Une page sans point localisé affiche directement le texte plutôt qu’une carte vide.
