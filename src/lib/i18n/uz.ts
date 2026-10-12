import type { SignType } from "../types";
import type { Dict, LessonText, QuestionText, SignText } from "./en";

export const uz: Dict = {
  code: "uz",
  locale: "uz-UZ",
  nativeName: "O'zbekcha",
  nav: {
    lessons: "Darslar",
    test: "Mashq testi",
    simulator: "Parkovka simulyatori",
    progress: "Natijalar",
    menuOpen: "Menyuni ochish",
    menuClose: "Menyuni yopish",
    skip: "Mazmunga o'tish",
    language: "Til",
  },
  footer: {
    blurb: "Yo'l harakati qoidalari uchun 3D trenajyor. Materiallar O'zbekiston Respublikasi Yo'l harakati qoidalariga (Vazirlar Mahkamasining 2022 yil 12 apreldagi 172-son qarori, lex.uz) asoslangan. Yakuniy so'z amaldagi rasmiy matnda.",
    privacy: "Maxfiylik",
    terms: "Shartlar",
  },
  lang: {
    title: "Tilni tanlang",
    sub: "Uni istalgan vaqtda menyudan o'zgartirishingiz mumkin.",
    detected: "Qurilmangiz asosida aniqlandi",
  },
  scene: {
    play: "Boshlash",
    replay: "Qayta ko'rish",
    reset: "Boshiga qaytarish",
    hint: "Aylantirish uchun suring, kattalashtirish uchun g'ildirakni buring",
    replaySolution: "Yechimni qayta ko'rish",
    waiting: "Mashinalar chiziqda kutmoqda. Davomini ko'rish uchun javob bering.",
    signLabel: "3D yo'l belgisi, aylantirish uchun suring",
    heroLabel: "Mashinalar navbat bilan o'tadigan va yo'l belgilari bor animatsiyali 3D chorraha",
  },
  home: {
    heroTitle: "Har bir yo'l qoidasini yo'lda uchratishdan oldin 3D da ko'ring",
    heroSub:
      "Haqiqiy chorrahalarni aylantiring, ustuvorlik qanday ishlashini kuzating va o'sha sahnalarda o'zingizni sinang. Ro'yxatdan o'tish shart emas, natijalar brauzeringizda saqlanadi.",
    cta: "Birinchi darsni boshlash",
    proof: (l, q) => `${l} ta dars va ${q} ta test savoli, bepul`,
    tagline:
      "Qoidalar harakatda ko'rinsa, yodda qoladi. Chorrahani aylantiring, kim birinchi o'tishini ko'ring va testda sinab ko'ring.",
    benefitsTitle: "Haydovchilar haqiqatda o'rganadigan tarzda tuzilgan",
    benefits: [
      { title: "Har bir chorrahani aylantiring", body: "Sahnani aylantiring va kattalashtiring, yassi chizmani yodlash o'rniga haqiqiy haydovchidek ko'rinishni baholang." },
      { title: "Ustuvorlik harakatda", body: "Boshlash tugmasini bosing va mashinalar to'g'ri tartibda o'tishini kuzating. Zanjirni ko'rganda qoida tushunarli bo'ladi." },
      { title: "Testlar xuddi shu sahnalarda", body: "Savollar darslardagi 3D sxemalar asosida tuzilgan, shuning uchun bilim imtihonda ham ishlaydi." },
      { title: "Haqiqiy haydash va parkovka", body: "Simulyatorda rulga o'tiring va parkovka, parallel parkovka hamda garajga teskari kirishni baholash bilan mashq qiling." },
    ],
    signsTitle: "To'qqizta belgi, har tomondan",
    signsSub: "Belgini tanlang, aylantiring va u nimani talab qilishini o'qing.",
    howTitle: "Birinchi darsdan mashq testigacha uch qadamda",
    steps: [
      { title: "Qisqa darsni o'qing", body: "Har bir darsda to'rtta qoida bor, har biriga 3D sahna ilova qilingan." },
      { title: "Aylantiring va takrorlang", body: "Kamera burchagini o'zgartiring va o'tish tartibi aniq bo'lguncha sahnani ishga tushiring." },
      { title: "Mashq testini topshiring", body: "3D sxemalar bo'yicha o'nta tasodifiy savol, har bir javobdan keyin izoh bilan." },
    ],
    faqTitle: "Boshlashdan oldingi savollar",
    faqs: [
      { q: "Ro'yxatdan o'tish kerakmi?", a: "Yo'q. Dars natijalari, test ballari va tugallanmagan test brauzeringizdagi lokal xotirada saqlanadi." },
      { q: "Qaysi davlat qoidalari o'rgatiladi?", a: "O'zbekiston qoidalari: Vazirlar Mahkamasining 2022 yil 12 apreldagi 172-son qarori bilan tasdiqlangan Yo'l harakati qoidalari (lex.uz). Harakat o'ng tomonlama, teng chorrahalarda o'ngdagiga yo'l beriladi. Imtihondan oldin amaldagi rasmiy matnni tekshiring." },
      { q: "3D sahnalarda nimani ko'raman?", a: "Aylantirish va kattalashtirish mumkin bo'lgan haqiqiy chorrahalar. Boshlash tugmasini bosing va mashinalar to'g'ri tartibda harakatlanadi: kim kutadi, kim burilib o'tadi, kim kesib o'tadi." },
      { q: "Mashq testi qanday baholanadi?", a: "Har bir testda har bir bobdan bittadan tasodifiy savol bo'ladi, jami 31 ta. O'tish uchun 80% to'g'ri javob kerak. Testda mashinalar siz javob berguningizcha chiziqda kutadi, keyin sahna yechimni ko'rsatadi." },
      { q: "Natijalarim yo'qolib qoladimi?", a: "Brauzerdagi sayt ma'lumotlarini o'chirmaguningizcha yoki natijalar sahifasida tozalash tugmasini bosmaguningizcha saqlanadi. Qurilmalar o'rtasida sinxronlanmaydi." },
      { q: "Telefonda ishlaydimi?", a: "Ha. Aylantirish uchun bir barmoq bilan suring, kattalashtirish uchun ikki barmoq bilan chimching. Simulyatorda ekrandagi boshqaruv tugmalari bor. Eski telefonlarda 3D sahnalar sekinroq ishlashi mumkin." },
    ],
    finalTitle: "Birinchi dars sakkiz daqiqa davom etadi",
    finalSub: "Bepul, ro'yxatdan o'tishsiz, istalgan payt to'xtatib, davom ettirishingiz mumkin.",
  },
  learn: {
    title: "Darslar",
    sub: "Sakkizta qisqa dars. Birini oching, sahnani aylantiring, ishga tushiring va tugallangan deb belgilang.",
    progressNone: "Hali bitta dars tugallanmagan. Yo'l belgilaridan boshlang.",
    progressN: (n, t) => `${t} tadan ${n} ta dars tugallandi`,
    minutes: (m) => `${m} daqiqa`,
    done: "Tugadi",
    allLessons: "Barcha darslar",
    header: (i, n, m) => `${n} tadan ${i}-dars · ${m} daqiqa`,
    keyFact: "Asosiysi",
    markComplete: "Tugallandi deb belgilash",
    completed: "Tugallandi",
    next: (t) => `Keyingisi: ${t}`,
    takeTest: "Mashq testini topshirish",
    sceneLabel: (t) => `${t} uchun 3D sahna. Mashinalar harakatini ko'rish uchun Boshlash tugmasini bosing.`,
    signsChoose: "Belgini tanlang",
  },
  test: {
    title: "Mashq testi",
    sub: "Javob berishdan oldin sahnani aylantiring. Mashinalar siz tanlaguningizcha chiziqda kutadi, keyin sahna to'g'ri yechimni ko'rsatadi.",
    introTitle: "Har bir bobdan bittadan savol",
    introBody: (pool, passAt) =>
      `Savollar ${pool} ta savol orasidan tasodifiy tanlanadi. Javobni tanlang, izohni o'qing va sahnada yechimni ko'ring. O'tish uchun ${passAt} ta to'g'ri javob kerak. Tugallanmagan test saqlanadi, chiqib ketib, qaytishingiz mumkin.`,
    noAttempts: "Hali urinishlar yo'q. Birinchi natijangiz shu yerda paydo bo'ladi.",
    attemptsBest: (n, pct) => `Urinishlar: ${n}, eng yaxshi natija ${pct}%`,
    start: "Testni boshlash",
    qOf: (i, n) => `${n} tadan ${i}-savol`,
    abandon: "Testni to'xtatish",
    correct: "To'g'ri",
    notQuite: "Noto'g'ri",
    wrongMark: "Noto'g'ri",
    next: "Keyingi savol",
    finish: "Testni yakunlash",
    scoreTitle: (s, t) => `${t} tadan ${s} ta to'g'ri`,
    passed: (time, passAt) => `Siz ${time} da topshirdingiz. O'tish chegarasi: ${passAt} ta to'g'ri javob.`,
    failed: (passAt) => `Hali o'tmadingiz. O'tish uchun ${passAt} ta to'g'ri javob kerak. Quyidagi darslarni takrorlang va qayta urinib ko'ring.`,
    another: "Yana test topshirish",
    reviewTitle: "Xatolarni ko'rib chiqing",
    correctAnswer: "To'g'ri javob",
    openLesson: (t) => `Darsni ochish: ${t}`,
    signQuestion: "Bu belgi nimani anglatadi?",
    sceneLabel: (q) => `Savol uchun 3D sxema: ${q}`,
    progressLabel: "Test borishi",
  },
  progress: {
    title: "Natijalar",
    sub: "Brauzeringizda saqlanadi. Serverga hech narsa yuborilmaydi.",
    lessons: "Tugallangan darslar",
    tests: "Topshirilgan testlar",
    best: "Eng yaxshi natija",
    avg: "O'rtacha natija",
    none: "Hali yo'q",
    history: "Testlar tarixi",
    empty: "Siz hali test topshirmagansiz. Darsni tugating va mashq testini sinab ko'ring.",
    take: "Mashq testini topshirish",
    passed: "o'tdi",
    failed: "o'tmadi",
    min: "daq",
    sec: "s",
    dataTitle: "Sizning ma'lumotlaringiz",
    dataBody: "Yuqoridagilarning hammasi faqat shu brauzerda saqlanadi. O'chirishni qaytarib bo'lmaydi.",
    reset: "Natijalarni tozalash",
    confirm: "Barcha natijalar o'chirilsinmi?",
    yes: "Ha, o'chirish",
    cancel: "Bekor qilish",
    simBest: "Parkovka simulyatoridagi eng yaxshi natijalar",
    simNone: "Hali o'ynalmagan",
  },
  privacy: {
    title: "Maxfiylik",
    paras: [
      "Roadwise da akkauntlar va server tomonidagi saqlash yo'q. Biz ismingiz, elektron pochtangiz yoki joylashuvingizni yig'maymiz.",
      "Tugallangan darslar, test natijalari, simulyator ballari, tanlangan til va tugallanmagan test brauzeringizning lokal xotirasida saqlanadi. Bu ma'lumotlar qurilmangizdan chiqmaydi. Ularni natijalar sahifasida yoki sayt ma'lumotlarini tozalab o'chirishingiz mumkin.",
      "Sayt reklama yoki kuzatuv cookie fayllaridan foydalanmaydi.",
    ],
  },
  terms: {
    title: "Shartlar",
    paras: [
      "Roadwise o'quv yordamchisi. Bu huquqiy maslahat emas va mamlakatingiz yo'l harakati qoidalari yoki litsenziyalangan instruktorni almashtirmaydi.",
      "Materiallar O'zbekiston Respublikasi Yo'l harakati qoidalariga (Vazirlar Mahkamasining 2022 yil 12 apreldagi 172-son qarori) asoslangan. Qoidalar o'zgarishi mumkin, shuning uchun imtihondan oldin lex.uz dagi amaldagi matnni tekshiring.",
      "3D sahnalar va parkovka simulyatori soddalashtirilgan. Haqiqiy chorrahalar va mashinalar bu modellardan farq qiladi.",
    ],
  },
  notFound: {
    title: "Bunday yo'l mavjud emas",
    body: "So'ralgan sahifa topilmadi. Darslarga qayting va shu yerdan davom eting.",
    cta: "Darslarga o'tish",
  },
  sim: {
    title: "Parkovka simulyatori",
    sub: "Haydovchi o'rindig'idan boshqaring va belgilangan joyga to'xtang. Tekis, yaxlit chiziqlarni kesmasdan va hech narsaga tegmasdan.",
    levels: {
      perpendicular: { name: "Perpendikulyar parkovka", desc: "Yo'lga to'g'ri burchak ostida joylashgan joyga oldinga yoki orqaga kiring." },
      parallel: { name: "Parallel parkovka", desc: "Yo'l chetida ikki mashina orasiga to'xtang." },
      garage: { name: "Garajga teskari kirish", desc: "Devorlar orasidagi tor garajga orqaga yurib kiring." },
    },
    rules: "Siz 10 ball bilan boshlaysiz. Yaxlit chiziqni kesish 2 ball oladi (qiya joylarda yo'q). Burilish chirog'isiz 25° dan ko'p burilish 1 ball oladi, avariya chirog'isiz bir metrdan ortiq orqaga yurish ham. Mashinaning 20% joyga kirgach, chiroqlar kerak emas. Qiyshiq to'xtash 2 ballgacha oladi. Har qanday to'qnashuv imtihonni to'xtatadi, 6 balldan past natija ham.",
    start: "Boshlash",
    retry: "Qayta urinish",
    nextLevel: "Keyingi daraja",
    time: "Vaqt",
    speed: "Tezlik",
    score: "Ball",
    scoreOf: (s) => `${s} / 10`,
    gear: "Uzatma",
    controls: "W gaz, S tormoz, Enter yakunlash, probel qo'l tormozi. Yuqori va pastki strelkalar to'xtaganda D va R ni almashtiradi. Chap va o'ng strelkalar rul. Q va E chap va o'ng burilish chirog'i, X avariya, atrofga qarash uchun sudrang, C kamera, F to'liq ekran, R qayta boshlash.",
    showControls: "Boshqaruvni ko'rsatish",
    hideControls: "Boshqaruvni yashirish",
    controlsTitle: "Boshqaruv",
    keyHand: "Qo'l tormozi",
    keyGear: "Uzatma (to'xtaganda)",
    keySteer: "Rul",
    touchGas: "Gaz",
    touchBrake: "Tormoz",
    touchLeft: "Chap",
    touchRight: "O'ng",
    touchD: "Oldinga",
    touchR: "Orqaga",
    car: "Mashina",
    cars: { sedan: "Sedan", hatch: "Xetchbek", suv: "Yo'ltanlamas", van: "Miniven" },
    signalLeft: "Chap burilish chirog'i",
    signalRight: "O'ng burilish chirog'i",
    hazard: "Avariya chirog'i",
    camera: "Kamera",
    cams: ["Haydovchi", "Orqadan", "Yuqoridan"],
    fullscreen: "To'liq ekran",
    exitFullscreen: "To'liq ekrandan chiqish",
    mirrors: { left: "Chap oyna", right: "O'ng oyna", rear: "Orqa ko'rish oynasi" },
    shiftDenied: "Uzatmani almashtirishdan oldin mashinani to'xtating",
    fineSignal: "Burilish chirog'i yoqilmadi, minus 1 ball",
    fineHazard: "Orqaga yurishda avariya chirog'i yoqilmadi, minus 1 ball",
    ruleFines: (n) => `Chiroq buzilishlari: ${n}`,
    readyEnd: "To'xtadi. Tugatish uchun «Yakunlash» ni bosing",
    finish: "Yakunlash",
    parked: "Tugatish uchun joyda to'xtab turing",
    holdIn: "Qimirlamang...",
    fine: "Yaxlit chiziq kesildi, minus 2 ball",
    passedTitle: "Imtihon topshirildi",
    failedTitle: "Imtihon topshirilmadi",
    crashTitle: "Imtihon to'xtatildi: to'qnashuv",
    crashBody: "Siz to'siqqa tegdingiz. Imtihonda har qanday to'qnashuv urinishni tugatadi.",
    finesTitle: "Imtihon to'xtatildi: jarimalar ko'p",
    finesBody: "Balingiz o'tish chegarasi bo'lgan 6 balldan pastga tushdi.",
    lineFines: (n) => `Kesilgan yaxlit chiziqlar: ${n}`,
    askew: (p) => (p > 0 ? `Qiyshiq to'xtash: minus ${p}` : "Tekis to'xtash: ayirma yo'q"),
    stars: (n) => `3 yulduzdan ${n} tasi`,
    result: "Natija",
    best: "Eng yaxshi",
    angle: "Burchak og'ishi",
    offset: "Siljish",
    canvasLabel: "Haydovchi o'rindig'idan 3D parkovka simulyatori. Klaviatura yoki ekrandagi tugmalar bilan boshqaring.",
    back: "Barcha darajalar",
  },
  signs: {
    stop: { name: "To'xtang", category: "Ustuvorlik", meaning: "Chiziq oldida to'liq to'xtang, keyin barcha transportga yo'l bering." },
    yield: { name: "Yo'l bering", category: "Ustuvorlik", meaning: "Tezlikni kamaytiring va qo'shilayotgan yo'ldagi transportga yo'l bering." },
    noentry: { name: "Kirish taqiqlangan", category: "Taqiq", meaning: "Transport vositalari bu yo'lga shu tomondan kirishi mumkin emas." },
    speed50: { name: "Tezlik chegarasi 50", category: "Taqiq", meaning: "Boshqa belgi o'zgartirmaguncha maksimal tezlik 50 km/soat." },
    priority: { name: "Asosiy yo'l", category: "Ustuvorlik", meaning: "Shu yo'l bo'ylab chorrahalarda sizda ustuvorlik bor." },
    oneway: { name: "Bir tomonlama harakat", category: "Axborot", meaning: "Harakat faqat strelka yo'nalishida." },
    noparking: { name: "To'xtab turish taqiqlangan", category: "Taqiq", meaning: "Bu yerda to'xtab turish mumkin emas. Faqat yo'lovchi tushirish yoki yuk olish uchun qisqa to'xtash mumkin." },
    crossing: { name: "Piyodalar o'tish joyi", category: "Axborot", meaning: "Oldinda belgilangan o'tish joyi bor. Undagi piyodalarga yo'l bering." },
    warning: { name: "Umumiy xavf", category: "Ogohlantirish", meaning: "Oldinda noma'lum xavf bor. Tezlikni kamaytiring va yo'lni kuzating." },
  } as Record<SignType, SignText>,
  lessons: {
    "road-signs": {
      title: "Bilishingiz shart bo'lgan yo'l belgilari",
      summary: "Kim yurishini, kim kutishini va kimga kirish mumkin emasligini hal qiluvchi to'qqizta belgi.",
      points: [
        { heading: "Shakl yozuvdan oldin keladi", body: "Sakkizburchak doim «To'xtang» degani. Uchi pastga qaragan uchburchak yo'l berishni bildiradi. Uchi tepaga qaragan uchburchak ogohlantiradi. Doira buyruq yoki taqiq beradi." },
        { heading: "Qizil hoshiya taqiqni bildiradi", body: "Tezlik chegarasi, kirish taqiqi va to'xtab turish taqiqi qizil halqaga ega. Ko'k doira va kvadratlar nima qilish kerakligini aytadi yoki axborot beradi." },
        { heading: "To'xtang har doim to'xtash degani", body: "Yo'l bo'sh ko'rinsa ham chiziq oldida to'liq to'xtang. Keyin barcha transportga yo'l bering va faqat undan so'ng yuring." },
        { heading: "Asosiy yo'l odatiy tartibni o'zgartiradi", body: "Sariq romb shu yo'l bo'ylab chorrahalarda sizga ustuvorlik beradi, odatda o'ngdagiga yo'l berishingiz kerak bo'lgan joyda ham." },
      ],
      keyFact: "Asosiy yo'l belgisi o'sha romb qora diagonal chiziq bilan chiqqanda tugaydi.",
    },
    "right-of-way": {
      "title": "Chorrahalarda ustuvorlik",
      "summary": "Nazoratsiz chorrahada kim birinchi o'tishini aniqlang va buni harakatda ko'ring.",
      "points": [
        {
          "heading": "Teng yo'llarda o'ngdagiga yo'l bering",
          "body": "Teng ahamiyatli yo'llarning nazoratsiz chorrahasida o'ng tomondan kelayotgan transportga yo'l berasiz. Tramvay birinchi o'tadi (105-band)."
        },
        {
          "heading": "Asosiy yo'l ikkinchi darajalidan ustun",
          "body": "Ikkinchi darajali yo'ldagi haydovchi asosiy yo'ldagi transportga, u qaysi tomonga burilishidan qat'i nazar, yo'l beradi (104-band). Yo'l qoplamali ekaniga ishonchingiz komil bo'lmasa, uni ikkinchi darajali deb hisoblang (108-band)."
        },
        {
          "heading": "Uch mashina, bitta zanjir",
          "body": "Sahnada C ning o'ng tomonida hech kim yo'q, B C ni, A esa B ni o'tkazishi kerak. Tartibni ko'rish uchun Boshlash tugmasini bosing."
        },
        {
          "heading": "Aylanma harakat: ichkaridagilarda ustuvorlik",
          "body": "Aylanma yo'lda allaqachon harakatlanayotgan transport unga kirayotganlardan ustun (98-band)."
        }
      ],
      "keyFact": "Avval asosiy yo'l, keyin teng yo'llar: o'ngdagiga yo'l bering. Qoplamasi aniq bo'lmagan yo'l ikkinchi darajali hisoblanadi."
    },
    "traffic-lights": {
      "title": "Svetoforlar va signallar",
      "summary": "Qizil, sariq, yashil va ularning har biri oxirgi metrlarda sizdan nima talab qilishi.",
      "points": [
        {
          "heading": "Qizil va qizil bilan sariq: harakat taqiqlangan",
          "body": "Qizil, miltillovchi qizil va sariq bilan birga qizil harakatni taqiqlaydi. To'xtash chizig'i oldida to'xtang, chiziq bo'lmasa piyodalarga xalaqit bermay o'tish joyi oldida to'xtang (31, 41-bandlar)."
        },
        {
          "heading": "Sariq harakatni taqiqlaydi",
          "body": "Sariq yurmang degani. Istisno faqat keskin tormozlamasdan to'xtay olmaydigan holat (31, 42-bandlar). Miltillovchi sariq ehtiyotkorlik bilan yurishga ruxsat beradi va nazoratsiz chorraha yoki o'tish joyi haqida ogohlantiradi."
        },
        {
          "heading": "Yashil: baribir yo'l bering",
          "body": "Yashil harakatga ruxsat beradi, miltillovchi yashil tugashidan ogohlantiradi. Yashilda ham chorrahani hali bo'shatayotgan transport va piyodalarga yo'l bering (103, 111-bandlar)."
        },
        {
          "heading": "Tartibga soluvchi svetofordan ustun",
          "body": "Tartibga soluvchining ko'rsatmasi svetofor va belgilardan ustun. Yuqoriga ko'tarilgan qo'l barcha transport va piyodalar to'xtashi kerakligini bildiradi (38, 43-bandlar)."
        }
      ],
      "keyFact": "Sariq to'xtash signali, tezlashish signali emas. Uni faqat tormozlash keskin bo'ladigan holatda o'tish mumkin."
    },
    "turning": {
      "title": "Burilish va signal berish",
      "summary": "Signalni erta bering, qatorni erta egallang va chapga burilganda yo'l bering.",
      "points": [
        {
          "heading": "Manyovrdan oldin signal bering",
          "body": "Harakatni boshlash, qatorni almashtirish, burilish yoki to'xtashdan oldin signal bering va manyovrdan keyin o'chiring (45, 46-bandlar)."
        },
        {
          "heading": "Signal ustuvorlik bermaydi",
          "body": "Yoqilgan ko'rsatkich yo'l huquqini bermaydi. Qatorni almashtirishdan oldin orqaga qarang va barcha ehtiyot choralarini ko'ring (46, 47-bandlar)."
        },
        {
          "heading": "Chapga burilish: qarama-qarshidagilarga yo'l bering",
          "body": "Yashil chiroqda yoki nazoratsiz chorrahada chapga burilganda, to'g'ri yoki o'ngga ketayotgan qarama-qarshi transportga yo'l bering (99, 107-bandlar)."
        },
        {
          "heading": "Burilganda piyodalar birinchi",
          "body": "O'ngga yoki chapga burilganda, kirayotgan yo'lingizni kesib o'tayotgan piyoda va velosipedchilarga yo'l bering (96-band)."
        }
      ],
      "keyFact": "Chapga burilganda qarama-qarshi harakatga yo'l berasiz. Qaysi tomonga burilsangiz ham, kirgan yo'lingizdagi piyodalarga yo'l berasiz."
    },
    "pedestrians": {
      "title": "Piyodalar va o'tish joylari",
      "summary": "O'tish joyida kimda ustuvorlik bor va unga qanday yaqinlashish kerak.",
      "points": [
        {
          "heading": "Har bir o'tish joyida sekinlashing yoki to'xtang",
          "body": "Nazoratsiz o'tish joyida piyodalarni o'tkazish uchun sekinlashing yoki to'xtang (109-band). Bitta mashina to'xtagan bo'lsa, qo'shni qatordagi haydovchilar faqat oldilaridan hech kim o'tmayotganiga ishonch hosil qilgach yursin (110-band)."
        },
        {
          "heading": "Yashil piyodalarni bekor qilmaydi",
          "body": "Svetoforli o'tish joyida sizga yashil bo'lsa ham piyodalar o'tib bo'lishini kuting (111-band)."
        },
        {
          "heading": "O'tish joyi yonida to'xtamang va quvib o'tmang",
          "body": "O'tish joyida va undan 10 m oldin to'xtash taqiqlangan. O'tish joylarida quvib o'tish taqiqlangan. Tirbandlik tufayli unda to'xtab qolishingiz mumkin bo'lsa, o'tish joyiga chiqmang (91, 86, 112-bandlar)."
        },
        {
          "heading": "Himoyasizlarga alohida e'tibor",
          "body": "Oq tayoqli piyodaga istalgan joyda va to'xtagan avtobusga borayotgan yoki undan tushayotganlarga yo'l bering. Bolalar guruhi bor, avariya chiroqlari yoqilgan avtobus oldida sekinlashing (113–115-bandlar)."
        }
      ],
      "keyFact": "O'tish joyi oldida to'xtagan mashina piyodani to'sib qo'yishi mumkin. Uni quvib o'tmang va unda to'xtab qolish xavfi bo'lsa, o'tish joyiga chiqmang."
    },
    "speed-distance": {
      "title": "Tezlik va xavfsiz masofa",
      "summary": "Tezlik nega ko'ringanidan muhimroq va qanchalik masofa saqlash kerak.",
      "points": [
        {
          "heading": "Aholi punktlarida tezlik",
          "body": "Aholi punktlarida 70 km/soatgacha. Toshkent, Nukus va viloyat markazlarida gavjum hududlarda 60 km/soat belgilanishi mumkin. Maktab va bolalar bog'chasidan 300 m ichida chegara 30 km/soat, turar joy hovlilarida 20 km/soat (78-band)."
        },
        {
          "heading": "Aholi punktlaridan tashqarida",
          "body": "Yengil va 3,5 t gacha yuk mashinalari 100 km/soatgacha, shaharlararo avtobuslar 90, ko'pchilik boshqalari 80, tirkamali yuk mashinalari 70. Tirkalgan transport 50 km/soatdan oshmasin (79, 80-bandlar)."
        },
        {
          "heading": "To'xtay oladigan masofani saqlang",
          "body": "Qoidalar oldingi mashina keskin tormozlaganda to'qnashuvni oldini oladigan masofa va xavfsiz yon oraliqni talab qiladi (73-band). Amaliy mezon: ikki soniya. Yomg'ir va qorda ko'proq qoldiring."
        },
        {
          "heading": "Tezlik sharoitga mos bo'lsin",
          "body": "Tezlik oqim, yuk, yo'l, ob-havo va ko'rinishga mos bo'lishi kerak. Xavf paydo bo'lsa, tezlikni kamaytiring yoki to'xtang. Keraksiz keskin tormozlamang (77, 81-bandlar). Tormoz yo'li tezlik kvadratiga qarab o'sadi."
        }
      ],
      "keyFact": "Belgilangan chegara bu maksimum. Qoidalar real sharoitda boshqaruvni saqlab qoladigan tezlikni ham talab qiladi."
    },
    "road-markings": {
      "title": "Yo'l chiziqlari",
      "summary": "Yo'ldagi bo'yoqni belgilar kabi diqqat bilan o'qing.",
      "points": [
        {
          "heading": "Uzuq chiziq: kesib o'tish mumkin",
          "body": "Uzuq chiziqlar qatorlarni ajratadi va qatorni almashtirishda har ikki tomondan kesib o'tilishi mumkin. Qatorlar belgilangan joyda faqat o'z qatoringizda yuring (70-band)."
        },
        {
          "heading": "Yaxlit chiziq 1.1: kesmang",
          "body": "Yaxlit chiziq qarama-qarshi oqimlarni ajratadi yoki xavfli uchastkalarni bildiradi. Uni kesib o'tish taqiqlangan. 1.3 chiziq to'rt va undan ko'p qatorli yo'llarda xuddi shunday."
        },
        {
          "heading": "To'xtash chizig'i va o'tish joyi",
          "body": "«To'xtang» belgisi yoki qizil chiroqda 1.12 chiziq oldida to'xtang. «Zebra» 1.14.1 piyodalar o'tish joyini bildiradi."
        },
        {
          "heading": "Chekka chiziqlar va belgi ustuvorligi",
          "body": "1.4 chiziq to'xtashni, 1.10 chiziq to'xtab turishni qatnov qismi chetida taqiqlaydi. Belgi va chiziq zid kelsa belgi ustun, vaqtinchalik chiziq doimiysidan ustun."
        }
      ],
      "keyFact": "Yaxlit chiziqni kesish qoidabuzarlik. Uzuq chiziqni faqat xavfsiz o'rin almashtirish uchun kesish mumkin."
    },
    "parking": {
      "title": "To'xtash va to'xtab turish",
      "summary": "Mashinani qayerda qoldirish mumkin va qayerda mumkin emas.",
      "points": [
        {
          "heading": "O'ngda, parallel, bir qatorda",
          "body": "Qatnov qismining o'ng chetida unga parallel, bir qatorda to'xtang va to'xtab turing. Aholi punktida bir tomonlama yo'llarda va har tomonga bitta qatorli tramvaysiz yo'llarda chap chet ham mumkin (88, 89-bandlar)."
        },
        {
          "heading": "To'xtash taqiqlangan joylar",
          "body": "O'tish joylarida va ulardan 10 m oldin, chorrahada kesishuvchi qatnov qismi chetidan 30 m ichida, jamoat transporti bekatidan oldin va keyin 15 m ichida hamda ko'rinish 100 m dan kam joylarda (91-band)."
        },
        {
          "heading": "Temir yo'l yonida to'xtab turish",
          "body": "Temir yo'l kesishmasining har ikki tomonida 50 m ichida to'xtab turmang. Tramvay yo'llarida va tunnellarda to'xtamang (91, 92-bandlar)."
        },
        {
          "heading": "Majburiy to'xtash va mashinadan chiqish",
          "body": "Majburiy to'xtashdan keyin avariya chiroqlarini yoqing va to'xtash belgisini aholi punktida kamida 15 m, undan tashqarida 30 m orqaga qo'ying (50, 51-bandlar). O'rindiqdan faqat mashina o'zi harakatlanishini oldini olgach turing (95-band)."
        }
      ],
      "keyFact": "O'tish joyida va undan 10 m oldin to'xtash taqiqlangan, temir yo'l kesishmasidan 50 m ichida to'xtab turish ham."
    },
  } as Record<string, LessonText>,
  questions: {
    "row-two": { text: "Belgi ham, svetofor ham yo'q. Qaysi mashina birinchi o'tadi?", options: ["A mashina", "B mashina", "Ikkalasi bir vaqtda"], explanation: "B mashina A ning o'ng tomonidan yaqinlashmoqda, shuning uchun A yo'l beradi." },
    "row-three": { text: "Uchta mashina nazoratsiz chorrahaga bir vaqtda yetib keldi. Qaysi biri birinchi o'tadi?", options: ["A mashina", "B mashina", "C mashina"], explanation: "C mashinaning o'ng tomonida hech kim yo'q. B C ni, A esa B ni kutadi." },
    "left-oncoming": { text: "A mashina chapga buriladi, B mashina qarama-qarshi tomondan to'g'ri ketmoqda. Kim birinchi?", options: ["A mashina, u birinchi signal berdi", "B mashina, u to'g'ri ketmoqda", "Qaysi biri tezroq bo'lsa"], explanation: "Chapga burilayotgan mashina qarama-qarshi qatorni kesib o'tadi, shuning uchun to'g'ri ketayotganlarga yo'l beradi." },
    "stop-sign": { text: "A mashina oldida «To'xtang» belgisi bor. B mashinada belgi yo'q. Kim birinchi?", options: ["A mashina", "B mashina", "Istalgani"], explanation: "A mashina to'liq to'xtab, yo'l berishi kerak. B mashina xavfsiz bo'lganda o'tadi." },
    "yield-beats-right": { text: "A mashinada «Yo'l bering» belgisi bor. B mashina shimoldan belgisiz kelmoqda. Kim birinchi?", options: ["A mashina, B uning chap tomonida", "B mashina", "Ikkalasi birga"], explanation: "Belgi bo'lmasa, B A ga yo'l berardi (A B ning o'ng tomonida). «Yo'l bering» belgisi buni o'zgartiradi, shuning uchun A kutadi." },
    "priority-road": { text: "A mashina asosiy yo'lda. B mashina o'ngdan qo'shilmoqda. Kim birinchi?", options: ["A mashina", "B mashina, u o'ng tomonda", "Ikkalasi birga"], explanation: "«Asosiy yo'l» belgisi o'ng qo'l qoidasidan ustun. A mashina yuradi, B kutadi." },
    "red-light": { text: "A mashina uchun qizil chiroq yoniq. Haydovchi nima qilishi kerak?", options: ["Chiziq oldida to'xtab, yashilni kutish", "Mashina ko'rinmasa, davom etish", "Sekinlashib, ehtiyotkorlik bilan o'tish", "Avariya chiroqlarini yoqib yurish"], explanation: "Qizil chiroq chorraha bo'sh ko'rinsa ham chiziq oldida to'xtashni bildiradi." },
    "yellow-light": {"text":"A mashina chiziqdan hali ancha uzoqda ekanida sariq chiroq yondi. Haydovchi nima qilishi kerak?","options":["To'xtash, keskin tormozlash talab etilmasa","Qizildan oldin o'tish uchun tezlashish","Signal chalib, davom etish","Parvo qilmaslik, sariq shunchaki bezak"],"explanation":"Sariq harakatni taqiqlaydi. Faqat keskin tormozlamasdan to'xtay olmasangiz davom etishingiz mumkin (31, 42-bandlar)."},
    "pedestrian-crossing": { text: "A mashina oldidagi o'tish joyidan piyoda o'tmoqda. Haydovchi nima qilishi kerak?", options: ["To'xtab, o'tish joyi bo'shaguncha kutish", "Chiroqni miltillatib, aylanib o'tish", "Piyoda yetib kelmasidan tezlashib o'tish", "Signal chalib, harakatni davom ettirish"], explanation: "O'tish joyidagi piyodalarda ustuvorlik bor. Ular narigi tomonga o'tguncha kuting." },
    "no-entry-scene": { text: "A mashina bu belgiga yaqinlashmoqda. Haydovchi nima qilishi kerak?", options: ["Kirmaslik va boshqa yo'l tanlash", "Avariya chiroqlari bilan sekin kirish", "Hech kim kelmasa, kirish", "Faqat kechasi kirish"], explanation: "«Kirish taqiqlangan» belgisi transportni bu yo'lga shu tomondan kirishni taqiqlaydi." },
    "two-seconds": {"text":"A mashinadan keyingi masofani qanday tanlash kerak?","options":["U keskin tormozlaganda to'qnashmaslik uchun yetarli, masalan ikki soniya","Doim aynan bir mashina uzunligi","Quruq yo'lda yarim soniya yetarli","Avariya chiroqlari yoqilgan bo'lsa istalgan masofa"],"explanation":"Qoidalar oldingi mashina keskin tormozlaganda to'qnashuvni oldini oladigan masofani talab qiladi (73-band). Ikki soniya buni ta'minlashning amaliy usuli."},
    "braking-square": { text: "Siz tezlikni ikki baravar oshirdingiz. Tormoz yo'liga nima bo'ladi?", options: ["O'zgarmaydi", "Ikki baravar oshadi", "Taxminan to'rt baravar uzayadi", "Yarmiga oshadi"], explanation: "Tormoz yo'li tezlik kvadratiga bog'liq, shuning uchun ikki barobar tezlikka taxminan to'rt barobar ko'p joy kerak." },
    "signal-early": { text: "A mashina o'ngga buriladi. Haydovchi signalni qachon berishi kerak?", options: ["Erta, burilishdan oldin sekinlashmasdan", "Faqat rulni burayotganda", "Burilish tugagandan keyin", "Hech qachon, agar yo'l bo'sh bo'lsa"], explanation: "Boshqalar ulgurishi uchun o'z vaqtida signal bering. Yo'l bo'sh bo'lsa ham bering, chunki hammani ko'rmaysiz." },
    "no-parking-scene": { text: "A mashina bu belgi yonida to'xtadi. Bu yerda to'xtab turish mumkinmi?", options: ["Yo'q, to'xtab turish taqiqlangan", "Ha, bir soatdan kam", "Ha, avariya chiroqlari yoniq bo'lsa", "Ha, lekin faqat kechasi"], explanation: "Belgi to'xtab turishni taqiqlaydi. Avariya chiroqlari va vaqt chegarasi istisno yaratmaydi." },
    "park-crossing": {"text":"Mashina yonida qolsangiz, piyodalar o'tish joyida to'xtab turish mumkinmi?","options":["Ha, agar haydovchi ichkarida qolsa","Hech qachon, bu piyodalar va ko'rinishga xalaqit beradi","Ha, tig'iz soatlardan tashqari","Ha, avariya chiroqlari bilan"],"explanation":"O'tish joyida va undan 10 m oldin to'xtash taqiqlangan, mashina yonida qolsangiz ham (91-band)."},
    "speed-settlement": {"text":"A mashina aholi punktidan o'tmoqda, boshqa tezlik belgilari yo'q. Umumiy maksimal tezlik qancha?","options":["50 km/soat","Hamma joyda 60 km/soat","70 km/soat","90 km/soat"],"explanation":"Aholi punktlarida umumiy chegara 70 km/soat. Toshkent, Nukus va viloyat markazlarining gavjum hududlarida 60 km/soat belgilanishi mumkin (78-band)."},
    "speed-school": {"text":"A mashina maktabdan 300 m ichida. Maksimal tezlik qancha?","options":["20 km/soat","30 km/soat","50 km/soat","70 km/soat"],"explanation":"Maktab yoki bolalar bog'chasidan oldin va keyin 300 m ichida chegara 30 km/soat. Turar joy hovlilarida 20 km/soat (78-band)."},
    "stop-crossing-distance": {"text":"Piyodalar o'tish joyidan oldin unga qanchalik yaqin to'xtash yoki to'xtab turish mumkin?","options":["«Zebra» ga tegib","Undan 10 m dan yaqin emas","Undan 1 m dan yaqin emas","Avariya chiroqlari bilan istalgan joyda"],"explanation":"O'tish joyida va undan 10 m oldin to'xtash taqiqlangan (91-band)."},
    "green-pedestrian": {"text":"A mashina uchun yashil chiroq yoniq, lekin oldida hali piyoda o'tmoqda. Haydovchi nima qilishi kerak?","options":["Piyoda o'tib bo'lishini kutish","Yurish, chunki yashil yoniq","Chiroqni miltillatib aylanib o'tish","Signal chalib yurish"],"explanation":"Yashilda ham haydovchilar piyodalarning o'tib bo'lishiga imkon berishi shart (111-band)."},
    "marking-solid": {"text":"A mashina yo'l o'rtasida yaxlit chiziqli uchastkaga yaqinlashmoqda. Quvib o'tish uchun chiziqni kesib o'tish mumkinmi?","options":["Ha, yo'l bo'sh bo'lsa","Yo'q, yaxlit chiziqni kesib o'tib bo'lmaydi","Ha, faqat kunduzi","Ha, chap ko'rsatkich bilan"],"explanation":"Yaxlit chiziq (1.1) qarama-qarshi oqimlarni ajratadi, uni kesib o'tish mumkin emas. Faqat uzuq chiziqni (1.5) kesish mumkin."},
    "warning-triangle": {"text":"A mashina aholi punktidan tashqarida buzilib qoldi. To'xtash belgisi orqada qancha masofaga qo'yilishi kerak?","options":["Kamida 5 m","Kamida 15 m","Kamida 30 m","Kamida 100 m"],"explanation":"Aholi punktidan tashqarida kamida 30 m, ichida 15 m (51-band)."},
  } as Record<string, QuestionText>,
};
