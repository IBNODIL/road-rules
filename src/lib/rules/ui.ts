import type { Lang } from "@/lib/i18n";

type Ui = {
  nav: string;
  title: string;
  sub: string;
  source: string;
  sourceLink: string;
  signsNote: string;
  search: string;
  noResults: string;
  progress: (n: number, t: number) => string;
  chapters: string;
  clause: string;
  check: string;
  correct: string;
  wrong: string;
  answered: string;
  examCta: string;
  examTitle: string;
  examSub: string;
  examStart: string;
  examQ: (i: number, n: number) => string;
  next: string;
  finish: string;
  score: (s: number, t: number) => string;
  review: string;
  again: string;
  back: string;
  readRule: string;
  history: string;
  noHistory: string;
  contents: string;
  partOf: (n: number, t: number) => string;
  keyPoints: string;
  practice: string;
  tag: (kind: "clause" | "annex2" | "annex3" | "def", n: string) => string;
  testTitle: string;
  testSub: string;
  testLabel: string;
  testOpenBody: string;
  testOpen: string;
  backToChapter: string;
  readOf: (n: number, t: number) => string;
  chapterTestScore: (s: number, t: number) => string;
  notTaken: string;
  readStat: string;
  chapterTests: string;
  overall: string;
  chaptersHeading: string;
  testScore: (s: number, t: number) => string;
  testDone: string;
  nextPart: string;
  prevPart: string;
  scrollHint: string;
  lessonsTestBody: string;
  openTest: string;
  markComplete: string;
  completed: string;
  startPart: string;
  parts: string;
  unitLessons: string;
  unitRules: string;
  lessonsHeading: string;
  rulesHeading: string;
  prev: string;
  nextRule: string;
  inChapter: (n: number) => string;
  chapterNames: Record<string, string>;
};

