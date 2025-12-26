(function(){
  "use strict";

  var IMG_BLANK="BlankProfile.webp";
var GOLD = "#d4af37";
var RED  = "#b30000";
var BLUE = "#0000ff";
var GREY = "#808080";

  var rnd = function(n){ return Math.floor(Math.random()*n); };
  var sample = function(arr){ return arr && arr.length ? arr[rnd(arr.length)] : undefined; };
  var shuffle = function(arr){ return arr.map(function(v){return [Math.random(),v];}).sort(function(a,b){return a[0]-b[0];}).map(function(x){return x[1];}); };
  var clamp = function(n,min,max){ return Math.max(min, Math.min(max,n)); };

function inc(map, key, amt){
  if(!map || key == null) return;
  map[key] = (map[key] || 0) + (amt == null ? 1 : amt);
}

  (function normalizePlayers(){
    if (Array.isArray(window.PLAYERS) && window.PLAYERS.length) return;
    var src = window.PLAYERS || window.players || window.player_data;
    if (!Array.isArray(src) || src.length === 0) {
      var pd = window.playerData;
      if (pd && (Array.isArray(pd.males) || Array.isArray(pd.females) || Array.isArray(pd.others))) {
var tag = function(arr, gender){
  return (Array.isArray(arr) ? arr : []).map(function(p){
    return {
      id: p.id,
      name: p.name,
      nickname: p.nickname || p.name || p.id,
      show: p.show,
      season: p.season,
      shows: p.shows || null,
      seasonsByShow: p.seasonsByShow || null,

      gender: gender || p.gender || "unknown",
      image: p.image || (p.id ? ("././contestant_pictures/" + p.id + ".webp") : IMG_BLANK)
    };
  });
};
        src = [].concat(tag(pd.males,"male"), tag(pd.females,"female"), tag(pd.others,null));
      } else { src = []; }
    }
    window.PLAYERS = src;
    window.PLAYERS_BY_ID = Object.fromEntries((src||[]).map(function(p){ return [p.id,p]; }));
  })();

  function allShowsOf(p){
    if (Array.isArray(p.shows) && p.shows.length){
      return p.shows.filter(Boolean);
    }
    return p.show ? [p.show] : [];
  }

  function playerHasShow(p, showName){
    if (!showName) return true;
    return allShowsOf(p).indexOf(showName) !== -1;
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
        return lowerSeasons.some(function(s){ return s.indexOf(token) !== -1; });
      });
      if (ok) return true;
    }

    return false;
  }

  function filterRosterByPrefs(prefs){
    var roster = window.PLAYERS || [];
    return (roster || []).filter(function(p){
      return playerMatchesPrefsForRandomize(p, prefs);
    });
  }

var KEY="challenge-bgasb-season";
var State={
  load:function(){
    try{
      return JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY)) || null;
    }catch(e){
      return null;
    }
  },
  save:function(s){
    var raw = JSON.stringify(s);
    sessionStorage.setItem(KEY, raw);
    try{ localStorage.setItem(KEY, raw); }catch(e){}
  },
  clear:function(){
    sessionStorage.removeItem(KEY);
    try{ localStorage.removeItem(KEY); }catch(e){}
  }
};

  var emptySlots = function(n){ return Array.from({length:n}).map(function(){return null;}); };

var state = State.load() || {
    seed: Math.random().toString(36).slice(2,8).toUpperCase(),
    cast: emptySlots(16),
    teams: null,
    players: [],

    relationships: {},
    profiles: {},
    episodes: {},
    ui: {},
    stats: { dailyWinsTeam:{}, elimWins:{}, elimPlays:{}, notPicked:{} },

    placements: { final:{ first:null, second:null, third:null }, eliminated:[] },
    chart:{ finalized:false, episodes:{} },

    simulated:false,
    lastView:null
  };

  var elTeams=document.getElementById("teams-grid");
  var elFilterShow=document.getElementById("filter-show");
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

  function asEntry(p){
    return { id:p.id, name:p.name||p.nickname||p.id, nickname:p.nickname||p.name||p.id,
             image:p.image||(p.id?("../../contestant_pictures/"+p.id+".webp"):IMG_BLANK), gender:p.gender||"unknown", show:p.show||"" };
  }
  function relKey(a,b){ return a<b ? (a+"|"+b) : (b+"|"+a); }
  function rel(a,b){ return state.relationships[relKey(a,b)] ?? 0; }

function applyRelDelta(a, b, delta){
  if(!a || !b || a===b) return;
  var k = relKey(a,b);
  var cur = state.relationships[k] ?? 0;
  state.relationships[k] = clamp(cur + (delta||0), -5, 5);
}

  function skillOf(pid, key){ var s = (state.profiles[pid] && (state.profiles[pid][key])) || 0; return typeof s === "number" ? clamp(s,-3,3) : 0; }
  function nameOf(pid){ var c = state.players.find(function(x){ return x && x.id===pid; }); return c ? (c.nickname || c.name || pid) : pid; }
  function picOf(pid){ var c = state.players.find(function(x){ return x && x.id===pid; }); return c ? (c.image || IMG_BLANK) : IMG_BLANK; }
  function profileMult(pid, compKey){ var v = skillOf(pid, compKey); return 1 + (v * 0.1); }
  function scorePlayerWeighted(weights, pid){
    var s=0; for(var k in (weights||{})){ if(Object.prototype.hasOwnProperty.call(weights,k)){
      var w=+weights[k]||0; s += w * profileMult(pid,k);
    }} return s;
  }

function rollLuckDelta(){
  var r = Math.random();

  if (r < 0.20) return 0;
  r -= 0.20;

  if (r < 0.10) return 1;
  r -= 0.10;
  if (r < 0.10) return 2;
  r -= 0.10;
  if (r < 0.10) return 3;
  r -= 0.10;
  if (r < 0.10) return 4;
  r -= 0.10;

  if (r < 0.10) return -1;
  r -= 0.10;
  if (r < 0.10) return -2;
  r -= 0.10;
  if (r < 0.10) return -3;

  return -4;
}

function buildLuckMap(ids){
  var m = {};
  (ids || []).forEach(function(pid){
    var d = rollLuckDelta();
    if(d) m[pid] = d;
  });
  return m;
}

function scorePlayerWeightedWithLuck(weights, pid, luckMap){
  var base = scorePlayerWeighted(weights, pid);
  var d = (luckMap && luckMap[pid]) ? luckMap[pid] : 0;
  return base + d;
}

  function ordinal(n){ var s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
function teamColorOf(pid){
    var p=state.players.find(function(x){return x.id===pid;});
    if(!p) return "var(--glass-border)";
    return (p.team==="gold") ? GOLD : (p.team==="red") ? RED : "var(--glass-border)";
  }

  function buildFilterShows(rosterList){
    var showMap = {};
    (rosterList || []).forEach(function(p){
      allShowsOf(p).forEach(function(s){
        if (s) showMap[s] = true;
      });
    });
    var shows = Object.keys(showMap).sort();

    var options = '<option value="">— All Shows —</option>' +
      shows.map(function(s){
        return '<option value="'+s+'">'+s+'</option>';
      }).join("");

    elFilterShow.innerHTML = options;
    elFilterShow.onchange = function(){
      buildCastGrid(rosterList || []);
    };
  }

  function normalizeNeededGender(g){
    return g==="women" ? "female" : g==="men" ? "male" : g;
  }

  function playerOptions(roster, genderNeeded, selectedId){
    var showFilter = elFilterShow.value;
    var need = normalizeNeededGender(genderNeeded);

    var filtered = (roster || []).filter(function(r){
      var okShow = (!showFilter || playerHasShow(r, showFilter));
      return !need ? okShow : (okShow && r.gender === need);
    });

    var opts = ['<option value="">Choose</option>'];
    for (var i = 0; i < filtered.length; i++){
      var r = filtered[i];
      var sel = (selectedId && r.id === selectedId) ? " selected" : "";
      opts.push(
        '<option value="'+r.id+'"'+sel+'>'+ (r.name || r.nickname || r.id) +'</option>'
      );
    }
    return opts.join("");
  }

function ensureCastPickCSS(){
  if (document.getElementById("cast-pick-css")) return;

  var css = `
    .pick-row{
      display:flex;
      gap:14px;
      justify-content:center;
      align-items:stretch;
      flex-wrap:wrap;
      width:100%;
      max-width:980px;
      margin:0 auto;
    }
    .pick-card{
      flex: 0 1 calc(25% - 14px);
      min-width:200px;
      max-width:240px;
      box-sizing:border-box;
    }
    .pick-card .avatar{
      width:90px;
      height:90px;
      border-radius:14px;
      object-fit:cover;
    }
    .pick-card select.pick-player{
      width:100%;
      max-width:100%;
      box-sizing:border-box;
    }
    .pick-card label.name{
      text-align:center;
      display:block;
    }
  `;

  var st = document.createElement("style");
  st.id = "cast-pick-css";
  st.textContent = css;
  document.head.appendChild(st);
}

  function castPickRow(startIndex, roster){
    var row = document.createElement("div"); row.className="pick-row";
    for(var i=startIndex; i<Math.min(startIndex+4, 16); i++){
      var slot = state.cast[i] || null;
      var title = "Contestant " + (i + 1);
      var card = document.createElement("div"); card.className="pick-card";
      var selectId = "sel_cast_" + i;

      card.innerHTML =
        '<img class="avatar" src="'+(slot? slot.image : IMG_BLANK)+'" alt="">' +
        '<label for="'+selectId+'" class="name">'+(slot? (slot.nickname || slot.name) : title)+'</label>' +
        '<select class="pick-player" id="'+selectId+'" name="'+selectId+'" data-slot="'+i+'" autocomplete="off">'+
           playerOptions(window.PLAYERS||[], "women", slot? slot.id : "") +
        '</select>' +
        '<button class="btn btn-custom" data-slot="'+i+'" type="button">Custom Player</button>';

      card.dataset.slot = i;
      row.appendChild(card);
    }
    return row;
  }

function buildCastGrid(roster){
  ensureCastPickCSS();
  elTeams.innerHTML="";
    for(var i=0; i<16; i+=4){
      elTeams.appendChild(castPickRow(i, roster));
    }

    elTeams.querySelectorAll(".pick-player").forEach(function(sel){
      sel.onchange = function(e){
        var slot = +e.target.dataset.slot;
        var id = e.target.value || "";

        if(!id){
          state.cast[slot] = null;
          State.save(state);
          return buildCastGrid(roster||[]);
        }

        var p = (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id]) ||
                (roster||[]).find(function(r){ return r.id===id; });

        if(!p || p.gender !== "female") return;
        for(var i=0;i<state.cast.length;i++){
          if(i!==slot && state.cast[i] && state.cast[i].id === id){
            state.cast[i] = null;
          }
        }

        state.cast[slot] = asEntry(p);
        State.save(state);
        buildCastGrid(roster||[]);
      };
    });

    elTeams.querySelectorAll(".btn-custom").forEach(function(btn){
      btn.onclick = function(){ openCustomModal(+btn.dataset.slot); };
    });

    var total = state.cast.filter(Boolean).length;
    elInfoCast.textContent = total + " / 16";
  }

  var modal = document.createElement("dialog");
  modal.className = "antm-modal";
  modal.innerHTML = '<form id="custom-form" method="dialog" autocomplete="on">'+
    '<h3>Add Custom Player</h3>'+
    '<label for="cp-name">Full Name</label><input name="cp-name" id="cp-name" required autocomplete="name" />'+
    '<label for="cp-nickname">Nickname</label><input name="cp-nickname" id="cp-nickname" required autocomplete="nickname" />'+
    '<label for="cp-image">Image URL</label><input name="cp-image" id="cp-image" placeholder="https://..." autocomplete="url" />'+
    '<menu><button type="button" class="btn" id="modal-cancel">Cancel</button>'+
      '<button type="submit" class="btn" id="modal-add">Add</button></menu>'+
  '</form>';
  document.body.appendChild(modal);

