import { gsap } from "gsap";

/**
 * Utilitaire pour révéler du texte avec effet translate3d + opacity
 * Compatible avec background-clip: text (gradient)
 *
 * Approches disponibles:
 * - Ligne par ligne : wrap chaque ligne dans un container overflow:hidden
 * - Mot par mot : wrap chaque mot
 * - Lettre par lettre : chaque lettre avec gradient aligné
 */

/**
 * Prépare un élément texte pour l'animation ligne par ligne
 * Compatible avec background-clip: text
 * @param {HTMLElement} element - L'élément contenant le texte
 * @returns {HTMLElement[]} - Array des éléments de ligne créés
 */
export function splitTextIntoLines(element) {
    if (!element) return [];

    const lines = [];
    const html = element.innerHTML;

    // Séparer par <br> ou <br />
    const lineParts = html.split(/<br\s*\/?>/gi);

    // Créer le nouveau contenu
    element.innerHTML = "";

    lineParts.forEach((part, index) => {
        const trimmedPart = part.trim();
        if (trimmedPart === "") return;

        // Créer le wrapper avec overflow hidden
        const lineWrapper = document.createElement("span");
        lineWrapper.className = "text-reveal-line-wrapper";
        lineWrapper.style.display = "block";
        lineWrapper.style.overflow = "hidden";

        // Créer l'élément de ligne avec le contenu
        const lineContent = document.createElement("span");
        lineContent.className = "text-reveal-line";
        lineContent.style.display = "block";
        lineContent.style.transform = "translate3d(0, 100%, 0)";
        lineContent.style.opacity = "0";
        lineContent.innerHTML = trimmedPart;

        // Copier les styles de gradient du parent
        const computedStyle = window.getComputedStyle(element);
        lineContent.style.background = computedStyle.background;
        lineContent.style.backgroundClip = "text";
        lineContent.style.webkitBackgroundClip = "text";
        lineContent.style.webkitTextFillColor = "transparent";
        lineContent.style.textFillColor = "transparent";

        lineWrapper.appendChild(lineContent);
        element.appendChild(lineWrapper);

        lines.push(lineContent);
    });

    return lines;
}

/**
 * Prépare un élément texte pour l'animation mot par mot
 * Compatible avec background-clip: text
 *
 * OPTIMISATION: Structure réduite de 3 à 2 niveaux DOM:
 * - Avant: line-container > word-wrapper > word
 * - Après: word-wrapper > word (+ <br> pour les lignes)
 *
 * @param {HTMLElement} element - L'élément contenant le texte
 * @returns {HTMLElement[]} - Array des éléments de mot créés
 */
export function splitTextIntoWords(element) {
    if (!element) return [];

    const words = [];
    const html = element.innerHTML;

    // Récupérer le style de gradient du parent
    const computedStyle = window.getComputedStyle(element);
    const background = computedStyle.background;

    // Créer le nouveau contenu
    element.innerHTML = "";

    // Séparer par <br> d'abord
    const lineParts = html.split(/<br\s*\/?>/gi);

    lineParts.forEach((part, lineIndex) => {
        const trimmedPart = part.trim();
        if (trimmedPart === "") return;

        // OPTIMISATION: Ajouter <br> entre les lignes au lieu de créer un conteneur
        if (lineIndex > 0) {
            element.appendChild(document.createElement("br"));
        }

        // Séparer en mots (en gardant les espaces)
        const wordParts = trimmedPart.split(/(\s+)/);

        wordParts.forEach((wordText) => {
            if (wordText === "") return;

            // Créer le wrapper avec overflow hidden
            const wordWrapper = document.createElement("span");
            wordWrapper.className = "text-reveal-word-wrapper";
            wordWrapper.style.display = "inline-block";
            wordWrapper.style.overflow = "hidden";
            wordWrapper.style.verticalAlign = "top";

            // Créer l'élément de mot
            const wordContent = document.createElement("span");
            wordContent.className = "text-reveal-word";
            wordContent.style.display = "inline-block";
            wordContent.style.transform = "translate3d(0, 100%, 0)";
            wordContent.style.opacity = "0";

            // Gérer les espaces
            if (/^\s+$/.test(wordText)) {
                wordContent.innerHTML = "&nbsp;";
            } else {
                wordContent.innerHTML = wordText;
                // Appliquer le gradient uniquement aux vrais mots
                wordContent.style.background = background;
                wordContent.style.backgroundClip = "text";
                wordContent.style.webkitBackgroundClip = "text";
                wordContent.style.webkitTextFillColor = "transparent";
                wordContent.style.textFillColor = "transparent";
            }

            wordWrapper.appendChild(wordContent);
            element.appendChild(wordWrapper);

            if (!/^\s+$/.test(wordText)) {
                words.push(wordContent);
            }
        });
    });

    return words;
}

/**
 * Anime les lignes/mots avec un effet de reveal
 * @param {HTMLElement[]} elements - Array des éléments à animer
 * @param {Object} options - Options d'animation
 * @returns {gsap.core.Tween} - L'animation GSAP
 */
export function animateTextElements(elements, options = {}) {
    const {
        duration = 0.8,
        stagger = 0.1,
        y = "100%",
        ease = "power3.out",
        delay = 0
    } = options;

    return gsap.to(elements, {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        ease,
        delay
    });
}

/**
 * Prépare et anime un élément texte (ligne par ligne)
 * @param {HTMLElement} element - L'élément à animer
 * @param {Object} options - Options d'animation
 * @returns {{ lines: HTMLElement[], animation: gsap.core.Tween }}
 */
