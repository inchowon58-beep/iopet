@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "EXE=%~dp0dist\웹문서전체스케줄러\웹문서전체스케줄러.exe"

if exist "%EXE%" (
  echo 웹문서 전체 스케줄러 실행 중...
  start "" "%EXE%"
  exit /b 0
)

echo [안내] 실행파일이 없습니다. 지금 빌드합니다.
call "%~dp0build_exe.bat"
if errorlevel 1 (
  echo 빌드 실패.
  pause
  exit /b 1
)

if exist "%EXE%" (
  start "" "%EXE%"
) else (
  echo exe 경로를 찾지 못했습니다.
  pause
)
exit /b 0
