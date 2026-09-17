/* Elect Cleaning Services — interactions
   Vanilla JS, no dependencies, no external APIs. */
(function () {
  'use strict';

  /* ---------------- Mobile navigation ---------------- */
  var nav = document.getElementById('primaryNav');
  var toggle = document.getElementById('navToggle');
  var backdrop = null;

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
    if (backdrop) { backdrop.remove(); backdrop = null; }
  }

  function openNav() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('nav-open');
    backdrop = document.createElement('button');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-label', 'Close menu');
    backdrop.addEventListener('click', closeNav);
    document.body.appendChild(backdrop);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------------- Sticky header shadow ---------------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealTargets = document.querySelectorAll(
    '.section-head, .card, .steps li, .feature, .ba, .post, .review, .areas__list li, .acc, .about__media, .commercial__media, .booking, .contact__list, .chips'
  );
  Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revealTargets, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Animated counters ---------------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    } else {
      Array.prototype.forEach.call(counters, function (el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
    }
  }

  /* ---------------- Before / after sliders ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-ba]'), function (ba) {
    var range = ba.querySelector('.ba__range');
    var before = ba.querySelector('.ba__before');
    var handle = ba.querySelector('.ba__handle');
    var divider = ba.querySelector('.ba__divider');
    if (!range || !before || !handle) return;

    function apply() {
      var value = parseFloat(range.value);
      if (isNaN(value)) value = 50;
      before.style.setProperty('--ba-clip', (100 - value) + '%');
      handle.style.left = value + '%';
      if (divider) divider.style.left = value + '%';
    }
    range.addEventListener('input', apply);
    range.addEventListener('change', apply);
    apply();
  });

  /* ---------------- Accordion: one open at a time ---------------- */
  var accs = document.querySelectorAll('.accordion .acc');
  Array.prototype.forEach.call(accs, function (acc) {
    acc.addEventListener('toggle', function () {
      if (!acc.open) return;
      Array.prototype.forEach.call(accs, function (other) {
        if (other !== acc) other.open = false;
      });
    });
  });

  /* ---------------- Booking form ---------------- */
  var form = document.getElementById('bookingForm');
  var note = document.getElementById('formNote');

  if (form) {
    var fields = form.querySelectorAll('input[required], select[required]');

    function validateField(field) {
      var label = field.closest('label');
      var value = (field.value || '').trim();
      var valid = value.length > 0;

      if (valid && field.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      }
      if (valid && field.type === 'tel') {
        valid = (value.replace(/\D/g, '').length >= 7);
      }
      if (label) label.classList.toggle('is-invalid', !valid);
      return valid;
    }

    Array.prototype.forEach.call(fields, function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var label = field.closest('label');
        if (label && label.classList.contains('is-invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = true;
      var firstBad = null;

      Array.prototype.forEach.call(fields, function (field) {
        if (!validateField(field)) {
          allValid = false;
          if (!firstBad) firstBad = field;
        }
      });

      if (!allValid) {
        if (note) {
          note.textContent = 'Please complete the highlighted fields so we can prepare your quote.';
          note.classList.remove('is-success');
        }
        if (firstBad) firstBad.focus();
        return;
      }

      var data = new FormData(form);
      var lines = [
        'Name: ' + (data.get('name') || ''),
        'Email: ' + (data.get('email') || ''),
        'Phone: ' + (data.get('phone') || ''),
        'Service: ' + (data.get('service') || ''),
        'City: ' + (data.get('city') || ''),
        'Preferred date: ' + (data.get('date') || ''),
        '',
        'Details:',
        (data.get('message') || '—')
      ];

      var subject = 'Booking request — ' + (data.get('service') || 'Cleaning service');
      var mailto = 'mailto:electcleaningcompany@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(lines.join('\n'));

      if (note) {
        note.innerHTML = 'Thank you! Your booking request is ready to send — we will confirm shortly. Prefer to talk? Call <a href="tel:+12816069899">(281) 606-9899</a>.';
        note.classList.add('is-success');
      }
      window.location.href = mailto;
    });
  }

  /* ---------------- Footer year ---------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
