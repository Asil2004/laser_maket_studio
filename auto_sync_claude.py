# -*- coding: utf-8 -*-
"""
LaserMaket Studio - Claude AI Avtomatik Sinxronizatsiya va GitHub Push Tizimi
Ushbu skript Claude Desktop yoki boshqa har qanday kompyuterda qilingan o'zgarishlarni
avtomatik aniqlaydi, versiyani oshiradi, update.zip arxivini yaratadi,
kompyuterdagi o'rnatilgan dasturni yangilaydi va GitHub omboriga push qiladi.
"""

import os
import sys
import time
import json
import zipfile
import shutil
import subprocess
from datetime import datetime
from pathlib import Path

# UTF-8 chiqishini ta'minlash
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent
STUDIO_DIR = ROOT_DIR / "LaserMaket_Studio"
DIST_DIR = STUDIO_DIR / "dist_update"
CONFIG_FILE = STUDIO_DIR / "updater-config.json"
MANIFEST_FILE = STUDIO_DIR / "manifest.json"
DIST_MANIFEST = DIST_DIR / "manifest.json"
DIST_ZIP = DIST_DIR / "update.zip"

LOCAL_APPDATA = os.environ.get("LOCALAPPDATA", str(Path.home() / "AppData" / "Local"))
INSTALLED_DIRS = [
    Path(LOCAL_APPDATA) / "Programs" / "LaserMaket Studio" / "resources" / "app" / "site",
    Path(LOCAL_APPDATA) / "Programs" / "LaserMaket Studio",
    Path(LOCAL_APPDATA) / "Programs" / "LaserMaket"
]

def log(msg):
    now = datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] [Claude Auto-Sync]: {msg}")

def get_current_version():
    """Hozirgi versiyani aniqlash"""
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                d = json.load(f)
                if "currentVersion" in d:
                    return d["currentVersion"]
        except Exception:
            pass
    if DIST_MANIFEST.exists():
        try:
            with open(DIST_MANIFEST, "r", encoding="utf-8") as f:
                d = json.load(f)
                if "version" in d:
                    return d["version"]
        except Exception:
            pass
    return "1.0.86"

def bump_version(ver_str):
    """Versiya raqamini 1 qadam oshirish (1.0.86 -> 1.0.87)"""
    parts = ver_str.strip().split(".")
    if len(parts) >= 3:
        try:
            parts[-1] = str(int(parts[-1]) + 1)
            return ".".join(parts)
        except Exception:
            pass
    return f"{ver_str}.1"

def sync_to_installed(src_dir):
    """O'rnatilgan dasturlar papkasiga yangi fayllarni ko'chirish"""
    copied_count = 0
    for target in INSTALLED_DIRS:
        if not target.exists():
            continue
        try:
            # 1. custom/all.js
            src_custom = src_dir / "custom" / "all.js"
            if src_custom.exists():
                t_custom = target / "custom"
                t_custom.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src_custom, t_custom / "all.js")
                copied_count += 1

            # 2. index.html
            src_index = src_dir / "index.html"
            if src_index.exists():
                shutil.copy2(src_index, target / "index.html")
                copied_count += 1

            # 3. tools
            src_tools = src_dir / "tools"
            if src_tools.exists():
                t_tools = target / "tools"
                t_tools.mkdir(parents=True, exist_ok=True)
                for item in src_tools.glob("*.*"):
                    shutil.copy2(item, t_tools / item.name)
                    copied_count += 1
            log(f"O'rnatilgan papka yangilandi: {target.name}")
        except Exception as e:
            log(f"O'rnatilgan papkaga ko'chirishda xatolik ({target}): {e}")
    return copied_count

def package_update(new_version, release_notes="Claude AI orqali yangilanish"):
    """dist_update/update.zip va manifest.json tayyorlash"""
    DIST_DIR.mkdir(parents=True, exist_ok=True)

    # 1. update.zip yaratish
    files_to_zip = [
        "index.html",
        "launch_studio.js",
        "updater.js",
        "updater-config.json",
        "manifest.json"
    ]

    with zipfile.ZipFile(DIST_ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for fname in files_to_zip:
            fpath = STUDIO_DIR / fname
            if fpath.exists():
                z.write(fpath, fname)

        # custom papkasi
        custom_dir = STUDIO_DIR / "custom"
        if custom_dir.exists():
            for p in custom_dir.rglob("*"):
                if p.is_file():
                    z.write(p, str(p.relative_to(STUDIO_DIR)))

        # tools papkasi
        tools_dir = STUDIO_DIR / "tools"
        if tools_dir.exists():
            for p in tools_dir.rglob("*"):
                if p.is_file():
                    z.write(p, str(p.relative_to(STUDIO_DIR)))

    # 2. manifest.json yangilash
    manifest_data = {
        "version": new_version,
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "downloadUrl": f"https://raw.githubusercontent.com/Asil2004/laser_maket_studio/main/LaserMaket_Studio/dist_update/update.zip",
        "releaseNotes": release_notes,
        "requiredAppVersion": "1.0.75"
    }

    with open(DIST_MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)

    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)

    # 3. updater-config.json yangilash
    cfg_data = {
        "currentVersion": new_version,
        "updateManifestUrl": manifest_data["downloadUrl"].replace("update.zip", "manifest.json"),
        "autoCheckOnStartup": True,
        "lastChecked": datetime.utcnow().isoformat() + "Z"
    }
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg_data, f, indent=2, ensure_ascii=False)

    log(f"Yangi paket yig'ildi: {new_version} ({DIST_ZIP.name})")

