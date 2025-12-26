
  var IMG_BLANK = "BlankProfile.webp";
  var BLUE = "#0000ff";
  var RED  = "#ff0000";

  var rnd = function(n){ return Math.floor(Math.random() * n); };
  var sample = function(arr){ return arr.length ? arr[rnd(arr.length)] : undefined; };
  var shuffle = function(arr){ return arr.map(function(v){return [Math.random(),v];}).sort(function(a,b){return a[0]-b[0];}).map(function(x){return x[1];}); };
  var clamp = function(n,min,max){ return Math.max(min, Math.min(max,n)); };

var ACTIVE_SKILL_DELTAS = null;

function setActiveSkillDeltas(deltaMap){
  ACTIVE_SKILL_DELTAS = deltaMap || null;
}

function rollSkillDelta(cfg){
  cfg = cfg || {};
  var p0 = (cfg.p0 != null) ? cfg.p0 : 0.55;
  var p1 = (cfg.p1 != null) ? cfg.p1 : 0.18;
  var m1 = (cfg.m1 != null) ? cfg.m1 : 0.18;
  var p2 = (cfg.p2 != null) ? cfg.p2 : 0.045;
  var m2 = (cfg.m2 != null) ? cfg.m2 : 0.045;

  var r = Math.random();
  if (r < p0) return 0; r -= p0;
  if (r < p1) return 1; r -= p1;
  if (r < m1) return -1; r -= m1;
  if (r < p2) return 2; r -= p2;
  return -2;
}

function buildSkillDeltaMap(playerIds, skillKeys, cfg){
  cfg = cfg || {};
  var maxAbs = (cfg.maxAbs != null) ? cfg.maxAbs : 1;

  var map = {};
  (playerIds || []).forEach(function(pid){
    if(!pid) return;
    var per = {};
    (skillKeys || []).forEach(function(k){
      var d = rollSkillDelta(cfg);
      d = clamp(d, -maxAbs, maxAbs);
      if (d) per[k] = d;
    });
    if (Object.keys(per).length) map[pid] = per;
  });
  return map;
}

function deltaFor(pid, key){
  if(!ACTIVE_SKILL_DELTAS) return 0;
  var per = ACTIVE_SKILL_DELTAS[pid];
  if(!per) return 0;
  return per[key] || 0;
}

  (function normalizePlayers(){
    if (Array.isArray(window.PLAYERS) && window.PLAYERS.length) return;
    var src = window.PLAYERS || window.players || window.player_data;
    if (!Array.isArray(src) || src.length === 0) {
      var pd = window.playerData;
      if (pd && (Array.isArray(pd.males) || Array.isArray(pd.females) || Array.isArray(pd.others))) {
        var tag = function(arr, gender){
          return (Array.isArray(arr) ? arr : []).map(function(p){
            var primaryShow = p.show || (Array.isArray(p.shows) && p.shows.length ? p.shows[0] : "");
            var baseSeason  = Array.isArray(p.season) ? p.season.slice() : (p.season != null ? [p.season] : []);
            var seasonsByShow = p.seasonsByShow || (primaryShow ? { [primaryShow]: baseSeason } : {});
            var shows = Array.isArray(p.shows) && p.shows.length ? p.shows.slice() : (primaryShow ? [primaryShow] : []);
            return {
              id: p.id,
              name: p.name,
              nickname: p.nickname || p.name || p.id,
              show: primaryShow,
              season: p.season,
              shows: shows,
              seasonsByShow: seasonsByShow,
              gender: gender || p.gender || "unknown",
              image: p.image || (p.id ? ("../../contestant_pictures/" + p.id + ".webp") : IMG_BLANK)
            };
          });
        };
        src = [].concat(tag(pd.males, "male"), tag(pd.females, "female"), tag(pd.others, null));
      } else { src = []; }
    }
    window.PLAYERS = src;
    window.PLAYERS_BY_ID = Object.fromEntries((src || []).map(function(p){ return [p.id, p]; }));
  })();

var KEY = "challenge-gauntlet2-season";

