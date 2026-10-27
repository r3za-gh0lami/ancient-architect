/**
 * Ancient Architect (معمار کهن) - Core Application Logic
 * Full Feature Set:
 * 1. 3 Interactive Civilizations (Persepolis, Isfahan, Yazd)
 * 2. Pomodoro Focus Engine with Scaffolding & Live Construction
 * 3. Weekly Analytics & Study Breakdown (شنبه تا جمعه)
 * 4. Museum of Ancient Artifacts (موزه کشفیات باستان‌شناسی)
 * 5. Aesthetic Instagram Story Card Generator (Canvas Export to PNG)
 * 6. Local Storage Persistence (100% Offline & Serverless)
 */

const STORAGE_KEY = 'ancient_architect_save_v1';

// Default / Initial State
let APP_STATE = {
  currentScreen: 'home', // 'home', 'active', 'ruined', 'civs', 'stats', 'museum'
  coins: 1240,
  streakDays: 5,
  currentCiv: 'persepolis', // 'persepolis', 'isfahan', 'yazd'
  
  // Timer settings
  timerDuration: 25 * 60,
  timeLeft: 25 * 60,
  timerInterval: null,
  isRunning: false,
  strictMode: true,
  selectedCategory: 'درس و کنکور',

  // Civilizations Progress
  civilizations: {
    persepolis: {
      name: "تمدن پارسه (تخت جمشید)",
      era: "دوره هخامنشی • کاخ آپادانا",
      bricks: 48,
      level: 3,
      maxBricks: 60,
      unlocked: true,
      color: "#14b8a6"
    },
    isfahan: {
      name: "نصف جهان (اصفهان صفوی)",
      era: "دوره صفویه • مسجد شیخ لطف‌الله",
      bricks: 14,
      level: 1,
      maxBricks: 70,
      unlocked: true,
      color: "#0284c7"
    },
    yazd: {
      name: "شهر بادگیرها (یزد کهن)",
      era: "معماری خشتی، قنات و بادگیرها",
      bricks: 8,
      level: 1,
      maxBricks: 50,
      unlocked: true,
      color: "#f59e0b"
    }
  },

  // Weekly Study History (Minutes focused per day)
  weeklyStats: {
    'شنبه': 110,
    'یکشنبه': 145,
    'دوشنبه': 90,
    'سه‌شنبه': 160,
    'چهارشنبه': 125,
    'پنجشنبه': 180,
    'جمعه': 75
  },

  // Category Distribution (Total minutes)
  categoryStats: {
    'درس و کنکور': 480,
    'کتابخوانی': 210,
    'کار عمیق': 195
  },

  // Museum Artifacts
  artifacts: [
    {
      id: 'rhyton',
      name: 'ریتون زرین هخامنشی',
      era: 'قرن پنجم پیش از میلاد',
      desc: 'جام طلایی با سر شیر بالدار، نماد قدرت و هنر زرگری ایران باستان.',
      unlocked: true,
      icon: '🦁'
    },
    {
      id: 'cyrus_cylinder',
      name: 'استوانه کوروش بزرگ',
      era: 'بابل کهن • ۵۳۹ پیش از میلاد',
      desc: 'نخستین منشور حقوق بشر جهان با خط میخی بابلی بر گل رس پخته.',
      unlocked: true,
      icon: '📜'
    },
    {
      id: 'daric_coin',
      name: 'سکه دریک زرین',
      era: 'دوره داریوش بزرگ',
      desc: 'سکه طلای خالص استاندارد با تصویر کماندار پارسی.',
      unlocked: false,
      icon: '🪙'
    },
    {
      id: 'marlik_cup',
      name: 'جام زرین مارلیک',
      era: 'هزاره دوم پیش از میلاد',
      desc: 'جام زرین با نقش گاوهای بالدار در حال صعود به درخت زندگی.',
      unlocked: false,
      icon: '🏆'
    },
    {
      id: 'yazd_pottery',
      name: 'کوزه سفالین کاریز',
      era: 'تمدن کهن کویر یزد',
      desc: 'سفال لعابدار خنک‌کننده آب قنات، کشف شده در عمق قنات زارچ.',
      unlocked: false,
      icon: '🏺'
    }
  ],

  // Ruined session state
  isRuined: false,
  graceSecondsLeft: 30,
  graceInterval: null,
  soundActive: false
};

