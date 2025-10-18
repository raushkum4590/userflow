@echo off
echo Setting up User Network Application...
echo.

echo Installing frontend dependencies...
call npm install

echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Make sure MongoDB is running
echo 2. Run: npm run dev:full
echo    OR
echo 3. Run: start-dev.bat
echo.
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
pause
