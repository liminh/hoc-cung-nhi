/* license.js — Freemium OFFLINE, KHÔNG server.
   Tập 1..FREE_UPTO miễn phí; tập sau mở bằng mã kích hoạt. App tự kiểm mã bằng
   hash-list ngay trong file này — không gọi mạng, chạy cả khi offline.

   Ngưỡng đe dọa (đọc trước khi lo bảo mật): scheme này CHỈ chặn đoán mò. Ai mở được
   DevTools đều đọc được HASHES + SALT và phá được — đúng với MỌI kiểm-mã phía client.
   Phụ huynh chia sẻ mã cho nhau = rủi ro CHẤP NHẬN ở giai đoạn này (bán thủ công, ít mã).
   Đây không phải DRM; là "then cửa" đủ để việc trả tiền có nghĩa. */
var License = (function () {
  "use strict";

  // ⚠️ PHẢI KHỚP TỪNG KÝ TỰ với SALT trong pipeline/gen_codes.py.
  //    Lệch 1 ký tự = MỌI mã đã phát trở nên vô dụng. Đổi ở đây phải đổi cả bên kia.
  var SALT = "hcn-lang-co-xanh-2026";
  var KEY = "hcn_license_v1";                 // khoá riêng, KHÔNG đi qua Progress

  // Hash của các mã hợp lệ = sha256(normalize(code)+SALT). Dán từ gen_codes.py.
  var HASHES = [
    "c2360906be31b96fcd493e886654ce925833b476209fbccd7914c4b0197cb794",
    "7e55e42bd4d16fc881f8926df2029f3cf4a22e092a835d9ac684f651dfa30aec",
    "bb84f62af76686fd6e3096b9540e957af714d639685ec34fb674585f105ee3ce",
    "8bdf43eedcc6a6e780b1993d6b4946789766a60ef3015bacb8733bec189461cc",
    "618109e5c29e86b637bf05e908b06c607183a5dc40a2e6b996a35d528f7975ec",
    "0359331d74cd33b5142c5bf8bc9e2667662421daa3afcad2df432cca208ac9b6",
    "babdafedbfc55b6703986cfd36809c19cffc462c017364b8f1dbbfdee51d1116",
    "e47848097350db78adaad4cd93a2f31839b93efd79731ba5728e9d5e98723066",
    "e3153a2f3bbd16cf41e3dc392e94d766a20bc57208d437d274e06bd4dabeca67",
    "2f23e902442e1c2b5e6dc633c7cdce32b3a1d61502c23ffaa7a15c7ee62eb7fe",
    "45ac86416e3f7e04ca23011df592054aa3227aa3fba0e077b47c96c805558405",
    "8f505a45e54be89d6d88d753ebd490db40cd6d381ae6a5e6213e8efb5cc3a72f",
    "c5b418980d14bec626467905d5b0f2cc6b361327b069e8e6d4fde890cb4d9f23",
    "37a0e9fd6bb378edefbdfb2e7056a1d48918ae6a197d630ac91273282e5c49fe",
    "7971389afd56217ae1ee05b55581b155f4e10fbefe074aee5cfc79cca0b03655",
    "1e6060710bdee80938763a065eac7dabe3d5d2f4b00b122dd234644bbbac0c88",
    "5f56d584ece1a5284cd2f6f533d5ff968791b80e45463be92447948fdc12505f",
    "b7f6a7ef3dd82d1599b3c2ce69e77bb24e1b7eb23982bbbdec1b3133e33a337e",
    "87630a41fbf214ca3c4f0d3b6ab53b906a986b74d620c40f3d31ca81c950eb82",
    "d0b51ac15c3e3f9147dfb54f2a9320c1030e11c94bcc1e29cdc3a377c54bd734",
    "b3cfe6731a4fafdb3e207fe50bf63ea8d70c7a34cc691dbee5500715286cc761",
    "4f800b532ac7b19e5c5a9d70fd91d8628fb35440a703e0eec9ab1bc910b9858f",
    "028d16bd93838f041377ec1e350c125800947c3db588ad830a5cea2940e52411",
    "e79584e91278d1a8e772f9f90fb83e485d8a3b29c773b7b1fd3d451460df384e",
    "cb80d3169b8aa3cf8ddef7f8ead29bd11526f4446457c02925177a297e2061b6",
    "75b22c060796ffbc348b7a64689f96dc415572b285bf846dd5fb5ef546cee9cf",
    "e0c8e9ccc1fac971d29e42a73b777c19fce7c5328a2cbf77f6828d98d92c2bab",
    "864691a1815396d4af5e75e94764df53ae2d910fbb4e64ae66e8f0ec4764929f",
    "168f39a6241bfd3996011a47b33be063d45c6e1335ccbb9128cd43b55c9ee788",
    "ba59636a513b05ee3ae33fae0058fdcfb930c59a1a887beccbf1326d68b4ed34",
  ];

  /* ---------- SHA-256 thuần, ĐỒNG BỘ (public-domain, Geraint Luff) ----------
     Cố ý KHÔNG dùng crypto.subtle: nó async + chỉ chạy trên HTTPS/localhost.
     Nhận chuỗi byte (0-255/ký tự), trả chuỗi hex 64 ký tự. */
  function sha256(ascii) {
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    var mathPow = Math.pow, maxWord = mathPow(2, 32), i, j, result = "";
    var words = [], asciiBitLength = ascii.length * 8;
    var hash = sha256.h = sha256.h || [];
    var k = sha256.k = sha256.k || [];
    var primeCounter = k.length;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += "\x80";
    while (ascii.length % 64 - 56) ascii += "\x00";
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return;                     // chỉ nhận byte 0-255 (đã UTF-8 hoá trước)
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0);
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : "") + b.toString(16);
      }
    }
    return result;
  }

  // Bọc UTF-8 để khớp .encode() (UTF-8) của Python. Mã + SALT toàn ASCII nên trùng,
  // nhưng giữ đúng nguyên tắc: hash trên byte, không trên code-point.
  function sha256Hex(str) { return sha256(unescape(encodeURIComponent(str))); }

  function normalize(code) { return String(code).toUpperCase().replace(/[^A-Z0-9]/g, ""); }

  function activate(code) {
    var h = sha256Hex(normalize(code) + SALT);
    if (HASHES.indexOf(h) >= 0) {
      try { localStorage.setItem(KEY, normalize(code)); } catch (e) {}
      return true;
    }
    return false;
  }

  // Đọc lại + RE-HASH kiểm chứng: ai dán rác thẳng vào localStorage cũng không qua được.
  function isPremium() {
    try {
      var stored = localStorage.getItem(KEY);
      if (!stored) return false;
      return HASHES.indexOf(sha256Hex(stored + SALT)) >= 0;
    } catch (e) { return false; }
  }

  function deactivate() { try { localStorage.removeItem(KEY); } catch (e) {} }

  return {
    activate: activate,
    isPremium: isPremium,
    deactivate: deactivate,

    /* ---------- MÓC TEST (chỉ test.html dùng) ---------- */
    __useTestKey: function () { KEY = "hcn_license_test"; try { localStorage.removeItem(KEY); } catch (e) {} },
    __setHashes: function (arr) { HASHES = arr; },
    __sha256: sha256Hex
  };
})();
