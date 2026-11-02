# LaserMaket Studio — Claude AI Yo'riqnomasi va Ish Standartlari

Ushbu hujjat **Claude Desktop**, **Claude Code** va boshqa sun'iy intellekt agentlari uchun asosiy qoidalar to'plamidir.
Loyiha papkasi: `D:\antigravity\Laser creater`
GitHub ombori: `https://github.com/Asil2004/laser_maket_studio.git`

---

## 1. Asosiy Qoida: Modellar va Lazer Chizmalari Qanday Yaratiladi?

1. **Alohida dummy sahifalar yoki qutilar chizmang!**
   - Hech qachon sodda to'rtburchak qutilar yoki alohida ajratilgan 3D sahifalar qilmang.
   - Barcha yangi modellar **LaserMaket Studio'ning o'zining ichki professional CAM dvigateliga** kiritilishi shart.
2. **Qayerga yoziladi?**
   - Yangi modellar va generatorlar: `LaserMaket_Studio/custom/all.js` fayliga qo'shiladi.
   - Generator formati:
     ```javascript
     window.__lmCustomF = window.__lmCustomF || [];
     window.__lmCustomF.push(function(__LMH) {
       return {
         id: "modelId",
         name: "✨ Model Nomi",
         description: "O'zbekcha batafsil tavsif",
         status: "ready",
         params: [ ... ],
         defaults: { ... },
         presets: [ ... ],
         validate: function(e) { return []; },
         generate: function(e) {
           // parts: [{ id, name, group, material, thickness, regions, placement, explode, stage, order, look, info }]
           return {
             parts: y,
             steps: st,
             drawings: [ ... ],
             summary: sm,
             checks: CK,
             extent: { radius, height, topRadius, steam },
             glueJoints: y.length * 2,
             stageNames: [ ... ]
           };
         }
       };
     });
     ```
3. **Har bir detalda bo'lishi shart bo'lgan xususiyatlar:**
   - **`regions`**: Tashqi kontur (`outer: [{x, y}, ...]`) va barcha tikan-o'yiqlar (finger joints), derazalar, tirqishlar (`holes: [[{x, y}, ...], ...]`).
   - **`placement`**: 3D fazodagi o'rni (`kind: 'horizontal'` yoki `kind: 'free'` bilan `ex`, `ey`, `ez`, `pos`).
   - **`explode`**: Foydalanuvchi `Ajratish` slayderini surtganda detalning harakatlanish vektori `[dx, dy, dz]`.
   - **`stage` va `order`**: `▶ Yig'ish` tugmasi bosilganda bosqichma-bosqich yig'ilish animatsiyasi.
   - **`look`**: Material ko'rinishi (`'wood'`, `'concrete'`, `'ground'`, `'red'`).

---

## 2. Yangilanishlarni GitHub'ga Push Qilish (Avtomatik Tizim)

Claude Desktop endi mustaqil ravishda GitHub'ga yangilanish chiqara oladi!

### A usul (Tavsiya etiladi — MCP orqali):
Sizda `lasermaket_sync_app_update` MCP vositasi mavjud.
Biror yangi model yoki o'zgarish kiritganingizdan so'ng, darhol quyidagicha chaqiring:
```json
lasermaket_sync_app_update({
  "action": "publish",
  "releaseNotes": "Yangi model qo'shildi: [Model nomi]"
})
```
**Nima sodir bo'ladi?**
- MCP server avtomatik ravishda versiyani 1 qadam oshiradi (masalan `1.0.88` → `1.0.89`).
- `LaserMaket_Studio/dist_update/update.zip` arxivini yaratadi.
- Kompyuterdagi o'rnatilgan ilovalarni yangilaydi.
- **`git add .`, `git commit` va `git push origin main` ni avtomatik bajaradi!**
- Foydalanuvchiga "Siz terminalda git push qiling" deb aytishingiz shart emas!

### B usul (Python skript orqali):
Foydalanuvchi quyidagi skriptni ham ishga tushirishi mumkin:
- `py auto_sync_claude.py push "Yangilanish izohi"`
- Yoki `CLAUDE_AVTO_PUSH.bat` faylini ikki marta bosish.
- Orqa fonda doimiy kuzatib, Claude saqlagan zahoti push qilish uchun: `CLAUDE_KUZATUVCHI_XIZMAT.bat`.

---

## 3. Qolgan Kompyuterlar Qanday Qabul Qiladi?

- LaserMaket Studio ilovasi yuqori o'ng burchagida versiya va yangilanish tugmasi joylashgan:
  - Odatiy holat: `[ v1.0.88 ] 🔄 Yangilanish`
  - Yangi versiya chiqqanda: `[ v1.0.89 ] ⚡ Yangilash!` (sariq miltillab yonadi).
- Qolgan 3 ta kompyuter ilovani ochganda shu tugmani bitta bosish bilan yangilanishni qabul qiladi.

---

## 4. AI so'rovlar navbati (API kalitsiz, Claude Desktop orqali)

Ilovada (`launch_studio.js`, localhost:3800) API kalit ham, Claude Code ham bo'lmasa, «🤖 AI generator» va «✏️ AI bilan tuzatish» so'rovlari navbatga yoziladi:
`LaserMaket_Studio/ai_queue/q_xxxx/`
- `request.json` — `kind` (`new` | `edit` | `review`), `target` (tuzatiladigan generator id), `prompt`, `remark`, `thickness`, `images`, `status`;
- `prompt.md` — Claude uchun to'liq vazifa (qo'llanma + joriy kod + talablar);
- `current.js` — tuzatishda joriy generator kodi;
- `rasm_1.jpg`… — asl rasmlar, 3D renderlar, skrinshotlar (tartibi `prompt.md` da yozilgan).

Foydalanuvchi «LaserMaket AI navbatini bajar» desa, Claude:
1. `ai_queue/` dagi `result.json` i yo'q papkalarni topadi, `request.json`, `prompt.md` va rasmlarni o'qiydi.
2. Rasmlarni diqqat bilan ko'rib, `prompt.md` dagi talablar bo'yicha to'liq parametrik generator yozadi (tuzatishda id o'zgarmaydi), uni sinaydi (validate/generate, detallar, 3D render).
3. Kodni `LaserMaket_Studio/custom/<id>.js` ga (+ `<id>.json` meta) yozadi.
4. Oxirida `ai_queue/q_xxxx/result.json` yozadi: `{"status":"done","id":"<id>","name":"<nom>","note":"nima qilindi"}` (bajara olmasa: `{"status":"error","message":"..."}`).
5. Ilova `result.json` ni 5 soniyada sezadi, `custom/all.js` ni qayta yig'adi va modelni o'zi ochadi.
6. So'ng `lasermaket_sync_app_update(action='publish')` bilan boshqa kompyuterlarga tarqatadi.

`ai_queue/` GitHub'ga yuklanmaydi (.gitignore).
