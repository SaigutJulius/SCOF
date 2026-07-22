(() => {
  const theatreMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-ssos-theatre]').forEach((intro) => {
    const theatre = intro.closest('.ssos-showcase');
    if (!theatre) return;
    theatre.classList.add('is-theatre-ready');
    let ambientTimer = 0;

    const revealTheatre = () => {
      theatre.classList.add('is-theatre-visible', 'is-theatre-in-view');
      if (!theatreMotion.matches && !theatre.classList.contains('is-theatre-ambient')) {
        window.clearTimeout(ambientTimer);
        ambientTimer = window.setTimeout(() => theatre.classList.add('is-theatre-ambient'), 1450);
      }
    };
    const updatePageVisibility = () => theatre.classList.toggle('is-page-hidden', document.hidden);
    updatePageVisibility();
    document.addEventListener('visibilitychange', updatePageVisibility);

    if (theatreMotion.matches || !('IntersectionObserver' in window)) {
      revealTheatre();
      return;
    }

    const theatreObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) revealTheatre();
      else theatre.classList.remove('is-theatre-in-view');
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    theatreObserver.observe(intro);

    theatreMotion.addEventListener?.('change', () => {
      if (theatreMotion.matches) theatre.classList.remove('is-theatre-ambient');
      else if (theatre.classList.contains('is-theatre-in-view')) revealTheatre();
    });
  });

  const roots = document.querySelectorAll('[data-ssos-carousel]');
  if (!roots.length) return;

  roots.forEach((root) => {
    const slides = [...root.querySelectorAll('.ssos-slide')];
    const dots = [...root.querySelectorAll('.ssos-dots button')];
    const stage = root.querySelector('.ssos-slides');
    const previous = root.querySelector('[data-carousel-previous]');
    const next = root.querySelector('[data-carousel-next]');
    const play = root.querySelector('[data-carousel-play]');
    const title = root.querySelector('[data-carousel-title]');
    const kicker = root.querySelector('[data-carousel-kicker]');
    const description = root.querySelector('[data-carousel-description]');
    const currentLabel = root.querySelector('[data-carousel-current]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const effects = ['cover', 'page', 'depth', 'glass', 'cube'];
    const theatreGlows = ['88, 208, 122', '64, 177, 154', '153, 204, 90', '46, 156, 205', '191, 101, 64'];
    const interval = 7000;
    let active = 0;
    let timer = 0;
    let userPaused = false;
    let interactionPaused = false;
    let animating = false;
    let pointerId = null;
    let pointerStart = 0;
    let isNearViewport = false;

    const updatePlayControl = () => {
      const paused = userPaused || reduceMotion.matches;
      play.setAttribute('aria-pressed', String(userPaused));
      play.setAttribute('aria-label', paused ? 'Play automatic slide rotation' : 'Pause automatic slide rotation');
      play.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
    };

    const clearTimer = () => {
      window.clearTimeout(timer);
      timer = 0;
    };

    const schedule = () => {
      clearTimer();
      if (userPaused || interactionPaused || reduceMotion.matches || document.hidden || !isNearViewport) return;
      timer = window.setTimeout(() => show(active + 1, 1), interval);
    };

    const preloadFollowingSlide = () => {
      const current = slides[active]?.querySelector('img');
      const following = slides[(active + 1) % slides.length]?.querySelector('img');
      if (current) current.loading = 'eager';
      if (following) following.loading = 'eager';
    };

    const updateTheatreAtmosphere = () => {
      root.closest('.ssos-showcase')?.style.setProperty('--theatre-glow', theatreGlows[active]);
    };

    const finishTransition = (outgoing, incoming) => {
      outgoing.classList.remove('is-active', 'is-leaving');
      incoming.classList.remove('is-entering');
      incoming.classList.add('is-active');
      root.removeAttribute('data-effect');
      animating = false;
      schedule();
    };

    function show(requestedIndex, direction = 1) {
      if (animating || slides.length < 2) return;
      const nextIndex = (requestedIndex + slides.length) % slides.length;
      if (nextIndex === active) return;

      clearTimer();
      animating = true;
      const outgoingIndex = active;
      const outgoing = slides[outgoingIndex];
      const incoming = slides[nextIndex];
      const effectIndex = direction > 0 ? outgoingIndex : nextIndex;
      const effect = effects[effectIndex % effects.length];
      active = nextIndex;

      root.style.setProperty('--direction', direction > 0 ? '1' : '-1');
      root.style.setProperty('--ssos-enter-origin', direction > 0 ? '0% 50%' : '100% 50%');
      root.style.setProperty('--ssos-leave-origin', direction > 0 ? '100% 50%' : '0% 50%');
      root.dataset.effect = effect;
      outgoing.classList.add('is-leaving');
      incoming.classList.add('is-entering');
      incoming.setAttribute('aria-hidden', 'false');
      outgoing.setAttribute('aria-hidden', 'true');

      slides.forEach((slide, index) => {
        if (index !== outgoingIndex && index !== nextIndex) {
          slide.classList.remove('is-active', 'is-entering', 'is-leaving');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      dots.forEach((dot, index) => {
        const selected = index === active;
        dot.classList.toggle('is-active', selected);
        dot.setAttribute('aria-selected', String(selected));
        dot.tabIndex = selected ? 0 : -1;
      });

      title.textContent = incoming.dataset.title;
      kicker.textContent = incoming.dataset.kicker;
      description.textContent = incoming.dataset.description;
      currentLabel.textContent = String(active + 1).padStart(2, '0');
      updateTheatreAtmosphere();
      preloadFollowingSlide();

      const duration = reduceMotion.matches ? 30 : 700;
      window.setTimeout(() => finishTransition(outgoing, incoming), duration);
    }

    previous.addEventListener('click', () => show(active - 1, -1));
    next.addEventListener('click', () => show(active + 1, 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => show(index, index > active ? 1 : -1)));

    play.addEventListener('click', () => {
      userPaused = !userPaused;
      updatePlayControl();
      schedule();
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        show(active - 1, -1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        show(active + 1, 1);
      }
    });

    stage.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerId = event.pointerId;
      pointerStart = event.clientX;
      interactionPaused = true;
      clearTimer();
      stage.classList.add('is-dragging');
      stage.setPointerCapture?.(pointerId);
    });

    stage.addEventListener('pointerup', (event) => {
      if (pointerId !== event.pointerId) return;
      const distance = event.clientX - pointerStart;
      stage.releasePointerCapture?.(pointerId);
      stage.classList.remove('is-dragging');
      pointerId = null;
      interactionPaused = false;
      if (Math.abs(distance) >= 45) show(active + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1);
      else schedule();
    });

    stage.addEventListener('pointercancel', () => {
      pointerId = null;
      interactionPaused = false;
      stage.classList.remove('is-dragging');
      schedule();
    });

    root.addEventListener('mouseenter', () => { interactionPaused = true; clearTimer(); });
    root.addEventListener('mouseleave', () => { interactionPaused = false; schedule(); });
    root.addEventListener('focusin', () => { interactionPaused = true; clearTimer(); });
    root.addEventListener('focusout', (event) => {
      if (!root.contains(event.relatedTarget)) {
        interactionPaused = false;
        schedule();
      }
    });

    document.addEventListener('visibilitychange', schedule);
    reduceMotion.addEventListener?.('change', () => { updatePlayControl(); schedule(); });
    dots.forEach((dot, index) => { dot.tabIndex = index === 0 ? 0 : -1; });
    updatePlayControl();
    updateTheatreAtmosphere();

    if ('IntersectionObserver' in window) {
      const carouselObserver = new IntersectionObserver((entries) => {
        isNearViewport = entries[0].isIntersecting;
        if (isNearViewport) {
          preloadFollowingSlide();
          schedule();
        } else {
          clearTimer();
        }
      }, { rootMargin: '280px 0px', threshold: 0.01 });
      carouselObserver.observe(root);
    } else {
      isNearViewport = true;
      preloadFollowingSlide();
      schedule();
    }
  });
})();
