import { useState, useEffect, useRef } from "react";
import trophy from "./assets/hands-trophy.png";
const BG = "#EBEBEB";
const SHADOW_OUT = "6px 6px 14px #c8c8c8, -4px -4px 10px #ffffff";
const SHADOW_IN = "inset 4px 4px 10px #c8c8c8, inset -3px -3px 8px #ffffff";
const DARK = "#3D3D3D";
const NAVY = "#00205B";
const RED = "#C8102E";
const GREEN = "#009A44";

const SCREENS = {
  SPLASH:"splash", LOGIN:"login", HOME:"home",
  BOARDS:"boards", PREDICTIONS:"predictions",
  INSTANT_PICK:"instant_pick",
  FAST_PREDICTION:"fast_prediction",
  LEADERBOARD:"leaderboard", STATS:"stats", ACCOUNT:"account",
  GROUPS_SCHEDULE:"groups_schedule",
  RULES:"rules",
};

const INITIAL_BOARDS = [{ id:"global", label:"🌍", name:"Global Board", members:48291, isGlobal:true }];
const AVAILABLE_BOARDS = [
  { id:"fc-prieteni", label:"⚽", name:"FC Prieteni 2026", members:8, max:10, type:"private" },
  { id:"birou", label:"💼", name:"Birou Fotbal", members:6, max:10, type:"private" },
  { id:"romania", label:"🇷🇴", name:"Romania Bate!", members:312, max:null, type:"public" },
];
const BOARD_LEADERS = {
  global: [
    { rank:1, name:"Alex", pts:342, prize:"250 lei", emoji:"🥇", accent:"#FFF3DC" },
    { rank:2, name:"Maria", pts:318, prize:"150 lei", emoji:"🥈", accent:BG },
    { rank:3, name:"David", pts:295, prize:"100 lei", emoji:"🥉", accent:"#F5EDE0" },
    { rank:4, name:"Andreea V.", pts:271, accent:BG },
    { rank:5, name:"Bogdan C.", pts:248, accent:BG },
    { rank:7, name:"Tu (You)", pts:201, accent:"#E8F0FF", isMe:true },
  ],
};

const LANGS = [{ code:"en", flag:"🇬🇧", name:"English" },{ code:"ro", flag:"🇷🇴", name:"Romana" },{ code:"fr", flag:"🇫🇷", name:"Francais" }];
const T = {
  en:{ location:"USA, Canada & Mexico", cta:"Make Your Prediction", days:"DAYS", hours:"HOURS", minutes:"MINUTES", seconds:"SECONDS", footerHome:"Home", footerStats:"Groups", footerFast:"Instant Pick ⚡", footerAccount:"Account" },
  ro:{ location:"SUA, Canada & Mexic", cta:"Fa-ti Predictia", days:"ZILE", hours:"ORE", minutes:"MIN", seconds:"SEC", footerHome:"Acasa", footerStats:"Grupe", footerFast:"Instant Pick ⚡", footerAccount:"Cont" },
  fr:{ location:"USA, Canada & Mexique", cta:"Faites vos Pronostics", days:"JOURS", hours:"HEURES", minutes:"MIN", seconds:"SEC", footerHome:"Accueil", footerStats:"Groups", footerFast:"Instant Pick ⚡", footerAccount:"Compte" },
};

const ECHIPE_DATA = {
  A:["Brazil","France","Mexico","Morocco"],
  B:["Argentina","England","USA","Poland"],
  C:["Spain","Portugal","Japan","Canada"],
  D:["Germany","Netherlands","Senegal","Australia"],
  E:["Belgium","Croatia","Serbia","Morocco"],
  F:["Denmark","Tunisia","Australia","France"],
};
const FLAGS = {
  "Brazil":"🇧🇷","France":"🇫🇷","Mexico":"🇲🇽","Morocco":"🇲🇦",
  "Argentina":"🇦🇷","England":"🏴󠁧󠁢󠁥󠁧󠁿","USA":"🇺🇸","Poland":"🇵🇱",
  "Spain":"🇪🇸","Portugal":"🇵🇹","Japan":"🇯🇵","Canada":"🇨🇦",
  "Germany":"🇩🇪","Netherlands":"🇳🇱","Senegal":"🇸🇳","Australia":"🇦🇺",
  "Belgium":"🇧🇪","Croatia":"🇭🇷","Serbia":"🇷🇸",
  "Denmark":"🇩🇰","Tunisia":"🇹🇳","Iran":"🇮🇷","South Korea":"🇰🇷",
  "Ecuador":"🇪🇨","Cameroon":"🇨🇲","Qatar":"🇶🇦","Costa Rica":"🇨🇷",
};

// Mock real final standings per group — replace with API later
const REAL_STANDINGS = {
  A: ["France","Brazil","Mexico","Morocco"],
  B: ["England","Argentina","USA","Poland"],
  C: ["Spain","Canada","Japan","Portugal"],
  D: ["Netherlands","Germany","Senegal","Australia"],
  E: ["Croatia","Belgium","Iran","Serbia"],
  F: ["Denmark","Ecuador","Tunisia","Cameroon"],
};
const GROUP_STAGE_FINISHED = true; // flip to true to show comparison

// Team dominant colors [primary, secondary]
const TEAM_COLORS = {
  "Brazil":     ["#009C3B","#FFDF00"],
  "France":     ["#002395","#ED2939"],
  "Mexico":     ["#006847","#CE1126"],
  "Morocco":    ["#C1272D","#006233"],
  "Argentina":  ["#74ACDF","#FFFFFF"],
  "England":    ["#FFFFFF","#CF081F"],
  "USA":        ["#002868","#BF0A30"],
  "Poland":     ["#FFFFFF","#DC143C"],
  "Spain":      ["#AA151B","#F1BF00"],
  "Portugal":   ["#006600","#FF0000"],
  "Japan":      ["#FFFFFF","#BC002D"],
  "Canada":     ["#FF0000","#FFFFFF"],
  "Germany":    ["#000000","#DD0000"],
  "Netherlands":["#FF4F00","#003DA5"],
  "Senegal":    ["#00853F","#FDEF42"],
  "Australia":  ["#00843D","#FFCD00"],
  "Belgium":    ["#000000","#FAE042"],
  "Croatia":    ["#171796","#FF0000"],
  "Serbia":     ["#C6363C","#0C4076"],
  "Iran":       ["#239F40","#DA0000"],
  "Denmark":    ["#C60C30","#FFFFFF"],
  "Tunisia":    ["#E70013","#FFFFFF"],
  "Ecuador":    ["#FFD100","#003893"],
  "Cameroon":   ["#007A5E","#CE1126"],
};

// Week unlock logic — Sunday after 20:00
const now = new Date();
const june = (d) => new Date(2026, 5, d, 20, 0, 0);
const WEEK_UNLOCKED = {
  8:  true,                    // always open
  15: now >= june(14),         // Sun June 14 after 20:00
  22: now >= june(21),         // Sun June 21
  29: now >= june(28),         // Sun June 28
};
const isWeekUnlocked = (day) => {
  if(day >= 29) return WEEK_UNLOCKED[29];
  if(day >= 22) return WEEK_UNLOCKED[22];
  if(day >= 15) return WEEK_UNLOCKED[15];
  return WEEK_UNLOCKED[8];
};

// Mock live scores — replace with real API later
// All matches not started yet — will be populated by real API
const LIVE_SCORES = {};

const CALENDAR_EVENTS = [
  // Week 1: June 8-14
  {day:11,matches:[{home:"Brazil",homeFlag:"🇧🇷",away:"Morocco",awayFlag:"🇲🇦",time:"19:00",group:"A"},{home:"France",homeFlag:"🇫🇷",away:"Mexico",awayFlag:"🇲🇽",time:"22:00",group:"A"}]},
  {day:12,matches:[{home:"Argentina",homeFlag:"🇦🇷",away:"Poland",awayFlag:"🇵🇱",time:"19:00",group:"B"},{home:"England",homeFlag:"🏴󠁧󠁢󠁥󠁧󠁿",away:"USA",awayFlag:"🇺🇸",time:"22:00",group:"B"}]},
  {day:13,matches:[{home:"Spain",homeFlag:"🇪🇸",away:"Canada",awayFlag:"🇨🇦",time:"19:00",group:"C"},{home:"Portugal",homeFlag:"🇵🇹",away:"Japan",awayFlag:"🇯🇵",time:"22:00",group:"C"}]},
  {day:14,matches:[{home:"Germany",homeFlag:"🇩🇪",away:"Australia",awayFlag:"🇦🇺",time:"19:00",group:"D"},{home:"Netherlands",homeFlag:"🇳🇱",away:"Senegal",awayFlag:"🇸🇳",time:"22:00",group:"D"}]},
  // Week 2: June 15-21
  {day:15,matches:[{home:"Brazil",homeFlag:"🇧🇷",away:"France",awayFlag:"🇫🇷",time:"19:00",group:"A"},{home:"Mexico",homeFlag:"🇲🇽",away:"Morocco",awayFlag:"🇲🇦",time:"22:00",group:"A"}]},
  {day:16,matches:[{home:"USA",homeFlag:"🇺🇸",away:"Argentina",awayFlag:"🇦🇷",time:"19:00",group:"B"},{home:"Poland",homeFlag:"🇵🇱",away:"England",awayFlag:"🏴󠁧󠁢󠁥󠁧󠁿",time:"22:00",group:"B"}]},
  {day:17,matches:[{home:"Belgium",homeFlag:"🇧🇪",away:"Iran",awayFlag:"🇮🇷",time:"19:00",group:"E"},{home:"Croatia",homeFlag:"🇭🇷",away:"Serbia",awayFlag:"🇷🇸",time:"22:00",group:"E"}]},
  {day:18,matches:[{home:"Denmark",homeFlag:"🇩🇰",away:"Tunisia",awayFlag:"🇹🇳",time:"19:00",group:"F"},{home:"Ecuador",homeFlag:"🇪🇨",away:"Cameroon",awayFlag:"🇨🇲",time:"22:00",group:"F"}]},
  {day:19,matches:[{home:"Japan",homeFlag:"🇯🇵",away:"Spain",awayFlag:"🇪🇸",time:"19:00",group:"C"},{home:"Canada",homeFlag:"🇨🇦",away:"Portugal",awayFlag:"🇵🇹",time:"22:00",group:"C"}]},
  {day:20,matches:[{home:"Australia",homeFlag:"🇦🇺",away:"Germany",awayFlag:"🇩🇪",time:"19:00",group:"D"},{home:"Senegal",homeFlag:"🇸🇳",away:"Netherlands",awayFlag:"🇳🇱",time:"22:00",group:"D"}]},
  // Week 3: June 22-28
  {day:22,matches:[{home:"Morocco",homeFlag:"🇲🇦",away:"France",awayFlag:"🇫🇷",time:"19:00",group:"A"},{home:"Mexico",homeFlag:"🇲🇽",away:"Brazil",awayFlag:"🇧🇷",time:"19:00",group:"A"}]},
  {day:23,matches:[{home:"Poland",homeFlag:"🇵🇱",away:"USA",awayFlag:"🇺🇸",time:"19:00",group:"B"},{home:"England",homeFlag:"🏴󠁧󠁢󠁥󠁧󠁿",away:"Argentina",awayFlag:"🇦🇷",time:"19:00",group:"B"}]},
  {day:24,matches:[{home:"Serbia",homeFlag:"🇷🇸",away:"Belgium",awayFlag:"🇧🇪",time:"19:00",group:"E"},{home:"Iran",homeFlag:"🇮🇷",away:"Croatia",awayFlag:"🇭🇷",time:"19:00",group:"E"}]},
  {day:25,matches:[{home:"Cameroon",homeFlag:"🇨🇲",away:"Denmark",awayFlag:"🇩🇰",time:"19:00",group:"F"},{home:"Tunisia",homeFlag:"🇹🇳",away:"Ecuador",awayFlag:"🇪🇨",time:"19:00",group:"F"}]},
  {day:26,matches:[{home:"Portugal",homeFlag:"🇵🇹",away:"Spain",awayFlag:"🇪🇸",time:"19:00",group:"C"},{home:"Japan",homeFlag:"🇯🇵",away:"Canada",awayFlag:"🇨🇦",time:"19:00",group:"C"}]},
  {day:27,matches:[{home:"Netherlands",homeFlag:"🇳🇱",away:"Germany",awayFlag:"🇩🇪",time:"19:00",group:"D"},{home:"Australia",homeFlag:"🇦🇺",away:"Senegal",awayFlag:"🇸🇳",time:"19:00",group:"D"}]},
  // Week 4: June 29+
  {day:29,matches:[{home:"Argentina",homeFlag:"🇦🇷",away:"France",awayFlag:"🇫🇷",time:"20:00",group:"R16"},{home:"Brazil",homeFlag:"🇧🇷",away:"England",awayFlag:"🏴󠁧󠁢󠁥󠁧󠁿",time:"20:00",group:"R16"}]},
  {day:30,matches:[{home:"Spain",homeFlag:"🇪🇸",away:"Netherlands",awayFlag:"🇳🇱",time:"20:00",group:"R16"},{home:"Germany",homeFlag:"🇩🇪",away:"Portugal",awayFlag:"🇵🇹",time:"20:00",group:"R16"}]},
];

function useCountdown() {
  const target = new Date("2026-06-11T18:00:00");
  const [diff, setDiff] = useState(target - new Date());
  useEffect(() => { const t = setInterval(() => setDiff(target - new Date()), 1000); return () => clearInterval(t); }, []);
  return { d:Math.max(0,Math.floor(diff/86400000)), h:Math.max(0,Math.floor((diff%86400000)/3600000)), m:Math.max(0,Math.floor((diff%3600000)/60000)), s:Math.max(0,Math.floor((diff%60000)/1000)) };
}