const PERSIAN_QUOTES = [
  { quote: "«توانا بود هر که دانا بود»", author: "ز دانش دل پیر برنا بود — فردوسی" },
  { quote: "«صبر و ظفر هر دو دوستان قدیمند»", author: "بر اثر صبر نوبت ظفر آید — حافظ" },
  { quote: "«هر که در طلب گوهر است، غواصی باید»", author: "بزرگی به رنج است و سعی — سعدی" },
  { quote: "«گر صبر کنی ز غوره حلوا سازی»", author: "پند کهن پارسی" }
];

// Load Saved State on start
function loadSaveData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      APP_STATE = { ...APP_STATE, ...parsed };
    }
  } catch (e) {
    console.warn("Could not load previous save data, using defaults.", e);
  }
}

function persistSaveData() {
  try {
    const toSave = {
      coins: APP_STATE.coins,
      streakDays: APP_STATE.streakDays,
      currentCiv: APP_STATE.currentCiv,
      civilizations: APP_STATE.civilizations,
      weeklyStats: APP_STATE.weeklyStats,
      categoryStats: APP_STATE.categoryStats,
      artifacts: APP_STATE.artifacts
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn("Could not persist save data.", e);
  }
}

// Convert numbers to Persian Digits
function toPersianDigits(str) {
  if (str === null || str === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.toString().replace(/\d/g, x => farsiDigits[x]);
}

function formatPersianTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const mStr = mins < 10 ? '0' + mins : '' + mins;
  const sStr = secs < 10 ? '0' + secs : '' + secs;
  return toPersianDigits(`${mStr}:${sStr}`);
}

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  loadSaveData();
  renderAllViews();
  setupStrictMonitoring();
});

function renderAllViews() {
  renderCoinsAndStreak();
  updateCivDisplay();
  updateTimerDisplay();
  renderWeeklyChart();
  renderMuseum();
}

function renderCoinsAndStreak() {
  document.querySelectorAll('.coins-value').forEach(el => {
    el.innerText = toPersianDigits(APP_STATE.coins.toLocaleString('en-US'));
  });
  document.querySelectorAll('.streak-value').forEach(el => {
    el.innerText = toPersianDigits(APP_STATE.streakDays) + ' روز';
  });
}

function setScreen(screenName) {
  if (window.soundEngine) window.soundEngine.playStoneClick();
  APP_STATE.currentScreen = screenName;

  document.querySelectorAll('.view-screen').forEach(view => view.classList.add('hidden'));
  const targetView = document.getElementById('view-' + screenName);
  if (targetView) targetView.classList.remove('hidden');

  // Desktop pills
  document.querySelectorAll('.screen-pill-btn').forEach(btn => {
    btn.classList.remove('bg-teal-600', 'text-white', 'shadow');
    btn.classList.add('text-slate-400');
  });
  const activePill = document.getElementById('pill-' + screenName);
  if (activePill) {
    activePill.classList.add('bg-teal-600', 'text-white', 'shadow');
    activePill.classList.remove('text-slate-400');
  }

  // Mobile bottom tabs
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('text-teal-400'));
  const activeNav = document.getElementById('nav-' + (screenName === 'active' ? 'home' : screenName));
  if (activeNav) activeNav.classList.add('text-teal-400');

  // Trigger chart or museum re-renders
  if (screenName === 'stats') renderWeeklyChart();
  if (screenName === 'museum') renderMuseum();
}

