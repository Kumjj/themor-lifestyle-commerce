@echo off
chcp 65001 > nul
title THEMOR 라이프스타일 커머스 서버 실행기
echo ========================================================
echo   THEMOR 라이프스타일 커머스 서비스를 시작합니다...
echo   쇼핑몰 접속: http://localhost:3001
echo   관리자/API:  http://localhost:3002
echo ========================================================
echo.
npm run dev
pause
