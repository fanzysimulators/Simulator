(function(){
    "use strict";

    var IMG_BLANK="BlankProfile.webp";
    var ANTM_ONLY_FEMALE = false; 
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
          src = [].concat(tag(pd.males,"male"), tag(pd.females,"female"), tag(pd.others,null));
        } else { src = []; }
      }
      window.PLAYERS = src;
      window.PLAYERS_BY_ID = Object.fromEntries((src||[]).map(function(p){ return [p.id,p]; }));
    })();

    var KEY="antm-season";
    var State={ load:function(){ try{ return JSON.parse(sessionStorage.getItem(KEY)) || null; }catch(e){ return null; } },
                save:function(s){ sessionStorage.setItem(KEY, JSON.stringify(s)); },
                clear:function(){ sessionStorage.removeItem(KEY); } };

    var state = State.load() || {
      seed: Math.random().toString(36).slice(2,8).toUpperCase(),
      castModels: Array.from({length:16}).map(function(){return null;}),
castSize: 10,
      players: [],
      relationships: {},
      profiles: {},
      episodes: {},
      ui: {},
      stats: {},
      placements: { eliminated: [] },
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
    var elEpisodeList = elAccordion;
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
    function nameOf(pid){
      var all = (state.castModels || []).filter(Boolean);
      var c = all.find(function(x){ return x && x.id===pid; });
      return c ? (c.nickname || c.name || pid) : pid;
    }
    function picOf(pid){
      var all = (state.castModels || []).filter(Boolean);
      var c = all.find(function(x){ return x && x.id===pid; });
      return c ? (c.image || IMG_BLANK) : IMG_BLANK;
    }
    function profileMult(pid, compKey){ var v = skillOf(pid, compKey); return 1 + (v * 0.1); }
    function scorePlayerWeighted(weights, pid){ var s=0; for(var k in (weights||{})){ if(Object.prototype.hasOwnProperty.call(weights,k)){ var w=+weights[k]||0; s += w * profileMult(pid,k); } } return s; }

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
      elFilterShow.onchange = function(){ buildModelsGrid(roster||[]); };
    }

function playerOptions(roster, selectedId){
  var showFilter = elFilterShow.value;
  var filtered = (roster||[]).filter(function(r){
    return (!showFilter || playerHasShow(r, showFilter));
  });

  var opts = ['<option value="">Choose</option>'];
  for (var i=0;i<filtered.length;i++){
    var r = filtered[i];
    var sel = (selectedId && r.id===selectedId) ? " selected" : "";
    opts.push('<option value="'+r.id+'"'+sel+'>'+(r.name || r.nickname || r.id)+'</option>');
  }
  return opts.join("");
}

function buildCastBox(label){
  var box = document.createElement("div");
  box.className = "team-box";
  box.innerHTML =
    '<div class="team-head">' +
      '<span class="label">'+label+'</span>' +
      '<span class="team-tag" style="color:#9fe7ff">Models</span>' +
    '</div>';

  var inner = document.createElement("div");
  inner.className = "team-inner";

  for (var i=0; i<state.castSize; i++){
    var slot = state.castModels[i] || null;
    var title = "Model " + (i+1);

    var card = document.createElement("div");
    card.className = "pick-card";

    card.innerHTML =
      '<img class="avatar" src="'+(slot ? slot.image : IMG_BLANK)+'" alt="">' +
      '<div class="name">'+(slot ? (slot.nickname) : title)+'</div>' +
      '<select class="pick-player" data-slot="'+i+'">'+
        playerOptions(window.PLAYERS||[], slot ? slot.id : "") +
      '</select>' +
      '<button class="btn btn-custom" data-slot="'+i+'" type="button">Custom Player</button>' +
      '<button class="btn btn-delete" data-slot="'+i+'" type="button">Delete Model</button>';

    inner.appendChild(card);
  }

  if (state.castSize < 16){
    var plus = document.createElement("div");
    plus.className = "pick-card";
    plus.style.cursor = "pointer";
    plus.innerHTML =
      '<div class="name" style="font-size:40px;line-height:1;margin-top:10px;">+</div>' +
      '<div class="badge muted" style="margin-top:8px;">Add Model</div>';
    plus.onclick = function(){
      state.castSize = Math.min(16, (state.castSize||10) + 1);
      State.save(state);
      buildModelsGrid(window.PLAYERS || []);
    };
    inner.appendChild(plus);
  }

  box.appendChild(inner);
  return box;
}

function buildModelsGrid(roster){
  elTeams.innerHTML = "";
  elTeams.appendChild(buildCastBox("Cast"));

  elTeams.querySelectorAll(".pick-player").forEach(function(sel){
    sel.onchange = function(e){
      var i = +e.target.dataset.slot;
      var id = e.target.value || "";

      if (!id){
        state.castModels[i] = null;
        while (state.castSize > 10 && !state.castModels[state.castSize-1]){
          state.castSize--;
        }

        State.save(state);
        return buildModelsGrid(roster||[]);
      }

      var p = (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id]) ||
              (roster||[]).find(function(r){ return r.id===id; });
      if (!p) return;

      state.castModels[i] = asEntry(p);
      State.save(state);
      buildModelsGrid(roster||[]);
    };
  });

  elTeams.querySelectorAll(".btn-custom").forEach(function(btn){
    btn.onclick = function(){
      openCustomModal(+btn.dataset.slot);
    };
  });

  elTeams.querySelectorAll(".btn-delete").forEach(function(btn){
    btn.onclick = function(){
      var i = +btn.dataset.slot;
      state.castModels[i] = null;

      while (state.castSize > 10 && !state.castModels[state.castSize-1]){
        state.castSize--;
      }

      State.save(state);
      buildModelsGrid(roster||[]);
    };
  });

  var filled = (state.castModels||[]).filter(Boolean).length;
  elInfoCast.textContent = filled + "/" + state.castSize;
}

var modal = document.createElement("dialog");
modal.className = "antm-modal";
modal.innerHTML = '<form id="custom-form" method="dialog" autocomplete="off">'+
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

    if (!name || !nickname){
      return;
    }

    var g = "female";

    var id = nickname.toLowerCase().replace(/[^a-z0-9]+/g,"_") + "_" + Date.now().toString(36);
    var cp = {
      id: id,
      name: name,
      nickname: nickname,
      gender: g,
      show: "Custom",
      image: image || IMG_BLANK
    };

state.castModels[slot] = asEntry(cp);

    State.save(state);
    modal.close();
    formCustom.reset();
    buildModelsGrid(window.PLAYERS || []);
  };

  cancelBtn.onclick = function(){
    modal.close();
  };
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

      return roster.filter(function(p){
        return playerMatchesPrefs(p, prefs);
      });
    }

