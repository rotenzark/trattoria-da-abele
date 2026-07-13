/* ===== Trattoria da Abele — main.js ===== */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = root.classList.contains('reduce-motion');

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var intro = document.getElementById('intro');
  if (intro && !reduce) {
    document.body.style.overflow = 'hidden';
    var done = function () {
      intro.classList.add('is-done'); document.body.style.overflow = '';
      setTimeout(function () { if (intro && intro.parentNode) intro.parentNode.removeChild(intro); }, 700);
      window.removeEventListener('click', done);
    };
    setTimeout(done, 2000); window.addEventListener('click', done);
  } else if (intro) { intro.parentNode && intro.parentNode.removeChild(intro); }

  var header = document.getElementById('siteHeader');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  var mq = window.matchMedia('(max-width:960px)'), lastFocus = null;
  function isMobile() { return mq.matches; }
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    if (isMobile()) { nav.inert = !open; if (open) { lastFocus = document.activeElement; var f = nav.querySelector('a'); f && f.focus(); } else if (lastFocus) { lastFocus.focus(); } }
    else { nav.inert = false; }
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A' && isMobile()) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false); });
    var syncMq = function () { if (!isMobile()) { nav.classList.remove('open'); nav.inert = false; burger.setAttribute('aria-expanded', 'false'); } else { if (!nav.classList.contains('open')) nav.inert = true; } };
    mq.addEventListener ? mq.addEventListener('change', syncMq) : mq.addListener(syncMq); syncMq();
  }

  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  function showAll() { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) { showAll(); }
  else {
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    var fired = false, wd = new IntersectionObserver(function () { fired = true; wd.disconnect(); });
    wd.observe(document.body); setTimeout(function () { if (!fired) showAll(); }, 1500);
  }

  /* dynamic hours — dinner only, Tue-Sat 20:00-00:00 */
  var HOURS = { 2: [[1200, 1440]], 3: [[1200, 1440]], 4: [[1200, 1440]], 5: [[1200, 1440]], 6: [[1200, 1440]], 0: [], 1: [] };
  function romeNow() { return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' })); }
  function fmt(m) { if (m >= 1440) return '00:00'; var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; }
  function updateHours(lang) {
    var el = document.getElementById('hoursStatus'); if (!el) return;
    var now = romeNow(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var wins = HOURS[day] || [], open = false, nextClose = null, nextOpen = null, nextDay = null;
    wins.forEach(function (w) { if (mins >= w[0] && mins < w[1]) { open = true; nextClose = w[1]; } });
    if (!open) { for (var i = 0; i < wins.length; i++) { if (mins < wins[i][0]) { nextOpen = wins[i][0]; break; } } }
    if (!open && nextOpen === null) { for (var d = 1; d <= 7; d++) { var nd = (day + d) % 7; if ((HOURS[nd] || []).length) { nextDay = { d: nd, o: HOURS[nd][0][0] }; break; } } }
    var t = {
      it: { open: 'Aperto ora', closes: 'chiude alle', closed: 'Chiuso ora', opens: 'apre oggi alle', opensDay: 'apre', days: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'] },
      en: { open: 'Open now', closes: 'closes at', closed: 'Closed now', opens: 'opens today at', opensDay: 'opens', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
    }[lang] || {};
    var html;
    if (open) html = '<span class="dot"></span>' + t.open + ' · ' + t.closes + ' ' + fmt(nextClose);
    else if (nextOpen !== null) html = '<span class="dot"></span>' + t.closed + ' · ' + t.opens + ' ' + fmt(nextOpen);
    else if (nextDay) html = '<span class="dot"></span>' + t.closed + ' · ' + t.opensDay + ' ' + t.days[nextDay.d] + ' ' + fmt(nextDay.o);
    else html = '<span class="dot"></span>' + t.closed;
    el.className = 'hours__status ' + (open ? 'is-open' : 'is-closed'); el.innerHTML = html;
    document.querySelectorAll('.hours__table tr').forEach(function (r) { r.classList.toggle('today', parseInt(r.getAttribute('data-day'), 10) === day); });
  }

  var EN = {
    'skip': 'Skip to content',
    'nav.about': 'The trattoria', 'nav.menu': 'Menu', 'nav.gallery': 'Gallery', 'nav.where': 'Where & hours', 'nav.reviews': 'Reviews',
    'cta.book': 'Book',
    'hero.eyebrow': 'Trattoria · NoLo · since 1979',
    'hero.concept': "Milan's home of risotto.",
    'hero.lead': "In an old neighbourhood bowls club in NoLo, since 1979, the trattoria that made risotto its signature: over 600 recipes, the saffron alla milanese, the ossobuco. The Milan of the old days, untouched. Dinner only.",
    'hero.cta1': 'The menu',
    'hero.stat1': 'risottos over the years', 'hero.stat2': 'since, on Via Temperanza', 'hero.stat3': 'on Google · 738 reviews',
    'hero.tag': 'Via Temperanza 5 · NoLo',
    'story.label': 'The trattoria', 'story.title': "Where Milan remembers how it was.",
    'story.p1': "Da Abele opened in 1979 on Via Temperanza, taking over a neighbourhood bowls club. Almost nothing has changed since: the original 1950s furnishings, the paintings on the walls, the warm, family atmosphere of a Milan that elsewhere is lost. Here you come for dinner only, and you take your time.",
    'story.p2': "There is one signature: <strong>risotto</strong>. Over 600 recipes across the years — from the saffron alla milanese to seasonal risottos — alongside the great Lombard classics: ossobuco, tripe, roasts, and a selection of grappe to finish. Honest prices, as it should be.",
    'story.chip1': "1950s interior", 'story.chip2': 'Dinner only', 'story.chip3': 'Lombard cuisine',
    'menu.label': 'The menu', 'menu.title': 'On the board, like the old days.',
    'menu.g1': 'While you wait for the risotto', 'menu.g2': 'I can be whatever you like', 'menu.g3': 'Risottos', 'menu.g4': 'Mains',
    'm.a1': 'Marinated sardines', 'm.a2': 'Focaccia barese', 'm.a3': 'Parma ham', 'm.a4': 'Cured game', 'm.a5': 'Cured goose', 'm.a6': 'Selection of cold cuts', 'm.a7': 'Board of cold cuts & cheeses',
    'm.b1': 'Aubergine caponata', 'm.b2': 'Artichoke & catalogna tart, gorgonzola fondue', 'm.b3': 'Lamb’s lettuce & puntarelle alla romana', 'm.b4': 'Chicory & artichokes, spicy gorgonzola', 'm.b5': 'Green beans & ricotta with herbs', 'm.b6': 'Mixed salad',
    'm.r1': 'Saffron alla milanese', 'm.r2': 'Trevigiano — sausage, radicchio, red wine, montasio', 'm.r3': 'Pumpkin & black cabbage', 'm.r4': 'Swordfish, aubergine cream & pistachio flour', 'm.r5': 'Two / three tastes (saffron excluded)',
    'm.s1': 'Game strudel & pizzoccheri in red wine', 'm.s2': 'Rabbit with mushrooms', 'm.s3': 'Veal fillet in mustard crust', 'm.s4': 'Tripe alla milanese', 'm.s5': 'Venetian salt cod', 'm.s6': 'Spicy braised octopus, potato purée', 'm.s7': 'Beef roast-beef',
    'menu.note': "The menu changes with the seasons and the kitchen's mood: this is a selection. Prices in euro. Home-made desserts and a wide selection of grappe.",
    'gallery.label': 'Gallery', 'gallery.title': 'At the table, da Abele.',
    'where.label': 'Where & hours', 'where.title': 'On Via Temperanza, in NoLo.',
    'day.mon': 'Monday', 'day.tue': 'Tuesday', 'day.wed': 'Wednesday', 'day.thu': 'Thursday', 'day.fri': 'Friday', 'day.sat': 'Saturday', 'day.sun': 'Sunday', 'closed': 'Closed',
    'where.note': 'Dinner only · booking recommended.',
    'rev.label': 'Reviews', 'rev.title': 'Whoever sits down, comes back.',
    'book.label': 'Book', 'book.title': 'A table da Abele.',
    'book.lead': "We're open for dinner only, Tuesday to Saturday from 8 pm. The room is small and fills up fast: call to book your table.",
    'book.call': 'Call · 02 261 3855', 'book.dir': 'Directions',
    'faq.title': 'Frequently asked questions',
    'faq.q1': 'What cuisine do you serve?',
    'faq.a1': 'Traditional Lombard and Milanese cooking: our signature is risotto — over 600 recipes over the years, from the saffron alla milanese to seasonal risottos — with ossobuco, tripe, cotoletta, roasts and home-made desserts.',
    'faq.q2': 'How long have you been around?',
    'faq.a2': 'Da Abele has been on Via Temperanza, in NoLo, since 1979, taking over an old neighbourhood bowls club. The original 1950s interior is untouched.',
    'faq.q3': 'What are your hours? Are you open for lunch?',
    'faq.a3': 'Dinner only, Tuesday to Saturday from 8 pm. Closed Monday and Sunday. We recommend booking.',
    'faq.q4': 'Do I need to book?',
    'faq.a4': 'Yes: the room is small and fills up fast on busy nights. Call 02 261 3855.',
    'footer.visit': 'Come and see us', 'footer.hours': 'Tue–Sat, dinner only from 8 pm', 'footer.info': 'Good to know', 'footer.info1': 'Booking recommended', 'footer.info2': 'Honest prices · home-made desserts', 'footer.credit': 'Demo website — Bespoke Studio',
    'ab.call': 'Call', 'ab.dir': 'Directions'
  };
  var IT = {};
  [].slice.call(document.querySelectorAll('[data-i18n]')).forEach(function (el) { IT[el.getAttribute('data-i18n')] = el.innerHTML; });
  function applyLang(lang) {
    var dict = lang === 'en' ? EN : IT;
    [].slice.call(document.querySelectorAll('[data-i18n]')).forEach(function (el) { var k = el.getAttribute('data-i18n'); if (dict[k] != null) el.innerHTML = dict[k]; });
    root.setAttribute('lang', lang);
    var it = document.querySelector('.lang__it'), en = document.querySelector('.lang__en');
    if (it && en) { it.classList.toggle('is-active', lang === 'it'); en.classList.toggle('is-active', lang === 'en'); }
    var lt = document.getElementById('langToggle');
    if (lt) lt.setAttribute('aria-label', lang === 'it' ? 'Switch language to English' : 'Passa all\'italiano');
    try { localStorage.setItem('abele-lang', lang); } catch (e) {}
    updateHours(lang);
  }
  var langToggle = document.getElementById('langToggle'), curLang = 'it';
  try { curLang = localStorage.getItem('abele-lang') || 'it'; } catch (e) {}
  if (langToggle) langToggle.addEventListener('click', function () { applyLang(root.getAttribute('lang') === 'it' ? 'en' : 'it'); });
  applyLang(curLang);
  setInterval(function () { updateHours(root.getAttribute('lang')); }, 60000);

  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lightboxImg'), lbClose = document.getElementById('lightboxClose'), lbLast = null;
  function openLb(src, alt) { lbImg.src = src; lbImg.alt = alt || ''; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); lbLast = document.activeElement; lbClose.focus(); document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lbImg.src = ''; document.body.style.overflow = ''; lbLast && lbLast.focus(); }
  [].slice.call(document.querySelectorAll('.shot')).forEach(function (btn) { btn.addEventListener('click', function () { var img = btn.querySelector('img'); openLb(btn.getAttribute('data-full'), img ? img.alt : ''); }); });
  lbClose && lbClose.addEventListener('click', closeLb);
  lb && lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
})();
