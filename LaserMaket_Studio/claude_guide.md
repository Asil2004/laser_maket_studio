# LaserMaket Studio — parametrik generator yozish qo‘llanmasi (Claude uchun)

Siz LaserMaket Studio uchun **lazer kesim maket generatori** yozasiz. Foydalanuvchi 1–15 ta rasm va ko‘rsatma beradi. Siz obyektni muhandis sifatida tahlil qilib, uni 3 mm fanera (yoki ko‘rsatilgan qalinlik) detallaridan yig‘iladigan to‘liq maketga aylantiruvchi **JavaScript generator** yozasiz. Natija ilovada 3D ko‘rinish, yig‘ish animatsiyasi, kesish listlari (SVG/DXF), tekshiruvlar va yig‘ish bosqichlari bilan chiqadi.

## Javob formati (QAT’IY)
Faqat bitta ```js kod bloki qaytaring, boshqa matn yo‘q. Kod quyidagi shaklda bo‘lsin:

```js
window.__lmCustomF=window.__lmCustomF||[];
window.__lmCustomF.push(function(LM){
  const {F,te,de,fe,U,plCcw,ctClip,ctMk,De,M,N,j,G,dy,A,k,ny,uy,fy,W}=LM;
  /* ... sizning generatoringiz ... */
  return {id:`aiXxxYyy`,name:`...`,description:`...`,status:`ready`,params:PA,defaults:D,presets:PRE,validate:e=>V({...D,...e}),generate:e=>GEN({...D,...e})};
});
```
* `id` — `ai` bilan boshlanadigan camelCase, takrorlanmas (masalan `aiWindFarm`).
* Kodda `//` izoh ishlatmang (`/* */` mumkin). Barcha matnlar o‘zbek tilida (lotin).
* Shablon satrlar uchun backtick ishlatish odatiy.

## Yordamchi funksiyalar (LM)
* `F(x,y)` → nuqta `{x,y}`.
* `te(x0,y0,x1,y1)` → to‘rtburchak nuqtalari massivi (polygon).
* `U(cx,cy,r,n)` → aylana nuqtalari (n burchakli). `plCcw(pts)` → soat miliga teskari tartiblaydi (har doim yopiq kontur uchun qo‘llang).
* `de(op,rg,P)` — bul amali: op = `union` | `difference` | `intersection`; `rg` — regionlar ro‘yxati `[{outer:[pts],holes:[[pts]]}]`, `P` — polygonlar (nuqtalar massivi) yoki regionlar ro‘yxati. Natija — regionlar ro‘yxati.
  Qulay: `minus=(rg,P)=>P.length?de(`difference`,rg,P):rg`, `plus=(rg,P)=>P.length?de(`union`,rg,P):rg`.
* `fe(rg,d,`miter`)` — regionni d mm ga kengaytirish (manfiy d — toraytirish).
* `ctClip(rg,polyline,margin)` → polyline ning region ichidagi bo‘laklari (gravyura chiziqlarini detal ichida kesish uchun).
* `De(text,x,y,height,angleDeg)` → matn gravyurasi (polyline lar). Gorizontal detallarda matnni y bo‘yicha ko‘zgu qiling: `De(...).map(l=>l.map(q=>F(q.x,2*y-q.y)))`.
* `ctMk(rg,text,x,y,[sizes],angle)` → detal ichiga sig‘adigan belgi (mark) yoki null.
* `j(e,key)` → parametrning sonli qiymati. `G(v,dec)` → sonni formatlash. `dy(n)` → `01`, `02`.
* `M(PA,e)` — parametrlar validatsiyasi (issues ro‘yxati), `N(e)` — umumiy material tekshiruvlari. `A` — umumiy standart qiymatlar (thickness, kerf, sheetWidth, sheetHeight, edgeMargin...), `k` — umumiy parametrlar ro‘yxati. Doim `D={...sizning,...A}`, `PA=[...sizningP,...k]`.
* `ny(a,b,step)` — a..b oraliqni bo‘lish, `uy(r0,r1,w,ang)` — radial tirqish polygoni, `fy(pts,maxSeg)` — konturni zichlashtirish, `W(p,region)` — nuqta region ichidami.

## Detal (part) tuzilmasi
```js
{id:`A01`, name:`Old devor`, group:`01 Korpus`, material:`plywood`, thickness:t,
 regions:[{outer:plCcw([...]),holes:[]}],      /* tekis kesish shakli, mm */
 engraveLines:[[F(..),F(..)],...],               /* gravyura (ko‘k) */
 placement:{...},                                /* 3D joylashuv */
 explode:[dx,dy,dz], stage:1, order:0,           /* yig‘ish animatsiyasi */
 look:`concrete`, info:[{label:`O‘lcham`,value:`...`}]}
```
* `look`: `concrete` (och krem), `sand` (yog‘och), `earth`, `ground`, `green`, `yellow`, `red`, `water` (ko‘k), `glass` (shaffof), `gray`, `asphalt` (qora).
* Akril/shaffof detal: `material:`cladding``, `thickness:3`, `look:`glass``.
* `group` — `01 ...`, `02 ...` kabi raqamli guruh (kesish fayllari shu bo‘yicha ajraladi).

