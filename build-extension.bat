@echo off
REM Build script for Chrome Extension packaging (Windows)
REM This script prepares the extension for Chrome Web Store submission

echo.
echo ======================================
echo MapLeads AI - Extension Packaging
echo ======================================
echo.

setlocal enabledelayedexpansion

REM Configuration
set EXTENSION_DIR=google-maps-easy-scrape
set EXTENSION_NAME=mapleads-ai-extension
set PRIVACY_POLICY_URL=https://mapleads-ai.render.com/privacy-policy.html

echo [Step 1] Validating Extension Files
echo -----------------------------------

REM Check required files
set "files_ok=1"
for %%f in (manifest.json popup.html popup.js background.js content.js) do (
    if exist "%EXTENSION_DIR%\%%f" (
        echo [OK] %%f
    ) else (
        echo [ERROR] %%f - MISSING
        set "files_ok=0"
    )
)

for %%f in (images\icon-16.png images\icon-48.png images\icon-128.png) do (
    if exist "%EXTENSION_DIR%\%%f" (
        echo [OK] %%f
    ) else (
        echo [ERROR] %%f - MISSING
        set "files_ok=0"
    )
)

if %files_ok%==0 (
    echo.
    echo ERROR: Some required files are missing!
    pause
    exit /b 1
)

echo.
echo [Step 2] Validating manifest.json
echo --------------------------------

REM Simple JSON validation
findstr /M "manifest_version" "%EXTENSION_DIR%\manifest.json" >nul
if %errorlevel% equ 0 (
    echo [OK] manifest.json is valid
) else (
    echo [ERROR] manifest.json appears invalid
    pause
    exit /b 1
)

REM Extract version from manifest.json
for /f "tokens=2 delims=: " %%a in ('findstr "version" "%EXTENSION_DIR%\manifest.json" ^| findstr /v /c:"manifest_version" ^| head -1') do (
    set VERSION=%%a
)
set VERSION=%VERSION:~1,-1%
echo [OK] Version: %VERSION%

set OUTPUT_ZIP=%EXTENSION_NAME%-%VERSION%.zip

echo.
echo [Step 3] Creating ZIP Package
echo ----------------------------

REM Create ZIP file using PowerShell (Windows 10+)
echo Compressing files...

powershell -Command ^
    if (Test-Path '!OUTPUT_ZIP!') { Remove-Item '!OUTPUT_ZIP!' }; ^
    $ProgressPreference = 'SilentlyContinue'; ^
    Compress-Archive -Path '%EXTENSION_DIR%' -DestinationPath '!OUTPUT_ZIP!' -CompressionLevel Optimal; ^
    $size = (Get-Item '!OUTPUT_ZIP!').Length / 1MB; ^
    Write-Host "Created: !OUTPUT_ZIP! ({0:F2} MB)" -f $size

echo [OK] ZIP file created: !OUTPUT_ZIP!

echo.
echo [Step 4] Verifying ZIP Contents
echo -------------------------------

powershell -Command ^
    if (Test-Path '!OUTPUT_ZIP!') { ^
        Add-Type -AssemblyName 'System.IO.Compression'; ^
        $zip = [System.IO.Compression.ZipFile]::OpenRead('!OUTPUT_ZIP!'); ^
        Write-Host "ZIP contents:"; ^
        foreach ($entry in $zip.Entries) { ^
            if ($entry.Length -gt 0) { ^
                Write-Host "  $($entry.FullName)"; ^
            } ^
        } ^
        $zip.Dispose(); ^
    }

echo.
echo ======================================
echo [OK] Package Created Successfully!
echo ======================================
echo.
echo Information:
echo   ZIP File: !OUTPUT_ZIP!
echo   Version: %VERSION%
echo   Location: %cd%\!OUTPUT_ZIP!
echo.
echo Privacy Policy: %PRIVACY_POLICY_URL%
echo.
echo Next Steps:
echo   1. Upload !OUTPUT_ZIP! to Chrome Web Store
echo   2. Verify Privacy Policy URL is live
echo   3. Fill in extension details
echo   4. Submit for review
echo.
echo Chrome Web Store:
echo   https://chrome.google.com/webstore/devconsole
echo.

pause
