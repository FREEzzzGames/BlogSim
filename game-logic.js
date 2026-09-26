// game-logic.js — Игровая логика и конфигурация студии
const GameConfig = {
  cfg: [
    {id:'wagon',base:100,slots:3,mult:1.25,type:'housing'},
    {id:'dorm',base:800,slots:10,mult:1.3,type:'housing'},
    {id:'azubi',base:25,inc:0.1,eng:0.05,mult:1.12,type:'worker'},
    {id:'elektrik',base:150,inc:0.4,eng:0.1,mult:1.15,type:'worker'},
    {id:'brigade',base:1200,inc:2,eng:0.8,mult:1.18,type:'worker'},
    {id:'wind',base:9500,inc:14,eng:8.5,req:2,mult:1.2,type:'station'},
    {id:'solar',base:120000,inc:110,eng:65,req:8,mult:1.22,type:'station'},
    {id:'aes',base:1500000,inc:850,eng:450,req:30,mult:1.25,type:'station'}
  ],

  getUpgrades() {
    return this.cfg.map(c => {
      let cnt = Number(localStorage.getItem("up_" + c.id) || 0), cost = c.base;
      for(let i=0; i<cnt; i++) cost = Math.floor(cost * c.mult);
      return {...c, count: cnt, cost};
    });
  },

  getHousingStats(ups) {
    let tot = 0, used = 0; 
    ups.forEach(u => {
      if(u.type === 'housing') tot += u.count * u.slots;
      if(u.type === 'worker') used += u.count;
    });
    return {tot, used};
  },

  calculateStudioIncome(ups) {
    let eur = 0, eng = 0, h = this.getHousingStats(ups), tm = Economy.getTrendMultiplier();
    ups.forEach(u => {
      if(u.type === 'worker'){ eur += u.inc * u.count; eng += u.eng * u.count; }
      else if(u.type === 'station'){
        let req = u.req * u.count, eff = req > 0 ? Math.min(1, h.used / req) : 1;
        if(h.used === 0 && req > 0) eff = 0.1;
        eur += u.inc * u.count * eff; eng += u.eng * u.count * eff;
      }
    });
    eur += Economy.getTotalCorporationIncome();
    return {eur: eur * tm, eng: eng * tm};
  }
};
