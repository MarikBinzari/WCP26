// FIFA World Cup 2026 — date oficiale (tragere la sorți: 5 decembrie 2024)
// Day encoding: June N = day N (1-30), July N = day N+30 (31-61)

export const ALL_GROUPS_DATA = {
  A: ["Mexico", "South Africa", "Korea Republic", "Czech Republic"],
  B: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["USA", "Paraguay", "Australia", "Turkey"],
  E: ["Germany", "Curaçao", "Côte d'Ivoire", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

export const FLAGS = {
  // Group A
  "Mexico":                    "🇲🇽",
  "South Africa":              "🇿🇦",
  "Korea Republic":            "🇰🇷",
  "Czech Republic":            "🇨🇿",
  // Group B
  "Canada":                    "🇨🇦",
  "Bosnia and Herzegovina":    "🇧🇦",
  "Qatar":                     "🇶🇦",
  "Switzerland":               "🇨🇭",
  // Group C
  "Brazil":                    "🇧🇷",
  "Morocco":                   "🇲🇦",
  "Haiti":                     "🇭🇹",
  "Scotland":                  "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  // Group D
  "USA":                       "🇺🇸",
  "Paraguay":                  "🇵🇾",
  "Australia":                 "🇦🇺",
  "Turkey":                    "🇹🇷",
  // Group E
  "Germany":                   "🇩🇪",
  "Curaçao":                   "🇨🇼",
  "Côte d'Ivoire":             "🇨🇮",
  "Ecuador":                   "🇪🇨",
  // Group F
  "Netherlands":               "🇳🇱",
  "Japan":                     "🇯🇵",
  "Sweden":                    "🇸🇪",
  "Tunisia":                   "🇹🇳",
  // Group G
  "Belgium":                   "🇧🇪",
  "Egypt":                     "🇪🇬",
  "Iran":                      "🇮🇷",
  "New Zealand":               "🇳🇿",
  // Group H
  "Spain":                     "🇪🇸",
  "Cape Verde":                "🇨🇻",
  "Saudi Arabia":              "🇸🇦",
  "Uruguay":                   "🇺🇾",
  // Group I
  "France":                    "🇫🇷",
  "Senegal":                   "🇸🇳",
  "Iraq":                      "🇮🇶",
  "Norway":                    "🇳🇴",
  // Group J
  "Argentina":                 "🇦🇷",
  "Algeria":                   "🇩🇿",
  "Austria":                   "🇦🇹",
  "Jordan":                    "🇯🇴",
  // Group K
  "Portugal":                  "🇵🇹",
  "DR Congo":                  "🇨🇩",
  "Uzbekistan":                "🇺🇿",
  "Colombia":                  "🇨🇴",
  // Group L
  "England":                   "🇬🇧",
  "Croatia":                   "🇭🇷",
  "Ghana":                     "🇬🇭",
  "Panama":                    "🇵🇦",
};

// Culori dominante [primar, secundar]
export const TEAM_COLORS = {
  "Mexico":                 ["#006847","#CE1126"],
  "South Africa":           ["#007A4D","#FFB612"],
  "Korea Republic":         ["#C60C30","#003478"],
  "Czech Republic":         ["#D7141A","#11457E"],
  "Canada":                 ["#FF0000","#FFFFFF"],
  "Bosnia and Herzegovina": ["#002395","#FFCC00"],
  "Qatar":                  ["#8D1B3D","#FFFFFF"],
  "Switzerland":            ["#FF0000","#FFFFFF"],
  "Brazil":                 ["#009C3B","#FFDF00"],
  "Morocco":                ["#C1272D","#006233"],
  "Haiti":                  ["#00209F","#D21034"],
  "Scotland":               ["#003F87","#FFFFFF"],
  "USA":                    ["#002868","#BF0A30"],
  "Paraguay":               ["#D52B1E","#0038A8"],
  "Australia":              ["#00843D","#FFCD00"],
  "Turkey":                 ["#E30A17","#FFFFFF"],
  "Germany":                ["#000000","#DD0000"],
  "Curaçao":                ["#002B7F","#F9E814"],
  "Côte d'Ivoire":          ["#F77F00","#009A44"],
  "Ecuador":                ["#FFD100","#003DA5"],
  "Netherlands":            ["#FF4F00","#003DA5"],
  "Japan":                  ["#FFFFFF","#BC002D"],
  "Sweden":                 ["#006AA7","#FECC02"],
  "Tunisia":                ["#E70013","#FFFFFF"],
  "Belgium":                ["#000000","#FAE042"],
  "Egypt":                  ["#CE1126","#FFFFFF"],
  "Iran":                   ["#239F40","#DA0000"],
  "New Zealand":            ["#FFFFFF","#00247D"],
  "Spain":                  ["#AA151B","#F1BF00"],
  "Cape Verde":             ["#003893","#CF2027"],
  "Saudi Arabia":           ["#006C35","#FFFFFF"],
  "Uruguay":                ["#5EB6E4","#FFFFFF"],
  "France":                 ["#002395","#ED2939"],
  "Senegal":                ["#00853F","#FDEF42"],
  "Iraq":                   ["#CE1126","#FFFFFF"],
  "Norway":                 ["#EF2B2D","#002868"],
  "Argentina":              ["#74ACDF","#FFFFFF"],
  "Algeria":                ["#006233","#D21034"],
  "Austria":                ["#ED2939","#FFFFFF"],
  "Jordan":                 ["#007A3D","#CE1126"],
  "Portugal":               ["#006600","#FF0000"],
  "DR Congo":               ["#007FFF","#FFCC00"],
  "Uzbekistan":             ["#1EB53A","#CE1126"],
  "Colombia":               ["#FCD116","#003087"],
  "England":                ["#FFFFFF","#CF081F"],
  "Croatia":                ["#171796","#FF0000"],
  "Ghana":                  ["#006B3F","#FCD116"],
  "Panama":                 ["#FFFFFF","#DA121A"],
};

// Jucători per echipă (placeholder – înlocuieste cu date reale din API)
export const TEAM_PLAYERS = {
  "Mexico":                 ["Guillermo Ochoa","Hirving Lozano","Raúl Jiménez","Chucky Lozano","Edson Álvarez","Héctor Herrera","Jesús Corona","Orbelin Pineda","Antuna","Henry Martín"],
  "South Africa":           ["Ronwen Williams","Percy Tau","Bongani Zungu","Themba Zwane","Evidence Makgopa","Lyle Foster","Yusuf Maart","Teboho Mokoena","Njabulo Blom","Keagan Dolly"],
  "Korea Republic":         ["Son Heung-min","Lee Kang-in","Kim Min-jae","Hwang Hee-chan","Hwang In-beom","Cho Gue-sung","Lee Jae-sung","Kim Young-gwon","Na Sang-ho","Oh Hyeon-gyu"],
  "Czech Republic":         ["Tomáš Souček","Patrik Schick","Vladimír Coufal","Lukáš Hrádecký","Ondřej Duda","Marek Janáček","Adam Hložek","Ladislav Krejčí","Matěj Kovář","Pavel Kadeřábek"],
  "Canada":                 ["Alphonso Davies","Jonathan David","Atiba Hutchinson","Cyle Larin","Tajon Buchanan","Ismael Koné","Stephen Eustáquio","Milan Borjan","Richie Laryea","Liam Millar"],
  "Bosnia and Herzegovina": ["Edin Džeko","Miralem Pjanić","Sead Kolašinac","Anel Ahmedhodžić","Ermedin Demirović","Nikola Stanković","Armin Hodžić","Amer Gojak","Sven Botman","Harun Šarić"],
  "Qatar":                  ["Almoez Ali","Akram Afif","Hassan Al-Haydos","Abdelkarim Hassan","Assim Madibo","Pedro Miguel","Salmin Almoez","Homam Ahmed","Mohammed Muntari","Bassam Al-Rawi"],
  "Switzerland":            ["Granit Xhaka","Xherdan Shaqiri","Yann Sommer","Nico Elvedi","Fabian Schär","Remo Freuler","Breel Embolo","Steven Zuber","Denis Zakaria","Noah Okafor"],
  "Brazil":                 ["Vinicius Jr","Rodrygo","Raphinha","Richarlison","Marquinhos","Casemiro","Alisson","Lucas Paquetá","Danilo","Gabriel Martinelli"],
  "Morocco":                ["Hakim Ziyech","Youssef En-Nesyri","Achraf Hakimi","Romain Saïss","Sofyan Amrabat","Nayef Aguerd","Noussair Mazraoui","Munir El Haddadi","Sofiane Boufal","Yassine Bounou"],
  "Haiti":                  ["Duckens Nazon","Frantz Pierrot","Mechack Jérôme","Wilde-Donald Guerrier","Bébé","Jems Geffrard","Réginald Goreux","Derrick Etienne","Jeff Louis","Steeven Saba"],
  "Scotland":               ["Andrew Robertson","Scott McTominay","Kieran Tierney","Callum McGregor","Stuart Armstrong","Lawrence Shankland","Ryan Christie","Kenny McLean","Lyndon Dykes","Billy Gilmour"],
  "USA":                    ["Christian Pulisic","Weston McKennie","Tyler Adams","Matt Turner","Gio Reyna","Josh Sargent","Tim Weah","Sergiño Dest","Brendan Aaronson","Cameron Carter-Vickers"],
  "Paraguay":               ["Miguel Almirón","Alberto Espínola","Gustavo Gómez","Óscar Romero","Ángel Romero","Mathías Villasanti","Robert Morales","Julio Enciso","Andrés Cubas","Carlos González"],
  "Australia":              ["Mathew Ryan","Maty Leckie","Aaron Mooy","Ajdin Hrustic","Tom Rogic","Martin Boyle","Miloš Degenek","Jackson Irvine","Riley McGree","Harry Souttar"],
  "Turkey":                 ["Arda Güler","Hakan Çalhanoğlu","Cengiz Ünder","Kenan Yıldız","Çağlar Söyüncü","Merih Demiral","Samet Akaydın","Zeki Çelik","Orkun Kökçü","Yusuf Yazıcı"],
  "Germany":                ["Kai Havertz","Florian Wirtz","Jamal Musiala","Joshua Kimmich","Toni Rüdiger","Manuel Neuer","Serge Gnabry","Thomas Müller","Ilkay Gündogan","Leon Goretzka"],
  "Curaçao":                ["Leandro Bacuna","Daishawn Redan","Cuco Martina","Juninho","Elson Hooi","Jafar Arias","Woodrow Wijnhard","Gershon Klomp","Riechelmy Martina","Levi Garcia"],
  "Côte d'Ivoire":          ["Franck Kessié","Nicolas Pépé","Sébastien Haller","Serge Aurier","Wilfried Zaha","Boubacar Sangaré","Cristian Kouamé","Jean-Philippe Krasso","Odilon Kossounou","Gradel"],
  "Ecuador":                ["Moisés Caicedo","Enner Valencia","Ángel Mena","Piero Hincapié","Byron Castillo","Gonzalo Plata","Michael Estrada","Djorkaeff Reasco","Jhegson Méndez","Alexander Domínguez"],
  "Netherlands":            ["Virgil van Dijk","Cody Gakpo","Memphis Depay","Daley Blind","Frenkie de Jong","Xavi Simons","Steven Bergwijn","Denzel Dumfries","Bart Verbruggen","Nathan Aké"],
  "Japan":                  ["Kaoru Mitoma","Takefusa Kubo","Daichi Kamada","Wataru Endō","Keisuke Honda","Shuichi Gonda","Ao Tanaka","Hiroki Sakai","Takumi Minamino","Ritsu Doan"],
  "Sweden":                 ["Zlatan Ibrahimović","Alexander Isak","Emil Forsberg","Robin Quaison","Dejan Kulusevski","Jordan Larsson","Sebastian Larsson","Victor Lindelöf","Marcus Danielson","Isak Hien"],
  "Tunisia":                ["Youssef Msakni","Wahbi Khazri","Hannibal Mejbri","Ellyes Skhiri","Mohamed Drager","Bilel Ifa","Montassar Talbi","Aïssa Laïdouni","Seifeddine Jaziri","Ali Maâloul"],
  "Belgium":                ["Kevin De Bruyne","Romelu Lukaku","Eden Hazard","Thibaut Courtois","Axel Witsel","Jan Vertonghen","Yannick Carrasco","Leandro Trossard","Charles De Ketelaere","Arthur Theate"],
  "Egypt":                  ["Mohamed Salah","Ahmed Hegazi","Mostafa Mohamed","Mahmoud Trezeguet","Ahmed El-Shenawy","Omar Marmoush","Amr El-Sulaya","Hamdi Fathi","Zizo","Kahraba"],
  "Iran":                   ["Sardar Azmoun","Mehdi Taremi","Ali Beiranvand","Alireza Jahanbakhsh","Saeid Ezatolahi","Saman Ghoddos","Milad Mohammadi","Ahmad Nourollahi","Ramin Rezaeian","Morteza Pouraliganji"],
  "New Zealand":            ["Chris Wood","Winston Reid","Ryan Thomas","Liberato Cacace","Niko Kirwan","Bill Tuilagi","Myer Bevan","Tommie Smith","Elijah Just","Tim Payne"],
  "Spain":                  ["Pedri","Gavi","Álvaro Morata","Lamine Yamal","Nico Williams","Sergio Busquets","Ferran Torres","Marco Asensio","David Raya","Pau Cubarsí"],
  "Cape Verde":             ["Ryan Mendes","Garry Rodrigues","Stopira","Fortes","Jamiro Monteiro","Carlos Martins","Marco Soares","Kuca","Bebé","Bryan Tavares"],
  "Saudi Arabia":           ["Saleh Al-Shehri","Salem Al-Dawsari","Mohammed Al-Owais","Yasser Al-Shahrani","Ali Al-Hassan","Sami Al-Najei","Sultan Al-Ghannam","Abdullah Radif","Firas Al-Buraikan","Nasser Al-Dawsari"],
  "Uruguay":                ["Luis Suárez","Edinson Cavani","Darwin Núñez","Federico Valverde","Rodrigo Bentancur","Diego Godín","José María Giménez","Ronald Araújo","Facundo Pellistri","Sebastián Coates"],
  "France":                 ["Kylian Mbappé","Antoine Griezmann","Ousmane Dembélé","Tchouaméni","Hugo Lloris","Raphaël Varane","Presnel Kimpembe","Kingsley Coman","Randal Kolo Muani","Marcus Thuram"],
  "Senegal":                ["Sadio Mané","Kalidou Koulibaly","Edouard Mendy","Idrissa Gueye","Ismaila Sarr","Bamba Dieng","Formose Mendy","Pape Guèye","Nicolas Jackson","Habib Diallo"],
  "Iraq":                   ["Mohanad Ali","Amjad Attwan","Bashar Resan","Ali Faez","Aymen Hussein","Hassan Abdulkareem","Saad Abdul-Amir","Humam Tariq","Alaa Abdul-Zahra","Dhurgham Ismail"],
  "Norway":                 ["Erling Haaland","Martin Ødegaard","Alexander Sørloth","Ola Solbakken","Sander Berge","Kristian Thorstvedt","Antonio Nusa","Erling Knudtzon","Rune Hauge","Andreas Hanche-Olsen"],
  "Argentina":              ["Lionel Messi","Ángel Di María","Lautaro Martínez","Alexis Mac Allister","Rodrigo De Paul","Paulo Dybala","Julián Álvarez","Nicolás González","Emiliano Martínez","Nahuel Molina"],
  "Algeria":                ["Riyad Mahrez","Islam Slimani","Sofiane Feghouli","Youcef Atal","Andy Delort","Hossem Aouar","Ismaël Bennacer","Said Benrahma","Mohamed Amine Amoura","Baghdad Bounedjah"],
  "Austria":                ["David Alaba","Marcel Sabitzer","Marko Arnautović","Xaver Schlager","Florian Kainz","Konrad Laimer","Michael Gregoritsch","Nicolas Seiwald","Maximilian Wöber","Patrick Wimmer"],
  "Jordan":                 ["Yazan Al-Naimat","Ahmad Hayel","Musa Suleiman","Baha Faisal","Mohammad Hamdan","Yaser Hailat","Raed Basha","Ihab Issa","Anas Bani Yaseen","Salem Al-Ajalin"],
  "Portugal":               ["Cristiano Ronaldo","Bruno Fernandes","João Cancelo","Ruben Dias","Bernardo Silva","Rafael Leão","João Félix","Pedro Neto","Rúben Neves","Diogo Jota"],
  "DR Congo":               ["Cédric Bakambu","Chancel Mbemba","Arthur Masuaku","Yannick Bolasie","Théo Bongonda","Yoane Wissa","Christian Luyindama","Paul-José Mpoku","Machlas","Leopoldine Kaniki"],
  "Uzbekistan":             ["Eldor Shomurodov","Abbosbek Fayzullaev","Jamshid Iskanderov","Azizbek Turgunboev","Locongolo Luiz","Ikromjon Alibaev","Farrux Tashkentov","Jaloliddin Masharipov","Ruslan Nishonov","Bobir Abdixoliqov"],
  "Colombia":               ["Luis Díaz","James Rodríguez","Radamel Falcao","Juan Cuadrado","Davinson Sánchez","Yerry Mina","Camilo Vargas","Miguel Ángel Borja","Mateus Uribe","Sebastián Villa"],
  "England":                ["Harry Kane","Jude Bellingham","Bukayo Saka","Marcus Rashford","Jordan Henderson","Declan Rice","Raheem Sterling","Jack Grealish","Phil Foden","Jordan Pickford"],
  "Croatia":                ["Luka Modrić","Ivan Perišić","Mateo Kovačić","Marcelo Brozović","Ante Rebić","Dejan Lovren","Domagoj Vida","Mario Pašalić","Andrej Kramarić","Josip Stanišić"],
  "Ghana":                  ["Jordan Ayew","André Ayew","Mohammed Kudus","Daniel Amartey","Alexander Djiku","Thomas Partey","Inaki Williams","Antoine Semenyo","Joseph Wollacott","Tariq Lamptey"],
  "Panama":                 ["Rolando Blackburn","Alberto Quintero","Fidel Escobar","Anibal Godoy","Adolfo Machado","Ricardo Avila","Cecilio Waterman","Ismael Díaz","Edgar Bárcenas","Gabby Torres"],
};

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR_EVENTS — toate meciurile oficiale
// Sursa: tragerea la sorți FIFA, 5 dec 2024
// ─────────────────────────────────────────────────────────────────────────────
export const CALENDAR_EVENTS = [

  // ── UEFA Champions League Final — 30 Mai ────────────────────────────────
  {day:-1, matches:[
    {home:"Paris Saint-Germain", homeFlag:"🇫🇷", away:"Arsenal", awayFlag:"🏴󠁧󠁢󠁥󠁧󠁿", time:"18:00", group:"UCL", venue:"Puskás Aréna, Budapest"},
  ]},

  // ── ETAPA 1 ──────────────────────────────────────────────────────────────
  // 11 Iunie — Grupa A (meci de deschidere)
  {day:11, matches:[
    {home:"Mexico",              homeFlag:"🇲🇽", away:"South Africa",         awayFlag:"🇿🇦", time:"15:00", kickoffUtc:"2026-06-11T19:00:00Z", group:"A", venue:"Estadio Azteca"},
  ]},
  // 12 Iunie — Grupele A (cont.), B & D
  {day:12, matches:[
    {home:"Canada",              homeFlag:"🇨🇦", away:"Bosnia and Herzegovina",awayFlag:"🇧🇦", time:"15:00", kickoffUtc:"2026-06-12T19:00:00Z", group:"B", venue:"BMO Field"},
    {home:"Qatar",               homeFlag:"🇶🇦", away:"Switzerland",           awayFlag:"🇨🇭", time:"15:00", kickoffUtc:"2026-06-13T19:00:00Z", group:"B", venue:"Levi's Stadium"},
    {home:"USA",                 homeFlag:"🇺🇸", away:"Paraguay",              awayFlag:"🇵🇾", time:"21:00", kickoffUtc:"2026-06-13T01:00:00Z", group:"D", venue:"SoFi Stadium"},
    {home:"Australia",           homeFlag:"🇦🇺", away:"Turkey",                awayFlag:"🇹🇷", time:"00:00", kickoffUtc:"2026-06-14T04:00:00Z", group:"D", venue:"BC Place"},
    {home:"Korea Republic",      homeFlag:"🇰🇷", away:"Czech Republic",        awayFlag:"🇨🇿", time:"05:00", kickoffUtc:"2026-06-12T02:00:00Z", matchKey:"11-1", group:"A", venue:"Estadio Akron"},
  ]},
  // 13 Iunie — Grupa C
  {day:13, matches:[
    {home:"Brazil",              homeFlag:"🇧🇷", away:"Morocco",               awayFlag:"🇲🇦", time:"18:00", kickoffUtc:"2026-06-13T22:00:00Z", group:"C", venue:"MetLife Stadium"},
    {home:"Haiti",               homeFlag:"🇭🇹", away:"Scotland",              awayFlag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", time:"21:00", kickoffUtc:"2026-06-14T01:00:00Z", group:"C", venue:"Gillette Stadium"},
  ]},
  // 14 Iunie — Grupele E & F
  {day:14, matches:[
    {home:"Germany",             homeFlag:"🇩🇪", away:"Curaçao",               awayFlag:"🇨🇼", time:"13:00", kickoffUtc:"2026-06-14T17:00:00Z", group:"E", venue:"NRG Stadium"},
    {home:"Côte d'Ivoire",       homeFlag:"🇨🇮", away:"Ecuador",               awayFlag:"🇪🇨", time:"19:00", kickoffUtc:"2026-06-14T23:00:00Z", group:"E", venue:"Lincoln Financial Field"},
    {home:"Netherlands",         homeFlag:"🇳🇱", away:"Japan",                 awayFlag:"🇯🇵", time:"16:00", kickoffUtc:"2026-06-14T20:00:00Z", group:"F", venue:"AT&T Stadium"},
    {home:"Sweden",              homeFlag:"🇸🇪", away:"Tunisia",               awayFlag:"🇹🇳", time:"22:00", kickoffUtc:"2026-06-15T02:00:00Z", group:"F", venue:"Estadio BBVA"},
  ]},
  // 15 Iunie — Grupele G & H
  {day:15, matches:[
    {home:"Belgium",             homeFlag:"🇧🇪", away:"Egypt",                 awayFlag:"🇪🇬", time:"15:00", kickoffUtc:"2026-06-15T19:00:00Z", group:"G", venue:"Lumen Field"},
    {home:"Iran",                homeFlag:"🇮🇷", away:"New Zealand",           awayFlag:"🇳🇿", time:"21:00", kickoffUtc:"2026-06-16T01:00:00Z", group:"G", venue:"SoFi Stadium"},
    {home:"Spain",               homeFlag:"🇪🇸", away:"Cape Verde",            awayFlag:"🇨🇻", time:"12:00", kickoffUtc:"2026-06-15T16:00:00Z", group:"H", venue:"Mercedes-Benz Stadium"},
    {home:"Saudi Arabia",        homeFlag:"🇸🇦", away:"Uruguay",               awayFlag:"🇺🇾", time:"18:00", kickoffUtc:"2026-06-15T22:00:00Z", group:"H", venue:"Hard Rock Stadium"},
  ]},
  // 16 Iunie — Grupele I & J
  {day:16, matches:[
    {home:"France",              homeFlag:"🇫🇷", away:"Senegal",               awayFlag:"🇸🇳", time:"15:00", kickoffUtc:"2026-06-16T19:00:00Z", group:"I", venue:"MetLife Stadium"},
    {home:"Iraq",                homeFlag:"🇮🇶", away:"Norway",                awayFlag:"🇳🇴", time:"18:00", kickoffUtc:"2026-06-16T22:00:00Z", group:"I", venue:"Gillette Stadium"},
    {home:"Argentina",           homeFlag:"🇦🇷", away:"Algeria",               awayFlag:"🇩🇿", time:"21:00", kickoffUtc:"2026-06-17T01:00:00Z", group:"J", venue:"Arrowhead Stadium"},
    {home:"Austria",             homeFlag:"🇦🇹", away:"Jordan",                awayFlag:"🇯🇴", time:"00:00", kickoffUtc:"2026-06-17T04:00:00Z", group:"J", venue:"Levi's Stadium"},
  ]},
  // 17 Iunie — Grupele K & L
  {day:17, matches:[
    {home:"Portugal",            homeFlag:"🇵🇹", away:"DR Congo",              awayFlag:"🇨🇩", time:"13:00", kickoffUtc:"2026-06-17T17:00:00Z", group:"K", venue:"NRG Stadium"},
    {home:"Uzbekistan",          homeFlag:"🇺🇿", away:"Colombia",              awayFlag:"🇨🇴", time:"22:00", kickoffUtc:"2026-06-18T02:00:00Z", group:"K", venue:"Estadio Azteca"},
    {home:"England",             homeFlag:"🏴󠁧󠁢󠁥󠁧󠁿", away:"Croatia",               awayFlag:"🇭🇷", time:"16:00", kickoffUtc:"2026-06-17T20:00:00Z", group:"L", venue:"AT&T Stadium"},
    {home:"Ghana",               homeFlag:"🇬🇭", away:"Panama",                awayFlag:"🇵🇦", time:"19:00", kickoffUtc:"2026-06-17T23:00:00Z", group:"L", venue:"BMO Field"},
  ]},

  // ── ETAPA 2 ──────────────────────────────────────────────────────────────
  // 18 Iunie — Grupele A & B
  {day:18, matches:[
    {home:"Czech Republic",      homeFlag:"🇨🇿", away:"South Africa",          awayFlag:"🇿🇦", time:"12:00", kickoffUtc:"2026-06-18T16:00:00Z", group:"A", venue:"Mercedes-Benz Stadium"},
    {home:"Mexico",              homeFlag:"🇲🇽", away:"Korea Republic",        awayFlag:"🇰🇷", time:"21:00", kickoffUtc:"2026-06-19T01:00:00Z", group:"A", venue:"Estadio Akron"},
    {home:"Switzerland",         homeFlag:"🇨🇭", away:"Bosnia and Herzegovina",awayFlag:"🇧🇦", time:"15:00", kickoffUtc:"2026-06-18T19:00:00Z", group:"B", venue:"SoFi Stadium"},
    {home:"Canada",              homeFlag:"🇨🇦", away:"Qatar",                 awayFlag:"🇶🇦", time:"18:00", kickoffUtc:"2026-06-18T22:00:00Z", group:"B", venue:"BC Place"},
  ]},
  // 19 Iunie — Grupele C & D
  {day:19, matches:[
    {home:"Brazil",              homeFlag:"🇧🇷", away:"Haiti",                 awayFlag:"🇭🇹", time:"20:30", kickoffUtc:"2026-06-20T00:30:00Z", group:"C", venue:"Lincoln Financial Field"},
    {home:"Scotland",            homeFlag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", away:"Morocco",               awayFlag:"🇲🇦", time:"18:00", kickoffUtc:"2026-06-19T22:00:00Z", group:"C", venue:"Gillette Stadium"},
    {home:"Turkey",              homeFlag:"🇹🇷", away:"Paraguay",              awayFlag:"🇵🇾", time:"23:00", kickoffUtc:"2026-06-20T03:00:00Z", group:"D", venue:"Levi's Stadium"},
    {home:"USA",                 homeFlag:"🇺🇸", away:"Australia",             awayFlag:"🇦🇺", time:"15:00", kickoffUtc:"2026-06-19T19:00:00Z", group:"D", venue:"Lumen Field"},
  ]},
  // 20 Iunie — Grupele E & F
  {day:20, matches:[
    {home:"Germany",             homeFlag:"🇩🇪", away:"Côte d'Ivoire",         awayFlag:"🇨🇮", time:"16:00", kickoffUtc:"2026-06-20T20:00:00Z", group:"E", venue:"BMO Field"},
    {home:"Ecuador",             homeFlag:"🇪🇨", away:"Curaçao",               awayFlag:"🇨🇼", time:"20:00", kickoffUtc:"2026-06-21T00:00:00Z", group:"E", venue:"Arrowhead Stadium"},
    {home:"Netherlands",         homeFlag:"🇳🇱", away:"Sweden",                awayFlag:"🇸🇪", time:"13:00", kickoffUtc:"2026-06-20T17:00:00Z", group:"F", venue:"NRG Stadium"},
    {home:"Tunisia",             homeFlag:"🇹🇳", away:"Japan",                 awayFlag:"🇯🇵", time:"00:00", kickoffUtc:"2026-06-21T04:00:00Z", group:"F", venue:"Estadio BBVA"},
  ]},
  // 21 Iunie — Grupele G & H
  {day:21, matches:[
    {home:"Belgium",             homeFlag:"🇧🇪", away:"Iran",                  awayFlag:"🇮🇷", time:"15:00", kickoffUtc:"2026-06-21T19:00:00Z", group:"G", venue:"SoFi Stadium"},
    {home:"New Zealand",         homeFlag:"🇳🇿", away:"Egypt",                 awayFlag:"🇪🇬", time:"21:00", kickoffUtc:"2026-06-22T01:00:00Z", group:"G", venue:"BC Place"},
    {home:"Spain",               homeFlag:"🇪🇸", away:"Saudi Arabia",          awayFlag:"🇸🇦", time:"12:00", kickoffUtc:"2026-06-21T16:00:00Z", group:"H", venue:"Mercedes-Benz Stadium"},
    {home:"Uruguay",             homeFlag:"🇺🇾", away:"Cape Verde",            awayFlag:"🇨🇻", time:"18:00", kickoffUtc:"2026-06-21T22:00:00Z", group:"H", venue:"Hard Rock Stadium"},
  ]},
  // 22 Iunie — Grupele I & J
  {day:22, matches:[
    {home:"France",              homeFlag:"🇫🇷", away:"Iraq",                  awayFlag:"🇮🇶", time:"17:00", kickoffUtc:"2026-06-22T21:00:00Z", group:"I", venue:"Lincoln Financial Field"},
    {home:"Norway",              homeFlag:"🇳🇴", away:"Senegal",               awayFlag:"🇸🇳", time:"20:00", kickoffUtc:"2026-06-23T00:00:00Z", group:"I", venue:"MetLife Stadium"},
    {home:"Argentina",           homeFlag:"🇦🇷", away:"Austria",               awayFlag:"🇦🇹", time:"13:00", kickoffUtc:"2026-06-22T17:00:00Z", group:"J", venue:"AT&T Stadium"},
    {home:"Jordan",              homeFlag:"🇯🇴", away:"Algeria",               awayFlag:"🇩🇿", time:"23:00", kickoffUtc:"2026-06-23T03:00:00Z", group:"J", venue:"Levi's Stadium"},
  ]},
  // 23 Iunie — Grupele K & L
  {day:23, matches:[
    {home:"Portugal",            homeFlag:"🇵🇹", away:"Uzbekistan",            awayFlag:"🇺🇿", time:"13:00", kickoffUtc:"2026-06-23T17:00:00Z", group:"K", venue:"NRG Stadium"},
    {home:"Colombia",            homeFlag:"🇨🇴", away:"DR Congo",              awayFlag:"🇨🇩", time:"22:00", kickoffUtc:"2026-06-24T02:00:00Z", group:"K", venue:"Estadio Akron"},
    {home:"England",             homeFlag:"🏴󠁧󠁢󠁥󠁧󠁿", away:"Ghana",                 awayFlag:"🇬🇭", time:"16:00", kickoffUtc:"2026-06-23T20:00:00Z", group:"L", venue:"Gillette Stadium"},
    {home:"Panama",              homeFlag:"🇵🇦", away:"Croatia",               awayFlag:"🇭🇷", time:"19:00", kickoffUtc:"2026-06-23T23:00:00Z", group:"L", venue:"BMO Field"},
  ]},

  // ── ETAPA 3 (meciuri simultane în cadrul grupei) ──────────────────────────
  // 24 Iunie — Grupele A, B, C
  {day:24, matches:[
    {home:"Czech Republic",      homeFlag:"🇨🇿", away:"Mexico",                awayFlag:"🇲🇽", time:"21:00", kickoffUtc:"2026-06-25T01:00:00Z", group:"A", venue:"Estadio Azteca"},
    {home:"South Africa",        homeFlag:"🇿🇦", away:"Korea Republic",        awayFlag:"🇰🇷", time:"21:00", kickoffUtc:"2026-06-25T01:00:00Z", group:"A", venue:"Estadio BBVA"},
    {home:"Switzerland",         homeFlag:"🇨🇭", away:"Canada",                awayFlag:"🇨🇦", time:"15:00", kickoffUtc:"2026-06-24T19:00:00Z", group:"B", venue:"BC Place"},
    {home:"Bosnia and Herzegovina",homeFlag:"🇧🇦",away:"Qatar",                awayFlag:"🇶🇦", time:"15:00", kickoffUtc:"2026-06-24T19:00:00Z", group:"B", venue:"Lumen Field"},
    {home:"Scotland",            homeFlag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", away:"Brazil",                awayFlag:"🇧🇷", time:"18:00", kickoffUtc:"2026-06-24T22:00:00Z", group:"C", venue:"Hard Rock Stadium"},
    {home:"Morocco",             homeFlag:"🇲🇦", away:"Haiti",                 awayFlag:"🇭🇹", time:"18:00", kickoffUtc:"2026-06-24T22:00:00Z", group:"C", venue:"Mercedes-Benz Stadium"},
  ]},
  // 25 Iunie — Grupele D, E, F, G, H
  {day:25, matches:[
    {home:"Turkey",              homeFlag:"🇹🇷", away:"USA",                   awayFlag:"🇺🇸", time:"22:00", kickoffUtc:"2026-06-26T02:00:00Z", group:"D", venue:"SoFi Stadium"},
    {home:"Paraguay",            homeFlag:"🇵🇾", away:"Australia",             awayFlag:"🇦🇺", time:"22:00", kickoffUtc:"2026-06-26T02:00:00Z", group:"D", venue:"Levi's Stadium"},
    {home:"Ecuador",             homeFlag:"🇪🇨", away:"Germany",               awayFlag:"🇩🇪", time:"16:00", kickoffUtc:"2026-06-25T20:00:00Z", group:"E", venue:"MetLife Stadium"},
    {home:"Curaçao",             homeFlag:"🇨🇼", away:"Côte d'Ivoire",         awayFlag:"🇨🇮", time:"16:00", kickoffUtc:"2026-06-25T20:00:00Z", group:"E", venue:"Lincoln Financial Field"},
    {home:"Tunisia",             homeFlag:"🇹🇳", away:"Netherlands",           awayFlag:"🇳🇱", time:"19:00", kickoffUtc:"2026-06-25T23:00:00Z", group:"F", venue:"Arrowhead Stadium"},
    {home:"Japan",               homeFlag:"🇯🇵", away:"Sweden",                awayFlag:"🇸🇪", time:"19:00", kickoffUtc:"2026-06-25T23:00:00Z", group:"F", venue:"AT&T Stadium"},
    {home:"New Zealand",         homeFlag:"🇳🇿", away:"Belgium",               awayFlag:"🇧🇪", time:"23:00", kickoffUtc:"2026-06-27T03:00:00Z", group:"G", venue:"BC Place"},
    {home:"Egypt",               homeFlag:"🇪🇬", away:"Iran",                  awayFlag:"🇮🇷", time:"23:00", kickoffUtc:"2026-06-27T03:00:00Z", group:"G", venue:"Lumen Field"},
    {home:"Uruguay",             homeFlag:"🇺🇾", away:"Spain",                 awayFlag:"🇪🇸", time:"20:00", kickoffUtc:"2026-06-27T00:00:00Z", group:"H", venue:"Estadio Akron"},
    {home:"Cape Verde",          homeFlag:"🇨🇻", away:"Saudi Arabia",          awayFlag:"🇸🇦", time:"20:00", kickoffUtc:"2026-06-27T00:00:00Z", group:"H", venue:"NRG Stadium"},
  ]},
  // 26 Iunie — Grupa I
  {day:26, matches:[
    {home:"Norway",              homeFlag:"🇳🇴", away:"France",                awayFlag:"🇫🇷", time:"15:00", kickoffUtc:"2026-06-26T19:00:00Z", group:"I", venue:"Gillette Stadium"},
    {home:"Senegal",             homeFlag:"🇸🇳", away:"Iraq",                  awayFlag:"🇮🇶", time:"15:00", kickoffUtc:"2026-06-26T19:00:00Z", group:"I", venue:"BMO Field"},
  ]},
  // 27 Iunie — Grupele J, K, L
  {day:27, matches:[
    {home:"Jordan",              homeFlag:"🇯🇴", away:"Argentina",             awayFlag:"🇦🇷", time:"22:00", kickoffUtc:"2026-06-28T02:00:00Z", group:"J", venue:"AT&T Stadium"},
    {home:"Algeria",             homeFlag:"🇩🇿", away:"Austria",               awayFlag:"🇦🇹", time:"22:00", kickoffUtc:"2026-06-28T02:00:00Z", group:"J", venue:"Arrowhead Stadium"},
    {home:"Colombia",            homeFlag:"🇨🇴", away:"Portugal",              awayFlag:"🇵🇹", time:"19:30", kickoffUtc:"2026-06-27T23:30:00Z", group:"K", venue:"Hard Rock Stadium"},
    {home:"DR Congo",            homeFlag:"🇨🇩", away:"Uzbekistan",            awayFlag:"🇺🇿", time:"19:30", kickoffUtc:"2026-06-27T23:30:00Z", group:"K", venue:"Mercedes-Benz Stadium"},
    {home:"Panama",              homeFlag:"🇵🇦", away:"England",               awayFlag:"🏴󠁧󠁢󠁥󠁧󠁿", time:"17:00", kickoffUtc:"2026-06-27T21:00:00Z", group:"L", venue:"MetLife Stadium"},
    {home:"Croatia",             homeFlag:"🇭🇷", away:"Ghana",                 awayFlag:"🇬🇭", time:"17:00", kickoffUtc:"2026-06-27T21:00:00Z", group:"L", venue:"Lincoln Financial Field"},
  ]},

  // ── R32 (OPTIMI DE FINALĂ) — 28 Iunie - 3 Iulie ────────────────────────────
  {day:28, matches:[
    {home:"South Africa",homeFlag:"🏆",away:"Canada",        awayFlag:"🏆",time:"22:00",group:"R32",venue:"SoFi Stadium",        kickoffUtc:"2026-06-28T19:00:00Z"},
  ]},
  {day:29, matches:[
    {home:"Germany",     homeFlag:"🏆",away:"Paraguay",      awayFlag:"🏆",time:"20:00",group:"R32",venue:"Gillette Stadium",    kickoffUtc:"2026-06-29T17:00:00Z"},
    {home:"Netherlands", homeFlag:"🏆",away:"Morocco",       awayFlag:"🏆",time:"23:30",group:"R32",venue:"Estadio BBVA",        kickoffUtc:"2026-06-29T20:30:00Z"},
    {home:"Brazil",      homeFlag:"🏆",away:"Japan",         awayFlag:"🏆",time:"04:00",group:"R32",venue:"NRG Stadium",         kickoffUtc:"2026-06-30T01:00:00Z"},
  ]},
  {day:30, matches:[
    {home:"France",      homeFlag:"🏆",away:"Sweden",        awayFlag:"🏆",time:"20:00",group:"R32",venue:"MetLife Stadium",     kickoffUtc:"2026-06-30T17:00:00Z"},
    {home:"Côte d'Ivoire",homeFlag:"🏆",away:"Norway",       awayFlag:"🏆",time:"00:00",group:"R32",venue:"AT&T Stadium",        kickoffUtc:"2026-06-30T21:00:00Z"},
    {home:"Mexico",      homeFlag:"🏆",away:"Ecuador",       awayFlag:"🏆",time:"04:00",group:"R32",venue:"Estadio Azteca",      kickoffUtc:"2026-07-01T01:00:00Z"},
  ]},
  {day:31, matches:[
    {home:"England",     homeFlag:"🏆",away:"DR Congo",      awayFlag:"🏆",time:"19:00",group:"R32",venue:"Mercedes-Benz Stadium",kickoffUtc:"2026-07-01T16:00:00Z"},
    {home:"USA",         homeFlag:"🏆",away:"Bosnia and Herzegovina",awayFlag:"🏆",time:"23:00",group:"R32",venue:"Levi's Stadium",kickoffUtc:"2026-07-01T20:00:00Z"},
    {home:"Belgium",     homeFlag:"🏆",away:"Senegal",       awayFlag:"🏆",time:"03:00",group:"R32",venue:"Lumen Field",          kickoffUtc:"2026-07-02T00:00:00Z"},
  ]},
  {day:32, matches:[
    {home:"Portugal",    homeFlag:"🏆",away:"Croatia",       awayFlag:"🏆",time:"22:00",group:"R32",venue:"BMO Field",           kickoffUtc:"2026-07-02T19:00:00Z"},
    {home:"Spain",       homeFlag:"🏆",away:"Austria",       awayFlag:"🏆",time:"02:00",group:"R32",venue:"SoFi Stadium",        kickoffUtc:"2026-07-02T23:00:00Z"},
    {home:"Switzerland", homeFlag:"🏆",away:"Algeria",       awayFlag:"🏆",time:"06:00",group:"R32",venue:"BC Place",            kickoffUtc:"2026-07-03T03:00:00Z"},
  ]},
  {day:33, matches:[
    {home:"Argentina",   homeFlag:"🏆",away:"Cape Verde",    awayFlag:"🏆",time:"01:00",group:"R32",venue:"Hard Rock Stadium",   kickoffUtc:"2026-07-03T22:00:00Z"},
    {home:"Colombia",    homeFlag:"🏆",away:"Ghana",         awayFlag:"🏆",time:"04:30",group:"R32",venue:"Arrowhead Stadium",   kickoffUtc:"2026-07-04T01:30:00Z"},
    {home:"Australia",   homeFlag:"🏆",away:"Egypt",         awayFlag:"🏆",time:"21:00",group:"R32",venue:"AT&T Stadium",        kickoffUtc:"2026-07-03T18:00:00Z"},
  ]},

  // ── R16 (ȘAISPREZECIMI) — 4-7 Iulie ─────────────────────────────────────────
  {day:34, matches:[
    {home:"W74",homeFlag:"🏆",away:"W77",awayFlag:"🏆",time:"17:00",group:"R16",venue:"Lincoln Financial Field",kickoffUtc:"2026-07-04T21:00:00Z"},
    {home:"W73",homeFlag:"🏆",away:"W75",awayFlag:"🏆",time:"20:00",group:"R16",venue:"NRG Stadium",kickoffUtc:"2026-07-04T17:00:00Z"},
  ]},
  {day:35, matches:[
    {home:"W76",homeFlag:"🏆",away:"W78",awayFlag:"🏆",time:"16:00",group:"R16",venue:"MetLife Stadium",kickoffUtc:"2026-07-05T20:00:00Z"},
    {home:"W79",homeFlag:"🏆",away:"W80",awayFlag:"🏆",time:"18:00",group:"R16",venue:"Estadio Azteca",kickoffUtc:"2026-07-05T22:00:00Z"},
  ]},
  {day:36, matches:[
    {home:"W83",homeFlag:"🏆",away:"W84",awayFlag:"🏆",time:"19:00",group:"R16",venue:"AT&T Stadium",kickoffUtc:"2026-07-06T19:00:00Z"},
    {home:"W81",homeFlag:"🏆",away:"W82",awayFlag:"🏆",time:"21:00",group:"R16",venue:"Lumen Field",kickoffUtc:"2026-07-07T00:00:00Z"},
  ]},
  {day:37, matches:[
    {home:"W86",homeFlag:"🏆",away:"W88",awayFlag:"🏆",time:"16:00",group:"R16",venue:"Mercedes-Benz Stadium",kickoffUtc:"2026-07-07T20:00:00Z"},
    {home:"W85",homeFlag:"🏆",away:"W87",awayFlag:"🏆",time:"19:00",group:"R16",venue:"BC Place",kickoffUtc:"2026-07-07T23:00:00Z"},
  ]},

  // ── SFERTURI DE FINALĂ (QF) — 9-11 Iulie ────────────────────────────────────
  {day:39, matches:[
    {home:"W89",homeFlag:"🏆",away:"W90",awayFlag:"🏆",time:"16:00",group:"QF",venue:"Gillette Stadium",kickoffUtc:"2026-07-09T20:00:00Z"},
  ]},
  {day:40, matches:[
    {home:"W93",homeFlag:"🏆",away:"W94",awayFlag:"🏆",time:"19:00",group:"QF",venue:"SoFi Stadium",kickoffUtc:"2026-07-10T23:00:00Z"},
  ]},
  {day:41, matches:[
    {home:"W91",homeFlag:"🏆",away:"W92",awayFlag:"🏆",time:"17:00",group:"QF",venue:"Hard Rock Stadium",kickoffUtc:"2026-07-11T21:00:00Z"},
    {home:"W95",homeFlag:"🏆",away:"W96",awayFlag:"🏆",time:"20:00",group:"QF",venue:"Arrowhead Stadium",kickoffUtc:"2026-07-12T00:00:00Z"},
  ]},

  // ── SEMIFINALE — 14-15 Iulie ─────────────────────────────────────────────────
  {day:44, matches:[
    {home:"W97",homeFlag:"🏆",away:"W98",awayFlag:"🏆",time:"21:00",group:"SF",venue:"AT&T Stadium",kickoffUtc:"2026-07-15T01:00:00Z"},
  ]},
  {day:45, matches:[
    {home:"W99",homeFlag:"🏆",away:"W100",awayFlag:"🏆",time:"21:00",group:"SF",venue:"Mercedes-Benz Stadium",kickoffUtc:"2026-07-16T01:00:00Z"},
  ]},

  // ── FINALA MICĂ — 18 Iulie ───────────────────────────────────────────────────
  {day:48, matches:[
    {home:"L101",homeFlag:"🥉",away:"L102",awayFlag:"🥉",time:"21:00",group:"3rd",venue:"Hard Rock Stadium",kickoffUtc:"2026-07-19T01:00:00Z"},
  ]},

  // ── FINALA — 19 Iulie ────────────────────────────────────────────────────────
  {day:49, matches:[
    {home:"W101",homeFlag:"🏆",away:"W102",awayFlag:"🏆",time:"21:00",group:"Final",venue:"MetLife Stadium",kickoffUtc:"2026-07-20T01:00:00Z"},
  ]},
];

// ─────────────────────────────────────────────────────────────────────────────
// UEFA Champions League Final 2026
// May 30, 2026 · Puskás Aréna, Budapest · 18:00 CEST (16:00 UTC)
// ─────────────────────────────────────────────────────────────────────────────
export const CL_FINAL = {
  matchKey:  "cl-final",
  home:      "Paris Saint-Germain",
  homeShort: "PSG",
  homeFlag:  "🇫🇷",
  away:      "Arsenal",
  awayShort: "Arsenal",
  awayFlag:  "🏴󠁧󠁢󠁥󠁧󠁿",
  time:      "18:00",     // CEST
  timeUTC:   "16:00",     // UTC
  date:      "2026-05-30",
  venue:     "Puskás Aréna, Budapest",
};
