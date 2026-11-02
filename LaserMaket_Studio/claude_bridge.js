/* LaserMaket Studio <-> Claude API ko'prigi.
   Ilovadagi "Claude bilan yaratish" tugmasi rasmlar va ko'rsatmani shu yerga yuboradi,
   bu modul ularni Claude'ga (Anthropic API) jo'natadi, javobdagi parametrik generatorni
   custom/<id>.js ga saqlaydi va custom/all.js ni qayta yig'adi. */
const fs = require('fs');
const path = require('path');
const https = require('https');
const vm = require('vm');
const os = require('os');
const cp = require('child_process');
const QUEUE = path.join(__dirname, 'ai_queue');

const ROOT = __dirname;
const CFG = path.join(ROOT, 'claude-config.json');
const CUSTOM = path.join(ROOT, 'custom');
const EXAMPLES = path.join(ROOT, 'claude_examples');
const GUIDE = path.join(ROOT, 'claude_guide.md');

function readCfg() {
  let c = {};
  try { c = JSON.parse(fs.readFileSync(CFG, 'utf8')); } catch (e) {}
  if (!c.apiKey && process.env.ANTHROPIC_API_KEY) c.apiKey = process.env.ANTHROPIC_API_KEY;
  c.model = c.model || 'claude-opus-5-5';
  c.maxTokens = c.maxTokens || 32000;
  return c;
}
function saveCfg(c) { fs.writeFileSync(CFG, JSON.stringify(c, null, 2)); }

function systemPrompt() {
  let s = fs.readFileSync(GUIDE, 'utf8');
  try {
    fs.readdirSync(EXAMPLES).filter(f => f.endsWith('.js')).forEach(f => {
      s += `\n\n### Misol: ${f}\n\`\`\`js\n${fs.readFileSync(path.join(EXAMPLES, f), 'utf8')}\n\`\`\`\n`;
    });
  } catch (e) {}
  return s;
}

const AUTO_A = '/* ==== AI-AUTO-START: bu blok custom/*.js fayllaridan avtomatik yig\'iladi, qo\'lda tahrirlamang ==== */';
const AUTO_B = '/* ==== AI-AUTO-END ==== */';
function rebuildAll() {
  if (!fs.existsSync(CUSTOM)) fs.mkdirSync(CUSTOM, { recursive: true });
  const allF = path.join(CUSTOM, 'all.js');
  let manual = '';
  try { manual = fs.readFileSync(allF, 'utf8'); } catch (e) {}
  const i = manual.indexOf(AUTO_A), j = manual.indexOf(AUTO_B);
  if (i >= 0 && j > i) manual = manual.slice(0, i) + manual.slice(j + AUTO_B.length);
  manual = manual.replace(/\s+$/, '');
  if (!/__lmCustomF\s*=\s*window\.__lmCustomF/.test(manual)) manual = 'window.__lmCustomF=window.__lmCustomF||[];\n' + manual;
  const files = fs.readdirSync(CUSTOM).filter(f => f.endsWith('.js') && f !== 'all.js').sort();
  let block = '';
  files.forEach(f => {
    block += `\n/* ${f} */\ntry{\n${fs.readFileSync(path.join(CUSTOM, f), 'utf8')}\n}catch(e){console.error('custom ${f}',e);window.__lmCustomErr=(window.__lmCustomErr||[]).concat(String(e&&e.stack||e))}\n`;
  });
  const out = manual + '\n\n' + AUTO_A + '\n' + block + AUTO_B + '\n';
  let old = ''; try { old = fs.readFileSync(allF, 'utf8'); } catch (e) {}
  if (old !== out) {
    if (old && !fs.existsSync(path.join(CUSTOM, 'all.backup.txt'))) fs.writeFileSync(path.join(CUSTOM, 'all.backup.txt'), old);
    fs.writeFileSync(allF, out);
  }
  return files.length;
}

