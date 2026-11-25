// ==================== ONE CHAT — BILINGUAL ENGINE (V3 — COMPLETE WITH 5-LOCK STRIP CONFESSION) ====================
window.currentAppLang = localStorage.getItem('onechat_lang') || 'en';

const I18N_DICT = {
  ta: {
    // Home / Entry Screen
    "Private Rooms • Zero Trace • Live Play & Calls": "தனிப்பட்ட அறைகள் • தடயமில்லா அரட்டை • நேரலை விளையாட்டு & அழைப்புகள்",
    "Your Display Name": "உங்கள் பெயர்",
    "YOUR DISPLAY NAME": "உங்கள் பெயர்",
    "Secret Room Code": "ரகசிய அறை குறியீடு",
    "SHARED ROOM CODE": "ரகசிய அறை குறியீடு",
    "SECRET ROOM CODE": "ரகசிய அறை குறியீடு",
    "Enter Private Room": "தனிப்பட்ட அறைக்குள் நுழையவும்",
    "Connect to Room": "அறையில் இணையவும்",
    "Encrypted P2P": "மறைகுறியாக்கப்பட்ட P2P",
    "Zero Trace": "தடயமில்லா பாதுகாப்பு",
    "No History Stored": "வரலாறு சேமிக்கப்படாது",
    "Live Arcade": "நேரலை விளையாட்டுகள்",
    "Connecting to TURN relay...": "பாதுகாப்பான இணைப்பு ஏற்படுத்தப்படுகிறது...",
    "Invite Link Copied!": "அழைப்பு இணைப்பு நகலெடுக்கப்பட்டது!",
    "Reconnecting...": "மீண்டும் இணைக்கப்படுகிறது...",
    "Waiting for partner to confirm 18+ mutual consent...": "18+ சம்மதத்தை துணை உறுதிப்படுத்தும் வரை காத்திருக்கிறது...",

    // Sidebar & Header
    "Always-On • Waiting...": "தயார் நிலை • நண்பர்களுக்காக காத்திருக்கிறது...",
    "Always-On • Waiting for peers...": "தயார் நிலை • நண்பர்களுக்காக காத்திருக்கிறது...",
    "Room Theme": "அறை தீம் (Theme)",
    "Sound Alerts": "ஒலி அறிவிப்புகள்",
    "Clear Chat & RAM": "அரட்டை & நினைவகத்தை அழி",
    "Leave Room": "அறையை விட்டு வெளியேறு",
    "End-to-End Encrypted": "முழுமையான மறைகுறியாக்கம்",
    "Message privately...": "தனிப்பட்ட செய்தி அனுப்பவும்...",
    "Partner is typing...": "நண்பர் தட்டச்சு செய்கிறார்...",
    "Burn Mode ON:": "ரகசிய அழிப்பு முறை:",
    "Messages self-destruct 10s after reading": "படித்த 10 வினாடிகளில் செய்தி தானாக அழியும்",
    "Off": "நிறுத்து",
    "Incoming Call...": "அழைப்பு வருகிறது...",
    "Incoming Voice Call...": "குரல் அழைப்பு வருகிறது...",
    "Incoming Video Call...": "வீடியோ அழைப்பு வருகிறது...",
    "Decline": "நிராகரி",
    "Answer": "ஏற்கவும்",
    "Encrypted Voice Call Active": "பாதுகாப்பான குரல் அழைப்பு இணைப்பில் உள்ளது",

    // Picker Tabs
    "Emojis": "எமோஜிகள்",
    "Stickers": "ஸ்டிக்கர்கள்",
    "FX": "ஒலிகள்",
    "Play & Apps": "விளையாட்டுகள்",
    "Surprises": "விளையாட்டுகள்",
    "🔥 18+": "🔥 18+ இரவு",

    // 26 Games & Apps Launchers
    "✊ RPS Duel": "✊ கல் காகிதம் கத்திரி",
    "❌⭕ Tic-Tac-Toe": "❌⭕ டிக்-டாக்-டோ",
    "🧠 Trivia Quiz": "🧠 பொது அறிவு வினாடி வினா",
    "🎡 Spin Wheel": "🎡 அதிர்ஷ்ட சக்கரம்",
    "📖 Story Chain": "📖 தொடர் கதை",
    "📊 Live Poll": "📊 நேரலை வாக்கெடுப்பு",
    "🎨 Whiteboard": "🎨 வெள்ளைப் பலகை",
    "⏱️ Sync Timer": "⏱️ நேரக் கடிகாரம்",
    "🎵 YT Jukebox": "🎵 யூடியூப் இசை",
    "💓 Pulse Pad": "💓 இதயத் துடிப்பு",
    "🔮 Telepathy": "🔮 மனக்கணிப்பு (Telepathy)",
    "🏓 Live Pong": "🏓 நேரலை பாங்",
    "🕵️ 2 Truths 1 Lie": "🕵️ 2 உண்மை 1 பொய்",
    "📸 Dual Snap": "📸 இரட்டை புகைப்படம்",
    "🎧 Soundscape": "🎧 இயற்கை ஒலிகள்",
    "🎹 Beat Studio": "🎹 இசை ஸ்டுடியோ",
    "⏳ Time Capsule": "⏳ காலப் பெட்டகம்",
    "👾 Pixel Art": "👾 பிக்சல் ஓவியம்",
    "🧊 3D Hologram": "🧊 3D ஹாலோகிராம்",
    "🪄 Vibe Oracle": "🪄 அதிர்ஷ்ட குறி",
    "🎟️ Scratch Card": "🎟️ சுரண்டிப் பார்க்கும் அட்டை",
    "🎉 Party Rain": "🎉 கொண்டாட்ட மழை",
    "🌸 Weather Aura": "🌸 வானிலை சூழல்",
    "🎙️ Voice Aura": "🎙️ குரல் எமோஜி",
    "⚡ Screen Buzz": "⚡ திரை அதிர்வு",
    "🚀 Zero-G Room": "🚀 ஈர்ப்பு விசை இல்லா அறை",

    // Game Modals & Controls
    "✊✋✌️ RPS Duel": "✊✋✌️ கல் காகிதம் கத்திரி",
    "Pick your move!": "உங்கள் தேர்வை அழுத்தவும்!",
    "Pick your move! Result reveals when both lock in.": "உங்கள் தேர்வை அழுத்தவும்! இருவரும் தேர்வு செய்ததும் முடிவு தெரியும்.",
    "Rock": "கல்",
    "Paper": "காகிதம்",
    "Scissors": "கத்திரி",
    "❌⭕ Tic-Tac-Toe": "❌⭕ டிக்-டாக்-டோ",
    "Reset Board": "புதிய ஆட்டம்",
    "🧠 Live Trivia Quiz": "🧠 நேரலை வினாடி வினா",
    "New Question": "புதிய கேள்வி",
    "🎡 Decision Spin Wheel": "🎡 முடிவு எடுக்கும் சக்கரம்",
    "Tap Spin!": "சுழற்றவும்!",
    "Spin for Room": "சக்கரத்தை சுழற்று",
    "📖 Blind Story Chain": "📖 ரகசிய தொடர் கதை",
    "Start the first line!": "கதையின் முதல் வரியை எழுதுங்கள்!",
    "Start the first line of the story!": "கதையின் முதல் வரியை எழுதுங்கள்!",
    "Add Line": "வரி சேர்",
    "Reveal Story": "கதையை திற",
    "📊 Create Live Poll": "📊 நேரலை வாக்கெடுப்பு உருவாக்கு",
    "Launch Poll": "வாக்கெடுப்பை தொடங்கு",
    "🎨 Shared Live Whiteboard": "🎨 பகிரப்பட்ட ஓவியப் பலகை",
    "Clear Canvas": "பலகையை அழி",
    "⏱️ Synced Room Timer": "⏱️ அறை நேரக் கடிகாரம்",
    "Start for Everyone": "அனைவருக்கும் தொடங்கு",
    "🎵 Synced YouTube Jukebox": "🎵 யூடியூப் இசைப் பெட்டி",
    "Play": "இயக்கு",
    "💓 Tactile Pulse Pad": "💓 இதயத் துடிப்பு பலகை",
    "TAP / HOLD": "அழுத்தவும்",
    "🔮 Telepathy Sync": "🔮 மனக்கணிப்பு விளையாட்டு",
    "Type the exact same word at the same time!": "இருவரும் ஒரே வார்த்தையை ஒரே நேரத்தில் யோசித்து எழுதுங்கள்!",
    "Lock Word": "வார்த்தையை பூட்டு",
    "🏓 Live P2P Pong": "🏓 நேரலை பாங் விளையாட்டு",
    "🕵️ Two Truths & A Lie": "🕵️ இரண்டு உண்மைகள் & ஒரு பொய்",
    "Challenge Room": "சவால் விடு",
    "📸 Split-Reality Dual Snap": "📸 நேரலை செல்ஃபி புகைப்படம்",
    "Capture Dual Snap": "புகைப்படம் எடு",
    "🎧 Ambient Soundscape": "🎧 அமைதி தரும் இயற்கை ஒலிகள்",
    "🌧️ Rain": "🌧️ மழை",
    "🔥 Fireplace": "🔥 நெருப்பு",
    "🌊 Ocean": "🌊 கடல் அலை",
    "🔇 Stop": "🔇 நிறுத்து",
    "🎹 Co-Op Live Beat Studio": "🎹 நேரலை இசை ஸ்டுடியோ",
    "⏳ Time Capsule Message": "⏳ காலப் பெட்டக செய்தி",
    "Seal Capsule": "பெட்டகத்தை பூட்டு",
    "👾 16×16 Co-Op Pixel Art": "👾 கூட்டு பிக்சல் ஓவியம்",
    "Post to Chat": "அரட்டையில் பகிர்",
    "🧊 3D Hologram Cipher": "🧊 3D ஹாலோகிராம் ரகசிய செய்தி",
    "Transmit Hologram": "ஹாலோகிராம் அனுப்பு",
    "🪄 Vibe Oracle": "🪄 அதிர்ஷ்ட குறி மேடை",
    "Ask the Oracle": "குறி கேளுங்கள்",

    // Couples Vault & 5-Lock Strip Confession
    "🔓 5-Lock Strip Confession": "🔓 5-பூட்டு ரகசிய சவால்",
    "Your Locks": "உங்கள் பூட்டுகள்",
    "Partner Locks": "துணையின் பூட்டுகள்",
    "🔥 Confession Prompt": "🔥 ரகசிய கேள்வி",
    "Shuffle Prompt": "வேறு கேள்வி",
    "1. Your Honest Secret Answer": "1. உங்கள் உண்மையான ரகசிய பதில்",
    "Type your unfiltered answer...": "உங்கள் பதிலை வெளிப்படையாக எழுதுங்கள்...",
    "2. Guess What Your Partner Will Say": "2. உங்கள் துணை என்ன சொல்வார் என கணிக்கவும்",
    "Wrong guess = 1 Lock breaks (remove 1 item)...": "தவறான கணிப்பு = 1 பூட்டு உடையும் (1 ஆடையை குறைக்கவும்)...",
    "🔐 Lock In Confession & Guess": "🔐 பதிலையும் கணிப்பையும் பூட்டு",
    "Ask your own bold question...": "உங்கள் சொந்த துணிச்சலான கேள்வியை கேளுங்கள்...",
    "Set": "அமை",
    "Reset All 5 Locks": "5 பூட்டுகளையும் புதிதாக்கு",
    "🔥 Truth or Dare": "🔥 உண்மையா சவாலா",
    "🎲 Intimacy Dice": "🎲 காதல் பகடை",
    "❤️‍🔥 Desire Match": "❤️‍🔥 விருப்பப் பொருத்தம்",
    "🎟️ Love Coupon": "🎟️ காதல் கூப்பன்",
    "🛡️ Activate Panic Shield": "🛡️ அவசர திரை மறைப்பு",
    "🔥 After-Hours Truth or Dare": "🔥 இரவு நேர உண்மையா சவாலா",
    "Draw Random Card": "அட்டை எடுக்கவும்",
    "Flirty & Romantic": "காதல் & ரொமான்ஸ்",
    "Spicy & Bold": "துணிச்சலான & காரசாரமான",
    "After-Hours 18+": "இரவு நேர 18+",
    "Draw Truth": "உண்மை (Truth)",
    "Draw Dare": "சவால் (Dare)",
    "✍️ Ask Your Own Custom Question / Dare": "✍️ உங்கள் சொந்த கேள்வி / சவாலை கேளுங்கள்",
    "Send as Truth": "உண்மையாக அனுப்பு",
    "Send as Dare": "சவாலாக அனுப்பு",
    "❤️‍🔥 Blind Desire Matcher": "❤️‍🔥 ரகசிய விருப்பப் பொருத்தம்",
    "Swipe privately. Only mutual \"YES\" cards are revealed to both of you!": "தனிப்பட்ட முறையில் தேர்வு செய்யுங்கள். இருவரும் \"ஆம்\" சொன்னவை மட்டுமே காட்டப்படும்!",
    "Pass": "வேண்டாம்",
    "❤️‍🔥 Yes": "❤️‍🔥 ஆம்",
    "🎟️ After-Hours Scratch Coupon": "🎟️ காதல் பரிசு கூப்பன்",
    "Send Scratch Coupon": "கூப்பன் அனுப்பு",
    "Confirm 18+ & Enter Vault": "18+ உறுதிசெய்து உள்ளே நுழையவும்"
  }
};

