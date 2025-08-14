# Path to your flattened XML
$xmlPath = "D:\GitRepos\PRS-AI-Mode\portal\PMPortal\PmApps\flattened-codebase.xml"

# Path where restored project should be created
$restoreRoot = "D:\GitRepos\PRS-AI-Mode\unflatten"

# Load the XML
[xml]$xml = Get-Content $xmlPath

# Loop through each <file> entry
foreach ($file in $xml.files.file) {
    $path = $file.path
    $content = $file.'#cdata-section'

    # Combine restore root with relative path
    $fullPath = Join-Path $restoreRoot $path

    # Create the directory structure
    New-Item -ItemType Directory -Path (Split-Path $fullPath) -Force | Out-Null

    # Write file content
    Set-Content -Path $fullPath -Value $content -Encoding UTF8
}

Write-Host "✅ Project restored to $restoreRoot"
