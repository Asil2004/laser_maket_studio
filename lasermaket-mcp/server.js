#!/usr/bin/env node
/**
 * LaserMaket Model Context Protocol (MCP) Server
 * Stdio JSON-RPC 2.0 implementation
 */
const readline = require('readline');
const path = require('path');
const { ProjectManager } = require('./projectManager');
const LaserMaketUpdater = require('../LaserMaket_Studio/updater');

const manager = new ProjectManager(path.join(__dirname, 'storage'));
const updater = new LaserMaketUpdater();

const TOOLS = [
  {
    name: 'lasermaket_create_project',
    description: "Yangi lazer maketi loyihasini yaratish. Material qalinligi, kerf va varaq o'lchamlarini belgilaydi.",
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Model yoki buyum nomi (masalan: "Egiluvchan Yog\'och Quti", "Avtomobil Maketi")' },
        thickness: { type: 'number', description: 'Material qalinligi mm da (standart: 3.0 mm; yirik modellar: 4.0 mm, HDF: 2.5 mm)' },
        kerf: { type: 'number', description: 'Lazer nuri kengligi mm da (standart: 0.15 mm)' },
        clearance: { type: 'number', description: 'Ulanish tirqishi toleransi mm da (standart: 0.1 mm)' },
        sheetWidth: { type: 'number', description: 'Lazer ish maydoni yoki fanera varag\'i kengligi mm da (standart: 600 mm)' },
        sheetHeight: { type: 'number', description: 'Lazer ish maydoni yoki fanera varag\'i balandligi mm da (standart: 400 mm)' },
        materialType: { type: 'string', enum: ['plywood', 'hdf', 'acrylic'], description: 'Material turi (plywood, hdf, acrylic)' }
      },
      required: ['name']
    }
  },
  {
    name: 'lasermaket_register_images',
    description: "Modelni generatsiya qilish uchun 1 tadan 15 tagacha olingan fotosuratlar yo'llarini loyihaga biriktirish.",
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Loyiha identifikatori' },
        imagePaths: {
          type: 'array',
          items: { type: 'string' },
          description: "Rasmlarning to'liq fayl yo'llari (1 tadan 15 tagacha)"
        }
      },
      required: ['projectId', 'imagePaths']
    }
  },
  {
    name: 'lasermaket_generate_model',
    description: "AI tahlil qilgan komponentlar spetsifikatsiyasi (CAD spec) asosida parametrik detallar, ulanishlar (joinery), living hinge va nest qilingan DXF/SVG fayllarni generatsiya qilish.",
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Loyiha identifikatori' },
        parts: {
          type: 'array',
          description: "Model detallari ro'yxati (har bir detal uchun o'lchamlar, ulanish turlari va miqdori)",
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Detal kodi (masalan: P01, BASE, SIDE_L)' },
              name: { type: 'string', description: 'Detal nomi (masalan: "Pastki asos", "Old devor")' },
              width: { type: 'number', description: 'Kengligi (mm)' },
              height: { type: 'number', description: 'Balandligi (mm)' },
              qty: { type: 'number', description: 'Soni (standart: 1)' },
              type: {
                type: 'string',
                enum: ['box_face', 'living_hinge', 'circle', 'generic'],
                description: 'Detal turi: box_face (burchak ulanishlar), living_hinge (bukiluvchan), circle (disk/g\'ildirak), generic'
              },
              centerHole: {
                type: 'string',
                enum: ['none', 'round', 'cross'],
                description: 'Aylanma disklar uchun markaziy teshik turi: round (erkin aylanuvchi), cross (o\'qda qotiriluvchi "+")'
              },
              bendZoneX: { type: 'number', description: 'Living hinge bukilish boshlanish koordinatasi X (mm)' },
              bendZoneW: { type: 'number', description: 'Living hinge bukilish zonasi kengligi (mm)' },
              slots: {
                type: 'array',
                description: 'Ichki tikan kirishi uchun tirqishlar ro\'yxati',
                items: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                    w: { type: 'number' },
                    h: { type: 'number' },
                    matchId: { type: 'string', description: 'Ulanadigan mos detal kodi (masalan: RIB_01)' }
                  }
                }
              }
            },
            required: ['id', 'name', 'width', 'height']
          }
        }
      },
      required: ['projectId', 'parts']
    }
  },
  {
    name: 'lasermaket_update_material_and_joinery',
    description: "Mavjud modelning material qalinligi, kerf yoki tirqish toleranslarini (clearance) o'zgartirish va barcha DXF/SVG larni qayta hisoblab yangilash.",
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Loyiha identifikatori' },
        thickness: { type: 'number', description: 'Yangi qalinlik (mm)' },
        kerf: { type: 'number', description: 'Yangi kerf (mm)' },
        clearance: { type: 'number', description: 'Yangi clearance (mm)' },
        sheetWidth: { type: 'number', description: 'Yangi varaq kengligi (mm)' },
        sheetHeight: { type: 'number', description: 'Yangi varaq balandligi (mm)' }
      },
      required: ['projectId']
    }
  },
  {
    name: 'lasermaket_generate_calibration_card',
    description: "Tanlangan material va lazer uchun maxsus 5-o'lchamli sinov taroqi (comb test card: -0.2..+0.2mm) hamda 10x10 kerf kvadratini DXF va SVG sifatida tayyorlash.",
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Loyiha identifikatori' }
      },
      required: ['projectId']
    }
  },
  {
    name: 'lasermaket_get_project_summary',
    description: "Loyiha haqida to'liq hisobot: detallar soni, varaqlar, umumiy lazer kesish masofasi (metr), va tayyor DXF/SVG fayl manzillari.",
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Loyiha identifikatori' }
      },
      required: ['projectId']
    }
  },
  {
    name: 'lasermaket_sync_app_update',
    description: "LaserMaket Studio ilovasini yangilash va sinxronizatsiya qilish. Claude yoki Antigravity tomonidan yangi funksiyalar yoki modellar qo'shilganda, kompyuterdagi o'rnatilgan ilovalarga avtomatik o'tkazadi va internetdagi barcha 4 ta kompyuter uchun yangilanish to'plamini (update.zip) tayyorlaydi.",
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['sync', 'publish'],
          description: "'sync' - lokal ilovani yangilaydi; 'publish' - barcha 4 ta kompyuter uchun update.zip va manifest.json chiqaradi"
        },
        version: {
          type: 'string',
          description: "Yangi versiya raqami (masalan '1.0.81')"
        },
        releaseNotes: {
          type: 'string',
          description: "Yangilanish izohi"
        }
      }
    }
  }
];

