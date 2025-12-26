  var rnd=function(n){return Math.floor(Math.random()*n);};
  var sample=function(a){return a.length?a[rnd(a.length)]:undefined;};
  var shuffle=function(a){return a.map(function(v){return [Math.random(),v];}).sort(function(x,y){return x[0]-y[0];}).map(function(z){return z[1];});};
  var clamp=function(n,min,max){return Math.max(min,Math.min(max,n));};
  var IMG_BLANK="BlankProfile.webp";
  var ROW_COLORS=["#82cfff","#ffb86b","#ff6e6e","#7af27a","#c792ea","#ffd86e","#6ee7ff","#ffa0c8","#9dd79d","#f4a261","#5eead4","#b39ddb","#f59e0b","#8bd3dd"];

  (function normalizePlayers(){
    if(Array.isArray(window.PLAYERS)&&window.PLAYERS.length) return;
    var src=window.PLAYERS||window.players||window.player_data||[];
    if(!Array.isArray(src)||src.length===0){
      var pd=window.playerData;
      if(pd&&(Array.isArray(pd.males)||Array.isArray(pd.females)||Array.isArray(pd.others))){
        var tag=function(arr,gender){
          return (Array.isArray(arr)?arr:[]).map(function(p){
return {
  id: p.id,
  name: p.name,
  nickname: p.nickname || p.name || p.id,

  show: p.show || (Array.isArray(p.shows) && p.shows.length ? p.shows[0] : ""),
  season: p.season,

  shows: p.shows || null,
  seasonsByShow: p.seasonsByShow || null,

  gender: gender || p.gender || "unknown",
  image: p.image || (p.id ? ("././contestant_pictures/" + p.id + ".webp") : IMG_BLANK)
};
          });
        };
        src=[].concat(tag(pd.males,"male"),tag(pd.females,"female"),tag(pd.others,null));
      } else { src=[]; }
    }
    window.PLAYERS=src;
    window.PLAYERS_BY_ID=Object.fromEntries(src.map(function(p){return [p.id,p];}));
  })();

  var KEY="challenge-free-agents-season";
  var State={
    load:function(){try{return JSON.parse(sessionStorage.getItem(KEY))||null;}catch(e){return null;}},
    save:function(s){sessionStorage.setItem(KEY,JSON.stringify(s));},
    clear:function(){sessionStorage.removeItem(KEY);}
  };

  var state=State.load()||{
    seed:Math.random().toString(36).slice(2,8).toUpperCase(),
    cast:Array.from({length:28}).map(function(){return null;}),
    players:[],
    relationships:{},
    profiles:{},
    episodes:{},
    ui:{},
    stats:{dailyWins:{},elimWins:{},elimPlays:{},draws:{},killCards:{}},
    placements:{winners:{male:null,female:null},second:{male:null,female:null},third:{male:null,female:null},eliminated:[]},
    finalRanks:{male:[],female:[]},
    chart:{finalized:false,episodes:{}},
    simulated:false,
    lastView:null
  };

  var elMales=document.getElementById("teams-grid-males");
  var elFemales=document.getElementById("teams-grid-females");
  var elFilterShow=document.getElementById("filter-show");
  var elDataWarn=document.getElementById("data-warning");
  var elInfoCast=document.getElementById("info-cast-size");
  var elInfoSeed=document.getElementById("info-seed");
  var elInfoStatus=document.getElementById("info-status");
  var elAccordion=document.getElementById("episode-accordion");
  var viewCast=document.getElementById("view-cast");
  var viewEpisode=document.getElementById("view-episode");
  var epTitle=document.getElementById("ep-title");
  var epSub=document.getElementById("ep-subtitle");
  var epContent=document.getElementById("ep-content");
  var epActions=document.getElementById("ep-actions");
  var statsPanel=document.getElementById("stats-panel");
  var timesPanel=document.getElementById("times-panel");
  var timesClose=document.getElementById("times-close");
  var timesTable=document.getElementById("times-table");
  timesClose.onclick=function(){timesPanel.close();};

document.getElementById("btn-back-cast").onclick = function(e){
  e.preventDefault();

  var prevCast = (state.cast || []).slice();
  var prevProfiles = state.profiles || {};
  var prevRelationships = state.relationships || {};
  state = {
    seed: Math.random().toString(36).slice(2,8).toUpperCase(),
    cast: prevCast,
    players: [],
    relationships: prevRelationships,
    profiles: prevProfiles,
    episodes: {},
    ui: {},
    stats: { dailyWins:{}, elimWins:{}, elimPlays:{}, draws:{}, killCards:{} },
    placements: { winners:{male:null,female:null}, second:{male:null,female:null}, third:{male:null,female:null}, eliminated:[] },
    finalRanks: { male:[], female:[] },
    chart: { finalized:false, episodes:{} },
    simulated: false,
    lastView: null
  };

  State.save(state);

  elAccordion.innerHTML = "";
  viewEpisode.hidden = true;
  viewCast.hidden = false;

  elInfoStatus.textContent = "Not simulated";
  elInfoSeed.textContent = state.seed;

  statsPanel.style.display = "none";
  buildGrids(window.PLAYERS || []);
};

  document.getElementById("btn-reset-session").onclick=function(e){
    e.preventDefault();
    state={
      seed:Math.random().toString(36).slice(2,8).toUpperCase(),
      cast:Array.from({length:28}).map(function(){return null;}),
      players:[],
      relationships:{},
      profiles:{},
      episodes:{},
      ui:{},
      stats:{dailyWins:{},elimWins:{},elimPlays:{},draws:{},killCards:{}},
      placements:{winners:{male:null,female:null},second:{male:null,female:null},third:{male:null,female:null},eliminated:[]},
      finalRanks:{male:[],female:[]},
      chart:{finalized:false,episodes:{}},
      simulated:false,
      lastView:null
    };
    try{sessionStorage.removeItem(KEY);}catch(e){}
    elAccordion.innerHTML=""; viewEpisode.hidden=true; viewCast.hidden=false;
    elInfoStatus.textContent="Not simulated"; elInfoCast.textContent="0"; statsPanel.style.display="none";
    buildGrids(window.PLAYERS||[]);
  };

  (function init(){
    var src=window.PLAYERS||[];
    if(!Array.isArray(src)||!src.length){elDataWarn.style.display="block";return;}
    elDataWarn.style.display="none";
    buildFilterShows(src); buildGrids(src);
    elInfoSeed.textContent=state.seed;
    if(state.simulated){
      buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false;
      var last=state.lastView||{ep:1,section:"status"}; showEpisodeSection(last.ep,last.section);
      elInfoStatus.textContent="Simulated";
      elInfoCast.textContent=(state.players||[]).filter(function(p){return p.alive!==false;}).length;
      statsPanel.style.display="block";
    }
    document.getElementById("goto-placements").onclick=function(){showStatisticsPanel("placements");};
    document.getElementById("goto-stats").onclick=function(){showStatisticsPanel("other");};
    document.getElementById("goto-chart").onclick=function(){showStatisticsPanel("chart");};
  })();

function allShowsOf(p){
  if (Array.isArray(p.shows) && p.shows.length) return p.shows.filter(Boolean);
  return p.show ? [p.show] : [];
}

function playerHasShow(p, showName){
  if (!showName) return true;
  return allShowsOf(p).indexOf(showName) !== -1;
}

function buildFilterShows(roster){
  var showMap = {};
  (roster || []).forEach(function(p){
    allShowsOf(p).forEach(function(s){
      if (s) showMap[s] = true;
    });
  });
  var shows = Object.keys(showMap).sort();

  elFilterShow.innerHTML =
    '<option value="">— All Shows —</option>' +
    shows.map(function(s){
      return '<option value="'+s+'">'+s+'</option>';
    }).join("");

  elFilterShow.onchange = function(){ buildGrids(roster); };
}

  function asCastEntry(p){
    return {id:p.id,name:p.name||p.nickname||p.id,nickname:p.nickname||p.name||p.id,image:p.image||(p.id?("././contestant_pictures/"+p.id+".webp"):IMG_BLANK),gender:p.gender||"unknown",show:p.show||""};
  }
  function playerOptions(roster,selectedId,gender){
    var showFilter=elFilterShow.value;
var filtered = roster.filter(function(r){
  return (!gender || r.gender === gender) && (!showFilter || playerHasShow(r, showFilter));
});
    var opts=['<option value="">Choose</option>'];
    for(var i=0;i<filtered.length;i++){
      var r=filtered[i]; var sel=(selectedId&&r.id===selectedId)?" selected":""; opts.push('<option value="'+r.id+'"'+sel+'>'+ (r.name||r.nickname||r.id) +'</option>');
    }
    return opts.join('');
  }
  function makePickCard(slotIndex,gender){
    var slot=state.cast[slotIndex]||null;
    var html=
      '<img class="avatar" src="'+(slot?slot.image:IMG_BLANK)+'" alt="">'+
      '<div class="name">'+(slot?(slot.nickname):(gender==="male"?"Male Player":"Female Player"))+'</div>'+
      '<select class="pick-player" data-slot="'+slotIndex+'" data-gender="'+gender+'">'+ playerOptions(window.PLAYERS||[],slot?slot.id:"",gender) +'</select>'+
      '<button class="btn btn-custom" data-slot="'+slotIndex+'" type="button">Custom Player</button>';
    var div=document.createElement("div"); div.className="pick-card"; div.innerHTML=html; return div;
  }
  function buildGrids(roster){
    elMales.innerHTML=""; elFemales.innerHTML="";
    for(var i=0;i<14;i++) elMales.appendChild(makePickCard(i,"male"));
    for(var j=0;j<14;j++) elFemales.appendChild(makePickCard(14+j,"female"));
    document.querySelectorAll(".pick-player").forEach(function(sel){
      sel.onchange=function(e){
        var idx=+e.target.dataset.slot, id=e.target.value||"";
        if(!id){state.cast[idx]=null; State.save(state); return buildGrids(roster);}
        var p=(window.PLAYERS_BY_ID&&window.PLAYERS_BY_ID[id])||(roster.find(function(r){return r.id===id;})||null);
        if(!p) return;
        state.cast[idx]=asCastEntry(p); State.save(state); buildGrids(roster);
      };
    });
    document.querySelectorAll(".btn-custom").forEach(function(btn){
      btn.onclick=function(){openCustomModal(+btn.dataset.slot);};
    });
    elInfoCast.textContent=state.cast.filter(Boolean).length;
  }

  var modal=document.createElement("dialog");
  modal.className="antm-modal";
  modal.innerHTML=
    '<form id="custom-form" method="dialog" autocomplete="off">'+
      '<h3>Add Custom Player</h3>'+
      '<label>Full Name <input id="cp-name" required /></label>'+
      '<label>Nickname <input id="cp-nickname" required /></label>'+
      '<label>Image URL <input id="cp-image" placeholder="https://..." /></label>'+
      '<menu><button type="button" class="btn" id="modal-cancel">Cancel</button><button type="submit" class="btn">Add</button></menu>'+
    '</form>';
  document.body.appendChild(modal);
  function openCustomModal(slot){
    modal.showModal();
    var form=modal.querySelector("#custom-form");
    var cancel=modal.querySelector("#modal-cancel");
    form.onsubmit=function(ev){
      ev.preventDefault();
      var name=form.querySelector("#cp-name").value.trim();
      var nick=form.querySelector("#cp-nickname").value.trim();
      var img=form.querySelector("#cp-image").value.trim();
      if(!name||!nick) return;
      var id=nick.toLowerCase().replace(/[^a-z0-9]+/g,"_")+"_"+Date.now().toString(36);
      var cp={id:id,name:name,nickname:nick,gender:(slot<14?"male":"female"),show:"Custom",image:img||IMG_BLANK};
      state.cast[slot]=asCastEntry(cp); State.save(state); modal.close(); form.reset(); buildGrids(window.PLAYERS||[]);
    };
    cancel.onclick=function(){modal.close();};
  }

