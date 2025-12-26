  (function(){
    "use strict";

    var IMG_BLANK="BlankProfile.webp";
    var rnd = function(n){ return Math.floor(Math.random()*n); };
    var sample = function(arr){ return arr && arr.length ? arr[rnd(arr.length)] : undefined; };
    var shuffle = function(arr){ return arr.map(function(v){return [Math.random(),v];}).sort(function(a,b){return a[0]-b[0];}).map(function(x){return x[1];}); };
    var clamp = function(n,min,max){ return Math.max(min, Math.min(max,n)); };

var randModal = document.createElement("dialog");
randModal.id = "randomize-modal";
randModal.className = "antm-modal";
randModal.innerHTML =
  '<form id="rand-form" method="dialog" autocomplete="off">' +
    '<h3>Randomize Cast</h3>' +
'<div id="rand-show-list" style="display:flex;flex-direction:column;gap:6px;margin:10px 0;max-height:260px;overflow-y:auto;padding-right:8px;"></div>' +
    '<menu>' +
      '<button type="button" class="btn" id="rand-cancel">Cancel</button>' +
      '<button type="submit" class="btn">Randomize</button>' +
    '</menu>' +
  '</form>';
document.body.appendChild(randModal);

function buildRandomizeShowList(){
  var list   = randModal.querySelector("#rand-show-list");
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

function randomizeTeamsWithPrefs(prefs){
  var roster = filterRosterByPrefs(prefs);
  if (!roster.length){
    alert("No eligible players for the selected shows/seasons.");
    return;
  }

  var males   = roster.filter(function(r){ return r.gender === "male"; });
  var females = roster.filter(function(r){ return r.gender === "female"; });

  var needMen   = 18;
  var needWomen = 18;

  if (males.length < needMen || females.length < needWomen) {
    alert("You need at least " + needMen + " men and " + needWomen +
          " women in the filtered pool. Try fewer restrictions.");
    return;
  }

  var menShuffled   = shuffle(males).slice(0, needMen);
  var womenShuffled = shuffle(females).slice(0, needWomen);

  state.castMen   = menShuffled.map(asEntry);
  state.castWomen = womenShuffled.map(asEntry);

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

  var formRand  = randModal.querySelector("#rand-form");
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
    randomizeTeamsWithPrefs(prefs);
  };

  btnCancel.onclick = function(){
    randModal.close();
  };
}

    (function normalizePlayers(){
      if (Array.isArray(window.PLAYERS) && window.PLAYERS.length) return;
      var src = window.PLAYERS || window.players || window.player_data;
      if (!Array.isArray(src) || src.length === 0) {
        var pd = window.playerData;
        if (pd && (Array.isArray(pd.males) || Array.isArray(pd.females) || Array.isArray(pd.others))) {
var tag = function(arr, gender){
  return (Array.isArray(arr) ? arr : []).map(function(p){
    var obj = {
      id: p.id,
      name: p.name,
      nickname: p.nickname || p.name || p.id,
      show: p.show,
      season: p.season,
      gender: gender || p.gender || "unknown",
      image: p.image || (p.id ? ("../../contestant_pictures/" + p.id + ".webp") : IMG_BLANK)
    };

    if (Array.isArray(p.shows) && p.shows.length){
      obj.shows = p.shows.slice();
    }
    if (p.seasonsByShow && typeof p.seasonsByShow === "object"){
      obj.seasonsByShow = Object.assign({}, p.seasonsByShow);
    }

    if (!obj.shows && obj.show){
      obj.shows = [obj.show];
    }
    if (!obj.seasonsByShow && obj.show && obj.season != null){
      obj.seasonsByShow = {};
      obj.seasonsByShow[obj.show] = Array.isArray(obj.season)
        ? obj.season.slice()
        : [obj.season];
    }

    return obj;
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
    var KEY="challenge-bots2-season";
    var State={ load:function(){ try{ return JSON.parse(sessionStorage.getItem(KEY)) || null; }catch(e){ return null; } },
                save:function(s){ sessionStorage.setItem(KEY, JSON.stringify(s)); },
                clear:function(){ sessionStorage.removeItem(KEY); } };


var state = State.load() || {
  seed: Math.random().toString(36).slice(2,8).toUpperCase(),
  castMen:  Array.from({length:18}).map(function(){return null;}),
  castWomen:Array.from({length:18}).map(function(){return null;}),
  players: [],
  relationships: {},
  profiles: {},
  episodes: {},
  ui: {},
    stats: {
    dailyWins:{},
    elimWins:{},
    elimPlays:{},
    notPicked:{},
    teamDailyWins:{ female:0, male:0 },
    winningLeader:{},
    losingLeader:{},
    notLeader:{}
  },
  placements: { winners:{ male:null, female:null }, second:{ male:null, female:null }, third:{ male:null, female:null }, eliminated:[] },
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
    function skillOf(pid, key){
      var s = (state.profiles[pid] && (state.profiles[pid][key])) || 0;
      return typeof s === "number" ? clamp(s,-5,5) : 0;
    }
    function nameOf(pid){
      var all = (state.castMen.concat(state.castWomen)).filter(Boolean);
      var c = all.find(function(x){ return x && x.id===pid; });
      return c ? (c.nickname || c.name || pid) : pid;
    }
    function picOf(pid){
      var all = (state.castMen.concat(state.castWomen)).filter(Boolean);
      var c = all.find(function(x){ return x && x.id===pid; });
      return c ? (c.image || IMG_BLANK) : IMG_BLANK;
    }
    function teamColorOf(pid){
      var women = state.castWomen || [];
      var men   = state.castMen || [];
      if (women.some(function(c){ return c && c.id === pid; })) return "#ffc0cb";
      if (men.some(function(c){ return c && c.id === pid; }))   return "#add8e6";
      return "#cccccc";
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

function playerOptions(roster, genderNeeded, selectedId){
  var showFilter = elFilterShow.value;
  var filtered = (roster||[]).filter(function(r){
    var ok = (!showFilter || playerHasShow(r, showFilter));
    return !genderNeeded ? ok : (ok && r.gender===genderNeeded);
  });
  var opts = ['<option value="">Choose</option>'];
  for (var i=0;i<filtered.length;i++){
    var r = filtered[i]; 
    var sel = (selectedId && r.id===selectedId) ? " selected" : "";
    opts.push('<option value="'+r.id+'"'+sel+'>'+ (r.name || r.nickname || r.id) +'</option>');
  }
  return opts.join("");
}
function buildTeamBox(label, genderKey, count){
  var box = document.createElement("div");
  box.className = "team-box";

  var teamName  = (genderKey === "male" ? "Male Team" : "Female Team");
  var teamColor = (genderKey === "male" ? "#add8e6" : "#ffc0cb");
  box.style.border = "2px solid " + teamColor;
  box.innerHTML =
    '<div class="team-head">' +
      '<span class="label" style="color:'+teamColor+'">'+teamName+'</span>' +
    '</div>';

  var inner = document.createElement("div");
  inner.className = "team-inner";

  for (var i = 0; i < count; i++){
    var slot  = (genderKey === "male" ? state.castMen[i] : state.castWomen[i]) || null;
    var title = (genderKey === "male" ? "Man " : "Woman ") + (i+1);
    var card  = document.createElement("div");
    card.className = "pick-card";
    card.innerHTML =
      '<img class="avatar" src="'+(slot ? slot.image : IMG_BLANK)+'" alt="">' +
      '<div class="name">'+(slot ? (slot.nickname) : title)+'</div>' +
      '<select class="pick-player" data-gender="'+genderKey+'" data-slot="'+i+'">'+
        playerOptions(window.PLAYERS||[], genderKey, slot ? slot.id : "") +
      '</select>' +
      '<button class="btn btn-custom" data-gender="'+genderKey+'" data-slot="'+i+'" type="button">Custom Player</button>';
    inner.appendChild(card);
  }

  box.appendChild(inner);
  return box;
}
    function buildTeamsGrid(roster){
      elTeams.innerHTML = "";
      elTeams.appendChild(buildTeamBox("", "female", 18));
      elTeams.appendChild(buildTeamBox("", "male", 18));
      elTeams.querySelectorAll(".pick-player").forEach(function(sel){
        sel.onchange = function(e){
          var i = +e.target.dataset.slot, gender = e.target.dataset.gender, id = e.target.value || "";
          if(!id){
            if(gender==="male") state.castMen[i]=null; else state.castWomen[i]=null;
            State.save(state); return buildTeamsGrid(roster||[]);
          }
          var p = (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id]) || (roster||[]).find(function(r){return r.id===id;});
          if(!p || (gender && p.gender!==gender)) return;
          var entry = asEntry(p);
          if(gender==="male") state.castMen[i]=entry; else state.castWomen[i]=entry;
          State.save(state); buildTeamsGrid(roster||[]);
        };
      });
      elTeams.querySelectorAll(".btn-custom").forEach(function(btn){
        btn.onclick = function(){ openCustomModal(btn.dataset.gender, +btn.dataset.slot); };
      });
      var filledMen = state.castMen.filter(Boolean).length,
    filledWomen = state.castWomen.filter(Boolean).length;
elInfoCast.textContent = (filledMen===18 && filledWomen===18) ? "36" : (filledMen+filledWomen);
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
    function openCustomModal(gender, slot){
      modal.showModal();
      var formCustom = modal.querySelector("#custom-form");
      var cancelBtn = modal.querySelector("#modal-cancel");
      formCustom.onsubmit = function(ev){
        ev.preventDefault();
        var name = formCustom.querySelector("#cp-name").value.trim();
        var nickname = formCustom.querySelector("#cp-nickname").value.trim();
        var g = gender;
        var image = formCustom.querySelector("#cp-image").value.trim();
        if(!name || !nickname){ return; }
        if(g!==gender){ alert("Please match slot gender: "+gender); return; }
        var id = nickname.toLowerCase().replace(/[^a-z0-9]+/g,"_") + "_" + Date.now().toString(36);
        var cp = { id:id, name:name, nickname:nickname, gender:g, show:"Custom", image:image || IMG_BLANK };
        if(g==="male") state.castMen[slot] = asEntry(cp); else state.castWomen[slot] = asEntry(cp);
        State.save(state); modal.close(); formCustom.reset(); buildTeamsGrid(window.PLAYERS||[]);
      };
      cancelBtn.onclick = function(){ modal.close(); };
    }

    function resetSeasonKeepCast(){
      state.episodes   = {};
      state.ui         = {};
      state.chart      = { finalized:false, episodes:{} };
      state.stats      = {
        dailyWins:{},
        elimWins:{},
        elimPlays:{},
        notPicked:{},
        teamDailyWins:{ female:0, male:0 },
        winningLeader:{},
        losingLeader:{},
        notLeader:{}
      };
      state.placements = {
        winners:{ male:null, female:null },
        second:{ male:null, female:null },
        third:{ male:null, female:null },
        eliminated:[]
      };
      state.simulated = false;
      state.lastView  = null;

      State.save(state);

      viewCast.hidden    = false;
      viewEpisode.hidden = true;
      elAccordion.innerHTML    = "";
      statsPanel.style.display = "none";
      elInfoStatus.textContent = "Not simulated";
      var filledMen   = (state.castMen   || []).filter(Boolean).length;
      var filledWomen = (state.castWomen || []).filter(Boolean).length;
      elInfoCast.textContent = String(filledMen + filledWomen);

      if (typeof window !== "undefined" && window.scrollTo){
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    document.getElementById("btn-reset-session").addEventListener("click", function(e){ e.preventDefault(); State.clear(); location.reload(); });
    document.getElementById("btn-back-cast").addEventListener("click", function(e){
      e.preventDefault();
      resetSeasonKeepCast();
    });
    document.getElementById("btn-profiles").addEventListener("click", function(){ location.href = "./profiles.html"; });
    document.getElementById("btn-relationships").addEventListener("click", function(){ location.href = "./relationships.html"; });
document.getElementById("btn-randomize").onclick = openRandomizeModal;
document.getElementById("btn-reset-cast").onclick=function(){
  state.castMen = Array.from({length:18}).map(function(){return null;});
  state.castWomen = Array.from({length:18}).map(function(){return null;});
  State.save(state); buildTeamsGrid(window.PLAYERS||[]);
};

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
        elInfoStatus.textContent="Simulated";
        elInfoCast.textContent = (state.castMen.filter(Boolean).length + state.castWomen.filter(Boolean).length);
        statsPanel.style.display="block";
      }
      document.getElementById("goto-placements").onclick=function(){ showStatisticsPanel("placements"); };
      document.getElementById("goto-stats").onclick=function(){ showStatisticsPanel("other"); };
      document.getElementById("goto-chart").onclick = function () {
  showEpisodeSection(null, null);
  showStatisticsPanel("chart");
};
    })();

    function setAliveFromCast(){
      state.players = state.castMen.concat(state.castWomen).filter(Boolean).map(function(c){
        return { id:c.id, name:c.name, nickname:c.nickname, image:c.image, gender:c.gender, alive:true };
      });
    }
    function aliveIds(){ return state.players.filter(function(p){return p.alive!==false;}).map(function(p){return p.id;}); }
    function aliveByGender(gender){ return state.players.filter(function(p){return p.alive!==false && p.gender===gender;}).map(function(p){return p.id;}); }

    function assignLeaders(ep){
      var leaderCount = (ep === 14 || ep === 15) ? 2 : 3;

      var femaleAlive = aliveByGender("female");
      var maleAlive   = aliveByGender("male");

      function pickMany(ids, count){
        var pool = ids.slice();
        var out = [];
        count = Math.min(count, pool.length);
        while (out.length < count && pool.length){
          var idx = rnd(pool.length);
          out.push(pool[idx]);
          pool.splice(idx, 1);
        }
        return out;
      }

      return {
        female: pickMany(femaleAlive, leaderCount),
        male:   pickMany(maleAlive, leaderCount)
      };
    }

    function renderNames(t, ids){
      var out=t||"";
      var labels=["{A}","{B}","{C}"];
      (ids||[]).forEach(function(pid,i){ out = out.split(labels[i]).join(nameOf(pid)); });
      return out;
    }

function genHouseEvents(){
  var alive = aliveIds();
  var E = window.BOTS2_EVENTS ||
          window.battle_of_the_sexes2_events ||
          window.D2_EVENTS || {};
  var out = [];

  var pick = function(arr){ return (arr && arr.length) ? sample(arr) : null; };
  var count = 4 + rnd(4);
  for (var i = 0; i < count; i++){
    var roll = Math.random();

    if (roll < 0.3){
      var A = sample(alive);
      var soloBucket = E.solo_neutral || E.solo || [];
      if (rel(A, A) >= 5 && E.solo_positive && Math.random() < 0.35) soloBucket = E.solo_positive;
      if (rel(A, A) <= -3 && E.solo_negative && Math.random() < 0.35) soloBucket = E.solo_negative;

      var ev1 = pick(soloBucket);
      if (ev1 && A) out.push({ players:[A], text:renderNames(ev1, [A]) });

    } else if (roll < 0.8){
      var P1 = sample(alive);
      var P2 = sample(alive.filter(function(x){ return x !== P1; })) || P1;
      var bucket = E.two_neutral || E.two || [];
      var r = rel(P1, P2);
      if (r >= 5 && E.two_positive && Math.random() < 0.35) bucket = E.two_positive;
      if (r <= -3 && E.two_negative && Math.random() < 0.35) bucket = E.two_negative;

      var ev2 = pick(bucket);
      if (ev2 && P1 && P2) out.push({ players:[P1, P2], text:renderNames(ev2,[P1,P2]) });

    } else {
      var A3 = sample(alive);
      var B3 = sample(alive.filter(function(x){ return x !== A3; }));
      var C3 = sample(alive.filter(function(x){ return x !== A3 && x !== B3; }));
      var teamBucket = E.team_neutral || E.team || [];
      var ev3 = pick(teamBucket);
      if (ev3 && A3 && B3 && C3){
        out.push({ players:[A3,B3,C3], text:renderNames(ev3,[A3,B3,C3]) });
      }
    }
  }

  return out;
}

function computeVoteOff(ep, daily, leaders, statusList){
  var result = {
    winnerSide: null,
    loserSide: null
  };

  if (!daily || !daily.winnerTeam || !leaders) return result;

  var status = (statusList && statusList.slice()) || aliveIds();

  var winnerTeam = daily.winnerTeam;
  var loserTeam  = daily.loserTeam || (winnerTeam === "female" ? "male" : "female");

  var leadersWin  = (leaders[winnerTeam] || []).slice();
  var leadersLose = (leaders[loserTeam]  || []).slice();

  leadersWin.forEach(function(id){
    state.stats.winningLeader[id] = (state.stats.winningLeader[id] || 0) + 1;
  });
  leadersLose.forEach(function(id){
    state.stats.losingLeader[id] = (state.stats.losingLeader[id] || 0) + 1;
  });

  var allLeadersMap = {};
  (leaders.female || []).concat(leaders.male || []).forEach(function(id){
    allLeadersMap[id] = true;
  });
  status.forEach(function(id){
    if (!allLeadersMap[id]) {
      state.stats.notLeader[id] = (state.stats.notLeader[id] || 0) + 1;
    }
  });

  function teamStatusIds(team){
    return status.filter(function(id){
      var p = state.players.find(function(p){ return p.id === id; });
      return p && p.gender === team;
    });
  }

  var winnerTeamPlayers = teamStatusIds(winnerTeam);
  var loserTeamPlayers  = teamStatusIds(loserTeam);

var winningLeaders = leaders[winnerTeam].slice();
var winningPlayers = winnerTeamPlayers.slice();

var winCandidates = winningPlayers.filter(function (pid) {
    return !winningLeaders.includes(pid);
});

var winTallies = {};
var winVotes = [];

winningLeaders.forEach(function (voter) {
    var candidates = winCandidates.filter(function (c) { return c !== voter; });
    if (!candidates.length) return;

    var worst = null, worstScore = null;

    candidates.forEach(function (c) {
        var r = rel(voter, c);
        if (worstScore === null || r < worstScore) {
            worstScore = r;
            worst = [c];
        } else if (r === worstScore) {
            worst.push(c);
        }
    });

    var chosen = sample(worst);
    if (!chosen) return;

    winVotes.push({ voter: voter, target: chosen });
    winTallies[chosen] = (winTallies[chosen] || 0) + 1;
});

var eliminatedWinner = null;
if (Object.keys(winTallies).length) {
    var max = Math.max.apply(null, Object.values(winTallies));
    var tied = Object.keys(winTallies).filter(function (id) { return winTallies[id] === max; });
    eliminatedWinner = sample(tied);
    var pl = state.players.find(p => p.id === eliminatedWinner);
    if (pl) pl.alive = false;
    state.placements.eliminated.push({ id: eliminatedWinner, episode: ep, team: winnerTeam, reason: "inner_circle" });
}

result.winnerSide = {
    team: winnerTeam,
    leaders: winningLeaders,
    votes: winVotes,
    tallies: winTallies,
    eliminated: eliminatedWinner
};

var losingLeaders = leaders[loserTeam].slice();
var losingPlayers = loserTeamPlayers.slice();

var loseVoters = losingPlayers.filter(function (pid) {
    return !losingLeaders.includes(pid);
});

var loseCandidates = losingLeaders.slice();

var loseTallies = {};
var loseVotes = [];

loseVoters.forEach(function (voter) {
    var worst = null, worstScore = null;

    loseCandidates.forEach(function (c) {
        var r = rel(voter, c);
        if (worstScore === null || r < worstScore) {
            worstScore = r;
            worst = [c];
        } else if (r === worstScore) {
            worst.push(c);
        }
    });

    var chosen = sample(worst);
    if (!chosen) return;

    loseVotes.push({ voter: voter, target: chosen });
    loseTallies[chosen] = (loseTallies[chosen] || 0) + 1;
});

var eliminatedLoser = null;
if (Object.keys(loseTallies).length) {
    var max2 = Math.max.apply(null, Object.values(loseTallies));
    var tied2 = Object.keys(loseTallies).filter(function (id) { return loseTallies[id] === max2; });
    eliminatedLoser = sample(tied2);
    var pl2 = state.players.find(p => p.id === eliminatedLoser);
    if (pl2) pl2.alive = false;
    state.placements.eliminated.push({ id: eliminatedLoser, episode: ep, team: loserTeam, reason: "team_vote" });
}

result.loserSide = {
    team: loserTeam,
    leaders: losingLeaders,
    voters: loseVotes,
    tallies: loseTallies,
    eliminated: eliminatedLoser
};
  return result;
}

function computeDaily(ep){
  var dailyData =
    (window.BOTS2_DAILY_DATA ||
     window.battle_of_the_sexes2_daily_data ||
     window.D2_DAILY_DATA ||
     []);

  var D = dailyData.find(function(d){ return d.episode === ep; });
  if (!D) return null;

  var out = {
    name: D.name || ("Daily " + ep),
    description: D.description || "",
    skillWeights: D.skillWeights || {},
    winnerTeam: null,
    loserTeam: null,
    teamScores: { female: 0, male: 0 },
    winners: [],
    losers: [],
    highlights: []
  };

  var femaleIds = aliveByGender("female");
  var maleIds   = aliveByGender("male");

  function playerScore(id){
    return scorePlayerWeighted(out.skillWeights, id);
  }

  function teamScore(ids){
    return ids.reduce(function(sum, id){
      return sum + playerScore(id);
    }, 0);
  }

  out.teamScores.female = teamScore(femaleIds);
  out.teamScores.male   = teamScore(maleIds);

  if (out.teamScores.female === out.teamScores.male) {
    out.winnerTeam = (Math.random() < 0.5 ? "female" : "male");
  } else {
    out.winnerTeam = (out.teamScores.female > out.teamScores.male) ? "female" : "male";
  }
  out.loserTeam = (out.winnerTeam === "female" ? "male" : "female");

  out.winners = (out.winnerTeam === "female" ? femaleIds.slice() : maleIds.slice());
  out.losers  = (out.loserTeam  === "female" ? femaleIds.slice() : maleIds.slice());

  var allScored = femaleIds.concat(maleIds).map(function(id){
    return { id:id, score:playerScore(id) };
  });

  allScored.sort(function(a,b){
    if (a.score === b.score) {
      return (Math.random() < 0.5 ? -1 : 1);
    }
    return b.score - a.score;
  });

  var orderedIds = allScored.map(function(x){ return x.id; });
  out.highlights = tierComments(D.comments || {}, orderedIds);

  if (!state.stats.teamDailyWins) {
    state.stats.teamDailyWins = { female: 0, male: 0 };
  }
  state.stats.teamDailyWins[out.winnerTeam] =
    (state.stats.teamDailyWins[out.winnerTeam] || 0) + 1;

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
function selectionChain(ep, daily){
  var alive = aliveIds();
  var winners = (daily && daily.winners) ? daily.winners.slice() : [];
  var winnersSet = new Set(winners);

  var safe = new Set(winners);
  var chain = winners.slice();

  var pool = alive.filter(function(id){ return !safe.has(id); });

  if(winners.length){
    var best=[], sc=-Infinity;
    for(var i=0;i<pool.length;i++){
      var p = pool[i], s = 0;
      for(var w=0; w<winners.length; w++){ s += rel(winners[w], p); }
      if(s > sc){ sc = s; best = [p]; }
      else if(s === sc){ best.push(p); }
    }
    var first = best.length ? sample(best) : null;
    if(first){
      safe.add(first); chain.push(first);
      pool = pool.filter(function(x){ return x !== first; });
    }
  }

  function genderOf(id){
    var all = state.castMen.concat(state.castWomen).filter(Boolean);
    var c = all.find(function(x){ return x.id === id; });
    return c ? c.gender : "unknown";
  }

  while(pool.length > 2){
    var last = chain[chain.length-1] || winners[0];
    var need = (genderOf(last) === "male" ? "female" : "male");
    var cand = pool.filter(function(id){ return genderOf(id) === need; });
    if(!cand.length) break;
    var pickId = bestRelPick(last, cand) || sample(cand);
    safe.add(pickId); chain.push(pickId);
    pool = pool.filter(function(x){ return x !== pickId; });
  }

  var remain = pool.slice();
  var femaleNom = remain.find(function(id){ return state.castWomen.some(function(c){ return c && c.id === id; }); }) || null;
  var maleNom   = remain.find(function(id){ return state.castMen.some(function(c){ return c && c.id === id; }); }) || null;

  var femaleOpp = femaleNom
    ? worstRelPick(femaleNom, aliveByGender("female").filter(function(id){ return id !== femaleNom; }), winnersSet)
    : null;

  var maleOpp = maleNom
    ? worstRelPick(maleNom, aliveByGender("male").filter(function(id){ return id !== maleNom; }), winnersSet)
    : null;

  var nonWinnersAlive = alive.filter(function(id){ return winners.indexOf(id) < 0; });
  var setChain = new Set(chain);
  nonWinnersAlive.forEach(function(id){
    if(!setChain.has(id)) state.stats.notPicked[id] = (state.stats.notPicked[id]||0) + 1;
  });

  return {
    winners: winners.slice(),
    savedChain: chain.slice(),
    lastMale: maleNom || null,
    lastFemale: femaleNom || null,
    callouts: {
      female: (femaleNom && femaleOpp) ? [femaleNom, femaleOpp] : null,
      male:   (maleNom && maleOpp)     ? [maleNom,   maleOpp]   : null
    }
  };
}

    function groupVoteSelectionEp10(){
      var alive=aliveIds();
      var men=aliveByGender("male"), women=aliveByGender("female");
      var votesM={}, votesF={};
      var perVoter=[];
      alive.forEach(function(voter){
        var mPick=worstRelPick(voter, men.filter(function(x){return x!==voter;}));
        var fPick=worstRelPick(voter, women.filter(function(x){return x!==voter;}));
        if(mPick) votesM[mPick]=(votesM[mPick]||0)+1;
        if(fPick) votesF[fPick]=(votesF[fPick]||0)+1;
        perVoter.push({ voter:voter, male:mPick||null, female:fPick||null });
      });
      function topWithTie(map){
        var best=[], max=-1; var keys=Object.keys(map);
        for(var i=0;i<keys.length;i++){ var id=keys[i], v=map[id]; if(v>max){ max=v; best=[id]; } else if(v===max){ best.push(id); } }
        if(best.length<=1) return { pick:best[0]||null, tie:false, pool:best };
        return { pick: sample(best), tie:true, pool:best };
      }
      var mTop=topWithTie(votesM), fTop=topWithTie(votesF);
      var nominatedMale   = mTop.pick;
      var nominatedFemale = fTop.pick;
      var maleOpp   = nominatedMale   ? worstRelPick(nominatedMale,   men.filter(function(x){return x!==nominatedMale;}))   : null;
      var femaleOpp = nominatedFemale ? worstRelPick(nominatedFemale, women.filter(function(x){return x!==nominatedFemale;})) : null;
      return {
        votes:{male:votesM, female:votesF},
        perVoter:perVoter,
        tieMale:mTop.tie, tieFemale:fTop.tie,
        nominatedMale: nominatedMale,
        nominatedFemale: nominatedFemale,
        maleOpponent: maleOpp,
        femaleOpponent: femaleOpp
      };
    }

    function resolveElimination(ep, pairs){
      var ED = (window.D2_ELIMINATION_DATA||[]).find(function(d){return d.episode===ep;}) || {};
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
      var E={ stages:[], results:null };
      var ST = (window.D2_FINAL_STAGES_DATA||[]).slice(0,6);
      var men = aliveByGender("male").slice(0,3);
      var women = aliveByGender("female").slice(0,3);
      function rankStage(ids, weights){
        return ids.map(function(id){ return { id:id, score:scorePlayerWeighted(weights||{}, id) }; })
                  .sort(function(a,b){return b.score-a.score;})
                  .map(function(x){return x.id;});
      }
      for(var i=0;i<ST.length;i++){
        var st=ST[i];
        var mOrder = rankStage(men, st.skillWeights||{});
        var wOrder = rankStage(women, st.skillWeights||{});
        E.stages.push({ name:st.name, description:st.description, comments:st.comments||{}, maleOrder:mOrder, femaleOrder:wOrder });
      }
      function avgPlace(label, id){
        var total=0; for(var j=0;j<E.stages.length;j++){ var arr=(label==="male"?E.stages[j].maleOrder:E.stages[j].femaleOrder); var idx=Math.max(0,arr.indexOf(id)); total += (idx+1); }
        return total / E.stages.length;
      }
      function rankFinal(ids,label){
        return ids.map(function(id){return {id:id, avg:avgPlace(label,id)};})
                  .sort(function(a,b){ if(a.avg!==b.avg) return a.avg-b.avg; return Math.random()<0.5?-1:1; })
                  .map(function(x){return x.id;});
      }
      var maleFinal = rankFinal(men,"male");
      var femaleFinal = rankFinal(women,"female");
      state.placements.winners.male = maleFinal[0]||null;
      state.placements.second.male  = maleFinal[1]||null;
      state.placements.third.male   = maleFinal[2]||null;
      state.placements.winners.female = femaleFinal[0]||null;
      state.placements.second.female  = femaleFinal[1]||null;
      state.placements.third.female   = femaleFinal[2]||null;
      E.results = { male:maleFinal, female:femaleFinal };
      return E;
    }

document.getElementById("btn-simulate").onclick=function(){
  if(state.castMen.filter(Boolean).length!==18 || state.castWomen.filter(Boolean).length!==18){
    alert("Please complete all 18 Men and 18 Women slots before simulating."); return;
  }
  setAliveFromCast();
  simulateSeason();
  state.simulated=true; State.save(state);
  buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false;
  showEpisodeSection(1, "status");
  elInfoStatus.textContent="Simulated"; elInfoCast.textContent = "36";
  statsPanel.style.display="block";
};

function simulateSeason(){
  state.episodes = {};
  state.ui = {};
  state.chart = { finalized:false, episodes:{} };

  state.stats = {
    dailyWins:{},
    elimWins:{},
    elimPlays:{},
    notPicked:{},
    teamDailyWins:{ female:0, male:0 },
    winningLeader:{},
    losingLeader:{},
    notLeader:{}
  };

  state.placements = {
    winners:{male:null,female:null},
    second:{male:null,female:null},
    third:{male:null,female:null},
    eliminated:[]
  };

  for (var ep = 1; ep <= 16; ep++) {
    var E = state.episodes[ep] = {
      status: aliveIds().slice()
    };

    if (ep <= 15) {
      E.leaders = assignLeaders(ep);
      E.events1 = genHouseEvents();
      E.daily = computeDaily(ep);
      E.events2 = genHouseEvents();
      if (typeof computeVoteOff === "function") {
        E.voteOff = computeVoteOff(ep, E.daily, E.leaders, E.status.slice());
      }
    } else if (ep === 16) {
    }
  }

  (function () {
    var Efinal = state.episodes[16];
    if (!Efinal) {
      state.chart.finalized = true;
      return;
    }

    var finalResults = Efinal.finalResults;
    if (!finalResults || (finalResults.female == null && finalResults.male == null)) {
      finalResults = { female: 0, male: 0 };

      var cfg = (window.FINAL_DATA && window.FINAL_DATA.stages) || [];
      var females = aliveByGender("female");
      var males   = aliveByGender("male");

      function teamScore(ids, weights) {
        var total = 0;
        (ids || []).forEach(function (pid) {
          total += scorePlayerWeighted(weights || {}, pid);
        });
        return total;
      }

      for (var i = 0; i < cfg.length; i++) {
        var st = cfg[i];
        if (!st) continue;
        var weights = st.skillWeights || {};
        var sF = teamScore(females, weights);
        var sM = teamScore(males,   weights);

        var winner;
        if (sF > sM)       winner = "female";
        else if (sM > sF)  winner = "male";
        else               winner = sample(["female", "male"]);

        finalResults[winner] = (finalResults[winner] || 0) + 1;
      }

      Efinal.finalResults = finalResults;
    }

    var femaleWins = finalResults.female || 0;
    var maleWins   = finalResults.male   || 0;

    var winnerGender;
    if (femaleWins > maleWins)      winnerGender = "female";
    else if (maleWins > femaleWins) winnerGender = "male";
    else                            winnerGender = sample(["female", "male"]);

    var loserGender = (winnerGender === "female" ? "male" : "female");
    var femaleFinalists = aliveByGender("female") || [];
    var maleFinalists   = aliveByGender("male")   || [];

    function firstThree(list) {
      var res = list.slice(0, 3);
      while (res.length < 3) res.push(null);
      return res;
    }

    var winTeam  = (winnerGender === "female" ? femaleFinalists : maleFinalists);
    var loseTeam = (loserGender  === "female" ? femaleFinalists : maleFinalists);

    var winTop3  = firstThree(winTeam);
    var loseTop3 = firstThree(loseTeam);

    state.placements = state.placements || {};
    state.placements.winners = { male:null, female:null };
    state.placements.second  = { male:null, female:null };
    state.placements.third   = { male:null, female:null };

    if (winnerGender === "female") {
      state.placements.winners.female = winTop3[0];
      state.placements.second.female  = winTop3[1];
      state.placements.third.female   = winTop3[2];

      state.placements.winners.male   = loseTop3[0];
      state.placements.second.male    = loseTop3[1];
      state.placements.third.male     = loseTop3[2];
    } else {
      state.placements.winners.male   = winTop3[0];
      state.placements.second.male    = winTop3[1];
      state.placements.third.male     = winTop3[2];

      state.placements.winners.female = loseTop3[0];
      state.placements.second.female  = loseTop3[1];
      state.placements.third.female   = loseTop3[2];
    }
  })();

  state.chart.finalized = true;
}

function buildLeftAccordion(){
  elAccordion.innerHTML = "";
  for (var e = 1; e <= 16; e++) {
    var details = document.createElement("details");
    details.className = "details-ep";
    if (e === 1) details.open = true;

    var inner = '<summary>Episode ' + e + '</summary><div class="section-box"><div class="section-links">';

        if (e <= 15) {
          inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events 1</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="selection">Leader Nominations</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="daily">Daily Challenge</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="events2">House Events 2</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="elimination">Vote Off</button>';
        } else if (e === 16) {
          inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final_format">Final Format</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final1">Final Stage 1</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final2">Final Stage 2</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final3">Final Stage 3</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final4">Final Stage 4</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final_results">Final Results</button>';
        }

    inner += "</div></div>";
    details.innerHTML = inner;
    elAccordion.appendChild(details);
  }

  statsPanel.style.display = state.simulated ? "block" : "none";

  elAccordion.querySelectorAll(".section-links .btn").forEach(function(b){
    b.onclick = function(){
      elAccordion.querySelectorAll(".section-links button").forEach(function(x){
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
      var wrap=document.createElement("div"); 
      wrap.className="hl-inline";

      var pool=(idsPool && idsPool.length ? idsPool.slice() : aliveIds());
      var scored = pool.map(function(pid){
        return { pid: pid, score: scorePlayerWeighted(weights || {}, pid) };
      }).sort(function(a,b){
        return b.score - a.score;
      });

      var take=Math.min(6, scored.length);
      var pos=(comments&&comments.positive)||[], 
          neu=(comments&&comments.neutral)||[], 
          neg=(comments&&comments.negative)||[];

      for(var i=0;i<take;i++){
        var bucket = (i < Math.ceil(take/3))    ? pos :
                     (i < Math.ceil(2*take/3)) ? neu : 
                                                 neg;
        var template = (bucket && bucket.length) ? sample(bucket) : "{A} competes.";
        var text = template
          .replaceAll("{A}", nameOf(scored[i].pid))
          .replaceAll("{B}", nameOf(scored[(i+1)%take]?.pid || scored[i].pid));

        var card=document.createElement("div"); 
        card.className="mini-card";
        card.innerHTML =
          '<div class="row tiny-avatars">' +
            '<img class="avatar xs" src="'+picOf(scored[i].pid)+'" alt="">' +
          '</div>' +
          '<div>'+text+'</div>';

        wrap.appendChild(card);
      }

      container.innerHTML=""; 
      container.appendChild(wrap);
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

    function renderBots2DailyHighlights(container, D, Dcfg){
      var cfg      = Dcfg || {};
      var comments = cfg.comments || {};
      var weights  = cfg.skillWeights || {};
      var alive    = aliveIds();
      if (!alive.length) {
        container.innerHTML = "";
        return;
      }

      var womenCast = state.castWomen || [];
      var menCast   = state.castMen   || [];

      function isWoman(pid){
        return womenCast.some(function(c){ return c && c.id === pid; });
      }
      function isMan(pid){
        return menCast.some(function(c){ return c && c.id === pid; });
      }

      var aliveWomen = alive.filter(isWoman);
      var aliveMen   = alive.filter(isMan);

      function scoreList(list){
        return list.map(function(pid){
          return { pid: pid, score: scorePlayerWeighted(weights, pid) };
        }).sort(function(a,b){
          return b.score - a.score;
        });
      }

      var scoredWomen = scoreList(aliveWomen);
      var scoredMen   = scoreList(aliveMen);

      var takeW = Math.min(3, scoredWomen.length);
      var takeM = Math.min(3, scoredMen.length);

      var entries = [];

      for (var i = 0; i < takeW; i++){
        entries.push({
          pid: scoredWomen[i].pid,
          team: "female",
          rank: i,
          teamTotal: takeW,
          score: scoredWomen[i].score
        });
      }
      for (var j = 0; j < takeM; j++){
        entries.push({
          pid: scoredMen[j].pid,
          team: "male",
          rank: j,
          teamTotal: takeM,
          score: scoredMen[j].score
        });
      }

      if (!entries.length){
        container.innerHTML = "";
        return;
      }

      entries.sort(function(){ return Math.random() - 0.5; });

      var wrap = document.createElement("div");
      wrap.className = "events-grid three-cols";

      entries.forEach(function(entry, idx){
        var bucketName = "neutral";
        if (entry.teamTotal > 1) {
          if (entry.rank === 0) {
            bucketName = "positive";
          } else if (entry.rank === entry.teamTotal - 1) {
            bucketName = "negative";
          } else {
            bucketName = "neutral";
          }
        }

        var bucket = comments[bucketName] || [];
        if (!bucket.length) {
          bucket = (comments.positive && comments.positive.length && comments.positive) ||
                   (comments.neutral  && comments.neutral.length  && comments.neutral)  ||
                   (comments.negative && comments.negative.length && comments.negative) ||
                   ["{A} competes."];
        }

        var tmpl = sample(bucket);
        var partnerEntry = entries[(idx + 1) % entries.length] || entry;
        var text  = tmpl.replaceAll("{A}", nameOf(entry.pid))
                        .replaceAll("{B}", nameOf(partnerEntry.pid));

        var card = document.createElement("div");
        card.className = "mini-card";
        card.style.border = "1px solid " + teamColorOf(entry.pid);

        var avatars = document.createElement("div");
        avatars.className = "row tiny-avatars";

        var img = document.createElement("img");
        img.className = "avatar xs";
        img.src = picOf(entry.pid);
        img.alt = "";
        avatars.appendChild(img);

        var textDiv = document.createElement("div");
        textDiv.textContent = text;

        card.appendChild(avatars);
        card.appendChild(textDiv);

        wrap.appendChild(card);
      });

      container.innerHTML = "";
      container.appendChild(wrap);
    }

    function addProceed(ep, section){
      var orderBase;

      if (ep <= 15) {
        orderBase = ["status","events1","selection","daily","events2","elimination"];
      }
      else if (ep === 16) {
        orderBase = ["status","final_format","final1","final2","final3","final4","final_results"];
      } else {
        orderBase = ["status"];
      }

  var idx = orderBase.indexOf(section);

  var btn = document.createElement("button");
  btn.className = "btn proceed";
  btn.textContent = "Proceed";

  btn.onclick = function(){
    if (section === "elimination" && ep <= 15) {
      showEpisodeSection(ep + 1, "status");
      btn.remove();
      return;
    }

    if (section === "final_results" && ep === 16) {
      showStatisticsPanel("placements");
      btn.remove();
      return;
    }

    if (idx >= 0 && idx < orderBase.length - 1) {
      showEpisodeSection(ep, orderBase[idx + 1]);
      btn.remove();
    }
  };

  epActions.appendChild(btn);
}

    function showEpisodeSection(ep, section){
      state.lastView={ep:ep,section:section}; State.save(state);
      epActions.innerHTML=""; var S=state.episodes[ep]; epTitle.textContent="Episode "+ep; epSub.textContent="";
      if(!S){ epContent.innerHTML='<p class="muted">No data.</p>'; addProceed(ep, section); return; }

      if(section==="status"){
        epSub.textContent="Remaining players";
        var men = (S.status||[]).filter(function(id){ return state.castMen.some(function(c){return c&&c.id===id;}); });
        var women = (S.status||[]).filter(function(id){ return state.castWomen.some(function(c){return c&&c.id===id;}); });
        epContent.innerHTML="";
        var wrapW=document.createElement("div"); wrapW.className="status-section";
        var hw=document.createElement("div"); hw.className="status-title"; hw.textContent="Women — "+women.length+" players";
        var rowW=document.createElement("div"); rowW.className="status-grid";
        women.forEach(function(pid){ rowW.appendChild(statusCard(pid)); });
        wrapW.appendChild(hw); wrapW.appendChild(rowW);

        var wrapM=document.createElement("div"); wrapM.className="status-section";
        var hm=document.createElement("div"); hm.className="status-title"; hm.textContent="Men — "+men.length+" players";
        var rowM=document.createElement("div"); rowM.className="status-grid";
        men.forEach(function(pid){ rowM.appendChild(statusCard(pid)); });
        wrapM.appendChild(hm); wrapM.appendChild(rowM);

        epContent.appendChild(wrapW); epContent.appendChild(wrapM);
        addProceed(ep, section); return;
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

if (section === "daily" && ep <= 15) {
  var D = S.daily || {};

  var dailyData =
    (window.BOTS2_DAILY_DATA ||
     window.battle_of_the_sexes2_daily_data ||
     window.D2_DAILY_DATA ||
     []);
  var Dcfg = dailyData.find(function(d){ return d.episode === ep; }) || {};

  epSub.textContent = "Daily Challenge";
  epContent.innerHTML = "";

  var title = document.createElement("h3");
  title.textContent = D.name || Dcfg.name || ("Daily " + ep);
  epContent.appendChild(title);

  var desc = document.createElement("div");
  desc.className = "row-box wide";
  desc.style.textAlign = "center";
  desc.textContent = D.description || Dcfg.description || "";
  epContent.appendChild(desc);

  var highlightsSpot = document.createElement("div");
  epContent.appendChild(highlightsSpot);

  var resultsSpot = document.createElement("div");
  epContent.appendChild(resultsSpot);

  var comments = Dcfg.comments || {};
  var hasHighlightBank =
    (comments.positive && comments.positive.length) ||
    (comments.neutral  && comments.neutral.length)  ||
    (comments.negative && comments.negative.length);

  if (hasHighlightBank) {
    var btnH = document.createElement("button");
    btnH.className = "btn";
    btnH.textContent = "Show Highlights";
    btnH.onclick = function () {
      renderBots2DailyHighlights(highlightsSpot, D, Dcfg);
      btnH.disabled = true;
      btnH.style.display = "none";
    };
    epActions.appendChild(btnH);
  }

  var btnR = document.createElement("button");
  btnR.className = "btn";
  btnR.textContent = "Show Results";
  btnR.onclick = function () {
    resultsSpot.innerHTML = "";

    var winnerLabel = (D.winnerTeam === "female" ? "Female Team" : "Male Team");
    var loserLabel  = (D.loserTeam  === "female" ? "Female Team" : "Male Team");
    var winSec = document.createElement("div");
    winSec.className = "status-section";
    var winHead = document.createElement("div");
    winHead.className = "status-title";
    winHead.textContent = winnerLabel + " — Winners";
    var winGrid = document.createElement("div");
    winGrid.className = "status-grid glow-gold";
    (D.winners || []).forEach(function(pid){
      winGrid.appendChild(statusCard(pid));
    });
    winSec.appendChild(winHead);
    winSec.appendChild(winGrid);

    var loseSec = document.createElement("div");
    loseSec.className = "status-section";
    var loseHead = document.createElement("div");
    loseHead.className = "status-title";
    loseHead.textContent = loserLabel + " — Losers";
    var loseGrid = document.createElement("div");
    loseGrid.className = "status-grid";
    (D.losers || []).forEach(function(pid){
      loseGrid.appendChild(statusCard(pid));
    });
    loseSec.appendChild(loseHead);
    loseSec.appendChild(loseGrid);

    resultsSpot.appendChild(winSec);
    resultsSpot.appendChild(loseSec);
    btnR.disabled = true;
    btnR.style.display = "none";
  };
  epActions.appendChild(btnR);

  addProceed(ep, section);
  return;
}

      if(section==="selection"){
        epContent.innerHTML="";
        epSub.textContent="Leader Nominations";

        var note = document.createElement("div");
        note.className = "mini-card note";
        note.innerHTML =
          '<div><strong>Format:</strong> Before each Daily Challenge, a group of Leaders is randomly chosen from each team. ' +
          'These Leaders may later form the Inner Circle or become Nominees, depending on whether their team wins or loses.</div>';
        epContent.appendChild(note);

        var btnShow = document.createElement("button");
        btnShow.className = "btn";
        btnShow.textContent = "Show Leaders";
        btnShow.onclick = function(){
          btnShow.disabled = true;

          var L = (S && S.leaders) ? S.leaders : { female:[], male:[] };
          var secF = document.createElement("div");
          secF.className = "status-section";
          var headF = document.createElement("div");
          headF.className = "status-title";
          headF.textContent = "Female Team Leaders";
          var gridF = document.createElement("div");
          gridF.className = "status-grid";
          (L.female || []).forEach(function(pid){
            gridF.appendChild(statusCardSquare(pid));
          });
          secF.appendChild(headF);
          secF.appendChild(gridF);

          var secM = document.createElement("div");
          secM.className = "status-section";
          var headM = document.createElement("div");
          headM.className = "status-title";
          headM.textContent = "Male Team Leaders";
          var gridM = document.createElement("div");
          gridM.className = "status-grid";
          (L.male || []).forEach(function(pid){
            gridM.appendChild(statusCardSquare(pid));
          });
          secM.appendChild(headM);
          secM.appendChild(gridM);

          epContent.appendChild(secF);
          epContent.appendChild(secM);
          btnShow.style.display = "none";
        };
        epActions.appendChild(btnShow);

        addProceed(ep, section);
        return;
      }

      if(section==="elimination"){
        epContent.innerHTML = "";

        if (ep <= 15) {
          epSub.textContent = "Vote Off";

          var V = S.voteOff || {};
          var winnerSide = V.winnerSide || {};
          var loserSide  = V.loserSide  || {};

          var wTeamName = winnerSide.team === "female" ? "Female Team" :
                          winnerSide.team === "male"   ? "Male Team"   : "Winning Team";
          var lTeamName = loserSide.team  === "female" ? "Female Team" :
                          loserSide.team  === "male"   ? "Male Team"   : "Losing Team";

          epContent.style.textAlign = "center";

          var title = document.createElement("div");
          title.className = "challenge-name";
          title.textContent = "Vote Off";
          epContent.appendChild(title);

          var note = document.createElement("div");
          note.className = "mini-card note";
          note.innerHTML =
            "<div><strong>Format:</strong> The winning team's Leaders (Inner Circle) " +
            "eliminate one of their own teammates based on relationships. " +
            "On the losing team, the Leaders become Nominees and everyone else votes " +
            "for the Nominee they like the least.</div>";
          epContent.appendChild(note);

          var makeTeamBox = function(teamKey){
            var sec = document.createElement("div");
            sec.className = "status-section";
            sec.style.textAlign = "center";
            sec.style.borderRadius = "10px";
            sec.style.padding = "12px";
            sec.style.marginTop = "16px";

            var color = "#cccccc";
            if (teamKey === "female") color = "#ffc0cb";
            if (teamKey === "male")   color = "#add8e6";
            sec.style.border = "2px solid " + color;

            return sec;
          };

          if (winnerSide.team) {
            var secW = makeTeamBox(winnerSide.team);

            var headW = document.createElement("div");
            headW.className = "status-title";
            headW.textContent = wTeamName + " — Inner Circle Decision";
            secW.appendChild(headW);

            var innerLabel = document.createElement("div");
            innerLabel.className = "section-note";
            innerLabel.textContent = "Inner Circle Leaders:";
            secW.appendChild(innerLabel);

            var innerGrid = document.createElement("div");
            innerGrid.className = "status-grid";
            (winnerSide.leaders || []).forEach(function(pid){
              innerGrid.appendChild(statusCardSquare(pid));
            });
            secW.appendChild(innerGrid);

            if (winnerSide.eliminated) {
              var elimWrapW = document.createElement("div");
              elimWrapW.style.display = "none";
              elimWrapW.style.marginTop = "12px";

              var elimTitleW = document.createElement("div");
              elimTitleW.className = "status-title";
              elimTitleW.textContent = "Eliminated from " + wTeamName;
              elimWrapW.appendChild(elimTitleW);

              var elimGridW = document.createElement("div");
              elimGridW.className = "status-grid";

              var elimCardW = statusCardSquare(winnerSide.eliminated);
              elimCardW.style.border = "3px solid #ff4444";
              elimCardW.style.boxShadow = "0 0 10px #ff4444";
              elimCardW.style.borderRadius = "16px";
              elimGridW.appendChild(elimCardW);

              elimWrapW.appendChild(elimGridW);

              var textW = document.createElement("p");
              textW.textContent = nameOf(winnerSide.eliminated) +
                " was voted out.";
              elimWrapW.appendChild(textW);

              secW.appendChild(elimWrapW);

              var btnElimW = document.createElement("button");
              btnElimW.className = "btn";
              btnElimW.textContent = "Show Eliminated";
              btnElimW.style.marginTop = "8px";
              btnElimW.onclick = function(){
                elimWrapW.style.display = "block";
                btnElimW.disabled = true;
                btnElimW.style.display = "none";
              };
              secW.appendChild(btnElimW);
            }

            epContent.appendChild(secW);
          }

          if (loserSide.team) {
            var secL = makeTeamBox(loserSide.team);

            var headL = document.createElement("div");
            headL.className = "status-title";
            headL.textContent = lTeamName + " — Nominee Vote";
            secL.appendChild(headL);

            var nomLabel = document.createElement("div");
            nomLabel.className = "section-note";
            nomLabel.textContent = "Nominees (Leaders):";
            secL.appendChild(nomLabel);

            var nomGrid = document.createElement("div");
            nomGrid.className = "status-grid";
            (loserSide.leaders || []).forEach(function(pid){
              nomGrid.appendChild(statusCardSquare(pid));
            });
            secL.appendChild(nomGrid);

            if (loserSide.voters && loserSide.voters.length) {
              var votesLabel = document.createElement("div");
              votesLabel.className = "section-note";
              votesLabel.style.marginTop = "10px";
              votesLabel.textContent = "Votes:";
              secL.appendChild(votesLabel);

              (loserSide.voters || []).forEach(function(v){
                var row = document.createElement("div");
                row.style.display = "flex";
                row.style.alignItems = "center";
                row.style.justifyContent = "center";
                row.style.gap = "8px";
                row.style.margin = "6px 0";

                var voterCard = statusCardSquare(v.voter);
                var midText = document.createElement("span");
                midText.textContent = "has voted for";
                var targetCard = statusCardSquare(v.target);

                row.appendChild(voterCard);
                row.appendChild(midText);
                row.appendChild(targetCard);

                secL.appendChild(row);
              });
            }

            if (loserSide.eliminated) {
              var elimWrapL = document.createElement("div");
              elimWrapL.style.display = "none";
              elimWrapL.style.marginTop = "12px";

              var elimTitleL = document.createElement("div");
              elimTitleL.className = "status-title";
              elimTitleL.textContent = "Eliminated from " + lTeamName;
              elimWrapL.appendChild(elimTitleL);

              var elimGridL = document.createElement("div");
              elimGridL.className = "status-grid";

              var elimCardL = statusCardSquare(loserSide.eliminated);
              elimCardL.style.border = "3px solid #ff4444";
              elimCardL.style.boxShadow = "0 0 10px #ff4444";
              elimCardL.style.borderRadius = "16px";
              elimGridL.appendChild(elimCardL);

              elimWrapL.appendChild(elimGridL);

              var tieText = document.createElement("p");

              var tallies = loserSide.tallies || {};
              var ids = Object.keys(tallies);
              var maxVotes = -Infinity;
              var topIds = [];

              ids.forEach(function(id){
                var vv = tallies[id];
                if (vv > maxVotes){
                  maxVotes = vv;
                  topIds = [id];
                } else if (vv === maxVotes){
                  topIds.push(id);
                }
              });

              if (topIds.length > 1) {
                var names = topIds.map(function(id){ return nameOf(id); }).join(", ");
                tieText.textContent =
                  "There was a tie between " + names + " with " + (maxVotes || 0) +
                  " vote(s) each. The final decision was chosen at random, and " +
                  nameOf(loserSide.eliminated) + " was eliminated.";
              } else {
                tieText.textContent = nameOf(loserSide.eliminated) +
                  " received the most votes and was eliminated from " + lTeamName + ".";
              }

              elimWrapL.appendChild(tieText);

              secL.appendChild(elimWrapL);

              var btnElimL = document.createElement("button");
              btnElimL.className = "btn";
              btnElimL.textContent = "Show Eliminated";
              btnElimL.style.marginTop = "8px";
              btnElimL.onclick = function(){
                elimWrapL.style.display = "block";
                btnElimL.disabled = true;
                btnElimL.style.display = "none";
              };
              secL.appendChild(btnElimL);
            }

            epContent.appendChild(secL);
          }

          addProceed(ep, section);
          return;
        }

        var el = S.elimination || {};
        epSub.textContent = "Elimination";
        epContent.style.textAlign = "center";

        var titleOld = document.createElement("div");
        titleOld.className = "challenge-name";
        titleOld.textContent = el.name || "The Duel";
        var descOld  = document.createElement("div");
        descOld.className = "challenge-desc";
        descOld.innerHTML = '<div><strong>Description:</strong> ' + (el.description || "") + '</div>';
        epContent.appendChild(titleOld);
        epContent.appendChild(descOld);

        function renderMatch(m){
          if(!m) return;
          var row = document.createElement("div");
          row.className = "matchup";
          var left = statusCardSquare(m.A);
          var right = statusCardSquare(m.B);
          row.appendChild(left);
          var mid = document.createElement("div");
          mid.className = "arrow";
          mid.textContent = "VS.";
          row.appendChild(mid);
          row.appendChild(right);
          epContent.appendChild(row);

          var btnRow = document.createElement("div");
          btnRow.className = "matchup-actions";
          var btnH = document.createElement("button");
          btnH.className = "btn";
          btnH.textContent = "Show Highlights";
          var btnR = document.createElement("button");
          btnR.className = "btn";
          btnR.textContent = "Show Results";
          var hlSpot = document.createElement("div");

          btnH.onclick = function(){
            renderHighlightsInline(hlSpot, (el.comments||{}), (el.skillWeights||{}), [m.A, m.B]);
            btnH.disabled = true;
            btnH.style.display = "none";
          };
          btnR.onclick = function(){
            if(m.winner===m.A){ left.classList.add("win"); right.classList.add("lose"); }
            else { right.classList.add("win"); left.classList.add("lose"); }
            btnR.disabled = true;
            btnR.style.display = "none";
          };

          btnRow.appendChild(btnH);
          btnRow.appendChild(btnR);
          epContent.appendChild(btnRow);
          epContent.appendChild(hlSpot);
        }

        renderMatch((el.matchups||{}).female);
        renderMatch((el.matchups||{}).male);

        addProceed(ep, section);
        return;
      }

      if (section === "final_format" && ep === 16) {
        epSub.textContent = "Final Format";
        epContent.innerHTML = "";

        var rulesBox = document.createElement("div");
        rulesBox.className = "mini-card note";

        var rulesText =
          (window.FINAL_DATA && window.FINAL_DATA.rules) ||
          "Four-stage team final. Each stage is scored using team-summed skill weights.";

        rulesBox.innerHTML = "<div>" + rulesText + "</div>";
        epContent.appendChild(rulesBox);

        addProceed(ep, section);
        return;
      }

      if (/^final[1-4]$/.test(section) && ep === 16) {
        var stageIndex = parseInt(section.replace("final", ""), 10) - 1;
        var cfg = (window.FINAL_DATA && window.FINAL_DATA.stages) || [];
        var stageData = cfg[stageIndex] || null;

        epSub.textContent = "Final Stage " + (stageIndex + 1);
        epContent.innerHTML = "";

        if (!stageData) {
          var err = document.createElement("div");
          err.className = "mini-card note";
          err.textContent = "No data defined for this final stage.";
          epContent.appendChild(err);
          addProceed(ep, section);
          return;
        }

        var descBox = document.createElement("div");
        descBox.className = "mini-card note";
        descBox.style.width = "100%";
        descBox.style.marginBottom = "15px";
        descBox.textContent = stageData.description || "";
        epContent.appendChild(descBox);

        var highlightsSpot = document.createElement("div");
        epContent.appendChild(highlightsSpot);

        var females = aliveByGender("female");
        var males   = aliveByGender("male");
        var weights = stageData.skillWeights || {};

        function teamScore(ids){
          var total = 0;
          ids.forEach(function(pid){
            total += scorePlayerWeighted(weights, pid);
          });
          return total;
        }

        var scoreF = teamScore(females);
        var scoreM = teamScore(males);

        var winner = null;
        if (scoreF > scoreM)       winner = "female";
        else if (scoreM > scoreF)  winner = "male";
        else                       winner = sample(["female", "male"]);

        if (!S.finalResults) S.finalResults = { female: 0, male: 0 };
        S.finalResults[winner]++;

        var btnH = document.createElement("button");
        btnH.className = "btn";
        btnH.textContent = "Show Highlights";
        btnH.onclick = function () {
          renderBots2DailyHighlights(highlightsSpot, null, stageData);
          btnH.disabled = true;
          btnH.style.display = "none";
        };
        epActions.appendChild(btnH);

        addProceed(ep, section);
        return;
      }

      if (section === "final_results" && ep === 16) {
        epSub.textContent = "Final Results";
        epContent.innerHTML = "";

        var finalResults = S.finalResults;
        if (!finalResults || (finalResults.female == null && finalResults.male == null)) {
          finalResults = { female: 0, male: 0 };
        }

        if (finalResults.female === 0 && finalResults.male === 0) {
          var cfg = (window.FINAL_DATA && window.FINAL_DATA.stages) || [];
          var females = aliveByGender("female");
          var males   = aliveByGender("male");

          function teamScore(ids, weights) {
            var total = 0;
            (ids || []).forEach(function (pid) {
              total += scorePlayerWeighted(weights || {}, pid);
            });
            return total;
          }

          for (var i = 0; i < cfg.length; i++) {
            var st = cfg[i];
            if (!st) continue;
            var weights = st.skillWeights || {};
            var sF = teamScore(females, weights);
            var sM = teamScore(males,   weights);

            var winner;
            if (sF > sM)       winner = "female";
            else if (sM > sF)  winner = "male";
            else               winner = sample(["female", "male"]);

            finalResults[winner] = (finalResults[winner] || 0) + 1;
          }

          S.finalResults = finalResults;
        }

        var introBox = document.createElement("div");
        introBox.className = "mini-card note";
        introBox.style.width = "100%";
        introBox.textContent =
          "This was a long, grueling, and unpredictable war between two teams. Week after week, alliances shifted, strategies cracked, and rivalries only grew stronger. In the end, only one side proved they had the endurance, teamwork, and sheer determination to outlast their opponents. After a season defined by chaos and competition… one team finally rose above, and that team is.";
        epContent.appendChild(introBox);

        var revealSpot = document.createElement("div");
        epContent.appendChild(revealSpot);

        var btnReveal = document.createElement("button");
        btnReveal.className = "btn";
        btnReveal.textContent = "Reveal Winners";
        btnReveal.onclick = function () {
          btnReveal.disabled = true;
          revealSpot.innerHTML = "";

          var femaleWins = finalResults.female || 0;
          var maleWins   = finalResults.male   || 0;

          var winnerGender;
          if (femaleWins > maleWins)      winnerGender = "female";
          else if (maleWins > femaleWins) winnerGender = "male";
          else                            winnerGender = sample(["female", "male"]);

          var winnerLabel = (winnerGender === "female" ? "Female Team" : "Male Team");
          var winnerIds   = aliveByGender(winnerGender);

          var sec = document.createElement("div");
          sec.className = "status-section";

          var head = document.createElement("div");
          head.className = "status-title";
          head.textContent = winnerLabel + " — Final Winners";
          sec.appendChild(head);

          var grid = document.createElement("div");
          grid.className = "status-grid glow-gold";
          (winnerIds || []).forEach(function (pid) {
            grid.appendChild(statusCard(pid));
          });
          sec.appendChild(grid);

          revealSpot.appendChild(sec);
        };
        epActions.appendChild(btnReveal);

        addProceed(ep, section);
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

  if (kind === "placements") {
    epTitle.textContent = "Placements";
    epSub.textContent = "Season Results";
    epContent.innerHTML = "";

    var Pfull = placementsByGender();

    function placeCard(id, label){
      if (!id) return null;
      var card = statusCardSquare(id);
      labelUnder(card, label);
      return card;
    }

    var Efinal = state.episodes && state.episodes[16];
    var finalResults = (Efinal && Efinal.finalResults) || { female: 0, male: 0 };
    var femaleWins = finalResults.female || 0;
    var maleWins   = finalResults.male   || 0;

    var useTeamFinalLayout = (femaleWins !== 0 || maleWins !== 0);

    if (useTeamFinalLayout) {
      var winnerGender;
      if (femaleWins > maleWins)      winnerGender = "female";
      else if (maleWins > femaleWins) winnerGender = "male";
      else                            winnerGender = "female";

      var loserGender = (winnerGender === "female" ? "male" : "female");

      function finalistsForGender(g){
        if (!state.placements || !state.placements.winners) return [];
        var out = [];
        var W = state.placements.winners[g];
        var S = state.placements.second[g];
        var T = state.placements.third[g];
        [W, S, T].forEach(function(id){
          if (id && out.indexOf(id) < 0) out.push(id);
        });
        return out;
      }

      var winnersList  = finalistsForGender(winnerGender);
      var runnersList  = finalistsForGender(loserGender);
      var rowWin = document.createElement("div");
      rowWin.className = "placements-row";
      winnersList.forEach(function(pid){
        var c = placeCard(pid, "1st Place");
        if (c) {
          c.classList.add("border-gold");
          rowWin.appendChild(c);
        }
      });
      epContent.appendChild(rowWin);

      var row2 = document.createElement("div");
      row2.className = "placements-row";
      runnersList.forEach(function(pid){
        var c = placeCard(pid, "2nd Place");
        if (c) {
          c.classList.add("border-silver");
          row2.appendChild(c);
        }
      });
      epContent.appendChild(row2);

    } else {
      var rowWin = document.createElement("div");
      rowWin.className = "placements-row";
      if (Pfull.men[1])   { var m1 = placeCard(Pfull.men[1],   "1st Place"); m1.classList.add("border-gold");   rowWin.appendChild(m1); }
      if (Pfull.women[1]) { var f1 = placeCard(Pfull.women[1], "1st Place"); f1.classList.add("border-gold");   rowWin.appendChild(f1); }
      epContent.appendChild(rowWin);

      var row23 = document.createElement("div");
      row23.className = "placements-row";
      if (Pfull.men[2])   { var m2 = placeCard(Pfull.men[2],   "2nd Place"); m2.classList.add("border-silver"); row23.appendChild(m2); }
      if (Pfull.women[2]) { var f2 = placeCard(Pfull.women[2], "2nd Place"); f2.classList.add("border-silver"); row23.appendChild(f2); }
      if (Pfull.men[3])   { var m3 = placeCard(Pfull.men[3],   "3rd Place"); m3.classList.add("border-bronze"); row23.appendChild(m3); }
      if (Pfull.women[3]) { var f3 = placeCard(Pfull.women[3], "3rd Place"); f3.classList.add("border-bronze"); row23.appendChild(f3); }
      epContent.appendChild(row23);
    }

    var restGrid = document.createElement("div");
    restGrid.className = "six-grid";
    var rest = [];
    for (var place = 4; place <= 13; place++) {
      if (Pfull.men[place])   rest.push({ id: Pfull.men[place],   label: ordinal(place) + " Place" });
      if (Pfull.women[place]) rest.push({ id: Pfull.women[place], label: ordinal(place) + " Place" });
    }
    rest.forEach(function(it){
      var c = statusCardSquare(it.id);
      labelUnder(c, it.label);
      restGrid.appendChild(c);
    });
    epContent.appendChild(restGrid);

    var btn = document.createElement("button");
    btn.className = "btn proceed";
    btn.textContent = "Proceed";
    btn.onclick = function(){
      showStatisticsPanel("other");
      btn.remove();
    };
    epActions.appendChild(btn);
    return;
  }

  if (kind === "other") {
    epTitle.textContent = "Other Statistics";
    epSub.textContent   = "Leaders and tallies";

    var tbl = document.createElement("table");
    tbl.className = "stats-table";

    var thead = document.createElement("thead");
    thead.innerHTML =
      "<tr>" +
        "<th class=\"stat-cat\">Category</th>" +
        "<th class=\"stat-name\">Name</th>" +
        "<th class=\"stat-value\">Value</th>" +
      "</tr>";
    tbl.appendChild(thead);

    var tbody = document.createElement("tbody");

    function row(label, name, value){
      var tr = document.createElement("tr");

      var tdCat = document.createElement("td");
      tdCat.className = "stat-cat";
      tdCat.textContent = label;

      var tdName = document.createElement("td");
      tdName.className = "stat-name";
      tdName.textContent = name || "—";

      var tdVal = document.createElement("td");
      tdVal.className = "stat-value";
      tdVal.textContent = (value != null ? value : "—");

      tr.appendChild(tdCat);
      tr.appendChild(tdName);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    var tdw = state.stats.teamDailyWins || { female:0, male:0 };
    var teamLabel = (tdw.female > tdw.male ? "Female Team" :
                    (tdw.male > tdw.female ? "Male Team" : "Tie"));
    var teamValue = tdw.female + " – " + tdw.male;
    row("Most Daily Wins", teamLabel, teamValue);

    var wl = state.stats.winningLeader || {};
    var ll = state.stats.losingLeader || {};
    var nl = state.stats.notLeader    || {};

    function topFromMap(map){
      var bestId = null, bestVal = -Infinity;
      Object.keys(map || {}).forEach(function(pid){
        var v = map[pid] || 0;
        if (v > bestVal){
          bestVal = v;
          bestId = pid;
        }
      });
      return { id: bestId, value: (bestVal > 0 ? bestVal : 0) };
    }

    var anyLeaderCounts = {};
    Object.keys(wl).forEach(function(pid){
      anyLeaderCounts[pid] = (anyLeaderCounts[pid] || 0) + wl[pid];
    });
    Object.keys(ll).forEach(function(pid){
      anyLeaderCounts[pid] = (anyLeaderCounts[pid] || 0) + ll[pid];
    });

    var topLeader = topFromMap(anyLeaderCounts);
    row(
      "Most Times Being a Leader",
      topLeader.id ? nameOf(topLeader.id) : "—",
      topLeader.value || "0"
    );

    var topWinLeader = topFromMap(wl);
    row(
      "Most Times Being a Winning Leader",
      topWinLeader.id ? nameOf(topWinLeader.id) : "—",
      topWinLeader.value || "0"
    );

    var topLoseLeader = topFromMap(ll);
    row(
      "Most Times Being a Losing Leader",
      topLoseLeader.id ? nameOf(topLoseLeader.id) : "—",
      topLoseLeader.value || "0"
    );

    tbl.appendChild(tbody);
    epContent.innerHTML = "";
    epContent.appendChild(tbl);

    var btn2 = document.createElement("button");
    btn2.className = "btn proceed";
    btn2.textContent = "Proceed";
    btn2.onclick = function(){
      showStatisticsPanel("chart");
      btn2.remove();
    };
    epActions.appendChild(btn2);
    return;
  }

if (kind === "chart") {
  epTitle.textContent = "Season Chart";
  epSub.textContent = "";
  epContent.innerHTML = "";
  epActions.innerHTML = "";

  var btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = "Open Season Chart";
  btn.onclick = function () {
    location.href = "./season_chart.html";
  };

  epContent.appendChild(btn);
  return;
}
}
  })();
