/**
 * ============================================================================
 * MINNALTYPING — PHASE 2 TYPING ENGINE
 * Pure Vanilla JavaScript Foundation & Real-Time Keystroke Engine
 *
 * Capabilities:
 * 1. 24-Paragraph Bank across Easy, Medium, and Hard tiers.
 * 2. Non-repeating random selection on test start.
 * 3. Seamless transition between setup view and active test HUD.
 * 4. Dual-mode input: transparent accessible textarea for physical desktop
 *    keyboards and mobile touchscreen keyboards.
 * 5. Character-by-character real-time matching:
 *    - Correct: Green (#B7F75B)
 *    - Incorrect: Red (#FF5B65)
 *    - Untyped: Muted grey (#858D9B)
 *    - Real-time blinking cursor indicator
 *    - Full handling of letters (upper/lowercase), spaces, punctuation, numbers, and backspace.
 * 6. Live progress bar and 4-metric character telemetry.
 * 7. Live countdown timer connected to 15s, 30s, 60s, and 120s selectors.
 * 8. Performance summary results dialog with instant restart.
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
      'Simple habits can change your life for the better. Drink plenty of fresh water, smile often, and treat everyone with kindness. Small acts of care can brighten someone else day and bring joy to your own heart.',
      'Music has the power to bring people together from all around the world. A simple melody can lift your mood and make you want to dance. Play your favorite tune whenever you need a quick boost of energy.',
      'Taking care of plants in a home garden teaches us how to be patient. Give them clean water, fresh air, and warm sunlight every day. In time, small seeds will grow into strong and colorful flowers.',
      'Typing fast is a fun skill that gets easier with steady practice. Keep your fingers light on the keys and look straight at the screen. You will notice yourself improving every single time you sit down to type.'
    ],

    medium: [
      'Speed is a byproduct of precision and rhythm. When fingers glide across the keys with quiet confidence, words form seamlessly on the screen. True typing mastery is not about rushing—it is about striking each key cleanly, maintaining steady momentum, and letting practice sharpen your natural reflexes into lightning speed.',
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
      'Quantum computing paradigm shifts—leveraging quantum superposition, entanglement, and decoherence mitigation—challenge cryptographic conventions (such as 2048-bit RSA) while precipitating novel architectures for combinatorial optimization.',
      'Epistemological inquiries regarding artificial intelligence often conflate synthetic pattern recognition with genuine subjective consciousness; phenomenological qualia remain stubbornly enigmatic despite recursive neural hyper-parameter optimization.',
      'The socio-economic implications of distributed ledger protocols (e.g., zero-knowledge rollups, Byzantine fault-tolerant consensus mechanisms) disrupt legacy financial intermediation by replacing bureaucratic trust with deterministic mathematical verification.',
      'Biochemical homeostasis within eukaryotic organisms relies on delicate feedback cascades: allosteric enzymatic modulation, transmembrane electrochemical gradients, and mitochondrial ATP synthesis functioning at thermodynamic equilibrium thresholds.',
      'Metacognitive calibration—the nuanced appraisal of one\'s own epistemic boundaries—distinguishes superficial erudition from profound intellectual rigour; dogmatism invariably falters when confronted with empirical counter-examples.',
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

    // Engine runtime state
    status: 'idle', // 'idle' | 'ready' | 'running' | 'finished'
    targetText: '',
    timeRemaining: 60,
    timerInterval: null,
    startTime: null,
    elapsedSeconds: 0,

    // Keystroke telemetry
    typedCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    grossWPM: 0,
    netWPM: 0,
    accuracy: 100
  };

  // --------------------------------------------------------------------------
  // 3. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  // Setup & Layout Controls
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

  // Results Modal
  const resultsModal = document.getElementById('results-modal');
  const resultsTitle = document.getElementById('results-title');
  const resultsSub = document.getElementById('results-sub');
  const resultsBadgeText = document.getElementById('results-badge-text');
  const resultFinalWpm = document.getElementById('result-final-wpm');
  const resultFinalAccuracy = document.getElementById('result-final-accuracy');
  const resultFinalChars = document.getElementById('result-final-chars');
  const resultFinalCorrect = document.getElementById('result-final-correct');
  const resultFinalIncorrect = document.getElementById('result-final-incorrect');
  const resultFinalTime = document.getElementById('result-final-time');
  const resultFinalDifficulty = document.getElementById('result-final-difficulty');
  const btnResultsRetry = document.getElementById('btn-results-retry');
  const btnResultsConfig = document.getElementById('btn-results-config');

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
  // 4. PARAGRAPH SELECTION LOGIC (Section 1)
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
  // 5. PARAGRAPH RENDERING AS CHARACTER SPANS (Section 3)
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

      span.textContent = char;
      if (char === ' ') {
        span.classList.add('char-space');
      }

      // First character gets active cursor
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

  // Difficulty Selector Buttons
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

  // Timer Selector Buttons (15s, 30s, 60s, 120s)
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
  // 7. TEST TRANSITION ENGINE (Section 2)
  // --------------------------------------------------------------------------
  function startTypingSession() {
    // 1. Transition away from welcome screen and controls card
    if (welcomeSection) welcomeSection.classList.add('is-hidden');
    if (controlsSection) controlsSection.classList.add('is-hidden');
    if (featuresGrid) featuresGrid.classList.add('is-hidden');

    // 2. Reveal HUD, progress bar, and character telemetry
    if (testHud) testHud.classList.remove('is-hidden');
    if (testProgressContainer) testProgressContainer.classList.remove('is-hidden');
    if (characterTelemetry) characterTelemetry.classList.remove('is-hidden');
    if (canvasFocusOverlay) canvasFocusOverlay.classList.add('is-hidden');
    if (typingCanvas) typingCanvas.classList.add('is-active');

    // 3. Update preview header to active state
    if (previewHeading) previewHeading.textContent = 'Active Typing Session';
    if (previewStatusDesc) previewStatusDesc.textContent = 'Session:';
    if (statusIndicatorDot) statusIndicatorDot.style.backgroundColor = 'var(--color-accent)';

    // 4. Update tags on stats bar
    if (statWpmTag) statWpmTag.textContent = 'LIVE';
    if (statAccTag) statAccTag.textContent = 'LIVE';
    if (statTimeTag) statTimeTag.textContent = 'REMAINING';
    if (disclaimerText) disclaimerText.textContent = 'Test in progress. Press Esc or click Restart to reset with a new paragraph.';

    // 5. Select random non-repeating paragraph
    appState.targetText = getRandomParagraph(appState.difficulty);
    renderParagraphChars(appState.targetText);

    // 6. Reset telemetry and runtime state
    clearInterval(appState.timerInterval);
    appState.timerInterval = null;
    appState.startTime = null;
    appState.elapsedSeconds = 0;
    appState.timeRemaining = appState.duration;
    appState.typedCount = 0;
    appState.correctCount = 0;
    appState.incorrectCount = 0;
    appState.grossWPM = 0;
    appState.netWPM = 0;
    appState.accuracy = 100;
    appState.status = 'ready'; // Ready to type; timer begins on first key

    // 7. Reset telemetry DOM displays
    updateTelemetryDisplay();
    if (previewWpm) previewWpm.textContent = '0';
    if (previewAccuracy) previewAccuracy.textContent = '100%';
    if (previewTime) previewTime.textContent = `${appState.duration}s`;
    if (hudTimerCountdown) hudTimerCountdown.textContent = `${appState.duration}s`;
    if (progressBarFill) progressBarFill.style.width = '0%';
    if (progressBarVal) progressBarVal.textContent = '0%';

    // 8. Enable, clear, and focus input area
    if (typingInput) {
      typingInput.disabled = false;
      typingInput.value = '';
      typingInput.focus();
    }

    // 9. Smooth scroll to canvas
    if (previewSection) {
      previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Return to Setup / Welcome Screen
  function exitToSetup() {
    clearInterval(appState.timerInterval);
    appState.timerInterval = null;
    appState.status = 'idle';

    if (welcomeSection) welcomeSection.classList.remove('is-hidden');
    if (controlsSection) controlsSection.classList.remove('is-hidden');
    if (featuresGrid) featuresGrid.classList.remove('is-hidden');

    if (testHud) testHud.classList.add('is-hidden');
    if (testProgressContainer) testProgressContainer.classList.add('is-hidden');
    if (characterTelemetry) characterTelemetry.classList.add('is-hidden');
    if (canvasFocusOverlay) canvasFocusOverlay.classList.add('is-hidden');
    if (resultsModal) resultsModal.classList.add('is-hidden');
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
  }

  // --------------------------------------------------------------------------
  // 8. LIVE COUNTDOWN TIMER (Section 5)
  // --------------------------------------------------------------------------
  function startCountdownTimer() {
    if (appState.timerInterval) return;

    appState.status = 'running';
    appState.startTime = performance.now();
    appState.timeRemaining = appState.duration;

    appState.timerInterval = setInterval(() => {
      appState.timeRemaining--;
      appState.elapsedSeconds = appState.duration - appState.timeRemaining;

      // Update timer displays
      const timerStr = `${appState.timeRemaining}s`;
      if (hudTimerCountdown) hudTimerCountdown.textContent = timerStr;
      if (previewTime) previewTime.textContent = timerStr;

      // Calculate live WPM during running timer
      calculateLiveWPM();

      // Check if time expired
      if (appState.timeRemaining <= 0) {
        clearInterval(appState.timerInterval);
        appState.timerInterval = null;
        finishTypingSession(false); // Time expired
      }
    }, 1000);
  }

  // --------------------------------------------------------------------------
  // 9. CHARACTER-BY-CHARACTER MATCHING ENGINE (Section 3 & 4)
  // --------------------------------------------------------------------------
  function handleTypingInput(e) {
    if (appState.status === 'finished') return;

    // Start countdown timer on first keypress
    if (appState.status === 'ready') {
      startCountdownTimer();
    }

    const target = appState.targetText;
    let typed = typingInput.value;

    // Prevent typing beyond the target paragraph length (Section 3 restriction)
    if (typed.length > target.length) {
      typed = typed.slice(0, target.length);
      typingInput.value = typed;
    }

    const typedLen = typed.length;
    const targetLen = target.length;
    let correct = 0;
    let incorrect = 0;

    const charSpans = sampleParagraph.querySelectorAll('.char');

    // Compare every typed character against target paragraph
    for (let i = 0; i < targetLen; i++) {
      const span = charSpans[i];
      if (!span) continue;

      span.classList.remove('current', 'current-end');

      if (i < typedLen) {
        span.classList.remove('untyped');
        if (typed[i] === target[i]) {
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

    // Position cursor / current-position indicator
    if (typedLen < targetLen) {
      const activeSpan = charSpans[typedLen];
      if (activeSpan) {
        activeSpan.classList.add('current');
      }
    } else if (typedLen === targetLen && targetLen > 0) {
      // Trailing cursor on the last character
      const lastSpan = charSpans[targetLen - 1];
      if (lastSpan) {
        lastSpan.classList.add('current-end');
      }
    }

    // Update state numbers
    appState.typedCount = typedLen;
    appState.correctCount = correct;
    appState.incorrectCount = incorrect;

    // Calculate real-time accuracy percentage
    if (typedLen > 0) {
      appState.accuracy = Math.max(0, Math.round((correct / typedLen) * 100));
    } else {
      appState.accuracy = 100;
    }

    // Update Progress Indicator & Character Telemetry (Section 4)
    updateProgressAndTelemetry();
    calculateLiveWPM();

    // Check completion: finished whole paragraph before time ran out
    if (typedLen === targetLen) {
      clearInterval(appState.timerInterval);
      appState.timerInterval = null;
      finishTypingSession(true); // Complete
    }
  }

  // Update Live Telemetry & Progress Bar (Section 4)
  function updateProgressAndTelemetry() {
    const total = appState.targetText.length;
    const typed = appState.typedCount;
    const correct = appState.correctCount;
    const incorrect = appState.incorrectCount;
    const remaining = Math.max(0, total - typed);
    const percent = total > 0 ? Math.min(100, Math.round((typed / total) * 100)) : 0;

    // Character telemetry counters
    if (counterTyped) counterTyped.textContent = String(typed);
    if (counterCorrect) counterCorrect.textContent = String(correct);
    if (counterIncorrect) counterIncorrect.textContent = String(incorrect);
    if (counterRemaining) counterRemaining.textContent = String(remaining);

    // Progress bar
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;
    if (progressBarVal) progressBarVal.textContent = `${percent}%`;

    // Live accuracy display
    if (previewAccuracy) previewAccuracy.textContent = `${appState.accuracy}%`;
  }

  function updateTelemetryDisplay() {
    const total = appState.targetText.length;
    if (counterTyped) counterTyped.textContent = '0';
    if (counterCorrect) counterCorrect.textContent = '0';
    if (counterIncorrect) counterIncorrect.textContent = '0';
    if (counterRemaining) counterRemaining.textContent = String(total);
  }

  // Calculate live WPM
  function calculateLiveWPM() {
    const minutes = Math.max(0.016, appState.elapsedSeconds / 60); // min 1 second
    const gross = Math.round((appState.typedCount / 5) / minutes);
    const net = Math.max(0, Math.round((appState.correctCount / 5) / minutes));

    appState.grossWPM = isNaN(gross) ? 0 : gross;
    appState.netWPM = isNaN(net) ? 0 : net;

    if (previewWpm) previewWpm.textContent = String(appState.netWPM);
  }

  // --------------------------------------------------------------------------
  // 10. SESSION FINISH & PERFORMANCE SUMMARY
  // --------------------------------------------------------------------------
  function finishTypingSession(completedAll) {
    appState.status = 'finished';

    if (typingInput) {
      typingInput.disabled = true;
    }

    const elapsed = Math.max(1, appState.elapsedSeconds);
    const minutes = elapsed / 60;
    const finalWPM = Math.max(0, Math.round((appState.correctCount / 5) / minutes));
    const capDifficulty = appState.difficulty.charAt(0).toUpperCase() + appState.difficulty.slice(1);

    // Populate Results Modal
    if (resultFinalWpm) resultFinalWpm.textContent = String(finalWPM);
    if (resultFinalAccuracy) resultFinalAccuracy.textContent = String(appState.accuracy);
    if (resultFinalChars) resultFinalChars.textContent = String(appState.typedCount);
    if (resultFinalCorrect) resultFinalCorrect.textContent = String(appState.correctCount);
    if (resultFinalIncorrect) resultFinalIncorrect.textContent = String(appState.incorrectCount);
    if (resultFinalTime) resultFinalTime.textContent = `${elapsed}s`;
    if (resultFinalDifficulty) resultFinalDifficulty.textContent = `${capDifficulty} Difficulty • ${appState.duration}s Limit`;

    if (resultsBadgeText) {
      resultsBadgeText.textContent = completedAll ? 'CHALLENGE COMPLETED' : 'TIME EXPIRED';
    }
    if (resultsHeadline) {
      resultsHeadline.textContent = completedAll ? 'Exceptional Speed!' : 'Session Complete';
    }
    if (resultsSub) {
      resultsSub.textContent = completedAll
        ? 'All characters successfully cleared with arcade precision.'
        : 'Time elapsed! Review your precision metrics and try again.';
    }

    // Display Results Modal
    if (resultsModal) {
      resultsModal.classList.remove('is-hidden');
      if (btnResultsRetry) btnResultsRetry.focus();
    }
  }

  const resultsHeadline = document.getElementById('results-title');

  // --------------------------------------------------------------------------
  // 11. FOCUS MANAGEMENT FOR DESKTOP & MOBILE TOUCHSCREEN KEYBOARDS
  // --------------------------------------------------------------------------
  if (typingCanvas && typingInput) {
    // Tapping/clicking anywhere on the typing canvas focuses the hidden input
    typingCanvas.addEventListener('click', () => {
      if (appState.status === 'ready' || appState.status === 'running') {
        typingInput.focus();
        if (canvasFocusOverlay) canvasFocusOverlay.classList.add('is-hidden');
      }
    });

    // Handle blur: show overlay so user knows they need to click back
    typingInput.addEventListener('blur', () => {
      if ((appState.status === 'ready' || appState.status === 'running') && canvasFocusOverlay) {
        // Small delay to check if focus went to modal
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

    // Wire input event
    typingInput.addEventListener('input', handleTypingInput);
  }

  if (canvasFocusOverlay && typingInput) {
    canvasFocusOverlay.addEventListener('click', () => {
      canvasFocusOverlay.classList.add('is-hidden');
      typingInput.focus();
    });
  }

  // --------------------------------------------------------------------------
  // 12. ACTION BUTTONS & SHORTCUTS
  // --------------------------------------------------------------------------
  // Start Button
  if (startButton) {
    startButton.addEventListener('click', () => {
      startTypingSession();
    });
  }

  // Restart Button in HUD
  if (btnHudRestart) {
    btnHudRestart.addEventListener('click', () => {
      startTypingSession();
    });
  }

  // Config Button in HUD
  if (btnHudConfig) {
    btnHudConfig.addEventListener('click', () => {
      exitToSetup();
    });
  }

  // Results Retry Button
  if (btnResultsRetry) {
    btnResultsRetry.addEventListener('click', () => {
      if (resultsModal) resultsModal.classList.add('is-hidden');
      startTypingSession();
    });
  }

  // Results Config Button
  if (btnResultsConfig) {
    btnResultsConfig.addEventListener('click', () => {
      if (resultsModal) resultsModal.classList.add('is-hidden');
      exitToSetup();
    });
  }

  // Keyboard Shortcuts: Escape to restart or close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (resultsModal && !resultsModal.classList.contains('is-hidden')) {
        resultsModal.classList.add('is-hidden');
        startTypingSession();
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
        startTypingSession(); // Quick restart with new paragraph
      }
    }
  });

  // --------------------------------------------------------------------------
  // 13. SOUND TOGGLE CONTROLS
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
  // 14. NAVIGATION LINKS
  // --------------------------------------------------------------------------
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');

      if (targetId === '#home') {
        e.preventDefault();
        exitToSetup();
        navLinks.forEach((l) => l.classList.remove('is-active'));
        link.classList.add('is-active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (targetId === '#practice') {
        e.preventDefault();
        startTypingSession();
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

  // --------------------------------------------------------------------------
  // 15. SETTINGS & ABOUT MODALS
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
  if (footerAboutLink && aboutModal) {
    footerAboutLink.addEventListener('click', (e) => {
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

  [settingsModal, aboutModal, resultsModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        if (modal === resultsModal) {
          modal.classList.add('is-hidden');
          startTypingSession();
        } else {
          closeModal(modal);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // 16. INITIALIZATION
  // --------------------------------------------------------------------------
  updateConfigPreview();

  console.log(
    '%c⚡ MINNALTYPING %c— Phase 2 Typing Engine Active (%d Paragraphs Ready)',
    'background: #B7F75B; color: #10131B; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    'color: #F2F4F0; font-weight: 500;',
    PARAGRAPH_BANK.easy.length + PARAGRAPH_BANK.medium.length + PARAGRAPH_BANK.hard.length
  );
});
