
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

/* oreMachines.js */
try{
window.__lmCustomF=window.__lmCustomF||[];
(function(){var mkCache=null;function mkInit(LM){if(mkCache)return mkCache;
const {F,te,de,fe,U,plCcw,ctClip,ctMk,De,M,N,j,G,dy,A,k,ny,uy,fy,W}=LM;
var mkP=[{key:`machine`,label:`Uskuna`,group:`Tarkib`,type:`select`,options:[{value:`jc`,label:`1. Jag‘li maydalagich — 260 × 180 × 220 mm`},{value:`bm`,label:`2. Sharli tegirmon (gorizontal) — 400 × 180 × 180 mm`},{value:`vm`,label:`3. Vertikal tegirmon — 200 × 200 × 250 mm`},{value:`fl`,label:`4. Flotatsiya kamerasi — 350 × 150 × 160 mm`},{value:`ms`,label:`5. Magnit separator — 320 × 180 × 160 mm`}]},{key:`staves`,label:`Baraban reykalari soni`,group:`Detallar`,type:`int`,min:12,max:24,step:2,help:`Sharli tegirmon barabani shu sondagi yassi reykalardan (bochka kabi) yig‘iladi.`},{key:`clad`,label:`Vertikal tegirmon qoplamasi`,group:`Detallar`,type:`number`,unit:`mm`,min:0,max:1.5,step:.1,help:`0 — faqat qovurg‘a karkas; 0,8–1,5 mm — shpon yoki karton qoplama.`},{key:`rocks`,label:`Ruda / ko‘pik bezagi`,group:`Detallar`,type:`bool`},{key:`labels`,label:`Asosda nom gravyurasi`,group:`Detallar`,type:`bool`},{key:`slotClearance`,label:`Tirqish toleransi`,group:`Birikmalar`,type:`number`,unit:`mm`,min:-.3,max:1,step:.05}],mkD={machine:`jc`,staves:16,clad:1.2,rocks:!0,labels:!0,slotClearance:.1,...A},mkPA=[...mkP,...k],mkPre=[{name:`1. Jag‘li maydalagich`,hint:`260 × 180 × 220 mm: panjarali rama, 2 maxovik, tishli jag‘, bunker`,values:{machine:`jc`}},{name:`2. Sharli tegirmon`,hint:`400 × 180 × 180 mm: reykali baraban, tishli toj, bunker, dvigatel`,values:{machine:`bm`}},{name:`3. Vertikal tegirmon`,hint:`200 × 200 × 250 mm: 4 oyoq, konusli korpus, qizil belbog‘lar`,values:{machine:`vm`}},{name:`4. Flotatsiya kamerasi`,hint:`350 × 150 × 160 mm: 3 kamera, aralashtirgich vali, dvigatel`,values:{machine:`fl`}},{name:`5. Magnit separator`,hint:`320 × 180 × 160 mm: qiya lenta, rolikalar, barabanlar`,values:{machine:`ms`}}],mkDim={jc:[260,180,220],bm:[400,180,180],vm:[200,200,250],fl:[350,150,160],ms:[320,180,160]},mkNm={jc:`Jag‘li maydalagich`,bm:`Sharli tegirmon (gorizontal)`,vm:`Vertikal tegirmon`,fl:`Flotatsiya kamerasi`,ms:`Magnit separator`};
function mkV(e){let q=M(mkPA,e);if(q.some(x=>x.severity===`error`))return q;q.push(...N(e));let W0=j(e,`sheetWidth`),V0=j(e,`sheetHeight`),em=j(e,`edgeMargin`),a=Math.max(W0,V0)-2*em,b=Math.min(W0,V0)-2*em,big=[];try{mkG(e).parts.forEach(p=>{let xs=[],ys=[];p.regions.forEach(r=>r.outer.forEach(q2=>{xs.push(q2.x);ys.push(q2.y)}));let w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);(Math.max(w,h)>a||Math.min(w,h)>b)&&big.push(`${p.id} ${G(w,0)}×${G(h,0)}`)})}catch(x){}big.length&&q.push({severity:`error`,field:`sheetWidth`,message:`Listga sig‘maydigan detallar: ${big.slice(0,4).join(`, `)} mm — kattaroq list tanlang (ish maydoni ${G(a,0)} × ${G(b,0)} mm).`});return q}
function mkG(e){let t=j(e,`thickness`),cl=j(e,`slotClearance`),s=t+cl,ct=j(e,`clad`),RW=9,y=[],CK=[],minus=(rg,P)=>P.length?de(`difference`,rg,P):rg,plus=(rg,P)=>P.length?de(`union`,rg,P):rg,push=o=>y.push({material:`plywood`,thickness:t,look:`concrete`,...o}),R0=(a,b,c2,d2)=>[{outer:te(a,b,c2,d2),holes:[]}],tabsL=(a,b,L0)=>{let L=b-a,m=Math.max(1,Math.round(L/(L0||28))),o=[];for(let i=0;i<m;i++)o.push(a+L*(i+.5)/m);return o},EL=(rg,L)=>L.flatMap(q=>ctClip(rg,q,.3)),circ=(x,yy,r)=>{let P=U(x,yy,r,Math.max(14,Math.round(r*5)));return[...P,P[0]]},mir=(L2,yc)=>L2.map(l2=>l2.map(q=>F(q.x,2*yc-q.y))),C0=(x,yy2,r,n)=>plCcw(U(x,yy2,r,n||48)),mv=(P,dx,dz)=>P.map(p=>F(p.x+dx,p.y+dz)),SH=(u,v)=>te(u-3-cl/2,v-s/2,u+3+cl/2,v+s/2),BS=[],mode=e.machine||`jc`,MI=mkNm[mode]||``,XYp=zc=>({kind:`free`,ex:[1,0,0],ey:[0,1,0],ez:[0,0,1],pos:[0,0,zc]}),ZYp=xc=>({kind:`free`,ex:[0,0,1],ey:[0,1,0],ez:[-1,0,0],pos:[xc,0,0]});
let box=o=>{let{id,nm,grp,x0,x1,z0,z1,yb=0,hh,look=`concrete`,rLook,roof=!0,bot,winF,stage=1,order=0,engF}=o,RS=[],xt=tabsL(x0+6,x1-6),zt=tabsL(z0+t+5,z1-t-5);[[z0+t/2,`orqa`],[z1-t/2,`old`]].forEach(([zc,wn],wi)=>{let rg=R0(x0-2.5,yb,x1+2.5,yb+hh);rg=plus(rg,xt.map(x=>te(x-3.5,yb-t,x+3.5,yb+.02)));roof&&(rg=plus(rg,xt.map(x=>te(x-3.5,yb+hh-.02,x+3.5,yb+hh+t))));xt.forEach(x=>{bot.push(te(x-3.5-cl/2,zc-s/2,x+3.5+cl/2,zc+s/2));RS.push(te(x-3.5-cl/2,zc-s/2,x+3.5+cl/2,zc+s/2))});let gy=tabsL(yb+3,yb+hh-3,10),HS=[];[x0+t/2,x1-t/2].forEach(xc=>gy.forEach(v=>HS.push(te(xc-s/2,v-2.5-cl/2,xc+s/2,v+2.5+cl/2))));winF&&HS.push(...winF(x0+t+3,x1-t-3,yb,hh,`L`));rg=minus(rg,HS);let E1=engF?engF(x0,x1,yb,hh,wi):[];push({id:`${id}${wi?`F`:`B`}`,name:`${nm} — ${wn} devor`,group:grp,regions:rg,engraveLines:EL(rg,E1),placement:XYp(zc),explode:[0,0,wi?20:-20],stage,order:order+wi,look})});[[x0+t/2,`chap`],[x1-t/2,`o‘ng`]].forEach(([xc,wn],wi)=>{let rg=R0(z0+t,yb,z1-t,yb+hh),gy=tabsL(yb+3,yb+hh-3,10);rg=plus(rg,gy.flatMap(v=>[te(z0,v-2.5,z0+t+.02,v+2.5),te(z1-t-.02,v-2.5,z1,v+2.5)]));rg=plus(rg,zt.map(z=>te(z-3.5,yb-t,z+3.5,yb+.02)));roof&&(rg=plus(rg,zt.map(z=>te(z-3.5,yb+hh-.02,z+3.5,yb+hh+t))));zt.forEach(z=>{bot.push(te(xc-s/2,z-3.5-cl/2,xc+s/2,z+3.5+cl/2));RS.push(te(xc-s/2,z-3.5-cl/2,xc+s/2,z+3.5+cl/2))});let HS=winF?winF(z0+t+3,z1-t-3,yb,hh,`S`):[];rg=minus(rg,HS);push({id:`${id}${wi?`R`:`L`}`,name:`${nm} — ${wn} yon devor`,group:grp,regions:rg,placement:ZYp(xc),explode:[wi?20:-20,0,0],stage,order:order+2+wi,look})});let top=null;if(roof){top={id:`${id}T`,name:`${nm} — ust plita`,group:grp,regions:R0(x0-3.5,z0-1,x1+3.5,z1+1),__h:[...RS],placement:{kind:`horizontal`,y:yb+hh+t/2},explode:[0,25,0],stage:stage+1,order:order+4,look:rLook||look};push(top)}return{RS,top}},fin=()=>y.forEach(q=>{if(q.__h){q.regions=minus(q.regions,q.__h);delete q.__h}}),grid=(nx,nz)=>(u0,u1,yb,hh,k2)=>{let o=[],n=k2===`L`?nx:nz,w=(u1-u0)/n;for(let i=0;i<n;i++)for(let r=0;r<2;r++){let v0=yb+3+r*(hh-6)/2;o.push(te(u0+i*w+2,v0+2,u0+(i+1)*w-2,v0+(hh-6)/2-2))}return o},bolts=(u0,u1,v,st2)=>{let o=[];for(let u=u0;u<=u1+1e-6;u+=st2||7)o.push(circ(u,v,.9));return o};
let rv=(o)=>{let{id,nm,grp,cx,cz,prof,n,ringY,st,look,clook,slots}=o,yA=prof[0][1],yZ=prof[prof.length-1][1],rAt=yy=>{for(let i=1;i<prof.length;i++)if(yy<=prof[i][1]+1e-9){let[a0,b0]=prof[i-1],[a1,b1]=prof[i];return a0+(a1-a0)*(yy-b0)/((b1-b0)||1)}return prof[prof.length-1][0]},rh=Math.max(t/(2*Math.sin(Math.PI/n))+1.2,3.5),ro=yy=>rAt(yy)-ct,ri=yy=>Math.max(rh,ro(yy)-RW),B=Array.from({length:n},(q,i)=>i*2*Math.PI/n+Math.PI/n),tw=Math.min(6,RW*.5),ys=ny(yA,yZ,2);prof.forEach(p=>ys.includes(p[1])||ys.push(p[1]));ys.sort((p,q)=>p-q);let rib=de(`union`,[[...ys.map(v=>F(ro(v),v)),...[...ys].reverse().map(v=>F(ri(v),v))]],[]),rmB=(ri(yA)+ro(yA))/2,rmT=(ri(yZ)+ro(yZ))/2;rib=plus(rib,[te(rmT-tw/2,yZ-.2,rmT+tw/2,yZ+t),te(rmB-tw/2,yA-t,rmB+tw/2,yA+.2)]);let RG=ringY.map(yy=>{let Ro=ro(yy)-.2,Ri=Math.max(ri(yy)+.4,Ro-RW);return{y:yy,Ro,Ri,rho:Ro-.5*(Ro-Ri)}});rib=minus(rib,RG.map(q=>te(ri(q.y)-2,q.y-s/2,q.rho,q.y+s/2)));B.forEach((aa,i)=>{push({id:`${id}Q${dy(i+1)}`,name:`${nm} — qovurg‘a ${i+1}`,group:grp,regions:rib,placement:{kind:`radial`,angle:aa,offset:[cx,0,cz]},explode:[Math.cos(aa)*30,0,Math.sin(aa)*30],stage:st,order:i,look});slots.push(mv(uy(rmB-tw/2-cl/2,rmB+tw/2+cl/2,s/2,aa),cx,cz))});RG.forEach((q,i)=>{let rg=[{outer:C0(0,0,q.Ro,72),holes:[]}];rg=minus(rg,[C0(0,0,q.Ri,60),...B.map(aa=>plCcw(uy(q.rho,q.Ro+2,s/2,aa)))]);push({id:`${id}H${i+1}`,name:`${nm} — halqa ${i+1}`,group:grp,regions:rg,placement:{kind:`horizontal`,y:q.y,offset:[cx,0,cz]},explode:[0,10+i*8,0],stage:st,order:20+i,look})});let cap=[{outer:C0(0,0,rAt(yZ)+.6,64),holes:[]}];cap=minus(cap,[...B.map(aa=>plCcw(uy(rmT-tw/2-cl/2,rmT+tw/2+cl/2,s/2,aa))),C0(0,0,Math.min(14,rAt(yZ)*.4),32)]);push({id:`${id}T`,name:`${nm} — qopqoq`,group:grp,regions:cap,engraveLines:EL(cap,[circ(0,0,rAt(yZ)-4)]),placement:{kind:`horizontal`,y:yZ+t/2,offset:[cx,0,cz]},explode:[0,30,0],stage:st,order:30,look:clook||look});if(ct>0){let mp=ys.filter(v=>v<=yZ-t/2),acc=[0];for(let q=1;q<mp.length;q++)acc.push(acc[q-1]+Math.hypot(rAt(mp[q])-rAt(mp[q-1]),mp[q]-mp[q-1]));B.forEach((a0,i)=>{let rt2=mp.map((v,q)=>F(Math.PI*(rAt(v)-ct/2)/n,acc[q])),lf=[...mp].reverse().map((v,q)=>F(-Math.PI*(rAt(v)-ct/2)/n,acc[mp.length-1-q]));y.push({id:`${id}K${dy(i+1)}`,name:`${nm} — qoplama ${i+1}`,group:`Qoplama`,material:`cladding`,thickness:ct,regions:[{outer:fy([...rt2,...lf],1),holes:[]}],placement:{kind:`lathe`,angle0:a0,angle1:a0+2*Math.PI/n,z0:mp[0],z1:mp[mp.length-1],profile:mp.map(v=>[rAt(v)-ct/2,v]),offset:[cx,0,cz]},explode:[Math.cos(a0+Math.PI/n)*60,0,Math.sin(a0+Math.PI/n)*60],stage:st,order:40+i,look:clook||look})})}return{rAt,yZ}};
let stand=o=>{let{id,nm,grp,x0,x1,z0,z1,hh,look=`concrete`,stage=1,topLook}=o,TS=[];[z0+t/2,z1-t/2].forEach((zc,wi)=>{let rg=R0(x0,0,x1,hh);rg=minus(rg,[te(x0+8,-1,x1-8,hh-9)]);let mid=x1-x0>200?[(x0+x1)/2]:[];rg=plus(rg,mid.map(xm=>te(xm-4,-.01,xm+4,hh-8.5)));rg=plus(rg,[te(x0+1,-t,x0+6,.02),te(x1-6,-t,x1-1,.02),...mid.map(xm=>te(xm-2.5,-t,xm+2.5,.02)),te(x0+8,hh-.02,x0+14,hh+t),te(x1-14,hh-.02,x1-8,hh+t)]);BS.push(te(x0+1-cl/2,zc-s/2,x0+6+cl/2,zc+s/2),te(x1-6-cl/2,zc-s/2,x1-1+cl/2,zc+s/2),...mid.map(xm=>te(xm-2.5-cl/2,zc-s/2,xm+2.5+cl/2,zc+s/2)));TS.push(te(x0+8-cl/2,zc-s/2,x0+14+cl/2,zc+s/2),te(x1-14-cl/2,zc-s/2,x1-8+cl/2,zc+s/2));push({id:`${id}S${wi+1}`,name:`${nm} — tayanch ramasi ${wi+1}`,group:grp,regions:rg,engraveLines:EL(rg,bolts(x0+4,x1-4,hh-4,9)),placement:XYp(zc),explode:[0,0,wi?15:-15],stage,order:wi,look})});let top={id:`${id}ST`,name:`${nm} — tayanch ust plitasi`,group:grp,regions:R0(x0-1,z0-1,x1+1,z1+1),__h:TS,placement:{kind:`horizontal`,y:hh+t/2},explode:[0,15,0],stage:stage+1,order:3,look:topLook||look};push(top);return{TS,yTop:hh+t}};
let disc=o=>{let{id,nm,grp,cx,cy,r,plane,pc,look=`red`,spokes=6,hole,stage=3,order=0,teeth}=o,rg=[{outer:teeth?plCcw(Array.from({length:teeth*4},(q,i)=>{let a=i*2*Math.PI/(teeth*4),rr=(i%4<2)?r:r-2.2;return F(cx+rr*Math.cos(a),cy+rr*Math.sin(a))})):C0(cx,cy,r,64),holes:[]}];if(spokes){let ri2=r*.72,rh2=r*.3,HS=[];for(let q=0;q<spokes;q++){let a0=q*2*Math.PI/spokes+.22,a1=(q+1)*2*Math.PI/spokes-.22,P2=[];for(let a=a0;a<=a1+1e-6;a+=(a1-a0)/8)P2.push(F(cx+ri2*Math.cos(a),cy+ri2*Math.sin(a)));for(let a=a1;a>=a0-1e-6;a-=(a1-a0)/4)P2.push(F(cx+rh2*Math.cos(a),cy+rh2*Math.sin(a)));HS.push(plCcw(P2))}rg=minus(rg,HS)}hole&&(rg=minus(rg,[hole]));push({id,name:nm,group:grp,regions:rg,engraveLines:EL(rg,[circ(cx,cy,r-(teeth?4.5:2.5))]),placement:plane===`zy`?ZYp(pc):XYp(pc),explode:plane===`zy`?[pc>0?20:-20,0,0]:[0,0,pc>0?20:-20],stage,order,look})};
let ring=o=>{let{id,nm,grp,cx,cy,ro,ri,inner,plane,pc,look=`red`,stage=3,order=0,teeth,info}=o,out=teeth?plCcw(Array.from({length:teeth*4},(q,i)=>{let a=i*2*Math.PI/(teeth*4),rr=(i%4<2)?ro:ro-2.4;return F(cx+rr*Math.cos(a),cy+rr*Math.sin(a))})):C0(cx,cy,ro,72),rg=minus([{outer:out,holes:[]}],[inner||C0(cx,cy,ri,64)]);push({id,name:nm,group:grp,regions:rg,placement:plane===`zy`?ZYp(pc):plane===`h`?{kind:`horizontal`,y:pc}:XYp(pc),explode:plane===`zy`?[pc>0?25:-25,0,0]:plane===`h`?[0,15,0]:[0,0,pc>0?25:-25],stage,order,look,info})};
let shaftX=(id,nm,grp,x0,x1,yy,zz)=>push({id,name:nm,group:grp,regions:R0(x0,zz-3,x1,zz+3),placement:{kind:`horizontal`,y:yy},explode:[0,8,0],stage:5,order:0,look:`gray`,info:[{label:`Vazifasi`,value:`teshiklardan o‘tadi, disklar unga kiygiziladi va aylanadi`}]});
let shaftZ=(id,nm,grp,xx,z0,z1,yy)=>push({id,name:nm,group:grp,regions:R0(xx-3,z0,xx+3,z1),placement:{kind:`horizontal`,y:yy},explode:[0,8,0],stage:5,order:0,look:`gray`});
let hop=o=>{let{id,nm,grp,cx,cz,y0,h,bx,bz,tx,tz,stage=5,look=`concrete`}=o;[-1,1].forEach(sg=>{let dz=tz-bz,L=Math.hypot(dz,h),ey=[0,h/L,sg*dz/L],rg=[{outer:plCcw([F(-bx,0),F(bx,0),F(tx,L),F(-tx,L)]),holes:[]}];push({id:`${id}${sg>0?`F`:`B`}`,name:`${nm} — ${sg>0?`old`:`orqa`} devori`,group:grp,regions:rg,engraveLines:EL(rg,[[F(-tx+4,L-4),F(tx-4,L-4)],...bolts(-tx+6,tx-6,L-8,8)]),placement:{kind:`free`,ex:[1,0,0],ey,ez:[0,-ey[2],ey[1]],pos:[cx,y0,cz+sg*bz]},explode:[0,25,sg*15],stage,order:sg>0?1:0,look})});[-1,1].forEach(sg=>{let dx=tx-bx,L=Math.hypot(dx,h),ey=[sg*dx/L,h/L,0],a0=bz-t,a1=tz-t,rg=[{outer:plCcw([F(-a0,0),F(a0,0),F(a1,L),F(-a1,L)]),holes:[]}];push({id:`${id}${sg>0?`R`:`L`}`,name:`${nm} — ${sg>0?`o‘ng`:`chap`} devori`,group:grp,regions:rg,placement:{kind:`free`,ex:[0,0,1],ey,ez:[-ey[1],ey[0],0],pos:[cx+sg*bx,y0,cz]},explode:[sg*15,25,0],stage,order:2+(sg>0?1:0),look})})};
let motor=(id,grp,x0,x1,z0,z1,yb,hh,bot,stage)=>box({id,nm:`Elektr dvigatel`,grp,x0,x1,z0,z1,yb,hh,bot,look:`water`,rLook:`water`,stage:stage||6,engF:(a0,a1,yb2,h2)=>{let o=[];for(let v=yb2+4;v<yb2+h2-3;v+=3)o.push([F(a0+3,v),F(a1-3,v)]);return o}});
let BX0=-130,BX1=130,BZ0=-90,BZ1=90;
let JC=()=>{let G1=`01 Rama`,G2=`02 Maydalash kamerasi`,G3=`03 Bunker`,G4=`04 Maxoviklar va val`,b=box({id:`JR`,nm:`Rama`,grp:G1,x0:-75,x1:75,z0:-80,z1:80,hh:70,bot:BS,winF:grid(3,2),stage:1}),rs=b.top.__h,yT=70+t,yC=yT+105,zS=25,yS=yT+85,CS=[];
[-1,1].forEach(sg=>{let xc=sg*60,P=[F(-78,yT),F(78,yT),F(78,yT+70),F(40,yC),F(-40,yC),F(-78,yT+80)],rg=[{outer:plCcw(P),holes:[]}];rg=plus(rg,[-50,0,50].map(z=>te(z-5,yT-t,z+5,yT+.02)));[-50,0,50].forEach(z=>rs.push(te(xc-s/2,z-5-cl/2,xc+s/2,z+5+cl/2)));rg=plus(rg,[-20,20].map(z=>te(z-4,yC-.02,z+4,yC+t)));[-20,20].forEach(z=>CS.push(te(xc-s/2,z-4-cl/2,xc+s/2,z+4+cl/2)));let HS=[SH(zS,yS)];[70,58,-70].forEach(zz=>[yT+20,yT+50].forEach(v=>HS.push(te(zz-s/2,v-2.5-cl/2,zz+s/2,v+2.5+cl/2))));rg=minus(rg,HS);push({id:`JY${sg>0?2:1}`,name:`Maydalagich yonog‘i ${sg>0?2:1}`,group:G2,regions:rg,engraveLines:EL(rg,[...bolts(-72,72,yT+6),circ(zS,yS,13),circ(zS,yS,16),[F(-74,yT+64),F(74,yT+64)]]),placement:ZYp(xc),explode:[sg*30,0,0],stage:2,order:sg>0?1:0,info:[{label:`Birikma`,value:`pastki 3 tish ramaga; yuqori 2 tish qopqoqqa; old/orqa panel va jag‘ tishlari uchun tirqishlar`}]})});
let plate=(id,nm,zz,hh,look,win,E,ord)=>{let rg=R0(-58.5,yT,58.5,yT+hh);rg=plus(rg,[yT+20,yT+50].flatMap(v=>[te(-61.5,v-2.5,-58.48,v+2.5),te(58.48,v-2.5,61.5,v+2.5)]));rg=plus(rg,[-30,30].map(x=>te(x-5,yT-t,x+5,yT+.02)));[-30,30].forEach(x=>rs.push(te(x-5-cl/2,zz-s/2,x+5+cl/2,zz+s/2)));win&&(rg=minus(rg,[win]));push({id,name:nm,group:G2,regions:rg,engraveLines:EL(rg,E||[]),placement:XYp(zz),explode:[0,0,zz>0?25:-25],stage:3,order:ord,look})};
plate(`JF`,`Old panel (jag‘ oynasi)`,70,75,`concrete`,te(-42,yT+12,42,yT+62),[...bolts(-54,54,yT+68),...bolts(-54,54,yT+6)],0);plate(`JJ`,`Qo‘zg‘almas jag‘ plitasi`,58,75,`gray`,null,[],1);plate(`JB`,`Orqa panel`,-70,82,`concrete`,null,[...bolts(-54,54,yT+6),...bolts(-54,54,yT+76)],2);
for(let i=0;i<7;i++){let x=-36+i*12;push({id:`JT${i+1}`,name:`Jag‘ tishi ${i+1}`,group:G2,regions:R0(x-3,yT+14,x+3,yT+60),placement:XYp(61),explode:[0,0,45],stage:3,order:3+i,look:`asphalt`})}
push({id:`JK`,name:`Kamera qopqog‘i`,group:G2,regions:minus(R0(-66,-42,66,42),[te(-33,-23,33,23)]),__h:CS,placement:{kind:`horizontal`,y:yC+t/2},explode:[0,25,0],stage:4,order:0,look:`concrete`});
hop({id:`JH`,nm:`Yuklash bunkeri`,grp:G3,cx:0,cz:0,y0:yC+t,h:40,bx:36,bz:26,tx:62,tz:55,stage:5});
shaftX(`JV`,`Ekssentrik val`,G4,-128,128,yS,zS);[-1,1].forEach(sg=>{let q2=sg>0?2:1;disc({id:`JP${q2}`,nm:`Podshipnik korpusi ${q2}`,grp:G4,cx:zS,cy:yS,r:11,plane:`zy`,pc:sg*(61.5+t/2+.05),spokes:0,look:`red`,hole:SH(zS,yS),stage:6,order:0});disc({id:`JM${q2}`,nm:`Maxovik ${q2}`,grp:G4,cx:zS,cy:yS,r:50,plane:`zy`,pc:sg*112,spokes:6,look:`red`,hole:SH(zS,yS),stage:6,order:1});ring({id:`JO${q2}`,nm:`Maxovik gardishi ${q2}`,grp:G4,cx:zS,cy:yS,ro:58,ri:44,plane:`zy`,pc:sg*(112+t+.05),look:`asphalt`,stage:6,order:2})});
BX0=-135;BX1=135;BZ0=-92;BZ1=92;CK.push({label:`Maxovik`,ok:yS-58>0,detail:`Ø116 mm, markaz ${G(yS,0)} mm balandlikda — poldan ${G(yS-58,0)} mm yuqori, erkin aylanadi`})};
let BMf=()=>{let G1=`01 Rama`,G2=`02 Baraban`,G3=`03 Tayanchlar va val`,G4=`04 Yuritma`,G5=`05 Bunker`,L=210,N=Math.round(j(e,`staves`)),R=48,a=R*Math.cos(Math.PI/N),ox=-15,oz=0,yA=110,b=box({id:`TF`,nm:`Tegirmon ramasi`,grp:G1,x0:-182,x1:182,z0:-62,z1:62,hh:30,bot:BS,winF:grid(8,3),stage:1}),rs=b.top.__h,yF=30+t,sw=2*R*Math.sin(Math.PI/N)-.6,poly=(ap,cx,cy)=>{let o=[],Rr=ap/Math.cos(Math.PI/N);for(let i=0;i<N;i++){let ph=i*2*Math.PI/N+Math.PI/N;o.push(F(cx+Rr*Math.sin(ph),cy+Rr*Math.cos(ph)))}return plCcw(o)};
for(let i=0;i<N;i++){let ph=i*2*Math.PI/N,r=[0,Math.cos(ph),Math.sin(ph)],tg=[0,-Math.sin(ph),Math.cos(ph)],rg=R0(ox-L/2,-sw/2,ox+L/2,sw/2),E1=[];for(let u=ox-L/2+6;u<ox+L/2-5;u+=8)(sw>12?[-sw/4,sw/4]:[0]).forEach(v=>E1.push(circ(u+(v>0?4:0),v,.9)));push({id:`TB${dy(i+1)}`,name:`Baraban reykasi ${i+1}`,group:G2,regions:rg,engraveLines:EL(rg,E1),placement:{kind:`free`,ex:[1,0,0],ey:tg,ez:[0,-Math.cos(ph),-Math.sin(ph)],pos:[0,yA+r[1]*(a-t/2),oz+r[2]*(a-t/2)]},explode:[0,r[1]*25,r[2]*25],stage:4,order:i})}
[-L/2+t/2,-L/6,L/6,L/2-t/2].forEach((xx,i)=>{let rg=[{outer:poly(a-t,oz,yA),holes:[]}];rg=minus(rg,[SH(oz,yA)]);(i===1||i===2)&&(rg=minus(rg,[C0(oz,yA,a-t-9,40)]));push({id:`TD${i+1}`,name:i===0||i===3?`Baraban yon qopqog‘i ${i?2:1}`:`Baraban ichki halqasi ${i}`,group:G2,regions:rg,engraveLines:i===0||i===3?EL(rg,[circ(oz,yA,12),circ(oz,yA,17)]):[],placement:ZYp(ox+xx),explode:[xx>0?20:-20,0,0],stage:3,order:i})});
[-1,1].forEach(sg=>ring({id:`TG${sg>0?2:1}`,nm:`Baraban gardishi ${sg>0?2:1} (qizil)`,grp:G2,cx:oz,cy:yA,ro:R+5,inner:poly(a+.15,oz,yA),plane:`zy`,pc:ox+sg*(L/2-10),look:`red`,stage:5,order:sg>0?2:1}));
ring({id:`TT`,nm:`Tishli toj (girth gear)`,grp:G2,cx:oz,cy:yA,ro:R+16,teeth:56,inner:poly(a+.15,oz,yA),plane:`zy`,pc:ox+L/2-38,look:`asphalt`,stage:5,order:3,info:[{label:`O‘rnatish`,value:`baraban reykalari ustidan kiygiziladi`}]});ring({id:`TQ`,nm:`Tishli toj gardishi (qizil)`,grp:G2,cx:oz,cy:yA,ro:R+8,inner:poly(a+.15,oz,yA),plane:`zy`,pc:ox+L/2-38+t+.05,look:`red`,stage:5,order:4});
[-1,1].forEach(sg=>{let xp=ox+sg*(L/2+14),rg=[{outer:plCcw([F(oz-26,yF),F(oz+26,yF),F(oz+14,yA+12),F(oz-14,yA+12)]),holes:[]}];rg=plus(rg,[te(oz-20,yF-t,oz-10,yF+.02),te(oz+10,yF-t,oz+20,yF+.02)]);rs.push(te(xp-s/2,oz-20-cl/2,xp+s/2,oz-10+cl/2),te(xp-s/2,oz+10-cl/2,xp+s/2,oz+20+cl/2));rg=minus(rg,[SH(oz,yA),te(oz-9,yF+8,oz+9,yA-22)]);push({id:`TP${sg>0?2:1}`,name:`Podshipnik tayanchi ${sg>0?2:1}`,group:G3,regions:rg,engraveLines:EL(rg,[circ(oz,yA,8),circ(oz,yA,10.5),...bolts(oz-22,oz+22,yF+4,11)]),placement:ZYp(xp),explode:[sg*25,0,0],stage:2,order:sg>0?1:0,look:`concrete`})});
shaftX(`TV`,`Tegirmon vali (sapfa)`,G3,-144,ox+L/2+30,yA,oz);disc({id:`TC`,nm:`Mufta`,grp:G4,cx:oz,cy:yA,r:9,plane:`zy`,pc:ox+L/2+27,spokes:0,look:`red`,hole:SH(oz,yA),stage:6,order:0});
motor(`TM`,G4,132,176,-24,24,yF,42,rs,6);disc({id:`TK`,nm:`Dvigatel shkivi`,grp:G4,cx:0,cy:yF+26,r:10,plane:`zy`,pc:130.4,spokes:4,look:`asphalt`,stage:6,order:7});
let hb=box({id:`TH`,nm:`Bunker tayanchi`,grp:G5,x0:-180,x1:-146,z0:-22,z1:22,yb:yF,hh:yA+12-yF,bot:rs,stage:2,winF:null});hop({id:`TU`,nm:`Yuklash bunkeri`,grp:G5,cx:-163,cz:0,y0:yA+12+t,h:42,bx:15,bz:19,tx:30,tz:38,stage:6});
BX0=-198;BX1=198;BZ0=-88;BZ1=88;CK.push({label:`Baraban`,ok:!0,detail:`Ø${G(2*R,0)} × ${L} mm, ${N} ta reyka + 4 ta halqa; tishli toj Ø${G(2*R+32,0)} mm`})};
let VMf=()=>{let G1=`01 Oyoqlar va rama`,G2=`02 Korpus`,G3=`03 Belbog‘lar va yuritma`,yP=50,PS=[];[45,135,225,315].forEach((dg,i)=>{let aa=dg*Math.PI/180,P=[F(70,0),F(100,0),F(100,128),F(91,128),F(91,110),F(80,98),F(76,80),F(76,yP-t),F(70,yP-t)],rg=[{outer:plCcw(P),holes:[]}];rg=plus(rg,[te(74,-t,82,.02),te(88,-t,96,.02)]);BS.push(uy(74-cl/2,82+cl/2,s/2,aa),uy(88-cl/2,96+cl/2,s/2,aa));PS.push(uy(76-cl/2,100.6,s/2,aa));push({id:`VL${i+1}`,name:`Oyoq ${i+1}`,group:G1,regions:rg,engraveLines:EL(rg,[...bolts(96,96,8),[F(72,yP-t-4),F(98,yP-t-4)],circ(95.5,20,1.2),circ(95.5,118,1.2)]),placement:{kind:`radial`,angle:aa,offset:[0,0,0]},explode:[Math.cos(aa)*35,0,Math.sin(aa)*35],stage:1,order:i,info:[{label:`Birikma`,value:`2 tish asosga, rama plitasidan o‘tadi va uni yelkasida ushlaydi`}]})});
push({id:`VP`,name:`Oyoqlar ramasi (plita)`,group:G1,regions:R0(-92,-92,92,92),__h:PS,engraveLines:[],placement:{kind:`horizontal`,y:yP-t/2},explode:[0,10,0],stage:2,order:0,look:`concrete`});
rv({id:`VG`,nm:`Tegirmon korpusi`,grp:G2,cx:0,cz:0,prof:[[28,yP],[85,110],[85,205],[45,232],[45,250]],n:12,ringY:[80,125,170,215,240],st:3,look:`concrete`,slots:PS});
[[115,85,90.5],[200,85,90.5],[236,45,49]].forEach(([yy,r0,r1],i)=>ring({id:`VB${i+1}`,nm:`Qizil belbog‘ ${i+1}`,grp:G3,cx:0,cy:0,ro:r1,ri:r0+.2,plane:`h`,pc:yy,look:`red`,stage:4,order:i}));
disc({id:`VR1`,nm:`Yuritma tishli g‘ildiragi`,grp:G3,cx:0,cy:160,r:18,teeth:16,plane:`zy`,pc:87.6,spokes:0,look:`asphalt`,hole:null,stage:4,order:5});disc({id:`VR2`,nm:`Yuritma qopqog‘i`,grp:G3,cx:0,cy:160,r:9,plane:`zy`,pc:87.6+t+.05,spokes:0,look:`red`,stage:4,order:6});
BX0=-112;BX1=112;BZ0=-112;BZ1=112;CK.push({label:`Oyoqlar`,ok:!0,detail:`4 ta radial oyoq korpusdan 2–6 mm masofada — qoplama va belbog‘larga tegmaydi`})};
let FLf=()=>{let G1=`01 Tayanch rama`,G2=`02 Kameralar`,G3=`03 Aralashtirgich vali`,G4=`04 Dvigatel`,ox=-20,st=stand({id:`FT`,nm:`Tayanch`,grp:G1,x0:ox-150,x1:ox+150,z0:-68,z1:68,hh:70}),yb=st.yTop;
[[ox-148,ox-53],[ox-47,ox+47],[ox+53,ox+148]].forEach(([x0,x1],i)=>{box({id:`FC${i+1}`,nm:`Kamera ${i+1}`,grp:G2,x0,x1,z0:-62,z1:62,yb,hh:82,roof:!1,bot:st.TS,stage:3,order:i*5,engF:(a0,a1,yb2,hh)=>[[F(a0+2,yb2+hh-5),F(a1-2,yb2+hh-5)],...bolts(a0+4,a1-4,yb2+hh-9),...bolts(a0+4,a1-4,yb2+5)]});if(e.rocks!==!1){let rg=R0(x0+t+.6,-62+t+.6,x1-t-.6,62-t-.6),E1=[];for(let q=0;q<26;q++){let u=x0+9+((q*37)%(x1-x0-18)),w=-50+((q*53)%100);E1.push(circ(u,w,2+(q%3)*.9))}push({id:`FK${i+1}`,name:`Ko‘pik qatlami ${i+1} (ruda zarralari)`,group:`05 Bezak`,regions:rg,engraveLines:EL(rg,E1),placement:{kind:`horizontal`,y:yb+70},explode:[0,30,0],stage:7,order:i,look:`gray`})}});
[ox-130,ox+130].forEach((xp,i)=>{let rg=R0(26,0,54,44);rg=plus(rg,[te(33,-t,47,.02)]);BS.push(te(xp-s/2,33-cl/2,xp+s/2,47+cl/2));rg=minus(rg,[SH(40,28)]);push({id:`FP${i+1}`,name:`Val tayanchi ${i+1}`,group:G3,regions:rg,engraveLines:EL(rg,[circ(40,28,7)]),placement:ZYp(xp),explode:[0,0,25],stage:4,order:i,look:`concrete`})});
shaftX(`FV`,`Aralashtirgich vali`,G3,ox-140,ox+172,28,40);[ox-100,ox,ox+100].forEach((xp,i)=>disc({id:`FI${i+1}`,nm:`Impeller ${i+1}`,grp:G3,cx:40,cy:28,r:15,plane:`zy`,pc:xp,spokes:4,look:`asphalt`,hole:SH(40,28),stage:5,order:1+i}));
motor(`FM`,G4,ox+158,ox+196,18,62,0,48,BS,6);{let lw=y.find(q=>q.id===`FML`);lw&&(lw.regions=minus(lw.regions,[SH(40,28)]))}
BX0=ox-162;BX1=ox+208;BZ0=-80;BZ1=80;CK.push({label:`Kameralar`,ok:!0,detail:`3 ta kamera 95 × 124 × 82 mm, orasida 6 mm — devorlar bir-biriga kirmaydi`})};
let MSf=()=>{let G1=`01 Rama`,G2=`02 Qiya korpus`,G3=`03 Lenta va rolikalar`,G4=`04 Barabanlar va yuritma`,b=box({id:`MR`,nm:`Separator ramasi`,grp:G1,x0:-150,x1:150,z0:-75,z1:75,hh:28,bot:BS,winF:grid(6,2),stage:1}),rs=b.top.__h,yb=28+t,X0=-140,X1=140,yL=yb+38,yH=158,ybt=x=>yL+(x-X0)*(yH-yL)/(X1-X0),zw=62,dd=11,A2=[X0+4,ybt(X0+4)-dd],B2=[X1-4,ybt(X1-4)-dd],dx=B2[0]-A2[0],dY=B2[1]-A2[1],L=Math.hypot(dx,dY),u=[dx/L,dY/L],n2=[-u[1],u[0]],d=[u[0],u[1],0],FS=[.15,.5,.85],DR=[[X0+14,ybt(X0+14)-dd-12],[X1-14,ybt(X1-14)-dd-12]];
[-1,1].forEach(sg=>{let rg=[{outer:plCcw([F(X0,yb),F(X1,yb),F(X1,yH),F(X0,yL)]),holes:[]}],bt=tabsL(X0+10,X1-10,45);rg=plus(rg,bt.map(x=>te(x-5,yb-t,x+5,yb+.02)));bt.forEach(x=>rs.push(te(x-5-cl/2,sg*zw-s/2,x+5+cl/2,sg*zw+s/2)));let HS=FS.map(f=>{let c0=[A2[0]+u[0]*f*L,A2[1]+u[1]*f*L],p=(a2,b3)=>F(c0[0]+u[0]*a2+n2[0]*b3,c0[1]+u[1]*a2+n2[1]*b3);return plCcw([p(-5-cl/2,-s/2),p(5+cl/2,-s/2),p(5+cl/2,s/2),p(-5-cl/2,s/2)])});DR.forEach(([xx,yy])=>HS.push(te(xx-3-cl/2,yy-s/2,xx+3+cl/2,yy+s/2)));rg=minus(rg,HS);let E1=[];for(let x=X0+6;x<X1-4;x+=9)E1.push(circ(x,ybt(x)-5,.9),circ(x,yb+6,.9));push({id:`MY${sg>0?2:1}`,name:`Qiya yon devor ${sg>0?2:1}`,group:G2,regions:rg,engraveLines:EL(rg,E1),placement:XYp(sg*zw),explode:[0,0,sg*25],stage:3,order:sg>0?1:0});
let lr=[{outer:plCcw([F(X0+8,ybt(X0+8)-dd+t),F(X1-8,ybt(X1-8)-dd+t),F(X1-8,ybt(X1-8)-1.5),F(X0+8,ybt(X0+8)-1.5)]),holes:[]}];push({id:`ML${sg>0?2:1}`,name:`Bort qoplamasi ${sg>0?2:1} (qizil)`,group:G2,regions:lr,placement:XYp(sg*(zw-t-.05)),explode:[0,15,sg*10],stage:5,order:2+(sg>0?1:0),look:`red`})});
{let rg=R0(0,-zw+t/2,L,zw-t/2);rg=plus(rg,FS.flatMap(f=>[te(f*L-5,-zw-t/2,f*L+5,-zw+t/2+.02),te(f*L-5,zw-t/2-.02,f*L+5,zw+t/2)]));push({id:`MD`,name:`Lenta (qiya taglik)`,group:G3,regions:rg,placement:{kind:`free`,ex:d,ey:[0,0,1],ez:[d[1],-d[0],0],pos:[A2[0],A2[1],0]},explode:[0,20,0],stage:4,order:0,look:`red`})}
for(let i=0;i<9;i++){let f=(i+.5)/9,rg=R0(f*L-3.5,-zw+t/2+5,f*L+3.5,zw-t/2-5);push({id:`MK${i+1}`,name:`Magnit rolik ${i+1}`,group:G3,regions:rg,placement:{kind:`free`,ex:d,ey:[0,0,1],ez:[d[1],-d[0],0],pos:[A2[0]-d[1]*t,A2[1]+d[0]*t,0]},explode:[0,30,0],stage:5,order:4+i,look:`asphalt`})}
DR.forEach(([xx,yy],i)=>{shaftZ(`MV${i+1}`,`Baraban vali ${i+1}`,G4,xx,-zw-15,zw+15,yy);[-1,1].forEach(sg=>{disc({id:`MB${i+1}${sg>0?`b`:`a`}`,nm:`Baraban gupchagi ${i+1}`,grp:G4,cx:xx,cy:yy,r:12,plane:`xy`,pc:sg*(zw+t+.05),spokes:0,look:`red`,hole:SH(xx,yy),stage:6,order:i*2});ring({id:`MO${i+1}${sg>0?`b`:`a`}`,nm:`Baraban gardishi ${i+1}`,grp:G4,cx:xx,cy:yy,ro:16,ri:9,plane:`xy`,pc:sg*(zw+2*t+.1),look:`asphalt`,stage:6,order:i*2+1})})});
motor(`MM`,G4,158,192,-20,20,0,40,BS,6);disc({id:`MS`,nm:`Dvigatel shkivi`,grp:G4,cx:-8,cy:26,r:10,plane:`zy`,pc:156.4,spokes:4,look:`asphalt`,stage:6,order:9});
BX0=-165;BX1=205;BZ0=-92;BZ1=92;CK.push({label:`Qiyalik`,ok:!0,detail:`lenta qiyaligi ${G(Math.atan2(dY,dx)*180/Math.PI,1)}°, ${L>0?G(L,0):0} mm uzunlik, 9 ta rolik`})};
({jc:JC,bm:BMf,vm:VMf,fl:FLf,ms:MSf}[mode]||JC)();fin();
{let rr=12,o=[];[[BX1-rr,BZ1-rr,0],[BX0+rr,BZ1-rr,Math.PI/2],[BX0+rr,BZ0+rr,Math.PI],[BX1-rr,BZ0+rr,1.5*Math.PI]].forEach(([cx,cz,a0])=>{for(let q=0;q<=8;q++){let a=a0+q*Math.PI/16;o.push(F(cx+rr*Math.cos(a),cz+rr*Math.sin(a)))}});let rg=[{outer:plCcw(o),holes:[]}];rg=minus(rg,BS);let E1=[];if(e.labels!==!1){let tx=MI.toUpperCase().replace(/[‘’]/g,`'`),xm=(BX0+BX1)/2,zm=BZ1-9,hs=5;E1.push(...mir(De(tx,xm-tx.length*hs*.36,zm,hs,0),zm))}push({id:`AS`,name:`Asos`,group:`00 Asos`,regions:rg,engraveLines:EL(rg,E1),placement:{kind:`horizontal`,y:-t/2},explode:[0,-30,0],stage:0,order:0,look:`sand`,info:[{label:`O‘lcham`,value:`${G(BX1-BX0,0)} × ${G(BZ1-BZ0,0)} mm`}]})}
let nP=y.filter(q=>q.material===`plywood`).length,nC=y.length-nP,dm=mkDim[mode]||[0,0,0];let ymx=0;y.forEach(p=>{let pl=p.placement||{};pl.kind===`horizontal`&&(ymx=Math.max(ymx,pl.y+t/2))});CK.unshift({label:`Uskuna`,ok:!0,detail:`${MI} — rasmdagi o‘lcham ${dm.join(` × `)} mm`},{label:`Detallar`,ok:!0,detail:`${nP} ta fanera${nC?` + ${nC} ta qoplama (${G(ct,1)} mm)`:``}`});
let st=[{stage:-1,title:`Tayyorgarlik`,text:`Fanera ${G(t,1)} mm${mode===`vm`&&ct>0?`, qoplama ${G(ct,1)} mm (shpon/karton)`:``}. Bo‘yoq: tabiiy fanera (korpus), qizil (maxoviklar, gardishlar, belbog‘lar, lenta), qora (tishli toj, rolikalar, shinalar), ko‘k (dvigatel), kulrang (vallar, jag‘). PVA yelim. Avval kalibrlash kartasi bilan tirqish toleransini tekshiring.`},{stage:0,title:`1. Asos`,text:`Asosni (AS) yog‘och rangida qoldiring; nom gravyurasi old tomonda.`},{stage:1,title:`2. Rama / tayanch`,text:`Rama devorlarini asos tirqishlariga kiriting: avval old va orqa devor, so‘ng yon devorlarni ular orasiga — yon devor tishlari old/orqa devorning yopiq tirqishlariga kiradi.`},{stage:2,title:`3. Ust plita`,text:`Ust plitani devor tishlariga kiydiring — u ramani qattiq qutiga aylantiradi.`},{stage:3,title:`4. Korpus`,text:`Asosiy korpus detallarini ust plita tirqishlariga o‘rnating.`},{stage:4,title:`5. Ichki va ustki qismlar`,text:`Qopqoq, lenta, halqalar va bezak qismlarini joyiga kiydiring.`},{stage:5,title:`6. Vallar`,text:`Vallarni teshiklardan o‘tkazing — ular erkin aylanishi kerak.`},{stage:6,title:`7. Aylanuvchi qismlar va dvigatel`,text:`Maxoviklar, disklar va gardishlarni vallarga kiygizing, dvigatelni yig‘ing.`},{stage:7,title:`8. Bezak`,text:`Ruda/ko‘pik plitalarini yelimlang.`}];
let sm=[{label:`Model`,value:`${MI} (boyitish uskunasi)`},{label:`O‘lcham`,value:`${dm.join(` × `)} mm (asos ${G(BX1-BX0,0)} × ${G(BZ1-BZ0,0)} mm)`},{label:`Material`,value:`fanera ${G(t,1)} mm (${nP})${nC?` + qoplama (${nC})`:``}`}];
return{parts:y,steps:st,drawings:[],summary:sm,checks:CK,extent:{radius:Math.max(BX1-BX0,BZ1-BZ0)/2+30,height:Math.max(ymx,dm[2])+20,topRadius:3,steam:!1},glueJoints:y.length*2,stageNames:[`Asos`,`Rama`,`Ust plita`,`Korpus`,`Ichki qismlar`,`Vallar`,`Aylanuvchi qismlar`,`Bezak`]}}
var mkGen={id:`mineralKits`,name:`Boyitish uskunalari`,status:`ready`,params:mkPA,defaults:mkD,presets:mkPre,validate:e=>mkV({...mkD,...e}),generate:e=>mkG({...mkD,...e})},mkOne=(m,id,nm,desc,keys,pre)=>{let P=[...mkP.filter(p=>keys.includes(p.key)),...k],D={...mkD,machine:m};return{id,name:nm,description:desc,status:`ready`,params:P,defaults:D,presets:pre,validate:e=>mkV({...D,...e,machine:m}),generate:e=>mkG({...D,...e,machine:m})}},mkGens=[mkOne(`jc`,`oreJawCrusher`,`Jag‘li maydalagich (boyitish)`,`Rudani birlamchi maydalovchi jag‘li maydalagich maketi, 260 × 180 × 220 mm: panjarali rama, ikki yonoq, oynadan ko‘rinadigan 7 ta tishli jag‘, yuklash bunkeri, ekssentrik val va qora shinali 2 ta qizil maxovik (aylanadi). Barcha birikmalar tish-tirqishli.`,[`labels`,`slotClearance`],[{name:`Rasmdagidek`,hint:`260 × 180 × 220 mm, nom gravyurasi bilan`,values:{labels:!0}},{name:`Gravyurasiz`,hint:`asosda yozuv yo‘q`,values:{labels:!1}}]),mkOne(`bm`,`oreBallMill`,`Sharli tegirmon — gorizontal (boyitish)`,`Gorizontal sharli tegirmon maketi, 400 × 180 × 180 mm: teshik gravyurali reykali baraban, qizil gardishlar, qora tishli toj (girth gear), podshipnik tayanchlari, yuklash bunkeri, mufta va ko‘k elektr dvigatel. Baraban val atrofida aylanadi.`,[`staves`,`labels`,`slotClearance`],[{name:`Rasmdagidek (16 reyka)`,hint:`400 × 180 × 180 mm`,values:{staves:16}},{name:`Silliqroq baraban (20 reyka)`,hint:`ko‘proq reyka — yumaloqroq`,values:{staves:20}},{name:`Tez yig‘ish (12 reyka)`,hint:`kamroq detal`,values:{staves:12}}]),mkOne(`vm`,`oreVerticalMill`,`Vertikal tegirmon (boyitish)`,`Vertikal tegirmon maketi, 200 × 200 × 250 mm: 4 ta radial oyoq va rama plitasi, konus–silindr–konus korpus (qovurg‘a + halqa karkas, shpon qoplama), 3 ta qizil belbog‘, yon tishli yuritma.`,[`clad`,`labels`,`slotClearance`],[{name:`Rasmdagidek (qoplamali)`,hint:`1,2 mm shpon/karton qoplama`,values:{clad:1.2}},{name:`Ochiq karkas`,hint:`ichki tuzilishi ko‘rinadi`,values:{clad:0}}]),mkOne(`fl`,`oreFlotation`,`Flotatsiya kamerasi (boyitish)`,`Flotatsiya mashinasi maketi, 350 × 150 × 160 mm: tayanch rama, 3 ta kamera, ruda zarrali ko‘pik plitalari, 3 ta impellerli aralashtirgich vali va ko‘k dvigatel.`,[`rocks`,`labels`,`slotClearance`],[{name:`Rasmdagidek (ko‘pik bilan)`,hint:`3 kamera, ko‘pik plitalari`,values:{rocks:!0}},{name:`Ochiq kameralar`,hint:`ko‘pik plitalarisiz — impellerlar ko‘rinadi`,values:{rocks:!1}}]),mkOne(`ms`,`oreMagSeparator`,`Magnit separator (boyitish)`,`Qiya lentali magnit separator maketi, 320 × 180 × 160 mm: rama, qiya yon devorlar, qizil lenta va bortlar, 9 ta qora magnit rolik, ikki uchida aylanuvchi barabanlar va ko‘k dvigatel.`,[`labels`,`slotClearance`],[{name:`Rasmdagidek`,hint:`320 × 180 × 160 mm`,values:{labels:!0}}])];
mkCache=mkGens;return mkCache}
[0,1,2,3,4].forEach(function(i){window.__lmCustomF.push(function(LM){return mkInit(LM)[i]})})})();

}catch(e){console.error('custom oreMachines.js',e);window.__lmCustomErr=(window.__lmCustomErr||[]).concat(String(e&&e.stack||e))}

