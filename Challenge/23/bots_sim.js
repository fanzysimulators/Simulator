(function(){
  "use strict";

  var IMG_BLANK="BlankProfile.webp";
  var RED  = "#ff0000";
  var BLUE = "#0000ff";
  var GREY = "#808080";

  var rnd = function(n){ return Math.floor(Math.random()*n); };
  var sample = function(arr){ return arr && arr.length ? arr[rnd(arr.length)] : undefined; };
  var shuffle = function(arr){ return arr.map(function(v){return [Math.random(),v];}).sort(function(a,b){return a[0]-b[0];}).map(function(x){return x[1];}); };
  var clamp = function(n,min,max){ return Math.max(min, Math.min(max,n)); };

  (function normalizePlayers(){
    if (Array.isArray(window.PLAYERS) && window.PLAYERS.length) return;
    var src = window.PLAYERS || window.players || window.player_data;
    if (!Array.isArray(src) || src.length === 0) {
      var pd = window.playerData;
      if (pd && (Array.isArray(pd.males) || Array.isArray(pd.females) || Array.isArray(pd.others))) {
        var tag = function(arr, gender){
          return (Array.isArray(arr) ? arr : []).map(function(p){
return { id: p.id, name: p.name, nickname: p.nickname || p.name || p.id, show: p.show, season: p.season,
         shows: Array.isArray(p.shows) ? p.shows : (p.shows ? [p.shows] : (p.show ? [p.show] : null)),
         seasonsByShow: p.seasonsByShow || null,
         gender: gender || p.gender || "unknown",
         image: p.image || (p.id ? ("../../contestant_pictures/" + p.id + ".webp") : IMG_BLANK) };
          });
        };
        src = [].concat(tag(pd.males,"male"), tag(pd.females,"female"), tag(pd.others,null));
      } else { src = []; }
    }
    window.PLAYERS = src;
    window.PLAYERS_BY_ID = Object.fromEntries((src||[]).map(function(p){ return [p.id,p]; }));
  })();

var KEY="challenge-bots-season";
var State={ load:function(){ try{ return JSON.parse(sessionStorage.getItem(KEY)) || null; }catch(e){ return null; } },
            save:function(s){ sessionStorage.setItem(KEY, JSON.stringify(s)); },
            clear:function(){ sessionStorage.removeItem(KEY); } };

var TEAM_KEYS = ["austin","brooklyn","cancun","fresh_meat","las_vegas","new_orleans","san_diego","st_thomas"];

var emptySlots = function(n){ return Array.from({length:n}).map(function(){return null;}); };

  var state = State.load() || {
    seed: Math.random().toString(36).slice(2,8).toUpperCase(),
      teams: {
    austin:     { name:"Team Austin",     color:"#ff0000", women:emptySlots(2), men:emptySlots(2) },
    brooklyn:   { name:"Team Brooklyn",   color:"#000080", women:emptySlots(2), men:emptySlots(2) },
    cancun:     { name:"Team Cancun",     color:"#008000", women:emptySlots(2), men:emptySlots(2) },
    fresh_meat: { name:"Team Fresh Meat", color:"#ffff00", women:emptySlots(2), men:emptySlots(2) },
    las_vegas:  { name:"Team Las Vegas",  color:"#cc0000", women:emptySlots(2), men:emptySlots(2) },
    new_orleans:{ name:"Team New Orleans",color:"#808080", women:emptySlots(2), men:emptySlots(2) },
    san_diego:  { name:"Team San Diego",  color:"#87ceeb", women:emptySlots(2), men:emptySlots(2) },
    st_thomas:  { name:"Team St. Thomas", color:"#0000ff", women:emptySlots(2), men:emptySlots(2) }
    },
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
  function skillOf(pid, key){ var s = (state.profiles[pid] && (state.profiles[pid][key])) || 0; return typeof s === "number" ? clamp(s,-3,3) : 0; }
  function nameOf(pid){ var c = state.players.find(function(x){ return x && x.id===pid; }); return c ? (c.nickname || c.name || pid) : pid; }
  function picOf(pid){ var c = state.players.find(function(x){ return x && x.id===pid; }); return c ? (c.image || IMG_BLANK) : IMG_BLANK; }
  function profileMult(pid, compKey){ var v = skillOf(pid, compKey); return 1 + (v * 0.1); }
  function scorePlayerWeighted(weights, pid){
    var s=0; for(var k in (weights||{})){ if(Object.prototype.hasOwnProperty.call(weights,k)){
      var w=+weights[k]||0; s += w * profileMult(pid,k);
    }} return s;
  }
  function ordinal(n){ var s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
  function teamColorOf(pid){
    var p = state.players.find(function(x){ return x.id === pid; });
    if (!p) return "var(--glass-border)";
    var teamObj = state.teams[p.team];
    return (teamObj && teamObj.color) ? teamObj.color : "var(--glass-border)";
  }

function allShowsOf(p){
  if (Array.isArray(p.shows) && p.shows.length) return p.shows.filter(Boolean);
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

function buildFilterShows(roster){
  var showMap = {};
  (roster || []).forEach(function(p){
    (allShowsOf(p) || []).forEach(function(s){
      if (s) showMap[s] = true;
    });
  });

  var shows = Object.keys(showMap).sort();
  var options = '<option value="">— All Shows —</option>' +
    shows.map(function(s){ return '<option value="'+s+'">'+s+'</option>'; }).join("");

  elFilterShow.innerHTML = options;
  elFilterShow.onchange = function(){ buildTeamsGrid(roster || []); };
}

  function normalizeNeededGender(g){ return g==="women" ? "female" : g==="men" ? "male" : g; }
  function playerOptions(roster, genderNeeded, selectedId){
    var showFilter = elFilterShow.value;
    var need = normalizeNeededGender(genderNeeded);
    var filtered = (roster||[]).filter(function(r){
      var ok = (!showFilter || r.show===showFilter);
      return !need ? ok : (ok && r.gender===need);
    });
    var opts = ['<option value="">Choose</option>'];
    for (var i=0;i<filtered.length;i++){
      var r = filtered[i]; var sel = (selectedId && r.id===selectedId) ? " selected" : "";
      opts.push('<option value="'+r.id+'"'+sel+'>'+ (r.name || r.nickname || r.id) +'</option>');
    }
    return opts.join("");
  }

function teamPickRow(teamKey, genderKey, roster){
  var row = document.createElement("div");
  row.className = "pick-row";

  for (var i = 0; i < 2; i++) {
    var slot = (state.teams[teamKey][genderKey] || [])[i] || null;

    var card = document.createElement("div");
    card.className = "pick-card";

    var imgSrc = slot && slot.image ? slot.image : IMG_BLANK;
    var name = slot && (slot.nickname || slot.name) ? (slot.nickname || slot.name) : "Empty";

    card.innerHTML =
      '<div class="avatar-wrap">' +
        '<img class="avatar" src="' + imgSrc + '" alt="">' +
        '<div class="name">' + name + '</div>' +
      '</div>' +
      '<select class="pick-player" data-team="' + teamKey + '" data-gender="' + genderKey + '" data-slot="' + i + '">' +
        '<option value="">— Choose —</option>' +
        (roster || []).map(function (p) {
          if (!p || !p.id) return "";
          if (genderKey === "women" && p.gender !== "female") return "";
          if (genderKey === "men"   && p.gender !== "male")   return "";
          var label = p.name || p.nickname || p.id;
          var selected = (slot && slot.id === p.id) ? ' selected' : '';
          return '<option value="' + p.id + '"' + selected + '>' + label + '</option>';
        }).join("") +
      '</select>' +
      '<button class="btn btn-custom" data-team="' + teamKey + '" data-gender="' + genderKey + '" data-slot="' + i + '" type="button">Custom Player</button>';

    card.dataset.team = teamKey;
    card.dataset.gender = genderKey;
    card.dataset.slot = i;
    row.appendChild(card);
  }

  return row;
}
function buildOneTeamBlock(teamKey, roster){
  var t = state.teams[teamKey];

  var box = document.createElement("div");
  box.className = "team-box";
  box.style.borderColor = t.color || "#ffffff";
  var head = document.createElement("div");
  head.className = "team-head";

  var labelSpan = document.createElement("span");
  labelSpan.className = "label";
  labelSpan.textContent = t.name;

  var tagSpan = document.createElement("span");
  tagSpan.className = "team-tag";
  tagSpan.textContent = t.name;
  tagSpan.style.color = t.color || "#ffffff";

  head.appendChild(labelSpan);
  head.appendChild(tagSpan);
  box.appendChild(head);
  var settings = document.createElement("div");
  settings.className = "team-settings";
  var nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "team-name-input";
  nameInput.value = t.name || "";
  nameInput.setAttribute("aria-label", "Team name for " + (t.name || teamKey));

  function applyName(newName){
    var val = (newName || "").trim();
    if (!val) val = t.name;
    state.teams[teamKey].name = val;
    labelSpan.textContent = val;
    tagSpan.textContent = val;
    State.save(state);
  }

  nameInput.onchange = function(){ applyName(nameInput.value); };
  nameInput.onblur   = function(){ applyName(nameInput.value); };
  var colorControls = document.createElement("div");
  colorControls.className = "team-color-controls";

  var colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.className = "team-color-picker";
  colorInput.value = t.color || "#ffffff";

  var hexInput = document.createElement("input");
  hexInput.type = "text";
  hexInput.className = "team-hex-input";
  hexInput.value = (t.color || "#ffffff").toUpperCase();
  hexInput.setAttribute("maxlength", "7");
  hexInput.setAttribute("aria-label", "Hex color for " + (t.name || teamKey));

  function normalizeHex(hex){
    if (!hex) return null;
    hex = hex.trim();
    if (hex[0] !== "#") hex = "#" + hex;
    if (!/^#([0-9a-fA-F]{6})$/.test(hex)) return null;
    return hex.toUpperCase();
  }

  function applyColor(hex){
    var norm = normalizeHex(hex);
    if (!norm) return;
    state.teams[teamKey].color = norm;
    box.style.borderColor = norm;
    tagSpan.style.color = norm;
    colorInput.value = norm;
    hexInput.value = norm;
    State.save(state);
  }

  colorInput.oninput = function(){
    applyColor(colorInput.value);
  };

  hexInput.onchange = function(){
    applyColor(hexInput.value);
  };
  hexInput.onblur = function(){
    applyColor(hexInput.value);
  };

  colorControls.appendChild(colorInput);
  colorControls.appendChild(hexInput);

  settings.appendChild(nameInput);
  settings.appendChild(colorControls);

  box.appendChild(settings);
  var wrap = document.createElement("div");
  wrap.className = "pick-grid";

  wrap.appendChild(teamPickRow(teamKey, "women", roster));
  wrap.appendChild(teamPickRow(teamKey, "men",   roster));

  box.appendChild(wrap);
  return box;
}

function buildTeamsGrid(roster){
  elTeams.innerHTML = "";
  TEAM_KEYS.forEach(function(teamKey){
    elTeams.appendChild(buildOneTeamBlock(teamKey, roster));
  });

  elTeams.querySelectorAll(".pick-player").forEach(function(sel){
    sel.onchange = function(e){
      var team = e.target.dataset.team;
      var gender = e.target.dataset.gender;
      var slot = +e.target.dataset.slot;
      var id = e.target.value || "";

      if (!id) {
        state.teams[team][gender][slot] = null;
        State.save(state);
        return buildTeamsGrid(roster || []);
      }

      var p = (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id]) ||
              (roster || []).find(function(r){ return r.id === id; });
      if (!p) return;
      if (gender === "men"   && p.gender !== "male")   return;
      if (gender === "women" && p.gender !== "female") return;

      state.teams[team][gender][slot] = asEntry(p);
      State.save(state);
      buildTeamsGrid(roster || []);
    };
  });

  elTeams.querySelectorAll(".btn-custom").forEach(function(btn){
    btn.onclick = function(){
      openCustomModal(btn.dataset.team, btn.dataset.gender, +btn.dataset.slot);
    };
  });

  var total = TEAM_KEYS.reduce(function(sum, k){
    return sum
      + (state.teams[k].women || []).filter(Boolean).length
      + (state.teams[k].men   || []).filter(Boolean).length;
  }, 0);

  elInfoCast.textContent = total + " / 32";
}

  var modal = document.createElement("dialog");
  modal.className = "antm-modal";
modal.innerHTML = '<form id="custom-form" method="dialog" autocomplete="on">'+
  '<h3>Add Custom Player</h3>'+
  '<label for="cp-name">Full Name</label><input name="cp-name" id="cp-name" required autocomplete="name" />'+
  '<label for="cp-nickname">Nickname</label><input name="cp-nickname" id="cp-nickname" required autocomplete="nickname" />'+
  '<label for="cp-image">Image URL</label><input name="cp-image" id="cp-image" placeholder="https://..." autocomplete="url" />'+
  '<menu><button type="button" class="btn" id="modal-cancel">Cancel</button><button type="submit" class="btn" id="modal-add">Add</button></menu>'+
'</form>';
  document.body.appendChild(modal);

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
        '<input type="text" class="rand-seasons" data-show="'+show+'" placeholder="Seasons (e.g. 1, 3, 6)">' +
      '</label>';
  }).join("");
}

function randomizeCastWithPrefsBOTS(prefs){
  var roster = filterRosterByPrefs(prefs);

  var females = shuffle(roster.filter(function(r){ return r.gender === "female"; }));
  var males   = shuffle(roster.filter(function(r){ return r.gender === "male"; }));

  var neededPerGender = TEAM_KEYS.length * 2;
  if (males.length < neededPerGender || females.length < neededPerGender) {
    alert("Not enough eligible players for the selected filters (need 16 men and 16 women).");
    return;
  }

  TEAM_KEYS.forEach(function(teamKey, idx){
    state.teams[teamKey].women = females.slice(idx*2, idx*2 + 2).map(asEntry);
    state.teams[teamKey].men   = males.slice(idx*2,   idx*2 + 2).map(asEntry);
  });

  State.save(state);
  buildTeamsGrid(window.PLAYERS || []);
}

function openRandomizeModalBOTS(){
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
    randomizeCastWithPrefsBOTS(prefs);
  };

  btnCancel.onclick = function(){
    randModal.close();
  };
}

  function openCustomModal(teamKey, genderKey, slot){
    modal.showModal();
    var formCustom = modal.querySelector("#custom-form");
    var cancelBtn = modal.querySelector("#modal-cancel");
formCustom.onsubmit = function(ev){
  ev.preventDefault();

  var name = formCustom.querySelector("#cp-name").value.trim();
  var nickname = formCustom.querySelector("#cp-nickname").value.trim();
  var g = (genderKey === "men") ? "male" : (genderKey === "women") ? "female" : "unknown";
  var image = (formCustom.querySelector("#cp-image").value || "").trim();

  if(!name || !nickname){ return; }

  var id = nickname.toLowerCase().replace(/[^a-z0-9]+/g,"_") + "_" + Date.now().toString(36);

  var cp = {
    id: id,
    name: name,
    nickname: nickname,
    gender: g,
    show: "Custom",
    image: image ? image : IMG_BLANK   // IMG_BLANK = "BlankProfile.webp"
  };

  state.teams[teamKey][genderKey][slot] = asEntry(cp);
  State.save(state);
  modal.close();
  formCustom.reset();
  buildTeamsGrid(window.PLAYERS||[]);
};
    cancelBtn.onclick = function(){ modal.close(); };
  }

  document.getElementById("btn-reset-session").addEventListener("click", function(e){ e.preventDefault(); State.clear(); location.reload(); });
document.getElementById("btn-back-cast").addEventListener("click", function (e) {
  e.preventDefault();
  resetSeasonKeepCast();
});
  document.getElementById("btn-profiles").addEventListener("click", function(){ location.href = "./profiles.html"; });
  document.getElementById("btn-relationships").addEventListener("click", function(){ location.href = "./relationships.html"; });
document.getElementById("btn-randomize").onclick = function(){
  openRandomizeModalBOTS();
};

document.getElementById("btn-reset-cast").onclick = function(){
  TEAM_KEYS.forEach(function(teamKey){
    state.teams[teamKey].women = emptySlots(2);
    state.teams[teamKey].men   = emptySlots(2);
  });
  State.save(state);
  buildTeamsGrid(window.PLAYERS || []);
};

  (function init(){
    var src = window.PLAYERS || [];
    var warn = document.getElementById("data-warning");

    if (!Array.isArray(src) || !src.length) {
      warn.style.display = "block";
      buildFilterShows([]);
      buildTeamsGrid([]);
    } else {
      warn.style.display = "none";
      buildFilterShows(src);
      buildTeamsGrid(src);
    }

    document.getElementById("info-seed").textContent = state.seed;

    if (state.simulated) {
      buildLeftAccordion();
      viewCast.hidden = true;
      viewEpisode.hidden = false;

      var last = state.lastView || { ep: 1, section: "format" };
      showEpisodeSection(last.ep, last.section);

      document.getElementById("info-status").textContent = "Simulated";

   var total = TEAM_KEYS.reduce(function (sum, k) {
     var t = state.teams[k] || { women: [], men: [] };
     return sum
       + (t.women || []).filter(Boolean).length
       + (t.men   || []).filter(Boolean).length;
   }, 0);

   elInfoCast.textContent = total.toString();
   statsPanel.style.display = "block";
    }

    document.getElementById("goto-placements").onclick = function () {
      showStatisticsPanel("placements");
    };
    document.getElementById("goto-stats").onclick = function () {
      showStatisticsPanel("stats");
    };
    document.getElementById("goto-chart").onclick = function () {
      showStatisticsPanel("chart");
    };
  })();

function setAliveFromCast() {
  state.players = TEAM_KEYS.flatMap(function (teamKey) {
    var t = state.teams[teamKey] || { women: [], men: [] };
    return (t.women.concat(t.men))
      .filter(Boolean)
      .map(function (c) {
        return {
          id: c.id,
          name: c.name,
          nickname: c.nickname,
          image: c.image,
          gender: c.gender,
          alive: true,
          team: teamKey
        };
      });
  });
}

function resetSeasonKeepCast() {
  state.episodes   = {};
  state.ui         = {};
  state.chart      = { finalized:false, episodes:{} };
  state.stats      = {
    dailyWinsTeam:{},
    lastPlaceTeam:{},
    nominatedTeam:{},
    elimWins:{},
    elimPlays:{},
    notPicked:{}
  };
  state.placements = { final:{ first:null, second:null, third:null }, eliminated:[] };
  state.simulated  = false;
  state.lastView   = null;
  State.save(state);

  viewCast.hidden    = false;
  viewEpisode.hidden = true;
  elAccordion.innerHTML      = "";
  statsPanel.style.display   = "none";
  elInfoStatus.textContent   = "Not simulated";

  var total = TEAM_KEYS.reduce(function(sum, k){
    var t = state.teams[k] || { women: [], men: [] };
    return sum
      + (t.women || []).filter(Boolean).length
      + (t.men   || []).filter(Boolean).length;
  }, 0);
  elInfoCast.textContent = total + " / 32";
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  function genHouseEvents(){
    var alive = aliveIds(); var E = window.BOTS_EVENTS || {};
    var out=[]; var pick = function(a){ return a && a.length ? sample(a) : null; };
    var count = 4 + rnd(4);
    for(var i=0;i<count;i++){
      var roll=Math.random();
      if(roll<0.3){
        var A = sample(alive); var ev1 = pick(E.solo_neutral || []);
        if(ev1 && A) out.push({ players:[A], text:renderNames(ev1,[A]) });
      } else if(roll<0.8){
        var P1 = sample(alive), P2 = sample(alive.filter(function(x){return x!==P1;})) || P1;
        var ev2 = pick((E.two_neutral || [])); if(ev2 && P1 && P2) out.push({ players:[P1,P2], text:renderNames(ev2,[P1,P2]) });
      } else {
        var A3 = sample(alive), B3 = sample(alive.filter(function(x){return x!==A3;})), C3 = sample(alive.filter(function(x){return x!==A3 && x!==B3;}));
        var ev3 = pick(E.team_neutral || []); if(ev3 && A3 && B3 && C3) out.push({ players:[A3,B3,C3], text:renderNames(ev3,[A3,B3,C3]) });
      }
    }
    return out;
  }

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
      var card = document.createElement("div");
      card.className = "mini-card";

      var col = teamColorOf(pid);
      card.style.borderColor = col;
      card.style.borderWidth = "3px";
      card.style.boxShadow = "0 0 8px " + col + ", 0 0 16px " + col;

      card.innerHTML =
        '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(pid)+'" alt=""></div>' +
        '<div>'+text+'</div>';

      wrap.appendChild(card);
    }
    container.innerHTML=""; container.appendChild(wrap);
  }

  function dailySpec(ep){
    var arr = window.BOTS_DAILY_DATA || [];
    return arr.find(function(d){ return d.episode === ep; }) || null;
  }

  function elimSpec(ep){
    var arr = window.BOTS_ELIMINATION_DATA || [];
    return arr.find(function(d){ return d.episode === ep; }) || null;
  }

  function finalData(){
    var obj = window.BOTS_FINAL_DATA || {};
    if (Array.isArray(obj.stages)) return obj;
    return { stages: [] };
  }

