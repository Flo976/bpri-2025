export default class BodyManager {
    constructor() {
        // Initialiser
        this.init();
    }

    init() {
        this.setCssVar();
        this.handleScrollWindow();
        this.handleResize();
        this.checkToggleHasScrolled();
    }

    handleScrollWindow() {
        window.addEventListener("scroll", (e) => {
            this.checkToggleHasScrolled();
        });
    }

    checkToggleHasScrolled() {
        if (window.scrollY >= 10) {
            document.body.classList.add("has_scrolled");
        } else {
            document.body.classList.remove("has_scrolled");
        }
    }

    handleResize() {
        window.addEventListener("resize", (e) => {
            this.setCssVar();
            this.checkToggleHasScrolled();
        });
    }

    isMobile() {
        return window.innerWidth <= 991;
    }

    calcVhInPx(percent) {
        const screenHeight = window.innerHeight;
        const valPixel = (percent * screenHeight) / 100;
        return `${valPixel}px`;
    }

    calcVwInPx(percent) {
        const screenWidth = window.innerWidth;
        const valPixel = (percent * screenWidth) / 100;
        return `${valPixel}px`;
    }

    calcDiffMaskSection() {
        var result = 0;
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1728) {
            result = (screenWidth - 1728) * 0.048;
        }
        return `${result}px`;
    }

    setCssVar() {
        $(":root").css("--100vh", this.calcVhInPx(100));
        $(":root").css("--100vw", this.calcVwInPx(100));
        //$(":root").css("--diff-mask-section", this.calcDiffMaskSection());
        //$(":root").css("--64vh", calcVhInPx(64));

        // height by width
        const heightByWidth = this.getHeightByWidth(window.innerWidth);
        $(":root").css("--height-by-width", `${heightByWidth}px`);
    }

    getHeightByWidth(width) {
        // Définition des intervalles pour les écrans de bureau
        const desktopResolutions = [
            { min: 1024, max: 1280, height: 768 },
            { min: 1280, max: 1360, height: 1024 },
            { min: 1360, max: 1440, height: 768 },
            { min: 1440, max: 1600, height: 900 },
            { min: 1600, max: 1680, height: 900 },
            { min: 1680, max: 1920, height: 1050 },
            { min: 1920, max: 2560, height: 1080 },
            { min: 2560, max: 3840, height: 1440 },
            { min: 3840, max: 5120, height: 2160 },
            { min: 5120, max: Infinity, height: 2880 },
        ];

        // Définition des intervalles pour les tablettes
        const tabletResolutions = [
            { min: 768, max: 800, height: 1024 },
            { min: 800, max: 1200, height: 1280 },
            { min: 1200, max: 1536, height: 1920 },
            { min: 1536, max: Infinity, height: 2048 },
        ];

        // Définition des intervalles pour les mobiles
        const mobileResolutions = [
            { min: 320, max: 375, height: 568 },
            { min: 375, max: 390, height: 667 },
            { min: 390, max: 414, height: 844 },
            { min: 414, max: 428, height: 736 },
            { min: 428, max: 360, height: 926 },
            { min: 360, max: Infinity, height: 800 },
        ];

        // Fonction utilitaire pour vérifier les intervalles
        const getResolutionByWidth = (width, resolutions) => {
            for (let res of resolutions) {
                if (width >= res.min && width < res.max) {
                    return res.height;
                }
            }
            return null; // Aucune correspondance trouvée
        };

        // Vérifier dans les résolutions desktop, tablette et mobile
        let height = getResolutionByWidth(width, desktopResolutions) ||
            getResolutionByWidth(width, tabletResolutions) ||
            getResolutionByWidth(width, mobileResolutions);

        // Si aucune correspondance trouvée, utiliser des ratios par défaut
        if (!height) {
            if (width >= 1440) {
                height = (width * 9) / 16; // 16:9 pour grands écrans
            } else if (width >= 800) {
                height = (width * 3) / 4; // 4:3 pour les tablettes
            } else {
                height = (width * 3) / 4; // Rapport par défaut pour petits écrans
            }
        }

        // Obtenir la hauteur visible de la fenêtre
        const visibleHeight = window.innerHeight;

        // S'assurer que la hauteur calculée ne dépasse pas la hauteur visible
        height = Math.min(height, visibleHeight);

        return Math.round(height); // Retourne la hauteur arrondie
    }

}