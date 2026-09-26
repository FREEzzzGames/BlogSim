(function () {
    "use strict";

    const tg = window.Telegram?.WebApp || null;

    const TelegramAPI = {

        available: !!tg,

        init() {

            if (!tg) {
                console.warn("[Telegram] WebApp API unavailable");
                return false;
            }

            try {
                tg.ready();
                tg.expand();

                if (tg.disableVerticalSwipes) {
                    tg.disableVerticalSwipes();
                }

                console.log(
                    "[Telegram] initialized",
                    tg.version,
                    tg.platform
                );

                return true;

            } catch (error) {

                console.error(
                    "[Telegram] initialization error:",
                    error
                );

                return false;
            }
        },

        get user() {

            return tg?.initDataUnsafe?.user || null;
        },

        get userId() {

            return this.user?.id || null;
        },

        get username() {

            return this.user?.username || null;
        },

        get firstName() {

            return this.user?.first_name || "";
        },

        get languageCode() {

            return this.user?.language_code || "en";
        },

        get initData() {

            return tg?.initData || "";
        },

        haptic(type = "light") {

            if (!tg?.HapticFeedback) {
                return;
            }

            try {

                if (type === "success") {
                    tg.HapticFeedback.notificationOccurred("success");
                    return;
                }

                if (type === "error") {
                    tg.HapticFeedback.notificationOccurred("error");
                    return;
                }

                if (type === "warning") {
                    tg.HapticFeedback.notificationOccurred("warning");
                    return;
                }

                tg.HapticFeedback.impactOccurred(type);

            } catch (error) {

                console.warn(
                    "[Telegram] haptic error:",
                    error
                );
            }
        },

        showAlert(message) {

            if (tg?.showAlert) {
                tg.showAlert(String(message));
                return;
            }

            window.alert(String(message));
        },

        close() {

            if (tg?.close) {
                tg.close();
            }
        },

        setHeaderColor(color) {

            if (tg?.setHeaderColor) {
                tg.setHeaderColor(color);
            }
        },

        setBackgroundColor(color) {

            if (tg?.setBackgroundColor) {
                tg.setBackgroundColor(color);
            }
        },

        sendData(data) {

            if (!tg?.sendData) {
                return false;
            }

            try {

                const payload =
                    typeof data === "string"
                        ? data
                        : JSON.stringify(data);

                tg.sendData(payload);

                return true;

            } catch (error) {

                console.error(
                    "[Telegram] sendData error:",
                    error
                );

                return false;
            }
        }
    };

    window.TelegramAPI = TelegramAPI;

})();
