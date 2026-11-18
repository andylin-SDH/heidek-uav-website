(function () {
  'use strict';

  /** Google 表單／試算表詢價連結 — 有值時「填寫詢價問卷」按鈕會另開新分頁 */
  const INQUIRY_SHEET_URL = 'https://forms.gle/j1BCsbc1otXD1Vk27';

  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav__link');

  function onScroll() {
    header.classList.toggle('header--scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  /* Product image lightbox */
  const lightbox = document.getElementById('productLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const btnPrev = lightbox?.querySelector('[data-lightbox-prev]');
  const btnNext = lightbox?.querySelector('[data-lightbox-next]');

  let lightboxItems = [];
  let lightboxIndex = 0;
  let lastFocus = null;

  function getLightboxSrc(node) {
    if (node.tagName === 'PICTURE') {
      const webp = node.querySelector('source[type="image/webp"]');
      const img = node.querySelector('img');
      if (webp?.getAttribute('srcset')) return webp.getAttribute('srcset');
      return img?.currentSrc || img?.src || '';
    }
    if (node.tagName === 'IMG') return node.currentSrc || node.src;
    return '';
  }

  function getLightboxFallback(node) {
    if (node.tagName === 'PICTURE') {
      const img = node.querySelector('img');
      return img?.getAttribute('src') || '';
    }
    return '';
  }

  function getLightboxAlt(node) {
    const img = node.tagName === 'PICTURE' ? node.querySelector('img') : node;
    return img?.getAttribute('alt') || '產品照';
  }

  document.querySelectorAll('.product-series__gallery:not(.product-series__gallery--empty)').forEach(gallery => {
    gallery.querySelectorAll(':scope > picture, :scope > img').forEach(node => {
      if (node.tagName === 'IMG' && node.closest('picture')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'product-series__thumb';
      btn.dataset.lightboxSrc = getLightboxSrc(node);
      const fallback = getLightboxFallback(node);
      if (fallback) btn.dataset.lightboxFallback = fallback;
      btn.dataset.lightboxAlt = getLightboxAlt(node);
      btn.setAttribute('aria-label', `放大預覽：${btn.dataset.lightboxAlt}`);

      const label = document.createElement('span');
      label.className = 'product-series__thumb-label';
      label.textContent = '放大';
      btn.appendChild(label);

      gallery.insertBefore(btn, node);
      btn.appendChild(node);
    });
  });

  const thumbButtons = document.querySelectorAll('.product-series__thumb');

  function setLightboxImage(item) {
    if (!lightboxImg || !item) return;
    lightboxImg.alt = item.alt;
    lightboxImg.onerror = null;
    if (item.fallback) {
      lightboxImg.onerror = () => {
        lightboxImg.onerror = null;
        lightboxImg.src = item.fallback;
      };
    }
    lightboxImg.src = item.src;
    if (lightboxCaption) lightboxCaption.textContent = item.alt;
    if (lightboxCounter) {
      lightboxCounter.textContent =
        lightboxItems.length > 1 ? `${lightboxIndex + 1} / ${lightboxItems.length}` : '';
    }
    if (btnPrev) btnPrev.disabled = lightboxIndex <= 0;
    if (btnNext) btnNext.disabled = lightboxIndex >= lightboxItems.length - 1;
  }

  function openLightbox(groupButtons, index) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    lightboxItems = Array.from(groupButtons).map(btn => ({
      src: btn.dataset.lightboxSrc || '',
      fallback: btn.dataset.lightboxFallback || '',
      alt: btn.dataset.lightboxAlt || '產品照',
    }));
    lightboxIndex = index;
    setLightboxImage(lightboxItems[lightboxIndex]);
    lightbox.hidden = false;
    lightbox.removeAttribute('aria-hidden');
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox__close')?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(() => {
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      if (lightboxImg) lightboxImg.src = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }, 280);
  }

  function stepLightbox(delta) {
    const next = lightboxIndex + delta;
    if (next < 0 || next >= lightboxItems.length) return;
    lightboxIndex = next;
    setLightboxImage(lightboxItems[lightboxIndex]);
  }

  thumbButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const gallery = btn.closest('.product-series__gallery');
      const group = gallery?.querySelectorAll('.product-series__thumb');
      if (!group?.length) return;
      const index = Array.from(group).indexOf(btn);
      openLightbox(group, index);
    });
  });

  lightbox?.querySelectorAll('[data-lightbox-close]').forEach(el => {
    el.addEventListener('click', closeLightbox);
  });

  btnPrev?.addEventListener('click', () => stepLightbox(-1));
  btnNext?.addEventListener('click', () => stepLightbox(1));

  document.addEventListener('keydown', e => {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  const sections = document.querySelectorAll('section[id]');

  function highlightNav() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${id}"]`);

      if (link && scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(l => l.classList.remove('nav__link--active'));
        link.classList.add('nav__link--active');
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  const inquiryBtn = document.getElementById('inquirySheetBtn');
  const inquiryPending = document.getElementById('inquirySheetPending');
  if (inquiryBtn) {
    const sheetUrl = (INQUIRY_SHEET_URL || '').trim();
    if (sheetUrl) {
      inquiryBtn.href = sheetUrl;
      inquiryBtn.removeAttribute('aria-disabled');
    } else {
      inquiryBtn.href = '#';
      inquiryBtn.setAttribute('aria-disabled', 'true');
      inquiryBtn.addEventListener('click', e => {
        e.preventDefault();
        if (inquiryPending) inquiryPending.hidden = false;
      });
    }
  }
})();