function listCustom() {
  if (!fs.existsSync(CUSTOM)) return [];
  return fs.readdirSync(CUSTOM).filter(f => f.endsWith('.json')).map(f => {
    try { const m = JSON.parse(fs.readFileSync(path.join(CUSTOM, f), 'utf8')); return { id: m.id, name: m.name, createdAt: m.createdAt, model: m.model }; } catch (e) { return null; }
  }).filter(Boolean).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

function callClaude(cfg, messages, onProgress) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: cfg.model, max_tokens: cfg.maxTokens, stream: true, system: systemPrompt(), messages });
    const base = cfg.apiBase ? new URL(cfg.apiBase) : null, lib = base && base.protocol === 'http:' ? require('http') : https;
    const req = lib.request({
      hostname: base ? base.hostname : 'api.anthropic.com', port: base ? base.port || undefined : undefined, path: '/v1/messages', method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01', 'content-length': Buffer.byteLength(body) },
      timeout: 20 * 60 * 1000
    }, res => {
      if (res.statusCode !== 200) {
        let e = ''; res.on('data', d => e += d); res.on('end', () => reject(new Error(`Claude API ${res.statusCode}: ${e.slice(0, 600)}`))); return;
      }
      let buf = '', text = '', stop = null;
      res.on('data', d => {
        buf += d.toString('utf8');
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
          if (!line.startsWith('data:')) continue;
          try {
            const ev = JSON.parse(line.slice(5).trim());
            if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') { text += ev.delta.text; onProgress && onProgress(text.length); }
            if (ev.type === 'message_delta' && ev.delta && ev.delta.stop_reason) stop = ev.delta.stop_reason;
            if (ev.type === 'error') reject(new Error(JSON.stringify(ev.error)));
          } catch (e) {}
        }
      });
      res.on('end', () => resolve({ text, stop }));
    });
    req.on('timeout', () => { req.destroy(new Error('Claude API vaqti tugadi')); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function extractCode(text) {
  const m = text.match(/```(?:js|javascript)?\s*\n([\s\S]*?)```/);
  const code = (m ? m[1] : text).trim();
  if (!/__lmCustomF/.test(code)) throw new Error('Javobda generator kodi topilmadi');
  new vm.Script(code, { filename: 'custom.js' });
  const idm = code.match(/id:\s*`(ai[A-Za-z0-9]+)`/) || code.match(/id:\s*['"](ai[A-Za-z0-9]+)['"]/);
  const nm = code.match(/name:\s*`([^`]{3,80})`/);
  return { code, id: idm ? idm[1] : 'aiModel' + Date.now(), name: nm ? nm[1] : 'AI model' };
}

function userContent(prompt, images, thickness, extra) {
  const c = [];
  (images || []).slice(0, 15).forEach(im => c.push({ type: 'image', source: { type: 'base64', media_type: im.media_type || 'image/jpeg', data: im.data } }));
  c.push({ type: 'text', text: `Ko'rsatma: ${prompt || 'Rasmdagi obyektning lazer maketini yasang.'}\nMaterial qalinligi: ${thickness || 3} mm fanera.\nRasmlar soni: ${(images || []).length}.\n${extra || ''}\nQo'llanmadagi format va qoidalarga qat'iy amal qiling. Faqat bitta \`\`\`js kod bloki qaytaring.` });
  return c;
}


/* ---- Claude Code CLI (obuna orqali, API kalitsiz) ---- */
let cliState = null;
function cliCmd() { const c = readCfg(); return c.cliPath || 'claude'; }
function cliAvailable() {
  if (cliState && Date.now() - cliState.at < 60000) return cliState.ok;
  let ok = false, ver = '';
  try { ver = cp.execSync(`"${cliCmd()}" --version`, { timeout: 15000, stdio: ['ignore', 'pipe', 'ignore'], shell: true, windowsHide: true }).toString().trim(); ok = /\d+\.\d+/.test(ver); } catch (e) {}
  cliState = { ok, ver, at: Date.now() }; return ok;
}
function killTree(ch) { try { if (process.platform === 'win32') cp.exec(`taskkill /pid ${ch.pid} /T /F`); else ch.kill('SIGTERM'); } catch (e) {} }
function flatten(messages, dir) {
  let imgs = [], parts = [];
  messages.forEach((m, mi) => {
    let t = '';
    if (typeof m.content === 'string') t = m.content;
    else (m.content || []).forEach(c => {
      if (c.type === 'image' && c.source && c.source.data) {
        const f = path.join(dir, `rasm_${imgs.length + 1}.${/png/.test(c.source.media_type) ? 'png' : 'jpg'}`);
        fs.writeFileSync(f, Buffer.from(c.source.data, 'base64')); imgs.push(f);
      } else if (c.type === 'text') t += c.text;
    });
    parts.push(messages.length > 1 ? `=== ${m.role === 'user' ? 'FOYDALANUVCHI' : 'SIZNING OLDINGI JAVOBINGIZ'} ===\n${t}` : t);
  });
  let head = imgs.length ? `Ilova qilingan rasmlar (Read vositasi bilan har birini ko'rib chiqing, tartib muhim):\n${imgs.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n` : '';
  let tail = messages.length > 1 ? `\n\nOxirgi FOYDALANUVCHI xabariga javob bering. Javob faqat bitta \`\`\`js blokidan iborat bo'lsin.` : '';
  return head + parts.join('\n\n') + tail;
}
function runCli(req, res, messages) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lmai-'));
  const prompt = flatten(messages, dir), c = readCfg();
  const args = ['-p', '--output-format', 'text', '--allowedTools', 'Read', '--add-dir', `"${dir}"`];
  if (c.cliModel) args.push('--model', c.cliModel);
  const ch = cp.spawn(`"${cliCmd()}"`, args, { cwd: dir, shell: true, windowsHide: true, env: Object.assign({}, process.env, { ANTHROPIC_API_KEY: '' }) });
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' });
  const ev = o => { try { res.write('data: ' + JSON.stringify(o) + '\n\n'); } catch (e) {} };
  ev({ type: 'message_start' });
  let err = '', got = false, done = false;
  const ping = setInterval(() => ev({ type: 'ping' }), 15000);
  ch.stdout.on('data', d => { got = true; ev({ type: 'content_block_delta', delta: { type: 'text_delta', text: d.toString('utf8') } }); });
  ch.stderr.on('data', d => { err += d.toString('utf8'); });
  ch.on('close', code => {
    done = true; clearInterval(ping);
    if (code !== 0 && !got) ev({ type: 'error', error: { type: 'claude_code', message: (err || `Claude Code ${code} kod bilan tugadi`).slice(0, 600) } });
    ev({ type: 'message_delta', delta: { stop_reason: 'end_turn' } }); ev({ type: 'message_stop' });
    try { res.end(); } catch (e) {}
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  });
  ch.on('error', e => { err += e.message; });
  req.on('close', () => { if (!done) killTree(ch); });
  ch.stdin.write(prompt); ch.stdin.end();
}

/* ---- AI navbati (Claude Desktop orqali, MCP/fayl) ---- */
function qList() {
  if (!fs.existsSync(QUEUE)) return [];
  return fs.readdirSync(QUEUE).filter(d => /^q_\w+$/.test(d)).map(d => {
    let r = {}, o = null;
    try { r = JSON.parse(fs.readFileSync(path.join(QUEUE, d, 'request.json'), 'utf8')); } catch (e) {}
    try { o = JSON.parse(fs.readFileSync(path.join(QUEUE, d, 'result.json'), 'utf8')); } catch (e) {}
    return { qid: d, kind: r.kind, target: r.target, prompt: r.prompt, createdAt: r.createdAt, status: o ? (o.status || 'done') : 'pending', result: o };
  });
}

let busy = false;
async function generate(p) {
  const cfg = readCfg();
  if (!cfg.apiKey) throw new Error('Claude API kaliti kiritilmagan');
  const messages = [{ role: 'user', content: userContent(p.prompt, p.images, p.thickness) }];
  const r = await callClaude(cfg, messages);
  let x = extractCode(r.text);
  if (fs.existsSync(path.join(CUSTOM, x.id + '.js')) && !p.replaceId) {
    const nid = x.id + Date.now().toString(36);
    x.code = x.code.split('`' + x.id + '`').join('`' + nid + '`'); x.id = nid;
  }
  if (p.replaceId) { x.code = x.code.split('`' + x.id + '`').join('`' + p.replaceId + '`'); x.id = p.replaceId; }
  if (!fs.existsSync(CUSTOM)) fs.mkdirSync(CUSTOM, { recursive: true });
  fs.writeFileSync(path.join(CUSTOM, x.id + '.js'), x.code);
  fs.writeFileSync(path.join(CUSTOM, x.id + '.json'), JSON.stringify({ id: x.id, name: x.name, prompt: p.prompt, thickness: p.thickness, model: cfg.model, createdAt: new Date().toISOString(), stop: r.stop }, null, 2));
  if (p.images && p.images.length) fs.writeFileSync(path.join(CUSTOM, x.id + '.images.json'), JSON.stringify(p.images.slice(0, 15)));
  rebuildAll();
  return { id: x.id, name: x.name, stop: r.stop };
}

async function fix(p) {
  const cfg = readCfg();
  const id = p.id, f = path.join(CUSTOM, id + '.js');
  if (!fs.existsSync(f)) throw new Error('Generator topilmadi: ' + id);
  const meta = JSON.parse(fs.readFileSync(path.join(CUSTOM, id + '.json'), 'utf8'));
  let images = []; try { images = JSON.parse(fs.readFileSync(path.join(CUSTOM, id + '.images.json'), 'utf8')); } catch (e) {}
  const old = fs.readFileSync(f, 'utf8');
  const messages = [
    { role: 'user', content: userContent(meta.prompt, images, meta.thickness) },
    { role: 'assistant', content: '```js\n' + old + '\n```' },
    { role: 'user', content: [{ type: 'text', text: `Bu generator ilovada xato berdi yoki natija noto'g'ri:\n${p.error}\n${p.note ? 'Foydalanuvchi izohi: ' + p.note : ''}\nXatoni tuzatib, to'liq generatorni qaytadan bitta \`\`\`js blokida bering. id \`${id}\` o'zgarmasin.` }] }
  ];
  const r = await callClaude(cfg, messages);
  const x = extractCode(r.text);
  const code = x.code.split('`' + x.id + '`').join('`' + id + '`');
  fs.writeFileSync(f, code);
  meta.fixedAt = new Date().toISOString(); meta.fixes = (meta.fixes || 0) + 1; meta.lastError = p.error;
  fs.writeFileSync(path.join(CUSTOM, id + '.json'), JSON.stringify(meta, null, 2));
  rebuildAll();
  return { id, name: x.name, stop: r.stop };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = []; let n = 0;
    req.on('data', d => { n += d.length; if (n > 80 * 1024 * 1024) { reject(new Error('Juda katta so\'rov')); req.destroy(); } else b.push(d); });
    req.on('end', () => { try { resolve(b.length ? JSON.parse(Buffer.concat(b).toString('utf8')) : {}); } catch (e) { reject(e); } });
  });
}