var State = {
  load: function () {
    var raw = null;

    try { raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY); } catch (e) {}

    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  },

  save: function (s) {
    var json = JSON.stringify(s);
    try { sessionStorage.setItem(KEY, json); } catch (e) {}
    try { localStorage.setItem(KEY, json); } catch (e) {}
  },

  clear: function () {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    try { localStorage.removeItem(KEY); } catch (e) {}
  }
};

  var state = State.load() || {
    seed: Math.random().toString(36).slice(2,8).toUpperCase(),
    castBlue: Array.from({length:14}).map(function(){ return null; }),
    castRed:  Array.from({length:14}).map(function(){ return null; }),
    relationships: {},
    profiles: {},
    episodes: {},
    ui: {},
    stats: { teamDailyWins: { blue:0, red:0 }, elimWins:{}, elimPlays:{}, captainEpisodes:{} },
    captains: { blue: { male:null, female:null }, red: { male:null, female:null } },
    alive: { blue: [], red: [] },
    placements: { winnersTeam:null, secondTeam:null, eliminated:[] },
    chart: { finalized:false, episodes:{} },
    simulated: false,
    lastView: null
  };

  var elTeams = document.getElementById("teams-grid");
  var elFilterShow = document.getElementById("filter-show");
  var elInfoCast = document.getElementById("info-cast-size");
  var elInfoSeed = document.getElementById("info-seed");
  var elInfoStatus = document.getElementById("info-status");
  var elAccordion = document.getElementById("episode-accordion");
  var viewCast = document.getElementById("view-cast");
  var viewEpisode = document.getElementById("view-episode");
  var epTitle = document.getElementById("ep-title");
  var epSub = document.getElementById("ep-subtitle");
  var epContent = document.getElementById("ep-content");
  var epActions = document.getElementById("ep-actions");
  var statsPanel = document.getElementById("stats-panel");

  function asEntry(p){
    return {
      id: p.id,
      name: p.name || p.nickname || p.id,
      nickname: p.nickname || p.name || p.id,
      image: p.image || (p.id ? ("../../contestant_pictures/" + p.id + ".webp") : IMG_BLANK),
      gender: p.gender || "unknown",
      show: p.show || "",
      shows: Array.isArray(p.shows) && p.shows.length
        ? p.shows.slice()
        : (p.show ? [p.show] : []),
      seasonsByShow: p.seasonsByShow || null
    };
  }

  function getPlayerShows(p){
    if (!p) return [];
    if (Array.isArray(p.shows) && p.shows.length) return p.shows;
    if (p.seasonsByShow && typeof p.seasonsByShow === "object") {
      return Object.keys(p.seasonsByShow);
    }
    return p.show ? [p.show] : [];
  }

  function getPlayerSeasonsForShow(p, show){
    if (!p || !show) return [];
    if (p.seasonsByShow && p.seasonsByShow[show]) {
      var arr = p.seasonsByShow[show];
      return Array.isArray(arr) ? arr.slice() : [arr];
    }
    if (p.show === show) {
      if (Array.isArray(p.season)) return p.season.slice();
      if (p.season != null) return [p.season];
    }
    return [];
  }

  function playerHasShow(p, show){
    if (!show) return true;
    return getPlayerShows(p).indexOf(show) !== -1;
  }

  function relKey(a,b){ return a<b ? (a+"|"+b) : (b+"|"+a); }
  function rel(a,b){ return state.relationships[relKey(a,b)] ?? 0; }
  function skillOf(pid, key){
  var s = state.profiles[pid] ? state.profiles[pid][key] : 0;
  var v = (typeof s === "number") ? s : 0;

  v += deltaFor(pid, key);

  return clamp(v, -3, 3);
}
  function nameOf(pid){ var all = state.castBlue.concat(state.castRed).filter(Boolean); var c = all.find(function(x){ return x && x.id===pid; }); return c ? (c.nickname || c.name || pid) : pid; }
  function picOf(pid){ var all = state.castBlue.concat(state.castRed).filter(Boolean); var c = all.find(function(x){ return x && x.id===pid; }); return c ? (c.image || IMG_BLANK) : IMG_BLANK; }
  function teamOf(pid){ if(state.castBlue.some(function(x){return x && x.id===pid;})) return "blue"; if(state.castRed.some(function(x){return x && x.id===pid;})) return "red"; return null; }
  function scorePlayer(weights, pid){ if(!pid) return -9999; var total=0; for(var k in (weights||{})){ if(Object.prototype.hasOwnProperty.call(weights,k)){ total += (skillOf(pid,k) * (typeof weights[k]==="number"?weights[k]:1)); } } return total; }
  function averageTeamScore(weights, teamKey, pool){ var ids = (pool && pool.length) ? pool.filter(Boolean) : state.alive[teamKey].slice(); if(!ids.length) return 0; var sum = ids.reduce(function(acc, pid){ return acc + scorePlayer(weights, pid); }, 0); return sum / ids.length; }
  function episodeGender(ep){ return (ep % 2 === 0) ? "male" : "female"; }
  function aliveByGender(teamKey, gender){ return state.alive[teamKey].filter(function(pid){ var all = state.castBlue.concat(state.castRed).filter(Boolean); var p = all.find(function(x){return x.id===pid;}); return p && p.gender===gender; }); }
  function addCaptainEpisodeCount(pid){ if(!pid) return; state.stats.captainEpisodes[pid] = (state.stats.captainEpisodes[pid]||0) + 1; }

  function buildFilterShows(roster){
    var showSet = new Set();
    (roster || []).forEach(function(r){
      getPlayerShows(r).forEach(function(s){
        if (s) showSet.add(s);
      });
    });
    var shows = Array.from(showSet).sort();
    var options = '<option value="">— All Shows —</option>' +
      shows.map(function(s){ return '<option value="'+s+'">'+s+'</option>'; }).join("");
    elFilterShow.innerHTML = options;
    elFilterShow.onchange = function(){ buildTeamsGrid(roster); };
  }

  function playerOptions(roster, genderNeeded, selectedId){
    var showFilter = elFilterShow.value;
    var filtered = roster.filter(function(r){
      var ok = (!showFilter || playerHasShow(r, showFilter));
      return !genderNeeded ? ok : (ok && r.gender === genderNeeded);
    });
    var opts = ['<option value="">Choose</option>'];
    for (var i=0;i<filtered.length;i++){
      var r = filtered[i]; var sel = (selectedId && r.id===selectedId) ? " selected" : "";
      opts.push('<option value="'+r.id+'"'+sel+'>'+ (r.name || r.nickname || r.id) +'</option>');
    }
    return opts.join("");
  }
  function buildTeamBox(teamKey, color){
    var box = document.createElement("div"); box.className="team-box"; box.style.borderColor=color;
    var label = (teamKey==="blue" ? "Rookies" : "Veterans");
    box.innerHTML = '<div class="team-head"><span class="label">'+label+'</span><span class="team-tag" style="color:'+color+'">'+(teamKey==="blue"?"Blue Team":"Red Team")+'</span></div>';
    var inner = document.createElement("div"); inner.className="team-inner";
    for(var i=0;i<14;i++){
      var slot = (teamKey==="blue" ? state.castBlue[i] : state.castRed[i]) || null;
      var needGender = (i<7 ? "male" : "female");
      var title = (needGender==="male" ? "Male " : "Female ") + ((i%7)+1);
      var card = document.createElement("div"); card.className="pick-card";
      card.innerHTML =
        '<img class="avatar" src="'+(slot? slot.image : IMG_BLANK)+'" alt="">' +
        '<div class="name">'+(slot? (slot.nickname) : title)+'</div>' +
        '<select class="pick-player" data-team="'+teamKey+'" data-slot="'+i+'" data-gender="'+needGender+'">'+ playerOptions(window.PLAYERS||[], needGender, slot? slot.id : "") +'</select>' +
        '<button class="btn btn-custom" data-team="'+teamKey+'" data-slot="'+i+'" type="button">Custom Player</button>';
      inner.appendChild(card);
    }
    box.appendChild(inner); return box;
  }
  function buildTeamsGrid(roster){
    elTeams.innerHTML = ""; elTeams.appendChild(buildTeamBox("blue", BLUE)); elTeams.appendChild(buildTeamBox("red", RED));
    elTeams.querySelectorAll(".pick-player").forEach(function(sel){
      sel.onchange = function(e){
        var i = +e.target.dataset.slot, team = e.target.dataset.team, gender = e.target.dataset.gender, id = e.target.value || "";
        if(!id){ if(team==="blue") state.castBlue[i]=null; else state.castRed[i]=null; State.save(state); return buildTeamsGrid(roster); }
        var p = (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id]) || roster.find(function(r){return r.id===id;});
        if(!p || (gender && p.gender!==gender)) return;
        var entry = asEntry(p); if(team==="blue") state.castBlue[i]=entry; else state.castRed[i]=entry; State.save(state); buildTeamsGrid(roster);
      };
    });
elTeams.querySelectorAll(".btn-custom").forEach(function(btn){
  btn.onclick = function(){
    var slot = +btn.dataset.slot;
    var gender = slot < 7 ? "male" : "female";
    openCustomModal(btn.dataset.team, slot, gender);
  };
});
    var filledBlue = state.castBlue.filter(Boolean).length, filledRed  = state.castRed.filter(Boolean).length;
    elInfoCast.textContent = (filledBlue===14 && filledRed===14) ? "2" : "0/2";
  }

  function pickUnique(arr, n, excludeSet){
    var pool = arr.filter(function(p){ return !excludeSet.has(p.id); });
    var out = [];
    for (var i=0; i<n && pool.length; i++){
      var idx = Math.floor(Math.random()*pool.length);
      out.push(pool[idx]);
      excludeSet.add(pool[idx].id);
      pool.splice(idx,1);
    }
    return out;
  }

  function randomizeTeams(forceSplit){
    var roster = (window.PLAYERS || []).slice();
    if (!roster.length){ alert("No player data loaded (../../player_data.js)."); return; }
    var showFilter = (document.getElementById("filter-show") || {}).value || "";
    if (showFilter) {
      roster = roster.filter(function(r){ return playerHasShow(r, showFilter); });
    }
    var males   = roster.filter(function(r){ return r.gender === "male"; });
    var females = roster.filter(function(r){ return r.gender === "female"; });
    var needM = 7, needF = 7;
    var ex = new Set();
    var blueM = pickUnique(males, needM, ex);
    var blueF = pickUnique(females, needF, ex);
    var redM  = pickUnique(males, needM, ex);
    var redF  = pickUnique(females, needF, ex);
    if (blueM.length<needM || blueF.length<needF || redM.length<needM || redF.length<needF){
      alert("Not enough eligible players (check your filter or player_data).");
      return;
    }
    state.castBlue = [].concat(blueM.map(asEntry)).concat(blueF.map(asEntry));
    state.castRed  = [].concat(redM.map(asEntry)).concat(redF.map(asEntry));
    State.save(state);
    buildTeamsGrid(window.PLAYERS||[]);
  }
  function resetCast(){
    state.castBlue = Array.from({length:14}).map(function(){return null;});
    state.castRed  = Array.from({length:14}).map(function(){return null;});
    State.save(state);
    buildTeamsGrid(window.PLAYERS||[]);
  }

  var modal = document.createElement("dialog");
  modal.className = "antm-modal";
  modal.innerHTML = '<form id="custom-form" method="dialog" autocomplete="off">'+
    '<h3>Add Custom Player</h3>'+
    '<label>Full Name <input name="name" id="cp-name" required autocomplete="name" /></label>'+
    '<label>Nickname <input name="nickname" id="cp-nickname" required autocomplete="nickname" /></label>'+
    '<label>Image URL <input name="image" id="cp-image" placeholder="https://..." autocomplete="off" /></label>'+
    '<menu><button type="button" class="btn" id="modal-cancel">Cancel</button><button type="submit" class="btn">Add</button></menu>'+
  '</form>';
  document.body.appendChild(modal);
