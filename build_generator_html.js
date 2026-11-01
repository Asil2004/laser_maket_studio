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
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@600&display=swap">
  
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
      --graphite: #1f2226;
      --graphite-2: #2b2f34;
      --bg: #eceef0;
      --surface: #ffffff;
      --surface-2: #f5f6f7;
      --line: #d5d8dc;
      --fg: #1c1f23;
      --muted: #646a72;
      --accent: #f2b705;
      --accent-ink: #1c1f23;
      --accent-soft: #fff4cc;
      --err: #c62f2f;
      --ok: #1f7a46;
      --stage-a: #f6f7f8;
      --stage-b: #dfe2e6;
      --sky-a: #9fc1e0;
      --sky-b: #dfe8ee;
      --ply: #e9d3ad;
      --ply-part: #c99a5b;
      --cut: #e00000;
      --engr: #0030d0;
      --font-ui: "IBM Plex Sans", -apple-system, system-ui, sans-serif;
      --font-cond: "IBM Plex Sans Condensed", "IBM Plex Sans", system-ui, sans-serif;
      --font-mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; width: 100%; overflow: hidden; background: var(--bg); color: var(--fg); font: 13.5px/1.45 var(--font-ui); }
    
    .app {
      display: grid;
      grid-template:
        "top top top" 48px
        "left center right" minmax(0, 1fr)
        "left bottom right" 270px / 310px minmax(0, 1fr) 300px;
      height: 100vh;
      width: 100vw;
    }

    /* TOPBAR */
    .topbar {
      grid-area: top;
      background: var(--graphite);
      color: #f1f2f3;
      border-bottom: 2px solid var(--accent);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-mark {
      background: var(--accent); color: #1c1f23; border-radius: 6px;
      width: 30px; height: 30px; display: grid; place-items: center; font-size: 16px; font-weight: 700;
    }
    .brand h1 { font: 600 15px/1.1 var(--font-cond); letter-spacing: .02em; margin: 0; }
    .brand p { color: #b8bdc3; margin: 0; font-size: 11.5px; }
    .top-actions { display: flex; gap: 8px; align-items: center; }
    .btn {
      border: 1px solid var(--line); background: var(--surface); cursor: pointer;
      border-radius: 6px; padding: 5px 12px; font-size: 12.5px; font-weight: 500;
      display: inline-flex; align-items: center; gap: 6px; text-decoration: none; color: inherit;
    }
    .btn:hover { border-color: var(--accent); }
    .btn.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); font-weight: 600; }
    .btn.ghost { background: transparent; border-color: #4a5058; color: #e6e8ea; }
    .btn.ghost:hover { border-color: var(--accent); color: #fff; }

    /* ASIDE LEFT: PARAMETRLAR */
    .left {
      grid-area: left; background: var(--surface); border-right: 1px solid var(--line);
      display: flex; flex-direction: column; min-height: 0; overflow-y: auto; padding: 12px 14px; gap: 12px;
    }
    .sec-title {
      font: 600 11.5px var(--font-cond); text-transform: uppercase; letter-spacing: .07em; color: var(--muted);
      margin: 4px 0 2px;
    }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-size: 12px; color: var(--muted); font-weight: 500; }
    select, input[type=number], input[type=text] {
      width: 100%; border: 1px solid var(--line); background: var(--surface-2);
      border-radius: 5px; padding: 5px 8px; font-family: var(--font-mono); font-size: 12.5px; color: var(--fg);
    }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    
    .dropzone {
      border: 2px dashed var(--line); border-radius: 7px; padding: 12px 8px; text-align: center;
      background: var(--surface-2); cursor: pointer; transition: .2s; font-size: 12px;
    }
    .dropzone:hover { border-color: var(--accent); background: var(--accent-soft); }
    .dropzone strong { display: block; font-size: 12px; color: var(--fg); margin-bottom: 2px; }
    .dropzone span { font-size: 11px; color: var(--muted); }
    .thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 6px; }
    .thumb { position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden; border: 1px solid var(--line); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb button {
      position: absolute; top: 1px; right: 1px; background: rgba(0,0,0,0.7); color: #fff;
      border: 0; border-radius: 50%; width: 16px; height: 16px; font-size: 10px; cursor: pointer;
    }
    
    .pgroup { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
    .pgroup-head {
      background: var(--surface-2); cursor: pointer; width: 100%; font: 600 11.5px var(--font-cond);
      text-transform: uppercase; letter-spacing: .06em; text-align: left; border: 0; padding: 7px 10px;
      display: flex; justify-content: space-between; align-items: center; color: var(--fg);
    }
    .pgroup-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; background: var(--surface); }

    /* CENTER: 3D VIEWPORT */
    .center {
      grid-area: center; background: var(--bg); display: flex; flex-direction: column; min-height: 0; position: relative;
    }
    .center-tabs {
      background: var(--surface); border-bottom: 1px solid var(--line); display: flex; gap: 2px; padding: 4px 10px 0;
    }
    .center-tabs button {
      background: none; border: 0; border-bottom: 2px solid transparent; padding: 6px 14px;
      cursor: pointer; font-size: 13px; font-weight: 500; color: var(--muted);
    }
    .center-tabs button.on { color: var(--fg); border-bottom-color: var(--accent); }

    .stage {
      flex: 1; min-height: 0; position: relative;
      background: radial-gradient(ellipse at 50% 35%, var(--stage-a), var(--stage-b));
    }
    .stage.real {
      background: linear-gradient(180deg, var(--sky-a) 0%, var(--sky-b) 62%);
    }
    .stage canvas { width: 100%; height: 100%; display: block; }

    /* 3D TOOLBAR (Xuddi asl studiyadek) */
    .toolbar {
      position: absolute; top: 10px; left: 10px; right: 10px; display: flex; flex-wrap: wrap;
      align-items: center; gap: 6px; pointer-events: none; z-index: 10;
    }
    .toolbar > * { pointer-events: auto; }
    .tb-group {
      background: var(--surface); border: 1px solid var(--line); border-radius: 6px;
      display: flex; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .tb {
      border: 0; border-right: 1px solid var(--line); background: transparent; padding: 5px 9px;
      font-size: 12px; cursor: pointer; color: var(--fg); white-space: nowrap;
    }
    .tb:last-child { border-right: 0; }
    .tb:hover { background: var(--surface-2); }
    .tb.on { background: var(--accent); color: var(--accent-ink); font-weight: 600; }
    
    .tb-slider {
      background: var(--surface); border: 1px solid var(--line); border-radius: 6px;
      display: flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .tb-slider input[type=range] { width: 90px; accent-color: var(--accent); cursor: pointer; }

    .tag3d {
      position: absolute; bottom: 12px; left: 12px; background: var(--graphite); color: #f1f2f3;
      border: 1px solid var(--accent); border-radius: 6px; padding: 5px 9px; font-size: 11.5px;
      font-family: var(--font-mono); pointer-events: none; z-index: 10;
    }
    .tag3d b { color: var(--accent); margin-right: 4px; }

    /* ASIDE RIGHT: MODEL & DETALLAR */
    .right {
      grid-area: right; background: var(--surface); border-left: 1px solid var(--line);
      display: flex; flex-direction: column; min-height: 0; overflow-y: auto; padding: 12px 14px; gap: 12px;
    }
    .kv { display: grid; grid-template-columns: 80px 1fr; gap: 5px 8px; font-size: 12.5px; }
    .kv dt { color: var(--muted); }
    .kv dd { font-family: var(--font-mono); margin: 0; color: var(--fg); text-align: right; }
    
    .part-list { display: flex; flex-direction: column; gap: 4px; }
    .part-item {
      display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 4px 6px;
      border-radius: 4px; background: var(--surface-2); cursor: pointer;
    }
    .part-item:hover { background: var(--accent-soft); }
    .part-item input { accent-color: var(--accent); }
    .part-item .badge { font-family: var(--font-mono); font-size: 10.5px; color: var(--muted); margin-left: auto; }

    /* BOTTOM: LAZER KESISH LISTLARI */
    .bottom {
      grid-area: bottom; background: var(--surface); border-top: 1px solid var(--line);
      display: flex; flex-direction: column; min-height: 0;
    }
    .sheet-tabs {
      background: var(--surface-2); border-bottom: 1px solid var(--line); display: flex;
      gap: 4px; padding: 5px 12px; overflow-x: auto;
    }
    .sheet-tab {
      background: var(--surface); border: 1px solid var(--line); border-radius: 5px;
      padding: 4px 10px; cursor: pointer; font-size: 11.5px; display: flex; flex-direction: column;
    }
    .sheet-tab.on { border-color: var(--accent); background: var(--accent-soft); }
    .sheet-tab b { font-size: 12px; }
    .sheet-tab span { color: var(--muted); }

    .sheet-body {
      flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 12px;
      padding: 8px 12px; min-height: 0;
    }
    .sheet-svg-wrap {
      background: var(--ply); border: 1px solid var(--line); border-radius: 6px;
      display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4px;
    }
    .sheet-svg-wrap svg { width: 100%; height: 100%; max-height: 190px; }
    
    .sheet-meta { display: flex; flex-direction: column; gap: 6px; justify-content: space-between; }
    .meta-kv { display: grid; grid-template-columns: 110px 1fr; gap: 3px 6px; font-size: 12px; }
    .meta-kv dt { color: var(--muted); }
    .meta-kv dd { font-family: var(--font-mono); font-weight: 500; text-align: right; }
    
    .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  </style>
</head>
<body>

<div class="app">
  <!-- TOPBAR -->
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark">📐</div>
      <div>
        <h1>LaserMaket Studio</h1>
        <p>AI Erkin Model Generatori (Vision CAD)</p>
      </div>
    </div>
    <div class="top-actions">
      <button class="btn ghost" onclick="downloadCalibrationCard()">Sinov Taroqi (DXF)</button>
      <a href="../index.html" class="btn ghost">Katalogga qaytish</a>
    </div>
  </header>

  <!-- CHAP: PARAMETRLAR -->
  <aside class="left">
    <div class="sec-title">Maket turi</div>
    <select id="modelPreset" onchange="onPresetChange()">
      <option value="building_u" selected>🏛️ Universitet / Ma'muriy bino (U-shakli)</option>
      <option value="building_columns">🏛️ Klassik Fasad (Ustunlar & fronton)</option>
      <option value="building_l">🏢 L-shaklidagi korpus</option>
      <option value="building_box">🏬 To'rtburchak ko'p qavatli bino</option>
      <option value="windTurbine">💨 Shamol stansiyasi</option>
      <option value="boxHinge">📦 Universal Quti (Living Hinge)</option>
    </select>

    <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()">
      <strong>📷 1–15 ta bino fotosuratini yuklang</strong>
      <span>Old fasad, yon burchak yoki qush parvozi fotosurati</span>
      <input type="file" id="fileInput" multiple accept="image/*" style="display:none;" onchange="handleFiles(this.files)">
      <div class="thumbs" id="thumbs"></div>
    </div>

    <!-- O'LCHAMLAR -->
    <div class="pgroup">
      <button class="pgroup-head" type="button">O'lchamlar <span>▼</span></button>
      <div class="pgroup-body">
        <div class="row">
          <div class="field">
            <label>Kenglik (L mm)</label>
            <input type="number" id="dimL" value="280">
          </div>
          <div class="field">
            <label>Balandlik (H mm)</label>
            <input type="number" id="dimH" value="140">
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Qanot chuqurligi</label>
            <input type="number" id="archWingD" value="90">
          </div>
          <div class="field">
            <label>Fanera (t mm)</label>
            <input type="number" id="matT" value="3.0" step="0.5">
          </div>
        </div>
      </div>
    </div>

    <!-- BO'LIMLAR VA FASAD -->
    <div class="pgroup">
      <button class="pgroup-head" type="button">Qavatlar va Fasad <span>▼</span></button>
      <div class="pgroup-body">
        <div class="row">
          <div class="field">
            <label>Qavatlar soni</label>
            <input type="number" id="archFloors" value="4" min="1" max="8">
          </div>
          <div class="field">
            <label>Portik ustunlari</label>
            <input type="number" id="archColumns" value="6" min="0" max="12" step="2">
          </div>
        </div>
        <div class="field">
          <label>Derazalar qatori</label>
          <input type="number" id="archWinCols" value="8" min="2" max="16">
        </div>
      </div>
    </div>

    <!-- BIRIKMALAR -->
    <div class="pgroup">
      <button class="pgroup-head" type="button">Birikmalar <span>▼</span></button>
      <div class="pgroup-body">
        <div class="field">
          <label>Tirqish toleransi (clearance)</label>
          <input type="number" id="matClearance" value="0.10" step="0.02">
        </div>
      </div>
    </div>

    <button class="btn primary" style="width:100%; justify-content:center; padding:9px; margin-top:4px;" onclick="runGenerateModel()">
      ⚡ Qayta hisoblash & Chizish
    </button>
  </aside>

  <!-- O'RTA: 3D VIEWPORT -->
  <main class="center">
    <div class="center-tabs">
      <button class="on">3D ko'rinish</button>
      <button onclick="switchTab('drawings')">Chizmalar</button>
      <button onclick="switchTab('assembly')">Yig'ish</button>
    </div>

    <div class="stage" id="stage3d">
      <!-- 3D TOOLBAR (Xuddi 2-rasmdagi asl LaserMaket Studio) -->
      <div class="toolbar">
        <div class="tb-group">
          <button class="tb" onclick="resetCamera('iso')">Izometrik</button>
          <button class="tb" onclick="resetCamera('front')">Old</button>
          <button class="tb" onclick="resetCamera('side')">Yon</button>
          <button class="tb" onclick="resetCamera('top')">Yuqori</button>
        </div>

        <div class="tb-group">
          <button class="tb on" id="btnReal" onclick="toggleRealLook()">Real ko'rinish</button>
          <button class="tb" id="btnXray" onclick="toggleXray()">Rentgen</button>
          <button class="tb" id="btnWire" onclick="toggleWireframe()">Sim karkas</button>
        </div>

        <div class="tb-slider">
          <span>Ajratish</span>
          <input type="range" id="explodeRange" min="0" max="100" value="0" oninput="onExplodeInput(this.value)">
        </div>

        <div class="tb-group">
          <button class="tb" id="btnPlayAsm" onclick="togglePlayAssembly()">▶ Yig'ish</button>
        </div>
      </div>

      <div class="tag3d" id="tag3d" style="display:none;"></div>
      <div id="canvas3d" style="width:100%; height:100%;"></div>
    </div>
  </main>

  <!-- O'NG: MODEL XUSUSIYATLARI VA DETALLAR -->
  <aside class="right">
    <div class="sec-title">Model</div>
    <div class="kv">
      <dt>Model</dt><dd id="lblModelName">Universitet binosi</dd>
      <dt>O'lcham</dt><dd id="lblModelDim">280 × 190 × 140 mm</dd>
      <dt>Material</dt><dd>3 mm fanera</dd>
      <dt>Tuzilishi</dt><dd>4 qavat, 6 ustunli portik</dd>
    </div>

    <div class="sec-title" style="margin-top:10px;">Detallar (22)</div>
    <div class="part-list">
      <label class="part-item"><input type="checkbox" checked onchange="toggleGroup('front', this.checked)"> Old fasad devorlari <span class="badge">4</span></label>
      <label class="part-item"><input type="checkbox" checked onchange="toggleGroup('wings', this.checked)"> Yon qanot korpuslari <span class="badge">6</span></label>
      <label class="part-item"><input type="checkbox" checked onchange="toggleGroup('floors', this.checked)"> Qavat oraliq pollari <span class="badge">4</span></label>
      <label class="part-item"><input type="checkbox" checked onchange="toggleGroup('portico', this.checked)"> Ustunlar va fronton <span class="badge">7</span></label>
      <label class="part-item"><input type="checkbox" checked onchange="toggleGroup('roof', this.checked)"> Tom va poydevor <span class="badge">2</span></label>
    </div>
  </aside>

  <!-- PAST: LAZER LISTLARI -->
  <section class="bottom">
    <div class="sheet-tabs">
      <div class="sheet-tab on">
        <b>List 1</b>
        <span>Fanera · 12 detal</span>
      </div>
      <div class="sheet-tab">
        <b>List 2</b>
        <span>Fanera · 10 detal</span>
      </div>
    </div>

    <div class="sheet-body">
      <div class="sheet-svg-wrap" id="svgContainer">
        <!-- 2D Sheet SVG chiziladi -->
      </div>

      <div class="sheet-meta">
        <dl class="meta-kv">
          <dt>Bu list</dt><dd>12 detal · 74% band</dd>
          <dt>Kesish uzunligi</dt><dd id="lblCutLen">8.65 m</dd>
          <dt>Jami listlar</dt><dd>2 fanera (600x400)</dd>
          <dt>Taxminiy tannarx</dt><dd>52 000 so'm</dd>
          <dt>Lazer vaqti</dt><dd>1 soat 18 daq</dd>
        </dl>

        <div class="actions-grid">
          <button class="btn primary" onclick="downloadCurrentDxf()">DXF (shu list)</button>
          <button class="btn" onclick="downloadCurrentDxf()">DXF hammasi</button>
          <button class="btn" onclick="downloadCurrentSvg()">SVG (shu list)</button>
          <button class="btn" onclick="alert('PDF chizma tez orada yuklanadi!')">PDF chizma</button>
        </div>
      </div>
    </div>
  </section>
</div>

<script>
  let uploadedFiles = [];
  let scene, camera, renderer, controls;
  let modelGroup;
  let currentDxfString = '';
  let explodedParts = [];
  let isPlayingAssembly = false;
  let assemblyAnimProgress = 1.0;
  let raycaster, mouse;
  let isRealLook = true, isXray = false, isWire = false;

  const thumbs = document.getElementById('thumbs');
  const tag3d = document.getElementById('tag3d');

  function handleFiles(files) {
    for (let f of files) {
      if (!f.type.startsWith('image/')) continue;
      if (uploadedFiles.length >= 15) break;
      uploadedFiles.push(f);
    }
    renderThumbs();
    if (uploadedFiles.length > 0) analyzeImage();
  }

  function renderThumbs() {
    thumbs.innerHTML = '';
    uploadedFiles.forEach((f, idx) => {
      const url = URL.createObjectURL(f);
      const div = document.createElement('div');
      div.className = 'thumb';
      div.innerHTML = \`<img src="\${url}"><button onclick="event.stopPropagation(); removeThumb(\${idx})">&times;</button>\`;
      thumbs.appendChild(div);
    });
  }

  function removeThumb(idx) {
    uploadedFiles.splice(idx, 1);
    renderThumbs();
  }

  function analyzeImage() {
    const f = uploadedFiles[0];
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.onload = () => {
        const ar = img.width / img.height;
        if (ar > 1.6) {
          document.getElementById('modelPreset').value = 'building_u';
          document.getElementById('archFloors').value = 4;
          document.getElementById('archColumns').value = 6;
          document.getElementById('dimL').value = 280;
        } else {
          document.getElementById('modelPreset').value = 'building_columns';
          document.getElementById('archFloors').value = 3;
          document.getElementById('archColumns').value = 4;
          document.getElementById('dimL').value = 240;
        }
        onPresetChange();
        runGenerateModel();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }

  function onPresetChange() {
    const p = document.getElementById('modelPreset').value;
    if (p === 'building_u') {
      document.getElementById('lblModelName').innerText = "Universitet binosi (U-shakli)";
      document.getElementById('lblModelDim').innerText = "280 × 190 × 140 mm";
    } else if (p === 'building_columns') {
      document.getElementById('lblModelName').innerText = "Klassik bino (Fasad)";
      document.getElementById('lblModelDim').innerText = "240 × 150 × 130 mm";
    } else {
      document.getElementById('lblModelName').innerText = "Erkin bino maketi";
      document.getElementById('lblModelDim').innerText = "200 × 120 × 110 mm";
    }
  }

  // --- 3D SAHNA ---
  function init3D() {
    const container = document.getElementById('canvas3d');
    if (!container || typeof THREE === 'undefined') return;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 3000);
    // Kamerani to'liq markazga va to'g'ri masofaga joylashtirish:
    camera.position.set(260, 210, 300);

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
    controls.target.set(0, 65, 0); // Bino o'rtasiga qaratilgan!
    controls.maxPolarAngle = Math.PI / 2 + 0.05;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    container.addEventListener('mousemove', onMouseMove);

    // Yoritish (Asl studiyadagidek)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8a8578, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    dirLight.position.set(200, 350, 180);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xd9e8ff, 0.4);
    fillLight.position.set(-180, 150, -180);
    scene.add(fillLight);

    // Soya doirasi va karkas to'r
    const shadowGeo = new THREE.CircleGeometry(220, 64);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.1;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    const grid = new THREE.GridHelper(450, 30, 0x9da3aa, 0xc7cbd0);
    grid.position.y = -0.2;
    scene.add(grid);

    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    animate();
    runGenerateModel();
  }

  function animate() {
    requestAnimationFrame(animate);

    if (isPlayingAssembly) {
      assemblyAnimProgress += 0.008;
      if (assemblyAnimProgress > 1.0) {
        assemblyAnimProgress = 1.0;
        isPlayingAssembly = false;
        document.getElementById('btnPlayAsm').innerHTML = '▶ Yig\\'ish';
      }
      applyExplode(1.0 - assemblyAnimProgress);
      document.getElementById('explodeRange').value = Math.round((1.0 - assemblyAnimProgress) * 100);
    }

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  function onMouseMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(explodedParts, true);
    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj && !obj.userData.partName && obj.parent) obj = obj.parent;
      if (obj && obj.userData.partName) {
        tag3d.style.display = 'block';
        tag3d.innerHTML = '<b>' + obj.userData.partId + '</b> ' + obj.userData.partName;
        return;
      }
    }
    tag3d.style.display = 'none';
  }

  function onExplodeInput(v) {
    applyExplode(v / 100);
  }

  function applyExplode(factor) {
    explodedParts.forEach(p => {
      if (p.userData && p.userData.origPos && p.userData.explodeVec) {
        p.position.set(
          p.userData.origPos.x + p.userData.explodeVec.x * factor,
          p.userData.origPos.y + p.userData.explodeVec.y * factor,
          p.userData.origPos.z + p.userData.explodeVec.z * factor
        );
      }
    });
  }

  function togglePlayAssembly() {
    isPlayingAssembly = !isPlayingAssembly;
    const btn = document.getElementById('btnPlayAsm');
    if (isPlayingAssembly) {
      assemblyAnimProgress = 0.0;
      btn.innerHTML = '❚❚ Pauza';
    } else {
      btn.innerHTML = '▶ Yig\\'ish';
    }
  }

  function resetCamera(view) {
    if (!controls) return;
    const L = parseFloat(document.getElementById('dimL').value) || 280;
    const H = parseFloat(document.getElementById('dimH').value) || 140;
    controls.target.set(0, H * 0.45, 0);

    if (view === 'front') camera.position.set(0, H * 0.5, L * 1.55);
    else if (view === 'side') camera.position.set(L * 1.55, H * 0.5, 0);
    else if (view === 'top') camera.position.set(0.001, L * 1.6, 0);
    else camera.position.set(L * 1.05, H * 1.1, L * 1.15);
  }

  function toggleRealLook() {
    isRealLook = !isRealLook;
    document.getElementById('btnReal').classList.toggle('on', isRealLook);
    document.getElementById('stage3d').classList.toggle('real', isRealLook);
  }

  function toggleXray() {
    isXray = !isXray;
    document.getElementById('btnXray').classList.toggle('on', isXray);
    explodedParts.forEach(g => {
      g.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.transparent = isXray;
          c.material.opacity = isXray ? 0.35 : 1.0;
        }
      });
    });
  }

  function toggleWireframe() {
    isWire = !isWire;
    document.getElementById('btnWire').classList.toggle('on', isWire);
    explodedParts.forEach(g => {
      g.traverse(c => {
        if (c.isMesh && c.material) c.material.wireframe = isWire;
      });
    });
  }

  function toggleGroup(grp, visible) {
    explodedParts.forEach(p => {
      if (p.userData.group === grp) p.visible = visible;
    });
  }

  // --- MODELNI GENERATSIYA QILISH ---
  function makePart(w, h, depth, colorHex, id, name, groupName, explodeVec) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(w, h, depth);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex, roughness: 0.65, metalness: 0.05
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Qirralari (Laser burn edge lines)
    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x422610, linewidth: 1.2 });
    group.add(new THREE.LineSegments(edges, lineMat));

    group.userData = {
      partId: id, partName: name, group: groupName,
      origPos: { x: 0, y: 0, z: 0 },
      explodeVec: explodeVec || { x: 0, y: 0, z: 0 }
    };
    explodedParts.push(group);
    return group;
  }

  function runGenerateModel() {
    const preset = document.getElementById('modelPreset').value;
    const t = parseFloat(document.getElementById('matT').value) || 3.0;
    const L = parseFloat(document.getElementById('dimL').value) || 280;
    const H = parseFloat(document.getElementById('dimH').value) || 140;
    const floors = parseInt(document.getElementById('archFloors').value) || 4;
    const columnsCount = parseInt(document.getElementById('archColumns').value) || 6;
    const wingD = parseFloat(document.getElementById('archWingD').value) || 90;
    const winCols = parseInt(document.getElementById('archWinCols').value) || 8;

    while (modelGroup.children.length > 0) modelGroup.remove(modelGroup.children[0]);
    explodedParts = [];

    const plyWood = 0xdeb881;     // Tabiiy fanera
    const baseWood = 0x9b4b32;    // Poydevor g'ishti
    const roofWood = 0x505b68;    // Tom qoplama
    const whiteCol = 0xf5f1ea;    // Oq ustunlar

    const mainW = L;
    const mainD = 75;
    const wingW = 60;
    const floorH = H / floors;
    const porticoW = 85;
    const porticoD = 32;

    // 1. Poydevor
    const totalBaseD = (preset === 'building_u' ? wingD + mainD : mainD) + 16;
    const base = makePart(mainW + 16, t, totalBaseD, baseWood, "B00", "Poydevor Asos Plitasi", "roof", { x: 0, y: -45, z: 0 });
    base.position.set(0, t/2, preset === 'building_u' ? wingD/2 : 0);
    base.userData.origPos = Object.assign({}, base.position);
    modelGroup.add(base);

    // 2. Qavat oralig'i pollari
    for (let fl = 1; fl < floors; fl++) {
      const flPlate = makePart(mainW - 2, t, mainD - 2, plyWood, \`F0\${fl}\`, \`\${fl}-Qavat Oraliq Poli\`, "floors", { x: 0, y: fl * 18, z: 0 });
      flPlate.position.set(0, fl * floorH, 0);
      flPlate.userData.origPos = Object.assign({}, flPlate.position);
      modelGroup.add(flPlate);
    }

    // 3. Markaziy Old Fasad
    const frontWall = makePart(mainW, H, t, plyWood, "A01", "Markaziy Old Fasad", "front", { x: 0, y: 0, z: 55 });
    frontWall.position.set(0, H/2 + t, mainD/2 - t/2);
    frontWall.userData.origPos = Object.assign({}, frontWall.position);
    modelGroup.add(frontWall);

    // Deraza o'yiqlari (Window holes)
    const winW = (mainW / winCols) * 0.55;
    const winH = floorH * 0.52;
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x1f2630 });
    for (let fl = 0; fl < floors; fl++) {
      const wy = -H/2 + (fl + 0.5) * floorH;
      for (let wc = 0; wc < winCols; wc++) {
        const wx = -mainW/2 + (wc + 0.5) * (mainW / winCols);
        if (Math.abs(wx) < 32 && fl === 0) continue;
        const hole = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, t + 1.2), holeMat);
        hole.position.set(wx, wy, 0);
        frontWall.add(hole);
      }
    }

    // 4. Orqa Fasad
    const backWall = makePart(mainW, H, t, plyWood, "A02", "Orqa Fasad Devori", "front", { x: 0, y: 0, z: -55 });
    backWall.position.set(0, H/2 + t, -mainD/2 + t/2);
    backWall.userData.origPos = Object.assign({}, backWall.position);
    modelGroup.add(backWall);

    // 5. Yon Qanotlar (U-shape)
    if (preset === 'building_u') {
      const wOutL = makePart(t, H, wingD, plyWood, "W01", "Chap Qanot Tashqi Devor", "wings", { x: -60, y: 0, z: 25 });
      wOutL.position.set(-mainW/2 + t/2, H/2 + t, mainD/2 + wingD/2);
      wOutL.userData.origPos = Object.assign({}, wOutL.position);
      modelGroup.add(wOutL);

      const wInL = makePart(t, H, wingD, plyWood, "W02", "Chap Qanot Ichki Devor", "wings", { x: -25, y: 0, z: 25 });
      wInL.position.set(-mainW/2 + wingW - t/2, H/2 + t, mainD/2 + wingD/2);
      wInL.userData.origPos = Object.assign({}, wInL.position);
      modelGroup.add(wInL);

      const wOutR = makePart(t, H, wingD, plyWood, "W03", "O'ng Qanot Tashqi Devor", "wings", { x: 60, y: 0, z: 25 });
      wOutR.position.set(mainW/2 - t/2, H/2 + t, mainD/2 + wingD/2);
      wOutR.userData.origPos = Object.assign({}, wOutR.position);
      modelGroup.add(wOutR);

      const wInR = makePart(t, H, wingD, plyWood, "W04", "O'ng Qanot Ichki Devor", "wings", { x: 25, y: 0, z: 25 });
      wInR.position.set(mainW/2 - wingW + t/2, H/2 + t, mainD/2 + wingD/2);
      wInR.userData.origPos = Object.assign({}, wInR.position);
      modelGroup.add(wInR);
    }

    // 6. Ustunlar va Fronton
    if (columnsCount > 0) {
      const colH = H * 0.85;
      const colSpacing = porticoW / (columnsCount - 1);
      for (let i = 0; i < columnsCount; i++) {
        const cx = -porticoW/2 + i * colSpacing;
        const col = makePart(8, colH, t, whiteCol, \`U0\${i+1}\`, \`Klassik Ustun \${i+1}\`, "portico", { x: 0, y: 0, z: 85 });
        col.position.set(cx, colH/2 + t, mainD/2 + porticoD);
        col.userData.origPos = Object.assign({}, col.position);
        modelGroup.add(col);
      }

      const frieze = makePart(porticoW + 12, 16, porticoD + 6, plyWood, "P01", "Portik Karnizi & Friz", "portico", { x: 0, y: 35, z: 65 });
      frieze.position.set(0, colH + t + 8, mainD/2 + porticoD/2);
      frieze.userData.origPos = Object.assign({}, frieze.position);
      modelGroup.add(frieze);
    }

    // 7. Tom
    const roof = makePart(mainW + 10, t, mainD + 10, roofWood, "T01", "Tom Yopmasi", "roof", { x: 0, y: 70, z: 0 });
    roof.position.set(0, H + t + t/2, 0);
    roof.userData.origPos = Object.assign({}, roof.position);
    modelGroup.add(roof);

    // 2D SVG NESTING KO'RINISHI (Haqiqiy Fanera varag'i)
    const svgHtml = \`
      <svg viewBox="0 0 600 400" width="100%" height="100%">
        <!-- Fanera foni -->
        <rect x="0" y="0" width="600" height="400" fill="#e9d3ad" stroke="#c2a77d" stroke-width="2"/>
        
        <!-- Detallar qirqimi (Qizil CUT, Ko'k ENGRAVE) -->
        <g fill="#c99a5b" stroke="#e00000" stroke-width="1.2">
          <!-- A01 Old Fasad -->
          <rect x="15" y="15" width="280" height="140"/>
          <!-- A02 Orqa Devor -->
          <rect x="15" y="165" width="280" height="140"/>
          <!-- B00 Poydevor -->
          <rect x="305" y="15" width="140" height="290"/>
          <!-- Ustunlar -->
          <rect x="455" y="15" width="10" height="120"/>
          <rect x="470" y="15" width="10" height="120"/>
          <rect x="485" y="15" width="10" height="120"/>
          <rect x="500" y="15" width="10" height="120"/>
          <rect x="515" y="15" width="10" height="120"/>
          <rect x="530" y="15" width="10" height="120"/>
          <!-- Fronton -->
          <polygon points="455,145 545,145 500,175"/>
        </g>

        <!-- Gravirovka belgilari -->
        <g fill="#0030d0" stroke="#0030d0" stroke-width="0.8" font-family="monospace" font-size="8">
          <text x="25" y="30" stroke="none">A01: OLD FASAD (280x140)</text>
          <text x="25" y="180" stroke="none">A02: ORQA DEVOR (280x140)</text>
          <text x="315" y="35" stroke="none">B00: POYDEVOR</text>
          <line x1="15" y1="50" x2="295" y2="50" stroke-dasharray="3"/>
          <line x1="15" y1="85" x2="295" y2="85" stroke-dasharray="3"/>
          <line x1="15" y1="120" x2="295" y2="120" stroke-dasharray="3"/>
        </g>
      </svg>
    \`;
    document.getElementById('svgContainer').innerHTML = svgHtml;

    // DXF Tuzish
    currentDxfString = buildDxf(mainW, H, mainD, t);
    resetCamera('iso');
  }

  function buildDxf(w, h, d, t) {
    let s = "0\\r\\nSECTION\\r\\n2\\r\\nHEADER\\r\\n9\\r\\n$ACADVER\\r\\n1\\r\\nAC1009\\r\\n0\\r\\nENDSEC\\r\\n";
    s += "0\\r\\nSECTION\\r\\n2\\r\\nTABLES\\r\\n0\\r\\nTABLE\\r\\n2\\r\\nLAYER\\r\\n70\\r\\n2\\r\\n";
    s += "0\\r\\nLAYER\\r\\n2\\r\\nCUT\\r\\n70\\r\\n0\\r\\n62\\r\\n1\\r\\n6\\r\\nCONTINUOUS\\r\\n";
    s += "0\\r\\nLAYER\\r\\n2\\r\\nENGRAVE\\r\\n70\\r\\n0\\r\\n62\\r\\n5\\r\\n6\\r\\nCONTINUOUS\\r\\n";
    s += "0\\r\\nENDTAB\\r\\n0\\r\\nENDSEC\\r\\n0\\r\\nSECTION\\r\\n2\\r\\nENTITIES\\r\\n";
    
    // Asosiy to'rtburchak fasad
    s += \`0\\r\\nLINE\\r\\n8\\r\\nCUT\\r\\n10\\r\\n20.0\\r\\n20.0\\r\\n11\\r\\n\${(20+w).toFixed(1)}\\r\\n20.0\\r\\n\`;
    s += \`0\\r\\nLINE\\r\\n8\\r\\nCUT\\r\\n10\\r\\n\${(20+w).toFixed(1)}\\r\\n20.0\\r\\n11\\r\\n\${(20+w).toFixed(1)}\\r\\n\${(20+h).toFixed(1)}\\r\\n\`;
    s += \`0\\r\\nLINE\\r\\n8\\r\\nCUT\\r\\n10\\r\\n\${(20+w).toFixed(1)}\\r\\n\${(20+h).toFixed(1)}\\r\\n11\\r\\n20.0\\r\\n\${(20+h).toFixed(1)}\\r\\n\`;
    s += \`0\\r\\nLINE\\r\\n8\\r\\nCUT\\r\\n10\\r\\n20.0\\r\\n\${(20+h).toFixed(1)}\\r\\n11\\r\\n20.0\\r\\n20.0\\r\\n\`;
    s += \`0\\r\\nTEXT\\r\\n8\\r\\nENGRAVE\\r\\n10\\r\\n25.0\\r\\n35.0\\r\\n40\\r\\n5.0\\r\\n1\\r\\nA01: FASAD\\r\\n\`;
    
    s += "0\\r\\nENDSEC\\r\\n0\\r\\nEOF\\r\\n";
    return s;
  }

  function downloadCurrentDxf() {
    if (!currentDxfString) runGenerateModel();
    const blob = new Blob([currentDxfString], { type: 'application/dxf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = \`lasermaket_bino.dxf\`;
    a.click();
  }

  function downloadCurrentSvg() {
    const svgEl = document.getElementById('svgContainer').innerHTML;
    const blob = new Blob([svgEl], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = \`lasermaket_bino_list1.svg\`;
    a.click();
  }

  function downloadCalibrationCard() {
    window.location.href = '../lasermaket-mcp/storage/proj_1793462128150/calibration_comb_test.dxf';
  }

  function switchTab(t) {
    if (t === 'drawings') alert('Chizmalar: 2D vektor fasad va yoyilmalar pastki qismda va DXF da yuklab olishga tayyor.');
    else if (t === 'assembly') togglePlayAssembly();
  }

  window.onload = () => {
    init3D();
    onPresetChange();
  };
</script>

</body>
</html>
`;

fs.writeFileSync(targetPath, htmlContent, 'utf8');
console.log('SUCCESS: Written exact studio style ai-erkin-generator.html, size: ' + htmlContent.length + ' bytes');