let EN_COUPLES_TOD_BACKUP = null;
let EN_DESIRE_DECK_BACKUP = null;

const TA_COUPLES_TOD = {
  flirty: {
    TRUTH: [
      "நாம் முதன்முதலில் சந்தித்தபோது என்னைப் பற்றி உங்களுக்குத் தோன்றிய முதல் எண்ணம் என்ன?",
      "நான் எந்த உடையில் இருக்கும்போது உங்களால் கவனத்தை சிதறவிடாமல் இருக்க முடியாது?",
      "நாம் இருவர் மட்டுமே தனியாக இருந்த தருணங்களில் உங்களுக்கு மிகவும் பிடித்த நினைவு எது?",
      "என் மீது உங்களுக்கு காதல் இருப்பதை முதன்முதலில் எப்போது உணர்ந்தீர்கள்?",
      "என்னுடைய எந்த சின்ன பழக்கம் உங்களுக்கு மிகவும் பிடிக்கும்?",
      "நாம் பகிர்ந்து கொண்ட மிகச் சிறந்த முத்தம் எது?",
      "இன்றிரவு நாம் எங்கு வேண்டுமானாலும் செல்லலாம் என்றால், எங்கு செல்ல விரும்புவீர்கள்?",
      "எந்தப் பாடலைக் கேட்டாலும் உடனே என் நினைவு வரும்?"
    ],
    DARE: [
      "இப்போது உங்களுக்கு என்ன வேண்டும் என்பதை 5 வினாடி குரல் பதிவில் (Voice Note) கிசுகிசுப்பாகச் சொல்லுங்கள்.",
      "உங்கள் அழகான புன்னகையுடன் ஒரு செல்ஃபி அனுப்புங்கள்.",
      "Backspace பயன்படுத்தாமல் ஒரு காதல் வாக்கியத்தை தட்டச்சு செய்து அனுப்புங்கள்.",
      "நமது கனவு விடுமுறையை எமோஜிகள் மூலம் மட்டும் விவரியுங்கள்.",
      "இன்றிரவு நான் உங்களை அழைக்க ஒரு புதிய செல்லப் பெயர் கொடுங்கள்.",
      "என் கண்களைப் பற்றி இரண்டு வரி கவிதை எழுதுங்கள்."
    ]
  },
  spicy: {
    TRUTH: [
      "என்னிடம் கேட்கத் தயங்கிய ஒரு ரொமான்டிக் ஆசை என்ன?",
      "உங்கள் உடலில் மெதுவாக முத்தமிடப்பட வேண்டிய மிகப் பிடித்த இடம் எது?",
      "நம் இருவரைப் பற்றிய உங்கள் மிகத் துணிச்சலான பகற்கனவு என்ன?",
      "மெதுவான சீண்டல் பிடிக்குமா அல்லது வேகமான காதல் பிடிக்குமா?",
      "என்னுடைய எந்தத் தொடுதல் உங்களுக்கு உடனே சிலிர்ப்பை ஏற்படுத்தும்?",
      "என் உடலில் நீங்கள் தொட மிகவும் விரும்பும் பகுதி எது?"
    ],
    DARE: [
      "நான் இப்போது உங்கள் அறைக்குள் வந்தால் என்ன செய்வீர்கள் என்பதை விவரியுங்கள்.",
      "10 வினாடியில் அழியும் ரகசிய செய்தியில் (Burn Mode) ஒரு துணிச்சலான உண்மையை அனுப்புங்கள்.",
      "என் பெயரை உங்கள் ஆழமான குரலில் அழைத்து ஒரு Voice Note அனுப்புங்கள்.",
      "காதல் பகடையை (Intimacy Dice) உருட்டி, அதில் வருவதை அடுத்த சந்திப்பில் நிறைவேற்றுவதாக வாக்களியுங்கள்.",
      "வெள்ளைப் பலகையில் (Whiteboard) அடுத்து எங்கு முத்தம் வேண்டும் என்பதை வரைந்து காட்டுங்கள்."
    ]
  },
  afterhours: {
    TRUTH: [
      "என்னுடன் நிறைவேற்ற விரும்பும் உங்களின் #1 ரகசிய 18+ கற்பனை என்ன?",
      "படுக்கையில் நான் செய்யும் எந்த விஷயம் உங்களை முழுமையாகக் கிறங்கடிக்கும்?",
      "நாம் இணைய வேண்டும் என நீங்கள் ஆசைப்பட்ட மிகத் துணிச்சலான இடம் எது?",
      "மெழுகுவர்த்தி வெளிச்சமா அல்லது முழு இருட்டா — எது உங்களுக்கு அதிக கிளர்ச்சியைத் தரும்?",
      "இன்றிரவு எந்த விதிகளும் இல்லாமல் என்னைக் கட்டுப்படுத்தலாம் என்றால் முதலில் என்ன செய்வீர்கள்?",
      "கட்டுப்பாட்டை உங்கள் கையில் வைத்திருக்கப் பிடிக்குமா அல்லது என்னிடம் ஒப்படைக்கப் பிடிக்குமா?"
    ],
    DARE: [
      "இன்றிரவுக்கான உங்கள் ரகசியத் திட்டத்தை ஒரு Voice Note-ல் விவரியுங்கள்.",
      "இப்போது நீங்கள் என்ன அணிந்திருக்கிறீர்கள் என்பதை ரகசிய செய்தியில் (Secret Mode) அனுப்புங்கள்.",
      "இன்றிரவு நீங்கள் கேட்கும் எந்த ஒரு விருப்பத்திற்கும் 'ஆம்' என ஒரு காதல் கூப்பன் அனுப்புங்கள்.",
      "தொடர்ந்து இரண்டு முறை காதல் பகடையை (Intimacy Dice) உருட்டுங்கள்.",
      "Custom Dare மூலம் எனக்கு ஒரு துணிச்சலான சவால் கொடுங்கள்."
    ]
  }
};

