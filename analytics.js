/* analytics.js — Chỉ là bộ ĐẾM ẩn danh: KHÔNG cookie, KHÔNG định danh, KHÔNG PII.
   Đếm sự kiện = đếm lượt, tương đương server log — phù hợp lời hứa "không thu thập
   dữ liệu CỦA BÉ" + Made-for-Kids. Chỉ gửi PATH tĩnh (screen/home…), không bao giờ
   gửi từ vựng, tên bé, hay tiến độ. Tắt toàn bộ: đặt ENABLED=false.

   Backend: GoatCounter (no-cookie). SITE rỗng = MỌI hàm no-op → an toàn deploy
   TRƯỚC khi Minh tạo tài khoản. Điền SITE (vd "hoccungnhi") là bật đếm. */
var Analytics = (function () {
  "use strict";

  var ENABLED = true;   // kill-switch tổng
  var SITE = "longnhi"; // subdomain GoatCounter (longnhi.goatcounter.com). "" = no-op.

  function track(path) {
    try {
      if (!ENABLED || !SITE) return;                 // chưa cấu hình → im lặng
      if (!navigator.onLine) return;                 // offline → bỏ, không xếp hàng
      var url = "https://" + SITE + ".goatcounter.com/count?p=" +
        encodeURIComponent("/" + path);
      new Image().src = url;                          // beacon 1 chiều, không đọc kết quả
    } catch (e) {}
  }

  return { track: track };
})();
