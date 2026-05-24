/* ============================================================
   script.js — Heonir Feliz Portfolio
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ---- Scroll Reveal (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---- Mobile Nav Toggle ---- */
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* ---- Navbar background solidify on scroll ---- */
  const navbar = document.getElementById('navbar');
  const solidifyAt = 80; // px

  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > solidifyAt) {
        navbar.style.background = 'rgba(10,14,23,.88)';
      } else {
        navbar.style.background = 'rgba(10,14,23,.65)';
      }
    },
    { passive: true }
  );

  /* ---- Hero blob mouse parallax ---- */
  const blobWraps = document.querySelectorAll('.hero-blob-wrap, .leaf-wrap');
  if (blobWraps.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const LERP = 0.1; // 0 = no movement, 1 = instant — 0.1 is smooth but snappy

    document.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const animateBlobs = () => {
      currentX += (targetX - currentX) * LERP;
      currentY += (targetY - currentY) * LERP;

      // How far through the hero section the user has scrolled (0 → 1)
      const heroH        = window.innerHeight;
      const scrollRatio  = Math.min(window.scrollY / heroH, 1);

      blobWraps.forEach((wrap) => {
        const d   = parseFloat(wrap.dataset.depth || '0.05');
        const tx  = currentX * window.innerWidth  * d;
        let   ty  = currentY * window.innerHeight * d;

        // Leaves fall downward on scroll and accumulate at the bottom; blobs stay put
        if (wrap.classList.contains('leaf-wrap')) {
          const fall    = parseFloat(wrap.dataset.fall    || '1');
          const maxFall = parseFloat(wrap.dataset.maxFall || '0.8');
          ty += Math.min(scrollRatio * heroH * fall, heroH * maxFall);
        }

        wrap.style.transform = `translate(${tx}px, ${ty}px)`;
      });
      requestAnimationFrame(animateBlobs);
    };
    requestAnimationFrame(animateBlobs);
  }

  /* ---- Typewriter subtitle ---- */
  const rotatingEl = document.querySelector('.tagline-rotating');
  if (rotatingEl) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      rotatingEl.textContent = 'AI Engineer';
    } else {
      const words = ['AI Engineer', 'Problem Solver', 'Teacher', 'Photographer', 'Builder', 'Dreamer', 'Human', 'Runner', 'Gymrat'];
      let wIdx = 0, cIdx = 0, deleting = false;
      const tick = () => {
        const word = words[wIdx];
        if (!deleting) {
          rotatingEl.textContent = word.slice(0, ++cIdx);
          if (cIdx === word.length) { deleting = true; setTimeout(tick, 2000); return; }
          setTimeout(tick, 82);
        } else {
          rotatingEl.textContent = word.slice(0, --cIdx);
          if (cIdx === 0) {
            deleting = false;
            wIdx = (wIdx + 1) % words.length;
            setTimeout(tick, 380);
            return;
          }
          setTimeout(tick, 44);
        }
      };
      setTimeout(tick, 900);
    }
  }

  /* ---- Active nav link highlight ---- */
  const sections = document.querySelectorAll('section, footer#contact');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const activateLink = () => {
    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });

    navAnchors.forEach((a) => {
      a.classList.remove('nav-active');
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('nav-active');
      }
    });
  };

  window.addEventListener('scroll', activateLink, { passive: true });
  activateLink();

  /* ---- Certifications Carousel (infinite marquee + dots) ---- */
  const track = document.querySelector('.cert-track');
  if (track) {
    const GAP      = 24;
    const DURATION = 55000;

    const origCards = Array.from(track.querySelectorAll('.cert-card'));
    origCards.forEach((card) => track.appendChild(card.cloneNode(true)));

    requestAnimationFrame(() => {
      const cardWidth     = origCards[0].offsetWidth + GAP;
      const totalOrigWidth = origCards.length * cardWidth;
      let userPaused = false;
      let anim;

      const makeAnim = (startTime = 0) => {
        const a = track.animate(
          [
            { transform: 'translateX(0px)' },
            { transform: `translateX(-${totalOrigWidth}px)` }
          ],
          { duration: DURATION, iterations: Infinity, easing: 'linear' }
        );
        a.currentTime = startTime;
        return a;
      };

      anim = makeAnim();

      const updateActiveDot = (index) => {
        dotsContainer.querySelectorAll('.cert-dot').forEach((d, i) => {
          d.classList.toggle('active', i === index);
        });
      };

      // Build dots
      const dotsContainer = document.querySelector('.cert-dots');
      origCards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'cert-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to certificate ${i + 1}`);
        dot.addEventListener('click', () => {
          const targetTime = (i * cardWidth / totalOrigWidth) * DURATION;
          const currentX   = -((anim.currentTime % DURATION) / DURATION) * totalOrigWidth;
          const targetX    = -(i * cardWidth);

          // Cancel so the animation no longer overrides inline styles
          anim.cancel();

          // Anchor at current position, then slide to target
          track.style.transform = `translateX(${currentX}px)`;
          track.getBoundingClientRect(); // force reflow
          track.style.transition = 'transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          track.style.transform  = `translateX(${targetX}px)`;
          updateActiveDot(i);

          track.addEventListener('transitionend', () => {
            track.style.transition = '';
            track.style.transform  = '';
            anim = makeAnim(targetTime);
            if (userPaused) anim.pause();
          }, { once: true });
        });
        dotsContainer.appendChild(dot);
      });

      // Keep active dot in sync while scrolling
      const syncDot = () => {
        if (anim && anim.currentTime !== null) {
          const t   = ((anim.currentTime % DURATION) / DURATION) * totalOrigWidth;
          const idx = Math.floor(t / cardWidth) % origCards.length;
          updateActiveDot(idx);
        }
        requestAnimationFrame(syncDot);
      };
      requestAnimationFrame(syncDot);

      // Hover / touch pause
      const wrapper = document.querySelector('.cert-carousel-wrapper');
      wrapper.addEventListener('mouseenter', () => { userPaused = true;  anim.pause(); });
      wrapper.addEventListener('mouseleave', () => { userPaused = false; anim.play();  });
      wrapper.addEventListener('touchstart', () => { userPaused = true;  anim.pause(); }, { passive: true });
      wrapper.addEventListener('touchend',   () => { userPaused = false; anim.play();  }, { passive: true });
    });
  }

  /* ============================================================
     PHOTOGRAPHY GALLERY
     - Auto-loads every image in images/photographyCollection/
     - Directory listing first (works with python -m http.server,
       npx serve, http-server, Apache/Nginx autoindex, etc.)
     - Falls back to optional manifest.json in the same folder
     - CSS-columns masonry preserves each photo's native aspect ratio
     - Click any photo → lightbox: prev/next, keyboard, swipe, ESC
     ============================================================ */
  initPhotographyGallery();
});

