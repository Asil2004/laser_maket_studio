/**
 * LaserMaket CAD & Joinery Engine
 * Implements laser kit design rules from laser-kit-design-rules.skill
 */

class DxfWriter {
  constructor() {
    this.lines = [];
    this.layers = new Set(['CUT', 'ENGRAVE', 'FRAME']);
    this.entities = [];
  }

  addLine(layer, x1, y1, x2, y2) {
    this.entities.push({ type: 'LINE', layer, x1, y1, x2, y2 });
  }

  addPolyline(layer, points, closed = false) {
    this.entities.push({ type: 'POLYLINE', layer, points, closed });
  }

  addCircle(layer, cx, cy, r) {
    this.entities.push({ type: 'CIRCLE', layer, cx, cy, r });
  }

  addText(layer, x, y, height, text) {
    this.entities.push({ type: 'TEXT', layer, x, y, height, text });
  }

  stringify() {
    const out = [];
    const push = (code, val) => {
      out.push(code.toString());
      out.push(val.toString());
    };

    // Header
    push(0, 'SECTION');
    push(2, 'HEADER');
    push(9, '$ACADVER');
    push(1, 'AC1009'); // AutoCAD R12 compatibility
    push(0, 'ENDSEC');

    // Tables
    push(0, 'SECTION');
    push(2, 'TABLES');
    push(0, 'TABLE');
    push(2, 'LAYER');
    push(70, 3);

    // Layer CUT: Color 1 (Red)
    push(0, 'LAYER');
    push(2, 'CUT');
    push(70, 0);
    push(62, 1);
    push(6, 'CONTINUOUS');

    // Layer ENGRAVE: Color 5 (Blue)
    push(0, 'LAYER');
    push(2, 'ENGRAVE');
    push(70, 0);
    push(62, 5);
    push(6, 'CONTINUOUS');

    // Layer FRAME: Color 7 (White)
    push(0, 'LAYER');
    push(2, 'FRAME');
    push(70, 0);
    push(62, 7);
    push(6, 'CONTINUOUS');

    push(0, 'ENDTAB');
    push(0, 'ENDSEC');

    // Entities
    push(0, 'SECTION');
    push(2, 'ENTITIES');

    for (const ent of this.entities) {
      if (ent.type === 'LINE') {
        push(0, 'LINE');
        push(8, ent.layer);
        push(10, ent.x1.toFixed(3));
        push(20, ent.y1.toFixed(3));
        push(30, '0.0');
        push(11, ent.x2.toFixed(3));
        push(21, ent.y2.toFixed(3));
        push(31, '0.0');
      } else if (ent.type === 'POLYLINE') {
        const pts = ent.points;
        for (let i = 0; i < pts.length - 1; i++) {
          push(0, 'LINE');
          push(8, ent.layer);
          push(10, pts[i][0].toFixed(3));
          push(20, pts[i][1].toFixed(3));
          push(30, '0.0');
          push(11, pts[i + 1][0].toFixed(3));
          push(21, pts[i + 1][1].toFixed(3));
          push(31, '0.0');
        }
        if (ent.closed && pts.length > 2) {
          const last = pts[pts.length - 1];
          const first = pts[0];
          push(0, 'LINE');
          push(8, ent.layer);
          push(10, last[0].toFixed(3));
          push(20, last[1].toFixed(3));
          push(30, '0.0');
          push(11, first[0].toFixed(3));
          push(21, first[1].toFixed(3));
          push(31, '0.0');
        }
      } else if (ent.type === 'CIRCLE') {
        push(0, 'CIRCLE');
        push(8, ent.layer);
        push(10, ent.cx.toFixed(3));
        push(20, ent.cy.toFixed(3));
        push(30, '0.0');
        push(40, ent.r.toFixed(3));
      } else if (ent.type === 'TEXT') {
        push(0, 'TEXT');
        push(8, ent.layer);
        push(10, ent.x.toFixed(3));
        push(20, ent.y.toFixed(3));
        push(30, '0.0');
        push(40, ent.height.toFixed(3));
        push(1, ent.text);
      }
    }

    push(0, 'ENDSEC');
    push(0, 'EOF');
    return out.join('\r\n') + '\r\n';
  }
}