def git_push_updates(version, note="Claude AI yangilanishi"):
    """GitHub omboriga commit va push qilish"""
    try:
        log("GitHub'ga yuklash (git add & commit)...")
        subprocess.run(["git", "add", "."], cwd=str(ROOT_DIR), check=True, capture_output=True)
        
        msg = f"Yangilanish v{version}: {note}"
        commit_res = subprocess.run(["git", "commit", "-m", msg], cwd=str(ROOT_DIR), capture_output=True, text=True)
        if "nothing to commit" in commit_res.stdout.lower() or "nothing to commit" in commit_res.stderr.lower():
            log("GitHub'ga yuklash uchun yangi o'zgarishlar yo'q.")
            return True

        log("GitHub'ga push qilinmoqda (origin main)...")
        push_res = subprocess.run(["git", "push", "origin", "main"], cwd=str(ROOT_DIR), check=True, capture_output=True, text=True)
        log(f"Muvaffaqiyatli push qilindi: v{version}!")
        return True
    except subprocess.CalledProcessError as e:
        err = e.stderr.decode('utf-8', errors='replace') if isinstance(e.stderr, bytes) else str(e.stderr)
        log(f"Git push xatoligi: {err}")
        return False
    except Exception as e:
        log(f"Git xatoligi: {e}")
        return False

def run_push_now(note=None):
    """Bir martalik yangilash va push qilish"""
    cur_ver = get_current_version()
    new_ver = bump_version(cur_ver)
    if not note:
        note = f"Claude AI avtomatik sinxronizatsiya va model yangilanishi"

    log(f"Joriy versiya: {cur_ver} -> Yangi versiya: {new_ver}")
    package_update(new_ver, note)
    sync_to_installed(STUDIO_DIR)
    ok = git_push_updates(new_ver, note)
    if ok:
        log(f"✅ Barcha 4 ta kompyuter endi v{new_ver} yangilanishini avtomatik oladi!")
    return ok

def get_dir_mtime_hash():
    """Fayllar o'zgarganini tezkor aniqlash uchun mtime xeshi"""
    mtimes = []
    watch_dirs = [STUDIO_DIR / "custom", STUDIO_DIR / "tools", STUDIO_DIR]
    for d in watch_dirs:
        if not d.exists():
            continue
        for p in d.glob("*.*"):
            if p.suffix in [".js", ".html", ".json", ".dxf", ".svg"] and "dist_update" not in str(p):
                try:
                    mtimes.append(f"{p.name}:{p.stat().st_mtime}")
                except Exception:
                    pass
    return hash("".join(sorted(mtimes)))

def watch_mode():
    """Fayllar o'zgarishini orqa fonda kuzatib, avtomatik push qilish rejim"""
    log("=" * 60)
    log("CLAUDE AI AVTOMATIK KUZATUVCHI REJIMI ISHGA TUSHDI")
    log("Claude yoki siz faylni saqlashingiz bilan 3 soniya ichida")
    log("versiya oshirilib, GitHub'ga avtomatik push qilinadi!")
    log("To'xtatish uchun: Ctrl + C bosing")
    log("=" * 60)

    last_hash = get_dir_mtime_hash()

    while True:
        try:
            time.sleep(2)
            cur_hash = get_dir_mtime_hash()
            if cur_hash != last_hash:
                log("Fayllarda o'zgarish aniqlandi! Claude yangi kod yoki model kiritdi.")
                time.sleep(2) # fayl to'liq yozilib bo'lishini kutish
                run_push_now("Claude AI tomonidan fayllar yangilandi")
                last_hash = get_dir_mtime_hash()
        except KeyboardInterrupt:
            log("Kuzatuvchi to'xtatildi.")
            break
        except Exception as e:
            log(f"Kuzatuvchi xatosi: {e}")
            time.sleep(3)

def pull_mode():
    """Boshqa kompyuterlarda GitHub'dan eng so'nggi versiyani qabul qilish"""
    try:
        log("GitHub'dan yangilanishlar tekshirilmoqda...")
        subprocess.run(["git", "pull", "origin", "main"], cwd=str(ROOT_DIR), check=True)
        sync_to_installed(STUDIO_DIR)
        log("✅ Kompyuteringiz eng so'nggi versiyaga yangilandi!")
    except Exception as e:
        log(f"Pull xatoligi: {e}")

if __name__ == "__main__":
    cmd = sys.argv[1].lower() if len(sys.argv) > 1 else "push"
    if cmd in ["--watch", "-w", "watch"]:
        watch_mode()
    elif cmd in ["--pull", "-p", "pull"]:
        pull_mode()
    else:
        note_arg = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
        run_push_now(note_arg)
