@echo off
echo ====================================
echo  Sistema Ferreteria
echo  Instalando dependencias...
echo ====================================
echo.
echo [1/2] Instalando dependencias del SERVIDOR...
cd /d "%~dp0server"
call npm install
echo.
echo [2/2] Instalando dependencias del CLIENTE...
cd /d "%~dp0client"
call npm install
echo.
echo ====================================
echo  Dependencias instaladas correctamente!
echo  Ejecute "2_Configurar_Base_Datos.bat"
echo ====================================
pause