// CIVILIZATION SWITCHING & VISUALS
function updateCivDisplay() {
  const civ = APP_STATE.civilizations[APP_STATE.currentCiv];
  const nameEl = document.getElementById('civ-title');
  const eraEl = document.getElementById('civ-era');
  const progTextEl = document.getElementById('civ-progress-text');
  const progBarEl = document.getElementById('civ-progress-bar');
  const visualContainer = document.getElementById('monument-visual-container');

  const percent = Math.min(100, Math.round((civ.bricks / civ.maxBricks) * 100));

  if (nameEl) nameEl.innerText = civ.name;
  if (eraEl) eraEl.innerText = `${civ.era} • سطح ${toPersianDigits(civ.level)}`;
  if (progTextEl) progTextEl.innerText = toPersianDigits(percent) + '٪';
  if (progBarEl) progBarEl.style.width = percent + '%';

  // Render Visuals based on chosen Civilization
  if (visualContainer) {
    if (APP_STATE.currentCiv === 'persepolis') {
      // 3D Engine for Persepolis (Test Phase)
      if (window.Engine3D) {
        if (!window.Engine3D.isInitialized) {
          window.Engine3D.init(visualContainer);
        }
        window.Engine3D.updateProgress(percent);
      }
    } else {
      // SVG Fallback for others
      if (window.Engine3D && window.Engine3D.isInitialized) {
        window.Engine3D.stop();
      }
      visualContainer.innerHTML = getCivilizationSVG(APP_STATE.currentCiv);
    }
  }
}

function selectCivilization(civKey) {
  if (window.soundEngine) window.soundEngine.playStoneClick();
  APP_STATE.currentCiv = civKey;
  persistSaveData();
  updateCivDisplay();
  setScreen('home');
}