const TA_DICE_ACTIONS = [
  'மெதுவான முத்தம்', 'ரொமான்டிக் மசாஜ்', 'ரகசிய ஆசை கிசுகிசுப்பு', 'கண்களைக் கட்டி சீண்டல்',
  'கழுத்தில் முத்தம்', 'ஒரு ஆடையைக் குறைத்தல்', 'விரல் நுனி வருடல்', 'கண்ணோடு கண் பார்த்தல்'
];
const TA_DICE_TARGETS = [
  { label: 'உதடுகள் • 30வி', secs: 30 },
  { label: 'கழுத்து & தோள்பட்டை • 60வி', secs: 60 },
  { label: 'கைகள் & மணிக்கட்டு • 45வி', secs: 45 },
  { label: 'இடுப்புப் பகுதி • 60வி', secs: 60 },
  { label: 'உங்களுக்குப் பிடித்த இடம் • 60வி', secs: 60 }
];
const TA_DESIRE_DECK = [
  "மெல்லிய இசையுடன் இரவு நேர எண்ணெய் மசாஜ்",
  "கண்களைக் கட்டி சுவை மற்றும் தொடுதல் விளையாட்டு",
  "புதியவர்கள் போல சந்தித்து நடிக்கும் Roleplay",
  "மொபைல் இல்லாமல் ஒன்றாக குளியல்",
  "சவால்களுடன் கூடிய உண்மையா சவாலா ஆட்டம்",
  "காலை உணவுடன் படுக்கையிலேயே ஓய்வெடுக்கும் நாள்",
  "நள்ளிரவு நீண்ட கார் பயணம்",
  "இரவு முழுவதும் ஒருவரின் முழு கட்டுப்பாட்டில் இருத்தல்"
];

