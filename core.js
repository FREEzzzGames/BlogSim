// Tube Empire Core — single source of truth for economy, progress and settings
(function(){
  'use strict';

  const STATE_KEY = 'tube_empire_state_v1';
  const LEGACY_MONEY = 'zeitarbeitMoney';
  const LEGACY_ENERGY = 'zeitarbeitEnergy';

  const DEFAULT = {
    version: 3,
    player: {
      id:null, name:'Player', username:'', level:1, xp:0,
      money:1000, energy:100, totalEarned:0, totalSpent:0
    },
    economy: {
      incomePerSecond:0, energyPerSecond:1, lastUpdate:Date.now()
    },
    upgrades:{},
    assets:{},
    corporations:{},
    channel:{
      views:0, subscribers:0, xp:0, viralUntil:0, viralMultiplier:1, history:[]
    },
    avatar:{gender:0,head:0,torso:0,legs:0,accessory:0},
    studio:{walls:0,neon:0,poster:0,pet:0},
    settings:{language:localStorage.getItem('freezzzLang')||'ru',sound:localStorage.getItem('freezzzSound')!=='false',vibration:true}
  };

  const clone = o => JSON.parse(JSON.stringify(o));

  function merge(base, src){
    if(!src || typeof src !== 'object') return base;
    Object.keys(src).forEach(k=>{
      if(src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && base[k] && typeof base[k] === 'object'){
        merge(base[k], src[k]);
      } else {
        base[k] = src[k];
      }
    });
    return base;
  }

  let state;
  try{
    const raw = localStorage.getItem(STATE_KEY);
    state = raw ? merge(clone(DEFAULT), JSON.parse(raw)) : clone(DEFAULT);
    if(!raw){
      const legacyMoney = Number(localStorage.getItem(LEGACY_MONEY));
      const legacyEnergy = Number(localStorage.getItem(LEGACY_ENERGY));
      if(Number.isFinite(legacyMoney)) state.player.money = legacyMoney;
      if(Number.isFinite(legacyEnergy)) state.player.energy = legacyEnergy;
    }
  }catch(e){
    state = clone(DEFAULT);
  }

  function save(){
    try{
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
      // Compatibility with older pages/builds.
      localStorage.setItem(LEGACY_MONEY, String(state.player.money));
      localStorage.setItem(LEGACY_ENERGY, String(state.player.energy));
    }catch(e){}
  }

  const corporations = [
    {id:'media_hub',icon:'🏢',cost:5000,incomePerSec:1,name:{ru:'Медиа-хаб',de:'Media-Hub',en:'Media Hub'}},
    {id:'creator_agency',icon:'📡',cost:25000,incomePerSec:6,name:{ru:'Creator Agency',de:'Creator-Agentur',en:'Creator Agency'}},
    {id:'production_house',icon:'🎥',cost:120000,incomePerSec:30,name:{ru:'Продакшн-хаус',de:'Produktionshaus',en:'Production House'}},
    {id:'media_network',icon:'🌐',cost:750000,incomePerSec:180,name:{ru:'Медиа-сеть',de:'Mediennetzwerk',en:'Media Network'}},
    {id:'global_platform',icon:'🚀',cost:5000000,incomePerSec:900,name:{ru:'Глобальная платформа',de:'Globale Platform',en:'Global Platform'}}
  ];

  function syncProgress(){
    const channelXp = Math.max(0, Number(state.channel?.xp) || 0);
    state.player.xp = channelXp;
    state.player.level = Math.max(1, Math.floor(channelXp / 100) + 1);
  }

  function recalcIncome(){
    const corpIncome = corporations.reduce((sum,a)=>sum+(state.corporations[a.id] ? a.incomePerSec : 0),0);
    const subs = Math.max(0, Number(state.channel?.subscribers) || 0);
    const viral = Number(state.channel?.viralUntil || 0) > Date.now() ? 2 : 1;
    state.economy.incomePerSecond = corpIncome + (subs / 1000) * viral;
    state.economy.energyPerSecond = 1;
  }

  function passive(now=Date.now()){
    syncProgress();
    recalcIncome();
    const last = Number(state.economy.lastUpdate) || now;
    const sec = Math.max(0, Math.min(86400, (now-last)/1000));
    if(sec <= 0) return {income:0,energy:0,elapsed:0};

    const income = Math.max(0, Number(state.economy.incomePerSecond) || 0) * sec;
    const energy = Math.max(0, Number(state.economy.energyPerSecond) || 0) * sec;
    state.player.money += income;
    state.player.totalEarned += income;
    state.player.energy = Math.max(0, Math.min(100, state.player.energy + energy));
    state.economy.lastUpdate = now;
    save();
    return {income,energy,elapsed:sec};
  }

  // Apply current derived values once when a page opens.
  state.economy.lastUpdate = Number(state.economy.lastUpdate) || Date.now();
  syncProgress();
  recalcIncome();
  passive();

  function get(path, fallback=null){
    const value = path.split('.').reduce((o,k)=>o==null?undefined:o[k],state);
    return value ?? fallback;
  }

  function set(path, value){
    const parts = path.split('.');
    let obj = state;
    for(let i=0;i<parts.length-1;i++){
      if(!obj[parts[i]] || typeof obj[parts[i]] !== 'object') obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length-1]] = value;
    syncProgress();
    recalcIncome();
    save();
    return value;
  }

  const avatars = ['👦','👧','🧑‍💻','🧑‍🎤','🥷','🤖','🦊','🧛','👻','👽','🚀','👑','😇','🧠','🦁'];


  // =========================================================
  // SHARED STUDIO CUSTOMIZATION
  // Three independent rainbow color palettes:
  // 1) Main-menu Studio button
  // 2) Quick Publication button
  // 3) Money numbers
  // Each has 2 free + 5 paid.
  // =========================================================
  const COLOR_PALETTE = [
    {id:'white',  name:'Белый',     color:'#f5f7fa', price:0},
    {id:'red',    name:'Красный',   color:'#ff3348', price:0},
    {id:'orange', name:'Оранжевый', color:'#ff8a2a', price:0},
    {id:'yellow', name:'Жёлтый',    color:'#ffd21f', price:500},
    {id:'green',  name:'Зелёный',   color:'#38d979', price:1500},
    {id:'cyan',   name:'Голубой',   color:'#24c7e8', price:4000},
    {id:'blue',   name:'Синий',     color:'#4287ff', price:10000},
    {id:'violet', name:'Фиолетовый',color:'#a65cff', price:25000},
    {id:'pink',   name:'Розовый',   color:'#ff5ca8', price:15000},
    {id:'silver', name:'Серебро',   color:'#b9c4ce', price:25000}
  ];

  const COLOR_KEYS = {
    studio:'tube_empire_studio_button_color_v1',
    quick:'tube_empire_quick_button_color_v1',
    money:'tube_empire_money_color_v1'
  };

  const CHANNEL_AVATAR_KEY = 'tube_empire_channel_avatar_v1';

  const channelAvatars = [
    {id:'play',    icon:'▶️', name:'PLAY',    price:0},
    {id:'star',    icon:'⭐', name:'STAR',    price:0},
    {id:'gamer',   icon:'🎮', name:'GAMER',   price:0},
    {id:'fire',    icon:'🔥', name:'FIRE',    price:1500},
    {id:'bolt',    icon:'⚡', name:'BOLT',    price:3000},
    {id:'rocket',  icon:'🚀', name:'ROCKET',  price:6000},
    {id:'crown',   icon:'👑', name:'CROWN',   price:10000},
    {id:'diamond', icon:'💎', name:'DIAMOND', price:20000},
    {id:'skull',   icon:'☠️', name:'SKULL',   price:35000},
    {id:'cyber',   icon:'🤖', name:'CYBER',   price:50000}
  ];

  const PETS = [
    {id:'cat',name:'Кот',icon:'🐱',price:0},
    {id:'dog',name:'Собака',icon:'🐶',price:1000},
    {id:'fox',name:'Лиса',icon:'🦊',price:2500},
    {id:'panda',name:'Панда',icon:'🐼',price:5000},
    {id:'dragon',name:'Дракон',icon:'🐉',price:10000},
    {id:'lizard',name:'Ящерица',icon:'🦎',price:15000},
    {id:'turtle',name:'Черепаха',icon:'🐢',price:20000},
    {id:'crocodile',name:'Крокодил',icon:'🐊',price:30000},
    {id:'parrot',name:'Попугай',icon:'🦜',price:40000},
    {id:'raccoon',name:'Енот',icon:'🦝',price:60000}
  ];
  const PET_KEY='tube_empire_pet_v1';

  function emitChange(type){
    try{window.dispatchEvent(new CustomEvent('tubeEmpireChange',{detail:{type}}));}catch(e){}
  }

  function normalizeStudioConfig(src){
    const d={moneyColor:0,pet:0,studioButton:0,quickButton:0,channelAvatar:0};
    const x=src&&typeof src==='object'?src:{};
    Object.keys(d).forEach(k=>{
      const n=Number(x[k]);
      d[k]=Number.isFinite(n)&&n>=0?Math.floor(n):d[k];
    });
    return d;
  }

  function readOwnedMap(key){
    try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}
    catch(e){return {}}
  }

  function writeOwnedMap(key,map){
    localStorage.setItem(key,JSON.stringify(map));
  }

  function getColorTheme(kind){
    const key=COLOR_KEYS[kind];
    const index=Math.max(0,Math.min(COLOR_PALETTE.length-1,
      Number(localStorage.getItem(key))||0));
    return {...COLOR_PALETTE[index],index};
  }

  function getColorThemes(kind){
    const key=COLOR_KEYS[kind];
    const owned=readOwnedMap(key+'_owned');
    return COLOR_PALETTE.map((x,i)=>({
      ...x,index:i,
      owned:x.price===0 || !!owned[i]
    }));
  }

  function buyColorTheme(kind,index){
    const key=COLOR_KEYS[kind];
    const item=COLOR_PALETTE[Number(index)];
    if(!item) return false;

    const owned=readOwnedMap(key+'_owned');

    if(item.price===0 || owned[index]){
      localStorage.setItem(key,String(index));
      return true;
    }

    if(!Core.spendMoney(item.price)) return false;

    owned[index]=true;
    writeOwnedMap(key+'_owned',owned);
    localStorage.setItem(key,String(index));
    return true;
  }

  function getChannelAvatars(){
    const owned=readOwnedMap(CHANNEL_AVATAR_KEY+'_owned');
    return channelAvatars.map((x,i)=>({
      ...x,index:i,
      owned:x.price===0 || !!owned[i]
    }));
  }

  function buyChannelAvatar(index){
    index=Number(index);
    const item=channelAvatars[index];
    if(!item) return false;

    const owned=readOwnedMap(CHANNEL_AVATAR_KEY+'_owned');

    if(item.price===0 || owned[index]){
      localStorage.setItem(CHANNEL_AVATAR_KEY,String(index));
      return true;
    }

    if(!Core.spendMoney(item.price)) return false;    owned[index]=true;
    writeOwnedMap(CHANNEL_AVATAR_KEY+'_owned',owned);
    localStorage.setItem(CHANNEL_AVATAR_KEY,String(index));

    return true;
  }

  function getChannelAvatar(){
    const i=Math.max(0,Math.min(channelAvatars.length-1,
      Number(localStorage.getItem(CHANNEL_AVATAR_KEY))||0));
    return channelAvatars[i];
  }

  const Core = {
    getState:()=>state,
    save,
    sync:()=>passive(),
    getMoney:()=>{ passive(); return Number(state.player.money)||0; },
    setMoney:v=>{ state.player.money=Math.max(0,Number(v)||0); save(); },
    addMoney:v=>{
      v=Number(v);
      if(!Number.isFinite(v) || v<=0) return false;
      passive();
      state.player.money += v;
      state.player.totalEarned += v;
      save();
      return true;
    },
    spendMoney:v=>{
      v=Number(v);
      passive();
      if(!Number.isFinite(v) || v<=0 || state.player.money<v) return false;
      state.player.money -= v;
      state.player.totalSpent += v;
      save();
      return true;
    },
    getEnergy:()=>{ passive(); return Number(state.player.energy)||0; },
    setEnergy:v=>{ state.player.energy=Math.max(0,Math.min(100,Number(v)||0)); save(); },
    getLevel:()=>{ syncProgress(); return state.player.level; },
    getXP:()=>{ syncProgress(); return state.player.xp; },
    addXP:v=>{
      v=Number(v)||0;
      if(v<=0) return false;
      state.channel.xp = Math.max(0,Number(state.channel.xp)||0)+v;
      syncProgress();
      save();
      return true;
    },
    getColorThemes:kind=>getColorThemes(kind),
    getColorTheme:kind=>getColorTheme(kind),
    buyColorTheme:(kind,index)=>buyColorTheme(kind,index),
    getChannelAvatars:()=>getChannelAvatars(),
    getChannelAvatar:()=>getChannelAvatar(),
    buyChannelAvatar:index=>buyChannelAvatar(index),
    getPets:()=>{const owned=readOwnedMap(PET_KEY+'_owned');return PETS.map((x,i)=>({...x,index:i,owned:x.price===0||!!owned[i]}))},
    getPet:()=>PETS[Math.max(0,Math.min(PETS.length-1,Number(localStorage.getItem(PET_KEY))||0))],
    buyPet:index=>{
      index=Number(index);const item=PETS[index];if(!item)return false;
      const owned=readOwnedMap(PET_KEY+'_owned');
      if(item.price===0||owned[index]){localStorage.setItem(PET_KEY,String(index));emitChange('pet');return true}
      if(!Core.spendMoney(item.price))return false;
      owned[index]=true;writeOwnedMap(PET_KEY+'_owned',owned);localStorage.setItem(PET_KEY,String(index));emitChange('pet');return true;
    },
    getAvatarConfig:()=>{try{return JSON.parse(localStorage.getItem('tube_empire_avatar_config')||'{}')}catch(e){return {}}},
    setAvatarConfig:a=>{localStorage.setItem('tube_empire_avatar_config',JSON.stringify(a||{}));state.avatar=clone(a||{});save();emitChange('avatar');return true},
    getStudioConfig:()=>{try{return normalizeStudioConfig(JSON.parse(localStorage.getItem('tube_empire_studio_config')||'null')||state.studio)}catch(e){return normalizeStudioConfig(state.studio)}},
    setStudioConfig:s=>{const normalized=normalizeStudioConfig(s);localStorage.setItem('tube_empire_studio_config',JSON.stringify(normalized));state.studio={...state.studio,...normalized};save();emitChange('studio');return true},
    getMoneyColor:()=>getColorTheme('money'),
    getStudioButtonColor:()=>getColorTheme('studio'),
    getQuickButtonColor:()=>getColorTheme('quick'),

    getTheme:()=>localStorage.getItem('freezzzTheme')||'dark',
    setTheme:t=>{localStorage.setItem('freezzzTheme',t);Core.applyTheme(t)},
    applyTheme:t=>{try{document.documentElement.setAttribute('data-theme',t||'dark');if(document.body)document.body.setAttribute('data-theme',t||'dark')}catch(e){}},
    toggleTheme:()=>{const n={dark:'rose',rose:'light',light:'dark'}[Core.getTheme()]||'dark';Core.setTheme(n);return n},
    getLang:()=>localStorage.getItem('freezzzLang')||state.settings.language||'ru',
    setLang:l=>{l=['ru','de','en'].includes(l)?l:'ru';localStorage.setItem('freezzzLang',l);state.settings.language=l;save()},
    toggleLang:()=>{const n={ru:'de',de:'en',en:'ru'}[Core.getLang()];Core.setLang(n);return n},
    getSound:()=>localStorage.getItem('freezzzSound')!=='false',
    toggleSound:()=>{const n=!Core.getSound();localStorage.setItem('freezzzSound',String(n));state.settings.sound=n;save();return n},
    playSound:type=>{
      if(!Core.getSound()) return;
      try{
        if(!Core.audioCtx) Core.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
        if(Core.audioCtx.state==='suspended') Core.audioCtx.resume();
        const o=Core.audioCtx.createOscillator(),g=Core.audioCtx.createGain();
        const f=type==='buy'?740:type==='cash'?880:type==='error'?140:520;
        o.type=type==='error'?'sawtooth':'square';
        o.frequency.value=f;g.gain.value=.025;
        g.gain.exponentialRampToValueAtTime(.001,Core.audioCtx.currentTime+.1);
        o.connect(g);g.connect(Core.audioCtx.destination);o.start();o.stop(Core.audioCtx.currentTime+.1);
      }catch(e){}
    },
    haptic:s=>{if(!state.settings.vibration)return;try{window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(s||'light')}catch(e){}},
    getUserName:def=>'anonymous'===def?def:(state.player.name&&state.player.name!=='Player'?state.player.name:(localStorage.getItem('tube_empire_custom_name')||window.Telegram?.WebApp?.initDataUnsafe?.user?.username&&'@'+window.Telegram.WebApp.initDataUnsafe.user.username||window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name||def||'Blogger')),
    setUserName:name=>{const value=String(name??'').trim().slice(0,32);if(!value)return false;state.player.name=value;localStorage.setItem('tube_empire_custom_name',value);save();emitChange('name');return true},
    getAvatarString:()=>{
      try{
        const a=JSON.parse(localStorage.getItem('tube_empire_avatar_config')||'{}');

        // Same five-part avatar database as avatar_rebuilt_v10_sync.html.
        // Empty headwear stays truly transparent.
        const parts={
          gender:[
            '👦','👧','👨','👩','🧑','🧔','👱‍♂️','👱‍♀️','👨‍🦰','👩‍🦰',
            '👨‍🦱','👩‍🦱','👨‍🦳','👩‍🦳','👨‍🦲','👩‍🦲','🧑‍🦰','🧑‍🦱','🧑‍🦳','🧑‍🦲'
          ],
          head:[
            '','','🧢','🎧','🕶️','👓','🤓','🎩','👒','🪖',
            '⛑️','👑','🧢','🎩','👓','🕶️','🎧','👒','🪖','⛑️'
          ],
          torso:[
            '👕','👕','👕','🧥','🧥','👔','👔','🥼','🥼','👚',
            '👚','🧥','🦺','🥋','🧥','👕','👔','🥼','👚','🦺'
          ],
          legs:[
            '👖','👖','👖','🩳','🩳','🩳','👗','👗','🥻','🥻',
            '👖','🩳','👖','🩳','👗','🥻','👖','🩳','👗','👖'
          ],
          accessory:[
            '❌','🎙️','📷','📱','🎮','🎧','⌚','💻','🕶️','🎤',
            '🎙️','📷','📱','🎮','🎧','⌚','💻','🕶️','🎤','🎙️'
          ]
        };

        const pick=(key)=>{
          const i=Math.max(0,Math.min(parts[key].length-1,Number(a[key])||0));
          const v=parts[key][i];
          return v==='❌'?'':v;
        };

        return `${pick('gender')}${pick('head')}${pick('torso')}${pick('legs')}${pick('accessory')}` || '👦';
      }catch(e){
        return avatars[0];
      }
    },
    getCorporationAssets:()=>corporations.map(a=>({...a})),
    isAssetOwned:id=>!!state.corporations[id],
    buyCorporationAsset:id=>{
      const a=corporations.find(x=>x.id===id);
      if(!a || state.corporations[id] || !Core.spendMoney(a.cost)) return false;
      state.corporations[id]=true;
      recalcIncome();
      save();
      Core.playSound('buy');
      Core.haptic('heavy');
      return true;
    },
    getTotalCorporationIncome:()=>{passive();return Number(state.economy.incomePerSecond)||0},
    isItemUnlocked:(c,id,cost)=>cost===0||localStorage.getItem(`unlocked_${c}_${id}`)==='true',
    unlockItem:(c,id,cost)=>{if(Core.isItemUnlocked(c,id,cost))return true;if(Core.spendMoney(cost)){localStorage.setItem(`unlocked_${c}_${id}`,'true');return true}return false}
  };

  const SYNC_KEYS=new Set([STATE_KEY,'tube_empire_avatar_config','tube_empire_studio_config',COLOR_KEYS.money,COLOR_KEYS.studio,COLOR_KEYS.quick,COLOR_KEYS.money+'_owned',COLOR_KEYS.studio+'_owned',COLOR_KEYS.quick+'_owned',CHANNEL_AVATAR_KEY,CHANNEL_AVATAR_KEY+'_owned',PET_KEY,PET_KEY+'_owned','tube_empire_custom_name']);
  window.addEventListener('storage',e=>{if(!e.key||SYNC_KEYS.has(e.key))emitChange('storage')});

  window.Core = Core;
  window.GameState = {
    DEFAULT_STATE:clone(DEFAULT),
    getState:()=>state,
    resetState:()=>{state=clone(DEFAULT);state.economy.lastUpdate=Date.now();save();return state},
    replaceState:n=>{state=merge(clone(DEFAULT),n||{});syncProgress();recalcIncome();save();return true},
    get,
    set
  };
  window.GameEconomy = {
    update:now=>passive(now),
    addMoney:Core.addMoney,
    spendMoney:Core.spendMoney,
    canAfford:v=>Core.getMoney()>=Number(v),
    getMoney:Core.getMoney,
    getEnergy:Core.getEnergy,
    getIncomePerSecond:()=>Core.getTotalCorporationIncome(),
    getEnergyPerSecond:()=>Number(state.economy.energyPerSecond)||0,
    getTrendMultiplier:()=>1,
    getTotalCorporationIncome:Core.getTotalCorporationIncome
  };

  Core.applyTheme(Core.getTheme());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') passive()});
  window.addEventListener('beforeunload',save);
})();