function getCivilizationSVG(civKey) {
  if (civKey === 'isfahan') {
    // Isfahan: Turquoise Dome of Sheikh Lotfollah & Ali Qapu Balcony
    return `
      <svg class="w-52 h-36 drop-shadow-2xl" viewBox="0 0 200 130">
        <!-- Base Platform -->
        <polygon points="100,20 180,60 100,100 20,60" fill="#134e4a" stroke="#0d9488" stroke-width="2"/>
        <polygon points="20,60 100,100 100,115 20,75" fill="#042f2e"/>
        <polygon points="100,100 180,60 180,75 100,115" fill="#022c22"/>
        <!-- Turquoise Dome (گنبد فیروزه‌ای صفوی) -->
        <path d="M70,55 Q100,-5 130,55 Z" fill="#0ea5e9" stroke="#38bdf8" stroke-width="1.5"/>
        <path d="M85,55 Q100,15 115,55 Z" fill="#0284c7"/>
        <line x1="100" y1="2" x2="100" y2="-12" stroke="#f59e0b" stroke-width="2.5"/>
        <circle cx="100" cy="-14" r="3" fill="#facc15"/>
        <!-- Ali Qapu Pillars on Left -->
        <rect x="35" y="25" width="6" height="35" rx="1" fill="#b45309"/>
        <rect x="48" y="25" width="6" height="35" rx="1" fill="#b45309"/>
        <rect x="32" y="20" width="25" height="6" rx="1" fill="#78350f"/>
        <!-- Tiled Portal -->
        <rect x="88" y="42" width="24" height="30" rx="6" fill="#042f2e" stroke="#2dd4bf" stroke-width="1"/>
        <!-- Courtyard Fountain -->
        <ellipse cx="100" cy="85" rx="18" ry="8" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
        <circle cx="100" cy="84" r="2.5" fill="#ffffff" class="animate-ping"/>
      </svg>
    `;
  } else if (civKey === 'yazd') {
    // Yazd: Adobe Windcatchers & Desert Architecture
    return `
      <svg class="w-52 h-36 drop-shadow-2xl" viewBox="0 0 200 130">
        <!-- Desert Ground -->
        <polygon points="100,20 180,60 100,100 20,60" fill="#291c10" stroke="#78350f" stroke-width="2"/>
        <polygon points="20,60 100,100 100,115 20,75" fill="#1c1208"/>
        <polygon points="100,100 180,60 180,75 100,115" fill="#140c05"/>
        <!-- Mud-brick Adobe Houses (خانه‌های کاه‌گلی) -->
        <rect x="50" y="40" width="45" height="35" rx="2" fill="#b45309"/>
        <rect x="105" y="45" width="45" height="30" rx="2" fill="#92400e"/>
        <!-- Tall Windcatchers (بادگیرهای بلند) -->
        <rect x="60" y="5" width="16" height="42" rx="1" fill="#d97706" stroke="#92400e" stroke-width="1"/>
        <line x1="64" y1="10" x2="64" y2="30" stroke="#78350f" stroke-width="1.5"/>
        <line x1="68" y1="10" x2="68" y2="30" stroke="#78350f" stroke-width="1.5"/>
        <line x1="72" y1="10" x2="72" y2="30" stroke="#78350f" stroke-width="1.5"/>
        <rect x="58" y="2" width="20" height="5" rx="1" fill="#78350f"/>
        <!-- Second Windcatcher -->
        <rect x="120" y="15" width="14" height="35" rx="1" fill="#d97706"/>
        <line x1="124" y1="20" x2="124" y2="35" stroke="#78350f" stroke-width="1.2"/>
        <line x1="128" y1="20" x2="128" y2="35" stroke="#78350f" stroke-width="1.2"/>
        <!-- Desert Stars & Lantern -->
        <circle cx="160" cy="18" r="1.5" fill="#fef08a"/>
        <circle cx="35" cy="15" r="1.2" fill="#fef08a"/>
        <circle cx="85" cy="55" r="3" fill="#f59e0b" class="anim-torch"/>
      </svg>
    `;
  } else {
    // Default: Persepolis (تخت جمشید)
    return `
      <svg class="w-52 h-36 drop-shadow-2xl" viewBox="0 0 200 130">
        <!-- Stone Platform -->
        <polygon points="100,10 180,50 100,90 20,50" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <polygon points="20,50 100,90 100,105 20,65" fill="#0f172a"/>
        <polygon points="100,90 180,50 180,65 100,105" fill="#090d16"/>
        <!-- Ancient Columns -->
        <rect x="55" y="15" width="12" height="42" rx="2" fill="#cbd5e1"/>
        <polygon points="50,15 72,15 67,10 55,10" fill="#f59e0b"/>
        <rect x="135" y="15" width="12" height="42" rx="2" fill="#cbd5e1"/>
        <polygon points="130,15 152,15 147,10 135,10" fill="#f59e0b"/>
        <!-- Apadana Gate Portal -->
        <rect x="92" y="5" width="16" height="52" rx="2" fill="#e2e8f0"/>
        <rect x="95" y="18" width="10" height="36" rx="4" fill="#0b1120"/>
        <!-- Guarding Torches with flicker -->
        <circle cx="55" cy="38" r="3.5" fill="#f59e0b" class="anim-torch"/>
        <circle cx="145" cy="38" r="3.5" fill="#f59e0b" class="anim-torch"/>
      </svg>
    `;
  }
}

// TIMER ENGINE
function setTimerPreset(minutes) {
  if (window.soundEngine) window.soundEngine.playStoneClick();
  if (APP_STATE.isRunning) return;
  APP_STATE.timerDuration = minutes * 60;
  APP_STATE.timeLeft = APP_STATE.timerDuration;
  updateTimerDisplay();

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('bg-teal-600', 'text-white');
    btn.classList.add('bg-slate-800', 'text-slate-300');
  });
  const activeBtn = document.getElementById('preset-' + minutes);
  if (activeBtn) {
    activeBtn.classList.add('bg-teal-600', 'text-white');
    activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
  }
}