function injectHomeLanguageSwitcher() {
  const authCard = document.querySelector('#authOverlay > div');
  if (!authCard || document.getElementById('langSwitcherBar')) return;

  const bar = document.createElement('div');
  bar.id = 'langSwitcherBar';
  bar.className = 'flex items-center justify-center gap-1.5 mb-4 p-1 rounded-xl bg-black/35 border border-white/10 w-fit mx-auto';
  bar.innerHTML = `
    <button type="button" id="langBtnEn" onclick="setAppLanguage('en')" class="px-3 py-1 rounded-lg text-[11px] font-bold transition">English</button>
    <button type="button" id="langBtnTa" onclick="setAppLanguage('ta')" class="px-3 py-1 rounded-lg text-[11px] font-bold transition">தமிழ்</button>
  `;
  authCard.prepend(bar);
  updateLangPillStyles();
}

function updateLangPillStyles() {
  const enBtn = document.getElementById('langBtnEn');
  const taBtn = document.getElementById('langBtnTa');
  if (!enBtn || !taBtn) return;
  const isTa = window.currentAppLang === 'ta';
  enBtn.className = !isTa
    ? 'px-3 py-1 rounded-lg text-[11px] font-bold theme-accent shadow'
    : 'px-3 py-1 rounded-lg text-[11px] font-bold theme-muted hover:text-white';
  taBtn.className = isTa
    ? 'px-3 py-1 rounded-lg text-[11px] font-bold theme-accent shadow'
    : 'px-3 py-1 rounded-lg text-[11px] font-bold theme-muted hover:text-white';
}