export const rulesUi: Record<Lang, Ui> = {
  en: {
    nav: "Rules",
    title: "Road Traffic Rules",
    sub: "Every clause of the Uzbekistan Road Traffic Rules in plain language, each with its own test question. Read a rule, answer, and your progress is saved in this browser.",
    source: "Source: Road Traffic Rules, Cabinet of Ministers Decree No. 172 of 12 April 2022, current edition on lex.uz.",
    sourceLink: "Open the official text",
    signsNote: "Road signs are taught in the Signs section and are not repeated here.",
    search: "Search rules",
    noResults: "No rules match your search.",
    progress: (n, t) => `${n} of ${t} rules answered correctly`,
    chapters: "Chapters",
    contents: "Contents",
    partOf: (n, t) => `Part ${n} of ${t}`,
    keyPoints: "Key points",
    practice: "In practice",
    tag: (kind, n) => (kind === "clause" ? `Clause ${n}` : kind === "annex2" ? (n ? `Annex 2, line ${n}` : "Annex 2") : kind === "annex3" ? "Annex 3" : "Definitions"),
    testTitle: "Chapter test",
    testSub: "One question for every lesson of the chapter. Answer them all, then check what you missed.",
    testLabel: "Test",
    testOpenBody: "Ready to check yourself? The test opens on its own page, so the answers are not visible while you read.",
    testOpen: "Take the chapter test",
    backToChapter: "Back to the chapter",
    readOf: (n, t) => `${n} of ${t} read`,
    chapterTestScore: (s, t) => `Test: ${s}/${t}`,
    notTaken: "Test not taken",
    readStat: "Course read",
    chapterTests: "Chapter tests done",
    overall: "Overall progress",
    chaptersHeading: "Chapters",
    testScore: (s, t) => `${s} of ${t} correct`,
    testDone: "Chapter finished",
    nextPart: "Next chapter",
    prevPart: "Previous chapter",
    scrollHint: "Keep scrolling for the next lesson",
    lessonsTestBody: "Check what you learned on the 3D schemas of the practice test.",
    openTest: "Open the practice test",
    markComplete: "Mark lesson complete",
    completed: "Completed",
    startPart: "Start chapter",
    parts: "Chapters",
    unitLessons: "lessons",
    unitRules: "rules",
    lessonsHeading: "Lessons",
    rulesHeading: "Rules",
    prev: "Previous rule",
    nextRule: "Next rule",
    inChapter: (n) => `${n} rules`,
    clause: "Clause",
    check: "Check yourself",
    correct: "Correct",
    wrong: "Not quite. The right answer is highlighted.",
    answered: "Answered correctly",
    examCta: "Test yourself on all rules",
    examTitle: "Rules exam",
    examSub: "Twenty random questions drawn from every clause. Each answer shows the rule behind it.",
    examStart: "Start the rules exam",
    examQ: (i, n) => `Question ${i} of ${n}`,
    next: "Next question",
    finish: "Finish",
    score: (s, t) => `${s} of ${t} correct`,
    review: "Rules to review",
    again: "Take another exam",
    back: "Back to the rules",
    readRule: "Read the rule",
    history: "Exam history",
    noHistory: "No rules exams yet.",
    chapterNames: {
      lessons: "Lessons",
      general: "General provisions",
      drivers: "Driver duties",
      accident: "After an accident",
      pedestrians: "Pedestrians",
      passengers: "Passengers",
      special: "Special vehicles",
      signals: "Traffic lights and controller signals",
      warning: "Warning and hazard signals",
      manoeuvres: "Starting and manoeuvring",
      position: "Position on the carriageway",
      speed: "Speed",
      overtaking: "Overtaking",
      parking: "Stopping and parking",
      junctions: "Junctions and regulated junctions",
      unregulated: "Unregulated junctions",
      crossings: "Pedestrian crossings and stops",
      railway: "Railway crossings",
      motorway: "Motorways",
      residential: "Residential zones",
      slopes: "Steep slopes",
      routeveh: "Route vehicles",
      lights: "Lights",
      towing: "Towing",
      learner: "Learner driving",
      carrying: "Carrying people",
      cargo: "Cargo",
      cyclists: "Cyclists and personal mobility",
      vehicles: "Identification marks on vehicles",
      markings: "Road markings (Annex 2)",
      technical: "Technical conditions (Annex 3)",
    },
  },
  ru: {
    nav: "Правила",
    title: "Правила дорожного движения",
    sub: "Каждый пункт Правил дорожного движения Узбекистана простым языком, и к каждому свой тестовый вопрос. Прочитайте правило, ответьте, и прогресс сохранится в этом браузере.",
    source: "Источник: Правила дорожного движения, Постановление Кабинета Министров № 172 от 12 апреля 2022 года, действующая редакция на lex.uz.",
    sourceLink: "Открыть официальный текст",
    signsNote: "Дорожные знаки изучаются в разделе «Знаки» и здесь не повторяются.",
    search: "Поиск по правилам",
    noResults: "Правил по вашему запросу нет.",
    progress: (n, t) => `Верно отвечено правил: ${n} из ${t}`,
    chapters: "Главы",
    contents: "Содержание",
    partOf: (n, t) => `Глава ${n} из ${t}`,
    keyPoints: "Главное",
    practice: "На практике",
    tag: (kind, n) => (kind === "clause" ? `Пункт ${n}` : kind === "annex2" ? (n ? `Приложение 2, линия ${n}` : "Приложение 2") : kind === "annex3" ? "Приложение 3" : "Определения"),
    testTitle: "Тест главы",
    testSub: "По одному вопросу на каждый урок главы. Ответьте на все, затем проверьте, что упустили.",
    testLabel: "Тест",
    testOpenBody: "Готовы проверить себя? Тест открывается на отдельной странице, чтобы ответы не были видны во время чтения.",
    testOpen: "Пройти тест главы",
    backToChapter: "Назад к главе",
    readOf: (n, t) => `Прочитано ${n} из ${t}`,
    chapterTestScore: (s, t) => `Тест: ${s}/${t}`,
    notTaken: "Тест не пройден",
    readStat: "Курс прочитан",
    chapterTests: "Тестов глав пройдено",
    overall: "Общий прогресс",
    chaptersHeading: "Главы",
    testScore: (s, t) => `Верно ${s} из ${t}`,
    testDone: "Глава пройдена",
    nextPart: "Следующая глава",
    prevPart: "Предыдущая глава",
    scrollHint: "Прокручивайте дальше к следующему уроку",
    lessonsTestBody: "Проверьте, что усвоили, на 3D схемах тренировочного теста.",
    openTest: "Открыть тренировочный тест",
    markComplete: "Отметить урок пройденным",
    completed: "Пройден",
    startPart: "Начать главу",
    parts: "Главы",
    unitLessons: "уроков",
    unitRules: "правил",
    lessonsHeading: "Уроки",
    rulesHeading: "Правила",
    prev: "Предыдущее правило",
    nextRule: "Следующее правило",
    inChapter: (n) => `Правил: ${n}`,
    clause: "Пункт",
    check: "Проверьте себя",
    correct: "Верно",
    wrong: "Неверно. Правильный ответ выделен.",
    answered: "Отвечено верно",
    examCta: "Проверить себя по всем правилам",
    examTitle: "Экзамен по правилам",
    examSub: "Двадцать случайных вопросов по всем пунктам. К каждому ответу показано правило.",
    examStart: "Начать экзамен по правилам",
    examQ: (i, n) => `Вопрос ${i} из ${n}`,
    next: "Следующий вопрос",
    finish: "Завершить",
    score: (s, t) => `Верно ${s} из ${t}`,
    review: "Правила для повторения",
    again: "Пройти ещё раз",
    back: "Назад к правилам",
    readRule: "Читать правило",
    history: "История экзаменов",
    noHistory: "Экзаменов по правилам пока нет.",
    chapterNames: {
      lessons: "Уроки",
      general: "Общие положения",
      drivers: "Обязанности водителей",
      accident: "Действия при ДТП",
      pedestrians: "Пешеходы",
      passengers: "Пассажиры",
      special: "Спецтранспорт",
      signals: "Светофоры и сигналы регулировщика",
      warning: "Предупредительные и аварийные сигналы",
      manoeuvres: "Начало движения и манёвры",
      position: "Расположение на проезжей части",
      speed: "Скорость",
      overtaking: "Обгон",
      parking: "Остановка и стоянка",
      junctions: "Перекрёстки и регулируемые перекрёстки",
      unregulated: "Нерегулируемые перекрёстки",
      crossings: "Пешеходные переходы и остановки",
      railway: "Железнодорожные переезды",
      motorway: "Автомагистрали",
      residential: "Жилые зоны",
      slopes: "Спуски и подъёмы",
      routeveh: "Маршрутный транспорт",
      lights: "Освещение",
      towing: "Буксировка",
      learner: "Обучение вождению",
      carrying: "Перевозка людей",
      cargo: "Перевозка грузов",
      cyclists: "Велосипедисты и СИМ",
      vehicles: "Опознавательные знаки на транспорте",
      markings: "Дорожная разметка (приложение 2)",
      technical: "Технические условия (приложение 3)",
    },
  },
  uz: {
    nav: "Qoidalar",
    title: "Yo'l harakati qoidalari",
    sub: "O'zbekiston Yo'l harakati qoidalarining har bir bandi sodda tilda va har biriga o'z test savoli. Qoidani o'qing, javob bering, natijangiz shu brauzerda saqlanadi.",
    source: "Manba: Yo'l harakati qoidalari, Vazirlar Mahkamasining 2022-yil 12-apreldagi 172-son qarori, lex.uz dagi amaldagi tahrir.",
    sourceLink: "Rasmiy matnni ochish",
    signsNote: "Yo'l belgilari «Belgilar» bo'limida o'rganiladi va bu yerda takrorlanmaydi.",
    search: "Qoidalarni qidirish",
    noResults: "So'rovingizga mos qoida topilmadi.",
    progress: (n, t) => `${t} ta qoidadan ${n} tasiga to'g'ri javob berilgan`,
    chapters: "Boblar",
    contents: "Mundarija",
    partOf: (n, t) => `${t} tadan ${n}-bob`,
    keyPoints: "Asosiy fikrlar",
    practice: "Amalda",
    tag: (kind, n) => (kind === "clause" ? `${n}-band` : kind === "annex2" ? (n ? `2-ilova, ${n} chiziq` : "2-ilova") : kind === "annex3" ? "3-ilova" : "Ta'riflar"),
    testTitle: "Bob testi",
    testSub: "Bobning har bir darsi uchun bittadan savol. Hammasiga javob bering, so'ng xatolaringizni tekshiring.",
    testLabel: "Test",
    testOpenBody: "O'zingizni tekshirishga tayyormisiz? Test alohida sahifada ochiladi, shuning uchun o'qish paytida javoblar ko'rinmaydi.",
    testOpen: "Bob testini topshirish",
    backToChapter: "Bobga qaytish",
    readOf: (n, t) => `${t} tadan ${n} tasi o'qildi`,
    chapterTestScore: (s, t) => `Test: ${s}/${t}`,
    notTaken: "Test topshirilmagan",
    readStat: "Kurs o'qildi",
    chapterTests: "Topshirilgan bob testlari",
    overall: "Umumiy progress",
    chaptersHeading: "Boblar",
    testScore: (s, t) => `${t} tadan ${s} ta to'g'ri`,
    testDone: "Bob tugadi",
    nextPart: "Keyingi bob",
    prevPart: "Oldingi bob",
    scrollHint: "Keyingi dars uchun pastga aylantiring",
    lessonsTestBody: "O'rganganlaringizni mashq testining 3D sxemalarida sinab ko'ring.",
    openTest: "Mashq testini ochish",
    markComplete: "Darsni tugallangan deb belgilash",
    completed: "Tugallandi",
    startPart: "Bobni boshlash",
    parts: "Boblar",
    unitLessons: "ta dars",
    unitRules: "ta qoida",
    lessonsHeading: "Darslar",
    rulesHeading: "Qoidalar",
    prev: "Oldingi qoida",
    nextRule: "Keyingi qoida",
    inChapter: (n) => `${n} ta qoida`,
    clause: "Band",
    check: "O'zingizni sinang",
    correct: "To'g'ri",
    wrong: "Noto'g'ri. To'g'ri javob ajratib ko'rsatildi.",
    answered: "To'g'ri javob berilgan",
    examCta: "Barcha qoidalar bo'yicha sinov",
    examTitle: "Qoidalar imtihoni",
    examSub: "Barcha bandlardan yigirmata tasodifiy savol. Har bir javobdan keyin qoida ko'rsatiladi.",
    examStart: "Qoidalar imtihonini boshlash",
    examQ: (i, n) => `${n} tadan ${i}-savol`,
    next: "Keyingi savol",
    finish: "Yakunlash",
    score: (s, t) => `${t} tadan ${s} ta to'g'ri`,
    review: "Takrorlash kerak bo'lgan qoidalar",
    again: "Yana imtihon topshirish",
    back: "Qoidalarga qaytish",
    readRule: "Qoidani o'qish",
    history: "Imtihonlar tarixi",
    noHistory: "Hali qoidalar imtihoni topshirilmagan.",
    chapterNames: {
      lessons: "Darslar",
      general: "Umumiy qoidalar",
      drivers: "Haydovchilarning umumiy vazifalari",
      accident: "Yo'l-transport hodisasi sodir bo'lganda",
      pedestrians: "Piyodalar",
      passengers: "Yo'lovchilar",
      special: "Maxsus transport vositalari",
      signals: "Svetofor va tartibga soluvchi ishoralari",
      warning: "Ogohlantiruvchi va avariya ishoralari",
      manoeuvres: "Harakatlanishni boshlash, manyovr qilish",
      position: "Qatnov qismida joylashuv",
      speed: "Harakatlanish tezligi",
      overtaking: "Quvib o'tish",
      parking: "To'xtash va to'xtab turish",
      junctions: "Chorrahalar va tartibga solingan chorrahalar",
      unregulated: "Tartibga solinmagan chorrahalar",
      crossings: "Piyodalar o'tish joylari va bekatlar",
      railway: "Temir yo'l kesishmalari",
      motorway: "Avtomagistrallar",
      residential: "Turar joy dahalari",
      slopes: "Tik balandlik va nishabliklar",
      routeveh: "Yo'nalishli transport vositalari",
      lights: "Tashqi yoritish asboblari",
      towing: "Shatakka olish",
      learner: "Boshqarishni o'rgatish",
      carrying: "Odam tashish",
      cargo: "Yuk tashish",
      cyclists: "Velosipedchilar va IHV",
      vehicles: "Transportdagi taniqlik belgilari",
      markings: "Yo'l chiziqlari (2-ilova)",
      technical: "Texnik shartlar (3-ilova)",
    },
  },
};
