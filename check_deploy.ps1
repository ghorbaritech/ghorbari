$token = "nfp_5FzRV4pTZVyPVt8BPJ289kx7YHtakaWB1f70"
$siteId = "d2e987d6-3ee1-4240-8654-f90810afc94d"
$headers = @{ Authorization = "Bearer $token" }

$deploys = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$siteId/deploys?per_page=3" -Headers $headers
foreach ($d in $deploys) {
    Write-Host "[$($d.state.ToUpper().PadRight(10))] $($d.created_at) - $($d.title)"
}
