export default class ContentLandingManager {
    constructor() {
        this.showContentLanding2Btns = document.querySelectorAll(`[data-action="show-content-landing2"]`);
        this.showContentGameBtns = document.querySelectorAll(`[data-action="show-content-game"]`);

        // Initialiser
        this.init();
    }

    init() {
        this.handleClickBtns();
    }

    handleClickBtns() {
        this.showContentGameBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Afficher le contenu "game"
                window.pageManager.showContent('game');
            });
        });
        this.showContentLanding2Btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Afficher le contenu "game"
                window.pageManager.showContent('landing2');
            });
        });
    };
}