function randomizeCastWithPrefs(prefs, mode){
  mode = mode || "all";
  var rosterAll = filterRosterByPrefs(prefs);

  if (!rosterAll.length){
    alert("No eligible players for the selected shows/seasons.");
    return;
  }

  var need = clamp((state.castSize || 10), 10, 16);

  function genderOf(p){
    if(!p) return null;
    var g = (p.gender || p.sex || p.Sex || p.Gender || null);
    if (typeof g === "string"){
      g = g.toLowerCase();
      if (g.indexOf("f") === 0) return "female";
      if (g.indexOf("m") === 0) return "male";
    }
    var tags = p.tags || p.tag || null;
    if (typeof tags === "string"){
      var t = tags.toLowerCase();
      if (t.indexOf("female") !== -1) return "female";
      if (t.indexOf("male") !== -1) return "male";
    } else if (Array.isArray(tags)){
      var lower = tags.map(function(x){ return String(x).toLowerCase(); });
      if (lower.indexOf("female") !== -1) return "female";
      if (lower.indexOf("male") !== -1) return "male";
    }
    if (p.female === true) return "female";
    if (p.male === true) return "male";
    return null;
  }

  function isFemale(p){ return genderOf(p) === "female"; }
  function isMale(p){ return genderOf(p) === "male"; }

  if (mode === "female" || ANTM_ONLY_FEMALE){
    var femalesOnly = rosterAll.filter(isFemale);
    if (femalesOnly.length < need){
      alert("Not enough female players for the selected shows/seasons to fill " + need + " slots.");
      return;
    }
    rosterAll = femalesOnly;
  }

  var roster = [];

  if (mode === "split"){
    var females = shuffle(rosterAll.filter(isFemale));
    var males = shuffle(rosterAll.filter(isMale));

    var half = Math.floor(need / 2);
    var needF = half;
    var needM = half;

    if (need % 2 === 1){
      if (rnd(2) === 0) needF += 1;
      else needM += 1;
    }

    if (females.length < needF || males.length < needM){
      alert("Not enough male/female players for the selected shows/seasons to make a " + need + "-person 50/50 cast.");
      return;
    }

    roster = females.slice(0, needF).concat(males.slice(0, needM));
    roster = shuffle(roster);
  } else {
    roster = shuffle(rosterAll);
    if (roster.length < need){
      alert("Not enough eligible players to fill " + need + " slots. Adjust cast size or filters.");
      return;
    }
  }

  if (!Array.isArray(state.castModels)){
    state.castModels = Array.from({length:16}).map(function(){return null;});
  }

  for (var i=0;i<16;i++) state.castModels[i] = null;
  for (var j=0;j<need;j++) state.castModels[j] = asEntry(roster[j]);

  state.castSize = need;

  State.save(state);
  buildModelsGrid(window.PLAYERS || []);
}

    function openRandomizeModal(mode){
      mode = mode || "all";
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
            seasons = input.value
              .split(/[,;]/)
              .map(function(s){ return s.trim().toLowerCase(); })
              .filter(Boolean);
          }
          prefs[show] = { seasons: seasons };
        });

        randModal.close();
        randomizeCastWithPrefs(prefs, mode);
      };

      btnCancel.onclick = function(){
        randModal.close();
      };
    }


    document.getElementById("btn-reset-session").addEventListener("click", function(e){ e.preventDefault(); State.clear(); location.reload(); });
    document.getElementById("btn-profiles").addEventListener("click", function(){ location.href = "./profiles.html"; });
    document.getElementById("btn-relationships").addEventListener("click", function(){ location.href = "./relationships.html"; });
document.getElementById("btn-randomize").onclick = function(){ openRandomizeModal("all"); };
var btnRandFemale = document.getElementById("btn-randomize-female");
if (btnRandFemale) btnRandFemale.onclick = function(){ openRandomizeModal("female"); };
var btnRandSplit = document.getElementById("btn-randomize-split");
if (btnRandSplit) btnRandSplit.onclick = function(){ openRandomizeModal("split"); };
document.getElementById("btn-reset-cast").onclick=function(){
  state.castModels = Array.from({length:16}).map(function(){return null;});
  state.castSize = 10;
  State.save(state);
  buildModelsGrid(window.PLAYERS||[]);
};

var btnBackCast = document.getElementById("btn-back-cast");
if (btnBackCast){
  btnBackCast.addEventListener("click", function(e){
    e.preventDefault();
    resetSeasonKeepCast();
  });
}

    (function init(){
      var src=window.PLAYERS||[];
      var warn=document.getElementById("data-warning");
      if(!Array.isArray(src)||!src.length){
        warn.style.display="block";
        buildFilterShows([]); buildModelsGrid([]);
      } else {
        warn.style.display="none";
        buildFilterShows(src); buildModelsGrid(src);
      }
      elInfoSeed.textContent=state.seed;

      if(state.simulated){
        buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false;
        var last=state.lastView||{ep:1,section:"status"}; showEpisodeSection(last.ep,last.section);
        elInfoStatus.textContent="Simulated";
        elInfoCast.textContent = (state.castModels||[]).slice(0, clamp((state.castSize||10),10,16)).filter(Boolean).length + "/" + clamp((state.castSize||10),10,16);
        statsPanel.style.display="block";
      }

      document.getElementById("goto-placements").onclick=function(){ showStatisticsPanel("placements"); };
      document.getElementById("goto-stats").onclick=function(){ showStatisticsPanel("other"); };
      document.getElementById("goto-chart").onclick=function(){ showStatisticsPanel("chart"); };
    })();

function setAliveFromCast(){
  var n = clamp((state.castSize || 10), 10, 16);
  var models = (state.castModels || []).slice(0, n).filter(Boolean);

  state.players = models.map(function(c){
    return { id:c.id, name:c.name, nickname:c.nickname, image:c.image, gender:c.gender, alive:true };
  });
}
    function aliveIds(){ return state.players.filter(function(p){return p.alive!==false;}).map(function(p){return p.id;}); }
    function aliveByGender(gender){ return state.players.filter(function(p){return p.alive!==false && p.gender===gender;}).map(function(p){return p.id;}); }

    function renderNames(t, ids){
      var out=t||"";
      var labels=["{A}","{B}","{C}"];
      (ids||[]).forEach(function(pid,i){ out = out.split(labels[i]).join(nameOf(pid)); });
      return out;
    }

    function genHouseEvents(){
      var alive = aliveIds(); var E = (window.ANTM_EVENTS||{}); var out=[];
      var pick = function(a){ return a && a.length ? sample(a) : null; };
      var count = 3 + rnd(4);
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
          var ev3 = pick(E.three_neutral); if(ev3 && A3 && B3 && C3) out.push({ players:[A3,B3,C3], text:renderNames(ev3,[A3,B3,C3]) });
        }
      }
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

function resetSeasonKeepCast(){
  state.players = [];
  state.episodes = {};
  state.ui = {};
  state.stats = {};
  state.placements = { eliminated: [] };
  state.chart = { finalized:false, episodes:{} };
  state.simulated = false;
  state.lastView = null;

  State.save(state);

  viewEpisode.hidden = true;
  viewCast.hidden = false;
  statsPanel.style.display = "none";
  epContent.innerHTML = "";
  epActions.innerHTML = "";
  elAccordion.innerHTML = "";

  var n = clamp((state.castSize || 10), 10, 16);
  var filled = (state.castModels || []).slice(0, n).filter(Boolean).length;
  elInfoStatus.textContent = "Not Simulated";
  elInfoCast.textContent = filled + "/" + n;

  buildModelsGrid(window.PLAYERS || []);
}

document.getElementById("btn-simulate").onclick=function(){
  var n = clamp((state.castSize || 10), 10, 16);
  var filled = (state.castModels || []).slice(0, n).filter(Boolean).length;

  if (filled !== n){
    alert("Please complete all " + n + " Model slots before simulating.");
    return;
  }

  setAliveFromCast();

  simulateSeason();
  state.simulated = true;
  State.save(state);
  viewCast.hidden = true;
  viewEpisode.hidden = false;
statsPanel.style.display = "block";

  buildLeftAccordion();
  showEpisodeSection(1, "status");

  elInfoStatus.textContent = "Simulated";
  elInfoCast.textContent = filled + "/" + n;
};

