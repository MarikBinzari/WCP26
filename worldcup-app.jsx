import { useState, useEffect } from "react";
import trophy from "./assets/hands-trophy.png";

const BG = "#EBEBEB";
const SHADOW_OUT = "6px 6px 14px #c8c8c8, -4px -4px 10px #ffffff";
const SHADOW_IN = "inset 4px 4px 10px #c8c8c8, inset -3px -3px 8px #ffffff";
const SHADOW_BTN_DARK = "4px 4px 10px #b0b0b0, -2px -2px 6px #ffffff";
const DARK = "#3D3D3D";
const DARK_BTN = "#4A4A4A";

const SCREENS = {
  SPLASH: "splash", LOGIN: "login", HOME: "home",
  GLOBAL_GROUP: "global_group", PREDICTIONS: "predictions",
  DASHBOARD: "dashboard", FAST_PREDICTION: "fast_prediction",
  BRACKET: "bracket", GROUPS_LIST: "groups_list", CREATE_GROUP: "create_group",
};

const matchesToPredict = [
  { id: 1, home: "Brazil", homeFlag: "🇧🇷", away: "France", awayFlag: "🇫🇷", stage: "Group A" },
  { id: 2, home: "Argentina", homeFlag: "🇦🇷", away: "England", awayFlag: "🏴󠁧󠁢󠁥󠁧󠁿", stage: "Group B" },
  { id: 3, home: "Spain", homeFlag: "🇪🇸", away: "Portugal", awayFlag: "🇵🇹", stage: "Group C" },
  { id: 4, home: "Germany", homeFlag: "🇩🇪", away: "Netherlands", awayFlag: "🇳🇱", stage: "Group D" },
];

