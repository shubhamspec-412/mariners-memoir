/* ============================================================
   MARINER'S MEMOIR — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Mobile Nav ───────────────────────────────────────────── */
  const toggle = document.querySelector('.nav__toggle');
  const mobileNav = document.querySelector('.nav__mobile');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  /* ── Back to Top ──────────────────────────────────────────── */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Reading Progress Bar ─────────────────────────────────── */
  const progressBar = document.getElementById('readingProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const total = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      progressBar.style.width = total > 0 ? ((scrolled / total) * 100) + '%' : '0%';
    }, { passive: true });
  }

  /* ── Toast Notification ───────────────────────────────────── */
  function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ── Like Button ──────────────────────────────────────────── */
  const likeBtn = document.getElementById('likeBtn');
  if (likeBtn) {
    const postId = document.body.dataset.postId || window.location.pathname;
    const storageKey = 'mm_liked_' + postId;
    const countEl = likeBtn.querySelector('.like-count');

    let liked = localStorage.getItem(storageKey) === 'true';
    let count = parseInt(localStorage.getItem(storageKey + '_count') || likeBtn.dataset.likes || '0', 10);

    function renderLike() {
      if (countEl) countEl.textContent = count;
      likeBtn.classList.toggle('active', liked);
      likeBtn.querySelector('.like-label').textContent = liked ? 'Liked' : 'Like';
    }

    renderLike();

    likeBtn.addEventListener('click', () => {
      liked = !liked;
      count += liked ? 1 : -1;
      localStorage.setItem(storageKey, liked);
      localStorage.setItem(storageKey + '_count', count);
      renderLike();
      if (liked) showToast('❤️ Added to your likes');
    });
  }

  /* ── Bookmark Button ──────────────────────────────────────── */
  const bookmarkBtn = document.getElementById('bookmarkBtn');
  if (bookmarkBtn) {
    const postId = document.body.dataset.postId || window.location.pathname;
    const storageKey = 'mm_bookmark_' + postId;
    let bookmarked = localStorage.getItem(storageKey) === 'true';

    function renderBookmark() {
      bookmarkBtn.classList.toggle('active', bookmarked);
      bookmarkBtn.querySelector('.bookmark-label').textContent = bookmarked ? 'Saved' : 'Save';
    }

    renderBookmark();

    bookmarkBtn.addEventListener('click', () => {
      bookmarked = !bookmarked;
      localStorage.setItem(storageKey, bookmarked);
      renderBookmark();
      showToast(bookmarked ? '🔖 Article saved' : 'Bookmark removed');
    });
  }

  /* ── Social Share Buttons ─────────────────────────────────── */
  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const platform = btn.dataset.share;
      const url = encodeURIComponent(btn.dataset.url || window.location.href);
      const title = encodeURIComponent(btn.dataset.title || document.title);
      const shareUrls = {
        linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        twitter:   `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        facebook:  `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        whatsapp:  `https://api.whatsapp.com/send?text=${title}%20${url}`,
      };
      if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=450,noopener');
      }
    });
  });

  /* ── Copy Link Button ─────────────────────────────────────── */
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('🔗 Link copied to clipboard');
      }).catch(() => {
        showToast('Could not copy — try manually');
      });
    });
  }

  /* ── Search (Blog Page) ───────────────────────────────────── */
  const searchInput = document.getElementById('searchInput');
  const articleItems = document.querySelectorAll('[data-searchable]');
  const noResults = document.getElementById('noResults');

  if (searchInput && articleItems.length) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      let visible = 0;

      articleItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        const match = !query || text.includes(query);
        item.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      if (noResults) noResults.classList.toggle('hidden', visible > 0);
    });
  }

  /* ── Category Filter (Blog Page) ─────────────────────────── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;
      let visible = 0;

      articleItems.forEach(item => {
        const itemCat = item.dataset.category || '';
        const match = cat === 'all' || itemCat === cat;
        item.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      // Clear search when filtering
      if (searchInput) searchInput.value = '';
      if (noResults) noResults.classList.toggle('hidden', visible > 0);
    });
  });

  /* ── Newsletter Form ──────────────────────────────────────── */
  document.querySelectorAll('.newsletter__form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) return;

      // TODO: Replace this with your actual email service (Mailchimp, ConvertKit, etc.)
      // Example Mailchimp integration: POST to your Mailchimp embed URL
      showToast('✅ You\'re subscribed! Welcome aboard.');
      if (emailInput) emailInput.value = '';
    });
  });

  /* ── Active Nav Link ──────────────────────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Smooth hover on article cards ───────────────────────── */
  document.querySelectorAll('.article-card').forEach(card => {
    const link = card.querySelector('a[href]') || card;
    if (card.tagName === 'A') {
      card.style.cursor = 'pointer';
    }
  });

})();