function simulateSeason(){
  state.episodes = {};
  state.ui = {};
  state.chart = { finalized:false, episodes:{} };
  state.stats = state.stats || {};
  state.stats.dailyWins = state.stats.dailyWins || {};
  state.stats.elimWins = state.stats.elimWins || {};
  state.stats.elimPlays = state.stats.elimPlays || {};
  state.stats.notPicked = state.stats.notPicked || {};
  var startCount = clamp((state.castSize || 10), 10, 16);
  state.season = state.season || {};
  state.season.totalEpisodes = startCount - 2;
  var totalEpisodes = state.season.totalEpisodes;
  var finalEp = totalEpisodes;

  state.antm = {
    favoritism: {},
    bottomTwos: {},
    firstCallOuts: {},
    quitUsed: false,
    doubleUsed: false,
    usedChallenges: [],
    usedPhotoshoots: [],
    usedFinal: { commercial:null, photoshoot:null, runway:null }
  };

  aliveIds().forEach(function(pid){
    state.antm.favoritism[pid] = 0;
    state.antm.bottomTwos[pid] = 0;
  });

  function aliveCount(){ return aliveIds().length; }

  function ensureMapsForNewAlive(){
    aliveIds().forEach(function(pid){
      if(typeof state.antm.favoritism[pid] !== "number") state.antm.favoritism[pid] = 0;
      if(typeof state.antm.bottomTwos[pid] !== "number") state.antm.bottomTwos[pid] = 0;
      if(typeof state.antm.firstCallOuts[pid] !== "number") state.antm.firstCallOuts[pid] = 0;
    });
  }

  function markEliminated(pid){
    for(var i=0;i<state.players.length;i++){
      if(state.players[i] && state.players[i].id === pid){
        state.players[i].alive = false;
        break;
      }
    }
  }

  function pickUnused(list, usedIdsArr){
    var used = {};
    (usedIdsArr || []).forEach(function(id){ used[id]=true; });
    var pool = (list || []).filter(function(x){ return x && x.id && !used[x.id]; });
    if(!pool.length) return null;
    return sample(pool);
  }

  function rankOrderFromScores(scores, ids){
    var arr = (ids || []).map(function(pid){
      return { id: pid, score: +scores[pid] || 0 };
    });
    arr.sort(function(a,b){ return b.score - a.score; });
    return arr.map(function(x){ return x.id; });
  }

  function tierForRank(rankIndex, total){
    var third = Math.ceil(total / 3);
    if(rankIndex < third) return "good";
    if(rankIndex < third * 2) return "mid";
    return "bad";
  }

  function splitIntoTeams(ids, teamCount){
    var shuffled = shuffle((ids || []).slice());
    var teams = Array.from({length:teamCount}).map(function(){ return []; });
    for(var i=0;i<shuffled.length;i++){
      teams[i % teamCount].push(shuffled[i]);
    }
    return teams;
  }

  function computeChallenge(){
    var ids = aliveIds();
    var ch = pickUnused(window.ANTM_CHALLENGES || [], state.antm.usedChallenges);
    if(!ch) return null;
    state.antm.usedChallenges.push(ch.id);

    var scores = {};
    ids.forEach(function(pid){
      scores[pid] = scorePlayerWeighted(ch.skillWeights || {}, pid) + (Math.random() * 0.15);
    });

    var order = rankOrderFromScores(scores, ids);
    var hi = [];
    var best = order[0];
    var mid  = order[Math.floor(order.length/2)];
    var worst= order[order.length-1];

    var posT = (ch.comments && ch.comments.positive && ch.comments.positive.length) ? sample(ch.comments.positive) : "{A} shines.";
    var neuT = (ch.comments && ch.comments.neutral && ch.comments.neutral.length) ? sample(ch.comments.neutral) : "{A} is fine, but forgettable.";
    var negT = (ch.comments && ch.comments.negative && ch.comments.negative.length) ? sample(ch.comments.negative) : "{A} struggles badly.";

    if(best)  hi.push({ players:[best],  text: renderNames(posT, [best]) });
    if(mid)   hi.push({ players:[mid],   text: renderNames(neuT, [mid]) });
    if(worst) hi.push({ players:[worst], text: renderNames(negT, [worst]) });

    var winners = [];
    var winnersText = "";

    if((ch.mode || "solo") === "solo"){
      winners = best ? [best] : [];
      winnersText = winners.length ? nameOf(winners[0]) : "";
    }
    else if(ch.mode === "pairs"){
      var shuffled = shuffle(ids.slice());
      var pairs = [];
      for(var i=0;i<shuffled.length;i+=2){
        var a = shuffled[i];
        var b = shuffled[i+1];
        if(!b){
          b = shuffled[0] === a ? shuffled[1] : shuffled[0];
        }
        pairs.push([a,b]);
      }

      var bestPair = null;
      var bestScore = -1e9;
      pairs.forEach(function(pair){
        var s = (scores[pair[0]] + scores[pair[1]]) / 2;
        if(s > bestScore){ bestScore = s; bestPair = pair; }
      });

      winners = bestPair ? bestPair.slice(0,2) : [];
      winnersText = winners.length ? (nameOf(winners[0]) + " & " + nameOf(winners[1])) : "";
    }
    else { 
      var teamCount = (ids.length >= 12) ? 3 : 2;
      var teams = splitIntoTeams(ids, teamCount);

      var bestTeamIndex = 0;
      var bestTeamScore = -1e9;

      for(var t=0;t<teams.length;t++){
        var team = teams[t];
        var sum = 0;
        for(var k=0;k<team.length;k++) sum += scores[team[k]];
        var avg = team.length ? (sum / team.length) : 0;
        if(avg > bestTeamScore){ bestTeamScore = avg; bestTeamIndex = t; }
      }

      winners = teams[bestTeamIndex] || [];
      winnersText = "Team " + (bestTeamIndex+1) + " — " + winners.map(nameOf).join(", ");
    }

    winners.forEach(function(pid){
      state.antm.favoritism[pid] = (state.antm.favoritism[pid] || 0) + 1;
    });

    return {
      id: ch.id,
      type: ch.type || "General",
      mode: ch.mode || "solo",
      name: ch.name || "Challenge",
      description: ch.description || "",
      skillWeights: ch.skillWeights || {},
      scores: scores,
      order: order,
      winners: winners,
      winnersText: winnersText,
      highlights: hi
    };
  }

  function computePhotoshoot(){
    var ids = aliveIds();
    var ps = pickUnused(window.ANTM_PHOTOSHOOTS || [], state.antm.usedPhotoshoots);
    if(!ps) return null;
    state.antm.usedPhotoshoots.push(ps.id);

    var scores = {};

  function rollShootDelta(){
    var r = Math.random();
    if (r < 0.65) return 0;
    r -= 0.65;
    if (r < 0.07) return 2;
    r -= 0.07;
    if (r < 0.07) return 1;
    r -= 0.07;
    if (r < 0.07) return -1;
    r -= 0.07;
    if (r < 0.07) return -2;
    return -3;
  }

    ids.forEach(function(pid){
      scores[pid] = scorePlayerWeighted(ps.skillWeights || {}, pid) + (Math.random() * 0.15) + rollShootDelta();
    });

    var order = rankOrderFromScores(scores, ids);

var hi = [];
var pools = window.ANTM_PHOTOSHOOT_COMMENTS || {};
var posPool = pools.positive || [];
var neuPool = pools.neutral  || [];
var negPool = pools.negative || [];

var rank = {};
for(var r=0; r<order.length; r++) rank[order[r]] = r;

ids.forEach(function(pid){
  var rnk = rank[pid];
  var cut1 = Math.ceil(order.length / 3);
  var cut2 = Math.floor(order.length * 2 / 3);

  var bucket = (rnk < cut1) ? "pos" : (rnk >= cut2) ? "neg" : "neu";

  var tpl =
    (bucket==="pos" && posPool.length) ? sample(posPool) :
    (bucket==="neg" && negPool.length) ? sample(negPool) :
    (neuPool.length ? sample(neuPool) : "{A} shoots.");

  hi.push({ players:[pid], text: renderNames(tpl, [pid]) });
});

hi = shuffle(hi);


    return {
      id: ps.id,
      type: ps.type || "General",
      name: ps.name || "Photoshoot",
      description: ps.description || "",
      skillWeights: ps.skillWeights || {},
      scores: scores,
      order: order,
      highlights: hi
    };
  }

  function computePanel(C, P){
    var ids = aliveIds();

    var cOrder = (C && C.order) ? C.order.slice() : ids.slice();
    var pOrder = (P && P.order) ? P.order.slice() : ids.slice();

    var cRank = {};
    var pRank = {};
    for(var i=0;i<cOrder.length;i++) cRank[cOrder[i]] = i;
    for(var j=0;j<pOrder.length;j++) pRank[pOrder[j]] = j;

    var notes = [];
    var buckets = window.ANTM_PANEL_NOTES || {};

    ids.forEach(function(pid){
      var ct = tierForRank(cRank[pid] ?? Math.floor(ids.length/2), ids.length);
      var pt = tierForRank(pRank[pid] ?? Math.floor(ids.length/2), ids.length);

      var pool =
        (buckets[pt] && buckets[pt][ct]) ? buckets[pt][ct] : null;

      var tpl = (pool && pool.length) ? sample(pool) : "{A}, we needed more from you this week.";
      notes.push({ players:[pid], text: renderNames(tpl, [pid]) });
    });

    notes = shuffle(notes);

    return { notes: notes };
  }

  function computeCallout(ep, P){
    var ids = aliveIds();
    var order = (P && P.order) ? P.order.slice() : ids.slice();
    var scores = (P && P.scores) ? P.scores : {};

    if(order.length < 2){
      return { order: order, eliminated: null, bottomTwo: [], twistText: null };
    }

    var bottomTwo = [ order[order.length-2], order[order.length-1] ];

    if(order[0]) state.antm.firstCallOuts[order[0]] = (state.antm.firstCallOuts[order[0]]||0) + 1;
    bottomTwo.forEach(function(pid){
      if(pid) state.antm.favoritism[pid] = (state.antm.favoritism[pid]||0) - 1;
    });

    bottomTwo.forEach(function(pid){
      if(pid) state.antm.bottomTwos[pid] = (state.antm.bottomTwos[pid]||0) + 1;
    });

    var auto = bottomTwo.filter(function(pid){ return (state.antm.bottomTwos[pid]||0) >= 4; });

    var twistText = null;
    var eliminated = null;

    if(!state.antm.quitUsed && aliveCount() > 6 && Math.random() < 0.002){
      state.antm.quitUsed = true;
      var pool = ids.filter(function(x){ return bottomTwo.indexOf(x) < 0; });
      var quitter = pool.length ? sample(pool) : sample(ids);

      eliminated = quitter;

      var quitP = (window.ANTM_TWIST_PHRASES && window.ANTM_TWIST_PHRASES.quit && window.ANTM_TWIST_PHRASES.quit.length)
        ? sample(window.ANTM_TWIST_PHRASES.quit)
        : "I'm sorry, I can't continue in the competition for personal reasons. I want to go home.";

      var afterP = (window.ANTM_TWIST_PHRASES && window.ANTM_TWIST_PHRASES.quitAftermath && window.ANTM_TWIST_PHRASES.quitAftermath.length)
        ? sample(window.ANTM_TWIST_PHRASES.quitAftermath)
        : "Since we've lost {A}, both of you will be given a second chance.";

      twistText =
        '<div><strong>' + nameOf(quitter) + ':</strong> ' + quitP + '</div>' +
        '<div><strong>Host:</strong> ' + afterP.replaceAll("{A}", nameOf(quitter)) + '</div>';

      markEliminated(quitter);

      return { order: order, bottomTwo: bottomTwo, eliminated: eliminated, twistText: twistText };
    }

    if(!state.antm.doubleUsed && aliveCount() > 5 && bottomTwo[0] && bottomTwo[1]){
      var sA = +scores[bottomTwo[0]] || 0;
      var sB = +scores[bottomTwo[1]] || 0;
      if(Math.abs(sA - sB) <= 1 && Math.random() < 0.002){
        state.antm.doubleUsed = true;

        var dblP = (window.ANTM_TWIST_PHRASES && window.ANTM_TWIST_PHRASES.doubleElim && window.ANTM_TWIST_PHRASES.doubleElim.length)
          ? sample(window.ANTM_TWIST_PHRASES.doubleElim)
          : "Unfortunately, none of you are staying tonight.";

        twistText =
          '<div><strong>Host:</strong> ' + dblP + '</div>' +
          '<div><strong>Eliminated:</strong> ' + nameOf(bottomTwo[0]) + " & " + nameOf(bottomTwo[1]) + '</div>';

        markEliminated(bottomTwo[0]);
        markEliminated(bottomTwo[1]);

        return { order: order, bottomTwo: bottomTwo, eliminated: null, twistText: twistText };
      }
    }

    if(auto.length){
      if(auto.length === 1){
        eliminated = auto[0];
        markEliminated(eliminated);
        return { order: order, bottomTwo: bottomTwo, eliminated: eliminated, twistText: null };
      } else {
        twistText =
          '<div><strong>Host:</strong> You have both been in the bottom too many times. Tonight, both of you are going home.</div>' +
          '<div><strong>Eliminated:</strong> ' + auto.map(nameOf).join(" & ") + '</div>';
        auto.forEach(markEliminated);
        return { order: order, bottomTwo: bottomTwo, eliminated: null, twistText: twistText };
      }
    }

    var btmA = bottomTwo[0];
    var btmB = bottomTwo[1];

    function hasFCOProtection(pid){
      return !!pid && ((state.antm.firstCallOuts[pid]||0) >= 3) && ((state.antm.bottomTwos[pid]||0) < 4);
    }

    if(!hasFCOProtection(btmA) && !hasFCOProtection(btmB)){
      eliminated = order[order.length-1];
    } else {
      var wA = 0.35;
      var wB = 0.65;

      if(hasFCOProtection(btmA)) wA *= 0.35;
      if(hasFCOProtection(btmB)) wB *= 0.35;
      if(!btmA || !btmB){
        eliminated = order[order.length-1];
      } else {
        var roll = Math.random() * (wA + wB);
        eliminated = (roll < wA) ? btmA : btmB;
      }
    }

    markEliminated(eliminated);

    return { order: order, bottomTwo: bottomTwo, eliminated: eliminated, twistText: null };
  }

  function computeFinalChallenge(categoryKey){
    var ids = aliveIds();
    var bank = window.ANTM_FINAL_CHALLENGES || {};
    var list = bank[categoryKey] || [];
    if(!list.length) return null;
    var usedId = state.antm.usedFinal[categoryKey] || null;
    var pool = usedId ? list.filter(function(x){ return x && x.id !== usedId; }) : list.slice();
    var pick = pool.length ? sample(pool) : sample(list);

    state.antm.usedFinal[categoryKey] = pick.id;

    var scores = {};
    ids.forEach(function(pid){
      scores[pid] = scorePlayerWeighted(pick.skillWeights || {}, pid) + (Math.random() * 0.15);
    });

    var order = rankOrderFromScores(scores, ids);
    var hi = [];

    var posPool = (pick.comments && pick.comments.positive) || [];
    var neuPool = (pick.comments && pick.comments.neutral) || [];
    var negPool = (pick.comments && pick.comments.negative) || [];

    var posT = posPool.length ? sample(posPool) : "{A} shines under pressure.";
    var neuT = neuPool.length ? sample(neuPool) : "{A} is solid, but not the standout.";
    var negT = negPool.length ? sample(negPool) : "{A} struggles to meet the brief.";

    if(order[0]) hi.push({ players:[order[0]], text: renderNames(posT, [order[0]]) });
    if(order[1]) hi.push({ players:[order[1]], text: renderNames(neuT, [order[1]]) });
    if(order[2]) hi.push({ players:[order[2]], text: renderNames(negT, [order[2]]) });

    hi = shuffle(hi);

    return {
      id: pick.id,
      type: pick.type || "Final",
      name: pick.name || "Final Challenge",
      description: pick.description || "",
      skillWeights: pick.skillWeights || {},
      scores: scores,
      order: order,
      highlights: hi
    };
  }

function computeFinalPanel(finalCommercial, finalPhotoshoot, finalRunway){
  var ids = aliveIds();
  var notes = [];
  var totals = {};
  ids.forEach(function(pid){
    var a = (finalCommercial && finalCommercial.scores) ? (+finalCommercial.scores[pid] || 0) : 0;
    var b = (finalPhotoshoot && finalPhotoshoot.scores) ? (+finalPhotoshoot.scores[pid] || 0) : 0;
    var c = (finalRunway && finalRunway.scores) ? (+finalRunway.scores[pid] || 0) : 0;
    totals[pid] = a + b + c;
  });

  var totalOrder = rankOrderFromScores(totals, ids);
  var rank = {};
  totalOrder.forEach(function(pid, i){ rank[pid] = i; });
  var pools = window.ANTM_FINAL_PANEL_SPEECHES || {};
  var posPool = pools.panel_positive || pools.positive || [];
  var neuPool = pools.panel_neutral  || pools.neutral  || (pools.mid || []);
  var negPool = pools.panel_negative || pools.negative || [];
  var fallbackPos = [
    "{A}, you are peaking at exactly the right time. Tonight you’re showing control, polish, and star power.",
    "{A}, you’ve been fearless — and in these final moments, that confidence is reading like a true working model.",
    "{A}, you’re not just performing — you’re commanding. This is what a finalist is supposed to look like.",
    "{A}, you’ve proven you can deliver under pressure. Your professionalism is undeniable.",
    "{A}, you’re giving us winner energy right now — focused, present, and completely in control."
  ];
  var fallbackNeu = [
    "{A}, you are very strong — but at this stage, strong isn’t enough. We need that extra level of intention.",
    "{A}, you’re right in this race. The difference now is precision: tiny choices that read big on camera and runway.",
    "{A}, you have the talent — now show us consistency from start to finish, with no drop in energy.",
    "{A}, you’re delivering, but we need you to take more ownership of the moment and make it unmistakably yours.",
    "{A}, you’re close. Push past safe and give us something memorable and undeniable."
  ];
  var fallbackNeg = [
    "{A}, this is where you have to fight the hardest. You cannot let pressure shrink you — it has to sharpen you.",
    "{A}, you have the potential, but you’re losing clarity. We need focus and confidence right now.",
    "{A}, you’ve made it to the end — but the finale demands precision. Clean it up and commit completely.",
    "{A}, you can’t rely on what you did earlier in the season. Right now, we need you to deliver in the moment.",
    "{A}, you’re still in this — but you must show us control, not hesitation, from here on out."
  ];

  function labelForPart(partKey, obj){
    if(obj && obj.name) return obj.name;
    if(partKey === "commercial") return "the commercial";
    if(partKey === "photoshoot") return "the final photoshoot";
    return "the final runway";
  }

  ids.forEach(function(pid){
    var a = (finalCommercial && finalCommercial.scores) ? (+finalCommercial.scores[pid] || 0) : 0;
    var b = (finalPhotoshoot && finalPhotoshoot.scores) ? (+finalPhotoshoot.scores[pid] || 0) : 0;
    var c = (finalRunway && finalRunway.scores) ? (+finalRunway.scores[pid] || 0) : 0;

    var parts = [
      { key:"commercial", score:a, obj: finalCommercial },
      { key:"photoshoot", score:b, obj: finalPhotoshoot },
      { key:"runway",    score:c, obj: finalRunway }
    ];

    parts.sort(function(x,y){ return y.score - x.score; });
    var best = parts[0];
    var worst = parts[parts.length - 1];

    var r = rank[pid] || 0;
    var bucket = (r === 0) ? "pos" : (r === 1 ? "neu" : "neg");

    var tpl;
    if(bucket === "pos"){
      tpl = posPool.length ? sample(posPool) : sample(fallbackPos);
    } else if(bucket === "neg"){
      tpl = negPool.length ? sample(negPool) : sample(fallbackNeg);
    } else {
      tpl = neuPool.length ? sample(neuPool) : sample(fallbackNeu);
    }

var base = renderNames(tpl, [pid]);
notes.push({ players:[pid], text: base });

  });

  notes = shuffle(notes);

  return { notes: notes, totals: totals, order: totalOrder };
}

  function computeWinner(finalCommercial, finalPhotoshoot, finalRunway){
    var ids = aliveIds();
    var totals = {};

    ids.forEach(function(pid){
      var a = (finalCommercial && finalCommercial.scores) ? (+finalCommercial.scores[pid] || 0) : 0;
      var b = (finalPhotoshoot && finalPhotoshoot.scores) ? (+finalPhotoshoot.scores[pid] || 0) : 0;
      var c = (finalRunway && finalRunway.scores) ? (+finalRunway.scores[pid] || 0) : 0;
      totals[pid] = a + b + c;
    });

    var order = rankOrderFromScores(totals, ids);
    var winnerId = order[0];

    var pools = window.ANTM_FINAL_PANEL_SPEECHES || {};
    var goodPool = pools.good || [];
    var speechTpl = goodPool.length
      ? sample(goodPool)
      : "{A}, you delivered when it mattered most. You are America’s Next Top Model.";

    return {
      winnerId: winnerId,
      totals: totals,
      order: order,
      speech: renderNames(speechTpl, [winnerId])
    };
  }

  for(var ep=1; ep<=totalEpisodes; ep++){
    ensureMapsForNewAlive();

    var E = state.episodes[ep] = { status: aliveIds().slice() };
    state.ui[ep] = state.ui[ep] || { calloutIndex: 0 };

    if(ep < finalEp){
      E.events1 = genHouseEvents();
      E.challenge = computeChallenge();
      E.events2 = genHouseEvents();
      E.photoshoot = computePhotoshoot();
      E.panel = computePanel(E.challenge, E.photoshoot);
      E.callout = computeCallout(ep, E.photoshoot);

var beforeCount = E.status.length;
var afterCount  = aliveCount();
if (beforeCount - afterCount === 2) {
  totalEpisodes -= 1;
  finalEp = totalEpisodes;
  state.season.totalEpisodes = totalEpisodes;
}

    } else {
      E.status = aliveIds().slice();

      E.final_commercial = computeFinalChallenge("commercial");
      E.final_photoshoot = computeFinalChallenge("finalPhotoshoot");
E.final_runway = computeFinalChallenge("runway");

      E.final_panel = computeFinalPanel(E.final_commercial, E.final_photoshoot, E.final_runway);

      E.winner = computeWinner(E.final_commercial, E.final_photoshoot, E.final_runway);
    }
  }

  state.chart.finalized = true;
}