function handleToolCall(name, args) {
  try {
    if (name === 'lasermaket_sync_app_update') {
      if (args && args.action === 'publish') {
        const pubRes = updater.publishUpdate(args.version, args.releaseNotes);
        return {
          status: 'success',
          message: `LaserMaket ${pubRes.version} barcha 4 ta kompyuter uchun muvaffaqiyatli nashr qilindi!`,
          details: pubRes
        };
      }
      const res = updater.syncToInstalledApps();
      return {
        status: 'success',
        message: 'LaserMaket Studio ilovasi muvaffaqiyatli sinxronizatsiya qilindi!',
        syncDetails: res
      };
    } else if (name === 'lasermaket_create_project') {
      const proj = manager.createProject(null, args.name, args);
      return {
        status: 'success',
        message: `Loyiha muvaffaqiyatli yaratildi: ${proj.name}`,
        projectId: proj.id,
        material: proj.material
      };
    } else if (name === 'lasermaket_register_images') {
      const images = manager.addImages(args.projectId, args.imagePaths);
      return {
        status: 'success',
        message: `${images.length} ta rasm loyihaga biriktirildi`,
        projectId: args.projectId,
        registeredCount: images.length,
        images
      };
    } else if (name === 'lasermaket_generate_model') {
      const result = manager.buildModelFromSpec(args.projectId, { parts: args.parts });
      return {
        status: 'success',
        message: `Model muvaffaqiyatli generatsiya qilindi! ${result.partCount} ta detal, ${result.sheetsCount} ta fanera varag'iga joylashtirildi.`,
        ...result
      };
    } else if (name === 'lasermaket_update_material_and_joinery') {
      const proj = manager.getProject(args.projectId);
      if (!proj) throw new Error(`Loyiha topilmadi: ${args.projectId}`);

      if (args.thickness !== undefined) proj.material.thickness = args.thickness;
      if (args.kerf !== undefined) proj.material.kerf = args.kerf;
      if (args.clearance !== undefined) proj.material.clearance = args.clearance;
      if (args.sheetWidth !== undefined) proj.material.sheetWidth = args.sheetWidth;
      if (args.sheetHeight !== undefined) proj.material.sheetHeight = args.sheetHeight;

      let result = { message: 'Parametrlar yangilandi' };
      if (proj.spec) {
        result = manager.buildModelFromSpec(proj.id, proj.spec);
      } else {
        manager.saveProjectToDisk(proj);
      }
      return {
        status: 'success',
        message: 'Material va ulanish parametrlari muvaffaqiyatli yangilandi va qayta hisoblandi.',
        material: proj.material,
        buildResult: result
      };
    } else if (name === 'lasermaket_generate_calibration_card') {
      const card = manager.generateTestCard(args.projectId);
      return {
        status: 'success',
        message: 'Sinov taroqi (calibration card) tayyorlandi. Lazerda kesishdan oldin kerf va qalinlikni tekshiring!',
        card
      };
    } else if (name === 'lasermaket_get_project_summary') {
      const proj = manager.getProject(args.projectId);
      if (!proj) throw new Error(`Loyiha topilmadi: ${args.projectId}`);
      return {
        status: 'success',
        project: {
          id: proj.id,
          name: proj.name,
          material: proj.material,
          imagesCount: (proj.images || []).length,
          partCount: (proj.processedParts || []).length,
          sheetsCount: (proj.nestedSheets || []).length,
          exports: proj.exports
        }
      };
    } else {
      throw new Error(`Noma'lum vosita: ${name}`);
    }
  } catch (err) {
    return {
      status: 'error',
      error: err.message
    };
  }
}

