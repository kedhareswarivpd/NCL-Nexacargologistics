$file = 'frontend\src\app\(customer)\customer\quotes\page.tsx'
$content = Get-Content $file -Raw
$content = $content -replace ":\s*\[\];``n\s*const filteredDestLocs", ": [];`r`n  const filteredDestLocs"
Set-Content $file $content
Write-Host "Fixed"
