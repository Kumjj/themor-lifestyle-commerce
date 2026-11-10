@echo off
chcp 65001 > nul
title THEMOR 쇼핑몰 원클릭 설치 마법사
echo ========================================================
echo   THEMOR 라이프스타일 커머스 환경을 구성합니다...
echo ========================================================
echo.

if not exist node_modules (
  echo [1/2] 필수 패키지 설치 중 (npm install)...
  call npm install
  if errorlevel 1 (
    echo npm install 중 오류가 발생했습니다. Node.js 설치 상태를 확인해 주세요.
    pause
    exit /b 1
  )
) else (
  echo [1/2] 패키지가 이미 설치되어 있습니다.
)

echo [2/2] MySQL 스키마(themor_20602) 이식 및 환경 설정을 진행합니다...
node scripts/setup-wizard.mjs %*

pause
