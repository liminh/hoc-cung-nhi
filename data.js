// DATA — nội dung học theo curriculum thật (wiki/pedagogy.md + series/ep_0NN/metadata.md).
// Cập nhật 2026-07-15: đủ 30 tập (5 chặng).
// Thêm tập mới = (1) thêm từ mới vào W nếu chưa có, (2) thêm 1 object vào EPISODES.
// audio: tên file trong webapp/audio/ (thiếu file → app tự fallback Web Speech API).

// ---- Từ điển từ vựng (dùng chung; tập ôn tập tái dùng từ tập trước) ----
var W = {
  // ep_001
  hello:       { en: "Hello",        vi: "Xin chào",       emoji: "👋", audio: "hello.mp3",        tts: "hello" },
  good_morning:{ en: "Good morning", vi: "Chào buổi sáng", emoji: "🌅", audio: "good_morning.mp3", tts: "good morning" },
  bye:         { en: "Bye",          vi: "Tạm biệt",       emoji: "🙋", audio: "bye.mp3",          tts: "bye" },
  // ep_002
  apple:  { en: "Apple",  vi: "Quả táo",  emoji: "🍎", audio: "apple.mp3",  tts: "apple" },
  banana: { en: "Banana", vi: "Quả chuối", emoji: "🍌", audio: "banana.mp3", tts: "banana" },
  orange: { en: "Orange", vi: "Quả cam",  emoji: "🍊", audio: "orange.mp3", tts: "orange" },
  // ep_003
  cat:  { en: "Cat",  vi: "Con mèo", emoji: "🐱", audio: "cat.mp3",  tts: "cat" },
  dog:  { en: "Dog",  vi: "Con chó", emoji: "🐶", audio: "dog.mp3",  tts: "dog" },
  duck: { en: "Duck", vi: "Con vịt", emoji: "🦆", audio: "duck.mp3", tts: "duck" },
  // ep_004
  one:   { en: "One",   vi: "Số một (1)", emoji: "1️⃣", audio: "one.mp3",   tts: "one" },
  two:   { en: "Two",   vi: "Số hai (2)", emoji: "2️⃣", audio: "two.mp3",   tts: "two" },
  three: { en: "Three", vi: "Số ba (3)",  emoji: "3️⃣", audio: "three.mp3", tts: "three" },
  // ep_005
  green:  { en: "Green",  vi: "Màu xanh lá", emoji: "🟢", audio: "green.mp3",  tts: "green" },
  yellow: { en: "Yellow", vi: "Màu vàng",    emoji: "🟡", audio: "yellow.mp3", tts: "yellow" },
  red:    { en: "Red",    vi: "Màu đỏ",      emoji: "🔴", audio: "red.mp3",    tts: "red" },
  // ep_006
  eyes: { en: "Eyes", vi: "Đôi mắt", emoji: "👀", audio: "eyes.mp3", tts: "eyes" },
  ears: { en: "Ears", vi: "Đôi tai", emoji: "👂", audio: "ears.mp3", tts: "ears" },
  nose: { en: "Nose", vi: "Cái mũi", emoji: "👃", audio: "nose.mp3", tts: "nose" },
  // ep_008
  mom:  { en: "Mom",  vi: "Mẹ",    emoji: "👩", audio: "mom.mp3",  tts: "mom" },
  dad:  { en: "Dad",  vi: "Bố",    emoji: "👨", audio: "dad.mp3",  tts: "dad" },
  baby: { en: "Baby", vi: "Em bé", emoji: "👶", audio: "baby.mp3", tts: "baby" },
  // ep_009
  rice: { en: "Rice", vi: "Cơm",   emoji: "🍚", audio: "rice.mp3", tts: "rice" },
  fish: { en: "Fish", vi: "Con cá", emoji: "🐟", audio: "fish.mp3", tts: "fish" },
  egg:  { en: "Egg",  vi: "Quả trứng", emoji: "🥚", audio: "egg.mp3", tts: "egg" },
  // ep_010
  four: { en: "Four", vi: "Số bốn (4)", emoji: "4️⃣", audio: "four.mp3", tts: "four" },
  five: { en: "Five", vi: "Số năm (5)", emoji: "5️⃣", audio: "five.mp3", tts: "five" },
  six:  { en: "Six",  vi: "Số sáu (6)", emoji: "6️⃣", audio: "six.mp3",  tts: "six" },
  // ep_011
  sunny: { en: "Sunny", vi: "Trời nắng", emoji: "☀️", audio: "sunny.mp3", tts: "sunny" },
  rainy: { en: "Rainy", vi: "Trời mưa",  emoji: "🌧️", audio: "rainy.mp3", tts: "rainy" },
  windy: { en: "Windy", vi: "Trời gió",  emoji: "🌬️", audio: "windy.mp3", tts: "windy" },
  // ep_012
  shirt: { en: "Shirt", vi: "Cái áo",  emoji: "👕", audio: "shirt.mp3", tts: "shirt" },
  hat:   { en: "Hat",   vi: "Cái nón", emoji: "🧢", audio: "hat.mp3",   tts: "hat" },
  shoes: { en: "Shoes", vi: "Đôi giày", emoji: "👟", audio: "shoes.mp3", tts: "shoes" },
  // ep_014
  cow:   { en: "Cow",   vi: "Con bò",   emoji: "🐮", audio: "cow.mp3",   tts: "cow" },
  horse: { en: "Horse", vi: "Con ngựa", emoji: "🐴", audio: "horse.mp3", tts: "horse" },
  pig:   { en: "Pig",   vi: "Con heo",  emoji: "🐷", audio: "pig.mp3",   tts: "pig" },
  // ep_015
  run:  { en: "Run",  vi: "Chạy", emoji: "🏃", audio: "run.mp3",  tts: "run" },
  jump: { en: "Jump", vi: "Nhảy", emoji: "🤸", audio: "jump.mp3", tts: "jump" },
  swim: { en: "Swim", vi: "Bơi",  emoji: "🏊", audio: "swim.mp3", tts: "swim" },
  // ep_016
  happy: { en: "Happy", vi: "Vui",  emoji: "😊", audio: "happy.mp3", tts: "happy" },
  sad:   { en: "Sad",   vi: "Buồn", emoji: "😢", audio: "sad.mp3",   tts: "sad" },
  angry: { en: "Angry", vi: "Giận", emoji: "😠", audio: "angry.mp3", tts: "angry" },
  // ep_017
  table: { en: "Table", vi: "Cái bàn",    emoji: "🍽️", audio: "table.mp3", tts: "table" },
  chair: { en: "Chair", vi: "Cái ghế",    emoji: "🪑", audio: "chair.mp3", tts: "chair" },
  bed:   { en: "Bed",   vi: "Cái giường", emoji: "🛏️", audio: "bed.mp3",   tts: "bed" },
  // ep_018
  jackfruit: { en: "Jackfruit", vi: "Quả mít",  emoji: "🍈", audio: "jackfruit.mp3", tts: "jackfruit" },
  mango:     { en: "Mango",     vi: "Quả xoài", emoji: "🥭", audio: "mango.mp3",     tts: "mango" },
  coconut:   { en: "Coconut",   vi: "Quả dừa",  emoji: "🥥", audio: "coconut.mp3",   tts: "coconut" },
  // ep_019
  book: { en: "Book", vi: "Quyển sách", emoji: "📖", audio: "book.mp3", tts: "book" },
  bag:  { en: "Bag",  vi: "Cái cặp",   emoji: "🎒", audio: "bag.mp3",  tts: "bag" },
  pen:  { en: "Pen",  vi: "Cây bút",   emoji: "🖊️", audio: "pen.mp3",  tts: "pen" },
  // ep_020
  car:  { en: "Car",  vi: "Xe hơi",     emoji: "🚗", audio: "car.mp3",  tts: "car" },
  bike: { en: "Bike", vi: "Xe đạp",     emoji: "🚲", audio: "bike.mp3", tts: "bike" },
  boat: { en: "Boat", vi: "Cái thuyền", emoji: "⛵", audio: "boat.mp3", tts: "boat" },
  // ep_021
  tree:   { en: "Tree",   vi: "Cái cây",  emoji: "🌳", audio: "tree.mp3",   tts: "tree" },
  flower: { en: "Flower", vi: "Bông hoa", emoji: "🌸", audio: "flower.mp3", tts: "flower" },
  sun:    { en: "Sun",    vi: "Mặt trời", emoji: "🌞", audio: "sun.mp3",    tts: "sun" },
  // ep_022
  eat:   { en: "Eat",   vi: "Ăn",   emoji: "😋", audio: "eat.mp3",   tts: "eat" },
  drink: { en: "Drink", vi: "Uống", emoji: "🥤", audio: "drink.mp3", tts: "drink" },
  sleep: { en: "Sleep", vi: "Ngủ",  emoji: "😴", audio: "sleep.mp3", tts: "sleep" },
  // ep_023
  please:    { en: "Please",    vi: "Làm ơn",  emoji: "🥺", audio: "please.mp3",    tts: "please" },
  thank_you: { en: "Thank you", vi: "Cảm ơn",  emoji: "🤗", audio: "thank_you.mp3", tts: "thank you" },
  sorry:     { en: "Sorry",     vi: "Xin lỗi", emoji: "😔", audio: "sorry.mp3",     tts: "sorry" },
  // ep_024
  seven: { en: "Seven", vi: "Số bảy (7)",  emoji: "7️⃣", audio: "seven.mp3", tts: "seven" },
  eight: { en: "Eight", vi: "Số tám (8)",  emoji: "8️⃣", audio: "eight.mp3", tts: "eight" },
  nine:  { en: "Nine",  vi: "Số chín (9)", emoji: "9️⃣", audio: "nine.mp3",  tts: "nine" },
  ten:   { en: "Ten",   vi: "Số mười (10)", emoji: "🔟", audio: "ten.mp3",  tts: "ten" },
  // ep_027
  bee:       { en: "Bee",       vi: "Con ong",  emoji: "🐝", audio: "bee.mp3",       tts: "bee" },
  butterfly: { en: "Butterfly", vi: "Con bướm", emoji: "🦋", audio: "butterfly.mp3", tts: "butterfly" },
  ant:       { en: "Ant",       vi: "Con kiến", emoji: "🐜", audio: "ant.mp3",       tts: "ant" },
  // ep_028
  big:   { en: "Big",   vi: "To",  emoji: "🐘", audio: "big.mp3",   tts: "big" },
  small: { en: "Small", vi: "Nhỏ", emoji: "🐭", audio: "small.mp3", tts: "small" },
  long:  { en: "Long",  vi: "Dài", emoji: "📏", audio: "long.mp3",  tts: "long" },
  // ep_029
  milk:  { en: "Milk",  vi: "Sữa",       emoji: "🥛", audio: "milk.mp3",  tts: "milk" },
  bread: { en: "Bread", vi: "Bánh mì",   emoji: "🍞", audio: "bread.mp3", tts: "bread" },
  cake:  { en: "Cake",  vi: "Bánh ngọt", emoji: "🍰", audio: "cake.mp3",  tts: "cake" },
};

