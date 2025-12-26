(function(){
    "use strict";
    var IMG_BLANK="BlankProfile.webp";
    var HOV_DAILIES   = window.hov_daily_data || [];
    var HOV_ELIMS     = window.hov_elimination_data || [];
    var HOV_EVENTS    = window.hov_events || {};
    var HOV_SPEECHES  = window.hov_speeches || {};

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
         shows: p.shows || null, seasonsByShow: p.seasonsByShow || null,
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

    var KEY="house-of-villains-season";
    var State={ load:function(){ try{ return JSON.parse(sessionStorage.getItem(KEY)) || null; }catch(e){ return null; } },
                save:function(s){ sessionStorage.setItem(KEY, JSON.stringify(s)); },
                clear:function(){ sessionStorage.removeItem(KEY); } };


    var state = State.load() || {
      seed: Math.random().toString(36).slice(2,8).toUpperCase(),
      castVillains: Array.from({ length: 10 }).map(function () { return null; }),

      players: [],
      relationships: {},
      profiles: {},
      episodes: {},
      ui: {},
      stats: {
        battleWins: {},
        nominations: {},
        redemptionWins: {},
        banishmentSeats: {},
        elimWins: {},
        elimPlays: {}
      },

      placements: {
        winner: null,
        second: null,
        third: null,
        eliminated: []
      },

      chart: { finalized:false, episodes:{} },
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
    function skillOf(pid, key){
      var s = (state.profiles[pid] && (state.profiles[pid][key])) || 0;
      return typeof s === "number" ? clamp(s,-3,3) : 0;
    }
function nameOf(id) {
  if (!id) return "";

  var p = state.players.find(function (x) { return x.id === id; });
  if (p) return p.nickname || p.name || id;

  var entry = (state.castVillains || []).find(function (x) { return x && x.id === id; });
  if (entry) return entry.nickname || entry.name || id;

  if (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id]) {
    var v = window.PLAYERS_BY_ID[id];
    return v.nickname || v.name || id;
  }

  return id;
}
function picOf(id) {
  if (!id) return IMG_BLANK;

  var p = state.players.find(function (x) { return x.id === id; });
  if (p && p.image) return p.image;

  var entry = (state.castVillains || []).find(function (x) { return x && x.id === id; });
  if (entry && entry.image) return entry.image;

  if (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id] && window.PLAYERS_BY_ID[id].image) {
    return window.PLAYERS_BY_ID[id].image;
  }

  return IMG_BLANK;
}
    function profileMult(pid, compKey){ var v = skillOf(pid, compKey); return 1 + (v * 0.1); }
    function scorePlayerWeighted(weights, pid){ var s=0; for(var k in (weights||{})){ if(Object.prototype.hasOwnProperty.call(weights,k)){ var w=+weights[k]||0; s += w * profileMult(pid,k); } } return s; }
    function scorePairWeighted(weights, a,b){ return (scorePlayerWeighted(weights,a) + scorePlayerWeighted(weights,b))/2; }
    function ordinal(n){
      var s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]);
    }

function buildFilterShows(roster){
  var showMap = {};
  (roster || []).forEach(function(p){
    allShowsOf(p).forEach(function(s){
      if (s) showMap[s] = true;
    });
  });
  var shows = Object.keys(showMap).sort();

  var options = '<option value="">— All Shows —</option>' +
    shows.map(function(s){ return '<option value="'+s+'">'+s+'</option>'; }).join("");
  elFilterShow.innerHTML = options;
  elFilterShow.onchange = function(){ buildTeamsGrid(roster||[]); };
}

    function buildVillainBox(label, rangeLabel, startIndex, count, roster) {
      var box = document.createElement("div");
      box.className = "team-box";

      var head = document.createElement("div");
      head.className = "team-head";
      head.innerHTML = '<div class="label">' + label + '</div>' +
                       '<div class="team-tag">' + rangeLabel + '</div>';
      box.appendChild(head);

      var inner = document.createElement("div");
      inner.className = "team-inner";

      for (var i = 0; i < count; i++) {
        var idx = startIndex + i;
        var slot = (state.castVillains || [])[idx] || null;

        var card = document.createElement("div");
        card.className = "pick-card";

        var img = document.createElement("img");
        img.className = "avatar";
        img.src = (slot && slot.image) || IMG_BLANK;
        img.alt = (slot && slot.nickname) || "Villain";
        card.appendChild(img);

        var name = document.createElement("div");
        name.className = "pick-name";
        name.textContent = slot ? (slot.nickname || slot.name || "Villain") : "Villain " + (idx + 1);
        card.appendChild(name);

        var select = document.createElement("select");
        select.className = "pick-player";
        select.dataset.slot = idx;

        var options = ['<option value="">— Choose Villain —</option>'];
var showFilter = elFilterShow.value;

(roster || []).forEach(function (p) {
  if (showFilter && !playerHasShow(p, showFilter)) return;
  var sel = (slot && slot.id === p.id) ? ' selected' : '';
options.push('<option value="' + p.id + '"' + sel + '>' + (p.name || p.nickname || p.id) + '</option>');
});
        select.innerHTML = options.join("");
        card.appendChild(select);

        var btn = document.createElement("button");
        btn.className = "btn btn-custom";
        btn.type = "button";
        btn.dataset.slot = idx;
        btn.textContent = "Custom Player";
        card.appendChild(btn);

        inner.appendChild(card);
      }

      box.appendChild(inner);
      return box;
    }

function buildTeamsGrid(roster) {
  elTeams.innerHTML = "";

  elTeams.appendChild(buildVillainBox("Villains", " ", 0, 10, roster));

  elTeams.querySelectorAll(".pick-player").forEach(function (sel) {
    sel.onchange = function (e) {
      var idx = +e.target.dataset.slot;
      var id = e.target.value || "";
      if (!id) {
        state.castVillains[idx] = null;
        State.save(state);
        return buildTeamsGrid(roster || []);
      }

      var p = (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id]) ||
              (roster || []).find(function (r) { return r.id === id; });
      if (!p) return;

      var entry = asEntry(p);
      state.castVillains[idx] = entry;
      State.save(state);
      buildTeamsGrid(roster || []);
    };
  });

  elTeams.querySelectorAll(".btn-custom").forEach(function (btn) {
    btn.onclick = function () {
      openCustomModal(+btn.dataset.slot);
    };
  });

  var filled = (state.castVillains || []).filter(Boolean).length;
  elInfoCast.textContent = filled;
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
        var cp = { id:id, name:name, nickname:nickname, show:"Custom", image:image || IMG_BLANK };

        state.castVillains[slot] = asEntry(cp);
        State.save(state);
        modal.close();
        formCustom.reset();
        buildTeamsGrid(window.PLAYERS||[]);
      };

      cancelBtn.onclick = function(){ modal.close(); };
    }

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

function playerMatchesPrefs(p, prefs){
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
    allShowsOf(p).forEach(function(s){
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

function filterRosterByPrefs(prefs){
  var roster = (window.PLAYERS || []).slice();
  if (!prefs || !Object.keys(prefs).length) return roster;
  return roster.filter(function(p){ return playerMatchesPrefs(p, prefs); });
}

function randomizeCastWithPrefs(prefs){
  var roster = filterRosterByPrefs(prefs);
  if (!roster.length){
    alert("No eligible players for the selected shows/seasons.");
    return;
  }

  var pool = shuffle(roster);
  if (pool.length < 10){
    alert("Not enough eligible players for those filters. Try fewer restrictions.");
    return;
  }

  state.castVillains = pool.slice(0, 10).map(asEntry);
  State.save(state);
  buildTeamsGrid(window.PLAYERS || []);
}

function openRandomizeModal(){
  if (!window.PLAYERS || !window.PLAYERS.length){
    alert("No player data loaded.");
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
        seasons = input.value
          .split(/[,]/)
          .map(function(s){ return s.trim().toLowerCase(); })
          .filter(Boolean);
      }
      prefs[show] = { seasons: seasons };
    });

    randModal.close();
    randomizeCastWithPrefs(prefs);
  };

  btnCancel.onclick = function(){
    randModal.close();
  };
}

    document.getElementById("btn-reset-session").addEventListener("click", function(e){ e.preventDefault(); State.clear(); location.reload(); });

document.getElementById("btn-reset-cast").addEventListener("click", function (e) {
  e.preventDefault();
  resetCastSelection();
});

var btnBackCast = document.getElementById("btn-back-cast");
if (btnBackCast) {
  btnBackCast.addEventListener("click", function (e) {
    e.preventDefault();
    resetSeasonKeepCast();
  });
}
    document.getElementById("btn-profiles").addEventListener("click", function(){ location.href = "./profiles.html"; });
    document.getElementById("btn-relationships").addEventListener("click", function(){ location.href = "./relationships.html"; });
