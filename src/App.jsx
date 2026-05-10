import React, { useState, useEffect, useRef } from "react";
import trophy from "./assets/hands-trophy.png";
import varBg from "./assets/var-bg.jpg";
import { ALL_GROUPS_DATA, FLAGS, TEAM_COLORS, CALENDAR_EVENTS } from "./data/worldcup2026.js";
import { supabase } from "./supabase.js";
import { loadPredictions, savePredictions, loadExactScores, saveExactScore, loadUserBoards, loadAvailableBoards, createBoard, joinBoardByCode, joinBoardById, loadLeaderboard, fetchScoringRules, fetchMemberCounts, removeBoardMember, removeParticipation, deleteBoard, loadBoardMembers, checkDbHealth, checkEmailExists } from "./db.js";

const TEAM_CODE = {"Mexico":"MEX","South Africa":"RSA","South Korea":"KOR","Czechia":"CZE","Canada":"CAN","Switzerland":"SUI","Qatar":"QAT","Bosnia-Herzegovina":"BIH","Brazil":"BRA","Morocco":"MAR","Scotland":"SCO","Haiti":"HAI","USA":"USA","Paraguay":"PAR","Australia":"AUS","Turkiye":"TUR","Germany":"GER","Ecuador":"ECU","Ivory Coast":"CIV","Curacao":"CUW","Netherlands":"NED","Japan":"JPN","Tunisia":"TUN","Sweden":"SWE","Belgium":"BEL","Iran":"IRI","Egypt":"EGY","New Zealand":"NZL","Spain":"ESP","Uruguay":"URU","Saudi Arabia":"KSA","Cape Verde":"CPV","France":"FRA","Senegal":"SEN","Norway":"NOR","Iraq":"IRQ","Argentina":"ARG","Austria":"AUT","Algeria":"ALG","Jordan":"JOR","Portugal":"POR","Colombia":"COL","Uzbekistan":"UZB","DR Congo":"COD","England":"ENG","Croatia":"CRO","Panama":"PAN","Ghana":"GHA"};

const BG = "#F8F8F8";
const SHADOW_OUT = "4px 4px 12px rgba(0,0,0,0.08), -3px -3px 8px #ffffff";
const SHADOW_IN = "inset 3px 3px 8px rgba(0,0,0,0.08), inset -2px -2px 6px #ffffff";
const DARK = "#3D3D3D";
const NAVY = "#0A2E8A";
const RED = "#C8102E";
const GREEN = "#009A44";

const SCREENS = {
  SPLASH:"splash", LOGIN:"login", HOME:"home",
  BOARDS:"boards",
  INSTANT_PICK:"instant_pick",
  LEADERBOARD:"leaderboard", STATS:"stats", ACCOUNT:"account",
  GROUPS_SCHEDULE:"groups_schedule",
  RULES:"rules",
  RESET_PASSWORD:"reset_password",
  SET_PASSWORD:"set_password",
};