function selectCategory(categoryName) {
  if (window.soundEngine) window.soundEngine.playStoneClick();
  APP_STATE.selectedCategory = categoryName;
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.remove('bg-teal-600', 'text-white');
    b.classList.add('bg-slate-800', 'text-slate-400');
  });
  const active = document.getElementById('cat-' + categoryName);
  if (active) {
    active.classList.add('bg-teal-600', 'text-white');
    active.classList.remove('bg-slate-800', 'text-slate-400');
  }
}

function startFocusSession() {
  if (window.soundEngine) {
    window.soundEngine.playStoneClick();
    window.soundEngine.startAllActive();
  }
  APP_STATE.soundActive = true;
  updateSoundButtonUI();

  APP_STATE.isRunning = true;
  APP_STATE.isRuined = false;
  setScreen('active');

  // Random wisdom quote
  const q = PERSIAN_QUOTES[Math.floor(Math.random() * PERSIAN_QUOTES.length)];
  const qText = document.getElementById('active-quote-text');
  const qAuthor = document.getElementById('active-quote-author');
  if (qText) qText.innerText = q.quote;
  if (qAuthor) qAuthor.innerText = q.author;

  clearInterval(APP_STATE.timerInterval);
  APP_STATE.timerInterval = setInterval(() => {
    if (APP_STATE.timeLeft > 0) {
      APP_STATE.timeLeft--;
      updateTimerDisplay();

      // Update 3D Construction Progress Live during the session
      if (APP_STATE.currentCiv === 'persepolis' && window.Engine3D && window.Engine3D.isInitialized) {
          const sessionPercent = 1 - (APP_STATE.timeLeft / APP_STATE.timerDuration);
          const currentCiv = APP_STATE.civilizations[APP_STATE.currentCiv];
          const basePercent = (currentCiv.bricks / currentCiv.maxBricks) * 100;
          // Calculate how much a single session adds to the total progress
          const sessionContribution = (1 / currentCiv.maxBricks) * 100;
          // Combine current saved progress with live session progress
          const livePercent = Math.min(100, basePercent + (sessionPercent * sessionContribution));
          window.Engine3D.updateProgress(livePercent);
      }

    } else {
      finishFocusSession();
    }
  }, 1000); // Set to 1000 for normal time
}

function updateTimerDisplay() {
  const timeStr = formatPersianTime(Math.ceil(APP_STATE.timeLeft));
  const homeTimerEl = document.getElementById('home-timer-display');
  const activeTimerEl = document.getElementById('active-timer-display');
  if (homeTimerEl) homeTimerEl.innerText = timeStr;
  if (activeTimerEl) activeTimerEl.innerText = timeStr;
}

function finishFocusSession() {
  clearInterval(APP_STATE.timerInterval);
  APP_STATE.isRunning = false;
  if (window.soundEngine) window.soundEngine.playTrophyChime();

  const focusedMins = Math.round(APP_STATE.timerDuration / 60);

  // Rewards: Coins + Bricks
  APP_STATE.coins += 50;
  const currentCiv = APP_STATE.civilizations[APP_STATE.currentCiv];
  currentCiv.bricks += 1;
  if (currentCiv.bricks >= currentCiv.maxBricks) {
    currentCiv.level += 1;
    currentCiv.bricks = 0;
  }

  // Update Stats
  const todayName = getTodayPersianWeekday();
  APP_STATE.weeklyStats[todayName] = (APP_STATE.weeklyStats[todayName] || 0) + focusedMins;
  APP_STATE.categoryStats[APP_STATE.selectedCategory] = (APP_STATE.categoryStats[APP_STATE.selectedCategory] || 0) + focusedMins;

  // Chance of discovering an ancient artifact (25% chance)
  let foundArtifact = null;
  const lockedArtifacts = APP_STATE.artifacts.filter(a => !a.unlocked);
  if (lockedArtifacts.length > 0 && Math.random() < 0.35) {
    foundArtifact = lockedArtifacts[Math.floor(Math.random() * lockedArtifacts.length)];
    foundArtifact.unlocked = true;
  }

  persistSaveData();
  renderAllViews();

  let msg = `🎉 تبریک معمار عزیز!\nجلسه ${toPersianDigits(focusedMins)} دقیقه‌ای تمرکز با موفقیت تکمیل شد.\n🪙 ۵۰ سکه طلا و ۱ خشت باستانی دریافت کردید.`;
  if (foundArtifact) {
    msg += `\n\n✨ شگفتی در خاک‌برداری! یک شیء باستانی کشف شد: «${foundArtifact.name}»\nمی‌توانید آن را در موزه تماشا کنید!`;
  }
  alert(msg);
  setScreen('home');
}

