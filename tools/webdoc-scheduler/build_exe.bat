@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [1/2] 의존성 설치...
python -m pip install -q -r requirements.txt
if errorlevel 1 (
  echo pip 설치 실패
  exit /b 1
)

echo [2/2] 웹문서 전체 스케줄러 빌드...
python -m PyInstaller --noconfirm --clean --windowed --name "웹문서전체스케줄러" ^
  --add-data "templates;templates" ^
  --hidden-import "flask" ^
  --hidden-import "orchestrator" ^
  --hidden-import "daily_scheduler" ^
  --hidden-import "settings_store" ^
  --hidden-import "process_kill" ^
  --collect-all "flask" ^
  app.py
if errorlevel 1 (
  echo 빌드 실패
  exit /b 1
)

echo.
echo 완료: dist\웹문서전체스케줄러\웹문서전체스케줄러.exe
exit /b 0
