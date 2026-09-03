@echo off
echo ========================================================
echo        Starting AsifTechGlobal Dynamic Platform
echo ========================================================
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)
echo Launching Server...
start http://localhost:5000
start http://localhost:5000/admin
node server.js
pause
