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

  var KEY="challenge-cutthroat-season";
  var State={ load:function(){ try{ return JSON.parse(sessionStorage.getItem(KEY)) || null; }catch(e){ return null; } },
              save:function(s){ sessionStorage.setItem(KEY, JSON.stringify(s)); },
              clear:function(){ sessionStorage.removeItem(KEY); } };

  var emptySlots = function(n){ return Array.from({length:n}).map(function(){return null;}); };

  var state = State.load() || {
    seed: Math.random().toString(36).slice(2,8).toUpperCase(),
    teams: {
      red:  { name:"Red Team",  color:RED,  women:emptySlots(5), men:emptySlots(5) },
      blue: { name:"Blue Team", color:BLUE, women:emptySlots(5), men:emptySlots(5) },
      grey: { name:"Grey Team", color:GREY, women:emptySlots(5), men:emptySlots(5) }
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
    var p=state.players.find(function(x){return x.id===pid;});
    return p ? (p.team==="red"?RED:(p.team==="blue"?BLUE:GREY)) : "var(--glass-border)";
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
      buildTeamsGrid(rosterList || []);
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

  function teamPickRow(teamKey, genderKey, rowIndex, roster){
    var row = document.createElement("div"); row.className="pick-row";
    for(var i=rowIndex*5;i<rowIndex*5+5;i++){
      var slot = state.teams[teamKey][genderKey][i - rowIndex*5] || null;
      var title = (genderKey==="men" ? "Man " : "Woman ") + (i - rowIndex*5 + 1);
      var card = document.createElement("div"); card.className="pick-card";
      var selectId = "sel_"+teamKey+"_"+genderKey+"_"+(i - rowIndex*5);
      card.innerHTML =
        '<img class="avatar" src="'+(slot? slot.image : IMG_BLANK)+'" alt="">' +
        '<label for="'+selectId+'" class="name">'+(slot? (slot.nickname) : title)+'</label>' +
        '<select class="pick-player" id="'+selectId+'" name="'+selectId+'" data-team="'+teamKey+'" data-gender="'+genderKey+'" data-slot="'+(i - rowIndex*5)+'" autocomplete="off">'+
           playerOptions(window.PLAYERS||[], genderKey, slot? slot.id : "") +
        '</select>' +
        '<button class="btn btn-custom" data-team="'+teamKey+'" data-gender="'+genderKey+'" data-slot="'+(i - rowIndex*5)+'" type="button">Custom Player</button>';
      card.dataset.team = teamKey;
      card.dataset.gender = genderKey;
      card.dataset.slot = (i - rowIndex*5);
      row.appendChild(card);
    }
    return row;
  }

  function buildOneTeamBlock(teamKey, roster){
    var t = state.teams[teamKey];
    var box = document.createElement("div"); box.className = "team-box team-" + teamKey;
    box.innerHTML = '<div class="team-head"><span class="label">'+t.name+'</span><span class="team-tag" style="color:'+t.color+'">'+t.name+'</span></div>';

    var wrap = document.createElement("div"); wrap.className="pick-grid";
    wrap.appendChild(teamPickRow(teamKey, "women", 0, roster));
    wrap.appendChild(teamPickRow(teamKey, "men",   0, roster));
    box.appendChild(wrap);
    return box;
  }

  function buildTeamsGrid(roster){
    elTeams.innerHTML="";
    elTeams.appendChild(buildOneTeamBlock("red", roster));
    elTeams.appendChild(buildOneTeamBlock("blue", roster));
    elTeams.appendChild(buildOneTeamBlock("grey", roster));

    elTeams.querySelectorAll(".pick-player").forEach(function(sel){
      sel.onchange = function(e){
        var team = e.target.dataset.team, gender = e.target.dataset.gender, slot = +e.target.dataset.slot;
        var id = e.target.value || "";
        if(!id){
          state.teams[team][gender][slot]=null; State.save(state); return buildTeamsGrid(roster||[]);
        }
        var p = (window.PLAYERS_BY_ID && window.PLAYERS_BY_ID[id]) || (roster||[]).find(function(r){return r.id===id;});
        if(!p || (gender==="men" && p.gender!=="male") || (gender==="women" && p.gender!=="female")) return;
        var entry = asEntry(p);
        state.teams[team][gender][slot]=entry; State.save(state); buildTeamsGrid(roster||[]);
      };
    });
    elTeams.querySelectorAll(".btn-custom").forEach(function(btn){
      btn.onclick = function(){ openCustomModal(btn.dataset.team, btn.dataset.gender, +btn.dataset.slot); };
    });

    var total = ["red","blue","grey"].reduce(function(sum,k){
      return sum + state.teams[k].women.filter(Boolean).length + state.teams[k].men.filter(Boolean).length;
    },0);
    elInfoCast.textContent = total + " / 30";
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

  function openCustomModal(teamKey, genderKey, slot){
    modal.showModal();
    var formCustom = modal.querySelector("#custom-form");
    var cancelBtn = modal.querySelector("#modal-cancel");

    formCustom.onsubmit = function(ev){
      ev.preventDefault();
      var name = formCustom.querySelector("#cp-name").value.trim();
      var nickname = formCustom.querySelector("#cp-nickname").value.trim();
      var image = formCustom.querySelector("#cp-image").value.trim();
      if(!name || !nickname){ return; }
      var g = (genderKey === "women" ? "female" : "male");

      var id = nickname.toLowerCase().replace(/[^a-z0-9]+/g,"_") + "_" + Date.now().toString(36);
      var cp = {
        id: id,
        name: name,
        nickname: nickname,
        gender: g,
        show: "Custom",
        image: image || IMG_BLANK
      };

      state.teams[teamKey][genderKey][slot] = asEntry(cp);
      State.save(state);
      modal.close();
      formCustom.reset();
      buildTeamsGrid(window.PLAYERS || []);
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
    var males   = shuffle(roster.filter(function(p){ return p.gender === "male"; }));

    if (males.length < 15 || females.length < 15){
      alert("Not enough eligible players (need 15 men and 15 women) for the selected filters.");
      return;
    }

    ["red","blue","grey"].forEach(function(teamKey, idx){
      state.teams[teamKey].women = females.slice(idx*5, idx*5+5).map(asEntry);
      state.teams[teamKey].men   = males.slice(idx*5, idx*5+5).map(asEntry);
    });

    State.save(state);
    buildTeamsGrid(window.PLAYERS || []);
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
  document.getElementById("btn-profiles").addEventListener("click", function(){ location.href = "./profiles.html"; });
  document.getElementById("btn-relationships").addEventListener("click", function(){ location.href = "./relationships.html"; });
document.getElementById("btn-randomize").addEventListener("click", function(){
  openRandomizeModalCT();
});

  document.getElementById("btn-back-cast").addEventListener("click", function(e){
    e.preventDefault();
    var prevTeams = state.teams;
    var prevProfiles = state.profiles || {};
    var prevRelationships = state.relationships || {};
    state = {
      seed: Math.random().toString(36).slice(2,8).toUpperCase(),
      teams: prevTeams,
      players: [],

      relationships: prevRelationships,
      profiles: prevProfiles,

      episodes: {},
      ui: {},
      stats: { dailyWinsTeam:{}, elimWins:{}, elimPlays:{}, notPicked:{} },
      placements: { final:{ first:null, second:null, third:null }, eliminated:[] },
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

  document.getElementById("btn-reset-cast").onclick=function(){
    state.teams.red.women = emptySlots(5); state.teams.red.men = emptySlots(5);
    state.teams.blue.women = emptySlots(5); state.teams.blue.men = emptySlots(5);
    state.teams.grey.women = emptySlots(5); state.teams.grey.men = emptySlots(5);
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
    document.getElementById("info-seed").textContent=state.seed;

    if(state.simulated){
      buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false;
      var last=state.lastView||{ep:1,section:"format"}; showEpisodeSection(last.ep,last.section);
      document.getElementById("info-status").textContent="Simulated";
      var total = ["red","blue","grey"].reduce(function(sum,k){
        return sum + state.teams[k].women.filter(Boolean).length + state.teams[k].men.filter(Boolean).length;
      },0);
      elInfoCast.textContent = total.toString();
      statsPanel.style.display="block";
    }
    document.getElementById("goto-placements").onclick=function(){ showStatisticsPanel("placements"); };
    document.getElementById("goto-chart").onclick=function(){ showStatisticsPanel("chart"); };
  })();

  function setAliveFromCast(){
    state.players = ["red","blue","grey"].flatMap(function(k){
      var t=state.teams[k];
      return t.women.concat(t.men).filter(Boolean).map(function(c){
        return { id:c.id, name:c.name, nickname:c.nickname, image:c.image, gender:c.gender, alive:true, team:k };
      });
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
  function genHouseEvents(){
    var alive = aliveIds(); var E = window.CT_EVENTS || {};
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
      var card=document.createElement("div"); card.className="mini-card";
      card.style.borderColor = teamColorOf(pid); card.style.borderWidth="3px";
      card.innerHTML = '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(pid)+'" alt=""></div><div>'+text+'</div>';
      wrap.appendChild(card);
    }
    container.innerHTML=""; container.appendChild(wrap);
  }

  function dailySpec(ep){
    var A = (window.CT_DAILY_DATA||[]).find(function(d){return d.episode===ep;});
    if(A) return A;
    return (window.DAILY_DATA||[]).find(function(d){return d.episode===ep;}) || null;
  }
  function elimSpec(ep){
    var E = window.CT_ELIMINATION_DATA || window.ELIMINATION_DATA;
    if(Array.isArray(E)){
      return E.find(function(x){return x.episode===ep && (x.gender==="male" || !x.gender);}) || E.find(function(x){return x.episode===ep;}) || null;
    }
    return E && E[ep] ? E[ep] : null;
  }
  function finalData(){ return window.CT_FINAL_DATA || window.FINAL_DATA || { stages:[] }; }

  function computeDaily(ep, snapshotIds){
    var D = dailySpec(ep);
    if(!D){
      return {
        name:"Daily "+ep, description:"(No data—fallback)",
        comments:{}, skillWeights:{}, teamScores:{}, order:["red","blue","grey"], winners:["red"]
      };
    }
    var out={ name: D.name||("Daily "+ep), description: D.description||"", format: "teams",
              comments: D.comments||{}, skillWeights: D.skillWeights||{}, teamScores:{}, order:[], winners:[] };

    var teamKeys=["red","blue","grey"];
    var scores = teamKeys.map(function(k){
      var ids = teamFromSnapshot(snapshotIds, k);
      if(!ids.length) return {team:k, score:Infinity};
      var avg = ids.reduce(function(sum,id){ return sum + scorePlayerWeighted(D.skillWeights||{}, id); },0)/ids.length;
      return {team:k, score:avg};
    });

    scores.sort(function(a,b){ return a.score - b.score; });
    out.order = scores.map(function(s){ return s.team; });
    out.teamScores = Object.fromEntries(scores.map(function(s){return [s.team, s.score];}));
    out.winners = [scores[0].team];
    state.stats.dailyWinsTeam[scores[0].team]=(state.stats.dailyWinsTeam[scores[0].team]||0)+1;
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

  function resolveElimination(ep, pairs){
    var ED = elimSpec(ep) || {};
    var out = { name: ED.name||"Elimination", description: ED.description||"", comments: ED.comments||{}, skillWeights: ED.skillWeights||{}, matchups:{}, highlightsByGender:{ female:[], male:[] } };
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
      var bank=ED.comments||{}; var pos=bank.positive||[], neu=bank.neutral||[], neg=bank.negative||[];
      function pickFor(pid, other){
        var pool = (pid===win?pos:(pid===lose?neg:neu));
        var t = (pool&&pool.length)? sample(pool) : "{A} battles {B}.";
        return t.replaceAll("{A}", nameOf(pid)).replaceAll("{B}", nameOf(other));
      }
      out.highlightsByGender[gender].push({ pid:a, text:pickFor(a,b) });
      out.highlightsByGender[gender].push({ pid:b, text:pickFor(b,a) });
    }
    if(pairs && pairs.female) duel(pairs.female[0], pairs.female[1], "female");
    if(pairs && pairs.male)   duel(pairs.male[0],   pairs.male[1],   "male");
    return out;
  }

  function simulateFinals(){
    var E={ stages:[], results:null };
    var ST = finalData().stages ? finalData().stages.slice() : [];
    var teams=["red","blue","grey"];

    function rankTeams(weights){
      var scored = teams.map(function(k){
        var ids = aliveTeam(k);
        var avg = ids.length ? (ids.reduce(function(sum,id){ return sum + scorePlayerWeighted(weights||{}, id); },0)/ids.length) : Infinity;
        return { team:k, score:avg };
      });
      scored.sort(function(a,b){ return a.score - b.score; });
      return scored.map(function(s){ return s.team; });
    }

    var perTeamPlaces = { red:[], blue:[], grey:[] };

    for(var i=0;i<ST.length;i++){
      var st=ST[i];
      var order = rankTeams(st.skillWeights||{});
      order.forEach(function(team, idx){ perTeamPlaces[team].push(idx+1); });
      E.stages.push({ name:st.name, description:st.description, comments:st.comments||{}, skillWeights:st.skillWeights||{}, order:order });
    }

    function avg(arr){ return arr.reduce(function(a,b){return a+b;},0)/Math.max(1,arr.length); }
    var finalOrder = ["red","blue","grey"].map(function(k){ return { team:k, avg:avg(perTeamPlaces[k]) }; })
      .sort(function(a,b){ if(a.avg!==b.avg) return a.avg-b.avg; return Math.random()<0.5?-1:1; })
      .map(function(x){return x.team;});

    state.placements.final.first = finalOrder[0]||null;
    state.placements.final.second = finalOrder[1]||null;
    state.placements.final.third = finalOrder[2]||null;

    E.results = { order: finalOrder, perStage: E.stages };
    return E;
  }

  document.getElementById("btn-simulate").onclick=function(){
    var ok = ["red","blue","grey"].every(function(k){
      return state.teams[k].women.filter(Boolean).length===5 && state.teams[k].men.filter(Boolean).length===5;
    });
    if(!ok){ alert("Please complete all team slots: 5 Women + 5 Men per team (total 30)."); return; }
    setAliveFromCast();
    simulateSeason();
    state.simulated=true; State.save(state);
    buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false;
    showEpisodeSection(1, "format");
    document.getElementById("info-status").textContent="Simulated";
    document.getElementById("info-cast-size").textContent = "30";
    statsPanel.style.display="block";
  };

  function simulateSeason(){
    state.episodes={}; state.ui={}; state.chart={finalized:false, episodes:{}};
    state.stats = { dailyWinsTeam:{}, elimWins:{}, elimPlays:{}, notPicked:{} };
    state.placements = { final:{ first:null,second:null,third:null }, eliminated:[] };

    for(var ep=1; ep<=10; ep++){
      var snapshot = aliveIds().slice();
      var E = state.episodes[ep] = { status: snapshot };

      if(ep<=9){
        E.events1 = genHouseEvents();
        E.daily   = computeDaily(ep, snapshot);
        E.events2 = genHouseEvents();

        var winnerTeam = E.daily.winners[0];
        var losingTeams = ["red","blue","grey"].filter(function(k){ return k!==winnerTeam; });

        E.voting = {};
        losingTeams.forEach(function(k){ E.voting[k] = runVotingForTeam(k, snapshot); });

        var A = losingTeams[0], B = losingTeams[1];
        var femalePair = (E.voting[A].femaleNom && E.voting[B].femaleNom) ? [E.voting[A].femaleNom, E.voting[B].femaleNom] : null;
        var malePair   = (E.voting[A].maleNom   && E.voting[B].maleNom)   ? [E.voting[A].maleNom,   E.voting[B].maleNom]   : null;

        E.elimination = resolveElimination(ep, { female:femalePair, male:malePair });
      } else if(ep===10){
        E.final = simulateFinals();
      }
    }
    state.chart.finalized = true;
  }

  function buildLeftAccordion(){
    elAccordion.innerHTML = "";
    for(var e=1;e<=10;e++){
      var details = document.createElement("details"); details.className = "details-ep"; if(e===1) details.open = true;
      var inner = '<summary>Episode '+e+'</summary><div class="section-box"><div class="section-links">';
      if(e===1){ inner += '<button class="btn" data-ep="'+e+'" data-sec="format">Format</button>'; }
      inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>';
      if(e<=9){
        inner += '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events 1</button>';
        inner += '<button class="btn" data-ep="'+e+'" data-sec="daily">Daily Challenge</button>';
        inner += '<button class="btn" data-ep="'+e+'" data-sec="events2">House Events 2</button>';
        inner += '<button class="btn" data-ep="'+e+'" data-sec="voting">Voting</button>';
        inner += '<button class="btn" data-ep="'+e+'" data-sec="elimination">Elimination</button>';
      } else {
        for(var s=1;s<=7;s++){ inner += '<button class="btn" data-ep="'+e+'" data-sec="final'+s+'">Final Stage '+s+'</button>'; }
        inner += '<button class="btn" data-ep="'+e+'" data-sec="final_results">Final Results</button>';
      }
      inner += "</div></div>";
      details.innerHTML = inner; elAccordion.appendChild(details);
    }
    statsPanel.style.display = state.simulated ? "block" : "none";
    elAccordion.querySelectorAll(".section-links .btn").forEach(function(b){
      b.onclick = function(){
        elAccordion.querySelectorAll(".section-links button").forEach(function(x){ x.classList.remove("active"); });
        b.classList.add("active"); showEpisodeSection(+b.dataset.ep, b.dataset.sec);
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
    div.style.borderColor = (teamKey==="red"?RED:(teamKey==="blue"?BLUE:GREY));
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
  '<div>This season of The Challenge features a new format, consisting of three teams.<br><br>' +
  'The three teams will participate in numerous challenges (sometimes called "missions"), which are followed by an elimination challenge, known as the "Gulag." The team who wins a challenge will receive a cash prize of $20,000 to be banked in their team bank accounts, as well as winning immunity from the Gulag.<br><br>' +
  'The two losing teams will then be forced to choose one player of each gender from their own teams for possible elimination. Each player will cast secret votes to decide which two men and two women will battle in same-gender Gulags. The winning players will rejoin their respective teams and stay in the game for a chance at a share of $120,000, while the losing players will be eliminated from the game.</div>';
      epContent.innerHTML=""; epContent.appendChild(box);
      addProceed(ep, section); return;
    }

    if(section==="status"){
      epSub.textContent="Remaining players";
      var snap = S.status || [];
      var byTeam=["red","blue","grey"].map(function(k){
        return { key:k, name:state.teams[k].name, ids:teamFromSnapshot(snap, k) };
      });
      epContent.innerHTML="";
      byTeam.forEach(function(t){
        var wrap=teamWrap(t.key);
        var hw=document.createElement("div"); hw.className="status-title"; hw.textContent=t.name+" — "+t.ids.length+" players";
        var women = womenFrom(t.ids), men = menFrom(t.ids);
        var rowW=document.createElement("div"); rowW.className="team-row";
        women.forEach(function(pid){ rowW.appendChild(statusCard(pid)); });

        var rowM=document.createElement("div"); rowM.className="team-row";
        men.forEach(function(pid){ rowM.appendChild(statusCard(pid)); });

        wrap.appendChild(hw); wrap.appendChild(rowW); wrap.appendChild(rowM);
        epContent.appendChild(wrap);
      });
      addProceed(ep, section); return;
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

    if(section==="daily" && ep<=9){
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
          var teamKey=order[i];
          var wrap=teamWrap(teamKey);
          var rowW=document.createElement("div"); rowW.className="team-row";
          var rowM=document.createElement("div"); rowM.className="team-row";
          var idsTeam = teamFromSnapshot(S.status||[], teamKey);
          womenFrom(idsTeam).forEach(function(pid){ rowW.appendChild(statusCardSquare(pid)); });
          menFrom(idsTeam).forEach(function(pid){ rowM.appendChild(statusCardSquare(pid)); });
          labelUnder(wrap, ordinal(order.length-i)+" Place — "+state.teams[teamKey].name);
          wrap.appendChild(rowW); wrap.appendChild(rowM);
          epContent.appendChild(wrap);
        }
        btnResults.disabled=true;
      };
      epActions.appendChild(btnResults);

      addProceed(ep, section); return;
    }

    if(section==="voting" && ep<=9){
      epSub.textContent="Team Voting";
      var winnerTeam = S.daily && S.daily.winners && S.daily.winners[0];
      var losingTeams = ["red","blue","grey"].filter(function(k){ return k!==winnerTeam; });

      epContent.innerHTML="";
      losingTeams.forEach(function(teamKey){
        var V=S.voting[teamKey];
        var wrap=teamWrap(teamKey);
        var title=document.createElement("div"); title.className="status-title"; title.textContent=state.teams[teamKey].name+" — Votes";
        wrap.appendChild(title);

        var list=document.createElement("div"); list.style.display="flex"; list.style.flexDirection="column"; list.style.gap="10px";
        (V.perVoter||[]).forEach(function(v){
          var row=document.createElement("div"); row.className="team-row";
          row.appendChild(statusCardSquare(v.voter));
          var arr=document.createElement("div"); arr.className="arrow"; arr.textContent="→";
          row.appendChild(arr);
          if(v.female){ row.appendChild(statusCardSquare(v.female)); } else { var s=document.createElement("div"); s.className="status-card square"; s.innerHTML='<div class="name">—</div>'; row.appendChild(s); }
          if(v.male){ row.appendChild(statusCardSquare(v.male)); } else { var s2=document.createElement("div"); s2.className="status-card square"; s2.innerHTML='<div class="name">—</div>'; row.appendChild(s2); }
          list.appendChild(row);
        });
        wrap.appendChild(list);

        var nomWrap=document.createElement("div"); nomWrap.style.display="flex"; nomWrap.style.flexDirection="column"; nomWrap.style.alignItems="center";
        var nomTitle=document.createElement("div"); nomTitle.className="placements-caption"; nomTitle.textContent="Nominated:";
        var nomRow=document.createElement("div"); nomRow.className="team-row";
        if(V.femaleNom){ nomRow.appendChild(statusCardSquare(V.femaleNom)); }
        if(V.maleNom){ nomRow.appendChild(statusCardSquare(V.maleNom)); }
        nomWrap.appendChild(nomTitle); nomWrap.appendChild(nomRow);
        wrap.appendChild(nomWrap);

        epContent.appendChild(wrap);
      });

      addProceed(ep, section); return;
    }

    if(section==="elimination" && ep<=9){
      var E=S.elimination||{};
      epSub.textContent = E.name || "Elimination";
      epContent.innerHTML="";

      var top=document.createElement("div"); top.className="mini-card note";
      top.innerHTML = '<strong>Description:</strong> '+(E.description||"");
      epContent.appendChild(top);

      function renderGenderElim(genderLabel){
        var m=E.matchups && E.matchups[genderLabel]; if(!m) return;
        var row=document.createElement("div"); row.className="matchup";
        var cardA = statusCardSquare(m.A);
        var vs = document.createElement("div"); vs.className="arrow"; vs.textContent="vs";
        var cardB = statusCardSquare(m.B);
        row.appendChild(cardA); row.appendChild(vs); row.appendChild(cardB);
        epContent.appendChild(row);
        var localBtns=document.createElement("div"); localBtns.className="actions-row";
        var hlWrap=document.createElement("div");

        var btnH=document.createElement("button"); btnH.className="btn"; btnH.textContent="Show Highlights";
        btnH.onclick=function(){
          var list=(E.highlightsByGender && E.highlightsByGender[genderLabel]) || [];
          if(!list.length){
            hlWrap.innerHTML='<div class="muted">No highlights.</div>';
          } else {
            var rowHighlights=document.createElement("div"); rowHighlights.className="team-row";
            list.slice(0,6).forEach(function(h){
              var card=document.createElement("div"); card.className="mini-card elim-highlight";
              card.style.borderColor = teamColorOf(h.pid); card.style.borderWidth="3px";
              card.innerHTML = '<div class="row tiny-avatars"><img class="avatar xs" src="'+picOf(h.pid)+'" alt=""></div><div>'+h.text+'</div>';
              rowHighlights.appendChild(card);
            });
            hlWrap.innerHTML=""; hlWrap.appendChild(rowHighlights);
          }
          btnH.disabled=true;
        };

        var btnR=document.createElement("button"); btnR.className="btn"; btnR.textContent="Reveal Results";
        btnR.onclick=function(){
          var winner = m.winner, loser = m.loser;
          if(winner===m.A){ cardA.classList.add("win"); cardB.classList.add("lose"); }
          else { cardB.classList.add("win"); cardA.classList.add("lose"); }
          btnR.disabled=true;
        };

        localBtns.appendChild(btnH); localBtns.appendChild(btnR);
        epContent.appendChild(localBtns);
        epContent.appendChild(hlWrap);
      }

      renderGenderElim("female");
      renderGenderElim("male");

      addProceed(ep, section); return;
    }

    if(/^final[1-7]$/.test(section) && ep===10){
      var idx = parseInt(section.replace("final",""),10)-1;
      var st = (S.final && S.final.stages && S.final.stages[idx]) || null;
      if(!st){ epContent.innerHTML='<p class="muted">No data.</p>'; addProceed(ep, section); return; }
      epSub.textContent = st.name || ("Final Stage "+(idx+1));
      epContent.innerHTML="";
      var desc=document.createElement("div"); desc.className="mini-card note"; desc.innerHTML='<div><strong>Description:</strong> '+(st.description||"")+'</div>';
      epContent.appendChild(desc);

      var hlContainer=document.createElement("div"); epContent.appendChild(hlContainer);
      var btnHighlights=document.createElement("button"); btnHighlights.className="btn"; btnHighlights.textContent="Show Highlights";
      btnHighlights.onclick=function(){
        renderHighlightsInto(hlContainer, st.comments||{}, st.skillWeights||{}, aliveIds(), true);
        btnHighlights.disabled=true;
      };
      epActions.appendChild(btnHighlights);

      addProceed(ep, section); return;
    }

    if(section==="final_results" && ep===10){
      epSub.textContent="Final Results";
      var FR = (S.final && S.final.results) || {};
      var order = FR.order || [];
      epContent.innerHTML="";

      function finalistTeamRow(teamKey, label){
        if(!teamKey) return null;
        var ids = aliveTeam(teamKey);
        if(!ids.length) return null;
        var container=document.createElement("div");
        container.style.borderColor = (teamKey==="red"?RED:(teamKey==="blue"?BLUE:GREY));
        container.style.borderWidth = "3px";
        container.style.borderStyle = "solid";
        container.style.borderRadius = "14px";
        container.style.padding = "8px 10px";
        container.style.marginBottom = "10px";

        var cap=document.createElement("div"); cap.className="placements-caption"; cap.textContent=label+" — "+state.teams[teamKey].name;
        container.appendChild(cap);
        var row=document.createElement("div"); row.className="placements-row";
        var count=0;
        var arr = womenFrom(ids).concat(menFrom(ids));
        arr.forEach(function(pid){
          if(count>0 && count%6===0){ container.appendChild(row); row=document.createElement("div"); row.className="placements-row"; }
          row.appendChild(statusCardSquare(pid, "", teamColorOf(pid)));
          count++;
        });
        if(row.childNodes.length) container.appendChild(row);
        epContent.appendChild(container);
        return container;
      }

      var btnRow=document.createElement("div"); btnRow.className="actions-row";
      epContent.appendChild(btnRow);

      function addButton(label, handler){
        var b=document.createElement("button"); b.className="btn"; b.textContent=label;
        b.onclick=function(){
          handler();
          btnRow.removeChild(b);
        };
        btnRow.appendChild(b);
        return b;
      }

      if(order.length>=3){
        addButton("Reveal 3rd Place", function(){
          finalistTeamRow(order[2], "3rd Place");
          if(order.length>=2){
            addButton("Reveal 2nd Place", function(){
              finalistTeamRow(order[1], "2nd Place");
              if(order.length>=1){
                addButton("Reveal Winners", function(){
                  finalistTeamRow(order[0], "Winners");
                });
              }
            });
          }
        });
      } else if(order.length===2){
        addButton("Reveal 2nd Place", function(){
          finalistTeamRow(order[1], "2nd Place");
          addButton("Reveal Winners", function(){ finalistTeamRow(order[0], "Winners"); });
        });
      } else if(order.length===1){
        addButton("Reveal Winners", function(){ finalistTeamRow(order[0], "Winners"); });
      }

      addProceed(ep, section); return;
    }
  }

  function addProceed(ep, section){
    var order=[];
    if(ep<=9) order=(ep===1?["format","status","events1","daily","events2","voting","elimination"]:["status","events1","daily","events2","voting","elimination"]);
    else order=["status","final1","final2","final3","final4","final5","final6","final7","final_results"];

    var idx = order.indexOf(section);
    var btn = document.createElement("button"); btn.className="btn proceed"; btn.textContent="Proceed";
    btn.onclick=function(){
      if(section==="elimination" && ep<10){
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
    epTitle.textContent = (kind==="placements"?"Placements":"Season Chart");
    epSub.textContent = "";
    epActions.innerHTML="";
    if(kind==="placements"){
      epContent.innerHTML="";
      var winners = state.placements.final.first, second = state.placements.final.second, third = state.placements.final.third;
      function finalistTeamRow(teamKey, label){
        if(!teamKey) return;
        var container=document.createElement("div");
        container.style.borderColor = (teamKey==="red"?RED:(teamKey==="blue"?BLUE:GREY));
        container.style.borderWidth = "3px";
        container.style.borderStyle = "solid";
        container.style.borderRadius = "14px";
        container.style.padding = "8px 10px";
        container.style.marginBottom = "10px";

        var cap=document.createElement("div"); cap.className="placements-caption"; cap.textContent=label+" — "+state.teams[teamKey].name;
        container.appendChild(cap);
        var ids = aliveTeam(teamKey);
        var row=document.createElement("div"); row.className="placements-row";
        var count=0;
        var arr = womenFrom(ids).concat(menFrom(ids));
        arr.forEach(function(pid){
          if(count>0 && count%6===0){ container.appendChild(row); row=document.createElement("div"); row.className="placements-row"; }
          row.appendChild(statusCardSquare(pid, "", teamColorOf(pid)));
          count++;
        });
        if(row.childNodes.length) container.appendChild(row);
        epContent.appendChild(container);
      }
      finalistTeamRow(winners, "Winners");
      finalistTeamRow(second, "2nd Place");
      finalistTeamRow(third, "3rd Place");

      var placeStart = 7, perRowPlaces = 3;
      var row=null, placesInRow=0;
      for(var e=9;e>=1;e--){
        var eps = state.placements.eliminated.filter(function(x){return x.episode===e;});
        if(!eps.length) continue;
        var male = eps.find(function(r){ var p=state.players.find(function(pp){return pp.id===r.id;}); return p && p.gender==="male"; });
        var female = eps.find(function(r){ var p=state.players.find(function(pp){return pp.id===r.id;}); return p && p.gender==="female"; });

        if(row===null || placesInRow>=perRowPlaces){
          if(row){ epContent.appendChild(row); }
          row=document.createElement("div"); row.className="placements-row"; placesInRow=0;
        }
        var placeNum = placeStart++;
        if(male){
          var mCard = statusCardSquare(male.id, "", teamColorOf(male.id));
          labelUnder(mCard, ordinal(placeNum)+" Place", "placements-label");
          row.appendChild(mCard);
        }
        if(female){
          var fCard = statusCardSquare(female.id, "", teamColorOf(female.id));
          labelUnder(fCard, ordinal(placeNum)+" Place", "placements-label");
          row.appendChild(fCard);
        }
        placesInRow++;
      }
      if(row){ epContent.appendChild(row); }

      var btn=document.createElement("button"); btn.className="btn proceed"; btn.textContent="Proceed";
      btn.onclick=function(){ showStatisticsPanel("chart"); btn.remove(); };
      epActions.appendChild(btn);
      return;
    }

    epTitle.textContent="Season Chart"; epSub.textContent="";
    epContent.innerHTML="";
    var btn=document.createElement("button"); btn.className="btn"; btn.textContent="Open Season Chart";
    btn.onclick=function(){ location.href="./season_chart.html"; };
    epContent.appendChild(btn);
  }
})();