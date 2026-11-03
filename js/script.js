/**
 * ============================================================================
 * MINNALTYPING — PHASE 1 JAVASCRIPT
 * Pure Vanilla JavaScript Foundation
 *
 * Responsibilities in Phase 1:
 * - Handle configuration selectors (Difficulty & Timer)
 * - Synchronize preview display with active settings
 * - Sound toggle UI state handling
 * - Settings and About modal management
 * - Keyboard accessibility (Escape, focus management)
 *
 * Note: Actual typing engine, scoring, and audio synthesis will be
 * implemented in Phase 2.
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // Application State (Phase 1 UI State)
  // --------------------------------------------------------------------------
  const appState = {
    difficulty: 'medium',
    duration: 60,
    soundEnabled: true,
  };

  // --------------------------------------------------------------------------
  // DOM Elements Cache
  // --------------------------------------------------------------------------
  const difficultyButtons = document.querySelectorAll('[data-difficulty]');
  const timerButtons = document.querySelectorAll('[data-time]');
  const startButton = document.getElementById('start-btn');

  const previewCurrentConfig = document.getElementById('preview-current-config');
  const previewTime = document.getElementById('preview-time');
  const sampleParagraph = document.getElementById('sample-paragraph');
  const previewSection = document.getElementById('preview-section');
  const typingCanvas = document.querySelector('.typing-canvas');

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

  const navLinks = document.querySelectorAll('.nav-link');

  // --------------------------------------------------------------------------
  // Sample Text Bank for Difficulty Preview
  // --------------------------------------------------------------------------
  const sampleTexts = {
    easy: 'Practice makes progress. Start simple, stay calm, and keep your hands steady on the home row keys. Speed will naturally follow clean technique.',
    medium: 'Speed is a byproduct of precision and rhythm. When fingers glide across the keys with quiet confidence, words form seamlessly on the screen. True typing mastery is not about rushing—it is about striking each key cleanly, maintaining steady momentum, and letting practice sharpen your natural reflexes into lightning speed.',
    hard: 'Algorithmic efficiency mirrors cognitive dexterity; keystrokes executing at 120+ WPM necessitate synchronization, instantaneous phonetic parsing, and unyielding discipline under strict latency constraints.'
  };

  // --------------------------------------------------------------------------
  // Update Preview UI Helpers
  // --------------------------------------------------------------------------
  function updateConfigPreview() {
    const capitalizedDifficulty = appState.difficulty.charAt(0).toUpperCase() + appState.difficulty.slice(1);
    if (previewCurrentConfig) {
      previewCurrentConfig.textContent = `${capitalizedDifficulty} • ${appState.duration}s`;
    }
    if (previewTime) {
      previewTime.textContent = `${appState.duration}s`;
    }
    if (sampleParagraph && sampleTexts[appState.difficulty]) {
      sampleParagraph.textContent = sampleTexts[appState.difficulty];
    }
  }

  // --------------------------------------------------------------------------
  // Selector Interactivity: Difficulty
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Selector Interactivity: Timer
  // --------------------------------------------------------------------------
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

      updateConfigPreview();
    });
  });

  // --------------------------------------------------------------------------
  // Sound Toggle Interactivity
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
  // Start Button Interactivity (Phase 1 feedback)
  // --------------------------------------------------------------------------
  if (startButton) {
    startButton.addEventListener('click', () => {
      // Scroll smoothly to preview canvas
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (typingCanvas) {
        // Visual focus cue
        typingCanvas.focus();
        typingCanvas.style.borderColor = 'var(--color-accent)';
        setTimeout(() => {
          typingCanvas.style.borderColor = '';
        }, 1200);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Navigation Links Interactivity
  // --------------------------------------------------------------------------
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
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
  // Modal Management (Settings & About)
  // --------------------------------------------------------------------------
  function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('is-hidden');
    document.body.style.overflow = '';
  }

  // Settings Modal Listeners
  if (settingsToggleBtn && settingsModal) {
    settingsToggleBtn.addEventListener('click', () => openModal(settingsModal));
  }
  if (settingsCloseBtn && settingsModal) {
    settingsCloseBtn.addEventListener('click', () => closeModal(settingsModal));
  }
  if (settingsOkBtn && settingsModal) {
    settingsOkBtn.addEventListener('click', () => closeModal(settingsModal));
  }

  // About Modal Listeners
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

  // Close modals on clicking backdrop
  [settingsModal, aboutModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Keyboard accessibility: Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(settingsModal);
      closeModal(aboutModal);
    }
  });

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  updateConfigPreview();
  console.log(
    '%c⚡ MINNALTYPING %c— Phase 1 Foundation Initialized Successfully',
    'background: #B7F75B; color: #10131B; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    'color: #F2F4F0; font-weight: 500;'
  );
});

