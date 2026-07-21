# Học cùng Nhí 🐉

Web app học tiếng Anh cho bé 3–7 tuổi, đồng hành cùng kênh YouTube
**[Long Nhí Học English](https://www.youtube.com/@LongNhiHocEnglish)**.

Bé ôn từ vựng và phonics theo từng tập phim: thẻ từ vựng, trò nghe-chọn,
luyện âm cùng Ông Rùa, và quiz cuối tập. Sao thưởng lưu ngay trên máy —
không tài khoản, không thu thập dữ liệu.

## Chạy thử tại máy
```bash
python -m http.server 8901
# mở http://localhost:8901
```

## Kỹ thuật
Web tĩnh thuần (HTML + CSS + JS, không framework, không build).
Giọng phát âm sinh sẵn thành MP3; thiếu file thì tự đọc bằng Web Speech API.
Thêm tập mới = thêm 1 object vào `data.js`.

*Kho này chỉ chứa mã nguồn app đã publish. Toàn bộ quy trình sản xuất kênh nằm ở kho riêng.*