class SvgWriter {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.elements = [];
  }

  addPath(d, layer = 'CUT') {
    const stroke = layer === 'CUT' ? '#E00000' : (layer === 'ENGRAVE' ? '#0030D0' : '#888888');
    const strokeWidth = layer === 'CUT' ? '0.25' : '0.15';
    this.elements.push(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke"/>`);
  }

  addText(x, y, text, size = 3, layer = 'ENGRAVE') {
    const fill = layer === 'ENGRAVE' ? '#0030D0' : '#1A1A1A';
    this.elements.push(`<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" font-family="monospace" font-size="${size}" fill="${fill}">${text}</text>`);
  }

  stringify() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" width="${this.width}mm" height="${this.height}mm">
  <style>
    .cut { stroke: #E00000; stroke-width: 0.25; fill: none; }
    .engrave { stroke: #0030D0; stroke-width: 0.15; fill: none; }
    .frame { stroke: #888888; stroke-dasharray: 2 2; stroke-width: 0.2; fill: none; }
  </style>
  <rect x="0" y="0" width="${this.width}" height="${this.height}" class="frame" />
  ${this.elements.join('\n  ')}
</svg>`;
  }
}

/**
 * Joinery & Laser Cut Feature Generators
 */
class CadEngine {
  /**
   * Generates Living Hinge pattern path
   * pitch: ~0.8t + 0.8mm (1.5-3mm)
   * cutLen: 14mm, bridgeLen: 3mm
   */
  static generateLivingHinge(x, y, w, h, thickness) {
    const pitch = Math.max(1.5, Math.min(3.5, 0.8 * thickness + 0.8));
    const cutLen = 14;
    const bridgeLen = 3;
    const margin = 1.6;

    const lines = [];
    const cols = Math.floor((w - 2 * margin) / pitch);

    for (let c = 0; c < cols; c++) {
      const curX = x + margin + c * pitch;
      const offset = (c % 2) * ((cutLen + bridgeLen) / 2);
      let curY = y + margin + offset;

      while (curY < y + h - margin) {
        const yEnd = Math.min(curY + cutLen, y + h - margin);
        if (yEnd > curY + 1.0) {
          lines.push({ x1: curX, y1: curY, x2: curX, y2: yEnd });
        }
        curY += cutLen + bridgeLen;
      }
    }
    return lines;
  }

  /**
   * Generates box finger joint points along an edge
   */
  static generateFingerEdge(x1, y1, x2, y2, thickness, clearance, fingerCount = 5, isTab = true) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy; // Normal vector
    const ny = ux;

    const slotDepth = thickness + clearance;
    const count = Math.max(3, fingerCount % 2 === 0 ? fingerCount + 1 : fingerCount);
    const step = len / count;

    const pts = [[x1, y1]];

    for (let i = 0; i < count; i++) {
      const p1Dist = i * step;
      const p2Dist = (i + 1) * step;
      const isOut = (i % 2 === 0) ? isTab : !isTab;
      const offset = isOut ? slotDepth : 0;

      const px1 = x1 + ux * p1Dist + nx * offset;
      const py1 = y1 + uy * p1Dist + ny * offset;
      const px2 = x1 + ux * p2Dist + nx * offset;
      const py2 = y1 + uy * p2Dist + ny * offset;

      pts.push([px1, py1]);
      pts.push([px2, py2]);
    }
    pts.push([x2, y2]);
    return pts;
  }

  /**
   * Generates a 5-width slot calibration comb card + kerf square
   */
  static generateCalibrationCard(thickness, baseClearance = 0.0) {
    const cardW = 75;
    const cardH = 45;
    const clearances = [-0.2, -0.1, 0.0, +0.1, +0.2];
    const combX = 10;
    const combY = 0;
    const slotD = 15;
    const spacing = 12;

    const outer = [
      [0, 0],
      [combX, 0]
    ];

    const labels = [];
    clearances.forEach((c, idx) => {
      const slotW = thickness + c;
      const sx = combX + idx * spacing;
      outer.push([sx, 0]);
      outer.push([sx, slotD]);
      outer.push([sx + slotW, slotD]);
      outer.push([sx + slotW, 0]);
      labels.push({ x: sx - 1, y: slotD + 5, text: (c >= 0 ? '+' : '') + c.toFixed(1) });
    });

    outer.push([cardW, 0]);
    outer.push([cardW, cardH]);
    outer.push([0, cardH]);
    outer.push([0, 0]);

    // 10x10 square hole and 10x10 plug for kerf testing
    const holeX = 12;
    const holeY = 28;
    const hole = [
      [holeX, holeY],
      [holeX + 10, holeY],
      [holeX + 10, holeY + 10],
      [holeX, holeY + 10],
      [holeX, holeY]
    ];

    const plugX = 32;
    const plugY = 28;
    const plug = [
      [plugX, plugY],
      [plugX + 10, plugY],
      [plugX + 10, plugY + 10],
      [plugX, plugY + 10],
      [plugX, plugY]
    ];

    return {
      cardW,
      cardH,
      outer,
      holes: [hole, plug],
      labels: [
        ...labels,
        { x: 48, y: 35, text: `T=${thickness.toFixed(1)}mm` },
        { x: 12, y: 25, text: 'KERF 10x10' }
      ]
    };
  }
}

module.exports = {
  DxfWriter,
  SvgWriter,
  CadEngine
};
