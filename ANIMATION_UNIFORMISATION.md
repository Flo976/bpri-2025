# Uniformisation des Animations : Mode Iframe vs Sans Iframe

## Objectif
Uniformiser le rendu des animations entre le mode **avec iframe** (production) et le mode **sans iframe** (développement) en alignant le code sans iframe sur le comportement du mode iframe.

---

## Architecture Actuelle

### Fichiers Concernés
| Fichier | Lignes | Rôle |
|---------|--------|------|
| `assets/js/pages/landing/functions/animations/animationFactory.js` | 727 | Factory central, détection mode, création animations |
| `assets/js/pages/landing/functions/animations/iframeAnimations.js` | 339 | `ViewportAnimationController` pour mode iframe |
| `assets/js/pages/landing/functions/animations/section0Animation.js` | 208 | Animations hero (logo, cercles, lignes, dots, 2026) |
| `assets/js/pages/landing/functions/animations/section1Animation.js` | 84 | Config animations section 1 |
| `assets/js/pages/landing/functions/animations/section2Animation.js` | 95 | Config animations section 2 |
| `assets/js/pages/landing/functions/animations/textReveal.js` | 352 | Animation révélation texte |
| `assets/js/pages/landing/functions/animations/scrollProxy.js` | 177 | Proxy scroll (legacy) |

### Détection du Mode
```javascript
// animationFactory.js:11-17
const isInIframe = (() => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
})();
```

### Différences Techniques
| Aspect | Mode Iframe (Prod) | Mode Sans Iframe (Dev) |
|--------|-------------------|------------------------|
| Source scroll | `parentIFrame.getPageInfo()` | `window.scrollY` |
| Méthode animation | `ViewportAnimationController` | GSAP `ScrollTrigger` |
| Boucle update | `requestAnimationFrame` manuel | Optimisé par GSAP |
| Durée tween | `0.05s` (interpolation) | Variable selon config |

---

## Phase 1 : Audit des Différences ✅

### 1.1 Identifier les différences visuelles concrètes
- [x] Section 0 - Hero animations (timeline-based, pas affecté par iframe/normal)
- [x] Section 1 - Scroll animations (utilise animationFactory)
- [x] Section 2 - Scroll animations (utilise animationFactory)
- [x] Text reveal animations (différences significatives)

### 1.2 Comparer les configurations
- [x] Valeurs `start` / `end` : **IDENTIQUES** dans les deux modes
- [x] Valeurs `stagger` : **DIFFÉRENTES** (voir détails ci-dessous)
- [x] Propriétés animées : **IDENTIQUES** (opacity, strokeDashoffset, y, scale)

---

## Phase 2 : Analyse du Code ✅

### 2.1 Différences par type d'animation

#### STROKE Animation (`animationFactory.js:111-198`)

| Aspect | Mode Iframe | Mode Sans Iframe |
|--------|-------------|------------------|
| Méthode | `viewportController.add()` par stroke | `gsap.timeline()` pour toutes les strokes |
| Stagger | `start - (index * staggerOffset)` | Fixe: `0.2` |
| Interpolation | Continue via progress | Via `scrub: 0.5` |
| Duration | Implicite (dépend du scroll) | `1` |

**Impact visuel**: En mode iframe, chaque stroke a son propre seuil de déclenchement (décalé). En mode normal, toutes les strokes commencent ensemble avec un stagger temporel.

#### DOT Animation (`animationFactory.js:205-288`)

| Aspect | Mode Iframe | Mode Sans Iframe |
|--------|-------------|------------------|
| Méthode | `viewportController.add()` | `gsap.timeline()` |
| Duration | Implicite | `0.5` |
| Scrub | N/A | `0.5` |

**Impact visuel**: Similaire, mais le timing d'interpolation diffère.

#### ARC Animation (`animationFactory.js:294-432`)

| Aspect | Mode Iframe | Mode Sans Iframe |
|--------|-------------|------------------|
| Stagger | `start - (index * staggerOffset)` | Fixe: `0.1` |
| Duration | Implicite | `1` |

**Impact visuel**: Même problème que STROKE - le décalage est spatial (iframe) vs temporel (normal).

#### FADE_SCALE Animation (`animationFactory.js:438-523`)

| Aspect | Mode Iframe | Mode Sans Iframe |
|--------|-------------|------------------|
| Duration | Implicite | `0.8` |
| Scrub | N/A | `0.5` |

**Impact visuel**: L'interpolation diffère mais moins visible.

#### FADE_UP Animation (`animationFactory.js:528-570`)

| Aspect | Mode Iframe | Mode Sans Iframe |
|--------|-------------|------------------|
| Duration | Implicite | `1` |
| Scrub | N/A | `0.5` |

**Impact visuel**: Similaire à FADE_SCALE.

#### TEXT_REVEAL Animation (`animationFactory.js:577-678`) ⚠️ **DIFFÉRENCE MAJEURE**

| Aspect | Mode Iframe | Mode Sans Iframe |
|--------|-------------|------------------|
| Méthode stagger | Offset dynamique sur start/end | Stagger temporel fixe |
| Calcul offset | `maxTotalOffset = 15%` / `(totalChars - 1)` | `stagger: 0.02` |
| Scrub | N/A | `0.3` |
| Duration | Implicite | `1` |
| force3D | Non spécifié | `false` |