function CalendarSlider() {
  const [sel, setSel] = useState(null);
  const [weekStart, setWeekStart] = useState(8); // first visible Monday (June 8)
  const mm = {};
  CALENDAR_EVENTS.forEach(e => { mm[e.day] = e.matches; });
  const dl = ["L","M","M","J","V","S","D"];

  // weeks: each starts on a Monday
  const weeks = [8, 15, 22, 29]; // June Mondays
  const weekIdx = weeks.indexOf(weekStart);
  const days = Array.from({length:7}, (_,i) => weekStart + i).filter(d => d >= 1 && d <= 30);
  const sm = sel ? mm[sel] : null;
  const weekLabel = `${weekStart} – ${Math.min(weekStart+6,30)} Iunie`;

  return (
    <div style={{marginBottom:14}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>weekIdx>0&&setWeekStart(weeks[weekIdx-1])}
          style={{width:30,height:30,borderRadius:"50%",border:"none",
            background:weekIdx>0?BG:"transparent",
            boxShadow:weekIdx>0?SHADOW_OUT:"none",
            cursor:weekIdx>0?"pointer":"default",
            fontSize:16,color:weekIdx>0?DARK:"#ddd",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
          ‹
        </button>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{weekLabel}</p>
          <span style={{fontSize:10,color:NAVY,fontWeight:700}}>Iunie 2026 · FIFA WC</span>
        </div>
        <button onClick={()=>weekIdx<weeks.length-1&&setWeekStart(weeks[weekIdx+1])}
          style={{width:30,height:30,borderRadius:"50%",border:"none",
            background:weekIdx<weeks.length-1?BG:"transparent",
            boxShadow:weekIdx<weeks.length-1?SHADOW_OUT:"none",
            cursor:weekIdx<weeks.length-1?"pointer":"default",
            fontSize:16,color:weekIdx<weeks.length-1?DARK:"#ddd",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
          ›
        </button>
      </div>

      {/* Week dots indicator */}
      <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:10}}>
        {weeks.map((w,i)=>(
          <div key={w} onClick={()=>setWeekStart(w)}
            style={{width:i===weekIdx?18:6,height:6,borderRadius:3,cursor:"pointer",
              transition:"all 0.3s",
              background:i===weekIdx?NAVY:"#ddd"}}/>
        ))}
      </div>

      {/* Day labels */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {dl.map((d,i)=>(
          <div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:i===6?RED:"#bbb"}}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {days.map((day,i)=>{
          const isS=day===11, has=!!mm[day], isSel=sel===day, isSun=i%7===6;
          let bg="transparent", border="1.5px solid transparent", shadow="none";
          let tc=isSun?RED:"#777", fw=400;
          if(isSel){bg=`linear-gradient(135deg,${NAVY},#001840)`;shadow="0 3px 10px rgba(0,32,91,0.35)";tc="#fff";fw=800;}
          else if(isS){bg="#E8F0FF";border=`1.5px solid ${NAVY}`;tc=NAVY;fw=800;}
          else if(has){fw=700;tc=DARK;}
          return (
            <div key={day} onClick={()=>has&&(onDaySelect?onDaySelect(day):null)}
              style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",borderRadius:10,padding:"8px 2px",
                cursor:has?"pointer":"default",
                background:bg,border,boxShadow:shadow,transition:"all 0.15s"}}>
              <span style={{fontSize:13,fontWeight:fw,color:tc,lineHeight:1}}>{day}</span>
              {has&&!isSel&&<div style={{width:4,height:4,borderRadius:"50%",background:isS?NAVY:RED,marginTop:3}}/>}
              {isS&&!isSel&&(
                <div style={{position:"absolute",top:-6,right:-2,background:RED,
                  borderRadius:4,padding:"1px 4px",fontSize:7,fontWeight:800,color:"#fff"}}>
                  START
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Match popup */}
      {sm&&(
        <div style={{marginTop:10,background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"8px 14px",
            display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>{sel} Iunie · {sm.length} meciuri</span>
            <span onClick={()=>setSel(null)}
              style={{fontSize:18,color:"rgba(255,255,255,0.5)",cursor:"pointer",padding:"0 4px",lineHeight:1}}>✕</span>
          </div>
          {sm.map((m,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",padding:"10px 14px",
              borderBottom:i<sm.length-1?"1px solid rgba(0,0,0,0.06)":"none",gap:8}}>
              <span style={{fontSize:11,color:"#aaa",fontWeight:600,width:36}}>{m.time}</span>
              <span style={{fontSize:10,background:`linear-gradient(135deg,${NAVY},#001840)`,
                color:"#fff",borderRadius:5,padding:"2px 5px",fontWeight:700,flexShrink:0}}>Gr.{m.group}</span>
              <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                <span style={{fontSize:15}}>{m.homeFlag}</span>
                <span style={{fontSize:11,fontWeight:600,color:DARK}}>{m.home}</span>
                <span style={{fontSize:10,color:"#ccc"}}>vs</span>
                <span style={{fontSize:11,fontWeight:600,color:DARK}}>{m.away}</span>
                <span style={{fontSize:15}}>{m.awayFlag}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── KO COMPONENTS ────────────────────────────────────────────────────────────
function KOTeamRow({ team, pick, pairId, setKnockoutPicks }) {
  const flag = FLAGS[team] || "🏳";
  const selected = pick === team;
  const ph = !team||team.includes("W")||team.includes("L")||team.includes("3rd")||team.includes("Best")||team.includes("SF")||team.includes("QF")||team.includes("R16");
  const handleSelect = () => {
    if(!ph) setKnockoutPicks(k => ({...k, [pairId]: k[pairId]===team ? null : team}));
  };
  return (
    <div
      onClick={handleSelect}
      style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",
        cursor:ph?"default":"pointer",
        background:selected?`linear-gradient(135deg,${NAVY},#001840)`:"transparent",
        transition:"background 0.15s",opacity:pick&&!selected?0.35:1,
        touchAction:"pan-y",userSelect:"none"}}>
      <span style={{fontSize:22,width:26,textAlign:"center",flexShrink:0}}>{ph?"❓":flag}</span>
      <span style={{flex:1,fontSize:13,fontWeight:selected?700:500,color:selected?"#fff":ph?"#bbb":DARK}}>
        {ph?team:(team.length>13?team.split(" ")[0]:team)}
      </span>
      <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,
        border:selected?"none":`2px solid ${pick?"#ddd":"#bbb"}`,
        background:selected?GREEN:"transparent",
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        {selected&&<span style={{fontSize:10,color:"#fff",fontWeight:900}}>✓</span>}
      </div>
    </div>
  );
}

function KnockoutTab({ knockoutPicks, setKnockoutPicks, best3picks, groupRank, onComplete }) {
  const [koRound, setKoRound] = useState(0);
  const [groupIdx, setGroupIdx] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);

  const gT = (g,pos) => {
    if(g==="A"||g==="B") return groupRank[g]?.[pos]||`#${pos} Gr.${g}`;
    const dW={C:"Spain",D:"Germany",E:"Belgium",F:"Denmark"};
    const dR={C:"Portugal",D:"Netherlands",E:"Serbia",F:"Tunisia"};
    return pos===1?dW[g]:dR[g];
  };
  const w = id => knockoutPicks[id]||null;

  const R16=[
    {id:"r16_0",t1:gT("A",1),t2:gT("B",2)},{id:"r16_1",t1:gT("C",1),t2:gT("D",2)},
    {id:"r16_2",t1:gT("E",1),t2:best3picks[0]||"Best 3rd"},{id:"r16_3",t1:gT("F",1),t2:best3picks[1]||"Best 3rd"},
    {id:"r16_4",t1:gT("B",1),t2:gT("A",2)},{id:"r16_5",t1:gT("D",1),t2:gT("C",2)},
    {id:"r16_6",t1:gT("E",2),t2:best3picks[2]||"Best 3rd"},{id:"r16_7",t1:gT("F",2),t2:best3picks[3]||"Best 3rd"},
  ];
  const QF=[
    {id:"qf_0",t1:w("r16_0")||"R16 W1",t2:w("r16_1")||"R16 W2"},
    {id:"qf_1",t1:w("r16_2")||"R16 W3",t2:w("r16_3")||"R16 W4"},
    {id:"qf_2",t1:w("r16_4")||"R16 W5",t2:w("r16_5")||"R16 W6"},
    {id:"qf_3",t1:w("r16_6")||"R16 W7",t2:w("r16_7")||"R16 W8"},
  ];
  const SF=[
    {id:"sf_0",t1:w("qf_0")||"QF W1",t2:w("qf_1")||"QF W2"},
    {id:"sf_1",t1:w("qf_2")||"QF W3",t2:w("qf_3")||"QF W4"},
  ];
  const FINAL={id:"f_0",t1:w("sf_0")||"SF W1",t2:w("sf_1")||"SF W2"};
  const THIRD={id:"3rd_0",
    t1:w("sf_0")?(w("sf_0")===SF[0].t1?SF[0].t2:SF[0].t1):"SF L1",
    t2:w("sf_1")?(w("sf_1")===SF[1].t1?SF[1].t2:SF[1].t1):"SF L2",
  };
  const rounds=[
    {id:"r16",label:"Round of 16",pts:40,pairs:R16},
    {id:"qf",label:"Quarter-Finals",pts:60,pairs:QF},
    {id:"sf",label:"Semi-Finals",pts:90,pairs:SF},
    {id:"final",label:"Finals",pts:120,pairs:[THIRD,FINAL]},
  ];

  const cur = rounds[koRound];
  const roundComplete = cur.pairs.every(p=>knockoutPicks[p.id]);
  const isLastRound = koRound===rounds.length-1;

  const groups = [];
  for(let i=0;i<cur.pairs.length;i+=2) groups.push([cur.pairs[i], cur.pairs[i+1]||null]);
  const gi = Math.min(groupIdx, groups.length-1);
  const [pA, pB] = groups[gi];
  const pickA = knockoutPicks[pA.id]||null;
  const pickB = pB?(knockoutPicks[pB.id]||null):null;
  const groupDone = !!pickA && (pB ? !!pickB : true);
  const isLastGroup = gi === groups.length-1;

  const onTouchStart = e => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = e => {
    if(swipeStartX.current===null) return;
    const dx = swipeStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(swipeStartY.current - e.changedTouches[0].clientY);
    if(Math.abs(dx) > 50 && Math.abs(dx) > dy * 1.5) {
      if(dx > 0 && !isLastGroup) setGroupIdx(gi+1);
      else if(dx < 0 && gi > 0) setGroupIdx(gi-1);
    }
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  const changeRound = i => { setKoRound(i); setGroupIdx(0); setShowTransition(false); };

  // Transition screen between rounds
  if(showTransition) {
    const nextRound = rounds[koRound+1];
    // After SF: skip bracket, go straight to finals
    if(cur.id==="sf") {
      return (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 0 0"}}>
          <div style={{width:56,height:56,borderRadius:"50%",
            background:`linear-gradient(135deg,#D4820A,#F0A020)`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:26,margin:"0 auto 12px",boxShadow:"0 6px 18px rgba(212,130,10,0.35)"}}>🏆</div>
          <p style={{fontSize:10,color:"#D4820A",fontWeight:800,textTransform:"uppercase",letterSpacing:1,margin:"0 0 3px"}}>Semi-Finals complet</p>
          <h2 style={{fontSize:17,fontWeight:900,color:DARK,margin:"0 0 16px"}}>Finalele te asteaptă</h2>

          {/* Finala mică */}
          <div style={{width:"100%",background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:10}}>
            <div style={{background:"rgba(0,0,0,0.04)",padding:"6px 14px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
              <span style={{fontSize:10,fontWeight:800,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>🥉 Finala Mică · Locul 3</span>
            </div>
            {[0,1].map(i=>{
              const sfPair = rounds[2].pairs[i];
              const sfWinner = knockoutPicks[sfPair.id];
              const loser = sfWinner===sfPair.t1?sfPair.t2:sfPair.t1;
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                  borderBottom:i===0?"1px solid rgba(0,0,0,0.05)":"none"}}>
                  <span style={{fontSize:20}}>{FLAGS[loser]||"🏳"}</span>
                  <span style={{fontSize:13,fontWeight:600,color:DARK,flex:1}}>{loser}</span>
                  <span style={{fontSize:10,color:"#aaa"}}>perdant SF{i+1}</span>
                </div>
              );
            })}
          </div>

          {/* Finala mare */}
          <div style={{width:"100%",background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:24}}>
            <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"6px 14px"}}>
              <span style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:1}}>🏆 Finala Mare · Campion Mondial</span>
            </div>
            {[0,1].map(i=>{
              const sfWinner = knockoutPicks[rounds[2].pairs[i].id];
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                  borderBottom:i===0?"1px solid rgba(0,0,0,0.05)":"none"}}>
                  <span style={{fontSize:20}}>{sfWinner?FLAGS[sfWinner]||"🏳":"❓"}</span>
                  <span style={{fontSize:13,fontWeight:600,color:DARK,flex:1}}>{sfWinner||"SF Winner"}</span>
                  <span style={{fontSize:10,color:"#aaa"}}>castigator SF{i+1}</span>
                </div>
              );
            })}
          </div>

          <div style={{display:"flex",gap:8,width:"100%"}}>
            <button onClick={()=>setShowTransition(false)}
              style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
                background:BG,boxShadow:SHADOW_OUT,fontSize:12,fontWeight:700,cursor:"pointer",color:"#888"}}>
              ← Inapoi
            </button>
            <button onClick={()=>changeRound(koRound+1)}
              style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
                background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",
                fontSize:12,fontWeight:700,cursor:"pointer",
                boxShadow:"0 4px 12px rgba(0,32,91,0.3)"}}>
              Finale →
            </button>
          </div>
        </div>
      );
    }
    const winners = cur.pairs.map(p => knockoutPicks[p.id]).filter(Boolean);
    const roundOrder = ["r16","qf","sf","final"];
    const curRoundIdx = roundOrder.indexOf(cur.id);
    const duels = [];
    for(let i=0;i<winners.length;i+=2) duels.push([winners[i]||null,winners[i+1]||null]);
    const futureRounds = roundOrder.slice(curRoundIdx+2);
    const BC = "rgba(0,32,91,0.18)";

    const TeamSlot = ({team}) => (
      <div style={{display:"flex",alignItems:"center",gap:6,
        background:team?BG:"transparent",
        borderRadius:8,padding:"5px 8px",
        boxShadow:team?SHADOW_OUT:"none",
        border:team?"none":"1.5px dashed #ddd",
        minWidth:0}}>
        <span style={{fontSize:15,flexShrink:0}}>{team?(FLAGS[team]||"🏳"):"❓"}</span>
        <span style={{fontSize:10,fontWeight:team?700:400,color:team?DARK:"#bbb",
          overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:54}}>
          {team?(team.length>8?team.split(" ")[0]:team):"?"}
        </span>
      </div>
    );

    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 0 0"}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:"50%",
            background:`linear-gradient(135deg,${GREEN},#007A36)`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:26,margin:"0 auto 10px",boxShadow:"0 6px 18px rgba(0,154,68,0.35)"}}>✅</div>
          <p style={{fontSize:10,color:GREEN,fontWeight:800,textTransform:"uppercase",
            letterSpacing:1,margin:"0 0 3px"}}>{cur.label} complet</p>
          <h2 style={{fontSize:17,fontWeight:900,color:DARK,margin:"0 0 2px"}}>Drumul spre finală</h2>
          <p style={{fontSize:11,color:"#aaa",margin:0}}>Câștigătorii tăi merg mai departe</p>
        </div>

        {/* Bracket */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",paddingBottom:8}}>
          {/* Duels column */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {duels.map(([a,b],i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",gap:3,
                background:BG,borderRadius:10,padding:"6px 8px",boxShadow:SHADOW_OUT,width:120}}>
                <TeamSlot team={a}/>
                <div style={{height:1,background:"rgba(0,0,0,0.08)",margin:"1px 4px"}}/>
                <TeamSlot team={b}/>
              </div>
            ))}
          </div>

          {/* Lines col0→col1 */}
          <div style={{display:"flex",flexDirection:"column",width:16,alignSelf:"stretch"}}>
            {duels.map((_,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",
                minHeight:70,marginBottom:i<duels.length-1?10:0}}>
                <div style={{flex:1,borderTop:`2px solid ${BC}`,borderRight:`2px solid ${BC}`,borderRadius:"0 6px 0 0",marginTop:16}}/>
                <div style={{flex:1,borderBottom:`2px solid ${BC}`,borderRight:`2px solid ${BC}`,borderRadius:"0 0 6px 0",marginBottom:16}}/>
              </div>
            ))}
          </div>

          {/* Next round blank slots */}
          <div style={{display:"flex",flexDirection:"column",gap:10,alignSelf:"stretch",justifyContent:"center"}}>
            {Array.from({length:Math.ceil(duels.length/2)},(_,i)=>(
              <div key={i} style={{background:"transparent",borderRadius:8,padding:"5px 8px",
                border:"1.5px dashed #ddd",width:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:14,color:"#ccc"}}>❓</span>
              </div>
            ))}
          </div>

          {/* Future rounds */}
          {futureRounds.map((rid,fi)=>(
            <div key={rid} style={{display:"flex",alignItems:"center"}}>
              <div style={{width:14,height:2,background:BC}}/>
              <div style={{background:"transparent",borderRadius:8,padding:"5px 8px",
                border:"1.5px dashed #ddd",display:"flex",alignItems:"center",justifyContent:"center",
                width:fi===futureRounds.length-1?34:38}}>
                <span style={{fontSize:fi===futureRounds.length-1?12:14,color:"#ddd"}}>❓</span>
              </div>
            </div>
          ))}

          {/* Line → trophy */}
          <div style={{width:14,height:2,background:BC}}/>
          <div style={{width:38,height:38,borderRadius:10,
            background:"linear-gradient(135deg,#D4820A,#F0A020)",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 14px rgba(212,130,10,0.45)",flexShrink:0}}>
            <span style={{fontSize:20}}>🏆</span>
          </div>
        </div>

        {/* Buttons — same as grupe style */}
        <div style={{display:"flex",gap:8,width:"100%",marginTop:24}}>
          <button onClick={()=>setShowTransition(false)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:BG,boxShadow:SHADOW_OUT,fontSize:12,fontWeight:700,cursor:"pointer",color:"#888"}}>
            ← Inapoi
          </button>
          <button onClick={()=>changeRound(koRound+1)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",
              fontSize:12,fontWeight:700,cursor:"pointer",
              boxShadow:"0 4px 12px rgba(0,32,91,0.3)"}}>
            {nextRound.label} →
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Round pills */}
      <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",scrollbarWidth:"none"}}>
        {rounds.map((r,i)=>{
          const done=r.pairs.every(p=>knockoutPicks[p.id]);
          const locked=i>0&&!rounds[i-1].pairs.every(p=>knockoutPicks[p.id]);
          return (
            <button key={r.id} onClick={()=>!locked&&changeRound(i)}
              style={{flexShrink:0,padding:"6px 12px",borderRadius:20,border:"none",fontSize:11,fontWeight:700,
                cursor:locked?"default":"pointer",
                background:koRound===i?`linear-gradient(135deg,${NAVY},#001840)`:BG,
                color:koRound===i?"#fff":locked?"#ccc":"#888",
                boxShadow:koRound===i?"0 3px 10px rgba(0,32,91,0.25)":SHADOW_OUT,
                display:"flex",alignItems:"center",gap:4,opacity:locked?0.5:1}}>
              {locked&&<span>🔒</span>}
              {done&&koRound!==i&&<span style={{color:GREEN,marginRight:2}}>✓</span>}
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Swipeable area */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{touchAction:"pan-y"}}>

        {/* Info bar */}
        <div style={{background:"#E8F0FF",borderRadius:12,padding:"9px 14px",marginBottom:12,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <p style={{fontSize:13,fontWeight:800,color:NAVY,margin:0}}>{cur.label}</p>
            <p style={{fontSize:11,color:"#666",margin:"2px 0 0"}}>
              {cur.pairs.filter(p=>knockoutPicks[p.id]).length}/{cur.pairs.length} selectate · +{cur.pts}pts
            </p>
          </div>
          <span style={{fontSize:18}}>{roundComplete?"✅":"⏳"}</span>
        </div>

        {/* Dots */}
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:12}}>
          {groups.map(([pA,pB],i)=>{
            const done=!!knockoutPicks[pA.id]&&(pB?!!knockoutPicks[pB.id]:true);
            return (
              <div key={i} onClick={()=>setGroupIdx(i)} style={{
                width:gi===i?22:8,height:8,borderRadius:4,cursor:"pointer",
                transition:"all 0.3s",
                background:gi===i?NAVY:done?GREEN:"#ddd"
              }}/>
            );
          })}
        </div>

        {/* Two matches + bracket + vs card */}
        {cur.id==="final" ? (
          <>
            <p style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 6px"}}>🥉 3rd Place</p>
            <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:10}}>
              <KOTeamRow team={THIRD.t1} pick={knockoutPicks[THIRD.id]} pairId={THIRD.id} setKnockoutPicks={setKnockoutPicks}/>
              <div style={{height:1,background:"rgba(0,0,0,0.06)",margin:"0 14px"}}/>
              <KOTeamRow team={THIRD.t2} pick={knockoutPicks[THIRD.id]} pairId={THIRD.id} setKnockoutPicks={setKnockoutPicks}/>
            </div>
            <p style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"10px 0 6px"}}>🏆 Final</p>
            <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
              <KOTeamRow team={FINAL.t1} pick={knockoutPicks[FINAL.id]} pairId={FINAL.id} setKnockoutPicks={setKnockoutPicks}/>
              <div style={{height:1,background:"rgba(0,0,0,0.06)",margin:"0 14px"}}/>
              <KOTeamRow team={FINAL.t2} pick={knockoutPicks[FINAL.id]} pairId={FINAL.id} setKnockoutPicks={setKnockoutPicks}/>
            </div>
            {knockoutPicks["f_0"]&&(
              <div style={{background:"linear-gradient(135deg,#D4820A,#F0A020)",borderRadius:14,padding:"16px",textAlign:"center",boxShadow:"0 6px 20px rgba(212,130,10,0.4)",marginBottom:14}}>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.8)",margin:"0 0 4px",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>🏆 Campion Mondial</p>
                <span style={{fontSize:34}}>{FLAGS[knockoutPicks["f_0"]]||"🏆"}</span>
                <p style={{fontSize:15,fontWeight:900,color:"#fff",margin:"4px 0 0"}}>{knockoutPicks["f_0"]}</p>
              </div>
            )}
          </>
        ) : (
          <div style={{display:"flex",alignItems:"stretch"}}>
            {/* Two match cards */}
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
              <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
                <KOTeamRow team={pA.t1} pick={pickA} pairId={pA.id} setKnockoutPicks={setKnockoutPicks}/>
                <div style={{height:1,background:"rgba(0,0,0,0.06)",margin:"0 14px"}}/>
                <KOTeamRow team={pA.t2} pick={pickA} pairId={pA.id} setKnockoutPicks={setKnockoutPicks}/>
              </div>
              {pB&&(
                <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
                  <KOTeamRow team={pB.t1} pick={pickB} pairId={pB.id} setKnockoutPicks={setKnockoutPicks}/>
                  <div style={{height:1,background:"rgba(0,0,0,0.06)",margin:"0 14px"}}/>
                  <KOTeamRow team={pB.t2} pick={pickB} pairId={pB.id} setKnockoutPicks={setKnockoutPicks}/>
                </div>
              )}
            </div>
            {/* Bracket lines */}
            <div style={{width:14,flexShrink:0,display:"flex",flexDirection:"column",margin:"0 2px"}}>
              <div style={{flex:1,borderTop:`2px solid ${pickA?GREEN:"rgba(0,32,91,0.18)"}`,borderRight:`2px solid ${pickA?GREEN:"rgba(0,32,91,0.18)"}`,borderRadius:"0 6px 0 0",marginTop:22,transition:"border-color 0.25s"}}/>
              {pB&&<div style={{flex:1,borderBottom:`2px solid ${pickB?GREEN:"rgba(0,32,91,0.18)"}`,borderRight:`2px solid ${pickB?GREEN:"rgba(0,32,91,0.18)"}`,borderRadius:"0 0 6px 0",marginBottom:22,transition:"border-color 0.25s"}}/>}
            </div>
            {/* Next matchup card */}
            <div style={{width:46,flexShrink:0,display:"flex",alignItems:"center"}}>
              <div style={{width:"100%",borderRadius:10,padding:"10px 0",
                background:pickA&&pickB?`linear-gradient(135deg,${NAVY},#001840)`:BG,
                boxShadow:SHADOW_OUT,display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all 0.25s"}}>
                <span style={{fontSize:18,opacity:pickA?1:0.2}}>{pickA?FLAGS[pickA]||"🏳":"❓"}</span>
                <span style={{fontSize:8,fontWeight:700,color:pickA&&pickB?"rgba(255,255,255,0.45)":"#ddd"}}>vs</span>
                <span style={{fontSize:18,opacity:pickB?1:0.2}}>{pB?(pickB?FLAGS[pickB]||"🏳":"❓"):"—"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div style={{display:"flex",gap:8,marginTop:14,paddingBottom:8}}>
        <button
          onClick={()=>{ if(gi>0) setGroupIdx(gi-1); else if(koRound>0) changeRound(koRound-1); }}
          disabled={koRound===0&&gi===0}
          style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
            background:koRound===0&&gi===0?"#e8e8e8":BG,
            boxShadow:koRound===0&&gi===0?"none":SHADOW_OUT,
            fontSize:12,fontWeight:700,cursor:koRound===0&&gi===0?"default":"pointer",
            color:koRound===0&&gi===0?"#ccc":"#888"}}>
          ← Inapoi
        </button>
        {!isLastGroup ? (
          <button onClick={()=>setGroupIdx(gi+1)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:groupDone?`linear-gradient(135deg,${NAVY},#001840)`:"#e8e8e8",
              color:groupDone?"#fff":"#bbb",fontSize:12,fontWeight:700,
              cursor:groupDone?"pointer":"default",
              boxShadow:groupDone?"0 4px 12px rgba(0,32,91,0.3)":"none",transition:"all 0.2s"}}>
            Meciurile {gi*2+3}-{gi*2+4} →
          </button>
        ) : !isLastRound ? (
          <button onClick={()=>roundComplete&&setShowTransition(true)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:roundComplete?`linear-gradient(135deg,${NAVY},#001840)`:"#e8e8e8",
              color:roundComplete?"#fff":"#bbb",fontSize:12,fontWeight:700,
              cursor:roundComplete?"pointer":"default",
              boxShadow:roundComplete?"0 4px 12px rgba(0,32,91,0.3)":"none",transition:"all 0.2s"}}>
            {rounds[koRound+1].label} →
          </button>
        ) : (
          <button onClick={()=>knockoutPicks["f_0"]&&onComplete()}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:knockoutPicks["f_0"]?`linear-gradient(135deg,${GREEN},#007A36)`:"#e8e8e8",
              color:knockoutPicks["f_0"]?"#fff":"#bbb",fontSize:12,fontWeight:700,
              cursor:knockoutPicks["f_0"]?"pointer":"default",
              boxShadow:knockoutPicks["f_0"]?"0 4px 12px rgba(0,154,68,0.3)":"none",transition:"all 0.2s"}}>
            Boosters →
          </button>
        )}
      </div>
    </>
  );
}

