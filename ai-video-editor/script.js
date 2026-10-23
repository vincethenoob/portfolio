(() => {
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const dialog = document.getElementById('project-dialog');
  const aboutDialog = document.getElementById('about-dialog');
  document.getElementById('year').textContent = new Date().getFullYear();

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function openProject(id) {
    const p = projects.find(project => project.id === id);
    if (!p) return;
    const media = p.video ? `<video class="dialog-media" src="${escapeHtml(p.video)}" controls playsinline preload="metadata"></video>` : (p.embed ? `<iframe class="dialog-media" src="${escapeHtml(p.embed)}" title="${escapeHtml(p.title)} video" allow="fullscreen; picture-in-picture" loading="lazy"></iframe>` : '');
    const directLink = p.embed ? `<a class="contact-link watch-drive-link" href="${escapeHtml(p.embed)}" target="_blank" rel="noopener noreferrer">Watch in Google Drive ↗</a>` : '';
    const credit = p.credit ? `<p class="project-credit">Reference only · <strong>by other creators</strong>. This work was not created by Vincent.</p>` : '';
    dialog.querySelector('.dialog-content').innerHTML = `${media}${directLink}${credit}<p class="eyebrow">${escapeHtml(p.category || 'PROJECT')}</p><h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.description || '')}</p>`;
    dialog.showModal();
  }

  const showcaseRows = document.getElementById('showcase-rows');
  const showcaseOrder = ['AI VSL UGC type', 'Animation', 'Different Head, Same Dialogue', 'Other Creators’ Work'];
  if (showcaseRows) {
    const showcaseCategories = showcaseOrder.filter(cat => projects.some(p => p.category === cat));
    showcaseRows.innerHTML = showcaseCategories.map((category, rowIndex) => {
      const items = projects.filter(p => p.category === category);
      const direction = rowIndex % 2 === 0 ? 'left' : 'right';
      const duration = Math.max(24, items.length * 5.2);
      const renderCards = (interactive) => items.map(p => {
        const open = interactive ? 'button' : 'div';
        const attrs = interactive
          ? `type="button" data-project="${escapeHtml(p.id)}" aria-label="Watch ${escapeHtml(p.title)}"`
          : 'aria-hidden="true"';
        return `<${open} class="showcase-card" ${attrs}>
          <img src="${escapeHtml(p.thumbnail || '')}" alt="" loading="lazy">
          <span class="showcase-shade"></span><span class="showcase-play" aria-hidden="true">▶</span>
          <span class="showcase-card-meta"><small>${escapeHtml(p.subcategory || category)}</small><strong>${escapeHtml(p.title)}</strong></span>
        </${open}>`;
      }).join('');
      return `<section class="showcase-row" aria-label="${escapeHtml(category)} videos">
        <div class="showcase-row-heading"><div><h3>${escapeHtml(category)}</h3><span>${items.length} videos</span></div></div>
        <div class="showcase-track" aria-label="${escapeHtml(category)} continuously moving video slideshow" style="--marquee-duration:${duration}s" data-direction="${direction}">
          <div class="showcase-track-inner">
            <div class="showcase-loop-group">${renderCards(true)}</div>
            <div class="showcase-loop-group showcase-loop-copy" aria-hidden="true" inert>${renderCards(false)}</div>
          </div>
        </div>
      </section>`;
    }).join('');
    showcaseRows.querySelectorAll('.showcase-track').forEach(track => {
      const inner = track.querySelector('.showcase-track-inner');
      const animation = inner?.getAnimations().find(item => item.effect?.target === inner);
      if (!inner || !animation) return;
      let pointerId = null;
      let startX = 0;
      let startY = 0;
      let startOffset = 0;
      let groupWidth = 0;
      let dragging = false;

      const readOffset = () => {
        const transform = getComputedStyle(inner).transform;
        return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
      };
      const resumeIfAllowed = () => {
        if (!track.matches(':hover') && !track.matches(':focus-within')) animation.play();
      };
      const finishDrag = () => {
        if (pointerId === null) return;
        if (dragging && groupWidth > 0) {
          let offset = (startOffset + (lastX - startX)) % groupWidth;
          if (offset > 0) offset -= groupWidth;
          const progress = track.dataset.direction === 'right'
            ? (offset + groupWidth) / groupWidth
            : -offset / groupWidth;
          const duration = animation.effect.getTiming().duration;
          if (typeof duration === 'number') animation.currentTime = (progress % 1) * duration;
          inner.style.transform = '';
          track.classList.remove('is-dragging');
          track.dataset.skipClick = 'true';
          setTimeout(() => { delete track.dataset.skipClick; }, 0);
        }
        pointerId = null;
        dragging = false;
        resumeIfAllowed();
      };
      let lastX = 0;
      track.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pointerId = event.pointerId;
        startX = lastX = event.clientX;
        startY = event.clientY;
        startOffset = readOffset();
        const firstGroup = inner.querySelector('.showcase-loop-group:not(.showcase-loop-copy)');
        groupWidth = firstGroup?.getBoundingClientRect().width || 0;
        animation.pause();
      });
      track.addEventListener('pointermove', event => {
        if (event.pointerId !== pointerId) return;
        lastX = event.clientX;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) && groupWidth > 0) {
          dragging = true;
          track.classList.add('is-dragging');
          track.setPointerCapture(event.pointerId);
        }
        if (dragging) {
          let offset = (startOffset + dx) % groupWidth;
          if (offset > 0) offset -= groupWidth;
          inner.style.transform = `translate3d(${offset}px,0,0)`;
          event.preventDefault();
        }
      });
      track.addEventListener('pointerup', finishDrag);
      track.addEventListener('pointercancel', finishDrag);
      track.addEventListener('lostpointercapture', finishDrag);
      track.addEventListener('click', event => {
        if (track.dataset.skipClick !== 'true') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        delete track.dataset.skipClick;
      }, true);
    });
    showcaseRows.querySelectorAll('.showcase-card[data-project]').forEach(btn => btn.addEventListener('click', () => openProject(btn.dataset.project)));
  }

  const contact = window.CONTACT_DETAILS || {};
  const contactLinks = [];
  if (contact.email) contactLinks.push(`<a class="contact-link" href="mailto:${escapeHtml(contact.email)}">Email me ↗</a>`);
  if (contact.whatsapp) contactLinks.push(`<a class="contact-link" href="https://wa.me/${escapeHtml(contact.whatsapp)}" target="_blank" rel="noopener">WhatsApp ${escapeHtml(contact.whatsappDisplay || '↗')}</a>`);
  (contact.links || []).forEach(link => { if (link.label && link.url) contactLinks.push(`<a class="contact-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)} ↗</a>`); });
  if (contactLinks.length) document.getElementById('contact-links').innerHTML = contactLinks.join('');

  document.querySelectorAll('.dialog-close').forEach(btn => btn.addEventListener('click', () => btn.closest('dialog').close()));
  [dialog, aboutDialog].forEach(d => d.addEventListener('click', event => { if (event.target === d) d.close(); }));
  document.getElementById('about-more').addEventListener('click', () => aboutDialog.showModal());
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), {threshold: .12});
    document.querySelectorAll('.section-label,.about-grid,.skill-row,.work-heading,.services-grid,.contact-main').forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  }
})();