function getTodayPersianWeekday() {
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  return days[new Date().getDay()];
}

// STRICT MODE & GRACE PERIOD
function setupStrictMonitoring() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && APP_STATE.isRunning && APP_STATE.strictMode && !APP_STATE.isRuined) {
      triggerRuinedState();
    }
  });
  window.addEventListener('blur', () => {
    if (APP_STATE.isRunning && APP_STATE.strictMode && !APP_STATE.isRuined) {
      triggerRuinedState();
    }
  });
}

function triggerRuinedState() {
  APP_STATE.isRuined = true;
  clearInterval(APP_STATE.timerInterval);
  if (window.soundEngine) window.soundEngine.playAlertAlarm();
  setScreen('ruined');

  APP_STATE.graceSecondsLeft = 30;
  const tickerEl = document.getElementById('grace-ticker');
  if (tickerEl) tickerEl.innerText = toPersianDigits(APP_STATE.graceSecondsLeft);

  clearInterval(APP_STATE.graceInterval);
  APP_STATE.graceInterval = setInterval(() => {
    APP_STATE.graceSecondsLeft--;
    if (tickerEl) tickerEl.innerText = toPersianDigits(APP_STATE.graceSecondsLeft < 10 ? '۰' + APP_STATE.graceSecondsLeft : APP_STATE.graceSecondsLeft);

    if (APP_STATE.graceSecondsLeft <= 0) {
      clearInterval(APP_STATE.graceInterval);
      abandonRuinedSession();
    }
  }, 1000);
}

function recoverRuinedSessionWithGrace() {
  if (window.soundEngine) {
    window.soundEngine.playStoneClick();
    window.soundEngine.playTrophyChime();
  }
  clearInterval(APP_STATE.graceInterval);
  APP_STATE.isRuined = false;
  APP_STATE.isRunning = true;
  setScreen('active');

  APP_STATE.timerInterval = setInterval(() => {
    if (APP_STATE.timeLeft > 0) {
      APP_STATE.timeLeft--;
      updateTimerDisplay();

      // Update 3D Construction Progress Live during the recovered session
      if (APP_STATE.currentCiv === 'persepolis' && window.Engine3D && window.Engine3D.isInitialized) {
          const sessionPercent = 1 - (APP_STATE.timeLeft / APP_STATE.timerDuration);
          const currentCiv = APP_STATE.civilizations[APP_STATE.currentCiv];
          const basePercent = (currentCiv.bricks / currentCiv.maxBricks) * 100;
          const sessionContribution = (1 / currentCiv.maxBricks) * 100;
          const livePercent = Math.min(100, basePercent + (sessionPercent * sessionContribution));
          window.Engine3D.updateProgress(livePercent);
      }

    } else {
      finishFocusSession();
    }
  }, 1000); // 1 real second

  alert('✨ خشت‌های بنا با درایت شما دوباره استوار شدند! ادامه تمرکز را حفظ کنید.');
}

function abandonRuinedSession() {
  clearInterval(APP_STATE.graceInterval);
  APP_STATE.isRuined = false;
  APP_STATE.isRunning = false;
  APP_STATE.timeLeft = APP_STATE.timerDuration;
  alert('⚠️ فرصت نجات به پایان رسید و بنا ویران شد! با اراده بیشتر دوباره از سر بگیرید.');
  setScreen('home');
}