// ── GRUPE TAB ─────────────────────────────────────────────────────────────────
function GrupeTab({ groupRank, setRank, onComplete }) {
  const GRUPE_LIST = ["A","B"];
  const [gIdx, setGIdx] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [done, setDone] = useState(false);
  const touchStartX = useRef(null);

  const allComplete = GRUPE_LIST.every(g=>[1,2,3,4].every(p=>!!(groupRank[g]||{})[p]));
  const activeGrupa = GRUPE_LIST[gIdx];
  const teams = ECHIPE_DATA[activeGrupa];
  const rank = groupRank[activeGrupa]||{};
  const isCurrentComplete = [1,2,3,4].every(p=>!!rank[p]);
  const medals = ["🥇","🥈","🥉","4️⃣"];
  const rankColors = [GREEN,NAVY,"#888","#aaa"];

  const goNext = () => { if(gIdx<GRUPE_LIST.length-1) setGIdx(gIdx+1); else setDone(true); };
  const goPrev = () => { if(gIdx>0) setGIdx(gIdx-1); };

  const onTS = e => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const touchStartY = useRef(null);
  const onTE = e => {
    if(touchStartX.current===null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    // only swipe if horizontal movement is dominant
    if(Math.abs(diffX)>50 && Math.abs(diffX)>Math.abs(diffY)*1.5){
      if(diffX>0) goNext(); else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleTeamClick = team => {
    const ep = Object.entries(rank).find(([,v])=>v===team)?.[0];
    if(ep){ setRank(activeGrupa,parseInt(ep),team); return; }
    const np = [1,2,3,4].find(p=>!rank[p]);
    if(np) setRank(activeGrupa,np,team);
  };

  const swapPos = (posA,posB) => {
    const tA=rank[posA]||null,tB=rank[posB]||null;
    if(tA) setRank(activeGrupa,posB,tA); else if(rank[posB]) setRank(activeGrupa,posB,rank[posB]);
    if(tB) setRank(activeGrupa,posA,tB); else if(rank[posA]) setRank(activeGrupa,posA,rank[posA]);
  };

  const handleDrop = tp => {
    if(dragging!==null&&dragging!==tp) swapPos(dragging,tp);
    setDragging(null); setDragOver(null);
  };

  if(done) return (
    <div onTouchStart={onTS} onTouchEnd={onTE}
      style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"30px 20px",textAlign:"center"}}>
      <div style={{width:90,height:90,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#007A36)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,marginBottom:20,boxShadow:"0 8px 28px rgba(0,154,68,0.4)"}}>✅</div>
      <h2 style={{fontSize:22,fontWeight:900,color:DARK,margin:"0 0 8px"}}>Group Stage complet!</h2>
      <p style={{fontSize:14,color:"#888",margin:"0 0 24px",lineHeight:1.5}}>Ai prezis ordinea pentru toate grupele.</p>
      <div style={{width:"100%",background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:24}}>
        {GRUPE_LIST.map((g,i)=>{
          const r=groupRank[g]||{};
          return (
            <div key={g} style={{padding:"12px 16px",borderBottom:i<GRUPE_LIST.length-1?"1px solid rgba(0,0,0,0.06)":"none"}}>
              <p style={{fontSize:11,fontWeight:800,color:"#aaa",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>Grupa {g}</p>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4].map(pos=>(
                  <div key={pos} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:pos<=2?"rgba(0,32,91,0.05)":"transparent",borderRadius:8,padding:"6px 4px"}}>
                    <span style={{fontSize:7,fontWeight:700,color:pos===1?GREEN:pos===2?NAVY:"#ccc",textTransform:"uppercase"}}>{pos===1?"1st":pos===2?"2nd":pos===3?"3rd":"4th"}</span>
                    <span style={{fontSize:18}}>{FLAGS[r[pos]]||"?"}</span>
                    <span style={{fontSize:9,fontWeight:600,color:DARK}}>{r[pos]?.substring(0,3)||"?"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:8,width:"100%"}}>
        <button onClick={()=>setDone(false)}
          style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:BG,boxShadow:SHADOW_OUT,fontSize:12,fontWeight:700,cursor:"pointer",color:"#888"}}>← Modifica</button>
        <button onClick={onComplete}
          style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,32,91,0.3)"}}>Best Third →</button>
      </div>
    </div>
  );

  return (
    <div onTouchStart={onTS} onTouchEnd={onTE}>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:12}}>
        {GRUPE_LIST.map((g,i)=>{
          const complete=[1,2,3,4].every(p=>!!(groupRank[g]||{})[p]);
          const isActive=i===gIdx;
          return <div key={g} style={{width:isActive?24:8,height:8,borderRadius:4,transition:"all 0.3s",background:isActive?NAVY:complete?GREEN:"#ddd"}}/>;
        })}
        <div style={{width:8,height:8,borderRadius:4,background:allComplete?GREEN:"#ddd"}}/>
      </div>

      <div style={{borderRadius:20,overflow:"hidden",marginBottom:12,boxShadow:SHADOW_OUT}}>
        <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:16,fontWeight:900,color:"#fff",letterSpacing:1}}>GROUP {activeGrupa}</span>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>Tap → clasament</span>
        </div>
        <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"10px 10px",display:"flex",justifyContent:"space-around",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          {teams.map(t=>{
            const pos=Object.entries(rank).find(([,v])=>v===t)?.[0];
            const isRanked=!!pos;
            return (
              <div key={t} onClick={()=>handleTeamClick(t)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",transition:"all 0.2s",opacity:isRanked?0.35:1}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:isRanked?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.12)",border:isRanked?"2px solid rgba(255,255,255,0.12)":"2px solid rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,transition:"all 0.2s"}}>
                  {FLAGS[t]}
                </div>
                <span style={{fontSize:9,fontWeight:800,color:isRanked?"rgba(255,255,255,0.25)":"#fff",letterSpacing:0.3}}>{t.substring(0,3).toUpperCase()}</span>
              </div>
            );
          })}
        </div>
        <div style={{background:BG}}>
          <div style={{padding:"6px 14px 3px"}}>
            <span style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>Clasament prezis</span>
          </div>
          {[1,2,3,4].map(pos=>{
            const team=rank[pos];
            const isDraggingThis=dragging===pos;
            const isDropTarget=dragOver===pos&&dragging!==null&&dragging!==pos;

            const onTSR = e => { if(!team) return; e.stopPropagation(); setDragging(pos); };
            const onTMR = e => {
              if(dragging===null) return;
              // only block scroll when actively dragging a row
              try { e.preventDefault(); } catch(err) {}
              const touch=e.touches[0];
              const el=document.elementFromPoint(touch.clientX,touch.clientY);
              const rowEl=el?.closest('[data-rank-pos]');
              if(rowEl){ const tp=parseInt(rowEl.getAttribute('data-rank-pos')); if(tp!==dragging) setDragOver(tp); }
            };
            const onTER = e => {
              e.stopPropagation();
              if(dragging!==null&&dragOver!==null&&dragging!==dragOver) swapPos(dragging,dragOver);
              setDragging(null); setDragOver(null);
            };

            return (
              <div key={pos} data-rank-pos={pos}
                onTouchStart={onTSR} onTouchMove={onTMR} onTouchEnd={onTER}
                draggable={!!team}
                onDragStart={()=>{ if(team) setDragging(pos); }}
                onDragOver={e=>{ e.preventDefault(); setDragOver(pos); }}
                onDragLeave={()=>setDragOver(null)}
                onDrop={()=>handleDrop(pos)}
                onDragEnd={()=>{ setDragging(null); setDragOver(null); }}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                  background:isDropTarget?"#E8F0FF":isDraggingThis?"rgba(0,32,91,0.05)":"#fff",
                  borderBottom:pos<4?"1px solid rgba(0,0,0,0.05)":"none",
                  border:isDropTarget?`2px solid ${NAVY}`:"2px solid transparent",
                  cursor:team?"grab":"default",transition:"background 0.15s",opacity:isDraggingThis?0.4:1,
                  userSelect:"none",WebkitUserSelect:"none",touchAction:"pan-y"}}>
                <span style={{fontSize:10,fontWeight:800,color:rankColors[pos-1],width:18,textAlign:"center"}}>#{pos}</span>
                <span style={{fontSize:18}}>{medals[pos-1]}</span>
                {team ? (
                  <>
                    <span style={{fontSize:20}}>{FLAGS[team]}</span>
                    <span style={{flex:1,fontSize:13,fontWeight:700,color:DARK}}>{team}</span>
                    <span style={{fontSize:18,color:"#bbb",touchAction:"none"}}>⠿</span>
                    <button onClick={e=>{e.stopPropagation();setRank(activeGrupa,pos,team);}} style={{fontSize:11,color:"#ccc",background:"transparent",border:"none",cursor:"pointer",padding:"2px 6px"}}>✕</button>
                  </>
                ) : (
                  <span style={{flex:1,fontSize:12,color:"#ccc",fontStyle:"italic"}}>— locul {pos}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <button onClick={()=>{[1,2,3,4].forEach(p=>{if(rank[p])setRank(activeGrupa,p,rank[p]);});}}
          style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:BG,boxShadow:SHADOW_OUT,fontSize:12,fontWeight:700,cursor:"pointer",color:"#888"}}>
          🔄 Reset
        </button>
        <button onClick={goNext} disabled={!isCurrentComplete}
          style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
            background:isCurrentComplete?`linear-gradient(135deg,${NAVY},#001840)`:"#e8e8e8",
            color:isCurrentComplete?"#fff":"#bbb",fontSize:12,fontWeight:700,
            cursor:isCurrentComplete?"pointer":"default",
            boxShadow:isCurrentComplete?"0 4px 12px rgba(0,32,91,0.3)":"none",transition:"all 0.2s"}}>
          {gIdx<GRUPE_LIST.length-1?"Grupa "+GRUPE_LIST[gIdx+1]+" →":"Done ✓"}
        </button>
      </div>
    </div>
  );
}

// ── PREDICTIONS SCREEN ────────────────────────────────────────────────────────

// ── INSTANT PICK SCREEN ───────────────────────────────────────────────────────
// CM 2026: 16 grupe, 4 echipe per grupă
// Prototip: grupele A, B, C sunt interactive; restul auto-generate
const ALL_GROUPS_DATA = {
  A:["Brazil","France","Mexico","Morocco"],
  B:["Argentina","England","USA","Poland"],
  C:["Spain","Portugal","Japan","Canada"],
  D:["Germany","Netherlands","Senegal","Australia"],
  E:["Belgium","Croatia","Serbia","Iran"],
  F:["Denmark","Tunisia","Ecuador","Cameroon"],
  G:["Uruguay","Colombia","South Korea","Ghana"],
  H:["Portugal","Switzerland","Nigeria","Costa Rica"],
  I:["Netherlands","Peru","Qatar","Ecuador"],
  J:["Brazil","Mexico","Saudi Arabia","Cameroon"],
  K:["France","Australia","Japan","Tunisia"],
  L:["Argentina","Poland","USA","Iran"],
  M:["Spain","Senegal","Germany","Costa Rica"],
  N:["England","Croatia","Denmark","Ghana"],
  O:["Belgium","Uruguay","Colombia","Switzerland"],
  P:["Italy","Serbia","South Korea","Nigeria"],
};

const INTERACTIVE_GROUPS = ["A","B","C"]; // groups user picks manually
const ALL_GROUP_IDS = Object.keys(ALL_GROUPS_DATA);

const makeMatchups = (teams) => {
  const m = [];
  for(let i=0;i<teams.length;i++) for(let j=i+1;j<teams.length;j++) m.push([teams[i],teams[j]]);
  return m;
};

const GROUP_MATCHUPS = {};
ALL_GROUP_IDS.forEach(g=>{ GROUP_MATCHUPS[g] = makeMatchups(ALL_GROUPS_DATA[g]); });

// Auto-generate random results for non-interactive groups
const AUTO_RESULTS = {};
ALL_GROUP_IDS.filter(g=>!INTERACTIVE_GROUPS.includes(g)).forEach(g=>{
  const teams = ALL_GROUPS_DATA[g];
  const pts = {}; teams.forEach(t=>{ pts[t]=0; });
  GROUP_MATCHUPS[g].forEach(([h,a],i)=>{
    const r = Math.random();
    const result = r<0.45?"home":r<0.7?"away":"draw";
    AUTO_RESULTS[`${g}-${i}`] = result;
    if(result==="home") pts[h]=(pts[h]||0)+3;
    else if(result==="away") pts[a]=(pts[a]||0)+3;
    else { pts[h]=(pts[h]||0)+1; pts[a]=(pts[a]||0)+1; }
  });
});

const getAutoStanding = (group) => {
  const teams = ALL_GROUPS_DATA[group]||[];
  const pts = {}; teams.forEach(t=>{pts[t]=0;});
  GROUP_MATCHUPS[group].forEach(([h,a],i)=>{
    const r = AUTO_RESULTS[`${group}-${i}`];
    if(r==="home") pts[h]=(pts[h]||0)+3;
    else if(r==="away") pts[a]=(pts[a]||0)+3;
    else { pts[h]=(pts[h]||0)+1; pts[a]=(pts[a]||0)+1; }
  });
  return [...teams].sort((a,b)=>(pts[b]||0)-(pts[a]||0));
};
// KO matchups generated dynamically based on group standings
const KO_MATCHUP_TEMPLATE = [
  {id:"r16_0",round:"R16"},{id:"r16_1",round:"R16"},{id:"r16_2",round:"R16"},{id:"r16_3",round:"R16"},
  {id:"r16_4",round:"R16"},{id:"r16_5",round:"R16"},{id:"r16_6",round:"R16"},{id:"r16_7",round:"R16"},
  {id:"qf_0",round:"QF"},{id:"qf_1",round:"QF"},{id:"qf_2",round:"QF"},{id:"qf_3",round:"QF"},
  {id:"sf_0",round:"SF"},{id:"sf_1",round:"SF"},
  {id:"final",round:"Final"},
];

function MatchSwipeCard({ home, away, onPick, onFlash, groupLabel, matchNum, totalMatches, existingPick, onBack, canGoBack, isKo }) {
  const startX = useRef(null);
  const startY = useRef(null);
  const [offset, setOffset] = useState({ x:0, y:0 });
  const [picked, setPicked] = useState(existingPick||null);
  const pickRef = useRef(false);

  const homeColors = TEAM_COLORS[home] || [NAVY, "#001840"];
  const awayColors = TEAM_COLORS[away] || [GREEN, "#004d1a"];

  const getColors = (p) => {
    if(p==="home") return homeColors;
    if(p==="away") return awayColors;
    return ["#444","#222"];
  };

  const pick = (winner) => {
    if(pickRef.current) return;
    pickRef.current = true;
    setPicked(winner);
    setOffset({x:0,y:0});
    setTimeout(()=>{ pickRef.current = false; }, 100);
  };

  const onTouchStart = e => {
    if(picked) return;
    startX.current=e.touches[0].clientX;
    startY.current=e.touches[0].clientY;
  };
  const onTouchMove = e => {
    if(startX.current===null||picked) return;
    const dx=e.touches[0].clientX-startX.current;
    const dy=e.touches[0].clientY-startY.current;
    setOffset({x:dx*0.55,y:dy*0.4});
  };
  const onTouchEnd = e => {
    if(startX.current===null||picked) return;
    const dx=e.changedTouches[0].clientX-startX.current;
    const dy=startY.current-e.changedTouches[0].clientY;
    if(!isKo&&dy>55&&Math.abs(dx)<80) pick("draw");
    else if(dx<-55) pick("home");
    else if(dx>55) pick("away");
    else setOffset({x:0,y:0});
    startX.current=null;
  };

  const swipeLeft = !picked && offset.x < -25;
  const swipeRight = !picked && offset.x > 25;
  const swipeUp = !picked && offset.y < -25 && Math.abs(offset.x) < 60;
  const leftPct = Math.min(1,(-offset.x-25)/80);
  const rightPct = Math.min(1,(offset.x-25)/80);
  const rotation = picked ? 0 : offset.x * 0.04;

  const pickedColors = picked ? getColors(picked) : null;
  const cardBg = picked
    ? `linear-gradient(160deg,${pickedColors[0]},${pickedColors[1]})`
    : "linear-gradient(160deg,#1a1a2e,#16213e)";

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",userSelect:"none",position:"relative"}}>
      {/* Full screen card */}
      <div
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{
          flex:1,overflow:"hidden",touchAction:"none",
          transform:`translateX(${picked?0:offset.x}px) translateY(${picked?0:offset.y}px) rotate(${rotation}deg)`,
          transition:offset.x===0&&offset.y===0?"transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275)":"transform 0.04s",
          background:cardBg,
          display:"flex",flexDirection:"column",
          position:"relative",
        }}>

        {/* Header */}
        <div style={{padding:"14px 20px 12px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,0.12)",flexShrink:0}}>
          <p style={{fontSize:10,fontWeight:900,color:"rgba(255,255,255,0.9)",margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase"}}>
            {picked ? (picked==="draw" ? "EGAL 🤝" : `${picked==="home"?home:away} CÂȘTIGĂ 🏆`) : "Predictions"}
          </p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.55)",margin:0,fontWeight:600}}>
            {picked ? "YOUR PICK" : "Swipe to predict!"}
          </p>
        </div>

        {/* Content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",position:"relative"}}>

          {/* Swipe color overlays */}
          {swipeLeft&&<div style={{position:"absolute",inset:0,opacity:leftPct*0.5,background:`linear-gradient(160deg,${homeColors[0]},${homeColors[1]})`}}/>}
          {swipeRight&&<div style={{position:"absolute",inset:0,opacity:rightPct*0.5,background:`linear-gradient(160deg,${awayColors[0]},${awayColors[1]})`}}/>}
          {swipeUp&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:Math.min(1,(-offset.y-25)/70)}}><span style={{fontSize:52,fontWeight:900,color:"#fff",letterSpacing:3}}>EGAL</span><div style={{width:0,height:0,borderLeft:"26px solid transparent",borderRight:"26px solid transparent",borderBottom:"44px solid rgba(255,255,255,0.85)",marginTop:16}}/></div>}

          {/* PICKED STATE — big flag center */}
          {picked ? (
            picked==="draw" ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:20}}>
                  <span style={{fontSize:72}}>{FLAGS[home]||"🏳"}</span>
                  <span style={{fontSize:36}}>🤝</span>
                  <span style={{fontSize:72}}>{FLAGS[away]||"🏳"}</span>
                </div>
                <span style={{fontSize:16,color:"rgba(255,255,255,0.7)",fontWeight:700,marginTop:4}}>{home} vs {away}</span>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <div style={{position:"relative"}}>
                  <span style={{fontSize:120,lineHeight:1,filter:"drop-shadow(0 10px 30px rgba(0,0,0,0.5))"}}>
                    {FLAGS[picked==="home"?home:away]||"🏳"}
                  </span>
                  <div style={{position:"absolute",top:-4,right:-4,width:36,height:36,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.3)"}}>
                    <span style={{fontSize:18}}>✅</span>
                  </div>
                </div>
                <span style={{fontSize:32,fontWeight:900,color:"#FFD700",textShadow:"0 2px 12px rgba(0,0,0,0.5)",textAlign:"center",marginTop:8}}>
                  {picked==="home"?home:away}
                </span>
              </div>
            )
          ) : (
            /* DEFAULT: teams face to face */
            <div style={{width:"100%",opacity:Math.max(0,1-Math.max(leftPct,rightPct)),transition:"opacity 0.1s"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,width:"100%",marginBottom:16}}>
                <div onClick={()=>pick("home")} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:10,cursor:"pointer"}}>
                  <div style={{background:offset.x<-15?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.12)",borderRadius:20,padding:"14px",border:offset.x<-15?"3px solid rgba(255,255,255,0.9)":"2px solid rgba(255,255,255,0.2)",transform:offset.x<-15?"scale(1.08)":"scale(1)",transition:"all 0.15s",boxShadow:offset.x<-15?"0 0 24px rgba(255,255,255,0.4)":"none"}}>
                    <span style={{fontSize:60,lineHeight:1}}>{FLAGS[home]||"🏳"}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:800,color:"#fff",textAlign:"center"}}>{home.length>9?home.split(" ")[0]:home}</span>
                </div>
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{background:"rgba(255,255,255,0.18)",borderRadius:12,padding:"10px 14px",border:"1px solid rgba(255,255,255,0.3)"}}>
                    <span style={{fontSize:16,fontWeight:900,color:"#fff",letterSpacing:2}}>VS</span>
                  </div>
                  {!isKo&&<span style={{fontSize:9,color:"rgba(255,255,255,0.4)",fontWeight:600}}>↑ egal</span>}
                </div>
                <div onClick={()=>!picked&&pick("away")} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:10,cursor:picked?"default":"pointer"}}>
                  <div style={{background:offset.x>15?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.12)",borderRadius:20,padding:"14px",border:offset.x>15?"3px solid rgba(255,255,255,0.9)":"2px solid rgba(255,255,255,0.2)",transform:offset.x>15?"scale(1.08)":"scale(1)",transition:"all 0.15s",boxShadow:offset.x>15?"0 0 24px rgba(255,255,255,0.4)":"none"}}>
                    <span style={{fontSize:60,lineHeight:1}}>{FLAGS[away]||"🏳"}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:800,color:"#fff",textAlign:"center"}}>{away.length>9?away.split(" ")[0]:away}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom: 1X2 or Next/Back */}
        <div style={{flexShrink:0,borderTop:"1px solid rgba(255,255,255,0.12)",padding:"12px 20px 18px",
          background:picked?`linear-gradient(135deg,${pickedColors[0]}99,${pickedColors[1]}99)`:"transparent"}}>
          {picked ? (
            <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setPicked(null)}
                style={{flex:1,padding:"12px 0",borderRadius:14,border:"2px solid rgba(255,255,255,0.4)",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                ← Schimbă
              </button>
              <button onClick={()=>onPick(picked)}
                style={{flex:2,padding:"12px 0",borderRadius:14,border:"none",background:"rgba(255,255,255,0.95)",color:"#222",fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>
                Următorul →
              </button>
            </div>
          ) : (
            <>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {(isKo
                  ? [{v:"1",action:"home"},{v:"2",action:"away"}]
                  : [{v:"1",action:"home"},{v:"X",action:"draw"},{v:"2",action:"away"}]
                ).map(({v,action})=>(
                  <div key={v} onClick={()=>pick(action)}
                    style={{flex:1,textAlign:"center",background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"10px 0",cursor:"pointer",border:"1px solid rgba(255,255,255,0.2)"}}>
                    <span style={{fontSize:18,fontWeight:900,color:"#fff"}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {canGoBack ? (
                  <button onClick={onBack}
                    style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:10,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"rgba(255,255,255,0.7)"}}>
                    <span style={{fontSize:14}}>←</span>
                    <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Înapoi</span>
                  </button>
                ) : <div/>}
                <div style={{display:"flex",alignItems:"center",gap:5,opacity:offset.x>15?1:0.4,transition:"opacity 0.15s"}}>
                  <span style={{fontSize:10,fontWeight:800,color:"#fff",textTransform:"uppercase",letterSpacing:1}}>Swipe Dreapta</span>
                  <span style={{fontSize:14,color:"#fff"}}>→</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupSummaryCard({ group, picks, onNext, onReset, isLastGroup }) {
  const teams = ALL_GROUPS_DATA[group]||[];
  const pts = {};
  teams.forEach(t=>{ pts[t]=0; });
  (GROUP_MATCHUPS[group]||[]).forEach(([h,a],i)=>{
    const p = picks[`${group}-${i}`];
    if(p==="home") pts[h]=(pts[h]||0)+3;
    else if(p==="away") pts[a]=(pts[a]||0)+3;
    else if(p==="draw"){ pts[h]=(pts[h]||0)+1; pts[a]=(pts[a]||0)+1; }
  });
  const sorted = [...teams].sort((a,b)=>(pts[b]||0)-(pts[a]||0));
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",padding:"20px 20px 0"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#007A36)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 10px",boxShadow:"0 6px 18px rgba(0,154,68,0.35)"}}>✅</div>
        <p style={{fontSize:14,fontWeight:800,color:DARK,margin:0}}>Grupa {group} · Complet</p>
        <p style={{fontSize:12,color:"#aaa",margin:"4px 0 0"}}>Clasamentul tău prezis</p>
      </div>
      <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:20}}>
        {sorted.map((t,i)=>(
          <div key={t} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",background:"#fff",borderBottom:i<3?"1px solid rgba(0,0,0,0.05)":"none"}}>
            <span style={{fontSize:12,fontWeight:800,color:i===0?GREEN:i===1?NAVY:"#aaa",width:20,textAlign:"center"}}>{i+1}</span>
            <span style={{fontSize:24}}>{FLAGS[t]||"🏳"}</span>
            <span style={{flex:1,fontSize:13,fontWeight:600,color:DARK}}>{t}</span>
            <div style={{background:i<2?`linear-gradient(135deg,${NAVY},#001840)`:"rgba(0,0,0,0.06)",borderRadius:8,padding:"4px 10px"}}>
              <span style={{fontSize:12,fontWeight:800,color:i<2?"#fff":"#888"}}>{pts[t]||0} pts</span>
            </div>
            {i<2&&<span style={{fontSize:10,color:GREEN,fontWeight:700}}>→ R16</span>}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onReset}
          style={{flex:1,padding:"14px 0",borderRadius:14,border:"none",
            background:BG,boxShadow:SHADOW_OUT,
            color:"#888",fontSize:13,fontWeight:700,cursor:"pointer"}}>
          🔄 Reset
        </button>
        <button onClick={onNext}
          style={{flex:2,padding:"14px 0",borderRadius:14,border:"none",
            background:`linear-gradient(135deg,${NAVY},#001840)`,
            color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(0,32,91,0.3)"}}>
          {isLastGroup ? "Knockout →" : "Grupa urmatoare →"}
        </button>
      </div>
    </div>
  );
}

function Best3Screen({ groups, getGroupStanding, picks, best3, setBest3, onDone }) {
  // Compute pts for each 3rd place team from group matches
  const thirds = groups.map(g => {
    const standing = getGroupStanding(g);
    const team = standing[2];
    if(!team) return null;
    // compute pts from picks
    const groupPts = {};
    (ALL_GROUPS_DATA[g]||[]).forEach(t=>{ groupPts[t]=0; });
    (GROUP_MATCHUPS[g]||[]).forEach(([h,a],i)=>{
      const p = picks?.[`${g}-${i}`] || AUTO_RESULTS[`${g}-${i}`];
      if(p==="home") groupPts[h]=(groupPts[h]||0)+3;
      else if(p==="away") groupPts[a]=(groupPts[a]||0)+3;
      else if(p==="draw"){groupPts[h]=(groupPts[h]||0)+1;groupPts[a]=(groupPts[a]||0)+1;}
    });
    return { group:g, team, flag:FLAGS[team]||"🏳", pts:groupPts[team]||0 };
  }).filter(Boolean);

  // Sort by pts descending
  const sorted = [...thirds].sort((a,b)=>b.pts-a.pts);
  const needed = 8;
  const isFull = best3.length >= needed;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden"}}>
      {/* Header with selected chips */}
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"12px 16px 14px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:13,fontWeight:800,color:"#fff"}}>🥉 Best Third</span>
          <span style={{fontSize:12,fontWeight:800,color:isFull?GREEN:"rgba(255,255,255,0.6)"}}>{best3.length}/{needed}</span>
        </div>
        {best3.length===0 ? (
          <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",fontStyle:"italic",margin:0}}>Selecteaza {needed} echipe din locul 3...</p>
        ) : (
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {best3.map(t=>(
              <div key={t} onClick={()=>setBest3(p=>p.filter(x=>x!==t))}
                style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.18)",borderRadius:20,padding:"5px 10px 5px 8px",cursor:"pointer",border:"1px solid rgba(255,255,255,0.25)"}}>
                <span style={{fontSize:16}}>{FLAGS[t]||"🏳"}</span>
                <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{t.length>8?t.split(" ")[0]:t}</span>
                <span style={{fontSize:13,color:"rgba(255,255,255,0.55)",marginLeft:2}}>✕</span>
              </div>
            ))}
          </div>
        )}
        <div style={{height:3,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden",marginTop:10}}>
          <div style={{height:"100%",width:`${(best3.length/needed)*100}%`,background:GREEN,borderRadius:2,transition:"width 0.3s"}}/>
        </div>
      </div>

      {/* Ranked list */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 20px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>
          Ranking locul 3 · sortate după puncte
        </p>
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:16}}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"center",padding:"6px 16px",background:"rgba(0,0,0,0.03)",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
            <span style={{fontSize:9,fontWeight:700,color:"#bbb",width:24}}>#</span>
            <span style={{flex:1,fontSize:9,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>Echipă</span>
            <span style={{fontSize:9,fontWeight:700,color:"#bbb",width:28,textAlign:"center"}}>Gr.</span>
            <span style={{fontSize:9,fontWeight:700,color:"#bbb",width:40,textAlign:"center"}}>Pts</span>
            <span style={{width:28}}/>
          </div>
          {sorted.filter(({team})=>!best3.includes(team)).map(({group,team,flag,pts},i,arr)=>(
            <div key={group} onClick={()=>{ if(!isFull) setBest3(p=>[...p,team]); }}
              style={{display:"flex",alignItems:"center",gap:8,padding:"11px 16px",
                background:"#fff",
                borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,0.05)":"none",
                cursor:isFull?"default":"pointer",
                opacity:isFull?0.5:1,transition:"all 0.15s"}}>
              <span style={{fontSize:11,fontWeight:800,color:i===0?GREEN:i<3?NAVY:"#bbb",width:24}}>{i+1}</span>
              <span style={{fontSize:22,flexShrink:0}}>{flag}</span>
              <span style={{flex:1,fontSize:13,fontWeight:600,color:DARK}}>{team.length>10?team.split(" ")[0]:team}</span>
              <span style={{fontSize:10,fontWeight:700,color:"#bbb",background:"rgba(0,0,0,0.06)",borderRadius:5,padding:"2px 6px",width:28,textAlign:"center"}}>{group}</span>
              <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,borderRadius:8,padding:"3px 8px",width:40,textAlign:"center"}}>
                <span style={{fontSize:11,fontWeight:800,color:"#fff"}}>{pts}</span>
              </div>
              <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,border:"2px solid #ddd"}}/>
            </div>
          ))}
        </div>
        <button onClick={()=>isFull&&onDone(best3)}
          style={{width:"100%",padding:"15px 0",borderRadius:14,border:"none",marginBottom:24,
            background:isFull?`linear-gradient(135deg,${NAVY},#001840)`:"#e0e0e0",
            color:isFull?"#fff":"#bbb",fontSize:14,fontWeight:800,cursor:isFull?"pointer":"default",
            boxShadow:isFull?"0 4px 14px rgba(0,32,91,0.3)":"none"}}>
          {isFull ? "Knockout →" : `Mai selectează ${needed-best3.length}`}
        </button>
      </div>
    </div>
  );
}


function GroupIntroScreen({ group, teams: teamsProp, isKo, onStart }) {
  const teams = isKo ? null : (ALL_GROUPS_DATA[group]||[]);
  const matchCount = isKo ? (teamsProp||[]).length : (GROUP_MATCHUPS[group]||[]).length;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflowY:"auto",padding:"20px 24px"}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,borderRadius:20,padding:"20px",width:"100%",marginBottom:16,boxShadow:SHADOW_OUT}}>
        <p style={{fontSize:10,color:RED,margin:"0 0 4px",letterSpacing:2,textTransform:"uppercase",fontWeight:800,textAlign:"center"}}>FIFA WORLD CUP 2026</p>
        <h2 style={{fontSize:26,fontWeight:900,color:"#fff",margin:"0 0 20px",textAlign:"center",letterSpacing:1}}>{isKo?group:`GRUPA ${group}`}</h2>
        {isKo ? (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {(teamsProp||[]).reduce((acc,pair,i)=>{
              if(i%2===0) acc.push([pair, teamsProp[i+1]]);
              return acc;
            },[]).map((pair,gi)=>(
              <div key={gi} style={{background:"rgba(255,255,255,0.06)",borderRadius:14,padding:"10px",border:"1px solid rgba(255,255,255,0.12)"}}>
                <p style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontWeight:700,textAlign:"center",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>
                  Câștigătoarea merge mai departe →
                </p>
                {pair.filter(Boolean).map(([h,a],j)=>(
                  <div key={j} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"9px 12px",marginBottom:j===0&&pair[1]?6:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                      <span style={{fontSize:20}}>{FLAGS[h]||"🏳"}</span>
                      <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{h&&h.length>8?h.split(" ")[0]:h}</span>
                    </div>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:700,flexShrink:0}}>VS</span>
                    <div style={{display:"flex",alignItems:"center",gap:8,flex:1,justifyContent:"flex-end"}}>
                      <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{a&&a.length>8?a.split(" ")[0]:a}</span>
                      <span style={{fontSize:20}}>{FLAGS[a]||"🏳"}</span>
                    </div>
                  </div>
                ))}
                {pair[1]&&(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:6}}>
                    <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
                    <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontWeight:600}}>câștigătoarele se întâlnesc în {teamsProp.length<=4?"SF":"QF"}</span>
                    <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {teams.map((t)=>(
              <div key={t} style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,border:"1px solid rgba(255,255,255,0.15)"}}>
                <span style={{fontSize:44,lineHeight:1}}>{FLAGS[t]||"🏳"}</span>
                <span style={{fontSize:12,fontWeight:700,color:"#fff",textAlign:"center",lineHeight:1.2}}>{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{width:"100%",background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:20}}>
        <p style={{fontSize:12,color:"#aaa",margin:0,textAlign:"center"}}>{matchCount} meciuri de prezis</p>
      </div>
      <button onClick={onStart}
        style={{width:"100%",padding:"16px 0",borderRadius:16,border:"none",
          background:`linear-gradient(135deg,${RED},#EF3340 40%,${GREEN})`,
          color:"#fff",fontSize:16,fontWeight:900,cursor:"pointer",
          boxShadow:"0 6px 20px rgba(200,16,46,0.3)",letterSpacing:1}}>
        Începe Meciurile →
      </button>
    </div>
  );
}

