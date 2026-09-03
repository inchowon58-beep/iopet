@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [1/2] 의존성 설치...
python -m pip install -q -r requirements.txt pyinstaller
if errorlevel 1 (
  echo pip 설치 실패
  exit /b 1
)

echo [2/2] 와일드쿤 웹문서생성기 빌드... (--windowed: 검은 콘솔 없음)
python -m PyInstaller --noconfirm --clean --windowed --name "와일드쿤웹문서생성기" ^
  --add-data "indexnow.py;." ^
  --add-data "blob_sync.py;." ^
  --add-data "blob-upload.mjs;." ^
  --add-data "project_paths.py;." ^
  --add-data "combo_queue.py;." ^
  --add-data "scheduler.py;." ^
  --add-data "settings_store.py;." ^
  --add-data "naver_register.py;." ^
  --add-data "content_gen.py;." ^
  --add-data "gemini_gen.py;." ^
  --add-data "nearby_geo.py;." ^
  --add-data "runtime.py;." ^
  --add-data "webui.py;." ^
  --add-data "chrome_ui.py;." ^
  --add-data "templates;templates" ^
  --add-data "naver_vm;naver_vm" ^
  --hidden-import "flask" ^
  --hidden-import "blob_sync" ^
  --hidden-import "project_paths" ^
  --hidden-import "indexnow" ^
  --hidden-import "combo_queue" ^
  --hidden-import "scheduler" ^
  --hidden-import "settings_store" ^
  --hidden-import "naver_register" ^
  --hidden-import "content_gen" ^
  --hidden-import "gemini_gen" ^
  --hidden-import "nearby_geo" ^
  --hidden-import "runtime" ^
  --hidden-import "webui" ^
  --hidden-import "chrome_ui" ^
  --hidden-import "undetected_chromedriver" ^
  --hidden-import "selenium" ^
  --hidden-import "google.genai" ^
  --collect-all "undetected_chromedriver" ^
  --collect-all "selenium" ^
  --collect-all "flask" ^
  --collect-all "google.genai" ^
  app.py
if errorlevel 1 (
  echo 빌드 실패
  exit /b 1
)

echo.
echo 완료: dist\와일드쿤웹문서생성기\와일드쿤웹문서생성기.exe
echo.
echo 실행 방법:
echo   1) 와일드쿤_웹문서생성기_실행.bat 더블클릭
echo   2) 또는 dist\와일드쿤웹문서생성기\와일드쿤웹문서생성기.exe
echo.
echo 완전 종료는 화면의 [프로그램 종료] 버튼.
exit /b 0
