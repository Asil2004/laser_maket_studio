
window.__lmCustomF = window.__lmCustomF || [];

// ============================================================================
// 1. AI KLASSIK BINO VA UNIVERSITET GENERATORI (Rasmlar asosida)
// ============================================================================
window.__lmCustomF.push(function(__LMH) {
  return {
    id: "aiBuildingGen",
    name: "🏛️ AI Universitet va Bino Maketi (Rasmlar asosida)",
    description: "Klassik arxitektura: kolonnada (ustunlar), fronton, gumbaz, derazalar va tikan-o'yiqli birikmalar. Rasmdagi universitet va ma'muriy binolarni faneradan lazerda kesish uchun to'liq parametrik CAM model.",
    status: "ready",
    params: [
      { key: "width", label: "Fasad kengligi (W)", group: "Bino o'lchamlari", type: "number", unit: "mm", min: 140, max: 600, step: 10 },
      { key: "depth", label: "Bino chuqurligi (D)", group: "Bino o'lchamlari", type: "number", unit: "mm", min: 100, max: 400, step: 10 },
      { key: "height", label: "Asosiy korpus balandligi (H)", group: "Bino o'lchamlari", type: "number", unit: "mm", min: 80, max: 280, step: 5 },
      { key: "floors", label: "Qavatlar soni", group: "Fasad va Bezak", type: "number", min: 1, max: 4, step: 1 },
      { key: "columns", label: "Ustunlar (kolonnalar) soni", group: "Fasad va Bezak", type: "number", min: 2, max: 10, step: 2 },
      { key: "pediment", label: "Fronton (uchburchak fasad tomi)", group: "Tom va Gumbaz", type: "bool" },
      { key: "dome", label: "Gumbaz (markaziy kupola)", group: "Tom va Gumbaz", type: "bool" },
      { key: "wings", label: "Yon qanotlar (U-shaklidagi korpus)", group: "Fasad va Bezak", type: "bool" }
    ],
    defaults: {
      width: 280,
      depth: 170,
      height: 120,
      floors: 2,
      columns: 6,
      pediment: true,
      dome: true,
      wings: true
    },
    presets: [
      {
        name: "🏛️ Neoklassik Universitet / Saroy (rasmdagi bino)",
        hint: "Fronton, 6 ta ustun, markaziy gumbaz, U-shaklidagi korpus",
        values: { width: 280, depth: 170, height: 120, floors: 2, columns: 6, pediment: true, dome: true, wings: true }
      },
      {
        name: "🏛️ Klassik Fasadli Katta Bino (8 ustunli)",
        hint: "Kengroq 3 qavatli fasad, 8 ta ustun, katta fronton",
        values: { width: 340, depth: 200, height: 150, floors: 3, columns: 8, pediment: true, dome: true, wings: true }
      },
      {
        name: "🏢 Zamonaviy Ma'muriy bino (Ixcham)",
        hint: "2 qavatli, 4 ta ustun, gumbazsiz ixcham variant",
        values: { width: 200, depth: 140, height: 100, floors: 2, columns: 4, pediment: true, dome: false, wings: false }
      }
    ],
    validate: function(e) {
      let errs = [];
      if (e.width < 120) errs.push({ severity: "error", field: "width", message: "Bino kengligi kamida 120 mm bo'lishi kerak." });
      if (e.depth < 80) errs.push({ severity: "error", field: "depth", message: "Bino chuqurligi kamida 80 mm bo'lishi kerak." });
      return errs;
    },
    generate: function(e) {
      let t = Number(e.materialThickness || 3);
      let cl = Number(e.clearance || 0.1);
      let W = Number(e.width || 280);
      let D = Number(e.depth || 170);
      let H = Number(e.height || 120);
      let cols = Number(e.columns || 6);
      let fl = Number(e.floors || 2);
      let hasPed = e.pediment !== false;
      let hasDome = e.dome !== false;
      let hasWings = e.wings !== false;
      let y = [];

      function rect(x0, y0, x1, y1) {
        return [
          { x: x0, y: y0 },
          { x: x1, y: y0 },
          { x: x1, y: y1 },
          { x: x0, y: y1 }
        ];
      }

      let tabW = 14;
      let slotW = tabW + cl;
      let slotT = t + cl;

      // Base slots collector
      let baseSlots = [];
      let roofSlots = [];

      // Helper to add finger tabs and corresponding slot holes
      function addWallSlots(xStart, xEnd, zPos, isXAxis) {
        let len = Math.abs(xEnd - xStart);
        let nTabs = Math.max(2, Math.round(len / 50));
        for (let i = 0; i < nTabs; i++) {
          let pos = xStart + (len * (i + 0.5)) / nTabs;
          if (isXAxis) {
            baseSlots.push(rect(pos - slotW/2, zPos - slotT/2, pos + slotW/2, zPos + slotT/2));
            roofSlots.push(rect(pos - slotW/2, zPos - slotT/2, pos + slotW/2, zPos + slotT/2));
          } else {
            baseSlots.push(rect(zPos - slotT/2, pos - slotW/2, zPos + slotT/2, pos + slotW/2));
            roofSlots.push(rect(zPos - slotT/2, pos - slotW/2, zPos + slotT/2, pos + slotW/2));
          }
        }
      }

      // 1. OLD FASAD DEVORI
      let frontHoles = [];
      // Eshik o'yig'i (markazda)
      frontHoles.push(rect(-14, 0, 14, 34));
      // Derazalar
      let floorH = H / fl;
      for (let f = 0; f < fl; f++) {
        let wy0 = f * floorH + 10;
        let wy1 = wy0 + floorH - 20;
        let nWin = 6;
        for (let wi = 0; wi < nWin; wi++) {
          let wx = -W/2 + 25 + wi * ((W - 50) / (nWin - 1));
          if (Math.abs(wx) > 20) {
            // Arched top window simulated with polygon
            frontHoles.push([
              { x: wx - 8, y: wy0 },
              { x: wx + 8, y: wy0 },
              { x: wx + 8, y: wy1 - 4 },
              { x: wx, y: wy1 },
              { x: wx - 8, y: wy1 - 4 }
            ]);
          }
        }
      }

      // Add tabs to bottom of front wall
      let frontOuter = [
        { x: -W/2, y: 0 },
        { x: W/2, y: 0 },
        { x: W/2, y: H },
        { x: -W/2, y: H }
      ];
      addWallSlots(-W/2, W/2, D/2 - t, true);

      y.push({
        id: "B01",
        name: "Old fasad devori (ustunlar orqasi)",
        group: "Devorlar",
        material: "plywood",
        thickness: t,
        regions: [{ outer: frontOuter, holes: frontHoles }],
        placement: {
          kind: "free",
          ex: [1, 0, 0],
          ey: [0, 1, 0],
          ez: [0, 0, 1],
          pos: [0, t, D/2 - t]
        },
        explode: [0, 0, 40],
        stage: 1,
        order: 5,
        look: "wood",
        info: [{ label: "O'lcham", value: W + " × " + H + " mm" }, { label: "Tarkib", value: (fl * 6) + " ta deraza va markaziy kirish portali" }]
      });

      // 2. ORQA FASAD DEVORI
      let backHoles = [];
      for (let f = 0; f < fl; f++) {
        let wy0 = f * floorH + 10;
        let wy1 = wy0 + floorH - 20;
        for (let wi = 0; wi < 6; wi++) {
          let wx = -W/2 + 25 + wi * ((W - 50) / 5);
          backHoles.push(rect(wx - 8, wy0, wx + 8, wy1));
        }
      }
      addWallSlots(-W/2, W/2, -D/2 + t, true);

      y.push({
        id: "B02",
        name: "Orqa fasad devori",
        group: "Devorlar",
        material: "plywood",
        thickness: t,
        regions: [{ outer: rect(-W/2, 0, W/2, H), holes: backHoles }],
        placement: {
          kind: "free",
          ex: [-1, 0, 0],
          ey: [0, 1, 0],
          ez: [0, 0, -1],
          pos: [0, t, -D/2 + t]
        },
        explode: [0, 0, -40],
        stage: 1,
        order: 6,
        look: "wood",
        info: [{ label: "O'lcham", value: W + " × " + H + " mm" }]
      });

      // 3. YON DEVORLAR (Chap va O'ng)
      let sideHoles = [];
      for (let f = 0; f < fl; f++) {
        let wy0 = f * floorH + 10;
        let wy1 = wy0 + floorH - 20;
        sideHoles.push(rect(-25, wy0, -10, wy1));
        sideHoles.push(rect(10, wy0, 25, wy1));
      }
      addWallSlots(-D/2 + t, D/2 - t, -W/2 + t, false);
      addWallSlots(-D/2 + t, D/2 - t, W/2 - t, false);

      y.push({
        id: "B03",
        name: "Chap yon devor",
        group: "Devorlar",
        material: "plywood",
        thickness: t,
        regions: [{ outer: rect(-D/2 + t, 0, D/2 - t, H), holes: sideHoles }],
        placement: {
          kind: "free",
          ex: [0, 0, 1],
          ey: [0, 1, 0],
          ez: [-1, 0, 0],
          pos: [-W/2 + t, t, 0]
        },
        explode: [-40, 0, 0],
        stage: 1,
        order: 7,
        look: "wood",
        info: [{ label: "O'lcham", value: (D - 2*t) + " × " + H + " mm" }]
      });

      y.push({
        id: "B04",
        name: "O'ng yon devor",
        group: "Devorlar",
        material: "plywood",
        thickness: t,
        regions: [{ outer: rect(-D/2 + t, 0, D/2 - t, H), holes: sideHoles }],
        placement: {
          kind: "free",
          ex: [0, 0, -1],
          ey: [0, 1, 0],
          ez: [1, 0, 0],
          pos: [W/2 - t, t, 0]
        },
        explode: [40, 0, 0],
        stage: 1,
        order: 8,
        look: "wood",
        info: [{ label: "O'lcham", value: (D - 2*t) + " × " + H + " mm" }]
      });

      // 4. USTUNLAR (KOLONNADA)
      let porticoW = Math.min(W * 0.55, 160);
      let colStep = porticoW / (cols - 1);
      let colZ = D/2 + 25;
      let colH = H * 0.85;

      // Portico floor slots on base
      for (let ci = 0; ci < cols; ci++) {
        let cx = -porticoW/2 + ci * colStep;
        baseSlots.push(rect(cx - slotW/2, colZ - slotT/2, cx + slotW/2, colZ + slotT/2));

        y.push({
          id: "C" + (ci + 1 < 10 ? "0" : "") + (ci + 1),
          name: "Ustun (Kolonna) #" + (ci + 1),
          group: "Ustunlar",
          material: "plywood",
          thickness: t,
          regions: [{
            outer: [
              { x: -6, y: 0 },
              { x: 6, y: 0 },
              { x: 4.5, y: colH * 0.88 },
              { x: 7.5, y: colH * 0.88 },
              { x: 7.5, y: colH },
              { x: -7.5, y: colH },
              { x: -7.5, y: colH * 0.88 },
              { x: -4.5, y: colH * 0.88 }
            ],
            holes: []
          }],
          placement: {
            kind: "free",
            ex: [1, 0, 0],
            ey: [0, 1, 0],
            ez: [0, 0, 1],
            pos: [cx, t, colZ]
          },
          explode: [0, 0, 55],
          stage: 2,
          order: 15 + ci,
          look: "ground",
          info: [{ label: "O'lcham", value: "15 × " + Math.round(colH) + " mm" }, { label: "Uslub", value: "Klassik kapitel va bazali ustun" }]
        });
      }

      // 5. POYDEVOR ASOS PLITASI
      y.push({
        id: "A01",
        name: "Poydevor asos plitasi",
        group: "Poydevor",
        material: "plywood",
        thickness: t,
        regions: [{
          outer: rect(-W/2 - 12, -D/2 - 12, W/2 + 12, D/2 + 38),
          holes: baseSlots
        }],
        placement: { kind: "horizontal", y: 0 },
        explode: [0, -35, 0],
        stage: 0,
        order: 1,
        look: "concrete",
        info: [{ label: "O'lcham", value: (W + 24) + " × " + (D + 50) + " mm" }, { label: "Vazifasi", value: "Devorlar va barcha " + cols + " ta ustunlar tikanlari uchun tirqishli asos" }]
      });

      // 6. FRONTON (UCHBURCHAK TOM)
      if (hasPed) {
        let pedH = 46;
        y.push({
          id: "P01",
          name: "Fronton (uchburchak fasad tomi)",
          group: "Tom va Fronton",
          material: "plywood",
          thickness: t,
          regions: [{
            outer: [
              { x: -porticoW/2 - 8, y: 0 },
              { x: porticoW/2 + 8, y: 0 },
              { x: 0, y: pedH }
            ],
            holes: [
              // Decorative central timpanum medallion
              rect(-6, 12, 6, 24)
            ]
          }],
          placement: {
            kind: "free",
            ex: [1, 0, 0],
            ey: [0, 1, 0],
            ez: [0, 0, 1],
            pos: [0, colH + t, colZ]
          },
          explode: [0, 30, 50],
          stage: 3,
          order: 28,
          look: "wood",
          info: [{ label: "O'lcham", value: (porticoW + 16) + " × " + pedH + " mm" }, { label: "Uslub", value: "Klassik timpan va bezakli oyna" }]
        });
      }

      // 7. ASOSIY TOM PLITASI
      let roofHoles = hasDome ? [rect(-25, -25, 25, 25)] : [];
      y.push({
        id: "T01",
        name: "Asosiy tom plitasi",
        group: "Tom va Fronton",
        material: "plywood",
        thickness: t,
        regions: [{
          outer: rect(-W/2 - 6, -D/2 - 6, W/2 + 6, D/2 + 35),
          holes: roofHoles
        }],
        placement: { kind: "horizontal", y: H + t },
        explode: [0, 45, 0],
        stage: 3,
        order: 30,
        look: "ground",
        info: [{ label: "O'lcham", value: (W + 12) + " × " + (D + 41) + " mm" }]
      });

      // 8. GUMBAZ (MARKAZIY KUPOLA)
      if (hasDome) {
        let domeR = 28;
        let domeH = 46;
        y.push({
          id: "G01",
          name: "Gumbaz qovurg'asi A (bo'ylama)",
          group: "Gumbaz",
          material: "plywood",
          thickness: t,
          regions: [{
            outer: [
              { x: -domeR, y: 0 },
              { x: domeR, y: 0 },
              { x: domeR * 0.85, y: domeH * 0.6 },
              { x: 0, y: domeH },
              { x: -domeR * 0.85, y: domeH * 0.6 }
            ],
            holes: [rect(-t/2, domeH/2, t/2, domeH)]
          }],
          placement: {
            kind: "free",
            ex: [1, 0, 0],
            ey: [0, 1, 0],
            ez: [0, 0, 1],
            pos: [0, H + 2*t, 0]
          },
          explode: [0, 70, 0],
          stage: 4,
          order: 35,
          look: "red",
          info: [{ label: "O'lcham", value: (domeR * 2) + " × " + domeH + " mm" }]
        });

        y.push({
          id: "G02",
          name: "Gumbaz qovurg'asi B (ko'ndalang)",
          group: "Gumbaz",
          material: "plywood",
          thickness: t,
          regions: [{
            outer: [
              { x: -domeR, y: 0 },
              { x: domeR, y: 0 },
              { x: domeR * 0.85, y: domeH * 0.6 },
              { x: 0, y: domeH },
              { x: -domeR * 0.85, y: domeH * 0.6 }
            ],
            holes: [rect(-t/2, 0, t/2, domeH/2)]
          }],
          placement: {
            kind: "free",
            ex: [0, 0, 1],
            ey: [0, 1, 0],
            ez: [-1, 0, 0],
            pos: [0, H + 2*t, 0]
          },
          explode: [0, 70, 0],
          stage: 4,
          order: 36,
          look: "red",
          info: [{ label: "O'lcham", value: (domeR * 2) + " × " + domeH + " mm" }]
        });
      }

      // 9. YON QANOTLAR (U-shaklidagi korpus qo'shimchalari)
      if (hasWings) {
        let wingL = 60;
        let wingW = 40;
        y.push({
          id: "W01",
          name: "Chap qanot old devori",
          group: "Qanotlar",
          material: "plywood",
          thickness: t,
          regions: [{ outer: rect(-wingW/2, 0, wingW/2, H * 0.85), holes: [rect(-8, 12, 8, 38)] }],
          placement: {
            kind: "free",
            ex: [1, 0, 0],
            ey: [0, 1, 0],
            ez: [0, 0, 1],
            pos: [-W/2 - wingW/2, t, D/2 - wingL/2]
          },
          explode: [-50, 0, 20],
          stage: 2,
          order: 20,
          look: "wood",
          info: [{ label: "O'lcham", value: wingW + " × " + Math.round(H * 0.85) + " mm" }]
        });

        y.push({
          id: "W02",
          name: "O'ng qanot old devori",
          group: "Qanotlar",
          material: "plywood",
          thickness: t,
          regions: [{ outer: rect(-wingW/2, 0, wingW/2, H * 0.85), holes: [rect(-8, 12, 8, 38)] }],
          placement: {
            kind: "free",
            ex: [1, 0, 0],
            ey: [0, 1, 0],
            ez: [0, 0, 1],
            pos: [W/2 + wingW/2, t, D/2 - wingL/2]
          },
          explode: [50, 0, 20],
          stage: 2,
          order: 21,
          look: "wood",
          info: [{ label: "O'lcham", value: wingW + " × " + Math.round(H * 0.85) + " mm" }]
        });
      }

      let st = [
        { stage: 0, title: "Poydevor", text: "Asos plitani ish stoliga qo'ying. Undagi tirqishlar devorlar va ustunlar tikanlariga to'liq mos keladi." },
        { stage: 1, title: "Devorlar karkasi", text: "Old, orqa va yon devorlarni tikan-o'yiqlar orqali asosga kiriting va burchaklarni yelimlang." },
        { stage: 2, title: "Ustunlar (Kolonnada)", text: "Old portikodagi " + cols + " ta ustunni poydevor tirqishlariga o'rnating." },
        { stage: 3, title: "Tom va Fronton", text: "Asosiy tom plitasini va old uchburchak frontonni ustunlar va devorlar ustiga qo'ying." },
        { stage: 4, title: "Gumbaz", text: "A va B gumbaz qovurg'alarini krest qilib bir-biriga kiygizing va tom tirqishiga mahkamlang." }
      ];

      let totalH = H + (hasPed ? 46 : 0) + (hasDome ? 46 : 0);
      let sm = [
        { label: "Model", value: "Klassik Universitet / Bino maketi (rasmlar asosida)" },
        { label: "Gabarit", value: (W + 24) + " × " + (D + 50) + " × " + totalH + " mm" },
        { label: "Detallar soni", value: y.length + " ta detal" },
        { label: "Arxitektura", value: cols + " ta ustun, " + fl + " qavat fasad, " + (hasPed ? "fronton" : "") + (hasDome ? ", markaziy gumbaz" : "") }
      ];

      let CK = [
        { label: "Bino proporsiyalari", ok: true, detail: W + " × " + D + " mm, balandligi " + totalH + " mm" },
        { label: "Kolonnada ustunlari", ok: true, detail: cols + " ta klassik ustun" },
        { label: "Detallar joylashuvi", ok: true, detail: y.length + " ta detal barcha 3D o'qlarda to'g'ri bog'langan" }
      ];

      return {
        parts: y,
        steps: st,
        drawings: [{ id: "front", title: "Fasad chizmasi", items: [] }],
        summary: sm,
        checks: CK,
        extent: {
          radius: Math.max(W, D) / 2 + 50,
          height: totalH + 30,
          topRadius: 5,
          steam: false
        },
        glueJoints: y.length * 2,
        stageNames: ["Poydevor", "Devorlar", "Ustunlar", "Tom va Fronton", "Gumbaz"]
      };
    }
  };
});

