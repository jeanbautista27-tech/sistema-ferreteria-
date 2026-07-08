$path = 'c:\Users\HP\Documents\BACKUP SISTEMA FERRETERIA\sistema-ferreteria\database\ferreteria_db.sql'
$out  = 'c:\Users\HP\Documents\BACKUP SISTEMA FERRETERIA\sistema-ferreteria\database\ferreteria_db_railway.sql'
$lines = [System.IO.File]::ReadAllLines($path)
$filtered = $lines | Where-Object {
    ($_ -notmatch 'CREATE DATABASE') -and ($_ -notmatch 'USE ferreteria')
}
[System.IO.File]::WriteAllLines($out, $filtered)
Write-Output "Archivo listo: $out"
Write-Output "Total lineas: $($filtered.Count)"
