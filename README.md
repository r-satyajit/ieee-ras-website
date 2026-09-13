# IEEE Robotics & Automation Society (RAS) — VIT Chennai

> Official web platform for the **IEEE Robotics and Automation Society (RAS) Student Branch Chapter** at **Vellore Institute of Technology (VIT), Chennai**.

[![IEEE RAS](https://img.shields.io/badge/IEEE-Robotics%20%26%20Automation%20Society-0077B5?style=flat-square&logo=ieee&logoColor=white)](https://www.ieee-ras.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00B4D8?style=flat-square)](LICENSE)
[![Frontend](https://img.shields.io/badge/Stack-Vanilla%20HTML5%20%7C%20CSS3%20%7C%20ES6+-7B2CBF?style=flat-square)](#technology-stack)
[![Status](https://img.shields.io/badge/Build-Production--Ready-00F5D4?style=flat-square)](#deployment)

---

## 🌟 Overview

The **IEEE RAS VIT Chennai Web Platform** is an enterprise-grade, high-performance single-page web application engineered to represent the chapter's cutting-edge robotics research, foster technical collaboration, and power internal operations. 

It provides seamless access across three primary user tiers:
1. **Public & Research Showcase Visitors**: Interactive project telemetry, subsystem demonstrations, and chapter achievements.
2. **Core Society Members & Club Leads**: Private channels, robotics code repositories, member directory with academic credentials, live video conferencing, and subsystem management.
3. **Event Participants & Hackathon Teams**: Project submissions, team milestone tracking, certificate verification, and real-time announcements.

---

## 🚀 Key Modules & Capabilities

### 1. Interactive Project Telemetry & Research Hub
- **Autonomous Planetary Rover**: Live LiDAR point cloud SLAM visualization, ROS2 Nav2 node status, and `/cmd_vel` velocity injection.
- **4-DOF Robotic Arm Manipulator**: Interactive forward kinematics simulator with real-time sliders ($\theta_1, \theta_2, \theta_3$), end-effector coordinates $(X, Y, Z)$, and Jacobian determinant ($\det J$) calculation.
- **AeroMesh-4 Aerial Swarm**: Decentralized UWB rangefinder matrix, flight telemetry logs, PX4 autopilot status, and EKF state estimation.
- **AUV DeepVoyager**: 48V BMS cell monitoring, CAN-FD thruster telemetry, hydrodynamics analysis, and STM32 C++ bare-metal firmware inspection.
- **SolidWorks CAD Viewers**: Interactive wireframe and dimensional inspections for planetary suspension and carbon-fiber airframes.

### 2. Full-Featured Live Video Conferencing Suite
- **Dynamic Meeting Creator**: Create ad-hoc or scheduled video meetings with customizable room topics, invite lists, recording options, and access controls.
- **Host & Lead Admin Privileges**: The meeting initiator is automatically granted Host Admin rights. Club Leads hold universal administrative privileges across all chapter conferences (lock room, mute all, kick attendee, end call).
- **Conference Controls**: Mic mute/unmute with live audio equalizers, camera toggle with camera-off avatar states, screen sharing simulation, chat sidebar, and floating emoji reactions.
- **Live Meeting Sidebar Sync**: Live conferences dynamically reflect in the workspace sidebar. Ended meetings are automatically removed.

### 3. Chapter Member Directory & Strict RBAC
- **Regular Member View (Read-Only)**: Clean directory displaying all 8 core member attributes without administrative clutter:
  - Full Name (with `[YOU]` badge for self)
  - Profile Photo (or dynamic styled initials avatar)
  - LinkedIn Profile (verified badge and external link)
  - Year of Study (e.g. `3rd Year`, `2nd Year`)
  - Academic Branch (e.g. `B.Tech CSE (Robotics & AI)`, `B.Tech Mechanical Engineering`)
  - GitHub Profile (`@handle` link)
  - Assigned Subsystem Role (e.g. `Lead Architect`, `Core R&D Engineer`)
  - Member Biography & Research Focus
- **Club Lead Version (Untouched & Invariant)**: Full administrative view with live role reassignment dropdowns, revoke triggers with protection for leads, and core member provisioning.
- **Member Public Profile Inspector**: Glassmorphic modal displaying verified credentials, contact email with copy action, academic department, biography, and recent GitHub commits.

### 4. Communication Hub & AI Assistant
- **Specialized Research Channels**: `# general`, `# ai-ml-projects`, `# hardware-troubleshooting`, and `# core-leads`.
- **AI Assistant**: Synthesizes channel decisions, computes kinematics singularities, and recommends robotics hardware components.
- **Engineering Resource Hub**: Downloadable internal playbooks, ROS2 cheat sheets, STM32 pinout references, and chapter publications.
- **Recent Commits Panel**: Live feed of society GitHub commits. Members can connect their GitHub handle and push commits directly from their profile.

### 5. Event Participant & Hackathon Portal
- **Hackathon Workspace**: Project repository submission, tech stack tags, and deliverables manager.
- **Milestone Tracker**: Real-time progress bars for design reviews, simulation checkpoints, and final pitch sessions.
- **Digital Certificate Verification**: Instant SHA-256 certificate validation and verification badge.

### 6. User Profile Settings & Security Suite
- **Profile Customization**: Update name, year of study, branch, bio, track, GitHub username, and LinkedIn profile.
- **Avatar Management**: Upload custom profile photo (PNG, JPG, WebP) with instant visual preview and one-click removal with confirmation.
- **Security & Password Update**: Multi-factor password change with mandatory current password verification.
- **Sensitive Action Safeguards**: Clean modal warnings prior to destructive actions (account resignation, lead successor appointment, participant deletion).

---

## 🛠️ Technology Stack & Architecture

- **Runtime Dependencies**: `None` (Zero external framework overhead, lightning-fast first-contentful paint).
- **Markup**: Semantic HTML5 with complete ARIA accessibility standards.
- **Styling**: Vanilla CSS3 utilizing CSS Custom Properties (Design Tokens), Flexbox, CSS Grid, and custom chamfered glassmorphic cards (`clip-path`).
- **Typography**: Curated Google Fonts (`Space Grotesk`, `Inter`, `Roboto Mono`).
- **Icons**: Custom optimized inline SVGs (no heavy external icon fonts).
- **Client Logic**: Modular Object-Oriented ES6+ JavaScript.
- **State Management**: Reactive in-memory state engine backed by `localStorage` persistence.
- **Theming**: Cybernetic Dark (Default) & Clean Research Light with zero-flash persistence.

---

## 💻 Local Development Setup

No build step, compilers, or bundlers required. Run immediately with any static file server:

### Option 1: Python (Built-in)
```bash
cd ieee-ras-website
python -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 2: Node.js / npx
```bash
cd ieee-ras-website
npx serve .
```

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 🌐 Production Deployment

This project is fully static and ready for instant deployment on any modern cloud hosting provider.

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run deployment inside the project folder:
   ```bash
   cd ieee-ras-website
   vercel
   ```
3. Follow the on-screen prompts (accept default settings for static site).

### Deploy to Netlify
1. Drag and drop the `ieee-ras-website` folder onto the [Netlify Drop](https://app.netlify.com/drop) console.
2. Or use Netlify CLI:
   ```bash
   cd ieee-ras-website
   npx netlify-cli deploy --prod --dir=.
   ```

### Deploy to GitHub Pages
1. Push this repository to GitHub.
2. In your repository settings, navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` and root folder `/` (or `/ieee-ras-website` depending on your repository structure).
4. Click **Save**. Your site will be live within seconds.

### Deploy to Cloudflare Pages
1. Log in to the Cloudflare Dashboard and select **Workers & Pages** > **Create application** > **Pages**.
2. Connect your Git repository, set the build output directory to `ieee-ras-website` (leave build command blank).
3. Click **Save and Deploy**.

---

## 🔒 Security & Access Control (RBAC)

| User Role | Credentials / Onboarding | Access Permissions |
| :--- | :--- | :--- |
| **Public Visitor** | None required | Public landing page, project telemetry demos, certificate verification, and event registration. |
| **Club Lead** | Provisioned VIT email (`lead123`) | Full access to internal channels, conference host controls, universal meeting admin rights, core member provisioning, and role reassignment. |
| **Regular Member** | Provisioned VIT email (`member123`) | Channel access, video meetings (host admin in created calls), read-only Member Directory with academic credentials, code pushes, and profile settings. |
| **Event Participant** | Registered via portal or Google OAuth | Hackathon workspace, project submission, milestone tracker, and certificate generation. |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

**IEEE Robotics and Automation Society (RAS)**  
Vellore Institute of Technology (VIT), Chennai  
*Advancing Innovation in Robotics, Autonomous Systems, and Artificial Intelligence.*