var randModal = document.createElement("dialog");
randModal.id = "randomize-modal";
randModal.className = "antm-modal";
randModal.innerHTML =
  '<form id="rand-form" method="dialog" autocomplete="off">' +
    '<h3>Randomize Cast</h3>' +
    '<div id="rand-show-list" style="display:flex;flex-direction:column;gap:6px;margin:10px 0;"></div>' +
    '<menu>' +
      '<button type="button" class="btn" id="rand-cancel">Cancel</button>' +
      '<button type="submit" class="btn">Randomize</button>' +
    '</menu>' +
  '</form>';
document.body.appendChild(randModal);

function buildRandomizeShowList(){
  var list = randModal.querySelector("#rand-show-list");
  var roster = window.PLAYERS || [];
  var showMap = {};
  (roster || []).forEach(function(p){
    (allShowsOf(p) || []).forEach(function(s){
      if (s) showMap[s] = true;
    });
  });
  var shows = Object.keys(showMap).sort();

  list.innerHTML = shows.map(function(show){
    return '' +
      '<label style="display:flex;align-items:center;gap:8px;">' +
        '<input type="checkbox" data-show="'+show+'">' +
        '<span style="min-width:140px;">'+show+'</span>' +
        '<input type="text" class="rand-seasons" data-show="'+show+'" ' +
          'placeholder="Seasons (e.g. 1, 3-4, 6)">' +
      '</label>';
  }).join("");
}

function seasonsForShow(p, showName){
  if (p.seasonsByShow && p.seasonsByShow[showName]){
    var s = p.seasonsByShow[showName];
    return Array.isArray(s) ? s : [s];
  }
  if (!p.show || p.show === showName){
    var s2 = p.season;
    if (s2 == null) return [];
    return Array.isArray(s2) ? s2 : [s2];
  }
  return [];
}

function playerMatchesPrefsForRandomize(p, prefs){
  if (!prefs || !Object.keys(prefs).length) return true;

  var playerShows = allShowsOf(p);
  for (var i = 0; i < playerShows.length; i++){
    var show = playerShows[i];
    var cfg = prefs[show];
    if (!cfg) continue;
    if (!cfg.seasons || !cfg.seasons.length) return true;

    var seasons = seasonsForShow(p, show);
    var lowerSeasons = seasons.map(function(s){ return String(s).toLowerCase(); });

    var ok = cfg.seasons.some(function(token){
      return lowerSeasons.some(function(s){
        return s.indexOf(token) !== -1;
      });
    });
    if (ok) return true;
  }
  return false;
}

function filterRosterByPrefs(prefs){
  var roster = (window.PLAYERS || []).slice();
  if (!prefs || !Object.keys(prefs).length) return roster;
  return roster.filter(function(p){ return playerMatchesPrefsForRandomize(p, prefs); });
}

function randomizeCastWithPrefsSplit(prefs){
  var roster = filterRosterByPrefs(prefs);
  var males = shuffle(roster.filter(function(p){ return p.gender === "male"; }));
  var females = shuffle(roster.filter(function(p){ return p.gender === "female"; }));

  if (males.length < 14 || females.length < 14){
    alert("Not enough males/females for a 28-player cast from the selected filters.");
    return;
  }

  state.cast = Array.from({length:28}).map(function(){ return null; });

  for (var i = 0; i < 14; i++) state.cast[i] = asCastEntry(males[i]);
  for (var j = 0; j < 14; j++) state.cast[14 + j] = asCastEntry(females[j]);

  State.save(state);
  buildGrids(window.PLAYERS || []);
}

function openRandomizeModal(){
  if (!window.PLAYERS || !window.PLAYERS.length){
    alert("No player data loaded (player_data.js).");
    return;
  }

  buildRandomizeShowList();
  randModal.showModal();

  var formRand = randModal.querySelector("#rand-form");
  var btnCancel = randModal.querySelector("#rand-cancel");

  formRand.onsubmit = function(ev){
    ev.preventDefault();

    var prefs = {};
    var checks = randModal.querySelectorAll('input[type="checkbox"][data-show]');
    checks.forEach(function(cb){
      if (!cb.checked) return;
      var show = cb.getAttribute("data-show");
      var input = randModal.querySelector('input.rand-seasons[data-show="'+show+'"]');
      var seasons = [];
      if (input && input.value.trim()){
        seasons = input.value
          .split(/[,]/)
          .map(function(s){ return s.trim().toLowerCase(); })
          .filter(Boolean);
      }
      prefs[show] = { seasons: seasons };
    });

    randModal.close();
    randomizeCastWithPrefsSplit(prefs);
  };

  btnCancel.onclick = function(){
    randModal.close();
  };
}

