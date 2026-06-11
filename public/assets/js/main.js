document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  function initHomeHeroParallax() {
    const stage = document.querySelector('.page-home .home-hero-stage');
    const hero = stage && stage.querySelector('[data-home-hero-parallax]');
    const services = document.querySelector('.page-home .cw-service-band');
    if (!stage || !hero || !services) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    let frame = null;

    function clearStagePad() {
      document.documentElement.style.setProperty('--cw-hero-stage-pad', '0px');
      hero.style.removeProperty('transform');
    }

    function layoutStage() {
      clearStagePad();
      if (motionQuery.matches || !desktopQuery.matches) return;

      const heroHeight = hero.offsetHeight;
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      const servicesTop = services.getBoundingClientRect().top + window.scrollY;
      const leadRun = Math.max(0, servicesTop - stageTop - heroHeight);
      const pad = Math.max(leadRun, Math.round(heroHeight * 0.94));

      document.documentElement.style.setProperty('--cw-hero-stage-pad', pad + 'px');
    }

    function tick() {
      frame = null;
      if (motionQuery.matches || !desktopQuery.matches) {
        clearStagePad();
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const run = stage.offsetHeight - hero.offsetHeight;
      if (run <= 0) {
        hero.style.removeProperty('transform');
        return;
      }

      const scrolled = Math.min(Math.max(-stageRect.top, 0), run);
      const shift = scrolled * 0.24;
      hero.style.transform = shift ? 'translate3d(0,' + shift + 'px,0)' : '';
    }

    function queueTick() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    function onLayoutChange() {
      layoutStage();
      queueTick();
    }

    layoutStage();
    window.addEventListener('scroll', queueTick, { passive: true });
    window.addEventListener('resize', onLayoutChange, { passive: true });
    motionQuery.addEventListener('change', onLayoutChange);
    desktopQuery.addEventListener('change', onLayoutChange);
    tick();
  }

  initHomeHeroParallax();

  function resolveSitePath(path) {
    if (!path || /^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
    if (!path.startsWith('/')) return path;

    const base = document.querySelector('base[data-github-pages-base]');
    if (!base) return path;

    const basePath = (base.getAttribute('href') || '/').replace(/\/$/, '');
    if (!basePath || basePath === '/') return path;
    if (path === basePath || path.startsWith(basePath + '/')) return path;

    return basePath + path;
  }

  function pickLazyVideoSrc(video) {
    const mobileSrc = resolveSitePath(video.getAttribute('data-cw-lazy-src-mobile'));
    const desktopSrc = resolveSitePath(video.getAttribute('data-cw-lazy-src'));
    if (video.hasAttribute('data-cw-hero-video') && mobileSrc && window.matchMedia('(max-width: 768px)').matches) {
      return mobileSrc;
    }
    return desktopSrc;
  }

  function ensureLazyVideoPoster(video) {
    if (!video || video.getAttribute('poster')) return;
    const poster = resolveSitePath(video.getAttribute('data-cw-lazy-poster'));
    if (poster) video.setAttribute('poster', poster);
  }

  function ensureLazyVideoSource(video) {
    if (!video || video.dataset.cwVideoLoaded === '1') return;
    const src = pickLazyVideoSrc(video);
    if (!src) return;
    video.src = src;
    video.dataset.cwVideoLoaded = '1';
  }

  function releaseLazyVideoSource(video) {
    if (!video || video.dataset.cwVideoLoaded !== '1') return;
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.dataset.cwVideoLoaded = '0';
  }

  function initLazyParallaxBackgrounds() {
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    function bgUrl(el) {
      const url = mobileQuery.matches ? el.getAttribute('data-bg-mobile') : el.getAttribute('data-bg-desktop');
      return resolveSitePath(url);
    }

    function applyBg(el) {
      const url = bgUrl(el);
      if (!url) return;
      el.style.backgroundImage = 'url("' + url.replace(/"/g, '%22') + '")';
      el.dataset.cwBgLoaded = '1';
    }

    document.querySelectorAll('[data-cw-lazy-bg]').forEach(function (el) {
      const section = el.closest('section');
      if (!section || typeof IntersectionObserver === 'undefined') {
        applyBg(el);
        return;
      }

      const observer = new IntersectionObserver(function (entries) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
        applyBg(el);
        observer.disconnect();
      }, { rootMargin: '140px' });
      observer.observe(section);
    });
  }

  initLazyParallaxBackgrounds();

  function initDeferredHeroVideo() {
    const video = document.querySelector('.home-hero-media video[data-cw-hero-video]');
    if (!video) return;

    function loadHeroVideo() {
      ensureLazyVideoSource(video);
      video.play().catch(function () {});
    }

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(function (entries) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
        observer.disconnect();
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(loadHeroVideo, { timeout: 1800 });
        } else {
          window.setTimeout(loadHeroVideo, 400);
        }
      }, { threshold: 0.12 });
      observer.observe(video);
      return;
    }

    window.addEventListener('load', function () {
      window.setTimeout(loadHeroVideo, 500);
    }, { once: true });
  }

  initDeferredHeroVideo();

  function initEyebrowReveal() {
    const revealSelector = '.eyebrow, .cw-slide-reveal';
    const revealTargets = document.querySelectorAll(revealSelector);
    if (!revealTargets.length) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function revealTarget(target, delay) {
      if (target.classList.contains('cw-eyebrow-animate') || target.classList.contains('cw-eyebrow-ready')) return;
      if (motionQuery.matches) {
        target.classList.add('cw-eyebrow-ready');
        return;
      }
      if (delay) target.style.setProperty('--cw-eyebrow-delay', delay + 'ms');
      target.classList.add('cw-eyebrow-animate');
    }

    function revealAnchor(anchor) {
      anchor.querySelectorAll(revealSelector).forEach(function (target, index) {
        revealTarget(target, index * 90);
      });
    }

    function revealAnchorFor(target) {
      return target.closest('.section-head, .cw-why-band__panel, .page-hero-copy, .cw-video-carousel__intro, .content-section') || target.parentElement;
    }

    if (motionQuery.matches) {
      revealTargets.forEach(function (target) {
        revealTarget(target, 0);
      });
      return;
    }

    document.querySelectorAll('.home-hero-copy .eyebrow, .home-lead-panel .eyebrow').forEach(function (target, index) {
      revealTarget(target, index * 90);
    });

    const scrollTargets = [];
    revealTargets.forEach(function (target) {
      if (target.closest('.home-hero-copy, .home-lead-panel')) return;
      scrollTargets.push(target);
    });

    function revealVisibleTargets() {
      scrollTargets.forEach(function (target) {
        if (target.classList.contains('cw-eyebrow-animate')) return;
        const anchor = revealAnchorFor(target);
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08) {
          const siblings = anchor.querySelectorAll(revealSelector);
          const index = Array.prototype.indexOf.call(siblings, target);
          revealTarget(target, index > 0 ? index * 90 : 0);
        }
      });
    }

    revealVisibleTargets();

    if (!('IntersectionObserver' in window)) {
      scrollTargets.forEach(function (target, index) {
        revealTarget(target, index * 70);
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealAnchor(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    const observed = new Set();
    scrollTargets.forEach(function (target) {
      const anchor = revealAnchorFor(target);
      if (!anchor || observed.has(anchor)) return;
      observed.add(anchor);
      observer.observe(anchor);
    });

    window.addEventListener('scroll', revealVisibleTargets, { passive: true });
    window.addEventListener('resize', revealVisibleTargets, { passive: true });
  }

  initEyebrowReveal();

  function initDirectionalReveal() {
    const targets = document.querySelectorAll('[data-cw-reveal]');
    if (!targets.length) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function revealElement(element, delay) {
      if (element.classList.contains('is-revealed')) return;
      if (motionQuery.matches) {
        element.classList.add('is-revealed');
        return;
      }
      if (delay) element.style.setProperty('--cw-reveal-delay', delay + 'ms');
      element.classList.add('is-revealed');
    }

    function revealVisibleElements() {
      targets.forEach(function (element) {
        if (element.classList.contains('is-revealed')) return;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08) {
          const delay = Number(element.dataset.cwRevealStagger || 0);
          revealElement(element, delay);
        }
      });
    }

    if (motionQuery.matches) {
      targets.forEach(function (element) {
        revealElement(element, 0);
      });
      return;
    }

    revealVisibleElements();

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (element, index) {
        revealElement(element, Number(element.dataset.cwRevealStagger || index * 80));
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.cwRevealStagger || 0);
        revealElement(entry.target, delay);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

    targets.forEach(function (element) {
      observer.observe(element);
    });

    window.addEventListener('scroll', revealVisibleElements, { passive: true });
    window.addEventListener('resize', revealVisibleElements, { passive: true });
  }

  initDirectionalReveal();

  function initWhyBandParallax() {
    const section = document.querySelector('.page-home .cw-why-band');
    const media = section && section.querySelector('[data-why-parallax]');
    if (!section || !media) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = null;

    function tick() {
      frame = null;
      if (motionQuery.matches) {
        media.style.transform = 'translate3d(0,0,0) scale(1.04)';
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.bottom < -40 || rect.top > viewH + 40) return;

      const centerOffset = rect.top + rect.height * 0.5 - viewH * 0.5;
      const shift = centerOffset * -0.52;
      media.style.transform = 'translate3d(0,' + shift + 'px,0) scale(1.04)';
    }

    function queueTick() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    tick();
    window.addEventListener('scroll', queueTick, { passive: true });
    window.addEventListener('resize', queueTick, { passive: true });
    motionQuery.addEventListener('change', queueTick);
  }

  initWhyBandParallax();

  function initBeforeAfterBandParallax() {
    const section = document.querySelector('.page-home .cw-before-after-band');
    const media = section && section.querySelector('[data-before-after-parallax]');
    if (!section || !media) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = null;

    function tick() {
      frame = null;
      if (motionQuery.matches) {
        media.style.transform = 'translate3d(0,0,0) scale(1.04)';
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.bottom < -40 || rect.top > viewH + 40) return;

      const centerOffset = rect.top + rect.height * 0.5 - viewH * 0.5;
      const shift = centerOffset * -0.52;
      media.style.transform = 'translate3d(0,' + shift + 'px,0) scale(1.04)';
    }

    function queueTick() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    tick();
    window.addEventListener('scroll', queueTick, { passive: true });
    window.addEventListener('resize', queueTick, { passive: true });
    motionQuery.addEventListener('change', queueTick);
  }

  initBeforeAfterBandParallax();

  function initWhyBandDoctorScale() {
    const section = document.querySelector('.page-home .cw-why-band');
    const content = section && section.querySelector('.cw-why-band__content');
    const figure = section && section.querySelector('.cw-why-band__figure');
    const img = section && section.querySelector('.cw-why-band__doctor');
    if (!section || !content || !figure || !img) return;

    const desktopQuery = window.matchMedia('(min-width: 981px)');
    let frame = null;

    function clearScale() {
      figure.style.removeProperty('height');
      figure.style.removeProperty('width');
      img.style.removeProperty('height');
      img.style.removeProperty('width');
    }

    function sync() {
      frame = null;
      if (!desktopQuery.matches) {
        clearScale();
        return;
      }

      const contentHeight = content.offsetHeight;
      if (contentHeight <= 0) return;

      figure.style.height = contentHeight + 'px';
      img.style.height = contentHeight + 'px';
      img.style.width = 'auto';
    }

    function queueSync() {
      if (!frame) frame = requestAnimationFrame(sync);
    }

    sync();
    window.addEventListener('resize', queueSync, { passive: true });
    desktopQuery.addEventListener('change', queueSync);

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(queueSync);
      observer.observe(content);
      if (img.complete) queueSync();
      else img.addEventListener('load', queueSync, { once: true });
    }
  }

  initWhyBandDoctorScale();

  document.querySelectorAll('.page-hero--gallery').forEach(function (hero) {
    if (hero.dataset.panelsInit) return;
    hero.dataset.panelsInit = '1';
    requestAnimationFrame(function () {
      hero.classList.add('hero-panels-ready');
    });
  });

  function initSiteNav() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const primaryMenu = document.getElementById('primary-menu');
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    let backdrop = document.querySelector('.cw-nav-backdrop');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'cw-nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    function resetSubnavs() {
      document.querySelectorAll('.subnav-open').forEach(function (item) {
        item.classList.remove('subnav-open');
      });
      document.querySelectorAll('.subnav-toggle').forEach(function (button) {
        button.setAttribute('aria-expanded', 'false');
      });
    }

    function closeNav() {
      document.body.classList.remove('nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
      resetSubnavs();
    }

    function openNav() {
      document.body.classList.add('nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (document.body.classList.contains('nav-open')) closeNav();
        else openNav();
      });
    }

    backdrop.addEventListener('click', closeNav);

    document.querySelectorAll('.subnav-toggle').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const item = button.closest('.nav-item');
        if (!item) return;
        const opening = !item.classList.contains('subnav-open');

        if (mobileQuery.matches) {
          const parentList = item.parentElement;
          if (parentList) {
            parentList.querySelectorAll(':scope > .nav-item.has-children.subnav-open').forEach(function (other) {
              if (other === item) return;
              other.classList.remove('subnav-open');
              const otherToggle = other.querySelector(':scope > .subnav-toggle');
              if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
            });
          }
        }

        item.classList.toggle('subnav-open', opening);
        button.setAttribute('aria-expanded', opening ? 'true' : 'false');
      });
    });

    document.querySelectorAll('.nav-item.has-children').forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover) and (min-width: 769px)').matches) item.classList.add('subnav-open');
      });
      item.addEventListener('mouseleave', function () {
        if (window.matchMedia('(hover: hover) and (min-width: 769px)').matches) item.classList.remove('subnav-open');
      });
    });

    if (primaryMenu) {
      primaryMenu.addEventListener('click', function (event) {
        if (!mobileQuery.matches) return;
        if (!event.target.closest('a')) return;
        closeNav();
      });
    }

    document.addEventListener('click', function (event) {
      if (!document.body.classList.contains('nav-open')) return;
      if (event.target.closest('.site-header') || event.target.closest('.cw-nav-backdrop')) return;
      closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeNav();
    });

    window.addEventListener('resize', function () {
      if (!mobileQuery.matches && document.body.classList.contains('nav-open')) closeNav();
    }, { passive: true });
  }

  initSiteNav();

  document.querySelectorAll('.compare-slider').forEach(function (slider) {
    const range = slider.querySelector('.compare-range');
    if (!range) return;
    const update = function () {
      slider.style.setProperty('--position', range.value + '%');
    };
    range.addEventListener('input', update);
    update();
  });

  function initVideoModal() {
    const modal = document.getElementById('cw-video-modal');
    if (!modal || modal.dataset.cwModalInit) return null;
    modal.dataset.cwModalInit = '1';

    const video = modal.querySelector('.cw-video-modal__video');
    const titleEl = modal.querySelector('.cw-video-modal__title');
    let lastFocus = null;

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      document.body.classList.remove('cw-modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      if (modal._onClose) modal._onClose();
    }

    function open(src, title, opener) {
      if (!video || !src) return;
      lastFocus = opener || document.activeElement;
      if (titleEl) titleEl.textContent = title || '';
      video.src = resolveSitePath(src);
      video.muted = false;
      video.currentTime = 0;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('cw-modal-open');
      video.play().catch(function () {});
      const closeBtn = modal.querySelector('.cw-video-modal__close');
      if (closeBtn) closeBtn.focus();
      if (modal._onOpen) modal._onOpen();
    }

    modal.querySelectorAll('[data-cw-modal-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });

    document.querySelectorAll('[data-cw-modal-trigger]').forEach(function (trigger) {
      if (trigger.dataset.cwModalBound) return;
      trigger.dataset.cwModalBound = '1';
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        open(trigger.getAttribute('data-cw-video-src'), trigger.getAttribute('data-cw-video-title'), trigger);
      });
    });

    return { open: open, close: close, el: modal };
  }

  function initVideoCarousel() {
    const widget = document.querySelector('[data-video-carousel]');
    if (!widget || widget.dataset.cwCarouselInit) return;

    const film = widget.querySelector('[data-carousel-film]');
    const slides = Array.from(widget.querySelectorAll('[data-carousel-slide]'));
    const tabs = Array.from(widget.querySelectorAll('.cw-carousel-tab'));
    const prevBtn = widget.querySelector('[data-carousel-prev]');
    const nextBtn = widget.querySelector('[data-carousel-next]');
    if (!film || !slides.length) return;

    widget.dataset.cwCarouselInit = '1';
    const modal = initVideoModal();
    const slideCount = slides.length;
    const mq = window.matchMedia('(max-width: 767px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let slotsInFrame = mq.matches ? 1 : 3;
    let maxLeftmost = Math.max(0, slideCount - slotsInFrame);
    let index = 0;
    let timer = null;
    let paused = false;
    let audioLocked = false;
    let carouselVisible = false;

    function setActiveSlide(leftmost) {
      slides.forEach(function (slide, idx) {
        const inFrame = idx >= leftmost && idx < leftmost + slotsInFrame;
        slide.classList.toggle('is-in-frame', inFrame);
        const video = slide.querySelector('video');
        if (video) {
          if (inFrame && carouselVisible && !motionQuery.matches) {
            ensureLazyVideoPoster(video);
            ensureLazyVideoSource(video);
            video.play().catch(function () {});
          } else {
            video.pause();
            video.muted = true;
            releaseLazyVideoSource(video);
            const card = slide.querySelector('.cw-slide-mute');
            if (card) {
              card.setAttribute('aria-pressed', 'true');
              card.setAttribute('aria-label', 'Unmute video');
            }
          }
        }
      });

      const activeTab = leftmost % slideCount;
      tabs.forEach(function (tab, idx) {
        const on = idx === activeTab;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    function moveTo(nextIndex, animate) {
      nextIndex = Math.max(0, Math.min(nextIndex, maxLeftmost));
      film.style.transition = animate === false ? 'none' : 'transform 1s ease-in-out';
      film.style.transform = 'translateX(-' + (nextIndex * 100 / slideCount) + '%)';
      index = nextIndex;
      setActiveSlide(index);
      if (animate === false) {
        requestAnimationFrame(function () {
          film.style.transition = 'transform 1s ease-in-out';
        });
      }
    }

    function next() {
      if (index >= maxLeftmost) moveTo(0, false);
      else moveTo(index + 1, true);
    }

    function prev() {
      if (index <= 0) moveTo(maxLeftmost, true);
      else moveTo(index - 1, true);
    }

    function startAutoplay() {
      if (timer) window.clearInterval(timer);
      if (motionQuery.matches || !carouselVisible) return;
      timer = window.setInterval(function () {
        if (!paused && !audioLocked) next();
      }, 12000);
    }

    function muteAll() {
      slides.forEach(function (slide) {
        const video = slide.querySelector('video');
        const btn = slide.querySelector('.cw-slide-mute');
        if (video) video.muted = true;
        if (btn) {
          btn.setAttribute('aria-pressed', 'true');
          btn.setAttribute('aria-label', 'Unmute video');
        }
      });
      audioLocked = false;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAutoplay(); });

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        moveTo(Number(tab.getAttribute('data-cw-tab') || 0), true);
        startAutoplay();
      });
    });

    slides.forEach(function (slide) {
      const btn = slide.querySelector('.cw-slide-mute');
      const video = slide.querySelector('video');
      if (!btn || !video) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const willUnmute = video.muted;
        muteAll();
        if (willUnmute) {
          ensureLazyVideoSource(video);
          video.muted = false;
          audioLocked = true;
          btn.setAttribute('aria-pressed', 'false');
          btn.setAttribute('aria-label', 'Mute video');
          video.play().catch(function () {});
        }
      });
    });

    if (modal) {
      modal.el._onOpen = function () {
        paused = true;
        if (timer) window.clearInterval(timer);
        muteAll();
      };
      modal.el._onClose = function () {
        paused = false;
        startAutoplay();
      };
    }

    widget.addEventListener('mouseenter', function () { paused = true; });
    widget.addEventListener('mouseleave', function () { paused = false; });
    widget.addEventListener('focusin', function () { paused = true; });
    widget.addEventListener('focusout', function () { paused = false; });

    function onBreakpoint() {
      slotsInFrame = mq.matches ? 1 : 3;
      maxLeftmost = Math.max(0, slideCount - slotsInFrame);
      moveTo(Math.min(index, maxLeftmost), false);
    }

    if (mq.addEventListener) mq.addEventListener('change', onBreakpoint);
    else if (mq.addListener) mq.addListener(onBreakpoint);

    function setCarouselVisible(visible) {
      carouselVisible = visible;
      if (!visible) {
        if (timer) window.clearInterval(timer);
        timer = null;
        slides.forEach(function (slide) {
          const video = slide.querySelector('video');
          if (video) {
            video.pause();
            releaseLazyVideoSource(video);
          }
        });
        return;
      }
      setActiveSlide(index);
      startAutoplay();
    }

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(function (entries) {
        setCarouselVisible(entries.some(function (entry) {
          return entry.isIntersecting;
        }));
      }, { threshold: 0.2 });
      observer.observe(widget);
    } else {
      setCarouselVisible(true);
    }

    motionQuery.addEventListener('change', function () {
      if (motionQuery.matches) {
        if (timer) window.clearInterval(timer);
        timer = null;
      } else if (carouselVisible) {
        startAutoplay();
      }
      setActiveSlide(index);
    });

    moveTo(0, false);
  }

  initVideoModal();
  initVideoCarousel();

  function syncMapRowHeights() {
    const row = document.querySelector('[data-cw-map-row]');
    if (!row) return;
    const mapCard = row.querySelector('.map-card');
    const photo = row.querySelector('[data-cw-map-photo]');
    if (!mapCard || !photo) return;

    function apply() {
      const height = Math.round(mapCard.getBoundingClientRect().height);
      if (height > 0) photo.style.minHeight = height + 'px';
    }

    apply();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(apply);
      observer.observe(mapCard);
      observer.observe(photo);
    }
    window.addEventListener('resize', apply);
    row.querySelector('.map-card iframe')?.addEventListener('load', apply);
  }

  document.querySelectorAll('[data-review-carousel]').forEach(function (carousel) {
    const track = carousel.querySelector('[data-review-track]');
    const dotsContainer = carousel.querySelector('[data-review-dots]');
    const previousButton = carousel.querySelector('[data-review-prev]');
    const nextButton = carousel.querySelector('[data-review-next]');
    if (!track || !dotsContainer) return;

    const cards = Array.from(track.querySelectorAll('.review-card'));
    if (!cards.length) return;

    let currentIndex = 0;
    let cachedCardWidth = 0;

    function visibleCount() {
      if (window.innerWidth <= 760) return 1;
      if (window.innerWidth <= 1080) return 2;
      return 3;
    }

    function getCardWidth() {
      if (!cachedCardWidth) {
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
        cachedCardWidth = cards[0].getBoundingClientRect().width + gap;
      }
      return cachedCardWidth;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const pages = Math.max(1, Math.ceil(cards.length / visibleCount()));
      for (let index = 0; index < pages; index += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'review-carousel-dot';
        dot.setAttribute('aria-label', 'Go to review set ' + (index + 1));
        dot.addEventListener('click', function () {
          currentIndex = index * visibleCount();
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateCarousel() {
      const visible = visibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
      track.style.transform = 'translateX(-' + (currentIndex * getCardWidth()) + 'px)';

      const activeDotIndex = Math.floor(currentIndex / visible);
      dotsContainer.querySelectorAll('.review-carousel-dot').forEach(function (dot, index) {
        dot.classList.toggle('active', index === activeDotIndex);
      });

      if (previousButton) previousButton.disabled = currentIndex === 0;
      if (nextButton) nextButton.disabled = currentIndex >= maxIndex;
    }

    if (previousButton) {
      previousButton.addEventListener('click', function () {
        currentIndex -= visibleCount();
        updateCarousel();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        currentIndex += visibleCount();
        updateCarousel();
      });
    }

    buildDots();
    updateCarousel();

    let resizeTimer;
    window.addEventListener('resize', function () {
      cachedCardWidth = 0;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        buildDots();
        updateCarousel();
      }, 120);
    });
  });

  syncMapRowHeights();

});
