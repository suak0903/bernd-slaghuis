(function () {
  'use strict';
  var doc = document, root = doc.documentElement;

  /* ---------- Nav: transparent -> solid beim Scrollen (alle Seiten) ---------- */
  var nav = doc.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', (window.scrollY || window.pageYOffset) > 30);
    parallax();
  }

  /* ---------- Mobiles Menue: Header bleibt, Burger morpht zum X ---------- */
  var burger = doc.getElementById('burger');
  var mmenu = doc.getElementById('mmenu');
  var lastFocus = null;

  function openMenu() {
    if (!mmenu) return;
    lastFocus = doc.activeElement;
    mmenu.classList.add('open');
    if (nav) nav.classList.add('menu-open');
    mmenu.removeAttribute('inert');
    if (burger) { burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Menü schließen'); }
    root.classList.add('no-scroll');
    var first = mmenu.querySelector('a, button');
    if (first) first.focus({ preventScroll: true });
  }
  function closeMenu() {
    if (!mmenu) return;
    mmenu.classList.remove('open');
    if (nav) nav.classList.remove('menu-open');
    mmenu.setAttribute('inert', '');
    if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Menü öffnen'); }
    root.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function toggleMenu() {
    if (mmenu && mmenu.classList.contains('open')) closeMenu(); else openMenu();
  }
  if (burger) burger.addEventListener('click', toggleMenu);

  /* Swipe nach oben schliesst das von oben kommende Menue */
  if (mmenu) {
    var ty0 = null;
    mmenu.addEventListener('touchstart', function (e) { ty0 = e.touches[0].clientY; }, { passive: true });
    mmenu.addEventListener('touchend', function (e) {
      if (ty0 === null) return;
      var dy = e.changedTouches[0].clientY - ty0;
      if (dy < -55 && mmenu.scrollTop <= 2) closeMenu();
      ty0 = null;
    }, { passive: true });
  }

  /* ---------- Anker-Links: Menue schliessen + weiches Scrollen mit Nav-Offset ---------- */
  function navH() {
    var v = getComputedStyle(root).getPropertyValue('--nav-h');
    var n = parseInt(v, 10); return isNaN(n) ? 74 : n;
  }
  function samePage(href) {
    if (!href) return null;
    var hash = href.indexOf('#');
    if (hash < 0) return null;
    var path = href.slice(0, hash);
    var id = href.slice(hash + 1);
    var here = location.pathname.split('/').pop() || 'index.html';
    var target = path.split('/').pop();
    if (path === '' || target === here || (target === '' && id)) return id;
    return null;
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a) return;
    var id = samePage(a.getAttribute('href'));
    if (!id) return;
    var el = id === 'top' ? doc.body : doc.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (mmenu && mmenu.classList.contains('open')) closeMenu();
    var y = id === 'top' ? 0 : el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - navH() + 2;
    window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  /* ---------- Bewertungs-Panel (von rechts) ---------- */
  var reviews = doc.getElementById('reviews');
  var rvScrim = doc.getElementById('rvScrim');
  var rvLast = null;
  function openRv() {
    if (!reviews) return;
    rvLast = doc.activeElement;
    reviews.classList.add('open');
    if (rvScrim) rvScrim.classList.add('open');
    reviews.removeAttribute('inert');
    root.classList.add('no-scroll');
    var c = doc.getElementById('rvClose'); if (c) c.focus({ preventScroll: true });
  }
  function closeRv() {
    if (!reviews) return;
    reviews.classList.remove('open');
    if (rvScrim) rvScrim.classList.remove('open');
    reviews.setAttribute('inert', '');
    root.classList.remove('no-scroll');
    if (rvLast && rvLast.focus) rvLast.focus({ preventScroll: true });
  }
  doc.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-reviews]')) { e.preventDefault(); openRv(); }
  });
  var rvCloseBtn = doc.getElementById('rvClose');
  if (rvCloseBtn) rvCloseBtn.addEventListener('click', closeRv);
  if (rvScrim) rvScrim.addEventListener('click', closeRv);
  /* Swipe nach rechts schliesst das Panel */
  if (reviews) {
    var rx0 = null;
    reviews.addEventListener('touchstart', function (e) { rx0 = e.touches[0].clientX; }, { passive: true });
    reviews.addEventListener('touchend', function (e) {
      if (rx0 === null) return;
      if (e.changedTouches[0].clientX - rx0 > 55) closeRv();
      rx0 = null;
    }, { passive: true });
  }

  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (reviews && reviews.classList.contains('open')) closeRv();
    else if (mmenu && mmenu.classList.contains('open')) closeMenu();
  });

  /* ---------- Demo-Leiste schliessen ---------- */
  var demobar = doc.getElementById('demobar'), dclose = doc.getElementById('demoClose');
  if (dclose && demobar) dclose.addEventListener('click', function () { demobar.classList.add('hide'); });

  /* ---------- Zurueck nach oben ---------- */
  var tocTop = doc.getElementById('tocTop');
  if (tocTop) {
    tocTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      tocTop.classList.toggle('show', (window.scrollY || window.pageYOffset) > 600);
    }, { passive: true });
  }

  /* ---------- Hero-Parallaxe (dezent) ---------- */
  var heroBg = doc.getElementById('heroBg');
  var heroPortrait = doc.querySelector('.hero__portrait');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;
  function parallax() {
    if (reduce || (!heroBg && !heroPortrait)) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = (window.scrollY || window.pageYOffset);
      if (y < 1300) {
        var t = 'translate3d(0,' + (y * 0.5).toFixed(1) + 'px,0)';
        if (heroBg) heroBg.style.transform = t;         /* Hintergrund-Verlauf */
        if (heroPortrait) heroPortrait.style.transform = t; /* Portrait (Desktop + mobil), reine Translation - keine Groessenaenderung */
      }
      ticking = false;
    });
  }

  /* ---------- Reveal beim Scrollen (sonst bleiben .reveal auf opacity:0) ---------- */
  var reveals = doc.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- Scrollspy: aktive Sektion im Menue unterstreichen ---------- */
  var spyLinks = Array.prototype.slice.call(doc.querySelectorAll('.nav__links a[href*="#"]')), spyMap = {};
  spyLinks.forEach(function (a) { var h = a.hash; if (h && h.length > 1) { var s = doc.querySelector(h); if (s) spyMap[h.slice(1)] = a; } });
  if ('IntersectionObserver' in window && Object.keys(spyMap).length) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          spyLinks.forEach(function (a) { a.classList.remove('active'); });
          var a = spyMap[en.target.id]; if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    Object.keys(spyMap).forEach(function (id) { var s = doc.getElementById(id); if (s) sio.observe(s); });
  }

  /* ---------- Hero-Ribbon: mobiler Auto-Marquee, per Finger schiebbar ---------- */
  (function () {
    var ribbon = doc.querySelector('.ribbon'); if (!ribbon) return;
    var mq = window.matchMedia('(max-width:700px)');
    var track = null, built = false, offset = 0, half = 0, raf = 0, dragging = false, sx = 0, so = 0;
    function build() {
      if (built) return;
      track = doc.createElement('div'); track.className = 'ribbon__track';
      while (ribbon.firstChild) track.appendChild(ribbon.firstChild);
      [].slice.call(track.children).forEach(function (k) { var c = k.cloneNode(true); c.setAttribute('data-dup', '1'); track.appendChild(c); });
      ribbon.appendChild(track); built = true; offset = 0; half = track.scrollWidth / 2;
    }
    function unbuild() {
      if (!built) return; cancelAnimationFrame(raf);
      [].slice.call(track.querySelectorAll('[data-dup]')).forEach(function (d) { d.remove(); });
      while (track.firstChild) ribbon.insertBefore(track.firstChild, track); track.remove(); track = null; built = false;
    }
    function frame() {
      if (!dragging && !reduce) offset -= 0.4; if (offset <= -half) offset += half; if (offset > 0) offset -= half;
      track.style.transform = 'translateX(' + offset.toFixed(2) + 'px)'; raf = requestAnimationFrame(frame);
    }
    function start() { build(); half = track.scrollWidth / 2; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    ribbon.addEventListener('touchstart', function (e) { if (!built) return; dragging = true; sx = e.touches[0].clientX; so = offset; }, { passive: true });
    ribbon.addEventListener('touchmove', function (e) { if (!dragging) return; offset = so + (e.touches[0].clientX - sx); }, { passive: true });
    ribbon.addEventListener('touchend', function () { dragging = false; });
    function apply() { if (mq.matches) start(); else unbuild(); }
    apply(); if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  })();

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
