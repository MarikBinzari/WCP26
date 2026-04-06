import { useState, useEffect } from "react";

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
  FAST_PREDICTION:"fast_prediction",
  LEADERBOARD:"leaderboard", STATS:"stats", ACCOUNT:"account",
};

const INITIAL_BOARDS = [
  { id:"global", label:"🌍", name:"Global Board", members:48291, isGlobal:true },
];

const AVAILABLE_BOARDS = [
  { id:"fc-prieteni", label:"⚽", name:"FC Prieteni 2026", members:8, max:10, type:"private" },
  { id:"birou", label:"💼", name:"Birou Fotbal", members:6, max:10, type:"private" },
  { id:"romania", label:"🇷🇴", name:"Romania Bate!", members:312, max:null, type:"public" },
  { id:"marius", label:"🏆", name:"Boardul Lui Marius", members:4, max:10, type:"private" },
];

const BOARD_LEADERS = {
  global: [
    { rank:1, name:"Alex", pts:342, prize:"250 lei", emoji:"🥇", accent:"#FFF3DC" },
    { rank:2, name:"Maria", pts:318, prize:"150 lei", emoji:"🥈", accent:BG },
    { rank:3, name:"David", pts:295, prize:"100 lei", emoji:"🥉", accent:"#F5EDE0" },
    { rank:4, name:"Andreea V.", pts:271, accent:BG },
    { rank:5, name:"Bogdan C.", pts:248, accent:BG },
    { rank:6, name:"Ioana M.", pts:229, accent:BG },
    { rank:7, name:"Tu (You)", pts:201, accent:"#E8F0FF", isMe:true },
  ],
  "fc-prieteni": [
    { rank:1, name:"Bogdan C.", pts:248, emoji:"🥇", accent:"#FFF3DC" },
    { rank:2, name:"Tu (You)", pts:201, emoji:"🥈", accent:"#E8F0FF", isMe:true },
    { rank:3, name:"Radu P.", pts:188, emoji:"🥉", accent:"#F5EDE0" },
    { rank:4, name:"Ioana M.", pts:155, accent:BG },
  ],
};

const STAGES = [
  { id:"A", label:"Grupa A", type:"group" },
  { id:"B", label:"Grupa B", type:"group" },
  { id:"C", label:"Grupa C", type:"group" },
  { id:"D", label:"Grupa D", type:"group" },
  { id:"R16", label:"Optimi", type:"ko" },
  { id:"QF", label:"Sferturi", type:"ko" },
  { id:"SF", label:"Semifinale", type:"ko" },
  { id:"F", label:"Finala", type:"ko" },
];

const GROUPS_DATA = {
  A: {
    teams:[
      { name:"Brazil", flag:"🇧🇷", pts:6, w:2, d:0, l:0, gf:5, ga:0 },
      { name:"France", flag:"🇫🇷", pts:4, w:1, d:1, l:0, gf:2, ga:2 },
      { name:"Mexico", flag:"🇲🇽", pts:1, w:0, d:1, l:1, gf:1, ga:2 },
      { name:"Morocco", flag:"🇲🇦", pts:0, w:0, d:0, l:2, gf:0, ga:4 },
    ],
    matches:[
      { id:"A0", home:"Brazil", hf:"🇧🇷", away:"Morocco", af:"🇲🇦", sh:"3", sa:"0", date:"11 iun", time:"19:00", done:true },
      { id:"A1", home:"France", hf:"🇫🇷", away:"Mexico", af:"🇲🇽", sh:"1", sa:"1", date:"11 iun", time:"22:00", done:true },
      { id:"A2", home:"Brazil", hf:"🇧🇷", away:"France", af:"🇫🇷", sh:"2", sa:"1", date:"15 iun", time:"20:00", done:true },
      { id:"A3", home:"Mexico", hf:"🇲🇽", away:"Morocco", af:"🇲🇦", sh:null, sa:null, date:"15 iun", time:"20:00", done:false },
      { id:"A4", home:"Brazil", hf:"🇧🇷", away:"Mexico", af:"🇲🇽", sh:null, sa:null, date:"19 iun", time:"20:00", done:false },
      { id:"A5", home:"France", hf:"🇫🇷", away:"Morocco", af:"🇲🇦", sh:null, sa:null, date:"19 iun", time:"20:00", done:false },
    ],
  },
  B: {
    teams:[
      { name:"Argentina", flag:"🇦🇷", pts:6, w:2, d:0, l:0, gf:3, ga:0 },
      { name:"England", flag:"🏴󠁧󠁢󠁥󠁧󠁿", pts:3, w:1, d:0, l:1, gf:1, ga:2 },
      { name:"USA", flag:"🇺🇸", pts:3, w:1, d:0, l:1, gf:2, ga:1 },
      { name:"Poland", flag:"🇵🇱", pts:0, w:0, d:0, l:2, gf:1, ga:4 },
    ],
    matches:[
      { id:"B0", home:"Argentina", hf:"🇦🇷", away:"Poland", af:"🇵🇱", sh:"2", sa:"0", date:"12 iun", time:"19:00", done:true },
      { id:"B1", home:"England", hf:"🏴󠁧󠁢󠁥󠁧󠁿", away:"USA", af:"🇺🇸", sh:"1", sa:"2", date:"12 iun", time:"22:00", done:true },
      { id:"B2", home:"Argentina", hf:"🇦🇷", away:"England", af:"🏴󠁧󠁢󠁥󠁧󠁿", sh:"1", sa:"0", date:"16 iun", time:"20:00", done:true },
      { id:"B3", home:"USA", hf:"🇺🇸", away:"Poland", af:"🇵🇱", sh:null, sa:null, date:"16 iun", time:"20:00", done:false },
      { id:"B4", home:"Argentina", hf:"🇦🇷", away:"USA", af:"🇺🇸", sh:null, sa:null, date:"20 iun", time:"20:00", done:false },
      { id:"B5", home:"England", hf:"🏴󠁧󠁢󠁥󠁧󠁿", away:"Poland", af:"🇵🇱", sh:null, sa:null, date:"20 iun", time:"20:00", done:false },
    ],
  },
  C: {
    teams:[
      { name:"Spain", flag:"🇪🇸", pts:4, w:1, d:1, l:0, gf:4, ga:1 },
      { name:"Portugal", flag:"🇵🇹", pts:4, w:1, d:1, l:0, gf:3, ga:1 },
      { name:"Japan", flag:"🇯🇵", pts:3, w:1, d:0, l:1, gf:2, ga:3 },
      { name:"Canada", flag:"🇨🇦", pts:0, w:0, d:0, l:2, gf:0, ga:4 },
    ],
    matches:[
      { id:"C0", home:"Spain", hf:"🇪🇸", away:"Canada", af:"🇨🇦", sh:"3", sa:"0", date:"13 iun", time:"19:00", done:true },
      { id:"C1", home:"Portugal", hf:"🇵🇹", away:"Japan", af:"🇯🇵", sh:"2", sa:"1", date:"13 iun", time:"22:00", done:true },
      { id:"C2", home:"Spain", hf:"🇪🇸", away:"Portugal", af:"🇵🇹", sh:"1", sa:"1", date:"17 iun", time:"20:00", done:true },
      { id:"C3", home:"Japan", hf:"🇯🇵", away:"Canada", af:"🇨🇦", sh:null, sa:null, date:"17 iun", time:"20:00", done:false },
      { id:"C4", home:"Spain", hf:"🇪🇸", away:"Japan", af:"🇯🇵", sh:null, sa:null, date:"21 iun", time:"20:00", done:false },
      { id:"C5", home:"Portugal", hf:"🇵🇹", away:"Canada", af:"🇨🇦", sh:null, sa:null, date:"21 iun", time:"20:00", done:false },
    ],
  },
  D: {
    teams:[
      { name:"Germany", flag:"🇩🇪", pts:6, w:2, d:0, l:0, gf:5, ga:1 },
      { name:"Netherlands", flag:"🇳🇱", pts:3, w:1, d:0, l:1, gf:2, ga:2 },
      { name:"Senegal", flag:"🇸🇳", pts:3, w:1, d:0, l:1, gf:2, ga:2 },
      { name:"Australia", flag:"🇦🇺", pts:0, w:0, d:0, l:2, gf:1, ga:5 },
    ],
    matches:[
      { id:"D0", home:"Germany", hf:"🇩🇪", away:"Australia", af:"🇦🇺", sh:"4", sa:"0", date:"14 iun", time:"19:00", done:true },
      { id:"D1", home:"Netherlands", hf:"🇳🇱", away:"Senegal", af:"🇸🇳", sh:"2", sa:"1", date:"14 iun", time:"22:00", done:true },
      { id:"D2", home:"Germany", hf:"🇩🇪", away:"Senegal", af:"🇸🇳", sh:"1", sa:"0", date:"18 iun", time:"20:00", done:true },
      { id:"D3", home:"Australia", hf:"🇦🇺", away:"Netherlands", af:"🇳🇱", sh:null, sa:null, date:"18 iun", time:"20:00", done:false },
      { id:"D4", home:"Germany", hf:"🇩🇪", away:"Netherlands", af:"🇳🇱", sh:null, sa:null, date:"22 iun", time:"20:00", done:false },
      { id:"D5", home:"Senegal", hf:"🇸🇳", away:"Australia", af:"🇦🇺", sh:null, sa:null, date:"22 iun", time:"20:00", done:false },
    ],
  },
};