**Code Iframe (lignes 577-611):**
```javascript
const maxTotalOffset = 15;
const perCharOffset = totalChars > 1 ? maxTotalOffset / (totalChars - 1) : 0;

chars.forEach((char, index) => {
    const offset = index * perCharOffset;
    viewportController.add({
        trigger: triggerEl,
        targets: char,
        from: { y: 100, opacity: 0 },
        to: { y: 0, opacity: 1 },
        start: start - offset,  // Décalage spatial
        end: end - offset
    });
});
```

**Code Normal (lignes 654-677):**
```javascript
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: triggerEl,
        start: `top ${start}%`,
        end: `top ${end}%`,
        scrub: 0.3
    }
});

tl.to(chars, {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.02,  // Stagger temporel
    ease: "none",
    force3D: false
});
```

**Impact visuel**: L'effet "vague" est différent. En iframe, c'est un décalage basé sur la position de scroll. En normal, c'est un stagger temporel qui crée un délai entre chaque caractère.

### 2.2 Easings

| Mode | Easing utilisé |
|------|---------------|
| Iframe | `ease: "none"` (dans `viewportController`, ligne 194) |
| Normal | `ease: "none"` (dans tous les `tl.to()`) |

✅ **Identiques**

### 2.3 Interpolation (scrub)

Le `scrub` en mode normal crée un délai d'interpolation:
- `scrub: 0.3` pour TEXT_REVEAL
- `scrub: 0.5` pour les autres

En mode iframe, l'interpolation est directe via:
```javascript
gsap.to(target, {
    ...animatedValues,
    duration: 0.05,  // Très court
    ease: "none",
    overwrite: "auto"
});
```

**Impact**: Le mode iframe est plus "réactif" au scroll, le mode normal a un léger retard (smoothing).

### 2.4 Résumé des Différences Critiques

| # | Différence | Fichier | Lignes | Priorité |
|---|-----------|---------|--------|----------|
| 1 | **Stagger spatial vs temporel** | animationFactory.js | 111-198, 294-432, 577-678 | 🔴 Haute |
| 2 | **Scrub smoothing** | animationFactory.js | Toutes les branches `else` | 🟡 Moyenne |
| 3 | **Duration explicite** | animationFactory.js | Toutes les branches `else` | 🟢 Basse |
| 4 | **Interpolation 0.05s vs scrub** | iframeAnimations.js | 191-196 | 🟡 Moyenne |

---

## Phase 3 : Uniformisation

### 3.1 Options de Stratégie

#### Option A : Utiliser `ViewportAnimationController` en mode sans iframe ⭐ **RECOMMANDÉE**
Faire que le mode sans iframe utilise aussi `ViewportAnimationController` avec un fallback local.

**Avantages:**
- Code unifié, un seul chemin d'exécution
- Rendu identique garanti
- Le fallback existe déjà dans `iframeAnimations.js:247-263`

**Inconvénients:**
- Perd les optimisations de ScrollTrigger (throttling, lazy evaluation)
- requestAnimationFrame constant même quand pas nécessaire

**Modifications requises:**
| Fichier | Modification |
|---------|-------------|
| `animationFactory.js` | Supprimer toutes les branches `else` (mode normal) |
| `iframeAnimations.js` | Améliorer le fallback pour être aussi performant que ScrollTrigger |

---

#### Option B : Convertir le stagger temporel en stagger spatial (mode normal)
Modifier le mode sans iframe pour simuler le comportement du mode iframe avec ScrollTrigger.

**Avantages:**
- Garde les optimisations de ScrollTrigger
- Chaque mode reste optimisé pour son contexte

**Inconvénients:**
- Code dupliqué (deux implémentations à maintenir)
- Complexe à synchroniser parfaitement

**Modifications requises:**
| Fichier | Modification |
|---------|-------------|
| `animationFactory.js` | Créer des ScrollTriggers séparés par élément avec `start` décalé |

---

#### Option C : Utiliser ScrollTrigger avec Scroll Proxy dans les deux modes
Utiliser le `scrollProxy.js` existant pour synchroniser ScrollTrigger avec le parent iframe.

**Avantages:**
- ScrollTrigger dans les deux modes
- Optimisations GSAP préservées

**Inconvénients:**
- `scrollProxy.js` est marqué comme "legacy"
- Complexité de synchronisation

---

### 3.2 Stratégie Choisie
- [x] **Option A** : Utiliser `ViewportAnimationController` partout ✅
- [ ] **Option B** : Convertir stagger temporel → spatial
- [ ] **Option C** : ScrollTrigger + Scroll Proxy

### 3.3 Modifications à effectuer
| Fichier | Modification | Status |
|---------|-------------|--------|
| `animationFactory.js` | Supprimer la détection de mode `isInIframe` | ✅ |
| `animationFactory.js` | Supprimer toutes les branches `else` (ScrollTrigger) | ✅ |
| `animationFactory.js` | Garder uniquement le code `viewportController.add()` | ✅ |
| `animationFactory.js` | Supprimer l'import de `ScrollTrigger` | ✅ |
| `iframeAnimations.js` | Corriger le fallback avec timeout (5 tentatives max) | ✅ |