function openCustomModal(team, slot, genderHint){
  modal.showModal();
  var formCustom = modal.querySelector("#custom-form");
  var cancelBtn = modal.querySelector("#modal-cancel");
  var gender = genderHint || (slot < 7 ? "male" : "female");

  formCustom.onsubmit = function (ev) {
    ev.preventDefault();

    var name = formCustom.querySelector("#cp-name").value.trim();
    var nickname = formCustom.querySelector("#cp-nickname").value.trim();
    var image = formCustom.querySelector("#cp-image").value.trim();

    if (!name || !nickname) { return; }

    var id = nickname.toLowerCase().replace(/[^a-z0-9]+/g, "_") + "_" + Date.now().toString(36);

    var cp = {
      id: id,
      name: name,
      nickname: nickname,
      show: "Custom",
      image: image || IMG_BLANK,
      gender: gender
    };

    if (team === "blue") {
      state.castBlue[slot] = asEntry(cp);
    } else {
      state.castRed[slot] = asEntry(cp);
    }

    State.save(state);
    modal.close();
    formCustom.reset();
    buildTeamsGrid(window.PLAYERS || []);
  };

  cancelBtn.onclick = function () {
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
  var showSet = new Set();

  (roster || []).forEach(function(p){
    getPlayerShows(p).forEach(function(s){
      if (s) showSet.add(s);
    });
  });

  var shows = Array.from(showSet).sort();

  list.innerHTML = shows.map(function(show){
    return '' +
      '<label>' +
        '<input type="checkbox" data-show="'+show+'">' +
        '<span>'+show+'</span>' +
        '<input type="text" class="rand-seasons" data-show="'+show+'" ' +
          'placeholder="Seasons (e.g. 1, 3-4, 6)">' +
      '</label>';
  }).join("");
}

function filterRosterByPrefs(prefs){
  var roster = (window.PLAYERS || []).slice();
  if (!prefs || !Object.keys(prefs).length) return roster;

  return roster.filter(function(p){
    var shows = getPlayerShows(p);
    if (!shows.length) return false;

    var matched = false;

    shows.forEach(function(show){
      if (matched) return;
      var cfg = prefs[show];
      if (!cfg) return;
      if (!cfg.seasons || !cfg.seasons.length) {
        matched = true;
        return;
      }

      var seasons = getPlayerSeasonsForShow(p, show).map(function(s){ return String(s).toLowerCase(); });
      if (!seasons.length) return;

      var ok = cfg.seasons.some(function(token){
        return seasons.some(function(s){ return s.indexOf(token) !== -1; });
      });
      if (ok) matched = true;
    });

    return matched;
  });
}

function randomizeTeamsWithPrefs(prefs){
  var roster = filterRosterByPrefs(prefs);
  if (!roster.length){
    alert("No eligible players for the selected shows/seasons.");
    return;
  }

  var males   = roster.filter(function(r){ return r.gender === "male"; });
  var females = roster.filter(function(r){ return r.gender === "female"; });
  var needM = 7, needF = 7;
  var ex = new Set();

  var blueM = pickUnique(males, needM, ex);
  var blueF = pickUnique(females, needF, ex);
  var redM  = pickUnique(males, needM, ex);
  var redF  = pickUnique(females, needF, ex);

  if (blueM.length<needM || blueF.length<needF || redM.length<needM || redF.length<needF){
    alert("Not enough eligible players for those filters. Try fewer restrictions.");
    return;
  }

  state.castBlue = [].concat(blueM.map(asEntry)).concat(blueF.map(asEntry));
  state.castRed  = [].concat(redM.map(asEntry)).concat(redF.map(asEntry));
  State.save(state);
  buildTeamsGrid(window.PLAYERS || []);
}

function openRandomizeModal(){
  if (!window.PLAYERS || !window.PLAYERS.length){
    alert("No player data loaded (../../player_data.js).");
    return;
  }
  buildRandomizeShowList();
  randModal.showModal();

  var formRand = randModal.querySelector("#rand-form");
  var btnCancel = randModal.querySelector("#rand-cancel");

  formRand.onsubmit = function(ev){
    ev.preventDefault();

    var prefs = {};
    var checks = randModal.querySelectorAll("input[type=checkbox][data-show]");
    checks.forEach(function(cb){
      if (!cb.checked) return;
      var show = cb.getAttribute("data-show");
      var input = randModal.querySelector('input.rand-seasons[data-show="'+show+'"]');
      var seasons = [];
      if (input && input.value.trim()){
        seasons = input.value.split(/[,;]/).map(function(s){ return s.trim().toLowerCase(); }).filter(Boolean);
      }
      prefs[show] = { seasons: seasons };
    });

    randModal.close();
    randomizeTeamsWithPrefs(prefs);
  };

  btnCancel.onclick = function(){
    randModal.close();
  };
}


  function buildLeftAccordion(){
    elAccordion.innerHTML = "";
    for(var e=1;e<=16;e++){
      var details = document.createElement("details"); details.className = "details-ep"; if(e===1) details.open = true;
      var inner = '<summary>Episode '+e+'</summary><div class="section-box"><div class="section-links">';
      if(e===1){
        inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="format">Format</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events 1</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="daily">Captain Challenge</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="events2">House Events 2</button>';
      } else if (e>=2 && e<=15){
        inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events 1</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="daily">Daily Challenge</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="events2">House Events 2</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="voting">Voting</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="elimination">The Gauntlet</button>';
      } else {
        inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final_rules">Final Rules</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final1">Final Stage 1</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final2">Final Stage 2</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final3">Final Stage 3</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final_results">Final Results</button>';
      }
      inner += "</div></div>"; details.innerHTML = inner; elAccordion.appendChild(details);
    }
    statsPanel.style.display = state.simulated ? "block" : "none";
    elAccordion.querySelectorAll(".section-links .btn").forEach(function(b){
      b.onclick = function(){
        elAccordion.querySelectorAll(".section-links button").forEach(function(x){ x.classList.remove("active"); });
        b.classList.add("active"); showEpisodeSection(+b.dataset.ep, b.dataset.sec);
      };
    });
  }
  function addProceed(ep, section){
    var order1 = ["status","format","events1","daily","events2"];
    var orderMid = ["status","events1","daily","events2","voting","elimination"];
    var orderF = ["status","final_rules","final1","final2","final3","final_results"];
    var order = (ep===1) ? order1 : (ep<=15 ? orderMid : orderF);
    var idx = order.indexOf(section);
    var btn = document.createElement("button"); btn.className = "btn proceed"; btn.textContent = "Proceed";
    btn.onclick = function(){
      if(ep===1 && section==="events2"){ showEpisodeSection(2, "status"); btn.remove(); return; }
      if(section==="elimination" && ep<=15){ showEpisodeSection(ep+1, "status"); btn.remove(); return; }
      if(section==="final_results"){ showStatisticsPanel("placements"); btn.remove(); return; }
      if(idx>=0 && idx<order.length-1){ showEpisodeSection(ep, order[idx+1]); btn.remove(); }
    };
    epActions.appendChild(btn);
  }

  function renderNames(text, ids){
    var out = text, labels = ["{A}","{B}","{C}"];
    ids.forEach(function(pid, i){ out = out.split(labels[i]).join(nameOf(pid)); });
    return out;
  }
  function genHouseEvents(teamKeys){
    var aliveP = [];
    (teamKeys||["blue","red"]).forEach(function(tk){ aliveP = aliveP.concat(state.alive[tk] || []); });
    var E = (window.G2_EVENTS || window.FM_EVENTS) || {};
    var pick = function(a){ return a && a.length ? sample(a) : null; };
    var out = []; var count = 4 + rnd(4);
    for(var i=0;i<count;i++){
      var roll = Math.random();
      if(roll<0.25){
        var A = sample(aliveP); var ev1 = pick(E.solo_neutral);
        if(ev1 && A) out.push({ type:"solo", players:[A], text: renderNames(ev1, [A]), sentiment:"neutral" });
      } else if(roll<0.75){
        var P1 = sample(aliveP), P2 = sample(aliveP.filter(function(x){return x!==P1;})) || P1;
        var bucket = E.two_neutral, sentiment="neutral"; var r = rel(P1,P2);
        if(r>=5 && Math.random()<0.35){ bucket = E.two_positive; sentiment="positive"; }
        if(r<=-3 && Math.random()<0.35){ bucket = E.two_negative; sentiment="negative"; }
        var ev2 = pick(bucket); if(ev2 && P1 && P2) out.push({ type:"pair", players:[P1,P2], text: renderNames(ev2, [P1,P2]), sentiment:sentiment });
      } else {
        var A3 = sample(aliveP), B3 = sample(aliveP.filter(function(x){return x!==A3;})), C3 = sample(aliveP.filter(function(x){return x!==A3 && x!==B3;}));
        var ev3 = pick(E.team_neutral); if(ev3 && A3 && B3 && C3) out.push({ type:"team", players:[A3,B3,C3], text: renderNames(ev3, [A3,B3,C3]), sentiment:"neutral" });
      }
    }
    return out;
  }

  function dailyDataForEpisode(ep){
    var DD = window.DAILY_DATA || window.G2_DAILY_DATA || [];
    return (DD||[]).find(function(d){ return d.episode===ep; }) || { name:"Daily "+ep, description:"", skillWeights:{}, comments:{} };
  }
  function elimDataForEpisode(ep){
    var ED = window.ELIMINATION_DATA || window.G2_ELIMINATION_DATA || [];
    return (ED||[]).find(function(d){ return d.episode===ep; }) || { name:"Elimination "+ep, description:"", skillWeights:{}, gender: ((ep%2)===0?'male':'female'), comments:{} };
  }

document.getElementById("btn-profiles").addEventListener("click", function(){ location.href = "./profiles.html"; });
document.getElementById("btn-relationships").addEventListener("click", function(){ location.href = "./relationships.html"; });

document.getElementById("btn-randomize").onclick = openRandomizeModal;

document.getElementById("btn-reset-cast").onclick = resetCast;
var btnResetSession = document.getElementById("btn-reset-session");
if (btnResetSession) {
  btnResetSession.addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Reset the entire Gauntlet 2 season? This will clear cast, custom players, relationships, and results.")) {
      State.clear();
      window.location.reload();
    }
  });
}

