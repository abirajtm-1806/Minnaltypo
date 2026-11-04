/**
 * ============================================================================
 * MINNALTYPING — PHASE 3: PERFORMANCE ENGINE & RESULTS DASHBOARD
 * Pure Vanilla JavaScript Foundation, Precision Telemetry & Analytics
 *
 * Core Capabilities:
 * 1. Precision WPM & Raw WPM calculation using actual elapsed time.
 * 2. Keystroke telemetry & historical error tracking (corrections do not erase errors).
 * 3. 5-second interval consistency calculation (Coefficient of Variation).
 * 4. Comprehensive Results Dashboard with 5-tier performance rating.
 * 5. Dedicated action handlers: Try Again, New Paragraph, Home.
 * 6. Bulletproof data integrity: zero division protection, duplicate finish guards.
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. PARAGRAPH BANK (24 Distinct Paragraphs across 3 Difficulty Levels)
  // --------------------------------------------------------------------------
  const PARAGRAPH_BANK = {
    easy: [
      'The sun rises early in the morning and brings warm light to the entire world. Birds sing sweet songs in the tall green trees while the cool wind blows gently across the open fields. Walking outside every day helps you stay happy and healthy.',
      'Reading books is one of the best ways to learn new things and explore new places. When you open a good book, your mind can travel anywhere without leaving your favorite chair. Make it a daily habit to read a few pages.',
      'Hard work and patience always lead to great results over time. You do not need to be the fastest person to win the race. Keep taking small steps forward every day and you will reach your goals before you know it.',
      'A cup of warm tea on a rainy afternoon can make you feel cozy and calm. Listen to the drops of rain falling against the glass window as you relax and enjoy the quiet time with your family.',
      'Simple habits can change your life for the better. Drink plenty of fresh water, smile often, and treat everyone with kindness. Small acts of care can brighten someone else\'s day and bring joy to your own heart.',
      'Music has the power to bring people together from all around the world. A simple melody can lift your mood and make you want to dance. Play your favorite tune whenever you need a quick boost of energy.',
      'Taking care of plants in a home garden teaches us how to be patient. Give them clean water, fresh air, and warm sunlight every day. In time, small seeds will grow into strong and colorful flowers.',
      'Typing fast is a fun skill that gets easier with steady practice. Keep your fingers light on the keys and look straight at the screen. You will notice yourself improving every single time you sit down to type.'
    ],

    medium: [
      'Speed is a byproduct of precision and rhythm. When fingers glide across the keys with quiet confidence, words form seamlessly on the screen. True typing mastery is not about rushing; it is about striking each key cleanly, maintaining steady momentum, and letting practice sharpen your natural reflexes into lightning speed.',
      'Modern computing has fundamentally transformed the way humans communicate, collaborate, and solve complex problems. From distributed networks to pocket-sized processors, technology enables instant access to global knowledge, bridging cultural gaps and empowering creators everywhere.',
      'Deep focus is a rare and valuable asset in an era characterized by relentless digital distractions. Those who master the discipline of sustained attention cultivate greater creativity, achieve higher cognitive output, and produce work of enduring craftsmanship.',
      'The architectural elegance of a software system depends heavily on simplicity, modularity, and thoughtful design. When developers resist unnecessary complexity and adhere to clean abstractions, their code remains maintainable, robust, and adaptable for years to come.',
      'Learning to play a musical instrument or mastering touch typing requires identical psychological principles: deliberate repetition, immediate feedback, and gradual neuromuscular adaptation. Over time, conscious effort fades into effortless muscle memory.',
      'Urban transit networks balance efficiency and environmental sustainability by connecting diverse communities. Electric trains, dedicated bike corridors, and walkable neighborhoods collectively reduce carbon footprints while enhancing overall civic vitality.',
      'Resilience is not merely the ability to endure hardship, but the capacity to adapt, learn, and emerge stronger after facing unforeseen obstacles. True progress rarely follows a straight line; it is shaped by thoughtful reflection and perseverance.',
      'Curiosity serves as the primary engine of scientific discovery and artistic innovation. By asking probing questions and challenging accepted assumptions, thinkers throughout history have unlocked remarkable breakthroughs that reshaped human understanding.'
    ],

    hard: [
      'Algorithmic efficiency mirrors cognitive dexterity; keystrokes executing at 120+ WPM necessitate synchronization, instantaneous phonetic parsing, and unyielding discipline under strict latency constraints.',
      'Quantum computing paradigm shifts, leveraging quantum superposition, entanglement, and decoherence mitigation, challenge cryptographic conventions (such as 2048-bit RSA) while precipitating novel architectures for combinatorial optimization.',
      'Epistemological inquiries regarding artificial intelligence often conflate synthetic pattern recognition with genuine subjective consciousness; phenomenological qualia remain stubbornly enigmatic despite recursive neural hyper-parameter optimization.',
      'The socio-economic implications of distributed ledger protocols (e.g., zero-knowledge rollups, Byzantine fault-tolerant consensus mechanisms) disrupt legacy financial intermediation by replacing bureaucratic trust with deterministic mathematical verification.',
      'Biochemical homeostasis within eukaryotic organisms relies on delicate feedback cascades: allosteric enzymatic modulation, transmembrane electrochemical gradients, and mitochondrial ATP synthesis functioning at thermodynamic equilibrium thresholds.',
      'Metacognitive calibration, the nuanced appraisal of one\'s own epistemic boundaries, distinguishes superficial erudition from profound intellectual rigour; dogmatism invariably falters when confronted with empirical counter-examples.',
      'Microarchitectural vulnerabilities, including out-of-order execution side-channel leaks (CVE-2017-5753 and Spectre-v2 variants), demonstrated that hardware abstraction barriers could be surreptitiously bypassed via precise cache timing measurements.',
      'Atmospheric thermodynamic simulations integrate non-linear Navier-Stokes differential equations across multi-resolution geospatial grids; predictive accuracy diminishes exponentially as chaotic turbulence introduces sensitive initial-condition divergence.'
    ]
  };

  // Prevent immediate repetition per difficulty
  const lastParagraphIndices = {
    easy: -1,
    medium: -1,
    hard: -1
  };

  // --------------------------------------------------------------------------
  // 2. APPLICATION & ENGINE STATE
  // --------------------------------------------------------------------------
  const appState = {
    difficulty: 'medium',
    duration: 60,
    soundEnabled: true,

    // Runtime state
    status: 'idle', // 'idle' | 'ready' | 'running' | 'finished'
    isFinishing: false,
    targetText: '',
    timeRemaining: 60,
    timerInterval: null,
    startTime: null,
    elapsedSeconds: 0,
    prevTypedLength: 0,

    // Keystroke telemetry (Section 1 & 2)
    typedCount: 0,            // Total characters currently typed
    correctCount: 0,          // Current correct characters
    incorrectCount: 0,        // Current incorrect characters
    totalKeystrokes: 0,       // All keystrokes including backspaces
    correctKeystrokes: 0,     // Total matching character keystrokes
    incorrectKeystrokes: 0,   // Historical mistakes (never erased by backspace!)
    backspaceCount: 0,        // Total backspaces pressed

    // Metrics
    netWPM: 0,
    rawWPM: 0,
    accuracy: 100,

    // Consistency Sampling (Section 3)
    wpmSamples: [],
    lastSampleSecond: 0,
    lastSampleCorrectChars: 0
  };

  // --------------------------------------------------------------------------
  // 3. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  // Setup & Layout Sections
  const welcomeSection = document.getElementById('welcome-section');
  const controlsSection = document.getElementById('controls-section');
  const featuresGrid = document.querySelector('.features-grid');
  const difficultyButtons = document.querySelectorAll('[data-difficulty]');
  const timerButtons = document.querySelectorAll('[data-time]');
  const startButton = document.getElementById('start-btn');

  // Preview & Status Bar
  const previewSection = document.getElementById('preview-section');
  const previewHeading = document.getElementById('preview-heading');
  const previewStatusDesc = document.getElementById('preview-status-desc');
  const previewCurrentConfig = document.getElementById('preview-current-config');
  const statusIndicatorDot = document.getElementById('status-indicator-dot');
  const previewDisclaimer = document.getElementById('preview-disclaimer');
  const disclaimerText = document.getElementById('disclaimer-text');

  // Active Test HUD
  const testHud = document.getElementById('test-hud');
  const hudTimerCountdown = document.getElementById('hud-timer-countdown');
  const hudDifficultyBadge = document.getElementById('hud-difficulty-badge');
  const btnHudRestart = document.getElementById('btn-hud-restart');
  const btnHudConfig = document.getElementById('btn-hud-config');

  // Progress Bar & Telemetry
  const testProgressContainer = document.getElementById('test-progress-container');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressBarVal = document.getElementById('progress-bar-val');
  const characterTelemetry = document.getElementById('character-telemetry');
  const counterTyped = document.getElementById('counter-typed');
  const counterCorrect = document.getElementById('counter-correct');
  const counterIncorrect = document.getElementById('counter-incorrect');
  const counterRemaining = document.getElementById('counter-remaining');

  // Typing Canvas & Input
  const typingCanvas = document.getElementById('typing-canvas');
  const sampleParagraph = document.getElementById('sample-paragraph');
  const typingInput = document.getElementById('typing-input');
  const canvasFocusOverlay = document.getElementById('canvas-focus-overlay');

  // Live Statistics Cards
  const previewWpm = document.getElementById('preview-wpm');
  const previewAccuracy = document.getElementById('preview-accuracy');
  const previewTime = document.getElementById('preview-time');
  const statWpmTag = document.getElementById('stat-wpm-tag');
  const statAccTag = document.getElementById('stat-acc-tag');
  const statTimeTag = document.getElementById('stat-time-tag');

  // Results Dashboard Elements (Section 4)
  const resultsDashboard = document.getElementById('results-dashboard');
  const resultsBadgeText = document.getElementById('results-badge-text');
  const resultsTierBadge = document.getElementById('results-tier-badge');
  const resultsTierName = document.getElementById('results-tier-name');
  const resultsMetaDiff = document.getElementById('results-meta-diff');
  const resultsMetaDuration = document.getElementById('results-meta-duration');
  const resultsFeedbackMsg = document.getElementById('results-feedback-msg');

  // Results Hero Metrics
  const resultFinalWpm = document.getElementById('result-final-wpm');
  const resultRawWpm = document.getElementById('result-raw-wpm');
  const resultFinalAccuracy = document.getElementById('result-final-accuracy');
  const heroAccuracyBox = document.getElementById('hero-accuracy-box');

  // Results Details Grid
  const detailRawWpm = document.getElementById('detail-raw-wpm');
  const detailConsistency = document.getElementById('detail-consistency');
  const detailConsistencySub = document.getElementById('detail-consistency-sub');
  const detailCharacters = document.getElementById('detail-characters');
  const detailCharsCorrect = document.getElementById('detail-chars-correct');
  const detailCharsIncorrect = document.getElementById('detail-chars-incorrect');
  const detailKeystrokes = document.getElementById('detail-keystrokes');
  const detailMistakesCount = document.getElementById('detail-mistakes-count');
  const detailBackspacesCount = document.getElementById('detail-backspaces-count');
  const detailWordsCompleted = document.getElementById('detail-words-completed');
  const detailTimeTaken = document.getElementById('detail-time-taken');
  const detailTimeTarget = document.getElementById('detail-time-target');

  // Results Action Buttons (Section 6)
  const btnResultsRetry = document.getElementById('btn-results-retry');
  const btnResultsNewPara = document.getElementById('btn-results-new-para');
  const btnResultsHome = document.getElementById('btn-results-home');

  // Modals & Navigation
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundOnIcon = soundToggleBtn ? soundToggleBtn.querySelector('.icon-sound-on') : null;
  const soundOffIcon = soundToggleBtn ? soundToggleBtn.querySelector('.icon-sound-off') : null;

  const settingsToggleBtn = document.getElementById('settings-toggle');
  const settingsModal = document.getElementById('settings-modal');
  const settingsCloseBtn = document.getElementById('settings-close');
  const settingsOkBtn = document.getElementById('settings-ok');

  const aboutModal = document.getElementById('about-modal');
  const aboutCloseBtn = document.getElementById('about-close');
  const aboutOkBtn = document.getElementById('about-ok');
  const navAboutLink = document.getElementById('nav-about');
  const footerAboutLink = document.getElementById('footer-about-link');
  const navHomeLink = document.getElementById('nav-home');
  const navPracticeLink = document.getElementById('nav-practice');
  const navLinks = document.querySelectorAll('.nav-link');

  // --------------------------------------------------------------------------
  // 4. PARAGRAPH SELECTION LOGIC
  // --------------------------------------------------------------------------
  function getRandomParagraph(difficulty) {
    const list = PARAGRAPH_BANK[difficulty] || PARAGRAPH_BANK.medium;
    const lastIndex = lastParagraphIndices[difficulty];
    let newIndex;

    if (list.length > 1) {
      do {
        newIndex = Math.floor(Math.random() * list.length);
      } while (newIndex === lastIndex);
    } else {
      newIndex = 0;
    }

    lastParagraphIndices[difficulty] = newIndex;
    return list[newIndex];
  }

  // --------------------------------------------------------------------------
  // 5. PARAGRAPH RENDERING (With Natural Word Wrapping)
  // --------------------------------------------------------------------------
  function renderParagraphChars(text) {
    if (!sampleParagraph) return;

    sampleParagraph.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement('span');
      span.className = 'char untyped';
      span.dataset.index = String(i);

      // Preserve spaces for natural wrapping across lines
      span.textContent = char;
      if (char === ' ') {
        span.classList.add('char-space');
      }

      // First character gets cursor
      if (i === 0) {
        span.classList.add('current');
      }

      fragment.appendChild(span);
    }

    sampleParagraph.appendChild(fragment);
  }

  // --------------------------------------------------------------------------
  // 6. SETUP & CONFIGURATION UI HANDLERS
  // --------------------------------------------------------------------------
  function updateConfigPreview() {
    const capDifficulty = appState.difficulty.charAt(0).toUpperCase() + appState.difficulty.slice(1);
    if (previewCurrentConfig) {
      previewCurrentConfig.textContent = `${capDifficulty} • ${appState.duration}s`;
    }
    if (previewTime && appState.status === 'idle') {
      previewTime.textContent = `${appState.duration}s`;
    }
    if (hudDifficultyBadge) {
      hudDifficultyBadge.textContent = appState.difficulty.toUpperCase();
    }
    if (hudTimerCountdown) {
      hudTimerCountdown.textContent = `${appState.duration}s`;
    }

    // In idle mode, render sample text from selected difficulty
    if (appState.status === 'idle') {
      const sample = PARAGRAPH_BANK[appState.difficulty][0];
      appState.targetText = sample;
      renderParagraphChars(sample);
    }
  }

  // Difficulty Selectors
  difficultyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      difficultyButtons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-checked', 'false');
      });

      btn.classList.add('is-active');
      btn.setAttribute('aria-checked', 'true');
      appState.difficulty = btn.getAttribute('data-difficulty') || 'medium';

      updateConfigPreview();
    });
  });

  // Timer Selectors (15s, 30s, 60s, 120s)
  timerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      timerButtons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-checked', 'false');
      });

      btn.classList.add('is-active');
      btn.setAttribute('aria-checked', 'true');
      const timeVal = parseInt(btn.getAttribute('data-time'), 10);
      appState.duration = isNaN(timeVal) ? 60 : timeVal;
      appState.timeRemaining = appState.duration;

      updateConfigPreview();
    });
  });

  // --------------------------------------------------------------------------
  // 7. TEST TRANSITION ENGINE
  // --------------------------------------------------------------------------
  function startTypingSession(options = {}) {
    const reuseParagraph = options.newParagraph === false;

    // 1. Reset data integrity guards
    appState.isFinishing = false;
    clearInterval(appState.timerInterval);
    appState.timerInterval = null;

    // 2. Hide welcome, controls, and results dashboard
    if (welcomeSection) welcomeSection.classList.add('is-hidden');
    if (controlsSection) controlsSection.classList.add('is-hidden');
    if (featuresGrid) featuresGrid.classList.add('is-hidden');
    if (resultsDashboard) resultsDashboard.classList.add('is-hidden');

    // 3. Reveal HUD, progress bar, character telemetry, and canvas
    if (testHud) testHud.classList.remove('is-hidden');
    if (previewSection) previewSection.classList.remove('is-hidden');
    if (testProgressContainer) testProgressContainer.classList.remove('is-hidden');
    if (characterTelemetry) characterTelemetry.classList.remove('is-hidden');
    if (canvasFocusOverlay) canvasFocusOverlay.classList.add('is-hidden');
    if (typingCanvas) typingCanvas.classList.add('is-active');

    // 4. Update preview header
    if (previewHeading) previewHeading.textContent = 'Active Typing Session';
    if (previewStatusDesc) previewStatusDesc.textContent = 'Session:';
    if (statusIndicatorDot) statusIndicatorDot.style.backgroundColor = 'var(--color-accent)';

    // 5. Update stat tags
    if (statWpmTag) statWpmTag.textContent = 'LIVE';
    if (statAccTag) statAccTag.textContent = 'LIVE';
    if (statTimeTag) statTimeTag.textContent = 'REMAINING';
    if (disclaimerText) disclaimerText.textContent = 'Test in progress. Press Esc to restart, or click Home to return.';

    // 6. Select or reuse paragraph
    if (!reuseParagraph || !appState.targetText) {
      appState.targetText = getRandomParagraph(appState.difficulty);
    }
    renderParagraphChars(appState.targetText);

    // 7. Reset telemetry and runtime state (Section 7: Data Integrity)
    appState.startTime = null;
    appState.elapsedSeconds = 0;
    appState.timeRemaining = appState.duration;
    appState.prevTypedLength = 0;

    appState.typedCount = 0;
    appState.correctCount = 0;
    appState.incorrectCount = 0;
    appState.totalKeystrokes = 0;
    appState.correctKeystrokes = 0;
    appState.incorrectKeystrokes = 0;
    appState.backspaceCount = 0;

    appState.netWPM = 0;
    appState.rawWPM = 0;
    appState.accuracy = 100;

    appState.wpmSamples = [];
    appState.lastSampleSecond = 0;
    appState.lastSampleCorrectChars = 0;

    appState.status = 'ready'; // Ready to type; countdown begins on first keystroke

    // 8. Reset UI displays
    updateTelemetryDisplay();
    if (previewWpm) previewWpm.textContent = '0';
    if (previewAccuracy) previewAccuracy.textContent = '100%';
    if (previewTime) previewTime.textContent = `${appState.duration}s`;
    if (hudTimerCountdown) hudTimerCountdown.textContent = `${appState.duration}s`;
    if (progressBarFill) progressBarFill.style.width = '0%';
    if (progressBarVal) progressBarVal.textContent = '0%';

    // 9. Enable, clear, and focus input area
    if (typingInput) {
      typingInput.disabled = false;
      typingInput.value = '';
      typingInput.focus();
    }

    // 10. Scroll smoothly to canvas
    if (previewSection) {
      previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Return to Setup / Welcome Screen
  function exitToSetup() {
    clearInterval(appState.timerInterval);
    appState.timerInterval = null;
    appState.status = 'idle';
    appState.isFinishing = false;

    if (welcomeSection) welcomeSection.classList.remove('is-hidden');
    if (controlsSection) controlsSection.classList.remove('is-hidden');
    if (featuresGrid) featuresGrid.classList.remove('is-hidden');
    if (previewSection) previewSection.classList.remove('is-hidden');

    if (testHud) testHud.classList.add('is-hidden');
    if (testProgressContainer) testProgressContainer.classList.add('is-hidden');
    if (characterTelemetry) characterTelemetry.classList.add('is-hidden');
    if (canvasFocusOverlay) canvasFocusOverlay.classList.add('is-hidden');
    if (resultsDashboard) resultsDashboard.classList.add('is-hidden');
    if (typingCanvas) typingCanvas.classList.remove('is-active');

    if (previewHeading) previewHeading.textContent = 'Preview Canvas';
    if (previewStatusDesc) previewStatusDesc.textContent = 'Selected:';
    if (statWpmTag) statWpmTag.textContent = 'METRIC';
    if (statAccTag) statAccTag.textContent = 'METRIC';
    if (statTimeTag) statTimeTag.textContent = 'TARGET';

    if (previewWpm) previewWpm.textContent = '—';
    if (previewAccuracy) previewAccuracy.textContent = '—%';
    if (previewTime) previewTime.textContent = `${appState.duration}s`;
    if (disclaimerText) disclaimerText.textContent = 'Select difficulty and duration, then click "Start Typing" to launch the live engine.';

    if (typingInput) {
      typingInput.value = '';
      typingInput.disabled = true;
    }

    updateConfigPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // 8. LIVE COUNTDOWN TIMER & 5-SECOND CONSISTENCY SAMPLING (Section 3 & 5)
  // --------------------------------------------------------------------------
  function startCountdownTimer() {
    if (appState.timerInterval) return;

    appState.status = 'running';
    appState.startTime = performance.now();
    appState.timeRemaining = appState.duration;
    appState.lastSampleSecond = 0;
    appState.lastSampleCorrectChars = 0;
    appState.wpmSamples = [];

    appState.timerInterval = setInterval(() => {
      appState.timeRemaining--;
      const elapsedSec = Math.max(0, (performance.now() - appState.startTime) / 1000);
      appState.elapsedSeconds = elapsedSec;

      // Collect consistency samples every 5 seconds (Section 3)
      const wholeSec = Math.floor(elapsedSec);
      if (wholeSec >= 5 && wholeSec % 5 === 0 && wholeSec !== appState.lastSampleSecond) {
        appState.lastSampleSecond = wholeSec;
        const charsDelta = Math.max(0, appState.correctCount - appState.lastSampleCorrectChars);
        const sampleWPM = Math.max(0, Math.round((charsDelta / 5) / (5 / 60)));
        appState.wpmSamples.push(sampleWPM);
        appState.lastSampleCorrectChars = appState.correctCount;
      }

      // Update timer displays
      const timerStr = `${Math.max(0, appState.timeRemaining)}s`;
      if (hudTimerCountdown) hudTimerCountdown.textContent = timerStr;
      if (previewTime) previewTime.textContent = timerStr;

      // Update live WPM telemetry
      calculateLiveWPM();

      // Check timeout
      if (appState.timeRemaining <= 0) {
        clearInterval(appState.timerInterval);
        appState.timerInterval = null;
        finishTypingSession(false); // Finished via timeout
      }
    }, 1000);
  }

  // --------------------------------------------------------------------------
  // 9. RESILIENT CHARACTER COMPARISON & TYPING ENGINE (Section 1, 2 & 3)
  // --------------------------------------------------------------------------
  // Normalizes physical/virtual keyboard punctuation variations (quotes, hyphens, dashes)
  function isCharMatch(typedChar, targetChar) {
    if (typedChar === targetChar) return true;

    // Hyphens, en-dashes, em-dashes
    if ((typedChar === '-' || typedChar === '–' || typedChar === '—') &&
        (targetChar === '-' || targetChar === '–' || targetChar === '—')) {
      return true;
    }
    // Straight single quote, curly apostrophes, backticks
    if ((typedChar === "'" || typedChar === '’' || typedChar === '‘' || typedChar === '`') &&
        (targetChar === "'" || targetChar === '’' || targetChar === '‘' || targetChar === '`')) {
      return true;
    }
    // Straight double quote, curly double quotes
    if ((typedChar === '"' || typedChar === '“' || typedChar === '”') &&
        (targetChar === '"' || targetChar === '“' || targetChar === '”')) {
      return true;
    }
    return false;
  }

  function handleTypingInput(e) {
    if (appState.status === 'finished' || appState.isFinishing) return;

    // Start timer on first keystroke
    if (appState.status === 'ready') {
      startCountdownTimer();
    }

    const target = appState.targetText;
    let typed = typingInput.value;

    // Prevent typing beyond target paragraph length
    if (typed.length > target.length) {
      typed = typed.slice(0, target.length);
      typingInput.value = typed;
    }

    const currentLen = typed.length;
    const prevLen = appState.prevTypedLength;

    // Keystroke telemetry & historical error tracking (Section 2)
    // Correcting a mistake via Backspace does NOT erase the historical error count!
    if (currentLen > prevLen) {
      // Keystrokes were added
      for (let k = prevLen; k < currentLen; k++) {
        appState.totalKeystrokes++;
        if (isCharMatch(typed[k], target[k])) {
          appState.correctKeystrokes++;
        } else {
          appState.incorrectKeystrokes++; // Historical mistake recorded
        }
      }
    } else if (currentLen < prevLen) {
      // Backspace / deletion occurred
      const deletedCount = prevLen - currentLen;
      appState.backspaceCount += deletedCount;
      appState.totalKeystrokes += deletedCount;
    }
    appState.prevTypedLength = currentLen;

    const targetLen = target.length;
    let correct = 0;
    let incorrect = 0;

    const charSpans = sampleParagraph.querySelectorAll('.char');

    // Update individual visual states
    for (let i = 0; i < targetLen; i++) {
      const span = charSpans[i];
      if (!span) continue;

      span.classList.remove('current', 'current-end');

      if (i < currentLen) {
        span.classList.remove('untyped');
        if (isCharMatch(typed[i], target[i])) {
          span.classList.add('correct');
          span.classList.remove('incorrect');
          correct++;
        } else {
          span.classList.add('incorrect');
          span.classList.remove('correct');
          incorrect++;
        }
      } else {
        // Untyped character
        span.classList.add('untyped');
        span.classList.remove('correct', 'incorrect');
      }
    }

    // Update cursor / position indicator & auto-scroll to keep active cursor in view
    if (currentLen < targetLen) {
      const activeSpan = charSpans[currentLen];
      if (activeSpan) {
        activeSpan.classList.add('current');
        if (typeof activeSpan.scrollIntoView === 'function') {
          activeSpan.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        }
      }
    } else if (currentLen === targetLen && targetLen > 0) {
      const lastSpan = charSpans[targetLen - 1];
      if (lastSpan) {
        lastSpan.classList.add('current-end');
        if (typeof lastSpan.scrollIntoView === 'function') {
          lastSpan.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        }
      }
    }

    // State numbers
    appState.typedCount = currentLen;
    appState.correctCount = correct;
    appState.incorrectCount = incorrect;

    // Accuracy formula: (Correct Keystrokes / Total Character Keystrokes) * 100
    const totalAttempts = appState.correctKeystrokes + appState.incorrectKeystrokes;
    appState.accuracy = totalAttempts > 0
      ? Math.max(0, Math.min(100, (appState.correctKeystrokes / totalAttempts) * 100))
      : 100;

    updateProgressAndTelemetry();
    calculateLiveWPM();

    // Check completion: entire paragraph finished before timer expired
    if (currentLen === targetLen) {
      clearInterval(appState.timerInterval);
      appState.timerInterval = null;
      finishTypingSession(true); // Complete
    }
  }

  // Update Telemetry & Progress
  function updateProgressAndTelemetry() {
    const total = appState.targetText.length;
    const typed = appState.typedCount;
    const correct = appState.correctCount;
    const incorrect = appState.incorrectCount;
    const remaining = Math.max(0, total - typed);
    const percent = total > 0 ? Math.min(100, Math.round((typed / total) * 100)) : 0;

    if (counterTyped) counterTyped.textContent = String(typed);
    if (counterCorrect) counterCorrect.textContent = String(correct);
    if (counterIncorrect) counterIncorrect.textContent = String(incorrect);
    if (counterRemaining) counterRemaining.textContent = String(remaining);

    if (progressBarFill) progressBarFill.style.width = `${percent}%`;
    if (progressBarVal) progressBarVal.textContent = `${percent}%`;

    const formattedAcc = appState.accuracy % 1 === 0 ? appState.accuracy.toFixed(0) : appState.accuracy.toFixed(1);
    if (previewAccuracy) previewAccuracy.textContent = `${formattedAcc}%`;
  }

  function updateTelemetryDisplay() {
    const total = appState.targetText.length;
    if (counterTyped) counterTyped.textContent = '0';
    if (counterCorrect) counterCorrect.textContent = '0';
    if (counterIncorrect) counterIncorrect.textContent = '0';
    if (counterRemaining) counterRemaining.textContent = String(total);
  }

  // Calculate live WPM during test
  function calculateLiveWPM() {
    const elapsedSec = appState.startTime ? Math.max(0.1, (performance.now() - appState.startTime) / 1000) : 0;
    const elapsedMin = Math.max(0.016, elapsedSec / 60);

    const net = Math.max(0, Math.round((appState.correctCount / 5) / elapsedMin));
    const gross = Math.max(0, Math.round((appState.typedCount / 5) / elapsedMin));

    appState.netWPM = net;
    appState.rawWPM = gross;

    if (previewWpm) previewWpm.textContent = String(appState.netWPM);
    const formattedAcc = appState.accuracy % 1 === 0 ? appState.accuracy.toFixed(0) : appState.accuracy.toFixed(1);
    if (previewAccuracy) previewAccuracy.textContent = `${formattedAcc}%`;
  }

  // --------------------------------------------------------------------------
  // 10. CONSISTENCY & PERFORMANCE RATING HELPERS (Section 3 & 5)
  // --------------------------------------------------------------------------
  function calculateConsistency(samples) {
    if (!samples || samples.length < 2) return null;

    const n = samples.length;
    const mean = samples.reduce((acc, v) => acc + v, 0) / n;
    if (mean <= 0) return 0;

    const variance = samples.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Consistency: 100% minus variation percentage
    return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  }

  function getPerformanceRating(wpm) {
    if (wpm < 20) {
      return {
        tier: 'Beginner',
        className: 'tier-beginner',
        feedback: 'Solid foundation! Consistent daily practice will build your muscle memory and speed.'
      };
    } else if (wpm <= 35) {
      return {
        tier: 'Improving',
        className: 'tier-improving',
        feedback: 'Steady progress! Your finger placement, rhythm, and keystroke confidence are developing well.'
      };
    } else if (wpm <= 50) {
      return {
        tier: 'Good',
        className: 'tier-good',
        feedback: 'Great rhythm! You are typing at an above-average pace with strong, dependable accuracy.'
      };
    } else if (wpm <= 70) {
      return {
        tier: 'Excellent',
        className: 'tier-excellent',
        feedback: 'Lightning fast! Outstanding typing speed and fluid keystroke reflexes.'
      };
    } else {
      return {
        tier: 'Advanced',
        className: 'tier-advanced',
        feedback: 'Masterclass performance! Elite typing speed with exceptional dexterity and focus.'
      };
    }
  }

  // --------------------------------------------------------------------------
  // 11. SESSION FINISH & RESULTS DASHBOARD (Section 4, 5, 7)
  // --------------------------------------------------------------------------
  function finishTypingSession(completedAll) {
    // Prevent duplicate calculations (Section 7: Data Integrity)
    if (appState.status === 'finished' || appState.isFinishing) return;
    appState.isFinishing = true;
    appState.status = 'finished';

    clearInterval(appState.timerInterval);
    appState.timerInterval = null;

    if (typingInput) {
      typingInput.disabled = true;
    }

    // Calculate actual elapsed time in seconds (Section 1 requirement)
    const finalElapsedMs = appState.startTime ? Math.max(100, performance.now() - appState.startTime) : 100;
    const actualElapsedSeconds = completedAll
      ? Math.max(0.1, finalElapsedMs / 1000)
      : appState.duration;

    const actualElapsedMinutes = Math.max(0.0016, actualElapsedSeconds / 60);

    // Net WPM: Correct Characters / (5 * Elapsed Minutes)
    const finalNetWPM = Math.max(0, Math.round((appState.correctCount / 5) / actualElapsedMinutes));

    // Raw WPM: Total Typed Characters / (5 * Elapsed Minutes)
    const finalRawWPM = Math.max(0, Math.round((appState.typedCount / 5) / actualElapsedMinutes));

    // Accuracy: (Correct Keystrokes / Total Keystroke Attempts) * 100
    const totalAttempts = appState.correctKeystrokes + appState.incorrectKeystrokes;
    const finalAccuracy = totalAttempts > 0
      ? Math.max(0, Math.min(100, (appState.correctKeystrokes / totalAttempts) * 100))
      : 100;
    const formattedAccuracy = finalAccuracy % 1 === 0 ? finalAccuracy.toFixed(0) : finalAccuracy.toFixed(1);

    // Words Completed (5 chars per standard word)
    const wordsCompleted = Math.max(0, Math.round(appState.correctCount / 5));

    // Consistency (Sampled every 5s)
    const consistencyVal = calculateConsistency(appState.wpmSamples);

    // Performance Rating (Section 5)
    const rating = getPerformanceRating(finalNetWPM);
    const capDifficulty = appState.difficulty.charAt(0).toUpperCase() + appState.difficulty.slice(1);

    // ------------------------------------------------------------------------
    // Populate Results Dashboard DOM
    // ------------------------------------------------------------------------
    if (resultFinalWpm) resultFinalWpm.textContent = String(finalNetWPM);
    if (resultRawWpm) resultRawWpm.textContent = `${finalRawWPM} WPM`;
    if (resultFinalAccuracy) resultFinalAccuracy.textContent = formattedAccuracy;

    // Accuracy coloration
    if (heroAccuracyBox) {
      if (finalAccuracy >= 90) {
        heroAccuracyBox.classList.add('metric-wpm');
      } else {
        heroAccuracyBox.classList.remove('metric-wpm');
      }
    }

    if (detailRawWpm) detailRawWpm.textContent = String(finalRawWPM);

    // Consistency display (never fabricated - Section 3)
    if (detailConsistency) {
      if (consistencyVal !== null) {
        detailConsistency.textContent = `${consistencyVal}%`;
        if (detailConsistencySub) {
          detailConsistencySub.textContent = `Based on ${appState.wpmSamples.length} samples (5s intervals)`;
        }
      } else {
        detailConsistency.textContent = '—';
        if (detailConsistencySub) {
          detailConsistencySub.textContent = 'Requires ≥ 10s test';
        }
      }
    }

    // Characters breakdown
    if (detailCharacters) detailCharacters.textContent = String(appState.typedCount);
    if (detailCharsCorrect) detailCharsCorrect.textContent = String(appState.correctCount);
    if (detailCharsIncorrect) detailCharsIncorrect.textContent = String(appState.incorrectCount);

    // Keystrokes breakdown (includes mistakes and backspaces)
    if (detailKeystrokes) detailKeystrokes.textContent = String(appState.totalKeystrokes);
    if (detailMistakesCount) detailMistakesCount.textContent = String(appState.incorrectKeystrokes);
    if (detailBackspacesCount) detailBackspacesCount.textContent = String(appState.backspaceCount);

    // Words & Time
    if (detailWordsCompleted) detailWordsCompleted.textContent = String(wordsCompleted);
    if (detailTimeTaken) {
      detailTimeTaken.textContent = completedAll
        ? `${actualElapsedSeconds.toFixed(1)}s`
        : `${appState.duration}s`;
    }
    if (detailTimeTarget) detailTimeTarget.textContent = `Selected: ${appState.duration}s limit`;

    // Badges & Feedback
    if (resultsBadgeText) {
      resultsBadgeText.textContent = completedAll ? 'CHALLENGE COMPLETED' : 'TIME EXPIRED';
    }
    if (resultsTierName) resultsTierName.textContent = rating.tier.toUpperCase();
    if (resultsTierBadge) {
      resultsTierBadge.className = `tier-badge ${rating.className}`;
    }
    if (resultsFeedbackMsg) resultsFeedbackMsg.textContent = rating.feedback;
    if (resultsMetaDiff) resultsMetaDiff.textContent = `${capDifficulty} Difficulty`;
    if (resultsMetaDuration) resultsMetaDuration.textContent = `${appState.duration}s Limit`;

    // ------------------------------------------------------------------------
    // Transition to Results Dashboard Screen (Section 4)
    // ------------------------------------------------------------------------
    if (testHud) testHud.classList.add('is-hidden');
    if (previewSection) previewSection.classList.add('is-hidden');

    if (resultsDashboard) {
      resultsDashboard.classList.remove('is-hidden');
      resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (btnResultsRetry) btnResultsRetry.focus();
    }
  }

  // --------------------------------------------------------------------------
  // 12. FOCUS MANAGEMENT FOR PHYSICAL & MOBILE KEYBOARDS
  // --------------------------------------------------------------------------
  if (typingCanvas && typingInput) {
    typingCanvas.addEventListener('click', () => {
      if (appState.status === 'ready' || appState.status === 'running') {
        typingInput.focus();
        if (canvasFocusOverlay) canvasFocusOverlay.classList.add('is-hidden');
      }
    });

    typingInput.addEventListener('blur', () => {
      if ((appState.status === 'ready' || appState.status === 'running') && canvasFocusOverlay) {
        setTimeout(() => {
          if (document.activeElement !== typingInput && (appState.status === 'ready' || appState.status === 'running')) {
            canvasFocusOverlay.classList.remove('is-hidden');
          }
        }, 150);
      }
    });

    typingInput.addEventListener('focus', () => {
      if (canvasFocusOverlay) {
        canvasFocusOverlay.classList.add('is-hidden');
      }
    });

    typingInput.addEventListener('input', handleTypingInput);
  }

  if (canvasFocusOverlay && typingInput) {
    canvasFocusOverlay.addEventListener('click', () => {
      canvasFocusOverlay.classList.add('is-hidden');
      typingInput.focus();
    });
  }

  // --------------------------------------------------------------------------
  // 13. RESULTS ACTIONS & SHORTCUTS (Section 6)
  // --------------------------------------------------------------------------
  // Try Again: Restart test with the SAME paragraph
  if (btnResultsRetry) {
    btnResultsRetry.addEventListener('click', () => {
      startTypingSession({ newParagraph: false });
    });
  }

  // New Paragraph: Restart test with a NEW paragraph
  if (btnResultsNewPara) {
    btnResultsNewPara.addEventListener('click', () => {
      startTypingSession({ newParagraph: true });
    });
  }

  // Home: Return to homepage / configuration view
  if (btnResultsHome) {
    btnResultsHome.addEventListener('click', () => {
      exitToSetup();
    });
  }

  // Start Button from setup
  if (startButton) {
    startButton.addEventListener('click', () => {
      startTypingSession({ newParagraph: true });
    });
  }

  // HUD Restart Button (Esc)
  if (btnHudRestart) {
    btnHudRestart.addEventListener('click', () => {
      startTypingSession({ newParagraph: true });
    });
  }

  // HUD Config Button
  if (btnHudConfig) {
    btnHudConfig.addEventListener('click', () => {
      exitToSetup();
    });
  }

  // Keyboard Shortcuts: Escape to restart or close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (resultsDashboard && !resultsDashboard.classList.contains('is-hidden')) {
        startTypingSession({ newParagraph: false }); // Try again on Esc
        return;
      }
      if (settingsModal && !settingsModal.classList.contains('is-hidden')) {
        closeModal(settingsModal);
        return;
      }
      if (aboutModal && !aboutModal.classList.contains('is-hidden')) {
        closeModal(aboutModal);
        return;
      }
      if (appState.status === 'running' || appState.status === 'ready') {
        startTypingSession({ newParagraph: true }); // Quick restart
      }
    }
  });

  // --------------------------------------------------------------------------
  // 14. SOUND TOGGLE CONTROLS
  // --------------------------------------------------------------------------
  if (soundToggleBtn && soundOnIcon && soundOffIcon) {
    soundToggleBtn.addEventListener('click', () => {
      appState.soundEnabled = !appState.soundEnabled;
      soundToggleBtn.setAttribute('aria-pressed', String(appState.soundEnabled));

      if (appState.soundEnabled) {
        soundOnIcon.classList.remove('is-hidden');
        soundOffIcon.classList.add('is-hidden');
        soundToggleBtn.title = 'Sound: Enabled';
        soundToggleBtn.classList.remove('is-active');
      } else {
        soundOnIcon.classList.add('is-hidden');
        soundOffIcon.classList.remove('is-hidden');
        soundToggleBtn.title = 'Sound: Muted';
        soundToggleBtn.classList.add('is-active');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 15. NAVIGATION LINKS
  // --------------------------------------------------------------------------
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');

      if (targetId === '#home') {
        e.preventDefault();
        exitToSetup();
        navLinks.forEach((l) => l.classList.remove('is-active'));
        link.classList.add('is-active');
        return;
      }

      if (targetId === '#practice') {
        e.preventDefault();
        startTypingSession({ newParagraph: true });
        navLinks.forEach((l) => l.classList.remove('is-active'));
        link.classList.add('is-active');
        return;
      }

      if (targetId === '#about') {
        e.preventDefault();
        openModal(aboutModal);
        return;
      }

      navLinks.forEach((l) => l.classList.remove('is-active'));
      link.classList.add('is-active');
    });
  });

  // Footer About Link
  if (footerAboutLink && aboutModal) {
    footerAboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(aboutModal);
    });
  }

  // --------------------------------------------------------------------------
  // 16. SETTINGS & ABOUT MODALS
  // --------------------------------------------------------------------------
  function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('is-hidden');
    document.body.style.overflow = '';
  }

  if (settingsToggleBtn && settingsModal) {
    settingsToggleBtn.addEventListener('click', () => openModal(settingsModal));
  }
  if (settingsCloseBtn && settingsModal) {
    settingsCloseBtn.addEventListener('click', () => closeModal(settingsModal));
  }
  if (settingsOkBtn && settingsModal) {
    settingsOkBtn.addEventListener('click', () => closeModal(settingsModal));
  }

  if (navAboutLink && aboutModal) {
    navAboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(aboutModal);
    });
  }
  if (aboutCloseBtn && aboutModal) {
    aboutCloseBtn.addEventListener('click', () => closeModal(aboutModal));
  }
  if (aboutOkBtn && aboutModal) {
    aboutOkBtn.addEventListener('click', () => closeModal(aboutModal));
  }

  [settingsModal, aboutModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 17. INITIALIZATION
  // --------------------------------------------------------------------------
  updateConfigPreview();

  console.log(
    '%c⚡ MINNALTYPING %c— Phase 3 Performance Engine Active (%d Paragraphs Ready)',
    'background: #B7F75B; color: #10131B; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    'color: #F2F4F0; font-weight: 500;',
    PARAGRAPH_BANK.easy.length + PARAGRAPH_BANK.medium.length + PARAGRAPH_BANK.hard.length
  );
});
