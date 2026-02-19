$token = "nfp_5FzRV4pTZVyPVt8BPJ289kx7YHtakaWB1f70"
$siteId = "d2e987d6-3ee1-4240-8654-f90810afc94d"
$headers = @{ Authorization = "Bearer $token" }

# Get all recent deploys
$deploys = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$siteId/deploys?per_page=1" -Headers $headers
$latest = $deploys[0]

Write-Host "=== Latest deploy details ==="
Write-Host "ID: $($latest.id)"
Write-Host "Error: $($latest.error_message)"
Write-Host "Log access: $($latest.log_access_attributes | ConvertTo-Json)"
Write-Host "Build id: $($latest.build_id)"
