(function(){
  "use strict";

  var IMG_BLANK = "BlankProfile.webp";
  var TEAM_COLOURS = [
    "#d2b48c", // sandy
    "#d4af37", // gold
    "#cd7f32", // bronze
    "#78866b", // camo green
    "#228b22", // forest green
    "#654321", // dark brown
    "#800000", // maroon
    "#c19a6b"  // khaki
  ];
  var GOLD   = "#d4af37";
  var SILVER = "#b0b9c6";
  var BRONZE = "#cd7f32";
  var RED    = "#b30000";
  var GREEN  = "#008000";

  function rnd(n){ return Math.floor(Math.random() * n); }
  function sample(arr){ return arr && arr.length ? arr[rnd(arr.length)] : undefined; }
  function shuffle(arr){ return arr.map(function(v){ return [Math.random(), v];}).sort(function(a,b){ return a[0]-b[0];}).map(function(x){ return x[1];}); }
  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function makeDescBox(text){
  var b = document.createElement("div");
  b.className = "mini-card note desc-box";

  var inner = document.createElement("div");
  inner.textContent = (text == null ? "" : String(text));

  b.appendChild(inner);
  return b;
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
        src = [].concat(tag(pd.males, "male"), tag(pd.females, "female"), tag(pd.others, null));
      } else {
        src = [];
      }
    }
    window.PLAYERS = src;
    window.PLAYERS_BY_ID = Object.fromEntries((src || []).map(function(p){ return [p.id, p]; }));
  })();

  function allShowsOf(p){
    if (Array.isArray(p.shows) && p.shows.length){ return p.shows.filter(Boolean); }
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
    return (roster || []).filter(function(p){ return playerMatchesPrefsForRandomize(p, prefs); });
  }

  var KEY = "challenge-wotw-season";
  var State = {
    load: function(){
      try {
        return JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY)) || null;
      } catch(e){ return null; }
    },
    save: function(s){
      var raw = JSON.stringify(s);
      sessionStorage.setItem(KEY, raw);
      try { localStorage.setItem(KEY, raw); } catch(e){}
    },
    clear: function(){
      sessionStorage.removeItem(KEY);
      try { localStorage.removeItem(KEY); } catch(e){}
    }
  };

var VETS_TOTAL  = 16;
var PROS_TOTAL  = 18;

var VETS_SLOTS = [];
var PROS_SLOTS = [];
(function buildSlotDefs(){
  for(var i=0; i<8; i++){
    VETS_SLOTS.push({ gender: "male", stripe: "veteran", idx: i });
  }
  for(var j=0; j<8; j++){
    VETS_SLOTS.push({ gender: "female", stripe: "veteran", idx: 8 + j });
  }

  for(var k=0; k<9; k++){
    PROS_SLOTS.push({ gender: "male", stripe: "prospect", idx: k });
  }
  for(var l=0; l<9; l++){
    PROS_SLOTS.push({ gender: "female", stripe: "prospect", idx: 9 + l });
  }
})();

  function emptySlots(n){ return Array.from({length: n}).map(function(){ return null; }); }
  var state = State.load() || {
    seed: Math.random().toString(36).slice(2,8).toUpperCase(),
    castVets: emptySlots(VETS_TOTAL),
    castProspects: emptySlots(PROS_TOTAL),
    players: [],
    pairs: [],
    relationships: {},
    profiles: {},
    episodes: {},
    stats: { tribunalWinsTeam:{}, tribunalWinsPlayer:{}, timesNominated:{}, elimWinsPlayer:{} },
    placements: { ordered: [] },
    simulated: false,
    lastView: null
  };

(function syncCastSlotArrays(){
  function fix(arr, n){
    var out = Array.isArray(arr) ? arr.slice(0, n) : [];
    while(out.length < n) out.push(null);
    return out;
  }
  state.castVets = fix(state.castVets, VETS_TOTAL);
  state.castProspects = fix(state.castProspects, PROS_TOTAL);
})();

  var elTeams  = document.getElementById("teams-grid");
  var elFilterShow = document.getElementById("filter-show");
  var elInfoCast = document.getElementById("info-cast-size");
  var elInfoSeed = document.getElementById("info-seed");
  var elInfoStatus = document.getElementById("info-status");
  var elAccordion = document.getElementById("episode-accordion");
  var viewCast   = document.getElementById("view-cast");
  var viewEpisode = document.getElementById("view-episode");
  var epTitle = document.getElementById("ep-title");
  var epSub   = document.getElementById("ep-subtitle");
  var epContent = document.getElementById("ep-content");
  var epActions = document.getElementById("ep-actions");
  var statsPanel = document.getElementById("stats-panel");