export function revealTextByLines(element, options = {}) {
    const lines = splitTextIntoLines(element);
    const animation = animateTextElements(lines, options);
    return { lines, animation };
}

/**
 * Prépare et anime un élément texte (mot par mot)
 * @param {HTMLElement} element - L'élément à animer
 * @param {Object} options - Options d'animation
 * @returns {{ words: HTMLElement[], animation: gsap.core.Tween }}
 */
export function revealTextByWords(element, options = {}) {
    const words = splitTextIntoWords(element);
    const animation = animateTextElements(words, {
        duration: 0.6,
        stagger: 0.03,
        ...options
    });
    return { words, animation };
}

/**
 * Prépare un élément texte pour l'animation lettre par lettre
 * Compatible avec background-clip: text (gradient aligné)
 * Les caractères sont groupés par mot pour éviter les sauts de ligne au milieu des mots
 *
 * OPTIMISATION: Structure réduite de 4 à 3 niveaux DOM:
 * - Avant: line-container > word-container > char-wrapper > char
 * - Après: word-container > char-wrapper > char (+ <br> pour les lignes)
 *
 * @param {HTMLElement} element - L'élément contenant le texte
 * @returns {HTMLElement[]} - Array des éléments de lettre créés
 */
export function splitTextIntoChars(element) {
    if (!element) return [];

    const chars = [];
    const html = element.innerHTML;

    // Récupérer les styles du parent
    const computedStyle = window.getComputedStyle(element);
    const background = computedStyle.background;
    const backgroundImage = computedStyle.backgroundImage;

    // Mesurer la largeur totale du texte original
    const originalWidth = element.offsetWidth;

    // Créer le nouveau contenu
    element.innerHTML = "";

    // Séparer par <br> d'abord
    const lineParts = html.split(/<br\s*\/?>/gi);

    lineParts.forEach((part, lineIndex) => {
        const trimmedPart = part.trim();
        if (trimmedPart === "") return;

        // OPTIMISATION: Ajouter <br> entre les lignes au lieu de créer un conteneur de ligne
        if (lineIndex > 0) {
            element.appendChild(document.createElement("br"));
        }

        // Retirer les tags HTML pour obtenir le texte pur
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = trimmedPart;
        const plainText = tempDiv.textContent || tempDiv.innerText;

        // Séparer en mots (en gardant les espaces comme séparateurs)
        const words = plainText.split(/(\s+)/);

        words.forEach((word) => {
            if (word === "") return;

            // Si c'est un espace, créer un simple espace
            if (/^\s+$/.test(word)) {
                const spaceWrapper = document.createElement("span");
                spaceWrapper.className = "text-reveal-space";
                spaceWrapper.innerHTML = "&nbsp;";
                spaceWrapper.style.display = "inline-block";
                spaceWrapper.style.width = "0.3em";
                element.appendChild(spaceWrapper);
                return;
            }

            // Créer un conteneur de mot avec white-space: nowrap
            // pour empêcher les sauts de ligne au milieu du mot
            const wordContainer = document.createElement("span");
            wordContainer.className = "text-reveal-word-container";
            wordContainer.style.display = "inline-block";
            wordContainer.style.whiteSpace = "nowrap";

            // Traiter chaque caractère du mot
            for (let i = 0; i < word.length; i++) {
                const char = word[i];

                // Créer le wrapper avec overflow hidden (nécessaire pour l'effet reveal)
                const charWrapper = document.createElement("span");
                charWrapper.className = "text-reveal-char-wrapper";
                charWrapper.style.display = "inline-block";
                charWrapper.style.overflow = "hidden";
                charWrapper.style.verticalAlign = "top";

                // Créer l'élément de caractère
                const charContent = document.createElement("span");
                charContent.className = "text-reveal-char";
                charContent.style.display = "inline-block";
                charContent.style.transform = "translate3d(0, 100%, 0)";
                charContent.style.opacity = "0";
                charContent.style.willChange = "transform, opacity"; // GPU acceleration

                charContent.textContent = char;
                // Appliquer le gradient
                charContent.style.background = background;
                charContent.style.backgroundImage = backgroundImage;
                charContent.style.backgroundSize = `${originalWidth}px 100%`;
                charContent.style.backgroundClip = "text";
                charContent.style.webkitBackgroundClip = "text";
                charContent.style.webkitTextFillColor = "transparent";
                charContent.style.textFillColor = "transparent";

                charWrapper.appendChild(charContent);
                wordContainer.appendChild(charWrapper);

                chars.push(charContent);
            }

            element.appendChild(wordContainer);
        });
    });

    // Après le rendu, calculer et ajuster la position du gradient pour chaque caractère
    // OPTIMISATION: parentRect calculé UNE SEULE FOIS hors de la boucle
    requestAnimationFrame(() => {
        const parentRect = element.getBoundingClientRect();
        chars.forEach((charEl) => {
            if (charEl.textContent.trim() !== "") {
                const rect = charEl.getBoundingClientRect();
                charEl.style.backgroundPosition = `-${rect.left - parentRect.left}px 0`;
            }
        });
    });

    return chars;
}

/**
 * Anime les caractères avec un effet de reveal lettre par lettre
 * @param {HTMLElement[]} chars - Array des spans de caractères
 * @param {Object} options - Options d'animation
 * @returns {gsap.core.Tween} - L'animation GSAP
 */
export function animateChars(chars, options = {}) {
    const {
        duration = 0.5,
        stagger = 0.02,
        ease = "power3.out",
        delay = 0
    } = options;

    return gsap.to(chars, {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        ease,
        delay
    });
}

// ============================================
// Aliases pour compatibilité
// ============================================
export const prepareTextReveal = splitTextIntoChars;
