$htmlPath = "c:\Users\unnik\Desktop\Srishti\Srishti Projects\DormEase\scratch\DormEase_Abstract.html"
$docxPath = "c:\Users\unnik\Desktop\Srishti\Srishti Projects\DormEase\DormEase_Abstract.docx"

# Remove existing DOCX if it exists
if (Test-Path $docxPath) { Remove-Item $docxPath }

$word = New-Object -ComObject Word.Application
$word.Visible = $false

# 0 is the default missing value for COM
$missing = [System.Reflection.Missing]::Value

# Open HTML file
$doc = $word.Documents.Open($htmlPath)

# WdSaveFormat.wdFormatDocumentDefault = 16 (Docx)
$doc.SaveAs([ref]$docxPath, [ref]16)
$doc.Close()
$word.Quit()

Write-Host "DOCX file generated successfully at $docxPath"