// Gắn id ổn định cho mỗi từ = chính khoá trong W ("thank_you"), KHÔNG phải chữ hiển thị.
// progress.js khoá dữ liệu học theo id này → sửa chữ hiển thị không làm mất tiến độ của bé.
Object.keys(W).forEach(function (k) { W[k].id = k; });

// ---- Khối phonics dùng chung (chữ cái → âm; app phát audio âm, nút từ phát audio từ) ----
function P(letter, sound, soundVi, audio, words, hint) {
  return { letter: letter, sound: sound, soundVi: soundVi, audio: audio, words: words, hint: hint };
}

var EPISODES = [
  {
    id: "ep_001", num: 1, title: "Chào buổi sáng", subtitle: "Hello · Good morning · Bye",
    scene: "🌅",
    vocab: [W.hello, W.good_morning, W.bye],
    phonics: [P("H", "/h/", "hờ", "ph_h.mp3", ["Hello"], "HE-LLO bắt đầu bằng âm /h/")],
  },
  {
    id: "ep_002", num: 2, title: "Ra chợ cùng Ông Rùa", subtitle: "Apple · Banana · Orange",
    scene: "🍎",
    vocab: [W.apple, W.banana, W.orange],
    phonics: [P("A", "/a/", "a", "ph_a.mp3", ["Apple"], "A-PPLE bắt đầu bằng âm /a/")],
  },
  {
    id: "ep_003", num: 3, title: "Bạn của Nhí", subtitle: "Cat · Dog · Duck",
    scene: "🐱",
    vocab: [W.cat, W.dog, W.duck],
    phonics: [
      P("C", "/k/", "cờ", "ph_k.mp3", ["Cat"], "CAT bắt đầu bằng âm /k/"),
      P("D", "/d/", "đờ", "ph_d.mp3", ["Dog", "Duck"], "DOG và DUCK cùng bắt đầu bằng âm /d/"),
    ],
  },
  {
    id: "ep_004", num: 4, title: "Đếm cùng Nhí", subtitle: "One · Two · Three",
    scene: "🔢",
    vocab: [W.one, W.two, W.three],
    phonics: [], // tập số — không dạy phonics
  },
  {
    id: "ep_005", num: 5, title: "Màu của cánh đồng", subtitle: "Green · Yellow · Red",
    scene: "🌈",
    vocab: [W.green, W.yellow, W.red],
    phonics: [
      P("G", "/g/", "gờ", "ph_g.mp3", ["Green"], "GREEN bắt đầu bằng âm /g/"),
      P("R", "/r/", "rờ", "ph_r.mp3", ["Red"], "RED bắt đầu bằng âm /r/"),
    ],
  },
  {
    id: "ep_006", num: 6, title: "Cơ thể của Nhí", subtitle: "Eyes · Ears · Nose",
    scene: "👀",
    vocab: [W.eyes, W.ears, W.nose],
    phonics: [P("N", "/n/", "nờ", "ph_n.mp3", ["Nose"], "NOSE bắt đầu bằng âm /n/")],
  },
  {
    id: "ep_007", num: 7, title: "Ôn tập 1 — Bài hát hội làng", subtitle: "Ôn tập 01–06 🎵",
    scene: "🎵",
    vocab: [W.hello, W.good_morning, W.bye, W.apple, W.banana, W.orange,
            W.cat, W.dog, W.duck, W.one, W.two, W.three,
            W.green, W.yellow, W.red, W.eyes, W.ears, W.nose],
    phonics: [], // tập ôn — hát lại, không phonics mới
  },
  {
    id: "ep_008", num: 8, title: "Gia đình của Nhí", subtitle: "Mom · Dad · Baby",
    scene: "👨‍👩‍👧",
    vocab: [W.mom, W.dad, W.baby],
    phonics: [P("B", "/b/", "bờ", "ph_b.mp3", ["Baby"], "BABY bắt đầu bằng âm /b/")],
  },
  {
    id: "ep_009", num: 9, title: "Món ăn của Nhí", subtitle: "Rice · Fish · Egg",
    scene: "🍚",
    vocab: [W.rice, W.fish, W.egg],
    phonics: [P("F", "/f/", "phờ", "ph_f.mp3", ["Fish"], "FISH bắt đầu bằng âm /f/ — cắn nhẹ môi thổi hơi")],
  },
  {
    id: "ep_010", num: 10, title: "Đếm tiếp cùng Nhí", subtitle: "Four · Five · Six",
    scene: "🖐️",
    vocab: [W.four, W.five, W.six],
    phonics: [P("F", "/f/", "phờ", "ph_f.mp3", ["Four", "Five"], "FOUR và FIVE cùng bắt đầu bằng âm /f/")],
  },
  {
    id: "ep_011", num: 11, title: "Thời tiết hôm nay", subtitle: "Sunny · Rainy · Windy",
    scene: "⛅",
    vocab: [W.sunny, W.rainy, W.windy],
    phonics: [], // tập thời tiết — chưa gắn phonics
  },
  {
    id: "ep_012", num: 12, title: "Mặc gì hôm nay?", subtitle: "Shirt · Hat · Shoes",
    scene: "👕",
    vocab: [W.shirt, W.hat, W.shoes],
    phonics: [P("SH", "/ʃ/", "sờ (suỵt)", "ph_sh.mp3", ["Shirt", "Shoes"], "SHIRT và SHOES bắt đầu bằng âm /sh/ — như tiếng “suỵt”")],
  },
  {
    id: "ep_013", num: 13, title: "Ôn tập 2 — Bài hát", subtitle: "Ôn tập 08–12 🎵",
    scene: "🎶",
    vocab: [W.mom, W.dad, W.baby, W.rice, W.fish, W.egg,
            W.four, W.five, W.six, W.sunny, W.rainy, W.windy,
            W.shirt, W.hat, W.shoes],
    phonics: [],
  },
  {
    id: "ep_014", num: 14, title: "Con vật trang trại", subtitle: "Cow · Horse · Pig",
    scene: "🐮",
    vocab: [W.cow, W.horse, W.pig],
    phonics: [P("P", "/p/", "pờ", "ph_p.mp3", ["Pig"], "PIG bắt đầu bằng âm /p/")],
  },
  {
    id: "ep_015", num: 15, title: "Cùng Nhí vận động", subtitle: "Run · Jump · Swim",
    scene: "🏃",
    vocab: [W.run, W.jump, W.swim],
    phonics: [], // tập động từ hành động — trọng tâm vận động, không phonics
  },
  {
    id: "ep_016", num: 16, title: "Cảm xúc của Nhí", subtitle: "Happy · Sad · Angry",
    scene: "😊",
    vocab: [W.happy, W.sad, W.angry],
    phonics: [P("A", "/æ/", "a (miệng rộng)", "ph_ae.mp3", ["Angry"], "ANGRY bắt đầu bằng âm /æ/ — miệng mở rộng")],
  },
  {
    id: "ep_017", num: 17, title: "Đồ vật trong nhà", subtitle: "Table · Chair · Bed",
    scene: "🛏️",
    vocab: [W.table, W.chair, W.bed],
    phonics: [P("B", "/b/", "bờ", "ph_b.mp3", ["Bed"], "BED bắt đầu bằng âm /b/ — mím môi rồi bật nhẹ")],
  },
  {
    id: "ep_018", num: 18, title: "Trái cây quê ở chợ", subtitle: "Jackfruit · Mango · Coconut",
    scene: "🥭",
    vocab: [W.jackfruit, W.mango, W.coconut],
    phonics: [P("C", "/k/", "cờ", "ph_k.mp3", ["Coconut"], "COCONUT bắt đầu bằng âm /k/ — bật nhẹ ở cổ họng")],
  },
  {
    id: "ep_019", num: 19, title: "Đồ dùng đi học", subtitle: "Book · Bag · Pen",
    scene: "📚",
    vocab: [W.book, W.bag, W.pen],
    phonics: [P("P", "/p/", "pờ", "ph_p.mp3", ["Pen"], "PEN bắt đầu bằng âm /p/ — bật hơi ở môi")],
  },
  {
    id: "ep_020", num: 20, title: "Xe chạy bon bon", subtitle: "Car · Bike · Boat",
    scene: "🚗",
    vocab: [W.car, W.bike, W.boat],
    phonics: [P("C", "/k/", "cờ", "ph_k.mp3", ["Car"], "CAR bắt đầu bằng âm /k/")],
  },
  {
    id: "ep_021", num: 21, title: "Thiên nhiên ngoài đồng", subtitle: "Tree · Flower · Sun",
    scene: "🌳",
    vocab: [W.tree, W.flower, W.sun],
    phonics: [P("F", "/f/", "phờ", "ph_f.mp3", ["Flower"], "FLOWER bắt đầu bằng âm /f/ — cắn nhẹ môi thổi hơi")],
  },
  {
    id: "ep_022", num: 22, title: "Một ngày của Nhí", subtitle: "Eat · Drink · Sleep",
    scene: "🍜",
    vocab: [W.eat, W.drink, W.sleep],
    phonics: [P("D", "/d/", "đờ", "ph_d.mp3", ["Drink"], "DRINK bắt đầu bằng âm /d/")],
  },
  {
    id: "ep_023", num: 23, title: "Lời nói lịch sự", subtitle: "Please · Thank you · Sorry",
    scene: "🙏",
    vocab: [W.please, W.thank_you, W.sorry],
    phonics: [], // tập tình huống lễ phép — không phonics
  },
  {
    id: "ep_024", num: 24, title: "Đếm 7 đến 10", subtitle: "Seven · Eight · Nine · Ten",
    scene: "🐣",
    vocab: [W.seven, W.eight, W.nine, W.ten],
    phonics: [P("T", "/t/", "tờ", "ph_t.mp3", ["Ten"], "TEN bắt đầu bằng âm /t/ — đầu lưỡi chạm răng bật nhẹ")],
  },
  {
    id: "ep_025", num: 25, title: "Ôn tập 3 — Hát ở hội làng", subtitle: "Ôn tập 18–24 🎵",
    scene: "🏮",
    vocab: [W.mango, W.jackfruit, W.coconut, W.book, W.pen, W.bag,
            W.boat, W.bike, W.tree, W.flower, W.please, W.thank_you],
    phonics: [], // tập ôn — 12 từ đúng theo series/ep_025/script.md
  },
  {
    id: "ep_026", num: 26, title: "Ngày đặc biệt của Nhí", subtitle: "Ôn cả Mùa 1 🎉",
    scene: "🎉",
    vocab: [W.table, W.chair, W.bed, W.book, W.mango, W.cow, W.horse, W.pig,
            W.one, W.two, W.three, W.red, W.yellow, W.green,
            W.tree, W.flower, W.sun, W.car, W.eat, W.drink, W.please, W.thank_you],
    phonics: [], // tập đặc biệt chốt Mùa 1 — danh sách từ theo series/ep_026/script.md (bỏ BLUE vì chưa dạy)
  },
  {
    id: "ep_027", num: 27, title: "Khu vườn nhỏ — chào Mùa 2!", subtitle: "Bee · Butterfly · Ant",
    scene: "🐝",
    vocab: [W.bee, W.butterfly, W.ant],
    phonics: [P("B", "/b/", "bờ", "ph_b.mp3", ["Bee"], "BEE bắt đầu bằng âm /b/ — mím môi rồi bật nhẹ")],
  },
  {
    id: "ep_028", num: 28, title: "To hay nhỏ nhỉ?", subtitle: "Big · Small · Long",
    scene: "🔍",
    vocab: [W.big, W.small, W.long],
    phonics: [P("L", "/l/", "lờ", "ph_l.mp3", ["Long"], "LONG bắt đầu bằng âm /l/ — cong lưỡi chạm lợi trên")],
  },
  {
    id: "ep_029", num: 29, title: "Món ăn ngon", subtitle: "Milk · Bread · Cake",
    scene: "🍰",
    vocab: [W.milk, W.bread, W.cake],
    phonics: [P("C", "/k/", "cờ", "ph_k.mp3", ["Cake"], "CAKE bắt đầu bằng âm /k/")],
  },
  {
    id: "ep_030", num: 30, title: "Ôn tập 4 — chào Mùa 2", subtitle: "Ôn tập 27–29 🎵",
    scene: "🎊",
    vocab: [W.bee, W.butterfly, W.ant, W.big, W.small, W.long, W.milk, W.bread, W.cake],
    phonics: [],
  },
];

