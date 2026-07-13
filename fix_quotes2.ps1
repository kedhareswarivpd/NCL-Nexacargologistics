$file = 'frontend\src\app\(customer)\customer\quotes\page.tsx'
$content = Get-Content $file -Raw

# Fix the backtick-n literal in filter lines
$content = $content -replace "form\.origin\.toLowerCase\(\)\) \) : \[\];``n  const filteredDestLocs", "form.origin.toLowerCase())) : [];`r`n  const filteredDestLocs"

# Fix origin dropdown: replace condition and add No city available
$originOld = '{showOriginSuggestions && filteredOriginLocs.length > 0 && ('
$originNew = '{showOriginSuggestions && form.origin.trim().length > 0 && ('
$content = $content.Replace($originOld, $originNew)

# Add No city available to origin dropdown
$originMapOld = '{filteredOriginLocs.map((loc) => ('
$originMapNew = '{filteredOriginLocs.length > 0 ? filteredOriginLocs.map((loc) => ('
$content = $content.Replace($originMapOld, $originMapNew)

# Close the ternary after origin map closing
$originCloseOld = "                  ))}`r`n                </div>`r`n              )}`r`n              {errors.origin"
$originCloseNew = "                  )) : (<div className=""px-3 py-3 text-xs text-on-surface-variant/60 italic"">No city available</div>)}`r`n                </div>`r`n              )}`r`n              {errors.origin"
$content = $content.Replace($originCloseOld, $originCloseNew)

# Fix dest dropdown condition
$destOld = '{showDestSuggestions && filteredDestLocs.length > 0 && ('
$destNew = '{showDestSuggestions && form.destination.trim().length > 0 && ('
$content = $content.Replace($destOld, $destNew)

# Add No city available to dest dropdown
$destMapOld = '{filteredDestLocs.map((loc) => ('
$destMapNew = '{filteredDestLocs.length > 0 ? filteredDestLocs.map((loc) => ('
$content = $content.Replace($destMapOld, $destMapNew)

# Close the ternary after dest map closing
$destCloseOld = "                  ))}`r`n                </div>`r`n              )}`r`n              {errors.destination"
$destCloseNew = "                  )) : (<div className=""px-3 py-3 text-xs text-on-surface-variant/60 italic"">No city available</div>)}`r`n                </div>`r`n              )}`r`n              {errors.destination"
$content = $content.Replace($destCloseOld, $destCloseNew)

Set-Content $file $content
Write-Host "Done"
