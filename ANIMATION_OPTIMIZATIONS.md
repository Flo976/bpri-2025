# Optimisations des Animations - Landing Page BPRI Carte Voeux 2026

## Objectif
Optimiser les performances graphiques et navigateur sans modifier le style et le rendu des animations actuelles.

---

## 1. Optimisations CSS

### 1.1 Filtres CSS coûteux (`drop-shadow`)
- [ ] **Remplacer `filter: drop-shadow()` par des filtres SVG natifs**
  - Fichiers concernés : `_animations.scss`
  - Keyframes : `dotPulse`, `dotPulseAlt`, `lineShimmer`, `strokeGlow`, `numberGlow`
  - Action : Créer des filtres SVG dans `<defs>` et les référencer via `filter: url(#filterID)`
  - Impact : Élevé

- [ ] **Réduire les étapes des keyframes de glow**
  - Passer de 4-5 états à 3 états (0%, 50%, 100%)
  - Utiliser `opacity` pour simuler l'intensité plutôt que modifier les valeurs de shadow
  - Impact : Moyen

### 1.2 Animations infinies multiples
- [ ] **Pauser les animations CSS hors viewport**
  - Implémenter `IntersectionObserver` pour gérer `animation-play-state`
  - Animations concernées : `rotateClockwise`, `rotateCounterClockwise`, `dotPulse`, `lineShimmer`, `numberGlow`, `strokeGlow`, `arcRotate`
  - Impact : Élevé

- [ ] **Regrouper les dots avec timings similaires**
  - Réduire la variation des délais CSS pour les dots
  - Impact : Faible

### 1.3 Propriétés `will-change`
- [ ] **Appliquer `will-change` dynamiquement**
  - Ajouter via JS avant l'animation, supprimer après
  - Éviter sur les éléments avec animations infinies permanentes
  - Impact : Moyen

---

## 2. Optimisations JavaScript/GSAP

### 2.1 ScrollTrigger
- [ ] **Optimiser la configuration ScrollTrigger**
  - Augmenter `scrub` de `0.5` à `1` ou `1.5`
  - Ajouter `fastScrollEnd: true`
  - Fichiers : `animationFactory.js`
  - Impact : Faible

### 2.2 Text Reveal - Structure DOM
- [ ] **Réduire les niveaux de wrapper**
  - Passer de 4 niveaux à 2 niveaux : `word-container > char`
  - Fichier : `textReveal.js`
  - Impact : Moyen

- [ ] **Optimiser le calcul du `backgroundPosition`**
  - Pré-calculer toutes les positions en une seule passe
  - Éviter `requestAnimationFrame` pour le positionnement initial
  - Stocker dans des CSS custom properties
  - Impact : Moyen

### 2.3 Timelines GSAP Section 0
- [ ] **Consolider les timelines**
  - Remplacer `setTimeout` par une timeline GSAP unique avec labels
  - Utiliser `gsap.delayedCall()` au lieu de `setTimeout`
  - Fichier : `section0Animation.js`
  - Impact : Moyen

---

## 3. Optimisations SVG

### 3.1 Stroke Dash Animation
- [ ] **Ajouter `pathLength="1"` aux SVG paths**
  - Simplifier les calculs de dashoffset (0 à 1)
  - Pré-calculer `getTotalLength()` une seule fois
  - Impact : Moyen

- [ ] **Ajouter `vector-effect: non-scaling-stroke`**
  - Sur les paths animés
  - Impact : Faible

### 3.2 Rotations SVG
- [ ] **Optimiser les transform-origin**
  - Appliquer directement dans le SVG via attribut
  - Considérer `rotate` CSS natif au lieu de `transform: rotate()`
  - Impact : Faible

---

## 4. Optimisations de rendu

### 4.1 Containment CSS
- [ ] **Ajouter `contain: layout paint` sur les conteneurs d'animation**
  - Sections : `.section0`, `.section1`, `.section2`
  - Impact : Moyen

- [ ] **Ajouter `isolation: isolate` sur les sections**
  - Limiter les stacking contexts
  - Impact : Faible

### 4.2 Promotion de couches
- [ ] **Limiter les éléments avec `translateZ(0)`**
  - Auditer et réduire les promotions de couches inutiles
  - Utiliser `contain: strict` sur éléments avec animations de filter
  - Impact : Moyen

---

## 5. Optimisations Mobile

### 5.1 Améliorations breakpoints
- [ ] **Augmenter le seuil de désactivation à 992px**
  - Désactiver animations coûteuses sur tablettes aussi
  - Fichier : `_animations.scss`
  - Impact : Moyen

- [ ] **Réduire le nombre de dots animés sur mobile**
  - N'animer que 50% des dots
  - Impact : Faible

- [ ] **Désactiver rotations SVG sur mobile**
  - Utiliser image statique ou pas de rotation
  - Impact : Moyen

---

## 6. Optimisations Iframe

### 6.1 ViewportAnimationController
- [ ] **Throttler les appels `getPageInfo()`**
  - Limiter à 60fps max (16.67ms)
  - Fichier : `iframeAnimations.js`
  - Impact : Faible

- [ ] **Implémenter debounce sur callbacks scroll**
  - Fichier : `scrollProxy.js`
  - Impact : Faible

---

## Résumé par priorité

### Priorité 1 (Impact Élevé)
| # | Optimisation | Statut |
|---|--------------|--------|
| 1 | Remplacer `filter: drop-shadow` par animation opacity | [x] |
| 2 | Pauser animations CSS hors viewport | [x] |

