(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     THEME TOGGLE
     (initial theme is already set by the inline head script,
     before first paint — this just wires up the button)
     ============================================================ */
  var root = document.documentElement;
  var toggleBtn = document.getElementById('themeToggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable — theme just won't persist */ }
    });
  }

  /* ============================================================
     STARFIELD (dark mode only, skipped if reduced motion)
     ============================================================ */
  var starsContainer = document.getElementById('stars');
  if (starsContainer && !reduceMotion) {
    var starCount = window.innerWidth < 600 ? 30 : 55;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < starCount; i++) {
      var star = document.createElement('span');
      star.className = 'star';
      star.style.top = (Math.random() * 100).toFixed(2) + '%';
      star.style.left = (Math.random() * 100).toFixed(2) + '%';
      var size = (Math.random() * 1.6 + 0.6).toFixed(2);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.animationDelay = (Math.random() * 6).toFixed(2) + 's';
      star.style.animationDuration = (Math.random() * 3 + 3).toFixed(2) + 's';
      frag.appendChild(star);
    }
    starsContainer.appendChild(frag);
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     SUBTLE HERO PARALLAX
     ============================================================ */
  var hero = document.querySelector('.hero');
  if (hero && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var offset = window.scrollY * 0.12;
          hero.style.backgroundPositionY = 'calc(50% + ' + offset + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();