var btnBackCast = document.getElementById("btn-back-cast");
if (btnBackCast){
  btnBackCast.addEventListener("click", function(e){
    e.preventDefault();
    resetSeasonKeepCast();
  });
}

  document.getElementById("btn-simulate").onclick = function(){
    if(state.castBlue.filter(Boolean).length !== 14 || state.castRed.filter(Boolean).length !== 14){
      alert("Please complete all 14 Blue and 14 Red slots before simulating."); return;
    }
    state.alive.blue = state.castBlue.map(function(x){return x.id;});
    state.alive.red  = state.castRed.map(function(x){return x.id;});
    simulateEntireSeason();
    state.simulated = true; State.save(state);
    buildLeftAccordion(); viewCast.hidden = true; viewEpisode.hidden = false;
    showEpisodeSection(1,"status");
    elInfoStatus.textContent = "Simulated"; elInfoCast.textContent = "2";
  };

  function simulateEntireSeason(){
    state.episodes = {}; state.ui = {}; state.chart = { finalized:false, episodes:{} };
    state.stats.teamDailyWins = { blue:0, red:0 }; state.stats.elimWins = {}; state.stats.elimPlays = {}; state.stats.captainEpisodes = {};
    state.placements = { winnersTeam:null, secondTeam:null, eliminated:[] };
    simulateEpisode1();
    for(var ep=2; ep<=15; ep++){ simulateMidEpisode(ep); }
    simulateFinalsEp16();
    state.chart.finalized = true;
  }

