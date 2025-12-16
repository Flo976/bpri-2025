# Optimisation des Performances Mobile - Animations

## Objectif
Améliorer la fluidité des animations sur mobile en réduisant la charge CPU/GPU du système d'animation `ViewportAnimationController`.

---

## Analyse du Problème

### Contexte
Les animations définies dans `animationFactory.js` sont lourdes et saccadées sur mobile, alors qu'elles fonctionnent correctement sur desktop.

### Cause Racine : Trop d'animations individuelles

**TEXT_REVEAL crée 1 animation par caractère :**

| Section | Élément | Chars estimés | Animations |
|---------|---------|---------------|------------|
| Section 1 | `.title` | ~20 | 20 |
| Section 1 | `.description` | ~100 | 100 |
| Section 1 | `.user_name` | ~15 | 15 |
| Section 1 | `.user_job` | ~20 | 20 |
| Section 2 | `.title` | ~20 | 20 |
| Section 2 | `.description` | ~100 | 100 |
| Section 2 | `.media_title` x3 | ~45 | 45 |
| Section 2 | `.media_description` x3 | ~150 | 150 |
| **Total TEXT_REVEAL** | | | **~470** |
| Autres (STROKE, DOT, ARC, FADE) | | | ~30-50 |
| **TOTAL ESTIMÉ** | | | **~500+ animations** |

À **60fps**, cela signifie **~30,000 calculs/seconde** !

---

## Problèmes Identifiés

### 1. Boucle rAF constante (Priorité: HAUTE)
**Fichier:** `iframeAnimations.js:265-276`

```javascript
const loop = () => {
    self.updateWithParentInfo({ ... });
    self.rafId = requestAnimationFrame(loop);  // Tourne à 60fps TOUJOURS
};
```

**Impact:** CPU utilisé même sans scroll.

---

### 2. gsap.to() à chaque frame (Priorité: HAUTE)
**Fichier:** `iframeAnimations.js:191-196`

```javascript
gsap.to(target, {
    ...animatedValues,
    duration: 0.05,
    ease: "none",
    overwrite: "auto"
});
```

**Impact:** Création de tweens GSAP à chaque frame pour chaque animation modifiée.

---

### 3. Calcul pour TOUTES les animations (Priorité: MOYENNE)
**Fichier:** `iframeAnimations.js:144-199`

```javascript
this.animations.forEach(anim => {
    const progress = this.calculateProgress(anim.trigger, anim.start, anim.end);
    // ... calculs même pour animations terminées
});
```

**Impact:** Les animations avec `progress=1` continuent d'être calculées.

---

### 4. Une animation par caractère (Priorité: HAUTE)
**Fichier:** `animationFactory.js:384-404`

```javascript
chars.forEach((char, index) => {
    viewportController.add({
        trigger: triggerEl,
        targets: char,
        // ... une animation par caractère
    });
});
```

**Impact:** 100 caractères = 100 animations = 100 calculs par frame.

---

### 5. Seuil de changement trop sensible (Priorité: BASSE)
**Fichier:** `iframeAnimations.js:164`

```javascript
if (Math.abs(progress - anim.lastProgress) > 0.001) {  // 0.1% de changement
```

**Impact:** Updates trop fréquents pour des changements imperceptibles.

---

### 6. Pas de détection mobile (Priorité: HAUTE)
**Fichiers:** Tous

**Impact:** Même traitement intensif sur mobile que sur desktop.

---

## Solutions Proposées

### Solution 1: Throttle rAF sur mobile (30fps)
- [ ] Détecter si mobile (`window.innerWidth < 768` ou `navigator.userAgent`)
- [ ] Utiliser un compteur pour skip 1 frame sur 2 sur mobile
- [ ] Résultat: 30fps au lieu de 60fps = -50% de calculs

**Complexité:** Faible

---

### Solution 2: Désactiver/Simplifier TEXT_REVEAL sur mobile
- [ ] Option A: Désactiver complètement TEXT_REVEAL sur mobile
- [ ] Option B: Animer le bloc entier au lieu de chaque caractère
- [ ] Résultat: -470 animations = -94% de calculs pour les textes

**Complexité:** Faible

---