document.getElementById("btn-randomize").onclick = openRandomizeModal;

    (function init(){
      var src=window.PLAYERS||[];
      var warn=document.getElementById("data-warning");
      if(!Array.isArray(src)||!src.length){
        warn.style.display="block";
        buildFilterShows([]); buildTeamsGrid([]);
      } else {
        warn.style.display="none";
        buildFilterShows(src); buildTeamsGrid(src);
      }
      elInfoSeed.textContent=state.seed;

      if(state.simulated){
        buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false;
        var last=state.lastView||{ep:1,section:"status"}; showEpisodeSection(last.ep,last.section);
        elInfoStatus.textContent = "Simulated";
        elInfoCast.textContent = (state.castVillains || []).filter(Boolean).length;
        statsPanel.style.display="block";
      }
      document.getElementById("goto-placements").onclick=function(){ showStatisticsPanel("placements"); };
      document.getElementById("goto-stats").onclick=function(){ showStatisticsPanel("other"); };
      document.getElementById("goto-chart").onclick=function(){ showStatisticsPanel("chart"); };
    })();

    function setAliveFromCast(){
      var src = (state.castVillains || []).filter(Boolean);
      state.players = src.map(function (c) {
        return {
          id: c.id,
          name: c.name,
          nickname: c.nickname,
          image: c.image,
          gender: c.gender || "unknown",
          alive: true
        };
      });
    }

    function aliveIds() {
      return state.players
        .filter(function (p) { return p.alive !== false; })
        .map(function (p) { return p.id; });
    }

    function renderNames(t, ids){
      var out=t||"";
      var labels=["{A}","{B}","{C}"];
      (ids||[]).forEach(function(pid,i){ out = out.split(labels[i]).join(nameOf(pid)); });
      return out;
    }

    function genHouseEvents(){
      var alive = aliveIds(); var E = HOV_EVENTS || {}; var out=[];
      var pick = function(a){ return a && a.length ? sample(a) : null; };
      var count = 4 + rnd(4);
      for(var i=0;i<count;i++){
        var roll=Math.random();
        if(roll<0.3){
          var A = sample(alive); var ev1 = pick(E.solo_neutral);
          if(ev1 && A) out.push({ players:[A], text:renderNames(ev1,[A]) });
        } else if(roll<0.8){
          var P1 = sample(alive), P2 = sample(alive.filter(function(x){return x!==P1;})) || P1;
          var bucket = E.two_neutral, r = rel(P1,P2);
          if(r>=5 && Math.random()<0.35) bucket = E.two_positive;
          if(r<=-3 && Math.random()<0.35) bucket = E.two_negative;
          var ev2 = pick(bucket); if(ev2 && P1 && P2) out.push({ players:[P1,P2], text:renderNames(ev2,[P1,P2]) });
        } else {
          var A3 = sample(alive), B3 = sample(alive.filter(function(x){return x!==A3;})), C3 = sample(alive.filter(function(x){return x!==A3 && x!==B3;}));
          var ev3 = pick(E.team_neutral); if(ev3 && A3 && B3 && C3) out.push({ players:[A3,B3,C3], text:renderNames(ev3,[A3,B3,C3]) });
        }
      }
      return out;
    }

    function computeDaily(ep){
      var D = (HOV_DAILIES || []).find(function(d){ return d.episode === ep; });
      if (!D) return null;

      var alive = aliveIds();
      var out = {
        name: D.name || ("Battle Royale " + ep),
        description: D.description || "",
        format: "individual",
        results: { order: [] },
        order: [],
        teams: [],
        highlights: [],
        winners: []
      };

      if (!alive.length) {
        return out;
      }

  var scored = alive.map(function(id){
    return {
      id: id,
      score: scorePlayerWeighted(D.skillWeights || {}, id)
    };
  }).sort(function(a, b){
    return b.score - a.score;
  });

  out.order = scored.map(function(x){ return x.id; });

  var winner = null;
  if (scored.length){
    var topScore = scored[0].score;
    var tiedTop = scored.filter(function(entry){
      return Math.abs(entry.score - topScore) < 1e-9;
    });

    var winnerEntry;
    if (tiedTop.length === 1){
      winnerEntry = tiedTop[0];
    } else {
      winnerEntry = sample(tiedTop);
    }
    winner = winnerEntry ? winnerEntry.id : null;
  }

  if (winner) {
    out.order = [winner].concat(out.order.filter(function(id){ return id !== winner; }));
    out.winners = [winner];
    state.stats.battleWins[winner] = (state.stats.battleWins[winner] || 0) + 1;
  }

      out.highlights = tierComments(D.comments || {}, out.order);

      return out;
    }

    function tierComments(bank, idsSorted){
      if(!bank) return [];
      var pos=bank.positive||[], neu=bank.neutral||[], neg=bank.negative||[];
      var out=[]; if(!idsSorted||!idsSorted.length) return out;
      var n=idsSorted.length, top=Math.max(1,Math.round(n*0.2)), bot=Math.max(1,Math.round(n*0.2));
      var mid=idsSorted.slice(top, n-bot), hi=idsSorted.slice(0,top), lo=idsSorted.slice(n-bot);
      function slot(list, source){
        if(!source.length || !list.length) return;
        var A=sample(list); var tmpl = sample(source) || "{A} competes.";
        out.push(tmpl.replaceAll("{A}", nameOf(A)));
      }
      slot(hi,pos); slot(hi,pos);
      slot(mid,neu); slot(mid,neu);
      slot(lo,neg); slot(lo,neg);
      slot(hi,pos);
      return out.slice(0,7);
    }

    function tierCommentsPairs(bank, pairs){
      if(!bank) return [];
      var pos=bank.positive||[], neu=bank.neutral||[], neg=bank.negative||[];
      var out=[]; if(!pairs||!pairs.length) return out;
      var n=pairs.length, top=Math.max(1,Math.round(n*0.2)), bot=Math.max(1,Math.round(n*0.2));
      var hi=pairs.slice(0,top), mid=pairs.slice(top, n-bot), lo=pairs.slice(n-bot);
      function pickAndFill(source, fromPairs){
        if(!source.length || !fromPairs.length) return;
        var team = sample(fromPairs);
        var t = sample(source) || "{A} and {B} compete.";
        t = t.replaceAll("{A}", nameOf(team[0])).replaceAll("{B}", nameOf(team[1]));
        out.push(t);
      }
      pickAndFill(pos,hi); pickAndFill(pos,hi);
      pickAndFill(neu,mid); pickAndFill(neu,mid);
      pickAndFill(neg,lo); pickAndFill(neg,lo);
      pickAndFill(pos,hi);
      return out.slice(0,7);
    }

    function bestRelPick(fromId, candidates){
      if(!candidates.length) return null;
      var best=[], sc=-Infinity;
      for(var i=0;i<candidates.length;i++){ var c=candidates[i]; var r=rel(fromId,c); if(r>sc){ sc=r; best=[c]; } else if(r===sc){ best.push(c); } }
      return sample(best);
    }
function worstRelPick(fromId, candidates, blockSet){
  var pool = (candidates||[]).filter(function(id){ return !blockSet || !blockSet.has(id); });
  if(!pool.length) return null;
  var worst=[], sc=+Infinity;
  for(var i=0;i<pool.length;i++){
    var c = pool[i];
    var r = rel(fromId, c);
    if(r < sc){ sc = r; worst = [c]; }
    else if(r === sc){ worst.push(c); }
  }
  return sample(worst);
}

    function resolveElimination(ep, pairs){
      var ED = (HOV_ELIMS||[]).find(function(d){return d.episode===ep;}) || {};
      var out = { name: ED.name||"The Duel", description: ED.description||"", comments: ED.comments||{}, skillWeights: ED.skillWeights||{}, matchups:{}, highlights:{} };
      function duel(a,b,gender){
        var sa=scorePlayerWeighted(ED.skillWeights||{}, a), sb=scorePlayerWeighted(ED.skillWeights||{}, b);
        var win = (sa===sb) ? (Math.random()<0.5 ? a : b) : ((sa>sb)?a:b);
        var lose = (win===a)?b:a;
        state.stats.elimPlays[a]=(state.stats.elimPlays[a]||0)+1;
        state.stats.elimPlays[b]=(state.stats.elimPlays[b]||0)+1;
        state.stats.elimWins[win]=(state.stats.elimWins[win]||0)+1;
        var pl = state.players.find(function(p){return p.id===lose;}); if(pl) pl.alive=false;
        state.placements.eliminated.push({ id: lose, episode: ep });
        out.matchups[gender] = { A:a, B:b, winner:win, loser:lose };
        out.highlights[gender] = tierComments(ED.comments||{}, [a,b]);
      }
      if(pairs.female && pairs.female.length===2) duel(pairs.female[0], pairs.female[1], "female");
      if(pairs.male && pairs.male.length===2) duel(pairs.male[0], pairs.male[1], "male");
      return out;
    }

    function simulateFinals(){
      var alive = aliveIds();

      var finalists = alive.slice(0, 3);

      state.placements.winner = finalists[0] || null;
      state.placements.second = finalists[1] || null;
      state.placements.third  = finalists[2] || null;

      return {
        stages: [],
        results: {
          finalists: finalists
        }
      };
    }

    document.getElementById("btn-simulate").onclick = function () {
      var filled = (state.castVillains || []).filter(Boolean).length;
      if (filled !== 10) {
        alert("Please complete all 10 villain slots before simulating.");
        return;
      }

      setAliveFromCast();
      simulateSeason();
      state.simulated = true;
      State.save(state);

      buildLeftAccordion();
      viewCast.hidden = true;
      viewEpisode.hidden = false;
      showEpisodeSection(1, "status");

      elInfoStatus.textContent = "Simulated";
      elInfoCast.textContent = filled;
      statsPanel.style.display = "block";
    };

function resetCastSelection() {
  state.seed = Math.random().toString(36).slice(2, 8).toUpperCase();
  state.castVillains = Array.from({ length: 10 }).map(function () { return null; });
  state.relationships = {};
  state.profiles = {};
  resetSeasonKeepCast();
  elInfoSeed.textContent = state.seed;
}

