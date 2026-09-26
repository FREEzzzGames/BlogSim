(function () {
    "use strict";

    let running = false;
    let animationFrame = null;

    let lastFrameTime = 0;
    let saveTimer = 0;

    const SAVE_INTERVAL = 5000;

    const Game = {

        start() {

            if (running) {
                return;
            }

            running = true;

            lastFrameTime =
                performance.now();

            saveTimer = 0;

            console.log(
                "[Game] Started"
            );

            animationFrame =
                requestAnimationFrame(
                    loop
                );
        },


        stop() {

            if (!running) {
                return;
            }

            running = false;

            if (
                animationFrame !== null
            ) {

                cancelAnimationFrame(
                    animationFrame
                );

                animationFrame = null;
            }

            saveGame();

            console.log(
                "[Game] Stopped"
            );
        },


        isRunning() {

            return running;

        }

    };


    function loop(currentTime) {

        if (!running) {
            return;
        }


        let delta =
            (
                currentTime -
                lastFrameTime
            ) / 1000;


        lastFrameTime =
            currentTime;


        if (delta < 0) {
            delta = 0;
        }


        if (delta > 0.25) {
            delta = 0.25;
        }


        update(delta);

        render();


        animationFrame =
            requestAnimationFrame(
                loop
            );

    }


    function update(delta) {

        GameEconomy.update(
            Date.now()
        );


        saveTimer += delta;


        if (
            saveTimer >=
            SAVE_INTERVAL / 1000
        ) {

            saveTimer = 0;

            saveGame();

        }

    }


    function render() {

        document.dispatchEvent(
            new CustomEvent(
                "game:render"
            )
        );

    }


    function saveGame() {

        const state =
            GameState.getState();


        GameStorage.save(
            state
        );

    }


    window.addEventListener(
        "beforeunload",
        saveGame
    );


    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "hidden"
            ) {

                saveGame();

            }

        }
    );


    window.Game =
        Game;

})();
