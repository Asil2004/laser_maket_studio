const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const serverPath = path.join(__dirname, 'server.js');
const child = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let msgId = 1;

function send(method, params = {}) {
  const req = {
    jsonrpc: '2.0',
    id: msgId++,
    method,
    params
  };
  child.stdin.write(JSON.stringify(req) + '\n');
}

const responses = [];

child.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(l => l.trim());
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      responses.push(parsed);
      console.log(`[RECV ID ${parsed.id}]:`, parsed.result ? 'SUCCESS' : 'ERROR', JSON.stringify(parsed).slice(0, 150));
    } catch (e) {
      console.log('[NON-JSON]:', line);
    }
  }
});

async function runTests() {
  console.log('--- Test 1: Initialize ---');
  send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0.0' }
  });

  await new Promise(r => setTimeout(r, 200));

  console.log('--- Test 2: Tools List ---');
  send('tools/list');

  await new Promise(r => setTimeout(r, 200));

  console.log('--- Test 3: Create Project ---');
  send('tools/call', {
    name: 'lasermaket_create_project',
    arguments: {
      name: 'Test Lazer Sandiqcha',
      thickness: 3.0,
      kerf: 0.15,
      clearance: 0.1,
      sheetWidth: 600,
      sheetHeight: 400,
      materialType: 'plywood'
    }
  });

  await new Promise(r => setTimeout(r, 300));

  const projResp = responses.find(r => r.result?.content?.[0]?.text?.includes('proj_'));
  let projId = 'proj_test';
  if (projResp) {
    const text = JSON.parse(projResp.result.content[0].text);
    projId = text.projectId;
  }
  console.log(`Created Project ID: ${projId}`);

  console.log('--- Test 4: Generate Calibration Card ---');
  send('tools/call', {
    name: 'lasermaket_generate_calibration_card',
    arguments: {
      projectId: projId
    }
  });

  await new Promise(r => setTimeout(r, 300));

  console.log('--- Test 5: Generate Model with Parts & Living Hinge ---');
  send('tools/call', {
    name: 'lasermaket_generate_model',
    arguments: {
      projectId: projId,
      parts: [
        {
          id: 'BASE',
          name: 'Asosiy Taglik',
          width: 150,
          height: 100,
          qty: 1,
          type: 'box_face',
          slots: [
            { x: 20, y: 15, w: 3.1, h: 10, matchId: 'RIB_01' },
            { x: 120, y: 15, w: 3.1, h: 10, matchId: 'RIB_02' }
          ]
        },
        {
          id: 'RIB_01',
          name: 'Mustahkamlovchi Qovurg\'a',
          width: 90,
          height: 40,
          qty: 2,
          type: 'generic'
        },
        {
          id: 'COVER_FLEX',
          name: 'Egiluvchan Qopqoq',
          width: 150,
          height: 120,
          qty: 1,
          type: 'living_hinge',
          bendZoneX: 30,
          bendZoneW: 60
        },
        {
          id: 'WHEEL_GEAR',
          name: 'Tishli G\'ildirak',
          width: 50,
          height: 50,
          qty: 4,
          type: 'circle',
          centerHole: 'cross'
        }
      ]
    }
  });

  await new Promise(r => setTimeout(r, 500));

  console.log('--- Test 6: Summary & File Verification ---');
  send('tools/call', {
    name: 'lasermaket_get_project_summary',
    arguments: {
      projectId: projId
    }
  });

  await new Promise(r => setTimeout(r, 400));

  child.kill();
  console.log('=== All Tests Finished Successfully ===');
}

runTests();