// WEEKLY ANALYTICS CHART
function renderWeeklyChart() {
  const chartEl = document.getElementById('weekly-chart-bars');
  if (!chartEl) return;

  const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  const maxVal = Math.max(...Object.values(APP_STATE.weeklyStats), 180);

  chartEl.innerHTML = days.map(day => {
    const mins = APP_STATE.weeklyStats[day] || 0;
    const heightPercent = Math.max(12, Math.round((mins / maxVal) * 100));
    return `
      <div class="flex-1 flex flex-col items-center gap-1.5 h-44 justify-end">
        <span class="text-[10px] text-teal-300 font-bold">${toPersianDigits(mins)}</span>
        <div class="w-full max-w-[28px] bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end" style="height: 100%;">
          <div class="w-full bg-gradient-to-t from-teal-700 to-teal-400 rounded-t-lg transition-all duration-500" style="height: ${heightPercent}%;"></div>
        </div>
        <span class="text-[10px] text-slate-400">${day}</span>
      </div>
    `;
  }).join('');

  // Total Study Time this week
  const totalMins = Object.values(APP_STATE.weeklyStats).reduce((a, b) => a + b, 0);
  const totalHours = (totalMins / 60).toFixed(1);
  const totalEl = document.getElementById('total-week-hours');
  if (totalEl) totalEl.innerText = toPersianDigits(totalHours) + ' ساعت';
}

// MUSEUM OF ARTIFACTS
function renderMuseum() {
  const container = document.getElementById('museum-items-container');
  if (!container) return;

  container.innerHTML = APP_STATE.artifacts.map(art => {
    if (art.unlocked) {
      return `
        <div class="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-600/50 rounded-2xl p-3.5 space-y-1.5 shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-2xl">${art.icon}</span>
            <span class="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">کشف شده ✨</span>
          </div>
          <h4 class="text-xs font-black text-amber-200">${art.name}</h4>
          <p class="text-[10px] text-teal-400">${art.era}</p>
          <p class="text-[10px] text-slate-300 leading-relaxed">${art.desc}</p>
        </div>
      `;
    } else {
      return `
        <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5 opacity-60">
          <div class="flex items-center justify-between">
            <span class="text-2xl grayscale">🔒</span>
            <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">در دل خاک مدفون است</span>
          </div>
          <h4 class="text-xs font-bold text-slate-400">${art.name}</h4>
          <p class="text-[10px] text-slate-500">با جلسات تمرکز بیشتر این شیء باستانی را از خاک کشف کنید.</p>
        </div>
      `;
    }
  }).join('');
}

// INSTAGRAM STORY CARD GENERATOR (Canvas to PNG)
function openStoryModal() {
  if (window.soundEngine) window.soundEngine.playStoneClick();
  generateStoryCanvas();
  document.getElementById('story-modal').classList.remove('hidden');
}

function closeStoryModal() {
  if (window.soundEngine) window.soundEngine.playStoneClick();
  document.getElementById('story-modal').classList.add('hidden');
}