function buildLeftAccordion(){
  var el = document.getElementById("episode-accordion");;
  if(!el) return;

  var startCount = clamp((state.castSize || (state.castModels||[]).filter(Boolean).length || 10), 10, 16);
  var totalEpisodes = (startCount >= 3) ? (startCount - 2) : 8;

  var sectionsRegular = [
    ["status","Status"],
    ["events1","House Events (1)"],
    ["challenge","Challenge"],
    ["events2","House Events (2)"],
    ["photoshoot","Photoshoot"],
    ["panel","Panel"],
    ["callout","Call-Out"]
  ];

  var sectionsFinal = [
    ["status","Status"],
    ["final_commercial","Commercial Challenge"],
    ["final_photoshoot","Final Photoshoot"],
    ["final_runway","Final Runway"],
    ["final_panel","Final Panel"],
    ["winner","Winner"]
  ];

  el.innerHTML = "";

  for(var ep=1; ep<=totalEpisodes; ep++){
    var isFinal = (ep === totalEpisodes);

    var details = document.createElement("details");
    details.className = "details-ep";
    if(ep === 1) details.open = true;

    var summary = document.createElement("summary");
    summary.textContent = "Episode " + ep;
    details.appendChild(summary);

    var box = document.createElement("div");
    box.className = "section-box";

    var links = document.createElement("div");
    links.className = "section-links";

    (isFinal ? sectionsFinal : sectionsRegular).forEach(function(pair){
      var sec = pair[0], label = pair[1];

      var b = document.createElement("button");
      b.type = "button";
      b.dataset.ep = String(ep);
      b.dataset.sec = sec;
      b.textContent = label;

b.onclick = function(){
  el.querySelectorAll(".section-links button.active").forEach(function(x){
    x.classList.remove("active");
  });

  this.classList.add("active");

  var det = this.closest("details");
  if(det) det.open = true;

  var epNum = parseInt(this.dataset.ep, 10);
  var secKey = this.dataset.sec;
  showEpisodeSection(epNum, secKey);
};

      links.appendChild(b);
    });

    box.appendChild(links);
    details.appendChild(box);
    el.appendChild(details);
  }

  var first = el.querySelector('.section-links button[data-ep="1"][data-sec="status"]');
  if(first){
    first.classList.add("active");
    showEpisodeSection(1, "status");
  }
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
                       .sort(function(a,b){return b.score-a.score;});
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
  var startCount = (state.castModels || []).filter(Boolean).length;
  var totalEpisodes = (state.season && state.season.totalEpisodes) || (startCount ? (startCount - 2) : 8);
  var finalEp = totalEpisodes;

  var order =
    (ep === finalEp)
      ? ["status","final_commercial","final_photoshoot","final_runway","final_panel","winner"]
      : ["status","events1","challenge","events2","photoshoot","panel","callout"];

  var idx = order.indexOf(section);

  var btn = document.createElement("button");
  btn.className = "btn proceed";
  btn.textContent = "Proceed";

  btn.onclick = function(){
    if(section === "callout" && ep < finalEp){
      showEpisodeSection(ep+1, "status");
      btn.remove();
      return;
    }

    if(section === "winner"){
      showStatisticsPanel("placements");
      btn.remove();
      return;
    }

    if(idx >= 0 && idx < order.length - 1){
      showEpisodeSection(ep, order[idx+1]);
      btn.remove();
    }
  };

  epActions.appendChild(btn);
}

