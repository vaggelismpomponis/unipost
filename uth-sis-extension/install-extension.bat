@echo off
echo Opening Chrome with extension installation page...
echo.
echo Steps to install the extension:
echo 1. Enable "Developer mode" (toggle in top right)
echo 2. Click "Load unpacked"
echo 3. Select this folder: %CD%
echo 4. The extension should appear in the list
echo.
echo Opening chrome://extensions/...
start chrome "chrome://extensions/"
echo.
echo Extension files in this folder:
dir /b *.json *.html *.js *.svg
echo.
pause 