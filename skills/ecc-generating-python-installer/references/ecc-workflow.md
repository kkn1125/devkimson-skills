
# Generating Python Installer (Commercial-Grade)

You are a **Python commercial deployment expert**. Your goal is the **smallest, fastest-starting, cleanest** Windows installer. The core approach is **"Nuitka folder mode (dist) + Inno Setup packaging"** — no single-file builds, no stray console window.

## When to Activate

Activate when the user explicitly asks for **advanced** Python packaging or size/startup optimization on Windows:

- Nuitka extreme / commercial-grade compilation, smallest-size or fastest-startup builds
- `dist` folder slimming, DLL footprint analysis, 32-bit vs 64-bit size tradeoffs
- Inno Setup packaging with full metadata and a clean, residue-free uninstall

This skill targets advanced size/startup optimization — not basic one-file "script to exe" conversion.

## How It Works

1. **Confirm build parameters** — app name, version, publisher, exe name, source/output dirs, icon. Never auto-fill; ask the user.
2. **Verify the source build** — console disabled, LTO enabled, VC++ runtime present.
3. **Compile with Nuitka** using the module-exclusion and plugin strategy below.
4. **Slim the `dist` folder** — strip debug symbols, caches, tests, and docs, with safeguards for runtime-required metadata.
5. **Analyze DLLs** to find and trim the largest dependencies.
6. **Package with Inno Setup** — LZMA2 ultra compression, full metadata, residue-free uninstall, and an arch-matched VC++ redistributable.

## Examples

- "Use Nuitka to make the smallest commercial installer for this PySide2 project" → run the full workflow: recommend 32-bit, exclude WebEngine/3D/Charts, slim `dist`, package with Inno Setup.
- "My exe is 400 MB; how can I cut it in half?" → analyze DLLs, switch to `opencv-python-headless`, drop `opengl32sw`, apply `dist` slimming.
- "The app will not open on a clean system after installation" → ensure the matching-arch VC++ redistributable is bundled in the Inno Setup script.

---

## Core Approach

Use **"Nuitka folder mode (dist) + Inno Setup packaging"**. Avoid single-file builds and unwanted console windows.

---

## Reference Case (Production PySide2 Desktop App, 323 MB, with OpenCV / Playwright)

### Project Overview
- **Total size**: 323 MB
- **Packaging tool**: PyInstaller 4.7 (32-bit)
- **Main dependencies**: PySide2 (22.52 MB), OpenCV (62.38 MB), Playwright (76.74 MB)
- **Python version**: Python 3.8 (32-bit)
- **DLL count**: 71 files, totaling 93.23 MB

### Key Optimization Strategies
1. PASS: **Use 32-bit Python** → reduce size by 20-30%
2. PASS: **Compress the standard library in base_library.zip** → 0.74 MB
3. PASS: **Exclude unnecessary modules** → no pytest/unittest/setuptools
4. PASS: **Trim Qt plugins** → retain only required plugins

### Size Breakdown

| Component | Size | Share | Optimization |
|------|------|------|---------|
| playwright | 76.74 MB | 23.8% | Remove if unnecessary |
| OpenCV | 62.38 MB | 19.3% | Use opencv-python-headless |
| PySide2 | 22.52 MB | 7.0% | Exclude WebEngine/3D/Charts |
| Other dependencies | 161.36 MB | 49.9% | - |

### Expected Results Compared

| Project type | Original Nuitka build | Optimized | Reference measurement |
|---------|------------|--------|----------------|
| Tkinter + standard library | 150-250 MB | **80-120 MB** | - |
| PyQt/PySide | 200-400 MB | **120-250 MB** | 323 MB (including OpenCV and others) |
| With numpy/pandas | 300-600 MB | **180-350 MB** | - |

---

## Core Workflow - WARNING: Follow Strictly

When the user requests packaging, follow these steps:

**Step 1: Required Parameter Confirmation (FAIL: Do Not Assume Defaults)**

> **WARNING: Confirm each parameter below with the user; do not fill them automatically or assume defaults.**