window.setAppLanguage = function(lang) {
  window.currentAppLang = lang === 'ta' ? 'ta' : 'en';
  localStorage.setItem('onechat_lang', window.currentAppLang);
  updateLangPillStyles();

  if (typeof todVaultBank !== 'undefined') {
    if (!EN_COUPLES_TOD_BACKUP) EN_COUPLES_TOD_BACKUP = JSON.parse(JSON.stringify(todVaultBank));
    Object.assign(todVaultBank, window.currentAppLang === 'ta' ? TA_COUPLES_TOD : EN_COUPLES_TOD_BACKUP);
  }
  if (typeof desireDeck !== 'undefined') {
    if (!EN_DESIRE_DECK_BACKUP) EN_DESIRE_DECK_BACKUP = [...desireDeck];
    desireDeck.length = 0;
    desireDeck.push(...(window.currentAppLang === 'ta' ? TA_DESIRE_DECK : EN_DESIRE_DECK_BACKUP));
  }

  applyDOMTranslations(document.body, window.currentAppLang);
};

let isApplyingTranslation = false;
function applyDOMTranslations(root, targetLang = window.currentAppLang) {
  if (!root || isApplyingTranslation) return;
  isApplyingTranslation = true;

  try {
    const dict = {};
    if (targetLang === 'ta') {
      Object.assign(dict, I18N_DICT.ta);
    } else {
      for (const [en, ta] of Object.entries(I18N_DICT.ta)) {
        dict[ta] = en;
      }
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#licenseModal, #openLicenseModalBtn, script, style')) {
          return NodeFilter.FILTER_REJECT;
        }
        const txt = node.nodeValue.trim();
        if (!txt) return NodeFilter.FILTER_REJECT;
        return dict[txt] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });

    const nodesToUpdate = [];
    while (walker.nextNode()) nodesToUpdate.push(walker.currentNode);
    for (const n of nodesToUpdate) {
      const raw = n.nodeValue;
      const trimmed = raw.trim();
      if (dict[trimmed]) {
        n.nodeValue = raw.replace(trimmed, dict[trimmed]);
      }
    }

    root.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      if (el.closest('#licenseModal')) return;
      const ph = el.getAttribute('placeholder')?.trim();
      if (ph && dict[ph]) {
        el.setAttribute('placeholder', dict[ph]);
      }
    });
  } finally {
    isApplyingTranslation = false;
  }
}