function showEpisodeSection(ep, section){
  var S = (state.episodes && state.episodes[ep]) ? state.episodes[ep] : {};
  var E = S;
  state.lastView = { ep: ep, section: section };
  State.save(state);

  epTitle.textContent = "Episode " + ep;
  epSub.textContent = "";

  epContent.innerHTML = "";
  epActions.innerHTML = "";

  if(section === "status"){
    epSub.textContent = "Status";

    var alive = (S.status || []).slice();
    var wrap = document.createElement("div");
    wrap.className = "status-section";

    var h = document.createElement("div");
    h.className = "status-title";
    h.textContent = "Models — " + alive.length + " remaining";

    var row = document.createElement("div");
    row.className = "status-grid";
    alive.forEach(function(pid){ row.appendChild(statusCard(pid)); });

    wrap.appendChild(h);
    wrap.appendChild(row);
    epContent.appendChild(wrap);

    addProceed(ep, section);
    return;
  }

  if(section === "events1" || section === "events2"){
    var evs = (section === "events1") ? (S.events1 || []) : (S.events2 || []);
    epSub.textContent = (section === "events1" ? "House Events 1" : "House Events 2");

    var grid = document.createElement("div");
    grid.className = "events-grid three-cols";

    for(var i=0;i<evs.length;i++){
      var ev = evs[i];
      var card = document.createElement("div");
      card.className = "mini-card";

      var avatars = document.createElement("div");
      avatars.className = "row tiny-avatars";
      (ev.players || []).forEach(function(pid){
        var img = document.createElement("img");
        img.className = "avatar xs";
        img.src = picOf(pid);
        img.alt = "";
        avatars.appendChild(img);
      });

      card.innerHTML = avatars.outerHTML + "<div>" + (ev.text || "") + "</div>";
      grid.appendChild(card);
    }

    epContent.appendChild(grid);
    addProceed(ep, section);
    return;
  }

  if(section === "challenge"){
    var C = S.challenge || {};
    epSub.textContent = "Challenge";

    var title = document.createElement("div");
    title.className = "challenge-name";
    title.textContent = C.name || "Challenge";

    var desc = document.createElement("div");
    desc.className = "mini-card note";
desc.innerHTML =
  '<div>' + (C.description || "") + '</div>';

    epContent.appendChild(title);
    epContent.appendChild(desc);

var order = (C.order || (S.status||[]).slice());
if(order.length && C.comments){
  var grid = document.createElement("div");
  grid.className = "events-grid three-cols";

  var pos = C.comments.positive || [];
  var neu = C.comments.neutral || [];
  var neg = C.comments.negative || [];

  var n = order.length;
  var top = Math.ceil(n/3);
  var mid = Math.ceil(2*n/3);

  for(var i=0;i<n;i++){
    var pid = order[i];
    var bank = (i < top) ? pos : (i < mid) ? neu : neg;
    var tmpl = bank.length ? sample(bank) : "{A} competes.";
    var text = tmpl.replaceAll("{A}", nameOf(pid));

    var card = document.createElement("div");
    card.className = "mini-card";
    card.innerHTML =
      '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(pid)+'" alt=""></div>' +
      '<div>'+text+'</div>';

    grid.appendChild(card);
  }

  epContent.appendChild(grid);
}

    var btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Show Winner(s)";
btn.onclick = function(){
  btn.remove();

  var winners = Array.isArray(C.winners) ? C.winners : [];
  var wrap = document.createElement("div");
  wrap.className = "reveal-row";

  if(!winners.length){
    var box = document.createElement("div");
    box.className = "mini-card";
    box.innerHTML = "<div><strong>Winner(s):</strong> (not generated yet)</div>";
    epContent.appendChild(box);
    return;
  }

  winners.forEach(function(pid){
    wrap.appendChild(statusCard(pid));
  });

  epContent.appendChild(wrap);
};
    epActions.appendChild(btn);

    addProceed(ep, section);
    return;
  }

  if(section === "photoshoot"){
    var P = S.photoshoot || {};
    epSub.textContent = "Photoshoot";

    var title = document.createElement("div");
    title.className = "challenge-name";
    title.textContent = P.name || "Photoshoot";

    var desc = document.createElement("div");
    desc.className = "mini-card note";
desc.innerHTML = '<div>' + (P.description || "") + '</div>';

    epContent.appendChild(title);
    epContent.appendChild(desc);
    var hl = (P.highlights || []);
    if(hl.length){
      var grid = document.createElement("div");
      grid.className = "events-grid three-cols";
      hl.forEach(function(h){
        var card = document.createElement("div");
        card.className = "mini-card";

        var avatars = document.createElement("div");
        avatars.className = "row tiny-avatars";
        (h.players || []).forEach(function(pid){
          var img = document.createElement("img");
          img.className = "avatar xs";
          img.src = picOf(pid);
          img.alt = "";
          avatars.appendChild(img);
        });

        card.innerHTML = avatars.outerHTML + "<div>" + (h.text || "") + "</div>";
        grid.appendChild(card);
      });
      epContent.appendChild(grid);
    }

    addProceed(ep, section);
    return;
  }

  if(section === "panel"){
    var PN = S.panel || {};
    epSub.textContent = "Panel";

    var intro = document.createElement("div");
    intro.className = "mini-card note";
    intro.innerHTML = '<div><strong>Host:</strong> Welcome to the Panel. Tonight we\'ll say goodbye to one of you.</div>';
    epContent.appendChild(intro);
    var notes = (PN.notes || []);
    if(notes.length){
      var grid = document.createElement("div");
      grid.className = "events-grid three-cols";
      notes.forEach(function(n){
        var card = document.createElement("div");
        card.className = "mini-card";

        var avatars = document.createElement("div");
        avatars.className = "row tiny-avatars";
        (n.players || []).forEach(function(pid){
          var img = document.createElement("img");
          img.className = "avatar xs";
          img.src = picOf(pid);
          img.alt = "";
          avatars.appendChild(img);
        });

        card.innerHTML = avatars.outerHTML + "<div>" + (n.text || "") + "</div>";
        grid.appendChild(card);
      });
      epContent.appendChild(grid);
    }

    addProceed(ep, section);
    return;
  }

  if(section === "callout"){
    var CO = S.callout || {};
    epSub.textContent = "Call-Out";

    var aliveCount = (S.status || []).length;
    var photosCount = Math.max(0, aliveCount - 1);
    var speech = document.createElement("div");
    speech.className = "mini-card note";
    speech.innerHTML =
      '<div>' + aliveCount + ' models stand before me. But I only have <strong>' +
      photosCount + '</strong> photos in my hands. And these photos represent the models that are still in the running towards becoming America\'s Next Top Model.</div>';
    epContent.appendChild(speech);

    var order = (CO.order || []).slice();
    var maxNormal = Math.max(0, order.length - 2);
    if(!state.ui) state.ui = {};
    if(!state.ui[ep]) state.ui[ep] = {};
    var ui = state.ui[ep];
    var idx = ui.calloutIndex || 0;
    if(idx < 0) idx = 0;
    if(idx > maxNormal) idx = maxNormal;

var listWrap = document.createElement("div");
listWrap.className = "status-grid";

listWrap.style.display = "flex";
listWrap.style.flexDirection = "column";
listWrap.style.gap = "12px";
listWrap.style.alignItems = "center";

epContent.appendChild(listWrap);

    function tile(pid, labelText){
      var card = statusCardSquare(pid);
      card.dataset.pid = pid;

      var badge = document.createElement("div");
      badge.className = "badge muted";
      badge.textContent = labelText;

      card.appendChild(badge);
      return card;
    }

    for(var k=0; k<idx; k++){
      var pid0 = order[k];
      if(pid0) listWrap.appendChild(tile(pid0, ordinal(k+1) + " Call-Out"));
    }

    function renderBottomTwo(){
      var b2 = document.createElement("div");
      b2.className = "mini-card note";
      b2.innerHTML =
        '<div>Two models stand before me, but I only have one photo in my hands. And this photo represents the model that is still in the running towards becoming America\'s Next Top Model. And that model is...</div>';
      epContent.appendChild(b2);

      var btWrap = document.createElement("div");
      btWrap.className = "status-grid";
      epContent.appendChild(btWrap);

      var bt = (CO.bottomTwo && CO.bottomTwo.length) ? CO.bottomTwo.slice(0,2) : order.slice(-2);

bt.sort(function(a,b){
  var A = (nameOf(a) || "").toLowerCase();
  var B = (nameOf(b) || "").toLowerCase();
  return A.localeCompare(B);
});

      bt.forEach(function(pid){
        if(pid) btWrap.appendChild(tile(pid, "Bottom Two"));
      });

      function markEliminated(){
        var elim = CO.eliminated;
        if(!elim) return;
        var node = btWrap.querySelector('[data-pid="' + elim + '"]');
        if(node){
          node.style.border = "3px solid #c00";
        }
      }

      if(ui.calloutResultRevealed){
        if(CO.twistText){
          var t = document.createElement("div");
          t.className = "mini-card";
          t.innerHTML = "<div>" + CO.twistText + "</div>";
          epContent.appendChild(t);
        }

        markEliminated();
        addProceed(ep, section);
        return;
      }

      var reveal = document.createElement("button");
      reveal.className = "btn";
      reveal.textContent = "Reveal Result";
      reveal.onclick = function(){
        reveal.remove();

        ui.calloutResultRevealed = true;
        State.save(state);

        if(CO.twistText){
          var t2 = document.createElement("div");
          t2.className = "mini-card";
          t2.innerHTML = "<div>" + CO.twistText + "</div>";
          epContent.appendChild(t2);
        }

        markEliminated();
        addProceed(ep, section);
      };

      epActions.appendChild(reveal);
    }

    if(idx >= maxNormal){
      renderBottomTwo();
      return;
    }

    var btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Show Call-Out";

    btn.onclick = function(){
      var i = ui.calloutIndex || 0;

      if(i < maxNormal){
        var pid = order[i];
        if(pid) listWrap.appendChild(tile(pid, ordinal(i+1) + " Call-Out"));
        ui.calloutIndex = i + 1;
        State.save(state);
      }

      if((ui.calloutIndex || 0) >= maxNormal){
        btn.remove();
        renderBottomTwo();
      }
    };

    epActions.appendChild(btn);
    return;
  }

  if(section === "final_commercial" || section === "final_photoshoot" || section === "final_runway"){
    var data =
      (section === "final_commercial") ? E.final_commercial :
      (section === "final_photoshoot") ? E.final_photoshoot :
      E.final_runway;

    if(!data){
      epContent.innerHTML = "<div class='desc'>No final data generated.</div>";
      return;
    }

    var title = document.createElement("div");
    title.className = "challenge-name";
    title.textContent = data.name || "Final Challenge";
    epContent.appendChild(title);

    var desc = document.createElement("div");
    desc.className = "mini-card note";
    desc.innerHTML = '<div><strong>Description:</strong> ' + (data.description || "") + '</div>';
    epContent.appendChild(desc);

    var grid = document.createElement("div");
    grid.className = "events-grid three-cols";

    (data.highlights || []).forEach(function(h){
      var card = document.createElement("div");
      card.className = "mini-card";

      var avatars = document.createElement("div");
      avatars.className = "row tiny-avatars";
      (h.players || []).forEach(function(pid){
        var img = document.createElement("img");
        img.className = "avatar xs";
        img.src = picOf(pid);
        img.alt = "";
        avatars.appendChild(img);
      });

      card.innerHTML = avatars.outerHTML + "<div>" + (h.text || "") + "</div>";
      grid.appendChild(card);
    });

    epContent.appendChild(grid);

    addProceed(ep, section);
    return;
  }

  if(section === "final_panel"){
    var intro = document.createElement("div");
    intro.className = "desc";
    intro.innerHTML = "<div><strong>Host:</strong> Welcome to the Final Panel. Tonight we’ll crown America’s Next Top Model.</div>";
    epContent.appendChild(intro);

    var grid = document.createElement("div");
    grid.className = "events-grid three-cols";
    (E.final_panel && E.final_panel.notes ? E.final_panel.notes : []).forEach(function(n){
      var card = document.createElement("div");
      card.className = "mini-card";

      var avatars = document.createElement("div");
      avatars.className = "row tiny-avatars";
      (n.players || []).forEach(function(pid){
        var img = document.createElement("img");
        img.className = "avatar xs";
        img.src = picOf(pid);
        img.alt = "";
        avatars.appendChild(img);
      });

      card.appendChild(avatars);

      var txt = document.createElement("div");
      txt.innerHTML = (n.text || "");
      card.appendChild(txt);

      grid.appendChild(card);
    });
    epContent.appendChild(grid);
    addProceed(ep, section);
    return;
  }

  if(section === "winner"){
    if(!E.winner){
      epContent.innerHTML = "<div class='desc'>Winner not generated.</div>";
      return;
    }

    var intro = document.createElement("div");
    intro.className = "mini-card note";
    intro.innerHTML =
      "<div><strong>Host:</strong> This has been a hard-fought battle from the very first shoot to the final runway. " +
      "You’ve taken direction, pushed through pressure, and proven you can adapt, elevate, and deliver when it matters most. " +
      "Tonight, we’re not just crowning a winner — we’re choosing the model who consistently showed professionalism, presence, and star power. " +
      "All of you should be proud. But only one of you will become America’s Next Top Model.</div>";
    epContent.appendChild(intro);

    var winnerId = E.winner.winnerId;

    if(!state.ui) state.ui = {};
    if(!state.ui[ep]) state.ui[ep] = {};
    var ui = state.ui[ep];

    function renderWinnerReveal(){
      var card = statusCardSquare(winnerId);
      card.className += " winner-big";
      card.style.width = "360px";
      card.style.margin = "16px auto 0";
      card.style.padding = "16px";

      var img = card.querySelector("img");
      if(img){
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
      }

      var nm = card.querySelector(".name");
      if(nm){
        nm.style.fontSize = "24px";
        nm.style.fontWeight = "900";
        nm.style.marginTop = "12px";
      }

      epContent.appendChild(card);

      var congrats = document.createElement("div");
      congrats.className = "mini-card";
      congrats.style.marginTop = "10px";
      congrats.innerHTML =
        "<div style='text-align:center; font-weight:900; font-size:18px;'>" +
        "Congratulations, you are <span style='white-space:nowrap;'>America’s Next Top Model</span>!" +
        "</div>";
      epContent.appendChild(congrats);

      if(E.winner.speech){
        var sp = document.createElement("div");
        sp.className = "mini-card";
        sp.style.marginTop = "12px";
        sp.innerHTML = "<div>" + E.winner.speech + "</div>";
        epContent.appendChild(sp);
      }

      addProceed(ep, section);
    }

    if(ui.winnerRevealed){
      renderWinnerReveal();
      return;
    }

    var btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Reveal Winner";
    btn.onclick = function(){
      btn.remove();
      ui.winnerRevealed = true;
      State.save(state);
      renderWinnerReveal();
    };
    epActions.appendChild(btn);

    return;
  }
}
    function placementsByGender(){
      var allMen = (state.castMen||[]).filter(Boolean).map(function(c){return c.id;});
      var allWomen = (state.castWomen||[]).filter(Boolean).map(function(c){return c.id;});
      var genderOf = function(id){
        if(allMen.indexOf(id)>=0) return "male";
        if(allWomen.indexOf(id)>=0) return "female";
        return "unknown";
      };

      var maleElims = state.placements.eliminated.filter(function(e){ return genderOf(e.id)==="male"; })
                        .sort(function(a,b){ return b.episode - a.episode; })
                        .map(function(e){ return e.id; });
      var femaleElims = state.placements.eliminated.filter(function(e){ return genderOf(e.id)==="female"; })
                        .sort(function(a,b){ return b.episode - a.episode; })
                        .map(function(e){ return e.id; });

      var maleFinal = [state.placements.winners.male, state.placements.second.male, state.placements.third.male].filter(Boolean);
      var femaleFinal = [state.placements.winners.female, state.placements.second.female, state.placements.third.female].filter(Boolean);

      var menFull = [];
      menFull[1]=maleFinal[0]||null; menFull[2]=maleFinal[1]||null; menFull[3]=maleFinal[2]||null;
      var idx=4; for(var i=0;i<maleElims.length;i++){ menFull[idx++]=maleElims[i]; }
      var womenFull = [];
      womenFull[1]=femaleFinal[0]||null; womenFull[2]=femaleFinal[1]||null; womenFull[3]=femaleFinal[2]||null;
      idx=4; for(var j=0;j<femaleElims.length;j++){ womenFull[idx++]=femaleElims[j]; }

      return { men:menFull, women:womenFull };
    }