function resetSeasonKeepCast() {
  state.players = [];
  state.episodes = {};
  state.ui = {};

  state.stats = {
    battleWins: {},
    nominations: {},
    redemptionWins: {},
    banishmentSeats: {},
    elimWins: {},
    elimPlays: {}
  };

  state.placements = {
    winner: null,
    second: null,
    third: null,
    eliminated: []
  };

  state.chart = { finalized: false, episodes: {} };

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
  buildTeamsGrid(window.PLAYERS || []);
}

    function bump(map, id){
      if(!id) return;
      map[id] = (map[id] || 0) + 1;
    }

    function pickHitList(supervillainId, candidates, count){
      var arr = (candidates || []).slice().map(function(id){
        return { id:id, r: rel(supervillainId, id) };
      });
      arr.sort(function(a,b){
        if(a.r !== b.r) return a.r - b.r;
        return Math.random() < 0.5 ? -1 : 1;
      });
      var picks = arr.slice(0, count).map(function(x){ return x.id; });
      picks.forEach(function(id){ bump(state.stats.nominations, id); });
      return picks;
    }

function generateSpeechesForNominees(nominees){
      var root = window.HOV_SPEECHES || window.hov_speeches || {};
      var elim = root.elimination || {};

      var good    = elim.good    || root.good    || [];
      var neutral = elim.neutral || root.neutral || [];
      var bad     = elim.bad     || root.bad     || [];

      var out = {};

      (nominees || []).forEach(function(id){
        var total = 0;
        var count = 0;

        for (var key in state.relationships){
          if (!Object.prototype.hasOwnProperty.call(state.relationships, key)) continue;
          var parts = key.split("|");
          if (parts[0] === id || parts[1] === id){
            total += state.relationships[key] || 0;
            count++;
          }
        }

        var avg = count ? (total / count) : 0;
        var bucket;
        if (avg >= 1)      bucket = good;
        else if (avg <= -1) bucket = bad;
        else               bucket = neutral;

        var arr = bucket;
        var text;
        if (arr && arr.length){
          text = arr[Math.floor(Math.random() * arr.length)];
        } else {
          text = "{A} should win because they are the ultimate villain.";
        }
        out[id] = text.replaceAll("{A}", nameOf(id));
      });

      return out;
    }

