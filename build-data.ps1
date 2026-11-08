$ErrorActionPreference = 'Stop'
$source = 'C:\Users\Henrique\Downloads'
$out = Join-Path $PSScriptRoot 'dist\data.js'
$files = @{
  campaigns = 'Max-no-Zap-(Nova)-Campanhas-1-de-set-de-2026-8-de-nov-de-2026.csv'
  adsets = 'Max-no-Zap-(Nova)-Conjuntos-*.csv'
  ads = 'Max-no-Zap-(Nova)-An*.csv'
}
$data = @{}
foreach ($kind in $files.Keys) {
  $path = (Get-ChildItem -Path $source -Filter $files[$kind] | Select-Object -First 1).FullName
  $data[$kind] = @(Import-Csv -LiteralPath $path -Encoding UTF8 | ForEach-Object {
    [ordered]@{
      name = if ($kind -eq 'campaigns') { $_.'Nome da campanha' } elseif ($kind -eq 'adsets') { $_.'Nome do conjunto de anúncios' } else { $_.'Nome do anúncio' }
      adset = $_.'Nome do conjunto de anúncios'
      status = if ($kind -eq 'campaigns') { $_.'Veiculação da campanha' } elseif ($kind -eq 'adsets') { $_.'Veiculação do conjunto de anúncios' } else { $_.'Veiculação de anúncio' }
      resultType = $_.'Indicador de resultados'
      results = if ($_.'Resultados') { [double]::Parse($_.'Resultados', [cultureinfo]::InvariantCulture) } else { $null }
      spend = [double]::Parse($_.'Valor gasto (BRL)', [cultureinfo]::InvariantCulture)
      impressions = if ($_.'Impressões') { [int]$_.'Impressões' } else { 0 }
      reach = if ($_.'Alcance') { [int]$_.'Alcance' } else { 0 }
      clicks = if ($_.'Cliques no link') { [int]$_.'Cliques no link' } else { 0 }
    }
  })
}
$data.start = '2026-09-01'
$data.end = '2026-11-08'
$json = ConvertTo-Json -InputObject $data -Depth 8 -Compress
[System.IO.File]::WriteAllText($out, 'window.META_DATA = ' + $json + ';', [System.Text.UTF8Encoding]::new($false))
Write-Output "Wrote $out"
