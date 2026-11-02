# AI Erkin Generator → Claude: professional generatorlar

## Qanday ishlaydi
1. `LaserMaket_Studio_Ishga_Tushirish.bat` ni ishga tushiring (localhost:3800).
2. AI Erkin Generator sahifasida o'ng pastdagi **★ Professional generatorlar** tugmasini bosing.
3. **🤖 Claude bilan professional generator** bo'limida:
   - birinchi marta Anthropic API kalitini kiriting (console.anthropic.com → API Keys);
   - 1–15 ta rasm tanlang (yoki sahifaning o'z yuklagichiga yuklangan rasmlar avtomatik olinadi);
   - nima yasashni yozing (o'lcham, qalinlik, harakatlanuvchi qismlar...);
   - **Claude'ga yuborish** ni bosing.
4. Claude 2–8 daqiqada to'liq parametrik generator yozadi: `LaserMaket_Studio/custom/<id>.js`.
5. Ilova generatorni yashirin oynada sinaydi. Xato bo'lsa, xato matnini Claude'ga qaytarib, avtomatik tuzattiradi (2 martagacha).
6. Tayyor generator asosiy studiyada (`index.html?gen=<id>`) ochiladi: 3D, yig'ish animatsiyasi, kesish listlari, SVG/DXF.

## Fayllar
- `claude_bridge.js` — Claude API bilan ishlovchi server moduli (launch_studio.js ichidan chaqiriladi).
- `claude_guide.md` — Claude uchun generator yozish qo'llanmasi (format, yordamchi funksiyalar, muhandislik qoidalari).
- `claude_examples/*.js` — namunaviy generatorlar (Claude ulardan uslub o'rganadi). Yangi yaxshi generatorlarni shu yerga qo'shsangiz, sifat yanada oshadi.
- `custom/` — Claude yaratgan generatorlar; `custom/all.js` avtomatik yig'iladi va `index.html` uni yuklaydi.
- `claude-config.json` — API kaliti va model (GitHubga YUKLANMAYDI, .gitignore da).

## Model
- `claude-opus-5-5` — eng sifatli (standart).
- `claude-sonnet-5-5` — tezroq va arzonroq.
Har so'rov API hisobingizdan to'lanadi (taxminan qo'llanma + namunalar ~20 ming token + rasmlar + javob ~10–25 ming token).

## Boshqa kompyuterlar
Git orqali `LaserMaket_Studio/` papkasini oling. `custom/` dagi generatorlar ham birga keladi. Har kompyuterda API kalitini bir marta kiriting.