// Start Stdio JSON-RPC Listener
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendResponse(id, result) {
  process.stdout.write(JSON.stringify({
    jsonrpc: '2.0',
    id,
    result
  }) + '\n');
}

function sendError(id, code, message) {
  process.stdout.write(JSON.stringify({
    jsonrpc: '2.0',
    id,
    error: { code, message }
  }) + '\n');
}

rl.on('line', (line) => {
  if (!line || !line.trim()) return;
  try {
    const msg = JSON.parse(line.trim());

    if (msg.method === 'initialize') {
      sendResponse(msg.id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'lasermaket-mcp',
          version: '1.0.0'
        }
      });
    } else if (msg.method === 'notifications/initialized') {
      // Client ack, no response needed
    } else if (msg.method === 'ping') {
      sendResponse(msg.id, {});
    } else if (msg.method === 'tools/list') {
      sendResponse(msg.id, {
        tools: TOOLS
      });
    } else if (msg.method === 'tools/call') {
      const toolName = msg.params?.name;
      const toolArgs = msg.params?.arguments || {};
      const res = handleToolCall(toolName, toolArgs);
      sendResponse(msg.id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res, null, 2)
          }
        ]
      });
    } else {
      if (msg.id !== undefined) {
        sendError(msg.id, -32601, `Method ${msg.method} topilmadi`);
      }
    }
  } catch (err) {
    sendError(null, -32700, `Parse error: ${err.message}`);
  }
});

process.on('uncaughtException', (err) => {
  process.stderr.write(`Uncaught Exception: ${err.stack || err}\n`);
});
