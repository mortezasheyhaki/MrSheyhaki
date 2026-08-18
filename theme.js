
(function(){
  "use strict";
  const KEY="mr_sheyhaki_theme";
  const root=document.documentElement;

  function getTheme(){
    return localStorage.getItem(KEY)==="dark" ? "dark" : "light";
  }
  function apply(theme){
    const t=theme==="dark" ? "dark" : "light";
    root.setAttribute("data-theme",t);
    document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
      btn.setAttribute("aria-pressed",String(t==="dark"));
      btn.innerHTML=t==="dark" ? "☀️ <span>Light Mode</span>" : "🌙 <span>Dark Mode</span>";
      btn.title=t==="dark" ? "Switch the whole website to light mode" : "Switch the whole website to dark mode";
    });
    window.dispatchEvent(new CustomEvent("site-theme-change",{detail:{theme:t}}));
  }
  apply(getTheme());
  document.addEventListener("DOMContentLoaded",()=>{
    apply(getTheme());
    document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const next=root.getAttribute("data-theme")==="dark" ? "light" : "dark";
        localStorage.setItem(KEY,next);
        apply(next);
      });
    });
  });
})();
