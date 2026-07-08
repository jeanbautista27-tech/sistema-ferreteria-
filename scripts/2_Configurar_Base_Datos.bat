@echo off
echo ====================================
echo  Sistema Ferreteria
echo  Configurando Base de Datos...
echo ====================================
echo.
echo Importando base de datos ferreteria_db...
mysql -u root -e "source %~dp0ferreteria_db.sql"
if %ERRORLEVEL% == 0 (
    echo.
    echo  Base de datos creada correctamente!
    echo  Usuario admin: admin@ferreteria.com
    echo  Contrasena: admin123
) else (
    echo.
    echo  Error al importar. Verifica que MySQL este corriendo.
    echo  Intenta manualmente: mysql -u root ^< ferreteria_db.sql
)
echo.
echo ====================================
pause
