/* progress.js — KHO TIẾN ĐỘ của bé.
   Ranh giới cứng: file này KHÔNG biết gì về giáo trình.
   Không tham chiếu EPISODES / STAGES / W / data.js — chỉ nhận chuỗi vô danh
   ("cat", "ep_003/listen"). Nhờ vậy sửa giáo trình không bao giờ đụng kho dữ liệu.

   Nguyên tắc: file này chỉ GHI LẠI sự thật, chưa DIỄN GIẢI.
   streak() / dueWords() / stats() cố tình CHƯA có — chúng là hàm thuần đọc
   words/days, chặng sau thêm mà không phải đụng phần ghi.

   KHÔNG BAO GIỜ gửi gì lên mạng: app hứa "không thu thập dữ liệu của bé" + Made-for-Kids. */

var Progress = (function () {
  "use strict";

  var KEY = "hcn_progress_v2";
  var KNOWN_THRESHOLD = 2;              // số lần trả lời ĐÚNG để coi là "thuộc"
  var MAX_DAYS = 400;                   // giới hạn tối đa ngày theo dõi
  var IDLE_MS = 30 * 60 * 1000;        // 30 phút không tương tác = phiên mới

  var now = function () { return Date.now(); };   // thay được khi test

  var started = false;                  // listener chỉ đăng ký 1 lần
  var mark = 0;                         // mốc bắt đầu đoạn đang đo

  function blank() {
    return { v: 2, words: {}, stars: {}, days: {}, firstOpen: now() };
  }

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY));
      if (!raw || raw.v !== 2) return blank();
      raw.words = raw.words || {};
      raw.stars = raw.stars || {};
      raw.days  = raw.days  || {};
      return raw;
    } catch (e) {
      return blank();
    }
  }

  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  // Lấy (hoặc tạo) bản ghi của 1 từ. Khoá là W key ổn định ("thank_you"),
  // KHÔNG phải chữ hiển thị — đổi chữ hiển thị không được làm mất dữ liệu học.
  function word(s, id) {
    if (!s.words[id]) s.words[id] = { seen: 0, ok: 0, wrong: 0, last: 0 };
    return s.words[id];
  }

  // Khoá ngày theo giờ ĐỊA PHƯƠNG — "hôm nay" phải là hôm nay của bé, không phải UTC.
  function dayKey(t) {
    var d = new Date(t);
    return d.getFullYear() + "-" +
      ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
      ("0" + d.getDate()).slice(-2);
  }

  function prune(s) {
    var keys = Object.keys(s.days).sort();   // "YYYY-MM-DD" sắp xếp chuỗi = đúng thứ tự thời gian
    while (keys.length > MAX_DAYS) delete s.days[keys.shift()];
  }

  function markToday() {
    var s = load(), k = dayKey(now());
    if (!s.days[k]) s.days[k] = { ms: 0 };
    prune(s);
    save(s);
  }

  function flush() {
    var ms = now() - mark;
    mark = now();
    if (ms <= 0 || ms > IDLE_MS) return;   // bỏ quên máy → bỏ qua
    var s = load(), k = dayKey(now());
    if (!s.days[k]) s.days[k] = { ms: 0 };
    s.days[k].ms += ms;
    prune(s);
    save(s);
  }

  return {
    /* ---------- GHI ---------- */

    // Chỉ nâng nếu cao hơn — chơi lại không cộng dồn vô hạn (giữ nguyên ngữ nghĩa cũ).
    awardStars: function (epId, activity, n) {
      var s = load(), k = epId + "/" + activity;
      if ((s.stars[k] || 0) < n) s.stars[k] = n;
      save(s);
    },

    // Bé NHÌN thẻ từ. Đây KHÔNG phải kiểm tra → không bao giờ tính là "thuộc".
    recordSeen: function (wordId) {
      var s = load(), w = word(s, wordId);
      w.seen++;
      w.last = now();
      save(s);
    },

    // Bé TRẢ LỜI. Đây là sự kiện học lõi — cả đúng lẫn sai đều ghi.
    // (Bản cũ vứt câu sai đi; giữ lại chính là thứ sau này trả lời "bé yếu từ nào".)
    recordAnswer: function (wordId, isCorrect) {
      var s = load(), w = word(s, wordId);
      if (isCorrect) w.ok++; else w.wrong++;
      w.last = now();
      save(s);
    },

    // Gọi 1 lần lúc khởi động app.
    startSession: function () {
      markToday();
      mark = now();
      if (started) return;                 // gọi lại chỉ làm mới mốc, không chồng listener
      started = true;
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) flush();      // bé chuyển tab / khoá máy
        else mark = now();                 // bé quay lại → đo lại từ đây
      });
      window.addEventListener("pagehide", function () { flush(); });
    },

    // Chốt đoạn đang đo. Listener ở trên gọi nội bộ; test gọi trực tiếp.
    endSession: function () { flush(); },

    /* ---------- ĐỌC ---------- */

    totalStars: function () {
      var s = load(), sum = 0, k;
      for (k in s.stars) sum += s.stars[k];
      return sum;
    },

    epStars: function (epId) {
      var s = load(), sum = 0, k;
      for (k in s.stars) {
        if (k.indexOf(epId + "/") === 0) sum += s.stars[k];
      }
      return sum;
    },

    hasActivity: function (epId, activity) {
      return (epId + "/" + activity) in load().stars;
    },

    // Số từ bé THỰC SỰ thuộc — dựa trên trả lời đúng, không phải lượt lướt thẻ.
    // ⚠️ Còn lạc quan cho tới chặng 1: trò chơi hiện thoái hoá (25/30 tập có đúng
    // 3 từ, mà showListen luôn đưa cả 3 làm đáp án) nên bé gần như không thể sai.
    // Vẫn thật hơn hẳn cách đếm cũ. Xem spec §7.2.
    wordsKnown: function () {
      var s = load(), n = 0, id;
      for (id in s.words) if (s.words[id].ok >= KNOWN_THRESHOLD) n++;
      return n;
    },

    // Số ngày mở app khác nhau (đếm khoá ngày).
    activeDays: function () {
      return Object.keys(load().days).length;
    },

    // Tổng thời lượng học (phút, làm tròn) — cộng ms mọi ngày.
    minutesTotal: function () {
      var s = load(), ms = 0, k;
      for (k in s.days) ms += (s.days[k].ms || 0);
      return Math.round(ms / 60000);
    },

    // Chuỗi ngày học LIÊN TIẾP kết thúc hôm nay (hoặc hôm qua nếu hôm nay chưa mở).
    // Cả hai đều trống → 0. Dùng now() nên test mock được qua __setClock.
    streakDays: function () {
      var days = load().days;
      var oneDay = 24 * 60 * 60 * 1000;
      var t = now();
      if (!days[dayKey(t)]) {          // hôm nay chưa có → thử neo vào hôm qua
        t -= oneDay;
        if (!days[dayKey(t)]) return 0;
      }
      var count = 0;
      while (days[dayKey(t)]) { count++; t -= oneDay; }
      return count;
    },

    /* ---------- CỜ UI (tuỳ chọn giao diện — không phải dữ liệu tiến độ) ---------- */
    // Lưu/đọc trạng thái UI nhỏ (vd: "đã tắt gợi ý"). Khoá riêng để không xáo trộn tiến độ.
    getFlag: function (name) {
      try { return localStorage.getItem("hcn_ui_" + name); } catch (e) { return null; }
    },
    setFlag: function (name, val) {
      try { localStorage.setItem("hcn_ui_" + name, val); } catch (e) {}
    },

    /* ---------- MÓC TEST (chỉ test.html dùng) ---------- */

    __useTestKey: function () {
      KEY = "hcn_test_tmp";
      localStorage.removeItem(KEY);
    },

    __setClock: function (fn) { now = fn; },

    __dump: function () { return load(); }
  };
})();