function InstantPickSummaryScreen({ picks, koPicks, best3, getGroupStanding, onConfirm, readOnly }) {
  const GROUPS = INTERACTIVE_GROUPS;
  const ALL_ROUNDS = ["R16","QF","SF","Final"];

  // Find champion from koPicks
  const champion = koPicks["final"] || null;

  const SCORING = [
    { label:"⚽ Grupe · Rezultat corect",  pts:30,  color:NAVY,   icon:"✓" },
    { label:"🥉 Best Third · per echipă",  pts:20,  color:"#7B2FBE",icon:"✓" },
    { label:"🏆 Round of 16",              pts:40,  color:RED,    icon:"✓" },
    { label:"🏆 Sferturi",                 pts:60,  color:RED,    icon:"✓" },
    { label:"🏆 Semifinale",               pts:90,  color:RED,    icon:"✓" },
    { label:"🏆 Finală",                   pts:120, color:"#D4820A",icon:"✓" },
  ];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden"}}>
      {/* Champion header */}
      <div style={{background:`linear-gradient(160deg,#D4820A,#F0A020)`,padding:"28px 20px 24px",textAlign:"center",flexShrink:0}}>
        <p style={{fontSize:10,fontWeight:900,color:"rgba(255,255,255,0.7)",margin:"0 0 8px",letterSpacing:3,textTransform:"uppercase"}}>Campioana ta prezisă</p>
        {champion ? (<>
          <span style={{fontSize:90,lineHeight:1,filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.4))"}}>{FLAGS[champion]||"🏳"}</span>
          <p style={{fontSize:28,fontWeight:900,color:"#fff",margin:"12px 0 4px",textShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>{champion}</p>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",margin:0,fontWeight:600}}>🏆 Câștigătoarea Mondialului 2026</p>
        </>) : (
          <p style={{fontSize:18,color:"rgba(255,255,255,0.6)",margin:"16px 0"}}>Nicio campioană selectată</p>
        )}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>Puncte per predicție corectă</p>
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:18}}>
          {SCORING.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",padding:"11px 16px",borderBottom:i<SCORING.length-1?"1px solid rgba(0,0,0,0.05)":"none",background:"#fff"}}>
              <span style={{fontSize:11,marginRight:8}}>{s.icon}</span>
              <span style={{flex:1,fontSize:12,fontWeight:600,color:DARK}}>{s.label}</span>
              <div style={{background:`${s.color}15`,borderRadius:8,padding:"3px 10px"}}>
                <span style={{fontSize:13,fontWeight:900,color:s.color}}>+{s.pts} pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Confirm button */}
        {!readOnly && (
          <button onClick={onConfirm}
            style={{width:"100%",padding:"16px 0",borderRadius:16,border:"none",marginBottom:24,
              background:`linear-gradient(135deg,${GREEN},#007A36)`,
              color:"#fff",fontSize:16,fontWeight:900,cursor:"pointer",
              boxShadow:"0 6px 20px rgba(0,154,68,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            ✅ Confirmă Predicțiile
          </button>
        )}
        {readOnly && (
          <div style={{width:"100%",padding:"16px 0",borderRadius:16,background:"#ccc",textAlign:"center",marginBottom:24}}>
            <span style={{fontSize:14,fontWeight:700,color:"#888"}}>🔒 Campionatul a început — predicții blocate</span>
          </div>
        )}
      </div>
    </div>
  );
}

function InstantPickScreen({ onBack, onComplete, savedState, onStateChange, tournamentStarted }) {
  const [flashState, setFlashState] = useState(null);
  const GROUPS = INTERACTIVE_GROUPS;
  const [stage, setStage] = useState(savedState?.stage||"groups");
  const [groupIdx, setGroupIdx] = useState(savedState?.groupIdx||0);
  const [matchIdx, setMatchIdx] = useState(savedState?.matchIdx||0);
  const [showSummary, setShowSummary] = useState(savedState?.showSummary||false);
  const [showIntro, setShowIntro] = useState(savedState?.showIntro!==undefined?savedState.showIntro:true);
  const [picks, setPicks] = useState(savedState?.picks||{});
  const [best3, setBest3] = useState(savedState?.best3||[]);
  const [koIdx, setKoIdx] = useState(savedState?.koIdx||0);
  const [koPicks, setKoPicks] = useState(savedState?.koPicks||{});
  const [koShowIntro, setKoShowIntro] = useState(savedState?.koShowIntro!==undefined?savedState.koShowIntro:true);
  const [koRound, setKoRound] = useState(savedState?.koRound||"R16");
  const [showFinalSummary, setShowFinalSummary] = useState(savedState?.showFinalSummary||false);

  // Save state whenever anything changes
  useEffect(()=>{
    if(onStateChange) onStateChange({stage,groupIdx,matchIdx,showSummary,showIntro,picks,best3,koIdx,koPicks,koShowIntro,koRound,showFinalSummary});
  },[stage,groupIdx,matchIdx,showSummary,showIntro,picks,best3,koIdx,koPicks,koShowIntro,koRound,showFinalSummary]);

  const resetGroup = () => {
    const keys = Object.keys(picks).filter(k=>k.startsWith(`${currentGroup}-`));
    setPicks(p=>{ const n={...p}; keys.forEach(k=>delete n[k]); return n; });
    setMatchIdx(0);
    setShowSummary(false);
    setShowIntro(false); // go straight to matches, not intro again
  };

  const currentGroup = GROUPS[groupIdx];
  const matchups = GROUP_MATCHUPS[currentGroup]||[];
  const totalGroupMatches = GROUPS.reduce((s,g)=>(GROUP_MATCHUPS[g]||[]).length+s,0);
  const completedGroupMatches = GROUPS.slice(0,groupIdx).reduce((s,g)=>(GROUP_MATCHUPS[g]||[]).length+s,0)+matchIdx;

  const handleGroupPick = (result) => {
    const key = `${currentGroup}-${matchIdx}`;
    setPicks(p=>({...p,[key]:result}));
    if(matchIdx < matchups.length-1) {
      setMatchIdx(m=>m+1);
    } else {
      setShowSummary(true);
    }
  };

  const handleGroupBack = () => {
    // Also clear the pick for the match we're going back to
    if(matchIdx > 0) {
      const prevKey = `${currentGroup}-${matchIdx-1}`;
      setPicks(p=>{ const n={...p}; delete n[prevKey]; return n; });
      setMatchIdx(m=>m-1);
    } else if(groupIdx > 0) {
      const prevGroup = GROUPS[groupIdx-1];
      const prevMatchIdx = (GROUP_MATCHUPS[prevGroup]||[]).length-1;
      const prevKey = `${prevGroup}-${prevMatchIdx}`;
      setPicks(p=>{ const n={...p}; delete n[prevKey]; return n; });
      setGroupIdx(g=>g-1);
      setMatchIdx(prevMatchIdx);
    }
  };

  const handleNextGroup = () => {
    setShowSummary(false);
    if(groupIdx < GROUPS.length-1) {
      setGroupIdx(g=>g+1);
      setMatchIdx(0);
      setShowIntro(true);
    } else {
      setStage("best3"); // go to best3 after all groups
    }
  };

  // Compute top 2 and 3rd place from picks for each group
  const getGroupStanding = (group) => {
    if(!INTERACTIVE_GROUPS.includes(group)) return getAutoStanding(group);
    const teams = ALL_GROUPS_DATA[group]||[];
    const pts = {}; teams.forEach(t=>{ pts[t]=0; });
    (GROUP_MATCHUPS[group]||[]).forEach(([h,a],i)=>{
      const p=picks[`${group}-${i}`];
      if(p==="home") pts[h]=(pts[h]||0)+3;
      else if(p==="away") pts[a]=(pts[a]||0)+3;
      else if(p==="draw"){pts[h]=(pts[h]||0)+1;pts[a]=(pts[a]||0)+1;}
    });
    return [...teams].sort((a,b)=>(pts[b]||0)-(pts[a]||0));
  };

  const handleKoPick = (result) => {
    const matchup = currentKo;
    if(!matchup) return;
    const winner = result==="home"?matchup.home:result==="away"?matchup.away:null;
    if(!winner) return; // no draw in KO
    setKoPicks(p=>({...p,[matchup.id]:winner}));
    const totalInRound = koRoundMatchups.length;
    const isLast = koIdx >= totalInRound - 1;
    if(!isLast) {
      setKoIdx(k=>k+1);
    } else {
      const rounds = ["R16","QF","SF","Final"];
      const nextRound = rounds[rounds.indexOf(koRound)+1];
      if(nextRound) {
        setKoRound(nextRound);
        setKoIdx(0);
        setKoShowIntro(true);
      } else {
        setShowFinalSummary(true);
      }
    }
  };

  // Build R16 matchups from group standings + best3
  const buildKoMatchups = () => {
    const s = (g) => getGroupStanding(g);
    const b = best3;
    return [
      // R16
      {id:"r16_0",round:"R16",home:s("A")[0],away:s("B")[1]},
      {id:"r16_1",round:"R16",home:s("C")[0],away:s("D")[1]},
      {id:"r16_2",round:"R16",home:s("E")[0],away:s("F")[1]},
      {id:"r16_3",round:"R16",home:s("G")[0],away:s("H")[1]},
      {id:"r16_4",round:"R16",home:s("B")[0],away:s("A")[1]},
      {id:"r16_5",round:"R16",home:s("D")[0],away:s("C")[1]},
      {id:"r16_6",round:"R16",home:s("F")[0],away:s("E")[1]},
      {id:"r16_7",round:"R16",home:s("H")[0],away:s("G")[1]},
      // QF - winners of R16
      {id:"qf_0",round:"QF",home:koPicks["r16_0"]||"W R16-1",away:koPicks["r16_1"]||"W R16-2"},
      {id:"qf_1",round:"QF",home:koPicks["r16_2"]||"W R16-3",away:koPicks["r16_3"]||"W R16-4"},
      {id:"qf_2",round:"QF",home:koPicks["r16_4"]||"W R16-5",away:koPicks["r16_5"]||"W R16-6"},
      {id:"qf_3",round:"QF",home:koPicks["r16_6"]||"W R16-7",away:koPicks["r16_7"]||"W R16-8"},
      // SF
      {id:"sf_0",round:"SF",home:koPicks["qf_0"]||"W QF-1",away:koPicks["qf_1"]||"W QF-2"},
      {id:"sf_1",round:"SF",home:koPicks["qf_2"]||"W QF-3",away:koPicks["qf_3"]||"W QF-4"},
      // Final
      {id:"final",round:"Final",home:koPicks["sf_0"]||"W SF-1",away:koPicks["sf_1"]||"W SF-2"},
    ];
  };
  const KO_MATCHUPS = buildKoMatchups();
  const koRoundMatchups = KO_MATCHUPS.filter(m=>m.round===koRound);
  const currentKo = koRoundMatchups[koIdx]||koRoundMatchups[0];
  const koLabel = koRound;
  const koTotal = koRoundMatchups.length;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden"}}>
      {/* Fixed header - color changes with pick */}
      <div style={{
        background: flashState
          ? flashState.winner==="draw"
            ? "linear-gradient(135deg,#444,#222)"
            : `linear-gradient(135deg,${flashState.colors[0]},${flashState.colors[1]})`
          : `linear-gradient(135deg,${NAVY},#001840)`,
        padding:"14px 20px 16px",flexShrink:0,transition:"background 0.2s"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div style={{flex:1}}>
            <p style={{fontSize:9,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA - WORLD CUP 2026</p>
            <h2 style={{fontSize:17,fontWeight:800,color:"#fff",margin:0}}>
              {stage==="groups" ? (showSummary ? `Grupa ${currentGroup} · Done` : `Grupa ${currentGroup}`) : stage==="best3" ? "🥉 Best Third" : koLabel}
            </h2>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:9,color:"rgba(255,255,255,0.5)",margin:"0 0 1px"}}>
              {stage==="groups" ? `${matchIdx+1}/${matchups.length}` : `${koIdx+1}/${koTotal}`}
            </p>
            <p style={{fontSize:9,color:"rgba(255,255,255,0.35)",margin:0}}>
              {stage==="groups" ? "meciuri" : "meciuri"}
            </p>
          </div>
        </div>
        {/* Stage pills — clickable navigation */}
        <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none"}}>
          {GROUPS.map((g,i)=>{
            const done = (GROUP_MATCHUPS[GROUPS[i]]||[]).every((_,mi)=>picks[`${GROUPS[i]}-${mi}`]);
            const active = i===groupIdx && stage==="groups";
            const canNav = true; // all groups always navigable
            return (
              <div key={g} onClick={()=>{
                if(!canNav && !active) return;
                setStage("groups");
                setGroupIdx(i);
                // If group is done -> show summary, else show intro or matches
                const groupDone = (GROUP_MATCHUPS[GROUPS[i]]||[]).every((_,mi)=>picks[`${GROUPS[i]}-${mi}`]);
                if(groupDone) { setShowSummary(true); setShowIntro(false); }
                else { setShowSummary(false); setShowIntro(true); }
              }}
                style={{flexShrink:0,width:32,height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,cursor:canNav?"pointer":"default",
                  background:done?GREEN:active?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.1)",
                  color:done?"#fff":active?NAVY:"rgba(255,255,255,0.4)"}}>
                {done?"✓":g}
              </div>
            );
          })}
          <div style={{width:1,background:"rgba(255,255,255,0.2)",margin:"4px 2px"}}/>
          {/* Best3 pill */}
          {(()=>{
            const allGroupsDone = GROUPS.every((_,i)=>i<groupIdx||(i===groupIdx&&showSummary)||stage==="best3"||stage==="ko");
            const b3done = stage==="ko";
            const b3active = stage==="best3";
            const canNav = allGroupsDone;
            return (
              <div onClick={()=>canNav&&setStage("best3")}
                style={{flexShrink:0,padding:"0 8px",height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,cursor:canNav?"pointer":"default",
                  background:b3done?GREEN:b3active?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.1)",
                  color:b3done?"#fff":b3active?NAVY:"rgba(255,255,255,0.4)"}}>
                {b3done?"✓":canNav?"B3":"🔒"}
              </div>
            );
          })()}
          <div style={{width:1,background:"rgba(255,255,255,0.2)",margin:"4px 2px"}}/>
          {/* KO pills */}
          {[{r:"R16",label:"R16"},{r:"QF",label:"QF"},{r:"SF",label:"SF"},{r:"Final",label:"F"}].map(({r,label})=>{
            const rounds = ["R16","QF","SF","Final"];
            const rIdx = rounds.indexOf(r);
            const curRoundIdx = rounds.indexOf(koRound);
            const done = stage==="ko" && rIdx < curRoundIdx;
            const active = stage==="ko" && r===koRound;
            const canNav = stage==="ko" && rIdx<=curRoundIdx;
            return (
              <div key={r} onClick={()=>canNav&&(setKoRound(r),setKoIdx(0),setKoShowIntro(true))}
                style={{flexShrink:0,padding:"0 8px",height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,cursor:canNav?"pointer":"default",
                  background:done?GREEN:active?"rgba(255,255,255,0.95)":stage==="ko"?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.08)",
                  color:done?"#fff":active?NAVY:"rgba(255,255,255,0.3)"}}>
                {stage==="ko"||canNav?label:"🔒"}
              </div>
            );
          })}
        </div>
        {/* Progress bar in header */}
        {(()=>{
          const groupsDone = GROUPS.filter(g=>(GROUP_MATCHUPS[g]||[]).every((_,mi)=>picks[`${g}-${mi}`])).length;
          const total = GROUPS.length; // 6 groups
          const pct = stage==="ko" ? 100 : stage==="best3" ? 100 : (groupsDone/total)*100;
          return (
            <div style={{marginTop:10,height:4,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,
                background:`linear-gradient(90deg,${RED},${GREEN})`,borderRadius:2,transition:"width 0.4s"}}/>
            </div>
          );
        })()}
      </div>

      {/* Content */}
      {stage==="best3" ? (
        <Best3Screen
          groups={ALL_GROUP_IDS}
          getGroupStanding={getGroupStanding}
          picks={picks}
          best3={best3}
          setBest3={setBest3}
          onDone={(b3)=>{ setBest3(b3); setStage("ko"); }}
        />
      ) : stage==="groups" ? (
        showIntro ? (
          <GroupIntroScreen group={currentGroup} onStart={()=>setShowIntro(false)}/>
        ) : showSummary ? (
          <GroupSummaryCard
            group={currentGroup}
            picks={picks}
            onNext={handleNextGroup}
            onReset={resetGroup}
            isLastGroup={groupIdx===GROUPS.length-1}
          />
        ) : (
          <MatchSwipeCard
            key={`${currentGroup}-${matchIdx}`}
            home={matchups[matchIdx][0]}
            away={matchups[matchIdx][1]}
            onPick={handleGroupPick}
            onFlash={setFlashState}
            existingPick={picks[`${currentGroup}-${matchIdx}`]||null}
            onBack={handleGroupBack}
            canGoBack={matchIdx>0||groupIdx>0}
            groupLabel={`Grupa ${currentGroup}`}
            matchNum={completedGroupMatches}
            totalMatches={totalGroupMatches}
          />
        )
      ) : showFinalSummary ? (
        <InstantPickSummaryScreen
          picks={picks}
          koPicks={koPicks}
          best3={best3}
          getGroupStanding={getGroupStanding}
          readOnly={tournamentStarted}
          onConfirm={()=>{ onComplete && onComplete(); }}
        />
      ) : koShowIntro ? (
        <GroupIntroScreen
          group={koRound}
          teams={koRoundMatchups.map(m=>[m.home,m.away])}
          isKo={true}
          onStart={()=>setKoShowIntro(false)}
        />
      ) : (
        <MatchSwipeCard
          key={`ko-${koRound}-${koIdx}`}
          home={currentKo?.home||"TBD"}
          away={currentKo?.away||"TBD"}
          onPick={handleKoPick}
          onFlash={setFlashState}
          onBack={()=>{ if(koIdx>0) setKoIdx(k=>k-1); else setKoShowIntro(true); }}
          canGoBack={koIdx>0}
          groupLabel={koLabel}
          matchNum={koIdx}
          totalMatches={koTotal}
          isKo={true}
        />
      )}
    </div>
  );
}