function useCountdown() {
  const target = new Date("2026-06-11T18:00:00");
  const [diff, setDiff] = useState(target - new Date());
  useEffect(() => {
    const t = setInterval(() => setDiff(target - new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function NavBar({ title, onBack, rightIcon = "🔔" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 10px", background: BG, flexShrink: 0 }}>
      <div onClick={onBack} style={{ width: 38, height: 38, borderRadius: 11, background: BG, boxShadow: SHADOW_OUT, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, color: DARK, userSelect: "none" }}>‹</div>
      <span style={{ fontSize: 17, fontWeight: 700, color: DARK }}>{title}</span>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: BG, boxShadow: SHADOW_OUT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{rightIcon}</div>
    </div>
  );
}

function NeuBtn({ label, dark, onClick }) {
  return (
    <button onClick={onClick} style={{ width: "100%", background: dark ? DARK_BTN : BG, color: dark ? "#fff" : DARK, border: "none", borderRadius: 14, padding: "15px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: dark ? SHADOW_BTN_DARK : SHADOW_OUT, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <span>{label}</span>
      <span style={{ color: dark ? "rgba(255,255,255,0.4)" : "#bbb" }}>›</span>
    </button>
  );
}

// ── TRANSLATIONS ─────────────────────────────────────────────────────────────
const LANGS = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "ro", flag: "🇷🇴", name: "Română" },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "ru", flag: "🇷🇺", name: "Русский" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
];

const T = {
  en: { title: "World Cup 2026", location: "USA, Canada & Mexico", cta: "Make Your Prediction", days: "DAYS", hours: "HOURS", minutes: "MINUTES", seconds: "SECONDS", dashboard: "My Dashboard", topPlayers: "Top Players", groups: "Groups", globalGroup: "Global Group", globalMeta: "members · Free · Prizes included", otherGroups: "Other Groups", otherMeta: "Join a private group or create your own", myGroups: "My Groups", bracket: "Bracket & Live Scores", afternoon: "Good afternoon 👋" },
  ro: { title: "Cupa Mondială 2026", location: "SUA, Canada & Mexic", cta: "Fă-ți Predicția", days: "ZILE", hours: "ORE", minutes: "MIN", seconds: "SEC", dashboard: "Dashboard-ul Meu", topPlayers: "Top Jucători", groups: "Grupuri", globalGroup: "Grup Global", globalMeta: "membri · Gratuit · Premii incluse", otherGroups: "Alte Grupuri", otherMeta: "Alătură-te sau creează un grup", myGroups: "Grupurile Mele", bracket: "Tablou & Scoruri Live", afternoon: "Bună ziua 👋" },
  fr: { title: "Coupe du Monde 2026", location: "USA, Canada & Mexique", cta: "Faites vos Pronostics", days: "JOURS", hours: "HEURES", minutes: "MIN", seconds: "SEC", dashboard: "Mon Tableau de Bord", topPlayers: "Meilleurs Joueurs", groups: "Groupes", globalGroup: "Groupe Global", globalMeta: "membres · Gratuit · Prix inclus", otherGroups: "Autres Groupes", otherMeta: "Rejoignez ou créez un groupe", myGroups: "Mes Groupes", bracket: "Tableau & Scores Live", afternoon: "Bonjour 👋" },
  ru: { title: "Чемпионат Мира 2026", location: "США, Канада и Мексика", cta: "Сделать Прогноз", days: "ДНИ", hours: "ЧАСЫ", minutes: "МИН", seconds: "СЕК", dashboard: "Мой Дашборд", topPlayers: "Топ Игроки", groups: "Группы", globalGroup: "Глобальная Группа", globalMeta: "участников · Бесплатно · Призы", otherGroups: "Другие Группы", otherMeta: "Вступить или создать группу", myGroups: "Мои Группы", bracket: "Сетка и Счета", afternoon: "Добрый день 👋" },
  it: { title: "Coppa del Mondo 2026", location: "USA, Canada & Messico", cta: "Fai il tuo Pronostico", days: "GIORNI", hours: "ORE", minutes: "MIN", seconds: "SEC", dashboard: "La Mia Dashboard", topPlayers: "Top Giocatori", groups: "Gruppi", globalGroup: "Gruppo Globale", globalMeta: "membri · Gratuito · Premi inclusi", otherGroups: "Altri Gruppi", otherMeta: "Unisciti o crea un gruppo", myGroups: "I Miei Gruppi", bracket: "Tabellone & Punteggi Live", afternoon: "Buon pomeriggio 👋" },
};

// ── LANGUAGE SELECTOR ────────────────────────────────────────────────────────
function LangSelector({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.code === lang);
  return (
    <div style={{ position: "relative", zIndex: 100 }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ width: 44, height: 44, borderRadius: 12, background: "#F0F4FF", border: "1px solid rgba(0,32,91,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer", userSelect: "none" }}>
        {current.flag}
      </div>
      {open && (
        <div style={{ position: "absolute", top: 52, right: 0, background: "#fff", border: "1px solid rgba(0,32,91,0.1)", borderRadius: 14, overflow: "hidden", minWidth: 160, zIndex: 200, boxShadow: "0 12px 40px rgba(0,32,91,0.15)" }}>
          {LANGS.map(l => (
            <div key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: lang === l.code ? "#F0F4FF" : "transparent", cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: 20 }}>{l.flag}</span>
              <span style={{ fontSize: 14, fontWeight: lang === l.code ? 700 : 400, color: lang === l.code ? "#00205B" : "#555" }}>{l.name}</span>
              {lang === l.code && <span style={{ marginLeft: "auto", fontSize: 12, color: "#C8102E" }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SPLASH ───────────────────────────────────────────────────────────────────
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

// ── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onNext }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, alignItems: "center", justifyContent: "center", padding: "0 24px 36px" }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: BG, boxShadow: SHADOW_OUT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, marginBottom: 22 }}>🏆</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: "0 0 8px", textAlign: "center" }}>Join the Game</h2>
      <p style={{ fontSize: 14, color: "#999", textAlign: "center", margin: "0 0 30px" }}>We only use your name & profile photo.</p>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { icon: "G", label: "Continue with Google", dark: false },
          { icon: "f", label: "Continue with Facebook", dark: true, bg: "#1877F2" },
          { icon: "📷", label: "Continue with Instagram", dark: true, bg: "#E1306C" },
        ].map(({ icon, label, dark, bg }) => (
          <button key={label} onClick={onNext}
            style={{ width: "100%", background: dark ? bg : BG, color: dark ? "#fff" : DARK, border: "none", borderRadius: 14, padding: "14px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: dark ? SHADOW_BTN_DARK : SHADOW_OUT }}>
            <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 18, fontSize: 12, color: "#bbb", textAlign: "center" }}>Username and profile picture only.</p>
    </div>
  );
}

// ── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ onGlobalGroup, onGroupsList, onMyGroups, onBracket, lang }) {
  const leaders = [
    { rank: 1, name: "Alex", pts: 342, prize: "250 lei", emoji: "🥇", accent: "#FFF3DC" },
    { rank: 2, name: "Maria", pts: 318, prize: "150 lei", emoji: "🥈", accent: BG },
    { rank: 3, name: "David", pts: 295, prize: "100 lei", emoji: "🥉", accent: "#F5EDE0" },
    { rank: 4, name: "Andreea V.", pts: 271, emoji: null, accent: BG },
    { rank: 5, name: "Bogdan C.", pts: 248, emoji: null, accent: BG },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 14px" }}>
        <div>
          <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>{T[lang].afternoon}</p>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: DARK, margin: "4px 0 0" }}>{T[lang].dashboard}</h2>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: BG, boxShadow: SHADOW_OUT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔔</div>
      </div>

      {/* Top Players — compact, no border radius on rows */}
      <p style={{ fontSize: 14, fontWeight: 700, color: DARK, margin: "0 20px 8px" }}>{T[lang].topPlayers}</p>
      <div style={{ margin: "0 20px 14px", background: BG, borderRadius: 16, boxShadow: SHADOW_OUT, overflow: "hidden" }}>
        {leaders.map((u, i) => (
          <div key={u.rank} style={{
            display: "flex", alignItems: "center",
            background: u.accent,
            padding: "9px 14px",
            gap: 10,
            borderBottom: i < leaders.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
          }}>
            <span style={{ fontSize: u.emoji ? 22 : 13, fontWeight: 700, color: "#aaa", width: 28, textAlign: "center" }}>{u.emoji || `#${u.rank}`}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{u.name}</span>
              {u.prize && <span style={{ fontSize: 11, color: "#D4820A", fontWeight: 600, marginLeft: 8 }}>eMAG {u.prize}</span>}
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{u.pts} pts</span>
          </div>
        ))}
      </div>

      {/* My Score */}
      <div style={{ margin: "0 20px 14px", background: BG, borderRadius: 14, boxShadow: SHADOW_OUT, padding: "12px 16px" }}>
        <p style={{ margin: "0 0 5px", fontSize: 13, color: "#888" }}>⊖ My Score: <b style={{ color: DARK }}>320 pts</b></p>
        <p style={{ margin: 0, fontSize: 13, color: "#888" }}>🌐 Friends Group: <b style={{ color: DARK }}>280 pts</b></p>
      </div>

      {/* Groups section */}
      <p style={{ fontSize: 14, fontWeight: 700, color: DARK, margin: "0 20px 8px" }}>{T[lang].groups}</p>
      <div style={{ padding: "0 20px" }}>
        {/* Global Group */}
        <button onClick={onGlobalGroup} style={{ width: "100%", background: DARK_BTN, color: "#fff", border: "none", borderRadius: 14, padding: "15px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW_BTN_DARK, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ textAlign: "left" }}>
            <div>🌍 {T[lang].globalGroup}</div>
            <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.6, marginTop: 2 }}>48,291 {T[lang].globalMeta}</div>
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 20 }}>›</span>
        </button>

        {/* Other Groups */}
        <button onClick={onGroupsList} style={{ width: "100%", background: BG, color: DARK, border: "none", borderRadius: 14, padding: "15px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW_OUT, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ textAlign: "left" }}>
            <div>👥 {T[lang].otherGroups}</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: "#aaa", marginTop: 2 }}>{T[lang].otherMeta}</div>
          </div>
          <span style={{ color: "#bbb", fontSize: 20 }}>›</span>
        </button>

        {/* My Groups & Bracket */}
        <NeuBtn label={`📋 ${T[lang].myGroups}`} dark={false} onClick={onMyGroups} />
        <NeuBtn label={`🏆 ${T[lang].bracket}`} dark={false} onClick={onBracket} />
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

// ── GROUPS LIST ───────────────────────────────────────────────────────────────
function GroupsListScreen({ onBack, onCreateGroup }) {
  const groups = [
    { name: "FC Prieteni 2026", members: 8, max: 10, type: "private", code: "FCP26" },
    { name: "Birou Fotbal", members: 6, max: 10, type: "private", code: "BF001" },
    { name: "România Bate!", members: 10, max: null, type: "public", code: "ROM26" },
    { name: "Grupul Lui Marius", members: 4, max: 10, type: "private", code: "GLM99" },
    { name: "Tata & Fii", members: 3, max: 10, type: "private", code: "TAF26" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <NavBar title="Groups" onBack={onBack} />

      {/* Create group CTA */}
      <div style={{ padding: "4px 20px 16px" }}>
        <button onClick={onCreateGroup}
          style={{ width: "100%", background: DARK_BTN, color: "#fff", border: "none", borderRadius: 14, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW_BTN_DARK, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>➕ Create Your Own Group</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
        </button>
      </div>

      {/* Join by code */}
      <div style={{ margin: "0 20px 16px", background: BG, borderRadius: 14, boxShadow: SHADOW_IN, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
        <input placeholder="Enter group code..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: DARK }} />
        <button style={{ background: DARK_BTN, color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Join</button>
      </div>

      {/* List */}
      <p style={{ fontSize: 13, fontWeight: 700, color: "#aaa", margin: "0 20px 10px", textTransform: "uppercase", letterSpacing: 1 }}>Available Groups</p>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        {groups.map(g => (
          <div key={g.code} style={{ background: BG, borderRadius: 14, boxShadow: SHADOW_OUT, padding: "13px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: BG, boxShadow: SHADOW_IN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {g.type === "private" ? "🔒" : "🌐"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: DARK, margin: 0 }}>{g.name}</p>
              <p style={{ fontSize: 12, color: "#aaa", margin: "2px 0 0" }}>
                {g.members}{g.max ? `/${g.max}` : ""} members · {g.type === "private" ? "Private" : "Public"}
              </p>
            </div>
            <button style={{ background: DARK_BTN, color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW_BTN_DARK }}>
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CREATE GROUP ──────────────────────────────────────────────────────────────
function CreateGroupScreen({ onBack }) {
  const [plan, setPlan] = useState(null);
  const [name, setName] = useState("");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <NavBar title="Create Group" onBack={onBack} />

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 28px" }}>
        {/* Group name */}
        <p style={{ fontSize: 13, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>Group Name</p>
        <div style={{ background: BG, borderRadius: 14, boxShadow: SHADOW_IN, padding: "13px 16px", marginBottom: 20 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Birou Fotbal 2026"
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 15, color: DARK, fontWeight: 600 }}
          />
        </div>

        {/* Plan selection */}
        <p style={{ fontSize: 13, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>Choose Plan</p>

        {/* Free plan */}
        <div onClick={() => setPlan("free")}
          style={{ background: BG, borderRadius: 16, boxShadow: plan === "free" ? SHADOW_IN : SHADOW_OUT, padding: "16px 18px", marginBottom: 12, cursor: "pointer", border: plan === "free" ? `2px solid ${DARK}` : "2px solid transparent", transition: "all 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: 0 }}>Free</p>
              <p style={{ fontSize: 12, color: "#aaa", margin: "2px 0 0" }}>With ads</p>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: DARK }}>€0</span>
          </div>
          {[
            { icon: "👥", text: "Max 10 members" },
            { icon: "📢", text: "Ads shown to all members" },
            { icon: "📊", text: "Basic stats" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ fontSize: 13, color: "#777" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Premium plan */}
        <div onClick={() => setPlan("premium")}
          style={{ background: BG, borderRadius: 16, boxShadow: plan === "premium" ? SHADOW_IN : SHADOW_OUT, padding: "16px 18px", marginBottom: 20, cursor: "pointer", border: plan === "premium" ? `2px solid ${DARK}` : "2px solid transparent", transition: "all 0.2s", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 12, right: 14, background: DARK_BTN, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 8px", letterSpacing: 0.5 }}>BEST</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: 0 }}>Premium</p>
              <p style={{ fontSize: 12, color: "#aaa", margin: "2px 0 0" }}>No ads · One-time payment</p>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: DARK }}>€10</span>
          </div>
          {[
            { icon: "♾️", text: "Unlimited members" },
            { icon: "🚫", text: "No ads for anyone in the group" },
            { icon: "📊", text: "Full stats & predictions history" },
            { icon: "⭐", text: "Premium badge on leaderboard" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ fontSize: 13, color: "#777" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          disabled={!plan || !name.trim()}
          style={{ width: "100%", background: plan && name.trim() ? DARK_BTN : "#ccc", color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: plan && name.trim() ? "pointer" : "default", boxShadow: plan && name.trim() ? SHADOW_BTN_DARK : "none", transition: "all 0.3s" }}>
          {plan === "premium" ? "Continue to Payment →" : plan === "free" ? "Create Group →" : "Select a Plan"}
        </button>
      </div>
    </div>
  );
}

// ── GLOBAL GROUP ─────────────────────────────────────────────────────────────
function GlobalGroupScreen({ onPredict, onBack }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <NavBar title="World Cup 2026" onBack={onBack} />
      <div style={{ padding: "8px 20px 16px" }}>
        <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 4px" }}>🌍 48,291 participants worldwide</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: DARK, margin: "0 0 6px" }}>Make your predictions</h2>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Predict from Group Stage to the Final.</p>
      </div>
      <div style={{ flex: 1, padding: "0 20px", overflowY: "auto" }}>
        {["Group Stage", "Round of 16", "Quarter-Finals", "Semi-Finals", "Final"].map((stage, i) => (
          <div key={stage} onClick={i === 0 ? onPredict : undefined}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: BG, borderRadius: 14, padding: "14px 18px", marginBottom: 10, boxShadow: SHADOW_OUT, opacity: i === 0 ? 1 : 0.45, cursor: i === 0 ? "pointer" : "default" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? DARK : "#ccc" }} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: DARK, margin: 0 }}>{stage}</p>
                <p style={{ fontSize: 12, color: "#aaa", margin: "2px 0 0" }}>{i === 0 ? "48 matches · Open now" : "Unlocks after previous stage"}</p>
              </div>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? DARK : "#ccc" }}>{i === 0 ? "›" : "🔒"}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 28px" }}>
        <button onClick={onPredict} style={{ width: "100%", background: DARK_BTN, color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW_BTN_DARK }}>
          Start Group Stage →
        </button>
      </div>
    </div>
  );
}

// ── PREDICTIONS ──────────────────────────────────────────────────────────────
function PredictionsScreen({ onDone, onBack }) {
  const [current, setCurrent] = useState(0);
  const [preds, setPreds] = useState({});
  const match = matchesToPredict[current];
  const pred = preds[match.id] || {};
  const setScore = (side, val) => setPreds(p => ({ ...p, [match.id]: { ...p[match.id], [side]: val } }));
  const setWinner = w => setPreds(p => ({ ...p, [match.id]: { ...p[match.id], winner: w } }));
  const next = () => current < matchesToPredict.length - 1 ? setCurrent(c => c + 1) : onDone();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <NavBar title={`Group Stage · ${current + 1}/${matchesToPredict.length}`} onBack={onBack} />
      <div style={{ margin: "0 20px 16px", height: 6, borderRadius: 3, background: BG, boxShadow: SHADOW_IN }}>
        <div style={{ height: "100%", width: `${((current + 1) / matchesToPredict.length) * 100}%`, background: DARK, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
      <div style={{ margin: "0 20px 16px", background: BG, borderRadius: 22, boxShadow: SHADOW_OUT, padding: "22px 16px" }}>
        <p style={{ fontSize: 10, color: "#bbb", textAlign: "center", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 2 }}>{match.stage}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 46 }}>{match.homeFlag}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{match.home}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="number" min="0" max="20" placeholder="0" value={pred.home ?? ""}
              onChange={e => setScore("home", e.target.value)}
              style={{ width: 52, height: 52, borderRadius: 12, border: "none", background: BG, boxShadow: SHADOW_IN, fontSize: 22, fontWeight: 700, textAlign: "center", color: DARK, outline: "none" }} />
            <span style={{ fontSize: 18, color: "#ccc" }}>–</span>
            <input type="number" min="0" max="20" placeholder="0" value={pred.away ?? ""}
              onChange={e => setScore("away", e.target.value)}
              style={{ width: 52, height: 52, borderRadius: 12, border: "none", background: BG, boxShadow: SHADOW_IN, fontSize: 22, fontWeight: 700, textAlign: "center", color: DARK, outline: "none" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 46 }}>{match.awayFlag}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{match.away}</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", margin: "0 0 10px" }}>Or select winner:</p>
        <div style={{ display: "flex", gap: 8 }}>
          {[match.home, "Draw", match.away].map(opt => (
            <button key={opt} onClick={() => setWinner(opt)}
              style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: pred.winner === opt ? DARK_BTN : BG, color: pred.winner === opt ? "#fff" : DARK, boxShadow: pred.winner === opt ? SHADOW_BTN_DARK : SHADOW_OUT, transition: "all 0.2s" }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <button onClick={next} style={{ width: "100%", background: DARK_BTN, color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW_BTN_DARK }}>
          {current < matchesToPredict.length - 1 ? "Next Match →" : "Finish ✓"}
        </button>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardScreen({ onFastPred, onBack }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <NavBar title="My Dashboard" onBack={onBack} />
      <div style={{ padding: "6px 20px 16px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: DARK, margin: "0 0 4px" }}>Predictions saved ✓</h2>
        <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>Update anytime before kickoff.</p>
      </div>
      <div style={{ padding: "0 20px" }}>
        <NeuBtn label="👁  View My Predictions" dark={false} onClick={() => {}} />
        <NeuBtn label="⚡  Daily Exact Prediction" dark onClick={onFastPred} />
        <NeuBtn label="📊  Live Scores" dark={false} onClick={() => {}} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: "8px 20px 10px" }}>🔴 Live Now</p>
      {[
        { match: "Brazil 🇧🇷 vs 🇫🇷 France", score: "2–1", status: "FT" },
        { match: "Spain 🇪🇸 vs 🇵🇹 Portugal", score: "1–1", status: "75'" },
      ].map(m => (
        <div key={m.match} style={{ display: "flex", alignItems: "center", background: BG, borderRadius: 14, padding: "13px 16px", margin: "0 20px 8px", boxShadow: SHADOW_OUT, gap: 10 }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: DARK }}>{m.match}</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: DARK }}>{m.score}</span>
          <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 7, padding: "3px 9px", background: m.status === "FT" ? "#DCF0DC" : "#FFF0DC", color: m.status === "FT" ? "#2A7A2A" : "#C06000" }}>{m.status}</span>
        </div>
      ))}
    </div>
  );
}

// ── BRACKET ──────────────────────────────────────────────────────────────────
function BracketScreen({ onBack }) {
  const [tab, setTab] = useState(0);
  const tabs = ["Groups", "Round of 16", "Quarter Finals", "Semi-Finals", "Final"];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <NavBar title="World Cup 2026" onBack={onBack} />
      <div style={{ display: "flex", overflowX: "auto", padding: "0 20px 14px", gap: 8, scrollbarWidth: "none" }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: tab === i ? DARK_BTN : BG, color: tab === i ? "#fff" : "#888", boxShadow: tab === i ? SHADOW_BTN_DARK : SHADOW_OUT, transition: "all 0.2s" }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, padding: "0 20px", overflowY: "auto" }}>
        {tab === 0 ? (
          ["A", "B", "C", "D"].map(g => (
            <div key={g} style={{ background: BG, borderRadius: 16, boxShadow: SHADOW_OUT, padding: "14px 16px", marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#bbb", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Group {g}</p>
              {[["🇧🇷 Brazil", 6], ["🇫🇷 France", 4], ["🏴󠁧󠁢󠁥󠁧󠁿 England", 3], ["🇦🇷 Argentina", 1]].map(([team, pts], i) => (
                <div key={team} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 3 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                  <span style={{ fontSize: 14, color: DARK }}>{team}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{pts} pts</span>
                </div>
              ))}
            </div>
          ))
        ) : (
          [["🇧🇷 Brazil", "🇫🇷 France"], ["🇦🇷 Argentina", "🏴󠁧󠁢󠁥󠁧󠁿 England"], ["🇪🇸 Spain", "🇵🇹 Portugal"], ["🇩🇪 Germany", "🇳🇱 Netherlands"]].map(([t1, t2], i) => (
            <div key={i} style={{ background: BG, borderRadius: 14, boxShadow: SHADOW_OUT, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: DARK }}>{t1}</span>
                <div style={{ background: BG, borderRadius: 8, padding: "5px 10px", boxShadow: SHADOW_IN }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#bbb" }}>VS</span>
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: DARK, textAlign: "right" }}>{t2}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ padding: "12px 20px 28px", display: "flex", gap: 10 }}>
        <button style={{ flex: 1, background: DARK_BTN, color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW_BTN_DARK }}>Group Stage</button>
        <button style={{ flex: 1, background: BG, color: DARK, border: "none", borderRadius: 12, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW_OUT }}>Final</button>
      </div>
    </div>
  );
}

// ── FAST PREDICTION ──────────────────────────────────────────────────────────
function FastPredictionScreen({ onBack }) {
  const cards = [
    { home: "Brazil", homeFlag: "🇧🇷", away: "Portugal", awayFlag: "🇵🇹" },
    { home: "Spain", homeFlag: "🇪🇸", away: "Germany", awayFlag: "🇩🇪" },
    { home: "France", homeFlag: "🇫🇷", away: "England", awayFlag: "🏴󠁧󠁢󠁥󠁧󠁿" },
  ];
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);

  const pick = winner => {
    setChosen(winner);
    setTimeout(() => { setChosen(null); setIdx(i => i + 1); }, 650);
  };

  if (idx >= cards.length) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <NavBar title="Fast Prediction" onBack={onBack} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px" }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: BG, boxShadow: SHADOW_OUT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, marginBottom: 22 }}>⚡</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: DARK, margin: "0 0 8px" }}>All done!</h2>
        <p style={{ fontSize: 15, color: "#aaa", textAlign: "center", margin: "0 0 30px" }}>Fast predictions saved. Check back tomorrow!</p>
        <button onClick={onBack} style={{ width: "100%", background: DARK_BTN, color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW_BTN_DARK }}>Back to Home</button>
      </div>
    </div>
  );

  const card = cards[idx];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <NavBar title="⚡ Fast Prediction" onBack={onBack} />
      <p style={{ textAlign: "center", fontSize: 13, color: "#aaa", margin: "6px 0 14px" }}>Tap to predict the winner</p>
      <div style={{ margin: "0 20px 20px", background: BG, borderRadius: 24, boxShadow: chosen ? SHADOW_IN : SHADOW_OUT, padding: "36px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "box-shadow 0.2s" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 62 }}>{card.homeFlag}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{card.home}</span>
        </div>
        <div style={{ background: BG, borderRadius: 12, padding: "8px 12px", boxShadow: SHADOW_IN }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#bbb", letterSpacing: 2 }}>VS</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 62 }}>{card.awayFlag}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{card.away}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, margin: "0 20px" }}>
        {[card.home, "Draw", card.away].map((opt, i) => (
          <button key={opt} onClick={() => pick(opt)}
            style={{ flex: i === 1 ? 0.7 : 1, background: BG, color: DARK, border: "none", borderRadius: 14, padding: "14px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: chosen === opt ? SHADOW_IN : SHADOW_OUT, transition: "box-shadow 0.2s" }}>
            {i === 0 ? `← ${opt}` : i === 2 ? `${opt} →` : opt}
          </button>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 13, color: "#bbb", margin: "14px 0" }}>{idx + 1} / {cards.length} matches</p>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [lang, setLang] = useState("en");
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#D4D4D4", fontFamily: "-apple-system, 'SF Pro Display', sans-serif" }}>
      <div style={{ width: 390, height: 844, background: BG, borderRadius: 46, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.8)", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 24px 4px", fontSize: 13, fontWeight: 600, color: DARK, flexShrink: 0, background: BG }}>
          <span>9:41</span><span>●●● 5G 🔋</span>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {screen === SCREENS.SPLASH && <SplashScreen onNext={() => setScreen(SCREENS.LOGIN)} lang={lang} setLang={setLang} />}
          {screen === SCREENS.LOGIN && <LoginScreen onNext={() => setScreen(SCREENS.HOME)} />}
          {screen === SCREENS.HOME && <HomeScreen
            onGlobalGroup={() => setScreen(SCREENS.GLOBAL_GROUP)}
            onGroupsList={() => setScreen(SCREENS.GROUPS_LIST)}
            onMyGroups={() => setScreen(SCREENS.GROUPS_LIST)}
            onBracket={() => setScreen(SCREENS.BRACKET)}
            lang={lang}
          />}
          {screen === SCREENS.GROUPS_LIST && <GroupsListScreen onBack={() => setScreen(SCREENS.HOME)} onCreateGroup={() => setScreen(SCREENS.CREATE_GROUP)} />}
          {screen === SCREENS.CREATE_GROUP && <CreateGroupScreen onBack={() => setScreen(SCREENS.GROUPS_LIST)} />}
          {screen === SCREENS.GLOBAL_GROUP && <GlobalGroupScreen onPredict={() => setScreen(SCREENS.PREDICTIONS)} onBack={() => setScreen(SCREENS.HOME)} />}
          {screen === SCREENS.PREDICTIONS && <PredictionsScreen onDone={() => setScreen(SCREENS.DASHBOARD)} onBack={() => setScreen(SCREENS.GLOBAL_GROUP)} />}
          {screen === SCREENS.DASHBOARD && <DashboardScreen onFastPred={() => setScreen(SCREENS.FAST_PREDICTION)} onBack={() => setScreen(SCREENS.HOME)} />}
          {screen === SCREENS.BRACKET && <BracketScreen onBack={() => setScreen(SCREENS.HOME)} />}
          {screen === SCREENS.FAST_PREDICTION && <FastPredictionScreen onBack={() => setScreen(SCREENS.HOME)} />}
        </div>
        <div style={{ height: 30, background: BG, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 120, height: 4, borderRadius: 2, background: "#bbb" }} />
        </div>
      </div>
    </div>
  );
}