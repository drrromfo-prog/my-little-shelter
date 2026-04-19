param(
  [string]$ProjectName = "my-little-shelter"
)

$ErrorActionPreference = "Stop"

function Invoke-RailwayJson {
  param(
    [string]$Command
  )

  $output = Invoke-Expression $Command
  if (-not $output) {
    return $null
  }

  return $output | ConvertFrom-Json
}

function Test-RailwayLoggedIn {
  try {
    $null = railway whoami 2>$null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
  throw "Railway CLI is not installed."
}

if (-not (Test-RailwayLoggedIn)) {
  throw "Railway CLI is not logged in. Run: railway login"
}

$status = $null
try {
  $status = Invoke-RailwayJson "railway status --json"
} catch {
  $status = $null
}

if (-not $status) {
  Write-Host "No linked Railway project found. Creating one..." -ForegroundColor Cyan
  railway init --name $ProjectName | Out-Null
}

Write-Host "Deploying current project to Railway..." -ForegroundColor Cyan
railway up --detach | Out-Null

$volumeAdded = $false
try {
  Write-Host "Ensuring persistent volume at /app/data..." -ForegroundColor Cyan
  $null = Invoke-RailwayJson "railway volume add -m /app/data --json"
  $volumeAdded = $true
} catch {
  Write-Host "Volume add step was skipped or already configured." -ForegroundColor Yellow
}

$domain = $null
try {
  Write-Host "Generating Railway public domain..." -ForegroundColor Cyan
  $domain = Invoke-RailwayJson "railway domain --json"
} catch {
  Write-Host "Could not generate domain automatically. You can run 'railway domain' later." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Railway deployment flow finished." -ForegroundColor Green

if ($volumeAdded) {
  Write-Host "Volume configured at: /app/data" -ForegroundColor Green
}

if ($domain) {
  Write-Host "Domain info:" -ForegroundColor Green
  $domain | ConvertTo-Json -Depth 10
}
