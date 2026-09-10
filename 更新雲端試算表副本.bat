@echo off
chcp 65001 >nul
title 天泰營造 - 公司官版雲端試算表自動同步系統
cd /d "%~dp0"

echo.
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [系統提示] 尚未偵測到 Node.js 執行環境，請先安裝 Node.js。
    echo.
    pause
    exit /b 1
)

node scripts/sync_cloud_sheets.js

if %errorlevel% equ 0 (
    echo 請按任意鍵在檔案總管中開啟「雲端試算表副本」目錄 (或直接關閉此視窗)...
    pause >nul
    start "" "%~dp0雲端試算表副本"
) else (
    echo.
    echo 請確認網路連線正常後重新執行此程式。
    pause
)
