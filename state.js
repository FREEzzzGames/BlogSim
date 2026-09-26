(function(){'use strict';
  if(window.GameState && window.GameState.getState){
    window.GameState.DEFAULT_STATE=window.GameState.DEFAULT_STATE||window.Core?.getState?.();
    return;
  }
  const KEY='tube_empire_state_v1';
  const D={version:2,player:{id:null,name:'Player',username:'',level:1,xp:0,money:1000,energy:100,totalEarned:0,totalSpent:0},economy:{incomePerSecond:0,energyPerSecond:0,lastUpdate:Date.now()},upgrades:{},assets:{},corporations:{},channel:{views:0,subscribers:0,xp:0,viralUntil:0,history:[]},avatar:{gender:0,head:0,torso:0,legs:0,accessory:0},studio:{walls:0,neon:0,poster:0,pet:0},settings:{language:'ru',sound:true,vibration:true}};
  let state=D;try{const r=localStorage.getItem(KEY);if(r)state={...D,...JSON.parse(r)}}catch(e){}
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state)); const getState=()=>state; const get=(p,f=null)=>p.split('.').reduce((o,k)=>o==null?undefined:o[k],state)??f; const set=(p,v)=>{const a=p.split('.');let o=state;for(let i=0;i<a.length-1;i++){o=o[a[i]]||(o[a[i]]={})}o[a[a.length-1]]=v;save()};
  window.GameState={DEFAULT_STATE:D,getState,replaceState:n=>{state={...D,...n};save();return true},resetState:()=>{state=JSON.parse(JSON.stringify(D));save();return state},get,set};
})();