const KO_STAGES = {
  R16: { label:"Optimi de Finala", locked:false, matches:[
    { id:"R0", home:"1A", hf:"🥇", away:"2B", af:"🥈", date:"26 iun", time:"18:00", done:false },
    { id:"R1", home:"1B", hf:"🥇", away:"2A", af:"🥈", date:"26 iun", time:"22:00", done:false },
  ]},
  QF: { label:"Sferturi de Finala", locked:true, matches:[] },
  SF: { label:"Semifinale", locked:true, matches:[] },
  F:  { label:"Marea Finala", locked:true, matches:[] },
};

const CALENDAR_EVENTS = [
  {day:11,matches:[{home:"Brazil",homeFlag:"🇧🇷",away:"Morocco",awayFlag:"🇲🇦",time:"19:00",group:"A"},{home:"France",homeFlag:"🇫🇷",away:"Mexico",awayFlag:"🇲🇽",time:"22:00",group:"A"}]},
  {day:12,matches:[{home:"Argentina",homeFlag:"🇦🇷",away:"Poland",awayFlag:"🇵🇱",time:"19:00",group:"B"},{home:"England",homeFlag:"🏴󠁧󠁢󠁥󠁧󠁿",away:"USA",awayFlag:"🇺🇸",time:"22:00",group:"B"}]},
  {day:13,matches:[{home:"Spain",homeFlag:"🇪🇸",away:"Canada",awayFlag:"🇨🇦",time:"19:00",group:"C"},{home:"Portugal",homeFlag:"🇵🇹",away:"Japan",awayFlag:"🇯🇵",time:"22:00",group:"C"}]},
  {day:14,matches:[{home:"Germany",homeFlag:"🇩🇪",away:"Australia",awayFlag:"🇦🇺",time:"19:00",group:"D"},{home:"Netherlands",homeFlag:"🇳🇱",away:"Senegal",awayFlag:"🇸🇳",time:"22:00",group:"D"}]},
  {day:15,matches:[{home:"Brazil",homeFlag:"🇧🇷",away:"France",awayFlag:"🇫🇷",time:"20:00",group:"A"},{home:"Mexico",homeFlag:"🇲🇽",away:"Morocco",awayFlag:"🇲🇦",time:"20:00",group:"A"}]},
  {day:16,matches:[{home:"Argentina",homeFlag:"🇦🇷",away:"England",awayFlag:"🏴󠁧󠁢󠁥󠁧󠁿",time:"20:00",group:"B"},{home:"USA",homeFlag:"🇺🇸",away:"Poland",awayFlag:"🇵🇱",time:"20:00",group:"B"}]},
  {day:17,matches:[{home:"Spain",homeFlag:"🇪🇸",away:"Portugal",awayFlag:"🇵🇹",time:"20:00",group:"C"},{home:"Japan",homeFlag:"🇯🇵",away:"Canada",awayFlag:"🇨🇦",time:"20:00",group:"C"}]},
  {day:18,matches:[{home:"Germany",homeFlag:"🇩🇪",away:"Senegal",awayFlag:"🇸🇳",time:"20:00",group:"D"},{home:"Australia",homeFlag:"🇦🇺",away:"Netherlands",awayFlag:"🇳🇱",time:"20:00",group:"D"}]},
];

const LANGS = [{ code:"en", flag:"🇬🇧", name:"English" },{ code:"ro", flag:"🇷🇴", name:"Romana" },{ code:"fr", flag:"🇫🇷", name:"Francais" }];
const T = {
  en:{ location:"USA, Canada & Mexico", cta:"Make Your Prediction", days:"DAYS", hours:"HOURS", minutes:"MINUTES", seconds:"SECONDS", footerHome:"Home", footerStats:"Stats", footerFast:"Fast Pick", footerAccount:"Account" },
  ro:{ location:"SUA, Canada & Mexic", cta:"Fa-ti Predictia", days:"ZILE", hours:"ORE", minutes:"MIN", seconds:"SEC", footerHome:"Acasa", footerStats:"Statistici", footerFast:"Fast Pick", footerAccount:"Cont" },
  fr:{ location:"USA, Canada & Mexique", cta:"Faites vos Pronostics", days:"JOURS", hours:"HEURES", minutes:"MIN", seconds:"SEC", footerHome:"Accueil", footerStats:"Stats", footerFast:"Fast Pick", footerAccount:"Compte" },
};

function useCountdown() {
  const target = new Date("2026-06-11T18:00:00");
  const [diff, setDiff] = useState(target - new Date());
  useEffect(() => { const t = setInterval(() => setDiff(target - new Date()), 1000); return () => clearInterval(t); }, []);
  return { d:Math.max(0,Math.floor(diff/86400000)), h:Math.max(0,Math.floor((diff%86400000)/3600000)), m:Math.max(0,Math.floor((diff%3600000)/60000)), s:Math.max(0,Math.floor((diff%60000)/1000)) };
}