const INITIAL_BOARDS = [{ id:"global", label:"🌍", name:"Global Board", members:48291, isGlobal:true }];
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
    exactScores:"Exact Scores", weekComplete:"✓ Week complete", thisWeek:"this week",
    pathToTrophy:"Path to the Trophy", unlocksEvery:"Unlocks every Sunday 8AM",
    groupStage:"Group Stage", week:"Week", roundOf16QF:"Round of 16 · QF · SF",
    final:"Final", locked:"Locked", past:"Past", viewAll:"🏆 View all ›",
    tournamentStarts:"Tournament starts Jun 11", ptsTotal:"pts total",
    leaderboard:"Leaderboard", searchPlayer:"Search player...",
    tournamentNotStarted:"Tournament not started",
    leaderboardMsg:"The leaderboard will be available after the tournament starts on Jun 11, 2026.",
    openSlot:"Open slot", noPlayerFound:"No player found for",
    joinTheGame:"Join the Game", continueGoogle:"Continue with Google",
    continueFacebook:"Continue with Facebook", continueInstagram:"Continue with Instagram",
    groupsSchedule:"Groups & Schedule", groupTeams:"Teams", matchSchedule:"Match Schedule",
    myBoards:"My Boards", activeBoards:"3 active boards", appGuide:"App Guide",
    howItWorks:"How it works", notifications:"Notifications", matchAlertsOn:"Match alerts on",
    language:"Language", upgradePremium:"Upgrade to Premium", removeAds:"Remove ads",
    signOut:"Sign Out", memberSince:"Member since March 2026",
    todaysMatches:"Today's Matches", tapToPredict:"Tap to predict the winner",
    allDone:"All done!", backToHome:"Back to Home", draw:"Draw",
    yourPredictedChampion:"Your Predicted Champion", worldCupWinner:"2026 World Cup Winner",
    pointsPerPrediction:"Points per correct prediction",
    confirmPredictions:"✅ Confirm Predictions",
    predictionsLocked:"🔒 Tournament started — predictions locked",
    noChampionSelected:"No champion selected",
    matchesToPredict:"matches to predict", startMatches:"Start Matches →",
    viewOnly:"View Only", winnerArrow:"Winner →",
    groups:"groups", group:"Group",
    best3Title:"🥉 Best Third", selectTeams:"Select 8 3rd place teams...",
    thirdPlaceRanking:"3rd Place Ranking · sorted by points", team:"Team",
    knockout:"Knockout →", selectMore:"Select more",
    boards:"Boards", createBoard:"Create Board", editBoard:"Edit Board",
    boardName:"Group name", joinBoard:"Join Board", enterCode:"Enter code",
    invalidCode:"Invalid code. Please check and try again.",
    rules:"Rules", howPredictionsWork:"How does Predictions work?",
    howExactScoreWork:"How does Exact Score work?",
    predictionsDesc:"Predict the winner of every match — from group stage to the final. One shot per tournament.",
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
    realLabel:"Real", predictedLabel:"Predicted", noMatchesScheduled:"No matches scheduled",
    finished:"Finished", prediction:"Prediction",
    noMembersYet:"No members yet", searchOrCode:"Search or enter invite code...",
    joinBtn:"Join", noBoardsFor:"No boards found for",
    dontShowAgain:"Don't show again",
    onb0Title:"Predict the Tournament", onb0Sub:"Once · From Groups to the Final",
    onb0Desc:"Pick the winner of every match before the tournament kicks off. One shot — make it count.",
    onb0Next:"Show me scores →",
    onb1Title:"Weekly Exact Score", onb1Sub:"Unlocks every Sunday at 8:00 AM",
    onb1Desc:"Predict the exact score of each week's matches for bonus points. New matches every Sunday.",
    onb1Next:"Invite friends →",
    onb2Title:"Compete With Friends", onb2Sub:"Private boards · Custom prizes",
    onb2Desc:"Create a private group, invite your friends and set your own prizes. May the best predictor win.",
    onb2Next:null,
    getStarted:"Get Started",
    rulesDesc1:"Group winner", rulesDesc2:"2nd place", rulesDesc3:"3rd place",
    rulesDescBest3:"Best-3rd advancing", rulesDescMatch:"Match winner", rulesDescFinal:"Tournament winner",
    boardPassword:"Group Password", maxPlayers:"Max Players", prizedSlots:"Prize slots", prizesLabel:"Prizes",
    membersLabel:"Members", adminLabel:"Admin", remove:"Remove", saveChanges:"Save Changes ✓",
    createBoard2:"Create Board 🏆", boardAdmin:"Board Admin", incorrectPassword:"Incorrect password. Try again.",
    joinBoardTitle:"Join a Board", joinedBoards:"My Boards", availableBoards:"Available Boards",
    chooseEmoji:"Choose emoji", passwordProtected:"🔒 Password protected board",
    enterPassword:"Enter password...", rank:"Rank",
    globalBoard:"Global", noBoards:"No boards found.",
    viewAll2:"View all", members2:"members", code:"code",
    allMatchesGrp:"All Matches · Gr.",
  },
  ro:{
    location:"SUA, Canada & Mexic", cta:"Fa-ti Predictia",
    days:"ZILE", hours:"ORE", minutes:"MIN", seconds:"SEC",
    footerHome:"Acasa", footerStats:"Grupe", footerFast:"Instant Pick ⚡", footerAccount:"Cont",
    participants:"participanți", add:"Adaugă", yourTasks:"Sarcinile tale",
    predictions:"Predicții", completed:"✓ Completat", deadlinePassed:"Termen expirat", dueJun11:"Termen 11 Iun",
    exactScores:"Scoruri Exacte", weekComplete:"✓ Săptămâna completă", thisWeek:"această săptămână",
    pathToTrophy:"Drumul spre Trofeu", unlocksEvery:"Se deschide duminică la 8:00",
    groupStage:"Faza Grupelor", week:"Săptămâna", roundOf16QF:"Optimi · Sferturi · Semi",
    final:"Finală", locked:"Blocat", past:"Trecut", viewAll:"🏆 Vezi tot ›",
    tournamentStarts:"Turneul începe pe 11 Iun", ptsTotal:"pts total",
    leaderboard:"Clasament", searchPlayer:"Caută jucător...",
    tournamentNotStarted:"Turneul nu a început",
    leaderboardMsg:"Clasamentul va fi disponibil după ce turneul începe pe 11 Iun 2026.",
    openSlot:"Loc liber", noPlayerFound:"Niciun jucător găsit pentru",
    joinTheGame:"Intră în Joc", continueGoogle:"Continuă cu Google",
    continueFacebook:"Continuă cu Facebook", continueInstagram:"Continuă cu Instagram",
    groupsSchedule:"Grupe & Program", groupTeams:"Echipe", matchSchedule:"Program Meciuri",
    myBoards:"Board-urile mele", activeBoards:"3 board-uri active", appGuide:"Ghid Aplicație",
    howItWorks:"Cum funcționează", notifications:"Notificări", matchAlertsOn:"Alerte meci active",
    language:"Limbă", upgradePremium:"Upgrade la Premium", removeAds:"Elimină reclamele",
    signOut:"Deconectare", memberSince:"Membru din Martie 2026",
    todaysMatches:"Meciurile de Azi", tapToPredict:"Apasă pentru a prezice câștigătorul",
    allDone:"Gata!", backToHome:"Înapoi Acasă", draw:"Egal",
    yourPredictedChampion:"Campionul Tău Prezis", worldCupWinner:"Câștigător Mondial 2026",
    pointsPerPrediction:"Puncte per predicție corectă",
    confirmPredictions:"✅ Confirmă Predicțiile",
    predictionsLocked:"🔒 Turneul a început — predicții blocate",
    noChampionSelected:"Niciun campion selectat",
    matchesToPredict:"meciuri de prezis", startMatches:"Începe Meciurile →",
    viewOnly:"Doar Vizualizare", winnerArrow:"Câștigător →",
    groups:"grupe", group:"Grupă",
    best3Title:"🥉 Best Third", selectTeams:"Selectează 8 echipe de pe locul 3...",
    thirdPlaceRanking:"Clasament Locul 3 · sortat după puncte", team:"Echipă",
    knockout:"Knockout →", selectMore:"Mai selectează",
    boards:"Board-uri", createBoard:"Creează Board", editBoard:"Editează Board",
    boardName:"Nume grup", joinBoard:"Alătură-te", enterCode:"Introdu codul",
    invalidCode:"Cod invalid. Verifică și încearcă din nou.",
    rules:"Reguli", howPredictionsWork:"Cum funcționează Predicțiile?",
    howExactScoreWork:"Cum funcționează Scorul Exact?",
    predictionsDesc:"Prezice câștigătorul fiecărui meci — din faza grupelor până la finală. O singură șansă pe turneu.",
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
    customScore:"Alt scor", saveScore:"Salvează ✓", modifyBtn:"← Modifică", bestThirdBtn:"Best Third →",
    notStarted:"Neînceput", winner:"Câștigător", scheduledMatches:"Meciuri Programate",
    realLabel:"Real", predictedLabel:"Prezis", noMatchesScheduled:"Nu sunt meciuri programate",
    finished:"Terminat", prediction:"Predicție",
    noMembersYet:"Niciun membru încă", searchOrCode:"Caută sau introdu codul...",
    joinBtn:"Alătură-te", noBoardsFor:"Niciun board găsit pentru",
    dontShowAgain:"Nu mai arăta",
    onb0Title:"Prezice Turneul", onb0Sub:"O singură dată · De la Grupe la Finală",
    onb0Desc:"Alege câștigătorul fiecărui meci înainte să înceapă turneul. O singură șansă — folosește-o bine.",
    onb0Next:"Arată-mi scorurile →",
    onb1Title:"Scor Exact Săptămânal", onb1Sub:"Se deschide duminică la 8:00",
    onb1Desc:"Prezice scorul exact al meciurilor săptămânii pentru puncte bonus. Meciuri noi în fiecare duminică.",
    onb1Next:"Invită prieteni →",
    onb2Title:"Concurează cu Prietenii", onb2Sub:"Board-uri private · Premii personalizate",
    onb2Desc:"Creează un grup privat, invită prietenii și setează propriile premii. Câștige cel mai bun prezicător.",
    onb2Next:null,
    getStarted:"Începe",
    rulesDesc1:"Echipa care câștigă grupa", rulesDesc2:"Echipa pe locul 2", rulesDesc3:"Echipa pe locul 3",
    rulesDescBest3:"Echipă best-3rd care avansează", rulesDescMatch:"Câștigătorul meciului", rulesDescFinal:"Câștigătorul turneului",
    boardPassword:"Parolă Grup", maxPlayers:"Jucători max", prizedSlots:"Locuri premiate", prizesLabel:"Premii",
    membersLabel:"Membri", adminLabel:"Admin", remove:"Elimină", saveChanges:"Salvează Modificările ✓",
    createBoard2:"Creează Board 🏆", boardAdmin:"Board Admin", incorrectPassword:"Parolă incorectă. Încearcă din nou.",
    joinBoardTitle:"Alătură-te unui Board", joinedBoards:"Board-urile mele", availableBoards:"Board-uri disponibile",
    chooseEmoji:"Alege un emoji", passwordProtected:"🔒 Board protejat cu parolă",
    enterPassword:"Introdu parola...", rank:"Rang",
    globalBoard:"Global", noBoards:"Niciun board găsit.",
    viewAll2:"Vezi tot", members2:"membri", code:"cod",
    allMatchesGrp:"Toate Meciurile · Gr.",
  },
  fr:{
    location:"USA, Canada & Mexique", cta:"Faites vos Pronostics",
    days:"JOURS", hours:"HEURES", minutes:"MIN", seconds:"SEC",
    footerHome:"Accueil", footerStats:"Groupes", footerFast:"Instant Pick ⚡", footerAccount:"Compte",
    participants:"participants", add:"Ajouter", yourTasks:"Vos tâches",
    predictions:"Pronostics", completed:"✓ Complété", deadlinePassed:"Délai expiré", dueJun11:"Délai 11 Juin",
    exactScores:"Scores Exacts", weekComplete:"✓ Semaine complète", thisWeek:"cette semaine",
    pathToTrophy:"Chemin vers le Trophée", unlocksEvery:"Ouvre chaque dimanche à 8h",
    groupStage:"Phase de Groupes", week:"Semaine", roundOf16QF:"H.d.F. · Quarts · Demi",
    final:"Finale", locked:"Bloqué", past:"Passé", viewAll:"🏆 Voir tout ›",
    tournamentStarts:"Tournoi débute le 11 Juin", ptsTotal:"pts total",
    leaderboard:"Classement", searchPlayer:"Chercher joueur...",
    tournamentNotStarted:"Tournoi pas encore commencé",
    leaderboardMsg:"Le classement sera disponible après le début du tournoi le 11 Juin 2026.",
    openSlot:"Slot libre", noPlayerFound:"Aucun joueur trouvé pour",
    joinTheGame:"Rejoignez le Jeu", continueGoogle:"Continuer avec Google",
    continueFacebook:"Continuer avec Facebook", continueInstagram:"Continuer avec Instagram",
    groupsSchedule:"Groupes & Programme", groupTeams:"Équipes", matchSchedule:"Programme des Matchs",
    myBoards:"Mes Boards", activeBoards:"3 boards actifs", appGuide:"Guide App",
    howItWorks:"Comment ça marche", notifications:"Notifications", matchAlertsOn:"Alertes match activées",
    language:"Langue", upgradePremium:"Passer à Premium", removeAds:"Supprimer les pubs",
    signOut:"Déconnexion", memberSince:"Membre depuis Mars 2026",
    todaysMatches:"Matchs du Jour", tapToPredict:"Appuyez pour prédire le vainqueur",
    allDone:"Terminé !", backToHome:"Retour à l'Accueil", draw:"Nul",
    yourPredictedChampion:"Votre Champion Prédit", worldCupWinner:"Vainqueur Mondial 2026",
    pointsPerPrediction:"Points par prédiction correcte",
    confirmPredictions:"✅ Confirmer les Pronostics",
    predictionsLocked:"🔒 Tournoi commencé — pronostics verrouillés",
    noChampionSelected:"Aucun champion sélectionné",
    matchesToPredict:"matchs à pronostiquer", startMatches:"Démarrer les Matchs →",
    viewOnly:"Vue uniquement", winnerArrow:"Vainqueur →",
    groups:"groupes", group:"Groupe",
    best3Title:"🥉 Best Third", selectTeams:"Sélectionnez 8 équipes de 3e place...",
    thirdPlaceRanking:"Classement 3e Place · trié par points", team:"Équipe",
    knockout:"Knockout →", selectMore:"Sélectionner encore",
    boards:"Boards", createBoard:"Créer un Board", editBoard:"Modifier le Board",
    boardName:"Nom du groupe", joinBoard:"Rejoindre", enterCode:"Entrer le code",
    invalidCode:"Code invalide. Veuillez vérifier et réessayer.",
    rules:"Règles", howPredictionsWork:"Comment fonctionnent les Pronostics ?",
    howExactScoreWork:"Comment fonctionne le Score Exact ?",
    predictionsDesc:"Prédisez le vainqueur de chaque match — de la phase de groupes à la finale. Une seule chance par tournoi.",
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
    realLabel:"Réel", predictedLabel:"Prédit", noMatchesScheduled:"Aucun match programmé",
    finished:"Terminé", prediction:"Pronostic",
    noMembersYet:"Aucun membre encore", searchOrCode:"Chercher ou entrer le code...",
    joinBtn:"Rejoindre", noBoardsFor:"Aucun board trouvé pour",
    dontShowAgain:"Ne plus afficher",
    onb0Title:"Prédire le Tournoi", onb0Sub:"Une fois · Des Groupes à la Finale",
    onb0Desc:"Choisissez le vainqueur de chaque match avant le début du tournoi. Une seule chance — faites-la compter.",
    onb0Next:"Montrez-moi les scores →",
    onb1Title:"Score Exact Hebdomadaire", onb1Sub:"Déverrouillé chaque dimanche à 8h",
    onb1Desc:"Prédisez le score exact des matchs de la semaine pour des points bonus. Nouveaux matchs chaque dimanche.",
    onb1Next:"Inviter des amis →",
    onb2Title:"Affrontez Vos Amis", onb2Sub:"Boards privés · Prix personnalisés",
    onb2Desc:"Créez un groupe privé, invitez vos amis et fixez vos propres prix. Que le meilleur pronostiqueur gagne.",
    onb2Next:null,
    getStarted:"Commencer",
    rulesDesc1:"L'équipe qui gagne le groupe", rulesDesc2:"L'équipe 2e", rulesDesc3:"L'équipe 3e",
    rulesDescBest3:"Équipe best-3rd qui avance", rulesDescMatch:"Vainqueur du match", rulesDescFinal:"Vainqueur du tournoi",
    boardPassword:"Mot de passe", maxPlayers:"Joueurs max", prizedSlots:"Places primées", prizesLabel:"Prix",
    membersLabel:"Membres", adminLabel:"Admin", remove:"Retirer", saveChanges:"Sauvegarder ✓",
    createBoard2:"Créer Board 🏆", boardAdmin:"Board Admin", incorrectPassword:"Mot de passe incorrect. Réessayez.",
    joinBoardTitle:"Rejoindre un Board", joinedBoards:"Mes Boards", availableBoards:"Boards disponibles",
    chooseEmoji:"Choisir un emoji", passwordProtected:"🔒 Board protégé par mot de passe",
    enterPassword:"Entrer le mot de passe...", rank:"Rang",
    globalBoard:"Global", noBoards:"Aucun board trouvé.",
    viewAll2:"Voir tout", members2:"membres", code:"code",
    allMatchesGrp:"Tous les Matchs · Gr.",
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

// Clasamente reale finale — se actualizează după încheierea turneului
const REAL_STANDINGS = {};
const GROUP_STAGE_FINISHED = false;

// Week unlock logic — Sunday after 20:00
const now = new Date();
const june = (d) => new Date(2026, 5, d, 8, 0, 0);
const WEEK_UNLOCKED = {
  8:  true,                    // week 1 always open (unlocked before tournament)
  15: now >= june(14),         // Sun June 14 after 08:00
  22: now >= june(21),         // Sun June 21
  29: now >= june(28),         // Sun June 28
};
const isMatchPast = (matchDay, matchTime, simDay=null, simHour=12) => {
  const mHour = parseInt((matchTime||"23:00").split(":")[0]);
  const nowDay = simDay || new Date().getDate();
  const nowHour = simDay ? (simHour||0) : new Date().getHours();
  return matchDay < nowDay || (matchDay === nowDay && mHour <= nowHour);
};

const isWeekUnlocked = (day, simDay=null, simHour=12, simMin=0) => {
  // Convert July days: day 36+ = July week
  const june = (d) => new Date(2026, 5, d, 8, 0, 0);
  const july = (d) => new Date(2026, 6, d, 8, 0, 0);
  if(simDay) {
    const simDate = new Date(2026,5,simDay,simHour,simMin,0);
    if(day >= 43) return simDate >= july(12);   // Final week
    if(day >= 36) return simDate >= july(5);    // QF/SF week
    if(day >= 29) return simDate >= june(28);   // R16 week
    if(day >= 22) return simDate >= june(21);
    if(day >= 15) return simDate >= june(14);
    return true;
  }
  const now2 = new Date();
  if(day >= 43) return now2 >= july(12);
  if(day >= 36) return now2 >= july(5);
  if(day >= 29) return WEEK_UNLOCKED[29];
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
      const key = `${e.day}-${idx}`;
      const kickH = parseInt((m.time||"23:00").split(":")[0]);
      const kickM = parseInt((m.time||"00:00").split(":")[1]||0);
      const nowDay = simDay || new Date().getDate();
      const nowH   = simDay ? simHour : new Date().getHours();
      const nowM   = simDay ? simMin  : new Date().getMinutes();
      if(e.day > nowDay) { scores[key] = {status:"NS"}; return; }
      if(e.day < nowDay) {
        // Use mock final scores if available
        scores[key] = {status:"FT",home:null,away:null};
        return;
      }
      // Same day
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
const LIVE_SCORES_DEFAULT = computeLiveScores();
let LIVE_SCORES = LIVE_SCORES_DEFAULT;

const toLabel = (d) => d > 30 ? `${d-30} July` : `${d} June`;

function useCountdown() {
  const target = new Date("2026-06-11T18:00:00");
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
                <span style={{fontSize:8,marginTop:1}}>🔒</span>
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
        <div style={{position:"absolute",inset:0,zIndex:50,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}
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
                  <span style={{fontSize:11,color:"#aaa",fontWeight:600,width:36}}>{m.time}</span>
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
  const ph = !team||team.includes("W")||team.includes("L")||team.includes("3rd")||team.includes("Best")||team.includes("SF")||team.includes("QF")||team.includes("R16");
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
                    <span style={{fontSize:7,fontWeight:700,color:pos===1?GREEN:pos===2?NAVY:"#ccc",textTransform:"uppercase"}}>{pos===1?"1st":pos===2?"2nd":pos===3?"3rd":"4th"}</span>
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
              <div key={t} onClick={()=>handleTeamClick(t)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",transition:"all 0.2s",opacity:isRanked?0.35:1}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:isRanked?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.12)",border:isRanked?"2px solid rgba(255,255,255,0.12)":"2px solid rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,transition:"all 0.2s"}}>
                  {FLAGS[t]}
                </div>
                <span style={{fontSize:11,fontWeight:800,color:isRanked?"rgba(255,255,255,0.25)":"#fff",letterSpacing:0.3}}>{t.substring(0,3).toUpperCase()}</span>
              </div>
            );
          })}
        </div>
        <div style={{background:BG}}>
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
const ALL_GROUP_IDS = Object.keys(ALL_GROUPS_DATA);

// ── PREDICTION SCORING ────────────────────────────────────────────────────────
const PRED_SCORING = {
  group1st: 20, group2nd: 15, group3rd: 10,
  best3: 5,
  r32: 10, r16: 20, qf: 40, sf: 60, final: 100,
};
const PRED_MAX = {
  groups:  INTERACTIVE_GROUPS.length * (PRED_SCORING.group1st + PRED_SCORING.group2nd + PRED_SCORING.group3rd), // 12×45 = 540
  best3:   8 * PRED_SCORING.best3,        // 120
  r32:     16 * PRED_SCORING.r32,         // 160
  r16:     8  * PRED_SCORING.r16,         // 160
  qf:      4  * PRED_SCORING.qf,          // 160
  sf:      2  * PRED_SCORING.sf,          // 120
  final:   1  * PRED_SCORING.final,       // 100
};
PRED_MAX.total = Object.values(PRED_MAX).reduce((a,b)=>a+b, 0); // 1360

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
        <div onClick={()=>pick("home")} style={{
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
        <div onClick={()=>pick("away")} style={{
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
          <div onClick={()=>pick("home")} style={{
            cursor:"pointer",
            background:"rgba(0,0,0,0.65)", backdropFilter:"blur(12px)",
            borderRadius:14, padding:"8px 14px",
            border:"1.5px solid rgba(255,255,255,0.18)",
            transform:swipeLeft?`scale(${1+leftPct*0.05}) translateY(${-leftPct*4}px)`:"scale(1)",
            transition:"transform 0.08s",
            boxShadow:swipeLeft?`0 0 22px ${homeColors[0]}88`:"0 2px 12px rgba(0,0,0,0.6)",
          }}>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",fontWeight:700,letterSpacing:1.5,marginBottom:3}}>← SWIPE</div>
            <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>{home}</div>
          </div>

          {!isKo&&(
            <div onClick={()=>pick("draw")} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,animation:"xPulse 2.5s ease-in-out infinite"}}>
                <span style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1}}>↑</span>
                <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.45)",letterSpacing:1,textTransform:"uppercase"}}>egal</span>
              </div>
              <div style={{background:"rgba(0,0,0,0.65)",backdropFilter:"blur(12px)",
                borderRadius:14,padding:"8px 18px",
                border:"1.5px solid rgba(255,215,0,0.5)",boxShadow:"0 2px 16px rgba(255,215,0,0.2)"}}>
                <span style={{fontSize:22,fontWeight:900,color:"#FFD700",textShadow:"0 2px 12px rgba(0,0,0,0.8)",lineHeight:1}}>X</span>
              </div>
            </div>
          )}

          <div onClick={()=>pick("away")} style={{
            cursor:"pointer",
            background:"rgba(0,0,0,0.65)", backdropFilter:"blur(12px)",
            borderRadius:14, padding:"8px 14px", textAlign:"right",
            border:"1.5px solid rgba(255,255,255,0.18)",
            transform:swipeRight?`scale(${1+rightPct*0.05}) translateY(${-rightPct*4}px)`:"scale(1)",
            transition:"transform 0.08s",
            boxShadow:swipeRight?`0 0 22px ${awayColors[0]}88`:"0 2px 12px rgba(0,0,0,0.6)",
          }}>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",fontWeight:700,letterSpacing:1.5,marginBottom:3}}>SWIPE →</div>
            <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>{away}</div>
          </div>
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
            <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{T[lang].backLabel}</span>
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
          🔄 Reset
        </button>
        <button onClick={onNext}
          style={{flex:2,padding:"14px 0",borderRadius:14,border:"none",
            background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,
            color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(0,32,91,0.3)"}}>
          {isLastGroup ? "Knockout →" : "Group urmatoare →"}
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
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
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
                              {hWon&&<span style={{fontSize:9,fontWeight:900,color:GREEN}}>✓</span>}
                            </div>
                            <div style={{padding:"7px 10px",display:"flex",alignItems:"center",gap:8,background:aWon?GREEN+"15":"transparent"}}>
                              <span style={{fontSize:20,lineHeight:1}}>{FLAGS[a]||"🏳"}</span>
                              <span style={{fontSize:12,fontWeight:700,color:aWon?GREEN:DARK,flex:1}}>{a||"TBD"}</span>
                              {aWon&&<span style={{fontSize:9,fontWeight:900,color:GREEN}}>✓</span>}
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
                            <span style={{fontSize:8,color:"#bbb",display:"block",marginBottom:5}}>→ {nextRoundLabel}</span>
                            {[w1,w2].map((w,wi)=>w?(
                              <div key={wi} style={{display:"flex",alignItems:"center",gap:5,justifyContent:"center",marginBottom:wi===0?4:0,background:`${col}18`,borderRadius:6,padding:"3px 6px"}}>
                                <span style={{fontSize:18,lineHeight:1}}>{FLAGS[w]||"🏳"}</span>
                                <span style={{fontSize:10,fontWeight:900,color:col,letterSpacing:0.5}}>{code(w)}</span>
                              </div>
                            ):(
                              <div key={wi} style={{fontSize:9,color:"#ccc",marginBottom:wi===0?4:0,padding:"3px 0"}}>??</div>
                            ))}
                          </>
                        ):(
                          <>
                            <span style={{fontSize:9,color:"#bbb",display:"block",marginBottom:2}}>{T[lang].winnerArrow}</span>
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
            {!hideHeader && <><p style={{fontSize:10,color:RED,margin:"0 0 4px",letterSpacing:2,textTransform:"uppercase",fontWeight:800,textAlign:"center"}}>Predicto</p>
            <h2 style={{fontSize:26,fontWeight:900,color:"#fff",margin:"0 0 20px",textAlign:"center",letterSpacing:1}}>{group}</h2></>}
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


function InstantPickScreen({ onBack, onComplete, onModify, savedState, onStateChange, tournamentStarted, viewMode=false }) {
  const lang = useLang();
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
    if(groupIdx < GROUPS.length-1) { setGroupIdx(g=>g+1); setShowIntro(viewMode?false:true); }
    else setStage("best3");
  };

  const handleGroupBack = () => {
    if(groupIdx>0) { setGroupIdx(g=>g-1); }
    else { onBack&&onBack(); }
  };

  const allGroupStandings = {};
  GROUPS.forEach(g=>{ allGroupStandings[g]=getGroupStanding(g); });

  // 32 teams: 12 group winners + 12 runners-up + 8 best 3rd
  const groupWinners  = GROUPS.map(g=>(allGroupStandings[g]||[])[0]).filter(Boolean);
  const groupRunners  = GROUPS.map(g=>(allGroupStandings[g]||[])[1]).filter(Boolean);
  const best3Teams    = best3.length === 8 ? best3
                        : GROUPS.map(g=>(allGroupStandings[g]||[])[2]).filter(Boolean).slice(0,8);

  // Round of 32 (16 meciuri): 8 winners vs 8 best3rd + 8 runners vs 4 winners + 4 runners
  // Simplified pairing: winner[i] vs best3[i] for i=0-7, runner[i] vs runner[i+4] for i=0-3,
  // winner[8-11] vs runner[8-11]
  const r32Matchups = [
    ...Array.from({length:8}, (_,i)=>({home:groupWinners[i]||"TBD", away:best3Teams[i]||"TBD"})),
    ...Array.from({length:4}, (_,i)=>({home:groupRunners[i]||"TBD", away:groupRunners[i+4]||"TBD"})),
    ...Array.from({length:4}, (_,i)=>({home:groupWinners[i+8]||"TBD", away:groupRunners[i+8]||"TBD"})),
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
    return best3Done;
  };
  const goToPhase = (id) => {
    if(!phaseAccessible(id)) return;
    if(id==="best3") { setStage("best3"); }
    else { setStage("ko"); setKoRound(id); setKoShowIntro(true); setKoIdx(0); }
  };
  const headerTitle = stage==="groups"?`Group ${currentGroup}`:stage==="best3"?"Best 3rd Place":koLabel;
  const headerCounterVal = stage==="groups"?`${groupIdx+1}/${GROUPS.length}`:stage==="best3"?`${best3.length}/8`:`${koIdx+1}/${Math.max(koRoundMatchups.length,1)}`;
  const headerSub = stage==="groups"?"groups":stage==="best3"?"selected":"matches";
  const headerBack = () => {
    if(stage==="groups"){ onBack&&onBack(); }
    else if(stage==="best3"){ setGroupIdx(GROUPS.length-1); setStage("groups"); }
    else { setStage("best3"); }
  };
  const sharedNavIdx = stage==="groups" ? groupIdx : GROUPS.length-1;

  const sharedHeader = (
    <div style={{background:"rgba(0,32,91,0.88)", paddingBottom:0, flexShrink:0, position:"relative", zIndex:1, overflow:"hidden"}}>
      <img src={varBg} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%",opacity:0.28,pointerEvents:"none"}}/>
      {/* Top row */}
      <div style={{display:"flex", alignItems:"center", gap:10, padding:"10px 20px 6px"}}>
        <button onClick={headerBack} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:10,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>‹</button>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:RED,fontWeight:800,letterSpacing:2,textTransform:"uppercase"}}>Predicto</div>
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
            <div onClick={()=>{
              if(stage!=="groups"){ setStage("groups"); setShowGroupsSlider(true); }
              else setShowGroupsSlider(v=>!v);
            }} style={{
              flexShrink:0,height:36,borderRadius:9,padding:"4px 10px",
              background:grupeActive?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.06)",
              border:`1.5px solid ${grupeActive?"rgba(255,255,255,0.45)":"transparent"}`,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",
              cursor:"pointer",position:"relative",
              opacity:1,
            }}>
              <span style={{fontSize:6,color:"rgba(255,255,255,0.85)",fontWeight:800,letterSpacing:0.3,lineHeight:1,textAlign:"center"}}>Groups</span>
              <span style={{fontSize:10,lineHeight:1}}>
                {grupeDone?"✓":grupeActive?"●":"○"}
              </span>
              {showGroupsSlider&&<span style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:`5px solid rgba(255,255,255,0.4)`}}/>}
            </div>
          );
        })()}
        <div style={{width:1,height:28,background:"rgba(255,255,255,0.2)",flexShrink:0}}/>
        {[{id:"best3",name:"Best Third"},{id:"R32",name:"Round of 32"},{id:"R16",name:"Round of 16"},{id:"QF",name:"Quarter"},{id:"SF",name:"Semi"},{id:"F",name:"Final"}].map(ph=>{
          const isActive=ph.id===activePhaseId;
          const accessible=phaseAccessible(ph.id);
          return (
            <div key={ph.id} onClick={()=>goToPhase(ph.id)} style={{flex:1,height:36,borderRadius:9,background:isActive?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.06)",border:`1.5px solid ${isActive?"rgba(255,255,255,0.45)":"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"4px 2px 3px",opacity:accessible||isActive?1:0.4,cursor:accessible?"pointer":"default"}}>
              <span style={{fontSize:6,color:"rgba(255,255,255,0.85)",fontWeight:800,letterSpacing:0.3,lineHeight:1,textAlign:"center"}}>{ph.name}</span>
              <span style={{fontSize:10,lineHeight:1}}>{ph.id==="best3"&&best3Done?"✓":koRoundDone(ph.id)?"✓":isActive?"●":accessible?"○":"🔒"}</span>
            </div>
          );
        })}
      </div>
      {/* Groups slider — expandable */}
      {showGroupsSlider&&(
        <div style={{display:"flex",alignItems:"center",gap:5,padding:"0 10px 10px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <div onClick={()=>navigateGroup(-1)} style={{flexShrink:0,width:16,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:groupIdx>0?"pointer":"default",opacity:groupIdx>0?0.6:0.2,transition:"opacity 0.15s"}}>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6L6 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{flex:1,overflow:"hidden",height:38}}>
            <div ref={sliderScrollRef} style={{width:"100%",height:"calc(100% + 20px)",overflowX:"scroll",overflowY:"hidden",WebkitOverflowScrolling:"touch"}}>
            <div style={{display:"flex",gap:5,alignItems:"center",height:38}}>
              {GROUPS.map((g,i)=>{
                const isCurrent=stage==="groups"&&i===groupIdx;
                const isDone=groupRankings[g]&&groupRankings[g].every(t=>t!==null);
                return (
                  <div key={g} onClick={()=>{setGroupIdx(i);setStage("groups");}} style={{
                    flexShrink:0,width:38,height:34,borderRadius:9,
                    background:isCurrent?"#fff":isDone?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.1)",
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
                    fontSize:isCurrent?15:12,fontWeight:900,
                    color:isCurrent?NAVY:"rgba(255,255,255,0.75)",
                    cursor:"pointer",position:"relative",
                    transition:"all 0.22s",
                    boxShadow:isCurrent?"0 2px 10px rgba(0,0,0,0.3)":"none",
                  }}>
                    {g}
                    {isDone&&<span style={{fontSize:8,lineHeight:1,color:isCurrent?GREEN:"#4ade80",fontWeight:900}}>✓</span>}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
          <div onClick={()=>navigateGroup(1)} style={{flexShrink:0,width:16,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:groupIdx<GROUPS.length-1?"pointer":"default",opacity:groupIdx<GROUPS.length-1?0.6:0.2,transition:"opacity 0.15s"}}>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
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
      <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,userSelect:"none"}}>

        {sharedHeader}
        {/* Progress bar */}
        <div style={{height:3,background:"rgba(255,255,255,0.1)",flexShrink:0}}>
          <div style={{height:"100%",width:`${(best3.length/needed)*100}%`,
            background:`linear-gradient(to right,${RED},${GREEN})`,transition:"width 0.3s"}}/>
        </div>

        {/* ── SELECTED — advancing teams ── */}
        <div style={{background:"#f0f2f8",borderBottom:"1px solid rgba(0,0,0,0.08)",
          padding:"10px 14px",minHeight:70}}>
          <div style={{fontSize:9,color:"rgba(0,0,0,0.38)",fontWeight:800,
            letterSpacing:1.5,marginBottom:8}}>{viewMode?"ADVANCING":"ADVANCING · TAP TO REMOVE"}</div>
          {best3.length===0 ? (
            <div style={{fontSize:12,color:"rgba(0,0,0,0.25)",fontStyle:"italic",paddingBottom:4}}>
              Tap a team below to add them here
            </div>
          ) : (
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {best3.map(team=>(
                <div key={team} onClick={()=>!viewMode&&setBest3(prev=>prev.filter(t=>t!==team))}
                  style={{
                    display:"flex",alignItems:"center",gap:5,
                    padding:"4px 10px 4px 6px",borderRadius:20,
                    background:`${GREEN}18`,border:`1.5px solid ${GREEN}`,
                    cursor:viewMode?"default":"pointer",transition:"all 0.15s",
                  }}>
                  <span style={{fontSize:18,lineHeight:1}}>{FLAGS[team]||"🏳"}</span>
                  <span style={{fontSize:11,fontWeight:800,color:NAVY,
                    textTransform:"uppercase"}}>{C3[team]||team.slice(0,3).toUpperCase()}</span>
                  <span style={{fontSize:10,color:GREEN,fontWeight:900,marginLeft:1}}>✓</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── AVAILABLE TEAMS — same row style as GroupRankingScreen ── */}
        <div style={{flex:1,overflowY:"auto",background:BG,padding:"8px 14px",
          display:"flex",flexDirection:"column",gap:6}}>
          {available.map(team=>{
            const grp=GROUPS.find(g=>(allGroupStandings[g]||[])[2]===team)||"?";
            const disabled=best3.length>=needed;
            return (
              <div key={team} onClick={()=>!viewMode&&!disabled&&setBest3(prev=>[...prev,team])}
                style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"11px 14px",borderRadius:14,
                  background:"#fff",
                  border:"1.5px solid rgba(0,0,0,0.06)",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
                  cursor:(viewMode||disabled)?"default":"pointer",
                  opacity:disabled?0.4:1,
                  transition:"all 0.15s",
                  minHeight:56,
                }}>
                {/* Rank slot — empty circle */}
                <div style={{
                  width:30,height:30,borderRadius:8,flexShrink:0,
                  background:"rgba(0,0,0,0.05)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  <span style={{fontSize:11,color:"rgba(0,0,0,0.2)",fontWeight:700}}>?</span>
                </div>
                {/* Flag */}
                <div style={{width:40,height:28,borderRadius:6,overflow:"hidden",
                  boxShadow:"0 2px 8px rgba(0,0,0,0.15)",flexShrink:0,position:"relative"}}>
                  <FlagBg team={team} style={{}}/>
                </div>
                {/* Name + group */}
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#111",
                    letterSpacing:0.3,textTransform:"uppercase"}}>{team}</div>
                  <div style={{fontSize:10,color:"rgba(0,0,0,0.35)",marginTop:1,fontWeight:600}}>
                    Group {grp} · 3rd place
                  </div>
                </div>
                {/* Add indicator */}
                <div style={{
                  width:24,height:24,borderRadius:"50%",flexShrink:0,
                  background:"rgba(0,0,0,0.06)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  <span style={{fontSize:14,color:"rgba(0,0,0,0.25)",lineHeight:1}}>+</span>
                </div>
              </div>
            );
          })}
          {available.length===0&&(
            <div style={{textAlign:"center",padding:"20px 0",
              color:"rgba(0,0,0,0.3)",fontSize:13,fontStyle:"italic"}}>
              All 3rd-place teams selected ✓
            </div>
          )}
        </div>

        {/* ── CONFIRM BUTTON ── */}
        <div style={{background:"#fff",padding:"10px 14px 22px",
          borderTop:"1px solid rgba(0,0,0,0.07)"}}>
          <button onClick={()=>{ if(viewMode||best3.length>=needed){ setStage("ko"); if(viewMode) setShowFinalSummary(true); } }}
            disabled={!viewMode&&best3.length<needed}
            style={{
              width:"100%",padding:"14px 0",borderRadius:14,border:"none",
              background:(viewMode||best3.length>=needed)
                ?`linear-gradient(135deg,${NAVY},#003580)`
                :"rgba(0,0,0,0.06)",
              color:(viewMode||best3.length>=needed)?"#fff":"rgba(0,0,0,0.2)",
              fontSize:15,fontWeight:900,letterSpacing:1,
              cursor:(viewMode||best3.length>=needed)?"pointer":"default",
              transition:"all 0.2s",
              boxShadow:(viewMode||best3.length>=needed)?"0 4px 20px rgba(0,32,91,0.3)":"none",
            }}>
            {best3.length>=needed
              ?"CONFIRM & GO TO KNOCKOUT →"
              :viewMode
                ?"VIEW KNOCKOUT STAGE →"
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
            <div style={{fontSize:8,color:"rgba(255,255,255,0.5)",fontWeight:600,marginTop:2}}>{label}</div>
          </div>
        </div>
      );

      const scoreRows = [
        { icon:"⚽", label:"Grupe · 1st loc",  pts:PRED_SCORING.group1st, count:12, max:PRED_MAX.groups/3,  color:NAVY },
        { icon:"⚽", label:"Grupe · 2nd loc",  pts:PRED_SCORING.group2nd, count:12, max:PRED_MAX.groups/3,  color:NAVY },
        { icon:"⚽", label:"Grupe · 3rd loc",  pts:PRED_SCORING.group3rd, count:12, max:PRED_MAX.groups/3,  color:NAVY },
        { icon:"🥉", label:"Best Third",        pts:PRED_SCORING.best3,    count:8,  max:PRED_MAX.best3,     color:"#7B2FBE" },
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
            <img src={trophy} alt="" style={{position:"absolute",width:"120%",height:"100%",left:"-10%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",filter:"grayscale(1) contrast(1.5)"}}/>
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
                <div style={{fontSize:9,color:"rgba(255,215,0,0.7)",fontWeight:700,letterSpacing:1,textAlign:"center"}}>MAX</div>
                <div style={{fontSize:18,fontWeight:900,color:"#FFD700",lineHeight:1}}>{PRED_MAX.total}</div>
                <div style={{fontSize:8,color:"rgba(255,215,0,0.6)",fontWeight:600,textAlign:"center"}}>{T[lang].possiblePts}</div>
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
            <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:12}}>
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
            <button onClick={()=>onComplete&&onComplete()}
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
        <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
        {sharedHeader}
        <GroupIntroScreen group={koRound} teams={koRoundMatchups.map(m=>[m.home,m.away])}
          isKo={true} hideHeader={true} onStart={()=>setKoShowIntro(false)} picks={koPicks} viewMode={viewMode}/>
      </div>
    );
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,userSelect:"none"}}>
        {sharedHeader}
        <MatchSwipeCard key={`ko-${koRound}-${koIdx}`}
          home={currentKo?.home||"TBD"} away={currentKo?.away||"TBD"}
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
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
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
        viewMode={viewMode}
      />
    </div>
  );
}

function InstantPickSummaryScreen({ picks, koPicks, best3, getGroupStanding, onConfirm, readOnly }) {
  const lang = useLang();
  const GROUPS = INTERACTIVE_GROUPS;
  const ALL_ROUNDS = ["R16","QF","SF","Final"];

  // Find champion from koPicks
  const champion = koPicks["final"] || null;

  const SCORING = [
    { label:"⚽ Groups · Correct Result",  pts:30,  color:NAVY,   icon:"✓" },
    { label:"🥉 Best Third · per echipă",  pts:20,  color:"#7B2FBE",icon:"✓" },
    { label:"🏆 Round of 16",              pts:40,  color:RED,    icon:"✓" },
    { label:"🏆 Sferturi",                 pts:60,  color:RED,    icon:"✓" },
    { label:"🏆 Semifinale",               pts:90,  color:RED,    icon:"✓" },
    { label:"🏆 Final",                    pts:120, color:"#D4820A",icon:"✓" },
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

function GroupRankingScreen({ group, teams, existingRanking, onConfirm, onAutoSave, onBack, groupIdx, totalGroups, onNavigate, groupRankings, hideHeader=false, viewMode=false }) {
  const lang = useLang();
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
    e.preventDefault();
    e.stopPropagation();
    setDragIdx(idx);
    setDragOverIdx(null);
  };
  const handleTouchMove = (e) => {
    if (dragIdx === null) return;
    e.preventDefault();
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
      {!hideHeader && <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>}

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
            <div style={{fontSize:10, color:RED, fontWeight:800, letterSpacing:1.5}}>Predicto</div>
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
              <span style={{fontSize:7,color:"rgba(255,255,255,0.8)",fontWeight:800,
                letterSpacing:0.3,lineHeight:1,textAlign:"center"}}>{phase.name}</span>
              <span style={{fontSize:10,lineHeight:1}}>🔒</span>
            </div>
          ))}
        </div>

      </div>}

      {/* ── TEAM TILES ── */}
      <div style={{background:"transparent", padding:"14px 14px 10px",
        borderBottom:"1px solid rgba(0,0,0,0.08)", position:"relative", zIndex:1}}>
        {!viewMode && <div style={{fontSize:10, color:"rgba(0,0,0,0.4)", letterSpacing:2,
          fontWeight:700, marginBottom:8, textAlign:"center"}}>TAP TO ASSIGN · TAP AGAIN TO REMOVE</div>}
        <div style={{display:"flex", gap:8, justifyContent:"space-between"}}>
          {teams.map(team => {
            const pos = ranking.indexOf(team);
            const isPlaced = pos !== -1;
            return (
              <div key={team} onClick={() => !viewMode && handleTileClick(team)} style={{
                flex:1, background: isPlaced ? "rgba(0,32,91,0.07)" : "#fff",
                borderRadius:12, padding:"10px 4px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                cursor:viewMode?"default":"pointer", position:"relative",
                border:`2px solid ${isPlaced ? "rgba(0,32,91,0.25)" : "rgba(0,0,0,0.08)"}`,
                transition:"all 0.15s",
                opacity: isPlaced ? 0.6 : 1,
                transform: isPlaced ? "scale(0.94)" : "scale(1)",
                boxShadow: isPlaced ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
              }}>
                {isPlaced && (
                  <div style={{
                    position:"absolute", top:-8, right:-6,
                    background: placeColors[pos],
                    borderRadius:"50%", width:20, height:20,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:900,
                    color: placeTextColor[pos],
                    border:"2px solid #f0f2f8",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
                  }}>{pos+1}</div>
                )}
                <span style={{fontSize:28, lineHeight:1}}>{FLAGS[team]||"🏳"}</span>
                <span style={{fontSize:9, fontWeight:800,
                  color: isPlaced ? NAVY : "rgba(0,0,0,0.5)",
                  letterSpacing:1, textTransform:"uppercase"}}>
                  {CODE[team]||team.slice(0,3).toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RANKING ROWS ── */}
      <div ref={rankingContainerRef} style={{flex:1, overflowY:"auto", background:"transparent", padding:"8px 14px", display:"flex", flexDirection:"column", gap:6, position:"relative", zIndex:1}}>
        {[0,1,2,3].map(idx => {
          const team = ranking[idx];
          const teamColor = team ? (TEAM_COLORS[team]||["#555"])[0] : null;
          const isDragging = dragIdx === idx;
          const isOver = dragOverIdx === idx;
          return (
            <div key={idx} ref={el => rowRefs.current[idx] = el}
              onTouchStart={team && !viewMode ? e=>handleTouchStart(e,idx) : undefined}
              onTouchMove={team && !viewMode ? handleTouchMove : undefined}
              onTouchEnd={team && !viewMode ? handleTouchEnd : undefined}
              style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"11px 14px", borderRadius:14,
                background: isDragging ? "#e8eeff" : isOver ? "#dde8ff" : "#fff",
                border:`1.5px solid ${isOver ? "#4a90e2" : isDragging ? "#7aaff5" : "rgba(0,0,0,0.06)"}`,
                boxShadow: isDragging ? "0 6px 20px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
                transform: isDragging ? "scale(1.02)" : "scale(1)",
                transition:"background 0.1s, box-shadow 0.1s, transform 0.1s",
                minHeight:58, cursor: team ? "grab" : "default",
                userSelect:"none", WebkitUserSelect:"none",
              }}>

              {/* Place badge */}
              {(idx < 3 || !team) ? (
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background: team ? placeColors[idx] : "rgba(0,0,0,0.05)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, fontWeight:900,
                  color: team ? placeTextColor[idx] : "rgba(0,0,0,0.2)",
                  boxShadow: team ? `0 2px 8px ${placeColors[idx]}88` : "none",
                }}>{idx+1}</div>
              ) : (
                <div style={{width:36, height:36, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <span style={{fontSize:20, fontWeight:700, color:"#aaa"}}>4</span>
                </div>
              )}

              {team ? (
                <>
                  {/* Flag */}
                  <div style={{width:40, height:28, borderRadius:6, overflow:"hidden",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.15)", flexShrink:0, position:"relative"}}>
                    <FlagBg team={team} style={{}}/>
                  </div>
                  {/* Name */}
                  <div style={{flex:1, cursor:viewMode?"default":"pointer"}} onClick={()=>!viewMode&&handleSlotClick(idx)}>
                    <div style={{fontSize:14, fontWeight:800, color:"#111",
                      letterSpacing:0.3, textTransform:"uppercase"}}>{team}</div>
                    <div style={{fontSize:10, color:idx===0?GREEN:idx===1?"#4a90e2":idx===2?"#CD7F32":"rgba(0,0,0,0.35)",
                      marginTop:1, fontWeight:600}}>
                      {idx===0?"Group Winner · Advances":idx===1?"Runner-up · Advances":idx===2?"Possible 3rd Place":"Eliminated"}
                    </div>
                  </div>
                  {/* Drag handle = — touch to reorder */}
                  {!viewMode && <div
                    onTouchStart={e=>{ e.stopPropagation(); handleTouchStart(e, idx); }}
                    onTouchMove={e=>{ e.stopPropagation(); handleTouchMove(e); }}
                    onTouchEnd={e=>{ e.stopPropagation(); handleTouchEnd(); }}
                    style={{
                      display:"flex", flexDirection:"column", gap:4,
                      padding:"10px 6px", cursor:"grab", flexShrink:0,
                      touchAction:"none",
                    }}>
                    <div style={{width:22, height:2.5, background:"#999", borderRadius:2}}/>
                    <div style={{width:22, height:2.5, background:"#999", borderRadius:2}}/>
                  </div>}
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
      <div style={{background:"#fff", padding:"10px 14px 22px",
        borderTop:"1px solid rgba(0,0,0,0.07)",
        display:"flex", flexDirection:"column", gap:8,
        position:"relative", zIndex:1}}>

        {/* Reset / Auto-pick row */}
        {!viewMode && <div style={{display:"flex", justifyContent:"space-between"}}>
          <button onClick={autoPickRanking} style={{
            background:"rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.08)",
            borderRadius:10, padding:"7px 14px",
            color:"rgba(0,0,0,0.45)", fontSize:12, cursor:"pointer", fontWeight:700,
          }}>🎲 Auto-pick</button>
          <button onClick={resetRanking} style={{
            background:"rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.08)",
            borderRadius:10, padding:"7px 14px",
            color:"rgba(0,0,0,0.45)", fontSize:12, cursor:"pointer", fontWeight:700,
          }}>↺ Reset</button>
        </div>}

        {/* Confirm / Next */}
        <button onClick={() => (viewMode || isComplete) && onConfirm(ranking)}
          disabled={!viewMode && !isComplete}
          style={{
            width:"100%", padding:"14px 0", borderRadius:14, border:"none",
            background: (viewMode || isComplete)
              ? `linear-gradient(135deg, ${NAVY}, #003580)`
              : "rgba(0,0,0,0.06)",
            color: (viewMode || isComplete) ? "#fff" : "rgba(0,0,0,0.2)",
            fontSize:15, fontWeight:900, letterSpacing:1,
            cursor: (viewMode || isComplete) ? "pointer" : "default",
            transition:"all 0.2s",
            boxShadow: (viewMode || isComplete) ? `0 4px 20px rgba(0,32,91,0.35)` : "none",
          }}>
          {viewMode
            ? groupIdx < totalGroups-1 ? `NEXT GROUP →` : `NEXT: BEST THIRD →`
            : isComplete
              ? groupIdx < totalGroups-1 ? `CONFIRM & NEXT GROUP →` : `CONFIRM ALL GROUPS ✓`
              : `SELECT ALL 4 TEAMS`}
        </button>
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

    </div>
  );
}


// ── HOME ────────────────────────────────────────────────────────────────────
function HomeScreen({ onPredict, onLeaderboard, onBoards, onCreateBoard, onOpenGroups, myBoards, predictionsComplete, instantPickDone, exactScores, activeBoardId, setActiveBoardId, tournamentStarted, simDay, simHour, simMin, createdBoards=[], showFirstAction, leaderboardData={} }) {
  const lang = useLang();
  const displayName = useDisplayName();
  const initials = useInitials();
  const activeId = activeBoardId;
  const setActiveId = setActiveBoardId;
  const activeBoard = myBoards.find(b=>b.id===activeId)||myBoards[0];
  const membersLabel = activeBoard?.members>999?`${(activeBoard.members/1000).toFixed(0)}k`:activeBoard?.members;
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
  const me = leaders.find(u=>u.isMe);
  const meInTop3 = top3.some(u=>u.isMe);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"12px 20px 10px",flexShrink:0,position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{fontSize:18,color:RED,margin:0,fontStyle:"italic",fontWeight:900,letterSpacing:-0.5}}>Predicto</p>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🔔</div>
        </div>
        <div style={{display:"flex",alignItems:"flex-start",gap:10,overflowX:"auto",scrollbarWidth:"none",padding:"10px 0 2px"}}>
          {myBoards.map(b=><CircleTab key={b.id} label={b.label} name={b.isGlobal?"Global":b.name.split(" ")[0]} isActive={activeId===b.id} onClick={()=>setActiveId(b.id)}/>)}
          <div onClick={onBoards} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",flexShrink:0}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"transparent",border:"2px dashed rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"rgba(255,255,255,0.4)"}}>+</div>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:500}}>{T[lang].add}</span>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"10px 16px 0",position:"relative",zIndex:1}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:0}}>{activeBoard?.name||"Global Board"}</p>
          <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:0}}>👥 {membersLabel}</p>
        </div>
        {/* User stats card */}
        <div style={{background:"#fff",borderRadius:16,boxShadow:SHADOW_OUT,padding:"10px 14px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:800}}>
              {initials}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:15,fontWeight:800,color:DARK,margin:0}}>{displayName}</p>
              <p style={{fontSize:12,color:"#888",margin:"2px 0 0"}}>{tournamentStarted?`${me?.pts||0} ${T[lang].ptsTotal}`:T[lang].tournamentStarts}</p>
            </div>
            <span onClick={onLeaderboard} style={{fontSize:12,color:NAVY,fontWeight:700,cursor:"pointer",flexShrink:0}}>{T[lang].viewAll}</span>
          </div>
          {/* Ranking across boards — horizontal scroll with fade indicator */}
          <div style={{position:"relative",margin:"0 -14px"}}>
            <div style={{display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",
              WebkitOverflowScrolling:"touch",padding:"0 14px 2px"}}>
              {myBoards.map(b=>{
                const bLeaders = leaderboardData[b.id] || [];
                const myRank = bLeaders.find(u=>u.isMe)?.rank || 1;
                const isActive = activeId===b.id;
                return (
                  <div key={b.id} onClick={()=>setActiveId(b.id)}
                    style={{flexShrink:0,minWidth:84,
                      background:isActive?`${NAVY}12`:BG,borderRadius:10,padding:"7px 10px",
                      border:isActive?`1.5px solid ${NAVY}`:"1.5px solid rgba(0,0,0,0.07)",
                      cursor:"pointer",transition:"all 0.2s"}}>
                    <p style={{fontSize:10,color:isActive?NAVY:"#888",margin:0,
                      textTransform:"uppercase",letterSpacing:0.5,fontWeight:700,whiteSpace:"nowrap",
                      overflow:"hidden",textOverflow:"ellipsis",maxWidth:70}}>
                      {b.isGlobal?"🌍 Global":`${b.label} ${b.name.split(" ")[0]}`}
                    </p>
                    <p style={{fontSize:15,fontWeight:800,color:isActive?NAVY:DARK,margin:"2px 0 0"}}>#{myRank}</p>
                  </div>
                );
              })}
              {/* Extra padding for fade */}
              <div style={{flexShrink:0,width:24}}/>
            </div>
            {/* Fade + arrow indicator on right */}
            {myBoards.length>2&&(
              <div style={{position:"absolute",right:0,top:0,bottom:0,width:40,
                background:"linear-gradient(to right, transparent, #fff 70%)",
                display:"flex",alignItems:"center",justifyContent:"flex-end",
                paddingRight:4,pointerEvents:"none"}}>
                <span style={{fontSize:12,color:"#aaa",fontWeight:700}}>›</span>
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 6px"}}>{T[lang].yourTasks}</p>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {/* Predictions task */}
          {(()=>{
            const boardDone = instantPickDone || predictionsComplete[activeId];
            // Deadline: June 11 19:00 (tournament kickoff)
            const deadlinePassed = simDay ? (simDay > 11 || (simDay === 11 && (simHour||0) >= 19)) : false;
            const isLocked = deadlinePassed && !boardDone;
            return (
              <div onClick={()=>(!deadlinePassed||boardDone)&&onPredict(activeId)}
                style={{flex:1,background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,
                  padding:"10px 12px",cursor:(deadlinePassed&&!boardDone)?"default":"pointer",position:"relative",
                  opacity:isLocked?0.6:1,
                  ...(showFirstAction&&!boardDone&&!deadlinePassed?{animation:"pulse 1.5s ease-in-out 3"}:{})}}>
                {!boardDone&&!deadlinePassed&&(
                  <div style={{position:"absolute",top:-5,right:-5,
                    background:RED,borderRadius:"50%",minWidth:18,height:18,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.3)",padding:"0 5px"}}>
                    <span style={{fontSize:10,fontWeight:800,color:"#fff"}}>1</span>
                  </div>
                )}
                <div style={{fontSize:28,marginBottom:4}}>{isLocked?"🔒":"🎯"}</div>
                <p style={{fontSize:13,fontWeight:800,color:isLocked?"#aaa":DARK,margin:0}}>{T[lang].predictions}</p>
                <p style={{fontSize:11,margin:"2px 0 0",fontWeight:600,
                  color:boardDone?GREEN:isLocked?"#bbb":"#888"}}>
                  {boardDone?T[lang].completed:isLocked?T[lang].deadlinePassed:T[lang].dueJun11}
                </p>
              </div>
            );
          })()}
          {/* Exact Score task */}
          {(()=>{
            // Count this week's missing scores
            const simNowDate = simDay ? new Date(2026,5,simDay,simHour||12,simMin||0,0) : new Date();
            const todaySim = simDay || simNowDate.getDate();
            const weekStart = todaySim<=14?8:todaySim<=21?15:todaySim<=28?22:29;
            const days = Array.from({length:7},(_,i)=>weekStart+i).filter(d=>d>=1&&d<=50);
            const mm = {};
            CALENDAR_EVENTS.forEach(e=>{ mm[e.day]=e.matches; });
            const total = days.reduce((s,d)=>s+(mm[d]||[]).length,0);
            const scored = days.reduce((s,d)=>s+(mm[d]||[]).filter((_,i)=>(exactScores||{})[`${d}-${i}`]).length,0);
            const missing = total - scored;
            return (
              <div onClick={()=>onOpenGroups&&onOpenGroups()}
                style={{flex:1,background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,
                  padding:"10px 12px",cursor:"pointer",position:"relative"}}>
                {missing>0&&(
                  <div style={{position:"absolute",top:-5,right:-5,
                    background:RED,borderRadius:"50%",minWidth:18,height:18,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.3)",padding:"0 5px"}}>
                    <span style={{fontSize:10,fontWeight:800,color:"#fff"}}>{missing}</span>
                  </div>
                )}
                <div style={{fontSize:28,marginBottom:4,colorScheme:"light",filter:"saturate(0) contrast(3) brightness(1.1)"}}>⚽</div>
                <p style={{fontSize:13,fontWeight:800,color:DARK,margin:0}}>{T[lang].exactScores}</p>
                <p style={{fontSize:11,color:missing===0?GREEN:"#888",margin:"2px 0 0",fontWeight:600}}>
                  {missing===0?T[lang].weekComplete:`${missing} ${T[lang].thisWeek}`}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Path to Trophy timeline */}
        {(()=>{
          const simNowDate = simDay ? new Date(2026,5,simDay,simHour||12,simMin||0,0) : new Date();
          const june = (d) => new Date(2026,5,d,8,0,0);
          const w1Open = true;
          const w2Open = simNowDate >= june(14);
          const w3Open = simNowDate >= june(21);
          const w4Open = simNowDate >= june(28);
          const todaySim = simDay ? Number(simDay) : simNowDate.getDate();
          const weekDays = (start) => Array.from({length:7},(_,i)=>start+i).filter(d=>d>=1&&d<=50);
          const weekMatchMap = () => { const mm={}; CALENDAR_EVENTS.forEach(e=>{mm[e.day]=e.matches;}); return mm; };
          const totalRawInWeek = (start) => {
            const mm = weekMatchMap();
            return weekDays(start).reduce((s,d)=>s+(mm[d]||[]).length,0);
          };
          const matchesInWeek = (start) => {
            const mm = weekMatchMap();
            return weekDays(start).reduce((s,d)=>s+(mm[d]||[]).filter((m,i)=>
              (exactScores||{})[`${d}-${i}`] || !isMatchPast(d, m.time, simDay, simHour)
            ).length,0);
          };
          const scoredInWeek = (start) => {
            const mm = weekMatchMap();
            return weekDays(start).reduce((s,d)=>s+(mm[d]||[]).filter((_,i)=>(exactScores||{})[`${d}-${i}`]).length,0);
          };
          const missedInWeek = (start) => {
            const mm = weekMatchMap();
            return weekDays(start).reduce((s,d)=>s+(mm[d]||[]).filter((m,i)=>
              isMatchPast(d, m.time, simDay, simHour) && !(exactScores||{})[`${d}-${i}`]
            ).length,0);
          };
          const steps = [
            { label:"Jun 8-14",  stage:`${T[lang].groupStage} · ${T[lang].week} 1`, locked:!w1Open, total:matchesInWeek(8),  scored:scoredInWeek(8),  missed:missedInWeek(8),  totalRaw:totalRawInWeek(8),  past:todaySim>14, weekStart:8  },
            { label:"Jun 15-21", stage:`${T[lang].groupStage} · ${T[lang].week} 2`, locked:!w2Open, total:matchesInWeek(15), scored:scoredInWeek(15), missed:missedInWeek(15), totalRaw:totalRawInWeek(15), past:todaySim>21, weekStart:15 },
            { label:"Jun 22-28", stage:`${T[lang].groupStage} · ${T[lang].week} 3`, locked:!w3Open, total:matchesInWeek(22), scored:scoredInWeek(22), missed:missedInWeek(22), totalRaw:totalRawInWeek(22), past:todaySim>28, weekStart:22 },
            { label:"Jun 29+",   stage:T[lang].roundOf16QF, locked:!w4Open, total:matchesInWeek(29), scored:scoredInWeek(29), missed:missedInWeek(29), totalRaw:totalRawInWeek(29), past:false,       weekStart:29 },
            { label:"Jul 19",    stage:`🏆 ${T[lang].final}`, locked:true, total:1, scored:0, missed:0, totalRaw:1, isFinal:true },
          ];

          return (
            <div style={{marginBottom:10}}>
              {/* Header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:0}}>{T[lang].pathToTrophy}</p>
                <span style={{fontSize:10,color:"#bbb",fontWeight:600}}>{T[lang].unlocksEvery}</span>
              </div>
              <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"12px 14px"}}>
                {steps.map((w,i)=>{
                  const pct = w.total?Math.round((w.scored/w.total)*100):0;
                  const done = !w.locked && pct===100;
                  const isPast = w.past && !w.locked;
                  const active = !w.locked && !done && !isPast;
                  const nodeColor = w.isFinal?"#FFD700":done?GREEN:isPast?"#aaa":active?NAVY:"#ddd";
                  const isLast = i===steps.length-1;
                  return (
                    <div key={i} style={{display:"flex",gap:12,cursor:(w.locked&&!isPast)?"default":"pointer",
                      opacity:(isPast&&!done)?0.6:1}}
                      onClick={()=>(!w.locked||isPast)&&!w.isFinal&&onOpenGroups&&onOpenGroups(w.weekStart)}>
                      {/* Timeline column */}
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:20,flexShrink:0}}>
                        {/* Node */}
                        <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,
                          background:nodeColor,
                          border:`2px solid ${nodeColor}`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          boxShadow:active?`0 0 0 3px ${NAVY}22`:"none"}}>
                          {w.isFinal
                            ? <span style={{fontSize:10}}>🏆</span>
                            : done
                              ? <span style={{fontSize:9,color:"#fff",fontWeight:900}}>✓</span>
                              : active
                                ? <div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>
                                : null}
                        </div>
                        {/* Line to next */}
                        {!isLast&&(
                          <div style={{width:2,flex:1,minHeight:24,marginTop:2,
                            background:done||isPast?GREEN:"#e8e8e8",borderRadius:1}}/>
                        )}
                      </div>
                      {/* Content */}
                      <div style={{flex:1,paddingBottom:isLast?0:14}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:w.isFinal||w.locked?0:4}}>
                          <div>
                            <span style={{fontSize:13,fontWeight:700,
                              color:w.locked&&!w.isFinal&&!isPast?"#bbb":w.isFinal?"#B8860B":isPast?"#999":DARK}}>
                              {w.label}
                            </span>
                            <span style={{fontSize:10,color:w.locked&&!w.isFinal?"#ccc":"#999",
                              marginLeft:6,fontWeight:500}}>{w.stage}</span>
                          </div>
                          <span style={{fontSize:11,fontWeight:700,
                            color:w.locked&&!isPast?"#ccc":done?GREEN:isPast?"#999":active?NAVY:"#bbb"}}>
                            {w.isFinal?T[lang].final:w.locked&&!isPast?T[lang].locked:done?T[lang].weekComplete:isPast?`${w.scored}/${w.total} · ${T[lang].past}`:`${w.scored}/${w.total}`}
                          </span>
                        </div>
                        {/* Progress bar */}
                        {!w.locked&&!w.isFinal&&(
                          <div style={{height:4,background:"rgba(0,0,0,0.06)",borderRadius:2,overflow:"hidden",display:"flex"}}>
                            <div style={{height:"100%",width:`${w.totalRaw?Math.round((w.missed/w.totalRaw)*100):0}%`,
                              background:"#b0a0a0",transition:"width 0.3s",flexShrink:0}}/>
                            <div style={{height:"100%",width:`${w.totalRaw?Math.round((w.scored/w.totalRaw)*100):0}%`,
                              background:GREEN,transition:"width 0.3s",flexShrink:0}}/>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div style={{marginBottom:80}}/>

      </div>
    </div>
  );
}


// ── BOARDS ────────────────────────────────────────────────────────────────────



// ── BOARDS ────────────────────────────────────────────────────────────────────
function BoardsScreen({ onBack, myBoards, setMyBoards, onJoin, createdBoards: createdBoardsProp, setCreatedBoards: setCreatedBoardsProp, availableBoards: availableBoardsProp, setAvailableBoards: setAvailableBoardsProp, showToast, user, onCreateBoard, onJoinByCode, onJoinBoard, onDeleteBoard, onRemoveMember, leaderboardData={} }) {
  const displayName = useDisplayName();
  const lang = useLang();
  const [view, setView] = useState("main"); // main | join | create
  const [showCodeInfo, setShowCodeInfo] = useState(false);
  const [boardSearch, setBoardSearch] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  // Create form state
  const [cName, setCName] = useState("");
  const [cEmoji, setCEmoji] = useState("");
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

  const doJoin = (b) => {
    if(!myBoards.find(x=>x.id===b.id)){
      setMyBoards(p=>[...p,{...b}]);
      setAvailBoards(p=>p.map(c=>c.id===b.id?{...c,members:(c.members||0)+1}:c));
      if(onJoinBoard) onJoinBoard(b.id);
      if(showToast) showToast(`Joined "${b.name}"!`, "🏆");
    }
  };

  const removeMember = (boardId, memberId) => {
    setCreatedBoards(p=>p.map(b=>b.id===boardId?{
      ...b,
      members:Math.max(0,(b.members||0)-1),
      membersList:(b.membersList||[]).filter(m=>m.id!==memberId)
    }:b));
  };

  const joinBoard = b => {
    if(b.password) {
      setJoinPrompt(b);
      setJoinPass("");
      setJoinError("");
    } else {
      doJoin(b);
    }
  };

  const handleJoinCode = async () => {
    const trimmed = boardSearch.trim();
    if (onJoinByCode) {
      const data = await onJoinByCode(trimmed);
      if (data) { setBoardSearch(""); setCodeError(""); if(onJoin) onJoin(data.id); }
      else setCodeError(T[lang].invalidCode);
      return;
    }
    const found = [...availBoards, ...createdBoards].find(b=>b.code===trimmed.toUpperCase()||b.id===trimmed);
    if(found){ joinBoard(found); setBoardSearch(""); setCodeError(""); }
    else setCodeError(T[lang].invalidCode);
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
      });
      if(data) {
        if(showToast) showToast(`"${cName}" created!`, "🎉");
        setCName(""); setCEmoji(""); setCPassword(""); setShowEmojiPicker(false);
        setEditBoard(null); setView("main");
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
      setCreatedBoards(p=>p.map(b=>b.id===editBoard.id?newBoard:b));
      if(showToast) showToast("Board updated! ✓", "✏️");
    } else {
      setCreatedBoards(p=>[...p, newBoard]);
      if(showToast) showToast(`"${cName}" created!`, "🎉");
      if(onJoin) onJoin(newBoard.id);
    }
    setEditBoard(null); setCEmoji(""); setShowEmojiPicker(false); setView("main");
  };

  const isJoined = id => myBoards.some(b=>b.id===id);

  if(view==="create") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,position:"relative",overflow:"hidden"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"16px 20px 22px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div onClick={()=>setView("main")} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div>
            <p style={{fontSize:11,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>Predicto</p>
            <h2 style={{fontSize:17,fontWeight:800,color:"#fff",margin:0}}>{editBoard?T[lang].editBoard:T[lang].createBoard}</h2>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 24px",position:"relative",zIndex:1}}>
        {/* Name */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 6px"}}>{T[lang].boardName}</p>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
          {/* Avatar emoji picker */}
          <div onClick={()=>setShowEmojiPicker(p=>!p)}
            style={{width:52,height:52,borderRadius:14,flexShrink:0,cursor:"pointer",
              background:cEmoji?BG:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,
              boxShadow:SHADOW_OUT,display:"flex",alignItems:"center",justifyContent:"center",
              border:showEmojiPicker?`2px solid ${NAVY}`:"2px solid transparent"}}>
            {cEmoji
              ? <span style={{fontSize:28}}>{cEmoji}</span>
              : <span style={{fontSize:22,color:"rgba(255,255,255,0.8)"}}>+</span>}
          </div>
          <div style={{flex:1,background:BG,borderRadius:12,boxShadow:SHADOW_IN,padding:"11px 14px"}}>
            <input value={cName} onChange={e=>setCName(e.target.value)} placeholder="Ex: Colegii de la birou"
              style={{width:"100%",background:"transparent",border:"none",outline:"none",fontSize:14,color:DARK}}/>
          </div>
        </div>
        {/* Emoji grid */}
        {showEmojiPicker&&(
          <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_OUT,padding:"12px",marginBottom:14,marginTop:-8}}>
            <p style={{fontSize:12,fontWeight:700,color:"#aaa",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>{T[lang].chooseEmoji}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6}}>
              {["⚽","🏆","🥇","🎯","🔥","⭐","💪","🦁","🐯","🦅","🌍","🎖️","🏅","🥊","🎮","🎪",
                "🍕","🍺","🎉","🚀","💎","🌟","👑","🤝","🏋️","🎸","🏄","🎭"].map(e=>(
                <div key={e} onClick={()=>{ setCEmoji(e); setShowEmojiPicker(false); }}
                  style={{width:"100%",aspectRatio:"1",borderRadius:8,display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:20,cursor:"pointer",
                    background:cEmoji===e?`${NAVY}22`:"transparent",
                    border:cEmoji===e?`1.5px solid ${NAVY}`:"1.5px solid transparent"}}>
                  {e}
                </div>
              ))}
            </div>
            {cEmoji&&(
              <button onClick={()=>{ setCEmoji(""); setShowEmojiPicker(false); }}
                style={{marginTop:8,width:"100%",padding:"6px",borderRadius:8,border:"none",
                  background:"rgba(0,0,0,0.05)",fontSize:11,color:"#aaa",cursor:"pointer"}}>
                {T[lang].del}
              </button>
            )}
          </div>
        )}

        {/* Password */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 6px"}}>{T[lang].boardPassword}</p>
        <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_IN,padding:"11px 14px",display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <span style={{fontSize:14}}>🔒</span>
          <input value={cPassword} onChange={e=>setCPassword(e.target.value)} placeholder="Parola pentru join..."
            style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:14,color:DARK}}/>
        </div>

        {/* Max players */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{T[lang].maxPlayers}</p>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[5,10,15,20,50].map(n=>(
            <button key={n} onClick={()=>setCMaxPlayers(n)}
              style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",cursor:"pointer",
                background:cMaxPlayers===n?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:BG,
                color:cMaxPlayers===n?"#fff":DARK,fontWeight:700,fontSize:12,
                boxShadow:cMaxPlayers===n?"0 3px 10px rgba(0,32,91,0.3)":SHADOW_OUT}}>
              {n}
            </button>
          ))}
        </div>

        {/* Prize slots */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{T[lang].prizedSlots}</p>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>{ setCSlots(n); setCPrizes(p=>{const a=[...p];while(a.length<n)a.push("");return a;}); }}
              style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",cursor:"pointer",
                background:cSlots===n?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:BG,
                color:cSlots===n?"#fff":DARK,fontWeight:700,fontSize:13,
                boxShadow:cSlots===n?"0 3px 10px rgba(0,32,91,0.3)":SHADOW_OUT}}>
              {n}
            </button>
          ))}
        </div>

        {/* Prizes per slot */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{T[lang].prizesLabel}</p>
        {Array.from({length:cSlots},(_,i)=>(
          <div key={i} style={{background:BG,borderRadius:12,boxShadow:SHADOW_IN,padding:"10px 14px",
            display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:28,height:28,borderRadius:8,background:i===0?"#FFD700":i===1?"#C0C0C0":"#CD7F32",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
              {i===0?"🥇":i===1?"🥈":"🥉"}
            </div>
            <span style={{fontSize:12,fontWeight:700,color:"#aaa",width:50}}>Rank {i+1}</span>
            <input value={cPrizes[i]||""} onChange={e=>{ const a=[...cPrizes]; a[i]=e.target.value; setCPrizes(a); }}
              placeholder={[
                "e.g. $50, team jersey, gift voucher...",
                "e.g. $30, match ticket, voucher...",
                "e.g. $15, cap, surprise gift...",
                "e.g. Drinks on you, weekend trip...",
                "e.g. Cake, Netflix subscription..."
              ][i]||"e.g. Your prize..."}
              style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:DARK}}/>
          </div>
        ))}

        {/* Members management — only when editing */}
        {editBoard&&(editBoard.membersList?.length>0)&&(<>
          <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"16px 0 8px"}}>{T[lang].membersLabel}</p>
          <div style={{background:BG,borderRadius:12,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:4}}>
            {(editBoard.membersList||[]).map((m,mi)=>(
              <div key={mi} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                background:"#fff",borderBottom:mi<editBoard.membersList.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
                <div style={{width:32,height:32,borderRadius:"50%",
                  background:m.isMe?`${NAVY}22`:"rgba(0,0,0,0.07)",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:13,fontWeight:700,color:m.isMe?NAVY:"#888"}}>{m.name[0]}</span>
                </div>
                <span style={{flex:1,fontSize:13,fontWeight:600,color:m.isMe?NAVY:DARK}}>{m.name}{m.isMe?" (Tu)":""}</span>
                {!m.isMe?(
                  <button onClick={()=>{
                    const updated = {...editBoard, membersList: editBoard.membersList.filter(x=>x.id!==m.id), members:Math.max(0,(editBoard.members||0)-1)};
                    setEditBoard(updated);
                    setCreatedBoards(p=>p.map(b=>b.id===updated.id?updated:b));
                  }} style={{background:"rgba(200,16,46,0.08)",border:"none",borderRadius:8,
                    padding:"5px 12px",fontSize:11,fontWeight:700,color:RED,cursor:"pointer"}}>
                    Remove
                  </button>
                ):(
                  <span style={{fontSize:11,color:"#bbb"}}>Admin</span>
                )}
              </div>
            ))}
          </div>
        </>)}

        <button onClick={handleCreate}
          style={{width:"100%",marginTop:16,padding:"15px 0",borderRadius:14,border:"none",
            background:cName.trim()?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"#e0e0e0",
            color:cName.trim()?"#fff":"#bbb",fontSize:15,fontWeight:800,cursor:cName.trim()?"pointer":"default",
            boxShadow:cName.trim()?"0 6px 20px rgba(0,32,91,0.3)":"none"}}>
          {editBoard ? T[lang].saveChanges : T[lang].createBoard2}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"transparent",position:"relative",overflow:"hidden"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"16px 20px 22px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div style={{flex:1}}>
            <p style={{fontSize:11,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>Predicto</p>
            <h2 style={{fontSize:17,fontWeight:800,color:"#fff",margin:0}}>{T[lang].boards}</h2>
          </div>
          <button onClick={()=>{
            setEditBoard(null);
            setCName(""); setCPassword(""); setCEmoji(""); setCMaxPlayers(10); setCSlots(3); setCPrizes(["","",""]);
            setView("create");
          }}
            style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"8px 14px",
              color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            + {T[lang].createBoard}
          </button>
        </div>
      </div>
      {/* Password modal */}
      {joinPrompt&&(
        <div style={{position:"absolute",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",background:"rgba(0,0,0,0.5)"}}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",width:"100%"}}>
            <div style={{width:36,height:4,borderRadius:2,background:"#e0e0e0",margin:"0 auto 20px"}}/>
            <h3 style={{fontSize:17,fontWeight:800,color:DARK,margin:"0 0 4px",textAlign:"center"}}>{joinPrompt.name}</h3>
            <p style={{fontSize:12,color:"#aaa",textAlign:"center",margin:"0 0 20px"}}>{T[lang].passwordProtected}</p>
            <div style={{background:"#f5f5f5",borderRadius:12,padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>🔑</span>
              <input value={joinPass} onChange={e=>{setJoinPass(e.target.value);setJoinError("");}}
                placeholder={T[lang].enterPassword} type="password"
                style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:14,color:DARK}}/>
            </div>
            {joinError&&<p style={{fontSize:11,color:RED,margin:"0 0 12px 4px"}}>{joinError}</p>}
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={()=>setJoinPrompt(null)}
                style={{flex:1,padding:"13px 0",borderRadius:12,border:"none",background:"#f0f0f0",color:"#888",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {T[lang].cancel}
              </button>
              <button onClick={()=>{
                if(joinPass===joinPrompt.password){
                  doJoin(joinPrompt);
                  setJoinPrompt(null);
                } else {
                  setJoinError(T[lang].incorrectPassword);
                }
              }}
                style={{flex:2,padding:"13px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                Join 🏆
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"16px 20px 80px",position:"relative",zIndex:1}}>


        {/* My created boards */}
        {/* Admin boards */}
        {createdBoards.length>0&&(<>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:0}}>{T[lang].boardAdmin}</p>
          </div>
          {createdBoards.map(b=>(
            <div key={b.id} style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,0.10)",padding:"12px 14px",marginBottom:9}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#007A36)`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,cursor:"pointer"}}
                  onClick={()=>{
                    setEditBoard(b);
                    setCName(b.name);
                    setCPassword(b.password||"");
                    setCMaxPlayers(b.max||10);
                    setCSlots(b.prizes?.length||3);
                    setCPrizes(b.prizes?.length?[...b.prizes,...Array(5).fill("")]:["",...Array(4).fill("")]);
                    setView("create");
                  }} style={{cursor:"pointer"}}>{b.label}</div>
                <div style={{flex:1,cursor:"pointer"}} onClick={()=>{
                    setEditBoard(b);
                    setCName(b.name);
                    setCPassword(b.password||"");
                    setCMaxPlayers(b.max||10);
                    setCSlots(b.prizes?.length||3);
                    setCPrizes(b.prizes?.length?[...b.prizes,...Array(5).fill("")]:["",...Array(4).fill("")]);
                    setView("create");
                  }}>
                  <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{b.name}</p>
                  <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0"}}>👥 {b.members}{b.max?"/"+b.max:""} members · 🔑 {b.code}</p>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>openMembers(b.id)}
                    style={{background:"rgba(0,32,91,0.08)",border:"none",borderRadius:9,
                      padding:"7px 10px",fontSize:11,fontWeight:700,color:NAVY,cursor:"pointer"}}>
                    👥
                  </button>
                  <button onClick={()=>{
                    setEditBoard(b);
                    setCName(b.name);
                    setCPassword(b.password||"");
                    setCMaxPlayers(b.max||10);
                    setCSlots(b.prizes?.length||3);
                    setCPrizes(b.prizes?.length?[...b.prizes,...Array(5).fill("")]:["",...Array(4).fill("")]);
                    setView("create");
                  }} style={{background:"rgba(0,32,91,0.08)",border:"none",borderRadius:9,
                    padding:"7px 10px",fontSize:11,fontWeight:700,color:NAVY,cursor:"pointer"}}>
                    ✏️
                  </button>
                  <button onClick={async ()=>{
                    if(!window.confirm(`Ștergi "${b.name}"?`)) return;
                    if(onDeleteBoard) await onDeleteBoard(b.id);
                  }} style={{background:"rgba(200,16,46,0.08)",border:"none",borderRadius:9,
                    padding:"7px 10px",fontSize:11,fontWeight:700,color:RED,cursor:"pointer"}}>
                    🗑️
                  </button>
                </div>
              </div>
              {/* Members list */}
              {viewMembersBoard===b.id&&(
                <div style={{marginTop:10,borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:10}}>
                  {!(boardMembersMap[b.id]?.length > 0)?(
                    <p style={{fontSize:12,color:"#bbb",textAlign:"center",margin:"8px 0"}}>No members yet</p>
                  ):(boardMembersMap[b.id]||[]).map((m,mi)=>{
                    const isMe = m.id === user?.id;
                    const list = boardMembersMap[b.id];
                    const leaders = boardLeadersMap[b.id] || leaderboardData[b.id] || [];
                    const lEntry = leaders.find(l => l.name === m.name);
                    const rankMedals = ["🥇","🥈","🥉"];
                    const rankLabel = lEntry ? (rankMedals[lEntry.rank-1] || `#${lEntry.rank}`) : null;
                    return (
                    <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",
                      borderBottom:mi<(list.length-1)?"1px solid rgba(0,0,0,0.04)":"none"}}>
                      <div style={{width:30,height:30,borderRadius:"50%",
                        background:isMe?`${NAVY}22`:"rgba(0,0,0,0.08)",
                        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:12}}>{m.name[0]}</span>
                      </div>
                      <span style={{flex:1,fontSize:12,fontWeight:600,color:isMe?NAVY:DARK}}>
                        {m.name}{isMe?" (Tu)":""}{m.role==="admin"?" · admin":""}
                      </span>
                      <span style={{fontSize:11,fontWeight:700,color:"#aaa",marginRight:6}}>
                        {rankLabel && <>{rankLabel} </>}<span style={{color:NAVY}}>{lEntry?.pts ?? 0}pt</span>
                      </span>
                      <button onClick={async ()=>{
                        if(onRemoveMember) await onRemoveMember(b.id, m.id);
                        setBoardMembersMap(prev=>({...prev,[b.id]:prev[b.id].filter(x=>x.id!==m.id)}));
                      }} style={{background:"rgba(200,16,46,0.08)",border:"none",borderRadius:8,
                          padding:"4px 10px",fontSize:11,fontWeight:700,color:RED,cursor:"pointer"}}>
                        {T[lang].remove}
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </>)}

        {/* Joined boards (exclude admin boards shown above) */}
        {myBoards.filter(b=>!createdBoards.some(c=>c.id===b.id)).length>0&&(<>
          <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>{T[lang].joinedBoards}</p>
          {myBoards.filter(b=>!createdBoards.some(c=>c.id===b.id)).map(b=>{
            // Get latest data from createdBoards or availBoards
            const latest = createdBoards.find(c=>c.id===b.id)||availBoards.find(c=>c.id===b.id)||b;
            return (
            <div key={b.id} onClick={()=>onJoin&&onJoin(b.id)}
              style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,0.10)",padding:"12px 14px",marginBottom:9,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:"50%",
                  background:b.isGlobal?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:`linear-gradient(135deg,#5856D6,#3634A3)`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{latest.label}</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{latest.name}</p>
                  <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0"}}>👥 {latest.members}{latest.max?"/"+latest.max:""} members</p>
                </div>
                <div style={{background:"#E8F0FF",borderRadius:9,padding:"7px 12px",fontSize:11,fontWeight:700,color:NAVY}}>
                  ✓ Joined
                </div>
                {!b.isGlobal&&(
                  <button onClick={e=>{e.stopPropagation();setLeaveConfirmBoard(b);}}
                    style={{background:"rgba(200,16,46,0.08)",border:"none",borderRadius:9,padding:"7px 10px",fontSize:13,color:RED,cursor:"pointer",flexShrink:0}}>
                    🗑️
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </>)}

        {/* Leave board confirmation popup */}
        {leaveConfirmBoard && (
          <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end"}} onClick={()=>setLeaveConfirmBoard(null)}>
            <div style={{width:"100%",background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 24px 40px"}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:40,textAlign:"center",marginBottom:12}}>⚠️</div>
              <h3 style={{fontSize:17,fontWeight:800,color:DARK,textAlign:"center",margin:"0 0 10px"}}>Ești sigur?</h3>
              <p style={{fontSize:13,color:"#888",textAlign:"center",lineHeight:1.6,margin:"0 0 24px"}}>
                Toate punctele și înregistrările tale vor fi șterse din boardul <strong style={{color:DARK}}>{leaveConfirmBoard.name}</strong>.
              </p>
              <button onClick={async()=>{
                if(onRemoveMember) await onRemoveMember(leaveConfirmBoard.id, user?.id);
                setMyBoards(prev=>prev.filter(x=>x.id!==leaveConfirmBoard.id));
                setLeaveConfirmBoard(null);
              }} style={{width:"100%",background:RED,color:"#fff",border:"none",borderRadius:14,padding:"14px 0",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10}}>
                Da, ieși din board
              </button>
              <button onClick={()=>setLeaveConfirmBoard(null)}
                style={{width:"100%",background:"transparent",color:"#aaa",border:"1px solid #ddd",borderRadius:14,padding:"12px 0",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                Anulează
              </button>
            </div>
          </div>
        )}

        {/* Available boards */}
        {(()=>{
          const allAvail = [...availBoards, ...createdBoards].filter(b=>!isJoined(b.id));
          if(allAvail.length===0) return null;
          const isCodeSearch = /^[A-Z][0-9]{5}$/.test(boardSearch.trim().toUpperCase());
          const filtered = boardSearch.trim() && !isCodeSearch
            ? allAvail.filter(b=>b.name.toLowerCase().includes(boardSearch.toLowerCase()))
            : !boardSearch.trim() ? allAvail.slice(0,6) : [];
          const hasMore = !boardSearch.trim() && allAvail.length > 6;
          const isCode = /^[A-Z][0-9]{5}$/.test(boardSearch.trim().toUpperCase());
          return (<>
          <div style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,0.10)",marginBottom:9,overflow:"hidden"}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px 8px"}}>
              <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:0}}>{T[lang].availableBoards}</p>
              <span style={{fontSize:11,color:"#bbb"}}>{allAvail.length} boards</span>
            </div>
            {/* Search inside card */}
            <div style={{margin:"0 14px 10px",background:"rgba(0,0,0,0.04)",borderRadius:10,
                padding:"9px 12px",display:"flex",gap:8,alignItems:"center",
                border:isCode?`1.5px solid ${NAVY}`:"1.5px solid transparent"}}>
              <span style={{fontSize:14,opacity:0.4}}>{isCode?"🔑":"🔍"}</span>
              <input value={boardSearch}
                onChange={e=>{ setBoardSearch(e.target.value); setCodeError(""); }}
                placeholder="Search or enter invite code..."
                style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:16,color:DARK}}/>
              {boardSearch&&(isCode?(
                <button onClick={()=>{
                  const found=[...availBoards,...createdBoards].find(b=>b.code===boardSearch.trim().toUpperCase()||b.id===boardSearch.trim());
                  if(found){joinBoard(found);setBoardSearch("");setCodeError("");}
                  else setCodeError("Code not found. Check with the admin.");
                }} style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,color:"#fff",border:"none",
                  borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Join</button>
              ):(
                <span onClick={()=>setBoardSearch("")} style={{fontSize:13,color:"#bbb",cursor:"pointer"}}>✕</span>
              ))}
            </div>
            {isCode&&<p style={{fontSize:11,color:NAVY,margin:"-4px 14px 8px",fontWeight:600}}>🔑 Invite code detected — tap Join</p>}
            {codeError&&<p style={{fontSize:11,color:RED,margin:"-4px 14px 8px"}}>{codeError}</p>}
            {/* Divider */}
            <div style={{height:1,background:"rgba(0,0,0,0.06)",margin:"0 0 2px"}}/>


            {filtered.length===0?(
              <p style={{fontSize:13,color:"#bbb",textAlign:"center",padding:"16px 0"}}>No boards found for "{boardSearch}"</p>
            ):filtered.map((b,bi)=>{
            const medals = ["🥇","🥈","🥉","🏅","🎖️"];
            const hasPrizes = b.prizes&&b.prizes.length>0;
            return (
            <div key={b.id} style={{padding:"12px 14px",borderTop:bi>0?"1px solid rgba(0,0,0,0.05)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:hasPrizes?10:0}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{b.label}</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{b.name}</p>
                  <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0"}}>👥 {b.members}{b.max?"/"+b.max:""} members{b.password?" · 🔒":""}</p>
                </div>
                <button onClick={()=>joinBoard(b)}
                  style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,color:"#fff",border:"none",
                    borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                  Join
                </button>
              </div>
              {hasPrizes&&(
                <p style={{fontSize:11,color:"#888",margin:"4px 0 0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {b.prizes.map((p,i)=>`${medals[i]||"🎖️"} ${p}`).join(" · ")}
                </p>
              )}
            </div>
            );
          })}
          {hasMore&&(
            <p style={{fontSize:12,color:"#bbb",textAlign:"center",padding:"8px 0",fontStyle:"italic"}}>
              +{allAvail.length-6} more · use search to find them
            </p>
          )}
          </div>
          </>);
        })()}
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({ active, onNavigate, lang }) {
  const tabs = [
    {key:SCREENS.HOME,   icon:"🏟️", label:"Home"},
    {key:SCREENS.RULES,  icon:"📖", label:"Rules"},
    {key:SCREENS.ACCOUNT,icon:"👤", label:"Account"},
  ];
  return (
    <div style={{flexShrink:0,background:"#fff",borderTop:"1px solid rgba(0,0,0,0.06)",display:"flex",alignItems:"stretch",height:"calc(64px + env(safe-area-inset-bottom, 0px))",paddingBottom:"env(safe-area-inset-bottom, 4px)"}}>
      {tabs.map(tab=>{
        const isActive=active===tab.key;
        return (
          <button key={tab.key} onClick={()=>onNavigate(tab.key)}
            style={{flex:1,background:"transparent",border:"none",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:0}}>
            <div style={{
              width:36,height:36,borderRadius:12,
              background:isActive?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:BG,
              boxShadow:isActive?"0 4px 12px rgba(0,32,91,0.3)":SHADOW_OUT,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:18,transition:"all 0.2s"}}>
              {tab.icon}
            </div>
            <span style={{fontSize:11,fontWeight:isActive?700:500,color:isActive?NAVY:"#bbb",transition:"all 0.2s"}}>
              {tab.label}
            </span>
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

const ADMIN_EMAIL = "admin@wcp2026.com";

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

function SplashScreen({ onNext, lang, setLang, simDay, simHour=12, simMin=0, tournamentStarted }) {
  const {d,h,m,s}=useCountdown();
  // Calculate days left based on simDay or real date
  const target = new Date("2026-06-11T19:00:00");
  const simNow = simDay ? new Date(2026, 5, simDay, simHour, simMin, 0) : new Date();
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
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 22px 0",position:"relative",zIndex:10}}>
        <div style={{width:44}}/>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:12,color:"#C8102E",margin:"0 0 2px",letterSpacing:3,textTransform:"uppercase",fontWeight:800}}>Predicto</p>
          <h1 style={{fontSize:20,fontWeight:900,color:"#00205B",margin:0}}>WORLD CUP 2026</h1>
          <p style={{fontSize:11,color:"#888",margin:"3px 0 0"}}>{T[lang].location}</p>
        </div>
        <LangSelector lang={lang} setLang={setLang}/>
      </div>
      {/* Background trophy image */}
      <img
        src={trophy}
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
      <div style={{flex:1}}/>
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
              <span style={{fontSize:8,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1.5,marginTop:6}}>{T[lang][l]||l}</span>
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
  const [skipNext, setSkipNext] = useState(false);
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
    <div style={{position:"absolute",inset:0,zIndex:300,display:"flex",flexDirection:"column",
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

          {/* Dots */}
          <div style={{display:"flex",justifyContent:"center",gap:8,padding:"10px 0 12px"}}>
            {slides.map((_,i)=>(
              <div key={i} onClick={()=>setSlide(i)}
                style={{width:i===slide?22:7,height:7,borderRadius:4,cursor:"pointer",
                  background:i===slide?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.3)",
                  transition:"all 0.3s"}}/>
            ))}
          </div>

          {/* Bottom */}
          <div style={{padding:"0 24px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:10}}
              onClick={()=>setSkipNext(s=>!s)}>
              <div style={{width:20,height:20,borderRadius:6,
                border:`2px solid ${skipNext?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.3)"}`,
                background:skipNext?"rgba(255,255,255,0.9)":"transparent",
                display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",cursor:"pointer"}}>
                {skipNext&&<span style={{fontSize:11,color:NAVY,fontWeight:900}}>✓</span>}
              </div>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.55)",cursor:"pointer"}}>Don't show again</span>
            </div>

            <div style={{display:"flex",gap:10}}>
              {!isLast&&(
                <button onClick={()=>onDone(skipNext)}
                  style={{flex:1,padding:"13px 0",borderRadius:14,border:"none",
                    background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",
                    fontSize:14,fontWeight:700,cursor:"pointer"}}>
                  Skip
                </button>
              )}
              <button onClick={()=>{ if(isLast) onDone(skipNext); else setSlide(s=>s+1); }}
                style={{flex:2,padding:"13px 0",borderRadius:14,border:"none",cursor:"pointer",
                  background:"rgba(255,255,255,0.95)",
                  color:NAVY,fontSize:15,fontWeight:800,
                  boxShadow:"0 6px 20px rgba(0,0,0,0.2)"}}>
                {isLast?"Let's go! 🏆":cur.nextLabel||"Next →"}
              </button>
            </div>
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
    <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10}}>
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

function LoginScreen({ onNext }) {
  const lang = useLang();
  const [step, setStep] = useState("credentials"); // "credentials" | "newuser" | "sent"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaNeeded, setCaptchaNeeded] = useState(false);
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [sentFrom, setSentFrom] = useState("");

  const getAttempts = () => parseInt(localStorage.getItem("_pred_ml") || "0");
  const incAttempts = () => localStorage.setItem("_pred_ml", String(getAttempts() + 1));

  const goToNewuser = () => {
    setPassword("");
    setCaptchaNeeded(getAttempts() >= 2);
    setCaptchaSolved(false);
    setStep("newuser");
  };

  const goToSignup = () => {
    setEmail("");
    setPassword("");
    setNickname("");
    setCaptchaNeeded(true);
    setCaptchaSolved(false);
    setError("");
    setStep("signup");
  };

  const goToForgot = () => {
    setCaptchaNeeded(true);
    setCaptchaSolved(false);
    setError("");
    setStep("forgot");
  };

  const handleContinue = async () => {
    if (!email.trim()) { setError("Introdu adresa de email."); return; }
    if (!password.trim()) { setError("Introdu parola."); return; }
    setLoading(true); setError("");
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (!signInErr) { setLoading(false); return; } // success — onAuthStateChange handles navigation

      // Distinguish wrong password (user exists) vs no account
      const exists = await checkEmailExists(email.trim());
      if (exists === true) {
        setError("Parolă incorectă. Încearcă din nou sau resetează parola.");
      } else {
        // exists===false (confirmed no account) or exists===null (RPC not set up → show newuser anyway)
        goToNewuser();
      }
    } catch { setError("Eroare neașteptată. Încearcă din nou."); }
    finally { setLoading(false); }
  };

  const handleCreateAccount = async () => {
    if (!nickname.trim()) { setError("Alege un nickname."); return; }
    if (password.length < 6) { setError("Parola trebuie să aibă minim 6 caractere."); return; }
    setLoading(true); setError("");
    const { error: otpErr } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: nickname.trim() }, emailRedirectTo: window.location.origin }
    });
    setLoading(false);
    if (otpErr) { setError(otpErr.message); return; }
    incAttempts();
    setStep("sent");
  };

  const handleSignup = async () => {
    if (!email.trim()) { setError("Introdu adresa de email."); return; }
    if (!nickname.trim()) { setError("Alege un nickname."); return; }
    if (password.length < 6) { setError("Parola trebuie să aibă minim 6 caractere."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: nickname.trim() }, emailRedirectTo: window.location.origin }
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStep("sent");
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError("Introdu adresa de email."); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin
    });
    setLoading(false);
    if (error) { setError("Eroare la trimitere. Încearcă din nou."); return; }
    setSentFrom("forgot");
    setStep("sent");
  };

  const canCreate = nickname.trim() && password.length >= 6 && (!captchaNeeded || captchaSolved);
  const forgotCanSend = email.trim() && captchaSolved;
  const signupCanCreate = email.trim() && nickname.trim() && password.length >= 6 && (!captchaNeeded || captchaSolved);

  const bgImg = <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>;
  const header = (icon, title) => (
    <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"32px 28px 24px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{width:64,height:64,borderRadius:20,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:12}}>{icon}</div>
      <p style={{fontSize:12,color:RED,margin:"0 0 4px",letterSpacing:3,textTransform:"uppercase",fontWeight:800}}>WORLD CUP 2026</p>
      <h2 style={{fontSize:22,fontWeight:800,color:"#fff",margin:0,textAlign:"center"}}>{title}</h2>
    </div>
  );

  // ── Sign up ───────────────────────────────────────────────────────────────
  if (step === "signup") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,position:"relative",overflow:"hidden"}}>
      {bgImg}
      {header("✨", "Creează cont")}
      <div style={{flex:1,padding:"24px 24px 32px",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
        <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>✉️</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="adresa@email.com"
            type="email" autoCapitalize="none" autoFocus
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>
        <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>👤</span>
          <input value={nickname} onChange={e=>setNickname(e.target.value)}
            placeholder="Alege un nickname" type="text" autoCapitalize="words"
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>
        {captchaNeeded && email.trim() && nickname.trim() && (
          <ImageCaptcha key="signup-captcha" onSolved={() => setCaptchaSolved(true)} />
        )}
        {(!captchaNeeded || captchaSolved) && (
          <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:15}}>🔒</span>
            <input value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="parolă (min. 6 caractere)" type="password"
              style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
          </div>
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
          {loading ? "Se creează..." : "Creează cont →"}
        </button>
        <button onClick={()=>{setStep("credentials");setError("");}}
          style={{width:"100%",background:"transparent",color:"#aaa",border:"1px solid #ddd",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:600,cursor:"pointer"}}>
          ← Înapoi
        </button>
      </div>
    </div>
  );

  // ── Forgot password ───────────────────────────────────────────────────────
  if (step === "forgot") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,position:"relative",overflow:"hidden"}}>
      {bgImg}
      {header("🔑", "Recuperare cont")}
      <div style={{flex:1,padding:"24px 24px 32px",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
        <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>✉️</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="adresa@email.com"
            type="email" autoCapitalize="none" autoFocus
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>

        <ImageCaptcha key="forgot-captcha" onSolved={() => setCaptchaSolved(true)} />

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
          {loading ? "Se trimite..." : !captchaSolved ? "🔒 Rezolvă verificarea mai sus" : "Trimite magic link →"}
        </button>

        <button onClick={()=>{setStep("credentials");setError("");}}
          style={{width:"100%",background:"transparent",color:"#aaa",border:"1px solid #ddd",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:600,cursor:"pointer"}}>
          ← Înapoi
        </button>
      </div>
    </div>
  );

  // ── Sent ──────────────────────────────────────────────────────────────────
  if (step === "sent") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center",background:BG,position:"relative",overflow:"hidden"}}>
      {bgImg}
      <div style={{position:"relative",zIndex:1}}>
        <div style={{fontSize:56,marginBottom:16}}>📧</div>
        <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 10px"}}>Verifică emailul!</h2>
        <p style={{fontSize:14,color:"#aaa",lineHeight:1.6,margin:"0 0 24px"}}>
          Am trimis un link la<br/><strong style={{color:DARK}}>{email}</strong><br/>
          <span style={{fontSize:12}}>Click pe link pentru a continua.</span>
          {sentFrom==="forgot"&&<><br/><span style={{fontSize:11,color:"#bbb"}}>Link trimis dacă adresa există în sistem.</span></>}
        </p>
        <button onClick={()=>setStep("credentials")} style={{background:"transparent",border:"1px solid #ddd",borderRadius:10,padding:"10px 20px",fontSize:13,color:"#aaa",cursor:"pointer"}}>
          ← Înapoi
        </button>
      </div>
    </div>
  );

  // ── Cont nou ──────────────────────────────────────────────────────────────
  if (step === "newuser") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,position:"relative",overflow:"hidden"}}>
      {bgImg}
      {header("👋", "Cont nou")}
      <div style={{flex:1,padding:"24px 24px 32px",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
        {/* No account found card */}
        <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"12px 16px",marginBottom:16}}>
          <p style={{fontSize:12,color:"#aaa",margin:"0 0 2px"}}>No account found for</p>
          <p style={{fontSize:15,fontWeight:700,color:DARK,margin:0}}>{email}</p>
        </div>

        {/* Nickname */}
        <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>👤</span>
          <input value={nickname} onChange={e=>setNickname(e.target.value)}
            placeholder="Alege un nickname" type="text" autoCapitalize="words" autoFocus
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>

        {/* Captcha — apare după 2 magic link-uri trimise */}
        {captchaNeeded && (
          <ImageCaptcha key="newuser-captcha" onSolved={() => setCaptchaSolved(true)} />
        )}

        {/* Parolă — apare întotdeauna (pre-completată dacă a fost introdusă pe step 1) */}
        {(!captchaNeeded || captchaSolved) && (
          <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:15}}>🔒</span>
            <input value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="parolă (min. 6 caractere)" type="password"
              style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
          </div>
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
          {loading ? "Se trimite..." : captchaNeeded && !captchaSolved ? "🔒 Rezolvă verificarea mai sus" : "Creează cont · Sign up →"}
        </button>

        <button onClick={()=>{setStep("credentials");setError("");}}
          style={{width:"100%",background:"transparent",color:"#aaa",border:"1px solid #ddd",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:600,cursor:"pointer"}}>
          ← Înapoi
        </button>
      </div>
    </div>
  );

  // ── Credentials (step 1) ──────────────────────────────────────────────────
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,position:"relative",overflow:"hidden"}}>
      {bgImg}
      {header("🏆", T[lang].joinTheGame)}
      <div style={{flex:1,padding:"24px 24px 32px",display:"flex",flexDirection:"column",position:"relative",zIndex:1}}>
        <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>✉️</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="adresa@email.com"
            type="email" autoCapitalize="none"
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>
        <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15}}>🔒</span>
          <input value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleContinue()}
            placeholder="parolă" type="password"
            style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
        </div>
        {error && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{error}</p>}
        <button onClick={handleContinue} disabled={loading}
          style={{width:"100%",background:`linear-gradient(135deg,${NAVY},#001840)`,color:"#fff",border:"none",borderRadius:14,padding:"15px 0",fontSize:15,fontWeight:700,cursor:"pointer",opacity:loading?0.7:1,marginBottom:8}}>
          {loading ? "Se verifică..." : "Continuă →"}
        </button>
        <div style={{display:"flex",justifyContent:"space-between",padding:"4px 2px 0"}}>
          <p onClick={goToForgot}
            style={{fontSize:12,color:"#aaa",margin:0,cursor:"pointer",textDecoration:"underline"}}>
            Am uitat parola
          </p>
          <p onClick={goToSignup}
            style={{fontSize:12,color:NAVY,margin:0,cursor:"pointer",textDecoration:"underline",fontWeight:600}}>
            Cont nou
          </p>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (password.length < 6) { setError("Parola trebuie să aibă minim 6 caractere."); return; }
    if (password !== confirm) { setError("Parolele nu coincid."); return; }
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
          <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 8px"}}>Parolă schimbată!</h2>
          <p style={{fontSize:13,color:"#aaa"}}>Te redirecționăm...</p>
        </>
      ) : (
        <>
          <div style={{fontSize:48,marginBottom:16}}>🔑</div>
          <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 8px"}}>Parolă nouă</h2>
          <p style={{fontSize:13,color:"#aaa",margin:"0 0 24px"}}>Introdu noua ta parolă</p>
          <div style={{width:"100%",maxWidth:340}}>
            <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:15}}>🔒</span>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Parolă nouă" type="password"
                style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
            </div>
            <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:15}}>🔒</span>
              <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirmă parola"
                onKeyDown={e=>e.key==="Enter"&&handleReset()} type="password"
                style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
            </div>
            {error && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{error}</p>}
            <button onClick={handleReset} disabled={loading||!password||!confirm}
              style={{width:"100%",background:password&&confirm?`linear-gradient(135deg,${NAVY},#001840)`:"#e0e0e0",color:"#fff",border:"none",borderRadius:14,padding:"15px 0",fontSize:15,fontWeight:700,cursor:"pointer",opacity:loading?0.7:1}}>
              {loading ? "Se salvează..." : "Salvează parola →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSet = async () => {
    if (password.length < 6) { setError("Parola trebuie să aibă minim 6 caractere."); return; }
    if (password !== confirm) { setError("Parolele nu coincid."); return; }
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
          <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 8px"}}>Parolă setată!</h2>
          <p style={{fontSize:13,color:"#aaa"}}>Te redirecționăm...</p>
        </>
      ) : (
        <>
          <div style={{fontSize:48,marginBottom:16}}>🔐</div>
          <h2 style={{fontSize:20,fontWeight:800,color:DARK,margin:"0 0 8px"}}>Setează o parolă</h2>
          <p style={{fontSize:13,color:"#888",margin:"0 0 6px"}}>Contul tău a fost creat prin magic link.</p>
          <p style={{fontSize:13,color:"#aaa",margin:"0 0 24px"}}>Setează o parolă pentru a te putea loga data viitoare fără link.</p>
          <div style={{width:"100%",maxWidth:340}}>
            <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:15}}>🔒</span>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Parolă nouă" type="password"
                style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
            </div>
            <div style={{background:"#fff",borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:15}}>🔒</span>
              <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirmă parola"
                onKeyDown={e=>e.key==="Enter"&&handleSet()} type="password"
                style={{flex:1,border:"none",outline:"none",fontSize:15,color:DARK,background:"transparent"}}/>
            </div>
            {error && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{error}</p>}
            <button onClick={handleSet} disabled={loading||!password||!confirm}
              style={{width:"100%",background:password&&confirm?`linear-gradient(135deg,${NAVY},#001840)`:"#e0e0e0",color:"#fff",border:"none",borderRadius:14,padding:"15px 0",fontSize:15,fontWeight:700,cursor:"pointer",opacity:loading?0.7:1}}>
              {loading ? "Se salvează..." : "Salvează parola →"}
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
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await loadLeaderboard(activeBoardId, search.trim(), userId);
      setSearchResults(results);
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, activeBoardId]);

  const filtered = search.trim() ? (searchResults || []) : leaders;
  const me = leaders.find(u=>u.isMe);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,position:"relative",overflow:"hidden"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"10px 20px 14px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:myBoards.length>1?12:0}}>
          <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
          <div style={{textAlign:"center"}}>
            <p style={{fontSize:12,color:RED,margin:0,letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>Predicto</p>
            <span style={{fontSize:16,fontWeight:800,color:"#fff"}}>{T[lang].leaderboard}</span>
          </div>
          <div style={{width:36}}/>
        </div>
        {myBoards.length>0&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:10,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
            {myBoards.map(b=><CircleTab key={b.id} label={b.label} name={b.isGlobal?"Global":b.name.split(" ")[0]} isActive={activeBoardId===b.id} onClick={()=>setActiveBoardId&&setActiveBoardId(b.id)}/>)}
          </div>
        )}
      </div>
      {/* Search bar on white background */}
      <div style={{padding:"12px 20px 4px",background:BG}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",borderRadius:12,
          boxShadow:SHADOW_OUT,padding:"9px 14px"}}>
          <span style={{fontSize:14,opacity:0.4}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={T[lang].searchPlayer}
            style={{flex:1,background:"transparent",border:"none",outline:"none",
              fontSize:13,color:DARK,fontWeight:500}}/>
          {searching && <span style={{fontSize:12,color:"#bbb"}}>...</span>}
          {search&&!searching&&<span onClick={()=>{setSearch("");setSearchResults(null);}} style={{fontSize:14,color:"#bbb",cursor:"pointer"}}>✕</span>}
        </div>
      </div>

      {leaders.length === 0 ? (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center"}}>
          <span style={{fontSize:48,marginBottom:16}}>⏳</span>
          <p style={{fontSize:18,fontWeight:800,color:DARK,margin:"0 0 8px"}}>{T[lang].tournamentNotStarted}</p>
          <p style={{fontSize:13,color:"#aaa",lineHeight:1.5,margin:0}}>{T[lang].leaderboardMsg}</p>
        </div>
      ) : (
        <div style={{flex:1,overflowY:"auto",padding:"12px 20px"}}>
          {filtered.length===0?(
            <div style={{textAlign:"center",padding:"40px 0",color:"#aaa",fontSize:13}}>
              {T[lang].noPlayerFound} "{search}"
            </div>
          ):filtered.map((u,i)=>{
            // Rank badge — only show medal if that rank has a prize
            const hasPrize = !!u.prize;
            const rankBadge = hasPrize && u.rank===1 ? "🥇"
              : hasPrize && u.rank===2 ? "🥈"
              : hasPrize && u.rank===3 ? "🥉"
              : hasPrize && u.rank===4 ? "🏅"
              : hasPrize && u.rank===5 ? "🎖️"
              : null;
            const rankColor = hasPrize&&u.rank===1?"#FFD700":hasPrize&&u.rank===2?"#C0C0C0":hasPrize&&u.rank===3?"#CD7F32":hasPrize&&u.rank===4?"#5856D6":hasPrize&&u.rank===5?"#5856D6":"#bbb";
            return (
            <div key={u.rank} style={{display:"flex",alignItems:"center",
              background:u.isMe?"#E8F0FF":u.accent||BG,
              borderRadius:12,padding:"8px 12px",gap:10,marginBottom:6,
              boxShadow:u.isMe?`0 0 0 2px ${NAVY},${SHADOW_OUT}`:SHADOW_OUT}}>
              {/* Rank indicator */}
              <div style={{width:30,textAlign:"center",flexShrink:0}}>
                {rankBadge ? (
                  <span style={{fontSize:20}}>{rankBadge}</span>
                ) : (
                  <div style={{width:26,height:26,borderRadius:7,
                    background:u.isMe?`${NAVY}22`:"rgba(0,0,0,0.05)",
                    display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>
                    <span style={{fontSize:10,fontWeight:700,color:u.isMe?NAVY:rankColor}}>#{u.rank}</span>
                  </div>
                )}
              </div>
              <div style={{flex:1,minWidth:0}}>
                {u.empty
                  ? <span style={{fontSize:12,color:"#ccc",fontStyle:"italic"}}>{T[lang].openSlot}</span>
                  : <span style={{fontSize:13,fontWeight:700,color:u.isMe?NAVY:DARK}}>{u.name}</span>
                }
              </div>
              {/* Prize pill — prominent */}
              {!u.empty&&u.prize&&(
                <div style={{background:u.rank===1?"rgba(255,215,0,0.15)":u.rank===2?"rgba(192,192,192,0.15)":"rgba(205,127,50,0.12)",
                  borderRadius:20,padding:"3px 10px",border:`1px solid ${rankColor}33`,flexShrink:0}}>
                  <span style={{fontSize:11,fontWeight:800,color:rankColor}}>🎁 {u.prize}</span>
                </div>
              )}
              <span style={{fontSize:13,fontWeight:800,color:u.isMe?NAVY:"#888",flexShrink:0,marginLeft:4}}>
                {u.empty?"—":`${u.pts}p`}
              </span>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
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

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
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
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>{T[lang].selectScore}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          {presets.map(([h,a])=>{
            const sel = home===h&&away===a&&!custom;
            return (
              <button key={`${h}-${a}`} onClick={()=>select(h,a)}
                style={{padding:"10px 4px",borderRadius:10,border:"none",cursor:"pointer",
                  background:sel?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:BG,
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
          <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>{T[lang].customScore}</p>
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
            ← Back
          </button>
          <button onClick={()=>confirmed&&onSave(home,away)}
            style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",
              background:confirmed?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"#e8e8e8",
              color:confirmed?"#fff":"#bbb",fontSize:12,fontWeight:700,
              cursor:confirmed?"pointer":"default",
              boxShadow:confirmed?"0 4px 12px rgba(0,32,91,0.3)":"none"}}>
            {T[lang].saveScore}
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupsScheduleScreen({ onBack, scores: scoresProp, setScores: setScoresProp, simDay, simHour=12, simMin=0, initialWeek }) {
  const lang = useLang();
  const LIVE_SCORES = computeLiveScores(simDay, simHour, simMin);
  // Build GROUPS_DATA dynamically from CALENDAR_EVENTS
  const GROUPS_DATA = (() => {
    const gMap = {};
    CALENDAR_EVENTS.forEach(e => {
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

  const weeks = [8,15,22,29,36,43];
  const mm0 = {};
  CALENDAR_EVENTS.forEach(e => { mm0[e.day] = e.matches; });
  // Find first day with matches in first week
  const firstMatchDay = Array.from({length:7},(_,i)=>8+i).find(d=>!!mm0[d]) || null;
  // Auto-select today if it has matches, else first match day
  const todayDay = simDay || new Date().getDate();
  const todayHasMatches = !!mm0[todayDay];
  const defaultDay = todayHasMatches ? todayDay : firstMatchDay;
  // Auto-select the week that contains today
  const defaultWeek = initialWeek || [8,15,22,29].find(w=>todayDay>=w&&todayDay<=w+6) || 8;
  const [weekStart, setWeekStart] = useState(defaultWeek);
  useEffect(()=>{
    if(initialWeek) {
      setWeekStart(initialWeek);
      const mm_ = {};
      CALENDAR_EVENTS.forEach(e => { mm_[e.day] = e.matches; });
      const wDays = Array.from({length:7},(_,i)=>initialWeek+i).filter(d=>d>=1&&d<=50);
      // If today is within this week, open today; otherwise open first day with matches
      const todayInWeek = wDays.find(d => d === todayDay && !!mm_[d]);
      const firstDay = todayInWeek || wDays.find(d=>!!mm_[d]) || null;
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

  useEffect(()=>{
    if(scorePick){
      const saved = scores[scorePick.key];
      const h = saved?saved[0]:0;
      const a = saved?saved[1]:0;
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
    CALENDAR_EVENTS.forEach(e => {
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
    const wDays = Array.from({length:7},(_,i)=>w+i).filter(d=>d>=1&&d<=50);
    const ag = getGroupsForDays(wDays);
    if(ag.length>0) {
      const koGroup = ag.find(g=>["R16","QF","SF","3rd","Final"].includes(g));
      setSelGroup(koGroup || ag[0]);
    }
    // Auto-select first day with matches in new week
    const mm_ = {};
    CALENDAR_EVENTS.forEach(e => { mm_[e.day] = e.matches; });
    const firstDay = wDays.find(d=>!!mm_[d]) || null;
    setSelDay(firstDay);
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

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"10px 20px 12px",flexShrink:0,overflow:"hidden"}}>
        <img src={varBg} alt="" style={{
          position:"absolute",inset:0,width:"100%",height:"100%",
          objectFit:"cover",objectPosition:"center 30%",
          opacity:0.28,pointerEvents:"none",
        }}/>
        <div style={{position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,color:"#fff"}}>&#8249;</div>
            <div>
              <p style={{fontSize:11,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>Predicto</p>
              <h2 style={{fontSize:18,fontWeight:800,color:"#fff",margin:0}}>{T[lang].groupsSchedule}</h2>
            </div>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"14px 20px",position:"relative",zIndex:1}}>
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
            if(isMatchPast(day, match.time, simDay, simHour)) return;
            setScorePick({match,day,idx,key:`${day}-${idx}`});
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
              Matches · Group {selGroup}
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
                const nowDay2 = simDay || new Date().getDate();
                const nowH2   = simDay!=null ? (simHour||0) : new Date().getHours();
                const nowM2   = simDay!=null ? (simMin||0)  : new Date().getMinutes();
                const nowMins2 = nowH2*60 + nowM2;
                const kickMins2 = matchH*60 + matchMin2;
                const isFinished = live?.status==="FT" || (m.day < nowDay2) || (m.day===nowDay2 && nowMins2 > kickMins2+115);
                const isLive = !isFinished && (live?.status==="LIVE" || (m.day===nowDay2 && nowMins2>=kickMins2 && nowMins2<=kickMins2+115));
                const isNS = !isFinished && !isLive;
                const liveMin = isLive ? Math.min(90, nowMins2-kickMins2) : 0;
                const hasLive = live && live.home !== undefined && live.home !== null;

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
                      background:isLive?"rgba(0,32,91,0.06)":isFinished?"rgba(0,154,68,0.06)":"rgba(0,0,0,0.03)"}}>
                      <span style={{fontSize:11,color:"#aaa",fontWeight:600}}>{m.day} June · {m.time}</span>
                      {isLive&&<span style={{fontSize:11,fontWeight:800,color:RED,display:"flex",alignItems:"center",gap:3}}>
                        <span style={{width:6,height:6,borderRadius:"50%",background:RED,display:"inline-block"}}/>
                        LIVE {liveMin}'
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
                          const isPast = isMatchPast(m.day, m.time, simDay, simHour);
                          const canPredict = !isLive && !isFinished && !isPast && isWeekUnlocked(m.day, simDay, simHour, simMin);
                          const scoreDisplay = isLive ? (hasLive?`${live.home}-${live.away}`:"0-0") : hasLive ? `${live.home}-${live.away}` : "-";
                          const predBox = (isPast||isLive||isFinished) ? (sc ? (
                            isLive ? (
                              <div style={{background:"rgba(0,0,0,0.06)",borderRadius:6,padding:"3px 8px"}}>
                                <span style={{fontSize:11,fontWeight:900,color:RED,}}>{sc[0]}-{sc[1]}</span>
                              </div>
                            ) : (
                            <div style={{background:exactMatch?`linear-gradient(135deg,${GREEN},#007A36)`:resultMatch?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:`linear-gradient(135deg,${RED},#EF3340)`,
                              borderRadius:6,padding:"3px 8px",display:"flex",alignItems:"center",gap:3}}>
                              <span style={{fontSize:11,fontWeight:900,color:"#fff"}}>{sc[0]}-{sc[1]}</span>
                              {isFinished&&(exactMatch?<span style={{fontSize:11}}>🎯</span>:resultMatch?<span style={{fontSize:11}}>✓</span>:<span style={{fontSize:11}}>✗</span>)}
                            </div>)
                          ) : (
                            <div style={{background:"rgba(0,0,0,0.06)",borderRadius:6,padding:"3px 8px"}}>
                              <span style={{fontSize:11,fontWeight:700,color:"#ccc"}}>?-?</span>
                            </div>
                          )) : canPredict && !isMatchPast(m.day, m.time, simDay, simHour) ? (
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
                              {isLive&&<span style={{fontSize:7,fontWeight:900,color:RED}}>●</span>}
                              <div style={{background:isFinished?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"rgba(0,0,0,0.06)",
                                borderRadius:8,padding:"5px 12px",width:"100%",textAlign:"center"}}>
                                <span style={{fontSize:14,fontWeight:900,color:isLive?RED:hasLive?"#fff":"#bbb"}}>{scoreDisplay}</span>
                              </div>
                              {/* Prediction */}
                              <div style={{display:"flex",alignItems:"center",gap:4}}>
                                <span style={{fontSize:8,color:"#bbb",fontWeight:600}}>tu:</span>
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
                      {(isFinished || isMatchPast(m.day, m.time, simDay, simHour)) && (
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
                    {!isMatchPast(m.day, m.time, simDay, simHour) && !isLive && !isFinished && sc && isWeekUnlocked(m.day, simDay, simHour, simMin) && todaySim <= m.day && (
                      <div onClick={()=>setScorePick({match:m,day:m.day,idx:m.idx,key:m.key})}
                        style={{padding:"6px 12px",borderTop:"1px solid rgba(0,0,0,0.05)",
                          display:"flex",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer"}}>
                        <span style={{fontSize:12,color:"#bbb",fontWeight:600}}>✏️ Edit Prediction</span>
                      </div>
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
        <div style={{position:"absolute",inset:0,zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end",touchAction:"none",overscrollBehavior:"none"}}
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
                setScores(s=>({...s,[scorePick.key]:[h,a]}));
                setScorePick(null);
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
  const mm = {};
  CALENDAR_EVENTS.forEach(e => { mm[e.day] = e.matches; });
  const dl = ["L","M","M","J","V","S","D"];
  const days = Array.from({length:7},(_,i)=>weekStart+i).filter(d=>d>=1&&d<=50);
  const sel = selDay;
  const sm = sel ? mm[sel] : null;
  const weekLabel = `${toLabel(weekStart)} – ${toLabel(Math.min(weekStart+6,50))}`;

  return (
    <div style={{marginBottom:4}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>weekIdx>0&&setWeekStart(weeks[weekIdx-1])}
          style={{width:30,height:30,borderRadius:"50%",border:"none",background:weekIdx>0?BG:"transparent",
            boxShadow:weekIdx>0?SHADOW_OUT:"none",cursor:weekIdx>0?"pointer":"default",
            fontSize:16,color:weekIdx>0?DARK:"#ddd",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:13,fontWeight:700,color:DARK,margin:0}}>{weekLabel}</p>
          <span style={{fontSize:12,color:NAVY,fontWeight:700}}>{weekLabel.includes("July")?"July 2026":"June 2026"} · Predicto</span>
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
          const today = simDay || new Date().getDate();
          const isPast = has && day < today;
          const isToday2 = day === today;
          const locked = has && !isWeekUnlocked(day, simDay, simHour, simMin);
          const dayMatches = mm[day]||[];
          const allPredicted = has && !locked && !isPast && dayMatches.length>0 && dayMatches.every((_,idx)=>scores&&scores[`${day}-${idx}`]);
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
            <div key={day} onClick={()=>has&&onDaySelect&&onDaySelect(day)}
              style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",borderRadius:10,padding:"8px 2px",
                cursor:has?"pointer":"default",background:bg,border,boxShadow:shadow,transition:"all 0.15s",
                opacity:locked?0.6:1}}>
              <span style={{fontSize:13,fontWeight:fw,color:tc,lineHeight:1}}>{day>30?day-30:day}</span>
              {has&&(
                locked
                  ? <span style={{fontSize:8,lineHeight:1,marginTop:2}}>🔒</span>
                  : allPredicted
                    ? <span style={{fontSize:7,color:GREEN,fontWeight:900,marginTop:2,lineHeight:1}}>✓</span>
                    : <div style={{width:4,height:4,borderRadius:"50%",background:isPast?"#ccc":isS?NAVY:RED,marginTop:3}}/>
              )}
              {isS&&!isSel&&!allPredicted&&<div style={{position:"absolute",top:-6,right:-2,background:RED,borderRadius:4,padding:"1px 4px",fontSize:7,fontWeight:800,color:"#fff"}}>START</div>}
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
            const hasGroupMatches = groups.some(g=>LETTER_GROUPS.includes(g));
            const activeGrp = selGroup || (hasGroupMatches ? groups.find(g=>LETTER_GROUPS.includes(g)) : groups.find(g=>KO_STAGES.includes(g))) || groups[0] || "A";
            const activeStage = LETTER_GROUPS.includes(activeGrp) ? "Groups" : (KO_STAGES.includes(activeGrp) ? activeGrp : (hasGroupMatches ? "Groups" : "R16"));
            const handleStageClick = (stage) => {
              if(stage==="Groups") setSelGroup(groups.find(g=>LETTER_GROUPS.includes(g))||"A");
              else setSelGroup(stage);
            };
            return (
              <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden"}}>
                {/* Header */}
                <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"8px 14px 0"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>{sel>30?sel-30:sel} {sel>30?"July":"June"} · {sm.length} matches</span>
                    <div style={{display:"flex",background:"rgba(255,255,255,0.12)",borderRadius:20,padding:"2px",gap:0}}>
                      <button onClick={()=>setShowStanding(false)}
                        style={{padding:"4px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                          background:!showStanding?"rgba(255,255,255,0.95)":"transparent",
                          color:!showStanding?NAVY:"rgba(255,255,255,0.6)",transition:"all 0.2s"}}>
                        <span style={{colorScheme:"light",filter:"saturate(0) contrast(3) brightness(1.1)"}}>⚽</span> Matches
                      </button>
                      <button onClick={()=>setShowStanding(true)}
                        style={{padding:"4px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                          background:showStanding?"rgba(255,255,255,0.95)":"transparent",
                          color:showStanding?NAVY:"rgba(255,255,255,0.6)",transition:"all 0.2s"}}>
                        📊 Standing
                      </button>
                    </div>
                  </div>
                  <div style={{height:1,background:"rgba(255,255,255,0.2)",marginTop:4}}/>
                  {showStanding && <>
                    {/* Nivel 1: etape campionat */}
                    <div style={{display:"flex",gap:5,padding:"10px 0 6px",alignItems:"center"}}>
                      {/* Groups tab */}
                      {(()=>{
                        const isActive = activeStage==="Groups";
                        return (
                          <div onClick={()=>handleStageClick("Groups")} style={{
                            flexShrink:0, height:34, borderRadius:9, padding:"0 14px",
                            background:isActive?"#fff":hasGroupMatches?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.1)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:13, fontWeight:900,
                            color:isActive?NAVY:"rgba(255,255,255,0.75)",
                            cursor:"pointer", position:"relative",
                            boxShadow:isActive?"0 2px 10px rgba(0,0,0,0.3)":"none",
                            transition:"all 0.22s",
                          }}>
                            Grupe
                          </div>
                        );
                      })()}
                      {/* KO stage tabs */}
                      {[{id:"R16",label:"R16"},{id:"QF",label:"QF"},{id:"SF",label:"SF"},{id:"3rd",label:"3rd"},{id:"Final",label:"🏆"}].map(s=>{
                        const isActive = activeStage===s.id;
                        const hasMatchToday = groups.includes(s.id);
                        return (
                          <div key={s.id} onClick={()=>handleStageClick(s.id)} style={{
                            flexShrink:0, width:44, height:34, borderRadius:9,
                            background:isActive?"#fff":hasMatchToday?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.1)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:isActive?13:11, fontWeight:900,
                            color:isActive?NAVY:"rgba(255,255,255,0.75)",
                            cursor:"pointer",
                            boxShadow:isActive?"0 2px 10px rgba(0,0,0,0.3)":"none",
                            transition:"all 0.22s",
                          }}>
                            {s.label}
                          </div>
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
                            <div key={g} onClick={()=>setSelGroup(g)} style={{
                              flexShrink:0, width:38, height:34, borderRadius:9,
                              background:isActive?"#fff":hasMatchToday?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.1)",
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:isActive?15:12, fontWeight:900,
                              color:isActive?NAVY:"rgba(255,255,255,0.75)",
                              cursor:"pointer", position:"relative",
                              boxShadow:isActive?"0 2px 10px rgba(0,0,0,0.3)":"none",
                              transition:"all 0.22s",
                            }}>
                              {g}
                              {hasMatchToday&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:5,height:5,borderRadius:"50%",background:isActive?NAVY:"rgba(255,255,255,0.5)"}}/>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div style={{height:1,background:"rgba(255,255,255,0.15)"}}/>
                  </>}
                </div>

                {showStanding ? (
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
                                    <span style={{fontSize:7,fontWeight:800,color:grayed?"#bbb":col}}>?</span>
                                  </div>
                                  <span style={{fontSize:12,fontWeight:600,color:grayed?"#bbb":DARK}}>{h}</span>
                                </div>
                              </div>
                              <div style={{padding:"6px 10px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{width:18,height:18,borderRadius:4,background:grayed?"#eee":`${col}22`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                    <span style={{fontSize:7,fontWeight:800,color:grayed?"#bbb":col}}>?</span>
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
                                  <span style={{fontSize:8,color:"#bbb",fontWeight:700}}>??</span>
                                </div>
                                <span style={{fontSize:8,color:"#bbb"}}>vs</span>
                                <div style={{width:20,height:20,borderRadius:5,background:"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  <span style={{fontSize:8,color:"#bbb",fontWeight:700}}>??</span>
                                </div>
                              </div>
                            </div>
                          );

                          // KO matches from calendar
                          const koMatches = [];
                          CALENDAR_EVENTS.forEach(e=>{
                            e.matches.forEach((m,idx)=>{
                              if(m.group===activeGrp) koMatches.push({...m,day:e.day,_i:idx,key:`${e.day}-${idx}`});
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
                                      <span style={{fontSize:8,fontWeight:700,color:color}}>{grp.label}</span>
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
                                  const _nd=simDay||new Date().getDate();
                                  const _nh=simDay!=null?(simHour||0):new Date().getHours();
                                  const _kick=_mH*60, _now=_nh*60;
                                  const isFT2 = m.day<_nd || (m.day===_nd && _now>_kick+115);
                                  const isLive2 = !isFT2 && m.day===_nd && _now>=_kick && _now<=_kick+115;
                                  const liveScore2 = live2&&live2.home!=null ? live2 : (isLive2?{home:0,away:0}:null);
                                  const isPastM = m.day<_nd || (m.day===_nd && _mH<=_nh);
                                  const canEdit=!isLive2&&!isFT2&&!isPastM&&isWeekUnlocked(m.day,simDay,simHour,simMin);
                                  return (
                                    <div key={idx2} style={{background:"#fff",borderBottom:idx2<koMatches.length-1?"1px solid rgba(0,0,0,0.05)":"none",
                                      padding:"10px 14px",display:"flex",alignItems:"center",gap:8,cursor:canEdit?"pointer":"default"}}
                                      onClick={()=>canEdit&&onMatchClick&&onMatchClick(m,m.day,m._i)}>
                                      <div style={{flexShrink:0,textAlign:"center",width:32}}>
                                        <p style={{fontSize:12,color:"#aaa",margin:0,fontWeight:600}}>{m.day>30?m.day-30:m.day} {m.day>30?"Jul":"Jun"}</p>
                                        <p style={{fontSize:11,color:"#bbb",margin:0}}>{m.time}</p>
                                      </div>
                                      <span style={{fontSize:18}}>{m.homeFlag}</span>
                                      <span style={{flex:1,fontSize:12,fontWeight:600,color:isPastM?"#bbb":DARK}}>{m.home.length>7?m.home.split(" ")[0]:m.home}</span>
                                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:54}}>
                                        <div style={{background:liveScore2?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"rgba(0,0,0,0.07)",borderRadius:6,padding:"3px 8px",textAlign:"center"}}>
                                          <span style={{fontSize:12,fontWeight:900,color:liveScore2?"#fff":"#bbb"}}>{liveScore2?`${liveScore2.home}-${liveScore2.away}`:"-"}</span>
                                        </div>
                                        {sc2?(
                                          <span style={{fontSize:11,fontWeight:700,color:NAVY}}>tu: {sc2[0]}-{sc2[1]}</span>
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
                        CALENDAR_EVENTS.forEach(e=>{
                          e.matches.forEach((m,idx)=>{
                            if(m.group!==activeGrp) return;
                            const sc = getScore(e.day, idx);
                            if(!sc) return;
                            const [h,a]=sc;
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
                        const live = LIVE_SCORES[`${day}-${idx}`];
                        if(!live || live.status!=="FT" || live.home===null || live.home===undefined) return null;
                        return [live.home, live.away];
                      });

                      // Predicted standing — from user scores
                      const predRows = computeStanding((day,idx)=>{
                        return scores&&scores[`${day}-${idx}`]||null;
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
                            CALENDAR_EVENTS.forEach(e=>{
                              e.matches.forEach((m,idx)=>{
                                if(m.group===activeGrp) allGM.push({...m,day:e.day,_i:idx,key:`${e.day}-${idx}`});
                              });
                            });
                            return allGM.map((m,idx2)=>{
                              const sc2=scores&&scores[m.key];
                              const live2=LIVE_SCORES[m.key];
                              // Compute status from sim time directly
                              const _mH=parseInt((m.time||"23:00").split(":")[0]);
                              const _mM=parseInt((m.time||"00:00").split(":")[1]||0);
                              const _nd=simDay||new Date().getDate();
                              const _nh=simDay!=null?(simHour||0):new Date().getHours();
                              const _nm=simDay!=null?(simMin||0):new Date().getMinutes();
                              const _kick=_mH*60+_mM, _now=_nh*60+_nm;
                              const isFT2 = m.day<_nd || (m.day===_nd && _now>_kick+115);
                              const isLive2 = !isFT2 && m.day===_nd && _now>=_kick && _now<=_kick+115;
                              const liveScore2 = live2&&live2.home!==null&&live2.home!==undefined ? live2 : (isLive2?{home:0,away:0}:null);
                              const hasScore2 = !!liveScore2;
                              const matchHourM=parseInt((m.time||"23:00").split(":")[0]);
                              const nowDM = simDay || new Date().getDate();
                              const nowHM = simDay ? (simHour||0) : new Date().getHours();
                              const isPastM = m.day < nowDM || (m.day === nowDM && matchHourM <= nowHM);
                              const canEdit=!isLive2&&!isFT2&&!isPastM&&isWeekUnlocked(m.day,simDay,simHour,simMin);
                              return (
                                <div key={idx2} style={{background:"#fff",borderBottom:idx2<allGM.length-1?"1px solid rgba(0,0,0,0.05)":"none",
                                  padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}
                                  onClick={()=>canEdit&&onMatchClick&&onMatchClick(m,m.day,m._i)}>
                                  <span style={{fontSize:18}}>{m.homeFlag}</span>
                                  <span style={{flex:1,fontSize:12,fontWeight:600,color:isPastM?"#bbb":DARK}}>{m.home.length>7?m.home.split(" ")[0]:m.home}</span>
                                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                                    <span style={{fontSize:11,fontWeight:600,color:"#bbb"}}>{m.day} Iun · {m.time}</span>
                                    {isPastM?<span style={{fontSize:7,color:"#ccc",fontWeight:700}}>{T[lang].finished}</span>
                                      :isLive2?<span style={{fontSize:7,fontWeight:800,color:RED,animation:"blink 1s infinite"}}>● LIVE</span>
                                      :<span style={{fontSize:7,color:"#bbb",fontWeight:700}}>{isFT2?"Final":"● Live"}</span>}
                                    <div style={{background:hasScore2?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"rgba(0,0,0,0.07)",borderRadius:6,padding:"3px 10px",minWidth:46,textAlign:"center"}}>
                                      <span style={{fontSize:12,fontWeight:900,color:hasScore2?"#fff":"#bbb"}}>{hasScore2?`${liveScore2.home}-${liveScore2.away}`:"-"}</span>
                                    </div>
                                    <span style={{fontSize:7,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{T[lang].prediction}</span>
                                    {!isWeekUnlocked(m.day,simDay,simHour,simMin)?<span style={{fontSize:12,color:"#ccc"}}>🔒</span>
                                      :sc2?<div style={{background:canEdit?`rgba(0,32,91,0.1)`:"rgba(0,0,0,0.06)",border:canEdit?`1.5px solid ${NAVY}`:"none",borderRadius:6,padding:"2px 8px",minWidth:46,textAlign:"center",opacity:isPastM?0.5:1}}>
                                          <span style={{fontSize:11,fontWeight:900,color:canEdit?NAVY:"#888"}}>{sc2[0]}-{sc2[1]}</span>
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
                    const key=`${sel}-${i}`;
                    const sc = scores&&scores[key];
                    const live = LIVE_SCORES[key];
                    const mH2 = parseInt((m.time||"23:00").split(":")[0]);
                    const mM2 = parseInt((m.time||"00:00").split(":")[1]||0);
                    const _nowDay = simDay || new Date().getDate();
                    const _nowH   = simDay!=null?(simHour||0):new Date().getHours();
                    const _nowM   = simDay!=null?(simMin||0):new Date().getMinutes();
                    const _kick = mH2*60+mM2, _now2 = _nowH*60+_nowM;
                    const isFT = (sel||0)<_nowDay || (sel===_nowDay && _now2>_kick+115);
                    const isLive = !isFT && sel===_nowDay && _now2>=_kick && _now2<=_kick+115;
                    const isNS2 = !isFT && !isLive;
                    const liveMin2 = isLive?Math.min(90,_now2-_kick):0;
                    const hasScore = live && live.home !== undefined && live.home !== null;
                    const exactMatch = sc&&hasScore&&isFT&&sc[0]===live.home&&sc[1]===live.away;
                    const predRes = sc?sc[0]>sc[1]?"H":sc[0]<sc[1]?"A":"D":null;
                    const realRes = hasScore?live.home>live.away?"H":live.home<live.away?"A":"D":null;
                    const resultMatch = predRes&&realRes&&predRes===realRes&&isFT;
                    const isPastDay2 = !!(simDay && sel < simDay);
                    return (
                      <div key={i} style={{borderBottom:i<sm.length-1?"1px solid rgba(0,0,0,0.06)":"none",background:"#fff"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                          padding:"4px 14px",background:isLive?"rgba(0,32,91,0.06)":isFT?"rgba(0,154,68,0.05)":"rgba(0,0,0,0.02)"}}>
                          <span style={{fontSize:11,fontWeight:600,color:"#aaa"}}>{m.time} · Gr.{m.group}</span>
                          {isLive&&<span style={{fontSize:11,fontWeight:800,color:RED,display:"flex",alignItems:"center",gap:3}}>
                            <span style={{width:5,height:5,borderRadius:"50%",background:RED,display:"inline-block"}}/>
                            LIVE {liveMin2}'
                          </span>}
                          {isFT&&<span style={{fontSize:11,fontWeight:700,color:GREEN}}>FT</span>}
                          {isNS2&&<span style={{fontSize:11,color:"#ccc"}}>{T[lang].notStarted}</span>}
                        </div>
                        {(()=>{ return (
                        <div onClick={()=>!isMatchPast(m.day||sel,m.time,simDay,simHour)&&!isPastDay2&&onMatchClick&&onMatchClick(m,sel,m._i)}
                          style={{display:"flex",alignItems:"center",padding:"10px 14px",cursor:isPastDay2?"default":"pointer",gap:6,opacity:isPastDay2?0.6:1}}>
                          <span style={{fontSize:18,flexShrink:0}}>{m.homeFlag}</span>
                          <span style={{flex:1,fontSize:11,fontWeight:600,color:DARK}}>{m.home.length>7?m.home.split(" ")[0]:m.home}</span>
                          <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                            {isLive?<span style={{fontSize:7,fontWeight:800,color:RED,animation:"blink 1s infinite"}}>● LIVE</span>
                              :<span style={{fontSize:7,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{isFT?"Final":"● Live"}</span>}
                            <div style={{background:isLive?"rgba(0,0,0,0.06)":hasScore?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:"rgba(0,0,0,0.08)",borderRadius:6,padding:"4px 10px",minWidth:54,textAlign:"center"}}>
                              <span style={{fontSize:13,fontWeight:900,color:isLive?RED:hasScore?"#fff":"#bbb"}}>{isLive?(hasScore?`${live.home}-${live.away}`:"0-0"):hasScore?`${live.home}-${live.away}`:"-"}</span>
                            </div>
                            <span style={{fontSize:7,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{T[lang].prediction}</span>
                            {(()=>{
                              const isPast = isMatchPast(sel, m.time, simDay, simHour);
                              const canPredict = !isLive && !isFT && !isPast && isWeekUnlocked(sel||0, simDay, simHour, simMin);
                              // If predicted — always show score
                              if(sc) {
                                return (
                                  <div onClick={canPredict?e=>{e.stopPropagation();onMatchClick&&onMatchClick(m,sel,m._i);}:undefined}
                                    style={{background:isLive?"rgba(0,0,0,0.06)":exactMatch?`linear-gradient(135deg,${GREEN},#007A36)`:resultMatch?`linear-gradient(135deg,${NAVY}cc,#001840cc)`:(isPast||isFT)?`linear-gradient(135deg,${RED},#EF3340)`:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,
                                      borderRadius:6,padding:"3px 10px",minWidth:54,textAlign:"center",
                                      display:"flex",alignItems:"center",justifyContent:"center",gap:3,
                                      cursor:canPredict?"pointer":"default"}}>
                                    <span style={{fontSize:12,fontWeight:900,color:isLive?RED:"#fff",...(isLive?{}:{})}}>{sc[0]}-{sc[1]}</span>
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
                        {(isFT||isMatchPast(sel,m.time,simDay,simHour))&&(
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
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"16px 20px 18px",flexShrink:0}}>
        <p style={{fontSize:11,color:RED,margin:"0 0 2px",letterSpacing:2,textTransform:"uppercase",fontWeight:800}}>Predicto</p>
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

function AccountScreen({ setLang, onBoards, onSignOut, onShowGuide, user }) {
  const lang = useLang();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "—";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("ro-RO", { month: "long", year: "numeric" })
    : "";
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const handleDeleteAccount = async () => {
    if (deleteEmail.trim().toLowerCase() !== user?.email?.toLowerCase()) {
      setDeleteError("Emailul introdus nu coincide cu contul tău.");
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
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"12px 20px 14px",flexShrink:0,position:"relative",zIndex:1,minHeight:100,boxSizing:"border-box"}}>
        <p style={{fontSize:18,color:RED,margin:"0 0 4px",fontStyle:"italic",fontWeight:900,letterSpacing:-0.5,textAlign:"left"}}>Predicto</p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{fontSize:18,fontWeight:800,color:"#fff",margin:0,textAlign:"left"}}>{displayName}</h2>
          <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👤</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",position:"relative",zIndex:1}}>
        <div style={{padding:"10px 20px 4px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
          <p style={{fontSize:13,color:"#888",margin:0,textAlign:"left"}}>{user?.email}</p>
          {memberSince && <p style={{fontSize:11,color:"#aaa",margin:"2px 0 0",textAlign:"left"}}>Membru din {memberSince}</p>}
        </div>
        <div style={{padding:"12px 20px"}}>
          {[{icon:"🏆",label:T[lang].myBoards,sub:T[lang].activeBoards,action:onBoards},{icon:"📖",label:T[lang].appGuide,sub:T[lang].howItWorks,action:onShowGuide},{icon:"🔔",label:T[lang].notifications,sub:T[lang].matchAlertsOn},{icon:"🌍",label:T[lang].language,sub:LANGS.find(l=>l.code===lang)?.name||"English",isLang:true},{icon:"⭐",label:T[lang].upgradePremium,sub:T[lang].removeAds,highlight:true},{icon:"🚪",label:T[lang].signOut,sub:"",action:handleSignOut}].map(item=>(
            <div key={item.label} onClick={item.isLang?undefined:item.action||undefined} style={{display:"flex",alignItems:"center",gap:14,background:item.highlight?"#E8F0FF":BG,borderRadius:14,boxShadow:item.highlight?`0 0 0 2px ${NAVY},${SHADOW_OUT}`:SHADOW_OUT,padding:"13px 16px",marginBottom:10,cursor:item.isLang?"default":"pointer"}}>
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
            Șterge contul
          </p>

          {deleteMode && (
            <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end"}}>
              <div style={{width:"100%",background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 24px 40px"}}>
                <div style={{fontSize:40,textAlign:"center",marginBottom:12}}>⚠️</div>
                <h3 style={{fontSize:18,fontWeight:800,color:DARK,textAlign:"center",margin:"0 0 8px"}}>Șterge contul</h3>
                <p style={{fontSize:13,color:"#888",textAlign:"center",margin:"0 0 20px",lineHeight:1.5}}>
                  Aceasta va șterge <strong>tot</strong> — predicții, boarduri, scoruri.<br/>Acțiunea este <strong>ireversibilă</strong>.
                </p>
                <p style={{fontSize:12,fontWeight:700,color:DARK,margin:"0 0 6px"}}>Introdu emailul tău pentru confirmare:</p>
                <div style={{background:BG,borderRadius:12,padding:"12px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8,border:"1px solid #eee"}}>
                  <input value={deleteEmail} onChange={e=>{setDeleteEmail(e.target.value);setDeleteError("");}}
                    placeholder={user?.email} type="email" autoCapitalize="none"
                    style={{flex:1,border:"none",outline:"none",fontSize:14,color:DARK,background:"transparent"}}/>
                </div>
                {deleteError && <p style={{fontSize:12,color:RED,margin:"0 0 8px",textAlign:"center"}}>{deleteError}</p>}
                <button onClick={handleDeleteAccount} disabled={deleteLoading||!deleteEmail.trim()}
                  style={{width:"100%",background:deleteEmail.trim()?RED:"#e0e0e0",color:"#fff",border:"none",borderRadius:14,padding:"14px 0",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10,opacity:deleteLoading?0.7:1}}>
                  {deleteLoading ? "Se șterge..." : "Șterge definitiv"}
                </button>
                <button onClick={()=>{setDeleteMode(false);setDeleteEmail("");setDeleteError("");}}
                  style={{width:"100%",background:"transparent",color:"#aaa",border:"1px solid #ddd",borderRadius:14,padding:"12px 0",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                  Anulează
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RulesScreen({ onBack }) {
  const lang = useLang();
  const [tab, setTab] = useState("predictions");
  const predRules = [
    { phase:"⚽ Grupe · 1st loc",  pts:PRED_SCORING.group1st, desc:T[lang].rulesDesc1 },
    { phase:"⚽ Grupe · 2nd loc",  pts:PRED_SCORING.group2nd, desc:T[lang].rulesDesc2 },
    { phase:"⚽ Grupe · 3rd loc",  pts:PRED_SCORING.group3rd, desc:T[lang].rulesDesc3 },
    { phase:"🥉 Best Third",       pts:PRED_SCORING.best3,    desc:T[lang].rulesDescBest3 },
    { phase:"🏆 Round of 32",      pts:PRED_SCORING.r32,      desc:T[lang].rulesDescMatch },
    { phase:"🏆 Round of 16",      pts:PRED_SCORING.r16,      desc:T[lang].rulesDescMatch },
    { phase:"🏆 Quarter-Finals",   pts:PRED_SCORING.qf,       desc:T[lang].rulesDescMatch },
    { phase:"🏆 Semi-Finals",      pts:PRED_SCORING.sf,       desc:T[lang].rulesDescMatch },
    { phase:"🏆 Final",            pts:PRED_SCORING.final,    desc:T[lang].rulesDescFinal },
  ];
  const exactRules = [
    { phase:"⚽ Groups · Result", pts:30, desc:"Correct winner or draw" },
    { phase:"⚽ Groups · Exact Score", pts:90, desc:"Exact match score" },
    { phase:"🏆 R16 · Winner", pts:40, desc:"Correct match winner" },
    { phase:"🏆 QF · Winner", pts:60, desc:"Correct match winner" },
    { phase:"🏆 SF · Winner", pts:90, desc:"Correct match winner" },
    { phase:"🏆 Final · Winner", pts:120, desc:"Tournament winner" },
  ];
  const rules = tab==="predictions" ? predRules : exactRules;
  const totalMax = rules.reduce((s,r)=>s+r.pts, 0);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:BG,overflow:"hidden",position:"relative"}}>
      <img src={trophy} alt="" style={{position:"absolute",width:"130%",height:"100%",left:"-30%",top:"15%",objectFit:"cover",objectPosition:"center top",opacity:0.15,pointerEvents:"none",zIndex:0,filter:"grayscale(1) contrast(1.5)"}}/>
      <div style={{position:"relative",zIndex:1,background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,padding:"12px 20px 14px",flexShrink:0,minHeight:100,boxSizing:"border-box"}}>
        <p style={{fontSize:18,color:RED,margin:"0 0 4px",fontStyle:"italic",fontWeight:900,letterSpacing:-0.5,textAlign:"left"}}>Predicto</p>
        <h2 style={{fontSize:18,fontWeight:800,color:"#fff",margin:0,textAlign:"left"}}>📖 {T[lang].rules}</h2>
      </div>

      <div style={{flex:1,overflowY:"auto",overscrollBehavior:"contain",padding:"0 20px 16px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",gap:0,borderBottom:`2px solid rgba(0,0,0,0.06)`,marginBottom:16}}>
          {[{id:"predictions",label:"🎯 Predictions"},{id:"exact",label:<><span>⚽</span>{" Exact Score"}</>}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{flex:1,background:"transparent",border:"none",cursor:"pointer",padding:"12px 0",
                fontSize:12,fontWeight:700,color:tab===t.id?NAVY:"#aaa",
                borderBottom:tab===t.id?`3px solid ${RED}`:"3px solid transparent",
                transition:"all 0.2s"}}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Description */}
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,padding:"14px 16px",marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:700,color:DARK,margin:"0 0 4px"}}>
            {tab==="predictions" ? T[lang].howPredictionsWork : T[lang].howExactScoreWork}
          </p>
          <p style={{fontSize:12,color:"#888",margin:0,lineHeight:1.5}}>
            {tab==="predictions" ? T[lang].predictionsDesc : T[lang].exactDesc}
          </p>
        </div>

        {/* Rules table */}
        <p style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{T[lang].pointsPerPrediction}</p>
        <div style={{background:BG,borderRadius:14,boxShadow:SHADOW_OUT,overflow:"hidden",marginBottom:16}}>
          {rules.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",padding:"12px 16px",background:"#fff",borderBottom:i<rules.length-1?"1px solid rgba(0,0,0,0.05)":"none",gap:12}}>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:700,color:DARK,margin:"0 0 2px"}}>
                  {r.phase.split("⚽").flatMap((p,i)=>i===0?[p]:[<span key={i} style={{colorScheme:"light",filter:"saturate(0) contrast(3) brightness(1.1)"}}>⚽</span>,p])}
                </p>
                <p style={{fontSize:11,color:"#aaa",margin:0}}>{r.desc}</p>
              </div>
              <div style={{background:`linear-gradient(135deg,${NAVY}cc,#001840cc)`,borderRadius:10,padding:"5px 12px",flexShrink:0}}>
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
              ? "If you get the winner right in 10 group matches → 10 × 30 = 300 pts. Every correct prediction counts!"
              : "If you get the exact score in 3 matches → 3 × 90 = 270 pts. Correct result only → 30 pts per match."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, emoji, visible }) {
  return (
    <div style={{
      position:"absolute", bottom: visible ? 90 : 60, left:"50%",
      transform:"translateX(-50%)",
      background:"rgba(20,20,20,0.92)", borderRadius:14,
      padding:"10px 20px", display:"flex", alignItems:"center", gap:8,
      zIndex:500, transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
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

function App() {
  useEffect(()=>{
    const style = document.createElement("style");
    style.textContent = `
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes pulse { 0%,100%{transform:scale(1);box-shadow:0 4px 20px rgba(200,16,46,0.25)} 50%{transform:scale(1.025);box-shadow:0 12px 40px rgba(200,16,46,0.7)} }
      input, textarea, select { font-size: 16px !important; }
    `;
    document.head.appendChild(style);
    return ()=>document.head.removeChild(style);
  },[]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) setScreen(SCREENS.HOME);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (event === 'PASSWORD_RECOVERY') { setScreen(SCREENS.RESET_PASSWORD); return; }
      if (u) {
        setScreen(SCREENS.HOME);
      } else setScreen(SCREENS.SPLASH);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    // Predictions + exact scores pentru un board
    const loadForBoard = async (boardId) => {
      const [preds, scores] = await Promise.all([
        loadPredictions(uid, boardId),
        loadExactScores(uid, boardId),
      ]);
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
        if (Object.keys(preds.ko_picks || {}).length > 0)
          setAllInstantPickDone(p => ({ ...p, [boardId]: true }));
      }
      if (scores && Object.keys(scores).length > 0)
        setExactScoresByBoard(p => ({ ...p, [boardId]: scores }));
    };

    // Boards + member counts + predicții pentru toate boardurile
    loadForBoard('global');
    const refreshBoards = async () => {
      const [boards, avail] = await Promise.all([
        loadUserBoards(uid),
        loadAvailableBoards(uid),
      ]);
      // adminBoards = boards where user is creator (isAdmin=true)
      const adminBoards = boards.filter(b => b.isAdmin);
      // participantBoards = boards where user is member (isMember=true), excludes global
      const participantBoards = boards.filter(b => b.isMember);
      const allMyBoards = [...INITIAL_BOARDS, ...participantBoards];
      const allIds = [...allMyBoards.map(b => b.id), ...adminBoards.map(b => b.id), ...avail.map(b => b.id)];
      const counts = await fetchMemberCounts(allIds);
      setMyBoards(allMyBoards.map(b => ({ ...b, members: counts[b.id] ?? b.members })));
      setCreatedBoards(adminBoards.map(b => ({ ...b, members: counts[b.id] ?? 0 })));
      setAvailableBoards(avail.map(b => ({ ...b, members: counts[b.id] ?? 0 })));
      return boards;
    };
    refreshBoards().then(boards => boards.forEach(b => loadForBoard(b.id)));

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

  const isLocalhost = import.meta.env.DEV;
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [showDevOverlay, setShowDevOverlay] = useState(false);
  const [simDay, setSimDay] = useState(null);
  const [simHour, setSimHour] = useState(12);
  const [simMin, setSimMin] = useState(0);
  const [simStarted, setSimStarted] = useState(false);
  // Simulated current date used across app
  const simDate = simDay ? new Date(2026,5,simDay,simHour,simMin,0) : null;
  const [lang, setLang] = useState("en");
  const [myBoards, setMyBoards] = useState(INITIAL_BOARDS);
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
  const [activeBoardId, setActiveBoardId] = useState("global");

  useEffect(() => {
    if (!user || (screen !== SCREENS.LEADERBOARD && screen !== SCREENS.HOME)) return;
    loadLeaderboard(activeBoardId, null, user.id).then(rows => {
      if (rows.length > 0)
        setLeaderboardData(prev => ({ ...prev, [activeBoardId]: rows }));
    });
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
  const tournamentStarted = simDate ? simDate >= new Date(2026,5,11,19,0,0) : new Date() >= new Date("2026-06-11T19:00:00");

  const noFooter = [SCREENS.SPLASH, SCREENS.LOGIN, SCREENS.INSTANT_PICK, SCREENS.GROUPS_SCHEDULE];
  const showFooter = !noFooter.includes(screen);
  const footerActive = screen===SCREENS.RULES?SCREENS.RULES:screen===SCREENS.ACCOUNT?SCREENS.ACCOUNT:SCREENS.HOME;

  return (
    <UserCtx.Provider value={user}>
    <LangCtx.Provider value={lang}>
    <div style={{width:"100%",height:"100%",background:BG,display:"flex",flexDirection:"column",position:"relative",fontFamily:"-apple-system,'SF Pro Display',sans-serif"}}>
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
          {screen===SCREENS.LOGIN&&<LoginScreen onNext={()=>{ if(!skipOnboarding) setShowOnboarding(true); setScreen(SCREENS.HOME); }}/>}
          {screen===SCREENS.HOME&&showOnboarding&&(
            <OnboardingSheet onDone={(skip)=>{ if(skip) setSkipOnboarding(true); setShowOnboarding(false); setShowFirstAction(true); setTimeout(()=>setShowFirstAction(false), 5000); }}/>
          )}
          {screen===SCREENS.HOME&&<HomeScreen
            onPredict={(boardId)=>{ setActiveBoardId(boardId); setShowFirstAction(false); setScreen(SCREENS.INSTANT_PICK); }}
            onLeaderboard={()=>setScreen(SCREENS.LEADERBOARD)}
            onBoards={()=>setScreen(SCREENS.BOARDS)}
            onOpenGroups={(week)=>{ setGroupsInitialWeek(week||null); setScreen(SCREENS.GROUPS_SCHEDULE); }}
            myBoards={myBoards}
            predictionsComplete={predictionsComplete}
            instantPickDone={instantPickDone}
            exactScores={exactScores}
            simDay={simDay} simHour={simHour} simMin={simMin}
            activeBoardId={activeBoardId}
            setActiveBoardId={setActiveBoardId}
            tournamentStarted={tournamentStarted}
            createdBoards={createdBoards}
            showFirstAction={showFirstAction}
            leaderboardData={leaderboardData}/>}
          {screen===SCREENS.BOARDS&&<BoardsScreen
            onBack={()=>setScreen(SCREENS.HOME)}
            myBoards={myBoards} setMyBoards={setMyBoards}
            createdBoards={createdBoards} setCreatedBoards={setCreatedBoards}
            availableBoards={availableBoards} setAvailableBoards={setAvailableBoards}
            showToast={showToast}
            user={user}
            onCreateBoard={async (boardData) => {
              if (!user) return;
              const { data, error } = await createBoard(user.id, boardData);
              if (error) { showToast("Eroare la creare", "❌"); return null; }
              setCreatedBoards(prev => [...prev, data]);
              return data;
            }}
            onJoinByCode={async (code) => {
              if (!user) return null;
              const { data, error } = await joinBoardByCode(user.id, code);
              if (error) { showToast(error, "❌"); return null; }
              setMyBoards(prev => [...prev, { ...data, isMember: true }]);
              setAvailableBoards(prev => prev.filter(b => b.id !== data.id));
              return data;
            }}
            onJoin={(boardId)=>{ setActiveBoardId(boardId); setScreen(SCREENS.HOME); }}
            onJoinBoard={async (boardId) => {
              if (!user) return;
              const { data, error } = await joinBoardById(user.id, boardId);
              if (error) { showToast(error, "❌"); return; }
              const board = availableBoards.find(b => b.id === boardId) || createdBoards.find(b => b.id === boardId);
              if (board) {
                setMyBoards(prev => prev.some(b => b.id === boardId) ? prev : [...prev, { ...board, isMember: true }]);
                setAvailableBoards(prev => prev.filter(b => b.id !== boardId));
              }
            }}
            onDeleteBoard={async (boardId) => {
              const { error } = await deleteBoard(boardId);
              if (error) { showToast("Eroare la ștergere", "❌"); return; }
              setCreatedBoards(prev => prev.filter(b => b.id !== boardId));
              setMyBoards(prev => prev.filter(b => b.id !== boardId));
              setAvailableBoards(prev => prev.filter(b => b.id !== boardId));
              if (activeBoardId === boardId) setActiveBoardId('global');
              showToast("Board șters", "🗑️");
            }}
            leaderboardData={leaderboardData}
            onRemoveMember={async (boardId, memberId) => {
              await removeBoardMember(boardId, memberId);
              if (memberId === user?.id) {
                setMyBoards(prev => prev.filter(b => b.id !== boardId));
                setAllInstantPickStates(prev => { const n = {...prev}; delete n[boardId]; return n; });
                setAllInstantPickDone(prev => { const n = {...prev}; delete n[boardId]; return n; });
                setExactScoresByBoard(prev => { const n = {...prev}; delete n[boardId]; return n; });
                if (activeBoardId === boardId) setActiveBoardId('global');
              }
            }}/>}
          {screen===SCREENS.RESET_PASSWORD&&<ResetPasswordScreen onDone={()=>setScreen(SCREENS.HOME)}/>}
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
            savedState={instantPickDone
              ? {...instantPickState, stage:"groups", groupIdx:0, showIntro:false, showFinalSummary:false, koShowIntro:false}
              : instantPickState}
            viewMode={instantPickDone}
            onStateChange={setInstantPickState}
            tournamentStarted={tournamentStarted}
            onBack={()=>setScreen(SCREENS.HOME)}
            onModify={()=>setInstantPickDone(false)}
            onComplete={async ()=>{
              setInstantPickDone(true);
              if (user && instantPickState) {
                await savePredictions(user.id, activeBoardId, instantPickState);
              }
              setScreen(SCREENS.HOME);
            }}/>}

          {screen===SCREENS.STATS&&<StatsScreen/>}
          {screen===SCREENS.RULES&&<RulesScreen onBack={()=>setScreen(SCREENS.HOME)}/>}
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
                showToast("Score saved!", "⚽");
              }
            }} simDay={simDay} simHour={simHour} simMin={simMin} initialWeek={groupsInitialWeek} onBack={()=>{ setGroupsInitialWeek(null); setScreen(SCREENS.HOME); }}/>}
          {screen===SCREENS.ACCOUNT&&<AccountScreen setLang={setLang} onBoards={()=>setScreen(SCREENS.BOARDS)} onSignOut={()=>setScreen(SCREENS.SPLASH)} onShowGuide={()=>{ setShowOnboarding(true); setScreen(SCREENS.HOME); }} user={user}/>}
        </div>
        <Toast message={toast.message} emoji={toast.emoji} visible={toast.visible}/>
        {showFooter&&<Footer active={footerActive} onNavigate={setScreen} lang={lang}/>}
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
        {showDevOverlay && (
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
    </div>
    </LangCtx.Provider>
    </UserCtx.Provider>
  );
}

export default App;
