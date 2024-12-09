import { main as mainLanding } from "../../pages/landing/main.js";
import { main as mainExample } from "../../pages/example/main.js";

export default class PageManager {
    constructor() {
        // page loading
        this.page_loading = document.querySelector('.page_loading');

        // Stocke les références aux éléments <main>
        this.contents = {
            landing: document.querySelector('.landing_main'),
            example: document.querySelector('.example_main'),
        };

        // Initialise les contenus en les cachant toutes sauf une si nécessaire
        this.currentSection = 'landing';

        // Charger dynamiquement le contenu si nécessaire
        this.contentUrls = {
            landing: 'templates/landing.html',
            example: 'templates/example.html',
        };

        mainLanding();
    }

    // Méthode pour afficher une section spécifique
    async showContent(sectionName) {
        // Si la section demandée n'existe pas ou est déjà affichée, arrête la fonction
        if (!this.contents[sectionName] || this.currentSection === sectionName) {
            if (!this.contents[sectionName]) {
                console.error(`La section ${sectionName} n'existe pas.`);
            }
            return;
        }

        // Afficher le loading
        this.loading(true);

        // Vérifie si le contenu de la section doit être chargé dynamiquement
        const sectionElement = this.contents[sectionName];
        if (!sectionElement.hasAttribute('data-loaded')) {
            await this.loadContent(sectionName);
            sectionElement.setAttribute('data-loaded', 'true');
        }

        // Cache la section actuellement affichée
        if (this.currentSection) {
            this.contents[this.currentSection].classList.add('d-none');
        }

        // Affiche la section demandée
        sectionElement.classList.remove('d-none');
        this.currentSection = sectionName;

        // cacher le loading
        this.loading(false);
    }

    // Méthode pour charger dynamiquement le contenu d'une section
    async loadContent(sectionName) {
        try {
            const response = await fetch(this.contentUrls[sectionName]);
            if (!response.ok) {
                throw new Error(`Erreur de chargement du contenu pour la section ${sectionName}.`);
            }

            const html = await response.text();
            this.contents[sectionName].innerHTML = html;

            this.onLoadedContent(sectionName);
        } catch (error) {
            console.error(`Impossible de charger le contenu de la section ${sectionName}:`, error);
        }
    }

    // Méthode appelée après le chargement du contenu d'une section
    onLoadedContent(sectionName) {
        switch (sectionName) {
            case 'landing':
                console.log("Landing loaded.");
                break;
                break;
            case 'example':
                console.log("Example loaded.");
                mainExample();
                break;
            default:
                console.warn(`Aucune action définie pour la section ${sectionName}.`);
                break;
        }
    }

    // gestion loading
    loading(state = false) {
        if (state) {
            this.page_loading?.classList.remove('d-none');
        } else {
            this.page_loading?.classList.add('d-none');
        }
    }
}
