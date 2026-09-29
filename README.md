# Voyages

Petits guides de voyage personnels.

## Vienne

Le fichier \`index.html\` contient le guide Vienne 2026 avec :

- retours d'expérience personnels ;
- temps de visite indicatifs ;
- informations pratiques pour novembre 2026 ;
- carte interactive Leaflet / OpenStreetMap ;
- navigation bidirectionnelle entre les fiches et les marqueurs.

### Publier avec GitHub Pages

Dans le dépôt GitHub :

1. **Settings → Pages**
2. Dans **Build and deployment**, choisir **Deploy from a branch**
3. Branche : **main**
4. Dossier : **/(root)**
5. Enregistrer.

L'URL standard sera normalement :

\`https://arnaudsyn.github.io/Voyages/\`

> Si le dépôt reste privé, la disponibilité de GitHub Pages dépend du plan GitHub du compte.

### Technique

Le guide est volontairement statique : un seul HTML, pas de framework ni de build.

La carte utilise :
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)

Les coordonnées sont stockées directement dans le HTML afin d'éviter une dépendance de géocodage au chargement.
