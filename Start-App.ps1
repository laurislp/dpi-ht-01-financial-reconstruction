$caseDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$caseNode = (Get-Command node -ErrorAction Stop).Source
try {
    $caseResponse = Invoke-WebRequest -Uri 'http://127.0.0.1:4188/api/state' -TimeoutSec 2
    $caseRunning = $caseResponse.StatusCode -eq 200
} catch { $caseRunning = $false }
if (-not $caseRunning) {
    Start-Process -FilePath $caseNode -ArgumentList 'server.mjs' -WorkingDirectory $caseDirectory -WindowStyle Hidden -RedirectStandardOutput (Join-Path $caseDirectory 'server.log') -RedirectStandardError (Join-Path $caseDirectory 'server-error.log')
}
Start-Process 'http://127.0.0.1:4188'