### Priorité 2 (Impact Moyen)
| # | Optimisation | Statut |
|---|--------------|--------|
| 3 | Réduire wrappers text-reveal | [ ] |
| 4 | Consolider timelines GSAP | [ ] |
| 5 | Ajouter `pathLength="1"` aux SVG | [ ] |
| 6 | Ajouter `contain: layout paint` | [x] |
| 7 | Optimiser calcul backgroundPosition | [ ] |
| 8 | Appliquer `will-change` dynamiquement | [ ] |
| 9 | Augmenter seuil mobile à 992px | [ ] |
| 10 | Limiter promotions de couches | [ ] |

### Priorité 3 (Impact Faible)
| # | Optimisation | Statut |
|---|--------------|--------|
| 11 | Augmenter `scrub` value | [ ] |
| 12 | Throttler iframe scroll | [ ] |
| 13 | Regrouper dots similaires | [ ] |
| 14 | Ajouter `vector-effect: non-scaling-stroke` | [ ] |
| 15 | Optimiser transform-origin SVG | [ ] |
| 16 | Ajouter `isolation: isolate` | [ ] |
| 17 | Réduire dots animés mobile | [ ] |
| 18 | Désactiver rotations SVG mobile | [ ] |
| 19 | Debounce callbacks scroll iframe | [ ] |
| 20 | Réduire étapes keyframes glow | [ ] |

---

## Métriques à surveiller

Avant/Après chaque optimisation, mesurer via Chrome DevTools :

- [ ] **Paint Time** : Viser < 16ms par frame
- [ ] **Composite Layers** : Limiter à < 30 couches actives
- [ ] **GPU Memory** : Surveiller l'utilisation mémoire
- [ ] **Main Thread** : Réduire le blocking time
- [ ] **FPS** : Maintenir 60fps constant

---

## Notes d'implémentation

### Optimisation 1 : Système Dual-Layer pour Glow (MISE À JOUR)

**Problème initial :**
L'approche simple (filtre statique + animation opacity seule) changeait le rendu visuel.

**Solution finale - Système Dual-Layer :**
Duplication des éléments SVG via JavaScript pour reproduire EXACTEMENT le rendu original :

```
[Élément original] → PAS de filtre, opacity: 1 → 0.8 → 1
[Élément clone]    → Filtre glow STATIQUE, opacity: 0 → 1 → 0
                     ↑ superposé sur l'original
```

**Fonctionnement :**
1. `MutationObserver` détecte quand `.glowing` ou `.pulsing` sont ajoutés
2. Clone l'élément et applique le filtre glow statique sur le clone
3. Anime les deux layers avec des keyframes synchronisés (Base + Glow)
4. Résultat visuel IDENTIQUE à l'original

**Fichiers créés/modifiés :**
- `glowLayerSystem.js` (nouveau) : Système de duplication et animation dual-layer
- `_animations.scss` : Nouveaux keyframes (Base + Glow pour chaque animation)
  - `dotPulseBase` / `dotPulseGlow`
  - `lineShimmerBase` / `lineShimmerGlow`
  - `strokeGlowBase` / `strokeGlowGlow`
  - `numberGlowBase` / `numberGlowGlow`
- `_section0.scss`, `_section1.scss`, `_section2.scss` : Suppression filtres statiques CSS
- `main.js` : Import et initialisation du système

**Gains de performance :**
- Filtre calculé UNE SEULE FOIS (sur le clone)
- Animation opacity = composite-only (GPU-accélérée)
- Rendu IDENTIQUE à l'original

---

### Optimisation 2 : Pauser animations hors viewport

**Approche utilisée :**
Utilisation de `IntersectionObserver` pour détecter quand les sections entrent/sortent du viewport et pauser/reprendre les animations CSS infinies.

**Fichiers créés/modifiés :**
- `animationVisibilityController.js` (nouveau) : Contrôleur avec IntersectionObserver
- `_animations.scss` : Ajout classe `.anim-visibility-paused` avec `animation-play-state: paused`
- `main.js` : Import et initialisation du contrôleur

**Fonctionnement :**
1. Observer les sections `.section0`, `.section1`, `.section2`
2. Quand une section sort du viewport, ajouter `.anim-visibility-paused` aux éléments animés
3. Quand elle revient, supprimer la classe
4. Marge de 50px pour anticiper l'entrée/sortie

**Éléments surveillés :**
- Rotations SVG (middle circles, arcs)
- Dots pulsing
- Strokes glowing
- Numbers glowing

**Gains de performance :**
- Économie CPU/GPU quand les animations ne sont pas visibles
- Pas d'impact sur l'UX (animations reprennent instantanément)

---

## Historique des modifications

| Date | Optimisation | Résultat | Notes |
|------|--------------|----------|-------|
| 2025-12-11 | Animation opacity au lieu de filter | Rendu modifié | Approche simple, rendu différent |
| 2025-12-11 | Pauser animations hors viewport | OK | IntersectionObserver + classe .anim-visibility-paused |
| 2025-12-11 | Système Dual-Layer pour Glow | OK | Clone SVG + filtre statique + animation opacity, rendu identique |
| 2025-12-11 | Suppression glow sections 1/2 | OK | Nettoyage CSS (-10%) et JS, animations glow uniquement sur section0 |
| 2025-12-11 | Ajouter contain: layout paint | OK | Sections 0/1/2 + illustration_wrapper isolés |
