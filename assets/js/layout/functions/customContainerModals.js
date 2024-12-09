export  default function customContainerModals() {
    // Écoute l'événement 'show.bs.modal' de toutes les modals
    $(document).on("show.bs.modal", function (e) {
        // Appeler la méthode d'origine pour que le modal s'affiche
        var $modal = $(e.target);

        // Déplacer le modal dans le conteneur spécifique
        // $("#modals_wrapper .modals").append($modal);

        // Après que le modal soit affiché, déplacer le backdrop
        $modal.on("shown.bs.modal", function () {
            // Déplacer le backdrop dans le conteneur spécifique
            $(".modal-backdrop").appendTo("#modals_wrapper");
            $("#modals_wrapper").attr("data-modal", $modal.attr('id'));
            window.scrollbarModals?.update();
        });
    });

    // Écoute l'événement 'hidden.bs.modal' pour retirer le backdrop
    $(document).on("hidden.bs.modal", function () {
        // Retirer le backdrop lorsque le modal est fermé
        $(".modal-backdrop").remove();
        $("#modals_wrapper").attr("data-modal", "");
    });
}