function computeDaily(ep, snapshotIds){
  var D = dailySpec(ep);
  var defaultOrder = TEAM_KEYS.slice();
  var aliveTeamKeys = TEAM_KEYS.filter(function(k){
    return teamFromSnapshot(snapshotIds, k).length > 0;
  });

  var teamKeys = aliveTeamKeys.length ? aliveTeamKeys : defaultOrder;

  if (!D){
    return {
      name: "Daily " + ep,
      description: "(No data—fallback)",
      comments: {},
      skillWeights: {},
      teamScores: {},
      order: teamKeys.slice(),
      winners: teamKeys.length ? [teamKeys[0]] : []
    };
  }

  var out = {
    name: D.name || ("Daily " + ep),
    description: D.description || "",
    format: "teams",
    comments: D.comments || {},
    skillWeights: D.skillWeights || {},
    teamScores: {},
    order: [],
    winners: []
  };

  var scores = teamKeys.map(function(k){
    var ids = teamFromSnapshot(snapshotIds, k);
    if (!ids.length) return { team: k, score: Infinity };

    var avg = ids.reduce(function(sum, id){
      return sum + scorePlayerWeighted(D.skillWeights || {}, id);
    }, 0) / ids.length;

    return { team: k, score: avg };
  });

  var groups = {};
  scores.forEach(function(s){
    var key = String(s.score);
    if (!groups[key]) groups[key] = { score: s.score, items: [] };
    groups[key].items.push(s);
  });

  var groupArr = Object.keys(groups).map(function(k){ return groups[k]; });
  groupArr.sort(function(a, b){ return a.score - b.score; });

  var finalScores = [];
  groupArr.forEach(function(g){
    var shuffled = shuffle(g.items.slice());
    Array.prototype.push.apply(finalScores, shuffled);
  });

  out.order = finalScores.map(function(s){ return s.team; });

  out.teamScores = Object.fromEntries(finalScores.map(function(s){
    return [s.team, s.score];
  }));

  if (finalScores.length){
    var winnerTeam = finalScores[0].team;
    out.winners = [winnerTeam];
    state.stats.dailyWinsTeam[winnerTeam] =
      (state.stats.dailyWinsTeam[winnerTeam] || 0) + 1;
  }

  return out;
}

  function worstRelPick(fromId, candidates){
    if(!candidates.length) return null;
    var worst=[], sc=+Infinity;
    for(var i=0;i<candidates.length;i++){ var c=candidates[i]; var r=rel(fromId,c); if(r < sc){ sc=r; worst=[c]; } else if(r===sc){ worst.push(c); } }
    return sample(worst);
  }
  function runVotingForTeam(teamKey, snapshotIds){
    var voters = teamFromSnapshot(snapshotIds, teamKey);
    var men = menFrom(voters), women = womenFrom(voters);
    var votesM={}, votesF={}; var perVoter=[];
    voters.forEach(function(voter){
      var pickM = worstRelPick(voter, men.filter(function(x){return x!==voter;}));
      var pickF = worstRelPick(voter, women.filter(function(x){return x!==voter;}));
      if(pickM) votesM[pickM]=(votesM[pickM]||0)+1;
      if(pickF) votesF[pickF]=(votesF[pickF]||0)+1;
      perVoter.push({ voter:voter, male:pickM||null, female:pickF||null });
    });
    function top(map){ var max=-1, best=[]; Object.keys(map).forEach(function(id){ var v=map[id]; if(v>max){ max=v; best=[id]; } else if(v===max){ best.push(id); } }); return sample(best)||null; }
    return {
      perVoter: perVoter,
      maleNom: top(votesM),
      femaleNom: top(votesF),
      votes: { male:votesM, female:votesF }
    };
  }

  function avgRelBetweenTeams(teamAKey, teamBKey, snapshotIds){
    var teamA = teamFromSnapshot(snapshotIds, teamAKey);
    var teamB = teamFromSnapshot(snapshotIds, teamBKey);
    if (!teamA.length || !teamB.length) return 0;
    var sum = 0, count = 0;
    teamA.forEach(function(a){
      teamB.forEach(function(b){
        sum += rel(a, b);
        count++;
      });
    });
    return count ? (sum / count) : 0;
  }

  function pickOpponentTeamByRelationships(winnerTeamKey, candidates, snapshotIds){
    if (!candidates.length) return null;
    var worstTeams = [];
    var worstScore = Infinity;

    candidates.forEach(function(teamKey){
      var avg = avgRelBetweenTeams(winnerTeamKey, teamKey, snapshotIds);
      if (avg < worstScore){
        worstScore = avg;
        worstTeams = [teamKey];
      } else if (avg === worstScore){
        worstTeams.push(teamKey);
      }
    });

    return sample(worstTeams) || null;
  }

  function pickElimPairForTeam(teamKey, snapshotIds){
    var ids   = teamFromSnapshot(snapshotIds, teamKey);
    var men   = menFrom(ids);
    var women = womenFrom(ids);

    function pickOne(arr){
      if (!arr.length) return null;
      if (arr.length === 1) return arr[0];
      return sample(arr);
    }

    return {
      male:   pickOne(men),
      female: pickOne(women)
    };
  }

