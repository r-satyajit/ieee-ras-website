/**
 * IEEE RAS Website - Build-Time Configuration Generator
 * Reads process.env (Vercel, Netlify, CI/CD) and creates scripts/config.js at build time
 */
const fs = require('fs');
const path = require('path');

const env = {
  DEFAULT_LEAD_PASSWORD: process.env.DEFAULT_LEAD_PASSWORD || 'lead123',
  DEFAULT_MEMBER_PASSWORD: process.env.DEFAULT_MEMBER_PASSWORD || 'member123',
  DEFAULT_PARTICIPANT_PASSWORD: process.env.DEFAULT_PARTICIPANT_PASSWORD || 'participant123',
  LEAD_NAME: process.env.LEAD_NAME || 'XYZ',
  LEAD_EMAIL: process.env.LEAD_EMAIL || 'xyz@vitstudent.ac.in',
  LEAD_GITHUB_USER: process.env.LEAD_GITHUB_USER || 'xyz',
  LEAD_GITHUB_URL: process.env.LEAD_GITHUB_URL || 'https://github.com/xyz',
  LEAD_LINKEDIN_URL: process.env.LEAD_LINKEDIN_URL || 'https://linkedin.com/in/xyz',
  GITHUB_REPO_URL: process.env.GITHUB_REPO_URL || 'https://github.com/xyz/ieee-ras-website',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  WEBRTC_SIGNALING_URL: process.env.WEBRTC_SIGNALING_URL || 'https://meet.ieee-ras.org'
};

const targetPath = path.join(__dirname, 'config.js');
const content = `/**
 * Runtime Environment Configuration
 * Generated dynamically at build time from platform environment variables.
 */
window.__ENV__ = ${JSON.stringify(env, null, 2)};
`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log('✅ [Build] Successfully generated scripts/config.js from environment variables.');
