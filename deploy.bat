@echo off
REM MapLeads AI - Windows Deployment Script
REM This script verifies your system is ready for deployment

echo.
echo ==========================================
echo MapLeads AI - Deployment Verification
echo ==========================================
echo.

REM Check Node.js
echo [Step 1] Checking Node.js Installation
echo -----------------------------------------------
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js is installed:
    node --version
) else (
    echo [ERROR] Node.js not found. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [Step 2] Checking Git Installation
echo -----------------------------------------------
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git is installed:
    git --version
) else (
    echo [WARNING] Git not found. You'll need Git to push to Render.
)

echo.
echo [Step 3] Checking Project Files
echo -----------------------------------------------

set files_ok=1
for %%f in (package.json server.js manifest.json) do (
    if exist "%%f" (
        echo [OK] %%f found
    ) else (
        if exist "google-maps-easy-scrape\%%f" (
            echo [OK] google-maps-easy-scrape\%%f found
        ) else (
            echo [ERROR] %%f not found
            set files_ok=0
        )
    )
)

for %%f in (
    "services\analytics.js"
    "public\privacy-policy.html"
    "RENDER_DEPLOYMENT_GUIDE.md"
    "CHROME_EXTENSION_PACKAGING.md"
) do (
    if exist "%%f" (
        echo [OK] %%f found
    ) else (
        echo [WARNING] %%f not found
    )
)

echo.
echo [Step 4] Checking Dependencies
echo -----------------------------------------------

if exist "node_modules" (
    echo [OK] node_modules directory exists
) else (
    echo [WARNING] node_modules not found. Run: npm install
)

if exist "package-lock.json" (
    echo [OK] package-lock.json found
) else (
    echo [WARNING] package-lock.json not found. Run: npm install
)

echo.
echo ==========================================
echo DEPLOYMENT READINESS
echo ==========================================
echo.

if %files_ok% equ 1 (
    echo [READY] Your project is ready for deployment!
    echo.
    echo NEXT STEPS:
    echo.
    echo 1. RENDER DEPLOYMENT:
    echo    • Create account: https://render.com
    echo    • Connect GitHub repository
    echo    • Set environment variables
    echo    • Deploy!
    echo.
    echo 2. CHROME WEB STORE:
    echo    • Build extension: build-extension.bat
    echo    • Create developer account: https://chrome.google.com/webstore/devconsole
    echo    • Upload ZIP file
    echo    • Submit for review
    echo.
    echo 3. LOCAL TESTING (optional):
    echo    • npm install
    echo    • npm start
    echo    • Visit: http://localhost:5000/admin/analytics.html
    echo.
    echo DOCUMENTATION:
    echo    • Render Guide: RENDER_DEPLOYMENT_GUIDE.md
    echo    • Extension Guide: CHROME_EXTENSION_PACKAGING.md
    echo    • Launch Checklist: FINAL_LAUNCH_CHECKLIST.md
    echo.
) else (
    echo [WARNING] Some files are missing. Please check above.
)

echo.
echo KEY URLS:
echo    Privacy Policy: https://mapleads-ai.render.com/privacy-policy.html
echo    Admin Dashboard: https://mapleads-ai.render.com/admin/analytics.html
echo    Real-Time Monitor: https://mapleads-ai.render.com/realtime-dashboard.html
echo.

pause
