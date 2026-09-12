/**
 * IEEE ROBOTICS & AUTOMATION SOCIETY — VIT CHENNAI CHAPTER
 * Core Application Engine: Multi-Screen Routing, Theme Manager, 
 * Interactive Robotics Canvas, Member Workspace, & Participant Portal
 */

(function () {
  'use strict';

  // State Management
  const state = {
    theme: localStorage.getItem('ieee_ras_theme') || 'dark',
    activeScreen: 'landing', // 'landing' | 'member-portal' | 'participant-portal'
    activeChannel: 'ai-ml-projects',
    isMeetingActive: false,
    countdownSeconds: 12 * 3600 + 45 * 60 + 30, // 12h 45m 30s
    uploadProgress: 75,
    uploadInterval: null
  };

  // DOM Cache
  const screens = {
    landing: document.getElementById('screen-landing'),
    member: document.getElementById('screen-member'),
    participant: document.getElementById('screen-participant')
  };
  const authModal = document.getElementById('auth-modal');
  const certModal = document.getElementById('cert-modal');
  const meetingModal = document.getElementById('meeting-modal');
  const themeToggleButtons = document.querySelectorAll('.theme-toggle-btn');
  const canvas = document.getElementById('canvas-robotics');

  /* ==========================================================================
     THEME MANAGEMENT
     ========================================================================== */
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ieee_ras_theme', theme);

    themeToggleButtons.forEach(btn => {
      btn.innerHTML = theme === 'dark' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` 
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    });

    if (window.updateCanvasColors) {
      window.updateCanvasColors(theme);
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  themeToggleButtons.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  /* ==========================================================================
     SCREEN ROUTING
     ========================================================================== */
  function switchScreen(screenName) {
    if (!screens[screenName]) return;
    
    // Deactivate all screens
    Object.values(screens).forEach(screen => {
      if (screen) screen.classList.remove('active-screen');
    });

    // Close modals
    closeAuthModal();
    if (certModal) certModal.classList.remove('active');
    if (meetingModal) meetingModal.classList.remove('active');

    // Activate target screen
    screens[screenName].classList.add('active-screen');
    state.activeScreen = screenName;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update canvas visibility: more prominent on landing, subtle in portals
    if (canvas) {
      canvas.style.opacity = screenName === 'landing' ? '1' : '0.25';
    }
  }

  function openAuthModal() {
    if (authModal) {
      authModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAuthModal() {
    if (authModal) {
      authModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Bind auth buttons
  document.querySelectorAll('.open-auth-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal();
    });
  });

  const authCloseBtn = document.getElementById('auth-modal-close');
  if (authCloseBtn) {
    authCloseBtn.addEventListener('click', closeAuthModal);
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Member Login button click -> switch to Member Portal (Screen 3)
  const btnLoginMember = document.getElementById('btn-login-member');
  const btnLoginMemberGoogle = document.getElementById('btn-login-member-google');
  if (btnLoginMember) {
    btnLoginMember.addEventListener('click', () => {
      closeAuthModal();
      switchScreen('member');
    });
  }
  if (btnLoginMemberGoogle) {
    btnLoginMemberGoogle.addEventListener('click', () => {
      closeAuthModal();
      switchScreen('member');
    });
  }

  // Participant Login button click -> switch to Participant Portal (Screen 4)
  const btnLoginParticipant = document.getElementById('btn-login-participant');
  if (btnLoginParticipant) {
    btnLoginParticipant.addEventListener('click', () => {
      closeAuthModal();
      switchScreen('participant');
    });
  }

  // Logout / Return buttons
  document.querySelectorAll('.logout-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchScreen('landing');
    });
  });

  /* ==========================================================================
     INTERACTIVE ROBOTICS & TELEMETRY CANVAS
     ========================================================================== */
  function initRoboticsCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 140 };

    let particleColor = state.theme === 'dark' ? 'rgba(0, 255, 102, 0.7)' : 'rgba(0, 180, 216, 0.7)';
    let lineColor = state.theme === 'dark' ? 'rgba(0, 255, 102, 0.12)' : 'rgba(0, 180, 216, 0.12)';

    window.updateCanvasColors = function (theme) {
      particleColor = theme === 'dark' ? 'rgba(0, 255, 102, 0.7)' : 'rgba(0, 180, 216, 0.7)';
      lineColor = theme === 'dark' ? 'rgba(0, 255, 102, 0.12)' : 'rgba(0, 180, 216, 0.12)';
    };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.9;
        this.vy = (Math.random() - 0.5) * 0.9;
        this.radius = Math.random() * 2 + 1.2;
        this.isRoboNode = Math.random() > 0.85; // Special kinematic joint node
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse reactive displacement
        if (mouse.x && mouse.y) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 3;
            this.y -= (dy / dist) * force * 3;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        if (this.isRoboNode) {
          ctx.strokeStyle = particleColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(this.x - 4, this.y - 4, 8, 8);
        }
      }
    }

    function createParticles() {
      particles = [];
      const count = Math.floor((width * height) / 16000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Connect kinematic links
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1 - dist / 110;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    resize();
    animate();
  }

  /* ==========================================================================
     MEMBER PORTAL (SCREEN 3) INTERACTION
     ========================================================================== */
  function initMemberPortal() {
    const channelItems = document.querySelectorAll('.channel-item');
    const channelTitleElem = document.getElementById('chat-active-channel-name');
    const chatMessagesContainer = document.getElementById('chat-messages-box');
    const chatInput = document.getElementById('chat-user-input');
    const sendBtn = document.getElementById('btn-send-chat');
    const videoMeetingBtn = document.getElementById('btn-start-video');
    const closeMeetingBtn = document.getElementById('btn-close-meeting');
    const copyCodeBtn = document.getElementById('btn-copy-code');

    // Channel Switching
    channelItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        channelItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const channelName = item.dataset.channel || 'ai-ml-projects';
        state.activeChannel = channelName;
        if (channelTitleElem) {
          channelTitleElem.textContent = `#${channelName}`;
        }
      });
    });

    // Send Message
    function sendMessage() {
      if (!chatInput) return;
      const text = chatInput.value.trim();
      if (!text) return;

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const msgRow = document.createElement('div');
      msgRow.className = 'chat-msg-row';
      msgRow.innerHTML = `
        <div class="msg-avatar msg-avatar-user">SR</div>
        <div class="msg-body">
          <div class="msg-meta">
            <span class="msg-author">Satyajit R</span>
            <span class="badge-pill badge-green" style="padding: 0.1rem 0.4rem; font-size: 0.65rem;">Lead</span>
            <span class="msg-time">${timeStr}</span>
          </div>
          <div class="msg-bubble">${escapeHtml(text)}</div>
        </div>
      `;

      chatMessagesContainer.appendChild(msgRow);
      chatInput.value = '';
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }

    // Copy Code Snippet
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener('click', () => {
        const codeElem = document.getElementById('sample-ros-code');
        if (codeElem) {
          navigator.clipboard.writeText(codeElem.innerText).then(() => {
            copyCodeBtn.innerHTML = `Copied!`;
            setTimeout(() => {
              copyCodeBtn.innerHTML = `Copy`;
            }, 2000);
          });
        }
      });
    }

    // Video Meeting Modal Simulation
    if (videoMeetingBtn && meetingModal) {
      videoMeetingBtn.addEventListener('click', () => {
        meetingModal.classList.add('active');
      });
    }
    if (closeMeetingBtn && meetingModal) {
      closeMeetingBtn.addEventListener('click', () => {
        meetingModal.classList.remove('active');
      });
    }

    // Gemini AI Assistant Interactive Chips & Responses
    const aiChips = document.querySelectorAll('.ai-query-chip');
    const aiResponseBox = document.getElementById('ai-response-display');

    const aiResponses = {
      summary: `<strong>Channel Summary (#ai-ml-projects):</strong><br>
        • Rover autonomous LiDAR SLAM testing completed with 98.4% point cloud alignment.<br>
        • Model weights for YOLOv10 obstacle classification pushed to internal NAS storage.<br>
        • Next milestone: Field trial at VIT Chennai Tech Quad this Thursday 4:00 PM.`,
      kinematics: `<strong>Kinematics Check:</strong><br>
        • Forward kinematics 4-DOF manipulator Jacobian matrix verified: Determinant non-zero across standard trajectory.<br>
        • Singularity damping factor set to λ = 0.05 to prevent joint velocity spikes.`,
      components: `<strong>Recommended Actuators & Compute:</strong><br>
        • Onboard SBC: NVIDIA Jetson Orin Nano (40 TOPS INT8).<br>
        • Motors: Dynamixel XM430-W350-T with RS-485 bus feedback.`
    };

    aiChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const queryKey = chip.dataset.query || 'summary';
        if (aiResponseBox) {
          aiResponseBox.innerHTML = `<span style="color: var(--accent-primary); font-family: var(--font-mono);">⚡ Gemini AI is synthesizing channel telemetry...</span>`;
          setTimeout(() => {
            aiResponseBox.innerHTML = aiResponses[queryKey] || aiResponses.summary;
          }, 450);
        }
      });
    });
  }

  /* ==========================================================================
     PARTICIPANT PORTAL (SCREEN 4) INTERACTION
     ========================================================================== */
  function initParticipantPortal() {
    // Countdown Timer Logic
    const countdownDigits = document.getElementById('event-countdown-timer');

    function updateCountdown() {
      if (state.countdownSeconds <= 0) return;
      state.countdownSeconds--;

      const hours = Math.floor(state.countdownSeconds / 3600);
      const minutes = Math.floor((state.countdownSeconds % 3600) / 60);
      const seconds = state.countdownSeconds % 60;

      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      if (countdownDigits) {
        countdownDigits.textContent = formatted;
      }
    }

    setInterval(updateCountdown, 1000);

    // Submission Drag & Drop & Upload Simulation
    const dropzone = document.getElementById('submission-dropzone');
    const fileInput = document.getElementById('submission-file-input');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadProgressPercent = document.getElementById('upload-progress-percent');
    const uploadFileName = document.getElementById('upload-file-name');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
          startUploadSimulation(e.dataTransfer.files[0].name);
        }
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          startUploadSimulation(fileInput.files[0].name);
        }
      });
    }

    function startUploadSimulation(name) {
      if (uploadFileName) uploadFileName.textContent = name;
      let progress = 0;
      if (uploadProgressBar) uploadProgressBar.style.width = '0%';
      if (uploadProgressPercent) uploadProgressPercent.textContent = '0%';

      if (state.uploadInterval) clearInterval(state.uploadInterval);

      state.uploadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 12) + 8;
        if (progress >= 100) {
          progress = 100;
          clearInterval(state.uploadInterval);
          if (uploadProgressPercent) uploadProgressPercent.textContent = '100% (Uploaded & Verified ✓)';
        } else {
          if (uploadProgressPercent) uploadProgressPercent.textContent = `${progress}%`;
        }
        if (uploadProgressBar) uploadProgressBar.style.width = `${progress}%`;
      }, 150);
    }

    // Certificate Preview Modal
    const viewCertButtons = document.querySelectorAll('.btn-view-cert');
    const closeCertBtn = document.getElementById('cert-modal-close');

    viewCertButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const certName = btn.dataset.certName || 'RoboWars 2025 Finalist';
        const certRecipient = btn.dataset.recipient || 'R Satyajit';
        const certTitleElem = document.getElementById('cert-modal-title');
        const certRecipientElem = document.getElementById('cert-modal-recipient');

        if (certTitleElem) certTitleElem.textContent = certName;
        if (certRecipientElem) certRecipientElem.textContent = certRecipient;
        if (certModal) certModal.classList.add('active');
      });
    });

    if (closeCertBtn && certModal) {
      closeCertBtn.addEventListener('click', () => certModal.classList.remove('active'));
      certModal.addEventListener('click', (e) => {
        if (e.target === certModal) certModal.classList.remove('active');
      });
    }
  }

  // Utility to prevent XSS in chat
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(state.theme);
    initRoboticsCanvas();
    initMemberPortal();
    initParticipantPortal();

    // Check hash for direct route testing
    const hash = window.location.hash.replace('#', '');
    if (hash === 'member-portal') {
      switchScreen('member');
    } else if (hash === 'participant-portal') {
      switchScreen('participant');
    } else {
      switchScreen('landing');
    }
  });

  // Global expose for quick navigation in demo / tests
  window.ieeeRas = {
    switchScreen,
    openAuthModal,
    closeAuthModal,
    toggleTheme,
    state
  };

})();
