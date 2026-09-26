// Tube Empire Core — single source of truth for economy, progress and settings
(function(){
  'use strict';

  const STATE_KEY = 'tube_empire_state_v1';
  const LEGACY_MONEY = 'zeitarbeitMoney';
  const LEGACY_ENERGY = 'zeitarbeitEnergy';

  const DEFAULT = {
    version: 3,

    player: {
      id: null,
      name: 'Player',
      username: '',
      level: 1,
      xp: 0,
      money: 1000,
      energy: 100,
      totalEarned: 0,
      totalSpent: 0
    },

    economy: {
      incomePerSecond: 0,
      energyPerSecond: 1,
      lastUpdate: Date.now()
    },

    upgrades: {},
    assets: {},
    corporations: {},

    channel: {
      views: 0,
      subscribers: 0,
      xp: 0,
      viralUntil: 0,
      viralMultiplier: 1,
      history: []
    },

    avatar: {
      gender: 0,
      head: 0,
      torso: 0,
      legs: 0,
      accessory: 0
    },

    studio: {
      walls: 0,
      neon: 0,
      poster: 0,
      pet: 0
    },

    settings: {
      language: localStorage.getItem('freezzzLang') || 'ru',
      sound: localStorage.getItem('freezzzSound') !== 'false',
      vibration: true
    }
  };


  /* =========================================================
     HELPERS
  ========================================================= */

  const clone = o => JSON.parse(JSON.stringify(o));

  function merge(base, src){
    if(!src || typeof src !== 'object') return base;

    Object.keys(src).forEach(k => {

      if(
        src[k] &&
        typeof src[k] === 'object' &&
        !Array.isArray(src[k]) &&
        base[k] &&
        typeof base[k] === 'object'
      ){
        merge(base[k], src[k]);
      } else {
        base[k] = src[k];
      }

    });

    return base;
  }


  /* =========================================================
     LOAD STATE
  ========================================================= */

  let state;

  try {

    const raw = localStorage.getItem(STATE_KEY);

    if(raw){

      state = merge(
        clone(DEFAULT),
        JSON.parse(raw)
      );

    } else {

      state = clone(DEFAULT);

      /*
       * IMPORTANT:
       * Use legacy values ONLY when they really exist.
       * Missing legacy values must NOT become 0.
       */

      const legacyMoneyRaw =
        localStorage.getItem(LEGACY_MONEY);

      const legacyEnergyRaw =
        localStorage.getItem(LEGACY_ENERGY);

      if(
        legacyMoneyRaw !== null &&
        legacyMoneyRaw !== ''
      ){

        const legacyMoney =
          Number(legacyMoneyRaw);

        if(Number.isFinite(legacyMoney)){
          state.player.money = legacyMoney;
        }

      }

      if(
        legacyEnergyRaw !== null &&
        legacyEnergyRaw !== ''
      ){

        const legacyEnergy =
          Number(legacyEnergyRaw);

        if(Number.isFinite(legacyEnergy)){
          state.player.energy = Math.max(
            0,
            Math.min(100, legacyEnergy)
          );
        }

      }

    }

  } catch(e){

    state = clone(DEFAULT);

  }


  /* =========================================================
     SAVE
  ========================================================= */

  function save(){

    try{

      localStorage.setItem(
        STATE_KEY,
        JSON.stringify(state)
      );

      /*
       * Compatibility with older pages/builds.
       */

      localStorage.setItem(
        LEGACY_MONEY,
        String(state.player.money)
      );

      localStorage.setItem(
        LEGACY_ENERGY,
        String(state.player.energy)
      );

    }catch(e){}

  }


  /* =========================================================
     CORPORATIONS
  ========================================================= */

  const corporations = [

    {
      id: 'media_hub',
      icon: '🏢',
      cost: 5000,
      incomePerSec: 1,
      name: {
        ru: 'Медиа-хаб',
        de: 'Media-Hub',
        en: 'Media Hub'
      }
    },

    {
      id: 'creator_agency',
      icon: '📡',
      cost: 25000,
      incomePerSec: 6,
      name: {
        ru: 'Creator Agency',
        de: 'Creator-Agentur',
        en: 'Creator Agency'
      }
    },

    {
      id: 'production_house',
      icon: '🎥',
      cost: 120000,
      incomePerSec: 30,
      name: {
        ru: 'Продакшн-хаус',
        de: 'Produktionshaus',
        en: 'Production House'
      }
    },

    {
      id: 'media_network',
      icon: '🌐',
      cost: 750000,
      incomePerSec: 180,
      name: {
        ru: 'Медиа-сеть',
        de: 'Mediennetzwerk',
        en: 'Media Network'
      }
    },

    {
      id: 'global_platform',
      icon: '🚀',
      cost: 5000000,
      incomePerSec: 900,
      name: {
        ru: 'Глобальная платформа',
        de: 'Globale Plattform',
        en: 'Global Platform'
      }
    }

  ];


  /* =========================================================
     PROGRESS
  ========================================================= */

  function syncProgress(){

    const channelXp =
      Math.max(
        0,
        Number(state.channel?.xp) || 0
      );

    state.player.xp = channelXp;

    state.player.level =
      Math.max(
        1,
        Math.floor(channelXp / 100) + 1
      );

  }


  /* =========================================================
     INCOME CALCULATION
  ========================================================= */

  function recalcIncome(){

    const corpIncome =
      corporations.reduce(
        (sum, asset) => {

          return sum +
            (
              state.corporations[asset.id]
                ? asset.incomePerSec
                : 0
            );

        },
        0
      );

    const subscribers =
      Math.max(
        0,
        Number(state.channel?.subscribers) || 0
      );

    const viral =
      Number(state.channel?.viralUntil || 0) > Date.now()
        ? 2
        : 1;

    /*
     * Subscriber income:
     * 1000 subscribers = 1 €/sec
     */

    state.economy.incomePerSecond =
      corpIncome +
      (subscribers / 1000) * viral;

    /*
     * Energy recovery:
     * 1 energy/sec
     */

    state.economy.energyPerSecond = 1;

  }


  /* =========================================================
     PASSIVE ECONOMY
  ========================================================= */

  function passive(now = Date.now()){

    syncProgress();
    recalcIncome();

    const last =
      Number(state.economy.lastUpdate) || now;

    /*
     * Maximum offline calculation:
     * 24 hours.
     */

    const sec =
      Math.max(
        0,
        Math.min(
          86400,
          (now - last) / 1000
        )
      );

    if(sec <= 0){

      return {
        income: 0,
        energy: 0,
        elapsed: 0
      };

    }

    const income =
      Math.max(
        0,
        Number(state.economy.incomePerSecond) || 0
      ) * sec;

    const energy =
      Math.max(
        0,
        Number(state.economy.energyPerSecond) || 0
      ) * sec;


    state.player.money += income;

    state.player.totalEarned += income;


    state.player.energy =
      Math.max(
        0,
        Math.min(
          100,
          state.player.energy + energy
        )
      );


    state.economy.lastUpdate = now;

    save();


    return {
      income,
      energy,
      elapsed: sec
    };

  }


  /* =========================================================
     INITIAL ECONOMY SYNC
  ========================================================= */

  state.economy.lastUpdate =
    Number(state.economy.lastUpdate) || Date.now();

  syncProgress();
  recalcIncome();
  passive();


  /* =========================================================
     GENERIC STATE GET / SET
  ========================================================= */

  function get(path, fallback = null){

    const value =
      path
        .split('.')
        .reduce(
          (o, k) =>
            o == null
              ? undefined
              : o[k],
          state
        );

    return value ?? fallback;

  }


  function set(path, value){

    const parts = path.split('.');

    let obj = state;

    for(
      let i = 0;
      i < parts.length - 1;
      i++
    ){

      if(
        !obj[parts[i]] ||
        typeof obj[parts[i]] !== 'object'
      ){

        obj[parts[i]] = {};

      }

      obj = obj[parts[i]];

    }

    obj[
      parts[parts.length - 1]
    ] = value;

    syncProgress();
    recalcIncome();
    save();

    return value;

  }


  /* =========================================================
     AVATARS
  ========================================================= */

  const avatars = [
    '👦',
    '👧',
    '🧑‍💻',
    '🧑‍🎤',
    '🥷',
    '🤖',
    '🦊',
    '🧛',
    '👻',
    '👽',
    '🚀',
    '👑',
    '😇',
    '🧠',
    '🦁'
  ];


  /* =========================================================
     CORE
  ========================================================= */

  const Core = {

    getState: () => state,

    save,


    /* ---------- ECONOMY ---------- */

    sync: () => passive(),


    getMoney: () => {

      passive();

      return Number(
        state.player.money
      ) || 0;

    },


    setMoney: v => {

      const value =
        Number(v);

      state.player.money =
        Math.max(
          0,
          Number.isFinite(value)
            ? value
            : 0
        );

      save();

    },


    addMoney: v => {

      v = Number(v);

      if(
        !Number.isFinite(v) ||
        v <= 0
      ){

        return false;

      }

      /*
       * Apply passive income first.
       */

      passive();

      state.player.money += v;

      state.player.totalEarned += v;

      save();

      return true;

    },


    spendMoney: v => {

      v = Number(v);

      passive();

      if(
        !Number.isFinite(v) ||
        v <= 0 ||
        state.player.money < v
      ){

        return false;

      }

      state.player.money -= v;

      state.player.totalSpent += v;

      save();

      return true;

    },


    /* ---------- ENERGY ---------- */

    getEnergy: () => {

      passive();

      return Number(
        state.player.energy
      ) || 0;

    },


    setEnergy: v => {

      const value =
        Number(v);

      state.player.energy =
        Math.max(
          0,
          Math.min(
            100,
            Number.isFinite(value)
              ? value
              : 0
          )
        );

      save();

    },


    /* ---------- LEVEL / XP ---------- */

    getLevel: () => {

      syncProgress();

      return state.player.level;

    },


    getXP: () => {

      syncProgress();

      return state.player.xp;

    },


    addXP: v => {

      v = Number(v) || 0;

      if(v <= 0){

        return false;

      }

      state.channel.xp =
        Math.max(
          0,
          Number(state.channel.xp) || 0
        ) + v;

      syncProgress();

      save();

      return true;

    },


    /* ---------- THEME ---------- */

    getTheme: () =>
      localStorage.getItem(
        'freezzzTheme'
      ) || 'dark',


    setTheme: t => {

      localStorage.setItem(
        'freezzzTheme',
        t
      );

      Core.applyTheme(t);

    },


    applyTheme: t => {

      try{

        document.documentElement
          .setAttribute(
            'data-theme',
            t || 'dark'
          );

        if(document.body){

          document.body
            .setAttribute(
              'data-theme',
              t || 'dark'
            );

        }

      }catch(e){}

    },


    toggleTheme: () => {

      const next = {
        dark: 'rose',
        rose: 'light',
        light: 'dark'
      }[
        Core.getTheme()
      ] || 'dark';

      Core.setTheme(next);

      return next;

    },


    /* ---------- LANGUAGE ---------- */

    getLang: () =>
      localStorage.getItem(
        'freezzzLang'
      ) ||
      state.settings.language ||
      'ru',


    setLang: l => {

      l =
        ['ru', 'de', 'en'].includes(l)
          ? l
          : 'ru';

      localStorage.setItem(
        'freezzzLang',
        l
      );

      state.settings.language = l;

      save();

    },


    toggleLang: () => {

      const next = {
        ru: 'de',
        de: 'en',
        en: 'ru'
      }[
        Core.getLang()
      ];

      Core.setLang(next);

      return next;

    },


    /* ---------- SOUND ---------- */

    getSound: () =>
      localStorage.getItem(
        'freezzzSound'
      ) !== 'false',


    toggleSound: () => {

      const next =
        !Core.getSound();

      localStorage.setItem(
        'freezzzSound',
        String(next)
      );

      state.settings.sound = next;

      save();

      return next;

    },


    playSound: type => {

      if(!Core.getSound()) return;

      try{

        if(!Core.audioCtx){

          Core.audioCtx =
            new(
              window.AudioContext ||
              window.webkitAudioContext
            )();

        }

        if(
          Core.audioCtx.state ===
          'suspended'
        ){

          Core.audioCtx.resume();

        }

        const oscillator =
          Core.audioCtx
            .createOscillator();

        const gain =
          Core.audioCtx
            .createGain();

        const frequency =
          type === 'buy'
            ? 740
            : type === 'cash'
              ? 880
              : type === 'error'
                ? 140
                : 520;

        oscillator.type =
          type === 'error'
            ? 'sawtooth'
            : 'square';

        oscillator.frequency.value =
          frequency;

        gain.gain.value = 0.025;

        gain.gain
          .exponentialRampToValueAtTime(
            0.001,
            Core.audioCtx.currentTime + 0.1
          );

        oscillator
          .connect(gain);

        gain
          .connect(
            Core.audioCtx.destination
          );

        oscillator.start();

        oscillator.stop(
          Core.audioCtx.currentTime + 0.1
        );

      }catch(e){}

    },


    /* ---------- HAPTIC ---------- */

    haptic: s => {

      if(!state.settings.vibration){

        return;

      }

      try{

        window.Telegram
          ?.WebApp
          ?.HapticFeedback
          ?.impactOccurred(
            s || 'light'
          );

      }catch(e){}

    },


    /* ---------- USER ---------- */

    getUserName: def => {

      return (
        def === 'anonymous'
          ? def
          :
          localStorage.getItem(
            'tube_empire_custom_name'
          ) ||
          (
            window.Telegram
              ?.WebApp
              ?.initDataUnsafe
              ?.user
              ?.username
              &&
            '@' +
            window.Telegram
              .WebApp
              .initDataUnsafe
              .user
              .username
          ) ||
          window.Telegram
            ?.WebApp
            ?.initDataUnsafe
            ?.user
            ?.first_name ||
          def ||
          'Blogger'
      );

    },


    /* ---------- AVATAR ---------- */

    getAvatarString: () => {

      try{

        const studio =
          JSON.parse(
            localStorage.getItem(
              'tube_empire_studio_config'
            ) || '{}'
          );

        if(
          Number.isFinite(
            Number(studio.avatar)
          )
        ){

          return (
            avatars[
              Number(studio.avatar)
            ] ||
            avatars[0]
          );

        }


        const avatar =
          JSON.parse(
            localStorage.getItem(
              'tube_empire_avatar_config'
            ) || '{}'
          );

        return (
          avatars[
            Number(avatar.head) || 0
          ] ||
          avatars[0]
        );

      }catch(e){

        return avatars[0];

      }

    },


    /* ---------- CORPORATIONS ---------- */

    getCorporationAssets:
      () =>
        corporations.map(
          a => ({...a})
        ),


    isAssetOwned:
      id =>
        !!state.corporations[id],


    buyCorporationAsset: id => {

      const asset =
        corporations.find(
          x => x.id === id
        );

      if(
        !asset ||
        state.corporations[id] ||
        !Core.spendMoney(
          asset.cost
        )
      ){

        return false;

      }

      state.corporations[id] = true;

      recalcIncome();

      save();

      Core.playSound('buy');
      Core.haptic('heavy');

      return true;

    },


    getTotalCorporationIncome: () => {

      passive();

      return Number(
        state.economy.incomePerSecond
      ) || 0;

    },


    /* ---------- UNLOCKS ---------- */

    isItemUnlocked:
      (category, id, cost) =>
        cost === 0 ||
        localStorage.getItem(
          `unlocked_${category}_${id}`
        ) === 'true',


    unlockItem:
      (category, id, cost) => {

        if(
          Core.isItemUnlocked(
            category,
            id,
            cost
          )
        ){

          return true;

        }

        if(
          Core.spendMoney(cost)
        ){

          localStorage.setItem(
            `unlocked_${category}_${id}`,
            'true'
          );

          return true;

        }

        return false;

      }

  };


  /* =========================================================
     GLOBAL EXPORTS
  ========================================================= */

  window.Core = Core;


  window.GameState = {

    DEFAULT_STATE:
      clone(DEFAULT),

    getState:
      () => state,

    resetState: () => {

      state =
        clone(DEFAULT);

      state.economy.lastUpdate =
        Date.now();

      save();

      return state;

    },

    replaceState: n => {

      state =
        merge(
          clone(DEFAULT),
          n || {}
        );

      syncProgress();
      recalcIncome();
      save();

      return true;

    },

    get,
    set

  };


  /* =========================================================
     GAME ECONOMY API
  ========================================================= */

  window.GameEconomy = {

    update:
      now => passive(now),

    addMoney:
      Core.addMoney,

    spendMoney:
      Core.spendMoney,

    canAfford:
      v =>
        Core.getMoney() >= Number(v),

    getMoney:
      Core.getMoney,

    getEnergy:
      Core.getEnergy,

    getIncomePerSecond:
      () =>
        Core.getTotalCorporationIncome(),

    getEnergyPerSecond:
      () =>
        Number(
          state.economy.energyPerSecond
        ) || 0,

    getTrendMultiplier:
      () => 1,

    getTotalCorporationIncome:
      Core.getTotalCorporationIncome

  };


  /* =========================================================
     INITIALIZATION
  ========================================================= */

  Core.applyTheme(
    Core.getTheme()
  );


  document.addEventListener(
    'visibilitychange',
    () => {

      if(
        document.visibilityState ===
        'visible'
      ){

        passive();

      }

    }
  );


  window.addEventListener(
    'beforeunload',
    save
  );

})();
