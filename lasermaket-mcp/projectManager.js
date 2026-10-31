/**
 * Project State Manager for LaserMaket MCP
 */
const fs = require('fs');
const path = require('path');
const { AssemblyEngine } = require('./assemblyEngine');
const { CadEngine, DxfWriter, SvgWriter } = require('./cadEngine');

class ProjectManager {
  constructor(storageDir) {
    this.storageDir = storageDir || path.join(__dirname, 'projects');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
    this.projects = new Map();
  }

  createProject(id, name, options = {}) {
    const project = {
      id: id || `proj_${Date.now()}`,
      name: name || 'Yangi Lazer Maket',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [],
      material: {
        type: options.materialType || 'plywood', // plywood, hdf, acrylic
        thickness: options.thickness || 3.0,
        kerf: options.kerf || 0.15,
        clearance: options.clearance || 0.1,
        sheetWidth: options.sheetWidth || 600,
        sheetHeight: options.sheetHeight || 400
      },
      spec: null,
      processedParts: [],
      nestedSheets: [],
      exports: []
    };

    this.projects.set(project.id, project);
    this.saveProjectToDisk(project);
    return project;
  }

  getProject(id) {
    if (this.projects.has(id)) {
      return this.projects.get(id);
    }
    // Try reading from disk
    const filePath = path.join(this.storageDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.projects.set(id, data);
        return data;
      } catch (e) {}
    }
    return null;
  }

  saveProjectToDisk(project) {
    const filePath = path.join(this.storageDir, `${project.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
  }

  addImages(projectId, imageList) {
    const project = this.getProject(projectId);
    if (!project) throw new Error(`Loyiha topilmadi: ${projectId}`);

    const validImages = [];
    imageList.forEach(img => {
      // img can be file path or base64/URL
      let exists = false;
      let size = 0;
      if (typeof img === 'string' && fs.existsSync(img)) {
        const stat = fs.statSync(img);
        exists = true;
        size = stat.size;
      }
      validImages.push({
        source: img,
        localFile: exists,
        sizeBytes: size,
        addedAt: new Date().toISOString()
      });
    });

    project.images = [...(project.images || []), ...validImages];
    project.updatedAt = new Date().toISOString();
    this.saveProjectToDisk(project);
    return project.images;
  }

  buildModelFromSpec(projectId, assemblySpec) {
    const project = this.getProject(projectId);
    if (!project) throw new Error(`Loyiha topilmadi: ${projectId}`);

    project.spec = assemblySpec;
    const engine = new AssemblyEngine({
      thickness: project.material.thickness,
      kerf: project.material.kerf,
      clearance: project.material.clearance,
      sheetWidth: project.material.sheetWidth,
      sheetHeight: project.material.sheetHeight
    });

    const processedParts = engine.processAssembly(assemblySpec.parts || []);
    const nestedSheets = engine.nestParts(processedParts);
    const exports = engine.exportToFiles(nestedSheets);

    // Save outputs on disk
    const projectOutDir = path.join(this.storageDir, project.id);
    if (!fs.existsSync(projectOutDir)) {
      fs.mkdirSync(projectOutDir, { recursive: true });
    }

    exports.forEach(exp => {
      const dxfPath = path.join(projectOutDir, `sheet_${exp.sheetIndex}.dxf`);
      const svgPath = path.join(projectOutDir, `sheet_${exp.sheetIndex}.svg`);
      fs.writeFileSync(dxfPath, exp.dxfContent, 'utf-8');
      fs.writeFileSync(svgPath, exp.svgContent, 'utf-8');
      exp.dxfPath = dxfPath;
      exp.svgPath = svgPath;
      // Strip raw string to save memory in json
      delete exp.dxfContent;
    });

    project.processedParts = processedParts;
    project.nestedSheets = nestedSheets;
    project.exports = exports;
    project.updatedAt = new Date().toISOString();
    this.saveProjectToDisk(project);

    return {
      projectId: project.id,
      partCount: processedParts.length,
      sheetsCount: nestedSheets.length,
      exports: project.exports.map(e => ({
        sheetIndex: e.sheetIndex,
        partCount: e.partCount,
        cutLengthMeters: e.cutLengthMeters,
        dxfPath: e.dxfPath,
        svgPath: e.svgPath
      }))
    };
  }

  generateTestCard(projectId) {
    const project = this.getProject(projectId);
    const t = project ? project.material.thickness : 3.0;
    const cl = project ? project.material.clearance : 0.0;

    const card = CadEngine.generateCalibrationCard(t, cl);
    const dxf = new DxfWriter();
    const svg = new SvgWriter(card.cardW + 10, card.cardH + 10);

    dxf.addPolyline('CUT', card.outer, true);
    const outerD = card.outer.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ') + ' Z';
    svg.addPath(outerD, 'CUT');

    card.holes.forEach(h => {
      dxf.addPolyline('CUT', h, true);
      const hd = h.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ') + ' Z';
      svg.addPath(hd, 'CUT');
    });

    card.labels.forEach(lbl => {
      dxf.addText('ENGRAVE', lbl.x, lbl.y, 2.5, lbl.text);
      svg.addText(lbl.x, lbl.y, lbl.text, 2.5, 'ENGRAVE');
    });

    const projectOutDir = path.join(this.storageDir, projectId || 'calibration');
    if (!fs.existsSync(projectOutDir)) fs.mkdirSync(projectOutDir, { recursive: true });

    const dxfPath = path.join(projectOutDir, 'calibration_comb_test.dxf');
    const svgPath = path.join(projectOutDir, 'calibration_comb_test.svg');
    fs.writeFileSync(dxfPath, dxf.stringify(), 'utf-8');
    fs.writeFileSync(svgPath, svg.stringify(), 'utf-8');

    return {
      dxfPath,
      svgPath,
      thickness: t,
      clearancesTested: [-0.2, -0.1, 0.0, +0.1, +0.2]
    };
  }
}

module.exports = {
  ProjectManager
};
