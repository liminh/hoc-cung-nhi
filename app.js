/* HỌC CÙNG NHÍ — SPA tĩnh, không framework.
   Màn hình: home → epmenu → flash | listen | phonics | video(+quiz) → result.
   Mọi lưu trữ đi qua progress.js (hcn_progress_v2) — không tài khoản, không server. */

(function () {
  "use strict";

  var app = document.getElementById("app");

  /* ---------------- Cấu hình chia sẻ / cài app ---------------- */
  var APP_URL = "https://liminh.github.io/hoc-cung-nhi/";
  var CHANNEL_URL = "https://www.youtube.com/@LongNhiHocEnglish";
  // Freemium — giá + kênh liên hệ đã chốt.
  var PRICE_TEXT = "79.000đ";                      // gói trọn bộ 30 tập (mua đứt, hạ giá 2026-07-21)
  var ZALO_URL = "https://zalo.me/0902335939";     // Zalo ba mẹ Nhí
  var FORMSPREE_URL = "https://formspree.io/f/xzdnzqpp"; // TODO Minh: cân nhắc tách form riêng cho app
  // ⚠️ Mỗi lần deploy có đổi js/css/html: tăng số này VÀ khớp VERSION trong sw.js.
  var APP_VERSION = "3.8";

  /* ---------------- Cài app (PWA install prompt) ---------------- */
  var deferredInstall = null;
  var installFab = document.getElementById("install-fab");
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredInstall = e;
    if (installFab) installFab.hidden = false;
  });
  if (installFab) {
    installFab.addEventListener("click", function () {
      if (!deferredInstall) return;
      deferredInstall.prompt();
      deferredInstall.userChoice.then(function () {
        deferredInstall = null;
        installFab.hidden = true;
      });
    });
  }
  window.addEventListener("appinstalled", function () {
    deferredInstall = null;
    if (installFab) installFab.hidden = true;
  });

  /* --------- Gợi ý "mở bằng app" (đã cài nhưng đang xem bằng tab thường) --------- */
  // Trình duyệt KHÔNG cho web tự mở app đã cài → chỉ có thể nhắc người dùng
  // bấm biểu tượng trên màn hình chính (mở từ icon = chạy standalone, ẩn URL bar).
  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
  }
  function initOpenInAppHint() {
    if (isStandalone()) return;                                   // đang chạy trong app rồi
    if (Progress.getFlag("hint_openapp") === "off") return;
    if (!navigator.getInstalledRelatedApps) return;               // trình duyệt không hỗ trợ
    navigator.getInstalledRelatedApps().then(function (apps) {
      if (!apps || !apps.length) return;                          // chưa cài → không nhắc
      var bar = document.createElement("div");
      bar.className = "openapp-hint";
      bar.innerHTML =
        '<span>📲 Bạn đã cài <strong>Học cùng Nhí</strong> — mở bằng biểu tượng trên màn hình chính cho gọn (ẩn thanh địa chỉ).</span>' +
        '<button class="openapp-x" aria-label="Đóng">✕</button>';
      document.body.appendChild(bar);
      bar.querySelector(".openapp-x").addEventListener("click", function () {
        bar.remove();
        Progress.setFlag("hint_openapp", "off");
      });
    }).catch(function () {});
  }

  /* ---------------- Tiến độ hoàn thành (dấu ✓) ---------------- */
  // Các "hoạt động" của 1 tập → key sao tương ứng. Thẻ video ↔ key "quiz".
  function epActivityKeys(ep) {
    var keys = ["flash", "listen"];
    if (ep.phonics && ep.phonics.length) keys.push("phonics");
    keys.push("quiz");
    return keys;
  }
  // Freemium: tập sau FREE_UPTO bị khóa cho tới khi có mã kích hoạt.
  function isEpLocked(ep) { return ep.num > FREE_UPTO && !License.isPremium(); }
  function epProgress(ep) {
    var keys = epActivityKeys(ep), done = 0;
    keys.forEach(function (k) { if (Progress.hasActivity(ep.id, k)) done++; });
    return { done: done, total: keys.length };
  }
  // Số tập bé đã chạm (có ≥1 hoạt động xong)
  function episodesLearned() {
    return EPISODES.filter(function (ep) {
      return epActivityKeys(ep).some(function (k) { return Progress.hasActivity(ep.id, k); });
    }).length;
  }
  // Tập kế tiếp (theo num+1); undefined nếu là tập cuối
  function nextEp(ep) {
    return EPISODES.filter(function (e) { return e.num === ep.num + 1; })[0];
  }

  /* ---------------- Âm thanh (MP3 → fallback Web Speech) ---------------- */
  var currentAudio = null;
  function speak(text, lang) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "en-US";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }
  function playItem(item, lang) {
    // item: {audio, tts} — thử MP3 trước, lỗi thì đọc bằng Web Speech
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    if (item.audio) {
      var a = new Audio("audio/" + item.audio);
      currentAudio = a;
      a.onerror = function () { speak(item.tts, lang || item.lang); };
      a.play().catch(function () { speak(item.tts, lang || item.lang); });
    } else {
      speak(item.tts, lang || item.lang);
    }
  }
  function playSys(name) { playItem(SYS_AUDIO[name], SYS_AUDIO[name].lang); }

  /* ---------------- Rung nhẹ (haptic) — iOS không có thì tự im ---------------- */
  function vibrate(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

  /* ---------------- Confetti ---------------- */
  var CONFETTI_COLORS = ["#F5B841", "#2E9E8F", "#D84B3F", "#8FC63F", "#A8DCD9"];
  function confetti(n) {
    var layer = document.getElementById("confetti-layer");
    for (var i = 0; i < (n || 26); i++) {
      var c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      c.style.animationDuration = 1.4 + Math.random() * 1.2 + "s";
      c.style.animationDelay = Math.random() * 0.3 + "s";
      c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      layer.appendChild(c);
      (function (el) { setTimeout(function () { el.remove(); }, 3000); })(c);
    }
  }

  /* ---------------- Khung render ---------------- */
  function render(html) {
    app.innerHTML = '<div class="screen">' + html + "</div>";
    window.scrollTo(0, 0);
  }
  function topbar(backFn, title) {
    var html =
      '<div class="topbar">' +
      '<button class="btn btn-back" data-act="back">← Quay lại</button>' +
      '<div class="star-count">⭐ ' + Progress.totalStars() + "</div></div>";
    if (title) html += '<h2 class="screen-title">' + title + "</h2>";
    return html;
  }

  /* ---------------- Thanh chuyển hoạt động (cross-nav, đòn A) ---------------- */
  // Hàng chip để nhảy thẳng sang hoạt động khác của cùng tập, không cần Quay lại.
  function activityNav(ep, current) {
    var acts = [
      { k: "flash", act: "nav-flash", icon: "🃏", label: "Thẻ từ" },
      { k: "listen", act: "nav-listen", icon: "🏆", label: "Thi đấu" }
    ];
    if (ep.phonics && ep.phonics.length) acts.push({ k: "phonics", act: "nav-phonics", icon: "🐢", label: "Luyện âm" });
    acts.push({ k: "video", act: "nav-video", icon: "📺", label: "Phim" });
    return '<div class="act-nav">' + acts.map(function (a) {
      var on = a.k === current;
      return '<button class="act-nav-chip nav-' + a.k + (on ? " on" : "") + '"' +
        (on ? ' disabled aria-current="true"' : ' data-act="' + a.act + '"') +
        '><span class="nav-ic">' + a.icon + "</span>" + a.label + "</button>";
    }).join("") + "</div>";
  }
  // Đăng ký handler cross-nav cho 1 tập (gọi trong mỗi màn hoạt động).
  function setNavHandlers(ep) {
    handlers["nav-flash"] = function () { showFlash(ep); };
    handlers["nav-listen"] = function () { showListen(ep, "listen", 5); };
    handlers["nav-phonics"] = function () { showPhonics(ep); };
    handlers["nav-video"] = function () { showVideo(ep); };
  }
  // uỷ quyền sự kiện: mọi nút có data-act
  var handlers = {};
  app.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    if (handlers[act]) handlers[act](btn, e);
  });

  function esc(s) { return String(s).replace(/</g, "&lt;"); }

  /* ================= HOME ================= */
  // Tập kế tiếp bé nên học: tập đầu tiên chưa xong hết hoạt động
  function findNextEp() {
    for (var i = 0; i < EPISODES.length; i++) {
      var pr = epProgress(EPISODES[i]);
      if (pr.done < pr.total) return EPISODES[i];
    }
    return null; // bé đã hoàn thành tất cả
  }
  // Thẻ 1 tập trong danh sách (tách từ showHome cũ, markup GIỮ NGUYÊN)
  function epCard(ep) {
    var words = ep.vocab.map(function (w) { return w.en; }).join(" · ");
    var pr = epProgress(ep);
    var locked = isEpLocked(ep);
    var doneHtml = pr.done > 0
      ? '<span class="ep-done' + (pr.done === pr.total ? " all" : "") + '">✓ ' + pr.done + "/" + pr.total + "</span>"
      : "";
    // Khóa: mờ chữ + ổ khóa thay chỗ sao. GIỮ data-act="open-ep" (bấm → teaser).
    var rightHtml = locked
      ? '<span class="ep-lock">🔒</span>'
      : '<span class="ep-stars">⭐ ' + Progress.epStars(ep.id) + "</span>";
    return (
      '<button class="ep-card' + (locked ? " locked" : "") + '" data-act="open-ep" data-ep="' + ep.id + '">' +
      '<span class="ep-scene">' + ep.scene + "</span>" +
      '<span class="ep-info">' +
      '<span class="ep-num">Tập ' + ep.num + "</span>" +
      '<span class="ep-name">' + esc(ep.title) + "</span>" +
      '<span class="ep-words">' + esc(words) + "</span>" + doneHtml + "</span>" +
      rightHtml + "</button>"
    );
  }
  function showHome() {
    if (window.Analytics) Analytics.track("screen/home");
    var next = findNextEp();
    var contHtml = "";
    if (next) {
      contHtml =
        '<button class="continue-card" data-act="open-ep" data-ep="' + next.id + '">' +
        '<span class="cont-scene">' + next.scene + "</span>" +
        '<span class="cont-info">' +
        '<span class="cont-label">' + (episodesLearned() === 0 ? "Bắt đầu phiêu lưu!" : "Học tiếp nào!") + "</span>" +
        '<span class="cont-name">Tập ' + next.num + " — " + esc(next.title) + "</span></span>" +
        '<span class="cont-go">▶</span></button>';
    }
    var stagesHtml = STAGES.map(function (st) {
      var eps = EPISODES.filter(function (e) { return e.num >= st.from && e.num <= st.to; });
      var doneEps = eps.filter(function (e) { var p = epProgress(e); return p.done === p.total; }).length;
      var isCurrent = next
        ? (next.num >= st.from && next.num <= st.to)
        : st === STAGES[STAGES.length - 1];
      return (
        '<details class="stage"' + (isCurrent ? " open" : "") + ">" +
        '<summary class="stage-head">' +
        '<span class="stage-icon">' + st.icon + "</span>" +
        '<span class="stage-titles">' +
        '<span class="stage-name">' + esc(st.name) + "</span>" +
        '<span class="stage-tag">' + esc(st.tagline) + "</span></span>" +
        '<span class="stage-prog' + (doneEps === eps.length ? " all" : "") + '">' + doneEps + "/" + eps.length + "</span>" +
        "</summary>" +
        '<div class="ep-list">' + eps.map(epCard).join("") + "</div></details>"
      );
    }).join("");
    render(
      '<div class="topbar">' +
      '<div class="topbar-left">' +
      '<button class="btn btn-parents" data-act="go-parents">👨‍👩‍👧 Ba mẹ</button>' +
      '<button class="btn btn-info" data-act="go-about" aria-label="Thông tin">ℹ️</button>' +
      "</div>" +
      '<div class="star-count">⭐ ' + Progress.totalStars() + "</div></div>" +
      '<div class="mascot">🐉</div>' +
      '<h1 class="app-title">Học cùng Nhí</h1>' +
      '<p class="app-sub">Bé phiêu lưu Làng Cỏ Xanh, học tiếng Anh theo từng chặng 🪷</p>' +
      contHtml +
      '<div class="stage-list">' + stagesHtml + "</div>" +
      '<p class="app-version">Phiên bản ' + APP_VERSION + "</p>"
    );
  }
  handlers["open-ep"] = function (btn) {
    var ep = getEp(btn.getAttribute("data-ep"));
    if (isEpLocked(ep)) { showLockedTeaser(ep); return; }
    showEpMenu(ep.id);
  };
  handlers["go-parents"] = function () { showParents(); };
  handlers["go-about"] = function () { showAbout(); };

  /* ================= THÔNG TIN / VỀ APP ================= */
  function showAbout() {
    handlers["back"] = showHome;
    render(
      topbar(null, "Thông tin") +
      '<div class="about-stage">' +
      '<div class="mascot">🐉</div>' +
      '<h2 class="about-name">Học cùng Nhí</h2>' +
      '<div class="about-ver">Phiên bản ' + APP_VERSION + "</div>" +
      '<p class="about-desc">App miễn phí giúp bé <strong>3–7 tuổi</strong> ôn từ vựng và ' +
      'phonics tiếng Anh theo từng tập phim hoạt hình <strong>Long Nhí</strong> — ' +
      'qua thẻ từ, trò chơi nghe–chọn, luyện âm và quiz vui.</p>' +
      '<div class="about-facts">' +
      '<div class="about-fact">🔒 Không quảng cáo, không thu thập dữ liệu của bé</div>' +
      '<div class="about-fact">📶 Cài được vào máy, chơi cả khi không mạng</div>' +
      '<div class="about-fact">🔄 Tự cập nhật bản mới khi có kết nối</div>' +
      "</div>" +
      '<a class="btn btn-nghe parents-link" href="' + CHANNEL_URL + '" target="_blank" rel="noopener">▶️ Xem kênh Long Nhí trên YouTube</a>' +
      '<p class="parents-note">Làng Cỏ Xanh 🪷 — Long Nhí Học English</p>' +
      "</div>"
    );
  }

  /* ================= MENU HOẠT ĐỘNG ================= */
  function getEp(id) {
    return EPISODES.filter(function (e) { return e.id === id; })[0];
  }
  function showEpMenu(epId) {
    var ep = getEp(epId);
    handlers["back"] = showHome;
    var hasPhonics = ep.phonics && ep.phonics.length;
    function badge(key) {
      return Progress.hasActivity(ep.id, key) ? '<span class="done-badge">✓</span>' : "";
    }
    var cards =
      '<button class="act-card act-flash" data-act="go-flash">' + badge("flash") + '<span class="act-icon">🃏</span>Khám phá từ mới</button>' +
      '<button class="act-card act-listen" data-act="go-listen">' + badge("listen") + '<span class="act-icon">🏆</span>Thi đấu cùng Nhí</button>' +
      (hasPhonics
        ? '<button class="act-card act-phonics" data-act="go-phonics">' + badge("phonics") + '<span class="act-icon">🐢</span>Luyện âm với Ông Rùa</button>'
        : "") +
      '<button class="act-card act-video" data-act="go-video">' + badge("quiz") + '<span class="act-icon">📺</span>Xem phim &amp; thử tài</button>';
    var pr = epProgress(ep);
    render(
      topbar(showHome, "Tập " + ep.num + " — " + esc(ep.title)) +
      '<p class="screen-sub">' + esc(ep.subtitle) + ' <span class="menu-prog">(' + pr.done + "/" + pr.total + " xong)</span></p>" +
      '<div class="act-grid">' + cards + "</div>"
    );
    handlers["go-flash"] = function () { showFlash(ep); };
    handlers["go-listen"] = function () { showListen(ep, "listen", 5); };
    handlers["go-phonics"] = function () { showPhonics(ep); };
    handlers["go-video"] = function () { showVideo(ep); };
  }

  /* ================= 1. FLASHCARD ================= */
  // v3.0: tách "vẽ khung 1 lần" (renderShell) khỏi "thay thẻ" (updateCard) để có
  // swipe mượt — chuyển thẻ KHÔNG BAO GIỜ gọi render() (giữ pointer capture sống).
  function showFlash(ep) {
    if (window.Analytics) Analytics.track("screen/flash");
    var idx = 0, seen = {};
    var len = ep.vocab.length;
    handlers["back"] = function () { showEpMenu(ep.id); };
    setNavHandlers(ep);

    function dotsHtml() {
      return ep.vocab.map(function (_, i) {
        return "<span" + (i === idx ? ' class="on"' : "") + "></span>";
      }).join("");
    }

    // Vẽ khung đúng 1 LẦN: topbar + cross-nav + viewport rỗng + dots + nav.
    function renderShell() {
      render(
        topbar(null, "Khám phá từ mới") +
        activityNav(ep, "flash") +
        '<div class="flash-stage">' +
        '<div class="flash-viewport" id="flash-viewport"></div>' +
        '<div class="flash-dots" id="flash-dots"></div>' +
        '<div class="flash-nav">' +
        '<button class="btn" data-act="prev">←</button>' +
        '<button class="btn btn-nghe" data-act="say">🔊</button>' +
        '<button class="btn" data-act="next">→</button>' +
        "</div></div>"
      );
      attachSwipe();
    }

    // Chỉ tạo Audio (không play) để trình duyệt cache trước — thẻ kề trượt tới là nghe ngay.
    function preloadNeighbor(i) {
      var item = ep.vocab[(i + len) % len];
      if (item && item.audio) { try { new Audio("audio/" + item.audio); } catch (e) {} }
    }

    // Thay thẻ: dir -1|0|1 (0 = lần đầu, không animation). CHỈ đụng #flash-viewport + #flash-dots.
    function updateCard(dir) {
      var w = ep.vocab[idx];
      seen[idx] = true;
      Progress.recordSeen(w.id);
      var cls = dir === 1 ? " slide-in-right" : dir === -1 ? " slide-in-left" : "";
      var vp = document.getElementById("flash-viewport");
      if (vp) {
        vp.innerHTML =
          '<button class="flash-card' + cls + '" data-act="say" id="flashcard">' +
          '<span class="flash-emoji">' + w.emoji + "</span>" +
          '<span class="flash-en">' + esc(w.en) + "</span>" +
          '<span class="flash-vi">' + esc(w.vi) + "</span></button>";
      }
      var dots = document.getElementById("flash-dots");
      if (dots) dots.innerHTML = dotsHtml();
      preloadNeighbor(idx + 1);
      preloadNeighbor(idx - 1);
      // xem đủ bộ thẻ → thưởng 1 sao
      if (Object.keys(seen).length === len) Progress.awardStars(ep.id, "flash", 1);
    }

    function go(dir) {
      idx = (idx + dir + len) % len;
      updateCard(dir);
      playItem(ep.vocab[idx]);
      vibrate(10);
    }

    // Swipe bằng Pointer Events, gắn 1 lần lên #flash-viewport (viewport sống suốt màn).
    function attachSwipe() {
      var vp = document.getElementById("flash-viewport");
      if (!vp) return;
      var startX = 0, startY = 0, startT = 0, dx = 0, dragging = false, suppressClick = false;

      vp.addEventListener("pointerdown", function (e) {
        if (!e.isPrimary) return;
        // Mỗi lượt chạm mới bắt đầu SẠCH: nếu drag trước không sinh click ma để nuốt,
        // cờ suppress cũ không được ở lại ăn oan cú tap kế (trượt xong tap nghe = im).
        suppressClick = false;
        startX = e.clientX; startY = e.clientY; startT = performance.now();
        dx = 0; dragging = false;
        try { vp.setPointerCapture(e.pointerId); } catch (er) {}
      });
      vp.addEventListener("pointermove", function (e) {
        if (!startT) return;
        dx = e.clientX - startX;
        if (Math.abs(dx) > 10) dragging = true;
        if (dragging) {
          var card = document.getElementById("flashcard");
          if (card) {
            card.style.transition = "none";
            card.style.transform = "translateX(" + dx + "px) rotate(" + (dx * 0.04) + "deg)";
          }
        }
      });
      function end() {
        if (!startT) return;
        var card = document.getElementById("flashcard");
        if (!dragging) { startT = 0; return; }   // tap nhẹ → để click chạy bình thường
        suppressClick = true;                     // chặn click ma (phát âm oan)
        var v = Math.abs(dx) / Math.max(1, performance.now() - startT);
        var commit = card && (Math.abs(dx) > card.offsetWidth * 0.25 || v > 0.5);
        startT = 0; dragging = false;
        if (commit) {
          go(dx < 0 ? 1 : -1);                    // kéo trái = thẻ tiếp
        } else if (card) {
          card.style.transition = "transform .25s cubic-bezier(.2,1.4,.4,1)";
          card.style.transform = "";              // spring-back
        }
      }
      vp.addEventListener("pointerup", end);
      vp.addEventListener("pointercancel", end);
      // capture-phase: chạy TRƯỚC uỷ quyền click ở app.js → nuốt click ma sau drag.
      vp.addEventListener("click", function (e) {
        if (suppressClick) { suppressClick = false; e.stopPropagation(); e.preventDefault(); }
      }, true);
    }

    handlers["say"] = function () {
      var card = document.getElementById("flashcard");
      if (card) { card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop"); }
      playItem(ep.vocab[idx]);
    };
    handlers["prev"] = function () { go(-1); };
    handlers["next"] = function () { go(1); };

    renderShell();
    updateCard(0);
    playSys("sayit");
  }

  /* ================= 2. NGHE-CHỌN (+ quiz dùng chung) ================= */
  function shuffle(arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function showListen(ep, activity, totalRounds) {
    if (window.Analytics && activity === "listen") Analytics.track("screen/listen");
    var round = 0, earned = 0, locked = false;
    var title = activity === "quiz" ? "Thử tài cuối tập" : "Thi đấu cùng Nhí";
    handlers["back"] = function () { showEpMenu(ep.id); };
    setNavHandlers(ep);
    // cross-nav chỉ hiện ở hoạt động "Thi đấu cùng Nhí", không hiện giữa quiz
    var nav = activity === "listen" ? activityNav(ep, "listen") : "";

    function draw() {
      var target = ep.vocab[round % ep.vocab.length];
      // đảo thứ tự đáp án, đúng 1 trong 3
      var opts = shuffle(ep.vocab).slice(0, 3);
      if (opts.indexOf(target) < 0) opts[Math.floor(Math.random() * opts.length)] = target;
      opts = shuffle(opts);

      var starsHtml = "";
      for (var i = 0; i < earned; i++) starsHtml += "⭐";
      render(
        topbar(null, title) +
        nav +
        '<div class="listen-stage">' +
        '<div class="round-info">Câu ' + (round + 1) + " / " + totalRounds + "</div>" +
        '<button class="big-speaker" data-act="hear">🔊</button>' +
        '<p class="screen-sub">Nghe rồi chạm vào hình đúng nhé!</p>' +
        '<div class="choices">' +
        opts.map(function (o) {
          return '<button class="choice" data-act="pick" data-en="' + esc(o.en) + '">' + o.emoji + "</button>";
        }).join("") +
        "</div>" +
        '<div class="round-stars">' + starsHtml + "</div></div>"
      );
      locked = false;
      setTimeout(function () { playItem(target); }, 350);

      handlers["hear"] = function () { playItem(target); };
      handlers["pick"] = function (btn) {
        if (locked) return;
        if (btn.getAttribute("data-en") === target.en) {
          locked = true;
          Progress.recordAnswer(target.id, true);
          btn.classList.add("correct");
          earned++;
          playSys("correct");
          vibrate(20);
          confetti(20);
          setTimeout(function () {
            round++;
            if (round >= totalRounds) showResult(ep, activity, earned, totalRounds);
            else draw();
          }, 1200);
        } else {
          Progress.recordAnswer(target.id, false);   // bản cũ vứt câu sai đi — giờ giữ lại
          btn.classList.add("wrong");
          playSys("retry");
          setTimeout(function () { btn.classList.remove("wrong"); }, 450);
        }
      };
    }
    draw();
  }

  /* ---------- Ảnh "Khoe kết quả của bé" (vòng lặp lan truyền) ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  // makeShareCanvas là async (cần load ảnh QR từ mạng).
  // Truyền callback(cv) — được gọi khi canvas đã vẽ xong.
  function makeShareCanvas(ep, earned, total, callback) {
    var S = 1080;
    var cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    var ctx = cv.getContext("2d");
    // nền mint gradient
    var g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, "#cdeeec"); g.addColorStop(0.55, "#A8DCD9"); g.addColorStop(1, "#bfe6c9");
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    // thẻ trắng bo góc (cao hơn để chứa QR)
    ctx.fillStyle = "rgba(255,248,234,0.93)";
    roundRect(ctx, 60, 100, S - 120, 940, 56); ctx.fill();
    ctx.textAlign = "center";
    // rồng
    ctx.font = "190px 'Baloo 2', sans-serif";
    ctx.fillText("🐉", S / 2, 315);
    // sao
    var starRow = "";
    var showN = Math.min(earned, 5);
    for (var i = 0; i < showN; i++) starRow += "⭐";
    if (!starRow) starRow = "🌱";
    ctx.font = "100px sans-serif";
    ctx.fillText(starRow, S / 2, 455);
    // điểm
    ctx.fillStyle = "#2E9E8F";
    ctx.font = "800 82px 'Baloo 2', sans-serif";
    ctx.fillText("Bé được " + earned + "/" + total + " sao!", S / 2, 570);
    // tên tập
    ctx.fillStyle = "#3d3a34";
    ctx.font = "600 40px 'Quicksand', sans-serif";
    var tt = "Tập " + ep.num + " — " + ep.title;
    if (tt.length > 34) tt = tt.slice(0, 33) + "…";
    ctx.fillText(tt, S / 2, 634);
    // thương hiệu
    ctx.fillStyle = "#D84B3F";
    ctx.font = "800 50px 'Baloo 2', sans-serif";
    ctx.fillText("Học cùng Nhí 🪷", S / 2, 700);
    // vẽ QR code (async: phải đợi ảnh load)
    var qrSize = 172;
    var qrX = Math.round((S - qrSize) / 2);
    var qrY = 738;

    function finishWithQr(img) {
      // nền trắng cho QR
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 12);
      ctx.fill();
      if (img) ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
      ctx.fillStyle = "#7a746a";
      ctx.font = "500 30px 'Quicksand', sans-serif";
      ctx.fillText("Quét để vào app miễn phí", S / 2, qrY + qrSize + 38);
      callback(cv);
    }

    var qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = function () { finishWithQr(qrImg); };
    qrImg.onerror = function () {
      // fallback: vẽ text URL nếu không tải được QR
      ctx.fillStyle = "#7a746a";
      ctx.font = "500 34px 'Quicksand', sans-serif";
      ctx.fillText("liminh.github.io/hoc-cung-nhi", S / 2, qrY + qrSize / 2 + 12);
      callback(cv);
    };
    qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" +
      encodeURIComponent(APP_URL) + "&margin=1";
  }
  function shareResult(ep, earned, total, btn) {
    var text = "Bé nhà mình vừa được " + earned + "/" + total +
      " ⭐ khi học tiếng Anh cùng rồng con Long Nhí! 🐉\n" +
      "Chơi thử miễn phí cho bé 3–7 tuổi: " + APP_URL;
    makeShareCanvas(ep, earned, total, function (cv) {
    cv.toBlob(function (blob) {
      var file = blob ? new File([blob], "be-hoc-cung-nhi.png", { type: "image/png" }) : null;
      // 1) Web Share API kèm ảnh (điện thoại)
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text: text, title: "Học cùng Nhí" }).catch(function () {});
        return;
      }
      // 2) Web Share API chỉ chữ
      if (navigator.share) {
        navigator.share({ text: text, url: APP_URL, title: "Học cùng Nhí" }).catch(function () {
          fallbackShare(blob, text, btn);
        });
        return;
      }
      // 3) Máy tính: tải ảnh + copy link
      fallbackShare(blob, text, btn);
    }, "image/png");
    });
  }
  function fallbackShare(blob, text, btn) {
    if (blob) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "be-hoc-cung-nhi.png";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    if (btn) {
      var old = btn.textContent;
      btn.textContent = "Đã lưu ảnh + copy link ✓";
      setTimeout(function () { btn.textContent = old; }, 2500);
    }
  }

  /* ================= MÀN KẾT QUẢ ================= */
  function showResult(ep, activity, earned, total) {
    Progress.awardStars(ep.id, activity, earned);
    // Hoàn thành quiz = coi như "học xong tập" (chỉ đếm path tĩnh, không kèm tập nào).
    if (window.Analytics && activity === "quiz") Analytics.track("milestone/ep-completed");
    var stars = "";
    for (var i = 0; i < earned; i++) stars += "⭐";
    if (!stars) stars = "🌱";
    var msg = earned >= total ? "Tuyệt vời! Great job!" :
              earned >= Math.ceil(total / 2) ? "Giỏi lắm! Well done!" : "Cố lên nhé! Try again!";
    handlers["back"] = function () { showEpMenu(ep.id); };
    handlers["replay"] = function () { showListen(ep, activity, total); };
    handlers["home"] = showHome;
    handlers["share"] = function (btn) { shareResult(ep, earned, total, btn); };
    // Đòn B: nối mạch sang tập kế; tập cuối thì khích lệ
    var next = nextEp(ep);
    var nextHtml = next
      ? '<button class="btn btn-la" data-act="next-ep">Tập tiếp theo →</button>'
      : '<div class="result-endnote">Bé học hết các tập rồi, giỏi ghê! 🎉</div>';
    if (next) handlers["next-ep"] = function () { showEpMenu(next.id); };
    render(
      topbar(null) +
      '<div class="result-stage">' +
      '<div class="mascot">🐉</div>' +
      '<div class="result-stars">' + stars + "</div>" +
      '<div class="result-msg">' + msg + "</div>" +
      '<div class="result-sub">Bé được ' + earned + " / " + total + " sao</div>" +
      '<button class="btn btn-gach" data-act="share">📸 Khoe kết quả của bé</button>' +
      nextHtml +
      '<button class="btn btn-nghe" data-act="replay">Chơi lại 🔁</button>' +
      '<button class="btn" data-act="home">Về trang chính 🏡</button>' +
      "</div>"
    );
    confetti(earned >= total ? 60 : 24);
    vibrate(30);
  }

  /* ================= 3. PHONICS ================= */
  function showPhonics(ep) {
    if (window.Analytics) Analytics.track("screen/phonics");
    var played = {};
    handlers["back"] = function () { showEpMenu(ep.id); };
    setNavHandlers(ep);
    var blocks = ep.phonics.map(function (p, i) {
      return (
        '<div class="phon-block">' +
        '<button class="phon-letter" data-act="phon-sound" data-i="' + i + '">' + p.letter + "</button>" +
        '<div class="phon-sound">Âm ' + p.sound + " — đọc là “" + esc(p.soundVi) + "”</div>" +
        '<div class="phon-hint">' + esc(p.hint) + "</div>" +
        '<div class="phon-words">' +
        p.words.map(function (w) {
          return '<button class="phon-word" data-act="phon-word" data-w="' + esc(w) + '">🔊 ' + esc(w) + "</button>";
        }).join("") +
        "</div></div>"
      );
    }).join("");
    render(
      topbar(null, "Phonics cùng Ông Rùa 🐢") +
      activityNav(ep, "phonics") +
      '<p class="screen-sub">Chạm chữ cái để nghe âm, chạm từ để nghe cả từ</p>' +
      '<div class="phonics-stage">' + blocks + "</div>"
    );
    handlers["phon-sound"] = function (btn) {
      var i = +btn.getAttribute("data-i");
      played[i] = true;
      playItem(ep.phonics[i], "vi-VN");
      // nghe đủ mọi âm của tập → 1 sao
      if (Object.keys(played).length === ep.phonics.length) Progress.awardStars(ep.id, "phonics", 1);
    };
    handlers["phon-word"] = function (btn) {
      var en = btn.getAttribute("data-w");
      var w = ep.vocab.filter(function (v) { return v.en === en; })[0];
      if (w) { Progress.recordSeen(w.id); playItem(w); }
    };
  }

  /* ================= 4. VIDEO + QUIZ ================= */
  function showVideo(ep) {
    if (window.Analytics) Analytics.track("screen/video");
    handlers["back"] = function () { showEpMenu(ep.id); };
    setNavHandlers(ep);
    var body;
    if (ep.videoId) {
      body =
        '<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + ep.videoId + '" ' +
        'title="Long Nhí — Tập ' + ep.num + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' +
        '<p class="video-note">Nếu video chưa phát được là do tập đang ở chế độ chờ duyệt 🐢</p>';
    } else {
      body =
        '<div class="coming-soon"><span class="cs-emoji">🐉</span>' +
        '<span class="cs-text">Sắp lên sóng!</span>' +
        '<span class="video-note">Tập này đang được Làng Cỏ Xanh hoàn thiện — bé chơi quiz trước nhé!</span></div>';
    }
    render(
      topbar(null, "Xem phim tập " + ep.num) +
      activityNav(ep, "video") +
      '<div class="video-stage">' + body +
      '<button class="btn btn-gach" data-act="start-quiz">Làm quiz 3 câu ✏️</button>' +
      "</div>"
    );
    handlers["start-quiz"] = function () { showListen(ep, "quiz", 3); };
  }

  /* ================= FREEMIUM — KHÓA / CỔNG BA MẸ / MỞ KHÓA ================= */
  // Bé bấm tập khóa → lời mời dễ thương, KHÔNG vào được menu tập.
  function showLockedTeaser(ep) {
    handlers["back"] = showHome;
    handlers["go-gate"] = function () { showGate(showUnlock); };
    render(
      topbar(null, "Tập " + ep.num) +
      '<div class="teaser-stage">' +
      '<div class="mascot">🐉</div>' +
      '<div class="teaser-lock">🔒</div>' +
      '<p class="teaser-msg">Tập này đang chờ <strong>chìa khóa vàng</strong>! ' +
      'Nhờ ba mẹ mở khóa giúp bé nhé 🗝️</p>' +
      '<button class="btn btn-nghe" data-act="go-gate">Con là ba mẹ 👨‍👩‍👧</button>' +
      '<button class="btn" data-act="back">Chơi tập khác 🏡</button>' +
      "</div>"
    );
  }

  // Cổng phụ huynh: phép NHÂN (trẻ 3–7 chưa thuộc cửu chương) → tách luồng bé khỏi mua.
  // Dùng lại cho mọi hành động "chỉ ba mẹ" (mở khóa, email, link ngoài).
  function showGate(onSuccess) {
    handlers["back"] = showHome;
    function draw() {
      var a = 3 + Math.floor(Math.random() * 7);   // 3..9
      var b = 3 + Math.floor(Math.random() * 7);
      render(
        topbar(null, "Dành cho ba mẹ") +
        '<div class="gate-stage">' +
        '<div class="mascot">🔐</div>' +
        '<p class="gate-q">Dành cho ba mẹ: <strong>' + a + " × " + b + " = ?</strong></p>" +
        '<input type="number" inputmode="numeric" id="gate-input" class="gate-input" placeholder="?">' +
        '<button class="btn btn-gach" data-act="gate-check">Kiểm tra</button>' +
        '<p class="gate-note">Câu này để chắc rằng ba mẹ đang cầm máy 🙂</p>' +
        "</div>"
      );
      var inp = document.getElementById("gate-input");
      if (inp) inp.focus();
      handlers["gate-check"] = function () {
        var val = parseInt((document.getElementById("gate-input") || {}).value, 10);
        if (val === a * b) { onSuccess(); return; }
        var box = document.querySelector(".gate-stage");
        if (box) { box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); }
        setTimeout(draw, 500);   // sai → lắc rồi đổi câu mới
      };
    }
    draw();
  }

  // Màn mua/mở khóa — nằm SAU cổng ba mẹ. Đã premium thì báo xong.
  function showUnlock() {
    handlers["back"] = showHome;
    if (License.isPremium()) {
      render(
        topbar(null, "Mở khóa") +
        '<div class="unlock-stage">' +
        '<div class="mascot">🎉</div>' +
        '<p class="unlock-done">Đã mở khóa trọn bộ 30 tập ✓</p>' +
        '<button class="btn" data-act="back">Về trang chính 🏡</button>' +
        "</div>"
      );
      return;
    }
    handlers["code-submit"] = function () {
      var val = (document.getElementById("code-input") || {}).value;
      if (License.activate(val)) {
        confetti(60); playSys("correct"); vibrate(30);
        if (window.Analytics) Analytics.track("milestone/activated");
        render(
          topbar(null, "Mở khóa") +
          '<div class="unlock-stage">' +
          '<div class="mascot">🎉</div>' +
          '<p class="unlock-done">Đã mở khóa! Bé chơi hết 30 tập nhé! 🐉</p>' +
          '<button class="btn" data-act="home-unlocked">Về trang chính 🏡</button>' +
          "</div>"
        );
        handlers["home-unlocked"] = showHome;   // 🔒 tự biến mất vì isPremium=true
      } else {
        var msg = document.getElementById("code-msg");
        if (msg) { msg.textContent = "Mã chưa đúng, ba mẹ kiểm tra lại nhé"; msg.className = "code-msg err"; }
        var st = document.querySelector(".unlock-stage");
        if (st) { st.classList.remove("shake"); void st.offsetWidth; st.classList.add("shake"); }
      }
    };
    render(
      topbar(null, "Mở khóa trọn bộ") +
      '<div class="unlock-stage">' +
      '<h3 class="unlock-title">Mở khóa trọn bộ 30 tập</h3>' +
      '<p class="unlock-sub">Bé học tiếp Chặng 3, 4 và Mùa 2 cùng Long Nhí 🐉</p>' +
      '<div class="qr-row">' +
      '<div class="qr-col"><img class="qr-img" src="icons/qr-momo.jpg" alt="QR MoMo / VietQR"><span class="qr-cap">MoMo · VietQR</span></div>' +
      '<div class="qr-col"><img class="qr-img" src="icons/qr-bank.jpg" alt="QR Vietcombank"><span class="qr-cap">Vietcombank</span></div>' +
      "</div>" +
      '<div class="unlock-price">' + esc(PRICE_TEXT) + "</div>" +
      '<p class="unlock-steps">Quét 1 mã để chuyển khoản (cả hai mã đã điền sẵn 79.000đ) → nhắn Zalo/email cho ba mẹ Nhí → nhận mã kích hoạt trong ngày 💛</p>' +
      '<a class="btn btn-nghe parents-link" href="' + ZALO_URL + '" target="_blank" rel="noopener">💬 Nhắn Zalo</a>' +
      '<a class="btn parents-link" href="mailto:quyphamminh@gmail.com?subject=Kich hoat Hoc cung Nhi">✉️ Gửi email</a>' +
      '<div class="code-entry">' +
      '<input id="code-input" class="code-input" autocapitalize="characters" autocomplete="off" placeholder="HCN-XXXX-XXXX-XXXX">' +
      '<button class="btn btn-gach" data-act="code-submit">Mở khóa 🔑</button>' +
      '<p id="code-msg" class="code-msg"></p>' +
      "</div>" +
      '<button class="btn" data-act="back">Quay lại 🏡</button>' +
      "</div>"
    );
  }

  /* ================= GÓC BA MẸ (đòn D — nối phễu) ================= */
  // Chia sẻ lời mời cài app (chỉ chữ + link; không kèm ảnh như khoe kết quả)
  function shareInvite(btn) {
    var text = "Cho bé 3–7 tuổi học tiếng Anh miễn phí cùng rồng con Long Nhí 🐉\n" + APP_URL;
    if (navigator.share) {
      navigator.share({ text: text, url: APP_URL, title: "Học cùng Nhí" })
        .catch(function () { copyInvite(text, btn); });
    } else {
      copyInvite(text, btn);
    }
  }
  function copyInvite(text, btn) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    if (btn) {
      var old = btn.textContent;
      btn.textContent = "Đã copy link ✓";
      setTimeout(function () { btn.textContent = old; }, 2500);
    }
  }
  function showParents() {
    if (window.Analytics) Analytics.track("screen/parents");
    handlers["back"] = showHome;
    handlers["share-invite"] = function (btn) { shareInvite(btn); };
    handlers["unlock-gate"] = function () { showGate(showUnlock); };
    handlers["parents-email"] = function () { showGate(showEmailForm); };
    // Link ngoài / màn Xưởng Kênh: SAU cổng ba mẹ (bé không tự mở được).
    handlers["go-studio"] = function () {
      showGate(function () { window.open("landing/", "_blank"); showParents(); });
    };
    handlers["go-youtube"] = function () {
      showGate(function () { window.open(CHANNEL_URL, "_blank"); showParents(); });
    };

    var st = Progress.totalStars(), words = Progress.wordsKnown(), eps = episodesLearned();
    var streak = Progress.streakDays(), mins = Progress.minutesTotal();

    // Sao theo chặng (pattern như showHome: gộp epStars theo from/to).
    var stageRows = STAGES.map(function (stg) {
      var seps = EPISODES.filter(function (e) { return e.num >= stg.from && e.num <= stg.to; });
      var sstars = 0;
      seps.forEach(function (e) { sstars += Progress.epStars(e.id); });
      return '<div class="pstage-row">' +
        '<span class="pstage-ic">' + stg.icon + "</span>" +
        '<span class="pstage-name">' + esc(stg.name) + "</span>" +
        '<span class="pstage-stars">⭐ ' + sstars + "</span></div>";
    }).join("");

    var unlockBtn = License.isPremium()
      ? '<div class="parents-premium">🔓 Đã mở khóa trọn bộ 30 tập ✓</div>'
      : '<button class="btn btn-nghe" data-act="unlock-gate">🔓 Mở khóa toàn bộ tập</button>';

    render(
      topbar(null, "Góc ba mẹ 👨‍👩‍👧") +
      '<div class="parents-stage">' +
      '<p class="screen-sub">Theo dõi hành trình học của bé</p>' +
      '<div class="stat-row">' +
      '<div class="stat"><span class="stat-num">' + st + '</span><span class="stat-lbl">⭐ Sao</span></div>' +
      '<div class="stat"><span class="stat-num">' + words + '</span><span class="stat-lbl">Từ đã thuộc</span></div>' +
      '<div class="stat"><span class="stat-num">' + eps + '</span><span class="stat-lbl">Tập đã học</span></div>' +
      "</div>" +
      '<div class="stat-row">' +
      '<div class="stat"><span class="stat-num">🔥 ' + streak + '</span><span class="stat-lbl">Ngày liên tiếp</span></div>' +
      '<div class="stat"><span class="stat-num">⏱ ' + mins + '</span><span class="stat-lbl">Phút đã học</span></div>' +
      "</div>" +
      '<div class="pstage-list"><div class="pstage-head">Sao theo chặng</div>' + stageRows + "</div>" +
      unlockBtn +
      '<button class="btn btn-la" data-act="parents-email">✉️ Nhận mẹo học qua email</button>' +
      '<button class="btn btn-gach" data-act="share-invite">📤 Chia sẻ app cho ba mẹ khác</button>' +
      '<button class="btn btn-nghe" data-act="go-studio">🎬 Ba mẹ muốn tự làm kênh cho bé? Xem Xưởng Kênh AI</button>' +
      '<button class="btn" data-act="go-youtube">▶️ Xem kênh Long Nhí trên YouTube</button>' +
      '<p class="parents-note">Long Nhí Học English — hoạt hình dạy tiếng Anh cho bé. Tập mới lên sóng đều mỗi tuần trên YouTube 🐉</p>' +
      "</div>"
    );
  }

  // Form email — LUÔN sau cổng ba mẹ. Bé không chạm tới. Gửi qua Formspree, ẩn danh nguồn.
  function showEmailForm() {
    handlers["back"] = showParents;
    handlers["email-send"] = function () {
      var input = document.getElementById("email-input");
      var email = input ? input.value.trim() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        var m = document.getElementById("email-msg");
        if (m) { m.textContent = "Email chưa đúng, ba mẹ nhập lại nhé"; m.className = "code-msg err"; }
        return;
      }
      fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, source: "hcn-app" })
      }).catch(function () {});
      if (window.Analytics) Analytics.track("milestone/email-lead");
      render(
        topbar(null, "Cảm ơn ba mẹ") +
        '<div class="unlock-stage">' +
        '<div class="mascot">💌</div>' +
        '<p class="unlock-done">Cảm ơn ba mẹ! Mẹo học sẽ tới hộp thư sớm thôi 🐉</p>' +
        '<button class="btn" data-act="back">Quay lại</button>' +
        "</div>"
      );
      handlers["back"] = showParents;
    };
    render(
      topbar(null, "Nhận mẹo học") +
      '<div class="unlock-stage">' +
      '<div class="mascot">💌</div>' +
      '<p class="unlock-sub">Nhận vài mẹo giúp bé học tiếng Anh vui hơn mỗi tuần.</p>' +
      '<div class="code-entry">' +
      '<input id="email-input" class="code-input email-field" type="email" inputmode="email" autocapitalize="off" autocomplete="email" placeholder="email@cua.bame">' +
      '<button class="btn btn-nghe" data-act="email-send">Gửi 💌</button>' +
      '<p id="email-msg" class="code-msg"></p>' +
      "</div>" +
      '<p class="gate-note">Email chỉ dùng gửi mẹo học, không spam. Bé không nhập gì ở đây 🙂</p>' +
      '<button class="btn" data-act="back">Quay lại</button>' +
      "</div>"
    );
    var inp = document.getElementById("email-input");
    if (inp) inp.focus();
  }

  /* ================= Khởi động ================= */
  Progress.startSession();
  showHome();
  initOpenInAppHint();
})();