// ── CALENDAR ──────────────────────────────────────────────────────────────────
function CalendarSlider() {
  const [sel, setSel] = useState(null);
  const mm = {};
  CALENDAR_EVENTS.forEach(e => { mm[e.day] = e.matches; });
  const cells = Array.from({length:30},(_,i)=>i+1);
  const dl = ["L","M","M","J","V","S","D"];
  const sm = sel ? mm[sel] : null;
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>Iunie 2026</p>
        <span style={{fontSize:10,color:NAVY,fontWeight:700,background:"#E8F0FF",padding:"3px 8px",borderRadius:6}}>FIFA WC 2026</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:3}}>
        {dl.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:i===6?RED:"#bbb"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((day,i)=>{
          const isS=day===11,has=!!mm[day],isSel=sel===day,isSun=i%7===6;
          let bg="transparent",border="1.5px solid transparent",shadow="none",tc=isSun?RED:"#555",fw=400;
          if(isSel){bg=`linear-gradient(135deg,${NAVY},#001840)`;shadow="0 3px 10px rgba(0,32,91,0.35)";tc="#fff";fw=800;}
          else if(isS){bg="#E8F0FF";border=`1.5px solid ${NAVY}`;tc=NAVY;fw=800;}
          else if(has){fw=700;tc=DARK;}
          return (
            <div key={day} onClick={()=>has&&setSel(isSel?null:day)}
              style={{position:"relative",aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:8,cursor:has?"pointer":"default",background:bg,border,boxShadow:shadow,transition:"all 0.15s"}}>
              <span style={{fontSize:12,fontWeight:fw,color:tc,lineHeight:1}}>{day}</span>
              {has&&!isSel&&<div style={{width:4,height:4,borderRadius:"50%",background:isS?NAVY:RED,marginTop:2}}/>}
              {isS&&!isSel&&<div style={{position:"absolute",top:-5,right:-2,background:RED,borderRadius:4,padding:"1px 3px",fontSize:6,fontWeight:800,color:"#fff"}}>START</div>}
            </div>
          );
        })}
      </div>
      {sm&&(
        <div style={{marginTop:10,background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>{sel} Iunie - {sm.length} meciuri</span>
            <span onClick={()=>setSel(null)} style={{fontSize:20,color:"rgba(255,255,255,0.5)",cursor:"pointer",padding:"0 4px"}}>x</span>
          </div>
          {sm.map((m,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",padding:"10px 14px",borderBottom:i<sm.length-1?"1px solid rgba(0,0,0,0.06)":"none",gap:8}}>
              <span style={{fontSize:11,color:"#aaa",fontWeight:600,width:36}}>{m.time}</span>
              <span style={{fontSize:10,background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",borderRadius:5,padding:"2px 5px",fontWeight:700,flexShrink:0}}>Gr.{m.group}</span>
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

// ── PRED INPUT ────────────────────────────────────────────────────────────────
function PredInput({ m, pred, setPreds }) {
  const set = (side,val) => setPreds(p=>({...p,[m.id]:{...p[m.id],[side]:val}}));
  const setW = w => setPreds(p=>({...p,[m.id]:{...p[m.id],winner:p[m.id]?.winner===w?null:w}}));
  return (
    <>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
          <span style={{fontSize:13,fontWeight:600,color:DARK}}>{m.home}</span>
          <span style={{fontSize:20}}>{m.hf}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <input type="number" min="0" max="20" placeholder="-" value={pred.home??""} onChange={e=>set("home",e.target.value)}
            style={{width:42,height:42,borderRadius:10,border:"none",background:BG,boxShadow:SHADOW_IN,fontSize:18,fontWeight:700,textAlign:"center",color:NAVY,outline:"none"}}/>
          <span style={{fontSize:14,color:"#ccc"}}>:</span>
          <input type="number" min="0" max="20" placeholder="-" value={pred.away??""} onChange={e=>set("away",e.target.value)}
            style={{width:42,height:42,borderRadius:10,border:"none",background:BG,boxShadow:SHADOW_IN,fontSize:18,fontWeight:700,textAlign:"center",color:NAVY,outline:"none"}}/>
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:20}}>{m.af}</span>
          <span style={{fontSize:13,fontWeight:600,color:DARK}}>{m.away}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:6}}>
        {[m.home,"Egal",m.away].map((opt,idx)=>(
          <button key={opt} onClick={()=>setW(opt)}
            style={{flex:1,padding:"7px 4px",borderRadius:9,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",
              background:pred.winner===opt?`linear-gradient(135deg,${NAVY},#001840)`:BG,
              color:pred.winner===opt?"#fff":DARK,
              boxShadow:pred.winner===opt?"0 3px 10px rgba(0,32,91,0.3)":SHADOW_OUT,transition:"all 0.18s"}}>
            {idx===0?"1":idx===1?"X":"2"}
          </button>
        ))}
      </div>
    </>
  );
}

// ── PREDICTIONS SCREEN ────────────────────────────────────────────────────────
function GrupeTab({ groupRank, setRank, FLAGS, ECHIPE }) {
  const GRUPE_LIST = ["A","B"];
  const [gIdx, setGIdx] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const activeGrupa = GRUPE_LIST[gIdx];
  const teams = ECHIPE[activeGrupa];
  const rank = groupRank[activeGrupa] || {};
  const medals = ["🥇","🥈","🥉","4️⃣"];
  const rankColors = [GREEN, NAVY, "#888", "#aaa"];

  const handleTeamClick = (team) => {
    const existingPos = Object.entries(rank).find(([,v]) => v === team)?.[0];
    if (existingPos) { setRank(activeGrupa, parseInt(existingPos), team); return; }
    const nextPos = [1,2,3,4].find(p => !rank[p]);
    if (nextPos) setRank(activeGrupa, nextPos, team);
  };

  const swapPositions = (posA, posB) => {
    const teamA = rank[posA] || null;
    const teamB = rank[posB] || null;
    if (teamA) setRank(activeGrupa, posB, teamA); else if (rank[posB]) setRank(activeGrupa, posB, rank[posB]);
    if (teamB) setRank(activeGrupa, posA, teamB); else if (rank[posA]) setRank(activeGrupa, posA, rank[posA]);
  };

  const handleDrop = (targetPos) => {
    if (dragging !== null && dragging !== targetPos) swapPositions(dragging, targetPos);
    setDragging(null); setDragOver(null);
  };

  return (
    <>
      <div style={{borderRadius:20,overflow:"hidden",marginBottom:14,boxShadow:SHADOW_OUT}}>
        <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:17,fontWeight:900,color:"#fff",letterSpacing:1}}>GROUP {activeGrupa}</span>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.45)",fontWeight:600}}>Tap → clasament</span>
        </div>
        <div style={{background:`linear-gradient(135deg,${NAVY} 0%,#001840 100%)`,padding:"18px 10px 20px",display:"flex",justifyContent:"space-around",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          {teams.map(t => {
            const pos = Object.entries(rank).find(([,v]) => v===t)?.[0];
            const isRanked = !!pos;
            return (
              <div key={t} onClick={()=>handleTeamClick(t)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",transition:"all 0.2s",opacity:isRanked?0.4:1}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:isRanked?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.12)",border:isRanked?"3px solid rgba(255,255,255,0.15)":"3px solid rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:isRanked?"none":"0 4px 16px rgba(0,0,0,0.4)",transition:"all 0.2s"}}>
                  {FLAGS[t]}
                </div>
                <span style={{fontSize:10,fontWeight:800,color:isRanked?"rgba(255,255,255,0.3)":"#fff",letterSpacing:0.5}}>{t.substring(0,3).toUpperCase()}</span>
                {isRanked && <span style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontWeight:700}}>#{pos}</span>}
              </div>
            );
          })}
        </div>
        <div style={{background:BG}}>
          <div style={{padding:"8px 14px 4px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>Clasament prezis</span>
            {Object.keys(rank).length > 1 && <span style={{fontSize:10,color:NAVY,fontWeight:600}}>· trage sa schimbi</span>}
          </div>
          {[1,2,3,4].map(pos => {
            const team = rank[pos];
            const isDraggingThis = dragging === pos;
            const isDropTarget = dragOver === pos && dragging !== null && dragging !== pos;
            return (
              <div key={pos} draggable={!!team}
                onDragStart={()=>{ if(team) setDragging(pos); }}
                onDragOver={e=>{ e.preventDefault(); setDragOver(pos); }}
                onDragLeave={()=>setDragOver(null)}
                onDrop={()=>handleDrop(pos)}
                onDragEnd={()=>{ setDragging(null); setDragOver(null); }}
                style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:isDropTarget?"#E8F0FF":isDraggingThis?"rgba(0,32,91,0.05)":"#fff",borderBottom:pos<4?"1px solid rgba(0,0,0,0.05)":"none",marginBottom:pos<4?1:0,cursor:team?"grab":"default",border:isDropTarget?`2px solid ${NAVY}`:"2px solid transparent",borderRadius:pos===1?"12px 12px 0 0":pos===4?"0 0 12px 12px":"0",transition:"background 0.15s",opacity:isDraggingThis?0.5:1}}>
                <span style={{fontSize:10,fontWeight:800,color:rankColors[pos-1],width:20,textAlign:"center"}}>#{pos}</span>
                <span style={{fontSize:20}}>{medals[pos-1]}</span>
                {team ? (
                  <>
                    <span style={{fontSize:22}}>{FLAGS[team]}</span>
                    <span style={{flex:1,fontSize:14,fontWeight:700,color:DARK}}>{team}</span>
                    <span style={{fontSize:16,color:"#ccc"}}>⠿</span>
                    <button onClick={e=>{ e.stopPropagation(); setRank(activeGrupa,pos,team); }} style={{fontSize:12,color:"#bbb",background:"transparent",border:"none",cursor:"pointer",padding:"4px 6px"}}>✕</button>
                  </>
                ) : (
                  <span style={{flex:1,fontSize:13,color:"#ccc",fontStyle:"italic"}}>— locul {pos}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <span style={{fontSize:12,color:"#aaa",fontWeight:600}}>{gIdx+1} of {GRUPE_LIST.length}</span>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>gIdx>0&&setGIdx(gIdx-1)} style={{width:36,height:36,borderRadius:"50%",border:"none",background:gIdx>0?BG:"rgba(0,0,0,0.04)",boxShadow:gIdx>0?SHADOW_OUT:"none",cursor:gIdx>0?"pointer":"default",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:gIdx>0?DARK:"#ddd"}}>←</button>
          <button onClick={()=>gIdx<GRUPE_LIST.length-1&&setGIdx(gIdx+1)} style={{width:36,height:36,borderRadius:"50%",border:"none",background:gIdx<GRUPE_LIST.length-1?BG:"rgba(0,0,0,0.04)",boxShadow:gIdx<GRUPE_LIST.length-1?SHADOW_OUT:"none",cursor:gIdx<GRUPE_LIST.length-1?"pointer":"default",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:gIdx<GRUPE_LIST.length-1?DARK:"#ddd"}}>→</button>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:4}}>
        <button onClick={()=>{[1,2,3,4].forEach(p=>{ if(rank[p]) setRank(activeGrupa,p,rank[p]); });}} style={{flex:1,padding:"13px 0",borderRadius:12,border:"2px solid "+DARK,background:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",color:DARK,letterSpacing:0.5}}>RESET</button>
        <button onClick={()=>{
          const remaining = teams.filter(t=>!Object.values(rank).includes(t));
          const shuffled = [...remaining].sort(()=>Math.random()-0.5);
          const positions = [1,2,3,4].filter(p=>!rank[p]);
          positions.forEach((p,i)=>{ if(shuffled[i]) setRank(activeGrupa,p,shuffled[i]); });
        }} style={{flex:1,padding:"13px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${GREEN},#007A36)`,fontSize:13,fontWeight:800,cursor:"pointer",color:"#fff",letterSpacing:0.5,boxShadow:"0 4px 14px rgba(0,154,68,0.35)"}}>AUTO PICK</button>
      </div>
    </>
  );
}

function PredictionsScreen({ onBack }) {
  const TABS = [
    { id:"grupe",      label:"Group Stage" },
    { id:"best3",      label:"Best Third" },
    { id:"knockout",   label:"Knockout" },
    { id:"boosters",   label:"Boosters" },
  ];

  const [activeTab, setActiveTab] = useState("grupe");
  const [groupRank, setGroupRank] = useState({});
  const [best3picks, setBest3picks] = useState([]);
  const [knockoutPicks, setKnockoutPicks] = useState({});
  const [teamBooster, setTeamBooster] = useState(null);
  const [golgheter, setGolgheter] = useState(null);

  const ECHIPE = {
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
    "Denmark":"🇩🇰","Tunisia":"🇹🇳",
  };

  const setRank = (grupa, pos, echipa) =>
    setGroupRank(r => {
      const g = { ...r[grupa] };
      if (g[pos] === echipa) { delete g[pos]; }
      else { g[pos] = echipa; }
      return { ...r, [grupa]: g };
    });

  // Check if Group Stage is complete (A and B fully ranked)
  const groupStageComplete = ["A","B"].every(g => {
    const r = groupRank[g] || {};
    return [1,2,3,4].every(p => !!r[p]);
  });

  // Auto-fill groups C,D,E,F randomly (simulated)
  const ALL_GROUPS = ["A","B","C","D","E","F"];
  const getGroupThird = (g) => {
    if (g === "A" || g === "B") {
      return groupRank[g]?.[3] || null;
    }
    // Random fixed seed for demo groups C-F
    const demo = { C:"Japan", D:"Senegal", E:"Croatia", F:"Australia" };
    return demo[g];
  };
  const allThirds = ALL_GROUPS.map(g => ({ group:g, team:getGroupThird(g) })).filter(x=>x.team);

  // Knockout bracket — 16 teams: winners A-F + 2 best thirds + runners-up
  const getTeam = (g, pos) => {
    if (g === "A" || g === "B") return groupRank[g]?.[pos] || `#${pos} Gr.${g}`;
    const demoWinners = { C:"Spain", D:"Germany", E:"Belgium", F:"Denmark" };
    const demoSecond = { C:"Portugal", D:"Netherlands", E:"Serbia", F:"Tunisia" };
    return pos === 1 ? demoWinners[g] : demoSecond[g];
  };

  const R16_MATCHES = [
    { id:"r16_0", t1: getTeam("A",1), t2: getTeam("B",2) },
    { id:"r16_1", t1: getTeam("B",1), t2: getTeam("A",2) },
    { id:"r16_2", t1: getTeam("C",1), t2: getTeam("D",2) },
    { id:"r16_3", t1: getTeam("D",1), t2: getTeam("C",2) },
    { id:"r16_4", t1: getTeam("E",1), t2: best3picks[0] || "Best 3rd" },
    { id:"r16_5", t1: getTeam("F",1), t2: best3picks[1] || "Best 3rd" },
    { id:"r16_6", t1: getTeam("E",2), t2: best3picks[2] || "Best 3rd" },
    { id:"r16_7", t1: getTeam("F",2), t2: best3picks[3] || "Best 3rd" },
  ];

  const best3Complete = best3picks.length === 8;

  const KO_ROUNDS = [
    { id:"qf", label:"Quarter-Finals", matches:[
      { id:"qf0", pts:60, t1: knockoutPicks["r16_0"]||"R16 W1", t2: knockoutPicks["r16_1"]||"R16 W2" },
      { id:"qf1", pts:60, t1: knockoutPicks["r16_2"]||"R16 W3", t2: knockoutPicks["r16_3"]||"R16 W4" },
      { id:"qf2", pts:60, t1: knockoutPicks["r16_4"]||"R16 W5", t2: knockoutPicks["r16_5"]||"R16 W6" },
      { id:"qf3", pts:60, t1: knockoutPicks["r16_6"]||"R16 W7", t2: knockoutPicks["r16_7"]||"R16 W8" },
    ]},
    { id:"sf", label:"Semi-Finals", matches:[
      { id:"sf0", pts:90, t1: knockoutPicks["qf0"]||"QF W1", t2: knockoutPicks["qf1"]||"QF W2" },
      { id:"sf1", pts:90, t1: knockoutPicks["qf2"]||"QF W3", t2: knockoutPicks["qf3"]||"QF W4" },
    ]},
    { id:"final", label:"Final", matches:[
      { id:"final0", pts:120, t1: knockoutPicks["sf0"]||"SF W1", t2: knockoutPicks["sf1"]||"SF W2" },
      { id:"3rd", pts:90, t1: knockoutPicks["sf0"] ? (knockoutPicks["sf0"]==="??"?"??":R16_MATCHES[0].t1) : "SF L1", t2: "SF L2", label:"3rd Place" },
    ]},
  ];

  const ALL_TEAMS_FLAT = Object.values(ECHIPE).flat();
  const GOALSCORERS = ["Mbappe","Messi","Ronaldo","Haaland","Vinicius Jr","Bellingham","Saka","Kane","Lewandowski","Osimhen"];

  const KOMatch = ({ matchId, t1, t2, pts, label }) => {
    const pick = knockoutPicks[matchId];
    const f1 = FLAGS[t1] || "🏳";
    const f2 = FLAGS[t2] || "🏳";
    return (
      <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,marginBottom:8,overflow:"hidden"}}>
        {label && <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"5px 12px"}}><span style={{fontSize:10,color:"rgba(255,255,255,0.6)",fontWeight:700}}>{label}</span></div>}
        <div style={{padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:10,color:"#aaa",fontWeight:600}}>Alege castigatorul</span>
            <span style={{marginLeft:"auto",fontSize:10,background:"rgba(0,32,91,0.08)",color:NAVY,borderRadius:5,padding:"2px 6px",fontWeight:700}}>+{pts}pts</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            {[{team:t1,flag:f1},{team:t2,flag:f2}].map(({team,flag})=>(
              <button key={team} onClick={()=>setKnockoutPicks(k=>({...k,[matchId]:k[matchId]===team?null:team}))}
                style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 8px",borderRadius:10,border:"none",cursor:"pointer",transition:"all 0.18s",
                  background:pick===team?`linear-gradient(135deg,${NAVY},#001840)`:BG,
                  color:pick===team?"#fff":DARK,
                  boxShadow:pick===team?"0 4px 12px rgba(0,32,91,0.3)":SHADOW_OUT,
                  fontWeight:pick===team?700:500,fontSize:12}}>
                <span style={{fontSize:18}}>{flag}</span>
                <span>{team}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
      {/* HEADER */}
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px 10px"}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff",flexShrink:0}}>&#8249;</div>
          <div style={{flex:1}}>
            <p style={{fontSize:9,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA - WORLD CUP 2026</p>
            <h2 style={{fontSize:17,fontWeight:800,color:"#fff",margin:0}}>Predictions</h2>
          </div>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff"}}>🔔</div>
        </div>
        <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",paddingLeft:8,paddingRight:8}}>
          {TABS.map(t => {
            const locked = (t.id==="best3" && !groupStageComplete) || (t.id==="knockout" && !best3Complete) || (t.id==="boosters" && !best3Complete);
            return (
              <button key={t.id} onClick={()=>!locked&&setActiveTab(t.id)}
                style={{flexShrink:0,padding:"9px 14px",border:"none",fontSize:12,fontWeight:700,cursor:locked?"default":"pointer",background:"transparent",
                  color:activeTab===t.id?"#fff":locked?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.45)",position:"relative",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                {locked && <span style={{fontSize:10}}>🔒</span>}
                {t.label}
                {activeTab===t.id&&<div style={{position:"absolute",bottom:0,left:6,right:6,height:3,borderRadius:"3px 3px 0 0",background:RED}}/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* STICKY NEXT BAR */}
      {(activeTab==="grupe" || activeTab==="best3") && (
        <div style={{flexShrink:0,padding:"10px 20px",background:BG,borderTop:"1px solid rgba(0,0,0,0.07)",
          background:(activeTab==="grupe"&&groupStageComplete)||(activeTab==="best3"&&best3Complete)
            ?`linear-gradient(135deg,${GREEN},#007A36)`:BG}}>
          {activeTab==="grupe" && (
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {groupStageComplete ? (
                <>
                  <span style={{fontSize:16}}>✅</span>
                  <span style={{flex:1,fontSize:13,fontWeight:700,color:"#fff"}}>Group Stage complet!</span>
                  <button onClick={()=>setActiveTab("best3")}
                    style={{background:"rgba(255,255,255,0.25)",border:"none",borderRadius:10,padding:"10px 18px",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>
                    Next →
                  </button>
                </>
              ) : (
                <>
                  <span style={{fontSize:14}}>⏳</span>
                  <span style={{flex:1,fontSize:12,color:"#aaa"}}>Selecteaza ordinea pentru Grupa A si B</span>
                  <span style={{fontSize:12,fontWeight:800,color:"#bbb"}}>
                    {["A","B"].filter(g=>[1,2,3,4].every(p=>!!(groupRank[g]||{})[p])).length}/2
                  </span>
                </>
              )}
            </div>
          )}
          {activeTab==="best3" && (
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {best3Complete ? (
                <>
                  <span style={{fontSize:16}}>✅</span>
                  <span style={{flex:1,fontSize:13,fontWeight:700,color:"#fff"}}>Best Third complet!</span>
                  <button onClick={()=>setActiveTab("knockout")}
                    style={{background:"rgba(255,255,255,0.25)",border:"none",borderRadius:10,padding:"10px 18px",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>
                    Next →
                  </button>
                </>
              ) : (
                <>
                  <span style={{fontSize:14}}>⏳</span>
                  <span style={{flex:1,fontSize:12,color:"#aaa"}}>Mai selecteaza {8-best3picks.length} echipe</span>
                  <span style={{fontSize:12,fontWeight:800,color:"#bbb"}}>{best3picks.length}/8</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 16px"}}>

        {/* ════ GROUP STAGE ════ */}
        {activeTab==="grupe" && (
          <>
            <div style={{background:"#E8F0FF",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:15}}>⚽</span>
              <div style={{flex:1}}>
                <p style={{fontSize:12,fontWeight:700,color:NAVY,margin:"0 0 1px"}}>Group Stage</p>
                <p style={{fontSize:11,color:"#666",margin:0}}>Selecteaza ordinea finala pentru Grupa A si B. Restul se genereaza automat.</p>
              </div>
              {groupStageComplete && <span style={{fontSize:16}}>✅</span>}
            </div>
            <GrupeTab groupRank={groupRank} setRank={setRank} FLAGS={FLAGS} ECHIPE={ECHIPE}/>

          </>
        )}

        {/* ════ BEST THIRD ════ */}
        {activeTab==="best3" && (
          <>
            {/* Info bar */}
            <div style={{background:"#E8F0FF",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:15}}>🥉</span>
              <div style={{flex:1}}>
                <p style={{fontSize:12,fontWeight:700,color:NAVY,margin:"0 0 1px"}}>Pick the Best Third</p>
                <p style={{fontSize:11,color:"#666",margin:0}}>12 grupe · 12 echipe pe locul 3 · alege 8 care se califica</p>
              </div>
              <div style={{background:best3picks.length===8?GREEN:NAVY,borderRadius:8,padding:"4px 10px"}}>
                <span style={{fontSize:13,fontWeight:800,color:"#fff"}}>{best3picks.length}/8</span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{height:6,borderRadius:3,background:"rgba(0,0,0,0.08)",marginBottom:14,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(best3picks.length/8)*100}%`,background:`linear-gradient(90deg,${NAVY},${RED})`,borderRadius:3,transition:"width 0.3s"}}/>
            </div>

            {/* 12 teams grid */}
            {(() => {
              const ALL_THIRDS = [
                {group:"A", team: groupRank["A"]?.[3] || "Morocco", flag:"🇲🇦"},
                {group:"B", team: groupRank["B"]?.[3] || "Poland", flag:"🇵🇱"},
                {group:"C", team:"Japan", flag:"🇯🇵"},
                {group:"D", team:"Senegal", flag:"🇸🇳"},
                {group:"E", team:"Croatia", flag:"🇭🇷"},
                {group:"F", team:"Australia", flag:"🇦🇺"},
                {group:"G", team:"Iran", flag:"🇮🇷"},
                {group:"H", team:"South Korea", flag:"🇰🇷"},
                {group:"I", team:"Ecuador", flag:"🇪🇨"},
                {group:"J", team:"Cameroon", flag:"🇨🇲"},
                {group:"K", team:"Qatar", flag:"🇶🇦"},
                {group:"L", team:"Costa Rica", flag:"🇨🇷"},
              ];
              return (
                <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
                  <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:13,fontWeight:800,color:"#fff"}}>Echipe locul 3</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>tap sa selectezi · {8-best3picks.length} ramase</span>
                  </div>
                  {ALL_THIRDS.map(({group,team,flag},i) => {
                    const isSelected = best3picks.includes(team);
                    const canSelect = !isSelected && best3picks.length < 8;
                    return (
                      <div key={group}
                        onClick={()=>{
                          if(isSelected) setBest3picks(p=>p.filter(x=>x!==team));
                          else if(canSelect) setBest3picks(p=>[...p,team]);
                        }}
                        style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",
                          borderBottom:i<ALL_THIRDS.length-1?"1px solid rgba(0,0,0,0.05)":"none",
                          cursor:isSelected||canSelect?"pointer":"default",
                          background:isSelected?"#E8F0FF":"#fff",
                          opacity:!isSelected&&!canSelect?0.4:1,
                          transition:"all 0.15s"}}>
                        <span style={{fontSize:10,background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",borderRadius:5,padding:"2px 6px",fontWeight:700,flexShrink:0}}>GR.{group}</span>
                        <span style={{fontSize:20}}>{flag}</span>
                        <span style={{flex:1,fontSize:13,fontWeight:isSelected?700:500,color:isSelected?NAVY:DARK}}>{team}</span>
                        <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,
                          border:`2px solid ${isSelected?NAVY:"#ddd"}`,
                          background:isSelected?`linear-gradient(135deg,${NAVY},#001840)`:"transparent",
                          display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                          {isSelected && <span style={{fontSize:11,color:"#fff",fontWeight:800}}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}


          </>
        )}

        {/* ════ KNOCKOUT ════ */}
        {activeTab==="knockout" && (
          <>
            <div style={{background:"#E8F0FF",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:15}}>🏆</span>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:NAVY,margin:"0 0 1px"}}>Knockout Stage</p>
                <p style={{fontSize:11,color:"#666",margin:0}}>R16 +40 · QF +60 · SF +90 · Final +120 · Winner +150</p>
              </div>
            </div>

            {/* Round of 16 */}
            <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>Round of 16 · +40pts</p>
            {R16_MATCHES.map(m => (
              <KOMatch key={m.id} matchId={m.id} t1={m.t1} t2={m.t2} pts={40}/>
            ))}

            {/* QF */}
            <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"14px 0 8px"}}>Quarter-Finals · +60pts</p>
            {KO_ROUNDS[0].matches.map(m => <KOMatch key={m.id} matchId={m.id} t1={m.t1} t2={m.t2} pts={60}/>)}

            {/* SF */}
            <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"14px 0 8px"}}>Semi-Finals · +90pts</p>
            {KO_ROUNDS[1].matches.map(m => <KOMatch key={m.id} matchId={m.id} t1={m.t1} t2={m.t2} pts={90}/>)}

            {/* Final + 3rd */}
            <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"14px 0 8px"}}>Final & 3rd Place</p>
            <KOMatch matchId="3rd" t1={KO_ROUNDS[2].matches[1].t1} t2={KO_ROUNDS[2].matches[1].t2} pts={90} label="3rd Place"/>
            <KOMatch matchId="final0" t1={KO_ROUNDS[2].matches[0].t1} t2={KO_ROUNDS[2].matches[0].t2} pts={120} label="FINAL"/>

            {/* Winner */}
            <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,marginBottom:8,overflow:"hidden"}}>
              <div style={{background:`linear-gradient(135deg,#D4820A,#F0A020)`,padding:"8px 14px"}}><span style={{fontSize:12,fontWeight:800,color:"#fff"}}>🏆 World Cup Winner · +150pts</span></div>
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[knockoutPicks["sf0"],knockoutPicks["sf1"]].filter(Boolean).map(team=>(
                    <button key={team} onClick={()=>setKnockoutPicks(k=>({...k,winner:k.winner===team?null:team}))}
                      style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px 8px",borderRadius:10,border:"none",cursor:"pointer",
                        background:knockoutPicks.winner===team?`linear-gradient(135deg,#D4820A,#F0A020)`:BG,
                        color:knockoutPicks.winner===team?"#fff":DARK,
                        boxShadow:knockoutPicks.winner===team?"0 4px 12px rgba(212,130,10,0.4)":SHADOW_OUT,
                        fontWeight:700,fontSize:13,transition:"all 0.18s"}}>
                      <span style={{fontSize:20}}>{FLAGS[team]||"🏳"}</span>{team}
                    </button>
                  ))}
                  {!knockoutPicks["sf0"] && !knockoutPicks["sf1"] && (
                    <p style={{fontSize:12,color:"#bbb",fontStyle:"italic",margin:0}}>Completeaza semifinalele mai intai</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════ BOOSTERS ════ */}
        {activeTab==="boosters" && (
          <>
            <div style={{background:"#E8F0FF",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:15}}>⚡</span>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:NAVY,margin:"0 0 1px"}}>Boosters & Others</p>
                <p style={{fontSize:11,color:"#666",margin:0}}>Dubleaza punctele + bonusuri speciale</p>
              </div>
            </div>

            {/* Team Booster */}
            <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
              <div style={{background:"linear-gradient(135deg,#7B2FBE,#5B1F9E)",padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:800,color:"#fff",margin:0}}>💎 Team Booster</p>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",margin:"2px 0 0"}}>Dubleaza toate punctele pentru o echipa pe tot turneul</p>
                </div>
                <span style={{fontSize:13,background:"rgba(255,255,255,0.2)",color:"#fff",borderRadius:8,padding:"4px 10px",fontWeight:800}}>x2</span>
              </div>
              <div style={{padding:"14px"}}>
                {teamBooster && (
                  <div style={{display:"flex",alignItems:"center",gap:8,background:"#F0E8FF",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
                    <span style={{fontSize:18}}>{FLAGS[teamBooster]||"🏳"}</span>
                    <span style={{flex:1,fontSize:13,fontWeight:700,color:"#7B2FBE"}}>{teamBooster}</span>
                    <button onClick={()=>setTeamBooster(null)} style={{fontSize:12,color:"#aaa",background:"transparent",border:"none",cursor:"pointer"}}>✕</button>
                  </div>
                )}
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {ALL_TEAMS_FLAT.map(t=>(
                    <button key={t} onClick={()=>setTeamBooster(teamBooster===t?null:t)}
                      style={{display:"flex",alignItems:"center",gap:4,padding:"6px 10px",borderRadius:9,border:"none",
                        background:teamBooster===t?"linear-gradient(135deg,#7B2FBE,#5B1F9E)":BG,
                        color:teamBooster===t?"#fff":DARK,
                        boxShadow:teamBooster===t?"0 3px 10px rgba(123,47,190,0.3)":SHADOW_OUT,
                        cursor:"pointer",fontSize:11,fontWeight:teamBooster===t?700:400,transition:"all 0.15s"}}>
                      <span style={{fontSize:14}}>{FLAGS[t]||"🏳"}</span>{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Golgheter */}
            <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
              <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:800,color:"#fff",margin:0}}>⚽ Golgheter</p>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",margin:"2px 0 0"}}>Jucatorul cu cele mai multe goluri</p>
                </div>
                <span style={{fontSize:13,background:"rgba(255,255,255,0.15)",color:"#fff",borderRadius:8,padding:"4px 10px",fontWeight:800}}>+100pts</span>
              </div>
              <div style={{padding:"14px"}}>
                {golgheter && (
                  <div style={{display:"flex",alignItems:"center",gap:8,background:"#E8F0FF",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
                    <span style={{fontSize:16}}>⚽</span>
                    <span style={{flex:1,fontSize:13,fontWeight:700,color:NAVY}}>{golgheter}</span>
                    <button onClick={()=>setGolgheter(null)} style={{fontSize:12,color:"#aaa",background:"transparent",border:"none",cursor:"pointer"}}>✕</button>
                  </div>
                )}
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {GOALSCORERS.map(p=>(
                    <button key={p} onClick={()=>setGolgheter(golgheter===p?null:p)}
                      style={{padding:"7px 12px",borderRadius:9,border:"none",
                        background:golgheter===p?`linear-gradient(135deg,${NAVY},#001840)`:BG,
                        color:golgheter===p?"#fff":DARK,
                        boxShadow:golgheter===p?"0 3px 10px rgba(0,32,91,0.3)":SHADOW_OUT,
                        cursor:"pointer",fontSize:12,fontWeight:golgheter===p?700:400,transition:"all 0.15s"}}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <button style={{width:"100%",background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",border:"none",borderRadius:14,padding:"15px 0",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 20px rgba(0,32,91,0.3)",marginTop:4}}>
          💾 Salveaza Predictiile
        </button>
      </div>
    </div>
  );
}



function CircleTab({ label, name, isActive, onClick }) {
  return (
    <div onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",flexShrink:0}}>
      <div style={{width:46,height:46,borderRadius:"50%",background:isActive?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.08)",border:isActive?"2px solid rgba(255,255,255,0.7)":"2px solid rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,transition:"all 0.2s",boxShadow:isActive?"0 0 0 3px rgba(255,255,255,0.15)":"none"}}>
        {label}
      </div>
      <span style={{fontSize:9,color:isActive?"#fff":"rgba(255,255,255,0.45)",fontWeight:isActive?700:500,maxWidth:52,textAlign:"center",lineHeight:1.2}}>{name}</span>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeScreen({ onPredict, onLeaderboard, onBoards, myBoards }) {
  const [activeId, setActiveId] = useState("global");
  const leaders = BOARD_LEADERS[activeId]||BOARD_LEADERS.global;
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
      <div style={{flex:1,overflowY:"auto",padding:"14px 20px 0"}}>
        <CalendarSlider/>
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
        <div style={{display:"flex",flexDirection:"column",gap:10,paddingBottom:22}}>
          <button onClick={onPredict} style={{width:"100%",background:`linear-gradient(135deg,${RED},#EF3340 40%,${GREEN} 100%)`,color:"#fff",border:"none",borderRadius:14,padding:"15px 20px",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 6px 20px rgba(200,16,46,0.3)"}}>
            <span>🎯 Predictions</span><span style={{opacity:0.7}}>›</span>
          </button>

        </div>
      </div>
    </div>
  );
}

// ── BOARDS ────────────────────────────────────────────────────────────────────
function BoardsScreen({ onBack, myBoards, setMyBoards }) {
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [plan, setPlan] = useState(null);
  const joinBoard = b => { if(!myBoards.find(x=>x.id===b.id)) setMyBoards(p=>[...p,{...b}]); };
  const isJoined = id => myBoards.some(b=>b.id===id);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"16px 20px 22px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div>
            <p style={{fontSize:9,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA - WORLD CUP 2026</p>
            <h2 style={{fontSize:17,fontWeight:800,color:"#fff",margin:0}}>Boards</h2>
          </div>
        </div>
        <div style={{display:"flex",gap:12,overflowX:"auto",scrollbarWidth:"none"}}>
          {myBoards.map(b=>(
            <div key={b.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{b.label}</div>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.6)",fontWeight:600,maxWidth:54,textAlign:"center"}}>{b.isGlobal?"Global":b.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 24px"}}>
        {!creating?(
          <button onClick={()=>setCreating(true)} style={{width:"100%",background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",border:"none",borderRadius:14,padding:"15px 20px",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,boxShadow:"0 4px 16px rgba(0,32,91,0.25)"}}>
            <span>➕ Creeaza un Board nou</span><span style={{opacity:0.5}}>›</span>
          </button>
        ):(
          <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,padding:"16px",marginBottom:14}}>
            <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_IN,padding:"11px 14px",marginBottom:12}}>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Numele boardului..." style={{width:"100%",background:"transparent",border:"none",outline:"none",fontSize:14,color:DARK,fontWeight:600}}/>
            </div>
            {[{id:"free",title:"Free",price:"€0",sub:"Cu reclame"},{id:"premium",title:"Premium",price:"€10",sub:"Fara reclame",best:true}].map(p=>(
              <div key={p.id} onClick={()=>setPlan(p.id)} style={{background:BG,borderRadius:12,boxShadow:plan===p.id?SHADOW_IN:SHADOW_OUT,padding:"12px 14px",marginBottom:8,cursor:"pointer",border:plan===p.id?`2px solid ${NAVY}`:"2px solid transparent",position:"relative"}}>
                {p.best&&<div style={{position:"absolute",top:10,right:12,background:RED,color:"#fff",fontSize:9,fontWeight:800,borderRadius:5,padding:"2px 6px"}}>BEST</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><p style={{fontSize:14,fontWeight:700,color:DARK,margin:0}}>{p.title}</p><p style={{fontSize:11,color:"#aaa",margin:"2px 0 0"}}>{p.sub}</p></div>
                  <span style={{fontSize:16,fontWeight:800,color:DARK}}>{p.price}</span>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button onClick={()=>{setCreating(false);setNewName("");setPlan(null);}} style={{flex:1,background:BG,color:"#aaa",border:"none",borderRadius:12,padding:"12px 0",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:SHADOW_OUT}}>Anuleaza</button>
              <button disabled={!plan||!newName.trim()} style={{flex:2,background:plan&&newName.trim()?`linear-gradient(135deg,${NAVY},#001840)`:"#ccc",color:"#fff",border:"none",borderRadius:12,padding:"12px 0",fontSize:13,fontWeight:700,cursor:plan&&newName.trim()?"pointer":"default"}}>
                {plan==="premium"?"Continua →":"Creeaza →"}
              </button>
            </div>
          </div>
        )}
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
              <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0"}}>{b.members}{b.max?"/"+b.max:""} membri - {b.type==="private"?"Privat":"Public"}</p>
            </div>
            {isJoined(b.id)?(
              <div style={{background:"#E8F0FF",borderRadius:9,padding:"7px 12px",fontSize:11,fontWeight:700,color:NAVY}}>Inscris</div>
            ):(
              <button onClick={()=>joinBoard(b)} style={{background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",border:"none",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 10px rgba(0,32,91,0.3)"}}>Join</button>
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
    {key:SCREENS.HOME,icon:"🏠",label:T[lang].footerHome},
    {key:SCREENS.STATS,icon:"📊",label:T[lang].footerStats},
    {key:SCREENS.FAST_PREDICTION,icon:"⚡",label:T[lang].footerFast,accent:true},
    {key:SCREENS.ACCOUNT,icon:"👤",label:T[lang].footerAccount},
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
                <span style={{fontSize:10,fontWeight:isActive?700:500,color:isActive?NAVY:"#aaa",letterSpacing:0.3}}>{tab.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

function NavBanner({ title, subtitle, onBack }) {
  return (
    <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"16px 20px 20px",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:subtitle?8:0}}>
        <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:10,color:RED,margin:0,letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA</p>
          <span style={{fontSize:16,fontWeight:800,color:"#fff"}}>{title}</span>
        </div>
        <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff"}}>🔔</div>
      </div>
      {subtitle&&<p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:0,textAlign:"center"}}>{subtitle}</p>}
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
  const {d,h,m,s}=useCountdown();
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",background:"#fff"}}>
      <div style={{position:"absolute",width:"100%",height:"100%",background:"linear-gradient(180deg,rgba(0,32,91,0.04) 0%,rgba(200,16,46,0.07) 100%)",zIndex:0,pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 22px 0",position:"relative",zIndex:10}}>
        <div style={{width:44}}/>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:10,color:"#C8102E",margin:"0 0 2px",letterSpacing:3,textTransform:"uppercase",fontWeight:800}}>FIFA</p>
          <h1 style={{fontSize:20,fontWeight:900,color:"#00205B",margin:0}}>WORLD CUP 2026</h1>
          <p style={{fontSize:11,color:"#888",margin:"3px 0 0"}}>{T[lang].location}</p>
        </div>
        <LangSelector lang={lang} setLang={setLang}/>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:90,position:"relative",zIndex:1}}>🏆</div>
      <div style={{margin:"0 20px 14px",background:"rgba(0,32,91,0.6)",borderRadius:20,padding:"16px 8px 12px",display:"flex",position:"relative",zIndex:10}}>
        {[{v:d,l:"days"},{v:h,l:"hours"},{v:m,l:"minutes"},{v:s,l:"seconds"}].map(({v,l},i)=>(
          <div key={l} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
            <span style={{fontSize:30,fontWeight:800,color:"#fff",lineHeight:1}}>{String(v).padStart(2,"0")}</span>
            {i<3&&<span style={{position:"absolute",right:-2,top:2,fontSize:20,color:"rgba(255,255,255,0.25)"}}>:</span>}
            <span style={{fontSize:8,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1.5,marginTop:6}}>{T[lang][l]||l}</span>
          </div>
        ))}
      </div>
      <div style={{padding:"0 20px 32px",position:"relative",zIndex:10}}>
        <button onClick={onNext} style={{width:"100%",background:"linear-gradient(135deg,#C8102E 0%,#EF3340 50%,#009A44 100%)",color:"#fff",border:"none",borderRadius:16,padding:"17px 0",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 24px rgba(0,32,91,0.3)"}}>{T[lang].cta}</button>
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
        <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",textAlign:"center",margin:0}}>We only use your name and profile photo.</p>
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
  const [tab,setTab]=useState("global");
  const leaders=BOARD_LEADERS[tab]||BOARD_LEADERS.global;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
      <NavBanner title="Clasament" subtitle="All time standings" onBack={onBack}/>
      <div style={{display:"flex",gap:6,padding:"12px 16px 8px",overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
        {[{id:"global",label:"🌍 Global"},{id:"fc-prieteni",label:"⚽ FC Prieteni"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,padding:"7px 14px",borderRadius:10,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",background:tab===t.id?`linear-gradient(135deg,${NAVY},#001840)`:BG,color:tab===t.id?"#fff":"#888",boxShadow:tab===t.id?"0 4px 12px rgba(0,32,91,0.3)":SHADOW_OUT}}>{t.label}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"6px 20px"}}>
        {leaders.map(u=>(
          <div key={u.rank} style={{display:"flex",alignItems:"center",background:u.isMe?"#E8F0FF":u.accent||BG,borderRadius:14,padding:"11px 14px",gap:10,marginBottom:8,boxShadow:u.isMe?`0 0 0 2px ${NAVY},${SHADOW_OUT}`:SHADOW_OUT}}>
            <span style={{fontSize:u.emoji?22:13,fontWeight:700,color:u.isMe?NAVY:"#aaa",width:28,textAlign:"center"}}>{u.emoji||`#${u.rank}`}</span>
            <div style={{flex:1}}>
              <span style={{fontSize:14,fontWeight:700,color:u.isMe?NAVY:DARK}}>{u.name}</span>
              {u.prize&&<span style={{fontSize:11,color:"#D4820A",fontWeight:600,marginLeft:8}}>eMAG {u.prize}</span>}
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
      <h2 style={{fontSize:26,fontWeight:800,color:DARK,margin:"0 0 8px"}}>All done!</h2>
      <p style={{fontSize:15,color:"#aaa",textAlign:"center",margin:"0 0 30px"}}>Fast predictions saved!</p>
      <button onClick={onHome} style={{width:"100%",background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",border:"none",borderRadius:16,padding:"16px 0",fontSize:16,fontWeight:700,cursor:"pointer"}}>Back to Home</button>
    </div>
  );
  const card=cards[idx];
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"16px 20px 20px",textAlign:"center"}}>
        <p style={{fontSize:10,color:RED,margin:0,letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA - FAST PICK</p>
        <span style={{fontSize:16,fontWeight:800,color:"#fff"}}>Today's Matches</span>
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
      <div style={{margin:"14px 20px 0",height:4,borderRadius:2,background:BG,boxShadow:SHADOW_IN}}>
        <div style={{height:"100%",width:((idx+1)/cards.length*100)+"%",background:`linear-gradient(90deg,${NAVY},${RED})`,borderRadius:2,transition:"width 0.4s"}}/>
      </div>
      <p style={{textAlign:"center",fontSize:13,color:"#bbb",margin:"8px 0"}}>{idx+1} / {cards.length}</p>
    </div>
  );
}

function StatsScreen({ lang }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflowY:"auto"}}>
      <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"20px 20px 22px"}}>
        <p style={{fontSize:10,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>FIFA</p>
        <h2 style={{fontSize:21,fontWeight:800,color:"#fff",margin:0}}>{T[lang].footerStats}</h2>
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          {[{label:"Predictii",val:"24",icon:"🎯"},{label:"Corecte",val:"14",icon:"✅"},{label:"Acuratete",val:"58%",icon:"📈"}].map(s=>(
            <div key={s.label} style={{flex:1,background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"12px 10px",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:18,fontWeight:800,color:NAVY}}>{s.val}</div>
              <div style={{fontSize:10,color:"#aaa",fontWeight:600}}>{s.label}</div>
            </div>
          ))}
        </div>
        {[{label:"Scor exact",correct:3,total:24,color:GREEN},{label:"Rezultat corect",correct:11,total:24,color:NAVY},{label:"Gresit",correct:10,total:24,color:RED}].map(row=>(
          <div key={row.label} style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"12px 16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
              <span style={{fontSize:13,fontWeight:600,color:DARK}}>{row.label}</span>
              <span style={{fontSize:13,fontWeight:800,color:row.color}}>{row.correct}/{row.total}</span>
            </div>
            <div style={{height:5,borderRadius:3,background:"rgba(0,0,0,0.08)"}}>
              <div style={{height:"100%",width:(row.correct/row.total*100)+"%",background:row.color,borderRadius:3}}/>
            </div>
          </div>
        ))}
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

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [lang, setLang] = useState("en");
  const [myBoards, setMyBoards] = useState(INITIAL_BOARDS);

  const noFooter = [SCREENS.SPLASH, SCREENS.LOGIN, SCREENS.PREDICTIONS];
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
          {screen===SCREENS.HOME&&<HomeScreen onPredict={()=>setScreen(SCREENS.PREDICTIONS)} onLeaderboard={()=>setScreen(SCREENS.LEADERBOARD)} onBoards={()=>setScreen(SCREENS.BOARDS)} myBoards={myBoards}/>}
          {screen===SCREENS.BOARDS&&<BoardsScreen onBack={()=>setScreen(SCREENS.HOME)} myBoards={myBoards} setMyBoards={setMyBoards}/>}
          {screen===SCREENS.LEADERBOARD&&<LeaderboardScreen onBack={()=>setScreen(SCREENS.HOME)}/>}
          {screen===SCREENS.PREDICTIONS&&<PredictionsScreen onBack={()=>setScreen(SCREENS.HOME)}/>}
          {screen===SCREENS.FAST_PREDICTION&&<FastPredictionScreen onHome={()=>setScreen(SCREENS.HOME)}/>}
          {screen===SCREENS.STATS&&<StatsScreen lang={lang}/>}
          {screen===SCREENS.ACCOUNT&&<AccountScreen lang={lang}/>}
        </div>
        {showFooter&&<Footer active={footerActive} onNavigate={setScreen} lang={lang}/>}
      </div>
    </div>
  );
}