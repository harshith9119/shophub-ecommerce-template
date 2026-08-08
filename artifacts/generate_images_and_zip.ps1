# Downloads a set of Unsplash images into artifacts/images and creates a ZIP
# Usage: PowerShell -ExecutionPolicy Bypass -File artifacts\generate_images_and_zip.ps1 -count 30
param(
    [int]$count = 30,
    [string]$outDir = "artifacts/images",
    [string]$zipPath = "artifacts/trendywear-images.zip"
)

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

Write-Host "Downloading $count images from Unsplash into $outDir ..."
for ($i = 1; $i -le $count; $i++) {
    $file = Join-Path $outDir ("img_{0}.jpg" -f $i)
    $url = "https://source.unsplash.com/1600x1200/?fashion,clothing,apparel&sig=$i"
    try {
        Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing -ErrorAction Stop
        Write-Host "Downloaded: $file"
    } catch {
        Write-Host ("Failed to download image #{0}: {1}" -f $i, $_.Exception.Message)
    }
}

Write-Host "Creating ZIP: $zipPath"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $outDir '*') -DestinationPath $zipPath -Force
Write-Host "Bundle ready: $zipPath"