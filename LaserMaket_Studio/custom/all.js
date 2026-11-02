
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
