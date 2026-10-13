$ErrorActionPreference = 'Stop'
$docxPath = 'F:\Projects\all the comm\deliverables\planning-2026-10-12\올더커뮤니케이션_자료분석_홈페이지기획서_2026-10-12.docx'
$renderDirectory = 'F:\Projects\all the comm\planning\2026-10-12\render-tree-qa'
New-Item -ItemType Directory -Path $renderDirectory -Force | Out-Null
$pdfPath = Join-Path $renderDirectory 'plan.pdf'
$wordInstance = $null
$wordDocument = $null
try {
    $wordInstance = New-Object -ComObject Word.Application
    $wordInstance.Visible = $false
    $wordInstance.DisplayAlerts = 0
    $wordInstance.AutomationSecurity = 3
    $wordDocument = $wordInstance.Documents.Open($docxPath, $false, $true, $false)
    $wordDocument.Repaginate()
    $pageCount = $wordDocument.ComputeStatistics(2)
    $wordDocument.ExportAsFixedFormat($pdfPath, 17)
    Write-Output "Word rendered $pageCount pages."
} finally {
    if ($null -ne $wordDocument) { $wordDocument.Close(0); [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($wordDocument) }
    if ($null -ne $wordInstance) {
        if ($wordInstance.Documents.Count -eq 0) { $wordInstance.Quit() }
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($wordInstance)
    }
}
& 'C:\Users\home\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe' -r 130 -png $pdfPath (Join-Path $renderDirectory 'page')
