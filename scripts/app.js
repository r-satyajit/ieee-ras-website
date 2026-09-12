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
    uploadInterval: null,
    currentUser: {
      name: 'Satyajit R',
      email: 'satyajit.r2024@vitstudent.ac.in',
      role: 'club_lead', // 'club_lead' | 'regular_member'
      roleTitle: 'Lead Architect',
      track: 'Autonomous Systems & ROS2 Navigation'
    }
  };

  // Pre-provisioned Core Member Registry (Only Club Leads can add members)
  const defaultMembers = [
    {
      id: 'mem-1',
      name: 'Satyajit R',
      email: 'satyajit.r2024@vitstudent.ac.in',
      password: 'lead123',
      role: 'Lead Architect',
      roleType: 'club_lead',
      track: 'Autonomous Robotics & ROS2',
      status: 'Online'
    },
    {
      id: 'mem-2',
      name: 'Ananya Sharma',
      email: 'ananya.s2024@vitstudent.ac.in',
      password: 'lead123',
      role: 'Subsystem Lead (AI & Vision)',
      roleType: 'club_lead',
      track: 'AI & Computer Vision',
      status: 'Online'
    },
    {
      id: 'mem-3',
      name: 'Kavya Patel',
      email: 'kavya.p2024@vitstudent.ac.in',
      password: 'member123',
      role: 'Core R&D Engineer',
      roleType: 'regular_member',
      track: 'Mechanical CAD & Bionics',
      status: 'Online'
    },
    {
      id: 'mem-4',
      name: 'Aryan Nair',
      email: 'aryan.n2024@vitstudent.ac.in',
      password: 'member123',
      role: 'Junior Researcher',
      roleType: 'regular_member',
      track: 'Autonomous Robotics & ROS2',
      status: 'Active'
    },
    {
      id: 'mem-5',
      name: 'Rohan Verma',
      email: 'rohan.v2024@vitstudent.ac.in',
      password: 'member123',
      role: 'Core R&D Engineer (Embedded)',
      roleType: 'regular_member',
      track: 'Embedded Systems & Microcontrollers',
      status: 'Offline'
    }
  ];

  let coreMembers = [];
  try {
    const saved = localStorage.getItem('ieee_ras_core_members');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all standard test accounts are always present
      const existingEmails = new Set(parsed.map(m => m.email.toLowerCase()));
      defaultMembers.forEach(defM => {
        if (!existingEmails.has(defM.email.toLowerCase())) {
          parsed.push(defM);
        }
      });
      coreMembers = parsed;
    } else {
      coreMembers = defaultMembers;
    }
  } catch (e) {
    coreMembers = defaultMembers;
  }

  function saveCoreMembers() {
    try {
      localStorage.setItem('ieee_ras_core_members', JSON.stringify(coreMembers));
    } catch (e) {}
  }

  // Unified Role UI Synchronizer (Active for both Lead and Member accounts)
  function updateRoleUI() {
    const isLead = state.currentUser.role === 'club_lead';
    const roleToggleText = document.getElementById('member-role-toggle-text');
    const sidebarRoleLabel = document.getElementById('member-sidebar-role-label');
    const memberSidebarName = document.getElementById('member-sidebar-name');
    const memberSidebarAvatar = document.getElementById('member-sidebar-avatar');
    const btnToggleRole = document.getElementById('btn-toggle-member-role');

    if (roleToggleText) {
      roleToggleText.textContent = isLead ? 'Lead' : 'Member';
    }
    if (sidebarRoleLabel) {
      sidebarRoleLabel.textContent = state.currentUser.roleTitle || (isLead ? 'Lead Architect' : 'Core R&D Engineer');
    }
    if (memberSidebarName && state.currentUser.name) {
      memberSidebarName.textContent = state.currentUser.name;
    }
    if (memberSidebarAvatar && state.currentUser.name) {
      const initials = state.currentUser.name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'SR';
      memberSidebarAvatar.textContent = initials;
    }
    if (btnToggleRole) {
      if (isLead) {
        btnToggleRole.classList.remove('role-regular-member');
        const icon = btnToggleRole.querySelector('.role-badge-icon');
        if (icon) icon.textContent = '⚡';
        btnToggleRole.title = 'Current Role: Club Lead (Click to switch to Regular Member for testing)';
      } else {
        btnToggleRole.classList.add('role-regular-member');
        const icon = btnToggleRole.querySelector('.role-badge-icon');
        if (icon) icon.textContent = '👤';
        btnToggleRole.title = 'Current Role: Regular Member (Click to switch to Club Lead for testing)';
      }
    }
  }

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
      // Reset alert box
      const regAlertBox = document.getElementById('reg-alert-box');
      if (regAlertBox) regAlertBox.style.display = 'none';
    }
  }

  /* ==========================================================================
     UNIFIED AUTHENTICATION GATEWAY & ON-SITE ACCOUNT CREATION
     ========================================================================== */
  function initAuthGateway() {
    // Mode Switcher Tabs
    const tabAuthSso = document.getElementById('tab-auth-sso');
    const tabAuthRegister = document.getElementById('tab-auth-register');
    const authViewSso = document.getElementById('auth-view-sso');
    const authViewRegister = document.getElementById('auth-view-register');
    const btnBackToSso = document.getElementById('btn-back-to-sso');
    const switchLinksToRegister = document.querySelectorAll('.btn-switch-to-register');

    function switchAuthTab(tab) {
      if (tab === 'register') {
        if (tabAuthSso) tabAuthSso.classList.remove('active');
        if (tabAuthRegister) tabAuthRegister.classList.add('active');
        if (authViewSso) authViewSso.classList.remove('active');
        if (authViewRegister) authViewRegister.classList.add('active');
      } else {
        if (tabAuthRegister) tabAuthRegister.classList.remove('active');
        if (tabAuthSso) tabAuthSso.classList.add('active');
        if (authViewRegister) authViewRegister.classList.remove('active');
        if (authViewSso) authViewSso.classList.add('active');
      }
    }

    if (tabAuthSso) tabAuthSso.addEventListener('click', () => switchAuthTab('sso'));
    if (tabAuthRegister) tabAuthRegister.addEventListener('click', () => switchAuthTab('register'));
    if (btnBackToSso) btnBackToSso.addEventListener('click', () => switchAuthTab('sso'));
    switchLinksToRegister.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('register');
      });
    });

    // Core Member: Auto-Fill Lead Demo Credentials Button
    const btnQuickLeadCreds = document.getElementById('btn-quick-lead-creds');
    if (btnQuickLeadCreds) {
      btnQuickLeadCreds.addEventListener('click', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('member-login-email');
        const passInput = document.getElementById('member-login-password');
        if (emailInput) emailInput.value = 'satyajit.r2024@vitstudent.ac.in';
        if (passInput) passInput.value = 'lead123';
        const alertBox = document.getElementById('member-login-alert');
        if (alertBox) alertBox.style.display = 'none';
      });
    }

    // Core Member: Auto-Fill Regular Member Demo Credentials Button
    const btnQuickMemberCreds = document.getElementById('btn-quick-member-creds');
    if (btnQuickMemberCreds) {
      btnQuickMemberCreds.addEventListener('click', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('member-login-email');
        const passInput = document.getElementById('member-login-password');
        if (emailInput) emailInput.value = 'kavya.p2024@vitstudent.ac.in';
        if (passInput) passInput.value = 'member123';
        const alertBox = document.getElementById('member-login-alert');
        if (alertBox) alertBox.style.display = 'none';
      });
    }

    // Core Member Credential Form Submission (Provisioned Access Only)
    const formLoginMember = document.getElementById('form-login-member');
    const memberEmailInput = document.getElementById('member-login-email');
    const memberPassInput = document.getElementById('member-login-password');
    const memberLoginAlert = document.getElementById('member-login-alert');

    if (formLoginMember) {
      formLoginMember.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailOrId = (memberEmailInput ? memberEmailInput.value : '').trim().toLowerCase();
        const pass = (memberPassInput ? memberPassInput.value : '').trim();

        // Check against provisioned members store
        const foundMember = coreMembers.find(m => {
          const emailMatch = m.email.toLowerCase() === emailOrId || m.id.toLowerCase() === emailOrId;
          const shortcutMatch = (m.roleType === 'club_lead' && (emailOrId === 'lead' || emailOrId === 'admin')) ||
                                (m.roleType === 'regular_member' && (emailOrId === 'member' || emailOrId === 'kavya'));
          if (!emailMatch && !shortcutMatch) return false;

          // Password validation
          if (m.password === pass) return true;
          if (m.roleType === 'club_lead' && (pass === 'lead' || pass === 'lead123' || pass === 'admin')) return true;
          if (m.roleType === 'regular_member' && (pass === 'member' || pass === 'member123' || pass === 'pass123')) return true;
          return false;
        });

        if (!foundMember) {
          if (memberLoginAlert) {
            memberLoginAlert.style.display = 'flex';
            memberLoginAlert.className = 'register-alert-box error';
            memberLoginAlert.innerHTML = `⚠️ Access Denied: Invalid member credentials. Please enter a provisioned VIT student email and passcode.`;
          }
          return;
        }

        if (memberLoginAlert) memberLoginAlert.style.display = 'none';

        const isLead = foundMember.roleType === 'club_lead' || foundMember.role.toLowerCase().includes('lead');
        state.currentUser = {
          name: foundMember.name,
          email: foundMember.email,
          role: isLead ? 'club_lead' : 'regular_member',
          roleTitle: foundMember.role,
          track: foundMember.track || 'Robotics'
        };

        updateRoleUI();
        closeAuthModal();
        switchScreen('member');

        // Ensure user always starts in communication hub with channels
        if (window.switchWorkspaceView) {
          window.switchWorkspaceView('chat');
        }
      });
    }

    // Participant Existing Account Login Form Submission
    const formLoginParticipant = document.getElementById('form-login-participant');
    const participantEmailInput = document.getElementById('participant-login-email');
    const participantPassInput = document.getElementById('participant-login-password');
    const participantLoginAlert = document.getElementById('participant-login-alert');

    if (formLoginParticipant) {
      formLoginParticipant.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = (participantEmailInput ? participantEmailInput.value : '').trim();
        const pass = (participantPassInput ? participantPassInput.value : '').trim();

        if (!email || !pass) {
          if (participantLoginAlert) {
            participantLoginAlert.style.display = 'flex';
            participantLoginAlert.className = 'register-alert-box error';
            participantLoginAlert.innerHTML = `⚠️ Please enter your registered email and password.`;
          }
          return;
        }

        if (participantLoginAlert) participantLoginAlert.style.display = 'none';

        const displayName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        state.currentUser = {
          name: displayName || 'Event Participant',
          email: email,
          role: 'participant',
          roleTitle: 'Event Participant',
          track: 'RoboHack 2026'
        };

        closeAuthModal();
        switchScreen('participant');
      });
    }

    // Participant Google SSO Button
    const btnLoginParticipantGoogle = document.getElementById('btn-login-participant-google');
    if (btnLoginParticipantGoogle) {
      btnLoginParticipantGoogle.addEventListener('click', () => {
        state.currentUser = {
          name: 'Alex Chen',
          email: 'alex.chen2024@gmail.com',
          role: 'participant',
          roleTitle: 'Event Participant (Google SSO)',
          track: 'RoboHack 2026'
        };
        closeAuthModal();
        switchScreen('participant');
      });
    }

    // Participant Registration Form Submission
    const formRegister = document.getElementById('form-register-account');
    const regNameInput = document.getElementById('reg-fullname');
    const regEmailInput = document.getElementById('reg-email');
    const regPassInput = document.getElementById('reg-password');
    const regConfirmPassInput = document.getElementById('reg-confirm-password');
    const regTrackSelect = document.getElementById('reg-track');
    const regAlertBox = document.getElementById('reg-alert-box');

    if (formRegister) {
      formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = regNameInput ? regNameInput.value.trim() : '';
        const email = regEmailInput ? regEmailInput.value.trim() : '';
        const pass = regPassInput ? regPassInput.value : '';
        const confirmPass = regConfirmPassInput ? regConfirmPassInput.value : '';
        const track = regTrackSelect ? regTrackSelect.options[regTrackSelect.selectedIndex].text : 'RoboHack';

        // Validation
        if (pass !== confirmPass) {
          if (regAlertBox) {
            regAlertBox.style.display = 'flex';
            regAlertBox.className = 'register-alert-box error';
            regAlertBox.innerHTML = `⚠️ Passwords do not match. Please verify both password entries.`;
          }
          return;
        }

        if (pass.length < 6) {
          if (regAlertBox) {
            regAlertBox.style.display = 'flex';
            regAlertBox.className = 'register-alert-box error';
            regAlertBox.innerHTML = `⚠️ Password must contain at least 6 characters.`;
          }
          return;
        }

        state.currentUser = {
          name: fullName,
          email: email,
          role: 'participant',
          roleTitle: 'Registered Participant',
          track: track
        };

        if (regAlertBox) {
          regAlertBox.style.display = 'flex';
          regAlertBox.className = 'register-alert-box success';
          regAlertBox.innerHTML = `✓ Participant account created successfully! Launching Competition Dashboard...`;
        }

        setTimeout(() => {
          closeAuthModal();
          switchScreen('participant');
          if (regAlertBox) regAlertBox.style.display = 'none';
        }, 650);
      });
    }

    // Modal Trigger Buttons
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

    // Logout Triggers
    document.querySelectorAll('.logout-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchScreen('landing');
      });
    });
  }

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
     MEMBER PORTAL (SCREEN 3) INTERACTION & WORKSPACE VIEWS
     ========================================================================== */
  function initMemberPortal() {
    const channelItems = document.querySelectorAll('.channel-item');
    const workspaceItems = document.querySelectorAll('.workspace-item[data-workspace-view]');
    const backToChatBtns = document.querySelectorAll('.btn-back-to-chat');
    const channelTitleElem = document.getElementById('chat-active-channel-name');
    const chatMessagesContainer = document.getElementById('chat-messages-box');
    const chatInput = document.getElementById('chat-user-input');
    const sendBtn = document.getElementById('btn-send-chat');
    const copyCodeBtn = document.getElementById('btn-copy-code');

    // Views
    const viewChat = document.getElementById('member-view-chat');
    const viewProjects = document.getElementById('member-view-projects');
    const viewResources = document.getElementById('member-view-resources');
    const viewMembers = document.getElementById('member-view-members');

    function switchWorkspaceView(viewId) {
      if (viewChat) viewChat.classList.remove('active-view');
      if (viewProjects) viewProjects.classList.remove('active-view');
      if (viewResources) viewResources.classList.remove('active-view');
      if (viewMembers) viewMembers.classList.remove('active-view');

      if (viewId === 'projects' && viewProjects) {
        viewProjects.classList.add('active-view');
      } else if (viewId === 'resources' && viewResources) {
        viewResources.classList.add('active-view');
      } else if (viewId === 'members' && viewMembers) {
        viewMembers.classList.add('active-view');
        renderMemberRoster();
      } else if (viewChat) {
        viewChat.classList.add('active-view');
      }
    }

    // Expose workspace switcher globally
    window.switchWorkspaceView = switchWorkspaceView;

    // Workspace Item Switching (Project Showcase, Resource Hub, Member Directory & Roles)
    workspaceItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.dataset.workspaceView;

        // Strict RBAC Verification: ONLY CLUB LEADS CAN ACCESS MEMBER ROSTER & ROLE PROVISIONING
        if (targetView === 'members' && state.currentUser.role !== 'club_lead') {
          openRbacWarning('members');
          return;
        }

        // Clear channel selection highlight
        channelItems.forEach(ch => ch.classList.remove('active'));
        // Highlight active workspace item
        workspaceItems.forEach(wi => wi.classList.remove('active'));
        item.classList.add('active');

        switchWorkspaceView(targetView);
      });
    });

    // Back to Chat buttons (from Showcase or Resource Hub)
    backToChatBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        workspaceItems.forEach(wi => wi.classList.remove('active'));
        switchWorkspaceView('chat');
        // Restore default channel highlight
        const defaultChannel = document.querySelector('.channel-item[data-channel="ai-ml-projects"]');
        if (defaultChannel) defaultChannel.classList.add('active');
      });
    });

    // Optional Quick Action Button in Chat Header to manage members
    const btnQuickManageMembers = document.getElementById('btn-quick-manage-members');
    if (btnQuickManageMembers) {
      btnQuickManageMembers.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.currentUser.role !== 'club_lead') {
          openRbacWarning('members');
        } else {
          channelItems.forEach(ch => ch.classList.remove('active'));
          workspaceItems.forEach(wi => wi.classList.remove('active'));
          const membersNav = document.getElementById('nav-workspace-members');
          if (membersNav) membersNav.classList.add('active');
          switchWorkspaceView('members');
        }
      });
    }

    // Channel Selection & Switching
    const channelListContainer = document.getElementById('member-channel-list');

    function selectChannel(channelName, itemElement) {
      workspaceItems.forEach(wi => wi.classList.remove('active'));
      document.querySelectorAll('.channel-item').forEach(i => i.classList.remove('active'));
      if (itemElement) itemElement.classList.add('active');
      
      switchWorkspaceView('chat');
      
      state.activeChannel = channelName;
      if (channelTitleElem) {
        channelTitleElem.textContent = `#${channelName}`;
      }
    }

    if (channelListContainer) {
      channelListContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.channel-item');
        if (!item) return;
        e.preventDefault();
        const channelName = item.dataset.channel || 'ai-ml-projects';
        selectChannel(channelName, item);
      });
    }

    /* ------------------------------------------------------------------------
       ROLE-BASED ACCESS CONTROL (RBAC) & TESTING ROLE SWITCHER
       ------------------------------------------------------------------------ */
    const btnToggleRole = document.getElementById('btn-toggle-member-role');

    if (btnToggleRole) {
      btnToggleRole.addEventListener('click', () => {
        state.currentUser.role = state.currentUser.role === 'club_lead' ? 'regular_member' : 'club_lead';
        state.currentUser.roleTitle = state.currentUser.role === 'club_lead' ? 'Lead Architect' : 'Core R&D Engineer';
        updateRoleUI();
      });
    }

    updateRoleUI();

    /* ------------------------------------------------------------------------
       CHANNEL CREATION MODAL & LEAD RBAC RESTRICTION
       ------------------------------------------------------------------------ */
    const btnOpenCreateChannel = document.getElementById('btn-open-create-channel');
    const channelCreateModal = document.getElementById('channel-create-modal');
    const btnCloseChannelModal = document.getElementById('btn-close-channel-modal');
    const btnCancelChannelModal = document.getElementById('btn-cancel-channel-modal');
    const formCreateChannel = document.getElementById('form-create-channel');
    const inputChannelName = document.getElementById('input-channel-name');
    const inputChannelTopic = document.getElementById('input-channel-topic');
    const selectChannelDomain = document.getElementById('select-channel-domain');

    const rbacWarningModal = document.getElementById('rbac-warning-modal');
    const btnCloseRbacModal = document.getElementById('btn-close-rbac-modal');
    const btnRbacDismiss = document.getElementById('btn-rbac-dismiss');
    const btnRbacSwitchToLead = document.getElementById('btn-rbac-switch-to-lead');
    const rbacModalRoleIndicator = document.getElementById('rbac-modal-role-indicator');

    function openChannelModal() {
      if (channelCreateModal) {
        channelCreateModal.classList.add('active');
        if (inputChannelName) {
          inputChannelName.value = '';
          inputChannelName.focus();
        }
        if (inputChannelTopic) inputChannelTopic.value = '';
      }
    }

    function closeChannelModal() {
      if (channelCreateModal) channelCreateModal.classList.remove('active');
    }

    let rbacPendingAction = null;

    function openRbacWarning(action = 'channel') {
      rbacPendingAction = action;
      if (rbacModalRoleIndicator) {
        rbacModalRoleIndicator.textContent = state.currentUser.role === 'club_lead' ? 'Club Lead' : 'Regular Member';
      }
      if (rbacWarningModal) rbacWarningModal.classList.add('active');
    }

    function closeRbacModal() {
      if (rbacWarningModal) rbacWarningModal.classList.remove('active');
      rbacPendingAction = null;
    }

    // Trigger '+' button click
    if (btnOpenCreateChannel) {
      btnOpenCreateChannel.addEventListener('click', (e) => {
        e.preventDefault();
        // Strict RBAC Verification: ONLY CLUB LEADS CAN CREATE CHANNELS
        if (state.currentUser.role !== 'club_lead') {
          openRbacWarning('channel');
        } else {
          openChannelModal();
        }
      });
    }

    // Channel Modal Close handlers
    if (btnCloseChannelModal) btnCloseChannelModal.addEventListener('click', closeChannelModal);
    if (btnCancelChannelModal) btnCancelChannelModal.addEventListener('click', closeChannelModal);
    if (channelCreateModal) {
      channelCreateModal.addEventListener('click', (e) => {
        if (e.target === channelCreateModal) closeChannelModal();
      });
    }

    // RBAC Modal Close handlers
    if (btnCloseRbacModal) btnCloseRbacModal.addEventListener('click', closeRbacModal);
    if (btnRbacDismiss) btnRbacDismiss.addEventListener('click', closeRbacModal);
    if (rbacWarningModal) {
      rbacWarningModal.addEventListener('click', (e) => {
        if (e.target === rbacWarningModal) closeRbacModal();
      });
    }

    // Switch to Lead action inside RBAC warning
    if (btnRbacSwitchToLead) {
      btnRbacSwitchToLead.addEventListener('click', () => {
        state.currentUser.role = 'club_lead';
        state.currentUser.roleTitle = 'Lead Architect';
        updateRoleUI();
        const actionToResume = rbacPendingAction;
        closeRbacModal();

        if (actionToResume === 'members') {
          const membersNav = document.getElementById('nav-workspace-members');
          channelItems.forEach(ch => ch.classList.remove('active'));
          workspaceItems.forEach(wi => wi.classList.remove('active'));
          if (membersNav) membersNav.classList.add('active');
          switchWorkspaceView('members');
        } else {
          openChannelModal();
        }
      });
    }

    // Channel Visibility Radio selection
    document.querySelectorAll('.channel-type-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.channel-type-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // Handle Channel Creation Submit
    if (formCreateChannel) {
      formCreateChannel.addEventListener('submit', (e) => {
        e.preventDefault();
        // Permission check
        if (state.currentUser.role !== 'club_lead') {
          closeChannelModal();
          openRbacWarning();
          return;
        }

        const rawName = inputChannelName ? inputChannelName.value.trim() : '';
        if (!rawName) return;

        // Clean slug formatting
        const channelSlug = rawName.toLowerCase()
          .replace(/^#+/, '')
          .replace(/[^a-z0-9_-]/g, '-')
          .replace(/-+/g, '-');

        const topic = inputChannelTopic ? inputChannelTopic.value.trim() : '';
        const domainTag = selectChannelDomain ? selectChannelDomain.value : 'General';
        const visibility = formCreateChannel.querySelector('input[name="channel-visibility"]:checked')?.value || 'public';

        let iconHtml = '#';
        if (visibility === 'private') {
          iconHtml = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
        } else if (visibility === 'hardware') {
          iconHtml = '⚙️';
        }

        // Check if already exists
        const existing = document.querySelector(`.channel-item[data-channel="${channelSlug}"]`);
        if (existing) {
          alert(`Channel #${channelSlug} already exists! Switching to it.`);
          closeChannelModal();
          selectChannel(channelSlug, existing);
          return;
        }

        // Create new DOM Channel element
        const newLi = document.createElement('li');
        newLi.className = 'channel-item';
        newLi.dataset.channel = channelSlug;
        newLi.innerHTML = `
          <span class="channel-icon">${iconHtml}</span>
          ${channelSlug}
          <span class="new-channel-badge font-mono">NEW</span>
        `;

        if (channelListContainer) {
          channelListContainer.appendChild(newLi);
        }

        // Close modal and switch to the newly created channel
        closeChannelModal();
        selectChannel(channelSlug, newLi);

        // Inject Welcome Announcement in Chat Feed
        if (chatMessagesContainer) {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const welcomeRow = document.createElement('div');
          welcomeRow.className = 'chat-msg-row';
          welcomeRow.innerHTML = `
            <div class="msg-avatar msg-avatar-user" style="background: linear-gradient(135deg, #00FF66, #00B4D8); color: #000;">RAS</div>
            <div class="msg-body">
              <div class="msg-meta">
                <span class="msg-author">IEEE RAS Lead System</span>
                <span class="badge-pill badge-green" style="padding: 0.1rem 0.4rem; font-size: 0.65rem;">Channel Created</span>
                <span class="msg-time">${timeStr}</span>
              </div>
              <div class="msg-bubble" style="border-left: 3px solid var(--accent-primary); background: var(--accent-subtle);">
                <strong>Channel #${channelSlug} has been created by Lead Architect ${escapeHtml(state.currentUser.name)}!</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.88rem;">${topic ? escapeHtml(topic) : 'Workspace initialized for ' + domainTag + ' subsystem engineering & collaboration.'}</span>
              </div>
            </div>
          `;
          chatMessagesContainer.appendChild(welcomeRow);
          chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
      });
    }

    // Send Message
    function sendMessage() {
      if (!chatInput) return;
      const text = chatInput.value.trim();
      if (!text) return;

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initials = (state.currentUser.name || 'Satyajit R')
        .split(' ')
        .map(n => n[0])
        .filter(Boolean)
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'SR';

      const isLead = state.currentUser.role === 'club_lead';
      const roleBadge = isLead
        ? `<span class="badge-pill badge-green" style="padding: 0.1rem 0.4rem; font-size: 0.65rem;">Lead</span>`
        : `<span class="badge-pill" style="padding: 0.1rem 0.4rem; font-size: 0.65rem; background: rgba(255,255,255,0.1); color: var(--text-secondary);">Member</span>`;

      const msgRow = document.createElement('div');
      msgRow.className = 'chat-msg-row';
      msgRow.innerHTML = `
        <div class="msg-avatar msg-avatar-user">${initials}</div>
        <div class="msg-body">
          <div class="msg-meta">
            <span class="msg-author">${escapeHtml(state.currentUser.name)}</span>
            ${roleBadge}
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

    // Project Showcase Filtering
    const showcaseFilterBtns = document.querySelectorAll('#showcase-filter-row .filter-pill-btn');
    const showcaseCards = document.querySelectorAll('.showcase-project-card');

    showcaseFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        showcaseFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.showcaseFilter || 'all';
        showcaseCards.forEach(card => {
          if (filter === 'all' || card.dataset.showcaseCat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Resource Hub Filtering & Search
    const resourceFilterBtns = document.querySelectorAll('#resource-filter-row .filter-pill-btn');
    const resourceCards = document.querySelectorAll('#resources-cards-grid .resource-card');
    const resourceSearchInput = document.getElementById('resource-search-field');

    let activeResourceFilter = 'all';
    let activeResourceSearch = '';

    function filterResources() {
      resourceCards.forEach(card => {
        const cat = card.dataset.resCat || '';
        const text = card.textContent.toLowerCase();
        const matchesCategory = (activeResourceFilter === 'all' || cat === activeResourceFilter);
        const matchesSearch = (!activeResourceSearch || text.includes(activeResourceSearch));

        if (matchesCategory && matchesSearch) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    resourceFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        resourceFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeResourceFilter = btn.dataset.resFilter || 'all';
        filterResources();
      });
    });

    if (resourceSearchInput) {
      resourceSearchInput.addEventListener('input', (e) => {
        activeResourceSearch = e.target.value.toLowerCase().trim();
        filterResources();
      });
    }

    // Resource Hub Download buttons feedback
    document.querySelectorAll('.btn-download-resource').forEach(btn => {
      btn.addEventListener('click', () => {
        const originalText = btn.textContent;
        btn.textContent = '✓ Downloaded';
        btn.style.background = 'var(--accent-primary)';
        btn.style.color = 'var(--text-inverse)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 2200);
      });
    });

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

    /* ------------------------------------------------------------------------
       CLUB LEAD CORE MEMBER PROVISIONING & ROSTER DIRECTORY MANAGEMENT
       ------------------------------------------------------------------------ */
    function renderMemberRoster() {
      const rosterBody = document.getElementById('member-roster-body');
      const rosterCount = document.getElementById('roster-count');
      if (rosterCount) rosterCount.textContent = coreMembers.length;
      if (!rosterBody) return;

      const roleOptions = [
        'Lead Architect',
        'Subsystem Lead (AI & Vision)',
        'Subsystem Lead (Autonomous Robotics)',
        'Subsystem Lead (Embedded & IoT)',
        'Subsystem Lead (Mechanical CAD)',
        'Core R&D Engineer',
        'Junior Researcher',
        'Executive Officer'
      ];

      rosterBody.innerHTML = coreMembers.map((m) => {
        const initials = m.name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'MB';
        const isSelfOrLead = m.id === 'mem-1' || m.email.toLowerCase() === state.currentUser.email.toLowerCase();
        const optionsHtml = roleOptions.map(r => `
          <option value="${r}" ${m.role === r ? 'selected' : ''}>${r}</option>
        `).join('');

        const statusClass = (m.status || 'Active') === 'Online' || (m.status || 'Active') === 'Active' ? 'badge-green' : 'badge-blue';

        return `
          <tr data-member-id="${m.id}">
            <td>
              <div class="roster-member-cell">
                <div class="roster-avatar font-mono">${initials}</div>
                <div class="roster-info">
                  <div class="roster-name">${escapeHtml(m.name)} ${isSelfOrLead ? '<span class="badge-pill badge-purple" style="font-size: 0.62rem; padding: 0.1rem 0.35rem; margin-left: 4px;">YOU / LEAD</span>' : ''}</div>
                  <div class="roster-email font-mono">${escapeHtml(m.email)} • ID: ${m.id}</div>
                </div>
              </div>
            </td>
            <td>
              <select class="roster-role-select" data-member-id="${m.id}" title="Change assigned role (Lead action)">
                ${optionsHtml}
              </select>
            </td>
            <td>
              <span class="roster-track font-mono">${escapeHtml(m.track || 'Autonomous Systems')}</span>
            </td>
            <td>
              <span class="badge-pill ${statusClass}" style="font-size: 0.7rem;">${escapeHtml(m.status || 'Active')}</span>
            </td>
            <td>
              ${isSelfOrLead ? `
                <span class="font-mono" style="font-size: 0.75rem; color: var(--text-muted);">Protected Lead</span>
              ` : `
                <button type="button" class="roster-revoke-btn" data-revoke-id="${m.id}">
                  Revoke Access
                </button>
              `}
            </td>
          </tr>
        `;
      }).join('');

      // Dynamic Role Reassignment Listeners
      rosterBody.querySelectorAll('.roster-role-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const memId = e.target.dataset.memberId;
          const newRole = e.target.value;
          const targetMem = coreMembers.find(m => m.id === memId);
          if (targetMem) {
            targetMem.role = newRole;
            targetMem.roleType = newRole.toLowerCase().includes('lead') ? 'club_lead' : 'regular_member';
            saveCoreMembers();

            if (state.currentUser.email.toLowerCase() === targetMem.email.toLowerCase()) {
              state.currentUser.role = targetMem.roleType;
              state.currentUser.roleTitle = targetMem.role;
              updateRoleUI();
            }
          }
        });
      });

      // Member Revoke Listeners
      rosterBody.querySelectorAll('.roster-revoke-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const memId = btn.dataset.revokeId;
          const targetMem = coreMembers.find(m => m.id === memId);
          const memName = targetMem ? targetMem.name : 'Member';
          if (confirm(`Are you sure you want to revoke access for ${memName}? They will immediately lose access to the Core Member Portal.`)) {
            coreMembers = coreMembers.filter(m => m.id !== memId);
            saveCoreMembers();
            renderMemberRoster();
          }
        });
      });
    }

    // Provision Member Form Submission (Restricted to Club Leads)
    const formProvisionMember = document.getElementById('form-provision-member');
    const provFullName = document.getElementById('prov-fullname');
    const provEmail = document.getElementById('prov-email');
    const provPassword = document.getElementById('prov-password');
    const provRole = document.getElementById('prov-role');
    const provTrack = document.getElementById('prov-track');
    const provAlertBox = document.getElementById('prov-alert-box');

    if (formProvisionMember) {
      formProvisionMember.addEventListener('submit', (e) => {
        e.preventDefault();

        // RBAC Check
        if (state.currentUser.role !== 'club_lead') {
          openRbacWarning('members');
          return;
        }

        const name = provFullName ? provFullName.value.trim() : '';
        const email = provEmail ? provEmail.value.trim() : '';
        const password = provPassword ? provPassword.value.trim() : '';
        const role = provRole ? provRole.value : 'Core R&D Engineer';
        const track = provTrack ? provTrack.value : 'Autonomous Robotics & ROS2';

        if (!name || !email || !password) return;

        // Check if email already provisioned
        const exists = coreMembers.some(m => m.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          if (provAlertBox) {
            provAlertBox.style.display = 'flex';
            provAlertBox.className = 'register-alert-box error';
            provAlertBox.innerHTML = `⚠️ A core member with email <strong>${escapeHtml(email)}</strong> is already provisioned in the society roster.`;
          }
          return;
        }

        const newId = 'mem-' + (coreMembers.length + 1) + '-' + Math.random().toString(36).substring(2, 6);
        const roleType = role.toLowerCase().includes('lead') ? 'club_lead' : 'regular_member';

        const newMember = {
          id: newId,
          name,
          email,
          password,
          role,
          roleType,
          track,
          status: 'Active'
        };

        coreMembers.push(newMember);
        saveCoreMembers();
        renderMemberRoster();

        // Reset inputs
        formProvisionMember.reset();

        // Success Alert Feedback
        if (provAlertBox) {
          provAlertBox.style.display = 'flex';
          provAlertBox.className = 'register-alert-box success';
          provAlertBox.innerHTML = `✓ Core member <strong>${escapeHtml(name)}</strong> provisioned with role <strong>${escapeHtml(role)}</strong>! Login credentials (Passcode: <code>${escapeHtml(password)}</code>) are immediately active on the Core Member Portal.`;
          setTimeout(() => {
            provAlertBox.style.display = 'none';
          }, 6000);
        }
      });
    }

    // Pre-render Roster Table
    renderMemberRoster();

    // Initialize Video Conferencing Suite
    initVideoMeetingSuite();
  }

  /* ==========================================================================
     ADVANCED VIDEO CONFERENCING SUITE (MS TEAMS / ZOOM / GMEET)
     ========================================================================== */
  function initVideoMeetingSuite() {
    const videoMeetingBtn = document.getElementById('btn-start-video');
    const closeMeetingBtn = document.getElementById('btn-close-meeting');
    const leaveMeetingBtn = document.getElementById('btn-leave-meeting');
    const meetingModal = document.getElementById('meeting-modal');

    // Controls
    const micBtn = document.getElementById('btn-meeting-mic');
    const camBtn = document.getElementById('btn-meeting-cam');
    const shareBtn = document.getElementById('btn-meeting-share');
    const layoutBtn = document.getElementById('btn-meeting-layout');
    const handBtn = document.getElementById('btn-meeting-hand');
    const reactBtn = document.getElementById('btn-meeting-react');
    const chatBtn = document.getElementById('btn-meeting-chat');
    const peopleBtn = document.getElementById('btn-meeting-people');
    const fullscreenBtn = document.getElementById('btn-meeting-fullscreen');
    const copyLinkBtn = document.getElementById('btn-copy-meet-link');
    const closeSidePanelBtn = document.getElementById('btn-close-side-panel');

    // Badges & Containers
    const toast = document.getElementById('meeting-toast');
    const toastMsg = document.getElementById('meeting-toast-msg');
    const toastIcon = document.getElementById('meeting-toast-icon');
    const userHandBadge = document.getElementById('user-hand-badge');
    const selfMicBadge = document.getElementById('self-mic-badge');
    const selfAvatar = document.getElementById('self-video-avatar');
    const videoGrid = document.getElementById('meeting-video-grid');
    const reactionsFlyout = document.getElementById('meeting-reactions-flyout');
    const reactionsBox = document.getElementById('floating-reactions-box');
    const sidePanel = document.getElementById('meeting-side-panel');
    const sidePanelTitle = document.getElementById('side-panel-header-title');
    const tabChat = document.getElementById('tab-in-call-chat');
    const tabPeople = document.getElementById('tab-in-call-people');
    const sideViewChat = document.getElementById('side-view-chat');
    const sideViewPeople = document.getElementById('side-view-people');
    const formInCallChat = document.getElementById('form-in-call-chat');
    const inputInCallChat = document.getElementById('input-in-call-chat');
    const inCallMessagesList = document.getElementById('in-call-messages-list');
    const timerElem = document.getElementById('meeting-live-timer');

    // State
    let meetingTimerInterval = null;
    let callDurationSec = 14 * 60 + 32; // 00:14:32 initial
    let isMicMuted = false;
    let isCamOff = false;
    let isHandRaised = false;
    let isSpotlight = false;
    let toastTimeout = null;

    function showToast(msg, icon = '💡') {
      if (!toast) return;
      if (toastTimeout) clearTimeout(toastTimeout);
      if (toastIcon) toastIcon.textContent = icon;
      if (toastMsg) toastMsg.textContent = msg;
      toast.classList.add('active');
      toastTimeout = setTimeout(() => {
        toast.classList.remove('active');
      }, 2600);
    }

    function updateTimerDisplay() {
      if (!timerElem) return;
      const hours = Math.floor(callDurationSec / 3600);
      const mins = Math.floor((callDurationSec % 3600) / 60);
      const secs = callDurationSec % 60;
      timerElem.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function openMeeting() {
      if (!meetingModal) return;
      meetingModal.classList.add('active');
      state.isMeetingActive = true;
      if (!meetingTimerInterval) {
        meetingTimerInterval = setInterval(() => {
          callDurationSec++;
          updateTimerDisplay();
        }, 1000);
      }
      showToast('Joined Hardware Standup Video Room', '🎙️');
    }

    function closeMeeting() {
      if (!meetingModal) return;
      meetingModal.classList.remove('active');
      state.isMeetingActive = false;
      if (meetingTimerInterval) {
        clearInterval(meetingTimerInterval);
        meetingTimerInterval = null;
      }
      if (reactionsFlyout) reactionsFlyout.classList.remove('active');
    }

    if (videoMeetingBtn) videoMeetingBtn.addEventListener('click', openMeeting);
    if (closeMeetingBtn) closeMeetingBtn.addEventListener('click', closeMeeting);
    if (leaveMeetingBtn) leaveMeetingBtn.addEventListener('click', closeMeeting);

    // Mic Toggle
    function toggleMic() {
      isMicMuted = !isMicMuted;
      if (micBtn) {
        micBtn.classList.toggle('muted', isMicMuted);
        micBtn.title = isMicMuted ? 'Unmute Microphone (Ctrl+D)' : 'Mute Microphone (Ctrl+D)';
        micBtn.innerHTML = isMicMuted
          ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
      }
      if (selfMicBadge) {
        if (isMicMuted) {
          selfMicBadge.textContent = 'Muted';
          selfMicBadge.className = 'badge-pill';
          selfMicBadge.style.background = 'rgba(255, 51, 102, 0.2)';
          selfMicBadge.style.color = '#ff3366';
          selfMicBadge.style.borderColor = '#ff3366';
        } else {
          selfMicBadge.textContent = 'Mic Active';
          selfMicBadge.className = 'badge-pill badge-blue';
          selfMicBadge.style.background = '';
          selfMicBadge.style.color = '';
          selfMicBadge.style.borderColor = '';
        }
      }
      showToast(isMicMuted ? 'Microphone muted' : 'Microphone unmuted', isMicMuted ? '🔇' : '🎙️');
    }

    if (micBtn) micBtn.addEventListener('click', toggleMic);

    // Camera Toggle
    function toggleCam() {
      isCamOff = !isCamOff;
      if (camBtn) {
        camBtn.classList.toggle('muted', isCamOff);
        camBtn.title = isCamOff ? 'Turn On Camera (Ctrl+E)' : 'Turn Off Camera (Ctrl+E)';
        camBtn.innerHTML = isCamOff
          ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21l-3.34-3.34M23 7l-7 5 1.5 1.07"></path><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"></path></svg>`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`;
      }
      if (selfAvatar) {
        selfAvatar.style.filter = isCamOff ? 'grayscale(1) opacity(0.5)' : 'none';
        selfAvatar.textContent = isCamOff ? '📷 OFF' : 'SR';
        selfAvatar.style.fontSize = isCamOff ? '0.85rem' : '1.4rem';
      }
      showToast(isCamOff ? 'Camera turned off' : 'Camera turned on', isCamOff ? '📷' : '📹');
    }

    if (camBtn) camBtn.addEventListener('click', toggleCam);

    // Screen Share / Spotlight Layout Toggle
    function toggleSpotlight() {
      isSpotlight = !isSpotlight;
      if (videoGrid) {
        if (isSpotlight) {
          videoGrid.className = 'meeting-grid-spotlight';
          // Move tile-screen-share to spotlight 1st position
          const shareTile = document.getElementById('tile-screen-share');
          if (shareTile) videoGrid.prepend(shareTile);
        } else {
          videoGrid.className = 'meeting-grid-4';
          // Restore default order
          const selfTile = document.getElementById('tile-self');
          if (selfTile) videoGrid.prepend(selfTile);
        }
      }
      if (shareBtn) shareBtn.classList.toggle('active', isSpotlight);
      if (layoutBtn) layoutBtn.classList.toggle('active', isSpotlight);
      showToast(isSpotlight ? 'Spotlight: RViz2 ROS2 Stream' : 'Switched to 2x2 Grid View', '🖥️');
    }

    if (shareBtn) shareBtn.addEventListener('click', toggleSpotlight);
    if (layoutBtn) layoutBtn.addEventListener('click', toggleSpotlight);

    // Hand Raise Toggle
    function toggleHandRaise() {
      isHandRaised = !isHandRaised;
      if (handBtn) handBtn.classList.toggle('active', isHandRaised);
      if (userHandBadge) userHandBadge.classList.toggle('active', isHandRaised);
      showToast(isHandRaised ? 'Satyajit R raised their hand' : 'Hand lowered', '✋');
    }

    if (handBtn) handBtn.addEventListener('click', toggleHandRaise);

    // Emoji Reactions Flyout & Spawn Floating Reactions
    function spawnFloatingEmoji(emoji) {
      if (!reactionsBox) return;
      const emojiElem = document.createElement('div');
      emojiElem.className = 'floating-emoji';
      emojiElem.textContent = emoji;

      // Random horizontal position from 20% to 75%
      const leftPercent = Math.floor(Math.random() * 55) + 20;
      emojiElem.style.left = `${leftPercent}%`;
      emojiElem.style.bottom = '80px';

      reactionsBox.appendChild(emojiElem);
      setTimeout(() => {
        if (emojiElem.parentNode) {
          emojiElem.parentNode.removeChild(emojiElem);
        }
      }, 2300);
    }

    if (reactBtn && reactionsFlyout) {
      reactBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        reactionsFlyout.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (reactionsFlyout.classList.contains('active') && !reactionsFlyout.contains(e.target) && e.target !== reactBtn) {
          reactionsFlyout.classList.remove('active');
        }
      });

      document.querySelectorAll('.reaction-choice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const emoji = btn.dataset.emoji || '👏';
          spawnFloatingEmoji(emoji);
          reactionsFlyout.classList.remove('active');
          showToast(`Reacted with ${emoji}`, emoji);
        });
      });
    }

    // Side Panel: Tabs & Toggles (Chat & People)
    function openSidePanel(tabName) {
      if (!sidePanel) return;
      sidePanel.classList.add('active');

      if (tabName === 'chat') {
        if (sidePanelTitle) sidePanelTitle.textContent = 'In-Call Chat';
        if (tabChat) tabChat.classList.add('active');
        if (tabPeople) tabPeople.classList.remove('active');
        if (sideViewChat) sideViewChat.style.display = 'flex';
        if (sideViewPeople) sideViewPeople.style.display = 'none';
        if (chatBtn) chatBtn.classList.add('active');
        if (peopleBtn) peopleBtn.classList.remove('active');
      } else {
        if (sidePanelTitle) sidePanelTitle.textContent = 'Call Participants (4)';
        if (tabPeople) tabPeople.classList.add('active');
        if (tabChat) tabChat.classList.remove('active');
        if (sideViewPeople) sideViewPeople.style.display = 'block';
        if (sideViewChat) sideViewChat.style.display = 'none';
        if (peopleBtn) peopleBtn.classList.add('active');
        if (chatBtn) chatBtn.classList.remove('active');
      }
    }

    function closeSidePanel() {
      if (sidePanel) sidePanel.classList.remove('active');
      if (chatBtn) chatBtn.classList.remove('active');
      if (peopleBtn) peopleBtn.classList.remove('active');
    }

    if (chatBtn) {
      chatBtn.addEventListener('click', () => {
        if (sidePanel && sidePanel.classList.contains('active') && tabChat && tabChat.classList.contains('active')) {
          closeSidePanel();
        } else {
          openSidePanel('chat');
        }
      });
    }

    if (peopleBtn) {
      peopleBtn.addEventListener('click', () => {
        if (sidePanel && sidePanel.classList.contains('active') && tabPeople && tabPeople.classList.contains('active')) {
          closeSidePanel();
        } else {
          openSidePanel('people');
        }
      });
    }

    if (closeSidePanelBtn) closeSidePanelBtn.addEventListener('click', closeSidePanel);
    if (tabChat) tabChat.addEventListener('click', () => openSidePanel('chat'));
    if (tabPeople) tabPeople.addEventListener('click', () => openSidePanel('people'));

    // In-Call Chat Post Message
    if (formInCallChat) {
      formInCallChat.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!inputInCallChat) return;
        const msgText = inputInCallChat.value.trim();
        if (!msgText) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgElem = document.createElement('div');
        msgElem.className = 'in-call-msg';
        msgElem.innerHTML = `
          <span class="in-call-msg-author">Satyajit R (You) • ${timeStr}</span>
          <span>${escapeHtml(msgText)}</span>
        `;

        if (inCallMessagesList) {
          inCallMessagesList.appendChild(msgElem);
          inCallMessagesList.scrollTop = inCallMessagesList.scrollHeight;
        }

        inputInCallChat.value = '';
      });
    }

    // Copy Meeting Info Link
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('https://meet.ieee-ras.org/ras-meet-x928-qzp').then(() => {
          showToast('Meeting invite link copied to clipboard!', '🔗');
        });
      });
    }

    // Fullscreen Toggle
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        const windowElem = document.querySelector('.meeting-app-window');
        if (!document.fullscreenElement) {
          if (windowElem && windowElem.requestFullscreen) {
            windowElem.requestFullscreen().catch(() => {});
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      });
    }

    // Keyboard Shortcuts (Ctrl+D = Mic, Ctrl+E = Camera)
    window.addEventListener('keydown', (e) => {
      if (!meetingModal || !meetingModal.classList.contains('active')) return;
      if (document.activeElement === inputInCallChat) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleMic();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        toggleCam();
      }
    });
  }

  /* ==========================================================================
     PARTICIPANT PORTAL (SCREEN 4) INTERACTION & MULTI-STAGE ENGINE
     ========================================================================== */
  function initParticipantPortal() {
    // 4 Flagship Events in 4 Distinct Stages
    const eventsData = {
      'aeroswarm': {
        id: 'aeroswarm',
        title: 'AeroSwarm 2026: Autonomous Drone Swarm Challenge',
        category: 'Aerial Robotics & Swarm Mesh',
        teamDesc: 'Team AeroValkyrie • Track: Decentralized Swarm Mesh (ESP-NOW) • Venue: Outdoor Drone Cage',
        stage: 'registration',
        stageName: 'Stage 1: Team Registration Open',
        stageBadge: 'STAGE 1: REGISTRATION OPEN',
        badgeClass: 'badge-green',
        timerLabel: 'REGISTRATION CLOSES IN',
        countdownSeconds: 3 * 86400 + 14 * 3600 + 22 * 60 + 10,
        progressPercent: 20,
        nodeActiveIndex: 1,
        prizePool: '₹1,00,000 Cash Prize Pool'
      },
      'robodesign': {
        id: 'robodesign',
        title: 'RoboDesign Sprint: Mars Rover Manipulator & Bionics',
        category: '3D CAD, Kinematics & FEA Simulation',
        teamDesc: 'Team Apex Robotics • Track: 5-DOF Soil Coring Manipulator • Mode: Virtual Evaluation',
        stage: 'ppt',
        stageName: 'Stage 2: PPT Submission Active',
        stageBadge: 'STAGE 2: PPT SUBMISSION ACTIVE',
        badgeClass: 'badge-blue',
        timerLabel: 'ABSTRACT & PPT DEADLINE IN',
        countdownSeconds: 1 * 86400 + 8 * 3600 + 35 * 60 + 18,
        progressPercent: 48,
        nodeActiveIndex: 2,
        prizePool: '₹75,000 + Manufacturing Grants'
      },
      'robohack': {
        id: 'robohack',
        title: 'RoboHack 2026: Autonomous Robotics & AI Challenge',
        category: 'AMR, ROS2 & LiDAR SLAM',
        teamDesc: 'Team Alpha • Track: Autonomous Mobile Robots (AMR) • Venue: Tech Quad & Computing Labs',
        stage: 'hackathon',
        stageName: 'Stage 3: Live 36-Hour Hackathon',
        stageBadge: 'STAGE 3: LIVE NATIONAL HACKATHON',
        badgeClass: 'badge-green',
        timerLabel: 'HACKATHON CODE FREEZE TIMER',
        countdownSeconds: 12 * 3600 + 45 * 60 + 30,
        progressPercent: 75,
        nodeActiveIndex: 3,
        prizePool: '₹1,50,000 Cash Prize Pool'
      },
      'battlebots': {
        id: 'battlebots',
        title: 'BattleBots Arena: National Combat Robotics Championship',
        category: '15kg & 30kg Heavyweight Combat Bots',
        teamDesc: 'Team Quantum Crush • Track: 15kg Spin Flywheel • Result: National 1st Runner Up (Score: 96.2/100)',
        stage: 'results',
        stageName: 'Stage 4: Results & Accreditations',
        stageBadge: 'STAGE 4: RESULTS PUBLISHED',
        badgeClass: 'badge-purple',
        timerLabel: 'STATUS: CONCLUDED & ARCHIVED',
        countdownSeconds: 0,
        progressPercent: 100,
        nodeActiveIndex: 4,
        prizePool: '₹2,00,000 Prize Pool Awarded'
      }
    };

    let activeEventId = 'robohack';

    // Elements
    const eventCards = document.querySelectorAll('.event-tab-card[data-event-id]');
    const heroTitle = document.getElementById('hero-event-title');
    const heroDesc = document.getElementById('hero-event-desc');
    const heroBadge = document.getElementById('hero-event-badge');
    const heroPrize = document.getElementById('hero-prize-pool');
    const heroTimerLabel = document.getElementById('hero-countdown-label');
    const heroTimerDigits = document.getElementById('event-countdown-timer');
    const timelineSummary = document.getElementById('timeline-stage-summary');
    const timelineProgressBar = document.getElementById('timeline-progress-bar');

    // Stage Panels
    const panels = {
      registration: document.getElementById('stage-panel-registration'),
      ppt: document.getElementById('stage-panel-ppt'),
      hackathon: document.getElementById('stage-panel-hackathon'),
      results: document.getElementById('stage-panel-results')
    };

    // Helper: format duration
    function formatTime(totalSec, showDays = false) {
      if (totalSec <= 0) return '00:00:00';
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      if (showDays || days > 0) {
        return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
      }
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Switch active event & stage
    function switchEvent(eventId) {
      const ev = eventsData[eventId];
      if (!ev) return;
      activeEventId = eventId;

      // Update event selector cards
      eventCards.forEach(c => c.classList.toggle('active', c.dataset.eventId === eventId));

      // Update hero banner
      if (heroTitle) heroTitle.textContent = ev.title;
      if (heroDesc) heroDesc.textContent = ev.teamDesc;
      if (heroBadge) {
        heroBadge.textContent = ev.stageBadge;
        heroBadge.className = `badge-pill ${ev.badgeClass}`;
      }
      if (heroPrize) heroPrize.textContent = ev.prizePool;
      if (heroTimerLabel) heroTimerLabel.textContent = ev.timerLabel;

      if (heroTimerDigits) {
        heroTimerDigits.textContent = ev.countdownSeconds > 0 
          ? formatTime(ev.countdownSeconds, ev.countdownSeconds > 86400) 
          : '00:00:00 (Concluded)';
      }

      // Update timeline tracker
      if (timelineSummary) timelineSummary.textContent = `${ev.stageName}`;
      if (timelineProgressBar) timelineProgressBar.style.width = `${ev.progressPercent}%`;

      // Update timeline nodes
      for (let i = 1; i <= 4; i++) {
        const node = document.getElementById(`node-step-${i}`);
        if (!node) continue;
        node.className = 'milestone-node';

        if (i < ev.nodeActiveIndex) {
          node.classList.add('completed');
        } else if (i === ev.nodeActiveIndex) {
          if (ev.nodeActiveIndex === 4 && ev.countdownSeconds === 0) {
            node.classList.add('completed');
          } else {
            node.classList.add('active');
          }
        }
      }

      // Switch stage option panels
      Object.entries(panels).forEach(([stageKey, panelElem]) => {
        if (panelElem) {
          panelElem.classList.toggle('active', stageKey === ev.stage);
        }
      });
    }

    // Attach click listeners to event tab cards
    eventCards.forEach(card => {
      card.addEventListener('click', () => {
        const eventId = card.dataset.eventId;
        switchEvent(eventId);
      });
    });

    // Multi-Event Countdown Timer Interval (runs simultaneously for all events)
    setInterval(() => {
      Object.keys(eventsData).forEach(key => {
        const item = eventsData[key];
        if (item.countdownSeconds > 0) {
          item.countdownSeconds--;
        }

        // Update tab card timer display
        const tabTimerElem = document.getElementById(`timer-tab-${key}`);
        if (tabTimerElem) {
          if (item.countdownSeconds > 0) {
            tabTimerElem.textContent = formatTime(item.countdownSeconds, item.countdownSeconds > 86400);
          } else {
            tabTimerElem.textContent = 'Concluded ✓';
          }
        }

        // Update hero timer if currently active
        if (key === activeEventId && heroTimerDigits) {
          heroTimerDigits.textContent = item.countdownSeconds > 0 
            ? formatTime(item.countdownSeconds, item.countdownSeconds > 86400) 
            : '00:00:00 (Concluded)';
        }
      });
    }, 1000);

    /* --- Stage 1 Options: Registration Interactions --- */
    const formReg = document.getElementById('form-team-registration');
    const copyInviteBtn = document.getElementById('btn-copy-invite');
    const trackBtns = document.querySelectorAll('.reg-track-btn');

    trackBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        trackBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    if (copyInviteBtn) {
      copyInviteBtn.addEventListener('click', () => {
        const code = document.getElementById('reg-invite-code')?.textContent || 'AERO-9281-VIT';
        navigator.clipboard.writeText(code).then(() => {
          copyInviteBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyInviteBtn.textContent = 'Copy Code'; }, 2000);
        });
      });
    }

    if (formReg) {
      formReg.addEventListener('submit', (e) => {
        e.preventDefault();
        const teamName = document.getElementById('reg-team-name')?.value || 'Team AeroValkyrie';
        alert(`✓ Registration Confirmed for "${teamName}"!\nOfficial IEEE RAS Verification & Hardware Dev-Kit dispatch confirmation sent to your team.`);
      });
    }

    /* --- Stage 2 Options: PPT & Abstract Interactions --- */
    const pptDropzone = document.getElementById('ppt-dropzone');
    const pptFileInput = document.getElementById('ppt-file-input');
    const pptProgressBar = document.getElementById('ppt-progress-bar');
    const pptProgressPercent = document.getElementById('ppt-progress-percent');
    const pptFileName = document.getElementById('ppt-file-name');
    const submitPptBtn = document.getElementById('btn-submit-ppt');

    if (pptDropzone && pptFileInput) {
      pptDropzone.addEventListener('click', () => pptFileInput.click());
      pptDropzone.addEventListener('dragover', (e) => { e.preventDefault(); pptDropzone.classList.add('drag-over'); });
      pptDropzone.addEventListener('dragleave', () => { pptDropzone.classList.remove('drag-over'); });
      pptDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        pptDropzone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) simulatePptUpload(e.dataTransfer.files[0].name);
      });
      pptFileInput.addEventListener('change', () => {
        if (pptFileInput.files.length > 0) simulatePptUpload(pptFileInput.files[0].name);
      });
    }

    function simulatePptUpload(name) {
      if (pptFileName) pptFileName.textContent = name;
      let p = 0;
      if (pptProgressBar) pptProgressBar.style.width = '0%';
      const timer = setInterval(() => {
        p += 15;
        if (p >= 100) {
          p = 100;
          clearInterval(timer);
          if (pptProgressPercent) pptProgressPercent.textContent = '100% (Uploaded & Validated ✓)';
        } else {
          if (pptProgressPercent) pptProgressPercent.textContent = `${p}%`;
        }
        if (pptProgressBar) pptProgressBar.style.width = `${p}%`;
      }, 100);
    }

    if (submitPptBtn) {
      submitPptBtn.addEventListener('click', () => {
        alert('✓ Pitch Deck & Kinematic Abstract successfully locked!\nSubmission ID: IEEE-RAS-RD26-8819\nYour submission is now queued for Round 1 FEA & Simulation evaluation.');
      });
    }

    /* --- Stage 3 Options: Live Hackathon Interactions --- */
    const dropzone = document.getElementById('submission-dropzone');
    const fileInput = document.getElementById('submission-file-input');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadProgressPercent = document.getElementById('upload-progress-percent');
    const uploadFileName = document.getElementById('upload-file-name');
    const verifyRepoBtn = document.getElementById('btn-verify-repo');
    const submitHackathonBtn = document.getElementById('btn-submit-hackathon');
    const requestMentorBtn = document.getElementById('btn-request-mentor');

    if (verifyRepoBtn) {
      verifyRepoBtn.addEventListener('click', () => {
        const feedback = document.getElementById('repo-verify-feedback');
        if (feedback) {
          feedback.innerHTML = '<span style="color: var(--accent-primary);">⚡ Verifying GitHub webhook & main branch commit hashes...</span>';
          setTimeout(() => {
            feedback.innerHTML = '✓ Repository connected • Branch: main • Commit: a82f91b (Verified by CI runner ✓)';
          }, 600);
        }
      });
    }

    if (requestMentorBtn) {
      requestMentorBtn.addEventListener('click', () => {
        const domainSelect = document.getElementById('mentor-domain-select');
        const domain = domainSelect ? domainSelect.options[domainSelect.selectedIndex].text : 'Technical Mentor';
        alert(`⚡ Mentor Request Dispatched!\nTopic: ${domain}\nLead Mentor Ananya Sharma has been notified and assigned to your lab workstation.`);
      });
    }

    if (submitHackathonBtn) {
      submitHackathonBtn.addEventListener('click', () => {
        alert('🚀 Final Hackathon Solution Submitted!\nTeam Alpha repository link and demo video verified.\nYour team is scheduled for Jury Evaluation at 17:00 in Lab 3.');
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
      dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('drag-over'); });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) startUploadSimulation(e.dataTransfer.files[0].name);
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) startUploadSimulation(fileInput.files[0].name);
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

    /* --- Stage 4 & General: Certificate Modal Preview --- */
    const viewCertButtons = document.querySelectorAll('.btn-view-cert');
    const closeCertBtn = document.getElementById('cert-modal-close');

    viewCertButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const certName = btn.dataset.certName || 'BattleBots 2025 Finalist';
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

    // Set initial view to RoboHack
    switchEvent('robohack');
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
    initAuthGateway();
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