function runRedemption(ep, nominees){
  var bank = (window.hov_elimination_data ||
              window.hov_elims ||
              window.HOV_ELIMS ||
              []);

  var ED = bank.find(function(d){
    return d && d.episode === ep && d.type === "redemption";
  }) || {};

  var aliveNominees = (nominees || []).filter(function(id){
    return state.players.some(function(p){
      return p.id === id && p.alive !== false;
    });
  });

  var out = {
    name: ED.name || ("Redemption Challenge " + ep),
    description: ED.description || "",
    comments: ED.comments || {},
    skillWeights: ED.skillWeights || {},
    order: [],
    winner: null,
    highlights: []
  };

  if (!aliveNominees.length){
    return out;
  }

  var weights = out.skillWeights || {};
  var scored = aliveNominees.map(function(id){
    return {
      id: id,
      score: scorePlayerWeighted(weights, id)
    };
  }).sort(function(a, b){
    return b.score - a.score;
  });

  out.order = scored.map(function(x){ return x.id; });

  var winner = null;
  if (scored.length){
    var topScore = scored[0].score;
    var tiedTop = scored.filter(function(entry){
      return Math.abs(entry.score - topScore) < 1e-9;
    });

    var winnerEntry;
    if (tiedTop.length === 1){
      winnerEntry = tiedTop[0];
    } else {
      winnerEntry = sample(tiedTop);
    }
    winner = winnerEntry ? winnerEntry.id : null;
  }

  if (winner) {
    out.order = [winner].concat(out.order.filter(function(id){ return id !== winner; }));
    out.winner = winner;
    bump(state.stats.redemptionWins, winner);
  }

var comments = ED.comments || {};
var pos = comments.positive || [];
var neu = comments.neutral || [];
var neg = comments.negative || [];

var ids = out.order.slice();
var highs = [];

function addHighlightFor(idx, list, fallbackLists) {
  if (!ids[idx]) return;
  var pool = list && list.length ? list : null;

  if (!pool) {
    for (var i = 0; i < fallbackLists.length; i++) {
      if (fallbackLists[i] && fallbackLists[i].length) {
        pool = fallbackLists[i];
        break;
      }
    }
  }
  if (!pool || !pool.length) return;

  var tmpl = sample(pool) || "{A} competes.";
  highs.push(tmpl.replaceAll("{A}", nameOf(ids[idx])));
}

if (ids.length >= 1) {
  addHighlightFor(0, pos, [neu, neg]);
}

if (ids.length >= 2) {
  addHighlightFor(1, neu, [pos, neg]);
}

if (ids.length >= 3) {
  addHighlightFor(2, neg, [neu, pos]);
}

out.highlights = highs;
return out;
}

    function runBanishment(ep, nominees, supervillainId){
      var alive = aliveIds();
      var finalNominees = (nominees || []).slice();
      if(finalNominees.length !== 2){
        return {
          nominees: finalNominees,
          supervillain: supervillainId,
          votes: {},
          perVoter: [],
          banished: null,
          tie: false,
          speeches: {}
        };
      }

      var voters = alive.filter(function(id){
        return id !== supervillainId && finalNominees.indexOf(id) === -1;
      });

var votes = {};
var ballots = {};
var perVoter = [];

finalNominees.forEach(function(id){
    votes[id] = [];
});

voters.forEach(function(v){
    var sorted = finalNominees.slice().sort(function(a,b){
        var ra = rel(v,a), rb = rel(v,b);
        if (ra !== rb) return ra - rb;
        return Math.random() < 0.5 ? -1 : 1;
    });
    var target = sorted[0];

    if (!votes[target]) votes[target] = [];
    votes[target].push(v);
    ballots[v] = target;
    perVoter.push({ voter: v, target: target });
});

var arr = finalNominees.map(function(id){
    var list = votes[id] || [];
    return { id: id, votes: list.length, voters: list };
}).sort(function(a,b){
    return b.votes - a.votes;
});

      var banished = null;
      var tie = false;

      if (arr.length >= 2 && arr[0].votes === arr[1].votes){
        tie = true;
        var tiedIds = arr.filter(function(x){ return x.votes === arr[0].votes; })
                         .map(function(x){ return x.id; });

        var sortedTie = tiedIds.slice().sort(function(a,b){
          var ra = rel(supervillainId, a), rb = rel(supervillainId, b);
          if (ra !== rb) return ra - rb;
          return Math.random() < 0.5 ? -1 : 1;
        });

        banished = sortedTie[0];

        if (supervillainId && banished){
          perVoter.push({ voter: supervillainId, target: banished, tieBreaker: true });
        }
      } else if (arr.length){
        banished = arr[0].id;
      }

      finalNominees.forEach(function(id){
        bump(state.stats.banishmentSeats, id);
      });

      if(banished){
        var pl = state.players.find(function(p){ return p.id === banished; });
        if(pl) pl.alive = false;
        state.placements.eliminated.push({ id:banished, episode:ep, reason:"banished" });
      }

      var speeches = generateSpeechesForNominees(finalNominees);

return {
    nominees: finalNominees,
    supervillain: supervillainId,
    votes: votes,
    ballots: ballots,
    perVoter: perVoter,
    banished: banished,
    tie: tie,
    speeches: speeches
};
    }

    function runFinaleEpisode6(ep){
      var E = state.episodes[ep];
      if(!E) return;

      var alive = aliveIds();
      if(!alive.length) return;

      var supervillainId = (E.daily && E.daily.winners && E.daily.winners[0]) || null;
      E.supervillain = supervillainId;

      var remaining = alive.filter(function(id){ return id !== supervillainId; });

      var nominees = pickHitList(supervillainId, remaining, 3);
      var autoFinalist = remaining.filter(function(id){ return nominees.indexOf(id) === -1; })[0] || null;

      E.hitlist = {
        nominees: nominees.slice(),
        autoFinalist: autoFinalist
      };

      E.redemption = runRedemption(ep, nominees);
      var redemptionWinner = E.redemption && E.redemption.winner;

      var losers = nominees.filter(function(id){ return id !== redemptionWinner; });
      losers.forEach(function(id){
        var pl = state.players.find(function(p){ return p.id === id; });
        if(pl) pl.alive = false;
        state.placements.eliminated.push({ id:id, episode:ep, reason:"redemption_lost" });
      });

      var finalists = [];
      if(supervillainId) finalists.push(supervillainId);
      if(autoFinalist) finalists.push(autoFinalist);
      if(redemptionWinner) finalists.push(redemptionWinner);
      E.finalists = finalists.slice();

      var jurors = state.players
        .filter(function(p){ return p.alive === false; })
        .map(function(p){ return p.id; });

      var ballots   = {};
      var voteLists = {};
      finalists.forEach(function(id){
        voteLists[id] = [];
      });

      var perVoter = [];

      jurors.forEach(function(j){
        var sorted = finalists.slice().sort(function(a,b){
          var ra = rel(j,a), rb = rel(j,b);
          if (ra !== rb) return rb - ra;
          return Math.random() < 0.5 ? -1 : 1;
        });
        var target = sorted[0];

        if (!voteLists[target]) voteLists[target] = [];
        voteLists[target].push(j);
        ballots[j] = target;

        perVoter.push({ voter:j, target:target });
      });

      var vArr = finalists.map(function(id){
        var list = voteLists[id] || [];
        return { id:id, votes:list.length };
      }).sort(function(a,b){
        return b.votes - a.votes;
      });

      if (finalists.length === 3 && vArr[0] && vArr[1] &&
          vArr[0].votes === vArr[1].votes){
        var tied = vArr.filter(function(x){ return x.votes === vArr[0].votes; })
                       .map(function(x){ return x.id; });
        var thirdId = finalists.filter(function(id){
          return tied.indexOf(id) === -1;
        })[0];

        if (thirdId){
          var sortedTie = tied.slice().sort(function(a,b){
            var ra = rel(thirdId,a), rb = rel(thirdId,b);
            if (ra !== rb) return rb - ra;
            return Math.random() < 0.5 ? -1 : 1;
          });
          var extraTarget = sortedTie[0];

          if (!voteLists[extraTarget]) voteLists[extraTarget] = [];
          voteLists[extraTarget].push(thirdId);
          ballots[thirdId] = extraTarget;

          perVoter.push({
            voter: thirdId,
            target: extraTarget,
            tieBreak: true
          });

          vArr = finalists.map(function(id){
            var list2 = voteLists[id] || [];
            return { id:id, votes:list2.length };
          }).sort(function(a,b){
            return b.votes - a.votes;
          });
        }
      }

      var winner = vArr[0] ? vArr[0].id : null;
      var second = vArr[1] ? vArr[1].id : null;
      var third  = vArr[2] ? vArr[2].id : null;

      state.placements.winner = winner;
      state.placements.second = second;
      state.placements.third  = third;

      E.jury = {
        jurors:  jurors,
        ballots: ballots,
        votes:   voteLists,
        perVoter: perVoter
      };
}

    function simulateSeason(){
      state.episodes = {};
      state.ui = {};
      state.chart = { finalized: false, episodes: {} };
      state.stats = {
        battleWins: {},
        nominations: {},
        redemptionWins: {},
        banishmentSeats: {}
      };

      state.placements = {
        winner: null,
        second: null,
        third: null,
        eliminated: []
      };

      for (var ep = 1; ep <= 6; ep++) {
        var E = state.episodes[ep] = {
          status: aliveIds().slice()
        };

        if (ep >= 1 && ep <= 4) {
          E.events1 = genHouseEvents();
          E.daily = computeDaily(ep);
          E.events2 = genHouseEvents();
          var aliveNow = aliveIds();
          var sv1 = (E.daily && E.daily.winners && E.daily.winners[0]) || (aliveNow.length ? sample(aliveNow) : null);
          E.supervillain = sv1;
          if (sv1) bump(state.stats.battleWins, sv1);
          var candidates1 = aliveNow.filter(function(id){ return id !== sv1; });
          var nominees3 = pickHitList(sv1, candidates1, 3);
          E.hitlist = {
            nominees: nominees3.slice()
          };


          E.events3 = genHouseEvents();
          E.redemption = runRedemption(ep, nominees3);
          var saved = E.redemption && E.redemption.winner;
          var finalNominees = nominees3.filter(function(id){ return id !== saved; });
          E.banishment = runBanishment(ep, finalNominees, sv1);
        }

        else if (ep === 5) {
          E.events1 = genHouseEvents();
          E.daily = computeDaily(ep);
          E.events2 = genHouseEvents();

          var aliveNow5 = aliveIds();
          var sv5 = (E.daily && E.daily.winners && E.daily.winners[0]) || (aliveNow5.length ? sample(aliveNow5) : null);
          E.supervillain = sv5;
          if (sv5) bump(state.stats.battleWins, sv5);
          var candidates5 = aliveNow5.filter(function(id){ return id !== sv5; });
          var nominees2 = pickHitList(sv5, candidates5, 2);
          E.hitlist = {
            nominees: nominees2.slice()
          };

          E.events3 = genHouseEvents();
          E.banishment = runBanishment(ep, nominees2, sv5);
        }

        else if (ep === 6) {
          E.events1 = genHouseEvents();
          E.daily = computeDaily(ep);
          E.events2 = genHouseEvents();
          runFinaleEpisode6(ep);
        }
      }

      state.chart.finalized = true;
    }

    function buildLeftAccordion(){
      elAccordion.innerHTML = "";

      for (var e = 1; e <= 6; e++) {
        var details = document.createElement("details");
        details.className = "details-ep";
        if (e === 1) details.open = true;

        var inner =
          '<summary>Episode ' + e + '</summary>' +
          '<div class="section-box"><div class="section-links">';

        inner += '<button class="btn" data-ep="' + e + '" data-sec="status">Status</button>';
        if (e === 1) {
          inner += '<button class="btn" data-ep="' + e + '" data-sec="format">Format</button>';
        }

        inner += '<button class="btn" data-ep="' + e + '" data-sec="events1">House Events 1</button>';
        inner += '<button class="btn" data-ep="' + e + '" data-sec="daily">Battle Royale Challenge</button>';
        inner += '<button class="btn" data-ep="' + e + '" data-sec="events2">House Events 2</button>';

        if (e >= 1 && e <= 4) {
          inner += '<button class="btn" data-ep="' + e + '" data-sec="hitlist">Hit List Nominations</button>';
          inner += '<button class="btn" data-ep="' + e + '" data-sec="redemption">Redemption Challenge</button>';
          inner += '<button class="btn" data-ep="' + e + '" data-sec="events3">House Events 3</button>';
          inner += '<button class="btn" data-ep="' + e + '" data-sec="banishment">Banishment</button>';
        } else if (e === 5) {
          inner += '<button class="btn" data-ep="' + e + '" data-sec="hitlist">Hit List Nominations</button>';
          inner += '<button class="btn" data-ep="' + e + '" data-sec="events3">House Events 3</button>';
          inner += '<button class="btn" data-ep="' + e + '" data-sec="banishment">Banishment</button>';
        } else if (e === 6) {
          inner += '<button class="btn" data-ep="' + e + '" data-sec="hitlist">Hit List Nominations</button>';
          inner += '<button class="btn" data-ep="' + e + '" data-sec="redemption">Redemption Challenge</button>';
          inner += '<button class="btn" data-ep="' + e + '" data-sec="jury">Jury Vote</button>';
          inner += '<button class="btn" data-ep="' + e + '" data-sec="final_results">Final Results</button>';
        }

        inner += '</div></div>';
        details.innerHTML = inner;
        elAccordion.appendChild(details);
      }

      statsPanel.style.display = state.simulated ? "block" : "none";

      elAccordion.querySelectorAll(".section-links .btn").forEach(function (b) {
        b.onclick = function () {
          elAccordion.querySelectorAll(".section-links button").forEach(function (x) {
            x.classList.remove("active");
          });
          b.classList.add("active");
          showEpisodeSection(+b.dataset.ep, b.dataset.sec);
        };
      });
    }

    function statusCard(pid){
      var card=document.createElement("div"); card.className="status-card";
      card.innerHTML = '<img class="avatar" src="'+picOf(pid)+'" alt=""><div class="name">'+nameOf(pid)+'</div>';
      return card;
    }
    function statusCardSquare(pid, extra){
      var card=document.createElement("div"); card.className="status-card square"+(extra?(" "+extra):"");
      card.innerHTML = '<img class="avatar" src="'+picOf(pid)+'" alt=""><div class="name">'+nameOf(pid)+'</div>';
      return card;
    }
    function labelUnder(node, text){
      var lab=document.createElement("div"); lab.className="badge muted"; lab.textContent=text; node.appendChild(lab); return node;
    }

    function renderHighlightsInto(container, comments, weights, idsPool){
      var wrap=document.createElement("div"); wrap.className="events-grid three-cols";
      var pool=(idsPool && idsPool.length? idsPool.slice() : aliveIds());
      var scored = pool.map(function(pid){ return {pid:pid, score:scorePlayerWeighted(weights||{}, pid)}; })
                       .sort(function(a,b){return b.score-a.score;});
      var desired = 6;
      var take = Math.min(desired, scored.length);
      var pos=(comments&&comments.positive)||[], neu=(comments&&comments.neutral)||[], neg=(comments&&comments.negative)||[];
      for(var i=0;i<take;i++){
        var bucket = (i < Math.ceil(take/3)) ? pos : (i < Math.ceil(2*take/3) ? neu : neg);
        var template = (bucket && bucket.length) ? sample(bucket) : "{A} competes.";
        var text = template.replaceAll("{A}", nameOf(scored[i].pid)).replaceAll("{B}", nameOf(scored[(i+1)%take]?.pid||scored[i].pid));
        var card=document.createElement("div"); card.className="mini-card";
        card.innerHTML = '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(scored[i].pid)+'" alt=""></div><div>'+text+'</div>';
        wrap.appendChild(card);
      }
      container.innerHTML=""; container.appendChild(wrap);
    }

    function renderHighlightsInline(container, comments, weights, idsPool){
      var wrap=document.createElement("div"); wrap.className="hl-inline";
      var pool=(idsPool && idsPool.length? idsPool.slice() : aliveIds());
      var scored = pool.map(function(pid){ return {pid:pid, score:scorePlayerWeighted(weights||{}, pid)}; })
                       .sort(function(a,b){return b.score - a.score;});
      var take=Math.min(6, scored.length);
      var pos=(comments&&comments.positive)||[], neu=(comments&&comments.neutral)||[], neg=(comments&&comments.negative)||[];
      for(var i=0;i<take;i++){
        var bucket = (i < Math.ceil(take/3)) ? pos : (i < Math.ceil(2*take/3) ? neu : neg);
        var template = (bucket && bucket.length) ? sample(bucket) : "{A} competes.";
        var text = template.replaceAll("{A}", nameOf(scored[i].pid)).replaceAll("{B}", nameOf(scored[(i+1)%take]?.pid||scored[i].pid));
        var card=document.createElement("div"); card.className="mini-card";
        card.innerHTML = '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(scored[i].pid)+'" alt=""></div><div>'+text+'</div>';
        wrap.appendChild(card);
      }
      container.innerHTML=""; container.appendChild(wrap);
    }

    function renderDailyHighlightsPairs(container, comments, teams){
      var wrap=document.createElement("div"); wrap.className="events-grid three-cols";
      var desired = Math.min(6, teams.length);
      var pos=(comments&&comments.positive)||[], neu=(comments&&comments.neutral)||[], neg=(comments&&comments.negative)||[];
      for(var i=0;i<desired;i++){
        var which = i < 2 ? pos : (i < 4 ? neu : neg);
        var t = (which && which.length) ? sample(which) : "{A} and {B} compete.";
        var pair = teams[i];
        var text = (t||"").replaceAll("{A}", nameOf(pair[0])).replaceAll("{B}", nameOf(pair[1]));
        var card=document.createElement("div"); card.className="mini-card";
        card.innerHTML = '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(pair[0])+'" alt=""><img class="avatar xs" src="'+picOf(pair[1])+'" alt=""></div><div>'+text+'</div>';
        wrap.appendChild(card);
      }
      container.innerHTML=""; container.appendChild(wrap);
    }

    function addProceed(ep, section){
      var order;

      if (ep === 1) {
        order = ["status","format","events1","daily","events2","hitlist","redemption","events3","banishment"];
      } else if (ep >= 2 && ep <= 4) {
        order = ["status","events1","daily","events2","hitlist","redemption","events3","banishment"];
      } else if (ep === 5) {
        order = ["status","events1","daily","events2","hitlist","events3","banishment"];
      } else if (ep === 6) {
        order = ["status","events1","daily","events2","hitlist","redemption","jury","final_results"];
      } else {
        order = ["status"];
      }

      var idx = order.indexOf(section);
      var btn = document.createElement("button");
      btn.className = "btn proceed";
      btn.textContent = (section === "final_results") ? "View Placements" : "Proceed";

      btn.onclick = function () {
        if (section === "final_results") {
          showStatisticsPanel("placements");
          btn.remove();
          return;
        }

        if (idx >= 0 && idx < order.length - 1) {
          showEpisodeSection(ep, order[idx + 1]);
          btn.remove();
        }
      };

      epActions.appendChild(btn);
    }

    function showEpisodeSection(ep, section){
      state.lastView={ep:ep,section:section}; 
      State.save(state);

      epActions.innerHTML="";
      var S = state.episodes[ep];
      epTitle.textContent = "Episode " + ep;
      epSub.textContent = "";

      if(!S){
        epContent.innerHTML = '<p class="muted">No data.</p>';
        addProceed(ep, section);
        return;
      }

      if (section === "format" && ep === 1) {
        epSub.textContent = "Format";
        epContent.innerHTML = "";

        var wrap = document.createElement("div");
        wrap.className = "events-grid one-col";

        var box = document.createElement("div");
box.innerHTML =
  "<div class='daily-desc' style='text-align:center;'>" +
    "<strong>House of Villains Format</strong><br><br>" +

    "The format of the show loosely resembles that of the American version of Big Brother. Each week, contestants compete in a Battle Royale challenge to test the players physically, mentally, and emotionally. The winner of the Battle Royale challenge is named Supervillain of the Week and wins immunity for the week, a luxury reward for themselves and two other villains, and the power to nominate three of their fellow players for banishment by putting them on the Hit List.<br><br>" +

    "The three nominees then compete in the Redemption Challenge, with the winner saving themselves from the Hit List. At the Banishment Ceremony, the house votes to banish one of the two remaining Hit List nominees. The villains build alliances, scheme, manipulate, and backstab as they are eliminated one by one until only one remains and is crowned America's Ultimate Supervillain." +
  "</div>";

        wrap.appendChild(box);
        epContent.appendChild(wrap);

        addProceed(ep, section);
        return;
      }

      if(section === "status"){
        epSub.textContent = "Status";
        epContent.innerHTML = "";

        var S2 = state.episodes[ep] || {};
        var alive = S2.status || aliveIds();

        var sec = document.createElement("div");
        sec.className = "status-section";

        var h = document.createElement("div");
        h.className = "status-title";
        h.textContent = "Villains — " + alive.length + " players";
        sec.appendChild(h);

        var grid = document.createElement("div");
        grid.className = "status-grid";
        alive.forEach(function(id){
          grid.appendChild(statusCard(id));
        });
        sec.appendChild(grid);

        epContent.appendChild(sec);
        addProceed(ep, section);
        return;
      }

if(section === "status"){
  epSub.textContent = "Status";
  epContent.innerHTML = "";

  var S = state.episodes[ep] || {};
  var alive = S.status || aliveIds();

  var sec = document.createElement("div");
  sec.className = "status-section";

  var h = document.createElement("div");
  h.className = "status-title";
  h.textContent = "Villains — " + alive.length + " players";
  sec.appendChild(h);

  var grid = document.createElement("div");
  grid.className = "status-grid";
  alive.forEach(function(id){
    grid.appendChild(statusCard(id));
  });
  sec.appendChild(grid);

  epContent.appendChild(sec);
  addProceed(ep, section);
  return;
}

      if(section==="events1" || section==="events2"){
        var evs = (section==="events1") ? (S.events1||[]) : (S.events2||[]);
        epSub.textContent = (section==="events1" ? "House Events 1" : "House Events 2");
        var grid=document.createElement("div"); grid.className="events-grid three-cols";
        for(var i=0;i<evs.length;i++){
          var ev=evs[i];
          var card=document.createElement("div"); card.className="mini-card";
          var avatars=document.createElement("div"); avatars.className="row tiny-avatars";
          (ev.players||[]).forEach(function(pid){ var img=document.createElement("img"); img.className="avatar xs"; img.src=picOf(pid); img.alt=""; avatars.appendChild(img); });
          card.innerHTML = avatars.outerHTML + '<div>'+ev.text+'</div>';
          grid.appendChild(card);
        }
        epContent.innerHTML=""; epContent.appendChild(grid); addProceed(ep, section); return;
      }

      if (section === "daily") {
        epSub.textContent = "Daily Challenge";
        epContent.innerHTML = "";

        var E = state.episodes[ep] || {};
        var D = E.daily || null;

        if (!D) {
          epContent.textContent = "No daily challenge was played.";
          addProceed(ep, section);
          return;
        }

        var title = document.createElement("div");
        title.className = "daily-title";
        title.textContent = D.name || ("Battle Royale " + ep);
        epContent.appendChild(title);

        var desc = document.createElement("div");
        desc.className = "daily-desc";
        desc.textContent = D.description || "";
        desc.style.textAlign = "center";
        epContent.appendChild(desc);

        var highlights = Array.isArray(D.highlights) ? D.highlights.slice() : [];

        if (highlights.length) {
          if (highlights.length > 6) {
            highlights = highlights.slice(0, 6);
          }

          var hlGrid = document.createElement("div");
          hlGrid.className = "events-grid three-cols";

          highlights.forEach(function (h) {
            var text = (typeof h === "string") ? h : (h.text || "");
            var players = (typeof h === "object" && h && h.players) ? h.players : [];

            var card = document.createElement("div");
            card.className = "mini-card";

            var avatars = document.createElement("div");
            avatars.className = "row tiny-avatars";

            players.forEach(function (pid) {
              var img = document.createElement("img");
              img.className = "avatar xs";
              img.src = picOf(pid);
              img.alt = "";
              avatars.appendChild(img);
            });

            var textDiv = document.createElement("div");
            textDiv.textContent = text;

            card.appendChild(avatars);
            card.appendChild(textDiv);
            hlGrid.appendChild(card);
          });

          epContent.appendChild(hlGrid);
        }

        var btnRow = document.createElement("div");
        btnRow.className = "btn-row";

        var btnResults = document.createElement("button");
        btnResults.className = "btn proceed";
        btnResults.textContent = "Show Results";
        btnRow.appendChild(btnResults);

        epContent.appendChild(btnRow);

        var resultsHolder = document.createElement("div");
        resultsHolder.id = "daily-results-ep" + ep;
        epContent.appendChild(resultsHolder);

        btnResults.onclick = function () {
          if (resultsHolder.childNodes.length) return;

          var order = D.order || [];
          if (!order.length) return;

          var wrap = document.createElement("div");
          wrap.className = "status-grid battle-results";
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.alignItems = "center";

          for (var i = order.length - 1; i >= 0; i--) {
            var pid = order[i];
            var slot = document.createElement("div");
            slot.className = "status-slot";
            slot.style.textAlign = "center";

            if (i === 0) {
              slot.classList.add("glow-gold");
            }

            slot.appendChild(statusCard(pid));

            var label = document.createElement("div");
            label.className = "status-label";
            var place = i + 1;
            label.textContent = ordinal(place) + " Place";
            slot.appendChild(label);

            wrap.appendChild(slot);
          }

          resultsHolder.appendChild(wrap);
        };

        addProceed(ep, section);
        return;
      }

if (section === "events3") {
    var E  = state.episodes[ep] || {};
    var ev = E.events3 || [];

    epSub.textContent = "House Events (3)";
    epContent.innerHTML = "";

    if (!ev.length) {
        epContent.innerHTML = '<div class="mini-card note">No events.</div>';
        addProceed(ep, section);
        return;
    }

    var grid = document.createElement("div");
    grid.className = "events-grid three-cols";

    ev.forEach(function (item) {
        var card = document.createElement("div");
        card.className = "mini-card";

        var row = document.createElement("div");
        row.className = "row tiny-avatars";
        (item.players || []).forEach(function(pid){
            var img = document.createElement("img");
            img.className = "avatar xs";
            img.src = picOf(pid);
            img.alt = "";
            row.appendChild(img);
        });
        card.appendChild(row);

        var txt = document.createElement("div");
        txt.textContent = item.text || "";
        card.appendChild(txt);

        grid.appendChild(card);
    });

    epContent.appendChild(grid);
    addProceed(ep, section);
    return;
}

      if (section === "hitlist") {
        var E = state.episodes[ep] || {};
        var H = E.hitList || E.hitlist || {};
        var sv = E.supervillain;

        epSub.textContent = "Hit List Nominations";
        epContent.innerHTML = "";

        var note = document.createElement("div");
        note.className = "mini-card center-text";

        var numNoms = (H.nominees || []).length;
        var baseText = "Supervillain " +
          (sv ? ("<strong>" + nameOf(sv) + "</strong>") : "the Supervillain") +
          " nominates " +
          (numNoms === 1 ? "1 villain" : (numNoms + " villains")) +
          " for the Hit List.";

        if (ep === 6 && H.autoFinalist) {
          baseText += " One villain is automatically safe and becomes a finalist.";
        }

        note.innerHTML = "<p>" + baseText + "</p>";
        epContent.appendChild(note);

        if (sv) {
          var secSv = document.createElement("div");
          secSv.className = "status-section";
          secSv.innerHTML = '<h3 class="status-title">Supervillain of the Week</h3>';

          var gridSv = document.createElement("div");
          gridSv.className = "status-grid";
          gridSv.appendChild(statusCard(sv));
          secSv.appendChild(gridSv);

          epContent.appendChild(secSv);
        }

var secAuto = null;
var gridAuto = null;

if (ep === 6 && H.autoFinalist) {
  secAuto = document.createElement("div");
  secAuto.className = "status-section";
  secAuto.innerHTML = '<h3 class="status-title">Automatic Finalist</h3>';

  gridAuto = document.createElement("div");
  gridAuto.className = "status-grid";
  gridAuto.appendChild(statusCard(H.autoFinalist));

  secAuto.appendChild(gridAuto);
}

        if (H.nominees && H.nominees.length) {
          var secNom = document.createElement("div");
          secNom.className = "status-section";

          var hNom = document.createElement("div");
          hNom.className = "status-title";
          hNom.textContent = "On the Hit List";
          secNom.appendChild(hNom);

          var gridNom = document.createElement("div");
          gridNom.className = "status-grid";
          secNom.appendChild(gridNom);

          var btnReveal = document.createElement("button");
          btnReveal.className = "btn proceed";
          btnReveal.textContent = "Reveal Nominees";

btnReveal.onclick = function () {
  if (gridNom.childNodes.length) return;

  (H.nominees || []).forEach(function (pid) {
    gridNom.appendChild(statusCard(pid));
  });

  if (secAuto && !secAuto.parentNode) {
    epContent.appendChild(secAuto);
  }
};

          var btnRow = document.createElement("div");
          btnRow.className = "btn-row";
          btnRow.appendChild(btnReveal);
          epContent.appendChild(btnRow);
          epContent.appendChild(secNom);
        }

        addProceed(ep, section);
        return;
      }

      if (section === "redemption") {
        epSub.textContent = "Redemption Challenge";
        epContent.innerHTML = "";

        var E = state.episodes[ep] || {};
        var R = E.redemption || null;

        if (!R) {
          epContent.textContent = "No redemption challenge was played.";
          addProceed(ep, section);
          return;
        }

        var title = document.createElement("div");
        title.className = "daily-title";
        title.textContent = R.name || "Redemption Challenge";
        epContent.appendChild(title);

        var desc = document.createElement("div");
        desc.className = "daily-desc";
        desc.textContent = R.description || "";
        desc.style.textAlign = "center";
        epContent.appendChild(desc);

        var highlights = Array.isArray(R.highlights) ? R.highlights.slice() : [];

        if (highlights.length) {
          if (highlights.length > 6) {
            highlights = highlights.slice(0, 3);
          }

          var hlGrid = document.createElement("div");
          hlGrid.className = "events-grid three-cols";

          highlights.forEach(function (h) {
            var text = (typeof h === "string") ? h : (h.text || "");
            var players = (typeof h === "object" && h && h.players) ? h.players : [];

            var card = document.createElement("div");
            card.className = "mini-card";

            var avatars = document.createElement("div");
            avatars.className = "row tiny-avatars";

            players.forEach(function (pid) {
              var img = document.createElement("img");
              img.className = "avatar xs";
              img.src = picOf(pid);
              img.alt = "";
              avatars.appendChild(img);
            });

            var textDiv = document.createElement("div");
            textDiv.textContent = text;

            card.appendChild(avatars);
            card.appendChild(textDiv);
            hlGrid.appendChild(card);
          });

          epContent.appendChild(hlGrid);
        }

        var btnRow = document.createElement("div");
        btnRow.className = "btn-row";

        var btnResults = document.createElement("button");
        btnResults.className = "btn proceed";
        btnResults.textContent = "Show Results";
        btnRow.appendChild(btnResults);

        epContent.appendChild(btnRow);

        var resultsHolder = document.createElement("div");
        resultsHolder.id = "redemption-results-ep" + ep;
        epContent.appendChild(resultsHolder);

        btnResults.onclick = function () {
          if (resultsHolder.childNodes.length) return;

          var order = R.order || [];
          if (!order.length) return;

          var wrap = document.createElement("div");
          wrap.className = "status-grid redemption-results";
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.alignItems = "center";

          for (var i = order.length - 1; i >= 0; i--) {
            var pid = order[i];
            var slot = document.createElement("div");
            slot.className = "status-slot";
            slot.style.textAlign = "center";

            if (i === 0) {
              slot.classList.add("glow-gold");
            }

            slot.appendChild(statusCard(pid));

            var label = document.createElement("div");
            label.className = "status-label";
            var place = i + 1;
            label.textContent = ordinal(place) + " Place";
            slot.appendChild(label);

            wrap.appendChild(slot);
          }

          resultsHolder.appendChild(wrap);

          if (R.winner) {
            var msg = document.createElement("p");
            msg.className = "center-text";
            msg.style.marginTop = "10px";
            msg.innerHTML =
              nameOf(R.winner) +
              " wins the Redemption Challenge and is now safe from Banishment.";
            resultsHolder.appendChild(msg);
          }
        };

        addProceed(ep, section);
        return;
      }

if (section === "banishment") {
  epSub.textContent = "Banishment";
  epContent.innerHTML = "";

  var E = state.episodes[ep] || {};
  var B = E.banishment || null;

  if (!B || !Array.isArray(B.nominees) || !B.nominees.length) {
    epContent.appendChild(divDesc("No Banishment data found for this episode."));
    addProceed(ep, section);
    return;
  }

  var nominees = B.nominees.slice(0, 2);
  var speeches = B.speeches || {};

  (function buildSpeeches() {
var speechSection = document.createElement("div");
speechSection.className = "status-section";
speechSection.style.textAlign = "center";
speechSection.style.display = "flex";
speechSection.style.flexDirection = "column";
speechSection.style.alignItems = "center";

var title = document.createElement("div");
title.className = "status-title";
title.textContent = "Nominee Speeches";
title.style.textAlign = "center";
speechSection.appendChild(title);

    var speechRow = document.createElement("div");
    speechRow.style.display = "flex";
    speechRow.style.justifyContent = "center";
    speechRow.style.alignItems = "stretch";
    speechRow.style.gap = "16px";
    speechRow.style.flexWrap = "wrap";

    nominees.forEach(function (id) {
      var txt = speeches[id] || "";
      var card = document.createElement("div");
      card.className = "mini-card";
      card.style.flex = "0 0 320px";
      card.style.maxWidth = "320px";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.alignItems = "center";
      card.style.textAlign = "center";

      var header = document.createElement("div");
      header.style.display = "flex";
      header.style.flexDirection = "column";
      header.style.alignItems = "center";
      header.style.marginBottom = "8px";

      header.appendChild(statusCardSquare(id));

      var nameEl = document.createElement("div");
      nameEl.textContent = nameOf(id);
      header.appendChild(nameEl);

      card.appendChild(header);

      var textEl = document.createElement("div");
      textEl.className = "house-event-text";
      textEl.textContent = txt;
      card.appendChild(textEl);

      speechRow.appendChild(card);
    });

    speechSection.appendChild(speechRow);
    epContent.appendChild(speechSection);
  })();

(function buildVotes() {
  var votesSection = document.createElement("div");
  votesSection.className = "status-section";

  var btnRow = document.createElement("div");
  btnRow.className = "btn-row";
  btnRow.style.justifyContent = "center";

  var btnVotes = document.createElement("button");
  btnVotes.className = "btn";
  btnVotes.textContent = "Show Votes";
  btnRow.appendChild(btnVotes);

  var votesButtonRow = document.createElement("div");
votesButtonRow.style.display = "flex";
votesButtonRow.style.justifyContent = "center";
votesButtonRow.style.width = "100%";
votesButtonRow.appendChild(btnVotes);
votesSection.appendChild(votesButtonRow);

  var votesHolder = document.createElement("div");
  votesHolder.style.marginTop = "12px";
  votesSection.appendChild(votesHolder);

  epContent.appendChild(votesSection);

  btnVotes.onclick = function () {
    if (votesHolder.children.length) return;

    var perV = B.perVoter || [];

    perV.forEach(function (v) {
      var row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "center";
      row.style.gap = "8px";
      row.style.marginBottom = "8px";
      row.style.flexWrap = "nowrap";

      var voterCard = statusCardSquare(v.voter);
      var text = document.createElement("span");
      text.textContent = "has voted for";
      var targetCard = statusCardSquare(v.target);

      row.appendChild(voterCard);
      row.appendChild(text);
      row.appendChild(targetCard);

      if (v.tieBreaker) {
        var tb = document.createElement("span");
        tb.textContent = " (Supervillain tie-breaker)";
        row.appendChild(tb);
      }

      votesHolder.appendChild(row);
    });
  };
})();

(function buildEliminated() {
  var elimSection = document.createElement("div");
  elimSection.className = "status-section";
  elimSection.style.marginTop = "16px";

  var btnRow = document.createElement("div");
  btnRow.className = "btn-row";
  btnRow.style.justifyContent = "center";

  var btnElim = document.createElement("button");
  btnElim.className = "btn";
  btnElim.textContent = "Show Eliminated";
  btnRow.appendChild(btnElim);

  var elimButtonRow = document.createElement("div");
elimButtonRow.style.display = "flex";
elimButtonRow.style.justifyContent = "center";
elimButtonRow.style.width = "100%";
elimButtonRow.appendChild(btnElim);
elimSection.appendChild(elimButtonRow);

  var elimHolder = document.createElement("div");
  elimHolder.style.marginTop = "12px";
  elimSection.appendChild(elimHolder);

  epContent.appendChild(elimSection);

  btnElim.onclick = function () {
    if (elimHolder.children.length) return;

    var banishedId = B.banished;
    if (!banishedId) {
      elimHolder.textContent = "No one was banished.";
      return;
    }

    var rawVotes = (B.votes && B.votes[banishedId]) || [];
    var totalVotes = Array.isArray(rawVotes) ? rawVotes.length : (+rawVotes || 0);

    var wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.alignItems = "center";
    wrap.style.justifyContent = "center";

    var slot = document.createElement("div");
    slot.style.border = "2px solid #ff3366";
    slot.style.borderRadius = "16px";
    slot.style.padding = "8px";
    slot.style.marginBottom = "8px";

    slot.appendChild(statusCardSquare(banishedId));
    wrap.appendChild(slot);

    var txt = document.createElement("div");
    txt.style.textAlign = "center";
    txt.textContent =
      nameOf(banishedId) +
      ", with " +
      totalVotes +
      " vote" +
      (totalVotes === 1 ? "" : "s") +
      ", you have been Banished.";

    wrap.appendChild(txt);

    elimHolder.appendChild(wrap);
  };
})();

  var btnRowProceed = document.createElement("div");
btnRowProceed.style.display = "flex";
btnRowProceed.style.justifyContent = "center";
btnRowProceed.style.width = "100%";

var btnProceed = document.createElement("button");
btnProceed.className = "btn proceed";
btnProceed.textContent = "Proceed";

btnProceed.onclick = function () {
  var nextEp = ep + 1;
  if (state.episodes[nextEp]) {
    showEpisodeSection(nextEp, "status");
    state.lastView = { ep: nextEp, section: "status" };
    State.save(state);
  }
};

btnRowProceed.appendChild(btnProceed);
epActions.appendChild(btnRowProceed);
  return;
}

if (ep === 6 && section === "jury") {

    epContent.innerHTML = "";
    epActions.innerHTML = "";

    var E6 = state.episodes[6] || {};
    epTitle.textContent = "Jury Votes";
    epSub.textContent = "";

    var finalists = E6.finalists || [];
    var jury = E6.jury || {};
    var perVoter = jury.perVoter || [];

    var speechTitle = document.createElement("div");
    speechTitle.className = "status-title";
    speechTitle.textContent = "Finalist Speeches";
    speechTitle.style.textAlign = "center";
    epContent.appendChild(speechTitle);

    var speechRow = document.createElement("div");
    speechRow.style.display = "flex";
    speechRow.style.justifyContent = "center";
    speechRow.style.gap = "16px";
    speechRow.style.flexWrap = "wrap";
    epContent.appendChild(speechRow);

    finalists.forEach(function(pid){
        var box = document.createElement("div");
        box.className = "mini-card";
        box.style.width = "300px";

        box.appendChild(statusCard(pid));

        var line = "";
        try {
            var pools = window.hov_speeches && window.hov_speeches.winner;
            if (pools) {
                var types = Object.keys(pools);
                var tp = types[Math.floor(Math.random() * types.length)];
                var arr = pools[tp];
                var chosen = arr[Math.floor(Math.random() * arr.length)];
                line = chosen.replace("{A}", nameOf(pid));
            }
        } catch(e){ line = nameOf(pid) + " campaigns for your vote."; }

        var p = document.createElement("p");
        p.textContent = line;
        p.style.marginTop = "8px";
        box.appendChild(p);

        speechRow.appendChild(box);
    });

    var votesHolder = document.createElement("div");
    votesHolder.style.marginTop = "20px";
    epContent.appendChild(votesHolder);

    var btnVotes = document.createElement("button");
    btnVotes.className = "btn";
    btnVotes.textContent = "Show Votes";

    var centerVotes = document.createElement("div");
    centerVotes.style.textAlign = "center";
    centerVotes.style.width = "100%";
    centerVotes.appendChild(btnVotes);
    epActions.appendChild(centerVotes);

    btnVotes.onclick = function(){
        btnVotes.disabled = true;
        votesHolder.innerHTML = "";

        perVoter.forEach(function(v){
            var row = document.createElement("div");
            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.justifyContent = "center";
            row.style.gap = "10px";
            row.style.marginBottom = "10px";

            row.appendChild(statusCard(v.voter));

            var mid = document.createElement("span");
            mid.textContent = "has voted for";
            row.appendChild(mid);

            row.appendChild(statusCard(v.target));

            votesHolder.appendChild(row);
        });
    };

    var winnerHolder = document.createElement("div");
    winnerHolder.style.marginTop = "30px";
    epContent.appendChild(winnerHolder);

    var btnWinner = document.createElement("button");
    btnWinner.className = "btn";
    btnWinner.textContent = "Show Winner";

    var centerWinner = document.createElement("div");
    centerWinner.style.textAlign = "center";
    centerWinner.style.width = "100%";
    centerWinner.appendChild(btnWinner);
    epActions.appendChild(centerWinner);

    btnWinner.onclick = function(){
        btnWinner.disabled = true;
        winnerHolder.innerHTML = "";

        var voteTallies = {};
        finalists.forEach(function(id){ voteTallies[id] = 0; });

        perVoter.forEach(function(v){ voteTallies[v.target]++; });

        var sorted = finalists.slice().sort(function(a,b){
            return voteTallies[b] - voteTallies[a];
        });

        var w = sorted[0];
        var votes = voteTallies[w] || 0;

var wrap = document.createElement("div");
wrap.style.textAlign = "center";

var card = statusCard(w);
card.style.border = "3px solid gold";
card.style.boxShadow = "0 0 10px gold";
card.style.display = "block";
card.style.margin = "0 auto";

wrap.appendChild(card);

        var txt = document.createElement("div");
        txt.style.marginTop = "10px";
        txt.textContent = nameOf(w) + ", with " + votes + " votes, you are the winner of House of Villains!";
        wrap.appendChild(txt);

        winnerHolder.appendChild(wrap);

        state.placements.winner = w;
    };

    var btnProceed = document.createElement("button");
    btnProceed.className = "btn proceed-btn";
    btnProceed.textContent = "Proceed";
    btnProceed.onclick = function(){
        showEpisodeSection(6, "final_results");
    };

    var wrapP = document.createElement("div");
    wrapP.style.textAlign = "center";
    wrapP.appendChild(btnProceed);
    epActions.appendChild(wrapP);

    return;
}

if (ep === 6 && section === "final_results") {

    epContent.innerHTML = "";
    epActions.innerHTML = "";

    epTitle.textContent = "Final Results";
    epSub.textContent = "";

    var winner = state.placements.winner;

var box = document.createElement("div");
box.style.textAlign = "center";

var card = statusCard(winner);
card.style.border = "3px solid gold";
card.style.boxShadow = "0 0 10px gold";
card.style.display = "block";
card.style.margin = "0 auto";

box.appendChild(card);

    var txt = document.createElement("div");
    txt.style.marginTop = "10px";
    txt.textContent = nameOf(winner) + " is the winner of House of Villains!";
    box.appendChild(txt);

    epContent.appendChild(box);

    var btnProc = document.createElement("button");
    btnProc.className = "btn proceed-btn";
    btnProc.textContent = "Proceed";
btnProc.onclick = function () {
  showStatisticsPanel("placements");
};


    var w2 = document.createElement("div");
    w2.style.textAlign = "center";
    w2.appendChild(btnProc);
    epActions.appendChild(w2);

    return;
}

      if(/^final[1-6]$/.test(section) && ep===11){
        var idx=parseInt(section.replace("final",""),10)-1;
        var st=(S.final&&S.final.stages) ? S.final.stages[idx] : null;
        var name= st ? st.name : ("Final Stage "+(idx+1));
        epContent.innerHTML="";
        var title=document.createElement("div"); title.className="challenge-name"; title.textContent=name;
        var desc=document.createElement("div"); desc.className="mini-card note"; desc.innerHTML='<div><strong>Description:</strong> '+(st && st.description || "")+'</div>';
        epContent.appendChild(title); epContent.appendChild(desc);

        var btnH=document.createElement("button"); btnH.className="btn"; btnH.textContent="Show Highlights";
        btnH.onclick=function(){
          if(st){
            var hl=document.createElement("div");
            renderHighlightsInto(hl,(st.comments||{}),(window.D2_FINAL_STAGES_DATA[idx]||{}).skillWeights||{},(st.maleOrder||[]).concat(st.femaleOrder||[]));
            epContent.appendChild(hl); btnH.remove();
          }
        };
        epActions.appendChild(btnH);

        addProceed(ep, section); return;
      }

      if(section==="final_results" && ep===11){
        var R = (S.final && S.final.results) ? S.final.results : {male:[],female:[]};
        epContent.innerHTML="";
        var note=document.createElement("div"); note.className="mini-card note";
        note.innerHTML='<div>After a grueling season and six final stages, your finalists left it all out there. Let’s reveal the podium…</div>';
        epContent.appendChild(note);

        var btn3=document.createElement("button"); btn3.className="btn"; btn3.textContent="Reveal 3rd Place";
        btn3.onclick=function(){
          var wrap=document.createElement("div"); wrap.className="status-grid";
          if(R.male[2]){ var m=statusCardSquare(R.male[2]); m.classList.add("border-bronze"); wrap.appendChild(m); }
          if(R.female[2]){ var f=statusCardSquare(R.female[2]); f.classList.add("border-bronze"); wrap.appendChild(f); }
          epContent.appendChild(wrap); epContent.appendChild(document.createElement("div")).className="final-spacer"; btn3.remove();

          var btn2=document.createElement("button"); btn2.className="btn"; btn2.textContent="Reveal 2nd Place";
          btn2.onclick=function(){
            var wrap2=document.createElement("div"); wrap2.className="status-grid";
            if(R.male[1]){ var m2=statusCardSquare(R.male[1]); m2.classList.add("border-silver"); wrap2.appendChild(m2); }
            if(R.female[1]){ var f2=statusCardSquare(R.female[1]); f2.classList.add("border-silver"); wrap2.appendChild(f2); }
            epContent.appendChild(wrap2); epContent.appendChild(document.createElement("div")).className="final-spacer"; btn2.remove();

            var btn1=document.createElement("button"); btn1.className="btn"; btn1.textContent="Reveal Winners";
            btn1.onclick=function(){
              var wrap3=document.createElement("div"); wrap3.className="status-grid";
              if(R.male[0]){ var m1=statusCardSquare(R.male[0]); m1.classList.add("border-gold"); wrap3.appendChild(m1); }
              if(R.female[0]){ var f1=statusCardSquare(R.female[0]); f1.classList.add("border-gold"); wrap3.appendChild(f1); }
              epContent.appendChild(wrap3); btn1.remove();
              addProceed(ep, section);
            };
            epActions.appendChild(btn1);
          };
          epActions.appendChild(btn2);
        };
        epActions.appendChild(btn3);
        return;
      }

      epContent.innerHTML='<p class="muted">No data.</p>';
      addProceed(ep, section);
    }

    function showStatisticsPanel(kind){
      viewCast.hidden = true;
      viewEpisode.hidden = false;
      epActions.innerHTML = "";

      if (kind === "placements") {
        epTitle.textContent = "Placements";
        epSub.textContent   = "Season Results";
        epContent.innerHTML = "";

        var placements = [];

        if (state.placements && state.placements.winner) {
          placements.push({ id: state.placements.winner, place: 1 });

          if (state.placements.second) {
            placements.push({ id: state.placements.second, place: 2 });
          }
          if (state.placements.third) {
            placements.push({ id: state.placements.third, place: 3 });
          }

          var elim = (state.placements.eliminated || []).slice().sort(function (a, b) {
            return b.episode - a.episode;
          });

          for (var i = 0; i < elim.length; i++) {
            placements.push({ id: elim[i].id, place: 4 + i });
          }
        }

        if (!placements.length) {
          epContent.innerHTML = '<p class="muted">No data yet.</p>';
          return;
        }

        function placeCard(entry, labelOverride) {
          var card = statusCardSquare(entry.id);
          labelUnder(card, labelOverride || (ordinal(entry.place) + " Place"));
          return card;
        }

        var rowWin = document.createElement("div");
        rowWin.className = "placements-row";

        var winnerEntry = placements.find(function (p) { return p.place === 1; });
        if (winnerEntry) {
          var wCard = placeCard(winnerEntry, "Winner");
          wCard.classList.add("border-gold");
          rowWin.appendChild(wCard);
        }
        epContent.appendChild(rowWin);

        var rowFinal = document.createElement("div");
        rowFinal.className = "placements-row";

        var secondEntry = placements.find(function (p) { return p.place === 2; });
        var thirdEntry  = placements.find(function (p) { return p.place === 3; });

        if (secondEntry) {
          var sCard = placeCard(secondEntry, "2nd Place");
          sCard.classList.add("border-silver");
          rowFinal.appendChild(sCard);
        }
        if (thirdEntry) {
          var tCard = placeCard(thirdEntry, "3rd Place");
          tCard.classList.add("border-bronze");
          rowFinal.appendChild(tCard);
        }
        epContent.appendChild(rowFinal);

        var rest = placements.filter(function (p) { return p.place >= 4; });

        if (rest.length) {
          var row = null;
          rest.forEach(function (p, idx) {
            if (idx % 4 === 0) {
              row = document.createElement("div");
              row.className = "placements-row";
              epContent.appendChild(row);
            }
            row.appendChild(placeCard(p));
          });
        }

        var btn = document.createElement("button");
        btn.className = "btn proceed";
        btn.textContent = "Proceed";
        btn.onclick = function () {
          showStatisticsPanel("other");
          btn.remove();
        };
        epActions.appendChild(btn);

        return;
      }

      if (kind === "other") {
        epTitle.textContent = "Other Statistics";
        epSub.textContent = "Leaders and tallies";

        epContent.innerHTML = "";

        var tbl = document.createElement("table");
        tbl.className = "stats-table";

        var thead = document.createElement("thead");
        thead.innerHTML =
          "<tr>" +
            "<th>Category</th>" +
            "<th>Name</th>" +
            "<th>Value</th>" +
          "</tr>";
        tbl.appendChild(thead);

        var tbody = document.createElement("tbody");

        function row(category, name, value) {
          var tr = document.createElement("tr");
          tr.innerHTML =
            "<td class='stat-cat'>"   + (category || "—") + "</td>" +
            "<td class='stat-name'>"  + (name || "—")     + "</td>" +
            "<td class='stat-value'>" + (value || "—")    + "</td>";
          tbody.appendChild(tr);
        }

        function topOfMap(map) {
          var ids = Object.keys(map || {});
          var best = [];
          var max = -1;

          ids.forEach(function (id) {
            var v = +((map || {})[id] || 0);
            if (v > max) {
              max = v;
              best = [id];
            } else if (v === max) {
              best.push(id);
            }
          });

          return { list: best, value: max };
        }

        var superMap = {};
        var epsObj = state.episodes || {};

        Object.keys(epsObj).forEach(function (key) {
          var E = epsObj[key];
          if (E && E.supervillain) {
            var id = E.supervillain;
            superMap[id] = (superMap[id] || 0) + 1;
          }
        });

        var svStat = topOfMap(superMap);
        row(
          "Supervillain of the Week",
          svStat.list.length ? svStat.list.map(nameOf).join(", ") : "—",
          svStat.list.length ? (svStat.value || 0) : "—"
        );

        var hlStat = topOfMap((state.stats && state.stats.nominations) || {});
        row(
          "Hit List Nominations",
          hlStat.list.length ? hlStat.list.map(nameOf).join(", ") : "—",
          hlStat.list.length ? (hlStat.value || 0) : "—"
        );

        var redStat = topOfMap((state.stats && state.stats.redemptionWins) || {});
        row(
          "Redemption Challenge Wins",
          redStat.list.length ? redStat.list.map(nameOf).join(", ") : "—",
          redStat.list.length ? (redStat.value || 0) : "—"
        );

        var banStat = topOfMap((state.stats && state.stats.banishmentSeats) || {});
        row(
          "Times Up for Banishment",
          banStat.list.length ? banStat.list.map(nameOf).join(", ") : "—",
          banStat.list.length ? (banStat.value || 0) : "—"
        );

        tbl.appendChild(tbody);
        epContent.appendChild(tbl);

        var btn = document.createElement("button");
        btn.className = "btn proceed";
        btn.textContent = "Proceed";
        btn.onclick = function () {
          showStatisticsPanel("chart");
        };
        epActions.appendChild(btn);

        return;
      }

      if (kind === "chart") {
        epTitle.textContent = "Season Chart";
        epSub.textContent = "";
        epContent.innerHTML = "";
        epActions.innerHTML = "";

        var btn3 = document.createElement("button");
        btn3.className = "btn";
        btn3.textContent = "Open Season Chart";
        btn3.onclick = function () {
          location.href = "./season_chart.html";
        };
        epContent.appendChild(btn3);
        return;
      }
}
  })();