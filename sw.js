/* Service worker — Học cùng Nhí (PWA).
   Mục tiêu: đủ điều kiện "cài app" + chạy offline + CẬP NHẬT tự động, êm, không kẹt.

   ⚠️ MỖI LẦN DEPLOY sửa js/css/html: PHẢI tăng VERSION (khớp APP_VERSION trong app.js).
   Đổi VERSION → file sw.js khác byte → trình duyệt phát hiện SW mới →
   skipWaiting() cho SW mới chiếm quyền NGAY → clients.claim() → trang tự reload 1 lần.
   Nhờ vậy KHÔNG còn trạng thái "waiting" kẹt lại → hết cảnh báo "có điều mới" lặp vô hạn. */

var VERSION = "3.8";
var CACHE = "hcn-shell-" + VERSION;
var SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data.js",
  "./license.js",
  "./progress.js",
  "./analytics.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (e) {
  // skipWaiting: SW mới KHÔNG chờ, chiếm quyền ngay sau khi cài xong.
  // Đây là mấu chốt chống kẹt "waiting" (nguyên nhân toast báo mới lặp mãi).
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(SHELL.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);  // xóa cache phiên bản cũ
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Trang gửi lệnh "cập nhật ngay" → SW mới nhảy vào kiểm soát → trang tự reload.
self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  // videos.js: luôn ưu tiên mạng để cập nhật trạng thái tập public
  if (url.pathname.indexOf("videos.js") >= 0) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }

  // còn lại: cache-first, rồi mạng, rồi cache dần
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
