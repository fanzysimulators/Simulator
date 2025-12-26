  (function(){
    document.addEventListener('DOMContentLoaded', function(){

      function rnd(n){ return Math.floor(Math.random()*n); }
      function sample(a){ return a.length ? a[rnd(a.length)] : undefined; }
      function shuffle(a){ return a.map(function(v){return [Math.random(),v]}).sort(function(x,y){return x[0]-y[0]}).map(function(z){return z[1]}); }
      function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
      var IMG_BLANK = "BlankProfile.webp";
      var TEAM_COLORS=["#82cfff","#ffb86b","#ff6e6e","#7af27a","#c792ea","#ffd86e","#6ee7ff","#ffa0c8","#9dd79d","#f4a261","#5eead4","#b39ddb","#f59e0b","#8bd3dd","#e6c3ff","#9ad1ff"];

      function isArray(x){ return Array.isArray(x); }
      function isObj(x){ return x && typeof x==='object' && !Array.isArray(x); }

      function buildDemoRoster(){
        var out=[];
        for(var i=1;i<=64;i++){
          var id="demo_"+i;
          out.push({id:id,name:"Contestant "+i,nickname:"Contestant "+i,show:(i<=32?"Demo A":"Demo B"),season:1,gender:i%2===0?"female":"male",image:IMG_BLANK});
        }
        return out;
      }

      (function normalizePlayers(){
        var src = window.PLAYERS;
        if(!isArray(src) || !src.length){
          var pd = window.playerData;
          if(pd && (isArray(pd.males)||isArray(pd.females)||isArray(pd.others))){
            var tag=function(arr,gender){ return (isArray(arr)?arr:[]).map(function(p){
return {
  id: p.id,
  name: p.name,
  nickname: p.nickname || p.name || p.id,
  show: p.show,
  season: p.season,
  shows: Array.isArray(p.shows) ? p.shows.slice() : (p.show ? [p.show] : []),
  seasonsByShow: (p.seasonsByShow && typeof p.seasonsByShow === "object")
    ? p.seasonsByShow
    : (p.show && (p.season !== undefined && p.season !== null)
        ? (function(){ var o={}; o[p.show]=[p.season]; return o; })()
        : {}),

  gender: gender || p.gender || "unknown",
  image: p.image || (p.id ? ("./contestant_pictures/" + p.id + ".webp") : IMG_BLANK)
};
            });};
            src=[].concat(tag(pd.males,"male"),tag(pd.females,"female"),tag(pd.others,null));
          }
        }
        if(!isArray(src) || !src.length){
          document.getElementById("data-warning").style.display="block";
          src = buildDemoRoster();
        }
        window.PLAYERS = src;
        var map={}; for(var i=0;i<src.length;i++){ map[src[i].id]=src[i]; }
        window.PLAYERS_BY_ID = map;
      })();

      var KEY="challenge-fr-season";
      var State={
        load:function(){try{return JSON.parse(sessionStorage.getItem(KEY))||null;}catch(e){return null;}},
        save:function(s){sessionStorage.setItem(KEY,JSON.stringify(s));},
        clear:function(){sessionStorage.removeItem(KEY);}
      };

      var state=State.load()||{
        seed:Math.random().toString(36).slice(2,8).toUpperCase(),
        teams:Array.from({length:16}).map(function(_,i){return {aId:null,bId:null,role:(i<14?'main':'merc'),active:(i<14)};}),
        profiles:{}, relationships:{}, episodes:{}, ui:{},
        stats:{ dailyWins:{}, elimWins:{}, elimPlays:{}, votes:{}, purgeWins:{} },
        chart:{ finalized:false, episodes:{} },
        redemption:[], eliminated:[],
elimInfo:{}, 
        simulated:false,
        lastView:null
      };

      var elWrapMain=document.getElementById("teams-wrap-main");
      var elWrapMerc=document.getElementById("teams-wrap-mercs");
      var elFilterShow=document.getElementById("filter-show");
      var elDataWarn=document.getElementById("data-warning");
      var elInfoTeam=document.getElementById("info-team-count");
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
      var timesPanel=document.getElementById("times-panel");
      var timesClose=document.getElementById("times-close");
      var timesTable=document.getElementById("times-table");
      timesClose.onclick=function(){timesPanel.close();};

      function nameOf(id){ var p=(window.PLAYERS_BY_ID||{})[id]; return p?(p.nickname||p.name||id):id; }
      function fullNameOf(id){ var p=(window.PLAYERS_BY_ID||{})[id]; return p?(p.name||p.nickname||id):id; }
      function picOf(id){ var p=(window.PLAYERS_BY_ID||{})[id]; return p?(p.image||IMG_BLANK):IMG_BLANK; }
      function clampSkill(v){ return typeof v==="number" ? Math.max(-3, Math.min(3, v)) : 0; }
      function skillOf(id,key){ var s=state.profiles[id]?state.profiles[id][key]:0; return clampSkill(s); }
      function teamColor(ti){ return TEAM_COLORS[ti%TEAM_COLORS.length]; }
function pad2(n){ n = n|0; return (n<10?'0':'')+n; }
function toHMS(sec){
  sec = Math.max(0, sec|0);
  var h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  return pad2(h) + ":" + pad2(m) + ":" + pad2(s);
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

function buildFilterShows(roster){
  var showMap = {};
  (roster || []).forEach(function(p){
    allShowsOf(p).forEach(function(s){
      if(s) showMap[s] = true;
    });
  });

  var shows = Object.keys(showMap).sort();
  var html = '<option value="">— All Shows —</option>';
  for(var i=0;i<shows.length;i++){
    html += '<option value="'+shows[i]+'">'+shows[i]+'</option>';
  }

  elFilterShow.innerHTML = html;
  elFilterShow.onchange = function(){ buildTeamWraps(roster); };
}

function playerOptions(roster, selectedId){
  var show = elFilterShow.value;

  var filtered = roster.filter(function(r){
    return (!show || playerHasShow(r, show));
  });

  var opts=['<option value="">Choose Player</option>'];
  for(var i=0;i<filtered.length;i++){
    var r=filtered[i];
    var sel=(selectedId && r.id===selectedId) ? " selected" : "";
    opts.push('<option value="'+r.id+'"'+sel+'>'+ (r.name || r.nickname || r.id) +'</option>');
  }
  return opts.join('');
}

      function teamCard(teamIndex){
        var t=state.teams[teamIndex], color=teamColor(teamIndex);
        var aId=t.aId, bId=t.bId;
        var html =
          '<div class="pick-head"><span class="name">Team '+(teamIndex+1)+'</span></div>'+
          '<div class="duo">'+
            '<div class="slot">'+
              '<img class="avatar" src="'+(aId?picOf(aId):IMG_BLANK)+'" alt="Player A">'+
              '<select id="selA'+teamIndex+'" class="pick-player" data-team="'+teamIndex+'" data-slot="A">'+ playerOptions(window.PLAYERS||[], aId) +'</select>'+
              '<div class="slot-actions"><button class="btn btn-customA" data-team="'+teamIndex+'">Custom Player A</button></div>'+
            '</div>'+
            '<div class="slot">'+
              '<img class="avatar" src="'+(bId?picOf(bId):IMG_BLANK)+'" alt="Player B">'+
              '<select id="selB'+teamIndex+'" class="pick-player" data-team="'+teamIndex+'" data-slot="B">'+ playerOptions(window.PLAYERS||[], bId) +'</select>'+
              '<div class="slot-actions"><button class="btn btn-customB" data-team="'+teamIndex+'">Custom Player B</button></div>'+
            '</div>'+
          '</div>';
        var div=document.createElement("div");
        div.className="pick-card";
        div.style.borderColor=color;
        div.innerHTML=html;
        return div;
      }
      function buildTeamWraps(roster){
        elWrapMain.innerHTML="";
        for(var i=0;i<14;i+=2){
          var row=document.createElement("div"); row.className="teams-row";
          row.appendChild(teamCard(i));
          row.appendChild(teamCard(i+1));
          elWrapMain.appendChild(row);
        }
        elWrapMerc.innerHTML="";
        var rowM=document.createElement("div"); rowM.className="teams-row";
        rowM.appendChild(teamCard(14));
        rowM.appendChild(teamCard(15));
        elWrapMerc.appendChild(rowM);

        var selects=document.querySelectorAll(".pick-player");
        for(var s=0;s<selects.length;s++){
          selects[s].onchange=function(e){
            var teamIndex=+e.target.dataset.team; var slot=e.target.dataset.slot;
            var id=e.target.value||"";
            state.teams[teamIndex][slot==="A"?"aId":"bId"]= id || null;
            State.save(state);
            buildTeamWraps(roster);
            refreshTeamCount();
          };
        }
        var btnA=document.querySelectorAll(".btn-customA");
        for(var a=0;a<btnA.length;a++){ btnA[a].onclick=function(){ openCustomModal(+this.dataset.team, "A"); }; }
        var btnB=document.querySelectorAll(".btn-customB");
        for(var b=0;b<btnB.length;b++){ btnB[b].onclick=function(){ openCustomModal(+this.dataset.team, "B"); }; }
        refreshTeamCount();
      }
      function refreshTeamCount(){
        var filled = state.teams.filter(function(t){return t.aId && t.bId;}).length;
        elInfoTeam.textContent = filled + " / 16";
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

  roster = shuffle(roster.slice());
  var need = 32;
  if (roster.length < need){
    alert("Not enough eligible players for those filters to fill 16 teams.");
    return;
  }

  var chosen = roster.slice(0, need).map(function(p){ return p.id; });

  for (var i=0;i<16;i++){
    state.teams[i].aId = chosen[i*2];
    state.teams[i].bId = chosen[i*2+1];
  }

  State.save(state);
  buildTeamWraps(window.PLAYERS || []);
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

      var modal=document.createElement("dialog");
      modal.className="antm-modal";
      modal.innerHTML=
        '<form id="custom-form" method="dialog" autocomplete="off" style="text-align:center;">'+
          '<h3>Add Custom Player</h3>'+
          '<label>Full Name <input id="cp-name" required /></label>'+
          '<label>Nickname <input id="cp-nick" required /></label>'+
          '<label>Image URL <input id="cp-img" placeholder="https://..." /></label>'+
          '<menu style="display:flex; gap:8px; justify-content:center;"><button type="button" class="btn" id="modal-cancel">Cancel</button><button type="submit" class="btn">Add</button></menu>'+
        '</form>';
      document.body.appendChild(modal);
      function openCustomModal(teamIndex, slot){
        modal.showModal();
        var form=modal.querySelector("#custom-form");
        var cancel=modal.querySelector("#modal-cancel");
        form.reset();
        function onSubmit(ev){
          ev.preventDefault();
          var name=form.querySelector("#cp-name").value.trim();
          var nick=form.querySelector("#cp-nick").value.trim();
          var img=form.querySelector("#cp-img").value.trim();
          if(!name||!nick) return;
          function makeId(n){ return n.toLowerCase().replace(/[^a-z0-9]+/g,"_")+"_"+Date.now().toString(36); }
          var id=makeId(nick);
          window.PLAYERS_BY_ID[id]={id:id,name:name,nickname:nick,gender:"unknown",show:"Custom",image:img||IMG_BLANK};
state.PLAYERS_BY_ID = state.PLAYERS_BY_ID || {};
state.PLAYERS_BY_ID[id] = window.PLAYERS_BY_ID[id];
          (window.PLAYERS||[]).push(window.PLAYERS_BY_ID[id]);
          state.teams[teamIndex][slot==="A"?"aId":"bId"]=id;
          State.save(state); modal.close(); form.reset(); buildTeamWraps(window.PLAYERS||[]);
        }
        form.addEventListener("submit", onSubmit, { once:true });
        cancel.onclick=function(){ modal.close(); };
      }

      function getRel(a,b){
        var rAB = (state.relationships[a] && typeof state.relationships[a][b]==="number")? state.relationships[a][b] : null;
        var rBA = (state.relationships[b] && typeof state.relationships[b][a]==="number")? state.relationships[b][a] : null;
        if(rAB==null && rBA==null) return 0;
        if(rAB==null) return rBA;
        if(rBA==null) return rAB;
        return (rAB + rBA)/2;
      }
      function teamCombinedRel(ti, tj){
        var tA = state.teams[ti], tB = state.teams[tj];
        if(!tA || !tB) return 0;
        var idsA=[tA.aId,tA.bId].filter(function(x){return !!x;});
        var idsB=[tB.aId,tB.bId].filter(function(x){return !!x;});
        if(!idsA.length || !idsB.length) return 0;
        var sum=0, c=0;
        for(var i=0;i<idsA.length;i++){ for(var j=0;j<idsB.length;j++){ sum += getRel(idsA[i], idsB[j]); c++; } }
        return c? (sum/c) : 0;
      }
      function scorePlayer(weights,pid){
        var t=0;
        if(isObj(weights)){ for(var k in weights){ if(Object.prototype.hasOwnProperty.call(weights,k)){ t += (skillOf(pid,k) * (typeof weights[k]==="number"?weights[k]:1)); } } return t; }
        if(isArray(weights)){ var s=0; for(var i=0;i<weights.length;i++){ s += (skillOf(pid,weights[i])||0); } return s; }
        return 0;
      }
      function scoreTeam(weights,teamIndex){
        var t = state.teams[teamIndex]; if(!t||!t.aId||!t.bId) return 0;
        return scorePlayer(weights,t.aId) + scorePlayer(weights,t.bId);
      }

      function getEventPools(){
        var R = window.FR_EVENTS || window.FM_EVENTS || window.EVENTS || null;
        if(!R) return { two_negative:[], two_positive:[], two_neutral:[], solo_neutral:[], three_neutral:[] };
        var src = (R.house && (R.house.two_neutral || R.house.two_positive || R.house.two_negative)) ? R.house : R;
        return {
          two_negative:  src.two_negative  || [],
          two_positive:  src.two_positive  || [],
          two_neutral:   src.two_neutral   || [],
          solo_neutral:  src.solo_neutral  || [],
          three_neutral: src.three_neutral || []
        };
      }
      function temperamentBias(id){
        var t=skillOf(id,"temperament");
        if(t<=-2.5) return 0.30;
        if(t<=-1.5) return 0.20;
        if(t<=-0.5) return 0.10;
        return 0;
      }
      function eventCard(txt, ids){
        var div=document.createElement("div"); div.className="event-item";
        for(var i=0;i<(ids?ids.length:0);i++){
          var img=document.createElement("img"); img.className="picon"; img.src=picOf(ids[i]); img.alt=nameOf(ids[i]);
          div.appendChild(img);
        }
        var span=document.createElement("span"); span.className="txt"; span.textContent=txt;
        div.appendChild(span);
        return div;
      }
      function pairFromTeams_allowSameTeam(teamIdxs){
        var players=[];
        for(var i=0;i<teamIdxs.length;i++){
          var t=state.teams[teamIdxs[i]];
          if(!t) continue;
          if(t.aId) players.push({pid:t.aId, ti:teamIdxs[i]});
          if(t.bId) players.push({pid:t.bId, ti:teamIdxs[i]});
        }
        if(players.length<2) return null;
        var a=sample(players); var rest=players.filter(function(x){return x.pid!==a.pid;});
        var b=sample(rest);
        return [a.pid,b.pid];
      }
      function trioFromTeams(teamIdxs){
        var ids=[];
        for(var i=0;i<teamIdxs.length;i++){
          var t=state.teams[teamIdxs[i]];
          if(!t) continue;
          if(t.aId) ids.push(t.aId);
          if(t.bId) ids.push(t.bId);
        }
        if(ids.length<3) return null;
        ids=shuffle(ids.slice());
        return [ids[0], ids[1], ids[2]];
      }
      function genHouseEvents(teamIdxs){
        var H = getEventPools();
        var out=[]; var total = 3 + rnd(2);
        for(var i=0;i<total;i++){
          var roll=Math.random();
          if(roll<0.10 && H.three_neutral.length){
            var trio=trioFromTeams(teamIdxs);
            if(trio){
              var t=sample(H.three_neutral);
              var txt=t.replace("{A}",nameOf(trio[0])).replace("{B}",nameOf(trio[1])).replace("{C}",nameOf(trio[2]));
              out.push({text:txt,ids:[trio[0],trio[1],trio[2]]}); continue;
            }
          }
          var pair=pairFromTeams_allowSameTeam(teamIdxs); if(!pair) break;
          var A=pair[0],B=pair[1];
          var neg=H.two_negative,pos=H.two_positive,neu=H.two_neutral;
          var bias=Math.max(temperamentBias(A),temperamentBias(B));
          var pick, r=Math.random();
          if(r<bias && neg.length){ pick=sample(neg); }
          else if(r<0.6 && neu.length){ pick=sample(neu); }
          else if(pos.length){ pick=sample(pos); }
          else if(neu.length){ pick=sample(neu); }
          else if(neg.length){ pick=sample(neg); }
          else { pick="{A} and {B} chat by the pool."; }
          var txt2=pick.replace("{A}",nameOf(A)).replace("{B}",nameOf(B));
          out.push({text:txt2,ids:[A,B]});
        }
        return out;
      }
      function renderEvents(items){
        var wrap=document.createElement("div"); wrap.className="events-grid";
        for(var i=0;i<items.length;i++){ wrap.appendChild(eventCard(items[i].text, items[i].ids)); }
        return wrap;
      }

      function teamAvgLoyalty(ti){ var t=state.teams[ti]; if(!t) return 0; return (skillOf(t.aId,"loyalty")+skillOf(t.bId,"loyalty"))/2; }
      function betrayalChance(ti){ var L=teamAvgLoyalty(ti); if(L<=-2.5) return 0.30; if(L<=-1.5) return 0.20; if(L<=-0.5) return 0.10; return 0; }

      function pickVoteTarget(voterIdx, poolIdxs, powerIdx){
        var pool = poolIdxs.filter(function(t){ return t!==voterIdx; });
        if(!pool.length) return null;
        var betray = Math.random() < betrayalChance(voterIdx);
        var list = pool.map(function(tj){ return {tj:tj, rel: teamCombinedRel(voterIdx,tj)}; });
        list.sort(function(a,b){ return betray ? (b.rel-a.rel) : (a.rel-b.rel); });
        var bestRel = list[0].rel;
        var ties = list.filter(function(x){return x.rel===bestRel;}).map(function(x){return x.tj;});
        return sample(ties);
      }

      function getAliveTeamIdxs(){ var idxs=[]; for(var i=0;i<state.teams.length;i++){ var t=state.teams[i]; if(t && t.active && t.role==="main" && t.aId && t.bId) idxs.push(i); } return idxs; }
      function moveTeamToRedemption(ti, reason){
  if(state.redemption.indexOf(ti)<0) state.redemption.push(ti);
  if(state.teams[ti]) state.teams[ti].active=false;
  var info = state.elimInfo[ti] || {};
  if(info.firstEp == null) info.firstEp = currentEp;
  info.lastEp = currentEp;
  if(!info.reason) info.reason = reason || 'eliminated';
  state.elimInfo[ti] = info;
}
      function removeFromRedemption(ti){ state.redemption = state.redemption.filter(function(x){return x!==ti;}); }
function eliminateForGood(ti, context){
  removeFromRedemption(ti);
  if(state.eliminated.indexOf(ti)<0) state.eliminated.push(ti);
  if(state.teams[ti]) state.teams[ti].active=false;
  var info = state.elimInfo[ti] || {};
  if(info.firstEp == null) info.firstEp = currentEp;
  if(info.lastEp == null) info.lastEp = currentEp;
  info.finalEp = currentEp;
  info.finalContext = context || info.finalContext || 'main';
  if(!info.reason) info.reason = 'eliminated';
  state.elimInfo[ti] = info;
}
      function duelTeams(ti, tj, elim){
        var w = elim && elim.skillWeights ? elim.skillWeights : (elim||{});
        var sA = scoreTeam(w, ti), sB = scoreTeam(w, tj);
        if(sA===sB) return (Math.random()<0.5)? {winner:ti, loser:tj} : {winner:tj, loser:ti};
        return (sA>sB)? {winner:ti, loser:tj} : {winner:tj, loser:ti};
      }
      function ordinal(n){ var s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
      function outerHTML(node){ var div=document.createElement("div"); div.appendChild(node.cloneNode(true)); return div.innerHTML; }
var currentEp = 0;  

      function simulateWholeSeason(){
        for(var i=0;i<state.teams.length;i++){ var t=state.teams[i]; if(t) t.active=(t.role==="main"); }
        state.redemption=[]; state.eliminated=[]; state.episodes={}; state.chart={finalized:false,episodes:{}}; state.stats={ dailyWins:{}, elimWins:{}, elimPlays:{}, votes:{}, purgeWins:{} };

currentEp = 1;
        simulateEpisode1();

        var eps=[2,3,4,5,6,7,8,9,10,11,12];
        for(var e=0;e<eps.length;e++){
          var ep=eps[e];
          currentEp = ep;
          if(ep===3) simulateRedemptionBlock(3,1);
          else if(ep===7) simulateRedemptionBlock(7,1);
          else if(ep===11){ simulateRedemptionBlock(11,2); simulateEpisode11Tail(); }
          else if(ep===12) simulatePurgeOnly(12);
          else simulateStandardEpisode(ep);
        }
        currentEp = 13;
        simulateStandardEpisode(13);
        if(state.redemption && state.redemption.length){
          var leftover = state.redemption.slice();
          for(var li=0; li<leftover.length; li++){ eliminateForGood(leftover[li], 'redemption'); }
          state.redemption = [];
        }
        currentEp = 14;
        simulateFinals14();

        state.chart.finalized=true;
        state.simulated=true;
        State.save(state);
      }

function resetSeasonKeepCast(){
  state.episodes = {};
  state.ui = {};
  state.stats = { dailyWins:{}, elimWins:{}, elimPlays:{}, votes:{}, purgeWins:{} };
  state.chart = { finalized:false, episodes:{} };
  state.redemption = [];
  state.eliminated = [];
  state.elimInfo = {};
  state.simulated = false;
  state.lastView = null;

  for (var i=0;i<state.teams.length;i++){
    var t = state.teams[i];
    if (t) t.active = (t.role === "main");
  }

  State.save(state);
  viewCast.hidden = false;
  viewEpisode.hidden = true;
  statsPanel.style.display = "none";
  epContent.innerHTML = "";
  epActions.innerHTML = "";
  elAccordion.innerHTML = "";
  elInfoStatus.textContent = "Not simulated";

  buildTeamWraps(window.PLAYERS || []);
}

      function getSectionsForEpisode(ep){
        if(ep===1) return ["Format","Status","Opening Purge","Purge Part Two","Redemption House"];
        if(ep===3 || ep===7) return ["Status","The Draw","Redemption Challenge","House Events (1)","Purge","Redemption House"];
        if(ep===11) return ["Status","House Events (1)","The Draw","Redemption Challenge","Daily Challenge","House Events (2)","Voting","Call Out","Elimination"];
        if(ep===12) return ["Status","House Events (1)","Purge"];
        if(ep===5) return ["Status","House Events (1)","Daily Challenge","House Events (2)","Voting","Call Out","Elimination","Redemption House"];
        if(ep===9) return ["Status","House Events (1)","Daily Challenge","House Events (2)","Voting","Call Out","Elimination","Redemption House"];
        if(ep===13) return ["Status","House Events (1)","Daily Challenge","House Events (2)","Voting","Call Out","Elimination"];
        if(ep===14) return [
  "Status",
  "Final Stage 1","Final Stage 2","Final Stage 3","Final Stage 4","Final Stage 5",
  "Final Results"
];
        return ["Status","House Events (1)","Daily Challenge","House Events (2)","Voting","Call Out","Elimination","Redemption House"];
      }

      function simulateEpisode1(){
        var ep=1; var E = state.episodes[ep]={};
        var aliveTeams = getAliveTeamIdxs();
        E.status = { alive: aliveTeams.slice() };

        var ds = (window.FR_DAILIES||[]);
        var d=null; for(var i=0;i<ds.length;i++){ if(ds[i].episode===1 && ds[i].type==='purge'){ d=ds[i]; break; } }
        var weights = d && d.skillWeights ? d.skillWeights : {};
        var scored = aliveTeams.map(function(ti){ return {ti:ti, s: scoreTeam(weights, ti)}; });
        scored = shuffle(scored).sort(function(a,b){return a.s-b.s;});
        var bottom2 = scored.slice(0,2).map(function(x){return x.ti;});
        var winner = scored[scored.length-1].ti;

        E.opening_purge = { dailyId: d?d.id:null, name: d?d.name:"", description: d?d.description:"", winner:winner, purged_first: bottom2.slice(), standings: scored.slice() };
        state.stats.purgeWins[winner]=(state.stats.purgeWins[winner]||0)+1;

        var remain = aliveTeams.filter(function(ti){ return bottom2.indexOf(ti)<0 && ti!==winner; });
        var worst = null;
        if(remain.length){
          var arr = remain.map(function(tj){ return {tj:tj, r: teamCombinedRel(winner,tj)}; });
          arr.sort(function(a,b){return a.r-b.r;});
          worst = arr[0].tj;
        }
        E.purge_part_two = { chooser:winner, target:worst };

        bottom2.forEach(function(t){ moveTeamToRedemption(t); });
        if(worst!=null) moveTeamToRedemption(worst);

        E.redemption_house = { teams: state.redemption.slice(), events: genHouseEvents(state.redemption.slice()) };
      }

      function simulateStandardEpisode(ep){
        var E = state.episodes[ep] = {};
        var alive = getAliveTeamIdxs(); E.status={alive:alive.slice()};
        E.house_events_1 = genHouseEvents(alive);
        var ds=(window.FR_DAILIES||[]), d=null, i;
        for(i=0;i<ds.length;i++){ if(ds[i].episode===ep && ds[i].type==='daily'){ d=ds[i]; break; } }
        var weights = d && d.skillWeights ? d.skillWeights : {};
        var rank = alive.map(function(ti){ return {ti:ti, s: scoreTeam(weights, ti)}; });
        rank = shuffle(rank).sort(function(a,b){return a.s-b.s;});
        var power = rank[rank.length-1].ti;
        E.daily_challenge = {id:d?d.id:null, name:d?d.name:"Daily Challenge", description:d?d.description:"", power:power, standings:rank.slice()};
        state.stats.dailyWins[power]=(state.stats.dailyWins[power]||0)+1;
        E.house_events_2 = genHouseEvents(alive);
        var votes=[];
        for(i=0;i<alive.length;i++){
          var voter=alive[i];
          var pool = alive.filter(function(x){ return x!==voter && x!==power; });
          var pick = pickVoteTarget(voter, pool, power);
          if(pick==null) continue;
          votes.push({from:voter,to:pick, power:(voter===power)});
        }
        var tally={}; for(i=0;i<votes.length;i++){ var to=votes[i].to; var w=votes[i].power?2:1; tally[to]=(tally[to]||0)+w; }
        var max=0; for(var k in tally){ if(tally[k]>max) max=tally[k]; }
        var top=[]; for(k in tally){ if(tally[k]===max) top.push(+k); }
        var nominee;
        if(top.length>1){
          var scoredTop = top.map(function(t){return {t:t, r: teamCombinedRel(power,t)};});
          scoredTop.sort(function(a,b){return a.r-b.r;});
          nominee = scoredTop[0].t;
        } else nominee=+top[0];

        E.voting={votes:votes, nominee:nominee, power:power, tally:tally};
        var votersOfNominee = votes.filter(function(v){return v.to===nominee;}).map(function(v){return v.from;});
        var opponentPool = votersOfNominee.filter(function(ti){return ti!==power;});
        var opponent = null;
        if(opponentPool.length){
          opponentPool.sort(function(a,b){ return teamCombinedRel(nominee,a) - teamCombinedRel(nominee,b); });
          opponent = opponentPool[0];
        } else {
          var any = alive.filter(function(ti){return ti!==power && ti!==nominee;});
          any.sort(function(a,b){ return teamCombinedRel(nominee,a) - teamCombinedRel(nominee,b); });
          opponent = any[0] || null;
        }
        E.call_out = { nominee:nominee, voters:votersOfNominee, opponent:opponent };
        var es=(window.FR_ELIMS||[]), elim=null;
        for(i=0;i<es.length;i++){ if(es[i].episode===ep){ elim=es[i]; break; } }
        E.elimination = { id: elim?elim.id:null, name:elim?elim.name:"Elimination", description:elim?elim.description:"", weights: elim?elim.skillWeights:{} };

        if(ep===5){
          state.teams[14].active=true;
          var r5 = duelTeams(nominee, 14, {skillWeights:E.elimination.weights});
          if(r5.winner===14){
            state.teams[14].active=true;
            state.teams[14].role="main";
          } else { moveTeamToRedemption(14); }
          if(ep<=11) moveTeamToRedemption(r5.loser);
          E.elim_result={pairs:[[nominee,14]], results:[r5]};
          state.stats.elimWins[r5.winner]=(state.stats.elimWins[r5.winner]||0)+1;
          state.stats.elimPlays[nominee]=(state.stats.elimPlays[nominee]||0)+1;
        }else if(ep===9){
          state.teams[15].active=true;
          var r9a = {winner:15, loser:nominee};
          var r9b = {winner:15, loser:E.call_out.opponent};
          state.teams[15].active=true;
          state.teams[15].role="main";
          if(ep<=11){ moveTeamToRedemption(r9a.loser); moveTeamToRedemption(r9b.loser); }
          E.elim_result={pairs:[[nominee,15],[E.call_out.opponent,15]], results:[r9a,r9b]};
          state.stats.elimWins[15]=(state.stats.elimWins[15]||0)+2;
          state.stats.elimPlays[nominee]=(state.stats.elimPlays[nominee]||0)+1;
          state.stats.elimPlays[E.call_out.opponent]=(state.stats.elimPlays[E.call_out.opponent]||0)+1;
        }else{
          var r = duelTeams(nominee, opponent, {skillWeights:E.elimination.weights});
          if (ep <= 11) {
            moveTeamToRedemption(r.loser);
          } else {
            eliminateForGood(r.loser, 'main');
          }
          E.elim_result = { pairs: [[nominee, opponent]], results: [r] };
          state.stats.elimWins[r.winner]=(state.stats.elimWins[r.winner]||0)+1;
          state.stats.elimPlays[nominee]=(state.stats.elimPlays[nominee]||0)+1;
          state.stats.elimPlays[opponent]=(state.stats.elimPlays[opponent]||0)+1;
        }

        if(ep<=11 || ep===9 || ep===5 || ep===8 || ep===10){
          E.redemption_house = { teams: state.redemption.slice(), events: genHouseEvents(state.redemption.slice()) };
        }
      }

      function simulateEpisode11Tail(){
        var ep=11;
        var E = state.episodes[ep] || (state.episodes[ep]={});
        var alive = getAliveTeamIdxs();
        E.status = { alive: alive.slice() };
        var ds=(window.FR_DAILIES||[]), d=null;
        for(var i=0;i<ds.length;i++){ if(ds[i].episode===ep && ds[i].type==='daily'){ d=ds[i]; break; } }
        var weights = d && d.skillWeights ? d.skillWeights : {};
        var rank = alive.map(function(ti){ return {ti:ti, s: scoreTeam(weights, ti)}; });
        rank = shuffle(rank).sort(function(a,b){return a.s-b.s;});
        var power = rank[rank.length-1].ti;
        E.daily_challenge = {id:d?d.id:null, name:d?d.name:"Daily Challenge", description:d?d.description:"", power:power, standings:rank.slice()};
        state.stats.dailyWins[power]=(state.stats.dailyWins[power]||0)+1;
        E.house_events_2 = genHouseEvents(alive);
        var votes=[];
        for(var v=0;v<alive.length;v++){
          var voter=alive[v];
          var pool = alive.filter(function(x){ return x!==voter && x!==power; });
          var pick = pickVoteTarget(voter, pool, power);
          if(pick==null) continue;
          votes.push({from:voter,to:pick, power:(voter===power)});
        }
        var tally={}; for(var t=0;t<votes.length;t++){ var to=votes[t].to; var w=votes[t].power?2:1; tally[to]=(tally[to]||0)+w; }
        var max=0; for(var k in tally){ if(tally[k]>max) max=tally[k]; }
        var top=[]; for(k in tally){ if(tally[k]===max) top.push(+k); }
        var nominee;
        if(top.length>1){
          var scoredTop = top.map(function(ti){return {t:ti, r: teamCombinedRel(power,ti)};});
          scoredTop.sort(function(a,b){return a.r-b.r;});
          nominee = scoredTop[0].t;
        } else nominee=+top[0];

        E.voting={votes:votes, nominee:nominee, power:power, tally:tally};

        var votersOfNominee = votes.filter(function(v){return v.to===nominee;}).map(function(v){return v.from;});
        var opponentPool = votersOfNominee.filter(function(ti){return ti!==power;});
        var opponent = null;
        if(opponentPool.length){
          opponentPool.sort(function(a,b){ return teamCombinedRel(nominee,a) - teamCombinedRel(nominee,b); });
          opponent = opponentPool[0];
        } else {
          var any = alive.filter(function(ti){return ti!==power && ti!==nominee;});
          any.sort(function(a,b){ return teamCombinedRel(nominee,a) - teamCombinedRel(nominee,b); });
          opponent = any[0] || null;
        }
        E.call_out = { nominee:nominee, voters:votersOfNominee, opponent:opponent };

        var es=(window.FR_ELIMS||[]), elim=null;
        for(var i=0;i<es.length;i++){ if(es[i].episode===ep){ elim=es[i]; break; } }
        E.elimination = { id: elim?elim.id:null, name:elim?elim.name:"Elimination", description:elim?elim.description:"", weights: elim?elim.skillWeights:{} };

        var r = duelTeams(nominee, opponent, {skillWeights:E.elimination.weights});
        moveTeamToRedemption(r.loser);
        E.elim_result={pairs:[[nominee,opponent]], results:[r]};
        state.stats.elimWins[r.winner]=(state.stats.elimWins[r.winner]||0)+1;
        state.stats.elimPlays[nominee]=(state.stats.elimPlays[nominee]||0)+1;
        state.stats.elimPlays[opponent]=(state.stats.elimPlays[opponent]||0)+1;
      }

      function simulatePurgeOnly(ep){
        var E = state.episodes[ep]={};
        var alive = getAliveTeamIdxs(); E.status={alive:alive.slice()};
        E.house_events_1 = genHouseEvents(alive);

        var dp=null, ds=(window.FR_DAILIES||[]);
        for(var i=0;i<ds.length;i++){ if(ds[i].episode===ep && ds[i].type==='purge'){ dp=ds[i]; break; } }
        var weights = dp && dp.skillWeights ? dp.skillWeights : {};
        var rank = alive.map(function(ti){ return {ti:ti, s:scoreTeam(weights,ti)}; }).sort(function(a,b){return a.s-b.s;});
        var bottom = rank[0].ti;
        moveTeamToRedemption(bottom);
        E.mid_purge = { id: dp?dp.id:null, name:dp?dp.name:"", description:dp?dp.description:"", standings:rank.slice(), purged:bottom, winner:rank[rank.length-1].ti };
        state.stats.purgeWins[rank[rank.length-1].ti]=(state.stats.purgeWins[rank[rank.length-1].ti]||0)+1;
      }

      function simulateRedemptionBlock(ep, doubleCrossCount){
        var E = state.episodes[ep]={};
        var alive = getAliveTeamIdxs(); E.status={alive:alive.slice()};

        var RH = state.redemption.slice();
        E.the_draw = { teams: RH.slice(), doubleCount: doubleCrossCount, result: null, picksText: [], marks:{} };

        var available = RH.slice();
        var dcs=[];
        while(dcs.length<doubleCrossCount && available.length){
          var pick = sample(available);
          if(dcs.indexOf(pick)<0) dcs.push(pick);
          available = available.filter(function(x){return x!==pick;});
        }
        RH.forEach(function(ti){ E.the_draw.marks[ti] = (dcs.indexOf(ti)>=0) ? "XX" : "X"; });

        var matches=[]; var picksText=[];
        for(var i=0;i<dcs.length;i++){
          var options = RH.filter(function(x){return x!==dcs[i] && matches.every(function(m){return m.indexOf(x)===-1;}) && dcs.indexOf(x)===-1;});
          if(!options.length) continue;
          options.sort(function(a,b){ return teamCombinedRel(dcs[i],b) - teamCombinedRel(dcs[i],a); });
          var opp = options[0];
          matches.push([dcs[i], opp]);
          picksText.push({chooser:dcs[i], chosen:opp});
        }
        var chosenFlat={}; matches.forEach(function(m){ chosenFlat[m[0]]=true; chosenFlat[m[1]]=true; });
        RH.forEach(function(ti){ if(!chosenFlat[ti]) eliminateForGood(ti, 'redemption'); });

        E.the_draw.result = { dcs:dcs, matches:matches, eliminated: RH.filter(function(ti){return !chosenFlat[ti];}) };
        E.the_draw.picksText = picksText.slice();

        var rc=null, arrR=(window.FR_REDEMPTION||[]), i;
        for(i=0;i<arrR.length;i++){ if(arrR[i].episode===ep){ rc=arrR[i]; break; } }
        E.redemption_challenge = { name: rc?rc.name:"Redemption Challenge", description: rc?rc.description:"", matches: matches.slice(), winners:[], losers:[] };

        var winners=[], losers=[];
        for(i=0;i<matches.length;i++){
          var res = duelTeams(matches[i][0], matches[i][1], rc||{});
          winners.push(res.winner); losers.push(res.loser);
        }
        for(i=0;i<winners.length;i++){
          state.teams[winners[i]].active=true;
          state.teams[winners[i]].role="main";
          removeFromRedemption(winners[i]);
        }
        if(ep!==12){ for(i=0;i<losers.length;i++){ if(state.redemption.indexOf(losers[i])<0) state.redemption.push(losers[i]); } }
        else { for(i=0;i<losers.length;i++){ eliminateForGood(losers[i], 'redemption'); } }

        for(i=0;i<winners.length;i++){ var _ti=winners[i]; var _inf=state.elimInfo[_ti]||{}; _inf.returned=true; state.elimInfo[_ti]=_inf; }
        E.redemption_challenge.winners=winners.slice();
        E.redemption_challenge.losers=losers.slice();

        var aliveNow = getAliveTeamIdxs();
        E.house_events_1 = genHouseEvents(aliveNow);

        if(ep!==11){
          var dp=null, ds=(window.FR_DAILIES||[]);
          for(i=0;i<ds.length;i++){ if(ds[i].episode===ep && ds[i].type==='purge'){ dp=ds[i]; break; } }
          var weights = dp && dp.skillWeights ? dp.skillWeights : {};
          var rank = aliveNow.map(function(ti){ return {ti:ti, s:scoreTeam(weights,ti)}; }).sort(function(a,b){return a.s-b.s;});
          var bottom = rank[0].ti;
          moveTeamToRedemption(bottom);
          E.mid_purge = { id: dp?dp.id:null, name:dp?dp.name:"", description:dp?dp.description:"", standings:rank.slice(), purged:bottom, winner:rank[rank.length-1].ti };
        state.stats.purgeWins[rank[rank.length-1].ti]=(state.stats.purgeWins[rank[rank.length-1].ti]||0)+1;
        }

        if(ep!==12){ E.redemption_house = { teams: state.redemption.slice(), events: genHouseEvents(state.redemption.slice()) }; }
      }

      function simulateFinals14(){
        var ep=14; var E = state.episodes[ep]={};
        var alive = getAliveTeamIdxs(); E.status = { alive: alive.slice() };

        var FINAL = window.FR_FINAL||{stages:[]};
        var stages = [];
        for(var i=0;i<5;i++){
          var s = (FINAL.stages && FINAL.stages[i]) ? FINAL.stages[i] : {
            id:"S"+(i+1), name:"Final Stage "+(i+1),
            description:"Stage "+(i+1)+" checkpoint.", timeRange:[240, 900],
            timeWeights:{}, grenadePenalty:0
          };
          stages.push(s);
        }
        E.finalStages = stages;

        var playerTimes = {};
        var teamPenalty = {};
        function addPenalty(ti, seconds){ teamPenalty[ti]=(teamPenalty[ti]||0)+seconds; }
        E.stageResults = [];   // [{si, rows:[{ti,aTime,bTime,total}], standings:[ti... last->first], winner, grenade:{text,target,seconds}}]
        var stageWinners = [];

        function timeForPlayer(pid, stg){
          var range=stg.timeRange||[240,900];
          var base = range[0] + Math.random()*(range[1]-range[0]);
          var w=stg.timeWeights||{};
          var adj = 0;
          for(var k in w){ if(Object.prototype.hasOwnProperty.call(w,k)){ var v=skillOf(pid,k); adj += (-v)*(w[k]||1)*5; } }
          return clamp(Math.round(base+adj), 60, 7200);
        }

        for(var si=0; si<5; si++){
          var stg=stages[si];
          var aliveTeams = getAliveTeamIdxs();
          var rows = [];

          for(var t=0;t<aliveTeams.length;t++){
            var ti=aliveTeams[t]; var team=state.teams[ti];
            var a = timeForPlayer(team.aId, stg);
            var b = timeForPlayer(team.bId, stg);
            var pen = teamPenalty[ti]||0;
            a += pen; b += pen;
            rows.push({ti:ti, aTime:a, bTime:b, total:(a+b)});
            playerTimes[team.aId]=(playerTimes[team.aId]||0)+a;
            playerTimes[team.bId]=(playerTimes[team.bId]||0)+b;
          }

          rows.sort(function(x,y){ return y.total - x.total; });
          var winnerTeam = rows[rows.length-1].ti;
          stageWinners.push(winnerTeam);

          var grenadeInfo = null;
          if(si===1 || si===2 || si===3){
            var penaltySec = stg.grenadePenalty||0;
            var others = getAliveTeamIdxs().filter(function(x){return x!==winnerTeam;});
            if(others.length){
              others.sort(function(a,b){ return teamCombinedRel(winnerTeam,a) - teamCombinedRel(winnerTeam,b); });
              var target = others[0];
              addPenalty(target, penaltySec);
              grenadeInfo = {
                seconds: penaltySec,
                target: target,
                text: (si===1)
                  ? 'Both members must drink one "Amasi Fish Milkshake" before proceeding with the checkpoint.'
                  : (si===2)
                    ? 'Pairs are given a ten-minute time penalty added to their total time.'
                    : 'Both team members begin with their ankles chained and locked. They must unlock themselves by finding a key on a key-chain with 32 keys on it before proceeding.'
              };
            }
          }

          E.stageResults.push({
            si: si+1,
            rows: rows.slice(),
            standings: rows.map(function(r){return r.ti;}),
            winner: winnerTeam,
            grenade: grenadeInfo
          });
        }

        var aliveEnd = getAliveTeamIdxs();
        var teamTotals = aliveEnd.map(function(ti){
          var t=state.teams[ti];
          return { ti:ti, total:(playerTimes[t.aId]||0)+(playerTimes[t.bId]||0) };
        }).sort(function(a,b){ return a.total-b.total; });

        var winningTeam = teamTotals[0].ti;
        var winTeam=state.teams[winningTeam];
        var aTot = playerTimes[winTeam.aId]||0;
        var bTot = playerTimes[winTeam.bId]||0;
        var fastestIndividual = (aTot<=bTot)? winTeam.aId : winTeam.bId;

        var partner = (winTeam.aId===fastestIndividual)? winTeam.bId : winTeam.aId;
        var split = (getRel(fastestIndividual,partner) >= 1);

        E.final_results = {
          winnerTeam: winningTeam,
          fastestIndividual: fastestIndividual,
          split: split,
          teamTotals: teamTotals,
          playerTotals: playerTimes,
          stageResults: E.stageResults,
          penalties: teamPenalty
        };
      }

      function teamBoxNode(ti, opts){
        opts = opts || {};
        var colored = !!opts.colored;
        var t=state.teams[ti]; if(!t) return document.createElement("div");
        var wrap=document.createElement("div"); wrap.className="team-box"; wrap.setAttribute("data-team", String(ti));
        var bc = colored ? teamColor(ti) : "var(--glass-border)";
        wrap.style.borderColor = bc;
        if(colored){ wrap.style.boxShadow = "0 0 0 2px "+bc+" inset, 0 0 22px rgba(255,255,255,.25)"; }
        var m1=document.createElement("div"); m1.className="member";
        var i1=document.createElement("img"); i1.src=picOf(t.aId); i1.alt=nameOf(t.aId);
        var n1=document.createElement("div"); n1.className="nm"; n1.textContent=nameOf(t.aId);
        m1.appendChild(i1); m1.appendChild(n1);
        var m2=document.createElement("div"); m2.className="member";
        var i2=document.createElement("img"); i2.src=picOf(t.bId); i2.alt=nameOf(t.bId);
        var n2=document.createElement("div"); n2.className="nm"; n2.textContent=nameOf(t.bId);
        m2.appendChild(i2); m2.appendChild(n2);
        wrap.appendChild(m1); wrap.appendChild(m2);
        return wrap;
      }
      function labelPlace(node, place){
        var tag=document.createElement("div"); tag.className="place-tag"; tag.textContent=place+" Place";
        node.appendChild(tag);
      }
      function renderTeamGrid(idxArr, colored){
        var g=document.createElement("div"); g.className="team-grid";
        for(var i=0;i<idxArr.length;i++){ g.appendChild(teamBoxNode(idxArr[i], {colored: !!colored})); }
        return g;
      }
      function renderEvenGrid(idxArr, colored){
        var cols = idxArr.length<=8 ? 3 : 4;
        var g=document.createElement("div"); g.className="even-grid "+(cols===3?"cols-3":"cols-4");
        for(var i=0;i<idxArr.length;i++){ g.appendChild(teamBoxNode(idxArr[i], {colored: !!colored})); }
        return g;
      }
      function setGlowTeam(ti, cls){
        var nodes = epContent.querySelectorAll('.team-box[data-team="'+ti+'"]');
        var node = nodes.length ? nodes[nodes.length-1] : null;
        if(node) node.classList.add(cls);
      }
      function clearActions(){ epActions.innerHTML=""; }
      function oneClick(text, handler){
        var b=document.createElement("button"); b.className="btn"; b.textContent=text;
        b.onclick=function(){ if(b.disabled) return; handler(); b.disabled=true; b.style.display="none"; };
        epActions.appendChild(b);
        return b;
      }
      function proceedButton(ep, sec){
        var seq=getSectionsForEpisode(ep);
        var idx=seq.indexOf(sec);
        if(idx>=0 && idx<seq.length-1){
          var next=seq[idx+1];
          var btn=document.createElement("button"); btn.className="btn"; btn.textContent="Proceed";
          btn.onclick=function(){ showEpisodeSection(ep, next); };
          epActions.appendChild(btn);
        } else {
          if(ep<14){
            var btn2=document.createElement("button"); btn2.className="btn"; btn2.textContent="Proceed";
            btn2.onclick=function(){ showEpisodeSection(ep+1, "Status"); };
            epActions.appendChild(btn2);
          }
        }
      }
      function divWide(html){ var d=document.createElement("div"); d.className="wide-card"; d.innerHTML=html; return d; }
      function divDesc(txt){ var d=document.createElement("div"); d.className="desc-card"; d.textContent=txt; return d; }
      function teamNames(ti){ var t=state.teams[ti]; return nameOf(t.aId)+' & '+nameOf(t.bId); }

      function buildLeftAccordion(){
        elAccordion.innerHTML="";
        for(var e=1;e<=14;e++){
          var details=document.createElement("details"); details.className="details-ep"; if(e===1) details.open=true;
          var inner='<summary>Episode '+e+'</summary><div class="section-box"><div class="section-links center">';
          var sections=getSectionsForEpisode(e);
          for(var i=0;i<sections.length;i++){
            inner+='<button class="btn" data-ep="'+e+'" data-sec="'+sections[i]+'">'+sections[i]+'</button>';
          }
          inner+="</div></div>";
          details.innerHTML=inner; elAccordion.appendChild(details);
        }
        statsPanel.style.display=state.simulated?"block":"none";
        var btns = elAccordion.querySelectorAll(".section-links .btn");
        for(var i=0;i<btns.length;i++){
          btns[i].onclick=function(){
            var all=elAccordion.querySelectorAll(".section-links button");
            for(var j=0;j<all.length;j++){ all[j].classList.remove("active"); }
            this.classList.add("active");
            showEpisodeSection(+this.dataset.ep,this.dataset.sec);
          };
        }
      }

      function showEpisodeSection(ep, sec){
        state.lastView={ep:ep,section:sec}; State.save(state);
        var E=state.episodes[ep]||{};
        epTitle.textContent="Episode "+ep;
        epSub.textContent=sec;
        epContent.innerHTML=""; clearActions();
        function finalizeActions(){ proceedButton(ep, sec); }

        if(sec==="Format"){
epContent.appendChild(divWide(
  "<strong>Format:</strong> " +
  "Contestants are competing in pairs with someone they have a vendetta against (i.e. a rival or ex), who are unknown to them until they successfully survive the Opening Challenge. The elements of the game are as follows:" +
  "<br><br>" +
  "- Daily Missions: Each round, the pairs compete in a challenge. The winning team is immune from elimination and has the \"Power Vote\" in the Reckoning Vote." +
  "<br>" +
  "- Reckoning Vote: Following the Daily Mission, teams have to secretly vote one of the losing pairs for the Elimination Round. The \"Power Vote\" counts as two votes, but may only be cast on one team." +
  "<br>" +
  "- Elimination Rounds (Armageddon): At the \"Armageddon\", the results of the Reckoning Vote are revealed to the players. In the event of a tied vote, the pair holding the \"Power Vote\" hold the tie-breaking vote (but should they not be able to reach a decision, then they become the nominated pair). The teams who voted for the nominated team are also revealed, and the nominated team has to call-out a non-immune team who voted for them. The two teams then face each other in the Armageddon. The losing pair is eliminated, while the winners stay in the game." +
  "<br>" +
  "In the end, the Final Four teams compete in the Final Challenge for $1,000,000, with the winning team taking it all. Unbeknownst to the contestants until the final challenge, the person who accrues a faster time during aspects of the final challenge that are individually timed has a choice between keeping all the money to themselves or sharing it with their partner." +
  "<br><br>" +
  "- Redemption House: The \"Redemption House\" gives eliminated teams a chance to re-enter the main game. Periodically, the teams in Redemption House participate in a Double Cross Draw. The team who picked the XX Card will challenge a fellow Redemption pair to an \"Apocalypse Challenge\", while the teams not picked are officially eliminated from the game and are sent home. The winning team from the \"Apocalypse Challenge\" returns to the main game, while the losing team stays in \"Redemption House\", awaiting the next Draw & Challenge." +
  "<br>" +
  "- Purges: Some challenges are designated as Purges, where the losing team is immediately eliminated, while the winning team gains an advantage for the next Daily Mission." +
  "<br>" +
  "- Mercenaries: For some of the Elimination Rounds, the Nominated pairs have to face a Mercenary team - late entrants into the game who compete to earn their spot in the game."
));
          finalizeActions(); return;
        }


        if(sec==="Final Results"){var FR = E.final_results;
          if(!FR){ epContent.appendChild(divWide("Final results are not available.")); finalizeActions(); return; }

          var totals = FR.teamTotals.slice();

          var labels = ["4th Place","3rd Place","2nd Place","Winners"];
          var borders = ["border-red","border-bronze","border-silver","border-gold"];

          function cardForPlace(placeIdx){
  if(!Array.isArray(totals) || placeIdx<0 || placeIdx>=totals.length){
    var d=document.createElement("div"); d.className="wide-card"; d.textContent="Placement unavailable."; return d;
  }
  
            var ti = totals[placeIdx].ti;
            var card = teamBoxNode(ti,{colored:false
});
            var time = totals[placeIdx].total|0;
            var info = document.createElement("div");
            info.style.marginTop="6px";
            info.style.textAlign="center";
            info.textContent = "Total Time: " + toHMS(time);
            card.appendChild(info);
            return card;
          }

          var revealIdx = 0;
          var orderIndices = (totals && totals.length>=4) ? [3,2,1,0] : (totals||[]).map(function(_,i){return i;}).reverse();
          var revealRow = document.createElement("div");
          revealRow.className = "col-vertical";
          epContent.appendChild(revealRow);

          function makeRevealButton(){
            revealRow.innerHTML = "";
            if (revealIdx >= orderIndices.length) return;

            var btn = document.createElement("button");
            btn.className = "btn";
            btn.textContent =
              (revealIdx===0) ? "Show 4th Place" :
              (revealIdx===1) ? "Show 3rd Place" :
              (revealIdx===2) ? "Show 2nd Place" : "Show Winners";

            btn.onclick=function(){ btn.disabled=true; btn.style.display="none";
var idx  = orderIndices[revealIdx];
              if(!totals || idx==null || typeof idx==="undefined" || idx<0 || idx>=totals.length){ return; }
              var card = cardForPlace(idx);
              card.classList.add(borders[revealIdx]);
              var placeText =
                (revealIdx===0) ? "4th" :
                (revealIdx===1) ? "3rd" :
                (revealIdx===2) ? "2nd" : "1st";
              labelPlace(card, placeText);

              var hdr = document.createElement("div");
              hdr.className = "wide-card";
              hdr.innerHTML = "<strong>" + labels[revealIdx] + "</strong>";
              epContent.appendChild(hdr);
              epContent.appendChild(card);

              revealIdx++;
              if(revealIdx < orderIndices.length){
                makeRevealButton();
              } else {
                var postRow = document.createElement("div");
                postRow.className = "actions-row";
                epContent.appendChild(postRow);

                var fastestBtn = document.createElement("button");
                fastestBtn.className = "btn";
                fastestBtn.textContent = "Reveal Fastest Individual & Decision";
                fastestBtn.onclick = function(){
                  fastestBtn.disabled=true; fastestBtn.style.display="none"; if(!totals || !totals.length){ return; }
                  var wti = totals[0].ti;
                  var wt = state.teams[wti];
                  var fastestId = FR.fastestIndividual;
                  var partnerId = (wt.aId===fastestId) ? wt.bId : wt.aId;

                  var fastestCard = document.createElement("div");
                  fastestCard.className = "wide-card";
                  fastestCard.innerHTML =
                    "<div>But the player that got the best individual time is...</div>";

                  var solo = document.createElement("div");
                  solo.className = "member";

                  var img = document.createElement("img");
                  img.src = picOf(fastestId);
                  img.alt = nameOf(fastestId);
                  img.style.width = "72px";
                  img.style.height = "72px";
                  img.style.borderRadius = "50%";
                  img.style.objectFit = "cover";

                  var nm = document.createElement("div");
                  nm.className = "nm";
                  nm.textContent = fullNameOf(fastestId);

                  solo.appendChild(img);
                  solo.appendChild(nm);
                  fastestCard.appendChild(solo);
                  var prompt=document.createElement("div");
                  prompt.style.marginTop="8px";
                  prompt.innerHTML = "<strong>"+fullNameOf(fastestId)+"</strong>, you now have a decision to make. Do you want to split the $1,000,000 prize with your partner, or do you want to keep all of the money for yourself?";
                  fastestCard.appendChild(prompt);

                  var decisionBtn = document.createElement("button");
                  decisionBtn.className = "btn";
                  decisionBtn.textContent = "Reveal Decision";
                  decisionBtn.onclick = function(){
                    if (decisionBtn.disabled) return; decisionBtn.disabled = true; decisionBtn.style.display = "none"; var keep = !!FR.split;
                    var msg = document.createElement("div");
                    msg.className = "wide-card";
                    if(keep){
                      msg.innerHTML = "<strong>They choose to split the money with their partner.</strong>";
                    } else {
                      msg.innerHTML = "<strong>They choose to keep the money.</strong>";
                    }
                    epContent.appendChild(msg);
                  };

                  epContent.appendChild(fastestCard);
                  postRow.innerHTML = "";
                  postRow.appendChild(decisionBtn);
                };

                postRow.appendChild(fastestBtn);
              }
            };

            revealRow.appendChild(btn);
          }

          makeRevealButton();

          var btn = document.createElement("button");
          btn.className = "btn";
          btn.textContent = "Proceed";
          btn.onclick = function(){ showEpisodeSection(14, "Placements"); };
          epActions.appendChild(btn);

          return;
        }
    
        if(sec==="Status" && E.status){
          epContent.appendChild(renderTeamGrid(E.status.alive||[], true));
          finalizeActions(); return;
        }

        if(sec==="Opening Purge" && E.opening_purge){
          var d=E.opening_purge;
          epContent.appendChild(divWide("<strong>Opening Purge:</strong> "+(d.name||"")));
          epContent.appendChild(divDesc(d.description||""));
          oneClick("Reveal Results", function(){
            var list=document.createElement("div"); list.className="col-vertical";
            for(var i=0;i<d.standings.length;i++){
              var idx=d.standings[i].ti;
              var place = (d.standings.length - i);
              var node=teamBoxNode(idx, {colored:false}); labelPlace(node, ordinal(place));
              if(idx===d.winner) node.classList.add("glow-gold");
              if(d.purged_first.indexOf(idx)>=0) node.classList.add("glow-red");
              list.appendChild(node);
            }
            epContent.appendChild(list);
          });
          finalizeActions(); return;
        }

        if(sec==="Purge Part Two" && E.purge_part_two){
          var p2=E.purge_part_two;
          epContent.appendChild(divWide("<strong>The team that has won the Opening Purge now has the power to send another team straight to Redemption.</strong>"));
          oneClick("Reveal Winner's Choice", function(){
            if(p2.target!=null){
              var msg=document.createElement("div"); msg.className="wide-card";
              var tWin=state.teams[p2.chooser], tTar=state.teams[p2.target];
              msg.innerHTML = '<strong>'+nameOf(tWin.aId)+' & '+nameOf(tWin.bId)+'</strong> have chosen to send <strong>'+nameOf(tTar.aId)+' & '+nameOf(tTar.bId)+'</strong> to redemption.';
              epContent.appendChild(msg);
              var targetNode=teamBoxNode(p2.target, {colored:false}); targetNode.classList.add("glow-red");
              epContent.appendChild(targetNode);
            } else {
              epContent.appendChild(divWide("No valid target."));
            }
          });
          finalizeActions(); return;
        }

        if (sec === "Purge" && E.mid_purge) {
          var d = E.mid_purge;
          epContent.appendChild(divWide("<strong>Purge:</strong> " + (d.name || "")));
          epContent.appendChild(divDesc(d.description || ""));
          oneClick("Show Results", function () {
            var list = document.createElement("div");
            list.className = "col-vertical";
            for (var i = 0; i < d.standings.length; i++) {
              var idx = d.standings[i].ti;
              var place = (d.standings.length - i);
              var node = teamBoxNode(idx, { colored: false });
              labelPlace(node, ordinal(place));
              if (idx === d.purged) node.classList.add("glow-red");
              if (idx === d.winner) node.classList.add("glow-gold");
              list.appendChild(node);
            }
            epContent.appendChild(list);
          });
          finalizeActions(); return;
        }

        if(sec==="Redemption House" && E.redemption_house){
          var rTeams = E.redemption_house.teams||[];
          epContent.appendChild(renderTeamGrid(rTeams, true));
          epContent.appendChild(renderEvents(E.redemption_house.events||[]));
          finalizeActions(); return;
        }

        if(sec==="The Draw" && E.the_draw){
          var D=E.the_draw;
          epContent.appendChild(divWide("<strong>The Draw:</strong> "+(D.doubleCount===2?'Two double crosses will be drawn.':'One double cross will be drawn.')));
          var openAll=document.createElement("button"); openAll.className="btn"; openAll.textContent="Draw All";
          var grid=document.createElement("div"); grid.className="team-grid";
          var drawFns=[];
          for(var i=0;i<(D.teams||[]).length;i++){
            (function(ti){
              var cardWrap=document.createElement("div"); cardWrap.className="draw-card";
              var card=teamBoxNode(ti, {colored:false}); cardWrap.appendChild(card);
              var btn=document.createElement("button"); btn.className="btn"; btn.textContent="Draw";
              var markNode=document.createElement("div"); markNode.className="draw-mark";
              var fn=function(){
                if(btn.disabled) return;
                btn.disabled=true; btn.style.display="none";
                var mark=D.marks[ti]||"X";
                markNode.textContent=mark; cardWrap.appendChild(markNode);
                if(mark==="XX") card.classList.add("glow-gold");
              };
              drawFns.push(fn);
              btn.onclick=fn;
              cardWrap.appendChild(btn);
              grid.appendChild(cardWrap);
            })(D.teams[i]);
          }
          openAll.onclick=function(){ for(var j=0;j<drawFns.length;j++){ drawFns[j](); } };
          epContent.appendChild(openAll);
          epContent.appendChild(grid);

          oneClick("Reveal Choice", function(){
            for(var k=0;k<D.picksText.length;k++){
              var line = D.picksText[k];
              var txt=document.createElement("div"); txt.className="wide-card";
              txt.innerHTML = outerHTML(teamBoxNode(line.chooser,{colored:false})) + '<div style="margin:6px 0;">chose</div>' + outerHTML(teamBoxNode(line.chosen,{colored:false})) + '<div style="margin-top:6px;">as their opponents for the Redemption challenge.</div>';
              epContent.appendChild(txt);
            }
            if(D.result && D.result.eliminated && D.result.eliminated.length){
              epContent.appendChild(divWide("<strong>Eliminated Teams</strong>"));
              var elimGrid=renderTeamGrid(D.result.eliminated, false);
              for(var i=0;i<D.result.eliminated.length;i++){ setGlowTeam(D.result.eliminated[i], "glow-red"); }
              epContent.appendChild(elimGrid);
            }
          });
          finalizeActions(); return;
        }

        if(sec==="Redemption Challenge" && E.redemption_challenge){
          var rc=E.redemption_challenge;
          epContent.appendChild(divWide("<strong>Redemption Challenge:</strong> "+(rc.name||"")));
          epContent.appendChild(divDesc(rc.description||""));
          var mWrap=document.createElement("div"); mWrap.className="team-grid";
          for(var i=0;i<rc.matches.length;i++){
            var box=document.createElement("div"); box.className="matchup";
            box.innerHTML=outerHTML(teamBoxNode(rc.matches[i][0],{colored:false}))+'<div>VS</div>'+outerHTML(teamBoxNode(rc.matches[i][1],{colored:false}));
            mWrap.appendChild(box);
          }
          epContent.appendChild(mWrap);
          oneClick("Reveal Results", function(){
            for(var i=0;i<rc.winners.length;i++){ setGlowTeam(rc.winners[i],"glow-green"); }
            for(var j=0;j<rc.losers.length;j++){ setGlowTeam(rc.losers[j],"glow-red"); }
            var lines=[];
            for(i=0;i<rc.winners.length;i++){
              var t=state.teams[rc.winners[i]];
              lines.push('<strong>'+nameOf(t.aId)+' & '+nameOf(t.bId)+'</strong> have won the Redemption Challenge and are coming back into the game.');
            }
            epContent.appendChild(divWide(lines.join('<br>')));
          });
          finalizeActions(); return;
        }

        function renderFinalStage(si){
          var stage = (E.finalStages||[])[si-1] || {name:"Final Stage "+si, description:""};
          epContent.appendChild(divWide("<strong>"+stage.name+"</strong>"));
          epContent.appendChild(divDesc(stage.description||""));
          var SR = (E.stageResults||[]).find(function(x){return x.si===si;});
          oneClick("Show Results", function(){
            if(!SR){ epContent.appendChild(divWide("No results.")); return; }
            var list=document.createElement("div"); list.className="col-vertical";
            for(var i=0;i<SR.rows.length;i++){
              var row=SR.rows[i];
              var node=teamBoxNode(row.ti,{colored:false});
              var detail=document.createElement("div");
              detail.style.marginTop="6px";
var place = (SR.rows.length - i);
detail.innerHTML =
  '<div><em>Team total:</em> ' + toHMS(row.total) + ' — ' + ordinal(place) + ' Place</div>'+
  '<div>' + nameOf(state.teams[row.ti].aId) + ': ' + toHMS(row.aTime) + '<br>' +
             nameOf(state.teams[row.ti].bId) + ': ' + toHMS(row.bTime) + '</div>';
              node.appendChild(detail);
              list.appendChild(node);
            }
            epContent.appendChild(list);

            if(SR.grenade){
              var gNote = document.createElement("div"); gNote.className="wide-card";
              var tgt = SR.grenade.target;
              gNote.innerHTML =
                '<div style="margin-bottom:6px;"><strong>Grenade:</strong> '+SR.grenade.text+'</div>'+
                '<div>The winners of this stage have assigned the penalty to:</div>'+
                outerHTML(teamBoxNode(tgt,{colored:false}))+
'<div style="margin-top:6px;"><em>Time penalty added:</em> ' + toHMS(SR.grenade.seconds) + '</div>';
              epContent.appendChild(gNote);
            }
          });
        }

        if(/^Final Stage \d+$/.test(sec)){
          var si = parseInt(sec.split(" ").pop(),10);
          renderFinalStage(si);
          finalizeActions(); return;
        }

        if(sec==="Placements_OLD" && E.final_results){
          var FR = E.final_results;
          var totals = FR.teamTotals.slice();
          function cardForPlace(placeIdx){
            var ti = totals[placeIdx].ti;
            var card = teamBoxNode(ti,{colored:false});
            var time = totals[placeIdx].total|0;
            var t = state.teams[ti];
            var aTot = FR.playerTotals[t.aId]|0;
            var bTot = FR.playerTotals[t.bId]|0;
            var info = document.createElement("div");
            info.style.marginTop="6px";
if(placeIdx===0){
  info.innerHTML = '<div><em>Total Team Time:</em> ' + toHMS(time) + '</div>';
}else{
  info.innerHTML = '<div><em>Total Team Time:</em> ' + toHMS(time) + '</div>'+
                   '<div>' + nameOf(t.aId) + ': ' + toHMS(aTot) + '<br>' +
                           nameOf(t.bId) + ': ' + toHMS(bTot) + '</div>';}
            card.appendChild(info);
            return card;
          }

          var orderIndices = (totals && totals.length>=4) ? [3,2,1,0] : (totals||[]).map(function(_,i){return i;}).reverse();
          var labels = ["4th Place","3rd Place","2nd Place","Winners"];
          var borders = ["border-red","border-bronze","border-silver","border-gold"];
          var revealIdx = 0;

var revealRow = document.createElement("div");
revealRow.className = "actions-row";
epContent.appendChild(revealRow);

function makeRevealButton(){
  revealRow.innerHTML = "";
  if (revealIdx >= orderIndices.length) return;

  var btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent =
    (revealIdx===0) ? "Show 4th Place" :
    (revealIdx===1) ? "Show 3rd Place" :
    (revealIdx===2) ? "Show 2nd Place" : "Show Winners";

  btn.onclick=function(){ btn.disabled=true; btn.style.display="none";
var idx  = orderIndices[revealIdx];
    if(!totals || idx==null || typeof idx==="undefined" || idx<0 || idx>=totals.length){ return; }
              var card = cardForPlace(idx);
    card.classList.add(borders[revealIdx]);
var placeText =
  (revealIdx===0) ? "4th" :
  (revealIdx===1) ? "3rd" :
  (revealIdx===2) ? "2nd" : "1st";
labelPlace(card, placeText);

    var hdr = document.createElement("div");
    hdr.className = "wide-card";
    hdr.innerHTML = "<strong>" + labels[revealIdx] + "</strong>";

    epContent.appendChild(hdr);
    epContent.appendChild(card);

revealIdx++;

if (revealIdx >= orderIndices.length) {
  var postRow = document.createElement("div");
  postRow.className = "actions-row";
  epContent.appendChild(postRow);

  var fastestBtn = document.createElement("button");
  fastestBtn.className = "btn";
  fastestBtn.textContent = "Reveal Fastest Individual & Decision";
  fastestBtn.onclick = function(){
    if(!totals || !totals.length){ return; }
                  var wti = totals[0].ti;
    var wt = state.teams[wti];
    var fastestId = FR.fastestIndividual;
    var partnerId = (wt.aId===fastestId) ? wt.bId : wt.aId;

    var fastestCard = document.createElement("div");
    fastestCard.className = "wide-card";
fastestCard.innerHTML =
  "<div>But the player that got the best individual time is...</div>";
var solo = document.createElement("div");
solo.className = "member";

var img = document.createElement("img");
img.src = picOf(fastestId);
img.alt = nameOf(fastestId);
img.style.width = "72px";
img.style.height = "72px";
img.style.borderRadius = "50%";
img.style.objectFit = "cover";

var nm = document.createElement("div");
nm.className = "nm";
nm.textContent = fullNameOf(fastestId);

solo.appendChild(img);
solo.appendChild(nm);
fastestCard.appendChild(solo);
var prompt = document.createElement("div");
prompt.style.marginTop = "6px";
prompt.textContent = fullNameOf(fastestId) + ", do you want to split the money with your partner or do you want to keep the money to yourself?";
fastestCard.appendChild(prompt);
    epContent.appendChild(fastestCard);
    var decisionBtn = document.createElement("button");
    decisionBtn.className = "btn";
    decisionBtn.textContent = "Reveal Decision";
    decisionBtn.onclick = function(){
      if (decisionBtn.disabled) return; decisionBtn.disabled = true; decisionBtn.style.display = "none"; var rel = getRel(fastestId, partnerId);
      var split = (rel >= 1);
      var quote = split
        ? "\"I want to split the money with my partner. I wouldn't be here if it wasn't for them.\""
        : "\"We are rivals for a reason, and I don't think we'll ever be friends. I'm keeping the money.\"";
      epContent.appendChild(divWide("<em>"+quote+"</em>"));
    };

    postRow.innerHTML = "";
    postRow.appendChild(decisionBtn);
  };

  postRow.appendChild(fastestBtn);

} else {
  makeRevealButton();
}
  };

  revealRow.appendChild(btn);
}          

makeRevealButton();

          finalizeActions(); return;
        }

        
        if(sec==="Placements"){
          var FR = E.final_results;
          if(!FR){ epContent.appendChild(divWide("Final results are not available.")); finalizeActions(); return; }
          var totals = (FR.teamTotals && FR.teamTotals.slice()) || [];
          if(!totals.length){ epContent.appendChild(divWide("No placements available.")); finalizeActions(); return; }

          function placementEpNum(ti){
      var info = state.elimInfo && state.elimInfo[ti];
      if(!info) return -1;
      if(info.returned){
        if(typeof info.finalEp === 'number' && info.finalContext === 'main') return info.finalEp;
        if(typeof info.lastEp === 'number') return info.lastEp;
        if(typeof info.firstEp === 'number') return info.firstEp;
        return -1;
      } else {
        if(typeof info.firstEp === 'number') return info.firstEp;
        if(typeof info.lastEp === 'number') return info.lastEp;
        if(typeof info.finalEp === 'number' && info.finalContext === 'main') return info.finalEp;
        return -1;
      }
    }
    function badgeInside(card, text){
            var b = document.createElement("div");
            b.className = "place-tag";
            b.textContent = text;
            card.appendChild(b);
          }

          if(totals[0]){
            var winnersCard = teamBoxNode(totals[0].ti, { colored:false });
            winnersCard.classList.add("border-gold","glow-gold");
            badgeInside(winnersCard, "Winners");
            epContent.appendChild(winnersCard);
          }

          if(totals.length>=4){
            var row234 = document.createElement("div");
            row234.className = "even-grid cols-3";
            var second = teamBoxNode(totals[1].ti, { colored:false }); second.classList.add("border-silver"); second.classList.add("glow-silver"); badgeInside(second,"2nd Place");
            var third  = teamBoxNode(totals[2].ti, { colored:false }); third.classList.add("border-bronze"); third.classList.add("glow-bronze"); badgeInside(third,"3rd Place");
            var fourth = teamBoxNode(totals[3].ti, { colored:false }); fourth.classList.add("border-red"); fourth.classList.add("glow-red");    badgeInside(fourth,"4th Place");
            row234.appendChild(second); row234.appendChild(third); row234.appendChild(fourth);
            epContent.appendChild(row234);
          }

          function placementLabel(ti){
            var info = (state.elimInfo && state.elimInfo[ti]) || null;
            if(!info) return "Episode —";
            var epNum = null;
            if(info.returned){
              if (typeof info.finalEp === "number" && info.finalContext === "main") epNum = info.finalEp;
              else if (typeof info.lastEp === "number") epNum = info.lastEp;
              else if (typeof info.firstEp === "number") epNum = info.firstEp;
            } else {
              if (typeof info.firstEp === "number") epNum = info.firstEp;
              else if (typeof info.lastEp === "number") epNum = info.lastEp;
              else if (typeof info.finalEp === "number" && info.finalContext === "main") epNum = info.finalEp;
            }
            return (epNum!=null) ? ("Episode " + epNum) : "Episode —";
          }

          var finalists = totals.map(function(x){ return x.ti; });
          var elimList = (state.eliminated||[]).slice().reverse();
          var allTis=[]; for(var i=0;i<state.teams.length;i++){ var t=state.teams[i]; if(t && t.aId && t.bId) allTis.push(i); }
          var shown={}; var ordered=[];

          elimList.forEach(function(ti){ if(finalists.indexOf(ti)<0 && !shown[ti]){ shown[ti]=true; ordered.push(ti); }});

          allTis.forEach(function(ti){ if(finalists.indexOf(ti)<0 && !shown[ti]){ shown[ti]=true; ordered.push(ti); }});

          if (ordered.length) {
            var rows = ordered.map(function(ti){ return { ti: ti, ep: placementEpNum(ti) }; });
            rows.sort(function(a,b){ return (b.ep - a.ep); });

            var grid = document.createElement("div");
            grid.className = "even-grid cols-3";
            rows.forEach(function(row){
              var card = teamBoxNode(row.ti, { colored:false });
              var label = (row.ep >= 0) ? ("Episode " + row.ep) : "Episode —";
              var tag = document.createElement("div"); tag.className = "place-tag"; tag.textContent = label;
              card.appendChild(tag);
              grid.appendChild(card);
            });
            epContent.appendChild(grid);
          }

          var btn=document.createElement("button"); btn.className="btn"; btn.textContent="Proceed";
          btn.onclick=function(){ showEpisodeSection(14,"Season Chart"); };
          epActions.appendChild(btn);

          return;
        }

        if(sec==="Other Statistics"){
  var dailyWins = state.stats.dailyWins||{};
  var purgeWins = state.stats.purgeWins||{};
  var elimWins  = state.stats.elimWins ||{};
  var redemptionCount = {};
  for(var eId in state.episodes){
    var Ep=state.episodes[eId];
    if(Ep && Ep.redemption_house && Array.isArray(Ep.redemption_house.teams)){
      Ep.redemption_house.teams.forEach(function(ti){
        redemptionCount[ti]=(redemptionCount[ti]||0)+1;
  finalizeActions(); return;
});
    }
  }

  function byCountDesc(map){
    var arr=[];
    for(var k in map){ arr.push({ti:+k, v:(map[k]|0)}); }
    arr = arr.filter(function(x){return x.v>0;}).sort(function(a,b){ return b.v-a.v; });
    return arr;
  }
  function linesGrouped(arr){
    if(!arr.length) return ["—"];
    var groups = {};
    arr.forEach(function(x){
      groups[x.v] = groups[x.v] || [];
      groups[x.v].push(x.ti);
    });
    var out=[];
    Object.keys(groups).sort(function(a,b){return (+b)-(+a);}).forEach(function(v){
      var names = groups[v].map(function(ti){
        var t=state.teams[ti];
        return nameOf(t.aId)+" & "+nameOf(t.bId);
      }).join(", ");
      out.push(v+": "+names);
    });
    return out;
  }
  function statBox(title, arr){
    var box=document.createElement("div");
    box.className="panel";
    box.style.minWidth="260px";
    var html="<strong>"+title+"</strong>";
    linesGrouped(arr).forEach(function(line){
      html += "<div style='margin-top:4px;'>"+line+"</div>";
    });
    box.innerHTML=html;
    return box;
  }

  var wrap=document.createElement("div");
  wrap.style.display="grid";
  wrap.style.gridTemplateColumns="repeat(auto-fit, minmax(260px,1fr))";
  wrap.style.gap="12px";

  wrap.appendChild( statBox("Most Daily Challenge Wins", byCountDesc(dailyWins)) );
  wrap.appendChild( statBox("Most Purge Wins", byCountDesc(purgeWins)) );
  wrap.appendChild( statBox("Most Elimination Wins", byCountDesc(elimWins)) );
  wrap.appendChild( statBox("Most Episodes in Redemption", byCountDesc(redemptionCount)) );

  epContent.appendChild(wrap);
  finalizeActions(); return;
}

        if(sec==="Season Chart"){
          var open=document.createElement("button"); open.className="btn"; open.textContent="Open Season Chart";
          open.onclick=function(){ window.location.href="./season_chart.html"; };
          epContent.appendChild(open);
          finalizeActions(); return;
        }

        if(sec==="Daily Challenge" && E.daily_challenge){
          var dE=E.daily_challenge;
          epContent.appendChild(divWide("<strong>Daily Challenge:</strong> "+(dE.name||"")));
          epContent.appendChild(divDesc(dE.description||""));
          oneClick("Reveal Results", function(){
            var list=document.createElement("div"); list.className="col-vertical";
            for(var i=0;i<dE.standings.length;i++){
              var idx=dE.standings[i].ti;
              var place = (dE.standings.length - i);
              var node=teamBoxNode(idx, {colored:false}); labelPlace(node, ordinal(place));
              if(idx===dE.power) node.classList.add("glow-gold");
              list.appendChild(node);
            }
            epContent.appendChild(list);
          });
          finalizeActions(); return;
        }

        if(sec==="House Events (1)" && E.house_events_1){
          epContent.appendChild(renderEvents(E.house_events_1));
          finalizeActions(); return;
        }
        if(sec==="House Events (2)" && E.house_events_2){
          epContent.appendChild(renderEvents(E.house_events_2));
          finalizeActions(); return;
        }

        if(sec==="Voting" && E.voting){
          var V=E.voting;
          var vWrap=document.createElement("div"); vWrap.className="col-vertical";
          for(var i=0;i<V.votes.length;i++){
            var row=document.createElement("div"); row.className="vote-card";
            var from=teamBoxNode(V.votes[i].from,{colored:false}); if(V.votes[i].power) from.classList.add("glow-gold");
            row.appendChild(from);
            var arr=document.createElement("div"); arr.textContent="→";
            row.appendChild(arr);
            var to=teamBoxNode(V.votes[i].to,{colored:false}); to.classList.add("glow-red");
            row.appendChild(to);
            vWrap.appendChild(row);
          }
          epContent.appendChild(vWrap);

          var powerTeam=teamBoxNode(V.power,{colored:false}); powerTeam.classList.add("glow-gold");
          var note=document.createElement("div"); note.className="wide-card";
          note.innerHTML = outerHTML(powerTeam) + '<div style="margin-top:6px;"><em>'+teamNames(V.power)+' have a double vote as the Power Team.</em></div>';
          epContent.appendChild(note);

          var nb=teamBoxNode(V.nominee,{colored:false}); nb.classList.add("glow-red");
          var nom=document.createElement("div"); nom.className="wide-card"; nom.innerHTML="<strong>Nominee</strong>";
          nom.appendChild(nb); epContent.appendChild(nom);
          finalizeActions(); return;
        }

        if(sec==="Call Out" && E.call_out){
          var C=E.call_out;
          var top = teamBoxNode(C.nominee,{colored:false}); top.classList.add("glow-red"); epContent.appendChild(top);
          var rest = (E.status && E.status.alive ? E.status.alive : []).filter(function(ti){return ti!==C.nominee;});
          var g=document.createElement("div"); g.className="even-grid cols-3";
          for(var i=0;i<rest.length;i++){ g.appendChild(teamBoxNode(rest[i], {colored:false})); }
          epContent.appendChild(g);
          oneClick("Show Votes", function(){
            var v=(C.voters||[]);
            for(var i=0;i<v.length;i++){ setGlowTeam(v[i], "glow-white"); }
          });
          oneClick("Reveal Call-Out", function(){
            var opp = C.opponent;
            setGlowTeam(opp, "glow-red");
            var msg=document.createElement("div"); msg.className="wide-card";
            msg.innerHTML = outerHTML(teamBoxNode(C.nominee,{colored:false})) + '<div style="margin:6px 0;">have chosen to call-out</div>' + outerHTML(teamBoxNode(opp,{colored:false}));
            epContent.appendChild(msg);
          });
          finalizeActions(); return;
        }

        if(sec==="Elimination" && E.elimination){
          var M=E.elimination;

          if(ep===5){
            epContent.appendChild(divWide("You will not face the chosen team. Instead, you'll face... them!"));
            var mercBox5 = teamBoxNode(14,{colored:false});
            epContent.appendChild(mercBox5);
            epContent.appendChild(divWide("These are the Mercenaries. If the Mercenary Team wins, they will enter the game."));
          }
          if(ep===9){
            epContent.appendChild(divWide("You will not face each other. Instead, you'll face... them!"));
            var mercBox9 = teamBoxNode(15,{colored:false});
            epContent.appendChild(mercBox9);
            epContent.appendChild(divWide("These are the Mercenaries. If the Mercenary Team wins both elimination rounds, they will enter the game."));
          }

          epContent.appendChild(divWide("<strong>Elimination:</strong> "+M.name));
          epContent.appendChild(divDesc(M.description));
          if(E.elim_result && E.elim_result.pairs){
            for(var i=0;i<E.elim_result.pairs.length;i++){
              var p=E.elim_result.pairs[i];
              var box=document.createElement("div"); box.className="matchup";
              box.innerHTML=outerHTML(teamBoxNode(p[0],{colored:false}))+'<div>VS</div>'+outerHTML(teamBoxNode(p[1],{colored:false}));
              epContent.appendChild(box);
            }
          }
          oneClick("Reveal Results", function(){
            if(E.elim_result && E.elim_result.results){
              for(var i=0;i<E.elim_result.results.length;i++){
                setGlowTeam(E.elim_result.results[i].winner,"glow-green");
                setGlowTeam(E.elim_result.results[i].loser,"glow-red");
              }
            }
          });
          finalizeActions(); return;
        }

        epContent.appendChild(divWide("Section not simulated."));
        finalizeActions();
      }

      function showStatisticsPanel(which){
        if(which==="chart"){ window.open("./season_chart.html","_blank"); return; }
        var dlg = document.getElementById("times-panel");
        timesTable.innerHTML = "<div class='wide-card'>Statistics view coming from your engine.</div>";
        dlg.showModal();
      }

      (function init(){
        var src=window.PLAYERS||[];
        if(!Array.isArray(src)||!src.length){ elDataWarn.style.display="block"; } else { elDataWarn.style.display="none"; }
        buildFilterShows(src); buildTeamWraps(src);
        elInfoSeed.textContent=state.seed;

        document.getElementById("btn-profiles").onclick=function(){ location.href="./profiles.html"; };
        document.getElementById("btn-relationships").onclick=function(){ location.href="./relationships.html"; };
        document.getElementById("goto-chart").onclick=function(){ showEpisodeSection(14,"Season Chart"); };
        document.getElementById("goto-placements").onclick=function(){ showEpisodeSection(14,"Placements"); };
        document.getElementById("goto-stats").onclick=function(){ showEpisodeSection(14,"Other Statistics"); };
        document.getElementById("btn-reset-session").onclick=function(){ State.clear(); location.reload(); };
var btnBackCast = document.getElementById("btn-back-cast");
if (btnBackCast){
  btnBackCast.addEventListener("click", function(e){
    e.preventDefault();
    resetSeasonKeepCast();
  });
}

        document.getElementById("btn-simulate").onclick=function(){
          if(state.simulated){
            buildLeftAccordion();
            viewCast.hidden=true; viewEpisode.hidden=false;
            var last=state.lastView||{ep:1,section:"Status"};
            showEpisodeSection(last.ep,last.section);
            elInfoStatus.textContent="Simulated";
            statsPanel.style.display="block";
            return;
          }
          var filled = state.teams.every(function(t){ return t.aId && t.bId; });
          if(!filled){ alert("Please fill all 16 teams first."); return; }
          simulateWholeSeason();
          buildLeftAccordion();
          viewCast.hidden=true; viewEpisode.hidden=false;
          showEpisodeSection(1,"Format");
          elInfoStatus.textContent="Simulated";
          statsPanel.style.display="block";
        };

document.getElementById("btn-randomize").onclick = openRandomizeModal;
        document.getElementById("btn-reset-cast").onclick=function(){
          for(var i=0;i<16;i++){ state.teams[i].aId=null; state.teams[i].bId=null; state.teams[i].active=(i<14); }
          state.redemption=[]; state.eliminated=[]; State.save(state); buildTeamWraps(window.PLAYERS||[]);
        };

        if(state.simulated){
          buildLeftAccordion(); viewCast.hidden=true; viewEpisode.hidden=false;
          var last=state.lastView||{ep:1,section:"Status"}; showEpisodeSection(last.ep,last.section);
          elInfoStatus.textContent="Simulated"; statsPanel.style.display="block";
        }
      })();

    }); // DOMContentLoaded
  })();