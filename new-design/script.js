(function() {
  'use strict';

  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  const rightSidebar = document.getElementById('rightSidebar');

  // Sidebar toggle
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 1200 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });

    window.addEventListener('resize', function() {
      if (window.innerWidth > 1200) sidebar.classList.remove('open');
    });
  }

  // Right sidebar toggle (for mobile)
  const rightToggle = document.createElement('button');
  rightToggle.className = 'right-toggle';
  rightToggle.innerHTML = '▶';
  rightToggle.setAttribute('aria-label', 'Toggle right panel');
  Object.assign(rightToggle.style, {
    position:'fixed', right:'0', top:'50%', transform:'translateY(-50%)',
    zIndex:'98', width:'28px', height:'48px', borderRadius:'8px 0 0 8px',
    background:'rgba(123,47,247,0.15)', color:'#fff', fontSize:'14px',
    border:'1px solid rgba(255,255,255,0.06)', borderRight:'none',
    cursor:'pointer', display:'none', transition:'0.3s',
    backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)'
  });

  if (rightSidebar) {
    document.body.appendChild(rightToggle);

    function handleRightSidebar() {
      if (window.innerWidth <= 1200) {
        rightToggle.style.display = 'flex';
        rightToggle.style.alignItems = 'center';
        rightToggle.style.justifyContent = 'center';
      } else {
        rightToggle.style.display = 'none';
        rightSidebar.classList.remove('open');
      }
    }

    handleRightSidebar();
    window.addEventListener('resize', handleRightSidebar);

    rightToggle.addEventListener('click', function() {
      rightSidebar.classList.toggle('open');
      this.textContent = rightSidebar.classList.contains('open') ? '◀' : '▶';
    });

    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 1200 && rightSidebar.classList.contains('open')) {
        if (!rightSidebar.contains(e.target) && !rightToggle.contains(e.target)) {
          rightSidebar.classList.remove('open');
          rightToggle.textContent = '▶';
        }
      }
    });
  }

  // Search shortcut
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const inp = document.querySelector('.search-wrap input');
      if (inp) { inp.focus(); inp.select(); }
    }
  });

  // Task checkboxes
  document.querySelectorAll('.task-item input, .rs-task input').forEach(function(cb) {
    cb.addEventListener('change', function() {
      const txt = this.closest('.task-item, .rs-task').querySelector('.task-text, .rs-task-text');
      if (txt) txt.classList.toggle('done', this.checked);
      updateTaskCount();
    });
  });

  function updateTaskCount() {
    const total = document.querySelectorAll('.rs-task input').length;
    const done = document.querySelectorAll('.rs-task input:checked').length;
    const left = total - done;
    const el = document.querySelector('.rs-widget-count');
    if (el) el.textContent = left + ' left';
  }

  // Activity tabs
  document.querySelectorAll('.act-tabs button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      this.closest('.act-tabs').querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // Animate progress bars
  function animateBars() {
    document.querySelectorAll('.xp-fill').forEach(function(el) {
      const w = el.style.getPropertyValue('--xp-w');
      el.style.width = '0%';
      requestAnimationFrame(function() {
        requestAnimationFrame(function() { el.style.width = w; });
      });
    });

    document.querySelectorAll('.subj-bar div').forEach(function(el) {
      const w = el.style.width;
      el.style.width = '0%';
      setTimeout(function() { el.style.width = w; }, 400);
    });

    document.querySelectorAll('.ci-progress div').forEach(function(el) {
      const w = el.style.width;
      el.style.width = '0%';
      setTimeout(function() { el.style.width = w; }, 600);
    });
  }

  if (document.readyState === 'complete') animateBars();
  else window.addEventListener('load', animateBars);

  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) animateBars();
  });

  // Nav active
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // Hero bar click
  document.querySelectorAll('.act-bar').forEach(function(bar) {
    bar.addEventListener('click', function() {
      document.querySelectorAll('.act-bar').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // AI send
  const aiSend = document.querySelector('.ai-send-btn');
  const aiInput = document.querySelector('.ai-input-bar input');
  const aiChips = document.querySelectorAll('.ai-chip');

  function sendAIMsg(text) {
    if (!text) return;
    // Simple visual feedback
    if (aiInput) aiInput.value = '';
    const chip = document.querySelector('.ai-chip');
    if (chip) {
      chip.style.background = 'rgba(123,47,247,0.12)';
      chip.style.borderColor = 'rgba(123,47,247,0.2)';
      setTimeout(function() {
        chip.style.background = '';
        chip.style.borderColor = '';
      }, 500);
    }
  }

  if (aiSend && aiInput) {
    aiSend.addEventListener('click', function() { sendAIMsg(aiInput.value); });
    aiInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendAIMsg(aiInput.value);
    });
  }

  aiChips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      sendAIMsg(this.textContent);
      if (aiInput) aiInput.value = this.textContent;
    });
  });

  // Subscription
  const subBtn = document.querySelector('.sub-cta-btn');
  if (subBtn) {
    subBtn.addEventListener('click', function(e) {
      e.preventDefault();
      this.textContent = '✨ Upgrading...';
      this.disabled = true;
      setTimeout(function() {
        subBtn.textContent = '🎉 You\'re Pro!';
        subBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
        subBtn.style.boxShadow = '0 0 30px rgba(16,185,129,0.3)';
      }, 1500);
    });
  }

  // Add task
  const addBtn = document.querySelector('.task-add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      const t = prompt('Enter a new task:');
      if (!t || !t.trim()) return;
      const list = document.querySelector('.task-list');
      if (!list) return;

      const label = document.createElement('label');
      label.className = 'task-item';
      const inp = document.createElement('input');
      inp.type = 'checkbox';
      const tick = document.createElement('span');
      tick.className = 'tick';
      const txt = document.createElement('span');
      txt.className = 'task-text';
      txt.textContent = t.trim();

      inp.addEventListener('change', function() { txt.classList.toggle('done', this.checked); });

      label.appendChild(inp); label.appendChild(tick); label.appendChild(txt);
      list.appendChild(label);
      label.scrollIntoView({ behavior:'smooth', block:'nearest' });
    });
  }

  // Greeting time
  function setGreeting() {
    const el = document.querySelector('.greeting h1');
    if (!el) return;
    const h = new Date().getHours();
    let t, e;
    if (h < 12) { t = 'Good morning'; e = '☀️'; }
    else if (h < 17) { t = 'Good afternoon'; e = '🌤'; }
    else if (h < 21) { t = 'Good evening'; e = '🌅'; }
    else { t = 'Good night'; e = '🌙'; }
    el.innerHTML = t + ' Alex <span>' + e + '</span>';
  }
  setGreeting();

  // Cursor glow (desktop)
  if (window.innerWidth > 1024) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let timeout;
    document.addEventListener('mousemove', function(e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.style.opacity = '1';
      clearTimeout(timeout);
      timeout = setTimeout(function() { glow.style.opacity = '0'; }, 2500);
    });
  }

  // Streak hover
  document.querySelectorAll('.sdot').forEach(function(dot) {
    dot.addEventListener('mouseenter', function() {
      if (this.classList.contains('done') || this.classList.contains('today')) {
        this.style.transform = 'scale(1.4)';
        this.style.boxShadow = '0 0 16px rgba(255,107,53,0.5)';
      }
    });
    dot.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });

  // Circular progress animation for weekly widget
  document.querySelectorAll('.ww-fill').forEach(function(path) {
    const dash = path.getAttribute('stroke-dasharray');
    path.style.strokeDasharray = dash;
    path.style.strokeDashoffset = '100';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)';
        path.style.strokeDashoffset = '0';
      });
    });
  });

})();