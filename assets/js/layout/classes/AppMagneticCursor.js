export default class AppMagneticCursor {
  constructor(options = {}) {
    const defaultOptions = {
      cursorElement: null,
      magneticSelector: ".magnetic",
      strength: 0.2,
      friction: 0.1,  // Contrôle la fluidité du mouvement
    };
    this.options = { ...defaultOptions, ...options };

    this.cursor = this.options.cursorElement || this.createDefaultCursor();
    this.magneticElements = document.querySelectorAll(this.options.magneticSelector);
    this.cursorPos = { x: 0, y: 0 };
    this.targetPos = { x: 0, y: 0 };
    this.hoveringMagneticElement = null; // Suivre l'élément magnétique sous le curseur

    // Attendre que le curseur soit ajouté au DOM pour initialiser ses dimensions
    this.cursorWidth = 0;
    this.cursorHeight = 0;
    this.updateCursorDimensions();

    this.bindEvents();
    this.animateCursor();
  }

  createDefaultCursor() {
    const cursor = document.createElement("div");
    cursor.style.position = "fixed";
    cursor.style.width = "15px";
    cursor.style.height = "15px";
    cursor.style.borderRadius = "50%";
    cursor.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    cursor.style.pointerEvents = "none";
    cursor.style.zIndex = "9999";
    cursor.style.transition = "opacity 0.3s"; // Transition de disparition / apparition
    document.body.appendChild(cursor);
    return cursor;
  }

  updateCursorDimensions() {
    // Mettre à jour les dimensions après que l'élément soit dans le DOM
    requestAnimationFrame(() => {
      this.cursorWidth = this.cursor.offsetWidth;
      this.cursorHeight = this.cursor.offsetHeight;
    });
  }

  bindEvents() {
    document.addEventListener("mousemove", (e) => {
      this.targetPos.x = e.clientX;
      this.targetPos.y = e.clientY;

      // Détecter si le curseur est au-dessus d'un élément magnétique
      this.hoveringMagneticElement = null; // Réinitialiser
      this.magneticElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          this.hoveringMagneticElement = el;
        }
      });

      // Appliquer l'effet magnétique aux éléments
      this.magneticElements.forEach((el) => this.applyMagneticEffect(el, e));
    });
  }

  applyMagneticEffect(element, mouseEvent) {
    const rect = element.getBoundingClientRect();
    const elCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const delta = {
      x: mouseEvent.clientX - elCenter.x,
      y: mouseEvent.clientY - elCenter.y,
    };

    const distance = Math.sqrt(delta.x ** 2 + delta.y ** 2);

    if (distance < 150) {
      const force = (1 - distance / 150) * this.options.strength;
      const offsetX = delta.x * force;
      const offsetY = delta.y * force;

      element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    } else {
      element.style.transform = "";
    }
  }

  animateCursor() {
    const updateCursor = () => {
      // Interpolation pour le mouvement fluide vers la position de la souris
      this.cursorPos.x += (this.targetPos.x - this.cursorPos.x) * this.options.friction;
      this.cursorPos.y += (this.targetPos.y - this.cursorPos.y) * this.options.friction;

      // Si le curseur est au-dessus d'un élément magnétique, se déplacer au centre de l'élément
      if (this.hoveringMagneticElement) {
        const rect = this.hoveringMagneticElement.getBoundingClientRect();
        const elementCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        // Interpolation fluide vers le centre de l'élément magnétique
        this.cursorPos.x += (elementCenter.x - this.cursorPos.x) * 0.4; // Plus de fluidité (ajustez ce facteur)
        this.cursorPos.y += (elementCenter.y - this.cursorPos.y) * 0.4;
      }

      // Appliquer la transformation CSS pour déplacer le curseur
      this.cursor.style.transform = `translate(${this.cursorPos.x - this.cursorWidth / 2}px, ${this.cursorPos.y - this.cursorHeight / 2}px)`;

      // Vérifier si le curseur est hors des limites de l'écran
      if (this.cursorPos.x < this.cursorWidth / 4 || this.cursorPos.x > window.innerWidth - this.cursorWidth / 4 || this.cursorPos.y < this.cursorHeight / 4 || this.cursorPos.y > window.innerHeight - this.cursorHeight / 4) {
        // Cacher le curseur si hors de l'écran
        this.cursor.style.opacity = "0";
      } else {
        // Réafficher le curseur si dans les limites de l'écran
        this.cursor.style.opacity = "1";
      }

      requestAnimationFrame(updateCursor);
    };
    updateCursor();
  }
}
