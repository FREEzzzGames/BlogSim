(function () {
    "use strict";

    const STORAGE_KEY = "tube_empire_state_v1";

    const Storage = {

        load() {

            try {

                const raw =
                    localStorage.getItem(STORAGE_KEY);

                if (!raw) {
                    return null;
                }

                const parsed = JSON.parse(raw);

                if (
                    !parsed ||
                    typeof parsed !== "object"
                ) {
                    return null;
                }

                return parsed;

            } catch (error) {

                console.error(
                    "[Storage] load error:",
                    error
                );

                return null;
            }
        },

        save(state) {

            try {

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(state)
                );

                return true;

            } catch (error) {

                console.error(
                    "[Storage] save error:",
                    error
                );

                return false;
            }
        },

        clear() {

            try {

                localStorage.removeItem(STORAGE_KEY);

                return true;

            } catch (error) {

                console.error(
                    "[Storage] clear error:",
                    error
                );

                return false;
            }
        }
    };

    window.GameStorage = Storage;

})();
