/* =========================================================
   FREEzzzGames — Arcade Core
   Version 1.1

   Единое хранилище числовых результатов аркад.
   Игровой логики здесь нет.
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "FREEzzzGames_Arcade_Numbers_v1";

  const DEFAULTS = {
    reactionBest: 0,
    racingBest: 0,
    runnerBest: 0,
    totalScore: 0
  };

  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) return { ...DEFAULTS };

      const saved = JSON.parse(raw);

      return {
        reactionBest: Number.isFinite(Number(saved.reactionBest))
          ? Math.max(0, Number(saved.reactionBest)) : 0,

        racingBest: Number.isFinite(Number(saved.racingBest))
          ? Math.max(0, Number(saved.racingBest)) : 0,

        runnerBest: Number.isFinite(Number(saved.runnerBest))
          ? Math.max(0, Number(saved.runnerBest)) : 0,

        totalScore: Number.isFinite(Number(saved.totalScore))
          ? Math.max(0, Number(saved.totalScore)) : 0
      };
    } catch (error) {
      return { ...DEFAULTS };
    }
  }

  function write(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {}
  }

  function getNumber(name) {
    return Number(read()[name]) || 0;
  }

  function setNumber(name, value) {
    const data = read();
    const number = Number(value);

    data[name] = Number.isFinite(number)
      ? Math.max(0, number)
      : 0;

    write(data);
    return data[name];
  }

  function addNumber(name, value) {
    return setNumber(
      name,
      getNumber(name) + (Number(value) || 0)
    );
  }

  window.ArcadeCore = {

    /* ---------- REACTION ---------- */

    getReactionBest() {
      return getNumber("reactionBest");
    },

    setReactionBest(value) {
      return setNumber("reactionBest", value);
    },


    /* ---------- RACING ---------- */

    getRacingBest() {
      return getNumber("racingBest");
    },

    setRacingBest(value) {
      return setNumber("racingBest", value);
    },


    /* ---------- CYBER RUNNER ---------- */

    getRunnerBest() {
      return getNumber("runnerBest");
    },

    setRunnerBest(value) {
      return setNumber("runnerBest", value);
    },


    /* ---------- TOTAL ---------- */

    getTotalScore() {
      return getNumber("totalScore");
    },

    setTotalScore(value) {
      return setNumber("totalScore", value);
    },

    addTotalScore(value) {
      return addNumber("totalScore", value);
    },


    /* ---------- READ-ONLY SNAPSHOT ---------- */

    getNumbers() {
      return read();
    }
  };

})();
