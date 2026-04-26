$token = "nfp_5FzRV4pTZVyPVt8BPJ289kx7YHtakaWB1f70"
$siteId = "d2e987d6-3ee1-4240-8654-f90810afc94d"
$headers = @{ Authorization = "Bearer $token" }

# 1. List functions
Write-Host "Listing Service functions..."
$functions = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$siteId/service-instances" -Headers $headers
foreach ($f in $functions) {
    Write-Host "Function: $($f.service_slug) - $($f.id)"
}

# 2. List function Logs? Netlify API for logs is weird. usually requires function ID.
# But often we just rely on "deploy" logs.
# Actually, runtime logs are separate.
# check `/sites/{site_id}/functions/{function_id}/logs`? -> No documented API for this?
# It might be `GET /sites/{site_id}/service-instances` logic.

# Let's try to get recent deploy logs again, specifically looking for runtime errors?
# No, deploy logs only cover build.