async function handle(req, res, reqPath) {
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
  try {
    if (reqPath === '/api/claude/status') { const c = readCfg(); return send(200, { configured: !!c.apiKey, cli: !c.apiKey && cliAvailable(), cliVersion: cliState && cliState.ver, model: c.model, busy, custom: listCustom(), queue: qList().filter(q => q.status === 'pending').length }); }
    if (reqPath === '/api/claude/config' && req.method === 'POST') {
      const p = await readBody(req), c = readCfg();
      if (p.apiKey) c.apiKey = String(p.apiKey).trim();
      if (p.model) c.model = String(p.model).trim();
      const save = { apiKey: c.apiKey, model: c.model, maxTokens: c.maxTokens }; if (c.apiBase) save.apiBase = c.apiBase; saveCfg(save);
      return send(200, { ok: true, model: c.model });
    }
    if ((reqPath === '/api/claude/generate' || reqPath === '/api/claude/fix') && req.method === 'POST') {
      if (busy) return send(429, { error: 'Claude hozir boshqa modelni yozmoqda, biroz kuting' });
      const p = await readBody(req); busy = true;
      try { const r = reqPath.endsWith('fix') ? await fix(p) : await generate(p); return send(200, r); }
      finally { busy = false; }
    }
    if (reqPath === '/api/claude/queue' && req.method === 'GET') return send(200, { items: qList() });
    if (reqPath === '/api/claude/queue' && req.method === 'POST') {
      const p = await readBody(req), qid = 'q_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), d = path.join(QUEUE, qid);
      fs.mkdirSync(d, { recursive: true });
      const imgs = (p.images || []).slice(0, 20).map((b, i) => { const f = `rasm_${i + 1}.jpg`; fs.writeFileSync(path.join(d, f), Buffer.from(String(b), 'base64')); return f; });
      fs.writeFileSync(path.join(d, 'prompt.md'), String(p.p0 || ''));
      if (p.code) fs.writeFileSync(path.join(d, 'current.js'), String(p.code));
      fs.writeFileSync(path.join(d, 'request.json'), JSON.stringify({ qid, kind: p.kind || 'new', target: p.target || null, prompt: String(p.prompt || ''), remark: String(p.remark || ''), thickness: p.thickness || 3, images: imgs, imageNote: String(p.imageNote || ''), review: !!p.review, createdAt: new Date().toISOString(), status: 'pending' }, null, 2));
      return send(200, { qid });
    }
    if (reqPath === '/api/claude/queue/status') {
      const qid = new URL(req.url, 'http://x').searchParams.get('id') || '';
      if (!/^q_\w+$/.test(qid)) return send(400, { error: 'id' });
      const it = qList().find(q => q.qid === qid);
      if (!it) return send(404, { status: 'missing' });
      if (it.status !== 'pending' && !it.result.rebuilt) { rebuildAll(); try { it.result.rebuilt = true; fs.writeFileSync(path.join(QUEUE, qid, 'result.json'), JSON.stringify(it.result, null, 2)); } catch (e) {} }
      return send(200, it);
    }
    if (reqPath === '/api/claude/queue/cancel' && req.method === 'POST') {
      const p = await readBody(req), qid = String(p.qid || '');
      if (!/^q_\w+$/.test(qid)) return send(400, { error: 'id' });
      try { fs.rmSync(path.join(QUEUE, qid), { recursive: true, force: true }); } catch (e) {}
      return send(200, { ok: true });
    }
    if (reqPath === '/api/claude/rebuild') return send(200, { count: rebuildAll() });
    if (reqPath === '/api/claude/messages' && req.method === 'POST') {
      const p = await readBody(req), cfg = readCfg();
      if (!cfg.apiKey) { if (cliAvailable()) return runCli(req, res, p.messages || []); return send(400, { error: 'Claude API kaliti ham, Claude Code ham topilmadi — so\'rov navbatga qo\'yiladi' }); }
      const body = JSON.stringify({ model: cfg.model, max_tokens: cfg.maxTokens, stream: true, messages: p.messages || [] });
      const base = cfg.apiBase ? new URL(cfg.apiBase) : null, lib = base && base.protocol === 'http:' ? require('http') : https;
      const up = lib.request({ hostname: base ? base.hostname : 'api.anthropic.com', port: base ? base.port || undefined : undefined, path: '/v1/messages', method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01', 'content-length': Buffer.byteLength(body) }, timeout: 30 * 60 * 1000 }, ur => {
        res.writeHead(ur.statusCode, { 'Content-Type': ur.statusCode === 200 ? 'text/event-stream; charset=utf-8' : 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
        ur.pipe(res);
      });
      up.on('timeout', () => up.destroy(new Error('Claude API vaqti tugadi')));
      up.on('error', e => { try { if (!res.headersSent) send(502, { error: e.message }); else res.end(); } catch (x) {} });
      req.on('close', () => { if (!res.writableEnded) up.destroy(); });
      up.write(body); up.end(); return;
    }
    if (reqPath === '/api/claude/save' && req.method === 'POST') {
      const p = await readBody(req), id = String(p.id || '');
      if (!/^ai[A-Za-z0-9]{2,60}$/.test(id)) return send(400, { error: 'Noto\'g\'ri id: ' + id });
      const code = String(p.code || '');
      if (!/__lmCustomF/.test(code)) return send(400, { error: 'Generator kodi emas' });
      new vm.Script(code, { filename: id + '.js' });
      if (!fs.existsSync(CUSTOM)) fs.mkdirSync(CUSTOM, { recursive: true });
      fs.writeFileSync(path.join(CUSTOM, id + '.js'), code);
      fs.writeFileSync(path.join(CUSTOM, id + '.json'), JSON.stringify({ id, name: String(p.name || id), prompt: String(p.prompt || ''), createdAt: new Date().toISOString(), source: 'studio-ai' }, null, 2));
      return send(200, { ok: true, count: rebuildAll() });
    }
    if (reqPath === '/api/claude/delete' && req.method === 'POST') {
      const p = await readBody(req), id = String(p.id || '');
      if (!/^ai[A-Za-z0-9]{2,60}$/.test(id)) return send(400, { error: 'Noto\'g\'ri id' });
      ['.js', '.json', '.images.json'].forEach(x => { try { fs.unlinkSync(path.join(CUSTOM, id + x)); } catch (e) {} });
      return send(200, { ok: true, count: rebuildAll() });
    }
    return send(404, { error: 'not found' });
  } catch (e) { return send(500, { error: e.message }); }
}

module.exports = { handle, rebuildAll };