/* solarTracker.js */
try{
window.__lmCustomF=window.__lmCustomF||[];
window.__lmCustomF.push(function(LM){
const {F,te,de,fe,U,plCcw,ctClip,ctMk,De,M,N,j,G,dy,A,k,ny,uy,fy,W}=LM;
var qtP=[{key:`scale`,label:`Maket o‘lchami`,group:`Umumiy`,type:`select`,options:[{value:`0.5`,label:`1:2 — balandligi 500 mm (tavsiya)`},{value:`0.6`,label:`1:1,67 — balandligi 600 mm`},{value:`0.35`,label:`1:2,85 — balandligi 350 mm (ixcham)`}],help:`Rasmdagi asl o‘lcham: balandligi 1000 mm, panel 600 mm, asos 250 mm. Maket shu nisbatlarda kichraytiriladi.`},{key:`tilt`,label:`Panel qiyaligi (gorizontga nisbatan)`,group:`Panel`,type:`number`,unit:`°`,min:25,max:70,step:1,help:`Toshkentda (41° sh.k.) yillik optimal ≈ 35–40°, qishda ≈ 60°, yozda ≈ 20°. Aktuator uzunligi shu burchakka qarab hisoblanadi.`},{key:`cols`,label:`Yacheykalar (eni bo‘yicha)`,group:`Panel`,type:`int`,min:4,max:12,step:1},{key:`rows`,label:`Yacheykalar (har modulda, bo‘yi bo‘yicha)`,group:`Panel`,type:`int`,min:3,max:8,step:1},{key:`baseW`,label:`Asos eni (asl o‘lchamda)`,group:`Ustun va asos`,type:`number`,unit:`mm`,min:250,max:450,step:10,help:`Rasmda 250 mm. Panel og‘ir va oldinga chiqqan — 300–350 mm asos maketni barqarorroq qiladi.`},{key:`slotClearance`,label:`Tirqish toleransi`,group:`Birikmalar`,type:`number`,unit:`mm`,min:-.3,max:1,step:.05}],qtD={scale:`0.5`,tilt:55,cols:6,rows:4,baseW:250,slotClearance:.1,...A},qtPA=[...qtP,...k],qtPre=[{name:`Rasmdagidek (55°)`,hint:`balandligi 500 mm, asos 250 mm`,values:{scale:`0.5`,tilt:55,baseW:250}},{name:`Barqaror (asos 320 mm)`,hint:`ag‘darilmaydi, qiyalik 40°`,values:{scale:`0.5`,tilt:40,baseW:320}},{name:`Qishki holat (65°)`,hint:`quyosh past — panel tikroq`,values:{tilt:65}},{name:`Ixcham stol maketi`,hint:`350 mm, kichik list uchun`,values:{scale:`0.35`,tilt:45,baseW:300}}];
function qtGeo(e){let S=Number(e.scale)||.5,be=Math.max(20,Math.min(75,j(e,`tilt`)))*Math.PI/180,t=j(e,`thickness`),cw=Math.max(18,30*S),yP=640*S,Zp=Math.max(cw+36,72*S),ZA=Math.max(cw+60,120*S),Wp=600*S,Lp=720*S,Dr=Math.max(16,22*S),dA=Dr+t/2+12,n=[Math.sin(be),Math.cos(be)],up=[-Math.cos(be),Math.sin(be)],C=[Zp+n[0]*dA,yP+n[1]*dA];return{S,be,t,cw,yP,Zp,ZA,Wp,Lp,Dr,dA,n,up,C}}
function qtCG(parts){let m=0,z=0,x=0;parts.forEach(p=>{let xs=[],ys=[];p.regions.forEach(r=>r.outer.forEach(q=>{xs.push(q.x);ys.push(q.y)}));if(!xs.length)return;let u=(Math.min(...xs)+Math.max(...xs))/2,v=(Math.min(...ys)+Math.max(...ys))/2,a=(Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys))*.6,pl=p.placement||{},w;if(pl.kind===`horizontal`)w=[u,pl.y,v];else if(pl.kind===`free`)w=[pl.pos[0]+u*pl.ex[0]+v*pl.ey[0],pl.pos[1]+u*pl.ex[1]+v*pl.ey[1],pl.pos[2]+u*pl.ex[2]+v*pl.ey[2]];else return;m+=a;x+=a*w[0];z+=a*w[2]});return m?[x/m,z/m]:[0,0]}
function qtV(e){let q=M(qtPA,e);if(q.some(x=>x.severity===`error`))return q;q.push(...N(e));let g=qtGeo(e),W0=j(e,`sheetWidth`),V0=j(e,`sheetHeight`),em=j(e,`edgeMargin`),a=Math.max(W0,V0)-2*em,b=Math.min(W0,V0)-2*em,big=[];try{qtG(e).parts.forEach(p=>{let xs=[],ys=[];p.regions.forEach(r=>r.outer.forEach(q2=>{xs.push(q2.x);ys.push(q2.y)}));let w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);(Math.max(w,h)>a||Math.min(w,h)>b)&&big.push(`${p.id} ${G(w,0)}×${G(h,0)}`)})}catch(x){}big.length&&q.push({severity:`error`,field:`scale`,message:`Listga sig‘maydigan detallar: ${big.slice(0,4).join(`, `)} mm — kichikroq maket yoki kattaroq list tanlang.`});let half=j(e,`baseW`)*g.S/2,cg=[0,0];try{cg=qtCG(qtG(e).parts)}catch(x){}Math.abs(cg[1])>half*.85&&q.push({severity:`warning`,field:`baseW`,message:`Og‘irlik markazi asos chetiga juda yaqin (${G(cg[1],0)} mm, asos yarmi ${G(half,0)} mm) — maket oldinga ag‘darilishi mumkin: asosni kattalashtiring yoki stolga mahkamlang.`});return q}
function qtG(e){let g=qtGeo(e),{S,be,t,cw,yP,Zp,ZA,Wp,Lp,Dr,dA,n,up,C}=g,cl=j(e,`slotClearance`),s=t+cl,y=[],CK=[],minus=(rg,P)=>P.length?de(`difference`,rg,P):rg,plus=(rg,P)=>P.length?de(`union`,rg,P):rg,push=o=>y.push({material:`plywood`,thickness:t,look:`sand`,...o}),R0=(a,b,c2,d2)=>[{outer:te(a,b,c2,d2),holes:[]}],EL=(rg,L)=>L.flatMap(q=>ctClip(rg,q,.3)),circ=(x,yy,r)=>{let P=U(x,yy,r,Math.max(14,Math.round(r*5)));return[...P,P[0]]},mir=(L2,yc)=>L2.map(l2=>l2.map(q=>F(q.x,2*yc-q.y))),SH=(u,v)=>te(u-3-cl/2,v-s/2,u+3+cl/2,v+s/2),XYp=zc=>({kind:`free`,ex:[1,0,0],ey:[0,1,0],ez:[0,0,1],pos:[0,0,zc]}),ZYp=xc=>({kind:`free`,ex:[0,0,1],ey:[0,1,0],ez:[-1,0,0],pos:[xc,0,0]}),hull=P=>{let p=P.map(q=>[q.x,q.y]).sort((a2,b2)=>a2[0]-b2[0]||a2[1]-b2[1]),cr=(o,a2,b2)=>(a2[0]-o[0])*(b2[1]-o[1])-(a2[1]-o[1])*(b2[0]-o[0]),lo=[],hi=[];p.forEach(q=>{while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)});[...p].reverse().forEach(q=>{while(hi.length>1&&cr(hi[hi.length-2],hi[hi.length-1],q)<=0)hi.pop();hi.push(q)});return plCcw([...lo.slice(0,-1),...hi.slice(0,-1)].map(q=>F(q[0],q[1])))},bolts=(u0,u1,v,st2)=>{let o=[];for(let u=u0;u<=u1+1e-6;u+=st2||8)o.push(circ(u,v,.9));return o},BS=[],PS=[],B=(s0,off)=>F(C[0]-n[0]*(t/2+(off||0))+up[0]*s0,C[1]-n[1]*(t/2+(off||0))+up[1]*s0),slotB=[],Xc=cw+2.5+t/2+.05,Xr=Math.round(Wp*.28),Gs=Math.max(30,50*S),Gh=Math.max(50,110*S),bw=j(e,`baseW`)*S/2,pw=cw+Gs+10;
let yb=t,Hc=yP-Math.max(10,12*S),hc=Hc-yb,xt=[0],G1=`01 Asos va ustun`,G2=`02 Bosh qism va yelka`,G3=`03 Panel`,G4=`04 Aktuator va o‘qlar`;
[[-cw+t/2,`orqa`],[cw-t/2,`old`]].forEach(([zc,wn],wi)=>{let rg=R0(-cw-2.5,yb,cw+2.5,Hc);rg=plus(rg,[te(-5,yb-t,5,yb+.02),te(-5,Hc-.02,5,Hc+t)]);PS.push(te(-5-cl/2,zc-s/2,5+cl/2,zc+s/2));let gy=[yb+hc*.08,yb+hc*.3,yb+hc*.52,yb+hc*.74,yb+hc*.93],HS=[];[-cw+t/2,cw-t/2].forEach(xc=>gy.forEach(v=>HS.push(te(xc-s/2,v-3-cl/2,xc+s/2,v+3+cl/2))));rg=minus(rg,HS);push({id:`U${wi?`F`:`B`}`,name:`Ustun — ${wn} devor`,group:G1,regions:rg,engraveLines:EL(rg,[[F(-cw+4,yb+Gh+6),F(cw-4,yb+Gh+6)],[F(-cw+4,Hc-8),F(cw-4,Hc-8)]]),placement:XYp(zc),explode:[0,0,wi?20:-20],stage:1,order:wi,look:`sand`,info:[{label:`O‘lcham`,value:`${G(2*cw+5,0)} × ${G(hc,0)} mm`},{label:`Birikma`,value:`pastki tish poydevor plitasiga, yuqori tish qopqoqqa; yon devorlar 5 ta tishi bilan yopiq tirqishlarga`}]})});
[[-cw+t/2,`chap`],[cw-t/2,`o‘ng`]].forEach(([xc,wn],wi)=>{let gy=[yb+hc*.08,yb+hc*.3,yb+hc*.52,yb+hc*.74,yb+hc*.93],rg=R0(-cw+t,yb,cw-t,Hc);rg=plus(rg,gy.flatMap(v=>[te(-cw,v-3,-cw+t+.02,v+3),te(cw-t-.02,v-3,cw,v+3)]));rg=plus(rg,[te(-4,yb-t,4,yb+.02),te(-4,Hc-.02,4,Hc+t)]);PS.push(te(xc-s/2,-4-cl/2,xc+s/2,4+cl/2));push({id:`U${wi?`R`:`L`}`,name:`Ustun — ${wn} yon devor`,group:G1,regions:rg,placement:ZYp(xc),explode:[wi?20:-20,0,0],stage:1,order:2+wi,look:`sand`})});
let capH=[te(-5-cl/2,-cw+t/2-s/2,5+cl/2,-cw+t/2+s/2),te(-5-cl/2,cw-t/2-s/2,5+cl/2,cw-t/2+s/2),te(-cw+t/2-s/2,-4-cl/2,-cw+t/2+s/2,4+cl/2),te(cw-t/2-s/2,-4-cl/2,cw-t/2+s/2,4+cl/2)],cap=R0(-cw-2.5,-cw,cw+2.5,cw);cap=plus(cap,[-cw*.5,cw*.5].flatMap(zz=>[te(-Xc-t/2-.02,zz-4,-cw-2.4,zz+4),te(cw+2.4,zz-4,Xc+t/2+.02,zz+4)]));cap=minus(cap,capH);push({id:`UQ`,name:`Ustun qopqog‘i`,group:G1,regions:cap,placement:{kind:`horizontal`,y:Hc+t/2},explode:[0,20,0],stage:2,order:0,look:`sand`,info:[{label:`Vazifasi`,value:`ustun devorlarini bog‘laydi; yon tishlari bosh qism yonoqlariga kiradi`}]});
let GU=[[0,1,`old`],[0,-1,`orqa`],[1,1,`o‘ng`],[1,-1,`chap`]];GU.forEach(([ax,sg,wn],i)=>{let P=[F(cw,yb),F(cw+Gs,yb),F(cw+5,yb+Gh),F(cw,yb+Gh)],rg=[{outer:plCcw(sg>0?P:P.map(q=>F(-q.x,q.y))),holes:[]}],u0=sg*(cw+Gs*.45);rg=plus(rg,[te(u0-5,yb-2*t,u0+5,yb+.02)]);let sl=ax?te(u0-5-cl/2,-s/2,u0+5+cl/2,s/2):te(-s/2,u0-5-cl/2,s/2,u0+5+cl/2);BS.push(sl);PS.push(sl);push({id:`UG${i+1}`,name:`Ustun tirgovichi (kosinka) ${i+1} — ${wn}`,group:G1,regions:rg,engraveLines:EL(rg,[circ(sg*(cw+Gs*.3),yb+Gs*.25,1.6)]),placement:ax?XYp(0):ZYp(0),explode:ax?[sg*25,0,0]:[0,0,sg*25],stage:2,order:1+i,look:`sand`,info:[{label:`Birikma`,value:`tishi poydevor va asos plitasidan o‘tadi (2 qatlam), ustun devoriga yelimlanadi`}]})});
{let rg=R0(-pw,-pw,pw,pw);rg=minus(rg,PS);push({id:`UP`,name:`Poydevor plitasi`,group:G1,regions:rg,engraveLines:EL(rg,[circ(-pw+6,-pw+6,2),circ(pw-6,-pw+6,2),circ(-pw+6,pw-6,2),circ(pw-6,pw-6,2)]),placement:{kind:`horizontal`,y:t/2},explode:[0,-10,0],stage:0,order:1,look:`sand`})}
let yA=yP-Math.max(28,42*S),zAe=-ZA,HB=[yP-Math.max(36,55*S),yP+Math.max(10,15*S)],ARM=[yP-Math.max(36,55*S),yP-Math.max(20,30*S)],CH=[],WIN=te(cw+6,HB[0]+7,Zp-12,HB[1]-7);
[-1,1].forEach(sg=>{let xc=sg*Xc,rg=plus(R0(-cw-1,HB[0],Zp+Math.max(12,15*S),HB[1]),[te(zAe-Math.max(10,12*S),ARM[0],-cw+.5,ARM[1])]);let HS=[SH(Zp,yP),SH(zAe,yA),...[-cw*.5,cw*.5].map(zz=>te(zz-4-cl/2,Hc+t/2-s/2,zz+4+cl/2,Hc+t/2+s/2)),...[cw+10,Zp-16].map(zz=>te(zz-4-cl/2,HB[0]+6-s/2,zz+4+cl/2,HB[0]+6+s/2))];Zp-16-(cw+10)>14&&HS.push(te(cw+16,HB[0]+11,Zp-22,HB[1]-6));rg=minus(rg,HS);push({id:`BY${sg>0?2:1}`,name:`Bosh qism yonog‘i va yelka ${sg>0?2:1}`,group:G2,regions:rg,engraveLines:EL(rg,[circ(Zp,yP,7.5),circ(zAe,yA,6),...bolts(zAe,-cw-6,ARM[1]-3,9)]),placement:ZYp(xc),explode:[sg*30,0,0],stage:3,order:sg>0?1:0,look:`sand`,info:[{label:`Vazifasi`,value:`panel o‘qini (oldinda) va aktuator pastki sharnirini (yelka uchida) ushlaydi; ustun qopqog‘i tishlari kiradi`}]})});
{let x1=Xc-t/2-.02,rg=R0(-x1,cw+4,x1,Zp-12);rg=plus(rg,[cw+10,Zp-16].flatMap(zz=>[te(-Xc-t/2,zz-4,-x1+.02,zz+4),te(x1-.02,zz-4,Xc+t/2,zz+4)]));push({id:`BM`,name:`Dvigatel tagligi`,group:G2,regions:rg,placement:{kind:`horizontal`,y:HB[0]+6},explode:[0,-10,20],stage:4,order:0,look:`sand`});let r0=Math.max(7,10*S),yc=HB[0]+6+t/2+r0,nD=Math.max(3,Math.floor((Zp-16-(cw+8))/t));for(let i=0;i<nD;i++){let zz=cw+8+t/2+i*t,last=i===nD-1;push({id:`BD${dy(i+1)}`,name:last?`Dvigatel reduktor qopqog‘i`:`Dvigatel korpusi qatlami ${i+1}`,group:G2,regions:[{outer:C0(0,yc,last?r0*.8:r0),holes:[]}],engraveLines:i===0?[circ(0,yc,r0-2)]:[],placement:XYp(zz),explode:[0,15,20],stage:4,order:1+i,look:last?`green`:`gray`})}CK.push({label:`Dvigatel`,ok:!0,detail:`Ø${G(2*r0,0)} × ${G(nD*t,0)} mm (${nD} qatlam yelimlanadi) — real 12 V reduktorli motor o‘rnatish mumkin`})}
function C0(x,yy2,r){return plCcw(U(x,yy2,r,40))}
let half=Lp/2,mods=[[-half,0],[0,half]],rowsN=Math.round(j(e,`rows`)),colsN=Math.round(j(e,`cols`)),Fw=Math.max(8,12*S),panelPl=(off)=>({kind:`free`,ex:[1,0,0],ey:[0,up[1],up[0]],ez:[0,n[1],n[0]],pos:[0,C[1]+n[1]*off,C[0]+n[0]*off]}),RT=[-half+22,-half*.45,half*.45,half-22].map(v=>v*1),Xb=t+.05,sT=half-Math.max(22,30*S);
mods.forEach(([s0,s1],i)=>{let rg=R0(-Wp/2,s0+(i?.25:0),Wp/2,s1-(i?0:.25)),HS=[];[-Xr,Xr].forEach(xr=>RT.filter(v=>v>s0+4&&v<s1-4).forEach(v=>HS.push(te(xr-s/2,v-5-cl/2,xr+s/2,v+5+cl/2))));i&&[-Xb,Xb].forEach(xb=>HS.push(te(xb-s/2,sT-5-cl/2,xb+s/2,sT+5+cl/2)));rg=minus(rg,HS);let E1=[],cw2=(Wp-2*Fw)/colsN,rh=(s1-s0-1.5*Fw)/rowsN,v0=i?s0+Fw*.5:s0+Fw;for(let c=0;c<=colsN;c++)E1.push([F(-Wp/2+Fw+c*cw2,v0),F(-Wp/2+Fw+c*cw2,v0+rowsN*rh)]);for(let r=0;r<=rowsN;r++)E1.push([F(-Wp/2+Fw,v0+r*rh),F(Wp/2-Fw,v0+r*rh)]);for(let c=0;c<colsN;c++)for(let r=0;r<rowsN;r++){let xc=-Wp/2+Fw+(c+.5)*cw2,yc=v0+(r+.5)*rh;E1.push([F(xc-cw2*.42,yc),F(xc+cw2*.42,yc)])}push({id:`PM${i+1}`,name:`Quyosh moduli ${i+1} (${i?`yuqori`:`pastki`})`,group:G3,regions:rg,engraveLines:EL(rg,E1),placement:panelPl(0),explode:[0,60+i*20,40],stage:6,order:i,look:`water`,info:[{label:`O‘lcham`,value:`${G(Wp,0)} × ${G(half,0)} mm, ${colsN}×${rowsN} yacheyka (gravyura)`},{label:`Bo‘yash`,value:`to‘q ko‘k; yacheyka chiziqlari oq qoladi`},{label:`Qiyalik`,value:`${G(be*180/Math.PI,0)}°`}]})});
[[`PRT`,`Panel ramkasi — yuqori`,R0(-Wp/2,half-Fw,Wp/2,half)],[`PRB`,`Panel ramkasi — pastki`,R0(-Wp/2,-half,Wp/2,-half+Fw)],[`PRO`,`Panel ramkasi — o‘rta ajratgich`,R0(-Wp/2+Fw,-Fw*.35,Wp/2-Fw,Fw*.35)],...[-1,1].flatMap(sg=>[[`PS${sg>0?`R`:`L`}1`,`Panel ramkasi — ${sg>0?`o‘ng`:`chap`} yon (pastki)`,R0(sg>0?Wp/2-Fw:-Wp/2,-half+Fw,sg>0?Wp/2:-Wp/2+Fw,-Fw*.35)],[`PS${sg>0?`R`:`L`}2`,`Panel ramkasi — ${sg>0?`o‘ng`:`chap`} yon (yuqori)`,R0(sg>0?Wp/2-Fw:-Wp/2,Fw*.35,sg>0?Wp/2:-Wp/2+Fw,half-Fw)]])].forEach(([id,nm,rg],i)=>push({id,name:nm,group:G3,regions:rg,engraveLines:EL(rg,bolts(-Wp/2+5,Wp/2-5,id===`PRT`?half-Fw/2:id===`PRB`?-half+Fw/2:1e9,Math.max(16,30*S))),placement:panelPl(t),explode:[0,80,60],stage:7,order:i,look:`sand`}));
[-Xr,Xr].forEach((xr,i)=>{let s0=-half+12,s1=half-12,P=[B(s0),B(s1),B(s1,Dr),B(s0,Dr)],rg=[{outer:plCcw(P),holes:[]}];rg=plus(rg,[hull([B(-28,Dr-2),B(28,Dr-2),...U(Zp,yP,Math.max(9,11*S),20)])]);rg=plus(rg,RT.map(v=>plCcw([B(v-5,0),B(v+5,0),B(v+5,-t-.02),B(v-5,-t-.02)])));rg=minus(rg,[SH(Zp,yP)]);let E1=[circ(Zp,yP,Math.max(6,7.5*S))];push({id:`PQ${i+1}`,name:`Panel orqa qovurg‘asi ${i+1} (o‘q quloqchasi bilan)`,group:G3,regions:rg,engraveLines:EL(rg,E1),placement:ZYp(xr),explode:[0,50,40],stage:5,order:i,look:`sand`,info:[{label:`Birikma`,value:`4 ta tishi panel modullaridagi tirqishlarga; quloqchasidagi teshikdan panel o‘qi o‘tadi`}]})});
let T=B(sT,Math.max(12,14*S)),L0=F(zAe,yA),dz=T.x-L0.x,dyv=T.y-L0.y,LL=Math.hypot(dz,dyv),ux=dz/LL,uy2=dyv/LL,nx=-uy2,ny2=ux,bar=(a0,a1,w)=>plCcw([F(L0.x+ux*a0+nx*w,L0.y+uy2*a0+ny2*w),F(L0.x+ux*a1+nx*w,L0.y+uy2*a1+ny2*w),F(L0.x+ux*a1-nx*w,L0.y+uy2*a1-ny2*w),F(L0.x+ux*a0-nx*w,L0.y+uy2*a0-ny2*w)]),Lm=LL*.55,wT=Math.max(5,7*S),wR=Math.max(3.5,4.5*S);
{let rg=plus([{outer:bar(-wT,Lm,wT),holes:[]}],[C0(L0.x,L0.y,wT+1)]);rg=minus(rg,[SH(L0.x,L0.y)]);push({id:`AT`,name:`Chiziqli aktuator — tashqi quvur`,group:G4,regions:rg,engraveLines:EL(rg,[[F(L0.x+ux*Lm*.3+nx*(wT-1.5),L0.y+uy2*Lm*.3+ny2*(wT-1.5)),F(L0.x+ux*(Lm-4)+nx*(wT-1.5),L0.y+uy2*(Lm-4)+ny2*(wT-1.5))]]),placement:ZYp(0),explode:[0,0,-40],stage:8,order:0,look:`asphalt`,info:[{label:`Uzunlik`,value:`${G(LL,0)} mm (sharnirlar orasi)`}]})}
{let rg=plus([{outer:bar(Lm-.02,LL+wR,wR),holes:[]}],[C0(T.x,T.y,wR+2.5)]);rg=minus(rg,[SH(T.x,T.y)]);push({id:`AR`,name:`Chiziqli aktuator — shtok (xrom)`,group:G4,regions:rg,placement:ZYp(0),explode:[0,15,-40],stage:8,order:1,look:`gray`})}
[-1,1].forEach(sg=>{let rg=[{outer:hull([B(sT-Math.max(10,13*S),0),B(sT+Math.max(10,13*S),0),...U(T.x,T.y,Math.max(8,10*S),20)]),holes:[]}];rg=plus(rg,[plCcw([B(sT-5,0),B(sT+5,0),B(sT+5,-t-.02),B(sT-5,-t-.02)])]);rg=minus(rg,[SH(T.x,T.y)]);push({id:`AK${sg>0?2:1}`,name:`Aktuator kronshteyni ${sg>0?2:1} (yashil)`,group:G4,regions:rg,engraveLines:EL(rg,[circ(T.x,T.y,4.5)]),placement:ZYp(sg*Xb),explode:[sg*15,40,0],stage:7,order:5+(sg>0?1:0),look:`green`})});
push({id:`AO1`,name:`Panel o‘qi`,group:G4,regions:R0(-Xr-8,Zp-3,Xr+8,Zp+3),placement:{kind:`horizontal`,y:yP},explode:[0,0,30],stage:5,order:9,look:`gray`,info:[{label:`Vazifasi`,value:`yonoqlar va panel qovurg‘alaridan o‘tadi — panel shu o‘q atrofida buriladi`}]});push({id:`AO2`,name:`Aktuator pastki o‘qi`,group:G4,regions:R0(-Xc-6,zAe-3,Xc+6,zAe+3),placement:{kind:`horizontal`,y:yA},explode:[0,0,-30],stage:8,order:8,look:`gray`});push({id:`AO3`,name:`Aktuator yuqori o‘qi`,group:G4,regions:R0(-Xb-t-5,T.x-3,Xb+t+5,T.x+3),placement:{kind:`horizontal`,y:T.y},explode:[0,20,0],stage:8,order:9,look:`gray`});
[-1,1].forEach(sg=>[[Zp,yP],[zAe,yA]].forEach(([zz,yy],i)=>push({id:`AV${i+1}${sg>0?`b`:`a`}`,name:`Shayba-stopor ${i+1}`,group:G4,regions:minus([{outer:C0(zz,yy,Math.max(6,7*S)),holes:[]}],[SH(zz,yy)]),placement:ZYp(sg*(i?Xc+t+.05:Xr+t+.05)),explode:[sg*20,0,0],stage:8,order:12+i,look:`gray`})));
{let rr=Math.max(8,12*S),o=[];[[bw-rr,bw-rr,0],[-bw+rr,bw-rr,Math.PI/2],[-bw+rr,-bw+rr,Math.PI],[bw-rr,-bw+rr,1.5*Math.PI]].forEach(([cx,cz,a0])=>{for(let q=0;q<=8;q++){let a=a0+q*Math.PI/16;o.push(F(cx+rr*Math.cos(a),cz+rr*Math.sin(a)))}});let rg=[{outer:plCcw(o),holes:[]}];rg=minus(rg,BS);let E1=[circ(-bw+10,-bw+10,2.2),circ(bw-10,-bw+10,2.2),circ(-bw+10,bw-10,2.2),circ(bw-10,bw-10,2.2)],tz=bw-Math.max(8,10*S),hs=Math.max(3.5,5*S);E1.push(...mir(De(`QUYOSH TREKERI`,-hs*5,tz,hs,0),tz));push({id:`AS`,name:`Asos plitasi`,group:`00 Asos`,regions:rg,engraveLines:EL(rg,E1),placement:{kind:`horizontal`,y:-t/2},explode:[0,-30,0],stage:0,order:0,look:`sand`,info:[{label:`O‘lcham`,value:`${G(2*bw,0)} × ${G(2*bw,0)} mm`}]})}
let qcg=qtCG(y),topY=Math.max(B(half,0).y,T.y)+t,degs=G(be*180/Math.PI,0),halfB=bw;CK.push({label:`Panel`,ok:!0,detail:`${G(Wp,0)} × ${G(Lp,0)} mm (2 modul), qiyaligi ${degs}°, eng yuqori nuqta ${G(topY,0)} mm`},{label:`Aktuator`,ok:!0,detail:`sharnirlar orasi ${G(LL,0)} mm — boshqa burchak uchun faqat aktuator detallari o‘zgaradi`},{label:`Barqarorlik`,ok:Math.abs(qcg[1])<=halfB*.85,detail:`og‘irlik markazi ustun o‘qidan ${G(qcg[1],0)} mm oldinda, asos yarmi ${G(halfB,0)} mm (zaxira ${G(100*(1-Math.abs(qcg[1])/halfB),0)}%)${Math.abs(qcg[1])>halfB*.85?` — asosni kattalashtiring (≥ ${G(Math.abs(qcg[1])/S*2/.8,0)} mm asl o‘lchamda) yoki stolga mahkamlang`:``}`},{label:`Masshtab`,ok:!0,detail:`1:${G(1/S,2)} — asl: balandligi 1000 mm, panel 600 mm, asos 250 mm`});
let st=[{stage:-1,title:`Tayyorgarlik`,text:`Fanera ${G(t,1)} mm, PVA yelim, qisqichlar. Panel modullarini to‘q ko‘kka bo‘yang (gravyura chiziqlari oq qoladi), kronshteynlarni yashilga, aktuator quvurini qoraga, o‘q va shaybalarni kumushrangga.`},{stage:0,title:`1. Asos`,text:`Poydevor plitasini (UP) asos (AS) markaziga yelimlang — tirqishlar ustma-ust tushsin.`},{stage:1,title:`2. Ustun`,text:`Old va orqa devorni tirqishlarga kiriting, yon devorlarni ular orasiga — tishlari yopiq tirqishlarga.`},{stage:2,title:`3. Qopqoq va kosinkalar`,text:`Ustun qopqog‘ini (UQ) kiydiring, 4 ta kosinkani ikki qatlam plitadan o‘tkazib ustunga yelimlang.`},{stage:3,title:`4. Bosh qism`,text:`Ikki yonoqni (BY) qopqoq tishlariga kiydiring.`},{stage:4,title:`5. Dvigatel`,text:`Dvigatel tagligini yonoqlar tirqishlariga o‘rnating, dvigatel qatlamlarini ustma-ust yelimlang.`},{stage:5,title:`6. Panel qovurg‘alari va o‘q`,text:`Panel o‘qini yonoqlar va ikkala qovurg‘a quloqchasidan o‘tkazing.`},{stage:6,title:`7. Modullar`,text:`Ikkala quyosh modulini qovurg‘a tishlariga kiydiring, ramka chiziqlarini old yuzaga yelimlang.`},{stage:8,title:`8. Aktuator`,text:`Quvur va shtokni o‘qlar bilan yelka uchi va yashil kronshteynlarga ulang, shaybalarni kiydiring. Panel burchagini o‘zgartirish uchun shtokni boshqa uzunlikda kesing (generator hisoblaydi).`}];
let sm=[{label:`Model`,value:`bir o‘qli quyosh trekeri (chiziqli aktuatorli)`},{label:`O‘lcham`,value:`balandligi ≈ ${G(topY,0)} mm, panel ${G(Wp,0)} × ${G(Lp,0)} mm, asos ${G(2*bw,0)} mm`},{label:`Material`,value:`fanera ${G(t,1)} mm (${y.length} detal)`}];
return{parts:y,steps:st,drawings:[],summary:sm,checks:CK,extent:{radius:Math.max(Wp/2,Lp*.6)+30,height:topY+30,topRadius:3,steam:!1},glueJoints:y.length*2,stageNames:[`Asos`,`Ustun`,`Qopqoq`,`Bosh qism`,`Dvigatel`,`Qovurg‘alar`,`Modullar`,`Ramka`,`Aktuator`]}}
var qtGen={id:`solarTracker`,name:`Quyosh trekeri (aktuatorli panel)`,description:`Quyoshga buriladigan quyosh paneli maketi (rasmdagi 1000 mm stend asosida): kosinkali kvadrat ustun, ikki qatlam asos, dvigatelli bosh qism va yelka, 2 modulli panel (yacheyka gravyurasi, ramka), orqa qovurg‘alar va o‘q, chiziqli aktuator (quvur + shtok, yashil kronshteyn). Qiyalik burchagi parametr — aktuator uzunligi va barqarorlik hisoblanadi.`,status:`ready`,params:qtPA,defaults:qtD,presets:qtPre,validate:e=>qtV({...qtD,...e}),generate:e=>qtG({...qtD,...e})};
return qtGen;
});

}catch(e){console.error('custom solarTracker.js',e);window.__lmCustomErr=(window.__lmCustomErr||[]).concat(String(e&&e.stack||e))}
/* ==== AI-AUTO-END ==== */
