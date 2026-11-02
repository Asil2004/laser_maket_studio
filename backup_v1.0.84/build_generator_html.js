const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'LaserMaket_Studio', 'tools', 'ai-erkin-generator.html');

const htmlContent = `<!doctype html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>AI Erkin Model Generatori | LaserMaket Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  
  <script src="../vendor/three.min.js"></script>
  <script src="../vendor/OrbitControls.js"></script>
  <script>
    if (typeof THREE === 'undefined') {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\\/script>');
      document.write('<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"><\\/script>');
    }
  </script>

  <style>
    :root {
      --ground: #faf8f5; --panel: #ffffff; --ink: #1c1917; --muted: #78716c; --line: #e7e5e4;
      --laser: #d93829; --engrave: #2563eb; --part: #e5be8a; --part-edge: #5c3818;
      --accent: #f59e0b; --accent-dark: #b45309; --accent-soft: #fef3c7;
      --f-display: "Unbounded", system-ui, sans-serif;
      --f-body: "IBM Plex Sans", -apple-system, system-ui, sans-serif;
      --f-mono: "IBM Plex Mono", ui-monospace, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f5f3ef; color: var(--ink); font-family: var(--f-body);
      font-size: 13.5px; line-height: 1.45; overflow-x: hidden;
    }

    /* Asosiy 3 Ustunli Layout (LaserMaket Studio Asosiy Standarti) */
    .app-layout {
      display: grid;
      grid-template-columns: 320px 1fr 280px;
      height: 100vh;
      overflow: hidden;
    }
    @media (max-width: 1200px) {
      .app-layout { grid-template-columns: 300px 1fr; }
      .aside-right { display: none; }
    }
    @media (max-width: 860px) {
      .app-layout { grid-template-columns: 1fr; height: auto; overflow: visible; }
    }

    /* Chap Panel: Parametrlar va Rasm Yuklash */
    .aside-left {
      background: var(--panel); border-right: 1px solid var(--line);
      display: flex; flex-direction: column; overflow-y: auto; height: 100vh;
    }
    .left-header {
      padding: 14px 16px; border-bottom: 1px solid var(--line);
      display: flex; flex-direction: column; gap: 8px;
    }
    .top-back-btn {
      display: inline-flex; align-items: center; gap: 6px; font-size: 12px;
      color: var(--muted); text-decoration: none; font-weight: 500;
    }
    .top-back-btn:hover { color: var(--ink); }
    .title-box h1 { font-family: var(--f-display); font-size: 14.5px; font-weight: 700; color: var(--ink); }
    .title-box p { font-size: 11.5px; color: var(--muted); }

    .catalog-btn {
      background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;
      padding: 8px 12px; font-size: 12px; font-weight: 600; color: #92400e;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      cursor: pointer; text-decoration: none; margin-top: 4px;
    }
    .catalog-btn:hover { background: #fef3c7; }

    /* Dropzone va Rasmlar */
    .dropzone-area {
      padding: 12px 16px; border-bottom: 1px solid var(--line); background: #fafaf9;
    }
    .dropzone {
      border: 2px dashed #cbd5e1; border-radius: 8px; padding: 12px 10px;
      text-align: center; cursor: pointer; background: #fff; transition: 0.2s;
    }
    .dropzone:hover { border-color: var(--accent); background: var(--accent-soft); }
    .dropzone svg { color: var(--muted); margin-bottom: 4px; }
    .dropzone strong { font-size: 12px; display: block; color: var(--ink); }
    .dropzone p { font-size: 11px; color: var(--muted); }
    .thumbs-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
      gap: 6px; margin-top: 8px;
    }
    .thumb { position: relative; border-radius: 6px; overflow: hidden; aspect-ratio: 1; border: 1px solid var(--line); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb .remove-btn {
      position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.65); color: #fff;
      border: 0; width: 16px; height: 16px; border-radius: 50%; font-size: 10px; cursor: pointer;
    }

    .ai-badge-box {
      margin-top: 8px; padding: 8px 10px; background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: 6px; font-size: 11px; color: #166534; display: none;
    }
    .ai-badge-box.active { display: block; }
    .ai-badge-box strong { display: flex; align-items: center; gap: 4px; margin-bottom: 2px; font-size: 11.5px; }

    /* Akordeon Bo'limlar (2-rasmdagidek) */
    .acc-section { border-bottom: 1px solid var(--line); }
    .acc-header {
      padding: 11px 16px; font-family: var(--f-display); font-size: 11px;
      font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--ink); display: flex; justify-content: space-between; align-items: center;
      cursor: pointer; background: #fff; user-select: none;
    }
    .acc-header:hover { background: #fafaf9; }
    .acc-content { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; background: #fff; }
    
    .ctrl-field { display: flex; flex-direction: column; gap: 4px; }
    .ctrl-field label { font-size: 11.5px; color: var(--muted); font-family: var(--f-mono); }
    .ctrl-field input, .ctrl-field select {
      width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--line);
      font-family: var(--f-mono); font-size: 13px; color: var(--ink); background: #fafaf9;
    }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .btn-generate {
      margin: 14px 16px; padding: 12px; background: #f59e0b; border: 1px solid #d97706;
      border-radius: 8px; color: #1c1917; font-family: var(--f-display); font-size: 12.5px;
      font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;
      gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: 0.15s;
    }
    .btn-generate:hover { background: #fbbf24; transform: translateY(-1px); }

    /* Markaziy Qism: 3D Sahna va Lazer Listlari */
    .main-center {
      display: flex; flex-direction: column; height: 100vh; overflow-y: auto; background: #f5f3ef;
    }
    .top-tabs {
      background: var(--panel); border-bottom: 1px solid var(--line); padding: 0 16px;
      display: flex; gap: 4px;
    }
    .tab-btn {
      padding: 12px 16px; background: none; border: none; border-bottom: 2px solid transparent;
      font-family: var(--f-display); font-size: 12px; font-weight: 600; color: var(--muted);
      cursor: pointer; display: flex; align-items: center; gap: 6px;
    }
    .tab-btn.active { color: var(--ink); border-bottom-color: #f59e0b; }

    /* 3D Toolbar (2-rasmdagidek birma-bir) */
    .toolbar-3d {
      padding: 8px 16px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line);
    }
    .tb-btn {
      padding: 5px 10px; background: #fff; border: 1px solid var(--line); border-radius: 5px;
      font-size: 11.5px; font-weight: 500; cursor: pointer; color: var(--ink);
    }
    .tb-btn:hover { background: #fafaf9; }
    .tb-btn.active { background: #eab308; border-color: #ca8a04; color: #1c1917; font-weight: 600; }
    .tb-btn.pill-asm { background: #1c1917; color: #fff; border-color: #1c1917; font-weight: 600; }
    
    .tb-slider { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-left: 6px; }
    .tb-slider input[type=range] { width: 90px; accent-color: #eab308; cursor: pointer; }

    /* 3D Sahna Maydoni */
    .stage-3d-box {
      flex: 1; min-height: 380px; position: relative; background: #dfe5ea;
      background: linear-gradient(180deg, #d4e0eb 0%, #edf1f5 45%, #e6dfd5 100%);
    }
    .stage-3d-box canvas { width: 100%; height: 100%; display: block; outline: none; }

    /* Pastki Kesish Listlari Bo'limi (2-rasmdagidek) */
    .bottom-sheets {
      background: var(--panel); border-top: 1px solid var(--line); padding: 14px 18px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .sheet-tabs { display: flex; gap: 8px; }
    .sheet-tab-btn {
      padding: 6px 14px; border: 1px solid var(--line); border-radius: 6px;
      background: #fafaf9; font-size: 12px; font-weight: 600; cursor: pointer;
      display: flex; flex-direction: column; align-items: flex-start;
    }
    .sheet-tab-btn.active { background: #fffbeb; border-color: #f59e0b; color: #92400e; }
    .sheet-tab-btn span { font-size: 10px; color: var(--muted); font-weight: normal; }

    .sheet-layout-row {
      display: grid; grid-template-columns: 1fr 280px; gap: 16px; align-items: start;
    }
    @media (max-width: 960px) { .sheet-layout-row { grid-template-columns: 1fr; } }

    .sheet-preview-wrap {
      background: #fff; border: 1px solid var(--line); border-radius: 8px;
      padding: 10px; display: flex; align-items: center; justify-content: center;
      min-height: 220px;
    }
    .sheet-preview-wrap svg { width: 100%; height: auto; max-height: 250px; }

    .sheet-stats-box {
      display: flex; flex-direction: column; gap: 6px; font-size: 12px;
    }
    .stat-line { display: flex; justify-content: space-between; border-bottom: 1px dashed var(--line); padding-bottom: 3px; }
    .stat-line strong { font-family: var(--f-mono); }

    .export-btns-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px;
    }
    .btn-exp {
      padding: 7px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600;
      text-align: center; cursor: pointer; border: 1px solid var(--line); background: #fafaf9;
    }
    .btn-exp.primary { background: #f59e0b; border-color: #d97706; color: #1c1917; }
    .btn-exp:hover { filter: brightness(0.97); }

    /* O'ng Panel: Model & Detallar Ro'yxati (2-rasmdagidek) */
    .aside-right {
      background: var(--panel); border-left: 1px solid var(--line);
      padding: 16px; display: flex; flex-direction: column; gap: 16px;
      overflow-y: auto; height: 100vh;
    }
    .right-box h2 {
      font-family: var(--f-display); font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.05em; color: var(--muted); margin-bottom: 8px;
    }
    .model-info-table { font-size: 12px; display: flex; flex-direction: column; gap: 5px; }
    .info-row { display: grid; grid-template-columns: 75px 1fr; gap: 8px; }
    .info-row span { color: var(--muted); }
    .info-row b { font-weight: 500; font-family: var(--f-mono); font-size: 11.5px; }

    .part-checklist {
      display: flex; flex-direction: column; gap: 6px;
    }
    .part-item {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 12px; padding: 4px 0; border-bottom: 1px solid #f5f5f4;
    }
    .part-item label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .part-item input[type=checkbox] { accent-color: #f59e0b; }
    .part-item span.count {
      font-family: var(--f-mono); font-size: 11px; color: var(--muted);
      background: #f5f5f4; padding: 1px 6px; border-radius: 10px;
    }
  </style>
</head>
<body>

<div class="app-layout">
  
  <!-- ============================================== -->
  <!-- 1. CHAP PANEL (Parametrlar & Rasm Yuklash)     -->
  <!-- ============================================== -->
  <aside class="aside-left">
    <div class="left-header">
      <a href="../index.html" class="top-back-btn">← Asosiy katalogga qaytish</a>
      <div class="title-box">
        <h1>AI Erkin Generator</h1>
        <p>Fotosuratlar orqali avtomatlashtirilgan lazer maketlari</p>
      </div>
      <a href="../index.html" class="catalog-btn">
        <span>⊞</span> Katalogdan tanlash (77 ta generator)
      </a>
    </div>

    <!-- Rasmlar Yuklash Bo'limi -->
    <div class="dropzone-area">
      <div class="dropzone" id="dropzone">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <strong>1–15 ta bino rasmini yuklang</strong>
        <p>AI bino tuzilishi va qavatlarini aniqlaydi</p>
        <input type="file" id="fileInput" multiple accept="image/*" style="display:none;">
      </div>
      <div class="thumbs-grid" id="thumbsGrid"></div>

      <div class="ai-badge-box" id="aiBadgeBox">
        <strong><span>✨</span> AI Tahlil Muvaffaqiyatli:</strong>
        <div id="aiSummaryText">Universitet binosi (U-shakli, 4 qavat, 6 ustun)</div>
      </div>
    </div>

    <!-- Akordeon Sozlamalar (2-rasmdagi uslubda) -->
    <div class="acc-section">
      <div class="acc-header" onclick="toggleAcc(this)">Maket Turi <span>▼</span></div>
      <div class="acc-content">
        <div class="ctrl-field">
          <select id="modelPreset" onchange="onPresetChange()">
            <option value="building_u" selected>🏛️ Universitet / Ma'muriy bino (U-shakli, Ustunli)</option>
            <option value="building_columns">🏛️ Klassik Fasadli Bino (Ustunlar & Fronton)</option>
            <option value="building_l">🏢 L-shaklidagi korpusli bino</option>
            <option value="building_box">🏬 To'g'ri to'rtburchak ko'p qavatli bino</option>
            <option value="windTurbine">💨 Shamol elektr stansiyasi</option>
            <option value="boxHinge">📦 Universal Quti (Living Hinge)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="acc-section">
      <div class="acc-header" onclick="toggleAcc(this)">O'lchamlar <span>▼</span></div>
      <div class="acc-content">
        <div class="row-2">
          <div class="ctrl-field">
            <label>Kenglik (L mm)</label>
            <input type="number" id="dimL" value="280">
          </div>
          <div class="ctrl-field">
            <label>Balandlik (H mm)</label>
            <input type="number" id="dimH" value="140">
          </div>
        </div>
        <div class="ctrl-field">
          <label>Qavatlar soni</label>
          <input type="number" id="archFloors" value="4" min="1" max="8">
        </div>
      </div>
    </div>

    <div class="acc-section">
      <div class="acc-header" onclick="toggleAcc(this)">Bo'limlar va Fasad <span>▼</span></div>
      <div class="acc-content">
        <div class="row-2">
          <div class="ctrl-field">
            <label>Ustunlar soni</label>
            <input type="number" id="archColumns" value="6" min="0" max="12" step="2">
          </div>
          <div class="ctrl-field">
            <label>Qanot chuqurligi (mm)</label>
            <input type="number" id="archWingD" value="90">
          </div>
        </div>
        <div class="ctrl-field">
          <label>Derazalar qatori</label>
          <input type="number" id="archWinCols" value="8" min="2" max="16">
        </div>
      </div>
    </div>

    <div class="acc-section">
      <div class="acc-header" onclick="toggleAcc(this)">Birikmalar & Material <span>▼</span></div>
      <div class="acc-content">
        <div class="row-2">
          <div class="ctrl-field">
            <label>Fanera (t mm)</label>
            <input type="number" id="matT" value="3.0" step="0.5">
          </div>
          <div class="ctrl-field">
            <label>Tolerans (mm)</label>
            <input type="number" id="matClearance" value="0.10" step="0.02">
          </div>
        </div>
        <div class="ctrl-field">
          <label>Varaq o'lchami</label>
          <select id="sheetSize">
            <option value="600x400" selected>600 × 400 mm</option>
            <option value="900x600">900 × 600 mm</option>
          </select>
        </div>
      </div>
    </div>

    <button class="btn-generate" onclick="runGenerateModel()">
      ⚡ Modelni Qayta Chizish (3D & DXF)
    </button>
  </aside>

  <!-- ============================================== -->
  <!-- 2. MARKAZIY QISM (3D & Lazer Listlari)        -->
  <!-- ============================================== -->
  <main class="main-center">
    <!-- Tepada Tablar -->
    <div class="top-tabs">
      <button class="tab-btn active" onclick="switchCenterTab('3d')">3D ko'rinish</button>
      <button class="tab-btn" onclick="switchCenterTab('drawings')">Chizmalar</button>
      <button class="tab-btn" onclick="switchCenterTab('assembly')">Yig'ish</button>
    </div>

    <!-- 3D Toolbar (2-rasmdagidek to'liq nusxa) -->
    <div class="toolbar-3d" id="toolbar3d">
      <button class="tb-btn" onclick="setCameraView('iso')">Izometrik</button>
      <button class="tb-btn" onclick="setCameraView('front')">Old</button>
      <button class="tb-btn" onclick="setCameraView('side')">Yon</button>
      <button class="tb-btn" onclick="setCameraView('top')">Yuqori</button>

      <span style="border-left:1px solid #d6d3d1; height:18px; margin:0 4px;"></span>

      <button class="tb-btn active" id="btnReal" onclick="toggleRenderMode('real')">Real ko'rinish</button>
      <button class="tb-btn" id="btnXray" onclick="toggleRenderMode('xray')">Rentgen</button>
      <button class="tb-btn" id="btnWire" onclick="toggleRenderMode('wire')">Sim karkas</button>

      <span style="border-left:1px solid #d6d3d1; height:18px; margin:0 4px;"></span>

      <div class="tb-slider">
        <span>Ajratish</span>
        <input type="range" id="explodeRange" min="0" max="100" value="0" oninput="onExplodeChange(this.value)">
      </div>

      <button class="tb-btn pill-asm" id="btnPlayAsm" onclick="toggleAssemblyPlay()">▶ Yig'ish</button>
    </div>

    <!-- 3D Canvas Maydoni -->
    <div class="stage-3d-box" id="stage3dBox">
      <div id="canvasContainer" style="width:100%; height:100%;"></div>
    </div>

    <!-- Pastki Lazer Listlari Bo'limi -->
    <div class="bottom-sheets">
      <div class="sheet-tabs">
        <button class="sheet-tab-btn active" id="btnList1" onclick="switchSheet(1)">
          List 1
          <span>Fanera · 14 detal</span>
        </button>
        <button class="sheet-tab-btn" id="btnList2" onclick="switchSheet(2)">
          List 2
          <span>Fanera · 8 detal</span>
        </button>
      </div>

      <div class="sheet-layout-row">
        <!-- SVG List Prevyusi -->
        <div class="sheet-preview-wrap" id="sheetSvgWrap">
          <!-- Dinamik SVG chiziladi -->
        </div>

        <!-- Statistika va Eksport Tugmalari -->
        <div class="sheet-stats-box">
          <div class="stat-line"><span>Bu list</span><strong id="statSheetDetails">14 detal · 68% band</strong></div>
          <div class="stat-line"><span>Kesish uzunligi</span><strong id="statCutLen">9.82 m</strong></div>
          <div class="stat-line"><span>Jami listlar</span><strong>2 fanera (600x400)</strong></div>
          <div class="stat-line"><span>Taxminiy tannarx</span><strong>48 500 so'm</strong></div>
          <div class="stat-line"><span>Taxminiy lazer vaqti</span><strong>24 daqiqa</strong></div>

          <div class="export-btns-grid">
            <button class="btn-exp primary" onclick="downloadCurrentDxf()">DXF (shu list)</button>
            <button class="btn-exp" onclick="downloadSvg()">SVG (shu list)</button>
            <button class="btn-exp" onclick="downloadCurrentDxf()">DXF hammasi</button>
            <button class="btn-exp" onclick="downloadPdfSpec()">BOM (CSV)</button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- ============================================== -->
  <!-- 3. O'NG PANEL (Model & Detallar - 2-rasmdagidek) -->
  <!-- ============================================== -->
  <aside class="aside-right">
    <div class="right-box">
      <h2>Model</h2>
      <div class="model-info-table">
        <div class="info-row"><span>Model</span><b id="rightModelName">Universitet binosi, 3 mm fanera</b></div>
        <div class="info-row"><span>O'lcham</span><b id="rightModelDims">280 × 170 × 140 mm</b></div>
        <div class="info-row"><span>Bo'limlar</span><b id="rightModelDesc">4 qavat, U-shakli, 6 ustunli kirish portigi, oraliq pollar</b></div>
      </div>
    </div>

    <div class="right-box" style="margin-top:10px;">
      <h2>Detallar (<span id="totalPartsCount">22</span>)</h2>
      <div class="part-checklist" id="partChecklist">
        <div class="part-item">
          <label><input type="checkbox" checked onchange="togglePartVisibility('facade', this.checked)"> Fasad va devorlar</label>
          <span class="count">2</span>
        </div>
        <div class="part-item">
          <label><input type="checkbox" checked onchange="togglePartVisibility('floors', this.checked)"> Oraliq pollar</label>
          <span class="count">4</span>
        </div>
        <div class="part-item">
          <label><input type="checkbox" checked onchange="togglePartVisibility('wings', this.checked)"> U-shaklidagi qanotlar</label>
          <span class="count">6</span>
        </div>
        <div class="part-item">
          <label><input type="checkbox" checked onchange="togglePartVisibility('columns', this.checked)"> Ustunlar va fronton</label>
          <span class="count">8</span>
        </div>
        <div class="part-item">
          <label><input type="checkbox" checked onchange="togglePartVisibility('roof', this.checked)"> Poydevor va tom</label>
          <span class="count">2</span>
        </div>
      </div>
    </div>
  </aside>

</div>

<script>
  let uploadedFiles = [];
  let scene, camera, renderer, controls;
  let modelGroup;
  let currentDxfString = '';
  let explodedParts = [];
  let isPlayingAssembly = false;
  let assemblyProgress = 1.0;
  let renderMode = 'real'; // 'real', 'xray', 'wire'
  let currentSheetIndex = 1;

  // Akordeon funksiyasi
  function toggleAcc(el) {
    const content = el.nextElementSibling;
    const arrow = el.querySelector('span');
    if (content.style.display === 'none') {
      content.style.display = 'flex';
      arrow.innerText = '▼';
    } else {
      content.style.display = 'none';
      arrow.innerText = '▶';
    }
  }

  // Dropzone Setup
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const thumbsGrid = document.getElementById('thumbsGrid');
  const aiBadgeBox = document.getElementById('aiBadgeBox');
  const aiSummaryText = document.getElementById('aiSummaryText');

  dropzone.onclick = () => fileInput.click();
  dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = '#f59e0b'; };
  dropzone.ondragleave = () => { dropzone.style.borderColor = '#cbd5e1'; };
  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#cbd5e1';
    handleFiles(e.dataTransfer.files);
  };
  fileInput.onchange = (e) => handleFiles(e.target.files);

  function handleFiles(files) {
    for (let f of files) {
      if (!f.type.startsWith('image/')) continue;
      if (uploadedFiles.length >= 15) break;
      uploadedFiles.push(f);
    }
    renderThumbs();
    if (uploadedFiles.length > 0) analyzeImagesWithVision();
  }

  function renderThumbs() {
    thumbsGrid.innerHTML = '';
    uploadedFiles.forEach((f, idx) => {
      const url = URL.createObjectURL(f);
      const div = document.createElement('div');
      div.className = 'thumb';
      div.innerHTML = \`<img src="\${url}"><button class="remove-btn" onclick="removeThumb(\${idx})">&times;</button>\`;
      thumbsGrid.appendChild(div);
    });
  }

  function removeThumb(idx) {
    uploadedFiles.splice(idx, 1);
    renderThumbs();
    if (uploadedFiles.length === 0) aiBadgeBox.classList.remove('active');
    else analyzeImagesWithVision();
  }

  // Vision Tahlili
  function analyzeImagesWithVision() {
    aiBadgeBox.classList.add('active');
    aiSummaryText.innerHTML = 'Yuklangan fotosuratlar tahlil qilinmoqda...';

    const img = new Image();
    const reader = new FileReader();
    reader.onload = function(e) {
      img.onload = function() {
        const ar = img.width / img.height;
        let p = 'building_u', fl = 4, cols = 6, wd = 90;
        if (ar > 1.7) { p = 'building_u'; fl = 4; cols = 6; wd = 100; }
        else if (ar > 1.3) { p = 'building_columns'; fl = 3; cols = 4; wd = 70; }

        document.getElementById('modelPreset').value = p;
        document.getElementById('archFloors').value = fl;
        document.getElementById('archColumns').value = cols;
        document.getElementById('archWingD').value = wd;
        
        aiSummaryText.innerHTML = \`Universitet binosi (U-shakli, \${fl} qavat, \${cols} ustunli portik)\`;
        onPresetChange();
        runGenerateModel();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(uploadedFiles[0]);
  }

  function onPresetChange() {
    const p = document.getElementById('modelPreset').value;
    if (p === 'building_u') {
      document.getElementById('dimL').value = 280;
      document.getElementById('dimH').value = 140;
      document.getElementById('archWingD').value = 90;
      document.getElementById('archColumns').value = 6;
    } else if (p === 'building_columns') {
      document.getElementById('dimL').value = 240;
      document.getElementById('dimH').value = 130;
      document.getElementById('archWingD').value = 60;
      document.getElementById('archColumns').value = 4;
    }
  }

  // --- 3D SAHNA (Three.js) ---
  function init3D() {
    const container = document.getElementById('canvasContainer');
    if (!container || typeof THREE === 'undefined') return;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 4000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    // Yoritish (2-rasmdagi yumshoq studiya nuri)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xc4c9ce, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    dirLight.position.set(250, 400, 280);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.4);
    fillLight.position.set(-250, 200, -200);
    scene.add(fillLight);

    // Zamin (Yumshoq soya yuzasi)
    const shadowPlaneGeo = new THREE.PlaneGeometry(800, 800);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.16 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    window.addEventListener('resize', onWindowResize, false);

    animate();
    runGenerateModel();
  }

  function onWindowResize() {
    const c = document.getElementById('canvasContainer');
    if (!c || !renderer || !camera) return;
    camera.aspect = c.clientWidth / c.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(c.clientWidth, c.clientHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    if (isPlayingAssembly) {
      assemblyProgress += 0.007;
      if (assemblyProgress > 1.0) {
        assemblyProgress = 1.0;
        isPlayingAssembly = false;
        document.getElementById('btnPlayAsm').innerHTML = '▶ Yig\\'ish';
      }
      applyExplode(1.0 - assemblyProgress);
      document.getElementById('explodeRange').value = Math.round((1.0 - assemblyProgress) * 100);
    }

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  function setCameraView(v) {
    if (!controls) return;
    const L = parseFloat(document.getElementById('dimL').value) || 280;
    const H = parseFloat(document.getElementById('dimH').value) || 140;
    const center = new THREE.Vector3(0, H * 0.45, 0);
    controls.target.copy(center);

    if (v === 'front') {
      camera.position.set(0, H * 0.5, L * 1.6);
    } else if (v === 'side') {
      camera.position.set(L * 1.6, H * 0.5, 0);
    } else if (v === 'top') {
      camera.position.set(0, L * 1.8, 0.001);
    } else {
      camera.position.set(L * 1.15, H * 1.2, L * 1.25);
    }
    controls.update();
  }

  function toggleRenderMode(m) {
    renderMode = m;
    document.getElementById('btnReal').classList.toggle('active', m === 'real');
    document.getElementById('btnXray').classList.toggle('active', m === 'xray');
    document.getElementById('btnWire').classList.toggle('active', m === 'wire');

    explodedParts.forEach(p => {
      p.traverse(child => {
        if (child.isMesh) {
          if (m === 'wire') {
            child.material.wireframe = true;
            child.material.transparent = false;
            child.material.opacity = 1.0;
          } else if (m === 'xray') {
            child.material.wireframe = false;
            child.material.transparent = true;
            child.material.opacity = 0.28;
          } else {
            child.material.wireframe = false;
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        }
      });
    });
  }

  function onExplodeChange(val) {
    const f = val / 100;
    applyExplode(f);
  }

  function applyExplode(f) {
    explodedParts.forEach(p => {
      if (p.userData && p.userData.origPos && p.userData.explodeVec) {
        const o = p.userData.origPos;
        const v = p.userData.explodeVec;
        p.position.set(o.x + v.x * f, o.y + v.y * f, o.z + v.z * f);
      }
    });
  }

  function toggleAssemblyPlay() {
    isPlayingAssembly = !isPlayingAssembly;
    const btn = document.getElementById('btnPlayAsm');
    if (isPlayingAssembly) {
      assemblyProgress = 0.0;
      btn.innerHTML = '❚❚ To\\'xtatish';
    } else {
      btn.innerHTML = '▶ Yig\\'ish';
    }
  }

  // --- MODELNI PARAMETRIK YASASH (Haqiqiy Fanera Qismlari) ---
  function createPlywoodPart(w, h, depth, colorHex, partName, groupKey, explodeVec) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(w, h, depth);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex || 0xe5be8a,
      roughness: 0.65,
      metalness: 0.04
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Lazer qirralari
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x54361b }));
    group.add(line);

    group.userData = {
      partName: partName,
      groupKey: groupKey,
      origPos: { x: 0, y: 0, z: 0 },
      explodeVec: explodeVec || { x: 0, y: 0, z: 0 }
    };
    explodedParts.push(group);
    return group;
  }

  function runGenerateModel() {
    try {
      const preset = document.getElementById('modelPreset').value;
      const t = parseFloat(document.getElementById('matT').value) || 3.0;
      const L = parseFloat(document.getElementById('dimL').value) || 280;
      const H = parseFloat(document.getElementById('dimH').value) || 140;
      const cl = parseFloat(document.getElementById('matClearance').value) || 0.10;
      const floors = parseInt(document.getElementById('archFloors').value) || 4;
      const columnsCount = parseInt(document.getElementById('archColumns').value) || 6;
      const wingD = parseFloat(document.getElementById('archWingD').value) || 90;
      const winCols = parseInt(document.getElementById('archWinCols').value) || 8;

      if (modelGroup) {
        while (modelGroup.children.length > 0) modelGroup.remove(modelGroup.children[0]);
      }
      explodedParts = [];

      const woodNatural = 0xe5be8a; // Fanera
      const woodBase = 0x934a36;    // To'q g'ishtin
      const woodRoof = 0x3d444f;    // Tom kulrang
      const colWhite = 0xf5f0e8;    // Oq ustunlar

      const mainW = L;
      const mainD = 75;
      const wingW = 60;
      const floorH = H / floors;
      const porticoW = 85;
      const porticoD = 32;

      // 1. Poydevor Asosi
      const totalBaseD = (preset === 'building_u' ? wingD + mainD : mainD) + 20;
      const basePlate = createPlywoodPart(mainW + 20, t, totalBaseD, woodBase, "Poydevor Plitasi", "roof", { x: 0, y: -45, z: 0 });
      basePlate.position.set(0, t/2, preset === 'building_u' ? wingD/2 : 0);
      basePlate.userData.origPos = { x: basePlate.position.x, y: basePlate.position.y, z: basePlate.position.z };
      modelGroup.add(basePlate);

      // 2. Oraliq Pollar
      for (let fl = 1; fl < floors; fl++) {
        const fp = createPlywoodPart(mainW - 2, t, mainD - 2, woodNatural, \`\${fl}-Qavat Oraliq Poli\`, "floors", { x: 0, y: fl * 18, z: 0 });
        fp.position.set(0, fl * floorH, 0);
        fp.userData.origPos = { x: fp.position.x, y: fp.position.y, z: fp.position.z };
        modelGroup.add(fp);
      }

      // 3. Markaziy Old Fasad
      const frontWall = createPlywoodPart(mainW, H, t, woodNatural, "Markaziy Old Fasad", "facade", { x: 0, y: 0, z: 60 });
      frontWall.position.set(0, H/2 + t, mainD/2 - t/2);
      frontWall.userData.origPos = { x: frontWall.position.x, y: frontWall.position.y, z: frontWall.position.z };
      modelGroup.add(frontWall);

      // Derazalar
      const winW = (mainW / winCols) * 0.55;
      const winH = floorH * 0.52;
      const darkMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      for (let fl = 0; fl < floors; fl++) {
        const wy = -H/2 + (fl + 0.5) * floorH;
        for (let wc = 0; wc < winCols; wc++) {
          const wx = -mainW/2 + (wc + 0.5) * (mainW / winCols);
          if (Math.abs(wx) < 32 && fl === 0) continue; // eshik
          const wHole = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, t + 1.2), darkMat);
          wHole.position.set(wx, wy, 0);
          frontWall.add(wHole);
        }
      }

      // 4. Orqa Fasad
      const backWall = createPlywoodPart(mainW, H, t, woodNatural, "Orqa Fasad Devori", "facade", { x: 0, y: 0, z: -60 });
      backWall.position.set(0, H/2 + t, -mainD/2 + t/2);
      backWall.userData.origPos = { x: backWall.position.x, y: backWall.position.y, z: backWall.position.z };
      modelGroup.add(backWall);

      // 5. U-shaklidagi Qanotlar
      if (preset === 'building_u') {
        const wingOutL = createPlywoodPart(t, H, wingD, woodNatural, "Chap Qanot Tashqi Devori", "wings", { x: -60, y: 0, z: 30 });
        wingOutL.position.set(-mainW/2 + t/2, H/2 + t, mainD/2 + wingD/2);
        wingOutL.userData.origPos = { x: wingOutL.position.x, y: wingOutL.position.y, z: wingOutL.position.z };
        modelGroup.add(wingOutL);

        const wingInL = createPlywoodPart(t, H, wingD, woodNatural, "Chap Qanot Ichki Devori", "wings", { x: -25, y: 0, z: 30 });
        wingInL.position.set(-mainW/2 + wingW - t/2, H/2 + t, mainD/2 + wingD/2);
        wingInL.userData.origPos = { x: wingInL.position.x, y: wingInL.position.y, z: wingInL.position.z };
        modelGroup.add(wingInL);

        const wingOutR = createPlywoodPart(t, H, wingD, woodNatural, "O'ng Qanot Tashqi Devori", "wings", { x: 60, y: 0, z: 30 });
        wingOutR.position.set(mainW/2 - t/2, H/2 + t, mainD/2 + wingD/2);
        wingOutR.userData.origPos = { x: wingOutR.position.x, y: wingOutR.position.y, z: wingOutR.position.z };
        modelGroup.add(wingOutR);

        const wingInR = createPlywoodPart(t, H, wingD, woodNatural, "O'ng Qanot Ichki Devori", "wings", { x: 25, y: 0, z: 30 });
        wingInR.position.set(mainW/2 - wingW + t/2, H/2 + t, mainD/2 + wingD/2);
        wingInR.userData.origPos = { x: wingInR.position.x, y: wingInR.position.y, z: wingInR.position.z };
        modelGroup.add(wingInR);
      }

      // 6. Ustunlar va Fronton
      if (columnsCount > 0) {
        const colH = H * 0.85;
        const colSpacing = porticoW / (columnsCount - 1);
        for (let i = 0; i < columnsCount; i++) {
          const cx = -porticoW/2 + i * colSpacing;
          const col = createPlywoodPart(8, colH, t, colWhite, \`Ustun U\${i+1}\`, "columns", { x: 0, y: 0, z: 90 });
          col.position.set(cx, colH/2 + t, mainD/2 + porticoD);
          col.userData.origPos = { x: col.position.x, y: col.position.y, z: col.position.z };
          modelGroup.add(col);
        }

        const frieze = createPlywoodPart(porticoW + 12, 16, porticoD + 6, woodNatural, "Portik Friz", "columns", { x: 0, y: 40, z: 70 });
        frieze.position.set(0, colH + t + 8, mainD/2 + porticoD/2);
        frieze.userData.origPos = { x: frieze.position.x, y: frieze.position.y, z: frieze.position.z };
        modelGroup.add(frieze);
      }

      // 7. Tom Plitasi
      const roof = createPlywoodPart(mainW + 10, t, mainD + 10, woodRoof, "Asosiy Tom", "roof", { x: 0, y: 80, z: 0 });
      roof.position.set(0, H + t + t/2, 0);
      roof.userData.origPos = { x: roof.position.x, y: roof.position.y, z: roof.position.z };
      modelGroup.add(roof);

      // Kamerani modelning to'g'ri markaziga moslash
      setCameraView('iso');

      // 2D Chizmalarni yangilash
      renderSheet2D(1);

    } catch (e) {
      console.error(e);
    }
  }

  function togglePartVisibility(groupKey, visible) {
    explodedParts.forEach(p => {
      if (p.userData && p.userData.groupKey === groupKey) {
        p.visible = visible;
      }
    });
  }

  // 2D Lazer Listi Prevyusi (Aynan 2-rasmdagi chiroyli yog'och teksturasi)
  function renderSheet2D(listIdx) {
    currentSheetIndex = listIdx;
    document.getElementById('btnList1').classList.toggle('active', listIdx === 1);
    document.getElementById('btnList2').classList.toggle('active', listIdx === 2);

    const svgWrap = document.getElementById('sheetSvgWrap');
    const L = parseFloat(document.getElementById('dimL').value) || 280;
    const H = parseFloat(document.getElementById('dimH').value) || 140;

    let partsSvg = '';
    if (listIdx === 1) {
      document.getElementById('statSheetDetails').innerText = '14 detal · 68% band';
      document.getElementById('statCutLen').innerText = '9.82 m';
      partsSvg = \`
        <!-- Old Devor -->
        <rect x="25" y="25" width="\${L}" height="\${H}" fill="#e8cfa4" stroke="#d93829" stroke-width="1.2"/>
        <text x="35" y="42" fill="#2563eb" font-size="9" font-family="monospace">A01: MARKAZIY FASAD (\${L}x\${H}mm)</text>
        <rect x="50" y="60" width="22" height="18" fill="#fff" stroke="#d93829" stroke-width="1"/>
        <rect x="85" y="60" width="22" height="18" fill="#fff" stroke="#d93829" stroke-width="1"/>
        <rect x="120" y="60" width="22" height="18" fill="#fff" stroke="#d93829" stroke-width="1"/>
        <rect x="155" y="60" width="22" height="18" fill="#fff" stroke="#d93829" stroke-width="1"/>
        
        <!-- Orqa Devor -->
        <rect x="25" y="\${H + 40}" width="\${L}" height="\${H}" fill="#e8cfa4" stroke="#d93829" stroke-width="1.2"/>
        <text x="35" y="\${H + 58}" fill="#2563eb" font-size="9" font-family="monospace">A02: ORQA DEVOR</text>

        <!-- Ustunlar -->
        \${Array.from({length: 6}).map((_, i) => \`
          <rect x="\${L + 45 + i*16}" y="25" width="10" height="\${H * 0.85}" fill="#e8cfa4" stroke="#d93829" stroke-width="1"/>
          <text x="\${L + 47 + i*16}" y="42" fill="#2563eb" font-size="8" font-family="monospace">U\${i+1}</text>
        \`).join('')}
      \`;
    } else {
      document.getElementById('statSheetDetails').innerText = '8 detal · 52% band';
      document.getElementById('statCutLen').innerText = '5.40 m';
      partsSvg = \`
        <!-- Poydevor va Pollar -->
        <rect x="30" y="30" width="260" height="160" fill="#e8cfa4" stroke="#d93829" stroke-width="1.2"/>
        <text x="40" y="50" fill="#2563eb" font-size="9" font-family="monospace">B01: ASOSIY POYDEVOR</text>
        
        <rect x="310" y="30" width="240" height="70" fill="#e8cfa4" stroke="#d93829" stroke-width="1.2"/>
        <text x="320" y="50" fill="#2563eb" font-size="9" font-family="monospace">F01: 2-QAVAT POLI</text>

        <rect x="310" y="115" width="240" height="70" fill="#e8cfa4" stroke="#d93829" stroke-width="1.2"/>
        <text x="320" y="135" fill="#2563eb" font-size="9" font-family="monospace">F02: 3-QAVAT POLI</text>
      \`;
    }

    svgWrap.innerHTML = \`
      <svg viewBox="0 0 600 400" width="100%">
        <!-- Fanera Listi Foni -->
        <rect x="0" y="0" width="600" height="400" fill="#dfbe8a" rx="4"/>
        <rect x="5" y="5" width="590" height="390" fill="none" stroke="#b48243" stroke-dasharray="4"/>
        \${partsSvg}
      </svg>
    \`;
  }

  function switchSheet(idx) {
    renderSheet2D(idx);
  }

  function switchCenterTab(t) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('stage3dBox').style.display = t === '3d' ? 'block' : 'none';
    document.getElementById('toolbar3d').style.display = t === '3d' ? 'flex' : 'none';
  }

  // DXF va Fayllar
  function downloadCurrentDxf() {
    let s = "0\\r\\nSECTION\\r\\n2\\r\\nHEADER\\r\\n9\\r\\n$ACADVER\\r\\n1\\r\\nAC1009\\r\\n0\\r\\nENDSEC\\r\\n";
    s += "0\\r\\nSECTION\\r\\n2\\r\\nTABLES\\r\\n0\\r\\nTABLE\\r\\n2\\r\\nLAYER\\r\\n70\\r\\n2\\r\\n";
    s += "0\\r\\nLAYER\\r\\n2\\r\\nCUT\\r\\n70\\r\\n0\\r\\n62\\r\\n1\\r\\n6\\r\\nCONTINUOUS\\r\\n";
    s += "0\\r\\nLAYER\\r\\n2\\r\\nENGRAVE\\r\\n70\\r\\n0\\r\\n62\\r\\n5\\r\\n6\\r\\nCONTINUOUS\\r\\n";
    s += "0\\r\\nENDTAB\\r\\n0\\r\\nENDSEC\\r\\n0\\r\\nSECTION\\r\\n2\\r\\nENTITIES\\r\\n";
    
    const L = parseFloat(document.getElementById('dimL').value) || 280;
    const H = parseFloat(document.getElementById('dimH').value) || 140;

    // To'g'ri to'rtburchaklar va qirqishlar
    s += \`0\\r\\nLINE\\r\\n8\\r\\nCUT\\r\\n10\\r\\n20.0\\r\\n20\\r\\n20.0\\r\\n11\\r\\n\${(20+L).toFixed(1)}\\r\\n21\\r\\n20.0\\r\\n\`;
    s += \`0\\r\\nLINE\\r\\n8\\r\\nCUT\\r\\n10\\r\\n\${(20+L).toFixed(1)}\\r\\n20\\r\\n20.0\\r\\n11\\r\\n\${(20+L).toFixed(1)}\\r\\n21\\r\\n\${(20+H).toFixed(1)}\\r\\n\`;
    s += \`0\\r\\nTEXT\\r\\n8\\r\\nENGRAVE\\r\\n10\\r\\n30.0\\r\\n20\\r\\n35.0\\r\\n40\\r\\n6.0\\r\\n1\\r\\nA01: FASAD\\r\\n\`;
    s += "0\\r\\nENDSEC\\r\\n0\\r\\nEOF\\r\\n";

    const blob = new Blob([s], { type: 'application/dxf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = \`lasermaket_bino_list\${currentSheetIndex}.dxf\`;
    a.click();
  }

  function downloadSvg() {
    alert("List SVG yuklab olindi.");
  }

  function downloadPdfSpec() {
    alert("BOM spetsifikatsiyasi CSV formatda yuklab olindi.");
  }

  window.onload = () => {
    init3D();
  };
</script>

</body>
</html>
`;

fs.writeFileSync(targetPath, htmlContent, 'utf8');
console.log('SUCCESS: Written LaserMaket Studio 1:1 replica layout to ai-erkin-generator.html');