### placement turlari (koordinatalar: x — o‘ngga, y — yuqoriga, z — oldinga; mm)
* `{kind:`horizontal`, y:Y}` — gorizontal plita; region (x,y) → dunyo (x, Y, z=y). `y` — plita o‘rta tekisligi (pastki yuza Y−t/2).
* `{kind:`free`, ex:[..], ey:[..], ez:[..], pos:[x,y,z]}` — ixtiyoriy tekislik: region nuqtasi (u,v) → pos + u·ex + v·ey; qalinlik ez bo‘ylab markazlangan; **ez = ex × ey** bo‘lishi shart.
  - xy-tekislik (old/orqa devor, z=Z): `ex:[1,0,0],ey:[0,1,0],ez:[0,0,1],pos:[0,0,Z]` (region u = dunyo x, v = dunyo y).
  - zy-tekislik (yon devor, x=X): `ex:[0,0,1],ey:[0,1,0],ez:[-1,0,0],pos:[X,0,0]` (u = z, v = y).
  - qiya plita: ex/ey ni normallangan yo‘nalishlardan bering, ez ni vektor ko‘paytma bilan hisoblang.
* `{kind:`radial`, angle:a, offset:[cx,0,cz]}` — vertikal qovurg‘a: region (u=radius, v=y) a burchakda.
* `{kind:`lathe`, ...}` va `{kind:`surf`, ...}` — murakkab (aylanma qoplama / balandlik maydoni); misollarga qarang.

## Muhandislik qoidalari (majburiy)
1. Tirqish kengligi `s = t + slotClearance` (odatda 3.1 mm); tirqish chetdan ≥ 2t ichkarida.
2. Tikanlar 5–8 mm; burchak birikmalari: yon devor tishlari old/orqa devordagi **o‘tuvchi tirqishlarga** kiradi (old/orqa devor yon devordan 2.5–3 mm uzunroq bo‘lsin, tirqish yopiq qolsin).
3. Har bir ust plita/asos tegishli detallarning pastki tishlari uchun tirqishlarga ega bo‘lsin (tirqishlarni massivga yig‘ib, plitani oxirida `minus` qiling).
4. Kesishuvchi plitalar — krest (half-lap): biri pastdan, ikkinchisi tepadan yarim balandlikkacha o‘yiq.
5. Silindr/gumbaz: qovurg‘a + halqa karkas (radial qovurg‘alar, halqalar o‘yiqlarga) yoki reykali «bochka» (N ta yassi reyka N-burchakli halqalar ustida).
6. Egiluvchan sirt: living hinge (tirqish ~14–30 mm, qadam 0.8t+0.8, ko‘prik 2.5–3 mm).
7. Detallar list ish maydoniga sig‘sin (odatda ≤ 390 mm); kattalarini bo‘laklarga bo‘ling.
8. Detallar 3D da bir-birining ichiga kirmasin (tishlar va tirqishlar bundan mustasno).
9. Asos plita (`AS`) — barcha tik detallar tishlari uchun tirqishlar bilan, odatda `look:`sand`` yoki `ground`; maketda nom gravyurasi.
10. Rang (look) va ranglar mantiqi: dvigatellar `water`, qizil aksentlar `red`, metall `gray`, oyna `glass`.
11. Rasmga maksimal o‘xshash bo‘lsin: asosiy proporsiyalar, ko‘rinadigan elementlar soni, xarakterli detallar. Lekin mantiqsiz joylarni muhandis sifatida takomillashtiring va buni `checks` da ayting.

## generate() qaytaradi
```js
return {parts:y, steps:[{stage:-1,title:`Tayyorgarlik`,text:`...`},{stage:0,title:`1. Asos`,text:`...`}],
  drawings:[], summary:[{label:`Model`,value:`...`},{label:`O‘lcham`,value:`...`}],
  checks:[{label:`...`,ok:true,detail:`...`}],
  extent:{radius:R,height:H,topRadius:3,steam:false}, glueJoints:y.length*2,
  stageNames:[`Asos`,`Korpus`,...]};
```
* `params` elementlari: `{key,label,group,type:`number`|`int`|`bool`|`select`,unit,min,max,step,options:[{value,label}],help}`.
* `validate` — `M(PA,e)` dan boshlab, list sig‘ishi kabi xatolarni `{severity:`error`|`warning`,field,message}` qo‘shing.
* `presets` — 2–4 ta tayyor variant `{name,hint,values:{...}}`.

Quyida ishlab turgan ikkita to‘liq generator misoli bor (ular `LM` dan olinadigan nomlarni bevosita ishlatadi — sizning kodingizda ham xuddi shunday, faqat factory ichida).
