@echo off
echo ====================================
echo  Sistema Ferreteria
echo  Iniciando sistema...
echo ====================================
echo.
echo Iniciando servidor backend en puerto 3001...
start "Servidor Ferreteria" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak > nul
echo Iniciando cliente React en puerto 5173...
start "Cliente Ferreteria" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 5 /nobreak > nul
echo.
echo ====================================
echo  Sistema iniciado!
echo  Backend: http://localhost:3001
echo  Frontend: http://localhost:5173
echo ====================================
start http://localhost:5173