function resetSeasonKeepCast(){
  state.alive = { blue: [], red: [] };
  state.captains = { blue: { male:null, female:null }, red: { male:null, female:null } };
  state.episodes = {};
  state.ui = {};
  state.stats = { teamDailyWins: { blue:0, red:0 }, elimWins:{}, elimPlays:{}, captainEpisodes:{} };
  state.placements = { winnersTeam:null, secondTeam:null, eliminated:[] };
  state.chart = { finalized:false, episodes:{} };
  state.simulated = false;
  state.lastView = null;

  State.save(state);

  viewCast.hidden = false;
  viewEpisode.hidden = true;
  statsPanel.style.display = "none";
  epContent.innerHTML = "";
  epActions.innerHTML = "";
  elAccordion.innerHTML = "";
  elInfoStatus.textContent = "Not simulated";

  var filledBlue = state.castBlue.filter(Boolean).length;
  var filledRed  = state.castRed.filter(Boolean).length;
  elInfoCast.textContent = (filledBlue === 14 && filledRed === 14) ? "2" : "0/2";

  buildTeamsGrid(window.PLAYERS || []);
}

  function simulateEpisode1(){
    var ep=1; var E = state.episodes[ep] = { status:{}, events1:[], daily:{}, events2:[] };
    E.status = { blue: state.alive.blue.slice(), red:  state.alive.red.slice(), captains: JSON.parse(JSON.stringify(state.captains)) };
    E.events1 = genHouseEvents(["blue","red"]);
    var daily = dailyDataForEpisode(1);

var dailyKeys1 = Object.keys(daily.skillWeights || {});
var dailyIds1 = state.alive.blue.concat(state.alive.red).slice();
var dailyDeltas1 = buildSkillDeltaMap(dailyIds1, dailyKeys1, { maxAbs: 1 });
setActiveSkillDeltas(dailyDeltas1);

    ["blue","red"].forEach(function(teamKey){
      var men = aliveByGender(teamKey, "male");
      var women = aliveByGender(teamKey, "female");
      var bestM = men.slice().sort(function(a,b){ return scorePlayer(daily.skillWeights,b) - scorePlayer(daily.skillWeights,a); })[0] || null;
      var bestF = women.slice().sort(function(a,b){ return scorePlayer(daily.skillWeights,b) - scorePlayer(daily.skillWeights,a); })[0] || null;
      state.captains[teamKey].male = bestM; state.captains[teamKey].female = bestF;
      addCaptainEpisodeCount(bestM); addCaptainEpisodeCount(bestF);
    });
    E.daily = { name: daily.name || "Captain Challenge", description: (daily.description||""), captains: JSON.parse(JSON.stringify(state.captains)) };
    E.events2 = genHouseEvents(["blue","red"]); state.ui[ep] = {};
  }

  function simulateMidEpisode(ep){
    var E = state.episodes[ep] = { status:{}, events1:[], daily:{}, events2:[], voting:{}, elimination:{} };
    E.status = { blue: state.alive.blue.slice(), red:  state.alive.red.slice(), captains: JSON.parse(JSON.stringify(state.captains)) };
    E.events1 = genHouseEvents(["blue","red"]);

    var daily = dailyDataForEpisode(ep);

var dailyKeys = Object.keys(daily.skillWeights || {});
var dailyIds = state.alive.blue.concat(state.alive.red).slice();
var dailyDeltas = buildSkillDeltaMap(dailyIds, dailyKeys, { maxAbs: 1 });
setActiveSkillDeltas(dailyDeltas);

    var blueAvg = averageTeamScore(daily.skillWeights, "blue");
    var redAvg  = averageTeamScore(daily.skillWeights, "red");

setActiveSkillDeltas(null);
E.dailySkillDeltas = dailyDeltas;

    var winnerTeam = (blueAvg===redAvg) ? (Math.random()<0.5 ? "blue" : "red") : (blueAvg>redAvg ? "blue" : "red");
    state.stats.teamDailyWins[winnerTeam]++;
    E.daily = { name: daily.name || "Daily Challenge", description: daily.description || "", winner: winnerTeam, blueAvg: blueAvg, redAvg: redAvg, comments: daily.comments||{}, skillWeights: daily.skillWeights||{} };
    E.events2 = genHouseEvents(["blue","red"]);

    var loseTeam = (winnerTeam==="blue" ? "red" : "blue");
    var g = episodeGender(ep);
    var voters = state.alive[loseTeam].slice();
    var eligible = aliveByGender(loseTeam, g).slice().filter(function(pid){ return pid !== state.captains[loseTeam][g]; });
    var votes = [];
    voters.forEach(function(from){
      var scored = eligible.map(function(pid){ return {pid:pid, r: rel(from, pid)}; });
      if(!scored.length) return;
      var minR = Math.min.apply(null, scored.map(function(x){return x.r;}));
      var tied = scored.filter(function(x){return x.r===minR;}).map(function(x){return x.pid;});
      var choice = tied.length ? sample(tied) : scored.sort(function(a,b){return a.r-b.r;})[0].pid;
      votes.push({from:from, to:choice});
    });
    var tally = {}; votes.forEach(function(v){ tally[v.to]=(tally[v.to]||0)+1; });
    var counts = Object.values(tally); var maxCount = counts.length ? Math.max.apply(null, counts) : 0;
    var top = Object.entries(tally).filter(function(en){ return en[1]===maxCount; }).map(function(en){ return en[0]; });
    var tieRandom = false;
    var houseNominee = (top.length>1) ? (function(){
      tieRandom = true;
      var cap = state.captains[loseTeam][g];
      if(!cap) return sample(top);
      var scoredT = top.map(function(pid){ return {pid:pid, r: rel(cap, pid)}; });
      var minRT = Math.min.apply(null, scoredT.map(function(x){return x.r;}));
      var tiedT = scoredT.filter(function(x){return x.r===minRT;}).map(function(x){return x.pid;});
      return sample(tiedT);
    })() : (top[0] || sample(eligible));

    var captainAtVote = state.captains[loseTeam][g];
    E.voting = { team:loseTeam, gender:g, votes:votes, houseNominee:houseNominee, captain: captainAtVote, tieRandom: tieRandom };

    var ed = elimDataForEpisode(ep);
    var A = houseNominee, B = captainAtVote;
    var sA = scorePlayer(ed.skillWeights, A), sB = scorePlayer(ed.skillWeights, B);
    var winnerId = (sA===sB) ? (Math.random()<0.5 ? A : B) : ((sA>sB) ? A : B);
    var loserId  = (winnerId===A) ? B : A;

    state.stats.elimPlays[A] = (state.stats.elimPlays[A]||0)+1;
    state.stats.elimPlays[B] = (state.stats.elimPlays[B]||0)+1;
    state.stats.elimWins[winnerId] = (state.stats.elimWins[winnerId]||0)+1;

    if(loserId === captainAtVote){ state.captains[loseTeam][g] = winnerId; }
    state.alive[loseTeam] = state.alive[loseTeam].filter(function(pid){ return pid !== loserId; });
    state.placements.eliminated.push({ playerId: loserId, episode: ep });

    addCaptainEpisodeCount(state.captains.blue.male); addCaptainEpisodeCount(state.captains.blue.female);
    addCaptainEpisodeCount(state.captains.red.male);  addCaptainEpisodeCount(state.captains.red.female);

    E.elimination = { name: ed.name || "The Gauntlet", description: ed.description || "", skillWeights: ed.skillWeights || {}, houseNominee: A, captain: B, winner: winnerId, loser: loserId, comments: ed.comments||{} };

    state.chart.episodes[String(ep)] = { dailyWinner: winnerTeam, votingTeam: loseTeam, gender: g, houseNominee: A, captain: B, elimWinner: winnerId, elimLoser: loserId };
    state.ui[ep] = { votingRevealIndex: 0, elimRevealed: false };
  }

  function simulateFinalsEp16(){
    var ep=16; var E = state.episodes[ep] = { status:{}, finals:{}, events1:[] };
    E.status = { blue: state.alive.blue.slice(), red:  state.alive.red.slice(), captains: JSON.parse(JSON.stringify(state.captains)) };
    E.events1 = genHouseEvents(["blue","red"]);
    var FD = window.FINAL_DATA || window.G2_FINAL_DATA || {};
    var stages = (FD.stages || []).slice(0,3);
    var used = new Set(); E.finals.stages = []; var stageWins = { blue:0, red:0 };

    function chooseStageTeams(){
      var remainingBlue = state.alive.blue.filter(function(id){ return !used.has(id); });
      var remainingRed  = state.alive.red.filter(function(id){ return !used.has(id); });
      var min = 1;
      var maxB = Math.max(min, Math.ceil(remainingBlue.length/3));
      var maxR = Math.max(min, Math.ceil(remainingRed.length/3));
      var takeB = Math.max(min, Math.min(remainingBlue.length, Math.ceil(Math.random()*maxB)));
      var takeR = Math.max(min, Math.min(remainingRed.length,  Math.ceil(Math.random()*maxR)));
      var chosenB = shuffle(remainingBlue).slice(0,takeB);
      var chosenR = shuffle(remainingRed).slice(0,takeR);
      chosenB.forEach(function(id){ used.add(id); }); chosenR.forEach(function(id){ used.add(id); });
      return { blue: chosenB, red: chosenR };
    }

    for(var i=0;i<stages.length;i++){
      var st = stages[i]; var chosen = chooseStageTeams();
      var bAvg = averageTeamScore(st.skillWeights||{}, "blue", chosen.blue);
      var rAvg = averageTeamScore(st.skillWeights||{}, "red",  chosen.red);
      var win = (bAvg===rAvg) ? (Math.random()<0.5 ? "blue" : "red") : (bAvg>rAvg ? "blue" : "red");
      stageWins[win]++;
      E.finals.stages.push({ stage:(i+1), name: st.name || ("Final Stage "+(i+1)), description: st.description || "", skillWeights: st.skillWeights || {}, chosen: chosen, averages: { blue:bAvg, red:rAvg }, winner: win, comments: st.comments||{} });
    }

    var winnersTeam = (stageWins.blue===stageWins.red) ? (Math.random()<0.5 ? "blue" : "red") : (stageWins.blue>stageWins.red ? "blue" : "red");
    var secondTeam = (winnersTeam==="blue" ? "red" : "blue");
    state.placements.winnersTeam = winnersTeam; state.placements.secondTeam = secondTeam;
    E.finals.results = { winnersTeam:winnersTeam, secondTeam:secondTeam, stageWins:stageWins };
    state.chart.episodes[String(ep)] = { finalTeamWinner: winnersTeam, stageWins: stageWins };
    state.ui[ep] = { finalResultsRevealIndex: 0 };
  }

  function statusCard(pid, showCaptainBadge){
    var team = teamOf(pid);
    var card = document.createElement("div");
    card.className = "status-card";
    card.style.border = "2px solid " + (team==="blue"?BLUE:RED);
    card.innerHTML = '<img class="avatar" src="'+picOf(pid)+'" alt=""><div class="name">'+nameOf(pid)+'</div>';
    if (showCaptainBadge === true){
      var badge = document.createElement("div"); badge.className="badge muted"; badge.textContent = "Captain";
      card.appendChild(badge);
    }
    return card;
  }
  function renderTeamRosterBox(teamKey, title){
    var wrap = document.createElement("div"); wrap.className="status-section "+(teamKey==="blue"?"header-blue":"header-red");
    var h = document.createElement("div"); h.className="status-title"; h.textContent = title;
    var row = document.createElement("div"); row.className="status-grid";
    (state.alive[teamKey]||[]).forEach(function(pid){ row.appendChild(statusCard(pid, false)); });
    wrap.appendChild(h); wrap.appendChild(row); epContent.appendChild(wrap);
  }
  function renderTeamRosterBoxFromStatus(teamKey, title, statusObj){
    var wrap = document.createElement("div"); wrap.className="status-section "+(teamKey==="blue"?"header-blue":"header-red");
    var h = document.createElement("div"); h.className="status-title"; h.textContent = title;
    var row = document.createElement("div"); row.className="status-grid";
    var list = (statusObj && statusObj[teamKey]) ? statusObj[teamKey] : [];
    (list||[]).forEach(function(pid){ row.appendChild(statusCard(pid, false)); });
    wrap.appendChild(h); wrap.appendChild(row); epContent.appendChild(wrap);
  }
  function renderSpecificRosterBox(teamKey, title, listIds){
    var wrap = document.createElement("div"); wrap.className="status-section "+(teamKey==="blue"?"header-blue":"header-red");
    var h = document.createElement("div"); h.className="status-title"; h.textContent = title;
    var row = document.createElement("div"); row.className="status-grid";
    (listIds||[]).forEach(function(pid){ row.appendChild(statusCard(pid, false)); });
    wrap.appendChild(h); wrap.appendChild(row); epContent.appendChild(wrap);
  }

  function renderHighlights(ep, comments, weights, candidateList){
    var wrap = document.createElement("div"); wrap.className="events-grid";
    var poolAll = (candidateList && candidateList.length ? candidateList.slice() : (state.alive.blue.concat(state.alive.red))).filter(Boolean);
    var bluePool = poolAll.filter(function(pid){ return teamOf(pid)==="blue"; });
    var redPool  = poolAll.filter(function(pid){ return teamOf(pid)==="red"; });
    function scoreList(list){ return list.filter(Boolean).map(function(pid){ return { pid: pid, score: scorePlayer(weights||{}, pid) }; }).sort(function(a,b){ return b.score - a.score; }); }
    var scoredBlue = scoreList(bluePool);
    var scoredRed  = scoreList(redPool);
    var totalPool = scoredBlue.length + scoredRed.length;
    if(totalPool === 0){ epContent.appendChild(wrap); return; }
    var desired = 5 + rnd(4);
    var take = Math.min(desired, totalPool);
    var pickBlue = Math.min(Math.ceil(take/2), scoredBlue.length);
    var pickRed  = Math.min(take - pickBlue, scoredRed.length);
    while((pickBlue + pickRed) < take){
      if(scoredBlue.length - pickBlue > scoredRed.length - pickRed){ pickBlue++; }
      else { pickRed++; }
      if(pickBlue > scoredBlue.length) pickBlue = scoredBlue.length;
      if(pickRed  > scoredRed.length)  pickRed  = scoredRed.length;
      if((pickBlue + pickRed) >= totalPool) break;
    }
    var picks = scoredBlue.slice(0,pickBlue).concat(scoredRed.slice(0,pickRed));
    var pos = (comments && comments.positive) || [], neu = (comments && comments.neutral)  || [], neg = (comments && comments.negative) || [];
    picks = picks.filter(function(p){ return p && p.pid; });
    picks.forEach(function(p, idx){
      var bucket; if(idx < Math.ceil(picks.length/3)) bucket = pos; else if(idx < Math.ceil(2*picks.length/3)) bucket = neu; else bucket = neg;
      var template = (bucket && bucket.length) ? sample(bucket) : "{A} competes.";
      var text = template.split("{A}").join(nameOf(p.pid));
      var card = document.createElement("div"); card.className="mini-card";
      var team = teamOf(p.pid);
      card.style.border = "2px solid " + (team==="blue" ? BLUE : RED);
      card.innerHTML = '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(p.pid)+'" alt=""></div><div>'+ text +'</div>';
      wrap.appendChild(card);
    });
    epContent.appendChild(wrap);
  }

  function renderDailyResultsBox(winnerTeam){
    var title = (winnerTeam==="blue"?"Blue Team (Rookies) — Winners":"Red Team (Veterans) — Winners");
    renderTeamRosterBox(winnerTeam, title);
  }

  function showStatisticsPanel(kind){
    viewCast.hidden = true; viewEpisode.hidden = false; epActions.innerHTML = "";
    if(kind==="placements"){
      epTitle.textContent = "Placements"; epSub.textContent = "Season Results";
      var wrap = document.createElement("div"); wrap.className="stats-wrap";
      var winnersTeam = state.placements.winnersTeam, secondTeam = state.placements.secondTeam;
      if(winnersTeam){
        var headW = document.createElement("div"); headW.className="status-title"; headW.textContent = "Winners — " + (winnersTeam==="blue"?"Blue Team (Rookies)":"Red Team (Veterans)");
        var rowW = document.createElement("div"); rowW.className="placements-row";
        (state.alive[winnersTeam]||[]).forEach(function(pid){
          var card = statusCard(pid, false); card.classList.add("border-gold"); rowW.appendChild(card);
        });
        wrap.appendChild(headW); wrap.appendChild(rowW);
      }
      if(secondTeam){
        var headS = document.createElement("div"); headS.className="status-title"; headS.textContent = "Second Place — " + (secondTeam==="blue"?"Blue Team (Rookies)":"Red Team (Veterans)");
        var rowS = document.createElement("div"); rowS.className="placements-row";
        (state.alive[secondTeam]||[]).forEach(function(pid){
          var card2 = statusCard(pid, false); card2.classList.add("border-silver"); rowS.appendChild(card2);
        });
        wrap.appendChild(headS); wrap.appendChild(rowS);
      }
      var headE = document.createElement("div"); headE.className="status-title"; headE.textContent = "Eliminated";
      var rowE = document.createElement("div"); rowE.className="placements-row";
      state.placements.eliminated.slice().reverse().forEach(function(e){
        var cardE = statusCard(e.playerId, false);
        var lab = document.createElement("div"); lab.className="badge muted"; lab.textContent = "Episode "+e.episode+" — Eliminated";
        cardE.appendChild(lab);
        rowE.appendChild(cardE);
      });
      wrap.appendChild(headE); wrap.appendChild(rowE);
      epContent.innerHTML = ""; epContent.appendChild(wrap);
      var btn = document.createElement("button"); btn.className="btn proceed"; btn.textContent="Proceed";
      btn.onclick = function(){ showStatisticsPanel("other"); btn.remove(); };
      epActions.appendChild(btn);
      return;
    }
    if(kind==="other"){
      epTitle.textContent = "Other Statistics"; epSub.textContent = "Leaders and tallies";
      var tbl = document.createElement("table"); tbl.className="stats-table"; var tbody = document.createElement("tbody");
      function row(label, value){ var tr=document.createElement("tr"); tr.innerHTML = "<th>"+label+"</th><td>"+value+"</td>"; tbody.appendChild(tr); }
      var mdw = (state.stats.teamDailyWins.blue>state.stats.teamDailyWins.red) ? "Blue Team (Rookies)" : (state.stats.teamDailyWins.red>state.stats.teamDailyWins.blue) ? "Red Team (Veterans)" : "Tie";
      row("Most Daily Wins (Team)", mdw + " — Blue: "+state.stats.teamDailyWins.blue+", Red: "+state.stats.teamDailyWins.red);
      var maxEW = 0, maxEWPlayer = null; Object.keys(state.stats.elimWins).forEach(function(pid){ if(state.stats.elimWins[pid] > maxEW){ maxEW = state.stats.elimWins[pid]; maxEWPlayer = pid; } });
      row("Most Elimination Wins (Player)", maxEWPlayer ? (nameOf(maxEWPlayer)+" — "+maxEW) : "—");
      var maxCE = 0, maxCEPlayer = null; Object.keys(state.stats.captainEpisodes).forEach(function(pid){ if(state.stats.captainEpisodes[pid] > maxCE){ maxCE = state.stats.captainEpisodes[pid]; maxCEPlayer = pid; } });
      row("Most Episodes as Captain (Player)", maxCEPlayer ? (nameOf(maxCEPlayer)+" — "+maxCE) : "—");
      tbl.appendChild(tbody); epContent.innerHTML = ""; epContent.appendChild(tbl);
      var btn = document.createElement("button"); btn.className="btn proceed"; btn.textContent="Proceed";
      btn.onclick = function(){ showStatisticsPanel("chart"); btn.remove(); };
      epActions.appendChild(btn);
      return;
    }
    if(kind==="chart"){
      epTitle.textContent = "Season Chart"; epSub.textContent = "";
      epContent.innerHTML = "";
      var btn = document.createElement("button"); btn.className="btn"; btn.textContent = "Open Season Chart";
      btn.onclick = function(){ location.href = "./season_chart.html"; };
      epContent.appendChild(btn);
      return;
    }
  }

  function showEpisodeSection(ep, section){
    state.lastView = { ep:ep, section:section }; State.save(state);
    epActions.innerHTML = ""; var s = state.episodes[ep]; epTitle.textContent = "Episode " + ep; epSub.textContent = "";
    if(!s){ epContent.innerHTML = '<p class="muted">No data.</p>'; addProceed(ep, section); return; }

    if(section==="status"){
      epSub.textContent = "Remaining players";
      var wrap = document.createElement("div"); wrap.className="status-teams";
      ["blue","red"].forEach(function(teamKey){
        var sec = document.createElement("div"); sec.className="status-section "+(teamKey==="blue"?"header-blue":"header-red");
        var title = document.createElement("div"); title.className="status-title"; title.textContent = (teamKey==="blue"?"Blue Team (Rookies) — ":"Red Team (Veterans) — ") + (s.status[teamKey]||[]).length + " players";
        var row = document.createElement("div"); row.className="status-grid";
        var caps = (s.status.captains && s.status.captains[teamKey]) ? s.status.captains[teamKey] : (state.captains[teamKey] || {});
        (s.status[teamKey]||[]).forEach(function(pid){
          var isCap = (pid===caps.male || pid===caps.female);
          var card = statusCard(pid, isCap);
          row.appendChild(card);
        });
        sec.appendChild(title); sec.appendChild(row); wrap.appendChild(sec);
      });
      epContent.innerHTML = ""; epContent.appendChild(wrap); addProceed(ep, section); return;
    }

    if(section==="format" && ep===1){
      var box = document.createElement("div"); box.className="mini-card note";
      box.innerHTML = '<div class="challenge-name">Captain Challenge Format</div><div>For this season, a male and female captain were determined at the beginning of the season. After each team challenge, the losing team captain was sent to the "Gauntlet", where they would face an opponent of the same sex and same team who was voted into the Gauntlet by the respective team. Contestants competed for over $300,000 in rewards.</div>';
      epContent.innerHTML = ""; epContent.appendChild(box); addProceed(ep, section); return;
    }

    if(section==="events1" || section==="events2"){
      var key = (section==="events1") ? "events1" : "events2";
      epSub.textContent = (section==="events1" ? "House Events 1" : "House Events 2");
      var grid2 = document.createElement("div"); grid2.className="events-grid";
      (s[key]||[]).forEach(function(ev){
        var card2 = document.createElement("div"); card2.className="mini-card";
        var avatars = document.createElement("div"); avatars.className="row tiny-avatars";
        (ev.players||[]).forEach(function(pid){
          var img = document.createElement("img"); img.className = "avatar xs"; img.src = picOf(pid); img.alt = ""; avatars.appendChild(img);
        });
        card2.style.borderColor = "var(--glass-border)";
        card2.innerHTML = avatars.outerHTML + '<div>'+ev.text+'</div>';
        grid2.appendChild(card2);
      });
      epContent.innerHTML = ""; epContent.appendChild(grid2); addProceed(ep, section); return;
    }

    if(section==="daily"){
      var d = s.daily || {}; var dd = dailyDataForEpisode(ep);
      var name = d.name || (ep===1 ? "Captain Challenge" : "Daily Challenge");
      var title = document.createElement("div"); title.className="challenge-name"; title.textContent = name;
      var desc = document.createElement("div"); desc.className = "mini-card note";
      desc.innerHTML = '<div><strong>Description:</strong> '+(d.description||"")+'</div>';
      epContent.innerHTML = ""; epContent.appendChild(title); epContent.appendChild(desc);

      var btnHighlights = document.createElement("button"); btnHighlights.className="btn"; btnHighlights.textContent="Show Highlights";
      btnHighlights.onclick = function(){ renderHighlights(ep, dd.comments||{}, dd.skillWeights||{}); btnHighlights.remove(); };
      epActions.appendChild(btnHighlights);

      if(ep===1){
        var btnCap = document.createElement("button"); btnCap.className="btn"; btnCap.textContent="Reveal Results (Captains)";
        btnCap.onclick = function(){
          ["blue","red"].forEach(function(teamKey){
            var caps = (d.captains && d.captains[teamKey]) ? d.captains[teamKey] : state.captains[teamKey];
            var sec = document.createElement("div"); sec.className="status-section "+(teamKey==="blue"?"header-blue":"header-red");
            var h = document.createElement("div"); h.className="status-title"; h.textContent = (teamKey==="blue"?"Blue Team (Rookies) — Captains":"Red Team (Veterans) — Captains");
            var row = document.createElement("div"); row.className="status-grid";
            [caps.male, caps.female].forEach(function(pid){
              if(!pid) return;
              var card = statusCard(pid, true);
              row.appendChild(card);
            });
            sec.appendChild(h); sec.appendChild(row); epContent.appendChild(sec);
          });
          btnCap.remove();
        };
        epActions.appendChild(btnCap);
      }
      if(ep>=2 && ep<=15){
        var btnResults = document.createElement("button"); btnResults.className="btn"; btnResults.textContent="Show Results";
        btnResults.onclick = function(){
          var statusRoster = (s && s.status) ? s.status : null;
          var titleText = (d.winner==="blue"?"Blue Team (Rookies) — Winners":"Red Team (Veterans) — Winners");
          renderTeamRosterBoxFromStatus(d.winner, titleText, statusRoster);
          btnResults.remove();
        };
        epActions.appendChild(btnResults);
      }
      addProceed(ep, section); return;
    }

    if(section==="voting" && ep>=2 && ep<=15){
      var v = s.voting || {}; var loseTeamLabel = (v.team==="blue" ? "Blue (Rookies)" : "Red (Veterans)");
      epSub.textContent = "The losing team votes for a "+v.gender+" to face their captain. Team: "+loseTeamLabel;
      var wrap = document.createElement("div"); wrap.className="events-grid";
      var votes = (v.votes||[]).slice(); var ui = state.ui[ep] || (state.ui[ep]={}); if(typeof ui.votingRevealIndex!=="number") ui.votingRevealIndex = 0;
      function renderVoteCards(){
        wrap.innerHTML = "";
        for(var i=0;i<Math.min(ui.votingRevealIndex, votes.length); i++){
          var row = votes[i]; var from = row.from, to = row.to;
          var card = document.createElement("div"); card.className="vote-card"; var fromTeam = teamOf(from);
          card.style.borderColor = (fromTeam==="blue"?BLUE:RED);
          card.innerHTML =
            '<div class="team-strip"><img class="avatar xs" src="'+picOf(from)+'" alt=""><div>'+ nameOf(from) + '</div></div>'+
            '<div class="arrow">→</div>'+
            '<div class="team-strip"><img class="avatar xs" src="'+picOf(to)+'" alt=""><div>'+ nameOf(to) +'</div></div>';
          wrap.appendChild(card);
        }
      }
      renderVoteCards();
      var matchupHolder = document.createElement("div"); matchupHolder.style.display="flex"; matchupHolder.style.justifyContent="center"; matchupHolder.style.width="100%";
      function renderMatchup(){
        if(ui.votingRevealIndex < votes.length) return;
        var a = v.houseNominee, b = v.captain;
        var teamColor = (v.team==="blue"?BLUE:RED);
        var strip = document.createElement("div"); strip.className="matchup";
        strip.innerHTML =
          '<div class="team-strip" style="border:2px solid '+teamColor+'; border-radius:10px; padding:8px;">'+
            '<img class="avatar xs" src="'+picOf(a)+'" alt=""><div>'+ nameOf(a) +'</div>'+
          '</div><div class="arrow">vs</div>'+
          '<div class="team-strip" style="border:2px solid '+teamColor+'; border-radius:10px; padding:8px;">'+
            '<img class="avatar xs" src="'+picOf(b)+'" alt=""><div>'+ nameOf(b) + ' (Captain)</div>'+
          '</div>' +
          (v.tieRandom ? '<div class="muted" style="grid-column:1/-1; text-align:center; margin-top:6px;">There was a tie in the votes so the nominated player was chosen at random.</div>' : '');
        matchupHolder.innerHTML = ""; matchupHolder.appendChild(strip);
      }
      renderMatchup();
      epContent.innerHTML = ""; epContent.appendChild(wrap); epContent.appendChild(matchupHolder);

      var btnRevealVote = document.createElement("button"); btnRevealVote.className="btn"; btnRevealVote.textContent="Reveal Vote";
      btnRevealVote.onclick = function(){ if(ui.votingRevealIndex < votes.length){ ui.votingRevealIndex++; State.save(state); renderVoteCards(); if(ui.votingRevealIndex >= votes.length){ renderMatchup(); } if(ui.votingRevealIndex>=votes.length){ btnRevealVote.remove(); } } };
      epActions.appendChild(btnRevealVote);

      var btnAllVotes = document.createElement("button"); btnAllVotes.className="btn"; btnAllVotes.textContent="Reveal All Votes";
      btnAllVotes.onclick = function(){ ui.votingRevealIndex = votes.length; State.save(state); renderVoteCards(); renderMatchup(); btnAllVotes.remove(); if(btnRevealVote && btnRevealVote.parentNode){ btnRevealVote.remove(); } };
      epActions.appendChild(btnAllVotes);

      addProceed(ep, section); return;
    }

    if(section==="elimination" && ep>=2 && ep<=15){
      var el = s.elimination || {}; var name = el.name || "The Gauntlet";
      var title = document.createElement("div"); title.className="challenge-name"; title.textContent = name;
      var desc = document.createElement("div"); desc.className = "mini-card note"; desc.innerHTML = '<div><strong>Description:</strong> '+(el.description||"")+'</div>';
      epContent.innerHTML = ""; epContent.appendChild(title); epContent.appendChild(desc);

      var btnHighlightsE = document.createElement("button"); btnHighlightsE.className="btn"; btnHighlightsE.textContent="Show Highlights";
      btnHighlightsE.onclick = function(){ renderHighlights(ep, (el.comments||{}), (el.skillWeights||{}), [el.houseNominee, el.captain].filter(Boolean)); btnHighlightsE.remove(); };
      epActions.appendChild(btnHighlightsE);

      var strip = document.createElement("div"); strip.className="matchup";
      strip.innerHTML =
        '<div id="elim-a" class="team-strip" style="border:2px solid '+(teamOf(el.houseNominee)==="blue"?BLUE:RED)+'; border-radius:10px; padding:8px;">'+
          '<img class="avatar xs" src="'+picOf(el.houseNominee)+'" alt=""><div>'+ nameOf(el.houseNominee) +'</div></div>'+
        '<div class="arrow">vs</div>'+
        '<div id="elim-b" class="team-strip" style="border:2px solid '+(teamOf(el.captain)==="blue"?BLUE:RED)+'; border-radius:10px; padding:8px;">'+
          '<img class="avatar xs" src="'+picOf(el.captain)+'" alt=""><div>'+ nameOf(el.captain) + ' (Captain)</div></div>';
      epContent.appendChild(strip);

      var ui = state.ui[ep] || (state.ui[ep]={}); if(typeof ui.elimRevealed!=="boolean") ui.elimRevealed=false;
      function applyElimReveal(){
        var A = document.getElementById("elim-a"), B = document.getElementById("elim-b");
        if(!A || !B) return;
        A.classList.remove("border-red"); B.classList.remove("border-red");
        if(ui.elimRevealed){
          var win = el.winner;
          if(win===el.houseNominee){ A.style.boxShadow="0 0 0 2px rgba(88,214,141,.9) inset"; A.style.borderColor="#58d68d"; B.classList.add("border-red"); }
          else { B.style.boxShadow="0 0 0 2px rgba(88,214,141,.9) inset"; B.style.borderColor="#58d68d"; A.classList.add("border-red"); }
        } else {
          A.style.boxShadow=""; B.style.boxShadow="";
          A.style.borderColor=(teamOf(el.houseNominee)==="blue"?BLUE:RED);
          B.style.borderColor=(teamOf(el.captain)==="blue"?BLUE:RED);
        }
      }
      applyElimReveal();

      if(!ui.elimRevealed){
        var btnReveal = document.createElement("button"); btnReveal.className="btn"; btnReveal.textContent="Reveal Results";
        btnReveal.onclick = function(){ ui.elimRevealed = true; State.save(state); applyElimReveal(); btnReveal.remove(); };
        epActions.appendChild(btnReveal);
      }

      addProceed(ep, section); return;
    }

    if(section==="final_rules" && ep===16){
      var box = document.createElement("div"); box.className="mini-card note";
      box.innerHTML = '<div class="challenge-name">Final Rules</div><div>Three stages. Each player can appear in exactly one stage. Each stage must include at least one player from each team. Team with most stage wins is crowned champions.</div>';
      epContent.innerHTML = ""; epContent.appendChild(box); addProceed(ep, section); return;
    }

    if(/^final[1-3]$/.test(section) && ep===16){
      var idx = parseInt(section.replace("final",""),10);
      var stObj = (s.finals && s.finals.stages) ? s.finals.stages[idx-1] : null;
      var name = stObj ? stObj.name : ("Final Stage " + idx);
      var title = document.createElement("div"); title.className="challenge-name"; title.textContent = name;
      var desc = document.createElement("div"); desc.className = "mini-card note";
      desc.innerHTML = '<div><strong>Description:</strong> '+(stObj && stObj.description || "")+'</div>';
      epContent.innerHTML = ""; epContent.appendChild(title); epContent.appendChild(desc);

      if (stObj){
        renderSpecificRosterBox("blue", "Chosen Players — Blue Team (Rookies)", stObj.chosen.blue||[]);
        renderSpecificRosterBox("red",  "Chosen Players — Red Team (Veterans)", stObj.chosen.red||[]);
      }

      var btnHighlightsF = document.createElement("button"); btnHighlightsF.className="btn"; btnHighlightsF.textContent="Show Highlights";
      btnHighlightsF.onclick = function(){ if(stObj){ renderHighlights(ep, (stObj.comments||{}), (stObj.skillWeights||{}), (stObj.chosen.blue||[]).concat(stObj.chosen.red||[])); btnHighlightsF.remove(); } };
      epActions.appendChild(btnHighlightsF);

      var btnResultsF = document.createElement("button"); btnResultsF.className="btn"; btnResultsF.textContent="Show Results";
      btnResultsF.onclick = function(){
        var stageWinner = stObj.winner;
        var list = (stageWinner==="blue" ? (stObj.chosen.blue||[]) : (stObj.chosen.red||[]));
        var head = (stageWinner==="blue"?"Blue Team (Rookies) — Stage Winners":"Red Team (Veterans) — Stage Winners");
        renderSpecificRosterBox(stageWinner, head, list);
        btnResultsF.remove();
      };
      epActions.appendChild(btnResultsF);
      addProceed(ep, section); return;
    }

    if(section==="final_results" && ep===16){
      var res = (s.finals && s.finals.results) ? s.finals.results : {}; epSub.textContent = "";
      epContent.innerHTML = "";
      renderTeamRosterBox(res.winnersTeam, "Winners — "+(res.winnersTeam==="blue"?"Blue Team (Rookies)":"Red Team (Veterans)"));
      renderTeamRosterBox(res.secondTeam, "Second Place — "+(res.secondTeam==="blue"?"Blue Team (Rookies)":"Red Team (Veterans)"));
      addProceed(ep, section); return;
    }

    epContent.innerHTML = '<p class="muted">Nothing to display.</p>'; addProceed(ep, section); return;
  }

  (function init(){
    document.getElementById("goto-placements").onclick = function(){ showStatisticsPanel("placements"); };
    document.getElementById("goto-stats").onclick = function(){ showStatisticsPanel("other"); };
    document.getElementById("goto-chart").onclick = function(){ showStatisticsPanel("chart"); };
    var roster = window.PLAYERS || [];
    if (!Array.isArray(roster) || roster.length===0){
      document.getElementById("data-warning").style.display = "block";
    } else {
      buildFilterShows(roster);
      buildTeamsGrid(roster);
    }
    var last = state.lastView;
    if(state.simulated && last && state.episodes[last.ep]){
      viewCast.hidden = true; viewEpisode.hidden = false; buildLeftAccordion(); showEpisodeSection(last.ep, last.section);
    } else {
      viewCast.hidden = false; viewEpisode.hidden = true;
    }
    elInfoSeed.textContent = state.seed;
  })();

