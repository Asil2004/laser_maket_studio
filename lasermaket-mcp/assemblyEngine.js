/**
 * LaserMaket Assembly & Nesting Engine
 */
const { DxfWriter, SvgWriter, CadEngine } = require('./cadEngine');

class AssemblyEngine {
  constructor(options = {}) {
    this.thickness = options.thickness || 3.0; // mm
    this.kerf = options.kerf || 0.15; // mm
    this.clearance = options.clearance || 0.1; // mm
    this.sheetWidth = options.sheetWidth || 600; // mm
    this.sheetHeight = options.sheetHeight || 400; // mm
    this.margin = options.margin || 3.0; // mm between parts
    this.border = options.border || 5.0; // mm from sheet edge
  }

  /**
   * Builds 2D cuts & engravings for a set of parts
   */
  processAssembly(parts) {
    const processedParts = [];
    const t = this.thickness;
    const cl = this.clearance;

    parts.forEach((part, idx) => {
      const partId = part.id || `P${idx + 1}`;
      const partName = part.name || `Detal ${idx + 1}`;
      const qty = part.qty || 1;
      const w = part.width;
      const h = part.height;

      const cutPaths = [];
      const engraveMarks = [];
      const holes = [];

      // Add part identification label
      engraveMarks.push({
        x: 4,
        y: 4,
        text: `${partId}: ${partName} (${qty}x)`
      });

      if (part.type === 'box_face') {
        // Flat face with finger joints on edges
        const fingerEdges = part.fingerEdges || {}; // { top: 'tab', bottom: 'slot', left: 'tab', right: 'slot' }
        let poly = [];

        // Simple rectangular boundary if no fingers specified
        poly = [
          [0, 0],
          [w, 0],
          [w, h],
          [0, h],
          [0, 0]
        ];
        cutPaths.push(poly);

        // Matching interior slots if provided
        if (part.slots) {
          part.slots.forEach(slot => {
            const sw = slot.w || (t + cl);
            const sh = slot.h || 10;
            const sx = slot.x;
            const sy = slot.y;
            holes.push([
              [sx, sy],
              [sx + sw, sy],
              [sx + sw, sy + sh],
              [sx, sy + sh],
              [sx, sy]
            ]);
            if (slot.matchId) {
              engraveMarks.push({ x: sx, y: Math.max(2, sy - 1), text: slot.matchId });
            }
          });
        }
      } else if (part.type === 'living_hinge') {
        // Box or wrap with flexible section
        cutPaths.push([
          [0, 0],
          [w, 0],
          [w, h],
          [0, h],
          [0, 0]
        ]);
        const bendZoneX = part.bendZoneX || 10;
        const bendZoneW = part.bendZoneW || (w - 20);
        const hingeLines = CadEngine.generateLivingHinge(bendZoneX, 0, bendZoneW, h, t);
        hingeLines.forEach(l => {
          cutPaths.push([[l.x1, l.y1], [l.x2, l.y2]]);
        });
      } else if (part.type === 'circle') {
        const r = w / 2;
        const outerCircle = [];
        const steps = 64;
        for (let i = 0; i <= steps; i++) {
          const ang = (i / steps) * 2 * Math.PI;
          outerCircle.push([r + r * Math.cos(ang), r + r * Math.sin(ang)]);
        }
        cutPaths.push(outerCircle);

        // Central axle hole
        if (part.centerHole === 'cross') {
          // '+' hole for fixed axle
          const arm = t * 1.5;
          const th = t / 2;
          holes.push([
            [r - th, r - arm], [r + th, r - arm], [r + th, r - th],
            [r + arm, r - th], [r + arm, r + th], [r + th, r + th],
            [r + th, r + arm], [r - th, r + arm], [r - th, r + th],
            [r - arm, r + th], [r - arm, r - th], [r - th, r - th],
            [r - th, r - arm]
          ]);
        } else if (part.centerHole === 'round') {
          const hr = (t + cl) / 2;
          const hCircle = [];
          for (let i = 0; i <= 32; i++) {
            const ang = (i / 32) * 2 * Math.PI;
            hCircle.push([r + hr * Math.cos(ang), r + hr * Math.sin(ang)]);
          }
          holes.push(hCircle);
        }
      } else {
        // Generic polygon or rectangle
        if (part.points) {
          cutPaths.push(part.points);
        } else {
          cutPaths.push([
            [0, 0],
            [w, 0],
            [w, h],
            [0, h],
            [0, 0]
          ]);
        }
      }

      processedParts.push({
        id: partId,
        name: partName,
        qty,
        width: w,
        height: h,
        cutPaths,
        holes,
        engraveMarks,
        joints: part.joints || []
      });
    });

    return processedParts;
  }

