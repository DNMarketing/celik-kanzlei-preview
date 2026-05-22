/* ============================================
   Kanzlei Celik — Multi-Page interactions
   ============================================ */
(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  document.addEventListener('DOMContentLoaded', () => {
    initYear();
    initNav();
    initBurger();
    initDropdown();
    initActiveNav();
    initReveal();
    initStaggerReveal();
    initDropzone();
    initMandantForm();
    initStubLinks();
    initAnfrageHashPulse();
    initMaps();
    initScrollProgress();
    initStickyCTAs();
    initImageWipe();
  });

  function initScrollProgress() {
    const bar = $('.scroll-progress');
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct.toFixed(1) + '%';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function initStickyCTAs() {
    const mobileBar = $('.sticky-cta-mobile');
    const fab = $('.sticky-fab');
    if (!mobileBar && !fab) return;

    const footer = $('footer.footer');
    let lastScroll = -1;

    const update = () => {
      const y = window.scrollY;
      const showMobile = y > 300;
      const showFab = y > 500;

      // Hide near footer
      let nearFooter = false;
      if (footer) {
        const rect = footer.getBoundingClientRect();
        nearFooter = rect.top < window.innerHeight - 40;
      }

      if (mobileBar) mobileBar.classList.toggle('is-visible', showMobile && !nearFooter);
      if (fab) fab.classList.toggle('is-visible', showFab && !nearFooter);
    };

    window.addEventListener('scroll', () => {
      if (Math.abs(window.scrollY - lastScroll) < 4) return;
      lastScroll = window.scrollY;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function initImageWipe() {
    const els = $$('.img-wipe');
    if (els.length === 0) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    els.forEach(el => io.observe(el));
  }

  function initMaps() {
    if (typeof L === 'undefined') {
      // Leaflet noch nicht geladen — defer-Script könnte später kommen
      const containers = $$('.location__map[id^="map-"]');
      if (containers.length === 0) return;
      // Warten bis L verfügbar
      const wait = setInterval(() => {
        if (typeof L !== 'undefined') {
          clearInterval(wait);
          mountMaps();
        }
      }, 80);
      setTimeout(() => clearInterval(wait), 8000);
      return;
    }
    mountMaps();
  }

  function mountMaps() {
    const containers = $$('.location__map[id^="map-"]');
    if (containers.length === 0) return;

    const goldPin = L.divIcon({
      className: 'custom-pin',
      html: '<svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#b88a36"/><circle cx="16" cy="16" r="6" fill="#fbf8f0"/></svg>',
      iconSize: [32, 40],
      iconAnchor: [16, 40],
    });

    containers.forEach((el) => {
      const lat = parseFloat(el.dataset.mapLat);
      const lng = parseFloat(el.dataset.mapLng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const map = L.map(el, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        doubleClickZoom: true,
        touchZoom: true,
        keyboard: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      L.marker([lat, lng], { icon: goldPin }).addTo(map);

      // Resize-Trigger nach Mount (Leaflet braucht das manchmal)
      setTimeout(() => map.invalidateSize(), 200);
    });
  }

  function initYear() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function initNav() {
    const nav = $('#nav');
    if (!nav) return;
    let last = -1;
    const update = () => {
      const scrolled = window.scrollY > 60;
      if (scrolled !== last) {
        nav.classList.toggle('is-scrolled', scrolled);
        last = scrolled;
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initBurger() {
    const burger = $('#burger');
    const nav = $('#nav');
    if (!burger || !nav) return;

    const close = () => {
      nav.classList.remove('is-menu-open');
      document.body.classList.remove('is-locked');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Menü öffnen');
    };

    burger.addEventListener('click', () => {
      const open = !nav.classList.contains('is-menu-open');
      nav.classList.toggle('is-menu-open', open);
      document.body.classList.toggle('is-locked', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });

    $$('.nav__menu a').forEach(a => {
      a.addEventListener('click', (e) => {
        // wenn Dropdown-Parent: nicht schließen, nur toggle
        const parent = a.parentElement;
        if (parent && parent.classList.contains('has-dropdown') && window.innerWidth < 1024) {
          // mobile: caret toggle
          if (a.getAttribute('href') === '#' || a.getAttribute('href') === null) {
            e.preventDefault();
            parent.classList.toggle('is-open');
            return;
          }
          // mobile mit echter URL → nicht direkt schließen, normal navigieren lassen
        }
        if (!parent.classList.contains('has-dropdown')) close();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-menu-open')) close();
    });
  }

  function initDropdown() {
    $$('.has-dropdown').forEach(li => {
      const trigger = li.querySelector(':scope > a');
      if (!trigger) return;

      // Desktop: hover handled via CSS. Click on trigger should still allow nav.
      // Mobile: tap trigger to expand the sub-list, second tap navigates.
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth >= 1024) return; // desktop hover handles
        if (!li.classList.contains('is-open')) {
          e.preventDefault();
          // close siblings
          $$('.has-dropdown').forEach(o => o !== li && o.classList.remove('is-open'));
          li.classList.add('is-open');
        }
      });
    });

    // close dropdowns on outside click (desktop)
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-dropdown')) {
        $$('.has-dropdown').forEach(o => o.classList.remove('is-open'));
      }
    });
  }

  function initActiveNav() {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.nav__menu a, .nav__dropdown a').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
      const file = href.split('/').pop();
      if (file === path || (path === '' && file === 'index.html')) {
        a.setAttribute('aria-current', 'page');
        const li = a.closest('.nav__menu > li');
        if (li) li.classList.add('is-active');
        const dropdownLi = a.closest('.has-dropdown');
        if (dropdownLi) dropdownLi.classList.add('is-active');
      }
    });
  }

  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => io.observe(el));
  }

  function initStaggerReveal() {
    const groups = ['.focus', '.further', '.philo__pillars', '.locations', '.locations-mini', '.services', '.workflow', '.team-grid', '.team-lead'];
    groups.forEach(sel => {
      $$(sel).forEach(grp => {
        Array.from(grp.children).forEach((child, i) => {
          if (child.classList.contains('reveal')) {
            child.dataset.delay = String(Math.min(i + 1, 4));
          }
        });
      });
    });
  }

  function initDropzone() {
    const zone  = $('#dropzone');
    const input = $('#fileInput');
    const list  = $('#fileList');
    if (!zone || !input || !list) return;

    let files = [];
    const MAX_BYTES = 25 * 1024 * 1024;

    const fmtSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
      return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    };

    const render = () => {
      list.innerHTML = '';
      files.forEach((f, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="file-name">${escapeHtml(f.name)}</span>
          <span class="file-meta">
            <span>${fmtSize(f.size)}</span>
            <button type="button" class="file-remove" aria-label="Datei entfernen" data-i="${i}">×</button>
          </span>`;
        list.appendChild(li);
      });
    };

    const add = (newFiles) => {
      Array.from(newFiles).forEach(f => {
        if (f.size > MAX_BYTES) {
          showToast(`„${f.name}" ist größer als 25 MB und wurde nicht hinzugefügt.`);
          return;
        }
        files.push(f);
      });
      render();
    };

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    zone.setAttribute('tabindex', '0');
    zone.setAttribute('role', 'button');

    input.addEventListener('change', (e) => add(e.target.files));

    ['dragenter', 'dragover'].forEach(ev => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault(); e.stopPropagation();
        zone.classList.add('is-drag');
      });
    });
    ['dragleave', 'drop'].forEach(ev => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault(); e.stopPropagation();
        zone.classList.remove('is-drag');
      });
    });
    zone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) add(e.dataTransfer.files);
    });

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.file-remove');
      if (!btn) return;
      const i = Number(btn.dataset.i);
      files.splice(i, 1);
      render();
    });

    window.__celikFiles = () => files;
    window.__celikFilesReset = () => { files = []; render(); };
  }

  function initMandantForm() {
    const form = $('#mandantForm');
    const btn  = $('#submitBtn');
    if (!form || !btn) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const required = ['vorname', 'nachname', 'email', 'gebiet'];
      for (const k of required) {
        if (!String(data.get(k) || '').trim()) {
          showToast('Bitte füllen Sie alle Pflichtfelder aus.');
          form.querySelector(`[name="${k}"]`)?.focus();
          return;
        }
      }
      if (!form.querySelector('[name="consent"]').checked) {
        showToast('Bitte stimmen Sie der Datenschutzerklärung zu.');
        return;
      }

      const orig = btn.textContent;
      btn.textContent = 'Übermittelt — Vielen Dank';
      btn.classList.add('is-success');
      btn.disabled = true;
      showToast('Ihre Anfrage wurde übermittelt. Wir melden uns innerhalb eines Werktags.');

      setTimeout(() => {
        form.reset();
        if (window.__celikFilesReset) window.__celikFilesReset();
        btn.textContent = orig;
        btn.classList.remove('is-success');
        btn.disabled = false;
      }, 3500);
    });
  }

  function initAnfrageHashPulse() {
    const handle = () => {
      if (window.location.hash !== '#anfrage') return;
      const target = document.querySelector('.mandant__form');
      if (!target) return;
      setTimeout(() => {
        target.classList.remove('pulse-highlight');
        void target.offsetWidth;
        target.classList.add('pulse-highlight');
        setTimeout(() => target.classList.remove('pulse-highlight'), 3200);
      }, 600);
    };
    window.addEventListener('hashchange', handle);
    if (window.location.hash === '#anfrage') {
      window.addEventListener('load', handle, { once: true });
    }
  }

  function initStubLinks() {
    $$('a[data-stub]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Diese Seite wird derzeit erstellt.');
      });
    });
  }

  let toastTimer = null;
  function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-show'), 4200);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }
})();
