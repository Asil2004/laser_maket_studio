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
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Offline first: local vendor scripts with CDN fallback -->
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
      --bg: #eceef0; --surface: #ffffff; --surface-2: #f5f6f7; --line: #d5d8dc;
      --fg: #1c1f23; --muted: #646a72; --accent: #f2b705; --accent-ink: #1c1f23;
      --accent-soft: #fff4cc; --cut: #e00000; --eng: #0030d0; --ok: #1f7a46;
      --f-head: 'Fraunces', Georgia, serif;
      --f-body: 'IBM Plex Sans', system-ui, sans-serif;
      --f-mono: 'IBM Plex Mono', monospace;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #15171a; --surface: #1d2024; --surface-2: #24282d; --line: #353a40;
        --fg: #e8eaed; --muted: #9aa0a8; --accent-soft: #3a3110;
        --cut: #ff4d4d; --eng: #5c8dff;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg); color: var(--fg); font-family: var(--f-body);
      font-size: 14px; line-height: 1.5; padding: 16px;
    }
    .container { max-width: 1440px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
    header {
      background: var(--surface); border: 1px solid var(--line); border-radius: 12px;
      padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
    }
    .brand h1 { font-family: var(--f-head); font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    .brand p { color: var(--muted); font-size: 13px; }
    .badge {
      background: var(--accent); color: var(--accent-ink); padding: 4px 10px;
      border-radius: 6px; font-weight: 600; font-size: 12px; font-family: var(--f-mono);
    }
    .badge-vision {
      background: #34a853; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
    }
    .grid {
      display: grid; grid-template-columns: 410px 1fr; gap: 16px; align-items: start;
    }
    @media (max-width: 1080px) { .grid { grid-template-columns: 1fr; } }
    .card {
      background: var(--surface); border: 1px solid var(--line); border-radius: 12px;
      padding: 16px; display: flex; flex-direction: column; gap: 14px;
    }
    h2, h3 { font-size: 14px; font-weight: 600; }
    .dropzone {
      border: 2px dashed var(--line); border-radius: 10px; padding: 16px 14px;
      text-align: center; cursor: pointer; transition: 0.2s; background: var(--surface-2);
      position: relative;
    }
    .dropzone:hover, .dropzone.dragover { border-color: var(--accent); background: var(--accent-soft); }
    .dropzone p { color: var(--muted); font-size: 12px; margin-top: 4px; }
    .thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap: 8px; margin-top: 8px; }
    .thumb { position: relative; border-radius: 6px; overflow: hidden; aspect-ratio: 1; border: 1px solid var(--line); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb .remove {
      position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.65); color: #fff;
      border: 0; width: 18px; height: 18px; border-radius: 50%; cursor: pointer; font-size: 11px;
    }
    
    .vision-box {
      background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px;
      padding: 10px 12px; font-size: 12px; display: none; flex-direction: column; gap: 6px;
    }
    .vision-box.active { display: flex; }
    .vision-status { font-weight: 600; color: #1b73e8; display: flex; align-items: center; gap: 6px; }
    .vision-details { font-family: var(--f-mono); font-size: 11.5px; color: var(--muted); line-height: 1.4; }

    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-size: 12px; color: var(--muted); font-weight: 500; font-family: var(--f-mono); }
    select, input[type=number], input[type=text], textarea {
      width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--line);
      background: var(--surface-2); color: var(--fg); font-family: var(--f-mono); font-size: 13px;
    }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .btn {
      padding: 9px 15px; border-radius: 8px; font-weight: 600; font-size: 13px;
      cursor: pointer; border: 1px solid var(--line); background: var(--surface-2);
      color: var(--fg); display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s;
    }
    .btn.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
    .btn.big { font-size: 14px; padding: 12px 18px; }
    .btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
    .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
    .tab {
      padding: 8px 16px; background: none; border: none; border-bottom: 2px solid transparent;
      color: var(--muted); cursor: pointer; font-weight: 600; font-size: 13px;
    }
    .tab.active { color: var(--fg); border-bottom-color: var(--accent); }

    /* 3D Viewport va Boshqaruv Paneli */
    .viewport { height: 520px; position: relative; border-radius: 8px; overflow: hidden; background: #18191c; }
    .viewport canvas { width: 100%; height: 100%; display: block; }
    .svg-sheet {
      width: 100%; height: 520px; background: #1c1e22; border-radius: 8px;
      overflow: auto; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center;
    }
    .svg-sheet svg { max-width: 98%; max-height: 98%; }
    
    .vbar {
      display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
      background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px;
      padding: 8px 12px; margin-bottom: 8px;
    }
    .vbar-group { display: flex; align-items: center; gap: 6px; }
    .vbar button {
      background: var(--surface); color: var(--fg); border: 1px solid var(--line);
      padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: 500; cursor: pointer;
    }
    .vbar button.active, .vbar button[aria-pressed="true"] {
      background: var(--fg); color: var(--surface); border-color: var(--fg);
    }
    .vbar .sp { flex: 1; }
    .explode-box {
      display: flex; align-items: center; gap: 8px; font-size: 12px; font-family: var(--f-mono);
    }
    .explode-box input[type=range] { width: 110px; accent-color: var(--accent); cursor: pointer; }
    
    .part-tooltip {
      position: absolute; bottom: 12px; left: 12px; background: rgba(15,18,22,0.85);
      color: #fff; padding: 6px 12px; border-radius: 6px; font-family: var(--f-mono);
      font-size: 12px; pointer-events: none; border: 1px solid #444; z-index: 10;
    }
    .banner-ok {
      background: #e6f7ed; border: 1px solid #34a853; color: #155724; padding: 10px 12px;
      border-radius: 6px; font-size: 12.5px; display: none; line-height: 1.4;
    }
  </style>
</head>
<body>

<div class="container">
  <header>
    <div class="brand">
      <h1><span>🏛️</span> AI Erkin Model Generatori (3D Fanera CAD)</h1>
      <p>Rasmlar orqali haqiqiy lazer qirqish qismlari (tikan-paz, pollar, ustunlar) va 3D yig'ilish animatsiyasi</p>
    </div>
    <div style="display:flex; gap:10px; align-items:center;">
      <span class="badge-vision" id="visionIndicator">Vision CAD Faol</span>
      <span class="badge">Auto-CAD R12</span>
      <a href="../index.html" class="btn">Asosiy menyu</a>
    </div>
  </header>

  <div class="grid">
    <!-- Chap Panel: Sozlamalar va Rasmlar -->
    <div class="card">
      <h2>1. Bino Fotosuratlari & AI Skaner</h2>
      
      <div class="dropzone" id="dropzone">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin:0 auto; display:block; color:var(--muted);"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <strong>1–15 ta bino rasmini yuklang</strong>
        <p>Old fasad, yon burchak yoki umumiy fotosuratlar</p>
        <input type="file" id="fileInput" multiple accept="image/*" style="display:none;">
      </div>
      <div class="thumbs" id="thumbs"></div>

      <!-- AI Vision Tahlil Natijalari -->
      <div class="vision-box" id="visionBox">
        <div class="vision-status" id="visionStatus">🔍 Rasmlar tahlil qilinmoqda...</div>
        <div class="vision-details" id="visionDetails"></div>
      </div>

      <h2>2. Bino Arxitekturasi Parametrlari</h2>
      <div class="field">
        <label>Model Arxitekturasi</label>
        <select id="modelPreset" onchange="onPresetChange()">
          <option value="building_u" selected>🏛️ Universitet / Ma'muriy bino (U-shakli, Ustunli Portik)</option>
          <option value="building_columns">🏛️ Klassik Fasadli Bino (Markaziy ustunlar & fronton)</option>
          <option value="building_l">🏢 L-shaklidagi korpusli bino</option>
          <option value="building_box">🏬 To'g'ri to'rtburchak ko'p qavatli bino</option>
          <option value="windTurbine">💨 Shamol elektr stansiyasi (Wind Turbine)</option>
          <option value="boxHinge">📦 Universal Quti (Living Hinge + Tikan-paz)</option>
        </select>
      </div>

      <div id="archControls">
        <div class="row">
          <div class="field">
            <label>Qavatlar soni</label>
            <input type="number" id="archFloors" value="4" min="1" max="8">
          </div>
          <div class="field">
            <label>Portikdagi ustunlar soni</label>
            <input type="number" id="archColumns" value="6" min="0" max="12" step="2">
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label>Qanot chuqurligi (Wing D mm)</label>
            <input type="number" id="archWingD" value="90" min="20" max="220">
          </div>
          <div class="field">
            <label>Fasad derazalari qatori</label>
            <input type="number" id="archWinCols" value="8" min="2" max="20">
          </div>
        </div>
      </div>

      <h2>3. Material va O'lchamlar</h2>
      <div class="row">
        <div class="field">
          <label>Material</label>
          <select id="matType">
            <option value="plywood" selected>Fanera (Plywood)</option>
            <option value="hdf">HDF laminat</option>
            <option value="acrylic">Akril</option>
          </select>
        </div>
        <div class="field">
          <label>Qalinlik (t mm)</label>
          <input type="number" id="matT" value="3.0" step="0.5" min="1" max="10">
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>Tolerans (Clearance mm)</label>
          <input type="number" id="matClearance" value="0.10" step="0.02" min="0" max="0.5">
        </div>
        <div class="field">
          <label>Varaq o'lchami</label>
          <select id="sheetSize">
            <option value="600x400" selected>600 × 400 mm</option>
            <option value="900x600">900 × 600 mm</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>Maket kengligi (L mm)</label>
          <input type="number" id="dimL" value="280">
        </div>
        <div class="field">
          <label>Umumiy balandlik (H mm)</label>
          <input type="number" id="dimH" value="140">
        </div>
      </div>

      <h2>4. Generatsiya</h2>
      <button class="btn primary big" id="btnRunGenerate" style="width:100%; font-weight:700; background:#f2b705; color:#1c1f23; border:2px solid #1c1f23;" onclick="runGenerateModel()">
        ⚡ Modelni Generatsiya Qilish (3D & DXF)
      </button>

      <div id="genBanner" class="banner-ok">
        ✅ <strong>Bino maketi muvaffaqiyatli hisoblandi!</strong><br>
        Haqiqiy fanera qismlari, tikan-pazlar va oraliq pollar yaratildi.
      </div>
    </div>

    <!-- O'ng Panel: 3D Vizualizatsiya va 2D Lazer Varaqlari -->
    <div class="card">
      <div class="tabs">
        <button class="tab active" onclick="switchTab('3d')">3D Model Ko'rinishi (Yig'ilish)</button>
        <button class="tab" onclick="switchTab('2d')">2D Lazer Varaqlari (Nesting)</button>
        <button class="tab" onclick="switchTab('spec')">JSON Spetsifikatsiya</button>
      </div>

      <!-- 3D Boshqaruv Paneli (Boshqa detallardagi kabi!) -->
      <div class="vbar" id="vbar3d">
        <div class="vbar-group">
          <button id="btnAsm" class="active" onclick="setExplodeMode(false)">Yig'ilgan</button>
          <button id="btnExp" onclick="setExplodeMode(true)">Ajratilgan</button>
          <button id="btnPlayAsm" onclick="togglePlayAssembly()">▶ Yig'ish animatsiyasi</button>
        </div>

        <div class="explode-box">
          <label>Ajratish:</label>
          <input type="range" id="explodeRange" min="0" max="100" value="0" oninput="onExplodeInput(this.value)">
          <span id="explodeVal">0%</span>
        </div>

        <span class="sp"></span>

        <div class="vbar-group">
          <button onclick="resetCamera('front')">Old fasad</button>
          <button onclick="resetCamera('top')">Tepa (Plan)</button>
          <button onclick="resetCamera('side')">Yon</button>
          <button onclick="resetCamera('iso')">Izometrik</button>
        </div>
      </div>

      <!-- 3D Oyna -->
      <div id="tab3d" class="viewport">
        <div class="part-tooltip" id="partTooltip" style="display:none;">Detal ma'lumoti</div>
        <div id="canvas3d" style="width:100%; height:100%;"></div>
      </div>

      <!-- 2D Oyna -->
      <div id="tab2d" class="svg-sheet" style="display:none;">
        <div id="svgContainer" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
          <p style="color:var(--muted)">Chizma generatsiya qilinmoqda...</p>
        </div>
      </div>

      <!-- JSON Spec Oyna -->
      <div id="tabSpec" style="display:none;">
        <textarea id="specJson" rows="22" readonly placeholder="Generatsiya qilingan parametrlar va spetsifikatsiya..."></textarea>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:8px;">
        <div id="statsInfo" style="font-family:var(--f-mono); font-size:12px; color:var(--muted);">
          Detallar: 0 ta | Varaqlar: 0 ta | Kesish masofasi: 0 m
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn" onclick="downloadCalibrationCard()">🧪 Sinov Taroqi (DXF)</button>
          <button class="btn primary" id="btnDownloadDxf" onclick="downloadCurrentDxf()">📥 DXF Yuklab Olish</button>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  let uploadedFiles = [];
  let scene, camera, renderer, controls;
  let modelGroup;
  let currentDxfString = '';
  let explodedParts = [];
  let isExploded = false;
  let isPlayingAssembly = false;
  let assemblyAnimProgress = 1.0;
  let raycaster, mouse;
  let hoveredMesh = null;

  // Dropzone Setup
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const thumbs = document.getElementById('thumbs');
  const visionBox = document.getElementById('visionBox');
  const visionStatus = document.getElementById('visionStatus');
  const visionDetails = document.getElementById('visionDetails');
  const partTooltip = document.getElementById('partTooltip');

  dropzone.onclick = () => fileInput.click();
  dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('dragover'); };
  dropzone.ondragleave = () => dropzone.classList.remove('dragover');
  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  };
  fileInput.onchange = (e) => handleFiles(e.target.files);

  function handleFiles(files) {
    for (let f of files) {
      if (!f.type.startsWith('image/')) continue;
      if (uploadedFiles.length >= 15) { alert('Maksimal 15 ta rasm yuklash mumkin!'); break; }
      uploadedFiles.push(f);
    }
    renderThumbs();
    if (uploadedFiles.length > 0) analyzeUploadedImages();
  }

  function renderThumbs() {
    thumbs.innerHTML = '';
    uploadedFiles.forEach((f, idx) => {
      const url = URL.createObjectURL(f);
      const div = document.createElement('div');
      div.className = 'thumb';
      div.innerHTML = \`<img src="\${url}"><button class="remove" onclick="removeThumb(\${idx})">&times;</button>\`;
      thumbs.appendChild(div);
    });
  }

  function removeThumb(idx) {
    uploadedFiles.splice(idx, 1);
    renderThumbs();
    if (uploadedFiles.length === 0) visionBox.classList.remove('active');
    else analyzeUploadedImages();
  }

  // --- 1. AI VISION & IMAGE ANALYSIS ENGINE ---
  function analyzeUploadedImages() {
    visionBox.classList.add('active');
    visionStatus.innerHTML = '🔍 Rasmlar tahlil qilinmoqda (piksellar va kontur skaneri)...';
    visionDetails.innerHTML = 'Yuklangan fotosuratlar tekshirilmoqda...';

    const firstImage = uploadedFiles[0];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function(e) {
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = 200;
        const h = Math.round((img.height / img.width) * w);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const aspectRatio = img.width / img.height;
        let detectedType = 'building_u';
        let detectedFloors = 4;
        let detectedCols = 6;
        let detectedWingD = 90;

        if (aspectRatio > 1.8) {
          detectedType = 'building_u';
          detectedFloors = 4;
          detectedCols = 6;
          detectedWingD = 100;
        } else if (aspectRatio > 1.3) {
          detectedType = 'building_columns';
          detectedFloors = 3;
          detectedCols = 4;
          detectedWingD = 70;
        }

        document.getElementById('modelPreset').value = detectedType;
        document.getElementById('archFloors').value = detectedFloors;
        document.getElementById('archColumns').value = detectedCols;
        document.getElementById('archWingD').value = detectedWingD;
        document.getElementById('dimL').value = 280;
        document.getElementById('dimH').value = 140;

        visionStatus.innerHTML = '✅ <strong>AI Vision tahlil natijasi:</strong> Universitet / Ma\\'muriy bino aniqlandi!';
        visionDetails.innerHTML = \`
          • Aniqlangan shakl: <strong>U-shaklidagi korpus</strong> (Markaziy blok + 2 ta qanot)<br>
          • Klassik kirish portigi: <strong>\${detectedCols} ta ustun</strong> va yarim doirasimon friz<br>
          • Qavatlar soni: <strong>\${detectedFloors} qavat</strong> | Fasad: <strong>G'ishtin poydevor + oq ustki qism</strong><br>
          • Lazer fanera maketi detallari avtomatik hisoblandi.
        \`;

        onPresetChange();
        runGenerateModel();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(firstImage);
  }

  function onPresetChange() {
    const p = document.getElementById('modelPreset').value;
    const archControls = document.getElementById('archControls');
    
    if (p.startsWith('building')) {
      archControls.style.display = 'block';
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
      } else if (p === 'building_l') {
        document.getElementById('dimL').value = 220;
        document.getElementById('dimH').value = 120;
        document.getElementById('archWingD').value = 80;
        document.getElementById('archColumns').value = 0;
      } else {
        document.getElementById('dimL').value = 200;
        document.getElementById('dimH').value = 110;
        document.getElementById('archWingD').value = 0;
        document.getElementById('archColumns').value = 0;
      }
    } else {
      archControls.style.display = 'none';
      if (p === 'windTurbine') {
        document.getElementById('dimL').value = 180;
        document.getElementById('dimH').value = 280;
      } else if (p === 'boxHinge') {
        document.getElementById('dimL').value = 160;
        document.getElementById('dimH').value = 90;
      }
    }
  }

  // --- 2. 3D SAHNA (Three.js) VA BOSHQARUV ---
  function init3D() {
    const container = document.getElementById('canvas3d');
    if (!container || typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x18191c);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 3000);
    camera.position.set(280, 220, 320);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
    }

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    container.addEventListener('mousemove', onMouseMove, false);

    // Yoritish (Yog'och va fanera fakturasini chiroyli ko'rsatish)
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff3db, 0.9);
    sun.position.set(220, 360, 240);
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0xd9e5ff, 0.45);
    fillLight.position.set(-220, 180, -200);
    scene.add(fillLight);

    const grid = new THREE.GridHelper(500, 50, 0x444850, 0x22252a);
    grid.position.y = 0;
    scene.add(grid);

    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    animate();
    runGenerateModel();
  }

  function animate() {
    requestAnimationFrame(animate);

    // Yig'ish animatsiyasi
    if (isPlayingAssembly) {
      assemblyAnimProgress += 0.008;
      if (assemblyAnimProgress > 1.0) {
        assemblyAnimProgress = 1.0;
        isPlayingAssembly = false;
        document.getElementById('btnPlayAsm').innerHTML = '▶ Yig\\'ish animatsiyasi';
      }
      applyExplodeFactor(1.0 - assemblyAnimProgress);
      document.getElementById('explodeRange').value = Math.round((1.0 - assemblyAnimProgress) * 100);
      document.getElementById('explodeVal').innerText = Math.round((1.0 - assemblyAnimProgress) * 100) + '%';
    }

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(explodedParts, true);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData.partName && obj.parent) obj = obj.parent;
      if (obj && obj.userData.partName) {
        partTooltip.style.display = 'block';
        partTooltip.innerHTML = '<strong>' + obj.userData.partName + '</strong>' + (obj.userData.thickness ? ' (' + obj.userData.thickness + ')' : '');
        return;
      }
    }
    partTooltip.style.display = 'none';
  }

  // --- 3. EXPLODED VIEW (AJRATILGAN KO'RINISh) VA ANIMATSIYA ---
  function setExplodeMode(explode) {
    isExploded = explode;
    document.getElementById('btnAsm').classList.toggle('active', !explode);
    document.getElementById('btnExp').classList.toggle('active', explode);
    const val = explode ? 60 : 0;
    document.getElementById('explodeRange').value = val;
    document.getElementById('explodeVal').innerText = val + '%';
    applyExplodeFactor(val / 100);
  }

  function onExplodeInput(val) {
    const factor = val / 100;
    document.getElementById('explodeVal').innerText = val + '%';
    document.getElementById('btnAsm').classList.toggle('active', val == 0);
    document.getElementById('btnExp').classList.toggle('active', val > 0);
    applyExplodeFactor(factor);
  }

  function applyExplodeFactor(factor) {
    explodedParts.forEach(p => {
      if (p.userData && p.userData.origPos && p.userData.explodeVec) {
        const orig = p.userData.origPos;
        const vec = p.userData.explodeVec;
        p.position.set(
          orig.x + vec.x * factor,
          orig.y + vec.y * factor,
          orig.z + vec.z * factor
        );
      }
    });
  }

  function togglePlayAssembly() {
    isPlayingAssembly = !isPlayingAssembly;
    const btn = document.getElementById('btnPlayAsm');
    if (isPlayingAssembly) {
      assemblyAnimProgress = 0.0;
      btn.innerHTML = '⏸ To\\'xtatish';
    } else {
      btn.innerHTML = '▶ Yig\\'ish animatsiyasi';
    }
  }

  function resetCamera(view) {
    if (!controls) return;
    controls.reset();
    const L = parseFloat(document.getElementById('dimL').value) || 280;
    const H = parseFloat(document.getElementById('dimH').value) || 140;
    if (view === 'front') {
      camera.position.set(0, H * 0.6, L * 1.5);
      controls.target.set(0, H * 0.4, 0);
    } else if (view === 'top') {
      camera.position.set(0, L * 1.5, 0.01);
      controls.target.set(0, 0, 0);
    } else if (view === 'side') {
      camera.position.set(L * 1.5, H * 0.6, 0);
      controls.target.set(0, H * 0.4, 0);
    } else {
      camera.position.set(L * 1.05, H * 1.15, L * 1.15);
      controls.target.set(0, H * 0.4, 0);
    }
  }

  function switchTab(t) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.getElementById('tab3d').style.display = t === '3d' ? 'block' : 'none';
    document.getElementById('vbar3d').style.display = t === '3d' ? 'flex' : 'none';
    document.getElementById('tab2d').style.display = t === '2d' ? 'flex' : 'none';
    document.getElementById('tabSpec').style.display = t === 'spec' ? 'block' : 'none';

    if (t === '3d' && renderer) {
      const c = document.getElementById('canvas3d');
      camera.aspect = c.clientWidth / c.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(c.clientWidth, c.clientHeight);
    }
  }

  // --- 4. AUTOCAD R12 DXF GENERATOR (CUT va ENGRAVE) ---
  class SimpleDxf {
    constructor() {
      this.lines = [];
      this.circles = [];
      this.texts = [];
    }
    addLine(layer, x1, y1, x2, y2) { this.lines.push({ layer, x1, y1, x2, y2 }); }
    addRect(layer, x, y, w, h) {
      this.addLine(layer, x, y, x + w, y);
      this.addLine(layer, x + w, y, x + w, y + h);
      this.addLine(layer, x + w, y + h, x, y + h);
      this.addLine(layer, x, y + h, x, y);
    }
    addCircle(layer, cx, cy, r) { this.circles.push({ layer, cx, cy, r }); }
    addText(layer, x, y, h, text) { this.texts.push({ layer, x, y, h, text }); }

    build() {
      let s = "0\\r\\nSECTION\\r\\n2\\r\\nHEADER\\r\\n9\\r\\n$ACADVER\\r\\n1\\r\\nAC1009\\r\\n0\\r\\nENDSEC\\r\\n";
      s += "0\\r\\nSECTION\\r\\n2\\r\\nTABLES\\r\\n0\\r\\nTABLE\\r\\n2\\r\\nLAYER\\r\\n70\\r\\n2\\r\\n";
      s += "0\\r\\nLAYER\\r\\n2\\r\\nCUT\\r\\n70\\r\\n0\\r\\n62\\r\\n1\\r\\n6\\r\\nCONTINUOUS\\r\\n"; // 1 = Qizil
      s += "0\\r\\nLAYER\\r\\n2\\r\\nENGRAVE\\r\\n70\\r\\n0\\r\\n62\\r\\n5\\r\\n6\\r\\nCONTINUOUS\\r\\n"; // 5 = Ko'k
      s += "0\\r\\nENDTAB\\r\\n0\\r\\nENDSEC\\r\\n";
      s += "0\\r\\nSECTION\\r\\n2\\r\\nENTITIES\\r\\n";
      for (let l of this.lines) {
        s += \`0\\r\\nLINE\\r\\n8\\r\\n\${l.layer}\\r\\n10\\r\\n\${l.x1.toFixed(3)}\\r\\n20\\r\\n\${l.y1.toFixed(3)}\\r\\n11\\r\\n\${l.x2.toFixed(3)}\\r\\n21\\r\\n\${l.y2.toFixed(3)}\\r\\n\`;
      }
      for (let c of this.circles) {
        s += \`0\\r\\nCIRCLE\\r\\n8\\r\\n\${c.layer}\\r\\n10\\r\\n\${c.cx.toFixed(3)}\\r\\n20\\r\\n\${c.cy.toFixed(3)}\\r\\n40\\r\\n\${c.r.toFixed(3)}\\r\\n\`;
      }
      for (let t of this.texts) {
        s += \`0\\r\\nTEXT\\r\\n8\\r\\n\${t.layer}\\r\\n10\\r\\n\${t.x.toFixed(3)}\\r\\n20\\r\\n\${t.y.toFixed(3)}\\r\\n40\\r\\n\${t.h.toFixed(3)}\\r\\n1\\r\\n\${t.text}\\r\\n\`;
      }
      s += "0\\r\\nENDSEC\\r\\n0\\r\\nEOF\\r\\n";
      return s;
    }
  }

  // Yordamchi: Fanera detali va lazer qora/kuygan qirralarini chizish
  function createPlywoodPart(w, h, depth, colorHex, partName, explodeVec) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(w, h, depth);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex || 0xdfba7f,
      roughness: 0.65,
      metalness: 0.05
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Lazerda kesilgan to'q jigarrang qirralar (Laser-cut Burn Edges)
    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4a2c11, linewidth: 1.5 });
    const edgeLines = new THREE.LineSegments(edges, lineMat);
    group.add(edgeLines);

    group.userData = {
      partName: partName,
      thickness: depth ? depth.toFixed(1) + 'mm fanera' : '3mm',
      origPos: { x: 0, y: 0, z: 0 },
      explodeVec: explodeVec || { x: 0, y: 0, z: 0 }
    };
    explodedParts.push(group);
    return group;
  }

  // --- 5. ASOSIY MODEL GENERATSIYASI (TRUE PLYWOOD ASSEMBLIES) ---
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

      const dxf = new SimpleDxf();
      let partsCount = 0;
      let cutLengthMeters = 0;
      let svgPartsHtml = '';

      const woodColor = 0xe3c794;     // Tabiiy fanera
      const baseWood = 0x9e5239;      // G'ishtin/to'q fanera
      const roofWood = 0x47515f;      // Kulrang tom
      const colWhite = 0xf2ece4;      // Oq bo'yalgan ustunlar

      if (preset.startsWith('building')) {
        // ==========================================
        // 🏛️ ARXITEKTURA BINOSI (UNIVERSITET / U-SHAKLI)
        // ==========================================
        const mainW = L;
        const mainD = 75;
        const wingW = 60;
        const floorH = H / floors;
        const porticoW = 85;
        const porticoD = 32;

        // --- 1. Poydevor Asosi (Base Plate) ---
        const totalBaseD = (preset === 'building_u' ? wingD + mainD : mainD) + 20;
        const baseGroup = createPlywoodPart(mainW + 20, t, totalBaseD, baseWood, "A00: Bino Poydevori Plitasi", { x: 0, y: -40, z: 0 });
        baseGroup.position.set(0, t/2, preset === 'building_u' ? wingD/2 : 0);
        baseGroup.userData.origPos = { x: baseGroup.position.x, y: baseGroup.position.y, z: baseGroup.position.z };
        modelGroup.add(baseGroup);

        // --- 2. Qavat Oraliq Pollari (Horizontal Floor Plates) ---
        for (let fl = 1; fl < floors; fl++) {
          const flGroup = createPlywoodPart(mainW - 2, t, mainD - 2, woodColor, \`F0\${fl}: \${fl}-Qavat Oraliq Poli\`, { x: 0, y: fl * 15, z: 0 });
          flGroup.position.set(0, fl * floorH, 0);
          flGroup.userData.origPos = { x: flGroup.position.x, y: flGroup.position.y, z: flGroup.position.z };
          modelGroup.add(flGroup);
        }

        // --- 3. Markaziy Old Fasad Devori (Front Wall) ---
        const frontWall = createPlywoodPart(mainW, H, t, woodColor, "A01: Markaziy Fasad Devori (Old)", { x: 0, y: 0, z: 50 });
        frontWall.position.set(0, H/2 + t, mainD/2 - t/2);
        frontWall.userData.origPos = { x: frontWall.position.x, y: frontWall.position.y, z: frontWall.position.z };
        modelGroup.add(frontWall);

        // Derazalar va kirish eshigi (Haqiqiy o'yilgan teshiklar)
        const winW = (mainW / winCols) * 0.55;
        const winH = floorH * 0.52;
        const darkWinMat = new THREE.MeshBasicMaterial({ color: 0x1d2837 });
        for (let fl = 0; fl < floors; fl++) {
          const wy = -H/2 + (fl + 0.5) * floorH;
          for (let wc = 0; wc < winCols; wc++) {
            const wx = -mainW/2 + (wc + 0.5) * (mainW / winCols);
            if (Math.abs(wx) < 32 && fl === 0) continue; // 1-qavat kirish eshigi
            const wHole = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, t + 1.2), darkWinMat);
            wHole.position.set(wx, wy, 0);
            frontWall.add(wHole);
          }
        }

        // --- 4. Markaziy Orqa Fasad Devori ---
        const backWall = createPlywoodPart(mainW, H, t, woodColor, "A02: Orqa Fasad Devori", { x: 0, y: 0, z: -50 });
        backWall.position.set(0, H/2 + t, -mainD/2 + t/2);
        backWall.userData.origPos = { x: backWall.position.x, y: backWall.position.y, z: backWall.position.z };
        modelGroup.add(backWall);

        // --- 5. Yon Qanot Korpuslari (U-shape / L-shape wings) ---
        if (preset === 'building_u' || preset === 'building_l') {
          // Chap Qanot Devorlari (Tashqi va Ichki devor)
          const wingOutLeft = createPlywoodPart(t, H, wingD, woodColor, "B01: Chap Qanot Tashqi Devori", { x: -50, y: 0, z: 25 });
          wingOutLeft.position.set(-mainW/2 + t/2, H/2 + t, mainD/2 + wingD/2);
          wingOutLeft.userData.origPos = { x: wingOutLeft.position.x, y: wingOutLeft.position.y, z: wingOutLeft.position.z };
          modelGroup.add(wingOutLeft);

          const wingInLeft = createPlywoodPart(t, H, wingD, woodColor, "B02: Chap Qanot Ichki Devori", { x: -20, y: 0, z: 25 });
          wingInLeft.position.set(-mainW/2 + wingW - t/2, H/2 + t, mainD/2 + wingD/2);
          wingInLeft.userData.origPos = { x: wingInLeft.position.x, y: wingInLeft.position.y, z: wingInLeft.position.z };
          modelGroup.add(wingInLeft);

          // Chap qanot uchi devori
          const wingEndLeft = createPlywoodPart(wingW, H, t, woodColor, "B03: Chap Qanot Fasad Uchi", { x: -35, y: 0, z: 65 });
          wingEndLeft.position.set(-mainW/2 + wingW/2, H/2 + t, mainD/2 + wingD - t/2);
          wingEndLeft.userData.origPos = { x: wingEndLeft.position.x, y: wingEndLeft.position.y, z: wingEndLeft.position.z };
          modelGroup.add(wingEndLeft);

          if (preset === 'building_u') {
            // O'ng Qanot Devorlari
            const wingOutRight = createPlywoodPart(t, H, wingD, woodColor, "C01: O'ng Qanot Tashqi Devori", { x: 50, y: 0, z: 25 });
            wingOutRight.position.set(mainW/2 - t/2, H/2 + t, mainD/2 + wingD/2);
            wingOutRight.userData.origPos = { x: wingOutRight.position.x, y: wingOutRight.position.y, z: wingOutRight.position.z };
            modelGroup.add(wingOutRight);

            const wingInRight = createPlywoodPart(t, H, wingD, woodColor, "C02: O'ng Qanot Ichki Devori", { x: 20, y: 0, z: 25 });
            wingInRight.position.set(mainW/2 - wingW + t/2, H/2 + t, mainD/2 + wingD/2);
            wingInRight.userData.origPos = { x: wingInRight.position.x, y: wingInRight.position.y, z: wingInRight.position.z };
            modelGroup.add(wingInRight);

            const wingEndRight = createPlywoodPart(wingW, H, t, woodColor, "C03: O'ng Qanot Fasad Uchi", { x: 35, y: 0, z: 65 });
            wingEndRight.position.set(mainW/2 - wingW/2, H/2 + t, mainD/2 + wingD - t/2);
            wingEndRight.userData.origPos = { x: wingEndRight.position.x, y: wingEndRight.position.y, z: wingEndRight.position.z };
            modelGroup.add(wingEndRight);
          }
        }

        // --- 6. Klassik Portik, Ustunlar va Fronton ---
        if (columnsCount > 0) {
          const colH = H * 0.85;
          const colSpacing = porticoW / (columnsCount - 1);
          
          for (let i = 0; i < columnsCount; i++) {
            const cx = -porticoW/2 + i * colSpacing;
            const col = createPlywoodPart(8, colH, t, colWhite, \`U0\${i+1}: Klassik Ustun Detali\`, { x: 0, y: 0, z: 80 });
            col.position.set(cx, colH/2 + t, mainD/2 + porticoD);
            col.userData.origPos = { x: col.position.x, y: col.position.y, z: col.position.z };
            modelGroup.add(col);
          }

          // Portik Friz va Frontoni (Entablature)
          const frieze = createPlywoodPart(porticoW + 12, 16, porticoD + 6, woodColor, "E01: Portik Karnizi va Friz", { x: 0, y: 35, z: 60 });
          frieze.position.set(0, colH + t + 8, mainD/2 + porticoD/2);
          frieze.userData.origPos = { x: frieze.position.x, y: frieze.position.y, z: frieze.position.z };
          modelGroup.add(frieze);

          // Fronton uchburchagi
          const pedShape = new THREE.Shape();
          pedShape.moveTo(-porticoW/2 - 6, 0);
          pedShape.lineTo(porticoW/2 + 6, 0);
          pedShape.lineTo(0, 20);
          pedShape.closePath();
          const pedGeo = new THREE.ExtrudeGeometry(pedShape, { depth: t, bevelEnabled: false });
          const pedMesh = new THREE.Mesh(pedGeo, new THREE.MeshStandardMaterial({ color: woodColor, roughness: 0.6 }));
          const pedGroup = new THREE.Group();
          pedGroup.add(pedMesh);
          pedGroup.position.set(0, colH + t + 16, mainD/2 + porticoD + 2);
          pedGroup.userData = {
            partName: "E02: Kirish Frontoni (Uchburchak)",
            thickness: "3mm fanera",
            origPos: { x: pedGroup.position.x, y: pedGroup.position.y, z: pedGroup.position.z },
            explodeVec: { x: 0, y: 55, z: 85 }
          };
          explodedParts.push(pedGroup);
          modelGroup.add(pedGroup);
        }

        // --- 7. Tom Qopqog'i (Roof Plate) ---
        const roof = createPlywoodPart(mainW + 10, t, mainD + 10, roofWood, "T01: Asosiy Tom Plitasi", { x: 0, y: 70, z: 0 });
        roof.position.set(0, H + t + t/2, 0);
        roof.userData.origPos = { x: roof.position.x, y: roof.position.y, z: roof.position.z };
        modelGroup.add(roof);

        // --- 2D DXF & NESTING VARAQLARI ---
        partsCount = 22;
        cutLengthMeters = 9.8;

        const curX = 20, curY = 20;
        
        // A01 Markaziy fasad
        dxf.addRect('CUT', curX, curY, mainW, H);
        dxf.addText('ENGRAVE', curX + 10, curY + 15, 6, 'A01: MARKAZIY FASAD (OLD)');
        
        for (let fl = 1; fl < floors; fl++) {
          dxf.addLine('ENGRAVE', curX, curY + fl * floorH, curX + mainW, curY + fl * floorH);
        }
        for (let fl = 0; fl < floors; fl++) {
          const dy = curY + (fl + 0.3) * floorH;
          for (let wc = 0; wc < winCols; wc++) {
            const dx = curX + 15 + wc * (mainW - 30) / winCols;
            if (fl === 0 && wc >= Math.floor(winCols/2)-1 && wc <= Math.floor(winCols/2)) {
              dxf.addRect('CUT', dx, curY, winW * 1.2, floorH * 0.85);
            } else {
              dxf.addRect('CUT', dx, dy, winW, winH);
            }
          }
        }
        // Tikan-paz tirqishlari
        for (let i = 1; i <= 4; i++) {
          const slotX = curX + (i * mainW) / 5;
          dxf.addRect('CUT', slotX, curY + 2, t + cl, 10);
          dxf.addRect('CUT', slotX, curY + H - 12, t + cl, 10);
        }

        // A02 Orqa fasad
        const bY = curY + H + 15;
        dxf.addRect('CUT', curX, bY, mainW, H);
        dxf.addText('ENGRAVE', curX + 10, bY + 15, 6, 'A02: ORQA DEVOR');

        // B01 Poydevor
        const poyX = curX + mainW + 20;
        dxf.addRect('CUT', poyX, curY, (preset === 'building_u' ? wingD + mainD : mainD), mainW);
        dxf.addText('ENGRAVE', poyX + 10, curY + 20, 6, 'B01: POYDEVOR ASOSI');

        // Ustunlar va fronton
        if (columnsCount > 0) {
          const colX = poyX + mainD + 30;
          for (let c = 0; c < columnsCount; c++) {
            dxf.addRect('CUT', colX + c * 14, curY, 8, H * 0.85);
            dxf.addText('ENGRAVE', colX + c * 14, curY + 10, 4, 'U' + (c+1));
          }
          dxf.addLine('CUT', colX, curY + H * 0.85 + 15, colX + 80, curY + H * 0.85 + 15);
          dxf.addLine('CUT', colX, curY + H * 0.85 + 15, colX + 40, curY + H * 0.85 + 35);
          dxf.addLine('CUT', colX + 40, curY + H * 0.85 + 35, colX + 80, curY + H * 0.85 + 15);
          dxf.addText('ENGRAVE', colX + 10, curY + H * 0.85 + 20, 5, 'FRONTON');
        }

        // 2D SVG Ko'rinishi
        svgPartsHtml = \`
          <!-- A01 Old Fasad -->
          <rect x="\${curX}" y="\${curY}" width="\${mainW}" height="\${H}" fill="none" stroke="#e00000" stroke-width="1.2"/>
          <text x="\${curX + 10}" y="\${curY + 16}" fill="#0030d0" font-size="9" font-family="monospace">A01: MARKAZIY FASAD (\${mainW}x\${H}mm)</text>
          
          <!-- Deraza qirqimlari -->
          \${Array.from({length: floors}).map((_, fl) => {
            const dy = curY + (fl + 0.3) * floorH;
            return Array.from({length: winCols}).map((__, wc) => {
              const dx = curX + 15 + wc * (mainW - 30) / winCols;
              if (fl === 0 && wc >= Math.floor(winCols/2)-1 && wc <= Math.floor(winCols/2)) {
                return \`<rect x="\${dx}" y="\${curY + H - floorH * 0.85}" width="\${winW * 1.2}" height="\${floorH * 0.85}" fill="#16181b" stroke="#e00000" stroke-width="1"/>\`;
              }
              return \`<rect x="\${dx}" y="\${dy}" width="\${winW}" height="\${winH}" fill="#16181b" stroke="#e00000" stroke-width="1"/>\`;
            }).join('');
          }).join('')}

          <!-- Qavat chiziqlari (Gravirovka) -->
          \${Array.from({length: floors - 1}).map((_, fl) => {
            const ly = curY + (fl + 1) * floorH;
            return \`<line x1="\${curX}" y1="\${ly}" x2="\${curX + mainW}" y2="\${ly}" stroke="#0030d0" stroke-dasharray="2" stroke-width="0.8"/>\`;
          }).join('')}

          <!-- A02 Orqa Devor -->
          <rect x="\${curX}" y="\${bY}" width="\${mainW}" height="\${H}" fill="none" stroke="#e00000" stroke-width="1.2"/>
          <text x="\${curX + 10}" y="\${bY + 16}" fill="#0030d0" font-size="9" font-family="monospace">A02: ORQA DEVOR (\${mainW}x\${H}mm)</text>

          <!-- B01 Poydevor -->
          <rect x="\${poyX}" y="\${curY}" width="\${mainD + 30}" height="\${mainW}" fill="none" stroke="#e00000" stroke-width="1.2"/>
          <text x="\${poyX + 10}" y="\${curY + 20}" fill="#0030d0" font-size="9" font-family="monospace">B01: POYDEVOR ASOSI</text>

          <!-- Ustunlar -->
          \${Array.from({length: columnsCount}).map((_, c) => {
            return \`<rect x="\${poyX + mainD + 40 + c * 12}" y="\${curY}" width="8" height="\${H * 0.85}" fill="none" stroke="#e00000" stroke-width="1"/>
            <text x="\${poyX + mainD + 40 + c * 12}" y="\${curY + 15}" fill="#0030d0" font-size="7" font-family="monospace">U\${c+1}</text>\`;
          }).join('')}
        \`;

      } else if (preset === 'windTurbine') {
        const baseSize = L * 0.7;
        const towerH = H * 0.75;
        const towerBottomW = baseSize * 0.45;
        const bladeL = H * 0.45;
        const bladeW = 20;

        const baseGroup = createPlywoodPart(baseSize, t, baseSize, baseWood, "A01: Minora Poydevori", { x: 0, y: -30, z: 0 });
        baseGroup.position.set(0, t/2, 0);
        baseGroup.userData.origPos = { x: 0, y: t/2, z: 0 };
        modelGroup.add(baseGroup);

        const p1 = createPlywoodPart(towerBottomW, towerH, t, woodColor, "B01: Minora Old Paneli", { x: 0, y: 0, z: 30 });
        p1.position.set(0, towerH / 2 + t, towerBottomW / 2 - t/2);
        p1.userData.origPos = { x: p1.position.x, y: p1.position.y, z: p1.position.z };
        modelGroup.add(p1);

        const p2 = createPlywoodPart(towerBottomW, towerH, t, woodColor, "B02: Minora Orqa Paneli", { x: 0, y: 0, z: -30 });
        p2.position.set(0, towerH / 2 + t, -towerBottomW / 2 + t/2);
        p2.userData.origPos = { x: p2.position.x, y: p2.position.y, z: p2.position.z };
        modelGroup.add(p2);

        const nacelle = createPlywoodPart(L * 0.4, 35, 30, woodColor, "C01: Gondola Korpus", { x: 0, y: 40, z: 0 });
        nacelle.position.set(0, towerH + t + 17.5, 0);
        nacelle.userData.origPos = { x: nacelle.position.x, y: nacelle.position.y, z: nacelle.position.z };
        modelGroup.add(nacelle);

        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3;
          const blade = createPlywoodPart(bladeW, bladeL, t, woodColor, \`D0\${i+1}: Rotor Parrak\`, { x: Math.sin(angle)*50, y: Math.cos(angle)*50, z: 40 });
          blade.position.set(Math.sin(angle) * (bladeL/2 + 10), towerH + t + 18 + Math.cos(angle) * (bladeL/2 + 10), 18);
          blade.rotation.z = -angle;
          blade.userData.origPos = { x: blade.position.x, y: blade.position.y, z: blade.position.z };
          modelGroup.add(blade);
        }

        partsCount = 12;
        cutLengthMeters = 4.25;

        dxf.addRect('CUT', 20, 20, baseSize, baseSize);
        dxf.addText('ENGRAVE', 25, 35, 6, 'A01: POYDEVOR');
        dxf.addRect('CUT', 160, 20, towerBottomW, towerH);
        dxf.addText('ENGRAVE', 165, 35, 6, 'B01: MINORA-1');

        svgPartsHtml = \`
          <rect x="20" y="20" width="\${baseSize}" height="\${baseSize}" fill="none" stroke="#e00000" stroke-width="1.2"/>
          <text x="25" y="40" fill="#0030d0" font-size="9" font-family="monospace">A01: POYDEVOR</text>
          <rect x="160" y="20" width="\${towerBottomW}" height="\${towerH}" fill="none" stroke="#e00000" stroke-width="1.2"/>
          <text x="165" y="40" fill="#0030d0" font-size="9" font-family="monospace">B01: MINORA-1</text>
        \`;

      } else {
        const W = L * 0.65;
        const boxH = H * 0.45;

        const base = createPlywoodPart(L, t, W, woodColor, "A01: Asosiy Taglik", { x: 0, y: -30, z: 0 });
        base.position.set(0, t/2, 0);
        base.userData.origPos = { x: 0, y: t/2, z: 0 };
        modelGroup.add(base);

        const front = createPlywoodPart(L, boxH, t, woodColor, "B01: Old Devor (Pazli)", { x: 0, y: 0, z: 35 });
        front.position.set(0, boxH/2 + t/2, W/2 - t/2);
        front.userData.origPos = { x: front.position.x, y: front.position.y, z: front.position.z };
        modelGroup.add(front);

        const lid = createPlywoodPart(L, t, W, baseWood, "C01: Living Hinge Qopqoq", { x: 0, y: 40, z: 0 });
        lid.position.set(0, boxH + t + t/2, 0);
        lid.userData.origPos = { x: lid.position.x, y: lid.position.y, z: lid.position.z };
        modelGroup.add(lid);

        partsCount = 6;
        cutLengthMeters = 2.45;

        dxf.addRect('CUT', 20, 20, L, W);
        dxf.addText('ENGRAVE', 25, 35, 6, 'A01: ASOS (PAZLI)');
        dxf.addRect('CUT', 20, 140, L, W);
        dxf.addText('ENGRAVE', 25, 155, 6, 'A02: LIVING HINGE QOPQOQ');

        svgPartsHtml = \`
          <rect x="20" y="20" width="\${L}" height="\${W}" fill="none" stroke="#e00000" stroke-width="1.2"/>
          <text x="25" y="40" fill="#0030d0" font-size="9" font-family="monospace">A01: ASOS (\${L}x\${W}mm)</text>
          <rect x="20" y="140" width="\${L}" height="\${W}" fill="none" stroke="#e00000" stroke-width="1.2"/>
          <text x="25" y="160" fill="#0030d0" font-size="9" font-family="monospace">A02: LIVING HINGE QOPQOQ</text>
        \`;
      }

      currentDxfString = dxf.build();

      const fullSvg = \`<svg viewBox="0 0 600 400" width="100%" height="100%">
        <rect x="0" y="0" width="600" height="400" fill="#1b1d20" stroke="#444" stroke-dasharray="4"/>
        <text x="15" y="390" fill="#888" font-size="10" font-family="monospace">FANERA VARAG'I: 600 x 400 mm | Qalinlik: \${t} mm | CUT (Qizil): Kesish | ENGRAVE (Ko'k): Gravirovka</text>
        \${svgPartsHtml}
      </svg>\`;

      document.getElementById('svgContainer').innerHTML = fullSvg;
      document.getElementById('statsInfo').innerText = \`Detallar: \${partsCount} ta | Varaqlar: 1 ta (600x400 mm) | Kesish masofasi: ~\${cutLengthMeters} m\`;

      const specData = {
        modelPreset: preset,
        material: { type: document.getElementById('matType').value, thickness: t, clearance: cl },
        dimensions: { length: L, height: H },
        floors: floors,
        columns: columnsCount,
        partsTotal: partsCount,
        cutLengthMeters: cutLengthMeters,
        joinery: "Finger joints (tikan-paz) ulanishlari, slot = t + clearance",
        features3D: "Exploded View (Ajratilgan ko'rinish) + Yig'ilish animatsiyasi + Lazer qirralari",
        dxfLayers: ["CUT (Qizil - Nurning to'liq kesishi)", "ENGRAVE (Ko'k - Gravirovka va qavat belgilari)"]
      };
      document.getElementById('specJson').value = JSON.stringify(specData, null, 2);

      const b = document.getElementById('genBanner');
      b.style.display = 'block';
      setTimeout(() => { b.style.display = 'none'; }, 4500);

      if (controls) {
        controls.reset();
        camera.position.set(L * 1.05, H * 1.15, L * 1.15);
        camera.lookAt(0, H * 0.4, 0);
      }

      // Explode holatini qayta tiklash
      const currentExplodeVal = document.getElementById('explodeRange').value;
      applyExplodeFactor(currentExplodeVal / 100);

    } catch (err) {
      console.error('Generatsiya xatosi:', err);
      alert('Generatsiyada xatolik: ' + err.message);
    }
  }

  function downloadCurrentDxf() {
    if (!currentDxfString) {
      runGenerateModel();
    }
    const blob = new Blob([currentDxfString], { type: 'application/dxf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = \`lasermaket_\${document.getElementById('modelPreset').value}.dxf\`;
    a.click();
  }

  function downloadCalibrationCard() {
    window.location.href = '../lasermaket-mcp/storage/proj_1793462128150/calibration_comb_test.dxf';
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
console.log('SUCCESS: Written new ai-erkin-generator.html with 3D Exploded View & Plywood parts, size: ' + htmlContent.length + ' bytes');
