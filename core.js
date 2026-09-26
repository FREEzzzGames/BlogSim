// Tube Empire Core — единый источник экономики, прогресса и настроек
(function(){
  'use strict';

  const STATE_KEY = 'tube_empire_state_v1';
  const LEGACY_MONEY = 'zeitarbeitMoney';
  const LEGACY_ENERGY = 'zeitarbeitEnergy';

  const DEFAULT = {
    version: 4,

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
      moneyColor: 0,
      pet: 0,
      studioButton: 0,
      quickButton: 0,
      channelAvatar: 0
    },

    settings: {
      language: localStorage.getItem('freezzzLang') || 'ru',
      sound: localStorage.getItem('freezzzSound') !== 'false',
      vibration: true
    }
  };

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
      }else{
        base[k] = src[k];
      }
    });

    return base;
  }

  let state;

  try{
    const raw = localStorage.getItem(STATE_KEY);

    state = raw
      ? merge(clone(DEFAULT), JSON.parse(raw))
      : clone(DEFAULT);

    if(!raw){
      const legacyMoney = Number(localStorage.getItem(LEGACY_MONEY));
      const legacyEnergy = Number(localStorage.getItem(LEGACY_ENERGY));

      if(Number.isFinite(legacyMoney)){
        state.player.money = legacyMoney;
      }

      if(Number.isFinite(legacyEnergy)){
        state.player.energy = legacyEnergy;
      }
    }
  }catch(e){
    state = clone(DEFAULT);
  }

  function save(){
    try{
      localStorage.setItem(
        STATE_KEY,
        JSON.stringify(state)
      );

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

  const corporations = [
    {
      id: 'micro',
      name: 'Микрофон Pro',
      cost: 500,
      incomePerSec: 0.5
    },
    {
      id: 'camera',
      name: 'Камера 4K',
      cost: 1500,
      incomePerSec: 1
    },
    {
      id: 'pc',
      name: 'Монтажная станция',
      cost: 4000,
      incomePerSec: 2
    },
    {
      id: 'light',
      name: 'Студийный свет',
      cost: 8000,
      incomePerSec: 4
    }
  ];

  function recalcIncome(){
    const corpIncome =
      corporations.reduce(
        (sum, asset) =>
          sum +
          (
            state.corporations[asset.id]
              ? asset.incomePerSec
              : 0
          ),
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

    state.economy.incomePerSecond =
      corpIncome +
      (subscribers / 1000) * viral;

    state.economy.energyPerSecond = 1;
  }

  function passive(now = Date.now()){
    syncProgress();
    recalcIncome();

    const last =
      Number(state.economy.lastUpdate) || now;

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

  /*
   * =========================================================
   * COLORS
   * =========================================================
   */

  const COLOR_PALETTE = [
    {
      name: 'Красный',
      color: '#ff3348',
      price: 0
    },
    {
      name: 'Оранжевый',
      color: '#ff8a2a',
      price: 0
    },
    {
      name: 'Жёлтый',
      color: '#ffd21f',
      price: 500
    },
    {
      name: 'Зелёный',
      color: '#38d979',
      price: 1500
    },
    {
      name: 'Бирюзовый',
      color: '#24c7e8',
      price: 4000
    },
    {
      name: 'Синий',
      color: '#4287ff',
      price: 10000
    },
    {
      name: 'Фиолетовый',
      color: '#a65cff',
      price: 25000
    }
  ];

  const COLOR_KEYS = {
    studio:
      'tube_empire_studio_button_color_v1',

    quick:
      'tube_empire_quick_button_color_v1',

    money:
      'tube_empire_money_color_v1'
  };

  function readOwnedMap(key){
    try{
      return JSON.parse(
        localStorage.getItem(key) || '{}'
      ) || {};
    }catch(e){
      return {};
    }
  }

  function writeOwnedMap(key, map){
    localStorage.setItem(
      key,
      JSON.stringify(map)
    );
  }

  function getColorTheme(kind){
    const key = COLOR_KEYS[kind];

    if(!key){
      return {
        ...COLOR_PALETTE[0],
        index: 0
      };
    }

    const index =
      Math.max(
        0,
        Math.min(
          COLOR_PALETTE.length - 1,
          Number(
            localStorage.getItem(key)
          ) || 0
        )
      );

    return {
      ...COLOR_PALETTE[index],
      index
    };
  }

  function getColorThemes(kind){
    const key = COLOR_KEYS[kind];

    if(!key){
      return [];
    }

    const owned =
      readOwnedMap(
        key + '_owned'
      );

    return COLOR_PALETTE.map(
      (item, index) => ({
        ...item,
        index,
        owned:
          item.price === 0 ||
          !!owned[index]
      })
    );
  }

  function buyColorTheme(kind, index){
    const key = COLOR_KEYS[kind];

    if(!key){
      return false;
    }

    index = Number(index);

    const item =
      COLOR_PALETTE[index];

    if(!item){
      return false;
    }

    const owned =
      readOwnedMap(
        key + '_owned'
      );

    if(
      item.price === 0 ||
      owned[index]
    ){
      localStorage.setItem(
        key,
        String(index)
      );

      dispatchCustomizationChange();

      return true;
    }

    if(
      !Core.spendMoney(
        item.price
      )
    ){
      return false;
    }

    owned[index] = true;

    writeOwnedMap(
      key + '_owned',
      owned
    );

    localStorage.setItem(
      key,
      String(index)
    );

    dispatchCustomizationChange();

    return true;
  }

  /*
   * =========================================================
   * CHANNEL AVATARS
   * =========================================================
   */

  const CHANNEL_AVATAR_KEY =
    'tube_empire_channel_avatar_v1';

  const channelAvatars = [
    {
      id: 'play',
      icon: '▶️',
      name: 'PLAY',
      price: 0
    },
    {
      id: 'star',
      icon: '⭐',
      name: 'STAR',
      price: 0
    },
    {
      id: 'gamer',
      icon: '🎮',
      name: 'GAMER',
      price: 0
    },
    {
      id: 'fire',
      icon: '🔥',
      name: 'FIRE',
      price: 1500
    },
    {
      id: 'bolt',
      icon: '⚡',
      name: 'BOLT',
      price: 3000
    },
    {
      id: 'rocket',
      icon: '🚀',
      name: 'ROCKET',
      price: 6000
    },
    {
      id: 'crown',
      icon: '👑',
      name: 'CROWN',
      price: 10000
    },
    {
      id: 'diamond',
      icon: '💎',
      name: 'DIAMOND',
      price: 20000
    },
    {
      id: 'skull',
      icon: '☠️',
      name: 'SKULL',
      price: 35000
    },
    {
      id: 'cyber',
      icon: '🤖',
      name: 'CYBER',
      price: 50000
    }
  ];

  function getChannelAvatars(){
    const owned =
      readOwnedMap(
        CHANNEL_AVATAR_KEY + '_owned'
      );

    return channelAvatars.map(
      (item, index) => ({
        ...item,
        index,
        owned:
          item.price === 0 ||
          !!owned[index]
      })
    );
  }

  function buyChannelAvatar(index){
    index = Number(index);

    const item =
      channelAvatars[index];

    if(!item){
      return false;
    }

    const owned =
      readOwnedMap(
        CHANNEL_AVATAR_KEY + '_owned'
      );

    if(
      item.price === 0 ||
      owned[index]
    ){
      localStorage.setItem(
        CHANNEL_AVATAR_KEY,
        String(index)
      );

      dispatchCustomizationChange();

      return true;
    }

    if(
      !Core.spendMoney(
        item.price
      )
    ){
      return false;
    }

    owned[index] = true;

    writeOwnedMap(
      CHANNEL_AVATAR_KEY + '_owned',
      owned
    );

    localStorage.setItem(
      CHANNEL_AVATAR_KEY,
      String(index)
    );

    dispatchCustomizationChange();

    return true;
  }

  function getChannelAvatar(){
    const index =
      Math.max(
        0,
        Math.min(
          channelAvatars.length - 1,
          Number(
            localStorage.getItem(
              CHANNEL_AVATAR_KEY
            )
          ) || 0
        )
      );

    return channelAvatars[index];
  }

  /*
   * =========================================================
   * PETS
   * =========================================================
   */

  const pets = [
    {
      id: 'cat',
      name: 'Кот',
      icon: '🐱',
      price: 0
    },
    {
      id: 'dog',
      name: 'Собака',
      icon: '🐶',
      price: 1000
    },
    {
      id: 'fox',
      name: 'Лиса',
      icon: '🦊',
      price: 2500
    },
    {
      id: 'panda',
      name: 'Панда',
      icon: '🐼',
      price: 5000
    },
    {
      id: 'dragon',
      name: 'Дракон',
      icon: '🐉',
      price: 10000
    },
    {
      id: 'lizard',
      name: 'Ящерица',
      icon: '🦎',
      price: 15000
    },
    {
      id: 'turtle',
      name: 'Черепаха',
      icon: '🐢',
      price: 20000
    },
    {
      id: 'crocodile',
      name: 'Крокодил',
      icon: '🐊',
      price: 30000
    },
    {
      id: 'parrot',
      name: 'Попугай',
      icon: '🦜',
      price: 40000
    },
    {
      id: 'raccoon',
      name: 'Енот',
      icon: '🦝',
      price: 60000
    }
  ];

  const PET_KEY =
    'tube_empire_pet_v1';

  function getPets(){
    const owned =
      readOwnedMap(
        PET_KEY + '_owned'
      );

    return pets.map(
      (item, index) => ({
        ...item,
        index,
        owned:
          item.price === 0 ||
          !!owned[index]
      })
    );
  }

  function getPet(){
    const index =
      Math.max(
        0,
        Math.min(
          pets.length - 1,
          Number(
            localStorage.getItem(
              PET_KEY
            )
          ) || 0
        )
      );

    return pets[index];
  }

  function buyPet(index){
    index = Number(index);

    const item =
      pets[index];

    if(!item){
      return false;
    }

    const owned =
      readOwnedMap(
        PET_KEY + '_owned'
      );

    if(
      item.price === 0 ||
      owned[index]
    ){
      localStorage.setItem(
        PET_KEY,
        String(index)
      );

      dispatchCustomizationChange();

      return true;
    }

    if(
      !Core.spendMoney(
        item.price
      )
    ){
      return false;
    }

    owned[index] = true;

    writeOwnedMap(
      PET_KEY + '_owned',
      owned
    );

    localStorage.setItem(
      PET_KEY,
      String(index)
    );

    dispatchCustomizationChange();

    return true;
  }

  /*
   * =========================================================
   * AVATAR
   * =========================================================
   */

  const AVATAR_KEY =
    'tube_empire_avatar_config';

  const avatarParts = {
    gender: [
      '👦','👧','👨','👩','🧑',
      '🧔','👱‍♂️','👱‍♀️','👨‍🦰','👩‍🦰',
      '👨‍🦱','👩‍🦱','👨‍🦳','👩‍🦳','👨‍🦲',
      '👩‍🦲','🧑‍🦰','🧑‍🦱','🧑‍🦳','🧑‍🦲'
    ],

    head: [
      '','','🧢','🎧','🕶️',
      '👓','🤓','🎩','👒','🪖',
      '⛑️','👑','🧢','🎩','👓',
      '🕶️','🎧','👒','🪖','⛑️'
    ],

    torso: [
      '👕','👕','👕','🧥','🧥',
      '👔','👔','🥼','🥼','👚',
      '👚','🧥','🦺','🥋','🧥',
      '👕','👔','🥼','👚','🦺'
    ],

    legs: [
      '👖','👖','👖','🩳','🩳',
      '🩳','👗','👗','🥻','🥻',
      '👖','🩳','👖','🩳','👗',
      '🥻','👖','🩳','👗','👖'
    ],

    accessory: [
      '❌','🎙️','📷','📱','🎮',
      '🎧','⌚','💻','🕶️','🎤',
      '🎙️','📷','📱','🎮','🎧',
      '⌚','💻','🕶️','🎤','🎙️'
    ]
  };

  const AVATAR_PRICES = {
    gender: [
      0,0,0,0,0,
      100,200,400,800,1600,
      3200,6400,12800,25600,51200,
      102400,204800,409600,819200,1638400
    ],

    head: [
      0,0,0,0,0,
      100,200,400,800,1600,
      3200,6400,12800,25600,51200,
      102400,204800,409600,819200,1638400
    ],

    torso: [
      0,0,0,0,0,
      100,200,400,800,1600,
      3200,6400,12800,25600,51200,
      102400,204800,409600,819200,1638400
    ],

    legs: [
      0,0,0,0,0,
      100,200,400,800,1600,
      3200,6400,12800,25600,51200,
      102400,204800,409600,819200,1638400
    ],

    accessory: [
      0,0,0,0,0,
      100,200,400,800,1600,
      3200,6400,12800,25600,51200,
      102400,204800,409600,819200,1638400
    ]
  };

  function getAvatarConfig(){
    try{
      return JSON.parse(
        localStorage.getItem(
          AVATAR_KEY
        ) ||
        JSON.stringify(
          DEFAULT.avatar
        )
      );
    }catch(e){
      return {
        ...DEFAULT.avatar
      };
    }
  }

  function setAvatarConfig(config){
    const safe = {
      ...DEFAULT.avatar,
      ...(config || {})
    };

    localStorage.setItem(
      AVATAR_KEY,
      JSON.stringify(safe)
    );

    state.avatar = clone(safe);

    save();
    dispatchCustomizationChange();

    return safe;
  }

  function getAvatarString(){
    try{
      const a =
        getAvatarConfig();

      const pick =
        key => {
          const list =
            avatarParts[key];

          const index =
            Math.max(
              0,
              Math.min(
                list.length - 1,
                Number(a[key]) || 0
              )
            );

          const value =
            list[index];

          return value === '❌'
            ? ''
            : value;
        };

      return (
        pick('gender') +
        pick('head') +
        pick('torso') +
        pick('legs') +
        pick('accessory')
      ) || '👦';

    }catch(e){
      return '👦';
    }
  }

  /*
   * =========================================================
   * AVATAR PURCHASE
   * =========================================================
   */

  const AVATAR_UNLOCK_KEY =
    'tube_empire_avatar_unlocks_v1';

  function avatarOwned(type, index){
    const price =
      Number(
        AVATAR_PRICES[type]?.[index]
      ) || 0;

    const owned =
      readOwnedMap(
        AVATAR_UNLOCK_KEY
      );

    return (
      price === 0 ||
      !!owned[
        `${type}_${index}`
      ]
    );
  }

  function buyAvatarPart(type, index){
    index = Number(index);

    if(
      !avatarParts[type] ||
      !avatarParts[type][index]
    ){
      return false;
    }

    if(
      avatarOwned(
        type,
        index
      )
    ){
      return true;
    }

    const price =
      Number(
        AVATAR_PRICES[type]?.[index]
      ) || 0;

    if(
      !Core.spendMoney(price)
    ){
      return false;
    }

    const owned =
      readOwnedMap(
        AVATAR_UNLOCK_KEY
      );

    owned[
      `${type}_${index}`
    ] = true;

    writeOwnedMap(
      AVATAR_UNLOCK_KEY,
      owned
    );

    dispatchCustomizationChange();

    return true;
  }

  /*
   * =========================================================
   * CUSTOMIZATION EVENTS
   * =========================================================
   */

  function dispatchCustomizationChange(){
    try{
      window.dispatchEvent(
        new CustomEvent(
          'tubeEmpireCustomizationChanged',
          {
            detail:{
              avatar:getAvatarConfig(),
              pet:getPet(),
              channelAvatar:getChannelAvatar(),
              moneyColor:getColorTheme('money'),
              studioColor:getColorTheme('studio'),
              quickColor:getColorTheme('quick')
            }
          }
        )
      );
    }catch(e){}
       }  /*
   * =========================================================
   * MAIN CORE
   * =========================================================
   */

  const Core = {

    getState: () => state,

    save,

    sync: () => passive(),

    getMoney: () => {
      passive();
      return Number(
        state.player.money
      ) || 0;
    },

    setMoney: value => {
      state.player.money =
        Math.max(
          0,
          Number(value) || 0
        );

      save();
      dispatchCustomizationChange();
    },

    addMoney: value => {
      value = Number(value);

      if(
        !Number.isFinite(value) ||
        value <= 0
      ){
        return false;
      }

      passive();

      state.player.money += value;
      state.player.totalEarned += value;

      save();
      dispatchCustomizationChange();

      return true;
    },

    spendMoney: value => {
      value = Number(value);

      passive();

      if(
        !Number.isFinite(value) ||
        value <= 0 ||
        state.player.money < value
      ){
        return false;
      }

      state.player.money -= value;
      state.player.totalSpent += value;

      save();
      dispatchCustomizationChange();

      return true;
    },

    getEnergy: () => {
      passive();

      return Number(
        state.player.energy
      ) || 0;
    },

    setEnergy: value => {
      state.player.energy =
        Math.max(
          0,
          Math.min(
            100,
            Number(value) || 0
          )
        );

      save();
    },

    getLevel: () => {
      syncProgress();
      return state.player.level;
    },

    getXP: () => {
      syncProgress();
      return state.player.xp;
    },

    addXP: value => {
      value =
        Number(value) || 0;

      if(value <= 0){
        return false;
      }

      state.channel.xp =
        Math.max(
          0,
          Number(
            state.channel.xp
          ) || 0
        ) + value;

      syncProgress();
      save();

      return true;
    },

    getUserName: def => {
      return (
        localStorage.getItem(
          'tube_empire_custom_name'
        ) ||
        (
          window.Telegram?.WebApp
            ?.initDataUnsafe?.user
            ?.username
            ? '@' +
              window.Telegram.WebApp
                .initDataUnsafe.user.username
            : null
        ) ||
        window.Telegram?.WebApp
          ?.initDataUnsafe?.user
          ?.first_name ||
        def ||
        'Blogger'
      );
    },

    setUserName: name => {
      name =
        String(name || '')
          .trim()
          .slice(0, 24);

      if(!name){
        return false;
      }

      localStorage.setItem(
        'tube_empire_custom_name',
        name
      );

      state.player.name = name;

      save();
      dispatchCustomizationChange();

      return true;
    },

    getAvatarString,

    getAvatarConfig,

    setAvatarConfig,

    getAvatarParts: () =>
      clone(avatarParts),

    getAvatarPrices: () =>
      clone(AVATAR_PRICES),

    avatarOwned,

    buyAvatarPart,

    getPets,

    getPet,

    buyPet,

    getChannelAvatars,

    getChannelAvatar,

    buyChannelAvatar,

    getColorThemes,

    getColorTheme,

    buyColorTheme,

    getCorporationAssets:
      () =>
        corporations.map(
          asset => ({
            ...asset
          })
        ),

    isAssetOwned:
      id =>
        !!state.corporations[id],

    buyCorporationAsset:
      id => {

        const asset =
          corporations.find(
            x => x.id === id
          );

        if(
          !asset ||
          state.corporations[
            asset.id
          ] ||
          !Core.spendMoney(
            asset.cost
          )
        ){
          return false;
        }

        state.corporations[
          asset.id
        ] = true;

        recalcIncome();
        save();

        Core.playSound('buy');
        Core.haptic('heavy');

        return true;
      },

    getTotalCorporationIncome:
      () => {
        passive();

        return Number(
          state.economy
            .incomePerSecond
        ) || 0;
      },

    getIncomePerSecond:
      () => {
        return Core
          .getTotalCorporationIncome();
      },

    isItemUnlocked:
      (category, id, cost) => {

        return (
          Number(cost) === 0 ||
          localStorage.getItem(
            `unlocked_${category}_${id}`
          ) === 'true'
        );
      },

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
      },

    /*
     * =====================================================
     * THEME
     * =====================================================
     */

    getTheme: () =>
      localStorage.getItem(
        'freezzzTheme'
      ) || 'dark',

    setTheme: theme => {
      localStorage.setItem(
        'freezzzTheme',
        theme
      );

      Core.applyTheme(theme);
    },

    applyTheme: theme => {
      try{
        document.documentElement
          .setAttribute(
            'data-theme',
            theme || 'dark'
          );

        if(document.body){
          document.body.setAttribute(
            'data-theme',
            theme || 'dark'
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

    /*
     * =====================================================
     * LANGUAGE
     * =====================================================
     */

    getLang: () =>
      localStorage.getItem(
        'freezzzLang'
      ) ||
      state.settings.language ||
      'ru',

    setLang: lang => {

      lang =
        ['ru','de','en']
          .includes(lang)
          ? lang
          : 'ru';

      localStorage.setItem(
        'freezzzLang',
        lang
      );

      state.settings.language =
        lang;

      save();

      return lang;
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

    /*
     * =====================================================
     * SOUND
     * =====================================================
     */

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

      state.settings.sound =
        next;

      save();

      return next;
    },

    playSound: type => {

      if(
        !Core.getSound()
      ){
        return;
      }

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

        gain.gain.value = .025;

        gain.gain.exponentialRampToValueAtTime(
          .001,
          Core.audioCtx.currentTime + .1
        );

        oscillator.connect(gain);

        gain.connect(
          Core.audioCtx.destination
        );

        oscillator.start();

        oscillator.stop(
          Core.audioCtx.currentTime + .1
        );

      }catch(e){}
    },

    haptic: strength => {

      try{

        if(
          !state.settings.vibration
        ){
          return;
        }

        window.Telegram?.WebApp
          ?.HapticFeedback
          ?.impactOccurred(
            strength || 'light'
          );

      }catch(e){}
    },

    /*
     * =====================================================
     * ECONOMY
     * =====================================================
     */

    getEconomy: () => {

      passive();

      return {
        money:
          Number(
            state.player.money
          ) || 0,

        energy:
          Number(
            state.player.energy
          ) || 0,

        incomePerSecond:
          Number(
            state.economy
              .incomePerSecond
          ) || 0,

        energyPerSecond:
          Number(
            state.economy
              .energyPerSecond
          ) || 0,

        totalEarned:
          Number(
            state.player
              .totalEarned
          ) || 0,

        totalSpent:
          Number(
            state.player
              .totalSpent
          ) || 0
      };
    },

    getChannel: () => ({
      ...state.channel
    }),

    setChannel: data => {

      state.channel = merge(
        state.channel,
        data || {}
      );

      recalcIncome();
      save();

      return state.channel;
    },

    addViews: value => {

      value =
        Math.max(
          0,
          Number(value) || 0
        );

      state.channel.views += value;

      save();

      return state.channel.views;
    },

    addSubscribers: value => {

      value =
        Math.max(
          0,
          Number(value) || 0
        );

      state.channel.subscribers +=
        value;

      recalcIncome();
      save();

      return state.channel.subscribers;
    }
  };

  /*
   * =========================================================
   * GAME STATE
   * =========================================================
   */

  window.Core = Core;

  window.GameState = {

    DEFAULT_STATE:
      clone(DEFAULT),

    getState:
      () => state,

    resetState: () => {

      state = clone(DEFAULT);

      state.economy.lastUpdate =
        Date.now();

      save();

      dispatchCustomizationChange();

      return state;
    },

    replaceState: data => {

      state =
        merge(
          clone(DEFAULT),
          data || {}
        );

      syncProgress();
      recalcIncome();
      save();

      dispatchCustomizationChange();

      return true;
    },

    get: (path, fallback = null) => {

      const value =
        path
          .split('.')
          .reduce(
            (obj, key) =>
              obj == null
                ? undefined
                : obj[key],
            state
          );

      return value ?? fallback;
    },

    set: (path, value) => {

      const parts =
        path.split('.');

      let obj = state;

      for(
        let i = 0;
        i < parts.length - 1;
        i++
      ){

        if(
          !obj[parts[i]] ||
          typeof obj[parts[i]] !==
            'object'
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

      dispatchCustomizationChange();

      return value;
    }
  };

  /*
   * =========================================================
   * GAME ECONOMY COMPATIBILITY API
   * =========================================================
   */

  window.GameEconomy = {

    update:
      now =>
        passive(now),

    addMoney:
      Core.addMoney,

    spendMoney:
      Core.spendMoney,

    canAfford:
      value =>
        Core.getMoney() >=
        Number(value),

    getMoney:
      Core.getMoney,

    getEnergy:
      Core.getEnergy,

    getIncomePerSecond:
      Core.getIncomePerSecond,

    getEnergyPerSecond:
      () =>
        Number(
          state.economy
            .energyPerSecond
        ) || 0,

    getTrendMultiplier:
      () => 1,

    getTotalCorporationIncome:
      Core.getTotalCorporationIncome
  };

  /*
   * =========================================================
   * INITIALIZATION
   * =========================================================
   */

  state.economy.lastUpdate =
    Number(
      state.economy.lastUpdate
    ) || Date.now();

  syncProgress();
  recalcIncome();
  passive();

  Core.applyTheme(
    Core.getTheme()
  );

  window.addEventListener(
    'storage',
    event => {

      if(
        event.key ===
          'tube_empire_state_v1' ||
        event.key ===
          'tube_empire_avatar_config' ||
        event.key ===
          'tube_empire_pet_v1' ||
        event.key ===
          'tube_empire_channel_avatar_v1' ||
        event.key ===
          'tube_empire_money_color_v1' ||
        event.key ===
          'tube_empire_studio_button_color_v1' ||
        event.key ===
          'tube_empire_quick_button_color_v1'
      ){

        try{

          const raw =
            localStorage.getItem(
              STATE_KEY
            );

          if(raw){
            state =
              merge(
                clone(DEFAULT),
                JSON.parse(raw)
              );
          }

        }catch(e){}

        dispatchCustomizationChange();
      }
    }
  );

  document.addEventListener(
    'visibilitychange',
    () => {

      if(
        document.visibilityState ===
        'visible'
      ){

        passive();
        dispatchCustomizationChange();
      }
    }
  );

  window.addEventListener(
    'beforeunload',
    save
  );

})();
