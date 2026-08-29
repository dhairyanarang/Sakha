import type { Messages } from "..";

/**
 * Hindi — written for one reader: a woman in her late sixties in Delhi who
 * uses WhatsApp comfortably and nothing else.
 *
 * The rule followed throughout is HER vocabulary, not the dictionary's. Words
 * she already reads on her phone stay as they are — दवा, रिपोर्ट, रीडिंग,
 * कन्फर्म, नोटिफ़िकेशन, WhatsApp, Google — because a "correct" Hindi
 * replacement she has to decode is worse than an English word she reads
 * without thinking. So: सेहत not स्वास्थ्य, पर्ची not नुस्खा, गोले not बिंदु,
 * हफ़्ता not सप्ताह.
 *
 * Numerals stay Western (0-9), never Devanagari (०-९). Her glucometer, her BP
 * machine, her phone's clock and every lab report she owns print 0-9; a sugar
 * reading of १२४ would be the one number on the screen she could not read at
 * a glance.
 *
 * Units — mg/dL, mmHg, kg — stay Latin for exactly the same reason: they are
 * printed on the devices she reads them off.
 */
export const hi: Messages = {
  common: {
    save: "सेव करें",
    saving: "सेव हो रहा है…",
    cancel: "कैंसिल करें",
    next: "आगे बढ़ें",
    done: "हो गया",
    remove: "हटाएं",
    removing: "हटाया जा रहा है…",
    delete: "डिलीट करें",
    keepIt: "रहने दें",
    add: "जोड़ें",
    adding: "जोड़ा जा रहा है…",
    update: "बदलें",
    record: "दर्ज करें",
    confirm: "कन्फर्म करें",
    skip: "छोड़ें",
    continue: "आगे बढ़ें",
    other: "अन्य",
    goBack: "वापस जाएं",
    close: "बंद करें",
    download: "डाउनलोड करें",
    optionalSuffix: "(ज़रूरी नहीं)",
  },

  nav: {
    home: "होम",
    health: "सेहत",
    library: "लाइब्रेरी",
    profile: "प्रोफ़ाइल",
    mainLabel: "मुख्य",
    yourProfile: "आपकी प्रोफ़ाइल",
  },

  time: {
    goodMorning: "सुप्रभात",
    goodAfternoon: "नमस्ते",
    goodEvening: "शुभ संध्या",
    today: "आज",
    yesterday: "कल",
    daysAgo: (n) => `${n} दिन पहले`,
    oneWeekAgo: "1 हफ़्ता पहले",
    weeksAgo: (n) => `${n} हफ़्ते पहले`,
    todayAt: (time) => `आज, ${time}`,
    dateAt: (date, time) => `${date}, ${time}`,
    slot: {
      morning: "सुबह",
      afternoon: "दोपहर",
      evening: "शाम",
    },
    slotMedicine: {
      morning: "सुबह की दवा",
      afternoon: "दोपहर की दवा",
      evening: "शाम की दवा",
    },
  },

  units: {
    mgdl: "mg/dL",
    mmhg: "mmHg",
    kg: "kg",
    minutesShort: (n) => `${n} मिनट`,
  },

  welcome: {
    tagline: "अपनी सेहत का ध्यान रखने का आसान तरीका",
    illustrationAlt: "एक बुज़ुर्ग महिला और उनका बेटा साथ में फ़ोन देखते हुए",
    getStarted: "शुरू करें",
  },

  signIn: {
    title: "सखा में आपका स्वागत है",
    subtitle: "आगे बढ़ने के लिए साइन इन करें",
    privacy: "हम आपकी प्राइवेसी का ध्यान रखते हैं और आपकी जानकारी सुरक्षित रखते हैं",
    continueWithGoogle: "Google से आगे बढ़ें",
    openingGoogle: "Google खुल रहा है…",
    failed: "हम आपको साइन इन नहीं कर पाए। कृपया फिर कोशिश करें।",
    guestTesting: "मेहमान के तौर पर आगे बढ़ें (सिर्फ़ टेस्टिंग)",
  },

  onboarding: {
    nameTitle: "हम आपको क्या कहकर बुलाएं?",
    nameSubtitle: "सखा में यही आपका नाम रहेगा।",
    nameLabel: "आपका नाम",
    namePlaceholder: "आशा शर्मा",

    languageTitle: "आपको कौन सी भाषा आसान लगती है?",
    languageSubtitle: "आप इसे बाद में बदल सकते हैं।",
    languageGroupLabel: "भाषा",

    medicineTitle: "आइए आपकी दवाएं जोड़ें",
    medicineSubtitle: "जो दवाएं आप रोज़ लेते हैं, उन्हें जोड़ें",
    addAnother: "एक और दवा जोड़ें",
    savedAddAnother: "सेव हो गया। आप नीचे एक और जोड़ सकते हैं।",

    remindersTitle: "रिमाइंडर आपको याद दिलाते रहेंगे",
    remindersSubtitle: "सखा आपको दवाओं और ज़रूरी कामों की याद दिला सकता है।",
    allowReminders: "रिमाइंडर चालू करें",
    notNow: "अभी नहीं",
    remindersFootnote: "आप इसे बाद में अपने फ़ोन से कभी भी बदल सकते हैं।",
  },

  family: {
    theirSakha: (name) => `${name} का सखा`,
    theirHealth: (name) => `${name} की सेहत`,
    headerSubtitle: "हाल कैसा चल रहा है",
    healthSubtitle: "दवाएं, रीडिंग और डॉक्यूमेंट",
    viewingTheirInformation: (name) => `आप ${name} की सेहत की जानकारी देख रहे हैं।`,

    recentUpdates: "हाल की जानकारी",
    nothingRecent: "अभी कुछ नया नहीं है",
    nothingRecentBody: "इस अकाउंट पर जो भी दर्ज होगा, वह यहां दिखेगा।",

    healthOverview: "सेहत का हाल",
    recentDocuments: "हाल के डॉक्यूमेंट",
    noDocumentsYet: "अभी कोई डॉक्यूमेंट सेव नहीं है।",
    healthSubtitleContribute: "उनकी दवाएं, रीडिंग और डॉक्यूमेंट देखें",
    noMedicinesAdded: "अभी कोई दवा नहीं जोड़ी गई।",
    youCanRecord: "आप उनके लिए नई रीडिंग दर्ज कर सकते हैं।",
    recordedByYou: "आपने दर्ज की",
    uploadedByYou: "आपने अपलोड किया",

    /* Hindi counts "3 में से 2" — the total comes first, unlike English. */
    confirmedOfDue: (confirmed, due) => `आज ${due} में से ${confirmed} कन्फर्म`,
    nothingDueYet: "आज अभी कोई दवा बाक़ी नहीं",
    noMedicines: "कोई दवा नहीं जोड़ी गई",

    profileSubtitle: "आपका अकाउंट और एक्सेस",

    yourAccess: "आपका एक्सेस",
    connected: "जुड़े हुए",
    /**
     * Oblique again: "बेटा के तौर पर" is wrong, it has to be "बेटे के तौर पर".
     * A relation she typed herself cannot be inflected safely, so that case
     * falls back to the plain form rather than printing broken Hindi.
     */
    connectedAs: (relation) => {
      const oblique: Record<string, string> = {
        son: "बेटे",
        daughter: "बेटी",
        spouse: "जीवनसाथी",
      };
      const word = relation ? oblique[relation.trim().toLowerCase()] : undefined;
      return word ? `${word} के तौर पर जुड़े हैं` : "जुड़े हुए";
    },
    viewOnlyExplainer: (name) =>
      `आप ${name} की सेहत की जानकारी देख सकते हैं, और नई रीडिंग व डॉक्यूमेंट जोड़ सकते हैं। आप कुछ बदल या हटा नहीं सकते।`,

    updates: {
      /* The noun leads and the number follows in Hindi, which is why these
         are functions rather than one template reused across both languages. */
      bloodPressure: (value, unit) => `ब्लड प्रेशर ${value} ${unit}`,
      bloodSugar: (value, unit) => `ब्लड शुगर ${value} ${unit}`,
      weight: (value, unit) => `वज़न ${value} ${unit}`,
      /* "सुबह की दवा कन्फर्म" — the slot takes की before दवा. */
      medicineConfirmed: (slot) => `${slot} की दवा कन्फर्म की`,
      medicineSkipped: (slot) => `${slot} की दवा छोड़ी`,
      walked: (minutes) => `${minutes} मिनट टहले`,
      wentForAWalk: "टहलने गए",
      noWalk: "टहलना दर्ज नहीं",
      documentAdded: (title) => `${title} जोड़ा`,
    },
  },

  home: {
    moodQuestion: "आज आप कैसा महसूस कर रहे हैं?",
    moodNotGood: "ठीक नहीं",
    moodGood: "अच्छा",
    moodVeryGood: "बहुत अच्छा",
    moodNoted: "शुक्रिया, हमने नोट कर लिया।",

    todaysCare: "आज की देखभाल",
    lastReading: (value) => `पिछली: ${value}`,
    minutesLogged: (n) => `${n} मिनट`,
    noMedicines: "आपकी कोई दवा नहीं है।",
    // "Upcoming" as a plain fact about time, not a refusal.
    upcoming: "बाद में",
    confirmDose: (slotMedicine) => `${slotMedicine} कन्फर्म करें`,
    doseConfirmed: (slotMedicine) => `${slotMedicine} कन्फर्म हो गई।`,
    andMore: (first, more) => `${first} +${more}`,

    recordSugar: "शुगर दर्ज करें",
    recordBp: "बीपी दर्ज करें",
    notRecordedYet: "अभी दर्ज नहीं किया",
    walk: "सैर",
    logWalk: "सैर दर्ज करें",
    notLogged: "दर्ज नहीं किया",
    walkedToday: "आज सैर की",
    notToday: "आज नहीं",
    confirmLater: "आप इसे आज बाद में भी कन्फर्म कर सकते हैं।",
    didYouWalk: "क्या आज आप सैर पर गए?",
    forHowLong: "कितनी देर?",
    yes: "हां",
    no: "नहीं",
    chooseYesOrNo: "कृपया हां या नहीं चुनें।",
    walkLogged: "सैर दर्ज हो गई।",
    noWalkToday: "ठीक है, आज सैर नहीं हुई।",
  },

  health: {
    title: "सेहत",
    headerTitle: "आपकी सेहत",
    headerSubtitle: "अपनी सेहत संभालें",
    subtitle: "अपनी सेहत पर नज़र रखें",
    measurements: "रीडिंग",
    bloodSugar: "ब्लड शुगर",
    bloodPressure: "ब्लड प्रेशर",
    weight: "वज़न",
    progress: "अब तक का हाल",
    weightProgress: "वज़न में बदलाव",
    latest: "आख़िरी",
    noReadingsYet: "अभी कोई रीडिंग नहीं",
    sugarRangeValue: "70-140 mg/dL",
    bpRangeValue: "90–120 सिस्टोलिक, 60–80 डायस्टोलिक",
    readingAria: (value, unit, when) => `${value} ${unit}, ${when}`,
    editReadingAria: (value, unit, when) => `${value} ${unit}, ${when} — बदलें`,
    chartNone: (title) => `${title}: अभी कोई रीडिंग नहीं।`,
    chartOne: (title, value, unit) => `${title}: एक रीडिंग, ${value} ${unit}।`,
    chartRange: (title, count, from, to, lo, hi, unit, last) =>
      `${title}: ${from} से ${to} तक ${count} रीडिंग, ${lo} से ${hi} ${unit} के बीच। सबसे नई ${last} ${unit}।`,
    chartRangeBp: (title, count, from, to, sysLo, sysHi, diaLo, diaHi, unit, last) =>
      `${title}: ${from} से ${to} तक ${count} रीडिंग। सिस्टोलिक ${sysLo} से ${sysHi}, डायस्टोलिक ${diaLo} से ${diaHi} ${unit}। सबसे नई ${last}।`,
    over: (a, b) => `${a} बटा ${b}`,
    recordNewReading: "नई रीडिंग दर्ज करें",
    normalRange: "सामान्य रेंज",
    typicalRangeAdults: "बड़ों के लिए सामान्य रेंज:",
    systolic: "सिस्टोलिक",
    diastolic: "डायस्टोलिक",
    // The doctor says "systolic"; the number's position is what she checks.
    systolicTop: "सिस्टोलिक (ऊपर वाला नंबर)",
    diastolicBottom: "डायस्टोलिक (नीचे वाला नंबर)",

    recordSugarReading: "शुगर रीडिंग दर्ज करें",
    sugarLevelLabel: "शुगर लेवल (mg/dL)",
    sugarRecorded: "शुगर लेवल दर्ज हो गया।",
    recordBpReading: "बीपी रीडिंग दर्ज करें",
    bpRecorded: "ब्लड प्रेशर दर्ज हो गया।",
    recordWeight: "वज़न दर्ज करें",
    weightLabel: "वज़न (kg)",
    weightRecorded: "वज़न दर्ज हो गया।",

    editReading: "रीडिंग बदलें",
    dateAndTime: "तारीख़ और समय",
    readingUpdated: "रीडिंग बदल दी।",
    readingRemoved: "रीडिंग हटा दी।",
    removeReadingTitle: "यह रीडिंग हटा दें?",
    removeReadingBody: "यह आपकी लिस्ट से हट जाएगी। बाकी रीडिंग वैसी ही रहेंगी।",
  },

  medicines: {
    title: "दवाएं",
    activeCount: (n) => (n === 1 ? "1 दवा चल रही है" : `${n} दवाएं चल रही हैं`),
    noMedicines: "आपकी कोई दवा नहीं है",
    noMedicinesPeriod: "आपकी कोई दवा नहीं है।",
    addMedicine: "दवा जोड़ें",
    editMedicine: "दवा में बदलाव करें",
    edit: "बदलें",
    editNamed: (name) => `${name} में बदलाव करें`,
    medicineNameLabel: "दवा का नाम",
    // Brand names are printed in Latin on the packet she is holding.
    medicineNamePlaceholder: "Gliptagrate M500",
    medicineNamePlaceholderShort: "Gliptagrate",
    whenDoYouTakeIt: "आप इसे कब लेते हैं?",
    conditionLabel: "किस लिए",
    conditionPlaceholder: "यहां लिखें",
    remarksLabel: "कोई और बात (ज़रूरी नहीं)",
    remarksPlaceholder: "यहां लिखें",
    whatIsItFor: "यह दवा किस लिए है?",
    customChip: "+ खुद लिखें",
    conditions: {
      sugar: "शुगर",
      bp: "बीपी",
      acidity: "एसिडिटी",
      thyroid: "थायरॉइड",
      asthma: "अस्थमा",
      other: "अन्य",
    },
    medicineAdded: "दवा जुड़ गई।",
    medicineUpdated: "दवा बदल दी।",
    medicineRemoved: "दवा हटा दी।",
    removeMedicineTitle: "यह दवा हटा दें?",
    removeMedicineBody:
      "यह आपकी लिस्ट से हट जाएगी। आपने अब तक जो कन्फर्म किया है, वह वैसा ही रहेगा।",
    noTimeOfDaySet: "कोई समय तय नहीं",
    takenAt: (slots) =>
      slots.length === 1
        ? `${slots[0]} ली जाती है`
        : `${slots.slice(0, -1).join(", ")} और ${slots[slots.length - 1]} ली जाती है`,
    dotsQuestion: "ये गोले क्या बताते हैं?",
    dotsHide: "गोलों का मतलब छिपाएं",
    dotsTitle: "गोलों का मतलब",
    dotsBody:
      "तीन गोले सुबह, दोपहर और शाम के हैं, इसी क्रम में। भरा हुआ गोला मतलब आप उस समय दवा लेते हैं। खाली गोला मतलब आप नहीं लेते।",
    unconfirmed: "कन्फर्म नहीं किया",
    taken: "ले ली",
    skipped: "छोड़ी",
    notYet: "अभी नहीं",
  },

  documents: {
    title: "डॉक्यूमेंट",
    addDocument: "डॉक्यूमेंट जोड़ें",
    uploadDocument: "डॉक्यूमेंट अपलोड करें",
    none: "आपने अभी कोई डॉक्यूमेंट नहीं जोड़ा है।",
    chooseFile: "फ़ोटो या PDF चुनें",
    fileFieldLabel: "डॉक्यूमेंट",
    nameLabel: "डॉक्यूमेंट का नाम",
    namePlaceholder: "ब्लड टेस्ट रिपोर्ट",
    dateLabel: "डॉक्यूमेंट पर लिखी तारीख़",
    kindLabel: "यह किस तरह का डॉक्यूमेंट है?",
    notesLabel: "नोट (ज़रूरी नहीं)",
    notesPlaceholder: "यहां लिखें",
    types: {
      // What she calls the slip the doctor hands her.
      prescription: "पर्ची",
      labReport: "लैब रिपोर्ट",
      scan: "स्कैन",
      bill: "बिल",
      other: "अन्य",
    },
    added: "डॉक्यूमेंट जुड़ गया।",
    firstPageAlt: "डॉक्यूमेंट का पहला पन्ना",
    pageOf: (page, total) => `पन्ना ${page}/${total}`,
    pages: (n) => (n === 1 ? "1 पन्ना" : `${n} पन्ने`),
    previewUnavailable:
      "हम इसकी झलक नहीं दिखा पाए। आप इसे फिर भी खोल या डाउनलोड कर सकते हैं।",
    loadFailed: "हम यह डॉक्यूमेंट अभी नहीं दिखा पाए। कृपया फिर कोशिश करें।",
    removeTitle: "यह डॉक्यूमेंट हटा दें?",
    removeBody: "यह आपके डॉक्यूमेंट से हमेशा के लिए हट जाएगा।",
    removed: "डॉक्यूमेंट हटा दिया।",
    open: "खोलें",
  },

  library: {
    title: "सीखें और बेहतर जिएं",
    subtitle: "छोटी और आसान बातें जो आप आज़मा सकते हैं",
    filterByLanguage: "भाषा चुनें",
    all: "सभी",
    comingSoon: "यहां हल्की कसरत और सलाह आएंगी।",
    nothingInLanguage: (language) => `अभी ${language} में कुछ नहीं है।`,
    categories: {
      morning_routine: "सुबह और रोज़ की दिनचर्या",
      movement: "चलना-फिरना और कसरत",
      mind: "मन और आराम",
      health_education: "सेहत की जानकारी",
      food: "खाना और पोषण",
    },
  },

  profile: {
    title: "प्रोफ़ाइल",
    subtitle: "अपनी प्रोफ़ाइल संभालें",
    myProfile: "मेरी प्रोफ़ाइल",
    you: "आप",
    fullNameLabel: "पूरा नाम",
    yourNameSheet: "आपका नाम",
    namePlaceholder: "आशा शर्मा",
    emailLabel: "ईमेल आईडी",
    changePhoto: "अपनी फ़ोटो बदलें",
    useGooglePhoto: "मेरी Google फ़ोटो लगाएं",
    photoUpdated: "फ़ोटो बदल दी।",
    usingGooglePhoto: "आपकी Google फ़ोटो लगा दी।",
    nameUpdated: "नाम बदल दिया।",

    preferences: "सेटिंग",
    notification: "नोटिफ़िकेशन",
    remindersLabel: "रिमाइंडर",
    remindersOn: (state) => `रिमाइंडर: ${state}`,
    on: "चालू",
    off: "बंद",
    remindersOffHint: "रिमाइंडर बंद करने के लिए अपने फ़ोन की सेटिंग में जाएं।",
    remindersNeedInstall: "पहले सखा को होम स्क्रीन पर जोड़ें, फिर रिमाइंडर चालू करें।",
    remindersUnsupported: "यह फ़ोन रिमाइंडर नहीं दिखा सकता।",
    remindersDenied: "रिमाइंडर बंद हैं। आप इन्हें अपने फ़ोन की सेटिंग में चालू कर सकते हैं।",
    remindersOn2: "रिमाइंडर चालू हो गए।",
    language: "भाषा",
    languageUpdated: "भाषा बदल दी।",
    accounts: "अकाउंट",
    yourOwnAccount: "आपका अपना अकाउंट",
    viewOnly: "परिवार का एक्सेस",
    // A middot rather than a sentence, so the relation needs no inflection.
    viewOnlyRelation: (relation) => `परिवार का एक्सेस · ${relation}`,
    currentlyOpen: "अभी खुला है",
    switchTo: (name) => `${name} के अकाउंट पर जाएं`,
    switchAccount: "अकाउंट बदलें",
    switchAccountHint: "कोई दूसरा Google अकाउंट इस्तेमाल करें",
    signOut: "साइन आउट करें",
    signOutTitle: "सखा से साइन आउट करें?",
    signOutBody: "कुछ भी नहीं हटेगा। आप जब चाहें Google से दोबारा साइन इन कर सकते हैं।",
    staySignedIn: "साइन इन ही रहने दें",
  },

  invitations: {
    title: "न्योते",
    none: "आपने अभी किसी को नहीं जोड़ा है।",
    inviteFamilyMember: "परिवार के सदस्य को जोड़ें",
    inviteSheetTitle: "परिवार के सदस्य को जोड़ें",
    theirNameLabel: "उनका नाम",
    theirNamePlaceholder: "राहुल",
    relationQuestion: "वे आपके क्या लगते हैं?",
    customRelationLabel: "वे आपके क्या लगते हैं?",
    customRelationPlaceholder: "बहन",
    relations: {
      son: "बेटा",
      daughter: "बेटी",
      spouse: "पति/पत्नी",
      other: "अन्य",
    },
    familyFallback: "परिवार",
    familyMemberFallback: "परिवार का सदस्य",
    whatTheySee: "वे क्या देख पाएंगे",
    whatTheySeeBody:
      "आपकी दवाएं, आपकी रीडिंग और आपके डॉक्यूमेंट। वे आपके लिए नई रीडिंग या डॉक्यूमेंट जोड़ सकते हैं, पर कुछ बदल या हटा नहीं सकते।",
    createLink: "लिंक बनाएं",
    creating: "लिंक बन रहा है…",
    shareSheetTitle: "लिंक भेजें",
    ready: "आपका न्योता तैयार है",
    readyBody: (name) =>
      `यह लिंक ${name} को भेजें। यह एक ही बार चलेगा और 14 दिन बाद बंद हो जाएगा।`,
    shareLink: "लिंक भेजें",
    sendOnWhatsapp: "WhatsApp पर भेजें",
    shareMessage: (name) =>
      `${name}, यह लिंक है जिससे आप सखा पर मेरी सेहत की जानकारी देख सकते हैं।`,
    linkCopied: "लिंक कॉपी हो गया।",
    copyFromBox: "ऊपर बने बॉक्स से लिंक कॉपी करें।",
    pending: "खुलने का इंतज़ार",
    expiredLink: "लिंक की समय-सीमा ख़त्म",
    connected: "जुड़े हुए",
    cancelInvite: "रद्द करें",
    reshare: "फिर से भेजें",
    cancelled: "न्योता रद्द कर दिया।",
    manage: "मैनेज करें",
    removeAccessTitle: "इनका एक्सेस हटा दें?",
    removeAccessBody: (name) =>
      `${name} अब आपकी जानकारी नहीं देख पाएंगे। आप उन्हें बाद में फिर जोड़ सकते हैं।`,
    keepAccess: "रहने दें",
    revokeAccess: "एक्सेस हटाएं",
    revoked: (name) => `${name} अब आपकी जानकारी नहीं देख सकते।`,

    invitedToSakha: (name) => `${name} ने आपको सखा पर जोड़ा है`,
    stayUpdated: "उनकी सेहत की जानकारी देखें और हाल जानते रहें।",
    viewTheirSakha: (name) => `${name} का सखा देखें`,
    acceptAndContinue: "स्वीकार करें और आगे बढ़ें",
    decline: "अभी नहीं",
    openTheirSakha: (name) => `${name} का सखा खोलें`,
    alreadyConnected: (name) => `${name} का सखा आप पहले से देख सकते हैं`,
    alreadyConnectedBody: "अब कुछ और स्वीकार करने की ज़रूरत नहीं है।",
    /**
     * Hindi puts the relation in the oblique case before a postposition —
     * बेटा becomes बेटे in "उनके बेटे होने के नाते". A relation she typed
     * herself cannot be inflected safely, so that case drops the clause
     * entirely rather than printing broken Hindi.
     */
    asTheirRelation: (relation) => {
      const oblique: Record<string, string> = {
        son: "उनके बेटे",
        daughter: "उनकी बेटी",
        spouse: "उनके जीवनसाथी",
      };
      const phrase = relation ? oblique[relation.trim().toLowerCase()] : undefined;
      return phrase
        ? `${phrase} होने के नाते, आप उनका हाल देख सकते हैं।`
        : "आप उनका हाल देख सकते हैं।";
    },
    cannotChange: (name) =>
      `आप नई रीडिंग और डॉक्यूमेंट जोड़ भी सकते हैं। आप कुछ बदल या हटा नहीं सकते — यह सिर्फ़ ${name} ही कर सकते हैं।`,
    youWillSee: "आप यह देख पाएंगे",
    seeTodaysCare: "उनका दिन कैसा जा रहा है और उन्होंने क्या लिया",
    seeMedicines: "उनकी दवाएं",
    seeReadings: "उनका ब्लड शुगर, ब्लड प्रेशर और वज़न",
    seeDocuments: "उनके सेव किए हुए डॉक्यूमेंट",
    opening: "खुल रहा है…",
    askForNew: "उनसे नया लिंक भेजने के लिए कहें।",
    goToSakha: "सखा पर जाएं",
    alreadyUsed: "यह न्योता पहले ही इस्तेमाल हो चुका है।",
    wasCancelled: "यह न्योता रद्द कर दिया गया था।",
    expired: "इस न्योते की समय-सीमा ख़त्म हो गई है।",
    notFound: "हमें यह न्योता नहीं मिला।",
    signInFirst: "पहले साइन इन करें।",
    couldNotOpen: "हम यह न्योता नहीं खोल पाए। कृपया फिर कोशिश करें।",
    noLongerValid: "यह न्योता अब नहीं चलेगा।",
  },

  errors: {
    saveFailed: "हम इसे सेव नहीं कर पाए। कृपया फिर कोशिश करें।",
    removeFailed: "हम इसे हटा नहीं पाए। कृपया फिर कोशिश करें।",
    uploadFailed: "हम इसे अपलोड नहीं कर पाए। कृपया फिर कोशिश करें।",
    notAllowed: "आपको इसे जोड़ने की अनुमति नहीं है।",
    fileTooLarge: "यह फ़ाइल बहुत बड़ी है।",
    enterName: "कृपया अपना नाम लिखें।",
    enterMedicineName: "कृपया दवा का नाम लिखें।",
    chooseWhen: "कृपया चुनें कि आप इसे कब लेते हैं।",
    enterNumber: "कृपया कोई नंबर लिखें।",
    enterBothNumbers: "कृपया दोनों नंबर लिखें।",
    chooseFile: "कृपया जोड़ने के लिए कोई फ़ाइल चुनें।",
    nameDocument: "कृपया इस डॉक्यूमेंट को नाम दें।",
    choosePhotoOrPdf: "कृपया फ़ोटो या PDF चुनें।",
    documentTooLarge: "यह फ़ाइल बहुत बड़ी है। कृपया 25 MB से छोटी फ़ाइल चुनें।",
    choosePhoto: "कृपया कोई फ़ोटो चुनें।",
    photoTooLarge: "यह फ़ोटो बहुत बड़ी है। कृपया 10 MB से छोटी फ़ोटो चुनें।",
    enterTheirName: "कृपया उनका नाम लिखें।",
    chooseRelation: "कृपया चुनें कि वे आपके क्या लगते हैं।",
  },
};
