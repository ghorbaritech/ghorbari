$token = "nfp_5FzRV4pTZVyPVt8BPJ289kx7YHtakaWB1f70"
$deployId = "69a3f6d3edeee500082f369b"
$headers = @{ Authorization = "Bearer $token" }
$logUrl = "https://api.netlify.com/api/v1/deploys/$deployId/log"
Write-Host "Fetching logs from $logUrl"
$logs = Invoke-RestMethod -Uri $logUrl -Headers $headers
$logs | Out-File -FilePath "build_log.txt"
Write-Host "Logs saved to build_log.txt"
