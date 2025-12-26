(function(){
    "use strict";

    var IMG_BLANK="BlankProfile.webp";
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

    var KEY="challenge-duel2-season";
    var State={ load:function(){ try{ return JSON.parse(sessionStorage.getItem(KEY)) || null; }catch(e){ return null; } },
                save:function(s){ sessionStorage.setItem(KEY, JSON.stringify(s)); },
                clear:function(){ sessionStorage.removeItem(KEY); } };

    var state = State.load() || {
      seed: Math.random().toString(36).slice(2,8).toUpperCase(),
      castMen:  Array.from({length:13}).map(function(){return null;}),
      castWomen:Array.from({length:13}).map(function(){return null;}),
      players: [],
      relationships: {},
      profiles: {},
      episodes: {},
      ui: {},
      stats: { dailyWins:{}, elimWins:{}, elimPlays:{}, notPicked:{} },
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
      return typeof s === "number" ? clamp(s,-3,3) : 0;
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
        var r = filtered[i]; var sel = (selectedId && r.id===selectedId) ? " selected" : "";
        opts.push('<option value="'+r.id+'"'+sel+'>'+ (r.name || r.nickname || r.id) +'</option>');
      }
      return opts.join("");
    }

    function buildTeamBox(label, genderKey, count){
      var box = document.createElement("div"); box.className="team-box";
      var tagColor = (genderKey==="male" ? "#54a0ff" : "#ff6b6b");
      box.innerHTML = '<div class="team-head"><span class="label">'+label+'</span><span class="team-tag" style="color:'+tagColor+'">'+(genderKey==="male"?"Men":"Women")+'</span></div>';
      var inner = document.createElement("div"); inner.className="team-inner";
      for(var i=0;i<count;i++){
        var slot = (genderKey==="male" ? state.castMen[i] : state.castWomen[i]) || null;
        var title = (genderKey==="male" ? "Man " : "Woman ") + (i+1);
        var card = document.createElement("div"); card.className="pick-card";
        card.innerHTML =
          '<img class="avatar" src="'+(slot? slot.image : IMG_BLANK)+'" alt="">' +
          '<div class="name">'+(slot? (slot.nickname) : title)+'</div>' +
          '<select class="pick-player" data-gender="'+genderKey+'" data-slot="'+i+'">'+ playerOptions(window.PLAYERS||[], genderKey, slot? slot.id : "") +'</select>' +
          '<button class="btn btn-custom" data-gender="'+genderKey+'" data-slot="'+i+'" type="button">Custom Player</button>';
        inner.appendChild(card);
      }
      box.appendChild(inner); return box;
    }
    function buildTeamsGrid(roster){
      elTeams.innerHTML = "";
      elTeams.appendChild(buildTeamBox("Cast", "female", 13));
      elTeams.appendChild(buildTeamBox("Cast", "male", 13));
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
      var filledMen = state.castMen.filter(Boolean).length, filledWomen = state.castWomen.filter(Boolean).length;
      elInfoCast.textContent = (filledMen===13 && filledWomen===13) ? "26" : (filledMen+filledWomen);
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

function openCustomModal(gender, slot){
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

    var g = gender;

    var id = nickname.toLowerCase().replace(/[^a-z0-9]+/g,"_") + "_" + Date.now().toString(36);
    var cp = {
      id: id,
      name: name,
      nickname: nickname,
      gender: g,
      show: "Custom",
      image: image || IMG_BLANK
    };

    if (g === "male") {
      state.castMen[slot] = asEntry(cp);
    } else {
      state.castWomen[slot] = asEntry(cp);
    }

    State.save(state);
    modal.close();
    formCustom.reset();
    buildTeamsGrid(window.PLAYERS || []);
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

    function randomizeCastWithPrefs(prefs){
      var roster = filterRosterByPrefs(prefs);
      if (!roster.length){
        alert("No eligible players for the selected shows/seasons.");
        return;
      }

      var males   = shuffle(roster.filter(function(r){ return r.gender === "male"; }));
      var females = shuffle(roster.filter(function(r){ return r.gender === "female"; }));

      var needM = 13, needF = 13;

      if (males.length < needM || females.length < needF){
        alert("Not enough eligible players for those filters. Try fewer restrictions.");
        return;
      }

      state.castMen   = males.slice(0, needM).map(asEntry);
      state.castWomen = females.slice(0, needF).map(asEntry);

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
            seasons = input.value
              .split(/[,;]/)
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
    document.getElementById("btn-profiles").addEventListener("click", function(){ location.href = "./profiles.html"; });
    document.getElementById("btn-relationships").addEventListener("click", function(){ location.href = "./relationships.html"; });
document.getElementById("btn-randomize").onclick = openRandomizeModal;
    document.getElementById("btn-reset-cast").onclick=function(){
      state.castMen=Array.from({length:13}).map(function(){return null;});
      state.castWomen=Array.from({length:13}).map(function(){return null;});
      State.save(state); buildTeamsGrid(window.PLAYERS||[]);
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
      document.getElementById("goto-chart").onclick=function(){ showStatisticsPanel("chart"); };
    })();

    function setAliveFromCast(){
      state.players = state.castMen.concat(state.castWomen).filter(Boolean).map(function(c){
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
      var alive = aliveIds(); var E = (window.D2_EVENTS||{}); var out=[];
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
      var D=(window.D2_DAILY_DATA||[]).find(function(d){return d.episode===ep;});
      if(!D) return null;
      var out={ name: D.name||("Daily "+ep), description: D.description||"", format: D.format||"individual",
                results:{}, teams:[], highlights:[], winners:[] };
      if((D.format||"individual")==="pairs"){
        var men = shuffle(aliveByGender("male"));
        var women = shuffle(aliveByGender("female"));
        var n = Math.min(men.length, women.length);
        for(var i=0;i<n;i++){ out.teams.push([men[i], women[i]]); }
        var scored = out.teams.map(function(t){ return { ids:t, score: scorePairWeighted(D.skillWeights||{}, t[0], t[1]) }; });
        scored.sort(function(a,b){ return b.score - a.score; });
        out.results.all = scored.map(function(s){ return s.ids.slice(); });
        out.winners = (out.results.all[0]||[]).slice();
        out.highlights = tierCommentsPairs(D.comments||{}, out.teams);
        out.winners.forEach(function(id){ state.stats.dailyWins[id]=(state.stats.dailyWins[id]||0)+1; });
      } else {
        var men = aliveByGender("male"), women = aliveByGender("female");
        function rank(ids){ return ids.map(function(id){ return {id:id, score:scorePlayerWeighted(D.skillWeights||{}, id)}; })
                              .sort(function(a,b){return b.score-a.score;}).map(function(x){return x.id;}); }
        out.results.male = rank(men);
        out.results.female = rank(women);
        out.winners = [out.results.male[0], out.results.female[0]].filter(Boolean);
        out.highlights = tierComments(D.comments||{}, out.results.male.concat(out.results.female));
        out.winners.forEach(function(id){ state.stats.dailyWins[id]=(state.stats.dailyWins[id]||0)+1; });
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

    document.getElementById("btn-simulate").onclick=function(){
      if(state.castMen.filter(Boolean).length!==13 || state.castWomen.filter(Boolean).length!==13){
        alert("Please complete all 13 Men and 13 Women slots before simulating."); return;
      }
      setAliveFromCast();
      simulateSeason();
      state.simulated=true; State.save(state);
      buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false;
      showEpisodeSection(1, "status");
      elInfoStatus.textContent="Simulated"; elInfoCast.textContent = "26";
      statsPanel.style.display="block";
    };

    function simulateSeason(){
      state.episodes={}; state.ui={}; state.chart={finalized:false, episodes:{}};
      state.stats = { dailyWins:{}, elimWins:{}, elimPlays:{}, notPicked:{} };
      state.placements = { winners:{male:null,female:null}, second:{male:null,female:null}, third:{male:null,female:null}, eliminated:[] };

      for(var ep=1; ep<=11; ep++){
        var E = state.episodes[ep] = { status: aliveIds().slice() };

        if(ep<=9){
          E.events1 = genHouseEvents();
          E.daily = computeDaily(ep);
          E.events2 = genHouseEvents();
          E.selection = selectionChain(ep, E.daily);
          var callF = E.selection.callouts.female;
          var callM = E.selection.callouts.male;
          E.elimination = resolveElimination(ep, { female: callF || null, male: callM || null });
        }
        else if(ep===10){
          E.events1 = genHouseEvents();
          E.selection = groupVoteSelectionEp10();
          var fPair = (E.selection.nominatedFemale && E.selection.femaleOpponent) ? [E.selection.nominatedFemale, E.selection.femaleOpponent] : null;
          var mPair = (E.selection.nominatedMale && E.selection.maleOpponent) ? [E.selection.nominatedMale, E.selection.maleOpponent] : null;
          E.elimination = resolveElimination(ep, { female:fPair, male:mPair });
        }
        else if(ep===11){
          E.final = simulateFinals();
        }
      }
      state.chart.finalized = true;
    }

    function buildLeftAccordion(){
      elAccordion.innerHTML = "";
      for(var e=1;e<=11;e++){
        var details = document.createElement("details"); details.className = "details-ep"; if(e===1) details.open = true;
        var inner = '<summary>Episode '+e+'</summary><div class="section-box"><div class="section-links">';
        inner += '<button class="btn" data-ep="'+e+'" data-sec="status">Status</button>';
        if(e<=9){
          inner += '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events 1</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="daily">Daily Challenge</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="events2">House Events 2</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="selection">The Selection</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="elimination">The Duel</button>';
        } else if(e===10){
          inner += '<button class="btn" data-ep="'+e+'" data-sec="events1">House Events 1</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="selection">The Selection</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="elimination">The Duel</button>';
        } else if(e===11){
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final1">Final Stage 1</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final2">Final Stage 2</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final3">Final Stage 3</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final4">Final Stage 4</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final5">Final Stage 5</button>';
          inner += '<button class="btn" data-ep="'+e+'" data-sec="final6">Final Stage 6</button>';
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
                       .sort(function(a,b){return b.score-a-score;});
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
      var orderBase = ["status","events1"];
      if(ep<=9) orderBase=orderBase.concat(["daily","events2","selection","elimination"]);
      if(ep===10) orderBase=orderBase.concat(["selection","elimination"]);
      if(ep===11) orderBase = ["status","final1","final2","final3","final4","final5","final6","final_results"];

      var idx = orderBase.indexOf(section);
      var btn = document.createElement("button"); btn.className="btn proceed"; btn.textContent="Proceed";
      btn.onclick=function(){
        if(section==="elimination" && ep<11){ showEpisodeSection(ep+1,"status"); btn.remove(); return; }
        if(section==="final_results"){ showStatisticsPanel("placements"); btn.remove(); return; }
        if(idx>=0 && idx<orderBase.length-1){ showEpisodeSection(ep, orderBase[idx+1]); btn.remove(); }
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

      if(section==="daily" && ep<=9){
        var D=S.daily||{}; var spec=(window.D2_DAILY_DATA||[]).find(function(d){return d.episode===ep;})||{};
        var name = D.name || "Daily Challenge";
        epContent.innerHTML="";

        var title=document.createElement("div"); title.className="challenge-name"; title.textContent=name;
        var desc=document.createElement("div"); desc.className="mini-card note"; desc.innerHTML='<div><strong>Description:</strong> '+(D.description||"")+'</div>';
        epContent.appendChild(title); epContent.appendChild(desc);

        var hlContainer=document.createElement("div");

        if((D.format||"individual")==="pairs" && Array.isArray(D.teams) && D.teams.length){
          var teamWrap=document.createElement("div"); teamWrap.className="tri-grid";
          for(var t=0;t<D.teams.length;t++){
            var pair=D.teams[t];
            var teamBox=document.createElement("div"); teamBox.className="row-box team";
            var row=document.createElement("div"); row.className="row-cards";
            row.appendChild(statusCardSquare(pair[0]));
            row.appendChild(statusCardSquare(pair[1]));
            teamBox.appendChild(row);
            teamWrap.appendChild(teamBox);
          }
          var pre=document.createElement("div"); pre.className="status-section";
          var h=document.createElement("div"); h.className="status-title"; h.textContent="Teams";
          pre.appendChild(h); pre.appendChild(teamWrap);
          epContent.appendChild(pre);

          epContent.appendChild(hlContainer);
        } else {
          epContent.appendChild(hlContainer);
        }

        var btnHighlights=document.createElement("button"); btnHighlights.className="btn"; btnHighlights.textContent="Show Highlights";
        btnHighlights.onclick=function(){
          if((D.format||"individual")==="pairs" && D.teams && D.teams.length){
            renderDailyHighlightsPairs(hlContainer, spec.comments||{}, D.teams);
          } else {
            renderHighlightsInto(hlContainer, spec.comments||{}, spec.skillWeights||{}, (S.status||[]));
          }
          btnHighlights.remove();
        };
        epActions.appendChild(btnHighlights);

        var btnResults=document.createElement("button"); btnResults.className="btn"; btnResults.textContent="Reveal Placements";
        btnResults.onclick=function(){
          var col=document.createElement("div"); col.className="status-col";
          if((D.format||"individual")==="pairs"){
            var all=(D.results&&D.results.all)||[];
            var order=all.slice().reverse();
            for(var i=0;i<order.length;i++){
              var pair=order[i];
              var rowBox=document.createElement("div"); rowBox.className="row-box team";
              var row=document.createElement("div"); row.className="row-cards";
              var a=statusCardSquare(pair[0]); var b=statusCardSquare(pair[1]);
              if(i===order.length-1){ a.classList.add("glow-gold"); b.classList.add("glow-gold"); }
              row.appendChild(a); row.appendChild(b);
              rowBox.appendChild(row);
              labelUnder(rowBox, ordinal(order.length-i)+" Place");
              col.appendChild(rowBox);
            }
          } else {
            var men=(D.results&&D.results.male)||[], women=(D.results&&D.results.female)||[];
            var n=Math.max(men.length, women.length);
            for(var j=n-1;j>=0;j--){
              var rowBox=document.createElement("div"); rowBox.className="row-box";
              var row=document.createElement("div"); row.className="row-cards";
              if(men[j]) row.appendChild(statusCardSquare(men[j], (j===0?"glow-gold":"")));
              if(women[j]) row.appendChild(statusCardSquare(women[j], (j===0?"glow-gold":"")));
              rowBox.appendChild(row);
              labelUnder(rowBox, ordinal(j+1)+" Place");
              col.appendChild(rowBox);
            }
          }
          epContent.appendChild(col);
          btnResults.disabled=true;
        };
        epActions.appendChild(btnResults);

        addProceed(ep, section); return;
      }

      if(section==="selection"){
        epContent.innerHTML="";
        if(ep===10){
          epSub.textContent="Group Vote";
          var S10=S.selection||{};
          var note=document.createElement("div"); note.className="mini-card note";
          note.innerHTML='<div><strong>Format:</strong> All remaining players vote for <em>one woman</em> and <em>one man</em> they want in The Duel (worst relationship). The top-voted woman and man are nominated. Each nominated player then calls out an opponent of their gender (worst relationship).</div>';
          epContent.appendChild(note);
          var votersWrap=document.createElement("div"); votersWrap.className="status-section";
          var votersTitle=document.createElement("div"); votersTitle.className="status-title"; votersTitle.textContent="Votes";
          votersWrap.appendChild(votersTitle);
          var list=document.createElement("div"); list.style.display="flex"; list.style.flexDirection="column"; list.style.gap="10px";
          var pv=S10.perVoter||[];
          for(var k=0;k<pv.length;k++){
            var v=pv[k];
            var row=document.createElement("div"); row.className="row-box wide";
            var cards=document.createElement("div"); cards.className="row-cards";
            cards.appendChild(statusCardSquare(v.voter));
            var arr=document.createElement("div"); arr.className="arrow"; arr.textContent="→";
            cards.appendChild(arr);
            if(v.male){ cards.appendChild(statusCardSquare(v.male)); }
            else { var mSpan=document.createElement("div"); mSpan.className="status-card square"; mSpan.innerHTML='<div class="name">—</div>'; labelUnder(mSpan,"Male Vote"); cards.appendChild(mSpan); }
            if(v.female){ cards.appendChild(statusCardSquare(v.female)); }
            else { var fSpan=document.createElement("div"); fSpan.className="status-card square"; fSpan.innerHTML='<div class="name">—</div>'; labelUnder(fSpan,"Female Vote"); cards.appendChild(fSpan); }
            row.appendChild(cards);
            list.appendChild(row);
          }
          votersWrap.appendChild(list); epContent.appendChild(votersWrap);

          var nomWrap=document.createElement("div"); nomWrap.className="status-section";
          var nomTitle=document.createElement("div"); nomTitle.className="status-title"; nomTitle.textContent="Nominated";
          var nomGrid=document.createElement("div"); nomGrid.className="status-grid";
          if(S10.nominatedFemale){ nomGrid.appendChild(statusCardSquare(S10.nominatedFemale)); }
          if(S10.nominatedMale){ nomGrid.appendChild(statusCardSquare(S10.nominatedMale)); }
          nomWrap.appendChild(nomTitle); nomWrap.appendChild(nomGrid);
          if(S10.tieFemale || S10.tieMale){
            var tie=document.createElement("div"); tie.className="muted"; tie.textContent="The vote resulted in a tie so the nominated player was chosen at random.";
            nomWrap.appendChild(tie);
          }
          epContent.appendChild(nomWrap);

          var btnCall=document.createElement("button"); btnCall.className="btn"; btnCall.textContent="Reveal Call Out";
          btnCall.onclick=function(){
            var stack=document.createElement("div"); stack.style.display="flex"; stack.style.flexDirection="column"; stack.style.gap="10px";
            if(S10.nominatedFemale && S10.femaleOpponent){
              var row=document.createElement("div"); row.className="row-box wide";
              var rc=document.createElement("div"); rc.className="callout-row";
              rc.appendChild(statusCardSquare(S10.nominatedFemale));
              rc.appendChild(statusCardSquare(S10.femaleOpponent));
              row.appendChild(rc);
              var txt=document.createElement("div"); txt.className="badge muted";
              txt.textContent=nameOf(S10.nominatedFemale)+" has chosen to call out "+nameOf(S10.femaleOpponent);
              row.appendChild(txt);
              stack.appendChild(row);
            }
            if(S10.nominatedMale && S10.maleOpponent){
              var row2=document.createElement("div"); row2.className="row-box wide";
              var rc2=document.createElement("div"); rc2.className="callout-row";
              rc2.appendChild(statusCardSquare(S10.nominatedMale));
              rc2.appendChild(statusCardSquare(S10.maleOpponent));
              row2.appendChild(rc2);
              var txt2=document.createElement("div"); txt2.className="badge muted";
              txt2.textContent=nameOf(S10.nominatedMale)+" has chosen to call out "+nameOf(S10.maleOpponent);
              row2.appendChild(txt2);
              stack.appendChild(row2);
            }
            epContent.appendChild(stack); btnCall.remove();
          };
          epActions.appendChild(btnCall);

          addProceed(ep, section); return;
        } else {
          epSub.textContent="Winners’ Save Chain";
          var Sel=S.selection||{};
          var winners=(Sel.winners||[]).slice();
          var chain=(Sel.savedChain||[]).slice();
          var revealIndex=Math.max(0, winners.length);

          var top=document.createElement("div"); top.className="status-grid";
          winners.forEach(function(w){ top.appendChild(statusCardSquare(w)); });
          epContent.appendChild(top);

          var text=document.createElement("div"); text.className="muted"; text.textContent="The Winners have chosen to save...";
          epContent.appendChild(text);

          var revealBtn=document.createElement("button"); revealBtn.className="btn"; revealBtn.textContent="Reveal Next Player";
          var revealAllBtn=document.createElement("button"); revealAllBtn.className="btn"; revealAllBtn.textContent="Reveal All";

          function showOne(){
            if(revealIndex < chain.length){
              var id=chain[revealIndex];
              var row=document.createElement("div"); row.className="status-grid";
              row.appendChild(statusCardSquare(id));
              var line=document.createElement("div"); line.className="muted"; line.textContent=nameOf(id)+" has chosen to save...";
              epContent.appendChild(row); epContent.appendChild(line);
              revealIndex++;
              if(revealIndex>=chain.length){ finalizeBottom(); }
            }
          }
          function showAll(){
            while(revealIndex < chain.length){ showOne(); }
          }
          function hideRevealers(){
            revealBtn.remove(); revealAllBtn.remove();
          }
          function finalizeBottom(){
            hideRevealers();
            var lm = Sel.lastMale, lf = Sel.lastFemale;
            var bottomWrap=document.createElement("div"); bottomWrap.className="status-section";
            var bt=document.createElement("div"); bt.className="status-title"; bt.textContent="Bottom Two";
            var btg=document.createElement("div"); btg.className="status-grid";
            if(lf) btg.appendChild(statusCardSquare(lf));
            if(lm) btg.appendChild(statusCardSquare(lm));
            bottomWrap.appendChild(bt); bottomWrap.appendChild(btg);
            epContent.appendChild(bottomWrap);

            var callTxt=document.createElement("div"); callTxt.className="muted"; callTxt.textContent="The Bottom Players have chosen their opponents...";
            epContent.appendChild(callTxt);

            var callBtn=document.createElement("button"); callBtn.className="btn"; callBtn.textContent="Reveal Call Out";
            callBtn.onclick=function(){
              var stack=document.createElement("div"); stack.style.display="flex"; stack.style.flexDirection="column"; stack.style.gap="10px";
              if(Sel.callouts && Sel.callouts.female){
                var f=Sel.callouts.female;
                var row=document.createElement("div"); row.className="row-box wide";
                var rc=document.createElement("div"); rc.className="callout-row";
                rc.appendChild(statusCardSquare(f[0]));
                rc.appendChild(statusCardSquare(f[1]));
                row.appendChild(rc);
                var mid=document.createElement("div"); mid.className="badge muted";
                mid.textContent=nameOf(f[0])+" has chosen to call out "+nameOf(f[1]);
                row.appendChild(mid);
                stack.appendChild(row);
              }
              if(Sel.callouts && Sel.callouts.male){
                var m=Sel.callouts.male;
                var row2=document.createElement("div"); row2.className="row-box wide";
                var rc2=document.createElement("div"); rc2.className="callout-row";
                rc2.appendChild(statusCardSquare(m[0]));
                rc2.appendChild(statusCardSquare(m[1]));
                row2.appendChild(rc2);
                var mid2=document.createElement("div"); mid2.className="badge muted";
                mid2.textContent=nameOf(m[0])+" has chosen to call out "+nameOf(m[1]);
                row2.appendChild(mid2);
                stack.appendChild(row2);
              }
              epContent.appendChild(stack); callBtn.remove();
            };
            epActions.prepend(callBtn);
          }

          revealBtn.onclick=function(){ showOne(); };
          revealAllBtn.onclick=function(){ showAll(); };
          epActions.appendChild(revealBtn);
          epActions.appendChild(revealAllBtn);
          addProceed(ep, section); return;
        }
      }

      if(section==="elimination"){
        var el=S.elimination||{};
        epContent.innerHTML="";
        var title=document.createElement("div"); title.className="challenge-name"; title.textContent=el.name||"The Duel";
        var desc=document.createElement("div"); desc.className="mini-card note"; desc.innerHTML='<div><strong>Description:</strong> '+(el.description||"")+'</div>';
        epContent.appendChild(title); epContent.appendChild(desc);

        function renderMatch(m){
          if(!m) return;
          var row=document.createElement("div"); row.className="matchup";
          var left = statusCardSquare(m.A); var right = statusCardSquare(m.B);
          row.appendChild(left);
          var mid=document.createElement("div"); mid.className="arrow"; mid.textContent="VS.";
          row.appendChild(mid);
          row.appendChild(right);
          epContent.appendChild(row);

          var btnRow=document.createElement("div"); btnRow.className="matchup-actions";
          var btnH=document.createElement("button"); btnH.className="btn"; btnH.textContent="Show Highlights";
          var btnR=document.createElement("button"); btnR.className="btn"; btnR.textContent="Show Results";
          var hlSpot=document.createElement("div");

          btnH.onclick=function(){
            renderHighlightsInline(hlSpot, (el.comments||{}), (el.skillWeights||{}), [m.A, m.B]);
            btnH.disabled=true;
          };
          btnR.onclick=function(){
            if(m.winner===m.A){ left.classList.add("win"); right.classList.add("lose"); }
            else { right.classList.add("win"); left.classList.add("lose"); }
            btnR.disabled=true;
          };

          btnRow.appendChild(btnH); btnRow.appendChild(btnR);
          epContent.appendChild(btnRow);
          epContent.appendChild(hlSpot);
        }
        renderMatch((el.matchups||{}).female);
        renderMatch((el.matchups||{}).male);

        addProceed(ep, section); return;
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
      viewCast.hidden=true; viewEpisode.hidden=false; epActions.innerHTML="";
      if(kind==="placements"){
        epTitle.textContent="Placements"; epSub.textContent="Season Results";
        epContent.innerHTML="";
        var Pfull = placementsByGender();

        function placeCard(id, label){
          if(!id) return null;
          var card = statusCardSquare(id);
          labelUnder(card, label);
          return card;
        }

        var rowWin=document.createElement("div"); rowWin.className="placements-row";
        if(Pfull.men[1]){ var m1=placeCard(Pfull.men[1], "1st Place"); m1.classList.add("border-gold"); rowWin.appendChild(m1); }
        if(Pfull.women[1]){ var f1=placeCard(Pfull.women[1], "1st Place"); f1.classList.add("border-gold"); rowWin.appendChild(f1); }
        epContent.appendChild(rowWin);

        var row23=document.createElement("div"); row23.className="placements-row";
        if(Pfull.men[2]){ var m2=placeCard(Pfull.men[2], "2nd Place"); m2.classList.add("border-silver"); row23.appendChild(m2); }
        if(Pfull.women[2]){ var f2=placeCard(Pfull.women[2], "2nd Place"); f2.classList.add("border-silver"); row23.appendChild(f2); }
        if(Pfull.men[3]){ var m3=placeCard(Pfull.men[3], "3rd Place"); m3.classList.add("border-bronze"); row23.appendChild(m3); }
        if(Pfull.women[3]){ var f3=placeCard(Pfull.women[3], "3rd Place"); f3.classList.add("border-bronze"); row23.appendChild(f3); }
        epContent.appendChild(row23);
        var restGrid=document.createElement("div"); restGrid.className="six-grid";
        var rest=[];
        for(var place=4; place<=13; place++){
          if(Pfull.men[place]) rest.push({id:Pfull.men[place], label:ordinal(place)+" Place"});
          if(Pfull.women[place]) rest.push({id:Pfull.women[place], label:ordinal(place)+" Place"});
        }
        rest.forEach(function(it){
          var c = statusCardSquare(it.id);
          labelUnder(c, it.label);
          restGrid.appendChild(c);
        });
        epContent.appendChild(restGrid);

        var btn=document.createElement("button"); btn.className="btn proceed"; btn.textContent="Proceed";
        btn.onclick=function(){ showStatisticsPanel("other"); btn.remove(); };
        epActions.appendChild(btn);
        return;
      }

      if(kind==="other"){
        epTitle.textContent="Other Statistics"; epSub.textContent="Leaders and tallies";
        var tbl=document.createElement("table"); tbl.className="stats-table"; var tbody=document.createElement("tbody");
        function row(label, value){ var tr=document.createElement("tr"); tr.innerHTML="<th>"+label+"</th><td>"+value+"</td>"; tbody.appendChild(tr); }
        function topOf(map, ids){ var best=[], max=-1; for(var i=0;i<ids.length;i++){ var id=ids[i]; var v=+((map||{})[id]||0); if(v>max){ max=v; best=[id]; } else if(v===max){ best.push(id); } } return { list:best, value:max }; }
        var men=(state.castMen||[]).filter(Boolean).map(function(c){return c.id;});
        var women=(state.castWomen||[]).filter(Boolean).map(function(c){return c.id;});
        var mdm=topOf(state.stats.dailyWins, men), mdw=topOf(state.stats.dailyWins, women);
        var mew=topOf(state.stats.elimWins, men.concat(women));
        var np =topOf(state.stats.notPicked, men.concat(women));
        row("Most Daily Wins (Men)",   mdm.list.length? (mdm.list.map(nameOf).join(", ")+" — "+(mdm.value||0)) : "—");
        row("Most Daily Wins (Women)", mdw.list.length? (mdw.list.map(nameOf).join(", ")+" — "+(mdw.value||0)) : "—");
        row("Most Elimination Wins",   mew.list.length? (mew.list.map(nameOf).join(", ")+" — "+(mew.value||0)) : "—");
        row('"Not Picked" (most times)', np.list.length? (np.list.map(nameOf).join(", ")+" — "+(np.value||0)) : "—");
        tbl.appendChild(tbody); epContent.innerHTML=""; epContent.appendChild(tbl);
        var btn=document.createElement("button"); btn.className="btn proceed"; btn.textContent="Proceed";
        btn.onclick=function(){ showStatisticsPanel("chart"); btn.remove(); };
        epActions.appendChild(btn);
        return;
      }

      if(kind==="chart"){
        epTitle.textContent="Season Chart"; epSub.textContent="";
        epContent.innerHTML="";
        var btn=document.createElement("button"); btn.className="btn"; btn.textContent="Open Season Chart";
        btn.onclick=function(){ location.href="./season_chart.html"; };
        epContent.appendChild(btn);
        return;
      }
    }

  })();