  /**
   * 2D Bin Packing onto laser sheet stock
   */
  nestParts(processedParts) {
    const sheets = [];
    const sw = this.sheetWidth;
    const sh = this.sheetHeight;
    const margin = this.margin;
    const border = this.border;

    let curSheet = { index: 1, parts: [], totalCutLen: 0 };
    sheets.push(curSheet);

    let curX = border;
    let curY = border;
    let rowMaxH = 0;

    // Expand by quantity and sort by descending height
    const allInstances = [];
    processedParts.forEach(p => {
      for (let q = 0; q < p.qty; q++) {
        allInstances.push({ ...p, instanceIndex: q + 1 });
      }
    });

    allInstances.sort((a, b) => b.height - a.height);

    for (const inst of allInstances) {
      const pw = inst.width;
      const ph = inst.height;

      if (curX + pw + margin > sw - border) {
        // Move to next row
        curX = border;
        curY += rowMaxH + margin;
        rowMaxH = 0;
      }

      if (curY + ph + margin > sh - border) {
        // Need a new sheet
        curSheet = { index: sheets.length + 1, parts: [], totalCutLen: 0 };
        sheets.push(curSheet);
        curX = border;
        curY = border;
        rowMaxH = 0;
      }

      // Calculate path length for this part
      let partCutLen = 0;
      inst.cutPaths.forEach(pts => {
        for (let i = 0; i < pts.length - 1; i++) {
          partCutLen += Math.hypot(pts[i+1][0] - pts[i][0], pts[i+1][1] - pts[i][1]);
        }
      });
      inst.holes.forEach(pts => {
        for (let i = 0; i < pts.length - 1; i++) {
          partCutLen += Math.hypot(pts[i+1][0] - pts[i][0], pts[i+1][1] - pts[i][1]);
        }
      });

      curSheet.parts.push({
        ...inst,
        placedX: curX,
        placedY: curY,
        cutLen: partCutLen
      });

      curSheet.totalCutLen += partCutLen;
      curX += pw + margin;
      rowMaxH = Math.max(rowMaxH, ph);
    }

    return sheets;
  }

  /**
   * Export nested sheets to DXF and SVG formats
   */
  exportToFiles(nestedSheets) {
    const exports = [];

    nestedSheets.forEach(sheet => {
      const dxf = new DxfWriter();
      const svg = new SvgWriter(this.sheetWidth, this.sheetHeight);

      // Sheet boundary
      dxf.addPolyline('FRAME', [
        [0, 0],
        [this.sheetWidth, 0],
        [this.sheetWidth, this.sheetHeight],
        [0, this.sheetHeight]
      ], true);

      sheet.parts.forEach(p => {
        const ox = p.placedX;
        const oy = p.placedY;

        // Cut paths
        p.cutPaths.forEach(pts => {
          const shifted = pts.map(pt => [pt[0] + ox, pt[1] + oy]);
          dxf.addPolyline('CUT', shifted, false);

          const d = shifted.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(2)} ${pt[1].toFixed(2)}`).join(' ');
          svg.addPath(d, 'CUT');
        });

        // Holes
        p.holes.forEach(pts => {
          const shifted = pts.map(pt => [pt[0] + ox, pt[1] + oy]);
          dxf.addPolyline('CUT', shifted, true);

          const d = shifted.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(2)} ${pt[1].toFixed(2)}`).join(' ') + ' Z';
          svg.addPath(d, 'CUT');
        });

        // Engraving labels
        p.engraveMarks.forEach(lbl => {
          const lx = ox + lbl.x;
          const ly = oy + lbl.y;
          dxf.addText('ENGRAVE', lx, ly, 2.5, lbl.text);
          svg.addText(lx, ly, lbl.text, 2.5, 'ENGRAVE');
        });
      });

      exports.push({
        sheetIndex: sheet.index,
        partCount: sheet.parts.length,
        cutLengthMeters: (sheet.totalCutLen / 1000).toFixed(2),
        dxfContent: dxf.stringify(),
        svgContent: svg.stringify()
      });
    });

    return exports;
  }
}

module.exports = {
  AssemblyEngine
};