Ask for and confirm the following information (*wait for the user's explicit reply before continuing*):

| Parameter | Description | Example |
|------|------|------|
| **App Name** | Display name | `Red Ink Annotation` |
| **Version** | Semantic version | `1.0.0` |
| **Publisher** | Publisher shown in Control Panel | `YourCompany` |
| **Exe Name** | Main executable filename | `RedInk.exe` |
| **Source Dir** | Absolute path to the Nuitka dist folder | `D:\project\dist` |
| **Output Dir** | Installer output directory | `D:\project\output` |
| **Icon Path** | Absolute .ico path (optional but recommended) | `D:\project\icon.ico` |
| **URL** | Optional website link for Control Panel | `https://example.com` |

**Question template:**
> "Please provide and confirm these packaging parameters:
> 1. App name:
> 2. Version:
> 3. Publisher/company:
> 4. Main executable filename (such as xxx.exe):
> 5. Source path (Nuitka dist folder):
> 6. Output path (installer destination):
> 7. Icon path (.ico; may be blank):
> 8. Website URL (may be blank):
>
> Fill each field, or reply \"skip\" to leave it empty."

**Step 2: Source Quality and Compilation Checks (Critical)**
Before generating code, request these **critical confirmations** because Inno Setup packages the app but cannot change its runtime properties:

> "WARNING: **Compilation settings check**:
> 1. **No console window**: Confirm that the dist folder was built with `nuitka --windows-console-mode=disable`; otherwise the console window will still appear after installation.
> 2. **Performance**: Confirm that `--lto=yes` was used; otherwise startup may be slower than intended.
> 3. **Runtime libraries**: Ensure the dist folder includes the required VC++ runtime libraries so the app can run on a clean system.
>
> **Reply \"confirmed\" when the source build is ready; otherwise rebuild it first.**"

**Step 3: Generate Code**
After confirmation, output code with **complete metadata** and the **uninstall icon fix**.

---

## Optimized Nuitka Compilation (Reference Project Experience)

### 1. Choosing 32-bit or 64-bit

**Why the reference project used 32-bit Python**:

| Component | 64-bit size | 32-bit size | Savings |
|------|---------|---------|------|
| python3x.dll | ~4.5 MB | ~3.8 MB | 15% |
| Qt5Core.dll | ~8 MB | ~5 MB | 37% |
| numpy | ~30 MB | ~20 MB | 33% |
| **Overall** | Baseline | **-20~30%** | - |

**When to consider 32-bit**:
- PASS: App memory use is below 2 GB
- PASS: The app does not process very large files (below 2 GB)
- PASS: Target users have ordinary office computers

**32-bit compilation**:
```bash
# 1. Install 32-bit Python (it can coexist with 64-bit Python)
# Download: https://www.python.org/downloads/windows/

# 2. Install dependencies with 32-bit Python
py -3.12-32 -m pip install -r requirements.txt

# 3. Compile with 32-bit Python
py -3.12-32 -m nuitka --standalone ...YOUR_ARGUMENTS
```

### 2. Module Exclusions (Validated in the Reference Project)

**Safe exclusions** (not required at runtime):
```
unittest,test,pytest,_pytest,doctest,pdb,pdbpp,
setuptools,pip,distutils,pkg_resources,
email.mime,http.server,xmlrpc,pydoc
```

**Expected savings**: **30-50 MB**

### 3. GUI Framework Optimizations

#### Tkinter Optimization (Recommended, Smallest Footprint)
```bash
nuitka --standalone --windows-console-mode=disable ^
    --lto=yes ^
    --jobs=8 ^
    --enable-plugin=tk-inter ^
    --enable-plugin=anti-bloat ^
    --noinclude-pytest-mode=nofollow ^
    --noinclude-setuptools-mode=nofollow ^
    --nofollow-import-to=unittest,test,pytest,_pytest,doctest,pdb,pdbpp ^
    --nofollow-import-to=setuptools,pip,distutils,pkg_resources ^
    --nofollow-import-to=email.mime,http.server,xmlrpc,pydoc ^
    --python-flag=no_docstrings ^
    --output-dir=dist ^
    --windows-icon-from-ico=icon.ico ^
    --remove-output ^
    main.py
```

**Expected optimized size**: 80-120 MB

#### PyQt5 / PySide2 Optimization
```bash
nuitka --standalone --windows-console-mode=disable ^
    --lto=yes ^
    --jobs=8 ^
    --enable-plugin=pyqt5 ^
    --enable-plugin=anti-bloat ^
    --noinclude-pytest-mode=nofollow ^
    --noinclude-setuptools-mode=nofollow ^
    --nofollow-import-to=unittest,test,pytest,_pytest,doctest,pdb ^
    --nofollow-import-to=setuptools,pip,distutils,pkg_resources ^
    --nofollow-import-to=PyQt5.QtWebEngine,PyQt5.QtWebEngineWidgets ^
    --nofollow-import-to=PyQt5.Qt3D,PyQt5.QtCharts ^
    --python-flag=no_docstrings ^
    --include-qt-plugins=sensible,styles,platforms ^
    --output-dir=dist ^
    --windows-icon-from-ico=icon.ico ^
    --remove-output ^
    main.py
```

**Expected optimized size**: 120-250 MB

### 4. One-Step Build Script Template

**Save as `build_optimized.bat` in the project root**:

```batch
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo Optimized Nuitka compilation (reference project strategy)
echo ========================================

REM === Configuration: replace with your actual values ===
set APP_NAME=YourAppName
set MAIN_FILE=main.py
set ICON_FILE=icon.ico

REM === Detect CPU core count ===
REM Use the built-in Windows environment variable; wmic was removed in Win11 22H2+, and a missing count could produce --jobs=0.
set CPU_CORES=%NUMBER_OF_PROCESSORS%
if not defined CPU_CORES set CPU_CORES=4
set /a BUILD_JOBS=%CPU_CORES%

REM === Reference project module exclusions ===
set EXCLUDE_MODULES=unittest,test,pytest,_pytest,doctest,pdb,pdbpp
set EXCLUDE_MODULES=%EXCLUDE_MODULES%,setuptools,pip,distutils,pkg_resources
set EXCLUDE_MODULES=%EXCLUDE_MODULES%,email.mime,http.server,xmlrpc,pydoc

echo.
echo [1/4] Cleaning previous build...
if exist dist rd /s /q dist
if exist build rd /s /q build

echo.
echo [2/4] Compiling with Nuitka (reference project optimizations)...
echo - CPU cores: %CPU_CORES% (using %BUILD_JOBS% workers)
echo - Module exclusions: %EXCLUDE_MODULES%
echo.

nuitka --standalone ^
    --windows-console-mode=disable ^
    --lto=yes ^
    --jobs=%BUILD_JOBS% ^
    --enable-plugin=anti-bloat ^
    --enable-plugin=tk-inter ^
    --noinclude-pytest-mode=nofollow ^
    --noinclude-setuptools-mode=nofollow ^
    --nofollow-import-to=%EXCLUDE_MODULES% ^
    --python-flag=no_docstrings ^
    --output-dir=dist ^
    --windows-icon-from-ico=%ICON_FILE% ^
    --remove-output ^
    %MAIN_FILE%

if %errorlevel% neq 0 (
    echo.
    echo [Error] Compilation failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Measuring build output...
for /f %%a in ('powershell -NoProfile -Command "(Get-ChildItem -LiteralPath 'dist\%APP_NAME%.dist' -Recurse -File | Measure-Object -Property Length -Sum).Sum"') do set TOTAL_SIZE=%%a
set TOTAL_SIZE=%TOTAL_SIZE:,=%
set /a SIZE_MB=%TOTAL_SIZE% / 1048576
echo - Compiled size: %SIZE_MB% MB

echo.
echo [4/4] Slimming dist (reference project strategy)...
powershell -ExecutionPolicy Bypass -File slim_dist.ps1 -DistPath "dist\%APP_NAME%.dist"

echo.
echo ========================================
echo Compilation complete!
echo ========================================
pause
```

### 5. Dist Slimming Script (Reference Project Cleanup)

**Save as `slim_dist.ps1` beside build_optimized.bat**:

```powershell
param(
    [string]$DistPath
)

$ErrorActionPreference = "Continue"  # Show deletion failures rather than silently reporting success.

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "dist slimming (reference project strategy)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Test-Path $DistPath)) {
    Write-Host "[Error] Directory not found: $DistPath" -ForegroundColor Red
    exit 1
}

# Measure initial size
$InitialSize = (Get-ChildItem -Path $DistPath -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "`nInitial size: $([math]::Round($InitialSize, 2)) MB" -ForegroundColor Yellow

# Reference project profile: no .pdb, .pyi, __pycache__, or test directories
Write-Host "`n[Applying the reference project cleanup strategy...]" -ForegroundColor Green

# 1. Remove debug symbols
Write-Host "`n[1/7] Removing .pdb debug symbols..." -ForegroundColor Green
$pdbFiles = Get-ChildItem -Path $DistPath -Recurse -Include *.pdb -File
$pdbSize = ($pdbFiles | Measure-Object -Property Length -Sum).Sum / 1MB
if ($pdbFiles.Count -gt 0) {
    $pdbFiles | Remove-Item -Force
    Write-Host "  Removed $($pdbFiles.Count) files; saved $([math]::Round($pdbSize, 2)) MB"
} else {
    Write-Host "  No .pdb files found (already optimized)" -ForegroundColor Gray
}

# 2. Remove type hints
Write-Host "`n[2/7] Removing .pyi type hints..." -ForegroundColor Green
$pyiFiles = Get-ChildItem -Path $DistPath -Recurse -Include *.pyi -File
$pyiSize = ($pyiFiles | Measure-Object -Property Length -Sum).Sum / 1MB
if ($pyiFiles.Count -gt 0) {
    $pyiFiles | Remove-Item -Force
    Write-Host "  Removed $($pyiFiles.Count) files; saved $([math]::Round($pyiSize, 2)) MB"
} else {
    Write-Host "  No .pyi files found (already optimized)" -ForegroundColor Gray
}

# 3. Remove __pycache__
Write-Host "`n[3/7] Removing __pycache__ caches..." -ForegroundColor Green
$pycacheDirs = Get-ChildItem -Path $DistPath -Recurse -Directory -Filter "__pycache__"
$pycacheSize = 0
foreach ($dir in $pycacheDirs) {
    $size = (Get-ChildItem -Path $dir.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $pycacheSize += $size
    Remove-Item -Path $dir.FullName -Recurse -Force
}
if ($pycacheDirs.Count -gt 0) {
    Write-Host "  Removed $($pycacheDirs.Count) directories; saved $([math]::Round($pycacheSize / 1MB, 2)) MB"
} else {
    Write-Host "  No __pycache__ directories found (already optimized)" -ForegroundColor Gray
}

# 4. Remove test directories
Write-Host "`n[4/7] Removing test/tests directories..." -ForegroundColor Green
$testDirs = Get-ChildItem -Path $DistPath -Recurse -Directory | Where-Object { $_.Name -match '^tests?$' }
$testSize = 0
foreach ($dir in $testDirs) {
    $size = (Get-ChildItem -Path $dir.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $testSize += $size
    Remove-Item -Path $dir.FullName -Recurse -Force
}
if ($testDirs.Count -gt 0) {
    Write-Host "  Removed $($testDirs.Count) directories; saved $([math]::Round($testSize / 1MB, 2)) MB"
} else {
    Write-Host "  No test directories found (already optimized)" -ForegroundColor Gray
}

# 5. Remove documentation and examples
Write-Host "`n[5/7] Removing docs/examples directories..." -ForegroundColor Green
$docDirs = Get-ChildItem -Path $DistPath -Recurse -Directory | Where-Object { $_.Name -match '^(docs|examples|samples|demo)$' }
$docSize = 0
foreach ($dir in $docDirs) {
    $size = (Get-ChildItem -Path $dir.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $docSize += $size
    Remove-Item -Path $dir.FullName -Recurse -Force
}
if ($docDirs.Count -gt 0) {
    Write-Host "  Removed $($docDirs.Count) directories; saved $([math]::Round($docSize / 1MB, 2)) MB"
} else {
    Write-Host "  No documentation directories found (already optimized)" -ForegroundColor Gray
}

# 6. Remove .pyc files
Write-Host "`n[6/7] Removing .pyc bytecode..." -ForegroundColor Green
$pycFiles = Get-ChildItem -Path $DistPath -Recurse -Include *.pyc -File
$pycSize = ($pycFiles | Measure-Object -Property Length -Sum).Sum / 1MB
if ($pycFiles.Count -gt 0) {
    $pycFiles | Remove-Item -Force
    Write-Host "  Removed $($pycFiles.Count) files; saved $([math]::Round($pycSize, 2)) MB"
} else {
    Write-Host "  No .pyc files found (already optimized)" -ForegroundColor Gray
}

# 7. Trim .dist-info metadata
Write-Host "`n[7/7] Trimming .dist-info metadata..." -ForegroundColor Green
$distInfoDirs = Get-ChildItem -Path $DistPath -Recurse -Directory -Filter "*.dist-info"
$removedCount = 0
$removedSize = 0
foreach ($infoDir in $distInfoDirs) {
    # Remove installation bookkeeping only; retain METADATA and entry_points.txt used by importlib.metadata for plugin discovery.
    $filesToRemove = @("RECORD", "INSTALLER", "direct_url.json")
    foreach ($fileName in $filesToRemove) {
        $file = Join-Path $infoDir.FullName $fileName
        if (Test-Path $file) {
            $size = (Get-Item $file).Length
            $removedSize += $size
            Remove-Item $file -Force
            $removedCount++
        }
    }
}
if ($removedCount -gt 0) {
    Write-Host "  Removed $removedCount metadata files; saved $([math]::Round($removedSize / 1MB, 2)) MB"
} else {
    Write-Host "  No removable metadata found (already optimized)" -ForegroundColor Gray
}

# Measure final size
$FinalSize = (Get-ChildItem -Path $DistPath -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
$SavedSize = $InitialSize - $FinalSize
$SavedPercent = if ($InitialSize -gt 0) { ($SavedSize / $InitialSize) * 100 } else { 0 }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Initial size: $([math]::Round($InitialSize, 2)) MB" -ForegroundColor Yellow
Write-Host "Final size: $([math]::Round($FinalSize, 2)) MB" -ForegroundColor Green
Write-Host "Space saved: $([math]::Round($SavedSize, 2)) MB ($([math]::Round($SavedPercent, 1))%)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Compare with the reference project
Write-Host "[Reference comparison]" -ForegroundColor Yellow
Write-Host "Reference project total: 323 MB (including PyQt, OpenCV, Playwright and other large libraries)" -ForegroundColor Gray
Write-Host "For Tkinter plus the standard library, aim for 80-150 MB" -ForegroundColor Gray
```

**Expected savings**: **15-30%** of the build size

### 6. DLL Dependency Analyzer

**Save as `analyze_dlls.py` to identify the largest files**:

```python
"""
DLL dependency analyzer
Uses the reference project's DLL management strategy to identify large files and suggest optimizations.
"""
import sys
from pathlib import Path

def analyze_dlls(dist_path: str):
    """Analyze DLL dependencies in the dist directory."""
    dist_dir = Path(dist_path)

    if not dist_dir.exists():
        print(f"[Error] Directory does not exist: {dist_path}")
        return

    print("=" * 70)
    print("DLL dependency analysis (reference project strategy)")
    print("=" * 70)

    # Collect all DLLs
    dll_files = list(dist_dir.rglob("*.dll"))

    if not dll_files:
        print("\nNo DLL files found")
        return

    # Sort by size
    dll_data = [(dll, dll.stat().st_size) for dll in dll_files]
    dll_data.sort(key=lambda x: x[1], reverse=True)

    total_size = sum(size for _, size in dll_data)

    print(f"\nTotal DLL count: {len(dll_files)}")
    print(f"Total DLL size: {total_size / 1024 / 1024:.2f} MB\n")

    # Compare with the reference project
    print("[Reference comparison] Reference project DLLs:")
    print("  - Total count: 71")
    print("  - Total size: 93.23 MB")
    print("  - Largest: libopenblas (26.85 MB), opengl32sw (15.25 MB)\n")

    # Analyze DLLs larger than 3 MB
    large_dlls = [(dll, size) for dll, size in dll_data if size > 3 * 1024 * 1024]

    if large_dlls:
        print("=" * 70)
        print("WARNING: DLLs larger than 3 MB (review these first)")
        print("=" * 70)

        for dll, size in large_dlls:
            size_mb = size / 1024 / 1024
            relative_path = dll.relative_to(dist_dir)
            name_lower = dll.name.lower()

            print(f"\n{size_mb:8.2f} MB  {dll.name}")
            print(f"           Location: {relative_path.parent}")

            # Optimization suggestions
            suggestions = get_optimization_suggestion(name_lower)
            if suggestions:
                for suggestion in suggestions:
                    print(f"            {suggestion}")

    # Check for redundant DLLs
    print("\n" + "=" * 70)
    print(" Redundancy check")
    print("=" * 70)

    # Check for debug builds
    debug_dlls = [dll for dll, _ in dll_data if dll.stem.endswith('d')]
    if debug_dlls:
        print(f"\nWARNING: Found {len(debug_dlls)} debug DLLs (removable):")
        for dll in debug_dlls:
            print(f"  - {dll.name}")
    else:
        print("\nPASS: No debug DLLs found (already optimized)")

    # VC++ Runtime
    vc_runtimes = [dll for dll, _ in dll_data if 'vcruntime' in dll.name.lower() or 'msvcp' in dll.name.lower()]
    if vc_runtimes:
        print(f"\n[VC++ Runtime libraries] Found {len(vc_runtimes)}:")
        for dll in vc_runtimes:
            size_mb = dll.stat().st_size / 1024 / 1024
            print(f"  - {dll.name} ({size_mb:.2f} MB)")
        print("   These are required; the reference project includes them too")

    # Complete DLL list
    print("\n" + "=" * 70)
    print(" Complete DLL list (20 largest files)")
    print("=" * 70)
    print(f"\n{'Size (MB)':>10}  {'Filename':<30}  Location")
    print("-" * 70)

    for dll, size in dll_data[:20]:
        size_mb = size / 1024 / 1024
        relative_path = dll.relative_to(dist_dir)
        location = str(relative_path.parent) if relative_path.parent != Path('.') else "root directory"
        print(f"{size_mb:10.2f}  {dll.name:<30}  {location}")

    if len(dll_data) > 20:
        remaining_size = sum(size for _, size in dll_data[20:]) / 1024 / 1024
        print(f"... {len(dll_data) - 20} more DLLs, totaling {remaining_size:.2f} MB")


def get_optimization_suggestion(dll_name: str) -> list:
    """Suggest optimizations based on the DLL name."""
    suggestions = []

    if "openblas" in dll_name or "mkl" in dll_name:
        suggestions.append("Math library; the reference project's libopenblas is 26.85 MB")
        suggestions.append("Consider a lighter alternative if high-performance computation is unnecessary")

    elif "opencv" in dll_name or "ffmpeg" in dll_name:
        suggestions.append("OpenCV library; the reference project's opencv_videoio_ffmpeg is 18.48 MB")
        suggestions.append("Consider opencv-python-headless")

    elif "qt5" in dll_name or "qt6" in dll_name or "pyside" in dll_name:
        suggestions.append("Qt library; the reference project's Qt5Core is 5.13 MB")
        suggestions.append("Exclude unused modules (WebEngine, 3D, Charts)")

    elif "opengl" in dll_name and "sw" in dll_name:
        suggestions.append("OpenGL software renderer; the reference project retains 15.25 MB")
        suggestions.append("Usually removable when using hardware rendering")

    elif "d3dcompiler" in dll_name:
        suggestions.append("DirectX compiler; the reference project includes 3.53 MB")

    elif "mfc140" in dll_name:
        suggestions.append("MFC library; the reference project includes 4.89 MB")

    return suggestions


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_dlls.py <dist-directory>")
        print("Example: python analyze_dlls.py dist/main.dist")
        sys.exit(1)

    analyze_dlls(sys.argv[1])
```

**Usage**:
```bash
python analyze_dlls.py dist/YourAppName.dist
```

---

## Complete Optimization Workflow

### Step 1: Configure the Build Script

Edit these three lines in `build_optimized.bat`:

```batch
set APP_NAME=YourAppName      REM Replace with your app name
set MAIN_FILE=main.py        REM Your main entry point
set ICON_FILE=icon.ico       REM Your icon file
```

### Step 2: Build and Slim in One Step

```bash
# Run in the project root
build_optimized.bat
```

### Step 3: Analyze DLL Dependencies

```bash
python analyze_dlls.py dist/YourAppName.dist
```

### Step 4: Optimize Based on the Analysis

**If using OpenCV** → switch to the headless package
```bash
pip uninstall opencv-python
pip install opencv-python-headless
```

**If using Qt** → exclude unnecessary modules
```batch
# Add to the compilation command
--nofollow-import-to=PyQt5.QtWebEngine,PyQt5.Qt3D,PyQt5.QtCharts
```

**Remove the software renderer** (if unnecessary)
```powershell
# Run in the dist directory
Remove-Item "opengl32sw.dll" -Force
```

---

## VC++ Runtime Strategies

### Option 1: Static Linking (Recommended)
```bash
nuitka --static-libpython=yes ...
```

### Option 2: Bundle the Runtime Installer (Recommended for Commercial Distribution)
Add to the Inno Setup script:

```iss
; WARNING: Match the VC++ runtime architecture to the Python/Nuitka build.
; This skill recommends 32-bit Python, so the default is vc_redist.x86.exe;
; for a 64-bit Python build, change both occurrences below to vc_redist.x64.exe.
[Files]
Source: "{#MySourceDir}\..\vc_redist.x86.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Run]
Filename: "{tmp}\vc_redist.x86.exe"; Parameters: "/quiet /norestart"; StatusMsg: "Installing runtime libraries..."; Flags: waituntilterminated
```

> Download: [Microsoft Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)

---

## Complete Inno Setup Script Template

```iss
; =====================================================================
; WARNING: Commercial Python installer script (Inno Setup 6.x)
; Features: LZMA2 compression | Complete metadata | Residue-free uninstall
; Reference: the 323 MB project with LZMA2 compression
; =====================================================================

; --- 1. Parameter definitions ---
#define MyAppName        "{{APP_NAME}}"
#define MyAppVersion     "{{APP_VERSION}}"
#define MyAppPublisher   "{{PUBLISHER}}"
#define MyAppURL         "{{APP_URL}}"
#define MyAppExeName     "{{EXE_NAME}}"
#define MySourceDir      "{{SOURCE_DIR}}"
#define MyOutputDir      "{{OUTPUT_DIR}}"
;#define MyIconPath      "{{ICON_PATH}}"

[Setup]
; --- Identity ---
AppId={{GENERATE_RANDOM_GUID}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; --- Installation path and permissions ---
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableDirPage=no
DisableProgramGroupPage=no
PrivilegesRequired=admin

; --- Output settings ---
OutputDir={#MyOutputDir}
OutputBaseFilename=Setup_{#MyAppName}_v{#MyAppVersion}

; --- Visual presentation ---
WizardStyle=modern
#ifdef MyIconPath
SetupIconFile={#MyIconPath}
UninstallDisplayIcon={app}\{#MyAppExeName}
#endif

; --- Compression (reference project strategy) ---
Compression=lzma2/ultra64
SolidCompression=yes
LZMAUseSeparateProcess=yes

; --- Architecture ---
; Enable this only for 64-bit installation mode with a 64-bit Python build.
; For 32-bit builds, leave it commented to match the bundled vc_redist.x86.exe.
; Uncomment only when compiling with 64-bit Python.
;ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "{#MySourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[UninstallDelete]
Type: filesandordirs; Name: "{app}\*"

[Icons]
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppName}}"; Flags: nowait postinstall skipifsilent
```

---

## Placeholders

| Placeholder | Description | Example |
|--------|------|--------|
| `{{APP_NAME}}` | App display name | `Red Ink Annotation` |
| `{{APP_VERSION}}` | Version | `1.0.0` |
| `{{PUBLISHER}}` | Publisher/company | `MyCompany` |
| `{{APP_URL}}` | Website URL | `https://example.com` |
| `{{EXE_NAME}}` | Main executable filename | `RedInk.exe` |
| `{{SOURCE_DIR}}` | Nuitka dist folder | `D:\project\dist\RedInk.dist` |
| `{{OUTPUT_DIR}}` | Installer output directory | `D:\project\output` |
| `{{ICON_PATH}}` | Icon file | `D:\project\icon.ico` |
| `{{GENERATE_RANDOM_GUID}}` | **Generate a unique GUID** | Inno Setup "Tools > Generate GUID" |

---

## Frequently Asked Questions

### Q1: Nothing happens when I launch the installed app?
1. Run the executable manually in CMD to see errors
2. Check for missing VC++ runtime libraries
3. Confirm that Nuitka compilation succeeded

### Q2: The installer is too large?
**Optimization options**:
1. Compile with 32-bit Python (20-30% savings)
2. Apply the reference project's module exclusions
3. Enable the Anti-Bloat plugin
4. Run the dist slimming script
5. Analyze DLLs and remove unnecessary large files

### Q3: Antivirus false positives?
**Options**:
- Submit the app to major antivirus vendors for allowlisting
- Purchase a code-signing certificate (recommended: Sectigo, DigiCert)
- Avoid UPX compression

### Q4: Windows reports that it protected your PC during installation?
- Purchase an EV code-signing certificate (the reference claims immediate trust)
- Standard code-signing certificates build reputation gradually with installation volume

---

## Troubleshooting Notes (Updated 2026-02-07)

- **Missing python3xx.dll after installation**: use Nuitka `--standalone`; ensure the DLL exists in dist; avoid single-file builds.
- **No response on launch**: heavy dependencies may block GUI startup; defer imports until "Start export" and add diagnostic logging.
- **Nuitka + MinGW errors on non-ASCII paths**: copy source to an ASCII path before compilation and set `PYTHONIOENCODING=utf-8`.
- **Inno Setup warns that `x64` is deprecated (64-bit builds requiring 64-bit installation mode)**: use `ArchitecturesInstallIn64BitMode=x64compatible`; 32-bit builds do not need this setting.
- **`--disable-console` is deprecated**: use `--windows-console-mode=disable`.
- **Unexpected `_nuitka_temp.exe` in dist**: exclude it in [Files].

---

## Expected Optimization Results

| Optimization | Size reduction | Startup improvement | Risk |
|----------|----------|----------|----------|
| Basic compilation | Baseline | Baseline | None |
| + `--lto=yes` | 5-10% | 10-20% | PASS: None |
| + anti-bloat | 15-25% | - | PASS: None |
| + module exclusions | 20-35% | 5% | PASS: None |
| + dist slimming | 25-40% | - | PASS: None |
| + 32-bit build | 40-60% | - | PASS: None |
| **All combined** | **45-65%** | **15-25%** | PASS: **No risk** |

> WARNING: **UPX compression is not recommended**; it can reduce size further but is likely to trigger antivirus false positives.

---

**Optimizations based on the reference project's production experience for building commercial installers.**