function PredictionsScreen({ boardId, predictions, setPredictions, onBack, onComplete, tournamentStarted }) {
  const TABS = [
    {id:"grupe",label:"Group Stage"},
    {id:"best3",label:"Best Third"},
    {id:"knockout",label:"Knockout"},
    {id:"boosters",label:"Boosters"},
  ];

  const [activeTab, setActiveTab] = useState("grupe");
  const groupRank = predictions.groupRank;
  const best3picks = predictions.best3picks;
  const knockoutPicks = predictions.knockoutPicks;
  const teamBooster = predictions.teamBooster;
  const golgheter = predictions.golgheter;

  const setGroupRank = (updater) => setPredictions(p => ({...p, groupRank: typeof updater==="function" ? updater(p.groupRank) : updater}));
  const setBest3picks = (updater) => setPredictions(p => ({...p, best3picks: typeof updater==="function" ? updater(p.best3picks) : updater}));
  const setKnockoutPicks = (updater) => setPredictions(p => ({...p, knockoutPicks: typeof updater==="function" ? updater(p.knockoutPicks) : updater}));
  const setTeamBooster = (val) => setPredictions(p => ({...p, teamBooster: typeof val==="function" ? val(p.teamBooster) : val}));
  const setGolgheter = (val) => setPredictions(p => ({...p, golgheter: typeof val==="function" ? val(p.golgheter) : val}));

  // Cascade reset helpers
  const resetFromBest3 = () => {
    setPredictions(p => ({...p, knockoutPicks:{}}));
  };
  const resetFromGroupStage = () => {
    setPredictions(p => ({...p, best3picks:[], knockoutPicks:{}}));
  };

  const setRank = (grupa,pos,echipa) => {
    setGroupRank(r=>{
      const g={...r[grupa]};
      if(g[pos]===echipa) delete g[pos]; else g[pos]=echipa;
      return {...r,[grupa]:g};
    });
    // Changing group stage resets everything downstream
    resetFromGroupStage();
  };

  const groupStageComplete = ["A","B"].every(g=>[1,2,3,4].every(p=>!!(groupRank[g]||{})[p]));
  const best3Complete = best3picks.length===8;

  const ALL_THIRDS = [
    {group:"A",team:groupRank["A"]?.[3]||"Morocco",flag:"🇲🇦"},
    {group:"B",team:groupRank["B"]?.[3]||"Poland",flag:"🇵🇱"},
    {group:"C",team:"Japan",flag:"🇯🇵"},
    {group:"D",team:"Senegal",flag:"🇸🇳"},
    {group:"E",team:"Croatia",flag:"🇭🇷"},
    {group:"F",team:"Australia",flag:"🇦🇺"},
    {group:"G",team:"Iran",flag:"🇮🇷"},
    {group:"H",team:"South Korea",flag:"🇰🇷"},
    {group:"I",team:"Ecuador",flag:"🇪🇨"},
    {group:"J",team:"Cameroon",flag:"🇨🇲"},
    {group:"K",team:"Qatar",flag:"🇶🇦"},
    {group:"L",team:"Costa Rica",flag:"🇨🇷"},
  ];

  const ALL_TEAMS_FLAT = Object.values(ECHIPE_DATA).flat();
  const PLAYERS_BY_TEAM = {
    "Brazil":["Vinicius Jr","Rodrygo","Neymar","Raphinha"],
    "France":["Mbappe","Griezmann","Dembele","Giroud"],
    "Mexico":["Lozano","Jimenez","Vega","Antuna"],
    "Morocco":["Ziyech","En-Nesyri","Boufal","Sabiri"],
    "Argentina":["Messi","Di Maria","Lautaro","Alvarez"],
    "England":["Kane","Bellingham","Saka","Rashford"],
    "USA":["Pulisic","Reyna","Ferreira","Weah"],
    "Poland":["Lewandowski","Zielinski","Szymanski","Milik"],
    "Spain":["Morata","Pedri","Gavi","Yamal"],
    "Portugal":["Ronaldo","Felix","Leao","Bernardo"],
    "Japan":["Minamino","Doan","Maeda","Ito"],
    "Canada":["Davies","David","Buchanan","Larin"],
    "Germany":["Havertz","Gnabry","Musiala","Werner"],
    "Netherlands":["Van Dijk","Depay","Gakpo","Simons"],
    "Senegal":["Mane","Dia","Diatta","Sarr"],
    "Australia":["Leckie","Hrustic","Irvine","Duke"],
    "Belgium":["Lukaku","De Bruyne","Hazard","Trossard"],
    "Croatia":["Modric","Perisic","Kovacic","Kramaric"],
  };
  const GOALSCORERS = ["Mbappe","Messi","Ronaldo","Haaland","Vinicius Jr","Bellingham","Kane","Lewandowski"];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px 10px"}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff",flexShrink:0}}>&#8249;</div>
          <div style={{flex:1}}>
            <p style={{fontSize:9,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA - WORLD CUP 2026</p>
            <h2 style={{fontSize:17,fontWeight:800,color:"#fff",margin:0}}>Instant Pick ⚡</h2>
            {boardId&&boardId!=="global"&&<p style={{fontSize:10,color:"rgba(255,255,255,0.5)",margin:"2px 0 0"}}>{boardId}</p>}
          </div>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff"}}>🔔</div>
        </div>
        <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",paddingLeft:8,paddingRight:8}}>
          {TABS.map(t=>{
            const locked=(t.id==="best3"&&!groupStageComplete)||(t.id==="knockout"&&!best3Complete)||(t.id==="boosters"&&!best3Complete);
            return (
              <button key={t.id} onClick={()=>!locked&&setActiveTab(t.id)}
                style={{flexShrink:0,padding:"9px 14px",border:"none",fontSize:12,fontWeight:700,cursor:locked?"default":"pointer",background:"transparent",
                  color:activeTab===t.id?"#fff":locked?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.45)",position:"relative",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                {locked&&<span style={{fontSize:10}}>🔒</span>}
                {t.label}
                {activeTab===t.id&&<div style={{position:"absolute",bottom:0,left:6,right:6,height:3,borderRadius:"3px 3px 0 0",background:RED}}/>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 20px 24px"}}>

        {activeTab==="grupe" && (
          <>
            <div style={{background:"#E8F0FF",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:15}}>⚽</span>
              <div style={{flex:1}}>
                <p style={{fontSize:12,fontWeight:700,color:NAVY,margin:"0 0 1px"}}>Group Stage</p>
                <p style={{fontSize:11,color:"#666",margin:0}}>Selecteaza ordinea finala pentru Grupa A si B.</p>
              </div>
              {groupStageComplete&&<span style={{fontSize:16}}>✅</span>}
            </div>
            <GrupeTab groupRank={groupRank} setRank={setRank} onComplete={()=>setActiveTab("best3")}/>
          </>
        )}

        {activeTab==="best3" && (
          <>
            {/* Selected chips header */}
            <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,borderRadius:16,padding:"12px 14px",marginBottom:10,boxShadow:SHADOW_OUT}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:800,color:"#fff"}}>🥉 Best Third</span>
                <span style={{fontSize:12,fontWeight:700,
                  background:best3picks.length===8?GREEN:"rgba(255,255,255,0.15)",
                  color:"#fff",borderRadius:8,padding:"3px 10px",transition:"background 0.3s"}}>
                  {best3picks.length}/8
                </span>
              </div>
              {best3picks.length===0 ? (
                <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:0,fontStyle:"italic"}}>
                  Selecteaza 8 echipe de pe locul 3...
                </p>
              ) : (
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {best3picks.map(team=>{
                    const t=ALL_THIRDS.find(x=>x.team===team);
                    return (
                      <div key={team} style={{display:"flex",alignItems:"center",gap:4,
                        background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"4px 10px 4px 7px"}}>
                        <span style={{fontSize:14}}>{t?.flag||"🏳"}</span>
                        <span style={{fontSize:11,fontWeight:700,color:"#fff",marginLeft:2}}>{team.split(" ")[0]}</span>
                        <button onClick={()=>{ setBest3picks(p=>p.filter(x=>x!==team)); resetFromBest3(); }}
                          style={{fontSize:13,color:"rgba(255,255,255,0.5)",background:"transparent",
                            border:"none",cursor:"pointer",padding:"0 0 0 4px",lineHeight:1}}>✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div style={{height:4,borderRadius:2,background:"rgba(0,0,0,0.08)",marginBottom:12,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(best3picks.length/8)*100}%`,
                background:`linear-gradient(90deg,${NAVY},${RED})`,borderRadius:2,transition:"width 0.3s"}}/>
            </div>

            {/* Available teams list — only unselected */}
            <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:12}}>
              <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"10px 14px",
                display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:13,fontWeight:800,color:"#fff"}}>Echipe locul 3</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>
                  {best3picks.length===8 ? "Complet ✓" : `${8-best3picks.length} ramase`}
                </span>
              </div>
              {ALL_THIRDS.filter(({team})=>!best3picks.includes(team)).length===0 ? (
                <div style={{padding:"18px 14px",textAlign:"center"}}>
                  <span style={{fontSize:22}}>✅</span>
                  <p style={{fontSize:13,fontWeight:700,color:GREEN,margin:"6px 0 0"}}>Toate 8 echipe selectate!</p>
                </div>
              ) : (
                ALL_THIRDS.filter(({team})=>!best3picks.includes(team)).map(({group,team,flag},i,arr)=>{
                  const isFull = best3picks.length===8;
                  return (
                    <div key={group}
                      onClick={()=>{ if(!isFull){ setBest3picks(p=>[...p,team]); resetFromBest3(); } }}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
                        borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,0.05)":"none",
                        cursor:isFull?"default":"pointer",
                        background:"#fff",
                        opacity:isFull?0.4:1,
                        transition:"opacity 0.2s",
                        touchAction:"pan-y",
                        userSelect:"none"}}>
                      <span style={{fontSize:10,background:`linear-gradient(135deg,${NAVY},#001840)`,
                        color:"#fff",borderRadius:5,padding:"2px 6px",fontWeight:700,flexShrink:0}}>
                        GR.{group}
                      </span>
                      <span style={{fontSize:20}}>{flag}</span>
                      <span style={{flex:1,fontSize:13,fontWeight:500,color:DARK}}>{team}</span>
                      <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
                        border:`2px solid #ddd`,background:"transparent"}}/>
                    </div>
                  );
                })
              )}
            </div>

            {/* Always visible nav buttons */}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setActiveTab("grupe")}
                style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
                  background:BG,boxShadow:SHADOW_OUT,fontSize:12,fontWeight:700,
                  cursor:"pointer",color:"#888"}}>
                ← Grupe
              </button>
              <button onClick={()=>{ if(best3Complete) setActiveTab("knockout"); }}
                style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
                  background:best3Complete?`linear-gradient(135deg,${NAVY},#001840)`:"#e0e0e0",
                  color:best3Complete?"#fff":"#bbb",fontSize:12,fontWeight:700,
                  cursor:best3Complete?"pointer":"default",
                  boxShadow:best3Complete?"0 4px 12px rgba(0,32,91,0.3)":"none",
                  transition:"all 0.2s"}}>
                Knockout →
              </button>
            </div>
          </>
        )}

        {activeTab==="knockout" && (
          <KnockoutTab knockoutPicks={knockoutPicks}
            setKnockoutPicks={(updater) => {
              const r16ids = ["r16_0","r16_1","r16_2","r16_3","r16_4","r16_5","r16_6","r16_7"];
              const qfids  = ["qf_0","qf_1","qf_2","qf_3"];
              const sfids  = ["sf_0","sf_1"];
              const finalids = ["f_0","3rd_0"];
              setKnockoutPicks(prev => {
                const next = typeof updater === "function" ? updater(prev) : updater;
                const changedId = Object.keys({...prev,...next}).find(k => next[k] !== prev[k]);
                const result = {...next};
                if(changedId) {
                  if(r16ids.includes(changedId)) [...qfids,...sfids,...finalids].forEach(id => delete result[id]);
                  else if(qfids.includes(changedId)) [...sfids,...finalids].forEach(id => delete result[id]);
                  else if(sfids.includes(changedId)) finalids.forEach(id => delete result[id]);
                }
                return result;
              });
            }}
            best3picks={best3picks} groupRank={groupRank}
            onComplete={()=>setActiveTab("boosters")}/>
        )}

        {activeTab==="boosters" && (
          <>
            <div style={{background:"#E8F0FF",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:15}}>⚡</span>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:NAVY,margin:"0 0 1px"}}>Boosters & Others</p>
                <p style={{fontSize:11,color:"#666",margin:0}}>Dubleaza punctele + bonusuri speciale</p>
              </div>
            </div>
            <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
              <div style={{background:"linear-gradient(135deg,#7B2FBE,#5B1F9E)",padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:800,color:"#fff",margin:0}}>💎 Team Booster</p>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",margin:"2px 0 0"}}>Dubleaza toate punctele pentru o echipa</p>
                </div>
                <span style={{fontSize:13,background:"rgba(255,255,255,0.2)",color:"#fff",borderRadius:8,padding:"4px 10px",fontWeight:800}}>x2</span>
              </div>
              <div style={{padding:"14px"}}>
                {teamBooster ? (
                  <div style={{display:"flex",alignItems:"center",gap:12,
                    background:"#F0E8FF",borderRadius:12,padding:"14px"}}>
                    <span style={{fontSize:28}}>{FLAGS[teamBooster]||"🏳"}</span>
                    <div style={{flex:1}}>
                      <p style={{fontSize:15,fontWeight:800,color:"#7B2FBE",margin:0}}>{teamBooster}</p>
                      <p style={{fontSize:11,color:"#9B6FD4",margin:"3px 0 0"}}>x2 puncte pe tot turneul</p>
                    </div>
                    <button onClick={()=>setTeamBooster(null)}
                      style={{width:28,height:28,borderRadius:"50%",background:"rgba(123,47,190,0.15)",
                        border:"none",cursor:"pointer",fontSize:14,color:"#7B2FBE",
                        display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{fontSize:10,color:"#aaa",margin:"0 0 10px",fontStyle:"italic"}}>
                      Selecteaza echipa pentru booster
                    </p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {ALL_TEAMS_FLAT.map(t=>(
                        <button key={t} onClick={()=>setTeamBooster(t)}
                          style={{display:"flex",alignItems:"center",gap:4,padding:"6px 10px",
                            borderRadius:9,border:"none",background:BG,color:DARK,
                            boxShadow:SHADOW_OUT,cursor:"pointer",fontSize:11}}>
                          <span style={{fontSize:14}}>{FLAGS[t]||"🏳"}</span>{t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
              <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:800,color:"#fff",margin:0}}>⚽ Golgheter</p>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",margin:"2px 0 0"}}>Jucatorul cu cele mai multe goluri</p>
                </div>
                <span style={{fontSize:13,background:"rgba(255,255,255,0.15)",color:"#fff",borderRadius:8,padding:"4px 10px",fontWeight:800}}>+100pts</span>
              </div>
              <div style={{padding:"14px"}}>
                {golgheter ? (
                  <div style={{display:"flex",alignItems:"center",gap:12,
                    background:"#E8F0FF",borderRadius:12,padding:"14px"}}>
                    <span style={{fontSize:28}}>⚽</span>
                    <div style={{flex:1}}>
                      <p style={{fontSize:15,fontWeight:800,color:NAVY,margin:0}}>{golgheter}</p>
                      <p style={{fontSize:11,color:"#6699CC",margin:"3px 0 0"}}>+100 pts bonus</p>
                    </div>
                    <button onClick={()=>setGolgheter(null)}
                      style={{width:28,height:28,borderRadius:"50%",background:"rgba(0,32,91,0.1)",
                        border:"none",cursor:"pointer",fontSize:14,color:NAVY,
                        display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{fontSize:10,color:"#aaa",margin:"0 0 10px",fontStyle:teamBooster?"normal":"italic"}}>
                      {teamBooster?`Jucatori din ${teamBooster}`:"Selecteaza Team Booster pentru jucatori specifici"}
                    </p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {(teamBooster&&PLAYERS_BY_TEAM[teamBooster]?PLAYERS_BY_TEAM[teamBooster]:GOALSCORERS).map(p=>(
                        <button key={p} onClick={()=>setGolgheter(p)}
                          style={{padding:"7px 12px",borderRadius:9,border:"none",
                            background:BG,color:DARK,boxShadow:SHADOW_OUT,
                            cursor:"pointer",fontSize:12,fontWeight:400}}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          {/* Done button */}
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button onClick={()=>setActiveTab("knockout")}
              style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
                background:BG,boxShadow:SHADOW_OUT,fontSize:12,fontWeight:700,cursor:"pointer",color:"#888"}}>
              ← Knockout
            </button>
            <button onClick={onComplete||onBack}
              style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
                background:`linear-gradient(135deg,${GREEN},#007A36)`,color:"#fff",
                fontSize:12,fontWeight:700,cursor:"pointer",
                boxShadow:"0 4px 12px rgba(0,154,68,0.3)"}}>
              ✓ Done
            </button>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── CIRCLE TAB ────────────────────────────────────────────────────────────────
function CircleTab({ label, name, isActive, onClick }) {
  return (
    <div onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",flexShrink:0}}>
      <div style={{
        width:isActive?52:44, height:isActive?52:44,
        borderRadius:"50%",
        background:isActive?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.1)",
        border:isActive?"3px solid #fff":"2px solid rgba(255,255,255,0.2)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:isActive?24:19,
        transition:"all 0.2s",
        boxShadow:isActive?"0 4px 16px rgba(0,0,0,0.25)":"none",
      }}>
        {label}
      </div>
      <span style={{
        fontSize:isActive?10:9,
        color:isActive?"#fff":"rgba(255,255,255,0.45)",
        fontWeight:isActive?800:500,
        maxWidth:56,textAlign:"center",lineHeight:1.2,
      }}>{name}</span>
      {isActive && <div style={{width:4,height:4,borderRadius:"50%",background:"#fff",marginTop:-2}}/>}
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeScreen({ onPredict, onLeaderboard, onBoards, onOpenGroups, myBoards, predictionsComplete, instantPickDone, exactScores, activeBoardId, setActiveBoardId, tournamentStarted }) {
  const activeId = activeBoardId;
  const setActiveId = setActiveBoardId;
  const leaders = BOARD_LEADERS.global;
  const top3 = leaders.slice(0,3);
  const me = leaders.find(u=>u.isMe);
  const meInTop3 = top3.some(u=>u.isMe);
  const activeBoard = myBoards.find(b=>b.id===activeId)||myBoards[0];
  const membersLabel = activeBoard?.members>999?`${(activeBoard.members/1000).toFixed(0)}k`:activeBoard?.members;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"14px 20px 18px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <p style={{fontSize:9,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA - WORLD CUP 2026</p>
            <h2 style={{fontSize:18,fontWeight:800,color:"#fff",margin:"0 0 2px"}}>{activeBoard?.name||"Global Board"}</h2>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.4)",margin:0}}>👥 {membersLabel} participanti</p>
          </div>
          <div style={{width:38,height:38,borderRadius:11,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🔔</div>
        </div>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
          {myBoards.map(b=><CircleTab key={b.id} label={b.label} name={b.isGlobal?"Global":b.name.split(" ")[0]} isActive={activeId===b.id} onClick={()=>setActiveId(b.id)}/>)}
          <div onClick={onBoards} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",flexShrink:0}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:"transparent",border:"2px dashed rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"rgba(255,255,255,0.4)"}}>+</div>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontWeight:500}}>Adauga</span>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 20px 0"}}>
        {/* Top Players */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>🏆 Top Players</p>
          <span onClick={onLeaderboard} style={{fontSize:12,color:NAVY,fontWeight:700,cursor:"pointer"}}>Vezi tot ›</span>
        </div>
        <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
          {top3.map(u=>(
            <div key={u.rank} style={{display:"flex",alignItems:"center",background:u.accent||BG,padding:"9px 14px",gap:10,borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
              <span style={{fontSize:20,width:26,textAlign:"center"}}>{u.emoji||`#${u.rank}`}</span>
              <div style={{flex:1}}>
                <span style={{fontSize:13,fontWeight:700,color:u.isMe?NAVY:DARK}}>{u.name}</span>
                {u.prize&&<span style={{fontSize:10,color:"#D4820A",fontWeight:600,marginLeft:6}}>🎁 {u.prize}</span>}
              </div>
              <span style={{fontSize:13,fontWeight:800,color:u.isMe?NAVY:DARK}}>{u.pts} pts</span>
            </div>
          ))}
          {!meInTop3&&me&&(
            <>
              <div style={{display:"flex",alignItems:"center",padding:"4px 14px"}}>
                <div style={{flex:1,height:1,background:"rgba(0,0,0,0.06)"}}/>
                <span style={{fontSize:11,color:"#ccc",padding:"0 6px"}}>···</span>
                <div style={{flex:1,height:1,background:"rgba(0,0,0,0.06)"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",background:"#E8F0FF",padding:"9px 14px",gap:10}}>
                <span style={{fontSize:13,fontWeight:700,color:NAVY,width:26,textAlign:"center"}}>#{me.rank}</span>
                <div style={{flex:1}}><span style={{fontSize:13,fontWeight:700,color:NAVY}}>{me.name}</span></div>
                <span style={{fontSize:13,fontWeight:800,color:NAVY}}>{me.pts} pts</span>
              </div>
            </>
          )}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {/* Instant Pick ⚡ button */}
          {(() => {
            const boardDone = instantPickDone || predictionsComplete[activeId];
            if(tournamentStarted) return (
              <div style={{width:"100%",background:"#c8c8c8",borderRadius:14,padding:"15px 20px",
                display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"default"}}>
                <span style={{fontSize:15,fontWeight:700,color:"#888"}}>🔒 Predictions</span>
                <span style={{fontSize:12,color:"#aaa",fontWeight:600}}>Campionatul a inceput</span>
              </div>
            );
            if(boardDone) return (
              <button onClick={()=>onPredict(activeId)} style={{width:"100%",
                background:`linear-gradient(135deg,${GREEN},#007A36)`,
                color:"#fff",border:"none",borderRadius:14,padding:"13px 20px",fontSize:15,fontWeight:700,
                cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                boxShadow:"0 6px 20px rgba(0,154,68,0.35)"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2}}>
                  <span style={{fontSize:15,fontWeight:800}}>✅ Predictions</span>
                  <span style={{fontSize:10,opacity:0.8,fontWeight:600}}>From groups to glory 🏆</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                  <div style={{background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center",justifyContent:"center",gap:4,minWidth:62}}>
                    <span style={{fontSize:10}}>✅</span>
                    <span style={{fontSize:9,color:"#fff",fontWeight:700}}>Done</span>
                  </div>
                  <span style={{fontSize:9,color:"rgba(255,255,255,0.7)",fontWeight:600}}>Atinge pentru a edita</span>
                </div>
              </button>
            );
            return (
              <button onClick={()=>onPredict(activeId)} style={{width:"100%",
                background:`linear-gradient(135deg,${RED},#EF3340 40%,${GREEN} 100%)`,
                color:"#fff",border:"none",borderRadius:14,padding:"13px 20px",fontSize:15,fontWeight:700,
                cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                boxShadow:"0 6px 20px rgba(200,16,46,0.3)"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2}}>
                  <span style={{fontSize:15,fontWeight:800}}>🎯 Predictions</span>
                  <span style={{fontSize:10,opacity:0.75,fontWeight:600}}>From groups to glory 🏆</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                  <div style={{background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center",justifyContent:"center",gap:4,minWidth:62}}>
                    <span style={{fontSize:10}}>🎯</span>
                    <span style={{fontSize:9,color:"#fff",fontWeight:700}}>Once</span>
                  </div>
                  <span style={{fontSize:9,color:"rgba(255,255,255,0.6)",fontWeight:600}}>deadline 11 Iunie</span>
                </div>
              </button>
            );
          })()}
          {/* Exact Score & Bracket */}
          <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
            {(()=>{
              // Unlock next week every Sunday after 20:00
              // Week windows: W1=June 8-14, W2=June 15-21, W3=June 22-28, W4=June 29+
              const now = new Date();
              const june = (d) => new Date(2026, 5, d, 20, 0, 0); // June, 20:00
              const w1Open = true;                          // always open
              const w2Open = now >= june(14);               // Sun June 14 after 20:00
              const w3Open = now >= june(21);               // Sun June 21
              const w4Open = now >= june(28);               // Sun June 28
              // Check how many matches per week have scores
              const matchesInWeek = (start) => {
                const days = Array.from({length:7},(_,i)=>start+i).filter(d=>d>=1&&d<=30);
                const mm = {};
                CALENDAR_EVENTS.forEach(e=>{ mm[e.day]=e.matches; });
                return days.reduce((s,d)=>s+(mm[d]||[]).length,0);
              };
              const scoredInWeek = (start) => {
                const days = Array.from({length:7},(_,i)=>start+i).filter(d=>d>=1&&d<=30);
                const mm = {};
                CALENDAR_EVENTS.forEach(e=>{ mm[e.day]=e.matches; });
                return days.reduce((s,d)=>s+(mm[d]||[]).filter((_,i)=>(exactScores||{})[`${d}-${i}`]).length,0);
              };
              const w1done = w1Open && scoredInWeek(8)>0 && scoredInWeek(8)===matchesInWeek(8);
              const w2done = w2Open && scoredInWeek(15)>0 && scoredInWeek(15)===matchesInWeek(15);
              const w3done = w3Open && scoredInWeek(22)>0 && scoredInWeek(22)===matchesInWeek(22);
              const w4done = w4Open && scoredInWeek(29)>0 && scoredInWeek(29)===matchesInWeek(29);
              const weeks = [
                {label:"8-14 Iun",  locked:!w1Open, done:w1done, deadline:"deadline 11 Iun"},
                {label:"15-21 Iun", locked:!w2Open, done:w2done, deadline:"deadline 14 Iun"},
                {label:"22-28 Iun", locked:!w3Open, done:w3done, deadline:"deadline 21 Iun"},
                {label:"29+ Iun",   locked:!w4Open, done:w4done, deadline:"deadline 28 Iun"},
              ];
              return (
                <>
                  <div style={{background:`linear-gradient(135deg,${RED},#EF3340 40%,${GREEN} 100%)`,
                    padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2}}>
                      <p style={{fontSize:14,fontWeight:800,color:"#fff",margin:0}}>⚽ Exact Score & 🏆 Bracket</p>
                      <p style={{fontSize:10,color:"rgba(255,255,255,0.7)",margin:0}}>Se deblochează săptămânal · Tot turneul</p>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                      <div style={{background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center",justifyContent:"center",gap:4,minWidth:62}}>
                        <span style={{fontSize:10}}>🔔</span>
                        <span style={{fontSize:9,color:"#fff",fontWeight:700}}>Weekly</span>
                      </div>
                      <span style={{fontSize:9,color:"rgba(255,255,255,0.6)",fontWeight:600}}>deadline 11 Iunie</span>
                    </div>
                  </div>
                  <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:4}}>
                    {weeks.map((s,i)=>(
                      <div key={i}
                        onClick={()=>!s.locked&&onOpenGroups&&onOpenGroups()}
                        style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                          cursor:s.locked?"default":"pointer"}}>
                        <div style={{width:34,height:34,borderRadius:"50%",
                          background:s.locked?"rgba(0,0,0,0.04)":s.done?GREEN:"#E8F0FF",
                          border:s.locked?"1.5px dashed #ddd":s.done?`1.5px solid ${GREEN}`:`1.5px solid ${NAVY}`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:s.locked?12:14,
                          boxShadow:s.locked?"none":`0 2px 8px ${s.done?"rgba(0,154,68,0.3)":"rgba(0,32,91,0.15)"}`}}>
                          {s.locked ? "🔒" : s.done ? "✅" : "⚽"}
                        </div>
                        <span style={{fontSize:8,fontWeight:600,color:s.locked?"#ccc":s.done?GREEN:NAVY,textAlign:"center",lineHeight:1.2}}>
                          {s.label}
                        </span>

                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BOARDS ────────────────────────────────────────────────────────────────────
function BoardsScreen({ onBack, myBoards, setMyBoards }) {
  const [code, setCode] = useState("");
  const joinBoard = b => { if(!myBoards.find(x=>x.id===b.id)) setMyBoards(p=>[...p,{...b}]); };
  const isJoined = id => myBoards.some(b=>b.id===id);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"16px 20px 22px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div>
            <p style={{fontSize:9,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA - WORLD CUP 2026</p>
            <h2 style={{fontSize:17,fontWeight:800,color:"#fff",margin:0}}>Boards</h2>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 20px 24px"}}>
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_IN,padding:"11px 14px",display:"flex",gap:10,alignItems:"center",marginBottom:18}}>
          <span style={{fontSize:16}}>🔑</span>
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Introdu codul unui board..." style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:DARK}}/>
          <button style={{background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",border:"none",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Join</button>
        </div>
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>Board-uri disponibile</p>
        {AVAILABLE_BOARDS.map(b=>(
          <div key={b.id} style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"12px 14px",marginBottom:9,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${NAVY},#001840)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{b.label}</div>
            <div style={{flex:1}}>
              <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{b.name}</p>
              <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0"}}>{b.members}{b.max?"/"+b.max:""} membri</p>
            </div>
            {isJoined(b.id)?(
              <div style={{background:"#E8F0FF",borderRadius:9,padding:"7px 12px",fontSize:11,fontWeight:700,color:NAVY}}>Inscris</div>
            ):(
              <button onClick={()=>joinBoard(b)} style={{background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",border:"none",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Join</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({ active, onNavigate, lang }) {
  const tabs = [
    {key:SCREENS.HOME,icon:"🏟️",label:"Boards"},
    {key:SCREENS.RULES,icon:"📖",label:"Rules"},
    {key:SCREENS.ACCOUNT,icon:"👤",label:"Account"},
  ];
  return (
    <div style={{flexShrink:0,background:BG,borderTop:"1px solid rgba(0,0,0,0.08)",display:"flex",alignItems:"stretch",height:64}}>
      {tabs.map(tab=>{
        const isActive=active===tab.key;
        return (
          <button key={tab.key} onClick={()=>onNavigate(tab.key)} style={{flex:1,background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,padding:0}}>
            {tab.accent?(
              <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${NAVY},#001840)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(0,32,91,0.4)",marginTop:-16}}>
                <span style={{fontSize:20}}>{tab.icon}</span>
              </div>
            ):(
              <>
                <span style={{fontSize:22,opacity:isActive?1:0.35}}>{tab.icon}</span>
                <span style={{fontSize:10,fontWeight:isActive?700:500,color:isActive?NAVY:"#aaa"}}>{tab.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

function LangSelector({ lang, setLang }) {
  const [open,setOpen]=useState(false);
  const cur=LANGS.find(l=>l.code===lang);
  return (
    <div style={{position:"relative",zIndex:100}}>
      <div onClick={()=>setOpen(o=>!o)} style={{width:44,height:44,borderRadius:12,background:"#F0F4FF",border:"1px solid rgba(0,32,91,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer"}}>{cur.flag}</div>
      {open&&(
        <div style={{position:"absolute",top:52,right:0,background:"#fff",border:"1px solid rgba(0,32,91,0.1)",borderRadius:14,overflow:"hidden",minWidth:160,zIndex:200,boxShadow:"0 12px 40px rgba(0,32,91,0.15)"}}>
          {LANGS.map(l=>(
            <div key={l.code} onClick={()=>{setLang(l.code);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:lang===l.code?"#F0F4FF":"transparent",cursor:"pointer",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
              <span style={{fontSize:20}}>{l.flag}</span>
              <span style={{fontSize:14,fontWeight:lang===l.code?700:400,color:lang===l.code?NAVY:"#555"}}>{l.name}</span>
              {lang===l.code&&<span style={{marginLeft:"auto",fontSize:12,color:RED}}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SplashScreen({ onNext, lang, setLang }) {
  const { d, h, m, s } = useCountdown();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: "#fff" }}>
      {/* Background trophy image */}
      <img
        src={trophy}
        alt="FIFA World Cup Trophy"
        style={{
          position: "absolute",
          width: "130%",
          height: "85%",
          left: "-30%",
          top: "20%",
          objectFit: "cover",
          objectPosition: "center 20%",
          zIndex: 0,
          mixBlendMode: "multiply",
          opacity: 0.9,
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 22px 0", position: "relative", zIndex: 10 }}>
        <div style={{ width: 44 }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "#C8102E", margin: "0 0 2px", letterSpacing: 3, textTransform: "uppercase", fontWeight: 800 }}>FIFA</p>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#00205B", margin: 0, letterSpacing: -0.5 }}>WORLD CUP 2026</h1>
          <p style={{ fontSize: 11, color: "#888", margin: "3px 0 0", letterSpacing: 0.5 }}>{T[lang].location}</p>
        </div>
        <LangSelector lang={lang} setLang={setLang} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ margin: "0 20px 14px", background: "rgba(0, 32, 91, 0.6)", borderRadius: 20, padding: "16px 8px 12px", display: "flex", position: "relative", zIndex: 10 }}>
        {[{ v: d, l: "days" }, { v: h, l: "hours" }, { v: m, l: "minutes" }, { v: s, l: "seconds" }].map(({ v, l }, i) => (
          <div key={l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{String(v).padStart(2, "0")}</span>
            {i < 3 && <span style={{ position: "absolute", right: -2, top: 2, fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.25)" }}>:</span>}
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 6 }}>{T[lang][l.toLowerCase()] || l}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 32px", position: "relative", zIndex: 10 }}>
        <button onClick={onNext} style={{ width: "100%", background: "linear-gradient(135deg, #C8102E 0%, #EF3340 50%, #009A44 100%)", color: "#fff", border: "none", borderRadius: 16, padding: "17px 0", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(0,32,91,0.3)", letterSpacing: 0.5 }}>
          {T[lang].cta}
        </button>
      </div>
    </div>
  );
}

function LoginScreen({ onNext }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"40px 28px 36px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{width:72,height:72,borderRadius:22,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,marginBottom:16}}>🏆</div>
        <p style={{fontSize:10,color:RED,margin:"0 0 4px",letterSpacing:3,textTransform:"uppercase",fontWeight:800}}>WORLD CUP 2026</p>
        <h2 style={{fontSize:24,fontWeight:800,color:"#fff",margin:"0 0 6px",textAlign:"center"}}>Join the Game</h2>
      </div>
      <div style={{flex:1,padding:"28px 24px 36px",display:"flex",flexDirection:"column"}}>
        {[{icon:"G",label:"Continue with Google",bg:BG,color:DARK,shadow:SHADOW_OUT},{icon:"f",label:"Continue with Facebook",bg:"#1877F2",color:"#fff",shadow:"0 4px 14px rgba(24,119,242,0.4)"},{icon:"📷",label:"Continue with Instagram",bg:"#E1306C",color:"#fff",shadow:"0 4px 14px rgba(225,48,108,0.4)"}].map(({icon,label,bg,color,shadow})=>(
          <button key={label} onClick={onNext} style={{width:"100%",background:bg,color,border:"none",borderRadius:14,padding:"14px 20px",fontSize:15,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:12,boxShadow:shadow,marginBottom:10}}>
            <span style={{fontSize:18,width:24,textAlign:"center"}}>{icon}</span>{label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LeaderboardScreen({ onBack }) {
  const leaders = BOARD_LEADERS.global;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"16px 20px 20px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div style={{textAlign:"center"}}>
            <p style={{fontSize:10,color:RED,margin:0,letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA</p>
            <span style={{fontSize:16,fontWeight:800,color:"#fff"}}>Clasament</span>
          </div>
          <div style={{width:36}}/>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 20px"}}>
        {leaders.map(u=>(
          <div key={u.rank} style={{display:"flex",alignItems:"center",background:u.isMe?"#E8F0FF":u.accent||BG,borderRadius:14,padding:"11px 14px",gap:10,marginBottom:8,boxShadow:u.isMe?`0 0 0 2px ${NAVY},${SHADOW_OUT}`:SHADOW_OUT}}>
            <span style={{fontSize:u.emoji?22:13,fontWeight:700,color:u.isMe?NAVY:"#aaa",width:28,textAlign:"center"}}>{u.emoji||`#${u.rank}`}</span>
            <div style={{flex:1}}>
              <span style={{fontSize:14,fontWeight:700,color:u.isMe?NAVY:DARK}}>{u.name}</span>
              {u.prize&&<span style={{fontSize:11,color:"#D4820A",fontWeight:600,marginLeft:8}}>{u.prize}</span>}
            </div>
            <span style={{fontSize:14,fontWeight:800,color:u.isMe?NAVY:DARK}}>{u.pts} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FastPredictionScreen({ onHome }) {
  const cards=[{home:"Brazil",homeFlag:"🇧🇷",away:"Portugal",awayFlag:"🇵🇹"},{home:"Spain",homeFlag:"🇪🇸",away:"Germany",awayFlag:"🇩🇪"},{home:"France",homeFlag:"🇫🇷",away:"England",awayFlag:"🏴󠁧󠁢󠁥󠁧󠁿"}];
  const [idx,setIdx]=useState(0);
  const [chosen,setChosen]=useState(null);
  const pick=w=>{setChosen(w);setTimeout(()=>{setChosen(null);setIdx(i=>i+1);},650);};
  if(idx>=cards.length) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,alignItems:"center",justifyContent:"center",padding:"0 28px"}}>
      <div style={{width:80,height:80,borderRadius:24,background:`linear-gradient(135deg,${GREEN},#007A36)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,marginBottom:22}}>⚡</div>
      <h2 style={{fontSize:26,fontWeight:800,color:DARK,margin:"0 0 20px"}}>All done!</h2>
      <button onClick={onHome} style={{width:"100%",background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",border:"none",borderRadius:16,padding:"16px 0",fontSize:16,fontWeight:700,cursor:"pointer"}}>Back to Home</button>
    </div>
  );
  const card=cards[idx];
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"16px 20px 20px",textAlign:"center"}}>
        <p style={{fontSize:10,color:RED,margin:0,letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FLASH PICK ⚡</p>
        <span style={{fontSize:16,fontWeight:800,color:"#fff"}}>⚡ Today's Matches</span>
      </div>
      <p style={{textAlign:"center",fontSize:13,color:"#aaa",margin:"16px 0 14px"}}>Tap to predict the winner</p>
      <div style={{margin:"0 20px 20px",background:BG,borderRadius:24,boxShadow:chosen?SHADOW_IN:SHADOW_OUT,padding:"36px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><span style={{fontSize:62}}>{card.homeFlag}</span><span style={{fontSize:15,fontWeight:700,color:DARK}}>{card.home}</span></div>
        <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,borderRadius:12,padding:"8px 12px"}}><span style={{fontSize:12,fontWeight:800,color:"#fff",letterSpacing:2}}>VS</span></div>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><span style={{fontSize:62}}>{card.awayFlag}</span><span style={{fontSize:15,fontWeight:700,color:DARK}}>{card.away}</span></div>
      </div>
      <div style={{display:"flex",gap:10,margin:"0 20px"}}>
        {[card.home,"Draw",card.away].map((opt,i)=>(
          <button key={opt} onClick={()=>pick(opt)} style={{flex:i===1?0.7:1,background:chosen===opt?`linear-gradient(135deg,${NAVY},#001840)`:BG,color:chosen===opt?"#fff":DARK,border:"none",borderRadius:14,padding:"14px 0",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:chosen===opt?"0 4px 12px rgba(0,32,91,0.3)":SHADOW_OUT}}>
            {i===0?"← "+opt:i===2?opt+" →":opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScorePicker({ match, day, savedScore, onSave, onBack }) {
  const SCORES = [[0,1,2,3],[0,1,2,3]];
  const presets = [];
  for(let h=0;h<=3;h++) for(let a=0;a<=3;a++) presets.push([h,a]);
  const [home, setHome] = useState(savedScore?savedScore[0]:null);
  const [away, setAway] = useState(savedScore?savedScore[1]:null);
  const [custom, setCustom] = useState(false);
  const [cHome, setCHome] = useState("");
  const [cAway, setCAway] = useState("");

  const select = (h,a) => { setHome(h); setAway(a); setCustom(false); };
  const confirmed = home!==null && away!==null;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"14px 20px 16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div>
            <p style={{fontSize:9,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>EXACT SCORE · {day} IUNIE</p>
            <h2 style={{fontSize:16,fontWeight:800,color:"#fff",margin:0}}>Gr.{match.group} · {match.time}</h2>
          </div>
        </div>
        {/* Match teams */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"12px 16px"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1}}>
            <span style={{fontSize:28}}>{match.homeFlag}</span>
            <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{match.home}</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"6px 14px"}}>
            <span style={{fontSize:home!==null&&away!==null?18:14,fontWeight:900,color:"#fff"}}>
              {home!==null&&away!==null ? `${home} - ${away}` : "? - ?"}
            </span>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1}}>
            <span style={{fontSize:28}}>{match.awayFlag}</span>
            <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{match.away}</span>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>Selecteaza scorul prezis</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          {presets.map(([h,a])=>{
            const sel = home===h&&away===a&&!custom;
            return (
              <button key={`${h}-${a}`} onClick={()=>select(h,a)}
                style={{padding:"10px 4px",borderRadius:10,border:"none",cursor:"pointer",
                  background:sel?`linear-gradient(135deg,${NAVY},#001840)`:BG,
                  color:sel?"#fff":DARK,
                  boxShadow:sel?"0 3px 10px rgba(0,32,91,0.3)":SHADOW_OUT,
                  fontSize:14,fontWeight:sel?800:500,transition:"all 0.15s"}}>
                {h}-{a}
              </button>
            );
          })}
        </div>

        {/* Custom score */}
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"12px 14px",marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>Alt scor</p>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="number" min="0" max="20" value={cHome}
              onChange={e=>{setCHome(e.target.value);setCustom(true);setHome(parseInt(e.target.value)||0);setAway(parseInt(cAway)||0);}}
              style={{flex:1,textAlign:"center",fontSize:20,fontWeight:800,color:NAVY,border:"none",background:"#fff",borderRadius:10,padding:"10px",boxShadow:SHADOW_IN,outline:"none"}}/>
            <span style={{fontSize:18,fontWeight:800,color:"#aaa"}}>-</span>
            <input type="number" min="0" max="20" value={cAway}
              onChange={e=>{setCHome(e.target.value);setCustom(true);setHome(parseInt(cHome)||0);setAway(parseInt(e.target.value)||0);}}
              style={{flex:1,textAlign:"center",fontSize:20,fontWeight:800,color:NAVY,border:"none",background:"#fff",borderRadius:10,padding:"10px",boxShadow:SHADOW_IN,outline:"none"}}/>
          </div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={onBack}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:BG,boxShadow:SHADOW_OUT,fontSize:12,fontWeight:700,cursor:"pointer",color:"#888"}}>
            ← Inapoi
          </button>
          <button onClick={()=>confirmed&&onSave(home,away)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:confirmed?`linear-gradient(135deg,${NAVY},#001840)`:"#e8e8e8",
              color:confirmed?"#fff":"#bbb",fontSize:12,fontWeight:700,
              cursor:confirmed?"pointer":"default",
              boxShadow:confirmed?"0 4px 12px rgba(0,32,91,0.3)":"none"}}>
            Salveaza ✓
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupsScheduleScreen({ onBack, scores: scoresProp, setScores: setScoresProp }) {
  const GROUPS_DATA = [
    { id:"A", teams:[{name:"Brazil",flag:"🇧🇷"},{name:"France",flag:"🇫🇷"},{name:"Mexico",flag:"🇲🇽"},{name:"Morocco",flag:"🇲🇦"}] },
    { id:"B", teams:[{name:"Argentina",flag:"🇦🇷"},{name:"England",flag:"🏴󠁧󠁢󠁥󠁧󠁿"},{name:"USA",flag:"🇺🇸"},{name:"Poland",flag:"🇵🇱"}] },
    { id:"C", teams:[{name:"Spain",flag:"🇪🇸"},{name:"Portugal",flag:"🇵🇹"},{name:"Japan",flag:"🇯🇵"},{name:"Canada",flag:"🇨🇦"}] },
    { id:"D", teams:[{name:"Germany",flag:"🇩🇪"},{name:"Netherlands",flag:"🇳🇱"},{name:"Senegal",flag:"🇸🇳"},{name:"Australia",flag:"🇦🇺"}] },
    { id:"E", teams:[{name:"Belgium",flag:"🇧🇪"},{name:"Croatia",flag:"🇭🇷"},{name:"Serbia",flag:"🇷🇸"},{name:"Iran",flag:"🇮🇷"}] },
    { id:"F", teams:[{name:"Denmark",flag:"🇩🇰"},{name:"Tunisia",flag:"🇹🇳"},{name:"Ecuador",flag:"🇪🇨"},{name:"Cameroon",flag:"🇨🇲"}] },
  ];

  const weeks = [8,15,22,29];
  const mm0 = {};
  CALENDAR_EVENTS.forEach(e => { mm0[e.day] = e.matches; });
  // Find first day with matches in first week
  const firstMatchDay = Array.from({length:7},(_,i)=>8+i).find(d=>!!mm0[d]) || null;
  const [weekStart, setWeekStart] = useState(8);
  const [selGroup, setSelGroup] = useState(null);
  const [selDay, setSelDay] = useState(firstMatchDay);
  const [_scores, _setScores] = useState(scoresProp||{});
  const scores = scoresProp||_scores;
  const setScores = (updater) => {
    const next = typeof updater==="function"?updater(scores):updater;
    if(setScoresProp) setScoresProp(next); else _setScores(next);
  };
  const [scorePick, setScorePick] = useState(null);
  const [showReal, setShowReal] = useState(true);
  const weekIdx = weeks.indexOf(weekStart);

  const getGroupsForDays = (days) => {
    const groups = new Set();
    CALENDAR_EVENTS.forEach(e => {
      if(days.includes(e.day)) e.matches.forEach(m => { if(m.group) groups.add(m.group); });
    });
    return [...groups].sort();
  };

  const weekDays = Array.from({length:7},(_,i)=>weekStart+i).filter(d=>d>=1&&d<=30);
  const activeGroups = getGroupsForDays(weekDays);
  // When day selected: show only groups playing that day (but don't lock others in week)
  const displayGroups = activeGroups; // groups available = all with matches this week
  const highlightGroups = selDay ? getGroupsForDays([selDay]) : activeGroups; // groups to highlight

  const handleWeekChange = (w) => {
    setWeekStart(w); setSelGroup(null);
    const wDays = Array.from({length:7},(_,i)=>w+i).filter(d=>d>=1&&d<=30);
    const ag = getGroupsForDays(wDays);
    if(ag.length>0) setSelGroup(ag[0]);
    // Auto-select first day with matches in new week
    const mm_ = {};
    CALENDAR_EVENTS.forEach(e => { mm_[e.day] = e.matches; });
    const firstDay = wDays.find(d=>!!mm_[d]) || null;
    setSelDay(firstDay);
  };

  const handleDaySelect = (day) => {
    if(selDay===day){ setSelDay(null); setSelGroup(displayGroups[0]||null); return; }
    setSelDay(day);
    const dg = getGroupsForDays([day]);
    if(dg.length>0) setSelGroup(dg[0]);
  };

  if(selGroup===null && activeGroups.length>0) setSelGroup(activeGroups[0]);

  const cur = GROUPS_DATA.find(g=>g.id===selGroup)||GROUPS_DATA[0];
  const isGroupLocked = (gid) => !activeGroups.includes(gid);

  // Compute standing from saved scores for current group
  const mm = {};
  CALENDAR_EVENTS.forEach(e => { mm[e.day] = e.matches; });
  const groupMatches = [];
  CALENDAR_EVENTS.forEach(e => {
    e.matches.forEach((m,idx) => {
      if(m.group===selGroup)
        groupMatches.push({...m, day:e.day, idx, key:`${e.day}-${idx}`});
    });
  });

  // Compute standings from predicted scores
  const standing = cur.teams.map(t=>({name:t.name,flag:t.flag,pts:0,gf:0,ga:0,gd:0,p:0}));
  groupMatches.forEach(m=>{
    const sc = scores[m.key];
    if(!sc) return;
    const [h,a] = sc;
    const home = standing.find(t=>t.name===m.home);
    const away = standing.find(t=>t.name===m.away);
    if(!home||!away) return;
    home.gf+=h; home.ga+=a; home.gd+=h-a; home.p++;
    away.gf+=a; away.ga+=h; away.gd+=a-h; away.p++;
    if(h>a){home.pts+=3;}
    else if(h===a){home.pts+=1;away.pts+=1;}
    else{away.pts+=3;}
  });
  standing.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);

  // ScorePicker subscreen
  if(scorePick) {
    return (
      <ScorePicker
        match={scorePick.match}
        day={scorePick.day}
        savedScore={scores[scorePick.key]}
        onSave={(h,a)=>{ setScores(s=>({...s,[scorePick.key]:[h,a]})); setScorePick(null); }}
        onBack={()=>setScorePick(null)}
      />
    );
  }

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"14px 20px 16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div>
            <p style={{fontSize:9,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA - WORLD CUP 2026</p>
            <h2 style={{fontSize:17,fontWeight:800,color:"#fff",margin:0}}>Groups & Schedule</h2>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 20px"}}>
        {/* Weekly Calendar with clickable matches */}
        <WeeklyCalendar weekStart={weekStart} setWeekStart={handleWeekChange} weeks={weeks} weekIdx={weekIdx}
          selDay={selDay} onDaySelect={handleDaySelect} scores={scores}
          onMatchClick={(match,day,idx)=>isWeekUnlocked(day)&&setScorePick({match,day,idx,key:`${day}-${idx}`})}/>

        {/* Group pills */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"14px 0 8px"}}>
          {selDay ? `Grupe · ${selDay} Iunie` : `Grupe · ${weekStart}–${Math.min(weekStart+6,30)} Iunie`}
        </p>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {GROUPS_DATA.map(g=>{
            const locked = isGroupLocked(g.id);
            const active = selGroup===g.id;
            const hasMatchToday = highlightGroups.includes(g.id);
            return (
              <button key={g.id} onClick={()=>{
                if(locked) return;
                setSelGroup(g.id);
                // Jump to first day this group plays
                const firstDay = CALENDAR_EVENTS.find(e=>e.matches.some(m=>m.group===g.id))?.day;
                if(firstDay) {
                  // Find which week this day belongs to
                  const targetWeek = weeks.find(w=>firstDay>=w&&firstDay<=w+6)||weeks[0];
                  if(targetWeek!==weekStart) setWeekStart(targetWeek);
                  setSelDay(firstDay);
                }
              }}
                style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",fontSize:13,fontWeight:800,
                  cursor:locked?"default":"pointer",
                  background:active?`linear-gradient(135deg,${NAVY},#001840)`:locked?"rgba(0,0,0,0.04)":BG,
                  color:active?"#fff":locked?"#ccc":DARK,
                  boxShadow:active?"0 3px 10px rgba(0,32,91,0.3)":locked?"none":SHADOW_OUT,
                  transition:"all 0.2s",
                  position:"relative"}}>
                {locked ? <span style={{fontSize:10}}>🔒</span> : g.id}
                {/* Green dot if has match today */}
                {!locked && !active && hasMatchToday && selDay && (
                  <div style={{position:"absolute",top:3,right:3,width:6,height:6,
                    borderRadius:"50%",background:GREEN}}/>
                )}
              </button>
            );
          })}
        </div>

        {!isGroupLocked(selGroup) && (
          <>
            {/* Standing — real / predicted toggle */}
            {(()=>{
              const realStanding = REAL_STANDINGS[selGroup];
              const hasReal = !!realStanding;
              const rows = (showReal && hasReal)
                ? realStanding.map(name=>{ const t=cur.teams.find(x=>x.name===name)||{name,flag:"🏳"}; return {...t,pts:0,gf:0,ga:0,gd:0,p:0}; })
                : standing;
              return (
                <>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:0}}>
                      Grupa {selGroup} · {showReal?"Clasament Real":"Clasament Prezis"}
                    </p>
                    {hasReal&&(
                      <div style={{display:"flex",background:BG,borderRadius:20,boxShadow:SHADOW_OUT,padding:"2px"}}>
                        <button onClick={()=>setShowReal(true)} style={{padding:"4px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:showReal?`linear-gradient(135deg,${NAVY},#001840)`:"transparent",color:showReal?"#fff":"#aaa"}}>Real</button>
                        <button onClick={()=>setShowReal(false)} style={{padding:"4px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:!showReal?`linear-gradient(135deg,${NAVY},#001840)`:"transparent",color:!showReal?"#fff":"#aaa"}}>Prezis</button>
                      </div>
                    )}
                  </div>
                  <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",padding:"6px 14px",background:"rgba(0,0,0,0.03)",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                      <span style={{fontSize:9,fontWeight:700,color:"#bbb",width:18}}>#</span>
                      <span style={{flex:1,fontSize:9,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>Echipa</span>
                      <span style={{fontSize:9,fontWeight:700,color:"#bbb",width:22,textAlign:"center"}}>J</span>
                      <span style={{fontSize:9,fontWeight:700,color:"#bbb",width:22,textAlign:"center"}}>G</span>
                      <span style={{fontSize:9,fontWeight:700,color:"#bbb",width:28,textAlign:"center"}}>GD</span>
                      <span style={{fontSize:9,fontWeight:700,color:"#bbb",width:26,textAlign:"center"}}>Pts</span>
                    </div>
                    {rows.map((t,i)=>{
                      const predPos = showReal&&hasReal ? standing.findIndex(s=>s.name===t.name) : i;
                      const posMatch = showReal&&hasReal && predPos===i;
                      return (
                        <div key={t.name||i} style={{display:"flex",alignItems:"center",padding:"9px 14px",
                          background:"#fff",
                          borderBottom:i<3?"1px solid rgba(0,0,0,0.05)":"none"}}>
                          <span style={{fontSize:11,fontWeight:700,color:i===0?GREEN:i===1?NAVY:"#aaa",width:18}}>{i+1}</span>
                          <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:18}}>{t.flag}</span>
                            <span style={{fontSize:12,fontWeight:600,color:DARK}}>{(t.name||"").length>8?(t.name||"").split(" ")[0]:t.name}</span>
                          </div>
                          <span style={{fontSize:11,color:"#aaa",width:22,textAlign:"center"}}>{t.p||0}</span>
                          <span style={{fontSize:11,color:"#aaa",width:22,textAlign:"center"}}>{t.gf||0}</span>
                          <span style={{fontSize:11,color:(t.gd||0)>0?GREEN:(t.gd||0)<0?RED:"#aaa",width:28,textAlign:"center"}}>{(t.gd||0)>0?"+":""}{t.gd||0}</span>
                          <span style={{fontSize:12,fontWeight:800,color:NAVY,width:26,textAlign:"center"}}>{t.pts||0}</span>

                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Matches for this group */}
            <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>
              Meciuri · Grupa {selGroup}
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {groupMatches.length===0 ? (
                <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"16px",textAlign:"center",color:"#aaa",fontSize:12}}>Nu sunt meciuri programate</div>
              ) : groupMatches.map((m,i)=>{
                const sc = scores[m.key];
                const live = LIVE_SCORES[m.key];
                const inCurrentWeek = weekDays.includes(m.day);
                const isFinished = live?.status==="FT";
                const isLive = live?.status==="LIVE";
                const isNS = !live || live.status==="NS";
                const hasLive = live && (live.home!==null);

                // Check prediction accuracy
                let exactMatch = false, resultMatch = false;
                if(sc && hasLive && isFinished) {
                  exactMatch = sc[0]===live.home && sc[1]===live.away;
                  const predResult = sc[0]>sc[1]?"H":sc[0]<sc[1]?"A":"D";
                  const realResult = live.home>live.away?"H":live.home<live.away?"A":"D";
                  resultMatch = predResult===realResult;
                }

                return (
                  <div key={m.key} style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
                    {/* Status bar */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"5px 12px",
                      background:isLive?"rgba(200,16,46,0.08)":isFinished?"rgba(0,154,68,0.06)":"rgba(0,0,0,0.03)"}}>
                      <span style={{fontSize:9,color:"#aaa",fontWeight:600}}>{m.day} Iunie · {m.time}</span>
                      {isLive&&<span style={{fontSize:9,fontWeight:800,color:RED,display:"flex",alignItems:"center",gap:3}}>
                        <span style={{width:6,height:6,borderRadius:"50%",background:RED,display:"inline-block"}}/>
                        LIVE {live.min}'
                      </span>}
                      {isFinished&&<span style={{fontSize:9,fontWeight:700,color:GREEN}}>FT</span>}
                      {isNS&&<span style={{fontSize:9,fontWeight:600,color:"#bbb"}}>Neînceput</span>}
                    </div>

                    {/* Main match row */}
                    <div style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {/* Home */}
                        <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:20}}>{m.homeFlag}</span>
                          <span style={{fontSize:11,fontWeight:600,color:DARK}}>{m.home.length>8?m.home.split(" ")[0]:m.home}</span>
                        </div>

                        {/* Scores */}
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                          {/* Live score */}
                          <div style={{
                            background:isLive?RED:isFinished?`linear-gradient(135deg,${NAVY},#001840)`:"rgba(0,0,0,0.06)",
                            borderRadius:8,padding:"4px 12px",minWidth:52,textAlign:"center"}}>
                            <span style={{fontSize:14,fontWeight:900,color:hasLive?"#fff":"#ddd"}}>
                              {hasLive ? `${live.home}-${live.away}` : "-"}
                            </span>
                          </div>
                          {/* Prediction */}
                          {sc ? (
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <span style={{fontSize:9,color:"#aaa"}}>Tu:</span>
                              <div style={{background:exactMatch?"rgba(0,154,68,0.12)":resultMatch?"rgba(0,32,91,0.08)":"rgba(0,0,0,0.05)",
                                borderRadius:6,padding:"2px 8px",display:"flex",alignItems:"center",gap:4}}>
                                <span style={{fontSize:11,fontWeight:700,
                                  color:exactMatch?GREEN:resultMatch?NAVY:"#888"}}>
                                  {sc[0]}-{sc[1]}
                                </span>
                                {isFinished&&(exactMatch
                                  ? <span style={{fontSize:10}}>🎯</span>
                                  : resultMatch
                                    ? <span style={{fontSize:10}}>✓</span>
                                    : <span style={{fontSize:10,color:"#ccc"}}>✗</span>
                                )}
                              </div>
                            </div>
                          ) : isWeekUnlocked(m.day) ? (
                            <div onClick={()=>setScorePick({match:m,day:m.day,idx:m.idx,key:m.key})}
                              style={{background:"rgba(0,32,91,0.06)",borderRadius:6,padding:"2px 10px",cursor:"pointer"}}>
                              <span style={{fontSize:10,color:NAVY,fontWeight:700}}>+ predicție</span>
                            </div>
                          ) : (
                            <span style={{fontSize:10,color:"#ccc"}}>🔒</span>
                          )}
                        </div>

                        {/* Away */}
                        <div style={{flex:1,display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
                          <span style={{fontSize:11,fontWeight:600,color:DARK,textAlign:"right"}}>{m.away.length>8?m.away.split(" ")[0]:m.away}</span>
                          <span style={{fontSize:20}}>{m.awayFlag}</span>
                        </div>
                      </div>

                      {/* Points earned */}
                      {isFinished && sc && (
                        <div style={{marginTop:6,display:"flex",justifyContent:"center"}}>
                          <div style={{background:exactMatch?"rgba(0,154,68,0.1)":resultMatch?"rgba(0,32,91,0.07)":"rgba(0,0,0,0.03)",
                            borderRadius:20,padding:"3px 12px",display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:10,fontWeight:700,
                              color:exactMatch?GREEN:resultMatch?NAVY:"#bbb"}}>
                              {exactMatch?"🎯 +90 pts · Scor exact":resultMatch?"✓ +30 pts · Rezultat corect":"✗ +0 pts"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Edit prediction */}
                    {sc && isWeekUnlocked(m.day) && (
                      <div onClick={()=>setScorePick({match:m,day:m.day,idx:m.idx,key:m.key})}
                        style={{padding:"6px 12px",borderTop:"1px solid rgba(0,0,0,0.05)",
                          display:"flex",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer"}}>
                        <span style={{fontSize:10,color:"#bbb",fontWeight:600}}>✏️ Editeaza predictia</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function WeeklyCalendar({ weekStart, setWeekStart, weeks, weekIdx, selDay, onDaySelect, scores, onMatchClick }) {
  const mm = {};
  CALENDAR_EVENTS.forEach(e => { mm[e.day] = e.matches; });
  const dl = ["L","M","M","J","V","S","D"];
  const days = Array.from({length:7},(_,i)=>weekStart+i).filter(d=>d>=1&&d<=30);
  const sel = selDay;
  const sm = sel ? mm[sel] : null;
  const weekLabel = `${weekStart} – ${Math.min(weekStart+6,30)} Iunie`;

  return (
    <div style={{marginBottom:4}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>weekIdx>0&&setWeekStart(weeks[weekIdx-1])}
          style={{width:30,height:30,borderRadius:"50%",border:"none",background:weekIdx>0?BG:"transparent",
            boxShadow:weekIdx>0?SHADOW_OUT:"none",cursor:weekIdx>0?"pointer":"default",
            fontSize:16,color:weekIdx>0?DARK:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{weekLabel}</p>
          <span style={{fontSize:10,color:NAVY,fontWeight:700}}>Iunie 2026 · FIFA WC</span>
        </div>
        <button onClick={()=>weekIdx<weeks.length-1&&setWeekStart(weeks[weekIdx+1])}
          style={{width:30,height:30,borderRadius:"50%",border:"none",background:weekIdx<weeks.length-1?BG:"transparent",
            boxShadow:weekIdx<weeks.length-1?SHADOW_OUT:"none",cursor:weekIdx<weeks.length-1?"pointer":"default",
            fontSize:16,color:weekIdx<weeks.length-1?DARK:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:10}}>
        {weeks.map((w,i)=>(
          <div key={w} onClick={()=>setWeekStart(w)}
            style={{width:i===weekIdx?18:6,height:6,borderRadius:3,cursor:"pointer",transition:"all 0.3s",background:i===weekIdx?NAVY:"#ddd"}}/>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {dl.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:i===6?RED:"#bbb"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {days.map((day,i)=>{
          const isS=day===11,has=!!mm[day],isSel=sel===day,isSun=i%7===6;
          const locked = has && !isWeekUnlocked(day);
          let bg="transparent",border="1.5px solid transparent",shadow="none";
          let tc=isSun?RED:"#777",fw=400;
          if(isSel){bg=`linear-gradient(135deg,${NAVY},#001840)`;shadow="0 3px 10px rgba(0,32,91,0.35)";tc="#fff";fw=800;}
          else if(isS){bg="#E8F0FF";border=`1.5px solid ${NAVY}`;tc=NAVY;fw=800;}
          else if(has&&!locked){fw=700;tc=DARK;}
          else if(locked){tc="#bbb";}
          return (
            <div key={day} onClick={()=>has&&onDaySelect&&onDaySelect(day)}
              style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",borderRadius:10,padding:"8px 2px",
                cursor:has?"pointer":"default",background:bg,border,boxShadow:shadow,transition:"all 0.15s",
                opacity:locked?0.6:1}}>
              <span style={{fontSize:13,fontWeight:fw,color:tc,lineHeight:1}}>{day}</span>
              {has&&!isSel&&!locked&&<div style={{width:4,height:4,borderRadius:"50%",background:isS?NAVY:RED,marginTop:3}}/>}
              {has&&!isSel&&locked&&<span style={{fontSize:8,lineHeight:1,marginTop:2}}>🔒</span>}
              {isS&&!isSel&&<div style={{position:"absolute",top:-6,right:-2,background:RED,borderRadius:4,padding:"1px 4px",fontSize:7,fontWeight:800,color:"#fff"}}>START</div>}
            </div>
          );
        })}
      </div>
      {sm&&(
        <div style={{marginTop:10,background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>{sel} Iunie · {sm.length} meciuri</span>
            <span onClick={()=>onDaySelect&&onDaySelect(sel)} style={{fontSize:18,color:"rgba(255,255,255,0.5)",cursor:"pointer",padding:"0 4px",lineHeight:1}}>✕</span>
          </div>
          {sm.map((m,i)=>{
            const key=`${sel}-${i}`;
            const sc = scores&&scores[key];
            const live = LIVE_SCORES[key];
            const isLive = live?.status==="LIVE";
            const isFT = live?.status==="FT";
            const hasScore = live && live.home!==null;
            const exactMatch = sc&&hasScore&&isFT&&sc[0]===live.home&&sc[1]===live.away;
            const predRes = sc?sc[0]>sc[1]?"H":sc[0]<sc[1]?"A":"D":null;
            const realRes = hasScore?live.home>live.away?"H":live.home<live.away?"A":"D":null;
            const resultMatch = predRes&&realRes&&predRes===realRes&&isFT;
            const pts = exactMatch?90:resultMatch?30:0;
            return (
              <div key={i} style={{borderBottom:i<sm.length-1?"1px solid rgba(0,0,0,0.06)":"none",background:"#fff"}}>
                {/* Match header */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"4px 14px",background:isLive?"rgba(200,16,46,0.06)":isFT?"rgba(0,154,68,0.05)":"rgba(0,0,0,0.02)"}}>
                  <span style={{fontSize:9,fontWeight:600,color:"#aaa"}}>{m.time} · Gr.{m.group}</span>
                  {isLive&&<span style={{fontSize:9,fontWeight:800,color:RED,display:"flex",alignItems:"center",gap:3}}>
                    <span style={{width:5,height:5,borderRadius:"50%",background:RED,display:"inline-block",animation:"pulse 1s infinite"}}/>
                    LIVE {live.min}'
                  </span>}
                  {isFT&&<span style={{fontSize:9,fontWeight:700,color:GREEN}}>FT</span>}
                  {!hasScore&&!isLive&&<span style={{fontSize:9,color:"#ccc"}}>Neînceput</span>}
                </div>
                {/* Match row */}
                <div onClick={()=>onMatchClick&&onMatchClick(m,sel,i)}
                  style={{display:"flex",alignItems:"center",padding:"10px 14px",cursor:"pointer",gap:6}}>
                  {/* Home */}
                  <span style={{fontSize:18,flexShrink:0}}>{m.homeFlag}</span>
                  <span style={{flex:1,fontSize:11,fontWeight:600,color:DARK}}>{m.home.length>7?m.home.split(" ")[0]:m.home}</span>
                  {/* Center */}
                  <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{background:isLive?RED:hasScore?`linear-gradient(135deg,${NAVY},#001840)`:"rgba(0,0,0,0.08)",borderRadius:6,padding:"4px 10px",minWidth:54,textAlign:"center"}}>
                      <span style={{fontSize:13,fontWeight:900,color:hasScore?"#fff":"#bbb"}}>{hasScore?`${live.home}-${live.away}`:"-"}</span>
                    </div>
                    {sc ? (
                      <span style={{fontSize:9,fontWeight:700,color:exactMatch?GREEN:resultMatch?NAVY:"#999"}}>
                        tu: {sc[0]}-{sc[1]}{isFT?(exactMatch?" 🎯":resultMatch?" ✓":" ✗"):""}
                      </span>
                    ) : (
                      isWeekUnlocked(sel||0)
                        ? <span style={{fontSize:9,color:NAVY,fontWeight:700}}>+ predicție</span>
                        : <span style={{fontSize:9,color:"#bbb"}}>🔒</span>
                    )}
                  </div>
                  {/* Away */}
                  <span style={{flex:1,fontSize:11,fontWeight:600,color:DARK,textAlign:"right"}}>{m.away.length>7?m.away.split(" ")[0]:m.away}</span>
                  <span style={{fontSize:18,flexShrink:0}}>{m.awayFlag}</span>
                </div>
                {/* Points pill */}
                {isFT&&sc&&(
                  <div style={{padding:"4px 14px 8px",display:"flex",justifyContent:"center"}}>
                    <div style={{background:exactMatch?"rgba(0,154,68,0.1)":resultMatch?"rgba(0,32,91,0.07)":"rgba(0,0,0,0.04)",
                      borderRadius:20,padding:"3px 14px"}}>
                      <span style={{fontSize:10,fontWeight:700,color:exactMatch?GREEN:resultMatch?NAVY:"#bbb"}}>
                        {exactMatch?"🎯 +90 pts · Scor exact":resultMatch?"✓ +30 pts · Rezultat corect":"✗ +0 pts · Greșit"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatsScreen({ lang }) {
  const GROUPS = [
    { id:"A", teams:[{name:"Brazil",flag:"🇧🇷"},{name:"France",flag:"🇫🇷"},{name:"Mexico",flag:"🇲🇽"},{name:"Morocco",flag:"🇲🇦"}] },
    { id:"B", teams:[{name:"Argentina",flag:"🇦🇷"},{name:"England",flag:"🏴󠁧󠁢󠁥󠁧󠁿"},{name:"USA",flag:"🇺🇸"},{name:"Poland",flag:"🇵🇱"}] },
    { id:"C", teams:[{name:"Spain",flag:"🇪🇸"},{name:"Portugal",flag:"🇵🇹"},{name:"Japan",flag:"🇯🇵"},{name:"Canada",flag:"🇨🇦"}] },
    { id:"D", teams:[{name:"Germany",flag:"🇩🇪"},{name:"Netherlands",flag:"🇳🇱"},{name:"Senegal",flag:"🇸🇳"},{name:"Australia",flag:"🇦🇺"}] },
    { id:"E", teams:[{name:"Belgium",flag:"🇧🇪"},{name:"Croatia",flag:"🇭🇷"},{name:"Serbia",flag:"🇷🇸"},{name:"Iran",flag:"🇮🇷"}] },
    { id:"F", teams:[{name:"Denmark",flag:"🇩🇰"},{name:"Tunisia",flag:"🇹🇳"},{name:"Ecuador",flag:"🇪🇨"},{name:"Cameroon",flag:"🇨🇲"}] },
  ];
  const [selGroup, setSelGroup] = useState("A");
  const cur = GROUPS.find(g=>g.id===selGroup) || GROUPS[0];
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"16px 20px 18px",flexShrink:0}}>
        <p style={{fontSize:9,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA - WORLD CUP 2026</p>
        <h2 style={{fontSize:18,fontWeight:800,color:"#fff",margin:"0 0 12px"}}>Groups & Schedule</h2>
        {/* Group tabs */}
        <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
          {GROUPS.map(g=>(
            <button key={g.id} onClick={()=>setSelGroup(g.id)}
              style={{flexShrink:0,width:36,height:36,borderRadius:10,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",
                background:selGroup===g.id?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.1)",
                color:selGroup===g.id?NAVY:"rgba(255,255,255,0.6)",
                boxShadow:selGroup===g.id?"0 3px 10px rgba(0,0,0,0.2)":"none",
                transition:"all 0.2s"}}>
              {g.id}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 20px"}}>
        {/* Teams in group */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>Grupa {selGroup} · Echipe</p>
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:16}}>
          {cur.teams.map((t,i)=>(
            <div key={t.name} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",
              borderBottom:i<3?"1px solid rgba(0,0,0,0.05)":"none",background:"#fff"}}>
              <span style={{fontSize:10,fontWeight:700,color:"#ccc",width:16}}>{i+1}</span>
              <span style={{fontSize:22}}>{t.flag}</span>
              <span style={{flex:1,fontSize:13,fontWeight:600,color:DARK}}>{t.name}</span>
            </div>
          ))}
        </div>
        {/* Calendar for this group */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>Program Meciuri</p>
        <CalendarSlider/>
      </div>
    </div>
  );
}

function AccountScreen({ lang }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflowY:"auto"}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"28px 20px 32px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{width:70,height:70,borderRadius:"50%",background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,marginBottom:12}}>👤</div>
        <p style={{fontSize:10,color:RED,margin:"0 0 4px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA</p>
        <h2 style={{fontSize:18,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>Alex Ionescu</h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",margin:0}}>Member since March 2026</p>
      </div>
      <div style={{padding:"16px 20px"}}>
        {[{icon:"🏆",label:"My Boards",sub:"3 active boards"},{icon:"🔔",label:"Notifications",sub:"Match alerts on"},{icon:"🌍",label:"Language",sub:LANGS.find(l=>l.code===lang)?.name||"English"},{icon:"⭐",label:"Upgrade to Premium",sub:"Remove ads",highlight:true},{icon:"🚪",label:"Sign Out",sub:""}].map(item=>(
          <div key={item.label} style={{display:"flex",alignItems:"center",gap:14,background:item.highlight?"#E8F0FF":BG,borderRadius:14,boxShadow:item.highlight?`0 0 0 2px ${NAVY},${SHADOW_OUT}`:SHADOW_OUT,padding:"13px 16px",marginBottom:10,cursor:"pointer"}}>
            <span style={{fontSize:20}}>{item.icon}</span>
            <div style={{flex:1}}>
              <p style={{fontSize:14,fontWeight:700,color:item.highlight?NAVY:DARK,margin:0}}>{item.label}</p>
              {item.sub&&<p style={{fontSize:12,color:item.highlight?NAVY:"#aaa",margin:"2px 0 0"}}>{item.sub}</p>}
            </div>
            <span style={{color:item.highlight?NAVY:"#bbb",fontSize:18}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RulesScreen({ onBack }) {
  const [tab, setTab] = useState("predictions");
  const predRules = [
    { phase:"⚽ Grupe", pts:30, desc:"Rezultat corect (câștigătoare sau egal)" },
    { phase:"🥉 Best Third", pts:20, desc:"Echipă de pe locul 3 care avansează" },
    { phase:"🏆 Round of 16", pts:40, desc:"Câștigătoarea meciului corectă" },
    { phase:"🏆 Sferturi", pts:60, desc:"Câștigătoarea meciului corectă" },
    { phase:"🏆 Semifinale", pts:90, desc:"Câștigătoarea meciului corectă" },
    { phase:"🏆 Finală", pts:120, desc:"Câștigătoarea finalei" },
  ];
  const exactRules = [
    { phase:"⚽ Grupe · Rezultat", pts:30, desc:"Câștigătoare sau egal corect" },
    { phase:"⚽ Grupe · Scor exact", pts:90, desc:"Scorul exact al meciului" },
    { phase:"🏆 R16 · Câștigătoare", pts:40, desc:"Echipa câștigătoare corectă" },
    { phase:"🏆 QF · Câștigătoare", pts:60, desc:"Echipa câștigătoare corectă" },
    { phase:"🏆 SF · Câștigătoare", pts:90, desc:"Echipa câștigătoare corectă" },
    { phase:"🏆 Final · Câștigătoare", pts:120, desc:"Câștigătoarea turneului" },
  ];
  const rules = tab==="predictions" ? predRules : exactRules;
  const totalMax = rules.reduce((s,r)=>s+r.pts, 0);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"16px 20px 0",flexShrink:0}}>
        <p style={{fontSize:9,color:RED,margin:"0 0 4px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA WORLD CUP 2026</p>
        <h2 style={{fontSize:20,fontWeight:900,color:"#fff",margin:"0 0 16px"}}>📖 Rules</h2>
        {/* Tabs */}
        <div style={{display:"flex",gap:0,borderBottom:"2px solid rgba(255,255,255,0.1)"}}>
          {[{id:"predictions",label:"🎯 Predictions"},{id:"exact",label:"⚽ Exact Score"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{flex:1,background:"transparent",border:"none",cursor:"pointer",padding:"10px 0",
                fontSize:12,fontWeight:700,color:tab===t.id?"#fff":"rgba(255,255,255,0.4)",
                borderBottom:tab===t.id?`3px solid ${RED}`:"3px solid transparent",
                transition:"all 0.2s"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        {/* Description */}
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:700,color:DARK,margin:"0 0 4px"}}>
            {tab==="predictions" ? "Cum funcționează Predictions?" : "Cum funcționează Exact Score?"}
          </p>
          <p style={{fontSize:12,color:"#888",margin:0,lineHeight:1.5}}>
            {tab==="predictions"
              ? "Prezici câștigătoarea fiecărui meci — de la grupe până la finală. O singură șansă per turneu."
              : "Prezici scorul exact al fiecărui meci săptămânal. Se deblochează duminica după ora 20:00."}
          </p>
        </div>

        {/* Rules table */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>Punctaj per predicție corectă</p>
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:16}}>
          {rules.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",padding:"12px 16px",background:"#fff",borderBottom:i<rules.length-1?"1px solid rgba(0,0,0,0.05)":"none",gap:12}}>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:700,color:DARK,margin:"0 0 2px"}}>{r.phase}</p>
                <p style={{fontSize:11,color:"#aaa",margin:0}}>{r.desc}</p>
              </div>
              <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,borderRadius:10,padding:"5px 12px",flexShrink:0}}>
                <span style={{fontSize:13,fontWeight:900,color:"#fff"}}>+{r.pts}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Example */}
        <div style={{background:"#E8F0FF",borderRadius:14,padding:"14px 16px",marginBottom:24,border:`1px solid rgba(0,32,91,0.1)`}}>
          <p style={{fontSize:12,fontWeight:700,color:NAVY,margin:"0 0 4px"}}>💡 Exemplu</p>
          <p style={{fontSize:12,color:"#555",margin:0,lineHeight:1.5}}>
            {tab==="predictions"
              ? "Dacă nimerești câștigătoarea la 10 meciuri din grupe → 10 × 30 = 300 pts. Fiecare predicție corectă contează!"
              : "Dacă nimerești scorul exact la 3 meciuri → 3 × 90 = 270 pts. Dacă nimerești doar rezultatul → 30 pts per meci."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [lang, setLang] = useState("en");
  const [myBoards, setMyBoards] = useState(INITIAL_BOARDS);
  // Predictions complete per board id
  const [predictionsComplete, setPredictionsComplete] = useState({});
  const [activeBoardId, setActiveBoardId] = useState("global");
  const [allInstantPickStates, setAllInstantPickStates] = useState({});
  const [exactScores, setExactScores] = useState({}); // lifted from GroupsScheduleScreen
  const [allInstantPickDone, setAllInstantPickDone] = useState({});
  const instantPickState = allInstantPickStates[activeBoardId]||null;
  const instantPickDone = allInstantPickDone[activeBoardId]||false;
  const setInstantPickState = (s) => setAllInstantPickStates(p=>({...p,[activeBoardId]:s}));
  const setInstantPickDone = (v) => setAllInstantPickDone(p=>({...p,[activeBoardId]:v}));
  // Predictions state per board
  const [allPredictions, setAllPredictions] = useState({});
  const getPreds = (boardId) => allPredictions[boardId] || { groupRank:{}, best3picks:[], knockoutPicks:{}, teamBooster:null, golgheter:null };
  const setPreds = (boardId, updater) => setAllPredictions(a => {
    const cur = a[boardId] || { groupRank:{}, best3picks:[], knockoutPicks:{}, teamBooster:null, golgheter:null };
    const next = typeof updater === "function" ? updater(cur) : {...cur, ...updater};
    return {...a, [boardId]: next};
  });
  // Tournament starts June 11 2026
  const tournamentStarted = new Date() >= new Date("2026-06-11T18:00:00");

  const noFooter = [SCREENS.SPLASH, SCREENS.LOGIN, SCREENS.PREDICTIONS, SCREENS.INSTANT_PICK, SCREENS.GROUPS_SCHEDULE];
  const showFooter = !noFooter.includes(screen);
  const footerActive = screen===SCREENS.STATS?SCREENS.STATS:screen===SCREENS.FAST_PREDICTION?SCREENS.FAST_PREDICTION:screen===SCREENS.ACCOUNT?SCREENS.ACCOUNT:SCREENS.HOME;

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#D4D4D4",fontFamily:"-apple-system,'SF Pro Display',sans-serif"}}>
      <div style={{width:390,height:844,background:BG,borderRadius:46,overflow:"hidden",boxShadow:"0 30px 80px rgba(0,0,0,0.22),inset 0 1px 0 rgba(255,255,255,0.8)",display:"flex",flexDirection:"column",position:"relative"}}>
        <div style={{display:"flex",justifyContent:"space-between",padding:"14px 24px 4px",fontSize:13,fontWeight:600,color:DARK,flexShrink:0}}>
          <span>9:41</span><span>5G 🔋</span>
        </div>
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {screen===SCREENS.SPLASH&&<SplashScreen onNext={()=>setScreen(SCREENS.LOGIN)} lang={lang} setLang={setLang}/>}
          {screen===SCREENS.LOGIN&&<LoginScreen onNext={()=>setScreen(SCREENS.HOME)}/>}
          {screen===SCREENS.HOME&&<HomeScreen
            onPredict={(boardId)=>{ setActiveBoardId(boardId); setScreen(SCREENS.INSTANT_PICK); }}
            onLeaderboard={()=>setScreen(SCREENS.LEADERBOARD)}
            onBoards={()=>setScreen(SCREENS.BOARDS)}
            onOpenGroups={()=>setScreen(SCREENS.GROUPS_SCHEDULE)}
            myBoards={myBoards}
            predictionsComplete={predictionsComplete}
            instantPickDone={instantPickDone}
            exactScores={exactScores}
            activeBoardId={activeBoardId}
            setActiveBoardId={setActiveBoardId}
            tournamentStarted={tournamentStarted}/>}
          {screen===SCREENS.BOARDS&&<BoardsScreen onBack={()=>setScreen(SCREENS.HOME)} myBoards={myBoards} setMyBoards={setMyBoards}/>}
          {screen===SCREENS.LEADERBOARD&&<LeaderboardScreen onBack={()=>setScreen(SCREENS.HOME)}/>}
          {screen===SCREENS.INSTANT_PICK&&<InstantPickScreen
            savedState={instantPickState}
            onStateChange={setInstantPickState}
            tournamentStarted={tournamentStarted}
            onBack={()=>setScreen(SCREENS.HOME)}
            onComplete={()=>{ setInstantPickDone(true); setScreen(SCREENS.HOME); }}/>}
          {screen===SCREENS.PREDICTIONS&&<PredictionsScreen
            boardId={activeBoardId}
            predictions={getPreds(activeBoardId)}
            setPredictions={(updater)=>setPreds(activeBoardId, updater)}
            onBack={()=>setScreen(SCREENS.HOME)}
            onComplete={()=>{ setPredictionsComplete(p=>({...p,[activeBoardId]:true})); setScreen(SCREENS.HOME); }}
            tournamentStarted={tournamentStarted}/>}
          {screen===SCREENS.FAST_PREDICTION&&<FastPredictionScreen onHome={()=>setScreen(SCREENS.HOME)}/>}
          {screen===SCREENS.STATS&&<StatsScreen lang={lang}/>}
          {screen===SCREENS.RULES&&<RulesScreen onBack={()=>setScreen(SCREENS.HOME)}/>}
          {screen===SCREENS.GROUPS_SCHEDULE&&<GroupsScheduleScreen scores={exactScores} setScores={setExactScores} onBack={()=>setScreen(SCREENS.HOME)}/>}
          {screen===SCREENS.ACCOUNT&&<AccountScreen lang={lang}/>}
        </div>
        {showFooter&&<Footer active={footerActive} onNavigate={setScreen} lang={lang}/>}
      </div>
    </div>
  );
}