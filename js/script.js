var WHATSAPP_NUMBER = '923237622972';
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- mobile menu ---- */
var btn = document.getElementById('menuBtn');
var menu = document.getElementById('mobileMenu');

function setMenu(open) {
  menu.hidden = !open;
  btn.setAttribute('aria-expanded', open);
  btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

btn.addEventListener('click', function () {
  setMenu(menu.hidden);
});

menu.querySelectorAll('a').forEach(function (a) {
  a.addEventListener('click', function () {
    setMenu(false);
  });
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !menu.hidden) {
    setMenu(false);
    btn.focus();
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

/* ---- header shadow + back-to-top ---- */
var header = document.querySelector('header');
var toTop = document.createElement('button');
toTop.className = 'to-top';
toTop.setAttribute('aria-label', 'Back to top');
toTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
toTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});
document.body.appendChild(toTop);

function onScroll() {
  var y = window.scrollY;
  header.classList.toggle('scrolled', y > 10);
  toTop.classList.toggle('show', y > 600);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---- counters ---- */
function runCounter(el) {
  var target = parseInt(el.getAttribute('data-count'), 10);
  if (reduceMotion) { el.textContent = target; return; }
  var start = null;
  function tick(t) {
    if (!start) start = t;
    var p = Math.min((t - start) / 1200, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---- scroll reveal ---- */
var revealEls = document.querySelectorAll('.reveal, [data-count]');
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      if (el.hasAttribute('data-count')) runCounter(el);
      else el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(function (el) { io.observe(el); });
} else {
  revealEls.forEach(function (el) { el.classList.add('in'); });
}

/* ---- programs page: filter + highlight linked program ---- */
var filterBtns = document.querySelectorAll('.filters button');
filterBtns.forEach(function (b) {
  b.addEventListener('click', function () {
    var cat = b.getAttribute('data-filter');
    filterBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    var shown = 0;
    document.querySelectorAll('.program').forEach(function (p) {
      p.hidden = cat !== 'all' && p.getAttribute('data-cat') !== cat;
      if (p.hidden) return;
      p.classList.add('in');
      // keep the image left/right zig-zag correct among the visible cards
      p.classList.toggle('flip', shown++ % 2 === 1);
    });
  });
});

document.querySelectorAll('.program').forEach(function (p, i) {
  p.classList.toggle('flip', i % 2 === 1);
});

var catParam =new URLSearchParams(location.search).get('cat');
var catBtn = catParam && document.querySelector('.filters button[data-filter="' + catParam + '"]');
if (catBtn) catBtn.click();

if (location.hash && document.querySelector('.program' + location.hash)) {
  var target = document.querySelector('.program' + location.hash);
  target.classList.add('in', 'flash');
}

/* ---- contact page: enrollment form -> WhatsApp ---- */
var form = document.getElementById('enrollForm');
if (form) {
  var courseParam = new URLSearchParams(location.search).get('course');
  if (courseParam) {
    var sel = form.elements.course;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === courseParam) sel.selectedIndex = i;
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (input) {
      var field = input.closest('.field');
      var empty = !input.value.trim();
      field.classList.toggle('invalid', empty);
      var err = field.querySelector('.err');
      if (err) err.hidden = !empty;
      if (empty && ok) { input.focus(); ok = false; }
    });
    if (!ok) return;

    var f = form.elements;
    var lines = [
      'Assalamu Alaikum! I would like to book a free trial class.',
      '',
      'Name: ' + f.name.value.trim()
    ];
    if (f.student.value.trim()) lines.push('Student: ' + f.student.value.trim());
    if (f.age.value.trim()) lines.push('Student age: ' + f.age.value.trim());
    lines.push('Course: ' + f.course.value);
    lines.push('Country / time zone: ' + f.country.value.trim());
    if (f.timing.value.trim()) lines.push('Preferred timing: ' + f.timing.value.trim());
    if (f.teacher.value) lines.push('Preferred teacher: ' + f.teacher.value);
    if (f.message.value.trim()) lines.push('', f.message.value.trim());

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    document.getElementById('formSuccess').hidden = false;
  });

  form.querySelectorAll('[required]').forEach(function (input) {
    input.addEventListener('input', function () {
      var field = input.closest('.field');
      if (input.value.trim()) {
        field.classList.remove('invalid');
        var err = field.querySelector('.err');
        if (err) err.hidden = true;
      }
    });
  });
}
