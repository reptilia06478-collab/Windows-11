/* ============================================================
   WINDOWS 11 SIMULATOR — MAIN SCRIPT
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================
  let zIndex = 100;
  let windowCounter = 0;
  const openWindows = new Map();

  let theme = localStorage.getItem('win11_theme') || 'dark';
  let accentColor = localStorage.getItem('win11_accent') || '#0078d4';
  let volume = parseInt(localStorage.getItem('win11_vol') || '70', 10);
  let brightness = parseInt(localStorage.getItem('win11_bright') || '100', 10);

  const notifications = [];
  const stickyNotes = JSON.parse(localStorage.getItem('win11_sticky') || '[]');

  // Apply theme and accent on load
  document.body.classList.toggle('light', theme === 'light');
  document.documentElement.style.setProperty('--accent', accentColor);

  // ============================================================
  // APP REGISTRY
  // ============================================================
  const APPS = {
    notepad:     { name: 'Notepad',       icon: '📝', width: 600, height: 400, render: renderNotepad },
    calculator:  { name: 'Kalkulator',    icon: '🧮', width: 320, height: 480, render: renderCalculator },
    terminal:    { name: 'Terminal',      icon: '⌨️', width: 700, height: 450, render: renderTerminal },
    explorer:    { name: 'File Explorer', icon: '📁', width: 800, height: 500, render: renderExplorer },
    paint:       { name: 'Paint',         icon: '🎨', width: 700, height: 500, render: renderPaint },
    settings:    { name: 'Pengaturan',    icon: '⚙️', width: 750, height: 500, render: renderSettings },
    browser:     { name: 'Browser',       icon: '🌐', width: 900, height: 600, render: renderBrowser },
    recycle:     { name: 'Recycle Bin',   icon: '🗑️', width: 400, height: 300, render: renderRecycle },
    about:       { name: 'Tentang',       icon: '💻', width: 500, height: 400, render: renderAbout },
    vscode:      { name: 'VS Code',       icon: '💙', width: 900, height: 600, render: renderVSCode },
    music:       { name: 'Musik',         icon: '🎵', width: 500, height: 550, render: renderMusic },
    minesweeper: { name: 'Minesweeper',   icon: '💣', width: 400, height: 500, render: renderMinesweeper },
    snake:       { name: 'Snake',         icon: '🐍', width: 500, height: 550, render: renderSnake },
    sticky:      { name: 'Sticky Notes',  icon: '📋', width: 500, height: 500, render: renderSticky }
  };

  const desktopApps = [
    'notepad', 'calculator', 'terminal', 'explorer', 'paint',
    'browser', 'vscode', 'music', 'minesweeper', 'snake', 'sticky', 'recycle'
  ];

  // ============================================================
  // UTILITY
  // ============================================================
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatTime(date) {
    return pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function formatDate(date) {
    return pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear();
  }

  // ============================================================
  // BOOT → LOCK → DESKTOP
  // ============================================================
  window.addEventListener('load', function () {
    setTimeout(function () {
      var boot = document.getElementById('bootScreen');
      boot.classList.add('hidden');

      setTimeout(function () {
        boot.style.display = 'none';
        showLockScreen();
      }, 800);
    }, 2000);
  });

  function showLockScreen() {
    var lock = document.getElementById('lockScreen');
    lock.classList.add('show');
    updateLockTime();
    setInterval(updateLockTime, 1000);

    lock.addEventListener('click', unlockScreen, { once: true });
  }

  function updateLockTime() {
    var now = new Date();
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    document.getElementById('lockTime').textContent = formatTime(now);
    document.getElementById('lockDate').textContent =
      days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];
  }

  function unlockScreen() {
    var lock = document.getElementById('lockScreen');
    lock.style.opacity = '0';

    setTimeout(function () {
      lock.classList.remove('show');
      lock.style.opacity = '1';
      initDesktop();
    }, 500);
  }

  // ============================================================
  // DESKTOP INIT
  // ============================================================
  function initDesktop() {
    renderDesktopIcons();
    renderStartApps();
    renderNotifications();
    renderCalendar();
    renderQuickSettings();
    updateClock();
    updateVolIcon();
    setInterval(updateClock, 1000);

    setTimeout(function () {
      showToast('Klik dua kali ikon untuk membuka aplikasi', '👋', 'Selamat datang');
    }, 1200);
  }

  // ============================================================
  // DESKTOP ICONS
  // ============================================================
  function renderDesktopIcons() {
    var container = document.getElementById('desktopIcons');
    container.innerHTML = '';

    desktopApps.forEach(function (appId) {
      var app = APPS[appId];
      if (!app) return;

      var icon = document.createElement('div');
      icon.className = 'icon';
      icon.innerHTML = '<div class="icon-img">' + app.icon + '</div><div>' + app.name + '</div>';

      icon.addEventListener('dblclick', function () { openApp(appId); });

      icon.addEventListener('click', function (e) {
        e.stopPropagation();
        var selected = document.querySelectorAll('.icon.selected');
        for (var i = 0; i < selected.length; i++) {
          selected[i].classList.remove('selected');
        }
        icon.classList.add('selected');
      });

      container.appendChild(icon);
    });
  }

  // ============================================================
  // START MENU APPS
  // ============================================================
  function renderStartApps() {
    var container = document.getElementById('startApps');
    container.innerHTML = '';

    Object.keys(APPS).forEach(function (appId) {
      var app = APPS[appId];
      var item = document.createElement('div');
      item.className = 'start-app';
      item.innerHTML = '<div class="start-app-icon">' + app.icon + '</div><div>' + app.name + '</div>';

      item.addEventListener('click', function () {
        openApp(appId);
        closeStartMenu();
      });

      container.appendChild(item);
    });
  }

  // ============================================================
  // OPEN / CLOSE / FOCUS WINDOW
  // ============================================================
  function openApp(appId) {
    var app = APPS[appId];
    if (!app) return;

    // Already open? Focus it.
    var found = null;
    openWindows.forEach(function (win, id) {
      if (win.app === appId) found = id;
    });

    if (found) {
      var win = openWindows.get(found);
      if (win.minimized) {
        win.minimized = false;
        win.el.classList.remove('minimized');
      }
      focusWindow(found);
      return;
    }

    var id = 'win-' + (++windowCounter);
    var el = document.createElement('div');
    el.className = 'window opening';
    el.dataset.id = id;

    var offset = (windowCounter * 30) % 200;
    var left = Math.min(100 + offset, Math.max(10, window.innerWidth - app.width - 20));
    var top = Math.min(60 + offset, Math.max(10, window.innerHeight - app.height - 80));

    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.width = app.width + 'px';
    el.style.height = app.height + 'px';
    el.style.zIndex = ++zIndex;

    el.innerHTML =
      '<div class="window-titlebar">' +
        '<div class="window-title">' +
          '<span class="window-title-icon">' + app.icon + '</span>' +
          '<span>' + app.name + '</span>' +
        '</div>' +
        '<div class="window-controls">' +
          '<button class="win-ctrl" data-action="minimize" title="Minimize">─</button>' +
          '<button class="win-ctrl" data-action="maximize" title="Maximize">□</button>' +
          '<button class="win-ctrl close" data-action="close" title="Close">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="window-body"></div>' +
      '<div class="resize-handle rh-n"></div>' +
      '<div class="resize-handle rh-s"></div>' +
      '<div class="resize-handle rh-e"></div>' +
      '<div class="resize-handle rh-w"></div>' +
      '<div class="resize-handle rh-ne"></div>' +
      '<div class="resize-handle rh-nw"></div>' +
      '<div class="resize-handle rh-se"></div>' +
      '<div class="resize-handle rh-sw"></div>';

    document.body.appendChild(el);

    var body = el.querySelector('.window-body');
    if (app.render) app.render(body, id);

    setupWindowDrag(el);
    setupWindowResize(el);
    setupWindowControls(el, id);

    el.addEventListener('mousedown', function () { focusWindow(id); });
    el.addEventListener('touchstart', function () { focusWindow(id); }, { passive: true });

    openWindows.set(id, {
      el: el,
      app: appId,
      minimized: false,
      maximized: false,
      prevRect: null
    });

    setTimeout(function () { el.classList.remove('opening'); }, 10);
    updateTaskbar();
  }

  function closeWindow(id) {
    var win = openWindows.get(id);
    if (!win) return;

    win.el.style.opacity = '0';
    win.el.style.transform = 'scale(0.9)';

    setTimeout(function () {
      win.el.remove();
      openWindows.delete(id);
      updateTaskbar();
    }, 150);
  }

  function focusWindow(id) {
    var win = openWindows.get(id);
    if (!win) return;

    win.el.style.zIndex = ++zIndex;

    var btns = document.querySelectorAll('.tb-btn');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');

    var tbBtn = document.querySelector('.tb-btn[data-win="' + id + '"]');
    if (tbBtn) tbBtn.classList.add('active');
  }

  // ============================================================
  // WINDOW DRAG
  // ============================================================
  function setupWindowDrag(el) {
    var titlebar = el.querySelector('.window-titlebar');
    var dragging = false;
    var startX = 0, startY = 0, startLeft = 0, startTop = 0;

    function onStart(e) {
      var win = openWindows.get(el.dataset.id);
      if (win && win.maximized) return;
      if (e.target.closest('.win-ctrl')) return;

      dragging = true;
      var cx = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
      var cy = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;

      startX = cx;
      startY = cy;
      startLeft = parseInt(el.style.left) || 0;
      startTop = parseInt(el.style.top) || 0;

      el.classList.add('dragging');
      document.body.style.cursor = 'move';
    }

    function onMove(e) {
      if (!dragging) return;

      var cx = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
      var cy = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;

      var dx = cx - startX;
      var dy = cy - startY;

      var newLeft = startLeft + dx;
      var newTop = startTop + dy;

      // Snap preview
      var snapPreview = document.getElementById('snapPreview');
      var edge = 20;
      var snap = null;

      if (cx < edge) snap = 'left';
      else if (cx > window.innerWidth - edge) snap = 'right';
      else if (cy < edge) snap = 'top';

      if (snap) {
        snapPreview.style.display = 'block';
        if (snap === 'left') {
          snapPreview.style.left = '0px';
          snapPreview.style.top = '0px';
          snapPreview.style.width = '50%';
          snapPreview.style.height = 'calc(100vh - 48px)';
        } else if (snap === 'right') {
          snapPreview.style.left = '50%';
          snapPreview.style.top = '0px';
          snapPreview.style.width = '50%';
          snapPreview.style.height = 'calc(100vh - 48px)';
        } else {
          snapPreview.style.left = '0px';
          snapPreview.style.top = '0px';
          snapPreview.style.width = '100%';
          snapPreview.style.height = 'calc(100vh - 48px)';
        }
      } else {
        snapPreview.style.display = 'none';
      }

      newLeft = Math.max(-el.offsetWidth + 100, Math.min(window.innerWidth - 100, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - 50, newTop));

      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('dragging');
      document.body.style.cursor = '';

      var snapPreview = document.getElementById('snapPreview');
      if (snapPreview.style.display === 'block') {
        var win = openWindows.get(el.dataset.id);
        win.prevRect = {
          left: el.style.left,
          top: el.style.top,
          width: el.style.width,
          height: el.style.height
        };
        el.classList.add('snapping');
        el.style.left = snapPreview.style.left;
        el.style.top = snapPreview.style.top;
        el.style.width = snapPreview.style.width;
        el.style.height = snapPreview.style.height;
        snapPreview.style.display = 'none';
        setTimeout(function () { el.classList.remove('snapping'); }, 200);
      }
    }

    titlebar.addEventListener('mousedown', onStart);
    titlebar.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);

    titlebar.addEventListener('dblclick', function () {
      var btn = el.querySelector('[data-action="maximize"]');
      if (btn) btn.click();
    });
  }

  // ============================================================
  // WINDOW RESIZE
  // ============================================================
  function setupWindowResize(el) {
    var handles = el.querySelectorAll('.resize-handle');

    handles.forEach(function (handle) {
      var resizing = false;
      var startX = 0, startY = 0, startW = 0, startH = 0, startL = 0, startT = 0;
      var dir = '';

      function onStart(e) {
        e.stopPropagation();
        resizing = true;

        var cx = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
        var cy = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;

        startX = cx;
        startY = cy;
        startW = el.offsetWidth;
        startH = el.offsetHeight;
        startL = parseInt(el.style.left) || 0;
        startT = parseInt(el.style.top) || 0;

        if (handle.classList.contains('rh-n')) dir = 'n';
        else if (handle.classList.contains('rh-s')) dir = 's';
        else if (handle.classList.contains('rh-e')) dir = 'e';
        else if (handle.classList.contains('rh-w')) dir = 'w';
        else if (handle.classList.contains('rh-ne')) dir = 'ne';
        else if (handle.classList.contains('rh-nw')) dir = 'nw';
        else if (handle.classList.contains('rh-se')) dir = 'se';
        else if (handle.classList.contains('rh-sw')) dir = 'sw';
      }

      function onMove(e) {
        if (!resizing) return;

        var cx = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
        var cy = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;

        var dx = cx - startX;
        var dy = cy - startY;

        var w = startW, h = startH, l = startL, t = startT;

        if (dir.indexOf('e') !== -1) w = Math.max(320, startW + dx);
        if (dir.indexOf('s') !== -1) h = Math.max(200, startH + dy);
        if (dir.indexOf('w') !== -1) { w = Math.max(320, startW - dx); l = startL + (startW - w); }
        if (dir.indexOf('n') !== -1) { h = Math.max(200, startH - dy); t = startT + (startH - h); }

        el.style.width = w + 'px';
        el.style.height = h + 'px';
        el.style.left = l + 'px';
        el.style.top = t + 'px';
      }

      function onEnd() {
        resizing = false;
      }

      handle.addEventListener('mousedown', onStart);
      handle.addEventListener('touchstart', onStart, { passive: true });
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: true });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
    });
  }

  // ============================================================
  // WINDOW CONTROLS (min / max / close)
  // ============================================================
  function setupWindowControls(el, id) {
    var ctrls = el.querySelectorAll('.win-ctrl');

    ctrls.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();

        var action = btn.dataset.action;
        var win = openWindows.get(id);
        if (!win) return;

        if (action === 'close') {
          closeWindow(id);
        } else if (action === 'minimize') {
          win.minimized = true;
          el.classList.add('minimized');
          updateTaskbar();
        } else if (action === 'maximize') {
          if (win.maximized) {
            el.style.left = win.prevRect.left;
            el.style.top = win.prevRect.top;
            el.style.width = win.prevRect.width;
            el.style.height = win.prevRect.height;
            el.classList.remove('maximized');
            win.maximized = false;
          } else {
            win.prevRect = {
              left: el.style.left,
              top: el.style.top,
              width: el.style.width,
              height: el.style.height
            };
            el.style.left = '0px';
            el.style.top = '0px';
            el.style.width = '100vw';
            el.style.height = 'calc(100vh - 48px)';
            el.classList.add('maximized');
            win.maximized = true;
          }
          updateTaskbar();
        }
      });
    });
  }

  // ============================================================
  // TASKBAR
  // ============================================================
  function updateTaskbar() {
    var container = document.getElementById('taskbarApps');
    container.innerHTML = '';

    openWindows.forEach(function (win, id) {
      var app = APPS[win.app];
      var btn = document.createElement('button');
      btn.className = 'tb-btn running';
      btn.dataset.win = id;
      btn.innerHTML = app.icon;
      btn.title = app.name;

      btn.addEventListener('click', function () {
        var w = openWindows.get(id);
        if (!w) return;

        if (w.minimized) {
          w.minimized = false;
          w.el.classList.remove('minimized');
          focusWindow(id);
        } else if (parseInt(w.el.style.zIndex) === zIndex) {
          w.minimized = true;
          w.el.classList.add('minimized');
        } else {
          focusWindow(id);
        }
        updateTaskbar();
      });

      container.appendChild(btn);
    });

    // Mark top window as active
    var highest = 0;
    var highestId = null;

    openWindows.forEach(function (win, id) {
      var z = parseInt(win.el.style.zIndex) || 0;
      if (!win.minimized && z > highest) {
        highest = z;
        highestId = id;
      }
    });

    if (highestId) {
      var activeBtn = container.querySelector('[data-win="' + highestId + '"]');
      if (activeBtn) {
        activeBtn.classList.remove('running');
        activeBtn.classList.add('active');
      }
    }
  }

  // ============================================================
  // CLOCK
  // ============================================================
  function updateClock() {
    var now = new Date();
    document.getElementById('clockTime').textContent = formatTime(now);
    document.getElementById('clockDate').textContent = formatDate(now);
  }

  // ============================================================
  // START MENU
  // ============================================================
  var startBtn = document.getElementById('startBtn');
  var startMenu = document.getElementById('startMenu');

  function toggleStartMenu() {
    startMenu.classList.toggle('open');
  }

  function closeStartMenu() {
    startMenu.classList.remove('open');
  }

  startBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleStartMenu();
  });

  document.getElementById('startSearch').addEventListener('input', function (e) {
    var q = e.target.value.toLowerCase().trim();
    var apps = document.querySelectorAll('.start-app');
    apps.forEach(function (el) {
      var name = el.textContent.toLowerCase();
      el.style.display = name.indexOf(q) !== -1 ? '' : 'none';
    });
  });

  document.getElementById('allAppsBtn').addEventListener('click', function () {
    showToast('Fitur semua aplikasi segera hadir', '📦', 'Windows 11');
  });

  // ============================================================
  // POWER
  // ============================================================
  document.getElementById('powerBtn').addEventListener('click', function () {
    if (confirm('Matikan komputer?')) {
      doShutdown();
    }
  });

  function doShutdown() {
    document.body.style.transition = 'opacity 1s';
    document.body.style.opacity = '0';

    setTimeout(function () {
      document.body.innerHTML =
        '<div style="width:100vw;height:100vh;background:#000;display:flex;' +
        'align-items:center;justify-content:center;color:white;' +
        'font-family:Segoe UI,sans-serif;font-size:24px;flex-direction:column;gap:20px;">' +
        '<div>Windows sedang dimatikan...</div>' +
        '<div style="font-size:14px;opacity:0.5;">Anda dapat menutup tab ini</div>' +
        '</div>';
    }, 1000);
  }

  // ============================================================
  // TOAST NOTIFICATIONS
  // ============================================================
  function showToast(msg, icon, title) {
    icon = icon || 'ℹ️';
    title = title || 'Windows';

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<div class="toast-icon">' + icon + '</div>' +
      '<div class="toast-content">' +
        '<div class="toast-title">' + title + '</div>' +
        '<div class="toast-msg">' + msg + '</div>' +
      '</div>';

    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(400px)';

      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);

    addNotification(title, msg, icon);
  }

  function addNotification(title, msg, icon) {
    notifications.unshift({
      title: title,
      msg: msg,
      icon: icon,
      time: new Date()
    });
    renderNotifications();
  }

  function renderNotifications() {
    var list = document.getElementById('notifList');

    if (notifications.length === 0) {
      list.innerHTML = '<div class="notif-empty">Tidak ada notifikasi baru</div>';
      return;
    }

    var html = '';
    var slice = notifications.slice(0, 10);

    for (var i = 0; i < slice.length; i++) {
      var n = slice[i];
      html +=
        '<div class="notif-item">' +
          '<div class="notif-item-title">' + n.icon + ' ' + n.title + '</div>' +
          '<div>' + n.msg + '</div>' +
          '<div class="notif-item-time">' + n.time.toLocaleTimeString('id-ID') + '</div>' +
        '</div>';
    }

    list.innerHTML = html;
  }

  document.getElementById('clearNotifsBtn').addEventListener('click', function () {
    notifications.length = 0;
    renderNotifications();
  });

  // ============================================================
  // CALENDAR
  // ============================================================
  function renderCalendar() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var today = now.getDate();

    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var dayNames = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
    var monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    var html = '<div class="cal-header"><span>' + monthNames[month] + ' ' + year + '</span></div>';
    html += '<div class="cal-days">';

    for (var i = 0; i < dayNames.length; i++) {
      html += '<div class="cal-head">' + dayNames[i] + '</div>';
    }

    for (var j = 0; j < firstDay; j++) {
      html += '<div></div>';
    }

    for (var d = 1; d <= daysInMonth; d++) {
      html += '<div class="cal-day' + (d === today ? ' today' : '') + '">' + d + '</div>';
    }

    html += '</div>';
    document.getElementById('calendar').innerHTML = html;
  }

  // ============================================================
  // QUICK SETTINGS
  // ============================================================
  function renderQuickSettings() {
    var grid = document.getElementById('qsGrid');

    grid.innerHTML =
      '<button class="qs-tile active" data-toggle="wifi"><span class="qs-tile-icon">📶</span><span>WiFi</span></button>' +
      '<button class="qs-tile active" data-toggle="bt"><span class="qs-tile-icon">🔵</span><span>Bluetooth</span></button>' +
      '<button class="qs-tile" data-toggle="airplane"><span class="qs-tile-icon">✈️</span><span>Mode Pesawat</span></button>' +
      '<button class="qs-tile active" data-toggle="night"><span class="qs-tile-icon">🌙</span><span>Cahaya Malam</span></button>' +
      '<button class="qs-tile" data-toggle="theme"><span class="qs-tile-icon">🌓</span><span>Ganti Tema</span></button>' +
      '<button class="qs-tile" data-toggle="fullscreen"><span class="qs-tile-icon">⛶</span><span>Layar Penuh</span></button>';

    grid.querySelectorAll('.qs-tile').forEach(function (tile) {
      tile.addEventListener('click', function () {
        var t = tile.dataset.toggle;

        if (t === 'theme') {
          toggleTheme();
        } else if (t === 'fullscreen') {
          toggleFullscreen();
        } else {
          tile.classList.toggle('active');
        }
      });
    });

    document.getElementById('volSlider').addEventListener('input', function (e) {
      volume = parseInt(e.target.value, 10);
      document.getElementById('volValue').textContent = volume + '%';
      localStorage.setItem('win11_vol', volume);
      updateVolIcon();
    });

    document.getElementById('brightSlider').addEventListener('input', function (e) {
      brightness = parseInt(e.target.value, 10);
      document.getElementById('brightValue').textContent = brightness + '%';
      localStorage.setItem('win11_bright', brightness);
      document.getElementById('desktop').style.filter = 'brightness(' + (brightness / 100) + ')';
    });

    document.getElementById('volSlider').value = volume;
    document.getElementById('volValue').textContent = volume + '%';
    document.getElementById('brightSlider').value = brightness;
    document.getElementById('brightValue').textContent = brightness + '%';
    document.getElementById('desktop').style.filter = 'brightness(' + (brightness / 100) + ')';
  }

  function updateVolIcon() {
    var icon = volume === 0 ? '🔇' : (volume < 40 ? '🔉' : '🔊');
    document.getElementById('trayVol').textContent = icon;
  }

  // ============================================================
  // THEME
  // ============================================================
  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('win11_theme', theme);
    document.body.classList.toggle('light', theme === 'light');
    showToast('Tema: ' + (theme === 'dark' ? 'Gelap' : 'Terang'), '🎨');
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  }

  // ============================================================
  // COMMAND PALETTE
  // ============================================================
  var cmdPalette = document.getElementById('cmdPalette');
  var cmdInput = document.getElementById('cmdInput');
  var cmdResults = document.getElementById('cmdResults');

  function openCmdPalette() {
    cmdPalette.classList.add('open');
    cmdInput.value = '';
    cmdInput.focus();
    renderCmdResults('');
  }

  function closeCmdPalette() {
    cmdPalette.classList.remove('open');
  }

  function renderCmdResults(query) {
    var q = query.toLowerCase().trim();
    var items = Object.keys(APPS).filter(function (id) {
      if (!q) return true;
      return APPS[id].name.toLowerCase().indexOf(q) !== -1 || id.indexOf(q) !== -1;
    });

    if (items.length === 0) {
      cmdResults.innerHTML = '<div class="cmd-item">Tidak ada hasil</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < items.length; i++) {
      var id = items[i];
      html +=
        '<div class="cmd-item" data-app="' + id + '">' +
          '<span class="cmd-item-icon">' + APPS[id].icon + '</span>' +
          '<span>' + APPS[id].name + '</span>' +
        '</div>';
    }
    cmdResults.innerHTML = html;

    cmdResults.querySelectorAll('.cmd-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var appId = item.dataset.app;
        if (appId) {
          openApp(appId);
          closeCmdPalette();
        }
      });
    });
  }

  cmdInput.addEventListener('input', function (e) {
    renderCmdResults(e.target.value);
  });

  // ============================================================
  // TASK VIEW
  // ============================================================
  var taskView = document.getElementById('taskView');

  function openTaskView() {
    taskView.innerHTML = '';

    if (openWindows.size === 0) {
      taskView.innerHTML = '<div class="tv-empty">Tidak ada window terbuka</div>';
    }

    openWindows.forEach(function (win, id) {
      var app = APPS[win.app];
      var card = document.createElement('div');
      card.className = 'tv-card';
      card.innerHTML =
        '<div class="tv-preview">' + app.icon + '</div>' +
        '<div class="tv-title">' + app.icon + ' ' + app.name + '</div>';

      card.addEventListener('click', function () {
        if (win.minimized) {
          win.minimized = false;
          win.el.classList.remove('minimized');
        }
        focusWindow(id);
        taskView.classList.remove('open');
      });

      taskView.appendChild(card);
    });

    taskView.classList.add('open');
  }

  taskView.addEventListener('click', function (e) {
    if (e.target === taskView) taskView.classList.remove('open');
  });

  // ============================================================
  // ALT + TAB
  // ============================================================
  var altTabIndex = 0;
  var altTab = document.getElementById('altTab');

  function showAltTab() {
    altTab.innerHTML = '';
    var windows = [];

    openWindows.forEach(function (win, id) {
      windows.push({ id: id, win: win });
    });

    if (windows.length === 0) return;

    for (var i = 0; i < windows.length; i++) {
      var item = windows[i];
      var app = APPS[item.win.app];
      var el = document.createElement('div');
      el.className = 'alt-tab-item' + (i === altTabIndex % windows.length ? ' active' : '');
      el.innerHTML = app.icon + '<div class="alt-tab-name">' + app.name + '</div>';

      el.addEventListener('click', function (id) {
        return function () {
          var w = openWindows.get(id);
          if (w) {
            if (w.minimized) {
              w.minimized = false;
              w.el.classList.remove('minimized');
            }
            focusWindow(id);
          }
          altTab.classList.remove('open');
        };
      }(item.id));

      altTab.appendChild(el);
    }

    altTab.classList.add('open');
  }

  // ============================================================
  // SYSTEM TRAY CLICKS
  // ============================================================
  document.getElementById('trayWifi').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('quickSettings').classList.toggle('open');
    document.getElementById('notifCenter').classList.remove('open');
  });

  document.getElementById('trayVol').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('quickSettings').classList.toggle('open');
    document.getElementById('notifCenter').classList.remove('open');
  });

  document.getElementById('trayBattery').addEventListener('click', function (e) {
    e.stopPropagation();
    showToast('Baterai: 87% (perkiraan 5 jam 23 menit)', '🔋', 'Daya');
  });

  document.getElementById('clock').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('notifCenter').classList.toggle('open');
    document.getElementById('quickSettings').classList.remove('open');
  });

  // ============================================================
  // CONTEXT MENU
  // ============================================================
  var contextMenu = document.getElementById('contextMenu');

  document.getElementById('desktop').addEventListener('contextmenu', function (e) {
    e.preventDefault();
    contextMenu.style.left = Math.min(e.clientX, window.innerWidth - 220) + 'px';
    contextMenu.style.top = Math.min(e.clientY, window.innerHeight - 300) + 'px';
    contextMenu.classList.add('open');
  });

  contextMenu.querySelectorAll('.context-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var action = item.dataset.action;

      if (action === 'refresh') {
        document.getElementById('desktop').style.opacity = '0';
        setTimeout(function () {
          document.getElementById('desktop').style.opacity = '1';
        }, 100);
        showToast('Desktop disegarkan', '🔄');
      } else if (action === 'settings') {
        openApp('settings');
      } else if (action === 'terminal') {
        openApp('terminal');
      } else if (action === 'vscode') {
        openApp('vscode');
      } else if (action === 'cmdpalette') {
        openCmdPalette();
      } else if (action === 'taskview') {
        openTaskView();
      } else if (action === 'theme') {
        toggleTheme();
      } else if (action === 'fullscreen') {
        toggleFullscreen();
      }

      contextMenu.classList.remove('open');
    });
  });

  // ============================================================
  // GLOBAL CLICK HANDLER
  // ============================================================
  document.addEventListener('click', function (e) {
    if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
      closeStartMenu();
    }
    if (!cmdPalette.contains(e.target)) {
      closeCmdPalette();
    }
    if (!document.getElementById('quickSettings').contains(e.target) &&
        !document.getElementById('trayVol').contains(e.target) &&
        !document.getElementById('trayWifi').contains(e.target)) {
      document.getElementById('quickSettings').classList.remove('open');
    }
    if (!document.getElementById('notifCenter').contains(e.target) &&
        !document.getElementById('clock').contains(e.target)) {
      document.getElementById('notifCenter').classList.remove('open');
    }
    if (!contextMenu.contains(e.target)) {
      contextMenu.classList.remove('open');
    }
    if (e.target.id === 'desktop' || e.target.closest('.desktop-icons') === null) {
      var selected = document.querySelectorAll('.icon.selected');
      for (var i = 0; i < selected.length; i++) {
        selected[i].classList.remove('selected');
      }
    }
  });

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeStartMenu();
      closeCmdPalette();
      taskView.classList.remove('open');
      contextMenu.classList.remove('open');
      altTab.classList.remove('open');
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCmdPalette();
    }

    if (e.key === 'Meta') {
      e.preventDefault();
      toggleStartMenu();
    }

    if (e.metaKey && e.key === 'Tab') {
      e.preventDefault();
      openTaskView();
    }

    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      altTabIndex++;
      showAltTab();
    }

    if (e.key === 'F5') {
      e.preventDefault();
      document.getElementById('desktop').style.opacity = '0';
      setTimeout(function () {
        document.getElementById('desktop').style.opacity = '1';
      }, 100);
    }
  });

  document.addEventListener('keyup', function (e) {
    if (e.key === 'Alt') {
      altTab.classList.remove('open');
    }
  });

  // ============================================================
  // APP RENDERERS
  // ============================================================

  // ---------- NOTEPAD ----------
  function renderNotepad(body) {
    var ta = document.createElement('textarea');
    ta.className = 'notepad-textarea';
    ta.placeholder = 'Mulai mengetik...';
    ta.value = localStorage.getItem('notepad_content') || '';
    ta.addEventListener('input', function () {
      localStorage.setItem('notepad_content', ta.value);
    });
    body.appendChild(ta);
  }

  // ---------- CALCULATOR ----------
  function renderCalculator(body) {
    var calc = document.createElement('div');
    calc.className = 'calc';
    calc.innerHTML =
      '<div class="calc-display" data-display>0</div>' +
      '<div class="calc-grid">' +
        '<button class="calc-btn fn" data-fn="clear">AC</button>' +
        '<button class="calc-btn fn" data-fn="negate">+/−</button>' +
        '<button class="calc-btn fn" data-fn="percent">%</button>' +
        '<button class="calc-btn" data-op="/">÷</button>' +
        '<button class="calc-btn" data-num="7">7</button>' +
        '<button class="calc-btn" data-num="8">8</button>' +
        '<button class="calc-btn" data-num="9">9</button>' +
        '<button class="calc-btn" data-op="*">×</button>' +
        '<button class="calc-btn" data-num="4">4</button>' +
        '<button class="calc-btn" data-num="5">5</button>' +
        '<button class="calc-btn" data-num="6">6</button>' +
        '<button class="calc-btn" data-op="-">−</button>' +
        '<button class="calc-btn" data-num="1">1</button>' +
        '<button class="calc-btn" data-num="2">2</button>' +
        '<button class="calc-btn" data-num="3">3</button>' +
        '<button class="calc-btn" data-op="+">+</button>' +
        '<button class="calc-btn" data-num="0" style="grid-column: span 2;">0</button>' +
        '<button class="calc-btn" data-num=".">.</button>' +
        '<button class="calc-btn eq" data-eq>=</button>' +
      '</div>';

    body.appendChild(calc);

    var display = calc.querySelector('[data-display]');
    var current = '0';
    var prev = null;
    var op = null;
    var justEvaluated = false;

    function updateDisplay() {
      display.textContent = current;
      if (current.length > 10) {
        display.classList.add('small');
      } else {
        display.classList.remove('small');
      }
    }

    function inputNum(n) {
      if (justEvaluated) {
        current = '0';
        justEvaluated = false;
      }
      if (n === '.' && current.indexOf('.') !== -1) return;
      current = (current === '0' && n !== '.') ? n : current + n;
      updateDisplay();
    }

    function inputOp(o) {
      if (op && prev !== null && current !== '') {
        evaluate();
      }
      prev = parseFloat(current);
      op = o;
      current = '0';
      justEvaluated = false;
    }

    function evaluate() {
      if (op === null || prev === null) return;

      var cur = parseFloat(current);
      var result;

      switch (op) {
        case '+': result = prev + cur; break;
        case '-': result = prev - cur; break;
        case '*': result = prev * cur; break;
        case '/': result = cur === 0 ? 'Error' : prev / cur; break;
        default: return;
      }

      if (typeof result === 'number') {
        current = String(Math.round(result * 1e10) / 1e10);
      } else {
        current = result;
      }

      prev = null;
      op = null;
      justEvaluated = true;
      updateDisplay();
    }

    function clear() {
      current = '0';
      prev = null;
      op = null;
      justEvaluated = false;
      updateDisplay();
    }

    function negate() {
      if (current !== '0') {
        current = current.charAt(0) === '-' ? current.slice(1) : '-' + current;
      }
      updateDisplay();
    }

    function percent() {
      current = String(parseFloat(current) / 100);
      updateDisplay();
    }

    calc.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;

      if (btn.dataset.num !== undefined) inputNum(btn.dataset.num);
      else if (btn.dataset.op !== undefined) inputOp(btn.dataset.op);
      else if (btn.dataset.eq !== undefined) evaluate();
      else if (btn.dataset.fn) {
        if (btn.dataset.fn === 'clear') clear();
        else if (btn.dataset.fn === 'negate') negate();
        else if (btn.dataset.fn === 'percent') percent();
      }
    });
  }

  // ---------- TERMINAL ----------
  function renderTerminal(body) {
    var term = document.createElement('div');
    term.className = 'terminal';
    term.innerHTML =
      '<div class="terminal-line terminal-info">Microsoft Windows [Versi 10.0.22631.2861]</div>' +
      '<div class="terminal-line terminal-info">(c) Microsoft Corporation. Semua hak dilindungi.</div>' +
      '<div class="terminal-line">&nbsp;</div>' +
      '<div class="terminal-output"></div>' +
      '<div class="terminal-line">' +
        '<span class="terminal-prompt">C:\\Users\\Rabi&gt;</span>' +
        '<input class="terminal-input" autofocus spellcheck="false">' +
      '</div>';

    body.appendChild(term);

    var output = term.querySelector('.terminal-output');
    var input = term.querySelector('.terminal-input');

    function appendLine(text, cls) {
      var line = document.createElement('div');
      line.className = 'terminal-line' + (cls ? ' ' + cls : '');
      line.textContent = text;
      output.appendChild(line);
      term.scrollTop = term.scrollHeight;
    }

    function runCommand(cmd) {
      appendLine('C:\\Users\\Rabi> ' + cmd);

      var parts = cmd.trim().split(/\s+/);
      var c = parts[0].toLowerCase();
      var args = parts.slice(1);

      if (!c) return;

      switch (c) {
        case 'help':
          appendLine('Perintah yang tersedia:');
          appendLine('  help       Tampilkan bantuan');
          appendLine('  dir        Daftar file');
          appendLine('  cls        Bersihkan layar');
          appendLine('  echo       Tampilkan pesan');
          appendLine('  date       Tanggal');
          appendLine('  time       Waktu');
          appendLine('  whoami     Pengguna saat ini');
          appendLine('  ver        Versi Windows');
          appendLine('  systeminfo Info sistem');
          appendLine('  calc       Buka Kalkulator');
          appendLine('  notepad    Buka Notepad');
          appendLine('  paint      Buka Paint');
          appendLine('  vscode     Buka VS Code');
          appendLine('  exit       Tutup terminal');
          break;
        case 'dir':
          appendLine(' Volume in drive C has no label.');
          appendLine('');
          appendLine(' Directory of C:\\Users\\Rabi');
          appendLine('');
          appendLine('01/01/2024  12:00 PM    <DIR>          Documents');
          appendLine('01/01/2024  12:00 PM    <DIR>          Downloads');
          appendLine('01/01/2024  12:00 PM    <DIR>          Pictures');
          appendLine('01/01/2024  12:00 PM    <DIR>          Music');
          appendLine('01/01/2024  12:00 PM             1,024 notes.txt');
          break;
        case 'cls':
          output.innerHTML = '';
          break;
        case 'echo':
          appendLine(args.join(' '));
          break;
        case 'date':
          appendLine('Tanggal: ' + new Date().toLocaleDateString('id-ID'));
          break;
        case 'time':
          appendLine('Waktu: ' + new Date().toLocaleTimeString('id-ID'));
          break;
        case 'whoami':
          appendLine('desktop-rabi\\rabi');
          break;
        case 'ver':
          appendLine('');
          appendLine('Microsoft Windows [Version 10.0.22631.2861]');
          break;
        case 'systeminfo':
          appendLine('Host Name:                 DESKTOP-RABI');
          appendLine('OS Name:                   Microsoft Windows 11 Pro');
          appendLine('OS Version:                10.0.22631');
          appendLine('System Type:               x64-based PC');
          appendLine('Total Physical Memory:     16,384 MB');
          appendLine('Available Physical Memory: 8,192 MB');
          break;
        case 'exit':
          var termWin = null;
          openWindows.forEach(function (w, id) {
            if (w.app === 'terminal') termWin = id;
          });
          if (termWin) closeWindow(termWin);
          break;
        case 'calc':
          appendLine('Membuka Kalkulator...');
          openApp('calculator');
          break;
        case 'notepad':
          appendLine('Membuka Notepad...');
          openApp('notepad');
          break;
        case 'paint':
          appendLine('Membuka Paint...');
          openApp('paint');
          break;
        case 'vscode':
          appendLine('Membuka VS Code...');
          openApp('vscode');
          break;
        default:
          appendLine("'" + c + "' tidak dikenali sebagai perintah internal atau eksternal.", 'terminal-error');
      }

      appendLine('');
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        runCommand(input.value);
        input.value = '';
      }
    });

    term.addEventListener('click', function () { input.focus(); });
    setTimeout(function () { input.focus(); }, 100);
  }

  // ---------- FILE EXPLORER ----------
  function renderExplorer(body) {
    var files = [
      { name: 'Documents', icon: '📁' },
      { name: 'Downloads', icon: '📁' },
      { name: 'Pictures', icon: '📁' },
      { name: 'Music', icon: '📁' },
      { name: 'Videos', icon: '📁' },
      { name: 'Desktop', icon: '📁' },
      { name: 'catatan.txt', icon: '📄' },
      { name: 'gambar.png', icon: '🖼️' },
      { name: 'musik.mp3', icon: '🎵' },
      { name: 'video.mp4', icon: '🎬' },
      { name: 'program.exe', icon: '⚙️' },
      { name: 'README.md', icon: '📝' }
    ];

    var explorer = document.createElement('div');
    explorer.className = 'explorer';
    explorer.innerHTML =
      '<div class="explorer-toolbar">' +
        '<span>←</span><span>→</span><span>↑</span>' +
        '<div class="explorer-path">📁 C:\\Users\\Rabi</div>' +
        '<span>🔍</span>' +
      '</div>' +
      '<div class="explorer-grid"></div>';

    body.appendChild(explorer);

    var grid = explorer.querySelector('.explorer-grid');

    files.forEach(function (f) {
      var item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = '<div class="file-icon">' + f.icon + '</div><div>' + f.name + '</div>';

      item.addEventListener('dblclick', function () {
        if (f.name === 'catatan.txt') openApp('notepad');
        else if (f.name === 'musik.mp3') openApp('music');
        else showToast('Membuka: ' + f.name, f.icon, 'File Explorer');
      });

      grid.appendChild(item);
    });
  }

  // ---------- PAINT ----------
  function renderPaint(body) {
    var colors = ['#000000', '#e74856', '#ff8c00', '#ffd700', '#16c60c', '#0078d4', '#8a2be2', '#ffffff'];

    var container = document.createElement('div');
    container.className = 'paint-container';

    var colorHTML = '';
    for (var i = 0; i < colors.length; i++) {
      colorHTML += '<div class="paint-color' + (i === 0 ? ' active' : '') +
                   '" data-color="' + colors[i] + '" style="background:' + colors[i] +
                   (colors[i] === '#ffffff' ? ';border:1px solid #666' : '') + ';"></div>';
    }

    container.innerHTML =
      '<div class="paint-toolbar">' +
        '<div style="display:flex;gap:6px;align-items:center;">' +
          '<span style="color:var(--text-secondary);font-size:12px;">Warna:</span>' +
          colorHTML +
        '</div>' +
        '<div style="display:flex;gap:6px;align-items:center;margin-left:12px;">' +
          '<span style="color:var(--text-secondary);font-size:12px;">Ukuran:</span>' +
          '<input type="range" min="1" max="50" value="5" id="paintSize" style="width:80px;">' +
        '</div>' +
        '<button class="paint-btn" id="paintClear" style="margin-left:auto;">Bersihkan</button>' +
      '</div>' +
      '<canvas class="paint-canvas"></canvas>';

    body.appendChild(container);

    var canvas = container.querySelector('.paint-canvas');
    var ctx = canvas.getContext('2d');
    var color = '#000000';
    var size = 5;
    var drawing = false;
    var lastX = 0;
    var lastY = 0;

    function initCanvas() {
      var rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    setTimeout(initCanvas, 50);

    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var cx = e.clientX !== undefined ? e.clientX : (e.touches ? e.touches[0].clientX : 0);
      var cy = e.clientY !== undefined ? e.clientY : (e.touches ? e.touches[0].clientY : 0);
      return { x: cx - rect.left, y: cy - rect.top };
    }

    function startDraw(e) {
      e.preventDefault();
      drawing = true;
      var p = getPos(e);
      lastX = p.x;
      lastY = p.y;
    }

    function draw(e) {
      if (!drawing) return;
      e.preventDefault();
      var p = getPos(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastX = p.x;
      lastY = p.y;
    }

    function endDraw() {
      drawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', endDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    document.addEventListener('touchend', endDraw);

    container.querySelectorAll('.paint-color').forEach(function (c) {
      c.addEventListener('click', function () {
        color = c.dataset.color;
        container.querySelectorAll('.paint-color').forEach(function (x) {
          x.classList.remove('active');
        });
        c.classList.add('active');
      });
    });

    document.getElementById('paintSize').addEventListener('input', function (e) {
      size = parseInt(e.target.value, 10);
    });

    document.getElementById('paintClear').addEventListener('click', function () {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  }

  // ---------- SETTINGS ----------
  function renderSettings(body) {
    var settings = document.createElement('div');
    settings.className = 'settings';
    settings.innerHTML =
      '<div class="settings-sidebar">' +
        '<div class="settings-item active" data-page="system">💻 Sistem</div>' +
        '<div class="settings-item" data-page="personalization">🎨 Personalisasi</div>' +
        '<div class="settings-item" data-page="network">🌐 Jaringan</div>' +
        '<div class="settings-item" data-page="accounts">👤 Akun</div>' +
        '<div class="settings-item" data-page="privacy">🔒 Privasi</div>' +
        '<div class="settings-item" data-page="update">🔄 Pembaruan</div>' +
        '<div class="settings-item" data-page="about">ℹ️ Tentang</div>' +
      '</div>' +
      '<div class="settings-content"></div>';

    body.appendChild(settings);

    var pages = {
      system: {
        title: 'Sistem',
        rows: [
          ['Nama perangkat', 'DESKTOP-RABI'],
          ['Prosesor', 'Intel Core i7 (Virtual)'],
          ['RAM terpasang', '16,0 GB'],
          ['Penyimpanan', '256 GB SSD'],
          ['Arsitektur', '64-bit'],
          ['Windows', 'Windows 11 Pro 23H2']
        ]
      },
      personalization: {
        title: 'Personalisasi',
        rows: [
          ['Tema', theme === 'dark' ? 'Gelap' : 'Terang', 'theme-select'],
          ['Warna aksen', accentColor, 'accent-picker'],
          ['Efek transparansi', 'Aktif'],
          ['Animasi', 'Aktif']
        ]
      },
      network: {
        title: 'Jaringan',
        rows: [
          ['Status', 'Terhubung'],
          ['SSID', 'Home-WiFi'],
          ['IP Address', '192.168.1.100'],
          ['Kecepatan', '150 Mbps']
        ]
      },
      accounts: {
        title: 'Akun',
        rows: [
          ['Nama', 'Rabi'],
          ['Email', 'rabi@example.com'],
          ['Tipe', 'Administrator']
        ]
      },
      privacy: {
        title: 'Privasi',
        rows: [
          ['Diagnostik', 'Diperlukan'],
          ['Lokasi', 'Nonaktif'],
          ['Kamera', 'Nonaktif'],
          ['Mikrofon', 'Nonaktif']
        ]
      },
      update: {
        title: 'Pembaruan Windows',
        rows: [
          ['Status', 'Terbaru'],
          ['Terakhir diperiksa', 'Hari ini'],
          ['Versi', '23H2']
        ]
      },
      about: {
        title: 'Tentang',
        rows: [
          ['Nama perangkat', 'DESKTOP-RABI'],
          ['Edisi', 'Windows 11 Pro'],
          ['Versi', '23H2'],
          ['Build OS', '22631.2861'],
          ['Simulator', 'HTML Multi-File']
        ]
      }
    };

    function renderPage(key) {
      var page = pages[key];
      var content = settings.querySelector('.settings-content');

      var html = '<h2>' + page.title + '</h2>';

      for (var i = 0; i < page.rows.length; i++) {
        var row = page.rows[i];

        if (row[2] === 'theme-select') {
          html += '<div class="settings-row"><span>' + row[0] + '</span>' +
                  '<select id="themeSelect">' +
                    '<option value="dark"' + (theme === 'dark' ? ' selected' : '') + '>Gelap</option>' +
                    '<option value="light"' + (theme === 'light' ? ' selected' : '') + '>Terang</option>' +
                  '</select></div>';
        } else {
          html += '<div class="settings-row"><span>' + row[0] + '</span><span>' + row[1] + '</span></div>';
        }
      }

      content.innerHTML = html;

      var themeSelect = content.querySelector('#themeSelect');
      if (themeSelect) {
        themeSelect.addEventListener('change', function (e) {
          theme = e.target.value;
          localStorage.setItem('win11_theme', theme);
          document.body.classList.toggle('light', theme === 'light');
        });
      }
    }

    settings.querySelectorAll('.settings-item').forEach(function (item) {
      item.addEventListener('click', function () {
        settings.querySelectorAll('.settings-item').forEach(function (i) {
          i.classList.remove('active');
        });
        item.classList.add('active');
        renderPage(item.dataset.page);
      });
    });

    renderPage('system');
  }

  // ---------- BROWSER ----------
  function renderBrowser(body) {
    var browser = document.createElement('div');
    browser.className = 'browser';
    browser.innerHTML =
      '<div class="browser-toolbar">' +
        '<button class="browser-nav" id="backBtn">←</button>' +
        '<button class="browser-nav" id="reloadBtn">↻</button>' +
        '<input type="text" class="browser-url" value="about:blank" spellcheck="false">' +
      '</div>' +
      '<iframe class="browser-frame" sandbox="allow-scripts allow-same-origin allow-forms" src="about:blank"></iframe>';

    body.appendChild(browser);

    var urlInput = browser.querySelector('.browser-url');
    var frame = browser.querySelector('.browser-frame');

    function navigate() {
      var url = urlInput.value.trim();
      if (!url) return;

      if (!/^https?:\/\//i.test(url) && !/^about:/i.test(url)) {
        if (/^[\w-]+(\.[\w-]+)+/.test(url)) {
          url = 'https://' + url;
        } else {
          url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
        }
      }

      frame.src = url;
      urlInput.value = url;
    }

    urlInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') navigate();
    });

    browser.querySelector('#reloadBtn').addEventListener('click', function () {
      frame.src = frame.src;
    });

    browser.querySelector('#backBtn').addEventListener('click', function () {
      try { frame.contentWindow.history.back(); } catch (e) {}
    });
  }

  // ---------- RECYCLE BIN ----------
  function renderRecycle(body) {
    var r = document.createElement('div');
    r.className = 'recycle';
    r.innerHTML = '<div class="recycle-icon">🗑️</div><div>Recycle Bin kosong</div>';
    body.appendChild(r);
  }

  // ---------- ABOUT ----------
  function renderAbout(body) {
    var a = document.createElement('div');
    a.className = 'about';
    a.innerHTML =
      '<div class="about-icon">💻</div>' +
      '<h2>Windows 11</h2>' +
      '<div class="about-info">' +
        '<div>Edisi: Windows 11 Pro</div>' +
        '<div>Versi: 23H2</div>' +
        '<div>Build OS: 22631.2861</div>' +
        '<div>Simulator HTML Multi-File</div>' +
      '</div>';
    body.appendChild(a);
  }

  // ---------- VS CODE ----------
  function renderVSCode(body) {
    var files = {
      'script.js': '// Windows 11 Simulator\n// File: script.js\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();\n',
      'style.css': '/* Windows 11 Simulator */\n\nbody {\n  background: #1e1e1e;\n  color: #fff;\n  font-family: "Segoe UI";\n}\n',
      'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>Windows 11</title>\n</head>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>\n'
    };

    var vscode = document.createElement('div');
    vscode.className = 'vscode';

    var sidebarHTML = '<div class="vscode-sidebar-title">Explorer</div>';
    Object.keys(files).forEach(function (f) {
      sidebarHTML += '<div class="vscode-file" data-file="' + f + '">📄 ' + f + '</div>';
    });

    vscode.innerHTML =
      '<div class="vscode-sidebar">' + sidebarHTML + '</div>' +
      '<div class="vscode-main">' +
        '<div class="vscode-tabs"></div>' +
        '<div class="vscode-code"><textarea spellcheck="false"></textarea></div>' +
      '</div>';

    body.appendChild(vscode);

    var tabs = vscode.querySelector('.vscode-tabs');
    var textarea = vscode.querySelector('textarea');
    var currentFile = null;

    function openFile(name) {
      currentFile = name;
      tabs.innerHTML = '<div class="vscode-tab active">📄 ' + name + '</div>';
      textarea.value = files[name];

      vscode.querySelectorAll('.vscode-file').forEach(function (f) {
        f.classList.toggle('active', f.dataset.file === name);
      });
    }

    textarea.addEventListener('input', function () {
      if (currentFile) files[currentFile] = textarea.value;
    });

    vscode.querySelectorAll('.vscode-file').forEach(function (f) {
      f.addEventListener('click', function () { openFile(f.dataset.file); });
    });

    openFile('script.js');
  }

  // ---------- MUSIC ----------
  function renderMusic(body) {
    var m = document.createElement('div');
    m.className = 'music';
    m.innerHTML =
      '<div class="music-art" id="musicArt">🎵</div>' +
      '<div class="music-title">Synthwave Dreams</div>' +
      '<div class="music-artist">Rabi · Simulator</div>' +
      '<div class="music-progress" id="musicProgress">' +
        '<div class="music-progress-fill" id="musicFill"></div>' +
      '</div>' +
      '<div class="music-controls">' +
        '<button class="music-btn">⏮</button>' +
        '<button class="music-btn play" id="musicPlay">▶</button>' +
        '<button class="music-btn">⏭</button>' +
      '</div>';

    body.appendChild(m);

    var audioCtx = null;
    var playing = false;
    var interval = null;
    var progress = 0;

    function playNote(freq, dur) {
      if (!audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          return;
        }
      }

      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.05 * (volume / 100), audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    }

    var notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

    document.getElementById('musicPlay').addEventListener('click', function (e) {
      playing = !playing;
      e.target.textContent = playing ? '⏸' : '▶';

      var art = document.getElementById('musicArt');
      if (playing) {
        art.classList.add('playing');
        interval = setInterval(function () {
          var n = notes[Math.floor(Math.random() * notes.length)];
          playNote(n, 0.2);
          progress = (progress + 1) % 100;
          document.getElementById('musicFill').style.width = progress + '%';
        }, 300);
      } else {
        art.classList.remove('playing');
        if (interval) clearInterval(interval);
      }
    });

    document.getElementById('musicProgress').addEventListener('click', function (e) {
      var rect = e.currentTarget.getBoundingClientRect();
      progress = ((e.clientX - rect.left) / rect.width) * 100;
      document.getElementById('musicFill').style.width = progress + '%';
    });
  }

  // ---------- MINESWEEPER ----------
  function renderMinesweeper(body) {
    var ROWS = 9;
    var COLS = 9;
    var MINES = 10;

    var ms = document.createElement('div');
    ms.className = 'minesweeper';
    ms.innerHTML =
      '<div class="ms-header">' +
        '<div class="ms-display" id="msMines">010</div>' +
        '<button class="ms-reset" id="msReset">🙂</button>' +
        '<div class="ms-display" id="msTime">000</div>' +
      '</div>' +
      '<div class="ms-grid" id="msGrid" style="grid-template-columns:repeat(' + COLS + ',22px);"></div>';

    body.appendChild(ms);

    var grid, revealed, flagged, gameOver, firstClick, flagsLeft, time, timer;

    function init() {
      grid = [];
      revealed = [];
      flagged = [];

      for (var r = 0; r < ROWS; r++) {
        grid[r] = [];
        revealed[r] = [];
        flagged[r] = [];
        for (var c = 0; c < COLS; c++) {
          grid[r][c] = 0;
          revealed[r][c] = false;
          flagged[r][c] = false;
        }
      }

      gameOver = false;
      firstClick = true;
      flagsLeft = MINES;
      time = 0;

      document.getElementById('msMines').textContent = String(flagsLeft).padStart(3, '0');
      document.getElementById('msTime').textContent = '000';
      document.getElementById('msReset').textContent = '🙂';

      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        time++;
        document.getElementById('msTime').textContent = String(time).padStart(3, '0');
      }, 1000);

      render();
    }

    function placeMines(sr, sc) {
      var placed = 0;

      while (placed < MINES) {
        var r = Math.floor(Math.random() * ROWS);
        var c = Math.floor(Math.random() * COLS);

        if (grid[r][c] === -1) continue;
        if (Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1) continue;

        grid[r][c] = -1;
        placed++;
      }

      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          if (grid[r][c] === -1) continue;

          var count = 0;
          for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
              var nr = r + dr;
              var nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === -1) {
                count++;
              }
            }
          }
          grid[r][c] = count;
        }
      }
    }

    function reveal(r, c) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      if (revealed[r][c] || flagged[r][c]) return;

      revealed[r][c] = true;

      if (grid[r][c] === 0) {
        for (var dr = -1; dr <= 1; dr++) {
          for (var dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc);
          }
        }
      }
    }

    function checkWin() {
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          if (grid[r][c] !== -1 && !revealed[r][c]) return false;
        }
      }
      return true;
    }

    function render() {
      var g = document.getElementById('msGrid');
      g.innerHTML = '';

      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var cell = document.createElement('div');
          cell.className = 'ms-cell';

          if (revealed[r][c]) {
            cell.classList.add('revealed');

            if (grid[r][c] === -1) {
              cell.classList.add('mine');
              cell.textContent = '💣';
            } else if (grid[r][c] > 0) {
              cell.classList.add('n' + grid[r][c]);
              cell.textContent = grid[r][c];
            }
          } else if (flagged[r][c]) {
            cell.classList.add('flag');
            cell.textContent = '🚩';
          }

          (function (r, c, cell) {
            cell.addEventListener('click', function () {
              if (gameOver) return;

              if (firstClick) {
                placeMines(r, c);
                firstClick = false;
              }

              if (grid[r][c] === -1) {
                revealed[r][c] = true;
                gameOver = true;
                document.getElementById('msReset').textContent = '😵';
                clearInterval(timer);
                render();
                showToast('Kamu kena bom!', '💥', 'Minesweeper');
                return;
              }

              reveal(r, c);
              render();

              if (checkWin()) {
                gameOver = true;
                document.getElementById('msReset').textContent = '😎';
                clearInterval(timer);
                showToast('Kamu menang!', '🏆', 'Minesweeper');
              }
            });

            cell.addEventListener('contextmenu', function (e) {
              e.preventDefault();
              if (gameOver || revealed[r][c]) return;

              flagged[r][c] = !flagged[r][c];
              flagsLeft += flagged[r][c] ? -1 : 1;
              document.getElementById('msMines').textContent = String(flagsLeft).padStart(3, '0');
              render();
            });
          })(r, c, cell);

          g.appendChild(cell);
        }
      }
    }

    document.getElementById('msReset').addEventListener('click', init);
    init();
  }

  // ---------- SNAKE ----------
  function renderSnake(body) {
    var s = document.createElement('div');
    s.className = 'snake';
    s.innerHTML =
      '<canvas class="snake-canvas" width="400" height="400"></canvas>' +
      '<div class="snake-info">' +
        '<span>Skor: <b id="snakeScore">0</b></span>' +
        '<span>Best: <b id="snakeBest">0</b></span>' +
      '</div>' +
      '<div class="snake-hint">Gunakan panah atau W A S D</div>';

    body.appendChild(s);

    var canvas = s.querySelector('.snake-canvas');
    var ctx = canvas.getContext('2d');
    var CELL = 20;
    var COLS = canvas.width / CELL;
    var ROWS = canvas.height / CELL;
    var snake, dir, food, score, best, gameLoop, speed;

    best = parseInt(localStorage.getItem('win11_snake_best') || '0', 10);
    document.getElementById('snakeBest').textContent = best;

    function spawnFood() {
      var f;
      var attempts = 0;

      do {
        f = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS)
        };
        attempts++;
      } while (snake.some(function (sn) { return sn.x === f.x && sn.y === f.y; }) && attempts < 100);

      food = f;
    }

    function tick() {
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        return endGame();
      }

      if (snake.some(function (sn) { return sn.x === head.x && sn.y === head.y; })) {
        return endGame();
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('snakeScore').textContent = score;

        if (score > best) {
          best = score;
          document.getElementById('snakeBest').textContent = best;
          localStorage.setItem('win11_snake_best', best);
        }

        if (speed > 60) {
          speed -= 3;
          clearInterval(gameLoop);
          gameLoop = setInterval(tick, speed);
        }

        spawnFood();
      } else {
        snake.pop();
      }

      draw();
    }

    function draw() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(22,198,12,0.1)';
      for (var i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, canvas.height);
        ctx.stroke();
      }
      for (var j = 0; j <= ROWS; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * CELL);
        ctx.lineTo(canvas.width, j * CELL);
        ctx.stroke();
      }

      ctx.fillStyle = '#ff3b30';
      ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);

      for (var k = 0; k < snake.length; k++) {
        ctx.fillStyle = k === 0 ? '#16c60c' : 'rgba(22,198,12,0.6)';
        ctx.fillRect(snake[k].x * CELL + 1, snake[k].y * CELL + 1, CELL - 2, CELL - 2);
      }
    }

    function endGame() {
      clearInterval(gameLoop);
      showToast('Game over! Skor: ' + score, '🐍', 'Snake');
      setTimeout(init, 800);
    }

    function init() {
      snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      dir = { x: 1, y: 0 };
      score = 0;
      speed = 120;

      document.getElementById('snakeScore').textContent = 0;

      spawnFood();

      if (gameLoop) clearInterval(gameLoop);
      gameLoop = setInterval(tick, speed);

      draw();
    }

    function keyHandler(e) {
      var isOpen = false;
      openWindows.forEach(function (w) {
        if (w.app === 'snake') isOpen = true;
      });

      if (!isOpen) {
        document.removeEventListener('keydown', keyHandler);
        return;
      }

      if (['ArrowUp', 'KeyW'].indexOf(e.code) !== -1) {
        if (dir.y !== 1) dir = { x: 0, y: -1 };
        e.preventDefault();
      } else if (['ArrowDown', 'KeyS'].indexOf(e.code) !== -1) {
        if (dir.y !== -1) dir = { x: 0, y: 1 };
        e.preventDefault();
      } else if (['ArrowLeft', 'KeyA'].indexOf(e.code) !== -1) {
        if (dir.x !== 1) dir = { x: -1, y: 0 };
        e.preventDefault();
      } else if (['ArrowRight', 'KeyD'].indexOf(e.code) !== -1) {
        if (dir.x !== -1) dir = { x: 1, y: 0 };
        e.preventDefault();
      }
    }

    document.addEventListener('keydown', keyHandler);
    init();
  }

  // ---------- STICKY NOTES ----------
  function renderSticky(body) {
    var s = document.createElement('div');
    s.className = 'sticky';
    s.innerHTML = '<button class="sticky-add" id="stickyAdd">+ Catatan Baru</button><div id="stickyList"></div>';
    body.appendChild(s);

    var list = s.querySelector('#stickyList');

    function render() {
      var html = '';

      for (var i = 0; i < stickyNotes.length; i++) {
        html +=
          '<div class="sticky-note">' +
            '<button class="sticky-del" data-i="' + i + '">✕</button>' +
            '<textarea data-i="' + i + '" placeholder="Tulis sesuatu...">' +
              (stickyNotes[i].text || '') +
            '</textarea>' +
          '</div>';
      }

      list.innerHTML = html;

      list.querySelectorAll('textarea').forEach(function (ta) {
        ta.addEventListener('input', function () {
          stickyNotes[ta.dataset.i].text = ta.value;
          localStorage.setItem('win11_sticky', JSON.stringify(stickyNotes));
        });
      });

      list.querySelectorAll('.sticky-del').forEach(function (btn) {
        btn.addEventListener('click', function () {
          stickyNotes.splice(parseInt(btn.dataset.i, 10), 1);
          localStorage.setItem('win11_sticky', JSON.stringify(stickyNotes));
          render();
        });
      });
    }

    document.getElementById('stickyAdd').addEventListener('click', function () {
      stickyNotes.push({ text: '' });
      localStorage.setItem('win11_sticky', JSON.stringify(stickyNotes));
      render();
    });

    render();
  }

  // ============================================================
  // EXPOSE (debugging)
  // ============================================================
  window.openApp = openApp;
  window.closeWindow = closeWindow;
  window.showToast = showToast;

})();