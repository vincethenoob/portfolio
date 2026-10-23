(() => {
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const grid = document.getElementById('project-grid');
  const empty = document.getElementById('empty-work');
  const filters = document.getElementById('filters');
  const dialog = document.getElementById('project-dialog');
  const aboutDialog = document.getElementById('about-dialog');
  document.getElementById('year').textContent = new Date().getFullYear();

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];
  const categoryFolders = Array.isArray(window.PORTFOLIO_CATEGORIES) ? window.PORTFOLIO_CATEGORIES : [];
  const folderLinks = document.getElementById('category-folders');
  const workTotal = document.getElementById('work-total');
  const referenceCount = projects.filter(p => p.credit).length;
  if (workTotal) workTotal.textContent = `${projects.length - referenceCount} VIDEO SAMPLES · ${referenceCount} REFERENCE EXAMPLES`;
  if (folderLinks) folderLinks.innerHTML = categoryFolders.map(item => `<a class="folder-link" href="${escapeHtml(item.folder)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name)} <span aria-hidden="true">↗</span></a>`).join('');
  let activeCategory = 'All';

  function render() {
    if (!projects.length) {
      empty.hidden = false;
      filters.hidden = true;
      grid.replaceChildren();
      return;
    }
    const visible = projects.filter(p => activeCategory === 'All' || p.category === activeCategory);
    empty.hidden = true;
    filters.hidden = false;
    grid.innerHTML = visible.map((p, i) => `
      <article class="project-card">
        <button class="project-open-card" data-project="${escapeHtml(p.id)}" aria-label="Open ${escapeHtml(p.title)}">
          <div class="project-thumb">${p.thumbnail ? `<img src="${escapeHtml(p.thumbnail)}" alt="${escapeHtml(p.title)} thumbnail" loading="lazy">` : '<span class="thumb-missing">ADD A REAL PROJECT THUMBNAIL</span>'}<span class="project-play" aria-hidden="true">▶</span></div>
        </button>
        <div class="project-meta"><div><h3 class="project-title">${escapeHtml(p.title)}</h3><span class="project-category">${escapeHtml(p.category)}${p.subcategory ? ` · ${escapeHtml(p.subcategory)}` : ''}</span></div><button class="project-open" data-project="${escapeHtml(p.id)}" aria-label="View project details">↗</button></div>
      </article>`).join('');
    grid.querySelectorAll('.project-thumb img').forEach(img => img.addEventListener('error', () => {
      const fallback = document.createElement('span');
      fallback.className = 'thumb-missing';
      fallback.textContent = 'PREVIEW UNAVAILABLE · OPEN TO WATCH';
      img.replaceWith(fallback);
    }, {once:true}));
    grid.querySelectorAll('[data-project]').forEach(btn => btn.addEventListener('click', () => openProject(btn.dataset.project)));
  }

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
  const showcaseOrder = ['AI VSL UGC type', 'Animation', 'Different Head, Same Dialogue'];
  if (showcaseRows) {
    const showcaseCategories = showcaseOrder.filter(cat => projects.some(p => p.category === cat));
    showcaseRows.innerHTML = showcaseCategories.map((category, rowIndex) => {
      const items = projects.filter(p => p.category === category);
      const rowId = `showcase-track-${rowIndex}`;
      return `<section class="showcase-row" aria-label="${escapeHtml(category)} videos">
        <div class="showcase-row-heading"><div><h3>${escapeHtml(category)}</h3><span>${items.length} videos</span></div>
          <div class="showcase-controls"><button type="button" data-scroll="-1" aria-label="Scroll ${escapeHtml(category)} videos left">←</button><button type="button" data-scroll="1" aria-label="Scroll ${escapeHtml(category)} videos right">→</button></div>
        </div>
        <div class="showcase-track" id="${rowId}" tabindex="0" aria-label="${escapeHtml(category)} video slideshow">
          ${items.map(p => `<button class="showcase-card" type="button" data-project="${escapeHtml(p.id)}" aria-label="Watch ${escapeHtml(p.title)}">
            <img src="${escapeHtml(p.thumbnail || '')}" alt="" loading="lazy">
            <span class="showcase-shade"></span><span class="showcase-play" aria-hidden="true">▶</span>
            <span class="showcase-card-meta"><small>${escapeHtml(p.subcategory || category)}</small><strong>${escapeHtml(p.title)}</strong></span>
          </button>`).join('')}
        </div>
      </section>`;
    }).join('');
    showcaseRows.querySelectorAll('.showcase-controls button').forEach(btn => btn.addEventListener('click', () => {
      const track = btn.closest('.showcase-row').querySelector('.showcase-track');
      track.scrollBy({left: Number(btn.dataset.scroll) * Math.min(track.clientWidth * 0.8, 720), behavior: 'smooth'});
    }));
    showcaseRows.querySelectorAll('.showcase-card').forEach(btn => btn.addEventListener('click', () => openProject(btn.dataset.project)));
  }

  filters.innerHTML = ['All', ...categories].map(cat => {
    const count = cat === 'All' ? projects.length : projects.filter(p => p.category === cat).length;
    return `<button class="filter-button${cat === activeCategory ? ' active' : ''}" data-category="${escapeHtml(cat)}" aria-pressed="${cat === activeCategory}">${escapeHtml(cat)}<span>${count}</span></button>`;
  }).join('');
  filters.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    activeCategory = btn.dataset.category;
    filters.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    render();
  }));
  render();

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
