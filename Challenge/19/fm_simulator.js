  var rnd = function(n){ return Math.floor(Math.random() * n); };
  var sample = function(arr){ return arr.length ? arr[rnd(arr.length)] : undefined; };
  var shuffle = function(arr){ return arr.map(function(v){return [Math.random(),v];}).sort(function(a,b){return a[0]-b[0];}).map(function(x){return x[1];}); };
  var clamp = function(n,min,max){ return Math.max(min, Math.min(max,n)); };
  var ordinal = function(n){ var s=["th","st","nd","rd"], v=n%100; return n + (s[(v-20)%10]||s[v]||s[0]); };
  var IMG_BLANK = "BlankProfile.webp";
  var TEAM_COLORS = ["#82cfff","#ffb86b","#ff6e6e","#7af27a","#c792ea","#ffd86e","#6ee7ff","#ffa0c8","#9dd79d","#f4a261","#5eead4","#b39ddb","#f59e0b"];

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


  var KEY="challenge-fresh-meat-season";
  var State={
    load:function(){ try{ return JSON.parse(sessionStorage.getItem(KEY)) || null; }catch(e){ return null; } },
    save:function(s){ sessionStorage.setItem(KEY, JSON.stringify(s)); },
    clear:function(){ sessionStorage.removeItem(KEY); }
  };

  var state = State.load() || {
    seed: Math.random().toString(36).slice(2,8).toUpperCase(),
    cast: Array.from({length:26}).map(function(){ return null; }),
    teams: [],
    relationships: {},
    profiles: {},
    episodes: {},
    ui: {},
    stats: { dailyWins:{}, elimWins:{}, elimPlays:{} },
    placements: { first:null, second:null, third:null, fourth:null, eliminated:[] },
    chart: { finalized:false, episodes:{} },
    simulated: false,
    lastView: null
  };

  var elTeams = document.getElementById("teams-grid");
  var elFilterShow = document.getElementById("filter-show");
  var elDataWarn = document.getElementById("data-warning");
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
  var timesPanel = document.getElementById("times-panel");
  var timesClose = document.getElementById("times-close");
  var timesTable = document.getElementById("times-table");
  timesClose.onclick = function(){ timesPanel.close(); };

  document.getElementById("btn-back-cast").addEventListener("click", function(e){
    e.preventDefault();

    var prevCast = (state.cast || []).slice();
    var prevProfiles = state.profiles || {};
    var prevRelationships = state.relationships || {};

    state = {
      seed: Math.random().toString(36).slice(2,8).toUpperCase(),
      cast: prevCast,
      teams: [],
      relationships: prevRelationships,
      profiles: prevProfiles,
      episodes: {},
      ui: {},
      stats: { dailyWins:{}, elimWins:{}, elimPlays:{} },
      placements: { first:null, second:null, third:null, fourth:null, eliminated:[] },
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
    buildTeamsGrid(window.PLAYERS || []);
  });

  document.getElementById("btn-reset-session").addEventListener("click", function(e){
    e.preventDefault();
    state = {
      seed: Math.random().toString(36).slice(2,8).toUpperCase(),
      cast: Array.from({length:26}).map(function(){ return null; }),
      teams: [],
      relationships: {},
      profiles: {},
      episodes: {},
      ui: {},
      stats: { dailyWins:{}, elimWins:{}, elimPlays:{} },
      placements: { first:null, second:null, third:null, fourth:null, eliminated:[] },
      chart: { finalized:false, episodes:{} },
      simulated: false,
      lastView: null
    };
    try { sessionStorage.removeItem(KEY); } catch(e){}
    elAccordion.innerHTML = "";
    viewEpisode.hidden = true;
    viewCast.hidden = false;
    elInfoStatus.textContent = "Not simulated";
    elInfoCast.textContent = "0";
    statsPanel.style.display = "none";
    buildTeamsGrid(window.PLAYERS || []);
  });

  (function init(){
    var src = window.PLAYERS || [];
    if (!Array.isArray(src) || src.length === 0) { elDataWarn.style.display = "block"; return; }
    elDataWarn.style.display = "none";
    buildFilterShows(src);
    buildTeamsGrid(src);
    elInfoSeed.textContent = state.seed;
    if(state.simulated){
      buildLeftAccordion();
      viewCast.hidden = true;
      viewEpisode.hidden = false;
      var last = state.lastView || { ep:1, section:"status" };
      showEpisodeSection(last.ep, last.section);
      elInfoStatus.textContent = "Simulated";
      elInfoCast.textContent = (state.teams||[]).filter(function(t){return t.alive!==false;}).length;
      statsPanel.style.display = "block";
    }
    document.getElementById("goto-placements").onclick = function(){ showStatisticsPanel("placements"); };
    document.getElementById("goto-stats").onclick = function(){ showStatisticsPanel("other"); };
    document.getElementById("goto-chart").onclick = function(){ showStatisticsPanel("chart"); };
  })();

function buildFilterShows(roster){
  var showMap = {};
  (roster || []).forEach(function(p){
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
  elFilterShow.onchange = function(){ buildTeamsGrid(roster); };
}

  function asCastEntry(p){
    return {
      id:p.id,
      name:p.name || p.nickname || p.id,
      nickname:p.nickname || p.name || p.id,
      image:p.image || (p.id ? ("../../contestant_pictures/" + p.id + ".webp") : IMG_BLANK),
      gender:p.gender || "unknown",
      show:p.show || ""
    };
  }

function playerOptions(roster, selectedId){
  var showFilter = elFilterShow.value;
  var filtered = roster.filter(function(r){
    return !showFilter || playerHasShow(r, showFilter);
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

  function buildTeamsGrid(roster){
    elTeams.innerHTML = "";
    for (var t=0;t<13;t++){
      var slotA = state.cast[t*2] || null;
      var slotB = state.cast[t*2+1] || null;
      var color = TEAM_COLORS[t % TEAM_COLORS.length];

      var box = document.createElement("div");
      box.className = "team-box";
      box.style.borderColor = color;

      var head = document.createElement("div");
      head.className = "team-head";
      head.innerHTML = '<span class="label">Team '+(t+1)+'</span><span class="team-color-dot" style="background:'+color+'"></span>';
      box.appendChild(head);

      var inner = document.createElement("div");
      inner.className = "team-inner";

      var cardA = document.createElement("div");
      cardA.className = "pick-card";
      cardA.innerHTML =
        '<img class="avatar" src="'+(slotA? slotA.image : IMG_BLANK)+'" alt="">'+
        '<div class="name">'+(slotA? (slotA.nickname) : "Player A")+'</div>'+
        '<select class="pick-player" data-slot="'+(t*2)+'">'+ playerOptions(roster, slotA? slotA.id : "") +'</select>'+
        '<button class="btn btn-custom" data-slot="'+(t*2)+'" type="button">Custom Player</button>';

      var cardB = document.createElement("div");
      cardB.className = "pick-card";
      cardB.innerHTML =
        '<img class="avatar" src="'+(slotB? slotB.image : IMG_BLANK)+'" alt="">'+
        '<div class="name">'+(slotB? (slotB.nickname) : "Player B")+'</div>'+
        '<select class="pick-player" data-slot="'+(t*2+1)+'">'+ playerOptions(roster, slotB? slotB.id : "") +'</select>'+
        '<button class="btn btn-custom" data-slot="'+(t*2+1)+'" type="button">Custom Player</button>';

      inner.appendChild(cardA);
      inner.appendChild(cardB);
      box.appendChild(inner);
      elTeams.appendChild(box);
    }

    elTeams.querySelectorAll(".pick-player").forEach(function(sel){
      sel.onchange = function(e){
        var i = +e.target.dataset.slot;
        var id = e.target.value || "";
        if(!id){ state.cast[i]=null; State.save(state); return buildTeamsGrid(roster); }
        var p = (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id]) || roster.find(function(r){return r.id===id;});
        if(!p) return;
        state.cast[i] = asCastEntry(p);
        State.save(state);
        buildTeamsGrid(roster);
      };
    });
    elTeams.querySelectorAll(".btn-custom").forEach(function(btn){
      btn.onclick = function(){ openCustomModal(+btn.dataset.slot); };
    });

    elInfoCast.textContent = Math.floor(state.cast.filter(Boolean).length/2);
  }

  var modal = document.createElement("dialog");
  modal.className = "antm-modal";
  modal.innerHTML =
    '<form id="custom-form" method="dialog" autocomplete="off">'+
    '<h3>Add Custom Player</h3>'+
    '<label>Full Name <input name="name" id="cp-name" required autocomplete="name" /></label>'+
    '<label>Nickname <input name="nickname" id="cp-nickname" required autocomplete="nickname" /></label>'+
    '<label>Image URL <input name="image" id="cp-image" placeholder="https://..." autocomplete="off" /></label>'+
     '<menu>'+
      '<button type="button" class="btn" id="modal-cancel">Cancel</button>'+
      '<button type="submit" class="btn">Add</button>'+
     '</menu>'+
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
      var cp = { id:id, name:name, nickname:nickname, gender:"unknown", show:"Custom", image:image || IMG_BLANK };
      state.cast[slot] = asCastEntry(cp);
      State.save(state);
      modal.close();
      formCustom.reset();
      buildTeamsGrid(window.PLAYERS||[]);
    };
    cancelBtn.onclick = function(){ modal.close(); };
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
        return lowerSeasons.some(function(s){ return s.indexOf(token) !== -1; });
      });
      if (ok) return true;
    }
    return false;
  }

  function filterRosterByPrefs(prefs){
    var roster = (window.PLAYERS || []).slice();
    if (!prefs || !Object.keys(prefs).length) return roster;

    return roster.filter(function(p){
      return playerMatchesPrefsForRandomize(p, prefs);
    });
  }

  function randomizeCastWithPrefsAny(prefs){
    var roster = filterRosterByPrefs(prefs);
    if (roster.length < 26){
      alert("Not enough eligible players for 13 teams from the selected filters.");
      return;
    }
    var pool = shuffle(roster).slice(0, 26);
    state.cast = pool.map(asCastEntry);
    State.save(state);
    buildTeamsGrid(window.PLAYERS || []);
  }

  function randomizeCastWithPrefsSplit(prefs){
    var roster = filterRosterByPrefs(prefs);
    var males = shuffle(roster.filter(function(p){ return p.gender === "male"; }));
    var females = shuffle(roster.filter(function(p){ return p.gender === "female"; }));
    var needTeams = 13;
    if (males.length < needTeams || females.length < needTeams){
      alert("Not enough males/females for 13 mixed teams from the selected filters.");
      return;
    }
    state.cast = [];
    for (var i = 0; i < needTeams; i++){
      state.cast.push(asCastEntry(males[i]));
      state.cast.push(asCastEntry(females[i]));
    }
    State.save(state);
    buildTeamsGrid(window.PLAYERS || []);
  }

  function openRandomizeModal(mode){
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
      var checks = randModal.querySelectorAll('input[type="checkbox"][data-show]');
      checks.forEach(function(cb){
        if (!cb.checked) return;
        var show = cb.getAttribute("data-show");
        var input = randModal.querySelector('input.rand-seasons[data-show="'+show+'"]');
        var seasons = [];
        if (input && input.value.trim()){
          seasons = input.value
            .split(/[,;]/)
            .map(function(s){ return s.trim().toLowerCase(); })
            .filter(Boolean);
        }
        prefs[show] = { seasons: seasons };
      });

      randModal.close();
      if (mode === "split"){
        randomizeCastWithPrefsSplit(prefs);
      } else {
        randomizeCastWithPrefsAny(prefs);
      }
    };

    btnCancel.onclick = function(){
      randModal.close();
    };
  }

  document.getElementById("btn-randomize").addEventListener("click", function(){
    openRandomizeModal("any");
  });
  document.getElementById("btn-randomize-split").addEventListener("click", function(){
    openRandomizeModal("split");
  });
  document.getElementById("btn-reset-cast").addEventListener("click", function(){
    state.cast = Array.from({length:26}).map(function(){ return null; });
    state.teams = [];
    State.save(state);
    buildTeamsGrid(window.PLAYERS||[]);
  });
  document.getElementById("btn-profiles").addEventListener("click", function(){
    location.href = "./profiles.html";
  });
  document.getElementById("btn-relationships").addEventListener("click", function(){
    location.href = "./relationships.html";
  });

  var relKey = function(a,b){ return a<b ? (a+"|"+b) : (b+"|"+a); };
  function rel(a,b){ return state.relationships[relKey(a,b)] ?? 0; }
  function skillOf(playerId, key){
    var s = state.profiles[playerId] ? state.profiles[playerId][key] : 0;
    if (typeof s === "number") return clamp(s,-3,3);
    return 0;
  }
  function nameOfPlayer(id){
    var c = state.cast.find(function(x){ return x && x.id===id; });
    return c ? (c.nickname || c.name || id) : id;
  }
  function fullNameOfPlayer(id){
    var c = state.cast.find(function(x){ return x && x.id===id; });
    return c ? (c.name || c.nickname || id) : id;
  }
  function picOfPlayer(id){
    var c = state.cast.find(function(x){ return x && x.id===id; });
    return c ? (c.image || IMG_BLANK) : IMG_BLANK;
  }
  function teamById(teamId){ return state.teams.find(function(t){return t.id===teamId;}); }
  function teamName(team){ return nameOfPlayer(team.maleId) + " & " + nameOfPlayer(team.femaleId); }

  function buildTeamsFromCast(){
    var ids = state.cast.filter(Boolean).map(function(p){return p.id;});
    if(ids.length!==26) return null;
    var teams = [];
    for(var i=0;i<13;i++){
      var a = ids[i*2], b = ids[i*2+1];
      teams.push({ id:"T"+(i+1), maleId:a, femaleId:b, alive:true, color: TEAM_COLORS[i%TEAM_COLORS.length], stats:{dailyWins:0,elimWins:0,elimPlays:0}, finalTime:0 });
    }
    return teams;
  }

  function scorePlayer(weights, pid){
    var total=0, k;
    for(k in (weights||{})){
      if(Object.prototype.hasOwnProperty.call(weights, k)){
        var w = typeof weights[k]==="number" ? weights[k] : 1;
        total += (skillOf(pid, k) * w);
      }
    }
    return total;
  }
  function scoreTeam(weights, team){
    return scorePlayer(weights, team.maleId) + scorePlayer(weights, team.femaleId);
  }

  function combinedRelationship(teamA, teamB){
    var m = [ rel(teamA.maleId, teamB.maleId), rel(teamA.maleId, teamB.femaleId), rel(teamA.femaleId, teamB.maleId), rel(teamA.femaleId, teamB.femaleId) ].sort(function(a,b){return a-b;});
    return (m[1]+m[2])/2;
  }

  function renderNames(text, ids){
    var out = text;
    var labels = ["{A}","{B}","{C}"];
    ids.forEach(function(pid, i){ out = out.split(labels[i]).join(nameOfPlayer(pid)); });
    return out;
  }

  function genHouseEvents(teamIds){
    var aliveP = [];
    teamIds.forEach(function(tid){
      var t = teamById(tid);
      if(t){ aliveP.push(t.maleId, t.femaleId); }
    });
    var E = window.FM_EVENTS || {};
    var pick = function(a){ return a && a.length ? sample(a) : null; };
    var out = [];
    var count = 3 + rnd(3);
    for(var i=0;i<count;i++){
      var roll = Math.random();
      if(roll<0.25){
        var A = sample(aliveP);
        var ev1 = pick(E.solo_neutral);
        if(ev1) out.push({ type:"solo", players:[A], text: renderNames(ev1, [A]), sentiment:"neutral" });
      } else if(roll<0.75){
        var P1 = sample(aliveP), P2 = sample(aliveP.filter(function(x){return x!==P1;})) || P1;
        var bucket = E.two_neutral, sentiment="neutral";
        var r = rel(P1,P2);
        if(r>=5 && Math.random()<0.25){ bucket = E.two_positive; sentiment="positive"; }
        if(r<=-3 && Math.random()<0.25){ bucket = E.two_negative; sentiment="negative"; }
        var ev2 = pick(bucket);
        if(ev2) out.push({ type:"pair", players:[P1,P2], text: renderNames(ev2, [P1,P2]), sentiment:sentiment });
      } else {
        var A3 = sample(aliveP), B3 = sample(aliveP.filter(function(x){return x!==A3;})), C3 = sample(aliveP.filter(function(x){return x!==A3 && x!==B3;}));
        var ev3 = pick(E.team_neutral);
        if(ev3) out.push({ type:"team", players:[A3,B3,C3], text: renderNames(ev3, [A3,B3,C3]), sentiment:"neutral" });
      }
    }
    return out;
  }

  function buildLeftAccordion(){
    elAccordion.innerHTML = "";
    for(var e=1;e<=10;e++){
      var details = document.createElement("details");
      details.className = "details-ep";
      if(e===1) details.open = true;
      var inner = '<summary>Episode '+e+'</summary><div class="section-box"><div class="section-links">';
      if(e<10){
        inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events 1</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="daily">Daily Challenge</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="events2">House Events 2</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="voting">Voting</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="elimination">Elimination</button>';
      } else {
        inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final1">Final Stage 1</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final2">Final Stage 2</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final3">Final Stage 3</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final4">Final Stage 4</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final5">Final Stage 5</button>'+
                 '<button class="btn" data-ep="'+e+'" data-sec="final_results">Final Results</button>';
      }
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

  function addProceed(ep, section){
    var order = (ep<10)
      ? ["status","events1","daily","events2","voting","elimination"]
      : ["status","final1","final2","final3","final4","final5","final_results"];
    var idx = order.indexOf(section);
    var btn = document.createElement("button");
    btn.className = "btn proceed";
    btn.textContent = "Proceed";

    if(section==="elimination" && ep<10){
      btn.onclick = function(){ showEpisodeSection(ep+1, "status"); };
    } else if(idx>=0 && idx<order.length-1){
      btn.onclick = function(){ showEpisodeSection(ep, order[idx+1]); };
    } else if(section==="final_results"){
      btn.onclick = function(){ showStatisticsPanel("placements"); };
    } else {
      btn.onclick = function(){};
    }
    epActions.appendChild(btn);
  }

  document.getElementById("btn-simulate").onclick = function(){
    if(state.cast.filter(Boolean).length !== 26){
      alert("Please complete all 26 cast slots before simulating.");
      return;
    }
    var teams = buildTeamsFromCast();
    if(!teams || teams.length!==13){ alert("Could not form 13 teams from the 26 slots."); return; }
    state.teams = teams;
    simulateEntireSeason();
    state.simulated = true;
    State.save(state);
    buildLeftAccordion();
    viewCast.hidden = true;
    viewEpisode.hidden = false;
    showEpisodeSection(1,"status");
    elInfoStatus.textContent = "Simulated";
    elInfoCast.textContent = state.teams.filter(function(t){return t.alive!==false;}).length;
  };

  function aliveTeamIds(){ return state.teams.filter(function(t){return t.alive!==false;}).map(function(t){return t.id;}); }

  function simulateEntireSeason(){
    state.episodes = {};
    state.ui = {};
    state.chart = { finalized:false, episodes:{} };
    state.stats = { dailyWins:{}, elimWins:{}, elimPlays:{} };
    state.placements = { first:null, second:null, third:null, fourth:null, eliminated:[] };

    for(var ep=1; ep<=9; ep++){
      var alive = aliveTeamIds();
      var E = state.episodes[ep] = { status:{ aliveTeams: alive.slice() } };

      E.events1 = genHouseEvents(alive);

      var daily = (window.FM_DAILY_DATA||[]).find(function(d){return d.episode===ep;}) || {skillWeights:{} , id:"daily_"+ep, name:"Daily "+ep, description:""};
      var perf = alive.map(function(tid){
        var t = teamById(tid);
        return { tid:tid, score: scoreTeam(daily.skillWeights, t) };
      });
      perf = shuffle(perf);
      perf.sort(function(a,b){
        if (a.score === b.score) return (Math.random()<0.5 ? -1 : 1);
        return a.score - b.score;
      });
      var placements = perf.map(function(x){return x.tid;});
      var winnerTid = placements[placements.length-1];
      var lastTid = placements[0];

      var wTeam = teamById(winnerTid);
      if(wTeam){ wTeam.stats.dailyWins = (wTeam.stats.dailyWins||0) + 1; }

      E.daily = { id:daily.id, name:daily.name, description: daily.description || "", placements:placements, winner:winnerTid, last:lastTid };
      E.events2 = genHouseEvents(alive);

      var winners = teamById(winnerTid);
      var voters = alive.filter(function(tid){return tid!==winnerTid;});
      var votes = [];
      voters.forEach(function(fromTid){
        var fromTeam = teamById(fromTid);
        var elig = alive.filter(function(tid){return tid!==fromTid && tid!==winnerTid;});
        if(!elig.length) return;
        var scored = elig.map(function(tid){ return {tid:tid, r: combinedRelationship(fromTeam, teamById(tid))}; });
        var minR = Math.min.apply(null, scored.map(function(x){return x.r;}));
        var tied = scored.filter(function(x){return x.r===minR;}).map(function(x){return x.tid;});
        var target = tied.length ? sample(tied) : scored.sort(function(a,b){return a.r-b.r;})[0].tid;
        votes.push({from:fromTid, to:target, winner:false});
      });
      var tally = {};
      votes.forEach(function(v){ tally[v.to]=(tally[v.to]||0)+1; });
      var max = Math.max.apply(null, Object.values(tally).length ? Object.values(tally) : [0]);
      var top = Object.entries(tally).filter(function(entry){ return entry[1]===max; }).map(function(entry){ return entry[0]; });
      var houseNominee = top.length ? sample(top) : sample(alive.filter(function(tid){return tid!==winnerTid;}));

      var winElig = alive.filter(function(tid){return tid!==winnerTid && tid!==houseNominee;});
      var winnersNominee = null;
      if(winElig.length){
        var scoredW = winElig.map(function(tid){ return {tid:tid, r: combinedRelationship(winners, teamById(tid))}; });
        var minRW = Math.min.apply(null, scoredW.map(function(x){return x.r;}));
        var tiedW = scoredW.filter(function(x){return x.r===minRW;}).map(function(x){return x.tid;});
        winnersNominee = tiedW.length ? sample(tiedW) : scoredW.sort(function(a,b){return a.r-b.r;})[0].tid;
      }

      if(winnersNominee){
        votes.push({ from:winnerTid, to:winnersNominee, winner:true });
      }

      E.voting = { votes:votes, houseNominee:houseNominee, winnersNominee:winnersNominee };

      var elim = (window.FM_ELIMINATION_DATA||[]).find(function(d){return d.episode===ep;}) || {skillWeights:{}, id:"elim_"+ep, name:"Elimination "+ep, description:""};
      var A = teamById(houseNominee), B = teamById(winnersNominee);
      var sA = A ? scoreTeam(elim.skillWeights, A) : 0;
      var sB = B ? scoreTeam(elim.skillWeights, B) : 0;
      var winner = (sA===sB) ? (Math.random()<0.5 ? A : B) : ((sA>sB) ? A : B);
      var loser = (winner && A && B) ? (winner.id===A.id ? B : A) : null;
      if (winner) { winner.stats.elimWins=(winner.stats.elimWins||0)+1; winner.stats.elimPlays=(winner.stats.elimPlays||0)+1; }
      if (loser) { loser.stats.elimPlays=(loser.stats.elimPlays||0)+1; loser.alive = false; state.placements.eliminated.push(loser.id); }

      E.elimination = { id:elim.id, name:elim.name, description: elim.description || "", houseNominee:houseNominee, winnersNominee:winnersNominee, winner:(winner?winner.id:null), loser:(loser?loser.id:null) };

      state.chart.episodes[String(ep)] = {
        dailyWinner: winnerTid,
        houseNominee: houseNominee,
        winnersNominee: winnersNominee,
        elimWinner: (winner?winner.id:null),
        elimLoser: (loser?loser.id:null)
      };

      state.ui[ep] = {
        dailyRevealIndex: 0,
        votingRevealIndex: 0,
        elimRevealed: false
      };
    }

    simulateFinalsEp10();
    state.chart.finalized = true;
  }

  function simulateFinalsEp10(){
    var ep = 10;
    var alive = aliveTeamIds();
    var E = state.episodes[ep] = { status:{aliveTeams:alive.slice()}, finals:{ stages:[], cumulativeTimes:{}, results:{}, fourth:null } };
    var stages = (window.FM_FINAL_DATA||[]).slice(0,5);
    var cum = {};
    alive.forEach(function(tid){ cum[tid]=0; });

    var currentAlive = alive.slice();

    for(var i=0;i<stages.length;i++){
      var st = stages[i];
      var scores = currentAlive.map(function(tid){ return {tid:tid, score: scoreTeam(st.timeWeights || {}, teamById(tid))}; });
      var best = Math.max.apply(null, scores.map(function(s){return s.score;}));
      var range = st.timeRange || [900,1800];
      var minSec = range[0], maxSec = range[1];
      var times = {};
      scores.forEach(function(sc){
        var ratio = best ? Math.max(0, Math.min(1, sc.score / best)) : 0;
        var base = maxSec + (minSec - maxSec) * ratio;
        var noise = base * (Math.random()*0.08 - 0.04);
        var t = Math.max(60, Math.round(base + noise));
        times[sc.tid] = t;
        cum[sc.tid] += t;
      });
      var placements = currentAlive.slice().sort(function(a,b){ return times[a]-times[b]; });

      E.finals.stages.push({ stage:(i+1), id:st.id || ("final_"+(i+1)), name:st.name || ("Final Stage "+(i+1)), description: st.description || "", times:times, placements:placements });

      if(i===1){
        var slowest = currentAlive.slice().sort(function(a,b){ return cum[b]-cum[a]; })[0];
        E.finals.fourth = slowest;
        currentAlive = currentAlive.filter(function(tid){ return tid!==slowest; });
      }
    }
    E.finals.cumulativeTimes = Object.assign({}, cum);

    var rankFinal = currentAlive.map(function(tid){ return {tid:tid, t:cum[tid]}; }).sort(function(a,b){ return a.t-b.t; });
    var first = rankFinal[0] ? rankFinal[0].tid : null;
    var second = rankFinal[1] ? rankFinal[1].tid : null;
    var third = rankFinal[2] ? rankFinal[2].tid : null;
    E.finals.results = { first:first, second:second, third:third };

    state.placements.first = first;
    state.placements.second = second;
    state.placements.third = third;
    state.placements.fourth = E.finals.fourth || null;

    state.chart.episodes["10"] = {
      finalPlacements: { first:first, second:second, third:third, fourth:(E.finals.fourth || null) }
    };

    state.ui[ep] = {
      stageRevealIndex: { 1:0, 2:0, 3:0, 4:0, 5:0 },
      fourthRevealed: false,
      resultsRevealIndex: 0
    };
  }

  function showEpisodeSection(ep, section){
    state.lastView = { ep:ep, section:section };
    State.save(state);
    epActions.innerHTML = "";
    var s = state.episodes[ep];
    epTitle.textContent = (ep<10) ? ("Episode " + ep) : "Episode 10 — Final";
    epSub.textContent = "";

    if(!s){ epContent.innerHTML = '<p class="muted">No data.</p>'; addProceed(ep, section); return; }

    if (section === "status") {
      var alive = s.status.aliveTeams || [];
      epSub.textContent = "Remaining teams: " + alive.length;

      var grid = document.createElement("div");
      grid.className = "status-grid";

      alive.forEach(function (tid) {
        var t = teamById(tid);
        if (!t) return;

        var color = t.color || "#8890aa";

        var box = document.createElement("div");
        box.className = "team-box status-team-box";
        box.style.borderColor = color;

        var head = document.createElement("div");
        head.className = "team-head";

        var idx = state.teams.findIndex(function (tt) { return tt.id === tid; });
        var label = (idx >= 0 ? "Team " + (idx + 1) : teamName(t));

        head.innerHTML =
          '<span class="label">' + label + '</span>' +
          '<span class="team-color-dot" style="background:' + color + '"></span>';

        box.appendChild(head);

        var inner = document.createElement("div");
        inner.className = "team-inner status-team-inner";

        inner.innerHTML =
          '<div class="status-member">' +
            '<img class="avatar" src="' + picOfPlayer(t.maleId) + '" alt="">' +
            '<div class="name">' + nameOfPlayer(t.maleId) + '</div>' +
          '</div>' +
          '<div class="status-member">' +
            '<img class="avatar" src="' + picOfPlayer(t.femaleId) + '" alt="">' +
            '<div class="name">' + nameOfPlayer(t.femaleId) + '</div>' +
          '</div>';

        box.appendChild(inner);
        grid.appendChild(box);
      });

      epContent.innerHTML = "";
      epContent.appendChild(grid);
      addProceed(ep, section);
      return;
    }

    if(section==="events1" || section==="events2"){
      var key = (section==="events1") ? "events1" : "events2";
      epSub.textContent = (section==="events1" ? "House Events 1" : "House Events 2");
      var grid2 = document.createElement("div"); grid2.className="events-grid";
      (s[key]||[]).forEach(function(ev){
        var card2 = document.createElement("div"); card2.className="mini-card";
        var avatars = document.createElement("div"); avatars.className="row tiny-avatars";
        (ev.players||[]).forEach(function(pid){
          var img = document.createElement("img");
          img.className = "avatar xs";
          img.src = picOfPlayer(pid);
          img.alt = "";
          avatars.appendChild(img);
        });
        var extra = "";
        if(ev.sentiment==="positive") extra = '<div class="muted" style="font-size:.9rem;">Their relationship has improved.</div>';
        if(ev.sentiment==="negative") extra = '<div class="muted" style="font-size:.9rem;">Their relationship has worsened.</div>';
        card2.style.borderColor = "var(--glass-border)";
        card2.innerHTML = avatars.outerHTML + '<div>'+ev.text+'</div>'+ extra;
        grid2.appendChild(card2);
      });
      epContent.innerHTML = ""; epContent.appendChild(grid2);
      addProceed(ep, section);
      return;
    }

    if (section === "daily") {
      var d = s.daily || {};
      epSub.textContent = d.name || "Daily Challenge";

      var desc = document.createElement("div");
      desc.className = "mini-card note daily-desc center-text";
      desc.innerHTML = '<div><strong>Description:</strong> ' + (d.description || "") + '</div>';

      var list = document.createElement("div");
      list.style.display = "grid";
      list.style.gridTemplateColumns = "repeat(auto-fit, minmax(320px, 1fr))";
      list.style.gap = "12px";

      var ui = state.ui[ep] || (state.ui[ep] = {});
      if (typeof ui.dailyRevealIndex !== "number") ui.dailyRevealIndex = 0;

      var order = (d.placements || []).slice();

      function renderDailyList() {
        list.innerHTML = "";
        var toShow = Math.min(ui.dailyRevealIndex, order.length);

        for (var i = 0; i < toShow; i++) {
          var tid = order[i];
          var t = teamById(tid);
          if (!t) continue;

          var place = order.length - i;

          var card = document.createElement("div");
          card.className = "daily-card";
          card.style.borderColor = t.color || "#8890aa";

          card.innerHTML =
            '<div class="row tiny-avatars">' +
              '<img class="avatar" src="' + picOfPlayer(t.maleId) + '" alt="">' +
              '<img class="avatar" src="' + picOfPlayer(t.femaleId) + '" alt="">' +
            '</div>' +
            '<div class="daily-place">' + ordinal(place) + ' Place</div>' +
            '<div class="name">' + teamName(t) + '</div>';

          list.appendChild(card);
        }
      }

      renderDailyList();

      epContent.innerHTML = "";
      epContent.appendChild(desc);
      epContent.appendChild(list);

      var btnNext = document.createElement("button");
      btnNext.className = "btn";
      btnNext.textContent = "Reveal Next Placement";

      var btnAll = document.createElement("button");
      btnAll.className = "btn";
      btnAll.textContent = "Reveal All Placements";

      btnNext.onclick = function () {
        if (ui.dailyRevealIndex < order.length) {
          ui.dailyRevealIndex++;
          State.save(state);
          renderDailyList();
        }

        if (ui.dailyRevealIndex >= order.length) {
          if (btnNext.parentNode) btnNext.parentNode.removeChild(btnNext);
          if (btnAll.parentNode) btnAll.parentNode.removeChild(btnAll);
        }
      };

      btnAll.onclick = function () {
        ui.dailyRevealIndex = order.length;
        State.save(state);
        renderDailyList();

        if (btnNext.parentNode) btnNext.parentNode.removeChild(btnNext);
        if (btnAll.parentNode) btnAll.parentNode.removeChild(btnAll);
      };

      epActions.appendChild(btnNext);
      epActions.appendChild(btnAll);
      addProceed(ep, section);
      return;
    }

    if (section === "voting") {
      var v = s.voting || {};
      epSub.textContent = "The house votes on one team to go straight into elimination. The winners of the daily challenge vote on what other team will face them in the elimination.";

      var allVotes = (v.votes || []).slice();
      var houseVotes = allVotes.filter(function (row) { return !row.winner; });
      var winnersVoteRow = allVotes.find(function (row) { return row.winner; }) || null;

      var wrap = document.createElement("div");
      wrap.className = "voting-list";

      var summaryHolder = document.createElement("div");
      summaryHolder.className = "voting-summary";

      var ui = state.ui[ep] || (state.ui[ep] = {});
      if (typeof ui.votingRevealIndex !== "number") ui.votingRevealIndex = 0;

      function buildTeamCard(team, extraClass) {
        if (!team) {
          var empty = document.createElement("div");
          empty.className = "vote-team-box" + (extraClass ? " " + extraClass : "");
          return empty;
        }
        var card = document.createElement("div");
        card.className = "vote-team-box" + (extraClass ? " " + extraClass : "");
        card.style.borderColor = team.color || "#8890aa";
        card.innerHTML =
          '<div class="row tiny-avatars">' +
            '<img class="avatar" src="' + picOfPlayer(team.maleId) + '" alt="">' +
            '<img class="avatar" src="' + picOfPlayer(team.femaleId) + '" alt="">' +
          '</div>' +
          '<div class="name">' + teamName(team) + '</div>';
        return card;
      }

      function renderVoteCards() {
        wrap.innerHTML = "";
        summaryHolder.innerHTML = "";

        var toShow = Math.min(ui.votingRevealIndex, houseVotes.length);
        for (var i = 0; i < toShow; i++) {
          var row = houseVotes[i];
          var from = teamById(row.from);
          var to = teamById(row.to);

          var card = document.createElement("div");
          card.className = "vote-card";
          card.style.borderColor = from ? from.color : "var(--glass-border)";

          var fromCard = buildTeamCard(from);
          var arrow = document.createElement("div");
          arrow.className = "arrow";
          arrow.textContent = "→";
          var toCard = buildTeamCard(to);

          card.appendChild(fromCard);
          card.appendChild(arrow);
          card.appendChild(toCard);

          wrap.appendChild(card);
        }

        if (ui.votingRevealIndex >= houseVotes.length && (v.houseNominee || v.winnersNominee)) {
          var houseTeam = teamById(v.houseNominee);
          var winnersTeam = teamById(v.winnersNominee);
          if (houseTeam) {
            var houseLabel = document.createElement("div");
            houseLabel.className = "voting-label";
            houseLabel.textContent = "House Vote";
            summaryHolder.appendChild(houseLabel);
            summaryHolder.appendChild(buildTeamCard(houseTeam, "summary"));
          }

          if (winnersTeam) {
            var winLabel = document.createElement("div");
            winLabel.className = "voting-label";
            winLabel.textContent = "Winner's Vote";
            summaryHolder.appendChild(winLabel);
            summaryHolder.appendChild(buildTeamCard(winnersTeam, "summary"));
          }
        }
      }

      renderVoteCards();

      epContent.innerHTML = "";
      epContent.appendChild(wrap);
      epContent.appendChild(summaryHolder);

      var btnRevealVote = document.createElement("button");
      btnRevealVote.className = "btn";
      btnRevealVote.textContent = "Reveal Next Vote";

      var btnRevealAllVotes = document.createElement("button");
      btnRevealAllVotes.className = "btn";
      btnRevealAllVotes.textContent = "Reveal All Votes";

      btnRevealVote.onclick = function () {
        if (ui.votingRevealIndex < houseVotes.length) {
          ui.votingRevealIndex++;
          State.save(state);
          renderVoteCards();
        }

        if (ui.votingRevealIndex >= houseVotes.length) {
          if (btnRevealVote.parentNode) btnRevealVote.parentNode.removeChild(btnRevealVote);
          if (btnRevealAllVotes.parentNode) btnRevealAllVotes.parentNode.removeChild(btnRevealAllVotes);
        }
      };

      btnRevealAllVotes.onclick = function () {
        ui.votingRevealIndex = houseVotes.length;
        State.save(state);
        renderVoteCards();

        if (btnRevealVote.parentNode) btnRevealVote.parentNode.removeChild(btnRevealVote);
        if (btnRevealAllVotes.parentNode) btnRevealAllVotes.parentNode.removeChild(btnRevealAllVotes);
      };

      epActions.appendChild(btnRevealVote);
      epActions.appendChild(btnRevealAllVotes);
      addProceed(ep, section);
      return;
    }

    if (section === "elimination") {
      var el = s.elimination || {};
      epSub.textContent = el.name || "Elimination";

      var desc = document.createElement("div");
      desc.className = "mini-card note daily-desc center-text";
      desc.innerHTML = '<div><strong>Description:</strong> ' + (el.description || "") + '</div>';

      var a = teamById(el.houseNominee),
          b = teamById(el.winnersNominee);

      function buildElimCard(team, id) {
        var card = document.createElement("div");
        card.className = "daily-card elim-card";
        if (id) card.id = id;
        card.style.borderColor = team ? (team.color || "#8890aa") : "#888";

        card.innerHTML =
          '<div class="row tiny-avatars">' +
            '<img class="avatar" src="' + (team ? picOfPlayer(team.maleId) : IMG_BLANK) + '" alt="">' +
            '<img class="avatar" src="' + (team ? picOfPlayer(team.femaleId) : IMG_BLANK) + '" alt="">' +
          '</div>' +
          '<div class="name">' + (team ? teamName(team) : "-") + '</div>';

        return card;
      }

      var matchup = document.createElement("div");
      matchup.className = "matchup elim-matchup";

      var cardA = buildElimCard(a, "elim-team-a");
      var arrow = document.createElement("div");
      arrow.className = "arrow";
      arrow.textContent = "vs";
      var cardB = buildElimCard(b, "elim-team-b");

      matchup.appendChild(cardA);
      matchup.appendChild(arrow);
      matchup.appendChild(cardB);

      epContent.innerHTML = "";
      epContent.appendChild(desc);
      epContent.appendChild(matchup);

      var ui = state.ui[ep] || (state.ui[ep] = {});
      if (typeof ui.elimRevealed !== "boolean") ui.elimRevealed = false;

      var btnReveal = document.createElement("button");
      btnReveal.className = "btn";
      btnReveal.textContent = "Reveal Results";

      btnReveal.onclick = function () {
        if (ui.elimRevealed) return;
        ui.elimRevealed = true;
        State.save(state);

        var boxA = document.getElementById("elim-team-a");
        var boxB = document.getElementById("elim-team-b");

        if (boxA) boxA.classList.remove("elim-win", "elim-lose");
        if (boxB) boxB.classList.remove("elim-win", "elim-lose");

        var winnerId = el.winner;
        var loserId  = el.loser;
        var aId      = el.houseNominee;
        var bId      = el.winnersNominee;

        if (winnerId) {
          if (winnerId === aId && boxA) {
            boxA.classList.add("elim-win");
            if (boxB) boxB.classList.add("elim-lose");
          } else if (winnerId === bId && boxB) {
            boxB.classList.add("elim-win");
            if (boxA) boxA.classList.add("elim-lose");
          }
        }

        else if (loserId) {
          if (loserId === aId && boxA) {
            boxA.classList.add("elim-lose");
            if (boxB) boxB.classList.add("elim-win");
          } else if (loserId === bId && boxB) {
            boxB.classList.add("elim-lose");
            if (boxA) boxA.classList.add("elim-win");
          }
        }
      };

      epActions.appendChild(btnReveal);
      addProceed(ep, section);
      return;
    }

    if(/^final[1-5]$/.test(section)){
      var stageNo = parseInt(section.replace("final",""),10);
      var st = (s.finals && s.finals.stages)
        ? s.finals.stages.find(function(x){return x.stage===stageNo;})
        : null;

      epSub.textContent = st ? st.name : ("Final Stage " + stageNo);

      var desc = document.createElement("div");
      desc.className = "mini-card note final-desc";
      desc.innerHTML =
        '<div><strong>Description:</strong> ' +
        (st && st.description ? st.description : "") +
        '</div>';

      var uiF = state.ui[10] || (state.ui[10]={});
      if(!uiF.stageRevealIndex){
        uiF.stageRevealIndex = {1:0,2:0,3:0,4:0,5:0};
      }

      var placements = (st && st.placements ? st.placements.slice() : []);
      if(stageNo>=3 && s.finals && s.finals.fourth){
        placements = placements.filter(function(tid){ return tid!==s.finals.fourth; });
      }

      var list = document.createElement("div");
      list.className = "final-stage-list";

      function fmtTime(secs){
        var h = Math.floor(secs/3600),
            m = Math.floor((secs%3600)/60),
            s = secs%60;
        return (h>0 ? (h+"h ") : "") + m + "m " + s + "s";
      }

      function renderStageList(){
        list.innerHTML = "";
        var showOrder = placements.slice().reverse();
        var count = Math.min(uiF.stageRevealIndex[stageNo] || 0, showOrder.length);

        for(var j=0;j<count;j++){
          var tid2 = showOrder[j];
          var t = teamById(tid2);
          if(!t) continue;

          var place = showOrder.length - j;
          var secs = (st && st.times) ? st.times[tid2] : null;
          var timeStr = (typeof secs === "number") ? fmtTime(secs) : "";

          var card = document.createElement("div");
          card.className = "daily-card final-card";
          card.style.borderColor = t.color || "#8890aa";
          card.innerHTML =
            '<div class="row tiny-avatars">'+
              '<img class="avatar" src="'+picOfPlayer(t.maleId)+'" alt="">'+
              '<img class="avatar" src="'+picOfPlayer(t.femaleId)+'" alt="">'+
            '</div>'+
            '<div class="name">'+teamName(t)+'</div>'+
            '<div class="final-time">'+timeStr+'</div>'+
            '<div class="placement">'+ordinal(place)+' Place</div>';
          list.appendChild(card);
        }
      }

      epContent.innerHTML = "";
      epContent.appendChild(desc);
      epContent.appendChild(list);
      renderStageList();

      var btnNextP = document.createElement("button");
      btnNextP.className = "btn";
      btnNextP.textContent = "Reveal Next Placement";

      var btnAllP = document.createElement("button");
      btnAllP.className = "btn";
      btnAllP.textContent = "Reveal All Placements";

      btnNextP.onclick = function(){
        if(!placements.length) return;
        var cur = uiF.stageRevealIndex[stageNo] || 0;
        if(cur < placements.length){
          uiF.stageRevealIndex[stageNo] = cur + 1;
          State.save(state);
          renderStageList();
        }

        if((uiF.stageRevealIndex[stageNo] || 0) >= placements.length){
          if(btnNextP.parentNode) btnNextP.parentNode.removeChild(btnNextP);
          if(btnAllP.parentNode) btnAllP.parentNode.removeChild(btnAllP);
        }
      };

      btnAllP.onclick = function(){
        if(!placements.length) return;
        uiF.stageRevealIndex[stageNo] = placements.length;
        State.save(state);
        renderStageList();

        if(btnNextP.parentNode) btnNextP.parentNode.removeChild(btnNextP);
        if(btnAllP.parentNode) btnAllP.parentNode.removeChild(btnAllP);
      };

      epActions.appendChild(btnNextP);
      epActions.appendChild(btnAllP);

      if(stageNo>=2){
        var btnTimes = document.createElement("button");
        btnTimes.className = "btn";
        btnTimes.textContent = "Show Cumulative Time";
        btnTimes.onclick = function(){
          var tbl = document.createElement("table");
          tbl.className = "stats-table";
          tbl.innerHTML = "<thead><tr><th>Team</th><th>Total Time (Stages 1-"+stageNo+")</th></tr></thead>";
          var tb = document.createElement("tbody");

          var aliveAtStage = (stageNo>=3 && s.finals && s.finals.fourth)
            ? s.status.aliveTeams.filter(function(tid){return tid!==s.finals.fourth;})
            : s.status.aliveTeams.slice();

          var sumTimes = {};
          aliveAtStage.forEach(function(tid){ sumTimes[tid]=0; });

          for(var k=1;k<=stageNo;k++){
            var stK = s.finals.stages.find(function(x){return x.stage===k;});
            if(!stK) continue;
            aliveAtStage.forEach(function(tid){
              var tsec = stK.times[tid];
              if(typeof tsec === "number") sumTimes[tid]+=tsec;
            });
          }

          var rows = Object.entries(sumTimes)
            .map(function(e){ return { tid:e[0], secs:e[1] }; })
            .sort(function(a,b){ return a.secs - b.secs; });

          rows.forEach(function(r){
            var tr = document.createElement("tr");
            tr.innerHTML = "<td>"+teamName(teamById(r.tid))+"</td><td>"+fmtTime(r.secs)+"</td>";
            tb.appendChild(tr);
          });

          tbl.appendChild(tb);
          timesTable.innerHTML = "";
          timesTable.appendChild(tbl);
          timesPanel.showModal();
        };
        epActions.appendChild(btnTimes);
      }

      if(stageNo===2){
        var btnReveal4th = document.createElement("button");
        btnReveal4th.className = "btn";
        btnReveal4th.textContent = "Reveal Eliminated";
        btnReveal4th.onclick = function(){
          var uiF2 = state.ui[10] || (state.ui[10]={});
          if(uiF2.fourthRevealed) return;
          uiF2.fourthRevealed = true;
          State.save(state);

          var fourth = (s.finals && s.finals.fourth) ? teamById(s.finals.fourth) : null;
          if(fourth){
            var card = document.createElement("div");
            card.className = "daily-card final-card border-red";
            card.style.borderColor = fourth.color || "#ff5a5a";
            card.innerHTML =
              '<div class="row tiny-avatars">'+
                '<img class="avatar" src="'+picOfPlayer(fourth.maleId)+'" alt="">'+
                '<img class="avatar" src="'+picOfPlayer(fourth.femaleId)+'" alt="">'+
              '</div>'+
              '<div class="name"><strong>'+teamName(fourth)+'</strong></div>'+
              '<div class="placement" style="font-weight:700; margin-top:4px;">ELIMINATED</div>';
            epContent.appendChild(card);
          }

          if(btnReveal4th.parentNode){
            btnReveal4th.parentNode.removeChild(btnReveal4th);
          }
        };
        epActions.appendChild(btnReveal4th);
      }

      addProceed(ep, section);
      return;
    }

    if (section === "final_results") {
      var res = s.finals ? (s.finals.results || {}) : {};
      epSub.textContent = "Final Results";

      var list = document.createElement("div");
      list.className = "final-results-list";

      var uiF = state.ui[10] || (state.ui[10] = {});
      if (typeof uiF.resultsRevealIndex !== "number") uiF.resultsRevealIndex = 0;

      var seq = [
        ["Third Place", res.third, "border-bronze"],
        ["Second Place", res.second, "border-silver"],
        ["Winners",     res.first,  "border-gold"]
      ];

      function renderFinalsResults() {
        list.innerHTML = "";
        var max = Math.min(uiF.resultsRevealIndex, seq.length);

        for (var i = 0; i < max; i++) {
          var lab   = seq[i][0];
          var tid   = seq[i][1];
          var medal = seq[i][2];
          if (!tid) continue;

          var t = teamById(tid);
          if (!t) continue;

          var card = document.createElement("div");
          card.className = "daily-card final-card";
          card.classList.add(medal);

          card.innerHTML =
            '<div class="row tiny-avatars">' +
              '<img class="avatar" src="' + picOfPlayer(t.maleId) + '" alt="">' +
              '<img class="avatar" src="' + picOfPlayer(t.femaleId) + '" alt="">' +
            '</div>' +
            '<div class="name"><strong>' + lab + ':</strong> ' + teamName(t) + '</div>';

          list.appendChild(card);
        }
      }

      epContent.innerHTML = "";
      epContent.appendChild(list);
      renderFinalsResults();

      var btnNextPlace = document.createElement("button");
      btnNextPlace.className = "btn";
      btnNextPlace.textContent = "Reveal Next Placement";

      var btnAllPlaces = document.createElement("button");
      btnAllPlaces.className = "btn";
      btnAllPlaces.textContent = "Reveal All Placements";

      btnNextPlace.onclick = function () {
        if (uiF.resultsRevealIndex < seq.length) {
          uiF.resultsRevealIndex++;
          State.save(state);
          renderFinalsResults();
        }
        if (uiF.resultsRevealIndex >= seq.length) {
          if (btnNextPlace.parentNode) btnNextPlace.parentNode.removeChild(btnNextPlace);
          if (btnAllPlaces.parentNode) btnAllPlaces.parentNode.removeChild(btnAllPlaces);
        }
      };

      btnAllPlaces.onclick = function () {
        uiF.resultsRevealIndex = seq.length;
        State.save(state);
        renderFinalsResults();
        if (btnNextPlace.parentNode) btnNextPlace.parentNode.removeChild(btnNextPlace);
        if (btnAllPlaces.parentNode) btnAllPlaces.parentNode.removeChild(btnAllPlaces);
      };

      epActions.appendChild(btnNextPlace);
      epActions.appendChild(btnAllPlaces);

      addProceed(ep, section);
      return;
    }
}

  function showStatisticsPanel(kind){
    viewCast.hidden = true;
    viewEpisode.hidden = false;
    epActions.innerHTML = "";

    if(kind==="placements"){
      epTitle.textContent = "Placements";
      epSub.textContent = "Season Results";
      var wrap = document.createElement("div"); wrap.className="stats-wrap";

      var totalTeams = 13;
      var row1 = document.createElement("div"); row1.className="placements-grid"; row1.style.gridTemplateColumns = "repeat(1, minmax(260px, 1fr))";
      var first = state.placements.first ? teamById(state.placements.first) : null;
      if(first){
        var c = document.createElement("div"); c.className="status-card border-gold"; c.style.borderColor = first.color;
        c.innerHTML =
          '<span class="placement-badge">1st</span>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(first.maleId)+'"><div class="name">'+nameOfPlayer(first.maleId)+'</div></div>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(first.femaleId)+'"><div class="name">'+nameOfPlayer(first.femaleId)+'</div></div>';
        row1.appendChild(c);
      }
      wrap.appendChild(row1);

      var row2 = document.createElement("div"); row2.className="placements-grid"; row2.style.gridTemplateColumns = "repeat(3, minmax(260px, 1fr))";
      var second = state.placements.second ? teamById(state.placements.second) : null;
      var third = state.placements.third ? teamById(state.placements.third) : null;
      var fourth = state.placements.fourth ? teamById(state.placements.fourth) : null;

      if(second){
        var c2 = document.createElement("div"); c2.className="status-card border-silver"; c2.style.borderColor = second.color;
        c2.innerHTML =
          '<span class="placement-badge">2nd</span>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(second.maleId)+'"><div class="name">'+nameOfPlayer(second.maleId)+'</div></div>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(second.femaleId)+'"><div class="name">'+nameOfPlayer(second.femaleId)+'</div></div>';
        row2.appendChild(c2);
      }
      if(third){
        var c3 = document.createElement("div"); c3.className="status-card border-bronze"; c3.style.borderColor = third.color;
        c3.innerHTML =
          '<span class="placement-badge">3rd</span>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(third.maleId)+'"><div class="name">'+nameOfPlayer(third.maleId)+'</div></div>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(third.femaleId)+'"><div class="name">'+nameOfPlayer(third.femaleId)+'</div></div>';
        row2.appendChild(c3);
      }
      if(fourth){
        var c4 = document.createElement("div"); c4.className="status-card border-red"; c4.style.borderColor = fourth.color;
        c4.innerHTML =
          '<span class="placement-badge">4th</span>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(fourth.maleId)+'"><div class="name">'+nameOfPlayer(fourth.maleId)+'</div></div>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(fourth.femaleId)+'"><div class="name">'+nameOfPlayer(fourth.femaleId)+'</div></div>';
        row2.appendChild(c4);
      }
      wrap.appendChild(row2);

      var rowRest = document.createElement("div"); rowRest.className="placements-grid";
      state.placements.eliminated.forEach(function(tid, idx){
        var place = totalTeams - idx;
        var t = teamById(tid); if(!t) return;
        var card = document.createElement("div"); card.className="status-card"; card.style.borderColor = t.color;
        card.innerHTML =
          '<span class="placement-badge">'+place+'th</span>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(t.maleId)+'"><div class="name">'+nameOfPlayer(t.maleId)+'</div></div>'+
          '<div class="status-slot"><img class="avatar" src="'+picOfPlayer(t.femaleId)+'"><div class="name">'+nameOfPlayer(t.femaleId)+'</div></div>';
        rowRest.appendChild(card);
      });
      wrap.appendChild(rowRest);

      epContent.innerHTML = ""; epContent.appendChild(wrap);
      return;
    }

    if(kind==="other"){
      epTitle.textContent = "Other Statistics";
      var table = document.createElement("table"); table.className="stats-table";
      var body = document.createElement("tbody");
      table.innerHTML = "<thead><tr><th>Category</th><th>Team</th><th>Value</th></tr></thead>";

      function topBy(key){
        var arr = state.teams.map(function(t){ return { tid:t.id, v:(t.stats && t.stats[key]) ? t.stats[key] : 0 }; })
                             .sort(function(a,b){ return b.v - a.v; });
        var best = arr[0] ? arr[0].v : 0;
        var ties = arr.filter(function(x){ return x.v===best; });
        return { best:best, teams:ties.map(function(x){return teamById(x.tid);}) };
      }

      var S1 = topBy("dailyWins");
      var S2 = topBy("elimPlays");
      var S3 = topBy("elimWins");

      function addRow(label, pack){
        var names = pack.teams.map(function(t){ return t ? teamName(t) : "-"; }).join(", ");
        var tr=document.createElement("tr"); tr.innerHTML = "<td>"+label+"</td><td>"+names+"</td><td>"+pack.best+"</td>";
        body.appendChild(tr);
      }
      addRow("Most Daily Challenge Wins", S1);
      addRow("Most Eliminations Played", S2);
      addRow("Most Elimination Wins", S3);

      table.appendChild(body);
      epContent.innerHTML = ""; epContent.appendChild(table);
      return;
    }

    if(kind==="chart"){
      epTitle.textContent = "Season Chart";
      epSub.textContent = "";
      var btn = document.createElement("button"); btn.className="btn"; btn.textContent="Open Season Chart";
      btn.onclick = function(){ location.href = "./season_chart.html"; };
      epContent.innerHTML = "";
      var call = document.createElement("div"); call.className="mini-card note";
      call.innerHTML = "<div>The season's per-episode chart.</div>";
      epContent.appendChild(call);
      epActions.appendChild(btn);
      return;
    }
  }
