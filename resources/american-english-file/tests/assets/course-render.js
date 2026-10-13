// Placeholder renderer – replace with your real course-render.js logic
// This is a minimal stub so the page structure is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (!app) return;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Simple fallback content if full renderer is not present
  app.innerHTML = `
    <div class="page-header" style="padding: 2rem 1.5rem 1rem;">
      <a href="../" class="back-link" style="display:inline-flex;align-items:center;gap:.5rem;margin-bottom:1rem;color:var(--text-muted,#666);text-decoration:none;">← Back to American English File</a>
      <h1 style="font-size:2rem;margin:0 0 .5rem;">Tests & Exams</h1>
      <p style="color:var(--text-muted,#666);margin:0;">Practice tests, unit exams, and interactive games for American English File.</p>
    </div>
    <div class="cards-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.25rem;padding:1rem 1.5rem 3rem;">
      <div class="card" style="background:linear-gradient(135deg,#4c1d95,#7c3aed);color:#fff;border-radius:1rem;padding:1.5rem;position:relative;">
        <span style="font-size:.75rem;opacity:.8;">MULTIPLE CHOICE</span>
        <h3 style="margin:.5rem 0;">Unit Quizzes</h3>
        <p style="margin:0 0 1rem;opacity:.9;font-size:.9rem;">40 questions per unit · Grammar & Vocabulary</p>
        <a href="../quiz/" style="display:inline-block;background:#fff;color:#4c1d95;padding:.5rem 1rem;border-radius:2rem;text-decoration:none;font-weight:600;">Open Quizzes →</a>
      </div>
      <div class="card" style="background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;border-radius:1rem;padding:1.5rem;">
        <span style="font-size:.75rem;opacity:.8;">MIXED</span>
        <h3 style="margin:.5rem 0;">Progress Tests</h3>
        <p style="margin:0 0 1rem;opacity:.9;font-size:.9rem;">Units 1–4 · 5–8 · 9–12</p>
        <span style="opacity:.7;font-size:.85rem;">Coming soon</span>
      </div>
      <div class="card" style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;border-radius:1rem;padding:1.5rem;">
        <span style="font-size:.75rem;opacity:.8;">LISTENING</span>
        <h3 style="margin:.5rem 0;">Listen & Write</h3>
        <p style="margin:0 0 1rem;opacity:.9;font-size:.9rem;">Dictation-style games like unit activities</p>
        <span style="opacity:.7;font-size:.85rem;">Coming soon</span>
      </div>
      <div class="card" style="background:linear-gradient(135deg,#9a3412,#f97316);color:#fff;border-radius:1rem;padding:1.5rem;">
        <span style="font-size:.75rem;opacity:.8;">GRAMMAR</span>
        <h3 style="margin:.5rem 0;">Sentence Builder Exam</h3>
        <p style="margin:0 0 1rem;opacity:.9;font-size:.9rem;">Build correct sentences under time pressure</p>
        <span style="opacity:.7;font-size:.85rem;">Coming soon</span>
      </div>
    </div>
  `;
});