### Solution 3: Remplacer gsap.to() par gsap.set()
- [ ] Utiliser `gsap.set()` pour appliquer les valeurs instantanément
- [ ] Supprimer la création de tweens intermédiaires
- [ ] Résultat: Moins d'overhead GSAP

**Complexité:** Faible

---

### Solution 4: Nettoyer les animations terminées
- [ ] Retirer les animations avec `progress === 1` et `hasLeft === true`
- [ ] Ou les marquer comme "completed" et les ignorer
- [ ] Résultat: Moins d'animations à parcourir au fil du scroll

**Complexité:** Moyenne

---

### Solution 5: Augmenter le seuil de changement
- [ ] Passer de `0.001` à `0.01` (1% au lieu de 0.1%)
- [ ] Résultat: Moins d'updates pour des micro-changements

**Complexité:** Faible

---

### Solution 6: Pause rAF quand pas de scroll
- [ ] Détecter l'inactivité de scroll (pas de changement de `scrollTop`)
- [ ] Pauser la boucle après X frames sans changement
- [ ] Reprendre au prochain scroll event
- [ ] Résultat: 0% CPU quand l'utilisateur ne scroll pas

**Complexité:** Moyenne

---

## Plan d'Implémentation

### Phase 1: Quick Wins (Impact immédiat) ✅
| # | Tâche | Fichier | Status |
|---|-------|---------|--------|
| 1.1 | Throttle 30fps sur mobile | `iframeAnimations.js` | ✅ |
| 1.2 | Simplifier TEXT_REVEAL sur mobile (bloc entier) | `animationFactory.js` | ✅ |
| 1.3 | Augmenter seuil à 0.01 sur mobile | `iframeAnimations.js` | ✅ |

### Phase 2: Optimisations Moyennes
| # | Tâche | Fichier | Status |
|---|-------|---------|--------|
| 2.1 | Remplacer gsap.to() par gsap.set() | `iframeAnimations.js` | ⏳ |
| 2.2 | Nettoyer animations terminées | `iframeAnimations.js` | ⏳ |

### Phase 3: Optimisations Avancées
| # | Tâche | Fichier | Status |
|---|-------|---------|--------|
| 3.1 | Pause rAF sans scroll | `iframeAnimations.js` | ⏳ |
| 3.2 | Batch updates avec requestIdleCallback | `iframeAnimations.js` | ⏳ |

---

## Métriques de Succès

| Métrique | Avant | Objectif |
|----------|-------|----------|
| Animations actives | ~500 | < 50 sur mobile |
| FPS mobile | ~15-30 | 60 stable |
| CPU idle (sans scroll) | ~10-20% | < 1% |
| Calculs/seconde | ~30,000 | < 3,000 |

---

## Journal des Modifications

| Date | Phase | Action | Résultat |
|------|-------|--------|----------|
| 2025-12-12 | Analyse | Identification des problèmes | ✅ |
| 2025-12-12 | Analyse | Création du fichier de suivi | ✅ |
| 2025-12-12 | Phase 1 | Throttle 30fps mobile (iframeAnimations.js) | ✅ |
| 2025-12-12 | Phase 1 | Seuil 0.01 sur mobile (iframeAnimations.js) | ✅ |
| 2025-12-12 | Phase 1 | TEXT_REVEAL simplifié mobile (animationFactory.js) | ✅ |
| 2025-12-12 | Phase 1 | Build webpack validé | ✅ |
| | | | |

---

## Fichiers Concernés

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `assets/js/pages/landing/functions/animations/iframeAnimations.js` | ~340 | Boucle rAF, calcul progress |
| `assets/js/pages/landing/functions/animations/animationFactory.js` | ~480 | Création des animations |
| `assets/js/pages/landing/functions/animations/textReveal.js` | ~350 | Split texte en caractères |
| `assets/js/pages/landing/functions/animations/section1Animation.js` | ~84 | Config Section 1 |
| `assets/js/pages/landing/functions/animations/section2Animation.js` | ~95 | Config Section 2 |

---

## Ressources

- GSAP Performance Tips: https://greensock.com/docs/v3/GSAP/gsap.set()
- requestAnimationFrame throttling: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- CSS will-change: https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
