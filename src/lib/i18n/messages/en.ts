/**
 * English — the canonical dictionary.
 *
 * This object's TYPE is the contract every other language implements, so add
 * a message here and Hindi stops compiling until it is translated too.
 *
 * Anything variable is a function rather than a template assembled at the call
 * site, because word order differs between the two languages: "3 days ago"
 * puts the number first, "3 दिन पहले" happens to as well, but "Confirm Morning
 * Medicine" and "सुबह की दवा कन्फर्म करें" do not. Sentences are never built by
 * concatenating fragments in a component.
 */
export const en = {
  common: {
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    next: "Next",
    done: "Done",
    remove: "Remove",
    removing: "Removing…",
    delete: "Delete",
    keepIt: "Keep it",
    add: "Add",
    adding: "Adding…",
    update: "Update",
    record: "Record",
    confirm: "Confirm",
    skip: "Skip",
    continue: "Continue",
    other: "Other",
    goBack: "Go back",
    close: "Close",
    download: "Download",
    optionalSuffix: "(optional)",
  },

  nav: {
    home: "Home",
    health: "Health",
    library: "Library",
    profile: "Profile",
    mainLabel: "Main",
    yourProfile: "Your profile",
  },

  time: {
    goodMorning: "Good Morning",
    goodAfternoon: "Good Afternoon",
    goodEvening: "Good Evening",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: (n: number) => `${n} days ago`,
    oneWeekAgo: "1 week ago",
    weeksAgo: (n: number) => `${n} weeks ago`,
    /** "Today, 9:12 AM" */
    todayAt: (time: string) => `Today, ${time}`,
    /** "Aug 22, 10:20 AM" — a date and a time, however each language joins them. */
    dateAt: (date: string, time: string) => `${date}, ${time}`,
    /** The name of a slot on its own: a chip, a column heading. */
    slot: {
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
    },
    /** The dose as it reads on a row: "Morning Medicine". */
    slotMedicine: {
      morning: "Morning Medicine",
      afternoon: "Afternoon Medicine",
      evening: "Evening Medicine",
    },
  },

  units: {
    /** Printed on her glucometer and BP machine in these exact letters. */
    mgdl: "mg/dL",
    mmhg: "mmHg",
    kg: "kg",
    minutesShort: (n: number) => `${n} min`,
  },

  welcome: {
    tagline: "A simple way to stay on top of your health",
    illustrationAlt: "An older woman and her son looking at a phone together",
    getStarted: "Get Started",
  },

  signIn: {
    title: "Welcome to Sakha",
    subtitle: "Sign in to continue",
    privacy: "We respect your privacy and keep your information safe",
    continueWithGoogle: "Continue with Google",
    openingGoogle: "Opening Google…",
    failed: "We couldn't sign you in. Please try again.",
  },

  onboarding: {
    nameTitle: "What should we call you?",
    nameSubtitle: "This will be your name in Sakha.",
    nameLabel: "Your Name",
    namePlaceholder: "Asha Sharma",

    languageTitle: "Which language are you comfortable with?",
    languageSubtitle: "You can change this later.",
    languageGroupLabel: "Language",

    medicineTitle: "Let's add your Medicine",
    medicineSubtitle: "Please add the medicines you take regularly",
    addAnother: "Add Another Medicine",
    savedAddAnother: "Saved. You can add another below.",

    remindersTitle: "Stay on track with reminders",
    remindersSubtitle: "Sakha can remind you about medicines and things you need to do.",
    allowReminders: "Allow Reminders",
    notNow: "Not now",
    remindersFootnote: "You can change this anytime from your phone later.",
  },

  /**
   * The family member's side of the app.
   *
   * A different reader asking a different question. She asks "what do I need
   * to do today"; her son asks "how is she doing". Nothing in here is phrased
   * as an instruction to him, and nothing is phrased as a judgement of her —
   * a reading is a number and a time, never a verdict.
   */
  family: {
    /** "Asha's Sakha" — the header on their Home. */
    theirSakha: (name: string) => `${name}'s Sakha`,
    theirHealth: (name: string) => `${name}'s Health`,
    headerSubtitle: "How things are going",
    /** The calendar behind Recent Updates. */
    careHistory: "Care history",
    todaysMedicine: "Today's Medicine",
    careThatDay: "Care that day",
    /** Historical-date mode on the family Home. */
    today: "Today",
    nothingElseThatDay: "Nothing else was recorded that day.",
    nothingDue: "nothing due",
    noCareThatDay: "There is nothing recorded for that day.",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    pickADay: "Choose a day to see how it went.",
    noMedicinesThatDay: "No medicines were due that day.",
    /** Never "missed" or "failed" — an unanswered dose is not a failure. */
    doseConfirmed: "Confirmed",
    doseSkipped: "Skipped",
    doseUnconfirmed: "Not confirmed",
    /**
     * Said on each calendar day, because the dot alone is a 5px shape. Never
     * "missed" — a dose nobody answered is not a failure.
     */
    dayMark: {
      confirmed: "all medicines confirmed",
      partial: "some medicines confirmed",
      unanswered: "no medicines confirmed",
    },
    /** Monday first, as a week reads in India. Single letters. */
    weekdayInitials: ["M", "T", "W", "T", "F", "S", "S"],
    healthSubtitle: "Medicines, readings and documents",
    viewingTheirInformation: (name: string) =>
      `You are viewing ${name}'s health information.`,

    recentUpdates: "Recent Updates",
    nothingRecent: "Nothing new just yet",
    nothingRecentBody: "Anything recorded on this account will show up here.",

    healthOverview: "Health Overview",
    recentDocuments: "Recent Documents",
    noDocumentsYet: "No documents saved yet.",
    /** Header on the one consolidated family Health page. */
    healthSubtitleContribute: "See her medicines, readings and documents",
    noMedicinesAdded: "No medicines added yet.",
    /** Said once, above the readings, so the one control here is explained. */
    youCanRecord: "You can record a new reading for her.",
    /**
     * Shown only on the family experience, and only on rows this person added
     * themselves. Her own screens never carry it — on her account almost every
     * row would say it, which is noise rather than information.
     */
    recordedByYou: "Recorded by you",
    uploadedByYou: "Uploaded by you",

    /** "2 of 3 confirmed today" — only doses that have already come around. */
    confirmedOfDue: (confirmed: number, due: number) =>
      `${confirmed} of ${due} confirmed today`,
    nothingDueYet: "Nothing due yet today",
    noMedicines: "No medicines added",

    profileSubtitle: "Your account and access",

    yourAccess: "Your Access",
    connected: "Connected",
    /** Takes the RAW relation: Hindi has to inflect it, English does not. */
    connectedAs: (relation: string | null) => {
      const known: Record<string, string> = {
        son: "son",
        daughter: "daughter",
        spouse: "husband or wife",
      };
      const word = relation ? (known[relation.trim().toLowerCase()] ?? relation.trim()) : "";
      return word ? `Connected as ${word}` : "Connected";
    },
    viewOnlyExplainer: (name: string) =>
      `You can see ${name}'s health information, and add new readings and documents. You cannot change or delete anything.`,

    /**
     * One line per thing that happened. Each takes its pieces as arguments
     * rather than being assembled at the call site — Hindi puts the number and
     * the noun in a different order, and "Blood pressure 128/82" does not
     * translate by swapping words in place.
     */
    updates: {
      bloodPressure: (value: string, unit: string) => `Blood pressure ${value} ${unit}`,
      bloodSugar: (value: string, unit: string) => `Blood sugar ${value} ${unit}`,
      weight: (value: string, unit: string) => `Weight ${value} ${unit}`,
      /** Never "missed" or "late" — confirmation is allowed at any time. */
      medicineConfirmed: (slot: string) => `${slot} medicine confirmed`,
      medicineSkipped: (slot: string) => `${slot} medicine skipped`,
      medicinePartly: (slot: string) => `${slot} medicine partly confirmed`,
      walked: (minutes: number) => `Walked ${minutes} minutes`,
      wentForAWalk: "Went for a walk",
      noWalk: "No walk logged",
      documentAdded: (title: string) => `Added ${title}`,
    },
  },

  home: {

    todaysCare: "Today's Care",
    /** "Last: 124 mg/dL" — the value and unit are data, the word is ours. */
    lastReading: (value: string) => `Last: ${value}`,
    minutesLogged: (n: number) => `${n} minutes`,
    noMedicines: "You have no medicines.",
    upcoming: "Upcoming",
    confirmDose: (slotMedicine: string) => `Confirm ${slotMedicine}`,
    doseConfirmed: (slotMedicine: string) => `${slotMedicine} confirmed.`,
    /** "Gliptagrate M500 +1" — the name is hers, the "+1" is ours. */
    andMore: (first: string, more: number) => `${first} +${more}`,

    recordSugar: "Record Sugar level",
    recordBp: "Record BP",
    notRecordedYet: "Not Recorded yet",
    walk: "Walk",
    logWalk: "Log Walk",
    notLogged: "Not Logged",
    walkedToday: "Walked today",
    notToday: "Not today",
    confirmLater: "You can confirm this later today.",
    didYouWalk: "Did you go for a walk today?",
    forHowLong: "For how long?",
    yes: "Yes",
    no: "No",
    chooseYesOrNo: "Please choose yes or no.",
    walkLogged: "Walk logged.",
    noWalkToday: "Noted, no walk today.",
  },

  health: {
    title: "Health",
    headerTitle: "Your Health",
    headerSubtitle: "Manage your Health",
    subtitle: "Track your health",
    measurements: "Measurements",
    bloodSugar: "Blood Sugar",
    bloodPressure: "Blood Pressure",
    weight: "Weight",
    progress: "Progress",
    weightProgress: "Weight Progress",
    latest: "Latest",
    noReadingsYet: "No readings yet",
    sugarRangeValue: "70-140 mg/dL",
    bpRangeValue: "90–120 systolic, 60–80 diastolic",
    /** Screen-reader label for one row in the history list. */
    readingAria: (value: string, unit: string, when: string) => `${value} ${unit}, ${when}`,
    editReadingAria: (value: string, unit: string, when: string) =>
      `Edit reading, ${value} ${unit}, ${when}`,
    /** The chart, in words. Descriptive only — it never says good or bad. */
    chartNone: (title: string) => `${title}: no readings yet.`,
    chartOne: (title: string, value: string, unit: string) =>
      `${title}: one reading, ${value} ${unit}.`,
    chartRange: (
      title: string,
      count: number,
      from: string,
      to: string,
      lo: number,
      hi: number,
      unit: string,
      last: string,
    ) =>
      `${title}: ${count} readings from ${from} to ${to}, ranging ${lo} to ${hi} ${unit}. Most recent ${last} ${unit}.`,
    chartRangeBp: (
      title: string,
      count: number,
      from: string,
      to: string,
      sysLo: number,
      sysHi: number,
      diaLo: number,
      diaHi: number,
      unit: string,
      last: string,
    ) =>
      `${title}: ${count} readings from ${from} to ${to}. Systolic ${sysLo} to ${sysHi}, diastolic ${diaLo} to ${diaHi} ${unit}. Most recent ${last}.`,
    /** "120 over 80" reads better aloud than "120/80". */
    over: (a: number, b: number | null) => `${a} over ${b}`,
    recordNewReading: "Record new reading",
    normalRange: "Normal Range",
    typicalRangeAdults: "Typical range for adults:",
    systolic: "Systolic",
    diastolic: "Diastolic",
    systolicTop: "Systolic (Top Number)",
    diastolicBottom: "Diastolic (Bottom Number)",

    recordSugarReading: "Record Sugar Reading",
    sugarLevelLabel: "Sugar Level (mg/dL)",
    sugarRecorded: "Sugar level recorded.",
    recordBpReading: "Record BP Reading",
    bpRecorded: "Blood pressure recorded.",
    recordWeight: "Record Weight",
    weightLabel: "Weight (kg)",
    weightRecorded: "Weight recorded.",

    editReading: "Edit reading",
    dateAndTime: "Date & Time",
    readingUpdated: "Reading updated.",
    readingRemoved: "Reading removed.",
    removeReadingTitle: "Remove this reading?",
    removeReadingBody: "It comes off your history. Your other readings stay as they are.",
  },

  medicines: {
    title: "Medicines",
    /** The card's own count line: "3 Active Medicines". */
    activeCount: (n: number) => `${n} Active ${n === 1 ? "Medicine" : "Medicines"}`,
    noMedicines: "You have no medicines",
    noMedicinesPeriod: "You have no medicines.",
    addMedicine: "Add Medicine",
    editMedicine: "Edit Medicine",
    edit: "Edit",
    editNamed: (name: string) => `Edit ${name}`,
    medicineNameLabel: "Medicine Name",
    medicineNamePlaceholder: "Gliptagrate M500",
    medicineNamePlaceholderShort: "Gliptagrate",
    whenDoYouTakeIt: "When do you take it?",
    conditionLabel: "Condition",
    conditionPlaceholder: "Type a condition",
    remarksLabel: "Remarks (optional)",
    remarksPlaceholder: "Add Remarks",
    whatIsItFor: "What is the medicine for?",
    customChip: "+ Custom",
    conditions: {
      sugar: "Sugar",
      bp: "BP",
      acidity: "Acidity",
      thyroid: "Thyroid",
      asthma: "Asthma",
      other: "Other",
    },
    medicineAdded: "Medicine added.",
    medicineUpdated: "Medicine updated.",
    medicineRemoved: "Medicine removed.",
    removeMedicineTitle: "Remove this medicine?",
    removeMedicineBody:
      "It comes off your list. Everything you have already confirmed stays as it is.",
    noTimeOfDaySet: "No time of day set",
    /** Screen-reader sentence for the dots: the slots are already translated. */
    takenAt: (slots: string[]) =>
      slots.length === 1
        ? `Taken in the ${slots[0]}`
        : `Taken in the ${slots.slice(0, -1).join(", ")} and ${slots[slots.length - 1]}`,
    dotsQuestion: "What do the dots mean?",
    dotsHide: "Hide what the dots mean",
    dotsTitle: "What the dots mean",
    dotsBody:
      "The three dots are morning, afternoon and evening, in that order. A filled dot means you take that medicine at that time. An empty dot means you do not.",
    unconfirmed: "Unconfirmed",
    /** Today, at one slot. Never "missed" — confirmation is allowed any time. */
    taken: "Taken",
    skipped: "Skipped",
    notYet: "Not yet",
  },

  documents: {
    title: "Documents",
    addDocument: "Add Document",
    /** The family wording: he is putting HER report where she can find it. */
    uploadDocument: "Upload Document",
    none: "You have no uploaded documents.",
    chooseFile: "Choose a photo or PDF",
    fileFieldLabel: "Document",
    nameLabel: "Document Name",
    namePlaceholder: "Blood Test Report",
    dateLabel: "Date on the document",
    kindLabel: "What kind of document is it?",
    notesLabel: "Notes (optional)",
    notesPlaceholder: "Add Notes",
    types: {
      prescription: "Prescription",
      labReport: "Lab Report",
      scan: "Scan",
      bill: "Bill",
      other: "Other",
    },
    added: "Document added.",
    firstPageAlt: "First page of the document",
    /** "Page 1 of 4" */
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    pages: (n: number) => `${n} ${n === 1 ? "page" : "pages"}`,
    previewUnavailable:
      "We couldn't show a preview of this one. You can still open or download it.",
    loadFailed: "We couldn't load this document right now. Please try again.",
    removeTitle: "Remove this document?",
    removeBody: "It will be deleted from your documents. This cannot be undone.",
    removed: "Document removed.",
    open: "Open",
  },

  library: {
    title: "Learn & Live Better",
    subtitle: "Short, simple things to try",
    chooseSubject: "Choose a subject",
    filterByLanguage: "Filter by language",
    all: "All",
    comingSoon: "Gentle exercises and guidance will appear here.",
    nothingInLanguage: (language: string) => `Nothing here in ${language} yet.`,
    moreLikeThis: "More like this",
    shortLabel: "Short",
    watchOnYoutube: "Watch on YouTube",
    notMedicalAdvice: "For general wellbeing — not advice about your own treatment.",
    categories: {
      yoga_movement: "Yoga & Gentle Movement",
      pranayama_breathing: "Pranayama & Breathing",
      meditation_relaxation: "Meditation & Relaxation",
      walking_mobility: "Walking & Mobility",
      morning_daily_routine: "Morning & Daily Routine",
      healthy_ageing: "Healthy Ageing",
      food_wellness: "Food & Everyday Wellness",
      health_basics: "Health Basics",
      // The first five, kept only until the placeholder rows they label are
      // retired. Not in CATEGORY_ORDER, so they never appear as a chip.
      morning_routine: "Morning & Daily Routine",
      movement: "Movement & Exercise",
      mind: "Mind & Relaxation",
      health_education: "Health Education",
      food: "Food & Nutrition",
    },
  },

  profile: {
    title: "Profile",
    subtitle: "Manage your Profile",
    myProfile: "My Profile",
    you: "You",
    fullNameLabel: "Full Name",
    yourNameSheet: "Your Name",
    namePlaceholder: "Asha Sharma",
    emailLabel: "Email ID",
    changePhoto: "Change your photo",
    useGooglePhoto: "Use my Google photo",
    photoUpdated: "Photo updated.",
    usingGooglePhoto: "Using your Google photo.",
    nameUpdated: "Name updated.",

    preferences: "Preferences",
    notification: "Notification",
    remindersLabel: "Reminders",
    remindersOn: (state: string) => `Reminders: ${state}`,
    /** A family member gets updates about her, never reminders of their own. */
    updatesOn: (state: string) => `Updates about her: ${state}`,
    on: "On",
    off: "Off",
    remindersOffHint: "You can turn reminders off in your phone's settings.",
    /** Push needs an installed web app on iOS; Safari alone cannot receive it. */
    remindersNeedInstall: "Add Sakha to your Home Screen first, then turn reminders on.",
    remindersUnsupported: "This phone cannot show reminders.",
    remindersDenied: "Reminders are blocked. You can allow them in your phone's settings.",
    remindersOn2: "Reminders are on.",
    language: "Language",
    languageUpdated: "Language updated.",
    /**
     * The account switcher. Shown only to someone who belongs to more than
     * one account, which is most often a person tracking their own health who
     * has also been given a view of a parent's.
     */
    accounts: "Accounts",
    yourOwnAccount: "Your own account",
    /** Not "View only" — a family member can add readings and documents. */
    viewOnly: "Family access",
    /** "Family access · Son" — a middot, never a sentence, so no grammar to get wrong. */
    viewOnlyRelation: (relation: string) => `Family access · ${relation}`,
    currentlyOpen: "Currently open",
    switchTo: (name: string) => `Switch to ${name}`,
    /**
     * Changing which GOOGLE account is signed in — always offered, never
     * hidden on a count of what Sakha happens to know about. Google owns the
     * chooser; Sakha never reads the accounts on the device.
     */
    switchAccount: "Switch account",
    switchAccountHint: "Use a different Google account",
    signOut: "Sign out",
    signOutTitle: "Sign out of Sakha?",
    signOutBody:
      "Nothing is deleted. You can sign back in with Google whenever you like.",
    staySignedIn: "Stay signed in",
  },

  invitations: {
    title: "Invitations",
    none: "You have no invitations.",
    inviteFamilyMember: "Invite Family Member",
    inviteSheetTitle: "Invite Family Member",
    theirNameLabel: "Their Name",
    theirNamePlaceholder: "Rahul",
    relationQuestion: "How are they related to you?",
    customRelationLabel: "How are they related?",
    customRelationPlaceholder: "Sister",
    relations: {
      son: "Son",
      daughter: "Daughter",
      spouse: "Spouse",
      other: "Other",
    },
    familyFallback: "Family",
    familyMemberFallback: "Family member",
    whatTheySee: "What they will be able to see",
    whatTheySeeBody:
      "Your medicines, your readings and your documents. They can add a new reading or document for you, but cannot change or delete anything.",
    createLink: "Create link",
    creating: "Creating…",
    shareSheetTitle: "Send the link",
    ready: "Your invitation is ready",
    readyBody: (name: string) =>
      `Send this link to ${name}. It works once, and stops working after 14 days.`,
    shareLink: "Share link",
    sendOnWhatsapp: "Send on WhatsApp",
    shareMessage: (name: string) =>
      `${name}, here is a link to see my health information on Sakha.`,
    linkCopied: "Link copied.",
    copyFromBox: "Copy the link from the box above.",
    pending: "Waiting to be opened",
    expiredLink: "Link expired",
    connected: "Connected",
    /** The button on a pending card — cancels the invitation, not a dialog. */
    cancelInvite: "Cancel",
    /**
     * Sends a fresh link. It cannot resend the old one — only the hash was
     * ever stored — so the previous link stops working at the same moment.
     */
    reshare: "Send again",
    cancelled: "Invitation cancelled.",
    manage: "Manage",
    removeAccessTitle: "Remove their access?",
    removeAccessBody: (name: string) =>
      `${name} will no longer be able to see your information. You can invite them again later.`,
    keepAccess: "Keep access",
    revokeAccess: "Revoke Access",
    revoked: (name: string) => `${name} can no longer see your information.`,

    /**
     * The intro, before Google.
     *
     * The inviter's NAME, never a guessed relationship. The relation we store
     * is the invitee's side of it — "Son" — which says nothing about whether
     * the person who invited them is a mother or a father, and this screen is
     * not the place to guess at somebody's family.
     */
    invitedToSakha: (name: string) => `${name} has invited you to Sakha`,
    stayUpdated: "View their health information and stay updated.",
    /** The access confirmation, after Google. */
    viewTheirSakha: (name: string) => `View ${name}'s Sakha`,
    acceptAndContinue: "Accept & Continue",
    decline: "Decline",
    openTheirSakha: (name: string) => `Open ${name}'s Sakha`,
    alreadyConnected: (name: string) => `You already have access to ${name}'s Sakha`,
    alreadyConnectedBody: "There is nothing more to accept.",
    /**
     * Takes the RAW stored relation, not a translated label, because Hindi has
     * to inflect it and English does not. "Son" becomes "as their son"; Hindi
     * needs the oblique "उनके बेटे होने के नाते", which no amount of string
     * concatenation at the call site would get right.
     */
    asTheirRelation: (relation: string | null) => {
      const known: Record<string, string> = {
        son: "son",
        daughter: "daughter",
        spouse: "husband or wife",
      };
      const word = relation ? (known[relation.trim().toLowerCase()] ?? relation.trim()) : "";
      return word
        ? `As their ${word}, you can keep an eye on how they are doing.`
        : "You can keep an eye on how they are doing.";
    },
    cannotChange: (name: string) =>
      `You can also add new readings and documents. You cannot change or delete anything — only ${name} can do that.`,
    youWillSee: "You will be able to see",
    seeTodaysCare: "How their day is going, and what they have taken",
    seeMedicines: "Their medicines",
    seeReadings: "Their blood sugar, blood pressure and weight",
    seeDocuments: "Documents they have saved",
    opening: "Opening…",
    askForNew: "Ask them to send you a new one.",
    goToSakha: "Go to Sakha",
    alreadyUsed: "This invitation has already been used.",
    wasCancelled: "This invitation was cancelled.",
    expired: "This invitation has expired.",
    notFound: "We couldn't find this invitation.",
    signInFirst: "Please sign in first.",
    couldNotOpen: "We couldn't open this invitation. Please try again.",
    noLongerValid: "This invitation is no longer valid.",
  },

  errors: {
    saveFailed: "We couldn't save this. Please try again.",
    removeFailed: "We couldn't remove this. Please try again.",
    uploadFailed: "We couldn't upload this. Please try again.",
    notAllowed: "You don't have permission to add this.",
    fileTooLarge: "That file is too large.",
    enterName: "Please enter your name.",
    enterMedicineName: "Please enter the medicine name.",
    chooseWhen: "Please choose when you take it.",
    enterNumber: "Please enter a number.",
    enterBothNumbers: "Please enter both numbers.",
    chooseFile: "Please choose a file to add.",
    nameDocument: "Please give this document a name.",
    choosePhotoOrPdf: "Please choose a photo or a PDF.",
    documentTooLarge: "That file is too large. Please choose one under 25 MB.",
    choosePhoto: "Please choose a photo.",
    photoTooLarge: "That photo is too large. Please choose one under 10 MB.",
    enterTheirName: "Please enter their name.",
    chooseRelation: "Please choose how they are related to you.",
  },
};
