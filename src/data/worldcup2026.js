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
  "England":                   "🏴󠁧󠁢󠁥󠁧󠁿",
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

  // ── ETAPA 1 ──────────────────────────────────────────────────────────────
  // 11 Iunie — Grupa A (meci de deschidere)
  {day:11, matches:[
    {home:"Mexico",              homeFlag:"🇲🇽", away:"South Africa",         awayFlag:"🇿🇦", time:"16:00", group:"A", venue:"Estadio Azteca"},
    {home:"Korea Republic",      homeFlag:"🇰🇷", away:"Czech Republic",        awayFlag:"🇨🇿", time:"20:00", group:"A", venue:"Estadio Akron"},
  ]},
  // 12 Iunie — Grupele B & D
  {day:12, matches:[
    {home:"Canada",              homeFlag:"🇨🇦", away:"Bosnia and Herzegovina",awayFlag:"🇧🇦", time:"13:00", group:"B", venue:"BMO Field"},
    {home:"Qatar",               homeFlag:"🇶🇦", away:"Switzerland",           awayFlag:"🇨🇭", time:"16:00", group:"B", venue:"Levi's Stadium"},
    {home:"USA",                 homeFlag:"🇺🇸", away:"Paraguay",              awayFlag:"🇵🇾", time:"19:00", group:"D", venue:"SoFi Stadium"},
    {home:"Australia",           homeFlag:"🇦🇺", away:"Turkey",                awayFlag:"🇹🇷", time:"22:00", group:"D", venue:"BC Place"},
  ]},
  // 13 Iunie — Grupa C
  {day:13, matches:[
    {home:"Brazil",              homeFlag:"🇧🇷", away:"Morocco",               awayFlag:"🇲🇦", time:"16:00", group:"C", venue:"Gillette Stadium"},
    {home:"Haiti",               homeFlag:"🇭🇹", away:"Scotland",              awayFlag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", time:"20:00", group:"C", venue:"MetLife Stadium"},
  ]},
  // 14 Iunie — Grupele E & F
  {day:14, matches:[
    {home:"Germany",             homeFlag:"🇩🇪", away:"Curaçao",               awayFlag:"🇨🇼", time:"13:00", group:"E", venue:"Lincoln Financial Field"},
    {home:"Côte d'Ivoire",       homeFlag:"🇨🇮", away:"Ecuador",               awayFlag:"🇪🇨", time:"16:00", group:"E", venue:"NRG Stadium"},
    {home:"Netherlands",         homeFlag:"🇳🇱", away:"Japan",                 awayFlag:"🇯🇵", time:"19:00", group:"F", venue:"AT&T Stadium"},
    {home:"Sweden",              homeFlag:"🇸🇪", away:"Tunisia",               awayFlag:"🇹🇳", time:"22:00", group:"F", venue:"Estadio BBVA"},
  ]},
  // 15 Iunie — Grupele G & H
  {day:15, matches:[
    {home:"Belgium",             homeFlag:"🇧🇪", away:"Egypt",                 awayFlag:"🇪🇬", time:"13:00", group:"G", venue:"SoFi Stadium"},
    {home:"Iran",                homeFlag:"🇮🇷", away:"New Zealand",           awayFlag:"🇳🇿", time:"16:00", group:"G", venue:"Lumen Field"},
    {home:"Spain",               homeFlag:"🇪🇸", away:"Cape Verde",            awayFlag:"🇨🇻", time:"19:00", group:"H", venue:"Hard Rock Stadium"},
    {home:"Saudi Arabia",        homeFlag:"🇸🇦", away:"Uruguay",               awayFlag:"🇺🇾", time:"22:00", group:"H", venue:"Mercedes-Benz Stadium"},
  ]},
  // 16 Iunie — Grupele I & J
  {day:16, matches:[
    {home:"France",              homeFlag:"🇫🇷", away:"Senegal",               awayFlag:"🇸🇳", time:"13:00", group:"I", venue:"MetLife Stadium"},
    {home:"Iraq",                homeFlag:"🇮🇶", away:"Norway",                awayFlag:"🇳🇴", time:"16:00", group:"I", venue:"Gillette Stadium"},
    {home:"Argentina",           homeFlag:"🇦🇷", away:"Algeria",               awayFlag:"🇩🇿", time:"19:00", group:"J", venue:"Arrowhead Stadium"},
    {home:"Austria",             homeFlag:"🇦🇹", away:"Jordan",                awayFlag:"🇯🇴", time:"22:00", group:"J", venue:"Levi's Stadium"},
  ]},
  // 17 Iunie — Grupele K & L
  {day:17, matches:[
    {home:"Portugal",            homeFlag:"🇵🇹", away:"DR Congo",              awayFlag:"🇨🇩", time:"13:00", group:"K", venue:"NRG Stadium"},
    {home:"Uzbekistan",          homeFlag:"🇺🇿", away:"Colombia",              awayFlag:"🇨🇴", time:"16:00", group:"K", venue:"Estadio Azteca"},
    {home:"England",             homeFlag:"🏴󠁧󠁢󠁥󠁧󠁿", away:"Croatia",               awayFlag:"🇭🇷", time:"19:00", group:"L", venue:"BMO Field"},
    {home:"Ghana",               homeFlag:"🇬🇭", away:"Panama",                awayFlag:"🇵🇦", time:"22:00", group:"L", venue:"AT&T Stadium"},
  ]},

  // ── ETAPA 2 ──────────────────────────────────────────────────────────────
  // 18 Iunie — Grupele A & B
  {day:18, matches:[
    {home:"Czech Republic",      homeFlag:"🇨🇿", away:"South Africa",          awayFlag:"🇿🇦", time:"13:00", group:"A", venue:"Mercedes-Benz Stadium"},
    {home:"Mexico",              homeFlag:"🇲🇽", away:"Korea Republic",        awayFlag:"🇰🇷", time:"16:00", group:"A", venue:"Estadio Akron"},
    {home:"Switzerland",         homeFlag:"🇨🇭", away:"Bosnia and Herzegovina",awayFlag:"🇧🇦", time:"19:00", group:"B", venue:"SoFi Stadium"},
    {home:"Canada",              homeFlag:"🇨🇦", away:"Qatar",                 awayFlag:"🇶🇦", time:"22:00", group:"B", venue:"BC Place"},
  ]},
  // 19 Iunie — Grupele C & D
  {day:19, matches:[
    {home:"Brazil",              homeFlag:"🇧🇷", away:"Haiti",                 awayFlag:"🇭🇹", time:"13:00", group:"C", venue:"Lincoln Financial Field"},
    {home:"Scotland",            homeFlag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", away:"Morocco",               awayFlag:"🇲🇦", time:"16:00", group:"C", venue:"Gillette Stadium"},
    {home:"Turkey",              homeFlag:"🇹🇷", away:"Paraguay",              awayFlag:"🇵🇾", time:"19:00", group:"D", venue:"Levi's Stadium"},
    {home:"USA",                 homeFlag:"🇺🇸", away:"Australia",             awayFlag:"🇦🇺", time:"22:00", group:"D", venue:"Lumen Field"},
  ]},
  // 20 Iunie — Grupele E & F
  {day:20, matches:[
    {home:"Germany",             homeFlag:"🇩🇪", away:"Côte d'Ivoire",         awayFlag:"🇨🇮", time:"13:00", group:"E", venue:"BMO Field"},
    {home:"Ecuador",             homeFlag:"🇪🇨", away:"Curaçao",               awayFlag:"🇨🇼", time:"16:00", group:"E", venue:"Arrowhead Stadium"},
    {home:"Netherlands",         homeFlag:"🇳🇱", away:"Sweden",                awayFlag:"🇸🇪", time:"19:00", group:"F", venue:"NRG Stadium"},
    {home:"Tunisia",             homeFlag:"🇹🇳", away:"Japan",                 awayFlag:"🇯🇵", time:"22:00", group:"F", venue:"Estadio BBVA"},
  ]},
  // 21 Iunie — Grupele G & H
  {day:21, matches:[
    {home:"Belgium",             homeFlag:"🇧🇪", away:"Iran",                  awayFlag:"🇮🇷", time:"13:00", group:"G", venue:"SoFi Stadium"},
    {home:"New Zealand",         homeFlag:"🇳🇿", away:"Egypt",                 awayFlag:"🇪🇬", time:"16:00", group:"G", venue:"BC Place"},
    {home:"Spain",               homeFlag:"🇪🇸", away:"Saudi Arabia",          awayFlag:"🇸🇦", time:"19:00", group:"H", venue:"Hard Rock Stadium"},
    {home:"Uruguay",             homeFlag:"🇺🇾", away:"Cape Verde",            awayFlag:"🇨🇻", time:"22:00", group:"H", venue:"Mercedes-Benz Stadium"},
  ]},
  // 22 Iunie — Grupele I & J
  {day:22, matches:[
    {home:"France",              homeFlag:"🇫🇷", away:"Iraq",                  awayFlag:"🇮🇶", time:"13:00", group:"I", venue:"MetLife Stadium"},
    {home:"Norway",              homeFlag:"🇳🇴", away:"Senegal",               awayFlag:"🇸🇳", time:"16:00", group:"I", venue:"Lincoln Financial Field"},
    {home:"Argentina",           homeFlag:"🇦🇷", away:"Austria",               awayFlag:"🇦🇹", time:"19:00", group:"J", venue:"AT&T Stadium"},
    {home:"Jordan",              homeFlag:"🇯🇴", away:"Algeria",               awayFlag:"🇩🇿", time:"22:00", group:"J", venue:"Levi's Stadium"},
  ]},
  // 23 Iunie — Grupele K & L
  {day:23, matches:[
    {home:"Portugal",            homeFlag:"🇵🇹", away:"Uzbekistan",            awayFlag:"🇺🇿", time:"13:00", group:"K", venue:"NRG Stadium"},
    {home:"Colombia",            homeFlag:"🇨🇴", away:"DR Congo",              awayFlag:"🇨🇩", time:"16:00", group:"K", venue:"Estadio Akron"},
    {home:"England",             homeFlag:"🏴󠁧󠁢󠁥󠁧󠁿", away:"Ghana",                 awayFlag:"🇬🇭", time:"19:00", group:"L", venue:"Gillette Stadium"},
    {home:"Panama",              homeFlag:"🇵🇦", away:"Croatia",               awayFlag:"🇭🇷", time:"22:00", group:"L", venue:"BMO Field"},
  ]},

  // ── ETAPA 3 (meciuri simultane în cadrul grupei) ──────────────────────────
  // 24 Iunie — Grupele A, B, C
  {day:24, matches:[
    {home:"Czech Republic",      homeFlag:"🇨🇿", away:"Mexico",                awayFlag:"🇲🇽", time:"15:00", group:"A", venue:"Estadio Azteca"},
    {home:"South Africa",        homeFlag:"🇿🇦", away:"Korea Republic",        awayFlag:"🇰🇷", time:"15:00", group:"A", venue:"Estadio BBVA"},
    {home:"Switzerland",         homeFlag:"🇨🇭", away:"Canada",                awayFlag:"🇨🇦", time:"19:00", group:"B", venue:"BC Place"},
    {home:"Bosnia and Herzegovina",homeFlag:"🇧🇦",away:"Qatar",                awayFlag:"🇶🇦", time:"19:00", group:"B", venue:"Lumen Field"},
    {home:"Scotland",            homeFlag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", away:"Brazil",                awayFlag:"🇧🇷", time:"19:00", group:"C", venue:"Hard Rock Stadium"},
    {home:"Morocco",             homeFlag:"🇲🇦", away:"Haiti",                 awayFlag:"🇭🇹", time:"19:00", group:"C", venue:"Mercedes-Benz Stadium"},
  ]},
  // 25 Iunie — Grupele D, E, F, G, H
  {day:25, matches:[
    {home:"Turkey",              homeFlag:"🇹🇷", away:"USA",                   awayFlag:"🇺🇸", time:"15:00", group:"D", venue:"SoFi Stadium"},
    {home:"Paraguay",            homeFlag:"🇵🇾", away:"Australia",             awayFlag:"🇦🇺", time:"15:00", group:"D", venue:"Levi's Stadium"},
    {home:"Ecuador",             homeFlag:"🇪🇨", away:"Germany",               awayFlag:"🇩🇪", time:"15:00", group:"E", venue:"Lincoln Financial Field"},
    {home:"Curaçao",             homeFlag:"🇨🇼", away:"Côte d'Ivoire",         awayFlag:"🇨🇮", time:"15:00", group:"E", venue:"MetLife Stadium"},
    {home:"Tunisia",             homeFlag:"🇹🇳", away:"Netherlands",           awayFlag:"🇳🇱", time:"19:00", group:"F", venue:"AT&T Stadium"},
    {home:"Japan",               homeFlag:"🇯🇵", away:"Sweden",                awayFlag:"🇸🇪", time:"19:00", group:"F", venue:"Arrowhead Stadium"},
    {home:"New Zealand",         homeFlag:"🇳🇿", away:"Belgium",               awayFlag:"🇧🇪", time:"19:00", group:"G", venue:"Lumen Field"},
    {home:"Egypt",               homeFlag:"🇪🇬", away:"Iran",                  awayFlag:"🇮🇷", time:"19:00", group:"G", venue:"BC Place"},
    {home:"Uruguay",             homeFlag:"🇺🇾", away:"Spain",                 awayFlag:"🇪🇸", time:"19:00", group:"H", venue:"NRG Stadium"},
    {home:"Cape Verde",          homeFlag:"🇨🇻", away:"Saudi Arabia",          awayFlag:"🇸🇦", time:"19:00", group:"H", venue:"Estadio Akron"},
  ]},
  // 26 Iunie — Grupele I, K, L
  {day:26, matches:[
    {home:"Norway",              homeFlag:"🇳🇴", away:"France",                awayFlag:"🇫🇷", time:"15:00", group:"I", venue:"Gillette Stadium"},
    {home:"Senegal",             homeFlag:"🇸🇳", away:"Iraq",                  awayFlag:"🇮🇶", time:"15:00", group:"I", venue:"BMO Field"},
    {home:"Colombia",            homeFlag:"🇨🇴", away:"Portugal",              awayFlag:"🇵🇹", time:"19:00", group:"K", venue:"Hard Rock Stadium"},
    {home:"DR Congo",            homeFlag:"🇨🇩", away:"Uzbekistan",            awayFlag:"🇺🇿", time:"19:00", group:"K", venue:"Mercedes-Benz Stadium"},
    {home:"Panama",              homeFlag:"🇵🇦", away:"England",               awayFlag:"🏴󠁧󠁢󠁥󠁧󠁿", time:"19:00", group:"L", venue:"MetLife Stadium"},
    {home:"Croatia",             homeFlag:"🇭🇷", away:"Ghana",                 awayFlag:"🇬🇭", time:"19:00", group:"L", venue:"Lincoln Financial Field"},
  ]},
  // 27 Iunie — Grupa J
  {day:27, matches:[
    {home:"Jordan",              homeFlag:"🇯🇴", away:"Argentina",             awayFlag:"🇦🇷", time:"19:00", group:"J", venue:"Arrowhead Stadium"},
    {home:"Algeria",             homeFlag:"🇩🇿", away:"Austria",               awayFlag:"🇦🇹", time:"19:00", group:"J", venue:"AT&T Stadium"},
  ]},

  // ── OPTIMI DE FINALĂ (R16) — 29 Iunie - 4 Iulie ──────────────────────────
  {day:29, matches:[
    {home:"1A",homeFlag:"🏆",away:"2C",awayFlag:"🏆",time:"15:00",group:"R16"},
    {home:"1C",homeFlag:"🏆",away:"2A",awayFlag:"🏆",time:"19:00",group:"R16"},
  ]},
  {day:30, matches:[
    {home:"1B",homeFlag:"🏆",away:"2D",awayFlag:"🏆",time:"15:00",group:"R16"},
    {home:"1D",homeFlag:"🏆",away:"2B",awayFlag:"🏆",time:"19:00",group:"R16"},
  ]},
  {day:31, matches:[
    {home:"1E",homeFlag:"🏆",away:"2G",awayFlag:"🏆",time:"15:00",group:"R16"},
    {home:"1G",homeFlag:"🏆",away:"2E",awayFlag:"🏆",time:"19:00",group:"R16"},
  ]},
  {day:32, matches:[
    {home:"1F",homeFlag:"🏆",away:"2H",awayFlag:"🏆",time:"15:00",group:"R16"},
    {home:"1H",homeFlag:"🏆",away:"2F",awayFlag:"🏆",time:"19:00",group:"R16"},
  ]},
  {day:33, matches:[
    {home:"1I",homeFlag:"🏆",away:"2K",awayFlag:"🏆",time:"15:00",group:"R16"},
    {home:"1K",homeFlag:"🏆",away:"2I",awayFlag:"🏆",time:"19:00",group:"R16"},
  ]},
  {day:34, matches:[
    {home:"1J",homeFlag:"🏆",away:"2L",awayFlag:"🏆",time:"15:00",group:"R16"},
    {home:"1L",homeFlag:"🏆",away:"2J",awayFlag:"🏆",time:"19:00",group:"R16"},
  ]},
  // R16 cu cele mai bune echipe de pe loc 3 (8 echipe)
  {day:35, matches:[
    {home:"1best3",homeFlag:"🏆",away:"2best3",awayFlag:"🏆",time:"15:00",group:"R16"},
    {home:"3best3",homeFlag:"🏆",away:"4best3",awayFlag:"🏆",time:"19:00",group:"R16"},
  ]},
  {day:36, matches:[
    {home:"5best3",homeFlag:"🏆",away:"6best3",awayFlag:"🏆",time:"15:00",group:"R16"},
    {home:"7best3",homeFlag:"🏆",away:"8best3",awayFlag:"🏆",time:"19:00",group:"R16"},
  ]},

  // ── SFERTURI DE FINALĂ — 8-11 Iulie (days 38-41) ─────────────────────────
  {day:38, matches:[
    {home:"W29-1",homeFlag:"🏆",away:"W29-2",awayFlag:"🏆",time:"15:00",group:"QF"},
    {home:"W30-1",homeFlag:"🏆",away:"W30-2",awayFlag:"🏆",time:"19:00",group:"QF"},
  ]},
  {day:39, matches:[
    {home:"W31-1",homeFlag:"🏆",away:"W31-2",awayFlag:"🏆",time:"15:00",group:"QF"},
    {home:"W32-1",homeFlag:"🏆",away:"W32-2",awayFlag:"🏆",time:"19:00",group:"QF"},
  ]},
  {day:40, matches:[
    {home:"W33-1",homeFlag:"🏆",away:"W33-2",awayFlag:"🏆",time:"15:00",group:"QF"},
    {home:"W34-1",homeFlag:"🏆",away:"W34-2",awayFlag:"🏆",time:"19:00",group:"QF"},
  ]},
  {day:41, matches:[
    {home:"W35-1",homeFlag:"🏆",away:"W35-2",awayFlag:"🏆",time:"15:00",group:"QF"},
    {home:"W36-1",homeFlag:"🏆",away:"W36-2",awayFlag:"🏆",time:"19:00",group:"QF"},
  ]},

  // ── SEMIFINALE — 14-15 Iulie (days 44-45) ────────────────────────────────
  {day:44, matches:[
    {home:"QF1",homeFlag:"🏆",away:"QF2",awayFlag:"🏆",time:"19:00",group:"SF"},
    {home:"QF3",homeFlag:"🏆",away:"QF4",awayFlag:"🏆",time:"19:00",group:"SF"},
  ]},
  {day:45, matches:[
    {home:"QF5",homeFlag:"🏆",away:"QF6",awayFlag:"🏆",time:"19:00",group:"SF"},
    {home:"QF7",homeFlag:"🏆",away:"QF8",awayFlag:"🏆",time:"19:00",group:"SF"},
  ]},

  // ── FINALA MICĂ — 18 Iulie (day 48) ──────────────────────────────────────
  {day:48, matches:[
    {home:"SF L1",homeFlag:"🥉",away:"SF L2",awayFlag:"🥉",time:"15:00",group:"3rd"},
    {home:"SF L3",homeFlag:"🥉",away:"SF L4",awayFlag:"🥉",time:"19:00",group:"3rd"},
  ]},

  // ── FINALA — 19 Iulie (day 49) ────────────────────────────────────────────
  {day:49, matches:[
    {home:"SF W1",homeFlag:"🏆",away:"SF W2",awayFlag:"🏆",time:"19:00",group:"Final"},
  ]},
];
