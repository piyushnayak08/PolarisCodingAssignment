$targets = @(
    @{ name = "main"; baseUrl = "https://api.practicesoftwaretesting.com" },
    @{ name = "buggy"; baseUrl = "https://api.with-bugs.practicesoftwaretesting.com" }
)
$endpoints = @(
    @{ path = "/status"; method = "GET"; body = $null },
    @{ path = "/products"; method = "GET"; body = $null },
    @{ path = "/products/search?q=Hammer"; method = "GET"; body = $null },
    @{ path = "/products?by_category_slug=pliers"; method = "GET"; body = $null },
    @{ path = "/users/login"; method = "POST"; body = @{ email = "invalid@example.com"; password = "wrong" } }
)
$mainPath = Join-Path $PWD "artifacts\payloads\main"
$buggyPath = Join-Path $PWD "artifacts\payloads\buggy"
if (!(Test-Path $mainPath)) { New-Item -ItemType Directory -Force -Path $mainPath | Out-Null }
if (!(Test-Path $buggyPath)) { New-Item -ItemType Directory -Force -Path $buggyPath | Out-Null }
foreach ($target in $targets) {
    $targetName = $target.name
    $baseUrl = $target.baseUrl
    $currentPath = if ($targetName -eq "main") { $mainPath } else { $buggyPath }
    if ($targetName -eq "buggy") {
        try {
            $test = Invoke-WebRequest -Uri "$baseUrl/status" -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        } catch {
            $baseUrl = "https://api.practicesoftwaretesting.com"
            "Fallback to main URL" | Out-File -FilePath (Join-Path $currentPath "fallback_note.txt")
        }
    }
    foreach ($ep in $endpoints) {
        $url = "$baseUrl$($ep.path)"
        $fn = ($ep.path -replace '[/?=]', '_') + "_" + $ep.method + ".json"
        $res = @{ endpoint = $ep.path; method = $ep.method; statusCode = 0; body = $null }
        try {
            $p = @{ Uri = $url; Method = $ep.method; ContentType = "application/json"; UseBasicParsing = $true; ErrorAction = "Stop" }
            if ($ep.body) { $p.Body = $ep.body | ConvertTo-Json }
            $r = Invoke-WebRequest @p
            $res.statusCode = [int]$r.StatusCode
            $res.body = $r.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($null -eq $res.body) { $res.body = $r.Content }
        } catch {
            if ($_.Exception.Response) {
                $res.statusCode = [int]$_.Exception.Response.StatusCode
                $s = $_.Exception.Response.GetResponseStream()
                $rd = New-Object System.IO.StreamReader($s)
                $b = $rd.ReadToEnd()
                $res.body = $b | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($null -eq $res.body) { $res.body = $b }
            } else { $res.body = "Error: $($_.Exception.Message)" }
        }
        $res | ConvertTo-Json | Out-File -FilePath (Join-Path $currentPath $fn)
    }
}
Get-ChildItem -Path "artifacts\payloads" -Recurse -File | Select-Object -ExpandProperty FullName
