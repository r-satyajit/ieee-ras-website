/**
 * IEEE RAS Website - Runtime Environment Configuration Template
 * 
 * Instructions:
 * 1. Copy this file to `scripts/config.js`
 * 2. Set your custom passwords, API keys, and repository links below.
 * 3. `scripts/config.js` is included in .gitignore and will NOT be uploaded to GitHub.
 */

window.__ENV__ = {
  // Authentication Passcodes
  DEFAULT_LEAD_PASSWORD: "your_secure_lead_password",
  DEFAULT_MEMBER_PASSWORD: "your_secure_member_password",
  DEFAULT_PARTICIPANT_PASSWORD: "your_secure_participant_password",

  // Leadership & Chapter Information
  LEAD_NAME: "Chapter Lead",
  LEAD_EMAIL: "lead@vitstudent.ac.in",
  LEAD_GITHUB_USER: "ieee-ras-lead",
  LEAD_GITHUB_URL: "https://github.com/ieee-ras-vit",
  LEAD_LINKEDIN_URL: "https://linkedin.com/company/ieee-ras-vit",
  GITHUB_REPO_URL: "https://github.com/ieee-ras-vit/ieee-ras-website",

  // Optional External Integrations
  GEMINI_API_KEY: "",
  WEBRTC_SIGNALING_URL: "https://meet.ieee-ras.org"
};