// ---- Chặng phiêu lưu (nhóm hiển thị ở Home; from/to = ep.num) ----
var STAGES = [
  { icon: "🌱", name: "Chặng 1 · Chào Làng Cỏ Xanh",  tagline: "Những từ tiếng Anh đầu tiên của Nhí!",                    from: 1,  to: 7 },
  { icon: "🏡", name: "Chặng 2 · Ngôi Nhà Của Nhí",   tagline: "Gia đình, món ăn, quần áo — thân quen mỗi ngày!",        from: 8,  to: 13 },
  { icon: "🐮", name: "Chặng 3 · Phiêu Lưu Quanh Làng", tagline: "Ra trang trại, vận động, khám phá đủ thứ!",            from: 14, to: 19 },
  { icon: "🎉", name: "Chặng 4 · Hội Làng Rộn Ràng",  tagline: "Xe cộ, thiên nhiên, lễ phép — và đại tiệc Mùa 1!",       from: 20, to: 26 },
  { icon: "🐝", name: "Mùa 2 · Khu Vườn Bí Mật",      tagline: "Cuộc phiêu lưu mới bắt đầu!",                            from: 27, to: 30 },
];

// Gắn videoId cho từng tập TỪ videos.js (file tự sinh bởi webapp/sync_videos.py).
// videos.js chỉ chứa tập ĐÃ PUBLIC trên YouTube; tập vắng mặt → videoId=null → "Sắp lên sóng".
EPISODES.forEach(function (ep) {
  ep.videoId = (typeof VIDEO_IDS !== "undefined" && VIDEO_IDS[ep.id]) ? VIDEO_IDS[ep.id] : null;
});

// Câu hệ thống (giọng Nhí)
var SYS_AUDIO = {
  correct: { audio: "sys_correct.mp3", tts: "Đúng rồi! Great job!", lang: "vi-VN" },
  retry:   { audio: "sys_retry.mp3",   tts: "Thử lại nhé!", lang: "vi-VN" },
  sayit:   { audio: "sys_sayit.mp3",   tts: "Say it with Nhí!", lang: "vi-VN" },
};

// Freemium: tập 1..FREE_UPTO miễn phí (hết Chặng 2), tập sau khóa bằng mã kích hoạt.
// Đổi số này là đổi ranh giới free — không cần đụng gì khác.
var FREE_UPTO = 13;