function showStatisticsPanel(kind){
  viewCast.hidden = true;
  viewEpisode.hidden = false;
  epActions.innerHTML = "";
  epContent.innerHTML = "";

  function getFinalEp(){
    var eps = Object.keys(state.episodes || {}).map(function(x){ return +x; }).filter(function(n){ return n>0; });
    if(!eps.length) return 0;
    eps.sort(function(a,b){ return a-b; });
    return eps[eps.length-1];
  }

  function computePlacements(){
    var finalEp = getFinalEp();
    if(!finalEp) return [];

    var finalE = state.episodes[finalEp] || {};
    var top3 = (finalE.winner && finalE.winner.order) ? finalE.winner.order.slice() : [];
    var elimSeq = [];
    for(var ep=1; ep<finalEp; ep++){
      var cur = (state.episodes[ep] && state.episodes[ep].status) ? state.episodes[ep].status.slice() : [];
      var nxt = (state.episodes[ep+1] && state.episodes[ep+1].status) ? state.episodes[ep+1].status.slice() : [];
      var dropped = cur.filter(function(pid){ return nxt.indexOf(pid) < 0; });
      dropped.forEach(function(pid){ elimSeq.push(pid); });
    }

    var placements = [];
    placements[1] = top3[0] || null;
    placements[2] = top3[1] || null;
    placements[3] = top3[2] || null;

    var rev = elimSeq.slice().reverse();
    var place = 4;
    rev.forEach(function(pid){
      placements[place++] = pid;
    });

    return placements;
  }

  if(kind === "placements"){
    epTitle.textContent = "Placements";
    epSub.textContent = "Season Results";

    var P = computePlacements();
    if(!P.length || !P[1]){
      epContent.innerHTML = "<div class='desc'>No placements yet. Simulate a season first.</div>";
      return;
    }

    var winWrap = document.createElement("div");
    winWrap.style.display = "flex";
    winWrap.style.flexDirection = "column";
    winWrap.style.alignItems = "center";
    winWrap.style.gap = "10px";

    var winCard = statusCardSquare(P[1]);
    labelUnder(winCard, "Winner");
    winWrap.appendChild(winCard);
    epContent.appendChild(winWrap);

    var ruWrap = document.createElement("div");
    ruWrap.style.display = "flex";
    ruWrap.style.justifyContent = "center";
    ruWrap.style.gap = "14px";
    ruWrap.style.marginTop = "14px";
    ruWrap.style.flexWrap = "wrap";

    if(P[2]){
      var c2 = statusCardSquare(P[2]);
      labelUnder(c2, "Runner-Up");
      ruWrap.appendChild(c2);
    }
    if(P[3]){
      var c3 = statusCardSquare(P[3]);
      labelUnder(c3, "3rd Place");
      ruWrap.appendChild(c3);
    }
    epContent.appendChild(ruWrap);

    var rest = document.createElement("div");
    rest.style.display = "grid";
    rest.style.gridTemplateColumns = "repeat(5, minmax(0, 1fr))";
    rest.style.gap = "12px";
    rest.style.marginTop = "16px";
    rest.style.alignItems = "start";

    for(var p=4; p<P.length; p++){
      if(!P[p]) continue;
      var card = statusCardSquare(P[p]);
      labelUnder(card, ordinal(p) + " Place");
      rest.appendChild(card);
    }

    epContent.appendChild(rest);
    var btnProceed = document.createElement("button");
    btnProceed.className = "btn";
    btnProceed.textContent = "Proceed";
    btnProceed.onclick = function(){
      showStatisticsPanel("other");
      btnProceed.remove();
    };
    epActions.appendChild(btnProceed);
    return;
  }

  if(kind === "other"){
    epTitle.textContent = "Other Statistics";
    epSub.textContent = "";

    var finalEp = getFinalEp();
    if(!finalEp){
      epContent.innerHTML = "<div class='desc'>No stats yet. Simulate a season first.</div>";
      return;
    }

    var challengeWins = {};
    var firstCallouts = {};
    var bottomTwos = {};

    for(var ep=1; ep<finalEp; ep++){
      var E = state.episodes[ep] || {};

      if(E.challenge && E.challenge.winners && E.challenge.winners.length){
        E.challenge.winners.forEach(function(pid){
          challengeWins[pid] = (challengeWins[pid] || 0) + 1;
        });
      }

      if(E.callout && E.callout.order && E.callout.order.length){
        var fco = E.callout.order[0];
        if(fco) firstCallouts[fco] = (firstCallouts[fco] || 0) + 1;
      }

      if(E.callout && E.callout.bottomTwo && E.callout.bottomTwo.length){
        E.callout.bottomTwo.forEach(function(pid){
          if(pid) bottomTwos[pid] = (bottomTwos[pid] || 0) + 1;
        });
      }
    }

    function topFromCounts(map){
      var best = -1;
      var list = [];
      Object.keys(map || {}).forEach(function(pid){
        var v = +map[pid] || 0;
        if(v > best){
          best = v; list = [pid];
        } else if(v === best){
          list.push(pid);
        }
      });
      return { value: (best < 0 ? 0 : best), list: list };
    }

    var A = topFromCounts(challengeWins);
    var B = topFromCounts(firstCallouts);
    var C = topFromCounts(bottomTwos);

    var tbl = document.createElement("table");
    tbl.className = "stats-table";
    tbl.style.width = "100%";

    var tbody = document.createElement("tbody");

    function addRow(label, obj){
      var tr = document.createElement("tr");

      var td1 = document.createElement("td");
      td1.textContent = label;

      var td2 = document.createElement("td");
      td2.textContent = obj.list.length ? obj.list.map(nameOf).join(", ") : "—";

      var td3 = document.createElement("td");
      td3.textContent = obj.list.length ? String(obj.value) : "—";

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tbody.appendChild(tr);
    }

    addRow("Most Challenge Wins", A);
    addRow("Most First Call-Outs", B);
    addRow("Most Bottom Twos", C);

    tbl.appendChild(tbody);
    epContent.appendChild(tbl);
    var btnProceed = document.createElement("button");
    btnProceed.className = "btn";
    btnProceed.textContent = "Proceed";
    btnProceed.onclick = function(){
      showStatisticsPanel("other");
      btnProceed.remove();
    };
    epActions.appendChild(btnProceed);
    return;
  }

  if(kind === "chart"){
    epTitle.textContent = "Season Chart";
    epSub.textContent = "";

    var btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Open Season Chart";
    btn.onclick = function(){
      location.href = "./season_chart.html";
    };

    epContent.appendChild(btn);
    return;
  }
}
})();