/* -------- Gallery init -------- */
async function initPhotographyGallery() {
  const grid = document.getElementById('photo-grid');
  const emptyMsg = document.getElementById('photo-empty');
  if (!grid) return;

  const FOLDER = 'images/photographyCollection/';
  const IMG_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|heic|heif)$/i;

  const filenames = await listPhotographyFiles(FOLDER, IMG_EXT);

  if (filenames.length === 0) {
    if (emptyMsg) emptyMsg.hidden = false;
    console.warn(
      `[photography] No photos discovered in ${FOLDER}.\n` +
      `• If you're opening index.html with file://, fetch() can't read directories.\n` +
      `• If your host has no autoindex (e.g. GitHub Pages), run ./update-photo-manifest.sh\n` +
      `  and commit the manifest.json so the gallery can load.`
    );
    return;
  }

  // Stable, natural ordering so drops slot in predictably
  filenames.sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  // Fade each photo in as it enters the viewport
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
  );

  const photos = [];

  filenames.forEach((name) => {
    const src = FOLDER + encodeURIComponent(name);
    const fig = document.createElement('figure');
    fig.className = 'photo-item';
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', `Open photo: ${name}`);

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.draggable = false;
    img.addEventListener('load', () => img.classList.add('is-loaded'));
    img.addEventListener('error', () => {
      // Skip broken files silently
      const idx = photos.findIndex((p) => p.fig === fig);
      if (idx > -1) photos.splice(idx, 1);
      fig.remove();
    });

    fig.appendChild(img);
    grid.appendChild(fig);
    revealObs.observe(fig);

    const index = photos.length;
    photos.push({ src, name, fig });

    const open = () => openLightbox(index);
    fig.addEventListener('click', open);
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  /* -------- Lightbox -------- */
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const lbCounter = document.getElementById('lightbox-counter');
  const btnClose  = document.getElementById('lightbox-close');
  const btnPrev   = document.getElementById('lightbox-prev');
  const btnNext   = document.getElementById('lightbox-next');
  let current = 0;
  let lastFocused = null;

  if (photos.length <= 1) lightbox.classList.add('is-single');

  function showAt(i) {
    if (photos.length === 0) return;
    current = ((i % photos.length) + photos.length) % photos.length;
    const { src, name } = photos[current];

    lbImg.classList.add('is-swapping');
    lbImg.classList.remove('is-ready');

    // Preload before swapping to avoid a flash
    const next = new Image();
    next.onload = () => {
      lbImg.src = src;
      lbImg.alt = name;
      lbImg.classList.remove('is-swapping');
      lbImg.classList.add('is-ready');
    };
    next.onerror = () => lbImg.classList.remove('is-swapping');
    next.src = src;

    lbCounter.textContent = `${current + 1} / ${photos.length}`;

    // Preload neighbours for snappy nav
    if (photos.length > 1) {
      const p = (current + 1) % photos.length;
      const q = (current - 1 + photos.length) % photos.length;
      new Image().src = photos[p].src;
      new Image().src = photos[q].src;
    }
  }

  function openLightbox(i) {
    lastFocused = document.activeElement;
    showAt(i);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    requestAnimationFrame(() => btnClose.focus({ preventScroll: true }));
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }

  const next = () => showAt(current + 1);
  const prev = () => showAt(current - 1);

  btnClose.addEventListener('click', closeLightbox);
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  // Click outside the image closes
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')          { e.preventDefault(); closeLightbox(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  // Touch swipe on mobile
  let tStartX = 0, tStartY = 0;
  lightbox.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    tStartX = t.screenX; tStartY = t.screenY;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.screenX - tStartX;
    const dy = t.screenY - tStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });
}