function resolveElimination(ep, pairs){
  var E = state.episodes[ep];
  var spec = (window.BOTS_ELIMINATION_DATA || []).find(function(x){
    return x.episode === ep;
  }) || {};

  var out = {
    name: spec.name || ("Elimination " + ep),
    description: spec.description || "",
    comments: spec.comments || {},
    skillWeights: spec.skillWeights || {},
    matchups: {},
    winningSide: null,
    highlights: []
  };

  if (!pairs || !pairs.female || !pairs.male){
    return out;
  }

  var fA = pairs.female[0] || null;
  var fB = pairs.female[1] || null;
  var mA = pairs.male[0]   || null;
  var mB = pairs.male[1]   || null;

  var duoA = [fA, mA].filter(Boolean);
  var duoB = [fB, mB].filter(Boolean);

  function duoScore(ids){
    if (!ids || !ids.length) return 0;
    var sum = ids.reduce(function(sum, id){
      return sum + scorePlayerWeighted(out.skillWeights || {}, id);
    }, 0);
    return sum / ids.length;
  }

  var sA = duoScore(duoA);
  var sB = duoScore(duoB);

  var winDuo, loseDuo, winningSide;
  if (sA === sB){
    if (Math.random() < 0.5){
      winDuo = duoA; loseDuo = duoB; winningSide = "A";
    } else {
      winDuo = duoB; loseDuo = duoA; winningSide = "B";
    }
  } else if (sA > sB){
    winDuo = duoA; loseDuo = duoB; winningSide = "A";
  } else {
    winDuo = duoB; loseDuo = duoA; winningSide = "B";
  }

  var all = winDuo.concat(loseDuo);
  all.forEach(function(id){
    if (id == null) return;
    state.stats.elimPlays[id] = (state.stats.elimPlays[id] || 0) + 1;
  });

  winDuo.forEach(function(id){
    if (id == null) return;
    state.stats.elimWins[id] = (state.stats.elimWins[id] || 0) + 1;
  });

  loseDuo.forEach(function(id){
    if (id == null) return;
    var pl = state.players.find(function(p){ return p.id === id; });
    if (pl){
      pl.alive = false;
      state.placements.eliminated.push({
        id: id,
        episode: ep,
        team: pl.team,
        reason: "elimination"
      });
    }
  });

  out.matchups = {
    female: { A: fA || null, B: fB || null },
    male:   { A: mA || null, B: mB || null }
  };
  out.winningSide = winningSide || null;
  var comments = out.comments || {};
  var pos = comments.positive || [];
  var neu = comments.neutral || [];
  var neg = comments.negative || [];

  if (all.length){
    var scored = all.map(function(pid){
      return {
        pid: pid,
        score: scorePlayerWeighted(out.skillWeights || {}, pid)
      };
    }).sort(function(a, b){
      return a.score - b.score;
    });

    var total = scored.length;
    var third = Math.ceil(total / 3);

    for (var i = 0; i < total; i++){
      var obj = scored[i];
      var pid = obj.pid;

      var bucket;
      if (i < third) bucket = pos;
      else if (i < 2 * third) bucket = neu;
      else bucket = neg;

      var template = (bucket && bucket.length)
        ? sample(bucket)
        : "{A} competes in the elimination.";

      var secondObj = scored[(i + 1) % total];
      var second = secondObj ? secondObj.pid : pid;

      var text = template
        .replaceAll("{A}", nameOf(pid))
        .replaceAll("{B}", nameOf(second));

      out.highlights.push({ pid: pid, text: text });
    }
  }

  return out;
}

  function finalData(){
    var obj = window.BOTS_FINAL_DATA || window.FINAL_DATA || {};
    if (Array.isArray(obj.stages)) return obj;
    if (Array.isArray(obj.STAGES)) return { stages: obj.STAGES };
    return { stages: [] };
  }

  function simulateFinals(){
    var F = finalData();
    var STAGES = Array.isArray(F.stages) ? F.stages.slice(0, 6) : [];
    var finalists = TEAM_KEYS.filter(function(teamKey){
      return aliveTeam(teamKey).length > 0;
    });

    var perTeamPlaces = {};
    finalists.forEach(function(k){ perTeamPlaces[k] = []; });

    var stageSummaries = [];

    STAGES.forEach(function(stage, idx){
      if (!stage) return;

      var weights = stage.skillWeights || {};
      var ranked = finalists.map(function(teamKey){
        var ids = aliveTeam(teamKey);
        var total = ids.reduce(function(sum, pid){
          return sum + scorePlayerWeighted(weights, pid);
        }, 0);
        var avg = ids.length ? (total / ids.length) : 0;
        return { teamKey: teamKey, avg: avg };
      });

      ranked.sort(function(a,b){
        if (a.avg === b.avg) return Math.random() - 0.5;
        return a.avg - b.avg;
      });

      ranked.forEach(function(entry, pos){
        if (perTeamPlaces[entry.teamKey]){
          perTeamPlaces[entry.teamKey].push(pos + 1);
        }
      });

      stageSummaries.push({
        name:        stage.name || ("Final Stage " + (idx + 1)),
        description: stage.description || "",
        skillWeights: weights,
        comments:    stage.comments || {}
      });
    });

    var order = finalists.slice().sort(function(a, b){
      var aPlaces = perTeamPlaces[a] || [];
      var bPlaces = perTeamPlaces[b] || [];
      var aAvg = aPlaces.length ? (aPlaces.reduce(function(s,v){return s+v;},0) / aPlaces.length) : 999;
      var bAvg = bPlaces.length ? (bPlaces.reduce(function(s,v){return s+v;},0) / bPlaces.length) : 999;
      if (aAvg === bAvg) return Math.random() - 0.5;
      return aAvg - bAvg;
    });

    state.placements.final = {
      first:  order[0] || null,
      second: order[1] || null,
      third:  order[2] || null
    };

    return {
      stages: stageSummaries,
      results: {
        order:         order,
        perTeamPlaces: perTeamPlaces
      }
    };
  }

  document.getElementById("btn-simulate").onclick = function(){
    var ok = TEAM_KEYS.every(function(k){
      return state.teams[k].women.filter(Boolean).length === 2 &&
             state.teams[k].men.filter(Boolean).length === 2;
    });
    if (!ok){
      alert("Please complete all team slots: 2 Women + 2 Men per team (total 32).");
      return;
    }

    setAliveFromCast();
    simulateSeason();
    state.simulated = true;
    State.save(state);

    buildLeftAccordion();
    viewCast.hidden = true;
    viewEpisode.hidden = false;
    showEpisodeSection(1, "format");

    elInfoStatus.textContent = "Simulated";
    elInfoCast.textContent   = String(aliveIds().length);
    statsPanel.style.display = "block";
  };

  function simulateSeason(){
    state.episodes   = {};
    state.ui         = {};
    state.chart      = { finalized:false, episodes:{} };
        state.stats      = {
      dailyWinsTeam:{},
      lastPlaceTeam:{},
      nominatedTeam:{},
      elimWins:{},
      elimPlays:{},
      notPicked:{}
    };
    state.placements = { final:{ first:null, second:null, third:null }, eliminated:[] };

    var FINAL_EPISODE = 12;

    for (var ep = 1; ep <= FINAL_EPISODE; ep++){
      var snapshot = aliveIds().slice();
      var E        = state.episodes[ep] = { status: snapshot };

      if (ep <= 11){
        E.events1 = genHouseEvents();
        E.daily   = computeDaily(ep, snapshot);
        E.events2 = genHouseEvents();

        var D     = E.daily || {};
        var order = D.order || [];

        if (!order.length || order.length < 2){
          continue;
        }

        var winningTeam = order[0];
        var lastTeam    = order[order.length - 1];

        D.winningTeam = winningTeam;
        D.lastTeam    = lastTeam;

        if (lastTeam){
          state.stats.lastPlaceTeam[lastTeam] =
            (state.stats.lastPlaceTeam[lastTeam] || 0) + 1;
        }

        var candidates = TEAM_KEYS.filter(function(k){
          if (k === winningTeam || k === lastTeam) return false;
          var ids = teamFromSnapshot(snapshot, k);
          return ids.length > 0;
        });

        var opponentTeam = null;
        if (candidates.length){
          opponentTeam = pickOpponentTeamByRelationships(winningTeam, candidates, snapshot);
        }

        E.voting = {
          type:         "winner_picks",
          winningTeam:  winningTeam,
          lastTeam:     lastTeam,
          opponentTeam: opponentTeam
        };

        if (opponentTeam){
          state.stats.nominatedTeam[opponentTeam] =
            (state.stats.nominatedTeam[opponentTeam] || 0) + 1;
        }

        var elimTeams = [ lastTeam ];
        if (opponentTeam) elimTeams.push(opponentTeam);

        if (elimTeams.length === 2){
          var pairA = pickElimPairForTeam(elimTeams[0], snapshot);
          var pairB = pickElimPairForTeam(elimTeams[1], snapshot);

          var femalePair = (pairA.female && pairB.female) ? [pairA.female, pairB.female] : null;
          var malePair   = (pairA.male   && pairB.male)   ? [pairA.male,   pairB.male]   : null;

          E.elimination = resolveElimination(ep, { female: femalePair, male: malePair });
        } else {
          E.elimination = null;
        }
      } else if (ep === FINAL_EPISODE){
        E.final = simulateFinals();
      }
    }

    state.chart.finalized = true;
  }

  function buildLeftAccordion(){
    elAccordion.innerHTML = "";
    var FINAL_EPISODE = 12;

    for (var e = 1; e <= FINAL_EPISODE; e++){
      var details = document.createElement("details");
      details.className = "details-ep";
      if (e === 1) details.open = true;

      var inner = '<summary>Episode '+e+'</summary><div class="section-box"><div class="section-links">';
      if (e === 1){
        inner += '<button class="btn" data-ep="'+e+'" data-sec="format">Format</button>';
      }
      inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>';

      if (e <= 11){
        inner += '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events 1</button>';
        inner += '<button class="btn" data-ep="'+e+'" data-sec="daily">Daily Challenge</button>';
        inner += '<button class="btn" data-ep="'+e+'" data-sec="events2">House Events 2</button>';
        inner += '<button class="btn" data-ep="'+e+'" data-sec="voting">Voting</button>';
        inner += '<button class="btn" data-ep="'+e+'" data-sec="elimination">Elimination</button>';
      } else {
        for (var s = 1; s <= 6; s++){
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final'+s+'">Final Stage '+s+'</button>';
        }
        inner += '<button class="btn" data-ep="'+e+'" data-sec="final_results">Final Results</button>';
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
    var div = document.createElement("div");
    div.className = "team-wrap";
    var teamObj = state.teams[teamKey];
    div.style.borderColor = (teamObj && teamObj.color) ? teamObj.color : "var(--glass-border)";
    return div;
  }

  function showEpisodeSection(ep, section){
    state.lastView={ep:ep,section:section}; State.save(state);
    epActions.innerHTML=""; var S=state.episodes[ep]; epTitle.textContent="Episode "+ep; epSub.textContent="";
    if(!S){ epContent.innerHTML='<p class="muted">No data.</p>'; addProceed(ep, section); return; }

    if(section==="format" && ep===1){
      epSub.textContent="Season Format";
      var box=document.createElement("div"); box.className="mini-card note";
box.innerHTML = 
  "During each Challenge, teams compete in order to become the Power Team, who have the ability to place one team of their decision into the Arena. The other couple going into the Arena is the last placing team of the daily Challenge. Once in the Arena, a team must decide one male-female pair to compete. The losing pair in the Arena go home, and leave their team short two players. Teams can compete with only two players, and have potential to make a greater share of the final's $250,000.";
      epContent.innerHTML=""; epContent.appendChild(box);
      addProceed(ep, section); return;
    }

    if (section === "status") {
      epSub.textContent = "Remaining players";
      var snap = S.status || [];
      var byTeam = TEAM_KEYS.map(function (k) {
        return { key: k, name: state.teams[k].name, ids: teamFromSnapshot(snap, k) };
      }).filter(function (t) { return t.ids.length; });

      epContent.innerHTML = "";

      byTeam.forEach(function (t) {
        var wrap = teamWrap(t.key);

        var hw = document.createElement("div");
        hw.className = "status-title";
        hw.textContent = t.name + " — " + t.ids.length + " players";
        wrap.appendChild(hw);
        var idsInOrder = womenFrom(t.ids).concat(menFrom(t.ids));

        var row = document.createElement("div");
        row.className = "team-row";

        idsInOrder.forEach(function (pid) {
          row.appendChild(statusCard(pid, "", teamColorOf(pid)));
        });

        wrap.appendChild(row);
        epContent.appendChild(wrap);
      });

      addProceed(ep, section);
      return;
    }


    if(section==="events1" || section==="events2"){
      var evs = (section==="events1") ? (S.events1||[]) : (S.events2||[]);
      epSub.textContent = (section==="events1" ? "House Events 1" : "House Events 2");
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

    if(section==="daily" && ep<=11){
      var D=S.daily||{}; var spec=dailySpec(ep)||{}; var snapStatus=S.status||[];
      var name = D.name || "Daily Challenge";
      epContent.innerHTML="";
      var title=document.createElement("div"); title.className="challenge-name"; title.textContent=name;
      var desc=document.createElement("div"); desc.className="mini-card note"; desc.innerHTML='<div><strong>Description:</strong> '+(D.description||"")+'</div>';
      epContent.appendChild(title); epContent.appendChild(desc);

      var hlContainer=document.createElement("div");
      epContent.appendChild(hlContainer);

      var btnHighlights=document.createElement("button"); btnHighlights.className="btn"; btnHighlights.textContent="Show Highlights";
      btnHighlights.onclick=function(){
        renderHighlightsInto(hlContainer, spec.comments||{}, spec.skillWeights||{}, snapStatus.slice(), true);
        btnHighlights.remove();
      };
      epActions.appendChild(btnHighlights);

      var btnResults=document.createElement("button"); btnResults.className="btn"; btnResults.textContent="Reveal Placements";
      btnResults.onclick=function(){
        var order = (D.order||[]).slice().reverse();
        for(var i=0;i<order.length;i++){
          var teamKey = order[i];
          var wrap    = teamWrap(teamKey);
          labelUnder(
            wrap,
            ordinal(order.length - i) + " Place — " + state.teams[teamKey].name
          );

          var idsTeam   = teamFromSnapshot(S.status || [], teamKey);
          var idsOrdered = womenFrom(idsTeam).concat(menFrom(idsTeam));

          var row = document.createElement("div");
          row.className = "team-row";

          idsOrdered.forEach(function(pid){
            row.appendChild(statusCardSquare(pid, "", teamColorOf(pid)));
          });

          wrap.appendChild(row);
          epContent.appendChild(wrap);
        }
        btnResults.disabled=true;
      };
      epActions.appendChild(btnResults);

      addProceed(ep, section); return;
    }

    if (section === "voting" && ep <= 11) {
      epSub.textContent = "Team Voting";
      epContent.innerHTML = "";

      var D = S.daily || {};
      var V = S.voting || {};
      var snap = S.status || [];

      var winningTeam = D.winningTeam || (D.winners && D.winners[0]) || null;
      var lastTeam    = D.lastTeam || null;

      if (!winningTeam && D.order && D.order.length) {
        winningTeam = D.order[0];
        lastTeam    = D.order[D.order.length - 1];
      }

      var opponent = V.opponentTeam || null;

      function buildTeamBox(teamKey) {
        var wrap = teamWrap(teamKey);
        var idsTeam = teamFromSnapshot(snap, teamKey);
        var idsOrdered = womenFrom(idsTeam).concat(menFrom(idsTeam));

        var row = document.createElement("div");
        row.className = "team-row";

        idsOrdered.forEach(function (pid) {
          row.appendChild(statusCardSquare(pid, "", teamColorOf(pid)));
        });

        wrap.appendChild(row);
        return wrap;
      }

      if (winningTeam && state.teams[winningTeam]) {
        var winBox = buildTeamBox(winningTeam);
        epContent.appendChild(winBox);
        var info = document.createElement("div");
        info.className = "center";
        info.innerHTML =
          "<p><strong>" + state.teams[winningTeam].name + "</strong> has won the daily challenge.</p>" +
          "<p>They have the power to nominate one team to go straight into elimination against the last-placing team and they chose...</p>";

        epContent.appendChild(info);
      } else {
        epContent.innerHTML = "<p class=\"muted\">No winning team information available.</p>";
      }

      var targetContainer = document.createElement("div");
      epContent.appendChild(targetContainer);
      var btnVote = document.createElement("button");
      btnVote.className = "btn";
      btnVote.textContent = "Reveal Vote";
      btnVote.onclick = function () {
        targetContainer.innerHTML = "";

        if (opponent && state.teams[opponent]) {
          var oppBox = buildTeamBox(opponent);
          targetContainer.appendChild(oppBox);

          var lastLabel =
            lastTeam && state.teams[lastTeam]
              ? "<strong>" + state.teams[lastTeam].name + "</strong>"
              : "<strong>the last-placing team</strong>";
          var text = document.createElement("div");
          text.className = "center";
          text.innerHTML =
            "<p><strong>" + state.teams[opponent].name +
            "</strong> will be going down in the elimination against " +
            lastLabel + ".</p>";

          targetContainer.appendChild(text);
        } else {
          targetContainer.innerHTML = '<p class="muted">No opponent team could be chosen.</p>';
        }

        btnVote.disabled = true;
      };

      epActions.appendChild(btnVote);

      addProceed(ep, section);
      return;
    }

    if (section === "elimination" && ep <= 11) {
      var E = S.elimination || {};
      epSub.textContent = E.name || "Elimination";
      epContent.innerHTML = "";

      function teamKeyOf(pid) {
        var p = state.players.find(function (x) { return x.id === pid; });
        return p ? p.team : null;
      }

      var femaleMatch = E.matchups && E.matchups.female;
      var maleMatch   = E.matchups && E.matchups.male;

      var duoContainer = document.createElement("div");
      duoContainer.className = "matchup";

      var duoCards = { A: [], B: [] };

      function buildDuoCol(side, fId, mId) {
        if (!fId && !mId) return null;

        var col = document.createElement("div");
        col.className = "mini-card";

        var row = document.createElement("div");
        row.className = "team-row";

        if (fId) {
          var cF = statusCardSquare(fId, null, teamColorOf(fId));
          duoCards[side].push(cF);
          row.appendChild(cF);
        }
        if (mId) {
          var cM = statusCardSquare(mId, null, teamColorOf(mId));
          duoCards[side].push(cM);
          row.appendChild(cM);
        }

        var teamKey  = teamKeyOf(fId || mId);
        var teamName = teamKey && state.teams[teamKey] ? state.teams[teamKey].name : "their team";
        var names    = [fId, mId].filter(Boolean).map(nameOf).join(" & ");

        var caption = document.createElement("div");
        caption.className = "badge";
        caption.textContent = names + " were chosen to compete from " + teamName;

        col.appendChild(row);
        col.appendChild(caption);

        if (fId || mId) {
          col.style.borderColor = teamColorOf(fId || mId);
          col.style.borderWidth = "3px";
        }

        return col;
      }

      if (femaleMatch && maleMatch) {
        var colA = buildDuoCol("A", femaleMatch.A, maleMatch.A);
        var colB = buildDuoCol("B", femaleMatch.B, maleMatch.B);

        if (colA) duoContainer.appendChild(colA);

        var vs = document.createElement("div");
        vs.className = "arrow";
        vs.textContent = "vs";
        duoContainer.appendChild(vs);

        if (colB) duoContainer.appendChild(colB);

        epContent.appendChild(duoContainer);
      }

      var descBox = document.createElement("div");
      descBox.className = "mini-card note";
      descBox.innerHTML =
        '<div class="challenge-name">' + (E.name || "Elimination") + '</div>' +
        '<div><strong>Description:</strong> ' + (E.description || "") + '</div>';
      epContent.appendChild(descBox);

      var hlWrap = document.createElement("div");
      epContent.appendChild(hlWrap);

      var btnH = document.createElement("button");
      btnH.className = "btn";
      btnH.textContent = "Show Highlights";
      btnH.onclick = function () {
        var list = E.highlights || [];
        if (!list.length) {
          hlWrap.innerHTML = '<div class="muted">No highlights.</div>';
        } else {
          var rowH = document.createElement("div");
          rowH.className = "team-row";
          list.slice(0, 6).forEach(function (h) {
            var card = document.createElement("div");
            card.className = "mini-card elim-highlight";

            var col = teamColorOf(h.pid);
            card.style.borderColor = col;
            card.style.borderWidth = "3px";
            card.style.boxShadow = "0 0 8px " + col + ", 0 0 16px " + col;

            card.innerHTML =
              '<div class="row tiny-avatars"><img class="avatar xs" src="' +
              picOf(h.pid) +
              '" alt=""></div><div>' +
              h.text +
              "</div>";
            rowH.appendChild(card);
          });
          hlWrap.innerHTML = "";
          hlWrap.appendChild(rowH);
        }
        btnH.disabled = true;
      };
      epActions.appendChild(btnH);

      var btnR = document.createElement("button");
      btnR.className = "btn";
      btnR.textContent = "Reveal Results";
      btnR.onclick = function () {
        var side = E.winningSide || null;
        if (!side) return;
        var other = side === "A" ? "B" : "A";

        (duoCards[side] || []).forEach(function (c) {
          c.classList.add("win");
        });
        (duoCards[other] || []).forEach(function (c) {
          c.classList.add("lose");
        });

        btnR.disabled = true;
      };
      epActions.appendChild(btnR);

      addProceed(ep, section);
      return;
    }

  if (/^final[1-6]$/.test(section) && ep === 12){
    var idx = parseInt(section.replace("final",""),10) - 1;
    var ST  = (S.final && S.final.stages) || [];
    var stage = ST[idx] || null;

    epSub.textContent = stage && stage.name
      ? stage.name
      : ("Final Stage " + (idx + 1));

    epContent.innerHTML = "";

    if (stage && stage.description){
      var desc = document.createElement("div");
      desc.className = "mini-card note";
      desc.innerHTML = "<div><strong>Description:</strong> " + stage.description + "</div>";
      epContent.appendChild(desc);
    }

    var highlightsContainer = document.createElement("div");
    epContent.appendChild(highlightsContainer);

    var btnHighlights = document.createElement("button");
    btnHighlights.className = "btn";
    btnHighlights.textContent = "Show Highlights";
    btnHighlights.onclick = function(){
      if (stage){
        renderHighlightsInto(
          highlightsContainer,
          stage.comments || {},
          stage.skillWeights || {},
          aliveIds(),
          true
        );
        btnHighlights.disabled = true;
      }
    };
    epActions.appendChild(btnHighlights);

    addProceed(ep, section);
    return;
  }

  if (section === "final_results" && ep === 12){
    epSub.textContent = "Final Results";

    var FR    = (S.final && S.final.results) || {};
    var order = FR.order || [];
    epContent.innerHTML = "";

    if (!order.length){
      epContent.innerHTML = '<p class="muted">No final results.</p>';
      addProceed(ep, section);
      return;
    }

    function finalistTeamRow(teamKey, label){
      if (!teamKey) return;

      var ids = aliveTeam(teamKey);
      if (!ids.length) return;

      var teamObj = state.teams[teamKey] || {};
      var color   = teamObj.color || "var(--glass-border)";
      var name    = teamObj.name  || teamKey;

      var container = document.createElement("div");
      container.className = "mini-card";
      container.style.borderColor  = color;
      container.style.borderWidth  = "3px";
      container.style.borderStyle  = "solid";
      container.style.borderRadius = "14px";

      var cap = document.createElement("div");
      cap.className = "placements-caption";
      cap.textContent = label + " — " + name;
      container.appendChild(cap);

      var row = document.createElement("div");
      row.className = "placements-row";
      var count = 0;

      var arr = womenFrom(ids).concat(menFrom(ids));
      arr.forEach(function(pid){
        if (count > 0 && count % 6 === 0){
          container.appendChild(row);
          row = document.createElement("div");
          row.className = "placements-row";
        }
        row.appendChild(statusCardSquare(pid, "", teamColorOf(pid)));
        count++;
      });
      if (row.childNodes.length) container.appendChild(row);

      epContent.appendChild(container);
    }

    var btnRow = document.createElement("div");
    btnRow.className = "actions-row";
    epContent.appendChild(btnRow);

    function addButton(label, handler){
      var b = document.createElement("button");
      b.className = "btn";
      b.textContent = label;
      b.onclick = function(){
        handler();
        btnRow.removeChild(b);
      };
      btnRow.appendChild(b);
      return b;
    }

    var idx = order.length - 1;

    function placeLabel(posIndex){
      if (posIndex === 0) return "Winners";
      var place = posIndex + 1;
      if (place === order.length) return "Last Place";
      if (place === 2) return "2nd Place";
      if (place === 3) return "3rd Place";
      return ordinal(place) + " Place";
    }

    function addNextButton(){
      if (idx < 0) return;
      var label =
        (idx === 0)
          ? "Reveal Winners"
          : (idx === order.length - 1
              ? "Reveal Last Place"
              : "Reveal " + placeLabel(idx));

      addButton(label, function(){
        finalistTeamRow(order[idx], placeLabel(idx));
        idx--;
        addNextButton();
      });
    }

    addNextButton();
    addProceed(ep, section);
    return;
  }
  }

  function addProceed(ep, section){
    var order = [];

    if (ep <= 11){
      order = (ep === 1
        ? ["format","status","events1","daily","events2","voting","elimination"]
        : ["status","events1","daily","events2","voting","elimination"]);
    } else {
      order = ["status","final1","final2","final3","final4","final5","final6","final_results"];
    }

    var idx = order.indexOf(section);
    var btn = document.createElement("button"); btn.className="btn proceed"; btn.textContent="Proceed";
    btn.onclick=function(){
      if(section==="elimination" && ep<11){
        showEpisodeSection(ep+1,"status");
        btn.remove();
        return;
      }
      if(section==="final_results"){ showStatisticsPanel("placements"); btn.remove(); return; }
      if(idx>=0 && idx<order.length-1){ showEpisodeSection(ep, order[idx+1]); btn.remove(); }
    };
    epActions.appendChild(btn);
  }

function showStatisticsPanel(kind){
  epSub.textContent = "";
  epActions.innerHTML = "";

  if (kind === "placements"){
    epTitle.textContent = "Placements";
    epContent.innerHTML = "";

    var finalInfo = (state.placements && state.placements.final) || {};
    var finalsOrder = [];
    if (finalInfo.first)  finalsOrder.push({ team: finalInfo.first,  label: "Winners" });
    if (finalInfo.second) finalsOrder.push({ team: finalInfo.second, label: "2nd Place" });
    if (finalInfo.third)  finalsOrder.push({ team: finalInfo.third,  label: "3rd Place" });

    function renderFinalTeamRow(entry){
      var teamKey = entry.team;
      if (!teamKey) return;
      var teamObj = state.teams[teamKey];
      if (!teamObj) return;

      var ids = aliveTeam(teamKey);
      if (!ids.length) return;

      var container = document.createElement("div");
      container.className = "placements-final";
      container.style.borderColor = teamObj.color || teamColorOf(ids[0]) || "var(--accent)";
      container.style.borderWidth = "2px";
      container.style.borderStyle = "solid";
      container.style.borderRadius = "14px";

      var cap = document.createElement("div");
      cap.className = "ep-subtitle";
      cap.textContent = entry.label + " — " + teamObj.name;
      container.appendChild(cap);

      var row = document.createElement("div");
      row.className = "placements-row";

      var arr = womenFrom(ids).concat(menFrom(ids));
      arr.forEach(function(pid){
        row.appendChild(statusCardSquare(pid, "", teamColorOf(pid)));
      });

      container.appendChild(row);
      epContent.appendChild(container);
    }

    finalsOrder.forEach(renderFinalTeamRow);
    var elim = (state.placements && state.placements.eliminated)
      ? state.placements.eliminated.slice()
      : [];

    if (elim.length){
      var heading = document.createElement("h4");
      heading.textContent = "Elimination Order";
      epContent.appendChild(heading);
      elim.sort(function(a, b){ return a.episode - b.episode; });
      var allPlayers = state.players || [];
      var totalWomen = allPlayers.filter(function(p){ return p.gender === "female"; }).length;
      var totalMen   = allPlayers.filter(function(p){ return p.gender === "male"; }).length;

      var elimWomen = [];
      var elimMen   = [];

      elim.forEach(function(rec){
        var pid = rec.id;
        var pl = allPlayers.find(function(p){ return p.id === pid; });
        if (!pl) return;
        if (pl.gender === "female") elimWomen.push(pid);
        else if (pl.gender === "male") elimMen.push(pid);
      });

      var placeById = {};

      function assignPlacements(list, totalCount){
        list.forEach(function(pid, idx){
          var place = totalCount - idx;
          placeById[pid] = place;
        });
      }

      assignPlacements(elimWomen, totalWomen);
      assignPlacements(elimMen, totalMen);

      function ordinal(n){
        var s = ["th","st","nd","rd"], v = n % 100;
        return n + (s[(v-20)%10] || s[v] || s[0]);
      }

      var row = document.createElement("div");
      row.className = "placements-row";
      var count = 0;

      var elimDisplay = elim.slice().reverse();

      elimDisplay.forEach(function(rec){
        var pid = rec.id;
        var card = statusCardSquare(pid, "", teamColorOf(pid));

        var place = placeById[pid];
        if (place != null){
          labelUnder(card, ordinal(place) + " Place", "placements-label");
        }

        row.appendChild(card);
        count++;
        if (count >= 6){
          epContent.appendChild(row);
          row = document.createElement("div");
          row.className = "placements-row";
          count = 0;
        }
      });

      if (row.childNodes.length){
        epContent.appendChild(row);
      }
}

    var btn = document.createElement("button");
    btn.className = "btn proceed";
    btn.textContent = "Proceed";
    btn.onclick = function(){
      showStatisticsPanel("stats");
      btn.remove();
    };
    epActions.appendChild(btn);
    return;
  }

  if (kind === "stats") {
    epTitle.textContent = "Other Statistics";
    epSub.textContent = "Season leaders";
    epContent.innerHTML = "";

    var stats = state.stats || {};

    function extractTeamLeaders(statMap) {
      var entries = Object.keys(statMap || {}).map(function (teamKey) {
        return {
          teamKey: teamKey,
          value: statMap[teamKey] || 0
        };
      }).filter(function (e) {
        return e.value > 0 && state.teams[e.teamKey];
      });

      if (!entries.length) {
        return { names: ["—"], value: "—" };
      }

      var maxVal = entries.reduce(function (m, e) {
        return Math.max(m, e.value);
      }, 0);

      var top = entries.filter(function (e) {
        return e.value === maxVal;
      });

      var labels = top.map(function (e) {
        var team = state.teams[e.teamKey];
        return team && team.name ? team.name : e.teamKey;
      });

      var valueLabel = maxVal + " time" + (maxVal !== 1 ? "s" : "");
      return { names: labels, value: valueLabel };
    }

    function extractPlayerLeaders(statMap) {
      var entries = Object.keys(statMap || {}).map(function (pidStr) {
        var pid = parseInt(pidStr, 10);
        return {
          pid: pid,
          value: statMap[pidStr] || 0
        };
      }).filter(function (e) {
        return e.value > 0 && state.players.some(function (p) {
          return p.id === e.pid;
        });
      });

      if (!entries.length) {
        return { names: ["—"], value: "—" };
      }

      var maxVal = entries.reduce(function (m, e) {
        return Math.max(m, e.value);
      }, 0);

      var top = entries.filter(function (e) {
        return e.value === maxVal;
      });

      var labels = top.map(function (e) {
        return nameOf(e.pid);
      });

      var valueLabel = maxVal + " elimination" + (maxVal !== 1 ? "s" : "");
      return { names: labels, value: valueLabel };
    }

    var table = document.createElement("table");
    table.className = "stats-table";

    var thead = document.createElement("thead");
    var headRow = document.createElement("tr");

    var thCat = document.createElement("th");
    thCat.className = "stat-cat";
    thCat.textContent = "Category";

    var thName = document.createElement("th");
    thName.className = "stat-name";
    thName.textContent = "Name";

    var thVal = document.createElement("th");
    thVal.className = "stat-value";
    thVal.textContent = "Value";

    headRow.appendChild(thCat);
    headRow.appendChild(thName);
    headRow.appendChild(thVal);
    thead.appendChild(headRow);

    var tbody = document.createElement("tbody");

    function addRow(label, leaders) {
      var tr = document.createElement("tr");

      var tdCat = document.createElement("td");
      tdCat.className = "stat-cat";
      tdCat.textContent = label;

      var tdName = document.createElement("td");
      tdName.className = "stat-name";
      tdName.innerHTML = (leaders.names || ["—"]).join("<br>");

      var tdVal = document.createElement("td");
      tdVal.className = "stat-value";
      tdVal.textContent = leaders.value || "—";

      tr.appendChild(tdCat);
      tr.appendChild(tdName);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    var daily = extractTeamLeaders(stats.dailyWinsTeam || {});
    addRow("Most Daily Wins (Team)", daily);

    var lastPlace = extractTeamLeaders(stats.lastPlaceTeam || {});
    addRow("Most Times Last-Place (Team)", lastPlace);

    var nominated = extractTeamLeaders(stats.nominatedTeam || {});
    addRow("Most Times Nominated (Team)", nominated);

    var elim = extractPlayerLeaders(stats.elimPlays || {});
    addRow("Most Times in the Elimination (Player)", elim);

    table.appendChild(thead);
    table.appendChild(tbody);
    epContent.appendChild(table);

    epActions.innerHTML = "";
    var btn2 = document.createElement("button");
    btn2.className = "btn proceed";
    btn2.textContent = "Proceed";
    btn2.onclick = function () {
      showStatisticsPanel("chart");
      btn2.remove();
    };
    epActions.appendChild(btn2);

    return;
  }

  if (kind === "chart") {
    epTitle.textContent = "Season Chart";
    epContent.innerHTML = "";
    var btnChart = document.createElement("button");
    btnChart.className = "btn";
    btnChart.textContent = "Open Season Chart";
    btnChart.onclick = function () {
      location.href = "./season_chart.html";
    };
    epContent.appendChild(btnChart);
  }
}
})();