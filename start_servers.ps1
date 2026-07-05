$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend/array-sorter.exe"
$frontendDir = Join-Path $root "frontend"

# Kill existing processes on target ports
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) { Stop-Process -Id $port8080.OwningProcess -Force }
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) { Stop-Process -Id $port5173.OwningProcess -Force }
Start-Sleep 1

# Build and start backend
Set-Location (Join-Path $root "backend")
go build -o array-sorter.exe .
$backendProc = Start-Process -PassThru -NoNewWindow -FilePath $backend -ArgumentList "--addr", ":8080"
Start-Sleep 1

# Start frontend
Set-Location $frontendDir
$frontendProc = Start-Process -PassThru -NoNewWindow -FilePath "npx" -ArgumentList "vite", "--host", "0.0.0.0", "--port", "5173"

Write-Host "Backend :8080 PID $($backendProc.Id)"
Write-Host "Frontend :5173 PID $($frontendProc.Id)"