
/* =========================================================
   MR. SHEYHAKI — GLOBAL THEME
   Light is the default. Dark mode is user-controlled and
   persisted across every page and game.
========================================================= */
:root{
  --site-bg:#ffffff;
  --site-surface:#ffffff;
  --site-surface-2:#f7f8fb;
  --site-text:#202636;
  --site-muted:#687184;
  --site-border:#e7e9ef;
  --site-shadow:rgba(32,38,54,.08);
}
html[data-theme="dark"]{
  color-scheme:dark;
  --site-bg:#0f1117;
  --site-surface:#181b24;
  --site-surface-2:#11141b;
  --site-text:#f4f6fb;
  --site-muted:#aeb6c8;
  --site-border:#2b3040;
  --site-shadow:rgba(0,0,0,.28);
}
body{background:var(--site-bg)!important;color:var(--site-text)!important;transition:background-color .25s ease,color .25s ease}
.theme-toggle{
  display:inline-flex!important;align-items:center;justify-content:center;gap:7px;
  min-height:38px;padding:0 12px;border:1px solid var(--site-border);
  border-radius:10px;background:var(--site-surface);color:var(--site-text);
  font:700 11px/1 Inter,ui-sans-serif,system-ui,sans-serif;cursor:pointer;
  transition:transform .15s ease,background .2s ease,border-color .2s ease;
  white-space:nowrap;
}
.theme-toggle:hover{transform:translateY(-1px);border-color:#6937d8}
.theme-toggle:active{transform:translateY(1px)}
html[data-theme="dark"] .site-header,
html[data-theme="dark"] .arcade-header{
  background:rgba(15,17,23,.94)!important;border-color:var(--site-border)!important;
}
html[data-theme="dark"] .brand,
html[data-theme="dark"] .brand-text strong,
html[data-theme="dark"] .main-nav a.active{color:var(--site-text)!important}
html[data-theme="dark"] .brand-text small,
html[data-theme="dark"] .main-nav a{color:var(--site-muted)!important}
html[data-theme="dark"] .main-nav a:hover{color:#9a7cf0!important}
html[data-theme="dark"] .hero,
html[data-theme="dark"] .game-card,
html[data-theme="dark"] .skill-card,
html[data-theme="dark"] .site-footer{background:var(--site-surface)!important;color:var(--site-text)!important;border-color:var(--site-border)!important}
html[data-theme="dark"] .hero-description,
html[data-theme="dark"] .skill-card p,
html[data-theme="dark"] .game-card p,
html[data-theme="dark"] .section-heading p,
html[data-theme="dark"] .arcade-intro p{color:var(--site-muted)!important}
html[data-theme="dark"] .quick-card,
html[data-theme="dark"] .resource-card,
html[data-theme="dark"] .worksheet-card,
html[data-theme="dark"] .lesson-card,
html[data-theme="dark"] .content-card{
  background:var(--site-surface)!important;color:var(--site-text)!important;border-color:var(--site-border)!important;
}
html[data-theme="dark"] .main-nav{
  background:var(--site-bg)!important;border-color:var(--site-border)!important;
}
html[data-theme="dark"] .menu-toggle span{background:var(--site-text)!important}

/* Global dark mode also recolors common page-level surfaces. */
html[data-theme="dark"] input,
html[data-theme="dark"] select,
html[data-theme="dark"] textarea{
  background:#11141b!important;color:#f4f6fb!important;border-color:#343a4a!important;
}
html[data-theme="dark"] .site-footer{color:#9da6b8!important}
@media(max-width:700px){
  .theme-toggle{min-height:36px;padding:0 10px}
}

html[data-theme="dark"] .match-rush-game{
  --mr-bg:#10131a!important;
  --mr-card-bg:#1b1f2a!important;
  --mr-card-hover:#272c3b!important;
  --mr-text:#f4f6fb!important;
  --mr-text-muted:#aeb6c8!important;
  --mr-accent:#8b6de2!important;
  --mr-accent-hover:#a58cf0!important;
  --mr-gold:#ffd34d!important;
  --mr-modal-bg:rgba(0,0,0,.72)!important;
}
html[data-theme="dark"] .match-rush-game .word{
  background:#1b1f2a!important;color:#f4f6fb!important;border-color:#353b4d!important;
  box-shadow:0 5px 0 #11141b,0 9px 22px rgba(0,0,0,.28)!important;
}
html[data-theme="dark"] .match-rush-game .word:hover{
  background:#252a38!important;border-color:#8b6de2!important;
}
html[data-theme="dark"] .match-rush-game .word.selected{
  background:#302b18!important;border-color:#ffd34d!important;
  box-shadow:0 0 0 4px rgba(255,211,77,.14),0 0 28px rgba(255,211,77,.48),0 7px 0 #574b20!important;
}
html[data-theme="dark"] .match-rush-game .word.correct{
  background:#20a85a!important;color:#fff!important;border-color:#77e2a1!important;
}


/* ---------- MAIN WEBSITE DARK THEME ---------- */
html[data-theme="dark"] .site-header{
  background:rgba(15,17,23,.96)!important;
  border-bottom-color:#2b3040!important;
}
html[data-theme="dark"] .hero,
html[data-theme="dark"] .section-heading,
html[data-theme="dark"] .about-section,
html[data-theme="dark"] .cta-section{
  background:var(--site-bg)!important;
  color:var(--site-text)!important;
}
html[data-theme="dark"] .hero h1,
html[data-theme="dark"] .hero h2,
html[data-theme="dark"] .section-heading h2,
html[data-theme="dark"] .about-section h2,
html[data-theme="dark"] .cta-section h2,
html[data-theme="dark"] .hero-content,
html[data-theme="dark"] .section-heading,
html[data-theme="dark"] .about-section,
html[data-theme="dark"] .cta-section{
  color:var(--site-text)!important;
}
html[data-theme="dark"] .hero-description,
html[data-theme="dark"] .section-heading p,
html[data-theme="dark"] .about-section p,
html[data-theme="dark"] .cta-section p,
html[data-theme="dark"] .feature-text,
html[data-theme="dark"] .feature-card p{
  color:var(--site-muted)!important;
}
html[data-theme="dark"] .feature-card,
html[data-theme="dark"] .about-box,
html[data-theme="dark"] .cta-box,
html[data-theme="dark"] .arcade-feature,
html[data-theme="dark"] .resource-card,
html[data-theme="dark"] .worksheet-card{
  background:var(--site-surface)!important;
  color:var(--site-text)!important;
  border-color:var(--site-border)!important;
}
html[data-theme="dark"] .site-footer{
  background:#0b0d12!important;
  color:var(--site-muted)!important;
  border-top-color:var(--site-border)!important;
}
html[data-theme="dark"] .site-footer a{color:var(--site-muted)!important}
html[data-theme="dark"] .site-footer a:hover{color:#9a7cf0!important}

/* Match Rush cabinet follows the same global theme instead of keeping a
   permanently purple/dark outer shell. */
html[data-theme="light"] .cabinet-body{background:#f4f7fb!important;color:#202636!important}
html[data-theme="light"] .cabinet-shell{
  background:radial-gradient(circle at 50% -10%,#ffffff 0%,#f6f2ff 48%,#eef2f8 100%)!important;
  color:#202636!important;
}
html[data-theme="light"] .cabinet-topbar{
  background:rgba(255,255,255,.94)!important;
  border-bottom-color:rgba(105,55,216,.18)!important;
  box-shadow:0 2px 18px rgba(32,38,54,.10)!important;
}
html[data-theme="light"] .cabinet-marquee__title{color:#202636!important;text-shadow:none!important}
html[data-theme="light"] .cabinet-marquee__eyebrow{color:#6937d8!important;text-shadow:none!important}
html[data-theme="light"] .cabinet-brand-mark{box-shadow:0 0 12px rgba(105,55,216,.22)!important}
html[data-theme="dark"] .cabinet-body{background:#0b0714!important;color:#fff!important}

/* GLOBAL FLOATING HEADER
   All standard pages use the same 78px header geometry. */
body:not(.cabinet-body){padding-top:78px!important;}
.site-header,.arcade-header{position:fixed!important;top:0;left:0;right:0;width:100%;height:78px!important;z-index:1000;}
.site-header .header-inner,.arcade-header .header-inner{height:78px!important;min-height:78px!important;}

/* =========================================================
   SHARED HEADER — LEARNING ARCADE VISUAL STYLE
   Keep each page's existing text/links, but give every
   standard page the same compact Learning Arcade header.
========================================================= */
.site-header,
.arcade-header{
  position:fixed!important;
  top:0!important;
  left:0!important;
  right:0!important;
  width:100%!important;
  height:78px!important;
  min-height:78px!important;
  z-index:1000!important;
  background:rgba(255,255,255,.94)!important;
  backdrop-filter:blur(16px)!important;
  -webkit-backdrop-filter:blur(16px)!important;
  border-bottom:1px solid #eef0f4!important;
}

.site-header .header-inner,
.arcade-header .header-inner{
  width:min(calc(100% - 48px),1180px)!important;
  height:78px!important;
  min-height:78px!important;
  margin:0 auto!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:30px!important;
}

.site-header .brand,
.arcade-header .brand{
  display:flex!important;
  align-items:center!important;
  gap:11px!important;
  flex-shrink:0!important;
  text-decoration:none!important;
}

.site-header .brand-mark,
.arcade-header .brand-mark{
  width:41px!important;
  height:41px!important;
  flex:0 0 41px!important;
  display:grid!important;
  place-items:center!important;
  border-radius:12px!important;
  background:#6937d8!important;
  color:#fff!important;
  font-size:12px!important;
  font-weight:900!important;
}

.site-header .brand-text,
.arcade-header .brand-text{
  display:flex!important;
  flex-direction:column!important;
  gap:2px!important;
}

.site-header .brand-text strong,
.arcade-header .brand-text strong{
  font-size:14px!important;
  line-height:1.15!important;
  font-weight:800!important;
}

.site-header .brand-text small,
.arcade-header .brand-text small{
  color:#7b8496!important;
  font-size:10px!important;
  line-height:1.15!important;
}

.site-header .main-nav,
.arcade-header .main-nav{
  display:flex!important;
  align-items:center!important;
  gap:28px!important;
}

.site-header .main-nav a,
.arcade-header .main-nav a{
  position:relative!important;
  color:#6d7587!important;
  font-size:13px!important;
  line-height:1!important;
  font-weight:700!important;
  text-decoration:none!important;
  transition:color .2s ease!important;
}

.site-header .main-nav a:hover,
.site-header .main-nav a.active,
.arcade-header .main-nav a:hover,
.arcade-header .main-nav a.active{
  color:#6937d8!important;
}

.site-header .theme-toggle,
.arcade-header .theme-toggle{
  min-height:38px!important;
  height:38px!important;
  padding:0 12px!important;
  border:1px solid #e7e9ef!important;
  border-radius:10px!important;
  background:#fff!important;
  color:#202636!important;
  font:700 11px/1 Inter,ui-sans-serif,system-ui,sans-serif!important;
  white-space:nowrap!important;
}

html[data-theme="dark"] .site-header,
html[data-theme="dark"] .arcade-header{
  background:rgba(15,17,23,.94)!important;
  border-bottom-color:#2b3040!important;
}

html[data-theme="dark"] .site-header .theme-toggle,
html[data-theme="dark"] .arcade-header .theme-toggle{
  background:#181b24!important;
  border-color:#2b3040!important;
  color:#f4f6fb!important;
}

@media(max-width:700px){
  .site-header .header-inner,
  .arcade-header .header-inner{
    width:min(calc(100% - 28px),1180px)!important;
  }

  .site-header .main-nav,
  .arcade-header .main-nav{
    top:78px!important;
  }
}

/* =========================================================
   FINAL SHARED HEADER — MATCH THE LIVE LEARNING ARCADE STYLE
   Visual style only; page-specific text/links remain unchanged.
========================================================= */
body:not(.cabinet-body){
  padding-top:68px!important;
}

.site-header,
.arcade-header{
  position:fixed!important;
  top:0!important;
  left:0!important;
  right:0!important;
  width:100%!important;
  height:68px!important;
  min-height:68px!important;
  z-index:1000!important;
  background:rgba(255,255,255,.96)!important;
  backdrop-filter:blur(14px)!important;
  -webkit-backdrop-filter:blur(14px)!important;
  border-bottom:1px solid #eef0f4!important;
}

.site-header .header-inner,
.arcade-header .header-inner{
  width:92%!important;
  max-width:1500px!important;
  height:68px!important;
  min-height:68px!important;
  margin:0 auto!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;
  align-items:center!important;
  gap:24px!important;
}

.site-header .brand,
.arcade-header .brand{
  grid-column:1!important;
  justify-self:start!important;
}

.site-header .main-nav,
.arcade-header .main-nav{
  grid-column:2!important;
  justify-self:center!important;
  display:flex!important;
  align-items:center!important;
  gap:28px!important;
}

.site-header .theme-toggle,
.arcade-header .theme-toggle{
  grid-column:3!important;
  justify-self:end!important;
  height:40px!important;
  min-height:40px!important;
  padding:0 13px!important;
  border-radius:10px!important;
  font-size:11px!important;
}

.site-header .menu-toggle,
.arcade-header .menu-toggle{
  grid-column:3!important;
  justify-self:end!important;
}

@media(max-width:700px){
  body:not(.cabinet-body){padding-top:68px!important}
  .site-header,
  .arcade-header{height:68px!important;min-height:68px!important}
  .site-header .header-inner,
  .arcade-header .header-inner{
    width:calc(100% - 28px)!important;
    height:68px!important;
    min-height:68px!important;
    display:flex!important;
    justify-content:space-between!important;
    gap:12px!important;
  }
  .site-header .main-nav,
  .arcade-header .main-nav{
    top:68px!important;
  }
}


/* =========================================================
   DARK MODE — RESOURCES / AEF / AUDIO (fixes)
========================================================= */
html[data-theme="dark"] body {
  background: var(--site-bg) !important;
  color: var(--site-text) !important;
}

html[data-theme="dark"] .audio-card,
html[data-theme="dark"] .content-card,
html[data-theme="dark"] .resource-card,
html[data-theme="dark"] .level-card,
html[data-theme="dark"] .item-card,
html[data-theme="dark"] .ab-card,
html[data-theme="dark"] .unit-hero {
  background: var(--site-surface) !important;
  border-color: var(--site-border) !important;
  color: var(--site-text) !important;
  box-shadow: none !important;
}

html[data-theme="dark"] .audio-card h3,
html[data-theme="dark"] .content-card h3,
html[data-theme="dark"] .level-card h3,
html[data-theme="dark"] .item-card h3 {
  color: var(--site-text) !important;
}

html[data-theme="dark"] .audio-card p,
html[data-theme="dark"] .content-card p,
html[data-theme="dark"] .audio-label {
  color: var(--site-muted) !important;
}

html[data-theme="dark"] .audio-play-btn,
html[data-theme="dark"] .audio-download-btn {
  background: rgba(255,255,255,0.08) !important;
  color: var(--site-text) !important;
  border: 1px solid var(--site-border) !important;
}

html[data-theme="dark"] .audio-play-btn:hover,
html[data-theme="dark"] .audio-download-btn:hover {
  background: rgba(139,124,255,0.25) !important;
  border-color: #8b7cff !important;
}

html[data-theme="dark"] .audio-play-btn {
  background: linear-gradient(135deg, #7c5cff, #5a8cff) !important;
  color: #fff !important;
  border: none !important;
}

html[data-theme="dark"] .back-link,
html[data-theme="dark"] .back-button {
  background: rgba(255,255,255,0.06) !important;
  color: var(--site-text) !important;
  border: 1px solid var(--site-border) !important;
}

html[data-theme="dark"] .eyebrow {
  color: #b4a7ff !important;
}

html[data-theme="dark"] .arcade-intro h1,
html[data-theme="dark"] .section-heading h2,
html[data-theme="dark"] .unit-hero h1 {
  color: var(--site-text) !important;
}

html[data-theme="dark"] .theme-toggle {
  background: var(--site-surface) !important;
  color: var(--site-text) !important;
  border-color: var(--site-border) !important;
}

/* Mobile nav dark */
html[data-theme="dark"] .main-nav.open,
html[data-theme="dark"] .main-nav {
  background: var(--site-surface) !important;
}


/* === MAIN PAGE DARK MODE OVERHAUL === */
html[data-theme="dark"] {
  color-scheme: dark;
  --site-bg: #0b0d14;
  --site-surface: #141824;
  --site-surface-2: #0f1219;
  --site-text: #f0f2f8;
  --site-muted: #9aa3b8;
  --site-border: #262b3a;
  --site-shadow: rgba(0,0,0,0.4);
}

html[data-theme="dark"] body {
  background: #0b0d14 !important;
  color: #f0f2f8 !important;
}

/* Header */
html[data-theme="dark"] .site-header,
html[data-theme="dark"] .arcade-header {
  background: rgba(11, 13, 20, 0.92) !important;
  border-bottom: 1px solid #262b3a !important;
  backdrop-filter: blur(16px);
}

html[data-theme="dark"] .brand,
html[data-theme="dark"] .brand-text strong {
  color: #f0f2f8 !important;
}
html[data-theme="dark"] .brand-text small {
  color: #9aa3b8 !important;
}
html[data-theme="dark"] .main-nav a {
  color: #b8c0d4 !important;
}
html[data-theme="dark"] .main-nav a:hover,
html[data-theme="dark"] .main-nav a.active {
  color: #c4b5ff !important;
}
html[data-theme="dark"] .theme-toggle {
  background: #1a1f2e !important;
  color: #f0f2f8 !important;
  border-color: #2e3448 !important;
}
html[data-theme="dark"] .menu-toggle span {
  background: #f0f2f8 !important;
}

/* Hero */
html[data-theme="dark"] .hero {
  background: linear-gradient(180deg, #0b0d14 0%, #12151f 50%, #0b0d14 100%) !important;
}
html[data-theme="dark"] .hero h1 {
  color: #f5f7ff !important;
}
html[data-theme="dark"] .hero h1 span {
  color: #a78bfa !important;
}
html[data-theme="dark"] .hero-description,
html[data-theme="dark"] .eyebrow {
  color: #9aa3b8 !important;
}
html[data-theme="dark"] .eyebrow {
  color: #a78bfa !important;
}
html[data-theme="dark"] .secondary-button {
  background: #1a1f2e !important;
  color: #d4daf0 !important;
  border-color: #2e3448 !important;
}
html[data-theme="dark"] .secondary-button:hover {
  border-color: #a78bfa !important;
  color: #fff !important;
}
html[data-theme="dark"] .hero-circle {
  background: radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%) !important;
  opacity: 0.8 !important;
}
html[data-theme="dark"] .hero-card {
  background: #161b28 !important;
  border-color: #2a3044 !important;
  color: #f0f2f8 !important;
  box-shadow: 0 12px 32px rgba(0,0,0,0.35) !important;
}
html[data-theme="dark"] .hero-card span {
  color: #9aa3b8 !important;
}
html[data-theme="dark"] .hero-card strong {
  color: #f5f7ff !important;
}

/* Sections / cards on homepage */
html[data-theme="dark"] .section-heading h2,
html[data-theme="dark"] .arcade-intro h1,
html[data-theme="dark"] .about-section h2 {
  color: #f5f7ff !important;
}
html[data-theme="dark"] .section-heading p,
html[data-theme="dark"] .arcade-intro p {
  color: #9aa3b8 !important;
}
html[data-theme="dark"] .quick-card,
html[data-theme="dark"] .resource-card,
html[data-theme="dark"] .worksheet-card,
html[data-theme="dark"] .skill-card,
html[data-theme="dark"] .game-card,
html[data-theme="dark"] .feature-card {
  background: #141824 !important;
  border-color: #262b3a !important;
  color: #f0f2f8 !important;
  box-shadow: 0 8px 28px rgba(0,0,0,0.3) !important;
}
html[data-theme="dark"] .quick-card p,
html[data-theme="dark"] .resource-card p,
html[data-theme="dark"] .skill-card p,
html[data-theme="dark"] .game-card p {
  color: #9aa3b8 !important;
}
html[data-theme="dark"] .quick-card h3,
html[data-theme="dark"] .resource-card h3,
html[data-theme="dark"] .skill-card h2 {
  color: #f5f7ff !important;
}

/* Soft shapes / backgrounds that stay white */
html[data-theme="dark"] .soft-shape,
html[data-theme="dark"] .character-space {
  opacity: 0.35 !important;
  filter: brightness(0.7);
}

/* Footer */
html[data-theme="dark"] .site-footer {
  background: #0b0d14 !important;
  border-top: 1px solid #262b3a !important;
  color: #7a8299 !important;
}

/* Mobile nav open panel */
@media (max-width: 700px) {
  html[data-theme="dark"] .main-nav,
  html[data-theme="dark"] .main-nav.open {
    background: #141824 !important;
    border-color: #262b3a !important;
  }
  html[data-theme="dark"] .main-nav a {
    color: #d4daf0 !important;
    border-bottom-color: #262b3a !important;
  }
}

/* AEF resources already partially covered — reinforce */
html[data-theme="dark"] .level-card,
html[data-theme="dark"] .item-card,
html[data-theme="dark"] .ab-card,
html[data-theme="dark"] .audio-card,
html[data-theme="dark"] .content-card,
html[data-theme="dark"] .unit-hero {
  background: #141824 !important;
  border-color: #262b3a !important;
  color: #f0f2f8 !important;
}
html[data-theme="dark"] .level-card:hover,
html[data-theme="dark"] .item-card:hover,
html[data-theme="dark"] .audio-card:hover {
  border-color: #7c5cff !important;
  box-shadow: 0 16px 36px rgba(0,0,0,0.4) !important;
}
html[data-theme="dark"] .level-card.level-locked {
  opacity: 0.55;
  background: #10131c !important;
}
html[data-theme="dark"] .audio-play-btn {
  background: linear-gradient(135deg, #7c5cff, #5b8def) !important;
  color: #fff !important;
  border: none !important;
}
html[data-theme="dark"] .audio-download-btn {
  background: #1a1f2e !important;
  color: #d4daf0 !important;
  border: 1px solid #2e3448 !important;
}


/* =========================================================
   MOBILE SHELL (hybrid)
   - Fixed/sticky header on all standard pages
   - Content still scrolls
   - No horizontal overflow on phones
   - Safe-area support (notch / home indicator)
   - Games that use .cabinet-body keep their own full-screen layout
========================================================= */

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

html,
body {
  max-width: 100%;
  overflow-x: hidden;
  overscroll-behavior-x: none;
}

/* Fixed site chrome */
.site-header,
.arcade-header {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 100;
  /* notch / status bar */
  padding-top: env(safe-area-inset-top, 0px);
  /* total bar height = content + safe area */
  min-height: calc(78px + env(safe-area-inset-top, 0px));
  box-sizing: border-box;
}

/* Offset page content under fixed header (skip full-screen games) */
body:not(.cabinet-body) {
  padding-top: calc(78px + env(safe-area-inset-top, 0px)) !important;
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Sticky in-page game toolbars (Simple Past menu, etc.) sit under the site header when present */
.game-header {
  position: sticky;
  top: 0;
  z-index: 40;
}

/* Phone refinements */
@media (max-width: 700px) {
  .site-header,
  .arcade-header {
    min-height: calc(64px + env(safe-area-inset-top, 0px));
  }

  .header-inner {
    height: 64px;
    min-height: 64px;
    width: min(calc(100% - 24px), var(--container, 1180px));
  }

  body:not(.cabinet-body) {
    padding-top: calc(64px + env(safe-area-inset-top, 0px)) !important;
  }

  /* Prevent accidental horizontal drag */
  body {
    touch-action: pan-y;
  }

  img,
  video,
  svg,
  canvas {
    max-width: 100%;
    height: auto;
  }

  /* Comfortable tap targets */
  .main-nav a,
  .skill-button,
  .theme-toggle,
  .menu-toggle {
    min-height: 44px;
  }
}

/* Very small phones */
@media (max-width: 380px) {
  .header-inner {
    gap: 10px;
  }
  .brand-text small {
    display: none;
  }
}