function openCustomModal(slot){
    modal.showModal();
    var formCustom = modal.querySelector("#custom-form");
    var cancelBtn = modal.querySelector("#modal-cancel");

    formCustom.onsubmit = function(ev){
      ev.preventDefault();
      var name = formCustom.querySelector("#cp-name").value.trim();
      var nickname = formCustom.querySelector("#cp-nickname").value.trim();
      var image = formCustom.querySelector("#cp-image").value.trim();
      if(!name || !nickname){ return; }
      var id = nickname.toLowerCase().replace(/[^a-z0-9]+/g,"_") + "_" + Date.now().toString(36);
      var cp = {
        id: id,
        name: name,
        nickname: nickname,
        gender: "female",
        show: "Custom",
        image: image || IMG_BLANK
      };

      state.cast[slot] = asEntry(cp);
      State.save(state);
      modal.close();
      formCustom.reset();
      buildCastGrid(window.PLAYERS || []);
    };

    cancelBtn.onclick = function(){
      modal.close();
    };
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

  function randomizeCastWithPrefsCutthroat(prefs){
    var roster = filterRosterByPrefs(prefs);
    var females = shuffle(roster.filter(function(p){ return p.gender === "female"; }));

    if (females.length < 16){
      alert("Not enough eligible players (need 16 women) for the selected filters.");
      return;
    }

    state.cast = females.slice(0, 16).map(asEntry);
    State.save(state);
    buildCastGrid(window.PLAYERS || []);
  }

  function openRandomizeModalCT(){
    if (!window.PLAYERS || !window.PLAYERS.length){
      alert("No player data loaded (././player_data.js).");
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
      randomizeCastWithPrefsCutthroat(prefs);
    };

    btnCancel.onclick = function(){
      randModal.close();
    };
  }

  document.getElementById("btn-reset-session").addEventListener("click", function(e){ e.preventDefault(); State.clear(); location.reload(); });
document.getElementById("btn-profiles").addEventListener("click", function(){
  State.save(state);
  location.href = "./profiles.html";
});
document.getElementById("btn-relationships").addEventListener("click", function(){
  State.save(state);
  location.href = "./relationships.html";
});
document.getElementById("btn-randomize").addEventListener("click", function(){
  openRandomizeModalCT();
});

document.getElementById("btn-back-cast").addEventListener("click", function(e){
    e.preventDefault();
    var prevCast = state.cast;
    var prevProfiles = state.profiles || {};
    var prevRelationships = state.relationships || {};
    state = {
      seed: Math.random().toString(36).slice(2,8).toUpperCase(),
      cast: prevCast,
      teams: null,
      players: [],

      relationships: prevRelationships,
      profiles: prevProfiles,

      episodes: {},
      ui: {},

      stats: { dailyWinsTeam:{}, elimWins:{}, elimPlays:{}, notPicked:{} },
      placements: { final:{ first:null, second:null, third:null }, eliminated:[] },
      chart: { finalized:false, episodes:{} },

      simulated:false,
      lastView: null
    };

    State.save(state);

    elAccordion.innerHTML = "";
    viewEpisode.hidden = true;
    viewCast.hidden = false;
    elInfoStatus.textContent = "Not simulated";
    elInfoSeed.textContent = state.seed;
    statsPanel.style.display = "none";
    buildCastGrid(window.PLAYERS || []);
  });

document.getElementById("btn-reset-cast").onclick=function(){
  state.cast = emptySlots(16);
  state.profiles = {};
  state.relationships = {};
  state.teams = null;
  state.players = [];
  state.episodes = {};
  state.ui = {};
  state.stats = { dailyWinsTeam:{}, elimWins:{}, elimPlays:{}, notPicked:{} };
  state.placements = { final:{ first:null, second:null, third:null }, eliminated:[] };
  state.chart = { finalized:false, episodes:{} };
  state.simulated = false;
  state.lastView = null;

  State.save(state);
  buildCastGrid(window.PLAYERS||[]);
};


  (function init(){
    var src=window.PLAYERS||[];
    var warn=document.getElementById("data-warning");
    if(!Array.isArray(src)||!src.length){
      warn.style.display="block";
      buildFilterShows([]); buildCastGrid([]);
    } else {
      warn.style.display="none";
      buildFilterShows(src); buildCastGrid(src);
    }
    document.getElementById("info-seed").textContent=state.seed;

    if(state.simulated){
      buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false;
      var last=state.lastView||{ep:1,section:"format"}; showEpisodeSection(last.ep,last.section);
      document.getElementById("info-status").textContent="Simulated";
      var total = (state.cast || []).filter(Boolean).length;
      if(!total && Array.isArray(state.players) && state.players.length){
        total = state.players.filter(function(p){ return p && p.alive !== false; }).length;
      }
      elInfoCast.textContent = total + " / 16";
      statsPanel.style.display="block";
    }
    document.getElementById("goto-placements").onclick=function(){ showStatisticsPanel("placements"); };
document.getElementById("goto-other-stats").onclick=function(){ showStatisticsPanel("other_stats"); };
    document.getElementById("goto-chart").onclick=function(){ showStatisticsPanel("chart"); };
  })();

function setAliveFromCast(){
    state.players = (state.cast || []).filter(Boolean).map(function(c){
      return {
        id: c.id,
        name: c.name,
        nickname: c.nickname,
        image: c.image,
        gender: "female",
        alive: true,
        team: null
      };
    });
  }

  function aliveIds(){ return state.players.filter(function(p){return p.alive!==false;}).map(function(p){return p.id;}); }
  function aliveTeam(teamKey){ return state.players.filter(function(p){return p.alive!==false && p.team===teamKey}).map(function(p){return p.id;}); }
  function teamOf(id){ var p=state.players.find(function(x){return x.id===id;}); return p?p.team:null; }

  function teamFromSnapshot(idsSnapshot, teamKey){
    var set = new Set(idsSnapshot||[]);
    return state.players.filter(function(p){ return set.has(p.id) && p.team===teamKey; }).map(function(p){ return p.id; });
  }
  function womenFrom(ids){ return ids.map(function(id){return state.players.find(function(p){return p.id===id;});}).filter(Boolean).filter(function(p){return p.gender==="female";}).map(function(p){return p.id;}); }
  function menFrom(ids){ return ids.map(function(id){return state.players.find(function(p){return p.id===id;});}).filter(Boolean).filter(function(p){return p.gender==="male";}).map(function(p){return p.id;}); }

  function renderNames(t, ids){ var out=t||""; var labels=["{A}","{B}","{C}"]; (ids||[]).forEach(function(pid,i){ out = out.split(labels[i]).join(nameOf(pid)); }); return out; }

  function renderHighlightsInto(container, comments, weights, idsPool, randomOnly){
    var wrap=document.createElement("div"); wrap.className="events-grid three-cols";
    var pool=(idsPool && idsPool.length? idsPool.slice() : aliveIds());
    if(!pool.length){
      container.innerHTML='<p class="muted">No players available for highlights.</p>';
      return;
    }
    var desired = 6;
    var take = Math.min(desired, pool.length);

    var scored;
    if(randomOnly){
      pool = shuffle(pool);
      scored = pool.map(function(pid, idx){ return { pid:pid, idx:idx }; });
    } else {
      scored = pool.map(function(pid){
        return { pid:pid, score:scorePlayerWeighted(weights||{}, pid) };
      }).sort(function(a,b){ return a.score - b.score; });
    }

    var pos=(comments&&comments.positive)||[], neu=(comments&&comments.neutral)||[], neg=(comments&&comments.negative)||[];
    for(var i=0;i<take;i++){
      var pid = scored[i].pid;
      var bucket = (i < Math.ceil(take/3)) ? pos : (i < Math.ceil(2*take/3) ? neu : neg);
      var template = (bucket && bucket.length) ? sample(bucket) : "{A} competes.";
      var secondObj = scored[(i+1)%take];
      var second = secondObj ? secondObj.pid : pid;
      var text = template.replaceAll("{A}", nameOf(pid)).replaceAll("{B}", nameOf(second));
 var card=document.createElement("div"); card.className="mini-card";
card.style.border = "3px solid " + teamColorOf(pid);
card.style.borderRadius = "14px";
      card.innerHTML = '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(pid)+'" alt=""></div><div>'+text+'</div>';
      wrap.appendChild(card);
    }
    container.innerHTML=""; container.appendChild(wrap);
  }

  function finalData(){
  if(window.BGASB_FINAL_DATA && typeof window.BGASB_FINAL_DATA === "object"){
    return window.BGASB_FINAL_DATA;
  }
  if(Array.isArray(window.BGASB_FINAL_STAGE_DATA)){
    return {
      rules: (window.BGASB_FINAL_RULES || ""),
      stages: window.BGASB_FINAL_STAGE_DATA
    };
  }

  return window.CT_FINAL_DATA || window.FINAL_DATA || { rules:"", stages:[] };
}

document.getElementById("btn-simulate").onclick=function(){
    var total = (state.cast || []).filter(Boolean).length;
    if(total !== 16){
      alert("Please fill all 16 cast slots (female only).");
      return;
    }

    setAliveFromCast();
    simulateSeason();

    state.simulated=true;
    State.save(state);

    buildLeftAccordion();
    viewCast.hidden=true;
    viewEpisode.hidden=false;

    showEpisodeSection(1, "format");
    document.getElementById("info-status").textContent="Simulated";
    document.getElementById("info-seed").textContent=state.seed;
    statsPanel.style.display="block";
  };

function ensureUsedPools(){
  state.ui = state.ui || {};

  if(!state.ui.usedChallenges){
    state.ui.usedChallenges = { captain:{}, team:{}, battle:{}, final:{} };
  }

  if(!state.ui.usedEvents){
    state.ui.usedEvents = {
      events1: {},
      events2: { positive:{}, neutral:{}, negative:{} },
      events3: { neutral:{}, positive:{} }
    };
  }
}

function pickUnusedChallenge(list, usedMap, predicate){
  var pool=(list||[]).filter(function(c){
    if(!c || !c.id) return false;
    if(usedMap && usedMap[c.id]) return false;
    if(predicate && !predicate(c)) return false;
    return true;
  });
  if(!pool.length) return null;
  return sample(pool);
}

function getBGASBEventsData(){
  var ED = window.BGASB_EVENTS_DATA;
  if(!ED) return {
    events1: [],
    events2: { positive:[], neutral:[], negative:[] },
    events3: { neutral:[], positive:[] }
  };
  ED.events1 = ED.events1 || [];
  ED.events2 = ED.events2 || { positive:[], neutral:[], negative:[] };
  ED.events2.positive = ED.events2.positive || [];
  ED.events2.neutral  = ED.events2.neutral  || [];
  ED.events2.negative = ED.events2.negative || [];
  ED.events3 = ED.events3 || { neutral:[], positive:[] };
  ED.events3.neutral  = ED.events3.neutral  || [];
  ED.events3.positive = ED.events3.positive || [];
  return ED;
}

function fillEventText(tpl, A, B, C){
  var s = String(tpl || "");
  if(A != null) s = s.replace(/\{A\}/g, nameOf(A));
  if(B != null) s = s.replace(/\{B\}/g, nameOf(B));
  if(C != null) s = s.replace(/\{C\}/g, nameOf(C));
  return s;
}

function pickDistinct(ids, n){
  var pool = (ids||[]).slice();
  var out = [];
  while(out.length < n && pool.length){
    var pick = sample(pool);
    out.push(pick);
    pool.splice(pool.indexOf(pick), 1);
  }
  return out;
}

function pickUniqueTemplate(pool, usedMap){
  pool = pool || [];
  usedMap = usedMap || {};
  if(!pool.length) return "";
  for(var tries=0; tries<30; tries++){
    var tpl = sample(pool);
    if(!usedMap[tpl]){
      usedMap[tpl] = true;
      return tpl;
    }
  }

  return sample(pool);
}

function rollEvents2Type(){
  var r = Math.random();
  if(r < 0.25) return "positive";
  if(r < 0.65) return "neutral";
  return "negative";
}

function rollEvents2TypeForPair(A, B){
  var posW = 0.25, neuW = 0.40, negW = 0.35;
  var rAB = rel(A,B);
  var tA = skillOf(A, "temperament");
  var tB = skillOf(B, "temperament");
  var lA = skillOf(A, "loyalty");
  var lB = skillOf(B, "loyalty");

  var posMul = 1;
  var negMul = 1;

  if(rAB >= 4) negMul *= 0.50;
  if(rAB === -1) negMul *= 1.30;
  if(rAB <= -2)  negMul *= 1.50;

  if(rAB <= 0){
    if(tA <= -2) negMul *= (tA <= -3 ? 1.50 : 1.30);
    if(tB <= -2) negMul *= (tB <= -3 ? 1.50 : 1.30);
  }

  if(tA >= 2){
    posMul *= (tA >= 3 ? 1.30 : 1.20);
    negMul *= (tA >= 3 ? 0.50 : 0.75);
  }
  if(tB >= 2){
    posMul *= (tB >= 3 ? 1.30 : 1.20);
    negMul *= (tB >= 3 ? 0.50 : 0.75);
  }

  if(rAB >= 4){
    if(lA >= 3 || lB >= 3){
      negW = 0;
    } else {
      if(lA === 2) negMul *= 0.50;
      else if(lA === 1) negMul *= 0.75;

      if(lB === 2) negMul *= 0.50;
      else if(lB === 1) negMul *= 0.75;
    }
  }

  posW *= posMul;
  negW *= negMul;

  var total = posW + neuW + negW;
  var x = Math.random() * total;

  if(x < posW) return "positive";
  x -= posW;
  if(x < neuW) return "neutral";
  return "negative";
}

function rollEvents3Type(){
  return (Math.random() < 0.30) ? "positive" : "neutral";
}

function genEvents1(ids, count){
  ensureUsedPools();
  var ED = getBGASBEventsData();
  var used = state.ui.usedEvents.events1;

  var out = [];
  count = count || 6;
  if(!ids || !ids.length) return out;

  for(var i=0;i<count;i++){
    var A = sample(ids);
    var tpl = pickUniqueTemplate(ED.events1, used);
    if(!tpl) break;
    out.push({ players:[A], text: fillEventText(tpl, A) });
  }
  return out;
}

function genEvents2(ids, count){
  ensureUsedPools();
  var ED = getBGASBEventsData();

  var out = [];
  count = count || 6;
  if(!ids || ids.length < 2) return out;

  for(var i=0;i<count;i++){
    var pair = pickDistinct(ids, 2);
    if(pair.length < 2) break;
    var A = pair[0], B = pair[1];

    var t = rollEvents2TypeForPair(A, B);
    var pool = (ED.events2 && ED.events2[t]) ? ED.events2[t] : [];
    var used = state.ui.usedEvents.events2[t];

    var tpl = pickUniqueTemplate(pool, used);
    if(!tpl) break;

    if(t === "positive") applyRelDelta(A, B, +1);
if(t === "negative") applyRelDelta(A, B, -1);
out.push({ players:[A,B], tone:t, text: fillEventText(tpl, A, B) });

  }
  return out;
}

function genEvents3(ids, count){
  ensureUsedPools();
  var ED = getBGASBEventsData();

  var out = [];
  count = count || 6;
  if(!ids || ids.length < 3) return out;

  for(var i=0;i<count;i++){
    var trio = pickDistinct(ids, 3);
    if(trio.length < 3) break;
    var A = trio[0], B = trio[1], C = trio[2];

    var t = rollEvents3Type();
    var pool = (ED.events3 && ED.events3[t]) ? ED.events3[t] : [];
    var used = state.ui.usedEvents.events3[t];

    var tpl = pickUniqueTemplate(pool, used);
    if(!tpl) break;

    out.push({ players:[A,B,C], text: fillEventText(tpl, A, B, C) });
  }
  return out;
}

function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genMixedHouseEvents(ids, count){
  ensureUsedPools();
  var ED = getBGASBEventsData();
  var out = [];
  if(!ids || !ids.length) return out;

  count = count || 4;

  for(var i=0; i<count; i++){
    var r = Math.random();

    var want3 = (ids.length >= 3) && (r < 0.20);
    var want2 = (ids.length >= 2) && (r >= 0.20 && r < 0.70);

    if(want3){
      var trio = pickDistinct(ids, 3);
      if(trio.length < 3) continue;

      var t3 = rollEvents3Type();
      var pool3 = (ED.events3 && ED.events3[t3]) ? ED.events3[t3] : [];
      var used3 = state.ui.usedEvents.events3[t3];
      var tpl3 = pickUniqueTemplate(pool3, used3);
      if(!tpl3) continue;

      out.push({
        players: [trio[0], trio[1], trio[2]],
        text: fillEventText(tpl3, trio[0], trio[1], trio[2])
      });

} else if(want2){
  var pair = pickDistinct(ids, 2);
  if(pair.length < 2) continue;

  var A2 = pair[0], B2 = pair[1];

  var t2 = rollEvents2TypeForPair(A2, B2);
  var pool2 = (ED.events2 && ED.events2[t2]) ? ED.events2[t2] : [];
  var used2 = state.ui.usedEvents.events2[t2];
  var tpl2 = pickUniqueTemplate(pool2, used2);
  if(!tpl2) continue;
  if(t2 === "positive") applyRelDelta(A2, B2, +1);
  if(t2 === "negative") applyRelDelta(A2, B2, -1);

  out.push({
    players: [A2, B2],
    tone: t2,
    text: fillEventText(tpl2, A2, B2)
  });

} else {
      var A = sample(ids);
      var pool1 = ED.events1 || [];
      var used1 = state.ui.usedEvents.events1;
      var tpl1 = pickUniqueTemplate(pool1, used1);
      if(!tpl1) continue;

      out.push({
        players: [A],
        text: fillEventText(tpl1, A)
      });
    }
  }

  return out;
}

function populateEpisodeEvents(ep, aliveIds){
  var E = state.episodes[ep];
  if(!E) return;

  var order = bgasbSectionOrder(ep) || [];
  if(order.indexOf("events1") !== -1 && (!E.events1 || !E.events1.length)){
    E.events1 = genMixedHouseEvents(aliveIds, randInt(3, 6));
  }
  if(order.indexOf("events2") !== -1 && (!E.events2 || !E.events2.length)){
    E.events2 = genMixedHouseEvents(aliveIds, randInt(3, 6));
  }
  if(order.indexOf("events3") !== -1 && (!E.events3 || !E.events3.length)){
    E.events3 = genMixedHouseEvents(aliveIds, randInt(3, 6));
  }
}

function topTwoByScore(ids, weights){
  var scored = (ids||[]).map(function(pid){
    return { pid: pid, s: scorePlayerWeighted(weights||{}, pid) };
  }).sort(function(a,b){
    if(b.s!==a.s) return b.s-a.s;
    return Math.random()<0.5?-1:1;
  });
  return scored.slice(0,2).map(function(x){ return x.pid; });
}

function renderHighlightsIntoByScore(container, comments, weights, idsPool, desired, teamMap, luckMap){
  var wrap=document.createElement("div"); wrap.className="events-grid three-cols";
  var pool=(idsPool && idsPool.length ? idsPool.slice() : aliveIds());
  if(!pool.length){
    container.innerHTML='<p class="muted">No players available for highlights.</p>';
    return;
  }

  var take = Math.min(desired||6, pool.length);
  pool = shuffle(pool).slice(0, take);

  var scored = pool.map(function(pid){
    return { pid:pid, score:scorePlayerWeightedWithLuck(weights||{}, pid, luckMap) };
  }).sort(function(a,b){
    if(b.score!==a.score) return b.score-a.score;
    return Math.random()<0.5?-1:1;
  });

  var pos=(comments&&comments.positive)||[], neu=(comments&&comments.neutral)||[], neg=(comments&&comments.negative)||[];

  for(var i=0;i<scored.length;i++){
    var pid=scored[i].pid;
    var bucket = (i < Math.ceil(take/3)) ? pos : (i < Math.ceil(2*take/3) ? neu : neg);
    var template = bucket.length ? sample(bucket) : "{A} competes.";
    var second = scored[(i+1)%take].pid;
    var text = template.replaceAll("{A}", nameOf(pid)).replaceAll("{B}", nameOf(second));

    var card=document.createElement("div"); card.className="mini-card";
var col = teamColorOf(pid);
if (teamMap && teamMap[pid] === "gold") col = GOLD;
else if (teamMap && teamMap[pid] === "red") col = RED;
card.style.border = "3px solid " + col;
    card.innerHTML =
      '<div class="row tiny-avatars">' +
        '<img class="avatar xs" src="'+picOf(pid)+'" alt="">' +
        '<div class="tiny-name">'+nameOf(pid)+'</div>' +
      '</div>' +
      '<div class="muted">'+text+'</div>';

    wrap.appendChild(card);
  }

  container.innerHTML="";
  container.appendChild(wrap);
}

function buildHighlightsByScoreList(comments, weights, idsPool, desired){
  var pool = (idsPool && idsPool.length) ? idsPool.slice() : aliveIds();
  if(!pool.length) return [];

  var take = Math.min(desired || 6, pool.length);
  pool = shuffle(pool).slice(0, take);

  var scored = pool.map(function(pid){
    return { pid: pid, score: scorePlayerWeighted(weights || {}, pid) };
  }).sort(function(a,b){
    if(b.score !== a.score) return b.score - a.score;
    return Math.random() < 0.5 ? -1 : 1;
  });

  var topK = Math.max(1, Math.floor(take/3));
  var botK = topK;
  var midK = take - topK - botK;

  function safeLine(tone, pid){
    var arr = (comments && comments[tone]) ? comments[tone] : [];
    var fallback =
      tone==="positive" ? "{A} crushes it and looks unstoppable." :
      tone==="negative" ? "{A} struggles badly and falls behind." :
                          "{A} does fine, but nothing crazy.";
    var line = (arr && arr.length) ? sample(arr) : fallback;
    return String(line).replace(/\{A\}/g, nameOf(pid));
  }

  var out = [];
  for(var i=0;i<scored.length;i++){
    var tone = (i < topK) ? "positive" : (i >= topK + midK) ? "negative" : "neutral";
    out.push({ pid: scored[i].pid, tone: tone, text: safeLine(tone, scored[i].pid) });
  }
  return out;
}

function buildTeamChallengeHighlightsList(TC, goldIds, redIds){
  function pickN(arr,n){ return shuffle((arr||[]).slice()).slice(0, Math.min(n, (arr||[]).length)); }
  var g = pickN(goldIds, 3);
  var r = pickN(redIds, 3);
  var picks = g.concat(r);
  if(!picks.length) return [];

  var scored = picks.map(function(pid){
    return { pid: pid, score: scorePlayerWeighted(TC.skillWeights || {}, pid) };
  });

  var scoreList = scored.map(function(x){return x.score;}).slice().sort(function(a,b){return a-b;});
  var lo = scoreList[Math.floor(scoreList.length/3)] ?? scoreList[0];
  var hi = scoreList[Math.floor(scoreList.length*2/3)] ?? scoreList[scoreList.length-1];

  function toneFor(score){
    if(score >= hi) return "positive";
    if(score <= lo) return "negative";
    return "neutral";
  }

  function safeLine(tone, pid){
    var arr = (TC.comments && TC.comments[tone]) ? TC.comments[tone] : [];
    var fallback =
      tone==="positive" ? "{A} shines for her team." :
      tone==="negative" ? "{A} drags the team down." :
                          "{A} holds steady.";
    var line = (arr && arr.length) ? sample(arr) : fallback;
    return String(line).replace(/\{A\}/g, nameOf(pid));
  }

  return scored.map(function(x){
    var tone = toneFor(x.score);
    return { pid: x.pid, tone: tone, text: safeLine(tone, x.pid) };
  });
}

function renderHighlightsFromList(container, list, teamMap){
  var wrap=document.createElement("div"); wrap.className="events-grid three-cols";
  if(!list || !list.length){
    container.innerHTML='<p class="muted">No highlights available.</p>';
    return;
  }

  list.forEach(function(h){
    var pid=h.pid;
    var col = "var(--glass-border)";
    if(teamMap && teamMap[pid]==="gold") col = GOLD;
    else if(teamMap && teamMap[pid]==="red") col = RED;

    var card=document.createElement("div"); card.className="mini-card";
    card.style.border = "3px solid " + col;

    card.innerHTML =
      '<div class="row tiny-avatars">' +
        '<img class="avatar xs" src="'+picOf(pid)+'" alt="">' +
        '<div class="tiny-name">'+nameOf(pid)+'</div>' +
      '</div>' +
      '<div class="muted">'+(h.text||"")+'</div>';

    wrap.appendChild(card);
  });

  container.innerHTML="";
  container.appendChild(wrap);
}

function bgasbSectionOrder(ep){
  if(ep===1) return ["format","status","events1","captain","teamselect","events2","team","events3","nominations","voting"];
  if(ep>=2 && ep<=6) return ["status","events1","captain","events2","team","events3","nominations","voting"];
  if(ep>=7 && ep<=11) return ["status","events1","battle","events2","nominations","voting"];
if(ep===12) return ["status","events1","battle","events2","voting","final_format","final_part1","final_part2","final_results"];
}

function pickBestRel(captainId, remainingIds){
  var bestVal = -Infinity, best = [];
  (remainingIds || []).forEach(function(pid){
    var v = rel(captainId, pid);
    if(v > bestVal){ bestVal = v; best = [pid]; }
    else if(v === bestVal){ best.push(pid); }
  });
  return best.length ? sample(best) : null;
}

function draftTeamsEpisode1(allIds, goldCaptainId, redCaptainId){
  var gold = [goldCaptainId], red = [redCaptainId];
  var remaining = (allIds || []).filter(function(pid){
    return pid !== goldCaptainId && pid !== redCaptainId;
  });

  var picks = [];
  var turn = "gold";

  while(remaining.length){
    var cap = (turn === "gold") ? goldCaptainId : redCaptainId;
    var pick = pickBestRel(cap, remaining) || remaining[0];

    picks.push({ team: turn, captain: cap, pick: pick });

    if(turn === "gold") gold.push(pick);
    else red.push(pick);

    remaining.splice(remaining.indexOf(pick), 1);
    turn = (turn === "gold") ? "red" : "gold";
  }

  return { gold: gold, red: red, picks: picks };
}

function assignTeamsToPlayers(goldIds, redIds){
  state.players.forEach(function(p){
    if(goldIds.indexOf(p.id) !== -1) p.team = "gold";
    else if(redIds.indexOf(p.id) !== -1) p.team = "red";
    else p.team = null;
  });
}

function teamAvgScore(teamIds, weights, luckMap){
  var ids = (teamIds || []).slice();
  if(!ids.length) return -Infinity;
  var sum = 0;
  for(var i=0;i<ids.length;i++){
    sum += scorePlayerWeightedWithLuck(weights||{}, ids[i], luckMap);
  }
  return sum / ids.length;
}

function buildHighlightCardsByScore(comments, weights, idsPool, take){
  var ids = shuffle((idsPool||[]).slice());
  take = Math.min(take||0, ids.length);
  ids = ids.slice(0, take);

  var scored = ids.map(function(pid){
    return { pid: pid, score: scorePlayerWeighted(weights||{}, pid) };
  }).sort(function(a,b){
    if(b.score!==a.score) return b.score-a.score;
    return Math.random()<0.5?-1:1;
  });

  var pos=(comments&&comments.positive)||[], neu=(comments&&comments.neutral)||[], neg=(comments&&comments.negative)||[];
  var out = [];

  for(var i=0;i<scored.length;i++){
    var pid = scored[i].pid;
    var bucket = (i < Math.ceil(take/3)) ? pos : (i < Math.ceil(2*take/3) ? neu : neg);
    var template = bucket.length ? sample(bucket) : "{A} competes.";
    var second = scored[(i+1)%take].pid;
    var text = template.replaceAll("{A}", nameOf(pid)).replaceAll("{B}", nameOf(second));

var card=document.createElement("div"); card.className="mini-card";
card.style.border = "3px solid " + teamColorOf(pid);
card.style.borderRadius = "14px";
    card.innerHTML =
      '<div class="row tiny-avatars">' +
        '<img class="avatar xs" src="'+picOf(pid)+'" alt="">' +
        '<div class="tiny-name">'+nameOf(pid)+'</div>' +
      '</div>' +
      '<div class="muted">'+text+'</div>';

    out.push(card);
  }

  return out;
}

function pickWorstRelAmong(voterId, options){
  var min = Infinity, tied = [];
  (options||[]).forEach(function(pid){
    var v = rel(voterId, pid);
    if(v < min){ min = v; tied = [pid]; }
    else if(v === min){ tied.push(pid); }
  });
  return tied.length ? sample(tied) : null;
}

function pickTwoWorstRel(voterId, candidates){
  var pool = (candidates||[]).slice();
  var a = pickWorstRelAmong(voterId, pool);
  if(a!=null) pool.splice(pool.indexOf(a), 1);
  var b = pickWorstRelAmong(voterId, pool);
  return [a,b].filter(function(x){ return x!=null; });
}

function tallyCount(list, getter){
  var t = {};
  (list||[]).forEach(function(item){
    var k = getter(item);
    if(!k) return;
    t[k] = (t[k]||0) + 1;
  });
  return t;
}

function topNFromTally(tally, n){
  var entries = Object.keys(tally||{}).map(function(pid){
    return { pid: pid, c: tally[pid] };
  });

  entries.sort(function(a,b){
    if(b.c!==a.c) return b.c-a.c;
    return Math.random()<0.5 ? -1 : 1;
  });

  var out = [];
  while(out.length < n && entries.length){
    var score = entries[0].c;
    var group = entries.filter(function(e){ return e.c === score; });
    entries = entries.filter(function(e){ return e.c !== score; });

    while(group.length && out.length < n){
      var pick = sample(group);
      out.push(pick.pid);
      group = group.filter(function(g){ return g.pid !== pick.pid; });
    }
  }
  return out;
}

function makeHeartsWrap(){
  var w = document.createElement("div");
  w.style.display = "grid";
  w.style.gridTemplateColumns = "repeat(3, 28px)";
  w.style.justifyContent = "center";
  w.style.gap = "4px";
  w.style.marginTop = "6px";
  return w;
}

function addHeart(targetWrap){
  var img = document.createElement("img");
  img.src = "bgasb_heart.webp";
  img.alt = "vote";
  img.style.width = "28px";
  img.style.height = "28px";
  targetWrap.appendChild(img);
}

function topOneByScore(ids, weights, luckMap){
  var scored = (ids||[]).map(function(pid){
    return { pid: pid, s: scorePlayerWeightedWithLuck(weights||{}, pid, luckMap) };
  }).sort(function(a,b){
    if(b.s!==a.s) return b.s-a.s;
    return Math.random()<0.5?-1:1;
  });
  return scored.length ? scored[0].pid : null;
}

function simulateTeamEpisode(ep, snap){
  var E = state.episodes[ep];
  E.status = snap.slice();

populateEpisodeEvents(ep, E.status);

E.teamsSnapshot = {
  gold: (state.teams && state.teams.gold ? state.teams.gold.ids.slice() : []),
  red:  (state.teams && state.teams.red  ? state.teams.red.ids.slice()  : [])
};

  if(!state.teams || !state.teams.gold || !state.teams.red){
    return snap;
  }

  var goldIds = state.teams.gold.ids.slice();
  var redIds  = state.teams.red.ids.slice();

  var ch = pickUnusedChallenge(
    window.CAPTAIN_CHALLENGE_DATA,
    state.ui.usedChallenges.captain,
    function(c){ return c.startingCaptain !== true; }
  );

  if(ch){
    state.ui.usedChallenges.captain[ch.id] = true;

var capLuck = buildLuckMap(goldIds.concat(redIds));

var goldCap = topOneByScore(goldIds, ch.skillWeights||{}, capLuck);
var redCap  = topOneByScore(redIds,  ch.skillWeights||{}, capLuck);

inc(state.stats.captainWins, goldCap);
inc(state.stats.captainWins, redCap);

    E.captain = {
      id: ch.id,
      name: ch.name || "Captain's Challenge",
      description: ch.description || "",
      skillWeights: ch.skillWeights || {},
      luck: capLuck,
      comments: ch.comments || { positive:[], neutral:[], negative:[] },
      gold: goldCap,
      red: redCap
    };

if(E.captain){
E.captain.highlights = buildHighlightsByScoreList(
  E.captain.comments, E.captain.skillWeights, E.status, 6, capLuck
);
}

  } else {
    E.captain = null;
  }

  var tch = pickUnusedChallenge(
    window.TEAM_CHALLENGE_DATA,
    state.ui.usedChallenges.team
  );

  if(tch){
    state.ui.usedChallenges.team[tch.id] = true;

var teamLuck = buildLuckMap(goldIds.concat(redIds));

var goldAvg = teamAvgScore(goldIds, tch.skillWeights||{}, teamLuck);
var redAvg  = teamAvgScore(redIds,  tch.skillWeights||{}, teamLuck);

    var winner = (goldAvg > redAvg) ? "gold" : (redAvg > goldAvg) ? "red" : (Math.random()<0.5 ? "gold" : "red");
    var loser  = (winner === "gold") ? "red" : "gold";

var winningIdsForStats = (winner === "gold") ? goldIds : redIds;
winningIdsForStats.forEach(function(pid){ inc(state.stats.teamWins, pid); });

    E.team = {
      id: tch.id,
      name: tch.name || "Team Challenge",
      description: tch.description || "",
      skillWeights: tch.skillWeights || {},
      luck: teamLuck,
      comments: tch.comments || { positive:[], neutral:[], negative:[] },
      winner: winner,
      loser: loser,
      goldAvg: goldAvg,
      redAvg: redAvg
    };

if(E.team && E.teamsSnapshot){
  E.team.highlights = buildTeamChallengeHighlightsList(E.team, E.teamsSnapshot.gold, E.teamsSnapshot.red, teamLuck);
  E.team.winnerIds = (E.team.winner==="gold" ? E.teamsSnapshot.gold.slice() : E.teamsSnapshot.red.slice());
}

  } else {
    E.team = null;
  }

  if(E.team && E.captain && E.captain.gold && E.captain.red){
    var winnerKey = E.team.winner;
    var loserKey  = E.team.loser;

    var winningIds = state.teams[winnerKey].ids.slice();
    var losingIds  = state.teams[loserKey].ids.slice();
    var losingCaptain = (loserKey === "gold") ? E.captain.gold : E.captain.red;
    var nominationVotes = [];
    losingIds.forEach(function(voter){
      var eligible = losingIds.filter(function(pid){
        return pid !== voter && pid !== losingCaptain;
      });

      var picks = pickTwoWorstRel(voter, eligible);

      while(picks.length < 2 && eligible.length){
        var extra = sample(eligible);
        if(picks.indexOf(extra)===-1) picks.push(extra);
      }

      nominationVotes.push({ voter: voter, picks: picks.slice(0,2) });
    });

    var nomTally = {};
    nominationVotes.forEach(function(v){
      (v.picks||[]).forEach(function(pid){
        nomTally[pid] = (nomTally[pid]||0) + 1;
      });
    });

    var nominees = topNFromTally(nomTally, 2);
nominees.forEach(function(pid){ inc(state.stats.nominated, pid); });

    E.nominations = {
      loserTeam: loserKey,
      loserCaptain: losingCaptain,
      votes: nominationVotes,
      tally: nomTally,
      nominees: nominees
    };

    var voteSteps = [];
    var voteRecords = [];

    winningIds.forEach(function(voter){
      var pick = pickWorstRelAmong(voter, nominees) || nominees[0];
      voteRecords.push({ voter: voter, pick: pick });
      voteSteps.push({ kind:"vote", voter: voter, pick: pick });
    });

    var elimTally = tallyCount(voteRecords, function(v){ return v.pick; });
    var max = Math.max.apply(null, nominees.map(function(pid){ return elimTally[pid]||0; }));
    var tied = nominees.filter(function(pid){ return (elimTally[pid]||0) === max; });

    var eliminated = null;
    var tiebreaker = null;

    if(tied.length === 1){
      eliminated = tied[0];
    } else {
      voteSteps.push({ kind:"note", text:"It's a tie. The losing team's captain will break the tie." });

      var tbPick = pickWorstRelAmong(losingCaptain, tied) || sample(tied);
      tiebreaker = { voter: losingCaptain, pick: tbPick };

      voteSteps.push({ kind:"vote", voter: losingCaptain, pick: tbPick, tiebreak:true });
      eliminated = tbPick;
elimTally[tbPick] = (elimTally[tbPick] || 0) + 1;
    }

    E.voting = {
      winnerTeam: winnerKey,
      loserTeam: loserKey,
      nominees: nominees,
      steps: voteSteps,
      tally: elimTally,
      eliminated: eliminated,
      tiebreak: tiebreaker
    };

nominees.forEach(function(pid){
  inc(state.stats.votesAgainst, pid, (elimTally[pid] || 0));
});

    if(eliminated){
      var pl = state.players.find(function(p){ return p.id===eliminated; });
      if(pl) pl.alive = false;

      if(state.teams && state.teams.gold) state.teams.gold.ids = state.teams.gold.ids.filter(function(id){ return id!==eliminated; });
      if(state.teams && state.teams.red)  state.teams.red.ids  = state.teams.red.ids.filter(function(id){ return id!==eliminated; });

      var place = snap.length;
      state.placements.eliminated.push({ id: eliminated, episode: ep, place: place });

      snap = snap.filter(function(id){ return id!==eliminated; });
    }
  }

  return snap;
}

function pickBestRelAmong(voterId, options){
  var best = -Infinity, tied = [];
  (options||[]).forEach(function(pid){
    var v = rel(voterId, pid);
    if(v > best){ best = v; tied = [pid]; }
    else if(v === best){ tied.push(pid); }
  });
  return tied.length ? sample(tied) : null;
}

function pickNWorstRel(voterId, candidates, n){
  var pool = (candidates||[]).slice();
  var out = [];
  while(out.length < n && pool.length){
    var pick = pickWorstRelAmong(voterId, pool);
    if(pick == null) break;
    out.push(pick);
    pool.splice(pool.indexOf(pick), 1);
  }
  return out;
}

function simulateIndividualEpisode(ep, snap){
  var E = state.episodes[ep];
  E.status = snap.slice();

populateEpisodeEvents(ep, E.status);

  state.teams = null;
  state.players.forEach(function(p){
    if(p && p.alive !== false) p.team = null;
  });

  var bc = pickUnusedChallenge(
    window.BATTLE_CHALLENGE_DATA,
    state.ui.usedChallenges.battle
  );

  if(bc){
    state.ui.usedChallenges.battle[bc.id] = true;

var battleLuck = buildLuckMap(snap);

var winner = topOneByScore(snap, bc.skillWeights||{}, battleLuck);
inc(state.stats.battleWins, winner);
    E.battle = {
      id: bc.id,
      name: bc.name || "Bad Girl Battle Challenge",
      description: bc.description || "",
      skillWeights: bc.skillWeights || {},
      luck: battleLuck,
      comments: bc.comments || { positive:[], neutral:[], negative:[] },
      winner: winner
    };
  } else {
    E.battle = null;
  }

  if(!E.battle || !E.battle.winner){
    return snap;
  }

  var winnerId = E.battle.winner;
  var remaining = snap.filter(function(pid){ return pid !== winnerId; });

  var nomCount = (ep === 7) ? 3 : 2;
  var nominees = pickNWorstRel(winnerId, remaining, nomCount);

  while(nominees.length < nomCount && remaining.length){
    var extra = sample(remaining);
    if(nominees.indexOf(extra)===-1) nominees.push(extra);
  }

nominees.forEach(function(pid){ inc(state.stats.nominated, pid); });

  E.nominations = {
    winner: winnerId,
    nominees: nominees.slice()
  };

  if(ep === 7){
    var steps = [];
    var records = [];

    remaining.forEach(function(voter){
      var pick = pickBestRelAmong(voter, nominees) || nominees[0];
      records.push({ voter: voter, pick: pick });
      steps.push({ kind:"vote", voter: voter, pick: pick, mode:"save" });
    });

    var tally = tallyCount(records, function(v){ return v.pick; });
    nominees.forEach(function(pid){ if(tally[pid]==null) tally[pid]=0; });

    var sorted = nominees.slice().sort(function(a,b){
      var da = tally[a]||0, db = tally[b]||0;
      if(da !== db) return da - db;
      return Math.random()<0.5 ? -1 : 1;
    });

    var elim = [];

    elim.push(sorted[0]);
    var secondCandidate = sorted[1];
    var boundary = tally[secondCandidate]||0;
    var tiedForSecond = sorted.slice(1).filter(function(pid){ return (tally[pid]||0) === boundary; });

    if(tiedForSecond.length === 1){
      elim.push(secondCandidate);
    } else {
      steps.push({ kind:"note", text:"It's a tie for who receives the fewest save votes. The winner will break the tie." });

      var tbPick = pickWorstRelAmong(winnerId, tiedForSecond) || sample(tiedForSecond);
      steps.push({ kind:"vote", voter: winnerId, pick: tbPick, tiebreak:true, mode:"save" });
      elim.push(tbPick);
    }

    elim = elim.filter(function(x,i,a){ return a.indexOf(x)===i; }).slice(0,2);

    E.voting = {
      mode: "save",
      winner: winnerId,
      nominees: nominees.slice(),
      steps: steps,
      tally: tally,
      eliminated: elim.slice()
    };

    var startSize = snap.length;
    var tieNote = (startSize === 10) ? "9th/10th" : null;

    elim.forEach(function(pid){
      if(!pid) return;

      var pl = state.players.find(function(p){ return p.id===pid; });
      if(pl) pl.alive = false;

      state.placements.eliminated.push({
        id: pid,
        episode: ep,
        place: snap.length,
        tie: tieNote
      });

      snap = snap.filter(function(id){ return id!==pid; });
    });

    return snap;
  }

  var voters = snap.filter(function(pid){
    return pid !== winnerId && nominees.indexOf(pid) === -1;
  });

  var steps2 = [];
  var records2 = [];

  voters.forEach(function(voter){
    var pick = pickWorstRelAmong(voter, nominees) || nominees[0];
    records2.push({ voter: voter, pick: pick });
    steps2.push({ kind:"vote", voter: voter, pick: pick, mode:"elim" });
  });

  var tally2 = tallyCount(records2, function(v){ return v.pick; });
  nominees.forEach(function(pid){ if(tally2[pid]==null) tally2[pid]=0; });

  var max = Math.max.apply(null, nominees.map(function(pid){ return tally2[pid]||0; }));
  var tiedTop = nominees.filter(function(pid){ return (tally2[pid]||0) === max; });

  var eliminated = null;

  if(tiedTop.length === 1){
    eliminated = tiedTop[0];
  } else {
    steps2.push({ kind:"note", text:"It's a tie. The winner will break the tie." });

    var tbPick2 = pickWorstRelAmong(winnerId, tiedTop) || sample(tiedTop);
    steps2.push({ kind:"vote", voter: winnerId, pick: tbPick2, tiebreak:true, mode:"elim" });
    eliminated = tbPick2;
tally2[tbPick2] = (tally2[tbPick2] || 0) + 1;
  }

  E.voting = {
    mode: "elim",
    winner: winnerId,
    nominees: nominees.slice(),
    steps: steps2,
    tally: tally2,
    eliminated: eliminated
  };

nominees.forEach(function(pid){
  inc(state.stats.votesAgainst, pid, (tally2[pid] || 0));
});

  if(eliminated){
    var pl2 = state.players.find(function(p){ return p.id===eliminated; });
    if(pl2) pl2.alive = false;

    state.placements.eliminated.push({ id: eliminated, episode: ep, place: snap.length });

    snap = snap.filter(function(id){ return id!==eliminated; });
  }

  return snap;
}

function buildFinalHighlightsMap(comments, weights, ids){
  var scored = (ids||[]).map(function(pid){
    return { pid: pid, s: scorePlayerWeighted(weights||{}, pid) };
  }).sort(function(a,b){
    if(b.s!==a.s) return b.s-a.s;
    return Math.random()<0.5 ? -1 : 1;
  });

  var pos=(comments&&comments.positive)||[], neu=(comments&&comments.neutral)||[], neg=(comments&&comments.negative)||[];
  var out = {};

  for(var i=0;i<scored.length;i++){
    var pid = scored[i].pid;

    var bucket;
    if(scored.length <= 2){
      bucket = (i===0) ? pos : neg;
    } else {
      var third = Math.ceil(scored.length/3);
      bucket = (i < third) ? pos : (i < 2*third ? neu : neg);
    }

    var other = scored[(i+1) % scored.length].pid;
    var template = bucket.length ? sample(bucket) : "{A} pushes through.";
    out[pid] = template.replaceAll("{A}", nameOf(pid)).replaceAll("{B}", nameOf(other));
  }

  return out;
}

function runFinalPart(ids, stages){
  var partIds = (ids||[]).slice();
  var lvls = [];
  var totals = {};
  partIds.forEach(function(pid){ totals[pid]=0; });

  (stages||[]).forEach(function(st){
    var scores = {};
    partIds.forEach(function(pid){
      var s = scorePlayerWeighted((st&&st.skillWeights)||{}, pid);
      scores[pid] = s;
      totals[pid] += s;
    });

    lvls.push({
      name: (st&&st.name)||"Final Level",
      description: (st&&st.description)||"",
      skillWeights: (st&&st.skillWeights)||{},
      scores: scores,
      highlights: buildFinalHighlightsMap((st&&st.comments)||{}, (st&&st.skillWeights)||{}, partIds),
      ids: partIds.slice()
    });
  });

  var order = partIds.slice().sort(function(a,b){
    var da=totals[a]||0, db=totals[b]||0;
    if(db!==da) return db-da;
    return Math.random()<0.5 ? -1 : 1;
  });

  var eliminated = null;
  if(order.length >= 3){
    eliminated = order[order.length-1];
  }

  return { ids: partIds.slice(), levels: lvls, totals: totals, order: order, eliminated: eliminated };
}

function simulateFinalEpisode(snap){
  var E = state.episodes[12];
  E.status = snap.slice();

populateEpisodeEvents(12, E.status);

  state.teams = null;
  state.players.forEach(function(p){
    if(p && p.alive !== false) p.team = null;
  });

  var bc = pickUnusedChallenge(
    window.BATTLE_CHALLENGE_DATA,
    state.ui.usedChallenges.battle
  );

  if(!bc && window.BATTLE_CHALLENGE_DATA && window.BATTLE_CHALLENGE_DATA.length){
    bc = sample(window.BATTLE_CHALLENGE_DATA);
  }

  if(bc && bc.id) state.ui.usedChallenges.battle[bc.id] = true;

  var battleLuck = buildLuckMap(snap);

var winner = topOneByScore(snap, (bc&&bc.skillWeights)||{}, battleLuck);

  E.battle = {
    id: (bc&&bc.id)||("battle_ep12"),
    name: (bc&&bc.name)||"Bad Girl Battle Challenge",
    description: (bc&&bc.description)||"",
    skillWeights: (bc&&bc.skillWeights)||{},
    comments: (bc&&bc.comments)||{ positive:[], neutral:[], negative:[] },
    winner: winner
  };

  var nominees = snap.filter(function(pid){ return pid !== winner; });
  var eliminated4 = pickWorstRelAmong(winner, nominees) || nominees[0];

  E.voting = {
    mode: "sole",
    winner: winner,
    nominees: nominees.slice(),
    steps: [{ kind:"vote", voter: winner, pick: eliminated4 }],
    tally: (function(){ var t={}; t[eliminated4]=1; return t; })(),
    eliminated: eliminated4
  };

  if(eliminated4){
    var pl = state.players.find(function(p){ return p.id===eliminated4; });
    if(pl) pl.alive = false;
    state.placements.eliminated.push({ id: eliminated4, episode: 12, place: snap.length });

    snap = snap.filter(function(id){ return id!==eliminated4; });
  }

  var FD = finalData();
  if(FD && (!FD.rules || !String(FD.rules).trim())){
    FD.rules =
      "• Final Battle: The final 4 compete for immunity.\n" +
      "• The Battle winner eliminates one of the remaining players, locking in 3 finalists.\n" +
      "• Final Part 1: All 3 run through multiple stages — the lowest performer places 3rd.\n" +
      "• Final Part 2: The final 2 race through the last stages — winner takes the season.";
  }

  var stages = (FD && FD.stages) ? FD.stages.slice() : [];
  var part1Stages = stages.slice(0, 3);
  var part2Stages = stages.slice(3, 6);
  if(part1Stages.length < 1) part1Stages = stages.slice(0, Math.min(3, stages.length));
  if(part2Stages.length < 1) part2Stages = stages.slice(part1Stages.length);

  var finalists = snap.slice();
  var part1 = runFinalPart(finalists, part1Stages);

  var third = part1.eliminated || (part1.order.length ? part1.order[part1.order.length-1] : null);
  var finalTwo = finalists.filter(function(id){ return id !== third; });
  state.placements.final.third = third;

  var part2 = runFinalPart(finalTwo, part2Stages);

  var first = part2.order[0] || null;
  var second = part2.order[1] || null;

  state.placements.final.first = first;
  state.placements.final.second = second;

  E.final = {
    rules: (FD && FD.rules) ? FD.rules : "",
    finalists: finalists.slice(),
    part1StagesCount: part1Stages.length,
    part2StagesCount: part2Stages.length,
    part1: part1,
    part2: part2,
    third: third,
    first: first,
    second: second
  };

  return snap;
}

function simulateSeason(){
  ensureUsedPools();

  state.episodes = {};
  state.chart = { finalized:false, episodes:{} };

  state.stats = {
    captainWins:{},
    teamWins:{},
    battleWins:{},
    nominated:{},
    votesAgainst:{}
  };

  state.placements = { final:{ first:null, second:null, third:null }, eliminated:[] };

  var snap = aliveIds().slice();
  for(var ep=1; ep<=12; ep++){
    state.episodes[ep] = {
      status: [],
      statusMode: (ep===1 ? "noTeams" : (ep<=6 ? "teams" : "individual")),
      events1: [],
      events2: [],
      events3: []
    };
  }

  var E1 = state.episodes[1];
  E1.status = snap.slice();

populateEpisodeEvents(1, E1.status);

  var ch = pickUnusedChallenge(
    window.CAPTAIN_CHALLENGE_DATA,
    state.ui.usedChallenges.captain,
    function(c){ return c.startingCaptain === true; }
  );

  if(ch){
    state.ui.usedChallenges.captain[ch.id] = true;

    var top2 = topTwoByScore(snap, ch.skillWeights||{});
    E1.captain = {
      id: ch.id,
      name: ch.name || "Captain's Challenge",
      description: ch.description || "",
      skillWeights: ch.skillWeights || {},
      comments: ch.comments || { positive:[], neutral:[], negative:[] },
      gold: top2[0] || null,
      red: top2[1] || null
    };

if(E1.captain){
  E1.captain.highlights = buildHighlightsByScoreList(
    E1.captain.comments, E1.captain.skillWeights, E1.status, 6
  );
}

  } else {
    E1.captain = null;
  }

  var draft = null;
  if(E1.captain && E1.captain.gold && E1.captain.red){
    draft = draftTeamsEpisode1(snap, E1.captain.gold, E1.captain.red);

    E1.teamselect = {
      goldCaptain: E1.captain.gold,
      redCaptain: E1.captain.red,
      picks: draft.picks,
      goldIds: draft.gold,
      redIds: draft.red
    };

    state.teams = {
      gold: { key:"gold", name:"Gold Team", color:GOLD, ids: draft.gold.slice() },
      red:  { key:"red",  name:"Red Team",  color:RED,  ids: draft.red.slice()  }
    };

    assignTeamsToPlayers(draft.gold, draft.red);
E1.teamsSnapshot = { gold: draft.gold.slice(), red: draft.red.slice() };
  } else {
    state.teams = null;
  }

  if(draft){
    var tch = pickUnusedChallenge(
      window.TEAM_CHALLENGE_DATA,
      state.ui.usedChallenges.team
    );

    if(tch){
      state.ui.usedChallenges.team[tch.id] = true;

      var goldAvg = teamAvgScore(draft.gold, tch.skillWeights||{});
      var redAvg  = teamAvgScore(draft.red,  tch.skillWeights||{});

      var winner = (goldAvg > redAvg) ? "gold" : (redAvg > goldAvg) ? "red" : (Math.random()<0.5 ? "gold" : "red");
      var loser  = (winner === "gold") ? "red" : "gold";

      E1.team = {
        id: tch.id,
        name: tch.name || "Team Challenge",
        description: tch.description || "",
        skillWeights: tch.skillWeights || {},
        comments: tch.comments || { positive:[], neutral:[], negative:[] },
        winner: winner,
        loser: loser,
        goldAvg: goldAvg,
        redAvg: redAvg
      };

if(E1.team && E1.teamsSnapshot){
  E1.team.highlights = buildTeamChallengeHighlightsList(E1.team, E1.teamsSnapshot.gold, E1.teamsSnapshot.red);
  E1.team.winnerIds = (E1.team.winner==="gold" ? E1.teamsSnapshot.gold.slice() : E1.teamsSnapshot.red.slice());
}

    } else {
      E1.team = null;
    }
  } else {
    E1.team = null;
  }

  if(E1.team && state.teams && state.teams.gold && state.teams.red){
    var winnerKey = E1.team.winner;
    var loserKey  = E1.team.loser;

    var winningIds = state.teams[winnerKey].ids.slice();
    var losingIds  = state.teams[loserKey].ids.slice();

    var losingCaptain = (loserKey === "gold") ? E1.captain.gold : E1.captain.red;

    var nominationVotes = [];
    losingIds.forEach(function(voter){
      var eligible = losingIds.filter(function(pid){
        return pid !== voter && pid !== losingCaptain;
      });

      var picks = pickTwoWorstRel(voter, eligible);
      while(picks.length < 2 && eligible.length){
        var extra = sample(eligible);
        if(picks.indexOf(extra)===-1) picks.push(extra);
      }

      nominationVotes.push({ voter: voter, picks: picks.slice(0,2) });
    });

    var nomTally = {};
    nominationVotes.forEach(function(v){
      (v.picks||[]).forEach(function(pid){
        nomTally[pid] = (nomTally[pid]||0) + 1;
      });
    });

    var nominees = topNFromTally(nomTally, 2);

    E1.nominations = {
      loserTeam: loserKey,
      loserCaptain: losingCaptain,
      votes: nominationVotes,
      tally: nomTally,
      nominees: nominees
    };

    var voteSteps = [];
    var voteRecords = [];

    winningIds.forEach(function(voter){
      var pick = pickWorstRelAmong(voter, nominees) || nominees[0];
      voteRecords.push({ voter: voter, pick: pick });
      voteSteps.push({ kind:"vote", voter: voter, pick: pick });
    });

    var elimTally = tallyCount(voteRecords, function(v){ return v.pick; });
    var max = Math.max.apply(null, nominees.map(function(pid){ return elimTally[pid]||0; }));
    var tied = nominees.filter(function(pid){ return (elimTally[pid]||0) === max; });

    var eliminated = null;
    var tiebreaker = null;

    if(tied.length === 1){
      eliminated = tied[0];
    } else {
      voteSteps.push({ kind:"note", text:"It's a tie. The losing team's captain will break the tie." });

      var tbPick = pickWorstRelAmong(losingCaptain, tied) || sample(tied);
      tiebreaker = { voter: losingCaptain, pick: tbPick };

      voteSteps.push({ kind:"vote", voter: losingCaptain, pick: tbPick, tiebreak:true });
      eliminated = tbPick;
elimTally[tbPick] = (elimTally[tbPick] || 0) + 1;
    }

    E1.voting = {
      winnerTeam: winnerKey,
      loserTeam: loserKey,
      nominees: nominees,
      steps: voteSteps,
      tally: elimTally,
      eliminated: eliminated,
      tiebreak: tiebreaker
    };

    if(eliminated){
      var pl = state.players.find(function(p){ return p.id===eliminated; });
      if(pl) pl.alive = false;

      if(state.teams && state.teams.gold) state.teams.gold.ids = state.teams.gold.ids.filter(function(id){ return id!==eliminated; });
      if(state.teams && state.teams.red)  state.teams.red.ids  = state.teams.red.ids.filter(function(id){ return id!==eliminated; });

      var place = snap.length;
      state.placements.eliminated.push({ id: eliminated, episode: 1, place: place });

      snap = snap.filter(function(id){ return id!==eliminated; });
    }
  }

  for(var epT=2; epT<=6; epT++){
    snap = simulateTeamEpisode(epT, snap);
  }

for(var epI=7; epI<=11; epI++){
  snap = simulateIndividualEpisode(epI, snap);
}

simulateFinalEpisode(snap);
}

function buildLeftAccordion(){
  elAccordion.innerHTML = "";

  var labels = {
    format: "Format",
    status: "Status",
    events1: "House Events 1",
    events2: "House Events 2",
    events3: "House Events 3",
    captain: "Captain's Challenge",
    teamselect: "Team Selection",
    team: "Team Challenge",
    nominations: "Nominations",
    voting: "Voting",
    battle: "Bad Girl Battle Challenge",
    final_format: "Final Format",
    final_part1: "Final Part 1",
    final_part2: "Final Part 2",
    final_results: "Final Results"
  };

  for(var e=1; e<=12; e++){
    var details = document.createElement("details");
    details.className = "details-ep";
    if(e===1) details.open = true;

    var inner = '<summary>Episode '+e+'</summary><div class="section-box"><div class="section-links">';
    var order = bgasbSectionOrder(e);

    order.forEach(function(sec){
      inner += '<button class="btn" data-ep="'+e+'" data-sec="'+sec+'">'+(labels[sec]||sec)+'</button>';
    });

    inner += "</div></div>";
    details.innerHTML = inner;
    elAccordion.appendChild(details);
  }

  statsPanel.style.display = state.simulated ? "block" : "none";

  elAccordion.querySelectorAll(".section-links .btn").forEach(function(b){
    b.onclick = function(){
      elAccordion.querySelectorAll(".section-links button").forEach(function(x){ x.classList.remove("active"); });
      b.classList.add("active");
      showEpisodeSection(+b.dataset.ep, b.dataset.sec);
    };
  });
}

  function statusCard(pid, extraCls, perProfileBorder){
    var card=document.createElement("div"); card.className="status-card"+(extraCls?(" "+extraCls):"");
    if(perProfileBorder){ card.style.borderColor = perProfileBorder; card.style.borderWidth = "3px"; }
    card.innerHTML = '<img class="avatar" src="'+picOf(pid)+'" alt=""><div class="name">'+nameOf(pid)+'</div>';
    return card;
  }
  function statusCardSquare(pid, extra, perProfileBorder){
    return statusCard(pid, "square"+(extra?(" "+extra):""), perProfileBorder);
  }
  function labelUnder(node, text, cls){
    var lab=document.createElement("div");
    lab.className = cls || "badge muted";
    lab.textContent=text;
    node.appendChild(lab);
    return node;
  }

function teamWrap(teamKey){
    var div=document.createElement("div"); div.className="team-wrap";
    div.style.borderColor = (teamKey==="gold"?GOLD:(teamKey==="red"?RED:"var(--glass-border)"));
    return div;
  }

function getEpisodeTeamsSnapshot(S){
  var gold = [], red = [];
  if (S && S.teamselect && Array.isArray(S.teamselect.goldIds) && Array.isArray(S.teamselect.redIds)){
    gold = S.teamselect.goldIds.slice();
    red  = S.teamselect.redIds.slice();
  }

  else if (S && S.teamsSnapshot && Array.isArray(S.teamsSnapshot.gold) && Array.isArray(S.teamsSnapshot.red)){
    gold = S.teamsSnapshot.gold.slice();
    red  = S.teamsSnapshot.red.slice();
  }

  return { gold: gold, red: red };
}

function buildTeamMapFromSnapshot(ts){
  var map = {};
  (ts.gold || []).forEach(function(pid){ map[pid] = "gold"; });
  (ts.red  || []).forEach(function(pid){ map[pid] = "red";  });
  return map;
}

  function showEpisodeSection(ep, section){
    state.lastView={ep:ep,section:section}; State.save(state);
    epActions.innerHTML=""; var S=state.episodes[ep]; epTitle.textContent="Episode "+ep; epSub.textContent="";
    if(!S){ epContent.innerHTML='<p class="muted">No data.</p>'; addProceed(ep, section); return; }

if(section==="format" && ep===1){
      epSub.textContent="Season Format";
      var box=document.createElement("div"); box.className="mini-card note";
box.innerHTML =
  "<div><b>Bad Girls All Star Battle</b> starts with 16 contestants.<br><br>" +
  "Episode 1 begins with an opening Captain's Challenge where the top two finishers become team captains (Gold and Red). " +
  "They will draft teams one-by-one and compete in Team Challenges through Episode 6.<br><br>" +
  "From Episode 7 onward, the game becomes individual. Each round features a Bad Girl Battle Challenge winner who earns safety and power." +
  "</div>";
      epContent.innerHTML=""; epContent.appendChild(box);
      addProceed(ep, section); return;
    }

if(section==="captain"){
  epSub.textContent="Captain's Challenge";
  epContent.innerHTML="";

  var C = S.captain;
  if(!C){
    epContent.innerHTML='<p class="muted">No captain challenge generated for this episode.</p>';
    addProceed(ep, section); return;
  }

  var title=document.createElement("div");
  title.className="challenge-name";
  title.textContent = C.name || "Captain's Challenge";

  var desc=document.createElement("div");
  desc.className="mini-card note";
  desc.innerHTML = '<div><strong>Description:</strong> '+(C.description||"")+'</div>';

  epContent.appendChild(title);
  epContent.appendChild(desc);
  var hlContainer=document.createElement("div");
  epContent.appendChild(hlContainer);
  var tm = null;
var tm = null;
if(S.statusMode==="teams"){
  tm = buildTeamMapFromSnapshot(getEpisodeTeamsSnapshot(S));
}

if(C.highlights && C.highlights.length){
  renderHighlightsFromList(hlContainer, C.highlights, tm);
}else{
  renderHighlightsIntoByScore(hlContainer, C.comments||{}, C.skillWeights||{}, (S.status||[]).slice(), 6);
}

  var btn=document.createElement("button");
  btn.className="btn";
  btn.textContent="Reveal Captains";
  btn.onclick=function(){
    var row=document.createElement("div");
    row.className="team-row";

    var goldCol=document.createElement("div");
    goldCol.style.display="flex";
    goldCol.style.flexDirection="column";
    goldCol.style.alignItems="center";
    goldCol.appendChild(statusCard(C.gold, null, "#d4af37"));
    labelUnder(goldCol, nameOf(C.gold)+' placed first and became the Gold Team captain.', "badge muted");

    var redCol=document.createElement("div");
    redCol.style.display="flex";
    redCol.style.flexDirection="column";
    redCol.style.alignItems="center";
    redCol.appendChild(statusCard(C.red, null, "#b30000"));
    labelUnder(redCol, nameOf(C.red)+' placed second and became the Red Team captain.', "badge muted");

    row.appendChild(goldCol);
    row.appendChild(redCol);

    epContent.appendChild(row);
    btn.remove();
  };
  epActions.appendChild(btn);

  addProceed(ep, section); return;
}

if(section==="teamselect"){
  epSub.textContent="Team Selection";
  epContent.innerHTML="";

  var T = S.teamselect;
  if(!T || !T.picks || !T.picks.length){
    epContent.innerHTML='<div class="mini-card note"><div>Teams have not been drafted yet.</div></div>';
    addProceed(ep, section); return;
  }

  var box=document.createElement("div"); box.className="mini-card note";
  box.innerHTML =
    "<div><b>"+nameOf(T.goldCaptain)+"</b> and <b>"+nameOf(T.redCaptain)+"</b> are now captains. " +
    "One-by-one, they will pick members of their teams for the rest of the season.</div>";
  epContent.appendChild(box);

  var list=document.createElement("div");
  list.style.display="flex";
  list.style.flexDirection="column";
  list.style.gap="10px";
  list.style.marginTop="10px";

  T.picks.forEach(function(p){
    var line=document.createElement("div");
    line.className="team-row";
    line.style.alignItems="center";
    line.style.justifyContent="center";
    line.style.gap="12px";

    var capCard = statusCard(p.captain, null, (p.team==="gold"?GOLD:RED));
    var mid=document.createElement("div");
    mid.className="badge muted";
    mid.textContent="picks";
    var pickCard = statusCard(p.pick, null, (p.team==="gold"?GOLD:RED));

    line.appendChild(capCard);
    line.appendChild(mid);
    line.appendChild(pickCard);
    list.appendChild(line);
  });

  epContent.appendChild(list);
  addProceed(ep, section); return;
}

if(section==="team"){
  epSub.textContent="Team Challenge";
  epContent.innerHTML="";

  var TC = S.team;
  if(!TC){
    epContent.innerHTML='<div class="mini-card note"><div>No Team Challenge generated for this episode yet.</div></div>';
    addProceed(ep, section); return;
  }

  var title=document.createElement("div");
  title.className="challenge-name";
  title.textContent = TC.name || "Team Challenge";

  var desc=document.createElement("div");
  desc.className="mini-card note";
  desc.innerHTML = '<div><strong>Description:</strong> '+(TC.description||"")+'</div>';

  epContent.appendChild(title);
  epContent.appendChild(desc);

  var btnRow=document.createElement("div");
  btnRow.className="actions";
  epContent.appendChild(btnRow);

  var highlightsWrap=document.createElement("div");
  epContent.appendChild(highlightsWrap);

  var winnersWrap=document.createElement("div");
  winnersWrap.style.marginTop="10px";
  epContent.appendChild(winnersWrap);

var teamsSnap = getEpisodeTeamsSnapshot(S);

  var btnH=document.createElement("button");
  btnH.className="btn";
  btnH.textContent="Show Highlights";
btnH.onclick=function(){
  highlightsWrap.innerHTML="";

  var tm = buildTeamMapFromSnapshot(teamsSnap);
  if(TC.highlights && TC.highlights.length){
    renderHighlightsFromList(highlightsWrap, TC.highlights, tm);
  }else{
    var tmp = buildTeamChallengeHighlightsList(TC, teamsSnap.gold.slice(), teamsSnap.red.slice());
    renderHighlightsFromList(highlightsWrap, tmp, tm);
  }

  btnH.remove();
};

  var btnW=document.createElement("button");
  btnW.className="btn";
  btnW.textContent="Show Winners";
btnW.onclick=function(){
  winnersWrap.innerHTML="";

  var winnerKey = TC.winner;
var ids = (winnerKey === "gold" ? teamsSnap.gold.slice() : teamsSnap.red.slice());
  var wrap = teamWrap(winnerKey);

  var hw=document.createElement("div");
  hw.className="status-title";
  hw.textContent = (winnerKey==="gold" ? "Gold Team" : "Red Team") + " wins!";
  wrap.appendChild(hw);

  for(var i=0;i<ids.length;i+=6){
    var row=document.createElement("div"); row.className="team-row";
    ids.slice(i,i+6).forEach(function(pid){ row.appendChild(statusCard(pid)); });
    wrap.appendChild(row);
  }

  winnersWrap.appendChild(wrap);

  btnW.remove();
};

  btnRow.appendChild(btnH);
  btnRow.appendChild(btnW);

  addProceed(ep, section); return;
}

if(section==="battle"){
  epSub.textContent="Bad Girl Battle Challenge";
  epContent.innerHTML="";

  var B = S.battle;
  if(!B){
    epContent.innerHTML='<div class="mini-card note"><div>No Bad Girl Battle Challenge generated for this episode yet.</div></div>';
    addProceed(ep, section); return;
  }

  var title=document.createElement("div");
  title.className="challenge-name";
  title.textContent = B.name || "Bad Girl Battle Challenge";

  var desc=document.createElement("div");
  desc.className="mini-card note";
  desc.innerHTML = '<div><strong>Description:</strong> '+(B.description||"")+'</div>';

  epContent.appendChild(title);
  epContent.appendChild(desc);

  var btnRow=document.createElement("div");
  btnRow.className="actions";
  epContent.appendChild(btnRow);

  var highlightsWrap=document.createElement("div");
  epContent.appendChild(highlightsWrap);

  var winnerWrap=document.createElement("div");
  winnerWrap.style.marginTop="12px";
  winnerWrap.style.display="flex";
  winnerWrap.style.flexDirection="column";
  winnerWrap.style.alignItems="center";
  winnerWrap.style.justifyContent="center";
  winnerWrap.style.textAlign="center";
  epContent.appendChild(winnerWrap);

  var btnH=document.createElement("button");
  btnH.className="btn";
  btnH.textContent="Show Highlights";
  btnH.onclick=function(){
    renderHighlightsIntoByScore(highlightsWrap, B.comments, B.skillWeights, S.status, 6, null, (B && B.luck) ? B.luck : null);
    btnH.remove();
  };

  var btnW=document.createElement("button");
  btnW.className="btn";
  btnW.textContent="Reveal Winner";
  btnW.onclick=function(){
    winnerWrap.innerHTML="";
    winnerWrap.appendChild(statusCard(B.winner, null, GOLD));

    var txt=document.createElement("div");
    txt.className="badge muted";
    txt.style.marginTop="8px";
    txt.textContent = nameOf(B.winner) + " wins and is safe this week.";
    winnerWrap.appendChild(txt);

    btnW.remove();
  };

  btnRow.appendChild(btnH);
  btnRow.appendChild(btnW);

  addProceed(ep, section); return;
}

if(section==="nominations"){
  epSub.textContent="Nominations";
  epContent.innerHTML="";

  var N = S.nominations;
  if(!N){
    epContent.innerHTML='<div class="mini-card note"><div>No nominations generated for this episode yet.</div></div>';
    addProceed(ep, section); return;
  }

  if(N.winner && Array.isArray(N.nominees) && !N.votes){
    var box=document.createElement("div"); box.className="mini-card note";
    box.innerHTML =
      "<div><b>"+nameOf(N.winner)+"</b> has won the Bad Girl Battle Challenge and must nominate " +
      "<b>"+N.nominees.length+"</b> player"+(N.nominees.length===1?"":"s")+" for elimination.</div>";
    epContent.appendChild(box);

    var wWrap=document.createElement("div");
    wWrap.style.display="flex";
    wWrap.style.justifyContent="center";
    wWrap.style.marginTop="12px";
    wWrap.appendChild(statusCard(N.winner, null, GOLD));
    epContent.appendChild(wWrap);

    var nomineesWrap=document.createElement("div");
    nomineesWrap.style.marginTop="14px";
    epContent.appendChild(nomineesWrap);

    function showNominees(){
      nomineesWrap.innerHTML="";
      var row=document.createElement("div");
      row.className="team-row";
      row.style.justifyContent="center";
      row.style.gap="16px";
      N.nominees.forEach(function(pid){
        row.appendChild(statusCard(pid, null, RED));
      });
      nomineesWrap.appendChild(row);
    }

    var btnNom=document.createElement("button");
    btnNom.className="btn";
    btnNom.textContent="Reveal Nominees";
    btnNom.onclick=function(){
      showNominees();
      btnNom.remove();
    };

    epActions.appendChild(btnNom);
    addProceed(ep, section); return;
  }

  var boxT=document.createElement("div"); boxT.className="mini-card note";
  boxT.innerHTML =
    "<div>The losing team's members must now vote for two players each to be up for elimination. They will vote individually.</div>";
  epContent.appendChild(boxT);

  var votesWrap=document.createElement("div");
  votesWrap.style.display="flex";
  votesWrap.style.flexDirection="column";
  votesWrap.style.gap="10px";
  votesWrap.style.marginTop="10px";
  epContent.appendChild(votesWrap);

  var nomineesWrapT=document.createElement("div");
  nomineesWrapT.style.marginTop="14px";
  epContent.appendChild(nomineesWrapT);

  var i = 0;

  function renderVote(v){
    var line=document.createElement("div");
    line.className="team-row";
    line.style.alignItems="center";
    line.style.justifyContent="center";
    line.style.gap="12px";

    var voterCard = statusCard(v.voter);
    var mid = document.createElement("div"); mid.className="badge muted"; mid.textContent="has voted for";
    var a = statusCard(v.picks[0]);
    var b = statusCard(v.picks[1]);

    line.appendChild(voterCard);
    line.appendChild(mid);
    line.appendChild(a);
    line.appendChild(b);

    votesWrap.appendChild(line);
  }

  function showNomineesTeam(){
    nomineesWrapT.innerHTML="";
    var row=document.createElement("div");
    row.className="team-row";
    row.style.justifyContent="center";
    row.style.gap="16px";
    (N.nominees||[]).forEach(function(pid){
      row.appendChild(statusCard(pid, null, RED));
    });
    nomineesWrapT.appendChild(row);
  }

  var btnVote=document.createElement("button");
  btnVote.className="btn";
  btnVote.textContent="Reveal Vote";
  btnVote.onclick=function(){
    if(i < (N.votes||[]).length){
      renderVote(N.votes[i++]);
      if(i >= (N.votes||[]).length) btnVote.remove();
    }
  };

  var btnAll=document.createElement("button");
  btnAll.className="btn";
  btnAll.textContent="Reveal All Votes";
  btnAll.onclick=function(){
    while(i < (N.votes||[]).length) renderVote(N.votes[i++]);
    btnVote.remove();
    btnAll.remove();
  };

  var btnNomT=document.createElement("button");
  btnNomT.className="btn";
  btnNomT.textContent="Reveal Nominees";
  btnNomT.onclick=function(){
    showNomineesTeam();
    btnNomT.remove();
  };

  epActions.appendChild(btnVote);
  epActions.appendChild(btnAll);
  epActions.appendChild(btnNomT);

  addProceed(ep, section); return;
}

if(section==="voting"){
  epSub.textContent="Voting";
  epContent.innerHTML="";

  var V = S.voting;
  if(!V){
    epContent.innerHTML='<div class="mini-card note"><div>No voting generated for this episode yet.</div></div>';
    addProceed(ep, section); return;
  }

  var mode = V.mode || "team";

  var box=document.createElement("div"); box.className="mini-card note";
  if(mode === "save"){
    box.innerHTML = "<div>Everyone (except the winner) will now vote to <b>SAVE</b> one of the nominees. The two with the fewest save votes will be eliminated.</div>";
  } else if(mode === "elim"){
    box.innerHTML = "<div>Everyone (except the winner and the nominees) must now vote for one nominee to be eliminated.</div>";
  } else {
    box.innerHTML = "<div>The winning team's members must now vote for one of the nominees to be eliminated.</div>";
  }
  epContent.appendChild(box);

  var nomineesRow=document.createElement("div");
  nomineesRow.className="team-row";
  nomineesRow.style.justifyContent="center";
  nomineesRow.style.gap="18px";
  nomineesRow.style.marginTop="10px";
  epContent.appendChild(nomineesRow);

  var heartMap = {};
  (V.nominees||[]).forEach(function(pid){
    var col=document.createElement("div");
    col.style.display="flex";
    col.style.flexDirection="column";
    col.style.alignItems="center";

    col.appendChild(statusCard(pid, null, RED));

    var hearts = makeHeartsWrap();
    heartMap[pid] = hearts;
    col.appendChild(hearts);

    nomineesRow.appendChild(col);
  });

  var votesWrap=document.createElement("div");
  votesWrap.style.display="flex";
  votesWrap.style.flexDirection="column";
  votesWrap.style.gap="10px";
  votesWrap.style.marginTop="14px";
  epContent.appendChild(votesWrap);

  var endWrap=document.createElement("div");
  endWrap.style.marginTop="14px";
  endWrap.style.display="flex";
  endWrap.style.flexDirection="column";
  endWrap.style.alignItems="center";
  endWrap.style.justifyContent="center";
  endWrap.style.textAlign="center";
  epContent.appendChild(endWrap);

  var stepIndex = 0;

  function renderVoteLine(voter, pick, isTB){
    var line=document.createElement("div");
    line.className="team-row";
    line.style.alignItems="center";
    line.style.justifyContent="center";
    line.style.gap="12px";

    line.appendChild(statusCard(voter));

    var mid=document.createElement("div"); mid.className="badge muted";
    if(mode === "save"){
      mid.textContent = isTB ? "breaks the tie and eliminates" : "has voted to save";
    } else if(mode === "elim"){
      mid.textContent = isTB ? "breaks the tie and votes to eliminate" : "has voted to eliminate";
    } else {
      mid.textContent = isTB ? "breaks the tie and votes for" : "has voted for";
    }
    line.appendChild(mid);

    line.appendChild(statusCard(pick, null, RED));
    votesWrap.appendChild(line);
    if(!(mode==="save" && isTB)){
      if(heartMap[pick]) addHeart(heartMap[pick]);
    }
  }

  function finishElim(){
    endWrap.innerHTML="";

    var elimList = Array.isArray(V.eliminated) ? V.eliminated.slice() : [V.eliminated];
    elimList = elimList.filter(function(x){ return !!x; });

    if(elimList.length){
      var row=document.createElement("div");
      row.className="team-row";
      row.style.justifyContent="center";
      row.style.gap="16px";

      elimList.forEach(function(pid){
        row.appendChild(statusCard(pid, null, RED));
      });

      endWrap.appendChild(row);

      var txt=document.createElement("div");
      txt.className="badge muted";
      txt.style.marginTop="8px";

      if(elimList.length === 1){
        txt.textContent = nameOf(elimList[0]) + ", you've been eliminated from Bad Girls All Star Battle.";
      } else {
        txt.textContent = nameOf(elimList[0]) + " and " + nameOf(elimList[1]) + ", you've been eliminated from Bad Girls All Star Battle.";
      }

      endWrap.appendChild(txt);
    }
  }

  function runNextStep(){
    if(stepIndex >= (V.steps||[]).length){
      finishElim();
      return;
    }

    var s = V.steps[stepIndex++];
    if(s.kind === "note"){
      var note=document.createElement("div");
      note.className="mini-card note";
      note.innerHTML = "<div>"+s.text+"</div>";
      votesWrap.appendChild(note);
      return;
    }

    renderVoteLine(s.voter, s.pick, !!s.tiebreak);

    if(stepIndex >= (V.steps||[]).length){
      finishElim();
    }
  }

  var btnVote=document.createElement("button");
  btnVote.className="btn";
  btnVote.textContent="Reveal Vote";
  btnVote.onclick=function(){
    runNextStep();
    if(stepIndex >= (V.steps||[]).length) btnVote.remove();
  };

  var btnAll=document.createElement("button");
  btnAll.className="btn";
  btnAll.textContent="Reveal All Votes";
  btnAll.onclick=function(){
    while(stepIndex < (V.steps||[]).length) runNextStep();
    btnVote.remove();
    btnAll.remove();
  };

  epActions.appendChild(btnVote);
  epActions.appendChild(btnAll);

  addProceed(ep, section); return;
}

if(
  ep !== 12 &&
  (section==="final_format" || section==="final_part1" || section==="final_part2" || section==="final_results")
){
  epSub.textContent = "Final";
  epContent.innerHTML =
    '<div class="mini-card note"><div>Final sections only display in <b>Episode 12</b> after you click <b>Simulate Season</b>.</div></div>';
  addProceed(ep, section); 
  return;
}

if(ep===12 && (section==="final_format" || section==="final_part1" || section==="final_part2" || section==="final_results")){
  var F = S.final;

  if(!F){
    epSub.textContent = "Final";
    epContent.innerHTML = '<div class="mini-card note"><div>No final data generated yet.</div></div>';
    addProceed(ep, section); return;
  }

function renderStageCard(stage, idx){
  var wrap = document.createElement("div");
  wrap.style.marginTop = "10px";

  var title = document.createElement("div");
  title.className = "wide-card title";
  title.style.textAlign = "center";
  title.textContent = "Stage " + (idx+1) + ": " + (stage.name || "Final Stage");
  wrap.appendChild(title);

  var desc = document.createElement("div");
  desc.className = "mini-card note";
  desc.innerHTML = '<div><strong>Description:</strong> ' + (stage.description || "") + "</div>";
  wrap.appendChild(desc);

  var ids = (stage.ids || []).slice();
  var scores = stage.scores || {};
  ids.sort(function(a,b){
    var da = scores[a] || 0, db = scores[b] || 0;
    if(db !== da) return db - da;
    return Math.random() < 0.5 ? -1 : 1;
  });

  var hlMap = stage.highlights || {};
  var hlWrap = document.createElement("div");
  hlWrap.className = "events-grid three-cols";
  hlWrap.style.marginTop = "10px";

  var hlCount = 0;
  ids.forEach(function(pid){
    var txt = hlMap[pid];
    if(!txt) return;

    var card = document.createElement("div");
    card.className = "mini-card";
    card.style.border = "3px solid " + teamColorOf(pid);
    card.style.borderRadius = "14px";
    card.innerHTML =
      '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(pid)+'" alt=""></div>' +
      "<div>" + txt + "</div>";

    hlWrap.appendChild(card);
    hlCount++;
  });

  if(hlCount){
    wrap.appendChild(hlWrap);
  }

  return wrap;
}

function renderPart(partObj, label){
  epContent.innerHTML = "";
  epSub.textContent = label;

  var lvls = (partObj && partObj.levels) ? partObj.levels : [];
  if(!lvls.length){
    epContent.innerHTML += '<div class="mini-card note"><div>No stages found for this part.</div></div>';
    return;
  }

  lvls.forEach(function(stage, idx){
    epContent.appendChild(renderStageCard(stage, idx));
  });

  if(label === "Final Part 1" && partObj && partObj.eliminated){
    var nStages = lvls.length;

    var note = document.createElement("div");
    note.className = "mini-card note";
    note.innerHTML =
      "<div>The contestant that placed last within the first <b>" + nStages +
      "</b> stages is eliminated. And that contestant is...</div>";
    epContent.appendChild(note);

    var revealWrap = document.createElement("div");
    revealWrap.style.display = "flex";
    revealWrap.style.flexDirection = "column";
    revealWrap.style.alignItems = "center";
    revealWrap.style.marginTop = "8px";

    var btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Reveal Eliminated";
    btn.onclick = function(){
      btn.remove();

      var c = statusCardSquare(partObj.eliminated, "", RED);
      labelUnder(c, "3rd Place", "placements-label");

      revealWrap.appendChild(c);
    };

    revealWrap.appendChild(btn);
    epContent.appendChild(revealWrap);
  }
}

  if(section==="final_format"){
    epSub.textContent = "Final Format";
    epContent.innerHTML = "";

    var head = document.createElement("div");
    head.className = "wide-card title";
    head.textContent = "The Final";
    epContent.appendChild(head);

var box = document.createElement("div");
box.className = "mini-card";
box.innerHTML =
  '<div class="muted">' +
  (rules ? rules.replace(/\n/g,"<br>") : "Final is played across multiple stages. Strong overall performance wins.") +
  "</div>";
epContent.appendChild(box);

    var finalists = (F.finalists || []).slice();
    if(finalists.length){
      var row = document.createElement("div");
      row.className = "team-row";
      row.style.justifyContent = "center";
      row.style.gap = "14px";
      row.style.marginTop = "10px";
      finalists.forEach(function(pid){
        row.appendChild(statusCardSquare(pid, "", teamColorOf(pid)));
      });
      epContent.appendChild(row);
    }

    addProceed(ep, section); return;
  }

  if(section==="final_part1"){
    renderPart(F.part1, "Final Part 1");
    addProceed(ep, section); return;
  }

  if(section==="final_part2"){
    renderPart(F.part2, "Final Part 2");
    addProceed(ep, section); return;
  }

if(section==="final_results"){
  epSub.textContent = "Final Results";
  epContent.innerHTML = "";

  var head = document.createElement("div");
  head.className = "wide-card title";
  head.textContent = "Final Results";
  epContent.appendChild(head);

  var startCount = (state.cast || []).filter(Boolean).length || 16;

  var story = document.createElement("div");
  story.className = "mini-card note";
  story.innerHTML =
    "<div>" +
    "This was a grueling battle from start to finish. " +
    "Starting with <b>" + startCount + "</b> Bad Girls, the competition got nastier every round — alliances cracked, tempers flared, and only the toughest survived. " +
    "After the Final Battle and a brutal cut, three finalists hit the Final. " +
    "Then the first stages eliminated one more, leaving just two to sprint for the finish. " +
    "<br><br>" +
    "<b>And the last Bad Girl that reaches the treasure chest is...</b>" +
    "</div>";
  epContent.appendChild(story);

  var revealWrap = document.createElement("div");
  revealWrap.style.display = "flex";
  revealWrap.style.flexDirection = "column";
  revealWrap.style.alignItems = "center";
  revealWrap.style.marginTop = "10px";

  var btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = "Reveal Winner";
  btn.onclick = function(){
    btn.remove();

    var c = statusCardSquare(F.first, "", GOLD);
    labelUnder(c, "Winner", "placements-label");

    revealWrap.appendChild(c);
  };

  revealWrap.appendChild(btn);
  epContent.appendChild(revealWrap);

  addProceed(ep, section); 
  return;
}

  addProceed(ep, section); return;
}

if(section==="status"){
  epSub.textContent = (S.statusMode==="teams") ? "Status (Teams)" : "Status";
  var snap = (S.status || []).slice();

  var teamsSnap = (S.statusMode==="teams") ? getEpisodeTeamsSnapshot(S) : null;
  var hasTeams = !!(teamsSnap && teamsSnap.gold && teamsSnap.red && teamsSnap.gold.length && teamsSnap.red.length);

  if(S.statusMode==="noTeams" || S.statusMode==="individual" || !hasTeams){
    var wrap=document.createElement("div"); wrap.className="team-wrap";
    wrap.style.borderColor = "var(--glass-border)";
    var hw=document.createElement("div"); hw.className="status-title"; hw.textContent=snap.length+" players";

    wrap.appendChild(hw);

    for(var i=0;i<snap.length;i+=4){
      var row=document.createElement("div"); row.className="team-row";
      snap.slice(i,i+4).forEach(function(pid){ row.appendChild(statusCard(pid)); });
      wrap.appendChild(row);
    }

    epContent.innerHTML="";
    epContent.appendChild(wrap);
    addProceed(ep, section); return;
  }

  epContent.innerHTML="";

  var teams = [
    { key:"gold", name:"Gold Team", ids: teamsSnap.gold.slice() },
    { key:"red",  name:"Red Team",  ids: teamsSnap.red.slice()  }
  ];

  teams.forEach(function(t){
    var wrap = teamWrap(t.key);
    var hw=document.createElement("div"); hw.className="status-title";
    hw.textContent = t.name + " — " + t.ids.length + " players";
    wrap.appendChild(hw);

    for(var i=0;i<t.ids.length;i+=6){
      var row=document.createElement("div"); row.className="team-row";
      t.ids.slice(i,i+6).forEach(function(pid){ row.appendChild(statusCard(pid)); });
      wrap.appendChild(row);
    }

    epContent.appendChild(wrap);
  });

  addProceed(ep, section); return;
}

if(section==="events1" || section==="events2" || section==="events3"){
      var evs =
  (section==="events1") ? (S.events1||[]) :
  (section==="events2") ? (S.events2||[]) :
  (S.events3||[]);
      epSub.textContent =
  (section==="events1" ? "House Events 1" :
   section==="events2" ? "House Events 2" :
   "House Events 3");
      var grid=document.createElement("div"); grid.className="events-grid three-cols";
      for(var i=0;i<evs.length;i++){
        var ev=evs[i];
        var subject = (ev.players && ev.players.length)? ev.players[0] : null;
        var card=document.createElement("div"); card.className="mini-card";
        if(subject){ card.style.borderColor = teamColorOf(subject); card.style.borderWidth="3px"; }
        var avatars=document.createElement("div"); avatars.className="row tiny-avatars";
        (ev.players||[]).forEach(function(pid){ var img=document.createElement("img"); img.className="avatar xs"; img.src=picOf(pid); img.alt=""; avatars.appendChild(img); });
        card.appendChild(avatars);
        var text=document.createElement("div"); text.textContent=ev.text; card.appendChild(text);
        grid.appendChild(card);
      }
      epContent.innerHTML=""; epContent.appendChild(grid); addProceed(ep, section); return;
    }
}

function addProceed(ep, section){
  var order = bgasbSectionOrder(ep);
  var idx = order.indexOf(section);

  var btn = document.createElement("button");
  btn.className="btn proceed";
  btn.textContent="Proceed";

  btn.onclick=function(){
    if(section==="final_results"){
      showStatisticsPanel("placements");
      btn.remove();
      return;
    }

    if(idx>=0 && idx < order.length-1){
      showEpisodeSection(ep, order[idx+1]);
      btn.remove();
      return;
    }

    if(ep < 12){
      var nextOrder = bgasbSectionOrder(ep+1);
      showEpisodeSection(ep+1, nextOrder[0] || "status");
      btn.remove();
      return;
    }

    showStatisticsPanel("placements");
    btn.remove();
  };

  epActions.appendChild(btn);
}

function showStatisticsPanel(kind){
  var titles = {
    placements: "Placements",
    other_stats: "Other Statistics",
    chart: "Season Chart"
  };

  epTitle.textContent = titles[kind] || "Statistics";
  epSub.textContent = "";
  epActions.innerHTML = "";
  epContent.innerHTML = "";

  if(kind==="placements"){
    var first = state.placements.final.first;
    var second = state.placements.final.second;
    var third = state.placements.final.third;

    var head = document.createElement("div");
    head.className = "wide-card title";
    head.textContent = "Final Podium";
    epContent.appendChild(head);

    var podiumRow = document.createElement("div");
    podiumRow.className = "team-row";
    podiumRow.style.justifyContent = "center";
    podiumRow.style.gap = "16px";

    function podium(pid, label){
      var c = statusCardSquare(pid, "", teamColorOf(pid));
      labelUnder(c, label, "placements-label");
      return c;
    }

    if(second) podiumRow.appendChild(podium(second, "Runner-Up"));
    if(first)  podiumRow.appendChild(podium(first, "Winner"));
    if(third)  podiumRow.appendChild(podium(third, "3rd Place"));

    epContent.appendChild(podiumRow);

    var elim = (state.placements.eliminated || [])
      .slice()
      .filter(function(x){ return x && x.id; })
      .sort(function(a,b){ return (a.place||999) - (b.place||999); });

    var head2 = document.createElement("div");
    head2.className = "wide-card title";
    head2.textContent = "Eliminated";
    head2.style.marginTop = "12px";
    epContent.appendChild(head2);

    var row = null;
    elim.forEach(function(r, idx){
      if(idx % 5 === 0){
        row = document.createElement("div");
        row.className = "placements-row";
        epContent.appendChild(row);
      }
      var c = statusCardSquare(r.id, "", teamColorOf(r.id));
      labelUnder(c, ordinal(r.place) + " Place", "placements-label");
      row.appendChild(c);
    });

    var btn = document.createElement("button");
    btn.className = "btn proceed";
    btn.textContent = "Proceed";
    btn.onclick = function(){ showStatisticsPanel("other_stats"); btn.remove(); };
    epActions.appendChild(btn);
    return;
  }

  if(kind==="other_stats"){
    function incMap(map, key, amt){
      if(!key) return;
      map[key] = (map[key] || 0) + (amt == null ? 1 : amt);
    }
    function topKey(map){
      var keys = Object.keys(map||{});
      if(!keys.length) return { keys:[], val:0 };
      var max = 0;
      keys.forEach(function(k){ if(map[k] > max) max = map[k]; });
      if(max <= 0) return { keys:[], val:0 };
      var tied = keys.filter(function(k){ return map[k] === max; });
      return { keys:tied, val:max };
    }
    function joinNames(list, formatter){
      return list.map(formatter).join(list.length > 1 ? " & " : "");
    }

    var captains = {};
    var teamWinsByTeam = { gold:0, red:0 };
    var battleWins = {};
    var nominated = {};
    var votesAgainst = {};

    for(var ep=1; ep<=11; ep++){
      var E = state.episodes && state.episodes[ep];
      if(!E) continue;
      if(ep<=6 && E.captain){
        incMap(captains, E.captain.gold, 1);
        incMap(captains, E.captain.red, 1);
      }

      if(ep<=6 && E.team && E.team.winner){
        if(teamWinsByTeam[E.team.winner] != null) teamWinsByTeam[E.team.winner] += 1;
      }

      if(ep>=7 && E.battle && E.battle.winner){
        incMap(battleWins, E.battle.winner, 1);
      }

      if(E.nominations && Array.isArray(E.nominations.nominees)){
        E.nominations.nominees.forEach(function(pid){ incMap(nominated, pid, 1); });
      }

      if(E.voting && E.voting.tally){
        if(E.voting.mode === "save") {
        } else {
          var keys = (E.voting.nominees && E.voting.nominees.length)
            ? E.voting.nominees.slice()
            : Object.keys(E.voting.tally);

          keys.forEach(function(pid){
            incMap(votesAgainst, pid, (E.voting.tally[pid] || 0));
          });
        }
      }
    }

    var topCapt = topKey(captains);
    var topTeam = topKey(teamWinsByTeam);
    var topBattle = topKey(battleWins);
    var topNom = topKey(nominated);
    var topVotes = topKey(votesAgainst);

    function fmtPid(pid){ return nameOf(pid); }
    function fmtTeam(k){ return (k==="gold" ? "Gold Team" : (k==="red" ? "Red Team" : k)); }

    var head = document.createElement("div");
    head.className = "wide-card title";
    head.textContent = "Other Statistics";
    epContent.appendChild(head);

    var card = document.createElement("div");
    card.className = "mini-card";
    card.style.maxWidth = "1000px";

    var table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "0.98rem";

    function th(txt, align){
      var x = document.createElement("th");
      x.textContent = txt;
      x.style.textAlign = align || "left";
      x.style.padding = "10px 12px";
      x.style.borderBottom = "1px solid rgba(120,130,155,.35)";
      x.style.fontWeight = "600";
      x.style.opacity = ".95";
      return x;
    }

    function td(txt, align){
      var x = document.createElement("td");
      x.textContent = txt;
      x.style.textAlign = align || "left";
      x.style.padding = "10px 12px";
      x.style.borderBottom = "1px solid rgba(120,130,155,.25)";
      x.style.opacity = ".95";
      return x;
    }

    var thead = document.createElement("thead");
    var trh = document.createElement("tr");
    trh.appendChild(th("Category", "left"));
    trh.appendChild(th("Name / Team", "left"));
    trh.appendChild(th("Number", "right"));
    thead.appendChild(trh);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");

    function addRow(cat, name, num){
      var tr = document.createElement("tr");
      tr.appendChild(td(cat, "left"));
      tr.appendChild(td(name || "—", "left"));
      tr.appendChild(td(String(num || 0), "right"));
      tbody.appendChild(tr);
    }

    addRow(
      "Most Times Being a Captain",
      topCapt.keys.length ? joinNames(topCapt.keys, fmtPid) : "—",
      topCapt.val
    );

    addRow(
      "Most Team Challenge Wins",
      topTeam.keys.length ? joinNames(topTeam.keys, fmtTeam) : "—",
      topTeam.val
    );

    addRow(
      "Most Individual Challenge Wins",
      topBattle.keys.length ? joinNames(topBattle.keys, fmtPid) : "—",
      topBattle.val
    );

    addRow(
      "Most Times Nominated",
      topNom.keys.length ? joinNames(topNom.keys, fmtPid) : "—",
      topNom.val
    );

    addRow(
      "Most Votes Against",
      topVotes.keys.length ? joinNames(topVotes.keys, fmtPid) : "—",
      topVotes.val
    );

    table.appendChild(tbody);
    card.appendChild(table);
    epContent.appendChild(card);

    var btnS = document.createElement("button");
    btnS.className = "btn proceed";
    btnS.textContent = "Proceed";
    btnS.onclick = function(){ showStatisticsPanel("chart"); btnS.remove(); };
    epActions.appendChild(btnS);

    return;
  }

  var btn2 = document.createElement("button");
  btn2.className = "btn";
  btn2.textContent = "Open Season Chart";
  btn2.onclick = function(){ location.href="./season_chart.html"; };
  epContent.appendChild(btn2);
}
})();