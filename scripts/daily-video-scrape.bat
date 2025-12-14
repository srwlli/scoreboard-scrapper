@echo off
REM Daily Video Scraper - Run this via Windows Task Scheduler
REM Scrapes YouTube for NFL game highlights
REM Safe limit: 85 games/day (uses ~8,585 of 10,000 daily quota)

cd /d C:\Users\willh\Desktop\scrapper

echo ============================================
echo NFL Daily Video Scraper
echo %date% %time%
echo ============================================

REM Scrape 2025 season first (current season)
echo Scraping 2025 season...
call npx tsx scripts/scrape-videos.ts --season 2025 --limit 85

REM If 2025 is caught up, also backfill 2024
echo.
echo Checking 2024 backfill...
call npx tsx scripts/scrape-videos.ts --season 2024 --limit 85

echo.
echo ============================================
echo Scraping complete!
echo ============================================
pause
