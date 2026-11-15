/* =====================================================================
   KATRINA SIMULATION · ALL TEXTS AND GAME VALUES
   Edit this file to change what players and the projector see.
   Rules for editing:
   - Keep the quotes and commas. Typographic apostrophes (’) are safe.
   - {money} inside a text is replaced by the money the person has left.
   - kind: 'real' = From the real story, 'game' = Game detail (fictional),
           'composite' = Composite, based on neighbourhood data.
   - A choice: id (unique), t (button text), cost ($), lock (reason it is
     impossible), lockKind, c (what happens to you), loc (new location),
     food / ethel / strength (change), wait (hours waited, game estimate),
     minStrength (locked below this), weakLock (reason), img (media key),
     end (ending id, last round only).
   - A text in "hear" or "ticker" can be {t:'...', false:'correction'}:
     the fate screen then lists it as a rumour that turned out false.
   ===================================================================== */

window.KATRINA = {

meta: {
  title: 'Katrina: Four People, One Storm',
  eyebrow: 'Hurricane Katrina · 27 August to 2 September 2005',
  instruction: 'Your group plays one person through the whole disaster. Pick the person you were given.',
  gameValues: 'Money, food and strength are game values, set to fit each person’s situation. They are not historical figures.',
  timerSeconds: 120,
  timeUp: 'Time is up. In reality there was no time to think either.',
  waitBox: 'Now look at the main screen. What happened in the city.',
  question: 'Who really had a choice? Was it money, health, a car, or the colour of their skin?',
  // Put the final public address here after deployment (used on the projector title slide)
  publicUrl: 'https://codingamateur1705.github.io/katrina-sim/',
  sources: 'Sources. U.S. House of Representatives (2006), A Failure of Initiative, pp. 106 to 114. U.S. Senate (2006), A Nation Still Unprepared, pp. 249 to 250. Associated Press via NBC News (2005, 2006) on Ethel Freeman. Lessin and Deal (2008), Trouble the Water. Horowitz (2020), Katrina, A History, chapters 4 and 5. USACE IPET (2006). Houston Chronicle (2005) on Jabbar Gibson. Money, food and strength are game values. Webster, Adelson, Hammer and Chou (2022), ProPublica, on Rita Legrand.'
},

/* Labels for tags shown next to constraints, cards and locked reasons */
lens: { intentional: 'Intentional racism', structural: 'Structural racism', class: 'Classism' },

kinds: {
  real: 'From the real story',
  game: 'Game detail',
  composite: 'Composite'
},

/* Where a person can be. inCity: food goes down each round. strain: strength lost each round there. */
locations: {
  home:     { label: 'At home',            inCity: true,  strain: 0 },
  upstairs: { label: 'Upstairs at home',   inCity: true,  strain: 1 },
  attic:    { label: 'In the attic',       inCity: true,  strain: 1 },
  roof:     { label: 'On the roof',        inCity: true,  strain: 1 },
  house:    { label: 'Neighbour’s house',  inCity: true,  strain: 1 },
  dome:     { label: 'Superdome',          inCity: true,  strain: 1 },
  cc:       { label: 'Convention Center',  inCity: true,  strain: 1 },
  out:      { label: 'Out of the city',    inCity: false, strain: 0 },
  command:  { label: 'Command post',       inCity: false, strain: 1 }
},

strengthLabels: ['Collapsing', 'Very weak', 'Exhausted', 'Tired', 'OK', 'Strong'],
ethelLabels: ['critical', 'very weak', 'weak', 'stable'],

/* Photos and videos. Every file is listed with its licence in CREDITS.md */
media: {
  title:      { src: 'img/title.jpg',           credit: 'PA2 Kyle Niemi, U.S. Coast Guard, 29 August 2005, public domain' },
  sat:        { src: 'img/sat.jpg',             credit: 'Jeff Schmaltz, MODIS, NASA, 28 August 2005, public domain' },
  satVideo:   { src: 'img/r1-satellite-poster.jpg', video: 'video/r1-satellite.mp4', credit: 'NASA GSFC, NOAA GOES data, 28 to 29 August 2005, public domain' },
  dome:       { src: 'img/dome.jpg',            credit: 'Marty Bahamonde, FEMA, 28 August 2005, public domain' },
  domeLine:   { src: 'img/superdome-line.jpg',  credit: 'Marty Bahamonde, FEMA, 28 August 2005, public domain' },
  domeWater:  { src: 'img/superdome-water.jpg', credit: 'Jh12, 31 August 2005, CC BY 2.5' },
  flood:      { src: 'img/flood.jpg',           credit: 'Paul Morse, The White House, 2005, public domain' },
  levee:      { src: 'img/levee.jpg',           credit: 'FEMA, levee breach, New Orleans, 2005, public domain' },
  sandbags:   { src: 'img/sandbags.jpg',        credit: 'U.S. Navy, 7 September 2005, public domain' },
  rescue:     { src: 'img/rescue.jpg',          credit: 'U.S. Navy, 5 September 2005, public domain' },
  cgVideo:    { src: 'img/r3-coastguard-poster.jpg', video: 'video/r3-coastguard.mp4', credit: 'U.S. Coast Guard, rooftop rescue, 2005, public domain' },
  roofRescue: { src: 'img/roof-rescue.jpg',     credit: 'U.S. Navy, 2 September 2005, public domain' },
  helicopter: { src: 'img/helicopter.jpg',      credit: 'U.S. Navy, 5 September 2005, public domain' },
  cc:         { src: 'img/cc.jpg',              credit: 'Liz Roll, FEMA, September 2005, public domain' },
  buses:      { src: 'img/buses.jpg',           credit: 'Jocelyn Augustino, FEMA, 7 September 2005, public domain' },
  busEvac:    { src: 'img/bus-evacuation.jpg',  credit: 'Win Henderson, FEMA, 31 August 2005, public domain' },
  astrodome:  { src: 'img/astrodome.jpg',       credit: 'Ed Edahl, FEMA, Houston, 2 September 2005, public domain' },
  soldiers:   { src: 'img/soldiers.jpg',        credit: 'Sgt. Michael J. Carden, U.S. Army, 4 September 2005, public domain' },
  portraitNagin: { src: 'img/portrait-nagin-licensed.jpg', credit: 'Photo licensed by the group' },
  portraitNaginFema: { src: 'img/portrait-nagin.jpg', credit: 'Jocelyn Augustino, FEMA, September 2005, public domain' },
  portraitKim: { src: 'img/portrait-kim.jpg', credit: 'Photo licensed by the group' },
  ninth:      { src: 'img/ninth-ward.jpg',      credit: 'Marvin Nauman, FEMA, Ninth Ward, September 2005, public domain' }
},

/* ---------------------------------------------------------------------
   THE FOUR ROUNDS (shared by all people)
   know = "What you know" (projector, before deciding)
   happened = "What happened in the city" (projector, after deciding)
   ticker = breaking news line at the top of the round on the phones
   --------------------------------------------------------------------- */
rounds: [
  {
    n: 1, when: 'Saturday and Sunday, 27 to 28 August', short: '27 to 28 Aug', days: 2, nights: 1,
    ask: 'Imagine it is Saturday, 27 August, noon. What do you do over the weekend?',
    media: 'satVideo', knowMedia: 'sat', happenedMedia: 'dome',
    ticker: [
      { t: 'Katrina is a Category 3 in the Gulf' },
      { t: 'Forecast: landfall on Monday morning' },
      { t: 'TV: “It could still turn, like Ivan last year”' },
      { t: 'Traffic is already heavy on I-10' }
    ],
    know: ['Katrina is a Category 3 in the Gulf', 'Forecast: landfall on Monday morning', 'Last year everyone fled Hurricane Ivan, and it missed the city'],
    happened: ['Saturday · only a voluntary evacuation', 'Sunday · Katrina reaches Category 5', 'Sunday morning · the first mandatory evacuation, about 20 hours before landfall', 'Buses run only to the Superdome. More than 70,000 people stay'],
    notes: 'Open point: the House report (p. 109) gives the time of Sunday’s mandatory order. Most timelines (Senate report, National Geographic, FactCheck.org) say 9.30, one says 11, so the slide says “Sunday morning” and “about 20 hours”.'
  },
  {
    n: 2, when: 'Monday, 29 August', short: '29 Aug', days: 1, nights: 1,
    dome: ['About 10,000 people are inside when the storm hits', 'The wind tears holes in the roof. Rain pours in', 'The power fails. No air conditioning in the August heat', 'You were told to bring your own food for days'],
    ask: 'It is Monday, 29 August, early morning. The storm is coming ashore. What do you do?',
    media: 'flood', knowMedia: 'flood', happenedMedia: 'levee', sound: true,
    ticker: [
      { t: 'Katrina comes ashore around dawn' },
      { t: 'Power fails across the city' },
      { t: 'Thousands in the Superdome, many more at home' },
      { t: 'TV: “New Orleans dodged the bullet”', false: 'Misleading. Levees and floodwalls were already breaking. By Tuesday 80 % of the city was under water.' }
    ],
    know: ['The storm comes ashore around dawn', 'Power fails across the city', 'Thousands are in the Superdome, many more at home'],
    happened: ['Landfall at dawn as a Category 3', 'The Industrial Canal floodwall breaks. The Lower Ninth floods fast', 'The 17th Street and London Avenue canals break. Lakeview and Gentilly flood', 'About 50 breaches. Some floodwalls fail below their design height'],
    notes: 'Source for the breaches: USACE IPET (2006).'
  },
  {
    n: 3, when: 'Tuesday and Wednesday, 30 to 31 August', short: '30 to 31 Aug', days: 2, nights: 2,
    dome: ['The toilets overflow. The smell is everywhere', 'Water and food come in small, irregular handouts', 'People sleep on concrete floors and plastic seats', 'Nobody tells you when or where the buses will come', 'Rumours of violence spread through the crowd'],
    ask: 'It is Tuesday, 30 August. What do you do now?',
    media: 'cgVideo', knowMedia: 'roofRescue', happenedMedia: 'rescue',
    ticker: [
      { t: '80 % of the city is under water' },
      { t: 'No power, no phones, no clean water' },
      { t: 'TV: “Snipers shooting at rescue helicopters”', false: 'Turned out false.' },
      { t: 'TV: “Rapes and murders in the Superdome”', false: 'Turned out false. Recorded dead: 6 inside the Superdome, 4 at the Convention Center.' }
    ],
    know: ['80 % of the city is under water', 'No power, no phones, no clean water', 'Thousands wait on roofs, in attics and in shelters'],
    happened: ['Boats and helicopters pull thousands off roofs', 'Thousands gather at the Convention Center, never an official shelter', 'FEMA promises 500 buses. They do not come for days', 'TV spreads rumours of snipers, rapes and murders'],
    notes: 'Death figures for the Superdome and Convention Center are taken from our deck (slide 28: Sommers et al. 2006; Horowitz 2020).'
  },
  {
    n: 4, when: 'Thursday and Friday, 1 to 2 September', short: '1 to 2 Sep', days: 2, nights: 2,
    dome: ['23,000 people are inside. No food, water or medical care', 'The lines for the buses last for hours in the heat', 'People near you are sick, old or in wheelchairs, with no care'],
    ask: 'It is Thursday, 1 September. What do you do?',
    media: 'cc', knowMedia: 'cc', happenedMedia: 'soldiers',
    ticker: [
      { t: '23,000 people in the Superdome, 19,000 at the Convention Center' },
      { t: 'No food, water or medical care' },
      { t: 'At the Convention Center the promised buses still have not come' },
      { t: 'Governor Blanco: the troops “know how to shoot and kill”' }
    ],
    know: ['23,000 people in the Superdome, 19,000 at the Convention Center', 'No food, water or medical care', 'At the Convention Center the promised buses still have not come'],
    happened: ['Gretna police block the bridge out of the city', 'White vigilantes shoot Black men walking to safety at Algiers Point', 'The mayor on WWL radio says federal officials “don’t have a clue”', 'Friday · supply convoys and buses finally arrive'],
    notes: 'Sources: Horowitz (2020), ch. 4; WWL radio interview, 1 September 2005.'
  }
],

/* Order of the buttons on the first screen and seats from the deck */
order: ['mayor', 'herbert', 'kim', 'lake'],

people: {

/* =====================================================================
   1. THE MAYOR
   ===================================================================== */
mayor: {
  profile: {
    portrait: 'portraitNagin', initials: 'RN',
    facts: [
      { label: 'Who', value: 'Ray Nagin, mayor of New Orleans since 2002' },
      { label: 'Before', value: 'A former cable TV executive' },
      { label: 'Power', value: 'Only you can order a mandatory evacuation' },
      { label: 'Job this week', value: 'Run the city’s emergency plan' }
    ]
  },
  name: 'The Mayor', fullName: 'Ray Nagin', firstName: 'the Mayor', sub: 'Ray Nagin, decides for the city',
  color: '#1F5F35', seat: 'Front left', composite: false,
  intro: 'You are the mayor of New Orleans, in office since 2002 and a former cable TV executive. Only you can order a mandatory evacuation, and you run the city’s emergency plan.',
  fixedChips: [{ t: '372 buses' }, { t: '~100 drivers' }, { t: '0 shelters outside', bad: true }],
  start: { loc: 'command', strength: 5 },
  track: { money: false, food: false, ethel: false },
  constraints: [
    { t: 'You cannot force anyone to leave', kind: 'real' },
    { t: 'About 100,000 residents have no car', kind: 'real' },
    { t: '372 city buses, but only about 100 drivers', kind: 'real' },
    { t: 'No shelter outside the city will take people', kind: 'real' },
    { t: 'Closing the city costs businesses millions, and your lawyers fear lawsuits', kind: 'real' },
    { t: 'Last year everyone fled Hurricane Ivan, and it missed the city', kind: 'real' },
    { t: 'It is the end of the month. Many residents have no money left for gas', kind: 'real' },
    { t: 'In July 2004 the Hurricane Pam exercise expected 100,000 people without cars', kind: 'real' },
    { t: 'The state plan says to wait until about 30 hours before landfall before ordering a mandatory evacuation', kind: 'real' },
    { t: 'You will barely sleep this week. Strength drops every round', kind: 'game' }
  ],
  real: 'On Saturday he called only a voluntary evacuation. On Sunday, about 20 hours before landfall, he ordered the first mandatory evacuation in the city’s history. Bus offers were turned down and buses went only to the Superdome. More than 70,000 people stayed. On Thursday night he made an angry radio appeal for federal help on WWL.',
  realPath: ['m1_vol', 'm2_fema', 'm3_demand', 'm4_radio'],
  realRows: ['Voluntary first, mandatory 20 hours before landfall', 'Asks state and FEMA for help, radios down', 'Thousands at the Convention Center, no supplies', 'Angry radio appeal for help'],
  realStats: [
    { label: 'Mandatory order', value: 'about 20 hours before landfall' },
    { label: 'People who stayed in the city', value: 'More than 70,000' },
    { label: 'Buses and drivers', value: '372 buses, about 100 drivers' },
    { label: 'Federal buses promised', value: '500, they did not come for days' }
  ],
  rounds: [
    { '*': {
      sit: 'Katrina is a Category 3 in the Gulf, and forecasters expect it to grow. Landfall is about 42 hours away.',
      hear: ['Hotels and businesses: “A false alarm costs us millions.”', 'City lawyers: “Closing businesses could get the city sued.”', 'Ivan last year: hours of traffic, then nothing'],
      card: { t: 'A hotel association calls. They ask you to wait before you close the city.', kind: 'game' },
      choices: [
        { id: 'm1_mand_dome', pull: { lens: 'structural', t: 'The state plan told you to wait until about 30 hours before landfall, and your lawyers warned of lawsuits from closed businesses. Ordering now means breaking both.', kind: 'real', strength: -1 }, t: 'Mandatory evacuation today, buses to the Superdome', img: 'domeLine', legacy: 'You gave people a full extra day, but residents without cars still had only the Superdome.',
          c: 'People get a full extra day. Plaquemines and St. Charles did this a day earlier, on Saturday. But your 100,000 residents without cars still have no way out of the city.' },
        { id: 'm1_vol', t: 'Voluntary today, mandatory tomorrow, buses to the Superdome', img: 'dome', legacy: 'Your order came when landfall was less than a day away.',
          c: 'Many leave, many do not take it seriously. When the order comes, landfall is less than a day away.' },
        { id: 'm1_buses_out', surprise: { t: 'Half of the drivers you call have already left the city with their families.', kind: 'game', strength: -1 }, pull: { lens: 'structural', t: 'The city plan sent carless residents to the Superdome, not out of the region. No shelter outside had agreed to take them, so the buses have nowhere to go.', kind: 'game' }, t: 'Mandatory today, buses out of the city', img: 'busEvac', legacy: 'A few bus trips left. Most people without cars were still in the city.',
          c: 'About 100 drivers means about 4,000 seats per trip, and no shelter outside will take people. A few trips leave before the wind closes the roads.' },
        { id: 'm1_wait', pull: { t: 'By Sunday morning the hurricane center is forecasting an 18 to 22 foot surge and the President is pressing for a mandatory order. Waiting any longer is not an option anyone will accept.', kind: 'real' }, t: 'Wait for the next forecast', legacy: 'You lost a whole day the city never got back.',
          c: 'By Sunday morning Katrina is a Category 5. You have lost a whole day.' }
      ]
    } },
    { '*': {
      sit: 'The storm hits. Reports of breaking levees come in. Power is out and phones barely work.',
      hear: ['Police radio: “Water in the Lower Ninth, rising fast”', { t: 'TV: “New Orleans dodged the bullet”', false: 'Misleading. Levees and floodwalls were already breaking. By Tuesday 80 % of the city was under water.' }],
      card: { t: 'A third of your police radios do not work.', kind: 'game' },
      choices: [
        { id: 'm2_rescue', surprise: { t: 'Some of your officers cannot be reached at all.', kind: 'game' }, pull: { lens: 'structural', t: 'Without boats and with a third of your radios dead, your officers can only reach a few streets. Only the state and FEMA can send boats, buses and troops in numbers.', kind: 'game' }, t: 'Send police and firefighters to rescue people', img: 'helicopter',
          c: 'Many of your own officers have lost their homes, and radios are down. Rescue is slow and patchy.' },
        { id: 'm2_fema', surprise: { t: 'The phone and fax lines to the state go dead for hours. Your request waits in a queue.', kind: 'game' }, t: 'Ask the state and FEMA for buses, boats and troops', img: 'sandbags',
          c: 'Your request goes into a system that waits for formal paperwork. Help is days away.' },
        { id: 'm2_cc', pull: { lens: 'structural', t: 'The Convention Center has no food, water or staff. Only the state and FEMA can change that, so asking them is where this path ends up anyway.', kind: 'game' }, t: 'Tell people to go to the Convention Center', img: 'cc',
          c: 'Thousands go. But you have no food, water or staff to send there.' }
      ]
    } },
    { '*': {
      sit: '80 % of the city is under water. Thousands wait at the Superdome and the Convention Center.',
      hear: [{ t: 'TV: “Snipers shooting at rescue helicopters”', false: 'Turned out false.' }, { t: 'TV: “Looting and murders in the Superdome”', false: 'Turned out false. Recorded dead: 6 inside the Superdome, 4 at the Convention Center.' }],
      card: { t: 'You cannot reach FEMA by phone for hours.', kind: 'game' },
      choices: [
        { id: 'm3_police', pull: { lens: 'structural', t: 'Whatever you do on the ground, about 40,000 people can only leave by bus, and only FEMA can send them. Your calls go unanswered, so the demand ends up in public.', kind: 'game' }, t: 'Pull police off rescue to stop looting', img: 'soldiers',
          c: 'Stores are guarded, but fewer boats are out rescuing people.' },
        { id: 'm3_rescue', pull: { lens: 'structural', t: 'Rescue continues, but the crowds still need buses, and only FEMA can send them. Your calls go unanswered, so the demand ends up in public.', kind: 'game' }, t: 'Keep everyone on rescue', img: 'rescue',
          c: 'More people are pulled off roofs, but the rumours keep spreading.' },
        { id: 'm3_demand', surprise: { t: 'Every time you call, the buses are “on their way”.', kind: 'game', strength: -1 }, t: 'Publicly demand federal buses', img: 'buses',
          c: 'Federal officials promise 500 buses. They do not come for days.' }
      ]
    } },
    { '*': {
      sit: '23,000 people in the Superdome, 19,000 at the Convention Center. No food, no water, no buses.',
      hear: ['Governor Blanco: the troops “know how to shoot and kill”'],
      card: { t: 'A journalist asks you live on air why there are still people on roofs.', kind: 'game' },
      choices: [
        { id: 'm4_radio', t: 'Go on the radio and demand help', end: 'm_radio' },
        { id: 'm4_quiet', pull: { lens: 'structural', t: 'By Thursday phones are dead and quiet talks have produced no buses. A public appeal is the only channel left that reaches Washington.', kind: 'game' }, t: 'Negotiate quietly with the state and FEMA', end: 'm_quiet' },
        { id: 'm4_bridge', pull: { lens: 'intentional', t: 'On Thursday night Gretna police really did close the bridge and turned evacuees back.', kind: 'real' }, t: 'Tell people to walk out over the bridge', end: 'm_bridge' }
      ]
    } }
  ]
},

/* =====================================================================
   2. HERBERT FREEMAN JR.
   ===================================================================== */
herbert: {
  profile: {
    portrait: null, initials: 'HF',
    facts: [
      { label: 'Who', value: 'Herbert Freeman Jr., son and full-time carer' },
      { label: 'Family', value: 'Your mother Ethel Freeman, 91' },
      { label: 'Ethel', value: 'Blind, both hips broken, fed through a tube' },
      { label: 'Every day', value: 'You care for her yourself' }
    ]
  },
  name: 'Herbert Freeman Jr.', firstName: 'Herbert Freeman Jr.', sub: 'Black, cares for his mother Ethel, 91',
  color: '#1F5F35', seat: 'Front right', composite: false,
  intro: 'You live with your mother Ethel and care for her every day. She is 91, blind, has broken both hips and is fed through a tube.',
  carChip: { t: 'No car for her wheelchair', bad: true },
  start: { loc: 'home', money: 150, food: 2, ethel: 3, strength: 5 },
  track: { money: true, food: true, ethel: true },
  locLabels: { roof: 'At the window, waiting' },
  constraints: [
    { t: 'Ethel cannot sit in a car for hours', kind: 'real' },
    { t: 'No car that can carry her wheelchair', kind: 'real' },
    { t: 'No relatives outside the city', kind: 'real' },
    { t: '$150 to last the rest of the month', kind: 'game' },
    { t: 'Ethel’s feeding supplies last 2 days', kind: 'game' },
    { t: 'Ethel’s feeding pump needs electricity', kind: 'game' },
    { t: 'About 27 % of New Orleans households have no car, and the evacuation plan relies on cars', kind: 'real' },
    { t: 'The Superdome is a shelter of last resort. You must bring your own food, water and medicine', kind: 'real' }
  ],
  real: 'He judged it too dangerous to move his mother and stayed. On Tuesday a neighbour’s boat took them to the Convention Center, where a police officer told him to wait outside, help would come in an hour or two. Ethel Freeman died in her wheelchair on 1 September. When the buses finally came, he had to leave her body behind.',
  /* Shown when Herbert leaves the city, and on the fate screen under "Can you come back?" */
  leaving: [
    { t: 'No relatives outside the city, so nobody is waiting for you', kind: 'real' },
    { t: 'Every night away costs money you do not have', kind: 'game' },
    { t: 'Ethel needs a hospital bed, not a cot in a shelter', kind: 'game' }
  ],
  returning: [
    { t: 'Your house stood in floodwater for days. Walls and floors must be torn out', kind: 'game' },
    { t: 'Rebuilding grants were the lower of repair cost or pre-storm value, so cheaper houses got less', kind: 'real' },
    { t: 'No relatives to stay with while you rebuild', kind: 'real' },
    { t: 'You have {money} left', kind: 'game' }
  ],
  returnFact: '119,076 fewer Black residents lived in New Orleans in 2010 than in 2000.',
  realPath: ['h1_stay', 'h2_boat', 'h3_wait', 'h4_wait'],
  realRows: ['Stays home, moving Ethel seems too risky', 'Water rises around the house', 'Neighbour’s boat to the Convention Center, told to wait outside', 'Ethel dies in her wheelchair, waiting'],
  realStats: [
    { label: 'Reached the Convention Center', value: 'Tuesday, 30 August, by a neighbour’s boat' },
    { label: 'Told by a police officer', value: 'Help would come “in an hour or two”' },
    { label: 'Ethel Freeman died', value: 'Thursday, 1 September, in her wheelchair' },
    { label: 'When the buses came', value: 'He had to leave her body behind' }
  ],
  rounds: [
    { '*': {
      sit: 'A hurricane may hit on Monday. Ethel needs her feeding tube and cannot be moved easily.',
      hear: ['TV: “It could still turn, like Ivan last year”', 'Neighbour: “Moving her could kill her”', 'Radio: “The Superdome is a shelter of last resort, bring your own food”'],
      card: { t: 'You call a hospital. They tell you they take emergencies only.', kind: 'game' },
      choices: [
        { id: 'h1_drive', t: 'Drive her out of the city', lock: 'No car that can carry her wheelchair, and no relatives outside the city', lockKind: 'real' },
        { id: 'h1_amb', t: 'Hire a private ambulance', cost: 1200, lock: 'Booked out. Every private ambulance is taken, and one costs $1,200. You have $150', lockKind: 'game', loc: 'out', c: 'An ambulance takes you both out of the city.' },
        { id: 'h1_dome', pull: { lens: 'structural', t: 'The Superdome opens as a shelter of last resort. You were told to bring your own food and medicine, and there is no power for Ethel’s pump.', kind: 'game' }, t: 'Take her to the Superdome on Sunday', loc: 'dome', ethel: -1, strength: -1, wait: 6, img: 'domeLine',
          c: 'Hours in line in the heat. Inside there is almost no medical care for someone who is tube-fed.' },
        { id: 'h1_stay', surprise: { t: 'The pharmacy has sold out of Ethel’s feeding formula. You find a smaller supply at a second store across town.', kind: 'game', strength: -1 }, t: 'Buy food and supplies, stay with her', cost: 80, food: 3, loc: 'home',
          c: 'You buy food, water and feeding supplies for several days. {money} is left.' }
      ]
    } },
    {
      _card: { t: 'Ethel’s feeding pump needs electricity. The power is out.', kind: 'game', ethel: -1 },
      home: {
        sit: 'The wind tears at the roof and the power is gone. By noon water is rising in the street.',
        hear: ['Battery radio: “Levee breaks reported”'],
        choices: [
          { id: 'h2_up', pull: { lens: 'class', t: 'On Tuesday a neighbour with a boat comes by.', kind: 'real' }, t: 'Move Ethel upstairs and wait', loc: 'upstairs', strength: -1, c: 'The water keeps rising. Nobody knows you are there.' },
          { id: 'h2_boat', surprise: { t: 'The boat is full on the first trip. The neighbour comes back for you hours later.', kind: 'game', wait: 6 }, t: 'Ask the neighbour with a boat to take you to dry ground', loc: 'cc', ethel: -1, wait: 20, img: 'cc',
            c: 'He can only go once the wind drops. On Tuesday he takes you to the Convention Center. An officer tells you to wait outside, help will come in an hour or two.' },
          { id: 'h2_911', pull: { lens: 'structural', t: 'Nobody answers. On Tuesday a neighbour with a boat comes by.', kind: 'real' }, t: 'Call 911', loc: 'upstairs', strength: -1, c: 'The lines are dead. Phones and power are down across the city. As the water rises, you carry Ethel upstairs.' },
          { id: 'h2_leave', t: 'Leave the city with Ethel', lock: 'The storm has closed the roads. No car can carry her wheelchair', lockKind: 'game' }
        ]
      },
      dome: {
        sit: 'Wind tears holes in the Superdome roof. The power fails. About 10,000 people are inside.',
        hear: ['People around you: “The water is coming into the city”'],
        choices: [
          { id: 'h2_dstay', surprise: { t: 'A section of the roof tears open above your seats. You move Ethel in the dark.', kind: 'game', strength: -1 }, pull: { lens: 'structural', t: 'The Dome is already crowded and hot. Ethel cannot be given a proper bed or her pump.', kind: 'game' }, t: 'Stay inside with Ethel', loc: 'dome', c: 'Heat and darkness. The toilets stop working.' },
          { id: 'h2_doc', pull: { lens: 'structural', t: 'The few medical staff in the Dome are overwhelmed.', kind: 'game' }, t: 'Ask the National Guard for a doctor', loc: 'dome', wait: 5, c: 'The few medical staff are overwhelmed. They can do little for her.' },
          { id: 'h2_dleave', t: 'Leave the Superdome for a shelter outside the city', lock: 'The doors stay shut during the storm. No buses run', lockKind: 'game' }
        ]
      }
    },
    {
      _card: { t: 'Ethel has a fever.', kind: 'game', ethel: -1 },
      upstairs: {
        sit: 'The first floor is under water. Ethel’s supplies are running out.',
        hear: ['Nothing. No power, no phone.'],
        choices: [
          { id: 'h3_sheet', pull: { lens: 'class', t: 'Many waited for days at windows and on roofs, and rescuers could only reach the people they could see.', kind: 'game' }, t: 'Hang a sheet from the window and wait', loc: 'roof', ethel: -1, wait: 24, img: 'helicopter', c: 'You wait in the heat for a boat or a helicopter.' },
          { id: 'h3_boat', pull: { lens: 'class', t: 'The Convention Center is the only dry ground the boat can reach.', kind: 'real' }, t: 'Go with the neighbour’s boat to the Convention Center', loc: 'cc', ethel: -1, img: 'cc', c: 'You reach dry ground. An officer tells you to wait outside, help will come in an hour or two.' },
          { id: 'h3_leave', t: 'Get out of the city', lock: 'Water all around the house. No car, no boat of your own', lockKind: 'game' }
        ]
      },
      cc: {
        sit: 'Thousands wait at the Convention Center. No food, no water, no doctors. It was never an official shelter.',
        hear: [{ t: 'TV and crowd: “Snipers”, “murders”, “gangs”', false: 'Turned out false.' }, { t: 'An officer: “Buses in an hour or two”', false: 'The buses did not come for days.' }],
        choices: [
          { id: 'h3_wait', surprise: { t: 'Someone says the buses will stop at another corner. You push Ethel there. Nothing comes.', kind: 'game', strength: -1 }, t: 'Wait outside as you were told', loc: 'cc', ethel: -1, strength: -1, wait: 24, c: 'Hours pass in the heat. No buses come.' },
          { id: 'h3_doc', pull: { lens: 'structural', t: 'There is no medical care in the crowd to find. Everyone is looking for the same help.', kind: 'game' }, t: 'Look for a doctor in the crowd', loc: 'cc', strength: -1, c: 'There is no medical care to find.' },
          { id: 'h3_cleave', t: 'Walk out of the city with Ethel', lock: 'Ethel cannot walk, and nobody tells you where to go', lockKind: 'game' }
        ]
      },
      dome: {
        sit: 'Day three in the Superdome. Heat, broken toilets, too little water.',
        hear: [{ t: 'TV: “Rapes and murders in the Superdome”', false: 'Turned out false. Recorded dead: 6 inside the Superdome, 4 at the Convention Center.' }],
        choices: [
          { id: 'h3_dstay', surprise: { t: 'The water handout runs out before you reach the front of the line.', kind: 'game', food: -1 }, pull: { lens: 'structural', t: 'Superdome evacuees were bused out from Wednesday evening, but the lines were long and the buses slow.', kind: 'real' }, t: 'Stay and wait for buses', loc: 'dome', ethel: -1, wait: 24, img: 'domeWater', c: 'The first buses to Houston start to leave on Wednesday.' },
          { id: 'h3_tocc', pull: { lens: 'structural', t: 'The Convention Center was never prepared as a shelter and nothing is waiting there.', kind: 'game' }, t: 'Leave for the Convention Center', loc: 'cc', ethel: -1, strength: -1, img: 'cc', c: 'It is no better there.' },
          { id: 'h3_dleave', t: 'Get on the first bus out', lock: 'Booked out. The first buses fill up long before you reach the doors', lockKind: 'game' }
        ]
      }
    },
    {
      _card: { t: 'Your phone battery died on Tuesday. Nobody outside the city knows where you are.', kind: 'game' },
      cc: {
        sit: 'Ethel has been in her wheelchair in the heat for a day.',
        hear: ['Rumour: “Buses are coming tomorrow”'],
        choices: [
          { id: 'h4_wait', t: 'Wait for the buses', ethel: -1, wait: 48, end: 'h_wait' },
          { id: 'h4_bridge', pull: { lens: 'intentional', t: 'Gretna police really did close the bridge on Thursday night and turned evacuees back.', kind: 'real' }, t: 'Push her toward the bridge out of the city', ethel: -1, strength: -1, minStrength: 2, weakLock: 'You are too exhausted to push her wheelchair that far', end: 'bridge' },
          { id: 'h4_ride', surprise: { t: 'At the last minute the driver doubles the price. You hand over almost everything you have left.', kind: 'game', cost: 40 }, pull: { lens: 'class', t: 'Few drivers are willing to take a wheelchair and a tube-fed patient. Those who are charge more than you have.', kind: 'game' }, t: 'Pay a stranger with a car to drive you out', cost: 100, loc: 'out', end: 'paid_ride' }
        ]
      },
      roof: {
        sit: 'Day four at the window.',
        hear: ['The sound of helicopters'],
        choices: [
          { id: 'h4_signal', pull: { lens: 'structural', t: 'Helicopters mostly look for people they can see from the air. Rescue is slow and patchy.', kind: 'game' }, t: 'Signal a helicopter', end: 'rescued' },
          { id: 'h4_keep', pull: { lens: 'class', t: 'Waiting at a window with a tube-fed patient and no power is what many older residents did.', kind: 'game' }, t: 'Keep waiting', wait: 48, end: 'waiting' }
        ]
      },
      dome: {
        sit: 'Buses finally take people to Houston.',
        hear: [],
        choices: [
          { id: 'h4_bus', surprise: { t: 'The first buses fill up before you reach the front. Wheelchairs go last. You wait another night.', kind: 'game', wait: 12, ethel: -1 }, t: 'Get Ethel on a bus to Houston', ethel: -1, loc: 'out', end: 'houston' }
        ]
      }
    }
  ]
},

/* =====================================================================
   3. KIMBERLY ROBERTS
   ===================================================================== */
kim: {
  profile: {
    portrait: 'portraitKim', initials: 'KR',
    facts: [
      { label: 'Who', value: 'Kimberly Roberts, 24' },
      { label: 'Home', value: 'Lower Ninth Ward, with your husband Scott' },
      { label: 'Dream', value: 'To make it as a rapper' },
      { label: 'Right now', value: 'Car stolen two weeks ago. Payday is days away' }
    ]
  },
  name: 'Kimberly Roberts, 24', firstName: 'Kimberly Roberts', sub: 'Black, Lower Ninth Ward, no car',
  color: '#1F5F35', seat: 'Back left', composite: false,
  intro: 'You live in the Lower Ninth Ward with your husband Scott and want to be a rapper. Your car was stolen two weeks ago. It is the end of the month and payday is days away.',
  carChip: { t: 'No car', bad: true },
  start: { loc: 'home', money: 60, food: 1, strength: 5 },
  track: { money: true, food: true, ethel: false },
  constraints: [
    { t: 'No car. Yours was stolen two weeks ago', kind: 'real' },
    { t: '$60 until payday, no credit card', kind: 'game' },
    { t: 'All your family lives in the Ninth Ward', kind: 'real' },
    { t: 'Food at home for 1 day', kind: 'game' },
    { t: 'Your phone has no credit left', kind: 'game' },
    { t: 'Your neighbourhood is 98 % Black and bordered by water on three sides', kind: 'real' },
    { t: 'Among poor Black households 52 % have no car, against 17 % of poor white households', kind: 'real' },
    { t: 'Older neighbours remember Betsy in 1965, when the Lower Ninth flooded and help came as loans, not grants', kind: 'real' }
  ],
  real: 'The rental company refused her a car, so she stayed with Scott and filmed her street on a 20 dollar camcorder. When the Industrial Canal broke they fled to the attic, then swam to a neighbour’s two-storey house and waited two days with no help. When they walked to the Navy base for food and water, armed guards turned them away at gunpoint. They were evacuated days later. Her film became the documentary “Trouble the Water” (2008).',
  /* Shown when Kimberly leaves the city, and on the fate screen under "Can you come back?" */
  leaving: [
    { t: 'You arrive with {money} and nowhere to stay', kind: 'game' },
    { t: 'Your family is scattered and your phone has no credit', kind: 'game' },
    { t: 'Your papers stayed in the flooded house', kind: 'game' }
  ],
  returning: [
    { t: 'Your street in the Lower Ninth is gutted or gone', kind: 'game' },
    { t: 'Grants followed pre-storm house value. The funding gap per home was about $31,000 larger in the Lower Ninth', kind: 'real' },
    { t: 'Your family is spread over several states', kind: 'game' },
    { t: 'You have {money} left and no insurance payout coming', kind: 'game' }
  ],
  returnFact: 'About 37 % of Lower Ninth households were back after ten years.',
  realPath: ['k1_stay', 'k2_attic', 'k3_swim', 'k4_navy'],
  realRows: ['Rental car refused, stays and films', 'Canal breaks, flees to the attic', 'Swims to a neighbour’s house, no help for two days', 'Turned away at gunpoint at the Navy base'],
  realStats: [
    { label: 'Waited in a neighbour’s house', value: 'Two days, with no help' },
    { label: 'At the Navy base', value: 'Turned away at gunpoint' },
    { label: 'Evacuated', value: 'Days later' },
    { label: 'Her camera', value: 'A 20 dollar camcorder. The film became “Trouble the Water” (2008)' }
  ],
  rounds: [
    { '*': {
      sit: 'A hurricane may hit on Monday. You have {money} and no car.',
      hear: ['Radio: “The storm may still turn east”', 'Neighbours: “In Betsy they bombed the levee to save the rich parts”', 'Scott: “We’ve ridden out storms before”'],
      card: { t: 'Scott wants to stay to protect the house.', kind: 'game' },
      choices: [
        { id: 'k1_rent', t: 'Rent a car', lock: 'The rental company refuses. No credit card, no car', lockKind: 'real' },
        { id: 'k1_bus', lock: 'Booked out. When you finally get through, the last seats out of the city are gone', lockKind: 'game', pull: { lens: 'class', t: 'Intercity buses sell out quickly. With $60 and no card you can reach the last seats, but you arrive with almost nothing and no way to call home.', kind: 'game' }, t: 'Buy bus tickets out for you and Scott (2 × $45)', cost: 90, loc: 'out', img: 'busEvac', c: 'You get two of the last seats. You arrive in a strange city with {money} and nowhere to stay.' },
        { id: 'k1_dome', surprise: { t: 'The line stops moving for hours. The doors on your side close for a while: that hall is full.', kind: 'game', wait: 3 }, pull: { lens: 'class', t: 'Carless residents of the Ninth Ward live miles from the Superdome, and there is no shuttle from every street.', kind: 'game' }, t: 'Walk to the Superdome on Sunday', loc: 'dome', strength: -1, wait: 6, img: 'dome', c: 'Hours in line in the heat, searched at the door. Bring your own food.' },
        { id: 'k1_stay', surprise: { t: 'The corner store has sold out of bottled water. You fill pots and the bathtub instead.', kind: 'game' }, t: 'Buy food and water, stay with Scott', cost: 30, food: 3, loc: 'home', c: 'You stock up on food and water and stay with Scott.' }
      ]
    } },
    {
      _card: { t: 'Your phone has no credit left. You cannot call your family in other parts of the Ninth Ward.', kind: 'game' },
      home: {
        sit: 'The storm hits. In the morning the Industrial Canal floodwall breaks three blocks away. Water pours in.',
        hear: ['Neighbours shouting: “The levee broke!”'],
        choices: [
          { id: 'k2_attic', surprise: { t: 'The attic is darker and hotter than you thought, and you have nothing to break through the roof with.', kind: 'game' }, pull: { lens: 'structural', t: 'The attic was the nearest dry place for most people in the Lower Ninth.', kind: 'real' }, t: 'Climb into the attic', loc: 'attic', c: 'You make it up with Scott and some neighbours. The water keeps rising below you.' },
          { id: 'k2_roof', pull: { lens: 'structural', t: 'The Lower Ninth had minutes, not hours. Most of those who survived reached the attic.', kind: 'game' }, t: 'Get onto the roof', loc: 'roof', strength: -1, img: 'helicopter', c: 'Rescuers can see you. But the sun is brutal and you have no water.' },
          { id: 'k2_swim', pull: { lens: 'structural', t: 'The Lower Ninth had minutes, not hours. Few could swim through the current and the debris.', kind: 'game' }, t: 'Swim for a two-storey house', loc: 'house', strength: -1, img: 'ninth', c: 'Deep water, debris and currents. You reach a neighbour’s two-storey house.' },
          { id: 'k2_leave', t: 'Get out of the city', lock: 'No car, and the water is already in the street', lockKind: 'game' }
        ]
      },
      dome: {
        sit: 'Wind tears holes in the Superdome roof. The power fails.',
        hear: ['People around you: “The Ninth Ward is under water”'],
        choices: [
          { id: 'k2_dstay', surprise: { t: 'Part of the roof tears open. Rain pours onto the seats around you.', kind: 'game' }, t: 'Stay inside', loc: 'dome', c: 'Heat and darkness. The toilets stop working.' },
          { id: 'k2_dleave', t: 'Leave the Superdome', lock: 'The doors stay shut during the storm. No buses run', lockKind: 'game' }
        ]
      },
      out: {
        sit: 'You are in a shelter in another city. On TV, the Lower Ninth is under water.',
        hear: [{ t: 'TV: “New Orleans dodged the bullet”, then “levees broken”', false: 'The first message was misleading. The levees were already breaking.' }],
        choices: [
          { id: 'k2_shelter', t: 'Stay in the shelter', loc: 'out', c: 'A cot in a gym. You cannot reach your family, the phones are down.' }
        ]
      }
    },
    {
      _card: { t: 'You cut your foot on debris in the water.', kind: 'game', strength: -1 },
      attic: {
        sit: 'The attic is hot and getting unsafe as the water rises.',
        hear: ['Nothing but water and wind'],
        choices: [
          { id: 'k3_swim', t: 'Swim with Scott to a two-storey house', loc: 'house', strength: -1, minStrength: 2, weakLock: 'Too weak to swim through the current', img: 'ninth', c: 'You make it. Now you wait.' },
          { id: 'k3_roof', pull: { lens: 'structural', t: 'On the roof you are in view, but the Ninth Ward was one of the last areas reached.', kind: 'game' }, t: 'Break through the roof', loc: 'roof', strength: -1, img: 'helicopter', c: 'You are out in the open, waiting in the heat.' },
          { id: 'k3_leave', t: 'Get out of the city', lock: 'Water up to the roofs all around. No boat', lockKind: 'game' }
        ]
      },
      house: {
        sit: 'You are dry, but nobody comes.',
        hear: ['Rumour: “They’re not coming for the Ninth Ward”'],
        choices: [
          { id: 'k3_wait', pull: { lens: 'structural', t: 'Nobody knows you are here. Boats and helicopters reach other streets first.', kind: 'real' }, t: 'Wait for rescue', loc: 'house', wait: 48, c: 'Two days pass. No boat, no helicopter.' },
          { id: 'k3_wade', pull: { lens: 'class', t: 'Chest-deep, contaminated water with a cut foot is how many people got infections.', kind: 'game' }, t: 'Wade to the highway overpass', loc: 'house', strength: -1, wait: 24, minStrength: 3, weakLock: 'Your cut foot and no strength left. You cannot wade through chest-deep water', c: 'Dirty water up to your chest. Others are already waiting there.' },
          { id: 'k3_hleave', t: 'Get out of the city', lock: 'Water up to your chest all around. No boat, no car', lockKind: 'game' }
        ]
      },
      roof: {
        card: { t: 'You cut your foot on the roof tiles. You have had no clean water since Monday.', kind: 'game', strength: -1 },
        sit: 'On the roof in the sun, no water.',
        hear: ['Helicopters, far away'],
        choices: [
          { id: 'k3_rwait', t: 'Keep waiting', loc: 'roof', wait: 48, img: 'helicopter', c: 'You wave at every helicopter.' }
        ]
      },
      dome: {
        card: { t: 'You have not slept for two nights. The heat and noise never stop.', kind: 'game', strength: -1 },
        sit: 'Day three in the Superdome.',
        hear: [{ t: 'TV: “Rapes and murders in the Superdome”', false: 'Turned out false. Recorded dead: 6 inside the Superdome, 4 at the Convention Center.' }],
        choices: [
          { id: 'k3_dstay', surprise: { t: 'The water handout runs out before you reach the front of the line.', kind: 'game', food: -1 }, t: 'Stay and wait for buses', loc: 'dome', wait: 48, img: 'domeWater', c: 'The first buses to Houston leave on Wednesday.' },
          { id: 'k3_dleave', t: 'Get on the first bus out', lock: 'Booked out. The first buses fill up long before you reach the doors', lockKind: 'game' }
        ]
      },
      out: {
        card: { t: 'The shelter is full. You sleep on a cot between strangers.', kind: 'game' },
        sit: 'Still in the shelter. Your {money} is almost gone.',
        hear: [],
        choices: [
          { id: 'k3_ostay', t: 'Stay', loc: 'out', c: 'You eat what the shelter gives you.' }
        ]
      }
    },
    {
      _card: { t: 'The Navy base is a long walk through water.', kind: 'game' },
      house: {
        sit: 'You hear that the Navy base nearby has food and water.',
        hear: ['Rumour: “Buses are coming to the Convention Center”'],
        choices: [
          { id: 'k4_navy', t: 'Walk to the Navy base', strength: -1, end: 'k_navy' },
          { id: 'k4_wait', pull: { lens: 'structural', t: 'Buses reach the Convention Center only on Friday. Waiting in the heat costs more than it gains.', kind: 'game' }, t: 'Wait for the buses', wait: 48, end: 'k_wait' },
          { id: 'k4_bus', surprise: { t: 'The first bus you try has no keys. The second has half a tank.', kind: 'game', wait: 2 }, pull: { lens: 'class', t: 'This really happened, once. Almost everyone else waited. One man, Jabbar Gibson, had the nerve and the keys.', kind: 'real' }, t: 'Take an abandoned school bus and drive out', minStrength: 2, weakLock: 'You are too exhausted to drive a heavy bus through flooded streets', loc: 'out', end: 'k_vehicle' }
        ]
      },
      roof: {
        card: { t: 'Your lips are cracked from the sun. Scott can barely stand.', kind: 'game' },
        sit: 'Day four on the roof.',
        hear: [],
        choices: [
          { id: 'k4_signal', pull: { lens: 'structural', t: 'Helicopter crews reached the roofs they saw first. Many people on the roofs waited far longer.', kind: 'game' }, t: 'Signal a helicopter', end: 'rescued' },
          { id: 'k4_keep', pull: { lens: 'class', t: 'Waiting longer on the roof with no water is a risk of its own.', kind: 'game' }, t: 'Keep waiting', wait: 48, end: 'waiting' }
        ]
      },
      dome: {
        card: { t: 'Your phone has no credit. You still do not know if your family is alive.', kind: 'game' },
        sit: 'Buses finally take people to Houston.',
        hear: [],
        choices: [
          { id: 'k4_hbus', surprise: { t: 'The first buses are full. You wait another night on the ramp outside.', kind: 'game', wait: 12, strength: -1 }, t: 'Get on a bus to Houston', loc: 'out', end: 'houston' }
        ]
      },
      out: {
        card: { t: 'On TV you see your street under water. You still cannot reach your family.', kind: 'game' },
        sit: 'You are safe, far from home.',
        hear: [],
        choices: [
          { id: 'k4_work', t: 'Look for work where you are', end: 'k_out' }
        ]
      }
    }
  ]
},

/* =====================================================================
   4. RITA LEGRAND, LAKEVIEW (ProPublica et al. 2022; evacuation not reported)
   ===================================================================== */
lake: {
  profile: {
    portrait: null, initials: 'RL',
    facts: [
      { label: 'Who', value: 'Rita Legrand, retiree' },
      { label: 'Home', value: 'A modest ranch house in Lakeview, near the 17th Street Canal' },
      { label: 'Protection', value: 'You have insurance on the house' },
      { label: 'Neighbourhood', value: 'Mostly white, higher house values than the Lower Ninth' }
    ]
  },
  name: 'Rita Legrand', firstName: 'Rita Legrand', sub: 'Retiree in Lakeview, insured homeowner',
  color: '#1F5F35', seat: 'Back right', composite: false,
  intro: 'You are Rita Legrand, a retiree in Lakeview, a mostly white neighbourhood near the 17th Street Canal. You own a modest ranch house and you have insurance. In the game you also have a car with a full tank and some savings.',
  carChip: { t: 'Car, full tank' },
  start: { loc: 'home', money: 3000, food: 3, strength: 5 },
  track: { money: true, food: true, ethel: false },
  constraints: [
    { t: 'Your house is your savings. You are retired', kind: 'real' },
    { t: 'Your insurance will not cover everything', kind: 'real' },
    { t: 'Lakeview lies even lower than the Lower Ninth Ward, behind the 17th Street Canal wall', kind: 'real' },
    { t: 'On paper your modest house is worth far more than a house in the Lower Ninth', kind: 'real' },
    { t: 'Your neighbour says Ivan was a false alarm and is staying', kind: 'game' },
    { t: 'Your sister in Baton Rouge has a spare room', kind: 'game' },
    { t: 'You have a dog', kind: 'game' }
  ],
  real: 'When the floodwalls broke, water reached the eaves of many Lakeview homes. Rita Legrand had to gut her modest ranch house. With $53,000 from insurance, she applied for a Road Home grant in fall 2006. Road Home valued her house at $320,000 and her repairs at $188,000, and paid $135,000. By April 2007 she had completely rebuilt. “The program worked great for me,” she said. How and where she evacuated is not reported.',
  realSource: 'Webster, Adelson, Hammer and Chou (2022), ProPublica with The Times-Picayune | The Advocate and WWL-TV.',
  /* Shown when Rita leaves the city, and on the fate screen under "Can you come back?" */
  leaving: [
    { t: 'Your sister’s spare room is meant for a few nights, not weeks', kind: 'game' },
    { t: 'Your mail and pension go to an address that is under water', kind: 'game' },
    { t: 'Every week away costs money: gas, food, the dog', kind: 'game' }
  ],
  returning: [
    { t: 'The city keeps residents out for weeks. You cannot even see the house', kind: 'game' },
    { t: 'The house must be gutted to the studs', kind: 'real' },
    { t: 'Insurance pays $53,000. The repairs cost $188,000', kind: 'real' },
    { t: 'Your grant is based on the house’s high pre-storm value', kind: 'real' }
  ],
  returnFact: 'The average Lakeview owner got about 83 % of what rebuilding needed. About 37 % of Lower Ninth households were back after ten years.',
  /* null = not documented for this round; only documented rounds count for "matches what really happened" */
  realPath: [null, null, null, 'l4_rebuild'],
  realRows: ['Not reported', 'Floodwalls break. Lakeview floods to the eaves', 'Guts her house. Insurance pays $53,000', 'Road Home grant $135,000. Rebuilt by April 2007'],
  realStats: [
    { label: 'Insurance payout', value: '$53,000' },
    { label: 'Road Home valued her house at', value: '$320,000, repairs at $188,000' },
    { label: 'Road Home grant', value: '$135,000, applied in fall 2006' },
    { label: 'Rebuilt', value: 'Completely, by April 2007' },
    { label: 'Average Lakeview owner', value: 'Got about 83 % of what rebuilding needed' }
  ],
  rounds: [
    { '*': {
      sit: 'A hurricane may hit on Monday. Your car has a full tank.',
      hear: ['TV: “Traffic is already heavy on I-10”', 'Neighbour: “Ivan was a false alarm, I’m staying”', 'Your sister: “Come now, before the roads fill up”'],
      card: { t: 'The highway out takes eight hours instead of one.', kind: 'game' },
      choices: [
        { id: 'l1_drive', surprise: { t: 'The first two gas stations on the highway are sold out. You wait an hour in line for fuel.', kind: 'game', wait: 1 }, t: 'Drive to your sister in Baton Rouge', cost: 40, loc: 'out', strength: -1, wait: 8, c: 'Eight hours in traffic, but you get out.' },
        { id: 'l1_wait', pull: { lens: 'class', t: 'Around 1.2 million people left the region before landfall, mostly by car, so those who leave late meet the worst traffic.', kind: 'real' }, t: 'Wait for an official order', loc: 'home', c: 'When the order comes, the roads out are jammed. You decide to stay one more night. You still have your car.' },
        { id: 'l1_board', pull: { lens: 'class', t: 'Most households with a car left before the storm. Staying was a minority choice, and a risky one.', kind: 'real' }, t: 'Board up and stay', cost: 200, food: 3, loc: 'home', c: 'Plywood on the windows, food for days.' }
      ]
    } },
    {
      _card: { t: 'Your dog is with you. Many motels and shelters do not take pets.', kind: 'game', mods: [{ choice: 'l2_motel', cost: 60, note: 'Pet fee' }] },
      out: {
        sit: 'You watch the storm on TV at your sister’s house.',
        hear: [{ t: 'TV: “New Orleans dodged the bullet”', false: 'Misleading. Levees and floodwalls were already breaking. By Tuesday 80 % of the city was under water.' }],
        choices: [
          { id: 'l2_sister', t: 'Stay with your sister', cost: 60, loc: 'out', c: 'Crowded, but safe. You pay for gas, food and dog food.' },
          { id: 'l2_motel', surprise: { t: 'The first motels are booked out. The one that takes dogs is an hour further away.', kind: 'game', strength: -1 }, pull: { lens: 'class', t: 'A motel gives you privacy, but it costs money that most people did not have.', kind: 'game' }, t: 'Book a motel to give your sister space', cost: 420, loc: 'out', c: 'A week in a motel that takes dogs. You can afford it.' }
        ]
      },
      home: {
        sit: 'The 17th Street Canal breaks. Lakeview floods to the rooftops.',
        hear: ['Neighbours shouting'],
        choices: [
          { id: 'l2_roof', pull: { lens: 'structural', t: 'In Lakeview the water rose over hours, not minutes. Boats and helicopters reached many roofs, but not for days.', kind: 'game' }, t: 'Climb onto the roof with your dog', loc: 'roof', strength: -1, img: 'flood', c: 'You wait for a boat or a helicopter.' },
          { id: 'l2_drive', t: 'Drive out now', lock: 'Too late. The storm has closed the roads and the water is rising', lockKind: 'game' }
        ]
      }
    },
    {
      out: {
        card: { t: 'Your insurer’s phone line is busy all day.', kind: 'game' },
        sit: 'Your house is under water.',
        hear: ['TV: “Looting in New Orleans”', 'One news photo calls a young Black man wading with food “looting”. Another calls a white couple doing the same “finding” food'],
        choices: [
          { id: 'l3_insurer', t: 'Call your insurer', loc: 'out', c: 'After a day on hold, you file a claim from your sister’s house.' },
          { id: 'l3_drive', pull: { lens: 'structural', t: 'Residents were kept out of the city for weeks, so this trip ends at a checkpoint.', kind: 'real' }, t: 'Try to drive back in', cost: 40, loc: 'out', wait: 6, c: 'The city is closed. Checkpoints keep everyone out.' }
        ]
      },
      roof: {
        card: { t: 'You have had no clean water since Monday.', kind: 'game', strength: -1 },
        sit: 'On the roof in the heat.',
        hear: [],
        choices: [
          { id: 'l3_rwait', pull: { lens: 'structural', t: 'Boats passed full. Helicopter crews took the people they could reach first.', kind: 'game' }, t: 'Keep waiting', loc: 'roof', wait: 24, img: 'helicopter', c: 'A boat passes, full.' }
        ]
      }
    },
    {
      out: {
        card: { t: 'You see your street under water on national TV. The mortgage on the house is still due.', kind: 'game' },
        sit: 'You are safe and insured. What now?',
        hear: [],
        choices: [
          { id: 'l4_rebuild', t: 'Plan to rebuild', end: 'l_rebuild' },
          { id: 'l4_move', pull: { lens: 'structural', t: 'Insurance and a grant tied to home value made rebuilding the common choice in Lakeview.', kind: 'real' }, t: 'Move somewhere else', end: 'l_move' }
        ]
      },
      roof: {
        card: { t: 'Day four. Your dog has not eaten for two days.', kind: 'game' },
        sit: 'Day four on the roof.',
        hear: [],
        choices: [
          { id: 'l4_signal', pull: { lens: 'structural', t: 'Helicopter crews eventually reach the roof. Your insurance still pays for the house.', kind: 'game' }, t: 'Signal a helicopter', end: 'l_rescued' }
        ]
      }
    }
  ]
}
},

/* ---------------------------------------------------------------------
   ENDINGS. where = where the person ends up (shown in "How hard was it?")
   --------------------------------------------------------------------- */
endings: {
  houston:   { t: 'You reach the Houston Astrodome, hundreds of miles from home.', where: 'Houston, about 560 km from home', img: 'astrodome' },
  paid_ride: { t: 'You find a driver and get out of the city.', where: 'Out of the city' },
  bridge:    { t: 'Police on the Gretna side block the bridge and turn you back. You return to wait.', where: 'Still in the city' },
  rescued:   { t: 'A helicopter crew lifts you out. Thousands were rescued from rooftops and windows.', where: 'Lifted out by helicopter', img: 'rescue' },
  waiting:   { t: 'Rescue comes late. Almost half of the people who died in Louisiana were 75 or older.', where: 'Still waiting in the city' },
  m_radio:   { t: 'On WWL radio you say federal officials “don’t have a clue what’s going on down here”. Buses and troops arrive over the weekend.' },
  m_quiet:   { t: 'The talks go on. Buses and troops arrive over the weekend either way.' },
  m_bridge:  { t: 'Police on the Gretna side block the bridge and turn evacuees back.' },
  h_wait:    { t: 'The buses come too late.', where: 'Convention Center' },
  k_navy:    { t: 'Armed guards turn you away at gunpoint.', where: 'Still in the Ninth Ward' },
  k_wait:    { t: 'The buses only come days later.', where: 'Still in the city' },
  k_vehicle: { t: 'You drive out. One young man, Jabbar Gibson, really did this: he took a school bus with about 70 people to Houston. Officials at first hesitated to let him in.', where: 'Houston, about 560 km from home', img: 'buses' },
  k_out:     { t: 'You are safe, but your home is gone. Only about 37 % of Lower Ninth households came back within ten years.', where: 'Another city, far from home' },
  l_rebuild: { t: 'Insurance and a grant based on your home’s value help you rebuild. About 90 % of households citywide came back. It still takes months of mould removal, adjusters and paperwork. In the Lower Ninth the funding gap was about $31,000 larger per home.', where: 'Baton Rouge, about 130 km from home' },
  l_move:    { t: 'You start over somewhere else, with insurance money to do it.', where: 'A new city' },
  l_rescued: { t: 'A helicopter crew lifts you off the roof. Your insurance still pays for the house.', where: 'Lifted out by helicopter', img: 'rescue' }
},

/* Lines added to every ending, depending on what is left */
endLines: {
  moneyLow:   'You have {money} left, not enough for a motel, food or a bus home.',
  moneyMid:   'You have {money} left. It will not last long.',
  moneyHigh:  'Your savings and credit card cover a place to stay.',
  hungry:     'You went days without enough food and water.',
  weak:       'You are exhausted after days of heat, water and little sleep.',
  mayorWeak:  'You have barely slept since Saturday.',
  ethelDeath: 'Ethel dies in her wheelchair, waiting. You must leave her body behind.',
  ethel: ['Ethel is in critical condition after days without care.', 'Ethel is very weak and needs a hospital.', 'Ethel is weak but alive.', 'Ethel is alive and stable.']
}
};
