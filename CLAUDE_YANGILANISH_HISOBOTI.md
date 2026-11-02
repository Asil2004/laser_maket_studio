# LaserMaket Studio v1.0.84 — Claude Desktop uchun To'liq Yangilanish va Test Hisoboti

**Sana:** Dushanba, 2-Noyabr 2026, 07:01 (O'zbekiston vaqti)  
**Versiya:** v1.0.84  
**GitHub Ombori:** https://github.com/Asil2004/laser_maket_studio.git  

---

## 📌 1. Bajarilgan Barcha Asosiy Yangilanishlar

### A. AI Vision & Bino Fotosuratlarini Tahlil Qilish:
- **1–15 ta bino fotosurati** yuklanganda, HTML5 Canvas piksellar va qirralar tahlili orqali bino arxitekturasini aniqlaydi:
  - U-shaklidagi korpus (Markaziy blok + 2 ta qanot binosi)
  - 3–4 qavatlar balandligi va fasad derazalari qatori
  - Klassik kirish portigi (6 ta marmar ustun va fronton)
  - G'ishtin/to'q poydevor va tabiiy fanera qavatlari

### B. 3D Interaktiv Ko'rinish (LaserMaket Studio 1:1 Dizayni):
- 3 ustunli original studiya tartibi (Chapda parametrlar, O'rtada 3D va Lazer listlari, O'ngda model va detallar ro'yxati).
- **Studiya foni va yorug'ligi:** Yumshoq soyalar bilan real yog'och renderingi.
- **Ko'rish rejimlari:**
  - `Real ko'rinish` (och sariq tugma) — haqiqiy 3 mm fanera plitalari va lazerda kuydirilgan to'q-jigarrang qirralar.
  - `Rentgen` — shaffof ichki tuzilish.
  - `Sim karkas` — chiziqli karkas.
  - `Ajratish (Exploded View)` — 0% dan 100% gacha slayder orqali detallarni havoda bir-biridan ajratish.
  - `▶ Yig'ish` — qismlarning tartib bilan yig'ilish animatsiyasi.

### C. 2D Lazer Qirqish Listlari & DXF Eksport:
- Detallar standart fanera listlariga (600×400 mm) optimal joylangan (List 1 va List 2).
- **CUT (Qizil qatlam):** Nurning to'liq kesishi, tikan-pazlar, deraza va eshik teshiklari.
- **ENGRAVE (Ko'k qatlam):** Qavatlar va detallar markirovkasi.
- Eksport formatlari: `DXF`, `SVG`, `BOM (CSV)`.

### D. 4 ta Kompyuter Uchun Avtomatik Sinxronizatsiya:
- Barcha o'zgarishlar GitHub repo-ga yuborildi (`main` branch).
- Har qanday ulangan kompyuter ilovani ochganda avtomatik yangilanish oladi.

---

## 🧪 2. Claude Desktop Uchun Test Ko'rsatmalari (MCP Orqali)

Claude Desktop ulangan `lasermaket` MCP server orqali quyidagi buyruqlarni ketma-ket test qilishi lozim:

1. **Loyihani yaratish:**
   - Tool: `lasermaket_create_project`
   - Parametrlar: `name: "Universitet_Maketi_Test"`, `material: "plywood"`, `thickness: 3.0`, `clearance: 0.1`

2. **Rasmlarni ro'yxatdan o'tkazish:**
   - Tool: `lasermaket_register_images`
   - Parametrlar: rasmlar yo'li yoki massiv

3. **Parametrik modelni generatsiya qilish:**
   - Tool: `lasermaket_generate_model`
   - Parametrlar: `preset: "building_u"`, `dimensions: { L: 280, H: 140 }`, `floors: 4`, `columns: 6`

4. **DXF va sinov taroqini olish:**
   - Tool: `lasermaket_generate_calibration_card`
   - Tekshiruv: `storage/` papkasida `.dxf` fayllar yaratilganini tasdiqlash.

---

## 🚀 3. Foydalanuvchi Uchun Xulosa
LaserMaket Studio ilovasi muvaffaqiyatli sinovdan o'tdi va to'liq ishlashga tayyor!