const i18nObserver = new MutationObserver((mutations) => {
  if (window.currentAppLang !== 'ta' || isApplyingTranslation) return;
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeType === 1 && !node.closest('#licenseModal')) {
        applyDOMTranslations(node, 'ta');
      }
    }
  }
});

window.addEventListener('load', () => {
  const origRoll = window.rollIntimacyDice;
  if (typeof origRoll === 'function') {
    window.rollIntimacyDice = function() {
      if (window.currentAppLang !== 'ta') return origRoll.apply(this, arguments);
      const pick = TA_DICE_TARGETS[Math.floor(Math.random() * TA_DICE_TARGETS.length)];
      const roll = {
        id: 'dice_' + Date.now(),
        action: TA_DICE_ACTIONS[Math.floor(Math.random() * TA_DICE_ACTIONS.length)],
        target: pick.label,
        secs: pick.secs,
        roller: myName
      };
      broadcastData({ type: 'AH_DICE_ROLL', roll });
      if (typeof renderIntimacyDiceCard === 'function') renderIntimacyDiceCard(roll, true);
    };
  }
});

window.addEventListener('DOMContentLoaded', () => {
  injectHomeLanguageSwitcher();
  i18nObserver.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => {
    if (window.currentAppLang === 'ta') {
      setAppLanguage('ta');
    }
  }, 150);
});