### 3.4 Plan d'implémentation détaillé

#### Étape 1 : Simplifier `animationFactory.js`
```javascript
// AVANT (exemple createStrokeAnimation)
if (this.mode === "iframe") {
    viewportController.add({ ... });
} else {
    const tl = gsap.timeline({ scrollTrigger: { ... } });
    tl.to(strokes, { ... });
}

// APRÈS
viewportController.add({ ... });
```

#### Étape 2 : Nettoyer les imports
```javascript
// SUPPRIMER
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// GARDER
import { gsap } from "gsap";
import { viewportController } from "./iframeAnimations.js";
```

#### Étape 3 : Supprimer la propriété `mode`
```javascript
// SUPPRIMER
this.mode = isInIframe ? "iframe" : "normal";
console.log(`AnimationFactory: ${sectionSelector} - Mode ${this.mode}`);

// SUPPRIMER
const isInIframe = (() => { ... })();
```

#### Étape 4 : Simplifier le retour
```javascript
// AVANT
return this.mode === "iframe" ? viewportController : this.triggers;

// APRÈS
return viewportController;
```

#### Méthodes à modifier
1. `createStrokeAnimation()` - lignes 84-199
2. `createDotAnimation()` - lignes 205-288
3. `createArcAnimation()` - lignes 294-368
4. `_createSingleArcAnimation()` - lignes 373-432
5. `createFadeScaleAnimation()` - lignes 438-523
6. `createFadeUpAnimation()` - lignes 528-570
7. `createTextRevealAnimation()` - lignes 618-679
8. `createFromConfig()` - ligne 712

---

## Phase 4 : Tests

### 4.1 Tests côte à côte
- [ ] Section 0 : rendu identique ?
- [ ] Section 1 : rendu identique ?
- [ ] Section 2 : rendu identique ?
- [ ] Text reveal : rendu identique ?
- [ ] Timing des animations : synchronisé ?

### 4.2 Tests de performance
- [ ] FPS en mode iframe
- [ ] FPS en mode sans iframe
- [ ] Consommation mémoire

### 4.3 Validation production
- [ ] Déploiement staging
- [ ] Test sur différents navigateurs
- [ ] Test sur mobile

---

## Journal des Modifications

| Date | Phase | Action | Résultat |
|------|-------|--------|----------|
| 2025-12-12 | Setup | Création du fichier de suivi | ✅ |
| 2025-12-12 | Phase 1 | Audit de `animationFactory.js` (727 lignes) | ✅ |
| 2025-12-12 | Phase 1 | Audit de `iframeAnimations.js` (339 lignes) | ✅ |
| 2025-12-12 | Phase 1 | Audit de `section0Animation.js` (208 lignes) | ✅ |
| 2025-12-12 | Phase 1 | Audit de `section1Animation.js` (84 lignes) | ✅ |
| 2025-12-12 | Phase 1 | Audit de `section2Animation.js` (95 lignes) | ✅ |
| 2025-12-12 | Phase 1 | Audit de `textReveal.js` (352 lignes) | ✅ |
| 2025-12-12 | Phase 2 | Documentation des différences critiques | ✅ |
| 2025-12-12 | Phase 3 | Proposition des 3 options de stratégie | ✅ |
| 2025-12-12 | Phase 3 | Choix de l'Option A | ✅ |
| 2025-12-12 | Phase 3 | Plan d'implémentation détaillé | ✅ |
| 2025-12-12 | Phase 3 | Suppression imports ScrollTrigger | ✅ |
| 2025-12-12 | Phase 3 | Simplification createStrokeAnimation | ✅ |
| 2025-12-12 | Phase 3 | Simplification createDotAnimation | ✅ |
| 2025-12-12 | Phase 3 | Simplification createArcAnimation | ✅ |
| 2025-12-12 | Phase 3 | Simplification _createSingleArcAnimation | ✅ |
| 2025-12-12 | Phase 3 | Simplification createFadeScaleAnimation | ✅ |
| 2025-12-12 | Phase 3 | Simplification createFadeUpAnimation | ✅ |
| 2025-12-12 | Phase 3 | Simplification createTextRevealAnimation | ✅ |
| 2025-12-12 | Phase 3 | Simplification createFromConfig | ✅ |
| 2025-12-12 | Phase 3 | Correction fallback iframeAnimations.js | ✅ |
| 2025-12-12 | Phase 4 | Build webpack réussi | ✅ |
| 2025-12-12 | Phase 4 | Fix calcul progress mode standalone (scrollTop: 0) | ✅ |
| 2025-12-12 | Phase 4 | Test mode sans iframe - validé | ✅ |
| | | | |

---

## Ressources

- Documentation GSAP ScrollTrigger : https://greensock.com/docs/v3/Plugins/ScrollTrigger
- iframe-resizer : https://github.com/davidjbradshaw/iframe-resizer
- Fichier optimisations existant : `ANIMATION_OPTIMIZATIONS.md`