document.getElementById("btn-randomize").onclick = function(){
  openRandomizeModal();
};

  document.getElementById("btn-reset-cast").onclick=function(){
    state.cast=Array.from({length:28}).map(function(){return null;}); state.players=[]; State.save(state); buildGrids(window.PLAYERS||[]);
  };
  document.getElementById("btn-profiles").onclick=function(){location.href="./profiles.html";};
  document.getElementById("btn-relationships").onclick=function(){location.href="./relationships.html";};

  var relKey=function(a,b){return a<b?(a+"|"+b):(b+"|"+a);};
  function rel(a,b){return state.relationships[relKey(a,b)] ?? 0;}
  function skillOf(id,key){var s=state.profiles[id]?state.profiles[id][key]:0; return typeof s==="number"?clamp(s,-3,3):0;}
  function nameOf(id){var c=state.cast.find(function(x){return x&&x.id===id;}); return c?(c.nickname||c.name||id):id;}
  function picOf(id){var c=state.cast.find(function(x){return x&&x.id===id;}); return c?(c.image||IMG_BLANK):IMG_BLANK;}
  function genderOf(id){var c=state.cast.find(function(x){return x&&x.id===id;}); return (c&&c.gender)||"unknown";}

  function buildLeftAccordion(){
    elAccordion.innerHTML="";
    for(var e=1;e<=12;e++){
      var details=document.createElement("details"); details.className="details-ep"; if(e===1) details.open=true;
      var inner='<summary>Episode '+e+'</summary><div class="section-box"><div class="section-links">';
      if(e<=10){
        if(e===1) inner+='<button class="btn" data-ep="'+e+'" data-sec="format">Format</button>';
        inner+='<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events 1</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="daily">Daily Challenge</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="events2">House Events 2</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="voting">Voting</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="draw">The Draw</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="elimination">Elimination</button>';
      } else if(e===11){
        inner+='<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="draw_all">The Draw (All)</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="elimination">Elimination</button>';
      } else {
        inner+='<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="final1">Final Stage 1</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="final2">Final Stage 2</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="final3">Final Stage 3</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="final4">Final Stage 4</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="final5">Final Stage 5</button>'+
               '<button class="btn" data-ep="'+e+'" data-sec="final_results">Final Results</button>';
      }
      inner+="</div></div>"; details.innerHTML=inner; elAccordion.appendChild(details);
    }
    statsPanel.style.display=state.simulated?"block":"none";
    elAccordion.querySelectorAll(".section-links .btn").forEach(function(b){
      b.onclick=function(){
        elAccordion.querySelectorAll(".section-links button").forEach(function(x){x.classList.remove("active");});
        b.classList.add("active"); showEpisodeSection(+b.dataset.ep,b.dataset.sec);
      };
    });
  }
  function addProceed(ep,section){
    var order=(ep<=10)?(ep===1?["format","status","events1","daily","events2","voting","draw","elimination"]:["status","events1","daily","events2","voting","draw","elimination"])
                      :(ep===11?["status","events1","draw_all","elimination"]:["status","final1","final2","final3","final4","final5","final_results"]);
    var idx=order.indexOf(section);
    var btn=document.createElement("button"); btn.className="btn proceed"; btn.textContent="Proceed";
    if(idx>=0&&idx<order.length-1){btn.onclick=function(){showEpisodeSection(ep,order[idx+1]);};}
    else if(section==="elimination"&&ep<=10){btn.onclick=function(){showEpisodeSection(ep+1,"status");};}
    else if(section==="elimination"&&ep===11){btn.onclick=function(){showEpisodeSection(12,"status");};}
    else if(section==="final_results"){btn.onclick=function(){showStatisticsPanel("placements");};}
    epActions.appendChild(btn);
  }

  function aliveIds(g){return state.players.filter(function(p){return p.alive&&(!g||p.gender===g);}).map(function(p){return p.id;});}
  function scorePlayer(weights,pid){
    if(weights&&typeof weights==="object"&&!Array.isArray(weights)){
      var t=0; for(var k in weights){if(Object.prototype.hasOwnProperty.call(weights,k)){t+=(skillOf(pid,k)*(typeof weights[k]==="number"?weights[k]:1));}}
      return t;
    }
    if(Array.isArray(weights)){return weights.reduce(function(s,k){return s+(skillOf(pid,k)||0);},0);}
    return 0;
  }
  function makePairs(maleIds,femaleIds,avoidSet){
    maleIds=shuffle(maleIds.slice()); femaleIds=shuffle(femaleIds.slice());
    var out=[]; function key(a,b){return a<b?(a+"|"+b):(b+"|"+a);}
    while(maleIds.length&&femaleIds.length){
      var m=maleIds.shift(), f=null, pickIndex=-1;
      for(var i=0;i<femaleIds.length;i++){
        var cand=femaleIds[i];
        if(avoidSet && avoidSet.has(key(m,cand))) continue;
        f=cand; pickIndex=i; break;
      }
      if(f===null){f=femaleIds[0]; pickIndex=0;}
      femaleIds.splice(pickIndex,1); out.push([m,f]);
    }
    return out;
  }
  function groupTeamsRecipe(ids,recipe){
    var m=ids.filter(function(id){return genderOf(id)==="male";});
    var f=ids.filter(function(id){return genderOf(id)==="female";});
    m=shuffle(m); f=shuffle(f);
    var out=[]; while((m.length||f.length)&&out.length<(recipe.teams||999)){
      var team=[], mp=Math.min(recipe.malesPerTeam||0,m.length), fp=Math.min(recipe.femalesPerTeam||0,f.length);
      for(var i=0;i<mp;i++) team.push(m.shift());
      for(var j=0;j<fp;j++) team.push(f.shift());
      var rem=(recipe.teamSize||team.length)-team.length;
      while(rem-- >0 && (m.length||f.length)){(m.length>f.length?team.push(m.shift()):team.push(f.shift()));}
      if(team.length) out.push(team);
    }
    return out;
  }
  function groupTeamsCompositions(ids,comps){
    var males=shuffle(ids.filter(function(id){return genderOf(id)==="male";}));
    var females=shuffle(ids.filter(function(id){return genderOf(id)==="female";}));
    var out=[]; comps.forEach(function(c){
      var team=[];
      for(var i=0;i<(c.males||0)&&males.length;i++) team.push(males.shift());
      for(var j=0;j<(c.females||0)&&females.length;j++) team.push(females.shift());
      while(team.length<((c.males||0)+(c.females||0))&&(males.length||females.length)){(males.length?team.push(males.shift()):team.push(females.shift()));}
      out.push(team);
    });
    return out;
  }

  function simulateEntireSeason(){
    state.players = state.cast.filter(Boolean).map(function(c){ return {id:c.id, gender:c.gender, alive:true}; });
    state.episodes={}; state.ui={}; state.chart={finalized:false,episodes:{}}; state.stats={dailyWins:{},elimWins:{},elimPlays:{},draws:{},killCards:{}};
    state.placements={winners:{male:null,female:null},second:{male:null,female:null},third:{male:null,female:null},eliminated:[]};
    state.finalRanks={male:[],female:[]};

    for(var ep=1;ep<=10;ep++){
      var aliveAll=aliveIds(); var E=state.episodes[ep]={status:{alive:aliveAll.slice()}}; E.events1=genHouseEvents(aliveAll);

      var daily=(window.FA_DAILY_DATA||[]).find(function(d){return d.episode===ep;})||{};
      var placements=[], winners=[], safe=[], bottom=[], formedTeams=[], teamFormatText=(daily.teamFormat==="solo"?"Individual":(daily.teamFormat==="teams"?(daily.teamDetails&&daily.teamDetails.recipe&&daily.teamDetails.recipe.teamSize===2?"Pairs (teams of 2)":"Teams"):"Teams"));

      if(daily.teamFormat==="solo"){
        var allPerf=aliveAll.map(function(pid){return {pid:pid,score:scorePlayer(daily.skillWeights||daily.skills,pid)};});
        var perfM=allPerf.filter(function(r){return genderOf(r.pid)==="male";});
        var perfF=allPerf.filter(function(r){return genderOf(r.pid)==="female";});
        function rankAsc(arr){return shuffle(arr).sort(function(a,b){return (a.score===b.score)?(Math.random()<0.5?-1:1):(a.score-b.score);});}
        perfM=rankAsc(perfM); perfF=rankAsc(perfF);

        var rc=daily.resultCounts||{};
        if(rc.winners && typeof rc.winners==="object"){
          var wM=(perfM.slice(-((rc.winners.male||0)))).map(function(x){return x.pid;});
          var wF=(perfF.slice(-((rc.winners.female||0)))).map(function(x){return x.pid;});
          var bM=(perfM.slice(0,(rc.bottom&&rc.bottom.male)||0)).map(function(x){return x.pid;});
          var bF=(perfF.slice(0,(rc.bottom&&rc.bottom.female)||0)).map(function(x){return x.pid;});
          var sMpool=perfM.map(function(x){return x.pid;}).filter(function(id){return wM.indexOf(id)<0 && bM.indexOf(id)<0;});
          var sFpool=perfF.map(function(x){return x.pid;}).filter(function(id){return wF.indexOf(id)<0 && bF.indexOf(id)<0;});
          var sM=sMpool.slice(0,(rc.safe&&rc.safe.male)||0);
          var sF=sFpool.slice(0,(rc.safe&&rc.safe.female)||0);
          winners=wM.concat(wF); bottom=bM.concat(bF); safe=sM.concat(sF);
          placements=perfM.map(function(x){return x.pid;}).concat(perfF.map(function(x){return x.pid;}));
        } else {
          var wc=+daily.winnerCount||2, bc=+daily.bottomCount||4, sc=+daily.safeCount||(aliveAll.length-wc-bc);
          var ordered=shuffle(allPerf).sort(function(a,b){return (a.score===b.score)?(Math.random()<0.5?-1:1):(a.score-b.score);}).map(function(x){return x.pid;});
          winners=ordered.slice(-wc); bottom=ordered.slice(0,bc);
          safe=ordered.filter(function(id){return winners.indexOf(id)<0 && bottom.indexOf(id)<0;}).slice(0,sc);
          placements=ordered;
        }
      } else if(daily.teamDetails && daily.teamDetails.teamCompositions){
        formedTeams=groupTeamsCompositions(aliveAll,daily.teamDetails.teamCompositions||[]);
        formedTeams.forEach(function(team,idx){team._color=ROW_COLORS[idx%ROW_COLORS.length];});
        var scores=formedTeams.map(function(g){return {team:g,score:g.reduce(function(s,id){return s+scorePlayer(daily.skillWeights||daily.skills,id);},0)};});
        scores=shuffle(scores).sort(function(a,b){return (a.score===b.score)?(Math.random()<0.5?-1:1):(a.score-b.score);});
        var orderedGroups=scores.map(function(s){return s.team;});
        placements=[].concat.apply([],orderedGroups);
        var wc=+daily.winnerCount||formedTeams[0].length, bc=+daily.bottomCount||formedTeams[0].length, sc=+daily.safeCount||(placements.length-wc-bc);
        winners=placements.slice(-wc); bottom=placements.slice(0,bc);
        safe=placements.filter(function(id){return winners.indexOf(id)<0 && bottom.indexOf(id)<0;}).slice(0,sc);
      } else if(daily.teamDetails && daily.teamDetails.recipe){
        formedTeams=groupTeamsRecipe(aliveAll,daily.teamDetails.recipe);
        formedTeams.forEach(function(team,idx){team._color=ROW_COLORS[idx%ROW_COLORS.length];});
        var scoresR=formedTeams.map(function(g){return {team:g,score:g.reduce(function(s,id){return s+scorePlayer(daily.skillWeights||daily.skills,id);},0)};});
        scoresR=shuffle(scoresR).sort(function(a,b){return (a.score===b.score)?(Math.random()<0.5?-1:1):(a.score-b.score);});
        var orderedR=scoresR.map(function(s){return s.team;});
        placements=[].concat.apply([],orderedR);
        var wc=+daily.winnerCount||formedTeams[0].length, bc=+daily.bottomCount||formedTeams[0].length, sc=+daily.safeCount||(placements.length-wc-bc);
        winners=placements.slice(-wc); bottom=placements.slice(0,bc);
        safe=placements.filter(function(id){return winners.indexOf(id)<0 && bottom.indexOf(id)<0;}).slice(0,sc);
      } else {
        var pairs=makePairs(aliveIds("male"),aliveIds("female"),null);
        pairs.forEach(function(p,idx){p._color=ROW_COLORS[idx%ROW_COLORS.length];});
        formedTeams=pairs;
        var ps=pairs.map(function(p){return {pair:p,score:scorePlayer(daily.skillWeights||daily.skills,p[0])+scorePlayer(daily.skillWeights||daily.skills,p[1])};});
        ps=shuffle(ps).sort(function(a,b){return (a.score===b.score)?(Math.random()<0.5?-1:1):(a.score-b.score);});
        placements=[].concat.apply([],ps.map(function(x){return x.pair;}));
        var wc=+daily.winnerCount||2, bc=+daily.bottomCount||4, sc=+daily.safeCount||(placements.length-wc-bc);
        winners=placements.slice(-wc); bottom=placements.slice(0,bc);
        safe=placements.filter(function(id){return winners.indexOf(id)<0 && bottom.indexOf(id)<0;}).slice(0,sc);
        teamFormatText="Pairs (teams of 2)";
      }
      winners.forEach(function(id){state.stats.dailyWins[id]=(state.stats.dailyWins[id]||0)+1;});

      var E=state.episodes[ep]; E.daily={id:daily.id,name:daily.name,description:daily.description||"",teamFormat:teamFormatText,teams:formedTeams,winners:winners,safe:safe,bottom:bottom,placements:placements};
      E.events2=genHouseEvents(aliveAll);

      var nonWinners=aliveAll.filter(function(id){return winners.indexOf(id)<0;});
      var malePool=nonWinners.filter(function(id){return genderOf(id)==="male";});
      var femalePool=nonWinners.filter(function(id){return genderOf(id)==="female";});
      function voteTarget(from,pool){
        if(!pool.length) return null;
        var scored=pool.map(function(id){return {id:id,r:rel(from,id)};});
        var minR=Math.min.apply(null,scored.map(function(x){return x.r;}));
        var tied=scored.filter(function(x){return x.r===minR;}).map(function(x){return x.id;});
        return tied.length?sample(tied):sample(pool);
      }
      var votes=[]; winners.forEach(function(w){ var mT=voteTarget(w,malePool); var fT=voteTarget(w,femalePool); if(mT) votes.push({from:w,to:mT,gender:"male"}); if(fT) votes.push({from:w,to:fT,gender:"female"}); });
      function tallyNominee(pool,gender){
        var tally={}; votes.filter(function(v){return v.gender===gender;}).forEach(function(v){tally[v.to]=(tally[v.to]||0)+1;});
        var vals=Object.values(tally); var max=vals.length?Math.max.apply(null,vals):0;
        var top=Object.keys(tally).filter(function(id){return tally[id]===max;});
        var tieNote=(top.length>1)?"There was a tie between "+gender+" nominees, so the decision was chosen at random between the tied players.":"";
        var pick=top.length?sample(top):(pool.length?sample(pool):null);
        return {pick:pick,tieNote:tieNote,tied:top};
      }
      var nm=tallyNominee(malePool,"male");
      var nf=tallyNominee(femalePool,"female");
      var houseMale=nm.pick, houseFemale=nf.pick;
      E.voting={votes:votes,houseNominee:{male:houseMale,female:houseFemale},tieNote:{male:nm.tieNote,female:nf.tieNote}};

      var bottomMale=shuffle(bottom.filter(function(id){return genderOf(id)==="male"&&id!==houseMale;}));
      var bottomFemale=shuffle(bottom.filter(function(id){return genderOf(id)==="female"&&id!==houseFemale;}));
      var killMale=bottomMale.length?sample(bottomMale):null;
      var killFemale=bottomFemale.length?sample(bottomFemale):null;
      if(killMale){state.stats.draws[killMale]=(state.stats.draws[killMale]||0)+1;}
      if(killFemale){state.stats.draws[killFemale]=(state.stats.draws[killFemale]||0)+1;}
      E.draw={order:{male:bottomMale.slice(),female:bottomFemale.slice()},bottom:{male:bottomMale,female:bottomFemale},kill:{male:killMale,female:killFemale},revealed:{male:false,female:false},opened:{male:{},female:{}}};

      var elimD=(window.FA_ELIMINATION_DATA||[]).find(function(d){return d.episode===ep;})||{};
      function scoreWithElim(pid){if(elimD.skillWeights) return scorePlayer(elimD.skillWeights,pid); if(Array.isArray(elimD.skills)) return scorePlayer(elimD.skills,pid); return 0;}
      function duel(a,b){if(!a||!b) return {winner:a||b,loser:a?b:a}; var wa=scoreWithElim(a), wb=scoreWithElim(b); if(wa===wb) return (Math.random()<0.5)?{winner:a,loser:b}:{winner:b,loser:a}; return (wa>wb)?{winner:a,loser:b}:{winner:b,loser:a};}
      var em=duel(houseMale,killMale);
      var ef=duel(houseFemale,killFemale);
      [em,ef].forEach(function(res){
        if(res&&res.winner){state.stats.elimWins[res.winner]=(state.stats.elimWins[res.winner]||0)+1; state.stats.elimPlays[res.winner]=(state.stats.elimPlays[res.winner]||0)+1;}
        if(res&&res.loser){state.stats.elimPlays[res.loser]=(state.stats.elimPlays[res.loser]||0)+1; var pl=state.players.find(function(p){return p.id===res.loser;}); if(pl) pl.alive=false; state.placements.eliminated.push(res.loser);}
      });
      E.elimination={name:elimD.name||("Elimination "+ep),description:elimD.description||"",matchups:{male:{nominee:houseMale,kill:killMale,winner:em?em.winner:null,loser:em?em.loser:null},female:{nominee:houseFemale,kill:killFemale,winner:ef?ef.winner:null,loser:ef?ef.loser:null}}};

      state.chart.episodes[String(ep)]={dailyWinners:winners.slice(),nominees:{male:houseMale,female:houseFemale}};
      state.ui[ep]={dailyRevealed:false,drawOpened:{male:0,female:0},elimReveal:{male:false,female:false}};
    }

    simulateEpisode11(); simulateFinalsEp12();
    state.chart.finalized=true;
  }

  function simulateEpisode11(){
    var ep=11, aliveAll=aliveIds();
    var E=state.episodes[ep]={status:{alive:aliveAll.slice()}}; E.events1=genHouseEvents(aliveAll);
    var males=shuffle(aliveIds("male")), females=shuffle(aliveIds("female"));
    var killM=males.slice(0,2), killF=females.slice(0,2);
    killM.forEach(function(id){state.stats.draws[id]=(state.stats.draws[id]||0)+1;});
    killF.forEach(function(id){state.stats.draws[id]=(state.stats.draws[id]||0)+1;});
    E.draw_all={order:{male:males,female:females},kill:{male:killM,female:killF},revealed:{male:false,female:false},opened:{male:{},female:{}}};

    var elimD=(window.FA_ELIMINATION_DATA||[]).find(function(d){return d.episode===ep;})||{};
    function scoreWithElim(pid){if(elimD.skillWeights) return scorePlayer(elimD.skillWeights,pid); if(Array.isArray(elimD.skills)) return scorePlayer(elimD.skills,pid); return 0;}
    function duel(a,b){if(!a||!b) return {winner:a||b,loser:a?b:a}; var wa=scoreWithElim(a), wb=scoreWithElim(b); if(wa===wb) return (Math.random()<0.5)?{winner:a,loser:b}:{winner:b,loser:a}; return (wa>wb)?{winner:a,loser:b}:{winner:b,loser:a};}
    var em=duel(killM[0],killM[1]), ef=duel(killF[0],killF[1]);
    [em,ef].forEach(function(res){
      if(res&&res.winner){state.stats.elimWins[res.winner]=(state.stats.elimWins[res.winner]||0)+1; state.stats.elimPlays[res.winner]=(state.stats.elimPlays[res.winner]||0)+1;}
      if(res&&res.loser){state.stats.elimPlays[res.loser]=(state.stats.elimPlays[res.loser]||0)+1; var pl=state.players.find(function(p){return p.id===res.loser;}); if(pl) pl.alive=false; state.placements.eliminated.push(res.loser);}
    });
    E.elimination={name:elimD.name||("Elimination "+ep),description:elimD.description||"",matchups:{male:{a:killM[0]||null,b:killM[1]||null,winner:em?em.winner:null,loser:em?em.loser:null},female:{a:killF[0]||null,b:killF[1]||null,winner:ef?ef.winner:null,loser:ef?ef.loser:null}}};
    state.ui[ep]={drawOpened:{male:0,female:0},elimReveal:{male:false,female:false}};
  }

  function simulateFinalsEp12(){
    var ep=12, aliveAll=aliveIds();
    var E=state.episodes[ep]={status:{alive:aliveAll.slice()}, finals:{stages:[],cumulativeTimes:{},results:{}}};
    var src=window.FA_FINAL_DATA||window.FA_FINAL_STAGES||window.finalStagesData||[]; var stages=src.slice(0,5);
    var cum={}; aliveAll.forEach(function(id){cum[id]=0;});

    function teamScores(weights, pairs){
      return pairs.map(function(p){return {pair:p,score:(scorePlayer(weights||[],p[0]) + scorePlayer(weights||[],p[1]))};});
    }
    function timeFromScore(totalScores, score, range){
      var hi=(range&&range[1])||1800, lo=(range&&range[0])||900;
      var best = Math.max.apply(null, totalScores.map(function(o){return o.score;})) || 1;
      var ratio = score / best;
      var base = hi + (lo - hi) * ratio;
      var noise = base*(Math.random()*0.08 - 0.04);
      return Math.max(60, Math.round(base+noise));
    }
    function soloTimes(weights, ids, range){
      var best=Math.max.apply(null, ids.map(function(id){return scorePlayer(weights||[],id);}))||1;
      var hi=(range&&range[1])||1800, lo=(range&&range[0])||900;
      var out={};
      ids.forEach(function(id){
        var s=scorePlayer(weights||[],id), ratio=s/best;
        var base=hi+(lo-hi)*ratio;
        var noise=base*(Math.random()*0.08-0.04);
        out[id]=Math.max(60,Math.round(base+noise)); cum[id]+=out[id];
      });
      return out;
    }

    var idsM=aliveIds("male"), idsF=aliveIds("female");
    var avoidPairs=new Set(); var pairKey=function(a,b){return a<b?(a+"|"+b):(b+"|"+a);};

    for(var i=0;i<stages.length;i++){
      var st=stages[i]||{};
      var entry={stage:(st.stage||i+1),id:st.id||("final_"+(i+1)),name:st.name||("Final Stage "+(i+1)),description:st.description||"",times:{},placements:[],meta:{}}; 
      var type=st.type||st.stageType||(i<3?"pair":"solo");

      if(type==="pair"){
        var pairs=makePairs(idsM.slice(),idsF.slice(),avoidPairs);
        pairs.forEach(function(p){avoidPairs.add(pairKey(p[0],p[1]));});
        var scores=teamScores(st.skills||st.timeWeights||[], pairs);
        var totals=scores.map(function(o){return {pair:o.pair,total:timeFromScore(scores,o.score,st.timeRangeSec)};})
                         .sort(function(a,b){return a.total-b.total});
        totals.forEach(function(t){
          entry.times[t.pair[0]]=t.total; entry.times[t.pair[1]]=t.total;
          cum[t.pair[0]]+=t.total;        cum[t.pair[1]]+=t.total;
        });
        entry.meta.pairs=totals.slice();
        entry.placements=[].concat.apply([],totals.map(function(r){return r.pair;}));
        entry.meta.type="pair";
      } else {
        var ids = aliveAll.slice();
        var tmap = soloTimes(st.skills||st.timeWeights||[], ids, st.timeRangeSec);
        entry.times=tmap; entry.meta.type="solo";
        entry.placements=ids.slice().sort(function(a,b){return tmap[a]-tmap[b];});
      }
      E.finals.stages.push(entry);
    }

    E.finals.cumulativeTimes=Object.assign({},cum);

    function rankGender(g){
      var ids=aliveIds(g); var arr=ids.map(function(id){return {id:id,t:cum[id]||0};}).sort(function(a,b){return a.t-b.t;});
      return arr;
    }
    var rm=rankGender("male"), rf=rankGender("female");
    state.finalRanks.male=rm.map(function(x){return x.id;});
    state.finalRanks.female=rf.map(function(x){return x.id;});
    state.placements.winners.male=rm[0]?rm[0].id:null;
    state.placements.second.male =rm[1]?rm[1].id:null;
    state.placements.third.male  =rm[2]?rm[2].id:null;
    state.placements.winners.female=rf[0]?rf[0].id:null;
    state.placements.second.female =rf[1]?rf[1].id:null;
    state.placements.third.female  =rf[2]?rf[2].id:null;

    state.chart.episodes[String(ep)]={finalPlacements:{male:{first:state.placements.winners.male,second:state.placements.second.male,third:state.placements.third.male},female:{first:state.placements.winners.female,second:state.placements.second.female,third:state.placements.third.female}}};
    state.ui[ep]={stageReveal:{1:{third:false,second:false,first:false},2:{third:false,second:false,first:false},3:{third:false,second:false,first:false}}, soloReveal:{4:{male:false,female:false},5:{male:false,female:false}}, resultsReveal:{third:false,second:false,first:false}};
  }

  function renderProfile(id,extraHTML){
    var d=document.createElement("div"); d.className="status-slot";
    d.style.justifySelf="center";
    d.setAttribute("data-id",id||"");
    d.innerHTML='<img class="avatar" src="'+picOf(id)+'" alt=""><div class="name">'+nameOf(id)+'</div>'+(extraHTML||'');
    return d;
  }
  function renderTeamBox(ids,color,opts){
    opts=opts||{};
    var extras=opts.extras||{};
    var card=document.createElement("div"); card.className="mini-card";
    card.style.borderColor=color||"var(--glass-border)";
    if(color){card.style.boxShadow="0 0 0 2px "+color+" inset";}
    var count=ids.length;
    var compact=!!opts.compact || count<=3;
    var maxW=opts.maxWidth||(compact?(count<=2?420:560):900);
    card.style.width="100%"; card.style.maxWidth=maxW+"px";
    var row=document.createElement("div"); row.className="row-flex";
    ids.forEach(function(id){row.appendChild(renderProfile(id, extras[id]||""));});
    card.innerHTML='<div style="font-weight:700; letter-spacing:.2px">Team</div>';
    card.appendChild(row);
    return card;
  }
  function fmtTime(secs){var h=Math.floor(secs/3600), m=Math.floor((secs%3600)/60), s=secs%60; return (h?(h+"h "):"")+m+"m "+s+"s";}
  function renderCenteredProfiles(title,ids,extrasMap){
    if(!ids||!ids.length) return null;
    var blk=document.createElement("div");
    var head=document.createElement("div"); head.className="center"; head.innerHTML="<strong>"+title+"</strong>";
    var row=document.createElement("div"); row.className="row-flex";
    ids.forEach(function(id){row.appendChild(renderProfile(id, extrasMap&&extrasMap[id]?extrasMap[id]:""));});
    blk.appendChild(head); blk.appendChild(row); return blk;
  }
  function renderNames(text,ids){var out=text,labels=["{A}","{B}","{C}"]; ids.forEach(function(pid,i){out=out.split(labels[i]).join(nameOf(pid));}); return out;}
  function genHouseEvents(ids){
    var E=window.FA_EVENTS||window.FM_EVENTS||{}, pick=function(a){return a&&a.length?sample(a):null;}, out=[], count=3+rnd(3);
    for(var i=0;i<count;i++){
      var roll=Math.random();
      if(roll<0.3){var A=sample(ids),ev1=pick(E.solo_neutral); if(ev1) out.push({type:"solo",players:[A],text:renderNames(ev1,[A]),sentiment:"neutral"});}
      else if(roll<0.8){
        var P1=sample(ids),P2=sample(ids.filter(function(x){return x!==P1;}))||P1,bucket=E.two_neutral,sentiment="neutral",r=rel(P1,P2);
        if(r>=5&&Math.random()<0.25){bucket=E.two_positive; sentiment="positive";}
        if(r<=-3&&Math.random()<0.25){bucket=E.two_negative; sentiment="negative";}
        var ev2=pick(bucket); if(ev2) out.push({type:"pair",players:[P1,P2],text:renderNames(ev2,[P1,P2]),sentiment:sentiment});
      } else {
        var pool=shuffle(ids).slice(0,3), ev3=pick(E.team_neutral);
        if(ev3&&pool.length) out.push({type:"team",players:pool,text:renderNames(ev3,pool),sentiment:"neutral"});
      }
    }
    return out;
  }

  function showEpisodeSection(ep,section){
    state.lastView={ep:ep,section:section}; State.save(state);
    epActions.innerHTML=""; var s=state.episodes[ep]; epTitle.textContent=(ep<=11)?("Episode "+ep):"Episode 12 — Final"; epSub.textContent="";
    if(!s){epContent.innerHTML='<p class="muted">No data.</p>'; addProceed(ep,section); return;}

    if(section==="format"){
      epSub.textContent="Format";
      var card=document.createElement("div"); card.className="mini-card note";
      card.style.width="100%"; card.style.maxWidth="900px";
      card.innerHTML = `
  <div>
    <p>Prior to each challenge, it is announced whether it is going to be an individual, pair, or team challenge. For pair and team challenges, names are drawn out of a bag — one of each gender, or more for multi-team or pair challenges — that are designated as captains. For team challenges, the captains select players evenly amongst gender. For pair challenges, the captains either select players of the opposite gender for challenges that are designated as male and female pairs, or the same gender for challenges that are designated as same-gender pairs.</p>
    <p>After each challenge, the winning teams, pairs or players are not only safe from elimination, but also choose one player of each gender to compete in the elimination round. If a challenge is played in a team or pair format, each member of the winning pair or team is safe from elimination. The losing players then participate in an elimination vote called <em>The Draw</em>, in which each player either flips over a kill card, which has a skeleton symbol, or a blank card. If a player flips over a blank card, that player saves themself from participating in the elimination; however, if a player flips over the kill card, that player has to face the player of the respective gender that was previously voted by the winning team/pair/individual in the elimination. The winning players of each gender return to the game and have a shot at competing for a $350,000 prize, while the losing male and female players are eliminated from the game.</p>
    <p>At the end of the season, six players compete in the final challenge — three of each gender. The first-place finishers each win $125,000, second-place contestants each win $35,000, and third-place contestants each win $15,000.</p>
  </div>`;
      epContent.innerHTML=""; epContent.appendChild(card); addProceed(ep,section); return;
    }

    if(section==="status"){
      epSub.textContent="Remaining players: "+(s.status.alive||[]).length;
      var males=s.status.alive.filter(function(id){return genderOf(id)==="male";});
      var females=s.status.alive.filter(function(id){return genderOf(id)==="female";});
      var wrap=document.createElement("div"); wrap.style.display="grid"; wrap.style.gap="16px";
      function rowBlock(title,ids){
        var blk=document.createElement("div");
        var head=document.createElement("div"); head.className="center"; head.innerHTML="<strong>"+title+"</strong>";
        var row=document.createElement("div"); row.className="row-flex";
        ids.forEach(function(id){row.appendChild(renderProfile(id));});
        blk.appendChild(head); blk.appendChild(row); return blk;
      }
      wrap.appendChild(rowBlock("Male Players",males));
      wrap.appendChild(rowBlock("Female Players",females));
      epContent.innerHTML=""; epContent.appendChild(wrap); addProceed(ep,section); return;
    }

    if(section==="events1"||section==="events2"||section==="events"){
      var key=(section==="events1")?"events1":(section==="events2"?"events2":"events1");
      epSub.textContent=(section==="events1"?"House Events 1":(section==="events2"?"House Events 2":"House Events"));
      var grid=document.createElement("div"); grid.className="events-grid";
      (s[key]||[]).forEach(function(ev){
        var card=document.createElement("div"); card.className="mini-card";
        var avatars=document.createElement("div"); avatars.style.display="flex"; avatars.style.gap="8px"; avatars.style.justifyContent="center"; avatars.style.marginBottom="6px";
        (ev.players||[]).forEach(function(pid){var img=document.createElement("img"); img.className="avatar xs"; img.style.width="28px"; img.style.height="28px"; img.src=picOf(pid); avatars.appendChild(img);});
        var extra=""; if(ev.sentiment==="positive") extra='<div class="muted" style="font-size:.9rem;">Their relationship has improved.</div>';
        if(ev.sentiment==="negative") extra='<div class="muted" style="font-size:.9rem;">Their relationship has worsened.</div>';
        card.innerHTML=avatars.outerHTML+'<div>'+ev.text+'</div>'+extra; grid.appendChild(card);
      });
      epContent.innerHTML=""; epContent.appendChild(grid); addProceed(ep,section); return;
    }

    if(section==="daily"){
      var d=s.daily||{}; epSub.textContent=d.name||"Daily Challenge";
      var desc=document.createElement("div"); desc.className="mini-card note"; desc.style.width="100%"; desc.style.maxWidth="900px";
      desc.innerHTML='<div><strong>Description:</strong> '+(d.description||"")+'</div><div style="margin-top:6px;"><strong>Format:</strong> '+(d.teamFormat||"")+'</div>';

      var teamsWrap=null;
      if((d.teams||[]).length){
        teamsWrap=document.createElement("div");
        teamsWrap.style.display="grid";
        teamsWrap.style.gridTemplateColumns="repeat(auto-fit,minmax(300px,1fr))";
        teamsWrap.style.gap="12px";
        (d.teams||[]).forEach(function(team,idx){
          var color=(team._color||ROW_COLORS[idx%ROW_COLORS.length]);
          teamsWrap.appendChild(renderTeamBox(team,color,{compact:true}));
        });
      }

      var results=document.createElement("div"); results.style.display="grid"; results.style.gap="16px"; results.style.justifyItems="center";
      function makeTeamBuckets(title,ids){
        if(!ids||!ids.length) return null;
        var teams=[]; if(d.teams&&d.teams.length){
          (d.teams||[]).forEach(function(team,idx){
            var subset=team.filter(function(id){return ids.indexOf(id)>=0;});
            if(subset.length){teams.push({ids:subset,color:team._color||ROW_COLORS[idx%ROW_COLORS.length]});}
          });
        } else { teams=ids.map(function(id){return {ids:[id],color:ROW_COLORS[0]};}); }
        var blk=document.createElement("div"); blk.style.display="grid"; blk.style.gap="10px"; blk.style.justifyItems="center";
        var head=document.createElement("div"); head.className="center"; head.innerHTML='<span style="font-size:1.2rem;font-weight:800">'+title+'</span>';
        var row=document.createElement("div"); row.className="row-flex";
        teams.forEach(function(t){row.appendChild(renderTeamBox(t.ids,t.color,{compact:true}));});
        blk.appendChild(head); blk.appendChild(row); return blk;
      }
      function makeSoloRow(title,ids){ return renderCenteredProfiles('<span style="font-size:1.2rem;font-weight:800">'+title+'</span>',ids||[]); }

      var btn=document.createElement("button"); btn.className="btn"; btn.textContent="Reveal Placements";
      btn.onclick=function(){
        results.innerHTML="";
        if(d.teamFormat==="Individual"||d.teamFormat==="solo"){
          var winBlk=makeSoloRow("Winners",d.winners||[]);
          var safeBlk=(d.safe&&d.safe.length)?makeSoloRow("Safe",d.safe):null;
          var botBlk=makeSoloRow("Bottom",d.bottom||[]);
          if(winBlk) results.appendChild(winBlk);
          if(safeBlk) results.appendChild(safeBlk);
          if(botBlk) results.appendChild(botBlk);
        } else {
          var winBlk=makeTeamBuckets("Winners",d.winners||[]);
          var safeBlk=(d.safe&&d.safe.length)?makeTeamBuckets("Safe",d.safe):null;
          var botBlk=makeTeamBuckets("Bottom",d.bottom||[]);
          if(winBlk) results.appendChild(winBlk);
          if(safeBlk) results.appendChild(safeBlk);
          if(botBlk) results.appendChild(botBlk);
        }
        btn.remove();
      };

      epContent.innerHTML=""; epContent.appendChild(desc); if(teamsWrap) epContent.appendChild(teamsWrap);
      epActions.appendChild(btn); epContent.appendChild(results); addProceed(ep,section); return;
    }

    if(section==="voting"){
      var v=s.voting||{}; epSub.textContent="Daily winners vote one male and one female into elimination.";
      var wrap=document.createElement("div"); wrap.className="events-grid";
      (v.votes||[]).forEach(function(row){
        var card=document.createElement("div"); card.className="vote-card";
        card.innerHTML=
          '<div class="team-strip" style="border:2px solid var(--glass-border);border-radius:10px;padding:8px;">'+
            '<img class="avatar" style="width:72px;height:72px;border-radius:50%" src="'+picOf(row.from)+'" alt="">'+
            '<div>'+nameOf(row.from)+' (Winner)</div>'+
          '</div>'+
          '<div class="arrow">→</div>'+
          '<div class="team-strip" style="border:2px solid var(--glass-border);border-radius:10px;padding:8px;">'+
            '<img class="avatar" style="width:72px;height:72px;border-radius:50%" src="'+picOf(row.to)+'" alt="">'+
            '<div>'+nameOf(row.to)+' ('+row.gender+')</div>'+
          '</div>';
        wrap.appendChild(card);
      });

      var nomBox=document.createElement("div");
      var head=document.createElement("div"); head.className="center"; head.innerHTML="<strong>Nominees</strong>";
      var row=document.createElement("div"); row.className="row-flex";
      if(v.houseNominee.male) row.appendChild(renderProfile(v.houseNominee.male));
      if(v.houseNominee.female) row.appendChild(renderProfile(v.houseNominee.female));
      var tieLine=document.createElement("div"); tieLine.className="center muted"; tieLine.style.marginTop="6px";
      var notes=[]; if(v.tieNote&&v.tieNote.male) notes.push(v.tieNote.male); if(v.tieNote&&v.tieNote.female) notes.push(v.tieNote.female);
      tieLine.innerHTML=notes.join("<br/>");

      nomBox.appendChild(head); nomBox.appendChild(row); nomBox.appendChild(tieLine);
      epContent.innerHTML=""; epContent.appendChild(wrap); epContent.appendChild(nomBox); addProceed(ep,section); return;
    }

    if(section==="draw"){
      epSub.textContent="The Draw";
      var d=s.draw||{order:{male:[],female:[]},kill:{male:null,female:null},revealed:{male:false,female:false},opened:{male:{},female:{}}};
      var shell=document.createElement("div"); shell.style.display="grid"; shell.style.gap="18px"; shell.style.justifyItems="center";

      ["male","female"].forEach(function(g){
        var box=document.createElement("div"); box.style.display="grid"; box.style.gap="8px"; box.style.justifyItems="center";
        var title=document.createElement("div"); title.innerHTML="<strong>"+(g==="male"?"Male":"Female")+" — Draw</strong>"; title.className="center";
        var row=document.createElement("div"); row.className="row-flex";
        (d.order[g]||[]).forEach(function(id){
          var slot=document.createElement("div"); slot.className="status-slot"; slot.setAttribute("data-id",id);
          slot.innerHTML='<img class="avatar" src="'+picOf(id)+'" alt=""><div class="name">'+nameOf(id)+'</div><button class="btn btn-reveal" data-g="'+g+'" data-id="'+id+'">Draw</button>';
          row.appendChild(slot);
        });
        var btnAll=document.createElement("button"); btnAll.className="btn"; btnAll.textContent="Open All Cards ("+g+")";
        btnAll.style.marginTop="8px";
        btnAll.onclick=function(){
          if(d.revealed[g]) return;
          d.revealed[g]=true;
          var picked=d.kill[g];
          row.querySelectorAll(".btn-reveal").forEach(function(b){
            var pid=b.getAttribute("data-id");
            if(d.opened[g][pid]) return;
            d.opened[g][pid]=true; b.disabled=true;
            var slot=b.closest(".status-slot");
            var isKill=(pid===picked);
            b.textContent=isKill?"Kill Card":"Safe";
            slot.style.boxShadow=isKill?"0 0 0 2px #ff6565 inset, 0 0 18px rgba(255,101,101,.35)":"0 0 0 2px #42d77d inset, 0 0 18px rgba(66,215,125,.35)";
          });
          epContent.querySelectorAll(".chosen-"+g).forEach(function(x){x.remove();});
          var chosen=document.createElement("div"); chosen.className="chosen-"+g;
          chosen.innerHTML='<div class="center" style="margin-top:10px;"><em>Kill cards ('+g+')</em></div>';
          var chosenRow=document.createElement("div"); chosenRow.className="row-flex";
          if(picked) chosenRow.appendChild(renderProfile(picked));
          chosen.appendChild(chosenRow);
          shell.appendChild(chosen);
        };
        setTimeout(function(){
          row.querySelectorAll(".btn-reveal").forEach(function(b){
            b.onclick=function(){
              var pid=b.getAttribute("data-id");
              if(d.opened[g][pid]) return;
              d.opened[g][pid]=true; b.disabled=true;
              var slot=b.closest(".status-slot");
              var isKill=(g==="male"?d.kill.male===pid:d.kill.female===pid);
              b.textContent=isKill?"Kill Card":"Safe";
              slot.style.boxShadow=isKill?"0 0 0 2px #ff6565 inset, 0 0 18px rgba(255,101,101,.35)":"0 0 0 2px #42d77d inset, 0 0 18px rgba(66,215,125,.35)";
            };
          });
        },0);
        box.appendChild(title); box.appendChild(row); box.appendChild(btnAll); shell.appendChild(box);
      });

      epContent.innerHTML=""; epContent.appendChild(shell); addProceed(ep,section); return;
    }

    if(section==="draw_all"){
      epSub.textContent="The Draw — Everyone";
      var d=s.draw_all||{order:{male:[],female:[]},kill:{male:[],female:[]},revealed:{male:false,female:false},opened:{male:{},female:{}}};
      var shell=document.createElement("div"); shell.style.display="grid"; shell.style.gap="18px"; shell.style.justifyItems="center";

      ["male","female"].forEach(function(g){
        var box=document.createElement("div"); box.style.display="grid"; box.style.gap="8px"; box.style.justifyItems="center";
        var title=document.createElement("div"); title.innerHTML="<strong>"+(g==="male"?"Male":"Female")+" — Draw</strong>"; title.className="center";
        var row=document.createElement("div"); row.className="row-flex";
        (d.order[g]||[]).forEach(function(id){
          var slot=document.createElement("div"); slot.className="status-slot"; slot.setAttribute("data-id",id);
          slot.innerHTML='<img class="avatar" src="'+picOf(id)+'" alt=""><div class="name">'+nameOf(id)+'</div><button class="btn btn-reveal" data-g="'+g+'" data-id="'+id+'">Draw</button>';
          row.appendChild(slot);
        });
        var btnAll=document.createElement("button"); btnAll.className="btn"; btnAll.textContent="Open All Cards ("+g+")";
        btnAll.style.marginTop="8px";
        btnAll.onclick=function(){
          if(d.revealed[g]) return;
          d.revealed[g]=true;
          var kills=d.kill[g]||[];
          row.querySelectorAll(".btn-reveal").forEach(function(b){
            var pid=b.getAttribute("data-id");
            if(d.opened[g][pid]) return;
            d.opened[g][pid]=true; b.disabled=true;
            var slot=b.closest(".status-slot");
            var isKill=kills.indexOf(pid)>=0;
            b.textContent=isKill?"Kill Card":"Safe";
            slot.style.boxShadow=isKill?"0 0 0 2px #ff6565 inset, 0 0 18px rgba(255,101,101,.35)":"0 0 0 2px #42d77d inset, 0 0 18px rgba(66,215,125,.35)";
          });
        };
        setTimeout(function(){
          row.querySelectorAll(".btn-reveal").forEach(function(b){
            b.onclick=function(){
              var pid=b.getAttribute("data-id");
              if(d.opened[g][pid]) return;
              d.opened[g][pid]=true; b.disabled=true;
              var slot=b.closest(".status-slot");
              var isKill=(d.kill[g]||[]).indexOf(pid)>=0;
              b.textContent=isKill?"Kill Card":"Safe";
              slot.style.boxShadow=isKill?"0 0 0 2px #ff6565 inset, 0 0 18px rgba(255,101,101,.35)":"0 0 0 2px #42d77d inset, 0 0 18px rgba(66,215,125,.35)";
            };
          });
        },0);
        box.appendChild(title); box.appendChild(row); box.appendChild(btnAll); shell.appendChild(box);
      });

      epContent.innerHTML=""; epContent.appendChild(shell); addProceed(ep,section); return;
    }

    if(section==="elimination"){
      epSub.textContent="Elimination";
      var e=s.elimination||{matchups:{male:{},female:{}}};
      var desc=document.createElement("div"); desc.className="mini-card note"; desc.style.width="100%"; desc.style.maxWidth="900px";
      desc.innerHTML='<div><strong>Description:</strong> '+(e.description||"")+'</div>';

      function renderMatchup(title, a, b, winner){
        var box=document.createElement("div"); box.className="matchup";
        var A=renderProfile(a||""); var B=renderProfile(b||"");
        var vs=document.createElement("div"); vs.className="center"; vs.textContent="VS";
        box.appendChild(A); box.appendChild(vs); box.appendChild(B);

        var holder=document.createElement("div"); holder.className="center-btn";
        var btn=document.createElement("button"); btn.className="btn"; btn.textContent="Reveal Results ("+title+")";
        btn.onclick=function(){
          var awin=(winner===a), bwin=(winner===b);
          if(awin){ A.style.boxShadow="0 0 0 2px #42d77d inset"; B.style.boxShadow="0 0 0 2px #ff6565 inset"; }
          else if(bwin){ B.style.boxShadow="0 0 0 2px #42d77d inset"; A.style.boxShadow="0 0 0 2px #ff6565 inset"; }
          btn.remove();
        };
        holder.appendChild(btn);
        return {wrap:box,btn:holder};
      }

      var m=e.matchups.male||{}, f=e.matchups.female||{};
      var M=renderMatchup("Male", m.nominee||m.a, m.kill||m.b, m.winner);
      var F=renderMatchup("Female", f.nominee||f.a, f.kill||f.b, f.winner);

      epContent.innerHTML=""; epContent.appendChild(desc);
      epContent.appendChild(M.wrap); epContent.appendChild(M.btn);
      epContent.appendChild(F.wrap); epContent.appendChild(F.btn);
      addProceed(ep,section); return;
    }

    function renderFinalStage(stageIndex){
      var data = s.finals.stages[stageIndex-1];
      epSub.textContent = data.name || ("Final Stage "+stageIndex);
      var desc=document.createElement("div"); desc.className="mini-card note"; desc.style.width="100%"; desc.style.maxWidth="900px";
      desc.innerHTML='<div><strong>Description:</strong> '+(data.description||"")+'</div>';
      epContent.innerHTML=""; epContent.appendChild(desc);

      if(data.meta.type==="pair"){
        var ranks = (data.meta.pairs||[]).slice().sort(function(a,b){return a.total-b.total;});
        function pairBox(p){
          var extras={}; extras[p[0]]='<div class="muted">'+fmtTime(data.times[p[0]])+'</div>'; extras[p[1]]='<div class="muted">'+fmtTime(data.times[p[1]])+'</div>';
          return renderTeamBox(p, null, {compact:true, extras:extras});
        }

        var out3=document.createElement("div"); out3.className="row-flex";
        var out12=document.createElement("div"); out12.className="row-flex";

        var btn3=document.createElement("button"); btn3.className="btn"; btn3.textContent="Reveal 3rd Place";
        var btn2=document.createElement("button"); btn2.className="btn"; btn2.textContent="Reveal 2nd Place";
        var btn1=document.createElement("button"); btn1.className="btn"; btn1.textContent="Reveal 1st Place";

        btn3.onclick=function(){ if(ranks[2]){ out3.appendChild(pairBox(ranks[2].pair)); } btn3.remove(); };
        btn2.onclick=function(){ if(ranks[1]){ out12.appendChild(pairBox(ranks[1].pair)); } btn2.remove(); };
        btn1.onclick=function(){ if(ranks[0]){ out12.appendChild(pairBox(ranks[0].pair)); } btn1.remove(); };

        var controls=document.createElement("div"); controls.className="row-flex";
        controls.appendChild(btn3); controls.appendChild(btn2); controls.appendChild(btn1);

        epContent.appendChild(controls);
        epContent.appendChild(out3);
        epContent.appendChild(out12);
      } else {
        var idsM = aliveIds("male").slice();
        var idsF = aliveIds("female").slice();
        var tmap = data.times || {};
        function sortByTime(ids){ return ids.slice().sort(function(a,b){return (tmap[a]||0)-(tmap[b]||0);}); }
        var rM = sortByTime(idsM), rF = sortByTime(idsF);

        function row(title, list){
          var blk=document.createElement("div");
          var head=document.createElement("div"); head.className="center"; head.innerHTML="<strong>"+title+"</strong>";
          var row=document.createElement("div"); row.className="row-flex";
          list.forEach(function(id){ row.appendChild(renderProfile(id, '<div class="muted">'+fmtTime(tmap[id]||0)+'</div>')); });
          blk.appendChild(head); blk.appendChild(row); return blk;
        }

        var out3=document.createElement("div");
        var out2=document.createElement("div");
        var out1=document.createElement("div");

        var btn3=document.createElement("button"); btn3.className="btn"; btn3.textContent="Reveal 3rd Place (M/F)";
        var btn2=document.createElement("button"); btn2.className="btn"; btn2.textContent="Reveal 2nd Place (M/F)";
        var btn1=document.createElement("button"); btn1.className="btn"; btn1.textContent="Reveal 1st Place (M/F)";

        btn3.onclick=function(){
          var gM=rM[2]?[rM[2]]:[], gF=rF[2]?[rF[2]]:[];
          out3.innerHTML=""; 
          var rowWrap=document.createElement("div"); rowWrap.className="row-flex";
          gM.concat(gF).forEach(function(id){ rowWrap.appendChild(renderProfile(id, '<div class="muted">'+fmtTime(tmap[id]||0)+'</div>')); });
          out3.appendChild(row("3rd Place", gM.concat(gF)));
          btn3.remove();
        };
        btn2.onclick=function(){
          var gM=rM[1]?[rM[1]]:[], gF=rF[1]?[rF[1]]:[];
          out2.innerHTML="";
          var rowWrap=document.createElement("div"); rowWrap.className="row-flex";
          gM.concat(gF).forEach(function(id){ rowWrap.appendChild(renderProfile(id, '<div class="muted">'+fmtTime(tmap[id]||0)+'</div>')); });
          out2.appendChild(row("2nd Place", gM.concat(gF)));
          btn2.remove();
        };
        btn1.onclick=function(){
          var gM=rM[0]?[rM[0]]:[], gF=rF[0]?[rF[0]]:[];
          out1.innerHTML="";
          var rowWrap=document.createElement("div"); rowWrap.className="row-flex";
          gM.concat(gF).forEach(function(id){ rowWrap.appendChild(renderProfile(id, '<div class="muted">'+fmtTime(tmap[id]||0)+'</div>')); });
          out1.appendChild(row("1st Place", gM.concat(gF)));
          btn1.remove();
        };

        var controls=document.createElement("div"); controls.className="row-flex";
        controls.appendChild(btn3); controls.appendChild(btn2); controls.appendChild(btn1);

        epContent.appendChild(controls);
        epContent.appendChild(out3);
        epContent.appendChild(out2);
        epContent.appendChild(out1);
      }
    }

    if(section==="final1") return renderFinalStage(1);
    if(section==="final2") return renderFinalStage(2);
    if(section==="final3") return renderFinalStage(3);
    if(section==="final4") return renderFinalStage(4);
    if(section==="final5") return renderFinalStage(5);

    if(section==="final_results"){
      epSub.textContent="Final Results";
      var winners = { male: state.placements.winners.male, female: state.placements.winners.female };
      var seconds = { male: state.placements.second.male, female: state.placements.second.female };
      var thirds  = { male: state.placements.third.male,  female: state.placements.third.female };
      var cum = (state.episodes[12].finals.cumulativeTimes)||{};

      var shell=document.createElement("div"); shell.style.display="grid"; shell.style.gap="16px"; shell.style.justifyItems="center";

      function boxRow(title, ids, borderClass){
        var head=document.createElement("div"); head.className="center"; head.innerHTML="<strong>"+title+"</strong>";
        var row=document.createElement("div"); row.className="row-flex";
        ids.forEach(function(id){
          if(!id) return;
          var p=renderProfile(id, '<div class="muted">'+fmtTime(cum[id]||0)+'</div>');
          if(borderClass) p.classList.add(borderClass);
          row.appendChild(p);
        });
        var blk=document.createElement("div"); blk.appendChild(head); blk.appendChild(row); return blk;
      }

      shell.appendChild(boxRow("Winners", [winners.male, winners.female], "border-gold"));
      (function(){
        var head=document.createElement("div"); head.className="center"; head.innerHTML="<strong>Finalists</strong>";
        var row=document.createElement("div"); row.className="row-flex";
        [seconds.male, seconds.female].forEach(function(id){ if(id){ var p=renderProfile(id, '<div class="muted">'+fmtTime(cum[id]||0)+'</div>'); p.classList.add("border-silver"); row.appendChild(p);} });
        [thirds.male, thirds.female].forEach(function(id){ if(id){ var p=renderProfile(id, '<div class="muted">'+fmtTime(cum[id]||0)+'</div>'); p.classList.add("border-bronze"); row.appendChild(p);} });
        shell.appendChild(head); shell.appendChild(row);
      })();

      epContent.innerHTML=""; epContent.appendChild(shell);
      addProceed(ep,section); return;
    }
  }

  function showStatisticsPanel(which){
    epTitle.textContent = (which==="chart"?"Season Chart":(which==="placements"?"Placements":"Other Statistics"));
    epSub.textContent=""; epActions.innerHTML=""; epContent.innerHTML="";

    if(which==="placements"){
      var winners = state.placements.winners || {};
      var seconds = state.placements.second || {};
      var thirds  = state.placements.third  || {};
      var eliminated = (state.placements.eliminated || []).slice();

      function buildRank(g){
        var finals = state.finalRanks[g] || [];
        var alive = aliveIds(g);
        var everyone = finals.concat(eliminated.filter(function(id){return genderOf(id)===g;}));
        var seen=new Set(), out=[];
        [winners[g], seconds[g], thirds[g]].concat(everyone).forEach(function(id){
          if(id && !seen.has(id)){ seen.add(id); out.push(id); }
        });
        return out;
      }
      var rankM = buildRank("male");
      var rankF = buildRank("female");

      var wrap=document.createElement("div"); wrap.style.display="grid"; wrap.style.gap="16px"; wrap.style.justifyItems="center";

      (function(){
        var row=document.createElement("div"); row.className="row-flex";
        [winners.male, winners.female].forEach(function(id){ if(id){ var p=renderProfile(id); p.classList.add("border-gold"); row.appendChild(p); }});
        var head=document.createElement("div"); head.className="center"; head.innerHTML="<strong>Winners</strong>";
        wrap.appendChild(head); wrap.appendChild(row);
      })();

      (function(){
        var row=document.createElement("div"); row.className="row-flex";
        [seconds.male, seconds.female].forEach(function(id){ if(id){ var p=renderProfile(id); p.classList.add("border-silver"); row.appendChild(p); }});
        [thirds.male, thirds.female].forEach(function(id){ if(id){ var p=renderProfile(id); p.classList.add("border-bronze"); row.appendChild(p); }});
        var head=document.createElement("div"); head.className="center"; head.innerHTML="<strong>Finalists</strong>";
        wrap.appendChild(head); wrap.appendChild(row);
      })();

      (function(){
        var startPlace=4, endPlace=14;
        var remainingF = rankF.filter(function(id){return id!==winners.female && id!==seconds.female && id!==thirds.female;});
        var remainingM = rankM.filter(function(id){return id!==winners.male && id!==seconds.male && id!==thirds.male;});
        var rows=[], row=document.createElement("div"); row.className="row-flex";

        for(var place=startPlace; place<=endPlace; place++){
          var f = remainingF[place-4] || null;
          var m = remainingM[place-4] || null;
          if(f){ row.appendChild(renderProfile(f, '<div class="muted">'+place+'th — Female</div>')); }
          if(m){ row.appendChild(renderProfile(m, '<div class="muted">'+place+'th — Male</div>')); }
          if((place-startPlace+1)%3===0){ rows.push(row); row=document.createElement("div"); row.className="row-flex"; }
        }
        var head=document.createElement("div"); head.className="center"; head.innerHTML="<strong>Placements 4th–14th</strong>";
        wrap.appendChild(head); rows.forEach(function(r){ wrap.appendChild(r); }); if(row.children.length) wrap.appendChild(row);
      })();

      epContent.appendChild(wrap);

      var proceed=document.createElement("button"); proceed.className="btn proceed"; proceed.textContent="Proceed";
      proceed.onclick=function(){ showStatisticsPanel("other"); };
      epActions.appendChild(proceed);
      return;
    }

    if(which==="chart"){
      var open=document.createElement("a"); open.className="btn"; open.textContent="Open Season Chart"; open.href="./season_chart.html";
      epContent.appendChild(open);
      return;
    }

    if(which==="other"){
      var stats=state.stats||{dailyWins:{},elimWins:{},draws:{},killCards:{}};
      function byCount(obj){ return Object.entries(obj).reduce(function(map,kv){ var n=kv[1]; (map[n]=map[n]||[]).push(kv[0]); return map; },{}); }
      function col(title, obj){
        var col=document.createElement("div"); col.className="mini-card"; col.style.width="320px";
        var head='<div style="font-weight:700">'+title+'</div>'; var body=[];
        var groups = byCount(obj); var counts=Object.keys(groups).map(Number).sort(function(a,b){return b-a;});
        counts.forEach(function(n){
          var names = groups[n].map(function(id){return nameOf(id);}).join(", ");
          body.push('<div>'+n+': '+names+'</div>');
        });
        col.innerHTML=head+'<div style="display:grid;gap:6px;margin-top:6px">'+(body.join('')||'<div class="muted">—</div>')+'</div>';
        return col;
      }
      var wrap=document.createElement("div"); wrap.style.display="flex"; wrap.style.flexWrap="wrap"; wrap.style.gap="12px"; wrap.style.justifyContent="center";
      wrap.appendChild(col("Most Daily Wins", stats.dailyWins||{}));
      wrap.appendChild(col("Most Times in The Draw", stats.draws||{}));
      wrap.appendChild(col("Most Kill Cards Drawn", stats.killCards||{}));
      wrap.appendChild(col("Most Eliminations Won", stats.elimWins||{}));
      epContent.appendChild(wrap);

      var proceed=document.createElement("button"); proceed.className="btn proceed"; proceed.textContent="Proceed";
      proceed.onclick=function(){ showStatisticsPanel("chart"); };
      epActions.appendChild(proceed);
      return;
    }
  }

  document.getElementById("btn-simulate").onclick=function(){
    if(state.cast.filter(Boolean).length<28){ alert("Please choose 14 men and 14 women."); return; }
    simulateEntireSeason();
    state.simulated=true; State.save(state);
    buildLeftAccordion();
    document.getElementById("info-status").textContent="Simulated";
    document.getElementById("info-cast-size").textContent=state.players.filter(function(p){return p.alive;}).length;
    document.getElementById("stats-panel").style.display="block";
    document.getElementById("view-cast").hidden=true;
    document.getElementById("view-episode").hidden=false;
    showEpisodeSection(1,"format");
  };