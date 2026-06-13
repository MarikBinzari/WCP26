import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import trophy from "./assets/hands-trophy.webp";
import trophyHQ from "./assets/hands-trophy-hq.webp";
import varBg from "./assets/var-bg.webp";
import predictoLogo from "./assets/predicto-logo.webp";
import stadiumBg from "./assets/u8hfqj9wqaqodrc48ppk.jpg";
import specialPickBadge from "./assets/special-pick-badge.webp";
import bellIcon from "./assets/bell-icon.svg";
import { ALL_GROUPS_DATA, FLAGS, TEAM_COLORS, CALENDAR_EVENTS, CL_FINAL } from "./data/worldcup2026.js";
import { supabase } from "./supabase.js";
import { savePredictions, saveExactScore, createBoard, updateBoard, joinBoardByCode, joinBoardById, ensureBoardScores, loadLeaderboard, loadMyScoreBreakdown, fetchScoringRules, fetchMemberCounts, removeBoardMember, removeParticipation, deleteBoard, loadBoardMembers, checkDbHealth, checkEmailExists, checkNicknameExists, loadLiveScores, subscribeLiveScores, loadPlayers, loadPlayersByTeam, seedPlayersFromApi, saveSpecialPick, uploadAvatar, uploadBoardImage, loadAllBoards, loadAllUserPicks, loadNotifReads, markNotifRead, loadSystemNotifications, loadRealGroupStandings, loadUserBreakdown, savePushSubscription, loadChatMessages, sendChatMessage, editChatMessage, toggleChatLike, toggleChatDislike, subscribeChatMessages } from "./db.js";

const TEAM_CODE = {"Mexico":"MEX","South Africa":"RSA","South Korea":"KOR","Czechia":"CZE","Canada":"CAN","Switzerland":"SUI","Qatar":"QAT","Bosnia-Herzegovina":"BIH","Brazil":"BRA","Morocco":"MAR","Scotland":"SCO","Haiti":"HAI","USA":"USA","Paraguay":"PAR","Australia":"AUS","Turkiye":"TUR","Germany":"GER","Ecuador":"ECU","Ivory Coast":"CIV","Curacao":"CUW","Netherlands":"NED","Japan":"JPN","Tunisia":"TUN","Sweden":"SWE","Belgium":"BEL","Iran":"IRI","Egypt":"EGY","New Zealand":"NZL","Spain":"ESP","Uruguay":"URU","Saudi Arabia":"KSA","Cape Verde":"CPV","France":"FRA","Senegal":"SEN","Norway":"NOR","Iraq":"IRQ","Argentina":"ARG","Austria":"AUT","Algeria":"ALG","Jordan":"JOR","Portugal":"POR","Colombia":"COL","Uzbekistan":"UZB","DR Congo":"COD","England":"ENG","Croatia":"CRO","Panama":"PAN","Ghana":"GHA"};

// "hcaptcha" | "emoji" | "none"
const CAPTCHA_PROVIDER = import.meta.env.VITE_CAPTCHA_PROVIDER ?? "hcaptcha";
const CAPTCHA_ENABLED = CAPTCHA_PROVIDER !== "none";
const IS_LOCALHOST = typeof window !== "undefined" && window.location.hostname === "localhost";

const BG = "#EEF2FF";
const SHADOW_OUT = "4px 4px 12px rgba(0,0,0,0.08), -3px -3px 8px #ffffff";
const SHADOW_IN = "inset 3px 3px 8px rgba(0,0,0,0.08), inset -2px -2px 6px #ffffff";
const DARK = "#3D3D3D";
const NAVY = "#0A2E8A";
const RED = "#C8102E";
const GREEN = "#009A44";

const isLiveScoreStatus = (status) => status === "LIVE" || status === "ET" || status === "PEN";
const liveScorePhaseLabel = (status, min) => {
  if (status === "ET") return min != null ? `ET ${min}'` : "ET";
  if (status === "PEN") return min != null ? `PEN ${min}'` : "PEN";
  return min != null ? `LIVE ${min}'` : "LIVE";
};
const hasPenaltyScore = (live) => live?.homePen != null && live?.awayPen != null;
const penaltyScoreLabel = (live) => hasPenaltyScore(live) ? `${live.homePen}-${live.awayPen} pen` : null;


const SCREENS = {
  SPLASH:"splash", LOGIN:"login", HOME:"home",
  BOARDS:"boards",
  INSTANT_PICK:"instant_pick",
  LEADERBOARD:"leaderboard", STATS:"stats", ACCOUNT:"account",
  GROUPS_SCHEDULE:"groups_schedule",
  RULES:"rules",
  RESET_PASSWORD:"reset_password",
  SET_PASSWORD:"set_password",
  NOTIFICATIONS:"notifications",
  PREMIUM:"premium",
  CHAMPION:"champion",
  BOOSTER:"booster",
  BONUS:"bonus",
};

const INITIAL_BOARDS = [{ id:"global", label:"🌍", name:"Global League", members:48291, isGlobal:true }];
const UI = {
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
    border: "1px solid rgba(10,46,138,0.06)",
    overflow: "hidden",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9CA3AF",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9CA3AF",
    margin: "0 0 8px",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputPanel: {
    background: "#F8FAFC",
    borderRadius: 12,
    padding: "10px 12px",
    display: "flex",
    gap: 8,
    alignItems: "center",
    border: "1px solid rgba(10,46,138,0.06)",
  },
  primaryButton: {
    background: `linear-gradient(135deg,${NAVY}cc,#001840cc)`,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 750,
    cursor: "pointer",
    flexShrink: 0,
  },
  ghostButton: {
    background: "rgba(10,46,138,0.07)",
    border: "1px solid rgba(10,46,138,0.08)",
    borderRadius: 10,
    padding: "7px 10px",
    fontSize: 11,
    fontWeight: 750,
    color: NAVY,
    cursor: "pointer",
  },
  dangerButton: {
    background: "rgba(200,16,46,0.08)",
    border: "1px solid rgba(200,16,46,0.08)",
    borderRadius: 10,
    padding: "7px 10px",
    fontSize: 11,
    fontWeight: 750,
    color: RED,
    cursor: "pointer",
  },
  emptyState: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
    border: "1px solid rgba(10,46,138,0.06)",
    padding: "28px 18px",
    textAlign: "center",
  },
};
function Card({ children, style, ...props }) {
  return <div style={{...UI.card,...style}} {...props}>{children}</div>;
}
function Button({ children, variant="primary", style, disabled=false, ...props }) {
  const base = variant==="ghost" ? UI.ghostButton : variant==="danger" ? UI.dangerButton : UI.primaryButton;
  return (
    <button
      disabled={disabled}
      style={{...base,opacity:disabled?0.55:base.opacity,cursor:disabled?"default":base.cursor,...style}}
      {...props}>
      {children}
    </button>
  );
}
function InputPanel({ children, style, ...props }) {
  return <div style={{...UI.inputPanel,...style}} {...props}>{children}</div>;
}
function EmptyState({ icon="•", title, body }) {
  return (
    <Card style={{...UI.emptyState}}>
      <div style={{fontSize:30,marginBottom:8}}>{icon}</div>
      <div style={{fontSize:13,fontWeight:750,color:DARK,marginBottom:body?4:0}}>{title}</div>
      {body&&<div style={{fontSize:12,color:"#9CA3AF",lineHeight:1.45}}>{body}</div>}
    </Card>
  );
}
function LoadingState({ title, body }) {
  const lang = useLang();
  const t = title ?? T[lang].loadingTitle;
  const b = body ?? T[lang].loadingSession;
  return (
    <div style={{position:"fixed",inset:0,background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:320,padding:"26px 18px",textAlign:"center"}}>
        <div style={{width:34,height:34,borderRadius:"50%",border:"3px solid rgba(10,46,138,0.12)",borderTopColor:NAVY,margin:"0 auto 12px",animation:"spin 0.9s linear infinite"}}/>
        <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:4}}>{t}</div>
        <div style={{fontSize:12,color:"#9CA3AF",lineHeight:1.45}}>{b}</div>
      </Card>
    </div>
  );
}
function ConfirmSheet({ icon, title, body, confirmLabel, onConfirm, onCancel, danger=true }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end"}} onClick={onCancel}>
      <div style={{width:"100%",background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 24px 40px"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:54,height:54,borderRadius:"50%",background:danger?"rgba(200,16,46,0.08)":"rgba(10,46,138,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px"}}>{icon}</div>
        <h3 style={{fontSize:17,fontWeight:850,color:DARK,textAlign:"center",margin:"0 0 10px"}}>{title}</h3>
        <p style={{fontSize:13,color:"#888",textAlign:"center",lineHeight:1.6,margin:"0 0 24px"}}>{body}</p>
        <button onClick={onConfirm} style={{width:"100%",background:danger?RED:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,color:"#fff",border:"none",borderRadius:14,padding:"14px 0",fontSize:15,fontWeight:750,cursor:"pointer",marginBottom:10}}>
          {confirmLabel}
        </button>
        <button onClick={onCancel}
          style={{width:"100%",background:"#fff",color:"#888",border:"1px solid rgba(10,46,138,0.08)",borderRadius:14,padding:"12px 0",fontSize:14,fontWeight:650,cursor:"pointer"}}>
          Cancel
        </button>
      </div>
    </div>
  );
}
function HeaderShell({ onBack, children, footer, fade=78 }) {
  return (
    <div style={{padding:"10px 14px 0",flexShrink:0,position:"relative",zIndex:2}}>
      <div style={{background:"rgba(255,255,255,0.32)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",borderRadius:26,boxShadow:"0 8px 32px rgba(10,46,138,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",border:"1px solid rgba(255,255,255,0.55)",padding:`12px 14px ${footer?0:4}px`,position:"relative",WebkitMaskImage:`linear-gradient(to bottom,black 0%,black ${fade}%,transparent 100%)`,maskImage:`linear-gradient(to bottom,black 0%,black ${fade}%,transparent 100%)`}}>
        <div style={{position:"absolute",inset:0,borderRadius:26,background:"linear-gradient(135deg,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0.08) 40%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0,paddingTop:10}}>
            {onBack ? (
              <button onClick={onBack} style={{width:44,height:44,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:22,color:"#374151",lineHeight:1}}>‹</span>
              </button>
            ) : <div style={{width:44,height:44}}/>}
            <p style={{fontSize:11,color:"transparent",margin:0,userSelect:"none"}}> </p>
          </div>
          <div style={{textAlign:"center"}}>
            <img src={predictoLogo} alt="Predicto" decoding="sync" style={{height:36,width:"auto",objectFit:"contain",display:"block",margin:"0 auto",position:"relative",left:3}}/>
            <h1 style={{fontSize:10,fontWeight:700,margin:"2px 0 0",letterSpacing:2.5,lineHeight:1,background:"linear-gradient(100deg,#CC0022 0%,#003399 50%,#007733 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>WORLD CUP 2026</h1>
            <p style={{fontSize:11,color:"#6B7280",margin:"3px 0 0"}}>{children}</p>
          </div>
          <div style={{width:44,paddingTop:10}}/>
        </div>
        {footer}
      </div>
    </div>
  );
}
const boardOrderKey = (board) => board?.joined_at || board?.created_at || board?.name || board?.id || "";
const sortJoinedBoards = (boards) =>
  [...boards].sort((a, b) => String(boardOrderKey(a)).localeCompare(String(boardOrderKey(b))));
const appendJoinedBoard = (boards, board) => {
  if (boards.some(b => b.id === board.id)) return boards;
  const nextBoard = { ...board, joined_at: board.joined_at || new Date().toISOString() };
  const pinned = boards.filter(b => b.isGlobal);
  const joined = boards.filter(b => !b.isGlobal);
  return [...pinned, ...sortJoinedBoards([...joined, nextBoard])];
};
const BOARD_LEADERS = {
  global: [
    { rank:1,    name:"Alex M.",      pts:342, prize:"250 lei", emoji:"🥇", accent:"#fff" },
    { rank:2,    name:"Maria P.",     pts:318, prize:"150 lei", emoji:"🥈", accent:"#fff" },
    { rank:3,    name:"David C.",     pts:295, prize:"100 lei", emoji:"🥉", accent:"#fff" },
    { rank:4,    name:"Andreea V.",   pts:271, accent:"#fff" },
    { rank:5,    name:"Bogdan C.",    pts:248, accent:"#fff" },
    { rank:6,    name:"Elena T.",     pts:235, accent:"#fff" },
    { rank:7,    name:"Radu M.",      pts:221, accent:"#fff" },
    { rank:8,    name:"Cristina L.",  pts:208, accent:"#fff" },
    { rank:9,    name:"Mihai S.",     pts:196, accent:"#fff" },
    { rank:10,   name:"Ioana D.",     pts:184, accent:"#fff" },
    { rank:201,  name:"Alex Ionescu", pts:97,  accent:"#E8F0FF", isMe:true },
  ],
};

const LANGS = [{ code:"en", flag:"🇬🇧", name:"English" },{ code:"ro", flag:"🇷🇴", name:"Romana" },{ code:"fr", flag:"🇫🇷", name:"Francais" }];
const T = {
  en:{
    location:"USA, Canada & Mexico", cta:"Make Your Prediction",
    days:"DAYS", hours:"HOURS", minutes:"MINUTES", seconds:"SECONDS",
    footerHome:"Home", footerStats:"Groups", footerFast:"Instant Pick ⚡", footerAccount:"Account",
    participants:"participants", add:"Add", yourTasks:"Your tasks",
    predictions:"Predictions", completed:"✓ Completed", deadlinePassed:"Deadline passed", dueJun11:"Due Jun 11",
    koUnlockedLabel:"⚡ Knockout available", koDueJun27:"Due Jun 27",
    exactScores:"Exact Scores", weekComplete:"✓ Week complete", thisWeek:"this week",
    pathToTrophy:"Path to the Trophy", unlocksEvery:"Unlocks every Sunday 8AM",
    groupStage:"Group Stage", week:"Week", roundOf16QF:"R32 · R16 · QF · SF",
    final:"Final", locked:"Locked", past:"Past", viewAll:"View all ›",
    tournamentStarts:"Tournament starts Jun 11", ptsTotal:"pts total",
    leaderboard:"Leaderboard", searchPlayer:"Search player...",
    tournamentNotStarted:"Tournament not started",
    leaderboardMsg:"The leaderboard will be available after the tournament starts on Jun 11, 2026.",
    openSlot:"Open slot", noPlayerFound:"No player found for",
    joinTheGame:"Join the Game", continueGoogle:"Continue with Google",
    continueFacebook:"Continue with Facebook", continueInstagram:"Continue with Instagram",
    groupsSchedule:"Groups & Schedule", groupTeams:"Teams", matchSchedule:"Match Schedule",
    myBoards:"My Leagues", activeBoards:"3 active leagues", appGuide:"App Guide",
    howItWorks:"How it works", notifications:"Notifications", matchAlertsOn:"Match alerts on",
    language:"Language", upgradePremium:"Upgrade to Premium", removeAds:"Remove ads",
    shareApp:"Share with Friends", shareAppSub:"Invite friends via WhatsApp",
    shareAppMsg:"Hey! Join me on WCP26 - the best World Cup 2026 prediction game! 🏆⚽ Play here: ",
    signOut:"Sign Out", memberSince:"Member since March 2026",
    todaysMatches:"Today's Matches", tapToPredict:"Tap to predict the winner",
    allDone:"All done!", backToHome:"Back to Home", draw:"Draw",
    yourPredictedChampion:"Your Predicted Champion", worldCupWinner:"2026 World Cup Winner",
    pointsPerPrediction:"Points per correct prediction",
    confirmPredictions:"✅ Confirm Predictions",
    predictionsLocked:"🔒 Tournament started — predictions locked",
    slotGroupWinner:"Group Winner · Advances", slotRunnerUp:"Runner-up · Advances", slotThirdPlace:"Possible 3rd Place", slotEliminated:"Eliminated",
    btnAutoPick:"🎲 Auto-pick", btnReset:"↺ Reset", btnNextGroup:"NEXT GROUP →", btnNextBestThird:"NEXT: BEST THIRD →", btnConfirmNextGroup:"CONFIRM & NEXT GROUP →", btnConfirmAllGroups:"CONFIRM ALL GROUPS ✓", btnSelectAll4:"SELECT ALL 4 TEAMS", btnGroupSummaryReset:"🔄 Reset", btnNextGroupSummary:"Urmatoarea grupă →", btnKnockout:"Knockout →",
    noChampionSelected:"No champion selected",
    matchesToPredict:"matches to predict", startMatches:"Start Matches →",
    viewOnly:"View Only", winnerArrow:"Winner →",
    groups:"groups", group:"Group",
    best3Title:"🥉 Best Third", selectTeams:"Select 8 3rd place teams...",
    thirdPlaceRanking:"3rd Place Ranking · sorted by points", team:"Team",
    knockout:"Knockout →", selectMore:"Select more",
    boards:"Leagues", createBoard:"Create League", editBoard:"Edit League",
    boardName:"Group name", joinBoard:"Join League", enterCode:"Enter code",
    invalidCode:"Invalid code. Please check and try again.",
    rules:"Rules", howPredictionsWork:"How does Predictions work?",
    howExactScoreWork:"How does Exact Score work?",
    predictionsDesc:"Two phases: rank all 12 groups + pick 8 best-third teams before Jun 11. The knockout bracket unlocks Jun 27 after the last group match.",
    rulesTask1Header:"Task 1 · Groups & Best Third", rulesTask1Due:"Deadline Jun 11",
    rulesTask2Header:"Task 2 · Knockout Phase", rulesTask2Due:"Unlocks Jun 27",
    exactDesc:"Predict the exact score of each match every week. Unlocks on Sundays after 8:00 PM.",
    exactScore:"EXACT SCORE", confirmScore:"Confirm Score",
    save:"Save", cancel:"Cancel", del:"Delete", done:"Done",
    semiFinalsDone:"Semi-Finals complete", theFinalsAwait:"The Finals Await",
    roadToFinal:"Road to the Final", yourPicksAdvance:"Your picks advance",
    groupStageDone:"Group Stage complete!", allGroupsPredicted:"You've predicted the order for all groups.",
    tapToRank:"Tap → rank", predictedRank:"Predicted standings",
    backLabel:"Back", groupComplete:"Complete", yourPredictedStandings:"Your predicted standings",
    yourPredictions:"Your Predictions", maxPossiblePoints:"Maximum possible points",
    possiblePts:"possible pts", selectScore:"Select predicted score",
    customScore:"Other score", saveScore:"Save ✓", modifyBtn:"← Modify", bestThirdBtn:"Best Third →",
    notStarted:"Not Started", winner:"Winner", scheduledMatches:"Scheduled Matches",
    tabMatches:"Matches", tabStanding:"Standing",
    matchSingular:"match", matchPlural:"matches",
    realLabel:"Real", predictedLabel:"Predicted", noMatchesScheduled:"No matches scheduled", checkWeekHint:"Check the rest of the week — there might be matches to predict.",
    finished:"Finished", prediction:"Prediction",
    noMembersYet:"No members yet", searchOrCode:"Search or enter invite code...",
    joinBtn:"Join", noBoardsFor:"No leagues found for",
    dontShowAgain:"Don't show again",
    onb0Title:"Two Prediction Phases", onb0Sub:"Groups + Best Third · Knockout",
    onb0Desc:"Phase 1 (before Jun 11): Rank all 12 groups and pick your 8 best-third teams. Phase 2: The knockout bracket unlocks Jun 27 after the last group match — build your path to the trophy.",
    onb0Next:"Show me scores →",
    onb1Title:"Weekly Exact Score", onb1Sub:"Unlocks every Sunday at 8:00 AM",
    onb1Desc:"Predict the exact score of each week's matches for bonus points. New matches every Sunday.",
    onb1Next:"Invite friends →",
    onb2Title:"Compete With Friends", onb2Sub:"Private leagues · Custom prizes",
    onb2Desc:"Create a private group, invite your friends and set your own prizes. May the best predictor win.",
    onb2Next:null,
    getStarted:"Get Started",
    rulesDesc1:"Group winner", rulesDesc2:"2nd place", rulesDesc3:"3rd place",
    rulesDescBest3:"Best-3rd advancing", rulesDescMatch:"Match winner", rulesDescFinal:"Tournament winner",
    boardPassword:"Group Password", maxPlayers:"Max Players", prizedSlots:"Prize slots", prizesLabel:"Prizes",
    membersLabel:"Members", adminLabel:"Admin", remove:"Remove", saveChanges:"Save Changes ✓",
    createBoard2:"Create League 🏆", boardAdmin:"League Admin", incorrectPassword:"Incorrect password. Try again.",
    joinBoardTitle:"Join a League", joinedBoards:"My Leagues", availableBoards:"Available Leagues",
    chooseEmoji:"Choose emoji", passwordProtected:"Password protected league",
    enterPassword:"Enter password...", rank:"Rank",
    globalBoard:"Global", noBoards:"No leagues found.",
    viewAll2:"View all", members2:"members", code:"code",
    allMatchesGrp:"All Matches · Gr.",
    loginCreateAccount:"Create account", loginRecoverAccount:"Recover account",
    loginCheckEmail:"Check your email", loginNewAccount:"New account",
    loginNoAccountFor:"No account found for",
    emailPlaceholder:"email@example.com", passwordMinPlaceholder:"password (min. 6 chars)",
    passwordPlaceholder:"password", nicknamePlaceholder:"Choose a nickname",
    confirmPasswordPlaceholder:"confirm password (min. 6 chars)",
    btnContinue:"Continue →", btnVerifying:"Verifying...",
    btnCreateAccount:"Create account →", btnCreating:"Creating...",
    btnSignUpCreate:"Create account →",
    btnSendReset:"Send reset link →", btnSending:"Sending...",
    solveCaptcha:"🔒 Solve verification above",
    checkEmailTitle:"Check your email!", sentLinkTo:"We sent a link to",
    clickLinkToContinue:"Click the link to continue.",
    linkSentIfExists:"Link sent if address exists in system.",
    forgotPassword:"Forgot password", newAccountLink:"New account",
    errEnterEmail:"Enter your email address.", errEnterPassword:"Enter your password.",
    errWrongPassword:"Wrong password. Try again or reset it.",
    errUnexpected:"Unexpected error. Try again.",
    errChooseNickname:"Choose a nickname.", errNicknameLetter:"Nickname must start with a letter.", errNicknameTaken:"This nickname is already taken.",
    errPasswordMin6:"Password must be at least 6 characters.",
    errSendFailed:"Error sending. Try again.",
    errPasswordsMismatch:"Passwords don't match.",
    passwordChanged:"Password changed!", passwordSet:"Password set!",
    redirectingMsg:"Redirecting...",
    newPasswordTitle:"New password", enterNewPassword:"Enter your new password",
    newPasswordPlaceholder:"New password", confirmPasswordPlaceholderField:"Confirm password",
    btnSavePassword:"Save password →", btnSaving:"Saving...",
    setPasswordTitle:"Set a password",
    accountCreatedViaLink:"Your account was created via magic link.",
    setPasswordDesc:"Set a password to log in next time without a link.",
    deleteAccountTitle:"Delete account",
    deleteDescPt1:"This will delete ", deleteDescEverything:"everything",
    deleteDescPt2:": predictions, leagues and scores.",
    deleteDescIrreversiblePt1:"This action is ", deleteDescIrreversible:"irreversible",
    enterEmailToConfirm:"Enter your email to confirm:",
    btnDeleting:"Deleting...", btnDeletePermanently:"Delete permanently",
    leaveLeagueTitle:"Leave league?", leaveLeagueBody1:"Your points and entries will be removed from",
    leaveLeagueConfirm:"Leave league",
    deleteLeagueTitle:"Delete league?", deleteLeagueBody1:"This removes",
    deleteLeagueBody2:"for everyone in the league.", deleteLeagueConfirm:"Delete league",
    inviteCodeDetected:"🔑 Invite code detected — tap Join",
    noBoardsFoundFor:"No boards found for", tryAnotherName:"Try another name or paste the invite code.",
    loadingPlayers:"Loading players…", noPlayersForTeam:"No players found for this team.",
    boardsCount:"boards", footerRanking:"Ranking", footerRules:"Rules", footerMore:"More",
    memberSinceLabel:"Member since",
    discoverTab:"Discover", joinedStatus:"Joined",
    leagueNamePlaceholder:"Ex: Office league",
    joinedEmptyTitle:"No leagues joined", joinedEmptyBody:"Join a league or create your own private one.",
    availableEmptyTitle:"No leagues available", availableEmptyBody:"Create a new league or enter an invite code.",
    adminEmptyTitle:"No leagues managed", adminEmptyBody:"Create a league and it will appear here.",
    hiGreeting:"Hi,", manageLeague:"Manage League", newLeague:"New League",
    nextActionLabel:"Next action", upToDateLabel:"Up to date", yourProgress:"Your progress",
    thisWeekLabel:"This week", leagueRanking:"League ranking", viewRanking:"View ranking",
    openScores:"Open scores", exactScoresUnlock:"Exact scores unlock", scoresLeftThisWeek:"left this week",
    allDoneTitle:"You're all set!", allDoneSub:"Check back after matches",
    continuePredictions:"Continue", startPredictions:"Start predictions", you:"You",
    syncingLabel:"syncing", tournamentLive:"🏆 tournament live", kickoffLabel:"· kickoff",
    lockedUntilJun27:"Locked until Jun 27", specialPick:"Special Pick",
    winnerTopScorer:"Winner & Top Scorer", reopensJun27:"Reopens Jun 27",
    specialPickSub:"Team win +3 · Player scored +3",
    predCardTitle:"Bracket Prediction", predCardSub:"Every right pick counts",
    exactCardTitle:"Exact Scores", exactCardSub:"Aim for perfect — every goal counts",
    winnerTeam:"Winner Team", pickTeam:"Pick your team",
    topScorer:"Top Scorer", pickPlayer:"Pick your player",
    totalLabel:"Total:", availableNow:"Available now",
    syncingPredictions:"Syncing predictions", trophyLabel:"Trophy",
    groupsBestThird:"Groups + Best Third", knockoutPhase:"Knockout Phase",
    moreToCome:"· more to come ·", nextTask:"Next task", continueHere:"CONTINUE HERE",
    copyExactScoresTitle:"Copy exact scores", copyWinnerTeamTitle:"Copy Winner Team",
    copyTopScorerTitle:"Copy Top Scorer", copySpecialTitle:"Copy special picks",
    copyPredictionsTitle:"Copy predictions",
    copyExactScoresSub:"Replicate this week's exact scores to another league",
    copyWinnerTeamSub:"Replicate your Winner Team pick to another league",
    copyTopScorerSub:"Replicate your Top Scorer pick to another league",
    copySpecialSub:"Replicate your Winner Team & Top Scorer to another league",
    copyPredsSub:"Replicate your Group phase predictions to another league",
    noOtherBoards:"No other boards available",
    copiedLabel:"✓ Copied", pasteLabel:"Paste",
    loadingTitle:"Starting Predicto", loadingLeagues:"Loading leagues",
    loadingSession:"Preparing your session...", loadingBoards:"Syncing boards, rankings and picks...",
    rulesTabPredictions:"🎯 Predictions", rulesTabExact:"⚽ Exact Score",
    rulesExampleTitle:"💡 Example",
    rulesExamplePred:"If you get the winner right in 10 group matches → 10 × 30 = 300 pts. Every correct prediction counts!",
    rulesExampleExact:"If you get the exact score in 3 matches → 3 × 90 = 270 pts. Correct result only → 30 pts per match.",
    guideViewNext:"View next", guideClose:"Close",
    noNotificationsYet:"No notifications yet",
    alreadyPremiumTitle:"You're already Premium for us",
    alreadyPremiumBody:"Thank you for being part of Predicto. You get the full experience, on us.",
    best3Short:"Best Third",
    cdDayAbbr:"d", cdHourAbbr:"h", cdMinAbbr:"m",
    pickChampionHeader:"Pick Champion", pickTopScorerHeader:"Pick Top Scorer",
    picksLockedTitle:"Bonus picks locked",
    picksLockedBody:"The Bonus Prediction deadline was Jun 14. Your current picks are saved.",
    bonusDueJun14:"Due Jun 14",
    bonusClosedTitle:"Bonus locked",
    bonusClosedSub:"Deadline passed - picks saved",
    bonusClosedEmptySub:"Deadline passed - no bonus picks saved",
    championPickLabel:"Champion Pick", chooseWinner:"Choose your winner",
    selectedLabel:"selected", tapTeamBelow:"Tap a team below",
    clearLabel:"Clear", allTeams:"All teams",
    topScorerPickLabel:"Top Scorer Pick", startWithTeam:"Start with a team",
    pickTeamDots:"Pick a team...", pickTopScorerSub:"pick the top scorer",
    topScorerSaved:"Top Scorer saved", winnerTeamSaved:"Winner Team saved",
    winnerTeamCleared:"Winner Team cleared", changeLabel:"Change",
    pickChampionPopup:"🏆 Pick Champion", pickTeamPopup:"👕 Pick Team",
    bonusPrediction:"Bonus Prediction", bonusDesc:"Earn extra points — your picks define the final podium",
    runnerUpPickLabel:"Runner-up (Second place)", chooseRunnerUp:"Choose your runner-up",
    runnerUpSaved:"Runner-up saved", runnerUpCleared:"Runner-up cleared",
    openBonusLabel:"Pick", pickRunnerUpHeader:"Pick Runner-up",
  },
  ro:{
    location:"SUA, Canada & Mexic", cta:"Fa-ti Predictia",
    days:"ZILE", hours:"ORE", minutes:"MIN", seconds:"SEC",
    footerHome:"Acasa", footerStats:"Grupe", footerFast:"Instant Pick ⚡", footerAccount:"Cont",
    participants:"participanți", add:"Adaugă", yourTasks:"Sarcinile tale",
    predictions:"Predicții", completed:"✓ Completat", deadlinePassed:"Termen expirat", dueJun11:"Termen 11 Iun",
    koUnlockedLabel:"⚡ Knockout disponibil", koDueJun27:"Termen 27 Iun",
    exactScores:"Scoruri Exacte", weekComplete:"✓ Săptămâna completă", thisWeek:"această săptămână",
    pathToTrophy:"Drumul spre Trofeu", unlocksEvery:"Se deschide duminică la 8:00",
    groupStage:"Faza Grupelor", week:"Săptămâna", roundOf16QF:"R32 · Optimi · Sferturi · Semi",
    final:"Finală", locked:"Blocat", past:"Trecut", viewAll:"Vezi tot ›",
    tournamentStarts:"Turneul începe pe 11 Iun", ptsTotal:"pts total",
    leaderboard:"Clasament", searchPlayer:"Caută jucător...",
    tournamentNotStarted:"Turneul nu a început",
    leaderboardMsg:"Clasamentul va fi disponibil după ce turneul începe pe 11 Iun 2026.",
    openSlot:"Loc liber", noPlayerFound:"Niciun jucător găsit pentru",
    joinTheGame:"Intră în Joc", continueGoogle:"Continuă cu Google",
    continueFacebook:"Continuă cu Facebook", continueInstagram:"Continuă cu Instagram",
    groupsSchedule:"Grupe & Program", groupTeams:"Echipe", matchSchedule:"Program Meciuri",
    myBoards:"Ligile mele", activeBoards:"3 ligi active", appGuide:"Ghid Aplicație",
    howItWorks:"Cum funcționează", notifications:"Notificări", matchAlertsOn:"Alerte meci active",
    language:"Limbă", upgradePremium:"Upgrade la Premium", removeAds:"Elimină reclamele",
    shareApp:"Trimite Prietenilor", shareAppSub:"Invită prieteni pe WhatsApp",
    shareAppMsg:"Salut! Alătură-te mie pe WCP26 - cel mai bun joc de predicții pentru Cupa Mondială 2026! 🏆⚽ Joacă aici: ",
    signOut:"Deconectare", memberSince:"Membru din Martie 2026",
    todaysMatches:"Meciurile de Azi", tapToPredict:"Apasă pentru a prezice câștigătorul",
    allDone:"Gata!", backToHome:"Înapoi Acasă", draw:"Egal",
    yourPredictedChampion:"Campionul Tău Prezis", worldCupWinner:"Câștigător Mondial 2026",
    pointsPerPrediction:"Puncte per predicție corectă",
    confirmPredictions:"✅ Confirmă Predicțiile",
    predictionsLocked:"🔒 Turneul a început — predicții blocate",
    slotGroupWinner:"Câștigătoare Grupă · Avansează", slotRunnerUp:"Locul 2 · Avansează", slotThirdPlace:"Posibil Locul 3", slotEliminated:"Eliminată",
    btnAutoPick:"🎲 Auto-selectare", btnReset:"↺ Resetează", btnNextGroup:"GRUPA URMATOARE →", btnNextBestThird:"URMĂTOR: LOCUL 3 →", btnConfirmNextGroup:"CONFIRMĂ & GRUPA URMATOARE →", btnConfirmAllGroups:"CONFIRMĂ TOATE GRUPELE ✓", btnSelectAll4:"SELECTEAZĂ TOATE 4 ECHIPELE", btnGroupSummaryReset:"🔄 Resetează", btnNextGroupSummary:"Urmatoarea grupă →", btnKnockout:"Knockout →",
    noChampionSelected:"Niciun campion selectat",
    matchesToPredict:"meciuri de prezis", startMatches:"Începe Meciurile →",
    viewOnly:"Doar Vizualizare", winnerArrow:"Câștigător →",
    groups:"grupe", group:"Grupă",
    best3Title:"🥉 Cel mai bun loc 3", selectTeams:"Selectează 8 echipe de pe locul 3...",
    thirdPlaceRanking:"Clasament Locul 3 · sortat după puncte", team:"Echipă",
    knockout:"Eliminatorii →", selectMore:"Mai selectează",
    boards:"Ligi", createBoard:"Creează Ligă", editBoard:"Editează Liga",
    boardName:"Nume grup", joinBoard:"Alătură-te", enterCode:"Introdu codul",
    invalidCode:"Cod invalid. Verifică și încearcă din nou.",
    rules:"Reguli", howPredictionsWork:"Cum funcționează Predicțiile?",
    howExactScoreWork:"Cum funcționează Scorul Exact?",
    predictionsDesc:"Două etape: clasează cele 12 grupe + alege 8 echipe de pe locul 3 înainte de 11 Iun. Faza eliminatorie se deblochează pe 27 Iun după ultimul meci din grupe.",
    rulesTask1Header:"Task 1 · Grupe & Cel mai bun loc 3", rulesTask1Due:"Termen 11 Iun",
    rulesTask2Header:"Task 2 · Faza Eliminatorie", rulesTask2Due:"Disponibil din 27 Iun",
    exactDesc:"Prezice scorul exact al fiecărui meci în fiecare săptămână. Se deschide duminicile după 20:00.",
    exactScore:"SCOR EXACT", confirmScore:"Confirmă Scorul",
    save:"Salvează", cancel:"Anulează", del:"Șterge", done:"Gata",
    semiFinalsDone:"Semi-Finale Complete", theFinalsAwait:"Finala Te Așteaptă",
    roadToFinal:"Drumul spre Finală", yourPicksAdvance:"Predicțiile tale avansează",
    groupStageDone:"Faza Grupelor completă!", allGroupsPredicted:"Ai prezis ordinea pentru toate grupele.",
    tapToRank:"Apasă → clasament", predictedRank:"Clasament prezis",
    backLabel:"Înapoi", groupComplete:"Complet", yourPredictedStandings:"Clasamentul tău prezis",
    yourPredictions:"Predicțiile tale", maxPossiblePoints:"Total maxim posibil",
    possiblePts:"pts posibile", selectScore:"Selectează scorul prezis",
    customScore:"Alt scor", saveScore:"Salvează ✓", modifyBtn:"← Modifică", bestThirdBtn:"Locul 3 →",
    notStarted:"Neînceput", winner:"Câștigător", scheduledMatches:"Meciuri Programate",
    tabMatches:"Meciuri", tabStanding:"Clasament",
    matchSingular:"meci", matchPlural:"meciuri",
    realLabel:"Real", predictedLabel:"Prezis", noMatchesScheduled:"Nu sunt meciuri programate", checkWeekHint:"Verifică restul săptămânii — s-ar putea să ai meciuri de prezis.",
    finished:"Terminat", prediction:"Predicție",
    noMembersYet:"Niciun membru încă", searchOrCode:"Caută sau introdu codul...",
    joinBtn:"Alătură-te", noBoardsFor:"Nicio ligă găsită pentru",
    dontShowAgain:"Nu mai arăta",
    onb0Title:"Predicții în Două Etape", onb0Sub:"Grupe + Locul 3 · Eliminatorii",
    onb0Desc:"Etapa 1 (înainte de 11 Iun): Clasează cele 12 grupe și alege 8 echipe de pe locul 3. Etapa 2: Faza eliminatorie se deblochează pe 27 Iun după ultimul meci din grupe.",
    onb0Next:"Arată-mi scorurile →",
    onb1Title:"Scor Exact Săptămânal", onb1Sub:"Se deschide duminică la 8:00",
    onb1Desc:"Prezice scorul exact al meciurilor săptămânii pentru puncte bonus. Meciuri noi în fiecare duminică.",
    onb1Next:"Invită prieteni →",
    onb2Title:"Concurează cu Prietenii", onb2Sub:"Ligi private · Premii personalizate",
    onb2Desc:"Creează un grup privat, invită prietenii și setează propriile premii. Câștige cel mai bun prezicător.",
    onb2Next:null,
    getStarted:"Începe",
    rulesDesc1:"Echipa care câștigă grupa", rulesDesc2:"Echipa pe locul 2", rulesDesc3:"Echipa pe locul 3",
    rulesDescBest3:"Echipă de pe locul 3 care avansează", rulesDescMatch:"Câștigătorul meciului", rulesDescFinal:"Câștigătorul turneului",
    boardPassword:"Parolă Grup", maxPlayers:"Jucători max", prizedSlots:"Locuri premiate", prizesLabel:"Premii",
    membersLabel:"Membri", adminLabel:"Admin", remove:"Elimină", saveChanges:"Salvează Modificările ✓",
    createBoard2:"Creează Ligă 🏆", boardAdmin:"Admin Ligă", incorrectPassword:"Parolă incorectă. Încearcă din nou.",
    joinBoardTitle:"Alătură-te unei Ligi", joinedBoards:"Ligile mele", availableBoards:"Ligi disponibile",
    chooseEmoji:"Alege un emoji", passwordProtected:"Ligă protejată cu parolă",
    enterPassword:"Introdu parola...", rank:"Rang",
    globalBoard:"Global", noBoards:"Nicio ligă găsită.",
    viewAll2:"Vezi tot", members2:"membri", code:"cod",
    allMatchesGrp:"Toate Meciurile · Gr.",
    loginCreateAccount:"Creează cont", loginRecoverAccount:"Recuperare cont",
    loginCheckEmail:"Verifică emailul", loginNewAccount:"Cont nou",
    loginNoAccountFor:"Niciun cont găsit pentru",
    emailPlaceholder:"adresa@email.com", passwordMinPlaceholder:"parolă (min. 6 caractere)",
    passwordPlaceholder:"parolă", nicknamePlaceholder:"Alege un nickname",
    confirmPasswordPlaceholder:"confirmă parola (min. 6 caractere)",
    btnContinue:"Continuă →", btnVerifying:"Se verifică...",
    btnCreateAccount:"Creează cont →", btnCreating:"Se creează...",
    btnSignUpCreate:"Creează cont · Sign up →",
    btnSendReset:"Trimite link de resetare →", btnSending:"Se trimite...",
    solveCaptcha:"🔒 Rezolvă verificarea mai sus",
    checkEmailTitle:"Verifică emailul!", sentLinkTo:"Am trimis un link la",
    clickLinkToContinue:"Click pe link pentru a continua.",
    linkSentIfExists:"Link trimis dacă adresa există în sistem.",
    forgotPassword:"Am uitat parola", newAccountLink:"Cont nou",
    errEnterEmail:"Introdu adresa de email.", errEnterPassword:"Introdu parola.",
    errWrongPassword:"Parolă incorectă. Încearcă din nou sau resetează parola.",
    errUnexpected:"Eroare neașteptată. Încearcă din nou.",
    errChooseNickname:"Alege un nickname.", errNicknameLetter:"Nickname-ul trebuie să înceapă cu o literă.", errNicknameTaken:"Nickname-ul este deja folosit.",
    errPasswordMin6:"Parola trebuie să aibă minim 6 caractere.",
    errSendFailed:"Eroare la trimitere. Încearcă din nou.",
    errPasswordsMismatch:"Parolele nu coincid.",
    passwordChanged:"Parolă schimbată!", passwordSet:"Parolă setată!",
    redirectingMsg:"Te redirecționăm...",
    newPasswordTitle:"Parolă nouă", enterNewPassword:"Introdu noua ta parolă",
    newPasswordPlaceholder:"Parolă nouă", confirmPasswordPlaceholderField:"Confirmă parola",
    btnSavePassword:"Salvează parola →", btnSaving:"Se salvează...",
    setPasswordTitle:"Setează o parolă",
    accountCreatedViaLink:"Contul tău a fost creat prin magic link.",
    setPasswordDesc:"Setează o parolă pentru a te putea loga data viitoare fără link.",
    deleteAccountTitle:"Șterge cont",
    deleteDescPt1:"Aceasta va șterge ", deleteDescEverything:"tot",
    deleteDescPt2:": predicții, ligi și scoruri.",
    deleteDescIrreversiblePt1:"Această acțiune este ", deleteDescIrreversible:"ireversibilă",
    enterEmailToConfirm:"Introdu email-ul pentru confirmare:",
    btnDeleting:"Se șterge...", btnDeletePermanently:"Șterge definitiv",
    leaveLeagueTitle:"Ieși din ligă?", leaveLeagueBody1:"Punctele și intrările tale vor fi eliminate din",
    leaveLeagueConfirm:"Ieși din ligă",
    deleteLeagueTitle:"Șterge liga?", deleteLeagueBody1:"Aceasta elimină",
    deleteLeagueBody2:"pentru toți membrii ligii.", deleteLeagueConfirm:"Șterge liga",
    inviteCodeDetected:"🔑 Cod de invitație detectat — apasă Join",
    noBoardsFoundFor:"Niciun grup găsit pentru", tryAnotherName:"Încearcă alt nume sau lipește codul de invitație.",
    loadingPlayers:"Se încarcă jucătorii...", noPlayersForTeam:"Niciun jucător pentru această echipă.",
    boardsCount:"grupuri", footerRanking:"Clasament", footerRules:"Reguli", footerMore:"Mai mult",
    memberSinceLabel:"Membru din",
    discoverTab:"Descoperă", joinedStatus:"Înscris",
    leagueNamePlaceholder:"Ex: Liga biroului",
    joinedEmptyTitle:"Nicio ligă alăturată", joinedEmptyBody:"Alătură-te sau creează propria ligă privată.",
    availableEmptyTitle:"Nicio ligă disponibilă", availableEmptyBody:"Creează o ligă nouă sau introdu un cod de invitație.",
    adminEmptyTitle:"Nicio ligă administrată", adminEmptyBody:"Creează o ligă și va apărea aici.",
    hiGreeting:"Salut,", manageLeague:"Administrează Liga", newLeague:"Ligă Nouă",
    nextActionLabel:"Urmatoarea actiune", upToDateLabel:"La zi", yourProgress:"Progresul tau",
    thisWeekLabel:"Saptamana aceasta", leagueRanking:"Clasament liga", viewRanking:"Vezi clasamentul",
    openScores:"Deschide scoruri", exactScoresUnlock:"Scorurile exacte se deschid", scoresLeftThisWeek:"ramase saptamana asta",
    allDoneTitle:"Esti la zi!", allDoneSub:"Revino dupa meciuri",
    continuePredictions:"Continua", startPredictions:"Incepe predictiile", you:"Tu",
    syncingLabel:"sincronizare", tournamentLive:"🏆 turneu live", kickoffLabel:"· start",
    lockedUntilJun27:"Blocat până pe 27 Iun", specialPick:"Selecție Specială",
    winnerTopScorer:"Câștigător & Golgheter", reopensJun27:"Se redeschide 27 Iun",
    specialPickSub:"Echipă câștigătoare +3 · Marcator +3",
    predCardTitle:"Predicții bracket", predCardSub:"Fiecare alegere corectă contează",
    exactCardTitle:"Scoruri exacte", exactCardSub:"Fii precis — fiecare gol contează",
    winnerTeam:"Echipa Câștigătoare", pickTeam:"Alege echipa",
    topScorer:"Golgheter", pickPlayer:"Alege jucătorul",
    totalLabel:"Total:", availableNow:"Disponibil acum",
    syncingPredictions:"Sincronizare predicții", trophyLabel:"Trofeu",
    groupsBestThird:"Grupe + Best Third", knockoutPhase:"Faza Knockout",
    moreToCome:"· mai urmează ·", nextTask:"Următorul task", continueHere:"CONTINUĂ AICI",
    copyExactScoresTitle:"Copiază scoruri exacte", copyWinnerTeamTitle:"Copiază Echipa Câștigătoare",
    copyTopScorerTitle:"Copiază Golgheter", copySpecialTitle:"Copiază selecțiile speciale",
    copyPredictionsTitle:"Copiază predicții",
    copyExactScoresSub:"Replică scorurile exacte ale săptămânii în altă ligă",
    copyWinnerTeamSub:"Replică selecția ta de echipă câștigătoare în altă ligă",
    copyTopScorerSub:"Replică selecția ta de golgheter în altă ligă",
    copySpecialSub:"Replică câștigătorul & golgheterul tău în altă ligă",
    copyPredsSub:"Replică predicțiile din faza grupelor în altă ligă",
    noOtherBoards:"Nicio altă ligă disponibilă",
    copiedLabel:"✓ Copiat", pasteLabel:"Lipește",
    loadingTitle:"Se pornește Predicto", loadingLeagues:"Se încarcă ligile",
    loadingSession:"Se pregătește sesiunea...", loadingBoards:"Sincronizare ligi, clasamente și selecții...",
    rulesTabPredictions:"🎯 Predicții", rulesTabExact:"⚽ Scor Exact",
    rulesExampleTitle:"💡 Exemplu",
    rulesExamplePred:"Dacă prezici corect câștigătorul în 10 meciuri de grupe → 10 × 30 = 300 pts. Fiecare predicție corectă contează!",
    rulesExampleExact:"Dacă prezici scorul exact în 3 meciuri → 3 × 90 = 270 pts. Rezultat corect doar → 30 pts per meci.",
    guideViewNext:"Înainte", guideClose:"Închide",
    noNotificationsYet:"Nu există notificări încă",
    alreadyPremiumTitle:"Ești deja Premium pentru noi",
    alreadyPremiumBody:"Mulțumim că faci parte din Predicto. Ai acces complet la toate funcțiile.",
    best3Short:"Locul 3",
    pickChampionHeader:"Alege Campionul", pickTopScorerHeader:"Alege Golgheterul",
    picksLockedTitle:"Selectii bonus blocate",
    picksLockedBody:"Termenul pentru Predictia Bonus a fost 14 Iun. Selectiile actuale sunt salvate.",
    bonusDueJun14:"Termen 14 Iun",
    bonusClosedTitle:"Bonus blocat",
    bonusClosedSub:"Termen trecut - selectii salvate",
    bonusClosedEmptySub:"Termen trecut - nicio selectie salvata",
    championPickLabel:"Selecție Campion", chooseWinner:"Alege câștigătorul",
    selectedLabel:"selectat", tapTeamBelow:"Apasă o echipă mai jos",
    clearLabel:"Șterge", allTeams:"Toate echipele",
    topScorerPickLabel:"Selecție Golgheter", startWithTeam:"Începe cu o echipă",
    pickTeamDots:"Alege o echipă...", pickTopScorerSub:"alege golgheterul",
    topScorerSaved:"Golgheter salvat", winnerTeamSaved:"Echipa câștigătoare salvată",
    winnerTeamCleared:"Echipa câștigătoare ștearsă", changeLabel:"Schimbă",
    pickChampionPopup:"🏆 Alege Campionul", pickTeamPopup:"👕 Alege Echipa",
    cdDayAbbr:"z", cdHourAbbr:"h", cdMinAbbr:"m",
    bonusPrediction:"Predicție Bonus", bonusDesc:"Câștigă puncte extra — selecțiile tale definesc podiumul final",
    runnerUpPickLabel:"Finalist (Locul 2)", chooseRunnerUp:"Alege finalistul",
    runnerUpSaved:"Finalist salvat", runnerUpCleared:"Finalist șters",
    openBonusLabel:"Alege", pickRunnerUpHeader:"Alege Finalistul",
  },
  fr:{
    location:"USA, Canada & Mexique", cta:"Faites vos Pronostics",
    days:"JOURS", hours:"HEURES", minutes:"MIN", seconds:"SEC",
    footerHome:"Accueil", footerStats:"Groupes", footerFast:"Instant Pick ⚡", footerAccount:"Compte",
    participants:"participants", add:"Ajouter", yourTasks:"Vos tâches",
    predictions:"Pronostics", completed:"✓ Complété", deadlinePassed:"Délai expiré", dueJun11:"Délai 11 Juin",
    koUnlockedLabel:"⚡ Knockout disponible", koDueJun27:"Délai 27 Juin",
    exactScores:"Scores Exacts", weekComplete:"✓ Semaine complète", thisWeek:"cette semaine",
    pathToTrophy:"Chemin vers le Trophée", unlocksEvery:"Ouvre chaque dimanche à 8h",
    groupStage:"Phase de Groupes", week:"Semaine", roundOf16QF:"R32 · H.d.F. · Quarts · Demi",
    final:"Finale", locked:"Bloqué", past:"Passé", viewAll:"Voir tout ›",
    tournamentStarts:"Tournoi débute le 11 Juin", ptsTotal:"pts total",
    leaderboard:"Classement", searchPlayer:"Chercher joueur...",
    tournamentNotStarted:"Tournoi pas encore commencé",
    leaderboardMsg:"Le classement sera disponible après le début du tournoi le 11 Juin 2026.",
    openSlot:"Slot libre", noPlayerFound:"Aucun joueur trouvé pour",
    joinTheGame:"Rejoignez le Jeu", continueGoogle:"Continuer avec Google",
    continueFacebook:"Continuer avec Facebook", continueInstagram:"Continuer avec Instagram",
    groupsSchedule:"Groupes & Programme", groupTeams:"Équipes", matchSchedule:"Programme des Matchs",
    myBoards:"Mes Ligues", activeBoards:"3 ligues actives", appGuide:"Guide App",
    howItWorks:"Comment ça marche", notifications:"Notifications", matchAlertsOn:"Alertes match activées",
    language:"Langue", upgradePremium:"Passer à Premium", removeAds:"Supprimer les pubs",
    shareApp:"Partager avec des Amis", shareAppSub:"Inviter des amis via WhatsApp",
    shareAppMsg:"Hey ! Rejoins-moi sur WCP26 - le meilleur jeu de pronostics pour la Coupe du Monde 2026 ! 🏆⚽ Joue ici : ",
    signOut:"Déconnexion", memberSince:"Membre depuis Mars 2026",
    todaysMatches:"Matchs du Jour", tapToPredict:"Appuyez pour prédire le vainqueur",
    allDone:"Terminé !", backToHome:"Retour à l'Accueil", draw:"Nul",
    yourPredictedChampion:"Votre Champion Prédit", worldCupWinner:"Vainqueur Mondial 2026",
    pointsPerPrediction:"Points par prédiction correcte",
    confirmPredictions:"✅ Confirmer les Pronostics",
    predictionsLocked:"🔒 Tournoi commencé — pronostics verrouillés",
    slotGroupWinner:"1er du Groupe · Qualifié", slotRunnerUp:"2e du Groupe · Qualifié", slotThirdPlace:"Possible 3e Place", slotEliminated:"Éliminé",
    btnAutoPick:"🎲 Auto-sélection", btnReset:"↺ Réinitialiser", btnNextGroup:"GROUPE SUIVANT →", btnNextBestThird:"SUIVANT: 3e PLACE →", btnConfirmNextGroup:"CONFIRMER & GROUPE SUIVANT →", btnConfirmAllGroups:"CONFIRMER TOUS LES GROUPES ✓", btnSelectAll4:"SÉLECTIONNER 4 ÉQUIPES", btnGroupSummaryReset:"🔄 Réinitialiser", btnNextGroupSummary:"Groupe suivant →", btnKnockout:"Knockout →",
    noChampionSelected:"Aucun champion sélectionné",
    matchesToPredict:"matchs à pronostiquer", startMatches:"Démarrer les Matchs →",
    viewOnly:"Vue uniquement", winnerArrow:"Vainqueur →",
    groups:"groupes", group:"Groupe",
    best3Title:"🥉 Best Third", selectTeams:"Sélectionnez 8 équipes de 3e place...",
    thirdPlaceRanking:"Classement 3e Place · trié par points", team:"Équipe",
    knockout:"Knockout →", selectMore:"Sélectionner encore",
    boards:"Ligues", createBoard:"Créer une Ligue", editBoard:"Modifier la Ligue",
    boardName:"Nom du groupe", joinBoard:"Rejoindre", enterCode:"Entrer le code",
    invalidCode:"Code invalide. Veuillez vérifier et réessayer.",
    rules:"Règles", howPredictionsWork:"Comment fonctionnent les Pronostics ?",
    howExactScoreWork:"Comment fonctionne le Score Exact ?",
    predictionsDesc:"Deux phases : classez les 12 groupes + choisissez 8 équipes meilleur 3e avant le 11 Juin. Les éliminatoires se déverrouillent le 27 Juin après le dernier match de groupes.",
    rulesTask1Header:"Tâche 1 · Groupes & Meilleur 3e", rulesTask1Due:"Date limite 11 Juin",
    rulesTask2Header:"Tâche 2 · Phase Éliminatoire", rulesTask2Due:"Disponible dès le 27 Juin",
    exactDesc:"Prédisez le score exact de chaque match chaque semaine. Déverrouillé le dimanche après 20h.",
    exactScore:"SCORE EXACT", confirmScore:"Confirmer le Score",
    save:"Enregistrer", cancel:"Annuler", del:"Supprimer", done:"Terminé",
    semiFinalsDone:"Demi-Finales terminées", theFinalsAwait:"La Finale Vous Attend",
    roadToFinal:"Route vers la Finale", yourPicksAdvance:"Vos pronostics avancent",
    groupStageDone:"Phase de Groupes terminée !", allGroupsPredicted:"Vous avez prédit l'ordre pour tous les groupes.",
    tapToRank:"Appuyez → classement", predictedRank:"Classement prédit",
    backLabel:"Retour", groupComplete:"Complet", yourPredictedStandings:"Votre classement prédit",
    yourPredictions:"Vos Pronostics", maxPossiblePoints:"Points maximum possibles",
    possiblePts:"pts possibles", selectScore:"Sélectionner le score prédit",
    customScore:"Autre score", saveScore:"Enregistrer ✓", modifyBtn:"← Modifier", bestThirdBtn:"Best Third →",
    notStarted:"Pas commencé", winner:"Vainqueur", scheduledMatches:"Matchs Programmés",
    tabMatches:"Matchs", tabStanding:"Classement",
    matchSingular:"match", matchPlural:"matchs",
    realLabel:"Réel", predictedLabel:"Prédit", noMatchesScheduled:"Aucun match programmé", checkWeekHint:"Consultez le reste de la semaine — il pourrait y avoir des matchs à prédire.",
    finished:"Terminé", prediction:"Pronostic",
    noMembersYet:"Aucun membre encore", searchOrCode:"Chercher ou entrer le code...",
    joinBtn:"Rejoindre", noBoardsFor:"Aucune ligue trouvée pour",
    dontShowAgain:"Ne plus afficher",
    onb0Title:"Deux Phases de Pronostics", onb0Sub:"Groupes + Meilleur 3e · Éliminatoires",
    onb0Desc:"Phase 1 (avant le 11 Juin) : Classez les 12 groupes et choisissez 8 équipes meilleur 3e. Phase 2 : Les éliminatoires se déverrouillent le 27 Juin après le dernier match de groupes.",
    onb0Next:"Montrez-moi les scores →",
    onb1Title:"Score Exact Hebdomadaire", onb1Sub:"Déverrouillé chaque dimanche à 8h",
    onb1Desc:"Prédisez le score exact des matchs de la semaine pour des points bonus. Nouveaux matchs chaque dimanche.",
    onb1Next:"Inviter des amis →",
    onb2Title:"Affrontez Vos Amis", onb2Sub:"Ligues privées · Prix personnalisés",
    onb2Desc:"Créez un groupe privé, invitez vos amis et fixez vos propres prix. Que le meilleur pronostiqueur gagne.",
    onb2Next:null,
    getStarted:"Commencer",
    rulesDesc1:"L'équipe qui gagne le groupe", rulesDesc2:"L'équipe 2e", rulesDesc3:"L'équipe 3e",
    rulesDescBest3:"Équipe best-3rd qui avance", rulesDescMatch:"Vainqueur du match", rulesDescFinal:"Vainqueur du tournoi",
    boardPassword:"Mot de passe", maxPlayers:"Joueurs max", prizedSlots:"Places primées", prizesLabel:"Prix",
    membersLabel:"Membres", adminLabel:"Admin", remove:"Retirer", saveChanges:"Sauvegarder ✓",
    createBoard2:"Créer Ligue 🏆", boardAdmin:"Admin Ligue", incorrectPassword:"Mot de passe incorrect. Réessayez.",
    joinBoardTitle:"Rejoindre une Ligue", joinedBoards:"Mes Ligues", availableBoards:"Ligues disponibles",
    chooseEmoji:"Choisir un emoji", passwordProtected:"Ligue protégée par mot de passe",
    enterPassword:"Entrer le mot de passe...", rank:"Rang",
    globalBoard:"Global", noBoards:"Aucune ligue trouvée.",
    viewAll2:"Voir tout", members2:"membres", code:"code",
    allMatchesGrp:"Tous les Matchs · Gr.",
    loginCreateAccount:"Créer un compte", loginRecoverAccount:"Récupérer le compte",
    loginCheckEmail:"Vérifiez votre email", loginNewAccount:"Nouveau compte",
    loginNoAccountFor:"Aucun compte trouvé pour",
    emailPlaceholder:"adresse@email.com", passwordMinPlaceholder:"mot de passe (min. 6 caract.)",
    passwordPlaceholder:"mot de passe", nicknamePlaceholder:"Choisissez un pseudo",
    confirmPasswordPlaceholder:"confirmer mot de passe (min. 6 caract.)",
    btnContinue:"Continuer →", btnVerifying:"Vérification...",
    btnCreateAccount:"Créer un compte →", btnCreating:"Création...",
    btnSignUpCreate:"Créer un compte →",
    btnSendReset:"Envoyer le lien →", btnSending:"Envoi...",
    solveCaptcha:"🔒 Résoudre la vérification ci-dessus",
    checkEmailTitle:"Vérifiez votre email !", sentLinkTo:"Nous avons envoyé un lien à",
    clickLinkToContinue:"Cliquez sur le lien pour continuer.",
    linkSentIfExists:"Lien envoyé si l'adresse existe dans le système.",
    forgotPassword:"Mot de passe oublié", newAccountLink:"Nouveau compte",
    errEnterEmail:"Entrez votre adresse email.", errEnterPassword:"Entrez votre mot de passe.",
    errWrongPassword:"Mot de passe incorrect. Réessayez ou réinitialisez-le.",
    errUnexpected:"Erreur inattendue. Réessayez.",
    errChooseNickname:"Choisissez un pseudo.", errNicknameLetter:"Le pseudo doit commencer par une lettre.", errNicknameTaken:"Ce pseudo est déjà utilisé.",
    errPasswordMin6:"Le mot de passe doit comporter au moins 6 caractères.",
    errSendFailed:"Erreur d'envoi. Réessayez.",
    errPasswordsMismatch:"Les mots de passe ne correspondent pas.",
    passwordChanged:"Mot de passe changé !", passwordSet:"Mot de passe défini !",
    redirectingMsg:"Redirection en cours...",
    newPasswordTitle:"Nouveau mot de passe", enterNewPassword:"Entrez votre nouveau mot de passe",
    newPasswordPlaceholder:"Nouveau mot de passe", confirmPasswordPlaceholderField:"Confirmer le mot de passe",
    btnSavePassword:"Enregistrer le mot de passe →", btnSaving:"Enregistrement...",
    setPasswordTitle:"Définir un mot de passe",
    accountCreatedViaLink:"Votre compte a été créé via un lien magique.",
    setPasswordDesc:"Définissez un mot de passe pour vous connecter sans lien la prochaine fois.",
    deleteAccountTitle:"Supprimer le compte",
    deleteDescPt1:"Cela supprimera ", deleteDescEverything:"tout",
    deleteDescPt2:" : pronostics, ligues et scores.",
    deleteDescIrreversiblePt1:"Cette action est ", deleteDescIrreversible:"irréversible",
    enterEmailToConfirm:"Entrez votre email pour confirmer :",
    btnDeleting:"Suppression...", btnDeletePermanently:"Supprimer définitivement",
    leaveLeagueTitle:"Quitter la ligue ?", leaveLeagueBody1:"Vos points et entrées seront supprimés de",
    leaveLeagueConfirm:"Quitter la ligue",
    deleteLeagueTitle:"Supprimer la ligue ?", deleteLeagueBody1:"Cela supprime",
    deleteLeagueBody2:"pour tous les membres de la ligue.", deleteLeagueConfirm:"Supprimer la ligue",
    inviteCodeDetected:"🔑 Code d'invitation détecté — appuyez sur Rejoindre",
    noBoardsFoundFor:"Aucun groupe trouvé pour", tryAnotherName:"Essayez un autre nom ou collez le code d'invitation.",
    loadingPlayers:"Chargement des joueurs...", noPlayersForTeam:"Aucun joueur pour cette équipe.",
    boardsCount:"groupes", footerRanking:"Classement", footerRules:"Règles", footerMore:"Plus",
    memberSinceLabel:"Membre depuis",
    discoverTab:"Découvrir", joinedStatus:"Rejoint",
    leagueNamePlaceholder:"Ex: Ligue du bureau",
    joinedEmptyTitle:"Aucune ligue rejointe", joinedEmptyBody:"Rejoignez une ligue ou créez la vôtre.",
    availableEmptyTitle:"Aucune ligue disponible", availableEmptyBody:"Créez une nouvelle ligue ou entrez un code d'invitation.",
    adminEmptyTitle:"Aucune ligue gérée", adminEmptyBody:"Créez une ligue et elle apparaîtra ici.",
    hiGreeting:"Salut,", manageLeague:"Gérer la Ligue", newLeague:"Nouvelle Ligue",
    nextActionLabel:"Prochaine action", upToDateLabel:"A jour", yourProgress:"Votre progression",
    thisWeekLabel:"Cette semaine", leagueRanking:"Classement ligue", viewRanking:"Voir le classement",
    openScores:"Ouvrir les scores", exactScoresUnlock:"Scores exacts disponibles", scoresLeftThisWeek:"restants cette semaine",
    allDoneTitle:"Vous etes a jour !", allDoneSub:"Revenez apres les matchs",
    continuePredictions:"Continuer", startPredictions:"Commencer", you:"Vous",
    syncingLabel:"sync", tournamentLive:"🏆 tournoi en direct", kickoffLabel:"· coup d'envoi",
    lockedUntilJun27:"Bloqué jusqu'au 27 Juin", specialPick:"Sélection Spéciale",
    winnerTopScorer:"Vainqueur & Meilleur Buteur", reopensJun27:"Rouvre le 27 Juin",
    specialPickSub:"Équipe gagnante +3 · Buteur +3",
    predCardTitle:"Bracket de pronostics", predCardSub:"Chaque bon choix compte",
    exactCardTitle:"Scores exacts", exactCardSub:"Visez parfait — chaque but compte",
    winnerTeam:"Équipe Gagnante", pickTeam:"Choisissez votre équipe",
    topScorer:"Meilleur Buteur", pickPlayer:"Choisissez votre joueur",
    totalLabel:"Total:", availableNow:"Disponible maintenant",
    syncingPredictions:"Synchronisation des pronostics", trophyLabel:"Trophée",
    groupsBestThird:"Groupes + Meilleur 3e", knockoutPhase:"Phase Knockout",
    moreToCome:"· à venir ·", nextTask:"Tâche suivante", continueHere:"CONTINUEZ ICI",
    copyExactScoresTitle:"Copier les scores exacts", copyWinnerTeamTitle:"Copier Équipe Gagnante",
    copyTopScorerTitle:"Copier Meilleur Buteur", copySpecialTitle:"Copier les sélections spéciales",
    copyPredictionsTitle:"Copier les pronostics",
    copyExactScoresSub:"Répliquer les scores exacts de cette semaine dans une autre ligue",
    copyWinnerTeamSub:"Répliquer votre sélection d'équipe gagnante dans une autre ligue",
    copyTopScorerSub:"Répliquer votre sélection de meilleur buteur dans une autre ligue",
    copySpecialSub:"Répliquer votre vainqueur & meilleur buteur dans une autre ligue",
    copyPredsSub:"Répliquer vos pronostics de la phase de groupes dans une autre ligue",
    noOtherBoards:"Aucune autre ligue disponible",
    copiedLabel:"✓ Copié", pasteLabel:"Coller",
    loadingTitle:"Démarrage de Predicto", loadingLeagues:"Chargement des ligues",
    loadingSession:"Préparation de votre session...", loadingBoards:"Synchronisation des ligues, classements et sélections...",
    rulesTabPredictions:"🎯 Pronostics", rulesTabExact:"⚽ Score Exact",
    rulesExampleTitle:"💡 Exemple",
    rulesExamplePred:"Si vous trouvez le bon vainqueur dans 10 matchs de groupes → 10 × 30 = 300 pts. Chaque pronostic correct compte !",
    rulesExampleExact:"Si vous trouvez le score exact dans 3 matchs → 3 × 90 = 270 pts. Résultat correct seulement → 30 pts par match.",
    guideViewNext:"Suivant", guideClose:"Fermer",
    noNotificationsYet:"Aucune notification pour l'instant",
    alreadyPremiumTitle:"Vous êtes déjà Premium pour nous",
    alreadyPremiumBody:"Merci de faire partie de Predicto. Vous bénéficiez de l'expérience complète.",
    best3Short:"Meilleur 3e",
    pickChampionHeader:"Choisir le Champion", pickTopScorerHeader:"Choisir le Meilleur Buteur",
    picksLockedTitle:"Selections bonus bloquees",
    picksLockedBody:"La date limite de la Prediction Bonus etait le 14 Juin. Vos selections actuelles sont sauvegardees.",
    bonusDueJun14:"Delai 14 Juin",
    bonusClosedTitle:"Bonus bloque",
    bonusClosedSub:"Delai passe - selections sauvegardees",
    bonusClosedEmptySub:"Delai passe - aucune selection sauvegardee",
    championPickLabel:"Sélection Champion", chooseWinner:"Choisissez votre vainqueur",
    selectedLabel:"sélectionné", tapTeamBelow:"Appuyez sur une équipe ci-dessous",
    clearLabel:"Effacer", allTeams:"Toutes les équipes",
    topScorerPickLabel:"Sélection Meilleur Buteur", startWithTeam:"Commencez par une équipe",
    pickTeamDots:"Choisissez une équipe...", pickTopScorerSub:"choisissez le meilleur buteur",
    topScorerSaved:"Meilleur buteur sauvegardé", winnerTeamSaved:"Équipe gagnante sauvegardée",
    winnerTeamCleared:"Équipe gagnante effacée", changeLabel:"Changer",
    pickChampionPopup:"🏆 Choisir le Champion", pickTeamPopup:"👕 Choisir l'Équipe",
    cdDayAbbr:"j", cdHourAbbr:"h", cdMinAbbr:"m",
    bonusPrediction:"Prédiction Bonus", bonusDesc:"Gagnez des points supplémentaires — vos choix définissent le podium final",
    runnerUpPickLabel:"Finaliste (2e place)", chooseRunnerUp:"Choisissez votre finaliste",
    runnerUpSaved:"Finaliste sauvegardé", runnerUpCleared:"Finaliste effacé",
    openBonusLabel:"Choisir", pickRunnerUpHeader:"Choisir le Finaliste",
  },
};
const LangCtx = React.createContext("en");
const useLang = () => React.useContext(LangCtx);
const UserCtx = React.createContext(null);
const useUser = () => React.useContext(UserCtx);
const useDisplayName = () => {
  const u = React.useContext(UserCtx);
  return u?.user_metadata?.full_name || u?.email?.split("@")[0] || "—";
};
const useInitials = () => {
  const name = useDisplayName();
  return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
};

// ECHIPE_DATA, FLAGS, TEAM_COLORS — importate din ./data/worldcup2026.js

// Clasamente reale — încărcate din DB via get_group_standings()
// Mutate din constante în context React (vezi ScoringContext + useEffect în App)
const REAL_GROUP_STATS = {};
const REAL_BEST3 = [];
const GROUP_STAGE_FINISHED = false;

// Week unlock logic — Sunday after 20:00
const now = new Date();
const june = (d) => new Date(Date.UTC(2026, 5, d, 12, 0, 0)); // 08:00 ET = 12:00 UTC
const WEEK_UNLOCKED = {
  8:  true,
  15: now >= june(14),
  22: now >= june(21),
  29: now >= june(28),
};
// Returns the current day in tournament encoding.
// May N = N-31 (day -6..0 for May 25-31), June N = N, July N = N+30.
// Match times in worldcup2026.js are in ET (UTC-4 in summer / EDT)
const ET_OFFSET_MS = 4 * 3600_000;

// Convert ET match time to user's local time for display
const getLocalKickoffDay = (kickoffUtc, fallback) => {
  if (!kickoffUtc) return fallback;
  return new Date(kickoffUtc).getDate();
};

const encodeCalendarDay = (date) => {
  const y = date.getFullYear();
  const mo = date.getMonth();
  const d = date.getDate();
  if (y === 2026 && mo === 4) return d - 31;
  if (y === 2026 && mo === 5) return d;
  if (y === 2026 && mo === 6) return d + 30;
  return d;
};

const getMatchDisplayDay = (match, fallbackDay) =>
  match?.kickoffUtc ? encodeCalendarDay(new Date(match.kickoffUtc)) : fallbackDay;

const getMatchKey = (match, day, idx) =>
  match?.matchKey || `${day}-${idx}`;

const getDisplayCalendarEvents = () => {
  const byDay = new Map();
  CALENDAR_EVENTS.forEach(event => {
    event.matches.forEach((match, idx) => {
      const displayDay = getMatchDisplayDay(match, event.day);
      if (!byDay.has(displayDay)) byDay.set(displayDay, []);
      byDay.get(displayDay).push({
        ...match,
        matchKey: getMatchKey(match, event.day, idx),
        sourceDay: event.day,
        sourceIdx: idx,
      });
    });
  });
  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, matches]) => ({
      day,
      matches: matches.sort((a, b) => {
        const ta = a.kickoffUtc ? Date.parse(a.kickoffUtc) : 0;
        const tb = b.kickoffUtc ? Date.parse(b.kickoffUtc) : 0;
        return ta - tb;
      }),
    }));
};

const fmtMatchTime = (day, timeET, kickoffUtc=null) => {
  if (kickoffUtc) {
    return new Date(kickoffUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (!day || !timeET) return timeET || '';
  const month = day <= 30 ? 5 : 6;
  const dom   = day <= 30 ? day : day - 30;
  const [h, min] = (timeET || '23:00').split(':').map(Number);
  const d = new Date(Date.UTC(2026, month, dom, h + 4, min));
  if (isNaN(d.getTime())) return timeET;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getRealTournamentDay = () => {
  // Use ET date so day boundary aligns with the match schedule timezone
  const et = new Date(Date.now() - ET_OFFSET_MS);
  const y = et.getUTCFullYear(), mo = et.getUTCMonth(), d = et.getUTCDate();
  if (y < 2026 || (y === 2026 && mo < 4)) return -99;
  if (y === 2026 && mo === 4) return d - 31;
  if (y === 2026 && mo === 5) return d;
  if (y === 2026 && mo === 6) return d + 30;
  return 999;
};

const getLocalTournamentDay = () => encodeCalendarDay(new Date());

const getBonusPickNow = (simDay=null, simHour=12, simMin=0) =>
  simDay ? new Date(Date.UTC(2026, 5, simDay, (simHour || 0) + 4, simMin || 0, 0)) : new Date();

let _bonusDeadlineMs = Date.UTC(2026, 5, 15, 3, 59, 59);
const getBonusPickDeadline = () => new Date(_bonusDeadlineMs);

const isBonusPickLocked = (simDay=null, simHour=12, simMin=0) =>
  getBonusPickNow(simDay, simHour, simMin) > getBonusPickDeadline();

const isMatchPast = (matchDay, matchTime, simDay=null, simHour=12, kickoffUtc=null) => {
  const mHour = parseInt((matchTime||"23:00").split(":")[0]);
  if (simDay) {
    const nowHour = simHour || 0;
    return matchDay < simDay || (matchDay === simDay && mHour <= nowHour);
  }
  if (kickoffUtc) return Date.now() >= new Date(kickoffUtc).getTime();
  const matchMonth = matchDay <= 30 ? 5 : 6;
  const matchDom = matchDay <= 30 ? matchDay : matchDay - 30;
  return Date.now() >= Date.UTC(2026, matchMonth, matchDom, mHour + 4, 0, 0);
};

const isWeekUnlocked = (day, simDay=null, simHour=12, simMin=0) => {
  // Convert July days: day 36+ = July week
  const june = (d) => new Date(Date.UTC(2026, 5, d, 12, 0, 0)); // 08:00 ET = 12:00 UTC
  const july = (d) => new Date(Date.UTC(2026, 6, d, 12, 0, 0));
  if(simDay) {
    const simDate = new Date(Date.UTC(2026,5,simDay,(simHour||0)+4,simMin||0,0));
    if(day >= 43) return simDate >= july(12);   // Final week
    if(day >= 36) return simDate >= july(5);    // QF/SF week
    if(day >= 28) return simDate >= june(28);   // R32 week (starts Jun 28)
    if(day >= 22) return simDate >= june(21);
    if(day >= 15) return simDate >= june(14);
    return true;
  }
  const now2 = new Date();
  if(day >= 43) return now2 >= july(12);
  if(day >= 36) return now2 >= july(5);
  if(day >= 28) return WEEK_UNLOCKED[29];
  if(day >= 22) return WEEK_UNLOCKED[22];
  if(day >= 15) return WEEK_UNLOCKED[15];
  return WEEK_UNLOCKED[8];
};


// Compute live scores dynamically based on sim time
// In production replace with real API
const computeLiveScores = (simDay=null, simHour=12, simMin=0) => {
  const scores = {};
  // Match duration: 90+5 mins = ~105 min = ~1h45m
  const MATCH_DURATION_H = 2; // hours after kickoff = finished
  CALENDAR_EVENTS.forEach(e => {
    e.matches.forEach((m, idx) => {
      const key = m.matchKey || `${e.day}-${idx}`;
      const kickH = parseInt((m.time||"23:00").split(":")[0]);
      const kickM = parseInt((m.time||"00:00").split(":")[1]||0);
      let nowDay, nowH, nowM;
      if (simDay) {
        nowDay = simDay; nowH = simHour; nowM = simMin;
      } else {
        const matchStartUTC = m.kickoffUtc
          ? new Date(m.kickoffUtc).getTime()
          : (() => { const mm=e.day<=30?5:6,dd=e.day<=30?e.day:e.day-30; return Date.UTC(2026,mm,dd,kickH+4,kickM,0); })();
        const now = Date.now();
        if (now < matchStartUTC) { scores[key] = {status:"NS"}; return; }
        const elapsedMins = Math.floor((now - matchStartUTC) / 60000);
        if (elapsedMins > 115) { scores[key] = {status:"FT",home:null,away:null}; return; }
        scores[key] = {status:"LIVE", home:0, away:0, min: Math.min(90, elapsedMins)};
        return;
      }
      if(e.day > nowDay) { scores[key] = {status:"NS"}; return; }
      if(e.day < nowDay) {
        // Use mock final scores if available
        scores[key] = {status:"FT",home:null,away:null};
        return;
      }
      // Same day (sim mode)
      const startMins = kickH*60 + kickM;
      const nowMins   = nowH*60 + nowM;
      if(nowMins < startMins)       { scores[key] = {status:"NS"}; return; }
      if(nowMins > startMins + 115) {
        scores[key] = {status:"FT",home:null,away:null};
        return;
      }
      // Currently live — score 0-0 until real API provides it
      scores[key] = {status:"LIVE", home:0, away:0, min: Math.min(90, nowMins - startMins)};
    });
  });
  return scores;
};
const LIVE_SCORES_DEFAULT = {};
let LIVE_SCORES = LIVE_SCORES_DEFAULT;

// Hook: merge scoruri reale din Supabase peste scoruri simulate.
// DB suprascrie simularea; dacă DB e gol (înainte de turneu), simularea rămâne.
function useLiveScores(simDay, simHour, simMin) {
  const [dbScores, setDbScores] = useState({});

  useEffect(() => {
    loadLiveScores().then(scores => {
      if (Object.keys(scores).length > 0) setDbScores(scores);
    });

    const channel = subscribeLiveScores((payload) => {
      const row = payload.new;
      if (!row) return;
      setDbScores(prev => ({
        ...prev,
        [row.match_key]: {
          status:  row.status,
          home:    row.regular_time_home_score,
          away:    row.regular_time_away_score,
          homePen: row.penalty_home_score,
          awayPen: row.penalty_away_score,
          min:     row.api_minute,
          utcDate: row.utc_date ?? null,
        },
      }));
    });

    return () => { channel.unsubscribe(); };
  }, []);

  const computed = simDay != null ? computeLiveScores(simDay, simHour, simMin) : {};
  return { ...computed, ...dbScores };
}

// Day encoding: May N = N-31 (−6..0), June N = N (1-30), July N = N+30 (31-61)
const toLabel = (d) => d <= 0 ? `${d+31} May` : d > 30 ? `${d-30} Jul` : `${d} Jun`;

function useCountdown() {
  const target = new Date("2026-06-11T22:00:00Z"); // 18:00 ET = 22:00 UTC
  const [diff, setDiff] = useState(target - new Date());
  useEffect(() => { const t = setInterval(() => setDiff(target - new Date()), 1000); return () => clearInterval(t); }, []);
  return { d:Math.max(0,Math.floor(diff/86400000)), h:Math.max(0,Math.floor((diff%86400000)/3600000)), m:Math.max(0,Math.floor((diff%3600000)/60000)), s:Math.max(0,Math.floor((diff%60000)/1000)) };
}

function CalendarSlider() {
  const [selDay, setSelDay] = useState(null);
  const [viewMonth, setViewMonth] = useState(0); // 0=June, 1=July
  const mm = {};
  CALENDAR_EVENTS.forEach(e => { mm[e.day] = e.matches; });

  // June 2026: starts Monday (startDow=0), 30 days
  // July 2026: starts Wednesday (startDow=2), 31 days
  // day encoding: June=1-30, July=31-61 (31=July 1, 32=July 2...)
  const months = [
    { name:"June 2026", days:30, startDow:0, offset:0 },
    { name:"July 2026", days:31, startDow:2, offset:30 },
  ];
  const cur = months[viewMonth];
  const dl = ["L","M","M","J","V","S","D"];

  // Build grid: blanks + days
  const blanks = Array(cur.startDow).fill(null);
  const dayNums = Array.from({length:cur.days}, (_,i) => i+1);
  const cells = [...blanks, ...dayNums];
  // Pad to full weeks
  while(cells.length % 7 !== 0) cells.push(null);

  const encodeDay = (d) => d + cur.offset; // encoded day for lookup
  const sm = selDay ? mm[selDay] : null;

  return (
    <div style={{marginBottom:14}}>
      {/* Month nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={()=>viewMonth>0&&setViewMonth(0)}
          style={{width:30,height:30,borderRadius:"50%",border:"none",
            background:viewMonth>0?BG:"transparent",boxShadow:viewMonth>0?SHADOW_OUT:"none",
            cursor:viewMonth>0?"pointer":"default",fontSize:16,
            color:viewMonth>0?DARK:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:14,fontWeight:700,color:DARK,margin:0}}>{cur.name}</p>
          <span style={{fontSize:12,color:NAVY,fontWeight:700}}>Predicto</span>
        </div>
        <button onClick={()=>viewMonth<1&&setViewMonth(1)}
          style={{width:30,height:30,borderRadius:"50%",border:"none",
            background:viewMonth<1?BG:"transparent",boxShadow:viewMonth<1?SHADOW_OUT:"none",
            cursor:viewMonth<1?"pointer":"default",fontSize:16,
            color:viewMonth<1?DARK:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
      </div>

      {/* Day labels */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {dl.map((d,i)=>(
          <div key={i} style={{textAlign:"center",fontSize:12,fontWeight:700,
            color:i===6?RED:"#bbb",padding:"2px 0"}}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((day,i)=>{
          if(!day) return <div key={i}/>;
          const enc = encodeDay(day);
          const has = !!mm[enc];
          const isSel = selDay===enc;
          const isStart = enc===11;
          const locked = has && !isWeekUnlocked(enc);
          const isSun = i%7===6;

          let bg="transparent", tc=isSun?"#e88":"#555", fw=400, border="none";
          if(isSel){bg=`linear-gradient(135deg,${NAVY}cc,#001840cc)`;tc="#fff";fw=800;}
          else if(isStart){bg:"#E8F0FF";tc=NAVY;fw=700;border=`1px solid ${NAVY}`;}
          else if(has&&!locked){tc=NAVY;fw=700;}

          return (
            <div key={i} onClick={()=>has&&setSelDay(isSel?null:enc)}
              style={{position:"relative",display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",
                borderRadius:8,padding:"6px 2px",
                cursor:has?"pointer":"default",
                background:isSel?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:isStart?"#E8F0FF":"transparent",
                border:isStart&&!isSel?`1px solid ${NAVY}`:"none",
                opacity:locked?0.45:1,
                transition:"all 0.15s"}}>
              <span style={{fontSize:12,fontWeight:fw,color:tc,lineHeight:1}}>{day}</span>
              {has&&!isSel&&!locked&&(
                <div style={{width:5,height:5,borderRadius:"50%",
                  background:`linear-gradient(135deg,${RED},${GREEN})`,marginTop:2}}/>
              )}
              {has&&locked&&!isSel&&(
                <span style={{fontSize:11,marginTop:1}}>🔒</span>
              )}
              {isStart&&!isSel&&(
                <div style={{position:"absolute",top:-5,right:-2,background:RED,
                  borderRadius:3,padding:"1px 3px",fontSize:6,fontWeight:800,color:"#fff"}}>
                  START
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Match popup — fixed bottom sheet */}
      {sm&&(
        <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}
          onClick={()=>setSelDay(null)}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)"}}/>
          <div onClick={e=>e.stopPropagation()}
            style={{position:"relative",background:BG,borderRadius:"20px 20px 0 0",
              maxHeight:"60%",display:"flex",flexDirection:"column",zIndex:1}}
            onTouchStart={e=>{ e.currentTarget._y0=e.touches[0].clientY; }}
            onTouchMove={e=>{
              const dy=e.touches[0].clientY-e.currentTarget._y0;
              if(dy>0){ e.currentTarget.style.transform=`translateY(${dy}px)`; e.currentTarget.style.transition="none"; }
            }}
            onTouchEnd={e=>{
              const dy=e.changedTouches[0].clientY-e.currentTarget._y0;
              e.currentTarget.style.transition="transform 0.3s";
              e.currentTarget.style.transform="";
              if(dy>80) setSelDay(null);
            }}>
            {/* Handle */}
            <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0",flexShrink:0}}>
              <div style={{width:36,height:4,borderRadius:2,background:"#ddd"}}/>
            </div>
            {/* Header */}
            <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"10px 16px",margin:"10px 0 0",flexShrink:0}}>
              <span style={{fontSize:13,fontWeight:800,color:"#fff"}}>
                {selDay<=30?selDay:selDay-30} {selDay<=30?"June":"July"} · {sm.length} matches
              </span>
            </div>
            {/* Matches */}
            <div style={{overflowY:"auto",flex:1}}>
              {sm.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",padding:"10px 16px",
                  borderBottom:i<sm.length-1?"1px solid rgba(0,0,0,0.06)":"none",gap:8,background:"#fff"}}>
                  <span style={{fontSize:11,color:"#aaa",fontWeight:600,width:36}}>{fmtMatchTime(selDay, m.time, m.kickoffUtc)}</span>
                  <span style={{fontSize:12,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,
                    color:"#fff",borderRadius:5,padding:"2px 5px",fontWeight:700,flexShrink:0}}>{m.group}</span>
                  <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    <span style={{fontSize:16}}>{m.homeFlag}</span>
                    <span style={{fontSize:11,fontWeight:600,color:DARK}}>{m.home.length>8?m.home.split(" ")[0]:m.home}</span>
                    <span style={{fontSize:12,color:"#ccc"}}>vs</span>
                    <span style={{fontSize:11,fontWeight:600,color:DARK}}>{m.away.length>8?m.away.split(" ")[0]:m.away}</span>
                    <span style={{fontSize:16}}>{m.awayFlag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function KOTeamRow({ team, pick, pairId, setKnockoutPicks }) {
  const flag = FLAGS[team] || "🏳";
  const selected = pick === team;
  const ph = !team||team.includes("W")||team.includes("L")||team.includes("3rd")||team.includes("Best")||team.includes("SF")||team.includes("QF")||team.includes("R16")||team.includes("R32")||team.includes("°");
  const handleSelect = () => {
    if(!ph) setKnockoutPicks(k => ({...k, [pairId]: k[pairId]===team ? null : team}));
  };
  return (
    <div
      onClick={handleSelect}
      style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",
        cursor:ph?"default":"pointer",
        background:selected?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"transparent",
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
        {selected&&<span style={{fontSize:12,color:"#fff",fontWeight:900}}>✓</span>}
      </div>
    </div>
  );
}

function KnockoutTab({ knockoutPicks, setKnockoutPicks, best3picks, groupRank, onComplete }) {
  const lang = useLang();
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
          <p style={{fontSize:12,color:"#D4820A",fontWeight:800,textTransform:"uppercase",letterSpacing:1,margin:"0 0 3px"}}>{T[lang].semiFinalsDone}</p>
          <h2 style={{fontSize:17,fontWeight:900,color:DARK,margin:"0 0 16px"}}>{T[lang].theFinalsAwait}</h2>

          {/* Finala mică */}
          <div style={{width:"100%",background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:10}}>
            <div style={{background:"rgba(0,0,0,0.04)",padding:"6px 14px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
              <span style={{fontSize:12,fontWeight:800,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>🥉 Third Place</span>
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
                  <span style={{fontSize:12,color:"#aaa"}}>perdant SF{i+1}</span>
                </div>
              );
            })}
          </div>

          {/* Finala mare */}
          <div style={{width:"100%",background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:24}}>
            <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"6px 14px"}}>
              <span style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:1}}>🏆 Grand Final · World Champion</span>
            </div>
            {[0,1].map(i=>{
              const sfWinner = knockoutPicks[rounds[2].pairs[i].id];
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                  borderBottom:i===0?"1px solid rgba(0,0,0,0.05)":"none"}}>
                  <span style={{fontSize:20}}>{sfWinner?FLAGS[sfWinner]||"🏳":"❓"}</span>
                  <span style={{fontSize:13,fontWeight:600,color:DARK,flex:1}}>{sfWinner||"SF Winner"}</span>
                  <span style={{fontSize:12,color:"#aaa"}}>SF{i+1} winner</span>
                </div>
              );
            })}
          </div>

          <div style={{display:"flex",gap:8,width:"100%"}}>
            <button onClick={()=>setShowTransition(false)}
              style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
                background:BG,boxShadow:SHADOW_OUT,fontSize:12,fontWeight:700,cursor:"pointer",color:"#888"}}>
              ← Back
            </button>
            <button onClick={()=>changeRound(koRound+1)}
              style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
                background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,color:"#fff",
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
        <span style={{fontSize:12,fontWeight:team?700:400,color:team?DARK:"#bbb",
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
          <p style={{fontSize:12,color:GREEN,fontWeight:800,textTransform:"uppercase",
            letterSpacing:1,margin:"0 0 3px"}}>{cur.label} complet</p>
          <h2 style={{fontSize:17,fontWeight:900,color:DARK,margin:"0 0 2px"}}>{T[lang].roadToFinal}</h2>
          <p style={{fontSize:11,color:"#aaa",margin:0}}>{T[lang].yourPicksAdvance}</p>
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
            ← Back
          </button>
          <button onClick={()=>changeRound(koRound+1)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,color:"#fff",
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
                background:koRound===i?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:BG,
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
              <button key={i} onClick={()=>setGroupIdx(i)} style={{
                width:gi===i?22:8,height:8,borderRadius:4,cursor:"pointer",
                transition:"all 0.3s",
                background:gi===i?NAVY:done?GREEN:"#ddd",
                border:"none",padding:0,flexShrink:0,
              }}/>
            );
          })}
        </div>

        {/* Two matches + bracket + vs card */}
        {cur.id==="final" ? (
          <>
            <p style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 6px"}}>🥉 3rd Place</p>
            <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:10}}>
              <KOTeamRow team={THIRD.t1} pick={knockoutPicks[THIRD.id]} pairId={THIRD.id} setKnockoutPicks={setKnockoutPicks}/>
              <div style={{height:1,background:"rgba(0,0,0,0.06)",margin:"0 14px"}}/>
              <KOTeamRow team={THIRD.t2} pick={knockoutPicks[THIRD.id]} pairId={THIRD.id} setKnockoutPicks={setKnockoutPicks}/>
            </div>
            <p style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"10px 0 6px"}}>🏆 Final</p>
            <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
              <KOTeamRow team={FINAL.t1} pick={knockoutPicks[FINAL.id]} pairId={FINAL.id} setKnockoutPicks={setKnockoutPicks}/>
              <div style={{height:1,background:"rgba(0,0,0,0.06)",margin:"0 14px"}}/>
              <KOTeamRow team={FINAL.t2} pick={knockoutPicks[FINAL.id]} pairId={FINAL.id} setKnockoutPicks={setKnockoutPicks}/>
            </div>
            {knockoutPicks["f_0"]&&(
              <div style={{background:"linear-gradient(135deg,#D4820A,#F0A020)",borderRadius:14,padding:"16px",textAlign:"center",boxShadow:"0 6px 20px rgba(212,130,10,0.4)",marginBottom:14}}>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.8)",margin:"0 0 4px",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>🏆 World Champion</p>
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
                background:pickA&&pickB?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:BG,
                boxShadow:SHADOW_OUT,display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all 0.25s"}}>
                <span style={{fontSize:18,opacity:pickA?1:0.2}}>{pickA?FLAGS[pickA]||"🏳":"❓"}</span>
                <span style={{fontSize:11,fontWeight:700,color:pickA&&pickB?"rgba(255,255,255,0.45)":"#ddd"}}>vs</span>
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
          ← Back
        </button>
        {!isLastGroup ? (
          <button onClick={()=>setGroupIdx(gi+1)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:groupDone?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"#e8e8e8",
              color:groupDone?"#fff":"#bbb",fontSize:12,fontWeight:700,
              cursor:groupDone?"pointer":"default",
              boxShadow:groupDone?"0 4px 12px rgba(0,32,91,0.3)":"none",transition:"all 0.2s"}}>
            Matches {gi*2+3}-{gi*2+4} →
          </button>
        ) : !isLastRound ? (
          <button onClick={()=>roundComplete&&setShowTransition(true)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:roundComplete?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"#e8e8e8",
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
  const lang = useLang();
  const GRUPE_LIST = ["A","B"];
  const [gIdx, setGIdx] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [done, setDone] = useState(false);
  const touchStartX = useRef(null);
  const rankingListRef = useRef(null);
  useEffect(() => {
    const el = rankingListRef.current;
    if (!el) return;
    const prevent = (e) => { if (dragging !== null) e.preventDefault(); };
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, [dragging]);

  const allComplete = GRUPE_LIST.every(g=>[1,2,3,4].every(p=>!!(groupRank[g]||{})[p]));
  const activeGroup = GRUPE_LIST[gIdx];
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
      <h2 style={{fontSize:22,fontWeight:900,color:DARK,margin:"0 0 8px"}}>{T[lang].groupStageDone}</h2>
      <p style={{fontSize:14,color:"#888",margin:"0 0 24px",lineHeight:1.5}}>{T[lang].allGroupsPredicted}</p>
      <div style={{width:"100%",background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:24}}>
        {GRUPE_LIST.map((g,i)=>{
          const r=groupRank[g]||{};
          return (
            <div key={g} style={{padding:"12px 16px",borderBottom:i<GRUPE_LIST.length-1?"1px solid rgba(0,0,0,0.06)":"none"}}>
              <p style={{fontSize:11,fontWeight:800,color:"#aaa",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>{T[lang].group} {g}</p>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4].map(pos=>(
                  <div key={pos} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:pos<=2?"rgba(0,32,91,0.05)":"transparent",borderRadius:8,padding:"6px 4px"}}>
                    <span style={{fontSize:10,fontWeight:700,color:pos===1?GREEN:pos===2?NAVY:"#ccc",textTransform:"uppercase"}}>{pos===1?"1st":pos===2?"2nd":pos===3?"3rd":"4th"}</span>
                    <span style={{fontSize:18}}>{FLAGS[r[pos]]||"?"}</span>
                    <span style={{fontSize:11,fontWeight:600,color:DARK}}>{r[pos]?.substring(0,3)||"?"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:8,width:"100%"}}>
        <button onClick={()=>setDone(false)}
          style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:BG,boxShadow:SHADOW_OUT,fontSize:12,fontWeight:700,cursor:"pointer",color:"#888"}}>{T[lang].modifyBtn}</button>
        <button onClick={onComplete}
          style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,32,91,0.3)"}}>{T[lang].bestThirdBtn}</button>
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
        <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:16,fontWeight:900,color:"#fff",letterSpacing:1}}>GROUP {activeGrupa}</span>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>{T[lang].tapToRank}</span>
        </div>
        <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"10px 10px",display:"flex",justifyContent:"space-around",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          {teams.map(t=>{
            const pos=Object.entries(rank).find(([,v])=>v===t)?.[0];
            const isRanked=!!pos;
            return (
              <button key={t} onClick={()=>handleTeamClick(t)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",transition:"all 0.2s",opacity:isRanked?0.35:1,border:"none",background:"transparent",WebkitTapHighlightColor:"transparent",padding:0,fontFamily:"inherit"}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:isRanked?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.12)",border:isRanked?"2px solid rgba(255,255,255,0.12)":"2px solid rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,transition:"all 0.2s"}}>
                  {FLAGS[t]}
                </div>
                <span style={{fontSize:11,fontWeight:800,color:isRanked?"rgba(255,255,255,0.25)":"#fff",letterSpacing:0.3}}>{t.substring(0,3).toUpperCase()}</span>
              </button>
            );
          })}
        </div>
        <div ref={rankingListRef} style={{background:BG}}>
          <div style={{padding:"6px 14px 3px"}}>
            <span style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>{T[lang].predictedRank}</span>
          </div>
          {[1,2,3,4].map(pos=>{
            const team=rank[pos];
            const isDraggingThis=dragging===pos;
            const isDropTarget=dragOver===pos&&dragging!==null&&dragging!==pos;

            const onTSR = e => { if(!team) return; e.stopPropagation(); setDragging(pos); };
            const onTMR = e => {
              if(dragging===null) return;
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
                <span style={{fontSize:12,fontWeight:800,color:rankColors[pos-1],width:18,textAlign:"center"}}>#{pos}</span>
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
            background:isCurrentComplete?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"#e8e8e8",
            color:isCurrentComplete?"#fff":"#bbb",fontSize:12,fontWeight:700,
            cursor:isCurrentComplete?"pointer":"default",
            boxShadow:isCurrentComplete?"0 4px 12px rgba(0,32,91,0.3)":"none",transition:"all 0.2s"}}>
          {gIdx<GRUPE_LIST.length-1?"Group "+GRUPE_LIST[gIdx+1]+" →":"Done ✓"}
        </button>
      </div>
    </div>
  );
}

// ── INSTANT PICK SCREEN ───────────────────────────────────────────────────────

const INTERACTIVE_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"]; // all 12 groups user ranks manually
const isGroupRankingComplete = (ranking) => {
  if (Array.isArray(ranking)) return ranking.length >= 4 && ranking.slice(0, 4).every(Boolean);
  if (ranking && typeof ranking === "object") return [1, 2, 3, 4].every(pos => !!ranking[pos]);
  return false;
};
const getPredictionProgress = (state = {}) => {
  const groupRankings = state.groupRankings || {};
  const groupsDone = INTERACTIVE_GROUPS.filter(g => isGroupRankingComplete(groupRankings[g])).length;
  const best3Done = (state.best3 || []).filter(Boolean).length >= 8;
  const total = INTERACTIVE_GROUPS.length + 1;
  const done = Math.min(total, groupsDone + (best3Done ? 1 : 0));
  return { done, total, groupsDone, best3Done, complete: done === total };
};
const ALL_GROUP_IDS = Object.keys(ALL_GROUPS_DATA);

// ── PREDICTION SCORING ────────────────────────────────────────────────────────
const DEFAULT_PRED_SCORING = {
  group1st: 20, group2nd: 15, group3rd: 10,
  best3: 5,
  r32: 10, r16: 20, qf: 40, sf: 60, final: 100,
};
const DEFAULT_EXACT_SCORING = {
  group_result: 30, group_exact: 90,
  r32_result: 35, r32_exact_bonus: 15,
  r16_result: 40, r16_exact_bonus: 20,
  qf_result: 60, qf_exact_bonus: 30,
  sf_result: 90, sf_exact_bonus: 40,
  final_result: 120, final_exact_bonus: 50,
};
const computePredMax = (s) => {
  const groups = INTERACTIVE_GROUPS.length * (s.group1st + s.group2nd + s.group3rd);
  const best3  = 8  * s.best3;
  const r32    = 16 * s.r32;
  const r16    = 8  * s.r16;
  const qf     = 4  * s.qf;
  const sf     = 2  * s.sf;
  const fin    = 1  * s.final;
  return { groups, best3, r32, r16, qf, sf, final: fin, total: groups + best3 + r32 + r16 + qf + sf + fin };
};
const ScoringContext = React.createContext({ pred: DEFAULT_PRED_SCORING, exact: DEFAULT_EXACT_SCORING, predMax: computePredMax(DEFAULT_PRED_SCORING) });
const useScoringRules = () => React.useContext(ScoringContext);

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
// ── RANKING BEST3 DUPĂ REGULILE FIFA ─────────────────────────────────────────
// Criterii oficiale FIFA 2026 pentru cele 8 best 3rd-place teams care avansează:
// 1. Puncte  2. Diferență goluri  3. Goluri marcate  4. Victorii  5. Fair play  6. Ranking FIFA
function rankBest3ByFifa(groups, standings, stats) {
  const thirds = groups.map(g => (standings[g]||[])[2]).filter(Boolean);
  if(!thirds.length) return [];
  const hasStats = Object.keys(stats).length > 0;
  if(hasStats) {
    return [...thirds]
      .sort((a, b) => {
        const sa = stats[a] || { pts:0, gf:0, ga:0, w:0 };
        const sb = stats[b] || { pts:0, gf:0, ga:0, w:0 };
        if(sb.pts !== sa.pts) return sb.pts - sa.pts;
        const gdA = sa.gf - sa.ga, gdB = sb.gf - sb.ga;
        if(gdB !== gdA) return gdB - gdA;
        if(sb.gf !== sa.gf) return sb.gf - sa.gf;
        if(sb.w !== sa.w) return sb.w - sa.w;
        return 0;
      })
      .slice(0, 8);
  }
  return thirds.slice(0, 8);
}

// KO matchups generated dynamically based on group standings
const KO_MATCHUP_TEMPLATE = [
  {id:"r16_0",round:"R16"},{id:"r16_1",round:"R16"},{id:"r16_2",round:"R16"},{id:"r16_3",round:"R16"},
  {id:"r16_4",round:"R16"},{id:"r16_5",round:"R16"},{id:"r16_6",round:"R16"},{id:"r16_7",round:"R16"},
  {id:"qf_0",round:"QF"},{id:"qf_1",round:"QF"},{id:"qf_2",round:"QF"},{id:"qf_3",round:"QF"},
  {id:"sf_0",round:"SF"},{id:"sf_1",round:"SF"},
  {id:"final",round:"Final"},
];


function ConfettiCanvas({ colors, active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(animRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const SHAPES = ["rect","circle","tri"];
    particlesRef.current = Array.from({length:120},()=>({
      x: Math.random()*W,
      y: -20 - Math.random()*H*0.4,
      w: 7 + Math.random()*9,
      h: 4 + Math.random()*6,
      rot: Math.random()*360,
      rotV: (Math.random()-0.5)*8,
      vx: (Math.random()-0.5)*3,
      vy: 2 + Math.random()*5,
      color: colors[Math.floor(Math.random()*colors.length)],
      shape: SHAPES[Math.floor(Math.random()*SHAPES.length)],
      alpha: 0.9+Math.random()*0.1,
    }));
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      particlesRef.current.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle = p.color;
        if(p.shape==="rect"){ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);}
        else if(p.shape==="circle"){ctx.beginPath();ctx.arc(0,0,p.w/2,0,Math.PI*2);ctx.fill();}
        else{ctx.beginPath();ctx.moveTo(0,-p.h);ctx.lineTo(p.w/2,p.h/2);ctx.lineTo(-p.w/2,p.h/2);ctx.closePath();ctx.fill();}
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vy += 0.07;
        p.alpha -= 0.003;
        if(p.y > H+20 || p.alpha <= 0){
          p.y = -20; p.x = Math.random()*W; p.vy = 2+Math.random()*4; p.alpha = 0.9;
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, colors.join()]);

  return (
    <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:10}}/>
  );
}

// ── REALISTIC FLAG RENDERER ───────────────────────────────────────────────────
// Draws each flag as real colored stripes/shapes, not just a gradient blob
function FlagBg({ team, style }) {
  const s = { position:"absolute", inset:0, ...style };
  // Each flag is a set of absolutely-positioned divs recreating real flag bands
  const renders = {
    "Brazil": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#009C3B"}}/>
        <div style={{position:"absolute",top:"20%",left:"10%",right:"10%",bottom:"20%",
          background:"#FFDF00",clipPath:"polygon(50% 0%,100% 50%,50% 100%,0% 50%)"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",
          width:"32%",height:"32%",transform:"translate(-50%,-50%)",
          background:"#002776",borderRadius:"50%"}}/>
        <div style={{position:"absolute",inset:0,
          background:"repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 6px)"}}/>
      </div>
    ),
    "France": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#002395"}}/>
          <div style={{flex:1,background:"#EDEDED"}}/>
          <div style={{flex:1,background:"#ED2939"}}/>
        </div>
        <div style={{position:"absolute",inset:0,
          background:"repeating-linear-gradient(90deg,rgba(0,0,0,0.03) 0px,rgba(0,0,0,0.03) 1px,transparent 1px,transparent 6px)"}}/>
      </div>
    ),
    "Argentina": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#74ACDF"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#74ACDF"}}/>
        </div>
      </div>
    ),
    "England": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#fff"}}/>
        <div style={{position:"absolute",top:0,bottom:0,left:"calc(50% - 6%)",width:"12%",background:"#CF081F"}}/>
        <div style={{position:"absolute",left:0,right:0,top:"calc(50% - 10%)",height:"20%",background:"#CF081F"}}/>
      </div>
    ),
    "Germany": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#000"}}/>
          <div style={{flex:1,background:"#DD0000"}}/>
          <div style={{flex:1,background:"#FFCE00"}}/>
        </div>
      </div>
    ),
    "Spain": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#AA151B"}}/>
          <div style={{flex:2,background:"#F1BF00"}}/>
          <div style={{flex:1,background:"#AA151B"}}/>
        </div>
      </div>
    ),
    "Portugal": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{width:"40%",background:"#006600"}}/>
          <div style={{flex:1,background:"#FF0000"}}/>
        </div>
      </div>
    ),
    "Netherlands": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#AE1C28"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#21468B"}}/>
        </div>
      </div>
    ),
    "Croatia": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#171796"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#FF0000"}}/>
        </div>
      </div>
    ),
    "Mexico": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#006847"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#CE1126"}}/>
        </div>
      </div>
    ),
    "USA": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#B22234"}}/>
        {[0,1,2,3,4,5,6].map(i=>(
          <div key={i} style={{position:"absolute",left:0,right:0,
            top:`${(i*2/13)*100}%`,height:`${(1/13)*100}%`,background:"#fff"}}/>
        ))}
        <div style={{position:"absolute",top:0,left:0,width:"38%",height:"54%",background:"#3C3B6E"}}/>
      </div>
    ),
    "Morocco": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#C1272D"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",
          width:"28%",height:"28%",transform:"translate(-50%,-50%)",
          background:"none",border:"3px solid #006233",borderRadius:"50%"}}/>
      </div>
    ),
    "Canada": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{width:"25%",background:"#FF0000"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{width:"25%",background:"#FF0000"}}/>
        </div>
      </div>
    ),
    "Japan": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#fff"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",
          width:"36%",height:"36%",transform:"translate(-50%,-50%)",
          background:"#BC002D",borderRadius:"50%"}}/>
      </div>
    ),
    "Poland": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#DC143C"}}/>
        </div>
      </div>
    ),
    "Belgium": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#000"}}/>
          <div style={{flex:1,background:"#FAE042"}}/>
          <div style={{flex:1,background:"#EF3340"}}/>
        </div>
      </div>
    ),
    "Australia": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#00008B"}}/>
        <div style={{position:"absolute",top:0,left:0,width:"50%",height:"50%",
          background:"linear-gradient(135deg,#012169 50%,#C8102E 50%)"}}/>
        {/* Commonwealth Star below Union Jack */}
        <div style={{position:"absolute",top:"58%",left:"10%",
          color:"#fff",fontSize:"140%",lineHeight:1}}>★</div>
        {/* Southern Cross — white stars, right half */}
        <div style={{position:"absolute",top:"15%",right:"16%",color:"#fff",fontSize:"95%",lineHeight:1}}>★</div>
        <div style={{position:"absolute",top:"44%",right:"6%",color:"#fff",fontSize:"75%",lineHeight:1}}>★</div>
        <div style={{position:"absolute",top:"66%",right:"20%",color:"#fff",fontSize:"80%",lineHeight:1}}>★</div>
        <div style={{position:"absolute",top:"55%",right:"38%",color:"#fff",fontSize:"65%",lineHeight:1}}>★</div>
      </div>
    ),
    "Senegal": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#00853F"}}/>
          <div style={{flex:1,background:"#FDEF42"}}/>
          <div style={{flex:1,background:"#E31B23"}}/>
        </div>
      </div>
    ),
    "Serbia": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#C6363C"}}/>
          <div style={{flex:1,background:"#0C4076"}}/>
          <div style={{flex:1,background:"#fff"}}/>
        </div>
      </div>
    ),
    "Denmark": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#C60C30"}}/>
        <div style={{position:"absolute",top:0,bottom:0,left:"35%",width:"12%",background:"#fff"}}/>
        <div style={{position:"absolute",left:0,right:0,top:"40%",height:"20%",background:"#fff"}}/>
      </div>
    ),
    "Tunisia": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#E70013"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",
          width:"36%",height:"36%",transform:"translate(-50%,-50%)",
          background:"#fff",borderRadius:"50%"}}/>
      </div>
    ),
    "Ecuador": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:2,background:"#FFD100"}}/>
          <div style={{flex:1,background:"#003893"}}/>
          <div style={{flex:1,background:"#EF3340"}}/>
        </div>
      </div>
    ),
    "Cameroon": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#007A5E"}}/>
          <div style={{flex:1,background:"#CE1126"}}/>
          <div style={{flex:1,background:"#FCD116"}}/>
        </div>
      </div>
    ),
    "Iran": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#239F40"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#DA0000"}}/>
        </div>
      </div>
    ),
    "South Korea": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#fff"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",
          width:"30%",height:"30%",transform:"translate(-50%,-50%)",
          background:"linear-gradient(180deg,#C60C30 50%,#003478 50%)",borderRadius:"50%"}}/>
      </div>
    ),
    "Qatar": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{width:"35%",background:"#fff"}}/>
          <div style={{flex:1,background:"#8A1538"}}/>
        </div>
      </div>
    ),
    "Costa Rica": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#002B7F"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:2,background:"#CE1126"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#002B7F"}}/>
        </div>
      </div>
    ),
    "Switzerland": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#FF0000"}}/>
        <div style={{position:"absolute",top:0,bottom:0,left:"calc(50% - 6%)",width:"12%",background:"#fff"}}/>
        <div style={{position:"absolute",left:0,right:0,top:"calc(50% - 9%)",height:"18%",background:"#fff"}}/>
      </div>
    ),
    "Saudi Arabia": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#006C35"}}/>
        <div style={{position:"absolute",top:"35%",left:"15%",right:"15%",height:"22%",
          background:"#fff",opacity:0.9,borderRadius:"4px"}}/>
        <div style={{position:"absolute",bottom:"22%",left:"22%",right:"22%",height:"6%",background:"#fff",opacity:0.85}}/>
      </div>
    ),
    "Nigeria": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#008751"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#008751"}}/>
        </div>
      </div>
    ),
    "Uruguay": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#fff"}}/>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{position:"absolute",left:"40%",right:0,
            top:`${(i*2+1)*(100/9)}%`,height:`${100/9}%`,background:"#7CB9E8"}}/>
        ))}
        <div style={{position:"absolute",top:0,left:0,width:"40%",height:`${100/9*5}%`,background:"#fff",borderRight:"1px solid rgba(0,0,0,0.05)",borderBottom:"1px solid rgba(0,0,0,0.05)"}}/>
        <div style={{position:"absolute",top:`${100/9*1.5}%`,left:"12%",
          width:"16%",height:"22%",background:"#FCD116",borderRadius:"50%",border:"1.5px solid #FF8C00"}}/>
      </div>
    ),
    "Colombia": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:2,background:"#FCD116"}}/>
          <div style={{flex:1,background:"#003893"}}/>
          <div style={{flex:1,background:"#CE1126"}}/>
        </div>
      </div>
    ),
    "Ghana": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#CE1126"}}/>
          <div style={{flex:1,background:"#FCD116"}}/>
          <div style={{flex:1,background:"#006B3F"}}/>
        </div>
        <div style={{position:"absolute",top:"42%",left:"42%",width:"16%",height:"16%",
          background:"#000",clipPath:"polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)"}}/>
      </div>
    ),
    "Italy": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#008C45"}}/>
          <div style={{flex:1,background:"#F4F5F0"}}/>
          <div style={{flex:1,background:"#CD212A"}}/>
        </div>
      </div>
    ),
    "Peru": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#D91023"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#D91023"}}/>
        </div>
      </div>
    ),
    "South Africa": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#FFB81C"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"#DE3831"}}/>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:"32%",background:"#000",
          clipPath:"polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%)"}}/>
        <div style={{position:"absolute",left:0,top:"40%",bottom:"40%",right:0,background:"#007A4D"}}/>
        <div style={{position:"absolute",left:0,top:"32%",bottom:"32%",right:0,background:"#fff",
          clipPath:"polygon(0 0, 50% 0, 30% 50%, 50% 100%, 0 100%)"}}/>
      </div>
    ),
    "Czechia": (
      <div style={s}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"#fff"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"50%",background:"#D7141A"}}/>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:"50%",background:"#11457E",
          clipPath:"polygon(0 0, 100% 50%, 0 100%)"}}/>
      </div>
    ),
    "Bosnia-Herzegovina": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#002F6C"}}/>
        <div style={{position:"absolute",top:0,right:"15%",bottom:0,width:"35%",background:"#FECB00",
          clipPath:"polygon(100% 0, 0 100%, 100% 100%)"}}/>
      </div>
    ),
    "Scotland": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#0065BD"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(45deg,transparent 47%,#fff 47%,#fff 53%,transparent 53%)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(-45deg,transparent 47%,#fff 47%,#fff 53%,transparent 53%)"}}/>
      </div>
    ),
    "Haiti": (
      <div style={s}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"#00209F"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"50%",background:"#D21034"}}/>
        <div style={{position:"absolute",top:"30%",left:"35%",right:"35%",height:"40%",background:"#fff"}}/>
      </div>
    ),
    "Paraguay": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#D52B1E"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#0038A8"}}/>
        </div>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:"18%",height:"30%",borderRadius:"50%",border:"2px solid #009B3A",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"70%",color:"#009B3A",lineHeight:1}}>★</div>
      </div>
    ),
    "Turkiye": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#E30A17"}}/>
        <div style={{position:"absolute",top:"50%",left:"30%",
          width:"22%",height:"50%",transform:"translate(-50%,-50%)",
          background:"#fff",borderRadius:"50%"}}/>
        <div style={{position:"absolute",top:"50%",left:"33%",
          width:"18%",height:"42%",transform:"translate(-50%,-50%)",
          background:"#E30A17",borderRadius:"50%"}}/>
        <div style={{position:"absolute",top:"50%",left:"48%",
          color:"#fff",fontSize:"160%",fontWeight:"bold",lineHeight:1,
          transform:"translateY(-50%)"}}>★</div>
      </div>
    ),
    "Ivory Coast": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#FF8200"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#009E60"}}/>
        </div>
      </div>
    ),
    "Curacao": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#002B7F"}}/>
        <div style={{position:"absolute",left:0,right:0,top:"58%",height:"12%",background:"#F9E814"}}/>
      </div>
    ),
    "Sweden": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#006AA7"}}/>
        <div style={{position:"absolute",top:0,bottom:0,left:"30%",width:"12%",background:"#FECC00"}}/>
        <div style={{position:"absolute",left:0,right:0,top:"40%",height:"20%",background:"#FECC00"}}/>
      </div>
    ),
    "Egypt": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#CE1126"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#000"}}/>
        </div>
      </div>
    ),
    "New Zealand": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#012169"}}/>
        <div style={{position:"absolute",top:0,left:0,width:"50%",height:"50%",
          background:"linear-gradient(135deg,#012169 50%,#C8102E 50%)"}}/>
        {/* Southern Cross — 4 red stars (white-outlined), right half */}
        <div style={{position:"absolute",top:"14%",right:"18%",color:"#CC0001",fontSize:"90%",lineHeight:1,textShadow:"0 0 3px #fff,0 0 1px #fff"}}>★</div>
        <div style={{position:"absolute",top:"42%",right:"6%",color:"#CC0001",fontSize:"78%",lineHeight:1,textShadow:"0 0 3px #fff,0 0 1px #fff"}}>★</div>
        <div style={{position:"absolute",top:"64%",right:"20%",color:"#CC0001",fontSize:"72%",lineHeight:1,textShadow:"0 0 3px #fff,0 0 1px #fff"}}>★</div>
        <div style={{position:"absolute",top:"52%",right:"38%",color:"#CC0001",fontSize:"68%",lineHeight:1,textShadow:"0 0 3px #fff,0 0 1px #fff"}}>★</div>
      </div>
    ),
    "Cape Verde": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#003893"}}/>
        <div style={{position:"absolute",left:0,right:0,top:"55%",height:"15%",background:"#fff"}}/>
        <div style={{position:"absolute",left:0,right:0,top:"63%",height:"5%",background:"#CF2027"}}/>
      </div>
    ),
    "Norway": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#EF2B2D"}}/>
        <div style={{position:"absolute",top:0,bottom:0,left:"32%",width:"14%",background:"#fff"}}/>
        <div style={{position:"absolute",left:0,right:0,top:"42%",height:"16%",background:"#fff"}}/>
        <div style={{position:"absolute",top:0,bottom:0,left:"35%",width:"8%",background:"#002868"}}/>
        <div style={{position:"absolute",left:0,right:0,top:"46%",height:"8%",background:"#002868"}}/>
      </div>
    ),
    "Iraq": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#CE1126"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#000"}}/>
        </div>
        <div style={{position:"absolute",top:"45%",left:"38%",color:"#007A3D",
          fontSize:"60%",fontWeight:"bold",lineHeight:1}}>الله أكبر</div>
      </div>
    ),
    "Austria": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#ED2939"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#ED2939"}}/>
        </div>
      </div>
    ),
    "Algeria": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,background:"#006233"}}/>
          <div style={{flex:1,background:"#fff"}}/>
        </div>
        <div style={{position:"absolute",top:"50%",left:"50%",
          width:"22%",height:"36%",transform:"translate(-50%,-50%)",
          color:"#D21034",fontSize:"180%",lineHeight:1,textAlign:"center"}}>☪</div>
      </div>
    ),
    "Jordan": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#000"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#007A3D"}}/>
        </div>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:"35%",background:"#CE1126",
          clipPath:"polygon(0 0, 100% 50%, 0 100%)"}}/>
      </div>
    ),
    "Uzbekistan": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"#0099B5"}}/>
          <div style={{flex:0.15,background:"#CE1126"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:0.15,background:"#CE1126"}}/>
          <div style={{flex:1,background:"#1EB53A"}}/>
        </div>
      </div>
    ),
    "DR Congo": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#007FFF"}}/>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(20deg,transparent 40%,#F7D618 40%,#F7D618 50%,transparent 50%)"}}/>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(20deg,transparent 35%,#CE1126 35%,#CE1126 40%,transparent 40%,transparent 50%,#CE1126 50%,#CE1126 55%,transparent 55%)"}}/>
        <div style={{position:"absolute",top:"12%",left:"8%",
          color:"#F7D618",fontSize:"120%",lineHeight:1}}>★</div>
      </div>
    ),
    "Panama": (
      <div style={s}>
        <div style={{position:"absolute",inset:0,background:"#fff"}}/>
        <div style={{position:"absolute",top:0,right:0,width:"50%",height:"50%",background:"#005AA7"}}/>
        <div style={{position:"absolute",bottom:0,left:0,width:"50%",height:"50%",background:"#D21034"}}/>
        <div style={{position:"absolute",top:"12%",left:"12%",
          color:"#005AA7",fontSize:"180%",lineHeight:1}}>★</div>
        <div style={{position:"absolute",bottom:"12%",right:"12%",
          color:"#D21034",fontSize:"180%",lineHeight:1}}>★</div>
      </div>
    ),
  };
  // Canonical name aliases — worldcup2026.js uses these exact strings
  renders["Korea Republic"]          = renders["South Korea"];
  renders["Czech Republic"]          = renders["Czechia"];
  renders["Bosnia and Herzegovina"]  = renders["Bosnia-Herzegovina"];
  renders["Turkey"]                  = renders["Turkiye"];
  renders["Côte d'Ivoire"]           = renders["Ivory Coast"];
  renders["Curaçao"]                 = renders["Curacao"];
  return renders[team] || (
    <div style={s}>
      <div style={{position:"absolute",inset:0,
        background:`linear-gradient(135deg,${(TEAM_COLORS[team]||[NAVY,"#001840"])[0]},${(TEAM_COLORS[team]||[NAVY,"#001840"])[1]})`}}/>
    </div>
  );
}

function MatchSwipeCard({ home, away, onPick, onFlash, groupLabel, matchNum, totalMatches, existingPick, onBack, canGoBack, isKo }) {
  const lang = useLang();
  const startX = useRef(null);
  const startY = useRef(null);
  const [offset, setOffset] = useState({ x:0, y:0 });
  const [picked, setPicked] = useState(existingPick||null);
  const [overlayState, setOverlayState] = useState(null);
  const [winnerExpanded, setWinnerExpanded] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [nextReady, setNextReady] = useState(false);
  const pickRef = useRef(false);

  const homeColors = TEAM_COLORS[home] || [NAVY, "#001840"];
  const awayColors = TEAM_COLORS[away] || [GREEN, "#004d1a"];

  const confettiColors = overlayState==="home"
    ? [...homeColors, "#fff", "#FFD700"]
    : overlayState==="away"
      ? [...awayColors, "#fff", "#FFD700"]
      : [];

  const pick = (winner) => {
    if(pickRef.current || overlayState) return;
    pickRef.current = true;
    setOffset({x:0,y:0});
    if(winner === "draw") {
      setPicked(winner);
      setOverlayState(winner);
      setConfettiActive(false);
      setTimeout(()=>{ setNextReady(true); pickRef.current=false; }, 300);
    } else {
      // Tranziție imediată — fără fly animation care cauzează lag
      setPicked(winner);
      setOverlayState(winner);
      setWinnerExpanded(true);
      setConfettiActive(true);
      setTimeout(()=>{ setNextReady(true); pickRef.current=false; }, 350);
    }
    return true;
  };

  const onTouchStart = e => {
    if(overlayState) return;
    startX.current=e.touches[0].clientX;
    startY.current=e.touches[0].clientY;
  };
  const onTouchMove = e => {
    if(startX.current===null||overlayState) return;
    const dx=e.touches[0].clientX-startX.current;
    const dy=e.touches[0].clientY-startY.current;
    setOffset({x:dx*0.65,y:dy*0.5});
  };
  const onTouchEnd = e => {
    if(startX.current===null||overlayState) return;
    const dx=e.changedTouches[0].clientX-startX.current;
    const dy=startY.current-e.changedTouches[0].clientY;
    if(!isKo&&dy>55&&Math.abs(dx)<80) pick("draw");
    else if(dx<-60) pick("home");
    else if(dx>60) pick("away");
    else setOffset({x:0,y:0});
    startX.current=null;
  };

  const swipeLeft = !overlayState && offset.x < -25;
  const swipeRight = !overlayState && offset.x > 25;
  const swipeUp = !overlayState && offset.y < -25 && Math.abs(offset.x) < 60;
  const leftPct = Math.min(1,(-offset.x-25)/80);
  const rightPct = Math.min(1,(offset.x-25)/80);
  const upPct = !isKo ? Math.min(1,(-offset.y-25)/70) : 0;
  const rotation = overlayState ? 0 : offset.x * 0.045;
  const isFlying = Math.abs(offset.x)>200 || offset.y < -200;

  // ── DRAW OVERLAY — background Predicto 2026 ──────────────────────────────
  if (overlayState === "draw") {
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",userSelect:"none",position:"relative",overflow:"hidden",background:"#0a1228"}}>
        <style>{`
          @keyframes drawBounce{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
          @keyframes shimmer{0%,100%{opacity:0.6}50%{opacity:1}}
        `}</style>

        {/* Predicto 2026 gradient */}
        <div style={{position:"absolute",inset:0,
          background:`
            radial-gradient(ellipse at 18% 20%, rgba(228,0,43,0.35) 0%, transparent 42%),
            radial-gradient(ellipse at 82% 25%, rgba(0,47,108,0.45) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 90%, rgba(0,104,71,0.30) 0%, transparent 50%),
            linear-gradient(160deg, #0d1730 0%, #0a1228 35%, #150a1f 65%, #0a1228 100%)
          `}}/>

        {/* Content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          position:"relative",zIndex:5,padding:"24px 20px"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,
            animation:"drawBounce 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards"}}>
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              <span style={{fontSize:80,filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.6))"}}>{FLAGS[home]||"🏳"}</span>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <span style={{fontSize:40}}>🤝</span>
                <span style={{fontSize:22,fontWeight:900,color:"#FFD700",letterSpacing:3,
                  textShadow:"0 2px 12px rgba(0,0,0,0.8)"}}>EGAL</span>
              </div>
              <span style={{fontSize:80,filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.6))"}}>{FLAGS[away]||"🏳"}</span>
            </div>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:16,padding:"10px 24px",
              border:"1px solid rgba(255,255,255,0.15)",animation:"shimmer 2s ease infinite"}}>
              <span style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>{home} vs {away}</span>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{flexShrink:0,padding:"14px 20px 24px",position:"relative",zIndex:5,
          background:"rgba(0,0,0,0.5)",borderTop:"1px solid rgba(255,255,255,0.08)",
          display:"flex",gap:10,
          opacity:nextReady?1:0,transform:nextReady?"translateY(0)":"translateY(20px)",
          transition:"all 0.35s ease"}}>
          <button onClick={()=>{ setOverlayState(null); setPicked(null); setNextReady(false); pickRef.current=false; }}
            style={{flex:1,padding:"13px 0",borderRadius:14,border:"2px solid rgba(255,255,255,0.25)",
              background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            ← Change
          </button>
          <button onClick={()=>onPick&&onPick(overlayState)}
            style={{flex:2,padding:"13px 0",borderRadius:14,border:"none",
              background:"rgba(255,255,255,0.92)",color:"#111",fontSize:14,fontWeight:900,
              cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
            Next →
          </button>
        </div>
      </div>
    );
  }

  // ── WINNER OVERLAY — steagul câștigătorului scalat estetic pe tot ecranul ─
  if (overlayState === "home" || overlayState === "away") {
    const winnerTeam = overlayState==="home" ? home : away;
    const loserTeam  = overlayState==="home" ? away : home;
    const winnerFlag = FLAGS[winnerTeam]||"🏳";

    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",userSelect:"none",position:"relative",overflow:"hidden",background:"#0a1228"}}>
        <style>{`
          @keyframes bgReveal{0%{opacity:0}100%{opacity:1}}
          @keyframes popIn{0%{transform:scale(0.3) rotate(-10deg);opacity:0}60%{transform:scale(1.18) rotate(3deg)}80%{transform:scale(0.94) rotate(-1deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
          @keyframes slideUp{0%{transform:translateY(40px);opacity:0}100%{transform:translateY(0);opacity:1}}
          @keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
          @keyframes flagWallpaperFloat{0%,100%{transform:translateY(0px) rotate(-2deg)}50%{transform:translateY(-8px) rotate(2deg)}}
        `}</style>

        {/* Predicto 2026 gradient background */}
        <div style={{position:"absolute",inset:0,
          background:`
            radial-gradient(ellipse at 18% 20%, rgba(228,0,43,0.35) 0%, transparent 42%),
            radial-gradient(ellipse at 82% 25%, rgba(0,47,108,0.45) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 90%, rgba(0,104,71,0.30) 0%, transparent 50%),
            linear-gradient(160deg, #0d1730 0%, #0a1228 35%, #150a1f 65%, #0a1228 100%)
          `}}/>

        {/* Wrapper centrat — fix poziționare */}
        <div style={{
          position:"absolute", top:"18%", left:"50%",
          transform:"translateX(-50%)",
          width:"75%", maxWidth:360,
          zIndex:2, pointerEvents:"none",
        }}>
          {/* Glow halo în spatele steagului */}
          <div style={{
            position:"absolute", top:"-10%", left:"-8%", right:"-8%", bottom:"-10%",
            background:"radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 70%)",
            filter:"blur(24px)",
          }}/>

          {/* Steagul mare — emoji nativ frumos */}
          <div style={{
            position:"relative",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"bgReveal 0.5s ease forwards, flagWallpaperFloat 5s ease-in-out 0.5s infinite",
          }}>
            <span style={{
              fontSize:200, lineHeight:1, display:"block",
              filter:"drop-shadow(0 16px 40px rgba(0,0,0,0.85)) drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
            }}>
              {winnerFlag}
            </span>
          </div>
        </div>

        {/* Bottom gradient for action buttons readability */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"30%",zIndex:1,pointerEvents:"none",
          background:"linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)"}}/>

        {/* Confetti */}
        <ConfettiCanvas colors={confettiColors} active={confettiActive}/>

        {/* Content — aliniat în partea de jos sub steagul mare */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",
          position:"relative",zIndex:5,padding:"24px 20px 24px"}}>

          {/* Winner name */}
          <div style={{animation:"slideUp 0.45s ease 0.15s both",marginBottom:8}}>
            <div style={{background:"rgba(0,0,0,0.55)",borderRadius:20,padding:"10px 32px",
              border:"2px solid rgba(255,255,255,0.4)",backdropFilter:"blur(10px)",
              boxShadow:"0 6px 24px rgba(0,0,0,0.5)"}}>
              <span style={{fontSize:28,fontWeight:900,color:"#FFD700",letterSpacing:2,
                textShadow:"0 2px 16px rgba(0,0,0,0.9)"}}>
                {winnerTeam}
              </span>
            </div>
          </div>

          {/* WINS */}
          <div style={{animation:"slideUp 0.45s ease 0.25s both",marginBottom:18}}>
            <span style={{fontSize:13,fontWeight:800,color:"rgba(255,255,255,0.85)",letterSpacing:3,textTransform:"uppercase",
              textShadow:"0 1px 6px rgba(0,0,0,0.8)"}}>
              WINS ✓
            </span>
          </div>

          {/* Loser mini */}
          <div style={{display:"flex",alignItems:"center",gap:8,opacity:0.6,
            animation:"slideUp 0.45s ease 0.35s both"}}>
            <span style={{fontSize:11,color:"#fff",fontWeight:600}}>vs</span>
            <span style={{fontSize:28}}>{FLAGS[loserTeam]||"🏳"}</span>
            <span style={{fontSize:11,color:"#fff",fontWeight:600}}>{loserTeam}</span>
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{flexShrink:0,padding:"14px 20px 24px",position:"relative",zIndex:5,
          background:"rgba(0,0,0,0.35)",borderTop:"1px solid rgba(255,255,255,0.12)",
          display:"flex",gap:10,
          opacity:nextReady?1:0,transform:nextReady?"translateY(0)":"translateY(20px)",
          transition:"all 0.35s ease"}}>
          <button
            onClick={()=>{ setOverlayState(null); setPicked(null); setWinnerExpanded(false); setConfettiActive(false); setNextReady(false); pickRef.current=false; }}
            style={{flex:1,padding:"13px 0",borderRadius:14,border:"2px solid rgba(255,255,255,0.3)",
              background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            ← Change
          </button>
          <button
            onClick={()=>{ setConfettiActive(false); onPick(overlayState); }}
            style={{flex:2,padding:"13px 0",borderRadius:14,border:"none",
              background:"rgba(255,255,255,0.95)",color:"#111",fontSize:14,fontWeight:900,
              cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
            Next →
          </button>
        </div>
      </div>
    );
  }

  // ── DEFAULT CARD — MK-style diagonal split ───────────────────────────────
  const homeDim  = swipeLeft  ? Math.min(1, 0.85 + leftPct * 0.15)  : swipeRight ? 0.5 : 0.85;
  const awayDim  = swipeRight ? Math.min(1, 0.85 + rightPct * 0.15) : swipeLeft  ? 0.5 : 0.85;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",userSelect:"none",position:"relative"}}>
      <style>{`
        @keyframes xPulse{0%,100%{opacity:0.45}50%{opacity:0.9}}
        @keyframes neonPulseHome{0%,100%{box-shadow:0 0 18px 4px ${homeColors[0]}aa,0 0 40px 8px ${homeColors[0]}44,0 0 0 3px rgba(255,255,255,0.9),inset 0 0 12px rgba(255,255,255,0.1)}50%{box-shadow:0 0 30px 8px ${homeColors[0]}ee,0 0 65px 15px ${homeColors[0]}66,0 0 0 3px rgba(255,255,255,0.9),inset 0 0 12px rgba(255,255,255,0.15)}}
        @keyframes neonPulseAway{0%,100%{box-shadow:0 0 18px 4px ${awayColors[0]}aa,0 0 40px 8px ${awayColors[0]}44,0 0 0 3px rgba(255,255,255,0.9),inset 0 0 12px rgba(255,255,255,0.1)}50%{box-shadow:0 0 30px 8px ${awayColors[0]}ee,0 0 65px 15px ${awayColors[0]}66,0 0 0 3px rgba(255,255,255,0.9),inset 0 0 12px rgba(255,255,255,0.15)}}
        @keyframes slideInTopLeft{0%{opacity:0;transform:translate(-80px,-60px) scale(0.6)}100%{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes slideInBottomRight{0%{opacity:0;transform:translate(80px,60px) scale(0.6)}100%{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes vsAppear{0%{opacity:0;transform:translate(-50%,-50%) scale(0.3) rotate(-15deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-8deg)}}
        @keyframes ballDrop{0%{opacity:0;transform:translate(-50%,-50%) translateY(-40px) scale(0.6)}100%{opacity:1;transform:translate(-50%,-50%) translateY(0) scale(1)}}
        @keyframes ballBob{0%,100%{transform:translate(-50%,-50%) translateY(0px)}50%{transform:translate(-50%,-50%) translateY(-8px)}}
        @keyframes lightBeamLeft{0%,100%{opacity:0.3}50%{opacity:0.6}}
        @keyframes lightBeamRight{0%,100%{opacity:0.25}50%{opacity:0.55}}
        @keyframes particleFloat{0%{transform:translateY(0px) translateX(0px);opacity:0.8}50%{opacity:1}100%{transform:translateY(-60px) translateX(10px);opacity:0}}
      `}</style>

      <div
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{
          flex:1, overflow:"hidden", touchAction:"none",
          transform:`translateX(${offset.x}px) translateY(${offset.y}px) rotate(${rotation}deg)`,
          transition: isFlying
            ? "transform 0.30s cubic-bezier(0.55,0,1,0.45)"
            : (offset.x===0&&offset.y===0 ? "transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275)" : "transform 0.04s"),
          position:"relative",
          background:"#050d1a",
        }}>

        {/* ── BACKGROUND — gradient din culorile echipelor ── */}
        <div style={{position:"absolute",inset:0,
          background:`linear-gradient(135deg, ${homeColors[0]}cc 0%, ${homeColors[0]}88 25%, #0a0e1a 50%, ${awayColors[0]}88 75%, ${awayColors[0]}cc 100%)`}}/>


        {/* Dark overlay pentru contrast */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:"linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.55) 100%)"}}/>
        {/* Radial glow home */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:`radial-gradient(ellipse at 15% 20%, ${homeColors[0]}55 0%, transparent 50%)`,
          animation:"lightBeamLeft 3s ease-in-out infinite"}}/>
        {/* Radial glow away */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:`radial-gradient(ellipse at 85% 80%, ${awayColors[0]}55 0%, transparent 50%)`,
          animation:"lightBeamRight 3s ease-in-out 1.5s infinite"}}/>

        {/* Confetti particles */}
        {[...Array(8)].map((_,i)=>(
          <div key={i} style={{
            position:"absolute",
            left:`${10+i*12}%`,
            top:`${60+Math.sin(i)*15}%`,
            width:4, height:4, borderRadius:"50%",
            background:i%2===0?homeColors[0]:awayColors[0],
            opacity:0.5, pointerEvents:"none",
            animation:`particleFloat ${2+i*0.3}s ease-in ${i*0.4}s infinite`,
          }}/>
        ))}

        {/* DRAW overlay — swipe up */}
        {!isKo&&swipeUp&&(
          <div style={{position:"absolute",inset:0,zIndex:8,pointerEvents:"none",
            background:`rgba(0,0,0,${upPct*0.78})`,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:50,fontWeight:900,color:"#FFD700",letterSpacing:4,
              textShadow:"0 2px 20px rgba(0,0,0,0.9)",
              transform:`scale(${0.7+upPct*0.3})`,transition:"transform 0.05s"}}>EGAL</span>
            <span style={{fontSize:34,transform:`scale(${0.7+upPct*0.3})`,transition:"transform 0.05s"}}>🤝</span>
          </div>
        )}

        {/* ── HOME TEAM — top-left ── */}
        <div onClick={()=>pick("home")} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick("home");}}} style={{
          position:"absolute", top:"9%", left:"4%",
          zIndex:5, cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"flex-start", gap:10,
          animation:"slideInTopLeft 0.55s cubic-bezier(0.22,1,0.36,1) both",
          transform: swipeLeft
            ? `scale(${1+leftPct*0.07}) translate(${-leftPct*10}px,${-leftPct*10}px)`
            : "scale(1)",
          transition:"transform 0.12s",
        }}>
          {/* Flag card with neon border */}
          <div style={{
            width:170, aspectRatio:"3/2",
            borderRadius:16, overflow:"hidden", position:"relative",
            animation:`neonPulseHome ${swipeLeft?"0.6s":"2.5s"} ease-in-out infinite`,
            transform:"rotate(-4deg)",
          }}>
            <FlagBg team={home} style={{}}/>
            {/* Glossy shine on top */}
            <div style={{position:"absolute",inset:0,
              background:"linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)",
              pointerEvents:"none"}}/>
          </div>
          {/* Team name */}
          <span style={{
            fontSize:17, fontWeight:900, color:"#fff",
            letterSpacing:2, textTransform:"uppercase",
            textShadow:`0 0 20px ${homeColors[0]}, 0 2px 8px rgba(0,0,0,0.9)`,
            paddingLeft:4,
          }}>{home}</span>
        </div>

        {/* ── VS — diagonal center ── */}
        <div style={{
          position:"absolute", top:"40%", left:"52%",
          transform:"translate(-50%,-50%)",
          zIndex:7, pointerEvents:"none",
          animation:"vsAppear 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
        }}>
          <svg viewBox="0 0 160 100" width="140" height="88" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="vsG" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#FFD700"/>
                <stop offset="30%"  stopColor="#FF6B00"/>
                <stop offset="65%"  stopColor="#CC0000"/>
                <stop offset="100%" stopColor="#660000"/>
              </linearGradient>
              <filter id="vsGlow">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="vsRuf">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="2.8" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
            </defs>
            {/* White outline sticker */}
            <text x="6" y="82" fontFamily="Arial Black,Impact,sans-serif"
              fontSize="90" fontWeight="900" fontStyle="italic"
              fill="white" stroke="white" strokeWidth="10"
              strokeLinejoin="round" strokeLinecap="round"
              filter="url(#vsRuf)" letterSpacing="-6">VS</text>
            {/* Colored gradient text */}
            <text x="6" y="82" fontFamily="Arial Black,Impact,sans-serif"
              fontSize="90" fontWeight="900" fontStyle="italic"
              fill="url(#vsG)" filter="url(#vsRuf)" letterSpacing="-6">VS</text>
          </svg>
        </div>

        {/* ── SOCCER BALL — center-left of VS ── */}
        <div style={{
          position:"absolute", top:"56%", left:"44%",
          transform:"translate(-50%,-50%)",
          zIndex:6,
          width:110, height:110,
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"ballDrop 0.6s cubic-bezier(0.22,1,0.36,1) 0.35s both, ballBob 2.8s ease-in-out 1s infinite",
        }}>
          {/* Glow under ball */}
          <div style={{
            position:"absolute", bottom:-8, left:"50%",
            width:60, height:14, transform:"translateX(-50%)",
            background:`radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 70%)`,
            filter:"blur(4px)", pointerEvents:"none",
          }}/>
          <span style={{
            fontSize:96, lineHeight:1,
            colorScheme:"light",
            filter:"saturate(0) contrast(3) brightness(1.1) drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
          }}>⚽</span>
        </div>

        {/* ── AWAY TEAM — bottom-right ── */}
        <div onClick={()=>pick("away")} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick("away");}}} style={{
          position:"absolute", bottom:"18%", right:"4%",
          zIndex:5, cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10,
          animation:"slideInBottomRight 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s both",
          transform: swipeRight
            ? `scale(${1+rightPct*0.07}) translate(${rightPct*10}px,${rightPct*10}px)`
            : "scale(1)",
          transition:"transform 0.12s",
        }}>
          {/* Flag card with neon border */}
          <div style={{
            width:170, aspectRatio:"3/2",
            borderRadius:16, overflow:"hidden", position:"relative",
            animation:`neonPulseAway ${swipeRight?"0.6s":"2.5s"} ease-in-out 1.2s infinite`,
            transform:"rotate(4deg)",
          }}>
            <FlagBg team={away} style={{}}/>
            <div style={{position:"absolute",inset:0,
              background:"linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)",
              pointerEvents:"none"}}/>
          </div>
          {/* Team name */}
          <span style={{
            fontSize:17, fontWeight:900, color:"#fff",
            letterSpacing:2, textTransform:"uppercase",
            textShadow:`0 0 20px ${awayColors[0]}, 0 2px 8px rgba(0,0,0,0.9)`,
            paddingRight:4,
          }}>{away}</span>
        </div>

        {/* ── BOTTOM ROW — Swipe pills + X ── */}
        <div style={{
          position:"absolute", zIndex:6, bottom:20, left:14, right:14,
          display:"flex", justifyContent:"space-between", alignItems:"flex-end",
        }}>
          <button onClick={()=>pick("home")} style={{
            cursor:"pointer",
            background:"rgba(0,0,0,0.65)", backdropFilter:"blur(12px)",
            borderRadius:14, padding:"8px 14px",
            border:"1.5px solid rgba(255,255,255,0.18)",
            transform:swipeLeft?`scale(${1+leftPct*0.05}) translateY(${-leftPct*4}px)`:"scale(1)",
            transition:"transform 0.08s",
            boxShadow:swipeLeft?`0 0 22px ${homeColors[0]}88`:"0 2px 12px rgba(0,0,0,0.6)",
            WebkitTapHighlightColor:"transparent", fontFamily:"inherit", textAlign:"left",
          }}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:700,letterSpacing:1.5,marginBottom:3}}>← SWIPE</div>
            <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>{home}</div>
          </button>

          {!isKo&&(
            <button onClick={()=>pick("draw")} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,border:"none",background:"transparent",padding:0,fontFamily:"inherit",WebkitTapHighlightColor:"transparent"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,animation:"xPulse 2.5s ease-in-out infinite"}}>
                <span style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1}}>↑</span>
                <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.45)",letterSpacing:1,textTransform:"uppercase"}}>egal</span>
              </div>
              <div style={{background:"rgba(0,0,0,0.65)",backdropFilter:"blur(12px)",
                borderRadius:14,padding:"8px 18px",
                border:"1.5px solid rgba(255,215,0,0.5)",boxShadow:"0 2px 16px rgba(255,215,0,0.2)"}}>
                <span style={{fontSize:22,fontWeight:900,color:"#FFD700",textShadow:"0 2px 12px rgba(0,0,0,0.8)",lineHeight:1}}>X</span>
              </div>
            </button>
          )}

          <button onClick={()=>pick("away")} style={{
            cursor:"pointer",
            background:"rgba(0,0,0,0.65)", backdropFilter:"blur(12px)",
            borderRadius:14, padding:"8px 14px", textAlign:"right",
            border:"1.5px solid rgba(255,255,255,0.18)",
            transform:swipeRight?`scale(${1+rightPct*0.05}) translateY(${-rightPct*4}px)`:"scale(1)",
            transition:"transform 0.08s",
            boxShadow:swipeRight?`0 0 22px ${awayColors[0]}88`:"0 2px 12px rgba(0,0,0,0.6)",
            WebkitTapHighlightColor:"transparent", fontFamily:"inherit",
          }}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:700,letterSpacing:1.5,marginBottom:3}}>SWIPE →</div>
            <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>{away}</div>
          </button>
        </div>

        {canGoBack&&(
          <button onClick={onBack} style={{
            position:"absolute", zIndex:6, bottom:110, left:14,
            background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:10, padding:"6px 10px", cursor:"pointer",
            display:"flex", alignItems:"center", gap:3, color:"rgba(255,255,255,0.45)",
            backdropFilter:"blur(6px)",
          }}>
            <span style={{fontSize:13}}>←</span>
            <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{T[lang].backLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}


function GroupSummaryCard({ group, picks, onNext, onReset, isLastGroup }) {
  const lang = useLang();
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
        <p style={{fontSize:14,fontWeight:800,color:DARK,margin:0}}>{T[lang].group} {group} · {T[lang].groupComplete}</p>
        <p style={{fontSize:12,color:"#aaa",margin:"4px 0 0"}}>{T[lang].yourPredictedStandings}</p>
      </div>
      <div style={{background:BG,borderRadius:16,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:20}}>
        {sorted.map((t,i)=>(
          <div key={t} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",background:"#fff",borderBottom:i<3?"1px solid rgba(0,0,0,0.05)":"none"}}>
            <span style={{fontSize:12,fontWeight:800,color:i===0?GREEN:i===1?NAVY:"#aaa",width:20,textAlign:"center"}}>{i+1}</span>
            <span style={{fontSize:24}}>{FLAGS[t]||"🏳"}</span>
            <span style={{flex:1,fontSize:13,fontWeight:600,color:DARK}}>{t}</span>
            <div style={{background:i<2?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"rgba(0,0,0,0.06)",borderRadius:8,padding:"4px 10px"}}>
              <span style={{fontSize:12,fontWeight:800,color:i<2?"#fff":"#888"}}>{pts[t]||0} pts</span>
            </div>
            {i<2&&<span style={{fontSize:12,color:GREEN,fontWeight:700}}>→ R16</span>}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onReset}
          style={{flex:1,padding:"14px 0",borderRadius:14,border:"none",
            background:BG,boxShadow:SHADOW_OUT,
            color:"#888",fontSize:13,fontWeight:700,cursor:"pointer"}}>
          {T[lang].btnGroupSummaryReset}
        </button>
        <button onClick={onNext}
          style={{flex:2,padding:"14px 0",borderRadius:14,border:"none",
            background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,
            color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(0,32,91,0.3)"}}>
          {isLastGroup ? T[lang].btnKnockout : T[lang].btnNextGroupSummary}
        </button>
      </div>
    </div>
  );
}

function Best3Screen({ groups, getGroupStanding, picks, best3, setBest3, onDone }) {
  const lang = useLang();
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

  // Deduplicate by team name (same team can appear in multiple groups due to data)
  const seen = new Set();
  const unique = thirds.filter(({team})=>{ if(seen.has(team)) return false; seen.add(team); return true; });
  // Sort by pts descending
  const sorted = [...unique].sort((a,b)=>b.pts-a.pts);
  const needed = 8;
  const isFull = best3.length >= needed;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      {/* Header with selected chips */}
      <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"12px 16px 14px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:13,fontWeight:800,color:"#fff"}}>{T[lang].best3Title}</span>
          <span style={{fontSize:12,fontWeight:800,color:isFull?GREEN:"rgba(255,255,255,0.6)"}}>{best3.length}/{needed}</span>
        </div>
        {best3.length===0 ? (
          <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",fontStyle:"italic",margin:0}}>{T[lang].selectTeams}</p>
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
      <div style={{flex:1,overflowY:"auto",padding:"12px 20px",position:"relative",zIndex:1}}>
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>
          {T[lang].thirdPlaceRanking}
        </p>
        <div style={{background:"transparent",borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:16}}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"center",padding:"6px 16px",background:"rgba(0,0,0,0.03)",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
            <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:24}}>#</span>
            <span style={{flex:1,fontSize:11,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{T[lang].team}</span>
            <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:28,textAlign:"center"}}>Gr.</span>
            <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:40,textAlign:"center"}}>Pts</span>
            <span style={{width:28}}/>
          </div>
          {sorted.filter(({team})=>!best3.includes(team)).map(({group,team,flag,pts},i,arr)=>(
            <div key={team} onClick={()=>{ if(!isFull && !best3.includes(team)) setBest3(p=>[...p,team]); }}
              style={{display:"flex",alignItems:"center",gap:8,padding:"11px 16px",
                background:"rgba(255,255,255,0.82)",
                borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,0.05)":"none",
                cursor:isFull?"default":"pointer",
                opacity:isFull?0.5:1,transition:"all 0.15s"}}>
              <span style={{fontSize:11,fontWeight:800,color:i===0?GREEN:i<3?NAVY:"#bbb",width:24}}>{i+1}</span>
              <span style={{fontSize:22,flexShrink:0}}>{flag}</span>
              <span style={{flex:1,fontSize:13,fontWeight:600,color:DARK}}>{team.length>10?team.split(" ")[0]:team}</span>
              <span style={{fontSize:12,fontWeight:700,color:"#bbb",background:"rgba(0,0,0,0.06)",borderRadius:5,padding:"2px 6px",width:28,textAlign:"center"}}>{group}</span>
              <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,borderRadius:8,padding:"3px 8px",width:40,textAlign:"center"}}>
                <span style={{fontSize:11,fontWeight:800,color:"#fff"}}>{pts}</span>
              </div>
              <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,border:"2px solid #ddd"}}/>
            </div>
          ))}
        </div>
        <button onClick={()=>isFull&&onDone(best3)}
          style={{width:"100%",padding:"15px 0",borderRadius:14,border:"none",marginBottom:24,
            background:isFull?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"#e0e0e0",
            color:isFull?"#fff":"#bbb",fontSize:14,fontWeight:800,cursor:isFull?"pointer":"default",
            boxShadow:isFull?"0 4px 14px rgba(0,32,91,0.3)":"none"}}>
          {isFull ? T[lang].knockout : `${T[lang].selectMore} ${needed-best3.length}`}
        </button>
      </div>
    </div>
  );
}


function GroupIntroScreen({ group, teams: teamsProp, isKo, onStart, hideHeader=false, picks={}, viewMode=false }) {
  const lang = useLang();
  const teams = isKo ? null : (ALL_GROUPS_DATA[group]||[]);
  const matchCount = isKo ? (teamsProp||[]).length : (GROUP_MATCHUPS[group]||[]).length;
  const nextRoundLabel = {R32:"Round of 16",R16:"Quarter-Finals",QF:"Semi-Finals",SF:"Final"}[group]||"Next Round";
  const matches = teamsProp||[];
  const matchPairs = [];
  for(let i=0;i<matches.length;i+=2) matchPairs.push([matches[i],matches[i+1]]);

  return (
    <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",background:isKo?"transparent":BG,overflow:"hidden",userSelect:"none",position:"relative"}}>
      {isKo ? (
        <>
          <div style={{flex:1,minHeight:0,overflowY:"auto",padding:"14px 14px 8px",position:"relative",zIndex:1}}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {matchPairs.map(([m1,m2],gi)=>{
                const col={R32:NAVY,R16:"#7B2FBE",QF:RED,SF:"#D4820A",F:"#D4820A"}[group]||NAVY;
                const resolvePick=(pick,pair)=>pick==="home"?pair[0]:pick==="away"?pair[1]:null;
                const w1=m1?resolvePick(picks[`${group}-${gi*2}`],m1):null;
                const w2=m2?resolvePick(picks[`${group}-${gi*2+1}`],m2):null;
                const code=(t)=>t?TEAM_CODE[t]||t.slice(0,3).toUpperCase():"??";
                return (
                  <div key={gi} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{display:"flex",flexDirection:"column",gap:5,flex:1}}>
                      {[m1,m2].filter(Boolean).map(([h,a],mi)=>{
                        const p=picks[`${group}-${gi*2+mi}`];
                        const hWon=p==="home", aWon=p==="away";
                        return (
                          <div key={mi} style={{background:"#fff",borderRadius:10,border:`1px solid ${hWon||aWon?GREEN+"55":col+"22"}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                            <div style={{padding:"7px 10px",borderBottom:"1px solid rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:8,background:hWon?GREEN+"15":"transparent"}}>
                              <span style={{fontSize:20,lineHeight:1}}>{FLAGS[h]||"🏳"}</span>
                              <span style={{fontSize:12,fontWeight:700,color:hWon?GREEN:DARK,flex:1}}>{h||"TBD"}</span>
                              {hWon&&<span style={{fontSize:11,fontWeight:900,color:GREEN}}>✓</span>}
                            </div>
                            <div style={{padding:"7px 10px",display:"flex",alignItems:"center",gap:8,background:aWon?GREEN+"15":"transparent"}}>
                              <span style={{fontSize:20,lineHeight:1}}>{FLAGS[a]||"🏳"}</span>
                              <span style={{fontSize:12,fontWeight:700,color:aWon?GREEN:DARK,flex:1}}>{a||"TBD"}</span>
                              {aWon&&<span style={{fontSize:11,fontWeight:900,color:GREEN}}>✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {m2&&(<>
                      <div style={{display:"flex",alignItems:"center",width:18,alignSelf:"stretch"}}>
                        <svg width="18" height="100%" style={{flex:1}} viewBox="0 0 18 60" preserveAspectRatio="none">
                          <path d="M0,15 H9 V45 H0" fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.35"/>
                          <line x1="9" y1="30" x2="18" y2="30" stroke={col} strokeWidth="1.5" strokeOpacity="0.35"/>
                        </svg>
                      </div>
                      <div style={{background:`${col}12`,borderRadius:8,border:`1.5px dashed ${col}66`,padding:"6px 8px",minWidth:70,textAlign:"center",flexShrink:0}}>
                        {(w1||w2)?(
                          <>
                            <span style={{fontSize:11,color:"#bbb",display:"block",marginBottom:5}}>→ {nextRoundLabel}</span>
                            {[w1,w2].map((w,wi)=>w?(
                              <div key={wi} style={{display:"flex",alignItems:"center",gap:5,justifyContent:"center",marginBottom:wi===0?4:0,background:`${col}18`,borderRadius:6,padding:"3px 6px"}}>
                                <span style={{fontSize:18,lineHeight:1}}>{FLAGS[w]||"🏳"}</span>
                                <span style={{fontSize:10,fontWeight:900,color:col,letterSpacing:0.5}}>{code(w)}</span>
                              </div>
                            ):(
                              <div key={wi} style={{fontSize:11,color:"#ccc",marginBottom:wi===0?4:0,padding:"3px 0"}}>??</div>
                            ))}
                          </>
                        ):(
                          <>
                            <span style={{fontSize:11,color:"#bbb",display:"block",marginBottom:2}}>{T[lang].winnerArrow}</span>
                            <span style={{fontSize:10,fontWeight:800,color:col,lineHeight:1.2}}>{nextRoundLabel}</span>
                          </>
                        )}
                      </div>
                    </>)}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{padding:"8px 14px",borderTop:"1px solid rgba(0,0,0,0.06)",position:"relative",zIndex:1}}>
            <div style={{fontSize:11,color:"rgba(0,0,0,0.35)",fontWeight:700,textAlign:"center",marginBottom:10,letterSpacing:0.5}}>
              {matchCount} {T[lang].matchesToPredict}
            </div>
            <button onClick={!viewMode ? onStart : undefined}
              style={{width:"100%",padding:"15px 0",borderRadius:14,border:"none",
                background:viewMode?"rgba(0,0,0,0.07)":`linear-gradient(135deg,${NAVY},#003580)`,
                color:viewMode?"rgba(0,0,0,0.25)":"#fff",fontSize:15,fontWeight:900,
                cursor:viewMode?"default":"pointer",
                boxShadow:viewMode?"none":"0 4px 20px rgba(0,32,91,0.3)",letterSpacing:1}}>
              {viewMode ? T[lang].viewOnly : T[lang].startMatches}
            </button>
          </div>
        </>
      ) : (
        <div style={{padding:"20px 24px"}}>
          <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,borderRadius:20,padding:"20px",width:"100%",marginBottom:16,boxShadow:SHADOW_OUT}}>
            {!hideHeader && <h2 style={{fontSize:26,fontWeight:900,color:"#fff",margin:"0 0 20px",textAlign:"center",letterSpacing:1}}>{group}</h2>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {teams.map((t)=>(
                <div key={t} style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,border:"1px solid rgba(255,255,255,0.15)"}}>
                  <span style={{fontSize:44,lineHeight:1}}>{FLAGS[t]||"🏳"}</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#fff",textAlign:"center",lineHeight:1.2}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{width:"100%",background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:20}}>
            <p style={{fontSize:12,color:"#aaa",margin:0,textAlign:"center"}}>{matchCount} {T[lang].matchesToPredict}</p>
          </div>
          <button onClick={!viewMode ? onStart : undefined}
            style={{width:"100%",padding:"16px 0",borderRadius:16,border:"none",
              background:viewMode?"rgba(0,0,0,0.07)":`linear-gradient(135deg,${RED},#EF3340 40%,${GREEN})`,
              color:viewMode?"rgba(0,0,0,0.25)":"#fff",fontSize:16,fontWeight:900,
              cursor:viewMode?"default":"pointer",
              boxShadow:viewMode?"none":"0 6px 20px rgba(200,16,46,0.3)",letterSpacing:1}}>
            {viewMode ? T[lang].viewOnly : T[lang].startMatches}
          </button>
        </div>
      )}
    </div>
  );
}


function InstantPickScreen({ onBack, onComplete, onKoComplete, onModify, savedState, onStateChange, tournamentStarted, viewMode=false, koUnlocked=false, startAtKo=false, realStandings={} }) {
  const lang = useLang();
  const { pred: PRED_SCORING, predMax: PRED_MAX } = useScoringRules();
  const GROUPS = INTERACTIVE_GROUPS;
  const [stage, setStage] = useState(savedState?.stage||"groups");
  const [groupIdx, setGroupIdx] = useState(savedState?.groupIdx||0);
  const [showIntro, setShowIntro] = useState(savedState?.showIntro!==undefined?savedState.showIntro:true);
  const [groupRankings, setGroupRankings] = useState(savedState?.groupRankings||{});
  const [best3, setBest3] = useState(savedState?.best3||[]);
  const [koIdx, setKoIdx] = useState(savedState?.koIdx||0);
  const [koPicks, setKoPicks] = useState(savedState?.koPicks||{});
  const [koShowIntro, setKoShowIntro] = useState(savedState?.koShowIntro!==undefined?savedState.koShowIntro:true);
  const [koRound, setKoRound] = useState(savedState?.koRound||"R32");
  const [showFinalSummary, setShowFinalSummary] = useState(savedState?.showFinalSummary||false);
  const [showGroupsSlider, setShowGroupsSlider] = useState(true);
  const sliderScrollRef = useRef(null);

  useEffect(()=>{ setShowGroupsSlider(stage==="groups"); },[stage]);

  useEffect(()=>{
    if(onStateChange) onStateChange({stage,groupIdx,showIntro,groupRankings,best3,koIdx,koPicks,koShowIntro,koRound,showFinalSummary});
  },[stage,groupIdx,showIntro,groupRankings,best3,koIdx,koPicks,koShowIntro,koRound,showFinalSummary]);

  useEffect(()=>{
    if(!sliderScrollRef.current) return;
    const w = sliderScrollRef.current.offsetWidth;
    sliderScrollRef.current.scrollLeft = Math.max(0, groupIdx * 43 - w / 2 + 19);
  },[groupIdx]);

  const currentGroup = GROUPS[groupIdx];

  const getGroupStanding = (group) => {
    if(groupRankings[group]) return groupRankings[group];
    return getAutoStanding(group);
  };

  const handleGroupAutoSave = (ranking) => {
    const prevRanking = groupRankings[currentGroup];
    const changed = !prevRanking || prevRanking.some((t,i)=>t!==ranking[i]);
    setGroupRankings(prev=>({...prev,[currentGroup]:ranking}));
    if(changed) {
      setBest3([]);
      setKoPicks({});
      setKoRound("R32");
      setKoIdx(0);
      setKoShowIntro(true);
      setShowFinalSummary(false);
      if(viewMode && onModify) onModify();
    }
  };

  const handleGroupConfirm = (ranking) => {
    handleGroupAutoSave(ranking);
    if(groupIdx < GROUPS.length-1) {
      const nextGroup = GROUPS[groupIdx + 1];
      const nextHasRanking = !!(groupRankings[nextGroup]?.every(t => t !== null));
      setGroupIdx(g=>g+1);
      setShowIntro(effectiveViewMode ? false : !nextHasRanking);
    }
    else setStage("best3");
  };

  const handleGroupBack = () => {
    if(groupIdx>0) { setGroupIdx(g=>g-1); }
    else { onBack&&onBack(); }
  };

  const allGroupStandings = {};
  GROUPS.forEach(g=>{ allGroupStandings[g]=getGroupStanding(g); });

  // For KO bracket: use realStandings (from DB) when available, else auto-standings
  const getRealGroupStanding = (group) => {
    if(realStandings[group]?.length) return realStandings[group];
    return getAutoStanding(group);
  };
  const allRealGroupStandings = {};
  GROUPS.forEach(g=>{ allRealGroupStandings[g]=getRealGroupStanding(g); });

  // 32 teams: 12 group winners + 12 runners-up + 8 best 3rd — din clasamentele REALE
  const groupWinners  = GROUPS.map(g=>(allRealGroupStandings[g]||[])[0]).filter(Boolean);
  const groupRunners  = GROUPS.map(g=>(allRealGroupStandings[g]||[])[1]).filter(Boolean);
  // best3Teams: REAL_BEST3 override > user's picks > FIFA-ranked auto
  const best3Teams = REAL_BEST3.length === 8 ? REAL_BEST3
    : best3.length === 8 ? best3
    : rankBest3ByFifa(GROUPS, allRealGroupStandings, REAL_GROUP_STATS);

  // Bracket oficial FIFA 2026 — Round of 32 (16 meciuri)
  // GROUPS index: A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10, L=11
  const W = (i) => groupWinners[i] || "TBD";
  const R = (i) => groupRunners[i]  || "TBD";
  const B = (i) => best3Teams[i]    || "TBD";
  const r32Matchups = [
    // Grupa A-D cross
    {home:W(0), away:R(2)}, // 1A vs 2C
    {home:W(2), away:R(0)}, // 1C vs 2A
    {home:W(1), away:R(3)}, // 1B vs 2D
    {home:W(3), away:R(1)}, // 1D vs 2B
    // Grupa E-H cross
    {home:W(4), away:R(6)}, // 1E vs 2G
    {home:W(6), away:R(4)}, // 1G vs 2E
    {home:W(5), away:R(7)}, // 1F vs 2H
    {home:W(7), away:R(5)}, // 1H vs 2F
    // Grupa I-L cross
    {home:W(8),  away:R(10)}, // 1I vs 2K
    {home:W(10), away:R(8)},  // 1K vs 2I
    {home:W(9),  away:R(11)}, // 1J vs 2L
    {home:W(11), away:R(9)},  // 1L vs 2J
    // Best 3rd joacă între ele (4 meciuri)
    {home:B(0), away:B(1)},
    {home:B(2), away:B(3)},
    {home:B(4), away:B(5)},
    {home:B(6), away:B(7)},
  ]; // = 16 meciuri

  const getWinners = (roundKey) =>
    Object.entries(koPicks)
      .filter(([k])=>k.startsWith(roundKey+"-"))
      .sort(([a],[b])=>parseInt(a.split("-")[1])-parseInt(b.split("-")[1]))
      .map(([k,v])=>{
        const idx=parseInt(k.split("-")[1]);
        const matchups = roundKey==="R32" ? r32Matchups
          : roundKey==="R16" ? r16Matchups
          : roundKey==="QF"  ? qfMatchups
          : roundKey==="SF"  ? sfMatchups : [];
        const m = matchups[idx];
        if(!m) return "TBD";
        return v==="home"?m.home:v==="away"?m.away:"TBD";
      });

  const makePairs = (winners) => {
    const pairs=[];
    for(let i=0;i<winners.length;i+=2) pairs.push({home:winners[i]||"TBD",away:winners[i+1]||"TBD"});
    return pairs;
  };

  const r16Matchups = makePairs(getWinners("R32")); // 8 meciuri
  const qfMatchups  = makePairs(getWinners("R16")); // 4 meciuri
  const sfMatchups  = makePairs(getWinners("QF"));  // 2 meciuri
  const fMatchups   = makePairs(getWinners("SF"));  // 1 meci

  const koRoundMatchupsMap = {R32:r32Matchups,R16:r16Matchups,QF:qfMatchups,SF:sfMatchups,F:fMatchups};
  const koRoundMatchups = stage!=="groups"&&stage!=="best3" ? (koRoundMatchupsMap[koRound]||[]) : [];

  // Matchup-uri PREZISE de user (din groupRankings, nu din realStandings)
  const predWinners  = GROUPS.map(g=>(allGroupStandings[g]||[])[0]).filter(Boolean);
  const predRunners  = GROUPS.map(g=>(allGroupStandings[g]||[])[1]).filter(Boolean);
  const predBest3    = best3.length===8 ? best3 : rankBest3ByFifa(GROUPS, allGroupStandings, REAL_GROUP_STATS);
  const PW = (i) => predWinners[i]  || "TBD";
  const PR = (i) => predRunners[i]  || "TBD";
  const PB = (i) => predBest3[i]    || "TBD";
  const predictedR32 = [
    {home:PW(0),away:PR(2)},{home:PW(2),away:PR(0)},{home:PW(1),away:PR(3)},{home:PW(3),away:PR(1)},
    {home:PW(4),away:PR(6)},{home:PW(6),away:PR(4)},{home:PW(5),away:PR(7)},{home:PW(7),away:PR(5)},
    {home:PW(8),away:PR(10)},{home:PW(10),away:PR(8)},{home:PW(9),away:PR(11)},{home:PW(11),away:PR(9)},
    {home:PB(0),away:PB(1)},{home:PB(2),away:PB(3)},{home:PB(4),away:PB(5)},{home:PB(6),away:PB(7)},
  ];
  const getPredWinners = (roundKey, predMap) =>
    Array.from({length:(predMap[roundKey]||[]).length},(_,i)=>{
      const pick=koPicks[`${roundKey}-${i}`];
      const m=(predMap[roundKey]||[])[i];
      if(!m||!pick) return "TBD";
      return pick==="home"?m.home:m.away;
    });
  const predR16Map = {R32:predictedR32};
  const predictedR16 = makePairs(getPredWinners("R32", predR16Map));
  const predR16Full  = {R32:predictedR32,R16:predictedR16};
  const predictedQF  = makePairs(getPredWinners("R16", predR16Full));
  const predQFFull   = {R32:predictedR32,R16:predictedR16,QF:predictedQF};
  const predictedSF  = makePairs(getPredWinners("QF",  predQFFull));
  const predSFFull   = {R32:predictedR32,R16:predictedR16,QF:predictedQF,SF:predictedSF};
  const predictedF   = makePairs(getPredWinners("SF",  predSFFull));
  const predictedMatchupsMap = {R32:predictedR32,R16:predictedR16,QF:predictedQF,SF:predictedSF,F:predictedF};

  const koLabel={R32:"Round of 32",R16:"Round of 16",QF:"Quarter-Finals",SF:"Semi-Finals",F:"Final"}[koRound]||koRound;
  const currentKo=koRoundMatchups[koIdx];

  // ── SHARED HEADER ────────────────────────────────────────────────────────────
  const navigateGroup = (dir) => { const next=groupIdx+dir; if(next>=0&&next<GROUPS.length) setGroupIdx(next); };
  const allGroupsDone = GROUPS.every(g=>groupRankings[g]&&groupRankings[g].every(t=>t!==null));
  const best3Done = best3.length>=8;
  const koRoundDone = (round) => {
    const n = (koRoundMatchupsMap[round]||[]).length;
    return n > 0 && Array.from({length:n},(_,i)=>koPicks[`${round}-${i}`]).every(Boolean);
  };
  const KO_ORDER = ["R32","R16","QF","SF","F"];
  const activePhaseId = stage==="best3"?"best3":stage==="ko"?koRound:null;
  const phaseAccessible = (id) => {
    if(id==="best3") return allGroupsDone;
    return koUnlocked && best3Done;
  };
  const goToPhase = (id) => {
    if(!phaseAccessible(id)) return;
    if(id==="best3") { setStage("best3"); }
    else { setStage("ko"); setKoRound(id); setKoShowIntro(true); setKoIdx(0); }
  };
  const headerTitle = stage==="groups"?`Group ${currentGroup}`:stage==="best3"?"Best 3rd Place":koLabel;
  const headerCounterVal = stage==="groups"?`${groupIdx+1}/${GROUPS.length}`:stage==="best3"?`${best3.length}/8`:`${koIdx+1}/${Math.max(koRoundMatchups.length,1)}`;
  const headerSub = stage==="groups"?"groups":stage==="best3"?"selected":"matches";
  // When startAtKo=true: groups/best3 are view-only; back from any stage goes to ko/home
  const effectiveViewMode = startAtKo ? (stage === "groups" || stage === "best3") : viewMode;
  const headerBack = () => { onBack&&onBack(); };
  const sharedNavIdx = stage==="groups" ? groupIdx : GROUPS.length-1;

  const sharedHeader = (
    <div style={{background:"rgba(0,32,91,0.88)", paddingBottom:0, flexShrink:0, position:"relative", zIndex:1, overflow:"hidden"}}>
      {/* Top row */}
      <div style={{display:"flex", alignItems:"center", gap:10, padding:"10px 20px 6px"}}>
        <button onClick={headerBack} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:10,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>‹</button>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{headerTitle}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{headerCounterVal}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>{headerSub}</div>
        </div>
      </div>
      {/* Phases row */}
      <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px 10px"}}>
        {(()=>{
          const grupeActive=stage==="groups";
          const grupeDone=allGroupsDone;
          return (
            <button onClick={()=>{
              if(stage!=="groups"){ setStage("groups"); setShowGroupsSlider(true); }
              else setShowGroupsSlider(v=>!v);
            }} style={{
              flexShrink:0,height:36,borderRadius:9,padding:"4px 10px",
              background:grupeActive?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.06)",
              border:`1.5px solid ${grupeActive?"rgba(255,255,255,0.45)":"transparent"}`,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",
              cursor:"pointer",position:"relative",
              opacity:1,WebkitTapHighlightColor:"transparent",
            }}>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.85)",fontWeight:800,letterSpacing:0.3,lineHeight:1,textAlign:"center"}}>Groups</span>
              <span style={{fontSize:10,lineHeight:1}}>
                {grupeDone?"✓":grupeActive?"●":"○"}
              </span>
              {showGroupsSlider&&<span style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:`5px solid rgba(255,255,255,0.4)`}}/>}
            </button>
          );
        })()}
        <div style={{width:1,height:28,background:"rgba(255,255,255,0.2)",flexShrink:0}}/>
        {[{id:"best3",name:T[lang].best3Short},{id:"R32",name:"Round of 32"},{id:"R16",name:"Round of 16"},{id:"QF",name:"Quarter"},{id:"SF",name:"Semi"},{id:"F",name:"Final"}].map(ph=>{
          const isActive=ph.id===activePhaseId;
          const accessible=phaseAccessible(ph.id);
          return (
            <button key={ph.id} onClick={()=>goToPhase(ph.id)} disabled={!accessible&&!isActive} style={{flex:1,height:36,borderRadius:9,background:isActive?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.06)",border:`1.5px solid ${isActive?"rgba(255,255,255,0.45)":"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"4px 2px 3px",opacity:accessible||isActive?1:0.4,cursor:accessible?"pointer":"default",WebkitTapHighlightColor:"transparent"}}>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.85)",fontWeight:800,letterSpacing:0.3,lineHeight:1,textAlign:"center"}}>{ph.name}</span>
              <span style={{fontSize:10,lineHeight:1}}>{ph.id==="best3"&&best3Done?"✓":koRoundDone(ph.id)?"✓":isActive?"●":accessible?"○":"🔒"}</span>
            </button>
          );
        })}
      </div>
      {/* Groups slider — expandable */}
      {showGroupsSlider&&(
        <div style={{display:"flex",alignItems:"center",gap:5,padding:"0 10px 10px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <button onClick={()=>navigateGroup(-1)} disabled={groupIdx===0} style={{flexShrink:0,width:16,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:groupIdx>0?"pointer":"default",opacity:groupIdx>0?0.6:0.2,transition:"opacity 0.15s",background:"none",border:"none",WebkitTapHighlightColor:"transparent"}}>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6L6 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{flex:1,overflow:"hidden",height:38}}>
            <div ref={sliderScrollRef} style={{width:"100%",height:"calc(100% + 20px)",overflowX:"scroll",overflowY:"hidden",WebkitOverflowScrolling:"touch"}}>
            <div style={{display:"flex",gap:5,alignItems:"center",height:38}}>
              {GROUPS.map((g,i)=>{
                const isCurrent=stage==="groups"&&i===groupIdx;
                const isDone=groupRankings[g]&&groupRankings[g].every(t=>t!==null);
                return (
                  <button key={g} onClick={()=>{setGroupIdx(i);setStage("groups");}} style={{
                    flexShrink:0,width:38,height:34,borderRadius:9,
                    background:isCurrent?"#fff":isDone?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.1)",
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
                    fontSize:isCurrent?15:12,fontWeight:900, border:"none",
                    color:isCurrent?NAVY:"rgba(255,255,255,0.75)",
                    cursor:"pointer",position:"relative",
                    transition:"all 0.22s", WebkitTapHighlightColor:"transparent",
                    boxShadow:isCurrent?"0 2px 10px rgba(0,0,0,0.3)":"none",
                  }}>
                    {g}
                    {isDone&&<span style={{fontSize:11,lineHeight:1,color:isCurrent?GREEN:"#4ade80",fontWeight:900}}>✓</span>}
                  </button>
                );
              })}
            </div>
            </div>
          </div>
          <button onClick={()=>navigateGroup(1)} disabled={groupIdx>=GROUPS.length-1} style={{flexShrink:0,width:16,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:groupIdx<GROUPS.length-1?"pointer":"default",opacity:groupIdx<GROUPS.length-1?0.6:0.2,transition:"opacity 0.15s",background:"none",border:"none",WebkitTapHighlightColor:"transparent"}}>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}
      {effectiveViewMode&&(
        <div style={{textAlign:"center",padding:"5px 0",background:"rgba(0,0,0,0.25)",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",letterSpacing:0.5}}>
          🔒 {lang==="en"?"View only · task ended":lang==="fr"?"Lecture seule · tâche terminée":"Doar vizualizare · task încheiat"}
        </div>
      )}
    </div>
  );
  // ─────────────────────────────────────────────────────────────────────────────

  // BEST3

  if(stage==="best3") {
    const seenThirds=new Set();
    const thirdTeams=GROUPS.map(g=>(allGroupStandings[g]||[])[2]).filter(t=>{ if(!t||seenThirds.has(t)) return false; seenThirds.add(t); return true; });
    const needed=8;
    const available=thirdTeams.filter(t=>!best3.includes(t));
    const allGroupsFinished = GROUPS.every(g => (realStandings[g]||[]).length === 4);
    const actualThirdsSet = allGroupsFinished
      ? new Set(GROUPS.map(g => (realStandings[g]||[])[2]).filter(Boolean))
      : null;
    const C3={"Mexico":"MEX","South Africa":"RSA","South Korea":"KOR","Czechia":"CZE",
      "Canada":"CAN","Switzerland":"SUI","Qatar":"QAT","Bosnia-Herzegovina":"BIH",
      "Brazil":"BRA","Morocco":"MAR","Scotland":"SCO","Haiti":"HAI",
      "USA":"USA","Paraguay":"PAR","Australia":"AUS","Turkiye":"TUR",
      "Germany":"GER","Ecuador":"ECU","Ivory Coast":"CIV","Curacao":"CUW",
      "Netherlands":"NED","Japan":"JPN","Tunisia":"TUN","Sweden":"SWE",
      "Belgium":"BEL","Iran":"IRI","Egypt":"EGY","New Zealand":"NZL",
      "Spain":"ESP","Uruguay":"URU","Saudi Arabia":"KSA","Cape Verde":"CPV",
      "France":"FRA","Senegal":"SEN","Norway":"NOR","Iraq":"IRQ",
      "Argentina":"ARG","Austria":"AUT","Algeria":"ALG","Jordan":"JOR",
      "Portugal":"POR","Colombia":"COL","Uzbekistan":"UZB","DR Congo":"COD",
      "England":"ENG","Croatia":"CRO","Panama":"PAN","Ghana":"GHA"};
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,userSelect:"none",position:"relative",overflow:"hidden"}}>

        {sharedHeader}
        {/* Progress bar */}
        <div style={{height:3,background:"rgba(255,255,255,0.1)",flexShrink:0}}>
          <div style={{height:"100%",width:`${(best3.length/needed)*100}%`,
            background:`linear-gradient(to right,${RED},${GREEN})`,transition:"width 0.3s"}}/>
        </div>

        {/* ── SELECTED — advancing teams ── */}
        <div style={{background:"#f0f2f8",borderBottom:"1px solid rgba(0,0,0,0.08)",
          padding:"10px 14px",minHeight:70}}>
          <div style={{fontSize:11,color:"rgba(0,0,0,0.38)",fontWeight:800,
            letterSpacing:1.5,marginBottom:8}}>{effectiveViewMode?"ADVANCING":"ADVANCING · TAP TO REMOVE"}</div>
          {best3.length===0 ? (
            <div style={{fontSize:12,color:"rgba(0,0,0,0.25)",fontStyle:"italic",paddingBottom:4}}>
              Tap a team below to add them here
            </div>
          ) : (
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {best3.map(team=>{
                const isCorrect = actualThirdsSet ? actualThirdsSet.has(team) : null;
                return (
                  <button key={team} onClick={()=>!effectiveViewMode&&setBest3(prev=>prev.filter(t=>t!==team))}
                    style={{
                      display:"flex",alignItems:"center",gap:5,
                      padding:"4px 10px 4px 6px",borderRadius:20,
                      background: effectiveViewMode&&isCorrect!==null?(isCorrect?`${GREEN}18`:"rgba(220,38,38,0.08)"):`${GREEN}18`,
                      border: effectiveViewMode&&isCorrect!==null?`1.5px solid ${isCorrect?GREEN:"#EF4444"}`:`1.5px solid ${GREEN}`,
                      cursor:effectiveViewMode?"default":"pointer",transition:"all 0.15s",
                      WebkitTapHighlightColor:"transparent",
                    }}>
                    <span style={{fontSize:18,lineHeight:1}}>{FLAGS[team]||"🏳"}</span>
                    <span style={{fontSize:11,fontWeight:800,color:NAVY,
                      textTransform:"uppercase"}}>{C3[team]||team.slice(0,3).toUpperCase()}</span>
                    {effectiveViewMode&&isCorrect!==null ? (
                      <span style={{fontSize:10,fontWeight:900,marginLeft:1,color:isCorrect?GREEN:"#EF4444"}}>
                        {isCorrect?"+5":"✗"}
                      </span>
                    ) : (
                      <span style={{fontSize:10,color:GREEN,fontWeight:900,marginLeft:1}}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── AVAILABLE TEAMS ── */}
        <div style={{flex:1,minHeight:0,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",background:BG,padding:"8px 14px",
          display:"flex",flexDirection:"column",gap:6}}>
          {(()=>{
            const displayList = effectiveViewMode && allGroupsFinished
              ? GROUPS.map(g => {
                  const real3rd = (realStandings[g]||[])[2];
                  if (!real3rd || best3.includes(real3rd)) return null;
                  return { team: real3rd, group: g };
                }).filter(Boolean)
              : available.map(team => ({
                  team,
                  group: GROUPS.find(g=>(allGroupStandings[g]||[])[2]===team)||"?",
                }));
            if (!displayList.length) return (
              <div style={{textAlign:"center",padding:"20px 0",
                color:"rgba(0,0,0,0.3)",fontSize:13,fontStyle:"italic"}}>
                {effectiveViewMode && allGroupsFinished ? "All real 3rd-place teams selected ✓" : "All 3rd-place teams selected ✓"}
              </div>
            );
            return displayList.map(({team, group})=>{
              const disabled = best3.length >= needed;
              return (
                <div key={team} onClick={()=>!effectiveViewMode&&!disabled&&setBest3(prev=>[...prev,team])}
                  style={{
                    display:"flex",alignItems:"center",gap:12,
                    padding:"11px 14px",borderRadius:14,
                    background:"#fff",
                    border:"1.5px solid rgba(0,0,0,0.06)",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
                    cursor:(effectiveViewMode||disabled)?"default":"pointer",
                    opacity:disabled?0.4:1,
                    transition:"all 0.15s",
                    minHeight:56,
                  }}>
                  <div style={{
                    width:30,height:30,borderRadius:8,flexShrink:0,
                    background: effectiveViewMode?"rgba(220,38,38,0.07)":"rgba(0,0,0,0.05)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>
                    <span style={{fontSize:11,fontWeight:700,color:effectiveViewMode?"#EF4444":"rgba(0,0,0,0.2)"}}>
                      {effectiveViewMode?"✗":"?"}
                    </span>
                  </div>
                  <div style={{width:40,height:28,borderRadius:6,overflow:"hidden",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.15)",flexShrink:0,position:"relative"}}>
                    <FlagBg team={team} style={{}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:800,color:"#111",
                      letterSpacing:0.3,textTransform:"uppercase"}}>{team}</div>
                    <div style={{fontSize:10,color:"rgba(0,0,0,0.35)",marginTop:1,fontWeight:600}}>
                      {effectiveViewMode?`Group ${group} · real 3rd · not picked`:`Group ${group} · 3rd place`}
                    </div>
                  </div>
                  {!effectiveViewMode && (
                    <div style={{
                      width:24,height:24,borderRadius:"50%",flexShrink:0,
                      background:"rgba(0,0,0,0.06)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      <span style={{fontSize:14,color:"rgba(0,0,0,0.25)",lineHeight:1}}>+</span>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* ── CONFIRM BUTTON ── */}
        <div style={{background:"#fff",padding:"10px 14px 22px",
          borderTop:"1px solid rgba(0,0,0,0.07)"}}>
          <button onClick={()=>{ if(effectiveViewMode){ startAtKo ? setStage("ko") : (onBack&&onBack()); } else if(best3.length>=needed){ onComplete&&onComplete(); } }}
            disabled={!effectiveViewMode&&best3.length<needed}
            style={{
              width:"100%",padding:"14px 0",borderRadius:14,border:"none",
              background:(effectiveViewMode||best3.length>=needed)
                ?`linear-gradient(135deg,${GREEN},#007A36)`
                :"rgba(0,0,0,0.06)",
              color:(effectiveViewMode||best3.length>=needed)?"#fff":"rgba(0,0,0,0.2)",
              fontSize:15,fontWeight:900,letterSpacing:1,
              cursor:(effectiveViewMode||best3.length>=needed)?"pointer":"default",
              transition:"all 0.2s",
              boxShadow:(effectiveViewMode||best3.length>=needed)?"0 4px 20px rgba(0,154,68,0.3)":"none",
            }}>
            {best3.length>=needed
              ?"SALVEAZĂ PREDICȚIILE ✓"
              :effectiveViewMode
                ? startAtKo ? "← Back to Knockout" : "← Back to Home"
                :`SELECT ${needed-best3.length} MORE TEAM${needed-best3.length!==1?"S":""}`}
          </button>
        </div>
      </div>
    );
  }

  // KO PHASE
  if(stage==="ko") {
    if(showFinalSummary) {
      // Derive podium from koPicks
      const getWinner = (roundKey, idx) => {
        const pick = koPicks[`${roundKey}-${idx}`];
        const map = {R32:r32Matchups,R16:r16Matchups,QF:qfMatchups,SF:sfMatchups,F:fMatchups};
        const m = (map[roundKey]||[])[idx];
        if(!m||!pick) return "TBD";
        return pick==="home"?m.home:m.away;
      };
      const getLosers = (roundKey, matchups) =>
        (matchups||[]).map((_,i)=>{
          const pick=koPicks[`${roundKey}-${i}`];
          const m=(matchups||[])[i];
          if(!m||!pick) return null;
          return pick==="home"?m.away:m.home;
        }).filter(Boolean);

      const champion = getWinner("F",0);
      const runnerUp = fMatchups[0] ? (koPicks["F-0"]==="home" ? fMatchups[0].away : fMatchups[0].home) : "TBD";
      const sfLosers = getLosers("SF", sfMatchups);
      const third = sfLosers[0]||"TBD";
      const fourth = sfLosers[1]||"TBD";

      const PodiumCard = ({pos,team,color,size,label}) => (
        <div style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:8,
          flex:1,
        }}>
          <div style={{fontSize:pos===1?24:18,lineHeight:1}}>{["🥇","🥈","🥉","4️⃣"][pos-1]}</div>
          <div style={{
            width:size,height:size,borderRadius:"50%",
            background:`${(TEAM_COLORS[team]||["#444"])[0]}33`,
            border:`3px solid ${color}`,
            boxShadow:`0 4px 20px ${color}55`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:size*0.55,lineHeight:1,
          }}>
            {FLAGS[team]||"🏳"}
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:pos===1?13:10,fontWeight:900,color:"#fff",
              textTransform:"uppercase",letterSpacing:0.3,lineHeight:1.2}}>{team==="TBD"?"?":team.split(" ")[0]}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:600,marginTop:2}}>{label}</div>
          </div>
        </div>
      );

      const scoreRows = [
        { icon:"⚽", label:"Grupe · 1st loc",  pts:PRED_SCORING.group1st, count:12, max:PRED_MAX.groups/3,  color:NAVY },
        { icon:"⚽", label:"Grupe · 2nd loc",  pts:PRED_SCORING.group2nd, count:12, max:PRED_MAX.groups/3,  color:NAVY },
        { icon:"⚽", label:"Grupe · 3rd loc",  pts:PRED_SCORING.group3rd, count:12, max:PRED_MAX.groups/3,  color:NAVY },
        { icon:"🥉", label:T[lang].best3Short,    pts:PRED_SCORING.best3,    count:8,  max:PRED_MAX.best3,     color:"#7B2FBE" },
        { icon:"🏆", label:"Round of 32",       pts:PRED_SCORING.r32,      count:16, max:PRED_MAX.r32,       color:RED },
        { icon:"🏆", label:"Round of 16",       pts:PRED_SCORING.r16,      count:8,  max:PRED_MAX.r16,       color:RED },
        { icon:"🏆", label:"Quarter-Finals",    pts:PRED_SCORING.qf,       count:4,  max:PRED_MAX.qf,        color:RED },
        { icon:"🏆", label:"Semi-Finals",       pts:PRED_SCORING.sf,       count:2,  max:PRED_MAX.sf,        color:"#D4820A" },
        { icon:"🏆", label:"Final",             pts:PRED_SCORING.final,    count:1,  max:PRED_MAX.final,     color:"#D4820A" },
      ];

      return (
        <div style={{flex:1,display:"flex",flexDirection:"column",userSelect:"none",background:"#f0f2f8",overflow:"hidden"}}>
          {/* Header navy */}
          <div style={{background:`linear-gradient(135deg,${NAVY},#001840)`,padding:"14px 14px 16px",flexShrink:0,position:"relative",overflow:"hidden"}}>
            <img src={trophy} alt="" style={{position:"absolute",width:"120%",height:"100%",left:"-10%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",filter:"grayscale(1) contrast(1.5)"}}/>
            <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <button onClick={()=>{ if(viewMode) onBack&&onBack(); else setShowFinalSummary(false); }}
                style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,
                  width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>‹</button>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"#FFD700",fontWeight:800,letterSpacing:1.5}}>Predicto</div>
                <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{T[lang].yourPredictions}</div>
              </div>
              <div style={{background:"rgba(255,215,0,0.2)",borderRadius:12,padding:"6px 12px",border:"1px solid rgba(255,215,0,0.4)"}}>
                <div style={{fontSize:11,color:"rgba(255,215,0,0.7)",fontWeight:700,letterSpacing:1,textAlign:"center"}}>MAX</div>
                <div style={{fontSize:18,fontWeight:900,color:"#FFD700",lineHeight:1}}>{PRED_MAX.total}</div>
                <div style={{fontSize:11,color:"rgba(255,215,0,0.6)",fontWeight:600,textAlign:"center"}}>{T[lang].possiblePts}</div>
              </div>
            </div>
            {/* Podium */}
            <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"flex-end",justifyContent:"center",gap:8}}>
              <PodiumCard pos={2} team={runnerUp} color="#C0C0C0" size={52} label="Runner-up"/>
              <PodiumCard pos={1} team={champion} color="#FFD700" size={68} label="Champion 🏆"/>
              <PodiumCard pos={3} team={third}    color="#CD7F32" size={44} label="3rd place"/>
            </div>
          </div>

          {/* Scoring breakdown */}
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px 8px"}}>
            <div style={{fontSize:10,fontWeight:800,color:"#aaa",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>{T[lang].pointsPerPrediction}</div>
            <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",overflow:"hidden",marginBottom:12}}>
              {scoreRows.map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",padding:"9px 14px",borderBottom:i<scoreRows.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
                  <span style={{fontSize:13,marginRight:8,flexShrink:0}}>{r.icon}</span>
                  <span style={{flex:1,fontSize:11,fontWeight:700,color:"#333"}}>{r.label}</span>
                  <span style={{fontSize:10,color:"#bbb",marginRight:8,fontWeight:600}}>×{r.count}</span>
                  <div style={{background:`${r.color}18`,borderRadius:7,padding:"2px 8px",minWidth:52,textAlign:"center"}}>
                    <span style={{fontSize:12,fontWeight:900,color:r.color}}>+{r.pts}</span>
                  </div>
                  <span style={{fontSize:10,color:"#bbb",marginLeft:8,fontWeight:700,minWidth:44,textAlign:"right"}}>{r.max} max</span>
                </div>
              ))}
            </div>
            <div style={{background:`linear-gradient(135deg,${NAVY},#003580)`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <span style={{fontSize:13,fontWeight:800,color:"rgba(255,255,255,0.8)"}}>{T[lang].maxPossiblePoints}</span>
              <span style={{fontSize:22,fontWeight:900,color:"#FFD700"}}>{PRED_MAX.total} pts</span>
            </div>
          </div>

          {/* Save button */}
          {!viewMode && <div style={{padding:"8px 14px 24px",flexShrink:0}}>
            <button onClick={()=>startAtKo ? (onKoComplete&&onKoComplete()) : (onComplete&&onComplete())}
              style={{width:"100%",padding:"15px 0",borderRadius:14,border:"none",
                background:`linear-gradient(135deg,${GREEN},#007A36)`,
                color:"#fff",fontSize:15,fontWeight:900,letterSpacing:1,cursor:"pointer",
                boxShadow:"0 4px 24px rgba(0,154,68,0.4)"}}>
              SALVEAZĂ PREDICȚIILE ✓
            </button>
          </div>}
        </div>
      );
    }
    if(koShowIntro) return (
      <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",background:BG,userSelect:"none",position:"relative",overflow:"hidden"}}>
        <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
        {sharedHeader}
        <GroupIntroScreen group={koRound} teams={koRoundMatchups.map(m=>[m.home,m.away])}
          isKo={true} hideHeader={true} onStart={()=>setKoShowIntro(false)} picks={koPicks} viewMode={viewMode}/>
      </div>
    );
    const predictedKo = (predictedMatchupsMap[koRound]||[])[koIdx];
    const homeChanged = viewMode && predictedKo && currentKo &&
      predictedKo.home !== currentKo.home &&
      currentKo.home !== "TBD" && predictedKo.home !== "TBD";
    const awayChanged = viewMode && predictedKo && currentKo &&
      predictedKo.away !== currentKo.away &&
      currentKo.away !== "TBD" && predictedKo.away !== "TBD";

    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,userSelect:"none"}}>
        {sharedHeader}
        {/* Indicator echipe înlocuite */}
        {viewMode && (homeChanged || awayChanged) && (
          <div style={{background:"rgba(200,16,46,0.08)",borderLeft:"3px solid #C8102E",
            margin:"8px 14px 0",borderRadius:"0 8px 8px 0",padding:"7px 12px",
            display:"flex",flexDirection:"column",gap:3}}>
            <p style={{fontSize:10,fontWeight:800,color:"#C8102E",margin:0,letterSpacing:1,textTransform:"uppercase"}}>
              ⚠️ Echipe schimbate față de predicție
            </p>
            {homeChanged && (
              <p style={{fontSize:12,color:"#555",margin:0}}>
                <span style={{fontWeight:700}}>{currentKo.home}</span>
                {" "}a înlocuit{" "}
                <span style={{textDecoration:"line-through",color:"#aaa"}}>{predictedKo.home}</span>
              </p>
            )}
            {awayChanged && (
              <p style={{fontSize:12,color:"#555",margin:0}}>
                <span style={{fontWeight:700}}>{currentKo.away}</span>
                {" "}a înlocuit{" "}
                <span style={{textDecoration:"line-through",color:"#aaa"}}>{predictedKo.away}</span>
              </p>
            )}
          </div>
        )}
        <MatchSwipeCard key={`ko-${koRound}-${koIdx}`}
          home={currentKo?.home||"TBD"} away={currentKo?.away||"TBD"}
          existingPick={koPicks[`${koRound}-${koIdx}`]||null}
          onPick={viewMode ? undefined : (result)=>{
            const key=`${koRound}-${koIdx}`;
            setKoPicks(p=>({...p,[key]:result}));
            if(koIdx<koRoundMatchups.length-1){ setKoIdx(i=>i+1); }
            else {
              const nxt={R32:"R16",R16:"QF",QF:"SF",SF:"F"}[koRound];
              if(nxt){setKoRound(nxt);setKoIdx(0);setKoShowIntro(true);}
              else setShowFinalSummary(true);
            }
          }}
          onFlash={()=>{}}
          onBack={()=>{ if(koIdx>0)setKoIdx(k=>k-1); else setKoShowIntro(true); }}
          canGoBack={koIdx>0} groupLabel={koLabel} matchNum={koIdx}
          totalMatches={koRoundMatchups.length} isKo={true}/>
      </div>
    );
  }

  // GROUP STAGE — direct la GroupRankingScreen, fără intro

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,userSelect:"none",position:"relative",overflow:"hidden"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      {sharedHeader}
      <GroupRankingScreen
        hideHeader={true}
        key={currentGroup}
        group={currentGroup}
        teams={ALL_GROUPS_DATA[currentGroup]||[]}
        existingRanking={groupRankings[currentGroup]||null}
        onConfirm={handleGroupConfirm}
        onAutoSave={handleGroupAutoSave}
        onBack={handleGroupBack}
        groupIdx={groupIdx}
        totalGroups={GROUPS.length}
        groupRankings={groupRankings}
        onNavigate={navigateGroup}
        viewMode={effectiveViewMode}
        realGroupStandings={realStandings[currentGroup]||[]}
      />
    </div>
  );
}

function InstantPickSummaryScreen({ picks, koPicks, best3, getGroupStanding, onConfirm, readOnly }) {
  const lang = useLang();
  const { pred, exact } = useScoringRules();
  const GROUPS = INTERACTIVE_GROUPS;
  const ALL_ROUNDS = ["R16","QF","SF","Final"];

  // Find champion from koPicks
  const champion = koPicks["final"] || null;

  const SCORING = [
    { label:"⚽ Groups · Correct Result",  pts:exact.group_result, color:NAVY,        icon:"✓" },
    { label:"🥉 Best Third · per echipă",  pts:pred.best3,         color:"#7B2FBE",   icon:"✓" },
    { label:"🏆 Round of 16",              pts:pred.r16,           color:RED,         icon:"✓" },
    { label:"🏆 Sferturi",                 pts:pred.qf,            color:RED,         icon:"✓" },
    { label:"🏆 Semifinale",               pts:pred.sf,            color:RED,         icon:"✓" },
    { label:"🏆 Final",                    pts:pred.final,         color:"#D4820A",   icon:"✓" },
  ];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden"}}>
      {/* Champion header */}
      <div style={{background:`linear-gradient(160deg,#D4820A,#F0A020)`,padding:"28px 20px 24px",textAlign:"center",flexShrink:0}}>
        <p style={{fontSize:10,fontWeight:900,color:"rgba(255,255,255,0.7)",margin:"0 0 8px",letterSpacing:3,textTransform:"uppercase"}}>{T[lang].yourPredictedChampion}</p>
        {champion ? (<>
          <span style={{fontSize:90,lineHeight:1,filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.4))"}}>{FLAGS[champion]||"🏳"}</span>
          <p style={{fontSize:28,fontWeight:900,color:"#fff",margin:"12px 0 4px",textShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>{champion}</p>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",margin:0,fontWeight:600}}>🏆 {T[lang].worldCupWinner}</p>
        </>) : (
          <p style={{fontSize:18,color:"rgba(255,255,255,0.6)",margin:"16px 0"}}>{T[lang].noChampionSelected}</p>
        )}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>{T[lang].pointsPerPrediction}</p>
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
            {T[lang].confirmPredictions}
          </button>
        )}
        {readOnly && (
          <div style={{width:"100%",padding:"16px 0",borderRadius:16,background:"#ccc",textAlign:"center",marginBottom:24}}>
            <span style={{fontSize:14,fontWeight:700,color:"#888"}}>{T[lang].predictionsLocked}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupRankingScreen({ group, teams, existingRanking, onConfirm, onAutoSave, onBack, groupIdx, totalGroups, onNavigate, groupRankings, hideHeader=false, viewMode=false, realGroupStandings=[] }) {
  const lang = useLang();
  const { pred: PRED_SCORING } = useScoringRules();
  const groupDone = realGroupStandings.length === 4;
  const PTS_MAP = [PRED_SCORING.group1st, PRED_SCORING.group2nd, PRED_SCORING.group3rd, 0];
  const effectiveViewMode = viewMode || groupDone;
  const [ranking, setRanking] = useState(existingRanking || [null, null, null, null]);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const rowRefs = useRef([]);
  const tabsSwipeRef = useRef({startX:0});
  const sliderRef = useRef(null);

  const CODE = {
    "Mexico":"MEX","South Africa":"RSA","South Korea":"KOR","Czechia":"CZE",
    "Canada":"CAN","Switzerland":"SUI","Qatar":"QAT","Bosnia-Herzegovina":"BIH",
    "Brazil":"BRA","Morocco":"MAR","Scotland":"SCO","Haiti":"HAI",
    "USA":"USA","Paraguay":"PAR","Australia":"AUS","Turkiye":"TUR",
    "Germany":"GER","Ecuador":"ECU","Ivory Coast":"CIV","Curacao":"CUW",
    "Netherlands":"NED","Japan":"JPN","Tunisia":"TUN","Sweden":"SWE",
    "Belgium":"BEL","Iran":"IRI","Egypt":"EGY","New Zealand":"NZL",
    "Spain":"ESP","Uruguay":"URU","Saudi Arabia":"KSA","Cape Verde":"CPV",
    "France":"FRA","Senegal":"SEN","Norway":"NOR","Iraq":"IRQ",
    "Argentina":"ARG","Austria":"AUT","Algeria":"ALG","Jordan":"JOR",
    "Portugal":"POR","Colombia":"COL","Uzbekistan":"UZB","DR Congo":"COD",
    "England":"ENG","Croatia":"CRO","Panama":"PAN","Ghana":"GHA",
  };

  const ALL_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const isComplete = ranking.every(t => t !== null);

  useEffect(() => {
    if (isComplete && onAutoSave) onAutoSave(ranking);
  }, [ranking, isComplete]);

  const handleTileClick = (team) => {
    if (ranking.includes(team)) {
      setRanking(prev => prev.map(t => t === team ? null : t));
    } else {
      setRanking(prev => {
        const next = [...prev];
        const idx = next.indexOf(null);
        if (idx !== -1) next[idx] = team;
        return next;
      });
    }
  };

  const handleSlotClick = (idx) => {
    setRanking(prev => { const n=[...prev]; n[idx]=null; return n; });
  };

  // Touch drag-to-reorder
  const handleTouchStart = (e, idx) => {
    e.stopPropagation();
    setDragIdx(idx);
    setDragOverIdx(null);
  };
  const handleTouchMove = (e) => {
    if (dragIdx === null) return;
    const y = e.touches[0].clientY;
    let found = null;
    rowRefs.current.forEach((ref, i) => {
      if (!ref || i === dragIdx) return;
      const rect = ref.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) found = i;
    });
    if (found !== null && found !== dragOverIdx) {
      setDragOverIdx(found);
      // swap immediately for real-time feel
      setRanking(prev => {
        const next = [...prev];
        [next[dragIdx], next[found]] = [next[found], next[dragIdx]];
        return next;
      });
      setDragIdx(found);
    }
  };
  const handleTouchEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const rankingContainerRef = useRef(null);

  useEffect(() => {
    const el = rankingContainerRef.current;
    if (!el) return;
    const prevent = (e) => { if (dragIdx !== null) e.preventDefault(); };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, [dragIdx]);

  const resetRanking = () => setRanking([null, null, null, null]);
  const autoPickRanking = () => {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    setRanking(shuffled);
  };

  const placeColors = ["#FFD700","#C0C0C0","#CD7F32","#C8102E"];
  const placeTextColor = ["#000","#000","#000","#fff"];

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", background:"transparent", userSelect:"none", position:"relative", overflow:"hidden"}}>
      {!hideHeader && <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>}

      {/* ── NAVY HEADER ── */}
      {!hideHeader && <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`, paddingBottom:0}}>

        {/* Top row */}
        <div style={{display:"flex", alignItems:"center", gap:10, padding:"10px 14px 6px"}}>
          <button onClick={onBack} style={{
            background:"rgba(255,255,255,0.12)", border:"none", borderRadius:10,
            width:34, height:34, color:"#fff", fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:18, fontWeight:900, color:"#fff"}}>{T[lang].group} {group}</div>
          </div>
          <div style={{textAlign:"right", flexShrink:0}}>
            <div style={{fontSize:13, fontWeight:700, color:"#fff"}}>{groupIdx+1}/{totalGroups}</div>
            <div style={{fontSize:10, color:"rgba(255,255,255,0.45)"}}>{T[lang].groups}</div>
          </div>
        </div>

        {/* ── Carousel grupe + separator + faze blocate ── */}
        <div style={{display:"flex", alignItems:"center", gap:5, padding:"6px 10px 10px"}}>

          {/* Săgeată stânga */}
          <div onClick={()=>groupIdx>0&&onNavigate&&onNavigate(-1)}
            style={{
              flexShrink:0, width:16, height:34,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor: groupIdx===0 ? "default" : "pointer",
              opacity: groupIdx===0 ? 0.2 : 0.5,
              transition:"opacity 0.15s",
            }}>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M6 1L1 6L6 11" stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Carousel grupe A-L */}
          <div style={{flex:"0 0 auto", width:"calc(55% - 58px)", overflow:"hidden", position:"relative", height:38}}>
            <div style={{
              display:"flex", gap:5, alignItems:"center",
              transform:`translateX(calc(50% - ${groupIdx * 43 + 19}px))`,
              transition:"transform 0.25s cubic-bezier(0.4,0,0.2,1)",
              height:"100%",
            }}
              onTouchStart={e=>{ tabsSwipeRef.current.startX=e.touches[0].clientX; }}
              onTouchEnd={e=>{
                const dx=e.changedTouches[0].clientX-tabsSwipeRef.current.startX;
                if(dx<-30&&groupIdx<11) onNavigate&&onNavigate(1);
                else if(dx>30&&groupIdx>0) onNavigate&&onNavigate(-1);
              }}
            >
              {["A","B","C","D","E","F","G","H","I","J","K","L"].map((g,i)=>{
                const isCurrent=i===groupIdx;
                const isDone=groupRankings&&groupRankings[g]&&groupRankings[g].every(t=>t!==null);
                const dist=Math.abs(i-groupIdx);
                return (
                  <div key={g} onClick={()=>onNavigate&&onNavigate(i-groupIdx)} style={{
                    flexShrink:0, width:38, height:34, borderRadius:9,
                    background:isCurrent?"#fff":isDone?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.1)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:isCurrent?15:12, fontWeight:900,
                    color:isCurrent?NAVY:"rgba(255,255,255,0.75)",
                    cursor:"pointer", position:"relative",
                    opacity:dist===0?1:dist===1?0.7:dist===2?0.45:0.2,
                    transform:`scale(${isCurrent?1:dist===1?0.88:0.78})`,
                    transition:"all 0.22s",
                    boxShadow:isCurrent?"0 2px 10px rgba(0,0,0,0.3)":"none",
                  }}>
                    {g}
                    {isDone&&!isCurrent&&(
                      <span style={{position:"absolute",top:-2,right:-2,width:6,height:6,
                        borderRadius:"50%",background:GREEN,border:"1.5px solid "+NAVY}}/>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Săgeată dreapta */}
          <div onClick={()=>groupIdx<11&&onNavigate&&onNavigate(1)}
            style={{
              flexShrink:0, width:16, height:34,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor: groupIdx===11 ? "default" : "pointer",
              opacity: groupIdx===11 ? 0.2 : 0.5,
              transition:"opacity 0.15s",
            }}>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M1 1L6 6L1 11" stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Separator */}
          <div style={{width:1, height:28, background:"rgba(255,255,255,0.2)", flexShrink:0}}/>

          {/* Faze blocate — nume sus, 🔒 jos */}
          {[
            {name:"Round of 32"},
            {name:"Round of 16"},
            {name:"Quarter"},
            {name:"Semi"},
            {name:"Final"},
          ].map(phase=>(
            <div key={phase.name} style={{
              flex:1, height:36, borderRadius:9,
              background:"rgba(255,255,255,0.06)",
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"space-between",
              padding:"4px 2px 3px", opacity:0.4,
            }}>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.8)",fontWeight:800,
                letterSpacing:0.3,lineHeight:1,textAlign:"center"}}>{phase.name}</span>
              <span style={{fontSize:10,lineHeight:1}}>🔒</span>
            </div>
          ))}
        </div>

      </div>}

      {/* ── TEAM TILES ── */}
      <div style={{background:"transparent", padding:"8px 14px 8px",
        borderBottom:"1px solid rgba(0,0,0,0.08)", position:"relative", zIndex:1}}>
        {!effectiveViewMode && <div style={{fontSize:10, color:"rgba(0,0,0,0.4)", letterSpacing:2,
          fontWeight:700, marginBottom:6, textAlign:"center"}}>TAP TO ASSIGN · TAP AGAIN TO REMOVE</div>}
        <div style={{display:"flex", gap:6, justifyContent:"space-between"}}>
          {teams.map(team => {
            const pos = ranking.indexOf(team);
            const isPlaced = pos !== -1;
            return (
              <div key={team} onClick={() => !effectiveViewMode && handleTileClick(team)} style={{
                flex:1, background: isPlaced ? "rgba(0,32,91,0.07)" : "#fff",
                borderRadius:10, padding:"7px 2px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                cursor:effectiveViewMode?"default":"pointer", position:"relative",
                border:`2px solid ${isPlaced ? "rgba(0,32,91,0.25)" : "rgba(0,0,0,0.08)"}`,
                transition:"all 0.15s",
                opacity: isPlaced ? 0.6 : 1,
                transform: isPlaced ? "scale(0.94)" : "scale(1)",
                boxShadow: isPlaced ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
              }}>
                {isPlaced && (
                  <div style={{
                    position:"absolute", top:-7, right:-5,
                    background: placeColors[pos],
                    borderRadius:"50%", width:18, height:18,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:900,
                    color: placeTextColor[pos],
                    border:"2px solid #f0f2f8",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
                  }}>{pos+1}</div>
                )}
                <span style={{fontSize:24, lineHeight:1}}>{FLAGS[team]||"🏳"}</span>
                <span style={{fontSize:11, fontWeight:800,
                  color: isPlaced ? NAVY : "rgba(0,0,0,0.5)",
                  letterSpacing:0.5, textTransform:"uppercase"}}>
                  {CODE[team]||team.slice(0,3).toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RANKING ROWS ── */}
      <div ref={rankingContainerRef} style={{flex:1, overflowY:"auto", background:"transparent", padding:"6px 14px", display:"flex", flexDirection:"column", gap:5, position:"relative", zIndex:1}}>
        {[0,1,2,3].map(idx => {
          const team = ranking[idx];
          const teamColor = team ? (TEAM_COLORS[team]||["#555"])[0] : null;
          const isDragging = dragIdx === idx;
          const isOver = dragOverIdx === idx;
          return (
            <div key={idx} ref={el => rowRefs.current[idx] = el}
              onTouchStart={team && !effectiveViewMode ? e=>handleTouchStart(e,idx) : undefined}
              onTouchMove={team && !effectiveViewMode ? handleTouchMove : undefined}
              onTouchEnd={team && !effectiveViewMode ? handleTouchEnd : undefined}
              style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"8px 12px", borderRadius:12,
                background: isDragging ? "#e8eeff" : isOver ? "#dde8ff" : "#fff",
                border:`1.5px solid ${isOver ? "#4a90e2" : isDragging ? "#7aaff5" : "rgba(0,0,0,0.06)"}`,
                boxShadow: isDragging ? "0 6px 20px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
                transform: isDragging ? "scale(1.02)" : "scale(1)",
                transition:"background 0.1s, box-shadow 0.1s, transform 0.1s",
                minHeight:50, cursor: team ? "grab" : "default",
                userSelect:"none", WebkitUserSelect:"none",
              }}>

              {/* Place badge */}
              {(idx < 3 || !team) ? (
                <div style={{
                  width:30, height:30, borderRadius:8, flexShrink:0,
                  background: team ? placeColors[idx] : "rgba(0,0,0,0.05)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, fontWeight:900,
                  color: team ? placeTextColor[idx] : "rgba(0,0,0,0.2)",
                  boxShadow: team ? `0 2px 8px ${placeColors[idx]}88` : "none",
                }}>{idx+1}</div>
              ) : (
                <div style={{width:30, height:30, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <span style={{fontSize:17, fontWeight:700, color:"#aaa"}}>4</span>
                </div>
              )}

              {team ? (
                <>
                  {/* Flag */}
                  <div style={{width:36, height:24, borderRadius:5, overflow:"hidden",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.15)", flexShrink:0, position:"relative"}}>
                    <FlagBg team={team} style={{}}/>
                  </div>
                  {/* Name */}
                  <div style={{flex:1, cursor:effectiveViewMode?"default":"pointer"}} onClick={()=>!effectiveViewMode&&handleSlotClick(idx)}>
                    <div style={{fontSize:13, fontWeight:800, color:"#111",
                      letterSpacing:0.3, textTransform:"uppercase"}}>{team}</div>
                    <div style={{fontSize:11, color:idx===0?GREEN:idx===1?"#4a90e2":idx===2?"#CD7F32":"rgba(0,0,0,0.35)",
                      marginTop:1, fontWeight:600}}>
                      {idx===0?T[lang].slotGroupWinner:idx===1?T[lang].slotRunnerUp:idx===2?T[lang].slotThirdPlace:T[lang].slotEliminated}
                    </div>
                  </div>
                  {/* Drag handle — touch to reorder */}
                  {!effectiveViewMode && <div
                    onTouchStart={e=>{ e.stopPropagation(); handleTouchStart(e, idx); }}
                    onTouchMove={e=>{ e.stopPropagation(); handleTouchMove(e); }}
                    onTouchEnd={e=>{ e.stopPropagation(); handleTouchEnd(); }}
                    style={{
                      display:"flex", flexDirection:"column", gap:4,
                      padding:"8px 6px", cursor:"grab", flexShrink:0,
                      touchAction:"none",
                    }}>
                    <div style={{width:20, height:2, background:"#999", borderRadius:2}}/>
                    <div style={{width:20, height:2, background:"#999", borderRadius:2}}/>
                  </div>}
                  {/* Scoring in view mode */}
                  {effectiveViewMode && groupDone && (() => {
                    const actualIdx = realGroupStandings.indexOf(team);
                    const earned = actualIdx === idx && idx < 3 ? PTS_MAP[idx] : 0;
                    return (
                      <div style={{textAlign:"right", flexShrink:0, minWidth:52}}>
                        <div style={{fontSize:10, color:"#aaa", fontWeight:500}}>
                          real {actualIdx >= 0 ? `${actualIdx+1}°` : "—"}
                        </div>
                        <div style={{fontSize:13, fontWeight:800, color: earned > 0 ? GREEN : "#ccc"}}>
                          {earned > 0 ? `+${earned}` : "0"} pts
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div style={{flex:1, display:"flex", alignItems:"center"}}>
                  <span style={{fontSize:12, color:"rgba(0,0,0,0.2)", letterSpacing:0.5}}>
                    — tap a team above —
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM ACTIONS ── */}
      <div style={{background:"#fff", padding:"8px 14px 16px",
        borderTop:"1px solid rgba(0,0,0,0.07)",
        display:"flex", flexDirection:"column", gap:6,
        position:"relative", zIndex:1}}>

        {/* Reset / Auto-pick row */}
        {!effectiveViewMode && <div style={{display:"flex", justifyContent:"space-between"}}>
          <button onClick={autoPickRanking} style={{
            background:"rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.08)",
            borderRadius:10, padding:"6px 14px",
            color:"rgba(0,0,0,0.45)", fontSize:12, cursor:"pointer", fontWeight:700,
          }}>{T[lang].btnAutoPick}</button>
          <button onClick={resetRanking} style={{
            background:"rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.08)",
            borderRadius:10, padding:"6px 14px",
            color:"rgba(0,0,0,0.45)", fontSize:12, cursor:"pointer", fontWeight:700,
          }}>{T[lang].btnReset}</button>
        </div>}

        {/* Confirm / Next */}
        <button onClick={() => (effectiveViewMode || isComplete) && onConfirm(ranking)}
          disabled={!effectiveViewMode && !isComplete}
          style={{
            width:"100%", padding:"12px 0", borderRadius:14, border:"none",
            background: (effectiveViewMode || isComplete)
              ? `linear-gradient(135deg, ${NAVY}, #003580)`
              : "rgba(0,0,0,0.06)",
            color: (effectiveViewMode || isComplete) ? "#fff" : "rgba(0,0,0,0.2)",
            fontSize:15, fontWeight:900, letterSpacing:1,
            cursor: (effectiveViewMode || isComplete) ? "pointer" : "default",
            transition:"all 0.2s",
            boxShadow: (effectiveViewMode || isComplete) ? `0 4px 20px rgba(0,32,91,0.35)` : "none",
          }}>
          {effectiveViewMode
            ? groupIdx < totalGroups-1 ? T[lang].btnNextGroup : T[lang].btnNextBestThird
            : isComplete
              ? groupIdx < totalGroups-1 ? T[lang].btnConfirmNextGroup : T[lang].btnConfirmAllGroups
              : T[lang].btnSelectAll4}
        </button>
      </div>
    </div>
  );
}

// ── CIRCLE TAB ────────────────────────────────────────────────────────────────
function CircleTab({ label, imageUrl, name, isActive, onClick, lightBg=false, distance=0, rank, members, done=false }) {
  const scale = isActive ? 1 : Math.max(0.58, 1 - distance * 0.2);
  const opacity = isActive ? 1 : Math.max(0.26, 1 - distance * 0.36);
  const activeColor = isActive && done ? GREEN : NAVY;
  return (
    <div onClick={onClick} style={{
      display:"flex",flexDirection:"column",alignItems:"center",gap:5,
      cursor:"pointer",flexShrink:0,WebkitTapHighlightColor:"transparent",
      transform:`scale(${scale}) translateY(${isActive ? -20 : 0}px)`,opacity,
      transition:"transform 0.28s, opacity 0.28s, filter 0.28s",
      transformOrigin:"center center",
      filter:isActive?"none":"saturate(0.85)",
    }}>
      <div style={{
        width:isActive?84:44, height:isActive?84:44,
        borderRadius:"50%",
        background:isActive?"rgba(255,255,255,0.96)":lightBg?"rgba(255,255,255,0.44)":"rgba(255,255,255,0.1)",
        border:isActive?`2.5px solid ${activeColor}`:"1px solid rgba(10,46,138,0.08)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:isActive?38:22, overflow:"hidden",
        boxShadow:isActive?`0 0 0 7px ${activeColor}12, 0 14px 32px rgba(10,46,138,0.18), inset 0 1px 0 rgba(255,255,255,0.9)`:"0 3px 10px rgba(10,46,138,0.05)",
        transition:"all 0.4s ease",
      }}>
        {imageUrl
          ? <img src={imageUrl} alt="" loading="eager" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : label}
      </div>
      {!!name&&<span style={{
        fontSize:isActive?10:9,
        fontWeight:isActive?800:600,
        color:isActive?NAVY:lightBg?"rgba(0,0,0,0.55)":"rgba(255,255,255,0.6)",
        maxWidth:52,textAlign:"center",lineHeight:1.2,
        transition:"all 0.4s ease",
      }}>{name}</span>}
    </div>
  );
}


// ── PULSE NODE ───────────────────────────────────────────────────────────────
function PulseNode({ color=NAVY, children }) {
  return (
    <div style={{position:"relative",width:18,height:18,flexShrink:0}}>
      <div style={{
        position:"absolute", inset:0, borderRadius:"50%", background:color,
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"nodeBreath 3s ease-in-out infinite",
      }}>
        {children}
      </div>
    </div>
  );
}

// ── PREMIUM ──────────────────────────────────────────────────────────────────
function PremiumScreen({ onBack }) {
  const lang = useLang();
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.09,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{padding:"10px 14px 0",flexShrink:0,position:"relative",zIndex:2}}>
        <div style={{background:"rgba(255,255,255,0.32)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",borderRadius:26,boxShadow:"0 8px 32px rgba(10,46,138,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",border:"1px solid rgba(255,255,255,0.55)",padding:"12px 20px 0",position:"relative",WebkitMaskImage:"linear-gradient(to bottom,black 0%,black 78%,transparent 100%)",maskImage:"linear-gradient(to bottom,black 0%,black 78%,transparent 100%)"}}>
          <div style={{position:"absolute",inset:0,borderRadius:26,background:"linear-gradient(135deg,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0.08) 40%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0,paddingTop:10}}>
              <button onClick={onBack} style={{width:44,height:44,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:22,color:"#374151",lineHeight:1}}>‹</span>
              </button>
              <p style={{fontSize:11,color:"transparent",margin:0,userSelect:"none"}}> </p>
            </div>
            <div style={{textAlign:"center"}}>
              <img src={predictoLogo} alt="Predicto" decoding="sync" style={{height:36,width:"auto",objectFit:"contain",display:"block",margin:"0 auto",position:"relative",left:3}}/>
              <h1 style={{fontSize:10,fontWeight:700,margin:"2px 0 0",letterSpacing:2.5,lineHeight:1,background:"linear-gradient(100deg,#CC0022 0%,#003399 50%,#007733 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>WORLD CUP 2026</h1>
              <p style={{fontSize:11,color:"#6B7280",margin:"3px 0 0"}}>{T[lang].location}</p>
            </div>
            <div style={{width:44,paddingTop:10}}/>
          </div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"16px 14px",overflow:"hidden",position:"relative",zIndex:1}}>
        <div style={{background:"#fff",borderRadius:20,boxShadow:"0 2px 16px rgba(10,46,138,0.07)",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:"32px 24px"}}>
          <span style={{fontSize:48}}>⭐</span>
          <p style={{fontSize:18,fontWeight:800,color:NAVY,margin:0,textAlign:"center"}}>{T[lang].alreadyPremiumTitle}</p>
          <p style={{fontSize:13,color:"#888",margin:0,textAlign:"center",lineHeight:1.6}}>{T[lang].alreadyPremiumBody}</p>
        </div>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NotificationsScreen({ onBack, notifs=[], readIds=[], onMarkRead=()=>{} }) {
  const lang = useLang();
  const user = useUser();
  const [openNotif, setOpenNotif] = React.useState(null);

  const openAndMarkRead = (n) => {
    if (!readIds.includes(n.id)) {
      onMarkRead(n.id);
      if (user) markNotifRead(user.id, n.id);
    }
    setOpenNotif(n);
  };
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.09,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{padding:"10px 14px 0",flexShrink:0,position:"relative",zIndex:2}}>
        <div style={{background:"rgba(255,255,255,0.32)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",borderRadius:26,boxShadow:"0 8px 32px rgba(10,46,138,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",border:"1px solid rgba(255,255,255,0.55)",padding:"12px 20px 0",position:"relative",WebkitMaskImage:"linear-gradient(to bottom,black 0%,black 78%,transparent 100%)",maskImage:"linear-gradient(to bottom,black 0%,black 78%,transparent 100%)"}}>
          <div style={{position:"absolute",inset:0,borderRadius:26,background:"linear-gradient(135deg,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0.08) 40%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0,paddingTop:10}}>
              <button onClick={onBack} style={{width:44,height:44,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:22,color:"#374151",lineHeight:1}}>‹</span>
              </button>
              <p style={{fontSize:11,color:"transparent",margin:0,userSelect:"none"}}> </p>
            </div>
            <div style={{textAlign:"center"}}>
              <img src={predictoLogo} alt="Predicto" decoding="sync" style={{height:36,width:"auto",objectFit:"contain",display:"block",margin:"0 auto",position:"relative",left:3}}/>
              <h1 style={{fontSize:10,fontWeight:700,margin:"2px 0 0",letterSpacing:2.5,lineHeight:1,background:"linear-gradient(100deg,#CC0022 0%,#003399 50%,#007733 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>WORLD CUP 2026</h1>
              <p style={{fontSize:11,color:"#6B7280",margin:"3px 0 0"}}>{T[lang].location}</p>
            </div>
            <div style={{width:44,paddingTop:10}}/>
          </div>
        </div>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"16px 14px",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        {notifs.length === 0 ? (
          <div style={{background:"#fff",borderRadius:20,boxShadow:"0 2px 16px rgba(10,46,138,0.07)",flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <p style={{fontSize:13,color:"rgba(0,0,0,0.3)",fontWeight:500}}>{T[lang].noNotificationsYet}</p>
          </div>
        ) : (
          notifs.map(n => {
            const isRead = readIds.includes(n.id);
            return (
              <div key={n.id} onClick={()=>openAndMarkRead(n)} style={{background:"#fff",borderRadius:16,boxShadow:"0 2px 14px rgba(10,46,138,0.07)",border:"1px solid rgba(10,46,138,0.06)",padding:"14px 18px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:14,fontWeight:isRead?400:700,color:isRead?"#6B7280":NAVY}}>{n.title}</span>
                <span style={{fontSize:18,color:"#C7C7CC",marginLeft:8}}>›</span>
              </div>
            );
          })
        )}
      </div>

      {openNotif && (
        <div onClick={()=>setOpenNotif(null)} style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 28px"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,padding:"24px 22px 20px",width:"100%",maxWidth:340,boxShadow:"0 8px 40px rgba(0,0,0,0.18)",position:"relative"}}>
            <button onClick={()=>setOpenNotif(null)} style={{position:"absolute",top:12,right:14,background:"none",border:"none",fontSize:20,color:"#9CA3AF",cursor:"pointer",lineHeight:1,padding:4}}>✕</button>
            <div style={{fontSize:11,color:"#9CA3AF",marginBottom:6}}>{openNotif.date}</div>
            <div style={{fontSize:16,fontWeight:700,color:NAVY,marginBottom:10}}>{openNotif.title}</div>
            <p style={{fontSize:14,color:"#374151",lineHeight:1.6,margin:0}}>{openNotif.body}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CHAMPION & TOP SCORE ────────────────────────────────────────────────────
const POS_LABEL = { Goalkeeper:'GK', Defence:'DEF', Midfield:'MID', Offence:'FWD' };

function PaniniCard({ player, teamName, isSelected, onClick }) {
  const [primary, secondary] = TEAM_COLORS[teamName] || ['#1a3a6b','#c8102e'];
  const flag  = FLAGS[teamName] || '🏳';
  const code  = TEAM_CODE[teamName] || teamName?.slice(0,3).toUpperCase() || '???';
  const p     = typeof player === 'string' ? { name:player, position:null, number:null, photo:null } : player;
  const posLbl = POS_LABEL[p.position] || '';
  const lastName = p.name.split(' ').slice(-1)[0];
  const displayNumber = p.number ?? 26;

  return (
    <div onClick={onClick} style={{
      position:'relative', width:'100%', paddingBottom:'132%',
      borderRadius:10, overflow:'hidden', cursor:'pointer',
      border: isSelected ? '2px solid rgba(240,160,32,0.55)' : '1px solid rgba(0,0,0,0.08)',
      boxShadow: isSelected ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
      transform: isSelected ? 'scale(1.06) translateY(-3px)' : 'scale(1)',
      transition:'all 0.16s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div style={{position:'absolute',inset:0}}>

        {/* Sky-blue gradient background */}
        <div style={{position:'absolute',inset:0,background:'#F3F4F6'}}/>

        {/* Team color stripe top */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${primary},${secondary})`}}/>

        {/* Shirt number watermark */}
        <div style={{
          position:'absolute',top:'-2%',left:'-1%',
          fontSize:62,fontWeight:900,fontStyle:'italic',
          color:primary,opacity:0.17,lineHeight:1,
          userSelect:'none',pointerEvents:'none',letterSpacing:-2,
        }}>{displayNumber}</div>

        {/* Flag + FIFA code top-right */}
        <div style={{position:'absolute',top:5,right:5,zIndex:3,display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
          <span style={{fontSize:14,lineHeight:1}}>{flag}</span>
          <span style={{fontSize:6.5,fontWeight:800,color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,0.6)',letterSpacing:0.3}}>{code}</span>
        </div>

        {/* Player photo */}
        {p.photo ? (
          <img src={p.photo} alt={p.name}
            style={{position:'absolute',bottom:22,left:'50%',transform:'translateX(-50%)',height:'67%',width:'auto',maxWidth:'95%',objectFit:'cover',objectPosition:'top center',zIndex:2,filter:'none',
              WebkitMaskImage:'radial-gradient(ellipse 58% 74% at 50% 50%, #000 62%, rgba(0,0,0,0.75) 70%, transparent 82%)',
              maskImage:'radial-gradient(ellipse 58% 74% at 50% 50%, #000 62%, rgba(0,0,0,0.75) 70%, transparent 82%)'}}
            onError={e=>{e.currentTarget.style.display='none'}}/>
        ):(
          <div style={{position:'absolute',bottom:22,left:'50%',transform:'translateX(-50%)',fontSize:40,lineHeight:1,zIndex:2,opacity:0.25}}>👤</div>
        )}

        {/* Bottom name bar */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:4,background:primary,padding:'4px 3px 3px',minHeight:22}}>
          <div style={{fontSize:10,fontWeight:900,color:'#fff',textAlign:'center',textTransform:'uppercase',letterSpacing:0.4,lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            {lastName}
          </div>
          {posLbl&&(
            <div style={{fontSize:9,color:secondary&&secondary!=='#FFFFFF'?secondary:'rgba(255,255,255,0.75)',textAlign:'center',fontWeight:700,letterSpacing:0.8,textTransform:'uppercase',lineHeight:1.2}}>
              {posLbl}
            </div>
          )}
        </div>

        {/* Gold shimmer overlay when selected */}
        {isSelected&&(
          <div style={{position:'absolute',inset:0,zIndex:5,background:'rgba(255,215,0,0.1)',pointerEvents:'none'}}/>
        )}
      </div>
    </div>
  );
}

function BoosterScreen({ onBack }) {
  const lang = useLang();
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>

      {/* Navy header */}
      <div style={{background:"rgba(0,32,91,0.88)",flexShrink:0,position:"relative",zIndex:1,overflow:"hidden"}}>
        <img src={trophy} alt="" style={{position:"absolute",right:-10,top:-18,height:130,opacity:0.13,pointerEvents:"none",filter:"grayscale(0.3) contrast(1.2)"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"28px 14px 28px"}}>
            <button onClick={onBack} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:10,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>‹</button>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>⚡ Booster</div>
            </div>
            <div style={{width:34,flexShrink:0}}/>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"24px 20px 100px",position:"relative",zIndex:1}}>
      </div>
    </div>
  );
}

function ChampionScreen({ onBack, initialMode="champion", championPick, topScorerPick, runnerUpPick, setChampionPick, setTopScorerPick, setRunnerUpPick, showToast, simDay=null, simHour=12, simMin=0 }) {
  const lang = useLang();
  const allTeams = Object.values(ALL_GROUPS_DATA).flat();
  const tCode = (t) => TEAM_CODE[t]||t.slice(0,3).toUpperCase();
  const showChampion = initialMode === "champion";
  const showScorer = initialMode === "scorer";
  const showRunnerUp = initialMode === "runnerup";
  const isLocked = isBonusPickLocked(simDay, simHour, simMin);
  const featuredChampionTeams = ["Argentina","Brazil","France","England","Spain","Portugal"].filter(t=>allTeams.includes(t));
  const otherChampionTeams = allTeams.filter(t=>!featuredChampionTeams.includes(t));
  const pickCardStyle = UI.card;
  const pickLabelStyle = UI.sectionLabel;
  const finishPick = (message, icon) => {
    showToast&&showToast(message, icon);
    setTimeout(()=>onBack&&onBack(), 450);
  };
  const selectChampion = (team) => {
    if (isLocked) return;
    const next = championPick===team ? null : team;
    setChampionPick(next);
    if(next) finishPick(T[lang].winnerTeamSaved, FLAGS[team]||"🏆");
    else showToast&&showToast(T[lang].winnerTeamCleared, "↺");
  };
  const selectRunnerUp = (team) => {
    if (isLocked) return;
    const next = runnerUpPick===team ? null : team;
    setRunnerUpPick(next);
    if(next) finishPick(T[lang].runnerUpSaved, FLAGS[team]||"🥈");
    else showToast&&showToast(T[lang].runnerUpCleared, "↺");
  };
  const [tsTeam, setTsTeam] = useState(topScorerPick?.team||null);
  const [champPopup, setChampPopup] = useState(false);
  const [tsPopup, setTsPopup] = useState(false);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);

  useEffect(() => {
    if (!tsTeam) { setTeamPlayers([]); return; }
    setPlayersLoading(true);
    loadPlayersByTeam(tsTeam).then(p => { setTeamPlayers(p); setPlayersLoading(false); });
  }, [tsTeam]);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>

      {/* Navy header */}
      <div style={{background:"rgba(0,32,91,0.88)",flexShrink:0,position:"relative",zIndex:1,overflow:"hidden"}}>
        {/* trophy image watermark inside header */}
        <img src={trophy} alt="" style={{position:"absolute",right:-10,top:-18,height:130,opacity:0.13,pointerEvents:"none",filter:"grayscale(0.3) contrast(1.2)"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"28px 14px 28px"}}>
            <button onClick={onBack} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:10,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>‹</button>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{showChampion?T[lang].pickChampionHeader:showRunnerUp?T[lang].pickRunnerUpHeader:T[lang].pickTopScorerHeader}</div>
            </div>
            <div style={{width:34,flexShrink:0}}/>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"24px 18px 100px",position:"relative",zIndex:1}}>

        {/* Lock banner */}
        {isLocked&&(
          <div style={{background:"rgba(10,46,138,0.07)",border:"1.5px solid rgba(10,46,138,0.14)",borderRadius:14,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🔒</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:NAVY}}>{T[lang].picksLockedTitle}</div>
              <div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{T[lang].picksLockedBody}</div>
            </div>
          </div>
        )}

        {/* Champion card */}
        {showChampion&&<>
          <div style={{...pickCardStyle,padding:"18px",marginBottom:12,position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,#FFF7E1,#F3F4F6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"1px solid rgba(240,160,32,0.22)"}}>
                <span style={{fontSize:46,lineHeight:1}}>{championPick ? (FLAGS[championPick]||"🏳") : "🏆"}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{...pickLabelStyle,color:"#D4820A"}}>{T[lang].championPickLabel}</div>
                <div style={{fontSize:22,fontWeight:900,color:DARK,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {championPick || T[lang].chooseWinner}
                </div>
                <div style={{fontSize:12,color:"#9CA3AF",fontWeight:600,marginTop:3}}>
                  {championPick ? `${tCode(championPick)} ${T[lang].selectedLabel}` : T[lang].tapTeamBelow}
                </div>
              </div>
              {championPick&&(
                <button onClick={()=>selectChampion(championPick)} style={{border:"none",background:"#F3F4F6",borderRadius:10,padding:"8px 10px",fontSize:11,fontWeight:800,color:"#6B7280",cursor:"pointer",flexShrink:0}}>
                  {T[lang].clearLabel}
                </button>
              )}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12,opacity:isLocked?0.5:1,pointerEvents:isLocked?"none":"auto"}}>
            {featuredChampionTeams.map(team=>{
              const isSel = championPick===team;
              return (
                <button key={`featured-${team}`} onClick={()=>selectChampion(team)}
                  style={{background:isSel?NAVY:"#fff",borderRadius:16,border:`1.5px solid ${isSel?NAVY:"rgba(240,160,32,0.20)"}`,boxShadow:isSel?"0 4px 14px rgba(10,46,138,0.16)":"0 2px 10px rgba(0,0,0,0.05)",padding:"12px 6px",minHeight:94,cursor:isLocked?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:7,position:"relative",overflow:"hidden"}}>
                  <span style={{fontSize:34,lineHeight:1}}>{FLAGS[team]||"🏳"}</span>
                  <span style={{fontSize:11,fontWeight:900,color:isSel?"#fff":DARK,lineHeight:1.15,textAlign:"center",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{team}</span>
                  <span style={{fontSize:11,fontWeight:900,color:isSel?"rgba(255,255,255,0.55)":"#D4820A",letterSpacing:0.5}}>{tCode(team)}</span>
                </button>
              );
            })}
          </div>

          <div style={{...pickLabelStyle,margin:"2px 2px 8px"}}>{T[lang].allTeams}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,opacity:isLocked?0.5:1,pointerEvents:isLocked?"none":"auto"}}>
            {otherChampionTeams.map(team=>{
              const isSel = championPick===team;
              return (
                <button key={team} onClick={()=>selectChampion(team)}
                  style={{background:"#fff",borderRadius:14,border:`1.5px solid ${isSel?NAVY:"transparent"}`,boxShadow:isSel?"0 2px 12px rgba(10,46,138,0.12)":"0 2px 10px rgba(0,0,0,0.05)",padding:"10px 10px",minHeight:58,cursor:isLocked?"default":"pointer",display:"flex",alignItems:"center",gap:9,position:"relative",overflow:"hidden",textAlign:"left"}}>
                  {isSel&&<div style={{position:"absolute",top:7,right:7,width:18,height:18,borderRadius:"50%",background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff"}}>✓</div>}
                  <span style={{fontSize:24,lineHeight:1,flexShrink:0}}>{FLAGS[team]||"🏳"}</span>
                  <span style={{flex:1,minWidth:0}}>
                    <span style={{display:"block",fontSize:11,fontWeight:850,color:isSel?NAVY:DARK,lineHeight:1.15,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{team}</span>
                    <span style={{display:"block",fontSize:11,fontWeight:800,color:"#C0C8D8",letterSpacing:0.5,marginTop:3}}>{tCode(team)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>}

        {/* Runner-up card */}
        {showRunnerUp&&<>
          <div style={{...pickCardStyle,padding:"18px",marginBottom:12,position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,#EEF2FF,#E8EAED)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"1px solid rgba(100,120,180,0.22)"}}>
                <span style={{fontSize:46,lineHeight:1}}>{runnerUpPick ? (FLAGS[runnerUpPick]||"🏳") : "🥈"}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{...pickLabelStyle,color:"#5060A0"}}>{T[lang].runnerUpPickLabel}</div>
                <div style={{fontSize:22,fontWeight:900,color:DARK,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {runnerUpPick || T[lang].chooseRunnerUp}
                </div>
                <div style={{fontSize:12,color:"#9CA3AF",fontWeight:600,marginTop:3}}>
                  {runnerUpPick ? `${tCode(runnerUpPick)} ${T[lang].selectedLabel}` : T[lang].tapTeamBelow}
                </div>
              </div>
              {runnerUpPick&&(
                <button onClick={()=>selectRunnerUp(runnerUpPick)} style={{border:"none",background:"#F3F4F6",borderRadius:10,padding:"8px 10px",fontSize:11,fontWeight:800,color:"#6B7280",cursor:"pointer",flexShrink:0}}>
                  {T[lang].clearLabel}
                </button>
              )}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12,opacity:isLocked?0.5:1,pointerEvents:isLocked?"none":"auto"}}>
            {featuredChampionTeams.map(team=>{
              const isSel = runnerUpPick===team;
              return (
                <button key={`ru-featured-${team}`} onClick={()=>selectRunnerUp(team)}
                  style={{background:isSel?NAVY:"#fff",borderRadius:16,border:`1.5px solid ${isSel?NAVY:"rgba(100,120,180,0.20)"}`,boxShadow:isSel?"0 4px 14px rgba(10,46,138,0.16)":"0 2px 10px rgba(0,0,0,0.05)",padding:"12px 6px",minHeight:94,cursor:isLocked?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:7,position:"relative",overflow:"hidden"}}>
                  <span style={{fontSize:34,lineHeight:1}}>{FLAGS[team]||"🏳"}</span>
                  <span style={{fontSize:11,fontWeight:900,color:isSel?"#fff":DARK,lineHeight:1.15,textAlign:"center",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{team}</span>
                  <span style={{fontSize:11,fontWeight:900,color:isSel?"rgba(255,255,255,0.55)":"#5060A0",letterSpacing:0.5}}>{tCode(team)}</span>
                </button>
              );
            })}
          </div>

          <div style={{...pickLabelStyle,margin:"2px 2px 8px"}}>{T[lang].allTeams}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,opacity:isLocked?0.5:1,pointerEvents:isLocked?"none":"auto"}}>
            {otherChampionTeams.map(team=>{
              const isSel = runnerUpPick===team;
              return (
                <button key={`ru-${team}`} onClick={()=>selectRunnerUp(team)}
                  style={{background:"#fff",borderRadius:14,border:`1.5px solid ${isSel?NAVY:"transparent"}`,boxShadow:isSel?"0 2px 12px rgba(10,46,138,0.12)":"0 2px 10px rgba(0,0,0,0.05)",padding:"10px 10px",minHeight:58,cursor:isLocked?"default":"pointer",display:"flex",alignItems:"center",gap:9,position:"relative",overflow:"hidden",textAlign:"left"}}>
                  {isSel&&<div style={{position:"absolute",top:7,right:7,width:18,height:18,borderRadius:"50%",background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff"}}>✓</div>}
                  <span style={{fontSize:24,lineHeight:1,flexShrink:0}}>{FLAGS[team]||"🏳"}</span>
                  <span style={{flex:1,minWidth:0}}>
                    <span style={{display:"block",fontSize:11,fontWeight:850,color:isSel?NAVY:DARK,lineHeight:1.15,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{team}</span>
                    <span style={{display:"block",fontSize:11,fontWeight:800,color:"#C0C8D8",letterSpacing:0.5,marginTop:3}}>{tCode(team)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>}

        {/* Top Scorer card */}
        {showScorer&&<div style={{...pickCardStyle,padding:"18px",opacity:isLocked?0.7:1}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14}}>
            <div style={{minWidth:0}}>
              <div style={{...pickLabelStyle,color:"#D4820A"}}>{T[lang].topScorerPickLabel}</div>
              <div style={{fontSize:18,fontWeight:850,color:DARK,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {topScorerPick?.player || T[lang].pickPlayer}
              </div>
              <div style={{fontSize:11,color:"#9CA3AF",fontWeight:600,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {topScorerPick?.team ? `${FLAGS[topScorerPick.team]||"🏳"} ${topScorerPick.team}` : T[lang].startWithTeam}
              </div>
            </div>
            {topScorerPick?.player&&<div style={{width:30,height:30,borderRadius:"50%",background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",flexShrink:0}}>✓</div>}
          </div>

          {/* shirt button — opens team picker */}
          <button onClick={isLocked ? undefined : ()=>setTsPopup(true)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,cursor:isLocked?"default":"pointer",padding:"12px 14px",borderRadius:14,background:"#F8FAFC",border:"1px solid rgba(10,46,138,0.06)",WebkitTapHighlightColor:"transparent"}}>
            <span style={{fontSize:38,lineHeight:1,flexShrink:0}}>👕</span>
            {tsTeam?(
              <div style={{flex:1,minWidth:0,textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:700,color:DARK}}>{FLAGS[tsTeam]||"🏳"} {tsTeam}</div>
                <div style={{fontSize:11,color:"#9CA3AF",fontWeight:600}}>{tCode(tsTeam)}</div>
              </div>
            ):(
              <span style={{flex:1,fontSize:12,color:"#9CA3AF",fontWeight:600}}>{T[lang].pickTeamDots}</span>
            )}
            <span style={{fontSize:18,color:"#C0C8D8",fontWeight:700,lineHeight:1}}>›</span>
          </button>

          {/* Players — grid or selected view */}
          {tsTeam&&(
            <div style={{marginTop:16}}>
              {topScorerPick?.team===tsTeam&&topScorerPick?.player ? (
                /* Selected player — card mare centrat */
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"8px 0 80px"}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#9CA3AF",letterSpacing:0.3}}>
                    {FLAGS[tsTeam]||"🏳"} {tsTeam}
                  </div>
                  <div style={{width:140}}>
                    {teamPlayers.filter(p=>p.name===topScorerPick.player).map(player=>(
                      <PaniniCard key={player.name} player={player} teamName={tsTeam} isSelected={true} onClick={()=>{}}/>
                    ))}
                  </div>
                </div>
              ) : (
                /* Grid de selectie */
                <>
                  <div style={{fontSize:11,fontWeight:600,color:"#9CA3AF",marginBottom:14,textAlign:"center",letterSpacing:0.3}}>
                    {FLAGS[tsTeam]||"🏳"} {tsTeam} — {T[lang].pickTopScorerSub}
                  </div>
                  {playersLoading ? (
                    <div style={{textAlign:"center",padding:"24px 0",fontSize:12,color:"#9CA3AF"}}>{T[lang].loadingPlayers}</div>
                  ) : teamPlayers.length === 0 ? (
                    <div style={{textAlign:"center",padding:"24px 0",fontSize:12,color:"#9CA3AF"}}>{T[lang].noPlayersForTeam}</div>
                  ) : (
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,paddingBottom:80}}>
                      {teamPlayers.map(player=>{
                        const name = player.name;
                        const isSel = topScorerPick?.player===name&&topScorerPick?.team===tsTeam;
                        return (
                          <PaniniCard
                            key={name}
                            player={player}
                            teamName={tsTeam}
                            isSelected={isSel}
                            onClick={isLocked ? undefined : ()=>{
                              setTopScorerPick({team:tsTeam,player:name});
                              finishPick(T[lang].topScorerSaved, FLAGS[tsTeam]||"👕");
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>}
      </div>

      {/* Top scorer confirmation bar */}
      {showScorer&&topScorerPick?.player&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:500,
          background:"linear-gradient(135deg,#0A2E8A,#001840)",
          borderTop:"2px solid #FFD700",
          padding:"12px 20px 28px",
          display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setTopScorerPick(null)}
            style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"7px 14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>
            {T[lang].changeLabel}
          </button>
          <span style={{fontSize:24,lineHeight:1,flexShrink:0}}>{FLAGS[topScorerPick.team]||"🏳"}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,fontWeight:700,color:"#FFD700",letterSpacing:1,textTransform:"uppercase"}}>{T[lang].topScorer}</div>
            <div style={{fontSize:15,fontWeight:900,color:"#fff",marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{topScorerPick.player}</div>
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",background:"#FFD700",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:16,fontWeight:900,color:NAVY}}>✓</span>
          </div>
        </div>
      )}

      {/* Champion pick popup — bottom sheet with team list */}
      {showChampion&&champPopup&&(
        <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",flexDirection:"column",justifyContent:"flex-end",touchAction:"none",overscrollBehavior:"none"}}
          onClick={()=>setChampPopup(false)}
          onWheel={e=>e.stopPropagation()}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)"}}/>
          <div onClick={e=>e.stopPropagation()}
            style={{position:"relative",background:"#1C1C1E",borderRadius:"20px 20px 0 0",zIndex:1,
              display:"flex",flexDirection:"column",maxHeight:"75vh"}}>
            {/* drag handle */}
            <div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px",flexShrink:0,touchAction:"none",position:"relative",zIndex:1}}
              onTouchStart={e=>{ e.currentTarget._y0=e.touches[0].clientY; }}
              onTouchMove={e=>{
                const dy=e.touches[0].clientY-e.currentTarget._y0;
                if(dy>0){ const s=e.currentTarget.parentElement; s.style.transform=`translateY(${dy}px)`; s.style.transition="none"; }
              }}
              onTouchEnd={e=>{
                const dy=e.changedTouches[0].clientY-e.currentTarget._y0;
                const s=e.currentTarget.parentElement;
                s.style.transition="transform 0.3s"; s.style.transform="";
                if(dy>80) setChampPopup(false);
              }}>
              <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.35)"}}/>
            </div>
            {/* header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 20px 12px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.07)",position:"relative",zIndex:1}}>
              <span style={{fontSize:15,fontWeight:800,color:"#fff"}}>{T[lang].pickChampionPopup}</span>
              <button onClick={()=>setChampPopup(false)}
                style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"5px 14px",color:"rgba(255,255,255,0.6)",fontSize:13,cursor:"pointer"}}>
                {T[lang].guideClose}
              </button>
            </div>
            {/* scrollable team list */}
            <div style={{overflowY:"auto",WebkitOverflowScrolling:"touch",flex:1,padding:"8px 0 40px",position:"relative",zIndex:1}}>
              {allTeams.map(team=>{
                const isSel = championPick===team;
                return (
                  <button key={team} onClick={()=>{ setChampionPick(isSel?null:team); setChampPopup(false); }}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"12px 20px",
                      background:isSel?"rgba(10,46,138,0.35)":"transparent",
                      borderBottom:"1px solid rgba(255,255,255,0.05)",cursor:"pointer",border:"none",WebkitTapHighlightColor:"transparent"}}>
                    <span style={{fontSize:28,lineHeight:1,flexShrink:0}}>{FLAGS[team]||"🏳"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:isSel?700:500,color:isSel?"#fff":"rgba(255,255,255,0.85)"}}>{team}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:600,letterSpacing:0.5}}>{tCode(team)}</div>
                    </div>
                    {isSel&&<span style={{fontSize:16,color:GREEN,fontWeight:800}}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Scorer team popup — bottom sheet */}
      {showScorer&&tsPopup&&(
        <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",flexDirection:"column",justifyContent:"flex-end",touchAction:"none",overscrollBehavior:"none"}}
          onClick={()=>setTsPopup(false)}
          onWheel={e=>e.stopPropagation()}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)"}}/>
          <div onClick={e=>e.stopPropagation()}
            style={{position:"relative",background:"#1C1C1E",borderRadius:"20px 20px 0 0",zIndex:1,
              display:"flex",flexDirection:"column",maxHeight:"75vh"}}>
            <div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px",flexShrink:0,touchAction:"none"}}
              onTouchStart={e=>{ e.currentTarget._y0=e.touches[0].clientY; }}
              onTouchMove={e=>{
                const dy=e.touches[0].clientY-e.currentTarget._y0;
                if(dy>0){ const s=e.currentTarget.parentElement; s.style.transform=`translateY(${dy}px)`; s.style.transition="none"; }
              }}
              onTouchEnd={e=>{
                const dy=e.changedTouches[0].clientY-e.currentTarget._y0;
                const s=e.currentTarget.parentElement;
                s.style.transition="transform 0.3s"; s.style.transform="";
                if(dy>80) setTsPopup(false);
              }}>
              <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.35)"}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 20px 12px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
              <span style={{fontSize:15,fontWeight:800,color:"#fff"}}>{T[lang].pickTeamPopup}</span>
              <button onClick={()=>setTsPopup(false)}
                style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"5px 14px",color:"rgba(255,255,255,0.6)",fontSize:13,cursor:"pointer"}}>
                {T[lang].guideClose}
              </button>
            </div>
            <div style={{overflowY:"auto",WebkitOverflowScrolling:"touch",flex:1,padding:"12px 16px 40px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
                {featuredChampionTeams.map(team=>{
                  const isSel = tsTeam===team;
                  return (
                    <button key={`ts-featured-${team}`} onClick={()=>{ setTsTeam(team); setTsPopup(false); }}
                      style={{background:isSel?NAVY:"rgba(255,255,255,0.08)",borderRadius:14,border:`1.5px solid ${isSel?NAVY:"rgba(255,255,255,0.08)"}`,padding:"11px 5px",minHeight:88,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,position:"relative"}}>
                      {isSel&&<span style={{position:"absolute",top:6,right:6,width:17,height:17,borderRadius:"50%",background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff"}}>✓</span>}
                      <span style={{fontSize:30,lineHeight:1}}>{FLAGS[team]||"🏳"}</span>
                      <span style={{fontSize:10,fontWeight:800,color:"#fff",lineHeight:1.15,textAlign:"center",maxWidth:"100%",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{team}</span>
                      <span style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.35)",letterSpacing:0.5}}>{tCode(team)}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.35)",letterSpacing:0.8,textTransform:"uppercase",margin:"0 2px 8px"}}>{T[lang].allTeams}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {otherChampionTeams.map(team=>{
                const isSel = tsTeam===team;
                return (
                  <button key={team} onClick={()=>{ setTsTeam(team); setTsPopup(false); }}
                    style={{display:"flex",alignItems:"center",gap:9,padding:"10px",
                      background:isSel?"rgba(10,46,138,0.55)":"rgba(255,255,255,0.06)",
                      border:`1.5px solid ${isSel?NAVY:"rgba(255,255,255,0.04)"}`,borderRadius:12,cursor:"pointer",textAlign:"left",position:"relative",overflow:"hidden"}}>
                    {isSel&&<span style={{position:"absolute",top:6,right:6,width:16,height:16,borderRadius:"50%",background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff"}}>✓</span>}
                    <span style={{fontSize:23,lineHeight:1,flexShrink:0}}>{FLAGS[team]||"🏳"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{team}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:700,letterSpacing:0.5,marginTop:3}}>{tCode(team)}</div>
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// module-level sets — persist across HomeScreen remounts
const _pickNotDone = new Set();    const _pickScrolled = new Set();
const _exNotDone = new Set();      const _exScrolled = new Set();

const homeCardBaseStyle = {
  background:"#fff",
  borderRadius:20,
  boxShadow:"0 4px 16px rgba(0,0,0,0.06)",
  overflow:"hidden",
};

function HomeSectionLabel({ children }) {
  return (
    <div style={{...UI.sectionLabel,fontSize:12,fontWeight:750,color:"rgba(10,46,138,0.55)",textAlign:"left",letterSpacing:1.2,marginBottom:9,paddingLeft:2}}>
      {children}
    </div>
  );
}

function HomeCard({ children, style }) {
  return <div style={{...homeCardBaseStyle,...style}}>{children}</div>;
}

function CopyGlyph({ color=NAVY }) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.8"/>
      <path d="M2 10V2h8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LockIcon({ size=14, color="currentColor", strokeWidth=2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2.5" stroke={color} strokeWidth={strokeWidth}/>
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </svg>
  );
}

function ChevronIcon({ direction="right", size=18, color="currentColor", strokeWidth=2.4 }) {
  const rotate = direction === "left" ? 180 : direction === "up" ? -90 : direction === "down" ? 90 : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{transform:`rotate(${rotate}deg)`}} aria-hidden="true">
      <path d="M9 5l7 7-7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SearchIcon({ size=15, color="currentColor", strokeWidth=2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth={strokeWidth}/>
      <path d="M16 16l4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </svg>
  );
}

function XIcon({ size=15, color="currentColor", strokeWidth=2.4 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </svg>
  );
}

function TrashIcon({ size=15, color="currentColor", strokeWidth=1.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <path d="M8 6V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 6l-1 14c-.1 1.1-1 2-2.1 2H8.1c-1.1 0-2-.9-2.1-2L5 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11v6M14 11v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </svg>
  );
}

function NextActionCard({ card, pct, nextTask }) {
  return (
    <HomeCard style={{padding:"14px 16px 16px",marginBottom:14,boxShadow:"0 4px 20px rgba(0,0,0,0.07)"}}>
      <div style={{textAlign:"center",fontSize:11,fontWeight:800,letterSpacing:1.5,color:"rgba(10,46,138,0.5)",textTransform:"uppercase",marginBottom:8}}>{card.badge}</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        {card.due?<div style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(200,16,46,0.08)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#C8102E"}}><span style={{fontSize:10}}>📅</span>{card.due}</div>:<div/>}
        {card.total>1?<div style={{fontSize:11,fontWeight:800,color:NAVY}}>{card.progress}/{card.total}</div>:<div/>}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{flex:1,paddingRight:10}}>
          <div style={{fontSize:18,fontWeight:900,color:"#0D1117",lineHeight:1.2,marginBottom:6}}>{card.title}</div>
          <div style={{fontSize:11,color:"#6B7280",lineHeight:1.4}}>{card.sub}</div>
        </div>
        <img src={trophy} alt="" style={{height:76,flexShrink:0,pointerEvents:"none",filter:"drop-shadow(0 8px 20px rgba(0,0,0,0.15))",WebkitMaskImage:"linear-gradient(to bottom,black 60%,transparent 100%)",maskImage:"linear-gradient(to bottom,black 60%,transparent 100%)"}} />
      </div>
      {card.total>1&&<div style={{height:4,background:"#E8EDF8",borderRadius:3,marginBottom:12,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+NAVY+",#3B6FE8)",borderRadius:3,transition:"width 0.4s"}}/></div>}
      {card.total===1&&<div style={{height:4}}/>}
      {nextTask!==null&&<button onClick={card.onClick} style={{width:"100%",background:NAVY,color:"#fff",borderRadius:12,padding:"12px 16px",fontSize:14,fontWeight:700,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 16px rgba(10,46,138,0.35)",fontFamily:"inherit"}}><span>{card.label}</span><span style={{fontSize:18,lineHeight:1}}>{"→"}</span></button>}
    </HomeCard>
  );
}

function ProgressTile({ icon, title, value, active=true, withDivider=false, onClick, copyEnabled, onCopy }) {
  return (
    <div style={{position:"relative",borderRight:withDivider?"1px solid #F3F4F6":"none"}}>
      <button onClick={onClick} style={{width:"100%",textAlign:"center",padding:"12px 6px",border:"none",background:"transparent",cursor:"pointer",WebkitTapHighlightColor:"transparent",fontFamily:"inherit"}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(10,46,138,0.08)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px",fontSize:18,color:NAVY}}>{icon}</div>
        <div style={{fontSize:10,color:"#6B7280",fontWeight:600,marginBottom:3}}>{title}</div>
        <div style={{fontSize:13,fontWeight:800,color:active?NAVY:"#6B7280"}}>{value}</div>
      </button>
      <button onClick={e=>{e.stopPropagation();if(!copyEnabled)return;onCopy&&onCopy();}} style={{position:"absolute",top:8,right:8,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",background:copyEnabled?"rgba(10,46,138,0.07)":"transparent",borderRadius:6,border:"none",cursor:copyEnabled?"pointer":"default",opacity:copyEnabled?1:0,padding:0}}>
        <CopyGlyph />
      </button>
    </div>
  );
}

function ThisWeekCard({ title, body, buttonLabel, locked, onOpen, date }) {
  const d = date || new Date();
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return (
    <HomeCard style={{padding:"12px",display:"flex",flexDirection:"column"}}>
      <div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:800,color:"#111"}}>{title}</span></div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"2px 0 8px"}}>
        <div style={{width:44,height:44,borderRadius:10,background:NAVY,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,paddingBottom:2}}>
          <div style={{fontSize:8,fontWeight:800,color:"rgba(255,255,255,0.65)",letterSpacing:1,lineHeight:1}}>{months[d.getMonth()]}</div>
          <div style={{fontSize:20,fontWeight:900,color:"#fff",lineHeight:1}}>{d.getDate()}</div>
        </div>
      </div>
      <div style={{fontSize:10,color:"#6B7280",textAlign:"center",marginBottom:8,lineHeight:1.5}}>{body}</div>
      <button onClick={locked?undefined:onOpen} style={{width:"100%",background:!locked?"linear-gradient(135deg,"+NAVY+",#1E4BC7)":"#F3F4F6",color:!locked?"#fff":"#9CA3AF",border:"none",borderRadius:8,padding:"7px 0",fontSize:11,fontWeight:700,cursor:!locked?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontFamily:"inherit"}}>
        {locked&&<LockIcon size={13} color="#9CA3AF" strokeWidth={2.2}/>}<span>{buttonLabel}</span>
      </button>
    </HomeCard>
  );
}

function LeagueRankingCard({ title, viewLabel, top3, avatarUrl, displayName, onLeaderboard, lang }) {
  return (
    <HomeCard style={{padding:"12px",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <span style={{fontSize:12,fontWeight:800,color:"#111"}}>{title}</span>
        <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(10,46,138,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{"🏆"}</div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:5,marginBottom:8}}>
        {top3.slice(0,3).map((u,i)=>{
          const medals=["🥇","🥈","🥉"];
          const isYou=u.isMe;
          const rowAvatar=u.avatarUrl||(isYou?avatarUrl:null);
          const fallbackLetter=((isYou?displayName:u.name)||"?").trim().slice(0,1).toUpperCase()||"?";
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:13,flexShrink:0,lineHeight:1}}>{medals[i]||"🏅"}</span>
              <div style={{width:20,height:20,borderRadius:"50%",background:isYou?`${NAVY}22`:"rgba(0,0,0,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:isYou?NAVY:"#888",overflow:"hidden",flexShrink:0}}>
                {rowAvatar?<img src={rowAvatar} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:fallbackLetter}
              </div>
              <span style={{flex:1,fontSize:10,fontWeight:isYou?700:600,color:isYou?NAVY:"#374151",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{isYou?(T[lang].you):u.name}</span>
              {!u.empty&&<span style={{fontSize:10,fontWeight:700,color:isYou?NAVY:"#6B7280",flexShrink:0}}>{u.pts||0} pts</span>}
            </div>
          );
        })}
      </div>
      <button onClick={onLeaderboard} style={{width:"100%",background:"transparent",border:"none",color:NAVY,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"3px 0",fontFamily:"inherit"}}><span>{viewLabel}</span><ChevronIcon size={13} color={NAVY}/></button>
    </HomeCard>
  );
}

// ── BONUS PREDICTION ────────────────────────────────────────────────────────
function BonusPredictionScreen({ onBack, onChampion, championPick, runnerUpPick, topScorerPick, simDay=null, simHour=12, simMin=0 }) {
  const lang = useLang();
  const tCode = (t) => TEAM_CODE[t]||t.slice(0,3).toUpperCase();
  const isLocked = isBonusPickLocked(simDay, simHour, simMin);

  const picks = [
    { key:"champion", icon:"🏆", color:"#D4820A", bg:"linear-gradient(135deg,#FFF7E1,#FFF3CC)", label:T[lang].championPickLabel, pickVal:championPick, flagTeam:championPick, subtext:championPick?`${tCode(championPick)} · ${T[lang].selectedLabel}`:null, empty:T[lang].chooseWinner, mode:"champion" },
    { key:"runnerup", icon:"🥈", color:"#5060A0", bg:"linear-gradient(135deg,#EEF2FF,#E8EEFF)", label:T[lang].runnerUpPickLabel, pickVal:runnerUpPick, flagTeam:runnerUpPick, subtext:runnerUpPick?`${tCode(runnerUpPick)} · ${T[lang].selectedLabel}`:null, empty:T[lang].chooseRunnerUp, mode:"runnerup" },
    { key:"scorer",  icon:"⚽", color:"#059669", bg:"linear-gradient(135deg,#F0FDF4,#DCFCE7)", label:T[lang].topScorerPickLabel, pickVal:topScorerPick?.player||null, flagTeam:topScorerPick?.team||null, subtext:topScorerPick?.team?`${FLAGS[topScorerPick.team]||""} ${topScorerPick.team}`:null, empty:T[lang].pickPlayer, mode:"scorer" },
  ];

  const scoringRules = [
    { icon:"🏆", pts:"100", label:T[lang].championPickLabel, sub:null },
    { icon:"🥈", pts:"30",  label:T[lang].runnerUpPickLabel, sub:null },
    { icon:"⚽", pts:"5×",  label:T[lang].topScorerPickLabel, sub:"+50 bonus" },
  ];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>

      {/* Header */}
      <div style={{background:"linear-gradient(160deg,#0A2E8A 0%,#001840 100%)",flexShrink:0,position:"relative",zIndex:1,paddingBottom:20}}>
        {/* Nav row */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"28px 14px 14px"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:10,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>‹</button>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:"#FFD700",letterSpacing:0.3}}>⚡ {T[lang].bonusPrediction}</div>
          </div>
          <div style={{width:34,flexShrink:0}}/>
        </div>

        {/* Description */}
        <p style={{fontSize:13,color:"rgba(255,255,255,0.62)",margin:"0 20px 18px",textAlign:"center",lineHeight:1.55}}>{T[lang].bonusDesc}</p>

        {/* Scoring rules — 3 chips */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 14px"}}>
          {scoringRules.map(({icon,pts,label,sub})=>(
            <div key={label} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,215,0,0.18)",borderRadius:14,padding:"12px 6px",textAlign:"center"}}>
              <div style={{fontSize:22,lineHeight:1,marginBottom:4}}>{icon}</div>
              <div style={{fontSize:18,fontWeight:900,color:"#FFD700",lineHeight:1}}>{pts}</div>
              {sub&&<div style={{fontSize:9,fontWeight:700,color:"#FFD700",opacity:0.75,letterSpacing:0.3,marginTop:1}}>{sub}</div>}
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:0.3,marginTop:3,textTransform:"uppercase",lineHeight:1.2}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 14px 48px"}}>
        {isLocked&&(
          <div style={{background:"rgba(10,46,138,0.07)",border:"1.5px solid rgba(10,46,138,0.14)",borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🔒</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:NAVY}}>{T[lang].picksLockedTitle}</div>
              <div style={{fontSize:11,color:"#6B7280",marginTop:2}}>
                {[championPick,runnerUpPick,topScorerPick?.player].filter(Boolean).length ? T[lang].picksLockedBody : T[lang].bonusClosedEmptySub}
              </div>
            </div>
          </div>
        )}

        {picks.map(({key, icon, color, bg, label, pickVal, flagTeam, subtext, empty, mode})=>(
          <div key={key} style={{background:"#fff",borderRadius:20,padding:"16px",marginBottom:12,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:54,height:54,borderRadius:16,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1.5px solid ${color}28`}}>
                <span style={{fontSize:30,lineHeight:1}}>{flagTeam ? (FLAGS[flagTeam]||"🏳") : icon}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,fontWeight:800,color,letterSpacing:0.8,textTransform:"uppercase",marginBottom:2}}>{label}</div>
                <div style={{fontSize:15,fontWeight:850,color:pickVal?DARK:"#9CA3AF",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{pickVal||empty}</div>
                {subtext&&<div style={{fontSize:11,color:"#9CA3AF",fontWeight:600,marginTop:1}}>{subtext}</div>}
              </div>
              {pickVal&&<div style={{width:22,height:22,borderRadius:"50%",background:GREEN,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",flexShrink:0}}>✓</div>}
            </div>
            {!isLocked&&(
              <button onClick={()=>onChampion(mode)}
                style={{marginTop:12,width:"100%",border:`1.5px solid ${pickVal?color+"44":"rgba(10,46,138,0.12)"}`,background:pickVal?"#fff":NAVY,borderRadius:12,padding:"10px 0",fontSize:13,fontWeight:800,color:pickVal?color:"#fff",cursor:"pointer",letterSpacing:0.2}}>
                {pickVal ? `✎ ${T[lang].changeLabel}` : `${T[lang].openBonusLabel} →`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HOME ────────────────────────────────────────────────────────────────────
function HomeScreen({ onPredict, onPredictKo, onLeaderboard, onBoards, onCreateBoard, onOpenGroups, onCopyPredictions, onCopyExactScores, onCopySpecial, onAccount, onNotifications, onChampion, onBooster, onBonus, myBoards, predictionsComplete, instantPickState=null, instantPickDone, allGroupsDone=false, groupsDoneCount=null, koPickDone, koUnlocked, exactScores, activeBoardId, setActiveBoardId, tournamentStarted, simDay, simHour, simMin, createdBoards=[], showFirstAction, leaderboardData={}, boardsLoading=false, predictionsLoaded={}, championPick=null, runnerUpPick=null, topScorerPick=null, setChampionPick=()=>{}, setTopScorerPick=()=>{}, myScoreBreakdown=null, hasUnread=false }) {
  const lang = useLang();
  const user = useUser();
  const displayName = useDisplayName();
  const initials = useInitials();
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const [showCopySheet, setShowCopySheet] = useState(null); // "predictions" | "scores" | null
  const [copyWeekStart, setCopyWeekStart] = useState(null);
  const [copyDone, setCopyDone] = useState({});
  const [boardSwitching, setBoardSwitching] = useState(false);
  const activeId = activeBoardId;
  const setActiveId = setActiveBoardId;
  const bonusPickLocked = isBonusPickLocked(simDay, simHour, simMin);
  const bonusPickCount = [championPick, runnerUpPick, topScorerPick?.player].filter(Boolean).length;
  const allSliderItems = myBoards;
  const [sliderPos, setSliderPos] = useState(()=>Math.max(0,myBoards.findIndex(b=>b.id===activeBoardId)));
  const sliderTouchRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const predPathRef = useRef(null);
  const scorerRowRef = useRef(null);
  const exactScoreRef = useRef(null);
  const moreToComeRef = useRef(null);
  useEffect(()=>{
    const idx = myBoards.findIndex(b=>b.id===activeId);
    if(idx>=0) setSliderPos(idx);
  },[activeId,myBoards]);
  useEffect(()=>{
    if(scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    setBoardSwitching(true);
    const t = setTimeout(()=>setBoardSwitching(false), 260);
    return ()=>clearTimeout(t);
  },[activeId]);
  const handleSliderTouchStart = (e)=>{ sliderTouchRef.current = e.touches[0].clientX; };
  const handleSliderTouchEnd = (e)=>{
    if(sliderTouchRef.current===null) return;
    const dx = e.changedTouches[0].clientX - sliderTouchRef.current;
    sliderTouchRef.current = null;
    if(Math.abs(dx)<28) return;
    if(dx<0 && sliderPos<allSliderItems.length-1){
      const np=sliderPos+1; setSliderPos(np); setActiveId(allSliderItems[np].id);
    } else if(dx>0 && sliderPos>0){
      const np=sliderPos-1; setSliderPos(np); setActiveId(allSliderItems[np].id);
    }
  };
  const activeBoard = myBoards.find(b=>b.id===activeId)||myBoards[0];
  const activeBoardName = activeBoard?.isGlobal ? "Global" : (activeBoard?.name || "League");
  const activeBoardContextLabel = lang === "ro"
    ? `Date afisate pentru ${activeBoardName}`
    : lang === "fr"
      ? `Donnees affichees pour ${activeBoardName}`
      : `Data shown for ${activeBoardName}`;
  // Get leaders for active board — prefer real DB data, fall back to placeholder
  const boardLeaders = (() => {
    const real = leaderboardData[activeBoard?.id];
    if (real?.length > 0) return real;
    if (!activeBoard) return [];
    const prizes = activeBoard.prizes || [];
    const medals = ["🥇","🥈","🥉","🏅","🎖️"];
    const slots = Math.max(3, prizes.length);
    return [
      { rank:1, name:displayName, pts:0, isMe:true, emoji:"🥇", prize:prizes[0]||null, accent:"#E8F0FF" },
      ...Array.from({length:slots-1},(_,i)=>({ rank:i+2, name:"—", pts:0, emoji:medals[i+1]||null, prize:prizes[i+1]||null, accent:"#fff", empty:true })),
    ];
  })();
  const leaders = boardLeaders;
  // Show all prize slots (or min 3) in top section
  const prizeSlots = leaders.filter(u=>u.emoji||u.isMe||u.empty).length;
  const topCount = Math.max(3, prizeSlots || 3);
  const top3 = leaders.slice(0, topCount);
  const _deadlinePassed = isMatchPast(11, '16:00', simDay, simHour);
  const predictionProgress = getPredictionProgress(instantPickState || {});
  const task1Done = predictionProgress.complete || instantPickDone || !!predictionsComplete[activeId];
  const _boardDone = task1Done;
  const allTasksDone = _boardDone && (!koUnlocked || koPickDone);
  const scrollTo = (ref) => {
    const el = ref.current;
    const container = scrollContainerRef.current;
    if (!el || !container) return;
    const diff = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollBy({ top: diff - 12, behavior: 'smooth' });
  };
  useEffect(()=>{
    if(!instantPickDone){ _pickNotDone.add(activeId); return; }
    if(!_pickNotDone.has(activeId)||_pickScrolled.has(activeId)) return;
    _pickScrolled.add(activeId);
    setTimeout(()=>scrollTo(exactScoreRef), 700);
  },[instantPickDone,activeId]);
  const _exCalendarEvents = getDisplayCalendarEvents();
  const _exWkMM = (()=>{ const mm={}; _exCalendarEvents.forEach(e=>{mm[e.day]=e.matches;}); return mm; })();
  const _exWkDays = (s)=>Array.from({length:7},(_,i)=>s+i).filter(d=>d>=1&&d<=50);
  const _exWkTotal = (s)=>_exWkDays(s).reduce((a,d)=>a+(_exWkMM[d]||[]).length,0);
  const _exWkScored = (s)=>_exWkDays(s).reduce((a,d)=>a+(_exWkMM[d]||[]).filter((m,i)=>(exactScores||{})[getMatchKey(m,d,i)]).length,0);
  const todaySimEx = simDay ?? getLocalTournamentDay();
  const exactWeekStart = todaySimEx<=14?8:todaySimEx<=21?15:todaySimEx<=28?22:29;
  const _calWeeks = [-6,1,8,15,22,29,36,43];
  const todayCalendarWeek = _calWeeks.find(w=>todaySimEx>=w&&todaySimEx<=w+6) ?? _calWeeks[0];
  const exactWeekTotal = _exWkTotal(exactWeekStart);
  const exactWeekScored = _exWkScored(exactWeekStart);
  const exactWeekDone = exactWeekTotal>0 && exactWeekScored===exactWeekTotal;
  const exactWeekHasStarted = _exCalendarEvents
    .filter(e => e.day >= exactWeekStart && e.day <= exactWeekStart + 6)
    .some(e => (e.matches||[]).some(m => isMatchPast(e.day, m.time, simDay, simHour, m.kickoffUtc)));
  const _exSimNow = simDay ? new Date(Date.UTC(2026,5,simDay,(simHour||12)+4,simMin||0,0)) : new Date();
  const _exJune = (d) => new Date(Date.UTC(2026,5,d,12,0,0)); // 08:00 ET = 12:00 UTC
  const exactWeekUnlocked = exactWeekStart===8 ? true
    : exactWeekStart===15 ? _exSimNow >= _exJune(14)
    : exactWeekStart===22 ? _exSimNow >= _exJune(21)
    : _exSimNow >= _exJune(28);
  const nextTask =
    !_boardDone ? 0 :
    (!exactWeekDone && exactWeekUnlocked) ? 1 :
    null;
  const predDoneCount = Math.max(predictionProgress.done, groupsDoneCount !== null ? groupsDoneCount : 0);
  const _predStepsTotal = predictionProgress.total;
  const _predStepsDone = _boardDone ? _predStepsTotal : predDoneCount;
  const naCard = (()=>{
    if(nextTask===0) return { title:T[lang].predCardTitle, sub:T[lang].predCardSub, due:!_deadlinePassed?T[lang].dueJun11:null, progress:_predStepsDone, total:_predStepsTotal, label:predDoneCount>0?T[lang].continuePredictions:T[lang].startPredictions, onClick:()=>onPredict(activeId), badge:T[lang].nextActionLabel };
    if(nextTask===1) return { title:T[lang].exactCardTitle, sub:T[lang].exactCardSub, due:!_deadlinePassed?T[lang].dueJun11:null, progress:exactWeekScored, total:Math.max(2, exactWeekTotal), label:T[lang].openScores, onClick:()=>onOpenGroups&&onOpenGroups(exactWeekStart), badge:T[lang].nextActionLabel };
    return { title:T[lang].allDoneTitle, sub:T[lang].allDoneSub, due:null, progress:1, total:1, label:"", onClick:()=>{}, badge:T[lang].upToDateLabel };
  })();
  const naPct = naCard.total>0 ? Math.round((naCard.progress/naCard.total)*100) : 100;
  const exKey = `${activeId}-${exactWeekStart}`;
  useEffect(()=>{
    if(!exactWeekDone){ _exNotDone.add(exKey); return; }
    if(!_exNotDone.has(exKey)||_exScrolled.has(exKey)) return;
    _exScrolled.add(exKey);
    const nextWeeks=[8,15,22,29];
    const nextIdx=nextWeeks.indexOf(exactWeekStart)+1;
    setTimeout(()=>{
      if(nextIdx<nextWeeks.length){
        const container=scrollContainerRef.current;
        const el=container?.querySelector(`[data-week="${nextWeeks[nextIdx]}"]`);
        if(el&&container){ const diff=el.getBoundingClientRect().top-container.getBoundingClientRect().top; container.scrollBy({top:diff-12,behavior:'smooth'}); }
      } else { scrollTo(moreToComeRef); }
    }, 700);
  },[exactWeekDone,exKey]);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"transparent",overflow:"hidden",position:"relative"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"linear-gradient(to bottom, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 28%, rgba(255,255,255,0.02) 48%, transparent 65%)",borderRadius:26,margin:"10px 14px 0",boxShadow:"0 4px 16px rgba(10,46,138,0.04), inset 0 1px 0 rgba(255,255,255,0.40)",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden",position:"relative",willChange:"transform",transform:"translateZ(0)"}}>
        {/* Blur layer — fades from top */}
        <div style={{position:"absolute",inset:0,backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",WebkitMaskImage:"linear-gradient(to bottom, black 0%, black 44%, transparent 64%)",maskImage:"linear-gradient(to bottom, black 0%, black 44%, transparent 64%)",pointerEvents:"none",zIndex:0}}/>
        {/* Gloss highlight */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:"45%",background:"linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 40%, transparent 65%)",pointerEvents:"none",zIndex:0}}/>
        <div style={{padding:"12px 14px 0",flexShrink:0,position:"relative",zIndex:2}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0,paddingTop:20,position:"relative"}}>
            <button onClick={onAccount} style={{width:44,height:44,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
              {avatarUrl
                ? <img src={avatarUrl} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}} alt=""/>
                : <div style={{width:36,height:36,borderRadius:"50%",background:NAVY,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",fontWeight:700}}>{initials}</div>
              }
            </button>
            <p style={{fontSize:11,fontWeight:700,color:"rgba(10,46,138,0.75)",margin:"4px 0 0"}}>{T[lang].hiGreeting} {displayName.split(" ")[0]} 👋</p>
          </div>
          <div style={{textAlign:"center"}}>
            <img src={predictoLogo} alt="Predicto" decoding="sync" style={{height:36,width:"auto",objectFit:"contain",display:"block",margin:"0 auto",position:"relative",left:3}}/>
            <h1 style={{fontSize:10,fontWeight:700,margin:"2px 0 0",letterSpacing:2.5,lineHeight:1,background:"linear-gradient(100deg,#CC0022 0%,#003399 50%,#007733 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>WORLD CUP 2026</h1>
            <p style={{fontSize:11,color:"#6B7280",margin:"3px 0 0"}}>{T[lang].location}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0,paddingTop:20}}>
            <button onClick={onNotifications} style={{background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
              <div style={{position:"relative"}}>
                <img src={bellIcon} alt="Notifications" style={{width:44,height:44}}/>
                {hasUnread && <div style={{position:"absolute",top:4,right:4,width:12,height:12,borderRadius:"50%",background:"#C8102E",border:"2.5px solid #EEF2FF",boxShadow:"0 1px 4px rgba(200,16,46,0.5)"}}/>}
              </div>
            </button>
            <p style={{fontSize:11,color:"transparent",margin:0,userSelect:"none"}}> </p>
          </div>
        </div>
        </div>
      {(()=>{
        const leftItem  = allSliderItems[sliderPos-1] ?? null;
        const centerItem= allSliderItems[sliderPos];
        const rightItem = allSliderItems[sliderPos+1] ?? null;
        const renderItem = (item, pos) => {
          if(!item) return <div style={{flex:1}}/>;
          const isCenter = pos===0;
          const dist = Math.abs(pos);
          const handleTap = ()=>{
            if(!isCenter){ const np=sliderPos+pos; setSliderPos(np); setActiveId(item.id); }
          };
          const boardLeaders = leaderboardData[item.id];
          const myRank = boardLeaders?.find(u=>u.isMe)?.rank;
          const memberCount = item.members;
          return (
            <div style={{flex:1,display:"flex",justifyContent:"center",alignItems:"center",minWidth:0,overflow:"visible"}}>
              <CircleTab label={item.label} imageUrl={item.image_url||undefined} name={isCenter?"":item.isGlobal?"Global":item.name.split(" ")[0]}
                isActive={isCenter} onClick={handleTap} lightBg distance={dist}
                rank={isCenter?myRank:undefined} members={isCenter?memberCount:undefined}
                done={isCenter&&allTasksDone}/>
            </div>
          );
        };
        return (
          <div style={{margin:"10px 8px 0",background:"#fff",borderRadius:20,border:"none",display:"flex",alignItems:"center",padding:"4px 8px 8px",overflow:"visible",flexShrink:0,position:"relative",zIndex:3,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
            <button onClick={()=>{ const np=sliderPos+1; if(np<allSliderItems.length){setSliderPos(np);setActiveId(allSliderItems[np].id);} }}
              style={{background:"none",border:"none",padding:"0 16px",cursor:"pointer",color:NAVY,opacity:sliderPos<allSliderItems.length-1?0.65:0.12,WebkitTapHighlightColor:"transparent",lineHeight:1,transition:"opacity 0.2s",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronIcon direction="left" size={20} color={NAVY}/></button>
            <div onTouchStart={handleSliderTouchStart} onTouchEnd={handleSliderTouchEnd}
              style={{flex:1,display:"flex",alignItems:"center",userSelect:"none",touchAction:"pan-x",overflow:"visible",padding:"6px 2px",minWidth:0}}>
              {renderItem(leftItem,-1)}
              {renderItem(centerItem,0)}
              {renderItem(rightItem,1)}
            </div>
            <button onClick={()=>{ const np=sliderPos-1; if(np>=0){setSliderPos(np);setActiveId(allSliderItems[np].id);} }}
              style={{background:"none",border:"none",padding:"0 16px",cursor:"pointer",color:NAVY,opacity:sliderPos>0?0.65:0.12,WebkitTapHighlightColor:"transparent",lineHeight:1,transition:"opacity 0.2s",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronIcon size={20} color={NAVY}/></button>
          </div>
        );
      })()}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:"0 14px 6px",marginTop:-14,flexShrink:0,position:"relative",zIndex:4}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,maxWidth:"calc(100% - 20px)",background:"rgba(255,255,255,0.84)",border:"1px solid rgba(10,46,138,0.10)",borderRadius:999,padding:"7px 13px",boxShadow:"0 8px 22px rgba(10,46,138,0.08), inset 0 1px 0 rgba(255,255,255,0.85)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",opacity:boardSwitching?0.68:1,transform:`translateY(${boardSwitching?3:0}px) scale(${boardSwitching?0.985:1})`,transition:"opacity 0.22s ease, transform 0.22s ease"}}>
          <span style={{width:18,height:18,borderRadius:"50%",background:"rgba(10,46,138,0.09)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>🏆</span>
          <span style={{fontSize:11,fontWeight:800,color:NAVY,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.15}}>{activeBoardContextLabel}</span>
        </div>
      </div>
      <div ref={scrollContainerRef} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"10px 6px 110px",opacity:boardSwitching?0.72:1,transform:`translateY(${boardSwitching?6:0}px)`,transition:"opacity 0.22s ease, transform 0.22s ease"}}>
        <style>{`@keyframes bonusBadgePulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(234,179,8,0.45)}55%{transform:scale(1.1);box-shadow:0 0 0 8px rgba(234,179,8,0)}}`}</style>
        <button onClick={onBonus} style={{width:"100%",display:"flex",alignItems:"center",gap:14,background:`linear-gradient(135deg, rgba(15,15,32,0.58) 0%, rgba(8,14,40,0.65) 100%), url(${stadiumBg}) center 30%/cover no-repeat`,borderRadius:20,padding:"15px 16px",border:"none",boxShadow:"0 4px 16px rgba(0,0,0,0.06)",cursor:"pointer",marginBottom:14,WebkitTapHighlightColor:"transparent",textAlign:"left"}}>
          <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(234,179,8,0.14)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"2px solid rgba(234,179,8,0.3)"}}>
            <span style={{fontSize:26,lineHeight:1}}>⚡</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              <div style={{fontSize:15,fontWeight:900,color:"#FFD700",letterSpacing:0.3}}>{bonusPickLocked ? T[lang].bonusClosedTitle : T[lang].bonusPrediction}</div>
              <div style={{background:"rgba(255,255,255,0.14)",border:"1px solid rgba(255,215,0,0.36)",borderRadius:999,padding:"3px 7px",fontSize:9,fontWeight:900,color:"#FFD700",letterSpacing:0.4,textTransform:"uppercase",lineHeight:1}}>
                {bonusPickLocked ? T[lang].locked : T[lang].bonusDueJun14}
              </div>
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.76)",marginTop:5,lineHeight:1.4,fontWeight:750}}>
              {bonusPickLocked
                ? (bonusPickCount ? T[lang].bonusClosedSub : T[lang].bonusClosedEmptySub)
                : `${bonusPickCount}/3 ${T[lang].selectedLabel}`}
            </div>
          </div>
          <div style={{background:"#FFD700",borderRadius:8,padding:"4px 8px",fontSize:10,fontWeight:900,color:"#1a1a2e",letterSpacing:0.5,flexShrink:0,animation:bonusPickLocked?"none":"bonusBadgePulse 1.8s ease-in-out infinite"}}>
            {bonusPickLocked ? T[lang].locked : "BONUS"}
          </div>
          <span style={{fontSize:18,color:"rgba(255,255,255,0.35)",fontWeight:700,lineHeight:1,marginLeft:4}}>›</span>
        </button>
        <NextActionCard card={naCard} pct={naPct} nextTask={nextTask} />
        <div style={{marginBottom:14}}>
          <HomeSectionLabel>{T[lang].yourProgress}</HomeSectionLabel>
          <HomeCard>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
              <ProgressTile
                icon="📋"
                title={T[lang].predictions}
                value={`${predDoneCount}/${_predStepsTotal}`}
                withDivider
                onClick={()=>onPredict(activeId)}
                copyEnabled={predictionProgress.complete&&!_deadlinePassed}
                onCopy={()=>{setCopyDone({});setShowCopySheet("predictions");}}
              />
              <ProgressTile
                icon={exactWeekUnlocked?"📊":<LockIcon size={17} color={NAVY} strokeWidth={2.1}/>}
                title={T[lang].exactScores}
                value={exactWeekUnlocked?`${exactWeekScored}/${exactWeekTotal}`:T[lang].locked}
                active={exactWeekUnlocked}
                onClick={()=>onOpenGroups&&onOpenGroups(exactWeekStart)}
                copyEnabled={exactWeekUnlocked&&exactWeekDone&&!exactWeekHasStarted}
                onCopy={()=>{setCopyDone({});setCopyWeekStart(exactWeekStart);setShowCopySheet("scores");}}
              />
            </div>
          </HomeCard>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <ThisWeekCard
            title={T[lang].thisWeekLabel}
            body={exactWeekUnlocked?exactWeekDone?T[lang].weekComplete+" ✓":(exactWeekTotal-exactWeekScored)+" "+T[lang].scoresLeftThisWeek:T[lang].exactScoresUnlock+" Sun 8:00"}
            buttonLabel={exactWeekUnlocked?T[lang].openScores:T[lang].locked}
            locked={!exactWeekUnlocked}
            onOpen={()=>onOpenGroups&&onOpenGroups(todayCalendarWeek)}
            date={simDay?new Date(2026,5,simDay,simHour||12):new Date()}
          />
          <LeagueRankingCard
            title={T[lang].leagueRanking}
            viewLabel={T[lang].viewRanking}
            top3={top3}
            avatarUrl={avatarUrl}
            displayName={displayName}
            onLeaderboard={onLeaderboard}
            lang={lang}
          />
        </div>
        <div ref={predPathRef} style={{height:0}}/><div ref={scorerRowRef} style={{height:0}}/><div ref={exactScoreRef} style={{height:0}}/><div ref={moreToComeRef} style={{height:0}}/>
      </div>
      </div>
      {/* Copy predictions sheet */}
    {showCopySheet&&(
      <div style={{position:"fixed",inset:0,zIndex:1100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}
        onClick={()=>setShowCopySheet(false)}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/>
        <div onClick={e=>e.stopPropagation()}
          style={{position:"relative",background:"#1C1C1E",borderRadius:"20px 20px 0 0",padding:"0 0 calc(env(safe-area-inset-bottom, 10px) + 90px)",maxHeight:"70vh",display:"flex",flexDirection:"column"}}>
          {/* Handle */}
          <div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px"}}>
            <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)"}}/>
          </div>
          {/* Header */}
          <div style={{padding:"8px 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                <rect x="4" y="4" width="8" height="8" rx="1.5" stroke={GREEN} strokeWidth="1.8"/>
                <path d="M2 10V2h8" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{fontSize:15,fontWeight:800,color:"#fff"}}>
                {showCopySheet==="scores"?T[lang].copyExactScoresTitle:showCopySheet==="champion"?T[lang].copyWinnerTeamTitle:showCopySheet==="scorer"?T[lang].copyTopScorerTitle:showCopySheet==="special"?T[lang].copySpecialTitle:T[lang].copyPredictionsTitle}
              </span>
            </div>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.45)",margin:"4px 0 0"}}>
              {showCopySheet==="scores"
                ?T[lang].copyExactScoresSub
                :showCopySheet==="champion"
                ?T[lang].copyWinnerTeamSub
                :showCopySheet==="scorer"
                ?T[lang].copyTopScorerSub
                :showCopySheet==="special"
                ?T[lang].copySpecialSub
                :T[lang].copyPredsSub}
            </p>
          </div>
          {/* Board list */}
          <div style={{overflowY:"auto",flex:1,padding:"10px 16px 0"}}>
            {myBoards.filter(b=>b.id!==activeId).length===0?(
              <div style={{textAlign:"center",padding:"24px 0",color:"rgba(255,255,255,0.35)",fontSize:13}}>
                {T[lang].noOtherBoards}
              </div>
            ):myBoards.filter(b=>b.id!==activeId).map(b=>(
              <div key={b.id}
                onClick={async()=>{
                  if(copyDone[b.id]) return;
                  if(showCopySheet==="scores") await onCopyExactScores&&onCopyExactScores(b.id, copyWeekStart);
                  else if(showCopySheet==="champion"||showCopySheet==="scorer"||showCopySheet==="special") await onCopySpecial&&onCopySpecial(b.id,showCopySheet);
                  else await onCopyPredictions&&onCopyPredictions(b.id);
                  setCopyDone(p=>({...p,[b.id]:true}));
                }}
                style={{display:"flex",alignItems:"center",gap:12,padding:"12px 4px",
                  borderBottom:"1px solid rgba(255,255,255,0.07)",cursor:"pointer"}}>
                <span style={{fontSize:22,display:"inline-block",width:30,flexShrink:0}}>{b.emoji||"⚽"}</span>
                <span style={{flex:1,fontSize:13,fontWeight:700,color:"#fff"}}>{b.name}</span>
                {copyDone[b.id]?(
                  <span style={{fontSize:12,fontWeight:700,color:GREEN}}>{T[lang].copiedLabel}</span>
                ):(
                  <div style={{background:`linear-gradient(135deg,${GREEN},#007A36)`,borderRadius:8,
                    padding:"5px 12px",display:"flex",alignItems:"center",gap:5}}>
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="#fff" strokeWidth="1.8"/>
                      <path d="M2 10V2h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{T[lang].pasteLabel}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </div>
  );
}


// ── BOARDS ────────────────────────────────────────────────────────────────────



// ── BOARDS ────────────────────────────────────────────────────────────────────
function BoardsScreen({ onBack, myBoards, setMyBoards, onJoin, createdBoards: createdBoardsProp, setCreatedBoards: setCreatedBoardsProp, availableBoards: availableBoardsProp, setAvailableBoards: setAvailableBoardsProp, showToast, user, onCreateBoard, onUpdateBoard, onJoinByCode, onJoinBoard, onDeleteBoard, onRemoveMember, leaderboardData={}, initialTab="my", onViewChange }) {
  const displayName = useDisplayName();
  const lang = useLang();
  const [view, setView] = useState("main"); // main | join | create
  const changeView = (v) => { setView(v); onViewChange?.(v); };
  const [activeTab, setActiveTab] = useState(initialTab); // my | available | admin
  const [showCodeInfo, setShowCodeInfo] = useState(false);
  const [boardSearch, setBoardSearch] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  // Create form state
  const [cName, setCName] = useState("");
  const [cEmoji, setCEmoji] = useState("");
  const [cImageFile, setCImageFile] = useState(null);
  const [cImagePreview, setCImagePreview] = useState(null);
  const [cRemoveImage, setCRemoveImage] = useState(false);
  const boardImageInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cPassword, setCPassword] = useState("");
  const [cMaxPlayers, setCMaxPlayers] = useState(10);
  const [cSlots, setCSlots] = useState(3);
  const [cPrizes, setCPrizes] = useState(["","",""]);
  const [editBoard, setEditBoard] = useState(null); // board being edited

  const createdBoards = createdBoardsProp || [];
  const setCreatedBoards = setCreatedBoardsProp || (()=>{});
  const availBoards = availableBoardsProp || [];
  const setAvailBoards = setAvailableBoardsProp || (()=>{});
  const [joinPrompt, setJoinPrompt] = useState(null);
  const [joinPass, setJoinPass] = useState("");
  const [joinError, setJoinError] = useState("");

  const [viewMembersBoard, setViewMembersBoard] = useState(null);
  const [boardMembersMap, setBoardMembersMap] = useState({});
  const [boardLeadersMap, setBoardLeadersMap] = useState({});
  const [leaveConfirmBoard, setLeaveConfirmBoard] = useState(null);
  const [deleteConfirmBoard, setDeleteConfirmBoard] = useState(null);
  const createPanelStyle = { ...UI.card, padding: 14, marginBottom: 14 };
  const createInputStyle = { ...UI.inputPanel, padding: "11px 14px" };
  const createOptionStyle = (active) => ({
    flex: 1,
    padding: "9px 0",
    borderRadius: 10,
    border: `1px solid ${active ? NAVY : "rgba(10,46,138,0.07)"}`,
    cursor: "pointer",
    background: active ? `linear-gradient(135deg,${NAVY}cc,#001840cc)` : "#F8FAFC",
    color: active ? "#fff" : DARK,
    fontWeight: active ? 800 : 650,
    fontSize: 12,
    boxShadow: active ? "0 3px 10px rgba(0,32,91,0.18)" : "none",
  });

  const openMembers = async (boardId) => {
    if (viewMembersBoard === boardId) { setViewMembersBoard(null); return; }
    setViewMembersBoard(boardId);
    const [members, leaders] = await Promise.all([
      loadBoardMembers(boardId),
      loadLeaderboard(boardId),
    ]);
    setBoardMembersMap(prev => ({ ...prev, [boardId]: members }));
    setBoardLeadersMap(prev => ({ ...prev, [boardId]: leaders }));
  };

  const doJoin = async (b, password = "") => {
    if(!myBoards.find(x=>x.id===b.id)){
      if(onJoinBoard) {
        const result = await onJoinBoard(b.id, password);
        if(result?.error) {
          setJoinError(result.error);
          if(showToast) showToast(result.error, "❌");
          return false;
        }
      }
      setMyBoards(p=>appendJoinedBoard(p,{...b}));
      setAvailBoards(p=>p.map(c=>c.id===b.id?{...c,members:(c.members||0)+1}:c));
      if(showToast) showToast(`Joined "${b.name}"!`, "🏆");
      if(onJoin) onJoin(b.id);
    }
    return true;
  };

  const removeMember = (boardId, memberId) => {
    setCreatedBoards(p=>p.map(b=>b.id===boardId?{
      ...b,
      members:Math.max(0,(b.members||0)-1),
      membersList:(b.membersList||[]).filter(m=>m.id!==memberId)
    }:b));
  };

  const joinBoard = b => {
    if(b.has_password) {
      setJoinPrompt(b);
      setJoinPass("");
      setJoinError("");
    } else {
      doJoin(b);
    }
  };

  const handleJoinCode = async () => {
    const trimmed = boardSearch.trim();
    const found = [...availBoards, ...createdBoards].find(b=>b.code===trimmed.toUpperCase()||b.id===trimmed);
    if(found){ joinBoard(found); setBoardSearch(""); setCodeError(""); return; }
    if (onJoinByCode) {
      const data = await onJoinByCode(trimmed);
      if (data) { setBoardSearch(""); setCodeError(""); if(onJoin) onJoin(data.id); }
      else setCodeError(T[lang].invalidCode);
      return;
    }
    setCodeError(T[lang].invalidCode);
  };

  const handleCreate = async () => {
    if(!cName.trim()) return;
    if(!editBoard && onCreateBoard) {
      const data = await onCreateBoard({
        name: cName,
        emoji: cEmoji || cName[0].toUpperCase(),
        type: 'private',
        password: cPassword,
        max_players: cMaxPlayers,
        prizes: cPrizes.slice(0, cSlots).filter(p=>p.trim()),
        imageFile: cImageFile || null,
      });
      if(data) {
        if(showToast) showToast(`"${cName}" league created`, "🏆");
        setCName(""); setCEmoji(""); setCPassword(""); setShowEmojiPicker(false);
        setCImageFile(null); setCImagePreview(null); setCRemoveImage(false);
        setEditBoard(null); changeView("main");
      }
      return;
    }
    const newBoard = {
      id: editBoard ? editBoard.id : `custom_${Date.now()}`,
      name: cName,
      label: cEmoji || cName[0].toUpperCase(),
      members: editBoard ? editBoard.members : 0,
      max: cMaxPlayers,
      isGlobal: false,
      password: cPassword,
      prizes: cPrizes.slice(0, cSlots).filter(p=>p.trim()),
      code: editBoard ? editBoard.code : (()=>{
        const letter = "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random()*23)];
        const digits = Math.floor(10000+Math.random()*90000);
        return `${letter}${digits}`;
      })(),
      isAdmin: true,
    };
    if(editBoard) {
      if(onUpdateBoard) {
        const imageFile = cImageFile || null;
        const result = await onUpdateBoard(editBoard.id, {
          name: cName,
          emoji: cEmoji || cName[0].toUpperCase(),
          type: 'private',
          password: cPassword,
          max_players: cMaxPlayers,
          prizes: cPrizes.slice(0, cSlots).filter(p=>p.trim()),
          imageFile,
          removeImage: cRemoveImage,
        });
        if(!result) return;
        // Use DB-returned data so has_password and other computed fields are correct
        setMyBoards(p=>p.map(b=>b.id===editBoard.id?{...b,...result}:b));
        setAvailBoards(p=>p.map(b=>b.id===editBoard.id?{...b,...result}:b));
      } else {
        setCreatedBoards(p=>p.map(b=>b.id===editBoard.id?newBoard:b));
        setMyBoards(p=>p.map(b=>b.id===editBoard.id?{...b,...newBoard}:b));
      }
      if(showToast) showToast("League updated", "✏️");
    } else {
      setCreatedBoards(p=>[...p, newBoard]);
      if(showToast) showToast(`"${cName}" league created`, "🏆");
      if(onJoin) onJoin(newBoard.id);
    }
    setEditBoard(null); setCEmoji(""); setShowEmojiPicker(false);
    setCImageFile(null); setCImagePreview(null); setCRemoveImage(false); changeView("main");
  };

  const isJoined = id => myBoards.some(b=>b.id===id);
  const boardCopy = {
    manageTabs: [
      {key:"my",label:T[lang].joinedBoards},
      {key:"available",label:T[lang].discoverTab},
      {key:"admin",label:T[lang].adminLabel},
    ],
    namePlaceholder: T[lang].leagueNamePlaceholder,
    passwordPlaceholder: T[lang].enterPassword,
    searchPlaceholder: T[lang].searchOrCode,
    joinedEmptyTitle: T[lang].joinedEmptyTitle,
    joinedEmptyBody: T[lang].joinedEmptyBody,
    availableEmptyTitle: T[lang].availableEmptyTitle,
    availableEmptyBody: T[lang].availableEmptyBody,
    adminEmptyTitle: T[lang].adminEmptyTitle,
    adminEmptyBody: T[lang].adminEmptyBody,
  };

  if(view==="create") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,position:"relative",overflow:"hidden"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <HeaderShell onBack={()=>changeView("main")}>{editBoard ? T[lang].editBoard : T[lang].createBoard}</HeaderShell>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 24px",position:"relative",zIndex:1}}>
        {/* Name */}
        <Card style={createPanelStyle}>
          <p style={UI.formLabel}>{T[lang].boardName}</p>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {/* Avatar emoji/photo picker */}
            <input ref={boardImageInputRef} type="file" accept="image/*" style={{display:"none"}}
              onChange={e=>{
                const f=e.target.files?.[0]; if(!f) return;
                setCImageFile(f); setCImagePreview(URL.createObjectURL(f)); setCRemoveImage(false);
                setCEmoji(""); setShowEmojiPicker(false);
                e.target.value="";
              }}/>
            <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{width:52,height:52,borderRadius:14,overflow:"hidden",
                background:cEmoji||cImagePreview?"#F8FAFC":`linear-gradient(135deg,${NAVY}cc,#001840cc)`,
                display:"flex",alignItems:"center",justifyContent:"center",
                border:`1px solid rgba(10,46,138,0.07)`}}>
                {cImagePreview
                  ? <img src={cImagePreview} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : cEmoji
                    ? <span style={{fontSize:28}}>{cEmoji}</span>
                    : <span style={{fontSize:22,color:"rgba(255,255,255,0.8)"}}>?</span>}
              </div>
              <div style={{display:"flex",gap:4}}>
                <div onClick={()=>{setShowEmojiPicker(p=>!p); setCImageFile(null); setCImagePreview(null); setCRemoveImage(Boolean(editBoard?.image_url));}}
                  style={{fontSize:10,fontWeight:700,color:showEmojiPicker?NAVY:"#888",cursor:"pointer",
                    padding:"3px 7px",borderRadius:6,background:showEmojiPicker?`${NAVY}15`:"rgba(0,0,0,0.05)"}}>
                  😊 Emoji
                </div>
                <div onClick={()=>boardImageInputRef.current?.click()}
                  style={{fontSize:10,fontWeight:700,color:cImagePreview?NAVY:"#888",cursor:"pointer",
                    padding:"3px 7px",borderRadius:6,background:cImagePreview?`${NAVY}15`:"rgba(0,0,0,0.05)"}}>
                  📷 Foto
                </div>
                {(cEmoji||cImagePreview)&&<div onClick={()=>{setCEmoji("");setCImageFile(null);setCImagePreview(null);setCRemoveImage(Boolean(editBoard?.image_url));setShowEmojiPicker(false);}}
                  style={{fontSize:10,fontWeight:700,color:"#FF3B30",cursor:"pointer",
                    padding:"3px 7px",borderRadius:6,background:"rgba(255,59,48,0.08)"}}>
                  <XIcon size={15}/>
                </div>}
              </div>
            </div>
            <InputPanel style={{...createInputStyle,flex:1}}>
              <input value={cName} onChange={e=>setCName(e.target.value)} placeholder={boardCopy.namePlaceholder}
                style={{width:"100%",background:"transparent",border:"none",outline:"none",fontSize:14,color:DARK}}/>
            </InputPanel>
          </div>
        </Card>
        {/* Emoji grid */}
        {showEmojiPicker&&(
          <Card style={{...createPanelStyle,marginTop:-4}}>
            <p style={UI.formLabel}>{T[lang].chooseEmoji}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6}}>
              {["⚽","🏆","🥇","🎯","🔥","⭐","💪","🦁","🐯","🦅","🌍","🎖️","🏅","🥊","🎮","🎪",
                "🍕","🍺","🎉","🚀","💎","🌟","👑","🤝","🏋️","🎸","🏄","🎭"].map(e=>(
                <div key={e} onClick={()=>{ setCEmoji(e); setCImageFile(null); setCImagePreview(null); setCRemoveImage(Boolean(editBoard?.image_url)); setShowEmojiPicker(false); }}
                  style={{width:"100%",aspectRatio:"1",borderRadius:8,display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:20,cursor:"pointer",
                    background:cEmoji===e?`${NAVY}18`:"#F8FAFC",
                    border:cEmoji===e?`1.5px solid ${NAVY}`:"1px solid rgba(10,46,138,0.06)"}}>
                  {e}
                </div>
              ))}
            </div>
            {cEmoji&&(
              <Button variant="ghost" onClick={()=>{ setCEmoji(""); setCRemoveImage(Boolean(editBoard?.image_url)); setShowEmojiPicker(false); }}
                style={{marginTop:10,width:"100%"}}>
                {T[lang].del}
              </Button>
            )}
          </Card>
        )}

        <Card style={createPanelStyle}>
          {/* Password */}
          <p style={UI.formLabel}>{T[lang].boardPassword}</p>
          <InputPanel style={{...createInputStyle,marginBottom:14}}>
            <LockIcon size={14} color="#9CA3AF" strokeWidth={2.1}/>
            <input value={cPassword} onChange={e=>setCPassword(e.target.value)} placeholder={boardCopy.passwordPlaceholder}
              style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:14,color:DARK}}/>
          </InputPanel>

          {/* Max players */}
          <p style={UI.formLabel}>{T[lang].maxPlayers}</p>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[5,10,15,20,50].map(n=>(
              <button key={n} onClick={()=>setCMaxPlayers(n)} style={createOptionStyle(cMaxPlayers===n)}>
                {n}
              </button>
            ))}
          </div>

          {/* Prize slots */}
          <p style={UI.formLabel}>{T[lang].prizedSlots}</p>
          <div style={{display:"flex",gap:8}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>{ setCSlots(n); setCPrizes(p=>{const a=[...p];while(a.length<n)a.push("");return a;}); }} style={createOptionStyle(cSlots===n)}>
                {n}
              </button>
            ))}
          </div>
        </Card>

        {/* Prizes per slot */}
        <Card style={createPanelStyle}>
          <p style={UI.formLabel}>{T[lang].prizesLabel}</p>
          {Array.from({length:cSlots},(_,i)=>(
            <InputPanel key={i} style={{...createInputStyle,marginBottom:i<cSlots-1?8:0}}>
              <div style={{width:28,height:28,borderRadius:8,background:i===0?"#FFD700":i===1?"#C0C0C0":"#CD7F32",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                {i===0?"🥇":i===1?"🥈":"🥉"}
              </div>
              <span style={{fontSize:12,fontWeight:750,color:"#9CA3AF",width:50}}>Rank {i+1}</span>
              <input value={cPrizes[i]||""} onChange={e=>{ const a=[...cPrizes]; a[i]=e.target.value; setCPrizes(a); }}
                placeholder={[
                  "e.g. $50, team jersey, gift voucher...",
                  "e.g. $30, match ticket, voucher...",
                  "e.g. $15, cap, surprise gift...",
                  "e.g. Drinks on you, weekend trip...",
                  "e.g. Cake, Netflix subscription..."
                ][i]||"e.g. Your prize..."}
                style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:DARK,minWidth:0}}/>
            </InputPanel>
          ))}
        </Card>

        {/* Members management — only when editing */}
        {editBoard&&(editBoard.membersList?.length>0)&&(<>
          <p style={{...UI.formLabel,margin:"16px 0 8px"}}>{T[lang].membersLabel}</p>
          <Card>
            {(editBoard.membersList||[]).map((m,mi)=>(
              <div key={mi} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                  background:"#fff",borderBottom:mi<editBoard.membersList.length-1?"1px solid rgba(10,46,138,0.05)":"none"}}>
                <div style={{width:32,height:32,borderRadius:"50%",
                  background:m.isMe?`${NAVY}22`:"rgba(0,0,0,0.07)",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:13,fontWeight:700,color:m.isMe?NAVY:"#888"}}>{m.name[0]}</span>
                </div>
                <span style={{flex:1,fontSize:13,fontWeight:600,color:m.isMe?NAVY:DARK}}>{m.name}{m.isMe?" (You)":""}</span>
                {!m.isMe?(
                  <button onClick={()=>{
                    const updated = {...editBoard, membersList: editBoard.membersList.filter(x=>x.id!==m.id), members:Math.max(0,(editBoard.members||0)-1)};
                    setEditBoard(updated);
                    setCreatedBoards(p=>p.map(b=>b.id===updated.id?updated:b));
                  }} style={UI.dangerButton}>
                    Remove
                  </button>
                ):(
                  <span style={{fontSize:11,color:"#bbb"}}>Admin</span>
                )}
              </div>
            ))}
          </Card>
        </>)}

        <Button onClick={handleCreate} disabled={!cName.trim()}
          style={{width:"100%",marginTop:16,padding:"15px 0",borderRadius:14,fontSize:15,fontWeight:800,
            background:cName.trim()?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"#e0e0e0",
            color:cName.trim()?"#fff":"#bbb",
            boxShadow:cName.trim()?"0 6px 20px rgba(0,32,91,0.18)":"none"}}>
          {editBoard ? T[lang].saveChanges : T[lang].createBoard2}
        </Button>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,position:"relative",overflow:"hidden"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <HeaderShell onBack={onBack} footer={
          <div style={{display:"flex",gap:0,borderTop:"1px solid rgba(0,0,0,0.06)",marginTop:10,position:"relative",zIndex:1}}>
            {boardCopy.manageTabs.map(t=>(
              <button key={t.key} onClick={()=>setActiveTab(t.key)}
                style={{flex:1,background:"transparent",border:"none",cursor:"pointer",padding:"12px 0",
                  fontSize:12,fontWeight:700,color:activeTab===t.key?NAVY:"#aaa",
                  borderBottom:activeTab===t.key?`3px solid ${RED}`:"3px solid transparent",
                  transition:"all 0.2s"}}>
                {t.label}
              </button>
            ))}
          </div>
        }>
        {T[lang].boards}
      </HeaderShell>
      {/* Password modal */}
      {joinPrompt&&(
        <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"flex-end",background:"rgba(0,0,0,0.5)"}}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",width:"100%"}}>
            <div style={{width:36,height:4,borderRadius:2,background:"#e0e0e0",margin:"0 auto 20px"}}/>
            <h3 style={{fontSize:17,fontWeight:800,color:DARK,margin:"0 0 4px",textAlign:"center"}}>{joinPrompt.name}</h3>
            <p style={{fontSize:12,color:"#aaa",textAlign:"center",margin:"0 0 20px",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <LockIcon size={13} color="#9CA3AF" strokeWidth={2.1}/>
              <span>{T[lang].passwordProtected}</span>
            </p>
            <InputPanel style={{marginBottom:8}}>
              <span style={{fontSize:16}}>🔑</span>
              <input value={joinPass} onChange={e=>{setJoinPass(e.target.value);setJoinError("");}}
                placeholder={T[lang].enterPassword} type="password"
                style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:14,color:DARK}}/>
            </InputPanel>
            {joinError&&<p style={{fontSize:11,color:RED,margin:"0 0 12px 4px"}}>{joinError}</p>}
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <Button variant="ghost" onClick={()=>setJoinPrompt(null)}
                style={{flex:1,padding:"13px 0",borderRadius:12,background:"#fff",color:"#888",fontSize:14}}>
                {T[lang].cancel}
              </Button>
              <Button onClick={()=>{
                doJoin(joinPrompt, joinPass).then(joined => {
                  if(joined) setJoinPrompt(null);
                });
              }}
                style={{flex:2,padding:"13px 0",borderRadius:12,fontSize:14}}>
                {T[lang].joinBtn} 🏆
              </Button>
            </div>
          </div>
        </div>
      )}
      {leaveConfirmBoard && (
        <ConfirmSheet
          icon="⚠️"
          title={T[lang].leaveLeagueTitle}
          body={<>{T[lang].leaveLeagueBody1} <strong style={{color:DARK}}>{leaveConfirmBoard.name}</strong>.</>}
          confirmLabel={T[lang].leaveLeagueConfirm}
          onCancel={()=>setLeaveConfirmBoard(null)}
          onConfirm={async()=>{
              if(onRemoveMember) await onRemoveMember(leaveConfirmBoard.id, user?.id);
              setLeaveConfirmBoard(null);
          }}
        />
      )}
      {deleteConfirmBoard && (
        <ConfirmSheet
          icon={<TrashIcon size={27} color={RED} strokeWidth={2}/>}
          title={T[lang].deleteLeagueTitle}
          body={<>{T[lang].deleteLeagueBody1} <strong style={{color:DARK}}>{deleteConfirmBoard.name}</strong> {T[lang].deleteLeagueBody2}</>}
          confirmLabel={T[lang].deleteLeagueConfirm}
          onCancel={()=>setDeleteConfirmBoard(null)}
          onConfirm={async()=>{
              if(onDeleteBoard) await onDeleteBoard(deleteConfirmBoard.id);
              setDeleteConfirmBoard(null);
          }}
        />
      )}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"16px 20px 100px",position:"relative",zIndex:1}}>

        {/* Tab: My Boards */}
        {activeTab==="my"&&(()=>{
          if(myBoards.length===0) return <EmptyState icon="🏆" title={boardCopy.joinedEmptyTitle} body={boardCopy.joinedEmptyBody} />;
          return (
            <Card>
              {myBoards.map((b,bi,arr)=>{
                const latest=availBoards.find(c=>c.id===b.id)||createdBoards.find(c=>c.id===b.id)||b;
                return (
                  <div key={b.id}>
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",cursor:"pointer"}} onClick={()=>onJoin&&onJoin(b.id)}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:b.isGlobal?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:`linear-gradient(135deg,#5856D6,#3634A3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,overflow:"hidden"}}>
                        {latest.image_url ? <img src={latest.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : latest.label}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{latest.name}</p>
                        <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0"}}>👥 {latest.members}{latest.max?"/"+latest.max:""} members</p>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,color:b.isAdmin&&!b.isMember?"#F59E0B":NAVY,flexShrink:0}}>{b.isAdmin&&!b.isMember?"👑 Admin":`✓ ${T[lang].joinedStatus}`}</span>
                      {!b.isGlobal&&b.isMember&&<Button variant="danger" onClick={e=>{e.stopPropagation();setLeaveConfirmBoard(b);}} style={{fontSize:13,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,padding:0}}><TrashIcon size={15}/></Button>}
                    </div>
                    {bi<arr.length-1&&<div style={{height:1,background:"rgba(0,0,0,0.05)",margin:"0 14px"}}/>}
                  </div>
                );
              })}
            </Card>
          );
        })()}

        {/* Tab: Available Boards */}
        {activeTab==="available"&&(()=>{
          const _seenAvail=new Set();
          const allAvail=[...availBoards,...createdBoards].filter(b=>!isJoined(b.id)&&!_seenAvail.has(b.id)&&_seenAvail.add(b.id));
          const isCode=/^[A-Z][0-9]{5}$/.test(boardSearch.trim().toUpperCase());
          const filtered=boardSearch.trim()&&!isCode
            ? allAvail.filter(b=>b.name.toLowerCase().includes(boardSearch.toLowerCase()))
            : !boardSearch.trim() ? allAvail.slice(0,8) : [];
          const hasMore=!boardSearch.trim()&&allAvail.length>8;
          return (<>
            <Card style={{marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px 8px"}}>
                <span style={{fontSize:11,color:"#bbb"}}>{allAvail.length} {T[lang].boardsCount}</span>
                <Button onClick={()=>{ setEditBoard(null); setCName(""); setCPassword(""); setCEmoji(""); setCImageFile(null); setCImagePreview(null); setCRemoveImage(false); setCMaxPlayers(10); setCSlots(3); setCPrizes(["","",""]); changeView("create"); }}
                  style={{padding:"6px 11px",fontSize:11}}>
                  + {T[lang].createBoard}
                </Button>
              </div>
              <div style={{padding:"0 14px 10px"}}>
                <InputPanel style={{border:isCode?`1.5px solid ${NAVY}`:"1px solid rgba(10,46,138,0.06)"}}>
                  <span style={{fontSize:14,opacity:0.45,color:NAVY,display:"flex",alignItems:"center"}}>{isCode?"🔑":<SearchIcon size={15}/>}</span>
                  <input value={boardSearch} onChange={e=>{setBoardSearch(e.target.value);setCodeError("");}} placeholder={boardCopy.searchPlaceholder} style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:14,color:DARK}}/>
                  {boardSearch&&(isCode?(
                    <Button onClick={()=>{ const found=[...availBoards,...createdBoards].find(b=>b.code===boardSearch.trim().toUpperCase()||b.id===boardSearch.trim()); if(found){joinBoard(found);setBoardSearch("");setCodeError("");}else setCodeError("Code not found."); }}>Join</Button>
                  ):(<button onClick={()=>setBoardSearch("")} style={{background:"transparent",border:"none",padding:4,color:"#9CA3AF",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon size={14}/></button>))}
                </InputPanel>
                {isCode&&<p style={{fontSize:11,color:NAVY,margin:"6px 0 0",fontWeight:600}}>{T[lang].inviteCodeDetected}</p>}
                {codeError&&<p style={{fontSize:11,color:RED,margin:"6px 0 0"}}>{codeError}</p>}
              </div>
              <div style={{height:1,background:"rgba(0,0,0,0.06)"}}/>
              {allAvail.length===0
                ? <div style={{padding:14}}><EmptyState icon="🏆" title={boardCopy.availableEmptyTitle} body={boardCopy.availableEmptyBody} /></div>
                : filtered.length===0&&boardSearch.trim()
                  ? <div style={{padding:14}}><EmptyState icon={<SearchIcon size={27} color="#9CA3AF" strokeWidth={1.9}/>} title={`${T[lang].noBoardsFoundFor} "${boardSearch}"`} body={T[lang].tryAnotherName} /></div>
                  : filtered.map((b,bi)=>(
                    <div key={b.id}>
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px"}}>
                        <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,overflow:"hidden"}}>
                          {b.image_url?<img src={b.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:b.label}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{b.name}</p>
                          <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0",display:"flex",alignItems:"center",gap:4}}>
                            <span>👥 {b.members}{b.max?"/"+b.max:""}</span>
                            {b.has_password&&<><span>·</span><LockIcon size={11} color="#9CA3AF" strokeWidth={2.1}/></>}
                          </p>
                        </div>
                        <Button onClick={()=>joinBoard(b)}>{T[lang].joinBtn}</Button>
                      </div>
                      {bi<filtered.length-1&&<div style={{height:1,background:"rgba(0,0,0,0.05)",margin:"0 14px"}}/>}
                    </div>
                  ))
              }
            </Card>
            {hasMore&&<p style={{fontSize:12,color:"#bbb",textAlign:"center",marginTop:-4,marginBottom:12,fontStyle:"italic"}}>+{allAvail.length-8} more · use search</p>}
          </>);
        })()}

        {/* Tab: Admin */}
        {activeTab==="admin"&&(()=>{
          if(createdBoards.length===0) return <EmptyState icon="🛠️" title={boardCopy.adminEmptyTitle} body={boardCopy.adminEmptyBody} />;
          return (
            <Card>
              {createdBoards.map((b,bi)=>(
                <div key={b.id}>
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px"}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#007A36)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,overflow:"hidden"}}>
                      {b.image_url?<img src={b.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:b.label}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{b.name}</p>
                      <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0"}}>👥 {b.members}{b.max?"/"+b.max:""} · 🔑 {b.code}</p>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <Button variant="ghost" onClick={()=>openMembers(b.id)}>👥</Button>
                      <Button variant="ghost" onClick={()=>{ setEditBoard(b); setCName(b.name); setCPassword(""); setCEmoji(b.image_url ? "" : (b.label || "")); setCImageFile(null); setCImagePreview(b.image_url || null); setCRemoveImage(false); setShowEmojiPicker(false); setCMaxPlayers(b.max||10); setCSlots(b.prizes?.length||3); setCPrizes(b.prizes?.length?[...b.prizes,...Array(5).fill("")]:["",...Array(4).fill("")]); changeView("create"); }}>✏️</Button>
                      <Button variant="danger" onClick={()=>setDeleteConfirmBoard(b)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,padding:0}}><TrashIcon size={15}/></Button>
                    </div>
                  </div>
                  {viewMembersBoard===b.id&&(
                    <div style={{margin:"0 14px 10px",borderTop:"1px solid rgba(10,46,138,0.06)",paddingTop:8}}>
                      {!(boardMembersMap[b.id]?.length>0)?(<EmptyState icon="👥" title="No members yet" body="Share the invite code to bring people in." />)
                      :(boardMembersMap[b.id]||[]).map((m,mi)=>{
                        const isMe=m.id===user?.id;
                        const leaders=boardLeadersMap[b.id]||leaderboardData[b.id]||[];
                        const lEntry=leaders.find(l=>l.name===m.name);
                        const rankMedals=["🥇","🥈","🥉"];
                        const rankLabel=lEntry?(rankMedals[lEntry.rank-1]||`#${lEntry.rank}`):null;
                        return (
                          <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:mi<(boardMembersMap[b.id].length-1)?"1px solid rgba(10,46,138,0.05)":"none"}}>
                            <span style={{flex:1,fontSize:12,fontWeight:600,color:isMe?NAVY:DARK}}>{m.name}{isMe?" (You)":""}</span>
                            <span style={{fontSize:11,color:NAVY,fontWeight:700}}>{rankLabel&&<>{rankLabel} </>}{lEntry?.pts??0}pt</span>
                            <Button variant="danger" onClick={async()=>{ if(onRemoveMember) await onRemoveMember(b.id,m.id); setBoardMembersMap(prev=>({...prev,[b.id]:prev[b.id].filter(x=>x.id!==m.id)})); }}>{T[lang].remove}</Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {bi<createdBoards.length-1&&<div style={{height:1,background:"rgba(0,0,0,0.05)",margin:"0 14px"}}/>}
                </div>
              ))}
            </Card>
          );
        })()}
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
const _footerIcons = {
  [SCREENS.HOME]: (c,a) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={a?"2":"1.6"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V10.5z" fill={a?c+"22":"none"}/>
    </svg>
  ),
  [SCREENS.RULES]: (c,a) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={a?"2":"1.6"} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" fill={a?c+"22":"none"}/>
      <line x1="9" y1="8" x2="15" y2="8"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  [SCREENS.LEADERBOARD]: (c,a) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="12" width="5" height="9" rx="1.5" stroke={c} strokeWidth={a?"2":"1.6"} fill={a?c+"22":"none"}/>
      <rect x="9.5" y="7" width="5" height="14" rx="1.5" stroke={c} strokeWidth={a?"2":"1.6"} fill={a?c+"22":"none"}/>
      <rect x="17" y="3" width="5" height="18" rx="1.5" stroke={c} strokeWidth={a?"2":"1.6"} fill={a?c+"22":"none"}/>
    </svg>
  ),
  [SCREENS.ACCOUNT]: (c,a) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={a?"2":"1.6"} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="8.5" x2="19" y2="8.5"/>
      <polyline points="14.5,4.5 19,8.5 14.5,12.5"/>
      <line x1="19" y1="15.5" x2="5" y2="15.5"/>
      <polyline points="9.5,11.5 5,15.5 9.5,19.5"/>
    </svg>
  ),
  [SCREENS.BOARDS]: (c,a) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="9" height="9" rx="2.5" stroke={c} strokeWidth={a?"2":"1.6"} fill={a?c+"22":"none"}/>
      <rect x="13" y="2" width="9" height="9" rx="2.5" stroke={c} strokeWidth={a?"2":"1.6"} fill={a?c+"22":"none"}/>
      <rect x="2" y="13" width="9" height="9" rx="2.5" stroke={c} strokeWidth={a?"2":"1.6"} fill={a?c+"22":"none"}/>
      <rect x="13" y="13" width="9" height="9" rx="2.5" stroke={c} strokeWidth={a?"2":"1.6"} fill={a?c+"22":"none"}/>
    </svg>
  ),
};
function Footer({ active, onNavigate, lang, user }) {
  const tabs = [
    {key:SCREENS.HOME,        label:T[lang].footerHome},
    {key:SCREENS.LEADERBOARD, label:T[lang].footerRanking},
    {key:SCREENS.RULES,       label:T[lang].footerRules},
    {key:SCREENS.BOARDS,      label:T[lang].boards},
    {key:SCREENS.ACCOUNT,     label:T[lang].footerMore},
  ];
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "—";
  const initials = displayName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"0 14px",paddingBottom:"env(safe-area-inset-bottom, 10px)",zIndex:1000}}>
      <div style={{
        background:"#F0F4FF",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        borderRadius:16,
        boxShadow:"0 -2px 0 rgba(10,46,138,0.08), 0 4px 24px rgba(10,46,138,0.14)",
        border:"1.5px solid rgba(10,46,138,0.10)",
        display:"flex",
        alignItems:"stretch",
        height:62,
        margin:"10px 0 0",
        overflow:"hidden",
      }}>
        {tabs.map(tab=>{
          const isActive=active===tab.key;
          const iconColor = isActive ? NAVY : "#6B7280";
          const isAccount = tab.key === SCREENS.ACCOUNT;
          return (
            <button key={tab.key} onClick={()=>onNavigate(tab.key)}
              style={{flex:1,background:"transparent",border:"none",cursor:"pointer",WebkitTapHighlightColor:"transparent",
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,padding:0,position:"relative",
                opacity:isActive?1:0.6,transition:"opacity 0.18s"}}>
              <div style={{
                width:40,height:36,borderRadius:11,
                background:isActive?`rgba(10,46,138,0.08)`:"transparent",
                boxShadow:isActive?`0 2px 10px rgba(10,46,138,0.10)`:"none",
                display:"flex",alignItems:"center",justifyContent:"center",
                animation:isActive?"tabPop 0.3s cubic-bezier(0.175,0.885,0.32,1.275) forwards":"none",
                transition:"background 0.2s, box-shadow 0.2s",
              }}>
                {isAccount
                  ? <svg width="22" height="6" viewBox="0 0 22 6" fill="none">
                      <circle cx="3" cy="3" r="2.5" fill={iconColor}/>
                      <circle cx="11" cy="3" r="2.5" fill={iconColor}/>
                      <circle cx="19" cy="3" r="2.5" fill={iconColor}/>
                    </svg>
                  : _footerIcons[tab.key]?.(iconColor, isActive)
                }
              </div>
              <span style={{fontSize:10,fontWeight:isActive?700:500,color:isActive?NAVY:"#6B7280",transition:"all 0.18s",letterSpacing:0.2}}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LangSelector({ lang, setLang }) {
  const [open,setOpen]=useState(false);
  const [pos,setPos]=useState({top:0,right:0});
  const btnRef=useRef(null);
  const cur=LANGS.find(l=>l.code===lang);
  const handleOpen=()=>{
    if(btnRef.current){
      const r=btnRef.current.getBoundingClientRect();
      setPos({top:r.bottom+8,right:window.innerWidth-r.right});
    }
    setOpen(o=>!o);
  };
  return (
    <div style={{position:"relative",zIndex:100}}>
      <div ref={btnRef} onClick={handleOpen} style={{width:44,height:44,borderRadius:12,background:"#F0F4FF",border:"1px solid rgba(0,32,91,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer"}}>{cur.flag}</div>
      {open&&(
        <>
          <div style={{position:"fixed",inset:0,zIndex:1999}} onClick={()=>setOpen(false)}/>
          <div style={{position:"fixed",top:pos.top,right:pos.right,background:"#fff",border:"1px solid rgba(0,32,91,0.1)",borderRadius:14,overflow:"hidden",minWidth:160,zIndex:2000,boxShadow:"0 12px 40px rgba(0,32,91,0.15)"}}>
            {LANGS.map(l=>(
              <div key={l.code} onClick={()=>{setLang(l.code);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:lang===l.code?"#F0F4FF":"transparent",cursor:"pointer",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                <span style={{fontSize:20}}>{l.flag}</span>
                <span style={{fontSize:14,fontWeight:lang===l.code?700:400,color:lang===l.code?NAVY:"#555"}}>{l.name}</span>
                {lang===l.code&&<span style={{marginLeft:"auto",fontSize:12,color:RED}}>✓</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const ADMIN_EMAIL = "admin@wcp2026.com";

function SeedPlayersButton() {
  const [state, setState] = useState('idle'); // idle | loading | ok | error
  const [msg, setMsg] = useState('');
  const run = async () => {
    setState('loading');
    const res = await seedPlayersFromApi();
    if (res?.error) { setState('error'); setMsg(res.error); }
    else if (res?.warning) { setState('error'); setMsg(res.warning); }
    else { setState('ok'); setMsg(`✓ ${res.players} players from ${res.teams} teams saved`); }
  };
  return (
    <div>
      <button onClick={run} disabled={state==='loading'} style={{
        width:"100%",padding:"9px",borderRadius:9,border:"none",
        background:state==='ok'?GREEN:state==='error'?"#fee2e2":state==='loading'?"rgba(0,0,0,0.08)":"#0A2E8A",
        color:state==='error'?RED:state==='loading'?"rgba(0,0,0,0.3)":"#fff",
        fontSize:12,fontWeight:800,cursor:state==='loading'?"default":"pointer",
      }}>
        {state==='loading'?"Fetching from football-data.org…":"🔄 Seed Players from API"}
      </button>
      {msg&&<div style={{fontSize:11,marginTop:5,color:state==='ok'?GREEN:RED,fontWeight:600}}>{msg}</div>}
    </div>
  );
}


function AdminBugPanel({ user, allInstantPickStates, allInstantPickDone, exactScoresByBoard, myBoards, bugLog, simDay, simHour, simMin }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("errors");
  const [dbHealth, setDbHealth] = useState(null);
  const [dbChecking, setDbChecking] = useState(false);

  const runDbCheck = async () => {
    setDbChecking(true);
    const result = await checkDbHealth();
    setDbHealth(result);
    setDbChecking(false);
  };

  if (user?.email !== ADMIN_EMAIL) return null;

  const GROUPS = INTERACTIVE_GROUPS;
  const KO_ROUNDS = { R32:16, R16:8, QF:4, SF:2, F:1 };
  const WEEKS = [
    { label:"W1 Jun 8-14",  start:8 },
    { label:"W2 Jun 15-21", start:15 },
    { label:"W3 Jun 22-28", start:22 },
    { label:"W4 Jun 29+",   start:29 },
  ];

  const analyzeBoard = (boardId) => {
    const state = allInstantPickStates[boardId] || {};
    const done = allInstantPickDone[boardId] || false;
    const scores = exactScoresByBoard[boardId] || {};
    const issues = [];
    const info = [];

    // ── Predictions analysis ──
    const { groupRankings={}, best3=[], koPicks={} } = state;
    const groupsDone = GROUPS.filter(g => {
      const r = groupRankings[g];
      return r && r.length === 4 && r.every(Boolean);
    });
    info.push(`Groups: ${groupsDone.length}/${GROUPS.length} ranked`);

    GROUPS.forEach(g => {
      const r = groupRankings[g] || [];
      if (r.some(t => !t || t === "TBD")) issues.push(`[Predictions] Group ${g}: contains TBD/null team`);
      const seen = new Set();
      r.filter(Boolean).forEach(t => {
        if (seen.has(t)) issues.push(`[Predictions] Group ${g}: duplicate team "${t}"`);
        seen.add(t);
      });
    });

    info.push(`Best 3rd: ${best3.length}/8 selected`);
    const b3Set = new Set();
    best3.forEach(t => {
      if (b3Set.has(t)) issues.push(`[Predictions] Best 3rd: duplicate team "${t}"`);
      b3Set.add(t);
    });

    const koTotal = Object.keys(koPicks).length;
    const expectedTotal = Object.values(KO_ROUNDS).reduce((a,b)=>a+b,0);
    info.push(`KO picks: ${koTotal}/${expectedTotal}`);
    Object.entries(KO_ROUNDS).forEach(([round, count]) => {
      const n = Object.keys(koPicks).filter(k=>k.startsWith(round+"-")).length;
      if (done && n < count) issues.push(`[Predictions] ${round}: ${n}/${count} picks missing`);
      const hasTBD = Array.from({length:n},(_,i)=>koPicks[`${round}-${i}`]).some(v=>!v);
      if (hasTBD) issues.push(`[Predictions] ${round}: null/TBD picks found`);
    });

    // ── Exact Scores analysis ──
    const matchMap = {};
    CALENDAR_EVENTS.forEach(e => { matchMap[e.day] = e.matches; });

    WEEKS.forEach(({ label, start }) => {
      const days = Array.from({length:7},(_,i)=>start+i).filter(d=>d>=1&&d<=50);
      let total = 0, scored = 0;
      days.forEach(d => {
        const ms = matchMap[d] || [];
        ms.forEach((_, idx) => {
          total++;
          const key = `${d}-${idx}`;
          const s = scores[key];
          if (s && s.home !== null && s.away !== null) scored++;
        });
      });
      info.push(`${label}: ${scored}/${total} scores entered`);
      if (total > 0 && scored < total) {
        issues.push(`[Exact Scores] ${label}: ${total-scored} score(s) missing`);
      }
    });

    return { done, issues, info };
  };

  const boards = myBoards || [];
  const allAnalysis = boards.map(b => ({ board:b, ...analyzeBoard(b.id) }));
  const totalIssues = allAnalysis.reduce((s, a) => s+a.issues.length, 0) + bugLog.length;

  const tabStyle = (t) => ({
    flex:1, padding:"8px 0", border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
    background: tab===t ? NAVY : "transparent",
    color: tab===t ? "#fff" : "rgba(0,0,0,0.5)",
    borderBottom: tab===t ? "none" : "2px solid rgba(0,0,0,0.07)",
    transition:"all 0.15s",
  });

  return (
    <>
      {/* Floating button */}
      <button onClick={()=>setOpen(true)} style={{
        position:"fixed", bottom:80, left:16, zIndex:9999,
        width:44, height:44, borderRadius:12,
        background: totalIssues>0 ? "#c0392b" : "#1a1a2e",
        border:"1px solid rgba(255,255,255,0.25)",
        color:"#fff", fontSize:10, fontWeight:900, cursor:"pointer",
        boxShadow:"0 4px 14px rgba(0,0,0,0.5)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1,
      }}>
        <span style={{fontSize:14}}>🐛</span>
        {totalIssues>0 && <span style={{fontSize:9}}>{totalIssues}</span>}
      </button>

      {/* Panel overlay */}
      {open && (
        <div style={{position:"fixed",inset:0,zIndex:10000,display:"flex",background:"rgba(0,0,0,0.5)"}}
          onClick={()=>setOpen(false)}>
          <div style={{marginLeft:"auto",width:"92%",maxWidth:420,background:"#f8f8f8",height:"100%",
            display:"flex",flexDirection:"column",overflowY:"hidden"}}
            onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{background:NAVY,padding:"14px 16px 0",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div>
                  <div style={{fontSize:10,color:RED,fontWeight:800,letterSpacing:1.5}}>ADMIN ONLY</div>
                  <div style={{fontSize:17,fontWeight:900,color:"#fff"}}>Bug Analysis</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {simDay && <span style={{fontSize:10,color:"rgba(255,255,255,0.6)",fontWeight:700}}>SIM Jun {simDay} {String(simHour).padStart(2,"0")}:{String(simMin).padStart(2,"0")}</span>}
                  <button onClick={()=>setOpen(false)} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,width:30,height:30,color:"#fff",fontSize:16,cursor:"pointer"}}>✕</button>
                </div>
              </div>
              {/* Tabs */}
              <div style={{display:"flex",gap:0}}>
                {[["errors","Errors","🔴"],["predictions","Predictions","⚽"],["scores","Exact Scores","🎯"],["db","DB Health","🗄️"]].map(([id,label,icon])=>(
                  <button key={id} onClick={()=>setTab(id)} style={tabStyle(id)}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>

              {/* ── ERRORS TAB ── */}
              {tab==="errors" && (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {bugLog.length===0 ? (
                    <div style={{textAlign:"center",padding:"40px 20px",color:"rgba(0,0,0,0.3)",fontSize:13,fontWeight:600}}>
                      ✓ No runtime errors caught
                    </div>
                  ) : [...bugLog].reverse().map((e,i)=>(
                    <div key={i} style={{background:"#fff",borderRadius:12,padding:"10px 12px",border:"1.5px solid #fee2e2",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:11,fontWeight:800,color:RED}}>Runtime Error</span>
                        <span style={{fontSize:10,color:"rgba(0,0,0,0.35)"}}>{e.time}</span>
                      </div>
                      <div style={{fontSize:12,color:"#111",fontWeight:600,marginBottom:4,wordBreak:"break-word"}}>{e.message}</div>
                      {e.source && <div style={{fontSize:10,color:"rgba(0,0,0,0.4)",wordBreak:"break-all"}}>{e.source}:{e.line}</div>}
                      {e.stack && <pre style={{fontSize:9,color:"rgba(0,0,0,0.4)",margin:"4px 0 0",whiteSpace:"pre-wrap",wordBreak:"break-all",maxHeight:80,overflow:"auto"}}>{e.stack}</pre>}
                    </div>
                  ))}
                </div>
              )}

              {/* ── PREDICTIONS TAB ── */}
              {tab==="predictions" && (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {allAnalysis.map(({board,done,issues,info})=>(
                    <div key={board.id} style={{background:"#fff",borderRadius:12,padding:"12px",border:`1.5px solid ${issues.filter(s=>s.includes("[Predictions]")).length>0?"#fee2e2":"rgba(0,0,0,0.08)"}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{fontSize:13,fontWeight:800,color:NAVY}}>{board.label} {board.name}</span>
                        <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:done?"#dcfce7":"#fef9c3",color:done?"#166534":"#92400e"}}>{done?"Done":"In Progress"}</span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>
                        {info.filter(s=>!s.includes("Exact")).map((s,i)=>(
                          <div key={i} style={{fontSize:11,color:"rgba(0,0,0,0.55)",display:"flex",gap:6}}>
                            <span style={{color:GREEN,flexShrink:0}}>ℹ</span>{s}
                          </div>
                        ))}
                        {issues.filter(s=>s.includes("[Predictions]")).map((s,i)=>(
                          <div key={i} style={{fontSize:11,color:RED,display:"flex",gap:6,fontWeight:700}}>
                            <span style={{flexShrink:0}}>⚠</span>{s.replace("[Predictions] ","")}
                          </div>
                        ))}
                        {issues.filter(s=>s.includes("[Predictions]")).length===0&&<div style={{fontSize:11,color:GREEN,fontWeight:700}}>✓ No prediction issues</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── DB HEALTH TAB ── */}
              {tab==="db" && (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {/* User identity */}
                  <div style={{background:"#fff",borderRadius:12,padding:"12px",border:"1.5px solid rgba(0,0,0,0.08)"}}>
                    <div style={{fontSize:11,fontWeight:800,color:NAVY,marginBottom:8}}>User Identity</div>
                    <div style={{fontSize:11,color:"rgba(0,0,0,0.55)",wordBreak:"break-all",marginBottom:4}}>
                      <span style={{fontWeight:700}}>Email:</span> {user?.email}
                    </div>
                    <div style={{fontSize:11,color:"rgba(0,0,0,0.55)",wordBreak:"break-all",marginBottom:4}}>
                      <span style={{fontWeight:700}}>user_id:</span> {user?.id}
                    </div>
                    <div style={{fontSize:11,color:"rgba(0,0,0,0.55)",marginBottom:4}}>
                      <span style={{fontWeight:700}}>Auth method:</span> {user?.app_metadata?.provider || "—"}
                    </div>
                    <div style={{fontSize:11,color:"rgba(0,0,0,0.55)"}}>
                      <span style={{fontWeight:700}}>has_password:</span> {String(user?.user_metadata?.has_password ?? false)}
                    </div>
                  </div>

                  {/* DB check */}
                  <button onClick={runDbCheck} disabled={dbChecking} style={{
                    width:"100%",padding:"12px",borderRadius:12,border:"none",
                    background:dbChecking?"rgba(0,0,0,0.08)":NAVY,
                    color:dbChecking?"rgba(0,0,0,0.3)":"#fff",
                    fontSize:13,fontWeight:800,cursor:dbChecking?"default":"pointer",
                  }}>
                    {dbChecking?"Checking...":"Run DB Health Check"}
                  </button>

                  {dbHealth && (
                    <>
                      {/* Matches table */}
                      <div style={{background:"#fff",borderRadius:12,padding:"12px",border:`1.5px solid ${dbHealth.matchesTable?.ok?"rgba(0,0,0,0.08)":"#fee2e2"}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                          <span style={{fontSize:12,fontWeight:800,color:NAVY}}>matches table</span>
                          <span style={{fontSize:11,fontWeight:700,color:dbHealth.matchesTable?.ok?GREEN:RED}}>{dbHealth.matchesTable?.ok?"✓ Accessible":"✗ Error"}</span>
                        </div>
                        {dbHealth.matchesTable?.ok ? (
                          <>
                            <div style={{fontSize:11,color:"rgba(0,0,0,0.55)",marginBottom:4}}>
                              Total rows: <strong>{dbHealth.matchesTotal}</strong>
                              {dbHealth.matchesTotal===0&&<span style={{color:RED,fontWeight:700}}> ← PROBLEM: table is empty, saves will fail</span>}
                            </div>
                            {dbHealth.matchesTable.sample?.length>0&&(
                              <div style={{fontSize:10,color:"rgba(0,0,0,0.4)"}}>
                                Sample keys: {dbHealth.matchesTable.sample.join(", ")}
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{fontSize:11,color:RED,fontWeight:700}}>{dbHealth.matchesTable?.error}</div>
                        )}
                      </div>

                      {/* exact_scores table */}
                      <div style={{background:"#fff",borderRadius:12,padding:"12px",border:`1.5px solid ${dbHealth.exactScoresTable?.ok?"rgba(0,0,0,0.08)":"#fee2e2"}`}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontSize:12,fontWeight:800,color:NAVY}}>exact_scores table</span>
                          <span style={{fontSize:11,fontWeight:700,color:dbHealth.exactScoresTable?.ok?GREEN:RED}}>{dbHealth.exactScoresTable?.ok?"✓ Accessible":"✗ Error"}</span>
                        </div>
                        {!dbHealth.exactScoresTable?.ok&&<div style={{fontSize:11,color:RED,fontWeight:700,marginTop:4}}>{dbHealth.exactScoresTable?.error}</div>}
                      </div>

                      {/* world cup football players table */}
                      <div style={{background:"#fff",borderRadius:12,padding:"12px",border:`1.5px solid ${dbHealth.playersTable?.ok?"rgba(0,0,0,0.08)":"#fee2e2"}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                          <span style={{fontSize:12,fontWeight:800,color:NAVY}}>world_cup_football_players table</span>
                          <span style={{fontSize:11,fontWeight:700,color:dbHealth.playersTable?.ok?GREEN:RED}}>{dbHealth.playersTable?.ok?"✓ Accessible":"✗ Error"}</span>
                        </div>
                        {dbHealth.playersTable?.ok && (
                          <div style={{fontSize:11,color:"rgba(0,0,0,0.55)",marginBottom:8}}>
                            Players in DB: <strong>{dbHealth.playersTotal||0}</strong>
                            {(dbHealth.playersTotal||0)===0&&<span style={{color:"#F59E0B",fontWeight:700}}> ← Click "Seed Players" to import</span>}
                          </div>
                        )}
                        {!dbHealth.playersTable?.ok&&<div style={{fontSize:11,color:RED,fontWeight:700,marginBottom:8}}>{dbHealth.playersTable?.error}</div>}
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          <SeedPlayersButton />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── EXACT SCORES TAB ── */}
              {tab==="scores" && (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {allAnalysis.map(({board,issues,info})=>(
                    <div key={board.id} style={{background:"#fff",borderRadius:12,padding:"12px",border:`1.5px solid ${issues.filter(s=>s.includes("[Exact")).length>0?"#fee2e2":"rgba(0,0,0,0.08)"}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                      <div style={{fontSize:13,fontWeight:800,color:NAVY,marginBottom:8}}>{board.label} {board.name}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>
                        {info.filter(s=>s.startsWith("W")).map((s,i)=>{
                          const isIssue = issues.some(iss=>iss.includes(s.split(":")[0]));
                          return (
                            <div key={i} style={{fontSize:11,color:isIssue?RED:"rgba(0,0,0,0.55)",display:"flex",gap:6,fontWeight:isIssue?700:400}}>
                              <span style={{flexShrink:0}}>{isIssue?"⚠":"✓"}</span>{s}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{padding:"10px 14px",borderTop:"1px solid rgba(0,0,0,0.07)",background:"#fff",flexShrink:0}}>
              <div style={{fontSize:10,color:"rgba(0,0,0,0.35)",textAlign:"center"}}>
                Logged in as {user?.email} · {totalIssues} issue{totalIssues!==1?"s":""} found
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DevPanel({ onStart, onAutoPick }) {
  const [simDay, setSimDay] = useState(11);
  const [simHour, setSimHour] = useState(12);
  const [simMin, setSimMin] = useState(0);

  const tournamentStart = new Date(2026,5,11,19,0,0);
  const simDate = new Date(2026,5,simDay,simHour,simMin,0);
  const simStarted = simDate >= tournamentStart;

  // Countdown to tournament
  const diffMs = tournamentStart - simDate;
  const dLeft = Math.max(0,Math.floor(diffMs/(1000*60*60*24)));
  const hLeft = Math.max(0,Math.floor((diffMs%(1000*60*60*24))/(1000*60*60)));

  const presets = [
    {label:"9 Iun 12:00", day:9, hour:12, min:0},
    {label:"10 Iun 20:00", day:10, hour:20, min:0},
    {label:"Jun 11 18:00 (before)", day:11, hour:18, min:0},
    {label:"11 Iun 20:00 (start!)", day:11, hour:20, min:0},
    {label:"14 Iun 10:00", day:14, hour:10, min:0},
    {label:"14 Iun 19:30 (live!)", day:14, hour:19, min:30},
  ];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#1a1a2e",overflow:"auto"}}>
      <div style={{padding:"40px 24px 24px",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🛠️</div>
        <h2 style={{fontSize:22,fontWeight:900,color:"#fff",margin:"0 0 4px"}}>Dev Mode</h2>
        <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",margin:0}}>Simulate current date and time</p>
      </div>

      {/* Date/time pickers */}
      <div style={{padding:"0 24px",marginBottom:20}}>
        <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>Data și ora simulată</p>
        <div style={{background:"rgba(255,255,255,0.06)",borderRadius:16,padding:"16px"}}>
          {/* Date: June day */}
          <div style={{marginBottom:14}}>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.5)",margin:"0 0 8px"}}>Ziua din June 2026</p>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setSimDay(d=>Math.max(1,d-1))}
                style={{width:36,height:36,borderRadius:10,border:"none",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:18,cursor:"pointer"}}>−</button>
              <span style={{flex:1,textAlign:"center",fontSize:24,fontWeight:900,color:"#fff"}}>{simDay} June</span>
              <button onClick={()=>setSimDay(d=>Math.min(30,d+1))}
                style={{width:36,height:36,borderRadius:10,border:"none",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:18,cursor:"pointer"}}>+</button>
            </div>
          </div>
          {/* Time */}
          <div>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.5)",margin:"0 0 8px"}}>Ora</p>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                <button onClick={()=>setSimHour(h=>Math.max(0,h-1))}
                  style={{width:32,height:32,borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:16,cursor:"pointer"}}>−</button>
                <span style={{flex:1,textAlign:"center",fontSize:22,fontWeight:900,color:"#fff"}}>{String(simHour).padStart(2,"0")}</span>
                <button onClick={()=>setSimHour(h=>Math.min(23,h+1))}
                  style={{width:32,height:32,borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:16,cursor:"pointer"}}>+</button>
              </div>
              <span style={{fontSize:20,color:"rgba(255,255,255,0.4)",fontWeight:700}}>:</span>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                <button onClick={()=>setSimMin(m=>m<=0?55:m-5)}
                  style={{width:32,height:32,borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:16,cursor:"pointer"}}>−</button>
                <span style={{flex:1,textAlign:"center",fontSize:22,fontWeight:900,color:"#fff"}}>{String(simMin).padStart(2,"0")}</span>
                <button onClick={()=>setSimMin(m=>m>=55?0:m+5)}
                  style={{width:32,height:32,borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:16,cursor:"pointer"}}>+</button>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Status */}
      <div style={{margin:"0 24px 24px",background:simStarted?"rgba(0,154,68,0.15)":"rgba(200,16,46,0.15)",borderRadius:14,padding:"12px 16px",border:`1px solid ${simStarted?"rgba(0,154,68,0.3)":"rgba(200,16,46,0.3)"}`}}>
        <p style={{fontSize:12,fontWeight:700,color:simStarted?"#00C853":"#FF6B6B",margin:"0 0 4px"}}>
          {simStarted?"✅ Tournament started":"⏳ Before tournament"}
        </p>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.4)",margin:0}}>
          {simStarted
            ? `${simDay} June ${String(simHour).padStart(2,"0")}:${String(simMin).padStart(2,"0")} · Active matches`
            : `Time left ${dLeft}z ${hLeft}h until start`}
        </p>
      </div>

      <div style={{padding:"0 24px 40px",display:"flex",flexDirection:"column",gap:12}}>
        <button onClick={()=>{
          const rnd=()=>Math.random()<0.5?"home":"away";
          const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
          const GROUPS=INTERACTIVE_GROUPS;
          const groupRankings={};
          GROUPS.forEach(g=>{groupRankings[g]=shuffle(ALL_GROUPS_DATA[g]);});
          const best3=GROUPS.map(g=>groupRankings[g][2]).slice(0,8);
          const koPicks={};
          for(let i=0;i<16;i++) koPicks[`R32-${i}`]=rnd();
          for(let i=0;i<8;i++) koPicks[`R16-${i}`]=rnd();
          for(let i=0;i<4;i++) koPicks[`QF-${i}`]=rnd();
          for(let i=0;i<2;i++) koPicks[`SF-${i}`]=rnd();
          koPicks["F-0"]=rnd();
          onAutoPick&&onAutoPick({stage:"ko",groupIdx:GROUPS.length-1,showIntro:false,groupRankings,best3,koIdx:0,koPicks,koShowIntro:false,koRound:"F",showFinalSummary:true});
        }} style={{width:"100%",padding:"14px 0",borderRadius:16,border:"1px solid rgba(255,255,255,0.15)",
          background:"rgba(255,255,255,0.08)",
          color:"rgba(255,255,255,0.85)",fontSize:14,fontWeight:800,cursor:"pointer"}}>
          🎲 Auto-Pick Predictions
        </button>
        <button onClick={()=>onStart(simDay, simHour, simMin, simStarted)}
          style={{width:"100%",padding:"16px 0",borderRadius:16,border:"none",
            background:"linear-gradient(135deg,#C8102E,#EF3340 40%,#009A44)",
            color:"#fff",fontSize:16,fontWeight:900,cursor:"pointer",
            boxShadow:"0 6px 20px rgba(200,16,46,0.4)"}}>
          Enter App →
        </button>
      </div>
    </div>
  );
}

function PredictoLogo({ scale = 1 }) {
  const s = scale;
  const pSize   = Math.round(46 * s);
  const txtSize = Math.round(39 * s);
  const ballW   = Math.round(36 * s);
  const acLeft  = Math.round(6  * s);
  const acTop   = Math.round(17 * s);
  const acBT    = Math.round(7  * s);
  const acBL    = Math.round(13 * s);
  return (
    <div style={{display:"flex",alignItems:"center",fontStyle:"italic",fontWeight:900,letterSpacing:-0.5,
      fontFamily:"'Barlow Condensed','Arial Narrow','Impact',sans-serif"}}>
      {/* P cu accent roșu */}
      <div style={{position:"relative",marginRight:Math.round(2*s)}}>
        <span style={{color:"#002B7F",fontSize:pSize,lineHeight:1,display:"block"}}>P</span>
        <div style={{
          position:"absolute",left:acLeft,top:acTop,width:0,height:0,
          borderTop:`${acBT}px solid transparent`,
          borderBottom:`${acBT}px solid transparent`,
          borderLeft:`${acBL}px solid #FF1E1E`,
          transform:"skewX(-20deg)",
        }}/>
      </div>
      {/* redict + minge */}
      <div style={{display:"flex",alignItems:"flex-end"}}>
        <span style={{color:"#002B7F",fontSize:txtSize,lineHeight:1}}>redict</span>
        <div style={{marginLeft:Math.round(2*s),marginBottom:Math.round(2*s)}}>
          <svg width={ballW} height={ballW} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="47" stroke="#002B7F" strokeWidth="6" fill="white"/>
            <polygon points="50,30 65,40 60,58 40,58 35,40" fill="#002B7F"/>
            <polygon points="50,30 35,40 20,30 30,15 45,18" fill="#002B7F"/>
            <polygon points="65,40 80,30 70,15 55,18 50,30" fill="#002B7F"/>
            <polygon points="40,58 30,75 45,85 50,70" fill="#002B7F"/>
            <polygon points="60,58 70,75 55,85 50,70" fill="#002B7F"/>
            <path d="M20 30 L35 40 L40 58 L30 75" stroke="#002B7F" strokeWidth="2"/>
            <path d="M80 30 L65 40 L60 58 L70 75" stroke="#002B7F" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function SplashScreen({ onNext, lang, setLang, simDay, simHour=12, simMin=0, tournamentStarted }) {
  const {d,h,m,s}=useCountdown();
  // Calculate days left based on simDay or real date
  const target = new Date("2026-06-11T23:00:00Z"); // 19:00 ET = 23:00 UTC
  const simNow = simDay ? new Date(Date.UTC(2026, 5, simDay, (simHour||0)+4, simMin||0, 0)) : new Date();
  const diffMs = target - simNow;
  const daysLeft = Math.max(0, Math.floor(diffMs / (1000*60*60*24)));
  const hoursLeft = Math.max(0, Math.floor((diffMs % (1000*60*60*24)) / (1000*60*60)));
  const minsLeft = Math.max(0, Math.floor((diffMs % (1000*60*60)) / (1000*60)));
  const secsLeft = Math.max(0, Math.floor((diffMs % (1000*60)) / 1000));
  const sd = simDay ? daysLeft : d;
  const sh = simDay ? hoursLeft : h;
  const sm2 = simDay ? minsLeft : m;
  const ss = simDay ? secsLeft : s;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",background:BG}}>
      <div style={{position:"absolute",width:"100%",height:"100%",background:"linear-gradient(180deg,rgba(0,32,91,0.04) 0%,rgba(200,16,46,0.07) 100%)",zIndex:0,pointerEvents:"none"}}/>
      <div style={{background:"linear-gradient(180deg,#CCDAFF 0%,rgba(226,235,255,0.7) 55%,transparent 100%)",padding:"12px 22px 14px",position:"relative",zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{width:44}}/>
        <div style={{textAlign:"center"}}>
          <img src={predictoLogo} alt="Predicto" decoding="sync" style={{height:36,width:"auto",objectFit:"contain",display:"block",margin:"0 auto",position:"relative",left:3}}/>
          <h1 style={{fontSize:10,fontWeight:700,margin:"2px 0 0",letterSpacing:2.5,lineHeight:1,background:"linear-gradient(100deg,#CC0022 0%,#003399 50%,#007733 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>WORLD CUP 2026</h1>
          <p style={{fontSize:11,color:"#6B7280",margin:"3px 0 0"}}>{T[lang].location}</p>
        </div>
        <LangSelector lang={lang} setLang={setLang}/>
      </div>
      {/* Background trophy image */}
      <img
        src={trophyHQ}
        alt="FIFA World Cup Trophy"
        style={{
          position: "absolute",
          width: "130%",
          height: "100%",
          left: "-30%",
          top: "15%",
          objectFit: "cover",
          objectPosition: "center top",
          zIndex: 0,
          mixBlendMode: "multiply",
          opacity: 0.9,
        }}
      />
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
        {IS_LOCALHOST && (
          <div style={{background:"rgba(0,0,0,0.55)",borderRadius:16,padding:"16px 20px",textAlign:"center",backdropFilter:"blur(6px)"}}>
            <p style={{fontSize:13,fontWeight:700,color:"#FCD34D",margin:"0 0 4px"}}>⚠️ Dev mode — localhost</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.7)",margin:0}}>hCaptcha nu funcționează pe localhost.<br/>Accesează via <strong style={{color:"#fff"}}>IP:5174</strong> din rețea.</p>
          </div>
        )}
      </div>
      <div style={{margin:"0 20px 14px",background:"rgba(0,32,91,0.6)",borderRadius:20,padding:"16px 8px 12px",display:"flex",position:"relative",zIndex:10}}>
        {tournamentStarted ? (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:RED,display:"inline-block"}}/>
              <span style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:3}}>LIVE NOW</span>
              <span style={{width:8,height:8,borderRadius:"50%",background:RED,display:"inline-block"}}/>
            </div>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1.5}}>World Cup 2026</span>
          </div>
        ) : (
          [{ v:sd,l:"days"},{ v:sh,l:"hours"},{ v:sm2,l:"minutes"},{ v:ss,l:"seconds"}].map(({v,l},i)=>(
            <div key={l} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
              <span style={{fontSize:30,fontWeight:800,color:"#fff",lineHeight:1}}>{String(v).padStart(2,"0")}</span>
              {i<3&&<span style={{position:"absolute",right:-2,top:2,fontSize:20,color:"rgba(255,255,255,0.25)"}}>:</span>}
              <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1.5,marginTop:6}}>{T[lang][l]||l}</span>
            </div>
          ))
        )}
      </div>
      <div style={{padding:"0 20px 32px",position:"relative",zIndex:10}}>
        <button onClick={onNext} style={{width:"100%",background:"linear-gradient(135deg,#C8102E 0%,#EF3340 50%,#009A44 100%)",color:"#fff",border:"none",borderRadius:16,padding:"17px 0",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 24px rgba(0,32,91,0.3)"}}>{T[lang].cta}</button>
      </div>
    </div>
  );
}

function OnboardingSheet({ onDone }) {
  const lang = useLang();
  const [slide, setSlide] = useState(0);
  const startX = useRef(null);

  const slides = [
    {
      emoji:"🎯",
      title:T[lang].onb0Title,
      subtitle:T[lang].onb0Sub,
      desc:T[lang].onb0Desc,
      nextLabel:T[lang].onb0Next,
    },
    {
      emoji:"⚽",
      title:T[lang].onb1Title,
      subtitle:T[lang].onb1Sub,
      desc:T[lang].onb1Desc,
      nextLabel:T[lang].onb1Next,
    },
    {
      emoji:"🏆",
      title:T[lang].onb2Title,
      subtitle:T[lang].onb2Sub,
      desc:T[lang].onb2Desc,
      nextLabel:T[lang].onb2Next,
    },
  ];

  const cur = slides[slide];
  const isLast = slide === slides.length - 1;

  return (
    <div style={{position:"fixed",inset:0,zIndex:1100,display:"flex",flexDirection:"column",
      justifyContent:"flex-end",touchAction:"none",overflow:"hidden"}}
      onWheel={e=>e.stopPropagation()}>
      {/* Backdrop — click to close */}
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)"}} onClick={onDone}/>
      {/* Sheet */}
      <div onClick={e=>e.stopPropagation()}
        style={{position:"relative",zIndex:1,
          background:"#07041a",
          borderRadius:"24px 24px 0 0",
          height:540,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* VAR image — top:-96px shifts it so blue screen (img px 66-186) maps to popup px 0-90 (handle+emoji only) */}
        <img src={varBg} alt="" style={{
          position:"absolute",width:"100%",height:"auto",
          top:"-96px",left:0,
          zIndex:0,opacity:0.95,pointerEvents:"none",
        }}/>
        {/* Overlay: blue visible at top (0-17%), hard fade by 22% so all text sits on dark */}
        <div style={{
          position:"absolute",inset:0,zIndex:1,pointerEvents:"none",
          background:"linear-gradient(180deg,rgba(7,4,26,0.05) 0%,rgba(7,4,26,0.45) 17%,rgba(7,4,26,0.94) 22%,rgba(7,4,26,0.98) 100%)",
        }}/>

        {/* Content above image+overlay */}
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",flex:1,paddingBottom:24}}>
          {/* Handle */}
          <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}>
            <div style={{width:40,height:4,borderRadius:2,background:"rgba(255,255,255,0.35)"}}/>
          </div>

          {/* Slide area — swipe L/R */}
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}
            onTouchStart={e=>{ startX.current=e.touches[0].clientX; }}
            onTouchEnd={e=>{
              const dx=e.changedTouches[0].clientX-startX.current;
              if(dx<-50&&slide<slides.length-1) setSlide(s=>s+1);
              if(dx>50&&slide>0) setSlide(s=>s-1);
            }}>
            <div style={{padding:"0 28px",textAlign:"center",width:"100%"}}>
              <div style={{fontSize:56,marginBottom:12,lineHeight:1,colorScheme:"light",
                filter:cur.emoji==="⚽"?"saturate(0) contrast(3) brightness(1.1)":"none"}}>{cur.emoji}</div>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontWeight:700,
                letterSpacing:2,textTransform:"uppercase",margin:"0 0 8px"}}>{cur.subtitle}</p>
              <h2 style={{fontSize:22,fontWeight:900,color:"#fff",margin:"0 0 10px",lineHeight:1.2,
                textShadow:"0 2px 12px rgba(0,0,0,0.5)"}}>
                {cur.title}
              </h2>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.55,margin:"0 auto",maxWidth:280}}>
                {cur.desc}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div style={{padding:"8px 28px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>setSlide(s=>s-1)}
              style={{background:"none",border:"none",color:slide>0?"rgba(255,255,255,0.65)":"transparent",fontSize:22,cursor:slide>0?"pointer":"default",padding:"6px",lineHeight:1,WebkitTapHighlightColor:"transparent"}}>
              ←
            </button>
            <div style={{display:"flex",gap:8}}>
              {slides.map((_,i)=>(
                <div key={i} onClick={()=>setSlide(i)}
                  style={{width:i===slide?22:7,height:7,borderRadius:4,cursor:"pointer",
                    background:i===slide?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.3)",
                    transition:"all 0.3s"}}/>
              ))}
            </div>
            <button onClick={()=>{ if(isLast) onDone(false); else setSlide(s=>s+1); }}
              style={{background:"none",border:"none",color:"rgba(255,255,255,0.85)",fontSize:14,fontWeight:700,cursor:"pointer",padding:"6px",display:"flex",alignItems:"center",gap:5,lineHeight:1,WebkitTapHighlightColor:"transparent"}}>
              {isLast?T[lang].guideClose:T[lang].guideViewNext}<span style={{fontSize:20}}>{isLast?"":"→"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const IMAGE_CAPTCHA_CHALLENGES = [
  { label:"Selectează toate mingile de fotbal ⚽", items:["⚽","🏀","⚽","🎾","🥊","⚽","🏈","🏐","🎱"], correct:new Set([0,2,5]) },
  { label:"Selectează toate trofeele 🏆", items:["🥇","🏆","🎖️","🏆","🎯","🏅","🏆","⭐","🎗️"], correct:new Set([1,3,6]) },
  { label:"Selectează toate steagurile 🚩", items:["🚩","🎯","🚩","🎪","🚩","⭐","🏈","🚩","🎱"], correct:new Set([0,2,4,7]) },
  { label:"Selectează toate coroanele 👑", items:["👑","🎯","🎱","👑","⭐","🏅","👑","💎","🎗️"], correct:new Set([0,3,6]) },
  { label:"Selectează toate stelele ⭐", items:["⭐","🎯","🏈","⭐","🎪","⭐","🏅","🎱","⭐"], correct:new Set([0,3,5,8]) },
];

function ImageCaptcha({ onSolved }) {
  const [challenge] = useState(() =>
    IMAGE_CAPTCHA_CHALLENGES[Math.floor(Math.random() * IMAGE_CAPTCHA_CHALLENGES.length)]
  );
  const [selected, setSelected] = useState(new Set());
  const [done, setDone] = useState(false);

  const toggle = (i) => {
    if (done) return;
    const next = new Set(selected);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelected(next);
    const c = challenge.correct;
    if (next.size === c.size && [...next].every(x => c.has(x))) {
      setDone(true);
      setTimeout(() => onSolved(), 350);
    }
  };

  if (done) return (
    <div style={{background:"#f0fdf4",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
      <span style={{fontSize:20}}>✅</span>
      <p style={{fontSize:13,fontWeight:700,color:"#16a34a",margin:0}}>Verificare completă</p>
    </div>
  );

  return (
    <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10}}>
      <p style={{fontSize:12,color:"#888",fontWeight:600,margin:"0 0 10px",textAlign:"center"}}>{challenge.label}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
        {challenge.items.map((item, i) => {
          const isSel = selected.has(i);
          return (
            <div key={i} onClick={() => toggle(i)} style={{
              aspectRatio:"1", background: isSel ? "#EEF2FF" : "#f8f8f8",
              border:`2px solid ${isSel ? NAVY : "#e8e8e8"}`,
              borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:30, cursor:"pointer", transition:"all 0.15s",
              userSelect:"none", WebkitUserSelect:"none",
              boxShadow: isSel ? `0 0 0 3px ${NAVY}22` : "none",
            }}>
              {item}
            </div>
          );
        })}
      </div>
      <p style={{fontSize:10,color:"#bbb",textAlign:"center",margin:"8px 0 0"}}>
        Apasă pe fiecare imagine corectă • {selected.size} selectate
      </p>
    </div>
  );
}

function HCaptchaWidget({ id, onSolved }) {
  const [verified, setVerified] = useState(false);
  const captchaRef = useRef(null);
  const handleVerify = (token) => {
    setVerified(true);
    setTimeout(() => onSolved(token), 300);
  };
  if (verified) return (
    <div style={{background:"#f0fdf4",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
      <span style={{fontSize:20}}>✅</span>
      <p style={{fontSize:13,fontWeight:700,color:"#16a34a",margin:0}}>Verificare completă</p>
    </div>
  );
  return (
    <div style={{marginBottom:10,display:"flex",justifyContent:"center"}}>
      <HCaptcha
        key={id}
        ref={captchaRef}
        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
        onVerify={handleVerify}
        theme="light"
        size="normal"
      />
    </div>
  );
}

function CaptchaWidget({ id, onSolved }) {
  if (CAPTCHA_PROVIDER === "hcaptcha") return <HCaptchaWidget id={id} onSolved={onSolved} />;
  return <ImageCaptcha key={id} onSolved={onSolved} />;
}

function LoginScreen({ onNext, onBack }) {
  const lang = useLang();
  const [step, setStep] = useState("credentials"); // "credentials" | "newuser" | "sent"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaSolved, setCaptchaSolved] = useState(!CAPTCHA_ENABLED);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [nicknameError, setNicknameError] = useState("");

  const handleNicknameChange = (val) => {
    setNickname(val);
    if (!val.trim()) { setNicknameError(""); return; }
    if (!/^[a-zA-Z]/.test(val.trim())) {
      setNicknameError(T[lang].errNicknameLetter);
    } else {
      setNicknameError("");
    }
  };
  const [showPwd, setShowPwd] = useState(false);
  const [sentFrom, setSentFrom] = useState("");

  const getAttempts = () => parseInt(localStorage.getItem("_pred_ml") || "0");
  const incAttempts = () => localStorage.setItem("_pred_ml", String(getAttempts() + 1));

  const goToNewuser = () => {
    setPassword("");
    setStep("newuser");
  };

  const goToSignup = () => {
    setEmail("");
    setPassword("");
    setNickname("");
    setError("");
    setStep("signup");
  };

  const goToForgot = () => {
    setError("");
    setStep("forgot");
  };

  const resetLoginCaptcha = () => { setCaptchaSolved(!CAPTCHA_ENABLED); setCaptchaToken(null); };

  const handleContinue = async () => {
    if (!email.trim()) { setError(T[lang].errEnterEmail); return; }
    if (!password.trim()) { setError(T[lang].errEnterPassword); return; }
    setLoading(true); setError("");
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(), password,
        options: captchaToken ? { captchaToken } : undefined
      });
      if (!signInErr) { setLoading(false); return; }

      const exists = await checkEmailExists(email.trim());
      if (exists === true) {
        resetLoginCaptcha();
        setError(T[lang].errWrongPassword);
      } else {
        setCaptchaSolved(!CAPTCHA_ENABLED);
        setCaptchaToken(null);
        goToNewuser();
      }
    } catch { setError(T[lang].errUnexpected); resetLoginCaptcha(); }
    finally { setLoading(false); }
  };

  const handleCreateAccount = async () => {
    if (!nickname.trim()) { setError(T[lang].errChooseNickname); return; }
    if (nicknameError) { setError(nicknameError); return; }
    if (password.length < 6) { setError(T[lang].errPasswordMin6); return; }
    setLoading(true); setError("");
    const nickTaken = await checkNicknameExists(nickname.trim());
    if (nickTaken) { setLoading(false); setError(T[lang].errNicknameTaken); resetLoginCaptcha(); return; }
    const { error: otpErr } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: nickname.trim(), lang }, emailRedirectTo: window.location.origin, ...(captchaToken && { captchaToken }) }
    });
    setLoading(false);
    if (otpErr) { setError(otpErr.message); resetLoginCaptcha(); return; }
    incAttempts();
    setStep("sent");
  };

  const handleSignup = async () => {
    if (!email.trim()) { setError(T[lang].errEnterEmail); return; }
    if (!nickname.trim()) { setError(T[lang].errChooseNickname); return; }
    if (nicknameError) { setError(nicknameError); return; }
    if (password.length < 6) { setError(T[lang].errPasswordMin6); return; }
    setLoading(true); setError("");
    const nickTaken = await checkNicknameExists(nickname.trim());
    if (nickTaken) { setLoading(false); setError(T[lang].errNicknameTaken); resetLoginCaptcha(); return; }
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: nickname.trim(), lang }, emailRedirectTo: window.location.origin, ...(captchaToken && { captchaToken }) }
    });
    setLoading(false);
    if (err) { setError(err.message); resetLoginCaptcha(); return; }
    setStep("sent");
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError(T[lang].errEnterEmail); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin, ...(captchaToken && { captchaToken })
    });
    setLoading(false);
    if (error) { setError(T[lang].errSendFailed); resetLoginCaptcha(); return; }
    setSentFrom("forgot");
    setStep("sent");
  };

  const canCreate = nickname.trim() && password.length >= 6 && captchaSolved;
  const forgotCanSend = email.trim() && captchaSolved;
  const signupCanCreate = email.trim() && nickname.trim() && password.length >= 6 && captchaSolved;

  const loginBg = "linear-gradient(180deg,#CCDAFF 0%,#E4EDFF 40%,#EEF2FF 100%)";
  const bgImg = (
    <div style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none"}}>
      <img src={trophyHQ} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"10%",objectFit:"cover",objectPosition:"center top",opacity:0.09,filter:"grayscale(1) contrast(1.4)"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(204,218,255,0.0) 0%,rgba(238,242,255,0.7) 60%,rgba(238,242,255,1) 100%)"}}/>
    </div>
  );

  // ── Sign up ───────────────────────────────────────────────────────────────
  if (step === "signup") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:loginBg,position:"relative",overflow:"hidden"}}>
      {bgImg}
      <HeaderShell onBack={()=>{setStep("credentials");setError("");}}>{T[lang].loginCreateAccount}</HeaderShell>
      <div style={{flex:1,padding:"24px 24px 32px",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>✉️</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={T[lang].emailPlaceholder}
            type="email" autoCapitalize="none" autoFocus
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>🔒</span>
          <input value={password} onChange={e=>setPassword(e.target.value)}
            placeholder={T[lang].passwordMinPlaceholder} type="password"
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>👤</span>
          <input value={nickname} onChange={e=>handleNicknameChange(e.target.value)}
            placeholder={T[lang].nicknamePlaceholder} type="text" autoCapitalize="words"
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>
        {nicknameError&&<p style={{fontSize:12,color:RED,margin:"-6px 0 8px",paddingLeft:4}}>{nicknameError}</p>}
        {CAPTCHA_ENABLED && email.trim() && password.length >= 6 && nickname.trim() && !nicknameError && !captchaSolved && (
          <CaptchaWidget id="signup-captcha" onSolved={(token) => { setCaptchaSolved(true); if (token) setCaptchaToken(token); }} />
        )}
        {error && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{error}</p>}
        <button onClick={handleSignup} disabled={loading || !signupCanCreate}
          style={{
            width:"100%",
            background: signupCanCreate ? `linear-gradient(135deg,${RED},#cc2200)` : "#e0e0e0",
            color: signupCanCreate ? "#fff" : "#bbb",
            border:"none", borderRadius:14, padding:"15px 0", fontSize:15, fontWeight:700,
            cursor: signupCanCreate ? "pointer" : "not-allowed",
            opacity: loading ? 0.7 : 1, marginBottom:10, transition:"all 0.2s"
          }}>
          {loading ? T[lang].btnCreating : !signupCanCreate && !captchaSolved && email.trim() && password.length >= 6 && nickname.trim() ? T[lang].solveCaptcha : T[lang].btnCreateAccount}
        </button>
      </div>
    </div>
  );

  // ── Forgot password ───────────────────────────────────────────────────────
  if (step === "forgot") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:loginBg,position:"relative",overflow:"hidden"}}>
      {bgImg}
      <HeaderShell onBack={()=>{setStep("credentials");setError("");}}>{T[lang].loginRecoverAccount}</HeaderShell>
      <div style={{flex:1,padding:"24px 24px 32px",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>✉️</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={T[lang].emailPlaceholder}
            type="email" autoCapitalize="none" autoFocus
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>

        {CAPTCHA_ENABLED && !captchaSolved && (
          <CaptchaWidget id="forgot-captcha" onSolved={(token) => { setCaptchaSolved(true); if (token) setCaptchaToken(token); }} />
        )}

        {error && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{error}</p>}

        <button onClick={handleForgotPassword} disabled={loading || !forgotCanSend}
          style={{
            width:"100%",
            background: forgotCanSend ? `linear-gradient(135deg,${NAVY},#001840)` : "#e0e0e0",
            color: forgotCanSend ? "#fff" : "#bbb",
            border:"none", borderRadius:14, padding:"15px 0", fontSize:15, fontWeight:700,
            cursor: forgotCanSend ? "pointer" : "not-allowed",
            opacity: loading ? 0.7 : 1,
            marginBottom:10, transition:"all 0.2s"
          }}>
          {loading ? T[lang].btnSending : !captchaSolved ? T[lang].solveCaptcha : T[lang].btnSendReset}
        </button>
      </div>
    </div>
  );

  // ── Sent ──────────────────────────────────────────────────────────────────
  if (step === "sent") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:loginBg,position:"relative",overflow:"hidden"}}>
      {bgImg}
      <HeaderShell onBack={()=>setStep("credentials")}>{T[lang].loginCheckEmail}</HeaderShell>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{fontSize:56,marginBottom:16}}>📧</div>
        <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 10px"}}>{T[lang].checkEmailTitle}</h2>
        <p style={{fontSize:14,color:"#aaa",lineHeight:1.6,margin:"0 0 24px"}}>
          {T[lang].sentLinkTo}<br/><strong style={{color:DARK}}>{email}</strong><br/>
          <span style={{fontSize:12}}>{T[lang].clickLinkToContinue}</span>
          {sentFrom==="forgot"&&<><br/><span style={{fontSize:11,color:"#bbb"}}>{T[lang].linkSentIfExists}</span></>}
        </p>
      </div>
    </div>
  );

  // ── Cont nou ──────────────────────────────────────────────────────────────
  if (step === "newuser") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:loginBg,position:"relative",overflow:"hidden"}}>
      {bgImg}
      <HeaderShell onBack={()=>{setStep("credentials");setError("");}}>{T[lang].loginNewAccount}</HeaderShell>
      <div style={{flex:1,padding:"24px 24px 32px",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
        {/* No account found card */}
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"12px 16px",marginBottom:16}}>
          <p style={{fontSize:12,color:"#aaa",margin:"0 0 2px"}}>{T[lang].loginNoAccountFor}</p>
          <p style={{fontSize:15,fontWeight:700,color:DARK,margin:0}}>{email}</p>
        </div>

        {/* Parolă */}
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>🔒</span>
          <input value={password} onChange={e=>setPassword(e.target.value)}
            placeholder={T[lang].passwordMinPlaceholder} type="password" autoFocus
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>

        {/* Nickname */}
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>👤</span>
          <input value={nickname} onChange={e=>handleNicknameChange(e.target.value)}
            placeholder={T[lang].nicknamePlaceholder} type="text" autoCapitalize="words"
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>
        {nicknameError&&<p style={{fontSize:12,color:RED,margin:"-6px 0 8px",paddingLeft:4}}>{nicknameError}</p>}

        {CAPTCHA_ENABLED && password.length >= 6 && nickname.trim() && !nicknameError && !captchaSolved && (
          <CaptchaWidget id="newuser-captcha" onSolved={(token) => { setCaptchaSolved(true); if (token) setCaptchaToken(token); }} />
        )}

        {error && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{error}</p>}

        {/* Create account — read-only until captcha solved */}
        <button onClick={handleCreateAccount} disabled={loading || !canCreate}
          style={{
            width:"100%",
            background: canCreate ? `linear-gradient(135deg,${RED},#cc2200)` : "#e0e0e0",
            color: canCreate ? "#fff" : "#bbb",
            border:"none", borderRadius:14, padding:"15px 0", fontSize:15, fontWeight:700,
            cursor: canCreate ? "pointer" : "not-allowed",
            opacity: loading ? 0.7 : 1,
            marginBottom:10, transition:"all 0.2s"
          }}>
          {loading ? T[lang].btnSending : CAPTCHA_ENABLED && !captchaSolved ? T[lang].solveCaptcha : T[lang].btnSignUpCreate}
        </button>
      </div>
    </div>
  );

  // ── Credentials (step 1) ──────────────────────────────────────────────────
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:loginBg,position:"relative",overflow:"hidden"}}>
      {bgImg}
      <HeaderShell onBack={onBack}>{T[lang].joinTheGame}</HeaderShell>
      <div style={{flex:1,padding:"24px 24px 32px",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>✉️</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={T[lang].emailPlaceholder}
            type="email" autoCapitalize="none"
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>
        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>🔒</span>
          <input value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleContinue()}
            placeholder={T[lang].passwordPlaceholder} type={showPwd?"text":"password"}
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
          <span onClick={()=>setShowPwd(p=>!p)}
            style={{cursor:"pointer",color:"#bbb",userSelect:"none",display:"flex",alignItems:"center",padding:"0 2px",flexShrink:0}}>
            {showPwd
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </span>
        </div>
        {CAPTCHA_ENABLED && !captchaSolved && (
          <CaptchaWidget id="login-captcha" onSolved={(token) => { setCaptchaSolved(true); if (token) setCaptchaToken(token); }} />
        )}
        {error && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{error}</p>}
        <button onClick={handleContinue} disabled={loading || (CAPTCHA_ENABLED && !captchaSolved)}
          style={{width:"100%",background:(CAPTCHA_ENABLED && !captchaSolved)?"#e0e0e0":`linear-gradient(135deg,${NAVY},#001840)`,color:(CAPTCHA_ENABLED && !captchaSolved)?"#bbb":"#fff",border:"none",borderRadius:14,padding:"15px 0",fontSize:15,fontWeight:700,cursor:(CAPTCHA_ENABLED && !captchaSolved)?"not-allowed":"pointer",opacity:loading?0.7:1,marginBottom:8}}>
          {loading ? T[lang].btnVerifying : (CAPTCHA_ENABLED && !captchaSolved) ? T[lang].solveCaptcha : T[lang].btnContinue}
        </button>
        <div style={{display:"flex",justifyContent:"space-between",padding:"4px 2px 0"}}>
          <p onClick={goToForgot}
            style={{fontSize:12,color:"#aaa",margin:0,cursor:"pointer",textDecoration:"underline"}}>
            {T[lang].forgotPassword}
          </p>
          <p onClick={goToSignup}
            style={{fontSize:12,color:NAVY,margin:0,cursor:"pointer",textDecoration:"underline",fontWeight:600}}>
            {T[lang].newAccountLink}
          </p>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordScreen({ onDone }) {
  const lang = useLang();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (password.length < 6) { setError(T[lang].errPasswordMin6); return; }
    if (password !== confirm) { setError(T[lang].errPasswordsMismatch); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password, data: { has_password: true } });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => onDone(), 2000);
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center",background:BG}}>
      {done ? (
        <>
          <div style={{fontSize:56,marginBottom:16}}>✅</div>
          <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 8px"}}>{T[lang].passwordChanged}</h2>
          <p style={{fontSize:13,color:"#aaa"}}>{T[lang].redirectingMsg}</p>
        </>
      ) : (
        <>
          <div style={{fontSize:48,marginBottom:16}}>🔑</div>
          <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 8px"}}>{T[lang].newPasswordTitle}</h2>
          <p style={{fontSize:13,color:"#aaa",margin:"0 0 24px"}}>{T[lang].enterNewPassword}</p>
          <div style={{width:"100%",maxWidth:340}}>
            <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:15}}>🔒</span>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder={T[lang].newPasswordPlaceholder} type="password"
                style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
            </div>
            <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:15}}>🔒</span>
              <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={T[lang].confirmPasswordPlaceholderField}
                onKeyDown={e=>e.key==="Enter"&&handleReset()} type="password"
                style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
            </div>
            {error && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{error}</p>}
            <button onClick={handleReset} disabled={loading||!password||!confirm}
              style={{width:"100%",background:password&&confirm?`linear-gradient(135deg,${NAVY},#001840)`:"#e0e0e0",color:"#fff",border:"none",borderRadius:14,padding:"15px 0",fontSize:15,fontWeight:700,cursor:"pointer",opacity:loading?0.7:1}}>
              {loading ? T[lang].btnSaving : T[lang].btnSavePassword}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SetPasswordScreen({ onDone }) {
  const lang = useLang();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSet = async () => {
    if (password.length < 6) { setError(T[lang].errPasswordMin6); return; }
    if (password !== confirm) { setError(T[lang].errPasswordsMismatch); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password, data: { has_password: true } });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => onDone(), 2000);
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center",background:BG}}>
      {done ? (
        <>
          <div style={{fontSize:56,marginBottom:16}}>✅</div>
          <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 8px"}}>{T[lang].passwordSet}</h2>
          <p style={{fontSize:13,color:"#aaa"}}>{T[lang].redirectingMsg}</p>
        </>
      ) : (
        <>
          <div style={{fontSize:48,marginBottom:16}}>🔐</div>
          <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 8px"}}>{T[lang].setPasswordTitle}</h2>
          <p style={{fontSize:13,color:"#888",margin:"0 0 6px"}}>{T[lang].accountCreatedViaLink}</p>
          <p style={{fontSize:13,color:"#aaa",margin:"0 0 24px"}}>{T[lang].setPasswordDesc}</p>
          <div style={{width:"100%",maxWidth:340}}>
            <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:15}}>🔒</span>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder={T[lang].newPasswordPlaceholder} type="password"
                style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
            </div>
            <div style={{background:"#fff",borderRadius:14,boxShadow:"0 8px 22px rgba(0,0,0,0.07)",padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:15}}>🔒</span>
              <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={T[lang].confirmPasswordPlaceholderField}
                onKeyDown={e=>e.key==="Enter"&&handleSet()} type="password"
                style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
            </div>
            {error && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{error}</p>}
            <button onClick={handleSet} disabled={loading||!password||!confirm}
              style={{width:"100%",background:password&&confirm?`linear-gradient(135deg,${NAVY},#001840)`:"#e0e0e0",color:"#fff",border:"none",borderRadius:14,padding:"15px 0",fontSize:15,fontWeight:700,cursor:"pointer",opacity:loading?0.7:1}}>
              {loading ? T[lang].btnSaving : T[lang].btnSavePassword}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LeaderboardScreen({ onBack, tournamentStarted, leaders: leadersProp, myBoards=[], activeBoardId, setActiveBoardId, userId }) {
  const lang = useLang();
  const leaders = leadersProp || BOARD_LEADERS.global;
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // {userId, name, pts, rank}
  const [breakdown, setBreakdown] = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  const openBreakdown = (u) => {
    if (!u.userId) return;
    setBreakdown(null);
    setBreakdownLoading(true);
    const boardId = activeBoardId || 'global';
    loadUserBreakdown(u.userId, boardId).then(data => {
      setBreakdown(data);
      setBreakdownLoading(false);
      setSelectedUser(u);
    });
  };

  useEffect(()=>{
    if(selectedUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  },[selectedUser]);
  const tCode = (name) => TEAM_CODE[name] || name?.slice(0,3).toUpperCase() || '???';

  const sliderItems = myBoards;
  const [sliderPos, setSliderPos] = useState(()=>Math.max(0,myBoards.findIndex(b=>b.id===activeBoardId)));
  const sliderTouchRef = useRef(null);
  useEffect(()=>{
    const idx = myBoards.findIndex(b=>b.id===activeBoardId);
    if(idx>=0) setSliderPos(idx);
  },[activeBoardId,myBoards]);
  const handleSliderTouchStart = (e)=>{ sliderTouchRef.current = e.touches[0].clientX; };
  const handleSliderTouchEnd = (e)=>{
    if(sliderTouchRef.current===null) return;
    const dx = e.changedTouches[0].clientX - sliderTouchRef.current;
    sliderTouchRef.current = null;
    if(Math.abs(dx)<28) return;
    if(dx<0 && sliderPos<sliderItems.length-1){
      const np=sliderPos+1; setSliderPos(np);
      setActiveBoardId&&setActiveBoardId(sliderItems[np].id);
    } else if(dx>0 && sliderPos>0){
      const np=sliderPos-1; setSliderPos(np);
      setActiveBoardId&&setActiveBoardId(sliderItems[np].id);
    }
  };

  const filtered = search.trim()
    ? leaders.filter(u => u.name?.toLowerCase().includes(search.trim().toLowerCase()))
    : leaders;
  const me = leaders.find(u=>u.isMe);

  return (<>
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"transparent",position:"relative",overflow:"hidden"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"linear-gradient(to bottom, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 28%, rgba(255,255,255,0.02) 48%, transparent 65%)",borderRadius:26,margin:"10px 14px 0",boxShadow:"0 8px 32px rgba(10,46,138,0.10), inset 0 1px 0 rgba(255,255,255,0.80)",border:"1px solid rgba(255,255,255,0.22)",overflow:"hidden",position:"relative",willChange:"transform",transform:"translateZ(0)"}}>
        {/* Blur layer */}
        <div style={{position:"absolute",inset:0,backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",WebkitMaskImage:"linear-gradient(to bottom, black 0%, black 18%, transparent 36%)",maskImage:"linear-gradient(to bottom, black 0%, black 18%, transparent 36%)",pointerEvents:"none",zIndex:0}}/>
        {/* Gloss highlight */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:"45%",background:"linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 40%, transparent 65%)",pointerEvents:"none",zIndex:0}}/>
        <div style={{padding:"12px 14px 0",flexShrink:0,position:"relative",zIndex:2}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0,paddingTop:10}}>
              <button onClick={onBack} style={{width:44,height:44,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:22,color:"#374151",lineHeight:1}}>‹</span>
              </button>
              <p style={{fontSize:11,color:"transparent",margin:0,userSelect:"none"}}> </p>
            </div>
            <div style={{textAlign:"center"}}>
              <img src={predictoLogo} alt="Predicto" decoding="sync" style={{height:36,width:"auto",objectFit:"contain",display:"block",margin:"0 auto",position:"relative",left:3}}/>
              <h1 style={{fontSize:10,fontWeight:700,margin:"2px 0 0",letterSpacing:2.5,lineHeight:1,background:"linear-gradient(100deg,#CC0022 0%,#003399 50%,#007733 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>WORLD CUP 2026</h1>
              <p style={{fontSize:11,color:"#6B7280",margin:"3px 0 0"}}>{T[lang].location}</p>
            </div>
            <div style={{width:44,paddingTop:10}}/>
          </div>
        </div>
        {myBoards.length>0&&(()=>{
          const leftItem  = sliderItems[sliderPos-1] ?? null;
          const centerItem= sliderItems[sliderPos];
          const rightItem = sliderItems[sliderPos+1] ?? null;
          const myRank = leaders.find(u=>u.isMe)?.rank;
          const renderItem = (item, pos) => {
            if(!item) return <div key={pos} style={{flex:1}}/>;
            const isCenter = pos===0;
            const dist = Math.abs(pos);
            const handleTap = ()=>{
              if(!isCenter){ const np=sliderPos+pos; setSliderPos(np); setActiveBoardId&&setActiveBoardId(item.id); }
            };
            return (
              <div key={item.id} style={{flex:1,display:"flex",justifyContent:"center",alignItems:"center",...(isCenter?{transform:"translateY(-6px)",zIndex:2}:{})}}>
                <CircleTab label={item.label} imageUrl={item.image_url||undefined} name={item.isGlobal?"Global":item.name.split(" ")[0]}
                  isActive={isCenter} onClick={handleTap} lightBg distance={dist}
                  rank={isCenter?myRank:undefined} members={isCenter?item.members:undefined}/>
              </div>
            );
          };
          return (
            <div style={{margin:"18px 14px 0",background:"#fff",borderRadius:16,boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:"1px solid rgba(10,46,138,0.06)",display:"flex",alignItems:"center",padding:"8px 4px",overflow:"visible",flexShrink:0}}>
              <button onClick={()=>{ const np=sliderPos+1; if(np<sliderItems.length){setSliderPos(np);setActiveBoardId&&setActiveBoardId(sliderItems[np].id);} }}
                style={{background:"none",border:"none",padding:"0 16px",cursor:"pointer",fontSize:22,fontWeight:700,color:NAVY,opacity:sliderPos<sliderItems.length-1?0.65:0.12,WebkitTapHighlightColor:"transparent",lineHeight:1,transition:"opacity 0.2s",flexShrink:0}}>‹</button>
              <div onTouchStart={handleSliderTouchStart} onTouchEnd={handleSliderTouchEnd}
                style={{flex:1,display:"flex",alignItems:"center",userSelect:"none",touchAction:"pan-x",overflow:"visible",padding:"6px 0"}}>
                {renderItem(leftItem,-1)}
                {renderItem(centerItem,0)}
                {renderItem(rightItem,1)}
              </div>
              <button onClick={()=>{ const np=sliderPos-1; if(np>=0){setSliderPos(np);setActiveBoardId&&setActiveBoardId(sliderItems[np].id);} }}
                style={{background:"none",border:"none",padding:"0 16px",cursor:"pointer",fontSize:22,fontWeight:700,color:NAVY,opacity:sliderPos>0?0.65:0.12,WebkitTapHighlightColor:"transparent",lineHeight:1,transition:"opacity 0.2s",flexShrink:0}}>›</button>
            </div>
          );
        })()}
      {/* Search bar — sticky, outside scroll */}
      <div style={{padding:"12px 20px 4px",flexShrink:0}}>
        <div style={UI.inputPanel}>
          <span style={{fontSize:14,opacity:0.4}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={T[lang].searchPlayer}
            style={{flex:1,background:"transparent",border:"none",outline:"none",
              fontSize:13,color:DARK,fontWeight:500}}/>
          {search&&<span onClick={()=>setSearch("")} style={{fontSize:14,color:"#bbb",cursor:"pointer"}}>✕</span>}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",display:"flex",flexDirection:"column"}}>

      {leaders.length === 0 ? (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center"}}>
          <span style={{fontSize:48,marginBottom:16}}>⏳</span>
          <p style={{fontSize:18,fontWeight:800,color:DARK,margin:"0 0 8px"}}>{T[lang].tournamentNotStarted}</p>
          <p style={{fontSize:13,color:"#aaa",lineHeight:1.5,margin:0}}>{T[lang].leaderboardMsg}</p>
        </div>
      ) : (
        <div style={{padding:"0 20px 100px"}}>
          {filtered.length===0?(
            <Card style={UI.emptyState}>
              <div style={{fontSize:28,marginBottom:8}}>🔍</div>
              <div style={{fontSize:13,fontWeight:700,color:DARK}}>{T[lang].noPlayerFound} "{search}"</div>
            </Card>
          ) : !search.trim() ? (()=>{
            const PODIUM_COLORS = {1:"#FFD700",2:"#C0C0C0",3:"#CD7F32"};
            const PLATFORM_H   = {1:80,2:58,3:42};
            const AVATAR_SIZE  = {1:66,2:54,3:46};

            const PodiumSlot = ({u,rank})=>{
              if(!u) return <div style={{flex:1,minWidth:0}}/>;
              const color   = PODIUM_COLORS[rank];
              const medal   = rank===1?"🥇":rank===2?"🥈":"🥉";
              const size    = AVATAR_SIZE[rank];
              const initials= u.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";
              return (
                <div onClick={()=>openBreakdown(u)} style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",alignItems:"center",overflow:"hidden",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{fontSize:rank===1?26:22,marginBottom:4,lineHeight:1}}>{medal}</div>
                  <div style={{width:size,height:size,borderRadius:"50%",border:`3px solid ${color}`,
                    overflow:"hidden",background:u.isMe?`${NAVY}22`:"rgba(0,0,0,0.07)",
                    display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5,flexShrink:0}}>
                    {u.avatarUrl
                      ?<img src={u.avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      :<span style={{fontSize:rank===1?17:14,fontWeight:800,color:u.isMe?NAVY:"#555"}}>{initials}</span>}
                  </div>
                  <div style={{fontSize:11,fontWeight:800,color:u.isMe?NAVY:DARK,textAlign:"center",
                    width:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                    padding:"0 4px",marginBottom:3}}>{u.name}</div>
                  <div style={{fontSize:rank===1?15:13,fontWeight:900,color:color,marginBottom:8}}>{u.pts}p</div>
                  <div style={{width:"100%",height:PLATFORM_H[rank],
                    background:`linear-gradient(180deg,${color}cc 0%,${color}77 100%)`,
                    borderRadius:"8px 8px 0 0",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:16,fontWeight:900,color:"rgba(255,255,255,0.95)"}}>#{rank}</span>
                  </div>
                </div>
              );
            };

            const LeaderRow = ({u})=>{
              const rankColor = u.rank===4?"#5856D6":u.rank===5?"#5856D6":"#bbb";
              const initials  = u.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";
              return (
                <div onClick={()=>openBreakdown(u)} style={{display:"flex",alignItems:"center",background:u.isMe?"#E8F0FF":"#fff",
                  border:u.isMe?`1.5px solid ${NAVY}`:"1px solid rgba(0,0,0,0.07)",
                  borderRadius:12,padding:"8px 12px",gap:10,marginBottom:6,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{width:28,height:28,borderRadius:8,flexShrink:0,
                    background:u.isMe?`${NAVY}22`:"rgba(0,0,0,0.05)",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:10,fontWeight:800,color:u.isMe?NAVY:rankColor}}>#{u.rank}</span>
                  </div>
                  <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,overflow:"hidden",
                    background:u.isMe?`${NAVY}22`:"rgba(0,0,0,0.07)",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {u.avatarUrl
                      ?<img src={u.avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      :<span style={{fontSize:11,fontWeight:700,color:u.isMe?NAVY:"#888"}}>{initials}</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{fontSize:13,fontWeight:700,color:u.isMe?NAVY:DARK}}>{u.name}</span>
                  </div>
                  {u.prize&&(
                    <div style={{background:"rgba(0,0,0,0.04)",borderRadius:20,padding:"3px 10px",flexShrink:0}}>
                      <span style={{fontSize:11,fontWeight:800,color:rankColor}}>🎁 {u.prize}</span>
                    </div>
                  )}
                  <span style={{fontSize:13,fontWeight:800,color:u.isMe?NAVY:"#888",flexShrink:0}}>{u.pts}p</span>
                </div>
              );
            };

            return (
              <>
                {/* Podium */}
                <div style={{display:"flex",alignItems:"flex-end",gap:4,margin:"12px 0 0"}}>
                  <PodiumSlot u={filtered[1]||null} rank={2}/>
                  <PodiumSlot u={filtered[0]||null} rank={1}/>
                  <PodiumSlot u={filtered[2]||null} rank={3}/>
                </div>
                {/* Rest */}
                {filtered.length>3&&(
                  <div style={{marginTop:16}}>
                    {filtered.slice(3).map(u=><LeaderRow key={u.rank} u={u}/>)}
                  </div>
                )}
              </>
            );
          })() : filtered.map((u)=>{
            const rankColor = u.rank===1?"#FFD700":u.rank===2?"#C0C0C0":u.rank===3?"#CD7F32":"#bbb";
            const rankBadge = u.rank===1?"🥇":u.rank===2?"🥈":u.rank===3?"🥉":null;
            const initials  = u.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";
            return (
              <div key={u.rank} onClick={()=>openBreakdown(u)} style={{display:"flex",alignItems:"center",background:u.isMe?"#E8F0FF":"#fff",
                border:u.isMe?`1.5px solid ${NAVY}`:"1px solid rgba(0,0,0,0.07)",
                borderRadius:12,padding:"8px 12px",gap:10,marginBottom:6,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                <div style={{width:26,textAlign:"center",flexShrink:0}}>
                  {rankBadge?<span style={{fontSize:20}}>{rankBadge}</span>:(
                    <div style={{width:26,height:26,borderRadius:7,background:u.isMe?`${NAVY}22`:"rgba(0,0,0,0.05)",
                      display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>
                      <span style={{fontSize:10,fontWeight:700,color:u.isMe?NAVY:rankColor}}>#{u.rank}</span>
                    </div>
                  )}
                </div>
                <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,overflow:"hidden",
                  background:u.isMe?`${NAVY}22`:"rgba(0,0,0,0.07)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {u.avatarUrl
                    ?<img src={u.avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    :<span style={{fontSize:11,fontWeight:700,color:u.isMe?NAVY:"#888"}}>{initials}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <span style={{fontSize:13,fontWeight:700,color:u.isMe?NAVY:DARK}}>{u.name}</span>
                </div>
                {u.prize&&(
                  <div style={{background:u.rank===1?"rgba(255,215,0,0.15)":u.rank===2?"rgba(192,192,192,0.15)":"rgba(205,127,50,0.12)",
                    borderRadius:20,padding:"3px 10px",border:`1px solid ${rankColor}33`,flexShrink:0}}>
                    <span style={{fontSize:11,fontWeight:800,color:rankColor}}>🎁 {u.prize}</span>
                  </div>
                )}
                <span style={{fontSize:13,fontWeight:800,color:u.isMe?NAVY:"#888",flexShrink:0,marginLeft:4}}>{u.pts}p</span>
              </div>
            );
          })}
        </div>
      )}
      </div>
      </div>
    </div>

    {/* ── User Breakdown Bottom Sheet ── */}
    {selectedUser&&(
      <div style={{position:"fixed",inset:0,zIndex:1200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}
        onClick={()=>setSelectedUser(null)}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",animation:"fadeIn 0.2s ease forwards"}}/>
        <div onClick={e=>e.stopPropagation()}
          style={{position:"relative",background:"#fff",borderRadius:"20px 20px 0 0",
            maxHeight:"78vh",display:"flex",flexDirection:"column",
            boxShadow:"0 -4px 32px rgba(0,0,0,0.18)",
            animation:"slideUp 0.28s cubic-bezier(0.32,0.72,0,1) forwards"}}>
          {/* Handle */}
          <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0"}}>
            <div style={{width:36,height:4,borderRadius:2,background:"#E5E7EB"}}/>
          </div>
          {/* Header user */}
          <div style={{padding:"12px 20px 14px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:`${NAVY}15`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
              {selectedUser.avatarUrl
                ?<img src={selectedUser.avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                :<span style={{fontSize:14,fontWeight:800,color:NAVY}}>
                  {selectedUser.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?"}
                </span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:DARK}}>{selectedUser.name}</div>
              <div style={{fontSize:11,color:"#9CA3AF",fontWeight:500}}>#{selectedUser.rank}</div>
            </div>
            <div style={{fontSize:18,fontWeight:900,color:NAVY}}>{selectedUser.pts}p</div>
          </div>
          {/* Content */}
          <div style={{overflowY:"auto",flex:1,padding:"14px 20px 40px"}}>
            {breakdownLoading?(
              <div style={{display:"flex",justifyContent:"center",padding:"32px 0",color:"#9CA3AF",fontSize:13}}>
                <span style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${NAVY}22`,
                  borderTopColor:NAVY,animation:"spin 0.9s linear infinite",display:"inline-block",marginRight:8}}/>
                Se încarcă...
              </div>
            ):breakdown&&(()=>{
              const predTotal = breakdown.groups.reduce((s,g)=>s+g.pts,0);
              const exactTotal = breakdown.exact.reduce((s,m)=>s+m.pts,0);
              const hasGroups = breakdown.groups.length>0;
              const hasExact  = breakdown.exact.length>0;
              return (<>
                {/* Predictions section */}
                <div style={{border:`1.5px solid ${NAVY}22`,borderRadius:12,padding:"10px 12px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:hasGroups?8:0}}>
                    <span style={{fontSize:12,fontWeight:800,color:NAVY,textTransform:"uppercase",letterSpacing:1}}>🎯 Predictions</span>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                      <span style={{fontSize:13,fontWeight:800,color:NAVY}}>{predTotal}p</span>
                      <span style={{fontSize:9,color:"#9CA3AF",fontStyle:"italic",whiteSpace:"nowrap"}}>
                        {lang==="en"?"possible · at end of group":lang==="fr"?"possible · fin du groupe":"posibil · la final de grupă"}
                      </span>
                    </div>
                  </div>
                  {hasGroups&&breakdown.groups.map(g=>{
                    const hits = [
                      g.hit_1st ? `1.${tCode(g.hit_1st)}` : null,
                      g.hit_2nd ? `2.${tCode(g.hit_2nd)}` : null,
                      g.hit_3rd ? `3.${tCode(g.hit_3rd)}` : null,
                    ].filter(Boolean).join("  ");
                    return (
                      <div key={g.group_id} style={{display:"flex",justifyContent:"space-between",
                        alignItems:"center",padding:"5px 0",borderBottom:"1px solid #F9FAFB"}}>
                        <div style={{display:"flex",gap:10,alignItems:"center"}}>
                          <span style={{fontSize:11,fontWeight:700,color:"#6B7280",minWidth:46}}>Grp {g.group_id}</span>
                          <span style={{fontSize:12,fontWeight:600,color:DARK}}>{hits}</span>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:GREEN}}>{g.pts}p</span>
                      </div>
                    );
                  })}
                </div>
                {/* Exact Scores section */}
                <div style={{border:`1.5px solid ${NAVY}22`,borderRadius:12,padding:"10px 12px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hasExact?8:0}}>
                    <span style={{fontSize:12,fontWeight:800,color:NAVY,textTransform:"uppercase",letterSpacing:1}}>⚽ Exact Scores</span>
                    <span style={{fontSize:13,fontWeight:800,color:NAVY}}>{exactTotal}p</span>
                  </div>
                  {hasExact&&breakdown.exact.map(m=>{
                    const isExact = m.pred_home===m.actual_home && m.pred_away===m.actual_away;
                    return (
                      <div key={m.match_key} style={{display:"flex",justifyContent:"space-between",
                        alignItems:"flex-start",padding:"5px 0",borderBottom:"1px solid #F9FAFB"}}>
                        <div style={{display:"flex",flexDirection:"column",gap:2}}>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <span style={{fontSize:12,fontWeight:700,color:DARK}}>
                              {tCode(m.home_team)} {m.actual_home}-{m.actual_away} {tCode(m.away_team)}
                            </span>
                            {isExact&&<span style={{fontSize:9,fontWeight:800,color:"#fff",background:GREEN,
                              borderRadius:4,padding:"1px 5px",letterSpacing:0.5}}>EXACT</span>}
                          </div>
                          <span style={{fontSize:10,color:"#9CA3AF",fontWeight:600}}>
                            prezis: ({m.pred_home}-{m.pred_away})
                          </span>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:GREEN,paddingTop:1}}>{m.pts}p</span>
                      </div>
                    );
                  })}
                </div>
                {!hasGroups&&!hasExact&&(
                  <div style={{textAlign:"center",padding:"24px 0",color:"#9CA3AF",fontSize:13}}>
                    Niciun punct câștigat încă
                  </div>
                )}
                {/* Total */}
                {(hasGroups||hasExact)&&(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    borderTop:`2px solid ${NAVY}22`,paddingTop:10,marginTop:4}}>
                    <span style={{fontSize:13,fontWeight:800,color:DARK}}>Total</span>
                    <span style={{fontSize:15,fontWeight:900,color:NAVY}}>{predTotal+exactTotal}p</span>
                  </div>
                )}
              </>);
            })()}
          </div>
        </div>
      </div>
    )}
  </>);
}

function ScorePicker({ match, day, savedScore, onSave, onBack }) {
  const lang = useLang();
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
  const scorePanelStyle = { ...UI.card, padding:"14px", marginBottom:14 };
  const scoreLabelStyle = { ...UI.sectionLabel, fontWeight:750, margin:"0 0 10px" };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"14px 20px 16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div>
            <p style={{fontSize:11,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>EXACT SCORE · {day} IUNIE</p>
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
        <div style={scorePanelStyle}>
          <p style={scoreLabelStyle}>{T[lang].selectScore}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {presets.map(([h,a])=>{
              const sel = home===h&&away===a&&!custom;
              return (
                <button key={`${h}-${a}`} onClick={()=>select(h,a)}
                  style={{padding:"10px 4px",borderRadius:10,border:`1px solid ${sel?NAVY:"rgba(10,46,138,0.07)"}`,cursor:"pointer",
                    background:sel?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"#F8FAFC",
                    color:sel?"#fff":DARK,
                    boxShadow:sel?"0 3px 10px rgba(0,32,91,0.18)":"none",
                    fontSize:14,fontWeight:sel?800:600,transition:"all 0.15s"}}>
                  {h}-{a}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom score */}
        <div style={scorePanelStyle}>
          <p style={scoreLabelStyle}>{T[lang].customScore}</p>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="number" min="0" max="20" value={cHome}
              onChange={e=>{setCHome(e.target.value);setCustom(true);setHome(parseInt(e.target.value)||0);setAway(parseInt(cAway)||0);}}
              style={{flex:1,textAlign:"center",fontSize:20,fontWeight:800,color:NAVY,border:"1px solid rgba(10,46,138,0.07)",background:"#F8FAFC",borderRadius:10,padding:"10px",outline:"none"}}/>
            <span style={{fontSize:18,fontWeight:800,color:"#aaa"}}>-</span>
            <input type="number" min="0" max="20" value={cAway}
              onChange={e=>{setCHome(e.target.value);setCustom(true);setHome(parseInt(cHome)||0);setAway(parseInt(e.target.value)||0);}}
              style={{flex:1,textAlign:"center",fontSize:20,fontWeight:800,color:NAVY,border:"1px solid rgba(10,46,138,0.07)",background:"#F8FAFC",borderRadius:10,padding:"10px",outline:"none"}}/>
          </div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={onBack}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"1px solid rgba(10,46,138,0.07)",background:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",color:"#888"}}>
            ← Back
          </button>
          <button onClick={()=>confirmed&&onSave(home,away)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:confirmed?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"#e8e8e8",
              color:confirmed?"#fff":"#bbb",fontSize:12,fontWeight:700,
              cursor:confirmed?"pointer":"default",
              boxShadow:confirmed?"0 4px 12px rgba(0,32,91,0.18)":"none"}}>
            {T[lang].saveScore}
          </button>
        </div>
      </div>
    </div>
  );
}

const scH = (sc) => Array.isArray(sc) ? sc[0] : (sc?.home ?? 0);
const scA = (sc) => Array.isArray(sc) ? sc[1] : (sc?.away ?? 0);

function GroupsScheduleScreen({ onBack, scores: scoresProp, setScores: setScoresProp, simDay, simHour=12, simMin=0, initialWeek }) {
  const lang = useLang();
  const LIVE_SCORES = useLiveScores(simDay, simHour, simMin);
  const calendarEvents = getDisplayCalendarEvents();
  // Build GROUPS_DATA dynamically from CALENDAR_EVENTS
  const GROUPS_DATA = (() => {
    const gMap = {};
    calendarEvents.forEach(e => {
      e.matches.forEach(m => {
        if(!m.group || m.group.length > 1) return;
        if(!gMap[m.group]) gMap[m.group] = {};
        gMap[m.group][m.home] = m.homeFlag;
        gMap[m.group][m.away] = m.awayFlag;
      });
    });
    return Object.keys(gMap).sort().map(id => ({
      id,
      teams: Object.entries(gMap[id]).map(([name,flag])=>({name,flag}))
    }));
  })();

  // weeks: May 25-31 (−6), Jun 1-7 (1), then WC weeks
  const weeks = [-6,1,8,15,22,29,36,43];
  const mm0 = {};
  calendarEvents.forEach(e => { mm0[e.day] = e.matches; });
  // Find first WC match day (Jun 8+)
  const firstMatchDay = Array.from({length:7},(_,i)=>8+i).find(d=>!!mm0[d]) || null;
  const todayDay = simDay ?? getLocalTournamentDay();
  const todayHasMatches = !!mm0[todayDay];
  const defaultDay = todayDay;
  // Auto-select the week that contains today (pre-WC weeks included)
  const defaultWeek = initialWeek || [-6,1,8,15,22,29].find(w=>todayDay>=w&&todayDay<=w+6) || -6;
  const [weekStart, setWeekStart] = useState(defaultWeek);
  useEffect(()=>{
    if(initialWeek) {
      setWeekStart(initialWeek);
      const mm_ = {};
      calendarEvents.forEach(e => { mm_[e.day] = e.matches; });
      const wDays = Array.from({length:7},(_,i)=>initialWeek+i);
      // Selectăm ziua de azi dacă e în săptămână (cu sau fără meciuri), altfel prima zi cu meciuri
      const todayInWeek = wDays.find(d => d === todayDay);
      const firstDay = todayInWeek ?? wDays.find(d=>!!mm_[d]) ?? wDays[0];
      setSelDay(firstDay);
    }
  },[initialWeek]);
  const [selGroup, setSelGroup] = useState(null);
  const [selDay, setSelDay] = useState(defaultDay);
  const [scores, _setScores] = useState(scoresProp||{});
  const [_v, _setV] = useState(0); // version counter to force re-render
  const setScores = (updater) => {
    _setScores(prev => {
      const next = typeof updater==="function"?updater(prev):updater;
      if(setScoresProp) setScoresProp(next);
      return next;
    });
    _setV(v=>v+1);
  };
  const [scorePick, setScorePick] = useState(null);
  const [showReal, setShowReal] = useState(true);
  const [showStanding, setShowStanding] = useState(false);
  const [pickerHome, setPickerHome] = useState(0);
  const [pickerAway, setPickerAway] = useState(0);

  const homeRef = useRef(null);
  const awayRef = useRef(null);
  const exactScrollRef = useRef(null);

  useEffect(()=>{
    if(scorePick){
      const saved = scores[scorePick.key];
      const h = saved ? (Array.isArray(saved) ? saved[0] : (saved.home ?? 0)) : 0;
      const a = saved ? (Array.isArray(saved) ? saved[1] : (saved.away ?? 0)) : 0;
      setPickerHome(h);
      setPickerAway(a);
      // Scroll to correct position after render
      setTimeout(()=>{
        if(homeRef.current) homeRef.current.scrollTop = h*52;
        if(awayRef.current) awayRef.current.scrollTop = a*52;
      }, 50);
    }
  },[scorePick]);
  const weekIdx = weeks.indexOf(weekStart);

  const getGroupsForDays = (days) => {
    const groups = new Set();
    calendarEvents.forEach(e => {
      if(days.includes(e.day)) e.matches.forEach(m => { if(m.group) groups.add(m.group); });
    });
    return [...groups].sort();
  };

  const weekDays = Array.from({length:7},(_,i)=>weekStart+i).filter(d=>d>=1&&d<=50);
  const activeGroups = getGroupsForDays(weekDays);
  // When day selected: show only groups playing that day (but don't lock others in week)
  const displayGroups = activeGroups; // groups available = all with matches this week
  const highlightGroups = selDay ? getGroupsForDays([selDay]) : activeGroups; // groups to highlight

  const handleWeekChange = (w) => {
    setWeekStart(w); setSelGroup(null);
    const wDays = Array.from({length:7},(_,i)=>w+i);
    const ag = getGroupsForDays(wDays);
    if(ag.length>0) {
      const koGroup = ag.find(g=>["R16","QF","SF","3rd","Final"].includes(g));
      setSelGroup(koGroup || ag[0]);
    }
    // Dreapta → prima zi din săptămână, Stânga → ultima zi
    const goingForward = w > weekStart;
    setSelDay(goingForward ? wDays[0] : wDays[wDays.length-1]);
  };

  const handleDaySelect = (day) => {
    if(selDay===day){
      setShowStanding(false);
      return;
    }
    setSelDay(day);
    setShowStanding(false);
    const dg = getGroupsForDays([day]);
    if(dg.length>0) {
      // If day has KO matches, auto-select that KO stage
      const koGroup = dg.find(g=>["R16","QF","SF","3rd","Final"].includes(g));
      setSelGroup(koGroup || dg[0]);
    }
  };

  if(selGroup===null && activeGroups.length>0) setSelGroup(activeGroups[0]);

  const cur = GROUPS_DATA.find(g=>g.id===selGroup)||GROUPS_DATA[0];
  const isGroupLocked = (gid) => !activeGroups.includes(gid);

  // Compute standing from saved scores for current group
  const mm = {};
  calendarEvents.forEach(e => { mm[e.day] = e.matches; });
  const groupMatches = [];
  calendarEvents.forEach(e => {
    e.matches.forEach((m,idx) => {
      if(m.group===selGroup)
        groupMatches.push({...m, day:e.day, idx, key:getMatchKey(m,e.day,idx)});
    });
  });

  // Compute standings from predicted scores
  const standing = cur.teams.map(t=>({name:t.name,flag:t.flag,pts:0,gf:0,ga:0,gd:0,p:0}));
  groupMatches.forEach(m=>{
    const sc = scores[m.key];
    if(!sc) return;
    const h = scH(sc); const a = scA(sc);
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

  const wDaysHeader = Array.from({length:7},(_,i)=>weekStart+i);
  const weekTotal = wDaysHeader.reduce((s,d)=>s+(mm0[d]||[]).length,0);
  const weekScored = wDaysHeader.reduce((s,d)=>s+(mm0[d]||[]).filter((m,i)=>scores[getMatchKey(m,d,i)]).length,0);
  const weekRemaining = weekTotal - weekScored;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{background:"rgba(0,32,91,0.88)",flexShrink:0,position:"relative",zIndex:1,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"28px 14px 28px"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:10,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>‹</button>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{T[lang].exactScores}</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0,minWidth:34}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{weekScored}/{weekTotal}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>{weekRemaining===0?"complete":`${weekRemaining} left`}</div>
          </div>
        </div>
      </div>

      <div ref={exactScrollRef} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"14px 14px 130px",position:"relative",zIndex:1}}>
        {/* Weekly Calendar with clickable matches */}
        <WeeklyCalendar weekStart={weekStart} setWeekStart={handleWeekChange} weeks={weeks} weekIdx={weekIdx}
          selDay={selDay} onDaySelect={handleDaySelect} scores={scores} scoresVersion={_v}
          showStanding={showStanding} setShowStanding={setShowStanding}
          selGroup={selGroup} setSelGroup={setSelGroup}
          GROUPS_DATA={GROUPS_DATA} showReal={showReal} setShowReal={setShowReal}
          standing={standing} isGroupLocked={isGroupLocked} simDay={simDay} simHour={simHour} simMin={simMin}
          liveScores={LIVE_SCORES}
          onMatchClick={(match,day,idx)=>{
            if(!isWeekUnlocked(day, simDay, simHour, simMin)) return;
            // UCL Final (day -1): allow prediction before kickoff only
            const isUCL = match.group==="UCL";
            if(!isUCL && isMatchPast(day, match.time, simDay, simHour, match.kickoffUtc)) return;
            if(isUCL && isMatchPast(day, match.time, null, null, match.kickoffUtc)) return;
            setScorePick({match,day,idx,key:getMatchKey(match,day,idx)});
          }}/>



        {false && !isGroupLocked(selGroup) && (
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
                      Group {selGroup} · {showReal?"Real Standings":"Predicted"}
                    </p>
                    {hasReal&&(
                      <div style={{display:"flex",background:BG,borderRadius:20,boxShadow:SHADOW_OUT,padding:"2px"}}>
                        <button onClick={()=>setShowReal(true)} style={{padding:"4px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:showReal?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"transparent",color:showReal?"#fff":"#aaa"}}>{T[lang].realLabel}</button>
                        <button onClick={()=>setShowReal(false)} style={{padding:"4px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:!showReal?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"transparent",color:!showReal?"#fff":"#aaa"}}>{T[lang].predictedLabel}</button>
                      </div>
                    )}
                  </div>
                  <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",padding:"6px 14px",background:"rgba(0,0,0,0.03)",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:18}}>#</span>
                      <span style={{flex:1,fontSize:11,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{T[lang].groupTeams}</span>
                      <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:22,textAlign:"center"}}>J</span>
                      <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:22,textAlign:"center"}}>G</span>
                      <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:28,textAlign:"center"}}>GD</span>
                      <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:26,textAlign:"center"}}>Pts</span>
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
              {T[lang].tabMatches} · Group {selGroup}
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {groupMatches.length===0 ? (
                <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"16px",textAlign:"center",color:"#aaa",fontSize:12}}>{T[lang].noMatchesScheduled}</div>
              ) : groupMatches.map((m,i)=>{
                const sc = scores[m.key];
                const live = LIVE_SCORES[m.key];
                const inCurrentWeek = weekDays.includes(m.day);
                // Compute status from sim time
                const matchH = parseInt((m.time||"23:00").split(":")[0]);
                const matchMin2 = parseInt((m.time||"00:00").split(":")[1]||0);
                const nowDay2 = simDay ?? getRealTournamentDay();
                // In non-sim mode: convert current time to ET (UTC-4) so it matches match schedule timezone
                const _etNow  = simDay!=null ? null : new Date(Date.now() - ET_OFFSET_MS);
                const nowH2   = simDay!=null ? (simHour||0) : _etNow.getUTCHours();
                const nowM2   = simDay!=null ? (simMin||0)  : _etNow.getUTCMinutes();
                const nowMins2 = nowH2*60 + nowM2;
                const kickMins2 = matchH*60 + matchMin2;
                const isSimMode = simDay != null;
                const isFinished = live?.status==="FT" || (isSimMode && (m.day < nowDay2 || (m.day===nowDay2 && nowMins2 > kickMins2+115)));
                const isLive = !isFinished && (isLiveScoreStatus(live?.status) || (isSimMode && !live?.status && m.day===nowDay2 && nowMins2>=kickMins2 && nowMins2<=kickMins2+115));
                const isNS = !isFinished && !isLive;
                // Minute: 1) api_minute from API  2) elapsed from utcDate  3) local ET estimate
                const liveMin = isLive ? (
                  live?.min != null ? live.min :
                  live?.utcDate ? Math.min(90, Math.floor((Date.now() - Date.parse(live.utcDate)) / 60000)) :
                  live?.status || !isSimMode ? null :
                  Math.min(90, nowMins2-kickMins2)
                ) : 0;
                const hasLive = live && live.home !== undefined && live.home !== null;

                // Check prediction accuracy
                let exactMatch = false, resultMatch = false;
                if(sc && hasLive && isFinished) {
                  exactMatch = scH(sc)===live.home && scA(sc)===live.away;
                  const predResult = scH(sc)>scA(sc)?"H":scH(sc)<scA(sc)?"A":"D";
                  const realResult = live.home>live.away?"H":live.home<live.away?"A":"D";
                  resultMatch = predResult===realResult;
                }

                return (
                  <div key={m.key} style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
                    {/* Status bar */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"5px 12px",
                      background:isLive?"rgba(0,32,91,0.06)":isFinished?"rgba(0,154,68,0.06)":"rgba(0,0,0,0.03)"}}>
                      <span style={{fontSize:11,color:"#aaa",fontWeight:600}}>{getLocalKickoffDay(m.kickoffUtc,m.day)} June · {fmtMatchTime(m.day, m.time, m.kickoffUtc)}</span>
                      {isLive&&<span style={{fontSize:11,fontWeight:800,color:RED,display:"flex",alignItems:"center",gap:3}}>
                        <span style={{width:6,height:6,borderRadius:"50%",background:RED,display:"inline-block"}}/>
                        {liveScorePhaseLabel(live?.status, liveMin)}
                      </span>}
                      {isFinished&&<span style={{fontSize:11,fontWeight:700,color:GREEN}}>FT</span>}
                      {isNS&&<span style={{fontSize:11,fontWeight:600,color:"#bbb"}}>{T[lang].notStarted}</span>}
                    </div>

                    {/* Main match row */}
                    <div style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {/* Home */}
                        <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:20}}>{m.homeFlag}</span>
                          <span style={{fontSize:11,fontWeight:600,color:DARK}}>{m.home.length>8?m.home.split(" ")[0]:m.home}</span>
                        </div>

                        {/* Scores — compact single center block */}
                        {(()=>{
                          const isPast = isMatchPast(m.day, m.time, simDay, simHour, m.kickoffUtc);
                          const canPredict = !isLive && !isFinished && !isPast && isWeekUnlocked(m.day, simDay, simHour, simMin);
                          const scoreDisplay = hasLive ? `${live.home}-${live.away}` : isSimMode && isLive ? "0-0" : "-";
                          const penDisplay = penaltyScoreLabel(live);
                          const predBox = (isPast||isLive||isFinished) ? (sc ? (
                            isLive ? (
                              <div style={{background:"rgba(0,0,0,0.06)",borderRadius:6,padding:"3px 8px"}}>
                                <span style={{fontSize:11,fontWeight:900,color:RED,}}>{scH(sc)}-{scA(sc)}</span>
                              </div>
                            ) : (
                            <div style={{background:exactMatch?`linear-gradient(135deg,${GREEN},#007A36)`:resultMatch?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:`linear-gradient(135deg,${RED},#EF3340)`,
                              borderRadius:6,padding:"3px 8px",display:"flex",alignItems:"center",gap:3}}>
                              <span style={{fontSize:11,fontWeight:900,color:"#fff"}}>{scH(sc)}-{scA(sc)}</span>
                              {isFinished&&(exactMatch?<span style={{fontSize:11}}>🎯</span>:resultMatch?<span style={{fontSize:11}}>✓</span>:<span style={{fontSize:11}}>✗</span>)}
                            </div>)
                          ) : (
                            <div style={{background:"rgba(0,0,0,0.06)",borderRadius:6,padding:"3px 8px"}}>
                              <span style={{fontSize:11,fontWeight:700,color:"#ccc"}}>?-?</span>
                            </div>
                          )) : canPredict && !isMatchPast(m.day, m.time, simDay, simHour, m.kickoffUtc) ? (
                            <div onClick={()=>setScorePick({match:m,day:m.day,idx:m.idx,key:m.key})}
                              style={{background:`linear-gradient(135deg,${RED},${GREEN})`,borderRadius:6,padding:"3px 8px",cursor:"pointer"}}>
                              <span style={{fontSize:12,color:"#fff",fontWeight:700}}>+ scor</span>
                            </div>
                          ) : (
                            <div style={{background:"rgba(0,0,0,0.06)",borderRadius:6,padding:"3px 8px"}}>
                              <span style={{fontSize:11,color:"#ccc"}}>🔒</span>
                            </div>
                          );
                          return (
                            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:70}}>
                              {/* Real score */}
                              {isLive&&<span style={{fontSize:9,fontWeight:900,color:RED}}>●</span>}
                              <div style={{background:isFinished?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"rgba(0,0,0,0.06)",
                                borderRadius:8,padding:"5px 12px",width:"100%",textAlign:"center"}}>
                                <span style={{fontSize:14,fontWeight:900,color:isLive?RED:hasLive?"#fff":"#bbb"}}>{scoreDisplay}</span>
                              </div>
                              {penDisplay&&<span style={{fontSize:10,fontWeight:900,color:RED,lineHeight:1}}>{penDisplay}</span>}
                              {/* Prediction */}
                              <div style={{display:"flex",alignItems:"center",gap:4}}>
                                <span style={{fontSize:11,color:"#bbb",fontWeight:600}}>tu:</span>
                                {predBox}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Away */}
                        <div style={{flex:1,display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
                          <span style={{fontSize:11,fontWeight:600,color:DARK,textAlign:"right"}}>{m.away.length>8?m.away.split(" ")[0]:m.away}</span>
                          <span style={{fontSize:20}}>{m.awayFlag}</span>
                        </div>
                      </div>

                      {/* Points earned */}
                      {(isFinished || isMatchPast(m.day, m.time, simDay, simHour, m.kickoffUtc)) && (
                        <div style={{marginTop:6,display:"flex",justifyContent:"center"}}>
                          <div style={{background:exactMatch?"rgba(0,154,68,0.1)":resultMatch?"rgba(0,32,91,0.07)":"rgba(200,16,46,0.08)",
                            borderRadius:20,padding:"3px 12px",display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:12,fontWeight:700,
                              color:exactMatch?GREEN:resultMatch?NAVY:RED}}>
                              {exactMatch?"🎯 +90 pts · Scor exact":resultMatch?"✓ +30 pts · Rezultat corect":"✗ +0 pts"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Edit prediction */}
                    {!isMatchPast(m.day, m.time, simDay, simHour, m.kickoffUtc) && !isLive && !isFinished && sc && isWeekUnlocked(m.day, simDay, simHour, simMin) && todaySim <= m.day && (
                      <button onClick={()=>setScorePick({match:m,day:m.day,idx:m.idx,key:m.key})}
                        style={{width:"100%",padding:"6px 12px",borderTop:"1px solid rgba(0,0,0,0.05)",
                          background:"none",border:"none",borderTop:"1px solid rgba(0,0,0,0.05)",
                          display:"flex",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                        <span style={{fontSize:12,color:"#bbb",fontWeight:600}}>✏️ Edit Prediction</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Score Picker Modal */}
      {scorePick&&(
        <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",flexDirection:"column",justifyContent:"flex-end",touchAction:"none",overscrollBehavior:"none"}}
          onClick={()=>setScorePick(null)}
          onWheel={e=>e.stopPropagation()}
          onTouchMove={e=>e.stopPropagation()}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/>
          <div onClick={e=>e.stopPropagation()}
            style={{position:"relative",background:"#1C1C1E",borderRadius:"20px 20px 0 0",padding:"0 0 34px",zIndex:1}}>
            <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0",touchAction:"none"}}
              onTouchStart={e=>{ e.currentTarget._y0=e.touches[0].clientY; }}
              onTouchMove={e=>{
                const dy=e.touches[0].clientY-e.currentTarget._y0;
                if(dy>0){ const sheet=e.currentTarget.parentElement; sheet.style.transform=`translateY(${dy}px)`; sheet.style.transition="none"; }
              }}
              onTouchEnd={e=>{
                const dy=e.changedTouches[0].clientY-e.currentTarget._y0;
                const sheet=e.currentTarget.parentElement;
                sheet.style.transition="transform 0.3s";
                sheet.style.transform="";
                if(dy>80) setScorePick(null);
              }}>
              <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.35)",marginBottom:6}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px 8px"}}>
              <button onClick={()=>setScorePick(null)}
                style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:10,padding:"6px 14px",color:"rgba(255,255,255,0.6)",fontSize:13,cursor:"pointer"}}>
                Cancel
              </button>
              <div style={{textAlign:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:26}}>{scorePick.match.homeFlag}</span>
                  <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)"}}>VS</span>
                  <span style={{fontSize:26}}>{scorePick.match.awayFlag}</span>
                </div>
                <p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:"2px 0 0"}}>{scorePick.match.home} · {scorePick.match.away}</p>
              </div>
              <button onClick={()=>{
                // Read scroll position directly from refs at save time
                const h = homeRef.current ? Math.max(0,Math.min(9,Math.round(homeRef.current.scrollTop/52))) : pickerHome;
                const a = awayRef.current ? Math.max(0,Math.min(9,Math.round(awayRef.current.scrollTop/52))) : pickerAway;
                setScores(s=>({...s,[scorePick.key]:{home:h,away:a}}));
                const _day = scorePick.day;
                const _idx = scorePick.idx;
                const _dayMatches = mm0[_day]||[];
                setScorePick(null);
                // Scroll to next unscored match (only if day has more than 2 matches)
                setTimeout(()=>{
                  if(_dayMatches.length<=2) return;
                  let nextKey=null;
                  for(let i=_idx+1;i<_dayMatches.length;i++){
                    const candidateKey = getMatchKey(_dayMatches[i], _day, i);
                    if(!scores[candidateKey]){ nextKey=candidateKey; break; }
                  }
                  if(!nextKey) return;
                  const container=exactScrollRef.current;
                  const el=container?.querySelector(`[data-match-key="${nextKey}"]`);
                  if(!el||!container) return;
                  const diff=el.getBoundingClientRect().top-container.getBoundingClientRect().top;
                  container.scrollBy({top:diff-80,behavior:'smooth'});
                },350);
              }}
                style={{background:"#FF9500",border:"none",borderRadius:10,padding:"6px 14px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                ✓ Save
              </button>
            </div>
            <div style={{textAlign:"center",padding:"4px 0 8px"}}>
              <span style={{fontSize:38,fontWeight:900,color:"#fff",letterSpacing:6}}>{pickerHome} - {pickerAway}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"0 20px",position:"relative"}}>
              <div style={{position:"absolute",left:20,right:20,top:"50%",transform:"translateY(-50%)",height:52,background:"rgba(255,255,255,0.08)",borderRadius:12,pointerEvents:"none"}}/>
              <div ref={homeRef} style={{flex:1,height:200,overflowY:"auto",scrollSnapType:"y mandatory",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}
                onScroll={e=>setPickerHome(Math.max(0,Math.min(9,Math.round(e.target.scrollTop/52))))}>
                <div style={{height:74}}/>
                {[0,1,2,3,4,5,6,7,8,9].map(n=>(
                  <div key={n} style={{height:52,display:"flex",alignItems:"center",justifyContent:"center",scrollSnapAlign:"center"}}>
                    <span style={{fontSize:30,fontWeight:700,color:pickerHome===n?"#fff":"rgba(255,255,255,0.2)"}}>{n}</span>
                  </div>
                ))}
                <div style={{height:74}}/>
              </div>
              <span style={{fontSize:34,fontWeight:900,color:"rgba(255,255,255,0.4)",padding:"0 20px",flexShrink:0}}>-</span>
              <div ref={awayRef} style={{flex:1,height:200,overflowY:"auto",scrollSnapType:"y mandatory",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}
                onScroll={e=>setPickerAway(Math.max(0,Math.min(9,Math.round(e.target.scrollTop/52))))}>
                <div style={{height:74}}/>
                {[0,1,2,3,4,5,6,7,8,9].map(n=>(
                  <div key={n} style={{height:52,display:"flex",alignItems:"center",justifyContent:"center",scrollSnapAlign:"center"}}>
                    <span style={{fontSize:30,fontWeight:700,color:pickerAway===n?"#fff":"rgba(255,255,255,0.2)"}}>{n}</span>
                  </div>
                ))}
                <div style={{height:74}}/>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyCalendar({ weekStart, setWeekStart, weeks, weekIdx, selDay, onDaySelect, scores, onMatchClick, showStanding, setShowStanding, selGroup, setSelGroup, GROUPS_DATA, showReal, setShowReal, standing, isGroupLocked, simDay, simHour=12, simMin=0, liveScores, scoresVersion }) {
  const lang = useLang();
  const LIVE_SCORES = liveScores || LIVE_SCORES_DEFAULT;
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const calendarEvents = getDisplayCalendarEvents();
  const mm = {};
  calendarEvents.forEach(e => { mm[e.day] = e.matches; });
  const dl = ["L","M","M","J","V","S","D"];
  const days = Array.from({length:7},(_,i)=>weekStart+i);
  const sel = selDay !== undefined ? selDay : null;
  const sm = (sel !== null && sel !== undefined && mm[sel]) ? mm[sel] : null;
  const weekEnd = weekStart+6;
  const weekLabel = `${toLabel(weekStart)} – ${toLabel(weekEnd)}`;
  const weekMonthLabel = weekStart<=0?"May 2026":weekEnd>30?"July 2026":"June 2026";

  return (
    <div style={{marginBottom:4}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>weekIdx>0&&setWeekStart(weeks[weekIdx-1])}
          style={{width:30,height:30,borderRadius:"50%",border:"none",background:weekIdx>0?BG:"transparent",
            boxShadow:weekIdx>0?SHADOW_OUT:"none",cursor:weekIdx>0?"pointer":"default",
            fontSize:16,color:weekIdx>0?DARK:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{weekLabel}</p>
          <span style={{fontSize:12,color:NAVY,fontWeight:700}}>{weekMonthLabel} · Predicto</span>
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
        {dl.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:12,fontWeight:700,color:i===6?RED:"#bbb"}}>{d}</div>)}
      </div>
      {[0,1].map(week=>(
      <div key={week} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {days.slice(week*7,(week+1)*7).map((day,i)=>{
          const isS=day===11,has=!!mm[day],isSel=sel===day,isSun=i%7===6;
          const today = simDay ?? getLocalTournamentDay();
          const isPast = has && day < today;
          const isToday2 = day === today;
          const locked = has && !isWeekUnlocked(day, simDay, simHour, simMin);
          const dayMatches = mm[day]||[];
          const allPredicted = has && !locked && !isPast && dayMatches.length>0 && dayMatches.every((m,idx)=>scores&&scores[getMatchKey(m,day,idx)]);
          let bg="transparent",border="1.5px solid transparent",shadow="none";
          let tc=isSun?RED:"#777",fw=400;
          if(isSel&&allPredicted&&!isPast){bg="#EEF3FF";border=`1.5px solid ${NAVY}`;tc=GREEN;fw=800;}
          else if(isSel&&isPast){bg="#f0f0f0";border="1.5px solid #ccc";tc="#888";fw=800;}
          else if(isSel){bg="#EEF3FF";border=`1.5px solid ${NAVY}`;tc=NAVY;fw=800;}
          else if(allPredicted){tc=GREEN;fw=700;}
          else if(isToday2&&has&&!isSel){fw=800;tc=NAVY;}
          else if(isPast&&has){fw=700;tc="#ccc";}
          else if(has&&!locked){fw=700;tc=DARK;}
          else if(locked){tc="#bbb";}
          return (
            <div key={day} onClick={()=>onDaySelect&&onDaySelect(day)}
              style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",borderRadius:10,padding:"8px 2px",
                cursor:"pointer",background:bg,border,boxShadow:shadow,transition:"all 0.15s",
                opacity:locked?0.6:1}}>
              <span style={{fontSize:13,fontWeight:fw,color:tc,lineHeight:1}}>{day<=0?day+31:day>30?day-30:day}</span>
              {has&&(
                locked
                  ? <span style={{fontSize:11,lineHeight:1,marginTop:2}}>🔒</span>
                  : allPredicted
                    ? <span style={{fontSize:10,color:GREEN,fontWeight:900,marginTop:2,lineHeight:1}}>✓</span>
                    : <div style={{width:4,height:4,borderRadius:"50%",background:isPast?"#ccc":isS?NAVY:RED,marginTop:3}}/>
              )}
              {isS&&!isSel&&!allPredicted&&<div style={{position:"absolute",top:-6,right:-2,background:RED,borderRadius:4,padding:"1px 4px",fontSize:9,fontWeight:800,color:"#fff"}}>START</div>}
            </div>
          );
        })}
      </div>
      ))}
      {sm&&(
        <div style={{marginTop:10}}>
          {(()=>{
            const groups = [...new Set(sm.map(m=>m.group))].filter(Boolean);
            const LETTER_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
            const KO_STAGES = ["R16","QF","SF","3rd","Final"];
            const isUCLDay = groups.length===1 && groups[0]==="UCL";
            const hasGroupMatches = groups.some(g=>LETTER_GROUPS.includes(g));
            const activeGrp = selGroup || (hasGroupMatches ? groups.find(g=>LETTER_GROUPS.includes(g)) : groups.find(g=>KO_STAGES.includes(g))) || groups[0] || "A";
            const activeStage = LETTER_GROUPS.includes(activeGrp) ? "Groups" : (KO_STAGES.includes(activeGrp) ? activeGrp : (hasGroupMatches ? "Groups" : "R16"));
            const handleStageClick = (stage) => {
              if(stage==="Groups") setSelGroup(groups.find(g=>LETTER_GROUPS.includes(g))||"A");
              else setSelGroup(stage);
            };
            const selDateLabel = sel!==null && sel!==undefined ? toLabel(sel) : "";
            const headerBg = isUCLDay
              ? "linear-gradient(135deg,#0a1a4a,#0d2070)"
              : `linear-gradient(135deg,${NAVY}cc,#001840cc)`;
            return (
              <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
                {/* Header */}
                <div style={{background:headerBg,padding:"8px 14px 0"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <span style={{fontSize:12,fontWeight:800,color:isUCLDay?"#FFD700":"#fff"}}>
                      {isUCLDay?"🏆 UCL Final":""}{!isUCLDay&&`${selDateLabel} · ${sm.length} ${sm.length===1?T[lang].matchSingular:T[lang].matchPlural}`}
                    </span>
                    {!isUCLDay && <div style={{display:"flex",background:"rgba(255,255,255,0.12)",borderRadius:20,padding:"2px",gap:0}}>
                      <button onClick={()=>setShowStanding(false)}
                        style={{padding:"4px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                          background:!showStanding?"rgba(255,255,255,0.95)":"transparent",
                          color:!showStanding?NAVY:"rgba(255,255,255,0.6)",transition:"all 0.2s"}}>
                        <span style={{colorScheme:"light",filter:"saturate(0) contrast(3) brightness(1.1)"}}>⚽</span> {T[lang].tabMatches}
                      </button>
                      <button onClick={()=>setShowStanding(true)}
                        style={{padding:"4px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                          background:showStanding?"rgba(255,255,255,0.95)":"transparent",
                          color:showStanding?NAVY:"rgba(255,255,255,0.6)",transition:"all 0.2s"}}>
                        📊 {T[lang].tabStanding}
                      </button>
                    </div>}
                  </div>
                  {!isUCLDay && <div style={{height:1,background:"rgba(255,255,255,0.2)",marginTop:4}}/>}
                  {!isUCLDay && showStanding && <>
                    {/* Nivel 1: etape campionat */}
                    <div style={{display:"flex",gap:5,padding:"10px 0 6px",alignItems:"center"}}>
                      {/* Groups tab */}
                      {(()=>{
                        const isActive = activeStage==="Groups";
                        return (
                          <button onClick={()=>handleStageClick("Groups")} style={{
                            flexShrink:0, height:34, borderRadius:9, padding:"0 14px",
                            background:isActive?"#fff":hasGroupMatches?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.1)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:13, fontWeight:900, border:"none",
                            color:isActive?NAVY:"rgba(255,255,255,0.75)",
                            cursor:"pointer", position:"relative",
                            boxShadow:isActive?"0 2px 10px rgba(0,0,0,0.3)":"none",
                            transition:"all 0.22s", WebkitTapHighlightColor:"transparent",
                          }}>
                            Grupe
                          </button>
                        );
                      })()}
                      {/* KO stage tabs */}
                      {[{id:"R16",label:"R16"},{id:"QF",label:"QF"},{id:"SF",label:"SF"},{id:"3rd",label:"3rd"},{id:"Final",label:"🏆"}].map(s=>{
                        const isActive = activeStage===s.id;
                        const hasMatchToday = groups.includes(s.id);
                        return (
                          <button key={s.id} onClick={()=>handleStageClick(s.id)} style={{
                            flexShrink:0, width:44, height:34, borderRadius:9,
                            background:isActive?"#fff":hasMatchToday?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.1)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:isActive?13:11, fontWeight:900, border:"none",
                            color:isActive?NAVY:"rgba(255,255,255,0.75)",
                            cursor:"pointer",
                            boxShadow:isActive?"0 2px 10px rgba(0,0,0,0.3)":"none",
                            transition:"all 0.22s", WebkitTapHighlightColor:"transparent",
                          }}>
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                    {/* Nivel 2: slider grupe A-L (doar când e selectat Groups) */}
                    {activeStage==="Groups" && (
                      <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",padding:"0 0 10px",alignItems:"center"}}>
                        {LETTER_GROUPS.map(g=>{
                          const hasMatchToday = groups.includes(g);
                          const isActive = activeGrp===g;
                          return (
                            <button key={g} onClick={()=>setSelGroup(g)} style={{
                              flexShrink:0, width:38, height:34, borderRadius:9,
                              background:isActive?"#fff":hasMatchToday?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.1)",
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:isActive?15:12, fontWeight:900, border:"none",
                              color:isActive?NAVY:"rgba(255,255,255,0.75)",
                              cursor:"pointer", position:"relative",
                              boxShadow:isActive?"0 2px 10px rgba(0,0,0,0.3)":"none",
                              transition:"all 0.22s", WebkitTapHighlightColor:"transparent",
                            }}>
                              {g}
                              {hasMatchToday&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:5,height:5,borderRadius:"50%",background:isActive?NAVY:"rgba(255,255,255,0.5)"}}/>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div style={{height:1,background:"rgba(255,255,255,0.15)"}}/>
                  </>}
                </div>

                {!isUCLDay && showStanding ? (
                  /* Standing panel */
                  <div style={{padding:"12px 14px"}}>
                    {["R16","QF","SF","3rd","Final"].includes(activeGrp) ? (
                      <div style={{display:"flex",flexDirection:"column",gap:12}}>
                        {(()=>{
                          const stageColors = {R16:"#5856D6",QF:"#FF9500",SF:RED,"3rd":"#8E8E93",Final:GREEN};
                          const stageIcons  = {R16:"⚡",QF:"🏅",SF:"🥈","3rd":"🥉",Final:"🏆"};
                          const color = stageColors[activeGrp]||NAVY;
                          const icon  = stageIcons[activeGrp]||"🏆";

                          // Groups of 2 matches that feed into same next match
                          const groups = {
                            R16: [
                              {matches:[{h:"1A",a:"2B"},{h:"1C",a:"2D"}], next:"QF Match 1"},
                              {matches:[{h:"1E",a:"2F"},{h:"1G",a:"2H"}], next:"QF Match 2"},
                              {matches:[{h:"1B",a:"2A"},{h:"1D",a:"2C"}], next:"QF Match 3"},
                              {matches:[{h:"1F",a:"2E"},{h:"1H",a:"2G"}], next:"QF Match 4"},
                            ],
                            QF: [
                              {matches:[{h:"W R16-1",a:"W R16-2"},{h:"W R16-3",a:"W R16-4"}], next:"SF Match 1"},
                              {matches:[{h:"W R16-5",a:"W R16-6"},{h:"W R16-7",a:"W R16-8"}], next:"SF Match 2"},
                            ],
                            SF: [
                              {matches:[{h:"W QF-1",a:"W QF-2"},{h:"W QF-3",a:"W QF-4"}], next:"🏆 Final"},
                            ],
                            "3rd": [
                              {matches:[
                                {h:"W QF-1",a:"W QF-2",grayed:true},
                                {h:"W QF-3",a:"W QF-4",grayed:true},
                              ], next:null, finalMatch:{h:"L SF-1",a:"L SF-2"}, label:"3rd Place Match"},
                            ],
                            Final: [
                              {matches:[
                                {h:"W QF-1",a:"W QF-2",grayed:true},
                                {h:"W QF-3",a:"W QF-4",grayed:true},
                              ], next:null, finalMatch:{h:"W SF-1",a:"W SF-2"}, label:"Grand Final"},
                            ],
                          };

                          const MatchBox = ({h,a,col,grayed}) => (
                            <div style={{background:grayed?"rgba(0,0,0,0.03)":"#fff",borderRadius:8,
                              border:`1px solid ${grayed?"#ddd":col+"33"}`,overflow:"hidden",minWidth:130,
                              opacity:grayed?0.5:1}}>
                              <div style={{padding:"6px 10px",borderBottom:`1px solid rgba(0,0,0,0.05)`}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{width:18,height:18,borderRadius:4,background:grayed?"#eee":`${col}22`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                    <span style={{fontSize:10,fontWeight:800,color:grayed?"#bbb":col}}>?</span>
                                  </div>
                                  <span style={{fontSize:12,fontWeight:600,color:grayed?"#bbb":DARK}}>{h}</span>
                                </div>
                              </div>
                              <div style={{padding:"6px 10px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{width:18,height:18,borderRadius:4,background:grayed?"#eee":`${col}22`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                    <span style={{fontSize:10,fontWeight:800,color:grayed?"#bbb":col}}>?</span>
                                  </div>
                                  <span style={{fontSize:12,fontWeight:600,color:grayed?"#bbb":DARK}}>{a}</span>
                                </div>
                              </div>
                            </div>
                          );

                          const NextBox = ({label,col}) => (
                            <div style={{background:`${col}15`,borderRadius:8,border:`1.5px dashed ${col}`,
                              padding:"8px 10px",minWidth:80,textAlign:"center"}}>
                              <span style={{fontSize:11,color:"#bbb",display:"block"}}>{T[lang].winner}</span>
                              <span style={{fontSize:12,fontWeight:800,color:col}}>{label}</span>
                              <div style={{marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                                <div style={{width:20,height:20,borderRadius:5,background:"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  <span style={{fontSize:11,color:"#bbb",fontWeight:700}}>??</span>
                                </div>
                                <span style={{fontSize:11,color:"#bbb"}}>vs</span>
                                <div style={{width:20,height:20,borderRadius:5,background:"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  <span style={{fontSize:11,color:"#bbb",fontWeight:700}}>??</span>
                                </div>
                              </div>
                            </div>
                          );

                          // KO matches from calendar
                          const koMatches = [];
                          calendarEvents.forEach(e=>{
                            e.matches.forEach((m,idx)=>{
                              if(m.group===activeGrp) koMatches.push({...m,day:e.day,_i:idx,key:getMatchKey(m,e.day,idx)});
                            });
                          });

                          return (<>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                              <span style={{fontSize:16}}>{icon}</span>
                              <span style={{fontSize:13,fontWeight:800,color:DARK}}>
                                {activeGrp==="Final"?"Grand Final":activeGrp==="3rd"?"Third Place":activeGrp}
                              </span>
                            </div>
                            {(groups[activeGrp]||[]).map((grp,gi)=>(
                              <div key={gi} style={{background:BG,borderRadius:12,boxShadow:SHADOW_OUT,padding:"12px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  {/* Match pair */}
                                  <div style={{display:"flex",flexDirection:"column",gap:6,flex:1}}>
                                    {grp.matches.map((m,mi)=>(
                                      <MatchBox key={mi} h={m.h} a={m.a} col={color} grayed={m.grayed}/>
                                    ))}
                                  </div>
                                  {/* Bracket lines */}
                                  {grp.matches.length > 1 && (
                                    <div style={{display:"flex",alignItems:"center",width:20,alignSelf:"stretch"}}>
                                      <svg width="20" height="100%" style={{flex:1}} viewBox="0 0 20 60" preserveAspectRatio="none">
                                        <path d="M0,15 H10 V45 H0" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity={grp.matches[0].grayed?"0.2":"0.4"}/>
                                        <line x1="10" y1="30" x2="20" y2="30" stroke={color} strokeWidth="1.5" strokeOpacity={grp.matches[0].grayed?"0.2":"0.4"}/>
                                      </svg>
                                    </div>
                                  )}
                                  {/* Next round box or final match */}
                                  {grp.next && <NextBox label={grp.next} col={stageColors[grp.next.includes("QF")?"QF":grp.next.includes("SF")?"SF":grp.next.includes("Final")?"Final":"QF"]||"#888"}/>}
                                  {grp.finalMatch && (
                                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
                                      <span style={{fontSize:11,fontWeight:700,color:color}}>{grp.label}</span>
                                      <MatchBox h={grp.finalMatch.h} a={grp.finalMatch.a} col={color}/>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {/* Matches from calendar */}
                            {koMatches.length>0&&(<>
                              <p style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"4px 0 6px"}}>{T[lang].scheduledMatches}</p>
                              <div style={{borderRadius:10,overflow:"hidden",boxShadow:SHADOW_OUT}}>
                                {koMatches.map((m,idx2)=>{
                                  const sc2=scores&&scores[m.key];
                                  const live2=LIVE_SCORES[m.key];
                                  const _mH=parseInt((m.time||"23:00").split(":")[0]);
                                  const _nd=simDay ?? getRealTournamentDay();
                                  const _nh=simDay!=null?(simHour||0):new Date().getHours();
                                  const _kick=_mH*60, _now=_nh*60;
                                  const isSimMode2 = simDay != null;
                                  const db2ko=live2?.status;
                                  const isFT2 = db2ko==="FT" || (isSimMode2 && !db2ko && (m.day<_nd || (m.day===_nd && _now>_kick+115)));
                                  const isHT2 = !isFT2 && db2ko==="HT";
                                  const isLive2 = !isFT2 && !isHT2 && (isLiveScoreStatus(db2ko) || (isSimMode2 && !db2ko && m.day===_nd && _now>=_kick && _now<=_kick+115));
                                  const liveScore2 = live2&&live2.home!=null ? live2 : (isSimMode2 && (isLive2||isHT2)?{home:0,away:0}:null);
                                  const penDisplay2 = penaltyScoreLabel(live2);
                                  const isPastM = m.day<_nd || (m.day===_nd && _mH<=_nh);
                                  const canEdit=!isLive2&&!isHT2&&!isFT2&&!isPastM&&isWeekUnlocked(m.day,simDay,simHour,simMin);
                                  return (
                                    <div key={idx2} style={{background:"#fff",borderBottom:idx2<koMatches.length-1?"1px solid rgba(0,0,0,0.05)":"none",
                                      padding:"10px 14px",display:"flex",alignItems:"center",gap:8,cursor:canEdit?"pointer":"default"}}
                                      onClick={()=>canEdit&&onMatchClick&&onMatchClick(m,m.day,m._i)}>
                                      <div style={{flexShrink:0,textAlign:"center",width:32}}>
                                        <p style={{fontSize:12,color:"#aaa",margin:0,fontWeight:600}}>{m.day>30?m.day-30:m.day} {m.day>30?"Jul":"Jun"}</p>
                                        <p style={{fontSize:11,color:"#bbb",margin:0}}>{fmtMatchTime(m.day, m.time, m.kickoffUtc)}</p>
                                      </div>
                                      <span style={{fontSize:18}}>{m.homeFlag}</span>
                                      <span style={{flex:1,fontSize:12,fontWeight:600,color:isPastM?"#bbb":DARK}}>{m.home.length>7?m.home.split(" ")[0]:m.home}</span>
                                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:54}}>
                                        <div style={{background:liveScore2?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"rgba(0,0,0,0.07)",borderRadius:6,padding:"3px 8px",textAlign:"center"}}>
                                          <span style={{fontSize:12,fontWeight:900,color:liveScore2?"#fff":"#bbb"}}>{liveScore2?`${liveScore2.home}-${liveScore2.away}`:"-"}</span>
                                        </div>
                                        {penDisplay2&&<span style={{fontSize:10,fontWeight:900,color:RED,lineHeight:1}}>{penDisplay2}</span>}
                                        {sc2?(
                                          <span style={{fontSize:11,fontWeight:700,color:NAVY}}>tu: {scH(sc2)}-{scA(sc2)}</span>
                                        ):canEdit?(
                                          <div style={{background:`linear-gradient(135deg,${RED},${GREEN})`,borderRadius:6,padding:"2px 8px",cursor:"pointer"}}>
                                            <span style={{fontSize:11,color:"#fff",fontWeight:700}}>+ scor</span>
                                          </div>
                                        ):null}
                                      </div>
                                      <span style={{flex:1,fontSize:12,fontWeight:600,color:isPastM?"#bbb":DARK,textAlign:"right"}}>{m.away.length>7?m.away.split(" ")[0]:m.away}</span>
                                      <span style={{fontSize:18}}>{m.awayFlag}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </>)}
                          </>);
                        })()}
                      </div>
                    ) : (()=>{
                      const cur2 = GROUPS_DATA.find(g=>g.id===activeGrp)||GROUPS_DATA[0];

                      // Helper to compute standing from a score source
                      const computeStanding = (getScore) => {
                        const st = cur2.teams.map(t=>({...t,pts:0,gf:0,ga:0,gd:0,p:0}));
                        calendarEvents.forEach(e=>{
                          e.matches.forEach((m,idx)=>{
                            if(m.group!==activeGrp) return;
                            const sc = getScore(e.day, idx);
                            if(!sc) return;
                            const h=scH(sc); const a=scA(sc);
                            const home=st.find(t=>t.name===m.home);
                            const away=st.find(t=>t.name===m.away);
                            if(!home||!away) return;
                            home.gf+=h;home.ga+=a;home.gd+=h-a;home.p++;
                            away.gf+=a;away.ga+=h;away.gd+=a-h;away.p++;
                            if(h>a)home.pts+=3;else if(h===a){home.pts+=1;away.pts+=1;}else away.pts+=3;
                          });
                        });
                        st.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
                        return st;
                      };

                      // Real standing — from liveScores (FT matches with real scores)
                      const realRows = computeStanding((day,idx)=>{
                        const match = (mm[day]||[])[idx];
                        const live = LIVE_SCORES[getMatchKey(match,day,idx)];
                        if(!live || live.status!=="FT" || live.home===null || live.home===undefined) return null;
                        return [live.home, live.away];
                      });

                      // Predicted standing — from user scores
                      const predRows = computeStanding((day,idx)=>{
                        const match = (mm[day]||[])[idx];
                        return scores&&scores[getMatchKey(match,day,idx)]||null;
                      });

                      const rows2 = showReal ? realRows : predRows;
                      return (<>
                        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
                          <div style={{display:"flex",background:BG,borderRadius:8,boxShadow:SHADOW_IN,padding:2,gap:2}}>
                            <button onClick={()=>setShowReal(true)} style={{padding:"3px 10px",borderRadius:6,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",background:showReal?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:BG,color:showReal?"#fff":"#888"}}>{T[lang].realLabel}</button>
                            <button onClick={()=>setShowReal(false)} style={{padding:"3px 10px",borderRadius:6,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",background:!showReal?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:BG,color:!showReal?"#fff":"#888"}}>{T[lang].predictedLabel}</button>
                          </div>
                        </div>
                        <div style={{borderRadius:10,overflow:"hidden",boxShadow:SHADOW_OUT,marginBottom:12}}>
                          <div style={{display:"flex",padding:"5px 10px",background:"rgba(0,0,0,0.04)"}}>
                            <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:20}}>#</span>
                            <span style={{flex:1,fontSize:11,fontWeight:700,color:"#bbb"}}>{T[lang].team}</span>
                            {["J","GF","GA","GD","Pts"].map(h=><span key={h} style={{fontSize:11,fontWeight:700,color:"#bbb",width:26,textAlign:"center"}}>{h}</span>)}
                          </div>
                          {rows2.map((t,i)=>(
                            <div key={t.name} style={{display:"flex",alignItems:"center",padding:"8px 10px",background:"#fff",borderBottom:i<rows2.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
                              <span style={{fontSize:11,fontWeight:800,color:i<2?NAVY:"#bbb",width:20}}>{i+1}</span>
                              <span style={{fontSize:16,marginRight:4}}>{t.flag}</span>
                              <span style={{flex:1,fontSize:11,fontWeight:600,color:DARK}}>{t.name.length>8?t.name.split(" ")[0]:t.name}</span>
                              <span style={{fontSize:11,color:"#888",width:26,textAlign:"center"}}>{t.p||0}</span>
                              <span style={{fontSize:11,color:"#888",width:26,textAlign:"center"}}>{t.gf||0}</span>
                              <span style={{fontSize:11,color:"#888",width:26,textAlign:"center"}}>{t.ga||0}</span>
                              <span style={{fontSize:11,color:(t.gd||0)>0?GREEN:(t.gd||0)<0?RED:"#888",width:26,textAlign:"center"}}>{(t.gd||0)>0?"+":(t.gd||0)<0?"-":""}{Math.abs(t.gd||0)}</span>
                              <span style={{fontSize:12,fontWeight:800,color:NAVY,width:26,textAlign:"center"}}>{t.pts||0}</span>
                            </div>
                          ))}
                        </div>
                        {/* Matches for this group */}
                        <p style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{T[lang].allMatchesGrp}{activeGrp}</p>
                        <div style={{borderRadius:10,overflow:"hidden",boxShadow:SHADOW_OUT}}>
                          {(()=>{
                            const allGM = [];
                            calendarEvents.forEach(e=>{
                              e.matches.forEach((m,idx)=>{
                                if(m.group===activeGrp) allGM.push({...m,day:e.day,_i:idx,key:getMatchKey(m,e.day,idx)});
                              });
                            });
                            return allGM.map((m,idx2)=>{
                              const sc2=scores&&scores[m.key];
                              const live2=LIVE_SCORES[m.key];
                              // Compute status from sim time directly
                              const _mH=parseInt((m.time||"23:00").split(":")[0]);
                              const _mM=parseInt((m.time||"00:00").split(":")[1]||0);
                              const _nd=simDay ?? getRealTournamentDay();
                              const _nh=simDay!=null?(simHour||0):new Date().getHours();
                              const _nm=simDay!=null?(simMin||0):new Date().getMinutes();
                              const _kick=_mH*60+_mM, _now=_nh*60+_nm;
                              const isSimMode2 = simDay != null;
                              const db2=live2?.status;
                              const isFT2 = db2==="FT" || (isSimMode2 && !db2 && (m.day<_nd || (m.day===_nd && _now>_kick+115)));
                              const isHT2 = !isFT2 && db2==="HT";
                              const isLive2 = !isFT2 && !isHT2 && (isLiveScoreStatus(db2) || (isSimMode2 && !db2 && m.day===_nd && _now>=_kick && _now<=_kick+115));
                              const liveScore2 = live2&&live2.home!==null&&live2.home!==undefined ? live2 : (isSimMode2 && (isLive2||isHT2)?{home:0,away:0}:null);
                              const hasScore2 = !!liveScore2;
                              const penDisplay2 = penaltyScoreLabel(live2);
                              const matchHourM=parseInt((m.time||"23:00").split(":")[0]);
                              const nowDM = simDay ?? getLocalTournamentDay();
                              const nowHM = simDay ? (simHour||0) : new Date().getHours();
                              const isPastM = m.day < nowDM || (m.day === nowDM && matchHourM <= nowHM);
                              const canEdit=!isLive2&&!isHT2&&!isFT2&&!isPastM&&isWeekUnlocked(m.day,simDay,simHour,simMin);
                              return (
                                <div key={idx2} role={canEdit?"button":undefined} tabIndex={canEdit?0:undefined}
                                  style={{background:"#fff",borderBottom:idx2<allGM.length-1?"1px solid rgba(0,0,0,0.05)":"none",
                                  padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}
                                  onClick={()=>canEdit&&onMatchClick&&onMatchClick(m,m.day,m._i)}
                                  onKeyDown={canEdit?e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onMatchClick&&onMatchClick(m,m.day,m._i);}}:undefined}>
                                  <span style={{fontSize:18}}>{m.homeFlag}</span>
                                  <span style={{flex:1,fontSize:12,fontWeight:600,color:isPastM?"#bbb":DARK}}>{m.home.length>7?m.home.split(" ")[0]:m.home}</span>
                                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                                    <span style={{fontSize:11,fontWeight:600,color:"#bbb"}}>{getLocalKickoffDay(m.kickoffUtc,m.day)} Iun · {fmtMatchTime(m.day, m.time, m.kickoffUtc)}</span>
                                    {isPastM?<span style={{fontSize:10,color:"#ccc",fontWeight:700}}>{T[lang].finished}</span>
                                      :isLive2?<span style={{fontSize:10,fontWeight:800,color:RED,animation:"blink 1s infinite"}}>● {liveScorePhaseLabel(db2, live2?.min)}</span>
                                      :isHT2?<span style={{fontSize:10,fontWeight:800,color:"#F59E0B"}}>⏸ HT</span>
                                      :<span style={{fontSize:10,color:"#bbb",fontWeight:700}}>{isFT2?"Final":"-"}</span>}
                                    <div style={{background:hasScore2?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"rgba(0,0,0,0.07)",borderRadius:6,padding:"3px 10px",minWidth:46,textAlign:"center"}}>
                                      <span style={{fontSize:12,fontWeight:900,color:hasScore2?"#fff":"#bbb"}}>{hasScore2?`${liveScore2.home}-${liveScore2.away}`:"-"}</span>
                                    </div>
                                    {penDisplay2&&<span style={{fontSize:10,fontWeight:900,color:RED,lineHeight:1}}>{penDisplay2}</span>}
                                    <span style={{fontSize:10,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{T[lang].prediction}</span>
                                    {!isWeekUnlocked(m.day,simDay,simHour,simMin)?<span style={{fontSize:12,color:"#ccc"}}>🔒</span>
                                      :sc2?<div style={{background:canEdit?`rgba(0,32,91,0.1)`:"rgba(0,0,0,0.06)",border:canEdit?`1.5px solid ${NAVY}`:"none",borderRadius:6,padding:"2px 8px",minWidth:46,textAlign:"center",opacity:isPastM?0.5:1}}>
                                          <span style={{fontSize:11,fontWeight:900,color:canEdit?NAVY:"#888"}}>{scH(sc2)}-{scA(sc2)}</span>
                                        </div>
                                      :<div style={{background:`linear-gradient(135deg,${RED},${GREEN})`,borderRadius:6,padding:"2px 8px",minWidth:46,textAlign:"center",cursor:canEdit?"pointer":"default",opacity:isPastM||isFT2||isLive2?0.5:1}}>
                                          <span style={{fontSize:11,color:"#fff",fontWeight:700}}>+ scor</span>
                                        </div>
                                    }
                                  </div>
                                  <span style={{flex:1,fontSize:12,fontWeight:600,color:isPastM?"#bbb":DARK,textAlign:"right"}}>{m.away.length>7?m.away.split(" ")[0]:m.away}</span>
                                  <span style={{fontSize:18,opacity:isPastM?0.5:1}}>{m.awayFlag}</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </>);
                    })()}
                  </div>
                ) : (
                  /* All matches list */
                  sm.map((m0,i)=>{
                    const m = {...m0, _i:i};
                    const key=getMatchKey(m0,sel,i);
                    // key used below for data-match-key
                    const sc = scores&&scores[key];
                    const live = LIVE_SCORES[key];
                    const mH2 = parseInt((m.time||"23:00").split(":")[0]);
                    const mM2 = parseInt((m.time||"00:00").split(":")[1]||0);
                    const _nowDay = simDay ?? getLocalTournamentDay();
                    const _nowH   = simDay!=null?(simHour||0):new Date().getHours();
                    const _nowM   = simDay!=null?(simMin||0):new Date().getMinutes();
                    const _kick = mH2*60+mM2, _now2 = _nowH*60+_nowM;
                    const isSimMode = simDay != null;
                    const dbStatus = live?.status;
                    const isFT = dbStatus==="FT" || (isSimMode && !dbStatus && ((sel||0)<_nowDay || (sel===_nowDay && _now2>_kick+115)));
                    const isHT = !isFT && dbStatus==="HT";
                    const isLive = !isFT && !isHT && (isLiveScoreStatus(dbStatus) || (isSimMode && !dbStatus && sel===_nowDay && _now2>=_kick && _now2<=_kick+115));
                    const isNS2 = !isFT && !isHT && !isLive;
                    const liveMin2 = isLive ? (live?.min != null ? live.min : dbStatus || !isSimMode ? null : Math.min(90,_now2-_kick)) : isHT ? 45 : 0;
                    const hasScore = live && live.home !== undefined && live.home !== null;
                    const penDisplay = penaltyScoreLabel(live);
                    const exactMatch = sc&&hasScore&&isFT&&scH(sc)===live.home&&scA(sc)===live.away;
                    const predRes = sc?scH(sc)>scA(sc)?"H":scH(sc)<scA(sc)?"A":"D":null;
                    const realRes = hasScore?live.home>live.away?"H":live.home<live.away?"A":"D":null;
                    const resultMatch = predRes&&realRes&&predRes===realRes&&isFT;
                    const isPastDay2 = !!(simDay && sel < simDay);
                    return (
                      <div key={i} data-match-key={key} style={{borderBottom:i<sm.length-1?"1px solid rgba(0,0,0,0.06)":"none",background:"#fff"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                          padding:"4px 14px",background:isLive?"rgba(0,32,91,0.06)":isFT?"rgba(0,154,68,0.05)":"rgba(0,0,0,0.02)"}}>
                          <span style={{fontSize:11,fontWeight:600,color:"#aaa"}}>{fmtMatchTime(m.day, m.time, m.kickoffUtc)} · Gr.{m.group}</span>
                          {isLive&&<span style={{fontSize:11,fontWeight:800,color:RED,display:"flex",alignItems:"center",gap:3}}>
                            <span style={{width:5,height:5,borderRadius:"50%",background:RED,display:"inline-block"}}/>
                            {liveScorePhaseLabel(dbStatus, liveMin2)}
                          </span>}
                          {isHT&&<span style={{fontSize:11,fontWeight:800,color:"#F59E0B"}}>HT · Pauză</span>}
                          {isFT&&<span style={{fontSize:11,fontWeight:700,color:GREEN}}>FT</span>}
                          {isNS2&&<span style={{fontSize:11,color:"#ccc"}}>{T[lang].notStarted}</span>}
                        </div>
                        {(()=>{ return (
                        <div role="button" tabIndex={isPastDay2?undefined:0}
                          onClick={()=>!isMatchPast(m.day||sel,m.time,simDay,simHour,m.kickoffUtc)&&!isPastDay2&&onMatchClick&&onMatchClick(m,sel,m._i)}
                          onKeyDown={isPastDay2?undefined:e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();if(!isMatchPast(m.day||sel,m.time,simDay,simHour,m.kickoffUtc))onMatchClick&&onMatchClick(m,sel,m._i);}}}
                          style={{display:"flex",alignItems:"center",padding:"10px 14px",cursor:isPastDay2?"default":"pointer",gap:6,opacity:isPastDay2?0.6:1}}>
                          <span style={{fontSize:18,flexShrink:0}}>{m.homeFlag}</span>
                          <span style={{flex:1,fontSize:11,fontWeight:600,color:DARK}}>{m.home.length>7?m.home.split(" ")[0]:m.home}</span>
                          <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                            {isLive?<span style={{fontSize:10,fontWeight:800,color:RED,animation:"blink 1s infinite"}}>● {liveScorePhaseLabel(dbStatus, liveMin2)}</span>
                              :isHT?<span style={{fontSize:10,fontWeight:800,color:"#F59E0B"}}>⏸ HT</span>
                              :<span style={{fontSize:10,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{isFT?"Final":"-"}</span>}
                            <div style={{background:(isLive||isHT)?"rgba(0,0,0,0.06)":hasScore?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"rgba(0,0,0,0.08)",borderRadius:6,padding:"4px 10px",minWidth:54,textAlign:"center"}}>
                              <span style={{fontSize:13,fontWeight:900,color:(isLive||isHT)?RED:hasScore?"#fff":"#bbb"}}>{hasScore?`${live.home}-${live.away}`:isSimMode&&(isLive||isHT)?"0-0":"-"}</span>
                            </div>
                            {penDisplay&&<span style={{fontSize:10,fontWeight:900,color:RED,lineHeight:1}}>{penDisplay}</span>}
                            <span style={{fontSize:10,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{T[lang].prediction}</span>
                            {(()=>{
                              const isPast = isMatchPast(sel, m.time, simDay, simHour, m.kickoffUtc);
                              const canPredict = !isLive && !isHT && !isFT && !isPast && isWeekUnlocked(sel||0, simDay, simHour, simMin);
                              // Comparatie live: scorul prezis vs scorul curent
                              const liveHas = (isLive||isHT) && hasScore;
                              const predRes2 = sc ? (scH(sc)>scA(sc)?"H":scH(sc)<scA(sc)?"A":"D") : null;
                              const liveRes2 = liveHas ? (live.home>live.away?"H":live.home<live.away?"A":"D") : null;
                              const liveExact = liveHas && sc && scH(sc)===live.home && scA(sc)===live.away;
                              const liveWin = !liveExact && liveHas && predRes2 && predRes2===liveRes2;
                              const liveLose = liveHas && predRes2 && predRes2!==liveRes2;
                              if(sc) {
                                const liveBg = liveExact?`linear-gradient(135deg,${GREEN},#007A36)`:liveWin?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:liveLose?`linear-gradient(135deg,${RED},#EF3340)`:"rgba(0,0,0,0.06)";
                                return (
                                  <div onClick={canPredict?e=>{e.stopPropagation();onMatchClick&&onMatchClick(m,sel,m._i);}:undefined}
                                    style={{background:(isLive||isHT)?liveBg:exactMatch?`linear-gradient(135deg,${GREEN},#007A36)`:resultMatch?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:(isPast||isFT)?`linear-gradient(135deg,${RED},#EF3340)`:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,
                                      borderRadius:6,padding:"3px 10px",minWidth:54,textAlign:"center",
                                      display:"flex",alignItems:"center",justifyContent:"center",gap:3,
                                      cursor:canPredict?"pointer":"default"}}>
                                    <span style={{fontSize:12,fontWeight:900,color:"#fff"}}>{scH(sc)}-{scA(sc)}</span>
                                    {(isLive||isHT)&&liveHas&&(liveExact?<span style={{fontSize:12}}>🎯</span>:liveWin?<span style={{fontSize:12}}>✓</span>:<span style={{fontSize:12}}>✗</span>)}
                                    {(isFT||isPast)&&(exactMatch?<span style={{fontSize:12}}>🎯</span>:resultMatch?<span style={{fontSize:12}}>✓</span>:<span style={{fontSize:12}}>✗</span>)}
                                  </div>
                                );
                              }
                              if(isPast || isLive || isFT) {
                                return (
                                  <div style={{background:"rgba(0,0,0,0.06)",borderRadius:6,padding:"3px 10px",minWidth:54,textAlign:"center"}}>
                                    <span style={{fontSize:12,fontWeight:700,color:"#ccc"}}>?-?</span>
                                  </div>
                                );
                              }
                              return canPredict ? (
                                <div onClick={e=>{e.stopPropagation();onMatchClick&&onMatchClick(m,sel,m._i);}}
                                  style={{background:`linear-gradient(135deg,${RED},${GREEN})`,borderRadius:6,padding:"3px 10px",minWidth:54,textAlign:"center",cursor:"pointer"}}>
                                  <span style={{fontSize:12,color:"#fff",fontWeight:700}}>+ scor</span>
                                </div>
                              ) : (
                                <div style={{background:"rgba(0,0,0,0.06)",borderRadius:6,padding:"3px 10px",minWidth:54,textAlign:"center"}}>
                                  <span style={{fontSize:12,fontWeight:700,color:"#ccc"}}>🔒</span>
                                </div>
                              );
                            })()}
                          </div>
                          <span style={{flex:1,fontSize:11,fontWeight:600,color:DARK,textAlign:"right"}}>{m.away.length>7?m.away.split(" ")[0]:m.away}</span>
                          <span style={{fontSize:18,flexShrink:0}}>{m.awayFlag}</span>
                        </div>
                        ); })()}
                        {(isFT||isMatchPast(sel,m.time,simDay,simHour,m.kickoffUtc))&&(
                          <div style={{padding:"4px 14px 8px",display:"flex",justifyContent:"center"}}>
                            <div style={{background:exactMatch?"rgba(0,154,68,0.1)":resultMatch?"rgba(0,32,91,0.07)":"rgba(0,0,0,0.04)",borderRadius:20,padding:"3px 14px"}}>
                              <span style={{fontSize:12,fontWeight:700,color:exactMatch?GREEN:resultMatch?NAVY:RED}}>
                                {exactMatch?"🎯 +90 pts":resultMatch?"✓ +30 pts":"✗ +0 pts"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}
        </div>
      )}
      {!sm && sel !== null && sel !== undefined && (
        <div style={{marginTop:16,display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 20px",background:"#fff",borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
          <div style={{fontSize:32,marginBottom:8}}>📅</div>
          <div style={{fontSize:13,fontWeight:700,color:"#374151",textAlign:"center",marginBottom:6}}>{T[lang].noMatchesScheduled}</div>
          <div style={{fontSize:11,color:"#9CA3AF",textAlign:"center",lineHeight:1.5,maxWidth:220}}>{T[lang].checkWeekHint}</div>
        </div>
      )}
    </div>
  );
}

function StatsScreen() {
  const lang = useLang();
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
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"16px 20px 18px",flexShrink:0}}>
        <h2 style={{fontSize:18,fontWeight:800,color:"#fff",margin:"0 0 12px"}}>{T[lang].groupsSchedule}</h2>
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
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"14px 20px"}}>
        {/* Teams in group */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{T[lang].group} {selGroup} · {T[lang].groupTeams}</p>
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:16}}>
          {cur.teams.map((t,i)=>(
            <div key={t.name} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",
              borderBottom:i<3?"1px solid rgba(0,0,0,0.05)":"none",background:"#fff"}}>
              <span style={{fontSize:12,fontWeight:700,color:"#ccc",width:16}}>{i+1}</span>
              <span style={{fontSize:22}}>{t.flag}</span>
              <span style={{flex:1,fontSize:13,fontWeight:600,color:DARK}}>{t.name}</span>
            </div>
          ))}
        </div>
        {/* Calendar for this group */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{T[lang].matchSchedule}</p>
        <CalendarSlider/>
      </div>
    </div>
  );
}

function AccountScreen({ setLang, onBoards, onSignOut, onShowGuide, onPremium, onNotifications, user, isActive=true, onAvatarUpdate }) {
  const lang = useLang();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "—";
  const localeMap = { en:"en-US", ro:"ro-RO", fr:"fr-FR" };
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(localeMap[lang]||"en-US", { month: "long", year: "numeric" })
    : "";
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // Sync local avatar state whenever the auth user object updates (token refresh, USER_UPDATED, etc.)
  useEffect(() => {
    const url = user?.user_metadata?.avatar_url || null;
    if (url) setAvatarUrl(url);
  }, [user?.user_metadata?.avatar_url]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const url = await uploadAvatar(user.id, file);
    if (url) { setAvatarUrl(url); onAvatarUpdate?.(url); }
    setAvatarUploading(false);
    e.target.value = "";
  };
  const closeDeleteModal = () => {
    if(deleteLoading) return;
    setDeleteMode(false);
    setDeleteEmail("");
    setDeleteError("");
  };

  useEffect(()=>{
    if(!isActive) {
      setDeleteMode(false);
      setDeleteEmail("");
      setDeleteError("");
      setDeleteLoading(false);
    }
  }, [isActive]);

  const handleSignOut = async () => {
    try { localStorage.clear(); } catch {}
    await supabase.auth.signOut();
    onSignOut();
  };

  const handleDeleteAccount = async () => {
    if (deleteEmail.trim().toLowerCase() !== user?.email?.toLowerCase()) {
      setDeleteError("The email does not match your account.");
      return;
    }
    setDeleteLoading(true); setDeleteError("");
    const userId = user.id;
    await Promise.all([
      supabase.from('exact_scores').delete().eq('user_id', userId),
      supabase.from('predictions').delete().eq('user_id', userId),
      supabase.from('board_members').delete().eq('user_id', userId),
    ]);
    const { error } = await supabase.rpc('delete_user_account');
    if (error) { setDeleteError(error.message); setDeleteLoading(false); return; }
    await supabase.auth.signOut();
    onSignOut();
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,position:"relative",overflow:"hidden"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{padding:"10px 14px 0",flexShrink:0,position:"relative",zIndex:2}}>
        <div style={{background:"rgba(255,255,255,0.32)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",borderRadius:26,boxShadow:"0 8px 32px rgba(10,46,138,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",border:"1px solid rgba(255,255,255,0.55)",padding:"12px 20px 14px",position:"relative",WebkitMaskImage:"linear-gradient(to bottom,black 0%,black 85%,transparent 100%)",maskImage:"linear-gradient(to bottom,black 0%,black 85%,transparent 100%)"}}>
          <div style={{position:"absolute",inset:0,borderRadius:26,background:"linear-gradient(135deg,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0.08) 40%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
          <div style={{textAlign:"center",position:"relative",zIndex:1}}>
            <img src={predictoLogo} alt="Predicto" decoding="sync" style={{height:36,width:"auto",objectFit:"contain",display:"block",margin:"0 auto",position:"relative",left:3}}/>
            <h1 style={{fontSize:10,fontWeight:700,margin:"2px 0 0",letterSpacing:2.5,lineHeight:1,background:"linear-gradient(100deg,#CC0022 0%,#003399 50%,#007733 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>WORLD CUP 2026</h1>
            <p style={{fontSize:11,color:"#6B7280",margin:"3px 0 0"}}>{T[lang].location}</p>
          </div>
          <div style={{borderTop:"1px solid rgba(0,0,0,0.06)",marginTop:10,position:"relative",zIndex:1}}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,paddingTop:10,position:"relative",zIndex:1}}>
            <div style={{position:"relative",flexShrink:0}} onClick={()=>!avatarUploading&&avatarInputRef.current?.click()}>
              <input ref={avatarInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarChange}/>
              <div style={{width:52,height:52,borderRadius:"50%",background:avatarUrl?"transparent":"rgba(0,0,0,0.05)",border:avatarUrl?"none":"2px dashed rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer",overflow:"hidden"}}>
                {avatarUploading
                  ? <span style={{fontSize:13,color:"#888"}}>...</span>
                  : avatarUrl
                    ? <img src={avatarUrl} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : "👤"}
              </div>
              <div style={{position:"absolute",bottom:0,right:0,width:18,height:18,borderRadius:"50%",background:NAVY,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700,lineHeight:1}}>+</div>
            </div>
            <div>
              <p style={{fontSize:13,color:"#888",margin:0}}>{user?.email}</p>
              {memberSince && <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0"}}>{T[lang].memberSinceLabel} {memberSince}</p>}
            </div>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",position:"relative",zIndex:1}}>
        <div style={{padding:"12px 20px 100px"}}>
          {[{icon:"🏆",label:T[lang].myBoards,sub:T[lang].activeBoards,action:onBoards},{icon:"📖",label:T[lang].appGuide,sub:T[lang].howItWorks,action:onShowGuide},{icon:"🔔",label:T[lang].notifications,sub:T[lang].matchAlertsOn,action:onNotifications},{icon:"🌍",label:T[lang].language,sub:LANGS.find(l=>l.code===lang)?.name||"English",isLang:true},{icon:"📲",label:T[lang].shareApp,sub:T[lang].shareAppSub,action:()=>{ const url=window.location.origin; window.open("https://wa.me/?text="+encodeURIComponent(T[lang].shareAppMsg+url),"_blank"); }},{icon:"⭐",label:T[lang].upgradePremium,sub:T[lang].removeAds,highlight:true,action:onPremium},{icon:"🚪",label:T[lang].signOut,sub:"",action:handleSignOut}].map(item=>(
            <div key={item.label} onClick={item.isLang?undefined:item.action||undefined} style={{display:"flex",alignItems:"center",gap:14,...UI.card,background:item.highlight?"#E8F0FF":"#fff",border:item.highlight?`1.5px solid ${NAVY}`:UI.card.border,padding:"13px 16px",marginBottom:10,cursor:item.isLang?"default":"pointer"}}>
              <span style={{fontSize:20}}>{item.icon}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:14,fontWeight:700,color:item.highlight?NAVY:DARK,margin:0}}>{item.label}</p>
                {item.sub&&<p style={{fontSize:12,color:item.highlight?NAVY:"#aaa",margin:"2px 0 0"}}>{item.sub}</p>}
              </div>
              {item.isLang ? <LangSelector lang={lang} setLang={setLang}/> : <span style={{color:item.highlight?NAVY:"#bbb",fontSize:18}}>›</span>}
            </div>
          ))}
          <p onClick={()=>setDeleteMode(true)}
            style={{textAlign:"center",fontSize:12,color:RED,margin:"8px 0 4px",cursor:"pointer",textDecoration:"underline",opacity:0.7}}>
            {T[lang].deleteAccountTitle}
          </p>
        </div>
      </div>
      {deleteMode && (
        <div
          style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end"}}
          onPointerDown={e=>{ if(e.target===e.currentTarget) closeDeleteModal(); }}>
          <div style={{position:"relative",width:"100%",background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 24px",paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 32px)"}} onClick={e=>e.stopPropagation()}>
            <button onClick={closeDeleteModal}
              disabled={deleteLoading}
              style={{position:"absolute",right:16,top:16,width:34,height:34,borderRadius:"50%",border:"1px solid rgba(10,46,138,0.08)",background:"#fff",color:"#9CA3AF",fontSize:18,fontWeight:700,cursor:deleteLoading?"default":"pointer",opacity:deleteLoading?0.45:1}}>
              ×
            </button>
            <div style={{fontSize:40,textAlign:"center",marginBottom:12}}>⚠️</div>
            <h3 style={{fontSize:18,fontWeight:800,color:DARK,textAlign:"center",margin:"0 0 8px"}}>{T[lang].deleteAccountTitle}</h3>
            <p style={{fontSize:13,color:"#888",textAlign:"center",margin:"0 0 20px",lineHeight:1.5}}>
              {T[lang].deleteDescPt1}<strong>{T[lang].deleteDescEverything}</strong>{T[lang].deleteDescPt2}<br/>{T[lang].deleteDescIrreversiblePt1}<strong>{T[lang].deleteDescIrreversible}</strong>.
            </p>
            <p style={{fontSize:12,fontWeight:700,color:DARK,margin:"0 0 6px"}}>{T[lang].enterEmailToConfirm}</p>
            <InputPanel style={{marginBottom:12}}>
              <input value={deleteEmail} onChange={e=>{setDeleteEmail(e.target.value);setDeleteError("");}}
                placeholder={T[lang].emailPlaceholder} type="email" autoCapitalize="none"
                style={{flex:1,border:"none",outline:"none",fontSize:14,color:DARK,background:"transparent"}}/>
            </InputPanel>
            {deleteError && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{deleteError}</p>}
            <button onClick={handleDeleteAccount} disabled={deleteLoading||!deleteEmail.trim()}
              style={{width:"100%",background:deleteEmail.trim()?RED:"#e0e0e0",color:"#fff",border:"none",borderRadius:14,padding:"14px 0",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10,opacity:deleteLoading?0.7:1}}>
              {deleteLoading ? T[lang].btnDeleting : T[lang].btnDeletePermanently}
            </button>
            <button onClick={closeDeleteModal}
              style={{width:"100%",background:"#fff",color:"#888",border:"1px solid rgba(10,46,138,0.08)",borderRadius:14,padding:"12px 0",fontSize:14,fontWeight:650,cursor:"pointer"}}>
              {T[lang].cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RulesScreen({ onBack }) {
  const lang = useLang();
  const { pred, exact } = useScoringRules();
  const [tab, setTab] = useState("predictions");
  const predRules = [
    { phase:"⚽ Grupe · 1st loc",  pts:pred.group1st, desc:T[lang].rulesDesc1 },
    { phase:"⚽ Grupe · 2nd loc",  pts:pred.group2nd, desc:T[lang].rulesDesc2 },
    { phase:"⚽ Grupe · 3rd loc",  pts:pred.group3rd, desc:T[lang].rulesDesc3 },
    { phase:"🥉 Best Third",       pts:pred.best3,    desc:T[lang].rulesDescBest3 },
    { phase:"🏆 Round of 32",      pts:pred.r32,      desc:T[lang].rulesDescMatch },
    { phase:"🏆 Round of 16",      pts:pred.r16,      desc:T[lang].rulesDescMatch },
    { phase:"🏆 Quarter-Finals",   pts:pred.qf,       desc:T[lang].rulesDescMatch },
    { phase:"🏆 Semi-Finals",      pts:pred.sf,       desc:T[lang].rulesDescMatch },
    { phase:"🏆 Final",            pts:pred.final,    desc:T[lang].rulesDescFinal },
  ];
  const exactRules = [
    { phase:"⚽ Groups · Result",      pts:exact.group_result,  desc:"Correct winner or draw" },
    { phase:"⚽ Groups · Exact Score", pts:exact.group_exact,   desc:"Exact match score" },
    { phase:"🏆 R32 · Winner",         pts:exact.r32_result,    desc:"Correct match winner" },
    { phase:"🏆 R16 · Winner",         pts:exact.r16_result,    desc:"Correct match winner" },
    { phase:"🏆 QF · Winner",          pts:exact.qf_result,     desc:"Correct match winner" },
    { phase:"🏆 SF · Winner",          pts:exact.sf_result,     desc:"Correct match winner" },
    { phase:"🏆 Final · Winner",       pts:exact.final_result,  desc:"Tournament winner" },
  ];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.055,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{padding:"10px 14px 0",flexShrink:0,position:"relative",zIndex:2}}>
        <div style={{background:"rgba(255,255,255,0.32)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",borderRadius:26,boxShadow:"0 8px 32px rgba(10,46,138,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",border:"1px solid rgba(255,255,255,0.55)",padding:"12px 20px 0",position:"relative",WebkitMaskImage:"linear-gradient(to bottom,black 0%,black 78%,transparent 100%)",maskImage:"linear-gradient(to bottom,black 0%,black 78%,transparent 100%)"}}>
          <div style={{position:"absolute",inset:0,borderRadius:26,background:"linear-gradient(135deg,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0.08) 40%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0,paddingTop:10}}>
              <button onClick={onBack} style={{width:44,height:44,background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:22,color:"#374151",lineHeight:1}}>‹</span>
              </button>
              <p style={{fontSize:11,color:"transparent",margin:0,userSelect:"none"}}> </p>
            </div>
            <div style={{textAlign:"center"}}>
              <img src={predictoLogo} alt="Predicto" decoding="sync" style={{height:36,width:"auto",objectFit:"contain",display:"block",margin:"0 auto",position:"relative",left:3}}/>
              <h1 style={{fontSize:10,fontWeight:700,margin:"2px 0 0",letterSpacing:2.5,lineHeight:1,background:"linear-gradient(100deg,#CC0022 0%,#003399 50%,#007733 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>WORLD CUP 2026</h1>
              <p style={{fontSize:11,color:"#6B7280",margin:"3px 0 0"}}>{T[lang].location}</p>
            </div>
            <div style={{width:44,paddingTop:10}}/>
          </div>
          <div style={{display:"flex",gap:0,borderTop:`1px solid rgba(0,0,0,0.06)`,marginTop:10}}>
            {[{id:"predictions",label:T[lang].rulesTabPredictions},{id:"exact",label:T[lang].rulesTabExact}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{flex:1,background:"transparent",border:"none",cursor:"pointer",padding:"12px 0",
                  fontSize:12,fontWeight:700,color:tab===t.id?NAVY:"#aaa",
                  borderBottom:tab===t.id?`3px solid ${RED}`:"3px solid transparent",
                  transition:"all 0.2s"}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",overscrollBehavior:"contain",padding:"10px 20px 100px",position:"relative",zIndex:1}}>

        {/* Description */}
        <div style={{...UI.card,padding:"14px 16px",marginBottom:12}}>
          <p style={{fontSize:13,fontWeight:700,color:DARK,margin:"0 0 4px"}}>
            {tab==="predictions" ? T[lang].howPredictionsWork : T[lang].howExactScoreWork}
          </p>
          <p style={{fontSize:12,color:"#888",margin:0,lineHeight:1.5}}>
            {tab==="predictions" ? T[lang].predictionsDesc : T[lang].exactDesc}
          </p>
        </div>

        {/* Rules table */}
        <p style={{...UI.sectionLabel,margin:"0 0 8px"}}>{T[lang].pointsPerPrediction}</p>
        {tab==="predictions" ? (()=>{
          const SectionHeader = ({label,due,color})=>(
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              background:"#F8FAFC",padding:"7px 16px",borderBottom:"1px solid rgba(10,46,138,0.06)"}}>
              <span style={{fontSize:10,fontWeight:800,color,letterSpacing:1.2,textTransform:"uppercase"}}>{label}</span>
              <span style={{fontSize:10,fontWeight:700,color:"#9CA3AF"}}>{due}</span>
            </div>
          );
          const Row = ({r,i,last})=>(
            <div style={{display:"flex",alignItems:"center",padding:"12px 16px",background:"#fff",borderBottom:last?"none":"1px solid rgba(10,46,138,0.05)",gap:12}}>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:700,color:DARK,margin:"0 0 2px"}}>
                  {r.phase.split("⚽").flatMap((p,j)=>j===0?[p]:[<span key={j} style={{colorScheme:"light",filter:"saturate(0) contrast(3) brightness(1.1)"}}>⚽</span>,p])}
                </p>
                <p style={{fontSize:11,color:"#aaa",margin:0}}>{r.desc}</p>
              </div>
              <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,borderRadius:10,padding:"5px 0",flexShrink:0,width:56,textAlign:"center"}}>
                <span style={{fontSize:13,fontWeight:900,color:"#fff"}}>+{r.pts}</span>
              </div>
            </div>
          );
          const task1 = predRules.slice(0,4);
          const task2 = predRules.slice(4);
          return (
            <div style={{...UI.card,marginBottom:12}}>
              <SectionHeader label={T[lang].rulesTask1Header} due={T[lang].rulesTask1Due} color={NAVY}/>
              {task1.map((r,i)=><Row key={i} r={r} last={false}/>)}
              <SectionHeader label={T[lang].rulesTask2Header} due={T[lang].rulesTask2Due} color={RED}/>
              {task2.map((r,i)=><Row key={i+4} r={r} last={i===task2.length-1}/>)}
            </div>
          );
        })() : (
          <div style={{...UI.card,marginBottom:12}}>
            {exactRules.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",padding:"12px 16px",background:"#fff",borderBottom:i<exactRules.length-1?"1px solid rgba(10,46,138,0.05)":"none",gap:12}}>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:700,color:DARK,margin:"0 0 2px"}}>
                    {r.phase.split("⚽").flatMap((p,j)=>j===0?[p]:[<span key={j} style={{colorScheme:"light",filter:"saturate(0) contrast(3) brightness(1.1)"}}>⚽</span>,p])}
                  </p>
                  <p style={{fontSize:11,color:"#aaa",margin:0}}>{r.desc}</p>
                </div>
                <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,borderRadius:10,padding:"5px 0",flexShrink:0,width:56,textAlign:"center"}}>
                  <span style={{fontSize:13,fontWeight:900,color:"#fff"}}>+{r.pts}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Example */}
        <div style={{...UI.card,background:"#E8F0FF",padding:"14px 16px",marginBottom:24}}>
          <p style={{fontSize:12,fontWeight:700,color:NAVY,margin:"0 0 4px"}}>{T[lang].rulesExampleTitle}</p>
          <p style={{fontSize:12,color:"#555",margin:0,lineHeight:1.5}}>
            {tab==="predictions" ? T[lang].rulesExamplePred : T[lang].rulesExampleExact}
          </p>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, emoji, visible }) {
  return (
    <div style={{
      position:"fixed", bottom: visible ? 90 : 60, left:"50%",
      transform:"translateX(-50%)",
      background:"rgba(20,20,20,0.92)", borderRadius:14,
      padding:"10px 20px", display:"flex", alignItems:"center", gap:8,
      zIndex:3000, transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      opacity: visible ? 1 : 0, pointerEvents:"none",
      boxShadow:"0 8px 24px rgba(0,0,0,0.3)"
    }}>
      {emoji && <span style={{fontSize:18}}>{emoji}</span>}
      <span style={{fontSize:13, fontWeight:600, color:"#fff", whiteSpace:"nowrap"}}>{message}</span>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState({visible:false, message:"", emoji:""});
  const showToast = (message, emoji="✓") => {
    setToast({visible:true, message, emoji});
    setTimeout(()=>setToast(t=>({...t,visible:false})), 2200);
  };
  return [toast, showToast];
}

// Citit SINCRON înainte ca Supabase să proceseze URL-ul și să-l șteargă.
// Folsoit ca fallback dacă PASSWORD_RECOVERY nu se prinde.
const _isRecoveryUrl = (() => {
  try {
    const s = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return s.get('type') === 'recovery' || h.get('type') === 'recovery';
  } catch { return false; }
})();

function DesktopBlocker() {
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:99999,
      background:"linear-gradient(135deg,#00153E 0%,#001840 40%,#0A0A1A 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      overflow:"hidden",
    }}>
      {/* Stars background */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        {Array.from({length:40}).map((_,i)=>(
          <div key={i} style={{
            position:"absolute",
            width: i%3===0 ? 3 : i%3===1 ? 2 : 1,
            height: i%3===0 ? 3 : i%3===1 ? 2 : 1,
            borderRadius:"50%",
            background:"#fff",
            opacity: 0.2 + (i%5)*0.12,
            left:`${(i*37+13)%100}%`,
            top:`${(i*53+7)%100}%`,
          }}/>
        ))}
      </div>

      {/* Trophy faded bg */}
      <img src={trophy} alt="" style={{
        position:"absolute",right:"-10%",bottom:"-5%",
        width:"55%",opacity:0.06,pointerEvents:"none",
        filter:"grayscale(1) brightness(2)",
      }}/>

      {/* Logo */}
      <img src={predictoLogo} alt="Predicto" style={{
        height:48,width:"auto",objectFit:"contain",marginBottom:8,position:"relative",zIndex:1,
      }}/>
      <p style={{
        fontSize:10,fontWeight:700,letterSpacing:3,
        background:"linear-gradient(100deg,#CC0022 0%,#003399 50%,#007733 100%)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        backgroundClip:"text",margin:"0 0 48px",
      }}>WORLD CUP 2026</p>

      {/* Phone icon */}
      <div style={{
        width:72,height:120,borderRadius:16,border:"3px solid rgba(255,255,255,0.25)",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",
        padding:"0 0 10px",marginBottom:32,position:"relative",zIndex:1,
        boxShadow:"0 0 40px rgba(200,16,46,0.3)",
      }}>
        <div style={{width:24,height:3,borderRadius:4,background:"rgba(255,255,255,0.4)"}}/>
        <div style={{
          position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",
          width:20,height:4,borderRadius:4,background:"rgba(255,255,255,0.2)",
        }}/>
        <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-55%)",fontSize:28}}>⚽</span>
      </div>

      <h1 style={{
        fontSize:22,fontWeight:900,color:"#fff",margin:"0 0 10px",
        textAlign:"center",letterSpacing:0.5,position:"relative",zIndex:1,
      }}>Mobile Only</h1>
      <p style={{
        fontSize:14,color:"rgba(255,255,255,0.5)",textAlign:"center",
        margin:"0 0 40px",lineHeight:1.6,maxWidth:280,position:"relative",zIndex:1,
      }}>
        Predicto e construit pentru mobil.<br/>
        Deschide pe telefon pentru experiența completă.
      </p>

      <div style={{
        background:"rgba(255,255,255,0.06)",borderRadius:14,
        padding:"12px 24px",border:"1px solid rgba(255,255,255,0.1)",
        display:"flex",alignItems:"center",gap:10,position:"relative",zIndex:1,
      }}>
        <span style={{fontSize:18}}>📱</span>
        <span style={{fontSize:13,color:"rgba(255,255,255,0.6)",fontWeight:500}}>
          {window.location.host}
        </span>
      </div>
    </div>
  );
}

// ─── CHAT WIDGET ──────────────────────────────────────────────────────────────
function ChatWidget({ boardId, user }) {
  const lang = useLang();
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [hasUnread, setHasUnread] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [selectedMsgId, setSelectedMsgId] = React.useState(null);
  const [replyingTo, setReplyingTo] = React.useState(null);
  const bottomRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const editInputRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const openRef = React.useRef(open);
  const channelRef = React.useRef(null);
  const userIdRef = React.useRef(user?.id);
  React.useEffect(() => { openRef.current = open; }, [open]);
  React.useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSelectedMsgId(null);
        setReplyingTo(null);
        setText('');
        if (inputRef.current) inputRef.current.style.height = '';
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  const lsKey = `chat_read_${boardId}`;
  const getLastRead = () => { try { return localStorage.getItem(lsKey) || '1970-01-01'; } catch { return '1970-01-01'; } };
  const markRead = () => { try { localStorage.setItem(lsKey, new Date().toISOString()); } catch {} setHasUnread(false); };

  // Load messages when boardId changes
  React.useEffect(() => {
    if (!boardId) return;
    loadChatMessages(boardId).then(msgs => {
      setMessages(msgs);
      const lastRead = getLastRead();
      const hasNew = msgs.some(m => !m.is_system && m.user_id !== user?.id && m.created_at > lastRead);
      setHasUnread(hasNew);
    });
  }, [boardId]);

  // Broadcast subscription — stabil, fără probleme RLS
  React.useEffect(() => {
    if (!boardId) return;
    const sub = subscribeChatMessages(boardId,
      msg => {
        setMessages(prev => {
          const filtered = prev.filter(m => !(m.id?.startsWith('tmp_') && m.user_id === msg.user_id && m.content === msg.content));
          return [...filtered, msg];
        });
        if (!openRef.current && msg.user_id !== userIdRef.current && !msg.is_system) setHasUnread(true);
      },
      edit => {
        setMessages(prev => prev.map(m => m.id === edit.id ? { ...m, content: edit.content, edited_at: edit.edited_at } : m));
      },
      reaction => {
        setMessages(prev => prev.map(m => m.id === reaction.id ? { ...m, likes: reaction.likes, dislikes: reaction.dislikes } : m));
      }
    );
    channelRef.current = sub;
    return () => sub.unsubscribe();
  }, [boardId]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleOpen = () => { setOpen(true); markRead(); setTimeout(() => inputRef.current?.focus(), 100); };
  const handleClose = () => { setOpen(false); setText(''); setReplyingTo(null); if (inputRef.current) inputRef.current.style.height = ''; };

  const handleSend = async () => {
    const content = text.trim();
    if (!content || !user || sending) return;
    setSending(true);
    setText('');
    if (inputRef.current) inputRef.current.style.height = '';
    const reply = replyingTo;
    setReplyingTo(null);
    const nickname = user.user_metadata?.full_name || user.email?.split('@')[0] || '?';
    const optimistic = {
      id: `tmp_${Date.now()}`,
      board_id: boardId,
      user_id: user.id,
      nickname,
      content,
      is_system: false,
      created_at: new Date().toISOString(),
      reply_to_id: reply?.id || null,
      reply_to_nickname: reply?.nickname || null,
      reply_to_content: reply?.content || null,
    };
    setMessages(prev => [...prev, optimistic]);
    const result = await sendChatMessage(boardId, user.id, nickname, content, reply);
    if (result.error) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      console.error('Chat send failed:', result.error);
    } else if (result.data) {
      channelRef.current?.broadcast(result.data);
    }
    setSending(false);
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.content);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };
  const cancelEdit = () => setEditingId(null);
  const handleReaction = async (msg, type, toggleFn) => {
    if (!user || msg.is_system || msg.id?.startsWith('tmp_')) return;
    const uid = user.id;
    const prevLikes    = msg.likes    || [];
    const prevDislikes = msg.dislikes || [];
    // Optimistic: mutual exclusivity
    const newLikes    = type === 'likes'
      ? (prevLikes.includes(uid) ? prevLikes.filter(id => id !== uid) : [...prevLikes, uid])
      : prevLikes.filter(id => id !== uid);
    const newDislikes = type === 'dislikes'
      ? (prevDislikes.includes(uid) ? prevDislikes.filter(id => id !== uid) : [...prevDislikes, uid])
      : prevDislikes.filter(id => id !== uid);
    setMessages(ms => ms.map(m => m.id === msg.id ? { ...m, likes: newLikes, dislikes: newDislikes } : m));
    setSelectedMsgId(null);
    const result = await toggleFn(msg.id);
    if (result.error) {
      setMessages(ms => ms.map(m => m.id === msg.id ? { ...m, likes: prevLikes, dislikes: prevDislikes } : m));
    } else {
      channelRef.current?.broadcastReaction({ id: msg.id, likes: result.likes, dislikes: result.dislikes });
    }
  };
  const handleLike    = (msg) => handleReaction(msg, 'likes',    toggleChatLike);
  const handleDislike = (msg) => handleReaction(msg, 'dislikes', toggleChatDislike);
  const handleSaveEdit = async () => {
    const content = editText.trim();
    if (!content || !editingId) { setEditingId(null); return; }
    setMessages(prev => prev.map(m => m.id === editingId ? { ...m, content, edited_at: new Date().toISOString() } : m));
    const id = editingId;
    setEditingId(null);
    const result = await editChatMessage(id, content);
    if (result.error) {
      console.error('Edit failed:', result.error);
    } else if (result.data) {
      channelRef.current?.broadcastEdit(result.data);
    }
  };

  const formatTime = ts => { try { return new Date(ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); } catch { return ''; } };

  const swipeState = React.useRef({});
  const onMsgTouchStart = (e, msgId) => {
    const t = e.touches[0];
    swipeState.current = { id: msgId, startX: t.clientX, startY: t.clientY, moved: false, didSwipe: false };
  };
  const onMsgTouchMove = (e, msgId) => {
    const s = swipeState.current;
    if (s.id !== msgId) return;
    const t = e.touches[0];
    const dx = t.clientX - s.startX;
    const dy = Math.abs(t.clientY - s.startY);
    if (!s.moved && Math.abs(dx) < 8) return;
    if (!s.moved && dy > Math.abs(dx)) { s.id = null; return; }
    s.moved = true;
    if (dx > 0) {
      const el = e.currentTarget;
      el.style.transition = 'none';
      el.style.transform = `translateX(${Math.min(dx * 0.5, 65)}px)`;
    }
  };
  const onMsgTouchEnd = (e, msgId, msg) => {
    const s = swipeState.current;
    if (s.id !== msgId || !s.moved) return;
    const el = e.currentTarget;
    el.style.transition = 'transform 0.25s ease';
    el.style.transform = '';
    const dx = e.changedTouches[0].clientX - s.startX;
    if (dx > 50) {
      s.didSwipe = true;
      setReplyingTo({ id: msg.id, nickname: msg.nickname, content: msg.content });
      setSelectedMsgId(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
    swipeState.current = {};
  };
  const onMsgClick = (e, msgId) => {
    if (swipeState.current.didSwipe) return;
    e.stopPropagation();
    setSelectedMsgId(s => s === msgId ? null : msgId);
  };

  if (!boardId || !user) return null;

  return (
    <div ref={containerRef} style={{ position:'fixed', bottom:'calc(76px + env(safe-area-inset-bottom, 0px))', right:16, zIndex:1100 }}>
      {/* Floating button */}
      {!open && (
        <button onClick={handleOpen} style={{
          width:52, height:52, borderRadius:'50%', border:'none', cursor:'pointer',
          background:`linear-gradient(135deg,#00205B,#003580)`,
          boxShadow:'0 4px 16px rgba(0,32,91,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
          WebkitTapHighlightColor:'transparent',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="rgba(255,255,255,0.15)"/>
            <line x1="9" y1="8" x2="15" y2="8"/>
            <line x1="9" y1="12" x2="13" y2="12"/>
          </svg>
          {hasUnread && (
            <div style={{
              position:'absolute', top:4, right:4,
              width:12, height:12, borderRadius:'50%',
              background:'#E8112D', border:'2px solid #fff',
            }}/>
          )}
        </button>
      )}

      {/* Chat popup */}
      {open && (
        <div style={{
          position:'fixed',
          bottom:'calc(76px + env(safe-area-inset-bottom, 0px))',
          right:16,
          width: Math.min(340, window.innerWidth - 32),
          height: Math.min(440, window.innerHeight - 160),
          borderRadius:20, overflow:'hidden',
          boxShadow:'0 8px 40px rgba(0,0,0,0.25)',
          display:'flex', flexDirection:'column',
          background:'#fff',
          border:'1px solid rgba(0,32,91,0.1)',
          zIndex:1100,
        }}>
          {/* Header */}
          <div style={{
            background:`linear-gradient(135deg,#00205B,#003580)`,
            padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0,
          }}>
            <span style={{ color:'#fff', fontWeight:900, fontSize:14, letterSpacing:0.5, display:'flex', alignItems:'center', gap:6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="rgba(255,255,255,0.2)"/>
                <line x1="9" y1="8" x2="15" y2="8"/>
                <line x1="9" y1="12" x2="13" y2="12"/>
              </svg>
              CHAT
            </span>
            <button onClick={handleClose} style={{
              background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8,
              color:'#fff', fontSize:18, cursor:'pointer', lineHeight:1, padding:'2px 8px',
              WebkitTapHighlightColor:'transparent',
            }}>×</button>
          </div>

          {/* Messages */}
          <div onClick={() => setSelectedMsgId(null)} style={{ flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ textAlign:'center', margin:'4px 0 8px' }}>
              <span style={{
                display:'inline-block', background:'#f0f4ff', borderRadius:20,
                padding:'5px 14px', fontSize:11, color:'#666', fontStyle:'italic', lineHeight:1.5,
              }}>
                💬 {lang === 'ro'
                  ? 'Ultimele 50 mesaje păstrate · reset zilnic la 00:00 ora României'
                  : 'Last 50 messages kept · daily reset at 00:00 Romania time'}
              </span>
            </div>
            {messages.length === 0 && (
              <div style={{ textAlign:'center', color:'#aaa', fontSize:12, marginTop:20 }}>
                {lang === 'ro' ? 'Niciun mesaj încă. Fii primul!' : 'No messages yet. Be the first!'}
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.user_id === user?.id;
              if (msg.is_system) return (
                <div key={msg.id} style={{ textAlign:'center', margin:'4px 0' }}>
                  <span style={{
                    display:'inline-block', background:'#f0f4ff', borderRadius:20,
                    padding:'4px 14px', fontSize:11, color:'#555', fontStyle:'italic',
                  }}>{msg.content}</span>
                </div>
              );
              return (
                <div key={msg.id} style={{ display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  {!isMe && <span style={{ fontSize:10, color:'#888', marginBottom:2, marginLeft:4 }}>{msg.nickname}</span>}
                  {editingId === msg.id ? (
                    <div style={{ width:'80%', display:'flex', flexDirection:'column', gap:4 }}>
                      <textarea
                        ref={editInputRef}
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        maxLength={300}
                        rows={2}
                        style={{
                          width:'100%', border:'1.5px solid #003580', borderRadius:10, padding:'6px 10px',
                          fontSize:13, outline:'none', fontFamily:'inherit',
                          background:'#fff', color:'#111', resize:'none', lineHeight:1.4, boxSizing:'border-box',
                        }}
                      />
                      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                        <button onClick={cancelEdit} style={{ fontSize:11, padding:'3px 10px', border:'1px solid #ddd', borderRadius:8, cursor:'pointer', background:'#f5f5f5', color:'#555' }}>✕</button>
                        <button onClick={handleSaveEdit} style={{ fontSize:11, padding:'3px 10px', border:'none', borderRadius:8, cursor:'pointer', background:'#00205B', color:'#fff' }}>���</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display:'flex', alignItems:'flex-end', gap:4, flexDirection: isMe ? 'row' : 'row-reverse' }}>
                        {isMe && (
                          <button onClick={() => startEdit(msg)} title="Editează" style={{
                            background:'none', border:'none', cursor:'pointer', padding:'0 2px', color:'#bbb',
                            fontSize:13, lineHeight:1, flexShrink:0, marginBottom:2,
                            WebkitTapHighlightColor:'transparent',
                          }}>✎</button>
                        )}
                        <div
                          onTouchStart={msg.is_system ? undefined : e => onMsgTouchStart(e, msg.id)}
                          onTouchMove={msg.is_system ? undefined : e => onMsgTouchMove(e, msg.id)}
                          onTouchEnd={msg.is_system ? undefined : e => onMsgTouchEnd(e, msg.id, msg)}
                          onClick={msg.is_system ? undefined : e => onMsgClick(e, msg.id)}
                          style={{
                            maxWidth:'100%', padding:'7px 11px', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            background: isMe ? '#00205B' : '#f1f3f8',
                            color: isMe ? '#fff' : '#111',
                            fontSize:13, lineHeight:1.4, wordBreak:'break-word', cursor: msg.is_system ? 'default' : 'pointer',
                            WebkitTapHighlightColor:'transparent', willChange:'transform',
                          }}
                        >
                          {msg.reply_to_content && (
                            <div style={{
                              borderLeft: `3px solid ${isMe ? 'rgba(255,255,255,0.5)' : '#003580'}`,
                              paddingLeft:8, marginBottom:6,
                              opacity:0.8, fontSize:11,
                            }}>
                              <div style={{ fontWeight:700, marginBottom:2 }}>{msg.reply_to_nickname}</div>
                              <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>{msg.reply_to_content}</div>
                            </div>
                          )}
                          {msg.content}
                          {msg.edited_at && <span style={{ fontSize:9, opacity:0.55, marginLeft:5 }}>{lang === 'ro' ? '(editat)' : '(edited)'}</span>}
                        </div>
                      </div>
                      {/* Reaction picker — apare la click pe bulă */}
                      {selectedMsgId === msg.id && (
                        <div style={{
                          display:'flex', gap:4, marginTop:4, flexWrap:'wrap',
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                        }}>
                          {[['likes', false, handleLike], ['dislikes', true, handleDislike]].map(([type, rotate, fn]) => {
                            const arr = msg[type] || [];
                            const active = arr.includes(user?.id);
                            return (
                              <button key={type} onClick={() => fn(msg)} style={{
                                background: active ? 'rgba(0,32,91,0.12)' : '#f1f3f8',
                                border: active ? '1.5px solid #003580' : '1.5px solid #e0e4ef',
                                borderRadius:20, cursor:'pointer', padding:'4px 10px',
                                display:'flex', alignItems:'center', gap:4,
                                WebkitTapHighlightColor:'transparent', transition:'all 0.12s',
                              }}>
                                <span style={{ fontSize:15, display:'inline-block', transform: rotate ? 'rotate(180deg)' : 'none' }}>🚀</span>
                                {arr.length > 0 && <span style={{ fontSize:11, color: active ? '#00205B' : '#888', fontWeight: active ? 700 : 400 }}>{arr.length}</span>}
                              </button>
                            );
                          })}
                          {!msg.is_system && (
                            <button onClick={() => {
                              setReplyingTo({ id: msg.id, nickname: msg.nickname, content: msg.content });
                              setSelectedMsgId(null);
                              setTimeout(() => inputRef.current?.focus(), 80);
                            }} style={{
                              background:'#f1f3f8', border:'1.5px solid #e0e4ef',
                              borderRadius:20, cursor:'pointer', padding:'4px 12px',
                              display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#555',
                              WebkitTapHighlightColor:'transparent',
                            }}>↩ {lang === 'ro' ? 'Reply' : 'Reply'}</button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {/* Timestamp + count-uri permanente */}
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize:10, color:'#bbb', marginLeft:4, marginRight:2 }}>{formatTime(msg.created_at)}</span>
                    {!msg.is_system && (() => {
                      const likes    = msg.likes    || [];
                      const dislikes = msg.dislikes || [];
                      const uid = user?.id;
                      return (
                        <>
                          {likes.length > 0 && <span style={{ fontSize:11, color: likes.includes(uid) ? '#00205B' : '#aaa', fontWeight: likes.includes(uid) ? 700 : 400 }}>🚀 {likes.length}</span>}
                          {dislikes.length > 0 && <span style={{ fontSize:11, color: dislikes.includes(uid) ? '#00205B' : '#aaa', fontWeight: dislikes.includes(uid) ? 700 : 400, display:'inline-block', transform:'rotate(180deg)' }}>🚀</span>}
                          {dislikes.length > 0 && <span style={{ fontSize:11, color: dislikes.includes(uid) ? '#00205B' : '#aaa', fontWeight: dislikes.includes(uid) ? 700 : 400 }}>{dislikes.length}</span>}
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Reply preview */}
          {replyingTo && (
            <div style={{
              padding:'6px 12px', borderTop:'1px solid #eee', background:'#f8f9fc',
              display:'flex', alignItems:'center', gap:8, flexShrink:0,
            }}>
              <div style={{ flex:1, borderLeft:'3px solid #003580', paddingLeft:8, fontSize:11, color:'#555', overflow:'hidden' }}>
                <div style={{ fontWeight:700, color:'#003580', marginBottom:1 }}>{replyingTo.nickname}</div>
                <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{replyingTo.content}</div>
              </div>
              <button onClick={() => setReplyingTo(null)} style={{
                background:'none', border:'none', cursor:'pointer', color:'#aaa', fontSize:16, padding:2, flexShrink:0,
                WebkitTapHighlightColor:'transparent',
              }}>×</button>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding:'8px 10px', borderTop:'1px solid #eee', display:'flex', gap:8, flexShrink:0, background:'#fff',
          }}>
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => {
                setText(e.target.value);
                e.target.style.height = 'auto';
                const h = Math.min(e.target.scrollHeight, 120);
                e.target.style.height = h + 'px';
                e.target.style.overflowY = e.target.scrollHeight > 120 ? 'auto' : 'hidden';
              }}
              onKeyDown={handleKey}
              placeholder={lang === 'ro' ? 'Scrie un mesaj...' : 'Write a message...'}
              maxLength={600}
              rows={1}
              style={{
                flex:1, border:'1px solid #dde', borderRadius:16, padding:'8px 14px',
                fontSize:13, outline:'none', fontFamily:'inherit',
                background:'#f8f9fc', color:'#111', resize:'none', overflowY:'hidden',
                lineHeight:1.4, minHeight:36, maxHeight:120,
              }}
            />
            <button onClick={handleSend} disabled={!text.trim() || sending} style={{
              width:38, height:38, borderRadius:'50%', border:'none', cursor:'pointer', flexShrink:0,
              background: text.trim() ? `linear-gradient(135deg,#00205B,#003580)` : '#eee',
              color: text.trim() ? '#fff' : '#aaa', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center',
              WebkitTapHighlightColor:'transparent', transition:'all 0.15s',
            }}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const isTouchDevice = () => navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 768 && !isTouchDevice());
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 768 && !isTouchDevice());
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(()=>{
    const style = document.createElement("style");
    style.textContent = `
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes pulse { 0%,100%{transform:scale(1);box-shadow:0 4px 20px rgba(200,16,46,0.25)} 50%{transform:scale(1.025);box-shadow:0 12px 40px rgba(200,16,46,0.7)} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes tabPop { 0%{transform:scale(1)} 40%{transform:scale(1.22)} 70%{transform:scale(0.95)} 100%{transform:scale(1)} }
      @keyframes cdSlideIn { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:translateY(0)} }
      @keyframes cdTicker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      @keyframes barPulse { 0%,100%{opacity:1;width:8%} 50%{opacity:0.5;width:14%} }
      @keyframes nodeBreath { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(10,46,138,0.4)} 50%{transform:scale(1.12);box-shadow:0 0 0 7px rgba(10,46,138,0)} }
      input, textarea, select { font-size: 16px !important; }
    `;
    document.head.appendChild(style);
    return ()=>document.head.removeChild(style);
  },[]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const setupPushNotifications = React.useCallback(async (userId) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      const reg = await navigator.serviceWorker.ready;
      const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      const existing = await reg.pushManager.getSubscription();
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: Uint8Array.from(
          atob(VAPID_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/')),
          c => c.charCodeAt(0)
        ),
      });
      await savePushSubscription(userId, sub);
    } catch (e) {
      console.warn('[push] setup failed:', e);
    }
  }, []);
  const [realStandings, setRealStandings] = useState({});
  useEffect(() => {
    const refreshStandings = () =>
      loadRealGroupStandings().then(s => { if (Object.keys(s).length > 0) setRealStandings(s); });
    refreshStandings();
    const channel = supabase
      .channel('live_scores_standings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_scores' }, (payload) => {
        if (payload.new?.status === 'FT') refreshStandings();
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);
  const [predScoring, setPredScoring] = useState(DEFAULT_PRED_SCORING);
  const [exactScoring, setExactScoring] = useState(DEFAULT_EXACT_SCORING);
  const predMax = React.useMemo(() => computePredMax(predScoring), [predScoring]);
  useEffect(() => {
    fetchScoringRules().then(rules => {
      if (rules?.prediction && Object.keys(rules.prediction).length > 0)
        setPredScoring(rules.prediction);
      if (rules?.exact_score && Object.keys(rules.exact_score).length > 0)
        setExactScoring(rules.exact_score);
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(prev => {
        // Reset all user-specific state when user changes (sign out or different user)
        if (prev?.id !== u?.id) {
          setAllInstantPickStates({});
          setExactScoresByBoard({});
          setPredictionsComplete({});
          setPredictionsLoaded({});
          setAllInstantPickDone({});
          setLeaderboardData({});
          setCreatedBoards([]);
          setAvailableBoards([]);
          setMyBoards([]);
          setBoardsLoading(true);
          try {
            localStorage.removeItem('myBoards');
            localStorage.removeItem('activeBoardId');
          } catch {}
        }
        return u;
      });
      setAuthLoading(false);

      // PASSWORD_RECOVERY: Supabase a procesat token-ul de reset — arată formularul.
      if (event === 'PASSWORD_RECOVERY') {
        inRecoveryRef.current = true;
        setScreen(SCREENS.RESET_PASSWORD);
        return;
      }

      // INITIAL_SESSION se declanșează DUPĂ PASSWORD_RECOVERY (sau ca fallback pentru URL recovery).
      // În ambele cazuri, nu navigăm la HOME.
      if (inRecoveryRef.current) return;
      if (event === 'INITIAL_SESSION' && _isRecoveryUrl) {
        inRecoveryRef.current = true;
        setScreen(SCREENS.RESET_PASSWORD);
        return;
      }

      if (u) {
        if (event === 'INITIAL_SESSION') {
          Promise.all([loadSystemNotifications(lang), loadNotifReads(u.id)]).then(([notifs, ids]) => { setSystemNotifs(notifs); setNotifReadIds(ids); });
          setupPushNotifications(u.id);
          const nonRestorable = [SCREENS.SPLASH, SCREENS.LOGIN, SCREENS.RESET_PASSWORD, SCREENS.SET_PASSWORD];
          const saved = (() => { try { return localStorage.getItem('lastScreen'); } catch { return null; } })();
          setScreen(saved && !nonRestorable.includes(saved) ? saved : SCREENS.HOME);
        } else if (event === 'SIGNED_IN') {
          Promise.all([loadSystemNotifications(lang), loadNotifReads(u.id)]).then(([notifs, ids]) => { setSystemNotifs(notifs); setNotifReadIds(ids); });
          setupPushNotifications(u.id);
          setScreen(SCREENS.HOME);
        }
        // USER_UPDATED, TOKEN_REFRESHED — only update user state, don't navigate
      } else setScreen(SCREENS.SPLASH);
    });

    supabase.auth.getSession().then(() => setAuthLoading(false));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    const applyPicks = (boardId, preds, scores, special) => {
      if (preds) {
        setAllInstantPickStates(p => ({
          ...p,
          [boardId]: {
            ...(p[boardId] || {}),
            groupRankings: preds.group_rankings || {},
            best3:         preds.best3_picks    || [],
            koPicks:       preds.ko_picks       || {},
          }
        }));
        const loadedProgress = getPredictionProgress({
          groupRankings: preds.group_rankings || {},
          best3: preds.best3_picks || [],
        });
        const hasTask1 = loadedProgress.complete;
        const hasTask2 = Object.keys(preds.ko_picks || {}).length > 0;
        setPredictionsComplete(p => ({ ...p, [boardId]: hasTask1 || hasTask2 }));
        setAllInstantPickDone(p => ({ ...p, [boardId]: hasTask1 || hasTask2 }));
        if (hasTask2) setAllKoPickDone(p => ({ ...p, [boardId]: true }));
        setGroupsDoneCountByBoard(p=>({...p,[boardId]:loadedProgress.groupsDone}));
        setAllGroupsDoneByBoard(p=>({...p,[boardId]:loadedProgress.groupsDone >= INTERACTIVE_GROUPS.length}));
      }
      if (scores && Object.keys(scores).length > 0)
        setExactScoresByBoard(p => ({ ...p, [boardId]: scores }));
      if (special?.champion)
        setAllChampionPicks(p => ({ ...p, [boardId]: special.champion }));
      if (special?.topScorer)
        setAllTopScorerPicks(p => ({ ...p, [boardId]: special.topScorer }));
      if (special?.runnerUp)
        setAllRunnerUpPicks(p => ({ ...p, [boardId]: special.runnerUp }));
      setPredictionsLoaded(p => ({ ...p, [boardId]: true }));
    };

    // Boards + picks loaded in 2 parallel waves (7 total requests vs 10+3N before)
    const refreshBoards = async () => {
      const [{ userBoards, availableBoards }, allPicks] = await Promise.all([
        loadAllBoards(uid),
        loadAllUserPicks(uid),
      ]);

      // Apply picks for global + all user boards
      const allBoardIds = ['global', ...userBoards.map(b => b.id)];
      await ensureBoardScores(uid, allBoardIds);
      allBoardIds.forEach(id => applyPicks(id, allPicks.predictions[id], allPicks.exactScores[id], allPicks.specialPicks[id]));

      const adminBoards = userBoards.filter(b => b.isAdmin);
      // boards where creator left as participant — visible in Admin tab + Discover, not in My Boards
      const adminOnlyBoards = adminBoards.filter(b => !b.isMember);
      const participantBoards = sortJoinedBoards(userBoards.filter(b => b.isMember));
      const seen = new Set(INITIAL_BOARDS.map(b => b.id));
      const allMyBoards = [...INITIAL_BOARDS];
      for (const b of participantBoards) {
        if (!seen.has(b.id)) { seen.add(b.id); allMyBoards.push(b); }
      }
      const allIds = [...allMyBoards.map(b => b.id), ...adminBoards.map(b => b.id), ...availableBoards.map(b => b.id), ...adminOnlyBoards.map(b => b.id)];
      const counts = await fetchMemberCounts(allIds);
      const freshBoards = allMyBoards.map(b => ({ ...b, members: counts[b.id] ?? b.members }));
      setMyBoards(freshBoards);
      // Preîncarcă imaginile boardurilor ca să nu apară cu delay în slider
      freshBoards.forEach(b => { if (b.image_url) { const i = new Image(); i.src = b.image_url; } });
      if (!freshBoards.some(b => b.id === activeBoardIdRef.current)) {
        setActiveBoardId('global');
      }
      try { localStorage.setItem('myBoards', JSON.stringify(freshBoards)); } catch {}
      setCreatedBoards(adminBoards.map(b => ({ ...b, members: counts[b.id] ?? 0 })));
      // adminOnlyBoards apar și în Discover ca să se poată re-înscrie
      setAvailableBoards([...availableBoards, ...adminOnlyBoards].map(b => ({ ...b, members: counts[b.id] ?? 0 })));
      return userBoards;
    };
    refreshBoards().then(() => { setBoardsLoading(false); });

    // Realtime: actualizează membrii și board-urile când se schimbă ceva
    const boardChannel = supabase
      .channel('boards-rt')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'board_members' },
        () => { refreshBoards(); }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'boards' },
        () => { refreshBoards(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(boardChannel); };
  }, [user]);

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const inRecoveryRef = useRef(false);
  const notificationsBackRef = useRef(SCREENS.HOME);
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [systemNotifs, setSystemNotifs] = useState([]);
  const [notifReadIds, setNotifReadIds] = useState([]);
  const hasUnread = systemNotifs.some(n => !notifReadIds.includes(n.id));
  const [championMode, setChampionMode] = useState("champion");
  const [championBackScreen, setChampionBackScreen] = useState(SCREENS.HOME);
  const [boardsInitialTab, setBoardsInitialTab] = useState("my");
  const [boardsSubView, setBoardsSubView] = useState("main");
  const [showDevOverlay, setShowDevOverlay] = useState(false);
  const [appConfig, setAppConfig] = useState({});
  const [simDay, setSimDay] = useState(null);
  const [simHour, setSimHour] = useState(12);
  const [simMin, setSimMin] = useState(0);
  const [simStarted, setSimStarted] = useState(false);
  // Simulated current date used across app
  const simDate = simDay ? new Date(2026,5,simDay,simHour,simMin,0) : null;
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('predicto_lang')||"en"; } catch { return "en"; } });
  useEffect(()=>{ try { localStorage.setItem('predicto_lang', lang); } catch {} }, [lang]);
  useEffect(() => {
    supabase.from('app_config').select('key,value').then(({ data }) => {
      if (!data) return;
      const cfg = Object.fromEntries(data.map(r => [r.key, r.value]));
      setAppConfig(cfg);
      if (cfg.bonus_pick_deadline) _bonusDeadlineMs = new Date(cfg.bonus_pick_deadline).getTime();
    });
  }, []);
  useEffect(() => {
    if (user) loadSystemNotifications(lang).then(setSystemNotifs);
  }, [lang]);
  const _cachedBoards = (() => { try { const s = localStorage.getItem('myBoards'); return s ? JSON.parse(s) : []; } catch { return []; } })();
  const [myBoards, setMyBoards] = useState(_cachedBoards);
  const [boardsLoading, setBoardsLoading] = useState(_cachedBoards.length === 0);
  const [toast, showToast] = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [skipOnboarding, setSkipOnboarding] = useState(false);
  const [showFirstAction, setShowFirstAction] = useState(false);
  const [groupsInitialWeek, setGroupsInitialWeek] = useState(null);
  const [createdBoards, setCreatedBoards] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState({});

  const [availableBoards, setAvailableBoards] = useState([]);

  // Predictions complete per board id
  const [predictionsComplete, setPredictionsComplete] = useState({});
  const [predictionsLoaded, setPredictionsLoaded] = useState({});
  const _cachedActiveBoardId = (() => { try { return localStorage.getItem('activeBoardId') || "global"; } catch { return "global"; } })();
  const [activeBoardId, setActiveBoardId] = useState(_cachedActiveBoardId);
  const activeBoardIdRef = useRef(_cachedActiveBoardId);
  const forgetRemovedBoard = () => {};
  const rememberRemovedBoard = () => {};

  useEffect(() => {
    activeBoardIdRef.current = activeBoardId;
    try { localStorage.setItem('activeBoardId', activeBoardId); } catch {}
  }, [activeBoardId]);

  useEffect(() => {
    if (!user || (screen !== SCREENS.LEADERBOARD && screen !== SCREENS.HOME)) return;
    loadLeaderboard(activeBoardId, null, user.id).then(rows => {
      if (rows.length > 0)
        setLeaderboardData(prev => ({ ...prev, [activeBoardId]: rows }));
    });
  }, [user, screen, activeBoardId]);

  useEffect(() => {
    if (!user || screen !== SCREENS.HOME || myBoards.length === 0) return;
    myBoards.forEach(b => {
      if (leaderboardData[b.id]?.length > 0) return;
      loadLeaderboard(b.id, null, user.id).then(rows => {
        if (rows.length > 0)
          setLeaderboardData(prev => ({ ...prev, [b.id]: rows }));
      });
    });
  }, [user, screen, myBoards]);

  const [myScoreBreakdowns, setMyScoreBreakdowns] = useState({});
  useEffect(() => {
    if (!user) return;
    const refresh = (boardId) =>
      loadMyScoreBreakdown(user.id, boardId).then(bd => {
        setMyScoreBreakdowns(prev => ({ ...prev, [boardId]: bd }));
      });
    if (screen === SCREENS.HOME) refresh(activeBoardId);
    const channel = supabase
      .channel('board_scores_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'board_scores', filter: `user_id=eq.${user.id}` }, () => {
        refresh(activeBoardId);
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [user, screen, activeBoardId]);

  const [allInstantPickStates, setAllInstantPickStates] = useState({});
  const [exactScoresByBoard, setExactScoresByBoard] = useState({});
  const exactScores = exactScoresByBoard[activeBoardId] || {};
  const setExactScores = (updater) => {
    setExactScoresByBoard(prev => {
      const cur = prev[activeBoardId] || {};
      const next = typeof updater === "function" ? updater(cur) : updater;
      return {...prev, [activeBoardId]: next};
    });
  };
  const [allInstantPickDone, setAllInstantPickDone] = useState({});
  const [allGroupsDoneByBoard, setAllGroupsDoneByBoard] = useState({});
  const [groupsDoneCountByBoard, setGroupsDoneCountByBoard] = useState({});
  const [allKoPickDone, setAllKoPickDone] = useState({});
  const [allChampionPicks, setAllChampionPicks] = useState({});
  const [allTopScorerPicks, setAllTopScorerPicks] = useState({});
  const [allRunnerUpPicks, setAllRunnerUpPicks] = useState({});
  const [bugLog, setBugLog] = useState([]);
  useEffect(()=>{
    const fmt = ()=>new Date().toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const onErr = (msg,source,line,_col,err)=>{
      setBugLog(p=>[...p,{message:String(msg),source,line,stack:err?.stack||null,time:fmt()}]);
    };
    const onUnhandled = (e)=>{
      const err = e.reason;
      setBugLog(p=>[...p,{message:err?.message||String(err),source:"Promise",line:null,stack:err?.stack||null,time:fmt()}]);
    };
    window.addEventListener("error",onErr);
    window.addEventListener("unhandledrejection",onUnhandled);
    return ()=>{ window.removeEventListener("error",onErr); window.removeEventListener("unhandledrejection",onUnhandled); };
  },[]);
  const instantPickState = allInstantPickStates[activeBoardId]||null;
  const instantPickDone = allInstantPickDone[activeBoardId]||false;
  const koPickDone = allKoPickDone[activeBoardId]||false;
  const setInstantPickState = (s) => {
    setAllInstantPickStates(p=>({...p,[activeBoardId]:s}));
    const progress = getPredictionProgress(s || {});
    setGroupsDoneCountByBoard(p=>({...p,[activeBoardId]:progress.groupsDone}));
    setAllGroupsDoneByBoard(p=>({...p,[activeBoardId]:progress.groupsDone >= INTERACTIVE_GROUPS.length}));
    setAllInstantPickDone(p=>({...p,[activeBoardId]:progress.complete}));
    setPredictionsComplete(p=>({...p,[activeBoardId]:progress.complete}));
  };
  const setInstantPickDone = (v) => setAllInstantPickDone(p=>({...p,[activeBoardId]:v}));
  const setKoPickDone = (v) => setAllKoPickDone(p=>({...p,[activeBoardId]:v}));
  const championPick = allChampionPicks[activeBoardId]||null;
  const topScorerPick = allTopScorerPicks[activeBoardId]||null;
  const runnerUpPick = allRunnerUpPicks[activeBoardId]||null;
  const setChampionPick = (v) => {
    setAllChampionPicks(p => {
      const next = { ...p, [activeBoardId]: v };
      if (user) saveSpecialPick(user.id, activeBoardId, { champion: v, topScorer: allTopScorerPicks[activeBoardId] || null, runnerUp: allRunnerUpPicks[activeBoardId] || null });
      return next;
    });
  };
  const setTopScorerPick = (v) => {
    setAllTopScorerPicks(p => {
      const next = { ...p, [activeBoardId]: v };
      if (user) saveSpecialPick(user.id, activeBoardId, { champion: allChampionPicks[activeBoardId] || null, topScorer: v, runnerUp: allRunnerUpPicks[activeBoardId] || null });
      return next;
    });
  };
  const setRunnerUpPick = (v) => {
    setAllRunnerUpPicks(p => {
      const next = { ...p, [activeBoardId]: v };
      if (user) saveSpecialPick(user.id, activeBoardId, { champion: allChampionPicks[activeBoardId] || null, topScorer: allTopScorerPicks[activeBoardId] || null, runnerUp: v });
      return next;
    });
  };
  const _koUnlockDate = new Date(appConfig.ko_unlock_date || '2026-06-27T18:00:00Z');
  const _predDeadline = new Date(appConfig.prediction_deadline || '2026-06-11T20:00:00Z');
  const koUnlocked = simDay ? (simDay > 27 || (simDay === 27 && (simHour||0) >= 21)) : new Date() >= _koUnlockDate;
  const task1DeadlinePassed = simDay ? (simDay > 11 || (simDay === 11 && (simHour||0) >= 19)) : new Date() >= _predDeadline;
  const shouldStartAtKo = koUnlocked && instantPickDone && !koPickDone;

  // Auto-save: persistă selecțiile intermediare în DB (debounced 1s)
  // Previne pierderea datelor la refresh de browser
  const _autoSaveTimer = useRef(null);
  useEffect(() => {
    if (!user || !instantPickState) return;
    const hasData = Object.keys(instantPickState.groupRankings || {}).length > 0 ||
                    (instantPickState.best3 || []).length > 0 ||
                    Object.keys(instantPickState.koPicks || {}).length > 0;
    if (!hasData) return;
    clearTimeout(_autoSaveTimer.current);
    _autoSaveTimer.current = setTimeout(() => {
      savePredictions(user.id, activeBoardId, instantPickState);
    }, 1000);
    return () => clearTimeout(_autoSaveTimer.current);
  }, [instantPickState, activeBoardId, user]);
  // Predictions state per board
  const [allPredictions, setAllPredictions] = useState({});
  const getPreds = (boardId) => allPredictions[boardId] || { groupRank:{}, best3picks:[], knockoutPicks:{}, teamBooster:null, golgheter:null };
  const setPreds = (boardId, updater) => setAllPredictions(a => {
    const cur = a[boardId] || { groupRank:{}, best3picks:[], knockoutPicks:{}, teamBooster:null, golgheter:null };
    const next = typeof updater === "function" ? updater(cur) : {...cur, ...updater};
    return {...a, [boardId]: next};
  });
  // Tournament starts June 11 2026
  const _tournStart = new Date(appConfig.tournament_start || '2026-06-11T23:00:00Z');
  const tournamentStarted = simDate ? simDate >= _tournStart : new Date() >= _tournStart;

  const noFooter = [SCREENS.SPLASH, SCREENS.LOGIN, SCREENS.INSTANT_PICK, SCREENS.GROUPS_SCHEDULE, SCREENS.CHAMPION, SCREENS.BONUS];
  const showFooter = !noFooter.includes(screen) && !(screen===SCREENS.BOARDS && boardsSubView==="create");
  const _nonSaveable = [SCREENS.SPLASH, SCREENS.LOGIN, SCREENS.RESET_PASSWORD, SCREENS.SET_PASSWORD];
  if (!_nonSaveable.includes(screen)) { try { localStorage.setItem('lastScreen', screen); } catch {} }
  const footerActive = screen===SCREENS.RULES?SCREENS.RULES:screen===SCREENS.LEADERBOARD?SCREENS.LEADERBOARD:screen===SCREENS.BOARDS?SCREENS.BOARDS:screen===SCREENS.ACCOUNT?SCREENS.ACCOUNT:SCREENS.HOME;

  if (authLoading || (user && boardsLoading)) return <LoadingState title={authLoading ? T[lang].loadingTitle : T[lang].loadingLeagues} body={authLoading ? T[lang].loadingSession : T[lang].loadingBoards} />;

  return (
    <ScoringContext.Provider value={{ pred: predScoring, exact: exactScoring, predMax }}>
    <UserCtx.Provider value={user}>
    <LangCtx.Provider value={lang}>
    <div style={{width:"100%",height:"100%",background:BG,display:"flex",flexDirection:"column",position:"relative",fontFamily:"-apple-system,'SF Pro Display',sans-serif",paddingTop:"env(safe-area-inset-top, 0px)",boxSizing:"border-box"}}>
        {isDesktop && <DesktopBlocker />}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {screen==="dev"&&<DevPanel
            onAutoPick={(state)=>{
              setAllInstantPickStates(p=>({...p,global:state}));
              setAllInstantPickDone(p=>({...p,global:true}));
            }}
            onStart={(day,hour,min,started)=>{
            setSimDay(day);
            setSimHour(hour);
            setSimMin(min);
            setSimStarted(started);
            if(started && day>=11) {
              LIVE_SCORES = {
                "11-0": { home:2, away:1, status:"FT" },
                "11-1": { home:1, away:1, status:"LIVE", min:45 },
                "11-2": { home:2, away:0, status:"FT" },
              };
            } else {
              LIVE_SCORES = {};
            }
            setScreen(SCREENS.SPLASH);
          }}/>}
          {screen===SCREENS.SPLASH&&<SplashScreen simDay={simDay} simHour={simHour} simMin={simMin} tournamentStarted={tournamentStarted} onNext={()=>setScreen(SCREENS.LOGIN)} lang={lang} setLang={setLang}/>}
          {screen===SCREENS.LOGIN&&<LoginScreen onBack={()=>setScreen(SCREENS.SPLASH)} onNext={()=>{ if(!skipOnboarding) setShowOnboarding(true); setScreen(SCREENS.HOME); }}/>}
          {showOnboarding&&(
            <OnboardingSheet onDone={()=>{ setShowOnboarding(false); if(screen===SCREENS.HOME){setShowFirstAction(true);setTimeout(()=>setShowFirstAction(false),5000);} }}/>
          )}
          {user&&<div style={{display:screen===SCREENS.HOME?'flex':'none',flex:1,flexDirection:'column',overflow:'hidden',minHeight:0}}>
            <HomeScreen
              onPredict={(boardId)=>{ setActiveBoardId(boardId); setShowFirstAction(false); setScreen(SCREENS.INSTANT_PICK); }}
              onPredictKo={(boardId)=>{ setActiveBoardId(boardId); setShowFirstAction(false); setScreen(SCREENS.INSTANT_PICK); }}
              onLeaderboard={()=>setScreen(SCREENS.LEADERBOARD)}
              onBoards={(tab)=>{ setBoardsInitialTab(tab||"my"); setScreen(SCREENS.BOARDS); }}
              onOpenGroups={(week)=>{ setGroupsInitialWeek(week||null); setScreen(SCREENS.GROUPS_SCHEDULE); }}
              onCopyExactScores={async (targetBoardId, weekStart)=>{
                if(!user) return;
                const scores = exactScoresByBoard[activeBoardId] || {};
                let entries = Object.entries(scores);
                if(weekStart != null){
                  const weekEnd = weekStart + 6;
                  entries = entries.filter(([k])=>{ const d=parseInt(k,10); return d>=weekStart&&d<=weekEnd; });
                }
                if(!entries.length) return;
                for(const [matchKey,sc] of entries){
                  await saveExactScore(user.id,targetBoardId,matchKey,sc.home,sc.away);
                }
                setExactScoresByBoard(prev => ({
                  ...prev,
                  [targetBoardId]: { ...(prev[targetBoardId]||{}), ...Object.fromEntries(entries) }
                }));
                showToast("Scores copied!","⚽");
              }}
              onCopyPredictions={async (targetBoardId)=>{
                if(!user||!instantPickState) return;
                await savePredictions(user.id, targetBoardId, instantPickState);
                setAllInstantPickDone(p=>({...p,[targetBoardId]:true}));
                setPredictionsComplete(p=>({...p,[targetBoardId]:true}));
                setAllInstantPickStates(p=>({...p,[targetBoardId]:instantPickState}));
                showToast("Predictions copied!","✅");
              }}
              onCopySpecial={async (targetBoardId, mode)=>{
                if(!user) return;
                const copyChamp = !mode || mode==="champion" || mode==="special";
                const copyScorer = !mode || mode==="scorer" || mode==="special";
                const payload = {};
                if(copyChamp) payload.champion = championPick;
                if(copyScorer) payload.topScorer = topScorerPick;
                await saveSpecialPick(user.id, targetBoardId, payload);
                if(copyChamp) setAllChampionPicks(p=>({...p,[targetBoardId]:championPick}));
                if(copyScorer) setAllTopScorerPicks(p=>({...p,[targetBoardId]:topScorerPick}));
                showToast("Special picks copied!","🏆");
              }}
              onAccount={()=>setScreen(SCREENS.ACCOUNT)}
              onNotifications={()=>{ notificationsBackRef.current=SCREENS.HOME; setScreen(SCREENS.NOTIFICATIONS); }}
              onChampion={(mode)=>{ setChampionBackScreen(SCREENS.HOME); setChampionMode(mode||"champion"); setScreen(SCREENS.CHAMPION); }}
              onBooster={()=>setScreen(SCREENS.BOOSTER)}
              onBonus={()=>setScreen(SCREENS.BONUS)}
              myBoards={myBoards}
              predictionsComplete={predictionsComplete}
              instantPickState={instantPickState}
              instantPickDone={instantPickDone}
              allGroupsDone={!!(allGroupsDoneByBoard[activeBoardId])}
              groupsDoneCount={groupsDoneCountByBoard[activeBoardId]??null}
              koPickDone={koPickDone}
              koUnlocked={koUnlocked}
              exactScores={exactScores}
              simDay={simDay} simHour={simHour} simMin={simMin}
              activeBoardId={activeBoardId}
              setActiveBoardId={setActiveBoardId}
              tournamentStarted={tournamentStarted}
              createdBoards={createdBoards}
              showFirstAction={showFirstAction}
              leaderboardData={leaderboardData}
              boardsLoading={boardsLoading}
              predictionsLoaded={predictionsLoaded}
              championPick={championPick}
              runnerUpPick={runnerUpPick}
              topScorerPick={topScorerPick}
              setChampionPick={setChampionPick}
              setTopScorerPick={setTopScorerPick}
              myScoreBreakdown={myScoreBreakdowns[activeBoardId]}
              hasUnread={hasUnread}/>
          </div>}
          {screen===SCREENS.NOTIFICATIONS&&<NotificationsScreen onBack={()=>setScreen(notificationsBackRef.current)} notifs={systemNotifs} readIds={notifReadIds} onMarkRead={(id)=>{ setNotifReadIds(p=>[...p,id]); }}/>}
          {screen===SCREENS.PREMIUM&&<PremiumScreen onBack={()=>setScreen(SCREENS.ACCOUNT)}/>}
          {screen===SCREENS.CHAMPION&&<ChampionScreen
            onBack={()=>setScreen(championBackScreen)}
            initialMode={championMode}
            championPick={championPick}
            topScorerPick={topScorerPick}
            runnerUpPick={runnerUpPick}
            setChampionPick={setChampionPick}
            setTopScorerPick={setTopScorerPick}
            setRunnerUpPick={setRunnerUpPick}
            showToast={showToast}
            simDay={simDay} simHour={simHour} simMin={simMin}/>}
          {screen===SCREENS.BONUS&&<BonusPredictionScreen
            onBack={()=>setScreen(SCREENS.HOME)}
            onChampion={(mode)=>{ setChampionBackScreen(SCREENS.BONUS); setChampionMode(mode||"champion"); setScreen(SCREENS.CHAMPION); }}
            championPick={championPick}
            runnerUpPick={runnerUpPick}
            topScorerPick={topScorerPick}
            simDay={simDay} simHour={simHour} simMin={simMin}/>}
          {screen===SCREENS.BOOSTER&&<BoosterScreen onBack={()=>setScreen(SCREENS.HOME)}/>}
          {screen===SCREENS.BOARDS&&<BoardsScreen
            initialTab={boardsInitialTab}
            onViewChange={setBoardsSubView}
            onBack={()=>{ setBoardsSubView("main"); setScreen(SCREENS.HOME); }}
            myBoards={myBoards} setMyBoards={setMyBoards}
            createdBoards={createdBoards} setCreatedBoards={setCreatedBoards}
            availableBoards={availableBoards} setAvailableBoards={setAvailableBoards}
            showToast={showToast}
            user={user}
            onCreateBoard={async (boardData) => {
              if (!user) return;
              const { data, error } = await createBoard(user.id, boardData);
              if (error) { showToast("Eroare la creare", "❌"); return null; }
              if (boardData.imageFile) {
                const imageUrl = await uploadBoardImage(user.id, data.id, boardData.imageFile);
                if (imageUrl) data.image_url = imageUrl;
              }
              setCreatedBoards(prev => [...prev, data]);
              forgetRemovedBoard(data.id);
              setMyBoards(prev => appendJoinedBoard(prev, { ...data, isMember: true, members: (data.members || 0) + 1 }));
              setActiveBoardId(data.id);
              return data;
            }}
            onUpdateBoard={async (boardId, boardData) => {
              if (!user) return null;
              let image_url;
              if (boardData.imageFile) {
                if (showToast) showToast("Se încarcă poza...", "⏳");
                image_url = await uploadBoardImage(user.id, boardId, boardData.imageFile);
                if (!image_url) { showToast("Eroare la incarcarea pozei", "x"); return null; }
              } else if (boardData.removeImage) {
                image_url = null;
              }
              const { data, error } = await updateBoard(boardId, { ...boardData, image_url });
              if (error) { showToast("Eroare la salvare", "❌"); return null; }
              setCreatedBoards(prev => prev.map(b => b.id === boardId ? { ...b, ...data } : b));
              setMyBoards(prev => prev.map(b => b.id === boardId ? { ...b, ...data } : b));
              setAvailableBoards(prev => prev.map(b => b.id === boardId ? { ...b, ...data } : b));
              if (showToast) showToast("Liga actualizată!", "✏️");
              return data;
            }}
            onJoinByCode={async (code) => {
              if (!user) return null;
              const { data, error } = await joinBoardByCode(user.id, code);
              if (error) { showToast(error, "❌"); return null; }
              const bid = data.id;
              forgetRemovedBoard(bid);
              setAllInstantPickStates(prev => { const n = {...prev}; delete n[bid]; return n; });
              setAllInstantPickDone(prev => { const n = {...prev}; delete n[bid]; return n; });
              setAllKoPickDone(prev => { const n = {...prev}; delete n[bid]; return n; });
              setExactScoresByBoard(prev => { const n = {...prev}; delete n[bid]; return n; });
              setPredictionsComplete(prev => { const n = {...prev}; delete n[bid]; return n; });
              setPredictionsLoaded(prev => ({ ...prev, [bid]: true }));
              setAllChampionPicks(prev => { const n = {...prev}; delete n[bid]; return n; });
              setAllTopScorerPicks(prev => { const n = {...prev}; delete n[bid]; return n; });
              setAllRunnerUpPicks(prev => { const n = {...prev}; delete n[bid]; return n; });
              setMyBoards(prev => appendJoinedBoard(prev, { ...data, isMember: true, members: (data.members || 0) + 1 }));
              setAvailableBoards(prev => prev.filter(b => b.id !== bid));
              return data;
            }}
            onJoin={(boardId)=>{ setActiveBoardId(boardId); setScreen(SCREENS.HOME); }}
            onJoinBoard={async (boardId, password = "") => {
              if (!user) return { error: "Not signed in" };
              const { error } = await joinBoardById(user.id, boardId, password);
              if (error) { showToast(error, "❌"); return { error }; }
              await removeParticipation(boardId, user.id);
              forgetRemovedBoard(boardId);
              setAllInstantPickStates(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setAllInstantPickDone(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setAllKoPickDone(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setExactScoresByBoard(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setPredictionsComplete(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setPredictionsLoaded(prev => ({ ...prev, [boardId]: true }));
              setAllChampionPicks(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setAllTopScorerPicks(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setAllRunnerUpPicks(prev => { const n = {...prev}; delete n[boardId]; return n; });
              const board = availableBoards.find(b => b.id === boardId) || createdBoards.find(b => b.id === boardId);
              if (board) {
                setMyBoards(prev => appendJoinedBoard(prev, { ...board, isMember: true, members: (board.members || 0) + 1 }));
                setAvailableBoards(prev => prev.filter(b => b.id !== boardId));
              }
              return { data: true };
            }}
            onDeleteBoard={async (boardId) => {
              const { error } = await deleteBoard(boardId);
              if (error) { showToast("Eroare la ștergere", "❌"); return; }
              rememberRemovedBoard(boardId);
              setCreatedBoards(prev => prev.filter(b => b.id !== boardId));
              setMyBoards(prev => {
                const updated = prev.filter(b => b.id !== boardId);
                try { localStorage.setItem('myBoards', JSON.stringify(updated)); } catch {}
                return updated;
              });
              setAvailableBoards(prev => prev.filter(b => b.id !== boardId));
              setAllInstantPickStates(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setAllInstantPickDone(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setAllKoPickDone(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setExactScoresByBoard(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setPredictionsComplete(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setPredictionsLoaded(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setAllChampionPicks(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setAllTopScorerPicks(prev => { const n = {...prev}; delete n[boardId]; return n; });
              setAllRunnerUpPicks(prev => { const n = {...prev}; delete n[boardId]; return n; });
              if (activeBoardId === boardId) setActiveBoardId('global');
              showToast("Ligă ștearsă", "🗑️");
            }}
            leaderboardData={leaderboardData}
            onRemoveMember={async (boardId, memberId) => {
              await removeBoardMember(boardId, memberId);
              if (memberId === user?.id) {
                rememberRemovedBoard(boardId);
                await removeParticipation(boardId, memberId);
                setMyBoards(prev => {
                  const updated = prev.filter(b => b.id !== boardId);
                  try { localStorage.setItem('myBoards', JSON.stringify(updated)); } catch {}
                  return updated;
                });
                setAllInstantPickStates(prev => { const n = {...prev}; delete n[boardId]; return n; });
                setAllInstantPickDone(prev => { const n = {...prev}; delete n[boardId]; return n; });
                setAllKoPickDone(prev => { const n = {...prev}; delete n[boardId]; return n; });
                setExactScoresByBoard(prev => { const n = {...prev}; delete n[boardId]; return n; });
                setPredictionsComplete(prev => { const n = {...prev}; delete n[boardId]; return n; });
                setPredictionsLoaded(prev => { const n = {...prev}; delete n[boardId]; return n; });
                setAllChampionPicks(prev => { const n = {...prev}; delete n[boardId]; return n; });
                setAllTopScorerPicks(prev => { const n = {...prev}; delete n[boardId]; return n; });
                if (activeBoardId === boardId) setActiveBoardId('global');
              }
            }}/>}
          {screen===SCREENS.RESET_PASSWORD&&<ResetPasswordScreen onDone={()=>{ inRecoveryRef.current=false; setScreen(SCREENS.HOME); }}/>}
          {screen===SCREENS.LEADERBOARD&&<LeaderboardScreen onBack={()=>setScreen(SCREENS.HOME)} tournamentStarted={tournamentStarted}
            myBoards={myBoards} activeBoardId={activeBoardId} setActiveBoardId={setActiveBoardId}
            userId={user?.id}
            leaders={(()=>{
              if (leaderboardData[activeBoardId]?.length > 0) return leaderboardData[activeBoardId];
              const ab = myBoards.find(b=>b.id===activeBoardId)||myBoards[0];
              if(!ab) return [];
              const medals = ["🥇","🥈","🥉","🏅","🎖️"];
              const prizes = ab.prizes||[];
              const maxPlayers = ab.max || 10;
              const slots = Math.max(maxPlayers, prizes.length, 1);
              const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "—";
              return [
                { rank:1, name:myName, pts:0, isMe:true, emoji:"🥇", prize:prizes[0]||null, accent:"#E8F0FF" },
                ...Array.from({length:slots-1},(_,i)=>({ rank:i+2, name:"—", pts:0, emoji:medals[i+1]||null, prize:prizes[i+1]||null, accent:"#fff", empty:true })),
              ];
            })()}/>}
          {screen===SCREENS.INSTANT_PICK&&<InstantPickScreen
            realStandings={realStandings}
            savedState={shouldStartAtKo
              ? {...(instantPickState||{}), stage:"ko", koRound:"R32", koIdx:0, showIntro:false, showFinalSummary:false, koShowIntro:true}
              : instantPickDone
                ? {...instantPickState, stage:"groups", groupIdx:0, showIntro:false, showFinalSummary:false, koShowIntro:false}
                : instantPickState}
            viewMode={task1DeadlinePassed && !shouldStartAtKo}
            startAtKo={shouldStartAtKo}
            onStateChange={setInstantPickState}
            tournamentStarted={tournamentStarted}
            koUnlocked={koUnlocked}
            onBack={async ()=>{
              if (!shouldStartAtKo && !task1DeadlinePassed) {
                const state = instantPickState;
                const best3Complete = (state?.best3?.length || 0) >= 8;
                if (best3Complete) {
                  setInstantPickDone(true);
                  const _gr = state?.groupRankings||{}; if(Object.keys(_gr).filter(g=>INTERACTIVE_GROUPS.includes(g)).length>=INTERACTIVE_GROUPS.length) setAllGroupsDoneByBoard(p=>({...p,[activeBoardId]:true}));
                  if (user && state) await savePredictions(user.id, activeBoardId, state);
                } else {
                  setInstantPickDone(false);
                }
              }
              setScreen(SCREENS.HOME);
            }}
            onModify={()=>setInstantPickDone(false)}
            onComplete={async ()=>{
              setInstantPickDone(true);
              const _gr2 = instantPickState?.groupRankings||{}; if(Object.keys(_gr2).filter(g=>INTERACTIVE_GROUPS.includes(g)).length>=INTERACTIVE_GROUPS.length) setAllGroupsDoneByBoard(p=>({...p,[activeBoardId]:true}));
              if (user && instantPickState) {
                await savePredictions(user.id, activeBoardId, instantPickState);
              }
              setScreen(SCREENS.HOME);
            }}
            onKoComplete={async ()=>{
              setKoPickDone(true);
              if (user && instantPickState) {
                await savePredictions(user.id, activeBoardId, instantPickState);
              }
              setScreen(SCREENS.HOME);
            }}/>}

          {screen===SCREENS.STATS&&<StatsScreen/>}
          {user&&<div style={{display:screen===SCREENS.RULES?'flex':'none',flex:1,flexDirection:'column',overflow:'hidden',minHeight:0}}>
            <RulesScreen onBack={()=>setScreen(SCREENS.HOME)}/>
          </div>}
          {screen===SCREENS.GROUPS_SCHEDULE&&<GroupsScheduleScreen scores={exactScores} setScores={async (newScores)=>{
              const oldScores = exactScores;
              setExactScores(newScores);
              if (user) {
                const fmt = ()=>new Date().toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
                for (const matchKey of Object.keys(newScores)) {
                  const o = oldScores[matchKey], n = newScores[matchKey];
                  if (!o || o.home !== n.home || o.away !== n.away) {
                    const result = await saveExactScore(user.id, activeBoardId, matchKey, n.home, n.away);
                    if (result?.error) {
                      setBugLog(p=>[...p,{message:`Save failed for match ${matchKey}: ${result.error}`,source:"saveExactScore",line:null,stack:null,time:fmt()}]);
                    }
                  }
                }
                showToast("Exact Score saved", "⚽");
              }
            }} simDay={simDay} simHour={simHour} simMin={simMin} initialWeek={groupsInitialWeek} onBack={()=>{ setGroupsInitialWeek(null); setScreen(SCREENS.HOME); }}/>}
          {user&&<div style={{display:screen===SCREENS.ACCOUNT?'flex':'none',flex:1,flexDirection:'column',overflow:'hidden',minHeight:0}}>
            <AccountScreen setLang={setLang} onBoards={()=>{ setBoardsInitialTab("my"); setScreen(SCREENS.BOARDS); }} onSignOut={()=>setScreen(SCREENS.SPLASH)} onShowGuide={()=>{ setShowOnboarding(true); }} onPremium={()=>setScreen(SCREENS.PREMIUM)} onNotifications={()=>{ notificationsBackRef.current=SCREENS.ACCOUNT; setScreen(SCREENS.NOTIFICATIONS); }} user={user} isActive={screen===SCREENS.ACCOUNT}/>
          </div>}
        </div>
        <Toast message={toast.message} emoji={toast.emoji} visible={toast.visible}/>
        {screen===SCREENS.HOME && activeBoardId && <ChatWidget boardId={activeBoardId} user={user}/>}
        {showFooter&&(
          <div style={{
            position:"fixed",
            bottom:0,
            left:0,
            right:0,
            height:"calc(110px + env(safe-area-inset-bottom, 10px))",
            zIndex:999,
            pointerEvents:"none",
            background:"linear-gradient(to bottom, transparent 0%, rgba(238,242,255,0.3) 35%, rgba(238,242,255,0.65) 60%, rgba(238,242,255,0.88) 80%)",
          }}/>
        )}
        {showFooter&&<Footer active={footerActive} onNavigate={key=>{ if(key===SCREENS.BOARDS) setBoardsInitialTab("available"); setScreen(key); }} lang={lang} user={user} activeBoardId={activeBoardId} myBoards={myBoards} leaderboardData={leaderboardData} tournamentStarted={tournamentStarted}/>}
        <AdminBugPanel
          user={user}
          allInstantPickStates={allInstantPickStates}
          allInstantPickDone={allInstantPickDone}
          exactScoresByBoard={exactScoresByBoard}
          myBoards={myBoards}
          bugLog={bugLog}
          simDay={simDay} simHour={simHour} simMin={simMin}
        />
        {isLocalhost && user && screen !== "dev" && (
          <button onClick={()=>setShowDevOverlay(true)} style={{
            position:"fixed",bottom:80,right:16,zIndex:9999,
            width:44,height:44,borderRadius:12,
            background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.25)",
            color:"#fff",fontSize:11,fontWeight:900,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(0,0,0,0.5)"
          }}>DEV</button>
        )}
        {isLocalhost && showDevOverlay && (
          <div style={{position:"fixed",inset:0,zIndex:9998,display:"flex",flexDirection:"column"}}>
            <button onClick={()=>setShowDevOverlay(false)} style={{
              position:"absolute",top:14,right:16,zIndex:1,
              width:36,height:36,borderRadius:10,border:"none",
              background:"rgba(255,255,255,0.12)",color:"#fff",fontSize:18,
              cursor:"pointer",lineHeight:1
            }}>✕</button>
            <DevPanel
              onAutoPick={(state)=>{
                setAllInstantPickStates(p=>({...p,global:state}));
                setAllInstantPickDone(p=>({...p,global:true}));
              }}
              onStart={(day,hour,min,started)=>{
                setSimDay(day);
                setSimHour(hour);
                setSimMin(min);
                setSimStarted(started);
                if(started && day>=11) {
                  LIVE_SCORES = {
                    "11-0": { home:2, away:1, status:"FT" },
                    "11-1": { home:1, away:1, status:"LIVE", min:45 },
                    "11-2": { home:2, away:0, status:"FT" },
                  };
                } else {
                  LIVE_SCORES = {};
                }
                setShowDevOverlay(false);
              }}
            />
          </div>
        )}
      <InstallBanner />
    </div>
    </LangCtx.Provider>
    </UserCtx.Provider>
    </ScoringContext.Provider>
  );
}

function InstallBanner() {
  const [show, setShow] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);

  React.useEffect(() => {
    if (localStorage.getItem("pwa-dismissed")) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (standalone) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => { localStorage.setItem("pwa-dismissed", "1"); setShow(false); };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") dismiss();
    else setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:99999,
      background:"#fff", borderTop:"1px solid rgba(10,46,138,0.12)",
      boxShadow:"0 -4px 24px rgba(0,0,0,0.12)",
      padding:"16px 20px 0", paddingBottom:"calc(16px + env(safe-area-inset-bottom, 0px))", display:"flex", alignItems:"flex-start", gap:12,
    }}>
      <img src="/icon-192.png" alt="" style={{width:48,height:48,borderRadius:12,flexShrink:0}} />
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:15,color:"#0A2E8A",marginBottom:4}}>Predicto WCP26</div>
        {isIOS ? (
          <div style={{fontSize:13,color:"#555",lineHeight:1.5}}>
            Apasă <strong>Share</strong> <span style={{fontSize:16}}>⎙</span> apoi <strong>"Add to Home Screen"</strong> pentru a instala aplicația.
          </div>
        ) : (
          <div style={{fontSize:13,color:"#555",lineHeight:1.5,marginBottom:10}}>
            Instalează aplicația pe telefonul tău.
          </div>
        )}
        {!isIOS && (
          <button onClick={install} style={{
            marginTop:8, padding:"8px 20px", borderRadius:10,
            background:"#0A2E8A", color:"#fff", border:"none",
            fontWeight:700, fontSize:14, cursor:"pointer",
          }}>Instalează</button>
        )}
      </div>
      <button onClick={dismiss} style={{
        background:"none", border:"none", color:"#999",
        fontSize:22, cursor:"pointer", padding:"0 4px", lineHeight:1,
      }}>✕</button>
    </div>
  );
}

export default App;
