(function () {
    "use strict";

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

    function init() {

        console.log(
            "[Tube Empire] Starting..."
        );

        TelegramAPI.init();

        loadGame();

        setupGlobalEvents();

        console.log(
            "[Tube Empire] Ready"
        );
    }

    function loadGame() {

        const saved =
            GameStorage.load();

        if (saved) {

            GameState.replaceState(
                saved
            );

        } else {

            const state =
                GameState.getState();

            if (TelegramAPI.user) {

                state.player.id =
                    TelegramAPI.user.id;

                state.player.name =
                    TelegramAPI.firstName ||
                    "Player";

                state.player.username =
                    TelegramAPI.username ||
                    "";
            }

            GameStorage.save(state);
        }
    }

    function setupGlobalEvents() {

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.visibilityState ===
                    "hidden"
                ) {

                    GameStorage.save(
                        GameState.getState()
                    );
                }
            }
        );

        window.addEventListener(
            "beforeunload",
            () => {

                GameStorage.save(
                    GameState.getState()
                );
            }
        );
    }

})();
