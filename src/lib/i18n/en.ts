import type { SignType } from "../types";

export type LessonText = {
  title: string;
  summary: string;
  points: { heading: string; body: string }[];
  keyFact: string;
};
export type QuestionText = { text: string; options: string[]; explanation: string };
export type SignText = { name: string; category: string; meaning: string };

export const en = {
  code: "en",
  locale: "en-GB",
  nativeName: "English",
  nav: {
    lessons: "Lessons",
    test: "Practice test",
    simulator: "Parking simulator",
    progress: "Progress",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    skip: "Skip to content",
    language: "Language",
  },
  footer: {
    blurb: "A 3D trainer for traffic rules. Content follows the Road Traffic Rules of the Republic of Uzbekistan (Cabinet of Ministers Decree No. 172 of 12 April 2022, lex.uz). The current official text is the final word.",
    privacy: "Privacy",
    terms: "Terms",
  },
  lang: {
    title: "Choose your language",
    sub: "You can change it at any time from the menu.",
    detected: "Detected from your device",
  },
  scene: {
    play: "Play",
    replay: "Replay",
    reset: "Reset",
    hint: "Drag to rotate, scroll to zoom",
    replaySolution: "Replay solution",
    waiting: "Cars wait at the line. Answer to see what happens.",
    signLabel: "3D road sign, drag to rotate",
    heroLabel: "Animated 3D junction with cars taking turns and road signs",
  },
  home: {
    heroTitle: "See every road rule in 3D before you face it on the road",
    heroSub:
      "Rotate real junctions, watch right of way play out, then test yourself on the same scenes. No account needed, and your progress stays in your browser.",
    cta: "Start the first lesson",
    proof: (l: number, q: number) => `${l} lessons and ${q} test questions, free`,
    tagline:
      "Rules stick when you can watch them move. Turn the junction, see who goes first, then prove it in the test.",
    benefitsTitle: "Built around how drivers actually learn",
    benefits: [
      { title: "Spin every junction", body: "Rotate and zoom each scene to check sight lines the way a real driver would, instead of memorising a flat diagram." },
      { title: "Right of way, played back", body: "Press play and watch cars take their turns in the legal order. The rule makes sense once you see the chain." },
      { title: "Tests use the same scenes", body: "Practice questions are built on the 3D schemas from the lessons, so recognition carries over to the exam." },
      { title: "Drive and park for real", body: "Take the wheel in the parking simulator and practise bays, parallel parking and a reverse garage with live scoring." },
    ],
    signsTitle: "Nine signs, in the round",
    signsSub: "Pick a sign, drag it around and read what it asks of you.",
    howTitle: "From first lesson to practice test in three steps",
    steps: [
      { title: "Read a short lesson", body: "Four rules per lesson, each paired with a 3D scene that shows it." },
      { title: "Rotate and replay", body: "Change the camera angle and press play until the order of vehicles is obvious." },
      { title: "Take the practice test", body: "Ten random questions on 3D schemas, with an explanation after every answer." },
    ],
    faqTitle: "Questions before you start",
    faqs: [
      { q: "Do I need an account?", a: "No. There is no sign up. Lesson progress, test scores and any test in progress are stored in your own browser using local storage." },
      { q: "Which country's rules does it teach?", a: "The rules of Uzbekistan: the Road Traffic Rules approved by Cabinet of Ministers Decree No. 172 of 12 April 2022 (lex.uz). Traffic keeps right, and at equal junctions you give way to the vehicle on your right. Check the current official text before the exam." },
      { q: "What do I see in the 3D scenes?", a: "Real junctions you can rotate and zoom. Press play and the cars move in the correct order, so you see who waits, who turns and who crosses." },
      { q: "How is the practice test scored?", a: "Each test draws one random question from every chapter, 31 in all. You pass at 80% correct. In the test the cars wait at the line until you answer, then the scene plays the solution." },
      { q: "Will my progress disappear?", a: "It stays until you clear site data in your browser or press reset on the progress page. It does not sync between devices." },
      { q: "Does it work on a phone?", a: "Yes. Drag with one finger to rotate and pinch to zoom. The simulator has on screen driving buttons. Older phones may render the 3D scenes more slowly." },
    ],
    finalTitle: "Your first lesson takes eight minutes",
    finalSub: "Free, no sign up, and you can stop and resume whenever you like.",
  },
  learn: {
    title: "Lessons",
    sub: "Eight short lessons. Open one, rotate the scene, press play, then mark it complete.",
    progressNone: "No lessons finished yet. Start with road signs.",
    progressN: (n: number, t: number) => `${n} of ${t} lessons finished`,
    minutes: (m: number) => `${m} minutes`,
    done: "Done",
    allLessons: "All lessons",
    header: (i: number, n: number, m: number) => `Lesson ${i} of ${n} · ${m} minutes`,
    keyFact: "Key fact",
    markComplete: "Mark as complete",
    completed: "Completed",
    next: (t: string) => `Next: ${t}`,
    takeTest: "Take the practice test",
    sceneLabel: (t: string) => `3D scene for ${t}. Press play to see the vehicles move.`,
    signsChoose: "Choose a sign",
  },
  test: {
    title: "Practice test",
    sub: "Rotate each scene before you answer. The cars wait at the line until you choose, then the scene plays the right answer.",
    introTitle: "One question from every chapter",
    introBody: (pool: number, passAt: number) =>
      `Questions are drawn at random from ${pool}. Pick an answer, read the explanation and watch the scene play the solution. You pass at ${passAt} correct. A test in progress is saved, so you can leave and return.`,
    noAttempts: "No attempts yet. Your first result will appear here.",
    attemptsBest: (n: number, pct: number) => `${n} attempt${n === 1 ? "" : "s"}, best score ${pct}%`,
    start: "Start the test",
    qOf: (i: number, n: number) => `Question ${i} of ${n}`,
    abandon: "Abandon test",
    correct: "Correct",
    notQuite: "Not quite",
    wrongMark: "Wrong",
    next: "Next question",
    finish: "Finish test",
    scoreTitle: (s: number, t: number) => `${s} of ${t} correct`,
    passed: (time: string, passAt: number) => `You passed in ${time}. The pass mark is ${passAt} correct.`,
    failed: (passAt: number) => `Not yet. You need ${passAt} correct to pass. Review the lessons below and try again.`,
    another: "Take another test",
    reviewTitle: "Review your mistakes",
    correctAnswer: "Correct answer",
    openLesson: (t: string) => `Open lesson: ${t}`,
    signQuestion: "What does this sign tell you?",
    sceneLabel: (q: string) => `3D schema for the question: ${q}`,
    progressLabel: "Test progress",
  },
  progress: {
    title: "Progress",
    sub: "Saved in your browser. Nothing is sent to a server.",
    lessons: "Lessons finished",
    tests: "Tests taken",
    best: "Best score",
    avg: "Average score",
    none: "None yet",
    history: "Test history",
    empty: "You have not taken a test yet. Finish a lesson, then try a practice test.",
    take: "Take the practice test",
    passed: "passed",
    failed: "failed",
    min: "min",
    sec: "s",
    dataTitle: "Your data",
    dataBody: "Everything above is stored only in this browser. Clearing it cannot be undone.",
    reset: "Reset progress",
    confirm: "Delete all progress?",
    yes: "Yes, delete",
    cancel: "Cancel",
    simBest: "Parking simulator best scores",
    simNone: "Not played yet",
  },
  privacy: {
    title: "Privacy",
    paras: [
      "Roadwise has no accounts and no server side storage. We do not collect your name, email or location.",
      "Finished lessons, test results, simulator scores, your language choice and any test in progress are saved in your browser local storage. That data never leaves your device. You can remove it on the progress page or by clearing site data.",
      "The site uses no advertising or tracking cookies.",
    ],
  },
  terms: {
    title: "Terms",
    paras: [
      "Roadwise is a study aid. It is not legal advice and does not replace your national highway code or a licensed instructor.",
      "Content follows the Road Traffic Rules of the Republic of Uzbekistan (Cabinet of Ministers Decree No. 172 of 12 April 2022). Rules can be amended, so always check the current text on lex.uz before your exam.",
      "The 3D scenes and the parking simulator are simplified. Real junctions and real cars behave differently from these models.",
    ],
  },
  notFound: {
    title: "This road does not exist",
    body: "The page you asked for was not found. Head back to the lessons and pick up from there.",
    cta: "Go to lessons",
  },
  sim: {
    title: "Parking simulator",
    sub: "Drive from the driver's seat and park inside the marked bay. Stay straight, avoid solid lines and touch nothing.",
    levels: {
      perpendicular: { name: "Perpendicular bay", desc: "Drive or reverse into a bay at a right angle to the lane." },
      reverseBay: { name: "Reverse bay", desc: "Back into a bay between two parked cars, square to the wall." },
      parallel: { name: "Parallel parking", desc: "Park between two cars at the kerb." },
      tightParallel: { name: "Tight parallel parking", desc: "Park in a short gap between two cars, with cars parked across the street." },
      garage: { name: "Reverse garage", desc: "Back into a narrow garage between walls." },
      carPark: { name: "Car park", desc: "Back into a bay in a narrow aisle with pillars and cars on both sides." },
      coneCourse: { name: "Cone course", desc: "Weave through three gates of cones, then drive forward into the box." },
    },
    rules: "You start with 10 points. Crossing a solid line costs 2 (not in angled bays, not the lines of the bay itself, and not once 20% of the car is in the bay). Turning more than 25° without the turn signal costs 1, and so does reversing more than a metre without hazard lights. Signals are not needed once 20% of the car is in the bay. Parking askew costs up to 2. Any collision ends the exam, and so does a score below 6.",
    start: "Start",
    retry: "Try again",
    nextLevel: "Next level",
    time: "Time",
    speed: "Speed",
    score: "Score",
    scoreOf: (s: number) => `${s} / 10`,
    gear: "Gear",
    controls: "W gas, S brake, Enter finish, Space handbrake. Up and Down arrows switch between D and R while stopped. Left and right arrows steer. Q and E left and right signals, X hazards, drag to look around, C camera, F fullscreen, R restart.",
    showControls: "Show controls",
    hideControls: "Hide controls",
    controlsTitle: "Controls",
    keyHand: "Handbrake",
    keyGear: "Gear (stopped)",
    keySteer: "Steer",
    touchGas: "Gas",
    touchBrake: "Brake",
    touchLeft: "Left",
    touchRight: "Right",
    touchD: "Drive",
    touchR: "Reverse",
    car: "Car",
    cars: { sedan: "Sedan", hatch: "Hatchback", suv: "SUV", van: "Van" },
    signalLeft: "Left signal",
    signalRight: "Right signal",
    hazard: "Hazard lights",
    camera: "Camera",
    cams: ["Driver", "Chase", "Top down"],
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    mirrors: { left: "Left mirror", right: "Right mirror", rear: "Rear view mirror" },
    shiftDenied: "Stop the car before you change gear",
    fineSignal: "Turn signal was off, minus 1 point",
    fineHazard: "Hazard lights were off while reversing, minus 1 point",
    ruleFines: (n: number) => `Signal violations: ${n}`,
    readyEnd: "Parked. Press Finish to end the exam",
    finish: "Finish",
    parked: "Hold still in the bay to finish",
    holdIn: "Hold still...",
    fine: "Solid line crossed, minus 2 points",
    passedTitle: "Exam passed",
    failedTitle: "Exam failed",
    crashTitle: "Exam stopped: collision",
    crashBody: "You hit an obstacle. In the exam any collision ends the attempt.",
    finesTitle: "Exam stopped: too many penalties",
    finesBody: "Your score fell below the pass mark of 6.",
    lineFines: (n: number) => `Solid lines crossed: ${n}`,
    askew: (p: number) => (p > 0 ? `Parked askew: minus ${p}` : "Parked straight: no deduction"),
    stars: (n: number) => `${n} of 3 stars`,
    result: "Result",
    best: "Best",
    angle: "Angle off",
    offset: "Offset",
    canvasLabel: "3D parking simulator seen from the driver's seat. Use the keyboard or the on screen buttons to drive.",
    back: "All levels",
  },
  signs: {
    stop: { name: "Stop", category: "Priority", meaning: "Come to a full stop at the line, then give way to all traffic." },
    yield: { name: "Give way", category: "Priority", meaning: "Slow down and give way to traffic on the road you are joining." },
    noentry: { name: "No entry", category: "Prohibition", meaning: "Vehicles may not enter this road from this direction." },
    speed50: { name: "Speed limit 50", category: "Prohibition", meaning: "Maximum speed is 50 km/h until another sign changes it." },
    priority: { name: "Priority road", category: "Priority", meaning: "You have right of way at the junctions along this road." },
    oneway: { name: "One way", category: "Information", meaning: "Traffic moves only in the direction of the arrow." },
    noparking: { name: "No parking", category: "Prohibition", meaning: "Parking is not allowed here. Only a brief stop to load or unload." },
    crossing: { name: "Pedestrian crossing", category: "Information", meaning: "A marked crossing is ahead. Give way to people on it." },
    warning: { name: "General danger", category: "Warning", meaning: "An unspecified hazard is ahead. Slow down and watch the road." },
  } as Record<SignType, SignText>,
  lessons: {
    "road-signs": {
      title: "Road signs you must know",
      summary: "Nine signs that decide who moves, who waits and who is not allowed in.",
      points: [
        { heading: "Shape comes before text", body: "An octagon always means stop. A triangle pointing down means give way. A triangle pointing up warns you. A circle gives an order or a ban." },
        { heading: "Red border means a prohibition", body: "Speed limits, no entry and no parking all use a red ring. Blue circles and squares tell you what you must do or give information." },
        { heading: "Stop means stop, every time", body: "Come to a full halt at the line even when the road looks empty. Then give way to all traffic before you move." },
        { heading: "Priority road changes the usual order", body: "The yellow diamond gives you right of way at the junctions along that road, even where you would normally give way to the right." },
      ],
      keyFact: "A priority road sign ends when the same diamond appears with a black diagonal bar.",
    },
    "right-of-way": {
      "title": "Right of way at junctions",
      "summary": "Work out who goes first at an unmarked junction, then watch it play out.",
      "points": [
        {
          "heading": "Equal roads: give way to the right",
          "body": "At an unregulated junction of equal roads you give way to vehicles approaching from your right. Trams go first (cl. 105)."
        },
        {
          "heading": "The main road beats the secondary road",
          "body": "A driver on a secondary road gives way to vehicles on the main road, whichever way they go (cl. 104). If you cannot tell whether your road is paved, treat it as secondary (cl. 108)."
        },
        {
          "heading": "Three cars, one chain",
          "body": "In the scene, C has nobody on its right, B must wait for C and A must wait for B. Press play to see the order."
        },
        {
          "heading": "Roundabouts: those inside go first",
          "body": "Vehicles already moving around the roundabout have priority over vehicles entering it (cl. 98)."
        }
      ],
      "keyFact": "Main road first, then equal roads: give way to the right. A road you cannot confirm is paved counts as secondary."
    },
    "traffic-lights": {
      "title": "Traffic lights and signals",
      "summary": "Red, yellow, green and what each one asks of you in the last few metres.",
      "points": [
        {
          "heading": "Red, and red with yellow: no movement",
          "body": "Red, flashing red and red together with yellow all prohibit movement. Stop at the stop line, or if there is none, before the crossing without blocking pedestrians (cl. 31, 41)."
        },
        {
          "heading": "Yellow prohibits movement",
          "body": "Yellow means do not go. The only exception is when you cannot stop without sudden braking (cl. 31, 42). Flashing yellow allows cautious movement and warns of an unregulated junction or crossing."
        },
        {
          "heading": "Green: still give way",
          "body": "Green permits movement and flashing green warns that it is ending. Even on green, let vehicles and pedestrians still clearing the junction finish (cl. 103, 111)."
        },
        {
          "heading": "The traffic controller outranks the light",
          "body": "A controller's instructions override lights and signs. An arm raised upward means all vehicles and pedestrians stop (cl. 38, 43)."
        }
      ],
      "keyFact": "Yellow is a stop signal, not a speed up signal. Only a situation that would force sudden braking excuses passing it."
    },
    "turning": {
      "title": "Turning and signalling",
      "summary": "Signal early, position early and give way when you turn left.",
      "points": [
        {
          "heading": "Signal before you move",
          "body": "Signal before starting off, changing lane, turning or stopping, and cancel the signal after the manoeuvre (cl. 45, 46)."
        },
        {
          "heading": "A signal gives no priority",
          "body": "A flashing indicator does not give you the right of way. Check behind before changing lane and take every precaution (cl. 46, 47)."
        },
        {
          "heading": "Left turn gives way to oncoming traffic",
          "body": "Turning left on green or at an unregulated junction, give way to oncoming vehicles going straight or turning right (cl. 99, 107)."
        },
        {
          "heading": "Pedestrians first when you turn",
          "body": "Turning right or left, give way to pedestrians and cyclists crossing the road you are entering (cl. 96)."
        }
      ],
      "keyFact": "Turning left, you give way to oncoming traffic. Turning either way, you give way to pedestrians on the road you enter."
    },
    "pedestrians": {
      "title": "Pedestrians and crossings",
      "summary": "Who has priority on a crossing and how to approach one.",
      "points": [
        {
          "heading": "Slow down or stop at every crossing",
          "body": "At an unregulated crossing, slow down or stop to let pedestrians cross (cl. 109). If one car stops, drivers in the next lane may go only after checking that nobody is crossing (cl. 110)."
        },
        {
          "heading": "Green does not cancel pedestrians",
          "body": "At a signal controlled crossing, let pedestrians finish crossing even if your light is green (cl. 111)."
        },
        {
          "heading": "Do not stop or overtake near a crossing",
          "body": "Stopping is prohibited on a crossing and within 10 m before it. Overtaking at crossings is prohibited. Do not enter a crossing if a queue may force you to stop on it (cl. 91, 86, 112)."
        },
        {
          "heading": "Extra care for vulnerable people",
          "body": "Give way to a pedestrian with a white cane anywhere, and to people walking to or from a stopped bus. Slow down for a bus carrying a children's group with hazard lights on (cl. 113 to 115)."
        }
      ],
      "keyFact": "A stopped car at a crossing can hide a pedestrian. Never overtake it, and never enter a crossing where you could get stuck on it."
    },
    "speed-distance": {
      "title": "Speed and safe distance",
      "summary": "Why speed matters more than it feels and how far to stay back.",
      "points": [
        {
          "heading": "Speed limits in settlements",
          "body": "Up to 70 km/h in settlements. In busy zones of Tashkent, Nukus and regional centres it may be set to 60 km/h. Within 300 m of a school or preschool the limit is 30 km/h, and in residential yards 20 km/h (cl. 78)."
        },
        {
          "heading": "Outside settlements",
          "body": "Cars and trucks up to 3.5 t may drive up to 100 km/h, intercity buses 90, most other vehicles 80 and trucks with trailers 70. A towed vehicle is limited to 50 km/h (cl. 79, 80)."
        },
        {
          "heading": "Keep a distance that lets you stop",
          "body": "The rules require a gap that prevents a collision if the car ahead brakes sharply, plus a safe side gap (cl. 73). Two seconds is a practical way to meet it. In rain or snow, leave more."
        },
        {
          "heading": "Speed must fit the conditions",
          "body": "Speed must suit traffic, load, road, weather and visibility. Slow down or stop when a hazard appears, and do not brake suddenly without need (cl. 77, 81). Braking distance grows with the square of speed."
        }
      ],
      "keyFact": "The posted limit is a maximum. The rules also require a speed at which you keep control in the actual conditions."
    },
    "road-markings": {
      "title": "Road markings",
      "summary": "Read the paint on the surface as carefully as the signs.",
      "points": [
        {
          "heading": "Dashed line: may be crossed",
          "body": "Broken lines separate lanes and may be crossed from either side when changing position. Where lanes are marked, stay strictly inside yours (cl. 70)."
        },
        {
          "heading": "Solid line 1.1: do not cross",
          "body": "A solid line separates opposing traffic or marks hazardous sections. Crossing it is prohibited. Line 1.3 does the same on roads with four or more lanes."
        },
        {
          "heading": "Stop line and crossing",
          "body": "Stop behind line 1.12 at a stop sign or a red light. Zebra stripes 1.14.1 mark a pedestrian crossing."
        },
        {
          "heading": "Edge lines and sign priority",
          "body": "Line 1.4 prohibits stopping and line 1.10 prohibits parking along the edge of the carriageway. When a sign and a marking conflict, the sign wins, and temporary markings beat permanent ones."
        }
      ],
      "keyFact": "Crossing a solid line is a violation. A dashed line may be crossed only to change position safely."
    },
    "parking": {
      "title": "Stopping and parking",
      "summary": "Where you may leave the car and where you may not.",
      "points": [
        {
          "heading": "Right side, parallel, single row",
          "body": "Stop and park at the right edge of the carriageway, parallel to it, in a single row. In a settlement on one way roads, or roads with one lane each way and no tram, the left side is allowed too (cl. 88, 89)."
        },
        {
          "heading": "Where stopping is prohibited",
          "body": "On crossings and within 10 m before them, within 30 m of the edge of a crossing carriageway at a junction, within 15 m before or after a public transport stop, and where visibility is under 100 m (cl. 91)."
        },
        {
          "heading": "Parking near a railway crossing",
          "body": "Do not park within 50 m of a railway crossing on either side. Never stop on tram tracks or in tunnels (cl. 91, 92)."
        },
        {
          "heading": "Forced stops and leaving the car",
          "body": "After a forced stop, switch on the hazard lights and set a warning triangle at least 15 m behind in a settlement and 30 m outside one (cl. 50, 51). Leave the driver's seat only after preventing the car from moving by itself (cl. 95)."
        }
      ],
      "keyFact": "Stopping on a crossing or within 10 m before it is prohibited, and so is parking within 50 m of a railway crossing."
    },
  } as Record<string, LessonText>,
  questions: {
    "row-two": { text: "No signs, no lights. Which car goes first?", options: ["Car A", "Car B", "Both go at the same time"], explanation: "Car B approaches from the right of Car A, so Car A gives way." },
    "row-three": { text: "Three cars reach an unmarked junction together. Which one may go first?", options: ["Car A", "Car B", "Car C"], explanation: "Nobody is on the right of Car C. Car B waits for C and Car A waits for B." },
    "left-oncoming": { text: "Car A turns left and Car B drives straight from the opposite side. Who goes first?", options: ["Car A, it signalled first", "Car B, it drives straight", "Whoever is faster"], explanation: "A vehicle turning left crosses the oncoming lane, so it gives way to traffic going straight." },
    "stop-sign": { text: "Car A faces a stop sign. Car B has no sign. Who goes first?", options: ["Car A", "Car B", "Either one"], explanation: "Car A must stop fully and give way. Car B proceeds when it is safe." },
    "yield-beats-right": { text: "Car A has a give way sign. Car B comes from the north with no sign. Who goes first?", options: ["Car A, B is on its left", "Car B", "Both go together"], explanation: "Without the sign, B would give way to A (A is on B's right). The give way sign reverses that, so A waits." },
    "priority-road": { text: "Car A is on a priority road. Car B joins from the right. Who goes first?", options: ["Car A", "Car B, it is on the right", "Both go together"], explanation: "The priority road sign overrides the right hand rule. Car A keeps going and Car B waits." },
    "red-light": { text: "The light facing Car A is red. What must the driver do?", options: ["Stop behind the line and wait for green", "Continue if no car is visible", "Slow down and cross carefully", "Switch on hazard lights and go"], explanation: "Red means stop at the line, whether the junction looks empty or not." },
    "yellow-light": {"text":"The light turns yellow while Car A is still well back from the line. What should the driver do?","options":["Stop, unless that would need sudden braking","Speed up to beat the red","Sound the horn and keep going","Ignore it, yellow is decoration"],"explanation":"Yellow prohibits movement. Only if you cannot stop without sudden braking may you continue (cl. 31, 42)."},
    "pedestrian-crossing": { text: "A pedestrian is walking across the crossing in front of Car A. What must the driver do?", options: ["Stop and wait until the crossing is clear", "Flash the lights and drive around", "Speed up to pass before they arrive", "Sound the horn and keep moving"], explanation: "People already on a crossing have priority. Wait until they have reached the other side." },
    "no-entry-scene": { text: "Car A faces this sign on its approach. What must the driver do?", options: ["Not enter, and find another route", "Enter slowly with hazard lights", "Enter if no one is coming", "Enter only at night"], explanation: "No entry bans vehicles from driving into that road from this direction." },
    "two-seconds": {"text":"How should you choose the following gap behind Car A?","options":["Enough to avoid a collision if it brakes sharply, for example two seconds","Always exactly one car length","Half a second is enough on a dry road","Any gap if your hazard lights are on"],"explanation":"The rules require a gap that prevents a collision if the car ahead brakes hard (cl. 73). Two seconds is a practical way to achieve it."},
    "braking-square": { text: "You double your speed. What happens to your braking distance?", options: ["It stays the same", "It doubles", "It becomes about four times longer", "It grows by half"], explanation: "Braking distance depends on the square of speed, so twice as fast needs about four times the room." },
    "signal-early": { text: "Car A will turn right. When should the driver signal?", options: ["Early, before slowing for the turn", "Only while turning the wheel", "After the turn is complete", "Never, if the road is empty"], explanation: "Signal in good time so others can adjust. Do it even on an empty road, because you cannot see everyone." },
    "no-parking-scene": { text: "Car A stops beside this sign. Is it allowed to park here?", options: ["No, parking is prohibited here", "Yes, for under an hour", "Yes, with hazard lights on", "Yes, but only at night"], explanation: "The sign prohibits parking. Hazard lights and time limits do not create an exception." },
    "park-crossing": {"text":"May you park on a pedestrian crossing if you stay with the car?","options":["Yes, if the driver stays inside","Never, it blocks pedestrians and sight lines","Yes, outside rush hour","Yes, with hazard lights on"],"explanation":"Stopping is prohibited on a crossing and within 10 m before it, even if you stay with the car (cl. 91)."},
    "speed-settlement": {"text":"Car A drives through a settlement with no other speed signs. What is the general maximum speed?","options":["50 km/h","60 km/h everywhere","70 km/h","90 km/h"],"explanation":"Inside settlements the general limit is 70 km/h. Busy zones in Tashkent, Nukus and regional centres may be set to 60 km/h (cl. 78)."},
    "speed-school": {"text":"Car A is within 300 m of a school. What is the maximum speed?","options":["20 km/h","30 km/h","50 km/h","70 km/h"],"explanation":"Within 300 m before and after a school or preschool the limit is 30 km/h. In residential yards it is 20 km/h (cl. 78)."},
    "stop-crossing-distance": {"text":"How close to a pedestrian crossing may Car A stop or park, before the crossing?","options":["Right up to the stripes","Not within 10 m before it","Not within 1 m before it","Anywhere if the hazard lights are on"],"explanation":"Stopping is prohibited on a crossing and within 10 m before it (cl. 91)."},
    "green-pedestrian": {"text":"The light is green for Car A, but a pedestrian is still crossing in front of it. What must the driver do?","options":["Let the pedestrian finish crossing","Go, because the light is green","Flash the lights and drive around","Sound the horn and go"],"explanation":"Even on green, drivers must let pedestrians finish crossing (cl. 111)."},
    "marking-solid": {"text":"Car A is approaching a stretch with a solid line in the middle of the road. May it cross the line to overtake?","options":["Yes, if the road is empty","No, a solid line may not be crossed","Yes, in daylight only","Yes, with the left signal on"],"explanation":"A solid line (1.1) separates opposing traffic and may not be crossed. You may cross only a broken line (1.5)."},
    "warning-triangle": {"text":"Car A broke down on a road outside a settlement. How far behind it must the warning triangle be placed?","options":["At least 5 m","At least 15 m","At least 30 m","At least 100 m"],"explanation":"At least 30 m outside settlements and 15 m inside them (cl. 51)."},
  } as Record<string, QuestionText>,
};

export type Dict = typeof en;