(function initAutoHideButtons(){
  if(!epContent || !epActions) return;

  function shouldKeep(btn){
    if(!btn || btn.tagName !== "BUTTON") return true;
    if(btn.dataset && (btn.dataset.keep === "1" || btn.dataset.persist === "1")) return true;
    var t = (btn.textContent || "").trim().toLowerCase();
    if(t === "proceed" || t.startsWith("proceed")) return true;
    if(btn.id === "btnProceed") return true;
    if(btn.classList.contains("proceed") || btn.classList.contains("proceed-btn")) return true;

    return false;
  }

  function handler(e){
    var btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if(!btn) return;
    if(!(epActions.contains(btn) || epContent.contains(btn))) return;

    if(shouldKeep(btn)) return;
    setTimeout(function(){
      if(btn && btn.isConnected) btn.style.display = "none";
    }, 0);
  }

  epActions.addEventListener("click", handler, true);
  epContent.addEventListener("click", handler, true);
})();

  function relKey(a,b){ return a < b ? (a + "|" + b) : (b + "|" + a); }
  function rel(a,b){ return state.relationships[relKey(a,b)] ?? 0; }
  function applyRelDelta(a, b, delta){
    if(!a || !b || a === b) return;
    var k = relKey(a,b);
    var cur = state.relationships[k] ?? 0;
    state.relationships[k] = clamp(cur + (delta || 0), -5, 5);
  }

  function recordElim(pid, ep){
    if(!pid) return;
    state.elimHistory = state.elimHistory || [];
    state.elimHistory.push({ pid: pid, ep: ep });
  }

  function skillOf(pid, key){
    var s = state.profiles[pid] && state.profiles[pid][key];
    var v = (typeof s === "number" ? s : 0);
    return clamp(v, -3, 3);
  }

  function scorePlayerWeighted(weights, pid){
    var total = 0;
    for(var k in (weights || {})){
      if(Object.prototype.hasOwnProperty.call(weights, k)){
        var w = +weights[k] || 0;
        var mult = 1 + (skillOf(pid, k) * 0.1);
        total += w * mult;
      }
    }
    return total;
  }
  function scorePairWeighted(weights, pair){
    return scorePlayerWeighted(weights, pair.prospect) + scorePlayerWeighted(weights, pair.vet);
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
    (ids || []).forEach(function(pid){ var d = rollLuckDelta(); if(d) m[pid] = d; });
    return m;
  }
  function scorePlayerWeightedWithLuck(weights, pid, luckMap){
    return scorePlayerWeighted(weights, pid) + (luckMap[pid] || 0);
  }

  function nameOf(pid){ var p = state.players.find(function(x){ return x.id === pid; }); return p ? (p.nickname || p.name || pid) : pid; }
  function picOf(pid){ var p = state.players.find(function(x){ return x.id === pid; }); return p ? (p.image || IMG_BLANK) : IMG_BLANK; }

  function asEntry(p){
    return {
      id: p.id,
      name: p.name || p.nickname || p.id,
      nickname: p.nickname || p.name || p.id,
      image: p.image || (p.id ? ("././contestant_pictures/" + p.id + ".webp") : IMG_BLANK),
      gender: p.gender || "unknown",
      show: p.show || ""
    };
  }

  function ensureCastPickCSS(){
    if (document.getElementById("cast-pick-css")) return;
    var css = `
      .pick-grid{ display:grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap:14px; }
      @media (max-width: 960px){ .pick-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
      .pick-card{ display:flex; flex-direction:column; align-items:center; gap:10px; padding:14px; border-radius:14px;
        background:rgba(20,22,30,.68); border:1px solid var(--glass-border); box-shadow:var(--soft-shadow);
        min-height:240px; text-align:center; width:100%; box-sizing:border-box; }
      .pick-card .avatar{ width:88px; height:88px; border-radius:50%; object-fit:cover; }
      .pick-card select{ width:220px; max-width:100%; background:rgba(15,17,22,.9); border:1px solid rgba(120,130,155,.35);
        color:#e9eefb; border-radius:10px; padding:10px 12px; outline:none; }
      .pick-card select:focus { box-shadow:0 0 0 2px rgba(120,180,255,.35); }
      .pick-card .btn { width:220px; max-width:100%; }
    `;
    var st = document.createElement("style"); st.id = "cast-pick-css"; st.textContent = css; document.head.appendChild(st);
  }

  function buildPickCard(slotInfo, current, slotIndex, group){
    var selectId = group + "_sel_" + slotIndex;
    var genderNeeded = slotInfo.gender;
    var stripe = slotInfo.stripe;
    var label = current ? (current.nickname || current.name) : (stripe.charAt(0).toUpperCase() + stripe.slice(1)) + " " + (slotIndex+1);
    var pImg = current ? current.image : IMG_BLANK;
    var card = document.createElement("div");
    card.className = "pick-card";
    card.dataset.group = group;
    card.dataset.slot = slotIndex;
    card.innerHTML =
      '<img class="avatar" src="'+pImg+'" alt="">' +
      '<label for="'+selectId+'" class="name">'+label+'</label>' +
      '<select class="pick-player" id="'+selectId+'" name="'+selectId+'" data-group="'+group+'" data-slot="'+slotIndex+'" autocomplete="off"></select>' +
      '<button class="btn btn-custom" type="button" data-group="'+group+'" data-slot="'+slotIndex+'">Custom Player</button>';
    var select = card.querySelector("select");
    var roster = window.PLAYERS || [];
    var showFilter = elFilterShow.value;
    var filtered = roster.filter(function(r){
      var okShow = (!showFilter || playerHasShow(r, showFilter));
      return okShow && r.gender === genderNeeded;
    });
    var opts = ['<option value="">Choose</option>'];
    filtered.forEach(function(r){
      var sel = (current && r.id === current.id) ? " selected" : "";
      opts.push('<option value="'+r.id+'"'+sel+'>'+ (r.name || r.nickname || r.id) +'</option>');
    });
    select.innerHTML = opts.join("");
    return card;
  }

  function buildCastGrid(){
    ensureCastPickCSS();
    elTeams.innerHTML = "";
    var vetsBox = document.createElement("div"); vetsBox.className = "team-box";
    vetsBox.innerHTML = '<div class="team-head"><div class="label">Veterans</div><div class="team-tag">'+VETS_TOTAL+' slots</div></div>';
    var vetsGrid = document.createElement("div"); vetsGrid.className = "pick-grid";
    VETS_SLOTS.forEach(function(info, idx){
      var card = buildPickCard(info, state.castVets[idx], idx, "vets");
      vetsGrid.appendChild(card);
    });
    vetsBox.appendChild(vetsGrid);
    elTeams.appendChild(vetsBox);
    var prosBox = document.createElement("div"); prosBox.className = "team-box";
    prosBox.innerHTML = '<div class="team-head"><div class="label">Prospects</div><div class="team-tag">'+PROS_TOTAL+' slots</div></div>';
    var prosGrid = document.createElement("div"); prosGrid.className = "pick-grid";
    PROS_SLOTS.forEach(function(info, idx){
      var card = buildPickCard(info, state.castProspects[idx], idx, "pros");
      prosGrid.appendChild(card);
    });
    prosBox.appendChild(prosGrid);
    elTeams.appendChild(prosBox);
    elTeams.querySelectorAll("select.pick-player").forEach(function(sel){
      sel.onchange = function(e){
        var group = e.target.dataset.group;
        var idx   = +e.target.dataset.slot;
        var id    = e.target.value;
        if(!id){
          if(group === "vets"){ state.castVets[idx] = null; }
          else { state.castProspects[idx] = null; }
          State.save(state);
          return buildCastGrid();
        }
        var p = window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id];
        if(!p) return;
        var info = (group === "vets") ? VETS_SLOTS[idx] : PROS_SLOTS[idx];
        if(p.gender !== info.gender) return;
        var arr = (group === "vets") ? state.castVets : state.castProspects;
        for(var i=0; i<arr.length; i++){
          if(i !== idx && arr[i] && arr[i].id === id){ arr[i] = null; }
        }
        var entry = asEntry(p);
        if(group === "vets"){ entry.stripe = "veteran"; entry.gender = info.gender; state.castVets[idx] = entry; }
        else { entry.stripe = "prospect"; entry.gender = info.gender; state.castProspects[idx] = entry; }
        State.save(state);
        buildCastGrid();
      };
    });

    elTeams.querySelectorAll(".btn-custom").forEach(function(btn){
      btn.onclick = function(){ openCustomModal(btn.dataset.group, +btn.dataset.slot); };
    });

    var total = state.castVets.filter(Boolean).length + state.castProspects.filter(Boolean).length;
    elInfoCast.textContent = total + " / " + (VETS_TOTAL + PROS_TOTAL);
  }

  var customModal = document.createElement("dialog");
  customModal.className = "antm-modal";
  customModal.innerHTML =
    '<form id="custom-form" method="dialog" autocomplete="on">' +
      '<h3>Add Custom Player</h3>' +
      '<label for="cp-name">Full Name</label><input name="cp-name" id="cp-name" required autocomplete="name" />' +
      '<label for="cp-nickname">Nickname</label><input name="cp-nickname" id="cp-nickname" required autocomplete="nickname" />' +
      '<label for="cp-image">Image URL</label><input name="cp-image" id="cp-image" placeholder="https://..." autocomplete="url" />' +
      '<menu><button type="button" class="btn" id="modal-cancel">Cancel</button>' +
      '<button type="submit" class="btn" id="modal-add">Add</button></menu>' +
    '</form>';
  document.body.appendChild(customModal);

  function openCustomModal(group, slot){
    customModal.showModal();
    var form = customModal.querySelector("#custom-form");
    var cancelBtn = customModal.querySelector("#modal-cancel");
    form.onsubmit = function(ev){
      ev.preventDefault();
      var name = form.querySelector("#cp-name").value.trim();
      var nickname = form.querySelector("#cp-nickname").value.trim();
      var image = form.querySelector("#cp-image").value.trim();
      if(!name || !nickname) return;
      var info = (group === "vets") ? VETS_SLOTS[slot] : PROS_SLOTS[slot];
      var id = nickname.toLowerCase().replace(/[^a-z0-9]+/g, "_") + "_" + Date.now().toString(36);
      var cp = {
        id: id,
        name: name,
        nickname: nickname,
        gender: info.gender,
        stripe: info.stripe,
        show: "Custom",
        image: image || IMG_BLANK
      };
      if(group === "vets"){ state.castVets[slot] = asEntry(cp); state.castVets[slot].stripe = "veteran"; }
      else { state.castProspects[slot] = asEntry(cp); state.castProspects[slot].stripe = "prospect"; }
      State.save(state);
      customModal.close();
      form.reset();
      buildCastGrid();
    };
    cancelBtn.onclick = function(){ customModal.close(); };
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
    roster.forEach(function(p){ allShowsOf(p).forEach(function(s){ if(s) showMap[s] = true; }); });
    var shows = Object.keys(showMap).sort();
    list.innerHTML = shows.map(function(show){
      return '' +
        '<label style="display:flex;align-items:center;gap:8px;">' +
          '<input type="checkbox" data-show="'+show+'">' +
          '<span style="min-width:140px;">'+show+'</span>' +
          '<input type="text" class="rand-seasons" data-show="'+show+'" placeholder="Seasons (e.g. 1, 3-4, 6)">' +
        '</label>';
    }).join("");
  }
  function randomizeCast(prefs){
    var roster = filterRosterByPrefs(prefs);
    var males = shuffle(roster.filter(function(p){ return p.gender === "male"; }));
    var females = shuffle(roster.filter(function(p){ return p.gender === "female"; }));
var VET_M = VETS_SLOTS.filter(function(s){ return s.gender === "male"; }).length;
var VET_F = VETS_SLOTS.filter(function(s){ return s.gender === "female"; }).length;
var PRO_M = PROS_SLOTS.filter(function(s){ return s.gender === "male"; }).length;
var PRO_F = PROS_SLOTS.filter(function(s){ return s.gender === "female"; }).length;
var selectedMales   = males.slice(0, VET_M);
var selectedFemales = females.slice(0, VET_F);
var remainingRoster = roster.filter(function(p){
  return !selectedMales.includes(p) && !selectedFemales.includes(p);
});

var remMales   = shuffle(remainingRoster.filter(function(p){ return p.gender === "male"; })).slice(0, PRO_M);
var remFemales = shuffle(remainingRoster.filter(function(p){ return p.gender === "female"; })).slice(0, PRO_F);
state.castVets = selectedMales.concat(selectedFemales).map(function(p){
  var e = asEntry(p); e.stripe = "veteran"; return e;
});
state.castProspects = remMales.concat(remFemales).map(function(p){
  var e = asEntry(p); e.stripe = "prospect"; return e;
});

    State.save(state);
    buildCastGrid();
  }
  function openRandomizeModal(){
    if(!window.PLAYERS || !window.PLAYERS.length){ alert("No player data loaded."); return; }
    buildRandomizeShowList();
    randModal.showModal();
    var formRand = randModal.querySelector("#rand-form");
    var btnCancel = randModal.querySelector("#rand-cancel");
    formRand.onsubmit = function(ev){
      ev.preventDefault();
      var prefs = {};
      var checks = randModal.querySelectorAll('input[type="checkbox"][data-show]');
      checks.forEach(function(cb){
        if(!cb.checked) return;
        var show = cb.getAttribute("data-show");
        var input = randModal.querySelector('input.rand-seasons[data-show="'+show+'"]');
        var seasons = [];
        if(input && input.value.trim()){
          seasons = input.value.split(/[,]/).map(function(s){ return s.trim().toLowerCase(); }).filter(Boolean);
        }
        prefs[show] = { seasons: seasons };
      });
      randModal.close();
      randomizeCast(prefs);
    };
    btnCancel.onclick = function(){ randModal.close(); };
  }

  function initCastPage(){
    var src = window.PLAYERS || [];
    var warn = document.getElementById("data-warning");
    if(!Array.isArray(src) || !src.length){ warn.style.display = "block"; buildCastGrid(); }
    else { warn.style.display = "none"; buildCastGrid(); }
    elInfoSeed.textContent = state.seed;
    if(state.simulated){ buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false; showEpisodeSection(state.lastView?.ep || 1, state.lastView?.section || "format"); elInfoStatus.textContent = "Simulated"; statsPanel.style.display = "block"; } else { elInfoStatus.textContent = "Not simulated"; statsPanel.style.display = "none"; }
    document.getElementById("btn-randomize").onclick = openRandomizeModal;
    document.getElementById("btn-reset-cast").onclick = function(){ resetCast(); };
    document.getElementById("btn-profiles").onclick = function(){ State.save(state); location.href = "./profiles.html"; };
    document.getElementById("btn-relationships").onclick = function(){ State.save(state); location.href = "./relationships.html"; };
    document.getElementById("btn-reset-session").onclick = function(e){ e.preventDefault(); State.clear(); location.reload(); };
    document.getElementById("btn-back-cast").onclick = function(e){ e.preventDefault(); backToCast(); };
    document.getElementById("btn-simulate").onclick = function(){ simulateSeason(); };
    document.getElementById("goto-placements").onclick = function(){ showStatisticsPanel("placements"); };
    document.getElementById("goto-other-stats").onclick = function(){ showStatisticsPanel("other_stats"); };
    document.getElementById("goto-chart").onclick = function(){ showStatisticsPanel("chart"); };
    buildFilterShows(src);
  }
  function resetCast(){
    state.castVets = emptySlots(VETS_TOTAL);
    state.castProspects = emptySlots(PROS_TOTAL);
    state.players = [];
    state.pairs = [];
    state.relationships = {};
    state.profiles = {};
    state.episodes = {};
    state.stats = { tribunalWinsTeam:{}, tribunalWinsPlayer:{}, timesNominated:{}, elimWinsPlayer:{} };
    state.placements = { ordered: [] };
    state.simulated = false;
    state.lastView = null;
    State.save(state);
    buildCastGrid();
    elInfoStatus.textContent = "Not simulated";
    statsPanel.style.display = "none";
  }
  function backToCast(){
    var prevProfiles = state.profiles || {};
    var prevRelationships = state.relationships || {};
    state = {
      seed: Math.random().toString(36).slice(2,8).toUpperCase(),
      castVets: state.castVets,
      castProspects: state.castProspects,
      players: [],
      pairs: [],
      relationships: prevRelationships,
      profiles: prevProfiles,
      episodes: {},
      stats: { tribunalWinsTeam:{}, tribunalWinsPlayer:{}, timesNominated:{}, elimWinsPlayer:{} },
      placements: { ordered: [] },
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
    buildCastGrid();
  }

  function buildFilterShows(rosterList){
    var showMap = {};
    (rosterList || []).forEach(function(p){ allShowsOf(p).forEach(function(s){ if(s) showMap[s] = true; }); });
    var shows = Object.keys(showMap).sort();
    var options = '<option value="">— All Shows —</option>' + shows.map(function(s){ return '<option value="'+s+'">'+s+'</option>'; }).join("");
    elFilterShow.innerHTML = options;
    elFilterShow.onchange = function(){ buildCastGrid(); };
  }

  function setAliveFromCast(){
    state.players = [];
    (state.castVets || []).forEach(function(c){ if(c){ state.players.push({ id:c.id, name:c.name, nickname:c.nickname, image:c.image, gender:c.gender, stripe:"veteran", alive:true }); } });
    (state.castProspects || []).forEach(function(c){ if(c){ state.players.push({ id:c.id, name:c.name, nickname:c.nickname, image:c.image, gender:c.gender, stripe:"prospect", alive:true }); } });
  }

  function aliveIds(){ return state.players.filter(function(p){ return p.alive !== false; }).map(function(p){ return p.id; }); }

  function formPairs(order){
    state.pairs = [];
    var colourPool = TEAM_COLOURS.slice();
    order.forEach(function(pick){
      var col = colourPool.length ? colourPool.shift() : sample(TEAM_COLOURS);
      state.pairs.push({ prospect: pick.prospectId, vet: pick.vetId, colour: col, relicUntil: null });
    });
  }

  function relationshipSum(idsA, idsB){
    var sum = 0;
    idsA.forEach(function(a){ idsB.forEach(function(b){ sum += rel(a,b); }); });
    return sum;
  }

  function wotwSectionOrder(ep){
    if(ep === 1) return ["format","status","events1","purge","events2","partner"];
    if(ep >= 2 && ep <= 9) return ["status","events1","daily","events2","nominations","killing","elim"];
    if(ep >= 10 && ep <= 13) return ["status","events1","daily","events2","nominations","killing","elim"];
    if(ep === 14) return ["status","events1","purge"];
    if(ep === 15) return ["status","finale","day1","elim1","leg1","elim2","leg2","final"];
    return [];
  }

  function simulateSeason(){
    var total = state.castVets.filter(Boolean).length + state.castProspects.filter(Boolean).length;
    if(total !== (VETS_TOTAL + PROS_TOTAL)){
      alert("Please fill all " + (VETS_TOTAL + PROS_TOTAL) + " cast slots.");
      return;
    }
    setAliveFromCast();
    state.relationships = state.relationships || {};
    state.episodes = {};
    state.stats = { tribunalWinsTeam:{}, tribunalWinsPlayer:{}, timesNominated:{}, elimWinsPlayer:{} };
    state.elimHistory = [];
    state.placements = { ordered: [] };
    simulateEpisode1();
    for(var ep=2; ep<=9; ep++){
      simulateTeamEpisode(ep);
    }
    for(var ep=10; ep<=13; ep++){
      simulateIndividualEpisode(ep);
    }
    simulatePurge14();
    simulateFinal15();
    try {
      var finalRes = state.episodes[15] && state.episodes[15].final;
      var finalList = (finalRes && finalRes.placements) ? finalRes.placements.slice() : [];
      var placements = [];
      var seen = new Set();
      finalList.forEach(function(pid, idx){ placements.push({ place: idx + 1, ids: [pid] }); seen.add(pid); });
      var nextPlace = finalList.length + 1;
      var elimHist = state.elimHistory || [];
      for(var i = elimHist.length - 1; i >= 0; i--){
        var pid = elimHist[i].pid;
        if(!seen.has(pid)){
          placements.push({ place: nextPlace++, ids: [pid] });
          seen.add(pid);
        }
      }
      state.placements.ordered = placements;
    } catch(e) {
      console.error(e);
    }
    state.simulated = true;
    State.save(state);
    buildLeftAccordion();
    viewCast.hidden = true;
    viewEpisode.hidden = false;
    showEpisodeSection(1, "format");
    elInfoStatus.textContent = "Simulated";
    statsPanel.style.display = "block";
  }

  function simulateEpisode1(){
    var ep = 1;
    var E = state.episodes[ep] = {};
    E.format = `
This season featured 16 Challenge veterans and 18 prospects - debuting Challenge competitors from around the world. For the first ten episodes, the players competed in male/female pairs. Each veteran player paired with a prospect of the opposite sex. The Prospect picked their alumni partner based on the finish order of the opening &quot;Impending Dune&quot; challenge. Once in their pairs, the main phase of the game began. The main elements of the game are as follows:
<br><br>

<ul style="margin: 10px 0 10px 18px;">
  <li><b>Daily Missions:</b> Each round the pairs compete in the daily challenge. The top 3 pairs are immune from elimination and form the Tribunal for that round of play.</li>
  <li><b>Tribunal:</b> The Tribunal collectively nominate three pairs to nominate for the elimination round. The nominated pairs then face the Tribunal's interrogation with each nominee having the chance to plea their case as to why they should not be voted-in to the elimination.</li>
  <li><b>Eliminations (The Killing Floor):</b> At &quot;The Killing Floor&quot;, the members of the tribunal each individually and publicly vote for a nominated pair to enter the elimination round. The nominated team must then call-out any non-immune pair, challenging them to the elimination. The losing pair is eliminated from the game, while the winner stays in the game and is given &quot;The Relic&quot; - which awards them immunity in the next round of play.</li>
</ul>

During the 10th episode of the season, the 7 remaining pairs were disbanded, with the 14 remaining players playing the rest of the competition as individuals - with players competing in challenges as individuals and eliminated as individuals. The game format remains mostly the same, but with each round of play being designated as a male or female round and only players of the designated gender are at risk of being eliminated, but any player can be part of that round's Tribunal. Additionally, the relic is no longer awarded to an individual elimination winner.
<br><br>

When eight players remain, they compete individually in the Final Challenge for their share of the $1,000,000 prize. First place received $750,000; second place received $200,000; third place received the remaining $50,000.
`.trim();
    E.status = aliveIds().slice();
    E.statusMode = "individual";
    E.events1 = genMixedHouseEvents(E.status, 3 + rnd(4));
    var daily = window.WOTW_DAILY_DATA && window.WOTW_DAILY_DATA[1];
    var purge = { id: daily?.id || "", name: daily?.name || "Purge Challenge", description: daily?.description || "", comments: daily?.comments || {positive:[],neutral:[],negative:[]}, winners: [], eliminated: [], vetsMale: [], vetsFemale: [], prosMale: [], prosFemale: [] };
    var luckMap = buildLuckMap(E.status);
    var vets = state.players.filter(function(p){ return p.alive !== false && p.stripe === "veteran"; });
    var pros = state.players.filter(function(p){ return p.alive !== false && p.stripe === "prospect"; });
    var vetsM = vets.filter(function(p){ return p.gender === "male"; }).map(function(p){ return p.id; });
    var vetsF = vets.filter(function(p){ return p.gender === "female"; }).map(function(p){ return p.id; });
    var prosM = pros.filter(function(p){ return p.gender === "male"; }).map(function(p){ return p.id; });
    var prosF = pros.filter(function(p){ return p.gender === "female"; }).map(function(p){ return p.id; });
    function rank(ids){ return ids.map(function(pid){ return { pid: pid, score: scorePlayerWeightedWithLuck(daily?.skillWeights || {}, pid, luckMap) }; }).sort(function(a,b){ if(b.score !== a.score) return b.score - a.score; return Math.random() < 0.5 ? -1 : 1; }).map(function(x){ return x.pid; }); }
    purge.vetsMale   = rank(vetsM);
    purge.vetsFemale = rank(vetsF);
    purge.prosMale   = rank(prosM);
    purge.prosFemale = rank(prosF);
    purge.winners = [];
    if(purge.vetsMale[0]) purge.winners.push(purge.vetsMale[0]);
    if(purge.vetsFemale[0]) purge.winners.push(purge.vetsFemale[0]);
    var elimProsM = purge.prosMale[ purge.prosMale.length - 1 ];
    var elimProsF = purge.prosFemale[ purge.prosFemale.length - 1 ];
    purge.eliminated = [];
    if(elimProsM){ purge.eliminated.push(elimProsM); }
    if(elimProsF){ purge.eliminated.push(elimProsF); }
    purge.eliminated.forEach(function(pid){ var pl = state.players.find(function(x){ return x.id === pid; }); if(pl) pl.alive = false; recordElim(pid, 1); });
    E.purge = purge;
    var remainingAfterPurge = aliveIds();
    E.events2 = genMixedHouseEvents(remainingAfterPurge, 3 + rnd(4));
    var order = [];
    var rankedProsM = purge.prosMale.filter(function(pid){ return purge.eliminated.indexOf(pid) === -1; });
    var rankedProsF = purge.prosFemale.filter(function(pid){ return purge.eliminated.indexOf(pid) === -1; });
    var iM = 0, iF = 0;
    while(iM < rankedProsM.length || iF < rankedProsF.length){
      if(iM < rankedProsM.length){ order.push({ gender:"male", pid: rankedProsM[iM++] }); }
      if(iF < rankedProsF.length){ order.push({ gender:"female", pid: rankedProsF[iF++] }); }
    }
    var picks = [];
    var chosenVets = new Set();
    order.forEach(function(item){
      var prospectId = item.pid;
      var prospect = state.players.find(function(p){ return p.id === prospectId; });
      if(!prospect) return;
      var desiredGender = (prospect.gender === "male") ? "female" : "male";
      var availVets = state.players.filter(function(p){ return p.alive !== false && p.stripe === "veteran" && p.gender === desiredGender && !chosenVets.has(p.id); });
      if(!availVets.length) return;
      var scored = availVets.map(function(v){ return { id:v.id, rel: rel(prospectId, v.id) }; }).sort(function(a,b){ if(b.rel !== a.rel) return b.rel - a.rel; return Math.random() < 0.5 ? -1 : 1; });
      var pick = scored[0];
      if(pick){ picks.push({ prospectId: prospectId, vetId: pick.id }); chosenVets.add(pick.id); }
    });
    E.partner = { order: order.map(function(x){ return x.pid; }), picks: picks.slice() };
    formPairs(picks);
  }

  function simulateTeamEpisode(ep){
    var E = state.episodes[ep] = {};
E.status = state.pairs.map(function(pair){
  return [ pair.prospect, pair.vet, pair.colour ];
});
    E.statusMode = "pairs";
    var alive = aliveIds();
    E.events1 = genMixedHouseEvents(alive, 3 + rnd(4));
    var daily = window.WOTW_DAILY_DATA && window.WOTW_DAILY_DATA[ep];
    var dailyRes = { id: daily?.id || "", name: daily?.name || "Daily Challenge", description: daily?.description || "", comments: daily?.comments || {positive:[],neutral:[],negative:[]}, standings: [], tribunal: [] };
    var teamScores = state.pairs.map(function(pair){ return { pair: pair, score: scorePairWeighted(daily?.skillWeights || {}, pair) }; });
    teamScores.sort(function(a,b){ if(a.score !== b.score) return a.score - b.score; return Math.random() < 0.5 ? -1 : 1; });
dailyRes.standings = teamScores.map(function(x){
  return {
    prospect: x.pair.prospect,
    vet: x.pair.vet,
    score: x.score,
    colour: x.pair.colour,
    key: (x.pair.prospect + "|" + x.pair.vet)
  };
});

var top = teamScores.slice(-3).reverse();

dailyRes.tribunal = top.map(function(x){
  return {
    prospect: x.pair.prospect,
    vet: x.pair.vet,
    colour: x.pair.colour,
    key: (x.pair.prospect + "|" + x.pair.vet)
  };
});

    E.daily = dailyRes;
    E.events2 = genMixedHouseEvents(alive, 3 + rnd(4));
    var nominations = [];
    var relicPairs = state.pairs.filter(function(p){ return p.relicUntil && p.relicUntil >= ep; }).map(function(p){ return p; });
    var eligiblePairs = state.pairs.filter(function(p){ return !dailyRes.tribunal.some(function(t){ return t.prospect === p.prospect && t.vet === p.vet; }) && relicPairs.indexOf(p) === -1; });
    var nominatedKeys = new Set();
    dailyRes.tribunal.forEach(function(t){
      var voterIds = [t.prospect, t.vet];
      if(!eligiblePairs.length) return;
      var scored = eligiblePairs.map(function(p){ return { p: p, rel: relationshipSum(voterIds, [p.prospect, p.vet]) }; });
      scored.sort(function(a,b){ if(a.rel !== b.rel) return a.rel - b.rel; return Math.random() < 0.5 ? -1 : 1; });
      var choice = null;
      for(var i=0; i<scored.length; i++){
        var candidate = scored[i].p;
        var key = candidate.prospect + "|" + candidate.vet;
        if(!nominatedKeys.has(key)){
          choice = candidate;
          nominatedKeys.add(key);
          break;
        }
      }
      if(choice){ nominations.push({ tribunal: t, target: choice }); }
    });
    E.nominations = nominations;
    var uniqueTargets = [];
    nominations.forEach(function(n){ var found = uniqueTargets.some(function(u){ return u.prospect === n.target.prospect && u.vet === n.target.vet; }); if(!found) uniqueTargets.push(n.target); });
    while(uniqueTargets.length < 3 && eligiblePairs.length){
      var extra = sample(eligiblePairs);
      if(!uniqueTargets.some(function(u){ return u.prospect === extra.prospect && u.vet === extra.vet; })) uniqueTargets.push(extra);
    }
    var kill = {};
    kill.votes = [];
    var nominatedPairs = uniqueTargets;
    dailyRes.tribunal.forEach(function(t){ var ids = [t.prospect, t.vet]; ids.forEach(function(pid){ var scored = nominatedPairs.map(function(p){ return { p: p, rel: relationshipSum([pid], [p.prospect, p.vet]) }; }); scored.sort(function(a,b){ if(a.rel !== b.rel) return a.rel - b.rel; return Math.random() < 0.5 ? -1 : 1; }); var vote = scored[0].p; kill.votes.push({ voter: pid, target: vote }); }); });
    var countMap = {};
    kill.votes.forEach(function(v){ var key = v.target.prospect + "|" + v.target.vet; countMap[key] = (countMap[key] || 0) + 1; });
    var voteResults = Object.keys(countMap).map(function(k){ return { key: k, count: countMap[k] }; });
    voteResults.sort(function(a,b){ if(b.count !== a.count) return b.count - a.count; return Math.random() < 0.5 ? -1 : 1; });
    var nominatedTeamKey = voteResults[0] ? voteResults[0].key : null;
    var nominatedTeam = nominatedTeamKey ? nominatedPairs.find(function(p){ return (p.prospect + "|" + p.vet) === nominatedTeamKey; }) : null;
    kill.nominatedTeam = nominatedTeam;
    kill.voteResults = voteResults;
    kill.tie = false;
    if(voteResults.length > 1 && voteResults[0].count === voteResults[1].count){ kill.tie = true; var tied = voteResults.filter(function(x){ return x.count === voteResults[0].count; }); var picked = sample(tied); nominatedTeamKey = picked.key; kill.nominatedTeam = nominatedPairs.find(function(p){ return (p.prospect + "|" + p.vet) === nominatedTeamKey; }); }
    var callout = null;
    if(kill.nominatedTeam){ var excl = dailyRes.tribunal.map(function(t){ return t.prospect + "|" + t.vet; }); relicPairs.forEach(function(p){ excl.push(p.prospect + "|" + p.vet); }); var candidates = state.pairs.filter(function(p){ var key = p.prospect + "|" + p.vet; return key !== (kill.nominatedTeam.prospect + "|" + kill.nominatedTeam.vet) && excl.indexOf(key) === -1; }); var scored = candidates.map(function(p){ return { p:p, rel: relationshipSum([kill.nominatedTeam.prospect, kill.nominatedTeam.vet], [p.prospect, p.vet]) }; }); scored.sort(function(a,b){ if(a.rel !== b.rel) return a.rel - b.rel; return Math.random() < 0.5 ? -1 : 1; }); callout = scored.length ? scored[0].p : null; }
    kill.calloutTeam = callout;
    E.killing = kill;
    var elim = {};
    if(ep === 4){ elim.special = true; elim.description = "Double elimination: each nominated pair must send one man and one woman into a 3‑way battle.";
var secondCall = null;

if(callout){
  function pickSecond(excludeSet){
    var candidates2 = state.pairs.filter(function(p){
      return !excludeSet.has(p.prospect + "|" + p.vet);
    });
    if(!candidates2.length) return null;

    var scored2 = candidates2.map(function(p){
      return {
        p: p,
        rel: relationshipSum([callout.prospect, callout.vet], [p.prospect, p.vet])
      };
    });

    scored2.sort(function(a,b){
      if(a.rel !== b.rel) return a.rel - b.rel;
      return Math.random() < 0.5 ? -1 : 1;
    });

    return scored2[0].p;
  }

  var baseExclude = new Set();
  if(kill.nominatedTeam) baseExclude.add(kill.nominatedTeam.prospect + "|" + kill.nominatedTeam.vet);
  baseExclude.add(callout.prospect + "|" + callout.vet);
  var excl1 = new Set(baseExclude);
  (dailyRes.tribunal || []).forEach(function(t){
    excl1.add(t.prospect + "|" + t.vet);
  });
  (relicPairs || []).forEach(function(p){
    excl1.add(p.prospect + "|" + p.vet);
  });
  secondCall = pickSecond(excl1);
  if(!secondCall){
    var excl2 = new Set(baseExclude);
    (relicPairs || []).forEach(function(p){
      excl2.add(p.prospect + "|" + p.vet);
    });
    secondCall = pickSecond(excl2);
  }

  if(!secondCall){
    secondCall = pickSecond(baseExclude);
  }
}

elim.secondCall = secondCall;

function uniq(arr){
  var out = [];
  (arr||[]).forEach(function(x){
    if(x && out.indexOf(x) === -1) out.push(x);
  });
  return out;
}
function getPl(pid){
  return state.players.find(function(p){ return p.id === pid; }) || null;
}

var trioTeams = [ kill.nominatedTeam, callout, secondCall ].filter(Boolean);
var males = [];
var females = [];

trioTeams.forEach(function(t){
  [t.prospect, t.vet].forEach(function(pid){
    var pl = getPl(pid);
    if(!pl) return;
    if(pl.gender === "male") males.push(pid);
    else females.push(pid);
  });
});

males = uniq(males);
females = uniq(females);

if(males.length > 3) males = males.slice(0,3);
if(females.length > 3) females = females.slice(0,3);

var elimData = window.WOTW_ELIMINATION_DATA && window.WOTW_ELIMINATION_DATA[ep];

function scorePid(pid){
  return scorePlayerWeighted((elimData && elimData.skillWeights) ? elimData.skillWeights : {}, pid);
}

var maleScores = males.map(function(pid){ return { pid: pid, score: scorePid(pid) }; });
var femaleScores = females.map(function(pid){ return { pid: pid, score: scorePid(pid) }; });

maleScores.sort(function(a,b){
  if(b.score !== a.score) return b.score - a.score;
  return Math.random() < 0.5 ? -1 : 1;
});
femaleScores.sort(function(a,b){
  if(b.score !== a.score) return b.score - a.score;
  return Math.random() < 0.5 ? -1 : 1;
});

var maleWinner   = maleScores[0] ? maleScores[0].pid : null;
var femaleWinner = femaleScores[0] ? femaleScores[0].pid : null;

var maleLosers   = maleScores.slice(1,3).map(function(x){ return x.pid; });
var femaleLosers = femaleScores.slice(1,3).map(function(x){ return x.pid; });

elim.maleWinner = maleWinner;
elim.femaleWinner = femaleWinner;
elim.maleLosers = maleLosers;
elim.femaleLosers = femaleLosers;
elim.eliminated = maleLosers.concat(femaleLosers);

elim.eliminated.forEach(function(pid){
  var pl = getPl(pid);
  if(pl) pl.alive = false;
  recordElim(pid, ep);
});

var removeSet = new Set(elim.eliminated.concat([maleWinner, femaleWinner].filter(Boolean)));

state.pairs = state.pairs.filter(function(p){
  return !removeSet.has(p.prospect) && !removeSet.has(p.vet);
});

if(maleWinner && femaleWinner){
  var col = TEAM_COLOURS[rnd(TEAM_COLOURS.length)];
  state.pairs.push({ prospect: maleWinner, vet: femaleWinner, colour: col, relicUntil: ep + 1 });
}
    } else {
      elim.special = false;
      var elimData2 = window.WOTW_ELIMINATION_DATA && window.WOTW_ELIMINATION_DATA[ep];
      var pA = kill.nominatedTeam;
      var pB = callout;
      var scoreA = pA ? scorePairWeighted(elimData2?.skillWeights || {}, pA) : 0;
      var scoreB = pB ? scorePairWeighted(elimData2?.skillWeights || {}, pB) : 0;
      var winner, loser;
      if(scoreA > scoreB) { winner = pA; loser = pB; }
      else if(scoreB > scoreA) { winner = pB; loser = pA; }
      else { if(Math.random() < 0.5){ winner = pA; loser = pB; } else { winner = pB; loser = pA; } }
      elim.winner = winner;
      elim.loser  = loser;
      if(loser){
        [loser.prospect, loser.vet].forEach(function(pid){
          var pl = state.players.find(function(x){ return x.id === pid; });
          if(pl) pl.alive = false;
          recordElim(pid, ep);
        });
      
      if(winner){ var pairObj = state.pairs.find(function(p){ return p.prospect === winner.prospect && p.vet === winner.vet; }); if(pairObj) pairObj.relicUntil = ep + 1; }
      if(loser){ var idxL = state.pairs.findIndex(function(p){ return p.prospect === loser.prospect && p.vet === loser.vet; }); if(idxL >= 0) state.pairs.splice(idxL, 1); }
    }
    E.elim = elim;
  }

  function simulateIndividualEpisode(ep){
    var E = state.episodes[ep] = {};
    E.status = aliveIds().slice();
    E.statusMode = "individual";
    E.events1 = genMixedHouseEvents(E.status, 3 + rnd(4));
    var daily = window.WOTW_DAILY_DATA && window.WOTW_DAILY_DATA[ep];
    var dailyRes = { id: daily?.id || "", name: daily?.name || "Daily Challenge", description: daily?.description || "", comments: daily?.comments || {positive:[],neutral:[],negative:[]}, standings: [], tribunal: [] };
    var scores = E.status.map(function(pid){ return { pid: pid, score: scorePlayerWeighted(daily?.skillWeights || {}, pid) }; });
    scores.sort(function(a,b){ if(a.score !== b.score) return a.score - b.score; return Math.random() < 0.5 ? -1 : 1; });
    dailyRes.standings = scores.map(function(x){ return { pid:x.pid, score:x.score }; });
dailyRes.tribunal = dailyRes.standings.slice(-3).map(function(x){ return x.pid; }).reverse();
    E.daily = dailyRes;
    E.events2 = genMixedHouseEvents(E.status, 3 + rnd(4));
var nom = {};
nom.votes = [];

var designated = (ep % 2 === 0) ? "male" : "female";

function hasRelic(pid){
  var pl = state.players.find(function(p){ return p.id === pid; });
  if(pl && pl.relicUntil && pl.relicUntil >= ep) return true;
  for(var i=0;i<state.pairs.length;i++){
    var pr = state.pairs[i];
    if(pr && pr.relicUntil && pr.relicUntil >= ep && (pr.prospect === pid || pr.vet === pid)) return true;
  }
  return false;
}

var eligible = E.status.filter(function(pid){
  var pl = state.players.find(function(p){ return p.id === pid; });
  if(!pl) return false;
  if(dailyRes.tribunal.indexOf(pid) !== -1) return false;
  if(pl.gender !== designated) return false;
  if(hasRelic(pid)) return false;
  return true;
});

var available = eligible.slice();
dailyRes.tribunal.forEach(function(voter){
  if(!available.length) return;

  var scored = available.map(function(pid){
    return { pid: pid, rel: rel(voter, pid) };
  });

  scored.sort(function(a,b){
    if(a.rel !== b.rel) return a.rel - b.rel;
    return Math.random() < 0.5 ? -1 : 1;
  });

  var pick = scored[0].pid;
  nom.votes.push({ voter: voter, target: pick });
  available = available.filter(function(x){ return x !== pick; });
});

nom.nominees = nom.votes.map(function(v){ return v.target; });
E.nominations = nom;

    var kill = {};
    kill.votes = [];
dailyRes.tribunal.forEach(function(voter){
  var scored = (nom.nominees || []).map(function(pid){
    return { pid: pid, rel: rel(voter, pid) };
  });

  scored.sort(function(a,b){
    if(a.rel !== b.rel) return a.rel - b.rel;
    return Math.random() < 0.5 ? -1 : 1;
  });

  var pick = scored[0] ? scored[0].pid : null;
  if(pick) kill.votes.push({ voter: voter, target: pick });
});

    var countMap = {};
    kill.votes.forEach(function(v){ countMap[v.target] = (countMap[v.target] || 0) + 1; });
    var sorted = Object.keys(countMap).map(function(k){ return { pid:k, count: countMap[k] }; });
    sorted.sort(function(a,b){ if(b.count !== a.count) return b.count - a.count; return Math.random() < 0.5 ? -1 : 1; });
    var nominatedPid = sorted[0] ? sorted[0].pid : null;
    kill.nominated = nominatedPid;
    kill.tie = false;
    if(sorted.length > 1 && sorted[0].count === sorted[1].count){ kill.tie = true; var tied = sorted.filter(function(x){ return x.count === sorted[0].count; }); nominatedPid = sample(tied).pid; kill.nominated = nominatedPid; }
    var calloutPid = null;
    if(nominatedPid){ var gender = state.players.find(function(p){ return p.id === nominatedPid; }).gender; var candidates2 = E.status.filter(function(pid){
  if(pid === nominatedPid) return false;
  if(dailyRes.tribunal.indexOf(pid) !== -1) return false;

  var pl2 = state.players.find(function(p){ return p.id === pid; });
  if(!pl2 || pl2.gender !== gender) return false;

  if(hasRelic(pid)) return false;
  return true;
});

var scored2 = candidates2.map(function(pid){ return { pid: pid, rel: rel(nominatedPid, pid) }; }); scored2.sort(function(a,b){ if(a.rel !== b.rel) return a.rel - b.rel; return Math.random() < 0.5 ? -1 : 1; }); calloutPid = scored2.length ? scored2[0].pid : null; }
    kill.callout = calloutPid;
    E.killing = kill;
    var elim = {};
    var elimData = window.WOTW_ELIMINATION_DATA && window.WOTW_ELIMINATION_DATA[ep];
    var sA = nominatedPid ? scorePlayerWeighted(elimData?.skillWeights || {}, nominatedPid) : 0;
    var sB = calloutPid ? scorePlayerWeighted(elimData?.skillWeights || {}, calloutPid) : 0;
    var winnerPid, loserPid;
    if(sA > sB){ winnerPid = nominatedPid; loserPid = calloutPid; }
    else if(sB > sA){ winnerPid = calloutPid; loserPid = nominatedPid; }
    else { if(Math.random() < 0.5){ winnerPid = nominatedPid; loserPid = calloutPid; } else { winnerPid = calloutPid; loserPid = nominatedPid; } }
    elim.winner = winnerPid;
    elim.loser  = loserPid;
    elim.name   = elimData?.name || "Elimination";
    elim.description = elimData?.description || "";
    elim.comments = elimData?.comments || { positive:[], neutral:[], negative:[] };
    if(loserPid){
      var pl = state.players.find(function(p){ return p.id === loserPid; });
      if(pl) pl.alive = false;
      recordElim(loserPid, ep);
    }
    E.elim = elim;
  }

  function simulatePurge14(){
    var ep = 14;
    var E = state.episodes[ep] = {};
    E.status = aliveIds().slice();
    E.statusMode = "individual";
    E.events1 = genMixedHouseEvents(E.status, 3 + rnd(4));
    var daily = window.WOTW_DAILY_DATA && window.WOTW_DAILY_DATA[14];
    var purge = { id: daily?.id || "", name: daily?.name || "Purge Challenge", description: daily?.description || "", comments: daily?.comments || {positive:[],neutral:[],negative:[]}, male: [], female: [], eliminated: [] };
    var alive = E.status;
    var males = alive.filter(function(pid){ return state.players.find(function(p){ return p.id === pid; }).gender === "male"; });
    var females = alive.filter(function(pid){ return state.players.find(function(p){ return p.id === pid; }).gender === "female"; });
    function rank(ids){ return ids.map(function(pid){ return { pid: pid, score: scorePlayerWeighted(daily?.skillWeights || {}, pid) }; }).sort(function(a,b){ if(b.score !== a.score) return b.score - a.score; return Math.random() < 0.5 ? -1 : 1; }).map(function(x){ return x.pid; }); }
    purge.male = rank(males);
    purge.female = rank(females);
    var elimM = purge.male[ purge.male.length - 1 ];
    var elimF = purge.female[ purge.female.length - 1 ];
    if(elimM){ purge.eliminated.push(elimM); }
    if(elimF){ purge.eliminated.push(elimF); }
    purge.eliminated.forEach(function(pid){
      var pl = state.players.find(function(p){ return p.id === pid; });
      if(pl) pl.alive = false;
      recordElim(pid, ep);
    });
    E.purge = purge;
  }

  function simulateFinal15(){
    var ep = 15;
    var E = state.episodes[ep] = {};
    E.status = aliveIds().slice();
    E.statusMode = "individual";
    var FD = window.WOTW_FINAL_DATA || {};
    E.finale = { title: FD.finaleFormat?.title || "Finale", description: FD.finaleFormat?.description || "Final format." };
    var day1 = FD.dayOne || {};
    var scores = E.status.map(function(pid){ return { pid: pid, score: scorePlayerWeighted(day1.challenge?.skillWeights || {}, pid) }; });
    scores.sort(function(a,b){ if(b.score !== a.score) return b.score - a.score; return Math.random() < 0.5 ? -1 : 1; });
    var highlights1 = buildHighlightsByScoreList(day1.challenge?.comments || {}, day1.challenge?.skillWeights || {}, E.status, 8);
    E.day1 = { challenge: day1.challenge, highlights: highlights1, scores: scores.map(function(x){ return { pid:x.pid, score:x.score }; }) };
    var elim1 = scores.slice(-2).map(function(x){ return x.pid; });
    E.elim1 = { eliminated: elim1 };
    elim1.forEach(function(pid){
      var pl = state.players.find(function(p){ return p.id === pid; });
      if(pl) pl.alive = false;
      recordElim(pid, ep);
    });
    var remaining = aliveIds();
    var leg1 = FD.dayTwoLegOne || {};
    var leg1Scores = {};
    var leg1Highlights = {};
    var averageMap = {};
    leg1.challenges = leg1.challenges || [];

    leg1.challenges.forEach(function(ch, idx){
      var s = remaining.map(function(pid){
        return { pid: pid, score: scorePlayerWeighted(ch.skillWeights || {}, pid) };
      });

      s.sort(function(a,b){
        if(b.score !== a.score) return b.score - a.score;
        return Math.random() < 0.5 ? -1 : 1;
      });

      leg1Scores[idx] = s.map(function(x){ return { pid:x.pid, score:x.score }; });
      leg1Highlights[idx] = buildHighlightsByScoreList(
        ch.comments || {},
        ch.skillWeights || {},
        remaining,
        remaining.length
      );

      s.forEach(function(x, pos){
        var pt = pos + 1;
        averageMap[x.pid] = (averageMap[x.pid] || 0) + pt;
      });
    });

    var avgList = Object.keys(averageMap).map(function(pid){
      return { pid: pid, avg: averageMap[pid] / leg1.challenges.length };
    });
    avgList.sort(function(a,b){
      if(a.avg !== b.avg) return a.avg - b.avg;
      return Math.random() < 0.5 ? -1 : 1;
    });

    E.leg1 = {
      challenges: leg1.challenges.map(function(ch, idx){
        return {
          challenge: ch,
          highlights: leg1Highlights[idx] || [],
          scores: leg1Scores[idx] || []
        };
      })
    };

E.leg1.perChallenge = leg1Scores;
E.leg1.averages = avgList;

    var elim2 = avgList.slice(-2).map(function(x){ return x.pid; });
    E.elim2 = { eliminated: elim2 };
    elim2.forEach(function(pid){
      var pl = state.players.find(function(p){ return p.id === pid; });
      if(pl) pl.alive = false;
      recordElim(pid, ep);
    });
    var remaining2 = aliveIds();
var leg2 = FD.dayTwoLegTwo || {};
var leg2Ch = (leg2 && leg2.challenge) ? leg2.challenge : null;

var leg2Scores = remaining2.map(function(pid){
  return {
    pid: pid,
    score: scorePlayerWeighted((leg2Ch && leg2Ch.skillWeights) ? leg2Ch.skillWeights : {}, pid)
  };
});

leg2Scores.sort(function(a,b){
  if(b.score !== a.score) return b.score - a.score;
  return Math.random() < 0.5 ? -1 : 1;
});

var leg2Comments = (leg2Ch && leg2Ch.comments) ? leg2Ch.comments : {};
function leg2Line(tone, pid){
  var arr = (leg2Comments && leg2Comments[tone]) ? leg2Comments[tone] : [];
  var fallback =
    tone === "positive" ? "{A} dominates this stage and pulls away." :
    tone === "negative" ? "{A} struggles badly and falls behind." :
                          "{A} keeps it steady and avoids mistakes.";
  var tpl = arr.length ? sample(arr) : fallback;
  return fillEventText(tpl, pid);
}

var leg2Highlights = [];
for(var i=0; i<leg2Scores.length; i++){
  var tone = (i === 0) ? "positive" : (i === leg2Scores.length - 1) ? "negative" : "neutral";
  leg2Highlights.push({
    pid: leg2Scores[i].pid,
    tone: tone,
    text: leg2Line(tone, leg2Scores[i].pid)
  });
}

E.leg2 = {
  challenge: leg2Ch,
  scores: leg2Scores.map(function(x){ return { pid:x.pid, score:x.score }; }),
  highlights: leg2Highlights
};

    var survivors = remaining2.slice();
    var finals = survivors.map(function(pid){
      var dayPos = scores.findIndex(function(x){ return x.pid === pid; }) + 1;
      var leg1Avg = averageMap[pid] || (leg1.challenges.length * 2);
      var leg2Pos = leg2Scores.findIndex(function(x){ return x.pid === pid; }) + 1;
      var total = dayPos + leg1Avg + leg2Pos;
      return { pid: pid, score: total };
    });
    finals.sort(function(a,b){ if(a.score !== b.score) return a.score - b.score; return Math.random() < 0.5 ? -1 : 1; });
    E.final = { placements: finals.map(function(x){ return x.pid; }) };
    state.placements.ordered = finals.map(function(x, idx){ return { place: idx+1, ids: [x.pid] }; });
  }

  function getWOTWEventsData(){
    var ED = window.WOTW_EVENTS_DATA;
    if(!ED) return { events1: [], events2:{positive:[],neutral:[],negative:[]}, events3:{positive:[],neutral:[]} };
    ED.events1 = ED.events1 || [];
    ED.events2 = ED.events2 || { positive:[], neutral:[], negative:[] };
    ED.events2.positive = ED.events2.positive || [];
    ED.events2.neutral  = ED.events2.neutral  || [];
    ED.events2.negative = ED.events2.negative || [];
    ED.events3 = ED.events3 || { positive:[], neutral:[] };
    ED.events3.positive = ED.events3.positive || [];
    ED.events3.neutral  = ED.events3.neutral  || [];
    return ED;
  }
  function fillEventText(tpl, A, B, C){
    var s = String(tpl || "");
    if(A != null) s = s.replace(/\{A\}/g, nameOf(A));
    if(B != null) s = s.replace(/\{B\}/g, nameOf(B));
    if(C != null) s = s.replace(/\{C\}/g, nameOf(C));
    return s;
  }
  function pickDistinct(arr, n){ var pool = arr.slice(); var out = []; while(out.length < n && pool.length){ var pick = sample(pool); out.push(pick); pool.splice(pool.indexOf(pick), 1); } return out; }
  function pickUniqueTemplate(pool, usedMap){ pool = pool || []; usedMap = usedMap || {}; if(!pool.length) return ""; for(var tries=0; tries<30; tries++){ var tpl = sample(pool); if(!usedMap[tpl]){ usedMap[tpl] = true; return tpl; } } return sample(pool); }
  function rollEvents2Type(){ var r = Math.random(); if(r < 0.25) return "positive"; if(r < 0.65) return "neutral"; return "negative"; }
  function rollEvents3Type(){ return (Math.random() < 0.30) ? "positive" : "neutral"; }
  function genMixedHouseEvents(ids, count){ state.ui = state.ui || {}; state.ui.usedEvents = state.ui.usedEvents || { events1:{}, events2:{positive:{},neutral:{},negative:{}}, events3:{positive:{},neutral:{}} };
    var ED = getWOTWEventsData(); var out = []; if(!ids || !ids.length) return out; count = count || 4; for(var i=0;i<count;i++){ var r = Math.random(); var want3 = (ids.length >= 3) && (r < 0.20); var want2 = (ids.length >= 2) && (r >= 0.20 && r < 0.70); if(want3){ var trio = pickDistinct(ids,3); if(trio.length<3) continue; var t3 = rollEvents3Type(); var pool3 = (ED.events3 && ED.events3[t3]) ? ED.events3[t3] : []; var used3 = state.ui.usedEvents.events3[t3]; var tpl3 = pickUniqueTemplate(pool3, used3); if(!tpl3) continue; out.push({ players:[trio[0],trio[1],trio[2]], text: fillEventText(tpl3, trio[0], trio[1], trio[2]) }); } else if(want2){ var pair = pickDistinct(ids,2); if(pair.length<2) continue; var A2 = pair[0], B2 = pair[1]; var t2 = rollEvents2Type(); var pool2 = (ED.events2 && ED.events2[t2]) ? ED.events2[t2] : []; var used2 = state.ui.usedEvents.events2[t2]; var tpl2 = pickUniqueTemplate(pool2, used2); if(!tpl2) continue;
        if(t2 === "positive") applyRelDelta(A2, B2, +1);
        if(t2 === "negative") applyRelDelta(A2, B2, -1);
        out.push({ players:[A2,B2], tone:t2, text: fillEventText(tpl2, A2, B2) }); } else { var A = sample(ids); var pool1 = ED.events1 || []; var used1 = state.ui.usedEvents.events1; var tpl1 = pickUniqueTemplate(pool1, used1); if(!tpl1) continue; out.push({ players:[A], text: fillEventText(tpl1, A) }); } } return out; }

  function buildHighlightsByScoreList(comments, weights, idsPool, desired){ var pool = (idsPool && idsPool.length) ? idsPool.slice() : aliveIds(); if(!pool.length) return []; var take = Math.min(desired || 6, pool.length); pool = shuffle(pool).slice(0, take); var scored = pool.map(function(pid){ return { pid: pid, score: scorePlayerWeighted(weights || {}, pid) }; }); scored.sort(function(a,b){ if(b.score !== a.score) return b.score - a.score; return Math.random() < 0.5 ? -1 : 1; }); var topK = Math.max(1, Math.floor(take/3)); var botK = topK; var midK = take - topK - botK; function safeLine(tone,pid){ var arr = (comments && comments[tone]) ? comments[tone] : []; var fallback = tone === "positive" ? "{A} dominates the checkpoint." : tone === "negative" ? "{A} falters badly." : "{A} keeps it steady."; var line = arr.length ? sample(arr) : fallback; return line.replace(/\{A\}/g, nameOf(pid)); } var out = []; for(var i=0;i<scored.length;i++){ var tone = (i < topK) ? "positive" : (i >= topK + midK) ? "negative" : "neutral"; out.push({ pid: scored[i].pid, tone: tone, text: safeLine(tone, scored[i].pid) }); } return out; }

  function buildHighlightsForPairs(comments, weights, pairs, desired){
    var take = Math.min(desired || 6, (pairs || []).length);
    if(!take) return [];
    var subset = shuffle((pairs || []).slice()).slice(0, take);
    var scored = subset.map(function(pr){ return { pair: pr, score: scorePairWeighted(weights || {}, pr) }; });
    scored.sort(function(a,b){ if(b.score !== a.score) return b.score - a.score; return Math.random() < 0.5 ? -1 : 1; });
    var topK  = Math.max(1, Math.floor(take/3));
    var botK  = topK;
    var midK  = take - topK - botK;
    function safeLine(tone, p){
      var arr = (comments && comments[tone]) ? comments[tone] : [];
      var fallback = tone === "positive" ? "{A} & {B} blow everyone away." : tone === "negative" ? "{A} & {B} cannot get it together." : "{A} & {B} hold their own.";
      var line = arr.length ? sample(arr) : fallback;
      var aName = nameOf(p.prospect);
      var bName = nameOf(p.vet);
      return String(line).replace(/\{A\}/g, aName).replace(/\{B\}/g, bName);
    }
    var out = [];
    for(var i=0; i<scored.length; i++){
      var tone = (i < topK) ? 'positive' : (i >= topK + midK) ? 'negative' : 'neutral';
      out.push({ pair: scored[i].pair, tone: tone, text: safeLine(tone, scored[i].pair) });
    }
    return out;
  }

function buildLeftAccordion(){
  if(!elAccordion) return;

  elAccordion.innerHTML = "";

  for(var ep=1; ep<=15; ep++){
    var details = document.createElement("details");
    details.className = "details-ep";
    if(state.lastView && +state.lastView.ep === ep) details.open = true;
    else if(!state.lastView && ep === 1) details.open = true;

    var summary = document.createElement("summary");
    summary.textContent = "Episode " + ep;
    details.appendChild(summary);

    var box = document.createElement("div");
    box.className = "section-box";

    var links = document.createElement("div");
    links.className = "section-links";

    var sections = wotwSectionOrder(ep);
    sections.forEach(function(sec){
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.ep = String(ep);
      b.dataset.sec = sec;
      b.textContent = sectionLabel(sec);

      b.onclick = function(){
        showEpisodeSection(parseInt(this.dataset.ep, 10), this.dataset.sec);
      };

      links.appendChild(b);
    });

    box.appendChild(links);
    details.appendChild(box);
    elAccordion.appendChild(details);
  }

  if(state.lastView && state.lastView.ep && state.lastView.section){
    syncLeftNavActive(+state.lastView.ep, state.lastView.section);
  } else {
    var firstSec = wotwSectionOrder(1)[0];
    syncLeftNavActive(1, firstSec);
  }
}

  function sectionLabel(key){
    var map = {
      format: "Format",
      status: "Status",
      events1: "House Events",
      events2: "House Events 2",
      events3: "House Events 3",
      purge: "Purge Challenge",
      partner: "Partner Selection",
      daily: "Daily Challenge",
      nominations: "Nominations",
      killing: "Killing Floor",
      elim: "Elimination",
      finale: "Finale Format",
      day1: "Day One",
      elim1: "Eliminated (1)",
      leg1: "Day Two: Leg One",
      elim2: "Eliminated (2)",
      leg2: "Day Two: Leg Two",
      final: "Final Results",
      events: "House Events"
    };
    return map[key] || key;
  }

function syncLeftNavActive(ep, section){
  if(!elAccordion) return;

  elAccordion.querySelectorAll(".section-links button.active").forEach(function(x){
    x.classList.remove("active");
  });

  var btn = elAccordion.querySelector(
    '.section-links button[data-ep="'+ep+'"][data-sec="'+section+'"]'
  );
  if(btn){
    btn.classList.add("active");
    var det = btn.closest("details");
    if(det) det.open = true;
  }
}

  function showEpisodeSection(ep, section){
    state.lastView = { ep: ep, section: section };
    State.save(state);
  syncLeftNavActive(ep, section);
    var E = state.episodes[ep] || {};
    epTitle.textContent = "Episode " + ep;
    epSub.textContent = sectionLabel(section);
    epContent.innerHTML = "";
    epActions.innerHTML = "";
epContent.classList.toggle("ep1-tight-status", (ep === 1 && section === "status"));
    switch(section){
      case "format": renderFormat(E); break;
      case "status": renderStatus(E, ep); break;
      case "events1": renderEvents(E.events1 || []); break;
      case "events2": renderEvents(E.events2 || []); break;
      case "events3": renderEvents(E.events3 || []); break;
      case "purge": renderPurge(E.purge); break;
      case "partner": renderPartner(E.partner); break;
      case "daily": renderDaily(E.daily, ep); break;
      case "nominations": renderNominations(E.nominations, ep); break;
      case "killing": renderKilling(E.killing, ep); break;
      case "elim": renderElim(E.elim, ep); break;
      case "finale": renderFinaleFormat(E.finale); break;
      case "day1": renderFinalDay1(E.day1); break;
      case "elim1": renderFinalElim(E.elim1); break;
      case "leg1": renderFinalLeg1(ep, E.leg1, E.elim2); break;
      case "elim2": renderFinalElim(E.elim2); break;
      case "leg2": renderFinalLeg2(E.leg2); break;
      case "final": renderFinalResults(E.final); break;
      default: epContent.innerHTML = '<p class="muted">No content.</p>';
    }
    addProceedButton(ep, section);
  }

  function addProceedButton(ep, section){
    var order = wotwSectionOrder(ep) || [];
    var idx = order.indexOf(section);
    var nextEp = ep;
    var nextSec = null;
    if(idx >= 0 && idx < order.length - 1){
      nextSec = order[idx + 1];
    } else {
      nextEp = ep + 1;
      if(nextEp <= 15){
        var nextOrder = wotwSectionOrder(nextEp) || [];
        nextSec = nextOrder.length ? nextOrder[0] : null;
      }
    }
    if(nextSec){
      var btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = "Proceed";
      btn.onclick = function(){ showEpisodeSection(nextEp, nextSec); };
      epActions.appendChild(btn);
    }
  }

function renderFormat(E){
  var box = document.createElement("div");
  box.className = "mini-card note desc-box";

  var inner = document.createElement("div");
  inner.innerHTML = E.format || "";
  box.appendChild(inner);

  epContent.appendChild(box);
}

function renderStatus(E, ep){
  var ids = [];
  var mode = E.statusMode || (ep <= 9 ? "pairs" : "individual");

  function getPl(pid){
    for(var i=0;i<state.players.length;i++){
      if(state.players[i].id === pid) return state.players[i];
    }
    return null;
  }

  function addRows(wrap, pids, perRow){
    for(var i=0; i<pids.length; i+=perRow){
      var row = document.createElement("div");
      row.className = "team-row";
      row.style.flexWrap = "nowrap";
      row.style.overflowX = "auto";

      pids.slice(i, i+perRow).forEach(function(pid){
        row.appendChild(buildStatusCard(pid, false));
      });

      wrap.appendChild(row);
    }
  }

  if(mode === "pairs"){
    ids = (E.status && E.status.length)
      ? E.status
      : state.pairs.map(function(pair){ return [ pair.prospect, pair.vet, pair.colour ]; });

    var wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "12px";

    ids.forEach(function(item){
      var pid1 = item[0], pid2 = item[1], col = item[2] || "#ffffff";

      var box = document.createElement("div");
      box.className = "team-wrap";
      box.style.flex = "0 0 calc(33.33% - 12px)";
      box.style.maxWidth = "33.33%";
      box.style.borderColor = col;

      var row = document.createElement("div");
      row.className = "team-row";
      row.style.display = "flex";
      row.style.gap = "8px";

      row.appendChild(buildStatusCard(pid1, false));
      row.appendChild(buildStatusCard(pid2, false));

      box.appendChild(row);
      wrap.appendChild(box);
    });

    epContent.appendChild(wrap);
    return;
  }

  ids = E.status || [];

  if(ep === 1){
    var vM = [], vF = [], pM = [], pF = [];
    ids.forEach(function(pid){
      var pl = getPl(pid);
      if(!pl) return;
      if(pl.stripe === "veteran" && pl.gender === "male") vM.push(pid);
      else if(pl.stripe === "veteran" && pl.gender === "female") vF.push(pid);
      else if(pl.stripe === "prospect" && pl.gender === "male") pM.push(pid);
      else if(pl.stripe === "prospect" && pl.gender === "female") pF.push(pid);
    });

    var wrap1 = document.createElement("div");
    wrap1.style.display = "flex";
    wrap1.style.flexDirection = "column";
    wrap1.style.gap = "6px";

    addRows(wrap1, vM, 8);
    addRows(wrap1, vF, 8);

    var spacer = document.createElement("div");
    spacer.style.height = "8px";
    wrap1.appendChild(spacer);

    addRows(wrap1, pM, 9);
    addRows(wrap1, pF, 9);

    epContent.appendChild(wrap1);
    return;
  }

  if(ep >= 10){
    var males = ids.filter(function(pid){
      var pl = getPl(pid);
      return pl && pl.gender === "male";
    });
    var females = ids.filter(function(pid){
      var pl = getPl(pid);
      return pl && pl.gender === "female";
    });

    var wrap2 = document.createElement("div");
    wrap2.style.display = "flex";
    wrap2.style.flexDirection = "column";
    wrap2.style.gap = "12px";

    addRows(wrap2, males, 7);
    addRows(wrap2, females, 7);

    epContent.appendChild(wrap2);
    return;
  }

  var wrapDefault = document.createElement("div");
  wrapDefault.style.display = "flex";
  wrapDefault.style.flexDirection = "column";
  wrapDefault.style.gap = "12px";
  addRows(wrapDefault, ids, 5);
  epContent.appendChild(wrapDefault);
  }
  function buildStatusCard(pid, highlight){
    var c = document.createElement("div"); c.className = "status-card";
    c.innerHTML = '<img class="avatar" src="'+picOf(pid)+'" alt="">' +
                  '<div class="name">'+nameOf(pid)+'</div>' +
                  '<div class="badge">'+ (state.players.find(function(p){ return p.id === pid; }).stripe || "") +'</div>';
    if(highlight === "win") c.classList.add("win");
    if(highlight === "lose") c.classList.add("lose");
    return c;
  }
function renderEvents(list){
  if(!list || !list.length){
    epContent.innerHTML = '<p class="muted">No events.</p>';
    return;
  }

  var grid = document.createElement("div");
  grid.className = "events-grid three-cols";

  list.forEach(function(ev){
    var card = document.createElement("div");
    card.className = "mini-card";

    var avatars = document.createElement("div");
    avatars.className = "mini-avatars";

    (ev.players || []).forEach(function(pid){
      var img = document.createElement("img");
      img.className = "avatar xs";
      img.src = picOf(pid);
      img.alt = "";
      avatars.appendChild(img);
    });

    var txt = document.createElement("div");
    txt.textContent = ev.text || "";

    card.appendChild(avatars);
    card.appendChild(txt);
    grid.appendChild(card);
  });

  epContent.appendChild(grid);
}

  function renderPurge(purge){
    if(!purge){
      epContent.innerHTML = '<p class="muted">No purge results.</p>';
      return;
    }
var title = document.createElement("div");
title.className = "challenge-name";
title.textContent = purge.name || "Purge Challenge";
epContent.appendChild(title);

if(purge.description){
  var descBox = document.createElement("div");
  descBox.className = "mini-card note desc-box";
  var inner = document.createElement("div");
  inner.textContent = purge.description || "";
  descBox.appendChild(inner);
  epContent.appendChild(descBox);
}
    if(purge.male && purge.female){
      var btnH = document.createElement('button');
      btnH.className = 'btn';
      btnH.textContent = 'Show Highlights';
      var btnR = document.createElement('button');
      btnR.className = 'btn';
      btnR.textContent = 'Show Results';
      epActions.appendChild(btnH);
      epActions.appendChild(btnR);
      var highlightsShown = false;
      var resultsShown = false;
      btnH.onclick = function(){
        if(highlightsShown) return;
        highlightsShown = true;
        var allIds = (purge.male || []).concat(purge.female || []);
        var weight = {};
        var comments = purge.comments || { positive:[], neutral:[], negative:[] };
        var highlights = buildHighlightsByScoreList(comments, weight, allIds, 6);
var wrapH = document.createElement('div');
wrapH.className = 'events-grid three-cols';

highlights.forEach(function(item){
  var card = document.createElement('div');
  card.className = 'mini-card';

  var pid = item && item.pid ? item.pid : null;
  var avatar = pid ? '<img class="avatar xs" src="'+picOf(pid)+'" alt="">' : '';

  card.innerHTML =
    '<div class="row tiny-avatars">' + avatar + '</div>' +
    '<div>' + (item.text || "") + '</div>';

  wrapH.appendChild(card);
});

epContent.appendChild(wrapH);
      };
      btnR.onclick = function(){
        if(resultsShown) return;
        resultsShown = true;
        var wrapR = document.createElement('div');
        wrapR.style.display = 'flex';
        wrapR.style.justifyContent = 'space-between';
        wrapR.style.gap = '20px';
        var colM = document.createElement('div');
        var colF = document.createElement('div');
        var tM = document.createElement('h4'); tM.textContent = 'Males'; tM.style.textAlign = 'center'; colM.appendChild(tM);
        var tF = document.createElement('h4'); tF.textContent = 'Females'; tF.style.textAlign = 'center'; colF.appendChild(tF);
        var mList = (purge.male || []).slice(0, 5);
        var fList = (purge.female || []).slice(0, 5);
        mList.forEach(function(pid, idx){ var card = buildStatusCard(pid, false); var place = document.createElement('div'); place.textContent = (idx + 1) + 'th'; card.appendChild(place);
          if(idx === mList.length - 1){ card.classList.add('lose'); }
          colM.appendChild(card); });
        fList.forEach(function(pid, idx){ var cardF = buildStatusCard(pid, false); var placeF = document.createElement('div'); placeF.textContent = (idx + 1) + 'th'; cardF.appendChild(placeF); if(idx === fList.length - 1){ cardF.classList.add('lose'); } colF.appendChild(cardF); });
        wrapR.appendChild(colM);
        wrapR.appendChild(colF);
        epContent.appendChild(wrapR);
        var elimList2 = purge.eliminated || [];
        if(elimList2.length){ var txt2 = document.createElement('p'); txt2.textContent = elimList2.map(function(pid){ return nameOf(pid); }).join(' & ') + ", unfortunately, you've been eliminated from The Challenge."; txt2.style.textAlign = 'center'; epContent.appendChild(txt2); }
      };
    } else {
      var btnV = document.createElement('button');
      btnV.className = 'btn';
      btnV.textContent = 'Reveal Veteran Results';
      var btnP = document.createElement('button');
      btnP.className = 'btn';
      btnP.textContent = 'Reveal Prospect Results';
      epActions.appendChild(btnV);
      epActions.appendChild(btnP);
      var shownV = false;
      var shownP = false;
      btnV.onclick = function(){ if(shownV) return; shownV = true; renderPurgeResults(purge.vetsMale, purge.vetsFemale, true); };
      btnP.onclick = function(){ if(shownP) return; shownP = true; renderPurgeResults(purge.prosMale, purge.prosFemale, false); };
      function renderPurgeResults(maleList, femaleList, isVet){
        var wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.justifyContent = 'space-between';
        wrap.style.gap = '20px';
        var col1 = document.createElement('div');
        var col2 = document.createElement('div');
        var title1 = document.createElement('h4');
        title1.textContent = 'Males';
        title1.style.textAlign = 'center';
        var title2 = document.createElement('h4');
        title2.textContent = 'Females';
        title2.style.textAlign = 'center';
        col1.appendChild(title1);
        col2.appendChild(title2);
        maleList.forEach(function(pid, idx){
          var card = buildStatusCard(pid, false);
          var place = document.createElement('div');
          place.textContent = (idx + 1) + 'th';
          card.appendChild(place);
          if(!isVet && idx === maleList.length - 1){ card.classList.add('lose'); }
          col1.appendChild(card);
        });
        femaleList.forEach(function(pid, idx){
          var card2 = buildStatusCard(pid, false);
          var place2 = document.createElement('div');
          place2.textContent = (idx + 1) + 'th';
          card2.appendChild(place2);
          if(!isVet && idx === femaleList.length - 1){ card2.classList.add('lose'); }
          col2.appendChild(card2);
        });
        wrap.appendChild(col1);
        wrap.appendChild(col2);
        epContent.appendChild(wrap);
        if(!isVet){
          var elimList = purge.eliminated || [];
          var txt = document.createElement('p');
          txt.textContent = elimList.map(function(pid){ return nameOf(pid); }).join(' & ') + ", unfortunately, you've been eliminated from The Challenge.";
          txt.style.textAlign = 'center';
          epContent.appendChild(txt);
        }
      }
    }
  }
  function renderPartner(partner){
    if(!partner){ epContent.innerHTML = '<p class="muted">No partner selection.</p>'; return; }
    var intro = document.createElement('p');
    intro.textContent = 'Prospects will choose veterans of the opposite stripe to become partners.';
    intro.style.textAlign = 'center';
    epContent.appendChild(intro);
var btnNext = document.createElement("button");
btnNext.className = "btn";
btnNext.textContent = "Reveal Next Choice";
btnNext.dataset.keep = "1";

var btnAll = document.createElement("button");
btnAll.className = "btn";
btnAll.textContent = "Reveal All Teams";

epActions.appendChild(btnNext);
epActions.appendChild(btnAll);
    var container = document.createElement("div"); container.style.display = "flex"; container.style.flexDirection = "column"; container.style.gap = "8px";
    epContent.appendChild(container);
    var picks = partner.picks || [];
    var idx = 0;
    function addRow(i){ var pick = picks[i]; if(!pick) return; var row = document.createElement("div"); row.style.display = "flex"; row.style.alignItems = "center"; row.style.gap = "8px"; var cardPros = buildStatusCard(pick.prospectId, false); var text = document.createElement("span"); text.textContent = "has chosen"; var cardVet = buildStatusCard(pick.vetId, false); row.appendChild(cardPros); row.appendChild(text); row.appendChild(cardVet); container.appendChild(row); }
    btnNext.onclick = function(){ if(idx >= picks.length) return; addRow(idx); idx++; };
    btnAll.onclick = function(){ for(; idx<picks.length; idx++){ addRow(idx); } };
  }
function renderDaily(daily, ep){
  if(!daily){ epContent.innerHTML = '<p class="muted">No daily challenge.</p>'; return; }

  var title = document.createElement("div");
  title.className = "challenge-name";
  title.textContent = daily.name || "Daily Challenge";

  var descBox = document.createElement("div");
  descBox.className = "mini-card note desc-box";
  var inner = document.createElement("div");
  inner.textContent = daily.description || "";
  descBox.appendChild(inner);

  epContent.appendChild(title);
  epContent.appendChild(descBox);

  var highlightsSlot = document.createElement("div");
  var resultsSlot = document.createElement("div");
  epContent.appendChild(highlightsSlot);
  epContent.appendChild(resultsSlot);
  var btnH = document.createElement("button");
  btnH.className = "btn";
  btnH.textContent = "Show Highlights";

  var btnR = document.createElement("button");
  btnR.className = "btn";
  btnR.textContent = "Reveal Results";

  epActions.appendChild(btnH);
  epActions.appendChild(btnR);

  var snap = state.episodes[ep] || {};
  var pairsSnap = [];
  if(ep <= 9){
    (snap.status || []).forEach(function(t){
      pairsSnap.push({ prospect: t[0], vet: t[1], colour: t[2] });
    });
    if(!pairsSnap.length && (daily.standings || []).length){
      pairsSnap = (daily.standings || []).map(function(s){
        return { prospect: s.prospect, vet: s.vet, colour: s.colour };
      });
    }
  }

  btnH.onclick = function(){
    highlightsSlot.innerHTML = "";

    var weights = daily.skillWeights || {};
    var comments = daily.comments || { positive:[], neutral:[], negative:[] };

    var list;
    if(ep <= 9){
      list = buildHighlightsForPairs(comments, weights, pairsSnap, 6);
    } else {
      var ids = (snap.status && Array.isArray(snap.status)) ? snap.status : aliveIds();
      list = buildHighlightsByScoreList(comments, weights, ids, 6);
    }

    var wrap = document.createElement("div");
    wrap.className = "events-grid three-cols";

    list.forEach(function(item){
      var card = document.createElement("div");
      card.className = "mini-card";

      var players = [];
      if(item && item.pair){
        players = [item.pair.prospect, item.pair.vet].filter(Boolean);
      } else if(item && item.pid){
        players = [item.pid];
      } else if(item && Array.isArray(item.players)){
        players = item.players.slice();
      }

      var avatarsHtml = players.map(function(pid){
        return '<img class="avatar xs" src="'+picOf(pid)+'" alt="">';
      }).join("");

      card.innerHTML =
        '<div class="row tiny-avatars">' + avatarsHtml + '</div>' +
        '<div>' + (item.text || "") + '</div>';

      wrap.appendChild(card);
    });

    highlightsSlot.appendChild(wrap);
  };

  btnR.onclick = function(){
    resultsSlot.innerHTML = "";

    var standings = daily.standings || [];

    if(ep <= 9){
      var n = standings.length;

      var tribKeys = new Set();
      (daily.tribunal || []).forEach(function(t){
        if(!t) return;
        if(t.key) tribKeys.add(t.key);
        else tribKeys.add((t.prospect + "|" + t.vet));
      });

var colList = document.createElement("div");
colList.style.display = "flex";
colList.style.flexDirection = "column";
colList.style.alignItems = "center";
colList.style.gap = "12px";
colList.style.width = "100%";
colList.style.maxWidth = "360px";
colList.style.margin = "10px auto 14px";

for (var i = 0; i < standings.length; i++) {
  var item = standings[i];
  var key = item.key || (item.prospect + "|" + item.vet);
  if (tribKeys.has(key)) continue;

  var place = n - i;

  var teamWrap = document.createElement("div");
  teamWrap.className = "team-wrap";
  teamWrap.style.width = "100%";
  teamWrap.style.gap = "6px";

  var col = item.colour;
  if (!col) {
    for (var j = 0; j < pairsSnap.length; j++) {
      if (pairsSnap[j].prospect === item.prospect && pairsSnap[j].vet === item.vet) {
        col = pairsSnap[j].colour;
        break;
      }
    }
  }
  if (col) teamWrap.style.borderColor = col;

  var row = document.createElement("div");
  row.className = "team-row";
  row.appendChild(buildStatusCard(item.prospect, false));
  row.appendChild(buildStatusCard(item.vet, false));

  var placeDiv = document.createElement("div");
  placeDiv.textContent = ordinal(place);
  placeDiv.style.textAlign = "center";
  placeDiv.style.fontSize = "0.85rem";

  teamWrap.appendChild(row);
  teamWrap.appendChild(placeDiv);
  colList.appendChild(teamWrap);
}

resultsSlot.appendChild(colList);

var tribunalHeader = document.createElement("div");
tribunalHeader.className = "challenge-name";
tribunalHeader.textContent = "TRIBUNAL";
tribunalHeader.style.margin = "10px 0 6px";
tribunalHeader.style.width = "100%";
tribunalHeader.style.display = "block";
tribunalHeader.style.textAlign = "center";
resultsSlot.appendChild(tribunalHeader);

var top3 = standings.slice(-3);
var topRow = document.createElement("div");
topRow.style.display = "flex";
topRow.style.flexWrap = "wrap";
topRow.style.gap = "12px";
topRow.style.justifyContent = "center";
topRow.style.width = "100%";

top3.forEach(function(t) {
  var wrap = document.createElement("div");
  wrap.className = "team-wrap border-gold";
  wrap.style.width = "min(320px, 98%)";
  wrap.style.gap = "6px";

  var row = document.createElement("div");
  row.className = "team-row";

  row.style.display = "flex";
  row.style.flexDirection = "row";
  row.style.flexWrap = "nowrap";
  row.style.alignItems = "center";
  row.style.justifyContent = "center";
  row.style.gap = "2px";

  row.appendChild(buildStatusCard(t.prospect, false));
  row.appendChild(buildStatusCard(t.vet, false));

  wrap.appendChild(row);
  topRow.appendChild(wrap);
});

resultsSlot.appendChild(topRow);
return;
    }

    var n2 = standings.length;
    var colList2 = document.createElement("div");
    colList2.style.display = "flex";
    colList2.style.flexDirection = "column";
    colList2.style.alignItems = "center";
    colList2.style.gap = "12px";
    colList2.style.width = "100%";
    colList2.style.maxWidth = "360px";
    colList2.style.margin = "10px auto 14px";

    for (var k = 0; k < standings.length; k++) {
      var it = standings[k];
      var place = n2 - k;

      if (place <= 3) continue;

      var wrapP = document.createElement("div");
      wrapP.style.display = "flex";
      wrapP.style.flexDirection = "column";
      wrapP.style.alignItems = "center";
      wrapP.style.gap = "4px";
      wrapP.style.width = "100%";

      wrapP.appendChild(buildStatusCard(it.pid, false));

      var placeDiv2 = document.createElement("div");
      placeDiv2.textContent = ordinal(place) + " Place";
      placeDiv2.style.fontSize = "0.85rem";
      placeDiv2.style.textAlign = "center";
      wrapP.appendChild(placeDiv2);

      colList2.appendChild(wrapP);
    }

    resultsSlot.appendChild(colList2);

    var tribunalHeader2 = document.createElement("div");
    tribunalHeader2.className = "challenge-name";
    tribunalHeader2.textContent = "TRIBUNAL";
    tribunalHeader2.style.margin = "10px 0 6px";
    tribunalHeader2.style.width = "100%";
    tribunalHeader2.style.display = "block";
    tribunalHeader2.style.textAlign = "center";
    resultsSlot.appendChild(tribunalHeader2);

    var tribPids = standings.slice(-3).map(function(x){ return x.pid; }).reverse();

    var tribRow = document.createElement("div");
    tribRow.style.display = "flex";
    tribRow.style.justifyContent = "center";
    tribRow.style.gap = "12px";
    tribRow.style.flexWrap = "nowrap";
    tribRow.style.overflowX = "auto";
    tribRow.style.paddingBottom = "4px";
    tribRow.style.width = "100%";

    tribPids.forEach(function(pid){
      var c = buildStatusCard(pid, false);
      c.classList.add("gold-border");
      tribRow.appendChild(c);
    });

    resultsSlot.appendChild(tribRow);
  };
}
function renderNominations(nom, ep){
  if(!nom){ epContent.innerHTML = '<p class="muted">No nominations.</p>'; return; }

  var wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.gap = "10px";
  var box = document.createElement("div");
  box.className = "mini-card note desc-box";
  var inner = document.createElement("div");

  if(ep <= 9){
    inner.textContent =
      "The Tribunal, as the winners, must now nominate three teams to possibly go into the elimination.";
  } else {
    var designated = (ep % 2 === 0) ? "male" : "female";
    inner.textContent =
      "The Tribunal, as the winners, must now nominate three players to possibly go into the elimination. " +
      "This week is a " + designated.toUpperCase() + " week.";
  }

  box.appendChild(inner);
  wrap.appendChild(box);
  var btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.justifyContent = "center";
  btnRow.style.gap = "10px";
  btnRow.style.flexWrap = "wrap";

  var btnNext = document.createElement("button");
  btnNext.className = "btn";
  btnNext.textContent = "Reveal Vote";
  btnNext.dataset.keep = "1";

  var btnAll = document.createElement("button");
  btnAll.className = "btn";
  btnAll.textContent = "Reveal All Votes";
  btnAll.dataset.keep = "1";

  btnRow.appendChild(btnNext);
  btnRow.appendChild(btnAll);
  wrap.appendChild(btnRow);
  var votesWrap = document.createElement("div");
  votesWrap.style.display = "flex";
  votesWrap.style.flexDirection = "column";
  votesWrap.style.alignItems = "center";
  votesWrap.style.gap = "10px";
  wrap.appendChild(votesWrap);
  var votes = (ep <= 9)
    ? (Array.isArray(nom) ? nom.slice() : [])
    : ((nom && nom.votes) ? nom.votes.slice() : []);

  var idx = 0;

  function addVote(v){
    var row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "center";
    row.style.gap = "8px";
    row.style.flexWrap = "wrap";

    if(ep <= 9){
      var t1 = buildStatusCard(v.tribunal.prospect, false);
      var t2 = buildStatusCard(v.tribunal.vet, false);

      var span = document.createElement("span");
      span.textContent = "have nominated";

      var c1 = buildStatusCard(v.target.prospect, false);
      var c2 = buildStatusCard(v.target.vet, false);

      row.appendChild(t1);
      row.appendChild(t2);
      row.appendChild(span);
      row.appendChild(c1);
      row.appendChild(c2);
    } else {
      var voter = buildStatusCard(v.voter, false);

      var span2 = document.createElement("span");
      span2.textContent = "has nominated";

      var target = buildStatusCard(v.target, false);

      row.appendChild(voter);
      row.appendChild(span2);
      row.appendChild(target);
    }

    votesWrap.appendChild(row);
  }

  function hideButtonsIfDone(){
    if(idx >= votes.length){
      btnNext.style.display = "none";
      btnAll.style.display  = "none";
    }
  }

  btnNext.onclick = function(){
    if(idx < votes.length){
      addVote(votes[idx]);
      idx++;
    }
    hideButtonsIfDone();
  };

  btnAll.onclick = function(){
    while(idx < votes.length){
      addVote(votes[idx]);
      idx++;
    }
    hideButtonsIfDone();
  };

  if(!votes.length){
    votesWrap.innerHTML = '<p class="muted">No votes.</p>';
    btnNext.style.display = "none";
    btnAll.style.display  = "none";
  }

  epContent.appendChild(wrap);
}

function renderKilling(kf, ep){
  if(!kf){
    epContent.innerHTML = '<p class="muted">No killing floor.</p>';
    return;
  }

  function makeDescBox(txt){
    var b = document.createElement("div");
    b.className = "mini-card note desc-box";
    var inner = document.createElement("div");
    inner.textContent = txt;
    b.appendChild(inner);
    return b;
  }

  function makeTeamBox(team, border){
    var box = document.createElement("div");
    box.className = "team-wrap";
    box.style.border = "3px solid " + (border || RED);
    var row = document.createElement("div");
    row.className = "team-row";
    row.appendChild(buildStatusCard(team.prospect, false));
    row.appendChild(buildStatusCard(team.vet, false));
    box.appendChild(row);
    return box;
  }

var wrap = document.createElement("div");
wrap.style.display = "flex";
wrap.style.flexDirection = "column";
wrap.style.gap = "10px";
wrap.style.alignItems = "center";

  if(ep <= 9){
    wrap.appendChild(makeDescBox(
      "Welcome to the Killing Floor. Three teams have been nominated by the Tribunal, but only one of those teams will be going into the elimination. Tribunal, now you must now vote for one team to go in. Except, you'll be voting as individuals."
    ));
  } else {
    wrap.appendChild(makeDescBox(
      "Welcome to the Killing Floor. Three players have been nominated by the Tribunal, but only one of those players will be going into the elimination. Tribunal, now you must now vote for one player to go in."
    ));
  }

  var btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.justifyContent = "center";
  btnRow.style.gap = "10px";
  btnRow.style.flexWrap = "wrap";

  var btnNext = document.createElement("button");
  btnNext.className = "btn";
  btnNext.textContent = "Reveal Vote";
  btnNext.dataset.keep = "1";

  var btnAll = document.createElement("button");
  btnAll.className = "btn";
  btnAll.textContent = "Reveal All Votes";
  btnAll.dataset.keep = "1";

  btnRow.appendChild(btnNext);
  btnRow.appendChild(btnAll);
  wrap.appendChild(btnRow);
  var votesWrap = document.createElement("div");
  votesWrap.style.display = "flex";
  votesWrap.style.flexDirection = "column";
  votesWrap.style.alignItems = "center";
  votesWrap.style.gap = "10px";
  wrap.appendChild(votesWrap);

  var votes = (kf.votes && Array.isArray(kf.votes)) ? kf.votes.slice() : [];
  var idx = 0;
  var outcomeShown = false;

  function addVote(v){
    var row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "center";
    row.style.gap = "8px";
    row.style.flexWrap = "wrap";

    if(ep <= 9){
      var voter = buildStatusCard(v.voter, false);
      var span = document.createElement("span");
      span.textContent = "has voted for";
      var t1 = buildStatusCard(v.target.prospect, false);
      var t2 = buildStatusCard(v.target.vet, false);
      row.appendChild(voter);
      row.appendChild(span);
      row.appendChild(t1);
      row.appendChild(t2);
    } else {
      var voter2 = buildStatusCard(v.voter, false);
      var span2 = document.createElement("span");
      span2.textContent = "has voted for";
      var tgt = buildStatusCard(v.target, false);
      row.appendChild(voter2);
      row.appendChild(span2);
      row.appendChild(tgt);
    }

    votesWrap.appendChild(row);
  }

  function showOutcomeOnce(){
    if(outcomeShown) return;
    outcomeShown = true;

    if(kf.tie){
      wrap.appendChild(
        makeDescBox(ep <= 9
          ? "The vote has tied, so the team will be chosen at random."
          : "The vote has tied, so the player will be chosen at random."
        )
      );
    }

    if(ep <= 9){
      if(!kf.nominatedTeam) return;
      wrap.appendChild(makeTeamBox(kf.nominatedTeam, RED));
      var teamName = nameOf(kf.nominatedTeam.prospect) + " & " + nameOf(kf.nominatedTeam.vet);
      wrap.appendChild(makeDescBox(
        teamName + ", you have been nominated by the Tribunal. But you can choose your opponents. You can choose any team that isn't in the Tribunal or has a Relic."
      ));

      if(kf.calloutTeam){
        var btnCall = document.createElement("button");
        btnCall.className = "btn";
        btnCall.textContent = "Reveal Call-Out";
        btnCall.onclick = function(){
          btnCall.disabled = true;

          var callWrap = document.createElement("div");
          callWrap.style.display = "flex";
          callWrap.style.flexDirection = "column";
          callWrap.style.gap = "8px";

          var msg = document.createElement("p");
          msg.textContent =
            nameOf(kf.nominatedTeam.prospect) + " & " + nameOf(kf.nominatedTeam.vet) +
            " have decided to call out " +
            nameOf(kf.calloutTeam.prospect) + " & " + nameOf(kf.calloutTeam.vet) + ".";
          msg.style.textAlign = "center";
          callWrap.appendChild(msg);

          callWrap.appendChild(makeTeamBox(kf.calloutTeam));

          if(ep === 4){
            var elimData = state.episodes[ep] && state.episodes[ep].elim;
            if(elimData && elimData.secondCall){
              var secondMsg = document.createElement("p");
              secondMsg.textContent =
                nameOf(kf.calloutTeam.prospect) + " & " + nameOf(kf.calloutTeam.vet) +
                " have been told it's a double elimination, so they also call out " +
                nameOf(elimData.secondCall.prospect) + " & " + nameOf(elimData.secondCall.vet) + ".";
              secondMsg.style.textAlign = "center";
              callWrap.appendChild(secondMsg);

              callWrap.appendChild(makeTeamBox(elimData.secondCall));
            }
          }

          wrap.appendChild(callWrap);
        };
        wrap.appendChild(btnCall);
      }

    } else {
      if(!kf.nominated) return;
      var nCard = buildStatusCard(kf.nominated, false);
      nCard.classList.add("lose");
      wrap.appendChild(nCard);
      wrap.appendChild(makeDescBox(
        nameOf(kf.nominated) + ", you have been nominated by the Tribunal. But you can choose your opponent. You can choose any player that isn't in the Tribunal or has a Relic."
      ));

      if(kf.callout){
        var btnCall2 = document.createElement("button");
        btnCall2.className = "btn";
        btnCall2.textContent = "Reveal Call-Out";
        btnCall2.onclick = function(){
          btnCall2.disabled = true;

          var msg2 = document.createElement("p");
          msg2.textContent = nameOf(kf.nominated) + " has decided to call out " + nameOf(kf.callout) + ".";
          msg2.style.textAlign = "center";
          wrap.appendChild(msg2);

          var cCard = buildStatusCard(kf.callout, false);
          wrap.appendChild(cCard);
        };
        wrap.appendChild(btnCall2);
      }
    }
  }

  function hideVoteButtonsIfDone(){
    if(idx >= votes.length){
      btnNext.style.display = "none";
      btnAll.style.display  = "none";
      showOutcomeOnce();
    }
  }

  btnNext.onclick = function(){
    if(idx < votes.length){
      addVote(votes[idx]);
      idx++;
    }
    hideVoteButtonsIfDone();
  };

  btnAll.onclick = function(){
    while(idx < votes.length){
      addVote(votes[idx]);
      idx++;
    }
    hideVoteButtonsIfDone();
  };

  if(!votes.length){
    votesWrap.innerHTML = '<p class="muted">No votes.</p>';
    btnNext.style.display = "none";
    btnAll.style.display  = "none";
    showOutcomeOnce();
  }

  epContent.appendChild(wrap);
}
function renderElim(elim, ep){
  epContent.innerHTML = "";
  if(!elim){
    epContent.innerHTML = '<p class="muted">No elimination result.</p>';
    return;
  }

  var elimData = (window.WOTW_ELIMINATION_DATA && window.WOTW_ELIMINATION_DATA[ep]) || {};
  var elimName = elim.name || elimData.name || (elim.special ? "Double Elimination" : "Elimination");
  var elimDesc = (elim.description != null ? elim.description : (elimData.description || ""));

  var title = document.createElement("div");
  title.className = "challenge-name";
  title.textContent = elimName;
  epContent.appendChild(title);

  var descBox = document.createElement("div");
  descBox.className = "mini-card note desc-box";
  var inner = document.createElement("div");
  inner.textContent = elimDesc;
  descBox.appendChild(inner);
  epContent.appendChild(descBox);

  function teamKey(t){ return (t && t.prospect && t.vet) ? (t.prospect + "|" + t.vet) : ""; }

  function makeTeamBox(team){
    var box = document.createElement("div");
    box.className = "team-wrap";
    box.style.gap = "6px";

    if(team && team.colour) box.style.borderColor = team.colour;

    var row = document.createElement("div");
    row.className = "team-row";
    row.appendChild(buildStatusCard(team.prospect, false));
    row.appendChild(buildStatusCard(team.vet, false));
    box.appendChild(row);

    return box;
  }

  function setTeamBoxBorder(box, color){
    if(!box) return;
    box.style.border = "3px solid " + color;
  }

  function pickFrom(arr){
    if(!arr || !arr.length) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if(elim.special && ep === 4){
    var comments4 = (elimData && elimData.comments) ? elimData.comments : { positive:[], neutral:[], negative:[] };

    function genderOf(pid){
      var pl = state.players.find(function(p){ return p.id === pid; });
      return pl ? pl.gender : "";
    }
    function memberOf(team, gender){
      if(!team) return null;
      var a = team.prospect, b = team.vet;
      if(genderOf(a) === gender) return a;
      if(genderOf(b) === gender) return b;
      return null;
    }
    function uniq(arr){
      var out = [];
      (arr || []).forEach(function(x){
        if(x && out.indexOf(x) === -1) out.push(x);
      });
      return out;
    }
    function fallbackIds(winnerPid, loserArr){
      var out = [];
      if(winnerPid) out.push(winnerPid);
      (loserArr || []).forEach(function(x){ if(x) out.push(x); });
      return uniq(out);
    }

    var t1 = nominatedTeam || null;
    var t2 = calledTeam || null;
    var t3 = elim.secondCall || null;

    var maleIds = uniq([ memberOf(t1,"male"), memberOf(t2,"male"), memberOf(t3,"male") ]);
    var femaleIds = uniq([ memberOf(t1,"female"), memberOf(t2,"female"), memberOf(t3,"female") ]);

    if(maleIds.length < 3) maleIds = fallbackIds(elim.maleWinner, elim.maleLosers);
    if(femaleIds.length < 3) femaleIds = fallbackIds(elim.femaleWinner, elim.femaleLosers);

    function soloize(tpl){
      return String(tpl || "")
        .replace(/\{A\}\s*&\s*\{B\}/g, "{A}")
        .replace(/\{A\}\s*and\s*\{B\}/gi, "{A}")
        .replace(/\{B\}/g, "");
    }

    function makeVs(){
      var vs = document.createElement("div");
      vs.textContent = "VS";
      vs.style.fontWeight = "800";
      vs.style.letterSpacing = "1px";
      vs.style.opacity = "0.9";
      return vs;
    }

    function renderTriple(ids, winnerPid, loserArr){
      var block = document.createElement("div");
      block.style.display = "flex";
      block.style.flexDirection = "column";
      block.style.alignItems = "center";
      block.style.gap = "8px";

var row = document.createElement("div");
row.style.display = "flex";
row.style.justifyContent = "center";
row.style.alignItems = "center";
row.style.gap = "10px";
row.style.flexWrap = "nowrap";
row.style.overflowX = "auto";
row.style.maxWidth = "100%";
row.style.paddingBottom = "4px";

var cardByPid = {};

(ids || []).forEach(function(pid, i){
  var c = buildStatusCard(pid, false);
  c.style.flex = "0 0 auto";
  cardByPid[pid] = c;
  row.appendChild(c);
  if(i < ids.length - 1) row.appendChild(makeVs());
});

block.appendChild(row);

      var btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.justifyContent = "center";
      btnRow.style.gap = "10px";
      btnRow.style.flexWrap = "wrap";
      btnRow.style.marginTop = "2px";

      var btnH = document.createElement("button");
      btnH.className = "btn";
      btnH.textContent = "Show Highlights";

      var btnR = document.createElement("button");
      btnR.className = "btn";
      btnR.textContent = "Show Results";

      btnRow.appendChild(btnH);
      btnRow.appendChild(btnR);
      block.appendChild(btnRow);

      var highlightsSlot = document.createElement("div");
      highlightsSlot.style.display = "flex";
      highlightsSlot.style.flexDirection = "column";
      highlightsSlot.style.alignItems = "center";
      highlightsSlot.style.gap = "10px";
      highlightsSlot.style.marginTop = "6px";
      block.appendChild(highlightsSlot);

      btnH.onclick = function(){
        highlightsSlot.innerHTML = "";

        var wrap = document.createElement("div");
        wrap.className = "events-grid three-cols";
        var rank = {};
        if(winnerPid) rank[winnerPid] = 1;
        if(loserArr && loserArr.length){
          if(loserArr[0]) rank[loserArr[0]] = 2;
          if(loserArr[1]) rank[loserArr[1]] = 3;
        }

        (ids || []).forEach(function(pid){
          var r = rank[pid] || 2;

          var pool =
            (r === 1) ? (comments4.positive && comments4.positive.length ? comments4.positive : (comments4.neutral || [])) :
            (r === 3) ? (comments4.negative && comments4.negative.length ? comments4.negative : (comments4.neutral || [])) :
                        (comments4.neutral && comments4.neutral.length ? comments4.neutral : (comments4.positive || []));

          var tpl = pickFrom(pool);
          if(!tpl){
            tpl = (r === 1) ? "{A} looks unstoppable and takes the win." :
                  (r === 3) ? "{A} falls behind and can’t recover." :
                              "{A} keeps it close, but it isn’t enough.";
          }

          var text = fillEventText(soloize(tpl), pid, null);
          var card = document.createElement("div");
card.className = "mini-card";

card.innerHTML =
  '<div class="row tiny-avatars">' +
    '<img class="avatar xs" src="'+picOf(pid)+'" alt="">' +
  '</div>' +
  '<div>' + (text || "") + '</div>';

wrap.appendChild(card);
        });

        highlightsSlot.appendChild(wrap);
        btnH.disabled = true;
      };

      btnR.onclick = function(){
        (ids || []).forEach(function(pid){
          var c = cardByPid[pid];
          if(c){ c.classList.remove("win"); c.classList.remove("lose"); }
        });

        (ids || []).forEach(function(pid){
          var c = cardByPid[pid];
          if(!c) return;
          if(winnerPid && pid === winnerPid) c.classList.add("win");
          else if(loserArr && loserArr.indexOf(pid) !== -1) c.classList.add("lose");
        });

        btnR.disabled = true;
      };

      return block;
    }

    epContent.appendChild(renderTriple(maleIds, elim.maleWinner, elim.maleLosers || []));
    var spacer = document.createElement("div");
    spacer.style.height = "10px";
    epContent.appendChild(spacer);
    epContent.appendChild(renderTriple(femaleIds, elim.femaleWinner, elim.femaleLosers || []));
    return;
  }

  var killing = state.episodes[ep] && state.episodes[ep].killing;
  var nominatedTeam = (killing && killing.nominatedTeam) ? killing.nominatedTeam : null;
  var calledTeam    = (killing && killing.calloutTeam) ? killing.calloutTeam : null;
  var nominatedPid = (killing && killing.nominated) ? killing.nominated : null;
  var calledPid    = (killing && killing.callout) ? killing.callout : null;

var matchupCard = document.createElement("div");
matchupCard.className = "mini-card";

var matchup = document.createElement("div");
matchup.style.display = "flex";
matchup.style.alignItems = "center";
matchup.style.justifyContent = "center";
matchup.style.gap = "12px";
matchup.style.flexWrap = "nowrap";
matchup.style.overflowX = "auto";
matchup.style.width = "100%";
matchup.style.padding = "6px 4px";
matchup.style.width = "100%";

var leftBox = null, rightBox = null;
var leftCard = null, rightCard = null;

if(ep <= 9){
  leftBox = nominatedTeam ? makeTeamBox(nominatedTeam) : document.createElement("div");
  rightBox = calledTeam ? makeTeamBox(calledTeam) : document.createElement("div");
  leftBox.style.flex = "0 0 auto";
  rightBox.style.flex = "0 0 auto";
  leftBox.style.width = "min(340px, 45vw)";
  rightBox.style.width = "min(340px, 45vw)";

  matchup.appendChild(leftBox);

  var vs = document.createElement("div");
  vs.textContent = "VS";
  vs.style.fontWeight = "800";
  vs.style.letterSpacing = "1px";
  vs.style.opacity = "0.9";
  matchup.appendChild(vs);

  matchup.appendChild(rightBox);
} else {
  leftCard = nominatedPid ? buildStatusCard(nominatedPid, false) : document.createElement("div");
  rightCard = calledPid ? buildStatusCard(calledPid, false) : document.createElement("div");

  leftCard.style.flex = "0 0 auto";
  rightCard.style.flex = "0 0 auto";

  matchup.appendChild(leftCard);

  var vs2 = document.createElement("div");
  vs2.textContent = "VS";
  vs2.style.fontWeight = "800";
  vs2.style.letterSpacing = "1px";
  vs2.style.opacity = "0.9";
  matchup.appendChild(vs2);

  matchup.appendChild(rightCard);
}

matchupCard.appendChild(matchup);
epContent.appendChild(matchupCard);

  var highlightsSlot = document.createElement("div");
  highlightsSlot.style.display = "flex";
  highlightsSlot.style.flexDirection = "column";
  highlightsSlot.style.alignItems = "center";
  highlightsSlot.style.gap = "10px";
  highlightsSlot.style.marginTop = "10px";
  epContent.appendChild(highlightsSlot);

  var btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.justifyContent = "center";
  btnRow.style.gap = "10px";
  btnRow.style.flexWrap = "wrap";
  btnRow.style.marginTop = "6px";

  var btnH = document.createElement("button");
  btnH.className = "btn";
  btnH.textContent = "Show Highlights";

  var btnR = document.createElement("button");
  btnR.className = "btn";
  btnR.textContent = "Show Results";

  btnRow.appendChild(btnH);
  btnRow.appendChild(btnR);
  epContent.appendChild(btnRow);

btnH.onclick = function(){
  highlightsSlot.innerHTML = "";

  var comments = elim.comments || elimData.comments || { positive:[], neutral:[], negative:[] };

  function makeDailyStyleCard(pids, text){
    var card = document.createElement("div");
    card.className = "mini-card";

    var avatarsHtml = (pids || []).filter(Boolean).map(function(pid){
      return '<img class="avatar xs" src="'+picOf(pid)+'" alt="">';
    }).join("");

    card.innerHTML =
      '<div class="row tiny-avatars">' + avatarsHtml + '</div>' +
      '<div>' + (text || "") + '</div>';

    return card;
  }

  var wrap = document.createElement("div");
  wrap.className = "events-grid three-cols";

  if(ep <= 9){
    var w = elim.winner, l = elim.loser;

    var wTpl = pickFrom((comments.positive && comments.positive.length) ? comments.positive : (comments.neutral || []));
    var lTpl = pickFrom((comments.negative && comments.negative.length) ? comments.negative : (comments.neutral || []));

    if(!wTpl) wTpl = "{A} & {B} show great heart.";
    if(!lTpl) lTpl = "{A} & {B} struggle mightily.";

    function textForTeam(t){
      if(!t) return "";
      var isWinner = teamKey(w) && teamKey(t) === teamKey(w);
      var tpl = isWinner ? wTpl : lTpl;
      return fillEventText(tpl, t.prospect, t.vet);
    }

    wrap.appendChild(makeDailyStyleCard(
      [nominatedTeam.prospect, nominatedTeam.vet],
      textForTeam(nominatedTeam)
    ));
    wrap.appendChild(makeDailyStyleCard(
      [calledTeam.prospect, calledTeam.vet],
      textForTeam(calledTeam)
    ));

  } else {
    var wPid = elim.winner, lPid = elim.loser;

    var wTpl2 = pickFrom((comments.positive && comments.positive.length) ? comments.positive : (comments.neutral || []));
    var lTpl2 = pickFrom((comments.negative && comments.negative.length) ? comments.negative : (comments.neutral || []));

    if(!wTpl2) wTpl2 = "{A} refuses to quit.";
    if(!lTpl2) lTpl2 = "{A} falters badly.";

    function textForPid(pid){
      if(!pid) return "";
      var tpl = (wPid && pid === wPid) ? wTpl2 : lTpl2;
      return fillEventText(tpl, pid);
    }

    wrap.appendChild(makeDailyStyleCard([nominatedPid], textForPid(nominatedPid)));
    wrap.appendChild(makeDailyStyleCard([calledPid], textForPid(calledPid)));
  }

  highlightsSlot.appendChild(wrap);
};

  btnR.onclick = function(){
    if(ep <= 9){
      var w = elim.winner, l = elim.loser;
      var leftKey = nominatedTeam ? teamKey(nominatedTeam) : "";
      var rightKey = calledTeam ? teamKey(calledTeam) : "";

      var wKey = teamKey(w);
      var lKey = teamKey(l);

      if(leftBox && leftKey){
        if(leftKey === wKey) setTeamBoxBorder(leftBox, GREEN);
        else if(leftKey === lKey) setTeamBoxBorder(leftBox, RED);
      }
      if(rightBox && rightKey){
        if(rightKey === wKey) setTeamBoxBorder(rightBox, GREEN);
        else if(rightKey === lKey) setTeamBoxBorder(rightBox, RED);
      }
    } else {
      if(leftCard && elim.winner && nominatedPid && elim.winner === nominatedPid) leftCard.classList.add("win");
      if(leftCard && elim.loser && nominatedPid && elim.loser === nominatedPid) leftCard.classList.add("lose");

      if(rightCard && elim.winner && calledPid && elim.winner === calledPid) rightCard.classList.add("win");
      if(rightCard && elim.loser && calledPid && elim.loser === calledPid) rightCard.classList.add("lose");
    }

    btnR.disabled = true;
  };
}

function renderFinaleFormat(f){
  if(!f){ epContent.innerHTML = '<p class="muted">No finale format.</p>'; return; }

  var h = document.createElement("h3");
  h.textContent = f.title || "Finale Format";
  epContent.appendChild(h);
  epContent.appendChild(makeDescBox(f.description || ""));
}

function renderFinalDay1(day1){
  if(!day1){ epContent.innerHTML = '<p class="muted">Day 1 not simulated.</p>'; return; }
  var title = document.createElement("div");
  title.className = "challenge-name";
  title.textContent = (day1.challenge && day1.challenge.name) ? day1.challenge.name : "Day One";
  epContent.appendChild(title);

  epContent.appendChild(makeDescBox((day1.challenge && day1.challenge.description) ? day1.challenge.description : ""));

  var wrap = document.createElement("div");
  wrap.className = "events-grid three-cols";

  (day1.highlights || []).forEach(function(item){
    var card = document.createElement("div");
    card.className = "mini-card";

    if(typeof item === "string"){
      card.innerHTML = "<div>" + item + "</div>";
      wrap.appendChild(card);
      return;
    }

    var players = [];
    if(item && item.pair){
      players = [item.pair.prospect, item.pair.vet].filter(Boolean);
    } else if(item && item.pid){
      players = [item.pid];
    } else if(item && Array.isArray(item.players)){
      players = item.players.slice();
    }

    var avatarsHtml = players.map(function(pid){
      return '<img class="avatar xs" src="'+picOf(pid)+'" alt="">';
    }).join("");

    card.innerHTML =
      '<div class="row tiny-avatars">' + avatarsHtml + '</div>' +
      '<div>' + (item.text || "") + '</div>';

    wrap.appendChild(card);
  });

  epContent.appendChild(wrap);
}

  function renderFinalElim(elim){
    if(!elim){ epContent.innerHTML = '<p class="muted">No elimination stage.</p>'; return; }
    var p = document.createElement("p"); p.textContent = "The last two placing challengers that are eliminated from the final are...";
    epContent.appendChild(p);
    var btn = document.createElement("button"); btn.className = "btn"; btn.textContent = "Reveal Eliminated";
    epActions.appendChild(btn);
    btn.onclick = function(){ btn.disabled = true; var row = document.createElement("div"); row.style.display = "flex"; row.style.gap = "8px"; (elim.eliminated || []).forEach(function(pid){ var card = buildStatusCard(pid, "lose"); row.appendChild(card); }); epContent.appendChild(row); };
  }
  function renderFinalLeg1(ep, leg1, elim2){
    if(!leg1 || !leg1.challenges || !leg1.challenges.length){
      epContent.innerHTML = '<p class="muted">No leg 1.</p>';
      return;
    }

    leg1.challenges.forEach(function(entry, idx){
      var ch = entry.challenge || entry;
      var highlights = entry.highlights || [];
      var t = document.createElement("div");
      t.className = "challenge-name";
      t.textContent = ch.name || ("Leg One Challenge " + (idx+1));
      epContent.appendChild(t);
      epContent.appendChild(makeDescBox(ch.description || ""));

      var wrap = document.createElement("div");
      wrap.className = "events-grid three-cols";

      highlights.forEach(function(item){
        var card = document.createElement("div");
        card.className = "mini-card";

        if(typeof item === "string"){
          card.innerHTML = "<div>" + item + "</div>";
          wrap.appendChild(card);
          return;
        }

        var players = [];
        if(item && item.pair){
          players = [item.pair.prospect, item.pair.vet].filter(Boolean);
        } else if(item && item.pid){
          players = [item.pid];
        } else if(item && Array.isArray(item.players)){
          players = item.players.slice();
        }

        var avatarsHtml = players.map(function(pid){
          return '<img class="avatar xs" src="'+picOf(pid)+'" alt="">';
        }).join("");

        card.innerHTML =
          '<div class="row tiny-avatars">' + avatarsHtml + '</div>' +
          '<div>' + (item.text || "") + '</div>';

        wrap.appendChild(card);
      });

      epContent.appendChild(wrap);
    });
  }

function renderFinalLeg2(leg2){
  if(!leg2 || !leg2.challenge){
    epContent.innerHTML = '<p class="muted">No leg 2.</p>';
    return;
  }

  var ch = leg2.challenge;
  var highlights = leg2.highlights || [];
  var t = document.createElement("div");
  t.className = "challenge-name";
  t.textContent = ch.name || "Day Two: Leg Two";
  epContent.appendChild(t);
  epContent.appendChild(makeDescBox(ch.description || ""));

  var wrap = document.createElement("div");
  wrap.className = "events-grid three-cols";

  function makeDailyStyleCard(pids, text){
    var card = document.createElement("div");
    card.className = "mini-card";

    var avatarsHtml = (pids || []).filter(Boolean).map(function(pid){
      return '<img class="avatar xs" src="' + picOf(pid) + '" alt="">';
    }).join("");

    card.innerHTML =
      '<div class="row tiny-avatars">' + avatarsHtml + '</div>' +
      '<div>' + (text || "") + '</div>';

    return card;
  }

  highlights.forEach(function(item){
    if(typeof item === "string"){
      wrap.appendChild(makeDailyStyleCard([], item));
      return;
    }

    var pids = [];
    if(item && item.pair){
      pids = [item.pair.prospect, item.pair.vet].filter(Boolean);
    } else if(item && item.pid){
      pids = [item.pid];
    } else if(item && Array.isArray(item.players)){
      pids = item.players.slice();
    }

    wrap.appendChild(makeDailyStyleCard(pids, item.text || ""));
  });

  epContent.appendChild(wrap);
}

function renderFinalResults(finalRes){
  if(!finalRes){
    epContent.innerHTML = '<p class="muted">No final results.</p>';
    return;
  }

  var preface =
    finalRes.prefaceText ||
    "Two days. Endless miles. Checkpoints designed to break bodies and patience. " +
    "By the time they hit the lighthouse, alliances didn’t matter—only heart, brains, and pure survival. " +
    "Only four challengers are left standing… and here’s how it finishes.";

  epContent.appendChild(makeDescBox(preface));

  var placements = finalRes.placements || [];
  if(!placements.length){
    epContent.appendChild(makeDescBox("No placements were recorded for the final."));
    return;
  }

  var wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.gap = "8px";

  var wrapMounted = false;
  function ensureWrap(){
    if(!wrapMounted){
      epContent.appendChild(wrap);
      wrapMounted = true;
    }
  }

  function addPlacementRow(actualIdx){
    var pid = placements[actualIdx];
    var place = actualIdx + 1; 

    var card = buildStatusCard(pid, false);
    if(place === 1) card.classList.add("border-gold");
    else if(place === 2) card.classList.add("border-silver");
    else if(place === 3) card.classList.add("border-bronze");
    else if(place === 4) card.classList.add("lose");

    var lbl = document.createElement("div");
    lbl.textContent = ordinal(place) + " Place";
    lbl.style.textAlign = "center";

    var row = document.createElement("div");
    row.style.display = "flex";
    row.style.flexDirection = "column";
    row.style.alignItems = "center";
    row.style.gap = "4px";

    row.appendChild(card);
    row.appendChild(lbl);
    wrap.appendChild(row);
  }

  var btnNext = document.createElement("button");
  btnNext.className = "btn";
  btnNext.textContent = "Show Next Placement";
  btnNext.dataset.keep = "1";
  epActions.appendChild(btnNext);

  var btnAll = document.createElement("button");
  btnAll.className = "btn";
  btnAll.textContent = "Show All Placements";
  epActions.appendChild(btnAll);

  var revealed = 0;

  btnNext.onclick = function(){
    ensureWrap();

    var actualIdx = (placements.length - 1) - revealed; 
    if(actualIdx < 0){
      btnNext.disabled = true;
      btnNext.style.display = "none";
      return;
    }

    addPlacementRow(actualIdx);
    revealed++;
    if(revealed >= placements.length){
      btnNext.disabled = true;
      btnNext.style.display = "none";
      if(btnAll && btnAll.isConnected) btnAll.style.display = "none";
    }
  };

  btnAll.onclick = function(){
    ensureWrap();
    wrap.innerHTML = "";
    revealed = placements.length;

    for(var actualIdx = placements.length - 1; actualIdx >= 0; actualIdx--){
      addPlacementRow(actualIdx);
    }
    if(btnNext && btnNext.isConnected) btnNext.style.display = "none";
  };
}

  function showStatisticsPanel(panel){
    epActions.innerHTML = "";
    epContent.innerHTML = "";
    epSub.textContent = panel === "placements" ? "Placements" : panel === "other_stats" ? "Other Statistics" : "Season Chart";
    if(panel === "placements"){ renderPlacements(); }
    else if(panel === "other_stats"){ renderOtherStats(); }
    else if(panel === "chart"){ renderChart(); }
  }
function renderPlacements(){
  epContent.innerHTML = "";
  epActions.innerHTML = "";
  var places = (state.placements && state.placements.ordered) ? state.placements.ordered.slice() : [];

  if(!places.length){
    epContent.appendChild(makeDescBox("Placements aren’t available yet. Simulate the season first."));
    var b0 = document.createElement("button");
    b0.className = "btn";
    b0.textContent = "Proceed";
    b0.onclick = function(){ showStatisticsPanel("other_stats"); };
    epActions.appendChild(b0);
    return;
  }

  var entries = [];
  places.forEach(function(item){
    var ids = (item && item.ids) ? item.ids.slice() : [];
    var start = (item && typeof item.place === "number") ? item.place : 0;
    var label = "";
    if(ids.length <= 1){
      label = ordinal(start);
    } else if(ids.length === 2){
      label = ordinal(start) + "/" + ordinal(start + 1);
    } else {
      label = ordinal(start) + "–" + ordinal(start + ids.length - 1);
    }

    ids.forEach(function(pid){
      entries.push({ pid: pid, placeStart: start, label: label });
    });
  });

  try{
    var seen = new Set(entries.map(function(e){ return e.pid; }));
    (state.players || []).forEach(function(p){
      if(p && p.id && !seen.has(p.id)){
        entries.push({ pid: p.id, placeStart: 999, label: "—" });
        seen.add(p.id);
      }
    });
  } catch(e){}

  var wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.gap = "12px";

  var cursor = 0;
  var firstRowCounts = [1, 3, 4];

  function makeRow(cols){
    var row = document.createElement("div");
    row.className = "placements-row";

    var slice = entries.slice(cursor, cursor + cols);
    cursor += slice.length;

    slice.forEach(function(ent){
      var cell = document.createElement("div");
      cell.style.display = "flex";
      cell.style.flexDirection = "column";
      cell.style.alignItems = "center";

      var card = buildStatusCard(ent.pid, false);
      if(ent.placeStart === 1) card.classList.add("border-gold");
      else if(ent.placeStart === 2) card.classList.add("border-silver");
      else if(ent.placeStart === 3) card.classList.add("border-bronze");

      var lab = document.createElement("div");
      lab.className = "placements-label";
      lab.textContent = ent.label;

      cell.appendChild(card);
      cell.appendChild(lab);
      row.appendChild(cell);
    });

    wrap.appendChild(row);
  }

  for(var i=0; i<firstRowCounts.length && cursor < entries.length; i++){
    var cols = firstRowCounts[i];
    if(cols > (entries.length - cursor)) cols = (entries.length - cursor);
    makeRow(cols);
  }

  while(cursor < entries.length){
    var remaining = entries.length - cursor;
    makeRow(Math.min(6, remaining));
  }

  epContent.appendChild(wrap);

  var btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = "Proceed";
  btn.onclick = function(){ showStatisticsPanel("other_stats"); };
  epActions.appendChild(btn);
}

function renderOtherStats(){
  var card = document.createElement("div");
  card.className = "mini-card";
  card.style.maxWidth = "1000px";
  card.style.margin = "0 auto";
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
    tr.appendChild(td(name, "left"));

    var n = document.createElement("td");
    n.textContent = String(num || 0);
    n.style.textAlign = "right";
    n.style.padding = "10px 12px";
    n.style.borderBottom = "1px solid rgba(120,130,155,.25)";
    n.style.opacity = ".95";
    tr.appendChild(n);

    tbody.appendChild(tr);
  }

  var teamWins = {};
  for(var i=2; i<=9; i++){
    var d = state.episodes[i] && state.episodes[i].daily;
    if(d && d.tribunal){
      d.tribunal.forEach(function(t){
        var key = t.prospect + "|" + t.vet;
        teamWins[key] = (teamWins[key] || 0) + 1;
      });
    }
  }
  var maxTeam = Object.keys(teamWins).sort(function(a,b){ return teamWins[b] - teamWins[a]; })[0];
  var teamCount = maxTeam ? (teamWins[maxTeam] || 0) : 0;
  var teamLabel = maxTeam
    ? (nameOf(maxTeam.split("|")[0]) + " & " + nameOf(maxTeam.split("|")[1]))
    : "—";
  addRow("Most Tribunal Wins (Team)", teamLabel, teamCount);

  var tribWins = {};
  for(var j=10; j<=13; j++){
    var d2 = state.episodes[j] && state.episodes[j].daily;
    if(d2 && d2.tribunal){
      d2.tribunal.forEach(function(pid){
        tribWins[pid] = (tribWins[pid] || 0) + 1;
      });
    }
  }
  var maxP = Object.keys(tribWins).sort(function(a,b){ return tribWins[b] - tribWins[a]; })[0];
  var pCount = maxP ? (tribWins[maxP] || 0) : 0;
  var pLabel = maxP ? nameOf(maxP) : "—";
  addRow("Most Tribunal Wins (Player)", pLabel, pCount);

  var nomCount = {};
  for(var k=2; k<=13; k++){
    var N = state.episodes[k] && state.episodes[k].nominations;
    if(!N) continue;

    if(k <= 9){
      (N || []).forEach(function(n){
        if(!n || !n.target) return;
        var a = n.target.prospect;
        var b = n.target.vet;
        if(a) nomCount[a] = (nomCount[a] || 0) + 1;
        if(b) nomCount[b] = (nomCount[b] || 0) + 1;
      });
    } else {
      (N.nominees || []).forEach(function(pid){
        if(pid) nomCount[pid] = (nomCount[pid] || 0) + 1;
      });
    }
  }
  var maxNom = Object.keys(nomCount).sort(function(a,b){ return nomCount[b] - nomCount[a]; })[0];
  var nomN = maxNom ? (nomCount[maxNom] || 0) : 0;
  var nomLabel = maxNom ? nameOf(maxNom) : "—";
  addRow("Most Times Nominated (Player)", nomLabel, nomN);
  var elimWins = {};
  for(var m=2; m<=13; m++){
    var el = state.episodes[m] && state.episodes[m].elim;
    if(!el) continue;

    if(m <= 9){
      if(el.winner){
        [el.winner.prospect, el.winner.vet].forEach(function(pid){
          if(pid) elimWins[pid] = (elimWins[pid] || 0) + 1;
        });
      }
    } else {
      if(el.winner){
        elimWins[el.winner] = (elimWins[el.winner] || 0) + 1;
      }
    }
  }
  var maxEl = Object.keys(elimWins).sort(function(a,b){ return elimWins[b] - elimWins[a]; })[0];
  var elCount = maxEl ? (elimWins[maxEl] || 0) : 0;
  var elLabel = maxEl ? nameOf(maxEl) : "—";
  addRow("Most Elimination Wins (Player)", elLabel, elCount);
  table.appendChild(tbody);
  card.appendChild(table);
  epContent.appendChild(card);
  var btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = "Proceed";
  btn.style.display = "block";
  btn.style.margin = "12px auto 0";
  btn.onclick = function(){
    showStatisticsPanel("chart");
  };
  epContent.appendChild(btn);
}

  function renderChart(){
    var btn = document.createElement("button"); btn.className = "btn"; btn.textContent = "Open Season Chart";
    btn.onclick = function(){ State.save(state); location.href = "./season_chart.html"; };
    epContent.appendChild(btn);
  }
  function ordinal(n){ var s=["th","st","nd","rd"], v=n%100; return n + (s[(v-20)%10] || s[v] || s[0]); }
  initCastPage();

})();