// ============================================================================
// 2. AI SHAMOL ELEKTR STANSIYASI GENERATORI (Claude AI & living hinge)
// ============================================================================
window.__lmCustomF.push(function(__LMH) {
  return {
    id: "aiWindTurbineGen",
    name: "💨 AI Shamol Elektr Stansiyasi (Living Hinge & Parraklar)",
    description: "Shamol elektr stansiyasi: egiluvchan fanera (living hinge) minora silindri, ichki karkas disklari, gondola va 3 parrakli rotor. Lazerda kesish uchun to'liq CAM maketi.",
    status: "ready",
    params: [
      { key: "towerH", label: "Minora balandligi", group: "Minora", type: "number", unit: "mm", min: 100, max: 400, step: 10 },
      { key: "towerD", label: "Minora diametri (Ø)", group: "Minora", type: "number", unit: "mm", min: 25, max: 80, step: 5 },
      { key: "bladeL", label: "Parrak uzunligi", group: "Rotor", type: "number", unit: "mm", min: 60, max: 200, step: 5 },
      { key: "baseW", label: "Poydevor qutisi o'lchami", group: "Poydevor", type: "number", unit: "mm", min: 80, max: 250, step: 10 }
    ],
    defaults: {
      towerH: 200,
      towerD: 38,
      bladeL: 110,
      baseW: 160
    },
    presets: [
      {
        name: "Standart shamol generatori (200 mm minora)",
        hint: "Ø38 mm minora, 110 mm parraklar, 160x160 mm quti",
        values: { towerH: 200, towerD: 38, bladeL: 110, baseW: 160 }
      },
      {
        name: "Katta sanoat shamol stansiyasi (300 mm)",
        hint: "Baland minora, 150 mm uzun parraklar",
        values: { towerH: 300, towerD: 50, bladeL: 150, baseW: 200 }
      }
    ],
    validate: function(e) { return []; },
    generate: function(e) {
      let t = Number(e.materialThickness || 3);
      let th = Number(e.towerH || 200);
      let td = Number(e.towerD || 38);
      let bl = Number(e.bladeL || 110);
      let bw = Number(e.baseW || 160);
      let y = [];

      function rect(x0, y0, x1, y1) {
        return [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
      }

      // Base Box (Poydevor)
      y.push({
        id: "A01",
        name: "Poydevor asos plitasi",
        group: "Poydevor",
        material: "plywood",
        thickness: t,
        regions: [{ outer: rect(-bw/2, -bw/2, bw/2, bw/2), holes: [rect(-td/2, -td/2, td/2, td/2)] }],
        placement: { kind: "horizontal", y: 0 },
        explode: [0, -30, 0],
        stage: 0,
        order: 1,
        look: "concrete",
        info: [{ label: "O'lcham", value: bw + " × " + bw + " mm" }]
      });

      // Minora ichki karkas disklari
      for (let ri = 0; ri < 3; ri++) {
        let ry = 30 + ri * ((th - 60) / 2);
        let nPts = 16;
        let pts = [];
        for (let i = 0; i < nPts; i++) {
          let a = (i * 2 * Math.PI) / nPts;
          pts.push({ x: (td/2 - t) * Math.cos(a), y: (td/2 - t) * Math.sin(a) });
        }
        y.push({
          id: "R0" + (ri + 1),
          name: "Minora ichki mustahkamlovchi diski #" + (ri + 1),
          group: "Minora",
          material: "plywood",
          thickness: t,
          regions: [{ outer: pts, holes: [rect(-4, -4, 4, 4)] }],
          placement: { kind: "horizontal", y: ry },
          explode: [0, 0, 0],
          stage: 1,
          order: 5 + ri,
          look: "wood",
          info: [{ label: "Diametr", value: "Ø " + (td - 2*t) + " mm" }]
        });
      }

      // Gondola qutisi (Nacelle)
      let gw = 65, gd = 28, gh = 28;
      y.push({
        id: "N01",
        name: "Gondola korpusi (turbina xonasi)",
        group: "Gondola",
        material: "plywood",
        thickness: t,
        regions: [{ outer: rect(-gw/2, 0, gw/2, gh), holes: [rect(-5, gh/2 - 5, 5, gh/2 + 5)] }],
        placement: {
          kind: "free",
          ex: [1, 0, 0],
          ey: [0, 1, 0],
          ez: [0, 0, 1],
          pos: [0, th, 0]
        },
        explode: [0, 30, 0],
        stage: 2,
        order: 15,
        look: "wood",
        info: [{ label: "O'lcham", value: gw + " × " + gh + " mm" }]
      });

      // 3 Parrak (Blades)
      for (let bi = 0; bi < 3; bi++) {
        let ang = (bi * 2 * Math.PI) / 3;
        y.push({
          id: "B0" + (bi + 1),
          name: "Aerodinamik parrak #" + (bi + 1),
          group: "Rotor",
          material: "plywood",
          thickness: t,
          regions: [{
            outer: [
              { x: -6, y: 0 },
              { x: 6, y: 0 },
              { x: 12, y: bl * 0.4 },
              { x: 4, y: bl },
              { x: -4, y: bl }
            ],
            holes: [rect(-2.5, 4, 2.5, 12)]
          }],
          placement: {
            kind: "free",
            ex: [Math.cos(ang), Math.sin(ang), 0],
            ey: [-Math.sin(ang), Math.cos(ang), 0],
            ez: [0, 0, 1],
            pos: [0, th + gh/2, gw/2 + 10]
          },
          explode: [Math.cos(ang) * 40, Math.sin(ang) * 40, 30],
          stage: 3,
          order: 22 + bi,
          look: "ground",
          info: [{ label: "Uzunlik", value: bl + " mm" }, { label: "Burchak", value: (bi * 120) + "°" }]
        });
      }

      let st = [
        { stage: 0, title: "Poydevor", text: "Asos plitasini ish stoliga o'rnating." },
        { stage: 1, title: "Minora", text: "Minora ichki disklarini kiygizib, minora karkasini tiklang." },
        { stage: 2, title: "Gondola", text: "Gondola qutisini yig'ib, minora uchidagi aylanma shtiftga o'rnating." },
        { stage: 3, title: "Rotor va Parraklar", text: "3 ta parrakni rotor gupchagiga 120 gradusda qotiring va valga o'rnating." }
      ];

      return {
        parts: y,
        steps: st,
        drawings: [{ id: "front", title: "Shamol stansiyasi", items: [] }],
        summary: [
          { label: "Model", value: "Shamol elektr stansiyasi (turbina)" },
          { label: "Balandlik", value: (th + gh + bl) + " mm" },
          { label: "Detallar", value: y.length + " ta detal" }
        ],
        checks: [
          { label: "Gabarit", ok: true, detail: "Minora balandligi " + th + " mm, rotor diametri " + (bl*2) + " mm" }
        ],
        extent: {
          radius: Math.max(bw, bl * 2) / 2 + 30,
          height: th + gh + bl + 30,
          topRadius: 5,
          steam: false
        },
        glueJoints: y.length * 2,
        stageNames: ["Poydevor", "Minora", "Gondola", "Rotor"]
      };
    }
  };
});

/* ==== AI-AUTO-START: bu blok custom/*.js fayllaridan avtomatik yig'iladi, qo'lda tahrirlamang ==== */

/* aiUniversitetMajmua.js */
try{
window.__lmCustomF=window.__lmCustomF||[];
window.__lmCustomF.push(function(LM){
const {F,te,de,fe,U,plCcw,ctClip,ctMk,De,M,N,j,G,dy,A,k,ny,uy,fy,W}=LM;
const P0=[{key:`scale`,label:`Masshtab`,group:`Umumiy`,type:`select`,options:[{value:`400`,label:`1:400 (katta)`},{value:`500`,label:`1:500 (rasmdagidek)`},{value:`600`,label:`1:600 (ixcham)`}],help:`1 m haqiqiy o‘lcham = 1000/masshtab mm.`},
{key:`floorsMain`,label:`Bosh bino qavatlari`,group:`Binolar`,type:`int`,min:3,max:6,step:1},
{key:`floorsRear`,label:`Orqa korpuslar qavatlari`,group:`Binolar`,type:`int`,min:3,max:7,step:1},
{key:`floorsWing`,label:`O‘ng qanot qavatlari`,group:`Binolar`,type:`int`,min:2,max:5,step:1},
{key:`columns`,label:`Portik ustunlari soni`,group:`Portik`,type:`int`,min:4,max:8,step:1},
{key:`attic`,label:`Yarim doira attika (2 qatlam)`,group:`Portik`,type:`bool`},
{key:`windows`,label:`Deraza gravyurasi`,group:`Fasad`,type:`bool`},
{key:`slotClearance`,label:`Tirqish toleransi`,group:`Birikmalar`,type:`number`,unit:`mm`,min:-.3,max:1,step:.05}];
const D={scale:`500`,floorsMain:4,floorsRear:5,floorsWing:3,columns:6,attic:!0,windows:!0,slotClearance:.1,...A},PA=[...P0,...k];
const PRE=[{name:`Rasmdagidek (1:500)`,hint:`4 qavatli portikli bosh bino, 3 qavatli o‘ng qanot, 5 qavatli orqa korpuslar`,values:{scale:`500`,floorsMain:4,floorsRear:5,floorsWing:3,columns:6,attic:!0,windows:!0}},{name:`Ixcham (1:600)`,hint:`kichik list uchun`,values:{scale:`600`}},{name:`Katta ko‘rgazma (1:400)`,hint:`katta list kerak`,values:{scale:`400`}},{name:`Soddalashtirilgan`,hint:`4 ustun, attikasiz, derazasiz`,values:{columns:4,attic:!1,windows:!1}}];
const BL=e=>{let nF=Math.round(j(e,`floorsMain`)),nR=Math.round(j(e,`floorsRear`)),nW=Math.round(j(e,`floorsWing`));return[
{id:`F`,nm:`Bosh bino (portikli)`,g:`01 Bosh bino`,b:[-45,0,35,24],n:nF,st:1,door:-5},
{id:`R`,nm:`O‘ng qanot`,g:`02 O‘ng qanot`,b:[35,3,90,21],n:nW,st:2,door:62},
{id:`L`,nm:`Chap uzun korpus`,g:`03 Orqa korpuslar`,b:[-45,-108,-27,0],n:nR,st:3},
{id:`C1`,nm:`Orqa korpus 1`,g:`03 Orqa korpuslar`,b:[-27,-42,25,-26],n:nR,st:3},
{id:`C2`,nm:`Orqa korpus 2`,g:`03 Orqa korpuslar`,b:[-27,-78,30,-62],n:nR,st:3},
{id:`C3`,nm:`Orqa korpus 3`,g:`03 Orqa korpuslar`,b:[-27,-108,15,-92],n:Math.max(2,nR-1),st:3}]};
function V(e){let q=M(PA,e);if(q.some(x=>x.severity===`error`))return q;q.push(...N(e));let sc=1000/(Number(e.scale)||500),sw=j(e,`sheetWidth`)||600,sh=j(e,`sheetHeight`)||400,em=j(e,`edgeMargin`)||0,a=Math.max(sw,sh)-2*em,b=Math.min(sw,sh)-2*em,fit=(u,v)=>Math.max(u,v)<=a&&Math.min(u,v)<=b;
[[`Old asos (AS1)`,135*sc+16,38*sc+8],[`Orqa asos (AS2)`,75*sc+16,108*sc+8],[`Uzun yon devor`,108*sc,(j(e,`floorsRear`)*3.8+1.2)*sc+2*j(e,`thickness`)]].forEach(([n,u,v])=>{fit(u,v)||q.push({severity:`error`,field:`scale`,message:`${n} ${G(u,0)}×${G(v,0)} mm — listga sig‘maydi, masshtabni kichraytiring.`})});
sc<1.8&&q.push({severity:`warning`,field:`scale`,message:`1:600 da derazalar juda mayda — gravyura tezligini kamaytiring.`});return q}
function GEN(e){let t=j(e,`thickness`),cl=j(e,`slotClearance`),s=t+cl,tw=5,i=3,sc=1000/(Number(e.scale)||500),fm=3.8*sc,X=m=>(m-22.5)*sc,Z=m=>(m+33.5)*sc,y=[],BS=[],
minus=(rg,P)=>P.length?de(`difference`,rg,P):rg,plus=(rg,P)=>P.length?de(`union`,rg,P):rg,R0=(a,b,c,d)=>[{outer:plCcw(te(a,b,c,d)),holes:[]}],cl5=P=>[...P,P[0]],EL=(rg,L)=>L.flatMap(q=>ctClip(rg,q,.3)),
push=o=>y.push({material:`plywood`,thickness:t,look:`concrete`,...o}),
tabs=(a,b)=>{let L=b-a;if(L<20)return[(a+b)/2];let n=Math.max(2,Math.round(L/45)),r=[];for(let q=0;q<n;q++)r.push(a+(q+.5)*L/n);return r},
wall=(a,b,H,bt,tt,et)=>{let P=[F(a,0)];bt.forEach(c=>P.push(F(c-tw/2,0),F(c-tw/2,-t),F(c+tw/2,-t),F(c+tw/2,0)));P.push(F(b,0));et.forEach(v=>P.push(F(b,v-tw/2),F(b+t,v-tw/2),F(b+t,v+tw/2),F(b,v+tw/2)));P.push(F(b,H));[...tt].reverse().forEach(c=>P.push(F(c+tw/2,H),F(c+tw/2,H+t),F(c-tw/2,H+t),F(c-tw/2,H)));P.push(F(a,H));[...et].reverse().forEach(v=>P.push(F(a,v+tw/2),F(a-t,v+tw/2),F(a-t,v-tw/2),F(a,v-tw/2)));return plCcw(P)},
wins=(a,b,n,dc)=>{let L=[],bay=3.6*sc,nb=Math.max(1,Math.floor((b-a-6)/bay)),o=a+(b-a-nb*bay)/2,ww=bay*.5,wh=fm*.5;if(e.windows!==!1)for(let f=0;f<n;f++)for(let q=0;q<nb;q++){let x=o+(q+.5)*bay;if(dc!=null&&f==0&&Math.abs(x-dc)<bay*1.3)continue;let yy=f*fm+fm*.45;L.push(cl5(te(x-ww/2,yy-wh/2,x+ww/2,yy+wh/2)))}L.push([F(a,fm),F(b,fm)],[F(a,n*fm+.3*sc),F(b,n*fm+.3*sc)]);if(dc!=null){let P=[F(dc-bay,0),F(dc-bay,fm*.6)];for(let q=0;q<=12;q++){let a2=Math.PI*(1-q/12);P.push(F(dc+bay*Math.cos(a2),fm*.6+bay*.6*Math.sin(a2)))}P.push(F(dc+bay,0));L.push(P)}return L},
half=(cx,cz,r,bk)=>{let P=[];for(let q=0;q<=32;q++){let a=Math.PI*q/32;P.push(F(cx+r*Math.cos(a),cz+r*Math.sin(a)))}P.push(F(cx-r,cz-bk),F(cx+r,cz-bk));return plCcw(P)},
ring=(rg,d)=>fe(rg,-d,`miter`).map(q=>cl5(q.outer)),maxH=0,Bs=BL(e);
let box=B=>{let[m0,n0,m1,n1]=B.b,x0=X(m0),x1=X(m1),z0=Z(n0),z1=Z(n1),n=B.n,H=(n*3.8+1.2)*sc,zf=z1-i-t/2,zb=z0+i+t/2,xl=x0+i+t/2,xr=x1-i-t/2,et=[H*.3,H*.7],RS=[],SS=[];maxH=Math.max(maxH,H);
let bt=tabs(x0+i+t+5,x1-i-t-5);[x0+i,x1-i-t].forEach(u=>et.forEach(v=>SS.push(te(u-cl/2,v-tw/2-cl/2,u+t+cl/2,v+tw/2+cl/2))));
[[zf,`old`,1],[zb,`orqa`,-1]].forEach(([zz,w,sg],q)=>{let rg=minus([{outer:wall(x0,x1,H,bt,bt,[]),holes:[]}],SS);bt.forEach(c=>{let sl=te(c-tw/2-cl/2,zz-s/2,c+tw/2+cl/2,zz+s/2);BS.push(sl);RS.push(sl)});push({id:`${B.id}${q?`B`:`A`}`,name:`${B.nm} — ${w} fasad`,group:B.g,regions:rg,engraveLines:EL(rg,wins(x0+i+t,x1-i-t,n,B.door!=null&&!q?X(B.door):null)),placement:{kind:`free`,ex:[1,0,0],ey:[0,1,0],ez:[0,0,1],pos:[0,0,zz]},explode:[0,0,sg*25],stage:B.st,order:q,info:[{label:`O‘lcham`,value:`${G(x1-x0,1)} × ${G(H,1)} mm, ${n} qavat`},{label:`Birikma`,value:`pastki tishlar asosga, yuqorisi tomga; chetdagi yopiq tirqishlarga yon devor tishlari kiradi`}]})});
let a=z0+i+t,b=z1-i-t,st=tabs(a+5,b-5);
[[xl,`chap`,-1],[xr,`o‘ng`,1]].forEach(([xx,w,sg],q)=>{let rg=[{outer:wall(a,b,H,st,st,et),holes:[]}];st.forEach(c=>{let sl=te(xx-s/2,c-tw/2-cl/2,xx+s/2,c+tw/2+cl/2);BS.push(sl);RS.push(sl)});push({id:`${B.id}${q?`D`:`C`}`,name:`${B.nm} — ${w} yon devor`,group:B.g,regions:rg,engraveLines:EL(rg,wins(a,b,n,null)),placement:{kind:`free`,ex:[0,0,1],ey:[0,1,0],ez:[-1,0,0],pos:[xx,0,0]},explode:[sg*25,0,0],stage:B.st,order:2+q,info:[{label:`O‘lcham`,value:`${G(b-a+2*t,1)} × ${G(H,1)} mm`},{label:`Birikma`,value:`uchlaridagi tishlar fasadlarning yopiq tirqishlariga kiradi`}]})});
return{x0,x1,z0,z1,H,RS}};
let RES=Bs.map(box),rF=RES[0],Xc=X(-5),zF=rF.z1,Rp=11*sc,HF=rF.H,nc=Math.round(j(e,`columns`)),cw=6,rc=Rp-Math.max(2.4*sc,4),CS=[],HS=[];
for(let q=0;q<nc;q++){let a=Math.PI*(.85-.7*q/(nc-1)),cx=Xc+rc*Math.cos(a),cz=zF+rc*Math.sin(a);
let rA=minus(plus(R0(-cw/2,0,cw/2,HF),[te(-2,-t,2,0)]),[te(-s/2,HF/2,s/2,HF+1)]),rB=minus(plus(R0(-cw/2,0,cw/2,HF),[te(-2,HF-.01,2,HF+t)]),[te(-s/2,-1,s/2,HF/2)]);
BS.push(te(cx-2-cl/2,cz-s/2,cx+2+cl/2,cz+s/2));CS.push(te(cx-s/2,cz-2-cl/2,cx+s/2,cz+2+cl/2));HS.push(te(cx-cw/2-.3,cz-t/2-.3,cx+cw/2+.3,cz+t/2+.3),te(cx-t/2-.3,cz-cw/2-.3,cx+t/2+.3,cz+cw/2+.3));
push({id:`US${dy(q+1)}a`,name:`Ustun ${q+1} (A, pastdan tishli)`,group:`04 Portik`,regions:rA,placement:{kind:`free`,ex:[1,0,0],ey:[0,1,0],ez:[0,0,1],pos:[cx,0,cz]},explode:[0,0,30],stage:4,order:q*2,info:[{label:`Birikma`,value:`krest: A ustidan o‘yiq, tishi asosga`}]});
push({id:`US${dy(q+1)}b`,name:`Ustun ${q+1} (B, tepadan tishli)`,group:`04 Portik`,regions:rB,placement:{kind:`free`,ex:[0,0,1],ey:[0,1,0],ez:[-1,0,0],pos:[cx,0,cz]},explode:[0,0,30],stage:4,order:q*2+1,info:[{label:`Birikma`,value:`krest: B pastdan o‘yiq, tishi portik tomiga`}]})}
{let Rr=Rp+2.5*sc,rg=minus([{outer:half(Xc,zF-1.5,Rr,.01),holes:[]}],HS);push({id:`ZN`,name:`Portik zinapoyasi`,group:`04 Portik`,regions:rg,engraveLines:EL(rg,[cl5(half(Xc,zF-1.5,Rr-1.2*sc,.01))]),placement:{kind:`horizontal`,y:t/2},explode:[0,10,20],stage:4,order:-1,look:`earth`,info:[{label:`O‘rnatish`,value:`asos ustiga yelimlanadi, ustunlar teshiklardan o‘tadi`}]})}
RES.forEach((r,q)=>{let B=Bs[q],rg=R0(r.x0,r.z0,r.x1,r.z1);B.id==`F`&&(rg=plus(rg,[half(Xc,zF,Rp,1)]));rg=minus(rg,[...r.RS,...(B.id==`F`?CS:[])]);push({id:`T${B.id}`,name:`${B.nm} — tom`,group:`05 Tomlar`,regions:rg,engraveLines:EL(rg,ring(rg,1.5*sc)),placement:{kind:`horizontal`,y:r.H+t/2},explode:[0,30,0],stage:5,order:q,look:`gray`,info:[{label:`O‘lcham`,value:`${G(r.x1-r.x0,1)} × ${G(r.z1-r.z0,1)} mm`},{label:`Vazifasi`,value:`devorlarni bog‘lab qutini qattiq qiladi; gravyura — parapet chizig‘i`}]})});
if(e.attic!==!1){let Ra=Rp-.6*sc,r1=[{outer:half(Xc,zF,Ra,6*sc),holes:[]}],r2=[{outer:half(Xc,zF-2*sc,Ra*.7,4*sc),holes:[]}],th=Math.max(2.5,Ra*.1),tz=zF+Ra*.25,TX=De(`UNIVERSITET`,Xc-th*3.6,tz,th,0).map(l=>l.map(p=>F(p.x,2*tz-p.y)));
push({id:`AT1`,name:`Attika (pastki qatlam)`,group:`06 Attika`,regions:r1,engraveLines:EL(r1,ring(r1,1.5)),placement:{kind:`horizontal`,y:HF+t+t/2},explode:[0,45,0],stage:6,order:0,info:[{label:`O‘rnatish`,value:`portik tomiga yelimlanadi`}]});
push({id:`AT2`,name:`Attika (ustki qatlam, nom yozuvi)`,group:`06 Attika`,regions:r2,engraveLines:EL(r2,TX),placement:{kind:`horizontal`,y:HF+2*t+t/2},explode:[0,60,0],stage:6,order:1,info:[{label:`Yozuv`,value:`UNIVERSITET`}]})}
let m=8,bx0=X(-45)-m,bx1=X(90)+m,bz1=Z(38)+m,b1=minus(R0(bx0,Z(0),bx1,bz1),BS),b2=minus(R0(bx0,Z(-108)-m,X(30)+m,Z(0)),BS),tz=Z(31),TB=De(`UNIVERSITET 1:${Number(e.scale)||500}`,X(42),tz,2.6*sc,0).map(l=>l.map(p=>F(p.x,2*tz-p.y)));
push({id:`AS1`,name:`Asos — old qism`,group:`00 Asos`,regions:b1,engraveLines:EL(b1,TB),placement:{kind:`horizontal`,y:-t/2},explode:[0,-30,15],stage:0,order:0,look:`ground`,info:[{label:`O‘lcham`,value:`${G(bx1-bx0,0)} × ${G(bz1-Z(0),0)} mm`}]});
push({id:`AS2`,name:`Asos — orqa qism`,group:`00 Asos`,regions:b2,placement:{kind:`horizontal`,y:-t/2},explode:[0,-30,-15],stage:0,order:1,look:`ground`,info:[{label:`O‘lcham`,value:`${G(X(30)+m-bx0,0)} × ${G(Z(0)-Z(-108)+m,0)} mm`}]});
[X(-42),X(10)].forEach((xx,q)=>{let rg=R0(xx,Z(0)-12,xx+20,Z(0)+12);push({id:`QB${q+1}`,name:`Asos ulash plankasi ${q+1}`,group:`00 Asos`,regions:rg,placement:{kind:`horizontal`,y:-1.5*t},explode:[0,-50,0],stage:0,order:2+q,look:`sand`,info:[{label:`Vazifasi`,value:`ikki asos bo‘lagini ostidan yelim bilan ulaydi`}]})});
let W0=bx1-bx0,D0=bz1-(Z(-108)-m);
let CK=[{label:`Kompozitsiya`,ok:!0,detail:`rasm bo‘yicha: yarim doira portikli bosh bino, o‘ng qanot (arkali kirish), chap uzun korpus va unga tutashgan 3 ta orqa korpus («taroq» shakli)`},{label:`Birikmalar`,ok:!0,detail:`yon devor tishlari fasadlarning yopiq tirqishlariga; barcha devorlar asos va tomga tishli; ustunlar krest (half-lap) juftlik`},{label:`Takomillashtirish`,ok:!0,detail:`murakkab tom ustqurmalari soddalashtirildi; qo‘shni korpus devorlari orasida 6 mm oraliq qoldirildi — detallar bir-biriga kirmaydi; katta asos 2 bo‘lakka bo‘lindi`},{label:`Detallar`,ok:!0,detail:`${y.length} ta fanera detal`}];
let st=[{stage:-1,title:`Tayyorgarlik`,text:`3 mm fanera, PVA yelim, qisqichlar. Derazalarni gravyura qiling; pastki qavat (g‘isht) qismini xohlasangiz qizg‘ish bo‘yang.`},{stage:0,title:`1. Asos`,text:`AS1 va AS2 ni QB plankalari bilan ostidan ulang.`},{stage:1,title:`2. Bosh bino`,text:`Old va orqa fasadni asosga, so‘ng yon devorlarni ular orasiga tishlar bilan kiriting.`},{stage:2,title:`3. O‘ng qanot`,text:`Xuddi shu tartibda yig‘ing.`},{stage:3,title:`4. Orqa korpuslar`,text:`Chap uzun korpus (L), so‘ng C1–C3 korpuslarni yig‘ing.`},{stage:4,title:`5. Portik`,text:`Zinapoyani (ZN) qo‘ying, ustunlarni A/B juftlab krest qilib asos tirqishlariga kiriting.`},{stage:5,title:`6. Tomlar`,text:`Tomlarni devor tishlariga kiygizing; bosh bino tomi ustunlar tishlarini ham qabul qiladi.`},...(e.attic!==!1?[{stage:6,title:`7. Attika`,text:`AT1 va AT2 ni portik tomiga yelimlang.`}]:[])];
let sm=[{label:`Model`,value:`Universitet binolari majmuasi (faqat binolar), masshtab 1:${Number(e.scale)||500}`},{label:`O‘lcham`,value:`${G(W0,0)} × ${G(D0,0)} mm, balandligi ≈ ${G(maxH+t,0)} mm`},{label:`Material`,value:`fanera 3 mm (${y.length} detal)`}];
return{parts:y,steps:st,drawings:[],summary:sm,checks:CK,extent:{radius:Math.hypot(W0,D0)/2+20,height:maxH+40,topRadius:3,steam:!1},glueJoints:y.length*2,stageNames:[`Asos`,`Bosh bino`,`O‘ng qanot`,`Orqa korpuslar`,`Portik`,`Tomlar`,`Attika`]}}
return {id:`aiUniversitetMajmua`,name:`Universitet binolari majmuasi`,description:`Rasm asosida: yarim doira ustunli portikli bosh bino, o‘ng qanot, chap uzun korpus va 3 ta orqa korpus; deraza gravyurasi, tishli birikmalar, attika.`,status:`ready`,params:PA,defaults:D,presets:PRE,validate:e=>V({...D,...e}),generate:e=>GEN({...D,...e})};
});

}catch(e){console.error('custom aiUniversitetMajmua.js',e);window.__lmCustomErr=(window.__lmCustomErr||[]).concat(String(e&&e.stack||e))}
/* ==== AI-AUTO-END ==== */
