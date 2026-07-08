$f = 'c:\Webs\Javascript\sistema-ferreteria\datos_base.sql'
$c = [IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
$c = $c.Replace('stock_anterior, stock_nuevo, referencia', 'stock_antes, stock_despues, motivo')
[IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "OK - Fix de inventario_movimientos aplicado"
