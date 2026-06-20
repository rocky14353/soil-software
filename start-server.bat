@echo off
echo =======================================
echo  Soil Software - Starting Web Server
echo =======================================
echo.
cd /d "C:\Users\penum\OneDrive\Desktop\Soil Software"
echo Server running at: http://localhost:8000/index.html
echo.
echo DO NOT CLOSE THIS WINDOW while using the website.
echo Press Ctrl+C to stop the server.
echo.
start "" "http://localhost:8000/index.html"
python -m http.server 8000
pause