function generateStoryCanvas() {
  const canvas = document.getElementById('story-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Story dimensions: 720 x 1280 (High resolution 9:16)
  canvas.width = 720;
  canvas.height = 1280;

  // 1. Rich Persian Night Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1280);
  grad.addColorStop(0, '#050811');
  grad.addColorStop(0.3, '#0b1324');
  grad.addColorStop(0.7, '#134e4a');
  grad.addColorStop(1, '#022c22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 720, 1280);

  // 2. Stars
  ctx.fillStyle = '#fef08a';
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 720;
    const y = Math.random() * 600;
    const r = Math.random() * 2;
    ctx.globalAlpha = 0.3 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // 3. Ornate Gold Border (حاشیه تذهیب مینیاتوری)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 660, 1220);

  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 1;
  ctx.strokeRect(42, 42, 636, 1196);

  // Corner Ornaments
  drawCornerOrnament(ctx, 30, 30);
  drawCornerOrnament(ctx, 690, 30);
  drawCornerOrnament(ctx, 30, 1250);
  drawCornerOrnament(ctx, 690, 1250);

  // 4. Header: App Logo & Badge
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Vazirmatn, sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('🏛️  مــعـمــارِ کــهَــن', 360, 120);

  ctx.font = '20px Vazirmatn, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('کارنامه میراث و تمرکز روزانه', 360, 160);

  // 5. Central Graphic Badge
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(360, 340, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#14b8a6';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = '68px sans-serif';
  ctx.fillText('👑', 360, 345);

  ctx.font = 'bold 26px Vazirmatn, sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(APP_STATE.civilizations[APP_STATE.currentCiv].name, 360, 420);

  // 6. Focus Statistics Cards
  const totalMins = Object.values(APP_STATE.weeklyStats).reduce((a, b) => a + b, 0);
  const totalHours = (totalMins / 60).toFixed(1);

  drawStatBox(ctx, 80, 520, 260, 130, '🔥 استریک پیوسته', toPersianDigits(APP_STATE.streakDays) + ' روز');
  drawStatBox(ctx, 380, 520, 260, 130, '⏱️ تمرکز این هفته', toPersianDigits(totalHours) + ' ساعت');

  drawStatBox(ctx, 80, 680, 260, 130, '🧱 خشت‌های استوار', toPersianDigits(APP_STATE.civilizations[APP_STATE.currentCiv].bricks) + ' قطعه');
  drawStatBox(ctx, 380, 680, 260, 130, '🪙 گنجینه معمار', toPersianDigits(APP_STATE.coins.toLocaleString('en-US')) + ' سکه');

  // 7. Persian Poetry
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(80, 860, 560, 160, 20);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 24px Vazirmatn, sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.fillText('« توانا بود هر که دانا بود »', 360, 925);
  ctx.font = '20px Vazirmatn, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('ز دانش دل پیر برنا بود — فردوسی بزرگ', 360, 970);

  // 8. Footer
  ctx.font = '18px Vazirmatn, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('هر دقیقه تمرکز، خشتی برای بازسازی تاریخ ایران', 360, 1140);
  ctx.font = 'bold 20px Vazirmatn, sans-serif';
  ctx.fillStyle = '#14b8a6';
  ctx.fillText('Ancient Architect • معمار کهن', 360, 1180);
}

function drawCornerOrnament(ctx, x, y) {
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawStatBox(ctx, x, y, w, h, label, value) {
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '18px Vazirmatn, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(label, x + w / 2, y + 42);

  ctx.font = 'bold 36px Vazirmatn, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(value, x + w / 2, y + 96);
}

function downloadStoryImage() {
  if (window.soundEngine) window.soundEngine.playStoneClick();
  const canvas = document.getElementById('story-canvas');
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = `Ancient_Architect_Story_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Master Audio Controls
function toggleMasterSound() {
  if (!window.soundEngine) return;
  window.soundEngine.ensureContext();
  if (APP_STATE.soundActive) {
    window.soundEngine.stopAll();
    APP_STATE.soundActive = false;
  } else {
    window.soundEngine.startAllActive();
    APP_STATE.soundActive = true;
  }
  updateSoundButtonUI();
}

function updateSoundButtonUI() {
  const btn = document.getElementById('master-sound-btn');
  if (!btn) return;
  if (APP_STATE.soundActive) {
    btn.innerHTML = '<span>🔊</span> آواها روشن';
    btn.classList.add('bg-teal-900', 'text-teal-200');
  } else {
    btn.innerHTML = '<span>🔈</span> آواها خاموش';
    btn.classList.remove('bg-teal-900', 'text-teal-200');
  }
}

function openAmbientModal() {
  if (window.soundEngine) window.soundEngine.playStoneClick();
  document.getElementById('ambient-sound-modal').classList.remove('hidden');
}

function closeAmbientModal() {
  if (window.soundEngine) window.soundEngine.playStoneClick();
  document.getElementById('ambient-sound-modal').classList.add('hidden');
}
