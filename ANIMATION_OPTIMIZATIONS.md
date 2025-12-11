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
| 1 | Remplacer `filter: drop-shadow` par SVG filters | [ ] |
| 2 | Pauser animations CSS hors viewport | [ ] |

### Priorité 2 (Impact Moyen)
| # | Optimisation | Statut |
|---|--------------|--------|
| 3 | Réduire wrappers text-reveal | [ ] |
| 4 | Consolider timelines GSAP | [ ] |
| 5 | Ajouter `pathLength="1"` aux SVG | [ ] |
| 6 | Ajouter `contain: layout paint` | [ ] |
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

> Ajouter ici les notes au fur et à mesure de l'implémentation

---

## Historique des modifications

| Date | Optimisation | Résultat | Notes |
|------|--------------|----------|-------|
| | | | |