/* -------- File discovery --------
   1) Fetch the folder URL and parse autoindex HTML for <a href> filenames
   2) Fallback: optional manifest.json (array of filenames) in the same folder
   Both paths fail silently; the gallery just stays empty if neither works. */
async function listPhotographyFiles(folder, extRegex) {
  const found = new Set();

  // (1) Directory listing
  try {
    const resp = await fetch(folder, { headers: { Accept: 'text/html' } });
    if (resp.ok) {
      const ctype = (resp.headers.get('content-type') || '').toLowerCase();
      const text = await resp.text();

      if (ctype.includes('json')) {
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            data.forEach((entry) => {
              const name = typeof entry === 'string' ? entry : (entry && entry.name);
              if (name && extRegex.test(name)) found.add(name);
            });
          }
        } catch (_) { /* ignore */ }
      } else {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        doc.querySelectorAll('a').forEach((a) => {
          let href = a.getAttribute('href') || '';
          if (!href || href.startsWith('?') || href.startsWith('#')) return;
          href = href.split('?')[0].split('#')[0];
          const raw = href.split('/').filter(Boolean).pop() || '';
          let name = raw;
          try { name = decodeURIComponent(raw); } catch (_) { /* keep raw */ }
          if (name && extRegex.test(name)) found.add(name);
        });
      }
    }
  } catch (_) { /* fall through */ }

  // (2) Optional manifest.json fallback
  if (found.size === 0) {
    try {
      const resp = await fetch(folder + 'manifest.json', { headers: { Accept: 'application/json' } });
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) {
          data.forEach((entry) => {
            const name = typeof entry === 'string' ? entry : (entry && entry.name);
            if (name && extRegex.test(name)) found.add(name);
          });
        }
      }
    } catch (_) { /* ignore */ }
  }

  return Array.from(found);
}
